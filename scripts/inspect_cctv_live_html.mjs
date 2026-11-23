async function main() {
  const r = await fetch('https://www.youtube.com/@ChristianCultureTV/live', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const html = await r.text();
  const vids = [...html.matchAll(/"videoId":"([^"]+)"/g)].map(m => m[1]);
  console.log('Video IDs found in HTML:', [...new Set(vids)].slice(0, 5));
  const isLive = html.includes('"isLive":true');
  const isLiveNow = html.includes('"isLiveNow":true');
  const isOffline = html.includes('LIVE_STREAM_OFFLINE');
  const isUpcoming = html.includes('UPCOMING');
  console.log({ isLive, isLiveNow, isOffline, isUpcoming });
  
  // Check the title of the video on watch
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  console.log('Canonical URL:', canonical);
}
main();
