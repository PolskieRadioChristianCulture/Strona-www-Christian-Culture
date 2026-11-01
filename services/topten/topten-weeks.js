/**
 * topTEN — naturalna rywalizacja: tygodnie, aktywna pula 30, debiuty, archiwum, snapshoty, wyróżnienia.
 * Spec: TOPTEN_REGULAMIN_NATURALNA_RYWALIZACJA_WDROZENIE_ANTIGRAVITY_CLAUDE.md (§3–§8, §14–§17) • @007 • 2026-11-01
 *
 * Bez crona (ZERO COST): tydzień zamyka się i otwiera „leniwie” przy pierwszym zapytaniu po niedzieli 20:00
 * Europe/Warsaw. Zamknięcie jest idempotentne (blokada = wiersz tygodnia w stanie 'preparing'), a zapis puli
 * i snapshotu idzie jedną transakcją D1 (batch). Wszystko działa tylko przy włączonej fladze
 * topten_natural_ranking_v1 — przy wyłączonej strona liczy ranking jak dotąd.
 */
import { warsawClock, addDays, CYCLE_CLOSE_HOUR } from './topten-service.js';

export const RULES_VERSION = 'natural-v1';
export const ROSTER_MAX = 30;
export const TOP_SIZE = 10;
export const DEBUTS_PER_WEEK = 3;
export const RETURN_WAIT_WEEKS = 4;
const PREPARING_STALE_MS = 2 * 60 * 1000;
export const FLAG_NAMES = ['topten_natural_ranking_v1', 'topten_waiting_room_v1', 'topten_archive_v1'];

// ─── Flagi ───────────────────────────────────────────────────────────────────
export async function getFlags(db) {
  const flags = { natural: false, waitingRoom: false, archive: false };
  try {
    const rows = (await db.prepare('SELECT name, enabled FROM topten_flags').all()).results || [];
    const on = new Set(rows.filter(r => r.enabled === 1).map(r => r.name));
    flags.natural = on.has('topten_natural_ranking_v1');
    flags.waitingRoom = flags.natural && on.has('topten_waiting_room_v1');
    flags.archive = flags.natural && on.has('topten_archive_v1');
  } catch { /* migracja 0002 jeszcze nie zastosowana — wszystko wyłączone */ }
  return flags;
}

// ─── Granice tygodnia w UTC (zmiana czasu letni/zimowy) ──────────────────────
/** Moment UTC dla lokalnej godziny Europe/Warsaw (pełna godzina) danego dnia. */
export function warsawLocalUtc(localDate, hour) {
  const hh = String(hour).padStart(2, '0');
  for (const off of ['+01:00', '+02:00']) {
    const t = Date.parse(`${localDate}T${hh}:00:00${off}`);
    const c = warsawClock(t);
    if (c.localDate === localDate && c.hour === hour) return t;
  }
  throw new Error(`Nie można wyznaczyć ${hh}:00 Europe/Warsaw dla ${localDate}`);
}

/** Tydzień `weekId` (poniedziałek): od niedzieli poprzedzającej o 20:00 do następnej niedzieli 20:00 (wyłącznie). */
export function weekBounds(weekId) {
  return {
    start_utc: new Date(warsawLocalUtc(addDays(weekId, -1), CYCLE_CLOSE_HOUR)).toISOString(),
    end_utc: new Date(warsawLocalUtc(addDays(weekId, 6), CYCLE_CLOSE_HOUR)).toISOString(),
  };
}

// ─── Agregacja i kolejność (§6) ──────────────────────────────────────────────
/** Wyniki tygodnia z liczników inkrementalnych (topten_week_totals) — kilkadziesiąt wierszy zamiast wszystkich głosów. */
export async function aggregateWeek(db, weekId) {
  const rows = (await db.prepare(`SELECT track_id, points, likes, boosts, voters, unique_like_voters, last_at AS reached_at
    FROM topten_week_totals WHERE cycle_id = ?`).bind(weekId).all()).results || [];
  return new Map(rows.map(r => [r.track_id, r]));
}

