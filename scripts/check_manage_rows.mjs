import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Biblia Audio Christian Culture', '/livestreaming/manage');
    await page.waitForTimeout(5000);
    const rows = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('ytcp-video-row, [role="row"]')).map(r => r.innerText.replace(/\s+/g, ' ').trim());
    });
    console.log('Manage Rows:', rows);
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
