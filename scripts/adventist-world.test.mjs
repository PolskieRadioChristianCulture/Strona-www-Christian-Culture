import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isPublicFile } from './cc-release-files.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const awRoot = path.join(rootDir, 'test', 'adventist-world');

const seed = JSON.parse(fs.readFileSync(path.join(__dirname, 'adventist-world', 'records-seed.json'), 'utf8'));
const distJson = JSON.parse(fs.readFileSync(path.join(awRoot, 'data', 'institutions.json'), 'utf8'));
const searchFeed = JSON.parse(fs.readFileSync(path.join(awRoot, 'data', 'cc-search-feed.json'), 'utf8'));
const csvRaw = fs.readFileSync(path.join(awRoot, 'data', 'institutions.csv'), 'utf8');

test('Adventist World seed & output contain 49 deduplicated records across 4 countries and 8 categories', () => {
  assert.equal(seed.length, 49);
  assert.equal(distJson.length, 49);
  assert.equal(searchFeed.items.length, 49);

  const slugs = new Set();
  const countries = new Set();
  const categories = new Set();
  const forbiddenSlugFragments = ['biay', 'wrocaw', 'koscio-', 'szkoa-', 'suzba-', 'zroda-'];

  for (const r of distJson) {
    assert.ok(!slugs.has(r.slug), `Duplicate slug: ${r.slug}`);
    slugs.add(r.slug);
    assert.match(r.slug, /^[a-z0-9-]+$/);
    for (const frag of forbiddenSlugFragments) {
      assert.ok(!r.slug.includes(frag), `Corrupted Polish transliteration in slug ${r.slug}`);
    }
    countries.add(r.country);
    categories.add(r.category);

    assert.equal(r.verification, 'public_source');
    assert.equal(r.claim_status, 'unclaimed');

    if (r.website) assert.ok(r.website.startsWith('https://'), `Non-HTTPS website: ${r.website}`);
    if (r.source) assert.ok(r.source.startsWith('https://'), `Non-HTTPS source: ${r.source}`);

    const blob = JSON.stringify(r);
    assert.ok(!/mailto:|tel:|@gmail\.|@wp\.|@o2\./i.test(blob), `No personal PII allowed in ${r.slug}`);
  }

  assert.equal(countries.size, 4);
  assert.equal(categories.size, 8);
});

test('PL & EN catalogs satisfy strict P0 noindex, CC standards, and descender-safe CSS', () => {
  for (const rel of ['index.html', 'en/index.html']) {
    const html = fs.readFileSync(path.join(awRoot, rel), 'utf8');
    assert.ok(html.includes('<meta name="robots" content="noindex,nofollow">'), `Missing noindex in ${rel}`);
    assert.ok(!html.includes('Mission Control'), `Forbidden internal phrase in ${rel}`);
    assert.ok(html.includes('header-right'), `Missing .header-right favorites slot in ${rel}`);
    assert.ok(html.includes('id="tickRun"'), `Missing ecosystem ticker #tickRun in ${rel}`);
    assert.ok(html.includes('patronite.pl/ChristianCulture'), `Missing Patronite support link in ${rel}`);
    assert.ok(html.includes('og-adventist-world-1200x630.jpg'), `Missing OG image in ${rel}`);
    assert.ok(html.includes('hreflang="pl"') && html.includes('hreflang="en"'), `Missing hreflang in ${rel}`);
    assert.ok(html.includes('cc-wspieramto-modal.js'), `Missing WspieramTO modal script in ${rel}`);
    assert.ok(html.includes('href="/wspieramto"') && html.includes('data-cc-wspieramto') && html.includes('WspieramTO'), `Missing WspieramTO trigger in ${rel}`);
  }

  const css = fs.readFileSync(path.join(awRoot, 'aw.css'), 'utf8');
  assert.ok(css.includes('.hero.is-ready h1 .l'), 'Hero is-ready descender override missing');
  assert.ok(css.includes('#ff7a00'), 'Orange CTA token #FF7A00 missing');
  assert.ok(css.includes('prefers-reduced-motion: reduce'), 'Reduced-motion rule missing');
});

test('All 98 static PL & EN institution profiles exist cleanly with noindex, WspieramTO and valid links', () => {
  for (const rec of distJson) {
    for (const rel of [`instytucja/${rec.slug}/index.html`, `en/institution/${rec.slug}/index.html`]) {
      const fullPath = path.join(awRoot, rel);
      assert.ok(fs.existsSync(fullPath), `Missing static profile: ${rel}`);
      const html = fs.readFileSync(fullPath, 'utf8');
      assert.ok(html.includes('<meta name="robots" content="noindex,nofollow">'), `Missing noindex in ${rel}`);
      assert.ok(!html.includes('Mission Control'), `Forbidden phrase in ${rel}`);
      assert.ok(html.includes(rec.slug), `Slug reference missing in ${rel}`);
      assert.ok(html.includes('cc-wspieramto-modal.js'), `Missing WspieramTO modal script in ${rel}`);
      assert.ok(html.includes('href="/wspieramto"') && html.includes('data-cc-wspieramto') && html.includes('WspieramTO'), `Missing WspieramTO trigger in ${rel}`);
    }
  }
});

test('Open Data CSV/Sitemap and P0 isolation & release allowlist contracts pass', () => {
  assert.ok(csvRaw.startsWith('\uFEFFid,slug,'), 'CSV must start with UTF-8 BOM for Excel');
  const csvLines = csvRaw.trim().split(/\r?\n/);
  assert.equal(csvLines.length, 50, 'CSV should have 1 header + 49 records');

  const sitemap = fs.readFileSync(path.join(awRoot, 'sitemap.xml'), 'utf8');
  const urlMatches = sitemap.match(/<url>/g) || [];
  assert.equal(urlMatches.length, 100, 'Preview sitemap must contain 2 catalogs + 98 profiles = 100 URLs');

  assert.equal(isPublicFile('test/adventist-world/index.html'), true);
  assert.equal(isPublicFile('test/adventist-world/en/index.html'), true);
  assert.equal(isPublicFile('test/adventist-world/instytucja/zbor-bialystok/index.html'), true);
  assert.equal(isPublicFile('test/adventist-world/data/institutions.json'), true);
  assert.equal(isPublicFile('test/adventist-world/img/og-adventist-world-1200x630.jpg'), true);

  // Strict P0 production isolation check
  const prodSitemap = fs.readFileSync(path.join(rootDir, 'sitemaps', 'pages.xml'), 'utf8');
  assert.ok(!prodSitemap.includes('/test/adventist-world'), 'Production sitemap must NOT include P0 preview');
});