/** Rekoncyliacja: przebudowa liczników tygodnia z dziennika zdarzeń (źródła prawdy). */
export async function rebuildTotals(db, weekId) {
  await db.batch([
    db.prepare('DELETE FROM topten_week_totals WHERE cycle_id = ?').bind(weekId),
    db.prepare(`INSERT INTO topten_week_totals (cycle_id, track_id, points, likes, boosts, voters, unique_like_voters, last_at)
      SELECT cycle_id, track_id, SUM(points), SUM(action = 'like'), SUM(action = 'boost'), COUNT(DISTINCT user_id),
        COUNT(DISTINCT CASE WHEN action = 'like' THEN user_id END), MAX(created_at)
      FROM topten_events WHERE cycle_id = ? AND review_status = 'ok' GROUP BY cycle_id, track_id`).bind(weekId),
  ]);
}

/** Remisy: punkty ↓, unikalni głosujący LubięTO ↓, liczba LubięTO ↓, wcześniejsze osiągnięcie wyniku ↑, id utworu ↑. */
export function sortStandings(items) {
  return items.sort((a, b) => b.points - a.points || b.unique_like_voters - a.unique_like_voters || b.likes - a.likes
    || (a.reached_at ?? Infinity) - (b.reached_at ?? Infinity) || String(a.track_id).localeCompare(String(b.track_id)));
}

async function rosterOf(db, weekId) {
  return (await db.prepare(`SELECT r.track_id, r.entry_type, t.title, t.artist, t.status, t.pool_status
    FROM topten_week_roster r JOIN topten_tracks t ON t.id = r.track_id WHERE r.week_id = ?`).bind(weekId).all()).results || [];
}

export async function standingsFor(db, weekId) {
  const roster = await rosterOf(db, weekId);
  const agg = await aggregateWeek(db, weekId);
  const rows = roster.map(r => {
    const a = agg.get(r.track_id) || {};
    return {
      track_id: r.track_id, title: r.title, artist: r.artist, entry_type: r.entry_type, pool_status: r.pool_status,
      points: a.points || 0, likes: a.likes || 0, boosts: a.boosts || 0,
      unique_like_voters: a.unique_like_voters || 0, reached_at: a.reached_at ?? null,
    };
  });
  sortStandings(rows).forEach((r, i) => { r.rank = i + 1; r.bucket = r.rank <= TOP_SIZE ? 'top10' : 'waiting'; });
  return rows;
}

/** Ostatnia wersja oficjalnego snapshotu tygodnia (lub null). */
export async function officialSnapshot(db, weekId) {
  const week = await db.prepare('SELECT * FROM topten_weeks WHERE id = ?').bind(weekId).first();
  if (!week || !week.snapshot_version) return null;
  const rows = (await db.prepare('SELECT * FROM topten_week_standings WHERE week_id = ? AND version = ? ORDER BY rank')
    .bind(weekId, week.snapshot_version).all()).results || [];
  const awards = (await db.prepare('SELECT award_type, track_id, explanation FROM topten_awards WHERE week_id = ? AND version = ?')
    .bind(weekId, week.snapshot_version).all()).results || [];
  return { week, rows, awards };
}

