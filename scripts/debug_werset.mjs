import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function run() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  console.log('Navigating directly to bt8m8st5GOE edit...');
  await page.goto('https://studio.youtube.com/video/bt8m8st5GOE/edit', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    console.log('Clicking gate...');
    await gate.click();
    await page.waitForTimeout(5000);
  }

  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/debug_werset_page.png' });

  const text = await page.locator('body').innerText().catch(() => '');
  console.log('Body snippet:\n', text.slice(0, 400));

  await ctx.close();
}

run().catch(console.error);
