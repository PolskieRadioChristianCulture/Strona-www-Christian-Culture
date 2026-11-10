import { chromium } from 'playwright';

async function testConsole() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));

  await page.goto('https://polskieradio.cc/?_t=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  console.log('Clicking radio_cc_women...');
  await page.evaluate(() => {
    const item = document.querySelector('[data-station-id="radio_cc_women"]');
    if (item) item.click();
  });

  await page.waitForTimeout(4000);
  const status = await page.evaluate(() => ({
    activeName: document.getElementById('activeStationName')?.innerText,
    status: document.getElementById('playerStatusText')?.innerText,
    track: document.getElementById('playerTrackTitle')?.innerText
  }));
  console.log('Status after click:', status);

  await browser.close();
}
testConsole().catch(console.error);
