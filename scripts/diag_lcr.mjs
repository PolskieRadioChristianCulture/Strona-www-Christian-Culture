import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function checkLCR() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  // 1. Check Christian Culture TV
  console.log('Switching to Christian Culture TV...');
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
  const items = await page.locator('ytd-account-item-renderer').all();
  for (const it of items) {
    const text = await it.innerText().catch(() => '');
    if (text.includes('@ChristianCultureTV')) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
        it.click()
      ]);
      await page.waitForTimeout(2000);
      break;
    }
  }

  console.log('Navigating to Live Control Room (https://studio.youtube.com/livestreaming)...');
  await page.goto('https://studio.youtube.com/livestreaming', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    console.log('Clicking gate...');
    await gate.click();
    await page.waitForTimeout(5000);
  }

  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());
  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/lcr_cctv.png' });

  const text = await page.locator('body').innerText().catch(() => '');
  console.log('LCR body preview:\n', text.slice(0, 1000));

  // Also check public watch page or public /live URL
  console.log('\nChecking public /live for Christian Culture TV:');
  const p2 = await ctx.newPage();
  await p2.goto('https://www.youtube.com/@ChristianCultureTV/live', { waitUntil: 'domcontentloaded' });
  await p2.waitForTimeout(3000);
  console.log('Public /live URL:', p2.url());
  console.log('Public /live Title:', await p2.title());
  await p2.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/public_cctv_live.png' });

  await ctx.close();
}

checkLCR().catch(console.error);
