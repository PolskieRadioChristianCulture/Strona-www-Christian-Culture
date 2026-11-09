/**
 * Wymiana ccMC ↔ agent automatyzacji raportów (@007, 09.11.2026, STANDARD_777_ccMC_SPRAWOZDANIE_GLOSOWE V1.2)
 *
 * Kierunek 1 — prezenterka → agent: ccMC po każdym raporcie kwadransowym zapisuje tekst na serwerze
 *   (POST /api/mission-calendar/voice/emitted, sesja właściciela). Zadanie CC_A007_GcalQuarterSync pobiera
 *   ostatnie raporty (GET z tokenem CC_MC_LIVE_REPORT_TOKEN) i zapisuje je LOKALNIE:
 *   %LOCALAPPDATA%\ChristianCulture\GCalendarReports\ostatni-raport-glosowy.json
 * Kierunek 2 — agent → prezenterka: agent zapisuje lokalnie komunikat-dla-prezenterki.json
 *   ({ text, prepared_by, valid_until }); zadanie synchronizacji dołącza go jako `presenter_brief`
 *   do żywego raportu, a ccMC odczytuje go w najbliższym raporcie (dopóki valid_until nie minie).
 * Oba pliki mogą zawierać prywatny kalendarz Dowódcy — NIGDY do repo, Skrzynki ani JOMA.
 */
import fs from 'node:fs';
import path from 'node:path';

export const EMITTED_FILE_NAME = 'ostatni-raport-glosowy.json';
export const PRESENTER_BRIEF_FILE_NAME = 'komunikat-dla-prezenterki.json';
export const PRESENTER_BRIEF_MAX_CHARS = 600;
export const PRESENTER_BRIEF_MAX_VALID_MS = 6 * 3600_000;

/** Zwraca tylko sekcje JOMA_STATUS.md z nagłówkiem „## <todayIso> …” (cały plik, bez limitu znaków). */
export function extractTodayJomaSections(fullText, todayIso) {
  const text = String(fullText || '');
  if (!todayIso) return '';
  return text
    .split(/^(?=## )/m)
    .filter((part) => part.startsWith(`## ${todayIso}`))
    .join('\n');
}

/**
 * Odczytuje komunikat agenta dla prezenterki. Zwraca null, gdy pliku brak, jest pusty, przeterminowany
 * albo ma niepoprawny format. Ważność ograniczona do 6 h, tekst do 600 znaków.
 */
export function readPresenterBrief(dir, now = new Date()) {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, PRESENTER_BRIEF_FILE_NAME), 'utf8'));
    return normalizePresenterBrief(raw, now);
  } catch {
    return null;
  }
}

export function normalizePresenterBrief(raw, now = new Date()) {
  if (!raw || typeof raw !== 'object') return null;
  const text = String(raw.text || '').replace(/\s+/g, ' ').trim().slice(0, PRESENTER_BRIEF_MAX_CHARS);
  if (!text) return null;
  const nowMs = now.getTime();
  let validUntil = Date.parse(raw.valid_until || '');
  if (!Number.isFinite(validUntil)) validUntil = nowMs + 20 * 60_000;
  validUntil = Math.min(validUntil, nowMs + PRESENTER_BRIEF_MAX_VALID_MS);
  if (validUntil <= nowMs) return null;
  return {
    text,
    prepared_by: String(raw.prepared_by || 'agent automatyzacji').slice(0, 60),
    prepared_at: raw.prepared_at && Number.isFinite(Date.parse(raw.prepared_at)) ? raw.prepared_at : now.toISOString(),
    valid_until: new Date(validUntil).toISOString(),
  };
}

/** Zapisuje pobrane z serwera raporty wyemitowane (najnowszy pierwszy) do pliku lokalnego dla agentów. */
export function writeLastEmittedVoiceReport(dir, reports, now = new Date()) {
  const list = Array.isArray(reports) ? reports : [];
  const payload = {
    schema_version: '1.0',
    fetched_at: now.toISOString(),
    note: 'Prywatne: tekst raportów może zawierać kalendarz Dowódcy. Nie kopiować do repo, Skrzynki ani JOMA.',
    latest: list[0] || null,
    history: list,
  };
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, EMITTED_FILE_NAME), JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

