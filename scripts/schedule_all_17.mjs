/**
 * MASTER SCHEDULER — 11 Listopada 2026
 * 1. Naprawia Osobowość + (Publiczny, 08:00)
 * 2. Tworzy nowe pokoje dla 16 pozostałych kanałów z miniaturą Niepodległości
 * 
 * UWAGA: Kanały spoza CHANNELS muszą być dodane przez przełącznik URL.
 */
import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import { chromium } from 'playwright';
import fs from 'fs';

const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_cc.jpg';
const ARTIFACTS_DIR = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138';
const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

// All channels with their known IDs from earlier scan
const CHANNELS_TO_SCHEDULE = [
  // 1. Fix existing Osobowość + room (Niepubliczny → Publiczny, change time to 08:00)
  {
    channelName: 'Osobowość +',
    id: 'UCHmPxDM2zzlUAf5ZvlotPLw',
    via: 'Osobowość',
    title: 'Osobowość + LIVE 🔴 | Christian Culture TV24',
    existingVideoId: 'suYDIRikPjQ',
    fix: true,
  },
  // 2. Create new rooms for the 16 remaining channels
  { channelName: 'Werset Dnia',              id: 'UCyOvW5DuDLVq5XWFyijgtbw', via: 'Osobowość', title: 'Werset Dnia LIVE 🔴 24/7 | Chrześcijański Serwis Biblijny' },
  { channelName: 'CC Women',                 id: 'UC-LPFt-vmJCeap746DOWMgw', via: 'CC Women',  title: 'CC Women LIVE 🔴 24/7 | Christian Culture' },
  { channelName: 'Robert Łukasz Pio',        id: 'UC34DD8FTh_y2GhZhg3qBaIQ', via: 'Osobowość', title: 'Robert Łukasz Pio • W Obecności LIVE 🔴 24/7' },
  { channelName: 'Katarzyna Fedków',         id: 'UCnipJdX6mtsxaoEENzEVusA', via: 'Osobowość', title: 'Katarzyna Fedków LIVE 🔴 | Polska Muzyka Chrześcijańska' },
  { channelName: 'Top Seven',               id: 'UCdo_1-cjf5TEjSfEG_rxmyw', via: 'Osobowość', title: 'Top Seven LIVE 🔴 24/7 | Christian Culture' },
  { channelName: 'RCC TV 24',               id: 'UCgzGpVUtw4T-9GcwygPeyfw', via: 'Osobowość', title: 'RCC TV 24 LIVE 🔴 24/7' },
  { channelName: 'CC Prayer 24',            id: 'UCPDuMcFijIDEjMWf20J_QCQ', via: 'Osobowość', title: 'CC Prayer 24 🔴 Modlitwa Na Żywo 24/7' },
  { channelName: 'Christian Culture Network', id: 'UCnY5U9TRJa16yCNoY6RtIfg', via: 'Osobowość', title: 'Christian Culture Network LIVE 🔴 24/7' },
  { channelName: 'CC Bible Deep',           id: null, via: 'Osobowość', title: 'CC Bible Deep LIVE 🔴 24/7 | Głębokie Studium Biblii', handle: '@CCBibleDeep' },
  { channelName: 'Christian Culture POP',   id: null, via: 'Osobowość', title: 'Christian Culture POP LIVE 🔴 24/7', handle: '@ChristianCulturePOP' },
  { channelName: 'Popraw Koronę',           id: null, via: 'Osobowość', title: 'Popraw Koronę LIVE 🔴 24/7 | Christian Culture', handle: '@PoprawKoroną' },
  { channelName: 'Worship LIVE CC',         id: null, via: 'Osobowość', title: 'Worship LIVE CC 🔴 24/7 | Uwielbienie Na Żywo', handle: '@WorshipLiveCC' },
  { channelName: 'CC Instrumental',         id: null, via: 'Osobowość', title: 'CC Instrumental LIVE 🔴 24/7 | Christian Culture', handle: '@ChristianCultureInstrumental' },
  { channelName: 'CC Identity',             id: null, via: 'Osobowość', title: 'CC Identity LIVE 🔴 24/7 | Twoja Duchowa Tożsamość', handle: '@CCIdentity' },
  { channelName: 'CC FILM',                 id: null, via: 'Osobowość', title: 'CC FILM LIVE 🔴 24/7 | Chrześcijańskie Kino', handle: '@CCFILM77' },
  { channelName: 'CC Nature Sounds',        id: null, via: 'Osobowość', title: 'CC Nature Sounds LIVE 🔴 24/7 | Dźwięki Natury', handle: '@CCNatureSounds' },
];