async function sha256Hex(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Wyróżnienia (§8) — wyłącznie promocyjne ─────────────────────────────────
async function computeAwards(db, weekId, standings) {
  const awards = [];
  const leader = standings[0];
  if (leader && leader.points > 0) awards.push({ award_type: 'hit', track_id: leader.track_id, explanation: `1. miejsce — ${leader.points} pkt` });

  const prev = await officialSnapshot(db, addDays(weekId, -7));
  if (prev) {
    const prevRank = new Map(prev.rows.map(r => [r.track_id, r.rank]));
    const climbs = standings.filter(s => prevRank.has(s.track_id) && prevRank.get(s.track_id) > s.rank && s.points > 0)
      .map(s => ({ s, d: prevRank.get(s.track_id) - s.rank })).sort((a, b) => b.d - a.d || a.s.rank - b.s.rank);
    if (climbs.length) awards.push({ award_type: 'biggest_climb', track_id: climbs[0].s.track_id, explanation: `awans o ${climbs[0].d} m. (z ${prevRank.get(climbs[0].s.track_id)} na ${climbs[0].s.rank})` });
  }
  const debut = standings.find(s => s.entry_type === 'debut' && s.points > 0);
  if (debut) awards.push({ award_type: 'debut', track_id: debut.track_id, explanation: `najwyżej sklasyfikowany debiut — miejsce ${debut.rank}` });
  const comeback = standings.find(s => s.entry_type === 'return' && s.rank <= TOP_SIZE && s.points > 0);
  if (comeback) awards.push({ award_type: 'comeback', track_id: comeback.track_id, explanation: `powrót z archiwum do TOP 10 — miejsce ${comeback.rank}` });

  if (leader && leader.points > 0) {
    const rec = await db.prepare('SELECT MAX(points) AS m, COUNT(*) AS n FROM topten_week_standings WHERE week_id < ?').bind(weekId).first();
    if ((rec?.n || 0) > 0 && leader.points > (rec.m || 0)) {
      awards.push({ award_type: 'record', track_id: leader.track_id, explanation: `rekord tygodnia: ${leader.points} pkt (poprzedni: ${rec.m})` });
    }
  }
  return awards;
}

// ─── Zamknięcie tygodnia (§7, §16 finalizeWeek) ──────────────────────────────
export async function finalizeWeek(db, weekId, { nowMs = Date.now(), actor = 'system', correction = false, reason = null } = {}) {
  const week = await db.prepare('SELECT * FROM topten_weeks WHERE id = ?').bind(weekId).first();
  if (!week) return { ok: false, error: 'week_not_found' };
  if (Date.parse(weekBounds(weekId).end_utc) > nowMs) return { ok: false, error: 'week_not_ended' };
  const already = week.status === 'finalized' || week.status === 'corrected';
  if (already && !correction) return { ok: true, idempotent: true, version: week.snapshot_version };

  // Głosy wstrzymane przez redakcję → wynik pozostaje wstępny (bez publikacji FINAL), chyba że to świadoma korekta.
  const held = await db.prepare("SELECT COUNT(*) AS n FROM topten_events WHERE cycle_id = ? AND review_status = 'held'").bind(weekId).first();
  if ((held?.n || 0) > 0 && !correction) {
    await db.prepare("UPDATE topten_weeks SET status = 'closing', provisional_reason = ?, updated_at = ? WHERE id = ?")
      .bind(`${held.n} głos(ów) czeka na weryfikację`, new Date(nowMs).toISOString(), weekId).run();
    return { ok: true, provisional: true, held: held.n };
  }

  const standings = await standingsFor(db, weekId);
  const version = (week.snapshot_version || 0) + 1;
  const computedAt = new Date(nowMs).toISOString();
  const awards = await computeAwards(db, weekId, standings);
  const checksum = await sha256Hex(JSON.stringify({ weekId, version, rules: RULES_VERSION,
    standings: standings.map(s => [s.track_id, s.rank, s.points, s.likes, s.boosts, s.unique_like_voters, s.reached_at]) }));

  const stmts = standings.map(s => db.prepare(`INSERT INTO topten_week_standings
      (week_id, version, track_id, rank, bucket, points, likes, boosts, unique_like_voters, reached_at, title, artist, computed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(weekId, version, s.track_id, s.rank, s.bucket, s.points, s.likes, s.boosts, s.unique_like_voters, s.reached_at, s.title, s.artist, computedAt));
  for (const a of awards) {
    stmts.push(db.prepare('INSERT INTO topten_awards (week_id, version, award_type, track_id, explanation, rules_version, computed_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(weekId, version, a.award_type, a.track_id, a.explanation, RULES_VERSION, computedAt));
  }
  // Warunek na wersji chroni przed podwójnym zamknięciem w wyścigu (drugi zapis padnie na PRIMARY KEY snapshotu).
  stmts.push(db.prepare(`UPDATE topten_weeks SET status = ?, snapshot_version = ?, finalized_at = ?, checksum = ?, provisional_reason = NULL, updated_at = ?
      WHERE id = ? AND snapshot_version = ?`)
    .bind(correction ? 'corrected' : 'finalized', version, computedAt, checksum, computedAt, weekId, week.snapshot_version || 0));
  stmts.push(db.prepare('INSERT INTO topten_audit_log (actor, action, object_id, details, ts) VALUES (?, ?, ?, ?, ?)')
    .bind(actor, correction ? 'week.corrected' : 'week.finalized', weekId, JSON.stringify({ version, checksum, reason, rules: RULES_VERSION }), computedAt));
  try {
    await db.batch(stmts);
  } catch (e) {
    if (/UNIQUE|constraint/i.test(String(e?.message || e))) return { ok: true, idempotent: true, version };
    throw e;
  }
  return { ok: true, version, checksum, awards: awards.map(a => a.award_type) };
}

// ─── Przygotowanie puli kolejnego tygodnia (§5, §16 prepareNextRoster) ───────
export async function planRoster(db, prevWeekId, weekId) {
  const plan = { weekId, prevWeekId, keep: [], entrants: [], displaced: [], queuedOverflow: [], bootstrap: !prevWeekId };

  // Kolejka: zatwierdzone debiuty i dopuszczone powroty, FIFO (data zatwierdzenia, potem id).
  const queue = ((await db.prepare(`SELECT t.id, t.queue_entry, t.queued_at, a.eligible_from_week
      FROM topten_tracks t LEFT JOIN topten_song_archive a ON a.track_id = t.id
      WHERE t.status = 'published' AND t.pool_status = 'queued' ORDER BY t.queued_at, t.id`).all()).results || [])
    .filter(q => q.queue_entry !== 'return' || !q.eligible_from_week || q.eligible_from_week <= weekId);

  if (!prevWeekId) {
    // Pierwszy tydzień po włączeniu flagi: obecne utwory w kolejności poprzedniego tygodnia kalendarzowego.
    const active = (await db.prepare("SELECT id, created_at FROM topten_tracks WHERE status = 'published' AND pool_status = 'active'").all()).results || [];
    const agg = await aggregateWeek(db, addDays(weekId, -7));
    const ranked = sortStandings(active.map(t => {
      const a = agg.get(t.id) || {};
      return { track_id: t.id, points: a.points || 0, likes: a.likes || 0, unique_like_voters: a.unique_like_voters || 0, reached_at: a.reached_at ?? null };
    }));
    plan.keep = ranked.slice(0, ROSTER_MAX).map((r, i) => ({ track_id: r.track_id, entry_type: 'legacy', prevRank: i + 1 }));
    plan.queuedOverflow = ranked.slice(ROSTER_MAX).map(r => r.track_id);
  } else {
    const snap = await officialSnapshot(db, prevWeekId);
    const prevRows = snap ? snap.rows : await standingsFor(db, prevWeekId); // wynik wstępny, gdy oficjalny czeka na weryfikację
    const tracks = new Map(((await db.prepare('SELECT id, status, pool_status FROM topten_tracks').all()).results || []).map(t => [t.id, t]));
    plan.keep = prevRows
      .filter(r => tracks.get(r.track_id)?.status === 'published' && ['active', 'suspended'].includes(tracks.get(r.track_id)?.pool_status))
      .map(r => ({ track_id: r.track_id, entry_type: 'carryover', prevRank: r.rank }));
  }

  const wanted = Math.min(DEBUTS_PER_WEEK, queue.length);
  const free = Math.max(0, ROSTER_MAX - plan.keep.length);
  const fill = Math.min(wanted, free);
  // Wymiana tylko na granicy puli: najniższe miejsca spoza TOP 10. Nigdy nie usuwamy utworu z TOP 10.
  const replaceable = plan.keep.filter(k => k.prevRank > TOP_SIZE).sort((a, b) => b.prevRank - a.prevRank);
  const replace = Math.min(wanted - fill, replaceable.length);
  plan.displaced = replaceable.slice(0, replace).map(k => k.track_id);
  plan.keep = plan.keep.filter(k => !plan.displaced.includes(k.track_id));
  plan.entrants = queue.slice(0, fill + replace).map(q => ({ track_id: q.id, entry_type: q.queue_entry === 'return' ? 'return' : 'debut' }));
  return plan;
}

function rosterStatements(db, plan, nowIso) {
  const { weekId, prevWeekId } = plan;
  const s = [];
  for (const k of plan.keep) {
    s.push(db.prepare('INSERT INTO topten_week_roster (week_id, track_id, entry_type, entry_at) VALUES (?, ?, ?, ?)').bind(weekId, k.track_id, k.entry_type, nowIso));
    s.push(db.prepare('INSERT INTO topten_roster_transitions (track_id, week_from, week_to, from_bucket, to_bucket, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(k.track_id, prevWeekId, weekId, k.prevRank <= TOP_SIZE ? 'top10' : 'waiting', 'active', plan.bootstrap ? 'legacy_bootstrap' : 'carryover', nowIso));
  }
  for (const e of plan.entrants) {
    s.push(db.prepare('INSERT INTO topten_week_roster (week_id, track_id, entry_type, entry_at) VALUES (?, ?, ?, ?)').bind(weekId, e.track_id, e.entry_type, nowIso));
    s.push(db.prepare("UPDATE topten_tracks SET pool_status = 'active', queued_at = NULL, queue_entry = NULL, updated_at = ? WHERE id = ?").bind(nowIso, e.track_id));
    s.push(db.prepare('INSERT INTO topten_roster_transitions (track_id, week_from, week_to, from_bucket, to_bucket, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(e.track_id, prevWeekId, weekId, e.entry_type === 'return' ? 'archive' : 'queue', 'active', e.entry_type === 'return' ? 'return' : 'new_debut_slot', nowIso));
  }
  for (const id of plan.displaced) {
    s.push(db.prepare("UPDATE topten_tracks SET pool_status = 'archived', updated_at = ? WHERE id = ?").bind(nowIso, id));
    s.push(db.prepare(`INSERT INTO topten_song_archive (track_id, archived_at_week, eligible_from_week, reason, created_at) VALUES (?, ?, ?, 'displaced_by_debut', ?)
        ON CONFLICT(track_id) DO UPDATE SET archived_at_week = excluded.archived_at_week, eligible_from_week = excluded.eligible_from_week, reason = excluded.reason, created_at = excluded.created_at`)
      .bind(id, prevWeekId, addDays(weekId, 7 * RETURN_WAIT_WEEKS), nowIso));
    s.push(db.prepare('INSERT INTO topten_roster_transitions (track_id, week_from, week_to, from_bucket, to_bucket, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, prevWeekId, weekId, 'waiting', 'archive', 'displaced_by_debut', nowIso));
  }
  for (const id of plan.queuedOverflow) {
    s.push(db.prepare("UPDATE topten_tracks SET pool_status = 'queued', queued_at = created_at, queue_entry = 'debut', updated_at = ? WHERE id = ?").bind(nowIso, id));
  }
  return s;
}

/**
 * Leniwe otwarcie bieżącego tygodnia: zamyka poprzedni (snapshot) i zapisuje pulę — raz, idempotentnie.
 * Zwraca wiersz bieżącego tygodnia (status 'open' albo 'preparing', gdy inna instancja właśnie go przygotowuje).
 */
export async function ensureWeek(db, nowMs) {
  const weekId = warsawClock(nowMs).cycleId;
  const nowIso = new Date(nowMs).toISOString();
  let week = await db.prepare('SELECT * FROM topten_weeks WHERE id = ?').bind(weekId).first();
  if (week && week.status !== 'preparing') return week;

  // Blokada: wstawienie wiersza 'preparing' (albo przejęcie porzuconego po 2 min).
  const { start_utc, end_utc } = weekBounds(weekId);
  let claimed = false;
  if (!week) {
    const r = await db.prepare(`INSERT OR IGNORE INTO topten_weeks (id, start_utc, end_utc, status, rules_version, updated_at)
      VALUES (?, ?, ?, 'preparing', ?, ?)`).bind(weekId, start_utc, end_utc, RULES_VERSION, nowIso).run();
    claimed = (r?.meta?.changes ?? 0) === 1;
  } else if (Date.parse(week.updated_at) < nowMs - PREPARING_STALE_MS) {
    const r = await db.prepare("UPDATE topten_weeks SET updated_at = ? WHERE id = ? AND status = 'preparing' AND updated_at = ?")
      .bind(nowIso, weekId, week.updated_at).run();
    claimed = (r?.meta?.changes ?? 0) === 1;
  }
  if (!claimed) return db.prepare('SELECT * FROM topten_weeks WHERE id = ?').bind(weekId).first();

  const prev = await db.prepare("SELECT * FROM topten_weeks WHERE id < ? AND status != 'preparing' ORDER BY id DESC LIMIT 1").bind(weekId).first();
  if (prev && prev.status === 'open') await finalizeWeek(db, prev.id, { nowMs });
  const plan = await planRoster(db, prev?.id || null, weekId);
  const stmts = rosterStatements(db, plan, nowIso);
  stmts.push(db.prepare("UPDATE topten_weeks SET status = 'open', updated_at = ? WHERE id = ?").bind(nowIso, weekId));
  stmts.push(db.prepare('INSERT INTO topten_audit_log (actor, action, object_id, details, ts) VALUES (?, ?, ?, ?, ?)')
    .bind('system', 'week.opened', weekId, JSON.stringify({ keep: plan.keep.length, entrants: plan.entrants.map(e => e.track_id), displaced: plan.displaced, bootstrap: plan.bootstrap }), nowIso));
  await db.batch(stmts);
  return db.prepare('SELECT * FROM topten_weeks WHERE id = ?').bind(weekId).first();
}

// ─── Widoki publiczne ────────────────────────────────────────────────────────
export async function debutQueue(db, weekId) {
  const rows = (await db.prepare(`SELECT t.id, t.title, t.artist, t.queue_entry, t.queued_at, a.eligible_from_week
      FROM topten_tracks t LEFT JOIN topten_song_archive a ON a.track_id = t.id
      WHERE t.status = 'published' AND t.pool_status = 'queued' ORDER BY t.queued_at, t.id`).all()).results || [];
  return rows.map((r, i) => ({ id: r.id, title: r.title, artist: r.artist, entry: r.queue_entry || 'debut', position: i + 1,
    eligibleFromWeek: r.queue_entry === 'return' ? (r.eligible_from_week || null) : null,
    waitingForEligibility: r.queue_entry === 'return' && !!r.eligible_from_week && r.eligible_from_week > addDays(weekId, 7) }));
}

export async function songArchive(db) {
  const rows = (await db.prepare(`SELECT t.id, t.title, t.artist, t.pool_status, t.status, a.archived_at_week, a.eligible_from_week, a.reason,
      (SELECT MIN(rank) FROM topten_week_standings s WHERE s.track_id = t.id) AS best_rank,
      (SELECT COUNT(DISTINCT week_id) FROM topten_week_standings s WHERE s.track_id = t.id) AS weeks_charted
    FROM topten_tracks t LEFT JOIN topten_song_archive a ON a.track_id = t.id
    WHERE t.pool_status IN ('archived', 'suspended') OR t.status IN ('hidden', 'takedown') ORDER BY a.archived_at_week DESC, t.id`).all()).results || [];
  return rows.map(r => ({
    id: r.id, title: r.title, artist: r.artist,
    state: r.status === 'takedown' || r.pool_status === 'suspended' ? 'niedostępny' : r.status === 'hidden' ? 'wycofany' : 'archiwum',
    lastWeek: r.archived_at_week || null, eligibleFromWeek: r.eligible_from_week || null,
    bestRank: r.best_rank ?? null, weeksCharted: r.weeks_charted || 0,
  }));
}

export async function songHistory(db, trackId) {
  const rows = (await db.prepare(`SELECT s.week_id, s.rank, s.bucket, s.points FROM topten_week_standings s
      JOIN topten_weeks w ON w.id = s.week_id AND w.snapshot_version = s.version
      WHERE s.track_id = ? ORDER BY s.week_id`).bind(trackId).all()).results || [];
  return { weeks: rows, allTimePoints: rows.reduce((n, r) => n + r.points, 0), bestRank: rows.length ? Math.min(...rows.map(r => r.rank)) : null };
}

export async function allTimePoints(db) {
  const rows = (await db.prepare(`SELECT s.track_id, SUM(s.points) AS pts FROM topten_week_standings s
      JOIN topten_weeks w ON w.id = s.week_id AND w.snapshot_version = s.version GROUP BY s.track_id`).all()).results || [];
  return new Map(rows.map(r => [r.track_id, r.pts]));
}

export async function lastOfficial(db, beforeWeekId) {
  const w = await db.prepare("SELECT id FROM topten_weeks WHERE id < ? AND status IN ('finalized', 'corrected') ORDER BY id DESC LIMIT 1").bind(beforeWeekId).first();
  if (!w) return null;
  const snap = await officialSnapshot(db, w.id);
  return {
    weekId: w.id, version: snap.week.snapshot_version, status: snap.week.status,
    top10: snap.rows.filter(r => r.bucket === 'top10').map(r => ({ id: r.track_id, rank: r.rank, title: r.title, artist: r.artist, points: r.points })),
    awards: snap.awards.map(a => ({ type: a.award_type, id: a.track_id, explanation: a.explanation })),
  };
}