// ────────────────────────────────────────────────────────────────────────────
// Raport misyjny KWADRANSU (L0 09.11.2026): tylko to, co wydarzyło się od poprzedniego raportu.
// Źródła (zero kosztów, tylko odczyt plików lokalnych):
//   - data/youtube_published_history.json, data/x_published_history.json, data/fb_shorts_history.json,
//     data/whatsapp_zaczepki_log.json, data/whatsapp_hooks_state.json (repo główne),
//   - JOMA_STATUS.md (sekcje „## RRRR-MM-DD GG:MM (Warszawa) — @agent: tytuł”),
//   - Skrzynka: SKRZYNKA/wiadomosci/RRRR-MM/MSG-*.md (temat KONIEC…/START…, wymaga_dowodcy: tak).
// ────────────────────────────────────────────────────────────────────────────
const TZ = 'Europe/Warsaw';
const ALERT_HOURS = new Set([9, 13, 18]);

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

export function warsawParts(ms) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
    })
      .formatToParts(new Date(ms))
      .map((p) => [p.type, p.value])
  );
  const hour = parts.hour === '24' ? '00' : parts.hour;
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hm: `${hour}:${parts.minute}`, hour: Number(hour), minute: Number(parts.minute) };
}

/** „2026-11-09” + „06:05” w czasie Warszawy → ms UTC (czas zimowy i letni). */
export function warsawLocalToMs(dateIso, hm) {
  const guess = Date.parse(`${dateIso}T${hm}:00Z`);
  if (!Number.isFinite(guess)) return NaN;
  for (const offsetH of [1, 2]) {
    const ms = guess - offsetH * 3600_000;
    const p = warsawParts(ms);
    if (p.date === dateIso && p.hm === hm) return ms;
  }
  return guess - 3600_000;
}

