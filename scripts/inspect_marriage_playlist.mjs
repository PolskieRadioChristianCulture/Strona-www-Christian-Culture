async function main() {
  const r = await fetch('https://www.youtube.com/playlist?list=PLc4FTh2vwsrk');
  const text = await r.text();
  const videoIds = Array.from(text.matchAll(/"videoId":"([^"]+)"/g)).map(m => m[1]);
  const uniqueIds = [...new Set(videoIds)];
  console.log('Video IDs in PLc4FTh2vwsrk:', uniqueIds);
}
main();
