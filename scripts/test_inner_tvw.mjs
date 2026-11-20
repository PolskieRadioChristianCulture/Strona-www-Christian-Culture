import { chromium } from 'playwright';

async function diagnoseInnerFrame() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  page.on('console', msg => console.log('INNER LOG:', msg.text()));
  page.on('pageerror', err => console.log('INNER ERROR:', err.message));

  console.log('Navigating directly to tvw-women-live.html...');
  await page.goto('https://polskieradio.cc/tvw-women-live.html?playlist=PLc4FTh2vwsrk&show=CC%20MARRIAGE&autoplay=1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);

  const state = await page.evaluate(() => {
    const iframe = document.querySelector('iframe#ytPlayer');
    const fb = document.getElementById('tvwFallback');
    return {
      iframeSrc: iframe?.src,
      fallbackOpacity: fb ? window.getComputedStyle(fb).opacity : 'none'
    };
  });
  console.log('Direct test state:', state);

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/direct_tvw_women_live.png' });
  await browser.close();
}

diagnoseInnerFrame().catch(console.error);
