import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function main() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  console.log('Navigating to room KdOBA_zRU0c...');
  await page.goto('https://studio.youtube.com/video/KdOBA_zRU0c/livestreaming', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    await gate.click();
    await page.waitForTimeout(5000);
  }

  // Dismiss any "Gotowe" dialog
  await page.mouse.click(600, 600);
  await page.waitForTimeout(1000);

  // Look for stream key selection elements
  const dropdown = page.locator('#stream-key-select, ytcp-select, [aria-label*="Wybierz klucz"], ytls-stream-key-selector').first();
  const dropdownText = await dropdown.innerText().catch(() => '');
  console.log('Dropdown text:', dropdownText.replace(/\s+/g, ' '));

  // Get full stream key value
  const fullKey = await page.evaluate(() => {
    const input = document.querySelector('input[type="password"]');
    return input ? input.value : null;
  });
  console.log('FULL Stream Key for KdOBA_zRU0c:', fullKey);

  // Check auto-start toggle state
  const toggles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tp-yt-paper-toggle-button')).map(t => ({
      text: t.innerText.replace(/\s+/g, ' ').trim(),
      checked: t.getAttribute('aria-checked') === 'true' || t.hasAttribute('checked')
    }));
  });
  console.log('Toggles:', toggles);

  await ctx.close();
}

main().catch(console.error);
