import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const CHANNEL_NAME = 'Werset Dnia - Chrześcijański Serwis Biblijny';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`Opening ${CHANNEL_NAME} manage...`);
    await openChannelStudio(page, CHANNEL_NAME, '/livestreaming/manage');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\wersetdnia_manage.png' });

    const rows = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('ytcp-video-row, [role="row"]')).map(r => r.innerText.replace(/\s+/g, ' ').trim());
    });
    console.log('Werset Dnia Rows:', rows);
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
