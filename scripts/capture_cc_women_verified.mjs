import { chromium } from 'playwright';
import path from 'path';

async function captureScreens() {
  const browser = await chromium.launch({ headless: true });
  const artifactDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
  
  // 1. Homepage
  const page1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page1.goto('https://polskieradio.cc/?_t=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page1.waitForTimeout(3000);

  // Open dropdown
  await page1.evaluate(() => {
    const btn = document.getElementById('stationDropdownBtn');
    if (btn) btn.click();
  });
  await page1.waitForTimeout(1000);
  await page1.screenshot({ path: path.join(artifactDir, 'cc_women_live_dropdown.png') });

  // Select CC Women
  await page1.evaluate(() => {
    const item = document.querySelector('#stationDropdownMenu [data-station-id="radio_cc_women"]');
    if (item) item.click();
  });
  await page1.waitForTimeout(4000);
  await page1.screenshot({ path: path.join(artifactDir, 'cc_women_bottom_player_playing.png') });

  // 2. Player page
  const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page2.goto('https://polskieradio.cc/player?_t=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page2.waitForTimeout(3000);
  await page2.evaluate(() => {
    window.playStation('ccwomen');
  });
  await page2.waitForTimeout(4000);
  await page2.screenshot({ path: path.join(artifactDir, 'cc_women_player_playing.png') });

  await browser.close();
  console.log('Screenshots captured successfully!');
}
captureScreens().catch(console.error);
