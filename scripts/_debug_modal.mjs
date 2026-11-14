import { chromium } from 'playwright';
const ctx = await chromium.launchPersistentContext('C:\\Users\\czark\\.youtube_browser_profile', {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();
try {
  await page.goto('https://studio.youtube.com/video/A5biQPq-bsQ/livestreaming', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  const editBtn = page.locator('#edit-button, button:has-text("Edytuj")').first();
  await editBtn.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scratch\\edit_modal.png' });
  const buttons = await page.locator('tp-yt-paper-dialog button, tp-yt-paper-dialog ytcp-button').allInnerTexts();
  console.log('DIALOG BUTTONS:', buttons);
} finally {
  await ctx.close();
}
