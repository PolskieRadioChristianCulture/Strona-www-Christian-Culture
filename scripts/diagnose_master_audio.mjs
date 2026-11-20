import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  console.log('Navigating to https://polskieradio.cc/master-live ...');
  await page.goto('https://polskieradio.cc/master-live', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const audioState = await page.evaluate(() => {
    const fA = document.getElementById('channel-frame-a');
    const fB = document.getElementById('channel-frame-b');
    const active = fA && fA.classList.contains('active') ? fA : fB;

    let subMedia = [];
    if (active && active.contentDocument) {
      subMedia = Array.from(active.contentDocument.querySelectorAll('audio, video')).map(m => ({
        tag: m.tagName,
        id: m.id,
        src: m.src,
        paused: m.paused,
        muted: m.muted,
        volume: m.volume,
        readyState: m.readyState,
        error: m.error ? m.error.message : null
      }));
    }

    return {
      masterUrl: window.location.href,
      activeFrameSrc: active ? active.src : null,
      subMedia
    };
  });

  console.log('Audio state:', JSON.stringify(audioState, null, 2));

  await browser.close();
})();
