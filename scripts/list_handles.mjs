import { chromium } from 'playwright';

async function listAll() {
  const ctx = await chromium.launchPersistentContext('C:/Users/czark/.youtube_browser_profile', { headless: true });
  const page = await ctx.newPage();
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  const texts = await page.locator('ytd-account-item-renderer').allInnerTexts();
  texts.forEach((t, i) => {
    console.log((i + 1) + '. ' + t.replace(/\n/g, ' | '));
  });
  await ctx.close();
}

listAll().catch(console.error);
