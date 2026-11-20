import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/wieczor-ze-slowem-bozym-live.html?obs=1');
  await page.waitForTimeout(1000);

  const rect = await page.evaluate(() => {
    const el = document.getElementById('ticker-text');
    const comp = window.getComputedStyle(el);
    const bounding = el.getBoundingClientRect();
    return {
      offsetWidth: el.offsetWidth,
      scrollWidth: el.scrollWidth,
      bounding: { x: bounding.x, y: bounding.y, width: bounding.width, height: bounding.height },
      transform: comp.transform,
      animation: comp.animation,
      animationPlayState: comp.animationPlayState
    };
  });
  console.log('Ticker at 1s:', rect);

  await page.waitForTimeout(5000);
  const rect2 = await page.evaluate(() => {
    const el = document.getElementById('ticker-text');
    const comp = window.getComputedStyle(el);
    const bounding = el.getBoundingClientRect();
    return {
      bounding: { x: bounding.x, y: bounding.y, width: bounding.width, height: bounding.height },
      transform: comp.transform
    };
  });
  console.log('Ticker at 6s:', rect2);

  await browser.close();
}

main();
