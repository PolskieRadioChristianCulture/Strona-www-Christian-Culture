import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  console.log('Opening RCC manage...');
  await openChannelStudio(page, 'Polskie Radio CHRISTIAN CULTURE', '/livestreaming/manage');
  await page.waitForTimeout(4000);

  const rows = await page.locator('ytcp-video-row').all();
  console.log(`Found ${rows.length} rows in table.`);
  for (const r of rows) {
    console.log('Row text:', (await r.innerText()).replace(/\s+/g, ' '));
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_rows_inspect.png' });
  await ctx.close();
}

main().catch(console.error);
