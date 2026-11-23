async function test() {
  const res = await fetch('https://www.youtube.com/watch?v=hkct4gOpx-0', {
    headers: {
      'Cookie': 'SOCS=CAESEwgDEgk2OTg1MDk0MzQaAnBsIAEaBgiA_L-4Bg;',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const chMatch = html.match(/"channelId":"([^"]+)"/);
  const ownerMatch = html.match(/"ownerChannelName":"([^"]+)"/);
  const isLive = html.includes('"isLiveNow":true');
  console.log('Channel ID:', chMatch ? chMatch[1] : null);
  console.log('Owner:', ownerMatch ? ownerMatch[1] : null);
  console.log('isLiveNow:', isLive);
}
test();
