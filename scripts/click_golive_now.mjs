import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  console.log('Opening Studio for Christian Culture TV...');
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
  await page.waitForTimeout(3000);

  console.log('Navigating to room KdOBA_zRU0c...');
  await page.goto('https://studio.youtube.com/video/KdOBA_zRU0c/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  // Dismiss modal if present
  const gotoweBtn = page.locator('ytcp-button:has-text("Gotowe"), button:has-text("Gotowe")').first();
  if (await gotoweBtn.isVisible().catch(() => false)) {
    await gotoweBtn.click();
    await page.waitForTimeout(1500);
  }

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/room_state_now.png' });

  // Check buttons in header
  const headerButtons = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('ytls-header button, ytls-header ytcp-button, #start-stream-button, #end-stream-button'));
    return btns.map(b => ({
      text: b.innerText.replace(/\s+/g, ' ').trim(),
      id: b.id,
      disabled: b.disabled || b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true'
    }));
  });
  console.log('Header buttons:', headerButtons);

  // Click start stream button if enabled
  const startBtn = page.locator('#start-stream-button, ytcp-button:has-text("Transmituj na żywo")').first();
  if (await startBtn.isEnabled().catch(() => false)) {
    console.log('CLICKING "Transmituj na żywo" NOW!');
    await startBtn.click();
    await page.waitForTimeout(2000);

    const conf = page.locator('#confirm-button, button:has-text("Rozpocznij"), ytcp-button:has-text("Rozpocznij")').first();
    if (await conf.isVisible().catch(() => false)) {
      console.log('Confirming broadcast...');
      await conf.click();
      await page.waitForTimeout(4000);
    }
  }

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/room_state_final.png' });
  await ctx.close();
}

main().catch(console.error);
