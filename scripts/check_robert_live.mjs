import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function checkAndGoLive() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1366, height: 768 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Navigating directly to Robert broadcast room...');
  await page.goto('https://studio.youtube.com/video/pI5Ht1ntwLA/livestreaming', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_after_restart.png' });
  console.log('Saved screenshot after restart');

  const html = await page.content();
  console.log('Has Doskonałe połączenie:', html.includes('Doskonałe połączenie') || html.includes('Excellent connection') || html.includes('Doskonały'));

  const goLiveBtn = page.locator('button:has-text("Transmituj na żywo"), ytcp-button:has-text("Transmituj na żywo")').first();
  if (await goLiveBtn.isVisible()) {
    const isEnabled = await goLiveBtn.isEnabled();
    console.log('Go live button isVisible=true, isEnabled=', isEnabled);
    if (isEnabled) {
      console.log('Clicking Go Live button!');
      await goLiveBtn.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_success.png' });
    }
  }

  await browser.close();
}

checkAndGoLive().catch(console.error);
