import { launchStudio } from './yt_studio_session.mjs';

async function checkKatarzynaRoom() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`\n========================================`);
    console.log(`Opening Katarzyna Fedków room uM2wTwxLck8...`);
    await page.goto('https://studio.youtube.com/video/uM2wTwxLck8/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    console.log('Room page URL:', page.url());
    console.log('Room page title:', await page.title());

    const ssPath = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/katarzyna_uM2_studio.png';
    await page.screenshot({ path: ssPath });
    console.log('Screenshot saved:', ssPath);

    const info = await page.evaluate(() => {
      const statusBadge = document.querySelector('ytls-stream-status, .stream-status, #status')?.innerText.trim();
      const keyInput = document.querySelector('input[type="password"]');
      const goLiveBtn = document.querySelector('#go-live-button, [aria-label*="Rozpocznij" i]');
      return {
        status: statusBadge || '',
        keyMasked: keyInput ? keyInput.value.slice(0, 4) + '...' + keyInput.value.slice(-4) : '',
        keyFull: keyInput ? keyInput.value : '',
        goLiveDisabled: goLiveBtn ? (goLiveBtn.hasAttribute('disabled') || goLiveBtn.getAttribute('aria-disabled') === 'true') : null,
        goLiveText: goLiveBtn ? goLiveBtn.innerText.trim() : null
      };
    });
    console.log('Details for uM2wTwxLck8:', info);

  } catch (err) {
    console.error('Error on Katarzyna Fedków room:', err.message);
  } finally {
    await ctx.close();
  }
}

checkKatarzynaRoom();
