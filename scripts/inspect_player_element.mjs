import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/PcczzAgsIto/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  // Inspect the player element
  const playerInfo = await page.evaluate(() => {
    const playerRenderer = document.querySelector('ytls-player-renderer');
    if (!playerRenderer) return 'No ytls-player-renderer';

    const video = playerRenderer.querySelector('video');
    const spinner = playerRenderer.querySelector('.spinner, ytcp-spinner, tp-yt-paper-spinner');
    const overlays = Array.from(playerRenderer.querySelectorAll('.overlay, .message, .status, .preview-message')).map(e => e.innerText);

    // Look for any iframe inside player
    const iframes = Array.from(playerRenderer.querySelectorAll('iframe')).map(f => f.src);

    return {
      text: playerRenderer.innerText,
      hasVideo: !!video,
      videoSrc: video ? video.src : null,
      videoError: video && video.error ? video.error.message : null,
      spinnerVisible: spinner ? spinner.offsetParent !== null : false,
      overlays,
      iframes
    };
  });

  console.log('Player info:\n', JSON.stringify(playerInfo, null, 2));

  // Check what happens if we look at the YouTube video player itself:
  // Is https://www.youtube.com/watch?v=PcczzAgsIto accessible?
  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
