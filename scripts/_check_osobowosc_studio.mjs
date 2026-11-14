import { chromium } from 'playwright';

const ctx = await chromium.launchPersistentContext('C:\\Users\\czark\\.youtube_browser_profile', {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();
try {
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1000);
  const item = page.locator('ytd-account-item-renderer', { hasText: 'osobowośćPLUS' }).first();
  if (await item.count()) {
    await item.click();
    await page.waitForTimeout(3000);
  }

  // Go to livestreaming manage of Osobowość +
  await page.goto('https://studio.youtube.com/channel/UCHmPxDM2zzlUAf5ZvlotPLw/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(4000); }

  console.log('MANAGE URL:', page.url());
  const bodyText = (await page.locator('body').innerText()).replace(/\n{2,}/g, '\n');
  console.log('TEXT:\n', bodyText.slice(0, 1500));
} finally {
  await ctx.close();
}
