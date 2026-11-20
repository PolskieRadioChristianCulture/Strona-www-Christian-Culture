import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const CHANNELS = [
  'Robert Łukasz Pio',
  'Osobowość +',
  'Christian Culture TV',
  'Polskie Radio CHRISTIAN CULTURE',
  'CC Women'
];

async function checkAll() {
  const { ctx, page } = await launchStudio({ headless: true });
  const list = [];
  try {
    for (const ch of CHANNELS) {
      await openChannelStudio(page, ch, '/livestreaming/manage');
      await page.waitForTimeout(3000);
      const rows = await page.evaluate(() => {
        const res = [];
        document.querySelectorAll('ytcp-video-row, ytls-broadcast-row, [role="row"]').forEach(r => {
          const a = r.querySelector('a#video-title, a[href*="/video/"]');
          const href = a ? a.href : '';
          const match = href.match(/\/video\/([a-zA-Z0-9_-]+)/);
          const videoId = match ? match[1] : null;
          const text = r.innerText.replace(/\n+/g, ' | ').trim();
          if (text.includes('Dlaczego Potrzebujesz') || text.includes('20:00')) {
            res.push({ videoId, href, text });
          }
        });
        return res;
      });
      console.log(`Channel [${ch}]:`, rows);
      list.push({ channel: ch, rows });
    }
    return list;
  } finally {
    await ctx.close();
  }
}

checkAll().catch(console.error);
