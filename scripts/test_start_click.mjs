import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/PcczzAgsIto/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Close modals
  const gotoweBtn = page.locator('button:has-text("Gotowe"), button:has-text("Zamknij")').first();
  if (await gotoweBtn.isVisible().catch(() => false)) {
    console.log('Closing modal...');
    await gotoweBtn.click();
    await page.waitForTimeout(1500);
  }

  // Turn off layout switch if checked
  const layoutToggle = page.locator('#layout-switch').first();
  if (await layoutToggle.isVisible().catch(() => false)) {
    const isChecked = await layoutToggle.evaluate(el => el.hasAttribute('checked') || el.getAttribute('aria-checked') === 'true');
    if (isChecked) {
      console.log('Turning OFF layout switch...');
      await layoutToggle.click();
      await page.waitForTimeout(2000);
      const confirmBtn = page.locator('ytcp-confirmation-dialog #confirm-button, button:has-text("Wyłącz")').first();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  }

  // Check state of start-stream-button
  const btnState = await page.evaluate(() => {
    const btn = document.querySelector('#start-stream-button');
    if (!btn) return 'btn not found';
    return {
      outerHTML: btn.outerHTML,
      disabled: btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true',
      hidden: btn.hasAttribute('hidden') || btn.hidden
    };
  });
  console.log('Start button state:', JSON.stringify(btnState, null, 2));

  // What happens if we click #start-stream-button or button inside it?
  const clicked = await page.evaluate(() => {
    const btn = document.querySelector('#start-stream-button');
    if (!btn) return 'not found';
    btn.removeAttribute('hidden');
    btn.removeAttribute('disabled');
    btn.setAttribute('aria-disabled', 'false');
    const innerBtn = btn.querySelector('button');
    if (innerBtn) {
      innerBtn.removeAttribute('disabled');
      innerBtn.removeAttribute('aria-disabled');
      innerBtn.click();
      return 'clicked inner button';
    }
    btn.click();
    return 'clicked ytcp-button';
  });
  console.log('Click result:', clicked);

  await page.waitForTimeout(4000);

  const shot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\after_start_click.png';
  await page.screenshot({ path: shot, fullPage: true });
  console.log('Screenshot saved to:', shot);

  // Check if live status changed
  const checkLive = await page.evaluate(() => {
    const alerts = Array.from(document.querySelectorAll('.badge, ytcp-badge, ytls-stream-status, .stream-status, #stream-status')).map(e => e.innerText);
    return { alerts, title: document.title, url: window.location.href };
  });
  console.log('Post click check:', checkLive);

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
