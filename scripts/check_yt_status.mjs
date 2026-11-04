import { chromium } from 'playwright';
import path from 'node:path';

async function checkYt() {
  const profileDir = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/temp_chrome_profile';
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: true,
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();
  await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log("YouTube Studio Page Text Preview:");
  console.log(text.slice(0, 500));
  
  await page.screenshot({ path: 'yt_studio_current.png' });
  await context.close();
}

checkYt().catch(console.error);
