import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Biblia Audio Christian Culture', '/livestreaming/manage');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\biblia_manage_inspect.png' });
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
