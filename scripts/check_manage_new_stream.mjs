import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
  await page.waitForTimeout(5000);

  const rows = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('ytcp-video-row, [role="row"]'));
    return list.map(r => {
      const title = r.querySelector('#video-title')?.innerText || '';
      const href = r.querySelector('a')?.href || '';
      const text = r.innerText.replace(/\s+/g, ' ').trim();
      return { title, href, text };
    }).filter(r => r.text.length > 0);
  });
  console.log('Total manage rows:', rows.length);
  for (const r of rows) {
    console.log('--- Row ---');
    console.log('Title:', r.title);
    console.log('Link:', r.href);
    console.log('Text:', r.text.slice(0, 150));
  }

  await ctx.close();
}

main().catch(console.error);
