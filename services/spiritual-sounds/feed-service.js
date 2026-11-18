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

// ---------------------------------------------------------------------------------------------------------------
// Pełna playlista (ponad limit 200 pozycji odtwarzacza IFrame) — YouTube Data API v3, @007 2026-11-18.
// Klucz: WYŁĄCZNIE sekret Cloudflare `YT_API_KEY` (przekazany przez autora kanału, tylko odczyt danych publicznych).
// Klucz nigdy nie trafia do odpowiedzi, logów ani kodu. Bez klucza endpoint zwraca 503 i kanał działa w trybie playlisty.
// Cache 6 h — kilka zapytań na dobę, daleko poniżej darmowego limitu (10 000 jednostek/dzień).
// ---------------------------------------------------------------------------------------------------------------
const UNPLAYABLE = /^(Deleted video|Private video|Usunięty film|Prywatny film)$/i;

/** Pobiera wszystkie pozycje playlisty (kolejność autora). Zwraca [{id, title}] bez filmów usuniętych/prywatnych. */
export async function fetchFullPlaylist(list, key, fetchImpl = fetch, maxPages = 20) {
  const items = [];
  let pageToken = '';
  for (let page = 0; page < maxPages; page++) {
    const u = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    u.searchParams.set('part', 'snippet,status');
    u.searchParams.set('maxResults', '50');
    u.searchParams.set('playlistId', list);
    u.searchParams.set('key', key);
    if (pageToken) u.searchParams.set('pageToken', pageToken);
    const r = await fetchImpl(u.toString(), { headers: { Accept: 'application/json' } });
    if (!r.ok) {
      // Diagnoza bez klucza: tylko kod, status i powód z odpowiedzi Google (nigdy adres zapytania).
      let g = {}; try { g = ((await r.json()) || {}).error || {}; } catch (_) {}
      const err = new Error(`youtube-api ${r.status}`);
      err.detail = { http: r.status, status: String(g.status || ''), reason: String((g.errors && g.errors[0] && g.errors[0].reason) || ''),
        message: String(g.message || '').replace(/AIza[0-9A-Za-z_-]+/g, '[klucz]').slice(0, 160) };
      throw err;
    }
    const j = await r.json();
    for (const it of j.items || []) {
      const sn = it.snippet || {};
      const id = sn.resourceId && sn.resourceId.videoId;
      const privacy = it.status && it.status.privacyStatus;
      if (!id || !/^[\w-]{11}$/.test(id) || UNPLAYABLE.test(sn.title || '') || privacy === 'private') continue;
      if (sn.videoOwnerChannelId && sn.videoOwnerChannelId !== SS_CHANNEL_ID) continue;
      items.push({ id, title: decode(sn.title) });
    }
    pageToken = j.nextPageToken || '';
    if (!pageToken) break;
  }
  return items;
}

export async function handleSpiritualSoundsPlaylist(request, env, ctx, fetchImpl = fetch) {
  const url = new URL(request.url);
  const list = url.searchParams.get('list') || 'PLD0gxYiiSZMA';
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex' };
  if (request.method !== 'GET') return new Response(JSON.stringify({ ok: false, reason: 'method' }), { status: 405, headers });
  if (!SS_ALLOWED_PLAYLISTS.has(list)) return new Response(JSON.stringify({ ok: false, reason: 'playlist' }), { status: 400, headers });
  const key = env && env.YT_API_KEY;
  if (!key) return new Response(JSON.stringify({ ok: false, reason: 'brak-klucza' }), { status: 200, headers: { ...headers, 'Cache-Control': 'no-store' } });

  const cacheKey = new Request(`https://polskieradio.cc/api/spiritual-sounds/playlist?list=${list}`);
  const cache = (typeof caches !== 'undefined' && caches.default) ? caches.default : null;
  if (cache) { const hit = await cache.match(cacheKey); if (hit) return hit; }
  let items;
  try { items = await fetchFullPlaylist(list, key, fetchImpl); }
  catch (e) {
    // Status 200 + ok:false: Cloudflare na domenie podmienia odpowiedzi 5xx na własną stronę błędu.
    // Kanał przechodzi wtedy na tryb playlisty. Szczegóły bez klucza (adres zapytania nigdy nie wychodzi).
    return new Response(JSON.stringify({ ok: false, reason: 'youtube', detail: e.detail || null }), { status: 200, headers: { ...headers, 'Cache-Control': 'no-store' } });
  }
  if (!items.length) return new Response(JSON.stringify({ ok: false, reason: 'pusta' }), { status: 200, headers: { ...headers, 'Cache-Control': 'no-store' } });
  const body = JSON.stringify({ ok: true, playlist: list, total: items.length, items, fetchedAt: new Date().toISOString() });
  const res = new Response(body, { status: 200, headers: { ...headers, 'Cache-Control': 'public, max-age=21600' } });
  if (cache && ctx && ctx.waitUntil) ctx.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
