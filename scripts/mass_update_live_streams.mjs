import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = path.resolve('scripts/thumbnail_tvw_live.jpg');

const CHANNELS_DATA = JSON.parse(fs.readFileSync('scripts/active_live_streams_scan.json', 'utf8'));

async function main() {
  console.log(`Starting mass update for ${CHANNELS_DATA.length} channels...`);
  console.log(`Using thumbnail: ${THUMBNAIL_PATH}`);

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  let activeHandle = null;

  async function ensureChannel(handle, name) {
    if (activeHandle === handle) return;
    console.log(`  Switching identity to ${name} (${handle})...`);
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
    await page.waitForTimeout(1000);

    let item = page.locator('ytd-account-item-renderer').filter({ hasText: handle }).first();
    if (await item.count() === 0) {
      item = page.locator('ytd-account-item-renderer').filter({ hasText: name }).first();
    }

    if (await item.count() > 0) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => {}),
        item.click()
      ]);
      await page.waitForTimeout(3000);
      activeHandle = handle;
      console.log(`  ✅ Identity switched to ${handle}`);
    } else {
      console.log(`  ⚠️ Could not find channel item for ${name} (${handle})`);
    }
  }

  const results = [];

  for (let i = 0; i < CHANNELS_DATA.length; i++) {
    const ch = CHANNELS_DATA[i];
    console.log(`\n==================================================`);
    console.log(`[${i + 1}/${CHANNELS_DATA.length}] ${ch.name} (${ch.handle}) — vid: ${ch.vid}`);
    console.log(`==================================================`);

    const resItem = { name: ch.name, handle: ch.handle, vid: ch.vid, thumbStatus: 'PENDING', liveStatus: 'PENDING' };

    try {
      await ensureChannel(ch.handle, ch.name);

      // 1. EDIT PAGE: UPLOAD THUMBNAIL
      console.log(`  Navigating to edit page: https://studio.youtube.com/video/${ch.vid}/edit`);
      await page.goto(`https://studio.youtube.com/video/${ch.vid}/edit`, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(3500);

      const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
      if (await gate.isVisible().catch(() => false)) {
        await gate.click();
        await page.waitForTimeout(3500);
      }

      let fileSet = false;
      const fileInputs = page.locator('input[type="file"]');
      const count = await fileInputs.count();

      for (let fi = 0; fi < count; fi++) {
        try {
          await fileInputs.nth(fi).setInputFiles(THUMBNAIL_PATH);
          fileSet = true;
          console.log(`  Set thumbnail via file input #${fi}`);
          break;
        } catch (e) {}
      }

      if (!fileSet) {
        const optBtn = page.locator('ytcp-thumbnails-compact-editor-uploader #options-button, [aria-label*="Opcje"], [aria-label*="Options"]').first();
        if (await optBtn.isVisible().catch(() => false)) {
          await optBtn.click();
          await page.waitForTimeout(1000);
          const changeItem = page.locator('tp-yt-paper-item:has-text("Zmień"), tp-yt-paper-item:has-text("Change")').first();
          if (await changeItem.isVisible().catch(() => false)) {
            const [fileChooser] = await Promise.all([
              page.waitForEvent('filechooser', { timeout: 10000 }),
              changeItem.click()
            ]);
            await fileChooser.setFiles(THUMBNAIL_PATH);
            fileSet = true;
            console.log('  Set thumbnail via options menu file chooser');
          }
        }
      }

      if (fileSet) {
        await page.waitForTimeout(2500);
        const saveBtn = page.locator('#save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
        const isEnabled = await saveBtn.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true').catch(() => false);
        if (isEnabled) {
          await saveBtn.click();
          await page.waitForTimeout(3500);
          console.log(`  ✅ SAVED thumbnail for ${ch.name}`);
          resItem.thumbStatus = 'SUCCESS';
        } else {
          console.log(`  ℹ️ Save button not active (thumbnail may already be set)`);
          resItem.thumbStatus = 'ALREADY_SET_OR_UNCHANGED';
        }
      } else {
        console.log(`  ❌ Could not set thumbnail file input`);
        resItem.thumbStatus = 'FAILED_NO_INPUT';
      }

      // 2. LIVE CONTROL ROOM: CHECK / GO LIVE
      console.log(`  Checking Live Control Room: https://studio.youtube.com/video/${ch.vid}/livestreaming`);
      await page.goto(`https://studio.youtube.com/video/${ch.vid}/livestreaming`, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(4000);

      // Check stream health / status
      const pageText = await page.locator('body').innerText().catch(() => '');
      const isAlreadyLive = pageText.includes('Zakończ transmisję') || pageText.includes('End stream') || pageText.includes('Jesteś na żywo');
      console.log(`  Live room status: isAlreadyLive = ${isAlreadyLive}`);

      if (isAlreadyLive) {
        resItem.liveStatus = 'ALREADY_LIVE';
      } else {
        const goLiveBtn = page.locator('#go-live-button, ytcp-button:has-text("Transmituj na żywo"), button:has-text("Transmituj na żywo")').first();
        const canGoLive = await goLiveBtn.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true' && el.offsetParent !== null).catch(() => false);
        console.log(`  Go Live button enabled: ${canGoLive}`);
        if (canGoLive) {
          await goLiveBtn.click();
          await page.waitForTimeout(4000);
          console.log(`  🚀 Clicked "Transmituj na żywo" for ${ch.name}!`);
          resItem.liveStatus = 'CLICKED_GO_LIVE';
        } else {
          resItem.liveStatus = 'WAITING_SIGNAL_OR_AUTOSTART';
        }
      }

    } catch (err) {
      console.error(`  ❌ Error processing ${ch.name}:`, err.message);
      resItem.error = err.message;
    }

    results.push(resItem);
    fs.writeFileSync('scripts/mass_update_live_results.json', JSON.stringify(results, null, 2), 'utf8');
  }

  await ctx.close();
  console.log('\n\n================ FINAL RESULTS ================');
  for (const r of results) {
    console.log(`${r.name.padEnd(25)} | Thumb: ${r.thumbStatus.padEnd(20)} | Live: ${r.liveStatus}`);
  }
}

main().catch(console.error);
