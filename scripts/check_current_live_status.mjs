const handles = [
  '@ChristianCultureTV',
  '@osobowośćPLUS',
  '@bibliaaudiocc',
  '@RadioChristianCulture',
  '@CCWomen7',
  '@CCMen7',
  '@RobertŁukaszPio',
  '@TopSeven_CC',
  '@WorshipLiveCC',
  '@PersonalityPlusCC',
  '@wersetdnia_ChSB',
  '@katarzynafedkow'
];

async function check(h) {
  try {
    const res = await fetch(`https://www.youtube.com/${h}/live`, { redirect: 'follow' });
    const text = await res.text();
    const isLive = text.includes('"isLive":true') || text.includes('badge-style-type-live-now');
    const isUpcoming = text.includes('"status":"UPCOMING"') || text.includes('Zaplanowano');
    const titleMatch = text.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : '';
    console.log(`${h.padEnd(25)} -> isLive: ${String(isLive).padEnd(5)} | isUpcoming: ${String(isUpcoming).padEnd(5)} | title: ${title}`);
  } catch (e) {
    console.log(`${h} error: ${e.message}`);
  }
}

async function main() {
  for (const h of handles) {
    await check(h);
  }
}
main();
