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
  await page.waitForTimeout(6000);

  console.log('Current YT URL:', page.url());

  // Click avatar on www.youtube.com
  console.log('3. Clicking avatar button on YouTube...');
  const avatarBtn = page.locator('button#avatar-btn, ytd-topbar-menu-button-renderer').first();
  await avatarBtn.click();
  await page.waitForTimeout(2000);

  // Look for YouTube Studio in menu
  console.log('4. Looking for YouTube Studio item in menu...');
  const studioItem = page.locator('ytd-compact-link-renderer:has-text("YouTube Studio"), a[href*="studio.youtube.com"]').first();
  if (await studioItem.isVisible().catch(() => false)) {
    console.log('Clicking YouTube Studio menu item...');
    await studioItem.click();
    await page.waitForTimeout(8000);
  } else {
    console.log('Studio menu item not found, trying https://studio.youtube.com/?approve_browser_access=true');
    await page.goto('https://studio.youtube.com/?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
  }

  console.log('After studio navigation, URL:', page.url());
  console.log('Page title:', await page.title());

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_studio_avatar_test.png';
  await page.screenshot({ path: shotPath });
  console.log('Screenshot saved:', shotPath);

  await ctx.close();
}

main().catch(console.error);
