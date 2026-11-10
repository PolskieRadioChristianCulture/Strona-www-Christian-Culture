import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function dumpSwitcher() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1366, height: 768 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();
  
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\full_channel_switcher.png', fullPage: true });

  const items = await page.locator('ytd-account-item-renderer').all();
  console.log(`=== FOUND ${items.length} CHANNELS IN SWITCHER ===`);
  for (let i = 0; i < items.length; i++) {
    const text = await items[i].innerText();
    const clean = text.split('\n').map(s => s.trim()).filter(s => s.length > 0).join(' | ');
    console.log(`[${i + 1}] ${clean}`);
  }

  await browser.close();
}

dumpSwitcher().catch(console.error);
