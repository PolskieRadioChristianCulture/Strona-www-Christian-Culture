import { launchStudio } from './yt_studio_session.mjs';

async function checkChannelStudio(channelFilter, outputScreenshot) {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    // Click avatar -> switch account
    const avatar = await page.$('#avatar-btn');
    if (avatar) {
      await avatar.click();
      await page.waitForTimeout(1500);

      const switchBtn = await page.$('tp-yt-paper-item:has-text("Przełącz konto"), tp-yt-paper-item:has-text("Switch account")');
      if (switchBtn) {
        await switchBtn.click();
        await page.waitForTimeout(2000);

        // Click the requested channel item
        const channelItem = await page.$(`ytd-account-item-renderer:has-text("${channelFilter}"), tp-yt-paper-item:has-text("${channelFilter}")`);
        if (channelItem) {
          console.log(`Switching to ${channelFilter}...`);
          await channelItem.click();
          await page.waitForTimeout(6000);
          console.log('Now on URL:', page.url());

          // Navigate to /livestreaming
          const channelUrl = page.url();
          const channelId = channelUrl.split('/channel/')[1]?.split('/')[0];
          console.log('Channel ID:', channelId);

          await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming`, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(6000);

          await page.screenshot({ path: `C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/${outputScreenshot}` });
          console.log(`Saved screenshot: ${outputScreenshot}`);

          // Read status text
          const status = await page.evaluate(() => {
            const el = document.querySelector('ytls-stream-status, .stream-status, #status');
            const goLive = document.querySelector('#go-live-button, [aria-label*="Rozpocznij" i]');
            const key = document.querySelector('input[type="password"]');
            return {
              status: el ? el.innerText.trim() : 'no status el',
              goLiveDisabled: goLive ? goLive.hasAttribute('disabled') : 'no btn',
              goLiveText: goLive ? goLive.innerText.trim() : '',
              keyVal: key ? key.value : 'no key'
            };
          });
          console.log(`Status details for ${channelFilter}:`, status);
        } else {
          console.log(`Channel ${channelFilter} not found in switch menu`);
        }
      }
    }
  } finally {
    await ctx.close();
  }
}

async function main() {
  console.log('=== Checking Katarzyna Fedków ===');
  await checkChannelStudio('katarzynafedkow', 'katarzyna_studio.png');
  console.log('\n=== Checking Top Seven ===');
  await checkChannelStudio('Top Seven', 'topseven_studio.png');
}

main().catch(console.error);
