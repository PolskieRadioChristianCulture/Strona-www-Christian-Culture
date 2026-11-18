// Spiritual Sounds × CC — najnowsze nagrania z oficjalnych playlist autora (RSS YouTube), @007 2026-11-18.
// ZERO COST: publiczny kanał RSS YouTube, bez klucza API. Cache 30 min w Cloudflare.
// Tylko playlisty kanału Spiritual Sounds (lista dozwolonych) — endpoint nie jest otwartym proxy.

export const SS_CHANNEL_ID = 'UCaSBnRGUiiE-ySLlHacGpeQ';
export const SS_ALLOWED_PLAYLISTS = new Set([
  'PLD0gxYiiSZMA', // Psalmy i Słowo Boże w Muzyce (źródło kanału 24/7)
  'PLBpfEVvRZNuo', // Nadzieja
  'PLDpP3o66gJ4U', // Ufność
  'PLYbBAoBR7wig', // Pieśni z Księgi Izajasza
  'PLcaRxlJcJEjs', // Biblijny western: Głos z Synaju
  'PLdbrl4UN_wepjPhy4LRJduhznKdE5nBoq', // Spokój Duszy: Modlitwa bez Słów
]);

const decode = (s) => String(s || '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");

/** Parsuje Atom RSS YouTube do prostych rekordów (bez zależności). */
export function parseYouTubeFeed(xml) {
  const text = String(xml || '');
  const channelId = (text.match(/<yt:channelId>([^<]+)<\/yt:channelId>/) || [])[1] || '';
  const title = decode((text.split('<entry>')[0].match(/<title>([^<]*)<\/title>/) || [])[1]);
  const items = text.split('<entry>').slice(1).map((e) => ({
    id: (e.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/) || [])[1] || '',
    title: decode((e.match(/<title>([^<]*)<\/title>/) || [])[1]),
    published: (e.match(/<published>([^<]+)<\/published>/) || [])[1] || '',
  })).filter((it) => it.id && it.title);
  return { channelId, title, items };
}

export async function handleSpiritualSoundsFeed(request, ctx, fetchImpl = fetch) {
  const url = new URL(request.url);
  const list = url.searchParams.get('list') || 'PLD0gxYiiSZMA';
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=900',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex',
  };
  if (request.method !== 'GET') return new Response(JSON.stringify({ error: 'method' }), { status: 405, headers });
  if (!SS_ALLOWED_PLAYLISTS.has(list)) return new Response(JSON.stringify({ error: 'playlist' }), { status: 400, headers });

  const cacheKey = new Request(`https://polskieradio.cc/api/spiritual-sounds/feed?list=${list}`);
  const cache = (typeof caches !== 'undefined' && caches.default) ? caches.default : null;
  if (cache) { const hit = await cache.match(cacheKey); if (hit) return hit; }

  let body;
  try {
    const r = await fetchImpl(`https://www.youtube.com/feeds/videos.xml?playlist_id=${list}`, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CC-Feed/1.0)' } });
    if (!r.ok) throw new Error(`rss ${r.status}`);
    const feed = parseYouTubeFeed(await r.text());
    if (feed.channelId && feed.channelId !== SS_CHANNEL_ID) throw new Error('channel');
    body = { ok: true, playlist: list, title: feed.title, items: feed.items.slice(0, 15), fetchedAt: new Date().toISOString() };
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, playlist: list, items: [] }), { status: 502, headers: { ...headers, 'Cache-Control': 'no-store' } });
  }
  const res = new Response(JSON.stringify(body), { status: 200, headers: { ...headers, 'Cache-Control': 'public, max-age=1800' } });
  if (cache && ctx && ctx.waitUntil) ctx.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