/** Tytuł do przeczytania przez lektorkę: bez znaczników, emoji, numerów technicznych i statusów QA. */
export function cleanSpokenTitle(raw, maxLen = 90) {
  let t = String(raw || '')
    .replace(/[`*_#>|]/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\((?:CCN BROADCASTER|BROADCASTER)[^)]*\)/gi, ' ')
    .replace(/\b(?:X )?PROD LIVE\b/gi, ' ')
    .replace(/\bZERO-QA PASS\b/gi, ' ')
    .replace(/\(GEN-\d+\)/gi, ' ')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[\s,;:—–-]+$/, '');
  if (t.length > maxLen) t = `${t.slice(0, maxLen).replace(/\s+\S*$/, '')}…`;
  return t;
}

function collectPublications(repoRoot) {
  const out = { youtube: [], x: [], facebook: [], whatsapp: [] };
  const yt = readJsonSafe(path.join(repoRoot, 'data', 'youtube_published_history.json'));
  for (const it of yt && Array.isArray(yt.published) ? yt.published : []) {
    const ms = Date.parse(it.publishedAt || '');
    if (Number.isFinite(ms)) out.youtube.push({ ms, title: it.title || it.videoFile || 'film', channel: it.channel || '' });
  }
  const x = readJsonSafe(path.join(repoRoot, 'data', 'x_published_history.json'));
  for (const it of x && Array.isArray(x.published) ? x.published : []) {
    const ms = Date.parse(it.publishedAt || '');
    if (Number.isFinite(ms)) out.x.push({ ms, title: it.title || it.slug || 'post' });
  }
  // fb_shorts_history.json: { "RRRR-MM-DD": { "<strona>": { status, videoStem, timestamp } } }
  const fb = readJsonSafe(path.join(repoRoot, 'data', 'fb_shorts_history.json'));
  if (fb && typeof fb === 'object' && !Array.isArray(fb)) {
    for (const day of Object.values(fb)) {
      for (const [page, v] of Object.entries(day && typeof day === 'object' ? day : {})) {
        const ms = Date.parse((v && (v.timestamp || v.publishedAt)) || '');
        if (Number.isFinite(ms) && (!v.status || v.status === 'published')) {
          out.facebook.push({ ms, title: v.videoStem || v.title || 'publikacja', channel: page });
        }
      }
    }
  }
  const waLog = readJsonSafe(path.join(repoRoot, 'data', 'whatsapp_zaczepki_log.json'));
  for (const it of Array.isArray(waLog) ? waLog : []) {
    const ms = Date.parse(it.timestamp || '');
    if (Number.isFinite(ms)) out.whatsapp.push({ ms, title: 'wiadomość na grupę' });
  }
  const waHooks = readJsonSafe(path.join(repoRoot, 'data', 'whatsapp_hooks_state.json'));
  for (const it of waHooks && Array.isArray(waHooks.history) ? waHooks.history : []) {
    const ms = Date.parse(it.timestamp || '');
    if (Number.isFinite(ms)) out.whatsapp.push({ ms, title: 'wiadomość na grupę' });
  }
  return out;
}

export function collectJomaEntries(jomaText, todayIso) {
  const out = [];
  const re = new RegExp(`^## (${todayIso}) (\\d{2}:\\d{2}) \\(Warszawa\\) — ([^:\\n]+?): ([^\\n]+)$`, 'gm');
  let m;
  while ((m = re.exec(String(jomaText || '')))) {
    out.push({ ms: warsawLocalToMs(m[1], m[2]), agent: m[3].trim(), title: m[4].trim() });
  }
  return out;
}

function collectSkrzynka(skrzynkaDir, windowStartMs, windowEndMs) {
  const out = [];
  if (!skrzynkaDir) return out;
  const months = new Set([new Date(windowStartMs).toISOString().slice(0, 7), new Date(windowEndMs).toISOString().slice(0, 7)]);
  for (const month of months) {
    const dir = path.join(skrzynkaDir, 'wiadomosci', month);
    let files = [];
    try {
      files = fs.readdirSync(dir).filter((f) => /^MSG-\d{8}T\d{6}Z-.+\.md$/.test(f));
    } catch {
      continue;
    }
    for (const f of files) {
      const m = f.match(/^MSG-(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z-([^-]+)/);
      const ms = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
      if (ms <= windowStartMs || ms > windowEndMs) continue;
      let head = '';
      try {
        head = fs.readFileSync(path.join(dir, f), 'utf8').slice(0, 1500);
      } catch {
        continue;
      }
      const field = (k) => ((head.match(new RegExp(`^${k}:\\s*(.+)$`, 'm')) || [])[1] || '').trim();
      out.push({
        ms,
        agent: field('od') || m[7],
        topic: field('temat'),
        needsCommander: /^tak/i.test(field('wymaga_dowodcy')),
      });
    }
  }
  return out;
}

function groupYoutube(items) {
  const byTitle = new Map();
  for (const it of items) {
    const key = cleanSpokenTitle(it.title, 70);
    if (!byTitle.has(key)) byTitle.set(key, new Set());
    if (it.channel) byTitle.get(key).add(it.channel);
  }
  return [...byTitle.entries()].map(([title, chans]) => (chans.size > 1 ? `„${title}” na ${chans.size} kanałach` : `„${title}”`));
}

function more(n) {
  return n > 0 ? ` i ${n} innych` : '';
}

/**
 * Raport misyjny kwadransu. windowStartMs = koniec okna z poprzedniego raportu (albo now − 15 min).
 * Wynik trafia do pola mission_automation_report; spoken_summary czyta lektorka ccMC.
 */
export function collectQuarterMissionActivity({ repoRoot, jomaStatusPath, skrzynkaDir, now = new Date(), windowStartMs = null } = {}) {
  const endMs = now.getTime();
  let startMs = Number.isFinite(windowStartMs) ? windowStartMs : endMs - 15 * 60_000;
  if (endMs - startMs > 40 * 60_000 || startMs >= endMs) startMs = endMs - 15 * 60_000;
  const inWindow = (ms) => ms > startMs && ms <= endMs;
  const endParts = warsawParts(endMs);
  const todayIso = endParts.date;
  const startHm = warsawParts(startMs).hm;

  const pubs = collectPublications(repoRoot);
  let jomaText = '';
  try {
    jomaText = extractTodayJomaSections(fs.readFileSync(jomaStatusPath, 'utf8'), todayIso);
  } catch {}
  const joma = collectJomaEntries(jomaText, todayIso);
  const skrzynka = collectSkrzynka(skrzynkaDir, startMs, endMs);

  const w = {
    youtube: pubs.youtube.filter((i) => inWindow(i.ms)),
    x: pubs.x.filter((i) => inWindow(i.ms)),
    facebook: pubs.facebook.filter((i) => inWindow(i.ms)),
    whatsapp: pubs.whatsapp.filter((i) => inWindow(i.ms)),
    rozwazania: joma.filter((e) => inWindow(e.ms) && /Poranna publikacja i synchronizacja rozważań/i.test(e.title)),
    started: skrzynka.filter((s) => /^START\b/i.test(s.topic)),
    needsCommander: skrzynka.filter((s) => s.needsCommander),
  };
  // Zakończone zadania — bez dublowania postów na X, które już są wymienione wyżej
  const finished = skrzynka.filter((s) => /^KONIEC\b/i.test(s.topic) && !(w.x.length && /(?:na X\b|platformie X|na X #)/i.test(s.topic)));

  const sentences = [];
  for (const e of w.rozwazania) {
    const d = e.title.match(/Dzień\s+(\d+)\s*\(([^)]+)\)/i);
    sentences.push(`Opublikowano rozważania${d ? ` — dzień ${d[1]}, ${d[2]}` : ''}.`);
  }
  if (w.youtube.length) {
    const g = groupYoutube(w.youtube);
    sentences.push(`Na YouTube wgrano ${w.youtube.length === 1 ? 'film' : `${w.youtube.length} filmy`}: ${g.slice(0, 3).join(', ')}${more(g.length - 3)}.`);
  }
  if (w.x.length) {
    const titles = w.x.map((i) => `„${cleanSpokenTitle(i.title, 80)}”`);
    sentences.push(`Na platformie X ${w.x.length === 1 ? 'opublikowano post' : `opublikowano ${w.x.length} posty`}: ${titles.slice(0, 2).join(', ')}${more(titles.length - 2)}.`);
  }
  if (w.facebook.length) sentences.push(`Na Facebooku: ${w.facebook.length === 1 ? 'jedna publikacja' : `${w.facebook.length} publikacje`}.`);
  if (w.whatsapp.length) sentences.push(`Na WhatsApp wysłano ${w.whatsapp.length === 1 ? 'jedną wiadomość' : `${w.whatsapp.length} wiadomości`} do grup.`);
  if (finished.length) {
    const list = finished.slice(0, 3).map((s) => `${s.agent} — ${cleanSpokenTitle(s.topic.replace(/^KONIEC:?\s*/i, ''), 80)}`);
    sentences.push(`Agenci zakończyli: ${list.join('; ')}${more(finished.length - 3)}.`);
  }
  if (w.started.length) {
    const list = w.started.slice(0, 2).map((s) => `${s.agent} — ${cleanSpokenTitle(s.topic.replace(/^START:?\s*/i, ''), 80)}`);
    sentences.push(`Agenci rozpoczęli: ${list.join('; ')}${more(w.started.length - 2)}.`);
  }
  if (w.needsCommander.length) {
    const list = w.needsCommander.slice(0, 2).map((s) => cleanSpokenTitle(s.topic.replace(/^(?:KONIEC|START|PYTANIE):?\s*/i, ''), 80));
    sentences.push(`Czeka na Twoją decyzję: ${list.join('; ')}${more(w.needsCommander.length - 2)}.`);
  }
  const hasNews = sentences.length > 0;

  // Bilans dnia i kanały bez publikacji — tylko 3 razy dziennie (pierwszy raport po 9:00, 13:00, 18:00)
  const dayStartMs = warsawLocalToMs(todayIso, '00:00');
  const dayCount = (list) => list.filter((i) => i.ms >= dayStartMs && i.ms <= endMs).length;
  const lastAt = (list) => {
    const ms = list.map((i) => i.ms).filter((v) => v <= endMs).reduce((a, b) => (b > a ? b : a), 0);
    return ms ? new Date(ms).toISOString() : null;
  };
  const day_totals = {
    youtube: { count: dayCount(pubs.youtube), last_at: lastAt(pubs.youtube) },
    x: { count: dayCount(pubs.x), last_at: lastAt(pubs.x) },
    facebook: { count: dayCount(pubs.facebook), last_at: lastAt(pubs.facebook) },
    whatsapp: { count: dayCount(pubs.whatsapp), last_at: lastAt(pubs.whatsapp) },
    rozwazania: { published_today: joma.some((e) => /Poranna publikacja i synchronizacja rozważań/i.test(e.title)) },
  };
  const fmtDay = (iso) => new Intl.DateTimeFormat('pl-PL', { timeZone: TZ, day: 'numeric', month: 'long' }).format(new Date(iso));
  const silent = [];
  for (const [key, label] of [['facebook', 'Facebook'], ['whatsapp', 'WhatsApp'], ['youtube', 'YouTube'], ['x', 'platforma X']]) {
    const t = day_totals[key];
    if (t.count === 0) silent.push(t.last_at ? `${label} — ostatnio ${fmtDay(t.last_at)}` : `${label} — brak zapisu`);
  }
  const isBalanceSlot = ALERT_HOURS.has(endParts.hour) && endParts.minute < 15;
  const balance = [];
  if (isBalanceSlot) {
    balance.push(
      `Bilans dnia: YouTube ${day_totals.youtube.count}, platforma X ${day_totals.x.count}, Facebook ${day_totals.facebook.count}, WhatsApp ${day_totals.whatsapp.count}; rozważania ${day_totals.rozwazania.published_today ? 'opublikowane' : 'bez potwierdzenia'}.`
    );
    if (silent.length) balance.push(`Dziś bez publikacji: ${silent.join(', ')}.`);
  }

  const head = hasNews
    ? `Od ${startHm} do ${endParts.hm} w misji: ${sentences.join(' ')}`
    : `Od ${startHm} do ${endParts.hm} w misji bez nowych publikacji i bez zakończonych zadań agentów.`;
  const spoken = [head, ...balance].join(' ');

  const iso = (ms) => new Date(ms).toISOString();
  const items = [
    ...w.rozwazania.map((e) => ({ at: iso(e.ms), kind: 'rozwazania', text: e.title })),
    ...w.youtube.map((i) => ({ at: iso(i.ms), kind: 'youtube', channel: i.channel, text: i.title })),
    ...w.x.map((i) => ({ at: iso(i.ms), kind: 'x', text: i.title })),
    ...w.facebook.map((i) => ({ at: iso(i.ms), kind: 'facebook', channel: i.channel, text: i.title })),
    ...w.whatsapp.map((i) => ({ at: iso(i.ms), kind: 'whatsapp', text: i.title })),
    ...skrzynka.map((s) => ({ at: iso(s.ms), kind: 'skrzynka', agent: s.agent, text: s.topic, needs_commander: s.needsCommander })),
  ].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

  return {
    schema_version: '2.0',
    scope: 'quarter',
    date: todayIso,
    generated_at: iso(endMs),
    window_start: iso(startMs),
    window_end: iso(endMs),
    has_news: hasNews,
    items,
    day_totals,
    silent_channels_today: silent,
    spoken_summary: spoken,
  };
}
