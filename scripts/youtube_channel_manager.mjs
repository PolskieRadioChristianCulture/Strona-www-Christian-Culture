import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:/Users/czark/.youtube_browser_profile';

export async function switchChannel(targetChannelName) {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  const page = await ctx.newPage();
  try {
    console.log(`[YT-Switcher] Otwieram channel switcher...`);
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const item = page.locator('ytd-account-item-renderer', { hasText: targetChannelName }).first();
    for (let scroll = 0; scroll < 8; scroll++) {
      if (await item.count() > 0) break;
      await page.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(600);
    }

    const count = await item.count();
    if (count === 0) {
      throw new Error(`Nie znaleziono kanału: ${targetChannelName}`);
    }

    console.log(`[YT-Switcher] Przełączam na kanał: ${targetChannelName}`);
    await item.click();
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // Verify studio access
    await page.goto('https://studio.youtube.com', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log(`[YT-Switcher] Aktywny URL Studio: ${page.url()}`);
    return true;
  } finally {
    await ctx.close();
  }
}

if (process.argv[2]) {
  switchChannel(process.argv[2])
    .then(() => console.log('Sukces przełączenia kanału!'))
    .catch(err => {
      console.error('Błąd:', err.message);
      process.exit(1);
    });
}
