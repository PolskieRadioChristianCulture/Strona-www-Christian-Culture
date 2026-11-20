import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

  try {
    for (const item of [
      { name: 'Polskie Radio CHRISTIAN CULTURE', id: 'tPipeO1iMD0' },
      { name: 'CC Women', id: 'yWyj0Iz1HeA' }
    ]) {
      await openChannelStudio(page, item.name, '/livestreaming/manage');
      await page.waitForTimeout(3000);
      await page.goto(`https://studio.youtube.com/video/${item.id}/livestreaming`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
      await page.screenshot({ path: `${artDir}/studio_now_${item.id}.png` });

      const state = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          hasData: text.includes('Doskonały') || text.includes('Dobra jakość') || text.includes('Dobre połączenie'),
          noData: text.includes('Brak danych'),
          isLive: text.includes('Zakończ transmisję'),
          title: document.title
        };
      });
      console.log(`State for ${item.name}:`, state);
    }
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
