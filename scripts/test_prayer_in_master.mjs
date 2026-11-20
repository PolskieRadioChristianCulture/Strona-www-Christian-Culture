import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const filePath = 'file:///' + path.resolve('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/master-live.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Switch frame to zapolske-live.html
  await page.evaluate(() => {
    const frame = document.getElementById('channel-frame-a');
    frame.src = 'zapolske-live.html?autoplay=1&in_mcr=1&noticker=1&safe_monetization=1';
  });

  await page.waitForTimeout(3000);

  await page.evaluate(() => {
    const frame = document.getElementById('channel-frame-a');
    if (frame && frame.contentDocument) {
      const doc = frame.contentDocument;
      const so = doc.getElementById('startOverlay');
      if (so) so.style.display = 'none';
      const overlay = doc.getElementById('livePrayerOverlay');
      if (overlay) {
        overlay.style.opacity = '1';
        overlay.style.transform = 'translateY(0)';
      }
    }
  });

  await page.waitForTimeout(1000);

  const bottom = await page.evaluate(() => {
    const frame = document.getElementById('channel-frame-a');
    if (frame && frame.contentDocument) {
      const p = frame.contentDocument.getElementById('livePrayerOverlay');
      return p ? window.getComputedStyle(p).bottom : null;
    }
    return null;
  });

  console.log('livePrayerOverlay computed bottom in master-live:', bottom);

  const screenshotPath = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/master_prayer_visible_raised.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  await browser.close();
})();
