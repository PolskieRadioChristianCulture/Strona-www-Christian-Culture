const handles = [
  '@RobertŁukaszPio',
  '@katarzynafedkow',
  '@TopSeven_CC',
  '@ToDlaCiebieGramy',
  '@CCPrayer24',
  '@ChristianCultureNetwork'
];

async function check(handle) {
  const url = `https://www.youtube.com/${handle}/live?cbrd=1&ucbcb=1`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      redirect: 'follow'
    });
    const text = await res.text();
    const isLive = text.includes('{"status":"LIVE"') ||
                   text.includes('"isLive":true') ||
                   text.includes('isLiveBroadcast') ||
                   (text.includes('watching now') || text.includes('ogłada teraz') || text.includes('oglądają teraz'));
    const titleMatch = text.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'Unknown';
    return { handle, isLive, title, finalUrl: res.url };
  } catch (err) {
    return { handle, isLive: false, error: err.message };
  }
}

async function main() {
  for (const h of handles) {
    const res = await check(h);
    console.log(`${res.handle.padEnd(25)} | Live: ${res.isLive ? '🟢 LIVE' : '🔴 OFFLINE'} | Title: ${res.title}`);
  }
}

main().catch(console.error);
