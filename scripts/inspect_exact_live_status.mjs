import { launchStudio } from './yt_studio_session.mjs';

async function inspectChannel(targetTitle, expectedKeyPart) {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`\n========================================`);
    console.log(`Switching to: "${targetTitle}"`);
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const channelCard = page.locator('ytd-account-item-renderer', { hasText: targetTitle }).first();
    if (!(await channelCard.count())) {
      console.log(`ERROR: Channel "${targetTitle}" not found on switcher!`);
      return;
    }
    await channelCard.click();
    await page.waitForTimeout(5000);

    console.log('Now on YouTube URL:', page.url());

    // Go directly to YouTube Studio livestreaming
    await page.goto('https://studio.youtube.com/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    console.log('Livestreaming Studio URL:', page.url());

    // Screenshot
    const slug = targetTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 20);
    const ssPath = `C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/live_${slug}.png`;
    await page.screenshot({ path: ssPath });
    console.log(`Screenshot saved to: ${ssPath}`);

    // Inspect stream key, status, autostart, and go-live button
    const data = await page.evaluate(() => {
      const keyInput = document.querySelector('input[type="password"]');
      const keyVal = keyInput ? keyInput.value : '';
      const statusEl = document.querySelector('ytls-stream-status, .stream-status, #status, [class*="status"]');
      const goLiveBtn = document.querySelector('#go-live-button, [aria-label*="Rozpocznij" i]');
      const autostartEl = document.querySelector('tp-yt-paper-toggle-button[aria-label*="autostart" i], tp-yt-paper-toggle-button[aria-label*="uruchamianie" i]');
      const titleInput = document.querySelector('#title, input[aria-label*="Tytuł" i]');

      return {
        keyFound: !!keyInput,
        keyValMasked: keyVal ? keyVal.slice(0, 4) + '...' + keyVal.slice(-4) : '',
        keyFull: keyVal,
        statusText: statusEl ? statusEl.innerText.trim() : '',
        goLiveDisabled: goLiveBtn ? (goLiveBtn.hasAttribute('disabled') || goLiveBtn.getAttribute('aria-disabled') === 'true') : null,
        goLiveText: goLiveBtn ? goLiveBtn.innerText.trim() : null,
        autostartChecked: autostartEl ? autostartEl.getAttribute('aria-checked') : null,
        title: titleInput ? (titleInput.value || titleInput.innerText) : null
      };
    });

    console.log(`Details:`, {
      ...data,
      keyFull: data.keyFull ? data.keyFull.slice(0, 6) + '...' : ''
    });

    if (data.keyFull && expectedKeyPart) {
      console.log(`Stream Key matches expected [${expectedKeyPart}]?`, data.keyFull.includes(expectedKeyPart));
    }
    
    // Also check if stream is receiving signal
    const isReceiving = data.statusText.includes('Doskona') || data.statusText.includes('Dobra') || data.statusText.includes('TRWA');
    console.log(`Is YouTube receiving stream data? ${isReceiving ? 'YES' : 'NO'}`);

  } catch (err) {
    console.error(`Error on ${targetTitle}:`, err.message);
  } finally {
    await ctx.close();
  }
}

async function main() {
  // 1. Katarzyna Fedków (Aitum key: jzyz-3vc5-2sqz-wyz3-3e03)
  await inspectChannel('Katarzyna Fedków - Polska Muzyka Chrześcijańska', 'jzyz');

  // 2. Top Seven (Aitum key: sf0m-a6qa-e0q0-j7z8-493t)
  await inspectChannel('Top Seven', 'sf0m');

  // 3. Worship LIVE CC (Aitum key: dw66-xbfw-8wvz-4zya-75hd)
  await inspectChannel('Worship LIVE CC', 'dw66');

  // 4. Christian Culture Praise & Worship (just in case)
  await inspectChannel('Christian Culture Praise & Worship', 'dw66');
}

main().catch(console.error);
