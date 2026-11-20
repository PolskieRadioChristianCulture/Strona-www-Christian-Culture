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

    const splitOption = page.locator('tp-yt-paper-item').filter({ hasText: /^Splitcam Streamkey/i }).first();
    if (await splitOption.isVisible().catch(() => false)) {
      await splitOption.click();
      console.log('Wybrano Splitcam Streamkey!');
      await page.waitForTimeout(6000);
      await page.screenshot({ path: `${artDir}/cctv_after_splitcam.png` });

      const state = await page.evaluate(() => {
        return {
          status: document.querySelector('#connection-status, .connection-status, ytls-header-renderer')?.innerText,
          btnVisible: !!document.querySelector('button[aria-label="Transmituj na żywo"]'),
          btnDisabled: document.querySelector('button[aria-label="Transmituj na żywo"]')?.getAttribute('disabled')
        };
      });
      console.log('State after Splitcam key:', state);
    }
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
