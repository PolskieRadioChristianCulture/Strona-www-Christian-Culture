async function checkWatch() {
  const videoId = process.argv[2] || 'KdOBA_zRU0c';
  const url = videoId.startsWith('http') ? videoId : `https://www.youtube.com/watch?v=${videoId}`;
  const r = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Language': 'pl-PL,pl;q=0.9',
      'Cookie': 'SOCS=CAESEwgDEgk2OTg1MDk0MzQaAnBsIAEaBgiA_L-4Bg;'
    }
  });
  const html = await r.text();
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  console.log('Video / URL:', url);
  console.log('Title:', title);
  const reason = html.match(/"reason":"([^"]+)"/)?.[1];
  const subreason = html.match(/"simpleText":"([^"]+)"/g);
  console.log('Reason:', reason);
  console.log('Subreasons / texts:', subreason?.slice(0, 10));
  
  const playability = html.match(/"playabilityStatus":\{"status":"([^"]+)"/)?.[1];
  console.log('Playability Status:', playability);
  const liveBroadcastDetails = html.match(/"liveBroadcastDetails":\{([^\}]+)\}/)?.[1];
  console.log('liveBroadcastDetails:', liveBroadcastDetails);
  const isLive = html.includes('"isLiveNow":true');
  console.log('isLiveNow (boolean):', isLive);
}
checkWatch();
