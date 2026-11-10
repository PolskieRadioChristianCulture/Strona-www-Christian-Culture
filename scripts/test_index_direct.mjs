import { chromium } from 'playwright';

async function testClick() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto('https://polskieradio.cc/?_t=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const res = await page.evaluate(() => {
    const item = document.querySelector('[data-station-id="radio_cc_women"]');
    if (!item) return 'NOT_FOUND';
    item.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return {
      activeName: document.getElementById('activeStationName')?.innerText,
      status: document.getElementById('playerStatusText')?.innerText,
      track: document.getElementById('playerTrackTitle')?.innerText
    };
  });
  console.log('Result:', res);

  await page.waitForTimeout(2000);
  const statusAfter = await page.evaluate(() => ({
    status: document.getElementById('playerStatusText')?.innerText,
    track: document.getElementById('playerTrackTitle')?.innerText
  }));
  console.log('After 2s:', statusAfter);

  await browser.close();
}
testClick().catch(console.error);
