import { chromium } from 'playwright';
import path from 'node:path';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = path.resolve('scripts/thumbnail_tvw_live.jpg');

async function run() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  
  console.log('Navigating to Popraw Korone edit page...');
  await page.goto('https://studio.youtube.com/video/9H_xc4mdUro/edit', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    console.log('Clicking gate...');
    await gate.click();
    await page.waitForTimeout(4000);
  }

  // Poll for input[type="file"] up to 20s
  let fileInput = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    const inputs = page.locator('input[type="file"]');
    if (await inputs.count() > 0) {
      fileInput = inputs.first();
      console.log(`Found file input on attempt ${attempt}!`);
      break;
    }
    await page.waitForTimeout(1000);
  }

  if (fileInput) {
    console.log('Setting input files...');
    await fileInput.setInputFiles(THUMBNAIL_PATH);
    await page.waitForTimeout(2500);
    await page.keyboard.press('Escape');

    const saveBtn = page.locator('#save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
    const isEnabled = await saveBtn.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true').catch(() => false);
    console.log('Save button enabled:', isEnabled);
    if (isEnabled) {
      await saveBtn.click({ force: true });
      await page.waitForTimeout(4000);
      console.log('✅ SAVED Popraw Korone thumbnail!');
    }
  } else {
    console.log('❌ File input never appeared');
  }

  await ctx.close();
}

run().catch(console.error);
