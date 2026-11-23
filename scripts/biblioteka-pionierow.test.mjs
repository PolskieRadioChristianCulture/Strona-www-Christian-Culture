import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isPublicFile } from './cc-release-files.mjs';
import worker from '../_worker.js';

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, 'biblioteka-pionierow', 'data', 'partia-01.json');
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

test('Production hub and all 10 book pages have index/follow, canonical, GA4, JSON-LD Book, and clean copy', () => {
  assert.ok(!fs.existsSync(path.join(ROOT, 'test', 'biblioteka-pionierow', 'index.html')), 'Legacy preview HTML must be removed');

  const indexHtml = fs.readFileSync(path.join(ROOT, 'biblioteka-pionierow', 'index.html'), 'utf8');
  assert.match(indexHtml, /<meta\s+name="robots"\s+content="index,\s*follow[^"]*"\s*\/>/i);
  assert.doesNotMatch(indexHtml, /noindex/i);
  assert.match(indexHtml, /<link\s+rel="canonical"\s+href="https:\/\/polskieradio\.cc\/biblioteka-pionierow\/"\s*\/>/i);
  assert.ok(indexHtml.includes('G-Y4EFTVBPE3'), 'Missing GA4 on production hub');
  assert.ok(indexHtml.includes('header-right'), 'Missing .header-right contract for cc-favorites.js');
  assert.doesNotMatch(indexHtml, /bp-testbar|Podgląd testowy|Mission Control/i);
  assert.ok(indexHtml.includes('/components/cc-omni-search.js'), 'Missing @w omni-search hook');

  for (const book of CATALOG.books) {
    const pagePath = path.join(ROOT, 'biblioteka-pionierow', 'ksiazka', book.slug, 'index.html');
    assert.ok(fs.existsSync(pagePath), `Missing book page for ${book.slug}`);
    const html = fs.readFileSync(pagePath, 'utf8');
    const canonicalUrl = `https://polskieradio.cc/biblioteka-pionierow/ksiazka/${book.slug}/`;
    assert.match(html, /<meta\s+name="robots"\s+content="index,\s*follow[^"]*"\s*\/>/i);
    assert.doesNotMatch(html, /noindex/i);
    assert.ok(html.includes(`<link rel="canonical" href="${canonicalUrl}" />`), `Missing canonical on ${book.slug}`);
    assert.ok(html.includes('G-Y4EFTVBPE3'), `Missing GA4 on ${book.slug}`);
    assert.ok(html.includes('header-right'), `Missing .header-right on ${book.slug}`);
    assert.doesNotMatch(html, /bp-testbar|Podgląd testowy|Mission Control/i);

    const ldMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.ok(ldMatches.length > 0, `Missing JSON-LD on ${book.slug}`);
    const ld = JSON.parse(ldMatches[0][1]);
    assert.equal(ld['@type'], 'Book');
    assert.equal(ld.name, book.titlePl);
    assert.equal(ld.author?.name, book.authorFull);
    assert.ok(Array.isArray(ld.inLanguage) && ld.inLanguage.includes('en'));
    assert.match(ld.image, /\.webp$/);
    assert.equal(ld.isAccessibleForFree, true);
    assert.equal(ld.encodingFormat, 'application/pdf');
    assert.equal(ld.contentUrl, book.pdfUrl);
    assert.equal(ld.url, canonicalUrl);
  }
});

test('All 11 production URLs are indexed in @w, llms.txt, sitemaps/pages.xml, and zero test URLs remain', () => {
  const expectedUrls = [
    'https://polskieradio.cc/biblioteka-pionierow/',
    ...CATALOG.books.map((b) => `https://polskieradio.cc/biblioteka-pionierow/ksiazka/${b.slug}/`),
  ];

  for (const searchFile of ['szukaj/catalog.json', 'data/cc-search-index.json']) {
    const raw = fs.readFileSync(path.join(ROOT, searchFile), 'utf8');
    assert.ok(!raw.includes('/test/biblioteka-pionierow'), `Legacy preview URL remains in ${searchFile}`);
    const data = JSON.parse(raw);
    const urls = new Set((data.items || []).map((i) => i.url));
    for (const u of expectedUrls) {
      assert.ok(urls.has(u), `Production URL missing in ${searchFile}: ${u}`);
    }
  }

  const llms = fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8');
  assert.ok(llms.includes('Biblioteka Pionierów'), 'llms.txt missing Biblioteka Pionierów');
  assert.ok(!llms.includes('/test/biblioteka-pionierow'), 'Legacy preview URL remains in llms.txt');
  for (const u of expectedUrls) {
    assert.ok(llms.includes(u), `llms.txt missing URL: ${u}`);
  }
  for (const book of CATALOG.books) {
    assert.ok(llms.includes(book.titleEn), `llms.txt missing ${book.titleEn}`);
  }

  const pagesXml = fs.readFileSync(path.join(ROOT, 'sitemaps', 'pages.xml'), 'utf8');
  assert.ok(!pagesXml.includes('/test/biblioteka-pionierow'), 'Legacy preview URL remains in sitemaps/pages.xml');
  for (const u of expectedUrls) {
    assert.ok(pagesXml.includes(`<loc>${u}</loc>`), `sitemaps/pages.xml missing <loc>${u}</loc>`);
  }
});

