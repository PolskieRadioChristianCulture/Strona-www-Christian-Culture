import { chromium } from 'playwright';

async function testFull() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // 1. Test player.html
  console.log('Testing player.html on live site...');
  await page.goto('https://polskieradio.cc/player?_t=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const sideItem = page.locator('#side-item-ccwomen');
  await sideItem.click();
  await page.waitForTimeout(2000);

  const heroTitle = await page.locator('#hero-title').innerText();
  const heroBadge = await page.locator('#hero-badge-channel').innerText();
  const streamBadge = await page.locator('#stream-engine-badge').innerText();
  console.log('Player heroTitle:', heroTitle, '| HeroBadge:', heroBadge, '| Engine:', streamBadge);

  // 2. Test index.html
  console.log('Testing index.html on live site...');
  await page.goto('https://polskieradio.cc/?_t=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const dropBtn = page.locator('#stationDropdownBtn');
  await dropBtn.click();
  await page.waitForTimeout(500);

  const ccwItem = page.locator('[data-station-id="radio_cc_women"]');
  await ccwItem.click();
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    document.getElementById('playBtn').click();
  });
  await page.waitForTimeout(2500);

  const statusText = await page.locator('#playerStatusText').innerText();
  const trackTitle = await page.locator('#playerTrackTitle').innerText();
  console.log('Index status after play:', statusText, '| Track title:', trackTitle);

  await browser.close();
  console.log('All live tests complete!');
}

testFull().catch(console.error);
