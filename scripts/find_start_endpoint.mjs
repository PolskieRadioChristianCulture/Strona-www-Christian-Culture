import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });

  let dashboardData = null;
  page.on('response', async res => {
    if (res.url().includes('get_live_dashboard')) {
      try { dashboardData = await res.json(); } catch (e) {}
    }
  });

  await page.goto('https://studio.youtube.com/video/PcczzAgsIto/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  if (dashboardData) {
    // Search recursively for startStreamEndpoint
    function findKey(obj, target) {
      if (!obj || typeof obj !== 'object') return [];
      let results = [];
      for (const [k, v] of Object.entries(obj)) {
        if (k === target) results.push(v);
        if (typeof v === 'object') results.push(...findKey(v, target));
      }
      return results;
    }

    const startEndpoints = findKey(dashboardData, 'startStreamEndpoint');
    console.log('startStreamEndpoint details:\n', JSON.stringify(startEndpoints, null, 2));

    // Also look for start-stream-button or header buttons in dashboardData
    const headerBtns = findKey(dashboardData, 'headerRenderer');
    console.log('headerRenderer details:\n', JSON.stringify(headerBtns, null, 2).slice(0, 2000));
  }

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
