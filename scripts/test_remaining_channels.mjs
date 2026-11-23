import { chromium } from 'playwright';
import path from 'node:path';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = path.resolve('scripts/thumbnail_tvw_live.jpg');

const CHANNELS_TO_CHECK = [
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

async function run() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  for (const ch of CHANNELS_TO_CHECK) {
    console.log(`\nChecking ${ch.name} (${ch.handle}, vid: ${ch.vid})...`);
    
    // Switch channel
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
    await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
    const items = await page.locator('ytd-account-item-renderer').all();
    let switched = false;
    for (const it of items) {
      const text = await it.innerText().catch(() => '');
      if (text.includes(ch.handle) || text.toLowerCase().includes(ch.name.toLowerCase())) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
          it.click()
        ]);
        await page.waitForTimeout(2000);
        switched = true;
        console.log(`  Switched to ${ch.name}`);
        break;
      }
    }
    if (!switched) {
      console.log(`  Could not switch to ${ch.name}`);
      continue;
    }

    await page.goto(`https://studio.youtube.com/video/${ch.vid}/edit`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
    if (await gate.isVisible().catch(() => false)) {
      console.log('  Clicking gate...');
      await gate.click();
      await page.waitForTimeout(4000);
    }

    const title = await page.title();
    const isError = title.includes('Ups') || (await page.locator('body').innerText()).includes('Ups, coś poszło nie tak');
    if (isError) {
      console.log(`  ❌ 404 / Video not found for ${ch.name}`);
      continue;
    }

    try {
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
    } catch (e) {
      console.log(`  ⚠️ Error setting thumb: ${e.message}`);
    }
  }

  await ctx.close();
}

run().catch(console.error);
