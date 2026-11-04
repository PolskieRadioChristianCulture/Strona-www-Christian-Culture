const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testFbSession() {
  const sessionPath = path.resolve('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/fb_session.json');
  if (!fs.existsSync(sessionPath)) {
    console.error("Brak pliku fb_session.json!");
    return;
  }
  const cookies = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 1000 },
    locale: 'pl-PL'
  });

  // Map cookies to Playwright format
  const validSameSite = new Set(['Strict', 'Lax', 'None']);
  const pwCookies = cookies.map(c => {
    const copy = { ...c };
    delete copy.sameParty;
    delete copy.sourceScheme;
    delete copy.sourcePort;
    if (!validSameSite.has(copy.sameSite)) {
      delete copy.sameSite;
    }
    return copy;
  });

  await context.addCookies(pwCookies);
  const page = await context.newPage();
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const title = await page.title();
  console.log("FB Page Title:", title);
  const isLogged = !(await page.$('input[name="email"]'));
  console.log("FB Is Logged:", isLogged);

  await browser.close();
}

testFbSession().catch(console.error);
