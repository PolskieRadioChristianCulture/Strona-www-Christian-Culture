/**
 * ============================================================================
 * APOKALIPSA DZIEŃ PO DNIU — PUBLIKATOR SPOTIFY FOR CREATORS
 * 365 codziennych rozważań z Księgi Apokalipsy (Amazing Facts & nadzieja.fm)
 * Licencja: Creative Commons BY-NC-ND 4.0 PL
 * ============================================================================
 *
 * Użycie:
 *   node scripts/publish_spotify_apokalipsa_dpd.mjs --list-shows
 *   node scripts/publish_spotify_apokalipsa_dpd.mjs --ep 1 --show <SHOW_ID>
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchStudio } from './yt_studio_session.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const DRIVE_ROOT = 'H:\\Mój dysk\\Apokalipsa Dzień po Dniu';
const CATALOG_PATH = path.join(DRIVE_ROOT, 'LICENCJA_I_KATALOG_365.json');
const COVER_PATH = path.join(DRIVE_ROOT, 'cover_spotify_3000x3000.jpg');
const STATE_PATH = path.join(ROOT, 'data', 'apokalipsa_dpd_spotify_state.json');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadState() {
  if (fs.existsSync(STATE_PATH)) {
    try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); } catch {}
  }
  return {
    version: '1.0',
    series: 'Apokalipsa Dzień po Dniu (365 Odcinków)',
    license: 'CC BY-NC-ND 4.0 PL',
    showId: null,
    showName: null,
    episodes: {}
  };
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

async function dismissCookieBanner(page) {
  const acceptBtn = page.locator('#onetrust-accept-btn-handler, button:has-text("Akceptuję"), button:has-text("Accept All")').first();
  if (await acceptBtn.isVisible().catch(() => false)) {
    await acceptBtn.click({ force: true }).catch(() => {});
    await sleep(800);
  }
  await page.evaluate(() => {
    const sdk = document.querySelector('#onetrust-consent-sdk');
    if (sdk) sdk.remove();
  }).catch(() => {});
}

export async function listSpotifyShows({ headless = false } = {}) {
  const { ctx, page } = await launchStudio({ headless });
  try {
    await page.goto('https://creators.spotify.com/home/show/6M2mU6VzRCPCOjWihgO8Aw', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(5000);
    await dismissCookieBanner(page);
    const currentUrl = page.url();
    console.log(`🌐 URL: ${currentUrl}`);
    if (currentUrl.includes('accounts.spotify.com') || currentUrl.includes('login') || currentUrl === 'https://creators.spotify.com/') {
      return { loggedIn: false, url: currentUrl, shows: [] };
    }

    // Spróbuj otworzyć switcher programów jeśli jest
    const switcher = page.locator('button[aria-label*="show" i], button[aria-label*="program" i], [data-testid*="switcher" i], button:has-text("Biblia Audio")').first();
    if (await switcher.isVisible().catch(() => false)) {
      await switcher.click().catch(() => {});
      await sleep(2500);
    }

    const info = await page.evaluate(() => {
      const links = [...document.querySelectorAll('a[href*="/show/"]')].map(a => ({
        href: a.getAttribute('href'),
        text: (a.innerText || '').replace(/\s+/g, ' ').trim()
      }));
      const text = (document.body.innerText || '').slice(0, 2000);
      return { links, text };
    });

    const showIds = new Map();
    const urlMatch = currentUrl.match(/\/show\/([A-Za-z0-9]+)/);
    if (urlMatch) showIds.set(urlMatch[1], { showId: urlMatch[1], source: 'currentUrl' });
    for (const l of info.links) {
      const m = (l.href || '').match(/\/show\/([A-Za-z0-9]+)/);
      if (m && !showIds.has(m[1])) {
        showIds.set(m[1], { showId: m[1], text: l.text, href: l.href });
      }
    }

    return {
      loggedIn: true,
      url: currentUrl,
      shows: [...showIds.values()],
      bodySample: info.text.slice(0, 800)
    };
  } finally {
    await ctx.close();
  }
}

export async function publishApokalipsaEpisodeToSpotify(epNum = 1, { showId = null, headless = false } = {}) {
  const state = loadState();
  const resolvedShowId = showId || state.showId;
  if (!resolvedShowId) {
    throw new Error('Brak showId dla Spotify! Podaj --show <SHOW_ID> lub zapisz showId w data/apokalipsa_dpd_spotify_state.json');
  }

  const epKey = String(epNum);
  if (state.episodes[epKey]?.status === 'ok') {
    console.log(`⏭️  Odcinek ${epNum} jest już opublikowany na Spotify (${state.episodes[epKey].url || 'ok'}) — pomijam.`);
    return state.episodes[epKey];
  }

  const cat = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const ep = cat.episodes.find(e => e.epNum === epNum);
  if (!ep) throw new Error(`Nie znaleziono odcinka #${epNum} w katalogu!`);

  const mp3Path = path.join(DRIVE_ROOT, ep.relativePath);
  if (!fs.existsSync(mp3Path)) throw new Error(`Brak pliku MP3: ${mp3Path}`);
  const mp3SizeMb = (fs.statSync(mp3Path).size / (1024 * 1024)).toFixed(1);

  const cleanTitle = ep.title
    .replace(/^APOKALIPSA Dzień Po Dniu\s*-\s*/i, '')
    .replace(/\s*#\d+$/, '')
    .trim();
  const spotifyTitle = `${ep.nnn}. ${cleanTitle} | Apokalipsa Dzień po Dniu`.slice(0, 200);
  const spotifyDescription = [
    `📖 ${spotifyTitle}`,
    '',
    'Zajrzyj do starożytnej księgi Apokalipsy! Seria 365 krótkich rozważań pomaga wyjaśnić każdy werset z jej 22 rozdziałów. Audiobook obejmuje wszystkie główne tematy i zagadnienia tekstu w możliwie praktyczny sposób.',
    '',
    '📌 Prawa autorskie i licencja:',
    '© 2022 Amazing Facts International. All rights reserved.',
    '© 2025 nadzieja.fm.',
    'Licencja: Creative Commons Uznanie autorstwa – Użycie niekomercyjne – Bez utworów zależnych 4.0 Polska (CC BY-NC-ND 4.0 PL)',
    'https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.pl',
    '',
    '🌐 Ekosystem Christian Culture:',
    '• Radio i Portal: https://polskieradio.cc',
    '• MojaBiblia: https://polskieradio.cc/mojabiblia',
    '• Akademia Biblijna: https://polskieradio.cc/akademia'
  ].join('\n').slice(0, 3950);

  const episodesUrl = `https://creators.spotify.com/pod/show/${resolvedShowId}/episodes`;
  const wizardUrl = `https://creators.spotify.com/pod/show/${resolvedShowId}/episode/wizard`;

  console.log(`\n🎧 [SPOTIFY] Publikuję Odcinek ${ep.nnn}: ${spotifyTitle}`);
  console.log(`   Show ID: ${resolvedShowId} | Plik: ${ep.filename} (${mp3SizeMb} MB)`);

  const { ctx, page } = await launchStudio({ headless });
  try {
    await page.goto(wizardUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(4000);
    await dismissCookieBanner(page);

    if (page.url().includes('accounts.spotify.com') || page.url().includes('login')) {
      throw new Error('Wymagane logowanie do Spotify for Creators w profilu .youtube_browser_profile');
    }

    // 1. Wgraj MP3
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: 'attached', timeout: 30000 });
    await fileInput.setInputFiles(mp3Path);
    console.log(`   📤 Wgrano plik MP3 (${mp3SizeMb} MB)`);
    await sleep(4000);
    await dismissCookieBanner(page);

    // 2. Tytuł
    const titleInput = page
      .locator('input#title-input[name="title"], input[name="title"], input[placeholder*="Nazwij swój odcinek" i], input[placeholder*="title" i]')
      .first();
    await titleInput.waitFor({ state: 'visible', timeout: 30000 });
    await titleInput.fill(spotifyTitle);

    // 3. Opis
    const descEditor = page
      .locator('[contenteditable="true"][name="description"], [contenteditable="true"][role="textbox"], textarea[name="description"]')
      .first();
    await descEditor.waitFor({ state: 'visible', timeout: 30000 });
    await descEditor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.insertText(spotifyDescription);
    await sleep(1500);
    await dismissCookieBanner(page);

    // 4. Dalej
    const nextBtn = page.locator('button[form="details-form"], button[data-encore-id="buttonPrimary"]:has-text("Dalej"), button:has-text("Dalej"), button:has-text("Next")').first();
    if (await nextBtn.isVisible().catch(() => false)) {
      for (let i = 0; i < 90; i++) {
        if (!(await nextBtn.isDisabled().catch(() => false))) break;
        await sleep(2000);
      }
      await dismissCookieBanner(page);
      await nextBtn.click();
      await sleep(4000);
    }

    // 5. Data publikacji: Teraz
    await dismissCookieBanner(page);
    const terazInput = page.locator('input#publish-date-now[name="wizardPublishDateSelection"]').first();
    const terazLabel = page.locator('label[for="publish-date-now"], label:has-text("Teraz"), label:has-text("Now")').first();
    if (await terazLabel.isVisible().catch(() => false)) {
      await terazLabel.click({ force: true }).catch(() => {});
    }
    if (!(await terazInput.isChecked().catch(() => false))) {
      await terazInput.check({ force: true }).catch(() => {});
    }
    await sleep(1500);

    // 6. Opublikuj
    const publishBtn = page
      .locator('button[form="review-form"], button[data-encore-id="buttonPrimary"]:has-text("Opublikuj"), button:has-text("Opublikuj"), button:has-text("Publish")')
      .first();
    for (let i = 0; i < 300; i++) {
      const visible = await publishBtn.isVisible().catch(() => false);
      const disabled = await publishBtn.isDisabled().catch(() => true);
      if (visible && !disabled) break;
      await sleep(2000);
    }
    await dismissCookieBanner(page);
    await publishBtn.click();
    await sleep(7000);

    // 7. Weryfikacja
    await page.goto(episodesUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(4000);
    const firstRowText = await page.locator('tr').nth(1).innerText().catch(() => '');
    if (!firstRowText.includes('Opublikowano') && !firstRowText.includes('Published')) {
      throw new Error(`Weryfikacja po publikacji nie powiodła się. Wiersz: ${firstRowText.replace(/\s+/g, ' ')}`);
    }

    state.showId = resolvedShowId;
    state.episodes[epKey] = {
      status: 'ok',
      epNum,
      title: spotifyTitle,
      publishedAt: new Date().toISOString(),
      url: `https://open.spotify.com/show/${resolvedShowId}`
    };
    saveState(state);
    console.log(`   ✅ Opublikowano na Spotify: ${spotifyTitle}`);
    return state.episodes[epKey];
  } finally {
    await ctx.close();
  }
}

if (process.argv[1] && process.argv[1].includes('publish_spotify_apokalipsa_dpd')) {
  const args = process.argv.slice(2);
  if (args.includes('--list-shows')) {
    listSpotifyShows({ headless: args.includes('--headless') })
      .then(res => {
        console.log(JSON.stringify(res, null, 2));
        process.exit(0);
      })
      .catch(err => {
        console.error('❌ Błąd:', err.message);
        process.exit(1);
      });
  } else {
    let ep = 1;
    let show = null;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--ep' && args[i + 1]) ep = Number(args[++i]);
      if (args[i] === '--show' && args[i + 1]) show = args[++i];
    }
    publishApokalipsaEpisodeToSpotify(ep, { showId: show, headless: args.includes('--headless') })
      .then(() => process.exit(0))
      .catch(err => {
        console.error('❌ Błąd:', err.message);
        process.exit(1);
      });
  }
}
