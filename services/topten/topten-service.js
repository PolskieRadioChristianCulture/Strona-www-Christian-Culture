/**
 * topTEN Christian Culture — API notowań, nominacji i powiadomień.
 * Integracja: _worker.js → handleTopTenApi(request, env, ctx, { verifyToken }).
 * Baza: Cloudflare D1, binding env.topten_db (schemat: migrations/topten/0001_topten.sql).
 * Spec: docs/TOPTEN_WSPIERAMTO_SPECYFIKACJA_ETAP_II.md • @007 • 2026-11-01
 *
 * Zasady (§2–§3): punkty liczy wyłącznie serwer; LubięTO 1x/dobę Europe/Warsaw (+777),
 * PodbijTO max 7x/dobę z odstępem ≥60 min (+77); limity wymuszone unikalnością w bazie,
 * klucze idempotencji, cykl tygodniowy niedziela 20:00 – niedziela 20:00 Europe/Warsaw (decyzja L0 01.11.2026).
 */
import { dispatchGmailEmail as dispatchGmailRaw } from '../cc-newsletter/gmail-smtp-client.js';

// Klient SMTP zawsze dołącza część HTML, a Gmail pokazuje właśnie ją — bez HTML mail wygląda na pusty.
// Każdy mail topTEN dostaje więc HTML z tą samą treścią i klikalnymi linkami.
export function withMailHtml(m) {
  if (m.html) return m;
  const esc = String(m.text || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const body = esc.replace(/https:\/\/[^\s<]+/g, u => `<a href="${u}">${u}</a>`).replace(/\n/g, '<br>\n');
  return { ...m, html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#1c1815">${body}</div>` };
}
const dispatchGmailEmail = (m, env) => dispatchGmailRaw(withMailHtml(m), env);
import {
  getFlags, ensureWeek, standingsFor, officialSnapshot, finalizeWeek, planRoster, debutQueue, songArchive, songHistory,
  allTimePoints, lastOfficial, rebuildTotals, weekBounds, FLAG_NAMES, RULES_VERSION, TOP_SIZE, ROSTER_MAX,
} from './topten-weeks.js';

export const LIKE_POINTS = 777;
export const BOOST_POINTS = 77;
export const BOOSTS_PER_DAY = 7;
export const BOOST_INTERVAL_MS = 60 * 60 * 1000;
// 2026-11-01-yt: licencja obejmuje też oficjalny kanał YouTube „topTEN | Christian Culture” (decyzja L0 01.11.2026).
export const LICENSE_VERSION = '2026-11-01-yt';
const NOMINATIONS_PER_IP_PER_DAY = 5;
const NOTIFICATIONS_PER_USER_PER_DAY = 3;
const NOTIFY_RANK_STEP = 3;
const EDITORIAL_EMAIL = 'radiochristianculture@gmail.com';
const ADMIN_EMAILS = new Set(['nazirczarkes@gmail.com', 'radiochristianculture@gmail.com']);
const GENRES = new Set(['worship', 'gospel', 'pop', 'rock', 'hiphop', 'debiuty', 'klasyka']);
const NOMINATION_STATUSES = new Set(['submitted', 'awaiting_media', 'theological_review', 'rights_review',
  'approved', 'published', 'rejected', 'withdrawn', 'takedown']);
const SUPPORT_HOSTS = ['zrzutka.pl', 'revolut.me', 'paypal.me', 'paypal.com', 'patronite.pl'];
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /\.push\.apple\.com$/, /\.notify\.windows\.com$/];

class ApiError extends Error {
  constructor(status, code, message) { super(message || code); this.status = status; this.code = code; }
}

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex',
  },
});

// ─── Czas Europe/Warsaw ──────────────────────────────────────────────────────
const warsawFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit',
  weekday: 'short', hour: '2-digit', hour12: false,
});
const WEEKDAYS = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

// Tydzień notowania (decyzja L0 01.11.2026): od niedzieli 20:00 do następnej niedzieli 20:00 Europe/Warsaw.
// Identyfikator tygodnia = data poniedziałku, który po nim następuje. Doba dla limitów LubięTO/PodbijTO
// pozostaje kalendarzowa (od północy). Zmiana czasu wypada w niedzielę nad ranem, więc nie dotyka granicy 20:00.
export const CYCLE_CLOSE_HOUR = 20;
const CYCLE_SHIFT_MS = (24 - CYCLE_CLOSE_HOUR) * 3600 * 1000;

function warsawParts(ms) {
  const p = Object.fromEntries(warsawFmt.formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  return { localDate: `${p.year}-${p.month}-${p.day}`, weekday: WEEKDAYS[p.weekday], hour: Number(p.hour) % 24 };
}

export function warsawClock(ms) {
  const { localDate, weekday, hour } = warsawParts(ms);
  const shifted = warsawParts(ms + CYCLE_SHIFT_MS); // niedziela 20:00 + 4 h = poniedziałek 00:00 → nowy tydzień
  return { localDate, weekday, hour, cycleId: addDays(shifted.localDate, -shifted.weekday) };
}

export function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function cycleInfo(cycleId, liveCycleId) {
  const hh = `${String(CYCLE_CLOSE_HOUR).padStart(2, '0')}:00`;
  return { id: cycleId, start: `${addDays(cycleId, -1)} ${hh}`, end: `${addDays(cycleId, 6)} ${hh}`, timezone: 'Europe/Warsaw', status: cycleId === liveCycleId ? 'live' : 'closed' };
}

// ─── Pomocnicze ──────────────────────────────────────────────────────────────
const text = (v, max) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '');
const longText = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[a-z]{2,24}$/i;

function httpsUrl(value, hosts) {
  if (!value) return '';
  let u;
  try { u = new URL(value); } catch { return null; }
  if (u.protocol !== 'https:' || u.username || u.password) return null;
  const host = u.hostname.toLowerCase();
  if (hosts && !hosts.some(h => host === h || host.endsWith(`.${h}`))) return null;
  return u.toString();
}

// ─── Kody QR wsparcia (spec. §7): przechowujemy tylko odczytaną treść, nie obraz ──
// Rachunek NRB (26 cyfr) — suma kontrolna jak IBAN PL (mod 97 = 1).
export function validNrb(digits) {
  if (!/^\d{26}$/.test(digits)) return false;
  const s = `${digits.slice(2)}2521${digits.slice(0, 2)}`; // P=25, L=21
  let r = 0;
  for (const ch of s) r = (r * 10 + Number(ch)) % 97;
  return r === 1;
}

// Dozwolone: link https do serwisu wsparcia albo kod „przelew” w standardzie ZBP
// (NIP|PL|NRB|kwota w groszach|odbiorca|tytuł|||). Jednorazowy kod BLIK i wszystko inne — odrzucone.
export function parseSupportQr(raw) {
  const v = typeof raw === 'string' ? raw.trim() : '';
  if (!v || v.length > 300) return null;
  if (/^\d{6}$/.test(v.replace(/\s/g, ''))) return null; // jednorazowy kod BLIK — nigdy
  if (/^https:\/\//i.test(v)) {
    const url = httpsUrl(v, SUPPORT_HOSTS);
    return url ? { kind: 'link', payload: url, host: new URL(url).hostname.replace(/^www\./, '') } : null;
  }
  const f = v.split('|');
  if (f.length < 6 || f.length > 9) return null;
  const [nip, country, nrb, amount, name, title] = f;
  if (nip && !/^\d{10}$/.test(nip)) return null;
  if (country !== 'PL' || !validNrb(nrb)) return null;
  if (amount && !/^\d{6}$/.test(amount)) return null;
  const recipient = name.trim();
  if (!recipient || recipient.length > 20 || title.length > 32 || /[<>]/.test(recipient + title)) return null;
  return {
    kind: 'transfer', payload: v, recipient, title: title.trim(),
    account: nrb.replace(/^(\d{2})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})$/, '$1 $2 $3 $4 $5 $6 $7'),
    amount: amount && Number(amount) > 0 ? (Number(amount) / 100).toFixed(2).replace('.', ',') + ' zł' : null,
  };
}

export function youtubeId(value) {
  if (!value) return '';
  let u;
  try { u = new URL(value); } catch { return null; }
  const host = u.hostname.replace(/^www\.|^m\./, '');
  let id = '';
  if (host === 'youtu.be') id = u.pathname.slice(1);
  else if (host === 'youtube.com') id = u.searchParams.get('v') || (u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/) || [])[1] || '';
  return /^[\w-]{11}$/.test(id) ? id : null;
}