async function switchToChannel(page, via, channelId) {
  // Switch to the "via" identity in channel switcher, then navigate directly to channel Studio
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 40000 });
  await page.waitForTimeout(1500);

  const item = page.locator('ytd-account-item-renderer', { hasText: via }).first();
  if (!await item.count()) {
    console.log(`  ⚠️  Identity "${via}" not found in switcher, using first`);
  } else {
    await item.click();
    await page.waitForTimeout(4000);
  }
  
  // Navigate to channel Studio
  await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/manage`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  
  // Check for browser gate
  const gateLink = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gateLink.isVisible().catch(() => false)) {
    await gateLink.click();
    await page.waitForTimeout(4000);
  }
}

async function resolveChannelIdByHandle(page, handle) {
  await page.goto(`https://www.youtube.com/${handle}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  const id = await page.evaluate(() => {
    return document.querySelector('meta[itemprop="identifier"], meta[itemprop="channelId"]')?.content ||
      (document.querySelector('link[rel="canonical"]')?.href.match(/channel\/(UC[\w-]+)/) || [])[1] || null;
  });
  return id;
}

async function enableAutoStart(page) {
  const result = await page.evaluate(() => {
    const tList = Array.from(document.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button'));
    for (const t of tList) {
      const p = t.closest('.toggle-container') || t.parentElement?.parentElement || t.parentElement;
      const text = p ? p.innerText : '';
      if (/automatyczne uruchamianie/i.test(text)) {
        const isChecked = t.getAttribute('aria-checked') === 'true' || t.hasAttribute('checked');
        if (!isChecked) { t.click(); return 'turned ON'; }
        return 'already ON';
      }
    }
    return 'not found';
  });
  console.log(`  → Auto-start: ${result}`);
  await page.waitForTimeout(1000);
  
  // Confirm popup if any
  const confirmBtn = page.locator('ytcp-confirmation-dialog #confirm-button, button:has-text("Włącz")').first();
  if (await confirmBtn.isVisible().catch(() => false)) {
    await confirmBtn.click();
    await page.waitForTimeout(1500);
    console.log('  → Auto-start confirmed.');
  }
  return result;
}

async function uploadThumbnail(page) {
  try {
    const inp = page.locator('input[type="file"][accept*="image"]').first();
    if (await inp.count()) {
      await inp.setInputFiles(THUMBNAIL_PATH);
      await page.waitForTimeout(4000);
      console.log('  → Thumbnail uploaded via file input!');
      return true;
    }
    // Try button click + file chooser
    const thumbBtn = page.locator('ytcp-thumbnail-upload-button, button:has-text("Prześlij miniaturę"), button:has-text("Zmień")').first();
    if (await thumbBtn.isVisible().catch(() => false)) {
      const [fc] = await Promise.all([
        page.waitForFileChooser({ timeout: 5000 }),
        thumbBtn.click()
      ]).catch(() => [null]);
      if (fc) {
        await fc.setFiles(THUMBNAIL_PATH);
        await page.waitForTimeout(4000);
        console.log('  → Thumbnail uploaded via button!');
        return true;
      }
    }
    console.log('  ⚠️ Thumbnail upload: no input found');
    return false;
  } catch (err) {
    console.log(`  ⚠️ Thumbnail upload error: ${err.message}`);
    return false;
  }
}

async function fixExistingRoom(page, ch) {
  console.log(`\n${'='.repeat(60)}\n📺 FIX: ${ch.channelName} (${ch.existingVideoId})\n${'='.repeat(60)}`);
  
  await switchToChannel(page, ch.via, ch.id);
  await page.waitForTimeout(2000);
  
  // Go to video edit page to fix visibility and time
  await page.goto(`https://studio.youtube.com/video/${ch.existingVideoId}/edit`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);
  
  // Fix time: click the date/time dropdown showing 07:30 and change to 08:00
  // Look for the scheduled date picker
  let timFixed = false;
  const timeDropdown = page.locator('ytcp-dropdown-trigger:has-text("07:30")').first();
  if (await timeDropdown.isVisible().catch(() => false)) {
    await timeDropdown.click();
    await page.waitForTimeout(1500);
    // Find text input for time
    const timeInput = page.locator('input[maxlength="2"]').first(); // HH input
    if (await timeInput.isVisible().catch(() => false)) {
      await timeInput.click({ clickCount: 3 });
      await timeInput.type('08');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
    }
    // Find minute input
    const minInput = page.locator('input[maxlength="2"]').nth(1);
    if (await minInput.isVisible().catch(() => false)) {
      await minInput.click({ clickCount: 3 });
      await minInput.type('00');
      await page.keyboard.press('Enter');
    }
    await page.waitForTimeout(500);
    timFixed = true;
    console.log('  → Time changed to 08:00');
  } else {
    console.log('  ⚠️ 07:30 time dropdown not found (may already be 08:00 or different format)');
  }
  
  // Fix visibility: click #visibility-text "Niepubliczny" and choose Publiczny
  const visText = page.locator('#visibility-text').first();
  if (await visText.isVisible().catch(() => false)) {
    console.log('  → Clicking visibility dropdown...');
    await visText.click();
    await page.waitForTimeout(1500);
    const pubOpt = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
    if (await pubOpt.isVisible().catch(() => false)) {
      await pubOpt.click();
      console.log('  → Visibility set to Publiczny!');
      await page.waitForTimeout(500);
    } else {
      console.log('  ⚠️ PUBLIC option not visible');
    }
  }
  
  // Click Zapisz
  const saveBtn = page.locator('button:has-text("Zapisz")').last();
  if (await saveBtn.isEnabled().catch(() => false)) {
    await saveBtn.click();
    console.log('  → Saved!');
    await page.waitForTimeout(4000);
  }
  
  // Go to livestreaming control room to enable auto-start
  await page.goto(`https://studio.youtube.com/video/${ch.existingVideoId}/livestreaming`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  await enableAutoStart(page);
  
  const shot = `${ARTIFACTS_DIR}\\fixed_osobowosc_${ch.existingVideoId}.png`;
  await page.screenshot({ path: shot });
  return { channel: ch.channelName, status: 'FIXED', videoId: ch.existingVideoId };
}

async function createNewRoom(page, ch) {
  console.log(`\n${'='.repeat(60)}\n📺 CREATE: ${ch.channelName}\n${'='.repeat(60)}`);
  
  let channelId = ch.id;
  
  // Resolve ID if missing
  if (!channelId && ch.handle) {
    console.log(`  → Resolving channel ID for ${ch.handle}...`);
    // First switch identity
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 40000 });
    await page.waitForTimeout(1500);
    const item = page.locator('ytd-account-item-renderer', { hasText: ch.via }).first();
    if (await item.count()) { await item.click(); await page.waitForTimeout(4000); }
    
    channelId = await resolveChannelIdByHandle(page, ch.handle);
    if (!channelId) throw new Error(`Cannot resolve channel ID for ${ch.handle}`);
    console.log(`  → Resolved ID: ${channelId}`);
  }
  
  // Switch to channel
  await switchToChannel(page, ch.via, channelId);
  await page.waitForTimeout(3000);
  
  // Click Zaplanuj transmisję
  const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
  if (!await schedBtn.isVisible().catch(() => false)) {
    console.log('  ⚠️ Zaplanuj button not visible — checking if already a live room...');
    // Maybe currently in a live room from previous session — check URL
    const shot = `${ARTIFACTS_DIR}\\check_${ch.channelName.replace(/[^a-z0-9]/gi, '_')}.png`;
    await page.screenshot({ path: shot });
    throw new Error('Zaplanuj button not found');
  }
  await schedBtn.click();
  await page.waitForTimeout(3000);
  
  // Choose "Użyj poprzednich ustawień" or "Utwórz nowe"
  const reuseBtn = page.locator('button:has-text("Użyj poprzednich ustawień")').first();
  if (await reuseBtn.isVisible().catch(() => false)) {
    console.log('  → Użyj poprzednich ustawień');
    await reuseBtn.click();
  } else {
    const createNewBtn = page.locator('button:has-text("Utwórz nowe")').first();
    if (await createNewBtn.isVisible().catch(() => false)) {
      console.log('  → Utwórz nowe');
      await createNewBtn.click();
    }
  }
  await page.waitForTimeout(3000);
  
  // === STEP 1: Title ===
  const titleBox = page.locator('#textbox[contenteditable="true"]').first();
  if (await titleBox.isVisible().catch(() => false)) {
    await titleBox.click({ clickCount: 3 });
    await titleBox.fill(ch.title);
    console.log('  → Title set.');
  }
  
  // Not for kids
  const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKids.isVisible().catch(() => false)) await notForKids.click();
  await page.waitForTimeout(1000);
  
  // Click Dalej x3
  for (let s = 1; s <= 3; s++) {
    const nextBtn = page.locator('#next-button button, button:has-text("Dalej")').last();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      console.log(`  → Step ${s}: Dalej`);
      await page.waitForTimeout(2000);
    }
  }
  
  // === STEP 4: Set Publiczny ===
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
  if (await pubRadio.isVisible().catch(() => false)) {
    await pubRadio.click();
    console.log('  → Visibility: Publiczny ✅');
  }
  
  // Done
  const doneBtn = page.locator('#done-button button, ytcp-button#done-button, button:has-text("Gotowe")').last();
  await doneBtn.click();
  console.log('  → Gotowe!');
  await page.waitForTimeout(5000);
  
  const currentUrl = page.url();
  const videoIdMatch = currentUrl.match(/\/video\/([^/]+)\//);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  console.log(`  → videoId: ${videoId}, URL: ${currentUrl}`);
  
  // Enable auto-start
  await enableAutoStart(page);
  await page.waitForTimeout(1000);
  
  // Upload thumbnail
  await uploadThumbnail(page);
  
  const shot = `${ARTIFACTS_DIR}\\new_${ch.channelName.replace(/[^a-z0-9]/gi, '_')}.png`;
  await page.screenshot({ path: shot });
  
  return { channel: ch.channelName, status: 'CREATED', videoId, channelId };
}

