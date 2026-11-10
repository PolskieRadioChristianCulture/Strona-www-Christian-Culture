import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function run() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    viewport: { width: 1400, height: 900 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();

  console.log('Opening Robert edit page...');
  await page.goto('https://studio.youtube.com/video/pI5Ht1ntwLA/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_current_edit_state.png' });

  const text = await page.locator('body').innerText();
  console.log('Contains Publiczny:', text.includes('Publiczny'));
  console.log('Contains Niepubliczny:', text.includes('Niepubliczny'));

  await browser.close();
}

run().catch(console.error);
