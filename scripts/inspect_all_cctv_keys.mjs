import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

  try {
    await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
    await page.waitForTimeout(3000);
    await page.goto('https://studio.youtube.com/video/OGmZpYMGve4/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    // Look at the dropdown
    const trigger = page.locator('ytls-ingestion-dropdown-trigger-renderer, [id="prefix"]:has-text("Klucz:")').first();
    await trigger.click();
    await page.waitForTimeout(2000);

    // Click "Zarządzaj kluczami strumienia"
    const manageKeys = page.locator('tp-yt-paper-item').filter({ hasText: /Zarządzaj kluczami/i }).first();
    if (await manageKeys.isVisible()) {
      await manageKeys.click();
      await page.waitForTimeout(3000);

      // In the modal dialog, let's inspect each item and see what pencil button or copy button does
      const editButtons = page.locator('ytcp-dialog ytcp-icon-button[aria-label*="Edytuj"], ytcp-dialog button[aria-label*="Edytuj"], ytcp-dialog .edit-button, ytcp-dialog ytcp-icon-button:has(iron-icon[icon*="edit"])');
      const count = await editButtons.count();
      console.log('Edit buttons count:', count);

      await page.screenshot({ path: `${artDir}/cctv_modal_keys.png` });
    }

    // Now let's test each option in the dropdown and check the input value!
    await page.goto('https://studio.youtube.com/video/OGmZpYMGve4/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const trigger2 = page.locator('ytls-ingestion-dropdown-trigger-renderer, [id="prefix"]:has-text("Klucz:")').first();
    await trigger2.click();
    await page.waitForTimeout(2000);

    const options = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('tp-yt-paper-item'))
        .map(el => el.innerText.trim())
        .filter(t => t.includes('(RTMP'));
    });
    console.log('Dropdown key options:', options);

    for (const optName of options) {
      console.log(`\nTesting option: "${optName}"`);
      await trigger2.click();
      await page.waitForTimeout(1500);
      const item = page.locator('tp-yt-paper-item').filter({ hasText: optName }).first();
      await item.click();
      await page.waitForTimeout(4000);

      const keyVal = await page.evaluate(() => {
        const inp = document.querySelector('input[type="password"]');
        return inp ? inp.value : null;
      });
      console.log(`Key value for "${optName}":`, keyVal);

      // Check if data is incoming
      const statusText = await page.evaluate(() => document.body.innerText);
      const isGood = statusText.includes('Doskonały') || statusText.includes('Dobra jakość');
      console.log(`Incoming stream for "${optName}":`, isGood);
    }

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
