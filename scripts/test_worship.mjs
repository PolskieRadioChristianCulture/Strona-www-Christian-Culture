import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function testWorship() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1366, height: 768 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Switching to Worship LIVE CC...');
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  const chBtn = page.locator('ytd-account-item-renderer').filter({ hasText: 'Worship' }).first();
  if (await chBtn.isVisible()) {
    console.log('Clicking Worship...');
    await chBtn.click();
    await page.waitForTimeout(5000);
  }

  console.log('Opening manage...');
  await page.goto('https://studio.youtube.com/channel/UC62PrabNO4QTYtpCY282eUw/livestreaming/manage', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\worship_manage_check.png' });

  // Check rows
  const titleLinks = await page.locator('#video-title, [class*="video-title"]').all();
  console.log('Found title links:', titleLinks.length);
  for (const tl of titleLinks) {
    console.log('Title text:', await tl.textContent());
  }

  if (titleLinks.length > 0) {
    console.log('Clicking first title link...');
    await titleLinks[0].click();
    await page.waitForTimeout(8000);

    console.log('Current URL in room:', page.url());
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\worship_room_check.png' });

    // Check Go Live button
    const goLiveBtn = page.locator('button:has-text("Transmituj na żywo"), ytcp-button:has-text("Transmituj na żywo")').first();
    const isVisible = await goLiveBtn.isVisible();
    const isEnabled = isVisible ? await goLiveBtn.isEnabled() : false;
    console.log(`Go Live button: visible=${isVisible}, enabled=${isEnabled}`);
  }

  await browser.close();
}

testWorship().catch(console.error);
