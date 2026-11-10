import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function waitDashboard() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1366, height: 768 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();
  
  await page.goto('https://studio.youtube.com/channel/UCquRtlfo1jrhZGO8LqFVllQ/livestreaming/dashboard', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(15000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\popraw_dashboard_loaded.png' });
  console.log('Saved loaded dashboard screenshot');

  const html = await page.content();
  console.log('Has Transmisja na żywo włączona:', html.includes('Transmisja na żywo'));
  console.log('Has 24 godziny / weryfikacja:', html.includes('24 godz') || html.includes('24h') || html.includes('kwalifikuje'));

  await browser.close();
}

waitDashboard().catch(console.error);
