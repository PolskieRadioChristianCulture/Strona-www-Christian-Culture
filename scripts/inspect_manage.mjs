import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/channel/UCHmPxDM2zzlUAf5ZvlotPLw/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\manage_page_oso.png';
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Saved screenshot:', shotPath);

  // List all rows in the manage table
  const rows = await page.evaluate(() => {
    const tableRows = Array.from(document.querySelectorAll('ytcp-video-row, ytls-broadcast-row, [role="row"]'));
    return tableRows.map(r => r.innerText.replace(/\s+/g, ' ').trim());
  });
  console.log('Rows found:', rows);

  await ctx.close();
}

main().catch(console.error);
