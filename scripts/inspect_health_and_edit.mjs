import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warn') {
      console.log(`[Browser ${msg.type()}]:`, msg.text());
    }
  });

  await page.goto('https://studio.youtube.com/video/KYSla9a5bjQ/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  // Check feature discovery callout / popups and close them if any
  const closeBtn = page.locator('ytcp-feature-discovery-callout #close-button, ytcp-feature-discovery-callout button, [aria-label="Zamknij"]').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    console.log('Closing feature discovery callout...');
    await closeBtn.click();
    await page.waitForTimeout(1000);
  }

  // Check video elements in the players
  const videoElements = await page.evaluate(() => {
    const vids = Array.from(document.querySelectorAll('video'));
    return vids.map(v => ({
      src: v.src,
      currentSrc: v.currentSrc,
      paused: v.paused,
      currentTime: v.currentTime,
      readyState: v.readyState,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
      error: v.error ? v.error.message : null
    }));
  });
  console.log('Video elements:', JSON.stringify(videoElements, null, 2));

  // Check the "Stan transmisji na żywo" tab
  console.log('Clicking "Stan transmisji na żywo" tab...');
  const healthTab = page.locator('tp-yt-paper-tab:has-text("Stan transmisji na żywo"), [aria-label*="Stan transmisji"]').first();
  if (await healthTab.isVisible().catch(() => false)) {
    await healthTab.click();
    await page.waitForTimeout(3000);
    const healthText = await page.evaluate(() => {
      const panel = document.querySelector('ytls-stream-health-renderer, #health-panel, ytls-stream-health');
      return panel ? panel.innerText : document.body.innerText;
    });
    console.log('\n--- Stream Health Panel ---\n', healthText.slice(0, 800));
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\stream_health.png', fullPage: true });
  }

  // Check Auto-start in "Edytuj" metadata modal!
  console.log('Clicking "Edytuj" button...');
  const editBtn = page.locator('ytls-broadcast-metadata #edit-button, button:has-text("Edytuj")').first();
  if (await editBtn.isVisible().catch(() => false)) {
    await editBtn.click();
    await page.waitForTimeout(3000);
    const editModalText = await page.evaluate(() => {
      const modal = document.querySelector('ytcp-dialog, ytls-edit-broadcast-dialog');
      return modal ? modal.innerText : 'Modal not found';
    });
    console.log('\n--- Edit Dialog Text ---\n', editModalText.slice(0, 1000));
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\edit_modal.png', fullPage: true });

    // Look for toggles inside edit modal
    const modalToggles = await page.evaluate(() => {
      const modal = document.querySelector('ytcp-dialog, ytls-edit-broadcast-dialog');
      if (!modal) return [];
      return Array.from(modal.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button, ytcp-toggle')).map(t => ({
        id: t.id,
        text: (t.closest('.setting-row, ytcp-settings-row')?.innerText || t.innerText || t.getAttribute('aria-label') || '').trim(),
        checked: t.hasAttribute('checked') || t.getAttribute('aria-checked') === 'true'
      }));
    });
    console.log('Edit modal toggles:', modalToggles);
  }

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
