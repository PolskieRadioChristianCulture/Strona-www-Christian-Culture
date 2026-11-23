import { chromium } from 'playwright';
import path from 'node:path';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = path.resolve('scripts/thumbnail_tvw_live.jpg');

async function testOne() {
  console.log('Testing thumbnail upload for CC Women & Popraw Koronę...');
  console.log('Thumbnail file:', THUMBNAIL_PATH);

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  const testChannels = [
    { name: 'CC Women', vid: 'QoIgzHsu_Hg', via: '@CCWomen7' },
    { name: 'Popraw Koronę', vid: '9H_xc4mdUro', via: '@PoprawKoronęCC' }
  ];

  for (const ch of testChannels) {
    console.log(`\n--- Testing ${ch.name} (${ch.vid}) ---`);
    try {
      // 1. Channel switcher
      await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
      await page.waitForTimeout(1000);
      const target = ch.via.replace('@', '');
      const item = page.locator('ytd-account-item-renderer', { hasText: target }).first();
      if (await item.count()) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {}),
          item.click()
        ]);
        await page.waitForTimeout(3000);
      }

      // 2. Video edit page
      await page.goto(`https://studio.youtube.com/video/${ch.vid}/edit`, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(4000);

      const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
      if (await gate.isVisible().catch(() => false)) {
        await gate.click();
        await page.waitForTimeout(4000);
      }

      // 3. Set thumbnail
      let fileSet = false;
      const fileInputs = page.locator('input[type="file"]');
      const count = await fileInputs.count();
      console.log(`  Found ${count} file input elements.`);

      for (let i = 0; i < count; i++) {
        try {
          await fileInputs.nth(i).setInputFiles(THUMBNAIL_PATH);
          fileSet = true;
          console.log(`  Set input file on input #${i}`);
          break;
        } catch (e) {
          console.log(`  Input #${i} failed: ${e.message}`);
        }
      }

      if (!fileSet) {
        // Try clicking options button to replace existing thumbnail
        const optBtn = page.locator('ytcp-thumbnails-compact-editor-uploader #options-button, [aria-label*="Opcje"], [aria-label*="Options"]').first();
        if (await optBtn.isVisible().catch(() => false)) {
          console.log('  Clicking options button...');
          await optBtn.click();
          await page.waitForTimeout(1000);
          const changeItem = page.locator('tp-yt-paper-item:has-text("Zmień"), tp-yt-paper-item:has-text("Change")').first();
          if (await changeItem.isVisible().catch(() => false)) {
            const [fileChooser] = await Promise.all([
              page.waitForEvent('filechooser', { timeout: 10000 }),
              changeItem.click()
            ]);
            await fileChooser.setFiles(THUMBNAIL_PATH);
            fileSet = true;
            console.log('  Set file via fileChooser');
          }
        }
      }

      await page.waitForTimeout(3000);
      const saveBtn = page.locator('#save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
      const isEnabled = await saveBtn.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true').catch(() => false);
      console.log(`  Save button isEnabled: ${isEnabled}`);
      if (isEnabled) {
        await saveBtn.click();
        await page.waitForTimeout(4000);
        console.log(`  ✅ SAVED thumbnail for ${ch.name}!`);
      }

      await page.screenshot({ path: `C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/thumb_test_${ch.vid}.png` });
    } catch (err) {
      console.error(`  ❌ Error for ${ch.name}:`, err.message);
    }
  }

  await ctx.close();
}

testOne().catch(console.error);
