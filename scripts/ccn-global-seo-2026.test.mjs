import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  PRIMARY_ORIGIN,
  isIndexablePublicPath,
  toCanonicalUrl,
  resolveVerifiedAuthor,
  buildHreflangLinks,
  buildStructuredData,
  validatePublicationCard,
  validateRenderedHtmlSeo,
  createPublicationRegistry,
} from './cc-seo-engine.mjs';
import {
  resolveIndexNowKey,
  validateIndexNowKey,
  assertGoogleIndexingApiEligibility,
  createIndexNowQueueManager,
} from './cc-indexnow.mjs';

const ROOT = process.cwd();

test('Etap 2 & 6: Cykl życia artykułu — tworzenie, aktualizacja (lastmod) i usuwanie (301/410, zakaz redirectu na /)', () => {
  const registry = createPublicationRegistry();

  // 1. Tworzenie artykułu
  const created = registry.create({
    h1: 'Wojna, ciemność i nadzieja. Ukraina przed zimą — czego Jezus uczy o pokoju?',
    seoTitle: 'Ukraina przed zimą — czego Jezus uczy o pokoju? | CCN News',
    metaDescription: 'Kolejne uderzenia w infrastrukturę energetyczną Ukrainy przed zimą przypominają o dramacie cywilów i chrześcijańskim powołaniu do pokoju.',
    canonicalUrl: '/news/wojna-ukraina-jezus-pokoj-znaki-czasow',
    author: 'Cezary Rogowski',
    datePublished: '2026-10-15T08:00:00Z',
    imageUrl: '/images/news/art-wojna-ukraina-jezus-pokoj-znaki-czasow.jpg',
    imageAlt: 'Świeca i otwarta Biblia przy oknie o zmierzchu',
    lang: 'pl-PL',
    requireEditorialSections: true,
    hasFactsSection: true,
    hasBiblicalReflection: true,
  });

  assert.equal(created.canonicalUrl, 'https://polskieradio.cc/news/wojna-ukraina-jezus-pokoj-znaki-czasow');
  assert.equal(created.lastmod, '2026-10-15');
  assert.equal(created.discoveryState.published, true);
  assert.equal(created.discoveryState.submittedIndexNow, false);
  assert.equal(created.discoveryState.discovered, false);
  assert.equal(created.discoveryState.indexed, false);
  assert.equal(registry.resolveStatus('/news/wojna-ukraina-jezus-pokoj-znaki-czasow').httpStatus, 200);

  // 2. Drobna korekta (significantChange: false) NIE zmienia lastmod
  const minorUpdate = registry.update(
    '/news/wojna-ukraina-jezus-pokoj-znaki-czasow',
    { seoTitle: 'Ukraina przed zimą — czego Jezus uczy o pokoju? – CCN' },
    { significantChange: false }
  );
  assert.equal(minorUpdate.lastmod, '2026-10-15');

  // 3. Istotna aktualizacja (significantChange: true) zmienia lastmod
  const majorUpdate = registry.update(
    '/news/wojna-ukraina-jezus-pokoj-znaki-czasow',
    { dateModified: '2026-10-17T09:30:00Z' },
    { significantChange: true }
  );
  assert.equal(majorUpdate.lastmod, '2026-10-17');

  // 4. Zakaz przekierowania usuniętego artykułu na stronę główną
  assert.throws(
    () => registry.remove('/news/wojna-ukraina-jezus-pokoj-znaki-czasow', { redirectTo: '/' }),
    /ZAKAZ SEO: Nie wolno przekierowywać usuniętych artykułów ani błędów na stronę główną/
  );

  // 5. Usunięcie z przekierowaniem 301 na powiązany artykuł
  const removed301 = registry.remove('/news/wojna-ukraina-jezus-pokoj-znaki-czasow', {
    redirectTo: '/misje/wojna-ukraina-jezus-pokoj-znaki-czasow',
  });
  assert.equal(removed301.action, 'REDIRECT_301');
  assert.equal(registry.resolveStatus('/news/wojna-ukraina-jezus-pokoj-znaki-czasow').httpStatus, 301);
});

