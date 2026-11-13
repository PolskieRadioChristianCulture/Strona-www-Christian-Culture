const handles = [
  'ChristianCultureTV',
  'RadioChristianCulture',
  'bibliaaudiocc',
  'CCMen7',
  'PersonalityPlusCC',
  'osobowoscPLUS',
  'RobertŁukaszPio'
];

for (const h of handles) {
  try {
    const res = await fetch(`https://www.youtube.com/@${encodeURIComponent(h)}/live`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await res.text();
    const vMatch = html.match(/"videoId":"([^"]+)"/);
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const isLive = html.includes('"isLive":true') || html.includes('"status":"LIVE"');
    console.log(`${h}: isLive=${isLive}, videoId=${vMatch ? vMatch[1] : 'null'}, title=${titleMatch ? titleMatch[1] : 'null'}`);
  } catch (err) {
    console.error(h, err.message);
  }
}
