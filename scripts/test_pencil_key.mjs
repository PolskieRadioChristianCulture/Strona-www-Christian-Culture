import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

  try {
    await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
    await page.waitForTimeout(3000);
    await page.goto('https://studio.youtube.com/video/OGmZpYMGve4/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const trigger = page.locator('ytls-ingestion-dropdown-trigger-renderer, [id="prefix"]:has-text("Klucz:")').first();
    await trigger.click();
    await page.waitForTimeout(2000);

    const manageKeys = page.locator('tp-yt-paper-item').filter({ hasText: /Zarządzaj kluczami/i }).first();
    await manageKeys.click();
    await page.waitForTimeout(3000);

    // Click the first pencil icon
    const pencil = page.locator('ytcp-dialog iron-icon[icon*="edit"], ytcp-dialog button:has(iron-icon[icon*="edit"]), ytcp-dialog ytcp-icon-button:has(iron-icon[icon*="edit"])').first();
    console.log('Pencil visible:', await pencil.isVisible().catch(() => false));
    if (await pencil.isVisible()) {
      await pencil.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${artDir}/cctv_pencil_edit.png` });

      const modalInputs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('ytcp-dialog input, ytcp-dialog textarea')).map(i => ({
          id: i.id,
          placeholder: i.placeholder,
          value: i.value,
          disabled: i.disabled
        }));
      });
      console.log('Inputs in edit dialog:', modalInputs);
    }

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
