import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });

  const apiCalls = [];

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('/youtubei/v1/live_streaming') || url.includes('livestreaming')) {
      try {
        const text = await res.text();
        apiCalls.push({
          url: url.split('?')[0],
          status: res.status(),
          data: JSON.parse(text)
        });
      } catch (e) {
        // Not JSON
      }
    }
  });

  console.log('Navigating to livestreaming...');
  await page.goto('https://studio.youtube.com/video/KYSla9a5bjQ/livestreaming?approve_browser_access=true', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(5000);

  console.log(`Captured ${apiCalls.length} API calls:`);
  for (const call of apiCalls) {
    console.log(`\n>>> API: ${call.url} (${call.status})`);
    const s = JSON.stringify(call.data, null, 2);
    // Print snippet of data
    if (s.length > 1000) {
      console.log(s.slice(0, 1000) + '... [truncated]');
    } else {
      console.log(s);
    }
  }

  // Also check window.ytls or similar globals if any
  const clientState = await page.evaluate(() => {
    return {
      title: document.title,
      url: window.location.href,
      ytcfg: window.ytcfg ? window.ytcfg.get('EXPERIMENT_FLAGS') : null
    };
  });
  console.log('Client URL:', clientState.url);

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