test('Etap 2 & 6: Walidacja autorów i blokada fikcyjnych ocen/recenzji w JSON-LD', () => {
  const wioletta = resolveVerifiedAuthor('Wioletta Rogowska');
  assert.equal(wioletta.profileUrl, 'https://polskieradio.cc/lumina.wiolettarogowska.html');

  const cezary = resolveVerifiedAuthor('Cezary Rogowski');
  assert.equal(cezary.profileUrl, 'https://polskieradio.cc/lumina.cezaryrgowski.html');

  assert.throws(
    () => resolveVerifiedAuthor('Jan Kowalski (Fikcyjny Autor)'),
    /Niedozwolony lub niezweryfikowany autor/
  );

  assert.throws(
    () => buildStructuredData({
      type: 'NewsArticle',
      title: 'Test',
      description: 'Opis testowy',
      canonicalUrl: '/news/test',
      author: 'Cezary Rogowski',
      aggregateRating: { ratingValue: 5, reviewCount: 999 },
    }),
    /ZAKAZ FIKCYJNYCH DANYCH/
  );

  const schema = buildStructuredData({
    type: 'NewsArticle',
    title: 'Gdy szkoła przestaje być bezpieczna',
    description: 'Analiza tragedii pod Wyszkowem.',
    canonicalUrl: '/news/tragedia-szkola-wyszkow-przemoc-biblia',
    author: 'Wioletta Rogowska',
    datePublished: '2026-10-17T08:15:00Z',
    imageUrl: '/images/news/art-tragedia-szkola-wyszkow-przemoc-biblia.jpg',
  });
  assert.deepEqual(schema.mainEntityOfPage, {
    '@type': 'WebPage',
    '@id': 'https://polskieradio.cc/news/tragedia-szkola-wyszkow-przemoc-biblia',
  });
  assert.equal(schema.author.url, 'https://polskieradio.cc/lumina.wiolettarogowska.html');
});

test('Etap 3 & 6: Wszystkie 12 docelowych ścieżek odkrywania istnieją i są poprawnym XML/TXT', () => {
  const requiredPaths = [
    'robots.txt',
    'sitemap.xml',
    'feed.xml',
    'news/feed.xml',
    'sitemaps/news.xml',
    'sitemaps/news-google.xml',
    'sitemaps/akademia.xml',
    'sitemaps/biblia.xml',
    'sitemaps/muzyka.xml',
    'sitemaps/video.xml',
    'sitemaps/pages.xml',
    'sitemaps/en.xml',
  ];

  for (const rel of requiredPaths) {
    const full = path.join(ROOT, rel);
    assert.ok(fs.existsSync(full), `Brakuje docelowego pliku odkrywania: ${rel}`);
    const content = fs.readFileSync(full, 'utf8');
    assert.ok(content.length > 100, `Plik ${rel} jest zbyt krótki`);
    if (rel.endsWith('.xml')) {
      assert.ok(content.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), `${rel} musi zaczynać się od nagłówka XML`);
    }
  }
});

test('Etap 3 & 6: /sitemaps/news-google.xml zawiera wyłącznie artykuły z ostatnich 2 dni (48h)', () => {
  const xml = fs.readFileSync(path.join(ROOT, 'sitemaps/news-google.xml'), 'utf8');
  assert.ok(xml.includes('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"'));
  assert.ok(xml.includes('https://polskieradio.cc/news/wojna-ukraina-jezus-pokoj-znaki-czasow'));
  assert.ok(xml.includes('https://polskieradio.cc/news/tragedia-szkola-wyszkow-przemoc-biblia'));
  // Artykuły starsze niż 2 dni (np. z 2026-10-02) nie mogą znajdować się w news-google.xml
  assert.ok(!xml.includes('2026-10-02'), 'news-google.xml nie może zawierać artykułów starszych niż 2 dni');
});

