import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  console.log('1. Switching to @RadioChristianCulture...');
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const item = page.locator('ytd-account-item-renderer', { hasText: '@RadioChristianCulture' }).first();
  await item.click();
  await page.waitForTimeout(4000);

  // Now click avatar
  console.log('2. Clicking avatar...');
  await page.locator('button#avatar-btn').first().click();
  await page.waitForTimeout(2000);

  console.log('3. Waiting for new page popup when clicking Studio...');
  let studioPage = null;
  const pagePromise = ctx.waitForEvent('page', { timeout: 15000 });
  await page.locator('ytd-compact-link-renderer:has-text("YouTube Studio")').first().click();
  try {
    studioPage = await pagePromise;
  } catch (e) {
    console.log('No new tab event, using last page in context');
    studioPage = ctx.pages()[ctx.pages().length - 1];
  }

  console.log('Studio page URL:', studioPage.url());
  await studioPage.waitForTimeout(5000);
  console.log('Studio page loaded URL:', studioPage.url());
  console.log('Studio page title:', await studioPage.title());

  // Navigate studioPage to /livestreaming/manage
  console.log('4. Navigating studioPage to /livestreaming/manage...');
  const channelMatch = studioPage.url().match(/channel\/([^/]+)/);
  const studioChannelId = channelMatch ? channelMatch[1] : '';
  console.log('Extracted Studio Channel ID:', studioChannelId);

  if (studioChannelId) {
    await studioPage.goto(`https://studio.youtube.com/channel/${studioChannelId}/livestreaming/manage?approve_browser_access=true`, { waitUntil: 'domcontentloaded' });
  } else {
    await studioPage.goto('https://studio.youtube.com/livestreaming/manage', { waitUntil: 'domcontentloaded' });
  }
  await studioPage.waitForTimeout(6000);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_studio_manage_success.png';
  await studioPage.screenshot({ path: shotPath });
  console.log('Saved studio manage screenshot:', shotPath);

  await ctx.close();
}

main().catch(console.error);
