import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function enterRoom() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1366, height: 768 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Opening Robert manage...');
  await page.goto('https://studio.youtube.com/channel/UC34DD8FTh_y2GhZhg3qBaIQ/livestreaming/manage', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  // Click on the title text directly
  const titleLink = page.locator('#video-title, a[id="video-title"], [class*="video-title"]').first();
  if (await titleLink.isVisible()) {
    console.log('Clicking title link:', await titleLink.textContent());
    await titleLink.click();
    await page.waitForTimeout(6000);
  } else {
    console.log('Clicking row thumbnail...');
    await page.locator('ytcp-video-thumbnail, img').first().click();
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_room.png' });
  console.log('Saved screenshot of live room');

  // Also check if stream key or connection status is visible
  const html = await page.content();
  console.log('Page URL:', page.url());
  console.log('Has Doskonałe połączenie:', html.includes('Doskonałe połączenie') || html.includes('Excellent connection'));
  console.log('Has Transmituj na żywo:', html.includes('Transmituj na żywo') || html.includes('Go live'));

  await browser.close();
}

enterRoom().catch(console.error);