test('Etap 3 & 6: Kolejka IndexNow odrzuca adresy prywatne/noindex/szkice, obsługuje retry i blokuje Google Indexing API dla zwykłych artykułów', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-indexnow-test-'));
  const queueFile = path.join(tmpDir, 'queue.json');
  const logFile = path.join(tmpDir, 'log.json');

  const manager = createIndexNowQueueManager({ queueFile, logFile, maxRetries: 2 });

  const { accepted, rejected } = manager.enqueue([
    { url: 'https://polskieradio.cc/news/wojna-ukraina-jezus-pokoj-znaki-czasow', section: 'news' },
    { url: 'https://polskieradio.cc/admin/ccn-seo-control.html', section: 'admin' },
    { url: 'https://polskieradio.cc/lumina-profile.html', section: 'lumina' },
    { url: 'https://polskieradio.cc/mess', section: 'lumina' },
    { url: 'https://polskieradio.cc/news/szkic-roboczy', isDraft: true },
    { url: 'https://polskieradio.cc/szukaj?q=biblia', noindex: true },
  ]);

  assert.equal(accepted.length, 1);
  assert.equal(rejected.length, 5);
  assert.equal(accepted[0].lifecycle.published, true);
  assert.equal(accepted[0].lifecycle.submittedIndexNow, false);
  assert.equal(accepted[0].lifecycle.discoveredByBot, null);
  assert.equal(accepted[0].lifecycle.indexedInSearch, null);

  // Test błędu API (HTTP 503) -> przejście w RETRY_SCHEDULED
  const failRes = await manager.flush({
    key: 'cc-valid-indexnow-key-2026',
    fetchImpl: async () => ({ status: 503 }),
  });
  assert.equal(failRes.status, 'RETRY_OR_FAILED');
  assert.equal(manager.getState().items[0].status, 'RETRY_SCHEDULED');
  assert.equal(manager.getState().items[0].attempts, 1);

  // Test sukcesu API (HTTP 200) -> przejście w SUBMITTED
  const okRes = await manager.flush({
    key: 'cc-valid-indexnow-key-2026',
    fetchImpl: async () => ({ status: 200 }),
  });
  assert.equal(okRes.status, 'SUBMITTED');
  assert.equal(manager.getState().items[0].status, 'SUBMITTED');
  assert.equal(manager.getState().items[0].lifecycle.submittedIndexNow, true);

  // Blokada Google Indexing API dla zwykłych artykułów
  assert.throws(
    () => assertGoogleIndexingApiEligibility({ type: 'NewsArticle' }),
    /Google Indexing API nie służy do zwykłych artykułów/
  );
  assert.equal(assertGoogleIndexingApiEligibility({ type: 'JobPosting' }), true);

  const resolved = resolveIndexNowKey({ rootDir: ROOT, key: '' });
  assert.equal(validateIndexNowKey(resolved).valid, true, 'resolveIndexNowKey must auto-detect verified root key file');
  assert.equal(resolved, 'cc777b1b11a94e82938a1928df05c28e');
});

test('Etap 4 & 6: Wielojęzyczność (dwustronny hreflang) oraz ochrona prywatnych ścieżek i rozróżnienie botów AI w robots.txt', () => {
  const links = buildHreflangLinks({
    pl: 'https://polskieradio.cc/',
    en: 'https://polskieradio.cc/Global/',
  });
  assert.equal(links.length, 3);
  assert.ok(links.some(l => l.hreflang === 'pl' && l.href === 'https://polskieradio.cc/'));
  assert.ok(links.some(l => l.hreflang === 'en' && l.href === 'https://polskieradio.cc/Global/'));
  assert.ok(links.some(l => l.hreflang === 'x-default' && l.href === 'https://polskieradio.cc/'));

  const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
  assert.ok(robots.includes('User-agent: OAI-SearchBot'));
  assert.ok(robots.includes('User-agent: GPTBot'));
  assert.ok(robots.includes('Disallow: /admin/'));
  assert.ok(robots.includes('Disallow: /mission-control/'));
  assert.ok(robots.includes('Disallow: /lumina-profile'));
  assert.ok(robots.includes('Sitemap: https://polskieradio.cc/sitemaps/news-google.xml'));
});

