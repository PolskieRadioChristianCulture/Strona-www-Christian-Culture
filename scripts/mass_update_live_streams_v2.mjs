import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = path.resolve('scripts/thumbnail_tvw_live.jpg');

const CHANNELS = [
  { name: 'Christian Culture TV', handle: '@ChristianCultureTV', vid: 'KdOBA_zRU0c' },
  { name: 'Popraw Koronę', handle: '@PoprawKoronęCC', vid: '9H_xc4mdUro' },
  { name: 'CC Women', handle: '@CCWomen7', vid: 'QoIgzHsu_Hg' },
  { name: 'Polskie Radio CC', handle: '@RadioChristianCulture', vid: 'RxyWYOGWZ6c' },
  { name: 'Biblia Audio CC', handle: '@bibliaaudiocc', vid: 'LLO4p4XNJoY' },
  { name: 'CC Men', handle: '@CCMen7', vid: 'hkct4gOpx-0' },
  { name: 'Osobowość +', handle: '@osobowoscPLUS', vid: 'n6IfxzwXBXU' },
  { name: 'Werset Dnia', handle: '@wersetdnia_ChSB', vid: 'bt8m8st5GOE' },
  { name: 'Robert Łukasz Pio', handle: '@RobertŁukaszPio', vid: 'PVs7mdhxFOw' },
  { name: 'Katarzyna Fedków', handle: '@katarzynafedkow', vid: 'oF9U8da3bFY' },
  { name: 'Top Seven', handle: '@TopSeven_CC', vid: 'tIF2WJl9G1c' },
  { name: 'RCC TV 24', handle: '@ToDlaCiebieGramy', vid: 'F1VQfwovam0' },
  { name: 'CC Prayer 24', handle: '@CCPrayer24', vid: 'HubSEjZ49NU' },
  { name: 'Christian Culture Network', handle: '@ChristianCultureNetwork', vid: 'Vo-1mj5sxDM' },
  { name: 'CC Bible Deep', handle: '@CCBibleDeep', vid: 'qrsThGjnqDg' },
  { name: 'Christian Culture POP', handle: '@ChristianCulturePOP', vid: 'KsPzBrFs7j8' },
  { name: 'Worship LIVE CC', handle: '@WorshipLiveCC', vid: 'G5Y-TTyInqA' },
  { name: 'CC Instrumental', handle: '@ChristianCultureInstrumental', vid: 'JhzMGo11zhA' },
  { name: 'CC Identity', handle: '@CCIdentityTwojaDuchowaTożsamoś', vid: '2nSknaf1X40' },
  { name: 'CC FILM', handle: '@CCFILM77', vid: 'QqhAmVOPRSU' },
  { name: 'CC Nature Sounds', handle: '@CCNatureSounds', vid: 'hTzZNyXUN3M' },
  { name: 'Personality Plus', handle: '@PersonalityPlusCC', vid: '8k-R9Z2CPBA' }
];

async function main() {
  console.log(`=== STARTING MASS THUMBNAIL & GO LIVE UPDATE (${CHANNELS.length} channels) ===`);
  console.log(`Thumbnail file: ${THUMBNAIL_PATH}`);

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

    const items = await page.locator('ytd-account-item-renderer').all();
    let clicked = false;
    for (const it of items) {
      const text = await it.innerText().catch(() => '');
      if (text.includes(handle) || (name && text.toLowerCase().includes(name.toLowerCase()))) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => {}),
          it.click()
        ]);
        await page.waitForTimeout(2500);
        activeHandle = handle;
        clicked = true;
        console.log(`  ✅ Switched to ${handle} (${name})`);
        break;
      }
    }
    if (!clicked) {
      console.log(`  ⚠️ Could not find channel item for ${name} (${handle})`);
    }
  }

  const results = [];

  for (let i = 0; i < CHANNELS.length; i++) {
    const ch = CHANNELS[i];
    console.log(`\n--------------------------------------------------`);
    console.log(`[${i + 1}/${CHANNELS.length}] ${ch.name} (${ch.handle}) — vid: ${ch.vid}`);
    console.log(`--------------------------------------------------`);

    const resItem = { name: ch.name, handle: ch.handle, vid: ch.vid, thumbStatus: 'PENDING', liveStatus: 'PENDING' };

    try {
      await ensureChannel(ch.handle, ch.name);

      // 1. EDIT PAGE: UPLOAD THUMBNAIL
      console.log(`  Edit page: https://studio.youtube.com/video/${ch.vid}/edit`);
      await page.goto(`https://studio.youtube.com/video/${ch.vid}/edit`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);

      const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
      if (await gate.isVisible().catch(() => false)) {
        await gate.click();
        await page.waitForTimeout(3000);
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
              page.waitForEvent('filechooser', { timeout: 8000 }),
              changeItem.click()
            ]);
            await fileChooser.setFiles(THUMBNAIL_PATH);
            fileSet = true;
            console.log('  Set thumbnail via options menu file chooser');
          }
        }
      }

      if (fileSet) {
        await page.waitForTimeout(2000);
        const saveBtn = page.locator('#save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
        if (await saveBtn.count() > 0) {
          const isEnabled = await saveBtn.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true').catch(() => false);
          if (isEnabled) {
            await saveBtn.click();
            await page.waitForTimeout(3000);
            console.log(`  ✅ SAVED thumbnail for ${ch.name}`);
            resItem.thumbStatus = 'SUCCESS';
          } else {
            console.log(`  ℹ️ Save button not active (thumbnail unchanged)`);
            resItem.thumbStatus = 'UNCHANGED';
          }
        }
      } else {
        console.log(`  ❌ Could not set thumbnail file input`);
        resItem.thumbStatus = 'FAILED_NO_INPUT';
      }

      // 2. LIVE CONTROL ROOM: CHECK / GO LIVE
      console.log(`  Live Control Room: https://studio.youtube.com/video/${ch.vid}/livestreaming`);
      await page.goto(`https://studio.youtube.com/video/${ch.vid}/livestreaming`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3500);

      const pageText = await page.locator('body').innerText().catch(() => '');
      const isAlreadyLive = pageText.includes('Zakończ transmisję') || pageText.includes('End stream') || pageText.includes('Jesteś na żywo');
      console.log(`  isAlreadyLive: ${isAlreadyLive}`);

      if (isAlreadyLive) {
        resItem.liveStatus = 'ALREADY_LIVE';
      } else {
        const goLiveBtn = page.locator('#go-live-button, ytcp-button:has-text("Transmituj na żywo"), button:has-text("Transmituj na żywo")').first();
        if (await goLiveBtn.count() > 0) {
          const canGoLive = await goLiveBtn.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true' && el.offsetParent !== null).catch(() => false);
          console.log(`  Go Live button enabled: ${canGoLive}`);
          if (canGoLive) {
            await goLiveBtn.click();
            await page.waitForTimeout(3000);
            console.log(`  🚀 Clicked "Transmituj na żywo" for ${ch.name}!`);
            resItem.liveStatus = 'CLICKED_GO_LIVE';
          } else {
            resItem.liveStatus = 'WAITING_SIGNAL_OR_AUTOSTART';
          }
        } else {
          resItem.liveStatus = 'NO_GO_LIVE_BTN';
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
