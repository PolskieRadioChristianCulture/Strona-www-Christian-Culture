import { chromium } from 'playwright';
const ctx = await chromium.launchPersistentContext('C:\\Users\\czark\\.youtube_browser_profile', {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();
try {
  await page.goto('https://studio.youtube.com/video/A5biQPq-bsQ/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(5000); }
  console.log('FINAL URL:', page.url());
  const bodyText = (await page.locator('body').innerText()).slice(0, 1500);
  console.log('TEXT:', bodyText);
  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scratch\\direct_edit_unlocked.png' });
} finally {
  await ctx.close();
}
