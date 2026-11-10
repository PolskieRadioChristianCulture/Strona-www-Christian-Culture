import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function startRobertLive() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1366, height: 768 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();
  
  console.log('Navigating directly to Robert broadcast room...');
  await page.goto('https://studio.youtube.com/video/pI5Ht1ntwLA/livestreaming', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Look for Edit button to change visibility and upload thumbnail
  console.log('Looking for Edit button...');
  const editBtn = page.locator('button:has-text("Edytuj"), [aria-label="Edytuj"], ytcp-button:has-text("Edytuj")').first();
  if (await editBtn.isVisible()) {
    console.log('Clicking Edytuj...');
    await editBtn.click();
    await page.waitForTimeout(3000);

    // Change to Public
    console.log('Checking visibility options...');
    const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], paper-radio-button[name="PUBLIC"], [aria-label*="Publiczny"]').first();
    if (await publicRadio.isVisible()) {
      console.log('Selecting Public...');
      await publicRadio.click();
      await page.waitForTimeout(1000);
    }

    // Upload thumbnail
    console.log('Checking thumbnail input...');
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Uploading thumbnail...');
      await fileInput.setInputFiles('C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_cc.jpg');
      await page.waitForTimeout(2000);
    }

    // Save
    const saveBtn = page.locator('#save-button, button:has-text("Zapisz"), ytcp-button:has-text("Zapisz")').first();
    if (await saveBtn.isVisible()) {
      console.log('Clicking Zapisz...');
      await saveBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  // Click Transmituj na żywo
  console.log('Looking for Transmituj na żywo button...');
  const goLiveBtn = page.locator('button:has-text("Transmituj na żywo"), ytcp-button:has-text("Transmituj na żywo"), [aria-label*="Transmituj na żywo"]').first();
  if (await goLiveBtn.isVisible()) {
    console.log('Clicking Transmituj na żywo!');
    await goLiveBtn.click();
    await page.waitForTimeout(5000);
  } else {
    console.log('Go live button not visible by exact text, searching by buttons...');
    const btns = await page.locator('button').allTextContents();
    console.log('All buttons:', btns.filter(t => t.trim().length > 0));
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_after_go_live.png' });
  console.log('Saved screenshot after go live attempt');

  await browser.close();
}

startRobertLive().catch(console.error);
