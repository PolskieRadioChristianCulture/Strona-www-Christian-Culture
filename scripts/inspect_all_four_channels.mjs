import { launchStudio } from './yt_studio_session.mjs';

async function listChannels() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const avatar = await page.$('#avatar-btn');
    if (avatar) {
      await avatar.click();
      await page.waitForTimeout(1500);

      const switchBtn = await page.$('tp-yt-paper-item:has-text("Przełącz konto"), tp-yt-paper-item:has-text("Switch account")');
      if (switchBtn) {
        await switchBtn.click();
        await page.waitForTimeout(3000);

        const accounts = await page.evaluate(() => {
          const items = Array.from(document.querySelectorAll('ytd-account-item-renderer, tp-yt-paper-item'));
          return items.map(it => it.innerText.split('\n').map(s => s.trim()).filter(Boolean));
        });
        console.log('Channels found:');
        for (const acc of accounts) {
          if (acc.length > 0) console.log('-', acc.join(' | '));
        }
      }
    }
  } finally {
    await ctx.close();
  }
}

listChannels().catch(console.error);
