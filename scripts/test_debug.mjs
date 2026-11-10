import { chromium } from 'playwright';

async function testDebug() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('https://polskieradio.cc/?_t=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const debug = await page.evaluate(() => {
    const item = document.querySelector('#stationDropdownMenu [data-station-id="radio_cc_women"]');
    const btn = document.getElementById('stationDropdownBtn');
    if (btn) btn.click(); // Open dropdown
    if (item) item.click(); // Click item
    return {
      hasItem: !!item,
      activeStationName: document.getElementById('activeStationName')?.innerText,
      playerStatusText: document.getElementById('playerStatusText')?.innerText,
      playerTrackTitle: document.getElementById('playerTrackTitle')?.innerText
    };
  });
  console.log('Debug result:', debug);

  await page.waitForTimeout(3000);
  const statusLater = await page.evaluate(() => ({
    activeStationName: document.getElementById('activeStationName')?.innerText,
    playerStatusText: document.getElementById('playerStatusText')?.innerText,
    playerTrackTitle: document.getElementById('playerTrackTitle')?.innerText
  }));
  console.log('Status later:', statusLater);

  await browser.close();
}
testDebug().catch(console.error);
