import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
  await page.waitForTimeout(6000);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cctv_manage.png';
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Saved screenshot:', shotPath);

  const rows = await page.evaluate(() => {
    const tableRows = Array.from(document.querySelectorAll('ytcp-video-row, ytls-broadcast-row, [role="row"]'));
    return tableRows.map(r => r.innerText.replace(/\s+/g, ' ').trim());
  });
  console.log('CCTV Rows found:', rows);

  await ctx.close();
}

main().catch(console.error);
