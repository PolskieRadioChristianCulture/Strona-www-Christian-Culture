import { launchStudio } from './yt_studio_session.mjs';

async function listSwitcher() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    const items = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('ytd-account-item-renderer'));
      return els.map(el => {
        const title = el.querySelector('#channel-title')?.innerText.trim();
        const handle = el.querySelector('#byline')?.innerText.trim();
        return { title, handle };
      });
    });
    console.log('Channel switcher items:', items);
  } finally {
    await ctx.close();
  }
}

listSwitcher().catch(console.error);
