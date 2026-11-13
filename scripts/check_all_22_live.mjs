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

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8',
  'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+667; SOCS=CAESHAgBEhJnd3NfMjAyMzA4MTAtMF9SQzIaAmVuIAEaBgiA_LyaBg'
};

function extractJsonAfter(html, marker) {
  const idx = html.indexOf(marker);
  if (idx === -1) return null;
  let start = html.indexOf('{', idx + marker.length);
  if (start === -1) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
    } else {
      if (ch === '"') inStr = true;
      else if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          try { return JSON.parse(html.slice(start, i + 1)); }
          catch { return null; }
        }
      }
    }
  }
  return null;
}

async function checkOne(c, idx) {
  const url = `https://www.youtube.com/@${encodeURIComponent(c.handle)}/live`;
  try {
    const res = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(15000) });
    const html = await res.text();
    const pr = extractJsonAfter(html, 'var ytInitialPlayerResponse =');
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const pageTitle = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : 'unknown';

    if (!pr) {
      return `${String(idx+1).padStart(2,'0')}. ⚪ NO_PLAYER | ${c.name.padEnd(26)} | @${c.handle} | title=${pageTitle}`;
    }

    const status = pr.playabilityStatus?.status || 'UNKNOWN';
    const reason = pr.playabilityStatus?.reason || '';
    const vd = pr.videoDetails || {};
    const lbd = pr.microformat?.playerMicroformatRenderer?.liveBroadcastDetails || {};
    const sd = pr.streamingData || {};
    const hasMedia = Boolean(sd.hlsManifestUrl || sd.dashManifestUrl || (sd.formats && sd.formats.length) || (sd.adaptiveFormats && sd.adaptiveFormats.length));
    const trulyLive = (status === 'OK') && (vd.isLive === true) && !vd.isUpcoming && (lbd.isLiveNow === true);
    const badge = trulyLive ? '🟢 LIVE_OK  ' : '🔴 OFFLINE  ';
    return `${String(idx+1).padStart(2,'0')}. ${badge} | ${c.name.padEnd(26)} | status=${status} | isLive=${vd.isLive} | isLiveNow=${lbd.isLiveNow} | media=${hasMedia} | start=${lbd.startTimestamp || '-'} | vid=${vd.videoId || '-'} | ${reason || pageTitle}`;
  } catch (err) {
    return `${String(idx+1).padStart(2,'0')}. 🔴 ERROR     | ${c.name.padEnd(26)} | @${c.handle} | ${err.message}`;
  }
}

const results = await Promise.all(channels.map((c, idx) => checkOne(c, idx)));
for (const r of results) console.log(r);
