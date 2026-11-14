import { chromium } from 'playwright';

const ctx = await chromium.launchPersistentContext('C:\\Users\\czark\\.youtube_browser_profile', {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();
try {
  await page.goto('https://studio.youtube.com/video/AvHB8splaiA/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  
  // Click browser gate if visible
  for (let i = 0; i < 3; i++) {
    const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
    if (await gate.isVisible().catch(() => false)) {
      console.log('Clicking gate...');
      await gate.click();
      await page.waitForTimeout(5000);
    }
  }

  const goLive = page.locator('#go-live-button, ytcp-button:has-text("Transmituj na żywo"), button:has-text("Transmituj na żywo")').first();
  for (let t = 0; t < 30; t++) {
    const visible = await goLive.isVisible().catch(() => false);
    const disabled = visible ? await goLive.evaluate(el => el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true').catch(() => true) : true;
    console.log(`Poll ${t}: visible=${visible}, disabled=${disabled}`);
    if (visible && !disabled) {
      await goLive.click({ force: true });
      await page.waitForTimeout(2000);
      const confirm = page.locator('#confirm-button, ytcp-button:has-text("Rozpocznij"), button:has-text("Rozpocznij")').first();
      if (await confirm.isVisible().catch(() => false)) { await confirm.click({ force: true }); await page.waitForTimeout(3000); }
      console.log('SUCCESS: Clicked Go Live on RCC!');
      break;
    }
    await page.waitForTimeout(2000);
  }
} finally {
  await ctx.close();
}
