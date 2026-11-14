/**
 * MASTER LIVE LAUNCHER — Uruchamia transmisje LIVE na wszystkich 22 kanałach CC z nową miniaturą.
 * Przepływ dla każdego kanału:
 *  1. Zamknięcie ewentualnych wiszących procesów chrome.exe blokujących profil
 *  2. Przełączenie konta w channel_switcher (z pamiętaniem bieżącego konta)
 *  3. Otwarcie /livestreaming/manage i utworzenie pokoju LIVE (ignorując stare wczorajsze pokoje)
 *  4. Gwarancja miniatury (thumbnail_cc.jpg) i widoczności PUBLIC przez /video/{vid}/edit (bez wiszących backdropów)
 *  5. Wejście do pokoju /video/{vid}/livestreaming, zamknięcie modala układu, polling aż #go-live-button będzie aktywny i kliknięcie "Transmituj na żywo" + potwierdzenie.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { ALL_CHANNELS, PROFILE_DIR, THUMBNAIL_PATH } from './all_channels_config.mjs';

const RESULTS_LOG = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\launch_log.json';
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';
const LEGACY_VIDEO_IDS = new Set(['D_Sy-I2Gr2Y', 'LXF-yIcnO_g']);

let currentVia = null;

function closeOrphanedProfileChrome() {
  try {
    const ps = `$procs = Get-CimInstance Win32_Process -Filter "name = 'chrome.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*.youtube_live_profile*' }; foreach ($p in $procs) { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue; Write-Output ("Killed orphaned live profile chrome PID " + $p.ProcessId) }`;
    const out = execFileSync('powershell.exe', ['-NoProfile', '-Command', ps], { encoding: 'utf8', stdio: 'pipe' }).trim();
    if (out) console.log(out);
  } catch {
    // Brak wiszących procesów lub brak dostępu — kontynuuj
  }
}

async function bypassStudioGate(page) {
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    await gate.click();
    await page.waitForTimeout(4000);
  }
}

async function ensureAccount(page, via) {
  if (currentVia === via) return;
  console.log(`  → Przełączam konto na ${via}...`);
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1200);
  const target = via.replace('@', '');
  const item = page.locator('ytd-account-item-renderer', { hasText: target }).first();
  if (!await item.count()) throw new Error(`Nie znaleziono konta na liście: ${via}`);
  await item.click();
  await page.waitForTimeout(3500);
  currentVia = via;
}

async function resolveChannelId(page, handle) {
  await page.goto(`https://www.youtube.com/${encodeURI(handle)}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  return page.evaluate(() =>
    document.querySelector('meta[itemprop="identifier"], meta[itemprop="channelId"]')?.content ||
    (document.querySelector('link[rel="canonical"]')?.href.match(/channel\/(UC[\w-]+)/) || [])[1] || null
  );
}

async function findExistingVideoId(page) {
  const links = page.locator('ytcp-video-row a#video-title, [role="row"] a[href*="/video/"]');
  const count = await links.count();
  const found = [];
  for (let i = 0; i < count; i++) {
    const href = await links.nth(i).getAttribute('href').catch(() => '');
    const m = href && href.match(/\/video\/([A-Za-z0-9_-]+)/);
    if (m && !LEGACY_VIDEO_IDS.has(m[1])) {
      found.push(m[1]);
    }
  }
  return found[0] || null;
}

async function createBroadcastWizard(page, ch, channelId) {
  console.log(`  → Tworzę nową transmisję dla "${ch.title}"...`);
  const schedBtn = page.locator('#schedule-stream-button, button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
  await schedBtn.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
  if (!await schedBtn.isVisible().catch(() => false)) {
    throw new Error('Brak przycisku Zaplanuj transmisję na /livestreaming/manage');
  }
  await schedBtn.click();
  await page.waitForTimeout(2500);

  const createNew = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
  if (await createNew.isVisible().catch(() => false)) {
    await createNew.click();
    await page.waitForTimeout(2000);
  }

  // Wpisz tytuł
  const titleInput = page.locator('#title-textarea #textbox, #textbox[contenteditable="true"], [aria-label*="Tytuł"]').first();
  if (await titleInput.isVisible().catch(() => false)) {
    await titleInput.click();
  } else {
    await page.mouse.click(400, 335);
  }
  await page.waitForTimeout(400);
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(ch.title);
  await page.waitForTimeout(800);

  // Wstępny upload miniatury w kreatorze jeśli input jest obecny
  const wizardThumb = page.locator('input[type="file"][accept*="image"], input[type="file"]').first();
  if (await wizardThumb.count()) {
    await wizardThumb.setInputFiles(THUMBNAIL_PATH).catch(() => {});
    await page.waitForTimeout(1500);
  }

  // Nie jest przeznaczone dla dzieci
  const notForKidsExact = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKidsExact.isVisible().catch(() => false)) {
    await notForKidsExact.click();
  } else {
    const notForKidsFallback = page.locator('tp-yt-paper-radio-button:has-text("przeznaczone dla dzieci")').last();
    if (await notForKidsFallback.isVisible().catch(() => false)) await notForKidsFallback.click();
  }
  await page.waitForTimeout(500);

  // Przejdź dokładnie 3 kroki Dalej (bez przedwczesnego break)
  for (let step = 0; step < 3; step++) {
    const nextBtn = page.locator('#next-button, ytcp-button:has-text("Dalej"), button:has-text("Dalej")').first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2500);
    }
  }

  // Zaznacz Publiczny po przejściu kroków Dalej
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  if (await pubRadio.isVisible().catch(() => false)) {
    await pubRadio.click();
    await page.waitForTimeout(1000);
  }

  // Kliknij Gotowe
  const doneBtn = page.locator('#done-button, ytcp-button:has-text("Gotowe"), button:has-text("Gotowe")').first();
  if (await doneBtn.isVisible().catch(() => false)) {
    await doneBtn.click();
  }
  await page.waitForTimeout(7000);

  const m = page.url().match(/\/video\/([A-Za-z0-9_-]+)/);
  if (m && !LEGACY_VIDEO_IDS.has(m[1])) return m[1];

  // Powrót na /manage i pobranie świeżo utworzonego videoId
  await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/manage?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3500);
  await bypassStudioGate(page);
  await page.locator('ytcp-video-row a#video-title').first().waitFor({ timeout: 8000 }).catch(() => {});
  const vid = await findExistingVideoId(page);
  if (!vid) throw new Error('Utworzono transmisję, ale nie udało się odczytać videoId');
  return vid;
}

async function ensureThumbnailAndPublicOnEditPage(page, videoId) {
  console.log(`  → /video/${videoId}/edit: miniatura i widoczność PUBLIC...`);
  await page.goto(`https://studio.youtube.com/video/${videoId}/edit?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  await bypassStudioGate(page);
  await page.locator('input[type="file"], ytcp-video-metadata-visibility').first().waitFor({ timeout: 10000 }).catch(() => {});

  // 1. Upload miniatury
  let fileSet = false;
  const directInput = page.locator('input[type="file"][accept*="image"]').first();
  if (await directInput.count()) {
    await directInput.setInputFiles(THUMBNAIL_PATH);
    fileSet = true;
  } else {
    const optionsBtn = page.locator('#options-button, ytcp-icon-button[aria-label*="Opcje"], [aria-label*="Zmień"]').first();
    if (await optionsBtn.isVisible().catch(() => false)) {
      await optionsBtn.click();
      await page.waitForTimeout(800);
      const changeItem = page.locator('tp-yt-paper-item:has-text("Zmień"), [role="menuitem"]:has-text("Zmień")').first();
      if (await changeItem.isVisible().catch(() => false)) {
        const [fileChooser] = await Promise.all([
          page.waitForEvent('filechooser', { timeout: 10000 }),
          changeItem.click()
        ]);
        await fileChooser.setFiles(THUMBNAIL_PATH);
        fileSet = true;
      }
    }
  }
  if (fileSet) {
    console.log('  🖼️  Miniatura załadowana — czekam na przetworzenie...');
    await page.waitForTimeout(3500);
  } else {
    console.log('  ⚠️  Nie znaleziono inputu miniatury na /edit');
  }

  // 2. Sprawdzenie i wymuszenie widoczności PUBLIC (bez Escape!)
  const visBox = page.locator('ytcp-video-metadata-visibility').first();
  const visText = (await visBox.innerText().catch(() => '')).toLowerCase();
  if (visText.includes('niepublicz') || visText.includes('prywatn') || visText.includes('unlisted') || visText.includes('private') || visText.includes('robocz')) {
    console.log(`  → Zmiana widoczności (${visText.replace(/\s+/g, ' ').trim()}) → PUBLIC...`);
    await visBox.click({ force: true });
    await page.waitForTimeout(1500);
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible().catch(() => false)) {
      await pubRadio.click({ force: true });
      await page.waitForTimeout(1000);
    }
    const dialogClose = page.locator('ytcp-video-visibility-select #done-button, ytcp-video-visibility-edit-popup #save-button, tp-yt-paper-dialog[opened] #done-button, tp-yt-paper-dialog[opened] #save-button, #done-button').first();
    if (await dialogClose.isVisible().catch(() => false)) {
      await dialogClose.click({ force: true });
      await page.waitForTimeout(1000);
    }
    const afterVis = (await visBox.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    console.log(`  → Widoczność po zamknięciu okna: "${afterVis}"`);
  }

  // 3. Zapisz zmiany głównym przyciskiem #save / #save-button (z force: true)
  const saveBtn = page.locator('#save-button, #save, ytcp-button:has-text("Zapisz")').first();
  const saveEnabled = await saveBtn.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true').catch(() => false);
  if (saveEnabled) {
    try {
      await saveBtn.click({ force: true, timeout: 10000 });
      await page.waitForTimeout(4000);
      console.log('  💾 Zapisano zmiany na /edit');
    } catch (err) {
      console.log(`  ⚠️ Nie udało się kliknąć Zapisz (${err.message.split('\n')[0]}) — odrzucam zmiany na /edit`);
      const discardBtn = page.locator('#discard-button, ytcp-button:has-text("Odrzuć zmiany"), button:has-text("Odrzuć")').first();
      if (await discardBtn.isVisible().catch(() => false)) {
        await discardBtn.click({ force: true }).catch(() => {});
        await page.waitForTimeout(1000);
      } else {
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
      }
    }
  } else {
    console.log('  ℹ️  Przycisk Zapisz nieaktywny (brak zmian lub miniatura identyczna)');
  }
}

async function enterRoomAndGoLive(page, ch, videoId) {
  console.log(`  → Pokój LIVE: /video/${videoId}/livestreaming...`);
  await page.goto(`https://studio.youtube.com/video/${videoId}/livestreaming?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  await bypassStudioGate(page);

  // Zamknij ewentualny dialog wyboru układu transmisji
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(800);
  const layoutDialogClose = page.locator('ytls-broadcast-layout-editor-dialog #close-button, ytls-broadcast-layout-editor-dialog button[aria-label*="Zamknij"]').first();
  if (await layoutDialogClose.isVisible().catch(() => false)) {
    await layoutDialogClose.click().catch(() => {});
    await page.waitForTimeout(800);
  }

  // Sprawdź czy już trwa
  const endBtn = page.locator('ytcp-button:has-text("Zakończ transmisję"), button:has-text("Zakończ transmisję")').first();
  const isEndVisible = await endBtn.isVisible().catch(() => false);
  const isEndEnabled = isEndVisible ? await endBtn.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true').catch(() => false) : false;
  if (isEndVisible && isEndEnabled) {
    console.log('  🟢 Pokój już nadaje (widoczny aktywny przycisk Zakończ transmisję)');
    return { status: 'ALREADY_LIVE_IN_ROOM', keySelector: null, health: 'LIVE' };
  }

  let loggedDiag = false;
  let roomHealth = null;
  let keySelectorText = null;

  for (let attempt = 1; attempt <= 18; attempt++) {
    const endNow = await endBtn.isVisible().catch(() => false);
    const endNowEnabled = endNow ? await endBtn.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true').catch(() => false) : false;
    if (endNow && endNowEnabled) {
      console.log('  🟢 Transmisja jest już na żywo!');
      return { status: 'ALREADY_LIVE_IN_ROOM', keySelector: keySelectorText, health: 'LIVE' };
    }

    const goLive = page.locator('#go-live-button, ytls-live-dashboard-header ytcp-button:has-text("Transmituj na żywo"), ytcp-button:has-text("Transmituj na żywo"), button:has-text("Transmituj na żywo")').first();
    const visible = await goLive.isVisible().catch(() => false);
    const enabled = visible ? await goLive.evaluate(el => {
      return !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true' && !el.querySelector('button[disabled]');
    }).catch(() => false) : false;

    if (visible && enabled) {
      console.log(`  → Próba ${attempt}: Przycisk "Transmituj na żywo" aktywny — klikam!`);
      await goLive.click({ force: true });
      await page.waitForTimeout(2000);
      const confirm = page.locator('#confirm-button, ytcp-button:has-text("Rozpocznij"), button:has-text("Rozpocznij")').first();
      if (await confirm.isVisible().catch(() => false)) {
        await confirm.click();
        console.log('  → Kliknięto potwierdzenie "Rozpocznij"');
      }
      await page.waitForTimeout(5000);
      return { status: 'GO_LIVE_CLICKED', keySelector: keySelectorText, health: roomHealth || 'OK' };
    }

    if (attempt === 4 && !loggedDiag) {
      loggedDiag = true;
      const diag = await page.evaluate(() => {
        const bodyText = (document.body.innerText || '').replace(/\n{2,}/g, '\n');
        const hMatch = bodyText.match(/(?:^|\n)(Doskonały|Dobry|Dobra|Słaby|Słaba|Brak danych|Brak sygnału|Oczekiwanie|Przygotowuję[^\n]*)/);
        const keySelMatch = bodyText.match(/Klucz:[^\n]*/);
        const keyDropdownEl = document.querySelector('[aria-label*="Klucz"], ytls-stream-key-picker, tp-yt-paper-dropdown-menu, #stream-key-picker');
        return {
          health: hMatch ? hMatch[1].trim() : 'nieznany',
          keySelector: keySelMatch ? keySelMatch[0].trim() : (keyDropdownEl ? (keyDropdownEl.innerText || '').replace(/\s+/g, ' ').trim() : 'brak')
        };
      }).catch(() => ({ health: '?', keySelector: '?' }));
      roomHealth = diag.health;
      keySelectorText = diag.keySelector;
      console.log(`  ⏳ Próba 4 (~8s): #go-live-button nieaktywny | zdrowie="${roomHealth}" | selektor="${keySelectorText}"`);
    } else if (attempt % 4 === 1) {
      console.log(`  ⏳ Oczekuję na aktywację "Transmituj na żywo" (${attempt}/18)...`);
    }

    await page.waitForTimeout(2000);
  }

  return { status: 'GO_LIVE_DISABLED_TIMEOUT', keySelector: keySelectorText, health: roomHealth };
}

