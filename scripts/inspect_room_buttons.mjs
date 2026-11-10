import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function run() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    viewport: { width: 1400, height: 900 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();

  console.log('Opening Robert room...');
  await page.goto('https://studio.youtube.com/video/pI5Ht1ntwLA/livestreaming', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  // Znajdź przycisk edycji metadanych (nie układu pionowego)
  // Wyszukaj wszystkie przyciski i teksty
  const buttons = await page.locator('button, ytcp-button').all();
  console.log(`Found ${buttons.length} buttons:`);
  for (let i = 0; i < buttons.length; i++) {
    const txt = (await buttons[i].innerText().catch(() => '')).trim();
    const id = await buttons[i].getAttribute('id').catch(() => '');
    const aria = await buttons[i].getAttribute('aria-label').catch(() => '');
    if (txt || aria) {
      console.log(`[${i}] id="${id}" text="${txt.replace(/\n/g, ' ')}" aria="${aria}"`);
    }
  }

  // Sprawdź sekcję z tytułem i prywatnością
  const privLoc = page.locator('text="Niepubliczny"').first();
  console.log('Niepubliczny visible:', await privLoc.isVisible());

  await browser.close();
}

run().catch(console.error);
