import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function openLiveStreamTab() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1366, height: 768 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Navigating directly to /livestreaming on Popraw Koronę...');
  await page.goto('https://studio.youtube.com/channel/UCquRtlfo1jrhZGO8LqFVllQ/livestreaming', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\popraw_livestreaming_tab.png' });
  console.log('Saved screenshot of livestreaming tab. Page URL:', page.url());

  const html = await page.content();
  console.log('Has Transmituj na żywo:', html.includes('Transmituj na żywo') || html.includes('Go live'));
  console.log('Has Włącz automatyczny start:', html.includes('automatyczny start'));
  console.log('Has Rozpocznij / Zaczynamy:', html.includes('Zaczynamy') || html.includes('Włącz'));

  await browser.close();
}

openLiveStreamTab().catch(console.error);
