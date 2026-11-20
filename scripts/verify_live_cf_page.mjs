import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  console.log('Navigating to live https://polskieradio.cc/master-live ...');
  await page.goto('https://polskieradio.cc/master-live', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const titleText = await page.evaluate(() => {
    const el = document.querySelector('.dekalog-brand-title');
    return el ? el.textContent.trim() : null;
  });

  console.log('Live title text:', titleText);

  const screenshotPath = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/live_cf_verified.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  await browser.close();
})();
