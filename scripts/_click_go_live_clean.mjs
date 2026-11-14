import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const VID = 'ST_Y_Yve0Eo';

const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();

try {
  await page.goto(`https://studio.youtube.com/video/${VID}/livestreaming?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(4000); }

  console.log('Clicking Transmituj na żywo in header...');
  const btn = page.locator('ytcp-button:has-text("Transmituj na żywo"), button:has-text("Transmituj na żywo")').first();
  await btn.click({ force: true });
  await page.waitForTimeout(1500);

  const confirm = page.locator('ytcp-button:has-text("Rozpocznij"), button:has-text("Rozpocznij")').last();
  if (await confirm.isVisible().catch(() => false)) {
    console.log('Clicking confirm modal...');
    await confirm.click({ force: true });
    await page.waitForTimeout(4000);
  }

  const text = (await page.locator('body').innerText()).replace(/\n{2,}/g, '\n');
  console.log('STATUS AFTER CLICK:');
  console.log(text.slice(0, 400));
} finally {
  await ctx.close();
}
