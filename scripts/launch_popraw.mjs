import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_cc.jpg';
const CHANNEL_ID = 'UCquRtlfo1jrhZGO8LqFVllQ';
const CHANNEL_NAME = 'Popraw Koronę';
const TITLE = 'Popraw Koronę LIVE 🔴 24/7 | Christian Culture';

async function launchChannel() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1400, height: 900 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();

  console.log('1. Switching to @osobowośćPLUS...');
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const oItem = page.locator('ytd-account-item-renderer').filter({ hasText: 'Osobowość +' }).first();
  if (await oItem.isVisible()) {
    await oItem.click();
    await page.waitForTimeout(4000);
  }

  console.log(`2. Opening manage for ${CHANNEL_NAME}...`);
  await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/livestreaming/manage?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Check gate
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    await gate.click();
    await page.waitForTimeout(4000);
  }

  // Dismiss any overlay backdrop if present
  await page.evaluate(() => {
    document.querySelectorAll('tp-yt-iron-overlay-backdrop').forEach(el => el.remove());
  }).catch(() => {});

  console.log('3. Clicking Zaplanuj transmisję...');
  const scheduleBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
  await scheduleBtn.click();
  await page.waitForTimeout(4000);

  // Step 1: Details
  console.log('4. Filling title...');
  const titleBox = page.locator('#textbox[aria-label*="tytuł"], #textbox[aria-label*="title"], ytcp-social-suggestions-textbox #textbox').first();
  if (await titleBox.isVisible()) {
    await titleBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await titleBox.fill(TITLE);
    await page.waitForTimeout(1000);
  }

  console.log('5. Uploading thumbnail...');
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles(THUMBNAIL_PATH);
    console.log('Thumbnail uploaded in wizard');
    await page.waitForTimeout(2000);
  }

  console.log('6. Selecting Nieprzeznaczony dla dzieci...');
  const notForKids = page.locator('tp-yt-paper-radio-button:has-text("Nieprzeznaczony dla dzieci"), [aria-label*="Nieprzeznaczony dla dzieci"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKids.isVisible()) {
    await notForKids.click({ force: true });
    console.log('Clicked not for kids!');
    await page.waitForTimeout(1500);
  } else {
    console.log('Searching all radio buttons...');
    const radios = page.locator('tp-yt-paper-radio-button');
    const count = await radios.count();
    for (let i = 0; i < count; i++) {
      const txt = await radios.nth(i).innerText();
      if (txt.includes('Nieprzeznaczony')) {
        await radios.nth(i).click({ force: true });
        console.log('Clicked radio by text:', txt);
        break;
      }
    }
  }

  // Step wizard next buttons
  console.log('7. Clicking Dalej buttons...');
  for (let s = 1; s <= 3; s++) {
    const nextBtn = page.locator('#next-button, button:has-text("Dalej"), ytcp-button:has-text("Dalej")').first();
    if (await nextBtn.isVisible().catch(() => false)) {
      console.log(`Clicking Dalej step ${s}...`);
      await nextBtn.click({ force: true });
      await page.waitForTimeout(2500);
    }
  }

  // Visibility: Public
  console.log('8. Selecting Publiczny...');
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  if (await pubRadio.isVisible().catch(() => false)) {
    await pubRadio.click({ force: true });
    console.log('Selected Publiczny!');
    await page.waitForTimeout(1000);
  }

  console.log('9. Clicking Gotowe...');
  const doneBtn = page.locator('#done-button, button:has-text("Gotowe"), ytcp-button:has-text("Gotowe")').first();
  if (await doneBtn.isVisible().catch(() => false)) {
    await doneBtn.click({ force: true });
    console.log('Clicked Gotowe!');
    await page.waitForTimeout(8000);
  }

  // Close share modal if open
  const closeShare = page.locator('ytcp-button:has-text("Zamknij"), button:has-text("Zamknij"), #close-button').first();
  if (await closeShare.isVisible().catch(() => false)) {
    console.log('Closing share dialog...');
    await closeShare.click({ force: true });
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\popraw_after_wizard.png' });

  // Enter broadcast room from manage table
  console.log('10. Entering broadcast room from table...');
  const rowLink = page.locator('#video-title, [class*="video-title"], a[id="video-title"]').first();
  if (await rowLink.isVisible().catch(() => false)) {
    console.log('Clicking row link to enter room...');
    await rowLink.click({ force: true });
    await page.waitForTimeout(8000);
  }

  console.log('Entered room URL:', page.url());
  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\popraw_room_final.png' });

  // Check Go Live button
  console.log('11. Waiting 15s for stream signal...');
  await page.waitForTimeout(15000);

  const goLiveBtn = page.locator('button:has-text("Transmituj na żywo"), ytcp-button:has-text("Transmituj na żywo")').first();
  if (await goLiveBtn.isVisible().catch(() => false)) {
    const isEn = await goLiveBtn.isEnabled();
    console.log('Go Live button visible, enabled=', isEn);
    if (isEn) {
      await goLiveBtn.click({ force: true });
      console.log('CLICKED TRANSMITUJ NA ŻYWO!');
      await page.waitForTimeout(6000);
    }
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\popraw_success.png' });
  await browser.close();
}

launchChannel().catch(console.error);
