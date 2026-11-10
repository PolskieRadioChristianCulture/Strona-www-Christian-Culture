import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function checkChannel(page, name, channelId) {
  console.log(`\nChecking manage for ${name} (${channelId})...`);
  await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/manage?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  await page.screenshot({ path: `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\manage_${name.replace(/\s+/g, '_')}.png` });

  // Pokaż wszystkie linki i tytuły w tabeli
  const titles = await page.locator('#video-title, [class*="video-title"], a[href*="/livestreaming"], a[href*="/video/"]').all();
  console.log(`Found ${titles.length} title/stream links for ${name}:`);
  for (let i = 0; i < titles.length; i++) {
    const txt = (await titles[i].innerText().catch(() => '')).trim();
    const href = await titles[i].getAttribute('href').catch(() => '');
    console.log(`  [${i}] txt="${txt.replace(/\n/g, ' ')}" href="${href}"`);
  }
}

async function run() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    viewport: { width: 1400, height: 900 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();

  await checkChannel(page, 'Top Seven', 'UCdo_1-cjf5TEjSfEG_rxmyw');
  await checkChannel(page, 'CC Women', 'UC-LPFt-vmJCeap746DOWMgw');

  await browser.close();
}

run().catch(console.error);
