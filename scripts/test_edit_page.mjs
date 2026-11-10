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

  console.log('Opening Robert video edit page directly...');
  await page.goto('https://studio.youtube.com/video/pI5Ht1ntwLA/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_video_edit_page.png' });

  // Szukaj sekcji widoczności
  const visSection = page.locator('#visibility, [id*="visibility"], div:has-text("Widoczność")').first();
  console.log('visSection visible:', await visSection.isVisible().catch(() => false));

  // Szukaj przycisku z napisem Niepubliczny
  const unlistedBtn = page.locator('button, ytcp-button, div').filter({ hasText: /^Niepubliczny$/ }).first();
  console.log('unlistedBtn visible:', await unlistedBtn.isVisible().catch(() => false));
  if (await unlistedBtn.isVisible().catch(() => false)) {
    console.log('Clicking unlistedBtn...');
    await unlistedBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_vis_dropdown.png' });

    // Wybierz Publiczny
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible().catch(() => false)) {
      await pubRadio.click();
      console.log('Selected Publiczny');
      await page.waitForTimeout(1000);
      const doneBtn = page.locator('#done-button, ytcp-button:has-text("Gotowe")').first();
      if (await doneBtn.isVisible().catch(() => false)) {
        await doneBtn.click();
        console.log('Clicked Gotowe');
        await page.waitForTimeout(1000);
      }
    }

    // Kliknij Zapisz
    const saveBtn = page.locator('#save, #save-button, ytcp-button:has-text("Zapisz")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      console.log('Clicked Zapisz');
      await page.waitForTimeout(4000);
    }
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_after_save_public.png' });
  }

  await browser.close();
}

run().catch(console.error);
