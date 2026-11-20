import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const filePath = 'file:///' + path.resolve('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/zapolske-live.html').replace(/\\/g, '/');
  console.log('Loading zapolske-live:', filePath);

  await page.goto(filePath, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const res = await page.evaluate(() => {
    const overlay = document.getElementById('livePrayerOverlay');
    const comp = overlay ? window.getComputedStyle(overlay) : null;
    return {
      bottom: comp ? comp.bottom : null,
      left: comp ? comp.left : null
    };
  });

  console.log('zapolske-live livePrayerOverlay computed:', res);

  // Trigger display for visual screenshot
  await page.evaluate(() => {
    const overlay = document.getElementById('livePrayerOverlay');
    if (overlay) {
      overlay.style.opacity = '1';
      overlay.style.transform = 'translateY(0)';
    }
  });

  const screenshotPath = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/zapolske_overlay_fixed.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  await browser.close();
})();
