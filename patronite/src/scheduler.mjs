const WARSAW_TZ = 'Europe/Warsaw';

const WEEKDAY_MAP = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 0,
};

export function getWarsawParts(date) {
  const d = date instanceof Date ? date : new Date(date);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: WARSAW_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'shortOffset',
  });
  const parts = {};
  for (const p of fmt.formatToParts(d)) {
    parts[p.type] = p.value;
  }
  const offsetMatch = /GMT([+-]\d{1,2})(?::(\d{2}))?/.exec(parts.timeZoneName || 'GMT+1');
  let offsetMinutes = 60;
  if (offsetMatch) {
    const sign = offsetMatch[1].startsWith('-') ? -1 : 1;
    const h = Math.abs(parseInt(offsetMatch[1], 10));
    const m = parseInt(offsetMatch[2] || '0', 10);
    offsetMinutes = sign * (h * 60 + m);
  }
  return {
    year: parseInt(parts.year, 10),
    month: parseInt(parts.month, 10),
    day: parseInt(parts.day, 10),
    weekday: WEEKDAY_MAP[parts.weekday] ?? 0,
    hour: parseInt(parts.hour, 10),
    minute: parseInt(parts.minute, 10),
    second: parseInt(parts.second, 10),
    offsetMinutes,
    dateStr: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

/**
 * Konwertuje lokalną datę i godzinę w strefie Europe/Warsaw na punkt UTC (obsługuje CET/CEST).
 */
export function warsawLocalToDate(year, month, day, hour = 0, minute = 0, second = 0) {
  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);
  // Pierwsze przybliżenie offsetu
  const guessParts1 = getWarsawParts(new Date(naiveUtcMs));
  let utcMs = naiveUtcMs - guessParts1.offsetMinutes * 60000;
  // Drugie przybliżenie dokładnie w punkcie granicznym zmiany czasu
  const guessParts2 = getWarsawParts(new Date(utcMs));
  if (guessParts2.offsetMinutes !== guessParts1.offsetMinutes) {
    utcMs = naiveUtcMs - guessParts2.offsetMinutes * 60000;
  }
  return new Date(utcMs);
}

export function formatWarsawIso(date) {
  const p = getWarsawParts(date);
  const sign = p.offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(p.offsetMinutes);
  const oh = String(Math.floor(abs / 60)).padStart(2, '0');
  const om = String(abs % 60).padStart(2, '0');
  const hh = String(p.hour).padStart(2, '0');
  const mm = String(p.minute).padStart(2, '0');
  const ss = String(p.second).padStart(2, '0');
  return `${p.dateStr}T${hh}:${mm}:${ss}${sign}${oh}:${om}`;
}

export function addWarsawDays(date, days) {
  const p = getWarsawParts(date);
  const utcMidday = Date.UTC(p.year, p.month - 1, p.day + days, 12, 0, 0);
  const np = getWarsawParts(new Date(utcMidday));
  return warsawLocalToDate(np.year, np.month, np.day, p.hour, p.minute, p.second);
}

/**
 * Sprawdza regułę ochrony szabatu:
 * - Piątek >= 14:30 Europe/Warsaw jest zablokowany (publikacja ani prace redakcyjne z człowiekiem).
 * - Sobota do 21:30 Europe/Warsaw jest zablokowana.
 */
export function checkSabbathWindow(date, cutoff = { hour: 14, minute: 30 }) {
  const p = getWarsawParts(date);
  const minutesOfDay = p.hour * 60 + p.minute;
  const fridayCutoffMin = cutoff.hour * 60 + cutoff.minute;
  if (p.weekday === 5 && minutesOfDay >= fridayCutoffMin) {
    return { allowed: false, reason: 'FRIDAY_SABBATH_WINDOW', warsawIso: formatWarsawIso(date) };
  }
  if (p.weekday === 6 && minutesOfDay < 21 * 60 + 30) {
    return { allowed: false, reason: 'SATURDAY_SABBATH_WINDOW', warsawIso: formatWarsawIso(date) };
  }
  return { allowed: true, reason: 'OK', warsawIso: formatWarsawIso(date) };
}

export function buildUpcomingCycles({ fromDate = new Date(), count = 6, config }) {
  const schedule = config.schedule || [];
  const leadHours = Number(config.prepLeadTimeHours || 2);
  const cutoff = config.fridaySabbathCutoff || { hour: 14, minute: 30 };

  const fromParts = getWarsawParts(fromDate);
  const results = [];
  for (let dayOffset = 0; dayOffset < 60 && results.length < count; dayOffset++) {
    const probeMidday = new Date(Date.UTC(fromParts.year, fromParts.month - 1, fromParts.day + dayOffset, 12, 0, 0));
    const wp = getWarsawParts(probeMidday);
    const matching = schedule.filter(s => s.weekday === wp.weekday);
    for (const slot of matching) {
      const pubDate = warsawLocalToDate(wp.year, wp.month, wp.day, slot.hour, slot.minute, 0);
      if (pubDate.getTime() < new Date(fromDate).getTime() - 60000) continue;
      const prepDate = new Date(pubDate.getTime() - leadHours * 3600 * 1000);
      const sabbathCheck = checkSabbathWindow(pubDate, cutoff);
      const prepSabbathCheck = checkSabbathWindow(prepDate, cutoff);
      if (!sabbathCheck.allowed || !prepSabbathCheck.allowed) {
        throw new Error(`Naruszenie reguły szabatu w harmonogramie: ${formatWarsawIso(pubDate)}`);
      }
      const dateCompact = wp.dateStr.replaceAll('-', '');
      results.push({
        jobId: `PAT-${dateCompact}-${slot.seriesType}`,
        slotId: slot.id,
        seriesType: slot.seriesType,
        seriesLabel: slot.seriesLabel,
        visibility: slot.defaultVisibility || 'PUBLICZNY',
        notifyPatronsEmail: Boolean(slot.notifyPatronsEmail),
        scheduledForUtc: pubDate.toISOString(),
        scheduledForWarsaw: formatWarsawIso(pubDate),
        prepAtUtc: prepDate.toISOString(),
        prepAtWarsaw: formatWarsawIso(prepDate),
        warsawDate: wp.dateStr,
        weekdayName: slot.weekdayName,
      });
      if (results.length >= count) break;
    }
  }
  return results;
}

export function canExecuteCycle({ config, db, slotDate = new Date() }) {
  const killFlag = db ? db.getFlag('kill_switch') === '1' : Boolean(config.killSwitch);
  if (killFlag || config.killSwitch) {
    return { allowed: false, code: 'KILL_SWITCH_ACTIVE', message: 'Wyłącznik awaryjny (kill switch) jest aktywny.' };
  }
  const sabbath = checkSabbathWindow(slotDate, config.fridaySabbathCutoff || { hour: 14, minute: 30 });
  if (!sabbath.allowed) {
    return { allowed: false, code: sabbath.reason, message: `Okno zablokowane ze względu na szabat (${sabbath.warsawIso}).` };
  }
  return { allowed: true, code: 'READY', message: 'Harmonogram gotowy do przygotowania lub wykonania cyklu.' };
}
