import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Robert Łukasz Pio', '/videos/live');
    await page.waitForTimeout(4000);

    const shot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_content_live.png';
    await page.screenshot({ path: shot });
    console.log('Zrzut treści live:', shot);

    const rows = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('ytcp-video-row, [role="row"]'));
      return items.map(r => r.innerText.trim().replace(/\n+/g, ' | '));
    });

    console.log('Wiersze w Treści -> Live:\n', JSON.stringify(rows.slice(0, 5), null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await ctx.close();
  }
}

main();
