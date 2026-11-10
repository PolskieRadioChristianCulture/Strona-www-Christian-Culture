import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/channel/UCG5Y4dwJi5436Gu6QH3nNUQ/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const scheduleBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
  await scheduleBtn.click();
  await page.waitForTimeout(2000);

  console.log('Clicking "Użyj poprzednich ustawień"...');
  const reuseBtn = page.locator('button:has-text("Użyj poprzednich ustawień")').first();
  await reuseBtn.click();
  await page.waitForTimeout(4000);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\schedule_reuse_step2.png';
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Screenshot saved to:', shotPath);

  // Look for toggles or next buttons
  const dialogInfo = await page.evaluate(() => {
    const dialog = document.querySelector('ytcp-dialog, ytls-schedule-dialog, ytcp-uploads-dialog, ytls-broadcast-creator');
    if (!dialog) return 'No dialog found';
    const toggles = Array.from(dialog.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button, ytcp-toggle')).map(t => ({
      text: (t.closest('.setting-row, ytcp-settings-row')?.innerText || t.innerText || t.getAttribute('aria-label') || '').trim(),
      checked: t.hasAttribute('checked') || t.getAttribute('aria-checked') === 'true'
    }));
    const buttons = Array.from(dialog.querySelectorAll('button, ytcp-button')).map(b => ({
      text: (b.innerText || b.getAttribute('aria-label') || '').trim(),
      id: b.id,
      disabled: b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true'
    })).filter(b => b.text);
    return { toggles, buttons, text: dialog.innerText.slice(0, 800) };
  });

  console.log('Dialog Info:\n', JSON.stringify(dialogInfo, null, 2));

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
