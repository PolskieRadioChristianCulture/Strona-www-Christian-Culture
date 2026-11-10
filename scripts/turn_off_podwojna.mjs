import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/KYSla9a5bjQ/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Close modal if present (click "Gotowe")
  const gotoweBtn = page.locator('button:has-text("Gotowe")').first();
  if (await gotoweBtn.isVisible().catch(() => false)) {
    console.log('Clicking "Gotowe"...');
    await gotoweBtn.click();
    await page.waitForTimeout(2000);
  }

  // Find "Podwójna transmisja" toggle
  const layoutToggle = page.locator('#layout-switch').first();
  const isChecked = await layoutToggle.evaluate(el => el.hasAttribute('checked') || el.getAttribute('aria-checked') === 'true');
  console.log('Layout switch is currently checked:', isChecked);

  if (isChecked) {
    console.log('Turning OFF "Podwójna transmisja"...');
    await layoutToggle.click();
    await page.waitForTimeout(3000);
    // Check if confirmation dialog appears
    const confirmBtn = page.locator('ytcp-confirmation-dialog #confirm-button, button:has-text("Wyłącz"), button:has-text("Potwierdź")').first();
    if (await confirmBtn.isVisible().catch(() => false)) {
      console.log('Confirming turn off...');
      await confirmBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  await page.waitForTimeout(5000);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\after_toggle_podwojna_off.png';
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Screenshot saved to:', shotPath);

  // Check action buttons now
  const buttons = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('ytls-header button, ytls-header ytcp-button'));
    return btns.map(b => ({
      text: (b.innerText || b.getAttribute('aria-label') || '').trim(),
      id: b.id,
      disabled: b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true',
      visible: b.offsetParent !== null
    }));
  });
  console.log('Top buttons after toggle OFF:\n', JSON.stringify(buttons, null, 2));

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
