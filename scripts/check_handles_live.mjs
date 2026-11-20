const handles = [
  '@osobowośćPLUS',
  '@CCWomen7',
  '@katarzynafedkow',
  '@TopSeven_CC',
  '@WorshipLiveCC',
  '@CCWorshipInternational',
  '@ChristianCulturePraiseWorship'
];

async function checkHandle(handle) {
  try {
    const res = await fetch(`https://www.youtube.com/${handle}/live`, { redirect: 'follow' });
    const finalUrl = res.url;
    const text = await res.text();
    const isLive = text.includes('"isLive":true') || text.includes('badge-style-type-live-now');
    const isUpcoming = text.includes('"status":"UPCOMING"') || text.includes('Zaplanowano');
    const titleMatch = text.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : '';
    console.log(`${handle} -> ${finalUrl}`);
    console.log(`  title: ${title}`);
    console.log(`  isLive: ${isLive}, isUpcoming: ${isUpcoming}`);
  } catch (err) {
    console.log(`${handle} error:`, err.message);
  }
}

async function main() {
  for (const h of handles) {
    await checkHandle(h);
  }
}
main();
