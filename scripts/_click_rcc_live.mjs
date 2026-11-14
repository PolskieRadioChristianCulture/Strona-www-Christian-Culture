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

  const btn = page.locator('button:has-text("Transmituj na żywo"), ytcp-button:has-text("Transmituj na żywo")').first();
  console.log('Button visible:', await btn.isVisible());
  await btn.click({ force: true });
  await page.waitForTimeout(1500);

  // Look for any dialog / confirmation
  const confirmBtn = page.locator('ytcp-button:has-text("Rozpocznij"), button:has-text("Rozpocznij"), ytcp-button:has-text("Transmituj na żywo")').last();
  if (await confirmBtn.isVisible().catch(() => false)) {
    console.log('Clicking dialog confirm...');
    await confirmBtn.click({ force: true });
    await page.waitForTimeout(4000);
  }

  await page.waitForTimeout(4000);
  const bodyText = (await page.locator('body').innerText()).slice(0, 500);
  console.log('After confirm click:\n', bodyText);
} finally {
  await ctx.close();
}
