import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/wieczor-ze-slowem-bozym-live.html?obs=1');
  await page.waitForTimeout(5500);
  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/wieczor_tonight_preview.png' });
  await browser.close();
  console.log('Preview saved successfully!');
}

main().catch(console.error);
