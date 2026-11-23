import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function main() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  console.log('Navigating to channel switcher...');
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const channels = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('ytd-account-item-renderer, ytd-account-section-list-renderer'));
    return items.map(i => {
      const title = i.querySelector('#channel-title, #title')?.innerText || '';
      const handle = i.querySelector('#byline, #handle')?.innerText || '';
      const isSelected = i.hasAttribute('selected') || i.querySelector('[aria-checked="true"]') !== null;
      return { title, handle, isSelected, text: i.innerText.replace(/\s+/g, ' ').trim() };
    }).filter(i => i.text.length > 0);
  });
  console.log('Available channels in switcher:\n', JSON.stringify(channels, null, 2));

  await ctx.close();
}

main().catch(console.error);
