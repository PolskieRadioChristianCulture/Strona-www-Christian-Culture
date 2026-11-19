import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://polskieradio.cc';
const manifestPath = '/cc-pomoc/catalog.json';
const localManifest = new URL('..' + manifestPath, import.meta.url);
const expected = JSON.parse(await readFile(localManifest, 'utf8'));
const topics = expected.sections.flatMap(section => section.items);
const languages = ['pl', 'en'];
const routes = languages.flatMap(lang => topics.map(topic => ({ lang, route: topic.route[lang] })));
const [mode = '--production', ...extra] = process.argv.slice(2);
assert.ok(!extra.length && ['--production', '--artifact'].includes(mode), 'Use --production or --artifact');
assert.equal(topics.length, 100);
assert.ok(topics.every(topic => topic.status === 'published' && languages.every(lang => /^\//.test(topic.route[lang]))));
assert.equal(new Set(routes.map(({ route }) => route)).size, 200);

async function fromProduction(route) {
  const response = await fetch(origin + route, {
    cache: 'no-store',
    signal: AbortSignal.timeout(15000)
  });
  assert.equal(response.status, 200, route + ': HTTP ' + response.status);
  const finalUrl = new URL(response.url);
  assert.equal(finalUrl.origin, origin, route + ': redirected to a different host');
  assert.equal(finalUrl.pathname.replace(/\/$/, ''), route, route + ': redirected to a different page');
  return response.text();
}

const artifact = new URL('../.pages-release/', import.meta.url);
function fromArtifact(route) {
  const file = path.posix.extname(route) ? route.slice(1) : route.slice(1) + '/index.html';
  return readFile(new URL(file, artifact), 'utf8');
}

const read = mode === '--artifact' ? fromArtifact : fromProduction;
async function verifyRelease() {
  const actual = JSON.parse(await read(manifestPath));
  assert.equal(actual.sections.flatMap(section => section.items).filter(topic => topic.status === 'published').length,
    topics.length, 'Number of published topics differs from the canonical manifest');
  assert.deepEqual(actual.sections, expected.sections, 'Published catalog differs from the canonical manifest');

  const sitemap = await read('/sitemaps/cc-pomoc.xml');
  const locations = [...sitemap.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(match => match[1].trim()).sort();
  assert.deepEqual(locations, routes.map(({ route }) => origin + route).sort(), 'Sitemap must list all 200 expected URLs once');

  const hub = await read('/help');
  const hubLinks = [...hub.matchAll(/class="help-card" href="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(hubLinks, [...topics.map(topic => topic.route.pl), '/holistyczny-coaching'], 'Hub links differ from the catalog');
  assert.doesNotMatch(hub, /\bsearch_term\s*:/, 'Hub must not send search text to analytics');

  const ids = topics.map(topic => topic.id);
  function verifyPage(html, { lang, route }) {
    const pageLang = html.match(/<html\b[^>]*\blang="([^"]+)"/i)?.[1];
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    assert.equal(pageLang, lang, route + ': page language');
    assert.equal(canonical, origin + route, route + ': canonical URL');
    const panel = html.match(/<dialog\b[^>]*\bid="edge-panel"[^>]*>([\s\S]*?)<\/dialog>/i)?.[1];
    assert.ok(panel, route + ': missing sidebar');
    const entries = [...panel.matchAll(/<li data-help-topic="([^"]+)"><a href="([^"]+)"/g)];
    assert.deepEqual(entries.map(match => match[1]), ids, route + ': sidebar topic order and completeness');
    assert.deepEqual(entries.map(match => match[2]), topics.map(topic => topic.route[lang]), route + ': sidebar destinations');
    const topic = topics.find(item => item.route[lang] === route);
    for (const alternate of languages) {
      const link = 'hreflang="' + alternate + '" href="' + origin + topic.route[alternate] + '"';
      assert.ok(html.includes(link), route + ': language link ' + alternate);
    }
  }

  const failures = [];
  for (let start = 0; start < routes.length; start += 8) {
    const batch = routes.slice(start, start + 8);
    const results = await Promise.allSettled(batch.map(async entry => verifyPage(await read(entry.route), entry)));
    results.forEach((result, index) => {
      if (result.status === 'rejected') failures.push(batch[index].route + ': ' + result.reason.message.split('\n')[0]);
    });
  }
  if (failures.length) {
    failures.forEach(failure => console.error(failure));
    process.exitCode = 1;
  }
  console.log(mode + ': ' + (routes.length - failures.length) + '/' + routes.length + ' pages, hub, sitemap and catalog verified');
}

try {
  await verifyRelease();
} catch (error) {
  console.error(mode + ': ' + error.message);
  process.exitCode = 1;
}
