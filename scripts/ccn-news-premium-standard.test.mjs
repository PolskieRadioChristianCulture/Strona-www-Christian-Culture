// Strażnik Standardu CCN News Premium v1 (@007, L0 23.11.2026).
// Sprawdza każdy artykuł CCN News opublikowany od 2026-11-23 09:00 (przyjęcie standardu) oraz zasady czołówki /news.
// Uruchom: node --test scripts/ccn-news-premium-standard.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadArticles } from './build-ccn-static-pages.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STANDARD_FROM = new Date('2026-11-23T09:00:00+01:00').getTime();
const { articles } = loadArticles();
const covered = articles.filter(a => new Date(a.publishedAt).getTime() >= STANDARD_FROM);

test('standard obejmuje co najmniej jeden artykuł', () => {
  assert.ok(covered.length >= 1, 'brak artykułów od 23.11.2026 09:00');
});

for (const a of covered) {
  test(`Premium v1: ${a.slug}`, () => {
    assert.match(a.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug: małe litery, cyfry, myślniki');
    assert.ok(a.seoTitle && a.seoTitle.length <= 60, `seoTitle wymagany, <=60 znaków (jest ${a.seoTitle?.length})`);
    const md = a.metaDescription || '';
    assert.ok(md.length >= 110 && md.length <= 160, `metaDescription 110–160 znaków (jest ${md.length})`);
    assert.ok(a.imageAlt && a.imageAlt.length >= 20, 'imageAlt (opis grafiki) wymagany');
    assert.ok(a.imageUrl.startsWith('/images/'), 'grafika lokalna w /images/ (bez hotlinków)');
    const img = path.join(ROOT, a.imageUrl.split('?')[0]);
    assert.ok(fs.existsSync(img), `brak pliku grafiki ${a.imageUrl}`);
    assert.ok(fs.statSync(img).size <= 350 * 1024, 'grafika <= 350 KB (zoptymalizuj)');
    assert.ok(a.imageCaption, 'imageCaption wymagany (przy grafice AI: informacja, że to ilustracja AI)');
    assert.ok(Array.isArray(a.sources) && a.sources.length >= 1, 'sources: co najmniej 1 źródło pierwotne');
    for (const s of a.sources) {
      assert.ok(s.label && /^https:\/\//.test(s.url), `źródło bez etykiety lub nie-https: ${s.url}`);
    }
    assert.ok(a.content.length >= 8, 'treść: co najmniej 8 akapitów');
    const headings = a.content.filter(p => /^\d+\.\s+/.test(p));
    assert.ok(headings.length >= 3, 'treść: co najmniej 3 numerowane śródtytuły');
    assert.ok(a.author && a.author.name, 'autor wymagany (zakaz fikcyjnych ekspertów)');
    assert.ok(a.excerpt.length >= 80, 'lead (excerpt) co najmniej 80 znaków');
    assert.match(a.publishedAt, /[+-]\d{2}:\d{2}$/, 'publishedAt ISO ze strefą czasową');
    const page = path.join(ROOT, 'news', a.slug, 'index.html');
    assert.ok(fs.existsSync(page), `brak strony statycznej ${page}`);
    const html = fs.readFileSync(page, 'utf8');
    assert.ok(html.includes(`<title>${a.seoTitle.replace(/&/g, '&amp;')}`), 'strona statyczna używa seoTitle');
    assert.ok(html.includes('Źródła i weryfikacja'), 'strona statyczna pokazuje listę źródeł');
    assert.ok(html.includes('"citation"'), 'JSON-LD zawiera citation');
  });
}

test('czołówka /news: najnowsze materiały, maks. 6, od najnowszego', () => {
  const app = fs.readFileSync(path.join(ROOT, 'portals/ccn-news/src/App.tsx'), 'utf8');
  assert.match(app, /HERO_LIMIT = 6/);
  assert.match(app, /\.sort\(byNewest\)\s*\.slice\(0, HERO_LIMIT\)/);
});
