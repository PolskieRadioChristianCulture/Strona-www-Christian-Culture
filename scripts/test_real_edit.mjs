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

  // Kliknij właściwy edit button: #edit-button
  const editBtn = page.locator('#edit-button').first();
  console.log('Edit button visible:', await editBtn.isVisible());
  if (await editBtn.isVisible()) {
    await editBtn.click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_real_edit_modal.png' });

    // Zbadaj elementy wewnątrz okna dialogowego edycji
    const textboxes = await page.locator('ytcp-dialog input, ytcp-dialog tp-yt-paper-radio-button, ytcp-dialog button, ytcp-dialog ytcp-button').all();
    console.log(`Found ${textboxes.length} interactive elements in dialog:`);
    for (let i = 0; i < textboxes.length; i++) {
      const txt = (await textboxes[i].innerText().catch(() => '')).trim();
      const id = await textboxes[i].getAttribute('id').catch(() => '');
      const name = await textboxes[i].getAttribute('name').catch(() => '');
      console.log(`dialog[${i}] id="${id}" name="${name}" txt="${txt.replace(/\n/g, ' ')}"`);
    }
  }

  await browser.close();
}

run().catch(console.error);
