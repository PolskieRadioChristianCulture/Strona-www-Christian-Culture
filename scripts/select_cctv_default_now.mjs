import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

  try {
    await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
    await page.waitForTimeout(3000);
    await page.goto('https://studio.youtube.com/video/OGmZpYMGve4/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    const trigger = page.locator('ytls-ingestion-dropdown-trigger-renderer, [id="prefix"]:has-text("Klucz:")').first();
    await trigger.click();
    await page.waitForTimeout(2000);

    const defaultOption = page.locator('tp-yt-paper-item').filter({ hasText: /^Default stream key/i }).first();
    console.log('Default option visible:', await defaultOption.isVisible().catch(() => false));
    if (await defaultOption.isVisible()) {
      await defaultOption.click();
      console.log('Selected Default stream key!');
      await page.waitForTimeout(8000);

      await page.screenshot({ path: `${artDir}/cctv_default_selected.png` });

      const state = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          hasData: text.includes('Doskonały') || text.includes('Dobra jakość') || text.includes('Dobre połączenie'),
          noData: text.includes('Brak danych'),
          isLive: text.includes('Zakończ transmisję'),
          btnVisible: !!document.querySelector('button[aria-label="Transmituj na żywo"]'),
          btnDisabled: document.querySelector('button[aria-label="Transmituj na żywo"]')?.getAttribute('disabled')
        };
      });
      console.log('CCTV state after selecting Default key:', state);

      const btn = page.locator('button, ytcp-button').filter({ hasText: /^Transmituj na żywo$/ }).first();
      if (await btn.isEnabled().catch(() => false)) {
        await btn.click();
        console.log('CLICKED TRANSMITUJ NA ZYWO FOR CCTV!');
        await page.waitForTimeout(5000);
        await page.screenshot({ path: `${artDir}/cctv_live_success.png` });
      }
    }
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
