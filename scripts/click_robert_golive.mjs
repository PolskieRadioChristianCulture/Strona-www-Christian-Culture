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

  // Znajdź przycisk start-stream-button
  const startBtn = page.locator('#start-stream-button, button:has-text("Transmituj na żywo")').first();
  console.log('startBtn visible:', await startBtn.isVisible());
  console.log('startBtn isEnabled:', await startBtn.isEnabled());

  if (await startBtn.isEnabled()) {
    console.log('Clicking Transmituj na żywo...');
    await startBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_after_click_golive.png' });

    // Sprawdź czy jest modal potwierdzenia
    const confirmBtn = page.locator('ytcp-button:has-text("Transmituj na żywo"), ytcp-button:has-text("Rozpocznij"), #confirm-button').first();
    console.log('confirmBtn visible:', await confirmBtn.isVisible().catch(() => false));
    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click();
      console.log('Confirmed go live in dialog!');
      await page.waitForTimeout(4000);
    }
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_final_state.png' });

  await browser.close();
}

run().catch(console.error);
