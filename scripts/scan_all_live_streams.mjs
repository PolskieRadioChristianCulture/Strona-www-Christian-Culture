const CHANNELS = [
  { name: 'Christian Culture TV', handle: '@ChristianCultureTV', via: '@ChristianCultureTV' },
  { name: 'Osobowość +', handle: '@osobowoscPLUS', via: '@osobowoscPLUS' },
  { name: 'Polskie Radio CC', handle: '@RadioChristianCulture', via: '@RadioChristianCulture' },
  { name: 'Biblia Audio CC', handle: '@bibliaaudiocc', via: '@bibliaaudiocc' },
  { name: 'Werset Dnia', handle: '@wersetdnia_ChSB', via: '@wersetdnia_ChSB' },
  { name: 'CC Women', handle: '@CCWomen7', via: '@CCWomen7' },
  { name: 'CC Men', handle: '@CCMen7', via: '@CCMen7' },
  { name: 'Robert Łukasz Pio', handle: '@RobertŁukaszPio', via: '@RobertŁukaszPio' },
  { name: 'Katarzyna Fedków', handle: '@katarzynafedkow', via: '@katarzynafedkow' },
  { name: 'Top Seven', handle: '@TopSeven_CC', via: '@TopSeven_CC' },
  { name: 'RCC TV 24', handle: '@ToDlaCiebieGramy', via: '@ToDlaCiebieGramy' },
  { name: 'CC Prayer 24', handle: '@CCPrayer24', via: '@CCPrayer24' },
  { name: 'Christian Culture Network', handle: '@ChristianCultureNetwork', via: '@ChristianCultureNetwork' },
  { name: 'CC Bible Deep', handle: '@CCBibleDeep', via: '@CCBibleDeep' },
  { name: 'Christian Culture POP', handle: '@ChristianCulturePOP', via: '@ChristianCulturePOP' },
  { name: 'Popraw Koronę', handle: '@PoprawKoronęCC', via: '@PoprawKoronęCC' },
  { name: 'Worship LIVE CC', handle: '@WorshipLiveCC', via: '@WorshipLiveCC' },
  { name: 'CC Instrumental', handle: '@ChristianCultureInstrumental', via: '@ChristianCultureInstrumental' },
  { name: 'CC Identity', handle: '@CCIdentityTwojaDuchowaTożsamoś', via: '@CCIdentityTwojaDuchowaTożsamoś' },
  { name: 'CC FILM', handle: '@CCFILM77', via: '@CCFILM77' },
  { name: 'CC Nature Sounds', handle: '@CCNatureSounds', via: '@CCNatureSounds' },
  { name: 'Personality Plus', handle: '@PersonalityPlusCC', via: '@PersonalityPlusCC' }
];

async function checkAll() {
  console.log(`Checking ${CHANNELS.length} channels for active live video IDs...\n`);
  const activeStreams = [];

  for (const ch of CHANNELS) {
    try {
      const url = `https://www.youtube.com/${encodeURIComponent(ch.handle)}/live`;
      const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      const text = await res.text();
      const isLiveNow = text.includes('"isLive":true') || text.includes('"isLiveNow":true') || text.includes('badge-style-type-live-now');
      const vMatch = text.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      const titleMatch = text.match(/<title>(.*?)<\/title>/);
      const vid = vMatch ? vMatch[1] : null;
      const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : '';

      const isWatch = res.url.includes('/watch?v=');
      console.log(`[${ch.name.padEnd(25)}] isWatch=${isWatch} isLive=${isLiveNow} vid=${vid} title="${title.slice(0, 45)}"`);
      if (vid) {
        activeStreams.push({ ...ch, vid, title, isLiveNow });
      }
    } catch (e) {
      console.log(`[${ch.name}] ERR: ${e.message}`);
    }
  }

  console.log(`\nActive / found video IDs: ${activeStreams.length}`);
  const fs = await import('node:fs');
  fs.writeFileSync('scripts/active_live_streams_scan.json', JSON.stringify(activeStreams, null, 2), 'utf8');
}

checkAll();
