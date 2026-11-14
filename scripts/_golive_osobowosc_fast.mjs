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

  const bodyText = (await page.locator('body').innerText()).replace(/\n{2,}/g, '\n');
  const health = (bodyText.match(/\n(Doskonały|Dobry|Dobra|Słaby|Słaba|Brak danych|Brak sygnału|Oczekiwanie)[^\n]*/) || [])[1] || '?';
  console.log('HEALTH IN ROOM:', health);

  const goLive = page.locator('#go-live-button, ytcp-button:has-text("Transmituj na żywo"), button:has-text("Transmituj na żywo")').first();
  for (let t = 0; t < 25; t++) {
    const visible = await goLive.isVisible().catch(() => false);
    const disabled = visible ? await goLive.evaluate(el => el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true').catch(() => true) : true;
    console.log(`Poll ${t}: visible=${visible}, disabled=${disabled}`);
    if (visible && !disabled) {
      await goLive.click({ force: true });
      await page.waitForTimeout(2000);
      const confirm = page.locator('#confirm-button, ytcp-button:has-text("Rozpocznij"), button:has-text("Rozpocznij")').first();
      if (await confirm.isVisible().catch(() => false)) { await confirm.click({ force: true }); await page.waitForTimeout(3000); }
      console.log('SUCCESS: Clicked Go Live on Osobowość +!');
      break;
    }
    await page.waitForTimeout(2000);
  }
} finally {
  await ctx.close();
}
