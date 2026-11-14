import { chromium } from 'playwright';
import fs from 'node:fs';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const OUT = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scratch';

const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();

async function checkChannel(id, via) {
  console.log(`\n=== CHECKING ${via} (${id}) ===`);
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);
  const item = page.locator('ytd-account-item-renderer', { hasText: via.replace('@', '') }).first();
  if (await item.count()) {
    await item.click();
    await page.waitForTimeout(4000);
  }

  await page.goto(`https://studio.youtube.com/channel/${id}/livestreaming/manage?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(4000); }
  
  console.log('URL:', page.url());
  const bodyText = (await page.locator('body').innerText()).replace(/\n{2,}/g, '\n');
  console.log('MANAGE PREVIEW:', bodyText.slice(0, 1000));
  await page.screenshot({ path: `${OUT}\\manage_${id}.png` });
}

try {
  await checkChannel('UCNnCdsJ-K6FXulZzXZHWkjQ', '@osobowośćPLUS');
  await checkChannel('UCHmPxDM2zzlUAf5ZvlotPLw', '@osobowośćPLUS');
  await checkChannel('UCG5Y4dwJi5436Gu6QH3nNUQ', '@ChristianCultureTV');
} finally {
  await ctx.close();
}
