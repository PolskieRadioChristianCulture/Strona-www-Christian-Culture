import registry from '../data/cc-channels.json' with { type: 'json' };

export const CHANNELS = registry.channels;
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const normalize = value => '/' + String(value).split(/[?#]/)[0].replaceAll('\\','/').replace(/^\/+|\/+$/g,'').replace(/\/index\.html$/i,'').replace(/\.html$/i,'').toLowerCase();
export function channelForPath(value) {
  const path = normalize(value);
  return CHANNELS.find(channel => [channel.url,...channel.aliases].some(url => normalize(url) === path));
}

function image(channel, size=64) {
  return `<img src="${channel.image}?v=20261025_numbers1" width="${size}" height="${size}" alt="" loading="lazy" decoding="async">`;
}
function stylesheet(html) {
  if (!html.includes('/css/cc-channel-numbering.css')) {
    html = html.replace(/<\/head\s*>/i, '<link rel="stylesheet" href="/css/cc-channel-numbering.css?v=20261119_numbers3">\n</head>');
  } else {
    html = html.replace(/\/css\/cc-channel-numbering\.css(?:\?[^"']*)?/g, '/css/cc-channel-numbering.css?v=20261119_numbers3');
  }
  return html;
}
function ccnMobileStylesheet(html) {
  if (!html.includes('/css/cc-ccn-mobile.css')) {
    html = html.replace(/<\/head\s*>/i, '<link rel="stylesheet" href="/css/cc-ccn-mobile.css?v=20261119_ccnmob1">\n</head>');
  } else {
    html = html.replace(/\/css\/cc-ccn-mobile\.css(?:\?[^"']*)?/g, '/css/cc-ccn-mobile.css?v=20261119_ccnmob1');
  }
  return html;
}

export function applyChannelNumbering(file, html) {
  const path = normalize(file);
  if (path === '/nadawaj') {
    if (html.includes('data-cc-channel-number')) return html;
    let count=0;
    html=html.replace(/(<h[1-6]\b[^>]*class="card-title"[^>]*>\s*<a\b[^>]*href="([^"]+)"[^>]*>)/g,(tag,urlTag,url)=>{
      const channel=channelForPath(url);
      if(!channel || channel.kind!=='broadcast') return tag;
      count++;
      return `${urlTag}<span class="cc-broadcast-number" data-cc-channel-number="${channel.number}">${image(channel)}<span>Kanał ${channel.number}</span></span>`;
    });
    if(count) html=stylesheet(html);
    return html;
  }
  const channel=channelForPath(file);
  // Broadcast scene files, including protected scenes, are never changed here.
  if(!channel || channel.kind!=='ccn') return html;
  html = ccnMobileStylesheet(stylesheet(html));
  if (html.includes('id="cc-channel-identity"')) return html;
  const bar=`<aside id="cc-channel-identity" class="cc-channel-identity" aria-label="Tożsamość kanału"><a class="cc-channel-mark" href="${channel.url}" aria-label="Kanał ${channel.number} — ${escape(channel.title)}">${image(channel)}</a><div class="cc-channel-name"><span>Kanał ${channel.number}</span><strong>${escape(channel.title)}</strong></div><a class="cc-channel-directory" href="/kanaly">Wszystkie kanały <span aria-hidden="true">→</span></a></aside>`;
  return html.replace(/<body\b[^>]*>/i,tag=>tag+'\n'+bar);
}

export function renderChannelDirectory() {
  const cards=kind=>CHANNELS.filter(c=>c.kind===kind).map(c=>`<a class="cc-channel-card" href="${c.url}">${image(c,160)}<span>Kanał ${c.number}</span><h3>${escape(c.title)}</h3></a>`).join('\n');
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kanały 1–37 — Christian Culture i CCN</title><meta name="description" content="Wspólny katalog 17 kanałów nadawczych Christian Culture i 20 portali tematycznych CCN. Znajdź swój kanał po numerze."><link rel="canonical" href="https://polskieradio.cc/kanaly"><link rel="stylesheet" href="/css/cc-channel-numbering.css?v=20261119_numbers3"></head><body class="cc-channel-guide"><a class="cc-channel-skip" href="#katalog">Przejdź do katalogu</a><header><a href="/">Christian Culture</a><a href="/nadawaj">Katalog nadawania</a><a href="/news">CCN News</a></header><main id="katalog"><h1>Znajdź swój kanał</h1><p>Jeden numer, jedna droga do treści Christian Culture. Wersje pionowe zachowują numer kanału.</p><section aria-labelledby="broadcast-title"><h2 id="broadcast-title">Kanały nadawcze · 1–17</h2><div class="cc-channel-grid">${cards('broadcast')}</div></section><section aria-labelledby="ccn-title"><h2 id="ccn-title">Portale CCN · 18–37</h2><div class="cc-channel-grid">${cards('ccn')}</div></section></main><footer><a href="/privacy">Polityka prywatności</a><p>Christian Culture · EkoCC</p></footer></body></html>\n`;
}
