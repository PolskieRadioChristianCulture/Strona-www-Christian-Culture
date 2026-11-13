// ============================================================================
// Czytnik iCal (ICS) Kalendarza Google — zero kosztów, bez bibliotek, tylko odczyt.
// @007 (claude), 09.11.2026. Źródło: prywatny „Tajny adres w formacie iCal” właściciela
// (plik %USERPROFILE%\.cc-secrets\gcal_ical_url.txt — poza repo) + publiczne święta PL.
// Wynik w kształcie zdarzeń Google Calendar API (start/end/summary/...), żeby pasował do
// normalizeGcalItems() w sync-gcalendar-quarter-hour.mjs.
// ============================================================================

const TZ = 'Europe/Warsaw';
const DAY_MS = 86400_000;
const WEEKDAYS = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

export function unfoldIcs(text) {
  return String(text || '').replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '').split('\n');
}

function unescapeText(v) {
  return String(v || '')
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

function parseLine(line) {
  const idx = line.indexOf(':');
  if (idx < 0) return null;
  const head = line.slice(0, idx);
  const value = line.slice(idx + 1);
  const [name, ...paramParts] = head.split(';');
  const params = {};
  for (const p of paramParts) {
    const eq = p.indexOf('=');
    if (eq > 0) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1).replace(/^"|"$/g, '');
  }
  return { name: name.toUpperCase(), params, value };
}

// Przesunięcie strefy (minuty) dla danej chwili UTC
function tzOffsetMinutes(utcMs, timeZone = TZ) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(utcMs));
  const g = (t) => Number(parts.find((p) => p.type === t).value);
  const asUtc = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second'));
  return Math.round((asUtc - utcMs) / 60000);
}

// Czas lokalny (ściana) w strefie → ms UTC (poprawnie przy zmianie czasu)
export function localToUtcMs(y, mo, d, h = 0, mi = 0, s = 0, timeZone = TZ) {
  const guess = Date.UTC(y, mo - 1, d, h, mi, s);
  let off = tzOffsetMinutes(guess, timeZone);
  let utc = guess - off * 60000;
  const off2 = tzOffsetMinutes(utc, timeZone);
  if (off2 !== off) utc = guess - off2 * 60000;
  return utc;
}

function localParts(utcMs, timeZone = TZ) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(utcMs));
  const g = (t) => Number(parts.find((p) => p.type === t).value);
  return { y: g('year'), mo: g('month'), d: g('day'), h: g('hour'), mi: g('minute'), s: g('second') };
}

