import fs from 'node:fs';

async function main() {
  const r = await fetch('https://polskieradio.cc/news', { headers: { 'cache-control': 'no-cache' } });
  const html = await r.text();
  console.log('Status:', r.status, 'Length:', html.length);
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1]);
  console.log('Scripts:', scripts);
  if (html.includes('Nie udało się wyświetlić')) {
    console.log('HTML contains fallback text in static HTML!');
  } else {
    console.log('Fallback text NOT in static HTML - rendered by JS runtime error / React error boundary!');
  }

  // Also let's check local news.html and portals/ccn-news
  console.log('\n--- Checking local files ---');
  if (fs.existsSync('news.html')) {
    console.log('news.html size:', fs.statSync('news.html').size);
  }
  if (fs.existsSync('news/index.html')) {
    console.log('news/index.html size:', fs.statSync('news/index.html').size);
  }

  // Check what script files are referenced and fetch them
  for (const s of scripts) {
    const scriptUrl = s.startsWith('http') ? s : `https://polskieradio.cc${s}`;
    try {
      const sRes = await fetch(scriptUrl);
      console.log('Script:', s, 'Status:', sRes.status, 'Size:', (await sRes.text()).length);
    } catch(e) {
      console.log('Script fetch error:', s, e.message);
    }
  }
}

main().catch(console.error);
