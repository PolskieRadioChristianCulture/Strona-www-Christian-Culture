import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function testManage() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  console.log('Navigating to livestreaming manage...');
  await page.goto('https://studio.youtube.com/livestreaming/manage', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(4000); }

  const rows = await page.locator('ytcp-video-row').all();
  console.log(`Found ${rows.length} video rows on manage page:`);
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const titleEl = rows[i].locator('#video-title');
    const title = await titleEl.innerText().catch(() => '');
    const href = await titleEl.getAttribute('href').catch(() => '');
    console.log(`  Row ${i+1}: title="${title.slice(0, 50)}" href="${href}"`);
  }

  await ctx.close();
}

testManage().catch(console.error);
