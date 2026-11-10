import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('get_broadcast_status') || url.includes('get_live_dashboard')) {
      try {
        const data = await res.json();
        console.log(`\n========================================`);
        console.log(`Response from ${url}:`);
        console.log(JSON.stringify(data, null, 2));
      } catch (e) {}
    }
  });

  await page.goto('https://studio.youtube.com/video/PcczzAgsIto/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
