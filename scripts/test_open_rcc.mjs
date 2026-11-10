import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  console.log('Testing openChannelStudio for Polskie Radio CHRISTIAN CULTURE...');
  try {
    const id = await openChannelStudio(page, 'Polskie Radio CHRISTIAN CULTURE', '/livestreaming/manage');
    console.log('Success! Channel ID:', id);
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_manage_opened.png' });
  } catch (e) {
    console.error('Error opening channel studio:', e.message);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_manage_failed.png' });
  }
  await ctx.close();
}

main().catch(console.error);
