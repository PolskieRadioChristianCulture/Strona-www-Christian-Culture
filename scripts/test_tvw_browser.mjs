import { chromium } from 'playwright';

async function testTvw() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to https://polskieradio.cc/tvw...');
  await page.goto('https://polskieradio.cc/tvw', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);

  const fallbackOpacity = await page.evaluate(() => {
    const f = document.getElementById('tvwFallback');
    const b = document.getElementById('tvwBumper');
    const iframeA = document.getElementById('channel-frame-a');
    const iframeB = document.getElementById('channel-frame-b');
    return {
      bumperClass: b?.className,
      frameASrc: iframeA?.src,
      frameBSrc: iframeB?.src
    };
  });
  console.log('TVW State:', fallbackOpacity);

  // Check inside frame A
  const frameA = page.frame({ url: /tvw-women-live/ });
  if (frameA) {
    const frameState = await frameA.evaluate(() => {
      const fb = document.getElementById('tvwFallback');
      return {
        fallbackOpacity: fb ? window.getComputedStyle(fb).opacity : 'no el',
        title: document.getElementById('tvwTitle')?.textContent,
        show: document.getElementById('tvwShow')?.textContent
      };
    });
    console.log('Frame A state:', frameState);
  }

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/tvw_playwright_test.png' });
  await browser.close();
}

testTvw();
