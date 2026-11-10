import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/D_Sy-I2Gr2Y/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click stream key dropdown
  console.log('Clicking stream key dropdown input...');
  const keyInput = page.locator('input[value*="Default stream key"], input[value*="Klucz"]').first();
  await keyInput.click();
  await page.waitForTimeout(2000);

  // Read dropdown items
  const menuItems = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('tp-yt-paper-item, ytcp-text-menu-item, [role="option"]'));
    return items.map(el => el.innerText.trim()).filter(Boolean);
  });
  console.log('Stream key menu items:\n', menuItems);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\key_menu_items.png' });

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
