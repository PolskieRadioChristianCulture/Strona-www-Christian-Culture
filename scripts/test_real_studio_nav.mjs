import { launchStudio } from './yt_studio_session.mjs';

async function testOpenStudio(channelName) {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`\n========================================`);
    console.log(`Testing navigation to Studio for: "${channelName}"`);
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const channelCard = page.locator('ytd-account-item-renderer', { hasText: channelName }).first();
    await channelCard.click();
    await page.waitForTimeout(4000);

    // Open avatar menu on youtube.com
    await page.locator('button#avatar-btn').click();
    await page.waitForTimeout(1500);

    // Click YouTube Studio link
    const studioLink = page.locator('ytd-compact-link-renderer:has-text("YouTube Studio")').first();
    await studioLink.click();
    await page.waitForTimeout(6000);

    const studioUrl = page.url();
    console.log('Navigated to Studio URL:', studioUrl);

    // Now go to livestreaming
    const baseStudioUrl = studioUrl.split('?')[0].replace(/\/+$/, '');
    await page.goto(`${baseStudioUrl}/livestreaming`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    console.log('Now on livestreaming URL:', page.url());

    const slug = channelName.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 15);
    const ssPath = `C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/real_studio_${slug}.png`;
    await page.screenshot({ path: ssPath });
    console.log(`Screenshot saved: ${ssPath}`);

    const details = await page.evaluate(() => {
      const title = document.title;
      const streamStatus = document.querySelector('ytls-stream-status, .stream-status, #status, ytcp-badge')?.innerText.trim();
      const keyVal = document.querySelector('input[type="password"]')?.value;
      const goLive = document.querySelector('#go-live-button')?.innerText.trim();
      const autostart = document.querySelector('tp-yt-paper-toggle-button[aria-label*="autostart" i], tp-yt-paper-toggle-button[aria-label*="uruchamianie" i]')?.getAttribute('aria-checked');
      return { title, streamStatus, keyValMasked: keyVal ? keyVal.slice(0, 4) + '...' + keyVal.slice(-4) : '', goLive, autostart };
    });
    console.log('Details:', details);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await ctx.close();
  }
}

async function main() {
  await testOpenStudio('Katarzyna Fedków - Polska Muzyka Chrześcijańska');
}
main();
