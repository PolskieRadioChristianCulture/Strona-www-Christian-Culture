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

  console.log('Opening Robert manage...');
  await page.goto('https://studio.youtube.com/channel/UC34DD8FTh_y2GhZhg3qBaIQ/livestreaming/manage', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  // Kliknij w komórkę widoczności w tabeli
  const visCell = page.locator('div, span, td, ytcp-badge').filter({ hasText: /Niepublicz/i }).first();
  console.log('visCell visible:', await visCell.isVisible());
  if (await visCell.isVisible()) {
    await visCell.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\manage_clicked_vis.png' });

    // Wybierz Publiczny
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    console.log('pubRadio visible:', await pubRadio.isVisible().catch(() => false));
    if (await pubRadio.isVisible().catch(() => false)) {
      await pubRadio.click();
      await page.waitForTimeout(1000);
      const saveBtn = page.locator('#save-button, button:has-text("Opublikuj"), button:has-text("Zapisz"), ytcp-button:has-text("Opublikuj")').first();
      console.log('saveBtn visible:', await saveBtn.isVisible().catch(() => false));
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(4000);
        console.log('✓ Published to PUBLIC!');
      }
    }
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\manage_after_publish.png' });
  }

  await browser.close();
}

run().catch(console.error);
