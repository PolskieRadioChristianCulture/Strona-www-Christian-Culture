import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import {
  validateGbpPost,
  buildTrackedCtaUrl,
  prepareGbpImage4x3,
  pickNextQueuedPost
} from './gbp_policy_guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const require = createRequire(path.join(REPO_ROOT, 'package.json'));
const { chromium } = require('playwright');

export const PROFILE_DIR = 'C:\\Users\\czark\\.gbp_browser_profile';
export const QUEUE_PATH = path.join(REPO_ROOT, 'data', 'gbp_posts_queue.json');
export const STATE_PATH = path.join(REPO_ROOT, 'data', 'gbp_published_state.json');
export const STAGING_DIR = path.join(REPO_ROOT, 'data', 'gbp_staging');
export const SCREENSHOTS_DIR = path.join(REPO_ROOT, 'data', 'gbp_screenshots');

export const CANONICAL_GBP_URL =
  'https://www.google.com/search?q=Polskie+Radio+Christian+Culture+TV&stick=H4sIAAAAAAAA_-NgU1I1qDAxN7QwsExKMzOxTE41MjK1MqgwTTIzN0lMSkpLSkmzsLC0XMSqFJCfU5ydmaoQlJiSma_gnFGUWVySmZin4FyaU1JalKoQEgYAqAZQ2U4AAAA&hl=pl';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function formatDateYmd(date) {
  return date.toISOString().slice(0, 10);
}

async function detectAuthOrChallenge(page) {
  const url = page.url().toLowerCase();
  if (url.includes('accounts.google.com')) {
    return 'LOGIN_REQUIRED';
  }
  const hasCaptcha = await page
    .evaluate(() => {
      const iframes = Array.from(document.querySelectorAll('iframe'));
      const badFrame = iframes.some(
        (f) => /captcha|recaptcha|turnstile|hcaptcha/i.test(f.src || '') && f.offsetParent !== null
      );
      const body = (document.body?.innerText || '').toLowerCase();
      return (
        badFrame ||
        body.includes('unusual traffic') ||
        body.includes('nietypowy ruch') ||
        body.includes('not a robot')
      );
    })
    .catch(() => false);
  if (hasCaptcha) return 'CAPTCHA_REQUIRED';
  return null;
}

async function hasOwnerControls(page) {
  return await page
    .evaluate(() => {
      const txt = (document.body?.innerText || '').toLowerCase();
      return (
        txt.includes('dodaj aktualizację') ||
        txt.includes('add update') ||
        txt.includes('edytuj profil') ||
        txt.includes('edit profile') ||
        txt.includes('dodaj wpis') ||
        txt.includes('twoja firma w google') ||
        txt.includes('utwórz post')
      );
    })
    .catch(() => false);
}

async function launchGbpBrowser() {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1440, height: 960 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-dev-shm-usage']
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.setDefaultTimeout(30000);
  return { ctx, page };
}

/**
 * Faza 2 adapter: oficjalne Google Business Profile API (localPosts v4).
 * Wymaga zatwierdzenia Basic API Access (300 QPM) w Google Cloud i tokena OAuth z zakresem:
 * https://www.googleapis.com/auth/business.manage
 */
export async function publishViaOfficialGbpApi({ accountId, locationId, accessToken, post, publicImageUrl }) {
  if (!accountId || !locationId || !accessToken) {
    throw new Error('GBP API v4 wymaga accountId, locationId oraz accessToken (OAuth business.manage).');
  }
  const trackedUrl = buildTrackedCtaUrl(post.ctaUrl, post.id);
  const actionType = post.postType === 'OFFER' ? 'GET_OFFER' : 'LEARN_MORE';

  const payload = {
    languageCode: 'pl',
    summary: post.summary,
    topicType: post.postType === 'EVENT' ? 'EVENT' : post.postType === 'OFFER' ? 'OFFER' : 'STANDARD',
    callToAction: {
      actionType,
      url: trackedUrl
    },
    media: publicImageUrl
      ? [
          {
            mediaFormat: 'PHOTO',
            sourceUrl: publicImageUrl
          }
        ]
      : undefined
  };

  if (post.postType === 'EVENT' || post.postType === 'OFFER') {
    const start = new Date();
    const end = new Date(start.getTime() + (post.eventDurationDays || 7) * 86400000);
    payload.event = {
      title: post.eventTitle,
      schedule: {
        startDate: { year: start.getFullYear(), month: start.getMonth() + 1, day: start.getDate() },
        endDate: { year: end.getFullYear(), month: end.getMonth() + 1, day: end.getDate() }
      }
    };
  }

  const endpoint = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`GBP API HTTP ${resp.status}: ${body.slice(0, 400)}`);
  }
  return await resp.json();
}

