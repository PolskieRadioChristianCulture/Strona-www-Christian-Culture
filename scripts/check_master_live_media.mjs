import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to https://polskieradio.cc/master-live.html?muted=0&autoplay=1&embed=1 ...');
  await page.goto('https://polskieradio.cc/master-live.html?muted=0&autoplay=1&embed=1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const mediaInfo = await page.evaluate(() => {
    const vids = Array.from(document.querySelectorAll('video, audio')).map(v => ({
      id: v.id,
      src: v.src,
      paused: v.paused,
      muted: v.muted,
      volume: v.volume,
      currentTime: v.currentTime
    }));
    const frames = Array.from(document.querySelectorAll('iframe')).map(f => ({
      id: f.id,
      className: f.className,
      src: f.src
    }));
    return { vids, frames };
  });

  console.log('Master-live media info:', JSON.stringify(mediaInfo, null, 2));

  // Let's also check console logs from the page
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await browser.close();
})();
