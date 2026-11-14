import { chromium } from 'playwright';
const ctx = await chromium.launchPersistentContext('C:\\Users\\czark\\.youtube_browser_profile', {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();
try {
  await page.goto('https://studio.youtube.com/video/AvHB8splaiA/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(4000); }
  const bodyText = (await page.locator('body').innerText()).replace(/\n{2,}/g, '\n');
  console.log('RCC STUDIO TEXT:');
  console.log(bodyText.slice(0, 1500));
} finally {
  await ctx.close();
}
