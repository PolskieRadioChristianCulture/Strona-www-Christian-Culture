import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function main() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1600, height: 1000 },
    permissions: ['clipboard-read', 'clipboard-write'],
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

  // Look for the copy button next to the stream key dropdown
  // In the screenshot, there is a dropdown with text starting with "Klucz:" and two icon buttons next to it (refresh and copy)
  const buttonsNearKey = await page.locator('ytls-stream-key-selector button, #stream-key-selector button, button[aria-label*="Kopiuj"], button[aria-label*="kopiuj"]').all();
  console.log('Buttons near key count:', buttonsNearKey.length);
  for (let i = 0; i < buttonsNearKey.length; i++) {
    const label = await buttonsNearKey[i].getAttribute('aria-label').catch(() => '');
    console.log(`Button ${i} aria-label:`, label);
  }

  // Click the copy button
  const copyBtn = page.locator('button[aria-label*="Kopiuj klucz"], button[aria-label*="kopiuj klucz"], ytls-stream-key-selector ytcp-icon-button').last();
  if (await copyBtn.isVisible().catch(() => false)) {
    console.log('Clicking copy button...');
    await copyBtn.click();
    await page.waitForTimeout(1000);
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText()).catch(e => e.message);
    console.log('Copied clipboard text:', clipboardText);
  }

  // Open dropdown to see available stream keys
  console.log('Clicking stream key dropdown...');
  const dropdown = page.locator('ytls-stream-key-selector ytcp-select, #stream-key-select, ytcp-select').first();
  if (await dropdown.isVisible().catch(() => false)) {
    await dropdown.click();
    await page.waitForTimeout(2000);
    const options = await page.locator('tp-yt-paper-item, ytcp-ve[role="option"], [role="option"]').all();
    console.log('Dropdown options count:', options.length);
    for (const opt of options) {
      console.log('Option:', (await opt.innerText().catch(() => '')).replace(/\s+/g, ' '));
    }
  }

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/dropdown_options.png' });

  await ctx.close();
}

main().catch(console.error);
