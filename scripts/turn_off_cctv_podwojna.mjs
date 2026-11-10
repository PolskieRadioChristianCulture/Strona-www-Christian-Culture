import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  console.log('Navigating to CCTV stream control room...');
  await page.goto('https://studio.youtube.com/video/PcczzAgsIto/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Close feature discovery callouts if any
  const closeBtn = page.locator('ytcp-feature-discovery-callout #close-button, button:has-text("Zamknij")').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    console.log('Closing callout...');
    await closeBtn.click();
    await page.waitForTimeout(1000);
  }

  // Turn OFF layout switch
  const layoutToggle = page.locator('#layout-switch').first();
  const isChecked = await layoutToggle.evaluate(el => el.hasAttribute('checked') || el.getAttribute('aria-checked') === 'true');
  console.log('CCTV Layout switch checked:', isChecked);

  if (isChecked) {
    console.log('Toggling OFF Podwójna transmisja on CCTV...');
    await layoutToggle.click();
    await page.waitForTimeout(3000);

    const confirmBtn = page.locator('ytcp-confirmation-dialog #confirm-button, button:has-text("Wyłącz")').first();
    if (await confirmBtn.isVisible().catch(() => false)) {
      console.log('Confirming turn off on CCTV...');
      await confirmBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  await page.waitForTimeout(6000);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cctv_after_podwojna_off.png';
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Screenshot saved to:', shotPath);

  // Check buttons
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytls-header button, ytls-header ytcp-button')).map(b => ({
      text: (b.innerText || b.getAttribute('aria-label') || '').trim(),
      id: b.id,
      disabled: b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true',
      visible: b.offsetParent !== null
    }));
  });
  console.log('Buttons:', JSON.stringify(buttons, null, 2));

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
