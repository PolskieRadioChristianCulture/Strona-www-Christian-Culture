import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function checkPoprawKorone() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1366, height: 768 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Navigating to channel switcher...');
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  const chBtn = page.locator('ytd-account-item-renderer').filter({ hasText: 'Popraw' }).first();
  if (await chBtn.isVisible()) {
    console.log('Clicking Popraw Koronę...');
    await chBtn.click();
    await page.waitForTimeout(5000);
  }

  console.log('Opening studio livestreaming...');
  await page.goto('https://studio.youtube.com/channel/UCquRtlfo1jrhZGO8LqFVllQ/livestreaming/manage', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\popraw_manage.png' });

  // Click row/title
  const titleLink = page.locator('#video-title, a[id="video-title"], [class*="video-title"]').first();
  if (await titleLink.isVisible()) {
    console.log('Clicking title link:', await titleLink.textContent());
    await titleLink.click();
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\popraw_room.png' });
  console.log('Page URL:', page.url());

  const goLiveBtn = page.locator('button:has-text("Transmituj na żywo"), ytcp-button:has-text("Transmituj na żywo")').first();
  if (await goLiveBtn.isVisible()) {
    console.log('Go live button isVisible=true, isEnabled=', await goLiveBtn.isEnabled());
  }

  await browser.close();
}

checkPoprawKorone().catch(console.error);
