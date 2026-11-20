import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });

  try {
    await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
    await page.waitForTimeout(3000);
    await page.goto('https://studio.youtube.com/video/OGmZpYMGve4/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const trigger = page.locator('ytls-ingestion-dropdown-trigger-renderer, [id="prefix"]:has-text("Klucz:")').first();
    await trigger.click();
    await page.waitForTimeout(2000);

    // Click "Zarządzaj kluczami strumienia"
    const manageKeys = page.locator('tp-yt-paper-item').filter({ hasText: /Zarządzaj kluczami/i }).first();
    console.log('Manage keys visible:', await manageKeys.isVisible().catch(() => false));
    if (await manageKeys.isVisible()) {
      await manageKeys.click();
      await page.waitForTimeout(3000);

      const keysTable = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('ytcp-table-row, [role="row"], tr'));
        return rows.map(r => r.innerText.replace(/\n+/g, ' | '));
      });
      console.log('Keys table:', keysTable);

      const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
      await page.screenshot({ path: `${artDir}/cctv_manage_keys.png` });
    }
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
