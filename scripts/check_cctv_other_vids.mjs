import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });

  try {
    for (const vid of ['D_Sy-I2Gr2Y', 'KdOBA_zRU0c']) {
      await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
      await page.waitForTimeout(3000);
      await page.goto(`https://studio.youtube.com/video/${vid}/livestreaming`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);

      const data = await page.evaluate(() => {
        const inp = document.querySelector('input[type="password"]');
        const text = document.body.innerText;
        return {
          key: inp ? inp.value : null,
          hasData: text.includes('Doskonały') || text.includes('Dobra jakość'),
          isLive: text.includes('Zakończ transmisję'),
          title: document.title
        };
      });
      console.log(`Video ${vid}:`, data);
    }
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
