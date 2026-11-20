import { launchStudio } from './yt_studio_session.mjs';

async function testWorship() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`\n========================================`);
    console.log(`Checking Worship LIVE CC stream tab...`);
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const channelCard = page.locator('ytd-account-item-renderer', { hasText: 'Worship LIVE CC' }).first();
    await channelCard.click();
    await page.waitForTimeout(4000);

    // Open avatar menu on youtube.com -> YouTube Studio
    await page.locator('button#avatar-btn').click();
    await page.waitForTimeout(1500);
    const studioLink = page.locator('ytd-compact-link-renderer:has-text("YouTube Studio")').first();
    await studioLink.click();
    await page.waitForTimeout(6000);

    // Click "Utwórz" -> "Transmituj na żywo"
    const createBtn = page.locator('#create-icon, button:has-text("Utwórz"), ytcp-button:has-text("Utwórz")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(1500);
      const goLiveMenuItem = page.locator('tp-yt-paper-item:has-text("Transmituj na żywo")').first();
      await goLiveMenuItem.click();
      await page.waitForTimeout(6000);
    }

    console.log('Now on livestreaming page. Clicking (x: 60, y: 100)...');
    await page.mouse.click(60, 100);
    await page.waitForTimeout(5000);

    console.log('After click, URL:', page.url());
    const ssPath = `C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/clicked_transmisja_worship.png`;
    await page.screenshot({ path: ssPath });
    console.log(`Saved screenshot to: ${ssPath}`);

    // Check page text
    const bodyText = await page.evaluate(() => document.body.innerText);
    const lines = bodyText.split('\n').map(s => s.trim()).filter(Boolean);
    console.log('Page visible text lines (top 20):', lines.slice(0, 20));

  } catch (err) {
    console.error(`Error:`, err.message);
  } finally {
    await ctx.close();
  }
}

testWorship();
