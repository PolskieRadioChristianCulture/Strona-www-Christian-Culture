import { chromium } from 'playwright';
import path from 'node:path';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = path.resolve('scripts/thumbnail_tvw_live.jpg');

const REMAINING_CHANNELS = [
  { name: 'Christian Culture POP', handle: '@ChristianCulturePOP', vid: 'KsPzBrFs7j8' },
  { name: 'Worship LIVE CC', handle: '@WorshipLiveCC', vid: 'G5Y-TTyInqA' },
  { name: 'CC Instrumental', handle: '@ChristianCultureInstrumental', vid: 'JhzMGo11zhA' },
  { name: 'CC Identity', handle: '@CCIdentityTwojaDuchowaTożsamoś', vid: '2nSknaf1X40' },
  { name: 'CC FILM', handle: '@CCFILM77', vid: 'QqhAmVOPRSU' },
  { name: 'CC Nature Sounds', handle: '@CCNatureSounds', vid: 'hTzZNyXUN3M' },
  { name: 'Personality Plus', handle: '@PersonalityPlusCC', vid: '8k-R9Z2CPBA' }
];

async function run() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  for (const ch of REMAINING_CHANNELS) {
    console.log(`\n========================================`);
    console.log(`Checking ${ch.name} (${ch.handle}, vid: ${ch.vid})...`);
    console.log(`========================================`);
    
    try {
      // Switch channel
      await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
      const items = await page.locator('ytd-account-item-renderer').all();
      let switched = false;
      for (const it of items) {
        const text = await it.innerText().catch(() => '');
        if (text.includes(ch.handle) || text.toLowerCase().includes(ch.name.toLowerCase())) {
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => {}),
            it.click()
          ]);
          await page.waitForTimeout(2500);
          switched = true;
          console.log(`  Switched to ${ch.name}`);
          break;
        }
      }
      if (!switched) {
        console.log(`  Could not switch to ${ch.name}`);
        continue;
      }

      await page.goto(`https://studio.youtube.com/video/${ch.vid}/edit`, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(3000);

      const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
      if (await gate.isVisible().catch(() => false)) {
        console.log('  Clicking gate...');
        await gate.click();
        await page.waitForTimeout(4500);
      }

      const bodyText = await page.locator('body').innerText().catch(() => '');
      if (bodyText.includes('Ups, coś poszło nie tak') || (await page.title()).includes('Ups')) {
        console.log(`  ❌ 404 / Video not found for ${ch.name}`);
        continue;
      }

      await page.waitForSelector('input#file-loader', { state: 'attached', timeout: 15000 });
      console.log('  Setting thumbnail file...');
      await page.locator('input#file-loader').setInputFiles(THUMBNAIL_PATH);
      await page.waitForTimeout(2500);
      await page.keyboard.press('Escape');

      const saveBtn = page.locator('#save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
      const isEnabled = await saveBtn.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true').catch(() => false);
      if (isEnabled) {
        await saveBtn.click({ force: true });
        await page.waitForTimeout(4000);
        console.log(`  ✅ SAVED thumbnail for ${ch.name}!`);
      } else {
        console.log(`  ℹ️ Save button inactive (already up to date)`);
      }

      // Check live status
      await page.goto(`https://studio.youtube.com/video/${ch.vid}/livestreaming`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3500);
      const lcrText = await page.locator('body').innerText().catch(() => '');
      const isLive = lcrText.includes('Zakończ transmisję') || lcrText.includes('End stream') || lcrText.includes('Jesteś na żywo');
      if (isLive) {
        console.log(`  🟢 Live status: STREAMING NOW`);
      } else {
        const goLive = page.locator('#go-live-button, ytcp-button:has-text("Transmituj na żywo")').first();
        if (await goLive.count() > 0) {
          const canGo = await goLive.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true').catch(() => false);
          if (canGo) {
            await goLive.click({ force: true });
            await page.waitForTimeout(3000);
            console.log(`  🚀 Clicked "Transmituj na żywo" for ${ch.name}`);
          } else {
            console.log(`  ⏳ Waiting for signal / autostart`);
          }
        }
      }

    } catch (e) {
      console.log(`  ⚠️ Error on ${ch.name}: ${e.message}`);
    }
  }

  await ctx.close();
  console.log('\n=== FINAL BATCH COMPLETED ===');
}

run().catch(console.error);
