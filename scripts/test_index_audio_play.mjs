import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to https://polskieradio.cc/ ...');
  await page.goto('https://polskieradio.cc/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check audio elements before click
  const getAudioState = async () => {
    return await page.evaluate(() => {
      const audios = Array.from(document.querySelectorAll('audio')).map(a => ({
        id: a.id,
        src: a.src,
        paused: a.paused,
        muted: a.muted,
        volume: a.volume
      }));
      const iframes = Array.from(document.querySelectorAll('iframe')).map(f => ({
        id: f.id,
        src: f.src,
        styleDisplay: window.getComputedStyle(f).display
      }));
      return { audios, iframes };
    });
  };

  console.log('Before play click:', await getAudioState());

  // Click play button in the hero promo / video box
  console.log('Clicking promoPlayBtn...');
  const promoBtn = page.locator('#promoPlayBtn');
  if (await promoBtn.count() > 0) {
    await promoBtn.click();
    console.log('promoPlayBtn clicked.');
  } else {
    console.log('promoPlayBtn not found');
  }

  await page.waitForTimeout(4000);

  console.log('After promo play click:', await getAudioState());

  // Check if frames or audio created
  const frameAudios = await page.evaluate(async () => {
    const results = [];
    for (const frame of window.frames) {
      try {
        const frameAudios = Array.from(frame.document.querySelectorAll('audio, video')).map(m => ({
          tag: m.tagName,
          id: m.id,
          src: m.src,
          paused: m.paused,
          muted: m.muted
        }));
        results.push({ frameName: frame.name || frame.location?.href, media: frameAudios });
      } catch (e) {
        results.push({ frameError: e.message });
      }
    }
    return results;
  });

  console.log('Frame media:', JSON.stringify(frameAudios, null, 2));

  await browser.close();
})();
