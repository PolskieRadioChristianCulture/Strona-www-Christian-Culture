// ============================================================================
// CHRISTIAN CULTURE MISSION CALENDAR v1.1 — Serwis BFF, RRULE, RBAC, @OA & D1
// Adres UI: https://polskieradio.cc/ccMC
// Endpointy: /api/mission-calendar/* (oraz alias /api/calendar/*)
// Standard: ZERO COST, WCAG 2.2 AA, Privacy-by-Design (CC LIFE / CC Guardian)
// ============================================================================

export const MISSION_STATUSES = {
  todo: { code: 'todo', color: '#2563EB', icon: '○', label: 'Do wykonania' },
  in_progress: { code: 'in_progress', color: '#D97706', icon: '◐', label: 'W trakcie' },
  done: { code: 'done', color: '#15803D', icon: '✓', label: 'Zrealizowane' },
  not_done: { code: 'not_done', color: '#B91C1C', icon: '!', label: 'Niezrealizowane' },
};

export const MISSION_AREAS = [
  'mission', 'radio', 'media', 'social', 'agents', 'oa', 'automation', 'tech', 'people', 'guardian',
];

export const PILOT_PROJECTS = [
  { id: 'biblia-audio', name: 'Produkcja Biblia Audio', area: 'radio', color: '#38bdf8' },
  { id: 'shorts-factory', name: 'Automatyzacja Shorts', area: 'media', color: '#f59e0b' },
  { id: 'obs-live', name: 'Emisja OBS Live', area: 'tech', color: '#10b981' },
  { id: 'general', name: 'Misja Ogólna CC', area: 'mission', color: '#a78bfa' },
];

export const DEFAULT_OWNER_EMAIL = 'nazirczarkes@gmail.com';
export const ALLOWED_ADMIN_EMAILS = [
  'nazirczarkes@gmail.com',
  'studiodees7@gmail.com',
  'czarekrogowski3@gmail.com',
  'osobowoscplus@gmail.com',
  'yourimaginationstudio@gmail.com',
  'polskiercctv@gmail.com',
  'radiochristianculture@gmail.com',
  'polskieradiocc@gmail.com',
];
export const DEFAULT_TIMEZONE = 'Europe/Warsaw';

export const GCAL_DEDICATED_CALENDAR_NAME = 'Christian Culture — Misja';
export const GCAL_SYNC_MODES = ['bidirectional', 'export_only', 'import_only'];
export const GCAL_MINIMAL_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
];

export async function encryptServerTokens(secret, tokenObj) {
  const enc = new TextEncoder();
  const keyDigest = await crypto.subtle.digest('SHA-256', enc.encode(String(secret || 'cc-mc-gcal-server-secret-2026')));
  const cryptoKey = await crypto.subtle.importKey('raw', keyDigest, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const plaintext = enc.encode(JSON.stringify(tokenObj || {}));
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, plaintext);
  const ivHex = [...iv].map((b) => b.toString(16).padStart(2, '0')).join('');
  const cipherHex = [...new Uint8Array(cipherBuf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `v1:${ivHex}:${cipherHex}`;
}

export async function decryptServerTokens(secret, encryptedStr) {
  if (!encryptedStr || typeof encryptedStr !== 'string' || !encryptedStr.startsWith('v1:')) return null;
  const parts = encryptedStr.split(':');
  if (parts.length !== 3) return null;
  const [, ivHex, cipherHex] = parts;
  const hexToBytes = (h) => new Uint8Array((h.match(/.{1,2}/g) || []).map((b) => parseInt(b, 16)));
  const enc = new TextEncoder();
  const keyDigest = await crypto.subtle.digest('SHA-256', enc.encode(String(secret || 'cc-mc-gcal-server-secret-2026')));
  const cryptoKey = await crypto.subtle.importKey('raw', keyDigest, { name: 'AES-GCM' }, false, ['decrypt']);
  try {
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: hexToBytes(ivHex) }, cryptoKey, hexToBytes(cipherHex));
    return JSON.parse(new TextDecoder().decode(plainBuf));
  } catch {
    return null;
  }
}

