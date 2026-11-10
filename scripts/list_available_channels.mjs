import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log('Navigating to channel_switcher...');
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
    await page.waitForTimeout(2000);

    const accounts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('ytd-account-item-renderer')).map(el => {
        const title = el.querySelector('#channel-title, yt-formatted-string#text, #title')?.innerText?.trim() || '';
        const handle = el.querySelector('#email, #channel-handle, .ytd-channel-handle')?.innerText?.trim() || '';
        const full = el.innerText.replace(/\s+/g, ' ').trim();
        return { title, handle, full };
      });
    });

    console.log('Channel Switcher Accounts count:', accounts.length);
    for (const a of accounts) {
      console.log(`- Title: "${a.title}" | Handle: "${a.handle}" | Full: "${a.full}"`);
    }

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\channel_switcher.png' });

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
