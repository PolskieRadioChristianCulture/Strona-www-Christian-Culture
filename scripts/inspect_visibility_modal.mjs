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

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_inspect_room.png' });

  // Find Edit button
  const editBtn = page.locator('ytcp-button:has-text("Edytuj")').first();
  if (await editBtn.isVisible()) {
    console.log('Clicking Edytuj...');
    await editBtn.click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_edit_modal.png' });

    // Inspect elements inside dialog
    const dialog = page.locator('ytcp-dialog, ytcp-video-metadata-editor, #dialog').first();
    console.log('Dialog visible:', await dialog.isVisible());

    // Search for visibility controls
    const visLabels = await page.locator('[aria-label*="idoczn"], [id*="visibility"], div:has-text("Widoczność")').allInnerTexts().catch(() => []);
    console.log('Visibility elements found:', visLabels.slice(0, 10));

    // Try finding visibility dropdown / button
    const visBtn = page.locator('#visibility-button, [aria-label*="idoczn"], ytcp-video-metadata-editor-basics [id*="visibility"]').first();
    console.log('visBtn count:', await visBtn.count());
  } else {
    console.log('Edytuj button not visible');
  }

  await browser.close();
}

run().catch(console.error);
