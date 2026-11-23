import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function checkDrafts() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Christian Culture TV', '/videos/upload');
    await page.waitForTimeout(4000);
    const drafts = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('ytcp-video-row'));
      return rows.map(r => ({
        text: r.innerText.replace(/\s+/g, ' ').trim(),
        href: r.querySelector('a#thumbnail-anchor')?.href || r.querySelector('a#video-title')?.href
      }));
    });
    console.log('DRAFTS ON CCTV:', drafts.slice(0, 5));
  } finally {
    await ctx.close();
  }
}

checkDrafts().catch(console.error);
