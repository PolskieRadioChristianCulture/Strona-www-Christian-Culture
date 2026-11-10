import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/channel/UCHmPxDM2zzlUAf5ZvlotPLw/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const cell = page.locator('text=Niepublicz').first();
  await cell.click();
  await page.waitForTimeout(1500);

  // Print all elements inside the popup dialog
  const popupInfo = await page.evaluate(() => {
    const dialog = document.querySelector('ytcp-video-metadata-visibility') || document.querySelector('tp-yt-paper-dialog') || document.querySelector('ytcp-dialog');
    return {
      tagName: dialog?.tagName,
      className: dialog?.className,
      innerHTML: dialog?.innerHTML?.slice(0, 1000)
    };
  });
  console.log('Popup info:', popupInfo);

  await ctx.close();
}

main().catch(console.error);
