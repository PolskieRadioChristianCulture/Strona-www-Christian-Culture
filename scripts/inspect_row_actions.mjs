import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming/manage');
    await page.waitForTimeout(4000);

    const rowDetails = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('ytcp-video-row, ytls-manage-table-row, [role="row"]'));
      return rows.map(r => ({
        text: r.innerText.slice(0, 100).replace(/\n+/g, ' '),
        links: Array.from(r.querySelectorAll('a')).map(a => ({ href: a.href, text: a.innerText })),
        buttons: Array.from(r.querySelectorAll('button, ytcp-button, ytcp-icon-button, yt-icon')).map(b => ({
          id: b.id,
          ariaLabel: b.getAttribute('aria-label') || b.getAttribute('title'),
          tag: b.tagName
        }))
      }));
    });

    console.log('Row details:\n', JSON.stringify(rowDetails, null, 2));

    // Hover over the first data row
    const firstRow = page.locator('[role="row"]').nth(1);
    await firstRow.hover();
    await page.waitForTimeout(1000);

    const hoverShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_row_hover.png';
    await page.screenshot({ path: hoverShot });
    console.log('Zrzut hover:', hoverShot);

  } catch (err) {
    console.error(err);
  } finally {
    await ctx.close();
  }
}

main();
