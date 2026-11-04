import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

async function testYtProfile() {
  const profileDir = 'C:/Users/czark/.youtube_browser_profile';
  console.log("Checking profile dir:", profileDir, "exists:", fs.existsSync(profileDir));
  
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  
  const page = await context.newPage();
  await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  
  const url = page.url();
  const title = await page.title();
  console.log("Current URL:", url);
  console.log("Page Title:", title);
  
  const isStudio = url.includes('studio.youtube.com') && !url.includes('accounts.google.com');
  console.log("Is Logged to Studio:", isStudio);
  
  await page.screenshot({ path: 'yt_real_profile_check.png' });
  await context.close();
}

testYtProfile().catch(console.error);
