const vids = [
  { name: 'Robert Łukasz Pio', id: 'pI5Ht1ntwLA' },
  { name: 'Katarzyna Fedków', id: 'CIi_s5FxxKA' },
  { name: 'RCC TV 24', id: 'dH9DhEVUmqQ' },
  { name: 'Popraw Koronę', id: 'rggnFJ6T32A' },
  { name: 'Top Seven', id: 'lQu6Bmpxn84' },
  { name: 'CC Women', id: 'lHPOFYvgXvM' },
];

async function check() {
  for (const item of vids) {
    try {
      const res = await fetch(`https://www.youtube.com/watch?v=${item.id}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const txt = await res.text();
      const isLive = txt.includes('"isLive":true') || txt.includes('"isLiveContent":true');
      const isUnlisted = txt.includes('"isUnlisted":true');
      const isEnded = txt.includes('"isLiveStreamEnded":true');
      const titleMatch = txt.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : 'Brak';
      console.log(`${item.name} (${item.id}): Live=${isLive}, Ended=${isEnded}, Unlisted=${isUnlisted}, Title: ${title}`);
    } catch (e) {
      console.log(`${item.name} error: ${e.message}`);
    }
  }
}
check();