export function toWarsawIso(utcMs) {
  const p = localParts(utcMs);
  const off = tzOffsetMinutes(utcMs);
  const sign = off >= 0 ? '+' : '-';
  const a = Math.abs(off);
  const pad = (n) => String(n).padStart(2, '0');
  return `${p.y}-${pad(p.mo)}-${pad(p.d)}T${pad(p.h)}:${pad(p.mi)}:${pad(p.s)}${sign}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}

// Wartość DTSTART/DTEND/EXDATE/RECURRENCE-ID → { allDay, utcMs, local:{y,mo,d,h,mi,s} }
export function parseIcsDate(value, params = {}) {
  const v = String(value || '').trim();
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const [, Y, Mo, D, H, Mi, S, Z] = m;
  const y = +Y, mo = +Mo, d = +D;
  if (params.VALUE === 'DATE' || H === undefined) {
    return { allDay: true, utcMs: Date.UTC(y, mo - 1, d), local: { y, mo, d, h: 0, mi: 0, s: 0 } };
  }
  if (Z) {
    const utcMs = Date.UTC(y, mo - 1, d, +H, +Mi, +S);
    return { allDay: false, utcMs, local: localParts(utcMs) };
  }
  const tz = params.TZID || TZ;
  const utcMs = localToUtcMs(y, mo, d, +H, +Mi, +S, tz);
  return { allDay: false, utcMs, local: localParts(utcMs) };
}

export function parseRRuleString(rrule) {
  const out = { freq: null, interval: 1, byday: null, bymonthday: null, bymonth: null, count: null, until: null };
  for (const part of String(rrule || '').split(';')) {
    const [k, val] = part.split('=');
    if (!k || val === undefined) continue;
    const key = k.toUpperCase();
    if (key === 'FREQ') out.freq = val.toUpperCase();
    else if (key === 'INTERVAL') out.interval = Math.max(1, parseInt(val, 10) || 1);
    else if (key === 'BYDAY') out.byday = val.split(',').map((x) => x.trim().toUpperCase()).filter(Boolean);
    else if (key === 'BYMONTHDAY') out.bymonthday = val.split(',').map((x) => parseInt(x, 10)).filter((n) => !Number.isNaN(n));
    else if (key === 'BYMONTH') out.bymonth = val.split(',').map((x) => parseInt(x, 10)).filter((n) => !Number.isNaN(n));
    else if (key === 'COUNT') out.count = parseInt(val, 10) || null;
    else if (key === 'UNTIL') out.until = parseIcsDate(val, val.length === 8 ? { VALUE: 'DATE' } : {});
  }
  return out;
}

function dayIndex(y, mo, d) {
  return Math.floor(Date.UTC(y, mo - 1, d) / DAY_MS);
}

function matchesRule(rule, start, y, mo, d) {
  const di = dayIndex(y, mo, d);
  const si = dayIndex(start.y, start.mo, start.d);
  if (di < si) return false;
  const dow = new Date(di * DAY_MS).getUTCDay();
  const startDow = new Date(si * DAY_MS).getUTCDay();
  if (rule.bymonth && rule.bymonth.length && !rule.bymonth.includes(mo)) return false;

  if (rule.freq === 'DAILY') {
    if ((di - si) % rule.interval !== 0) return false;
    if (rule.byday) return rule.byday.some((c) => WEEKDAYS[c.replace(/^[+-]?\d+/, '')] === dow);
    return true;
  }
  if (rule.freq === 'WEEKLY') {
    const startMonday = si - ((startDow + 6) % 7);
    const weeks = Math.floor((di - startMonday) / 7);
    if (weeks % rule.interval !== 0) return false;
    const days = rule.byday ? rule.byday.map((c) => WEEKDAYS[c.replace(/^[+-]?\d+/, '')]) : [startDow];
    return days.includes(dow);
  }
  if (rule.freq === 'MONTHLY') {
    const months = (y * 12 + mo) - (start.y * 12 + start.mo);
    if (months % rule.interval !== 0) return false;
    const dim = new Date(Date.UTC(y, mo, 0)).getUTCDate();
    if (rule.bymonthday && rule.bymonthday.length) {
      return rule.bymonthday.some((md) => (md < 0 ? dim + 1 + md : md) === d);
    }
    if (rule.byday && rule.byday.length) {
      return rule.byday.some((tok) => {
        const mm = tok.match(/^([+-]?\d+)?([A-Z]{2})$/);
        if (!mm || WEEKDAYS[mm[2]] !== dow) return false;
        if (!mm[1]) return true;
        const n = parseInt(mm[1], 10);
        const nth = Math.floor((d - 1) / 7) + 1;
        const nthFromEnd = Math.floor((dim - d) / 7) + 1;
        return n > 0 ? nth === n : nthFromEnd === -n;
      });
    }
    return d === start.d;
  }
  if (rule.freq === 'YEARLY') {
    if ((y - start.y) % rule.interval !== 0) return false;
    return mo === start.mo && d === start.d;
  }
  return false;
}

export function parseIcsEvents(icsText) {
  const lines = unfoldIcs(icsText);
  const events = [];
  let cur = null;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line === 'BEGIN:VEVENT') { cur = { exdates: [] }; continue; }
    if (line === 'END:VEVENT') { if (cur) events.push(cur); cur = null; continue; }
    if (!cur) continue;
    const p = parseLine(line);
    if (!p) continue;
    switch (p.name) {
      case 'UID': cur.uid = p.value.trim(); break;
      case 'SUMMARY': cur.summary = unescapeText(p.value); break;
      case 'DESCRIPTION': cur.description = unescapeText(p.value); break;
      case 'STATUS': cur.status = p.value.trim().toLowerCase(); break;
      case 'TRANSP': cur.transparency = p.value.trim().toLowerCase() === 'transparent' ? 'transparent' : 'opaque'; break;
      case 'DTSTART': cur.dtstart = parseIcsDate(p.value, p.params); cur.tzid = p.params.TZID || TZ; break;
      case 'DTEND': cur.dtend = parseIcsDate(p.value, p.params); break;
      case 'DURATION': cur.duration = p.value.trim(); break;
      case 'RRULE': cur.rrule = p.value.trim(); break;
      case 'EXDATE':
        for (const v of p.value.split(',')) { const x = parseIcsDate(v, p.params); if (x) cur.exdates.push(x.utcMs); }
        break;
      case 'RECURRENCE-ID': cur.recurrenceId = parseIcsDate(p.value, p.params); break;
      case 'LAST-MODIFIED': cur.updated = p.value.trim(); break;
      default: break;
    }
  }
  return events.filter((e) => e.dtstart);
}

function durationMs(ev) {
  if (ev.dtend) return Math.max(0, ev.dtend.utcMs - ev.dtstart.utcMs);
  const m = String(ev.duration || '').match(/^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (m) return ((+m[1] || 0) * 7 * DAY_MS) + ((+m[2] || 0) * DAY_MS) + ((+m[3] || 0) * 3600_000) + ((+m[4] || 0) * 60_000) + ((+m[5] || 0) * 1000);
  return ev.dtstart.allDay ? DAY_MS : 0;
}

function toApiItem(ev, startMs, endMs, extra = {}) {
  const allDay = ev.dtstart.allDay;
  const fmtDate = (ms) => new Date(ms).toISOString().slice(0, 10);
  return {
    id: extra.id || ev.uid || null,
    recurringEventId: extra.recurringEventId || null,
    originalStartTime: extra.originalStart ? (allDay ? { date: fmtDate(extra.originalStart) } : { dateTime: toWarsawIso(extra.originalStart) }) : undefined,
    summary: ev.summary || 'Zajęty termin',
    description: ev.description || null,
    status: ev.status === 'cancelled' ? 'cancelled' : (ev.status === 'tentative' ? 'tentative' : 'confirmed'),
    transparency: ev.transparency || 'opaque',
    updated: ev.updated || null,
    start: allDay ? { date: fmtDate(startMs) } : { dateTime: toWarsawIso(startMs) },
    end: allDay ? { date: fmtDate(endMs) } : { dateTime: toWarsawIso(endMs) },
  };
}

// Rozwinięcie zdarzeń (w tym cyklicznych) w oknie [fromMs, toMs]
export function expandIcsEvents(icsText, fromMs, toMs) {
  const all = parseIcsEvents(icsText);
  const overrides = new Map(); // uid|originalStartMs → zdarzenie zmienione
  for (const ev of all) if (ev.recurrenceId) overrides.set(`${ev.uid}|${ev.recurrenceId.utcMs}`, ev);

  const items = [];
  for (const ev of all) {
    if (ev.recurrenceId) continue; // obsłużone przy serii
    const dur = durationMs(ev);
    if (!ev.rrule) {
      const s = ev.dtstart.utcMs;
      const e = s + dur;
      if (e >= fromMs && s <= toMs && ev.status !== 'cancelled') items.push(toApiItem(ev, s, e));
      continue;
    }
    const rule = parseRRuleString(ev.rrule);
    if (!rule.freq) continue;
    const start = ev.dtstart.local;
    const exdates = new Set(ev.exdates);
    const untilMs = rule.until ? rule.until.utcMs + (rule.until.allDay ? DAY_MS - 1 : 0) : Infinity;
    const lastDay = Math.floor((toMs + DAY_MS) / DAY_MS);
    // Z COUNT liczymy od początku serii; bez COUNT wystarczy zacząć tuż przed oknem
    let dayCursor = rule.count ? dayIndex(start.y, start.mo, start.d) : Math.max(dayIndex(start.y, start.mo, start.d), Math.floor(fromMs / DAY_MS) - 2);
    let produced = 0;
    for (let guard = 0; dayCursor <= lastDay && guard < 20000; dayCursor++, guard++) {
      const dt = new Date(dayCursor * DAY_MS);
      const y = dt.getUTCFullYear(), mo = dt.getUTCMonth() + 1, d = dt.getUTCDate();
      if (!matchesRule(rule, start, y, mo, d)) continue;
      const occStart = ev.dtstart.allDay ? Date.UTC(y, mo - 1, d) : localToUtcMs(y, mo, d, start.h, start.mi, start.s, ev.tzid);
      if (occStart > untilMs) break;
      produced++;
      if (rule.count && produced > rule.count) break;
      if (exdates.has(occStart)) continue;
      const ov = overrides.get(`${ev.uid}|${occStart}`);
      const src = ov || ev;
      const s = ov ? ov.dtstart.utcMs : occStart;
      const e = s + (ov ? durationMs(ov) : dur);
      if (e < fromMs || s > toMs || src.status === 'cancelled') continue;
      items.push(toApiItem(src, s, e, { id: `${ev.uid}_${occStart}`, recurringEventId: ev.uid, originalStart: occStart }));
    }
  }
  items.sort((a, b) => Date.parse(a.start.dateTime || a.start.date) - Date.parse(b.start.dateTime || b.start.date));
  return items;
}

export async function fetchIcs(url, timeoutMs = 15000) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { Accept: 'text/calendar' } });
  if (!res.ok) throw new Error(`iCal HTTP ${res.status}`);
  const text = await res.text();
  if (!text.includes('BEGIN:VCALENDAR')) throw new Error('Odpowiedź nie jest kalendarzem iCal');
  return text;
}

export const POLISH_HOLIDAYS_ICS_URL =
  'https://calendar.google.com/calendar/ical/pl.polish%23holiday%40group.v.calendar.google.com/public/basic.ics';

export const CANONICAL_OPENBOT_ROUTINES = [
  {
    uid: 'openbot-cc5-morning-publisher@polskieradio.cc',
    startHm: '060000',
    endHm: '063000',
    summary: 'OpenBot CC 5: Publikator Poranny — DZJ, Kurs Codzienny Akademia & SMS',
    description: '[OPENBOT ROUTINE CC 5] Publikacja o 06:00 rozważania Dobrze, że jesteś (Firestore cuda-398c0), lekcji Kursu Codziennego (Akademia WWW Clean URLs + przyciski Hero), wysyłka 3 wersji na Grupę Nazira oraz SMS dla Bartka. Pula dostępnych tokenów.',
  },
  {
    uid: 'openbot-cc4-auto-runner@polskieradio.cc',
    startHm: '070000',
    endHm: '072000',
    summary: 'OpenBot CC 4: Wykonawca Automatyzacji (Claude / Codex / Antigravity • Co 1h)',
    description: '[OPENBOT ROUTINE CC 4] Cykliczny wykonawca zadań ze Skrzynki Misji i kolejki Shared/Automations (co 1 godzinę). Zadanie realizuje model z dostępnymi tokenami.',
  },
  {
    uid: 'openbot-cc2-kc-dzj-guardian@polskieradio.cc',
    startHm: '071000',
    endHm: '073000',
    summary: 'OpenBot CC 2: Strażnik Kursu Codziennego i DZJ (Weryfikacja 07:10)',
    description: '[OPENBOT ROUTINE CC 2] Codzienna weryfikacja porannej publikacji Kursu Codziennego Z Biblią za Pan Brat oraz Dobrze, że jesteś (sprawdzenie przycisków Hero i braku alarmów).',
  },
  {
    uid: 'openbot-cc1-skrzynka-l0@polskieradio.cc',
    startHm: '080000',
    endHm: '083000',
    summary: 'OpenBot CC 1: Skrzynka Misji i Kolejka Dowódcy L0',
    description: '[OPENBOT ROUTINE CC 1] Przegląd Skrzynki Misji CC (TABLICA.md), weryfikacja spraw wymagających decyzji L0 oraz aktualizacja RAPORT-KOLEJKA-DOWODCY.md.',
  },
  {
    uid: 'openbot-cc7-audio-production@polskieradio.cc',
    startHm: '080000',
    endHm: '090000',
    summary: 'OpenBot CC 7: Produkcja i Publikacja Audio — Biblia Audio DAW (-16 LUFS) & YouTube',
    description: '[OPENBOT ROUTINE CC 7] Produkcja słuchowisk Biblia Audio CC (@CCS / DAW -16 LUFS), automatyczna publikacja MP3 320 kbps na polskieradio.cc/biblia-audio (JOMA-D055) oraz premiery YouTube o 08:00.',
  },
  {
    uid: 'openbot-cc10-facebook-feed@polskieradio.cc',
    startHm: '090000',
    endHm: '093000',
    summary: 'OpenBot CC 10: Publikacje Facebook Feed (Cykl co 3h • Grafika @A520)',
    description: '[OPENBOT ROUTINE CC 10] Cykliczna publikacja postów społecznościowych na Facebooku (co 3 godziny: 09:00, 12:00, 15:00, 18:00, 21:00) z podwójną bramką graficzną @A520 (IMAGE_CONTENT_MATCH & PUBLISHER_VISUAL_APPROVAL = PASS) i zasadą puli dostępnych tokenów.',
  },
  {
    uid: 'openbot-cc9-x-broadcaster@polskieradio.cc',
    startHm: '093000',
    endHm: '100000',
    summary: 'OpenBot CC 9: Emisje Platforma X (CCN Broadcaster • Cykl co 30 min • UBG)',
    description: '[OPENBOT ROUTINE CC 9] Cykliczna emisja na Platformie X co 30 minut: wersety biblijne UBG, myśli dnia, artykuły CCN News i wizytówki LUMINA z kontrolą anty-spam i pulą dostępnych tokenów.',
  },
  {
    uid: 'openbot-cc8-video-production@polskieradio.cc',
    startHm: '100000',
    endHm: '110000',
    summary: 'OpenBot CC 8: Produkcja i Publikacja Wideo — Apokalipsa 4K, Premiery YT 20:00 & Shorts 9:16',
    description: '[OPENBOT ROUTINE CC 8] Montaż i skalowanie 4K UHD serii Apokalipsa (planowanie premier na 20:00 na 3 kanałach YT), produkcja Wektor1 Shorts 9:16 z napisami karaoke oraz aktualizacja VOD. Pula dostępnych tokenów.',
  },
  {
    uid: 'openbot-cc6-whatsapp-fifo@polskieradio.cc',
    startHm: '100000',
    endHm: '180000',
    summary: 'OpenBot CC 6: Dystrybucja WhatsApp FIFO (Co godzinę 10:00–18:00 • 2 grupy • Wersja WWW)',
    description: '[OPENBOT ROUTINE CC 6] Cogodzinna rotacja WhatsApp w oknie 10:00–18:00 po 2 grupy FIFO z kolekcji WhatsAppGroups (wyłącznie wersja WWW contentWeb z linkami, reguła Anti-Backlog, pula dostępnych tokenów).',
  },
  {
    uid: 'openbot-cc3-ecosystem-auditor@polskieradio.cc',
    startHm: '120000',
    endHm: '123000',
    summary: 'OpenBot CC 3: Audytor Zdrowia Ekosystemu 24/7 (Cykl co 6h • Strażnik Zero-QA)',
    description: '[OPENBOT ROUTINE CC 3] Automatyczny audyt dostępności HTTP 200 kluczowych podstron polskieradio.cc oraz kontrola Strażnika Kodu (straznik-kodu-check.js) co 6 godzin.',
  },
  {
    uid: 'openbot-cc12-biblia-spiewana-lumina@polskieradio.cc',
    startHm: '070000',
    endHm: '073000',
    summary: 'OpenBot CC 12: Biblia Śpiewana, LUMINA & Pasmo Szabatowe (07:00)',
    description: '[OPENBOT ROUTINE CC 12] Codzienna weryfikacja ciągłości strumieni Biblii Śpiewanej, aktywności portalu LUMINA (standard 1 renderera lumina-profile.html?u=<slug>) oraz w piątki przygotowanie pasma szabatowego.',
  },
  {
    uid: 'openbot-cc13-ccn-news-search-index@polskieradio.cc',
    startHm: '113000',
    endHm: '120000',
    summary: 'OpenBot CC 13: Redakcja CCN News & Auto-Indeksowanie Wyszukiwarki @w (11:30)',
    description: '[OPENBOT ROUTINE CC 13] Publikacja artykułów na portalach tematycznych (/news, /nauka, /historia, /biologia, /prawo, /seks) wyłącznie pod nazwiskami Cezarego i Wioletty Rogowskich, z bramką @A520 i automatyczną aktualizacją indeksu @w.',
  },
  {
    uid: 'openbot-cc17-youtube-community-posts@polskieradio.cc',
    startHm: '123000',
    endHm: '130000',
    summary: 'OpenBot CC 17: Posty Społeczności YouTube (7 Kanałów YT • Ankietowe & Graficzne • 12:30)',
    description: '[OPENBOT ROUTINE CC 17] Codzienne posty na karcie Społeczność na 7 kanałach YouTube (ankiety biblijne, grafiki 1:1 @A520 z wersetem UBG i zapowiedzi premier o 08:00/20:00). Pula dostępnych tokenów.',
  },
  {
    uid: 'openbot-cc16-instagram-reels-tiktok@polskieradio.cc',
    startHm: '130000',
    endHm: '134500',
    summary: 'OpenBot CC 16: Instagram Reels, Karuzele 1:1 & TikTok Global (Pionowe 9:16 • 13:00)',
    description: '[OPENBOT ROUTINE CC 16] Dystrybucja pionowych rolek 9:16 (z napisami karaoke z Wektor1) oraz karuzel edukacyjnych 1:1 (5 slajdów z Kursu Codziennego) na Instagram i TikTok. Bramka @A520 i pula dostępnych tokenów.',
  },
  {
    uid: 'openbot-cc18-global-podcasts-i18n@polskieradio.cc',
    startHm: '150000',
    endHm: '154500',
    summary: 'OpenBot CC 18: Globalna Ekspansja — Spotify, Apple Podcasts, Telegram, Threads & 8 Języków (15:00)',
    description: '[OPENBOT ROUTINE CC 18] Automatyczna dystrybucja RSS na Spotify/Apple Podcasts, publikacja na Kanale Telegram, Threads, Pinterest i LinkedIn oraz lokalizacja 8-języczna (PL, EN, ES, DE, FR, PT, UK, HE). Pula dostępnych tokenów.',
  },
  {
    uid: 'openbot-cc11-prebuffer-72h-guardian@polskieradio.cc',
    startHm: '160000',
    endHm: '163000',
    summary: 'OpenBot CC 11: Strażnik Bufora Wyprzedzającego 72h (DZJ & Kurs Codzienny • 16:00)',
    description: '[OPENBOT ROUTINE CC 11] Codzienna kontrola o 16:00, czy rozważania DZJ, lekcje Kursu Codziennego i odcinki Biblii Audio są gotowe na minimum 3 dni naprzód (D+1, D+2, D+3) wraz z weryfikacją K1–K12 i grafiką @A520.',
  },
  {
    uid: 'openbot-cc14-rut-evening-briefing@polskieradio.cc',
    startHm: '203000',
    endHm: '210000',
    summary: 'OpenBot CC 14: Asystentka Rut & Wieczorny Bilans Dnia L0 (@ccMC • 20:30)',
    description: '[OPENBOT ROUTINE CC 14] Wieczorny bilans dnia (zrealizowane rutyny CC 1–CC 18, postęp celów i plan na jutro) dla Asystentki Rut (WhatsApp CC LIFE) oraz prezenterki Aoede TTS w Kalendarzu Misji @ccMC.',
  },
  {
    uid: 'openbot-cc15-night-memory-storage@polskieradio.cc',
    startHm: '231500',
    endHm: '234500',
    summary: 'OpenBot CC 15: Nocna Higiena Pamięci, Backup i Strażnik Dysku C: (23:15)',
    description: '[OPENBOT ROUTINE CC 15] Nocne czyszczenie sesji tymczasowych OpenBot (clean-memory), kontrola wolnego miejsca na dysku C: (audit-storage), weryfikacja pętli LIVE_VERIFIED oraz backup pamięci JOMA.',
  },
];

export function buildOpenBotRoutinesIcs(anchorDateCompact = '20261101') {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Christian Culture//OpenBot Routines EKOCC 777//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:OpenBot — Rutyny Automatyzacji Christian Culture @777',
    'X-WR-TIMEZONE:Europe/Warsaw',
  ];
  for (const r of CANONICAL_OPENBOT_ROUTINES) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${r.uid}`,
      'DTSTAMP:20261113T100000Z',
      `DTSTART;TZID=Europe/Warsaw:${anchorDateCompact}T${r.startHm}`,
      `DTEND;TZID=Europe/Warsaw:${anchorDateCompact}T${r.endHm}`,
      'RRULE:FREQ=DAILY',
      `SUMMARY:${r.summary.replace(/,/g, '\\,')}`,
      `DESCRIPTION:${r.description.replace(/,/g, '\\,')}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

export async function fetchOrBuildOpenBotRoutinesIcs({ icalUrl = '' } = {}) {
  const canonicalIcs = buildOpenBotRoutinesIcs();
  const trimmedUrl = String(icalUrl || '').trim();
  if (!trimmedUrl || !/^https?:\/\//i.test(trimmedUrl)) {
    return { icsText: canonicalIcs, source: 'openbot-canonical' };
  }
  try {
    const remoteIcs = await fetchIcs(trimmedUrl, 2000);
    if (remoteIcs && remoteIcs.includes('BEGIN:VEVENT')) {
      const extraBlocks = remoteIcs.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];
      const merged = canonicalIcs.replace(
        /END:VCALENDAR\s*$/,
        `${extraBlocks.join('\r\n')}\r\nEND:VCALENDAR\r\n`
      );
      return { icsText: merged, source: 'openbot-live+canonical' };
    }
  } catch {
    // Gdy lokalny port OpenBot jest wyłączony lub zmieniony, używamy kanonicznego zestawu 10 rutyn CC 1–CC 10
  }
  return { icsText: canonicalIcs, source: 'openbot-canonical' };
}
