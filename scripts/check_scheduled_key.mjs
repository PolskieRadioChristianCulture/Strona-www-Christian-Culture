import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });

  // Get current URL or navigate to the latest video livestreaming URL
  // Let's find out what the video ID is from manage page
  await page.goto('https://studio.youtube.com/channel/UCHmPxDM2zzlUAf5ZvlotPLw/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click on the first stream row in the table
  const streamRow = page.locator('ytls-manage-stream-row, .stream-row, ytcp-entity-table-row, a[href*="/livestreaming"]').first();
  console.log('Stream row visible:', await streamRow.isVisible().catch(() => false));
  await streamRow.click();
  await page.waitForTimeout(4000);

  console.log('Current URL in stream:', page.url());

  // Turn off layout switch
  const layoutToggle = page.locator('#layout-switch').first();
  if (await layoutToggle.isVisible().catch(() => false)) {
    const isChecked = await layoutToggle.evaluate(el => el.hasAttribute('checked') || el.getAttribute('aria-checked') === 'true');
    if (isChecked) {
      await layoutToggle.click();
      await page.waitForTimeout(1000);
      const conf = page.locator('ytcp-confirmation-dialog #confirm-button').first();
      if (await conf.isVisible().catch(() => false)) await conf.click();
      await page.waitForTimeout(1000);
    }
  }

  // Turn ON Auto-start and Auto-stop
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button, ytcp-toggle'));
    for (const item of items) {
      const text = item.closest('div')?.innerText || item.parentElement?.innerText || '';
      if (/automatyczne uruchamianie/i.test(text) || /automatyczne zatrzymywanie/i.test(text)) {
        if (!item.hasAttribute('checked') && item.getAttribute('aria-checked') !== 'true') {
          item.click();
        }
      }
    }
  });
  await page.waitForTimeout(1000);
  const conf2 = page.locator('button:has-text("Włącz")').first();
  if (await conf2.isVisible().catch(() => false)) await conf2.click();
  await page.waitForTimeout(1000);

  // Check the password input (stream key)
  const streamKey = await page.evaluate(() => {
    const p = document.querySelector('input[type="password"]');
    return p ? p.value : null;
  });
  console.log('Stream key of this scheduled stream:', streamKey);

  // Take screenshot
  const shot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\stream_key_scheduled.png';
  await page.screenshot({ path: shot, fullPage: true });
  console.log('Screenshot saved to:', shot);

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
