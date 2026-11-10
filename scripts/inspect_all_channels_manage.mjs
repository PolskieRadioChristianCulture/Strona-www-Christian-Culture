import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const targetChannels = [
  'Christian Culture TV',
  'Polskie Radio CHRISTIAN CULTURE',
  'Biblia Audio Christian Culture',
  'Werset Dnia - Chrześcijański Serwis Biblijny',
  'CC Women',
  'CC Men'
];

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });

  for (const name of targetChannels) {
    console.log(`\n========================================`);
    console.log(`Checking channel: ${name}`);
    try {
      await openChannelStudio(page, name, '/livestreaming/manage');
      await page.waitForTimeout(4000);

      const rows = await page.evaluate(() => {
        const tableRows = Array.from(document.querySelectorAll('ytcp-video-row, ytls-broadcast-row, [role="row"]'));
        return tableRows.map(r => r.innerText.replace(/\s+/g, ' ').trim());
      });
      console.log(`Rows for ${name}:`, rows);

      const shotPath = `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\manage_${name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      await page.screenshot({ path: shotPath });
      console.log(`Screenshot saved to: ${shotPath}`);
    } catch (e) {
      console.error(`Error checking ${name}:`, e.message);
    }
  }

  await ctx.close();
}

main().catch(console.error);
