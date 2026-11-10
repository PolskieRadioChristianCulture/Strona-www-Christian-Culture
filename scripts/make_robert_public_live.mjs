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

  console.log('Opening Robert edit page while LIVE...');
  await page.goto('https://studio.youtube.com/video/pI5Ht1ntwLA/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_edit_page.png' });

  // Kliknij w boks widoczności
  const unlistedBox = page.locator('#visibility, [id*="visibility-container"], div:has-text("Niepubliczny")').last();
  await unlistedBox.click();
  await page.waitForTimeout(1500);

  // Kliknij radio Publiczny za pomocą tekstu
  const pubRadio = page.locator('tp-yt-paper-radio-button, [role="radio"]').filter({ hasText: 'Publiczny' }).first();
  console.log('pubRadio count:', await pubRadio.count());
  await pubRadio.click({ force: true });
  await page.waitForTimeout(1000);

  // Kliknij Gotowe
  const doneBtn = page.locator('#done-button, ytcp-button:has-text("Gotowe")').first();
  console.log('doneBtn visible:', await doneBtn.isVisible());
  await doneBtn.click({ force: true });
  await page.waitForTimeout(2000);

  // Kliknij Zapisz
  const saveBtn = page.locator('#save, #save-button, ytcp-button:has-text("Zapisz")').first();
  console.log('saveBtn isEnabled:', await saveBtn.isEnabled());
  if (await saveBtn.isEnabled()) {
    await saveBtn.click({ force: true });
    console.log('Clicked Save!');
    await page.waitForTimeout(5000);
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_after_save.png' });

  await browser.close();
}

run().catch(console.error);
