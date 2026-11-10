import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function testProperSwitch(channelName) {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1366, height: 768 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();
  
  console.log(`Navigating to switcher to switch to ${channelName}...`);
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  // Find exact item in switcher
  const item = page.locator('ytd-account-item-renderer').filter({ hasText: channelName }).first();
  if (await item.isVisible()) {
    console.log(`Clicking item: ${channelName}...`);
    await item.click();
    await page.waitForTimeout(5000);
  } else {
    console.log(`Item ${channelName} not found!`);
  }

  // Open studio directly
  console.log('Opening studio.youtube.com directly...');
  await page.goto('https://studio.youtube.com/livestreaming/manage', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  const currentUrl = page.url();
  console.log('Opened Studio URL:', currentUrl);
  await page.screenshot({ path: `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\switch_test_${channelName.replace(/\s+/g, '_')}.png` });

  const html = await page.content();
  console.log('Has Zaplanuj transmisję:', html.includes('Zaplanuj transmisję'));
  console.log('Has Ups nie masz uprawnień:', html.includes('nie masz uprawnień'));

  await browser.close();
}

testProperSwitch('Popraw Koronę').catch(console.error);
