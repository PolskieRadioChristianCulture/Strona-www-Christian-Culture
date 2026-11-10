async function checkVideo() {
  const res = await fetch('https://www.youtube.com/watch?v=rggnFJ6T32A', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const html = await res.text();
  const isLive = html.includes('"isLive":true') || html.includes('"status":"LIVE"') || html.includes('style="LIVE"');
  const title = (html.match(/<title>(.*?)<\/title>/) || [])[1];
  console.log('Video rggnFJ6T32A:', isLive ? '🟢 LIVE' : '⚪ NOT LIVE', '| Title:', title);
}
checkVideo();