async function runDryRun(queue, state, ignoreCooldown) {
  console.log('=== GBP AUTO-PUBLISHER — DRY RUN ===');
  let validCount = 0;
  for (const p of queue.posts || []) {
    const res = validateGbpPost(p, REPO_ROOT);
    if (!res.valid) {
      console.error(`❌ Błąd walidacji [${p.id}]:`, res.errors.join(' | '));
      process.exitCode = 1;
    } else {
      validCount++;
    }
  }
  console.log(`Walidacja kolejki: ${validCount}/${(queue.posts || []).length} postów zgodnych z polityką Google.`);

  const pick = pickNextQueuedPost(queue, state, new Date(), { ignoreCooldown });
  if (!pick.allowed) {
    console.log(`Status kolejki: ${pick.reason}${pick.nextAllowedAt ? ` (następny termin: ${pick.nextAllowedAt})` : ''}`);
    return;
  }

  const post = pick.post;
  const trackedUrl = buildTrackedCtaUrl(post.ctaUrl, post.id);
  const srcImg = path.resolve(REPO_ROOT, post.imagePath);
  const outImg = path.join(STAGING_DIR, `${post.id}.jpg`);
  const imgResult = prepareGbpImage4x3(srcImg, outImg, { fit: post.imageFit || 'cover' });

  console.log('\n--- Podgląd kolejnego wpisu do publikacji ---');
  console.log(`ID:          ${post.id}`);
  console.log(`Filar/Typ:   ${post.pillar} / ${post.postType}`);
  if (post.eventTitle) console.log(`Tytuł:       ${post.eventTitle}`);
  console.log(`Treść (${post.summary.length} zn.): ${post.summary}`);
  console.log(`Przycisk:    ${post.ctaLabel} -> ${trackedUrl}`);
  console.log(`Grafika 4:3: ${imgResult.outAbsPath} (${Math.round(imgResult.sizeBytes / 1024)} KB)`);
}

async function runLoginMode() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const { ctx, page } = await launchGbpBrowser();
  try {
    await page.goto(CANONICAL_GBP_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);

    if (await hasOwnerControls(page)) {
      const shot = path.join(SCREENSHOTS_DIR, 'session_ready.png');
      await page.screenshot({ path: shot, fullPage: false });
      console.log(`SESSION_ALREADY_READY -> ${shot}`);
      return;
    }

    if (!(await page.url().toLowerCase().includes('accounts.google.com'))) {
      // Jeśli otworzyło się wyszukiwanie jako gość, otwórz logowanie Google z powrotem na panel wizytówki
      const loginUrl = `https://accounts.google.com/AccountChooser?continue=${encodeURIComponent(CANONICAL_GBP_URL)}&Email=${encodeURIComponent('radiochristianculture@gmail.com')}`;
      await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    }

    console.log('WAITING_FOR_USER_LOGIN (radiochristianculture@gmail.com): Zaloguj się w otwartym oknie Chrome do panelu wizytówki „Polskie Radio Christian Culture TV”. Czekam do 10 min...');
    const deadline = Date.now() + 10 * 60 * 1000;
    while (Date.now() < deadline) {
      await sleep(2500);
      if (await hasOwnerControls(page)) {
        await sleep(2000);
        const shot = path.join(SCREENSHOTS_DIR, 'session_ready.png');
        await page.screenshot({ path: shot, fullPage: false });
        console.log(`LOGIN_SAVED -> ${shot}`);
        return;
      }
    }
    throw new Error('Przekroczono limit 10 minut oczekiwania na ręczne logowanie do Google Business Profile.');
  } finally {
    await ctx.close().catch(() => {});
  }
}

async function runCheckSession() {
  const { ctx, page } = await launchGbpBrowser();
  try {
    await page.goto(CANONICAL_GBP_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3500);
    const challenge = await detectAuthOrChallenge(page);
    if (challenge) {
      console.error(`SESSION_STATUS: ${challenge}`);
      process.exitCode = 1;
      return;
    }
    const ok = await hasOwnerControls(page);
    if (!ok) {
      console.error('SESSION_STATUS: OWNER_CONTROLS_NOT_VISIBLE (wymagane --login na radiochristianculture@gmail.com)');
      process.exitCode = 1;
      return;
    }
    console.log('SESSION_STATUS: SESSION_OK (panel właściciela Polskie Radio Christian Culture TV widoczny)');
  } finally {
    await ctx.close().catch(() => {});
  }
}

