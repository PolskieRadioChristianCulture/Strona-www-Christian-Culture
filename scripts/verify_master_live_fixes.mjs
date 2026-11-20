import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const filePath = 'file:///' + path.resolve('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/master-live.html').replace(/\\/g, '/');
  console.log('Loading:', filePath);

  await page.goto(filePath, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Trigger prayer overlay so it is visible for screenshot
  await page.evaluate(() => {
    const frame = document.getElementById('channel-frame-a');
    if (frame && frame.contentDocument) {
      const overlay = frame.contentDocument.getElementById('livePrayerOverlay');
      if (overlay) {
        overlay.style.opacity = '1';
        overlay.style.transform = 'translateY(0)';
      }
    }
  });

  await page.waitForTimeout(1000);

  const diag = await page.evaluate(() => {
    const title = document.querySelector('.dekalog-brand-title');
    const compTitle = title ? window.getComputedStyle(title) : null;

    const topTicker = document.querySelector('.dekalog-content');
    const compTop = topTicker ? window.getComputedStyle(topTicker) : null;

    const btmTicker = document.querySelector('.ccn-ticker-content');
    const compBtm = btmTicker ? window.getComputedStyle(btmTicker) : null;

    // Check frame left window position
    let leftWindowBottom = null;
    const frame = document.getElementById('channel-frame-a');
    if (frame && frame.contentDocument) {
      const overlay = frame.contentDocument.getElementById('livePrayerOverlay');
      if (overlay) {
        leftWindowBottom = window.getComputedStyle(overlay).bottom;
      }
    }

    return {
      titleText: title ? title.textContent.trim() : null,
      titleFontStyle: compTitle ? compTitle.fontStyle : null,
      titleFontWeight: compTitle ? compTitle.fontWeight : null,
      topTickerWillChange: compTop ? compTop.willChange : null,
      topTickerAnim: compTop ? compTop.animationName : null,
      btmTickerWillChange: compBtm ? compBtm.willChange : null,
      btmTickerAnim: compBtm ? compBtm.animationName : null,
      leftWindowBottom
    };
  });

  console.log('Diagnostic result:', JSON.stringify(diag, null, 2));

  const screenshotPath = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/master_live_fixed.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  await browser.close();
})();
