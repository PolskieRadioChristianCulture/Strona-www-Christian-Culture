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

  console.log('Opening Robert room...');
  await page.goto('https://studio.youtube.com/video/pI5Ht1ntwLA/livestreaming', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  // Kliknij na element z tekstem "Niepubliczny"
  const privBadge = page.locator('div, span, a').filter({ hasText: /^Niepubliczny$/ }).first();
  console.log('privBadge visible:', await privBadge.isVisible());
  if (await privBadge.isVisible()) {
    await privBadge.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\clicked_priv_badge.png' });
  }

  // Sprawdźmy też jak to wygląda w Manage table
  await page.goto('https://studio.youtube.com/channel/UC34DD8FTh_y2GhZhg3qBaIQ/livestreaming/manage', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_manage_view.png' });

  await browser.close();
}

run().catch(console.error);
