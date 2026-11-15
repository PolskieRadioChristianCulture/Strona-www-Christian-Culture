import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { isPublicFile } from './cc-release-files.mjs';

const read = p => readFile(new URL('../' + p, import.meta.url), 'utf8');
const html = await read('news.html');
const source = await read('portals/ccn-news/index.html');
const scriptPath = html.match(/src="(\/assets\/news-index-[^"]+\.js)"/)[1];
const cssPath = html.match(/href="(\/assets\/news-index-[^"]+\.css)"/)[1];
const js = await read(scriptPath.slice(1));
const css = await read(cssPath.slice(1));

test('both public news routes use the same current build and entry shell', async () => {
  assert.equal(html, await read('news/index.html'));
  assert.ok(source.includes('src="/src/main.tsx"'));
  assert.ok(!html.includes('src="/src/main.tsx"'));
  for (const value of ['news-ecosystem-strip', 'news-ecosystem-row', 'news-ecosystem-links', 'news-ecosystem-nav', 'Portale Christian Culture']) {
    assert.ok(js.includes(value), `Published JS lost header contract: ${value}`);
  }
});

test('published flex ancestors can shrink while links keep their own horizontal scroll area', () => {
  assert.match(css, /\.news-ecosystem-strip[^{}]*\{[^}]*min-width:0[^}]*max-width:100%/);
  assert.match(css, /\.news-ecosystem-links\{[^}]*flex:1(?: 1 0%)?(?:;|\})/);
  const nav = css.match(/\.news-ecosystem-nav\{([^}]+)\}/)[1];
  assert.match(nav, /min-width:0/);
  assert.match(nav, /overflow:(?:auto hidden)|overflow-x:auto/);
  const links = css.match(/\.news-ecosystem-nav a\{([^}]+)\}/)[1];
  assert.match(links, /flex-shrink:0/);
  assert.match(links, /white-space:nowrap/);
});

test('cold entry offers navigable CC branding and a layout preview instead of the white loading card', () => {
  assert.ok(html.includes('id="ccn-critical-entry"'));
  assert.ok(html.includes('class="news-startup-nav"'));
  assert.ok(html.includes('class="news-startup-media"'));
  assert.ok(html.includes('class="news-startup-help" hidden'));
  assert.ok(html.includes('<noscript>'));
  assert.ok(!html.includes('Ładowanie wiadomości…'));
  assert.ok(!html.includes('max-width:34rem;margin:4rem auto'));
});

const timeoutCode = html.slice(html.indexOf('setTimeout(function ()'), html.indexOf('// FLOATING BACK TO TOP BUTTON LOGIC'));
test('slow or failed startup offers recovery after 15 seconds', () => {
  let callback, delay;
  const message = { textContent: '' }, help = { hidden: true };
  vm.runInNewContext(timeoutCode, {setTimeout(fn, ms) {callback=fn;delay=ms;}, document: {getElementById: id => id === 'news-startup-message' ? message : help}});
  assert.equal(help.hidden, true);
  assert.equal(delay, 15000);
  callback();
  assert.equal(help.hidden, false);
  assert.match(message.textContent, /Sprawdź połączenie/);
});

test('successful React mount leaves no delayed error or DOM mutation', () => {
  let callback;
  vm.runInNewContext(timeoutCode, {setTimeout(fn) {callback=fn;}, document: {getElementById: () => null}});
  assert.doesNotThrow(() => callback());
});

test('canonical build uses portable repository paths and does not overwrite another agent scratch', async () => {
  const builder = await read('scripts/build-ccn-news.mjs');
  assert.ok(builder.includes('portals/ccn-news'));
  assert.ok(!builder.includes('.gemini'));
  assert.ok(!builder.includes('Desktop'));
  assert.ok((await read('AGENTS.md')).includes('CC_NO_REGRESSION_POLICY.md'));
});

test('all 20 CCN thematic portals have 100% of referenced script and css assets tracked in Git and present on disk', async () => {
  const CCN_PORTALS = [
    'news', 'nauka', 'historia', 'biologia', 'prawo',
    'seks', 'kultura', 'biznes', 'kuchnia', 'ziu',
    'ogloszenia', 'wspolpraca', 'network', 'biblioteka',
    'edukacja', 'psychologia', 'finanse', 'technologie',
    'misje', 'apologetyka'
  ];

  const gitOutput = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' });
  const tracked = new Set(gitOutput.split('\0').filter(Boolean).map(f => f.replace(/\\/g, '/')));

  for (const portal of CCN_PORTALS) {
    const htmlFile = `${portal}.html`;
    const content = await read(htmlFile);
    assert.ok(content.length > 0, `Portal HTML is missing or empty: ${htmlFile}`);

    const matches = [...content.matchAll(/(?:src|href)=["']\/assets\/([^"'?#]+)["']/g)];
    for (const m of matches) {
      const assetRel = `assets/${m[1]}`.replace(/\\/g, '/');
      assert.ok(existsSync(assetRel), `Asset referenced in ${htmlFile} missing on disk: ${assetRel}`);
      assert.ok(tracked.has(assetRel), `Asset referenced in ${htmlFile} is NOT tracked in Git: ${assetRel}`);
      assert.ok(isPublicFile(assetRel), `Asset ${assetRel} is blocked by isPublicFile`);
    }
  }
});

test('news.html provides immediate runtime fallback on script bundle error', async () => {
  const newsHtml = await read('news.html');
  assert.match(newsHtml, /<script[^>]+(?:src="\/assets\/news-index-[^"]+\.js"[^>]*\bonerror=|\bonerror=[^>]*src="\/assets\/news-index-[^"]+\.js")[^>]*>/);
  assert.ok(newsHtml.includes('news-startup-articles'));
  assert.ok(newsHtml.includes('news-startup-message'));
  assert.ok(newsHtml.includes('news-startup-help'));
});
