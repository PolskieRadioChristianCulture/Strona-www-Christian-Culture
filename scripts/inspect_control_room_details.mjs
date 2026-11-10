import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  // Open directly to the video livestreaming URL
  await page.goto('https://studio.youtube.com/video/KYSla9a5bjQ/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  // Take screenshot of upper half
  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\control_room_full.png', fullPage: true });

  // Scroll settings section into view
  const settingsSection = page.locator('ytls-stream-settings, #stream-settings, .stream-settings').first();
  if (await settingsSection.isVisible().catch(() => false)) {
    await settingsSection.scrollIntoViewIfNeeded();
  }

  // Extract all toggles and their states
  const toggles = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button, ytcp-toggle'));
    return items.map(t => {
      // Find label nearby
      const parent = t.closest('.toggle-container, .setting-row, ytcp-settings-row') || t.parentElement;
      return {
        id: t.id,
        checked: t.hasAttribute('checked') || t.getAttribute('aria-checked') === 'true',
        disabled: t.hasAttribute('disabled') || t.getAttribute('aria-disabled') === 'true',
        text: (parent?.innerText || t.innerText || t.getAttribute('aria-label') || '').trim()
      };
    });
  });

  console.log('All toggles in Control Room:\n', JSON.stringify(toggles, null, 2));

  // Extract top action bar buttons (Go Live / Rozpocznij transmisję / etc.)
  const actionButtons = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, ytcp-button, tp-yt-paper-button'));
    return btns.map(b => ({
      text: (b.innerText || b.getAttribute('aria-label') || '').trim(),
      id: b.id,
      className: b.className,
      disabled: b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true',
      visible: b.offsetParent !== null
    })).filter(b => b.text && b.text.length < 50);
  });

  console.log('Action buttons:\n', JSON.stringify(actionButtons.filter(b => /start|transmis|live|zakończ|edytuj/i.test(b.text)), null, 2));

  // Check stream status element
  const streamStatus = await page.evaluate(() => {
    const el = document.querySelector('ytls-stream-status, .stream-status, #stream-status');
    return el ? el.innerText : 'None';
  });
  console.log('Stream status element:', streamStatus);

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
