const channels = [
  { name: 'Christian Culture TV', handle: 'ChristianCultureTV' },
  { name: 'Osobowość +', handle: 'osobowoscPLUS' },
  { name: 'Polskie Radio CC', handle: 'RadioChristianCulture' },
  { name: 'Biblia Audio CC', handle: 'bibliaaudiocc' },
  { name: 'Werset Dnia', handle: 'wersetdnia_ChSB' },
  { name: 'CC Women', handle: 'CCWomen7' },
  { name: 'CC Men', handle: 'CCMen7' },
  { name: 'Robert Łukasz Pio', handle: 'RobertŁukaszPio' },
  { name: 'Katarzyna Fedków', handle: 'katarzynafedkow' },
  { name: 'Top Seven', handle: 'TopSeven_CC' },
  { name: 'RCC TV 24', handle: 'ToDlaCiebieGramy' },
  { name: 'CC Prayer 24', handle: 'CCPrayer24' },
  { name: 'Christian Culture Network', handle: 'ChristianCultureNetwork' },
  { name: 'CC Bible Deep', handle: 'CCBibleDeep' },
  { name: 'Christian Culture POP', handle: 'ChristianCulturePOP' },
  { name: 'Popraw Koronę', handle: 'PoprawKoronęCC' },
  { name: 'Worship LIVE CC', handle: 'WorshipLiveCC' },
  { name: 'CC Instrumental', handle: 'ChristianCultureInstrumental' },
  { name: 'CC Identity', handle: 'CCIdentityTwojaDuchowaTożsamoś' },
  { name: 'CC FILM', handle: 'CCFILM77' },
  { name: 'CC Nature Sounds', handle: 'CCNatureSounds' },
  { name: 'Personality Plus', handle: 'PersonalityPlusCC' }
];

async function checkChannel(c) {
  const url = `https://www.youtube.com/@${encodeURIComponent(c.handle)}/live`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      redirect: 'follow'
    });
    const html = await res.text();
    const isLive = html.includes('"isLive":true') || html.includes('"status":"LIVE"') || html.includes('"isLiveContent":true') || html.includes('style="LIVE"');
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : 'unknown';
    console.log(`${(isLive ? '🟢 LIVE' : '⚪ offline').padEnd(10)} | ${c.name.padEnd(26)} | @${c.handle.padEnd(25)} | ${title}`);
  } catch (err) {
    console.log(`🔴 ERROR   | ${c.name.padEnd(26)} | @${c.handle.padEnd(25)} | ${err.message}`);
  }
}

for (const c of channels) {
  await checkChannel(c);
}