async function sha256Hex(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function ipHash(request) {
  const ip = request.headers.get('CF-Connecting-IP') || '';
  return ip ? (await sha256Hex(`topten:${ip}`)).slice(0, 32) : null;
}

const parseSupport = (s) => { try { const a = JSON.parse(s || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } };

function publicTrack(t) {
  return {
    id: t.id, title: t.title, artist: t.artist, genre: t.genre, bibleRef: t.bible_ref,
    youtubeId: t.youtube_id || null, cover: t.cover_url || (t.youtube_id ? `https://i.ytimg.com/vi/${t.youtube_id}/hqdefault.jpg` : null),
    profileUrl: t.profile_url || null, support: parseSupport(t.support_json),
  };
}

async function audit(db, actor, action, objectId, details) {
  await db.prepare('INSERT INTO topten_audit_log (actor, action, object_id, details, ts) VALUES (?, ?, ?, ?, ?)')
    .bind(actor, action, objectId, details ? JSON.stringify(details) : null, new Date().toISOString()).run();
}

// ─── Autoryzacja ─────────────────────────────────────────────────────────────
async function requireUser(request, verifyToken) {
  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) throw new ApiError(401, 'login_required', 'Zaloguj się, aby głosować.');
  let claims = null;
  try { claims = await verifyToken(token); } catch { claims = null; }
  if (!claims?.sub) throw new ApiError(401, 'login_required', 'Sesja wygasła — zaloguj się ponownie.');
  if (claims.email_verified !== true) throw new ApiError(403, 'email_unverified', 'Głosować mogą konta z potwierdzonym adresem e-mail.');
  return { uid: claims.sub, email: String(claims.email || '').toLowerCase() };
}

async function requireAdmin(request, verifyToken) {
  const user = await requireUser(request, verifyToken);
  if (!ADMIN_EMAILS.has(user.email)) throw new ApiError(403, 'forbidden', 'Brak uprawnień redakcji.');
  return user;
}

// ─── Ranking ─────────────────────────────────────────────────────────────────
export async function computeRanking(db, cycleId, { live }) {
  const tracks = (await db.prepare(live
    ? "SELECT * FROM topten_tracks WHERE status = 'published' AND pool_status = 'active'"
    : "SELECT t.* FROM topten_tracks t WHERE t.status != 'takedown' AND EXISTS (SELECT 1 FROM topten_events e WHERE e.track_id = t.id AND e.cycle_id = ?)")
    .bind(...(live ? [] : [cycleId])).all()).results || [];
  // Liczniki inkrementalne (migracja 0002) — bez skanowania wszystkich głosów tygodnia.
  const agg = (await db.prepare(`SELECT track_id, points AS score, voters, likes, boosts, last_at
    FROM topten_week_totals WHERE cycle_id = ?`).bind(cycleId).all()).results || [];
  const byId = new Map(agg.map(r => [r.track_id, r]));
  const items = tracks.map(t => {
    const a = byId.get(t.id) || {};
    return { ...publicTrack(t), score: a.score || 0, voters: a.voters || 0, likes: a.likes || 0, boosts: a.boosts || 0, lastAt: a.last_at || null, createdAt: t.created_at };
  });
  // Remisy (§2): unikalni głosujący → więcej LubięTO → wcześniejsze osiągnięcie wyniku.
  items.sort((x, y) => y.score - x.score || y.voters - x.voters || y.likes - x.likes
    || (x.lastAt ?? Infinity) - (y.lastAt ?? Infinity) || String(x.createdAt).localeCompare(String(y.createdAt)));
  items.forEach((it, i) => { it.rank = i + 1; delete it.createdAt; });
  return items;
}

// ─── Naturalna rywalizacja (flaga topten_natural_ranking_v1) ─────────────────
async function naturalLiveCharts(db, nowMs, flags) {
  const week = await ensureWeek(db, nowMs);
  const weekId = week.id;
  const cycle = cycleInfo(weekId, weekId);
  if (week.status === 'preparing') {
    return { cycle, items: [], updatedAt: new Date(nowMs).toISOString(), natural: { rulesVersion: RULES_VERSION, status: 'preparing' } };
  }
  const standings = await standingsFor(db, weekId);
  const trackRows = standings.length
    ? (await db.prepare(`SELECT * FROM topten_tracks WHERE id IN (${standings.map(() => '?').join(',')})`).bind(...standings.map(s => s.track_id)).all()).results || []
    : [];
  const byId = new Map(trackRows.map(t => [t.id, t]));
  const prevSnap = await officialSnapshot(db, addDays(weekId, -7));
  const prevRanks = new Map((prevSnap?.rows || []).map(r => [r.track_id, r.rank]));
  const allTime = await allTimePoints(db);
  const items = standings.filter(s => flags.waitingRoom || s.rank <= TOP_SIZE).map(s => {
    const t = byId.get(s.track_id);
    const suspended = t?.pool_status === 'suspended';
    const base = publicTrack(t);
    return {
      ...base, ...(suspended ? { youtubeId: null, cover: null, support: [] } : {}),
      score: s.points, voters: s.unique_like_voters, likes: s.likes, boosts: s.boosts, lastAt: s.reached_at,
      rank: s.rank, bucket: s.bucket, prevRank: prevRanks.get(s.track_id) ?? null, entry: s.entry_type,
      suspended, allTimePoints: (allTime.get(s.track_id) || 0) + s.points,
    };
  });
  return {
    cycle, items, updatedAt: new Date(nowMs).toISOString(),
    natural: {
      rulesVersion: RULES_VERSION, status: week.status, provisional: true, noVotesYet: standings.every(s => s.points === 0),
      waitingRoom: flags.waitingRoom, archive: flags.archive, rosterMax: ROSTER_MAX, topSize: TOP_SIZE,
      queue: await debutQueue(db, weekId), lastOfficial: await lastOfficial(db, weekId),
    },
  };
}

async function snapshotCharts(db, weekId, liveCycleId) {
  const snap = await officialSnapshot(db, weekId);
  if (!snap) return null;
  const trackRows = snap.rows.length
    ? (await db.prepare(`SELECT * FROM topten_tracks WHERE id IN (${snap.rows.map(() => '?').join(',')})`).bind(...snap.rows.map(r => r.track_id)).all()).results || []
    : [];
  const byId = new Map(trackRows.map(t => [t.id, t]));
  const prevSnap = await officialSnapshot(db, addDays(weekId, -7));
  const prevRanks = new Map((prevSnap?.rows || []).map(r => [r.track_id, r.rank]));
  return {
    cycle: { ...cycleInfo(weekId, liveCycleId), official: true, version: snap.week.snapshot_version, checksum: snap.week.checksum },
    items: snap.rows.map(r => {
      const t = byId.get(r.track_id);
      const visible = t && t.status === 'published' && t.pool_status !== 'suspended';
      return {
        ...(visible ? publicTrack(t) : { id: r.track_id, support: [] }), title: r.title, artist: r.artist,
        score: r.points, voters: r.unique_like_voters, likes: r.likes, boosts: r.boosts, rank: r.rank, bucket: r.bucket,
        prevRank: prevRanks.get(r.track_id) ?? null,
      };
    }),
    awards: snap.awards.map(a => ({ type: a.award_type, id: a.track_id, explanation: a.explanation })),
    updatedAt: snap.week.finalized_at,
  };
}

async function charts(db, url, nowMs) {
  const { cycleId: liveCycleId } = warsawClock(nowMs);
  const requested = url.searchParams.get('cycle');
  const cycleId = requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) ? requested : liveCycleId;
  if (cycleId > liveCycleId) throw new ApiError(404, 'cycle_not_found', 'To notowanie jeszcze się nie rozpoczęło.');
  const flags = await getFlags(db);
  if (flags.natural) {
    if (cycleId === liveCycleId) return naturalLiveCharts(db, nowMs, flags);
    const official = await snapshotCharts(db, cycleId, liveCycleId);
    if (official) return official;
  }
  const items = await computeRanking(db, cycleId, { live: cycleId === liveCycleId });
  const prev = await computeRanking(db, addDays(cycleId, -7), { live: false });
  const prevRanks = new Map(prev.map(p => [p.id, p.rank]));
  items.forEach(it => { it.prevRank = prevRanks.get(it.id) ?? null; });
  return { cycle: cycleInfo(cycleId, liveCycleId), items, updatedAt: new Date(nowMs).toISOString() };
}

// Ranking bieżącego tygodnia: wspólna pamięć podręczna (Cache API, 10 s) — chroni darmowy limit odczytów D1
// przy odpytywaniu co 30 s, podglądach linków i SEO. Po każdym głosie / decyzji redakcji liczony od nowa.
const LIVE_CACHE_SECONDS = 10;
const localMemo = new WeakMap(); // gdy brak Cache API (testy, dev)
const liveCacheKey = (cycleId) => new Request(`https://polskieradio.cc/__topten-cache/charts/${cycleId}`);

