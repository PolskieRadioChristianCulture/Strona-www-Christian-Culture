import { launchStudio } from './yt_studio_session.mjs';

async function checkStreamTab(channelName) {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`\n========================================`);
    console.log(`Opening "Transmisja" tab for: "${channelName}"`);
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const channelCard = page.locator('ytd-account-item-renderer', { hasText: channelName }).first();
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

    // Now click the "Transmisja" (stream) icon on the left sidebar
    console.log('Current URL before clicking Transmisja icon:', page.url());
    const streamNav = page.locator('tp-yt-paper-tab, ytls-navigation-item-renderer, [aria-label*="Transmisja" i], button[aria-label*="Transmisja" i]').first();
    // In YouTube Studio Livestreaming, the left sidebar icons are:
    // 1. Transmituj (stream) - button or tab
    // 2. Kamera internetowa (webcam)
    // 3. Zarządzaj (manage)
    const streamBtn = page.locator('ytls-navigation-item-renderer:nth-child(1), ytcp-navigation-item:nth-child(1), [aria-label="Transmisja"]').first();
    if (await streamBtn.isVisible()) {
      console.log('Clicking "Transmisja" nav icon...');
      await streamBtn.click();
      await page.waitForTimeout(6000);
    }

    console.log('URL on Transmisja tab:', page.url());

    const slug = channelName.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 15);
    const ssPath = `C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/stream_tab_${slug}.png`;
    await page.screenshot({ path: ssPath });
    console.log(`Saved screenshot: ${ssPath}`);

    const info = await page.evaluate(() => {
      const statusBadge = document.querySelector('ytls-stream-status, .stream-status, #status')?.innerText.trim();
      const keyInput = document.querySelector('input[type="password"]');
      const goLiveBtn = document.querySelector('#go-live-button, [aria-label*="Rozpocznij" i]');
      const autostart = document.querySelector('tp-yt-paper-toggle-button[aria-label*="autostart" i], tp-yt-paper-toggle-button[aria-label*="uruchamianie" i]')?.getAttribute('aria-checked');
      return {
        statusBadge,
        keyValMasked: keyInput ? keyInput.value.slice(0, 4) + '...' + keyInput.value.slice(-4) : 'none',
        keyFull: keyInput ? keyInput.value : '',
        goLiveDisabled: goLiveBtn ? (goLiveBtn.hasAttribute('disabled') || goLiveBtn.getAttribute('aria-disabled') === 'true') : null,
        goLiveText: goLiveBtn ? goLiveBtn.innerText.trim() : null,
        autostart
      };
    });
    console.log('Stream tab info:', info);

  } catch (err) {
    console.error(`Error on ${channelName}:`, err.message);
  } finally {
    await ctx.close();
  }
}

async function main() {
  await checkStreamTab('Top Seven');
  await checkStreamTab('Worship LIVE CC');
}

main().catch(console.error);
