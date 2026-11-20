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

    const createNew = page.locator('tp-yt-paper-item').filter({ hasText: /Utwórz nowy klucz/i }).first();
    console.log('Create new key visible:', await createNew.isVisible().catch(() => false));
    if (await createNew.isVisible()) {
      await createNew.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${artDir}/create_new_key_dialog.png` });

      const dialogFields = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('ytcp-dialog input, ytcp-dialog textarea, ytcp-dialog tp-yt-paper-input')).map(el => ({
          tag: el.tagName,
          label: el.getAttribute('label') || el.getAttribute('aria-label'),
          id: el.id
        }));
      });
      console.log('Dialog fields:', dialogFields);
    }
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
