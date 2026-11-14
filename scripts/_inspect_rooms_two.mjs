import { chromium } from 'playwright';
import fs from 'node:fs';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const OUT = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scratch';

const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();

async function inspectRoom(channelId, via) {
  console.log(`\n=== ROOM FOR ${via} (${channelId}) ===`);
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);
  const item = page.locator('ytd-account-item-renderer', { hasText: via.replace('@', '') }).first();
  if (await item.count()) {
    await item.click();
    await page.waitForTimeout(4000);
  }

  await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/manage?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(4000); }

  const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
  if (await row.isVisible().catch(() => false)) {
    await row.click();
    await page.waitForTimeout(8000);
    console.log('ROOM URL:', page.url());
    
    // Check stream key input
    const eye = page.locator('ytcp-icon-button[aria-label*="Pokaż"], #toggle-button').first();
    if (await eye.isVisible().catch(() => false)) { await eye.click(); await page.waitForTimeout(500); }
    const key = await page.evaluate(() => {
      const inp = document.querySelector('input[type="text"][aria-label*="Klucz"], input[type="text"][value*="-"], input[type="password"]');
      return inp ? inp.value : null;
    });
    console.log('STREAM KEY IN STUDIO:', key);

    const bodyText = (await page.locator('body').innerText()).replace(/\n{2,}/g, '\n');
    const health = (bodyText.match(/\n(Doskonały|Dobry|Dobra|Słaby|Słaba|Brak danych|Brak sygnału|Oczekiwanie)[^\n]*/) || [])[1] || '?';
    console.log('HEALTH:', health);

    await page.screenshot({ path: `${OUT}\\room_${channelId}.png` });
  } else {
    console.log('NO ROW IN MANAGE');
  }
}

try {
  await inspectRoom('UCG5Y4dwJi5436Gu6QH3nNUQ', '@ChristianCultureTV');
  await inspectRoom('UCNnCdsJ-K6FXulZzXZHWkjQ', '@osobowośćPLUS');
} finally {
  await ctx.close();
}
