import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

  try {
    await openChannelStudio(page, 'Osobowość +', '/livestreaming/manage');
    await page.waitForTimeout(3000);
    await page.goto('https://studio.youtube.com/video/Al56YdVI40c/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    const trigger = page.locator('ytls-ingestion-dropdown-trigger-renderer, [id="prefix"]:has-text("Klucz:")').first();
    await trigger.click();
    await page.waitForTimeout(2000);

    const defaultOption = page.locator('tp-yt-paper-item').filter({ hasText: /^Default stream key/i }).first();
    console.log('Default option found:', await defaultOption.isVisible().catch(() => false));
    if (await defaultOption.isVisible()) {
      await defaultOption.click();
      console.log('Clicked Default stream key!');
      await page.waitForTimeout(5000);
      await page.screenshot({ path: `${artDir}/osobowosc_after_default_key.png` });

      // Check if button "Transmituj na żywo" is now visible and active
      const btn = page.locator('button, ytcp-button').filter({ hasText: /^Transmituj na żywo$/ }).first();
      console.log('Go live button visible:', await btn.isVisible().catch(() => false));
      console.log('Go live button enabled:', await btn.isEnabled().catch(() => false));

      if (await btn.isEnabled().catch(() => false)) {
        await btn.click();
        console.log('Clicked Transmituj na żywo for Osobowość +!');
        await page.waitForTimeout(3000);
        const dialogBtn = page.locator('ytcp-button, button').filter({ hasText: /Transmituj na żywo|Rozpocznij/ }).last();
        if (await dialogBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
          await dialogBtn.click();
          await page.waitForTimeout(3000);
        }
      }
      await page.screenshot({ path: `${artDir}/osobowosc_final.png` });
    }

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
