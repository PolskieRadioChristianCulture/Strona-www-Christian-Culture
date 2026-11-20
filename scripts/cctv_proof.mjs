import { chromium } from 'playwright';

async function test() {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto('https://youtube.com/live/OGmZpYMGve4', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);
  const cookieBtn = p.locator('button:has-text("Odrzuć wszystko"), button:has-text("Zaakceptuj wszystko"), button:has-text("Accept all"), button:has-text("Reject all")').first();
  if (await cookieBtn.isVisible().catch(() => false)) await cookieBtn.click().catch(() => {});
  await p.waitForTimeout(2000);
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
  await p.screenshot({ path: `${artDir}/cctv_final_public_proof.png` });
  const text = await p.evaluate(() => document.body.innerText);
  console.log('CCTV Text snippet:', text.slice(0, 300).replace(/\n+/g, ' '));
  await b.close();
}

test().catch(console.error);
