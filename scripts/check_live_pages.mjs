const urls = [
  { name: 'Robert Łukasz Pio', url: 'https://youtube.com/live/z33rEkjNciY' },
  { name: 'Osobowość +', url: 'https://youtube.com/live/Al56YdVI40c' },
  { name: 'Christian Culture TV', url: 'https://youtube.com/live/OGmZpYMGve4' },
  { name: 'Polskie Radio CC', url: 'https://youtube.com/live/tPipeO1iMD0' },
  { name: 'CC Women', url: 'https://youtube.com/live/yWyj0Iz1HeA' }
];

async function main() {
  for (const item of urls) {
    try {
      const res = await fetch(item.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const html = await res.text();
      const hasLiveBadge = html.includes('"isLive":true') || html.includes('"isLiveNow":true');
      const isUpcoming = html.includes('"status":"UPCOMING"') || html.includes('Zaplanowano') || html.includes('Nadchodzi');
      const timeMatch = html.match(/"scheduledStartTime":"([^"]+)"/);
      
      console.log(`[${item.name}]`);
      console.log(`  Live now: ${hasLiveBadge}`);
      console.log(`  Upcoming/Scheduled: ${isUpcoming}`);
      console.log(`  Start time: ${timeMatch ? timeMatch[1] : 'unknown'}`);
    } catch (e) {
      console.error(item.name, e.message);
    }
  }
}

main();
