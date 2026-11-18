// Zwraca fazę dnia w Warszawie (Europe/Warsaw) na podstawie godziny 12:00 i astronomicznego zachodu słońca (52.23°N, 21.01°E).
export function getWarsawSunsetMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric', month: '2-digit', day: '2-digit', timeZoneName: 'shortOffset'
  }).formatToParts(date);
  const y = Number(parts.find(p => p.type === 'year').value);
  const m = Number(parts.find(p => p.type === 'month').value);
  const d = Number(parts.find(p => p.type === 'day').value);
  const tzStr = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+1';
  const tzMatch = tzStr.match(/GMT([+-]\d+)/);
  const tzOffsetHours = tzMatch ? Number(tzMatch[1]) : 1;

  const doy = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86400000);
  const lat = 52.2297 * Math.PI / 180;
  const lng = 21.0122;
  const gamma = (2 * Math.PI / 365) * (doy - 1);
  const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
  const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
  const zenith = 90.833 * Math.PI / 180;
  const cosHa = (Math.cos(zenith) / (Math.cos(lat) * Math.cos(decl))) - Math.tan(lat) * Math.tan(decl);
  const haDeg = Math.acos(Math.max(-1, Math.min(1, cosHa))) * 180 / Math.PI;
  const sunsetUtcMin = 720 - 4 * (lng - haDeg) - eqtime;
  return Math.round(sunsetUtcMin + tzOffsetHours * 60);
}

export function getWarsawDayPhase(date = new Date()) {
  const hm = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Warsaw', hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(date);
  const hour = Number(hm.find(p => p.type === 'hour').value);
  const minute = Number(hm.find(p => p.type === 'minute').value);
  const nowMinutes = hour * 60 + minute;
  const sunsetMinutes = getWarsawSunsetMinutes(date);

  if (nowMinutes >= sunsetMinutes) return 'evening';
  if (hour >= 12) return 'afternoon';
  return 'morning';
}

function matchCase(source, targetLower) {
  if (source === source.toUpperCase() && source !== source.toLowerCase()) return targetLower.toUpperCase();
  if (source[0] && source[0] === source[0].toUpperCase()) return targetLower[0].toUpperCase() + targetLower.slice(1);
  return targetLower;
}

export function adjustReflectionTimeOfDay(text, date = new Date()) {
  const phase = getWarsawDayPhase(date);
  if (phase === 'morning') return String(text || '');

  const stem = phase === 'evening' ? 'wieczorn' : 'popołudniow';
  const isEve = phase === 'evening';

  let out = String(text || '')
    .replace(/\bporann(ego|emu|ych|ymi|ym|ej|ą|y|a|e)\b/gi, (m, suf) => matchCase(m, stem + suf.toLowerCase()))
    .replace(/\bo poranku\b/gi, (m) => matchCase(m, isEve ? 'wieczorem' : 'po południu'))
    .replace(/\bdzień dobry\b/gi, (m) => matchCase(m, isEve ? 'dobry wieczór' : 'dobrego popołudnia'))
    .replace(/\bGotowi na nowy dzień walki\?/gi, isEve ? 'Słowo Boże na wieczór:' : 'Słowo Boże na popołudnie:')
    .replace(/\bna (?:dobry )?początek dnia\b/gi, (m) => matchCase(m, isEve ? 'na spokojny wieczór' : 'na dobre popołudnie'));

  if (isEve) {
    out = out.replace(/^☀️\s*\*1\. ROZWAŻANIE/gm, '🌙 *1. ROZWAŻANIE');
  }
  return out;
}
