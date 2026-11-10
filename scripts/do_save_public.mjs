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

  console.log('Opening Robert edit page...');
  await page.goto('https://studio.youtube.com/video/pI5Ht1ntwLA/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // 1. Otwórz dropdown widoczności
  const trigger = page.locator('#visibility-button, div[role="button"]:has-text("Niepubliczny")').first();
  await trigger.click();
  await page.waitForTimeout(1500);

  // 2. Kliknij radio PUBLIC
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
  await pubRadio.click();
  await page.waitForTimeout(1000);
  console.log('Clicked PUBLIC radio');

  // 3. Kliknij Gotowe w popupie
  const doneBtn = page.locator('ytcp-button#done-button, ytcp-button:has-text("Gotowe")').first();
  await doneBtn.click();
  await page.waitForTimeout(1500);
  console.log('Clicked Gotowe');

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\step3_after_done.png' });

  // 4. Kliknij Zapisz na górze strony
  const saveBtn = page.locator('ytcp-button#save, #save-button, ytcp-button:has-text("Zapisz")').first();
  console.log('saveBtn isEnabled:', await saveBtn.isEnabled());
  await saveBtn.click();
  console.log('Clicked Save');
  await page.waitForTimeout(6000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\step4_after_save.png' });

  await browser.close();
}

run().catch(console.error);
