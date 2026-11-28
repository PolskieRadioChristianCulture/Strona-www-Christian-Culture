/**
 * Ekstraktor Śpiewnika Biblijnego "Śpiewajmy Panu" (700 pieśni) z PDF do JSON
 * Źródło: H:\Mój dysk\YOUR IMAGINATION STUDIO prezentuje\Śpiewajmy-Panu-Śpiewnik-Kościoła-Adwentystów-Dnia-Siódmego(1).pdf
 * Cel: data/spiewajmy-panu.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const ROOT = process.cwd();
const DEFAULT_PDF = 'H:\\Mój dysk\\YOUR IMAGINATION STUDIO prezentuje\\Śpiewajmy-Panu-Śpiewnik-Kościoła-Adwentystów-Dnia-Siódmego(1).pdf';
const FALLBACK_PDF = 'H:\\Mój dysk\\Styczeń 2026\\Śpiewajmy-Panu-Śpiewnik-Kościola-Adwentystów-Dnia-Siódmego.pdf';
const OUT_PATH = path.join(ROOT, 'data', 'spiewajmy-panu.json');

// 40 kanonicznych kategorii ze spisu treści Śpiewajmy Panu
const CATEGORIES = [
  { id: 1, section: 'I. NABOŻEŃSTWO', name: 'Uwielbienie Boga i dziękczynienie', from: 1, to: 61 },
  { id: 2, section: 'I. NABOŻEŃSTWO', name: 'Duch Święty', from: 62, to: 75 },
  { id: 3, section: 'I. NABOŻEŃSTWO', name: 'Słowo Boże', from: 76, to: 87 },
  { id: 4, section: 'I. NABOŻEŃSTWO', name: 'Posłuszeństwo Bogu', from: 88, to: 91 },
  { id: 5, section: 'I. NABOŻEŃSTWO', name: 'Dzień sobotni', from: 92, to: 127 },
  { id: 6, section: 'I. NABOŻEŃSTWO', name: 'Zakończenie nabożeństwa', from: 128, to: 132 },
  { id: 7, section: 'II. ŻYCIE I DZIAŁALNOŚĆ JEZUSA', name: 'Pierwszy adwent', from: 133, to: 144 },
  { id: 8, section: 'II. ŻYCIE I DZIAŁALNOŚĆ JEZUSA', name: 'Życie i służba Jezusa', from: 145, to: 150 },
  { id: 9, section: 'II. ŻYCIE I DZIAŁALNOŚĆ JEZUSA', name: 'Cierpienie i śmierć Jezusa', from: 151, to: 157 },
  { id: 10, section: 'II. ŻYCIE I DZIAŁALNOŚĆ JEZUSA', name: 'Zmartwychwstanie i wniebowstąpienie', from: 158, to: 163 },
  { id: 11, section: 'II. ŻYCIE I DZIAŁALNOŚĆ JEZUSA', name: 'Pośrednictwo i sąd', from: 164, to: 179 },
  { id: 12, section: 'III. POWTÓRNE PRZYJŚCIE JEZUSA', name: 'Przygotowanie i oczekiwanie', from: 180, to: 207 },
  { id: 13, section: 'III. POWTÓRNE PRZYJŚCIE JEZUSA', name: 'Nagroda sprawiedliwych', from: 208, to: 215 },
  { id: 14, section: 'III. POWTÓRNE PRZYJŚCIE JEZUSA', name: 'Panowanie i królestwo Chrystusa', from: 216, to: 218 },
  { id: 15, section: 'IV. ZBAWIENIE W JEZUSIE', name: 'Ostrzeżenie i wezwanie', from: 219, to: 231 },
  { id: 16, section: 'IV. ZBAWIENIE W JEZUSIE', name: 'Nawrócenie, odpuszczenie, zbawienie', from: 232, to: 265 },
  { id: 17, section: 'V. UWIELBIENIE JEZUSA', name: 'Uwielbienie Jezusa', from: 266, to: 360 },
  { id: 18, section: 'VI. ŻYCIE CHRZEŚCIJAŃSKIE', name: 'Oddanie, ufność, poświęcenie', from: 361, to: 370 },
  { id: 19, section: 'VI. ŻYCIE CHRZEŚCIJAŃSKIE', name: 'Droga życia', from: 371, to: 383 },
  { id: 20, section: 'VI. ŻYCIE CHRZEŚCIJAŃSKIE', name: 'Modlitwa', from: 384, to: 409 },
  { id: 21, section: 'VI. ŻYCIE CHRZEŚCIJAŃSKIE', name: 'Wiara, nadzieja, miłość', from: 410, to: 420 },
  { id: 22, section: 'VI. ŻYCIE CHRZEŚCIJAŃSKIE', name: 'Pielgrzymka, bój wiary, wstrzemięźliwość', from: 421, to: 449 },
  { id: 23, section: 'VI. ŻYCIE CHRZEŚCIJAŃSKIE', name: 'Pocieszenie i zachęcenie', from: 450, to: 467 },
  { id: 24, section: 'VI. ŻYCIE CHRZEŚCIJAŃSKIE', name: 'Tęsknota za niebiańską ojczyzną', from: 468, to: 496 },
  { id: 25, section: 'VII. RODZINNY DOM', name: 'W domowym ognisku', from: 497, to: 502 },
  { id: 26, section: 'VII. RODZINNY DOM', name: 'Rodzice i dzieci', from: 503, to: 510 },
  { id: 27, section: 'VII. RODZINNY DOM', name: 'Ślub i małżeństwo', from: 511, to: 521 },
  { id: 28, section: 'VII. RODZINNY DOM', name: 'Dni smutku i choroby', from: 522, to: 523 },
  { id: 29, section: 'VIII. ZBÓR', name: 'Wspólne budowanie się, jedność', from: 524, to: 530 },
  { id: 30, section: 'VIII. ZBÓR', name: 'Praca dla Pana', from: 531, to: 561 },
  { id: 31, section: 'VIII. ZBÓR', name: 'Ofiarność', from: 562, to: 565 },
  { id: 32, section: 'VIII. ZBÓR', name: 'Chrzest i przyjęcie do zboru', from: 566, to: 570 },
  { id: 33, section: 'VIII. ZBÓR', name: 'Umywanie nóg i wieczerza Pańska', from: 571, to: 581 },
  { id: 34, section: 'VIII. ZBÓR', name: 'Poświęcenie kaplicy', from: 582, to: 585 },
  { id: 35, section: 'IX. RÓŻNE', name: 'Młodzieżowe', from: 586, to: 605 },
  { id: 36, section: 'IX. RÓŻNE', name: 'Dziecięce', from: 606, to: 636 },
  { id: 37, section: 'IX. RÓŻNE', name: 'Poranne i wieczorne', from: 637, to: 664 },
  { id: 38, section: 'IX. RÓŻNE', name: 'Przyroda i pory roku', from: 665, to: 677 },
  { id: 39, section: 'IX. RÓŻNE', name: 'Pożegnanie', from: 678, to: 681 },
  { id: 40, section: 'IX. RÓŻNE', name: 'Pogrzebowe', from: 682, to: 688 },
  { id: 41, section: 'IX. RÓŻNE', name: 'Okolicznościowe', from: 689, to: 700 }
];

function getCategory(num) {
  return CATEGORIES.find((c) => num >= c.from && num <= c.to) || CATEGORIES[0];
}

function cleanHyphens(str) {
  // Rejoin soft-hyphenated words across line breaks (e.g. "wcho-\ndzę" -> "wchodzę")
  return str
    .replace(/([a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ])-\s*\n\s*([a-ząćęłńóśźż])/g, '$1$2')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function parseStanzas(bodyText) {
  const cleaned = cleanHyphens(bodyText);
  // Split on stanza numbers (1., 2., ...) or Refren:
  const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
  const fullJoined = lines.join(' ');

  // Match markers: "1. ", "2. ", "Refren:", "Ref.:", etc.
  const markerRegex = /(?:^|\s)((?:\d{1,2}\.)|(?:Refren:|Ref\.:))\s*/g;
  const matches = [];
  let m;
  while ((m = markerRegex.exec(fullJoined)) !== null) {
    matches.push({
      marker: m[1],
      index: m.index,
      textStart: m.index + m[0].length
    });
  }

  if (matches.length === 0) {
    return fullJoined ? [{ label: '1', type: 'verse', text: fullJoined }] : [];
  }

  const stanzas = [];
  // Check if there is unlabelled text before first marker (rare)
  if (matches[0].index > 3) {
    const pre = fullJoined.slice(0, matches[0].index).trim();
    if (pre) stanzas.push({ label: '1', type: 'verse', text: pre });
  }

  for (let i = 0; i < matches.length; i++) {
    const curr = matches[i];
    const next = matches[i + 1];
    const text = fullJoined.slice(curr.textStart, next ? next.index : fullJoined.length).trim();
    if (!text) continue;
    const isChorus = /^Ref/i.test(curr.marker);
    stanzas.push({
      label: isChorus ? 'Refren' : curr.marker.replace(/\.$/, ''),
      type: isChorus ? 'chorus' : 'verse',
      text
    });
  }
  return stanzas;
}

