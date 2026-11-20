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

    const options = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('tp-yt-paper-item')).map(el => el.innerText.trim()).filter(Boolean);
    });
    console.log('CCTV Dropdown options:', options);
    await page.screenshot({ path: `${artDir}/cctv_dropdown_open.png` });

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