async function processChannel(page, ch) {
  console.log(`\n${'='.repeat(64)}`);
  console.log(`📺 Kanał: ${ch.channelName} (${ch.handle})`);
  console.log(`${'='.repeat(64)}`);

  await ensureAccount(page, ch.via);

  let channelId = ch.id && !ch.id.startsWith('UC_placeholder') ? ch.id : null;
  if (!channelId) {
    console.log(`  → Pobieram channelId dla ${ch.handle}...`);
    channelId = await resolveChannelId(page, ch.handle);
    if (!channelId) throw new Error(`Nie udało się ustalić channelId dla ${ch.handle}`);
    console.log(`  → channelId: ${channelId}`);
  }

  await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/manage?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await bypassStudioGate(page);
  await page.locator('ytcp-video-row a#video-title, #schedule-stream-button, button:has-text("Zaplanuj transmisję")').first().waitFor({ timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1500);

  let videoId = await findExistingVideoId(page);
  if (!videoId) {
    videoId = await createBroadcastWizard(page, ch, channelId);
  } else {
    console.log(`  → Istniejąca transmisja na /manage: ${videoId}`);
  }

  await ensureThumbnailAndPublicOnEditPage(page, videoId);
  const liveRes = await enterRoomAndGoLive(page, ch, videoId);

  return {
    channel: ch.channelName,
    handle: ch.handle,
    channelId,
    videoId,
    status: liveRes.status,
    health: liveRes.health,
    keySelector: liveRes.keySelector
  };
}

async function main() {
  closeOrphanedProfileChrome();

  let ctx = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
        headless: true,
        channel: 'chrome',
        viewport: { width: 1600, height: 1000 },
        userAgent: CHROME_UA,
        args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
      });
      break;
    } catch (err) {
      if (err.message.includes('ProcessSingleton') && attempt < 4) {
        console.log(`[Retry ${attempt}] Profil zajęty, czekam 4s...`);
        await new Promise(r => setTimeout(r, 4000));
        closeOrphanedProfileChrome();
      } else {
        throw err;
      }
    }
  }

  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('dialog', d => d.accept().catch(() => {}));

  const results = [];

  for (const ch of ALL_CHANNELS) {
    try {
      const r = await processChannel(page, ch);
      results.push(r);
      console.log(`✅ ${ch.channelName}: ${r.status} (vid=${r.videoId})`);
    } catch (err) {
      console.error(`❌ ${ch.channelName}: ERROR — ${err.message}`);
      results.push({ channel: ch.channelName, handle: ch.handle, status: `ERROR: ${err.message}` });
    }
    await page.waitForTimeout(1500);
  }

  await ctx.close();

  console.log('\n\n========== PODSUMOWANIE MASTER LIVE LAUNCHER ==========');
  for (const r of results) {
    const icon = r.status.startsWith('ERROR') || r.status.includes('TIMEOUT') ? '❌' : '🟢';
    console.log(`${icon} ${(r.channel || '?').padEnd(28)} | ${r.status.padEnd(24)} | vid=${r.videoId || '-'} | health=${r.health || '-'}`);
  }

  fs.writeFileSync(RESULTS_LOG, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nLog zapisany: ${RESULTS_LOG}`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
