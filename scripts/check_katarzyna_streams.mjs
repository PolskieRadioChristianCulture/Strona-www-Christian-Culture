async function main() {
  const r = await fetch('https://www.youtube.com/@katarzynafedkow/streams', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const text = await r.text();
  const videoIds = Array.from(text.matchAll(/"videoId":"([^"]+)"/g)).map(m => m[1]);
  const uniqueIds = [...new Set(videoIds)];
  console.log('Video IDs on @katarzynafedkow/streams:', uniqueIds.slice(0, 10));
}
main();
