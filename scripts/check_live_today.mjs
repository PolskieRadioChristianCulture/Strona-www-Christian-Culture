import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    const channels = ['Robert Łukasz Pio', 'Osobowość +', 'Christian Culture TV', 'Polskie Radio CHRISTIAN CULTURE', 'CC Women'];
    for (const ch of channels) {
      console.log(`\n================ Checking: ${ch} ================`);
      await openChannelStudio(page, ch, '/livestreaming/manage');
      await page.waitForTimeout(3500);
      
      const rows = await page.evaluate(() => {
        const items = [];
        const selector = 'ytcp-video-row, ytls-broadcast-row, [role="row"]';
        document.querySelectorAll(selector).forEach(r => {
          const title = r.querySelector('a#video-title, [id*="title"], a');
          const href = title ? title.href : '';
          const text = r.innerText ? r.innerText.replace(/\n+/g, ' | ').trim() : '';
          if (text) items.push({ href, text });
        });
        return items.slice(0, 4);
      });
      console.log('Rows count:', rows.length);
      rows.forEach((r, idx) => console.log(`  [${idx}] ${r.text.substring(0, 150)}`));
    }
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
