export const inEcosystem = location.hostname === 'polskieradio.cc' || location.hostname === 'www.polskieradio.cc';
const base = inEcosystem ? location.origin : 'https://polskieradio.cc';
export const site = (path) => new URL(path, base);

async function json(path) {
  const response = await fetch(site(path), { signal: AbortSignal.timeout(18000) });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  return response.json();
}

export async function loadBible() {
  const [index, metadata] = await Promise.all([
    json('/data/bible/szukaj-ubg.json?v=20261013_1'),
    json('/data/bible/bible_books_metadata.json')
  ]);
  if (!Array.isArray(index.b) || !Array.isArray(index.r) || !Array.isArray(metadata)) {
    throw new Error('Nieprawidłowy format indeksu UBG');
  }
  const names = new Map(metadata.map(({ id, namePl }) => [id, namePl]));
  names.set('JHN', 'Ewangelia Jana');
  const testaments = new Map(metadata.map(({ id, testament }) => [id, testament === 'NT' ? 'NT' : 'OT']));
  const chapters = new Map();
  const byKey = new Map();
  for (const [bookIndex, chapter, number, text] of index.r) {
    const book = index.b[bookIndex];
    if (!names.has(book) || !Number.isInteger(chapter) || !Number.isInteger(number) || typeof text !== 'string' || !text.trim()) continue;
    const chapterKey = book + '.' + chapter;
    const key = chapterKey + '.' + number;
    if (byKey.has(key)) continue;
    const verse = { book, chapter, number, text, key, name: names.get(book), testament: testaments.get(book) || 'OT' };
    const rows = chapters.get(chapterKey) || [];
    if (!chapters.has(chapterKey)) chapters.set(chapterKey, rows);
    rows.push(verse);
    byKey.set(key, verse);
  }
  if (byKey.size < 2) throw new Error('Brak danych w indeksie UBG');
  for (const chapter of chapters.values()) chapter.sort((a, b) => a.number - b.number);
  return { verses: [...byKey.values()], chapters, byKey };
}

const bookAliases = { genesis: 'GEN', exodus: 'EXO', leviticus: 'LEV', numbers: 'NUM', deuteronomy: 'DEU', psalms: 'PSA', john: 'JHN', proverbs: 'PRO', revelation: 'REV' };

export async function loadRecordings() {
  const catalog = await json('/biblia-audio/data/catalog.json');
  if (!Array.isArray(catalog)) throw new Error('Nieprawidłowy format katalogu nagrań');
  const recordings = new Map();
  for (const item of catalog) {
    if (item.status !== 'published' || !Number.isInteger(item.chapter) || typeof item.book !== 'string') continue;
    const book = bookAliases[item.book.toLowerCase()] || item.book.toUpperCase();
    recordings.set(book + '.' + item.chapter, item);
  }
  return recordings;
}

function mediaUrl(source) {
  if (typeof source !== 'string' || !source) return null;
  try {
    const url = site(source);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function officialTrack(recordings, verse) {
  const item = recordings.get(verse.book + '.' + verse.chapter);
  if (!item) return null;
  if (item.audioParts?.length) {
    for (const part of item.audioParts) {
      if (typeof part.verses !== 'string') continue;
      const match = part.verses.trim().match(/^(\d+)(?:\s*[-–—]\s*(\d+))?$/);
      if (!match || verse.number < Number(match[1]) || verse.number > Number(match[2] || match[1])) continue;
      const url = mediaUrl(part.url);
      if (url) return { type: 'recording', verse, url, range: part.verses };
    }
    return null;
  }
  const url = mediaUrl(item.audioUrl);
  return url ? { type: 'recording', verse, url } : null;
}