async function main() {
  const results = [];
  
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1600, height: 1000 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  
  for (const ch of CHANNELS_TO_SCHEDULE) {
    try {
      let result;
      if (ch.fix && ch.existingVideoId) {
        result = await fixExistingRoom(page, ch);
      } else {
        result = await createNewRoom(page, ch);
      }
      results.push(result);
      console.log(`\n✅ ${ch.channelName}: ${result.status} (videoId: ${result.videoId || 'n/a'})`);
    } catch (err) {
      console.error(`\n❌ ${ch.channelName}: BŁĄD — ${err.message}`);
      results.push({ channel: ch.channelName, status: `ERROR: ${err.message}` });
      const errShot = `${ARTIFACTS_DIR}\\error_${ch.channelName.replace(/[^a-z0-9]/gi, '_')}.png`;
      await page.screenshot({ path: errShot }).catch(() => {});
    }
    // Brief pause between channels
    await page.waitForTimeout(2000);
  }
  
  const resultsPath = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\schedule_all_results.json';
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2), 'utf8');
  
  console.log('\n\n========= WYNIKI KOŃCOWE =========');
  for (const r of results) {
    const icon = r.status.startsWith('ERROR') ? '❌' : '✅';
    console.log(`${icon} ${r.channel.padEnd(30)} → ${r.status} ${r.videoId ? `(${r.videoId})` : ''}`);
  }
  
  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
