import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  await page.goto('https://youtube.com/live/z33rEkjNciY', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  const cookieBtn = page.locator('button:has-text("Odrzuć wszystko"), button:has-text("Zaakceptuj wszystko"), button:has-text("Accept all"), button:has-text("Reject all")').first();
  if (await cookieBtn.isVisible().catch(() => false)) {
    await cookieBtn.click().catch(() => {});
    await page.waitForTimeout(2000);
  }

  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
  await page.screenshot({ path: `${artDir}/robert_live_public_now.png` });

  const status = await page.evaluate(() => {
    const text = document.body.innerText;
    const isLive = text.includes('NA ŻYWO') || text.includes('LIVE') || text.includes('Rozpoczęło się');
    const isWaiting = text.includes('Czeka na') || text.includes('Zaplanowany');
    return { isLive, isWaiting, title: document.title };
  });

  console.log('Status publiczny dla Robert Łukasz Pio:', status);
  await browser.close();
}

main().catch(console.error);