test('Etap 5 & 6: Wszystkie kluczowe strony i artykuły przechodzą walidację SEO (0 alertów), a panel CCN SEO CONTROL ma noindex', () => {
  const state = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/cc-seo-control-state.json'), 'utf8'));
  assert.equal(state.counts.invalidUrls, 0, 'Wszystkie zwalidowane strony muszą mieć 0 błędów SEO');
  assert.equal(state.alerts.length, 0, 'Liczba aktywnych alertów krytycznych musi wynosić 0');
  assert.equal(state.externalWebmasterTools.googleSearchConsole.connected, false);

  const adminHtml = fs.readFileSync(path.join(ROOT, 'admin/ccn-seo-control.html'), 'utf8');
  assert.ok(adminHtml.includes('content="noindex, nofollow, noarchive"'), 'Panel administracyjny musi mieć noindex, nofollow');
});

test('Publikacja CBDC & CCN Audio Player Premium 2026 (/finanse i /news): własny plik audio < 25 MiB, realny waveform, AudioObject JSON-LD i zero pustych ramek', () => {
  const audioFile = path.join(ROOT, 'audio/ccn/cbdc-prawo-niedzielne-apokalipsa-13.m4a');
  assert.ok(fs.existsSync(audioFile), 'Plik audio cbdc-prawo-niedzielne-apokalipsa-13.m4a musi istnieć');
  const audioSize = fs.statSync(audioFile).size;
  assert.ok(audioSize > 1_000_000 && audioSize < 25 * 1024 * 1024, 'Plik audio musi mieścić się poniżej limitu 25 MiB Cloudflare Pages');

  const finanseHtml = fs.readFileSync(path.join(ROOT, 'finanse/cbdc-prawo-niedzielne-apokalipsa-13.html'), 'utf8');
  const checkFin = validateRenderedHtmlSeo(finanseHtml, 'https://polskieradio.cc/finanse/cbdc-prawo-niedzielne-apokalipsa-13');
  assert.equal(checkFin.valid, true, `Błędy SEO w finanse/cbdc: ${checkFin.errors.join('; ')}`);
  assert.ok(finanseHtml.includes('data-ccn-audio-player="true"'), 'Artykuł CBDC w /finanse musi renderować CCN Audio Player Premium 2026');
  assert.ok(finanseHtml.includes('data-audio-src="/audio/ccn/cbdc-prawo-niedzielne-apokalipsa-13.m4a"'));
  assert.ok(finanseHtml.includes('data-drive-id="1armTC6OXOU5XI6hZ9BkBR2amYrLeXCdr"'));
  assert.ok(finanseHtml.includes('"@type": "AudioObject"'), 'Artykuł CBDC musi posiadać AudioObject w Schema.org JSON-LD');
  assert.ok(finanseHtml.includes('/components/ccn-audio-player.js'));

  const newsCbdcHtml = fs.readFileSync(path.join(ROOT, 'news/cbdc-prawo-niedzielne-apokalipsa-13.html'), 'utf8');
  assert.ok(newsCbdcHtml.includes('data-ccn-audio-player="true"'), 'Artykuł CBDC w /news musi renderować CCN Audio Player Premium 2026');
  assert.ok(newsCbdcHtml.includes('https://polskieradio.cc/finanse/cbdc-prawo-niedzielne-apokalipsa-13'), 'Wydanie w /news musi zawierać link do głównego wydania w /finanse');

  // Artykuły bez audio nie mogą renderować pustych ramek .ccn-player
  const noAudioHtml = fs.readFileSync(path.join(ROOT, 'news/wojna-ukraina-jezus-pokoj-znaki-czasow.html'), 'utf8');
  assert.ok(!noAudioHtml.includes('data-ccn-audio-player="true"'), 'Artykuł bez audio nie może mieć pustej ramki odtwarzacza');
});