export async function liveCharts(db, nowMs, { fresh = false } = {}) {
  const { cycleId } = warsawClock(nowMs);
  const cache = globalThis.caches?.default;
  if (!fresh) {
    if (cache) {
      const hit = await cache.match(liveCacheKey(cycleId)).catch(() => null);
      if (hit) return hit.json();
    } else {
      const m = localMemo.get(db);
      if (m && m.cycleId === cycleId && nowMs - m.at < LIVE_CACHE_SECONDS * 1000) return m.data;
    }
  }
  const data = await charts(db, new URL('https://polskieradio.cc/api/topten/charts'), nowMs);
  if (cache) {
    await cache.put(liveCacheKey(cycleId), new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${LIVE_CACHE_SECONDS}` },
    })).catch(() => {});
  } else {
    localMemo.set(db, { cycleId, at: nowMs, data });
  }
  return data;
}

async function cycles(db, nowMs) {
  const { cycleId: liveCycleId } = warsawClock(nowMs);
  const rows = (await db.prepare('SELECT cycle_id, SUM(likes + boosts) AS events FROM topten_week_totals GROUP BY cycle_id ORDER BY cycle_id DESC LIMIT 104').all()).results || [];
  const list = rows.map(r => ({ ...cycleInfo(r.cycle_id, liveCycleId), events: r.events }));
  if (!list.some(c => c.id === liveCycleId)) list.unshift({ ...cycleInfo(liveCycleId, liveCycleId), events: 0 });
  return { items: list };
}

// ─── Głosy ───────────────────────────────────────────────────────────────────
async function myState(db, uid, nowMs) {
  const { localDate } = warsawClock(nowMs);
  const rows = (await db.prepare(`SELECT track_id, action, (local_date = ?1) AS today, COUNT(*) AS n, MAX(created_at) AS last_at FROM topten_events
    WHERE user_id = ?2 AND (local_date = ?1 OR (action = 'boost' AND created_at > ?3)) GROUP BY track_id, action, today`)
    .bind(localDate, uid, nowMs - BOOST_INTERVAL_MS).all()).results || [];
  const follows = (await db.prepare('SELECT track_id FROM topten_follows WHERE user_id = ?').bind(uid).all()).results || [];
  const tracks = {};
  const get = (id) => (tracks[id] ||= { likedToday: false, boostsToday: 0, nextBoostAt: null, following: false });
  for (const r of rows) {
    const t = get(r.track_id);
    if (r.action === 'like') t.likedToday = true;
    else {
      // Wiersze z bieżącej doby liczą się do limitu; każdy ostatni boost (także sprzed północy) do odstępu 60 min.
      if (r.today === 1) t.boostsToday += r.n;
      t.nextBoostAt = Math.max(t.nextBoostAt || 0, r.last_at + BOOST_INTERVAL_MS);
    }
  }
  for (const f of follows) get(f.track_id).following = true;
  for (const t of Object.values(tracks)) if (t.nextBoostAt && t.nextBoostAt <= nowMs) t.nextBoostAt = null;
  return { localDate, tracks, limits: { likePoints: LIKE_POINTS, boostPoints: BOOST_POINTS, boostsPerDay: BOOSTS_PER_DAY, boostIntervalMin: 60 } };
}

function idempotencyKey(request, uid, trackId, action) {
  const k = text(request.headers.get('Idempotency-Key') || '', 80);
  if (!/^[\w-]{8,80}$/.test(k)) throw new ApiError(400, 'idempotency_key_required', 'Brak klucza idempotencji.');
  return `${uid}:${trackId}:${action}:${k}`;
}

async function vote(db, request, user, trackId, action, nowMs) {
  const { localDate, cycleId } = warsawClock(nowMs);
  const key = idempotencyKey(request, user.uid, trackId, action);
  const ih = await ipHash(request);
  const published = await db.prepare("SELECT id FROM topten_tracks WHERE id = ? AND status = 'published'").bind(trackId).first();
  if (!published) throw new ApiError(404, 'track_not_found', 'Utwór nie jest w bieżącym notowaniu.');

  // Naturalna rywalizacja: głosy tylko na utwory aktywnej puli tygodnia (nie kolejka, archiwum ani zawieszone).
  const natural = (await getFlags(db)).natural;
  if (natural) {
    const week = await ensureWeek(db, nowMs);
    if (week.status === 'preparing') throw new ApiError(503, 'week_preparing', 'Startuje nowe notowanie — spróbuj za chwilę.');
    const t = await db.prepare(`SELECT t.pool_status, r.track_id AS in_roster FROM topten_tracks t
        LEFT JOIN topten_week_roster r ON r.track_id = t.id AND r.week_id = ? WHERE t.id = ?`).bind(cycleId, trackId).first();
    if (t?.pool_status === 'suspended') throw new ApiError(423, 'suspended', 'Zawieszone ze względów prawnych — głosowanie niedostępne.');
    if (!t?.in_roster) throw new ApiError(409, 'not_in_roster', t?.pool_status === 'queued' ? 'Ten utwór czeka na start w najbliższym notowaniu.' : 'Ten utwór nie bierze udziału w bieżącym notowaniu.');
  }

  const replay = await db.prepare('SELECT id FROM topten_events WHERE idempotency_key = ?').bind(key).first();
  if (replay) return { accepted: true, replay: true };

  // Warunek puli w tej samej instrukcji co zapis — głos z granicy tygodnia nie trafi do utworu spoza puli.
  const rosterGuard = natural
    ? ` AND EXISTS (SELECT 1 FROM topten_week_roster r JOIN topten_tracks t ON t.id = r.track_id
          WHERE r.week_id = ?3 AND r.track_id = ?2 AND t.pool_status = 'active')`
    : '';
  // Jedna instrukcja INSERT…SELECT: warunki i zapis są atomowe; UNIQUE(user,track,dzień,akcja,slot) blokuje wyścigi.
  const sql = action === 'like'
    ? `INSERT INTO topten_events (user_id, track_id, cycle_id, local_date, action, slot, points, created_at, idempotency_key, ip_hash)
       SELECT ?1, ?2, ?3, ?4, 'like', 0, ${LIKE_POINTS}, ?5, ?6, ?7
       WHERE NOT EXISTS (SELECT 1 FROM topten_events WHERE user_id = ?1 AND track_id = ?2 AND local_date = ?4 AND action = 'like')${rosterGuard}`
    : `INSERT INTO topten_events (user_id, track_id, cycle_id, local_date, action, slot, points, created_at, idempotency_key, ip_hash)
       SELECT ?1, ?2, ?3, ?4, 'boost',
         (SELECT COUNT(*) FROM topten_events WHERE user_id = ?1 AND track_id = ?2 AND local_date = ?4 AND action = 'boost') + 1,
         ${BOOST_POINTS}, ?5, ?6, ?7
       WHERE (SELECT COUNT(*) FROM topten_events WHERE user_id = ?1 AND track_id = ?2 AND local_date = ?4 AND action = 'boost') < ${BOOSTS_PER_DAY}
         AND NOT EXISTS (SELECT 1 FROM topten_events WHERE user_id = ?1 AND track_id = ?2 AND action = 'boost' AND created_at > ?5 - ${BOOST_INTERVAL_MS})${rosterGuard}`;
  let changes = 0;
  try {
    const res = await db.prepare(sql).bind(user.uid, trackId, cycleId, localDate, nowMs, key, ih).run();
    changes = res?.meta?.changes ?? 0;
  } catch (e) {
    if (!/UNIQUE|constraint/i.test(String(e?.message || e))) throw e;
    const again = await db.prepare('SELECT id FROM topten_events WHERE idempotency_key = ?').bind(key).first();
    if (again) return { accepted: true, replay: true };
    changes = 0;
  }
  if (changes === 1) return { accepted: true, replay: false };

  if (action === 'like') throw new ApiError(429, 'like_used_today', 'LubięTO dla tego utworu dostępne jutro.');
  const st = (await myState(db, user.uid, nowMs)).tracks[trackId] || {};
  if ((st.boostsToday || 0) >= BOOSTS_PER_DAY) throw new ApiError(429, 'boost_limit', 'Wykorzystano 7/7 PodbijTO dla tego utworu dziś.');
  const mins = st.nextBoostAt ? Math.max(1, Math.ceil((st.nextBoostAt - nowMs) / 60000)) : 60;
  throw new ApiError(429, 'boost_cooldown', `PodbijTO ponownie za ${mins} min.`);
}

// ─── Alerty nietypowych głosów (§9, §22): sygnał dla redakcji, bez automatycznych blokad ───
// Wspólne łącze (rodzina, parafia, szkoła) samo w sobie nie jest naruszeniem — decyzję podejmuje człowiek w panelu.
const ALERT_COOLDOWN_MS = 6 * 3600 * 1000;
const alertThresholds = (env) => ({
  spikePerHour: Number(env?.TOPTEN_ALERT_SPIKE_PER_HOUR) || 120,
  networkUsers: Number(env?.TOPTEN_ALERT_NETWORK_USERS) || 8,
});

export async function checkVoteAnomalies(db, env, trackId, nowMs, ih) {
  const th = alertThresholds(env);
  const { localDate } = warsawClock(nowMs);
  const found = [];
  // LIMIT ogranicza odczyt do progu — koszt nie rośnie z popularnością utworu.
  const spike = await db.prepare(`SELECT COUNT(*) AS n FROM (SELECT 1 FROM topten_events
      WHERE track_id = ? AND created_at > ? AND review_status = 'ok' LIMIT ?)`).bind(trackId, nowMs - 3600_000, th.spikePerHour).first();
  if ((spike?.n || 0) >= th.spikePerHour) found.push({ action: 'alert.vote_spike', details: { votesLastHour: `≥${th.spikePerHour}` } });
  if (ih) {
    const net = await db.prepare(`SELECT COUNT(DISTINCT user_id) AS n FROM (SELECT user_id FROM topten_events
        WHERE ip_hash = ? AND track_id = ? AND local_date = ? LIMIT 500)`).bind(ih, trackId, localDate).first();
    if ((net?.n || 0) >= th.networkUsers) found.push({ action: 'alert.shared_network', details: { accountsSameNetworkToday: net.n, network: ih.slice(0, 8) } });
  }
  const sent = [];
  for (const a of found) {
    const recent = await db.prepare('SELECT 1 FROM topten_audit_log WHERE action = ? AND object_id = ? AND ts > ? LIMIT 1')
      .bind(a.action, trackId, new Date(nowMs - ALERT_COOLDOWN_MS).toISOString()).first();
    if (recent) continue;
    // Ten sam zegar co w warunku przerwy (czas żądania), nie zegar systemowy.
    await db.prepare('INSERT INTO topten_audit_log (actor, action, object_id, details, ts) VALUES (?, ?, ?, ?, ?)')
      .bind('system', a.action, trackId, JSON.stringify(a.details), new Date(nowMs).toISOString()).run();
    sent.push(a.action);
    const track = await db.prepare('SELECT title, artist FROM topten_tracks WHERE id = ?').bind(trackId).first();
    const what = a.action === 'alert.vote_spike'
      ? `co najmniej ${th.spikePerHour} przyjętych głosów w ciągu ostatniej godziny`
      : `${a.details.accountsSameNetworkToday} różnych kont z jednej sieci (skrót ${a.details.network}) głosuje dziś na ten utwór`;
    await dispatchGmailEmail({
      deliveryType: 'transactional', toEmail: EDITORIAL_EMAIL,
      subject: `topTEN — ALERT: nietypowe głosy na ${trackId}`,
      text: [
        `Utwór: ${trackId} — „${track?.title || '?'}” (${track?.artist || '?'})`, `Sygnał: ${what}.`, '',
        'To tylko sygnał do sprawdzenia — system niczego nie zablokował. Wspólne łącze samo w sobie nie jest naruszeniem.',
        'Panel → „Głosy i nadużycia” (filtr po utworze): wstrzymaj lub unieważnij podejrzane głosy; decyzja trafia do audytu.',
        '', 'https://polskieradio.cc/topTEN/panel/',
      ].join('\n'),
    }, env).catch(() => {});
  }
  return sent;
}

// ─── Nominacje ───────────────────────────────────────────────────────────────
export function validateNomination(body) {
  const errors = {};
  const n = {
    artist: text(body.artistName, 120), title: text(body.trackTitle, 160), genre: text(body.genre, 20),
    language: text(body.language, 80), bibleRef: longText(body.bibleRef, 1500),
    driveUrl: httpsUrl(text(body.driveUrl, 500), ['drive.google.com', 'docs.google.com']),
    youtubeUrl: text(body.youtubeUrl, 300), supportUrl: httpsUrl(text(body.supportLink, 300), SUPPORT_HOSTS),
    submitterName: text(body.submitterName, 120), submitterEmail: text(body.submitterEmail, 254).toLowerCase(),
  };
  if (n.artist.length < 2) errors.artistName = 'Podaj nazwę wykonawcy.';
  if (n.title.length < 2) errors.trackTitle = 'Podaj tytuł utworu.';
  if (!GENRES.has(n.genre)) errors.genre = 'Wybierz gatunek.';
  if (n.language.length < 2) errors.language = 'Podaj język i kraj.';
  if (n.bibleRef.length < 5) errors.bibleRef = 'Wskaż odniesienie biblijne.';
  if (!n.driveUrl) errors.driveUrl = 'Podaj link https do pliku na Google Drive.';
  if (n.youtubeUrl && !youtubeId(n.youtubeUrl)) errors.youtubeUrl = 'Nieprawidłowy link YouTube.';
  if (n.supportUrl === null) errors.supportLink = `Link wsparcia musi prowadzić do: ${SUPPORT_HOSTS.join(', ')}.`;
  if (n.submitterName.length < 3) errors.submitterName = 'Podaj imię i nazwisko.';
  if (!EMAIL_RE.test(n.submitterEmail)) errors.submitterEmail = 'Podaj poprawny adres e-mail.';
  if (body.declareRights !== true) errors.declareRights = 'Wymagane oświadczenie o prawach.';
  if (body.declareLicense !== true) errors.declareLicense = 'Wymagana licencja publikacji.';
  if (body.declareTheology !== true) errors.declareTheology = 'Wymagana akceptacja regulaminu.';
  return { n, errors };
}

async function createNomination(db, request, env, ctx, verifyToken, nowMs) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') throw new ApiError(400, 'bad_json', 'Nieprawidłowe dane formularza.');
  if (body.website) throw new ApiError(400, 'rejected', 'Zgłoszenie odrzucone.'); // honeypot
  const { n, errors } = validateNomination(body);
  if (Object.keys(errors).length) return json({ ok: false, error: 'validation', fields: errors }, 422);

  const ih = await ipHash(request);
  const since = new Date(nowMs - 86400000).toISOString();
  if (ih) {
    const c = await db.prepare('SELECT COUNT(*) AS n FROM topten_nominations WHERE ip_hash = ? AND submitted_at > ?').bind(ih, since).first();
    if ((c?.n || 0) >= NOMINATIONS_PER_IP_PER_DAY) throw new ApiError(429, 'rate_limited', 'Przekroczono dzienny limit zgłoszeń. Spróbuj jutro.');
  }
  let uid = null;
  if (request.headers.get('Authorization')) { try { uid = (await requireUser(request, verifyToken)).uid; } catch { uid = null; } }

  const year = new Date(nowMs).getUTCFullYear();
  const submittedAt = new Date(nowMs).toISOString();
  let id = null;
  for (let attempt = 0; attempt < 5 && !id; attempt++) {
    const row = await db.prepare('SELECT COALESCE(MAX(seq), 0) + 1 AS next FROM topten_nominations').first();
    const candidate = `CC-TT-${year}-${String(row.next).padStart(4, '0')}`;
    try {
      await db.prepare(`INSERT INTO topten_nominations (id, seq, artist, title, genre, language, bible_ref, drive_url, youtube_url, support_url,
          submitter_name, submitter_email, submitter_uid, rights_declared, license_granted, rules_accepted, license_version, ip_hash, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1, ?, ?, ?)`)
        .bind(candidate, row.next, n.artist, n.title, n.genre, n.language, n.bibleRef, n.driveUrl, n.youtubeUrl || null, n.supportUrl || null,
          n.submitterName, n.submitterEmail, uid, LICENSE_VERSION, ih, submittedAt).run();
      id = candidate;
    } catch (e) {
      if (!/UNIQUE|constraint/i.test(String(e?.message || e))) throw e;
    }
  }
  if (!id) throw new ApiError(503, 'busy', 'Spróbuj ponownie za chwilę.');
  await audit(db, uid || 'public', 'nomination.submitted', id, { genre: n.genre });

  const mailJob = sendNominationMails(db, env, id).catch(() => {});
  if (ctx?.waitUntil) ctx.waitUntil(mailJob); else await mailJob;
  return json({ ok: true, id, status: 'submitted' }, 201);
}

function nominationMails(nom) {
  const lines = [
    `Identyfikator: ${nom.id}`, `Wykonawca: ${nom.artist}`, `Tytuł: ${nom.title}`, `Gatunek: ${nom.genre}`, `Język i kraj: ${nom.language}`,
    `Odniesienie biblijne: ${nom.bible_ref}`, `Google Drive: ${nom.drive_url}`, `YouTube: ${nom.youtube_url || '—'}`,
    `Link wsparcia: ${nom.support_url || '—'}`, `Zgłaszający: ${nom.submitter_name} <${nom.submitter_email}>`,
    `Oświadczenia: prawa ✓, licencja (wersja ${nom.license_version}) ✓, regulamin ✓`, `Złożono: ${nom.submitted_at}`,
    '', 'Panel moderacji: https://polskieradio.cc/topTEN/panel',
  ];
  return [
    { toEmail: EDITORIAL_EMAIL, subject: `topTEN — nowa nominacja ${nom.id}: ${nom.artist} — ${nom.title}`, text: lines.join('\n') },
    {
      toEmail: nom.submitter_email,
      subject: `topTEN — potwierdzenie zgłoszenia ${nom.id}`,
      text: [
        `Dziękujemy za zgłoszenie utworu „${nom.title}” (${nom.artist}) do notowań topTEN Polskiego Radia Christian Culture.`,
        '', `Identyfikator zgłoszenia: ${nom.id}`, 'Status: złożono — czeka na weryfikację redakcji.', '',
        'Przesłanie zgłoszenia nie oznacza publikacji. Redakcja sprawdzi materiał, prawa i zgodność z regulaminem; o decyzji poinformujemy tym kanałem.',
        '', 'Regulamin: https://polskieradio.cc/topTEN/regulamin', '', 'Polskie Radio Christian Culture',
      ].join('\n'),
    },
  ];
}

export async function sendNominationMails(db, env, id) {
  const nom = await db.prepare('SELECT * FROM topten_nominations WHERE id = ?').bind(id).first();
  if (!nom || nom.mail_status === 'sent') return;
  let ok = true;
  for (const m of nominationMails(nom)) {
    try { await dispatchGmailEmail({ ...m, deliveryType: 'transactional' }, env); } catch { ok = false; }
  }
  await db.prepare('UPDATE topten_nominations SET mail_status = ?, mail_attempts = mail_attempts + 1 WHERE id = ?')
    .bind(ok ? 'sent' : 'failed', id).run();
}

// ─── Moderacja ───────────────────────────────────────────────────────────────
async function adminNominations(db, url) {
  const status = url.searchParams.get('status');
  const rows = (await (status && NOMINATION_STATUSES.has(status)
    ? db.prepare('SELECT * FROM topten_nominations WHERE status = ? ORDER BY seq DESC LIMIT 200').bind(status)
    : db.prepare('SELECT * FROM topten_nominations ORDER BY seq DESC LIMIT 200')).all()).results || [];
  return { items: rows.map(({ ip_hash, ...r }) => r) };
}

async function adminUpdateNomination(db, request, admin, id) {
  const body = await request.json().catch(() => ({}));
  const nom = await db.prepare('SELECT * FROM topten_nominations WHERE id = ?').bind(id).first();
  if (!nom) throw new ApiError(404, 'not_found', 'Brak zgłoszenia.');
  const status = text(body.status, 30);
  if (!NOMINATION_STATUSES.has(status)) throw new ApiError(400, 'bad_status', 'Nieprawidłowy status.');
  const note = longText(body.note, 2000) || null;
  const now = new Date().toISOString();

  if (status === 'published') {
    const p = body.track || {};
    const yt = youtubeId(text(p.youtubeUrl, 300) || nom.youtube_url || '');
    if (Array.isArray(p.support) && p.support.some(s => s?.qr && !parseSupportQr(s.qr))) {
      throw new ApiError(400, 'invalid_support_qr', 'Kod QR odrzucony: dozwolony jest przelew na rachunek (standard ZBP, poprawny numer konta) albo link do zrzutka.pl, revolut.me, paypal.me, patronite.pl. Jednorazowe kody BLIK są niedozwolone.');
    }
    const support = Array.isArray(p.support) ? p.support.slice(0, 5).map(s => ({
      method: text(s.method, 40), value: text(s.value, 120),
      ...(s.url ? { url: httpsUrl(text(s.url, 300), SUPPORT_HOSTS) } : {}),
      ...(s.copy ? { copy: text(s.copy, 40).replace(/[^\d]/g, '') } : {}),
      ...(s.qr ? { qr: parseSupportQr(s.qr) } : {}),
    })).filter(s => s.method && s.value && s.url !== null && s.qr !== null) :(nom.support_url ? [{ method: 'Wsparcie', value: new URL(nom.support_url).host, url: nom.support_url }] : []);
    const profile = httpsUrl(text(p.profileUrl, 300), null) || null;
    // Naturalna rywalizacja: nowy utwór czeka w kolejce debiutów na najbliższy poniedziałek (§5.4, §5.6).
    const natural = (await getFlags(db)).natural;
    await db.prepare(`INSERT INTO topten_tracks (id, title, artist, genre, language, bible_ref, youtube_id, cover_url, profile_url, support_json, status, created_at, updated_at, pool_status, queued_at, queue_entry)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET title = excluded.title, artist = excluded.artist, genre = excluded.genre, bible_ref = excluded.bible_ref,
          youtube_id = excluded.youtube_id, cover_url = excluded.cover_url, profile_url = excluded.profile_url, support_json = excluded.support_json,
          status = 'published', updated_at = excluded.updated_at`)
      .bind(id, text(p.title, 160) || nom.title, text(p.artist, 120) || nom.artist, GENRES.has(p.genre) ? p.genre : nom.genre, nom.language,
        text(p.bibleRef, 200) || text(nom.bible_ref, 200), yt || null, yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null, profile,
        JSON.stringify(support), now, now, natural ? 'queued' : 'active', natural ? now : null, natural ? 'debut' : null).run();
  } else if (['withdrawn', 'takedown', 'rejected'].includes(status)) {
    await db.prepare("UPDATE topten_tracks SET status = ?, updated_at = ? WHERE id = ?").bind(status === 'withdrawn' ? 'hidden' : 'takedown', now, id).run();
  }
  await db.prepare('UPDATE topten_nominations SET status = ?, decision_note = COALESCE(?, decision_note), reviewer = ?, reviewed_at = ? WHERE id = ?')
    .bind(status, note, admin.email, now, id).run();
  await audit(db, admin.email, `nomination.${status}`, id, note ? { note } : null);
  return { ok: true, id, status };
}

async function adminEvents(db, url) {
  const track = text(url.searchParams.get('track') || '', 40);
  const rows = (await (track
    ? db.prepare('SELECT id, user_id, track_id, cycle_id, local_date, action, points, created_at, review_status, ip_hash FROM topten_events WHERE track_id = ? ORDER BY id DESC LIMIT 300').bind(track)
    : db.prepare('SELECT id, user_id, track_id, cycle_id, local_date, action, points, created_at, review_status, ip_hash FROM topten_events ORDER BY id DESC LIMIT 300')).all()).results || [];
  return { items: rows };
}

async function adminReviewEvent(db, request, admin, eventId) {
  const body = await request.json().catch(() => ({}));
  const status = text(body.reviewStatus, 10);
  if (!['ok', 'held', 'void'].includes(status)) throw new ApiError(400, 'bad_status', 'Nieprawidłowy status.');
  const res = await db.prepare('UPDATE topten_events SET review_status = ? WHERE id = ?').bind(status, eventId).run();
  if (!res?.meta?.changes) throw new ApiError(404, 'not_found', 'Brak zdarzenia.');
  await audit(db, admin.email, `event.${status}`, String(eventId), { note: longText(body.note, 500) || null });
  return { ok: true };
}

// ─── Obserwowanie i Web Push (VAPID, bez treści — SW pobiera treść z API) ─────
const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0));

function vapidJwk(env) {
  try { const k = JSON.parse(env.TOPTEN_VAPID_JWK || ''); return k?.kty === 'EC' && k.d && k.x && k.y ? k : null; } catch { return null; }
}
export function vapidPublicKey(jwk) {
  const x = fromB64url(jwk.x), y = fromB64url(jwk.y);
  const out = new Uint8Array(65); out[0] = 4; out.set(x, 1); out.set(y, 33);
  return b64url(out);
}

async function sendPush(env, endpoint, fetchImpl) {
  const jwk = vapidJwk(env);
  if (!jwk) return 'not_configured';
  const aud = new URL(endpoint).origin;
  const enc = (o) => b64url(new TextEncoder().encode(JSON.stringify(o)));
  const unsigned = `${enc({ typ: 'JWT', alg: 'ES256' })}.${enc({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: `mailto:${EDITORIAL_EMAIL}` })}`;
  const key = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y, d: jwk.d }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsigned));
  const res = await fetchImpl(endpoint, {
    method: 'POST',
    headers: { Authorization: `vapid t=${unsigned}.${b64url(sig)}, k=${vapidPublicKey(jwk)}`, TTL: '86400', Urgency: 'normal', 'Content-Length': '0' },
  });
  return res.status === 404 || res.status === 410 ? 'gone' : res.ok ? 'sent' : `error_${res.status}`;
}

function pushEndpoint(value) {
  let u;
  try { u = new URL(String(value || '')); } catch { return null; }
  if (u.protocol !== 'https:' || !PUSH_HOSTS.some(re => re.test(u.hostname))) return null;
  return u.toString().slice(0, 1000);
}

/** Po każdym głosie: porównuje pozycje obserwowanych utworów z ostatnio zgłoszonymi i wysyła rzadkie alerty (§8). */
export async function evaluateFollowAlerts(db, env, nowMs, fetchImpl = fetch) {
  const { cycleId, localDate, hour } = warsawClock(nowMs);
  const ranking = await computeRanking(db, cycleId, { live: true });
  const rankOf = new Map(ranking.map(r => [r.id, r]));
  const follows = (await db.prepare('SELECT user_id, track_id, last_rank FROM topten_follows').all()).results || [];
  const quiet = hour >= 22 || hour < 7;
  for (const f of follows) {
    const t = rankOf.get(f.track_id);
    if (!t || f.last_rank === t.rank) continue;
    let msg = null;
    if (f.last_rank != null) {
      const diff = f.last_rank - t.rank;
      if (t.rank <= 10 && f.last_rank > 10) msg = `„${t.title}” wchodzi do TOP 10 (miejsce ${t.rank}).`;
      else if (diff >= NOTIFY_RANK_STEP) msg = `„${t.title}” awansuje o ${diff} m. — teraz ${t.rank}.`;
      else if (diff <= -NOTIFY_RANK_STEP) msg = `„${t.title}” spada o ${-diff} m. — teraz ${t.rank}. Wesprzyj głosem LubięTO.`;
      else continue; // drobne ruchy nie aktualizują punktu odniesienia
    }
    await db.prepare('UPDATE topten_follows SET last_rank = ? WHERE user_id = ? AND track_id = ?').bind(t.rank, f.user_id, f.track_id).run();
    if (!msg || quiet) continue;
    const sent = await db.prepare('SELECT COUNT(*) AS n FROM topten_notifications WHERE user_id = ? AND local_date = ?').bind(f.user_id, localDate).first();
    if ((sent?.n || 0) >= NOTIFICATIONS_PER_USER_PER_DAY) continue;
    await db.prepare('INSERT INTO topten_notifications (user_id, track_id, title, body, local_date, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(f.user_id, f.track_id, 'topTEN — zmiana w notowaniu', msg, localDate, new Date(nowMs).toISOString()).run();
    const subs = (await db.prepare('SELECT endpoint FROM topten_push_subscriptions WHERE user_id = ?').bind(f.user_id).all()).results || [];
    for (const s of subs) {
      const r = await sendPush(env, s.endpoint, fetchImpl).catch(() => 'error');
      if (r === 'gone') await db.prepare('DELETE FROM topten_push_subscriptions WHERE endpoint = ?').bind(s.endpoint).run();
    }
  }
}

// ─── Strona udostępniania utworu (podgląd w WhatsApp/Messenger/Facebook/SMS) ───
const escHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function shareText(track) {
  const place = track.rank ? `jest na ${track.rank}. miejscu notowania` : 'jest w notowaniu';
  return `🎵 „${track.title}” — ${track.artist} ${place} topTEN Polskiego Radia Christian Culture! `
    + '🧡 Zagłosuj LubięTO (raz dziennie) i podbij utwór 🚀 — każdy głos się liczy.';
}

async function shareImage(youtubeIdValue, fetchImpl) {
  if (!youtubeIdValue) return { url: 'https://polskieradio.cc/topTEN/assets/topten-logo.png', w: null, h: null };
  const max = `https://i.ytimg.com/vi/${youtubeIdValue}/maxresdefault.jpg`;
  try {
    const r = await fetchImpl(max, { method: 'HEAD' });
    if (r.ok) return { url: max, w: 1280, h: 720 };
  } catch { /* brak wersji HD — miniatura standardowa */ }
  return { url: `https://i.ytimg.com/vi/${youtubeIdValue}/hqdefault.jpg`, w: 480, h: 360 };
}

export async function handleTopTenSharePage(request, env, { fetchImpl = fetch, now = () => Date.now() } = {}) {
  const url = new URL(request.url);
  const id = (url.pathname.match(/^\/topten\/utwor\/(CC-TT-\d{4}-\d{4})\/?$/i) || [])[1]?.toUpperCase();
  const db = env.topten_db || env.TOPTEN_DB;
  const html = (body, status) => new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' },
  });
  const t = id && db ? await db.prepare("SELECT * FROM topten_tracks WHERE id = ? AND status = 'published'").bind(id).first() : null;
  if (!t) {
    return html('<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Utwór niedostępny | topTEN</title><main style="font-family:system-ui;padding:24px"><h1>Utwór niedostępny</h1><p>Tego utworu nie ma w bieżącym notowaniu.</p><a href="/topTEN/">Zobacz notowanie topTEN →</a></main></html>', 404);
  }
  const rank = (await liveCharts(db, now())).items.find(r => r.id === t.id)?.rank ?? null;
  const track = { ...publicTrack(t), rank };
  const img = await shareImage(t.youtube_id, fetchImpl);
  const shareUrl = `https://polskieradio.cc/topTEN/utwor/${t.id}`;
  const target = `/topTEN/#${t.id}`;
  const title = `„${t.title}” — ${t.artist} | topTEN Christian Culture`;
  const desc = `${rank ? `Miejsce ${rank} w notowaniu. ` : ''}Posłuchaj, zagłosuj LubięTO i podbij utwór. Masz ulubionego artystę? Zgłoś go do topTEN!`;
  return html(`<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, follow">
<title>${escHtml(title)}</title>
<meta name="description" content="${escHtml(desc)}">
<link rel="canonical" href="${shareUrl}">
<meta property="og:type" content="music.song">
<meta property="og:site_name" content="Polskie Radio Christian Culture — topTEN">
<meta property="og:locale" content="pl_PL">
<meta property="og:title" content="${escHtml(title)}">
<meta property="og:description" content="${escHtml(desc)}">
<meta property="og:url" content="${shareUrl}">
<meta property="og:image" content="${img.url}">
<meta property="og:image:secure_url" content="${img.url}">
${img.w ? `<meta property="og:image:width" content="${img.w}">\n<meta property="og:image:height" content="${img.h}">` : ''}
<meta property="og:image:alt" content="${escHtml(`Kadr z teledysku: ${t.title} — ${t.artist}`)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escHtml(title)}">
<meta name="twitter:description" content="${escHtml(desc)}">
<meta name="twitter:image" content="${img.url}">
<meta http-equiv="refresh" content="0; url=${target}">
<link rel="icon" type="image/png" href="/topTEN/assets/topten-logo.png">
</head>
<body style="font-family:system-ui,sans-serif;padding:24px;max-width:640px;margin:auto">
<p><img src="${img.url}" alt="" style="width:100%;border-radius:12px"></p>
<h1 style="font-size:22px">${escHtml(t.title)} — ${escHtml(t.artist)}</h1>
<p>${escHtml(shareText(track))}</p>
<p><a href="${target}" style="color:#E66A00;font-weight:700">Przejdź do notowania topTEN →</a></p>
<script>location.replace(${JSON.stringify(target)});</script>
</body>
</html>`, 200);
}

