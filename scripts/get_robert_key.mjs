import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function getKey() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1366, height: 768 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();
  
  await page.goto('https://studio.youtube.com/video/pI5Ht1ntwLA/livestreaming', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Click the eye icon next to stream key
  const eyeBtn = page.locator('[aria-label*="Pokaż"], [aria-label*="Klucz transmisji"]').first();
  const copyBtn = page.locator('ytcp-button:has-text("Kopiuj"), button:has-text("Kopiuj")').first();

  // Or read the input value directly
  const keyInputs = await page.locator('input[type="password"], input[type="text"]').all();
  for (const input of keyInputs) {
    const val = await input.inputValue();
    const type = await input.getAttribute('type');
    const label = await input.getAttribute('aria-label');
    console.log(`Input: type=${type}, label=${label}, val=${val}`);
  }

  // Also check the dropdown "Klucz: Default stream key"
  const dropdown = page.locator('#stream-key-select, ytcp-select, [aria-label*="Klucz"]').first();
  if (await dropdown.isVisible()) {
    console.log('Dropdown text:', await dropdown.textContent());
  }

  await browser.close();
}

getKey().catch(console.error);