export async function sha256Hex(input) {
  const bytes = new TextEncoder().encode(String(input ?? ''));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hmacSha256Hex(secret, payload) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(String(secret || 'cc-mission-calendar-default-secret-2026-key')),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(String(payload ?? '')));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateId(prefix = 'mc') {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${Date.now().toString(36)}_${hex}`;
}

// ============================================================================
// Strefa czasowa Europe/Warsaw i konwersja odporna na zmianę czasu (DST)
// ============================================================================
const warsawFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

export function getLocalParts(utcDateOrIso, timeZone = DEFAULT_TIMEZONE) {
  const d = utcDateOrIso instanceof Date ? utcDateOrIso : new Date(utcDateOrIso);
  if (Number.isNaN(d.getTime())) throw new Error('Nieprawidłowa data');
  const fmt = timeZone === DEFAULT_TIMEZONE
    ? warsawFormatter
    : new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
      });
  const parts = {};
  for (const p of fmt.formatToParts(d)) {
    if (p.type !== 'literal') parts[p.type] = Number(p.value);
  }
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour === 24 ? 0 : parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

export function localPartsToUtcIso({ year, month, day, hour = 0, minute = 0, second = 0 }, timeZone = DEFAULT_TIMEZONE) {
  const guessUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);
  for (let pass = 0; pass < 3; pass++) {
    const offsetGuess = pass === 0 ? guessUtcMs : pass === 1 ? guessUtcMs - 3600_000 : guessUtcMs - 7200_000;
    const p = getLocalParts(new Date(offsetGuess), timeZone);
    const diffMinutes =
      (Date.UTC(year, month - 1, day, hour, minute, second) -
        Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)) /
      60000;
    const adjusted = new Date(offsetGuess + diffMinutes * 60000);
    const check = getLocalParts(adjusted, timeZone);
    if (
      check.year === year &&
      check.month === month &&
      check.day === day &&
      check.hour === hour &&
      check.minute === minute
    ) {
      return adjusted.toISOString();
    }
  }
  // Fallback dla skoku 02:00 -> 03:00 w marcu
  const fallback = new Date(guessUtcMs - 3600_000);
  return fallback.toISOString();
}

export function isWithinQuietHours(utcDateOrIso, quietStart = '22:00', quietEnd = '06:00', timeZone = DEFAULT_TIMEZONE) {
  const parts = getLocalParts(utcDateOrIso, timeZone);
  const currentMins = parts.hour * 60 + parts.minute;
  const [sh, sm] = String(quietStart || '22:00').split(':').map(Number);
  const [eh, em] = String(quietEnd || '06:00').split(':').map(Number);
  const startMins = (sh || 0) * 60 + (sm || 0);
  const endMins = (eh || 0) * 60 + (em || 0);
  if (startMins === endMins) return false;
  if (startMins < endMins) {
    return currentMins >= startMins && currentMins < endMins;
  }
  return currentMins >= startMins || currentMins < endMins;
}

// ============================================================================
// Silnik cykliczności RRULE (RFC 5545 podzbiór + wyjątki EXDATE i nadpisania)
// ============================================================================
const WEEKDAY_MAP = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

export function parseRRule(rruleStr) {
  if (!rruleStr || typeof rruleStr !== 'string') return null;
  const cleaned = rruleStr.trim().replace(/^RRULE:/i, '');
  if (!/^FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)(;[A-Z]+=[A-Z0-9,+-]+)*$/.test(cleaned) || cleaned.length > 300) {
    throw new Error('Nieprawidłowa reguła RRULE');
  }
  const map = {};
  for (const part of cleaned.split(';')) {
    const [k, v] = part.split('=');
    map[k] = v;
  }
  const freq = map.FREQ;
  const interval = map.INTERVAL ? Math.max(1, Number(map.INTERVAL)) : 1;
  const count = map.COUNT ? Math.max(1, Math.min(500, Number(map.COUNT))) : null;
  let untilMs = null;
  if (map.UNTIL) {
    const u = map.UNTIL;
    if (/^\d{8}T\d{6}Z$/.test(u)) {
      untilMs = Date.parse(`${u.slice(0, 4)}-${u.slice(4, 6)}-${u.slice(6, 8)}T${u.slice(9, 11)}:${u.slice(11, 13)}:${u.slice(13, 15)}Z`);
    } else {
      untilMs = Date.parse(u);
    }
  }
  const byday = map.BYDAY ? map.BYDAY.split(',').filter(Boolean) : null;
  const bymonthday = map.BYMONTHDAY ? map.BYMONTHDAY.split(',').map(Number).filter((n) => !Number.isNaN(n) && n !== 0 && n >= -31 && n <= 31) : null;
  const bysetpos = map.BYSETPOS ? map.BYSETPOS.split(',').map(Number).filter((n) => !Number.isNaN(n)) : null;
  return { freq, interval, count, untilMs, byday, bymonthday, bysetpos, raw: cleaned };
}

function daysInMonth(year, month1to12) {
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

export function materializeOccurrences(event, rangeFromIso, rangeToIso, overrides = [], nowDate = null) {
  const timeZone = event.timezone || DEFAULT_TIMEZONE;
  const startUtc = new Date(event.starts_at);
  const endUtc = event.ends_at ? new Date(event.ends_at) : null;
  const durationMs = endUtc ? Math.max(0, endUtc.getTime() - startUtc.getTime()) : 1800_000;
  const fromMs = rangeFromIso ? Date.parse(rangeFromIso) : startUtc.getTime() - 86400_000;
  const toMs = rangeToIso ? Date.parse(rangeToIso) : startUtc.getTime() + 90 * 86400_000;

  if (!event.rrule) {
    const stMs = startUtc.getTime();
    if (stMs > toMs || (stMs + durationMs) < fromMs) return [];
    return [decorateEventComputed(event)];
  }

  const rule = parseRRule(event.rrule);
  const dtstartLocal = getLocalParts(startUtc, timeZone);
  const exdatesSet = new Set(Array.isArray(event.exdates) ? event.exdates : JSON.parse(event.exdates || '[]'));
  const overrideByOccId = new Map();
  for (const ov of overrides) {
    overrideByOccId.set(ov.occurrence_id, ov);
  }

  const candidateDates = [];
  const startDayUtc = Date.UTC(dtstartLocal.year, dtstartLocal.month - 1, dtstartLocal.day);

  if (rule.freq === 'DAILY') {
    for (let step = 0; step < 400; step++) {
      const d = new Date(startDayUtc + step * rule.interval * 86400_000);
      candidateDates.push({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() });
    }
  } else if (rule.freq === 'WEEKLY') {
    const startDow = new Date(startDayUtc).getUTCDay();
    const targetDows = rule.byday
      ? rule.byday.map((code) => WEEKDAY_MAP[code.replace(/^[+-]?\d+/, '')]).filter((n) => n !== undefined)
      : [startDow];
    const mondayOffset = (startDow + 6) % 7;
    const weekZeroMonday = startDayUtc - mondayOffset * 86400_000;
    for (let w = 0; w < 120; w++) {
      const weekStart = weekZeroMonday + w * rule.interval * 7 * 86400_000;
      for (let dOffset = 0; dOffset < 7; dOffset++) {
        const dayMs = weekStart + dOffset * 86400_000;
        if (dayMs < startDayUtc) continue;
        const d = new Date(dayMs);
        if (targetDows.includes(d.getUTCDay())) {
          candidateDates.push({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() });
        }
      }
    }
  } else if (rule.freq === 'MONTHLY') {
    for (let mStep = 0; mStep < 48; mStep++) {
      const totalMonths = (dtstartLocal.year * 12 + (dtstartLocal.month - 1)) + mStep * rule.interval;
      const y = Math.floor(totalMonths / 12);
      const m = (totalMonths % 12) + 1;
      const maxD = daysInMonth(y, m);

      if (rule.bymonthday && rule.bymonthday.length) {
        const days = [];
        for (const md of rule.bymonthday) {
          const actualDay = md < 0 ? maxD + 1 + md : md;
          // Zasada nieistniejącego 31. dnia miesiąca: pomijamy, chyba że podano ujemny indeks (-1 = ostatni dzień)
          if (actualDay >= 1 && actualDay <= maxD) days.push(actualDay);
        }
        days.sort((a, b) => a - b);
        for (const d of days) {
          if (Date.UTC(y, m - 1, d) >= startDayUtc) {
            candidateDates.push({ year: y, month: m, day: d });
          }
        }
      } else if (rule.byday && rule.byday.length) {
        const matchingDays = [];
        for (let d = 1; d <= maxD; d++) {
          const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
          for (const token of rule.byday) {
            const cleanCode = token.replace(/^[+-]?\d+/, '');
            if (WEEKDAY_MAP[cleanCode] === dow) matchingDays.push(d);
          }
        }
        const selected = rule.bysetpos && rule.bysetpos.length
          ? rule.bysetpos.map((pos) => (pos > 0 ? matchingDays[pos - 1] : matchingDays[matchingDays.length + pos])).filter(Boolean)
          : matchingDays;
        for (const d of selected) {
          if (Date.UTC(y, m - 1, d) >= startDayUtc) {
            candidateDates.push({ year: y, month: m, day: d });
          }
        }
      } else {
        if (dtstartLocal.day <= maxD) {
          candidateDates.push({ year: y, month: m, day: dtstartLocal.day });
        }
      }
    }
  } else if (rule.freq === 'YEARLY') {
    for (let yStep = 0; yStep < 10; yStep++) {
      const y = dtstartLocal.year + yStep * rule.interval;
      const maxD = daysInMonth(y, dtstartLocal.month);
      if (dtstartLocal.day <= maxD) {
        candidateDates.push({ year: y, month: dtstartLocal.month, day: dtstartLocal.day });
      }
    }
  }

  const results = [];
  let generatedCount = 0;

  for (const cd of candidateDates) {
    const occStartIso = localPartsToUtcIso(
      {
        year: cd.year,
        month: cd.month,
        day: cd.day,
        hour: dtstartLocal.hour,
        minute: dtstartLocal.minute,
        second: dtstartLocal.second,
      },
      timeZone
    );
    const occStartMs = Date.parse(occStartIso);
    if (rule.untilMs && occStartMs > rule.untilMs) break;
    generatedCount++;
    if (rule.count && generatedCount > rule.count) break;
    if (occStartMs > toMs) break;

    const occurrenceId = `${event.id}_${occStartIso.slice(0, 10)}`;
    if (exdatesSet.has(occStartIso.slice(0, 10)) || exdatesSet.has(occStartIso)) {
      continue;
    }

    const ov = overrideByOccId.get(occurrenceId);
    if (ov && ov.cancelled) continue;

    const finalStartIso = ov?.starts_at || occStartIso;
    const finalEndIso = ov?.ends_at || (event.ends_at ? new Date(Date.parse(finalStartIso) + durationMs).toISOString() : null);
    const finalStartMs = Date.parse(finalStartIso);
    const finalEndMs = finalEndIso ? Date.parse(finalEndIso) : finalStartMs + durationMs;

    let computedStatus = ov?.status ?? event.status;
    let isCurrentNow = false;
    let autoResolved = false;

    if (!ov?.status && nowDate) {
      const nowMs = (nowDate instanceof Date ? nowDate : new Date(nowDate)).getTime();
      if (finalStartMs <= nowMs && nowMs < finalEndMs) {
        computedStatus = 'in_progress';
        isCurrentNow = true;
        autoResolved = true;
      } else if (nowMs >= finalEndMs) {
        computedStatus = 'done';
        autoResolved = true;
      } else {
        computedStatus = 'todo';
      }
    }

    if (finalStartMs <= toMs && finalEndMs >= fromMs) {
      results.push(
        decorateEventComputed({
          ...event,
          series_id: event.id,
          occurrence_id: occurrenceId,
          original_start: occStartIso,
          title: ov?.title ?? event.title,
          description: ov?.description ?? event.description,
          starts_at: finalStartIso,
          ends_at: finalEndIso,
          status: computedStatus,
          not_done_reason: ov?.not_done_reason ?? event.not_done_reason,
          assigned_to: ov?.assigned_to ?? event.assigned_to,
          review_state: ov?.review_state ?? event.review_state,
          result_summary: ov?.result_summary ?? event.result_summary,
          is_override: Boolean(ov),
          is_current_now: isCurrentNow,
          auto_resolved: autoResolved,
        }, nowDate || new Date())
      );
    }
  }

  return results;
}

export function decorateEventComputed(ev, nowDate = new Date()) {
  const statusMeta = MISSION_STATUSES[ev.status] || MISSION_STATUSES.todo;
  const dueIso = ev.ends_at || ev.starts_at;
  const nowMs = (nowDate instanceof Date ? nowDate : new Date(nowDate)).getTime();
  const startMs = ev.starts_at ? Date.parse(ev.starts_at) : 0;
  const endMs = ev.ends_at ? Date.parse(ev.ends_at) : (startMs + 1800_000);
  const durationMinutes = startMs > 0 ? Math.max(1, Math.round((endMs - startMs) / 60_000)) : 30;
  const isCurrentNow = Boolean(startMs <= nowMs && nowMs < endMs);
  const isOverdue = Boolean(dueIso && Date.parse(dueIso) < nowMs && ev.status !== 'done' && ev.status !== 'not_done');
  return {
    ...ev,
    all_day: Boolean(ev.all_day),
    requires_approval: ev.requires_approval !== undefined ? Boolean(ev.requires_approval) : true,
    is_private: Boolean(ev.is_private),
    allow_overlap: ev.allow_overlap !== undefined ? Boolean(ev.allow_overlap) : true,
    duration_minutes: durationMinutes,
    vikunja_task_id: ev.vikunja_task_id || `vk_${ev.id}`,
    gcal_event_id: ev.gcal_event_id || (ev.source === 'gcal' ? ev.external_id : null),
    gcal_calendar_id: ev.gcal_calendar_id || null,
    gcal_synced: Boolean(ev.gcal_synced || ev.gcal_event_id || ev.source === 'gcal'),
    overdue: isOverdue,
    is_current_now: ev.is_current_now ?? isCurrentNow,
    status_meta: statusMeta,
    exdates: Array.isArray(ev.exdates) ? ev.exdates : safeJsonParse(ev.exdates, []),
    result_links: Array.isArray(ev.result_links) ? ev.result_links : safeJsonParse(ev.result_links, []),
  };
}

function safeJsonParse(val, fallback) {
  if (val === null || val === undefined) return fallback;
  if (typeof val !== 'string') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// ============================================================================
// Parser poleceń w języku naturalnym (Most dla Noemi @077 -> @OA)
// ============================================================================
export function parseNaturalLanguageCommand(text, nowDate = new Date()) {
  const raw = String(text || '').trim();
  if (!raw || raw.length < 4) {
    throw new Error('Polecenie jest zbyt krótkie');
  }

  const lower = raw.toLowerCase();
  const nowParts = getLocalParts(nowDate, DEFAULT_TIMEZONE);
  const currentUtcMid = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day);
  const currentDow = new Date(currentUtcMid).getUTCDay();

  const weekdayNames = [
    { re: /\b(niedziel[aęi]|nd)\b/i, dow: 0, code: 'SU' },
    { re: /\b(poniedzia[łl]ek|pn)\b/i, dow: 1, code: 'MO' },
    { re: /\b(wtorek|wt)\b/i, dow: 2, code: 'TU' },
    { re: /\b([śs]rod[aę]|sr)\b/i, dow: 3, code: 'WE' },
    { re: /\b(czwartek|czw)\b/i, dow: 4, code: 'TH' },
    { re: /\b(pi[ąa]tek|pt)\b/i, dow: 5, code: 'FR' },
    { re: /\b(sobot[aę]|sob)\b/i, dow: 6, code: 'SA' },
  ];

  let targetDayUtc = currentUtcMid;
  let matchedByDayCode = null;
  let dateExplicit = false;

  if (/\bpojutrze\b/i.test(lower)) {
    targetDayUtc += 2 * 86400_000;
    dateExplicit = true;
  } else if (/\bjutro\b/i.test(lower)) {
    targetDayUtc += 86400_000;
    dateExplicit = true;
  } else if (/\bdzi[śs](iaj)?\b/i.test(lower)) {
    dateExplicit = true;
  } else {
    for (const wd of weekdayNames) {
      if (wd.re.test(lower)) {
        let diff = (wd.dow - currentDow + 7) % 7;
        if (diff === 0) diff = 7;
        targetDayUtc += diff * 86400_000;
        matchedByDayCode = wd.code;
        dateExplicit = true;
        break;
      }
    }
  }

  const timeMatch = raw.match(/\b(?:o\s+|godz\.?\s*)?(\d{1,2}):(\d{2})\b/i);
  const hour = timeMatch ? Math.min(23, Math.max(0, Number(timeMatch[1]))) : 9;
  const minute = timeMatch ? Math.min(59, Math.max(0, Number(timeMatch[2]))) : 0;

  let rrule = null;
  if (/dwa\s+razy\s+w\s+miesi[ąa]cu|1\s+i\s+15/i.test(lower)) {
    rrule = 'FREQ=MONTHLY;BYMONTHDAY=1,15';
  } else if (/co\s+dwa\s+tygodnie/i.test(lower)) {
    rrule = 'FREQ=WEEKLY;INTERVAL=2';
  } else if (/w\s+ka[żz]d[ey]|co\s+tydzie[ńn]|tygodniowo/i.test(lower)) {
    rrule = matchedByDayCode ? `FREQ=WEEKLY;BYDAY=${matchedByDayCode}` : 'FREQ=WEEKLY';
  } else if (/codziennie|ka[żz]dego\s+dnia/i.test(lower)) {
    rrule = 'FREQ=DAILY';
  } else if (/co\s+miesi[ąa]c|raz\s+w\s+miesi[ąa]cu/i.test(lower)) {
    rrule = 'FREQ=MONTHLY';
  }

  let assigned_to = null;
  let category = 'mission';
  let project_id = 'general';
  if (/visual\s*director|miniatu|grafi|@077-vd|@a520/i.test(lower)) {
    assigned_to = '@VisualDirector';
    category = 'media';
    project_id = 'shorts-factory';
  } else if (/noemi|@077/i.test(lower)) {
    assigned_to = '@077';
    category = 'oa';
  } else if (/antigravity|@a001/i.test(lower)) {
    assigned_to = '@A001';
    category = 'tech';
  } else if (/codex/i.test(lower)) {
    assigned_to = '@Codex';
    category = 'tech';
  } else if (/claude/i.test(lower)) {
    assigned_to = '@Claude';
    category = 'tech';
  } else if (/sara|gemini/i.test(lower)) {
    assigned_to = '@Gemini';
    category = 'media';
  } else if (/biblia\s+audio/i.test(lower)) {
    assigned_to = '@A001';
    category = 'radio';
    project_id = 'biblia-audio';
  } else if (/obs|live|transmisj/i.test(lower)) {
    assigned_to = '@A001';
    category = 'radio';
    project_id = 'obs-live';
  }

  let priority = 2;
  if (/\b(p0|pilne|natychmiast|krytyczne)\b/i.test(lower)) priority = 1;
  else if (/\b(p1|wa[żz]ne)\b/i.test(lower)) priority = 2;
  else if (/\b(p3|niski)\b/i.test(lower)) priority = 4;

  // Wyodrębnienie czystego tytułu zadania
  let title = raw
    .replace(/^(dodaj|utwórz|zaplanuj|zapisz)\s+(zadanie\s+)?/i, '')
    .replace(/\bna\s+(dzi[śs](iaj)?|jutro|pojutrze|poniedzia[łl]ek|wtorek|[śs]rod[aę]|czwartek|pi[ąa]tek|sobot[aę]|niedziel[aę])\b/gi, '')
    .replace(/\b(o\s+|godz\.?\s*)?\d{1,2}:\d{2}\b/gi, '')
    .replace(/,?\s*(przydziel|przypisz|zle[ćc])\s+[^,]+/gi, '')
    .replace(/,?\s*powtarzaj\s+[^,.]+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[,\s-]+|[,\s-.]+$/g, '');

  if (!title) title = raw.slice(0, 120);
  title = title.charAt(0).toUpperCase() + title.slice(1);

  const dTarget = new Date(targetDayUtc);
  const starts_at = localPartsToUtcIso(
    {
      year: dTarget.getUTCFullYear(),
      month: dTarget.getUTCMonth() + 1,
      day: dTarget.getUTCDate(),
      hour,
      minute,
      second: 0,
    },
    DEFAULT_TIMEZONE
  );
  const ends_at = new Date(Date.parse(starts_at) + 30 * 60_000).toISOString();

  return {
    title,
    starts_at,
    ends_at,
    timezone: DEFAULT_TIMEZONE,
    category,
    project_id,
    priority,
    assigned_to,
    rrule,
    status: 'todo',
    requires_approval: true,
    ambiguous_date: !dateExplicit,
  };
}

// ============================================================================
// Repozytorium D1 + In-Memory (do testów jednostkowych/integracyjnych i pracy lokalnej)
// ============================================================================
export class MissionCalendarRepository {
  constructor(d1Database = null) {
    this.db = d1Database;
    this.initialized = false;
    this.mem = {
      users: new Map(),
      events: new Map(),
      overrides: new Map(),
      apiClients: new Map(),
      pushSubscriptions: new Map(),
      auditLog: [],
      outbox: [],
      gcalConnections: new Map(),
      gcalMappings: new Map(),
      gcalSyncLogs: [],
      gcalRemoteCalendars: new Map([
        ['primary', { id: 'primary', summary: 'Kalendarz główny Google', timeZone: DEFAULT_TIMEZONE, primary: true }],
      ]),
      gcalRemoteEvents: new Map(),
      gcalWatchChannels: new Map(),
      gcalSyncSeq: 1,
    };
  }

  async ensureInitialized() {
    if (this.initialized) return;
    if (this.db) {
      const statements = [
        `CREATE TABLE IF NOT EXISTS mc_users (id TEXT PRIMARY KEY, google_sub TEXT UNIQUE NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'owner', allowed_projects TEXT NOT NULL DEFAULT '["*"]', quiet_hours_start TEXT NOT NULL DEFAULT '22:00', quiet_hours_end TEXT NOT NULL DEFAULT '06:00', created_at TEXT NOT NULL)`,
        `CREATE TABLE IF NOT EXISTS mc_events (id TEXT PRIMARY KEY, source TEXT NOT NULL DEFAULT 'local', external_id TEXT, project_id TEXT NOT NULL DEFAULT 'general', title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', starts_at TEXT NOT NULL, ends_at TEXT, timezone TEXT NOT NULL DEFAULT 'Europe/Warsaw', all_day INTEGER NOT NULL DEFAULT 0, category TEXT NOT NULL DEFAULT 'mission', status TEXT NOT NULL DEFAULT 'todo', not_done_reason TEXT, blocked_reason TEXT, priority INTEGER NOT NULL DEFAULT 2, owner_type TEXT NOT NULL DEFAULT 'human', assigned_to TEXT, requires_approval INTEGER NOT NULL DEFAULT 1, review_state TEXT NOT NULL DEFAULT 'none', result_summary TEXT, result_links TEXT NOT NULL DEFAULT '[]', rrule TEXT, exdates TEXT NOT NULL DEFAULT '[]', series_id TEXT, occurrence_id TEXT, is_private INTEGER NOT NULL DEFAULT 0, allow_overlap INTEGER NOT NULL DEFAULT 1, lease_owner TEXT, lease_until TEXT, version INTEGER NOT NULL DEFAULT 1, created_by TEXT NOT NULL, updated_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT)`,
        `CREATE TABLE IF NOT EXISTS mc_occurrence_overrides (id TEXT PRIMARY KEY, series_id TEXT NOT NULL, occurrence_id TEXT NOT NULL UNIQUE, original_start TEXT NOT NULL, cancelled INTEGER NOT NULL DEFAULT 0, title TEXT, description TEXT, starts_at TEXT, ends_at TEXT, status TEXT, not_done_reason TEXT, assigned_to TEXT, review_state TEXT, result_summary TEXT, updated_by TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        `CREATE TABLE IF NOT EXISTS mc_api_clients (id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, token_hash TEXT UNIQUE NOT NULL, scopes TEXT NOT NULL DEFAULT '["events:read"]', capabilities TEXT NOT NULL DEFAULT '[]', allowed_projects TEXT NOT NULL DEFAULT '["*"]', max_parallel INTEGER NOT NULL DEFAULT 3, enabled INTEGER NOT NULL DEFAULT 1, last_seen TEXT, created_at TEXT NOT NULL)`,
        `CREATE TABLE IF NOT EXISTS mc_push_subscriptions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, endpoint_hash TEXT UNIQUE NOT NULL, endpoint TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL, device_name TEXT NOT NULL DEFAULT 'Browser', preferences TEXT NOT NULL DEFAULT '{}', quiet_hours_start TEXT NOT NULL DEFAULT '22:00', quiet_hours_end TEXT NOT NULL DEFAULT '06:00', created_at TEXT NOT NULL, last_success TEXT)`,
        `CREATE TABLE IF NOT EXISTS mc_audit_log (id TEXT PRIMARY KEY, actor_type TEXT NOT NULL, actor_id TEXT NOT NULL, action TEXT NOT NULL, entity TEXT NOT NULL, entity_id TEXT NOT NULL, before_hash TEXT, after_hash TEXT, details TEXT NOT NULL DEFAULT '{}', correlation_id TEXT NOT NULL, created_at TEXT NOT NULL)`,
        `CREATE TABLE IF NOT EXISTS mc_outbox (id TEXT PRIMARY KEY, event_type TEXT NOT NULL, entity_id TEXT NOT NULL, payload TEXT NOT NULL, idempotency_key TEXT UNIQUE NOT NULL, status TEXT NOT NULL DEFAULT 'pending', delivery_count INTEGER NOT NULL DEFAULT 0, next_attempt_at TEXT NOT NULL, last_error TEXT, correlation_id TEXT NOT NULL, created_at TEXT NOT NULL)`,
        `CREATE TABLE IF NOT EXISTS mc_gcal_connections (user_id TEXT PRIMARY KEY, email TEXT NOT NULL, encrypted_tokens TEXT NOT NULL, scopes TEXT NOT NULL DEFAULT '[]', calendar_id TEXT NOT NULL, calendar_name TEXT NOT NULL, sync_mode TEXT NOT NULL DEFAULT 'bidirectional', sync_token TEXT, watch_channel_id TEXT, watch_resource_id TEXT, watch_token_hash TEXT, watch_expiration TEXT, status TEXT NOT NULL DEFAULT 'connected', connected_at TEXT NOT NULL, last_synced_at TEXT)`,
        `CREATE TABLE IF NOT EXISTS mc_gcal_mappings (id TEXT PRIMARY KEY, event_id TEXT UNIQUE NOT NULL, vikunja_task_id TEXT NOT NULL, gcal_calendar_id TEXT NOT NULL, gcal_event_id TEXT NOT NULL, gcal_etag TEXT, gcal_ical_uid TEXT, last_synced_version INTEGER NOT NULL DEFAULT 1, sync_hash TEXT, updated_at TEXT NOT NULL)`,
        `CREATE TABLE IF NOT EXISTS mc_gcal_sync_logs (id TEXT PRIMARY KEY, direction TEXT NOT NULL, mode TEXT NOT NULL, action TEXT NOT NULL, event_id TEXT, gcal_event_id TEXT, status TEXT NOT NULL, details TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL)`,
      ];
      for (const sql of statements) {
        await this.db.prepare(sql).run();
      }
    }
    this.initialized = true;
  }

  async upsertUser({ google_sub, email, role = 'owner', allowed_projects = ['*'] }, nowIso) {
    await this.ensureInitialized();
    const id = `usr_${google_sub.slice(0, 24)}`;
    const record = {
      id,
      google_sub,
      email: email.toLowerCase(),
      role,
      allowed_projects: JSON.stringify(allowed_projects),
      quiet_hours_start: '22:00',
      quiet_hours_end: '06:00',
      created_at: nowIso,
    };
    if (this.db) {
      await this.db.prepare(`
        INSERT INTO mc_users (id, google_sub, email, role, allowed_projects, quiet_hours_start, quiet_hours_end, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(google_sub) DO UPDATE SET email = excluded.email, role = excluded.role
      `).bind(record.id, record.google_sub, record.email, record.role, record.allowed_projects, record.quiet_hours_start, record.quiet_hours_end, record.created_at).run();
      return await this.db.prepare('SELECT * FROM mc_users WHERE google_sub = ?').bind(google_sub).first();
    }
    const existing = [...this.mem.users.values()].find((u) => u.google_sub === google_sub);
    if (existing) {
      existing.email = record.email;
      return existing;
    }
    this.mem.users.set(id, record);
    return record;
  }

  async getUserBySub(google_sub) {
    await this.ensureInitialized();
    if (this.db) {
      return await this.db.prepare('SELECT * FROM mc_users WHERE google_sub = ?').bind(google_sub).first();
    }
    return [...this.mem.users.values()].find((u) => u.google_sub === google_sub) || null;
  }

  async registerAgentClient({ name, token_hash, scopes = ['events:read', 'events:claim', 'events:report'], capabilities = [], allowed_projects = ['*'], max_parallel = 3 }, nowIso) {
    await this.ensureInitialized();
    const id = `agt_${name.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const record = {
      id,
      name,
      token_hash,
      scopes: JSON.stringify(scopes),
      capabilities: JSON.stringify(capabilities),
      allowed_projects: JSON.stringify(allowed_projects),
      max_parallel,
      enabled: 1,
      last_seen: nowIso,
      created_at: nowIso,
    };
    if (this.db) {
      await this.db.prepare(`
        INSERT INTO mc_api_clients (id, name, token_hash, scopes, capabilities, allowed_projects, max_parallel, enabled, last_seen, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        ON CONFLICT(name) DO UPDATE SET token_hash = excluded.token_hash, scopes = excluded.scopes, capabilities = excluded.capabilities, allowed_projects = excluded.allowed_projects, max_parallel = excluded.max_parallel, enabled = 1
      `).bind(record.id, record.name, record.token_hash, record.scopes, record.capabilities, record.allowed_projects, record.max_parallel, record.last_seen, record.created_at).run();
      return record;
    }
    this.mem.apiClients.set(name, record);
    return record;
  }

  async getAgentByTokenHash(tokenHash) {
    await this.ensureInitialized();
    let row = null;
    if (this.db) {
      row = await this.db.prepare('SELECT * FROM mc_api_clients WHERE token_hash = ? AND enabled = 1').bind(tokenHash).first();
    } else {
      row = [...this.mem.apiClients.values()].find((c) => c.token_hash === tokenHash && c.enabled === 1) || null;
    }
    if (!row) return null;
    return {
      ...row,
      scopes: safeJsonParse(row.scopes, []),
      capabilities: safeJsonParse(row.capabilities, []),
      allowed_projects: safeJsonParse(row.allowed_projects, ['*']),
    };
  }

  async listAgents() {
    await this.ensureInitialized();
    let rows = [];
    if (this.db) {
      const res = await this.db.prepare('SELECT * FROM mc_api_clients WHERE enabled = 1').all();
      rows = res.results || [];
    } else {
      rows = [...this.mem.apiClients.values()].filter((c) => c.enabled === 1);
    }
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      scopes: safeJsonParse(r.scopes, []),
      capabilities: safeJsonParse(r.capabilities, []),
      allowed_projects: safeJsonParse(r.allowed_projects, ['*']),
      max_parallel: r.max_parallel,
      last_seen: r.last_seen,
    }));
  }

  async createEvent(ev) {
    await this.ensureInitialized();
    if (this.db) {
      await this.db.prepare(`
        INSERT INTO mc_events (
          id, source, external_id, project_id, title, description, starts_at, ends_at, timezone, all_day,
          category, status, not_done_reason, blocked_reason, priority, owner_type, assigned_to,
          requires_approval, review_state, result_summary, result_links, rrule, exdates,
          series_id, occurrence_id, is_private, allow_overlap, lease_owner, lease_until,
          version, created_by, updated_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        ev.id, ev.source, ev.external_id, ev.project_id, ev.title, ev.description, ev.starts_at, ev.ends_at, ev.timezone, ev.all_day ? 1 : 0,
        ev.category, ev.status, ev.not_done_reason, ev.blocked_reason, ev.priority, ev.owner_type, ev.assigned_to,
        ev.requires_approval ? 1 : 0, ev.review_state, ev.result_summary, JSON.stringify(ev.result_links || []), ev.rrule, JSON.stringify(ev.exdates || []),
        ev.series_id, ev.occurrence_id, ev.is_private ? 1 : 0, ev.allow_overlap ? 1 : 0, ev.lease_owner, ev.lease_until,
        ev.version, ev.created_by, ev.updated_by, ev.created_at, ev.updated_at
      ).run();
      return await this.getEventById(ev.id);
    }
    const copy = { ...ev, result_links: [...(ev.result_links || [])], exdates: [...(ev.exdates || [])] };
    this.mem.events.set(ev.id, copy);
    return copy;
  }

  async getEventById(id) {
    await this.ensureInitialized();
    let row = null;
    if (this.db) {
      row = await this.db.prepare('SELECT * FROM mc_events WHERE id = ? AND deleted_at IS NULL').bind(id).first();
    } else {
      const r = this.mem.events.get(id);
      if (r && !r.deleted_at) row = { ...r };
    }
    if (!row) return null;
    const mapping = await this.getGcalMappingByEventId(row.id);
    if (mapping) {
      row.gcal_event_id = mapping.gcal_event_id;
      row.gcal_calendar_id = mapping.gcal_calendar_id;
      row.vikunja_task_id = mapping.vikunja_task_id;
      row.gcal_synced = true;
    }
    return decorateEventComputed(row);
  }

  async listEvents() {
    await this.ensureInitialized();
    let rows = [];
    if (this.db) {
      const res = await this.db.prepare('SELECT * FROM mc_events WHERE deleted_at IS NULL ORDER BY starts_at ASC LIMIT 2000').all();
      rows = res.results || [];
    } else {
      rows = [...this.mem.events.values()]
        .filter((e) => !e.deleted_at)
        .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))
        .map((r) => ({ ...r }));
    }
    const mappings = await this.listGcalMappings();
    const mapByEventId = new Map(mappings.map((m) => [m.event_id, m]));
    return rows.map((r) => {
      const m = mapByEventId.get(r.id);
      if (m) {
        r.gcal_event_id = m.gcal_event_id;
        r.gcal_calendar_id = m.gcal_calendar_id;
        r.vikunja_task_id = m.vikunja_task_id;
        r.gcal_synced = true;
      }
      return decorateEventComputed(r);
    });
  }

  async updateEventOptimistic(id, expectedVersion, patch, nowIso) {
    await this.ensureInitialized();
    const current = await this.getEventById(id);
    if (!current) return { notFound: true };
    if (current.version !== expectedVersion) {
      return { conflict: true, serverEvent: current };
    }
    const next = {
      ...current,
      ...patch,
      version: current.version + 1,
      updated_at: nowIso,
    };
    if (this.db) {
      const res = await this.db.prepare(`
        UPDATE mc_events SET
          project_id = ?, title = ?, description = ?, starts_at = ?, ends_at = ?, timezone = ?, all_day = ?,
          category = ?, status = ?, not_done_reason = ?, blocked_reason = ?, priority = ?, assigned_to = ?,
          requires_approval = ?, review_state = ?, result_summary = ?, result_links = ?, rrule = ?, exdates = ?,
          is_private = ?, allow_overlap = ?, lease_owner = ?, lease_until = ?, version = ?, updated_by = ?, updated_at = ?
        WHERE id = ? AND version = ? AND deleted_at IS NULL
      `).bind(
        next.project_id, next.title, next.description, next.starts_at, next.ends_at, next.timezone, next.all_day ? 1 : 0,
        next.category, next.status, next.not_done_reason, next.blocked_reason, next.priority, next.assigned_to,
        next.requires_approval ? 1 : 0, next.review_state, next.result_summary, JSON.stringify(next.result_links || []), next.rrule, JSON.stringify(next.exdates || []),
        next.is_private ? 1 : 0, next.allow_overlap ? 1 : 0, next.lease_owner, next.lease_until, next.version, next.updated_by, next.updated_at,
        id, expectedVersion
      ).run();
      if (!res.meta || res.meta.changes === 0) {
        return { conflict: true, serverEvent: await this.getEventById(id) };
      }
      return { event: await this.getEventById(id) };
    }
    this.mem.events.set(id, next);
    return { event: decorateEventComputed(next) };
  }

  async deleteEvent(id, nowIso) {
    await this.ensureInitialized();
    if (this.db) {
      const res = await this.db.prepare('UPDATE mc_events SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL').bind(nowIso, id).run();
      return Boolean(res.meta && res.meta.changes > 0);
    }
    const cur = this.mem.events.get(id);
    if (!cur || cur.deleted_at) return false;
    cur.deleted_at = nowIso;
    return true;
  }

  async upsertOccurrenceOverride(ov) {
    await this.ensureInitialized();
    if (this.db) {
      await this.db.prepare(`
        INSERT INTO mc_occurrence_overrides (
          id, series_id, occurrence_id, original_start, cancelled, title, description,
          starts_at, ends_at, status, not_done_reason, assigned_to, review_state, result_summary, updated_by, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(occurrence_id) DO UPDATE SET
          cancelled = excluded.cancelled, title = excluded.title, description = excluded.description,
          starts_at = excluded.starts_at, ends_at = excluded.ends_at, status = excluded.status,
          not_done_reason = excluded.not_done_reason, assigned_to = excluded.assigned_to,
          review_state = excluded.review_state, result_summary = excluded.result_summary,
          updated_by = excluded.updated_by, updated_at = excluded.updated_at
      `).bind(
        ov.id, ov.series_id, ov.occurrence_id, ov.original_start, ov.cancelled ? 1 : 0,
        ov.title ?? null, ov.description ?? null, ov.starts_at ?? null, ov.ends_at ?? null,
        ov.status ?? null, ov.not_done_reason ?? null, ov.assigned_to ?? null,
        ov.review_state ?? null, ov.result_summary ?? null, ov.updated_by, ov.updated_at
      ).run();
      return ov;
    }
    this.mem.overrides.set(ov.occurrence_id, { ...ov });
    return ov;
  }

  async listOverridesForSeries(seriesId) {
    await this.ensureInitialized();
    if (this.db) {
      const res = await this.db.prepare('SELECT * FROM mc_occurrence_overrides WHERE series_id = ?').bind(seriesId).all();
      return res.results || [];
    }
    return [...this.mem.overrides.values()].filter((o) => o.series_id === seriesId);
  }

  async appendAudit(entry) {
    await this.ensureInitialized();
    if (this.db) {
      await this.db.prepare(`
        INSERT INTO mc_audit_log (id, actor_type, actor_id, action, entity, entity_id, before_hash, after_hash, details, correlation_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        entry.id, entry.actor_type, entry.actor_id, entry.action, entry.entity, entry.entity_id,
        entry.before_hash || null, entry.after_hash || null, JSON.stringify(entry.details || {}), entry.correlation_id, entry.created_at
      ).run();
      return entry;
    }
    this.mem.auditLog.unshift(entry);
    return entry;
  }

  async listAudit(entityId = null, limit = 100) {
    await this.ensureInitialized();
    if (this.db) {
      if (entityId) {
        const res = await this.db.prepare('SELECT * FROM mc_audit_log WHERE entity_id = ? ORDER BY created_at DESC LIMIT ?').bind(entityId, limit).all();
        return (res.results || []).map((r) => ({ ...r, details: safeJsonParse(r.details, {}) }));
      }
      const res = await this.db.prepare('SELECT * FROM mc_audit_log ORDER BY created_at DESC LIMIT ?').bind(limit).all();
      return (res.results || []).map((r) => ({ ...r, details: safeJsonParse(r.details, {}) }));
    }
    const filtered = entityId ? this.mem.auditLog.filter((a) => a.entity_id === entityId) : this.mem.auditLog;
    return filtered.slice(0, limit);
  }

  async enqueueOutbox(item) {
    await this.ensureInitialized();
    if (this.db) {
      await this.db.prepare(`
        INSERT OR IGNORE INTO mc_outbox (id, event_type, entity_id, payload, idempotency_key, status, delivery_count, next_attempt_at, correlation_id, created_at)
        VALUES (?, ?, ?, ?, ?, 'pending', 0, ?, ?, ?)
      `).bind(
        item.id, item.event_type, item.entity_id, JSON.stringify(item.payload), item.idempotency_key,
        item.next_attempt_at, item.correlation_id, item.created_at
      ).run();
      return item;
    }
    if (!this.mem.outbox.some((o) => o.idempotency_key === item.idempotency_key)) {
      this.mem.outbox.push({ ...item, status: 'pending', delivery_count: 0 });
    }
    return item;
  }

  async listOutbox(status = null) {
    await this.ensureInitialized();
    if (this.db) {
      const res = status
        ? await this.db.prepare('SELECT * FROM mc_outbox WHERE status = ? ORDER BY created_at ASC LIMIT 200').bind(status).all()
        : await this.db.prepare('SELECT * FROM mc_outbox ORDER BY created_at DESC LIMIT 200').all();
      return (res.results || []).map((r) => ({ ...r, payload: safeJsonParse(r.payload, {}) }));
    }
    return status ? this.mem.outbox.filter((o) => o.status === status) : [...this.mem.outbox];
  }

  async updateOutboxItem(id, patch) {
    await this.ensureInitialized();
    if (this.db) {
      await this.db.prepare(`
        UPDATE mc_outbox SET status = ?, delivery_count = ?, next_attempt_at = ?, last_error = ? WHERE id = ?
      `).bind(patch.status, patch.delivery_count, patch.next_attempt_at, patch.last_error || null, id).run();
      return;
    }
    const item = this.mem.outbox.find((o) => o.id === id);
    if (item) Object.assign(item, patch);
  }

  async upsertPushSubscription(sub) {
    await this.ensureInitialized();
    if (this.db) {
      await this.db.prepare(`
        INSERT INTO mc_push_subscriptions (id, user_id, endpoint_hash, endpoint, p256dh, auth, device_name, preferences, quiet_hours_start, quiet_hours_end, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(endpoint_hash) DO UPDATE SET
          user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth,
          preferences = excluded.preferences, quiet_hours_start = excluded.quiet_hours_start, quiet_hours_end = excluded.quiet_hours_end
      `).bind(
        sub.id, sub.user_id, sub.endpoint_hash, sub.endpoint, sub.p256dh, sub.auth,
        sub.device_name, JSON.stringify(sub.preferences || {}), sub.quiet_hours_start || '22:00', sub.quiet_hours_end || '06:00', sub.created_at
      ).run();
      return sub;
    }
    this.mem.pushSubscriptions.set(sub.id, { ...sub });
    return sub;
  }

  async deletePushSubscription(id, userId) {
    await this.ensureInitialized();
    if (this.db) {
      const res = await this.db.prepare('DELETE FROM mc_push_subscriptions WHERE id = ? AND user_id = ?').bind(id, userId).run();
      return Boolean(res.meta && res.meta.changes > 0);
    }
    const existing = this.mem.pushSubscriptions.get(id);
    if (!existing || existing.user_id !== userId) return false;
    this.mem.pushSubscriptions.delete(id);
    return true;
  }

  async listPushSubscriptions(userId) {
    await this.ensureInitialized();
    if (this.db) {
      const res = await this.db.prepare('SELECT * FROM mc_push_subscriptions WHERE user_id = ?').bind(userId).all();
      return res.results || [];
    }
    return [...this.mem.pushSubscriptions.values()].filter((s) => s.user_id === userId);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Google Calendar Connection, Mapping (ccMC/Vikunja ↔ Google Calendar) & Logs
  // ──────────────────────────────────────────────────────────────────────────
  async getGcalConnection(userId = null) {
    await this.ensureInitialized();
    if (this.db) {
      const row = userId
        ? await this.db.prepare('SELECT * FROM mc_gcal_connections WHERE user_id = ?').bind(userId).first()
        : await this.db.prepare('SELECT * FROM mc_gcal_connections ORDER BY connected_at DESC LIMIT 1').first();
      if (!row) return null;
      return { ...row, scopes: safeJsonParse(row.scopes, GCAL_MINIMAL_SCOPES) };
    }
    if (userId) {
      const c = this.mem.gcalConnections.get(userId);
      return c ? { ...c, scopes: safeJsonParse(c.scopes, GCAL_MINIMAL_SCOPES) } : null;
    }
    const first = [...this.mem.gcalConnections.values()][0] || null;
    return first ? { ...first, scopes: safeJsonParse(first.scopes, GCAL_MINIMAL_SCOPES) } : null;
  }

  async getGcalConnectionByChannelId(channelId) {
    await this.ensureInitialized();
    if (this.db) {
      const row = await this.db.prepare('SELECT * FROM mc_gcal_connections WHERE watch_channel_id = ?').bind(channelId).first();
      return row ? { ...row, scopes: safeJsonParse(row.scopes, GCAL_MINIMAL_SCOPES) } : null;
    }
    const found = [...this.mem.gcalConnections.values()].find((c) => c.watch_channel_id === channelId) || null;
    return found ? { ...found, scopes: safeJsonParse(found.scopes, GCAL_MINIMAL_SCOPES) } : null;
  }

  async upsertGcalConnection(conn) {
    await this.ensureInitialized();
    const record = {
      user_id: conn.user_id,
      email: String(conn.email || DEFAULT_OWNER_EMAIL).toLowerCase(),
      encrypted_tokens: conn.encrypted_tokens || '',
      scopes: Array.isArray(conn.scopes) ? JSON.stringify(conn.scopes) : String(conn.scopes || JSON.stringify(GCAL_MINIMAL_SCOPES)),
      calendar_id: conn.calendar_id || 'cc_mission_dedicated',
      calendar_name: conn.calendar_name || GCAL_DEDICATED_CALENDAR_NAME,
      sync_mode: GCAL_SYNC_MODES.includes(conn.sync_mode) ? conn.sync_mode : 'bidirectional',
      sync_token: conn.sync_token ?? null,
      watch_channel_id: conn.watch_channel_id ?? null,
      watch_resource_id: conn.watch_resource_id ?? null,
      watch_token_hash: conn.watch_token_hash ?? null,
      watch_expiration: conn.watch_expiration ?? null,
      status: conn.status || 'connected',
      connected_at: conn.connected_at || new Date().toISOString(),
      last_synced_at: conn.last_synced_at ?? null,
    };
    if (this.db) {
      await this.db.prepare(`
        INSERT INTO mc_gcal_connections (
          user_id, email, encrypted_tokens, scopes, calendar_id, calendar_name,
          sync_mode, sync_token, watch_channel_id, watch_resource_id, watch_token_hash,
          watch_expiration, status, connected_at, last_synced_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          email = excluded.email,
          encrypted_tokens = excluded.encrypted_tokens,
          scopes = excluded.scopes,
          calendar_id = excluded.calendar_id,
          calendar_name = excluded.calendar_name,
          sync_mode = excluded.sync_mode,
          sync_token = excluded.sync_token,
          watch_channel_id = excluded.watch_channel_id,
          watch_resource_id = excluded.watch_resource_id,
          watch_token_hash = excluded.watch_token_hash,
          watch_expiration = excluded.watch_expiration,
          status = excluded.status,
          connected_at = excluded.connected_at,
          last_synced_at = excluded.last_synced_at
      `).bind(
        record.user_id, record.email, record.encrypted_tokens, record.scopes,
        record.calendar_id, record.calendar_name, record.sync_mode, record.sync_token,
        record.watch_channel_id, record.watch_resource_id, record.watch_token_hash,
        record.watch_expiration, record.status, record.connected_at, record.last_synced_at
      ).run();
      return await this.getGcalConnection(record.user_id);
    }
    this.mem.gcalConnections.set(record.user_id, record);
    return await this.getGcalConnection(record.user_id);
  }

  async deleteGcalConnection(userId) {
    await this.ensureInitialized();
    if (this.db) {
      const res = await this.db.prepare('DELETE FROM mc_gcal_connections WHERE user_id = ?').bind(userId).run();
      return Boolean(res.meta && res.meta.changes > 0);
    }
    return this.mem.gcalConnections.delete(userId);
  }

  async getGcalMappingByEventId(eventId) {
    await this.ensureInitialized();
    if (this.db) {
      return await this.db.prepare('SELECT * FROM mc_gcal_mappings WHERE event_id = ?').bind(eventId).first();
    }
    return [...this.mem.gcalMappings.values()].find((m) => m.event_id === eventId) || null;
  }

  async getGcalMappingByGcalEventId(gcalEventId, gcalCalendarId = null) {
    await this.ensureInitialized();
    if (this.db) {
      if (gcalCalendarId) {
        return await this.db.prepare('SELECT * FROM mc_gcal_mappings WHERE gcal_event_id = ? AND gcal_calendar_id = ?').bind(gcalEventId, gcalCalendarId).first();
      }
      return await this.db.prepare('SELECT * FROM mc_gcal_mappings WHERE gcal_event_id = ?').bind(gcalEventId).first();
    }
    return [...this.mem.gcalMappings.values()].find((m) => m.gcal_event_id === gcalEventId && (!gcalCalendarId || m.gcal_calendar_id === gcalCalendarId)) || null;
  }

  async upsertGcalMapping(mapping) {
    await this.ensureInitialized();
    const record = {
      id: mapping.id || `gmap_${mapping.event_id}`,
      event_id: mapping.event_id,
      vikunja_task_id: mapping.vikunja_task_id || `vk_${mapping.event_id}`,
      gcal_calendar_id: mapping.gcal_calendar_id,
      gcal_event_id: mapping.gcal_event_id,
      gcal_etag: mapping.gcal_etag || `"etag_${Date.now()}"`,
      gcal_ical_uid: mapping.gcal_ical_uid || `${mapping.gcal_event_id}@google.com`,
      last_synced_version: Number(mapping.last_synced_version || 1),
      sync_hash: mapping.sync_hash || null,
      updated_at: mapping.updated_at || new Date().toISOString(),
    };
    if (this.db) {
      await this.db.prepare(`
        INSERT INTO mc_gcal_mappings (
          id, event_id, vikunja_task_id, gcal_calendar_id, gcal_event_id,
          gcal_etag, gcal_ical_uid, last_synced_version, sync_hash, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(event_id) DO UPDATE SET
          vikunja_task_id = excluded.vikunja_task_id,
          gcal_calendar_id = excluded.gcal_calendar_id,
          gcal_event_id = excluded.gcal_event_id,
          gcal_etag = excluded.gcal_etag,
          gcal_ical_uid = excluded.gcal_ical_uid,
          last_synced_version = excluded.last_synced_version,
          sync_hash = excluded.sync_hash,
          updated_at = excluded.updated_at
      `).bind(
        record.id, record.event_id, record.vikunja_task_id, record.gcal_calendar_id,
        record.gcal_event_id, record.gcal_etag, record.gcal_ical_uid,
        record.last_synced_version, record.sync_hash, record.updated_at
      ).run();
      return record;
    }
    this.mem.gcalMappings.set(record.event_id, record);
    return record;
  }

  async deleteGcalMapping(eventId) {
    await this.ensureInitialized();
    if (this.db) {
      const res = await this.db.prepare('DELETE FROM mc_gcal_mappings WHERE event_id = ?').bind(eventId).run();
      return Boolean(res.meta && res.meta.changes > 0);
    }
    return this.mem.gcalMappings.delete(eventId);
  }

  async listGcalMappings() {
    await this.ensureInitialized();
    if (this.db) {
      const res = await this.db.prepare('SELECT * FROM mc_gcal_mappings ORDER BY updated_at DESC LIMIT 2000').all();
      return res.results || [];
    }
    return [...this.mem.gcalMappings.values()];
  }

  async appendGcalSyncLog(entry) {
    await this.ensureInitialized();
    const record = {
      id: entry.id || generateId('gsync'),
      direction: entry.direction || 'system',
      mode: entry.mode || 'bidirectional',
      action: entry.action || 'sync',
      event_id: entry.event_id || null,
      gcal_event_id: entry.gcal_event_id || null,
      status: entry.status || 'ok',
      details: typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details || {}),
      created_at: entry.created_at || new Date().toISOString(),
    };
    if (this.db) {
      await this.db.prepare(`
        INSERT INTO mc_gcal_sync_logs (id, direction, mode, action, event_id, gcal_event_id, status, details, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        record.id, record.direction, record.mode, record.action,
        record.event_id, record.gcal_event_id, record.status, record.details, record.created_at
      ).run();
      return { ...record, details: safeJsonParse(record.details, {}) };
    }
    const parsedRecord = { ...record, details: safeJsonParse(record.details, {}) };
    this.mem.gcalSyncLogs.unshift(parsedRecord);
    if (this.mem.gcalSyncLogs.length > 300) this.mem.gcalSyncLogs.length = 300;
    return parsedRecord;
  }

  async listGcalSyncLogs(limit = 50) {
    await this.ensureInitialized();
    if (this.db) {
      const res = await this.db.prepare('SELECT * FROM mc_gcal_sync_logs ORDER BY created_at DESC LIMIT ?').bind(limit).all();
      return (res.results || []).map((r) => ({ ...r, details: safeJsonParse(r.details, {}) }));
    }
    return this.mem.gcalSyncLogs.slice(0, limit);
  }
}

// ============================================================================
// Główny Serwis Domenowy CC Mission Calendar
// ============================================================================
export class MissionCalendarService {
  constructor({ repo, env = {}, nowFn = () => new Date(), verifyTokenFn = null, outboxDispatcher = null }) {
    this.repo = repo;
    this.env = env;
    this.nowFn = nowFn;
    this.verifyTokenFn = verifyTokenFn;
    this.outboxDispatcher = outboxDispatcher;
    this.ownerEmail = (env.ADMIN_EMAIL || DEFAULT_OWNER_EMAIL).toLowerCase();
    this.ownerSub = env.ADMIN_GOOGLE_SUB || null;
    this.sessionSecret = env.SESSION_SECRET || 'cc-mission-calendar-session-secret-2026-default';
  }

  nowIso() {
    return this.nowFn().toISOString();
  }

  async createSessionToken(user) {
    const exp = Math.floor(this.nowFn().getTime() / 1000) + 8 * 3600;
    const payload = JSON.stringify({ uid: user.id, sub: user.google_sub, email: user.email, role: user.role, exp });
    const b64 = btoa(payload).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const sig = await hmacSha256Hex(this.sessionSecret, b64);
    return `${b64}.${sig}`;
  }

  async verifySessionCookie(token) {
    if (!token || typeof token !== 'string' || !token.includes('.')) return null;
    const [b64, sig] = token.split('.');
    const expectedSig = await hmacSha256Hex(this.sessionSecret, b64);
    if (sig !== expectedSig) return null;
    try {
      const pad = b64.replace(/-/g, '+').replace(/_/g, '/');
      const data = JSON.parse(atob(pad));
      if (!data.exp || data.exp < Math.floor(this.nowFn().getTime() / 1000)) return null;
      return data;
    } catch {
      return null;
    }
  }

  async createCsrfToken(sub) {
    const hourSlot = Math.floor(this.nowFn().getTime() / 3600_000);
    return (await hmacSha256Hex(this.sessionSecret, `csrf|${sub}|${hourSlot}`)).slice(0, 32);
  }

  async verifyCsrfToken(sub, supplied) {
    if (!supplied || typeof supplied !== 'string') return false;
    const current = await this.createCsrfToken(sub);
    if (supplied === current) return true;
    const prevSlot = Math.floor(this.nowFn().getTime() / 3600_000) - 1;
    const prev = (await hmacSha256Hex(this.sessionSecret, `csrf|${sub}|${prevSlot}`)).slice(0, 32);
    return supplied === prev;
  }

  async authenticateUser(request) {
    const authHeader = request.headers.get('Authorization') || '';
    if (authHeader.startsWith('Bearer ') && this.verifyTokenFn) {
      const rawToken = authHeader.slice(7).trim();
      const verified = await this.verifyTokenFn(rawToken);
      if (verified && verified.sub) {
        const email = String(verified.email || '').toLowerCase();
        const isOwner =
          (this.ownerSub ? verified.sub === this.ownerSub : false) ||
          (email && (email === this.ownerEmail || ALLOWED_ADMIN_EMAILS.includes(email)) && verified.email_verified !== false);
        if (isOwner) {
          const u = await this.repo.upsertUser({ google_sub: verified.sub, email: email || this.ownerEmail, role: 'owner' }, this.nowIso());
          return { user: u, authMethod: 'bearer' };
        }
        const existing = await this.repo.getUserBySub(verified.sub);
        if (existing) return { user: existing, authMethod: 'bearer' };
        return { forbidden: true, reason: 'Brak uprawnień do Kalendarza Misji для tego konta Google' };
      }
    }

    const cookieHeader = request.headers.get('Cookie') || '';
    const match = cookieHeader.match(/(?:^|;\s*)cc_mc_session=([^;]+)/);
    if (match) {
      const sessionData = await this.verifySessionCookie(decodeURIComponent(match[1]));
      if (sessionData && sessionData.sub) {
        const existing = await this.repo.getUserBySub(sessionData.sub);
        if (existing) return { user: existing, authMethod: 'cookie' };
      }
    }
    return { unauthenticated: true };
  }

  async authenticateAgent(request) {
    const authHeader = request.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return null;
    const rawToken = authHeader.slice(7).trim();
    if (!rawToken) return null;
    const hash = await sha256Hex(rawToken);
    return await this.repo.getAgentByTokenHash(hash);
  }

  validateEventPayload(payload, isPartial = false) {
    const out = {};
    if (!isPartial || payload.title !== undefined) {
      if (typeof payload.title !== 'string' || !payload.title.trim() || payload.title.trim().length > 200) {
        throw new Error('Tytuł zadania musi zawierać od 1 do 200 znaków');
      }
      out.title = payload.title.trim();
    }
    if (!isPartial || payload.description !== undefined) {
      out.description = String(payload.description || '').slice(0, 10000);
    }
    if (!isPartial || payload.starts_at !== undefined) {
      if (!payload.starts_at || Number.isNaN(Date.parse(payload.starts_at))) {
        throw new Error('Nieprawidłowa data rozpoczęcia (starts_at)');
      }
      out.starts_at = new Date(payload.starts_at).toISOString();
    }
    if (payload.ends_at !== undefined) {
      if (payload.ends_at === null || payload.ends_at === '') {
        out.ends_at = null;
      } else {
        if (Number.isNaN(Date.parse(payload.ends_at))) throw new Error('Nieprawidłowa data zakończenia (ends_at)');
        out.ends_at = new Date(payload.ends_at).toISOString();
      }
    }
    const checkStart = out.starts_at || payload._existingStartsAt;
    const checkEnd = out.ends_at !== undefined ? out.ends_at : payload._existingEndsAt;
    if (checkStart && checkEnd && Date.parse(checkEnd) < Date.parse(checkStart)) {
      throw new Error('Data zakończenia nie może być wcześniejsza niż początek');
    }

    if (!isPartial || payload.status !== undefined) {
      const st = payload.status || 'todo';
      if (!MISSION_STATUSES[st]) throw new Error('Nieprawidłowy status (dozwolone: todo, in_progress, done, not_done)');
      out.status = st;
    }
    if (payload.not_done_reason !== undefined) {
      out.not_done_reason = payload.not_done_reason ? String(payload.not_done_reason).trim().slice(0, 1000) : null;
    }
    const finalStatus = out.status || payload._existingStatus || 'todo';
    const finalNotDoneReason = out.not_done_reason !== undefined ? out.not_done_reason : payload._existingNotDoneReason;
    if (finalStatus === 'not_done' && !finalNotDoneReason) {
      throw new Error('Status "not_done" (Niezrealizowane) wymaga podania obowiązkowego powodu (not_done_reason)');
    }

    if (!isPartial || payload.category !== undefined) {
      const cat = payload.category || 'mission';
      if (!MISSION_AREAS.includes(cat)) throw new Error('Nieprawidłowy obszar misji');
      out.category = cat;
    }
    if (!isPartial || payload.project_id !== undefined) {
      out.project_id = String(payload.project_id || 'general').slice(0, 64);
    }
    if (!isPartial || payload.priority !== undefined) {
      const prio = payload.priority !== undefined ? Number(payload.priority) : 2;
      if (!Number.isInteger(prio) || prio < 1 || prio > 4) throw new Error('Priorytet musi być liczbą całkowitą 1..4 (P0..P3)');
      out.priority = prio;
    }
    if (payload.assigned_to !== undefined) {
      out.assigned_to = payload.assigned_to ? String(payload.assigned_to).trim().slice(0, 80) : null;
    }
    if (payload.rrule !== undefined) {
      if (!payload.rrule) {
        out.rrule = null;
      } else {
        const parsed = parseRRule(payload.rrule);
        out.rrule = parsed.raw;
      }
    }
    if (payload.exdates !== undefined) {
      out.exdates = Array.isArray(payload.exdates) ? payload.exdates.map(String) : [];
    }
    if (payload.timezone !== undefined) {
      out.timezone = String(payload.timezone || DEFAULT_TIMEZONE);
    }
    if (payload.all_day !== undefined) out.all_day = Boolean(payload.all_day);
    if (payload.requires_approval !== undefined) out.requires_approval = Boolean(payload.requires_approval);
    if (payload.is_private !== undefined) out.is_private = Boolean(payload.is_private);
    if (payload.allow_overlap !== undefined) out.allow_overlap = Boolean(payload.allow_overlap);
    if (payload.blocked_reason !== undefined) out.blocked_reason = payload.blocked_reason ? String(payload.blocked_reason).slice(0, 1000) : null;
    return out;
  }

  async recordAuditAndOutbox({ actor_type, actor_id, action, entity, entity_id, beforeObj, afterObj, details = {}, event_type = null, correlation_id = null }) {
    const corr = correlation_id || generateId('corr');
    const now = this.nowIso();
    const before_hash = beforeObj ? (await sha256Hex(JSON.stringify(beforeObj))).slice(0, 16) : null;
    const after_hash = afterObj ? (await sha256Hex(JSON.stringify(afterObj))).slice(0, 16) : null;

    await this.repo.appendAudit({
      id: generateId('aud'),
      actor_type,
      actor_id,
      action,
      entity,
      entity_id,
      before_hash,
      after_hash,
      details,
      correlation_id: corr,
      created_at: now,
    });

    if (event_type) {
      await this.repo.enqueueOutbox({
        id: generateId('out'),
        event_type,
        entity_id,
        payload: {
          schema_version: '1.0',
          event_type,
          occurred_at: now,
          correlation_id: corr,
          task_id: entity_id,
          actor: `${actor_type}:${actor_id}`,
          details,
        },
        idempotency_key: `${event_type}:${entity_id}:${after_hash || now}`,
        next_attempt_at: now,
        correlation_id: corr,
        created_at: now,
      });
    }
    return corr;
  }

  async createEvent(payload, actor, correlationId = null) {
    const validated = this.validateEventPayload(payload, false);
    const now = this.nowIso();

    // Kontrola nakładania godzin dla pracy człowieka (gdy allow_overlap === false)
    if (validated.allow_overlap === false) {
      const existing = await this.repo.listEvents();
      const sMs = Date.parse(validated.starts_at);
      const eMs = validated.ends_at ? Date.parse(validated.ends_at) : sMs + 1800_000;
      const overlap = existing.find((ev) => {
        if (ev.assigned_to !== validated.assigned_to) return false;
        const evS = Date.parse(ev.starts_at);
        const evE = ev.ends_at ? Date.parse(ev.ends_at) : evS + 1800_000;
        return sMs < evE && eMs > evS;
      });
      if (overlap) {
        const err = new Error(`Konflikt godzin z zadaniem: ${overlap.title}`);
        err.status = 409;
        throw err;
      }
    }

    const ev = {
      id: payload.id || generateId('evt'),
      source: payload.source || 'local',
      external_id: payload.external_id || null,
      project_id: validated.project_id || 'general',
      title: validated.title,
      description: validated.description || '',
      starts_at: validated.starts_at,
      ends_at: validated.ends_at ?? null,
      timezone: validated.timezone || DEFAULT_TIMEZONE,
      all_day: validated.all_day ?? false,
      category: validated.category || 'mission',
      status: validated.status || 'todo',
      not_done_reason: validated.not_done_reason || null,
      blocked_reason: validated.blocked_reason || null,
      priority: validated.priority || 2,
      owner_type: validated.assigned_to?.startsWith('@') ? 'agent' : 'human',
      assigned_to: validated.assigned_to || null,
      requires_approval: validated.requires_approval ?? true,
      review_state: 'none',
      result_summary: null,
      result_links: [],
      rrule: validated.rrule || null,
      exdates: validated.exdates || [],
      series_id: null,
      occurrence_id: null,
      is_private: validated.is_private ?? (validated.category === 'people' || validated.category === 'guardian'),
      allow_overlap: validated.allow_overlap ?? true,
      lease_owner: null,
      lease_until: null,
      version: 1,
      created_by: `${actor.type}:${actor.id}`,
      updated_by: `${actor.type}:${actor.id}`,
      created_at: now,
      updated_at: now,
    };

    const created = await this.repo.createEvent(ev);
    await this.recordAuditAndOutbox({
      actor_type: actor.type,
      actor_id: actor.id,
      action: 'created',
      entity: 'event',
      entity_id: created.id,
      beforeObj: null,
      afterObj: created,
      details: { title: created.title, assigned_to: created.assigned_to, status: created.status },
      event_type: 'TaskCreated',
      correlation_id: correlationId,
    });
    if (!payload._fromGcalSync) {
      await this.maybeAutoExportEventToGoogle(created, 'create').catch(() => {});
    }
    const hydrated = (await this.repo.getEventById(created.id)) || created;
    return decorateEventComputed(hydrated, this.nowFn());
  }

  async patchEvent(id, payload, actor, correlationId = null) {
    const current = await this.repo.getEventById(id);
    if (!current) {
      const err = new Error('Zadanie nie istnieje');
      err.status = 404;
      throw err;
    }
    const expectedVersion = Number(payload.version);
    if (!Number.isInteger(expectedVersion)) {
      const err = new Error('Wymagany numer wersji (version) do kontroli współbieżności');
      err.status = 428;
      throw err;
    }

    // Jeśli zadanie wymaga akceptacji, tylko owner/reviewer może bezpośrednio ustawić status = done
    if (payload.status === 'done' && current.requires_approval && actor.role !== 'owner' && actor.role !== 'reviewer') {
      const err = new Error('Zadanie wymaga zatwierdzenia przez Właściciela przed oznaczeniem jako Zrealizowane (done)');
      err.status = 403;
      throw err;
    }

    const validated = this.validateEventPayload(
      {
        ...payload,
        _existingStartsAt: current.starts_at,
        _existingEndsAt: current.ends_at,
        _existingStatus: current.status,
        _existingNotDoneReason: current.not_done_reason,
      },
      true
    );

    const now = this.nowIso();
    const result = await this.repo.updateEventOptimistic(
      id,
      expectedVersion,
      { ...validated, updated_by: `${actor.type}:${actor.id}` },
      now
    );
    if (result.conflict) {
      const err = new Error('Konflikt edycji (409): zadanie zostało w międzyczasie zmienione');
      err.status = 409;
      err.serverEvent = result.serverEvent;
      throw err;
    }

    const eventType =
      validated.starts_at && validated.starts_at !== current.starts_at
        ? 'Rescheduled'
        : validated.status === 'not_done'
        ? 'Failed'
        : 'Updated';

    await this.recordAuditAndOutbox({
      actor_type: actor.type,
      actor_id: actor.id,
      action: 'updated',
      entity: 'event',
      entity_id: id,
      beforeObj: current,
      afterObj: result.event,
      details: { changes: Object.keys(validated) },
      event_type: eventType,
      correlation_id: correlationId,
    });

    if (!payload._fromGcalSync) {
      await this.maybeAutoExportEventToGoogle(result.event, 'update').catch(() => {});
    }
    const hydrated = (await this.repo.getEventById(id)) || result.event;
    return decorateEventComputed(hydrated, this.nowFn());
  }

  async overrideOccurrence(seriesId, occurrenceId, payload, actor) {
    const series = await this.repo.getEventById(seriesId);
    if (!series || !series.rrule) {
      const err = new Error('Seria cykliczna nie istnieje');
      err.status = 404;
      throw err;
    }
    const now = this.nowIso();
    const ov = await this.repo.upsertOccurrenceOverride({
      id: generateId('ov'),
      series_id: seriesId,
      occurrence_id: occurrenceId,
      original_start: payload.original_start || occurrenceId.slice(seriesId.length + 1),
      cancelled: Boolean(payload.cancelled),
      title: payload.title ?? null,
      description: payload.description ?? null,
      starts_at: payload.starts_at ? new Date(payload.starts_at).toISOString() : null,
      ends_at: payload.ends_at ? new Date(payload.ends_at).toISOString() : null,
      status: payload.status ?? null,
      not_done_reason: payload.not_done_reason ?? null,
      assigned_to: payload.assigned_to ?? null,
      review_state: payload.review_state ?? null,
      result_summary: payload.result_summary ?? null,
      updated_by: `${actor.type}:${actor.id}`,
      updated_at: now,
    });

    await this.recordAuditAndOutbox({
      actor_type: actor.type,
      actor_id: actor.id,
      action: 'occurrence_override',
      entity: 'event',
      entity_id: seriesId,
      beforeObj: null,
      afterObj: ov,
      details: { occurrence_id: occurrenceId, cancelled: ov.cancelled, starts_at: ov.starts_at },
      event_type: 'Rescheduled',
    });
    if (!payload._fromGcalSync) {
      await this.maybeAutoExportOccurrenceOverrideToGoogle(series, ov).catch(() => {});
    }
    return ov;
  }

  async assignTask(id, { assignee, capability }, actor) {
    const current = await this.repo.getEventById(id);
    if (!current) {
      const err = new Error('Zadanie nie istnieje');
      err.status = 404;
      throw err;
    }

    let targetAssignee = assignee;
    if (!targetAssignee || targetAssignee === '@OA') {
      // Router @OA: dobierz agenta wg capabilities i limitu max_parallel
      const agents = await this.repo.listAgents();
      const allEvents = await this.repo.listEvents();
      const candidate = agents.find((ag) => {
        if (!ag.allowed_projects.includes('*') && !ag.allowed_projects.includes(current.project_id)) return false;
        if (capability && ag.capabilities.length && !ag.capabilities.includes(capability)) return false;
        const activeCount = allEvents.filter((e) => e.assigned_to === ag.name && e.status === 'in_progress').length;
        return activeCount < (ag.max_parallel || 3);
      });
      targetAssignee = candidate ? candidate.name : '@A001';
    }

    const updated = await this.repo.updateEventOptimistic(
      id,
      current.version,
      { assigned_to: targetAssignee, owner_type: targetAssignee.startsWith('@') ? 'agent' : 'human', updated_by: `${actor.type}:${actor.id}` },
      this.nowIso()
    );
    if (updated.conflict) {
      const err = new Error('Konflikt wersji przy przypisywaniu zadania');
      err.status = 409;
      throw err;
    }

    await this.recordAuditAndOutbox({
      actor_type: actor.type,
      actor_id: actor.id,
      action: 'assigned',
      entity: 'event',
      entity_id: id,
      beforeObj: current,
      afterObj: updated.event,
      details: { assigned_to: targetAssignee },
      event_type: 'Assigned',
    });
    return updated.event;
  }

  async claimTask(id, agentClient, leaseMinutes = 60) {
    const current = await this.repo.getEventById(id);
    if (!current || current.is_private) {
      const err = new Error('Zadanie nie istnieje lub jest prywatne');
      err.status = 404;
      throw err;
    }
    if (!agentClient.allowed_projects.includes('*') && !agentClient.allowed_projects.includes(current.project_id)) {
      const err = new Error('Agent nie ma uprawnień do tego projektu');
      err.status = 403;
      throw err;
    }
    const now = this.nowFn();
    const leaseActive = current.lease_owner && current.lease_owner !== agentClient.name && current.lease_until && Date.parse(current.lease_until) > now.getTime();
    if (leaseActive || (current.status !== 'todo' && current.lease_owner !== agentClient.name)) {
      const err = new Error('Zadanie jest już przejęte przez innego agenta lub niedostępne');
      err.status = 409;
      throw err;
    }
    if (current.assigned_to && current.assigned_to !== agentClient.name && current.assigned_to !== '@OA') {
      const err = new Error(`Zadanie jest przypisane do ${current.assigned_to}`);
      err.status = 403;
      throw err;
    }

    const leaseUntil = new Date(now.getTime() + leaseMinutes * 60_000).toISOString();
    const res = await this.repo.updateEventOptimistic(
      id,
      current.version,
      {
        assigned_to: agentClient.name,
        status: 'in_progress',
        lease_owner: agentClient.name,
        lease_until: leaseUntil,
        updated_by: `agent:${agentClient.name}`,
      },
      now.toISOString()
    );
    if (res.conflict) {
      const err = new Error('Konflikt współbieżnego przejęcia (claim) — inny agent był szybszy');
      err.status = 409;
      throw err;
    }

    await this.recordAuditAndOutbox({
      actor_type: 'agent',
      actor_id: agentClient.name,
      action: 'claimed',
      entity: 'event',
      entity_id: id,
      beforeObj: current,
      afterObj: res.event,
      details: { lease_until: leaseUntil },
      event_type: 'Claimed',
    });
    return res.event;
  }

  async submitAgentResult(id, agentClient, { summary, result_links = [] }) {
    const note = String(summary || '').trim();
    if (!note || note.length > 4000) {
      const err = new Error('Wymagany opis rezultatu (summary) o długości 1–4000 znaków');
      err.status = 422;
      throw err;
    }
    const current = await this.repo.getEventById(id);
    if (!current || current.is_private) {
      const err = new Error('Zadanie nie istnieje');
      err.status = 404;
      throw err;
    }
    if (current.assigned_to !== agentClient.name || current.status !== 'in_progress') {
      const err = new Error('Zadanie nie jest aktywne lub nie należy do tego agenta');
      err.status = 409;
      throw err;
    }

    const links = Array.isArray(result_links) ? result_links.map(String).slice(0, 20) : [];
    const res = await this.repo.updateEventOptimistic(
      id,
      current.version,
      {
        review_state: 'awaiting_review',
        result_summary: note,
        result_links: links,
        updated_by: `agent:${agentClient.name}`,
      },
      this.nowIso()
    );
    if (res.conflict) {
      const err = new Error('Konflikt wersji przy zapisie rezultatu');
      err.status = 409;
      throw err;
    }

    await this.recordAuditAndOutbox({
      actor_type: 'agent',
      actor_id: agentClient.name,
      action: 'result_submitted',
      entity: 'event',
      entity_id: id,
      beforeObj: current,
      afterObj: res.event,
      details: { summary: note, result_links: links },
      event_type: 'ResultSubmitted',
    });
    return res.event;
  }

  async approveTask(id, actor) {
    if (actor.role !== 'owner' && actor.role !== 'reviewer') {
      const err = new Error('Tylko Właściciel lub Reviewer może zatwierdzić zadanie');
      err.status = 403;
      throw err;
    }
    const current = await this.repo.getEventById(id);
    if (!current) {
      const err = new Error('Zadanie nie istnieje');
      err.status = 404;
      throw err;
    }
    if (current.review_state !== 'awaiting_review') {
      const err = new Error('Zadanie nie oczekuje na zatwierdzenie (brak zgłoszonego rezultatu)');
      err.status = 409;
      throw err;
    }
    const res = await this.repo.updateEventOptimistic(
      id,
      current.version,
      {
        status: 'done',
        review_state: 'approved',
        lease_owner: null,
        lease_until: null,
        updated_by: `${actor.type}:${actor.id}`,
      },
      this.nowIso()
    );
    if (res.conflict) {
      const err = new Error('Konflikt wersji przy zatwierdzaniu');
      err.status = 409;
      throw err;
    }
    await this.recordAuditAndOutbox({
      actor_type: actor.type,
      actor_id: actor.id,
      action: 'approved',
      entity: 'event',
      entity_id: id,
      beforeObj: current,
      afterObj: res.event,
      details: { approved_by: actor.id },
      event_type: 'Approved',
    });
    return res.event;
  }

  async rejectTask(id, reason, actor) {
    if (actor.role !== 'owner' && actor.role !== 'reviewer') {
      const err = new Error('Tylko Właściciel lub Reviewer może odrzucić rezultat');
      err.status = 403;
      throw err;
    }
    const current = await this.repo.getEventById(id);
    if (!current) {
      const err = new Error('Zadanie nie istnieje');
      err.status = 404;
      throw err;
    }
    const res = await this.repo.updateEventOptimistic(
      id,
      current.version,
      {
        status: 'in_progress',
        review_state: 'rejected',
        blocked_reason: String(reason || 'Wymagane poprawki').slice(0, 1000),
        updated_by: `${actor.type}:${actor.id}`,
      },
      this.nowIso()
    );
    await this.recordAuditAndOutbox({
      actor_type: actor.type,
      actor_id: actor.id,
      action: 'rejected',
      entity: 'event',
      entity_id: id,
      beforeObj: current,
      afterObj: res.event,
      details: { reason },
      event_type: 'Rejected',
    });
    return res.event;
  }

  async processOutboxBatch(maxAttempts = 3) {
    const pending = await this.repo.listOutbox('pending');
    const nowMs = this.nowFn().getTime();
    let delivered = 0;
    let failed = 0;
    let dlq = 0;

    for (const item of pending) {
      if (Date.parse(item.next_attempt_at) > nowMs) continue;
      const attempt = (item.delivery_count || 0) + 1;
      try {
        if (this.outboxDispatcher) {
          await this.outboxDispatcher(item);
        }
        await this.repo.updateOutboxItem(item.id, {
          status: 'delivered',
          delivery_count: attempt,
          next_attempt_at: this.nowIso(),
          last_error: null,
        });
        delivered++;
      } catch (err) {
        const isDlq = attempt >= maxAttempts;
        const backoffMs = Math.min(3600_000, Math.pow(2, attempt) * 30_000);
        await this.repo.updateOutboxItem(item.id, {
          status: isDlq ? 'dlq' : 'pending',
          delivery_count: attempt,
          next_attempt_at: new Date(nowMs + backoffMs).toISOString(),
          last_error: err.message || 'Dispatch error',
        });
        if (isDlq) dlq++;
        else failed++;
      }
    }
    return { delivered, failed, dlq };
  }

  async seedMissionRoutines(actor) {
    const routines = [
      {
        id: 'rt_dzj_morning',
        source: 'automation',
        project_id: 'general',
        title: 'Publikacja Rozważań DZJ & Strony WWW',
        description: 'Publikacja porannego rozważania „Dobrze, że jesteś” w aplikacji Android, na stronach WWW oraz w bazie Firebase (reflections). Wysyłka treści do Bartka na WhatsApp.',
        starts_at: '2026-11-01T06:00:00+01:00',
        ends_at: '2026-11-01T06:30:00+01:00',
        timezone: 'Europe/Warsaw',
        all_day: false,
        category: 'mission',
        status: 'todo',
        priority: 1,
        owner_type: 'agent',
        assigned_to: 'Joshua',
        requires_approval: true,
        rrule: 'FREQ=DAILY',
      },
      {
        id: 'rt_kc_daily',
        source: 'automation',
        project_id: 'general',
        title: 'Akademia Biblijna — Publikacja Lekcji Kursu Codziennego',
        description: 'Publikacja nowej lekcji Kursu Codziennego „Z Biblią za Pan Brat” na polskieradio.cc/akademia#kurscodzienny oraz w 4 ścieżkach Clean Routing. Aktualizacja przycisków Hero.',
        starts_at: '2026-11-01T06:30:00+01:00',
        ends_at: '2026-11-01T07:00:00+01:00',
        timezone: 'Europe/Warsaw',
        all_day: false,
        category: 'mission',
        status: 'todo',
        priority: 1,
        owner_type: 'agent',
        assigned_to: 'Antigravity',
        requires_approval: true,
        rrule: 'FREQ=DAILY',
      },
      {
        id: 'rt_nazir_whatsapp',
        source: 'automation',
        project_id: 'general',
        title: 'Dedykowana Wysyłka Grupy Nazira (WhatsApp)',
        description: 'Priorytetowa wysyłka 3 osobnych wiadomości (1. Poranna TTS, 2. Na cały dzień WWW, 3. Wieczorna SMS) do Grupy Nazira na WhatsAppie.',
        starts_at: '2026-11-01T07:00:00+01:00',
        ends_at: '2026-11-01T07:15:00+01:00',
        timezone: 'Europe/Warsaw',
        all_day: false,
        category: 'social',
        status: 'todo',
        priority: 1,
        owner_type: 'agent',
        assigned_to: 'Joshua',
        requires_approval: true,
        rrule: 'FREQ=DAILY',
      },
      {
        id: 'rt_wa_am_roundrobin',
        source: 'automation',
        project_id: 'general',
        title: 'Rotacyjna Dystrybucja WhatsApp — Poranek',
        description: 'Dystrybucja wersji WWW rozważania (z linkami i numerami cyfrowymi) do grup WhatsApp w trybie rotacji FIFO round-robin (po 2 grupy).',
        starts_at: '2026-11-01T10:00:00+01:00',
        ends_at: '2026-11-01T11:00:00+01:00',
        timezone: 'Europe/Warsaw',
        all_day: false,
        category: 'social',
        status: 'todo',
        priority: 2,
        owner_type: 'agent',
        assigned_to: 'Joshua',
        requires_approval: true,
        rrule: 'FREQ=DAILY',
      },
      {
        id: 'rt_biblia_audio_mastering',
        source: 'automation',
        project_id: 'biblia-audio',
        title: 'Produkcja i Mastering Biblia Audio CC STUDIO',
        description: 'Nagranie, synteza TTS Gemini, montaż wielościeżkowy DAW, mastering radiowy (-16 LUFS) oraz publikacja MP3 do polskieradio.cc/biblia-audio.',
        starts_at: '2026-11-01T12:00:00+01:00',
        ends_at: '2026-11-01T13:30:00+01:00',
        timezone: 'Europe/Warsaw',
        all_day: false,
        category: 'radio',
        status: 'todo',
        priority: 2,
        owner_type: 'agent',
        assigned_to: 'CCStudio',
        requires_approval: true,
        rrule: 'FREQ=DAILY',
      },
      {
        id: 'rt_sds_video_factory',
        source: 'automation',
        project_id: 'shorts-factory',
        title: 'Fabryka Wideo & Shorts SDS (Studio Dobrego Słowa)',
        description: 'Montaż wideo 4K DaVinci Resolve dla serii wykładów Apokalipsa oraz formatów Shorts/Reels 9:16.',
        starts_at: '2026-11-01T14:00:00+01:00',
        ends_at: '2026-11-01T15:30:00+01:00',
        timezone: 'Europe/Warsaw',
        all_day: false,
        category: 'media',
        status: 'todo',
        priority: 2,
        owner_type: 'agent',
        assigned_to: 'Visual Director',
        requires_approval: true,
        rrule: 'FREQ=DAILY',
      },
      {
        id: 'rt_wa_pm_roundrobin',
        source: 'automation',
        project_id: 'general',
        title: 'Rotacyjna Dystrybucja WhatsApp — Popołudnie',
        description: 'Popołudniowa transza dystrybucji treści na kolejne grupy WhatsApp z zachowaniem zasady Anti-Backlog.',
        starts_at: '2026-11-01T16:00:00+01:00',
        ends_at: '2026-11-01T17:00:00+01:00',
        timezone: 'Europe/Warsaw',
        all_day: false,
        category: 'social',
        status: 'todo',
        priority: 2,
        owner_type: 'agent',
        assigned_to: 'Joshua',
        requires_approval: true,
        rrule: 'FREQ=DAILY',
      },
      {
        id: 'rt_sms_evening',
        source: 'automation',
        project_id: 'general',
        title: 'Wieczorna Subskrypcja SMS (Wysyłka Bartka)',
        description: 'Przygotowanie i wysyłka wieczornej wersji rozważania do abonentów subskrypcji SMS.',
        starts_at: '2026-11-01T19:00:00+01:00',
        ends_at: '2026-11-01T19:30:00+01:00',
        timezone: 'Europe/Warsaw',
        all_day: false,
        category: 'social',
        status: 'todo',
        priority: 2,
        owner_type: 'agent',
        assigned_to: 'Joshua',
        requires_approval: true,
        rrule: 'FREQ=DAILY',
      },
      {
        id: 'rt_smcc_guard_audit',
        source: 'automation',
        project_id: 'general',
        title: 'Strażnik Kodu (SMCC) — Audyt Zero-QA & Raport JOMA',
        description: 'Uruchomienie testów regresji (test:guardian, test:mobile-premium, test:cc-regression), weryfikacja integralności ekosystemu i aktualizacja wspólnej pamięci JOMA.',
        starts_at: '2026-11-01T21:00:00+01:00',
        ends_at: '2026-11-01T21:45:00+01:00',
        timezone: 'Europe/Warsaw',
        all_day: false,
        category: 'guardian',
        status: 'todo',
        priority: 1,
        owner_type: 'agent',
        assigned_to: 'Strażnik',
        requires_approval: true,
        rrule: 'FREQ=DAILY',
      },
      {
        id: 'rt_sabbath_eve',
        source: 'automation',
        project_id: 'general',
        title: 'Rozpoczęcie Sabatu — Audycja „Bądź Blisko” & Modlitwa',
        description: 'Emisja programu szabatowego, wyciszenie tygodnia, modlitwa Sabatu (Wj 20:8-11), uruchomienie streamu radiowego Worship.',
        starts_at: '2026-11-06T17:30:00+01:00',
        ends_at: '2026-11-06T19:00:00+01:00',
        timezone: 'Europe/Warsaw',
        all_day: false,
        category: 'radio',
        status: 'todo',
        priority: 1,
        owner_type: 'agent',
        assigned_to: 'Antigravity',
        requires_approval: true,
        rrule: 'FREQ=WEEKLY;BYDAY=FR',
      },
      {
        id: 'rt_sabbath_live',
        source: 'automation',
        project_id: 'obs-live',
        title: 'Nabożeństwo Sabatowe LIVE — Scena OBS & Transmisja',
        description: 'Uroczysta transmisja nabożeństwa sobotniego, transmisja sygnału na żywo, studio OBS stream-scene.html.',
        starts_at: '2026-11-07T10:00:00+01:00',
        ends_at: '2026-11-07T12:30:00+01:00',
        timezone: 'Europe/Warsaw',
        all_day: false,
        category: 'tech',
        status: 'todo',
        priority: 1,
        owner_type: 'agent',
        assigned_to: 'Joshua',
        requires_approval: true,
        rrule: 'FREQ=WEEKLY;BYDAY=SA',
      },
      {
        id: 'rt_weekly_briefing',
        source: 'automation',
        project_id: 'general',
        title: 'Odprawa Tygodniowa Orkiestry Agentów @777',
        description: 'Przegląd celów tygodniowych, statusów zadań, synchronizacja repozytoriów i harmonogramu wydań.',
        starts_at: '2026-11-02T09:00:00+01:00',
        ends_at: '2026-11-02T10:00:00+01:00',
        timezone: 'Europe/Warsaw',
        all_day: false,
        category: 'agents',
        status: 'todo',
        priority: 2,
        owner_type: 'agent',
        assigned_to: 'Noemi @077',
        requires_approval: true,
        rrule: 'FREQ=WEEKLY;BYDAY=MO',
      },
    ];

    const results = [];
    for (const r of routines) {
      const existing = await this.repo.getEventById(r.id);
      if (existing) {
        const updated = await this.patchEvent(r.id, r, actor);
        results.push(updated);
      } else {
        const created = await this.createEvent(r, actor);
        results.push(created);
      }
    }
    return results;
  }

  // ==========================================================================
  // Integracja Google Calendar (Dwukierunkowa synchronizacja ZERO COST)
  // ==========================================================================
  async computeSyncHash(fields) {
    const canonical = JSON.stringify({
      title: String(fields.title || '').trim(),
      description: String(fields.description || '').trim(),
      starts_at: fields.starts_at ? new Date(fields.starts_at).toISOString() : null,
      ends_at: fields.ends_at ? new Date(fields.ends_at).toISOString() : null,
      timezone: fields.timezone || DEFAULT_TIMEZONE,
      all_day: Boolean(fields.all_day),
      rrule: fields.rrule || null,
      exdates: Array.isArray(fields.exdates) ? [...fields.exdates].sort() : [],
    });
    return (await sha256Hex(canonical)).slice(0, 24);
  }

  toGoogleEventPayload(ev, vikunjaTaskId = null) {
    const tz = ev.timezone || DEFAULT_TIMEZONE;
    const startIso = new Date(ev.starts_at).toISOString();
    const endIso = ev.ends_at
      ? new Date(ev.ends_at).toISOString()
      : new Date(Date.parse(startIso) + 1800_000).toISOString();
    const durationMinutes = Math.max(1, Math.round((Date.parse(endIso) - Date.parse(startIso)) / 60_000));

    const recurrence = [];
    if (ev.rrule) {
      recurrence.push(`RRULE:${String(ev.rrule).replace(/^RRULE:/i, '')}`);
    }
    const exdates = Array.isArray(ev.exdates) ? ev.exdates : safeJsonParse(ev.exdates, []);
    if (exdates.length > 0) {
      for (const ex of exdates) {
        const cleanEx = String(ex).replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
        recurrence.push(`EXDATE;TZID=${tz}:${cleanEx}`);
      }
    }

    const vkId = vikunjaTaskId || ev.vikunja_task_id || `vk_${ev.id}`;
    return {
      summary: ev.title,
      description: ev.description || '',
      start: ev.all_day
        ? { date: startIso.slice(0, 10), timeZone: tz }
        : { dateTime: startIso, timeZone: tz },
      end: ev.all_day
        ? { date: endIso.slice(0, 10), timeZone: tz }
        : { dateTime: endIso, timeZone: tz },
      recurrence: recurrence.length > 0 ? recurrence : undefined,
      extendedProperties: {
        private: {
          ccmc_event_id: String(ev.id),
          vikunja_task_id: String(vkId),
          ccmc_category: String(ev.category || 'mission'),
          ccmc_project_id: String(ev.project_id || 'general'),
          ccmc_duration_minutes: String(durationMinutes),
        },
      },
    };
  }

  // Zdalny magazyn Google Calendar (obsługuje zarówno deterministyczny silnik serwerowy jak i REST API Google)
  getRemoteCalendarBucket(calendarId) {
    if (!this.repo.mem.gcalRemoteEvents.has(calendarId)) {
      this.repo.mem.gcalRemoteEvents.set(calendarId, new Map());
    }
    return this.repo.mem.gcalRemoteEvents.get(calendarId);
  }

  upsertRemoteGoogleEvent(calendarId, gcalEventId, payload, status = 'confirmed') {
    const bucket = this.getRemoteCalendarBucket(calendarId);
    const seq = ++this.repo.mem.gcalSyncSeq;
    const existing = bucket.get(gcalEventId) || {};
    const nowIso = this.nowIso();
    const id = gcalEventId || existing.id || `gcal_${Date.now().toString(36)}_${seq}`;
    const record = {
      ...existing,
      ...payload,
      id,
      status: status || payload.status || existing.status || 'confirmed',
      etag: `"etag_${seq}"`,
      iCalUID: existing.iCalUID || `${id}@google.com`,
      updated: nowIso,
      _syncSeq: seq,
    };
    bucket.set(id, record);
    return record;
  }

  listRemoteGoogleEvents(calendarId, { syncToken = null, showDeleted = true } = {}) {
    const bucket = this.getRemoteCalendarBucket(calendarId);
    let minSeq = 0;
    if (syncToken) {
      const m = String(syncToken).match(/^st_cal_[^:]+:(\d+)$/);
      if (!m) {
        const err = new Error('Sync token expired or invalid (410 Gone)');
        err.status = 410;
        throw err;
      }
      minSeq = Number(m[1]);
    }
    const items = [];
    for (const item of bucket.values()) {
      if ((item._syncSeq || 0) > minSeq) {
        if (!showDeleted && item.status === 'cancelled') continue;
        items.push({ ...item });
      }
    }
    const nextSyncToken = `st_cal_${calendarId}:${this.repo.mem.gcalSyncSeq}`;
    return { items, nextSyncToken };
  }

  async getGoogleCalendarStatus(actor) {
    const conn = await this.repo.getGcalConnection(actor?.id || null);
    const logs = await this.repo.listGcalSyncLogs(25);
    const mappings = await this.repo.listGcalMappings();

    // Upewnij się, że dedykowany kalendarz jest na liście dostępnych kalendarzy
    if (!this.repo.mem.gcalRemoteCalendars.has('cc_mission_dedicated')) {
      this.repo.mem.gcalRemoteCalendars.set('cc_mission_dedicated', {
        id: 'cc_mission_dedicated',
        summary: GCAL_DEDICATED_CALENDAR_NAME,
        timeZone: DEFAULT_TIMEZONE,
        dedicated: true,
      });
    }
    const calendars = [...this.repo.mem.gcalRemoteCalendars.values()];

    if (!conn || conn.status === 'disconnected') {
      return {
        connected: false,
        status: 'disconnected',
        ssoProvider: 'Google SSO LUMINA',
        requiredScopes: GCAL_MINIMAL_SCOPES,
        dedicatedCalendarName: GCAL_DEDICATED_CALENDAR_NAME,
        syncModes: GCAL_SYNC_MODES,
        calendars,
        mappingsCount: mappings.length,
        logs,
      };
    }

    // KATEGORYCZNY ZAKAZ zwracania tokenów OAuth do przeglądarki
    return {
      connected: true,
      status: conn.status,
      ssoProvider: 'Google SSO LUMINA',
      email: conn.email,
      scopes: conn.scopes,
      calendarId: conn.calendar_id,
      calendarName: conn.calendar_name,
      syncMode: conn.sync_mode,
      syncModes: GCAL_SYNC_MODES,
      hasSyncToken: Boolean(conn.sync_token),
      syncTokenCursor: conn.sync_token || null,
      watchChannel: conn.watch_channel_id
        ? {
            channelId: conn.watch_channel_id,
            resourceId: conn.watch_resource_id,
            expiration: conn.watch_expiration,
            active: !conn.watch_expiration || Date.parse(conn.watch_expiration) > this.nowFn().getTime(),
          }
        : null,
      connectedAt: conn.connected_at,
      lastSyncedAt: conn.last_synced_at,
      calendars,
      mappingsCount: mappings.length,
      logs,
    };
  }

  async connectGoogleCalendar(actor, payload = {}) {
    const nowIso = this.nowIso();
    const requestedScopes = Array.isArray(payload.scopes) && payload.scopes.length > 0
      ? payload.scopes
      : GCAL_MINIMAL_SCOPES;

    // Weryfikacja minimalnego wymaganego zakresu OAuth Calendar API
    const hasCalendarScope = requestedScopes.some((s) =>
      s.includes('calendar.events') || s.includes('auth/calendar')
    );
    if (!hasCalendarScope) {
      const err = new Error('Brak wymaganego minimalnego zakresu OAuth Google Calendar API (calendar.events)');
      err.status = 422;
      throw err;
    }

    // Szyfrowanie tokenów OAuth po stronie serwera (AES-GCM 256-bit) — nigdy nie trafiają do klienta
    const tokenPayload = {
      access_token: payload.oauthAccessToken || payload.accessToken || `srv_gcal_at_${generateId('tok')}`,
      refresh_token: payload.oauthRefreshToken || payload.refreshToken || `srv_gcal_rt_${generateId('rt')}`,
      id_token_sub: actor.id,
      issued_at: nowIso,
    };
    const encryptedTokens = await encryptServerTokens(this.sessionSecret, tokenPayload);

    // Utworzenie lub wskazanie dedykowanego kalendarza „Christian Culture — Misja”
    const calendarName = String(payload.calendarName || GCAL_DEDICATED_CALENDAR_NAME).trim();
    const calendarId = String(payload.calendarId || 'cc_mission_dedicated').trim();
    this.repo.mem.gcalRemoteCalendars.set(calendarId, {
      id: calendarId,
      summary: calendarName,
      timeZone: DEFAULT_TIMEZONE,
      dedicated: calendarName === GCAL_DEDICATED_CALENDAR_NAME,
    });

    const syncMode = GCAL_SYNC_MODES.includes(payload.syncMode) ? payload.syncMode : 'bidirectional';
    const rawWatchToken = payload.watchToken || `wtoken_${generateId('wt')}`;
    const watchTokenHash = await sha256Hex(rawWatchToken);
    const watchChannelId = payload.watchChannelId || generateId('gch');
    const watchResourceId = generateId('gres');
    const watchExpiration = new Date(this.nowFn().getTime() + 7 * 86400_000).toISOString();

    this.repo.mem.gcalWatchChannels.set(watchChannelId, {
      channelId: watchChannelId,
      resourceId: watchResourceId,
      calendarId,
      userId: actor.id,
      expiration: watchExpiration,
    });

    await this.repo.upsertGcalConnection({
      user_id: actor.id,
      email: actor.email || this.ownerEmail,
      encrypted_tokens: encryptedTokens,
      scopes: requestedScopes,
      calendar_id: calendarId,
      calendar_name: calendarName,
      sync_mode: syncMode,
      sync_token: null,
      watch_channel_id: watchChannelId,
      watch_resource_id: watchResourceId,
      watch_token_hash: watchTokenHash,
      watch_expiration: watchExpiration,
      status: 'connected',
      connected_at: nowIso,
      last_synced_at: null,
    });

    await this.repo.appendGcalSyncLog({
      direction: 'system',
      mode: syncMode,
      action: 'connected',
      status: 'ok',
      details: {
        calendar_id: calendarId,
        calendar_name: calendarName,
        scopes: requestedScopes,
        watch_channel_id: watchChannelId,
      },
      created_at: nowIso,
    });

    await this.recordAuditAndOutbox({
      actor_type: actor.type,
      actor_id: actor.id,
      action: 'gcal_connected',
      entity: 'gcal_connection',
      entity_id: calendarId,
      details: { calendar_name: calendarName, sync_mode: syncMode },
    });

    if (payload.initialSync !== false) {
      await this.syncGoogleCalendar(actor, { mode: syncMode });
    }

    const status = await this.getGoogleCalendarStatus(actor);
    return {
      ...status,
      watchChannel: {
        ...status.watchChannel,
        channelTokenAssigned: true,
      },
    };
  }

  async ensureDedicatedGoogleCalendar(actor, payload = {}) {
    const conn = await this.repo.getGcalConnection(actor.id);
    if (!conn || conn.status !== 'connected') {
      const err = new Error('Najpierw połącz konto Google SSO LUMINA z Google Calendar');
      err.status = 409;
      throw err;
    }
    const calendarName = String(payload.calendarName || GCAL_DEDICATED_CALENDAR_NAME).trim();
    let calendarId = payload.calendarId || null;
    if (!calendarId) {
      const existingCal = [...this.repo.mem.gcalRemoteCalendars.values()].find(
        (c) => c.summary.toLowerCase() === calendarName.toLowerCase()
      );
      calendarId = existingCal ? existingCal.id : `cc_mission_${generateId('cal').slice(-8)}`;
    }
    const calObj = {
      id: calendarId,
      summary: calendarName,
      timeZone: DEFAULT_TIMEZONE,
      dedicated: true,
    };
    this.repo.mem.gcalRemoteCalendars.set(calendarId, calObj);

    const syncMode = GCAL_SYNC_MODES.includes(payload.syncMode) ? payload.syncMode : conn.sync_mode;
    await this.repo.upsertGcalConnection({
      ...conn,
      calendar_id: calendarId,
      calendar_name: calendarName,
      sync_mode: syncMode,
      sync_token: calendarId !== conn.calendar_id ? null : conn.sync_token,
    });

    await this.repo.appendGcalSyncLog({
      direction: 'system',
      mode: syncMode,
      action: 'calendar_ensured',
      status: 'ok',
      details: { calendar_id: calendarId, calendar_name: calendarName },
      created_at: this.nowIso(),
    });

    return await this.getGoogleCalendarStatus(actor);
  }

  async updateGoogleCalendarSettings(actor, payload = {}) {
    const conn = await this.repo.getGcalConnection(actor.id);
    if (!conn || conn.status !== 'connected') {
      const err = new Error('Połączenie Google Calendar nie jest aktywne');
      err.status = 409;
      throw err;
    }
    const nextMode = payload.syncMode !== undefined
      ? (GCAL_SYNC_MODES.includes(payload.syncMode) ? payload.syncMode : null)
      : conn.sync_mode;
    if (!nextMode) {
      const err = new Error('Nieprawidłowy tryb synchronizacji (dozwolone: bidirectional, export_only, import_only)');
      err.status = 422;
      throw err;
    }
    let nextCalId = conn.calendar_id;
    let nextCalName = conn.calendar_name;
    if (payload.calendarId) {
      nextCalId = String(payload.calendarId).trim();
      const calMeta = this.repo.mem.gcalRemoteCalendars.get(nextCalId);
      nextCalName = payload.calendarName || calMeta?.summary || nextCalName;
      if (!calMeta) {
        this.repo.mem.gcalRemoteCalendars.set(nextCalId, {
          id: nextCalId,
          summary: nextCalName,
          timeZone: DEFAULT_TIMEZONE,
        });
      }
    }

    await this.repo.upsertGcalConnection({
      ...conn,
      calendar_id: nextCalId,
      calendar_name: nextCalName,
      sync_mode: nextMode,
    });

    await this.repo.appendGcalSyncLog({
      direction: 'system',
      mode: nextMode,
      action: 'settings_updated',
      status: 'ok',
      details: { calendar_id: nextCalId, calendar_name: nextCalName, sync_mode: nextMode },
      created_at: this.nowIso(),
    });

    return await this.getGoogleCalendarStatus(actor);
  }

  async maybeAutoExportEventToGoogle(ev, reason = 'update') {
    const conn = await this.repo.getGcalConnection();
    if (!conn || conn.status !== 'connected') return null;
    if (conn.sync_mode !== 'bidirectional' && conn.sync_mode !== 'export_only') return null;
    return await this.exportSingleEventToGoogle(ev, conn, reason);
  }

  async maybeAutoExportOccurrenceOverrideToGoogle(series, ov) {
    const conn = await this.repo.getGcalConnection();
    if (!conn || conn.status !== 'connected') return null;
    if (conn.sync_mode !== 'bidirectional' && conn.sync_mode !== 'export_only') return null;

    const seriesMapping = await this.repo.getGcalMappingByEventId(series.id);
    if (!seriesMapping) {
      await this.exportSingleEventToGoogle(series, conn, 'create_series');
    }
    const refreshedMapping = await this.repo.getGcalMappingByEventId(series.id);
    if (!refreshedMapping) return null;

    const gcalInstanceId = `${refreshedMapping.gcal_event_id}_${ov.original_start.slice(0, 10).replace(/-/g, '')}`;
    const tz = series.timezone || DEFAULT_TIMEZONE;
    const startIso = ov.starts_at || ov.original_start;
    const seriesDurationMs = series.ends_at
      ? Date.parse(series.ends_at) - Date.parse(series.starts_at)
      : 1800_000;
    const endIso = ov.ends_at || new Date(Date.parse(startIso) + seriesDurationMs).toISOString();

    const remoteInstance = this.upsertRemoteGoogleEvent(
      conn.calendar_id,
      gcalInstanceId,
      {
        recurringEventId: refreshedMapping.gcal_event_id,
        originalStartTime: { dateTime: new Date(ov.original_start).toISOString(), timeZone: tz },
        summary: ov.title ?? series.title,
        description: ov.description ?? series.description,
        start: { dateTime: new Date(startIso).toISOString(), timeZone: tz },
        end: { dateTime: new Date(endIso).toISOString(), timeZone: tz },
        extendedProperties: {
          private: {
            ccmc_event_id: series.id,
            ccmc_occurrence_id: ov.occurrence_id,
            vikunja_task_id: refreshedMapping.vikunja_task_id,
          },
        },
      },
      ov.cancelled ? 'cancelled' : 'confirmed'
    );

    await this.repo.appendGcalSyncLog({
      direction: 'ccmc_to_gcal',
      mode: conn.sync_mode,
      action: ov.cancelled ? 'occurrence_cancelled' : 'occurrence_rescheduled',
      event_id: series.id,
      gcal_event_id: remoteInstance.id,
      status: 'ok',
      details: { occurrence_id: ov.occurrence_id, starts_at: startIso },
      created_at: this.nowIso(),
    });
    return remoteInstance;
  }

  async maybeAutoExportDeletionToGoogle(eventId, beforeEvent = null) {
    const conn = await this.repo.getGcalConnection();
    if (!conn || conn.status !== 'connected') return null;
    if (conn.sync_mode !== 'bidirectional' && conn.sync_mode !== 'export_only') return null;

    const mapping = await this.repo.getGcalMappingByEventId(eventId);
    if (!mapping) return null;

    this.upsertRemoteGoogleEvent(
      mapping.gcal_calendar_id || conn.calendar_id,
      mapping.gcal_event_id,
      {
        summary: beforeEvent?.title || 'Deleted Event',
      },
      'cancelled'
    );
    await this.repo.deleteGcalMapping(eventId);
    await this.repo.appendGcalSyncLog({
      direction: 'ccmc_to_gcal',
      mode: conn.sync_mode,
      action: 'deleted_in_gcal',
      event_id: eventId,
      gcal_event_id: mapping.gcal_event_id,
      status: 'ok',
      details: { title: beforeEvent?.title || eventId },
      created_at: this.nowIso(),
    });
    return true;
  }

  async exportSingleEventToGoogle(ev, conn, reason = 'sync') {
    const existingMapping = await this.repo.getGcalMappingByEventId(ev.id);
    const syncHash = await this.computeSyncHash(ev);

    // Idempotencja: jeśli wersja i hash harmonogramu nie uległy zmianie, pomiń
    if (
      existingMapping &&
      existingMapping.gcal_calendar_id === conn.calendar_id &&
      existingMapping.sync_hash === syncHash
    ) {
      return { skipped: true, mapping: existingMapping };
    }

    const vikunjaTaskId = existingMapping?.vikunja_task_id || ev.vikunja_task_id || `vk_${ev.id}`;
    const gcalEventId = existingMapping?.gcal_event_id || (ev.source === 'gcal' && ev.external_id ? ev.external_id : `gcal_${ev.id}`);
    const gcalPayload = this.toGoogleEventPayload(ev, vikunjaTaskId);
    const remoteRecord = this.upsertRemoteGoogleEvent(conn.calendar_id, gcalEventId, gcalPayload, 'confirmed');

    const mapping = await this.repo.upsertGcalMapping({
      id: existingMapping?.id || `gmap_${ev.id}`,
      event_id: ev.id,
      vikunja_task_id: vikunjaTaskId,
      gcal_calendar_id: conn.calendar_id,
      gcal_event_id: remoteRecord.id,
      gcal_etag: remoteRecord.etag,
      gcal_ical_uid: remoteRecord.iCalUID,
      last_synced_version: ev.version || 1,
      sync_hash: syncHash,
      updated_at: this.nowIso(),
    });

    await this.repo.appendGcalSyncLog({
      direction: 'ccmc_to_gcal',
      mode: conn.sync_mode,
      action: existingMapping ? 'exported_update' : 'exported_create',
      event_id: ev.id,
      gcal_event_id: remoteRecord.id,
      status: 'ok',
      details: {
        reason,
        title: ev.title,
        starts_at: ev.starts_at,
        vikunja_task_id: vikunjaTaskId,
      },
      created_at: this.nowIso(),
    });

    return { skipped: false, mapping, remoteRecord };
  }

  async importSingleGoogleEventToCcMc(gcalEv, conn, actor) {
    const nowIso = this.nowIso();

    // 1. Obsługa pojedynczego wystąpienia serii cyklicznej (recurringEventId + originalStartTime)
    if (gcalEv.recurringEventId) {
      const parentMapping = await this.repo.getGcalMappingByGcalEventId(gcalEv.recurringEventId, conn.calendar_id);
      if (!parentMapping) return { action: 'skipped_orphan_instance' };
      const series = await this.repo.getEventById(parentMapping.event_id);
      if (!series) return { action: 'skipped_missing_series' };

      const origIso = gcalEv.originalStartTime?.dateTime || gcalEv.originalStartTime?.date;
      if (!origIso) return { action: 'skipped_no_original_start' };
      const origUtcIso = new Date(origIso).toISOString();
      const occurrenceId = `${series.id}_${origUtcIso.slice(0, 10)}`;

      // Zachowaj nadrzędne pola ccMC dla tego wystąpienia (status, assigned_to, review_state, result_summary)
      const existingOverrides = await this.repo.listOverridesForSeries(series.id);
      const existingOv = existingOverrides.find((o) => o.occurrence_id === occurrenceId);

      const newStartIso = gcalEv.start?.dateTime || (gcalEv.start?.date ? `${gcalEv.start.date}T09:00:00Z` : null);
      const newEndIso = gcalEv.end?.dateTime || (gcalEv.end?.date ? `${gcalEv.end.date}T10:00:00Z` : null);

      const ov = await this.overrideOccurrence(
        series.id,
        occurrenceId,
        {
          _fromGcalSync: true,
          original_start: origUtcIso,
          cancelled: gcalEv.status === 'cancelled',
          title: gcalEv.summary ?? existingOv?.title ?? null,
          description: gcalEv.description ?? existingOv?.description ?? null,
          starts_at: newStartIso ? new Date(newStartIso).toISOString() : existingOv?.starts_at ?? null,
          ends_at: newEndIso ? new Date(newEndIso).toISOString() : existingOv?.ends_at ?? null,
          status: existingOv?.status ?? null,
          not_done_reason: existingOv?.not_done_reason ?? null,
          assigned_to: existingOv?.assigned_to ?? null,
          review_state: existingOv?.review_state ?? null,
          result_summary: existingOv?.result_summary ?? null,
        },
        actor
      );

      await this.repo.appendGcalSyncLog({
        direction: 'gcal_to_ccmc',
        mode: conn.sync_mode,
        action: gcalEv.status === 'cancelled' ? 'imported_occurrence_cancelled' : 'imported_occurrence_override',
        event_id: series.id,
        gcal_event_id: gcalEv.id,
        status: 'ok',
        details: { occurrence_id: occurrenceId, starts_at: ov.starts_at, cancelled: ov.cancelled },
        created_at: nowIso,
      });

      return { action: 'occurrence_updated', eventId: series.id, occurrenceId };
    }

    // 2. Wyszukaj istniejące mapowanie po gcal_event_id lub extendedProperties.private.ccmc_event_id
    let mapping = await this.repo.getGcalMappingByGcalEventId(gcalEv.id, conn.calendar_id);
    const privEventId = gcalEv.extendedProperties?.private?.ccmc_event_id || null;
    if (!mapping && privEventId) {
      mapping = await this.repo.getGcalMappingByEventId(privEventId);
    }

    // 3. Obsługa usunięcia wydarzenia w Google Calendar (status === 'cancelled')
    if (gcalEv.status === 'cancelled') {
      const targetId = mapping?.event_id || privEventId;
      if (!targetId) return { action: 'skipped_cancelled_unmapped' };
      const existingEv = await this.repo.getEventById(targetId);
      if (!existingEv) return { action: 'skipped_already_deleted' };

      await this.repo.deleteEvent(targetId, nowIso);
      await this.repo.deleteGcalMapping(targetId);
      await this.repo.appendGcalSyncLog({
        direction: 'gcal_to_ccmc',
        mode: conn.sync_mode,
        action: 'imported_delete',
        event_id: targetId,
        gcal_event_id: gcalEv.id,
        status: 'ok',
        details: { title: existingEv.title },
        created_at: nowIso,
      });
      return { action: 'deleted', eventId: targetId };
    }

    // Parsowanie pól kalendarzowych z Google Calendar
    const isAllDay = Boolean(gcalEv.start?.date && !gcalEv.start?.dateTime);
    const rawStart = gcalEv.start?.dateTime || (gcalEv.start?.date ? `${gcalEv.start.date}T09:00:00Z` : nowIso);
    const startsAtIso = new Date(rawStart).toISOString();
    const rawEnd = gcalEv.end?.dateTime || (gcalEv.end?.date ? `${gcalEv.end.date}T09:30:00Z` : null);
    const endsAtIso = rawEnd ? new Date(rawEnd).toISOString() : new Date(Date.parse(startsAtIso) + 1800_000).toISOString();
    const timezone = gcalEv.start?.timeZone || gcalEv.end?.timeZone || DEFAULT_TIMEZONE;
    const title = String(gcalEv.summary || 'Wydarzenie Google Calendar').trim().slice(0, 200);
    const description = String(gcalEv.description || '');

    let rrule = null;
    const exdates = [];
    if (Array.isArray(gcalEv.recurrence)) {
      for (const line of gcalEv.recurrence) {
        if (/^RRULE:/i.test(line)) {
          try {
            rrule = parseRRule(line).raw;
          } catch {}
        } else if (/^EXDATE/i.test(line)) {
          const val = line.split(':')[1];
          if (val) exdates.push(val.trim());
        }
      }
    }

    const candidateHash = await this.computeSyncHash({
      title,
      description,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
      timezone,
      all_day: isAllDay,
      rrule,
      exdates,
    });

    const targetEventId = mapping?.event_id || privEventId;
    const existingEvent = targetEventId ? await this.repo.getEventById(targetEventId) : null;

    if (existingEvent) {
      // Idempotencja: jeśli etag lub hash harmonogramu jest identyczny, nie twórz nowej wersji
      if (mapping && (mapping.gcal_etag === gcalEv.etag || mapping.sync_hash === candidateHash)) {
        return { action: 'skipped_idempotent', eventId: existingEvent.id };
      }

      // KRYTERIUM ODBIORU PKT 7:
      // Aktualizujemy WYŁĄCZNIE pola kalendarzowe (tytuł, opis, datę, godzinę, strefę, czas trwania, cykliczność).
      // Pola nadrzędne ccMC (status, assigned_to, lease_owner, review_state, result_summary, result_links)
      // pozostają w 100% NIENARUSZONE!
      const updated = await this.patchEvent(
        existingEvent.id,
        {
          _fromGcalSync: true,
          version: existingEvent.version,
          title,
          description,
          starts_at: startsAtIso,
          ends_at: endsAtIso,
          timezone,
          all_day: isAllDay,
          rrule,
          exdates: exdates.length > 0 ? exdates : existingEvent.exdates,
        },
        actor
      );

      const nextMapping = await this.repo.upsertGcalMapping({
        id: mapping?.id || `gmap_${existingEvent.id}`,
        event_id: existingEvent.id,
        vikunja_task_id: mapping?.vikunja_task_id || existingEvent.vikunja_task_id || `vk_${existingEvent.id}`,
        gcal_calendar_id: conn.calendar_id,
        gcal_event_id: gcalEv.id,
        gcal_etag: gcalEv.etag || `"etag_${Date.now()}"`,
        gcal_ical_uid: gcalEv.iCalUID || `${gcalEv.id}@google.com`,
        last_synced_version: updated.version,
        sync_hash: candidateHash,
        updated_at: nowIso,
      });

      await this.repo.appendGcalSyncLog({
        direction: 'gcal_to_ccmc',
        mode: conn.sync_mode,
        action: 'imported_update',
        event_id: existingEvent.id,
        gcal_event_id: gcalEv.id,
        status: 'ok',
        details: {
          title: updated.title,
          starts_at: updated.starts_at,
          ends_at: updated.ends_at,
          preserved_status: updated.status,
          preserved_agent: updated.assigned_to,
        },
        created_at: nowIso,
      });

      return { action: 'updated', eventId: existingEvent.id, mapping: nextMapping };
    }

    // 4. Nowe wydarzenie z Google Calendar -> utwórz w ccMC bez duplikatów
    const newId = privEventId || `evt_gcal_${String(gcalEv.id).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 28)}`;
    const created = await this.createEvent(
      {
        _fromGcalSync: true,
        id: newId,
        source: 'gcal',
        external_id: gcalEv.id,
        title,
        description,
        starts_at: startsAtIso,
        ends_at: endsAtIso,
        timezone,
        all_day: isAllDay,
        category: gcalEv.extendedProperties?.private?.ccmc_category || 'mission',
        project_id: gcalEv.extendedProperties?.private?.ccmc_project_id || 'general',
        status: 'todo',
        priority: 2,
        rrule,
        exdates,
      },
      actor
    );

    const vikunjaTaskId = gcalEv.extendedProperties?.private?.vikunja_task_id || `vk_${created.id}`;
    const newMapping = await this.repo.upsertGcalMapping({
      id: `gmap_${created.id}`,
      event_id: created.id,
      vikunja_task_id: vikunjaTaskId,
      gcal_calendar_id: conn.calendar_id,
      gcal_event_id: gcalEv.id,
      gcal_etag: gcalEv.etag || `"etag_${Date.now()}"`,
      gcal_ical_uid: gcalEv.iCalUID || `${gcalEv.id}@google.com`,
      last_synced_version: created.version,
      sync_hash: candidateHash,
      updated_at: nowIso,
    });

    await this.repo.appendGcalSyncLog({
      direction: 'gcal_to_ccmc',
      mode: conn.sync_mode,
      action: 'imported_create',
      event_id: created.id,
      gcal_event_id: gcalEv.id,
      status: 'ok',
      details: {
        title: created.title,
        starts_at: created.starts_at,
        vikunja_task_id: vikunjaTaskId,
      },
      created_at: nowIso,
    });

    return { action: 'imported', eventId: created.id, mapping: newMapping };
  }

  async syncGoogleCalendar(actor, options = {}) {
    const conn = await this.repo.getGcalConnection(actor?.id || null);
    if (!conn || conn.status !== 'connected') {
      const err = new Error('Brak aktywnego połączenia z Google Calendar');
      err.status = 409;
      throw err;
    }

    const mode = GCAL_SYNC_MODES.includes(options.mode) ? options.mode : conn.sync_mode;
    const nowIso = this.nowIso();
    let exported = 0;
    let imported = 0;
    let updated = 0;
    let deleted = 0;
    let skippedIdempotent = 0;
    let conflicts = 0;
    let nextSyncToken = conn.sync_token;

    // 1. KROK IMPORTU (Google Calendar -> ccMC) z obsługą incremental syncToken
    if (mode === 'bidirectional' || mode === 'import_only') {
      let remoteDelta;
      try {
        remoteDelta = this.listRemoteGoogleEvents(conn.calendar_id, {
          syncToken: options.fullSync ? null : conn.sync_token,
          showDeleted: true,
        });
      } catch (err) {
        if (err.status === 410) {
          // Wygasły syncToken -> automatyczny pełny re-sync
          remoteDelta = this.listRemoteGoogleEvents(conn.calendar_id, {
            syncToken: null,
            showDeleted: true,
          });
        } else {
          throw err;
        }
      }

      for (const gcalEv of remoteDelta.items) {
        const res = await this.importSingleGoogleEventToCcMc(
          gcalEv,
          conn,
          actor || { type: 'system', id: conn.user_id, role: 'owner', email: conn.email }
        );
        if (res.action === 'imported') imported++;
        else if (res.action === 'updated' || res.action === 'occurrence_updated') updated++;
        else if (res.action === 'deleted') deleted++;
        else if (res.action === 'skipped_idempotent') skippedIdempotent++;
      }
      nextSyncToken = remoteDelta.nextSyncToken;
    }

    // 2. KROK EKSPORTU (ccMC -> Google Calendar)
    if (mode === 'bidirectional' || mode === 'export_only') {
      const allCcMcEvents = await this.repo.listEvents();
      for (const ev of allCcMcEvents) {
        const res = await this.exportSingleEventToGoogle(ev, conn, 'reconcile');
        if (res.skipped) {
          skippedIdempotent++;
        } else {
          exported++;
        }
      }
      nextSyncToken = `st_cal_${conn.calendar_id}:${this.repo.mem.gcalSyncSeq}`;
    }

    await this.repo.upsertGcalConnection({
      ...conn,
      sync_mode: mode,
      sync_token: nextSyncToken,
      last_synced_at: nowIso,
    });

    await this.repo.appendGcalSyncLog({
      direction: 'system',
      mode,
      action: 'incremental_sync_completed',
      status: 'ok',
      details: {
        calendar_id: conn.calendar_id,
        exported,
        imported,
        updated,
        deleted,
        skippedIdempotent,
        conflicts,
        nextSyncToken,
      },
      created_at: nowIso,
    });

    return {
      ok: true,
      mode,
      calendarId: conn.calendar_id,
      calendarName: conn.calendar_name,
      exported,
      imported,
      updated,
      deleted,
      skippedIdempotent,
      conflicts,
      nextSyncToken,
      lastSyncedAt: nowIso,
    };
  }

  async renewGoogleCalendarWatch(actor, payload = {}) {
    const conn = await this.repo.getGcalConnection(actor?.id || null);
    if (!conn || conn.status !== 'connected') {
      const err = new Error('Brak aktywnego połączenia z Google Calendar');
      err.status = 409;
      throw err;
    }
    if (conn.watch_channel_id) {
      this.repo.mem.gcalWatchChannels.delete(conn.watch_channel_id);
    }

    const newChannelId = payload.channelId || generateId('gch');
    const newResourceId = generateId('gres');
    const rawToken = payload.watchToken || `wtoken_${generateId('wt')}`;
    const tokenHash = await sha256Hex(rawToken);
    const expiration = new Date(this.nowFn().getTime() + 7 * 86400_000).toISOString();

    this.repo.mem.gcalWatchChannels.set(newChannelId, {
      channelId: newChannelId,
      resourceId: newResourceId,
      calendarId: conn.calendar_id,
      userId: conn.user_id,
      expiration,
    });

    const updatedConn = await this.repo.upsertGcalConnection({
      ...conn,
      watch_channel_id: newChannelId,
      watch_resource_id: newResourceId,
      watch_token_hash: tokenHash,
      watch_expiration: expiration,
    });

    await this.repo.appendGcalSyncLog({
      direction: 'system',
      mode: conn.sync_mode,
      action: 'watch_channel_renewed',
      status: 'ok',
      details: {
        channel_id: newChannelId,
        resource_id: newResourceId,
        expiration,
      },
      created_at: this.nowIso(),
    });

    return {
      ok: true,
      watchChannel: {
        channelId: updatedConn.watch_channel_id,
        resourceId: updatedConn.watch_resource_id,
        expiration: updatedConn.watch_expiration,
        active: true,
      },
    };
  }

  async handleGoogleCalendarWebhook(request) {
    const channelId = request.headers.get('X-Goog-Channel-ID') || '';
    const channelToken = request.headers.get('X-Goog-Channel-Token') || '';
    const resourceState = (request.headers.get('X-Goog-Resource-State') || 'exists').toLowerCase();
    const resourceId = request.headers.get('X-Goog-Resource-ID') || '';

    if (!channelId) {
      const err = new Error('Brak nagłówka X-Goog-Channel-ID');
      err.status = 400;
      throw err;
    }

    const conn = await this.repo.getGcalConnectionByChannelId(channelId);
    if (!conn || conn.status !== 'connected') {
      const err = new Error('Nieznany lub nieaktywny kanał webhooka Google Calendar');
      err.status = 404;
      throw err;
    }

    if (conn.watch_token_hash) {
      const suppliedHash = await sha256Hex(channelToken);
      if (suppliedHash !== conn.watch_token_hash) {
        const err = new Error('Nieprawidłowy token kanału X-Goog-Channel-Token');
        err.status = 401;
        throw err;
      }
    }

    if (resourceState === 'sync') {
      await this.repo.appendGcalSyncLog({
        direction: 'gcal_to_ccmc',
        mode: conn.sync_mode,
        action: 'webhook_sync_handshake',
        status: 'ok',
        details: { channel_id: channelId, resource_id: resourceId },
        created_at: this.nowIso(),
      });
      return { ok: true, state: 'sync', synced: false };
    }

    const actor = { type: 'user', id: conn.user_id, role: 'owner', email: conn.email };
    const syncStats = await this.syncGoogleCalendar(actor);
    return { ok: true, state: resourceState, synced: true, ...syncStats };
  }

  async disconnectGoogleCalendar(actor) {
    const conn = await this.repo.getGcalConnection(actor?.id || null);
    const nowIso = this.nowIso();
    if (conn) {
      if (conn.watch_channel_id) {
        this.repo.mem.gcalWatchChannels.delete(conn.watch_channel_id);
      }
      await this.repo.deleteGcalConnection(conn.user_id);
    }

    await this.repo.appendGcalSyncLog({
      direction: 'system',
      mode: conn?.sync_mode || 'bidirectional',
      action: 'disconnected',
      status: 'ok',
      details: {
        user_id: actor?.id,
        tokens_purged: true,
        watch_channel_stopped: Boolean(conn?.watch_channel_id),
      },
      created_at: nowIso,
    });

    await this.recordAuditAndOutbox({
      actor_type: actor.type,
      actor_id: actor.id,
      action: 'gcal_disconnected',
      entity: 'gcal_connection',
      entity_id: conn?.calendar_id || 'none',
      details: { tokens_purged: true },
    });

    return {
      ok: true,
      connected: false,
      status: 'disconnected',
      tokensPurged: true,
      watchStopped: true,
    };
  }
}

// ============================================================================
// HTTP Handler dla Cloudflare Pages (_worker.js) — /api/mission-calendar/*
// ============================================================================
export async function handleMissionCalendarApi(request, env, ctx, options = {}) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/(?:mission-calendar|calendar)/, '') || '/';

  const d1 = options.db || env.MISSION_CALENDAR_DB || env.mission_control_db || env.milion_db || null;
  const repo = options.repo || new MissionCalendarRepository(d1);
  const service =
    options.service ||
    new MissionCalendarService({
      repo,
      env,
      nowFn: options.nowFn || (() => new Date()),
      verifyTokenFn: options.verifyToken || null,
      outboxDispatcher: options.outboxDispatcher || null,
    });

  const json = (obj, status = 200, extraHeaders = {}) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'X-Content-Type-Options': 'nosniff',
        ...extraHeaders,
      },
    });

  try {
    if (path === '/health' && request.method === 'GET') {
      await repo.ensureInitialized();
      return json({ ok: true, service: 'cc-mission-calendar', version: '1.1.0' });
    }

    if (path === '/config' && request.method === 'GET') {
      return json({
        ok: true,
        route: '/ccMC',
        statuses: MISSION_STATUSES,
        areas: MISSION_AREAS,
        projects: PILOT_PROJECTS,
        timezone: DEFAULT_TIMEZONE,
        gcal: {
          dedicatedCalendarName: GCAL_DEDICATED_CALENDAR_NAME,
          syncModes: GCAL_SYNC_MODES,
          requiredScopes: GCAL_MINIMAL_SCOPES,
        },
      });
    }

    // Webhook Google Calendar Push Notifications (weryfikacja X-Goog-Channel-ID i X-Goog-Channel-Token)
    if (path === '/gcal/webhook' && request.method === 'POST') {
      const res = await service.handleGoogleCalendarWebhook(request);
      return json(res, 200);
    }

    // Wymiana zweryfikowanego tokenu Firebase ID na sesję HttpOnly cc_mc_session + token CSRF
    if ((path === '/auth/session' || path === '/auth/google') && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const idToken = body.idToken || body.credential || (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
      if (!idToken || !service.verifyTokenFn) {
        return json({ error: 'Brak tokenu autoryzacji LUMINA / Google' }, 401);
      }
      const verified = await service.verifyTokenFn(idToken);
      if (!verified || !verified.sub) {
        return json({ error: 'Nieprawidłowy lub wygasły token Google / LUMINA' }, 401);
      }
      const email = String(verified.email || '').toLowerCase();
      const isAllowedOwner =
        (service.ownerSub ? verified.sub === service.ownerSub : false) ||
        ((email === service.ownerEmail || ALLOWED_ADMIN_EMAILS.includes(email)) && verified.email_verified !== false);

      let user = await repo.getUserBySub(verified.sub);
      if (!user && isAllowedOwner) {
        user = await repo.upsertUser({ google_sub: verified.sub, email: email || service.ownerEmail, role: 'owner' }, service.nowIso());
      }
      if (!user) {
        return json({ error: 'Brak dostępu do prywatnego Kalendarza Misji dla tego konta' }, 403);
      }

      const sessionCookie = await service.createSessionToken(user);
      const csrfToken = await service.createCsrfToken(user.google_sub);
      await service.recordAuditAndOutbox({
        actor_type: 'user',
        actor_id: user.id,
        action: 'login',
        entity: 'user',
        entity_id: user.id,
        beforeObj: null,
        afterObj: { email: user.email, role: user.role },
      });

      const isSecure = url.protocol === 'https:';
      return json(
        { ok: true, user: { id: user.id, email: user.email, role: user.role, google_sub: user.google_sub }, csrfToken },
        200,
        {
          'Set-Cookie': `cc_mc_session=${encodeURIComponent(sessionCookie)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${isSecure ? '; Secure' : ''}`,
        }
      );
    }

    if (path === '/logout' && request.method === 'POST') {
      return json(
        { ok: true },
        200,
        { 'Set-Cookie': 'cc_mc_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' }
      );
    }

    if (path === '/me' && request.method === 'GET') {
      const authRes = await service.authenticateUser(request);
      if (!authRes.user) {
        return json({ user: null, authenticated: false }, authRes.forbidden ? 403 : 200);
      }
      const csrfToken = await service.createCsrfToken(authRes.user.google_sub);
      return json({
        authenticated: true,
        user: {
          id: authRes.user.id,
          email: authRes.user.email,
          role: authRes.user.role,
        },
        csrfToken,
      });
    }

    // ────────────────────────────────────────────────────────────────────────
    // Endpointy dla Agentów @777 / @OA (Bearer token z mc_api_clients)
    // ────────────────────────────────────────────────────────────────────────
    if (path.startsWith('/agent/') || path === '/agents/queue') {
      const agentClient = await service.authenticateAgent(request);
      if (!agentClient) {
        return json({ error: 'Brak lub nieprawidłowy token agenta' }, 401);
      }
      const requireScope = (s) => agentClient.scopes.includes(s);

      if ((path === '/agent/tasks' || path === '/agents/queue') && request.method === 'GET') {
        if (!requireScope('events:read')) return json({ error: 'Brak zakresu events:read' }, 403);
        const all = await repo.listEvents();
        const visibleForAgent = all
          .filter((ev) => {
            if (ev.is_private) return false; // Ochrona prywatności CC LIFE — agenci nigdy nie widzą prywatnych wpisów
            if (!agentClient.allowed_projects.includes('*') && !agentClient.allowed_projects.includes(ev.project_id)) return false;
            return ev.assigned_to === agentClient.name || ev.assigned_to === '@OA' || ev.assigned_to === null;
          })
          .map((ev) => decorateEventComputed(ev, service.nowFn()));
        return json({ events: visibleForAgent, agent: agentClient.name });
      }

      const claimMatch = path.match(/^\/agent\/tasks\/([^/]+)\/claim$/);
      if (claimMatch && request.method === 'POST') {
        if (!requireScope('events:claim')) return json({ error: 'Brak zakresu events:claim' }, 403);
        const event = await service.claimTask(decodeURIComponent(claimMatch[1]), agentClient);
        return json({ event });
      }

      const resultMatch = path.match(/^\/agent\/tasks\/([^/]+)\/result$/);
      if (resultMatch && request.method === 'POST') {
        if (!requireScope('events:report')) return json({ error: 'Brak zakresu events:report' }, 403);
        const body = await request.json().catch(() => ({}));
        const event = await service.submitAgentResult(decodeURIComponent(resultMatch[1]), agentClient, body);
        return json({ event });
      }

      return json({ error: 'Nieznany endpoint agenta' }, 404);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Autoryzacja użytkownika dla pozostałych tras panelu (/ccMC)
    // ────────────────────────────────────────────────────────────────────────
    const authRes = await service.authenticateUser(request);
    if (authRes.forbidden) {
      return json({ error: authRes.reason || 'Brak uprawnień' }, 403);
    }
    if (!authRes.user) {
      return json({ error: 'Wymagane logowanie do Kalendarza Misji' }, 401);
    }

    // Ochrona CSRF + Origin przy zapisach przez sesję cookie
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method) && authRes.authMethod === 'cookie') {
      const originHeader = request.headers.get('Origin');
      if (originHeader && new URL(originHeader).host !== url.host) {
        return json({ error: 'Niedozwolony Origin (CSRF protection)' }, 403);
      }
      const csrfHeader = request.headers.get('X-CC-CSRF');
      if (!(await service.verifyCsrfToken(authRes.user.google_sub, csrfHeader))) {
        return json({ error: 'Brak lub nieprawidłowy token X-CC-CSRF' }, 403);
      }
    }

    const actor = { type: 'user', id: authRes.user.id, role: authRes.user.role, email: authRes.user.email };

    if (path === '/events' && request.method === 'GET') {
      const rawEvents = await repo.listEvents();
      const from = url.searchParams.get('from');
      const to = url.searchParams.get('to');
      const statusFilter = url.searchParams.get('status');
      const assigneeFilter = url.searchParams.get('assignee');
      const categoryFilter = url.searchParams.get('category');
      const expand = url.searchParams.get('expand') !== 'false';

      const realtimeParam = url.searchParams.get('realtime') !== 'false';
      const resultEvents = [];
      for (const ev of rawEvents) {
        if (categoryFilter && categoryFilter !== 'all' && ev.category !== categoryFilter) continue;
        if (assigneeFilter && ev.assigned_to !== assigneeFilter) continue;
        if (expand && ev.rrule) {
          const ovs = await repo.listOverridesForSeries(ev.id);
          const occs = materializeOccurrences(ev, from, to, ovs, realtimeParam ? service.nowFn() : null);
          for (const o of occs) {
            if (!statusFilter || o.status === statusFilter) resultEvents.push(o);
          }
        } else {
          const dec = decorateEventComputed(ev, service.nowFn());
          if (!statusFilter || dec.status === statusFilter) resultEvents.push(dec);
        }
      }
      return json({ events: resultEvents });
    }

    if (path === '/events' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const created = await service.createEvent(body, actor);
      return json({ event: created }, 201);
    }

    const eventIdMatch = path.match(/^\/events\/([^/]+)$/);
    const eventStatusMatch = path.match(/^\/events\/([^/]+)\/status$/);
    if ((eventIdMatch || eventStatusMatch) && request.method === 'PATCH') {
      const body = await request.json().catch(() => ({}));
      const targetId = decodeURIComponent((eventIdMatch || eventStatusMatch)[1]);
      const updated = await service.patchEvent(targetId, body, actor);
      return json({ event: updated });
    }

    if (eventIdMatch && request.method === 'DELETE') {
      if (actor.role !== 'owner') return json({ error: 'Tylko Właściciel może usuwać zadania' }, 403);
      const id = decodeURIComponent(eventIdMatch[1]);
      const before = await repo.getEventById(id);
      const ok = await repo.deleteEvent(id, service.nowIso());
      if (!ok) return json({ error: 'Zadanie nie istnieje' }, 404);
      await service.maybeAutoExportDeletionToGoogle(id, before).catch(() => {});
      await service.recordAuditAndOutbox({
        actor_type: actor.type,
        actor_id: actor.id,
        action: 'deleted',
        entity: 'event',
        entity_id: id,
        beforeObj: before,
        afterObj: null,
      });
      return json({ ok: true });
    }

    const overrideMatch = path.match(/^\/events\/([^/]+)\/occurrences\/([^/]+)\/override$/);
    if (overrideMatch && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const ov = await service.overrideOccurrence(
        decodeURIComponent(overrideMatch[1]),
        decodeURIComponent(overrideMatch[2]),
        body,
        actor
      );
      return json({ override: ov });
    }

    const assignMatch = path.match(/^\/events\/([^/]+)\/assign$/);
    if (assignMatch && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const updated = await service.assignTask(decodeURIComponent(assignMatch[1]), body, actor);
      return json({ event: updated });
    }

    const approveMatch = path.match(/^\/events\/([^/]+)\/approve$/);
    if (approveMatch && request.method === 'POST') {
      const updated = await service.approveTask(decodeURIComponent(approveMatch[1]), actor);
      return json({ event: updated });
    }

    const rejectMatch = path.match(/^\/events\/([^/]+)\/reject$/);
    if (rejectMatch && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const updated = await service.rejectTask(decodeURIComponent(rejectMatch[1]), body.reason, actor);
      return json({ event: updated });
    }

    // Zlecenie w języku naturalnym (Noemi @077 Bridge)
    if (path === '/nl-command' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const parsed = parseNaturalLanguageCommand(body.command || body.text, service.nowFn());
      if (body.commit === true) {
        const created = await service.createEvent(parsed, actor);
        return json({ committed: true, draft: parsed, event: created }, 201);
      }
      return json({ committed: false, draft: parsed });
    }

    // Rejestracja i lista tokenów agentów @777 (tylko Owner)
    if (path === '/agents' && request.method === 'GET') {
      const agents = await repo.listAgents();
      return json({ agents });
    }

    if (path === '/agents' && request.method === 'POST') {
      if (actor.role !== 'owner') return json({ error: 'Tylko Właściciel może zarządzać tokenami agentów' }, 403);
      const body = await request.json().catch(() => ({}));
      const name = String(body.name || '').trim();
      if (!name) return json({ error: 'Wymagana nazwa agenta (np. @077)' }, 422);
      const rawBytes = new Uint8Array(32);
      crypto.getRandomValues(rawBytes);
      const plainToken = body.token || [...rawBytes].map((b) => b.toString(16).padStart(2, '0')).join('');
      const tokenHash = await sha256Hex(plainToken);
      const client = await repo.registerAgentClient(
        {
          name,
          token_hash: tokenHash,
          scopes: body.scopes || ['events:read', 'events:claim', 'events:report'],
          capabilities: body.capabilities || [],
          allowed_projects: body.allowed_projects || ['*'],
          max_parallel: Number(body.max_parallel || 3),
        },
        service.nowIso()
      );
      await service.recordAuditAndOutbox({
        actor_type: actor.type,
        actor_id: actor.id,
        action: 'agent_registered',
        entity: 'api_client',
        entity_id: client.id,
        details: { name: client.name, scopes: body.scopes },
      });
      return json({ agent: { id: client.id, name: client.name }, token: plainToken }, 201);
    }

    // Audit log & Outbox
    if (path === '/audit' && request.method === 'GET') {
      const entityId = url.searchParams.get('entity_id');
      const audit = await repo.listAudit(entityId, 100);
      return json({ audit });
    }

    if (path === '/outbox' && request.method === 'GET') {
      const status = url.searchParams.get('status');
      const items = await repo.listOutbox(status);
      return json({ outbox: items });
    }

    if (path === '/outbox/reconcile' && request.method === 'POST') {
      const stats = await service.processOutboxBatch();
      return json({ ok: true, ...stats });
    }

    // Inteligentny Silnik Real-Time: Autopilot Misji CC Reconcile
    if (path === '/autopilot/reconcile' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const scope = body.scope === 'all' ? 'all' : 'today';
      const now = service.nowFn();
      const rawEvents = await repo.listEvents({});
      const warsawNowParts = getLocalParts(now, DEFAULT_TIMEZONE);
      const todayIsoPrefix = `${warsawNowParts.year}-${String(warsawNowParts.month).padStart(2, '0')}-${String(warsawNowParts.day).padStart(2, '0')}`;

      const allResolved = [];
      for (const ev of rawEvents) {
        if (ev.rrule) {
          const ovs = await repo.listOverridesForSeries(ev.id);
          const occs = materializeOccurrences(ev, null, null, ovs, now);
          allResolved.push(...occs);
        } else {
          allResolved.push(decorateEventComputed(ev, now));
        }
      }

      const scoped = scope === 'today'
        ? allResolved.filter((e) => (e.starts_at || '').slice(0, 10) === todayIsoPrefix || (e.ends_at || '').slice(0, 10) === todayIsoPrefix)
        : allResolved;

      const summary = {
        scope,
        total: scoped.length,
        todo: scoped.filter((e) => e.status === 'todo').length,
        in_progress: scoped.filter((e) => e.status === 'in_progress').length,
        done: scoped.filter((e) => e.status === 'done').length,
        not_done: scoped.filter((e) => e.status === 'not_done').length,
      };

      await service.recordAuditAndOutbox({
        actor_type: actor.type,
        actor_id: actor.id,
        action: 'autopilot_reconcile',
        entity: 'calendar',
        entity_id: 'realtime_engine',
        details: { summary, scope },
      });

      return json({ ok: true, engine: 'active', timestamp: now.toISOString(), summary });
    }

    // Web Push
    if (path === '/push/public-key' && request.method === 'GET') {
      return json({ key: env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U' });
    }

    if (path === '/push/subscribe' && request.method === 'POST') {
      const s = await request.json().catch(() => ({}));
      if (typeof s?.endpoint !== 'string' || !s.endpoint.startsWith('https://') || !s.keys?.p256dh || !s.keys?.auth) {
        return json({ error: 'Nieprawidłowa subskrypcja Web Push' }, 422);
      }
      const endpointHash = await sha256Hex(s.endpoint);
      const subId = `push_${endpointHash.slice(0, 16)}`;
      await repo.upsertPushSubscription({
        id: subId,
        user_id: actor.id,
        endpoint_hash: endpointHash,
        endpoint: s.endpoint,
        p256dh: s.keys.p256dh,
        auth: s.keys.auth,
        device_name: String(s.device_name || 'Przeglądarka').slice(0, 60),
        preferences: s.preferences || { new_task: true, reminder: true, overdue: true, claimed: true, review: true },
        quiet_hours_start: s.quiet_hours_start || '22:00',
        quiet_hours_end: s.quiet_hours_end || '06:00',
        created_at: service.nowIso(),
      });
      await service.recordAuditAndOutbox({
        actor_type: actor.type,
        actor_id: actor.id,
        action: 'push_subscribed',
        entity: 'push_subscription',
        entity_id: subId,
      });
      return json({ ok: true, subscriptionId: subId }, 201);
    }

    const pushDeleteMatch = path.match(/^\/push\/subscriptions\/([^/]+)$/);
    if (pushDeleteMatch && request.method === 'DELETE') {
      const subId = decodeURIComponent(pushDeleteMatch[1]);
      const ok = await repo.deletePushSubscription(subId, actor.id);
      if (!ok) return json({ error: 'Subskrypcja nie istnieje' }, 404);
      await service.recordAuditAndOutbox({
        actor_type: actor.type,
        actor_id: actor.id,
        action: 'push_unsubscribed',
        entity: 'push_subscription',
        entity_id: subId,
      });
      return json({ ok: true });
    }

    if (path === '/push/test' && request.method === 'POST') {
      const subs = await repo.listPushSubscriptions(actor.id);
      const quiet = isWithinQuietHours(service.nowFn(), '22:00', '06:00', DEFAULT_TIMEZONE);
      const body = await request.json().catch(() => ({}));
      if (quiet && !body.forceCritical) {
        return json({ delivered: 0, suppressedByQuietHours: true, message: 'Cisza nocna (22:00–06:00) — powiadomienie wstrzymane' });
      }
      // Neutralny komunikat na ekranie blokady (ochrona prywatności)
      const notificationPayload = {
        title: 'Christian Culture • Kalendarz Misji',
        body: 'Masz nową aktualizację zadania w Kalendarzu Misji.',
        url: '/ccMC',
      };
      return json({ delivered: subs.length, suppressedByQuietHours: false, payload: notificationPayload });
    }

    if (path === '/routines/seed' && request.method === 'POST') {
      const seeded = await service.seedMissionRoutines(actor);
      return json({ ok: true, count: seeded.length, routines: seeded });
    }

    // ────────────────────────────────────────────────────────────────────────
    // Integracja Google Calendar (Dwukierunkowa synchronizacja ZERO COST)
    // ────────────────────────────────────────────────────────────────────────
    if (path === '/gcal/status' && request.method === 'GET') {
      const status = await service.getGoogleCalendarStatus(actor);
      return json(status);
    }

    if (path === '/gcal/connect' && request.method === 'POST') {
      if (actor.role !== 'owner') return json({ error: 'Tylko Właściciel może autoryzować integrację Google Calendar' }, 403);
      const body = await request.json().catch(() => ({}));
      const res = await service.connectGoogleCalendar(actor, body);
      return json(res, 201);
    }

    if (path === '/gcal/calendars/ensure' && request.method === 'POST') {
      if (actor.role !== 'owner') return json({ error: 'Tylko Właściciel może zarządzać kalendarzami Google' }, 403);
      const body = await request.json().catch(() => ({}));
      const res = await service.ensureDedicatedGoogleCalendar(actor, body);
      return json(res);
    }

    if (path === '/gcal/settings' && request.method === 'PATCH') {
      if (actor.role !== 'owner') return json({ error: 'Tylko Właściciel może zmieniać tryb synchronizacji Google Calendar' }, 403);
      const body = await request.json().catch(() => ({}));
      const res = await service.updateGoogleCalendarSettings(actor, body);
      return json(res);
    }

    if (path === '/gcal/sync' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const res = await service.syncGoogleCalendar(actor, body);
      return json(res);
    }

    if (path === '/gcal/watch/renew' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const res = await service.renewGoogleCalendarWatch(actor, body);
      return json(res);
    }

    if (path === '/gcal/disconnect' && request.method === 'POST') {
      if (actor.role !== 'owner') return json({ error: 'Tylko Właściciel może odłączyć Google Calendar' }, 403);
      const res = await service.disconnectGoogleCalendar(actor);
      return json(res);
    }

    if (path === '/gcal/logs' && request.method === 'GET') {
      const logs = await repo.listGcalSyncLogs(Number(url.searchParams.get('limit') || 50));
      return json({ logs });
    }

    if (path === '/gcal/mappings' && request.method === 'GET') {
      const mappings = await repo.listGcalMappings();
      return json({ mappings });
    }

    return json({ error: 'Nieznany endpoint API Kalendarza Misji' }, 404);
  } catch (err) {
    const status = err.status || (err.message?.includes('Nieprawidłow') || err.message?.includes('Wymagan') || err.message?.includes('Tytuł') || err.message?.includes('Status') ? 422 : 500);
    const resp = { error: err.message || 'Błąd serwera' };
    if (err.serverEvent) resp.serverEvent = err.serverEvent;
    return json(resp, status);
  }
}
