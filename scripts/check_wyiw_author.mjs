async function check() {
  const r = await fetch('https://www.youtube.com/watch?v=wyiw23R-dy4');
  const t = await r.text();
  const authorMatch = t.match(/"author":"([^"]+)"/) || t.match(/"ownerChannelName":"([^"]+)"/);
  const isLive = t.includes('"isLive":true');
  const titleMatch = t.match(/<title>(.*?)<\/title>/);
  console.log('Video wyiw23R-dy4:');
  console.log('Title:', titleMatch ? titleMatch[1] : '');
  console.log('Author:', authorMatch ? authorMatch[1] : 'unknown');
  console.log('isLive:', isLive);
}
check();
