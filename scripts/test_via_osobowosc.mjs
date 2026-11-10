import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function testViaOsobowosc(channelId, channelName) {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1366, height: 768 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('1. Switching to @osobowośćPLUS...');
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  const oItem = page.locator('ytd-account-item-renderer').filter({ hasText: 'Osobowość +' }).first();
  if (await oItem.isVisible()) {
    console.log('Clicking Osobowość +...');
    await oItem.click();
    await page.waitForTimeout(5000);
  }

  console.log(`2. Opening Studio for ${channelName} (${channelId})...`);
  await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/manage?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  // Check gate
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    console.log('Passing gate...');
    await gate.click();
    await page.waitForTimeout(4000);
  }

  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  await page.screenshot({ path: `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\via_test_${channelName.replace(/\s+/g, '_')}.png` });

  const html = await page.content();
  console.log('Has Zaplanuj transmisję:', html.includes('Zaplanuj transmisję'));
  console.log('Has Ups nie masz uprawnień:', html.includes('nie masz uprawnień'));

  await browser.close();
}

testViaOsobowosc('UCquRtlfo1jrhZGO8LqFVllQ', 'Popraw Koronę').catch(console.error);
