import { chromium } from 'playwright';
import path from 'node:path';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = path.resolve('scripts/thumbnail_tvw_live.jpg');

async function testTwo() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  async function ensureChannel(handle, name) {
    console.log(`\nSwitching identity to ${name} (${handle})...`);
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
    await page.waitForTimeout(1000);

    const items = await page.locator('ytd-account-item-renderer').all();
    for (const it of items) {
      const text = await it.innerText().catch(() => '');
      if (text.includes(handle) || (name && text.toLowerCase().includes(name.toLowerCase()))) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => {}),
          it.click()
        ]);
        await page.waitForTimeout(2500);
        console.log(`  ✅ Switched to ${handle} (${name})`);
        return true;
      }
    }
    console.log(`  ⚠️ Could not switch to ${handle}`);
    return false;
  }

  async function updateThumb(vid, name) {
    console.log(`Updating thumb for ${name} (vid: ${vid})...`);
    await page.goto(`https://studio.youtube.com/video/${vid}/edit`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
    if (await gate.isVisible().catch(() => false)) {
      console.log('  Clicking gate...');
      await gate.click();
      await page.waitForTimeout(4000);
    }

    const fileInput = page.locator('input#file-loader, input[type="file"][accept*="image"]').first();
    await fileInput.waitFor({ timeout: 15000 }).catch(() => {});

    if (await fileInput.count() > 0) {
      console.log('  Setting thumbnail file on file-loader...');
      await fileInput.setInputFiles(THUMBNAIL_PATH);
      await page.waitForTimeout(2000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      const saveBtn = page.locator('#save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
      if (await saveBtn.count() > 0) {
        const isEnabled = await saveBtn.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true').catch(() => false);
        console.log('  Save button enabled:', isEnabled);
        if (isEnabled) {
          await saveBtn.click({ force: true });
          await page.waitForTimeout(4000);
          console.log(`  ✅ SUCCESS: SAVED thumbnail for ${name}`);
        } else {
          console.log(`  ℹ️ Save button disabled (thumbnail already matches)`);
        }
      }
    } else {
      console.log(`  ❌ Could not find file input for ${name}`);
    }
  }

  // Test 1: Christian Culture TV
  await ensureChannel('@ChristianCultureTV', 'Christian Culture TV');
  await updateThumb('KdOBA_zRU0c', 'Christian Culture TV');

  // Test 2: Popraw Koronę
  await ensureChannel('@PoprawKoronęCC', 'Popraw Koronę');
  await updateThumb('9H_xc4mdUro', 'Popraw Koronę');

  await ctx.close();
}

testTwo().catch(console.error);
