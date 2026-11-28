import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

const DEFAULT_TXT = 'D:\\_cc_scholar_src\\cross_refs_extracted\\cross_references.txt';
const DEFAULT_ZIP = 'D:\\_cc_scholar_src\\cross-references.zip';
const OUT_DIR = path.join(ROOT, 'data', 'bible-scholar', 'xrefs');

const OSIS_TO_CC = {
  Gen: 'GEN', Exod: 'EXO', Lev: 'LEV', Num: 'NUM', Deut: 'DEU',
  Josh: 'JOS', Judg: 'JDG', Ruth: 'RUT', '1Sam': '1SA', '2Sam': '2SA',
  '1Kgs': '1KI', '2Kgs': '2KI', '1Chr': '1CH', '2Chr': '2CH', Ezra: 'EZR',
  Neh: 'NEH', Esth: 'EST', Job: 'JOB', Ps: 'PSA', Prov: 'PRO',
  Eccl: 'ECC', Song: 'SNG', Isa: 'ISA', Jer: 'JER', Lam: 'LAM',
  Ezek: 'EZK', Dan: 'DAN', Hos: 'HOS', Joel: 'JOL', Amos: 'AMO',
  Obad: 'OBA', Jonah: 'JON', Mic: 'MIC', Nah: 'NAM', Hab: 'HAB',
  Zeph: 'ZEP', Hag: 'HAG', Zech: 'ZEC', Mal: 'MAL',
  Matt: 'MAT', Mark: 'MRK', Luke: 'LUK', John: 'JHN', Acts: 'ACT',
  Rom: 'ROM', '1Cor': '1CO', '2Cor': '2CO', Gal: 'GAL', Eph: 'EPH',
  Phil: 'PHP', Col: 'COL', '1Thess': '1TH', '2Thess': '2TH', '1Tim': '1TI',
  '2Tim': '2TI', Titus: 'TIT', Phlm: 'PHM', Heb: 'HEB', Jas: 'JAS',
  '1Pet': '1PE', '2Pet': '2PE', '1John': '1JN', '2John': '2JN', '3John': '3JN',
  Jude: 'JUD', Rev: 'REV'
};

function parseOsisSingle(token) {
  const m = /^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)$/.exec(String(token || '').trim());
  if (!m) return null;
  const book = OSIS_TO_CC[m[1]];
  if (!book) return null;
  return {
    book,
    chapter: Number(m[2]),
    verse: Number(m[3]),
    ref: `${book} ${m[2]}:${m[3]}`
  };
}

function parseOsisTarget(rawTarget) {
  const parts = String(rawTarget || '').split('-');
  const start = parseOsisSingle(parts[0]);
  if (!start) return null;
  if (parts.length === 1) {
    return start.ref;
  }
  const end = parseOsisSingle(parts[1]);
  if (!end) return start.ref;
  if (end.book === start.book && end.chapter === start.chapter) {
    return `${start.book} ${start.chapter}:${start.verse}-${end.verse}`;
  }
  if (end.book === start.book) {
    return `${start.book} ${start.chapter}:${start.verse}-${end.chapter}:${end.verse}`;
  }
  return `${start.ref}-${end.ref}`;
}

function main() {
  const inputTxt = path.resolve(process.argv[2] || DEFAULT_TXT);
  const inputZip = path.resolve(process.argv[3] || DEFAULT_ZIP);
  if (!fs.existsSync(inputTxt)) {
    throw new Error(`Missing source file: ${inputTxt}`);
  }

  let zipSha256 = '';
  if (fs.existsSync(inputZip)) {
    zipSha256 = crypto.createHash('sha256').update(fs.readFileSync(inputZip)).digest('hex').toUpperCase();
  }

  const raw = fs.readFileSync(inputTxt, 'utf8');
  const lines = raw.split(/\r?\n/);
  const headerLine = lines[0] || '';
  if (!/openbible\.info\s+CC-BY/i.test(headerLine)) {
    throw new Error(`Unexpected header (expected OpenBible CC-BY notice): ${headerLine}`);
  }

  const perBook = new Map();
  let totalEdges = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    const cols = line.split('\t');
    if (cols.length < 3) {
      skipped += 1;
      continue;
    }
    const fromParsed = parseOsisSingle(cols[0]);
    const toRef = parseOsisTarget(cols[1]);
    const votes = Number.parseInt(cols[2], 10);
    if (!fromParsed || !toRef || !Number.isFinite(votes)) {
      skipped += 1;
      continue;
    }

    if (!perBook.has(fromParsed.book)) {
      perBook.set(fromParsed.book, {});
    }
    const bookMap = perBook.get(fromParsed.book);
    const key = `${fromParsed.chapter}:${fromParsed.verse}`;
    if (!bookMap[key]) bookMap[key] = [];
    bookMap[key].push([toRef, votes]);
    totalEdges += 1;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const indexBooks = {};

  for (const [book, versesObj] of perBook.entries()) {
    let bookEdges = 0;
    const keys = Object.keys(versesObj);
    for (const k of keys) {
      versesObj[k].sort((a, b) => b[1] - a[1]);
      bookEdges += versesObj[k].length;
    }
    const payload = {
      schema: 'cc-bible-scholar-xrefs-v1',
      datasetId: 'openbible-cross-references',
      licenseId: 'CC-BY-4.0',
      sourceUrl: 'https://www.openbible.info/labs/cross-references/',
      book,
      verseCount: keys.length,
      edgeCount: bookEdges,
      refs: versesObj
    };
    const outFile = path.join(OUT_DIR, `${book}.json`);
    fs.writeFileSync(outFile, JSON.stringify(payload), 'utf8');
    indexBooks[book] = {
      verses: keys.length,
      edges: bookEdges,
      bytes: fs.statSync(outFile).size
    };
  }

  const indexPayload = {
    schema: 'cc-bible-scholar-xrefs-index-v1',
    datasetId: 'openbible-cross-references',
    licenseId: 'CC-BY-4.0',
    sourceUrl: 'https://www.openbible.info/labs/cross-references/',
    zipSha256,
    upstreamHeader: headerLine,
    importedAt: new Date().toISOString(),
    totalBooks: perBook.size,
    totalEdges,
    skipped,
    books: indexBooks
  };
  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(indexPayload, null, 2), 'utf8');
  console.log(JSON.stringify({
    ok: true,
    totalBooks: perBook.size,
    totalEdges,
    skipped,
    sampleGEN: indexBooks.GEN,
    sampleJHN: indexBooks.JHN
  }, null, 2));
}

main();
