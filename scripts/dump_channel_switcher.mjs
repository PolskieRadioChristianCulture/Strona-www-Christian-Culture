import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function listChannels() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(2000);

  const items = await page.locator('ytd-account-item-renderer').all();
  console.log(`Found ${items.length} channels in channel_switcher:`);
  for (let i = 0; i < items.length; i++) {
    const text = (await items[i].innerText()).replace(/\n+/g, ' | ');
    console.log(`${i + 1}. ${text}`);
  }

  await ctx.close();
}

listChannels().catch(console.error);
