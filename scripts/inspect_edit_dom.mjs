import { chromium } from 'playwright';
import path from 'node:path';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = path.resolve('scripts/thumbnail_tvw_live.jpg');

async function inspectEdit() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  // Switch to Christian Culture TV
  console.log('Switching to Christian Culture TV...');
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const it = page.locator('ytd-account-item-renderer').filter({ hasText: '@ChristianCultureTV' }).first();
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
    it.click()
  ]);
  await page.waitForTimeout(3000);

  console.log('Opening edit page...');
  await page.goto('https://studio.youtube.com/video/KdOBA_zRU0c/edit', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    console.log('Clicking gate...');
    await gate.click();
    await page.waitForTimeout(5000);
  }

  // Take screenshot
  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/edit_page_debug.png' });

  // Scroll down to thumbnail
  const thumbSec = page.locator('ytcp-thumbnails-compact-editor-uploader, #thumbnail-picker, #still-picker').first();
  console.log('Thumb section count:', await thumbSec.count());
  if (await thumbSec.count() > 0) {
    await thumbSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
  }

  const inputs = await page.locator('input[type="file"]').all();
  console.log('Total file inputs:', inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    const accept = await inputs[i].getAttribute('accept').catch(() => '');
    const id = await inputs[i].getAttribute('id').catch(() => '');
    console.log(`  Input ${i}: id="${id}" accept="${accept}"`);
  }

  const optionsBtn = page.locator('ytcp-thumbnails-compact-editor-uploader #options-button, ytcp-thumbnails-compact-editor-uploader [aria-label*="Opcje"]').first();
  console.log('Options button visible:', await optionsBtn.isVisible().catch(() => false));

  await ctx.close();
}

inspectEdit().catch(console.error);
