import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/PcczzAgsIto/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const headerProps = await page.evaluate(() => {
    const h = document.querySelector('ytls-header');
    if (!h) return 'No header';

    const keys = [];
    for (const k in h) {
      if (typeof h[k] !== 'function') {
        try {
          keys.push({ key: k, value: h[k] });
        } catch (e) {}
      }
    }

    // Filter relevant keys
    const relevant = keys.filter(k => /stream|broadcast|status|state|can|is|live|button/i.test(k.key));
    return relevant;
  });

  console.log('Header props:\n', JSON.stringify(headerProps, null, 2));

  // Let's also check ytls-app or document.querySelector('ytls-app')
  const appProps = await page.evaluate(() => {
    const app = document.querySelector('ytls-app, ytcp-app');
    if (!app) return 'No app';
    const keys = [];
    for (const k in app) {
      if (typeof app[k] !== 'function' && /stream|broadcast|status|state|live/i.test(k)) {
        try { keys.push({ key: k, value: app[k] }); } catch (e) {}
      }
    }
    return keys;
  });
  console.log('App props:\n', JSON.stringify(appProps, null, 2));

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
