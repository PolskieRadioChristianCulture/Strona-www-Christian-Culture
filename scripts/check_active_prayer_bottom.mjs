import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const filePath = 'file:///' + path.resolve('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/master-live.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const frameInfo = await page.evaluate(() => {
    const a = document.getElementById('channel-frame-a');
    const b = document.getElementById('channel-frame-b');
    const activeFrame = a.classList.contains('active') ? a : b;
    let prayerBottom = null;
    let prayerOpacity = null;
    let prayerDisplay = null;
    if (activeFrame && activeFrame.contentDocument) {
      const p = activeFrame.contentDocument.getElementById('livePrayerOverlay');
      if (p) {
        prayerBottom = window.getComputedStyle(p).bottom;
        prayerOpacity = window.getComputedStyle(p).opacity;
        prayerDisplay = window.getComputedStyle(p).display;
      }
    }
    return {
      activeId: activeFrame.id,
      src: activeFrame.src,
      prayerBottom,
      prayerOpacity,
      prayerDisplay
    };
  });

  console.log('Active frame info:', frameInfo);
  await browser.close();
})();