// ─── Oficjalny kanał YouTube topTEN (decyzja L0 01.11.2026): wszystkie utwory z historii notowań i nominacje ───
export const YT_CHANNEL_ID = 'UCdHN7wt9il-Gg_NCVGUWpWg';
export const YT_CHANNEL_URL = 'https://www.youtube.com/@toptenchristianculture';
const YT_CACHE_SECONDS = 1800;
const xmlText = (s) => String(s ?? '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&');

export function parseYoutubeFeed(xml) {
  return [...String(xml).matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
    videoId: (e.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/) || [])[1],
    title: xmlText((e.match(/<title>([\s\S]*?)<\/title>/) || [])[1]).trim(),
    published: (e.match(/<published>([^<]+)<\/published>/) || [])[1] || null,
  })).filter(v => v.videoId && v.title).slice(0, 12);
}

async function youtubeVideos(fetchImpl) {
  const cache = globalThis.caches?.default;
  const key = new Request(`https://polskieradio.cc/__topten-cache/youtube/${YT_CHANNEL_ID}`);
  if (cache) {
    const hit = await cache.match(key).catch(() => null);
    if (hit) return hit.json();
  }
  let items = [];
  try {
    const res = await fetchImpl(`https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`);
    if (res.ok) items = parseYoutubeFeed(await res.text());
  } catch { items = []; }
  const data = { channelId: YT_CHANNEL_ID, channelUrl: YT_CHANNEL_URL, items };
  if (cache) {
    await cache.put(key, new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${YT_CACHE_SECONDS}` },
    })).catch(() => {});
  }
  return data;
}

// ─── Szybkie indeksowanie: IndexNow (Bing, Yandex, Seznam…; z indeksu Binga korzysta wyszukiwarka ChatGPT/Copilot) ───
// Klucz jest publiczny z założenia (plik /<klucz>.txt w katalogu głównym). Google nie obsługuje IndexNow — dla Google
// służy dynamiczna mapa /sitemaps/topten.xml z prawdziwym lastmod.
export const INDEXNOW_KEY = '05b02b2420811e677a54341bc23369ca';
const INDEXNOW_THROTTLE_SECONDS = 3600;

export async function pingIndexNow(urls, { fetchImpl = fetch, throttleKey = null } = {}) {
  const cache = globalThis.caches?.default;
  const flag = throttleKey && cache ? new Request(`https://polskieradio.cc/__topten-cache/indexnow/${throttleKey}`) : null;
  if (flag && await cache.match(flag).catch(() => null)) return 'throttled';
  const res = await fetchImpl('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: 'polskieradio.cc', key: INDEXNOW_KEY, keyLocation: `https://polskieradio.cc/${INDEXNOW_KEY}.txt`, urlList: urls }),
  });
  if (flag) await cache.put(flag, new Response('1', { headers: { 'Cache-Control': `public, max-age=${INDEXNOW_THROTTLE_SECONDS}` } })).catch(() => {});
  return res.status;
}

export async function handleTopTenSitemap(env, { now = () => Date.now() } = {}) {
  const db = env.topten_db || env.TOPTEN_DB;
  let lastmod = '2026-11-01';
  if (db) {
    try {
      const data = await liveCharts(db, now());
      const last = Math.max(0, ...data.items.map(i => i.lastAt || 0));
      lastmod = new Date(last || Date.parse(weekBounds(data.cycle.id).start_utc)).toISOString();
    } catch { /* zostaje data bazowa */ }
  }
  const urls = [
    ['https://polskieradio.cc/topTEN/', lastmod, 'hourly', '0.95'],
    ['https://polskieradio.cc/topTEN/nominacje/', '2026-11-01', 'weekly', '0.8'],
    ['https://polskieradio.cc/topTEN/regulamin/', '2026-11-01', 'monthly', '0.5'],
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([loc, mod, freq, prio]) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${mod}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${prio}</priority>\n  </url>`).join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
}

// ─── SEO / AI: aktualny ranking wstawiony do HTML /topTEN/ (dla robotów bez JavaScriptu) ───
const plDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function renderTopTenSeo(html, data) {
  const items = data.items || [];
  const top = items.slice(0, 10);
  const week = `${plDate(data.cycle.start.slice(0, 10))}, 20:00 – ${plDate(data.cycle.end.slice(0, 10))}, 20:00`;
  const updated = new Date(data.updatedAt).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw', dateStyle: 'long', timeStyle: 'short' });
  const leaders = top.slice(0, 3).map(t => `${t.rank}. „${t.title}” — ${t.artist}`).join('; ');
  const description = top.length
    ? `Aktualne notowanie topTEN (${week}): ${leaders}. Głosuj LubięTO i PodbijTO, zgłaszaj ulubionych artystów chrześcijańskich.`
    : `Notowanie topTEN Polskiego Radia Christian Culture (${week}). Głosuj LubięTO i PodbijTO, zgłaszaj ulubionych artystów chrześcijańskich.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicPlaylist',
    name: `topTEN — notowanie muzyki chrześcijańskiej (${week})`,
    description,
    url: 'https://polskieradio.cc/topTEN/',
    inLanguage: 'pl',
    dateModified: data.updatedAt,
    numTracks: items.length,
    publisher: { '@type': 'Organization', name: 'Polskie Radio Christian Culture', url: 'https://polskieradio.cc/', logo: 'https://polskieradio.cc/topTEN/assets/topten-logo.png', sameAs: [YT_CHANNEL_URL] },
    track: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      itemListElement: top.map(t => ({
        '@type': 'ListItem',
        position: t.rank,
        item: {
          '@type': 'MusicRecording',
          name: t.title,
          byArtist: { '@type': 'MusicGroup', name: t.artist },
          url: `https://polskieradio.cc/topTEN/utwor/${t.id}`,
          ...(t.cover ? { image: t.cover } : {}),
          ...(t.youtubeId ? { sameAs: `https://www.youtube.com/watch?v=${t.youtubeId}` } : {}),
          interactionStatistic: { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: t.likes || 0 },
        },
      })),
    },
  };
  const ld = `<script type="application/ld+json" id="topten-ld">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`;
  const list = `<section class="chart-section" id="notowania-ssr" aria-label="Aktualne notowanie topTEN">
<div class="section-header"><h2>TopTen Global — ${escHtml(week)}</h2></div>
${top.length ? `<ol class="ssr-chart">${top.map(t => `<li value="${t.rank}"><a href="/topTEN/utwor/${escHtml(t.id)}"><strong>${escHtml(t.title)}</strong></a> — ${escHtml(t.artist)} · ${Number(t.score || 0).toLocaleString('pl-PL')} pkt</li>`).join('')}</ol>`
    : '<p>W tym tygodniu nie ma jeszcze utworów w notowaniu.</p>'}
<p class="vote-info-note">Stan na ${escHtml(updated)}. <a href="/topTEN/nominacje/">Zgłoś utwór →</a></p>
</section>`;

  return html
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escHtml(description)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escHtml(description)}">`)
    .replace('</head>', `${ld}\n</head>`)
    .replace('<div id="sections">', `<div id="sections">\n${list}`);
}

