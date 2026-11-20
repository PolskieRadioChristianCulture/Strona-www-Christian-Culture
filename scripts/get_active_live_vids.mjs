const handles = ['@ChristianCultureTV', '@TopSeven_CC', '@WorshipLiveCC', '@katarzynafedkow', '@PoprawKoronęCC'];

async function getLiveIds() {
  for (const h of handles) {
    try {
      const res = await fetch(`https://www.youtube.com/${encodeURIComponent(h)}/live`, { redirect: 'follow' });
      const text = await res.text();
      const match = text.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      const titleMatch = text.match(/<title>(.*?)<\/title>/);
      console.log(`${h} -> videoId: ${match ? match[1] : 'none'} | url: ${res.url} | title: ${titleMatch ? titleMatch[1] : ''}`);
    } catch (e) {
      console.log(h, 'error:', e.message);
    }
  }
}
getLiveIds();
