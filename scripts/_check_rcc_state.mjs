import { chromium } from 'playwright';
const ctx = await chromium.launchPersistentContext('C:\\Users\\czark\\.youtube_browser_profile', {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();
try {
  await page.goto('https://studio.youtube.com/video/AvHB8splaiA/livestreaming', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  const text = await page.locator('body').innerText();
  console.log('RCC state after click:', text.includes('Zakończ transmisję') ? 'TRANSMITTING' : 'NOT_TRANSMITTING');
  const goLive = page.locator('#go-live-button, ytcp-button:has-text("Transmituj na żywo"), button:has-text("Transmituj na żywo")').first();
  console.log('goLive visible:', await goLive.isVisible().catch(() => false));
  const disabled = await goLive.evaluate(el => el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true').catch(() => null);
  console.log('goLive disabled:', disabled);
  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scratch\\rcc_after.png' });
} finally {
  await ctx.close();
}
