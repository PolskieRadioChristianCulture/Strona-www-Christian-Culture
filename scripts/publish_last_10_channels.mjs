import { chromium } from 'playwright';
import fs from 'node:fs';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_cc.jpg';
const LOG_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\last_10_log.json';

const TARGETS = [
  { name: 'CC Prayer 24',              id: 'UCPDuMcFijIDEjMWf20J_QCQ', title: 'CC Prayer 24 🔴 Modlitwa Na Żywo 24/7' },
  { name: 'Christian Culture Network',  id: 'UCnY5U9TRJa16yCNoY6RtIfg', title: 'Christian Culture Network LIVE 🔴 24/7' },
  { name: 'CC Bible Deep',             id: 'UCMwu-cSUiTnvjS5fLiUPXtg', title: 'CC Bible Deep LIVE 🔴 24/7 | Głębokie Studium Biblii' },
  { name: 'Christian Culture POP',     id: 'UCeba0BVF0NA9yuTcizK_iSA', title: 'Christian Culture POP LIVE 🔴 24/7' },
  { name: 'Worship LIVE CC',           id: 'UC62PrabNO4QTYtpCY282eUw', title: 'Worship LIVE CC 🔴 24/7 | Uwielbienie Na Żywo' },
  { name: 'CC Instrumental',           id: 'UCN8lW1NMAO9dzRDzVQQa3OA', title: 'CC Instrumental LIVE 🔴 24/7 | Christian Culture' },
  { name: 'CC Identity',               id: 'UCvxaulj99hFri5nG0uNLxmw', title: 'CC Identity LIVE 🔴 24/7 | Twoja Duchowa Tożsamość' },
  { name: 'CC FILM',                   id: 'UCWACuxJkDjYKcJ0-gV62UtA', title: 'CC FILM LIVE 🔴 24/7 | Chrześcijańskie Kino' },
  { name: 'CC Nature Sounds',          id: 'UCCs6Cmah9yw4KHnJqC_zR4Q', title: 'CC Nature Sounds LIVE 🔴 24/7 | Dźwięki Natury' },
  { name: 'Personality Plus',          id: 'UCSwb927uMg2PxIl_Aakht0Q', title: 'Personality Plus LIVE 🔴 24/7 | Christian Culture' }
];

async function createBroadcast(page, ch) {
  console.log(`  → Creating new broadcast via Wizard for ${ch.name}...`);
  const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
  if (!await schedBtn.isVisible().catch(() => false)) {
    console.log('  ⚠️ Zaplanuj button not found');
    return null;
  }
  await schedBtn.click();
  await page.waitForTimeout(3000);

  const createNew = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
  if (await createNew.isVisible().catch(() => false)) {
    await createNew.click();
    await page.waitForTimeout(2000);
  }

  // Tytuł
  const titleBox = page.locator('ytcp-social-suggestions-textbox #textbox, #textbox[aria-label*="tytuł"]').first();
  if (await titleBox.isVisible().catch(() => false)) {
    await titleBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(ch.title, { delay: 15 });
  } else {
    await page.mouse.click(400, 335);
    await page.keyboard.press('Control+A');
    await page.keyboard.type(ch.title, { delay: 15 });
  }
  await page.waitForTimeout(1000);

  // Miniatura
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles(THUMBNAIL_PATH).catch(() => {});
    console.log('  ✓ Thumbnail attached in wizard');
    await page.waitForTimeout(2000);
  }

  // Nieprzeznaczony dla dzieci
  const radios = page.locator('tp-yt-paper-radio-button');
  const count = await radios.count();
  for (let i = 0; i < count; i++) {
    const txt = await radios.nth(i).innerText().catch(() => '');
    if (txt.includes('Nieprzeznaczony')) {
      await radios.nth(i).click({ force: true });
      console.log('  ✓ Not for kids selected');
      break;
    }
  }
  await page.waitForTimeout(1000);

  // Kroki Dalej
  for (let s = 1; s <= 3; s++) {
    const nextBtn = page.locator('#next-button, button:has-text("Dalej"), ytcp-button:has-text("Dalej")').first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }
  }

  // Publiczny
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  if (await pubRadio.isVisible().catch(() => false)) {
    await pubRadio.click({ force: true });
    console.log('  ✓ Publiczny selected');
    await page.waitForTimeout(1000);
  }

  // Gotowe
  const doneBtn = page.locator('#done-button, button:has-text("Gotowe"), ytcp-button:has-text("Gotowe")').first();
  if (await doneBtn.isVisible().catch(() => false)) {
    await doneBtn.click({ force: true });
    console.log('  ✓ Gotowe clicked');
    await page.waitForTimeout(7000);
  }

  // Zamknij ewentualny modal udostępniania
  const closeBtn = page.locator('#close-button, ytcp-button:has-text("Zamknij")').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click({ force: true });
    await page.waitForTimeout(2000);
  }

  // Odśwież i pobierz link
  await page.goto(`https://studio.youtube.com/channel/${ch.id}/livestreaming/manage?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  const link = page.locator('a[href*="/livestreaming"]').first();
  if (await link.count() > 0) {
    const href = await link.getAttribute('href').catch(() => '');
    const match = href.match(/\/video\/([a-zA-Z0-9_-]+)\/livestreaming/);
    if (match) {
      console.log(`  ✓ Extracted Video ID: ${match[1]}`);
      return match[1];
    }
  }

  return null;
}

async function findOrGetVideoId(page, ch) {
  await page.goto(`https://studio.youtube.com/channel/${ch.id}/livestreaming/manage?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  const links = await page.locator('a[href*="/livestreaming"]').all();
  for (const l of links) {
    const href = await l.getAttribute('href').catch(() => '');
    const match = href.match(/\/video\/([a-zA-Z0-9_-]+)\/livestreaming/);
    if (match) {
      console.log(`  ✓ Found existing stream videoId: ${match[1]}`);
      return match[1];
    }
  }

  return await createBroadcast(page, ch);
}

