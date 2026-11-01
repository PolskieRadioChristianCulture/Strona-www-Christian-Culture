import { chromium } from 'playwright';

async function main() {
  const ctx = await chromium.launchPersistentContext('C:/Users/czark/.youtube_browser_profile', { headless: true });
  const page = await ctx.newPage();
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  const items = await page.locator('ytd-account-item-renderer').evaluateAll(elements => {
    return elements.map(el => {
      const title = el.querySelector('#channel-title')?.textContent?.trim() || '';
      const handle = el.querySelector('#channel-handle')?.textContent?.trim() || '';
      const subs = el.querySelector('#byline')?.textContent?.trim() || '';
      const href = el.querySelector('a')?.href || '';
      return { title, handle, subs, href };
    });
  });

  console.log('Channels count:', items.length);
  console.log('Channels:', JSON.stringify(items, null, 2));
  await ctx.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
