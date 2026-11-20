import { chromium } from 'playwright';

async function diagnoseTvw() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  page.on('console', msg => console.log('LOG:', msg.text()));

  await page.goto('https://polskieradio.cc/tvw', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const frames = page.frames();
  console.log('Frames count:', frames.length);
  for (const f of frames) {
    if (f.url().includes('tvw-women-live')) {
      const state = await f.evaluate(() => {
        const p = window.player;
        const fb = document.getElementById('tvwFallback');
        return {
          hasPlayer: !!p,
          playerState: p && p.getPlayerState ? p.getPlayerState() : 'none',
          currentVideoUrl: p && p.getVideoUrl ? p.getVideoUrl() : 'none',
          playlist: p && p.getPlaylist ? p.getPlaylist() : 'none',
          fallbackOpacity: fb ? window.getComputedStyle(fb).opacity : 'none',
          fallbackDisplay: fb ? window.getComputedStyle(fb).display : 'none'
        };
      });
      console.log('Frame tvw-women-live state:', state);
    }
  }

  await browser.close();
}

diagnoseTvw().catch(console.error);
