import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'Osobowość +', '/livestreaming/manage');
  await page.waitForTimeout(5000);
  
  const shot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\manage_osobowosc.png';
  await page.screenshot({ path: shot, fullPage: true });
  console.log('Saved manage screenshot to:', shot);

  // Inspect table rows / broadcasts
  const rows = await page.evaluate(() => {
    const tableRows = document.querySelectorAll('ytcp-video-row, ytcp-entity-table-row, [role="row"]');
    return Array.from(tableRows).map(r => ({
      text: r.innerText.replace(/\n+/g, ' | ').slice(0, 200),
      links: Array.from(r.querySelectorAll('a')).map(a => a.href)
    }));
  });
  console.log('Table rows:', JSON.stringify(rows, null, 2));

  await ctx.close();
}

main().catch(console.error);
