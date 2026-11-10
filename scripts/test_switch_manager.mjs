import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  console.log('1. Going to channel_switcher...');
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const handle = '@RadioChristianCulture';
  console.log(`2. Clicking ${handle}...`);
  const item = page.locator('ytd-account-item-renderer', { hasText: handle }).first();
  await item.click();
  await page.waitForTimeout(5000);

  console.log('3. Navigating to https://studio.youtube.com/livestreaming/manage...');
  await page.goto('https://studio.youtube.com/livestreaming/manage', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  console.log('Current URL:', page.url());
  console.log('Page title:', await page.title());

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_studio_test.png';
  await page.screenshot({ path: shotPath });
  console.log('Screenshot saved:', shotPath);

  await ctx.close();
}

main().catch(console.error);
