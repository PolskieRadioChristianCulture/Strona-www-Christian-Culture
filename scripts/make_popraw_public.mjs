import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function makePublic() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1400, height: 900 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();
  
  await page.goto('https://studio.youtube.com/video/rggnFJ6T32A/livestreaming', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  console.log('Looking for Edit button in room...');
  const editBtn = page.locator('button:has-text("Edytuj"), [aria-label="Edytuj"], ytcp-button:has-text("Edytuj")').first();
  if (await editBtn.isVisible()) {
    console.log('Clicking Edytuj...');
    await editBtn.click();
    await page.waitForTimeout(3000);

    console.log('Selecting Public...');
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible()) {
      await pubRadio.click({ force: true });
      await page.waitForTimeout(1000);
    }

    console.log('Saving...');
    const saveBtn = page.locator('#save-button, button:has-text("Zapisz"), ytcp-button:has-text("Zapisz")').first();
    if (await saveBtn.isVisible()) {
      await saveBtn.click({ force: true });
      await page.waitForTimeout(4000);
    }
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\popraw_public_success.png' });
  await browser.close();
}

makePublic().catch(console.error);
