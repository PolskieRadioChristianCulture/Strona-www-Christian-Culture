import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

  // Desktop check
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  console.log('Navigating to https://polskieradio.cc/master (desktop)...');
  await page.goto('https://polskieradio.cc/master', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${artDir}/master_desktop.png` });

  // Mobile check
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  console.log('Navigating to https://polskieradio.cc/master (mobile)...');
  await mobilePage.goto('https://polskieradio.cc/master', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mobilePage.waitForTimeout(6000);
  await mobilePage.screenshot({ path: `${artDir}/master_mobile.png` });

  // Check what iframe is inside #master-screen or player
  const iframes = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('iframe')).map(f => ({
      id: f.id,
      className: f.className,
      src: f.src,
      visible: f.offsetWidth > 0 && f.offsetHeight > 0,
      width: f.offsetWidth,
      height: f.offsetHeight
    }));
  });
  console.log('Iframes on page:', iframes);

  await browser.close();
}

main().catch(console.error);
