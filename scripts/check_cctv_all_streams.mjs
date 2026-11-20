import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

  try {
    await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
    await page.waitForTimeout(5000);

    const streams = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('ytcp-video-row, ytls-video-row, [role="row"], tr'));
      return rows.map(r => ({
        text: r.innerText.replace(/\n+/g, ' | '),
        href: r.querySelector('a')?.href
      }));
    });

    console.log('Streams on Christian Culture TV manage page:', streams);
    await page.screenshot({ path: `${artDir}/cctv_manage_streams.png` });

    // Also check "Transmisja" (default stream room)
    await page.goto('https://studio.youtube.com/channel/UCG5Y4dwJi5436Gu6QH3nNUQ/livestreaming/stream', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${artDir}/cctv_default_stream_room.png` });

    const defaultRoomKey = await page.evaluate(() => {
      const inp = document.querySelector('input[type="password"]');
      const text = document.body.innerText;
      return {
        key: inp ? inp.value : null,
        hasData: text.includes('Doskonały') || text.includes('Dobra jakość'),
        isLive: text.includes('Zakończ transmisję')
      };
    });
    console.log('Default stream room (/livestreaming/stream):', defaultRoomKey);

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
