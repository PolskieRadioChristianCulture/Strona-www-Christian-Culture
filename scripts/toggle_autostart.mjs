import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/D_Sy-I2Gr2Y/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Turn ON "Włącz automatyczne uruchamianie"
  const toggles = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button, ytcp-toggle'));
    return list.map((t, idx) => ({
      idx,
      id: t.id,
      checked: t.hasAttribute('checked') || t.getAttribute('aria-checked') === 'true',
      text: (t.closest('.setting-row, ytcp-settings-row, div')?.innerText || '').replace(/\s+/g, ' ').trim()
    }));
  });
  console.log('Toggles on page:\n', JSON.stringify(toggles, null, 2));

  // Find toggle for "Włącz automatyczne uruchamianie"
  const autoStartToggle = page.locator('tp-yt-paper-toggle-button, ytcp-toggle').filter({ hasText: /Włącz automatyczne uruchamianie/i }).first();
  // Or locate by sibling/parent text
  const autoStart = page.locator('div:has-text("Włącz automatyczne uruchamianie") tp-yt-paper-toggle-button, div:has-text("Włącz automatyczne uruchamianie") ytcp-paper-toggle-button').first();
  
  // Click all toggles matching auto start/stop
  const autoStartBtn = page.locator('tp-yt-paper-toggle-button').filter({ has: page.locator('xpath=ancestor::div[contains(., "uruchamianie")]') }).first();
  
  // Let's do it cleanly via evaluate
  const result = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button, ytcp-toggle'));
    const switched = [];
    for (const item of items) {
      const parentText = item.closest('div')?.innerText || item.parentElement?.innerText || '';
      if (/automatyczne uruchamianie/i.test(parentText)) {
        const isChecked = item.hasAttribute('checked') || item.getAttribute('aria-checked') === 'true';
        if (!isChecked) {
          item.click();
          switched.push('automatyczne uruchamianie -> ON');
        }
      }
      if (/automatyczne zatrzymywanie/i.test(parentText)) {
        const isChecked = item.hasAttribute('checked') || item.getAttribute('aria-checked') === 'true';
        if (!isChecked) {
          item.click();
          switched.push('automatyczne zatrzymywanie -> ON');
        }
      }
    }
    return switched;
  });
  console.log('Toggles clicked:', result);
  await page.waitForTimeout(2000);

  // Check what stream key is selected, and inspect the stream key selector
  console.log('Checking stream key selector...');
  // The stream key dropdown under "Ustawienia transmisji"
  const keyInputs = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    return inputs.map(i => ({ id: i.id, type: i.type, value: i.value }));
  });
  console.log('Key inputs:', keyInputs);

  // Take screenshot
  const shot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\autostart_toggled.png';
  await page.screenshot({ path: shot, fullPage: true });
  console.log('Screenshot saved to:', shot);

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
