import { chromium } from 'playwright';
import path from 'node:path';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = path.resolve('scripts/thumbnail_tvw_live.jpg');

async function testAttached() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  async function updateChannel(handle, name, vid) {
    console.log(`\n--- ${name} (${handle}, vid: ${vid}) ---`);
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
    await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
    const items = await page.locator('ytd-account-item-renderer').all();
    for (const it of items) {
      const text = await it.innerText().catch(() => '');
      if (text.includes(handle) || text.toLowerCase().includes(name.toLowerCase())) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
          it.click()
        ]);
        await page.waitForTimeout(2000);
        console.log(`  Switched to ${name}`);
        break;
      }
    }

    await page.goto(`https://studio.youtube.com/video/${vid}/edit`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
    if (await gate.isVisible().catch(() => false)) {
      console.log('  Clicking gate...');
      await gate.click();
      await page.waitForTimeout(5000);
    }

    console.log('  Waiting for input#file-loader attached...');
    await page.waitForSelector('input#file-loader', { state: 'attached', timeout: 20000 });
    console.log('  Found input#file-loader! Setting files...');
    await page.locator('input#file-loader').setInputFiles(THUMBNAIL_PATH);
    await page.waitForTimeout(2500);
    await page.keyboard.press('Escape');

    const saveBtn = page.locator('#save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
    const isEnabled = await saveBtn.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true').catch(() => false);
    console.log('  Save button enabled:', isEnabled);
    if (isEnabled) {
      await saveBtn.click({ force: true });
      await page.waitForTimeout(4000);
      console.log(`  ✅ SAVED thumbnail for ${name}!`);
    } else {
      console.log(`  ℹ️ Save button not active (already set)`);
    }
  }

  await updateChannel('@RadioChristianCulture', 'Polskie Radio CC', 'RxyWYOGWZ6c');
  await updateChannel('@bibliaaudiocc', 'Biblia Audio CC', 'LLO4p4XNJoY');

  await ctx.close();
}

testAttached().catch(console.error);