async function findComposerContext(page, timeoutMs = 12000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      const u = frame.url();
      if (/local\/business\/.*promote\/updates\/add|business\.google\.com/i.test(u)) {
        const hasBox = await frame.locator('textarea').first().isVisible().catch(() => false);
        if (hasBox) return frame;
      }
    }
    await sleep(500);
  }
  throw new Error('Nie znaleziono otwartego modalu edytora wpisu Google (iframe promote/updates/add).');
}

async function runPublishOnce(queue, state, ignoreCooldown) {
  const pick = pickNextQueuedPost(queue, state, new Date(), { ignoreCooldown });
  if (!pick.allowed) {
    console.log(`[SKIP] ${pick.reason}${pick.nextAllowedAt ? ` — następna publikacja możliwa po ${pick.nextAllowedAt}` : ''}`);
    return;
  }

  const post = pick.post;
  const val = validateGbpPost(post, REPO_ROOT);
  if (!val.valid) {
    throw new Error(`Post ${post.id} odrzucony przez bramkę polityki Google: ${val.errors.join(' | ')}`);
  }

  const trackedUrl = buildTrackedCtaUrl(post.ctaUrl, post.id);
  const srcImg = path.resolve(REPO_ROOT, post.imagePath);
  const stagingImg = path.join(STAGING_DIR, `${post.id}.jpg`);
  const { sizeBytes } = prepareGbpImage4x3(srcImg, stagingImg, { fit: post.imageFit || 'cover' });

  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const { ctx, page } = await launchGbpBrowser();
  try {
    await page.goto(CANONICAL_GBP_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);

    const auth = await detectAuthOrChallenge(page);
    if (auth) {
      throw new Error(`${auth} podczas otwierania wizytówki Google. Uruchom najpierw --login.`);
    }
    if (!(await hasOwnerControls(page))) {
      throw new Error('Brak widocznych kontrolek właściciela wizytówki. Wymagane --login na radiochristianculture@gmail.com.');
    }

    const addUpdateBtn = page
      .locator('button')
      .filter({ hasText: /^Dodaj aktualizację$|^Add update$/i })
      .first();
    await addUpdateBtn.waitFor({ state: 'visible', timeout: 15000 });
    await addUpdateBtn.click();

    const ctxFrame = await findComposerContext(page, 12000);

    if (post.postType === 'EVENT') {
      const tab = ctxFrame.locator('button[aria-label="Wydarzenie"], button[aria-label="Event"]').first();
      if (await tab.isVisible().catch(() => false)) await tab.click();
    } else if (post.postType === 'OFFER') {
      const tab = ctxFrame.locator('button[aria-label="Oferta"], button[aria-label="Offer"]').first();
      if (await tab.isVisible().catch(() => false)) await tab.click();
    } else {
      const tab = ctxFrame.locator('button[aria-label="Aktualizacja"], button[aria-label="Update"]').first();
      if (await tab.isVisible().catch(() => false)) await tab.click();
    }
    await sleep(800);

    if (post.postType === 'EVENT' || post.postType === 'OFFER') {
      const titleInp = ctxFrame
        .locator('input[aria-label*="tytuł" i], input[aria-label*="title" i], input[placeholder*="tytuł" i], input[placeholder*="title" i]')
        .first();
      if (await titleInp.isVisible().catch(() => false)) {
        await titleInp.fill(post.eventTitle);
      }

      const start = new Date();
      const end = new Date(start.getTime() + (post.eventDurationDays || 7) * 86400000);
      const startInp = ctxFrame.locator('input[aria-label*="Data rozpoczęcia" i], input[aria-label*="Start date" i]').first();
      const endInp = ctxFrame.locator('input[aria-label*="Data zakończenia" i], input[aria-label*="End date" i]').first();
      if (await startInp.isVisible().catch(() => false)) await startInp.fill(formatDateYmd(start));
      if (await endInp.isVisible().catch(() => false)) await endInp.fill(formatDateYmd(end));
    }

    // Description field
    const descBox = ctxFrame.locator('textarea').first();
    await descBox.waitFor({ state: 'visible', timeout: 15000 });
    await descBox.click();
    await descBox.fill(post.summary);

    // Upload 1200x900 photo
    const fileInp = ctxFrame.locator('input[type="file"]').first();
    await fileInp.waitFor({ state: 'attached', timeout: 10000 });
    await fileInp.setInputFiles(stagingImg);
    await sleep(4000);

    // Add CTA button (2026 Polish GBP composer flow)
    const addLinkToggle = ctxFrame
      .locator('button[aria-label="Dodaj pola linku"], button[aria-label="Add link fields"]')
      .first();
    await addLinkToggle.waitFor({ state: 'visible', timeout: 10000 });
    await addLinkToggle.click();
    await sleep(800);

    const ctaDropdown = ctxFrame.locator('button').filter({ hasText: /^Brak$|^None$/i }).first();
    await ctaDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await ctaDropdown.click();
    await sleep(700);

    const optionRe =
      post.ctaLabel === 'Skorzystaj z oferty'
        ? /Skorzystaj z oferty|Get offer|Więcej informacji|Dowiedz się więcej/i
        : /Więcej informacji|Dowiedz się więcej|Learn more/i;
    const opt = ctxFrame.locator('[role="menuitem"], [role="option"], li').filter({ hasText: optionRe }).first();
    await opt.waitFor({ state: 'visible', timeout: 10000 });
    await opt.click();
    await sleep(700);

    const linkInp = ctxFrame
      .locator(
        'input[type="url"], input[aria-label*="Link" i], input[placeholder*="Link" i], input[type="text"]:visible, input:not([type="file"]):not([type="hidden"]):not([type="checkbox"])'
      )
      .last();
    await linkInp.waitFor({ state: 'visible', timeout: 10000 });
    await linkInp.click();
    await linkInp.fill(trackedUrl);

    await sleep(1200);
    const preShot = path.join(SCREENSHOTS_DIR, `pre_publish_${post.id}.png`);
    await page.screenshot({ path: preShot, fullPage: false });

    const publishBtn = ctxFrame
      .locator('button[type="submit"]:not([disabled]), button:not([disabled])')
      .filter({ hasText: /^Wpis$|^Opublikuj$|^Post$|^Publish$/i })
      .first();
    await publishBtn.waitFor({ state: 'visible', timeout: 10000 });
    await publishBtn.click();

    await sleep(6000);
    const pubShot = path.join(SCREENSHOTS_DIR, `published_${post.id}.png`);
    await page.screenshot({ path: pubShot, fullPage: false });

    const stillOpen = await ctxFrame
      .locator('button[type="submit"]')
      .filter({ hasText: /^Wpis$|^Opublikuj$|^Post$|^Publish$/i })
      .first()
      .isVisible()
      .catch(() => false);
    if (stillOpen) {
      throw new Error(`Modal publikacji nie zamknął się po kliknięciu "Wpis". Sprawdź zrzut ekranu: ${pubShot}`);
    }

    state.lastPublishedAt = new Date().toISOString();
    state.totalPublished = (state.totalPublished || 0) + 1;
    state.publishedIds = Array.isArray(state.publishedIds) ? state.publishedIds : [];
    state.publishedIds.push(post.id);
    state.history = Array.isArray(state.history) ? state.history : [];
    state.history.push({
      id: post.id,
      postType: post.postType,
      pillar: post.pillar,
      ctaUrl: trackedUrl,
      imageBytes: sizeBytes,
      publishedAt: state.lastPublishedAt,
      screenshot: pubShot
    });
    writeJson(STATE_PATH, state);
    console.log(`✅ Opublikowano wpis GBP [${post.id}] -> ${trackedUrl}`);
  } finally {
    await ctx.close().catch(() => {});
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const queue = readJson(QUEUE_PATH, { posts: [] });
  const state = readJson(STATE_PATH, { publishedIds: [], history: [], lastPublishedAt: null, totalPublished: 0 });
  const ignoreCooldown = args.has('--force');

  if (args.has('--login')) {
    await runLoginMode();
    return;
  }
  if (args.has('--check-session')) {
    await runCheckSession();
    return;
  }
  if (args.has('--dry-run')) {
    await runDryRun(queue, state, ignoreCooldown);
    return;
  }
  if (args.has('--once')) {
    await runPublishOnce(queue, state, ignoreCooldown);
    return;
  }

  console.log('Użycie: node scripts/gbp_auto_publisher.mjs [--dry-run | --login | --check-session | --once [--force]]');
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isCli) {
  main().catch((err) => {
    console.error(`[FATAL GBP] ${err.message}`);
    process.exit(1);
  });
}
