import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_cc.jpg';
const VID = 'ST_Y_Yve0Eo';

const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();

try {
  // 1. Update thumbnail on direct edit page
  console.log('Uploading thumbnail...');
  await page.goto(`https://studio.youtube.com/video/${VID}/edit`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(4000); }

  const directInput = page.locator('input[type="file"][accept*="image"]').first();
  if (await directInput.count()) {
    await directInput.setInputFiles(THUMBNAIL_PATH);
    await page.waitForTimeout(2000);
    const saveBtn = page.locator('#save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
    if (await saveBtn.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true').catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(3500);
      console.log('Thumbnail saved!');
    }
  }

  // 2. Go to live room and click Go Live
  console.log('Entering live room...');
  await page.goto(`https://studio.youtube.com/video/${VID}/livestreaming?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

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
      console.log('SUCCESS: Clicked Go Live on Osobowość +!');
      break;
    }
    await page.waitForTimeout(2000);
  }
} finally {
  await ctx.close();
}
