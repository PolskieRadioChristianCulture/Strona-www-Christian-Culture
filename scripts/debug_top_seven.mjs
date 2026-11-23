import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function run() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  // Switch to Top Seven
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
  const items = await page.locator('ytd-account-item-renderer').all();
  for (const it of items) {
    const text = await it.innerText().catch(() => '');
    if (text.includes('@TopSeven_CC')) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
        it.click()
      ]);
      await page.waitForTimeout(2000);
      console.log('Switched to Top Seven');
      break;
    }
  }

  console.log('Navigating to tIF2WJl9G1c edit...');
  await page.goto('https://studio.youtube.com/video/tIF2WJl9G1c/edit', { waitUntil: 'domcontentloaded' });
  
  // Wait up to 10s for either gate or file-loader
  for (let i = 0; i < 10; i++) {
    const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
    if (await gate.isVisible().catch(() => false)) {
      console.log(`Gate found on attempt ${i}, clicking!`);
      await gate.click();
      await page.waitForTimeout(4000);
      break;
    }
    const hasLoader = await page.locator('input#file-loader').count();
    if (hasLoader > 0) {
      console.log(`input#file-loader found on attempt ${i}!`);
      break;
    }
    await page.waitForTimeout(1000);
  }

  console.log('URL after check:', page.url());
  console.log('Title:', await page.title());
  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/debug_top_seven.png' });

  await ctx.close();
}

run().catch(console.error);
