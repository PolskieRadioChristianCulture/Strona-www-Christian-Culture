import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('robots.txt: defines strict crawl budget protection and AI crawler access', () => {
  const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');

  // 1. General rules
  assert.ok(robots.includes('User-agent: *'), 'has User-agent: *');
  assert.ok(robots.includes('Disallow: /*?q=*'), 'blocks ?q=* globally');
  assert.ok(robots.includes('Disallow: /*?query=*'), 'blocks ?query=* globally');
  assert.ok(robots.includes('Disallow: /admin/'), 'blocks /admin/');
  assert.ok(robots.includes('Disallow: /mission-control/'), 'blocks /mission-control/');
  assert.ok(robots.includes('Disallow: /mess'), 'blocks /mess');

  // 2. Specific bot inheritance (RFC 9309)
  const botsToCheck = ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'PerplexityBot', 'GPTBot', 'ClaudeBot'];
  for (const bot of botsToCheck) {
    const botIdx = robots.indexOf(`User-agent: ${bot}`);
    assert.ok(botIdx !== -1, `declares User-agent: ${bot}`);
    const nextAgentIdx = robots.indexOf('User-agent:', botIdx + 1);
    const botSection = robots.slice(botIdx, nextAgentIdx !== -1 ? nextAgentIdx : undefined);
    assert.ok(botSection.includes('Disallow: /*?q=*'), `${bot} section explicitly blocks ?q=*`);
  }

  // 3. Sitemaps registration
  assert.ok(robots.includes('Sitemap: https://polskieradio.cc/sitemap.xml'), 'registers root sitemap.xml');
  assert.ok(robots.includes('Sitemap: https://polskieradio.cc/sitemaps/pages.xml'), 'registers pages.xml');
  assert.ok(robots.includes('Sitemap: https://polskieradio.cc/sitemaps/biblia.xml'), 'registers biblia.xml');
  assert.ok(robots.includes('Sitemap: https://polskieradio.cc/sitemaps/akademia.xml'), 'registers akademia.xml');
  assert.ok(robots.includes('Sitemap: https://polskieradio.cc/sitemaps/news.xml'), 'registers news.xml');

  // 4. Clean encoding (no broken unicode artifacts)
  assert.ok(!robots.includes('\uFFFD'), 'has no unicode replacement chars');
});

test('sitemap.xml: acts as a valid canonical sitemapindex', () => {
  const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  assert.ok(xml.includes('<sitemapindex'), 'root is sitemapindex');
  assert.ok(!xml.includes('/mess'), 'does not contain /mess');

  const locMatches = [...xml.matchAll(/<loc>https:\/\/polskieradio\.cc\/([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.ok(locMatches.length >= 7, 'has at least 7 sub-sitemaps');
  // Mapa może być plikiem albo generowana na żywo przez _worker.js (np. /sitemaps/topten.xml z lastmod ostatniego głosu).
  const workerCode = fs.readFileSync(path.join(ROOT, '_worker.js'), 'utf8');
  for (const subSitemap of locMatches) {
    const localFile = path.join(ROOT, subSitemap);
    const servedByWorker = workerCode.includes(`url.pathname === '/${subSitemap}'`);
    assert.ok(fs.existsSync(localFile) || servedByWorker, `referenced sub-sitemap exists: ${subSitemap}`);
  }
});

test('sitemaps/pages.xml: includes /wyszukiwarka, /player and excludes /mess', () => {
  const xml = fs.readFileSync(path.join(ROOT, 'sitemaps/pages.xml'), 'utf8');
  assert.ok(xml.includes('<loc>https://polskieradio.cc/wyszukiwarka</loc>'), 'includes /wyszukiwarka');
  assert.ok(xml.includes('<loc>https://polskieradio.cc/player</loc>'), 'includes /player');
  assert.ok(xml.includes('<loc>https://polskieradio.cc/modlitwa</loc>'), 'includes /modlitwa');
  assert.ok(!xml.includes('/mess'), 'excludes /mess');
});

test('wyszukiwarka.html: contains canonical, robots meta, and valid Schema.org JSON-LD', () => {
  const html = fs.readFileSync(path.join(ROOT, 'wyszukiwarka.html'), 'utf8');
  assert.ok(html.includes('<link rel="canonical" href="https://polskieradio.cc/wyszukiwarka">'), 'has canonical link');
  assert.ok(html.includes('name="robots" content="index, follow'), 'has index, follow robots meta');
  assert.ok(html.includes('name="ai-agent"'), 'has ai-agent meta tag');
  assert.ok(html.includes('type="application/ld+json"'), 'has JSON-LD script');
  assert.ok(html.includes('"@type": "SearchAction"'), 'declares SearchAction');
  assert.ok(html.includes('"@type": "BreadcrumbList"'), 'declares BreadcrumbList');
  assert.ok(html.includes('"urlTemplate": "https://polskieradio.cc/wyszukiwarka?q={search_term_string}"'), 'SearchAction urlTemplate is correct');
});

test('_worker.js: edge crawl budget protection and www canonical redirect', () => {
  const workerCode = fs.readFileSync(path.join(ROOT, '_worker.js'), 'utf8');
  // 1. WWW redirect
  assert.ok(workerCode.includes("url.hostname === 'www.polskieradio.cc'"), 'detects www hostname');
  assert.ok(workerCode.includes("Response.redirect(canonicalTarget.toString(), 301)"), 'returns 301 for www');

  // 2. Query parameter noindex protection
  assert.ok(workerCode.includes("url.searchParams.has('q') || url.searchParams.has('query')"), 'checks q/query params');
  assert.ok(workerCode.includes("'X-Robots-Tag', 'noindex, follow, noarchive'"), 'sets noindex on query parameters');
  assert.ok(workerCode.includes("'X-Robots-Tag', 'index, follow, max-image-preview:large'"), 'sets index on clean wyszukiwarka');
});

test('llms.txt: includes /wyszukiwarka and latest course progress', () => {
  const txt = fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8');
  assert.ok(txt.includes('https://polskieradio.cc/wyszukiwarka'), 'features /wyszukiwarka');
  assert.ok(txt.includes('Lekcja 28'), 'mentions Lekcja 28');
});
