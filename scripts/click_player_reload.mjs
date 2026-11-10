import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/KYSla9a5bjQ/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Look for the reload button in the player
  console.log('Looking for reload button in player...');
  const reloadBtn = page.locator('ytls-player-renderer tp-yt-paper-icon-button[icon="yt-icons:refresh"], ytls-player-renderer button, [aria-label*="Odśwież"], [aria-label*="przeładuj"]').first();
  if (await reloadBtn.isVisible().catch(() => false)) {
    console.log('Clicking reload button in player...');
    await reloadBtn.click();
    await page.waitForTimeout(3000);
  }

  // Check the player status text
  const playerText = await page.evaluate(() => {
    const p = document.querySelector('ytls-player-renderer');
    return p ? p.innerText : null;
  });
  console.log('Player text:', playerText);

  // Check start stream button
  const startBtn = page.locator('#start-stream-button, [aria-label*="Transmituj na żywo"]').first();
  const isStartVisible = await startBtn.isVisible().catch(() => false);
  const isStartDisabled = await startBtn.getAttribute('disabled').catch(() => null);
  console.log('Start stream button: visible=', isStartVisible, 'disabled=', isStartDisabled);

  // Also check if there are any errors or warnings in the network or console
  const errors = await page.evaluate(() => {
    const errorEl = document.querySelector('.error-message, [error], ytls-stream-health-renderer .error');
    return errorEl ? errorEl.innerText : null;
  });
  console.log('Any error element:', errors);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\player_after_reload.png', fullPage: true });

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
