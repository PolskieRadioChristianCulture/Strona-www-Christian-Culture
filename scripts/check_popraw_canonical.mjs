async function main() {
  const r = await fetch('https://www.youtube.com/@PoprawKoron%C4%99CC/live', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  console.log('Final URL:', r.url);
  const text = await r.text();
  console.log('Has wyiw23R-dy4?', text.includes('wyiw23R-dy4'));
  console.log('Title:', (text.match(/<title>(.*?)<\/title>/) || [])[1]);
}
main();
