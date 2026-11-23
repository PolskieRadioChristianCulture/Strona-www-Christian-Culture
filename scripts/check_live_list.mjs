import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function run() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  console.log('Navigating to channel content live tab...');
  await page.goto('https://studio.youtube.com/videos/live', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    console.log('Clicking gate...');
    await gate.click();
    await page.waitForTimeout(5000);
  }

  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());

  // Wait for table rows
  const rows = page.locator('ytcp-video-row');
  const count = await rows.count();
  console.log('Total live video rows:', count);

  for (let i = 0; i < Math.min(count, 5); i++) {
    const row = rows.nth(i);
    const titleEl = row.locator('#video-title');
    const title = await titleEl.innerText().catch(() => '');
    const href = await titleEl.getAttribute('href').catch(() => '');
    console.log(`  Row ${i}: "${title.trim()}" -> ${href}`);
  }

  await ctx.close();
}

run().catch(console.error);
