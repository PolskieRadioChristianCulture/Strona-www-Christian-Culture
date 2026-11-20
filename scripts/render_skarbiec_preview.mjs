import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } });
  
  // Otwieramy lokalny plik Skarbca lub dodajemy parametr demo
  await page.goto('file:///C:/Users/czark/Christian_Culture_Projekty/CC_Skarbiec_Misji/public/index.html?demo=1', { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  // Zwiń gate jeśli jest
  await page.evaluate(() => {
    const gate = document.getElementById('gate');
    if (gate) gate.style.display = 'none';
    const main = document.querySelector('main');
    if (main) main.style.display = 'block';
  });

  const sec = page.locator('#miesiac').first();
  await sec.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/skarbiec_cal_day_preview.png' });
  console.log('Zrzut Dnia: skarbiec_cal_day_preview.png');

  // Kliknij "Cały miesiąc"
  const btnMonth = page.locator('#btnCalViewMonth').first();
  await btnMonth.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/skarbiec_cal_month_preview.png' });
  console.log('Zrzut Miesiąca: skarbiec_cal_month_preview.png');

  await browser.close();
}

main().catch(console.error);
