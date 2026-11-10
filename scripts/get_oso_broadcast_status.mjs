import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });

  await openChannelStudio(page, 'Osobowość +', '/livestreaming/dashboard');
  await page.waitForTimeout(3000);

  let statusData = null;
  let dashboardData = null;

  page.on('response', async res => {
    if (res.url().includes('get_broadcast_status')) {
      try { statusData = await res.json(); } catch (e) {}
    }
    if (res.url().includes('get_live_dashboard')) {
      try { dashboardData = await res.json(); } catch (e) {}
    }
  });

  await page.goto('https://studio.youtube.com/video/KYSla9a5bjQ/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  console.log('Status Data for KYSla9a5bjQ:\n', JSON.stringify(statusData?.broadcastStatus, null, 2));

  // Check action buttons in header
  const btns = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('ytls-header button, ytls-header ytcp-button'));
    return list.map(b => ({
      text: (b.innerText || b.getAttribute('aria-label') || '').trim(),
      id: b.id,
      outer: b.outerHTML.slice(0, 150)
    }));
  });
  console.log('Header buttons:\n', JSON.stringify(btns, null, 2));

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
