import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isPublicFile } from './cc-release-files.mjs';

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, 'test', 'biblioteka-pionierow', 'data', 'partia-01.json');
const CATALOG = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

test('Partia 01 catalog has 10 valid bilingual books (001–010)', () => {
  assert.equal(CATALOG.batchLabel, 'Partia_01');
  assert.equal(CATALOG.books.length, 10);
  const ids = CATALOG.books.map((b) => b.id);
  assert.deepEqual(ids, ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010']);

  for (const book of CATALOG.books) {
    assert.ok(book.titlePl && book.titleEn, `Book ${book.id} missing PL/EN title`);
    assert.ok(book.summaryPl && book.summaryEn, `Book ${book.id} missing PL/EN summary`);
    assert.ok(book.descriptionPl && book.descriptionEn, `Book ${book.id} missing PL/EN description`);
    assert.match(book.pdfUrl, /^https:\/\/.+\.pdf$/i, `Book ${book.id} invalid pdfUrl`);
    assert.ok(book.coverWidth <= 1200, `Book ${book.id} cover width exceeds 1200px`);
  }
});

test('All 10 WebP covers exist, are valid WebP, lightweight, and no PDFs are committed', () => {
  const imgDir = path.join(ROOT, 'images', 'biblioteka', 'pionierzy');
  const files = fs.readdirSync(imgDir);
  assert.equal(
    files.filter((f) => f.toLowerCase().endsWith('.pdf')).length,
    0,
    'No PDF files allowed in repo'
  );

  for (const book of CATALOG.books) {
    const abs = path.join(ROOT, book.coverWebp.replace(/^\//, ''));
    assert.ok(fs.existsSync(abs), `Missing WebP cover: ${book.coverWebp}`);
    const buf = fs.readFileSync(abs);
    assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF', `${book.coverWebp} not RIFF`);
    assert.equal(buf.subarray(8, 12).toString('ascii'), 'WEBP', `${book.coverWebp} not WEBP`);
    assert.ok(buf.length < 250 * 1024, `${book.coverWebp} too large (${buf.length} bytes)`);
  }
});

test('Preview index and all 10 book pages have noindex, valid JSON-LD Book, and clean copy', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT, 'test', 'biblioteka-pionierow', 'index.html'), 'utf8');
  assert.match(indexHtml, /<meta\s+name="robots"\s+content="noindex,\s*nofollow"\s*\/>/i);
  assert.doesNotMatch(indexHtml, /Mission Control/i);
  assert.ok(indexHtml.includes('/components/cc-omni-search.js'), 'Missing @w omni-search hook');

  for (const book of CATALOG.books) {
    const pagePath = path.join(ROOT, 'test', 'biblioteka-pionierow', 'ksiazka', book.slug, 'index.html');
    assert.ok(fs.existsSync(pagePath), `Missing book page for ${book.slug}`);
    const html = fs.readFileSync(pagePath, 'utf8');
    assert.match(html, /<meta\s+name="robots"\s+content="noindex,\s*nofollow"\s*\/>/i);
    assert.doesNotMatch(html, /Mission Control/i);

    const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(ldMatch, `Missing JSON-LD on ${book.slug}`);
    const ld = JSON.parse(ldMatch[1]);
    assert.equal(ld['@type'], 'Book');
    assert.equal(ld.name, book.titlePl);
    assert.equal(ld.author?.name, book.authorFull);
    assert.ok(Array.isArray(ld.inLanguage) && ld.inLanguage.includes('en'));
    assert.match(ld.image, /\.webp$/);
    assert.equal(ld.isAccessibleForFree, true);
    assert.equal(ld.encodingFormat, 'application/pdf');
    assert.equal(ld.contentUrl, book.pdfUrl);
  }
});

test('All 10 books are indexed in @w (szukaj/catalog.json & data/cc-search-index.json), llms.txt, and excluded from sitemap.xml', () => {
  for (const searchFile of ['szukaj/catalog.json', 'data/cc-search-index.json']) {
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, searchFile), 'utf8'));
    const urls = new Set((data.items || []).map((i) => i.url));
    assert.ok(urls.has('https://polskieradio.cc/test/biblioteka-pionierow/'), `Hub missing in ${searchFile}`);
    for (const book of CATALOG.books) {
      const url = `https://polskieradio.cc/test/biblioteka-pionierow/ksiazka/${book.slug}/`;
      assert.ok(urls.has(url), `Book ${book.id} missing in ${searchFile}`);
    }
  }

  const llms = fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8');
  assert.ok(llms.includes('Biblioteka Pionierów'), 'llms.txt missing Biblioteka Pionierów');
  for (const book of CATALOG.books) {
    assert.ok(llms.includes(book.titleEn), `llms.txt missing ${book.titleEn}`);
  }

  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  assert.ok(!sitemap.includes('/test/biblioteka-pionierow'), 'noindex preview must not be in sitemap.xml');
});

test('Preview and cover files are whitelisted for Cloudflare Pages release', () => {
  assert.equal(isPublicFile('test/biblioteka-pionierow/index.html'), true);
  assert.equal(isPublicFile('test/biblioteka-pionierow/pioneers-library.css'), true);
  assert.equal(isPublicFile('test/biblioteka-pionierow/ksiazka/e-j-waggoner-christ-and-his-righteousness/index.html'), true);
  assert.equal(isPublicFile('images/biblioteka/pionierzy/001.webp'), true);
});

