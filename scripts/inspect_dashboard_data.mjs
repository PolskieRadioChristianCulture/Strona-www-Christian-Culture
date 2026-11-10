import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });

  let dashboardData = null;

  page.on('response', async res => {
    if (res.url().includes('get_live_dashboard')) {
      try {
        dashboardData = await res.json();
      } catch (e) {}
    }
  });

  await page.goto('https://studio.youtube.com/video/PcczzAgsIto/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  if (dashboardData) {
    // Search for buttons, commands, or transitions in dashboardData
    const str = JSON.stringify(dashboardData);
    console.log('Dashboard data keys:', Object.keys(dashboardData));

    // Look for any command endpoints
    const regex = /"(\/youtubei\/v1\/live\/[^"]+)"/g;
    const endpoints = new Set();
    let m;
    while ((m = regex.exec(str)) !== null) {
      endpoints.add(m[1]);
    }
    console.log('Live endpoints found in dashboardData:\n', Array.from(endpoints));

    // Look for "autoStart" or "autoStop" or "enableAutoStart" in dashboardData
    const autoMatches = str.match(/[^"{},:]*auto[^"{},:]*/gi);
    console.log('Auto matches in dashboardData:', Array.from(new Set(autoMatches || [])).slice(0, 20));
    
    // Look for transition commands (start, goLive, etc.)
    const transitionMatches = str.match(/[^"{},:]*(start|live|transition)[^"{},:]*/gi);
    console.log('Transition matches:', Array.from(new Set(transitionMatches || [])).slice(0, 20));
  } else {
    console.log('No dashboardData captured.');
  }

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
