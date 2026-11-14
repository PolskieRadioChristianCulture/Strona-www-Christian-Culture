const handles = [
  'bibliaaudiocc', 'CCWomen7', 'CCMen7', 'wersetdnia_ChSB',
  'RobertŁukaszPio', 'katarzynafedkow', 'TopSeven_CC', 'ToDlaCiebieGramy',
  'CCPrayer24', 'ChristianCultureNetwork', 'CCBibleDeep', 'ChristianCulturePOP',
  'PoprawKoronęCC', 'WorshipLiveCC', 'ChristianCultureInstrumental',
  'CCIdentityTwojaDuchowaTożsamoś', 'CCFILM77', 'CCNatureSounds', 'PersonalityPlusCC'
];

for (const h of handles) {
  const res = await fetch('https://www.youtube.com/@' + encodeURIComponent(h) + '/live', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+667; SOCS=CAESHAgBEhJnd3NfMjAyMzA4MTAtMF9SQzIaAmVuIAEaBgiA_LyaBg'
    }
  });
  const html = await res.text();
  const m = html.match(/\"thumbnails\":\[\{\"url\":\"(https:[^\"\\]+)/);
  console.log(h.padEnd(30), '->', m ? m[1].slice(0, 80) + '...' : 'none');
}