function parseSongBlock(number, rawBlock) {
  // Remove page footers like "-- 3 of 700 --"
  const block = rawBlock.replace(/--\s*\d+\s+of\s+\d+\s*--/g, '').trim();
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  // Find where stanza 1 or Refren or lyrics start
  let bodyStartIdx = lines.findIndex((l) => /^1\.\s/.test(l) || /^Refren:/i.test(l));
  if (bodyStartIdx === -1) {
    // Some single-stanza songs (like Nr 694, 695, 697, 698, 700) have no "1."
    // Header ends after line containing "(Key)" and optional author line
    const keyLineIdx = lines.findIndex((l) => /\([A-Ha-h][is|es|b#]*\)\s*$/.test(l));
    if (keyLineIdx >= 0) {
      bodyStartIdx = keyLineIdx + 1;
      if (lines[bodyStartIdx] && /^(sł\.|autor|mel\.|tł\.|J\.|A\.|K\.|M\.|P\.|R\.|W\.|C\.|H\.|L\.)/i.test(lines[bodyStartIdx])) {
        bodyStartIdx++;
      }
    } else {
      bodyStartIdx = 1;
    }
  }

  const headerLines = lines.slice(0, bodyStartIdx);
  const bodyText = lines.slice(bodyStartIdx).join('\n');

  // Parse title + key from headerLines
  let headerJoined = headerLines.join(' ').replace(/\s+/g, ' ').trim();
  let author = '';
  let key = '';
  let title = headerJoined;

  // Key is usually in parens e.g. "(F)", "(Es)", "(As)", "(d)", "(Des)", "(cis)"
  const keyMatch = headerJoined.match(/^(.+?)\s*\(([A-Ha-h](?:es|is|s|b)?)\)\s*(.*)$/);
  if (keyMatch) {
    title = keyMatch[1].trim();
    key = keyMatch[2].trim();
    author = keyMatch[3].trim();
  }

  // Extract Bible references if present in author/title (e.g. "(IV Mojż. 6,24-26)", "(Ps. 23)")
  const bibleRefs = [];
  const refMatches = (author + ' ' + title).matchAll(/\(([^)]*(?:Mojż\.|Ps\.|Psalm|Iz\.|Mat\.|Łuk\.|Jan|J\.|Rz\.|Kor\.|Obj\.|Prz\.|Kazn\.)[^)]*)\)/gi);
  for (const rm of refMatches) {
    bibleRefs.push(rm[1].trim());
  }

  const cat = getCategory(number);
  const stanzas = parseStanzas(bodyText);

  return {
    number,
    title,
    key,
    author,
    section: cat.section,
    category: cat.name,
    categoryId: cat.id,
    stanzas,
    bibleRefs
  };
}

async function main() {
  const pdfPath = fs.existsSync(DEFAULT_PDF) ? DEFAULT_PDF : FALLBACK_PDF;
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Nie znaleziono pliku PDF Śpiewajmy Panu pod ścieżką: ${pdfPath}`);
  }

  console.log(`📖 Wczytywanie PDF: ${pdfPath}`);
  const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  const parsed = await parser.getText({ first: 3, last: 700 });
  const fullText = parsed.text.replace(/--\s*\d+\s+of\s+\d+\s*--/g, '\n');

  // Split by "Nr <number>."
  const songRegex = /(?:^|\n)Nr\s+(\d{1,3})\.\s*\n?/g;
  const positions = [];
  let match;
  while ((match = songRegex.exec(fullText)) !== null) {
    positions.push({
      number: parseInt(match[1], 10),
      start: match.index + match[0].length,
      rawStart: match.index
    });
  }

  console.log(`🔎 Znaleziono markerów pieśni: ${positions.length}`);

  const songsMap = new Map();
  for (let i = 0; i < positions.length; i++) {
    const curr = positions[i];
    const next = positions[i + 1];
    const rawBlock = fullText.slice(curr.start, next ? next.rawStart : fullText.length);
    const song = parseSongBlock(curr.number, rawBlock);
    if (song && !songsMap.has(song.number)) {
      songsMap.set(song.number, song);
    }
  }

  const songs = Array.from(songsMap.values()).sort((a, b) => a.number - b.number);
  console.log(`✅ Sparsowano unikalnych pieśni: ${songs.length} (zakres: ${songs[0]?.number}..${songs[songs.length - 1]?.number})`);

  // Check for missing numbers
  const missing = [];
  for (let n = 1; n <= 700; n++) {
    if (!songsMap.has(n)) missing.push(n);
  }
  if (missing.length > 0) {
    console.warn(`⚠️ Brakujące numery (${missing.length}): ${missing.join(', ')}`);
  }

  const output = {
    title: 'Śpiewajmy Panu',
    subtitle: 'Śpiewnik Biblijny — Kościoła Adwentystów Dnia Siódmego',
    version: '2026.1',
    source: 'Dysk Google CC / Śpiewajmy-Panu-Śpiewnik-Kościoła-Adwentystów-Dnia-Siódmego.pdf',
    totalSongs: songs.length,
    categories: CATEGORIES,
    songs
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), 'utf8');
  const sizeKB = Math.round(fs.statSync(OUT_PATH).size / 1024);
  console.log(`💾 Zapisano ${OUT_PATH} (${sizeKB} KB)`);
}

main().catch((err) => {
  console.error('❌ Błąd ekstrakcji:', err);
  process.exit(1);
});