test('_redirects and release allowlist serve /biblioteka-pionierow/ and 301-redirect legacy preview paths', () => {
  const redirects = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');
  assert.match(redirects, /^\/biblioteka-pionierow\s+\/biblioteka-pionierow\/index\.html\s+200$/m);
  assert.match(redirects, /^\/biblioteka-pionierow\/\s+\/biblioteka-pionierow\/index\.html\s+200$/m);
  assert.match(redirects, /^\/pionierzy\/\s+\/biblioteka-pionierow\/\s+301$/m);
  assert.match(redirects, /^\/test\/biblioteka-pionierow\/\s+\/biblioteka-pionierow\/\s+301$/m);
  assert.match(redirects, /^\/test\/biblioteka-pionierow\/ksiazka\/\*\s+\/biblioteka-pionierow\/ksiazka\/:splat\s+301$/m);

  assert.equal(isPublicFile('biblioteka-pionierow/index.html'), true);
  assert.equal(isPublicFile('biblioteka-pionierow/pioneers-library.css'), true);
  assert.equal(isPublicFile('biblioteka-pionierow/ksiazka/e-j-waggoner-christ-and-his-righteousness/index.html'), true);
  assert.equal(isPublicFile('images/biblioteka/pionierzy/001.webp'), true);
});

test('_worker.js executes 301 redirects for legacy preview, /pionierzy, and trailing slash without looping canonical URLs', async () => {
  const env = { ASSETS: { fetch: async () => new Response('ok', { status: 200 }) } };
  const redirectCases = [
    ['https://polskieradio.cc/test/biblioteka-pionierow/', 'https://polskieradio.cc/biblioteka-pionierow/'],
    ['https://polskieradio.cc/test/biblioteka-pionierow', 'https://polskieradio.cc/biblioteka-pionierow/'],
    [
      'https://polskieradio.cc/test/biblioteka-pionierow/ksiazka/e-j-waggoner-christ-and-his-righteousness/',
      'https://polskieradio.cc/biblioteka-pionierow/ksiazka/e-j-waggoner-christ-and-his-righteousness/',
    ],
    [
      'https://polskieradio.cc/test/biblioteka-pionierow/ksiazka/e-j-waggoner-christ-and-his-righteousness',
      'https://polskieradio.cc/biblioteka-pionierow/ksiazka/e-j-waggoner-christ-and-his-righteousness/',
    ],
    ['https://polskieradio.cc/pionierzy/', 'https://polskieradio.cc/biblioteka-pionierow/'],
    ['https://polskieradio.cc/pionierzy', 'https://polskieradio.cc/biblioteka-pionierow/'],
    ['https://polskieradio.cc/biblioteka-pionierow', 'https://polskieradio.cc/biblioteka-pionierow/'],
    [
      'https://polskieradio.cc/biblioteka-pionierow/ksiazka/e-j-waggoner-christ-and-his-righteousness',
      'https://polskieradio.cc/biblioteka-pionierow/ksiazka/e-j-waggoner-christ-and-his-righteousness/',
    ],
  ];

  for (const [sourceUrl, expectedLocation] of redirectCases) {
    const res = await worker.fetch(new Request(sourceUrl), env);
    assert.equal(res.status, 301, `Expected 301 for ${sourceUrl}`);
    assert.equal(res.headers.get('Location'), expectedLocation, `Unexpected Location for ${sourceUrl}`);
  }

  const canonicalPassThrough = [
    'https://polskieradio.cc/biblioteka-pionierow/',
    'https://polskieradio.cc/biblioteka-pionierow/ksiazka/e-j-waggoner-christ-and-his-righteousness/',
    'https://polskieradio.cc/biblioteka-pionierow/pioneers-library.css',
  ];

  for (const passUrl of canonicalPassThrough) {
    const res = await worker.fetch(new Request(passUrl), env);
    assert.equal(res.status, 200, `Expected 200 pass-through without redirect loop for ${passUrl}`);
  }
});
