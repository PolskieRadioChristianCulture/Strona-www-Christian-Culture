import { launchStudio } from './yt_studio_session.mjs';

async function testChannel(channelName) {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`\n========================================`);
    console.log(`Testing Studio for: "${channelName}"`);
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
    console.log('Studio URL:', studioUrl);

    const slug = channelName.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 15);
    const ssPath = `C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/studio_${slug}.png`;
    await page.screenshot({ path: ssPath });
    console.log(`Screenshot saved: ${ssPath}`);

    // Try clicking 'Utwórz' -> 'Transmituj na żywo'
    const createBtn = page.locator('#create-icon, button:has-text("Utwórz"), ytcp-button:has-text("Utwórz")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(1500);
      const goLiveMenuItem = page.locator('tp-yt-paper-item:has-text("Transmituj na żywo"), [test-id="go-live"]').first();
      console.log('Can "Transmituj na żywo" be clicked?', await goLiveMenuItem.isVisible());
      if (await goLiveMenuItem.isVisible()) {
        await goLiveMenuItem.click();
        await page.waitForTimeout(6000);
        console.log('After clicking Transmituj na żywo, URL:', page.url());
        const liveSs = `C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/live_room_${slug}.png`;
        await page.screenshot({ path: liveSs });
        console.log(`Live room screenshot: ${liveSs}`);

        // Extract key and status
        const details = await page.evaluate(() => {
          const status = document.querySelector('ytls-stream-status, .stream-status, #status')?.innerText.trim();
          const key = document.querySelector('input[type="password"]')?.value;
          return { status, keyMasked: key ? key.slice(0, 4) + '...' + key.slice(-4) : 'none' };
        });
        console.log(`Live room details on ${channelName}:`, details);
      }
    }
  } catch (err) {
    console.error(`Error on ${channelName}:`, err.message);
  } finally {
    await ctx.close();
  }
}

async function main() {
  await testChannel('Top Seven');
  await testChannel('Worship LIVE CC');
}

main().catch(console.error);
