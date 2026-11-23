import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function run() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  // Check channel switcher
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const it = page.locator('ytd-account-item-renderer').filter({ hasText: '@RadioChristianCulture' }).first();
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
    it.click()
  ]);
  await page.waitForTimeout(3000);

  console.log('Navigating to RxyWYOGWZ6c edit page...');
  await page.goto('https://studio.youtube.com/video/RxyWYOGWZ6c/edit', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    console.log('Clicking gate...');
    await gate.click();
    await page.waitForTimeout(5000);
  }

  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());
  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/debug_rxy.png' });

  const inputs = await page.locator('input[type="file"]').all();
  console.log('Total file inputs:', inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    const id = await inputs[i].getAttribute('id').catch(() => '');
    const accept = await inputs[i].getAttribute('accept').catch(() => '');
    console.log(`  Input ${i}: id="${id}" accept="${accept}"`);
  }

  const text = await page.locator('body').innerText().catch(() => '');
  console.log('Body snippet:', text.slice(0, 300));

  await ctx.close();
}

run().catch(console.error);
