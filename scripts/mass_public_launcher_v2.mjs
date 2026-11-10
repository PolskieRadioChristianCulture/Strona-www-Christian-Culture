/**
 * MASS PUBLIC LAUNCHER v2 — dla wszystkich kanałów CC
 * Strategia: wchodzi przez @osobowośćPLUS (właściciel konta), otwiera Studio
 * każdego kanału, naprawia widoczność na PUBLIC, klika Go Live.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_cc.jpg';
const LOG_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\launch_log_v2.json';

// Kanały własnościowe (dostępne przez przełącznik z konta @osobowośćPLUS)
// Pomijamy te 7 które są już LIVE (zweryfikowane)
const CHANNELS = [
  { name: 'Robert Łukasz Pio',       id: 'UC34DD8FTh_y2GhZhg3qBaIQ', switcher: 'Robert Łukasz Pio',       title: 'Robert Łukasz Pio • W Obecności LIVE 🔴 24/7' },
  { name: 'Katarzyna Fedków',         id: 'UCnipJdX6mtsxaoEENzEVusA', switcher: 'Katarzyna Fedków',         title: 'Katarzyna Fedków LIVE 🔴 | Polska Muzyka Chrześcijańska' },
  { name: 'Top Seven',               id: 'UCdo_1-cjf5TEjSfEG_rxmyw', switcher: 'Top Seven',               title: 'Top Seven LIVE 🔴 24/7 | Christian Culture' },
  { name: 'RCC TV 24',               id: 'UCgzGpVUtw4T-9GcwygPeyfw', switcher: 'RCC TV 24',               title: 'RCC TV 24 LIVE 🔴 24/7', viaPersonalito: true },
  { name: 'CC Prayer 24',            id: 'UCPDuMcFijIDEjMWf20J_QCQ', switcher: 'CC Prayer 24',            title: 'CC Prayer 24 🔴 Modlitwa Na Żywo 24/7' },
  { name: 'Christian Culture Network',id: 'UCnY5U9TRJa16yCNoY6RtIfg', switcher: 'Christian Culture Network',title: 'Christian Culture Network LIVE 🔴 24/7' },
  { name: 'CC Bible Deep',           id: 'UCMwu-cSUiTnvjS5fLiUPXtg', switcher: 'CC Bible Deep',           title: 'CC Bible Deep LIVE 🔴 24/7 | Głębokie Studium Biblii' },
  { name: 'Christian Culture POP',   id: 'UCeba0BVF0NA9yuTcizK_iSA', switcher: 'Christian Culture POP',   title: 'Christian Culture POP LIVE 🔴 24/7' },
  { name: 'Popraw Koronę',           id: 'UCquRtlfo1jrhZGO8LqFVllQ', switcher: 'Popraw Koronę',           title: 'Popraw Koronę LIVE 🔴 24/7 | Christian Culture', alreadyCreated: true, videoId: 'rggnFJ6T32A' },
  { name: 'Worship LIVE CC',         id: 'UC62PrabNO4QTYtpCY282eUw', switcher: 'Worship LIVE CC',         title: 'Worship LIVE CC 🔴 24/7 | Uwielbienie Na Żywo' },
  { name: 'CC Instrumental',         id: 'UCN8lW1NMAO9dzRDzVQQa3OA', switcher: 'Christian Culture Instrumental', title: 'CC Instrumental LIVE 🔴 24/7 | Christian Culture' },
  { name: 'CC Identity',             id: 'UCvxaulj99hFri5nG0uNLxmw', switcher: 'CC Identity',             title: 'CC Identity LIVE 🔴 24/7 | Twoja Duchowa Tożsamość' },
  { name: 'CC FILM',                 id: 'UCWACuxJkDjYKcJ0-gV62UtA', switcher: 'CC FILM',                 title: 'CC FILM LIVE 🔴 24/7 | Chrześcijańskie Kino' },
  { name: 'CC Nature Sounds',        id: 'UCCs6Cmah9yw4KHnJqC_zR4Q', switcher: 'CC Nature Sounds',        title: 'CC Nature Sounds LIVE 🔴 24/7 | Dźwięki Natury' },
  { name: 'Personality Plus',        id: 'UCSwb927uMg2PxIl_Aakht0Q', switcher: 'Personality Plus',        title: 'Personality Plus LIVE 🔴 24/7 | Christian Culture' },
  // Nowe kanały odkryte w switcher (do aktywacji)
  { name: 'CC Women',                id: 'UC-LPFt-vmJCeap746DOWMgw', switcher: 'CC Women',                title: '|| Wiadomości na żywo | Polskie Radio Christian Culture TV', alreadyCreated: true, skipCreate: true, fixPublic: true },
];

async function switchToOsobowosc(page) {
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const item = page.locator('ytd-account-item-renderer').filter({ hasText: 'Osobowość +' }).first();
  if (await item.isVisible()) {
    await item.click();
    await page.waitForTimeout(5000);
    console.log('  ✓ Switched to Osobowość +');
  }
}

async function openChannelManage(page, channelId) {
  await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/manage?approve_browser_access=true`,
    { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  // Pass browser gate if needed
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    await gate.click();
    await page.waitForTimeout(4000);
  }
}

async function createBroadcast(page, ch) {
  console.log(`  → Creating new broadcast for ${ch.name}...`);
  const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
  if (!await schedBtn.isVisible().catch(() => false)) {
    console.log('  ⚠️ No Zaplanuj button — checking manage table');
    return false;
  }
  await schedBtn.click();
  await page.waitForTimeout(3000);

  // Create new if dialog shows
  const createNew = page.locator('button:has-text("Utwórz nowe")').first();
  if (await createNew.isVisible().catch(() => false)) {
    await createNew.click();
    await page.waitForTimeout(2000);
  }

  // Fill title
  const titleBox = page.locator('ytcp-social-suggestions-textbox #textbox, #textbox[aria-label*="tytuł"]').first();
  if (await titleBox.isVisible()) {
    await titleBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(ch.title, { delay: 20 });
    await page.waitForTimeout(500);
  } else {
    // Fallback: click on title area
    await page.mouse.click(400, 335);
    await page.waitForTimeout(500);
    await page.keyboard.press('Control+A');
    await page.keyboard.type(ch.title, { delay: 20 });
  }

  // Upload thumbnail
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles(THUMBNAIL_PATH);
    console.log('  ✓ Thumbnail uploaded in wizard');
    await page.waitForTimeout(2000);
  }

  // Select Nieprzeznaczony dla dzieci
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

  // Click Dalej buttons (steps)
  for (let s = 1; s <= 3; s++) {
    const nextBtn = page.locator('#next-button, button:has-text("Dalej"), ytcp-button:has-text("Dalej")').first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click({ force: true });
      console.log(`  → Dalej step ${s}`);
      await page.waitForTimeout(2500);
    }
  }

  // Select Public
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  if (await pubRadio.isVisible().catch(() => false)) {
    await pubRadio.click({ force: true });
    console.log('  ✓ Publiczny selected');
    await page.waitForTimeout(1000);
  }

  // Click Gotowe
  const doneBtn = page.locator('#done-button, button:has-text("Gotowe"), ytcp-button:has-text("Gotowe")').first();
  if (await doneBtn.isVisible().catch(() => false)) {
    await doneBtn.click({ force: true });
    console.log('  ✓ Gotowe clicked');
    await page.waitForTimeout(8000);
  }

  // Close share modal
  const closeShare = page.locator('#close-button, ytcp-button:has-text("Zamknij")').first();
  if (await closeShare.isVisible().catch(() => false)) {
    await closeShare.click({ force: true });
    await page.waitForTimeout(2000);
  }

  return true;
}

async function enterRoomAndGoLive(page, channelId, videoId) {
  // If we have a known videoId, go directly to it
  if (videoId) {
    await page.goto(`https://studio.youtube.com/video/${videoId}/livestreaming`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
  } else {
    // Click title link from manage table
    const rowLink = page.locator('#video-title, [class*="video-title"], a[id="video-title"]').first();
    if (await rowLink.isVisible().catch(() => false)) {
      await rowLink.click({ force: true });
      await page.waitForTimeout(8000);
    } else {
      console.log('  ⚠️  No broadcast row found in manage table');
      return { success: false, url: page.url() };
    }
  }

  const roomUrl = page.url();
  console.log('  → Room URL:', roomUrl);

  // Fix visibility if needed (Edit button)
  const editBtn = page.locator('ytcp-button:has-text("Edytuj")').first();
  if (await editBtn.isVisible().catch(() => false)) {
    console.log('  → Fixing visibility to Public via Edytuj...');
    await editBtn.click();
    await page.waitForTimeout(3000);
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible().catch(() => false)) {
      await pubRadio.click({ force: true });
      await page.waitForTimeout(1000);
    }
    const saveBtn = page.locator('#save-button, button:has-text("Zapisz")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click({ force: true });
      await page.waitForTimeout(5000);
      console.log('  ✓ Saved public visibility');
    }
  }

  // Wait for stream signal
  console.log('  → Waiting 15s for stream signal...');
  await page.waitForTimeout(15000);

  // Go Live
  const goLiveBtn = page.locator('button:has-text("Transmituj na żywo"), ytcp-button:has-text("Transmituj na żywo")').first();
  if (await goLiveBtn.isVisible().catch(() => false)) {
    const isEnabled = await goLiveBtn.isEnabled();
    if (isEnabled) {
      await goLiveBtn.click({ force: true });
      console.log('  🟢 TRANSMITUJ NA ŻYWO clicked!');
      await page.waitForTimeout(5000);
      return { success: true, url: roomUrl };
    } else {
      console.log('  ⚠️ Go Live button disabled (no signal yet)');
      return { success: false, url: roomUrl, reason: 'disabled' };
    }
  }
  console.log('  ⚠️ Go Live button not found');
  return { success: false, url: roomUrl, reason: 'not found' };
}

async function main() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    viewport: { width: 1400, height: 900 },
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-sync',
    ]
  });

  const page = browser.pages()[0] || await browser.newPage();
  const results = [];

  // Start: switch to Osobowość + (owner)
  console.log('\n=== SWITCHING TO OSOBOWOŚĆ + ===');
  await switchToOsobowosc(page);

  for (const ch of CHANNELS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📺 ${ch.name}`);
    console.log('='.repeat(60));

    try {
      if (ch.alreadyCreated && ch.videoId) {
        // Broadcast already exists, go directly to it and fix
        console.log('  → Broadcast already created, entering room...');
        const result = await enterRoomAndGoLive(page, ch.id, ch.videoId);
        results.push({ name: ch.name, status: result.success ? 'LIVE' : `PENDING (${result.reason})`, url: result.url });
      } else if (ch.alreadyCreated && ch.fixPublic) {
        // Need to find and fix visibility
        await openChannelManage(page, ch.id);
        const result = await enterRoomAndGoLive(page, ch.id, null);
        results.push({ name: ch.name, status: result.success ? 'LIVE' : `PENDING (${result.reason})`, url: result.url });
      } else {
        // Create new broadcast
        await openChannelManage(page, ch.id);

        // Check if already has a row
        const rowLink = page.locator('#video-title, [class*="video-title"], a[id="video-title"]').first();
        const hasRow = await rowLink.isVisible({ timeout: 3000 }).catch(() => false);

        if (hasRow) {
          console.log('  → Existing broadcast found, entering room...');
          const result = await enterRoomAndGoLive(page, ch.id, null);
          results.push({ name: ch.name, status: result.success ? 'LIVE' : `PENDING (${result.reason})`, url: result.url });
        } else {
          const created = await createBroadcast(page, ch);
          if (created) {
            const result = await enterRoomAndGoLive(page, ch.id, null);
            results.push({ name: ch.name, status: result.success ? 'LIVE' : `PENDING (${result.reason})`, url: result.url });
          } else {
            results.push({ name: ch.name, status: 'ERROR: could not create broadcast' });
          }
        }
      }
    } catch (err) {
      console.error(`  ❌ ERROR: ${err.message}`);
      results.push({ name: ch.name, status: `ERROR: ${err.message}` });
      // Re-switch to Osobowość + after error
      await switchToOsobowosc(page).catch(() => {});
    }

    await page.waitForTimeout(2000);
  }

  await browser.close();

  console.log('\n\n========== WYNIKI KOŃCOWE ==========');
  for (const r of results) {
    const icon = r.status === 'LIVE' ? '🟢' : (r.status.startsWith('ERROR') ? '❌' : '🟡');
    console.log(`${icon} ${r.name.padEnd(30)} | ${r.status}`);
  }

  fs.writeFileSync(LOG_PATH, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nLog saved: ${LOG_PATH}`);
}

main().catch(console.error);
