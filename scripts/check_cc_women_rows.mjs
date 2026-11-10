import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'CC Women', '/livestreaming/manage');
  await page.waitForTimeout(5000);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cc_women_after_wizard.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);

  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytcp-video-row, [role="row"]')).map(r => r.innerText.replace(/\s+/g, ' ').trim());
  });
  console.log('Rows on CC Women now:\n', JSON.stringify(rows, null, 2));

  await ctx.close();
}

main().catch(console.error);
