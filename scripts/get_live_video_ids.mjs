// Finalny test — otwiera każdy stream i wyciąga konkretny video ID z canonicalUrl
const channels = [
  { handle: '@ChristianCultureTV' },
  { handle: '@osobowoscPLUS' },
  { handle: '@RadioChristianCulture' },
  { handle: '@bibliaaudiocc' },
  { handle: '@wersetdnia_ChSB' },
  { handle: '@CCWomen7' },
  { handle: '@CCMen7' },
];

async function getVideoId(handle) {
  const url = `https://www.youtube.com/${handle}/live`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    redirect: 'follow'
  });
  const html = await res.text();
  
  // Extract videoId from various patterns
  const patterns = [
    /"videoId":"([a-zA-Z0-9_-]{11})"/,
    /watch\?v=([a-zA-Z0-9_-]{11})/,
    /"currentVideoId":"([a-zA-Z0-9_-]{11})"/,
  ];
  
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return { videoId: m[1], isLive: html.includes('"isLive":true') || html.includes('"status":"LIVE"'), finalUrl: res.url };
  }
  return { videoId: null, isLive: false, finalUrl: res.url };
}

async function main() {
  for (const ch of channels) {
    const { videoId, isLive, finalUrl } = await getVideoId(ch.handle);
    const status = isLive ? '🟢' : '🔴';
    if (videoId) {
      console.log(`${status} ${ch.handle.padEnd(25)} -> https://www.youtube.com/watch?v=${videoId}`);
    } else {
      console.log(`${status} ${ch.handle.padEnd(25)} -> Brak video ID | Final URL: ${finalUrl}`);
    }
  }
}

main().catch(console.error);
