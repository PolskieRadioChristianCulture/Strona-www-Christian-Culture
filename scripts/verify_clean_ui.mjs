import { chromium } from 'playwright';
import path from 'path';

async function verifyCleanUI() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('https://polskieradio.cc/?_t=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Click dropdown & select CC Women
  await page.evaluate(() => {
    const btn = document.getElementById('stationDropdownBtn');
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);

  await page.evaluate(() => {
    const item = document.querySelector('#stationDropdownMenu [data-station-id="radio_cc_women"]');
    if (item) item.click();
  });
  await page.waitForTimeout(4000);

  const status = await page.evaluate(() => {
    const el = document.getElementById('playerStatusText');
    return {
      text: el ? el.innerText : null,
      display: el ? window.getComputedStyle(el).display : null,
      visibility: el ? window.getComputedStyle(el).visibility : null,
      activeStation: document.getElementById('activeStationName')?.innerText,
      trackTitle: document.getElementById('playerTrackTitle')?.innerText
    };
  });
  console.log('Verified player status on production:', status);

  const artifactDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
  await page.screenshot({ path: path.join(artifactDir, 'cc_women_bottom_player_clean.png') });

  // Also take a focused crop of the bottom bar
  const bar = await page.$('#radioPlayerBar');
  if (bar) {
    await bar.screenshot({ path: path.join(artifactDir, 'bottom_player_bar_clean.png') });
  }

  await browser.close();
  console.log('Clean UI screenshots captured successfully!');
}
verifyCleanUI().catch(console.error);
