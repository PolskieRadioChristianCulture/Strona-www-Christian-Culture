import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function inspectRoom() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1366, height: 768 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Navigating to channel switcher to switch to Robert...');
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  const robertBtn = page.locator('ytd-account-item-renderer').filter({ hasText: 'Robert' }).first();
  if (await robertBtn.isVisible()) {
    console.log('Clicking Robert...');
    await robertBtn.click();
    await page.waitForTimeout(5000);
  }

  console.log('Opening studio manage...');
  await page.goto('https://studio.youtube.com/channel/UC34DD8FTh_y2GhZhg3qBaIQ/livestreaming/manage', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_manage_inspect2.png' });
  console.log('Saved screenshot of manage');

  // Find the broadcast row and click it
  const row = page.locator('ytls-manage-row, [role="row"], ytcp-video-row').first();
  if (await row.isVisible()) {
    console.log('Clicking broadcast row...');
    await row.click();
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_room_inspect2.png' });
    console.log('Saved screenshot of room');

    // Check Auto-start toggle or Go Live button
    const html = await page.content();
    console.log('Has Transmituj na żywo button:', html.includes('Transmituj na żywo') || html.includes('Go live'));
    console.log('Has Włącz automatyczny start:', html.includes('automatyczny start') || html.includes('Auto-start'));
  }

  await browser.close();
}

inspectRoom().catch(console.error);