export async function handleTopTenPage(request, env, { now = () => Date.now() } = {}) {
  const res = await env.ASSETS.fetch(request);
  const db = env.topten_db || env.TOPTEN_DB;
  if (!db || res.status !== 200 || !String(res.headers.get('Content-Type') || '').includes('text/html')) return res;
  try {
    const data = await liveCharts(db, now());
    const out = new Response(renderTopTenSeo(await res.text(), data), res);
    out.headers.delete('Content-Length');
    out.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    return out;
  } catch {
    return env.ASSETS.fetch(request); // bez danych — zwykła strona statyczna
  }
}

// ─── Router ──────────────────────────────────────────────────────────────────
export async function handleTopTenApi(request, env, ctx, { verifyToken, fetchImpl = fetch, now = () => Date.now() } = {}) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');
  const method = request.method;
  const db = env.topten_db || env.TOPTEN_DB;
  if (!db) return json({ ok: false, error: 'not_configured', message: 'Baza topTEN nie jest skonfigurowana.' }, 503);
  if (['POST', 'PUT', 'DELETE'].includes(method) && !String(request.headers.get('Content-Type') || '').includes('application/json')) {
    return json({ ok: false, error: 'content_type', message: 'Wymagany Content-Type: application/json.' }, 415);
  }
  const nowMs = now();
  const later = (p) => { const job = p.catch(() => {}); if (ctx?.waitUntil) ctx.waitUntil(job); return job; };

  try {
    if (method === 'GET' && path === '/api/topten/charts') {
      const requested = url.searchParams.get('cycle');
      const live = !requested || requested === warsawClock(nowMs).cycleId;
      return json({ ok: true, ...(live ? await liveCharts(db, nowMs) : await charts(db, url, nowMs)) });
    }
    if (method === 'GET' && path === '/api/topten/cycles') return json({ ok: true, ...(await cycles(db, nowMs)) });
    if (method === 'GET' && path === '/api/topten/youtube') return json({ ok: true, ...(await youtubeVideos(fetchImpl)) });

    // ─── Naturalna rywalizacja: publiczne widoki (bez danych osobowych i bez linków Drive) ───
    if (method === 'GET' && path.startsWith('/api/topten/weeks/') || ['/api/topten/debuts/queue', '/api/topten/archive'].includes(path) || path.startsWith('/api/topten/songs/')) {
      const flags = await getFlags(db);
      if (!flags.natural) return json({ ok: false, error: 'feature_disabled', message: 'Nowe zasady notowania nie są jeszcze włączone.' }, 404);
      const serverNow = new Date(nowMs).toISOString();
      if (method === 'GET' && path === '/api/topten/weeks/current') {
        const w = await ensureWeek(db, nowMs);
        return json({ ok: true, week: { id: w.id, weekStart: w.start_utc, weekEnd: w.end_utc, status: w.status, isProvisional: true, rulesVersion: w.rules_version }, votingEligibility: w.status === 'open', serverNow });
      }
      const wk = path.match(/^\/api\/topten\/weeks\/(\d{4}-\d{2}-\d{2})\/(standings|awards)$/);
      if (method === 'GET' && wk) {
        const snap = await officialSnapshot(db, wk[1]);
        if (wk[2] === 'awards') return json({ ok: true, weekId: wk[1], official: !!snap, items: snap ? snap.awards.map(a => ({ type: a.award_type, id: a.track_id, explanation: a.explanation })) : [] });
        const scope = url.searchParams.get('scope') || 'all';
        const rows = snap ? snap.rows : await standingsFor(db, wk[1]);
        const pick = rows.filter(r => scope === 'top10' ? r.rank <= TOP_SIZE : scope === 'waiting' ? r.rank > TOP_SIZE : true)
          .map(r => ({ id: r.track_id, rank: r.rank, bucket: r.rank <= TOP_SIZE ? 'top10' : 'waiting', title: r.title, artist: r.artist, points: r.points, likes: r.likes, uniqueLikeVoters: r.unique_like_voters }));
        return json({ ok: true, weekId: wk[1], official: !!snap, rankingVersion: snap?.week.snapshot_version || 0, checksum: snap?.week.checksum || null, rulesVersion: RULES_VERSION, items: pick, serverNow });
      }
      if (method === 'GET' && path === '/api/topten/debuts/queue') return json({ ok: true, items: await debutQueue(db, warsawClock(nowMs).cycleId) });
      if (method === 'GET' && path === '/api/topten/archive') {
        if (!flags.archive) return json({ ok: false, error: 'feature_disabled' }, 404);
        return json({ ok: true, items: await songArchive(db) });
      }
      const hist = path.match(/^\/api\/topten\/songs\/(CC-TT-\d{4}-\d{4})\/history$/);
      if (method === 'GET' && hist) return json({ ok: true, id: hist[1], ...(await songHistory(db, hist[1])) });
    }
    if (method === 'GET' && path === '/api/topten/me') {
      const user = await requireUser(request, verifyToken);
      return json({ ok: true, ...(await myState(db, user.uid, nowMs)) });
    }
    if (method === 'POST' && path === '/api/topten/nominations') return await createNomination(db, request, env, ctx, verifyToken, nowMs);

    const trackAction = path.match(/^\/api\/topten\/tracks\/(CC-TT-\d{4}-\d{4})\/(like|boost|follow)$/);
    if (trackAction) {
      const [, trackId, action] = trackAction;
      const user = await requireUser(request, verifyToken);
      if (action === 'follow' && (method === 'POST' || method === 'DELETE')) {
        if (method === 'POST') {
          const exists = await db.prepare("SELECT id FROM topten_tracks WHERE id = ? AND status = 'published'").bind(trackId).first();
          if (!exists) throw new ApiError(404, 'track_not_found', 'Brak utworu.');
          const rank = (await computeRanking(db, warsawClock(nowMs).cycleId, { live: true })).find(r => r.id === trackId)?.rank ?? null;
          await db.prepare('INSERT OR IGNORE INTO topten_follows (user_id, track_id, last_rank, created_at) VALUES (?, ?, ?, ?)')
            .bind(user.uid, trackId, rank, new Date(nowMs).toISOString()).run();
        } else {
          await db.prepare('DELETE FROM topten_follows WHERE user_id = ? AND track_id = ?').bind(user.uid, trackId).run();
        }
        return json({ ok: true, following: method === 'POST' });
      }
      if (method === 'POST' && (action === 'like' || action === 'boost')) {
        const result = await vote(db, request, user, trackId, action, nowMs);
        if (!result.replay) {
          await audit(db, user.uid, `vote.${action}`, trackId, null);
          later(evaluateFollowAlerts(db, env, nowMs, fetchImpl));
          later(ipHash(request).then(ih => checkVoteAnomalies(db, env, trackId, nowMs, ih)));
        }
        const state = await myState(db, user.uid, nowMs);
        const fresh = result.replay ? undefined : await liveCharts(db, nowMs, { fresh: true });
        if (fresh) later(pingIndexNow(['https://polskieradio.cc/topTEN/'], { fetchImpl, throttleKey: 'chart' }));
        return json({ ok: true, ...result, me: state.tracks[trackId] || null, ...(fresh ? { charts: fresh } : {}) }, result.replay ? 200 : 201);
      }
    }

    if (method === 'GET' && path === '/api/topten/push/key') {
      const jwk = vapidJwk(env);
      return jwk ? json({ ok: true, publicKey: vapidPublicKey(jwk) }) : json({ ok: false, error: 'not_configured' }, 503);
    }
    if (path === '/api/topten/push/subscribe' && (method === 'POST' || method === 'DELETE')) {
      const user = await requireUser(request, verifyToken);
      const body = await request.json().catch(() => ({}));
      const endpoint = pushEndpoint(body.endpoint);
      if (!endpoint) throw new ApiError(400, 'bad_endpoint', 'Nieobsługiwany adres powiadomień.');
      if (method === 'POST') {
        await db.prepare('INSERT INTO topten_push_subscriptions (endpoint, user_id, created_at) VALUES (?, ?, ?) ON CONFLICT(endpoint) DO UPDATE SET user_id = excluded.user_id')
          .bind(endpoint, user.uid, new Date(nowMs).toISOString()).run();
      } else {
        await db.prepare('DELETE FROM topten_push_subscriptions WHERE endpoint = ? AND user_id = ?').bind(endpoint, user.uid).run();
      }
      return json({ ok: true, subscribed: method === 'POST' });
    }
    if (method === 'POST' && path === '/api/topten/push/pending') {
      const body = await request.json().catch(() => ({}));
      const endpoint = pushEndpoint(body.endpoint);
      const sub = endpoint && await db.prepare('SELECT user_id FROM topten_push_subscriptions WHERE endpoint = ?').bind(endpoint).first();
      if (!sub) return json({ ok: true, items: [] });
      const items = (await db.prepare('SELECT id, title, body, track_id FROM topten_notifications WHERE user_id = ? AND delivered = 0 ORDER BY id LIMIT 3').bind(sub.user_id).all()).results || [];
      if (items.length) await db.prepare(`UPDATE topten_notifications SET delivered = 1 WHERE id IN (${items.map(() => '?').join(',')})`).bind(...items.map(i => i.id)).run();
      return json({ ok: true, items: items.map(i => ({ title: i.title, body: i.body, url: `/topTEN/#${i.track_id}` })) });
    }

    if (path.startsWith('/api/topten/admin/')) {
      const admin = await requireAdmin(request, verifyToken);
      if (method === 'GET' && path === '/api/topten/admin/nominations') return json({ ok: true, ...(await adminNominations(db, url)) });
      const nomMatch = path.match(/^\/api\/topten\/admin\/nominations\/(CC-TT-\d{4}-\d{4})$/);
      if (method === 'POST' && nomMatch) {
        const out = await adminUpdateNomination(db, request, admin, nomMatch[1]);
        await liveCharts(db, nowMs, { fresh: true });
        if (['published', 'takedown', 'withdrawn', 'rejected'].includes(out.status)) {
          later(pingIndexNow(['https://polskieradio.cc/topTEN/', `https://polskieradio.cc/topTEN/utwor/${out.id}`], { fetchImpl }));
        }
        return json(out);
      }
      if (method === 'GET' && path === '/api/topten/admin/events') return json({ ok: true, ...(await adminEvents(db, url)) });
      const evMatch = path.match(/^\/api\/topten\/admin\/events\/(\d+)$/);
      if (method === 'POST' && evMatch) {
        const out = await adminReviewEvent(db, request, admin, Number(evMatch[1]));
        await liveCharts(db, nowMs, { fresh: true });
        return json(out);
      }
      if (method === 'GET' && path === '/api/topten/admin/alerts') {
        const rows = (await db.prepare("SELECT id, action, object_id, details, ts FROM topten_audit_log WHERE action LIKE 'alert.%' ORDER BY id DESC LIMIT 50").all()).results || [];
        return json({ ok: true, items: rows.map(r => ({ ...r, details: r.details ? JSON.parse(r.details) : null })) });
      }
      // ─── Naturalna rywalizacja: operacje redakcji (audytowane) ───
      if (method === 'GET' && path === '/api/topten/admin/flags') {
        const rows = (await db.prepare('SELECT name, enabled, updated_by, updated_at FROM topten_flags').all()).results || [];
        return json({ ok: true, items: rows });
      }
      if (method === 'POST' && path === '/api/topten/admin/flags') {
        const body = await request.json().catch(() => ({}));
        if (!FLAG_NAMES.includes(body.name) || typeof body.enabled !== 'boolean') throw new ApiError(400, 'bad_flag', 'Nieznana flaga lub wartość.');
        if (body.confirm !== body.name) throw new ApiError(400, 'confirm_required', 'Potwierdź zmianę, podając nazwę flagi w polu confirm.');
        await db.prepare('UPDATE topten_flags SET enabled = ?, updated_by = ?, updated_at = ? WHERE name = ?')
          .bind(body.enabled ? 1 : 0, admin.email, new Date(nowMs).toISOString(), body.name).run();
        await audit(db, admin.email, `flag.${body.enabled ? 'on' : 'off'}`, body.name, null);
        await liveCharts(db, nowMs, { fresh: true });
        return json({ ok: true, name: body.name, enabled: body.enabled });
      }
      const fin = path.match(/^\/api\/topten\/admin\/weeks\/(\d{4}-\d{2}-\d{2})\/finalize$/);
      if (method === 'POST' && fin) {
        const body = await request.json().catch(() => ({}));
        const correction = body.correction === true;
        if (correction && longText(body.reason, 500).length < 10) throw new ApiError(400, 'reason_required', 'Korekta wymaga uzasadnienia (min. 10 znaków).');
        const out = await finalizeWeek(db, fin[1], { nowMs, actor: admin.email, correction, reason: longText(body.reason, 500) || null });
        if (!out.ok) throw new ApiError(409, out.error, out.error === 'week_not_ended' ? 'Tydzień jeszcze trwa.' : 'Brak takiego tygodnia.');
        await liveCharts(db, nowMs, { fresh: true });
        return json(out);
      }
      const rebuild = path.match(/^\/api\/topten\/admin\/totals\/(\d{4}-\d{2}-\d{2})\/rebuild$/);
      if (method === 'POST' && rebuild) {
        await rebuildTotals(db, rebuild[1]);
        await audit(db, admin.email, 'totals.rebuilt', rebuild[1], null);
        await liveCharts(db, nowMs, { fresh: true });
        return json({ ok: true, weekId: rebuild[1] });
      }
      if (method === 'POST' && path === '/api/topten/admin/roster/preview-next') {
        const cur = await db.prepare("SELECT id FROM topten_weeks WHERE status != 'preparing' ORDER BY id DESC LIMIT 1").first();
        const nextId = addDays(warsawClock(nowMs).cycleId, 7);
        return json({ ok: true, dryRun: true, plan: await planRoster(db, cur?.id || null, nextId) });
      }
      const hold = path.match(/^\/api\/topten\/admin\/songs\/(CC-TT-\d{4}-\d{4})\/rights-hold$/);
      if (method === 'POST' && hold) {
        const body = await request.json().catch(() => ({}));
        const reason = longText(body.reason, 500);
        if (body.hold === true && reason.length < 10) throw new ApiError(400, 'reason_required', 'Podaj powód wstrzymania (min. 10 znaków, niepubliczny).');
        const r = await db.prepare(`UPDATE topten_tracks SET pool_status = ?, updated_at = ? WHERE id = ? AND pool_status ${body.hold === true ? "!= 'suspended'" : "= 'suspended'"}`)
          .bind(body.hold === true ? 'suspended' : 'active', new Date(nowMs).toISOString(), hold[1]).run();
        if (!r?.meta?.changes) throw new ApiError(409, 'no_change', 'Utwór nie istnieje albo już ma ten stan.');
        await audit(db, admin.email, body.hold === true ? 'song.rights_hold' : 'song.rights_release', hold[1], { reason: reason || null });
        await liveCharts(db, nowMs, { fresh: true });
        return json({ ok: true, id: hold[1], suspended: body.hold === true });
      }
      const ret = path.match(/^\/api\/topten\/admin\/songs\/(CC-TT-\d{4}-\d{4})\/return$/);
      if (method === 'POST' && ret) {
        const r = await db.prepare(`UPDATE topten_tracks SET pool_status = 'queued', queue_entry = 'return', queued_at = ?, updated_at = ?
            WHERE id = ? AND status = 'published' AND pool_status = 'archived'`).bind(new Date(nowMs).toISOString(), new Date(nowMs).toISOString(), ret[1]).run();
        if (!r?.meta?.changes) throw new ApiError(409, 'not_archived', 'Powrót możliwy tylko dla opublikowanego utworu z archiwum.');
        const a = await db.prepare('SELECT eligible_from_week FROM topten_song_archive WHERE track_id = ?').bind(ret[1]).first();
        await audit(db, admin.email, 'song.return_queued', ret[1], { eligibleFromWeek: a?.eligible_from_week || null });
        return json({ ok: true, id: ret[1], queued: true, eligibleFromWeek: a?.eligible_from_week || null });
      }
      if (method === 'POST' && path === '/api/topten/admin/mail-retry') {
        const failed = (await db.prepare("SELECT id FROM topten_nominations WHERE mail_status != 'sent' AND mail_attempts < 5 ORDER BY seq LIMIT 10").all()).results || [];
        for (const f of failed) await sendNominationMails(db, env, f.id);
        await audit(db, admin.email, 'mail.retry', null, { count: failed.length });
        return json({ ok: true, retried: failed.length });
      }
    }
    return json({ ok: false, error: 'not_found' }, 404);
  } catch (e) {
    if (e instanceof ApiError) return json({ ok: false, error: e.code, message: e.message }, e.status);
    console.error('[topTEN API]', e?.message || e);
    return json({ ok: false, error: 'server_error', message: 'Błąd serwera — spróbuj ponownie.' }, 500);
  }
}
