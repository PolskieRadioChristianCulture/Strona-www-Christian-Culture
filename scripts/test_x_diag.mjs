import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const profileDir = path.resolve('.x_browser_profile');
const envContent = fs.readFileSync('.env.local', 'utf8');
const tokenMatch = envContent.match(/X_AUTH_TOKEN=([^\r\n]+)/);
const token = tokenMatch ? tokenMatch[1].trim() : null;

console.log('Token exists:', !!token);

const context = await chromium.launchPersistentContext(profileDir, {
  channel: 'chrome',
  headless: true,
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
}).catch(() => chromium.launchPersistentContext(profileDir, { headless: true }));

if (token) {
  await context.addCookies([
    { name: 'auth_token', value: token, domain: '.x.com', path: '/', httpOnly: true, secure: true, sameSite: 'None' },
    { name: 'auth_token', value: token, domain: '.twitter.com', path: '/', httpOnly: true, secure: true, sameSite: 'None' }
  ]);
}

const page = await context.newPage();
console.log('Navigating to x.com/home...');
try {
  await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(5000);
  console.log('Current URL:', page.url());
  console.log('Page Title:', await page.title());
  await page.screenshot({ path: 'x_diag_screen.png' });
  console.log('Screenshot saved to x_diag_screen.png');

  const textareas = await page.locator('div[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]').count();
  console.log('Textareas found on home:', textareas);

  const postBtns = await page.locator('[data-testid="SideNav_NewTweet_Button"], a[href="/compose/post"]').count();
  console.log('SideNav post buttons found:', postBtns);
} catch (e) {
  console.error('Error during test:', e.message);
  await page.screenshot({ path: 'x_diag_screen_err.png' }).catch(() => {});
} finally {
  await context.close();
}
