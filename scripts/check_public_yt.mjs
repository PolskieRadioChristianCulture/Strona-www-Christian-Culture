const CHANNELS = [
  { name: 'Christian Culture TV', handle: '@ChristianCultureTV' },
  { name: 'Popraw Koronę', handle: '@PoprawKoronęCC' },
  { name: 'CC Women', handle: '@CCWomen7' },
  { name: 'Polskie Radio CC', handle: '@RadioChristianCulture' },
  { name: 'Biblia Audio CC', handle: '@bibliaaudiocc' },
  { name: 'CC Men', handle: '@CCMen7' },
  { name: 'RCC TV 24', handle: '@ToDlaCiebieGramy' },
  { name: 'Christian Culture Network', handle: '@ChristianCultureNetwork' },
  { name: 'Christian Culture POP', handle: '@ChristianCulturePOP' },
  { name: 'CC Bible Deep', handle: '@CCBibleDeep' }
];

async function checkPublic() {
  for (const ch of CHANNELS) {
    const url = `https://www.youtube.com/${encodeURI(ch.handle)}/live`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        redirect: 'follow'
      });
      const html = await res.text();
      const finalUrl = res.url;
      const isWatch = finalUrl.includes('/watch?v=');
      const isLiveNow = html.includes('"isLive":true') || html.includes('"isLiveNow":true') || html.includes('LIVE 🔴') || html.includes('nadaje na żywo');
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : 'No title';
      console.log(`[${ch.name}] finalUrl: ${finalUrl} | isLiveNow: ${isLiveNow} | Title: ${title}`);
    } catch (e) {
      console.log(`[${ch.name}] ERROR: ${e.message}`);
    }
  }
}

checkPublic();
