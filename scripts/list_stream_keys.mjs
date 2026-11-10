import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/KYSla9a5bjQ/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click on the stream key dropdown in the player
  // The dropdown trigger is inside ytls-player-renderer
  console.log('Finding dropdown trigger...');
  const trigger = page.locator('ytls-player-renderer tp-yt-paper-dropdown-menu, ytls-player-renderer [aria-haspopup="true"], ytls-player-renderer .dropdown-trigger').first();
  if (await trigger.isVisible().catch(() => false)) {
    console.log('Clicking trigger...');
    await trigger.click();
    await page.waitForTimeout(2000);
    const items = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('tp-yt-paper-item, ytcp-text-menu-item, [role="option"]'));
      return els.map(e => e.innerText.trim()).filter(Boolean);
    });
    console.log('Dropdown items:', items);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\key_dropdown_open.png' });
  } else {
    console.log('Trigger not found with that selector. Looking for any element with "Default stream key"...');
    const el = page.locator(':has-text("Default stream key")').last();
    console.log('Is visible:', await el.isVisible().catch(() => false));
    await el.click();
    await page.waitForTimeout(2000);
    const items = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('tp-yt-paper-item, ytcp-text-menu-item, [role="option"]'));
      return els.map(e => e.innerText.trim()).filter(Boolean);
    });
    console.log('Dropdown items 2:', items);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\key_dropdown_open.png' });
  }

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
