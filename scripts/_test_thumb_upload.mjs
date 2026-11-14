import { chromium } from 'playwright';
import fs from 'node:fs';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_cc.jpg';

const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();

try {
  await page.goto('https://studio.youtube.com/video/A5biQPq-bsQ/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(4000); }

  console.log('On edit page for CC Women');
  
  // Find file input or options trigger for existing thumbnail
  const fileInput = page.locator('input[type="file"][accept*="image"]').first();
  if (await fileInput.count()) {
    await fileInput.setInputFiles(THUMBNAIL_PATH);
    console.log('Set file on direct file input');
  } else {
    // If thumbnail already exists, there is often a 3-dots options menu on the thumbnail
    const optionsBtn = page.locator('#options-button, ytcp-icon-button[aria-label*="Opcje"], [aria-label*="Zmień"]').first();
    if (await optionsBtn.isVisible().catch(() => false)) {
      await optionsBtn.click();
      await page.waitForTimeout(1000);
      const changeItem = page.locator('tp-yt-paper-item:has-text("Zmień"), [role="menuitem"]:has-text("Zmień")').first();
      if (await changeItem.isVisible().catch(() => false)) {
        const [fileChooser] = await Promise.all([
          page.waitForEvent('filechooser'),
          changeItem.click()
        ]);
        await fileChooser.setFiles(THUMBNAIL_PATH);
        console.log('Set file via options menu file chooser');
      }
    }
  }

  await page.waitForTimeout(2500);
  const saveBtn = page.locator('#save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
  const isEnabled = await saveBtn.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true').catch(() => false);
  console.log('Save button enabled:', isEnabled);
  if (isEnabled) {
    await saveBtn.click();
    await page.waitForTimeout(4000);
    console.log('SUCCESS: Saved thumbnail for CC Women!');
  } else {
    console.log('Save button disabled/not clickable');
  }
} finally {
  await ctx.close();
}
