import { chromium } from 'playwright';

async function run() {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto('https://youtube.com/live/Al56YdVI40c', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);
  const cookieBtn = p.locator('button:has-text("Odrzuć wszystko"), button:has-text("Zaakceptuj wszystko"), button:has-text("Accept all"), button:has-text("Reject all")').first();
  if (await cookieBtn.isVisible().catch(() => false)) await cookieBtn.click().catch(() => {});
  await p.waitForTimeout(2000);
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
  await p.screenshot({ path: `${artDir}/osobowosc_public_check_now.png` });
  const t = await p.evaluate(() => document.body.innerText);
  const isLive = t.includes('Rozpoczęło się') || t.includes('NA ŻYWO') || !t.includes('Czekam na');
  console.log('Al56YdVI40c isLive:', isLive);
  await b.close();
}

run().catch(console.error);
