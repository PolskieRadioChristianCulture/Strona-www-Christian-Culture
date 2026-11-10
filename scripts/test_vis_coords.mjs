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

  await page.goto('https://studio.youtube.com/video/pI5Ht1ntwLA/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Znajdź sekcję Widoczność po tekście etykiety
  const visBlock = page.locator('div:has-text("Widoczność")').filter({ has: page.locator('text="Niepubliczny"') }).last();
  console.log('visBlock visible:', await visBlock.isVisible());

  // Kliknij po współrzędnych pola Widoczność: x=800, y=660
  // Sprawdźmy bounding box elementu z tekstem "Niepubliczny"
  const niepubText = page.locator('text="Niepubliczny"').first();
  const box = await niepubText.boundingBox();
  console.log('Niepubliczny box:', box);

  if (box) {
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    console.log('Clicked at coordinates!');
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\vis_clicked_coords.png' });

    // Kliknij radio PUBLIC
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
    console.log('pubRadio visible:', await pubRadio.isVisible());
    if (await pubRadio.isVisible()) {
      await pubRadio.click();
      await page.waitForTimeout(1000);

      // Kliknij Gotowe
      const doneBtn = page.locator('#done-button, ytcp-button:has-text("Gotowe")').first();
      await doneBtn.click();
      await page.waitForTimeout(1500);

      // Kliknij Zapisz
      const saveBtn = page.locator('#save, #save-button, ytcp-button:has-text("Zapisz")').first();
      console.log('saveBtn isEnabled:', await saveBtn.isEnabled());
      if (await saveBtn.isEnabled()) {
        await saveBtn.click();
        console.log('Clicked Save!');
        await page.waitForTimeout(5000);
      }
    }
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\vis_after_save_coords.png' });
  }

  await browser.close();
}

run().catch(console.error);
