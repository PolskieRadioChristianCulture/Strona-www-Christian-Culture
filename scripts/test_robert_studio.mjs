import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log('1. Navigating to channel_switcher to select Robert Łukasz Pio...');
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
    await page.waitForTimeout(1500);

    const robertItem = page.locator('ytd-account-item-renderer', { hasText: 'Robert Łukasz Pio' }).first();
    console.log('Robert item count:', await robertItem.count());
    await robertItem.click();
    await page.waitForTimeout(5000);

    console.log('2. Opening Studio for active channel...');
    await page.goto('https://studio.youtube.com/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    const title = await page.title();
    const url = page.url();
    console.log(`Current Studio URL: ${url} | Title: ${title}`);

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_manage_test.png' });

    const btns = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, ytcp-button')).map(b => b.innerText.trim()).filter(Boolean);
    });
    console.log('Buttons visible in Studio:', btns);

    const rows = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('ytcp-video-row, [role="row"]')).map(r => r.innerText.replace(/\s+/g, ' ').trim());
    });
    console.log('Rows in Studio:', rows);

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
