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

export function adjustReflectionTimeOfDay(text, date = new Date()) {
  const phase = getWarsawDayPhase(date);
  if (phase === 'morning') return String(text || '');
  const adjUpper = phase === 'evening' ? 'WIECZORNE' : 'POPOŁUDNIOWE';
  const adjLower = phase === 'evening' ? 'wieczorne' : 'popołudniowe';
  const adjCap = phase === 'evening' ? 'Wieczorne' : 'Popołudniowe';
  const femUpper = phase === 'evening' ? 'WIECZORNA' : 'POPOŁUDNIOWA';
  const femCap = phase === 'evening' ? 'Wieczorna' : 'Popołudniowa';
  const femLower = phase === 'evening' ? 'wieczorna' : 'popołudniowa';

  return String(text || '')
    .replace(/ROZWAŻANIE PORANNE/g, `ROZWAŻANIE ${adjUpper}`)
    .replace(/Rozważanie poranne/g, `Rozważanie ${adjLower}`)
    .replace(/rozważanie poranne/g, `rozważanie ${adjLower}`)
    .replace(/Poranne rozważanie/g, `${adjCap} rozważanie`)
    .replace(/poranne rozważanie/g, `${adjLower} rozważanie`)
    .replace(/WERSJA PORANNA/g, `WERSJA ${femUpper}`)
    .replace(/Wersja Poranna/g, `Wersja ${femCap}`)
    .replace(/Poranna inspiracja/g, `${femCap} inspiracja`)
    .replace(/poranna inspiracja/g, `${femLower} inspiracja`);
}