async function startStreamAndPublish(page, ch, videoId) {
  console.log(`  → Starting room for videoId: ${videoId}...`);
  await page.goto(`https://studio.youtube.com/video/${videoId}/livestreaming`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('  → Waiting 12s for stream signal from OBS...');
  await page.waitForTimeout(12000);

  // Kliknij Transmituj na żywo
  const startBtn = page.locator('#start-stream-button, button:has-text("Transmituj na żywo")').first();
  if (await startBtn.isVisible().catch(() => false)) {
    const isEnabled = await startBtn.isEnabled().catch(() => false);
    if (isEnabled) {
      console.log('  → Clicking Transmituj na żywo...');
      await startBtn.click();
      await page.waitForTimeout(2500);
      const confirmBtn = page.locator('ytcp-button:has-text("Transmituj na żywo"), ytcp-button:has-text("Rozpocznij"), #confirm-button').first();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        console.log('  🟢 Confirmed Go Live!');
        await page.waitForTimeout(5000);
      }
    }
  }

  // Przejdź do edycji wideo
  console.log('  → Entering edit page to ensure Public & Thumbnail...');
  await page.goto(`https://studio.youtube.com/video/${videoId}/edit`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Wgraj miniaturę
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles(THUMBNAIL_PATH).catch(() => {});
    console.log('  ✓ Thumbnail uploaded in edit');
    await page.waitForTimeout(2000);
  }

  // Zmień widoczność na PUBLICZNY jeśli Niepubliczny
  const niepubText = page.locator('text="Niepubliczny"').first();
  const box = await niepubText.boundingBox().catch(() => null);
  if (box) {
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(1500);

    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
    if (await pubRadio.isVisible().catch(() => false)) {
      await pubRadio.click();
      console.log('  ✓ Publiczny radio clicked');
      await page.waitForTimeout(1000);

      const doneBtn = page.locator('ytcp-button#done-button, ytcp-button:has-text("Gotowe")').first();
      if (await doneBtn.isVisible().catch(() => false)) {
        await doneBtn.click();
        console.log('  ✓ Gotowe clicked');
        await page.waitForTimeout(1000);
      }
    }
  }

  // Zapisz zmiany
  const saveBtn = page.locator('ytcp-button#save, #save-button, ytcp-button:has-text("Zapisz")').first();
  if (await saveBtn.isVisible().catch(() => false) && await saveBtn.isEnabled().catch(() => false)) {
    await saveBtn.click();
    console.log('  ✓ Saved public changes!');
    await page.waitForTimeout(5000);
  }

  return true;
}

async function main() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    viewport: { width: 1400, height: 900 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const results = [];

  for (const ch of TARGETS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📺 PROCESSING: ${ch.name}`);
    console.log('='.repeat(60));

    // Tworzymy świeżą stronę dla każdego kanału i zamykamy po zakończeniu, by uniknąć wycieków
    const page = await browser.newPage();
    page.on('dialog', async d => {
      console.log('Auto-accepting dialog:', d.message());
      await d.accept().catch(() => {});
    });

    try {
      const videoId = await findOrGetVideoId(page, ch);
      if (videoId) {
        await startStreamAndPublish(page, ch, videoId);
        results.push({ name: ch.name, videoId, status: '🟢 LIVE' });
      } else {
        console.log(`  ❌ Could not obtain video ID for ${ch.name}`);
        results.push({ name: ch.name, status: '❌ NO VIDEO ID' });
      }
    } catch (e) {
      console.error(`  ❌ Error processing ${ch.name}:`, e.message);
      results.push({ name: ch.name, status: `❌ ERROR: ${e.message}` });
    } finally {
      await page.close().catch(() => {});
    }

    // Krótka przerwa między kanałami
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();

  console.log('\n\n========== PODSUMOWANIE 10 KANAŁÓW ==========');
  for (const r of results) {
    console.log(`${r.status.padEnd(12)} | ${r.name.padEnd(30)} | ${r.videoId || ''}`);
  }

  fs.writeFileSync(LOG_PATH, JSON.stringify(results, null, 2), 'utf8');
}

main().catch(console.error);
