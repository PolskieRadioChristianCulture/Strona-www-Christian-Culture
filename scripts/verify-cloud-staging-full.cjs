const { chromium } = require('playwright');

async function testLiveStaging() {
  const browser = await chromium.launch({ headless: true });

  // 1. Verify /audioteka
  console.log('Testing https://test-lumi-mess.polskieradio.pages.dev/audioteka...');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  const resp = await page.goto('https://test-lumi-mess.polskieradio.pages.dev/audioteka', { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('HTTP status /audioteka:', resp.status());
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'scratch/staging_cloud_audioteka_desktop.png', clip: { x: 0, y: 0, width: 1280, height: 900 } });
  console.log('Saved scratch/staging_cloud_audioteka_desktop.png');

  // Mobile /audioteka
  const ctxMob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
  const pageMob = await ctxMob.newPage();
  await pageMob.goto('https://test-lumi-mess.polskieradio.pages.dev/audioteka', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await pageMob.waitForTimeout(2000);
  await pageMob.screenshot({ path: 'scratch/staging_cloud_audioteka_mobile.png', clip: { x: 0, y: 0, width: 390, height: 844 } });
  console.log('Saved scratch/staging_cloud_audioteka_mobile.png');

  // 2. Verify Home Page Chat Drawer on Staging
  console.log('Testing Home Page Chat Drawer on https://test-lumi-mess.polskieradio.pages.dev...');
  await page.goto('https://test-lumi-mess.polskieradio.pages.dev', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  await page.evaluate(() => {
    if (window.CCGlobalChat && window.CCGlobalChat.open) window.CCGlobalChat.open();
  });
  await page.waitForTimeout(1500);

  const drawerEl = await page.$('.cc-chat-drawer');
  if (drawerEl) {
    await drawerEl.screenshot({ path: 'scratch/staging_cloud_chat_drawer_fixed.png' });
    console.log('Saved scratch/staging_cloud_chat_drawer_fixed.png');
  }

  const logoEl = await page.$('.cc-chat-header-logo-wrap');
  if (logoEl) {
    await logoEl.screenshot({ path: 'scratch/staging_cloud_chat_logo_fixed.png' });
    console.log('Saved scratch/staging_cloud_chat_logo_fixed.png');
  }

  await browser.close();
  console.log('Live cloud staging verification finished successfully!');
}

testLiveStaging().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
