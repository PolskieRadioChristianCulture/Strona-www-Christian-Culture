import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });

  const calls = [];
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('youtube.com') && (url.includes('api') || url.includes('live') || url.includes('broadcast') || url.includes('stream') || url.includes('video'))) {
      if (!url.endsWith('.js') && !url.endsWith('.css') && !url.endsWith('.png') && !url.endsWith('.jpg') && !url.endsWith('.woff2')) {
        calls.push({
          method: res.request().method(),
          url: url.slice(0, 120),
          status: res.status()
        });
      }
    }
  });

  await page.goto('https://studio.youtube.com/video/PcczzAgsIto/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  console.log(`Captured ${calls.length} relevant network calls:`);
  console.log(JSON.stringify(calls, null, 2));

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
