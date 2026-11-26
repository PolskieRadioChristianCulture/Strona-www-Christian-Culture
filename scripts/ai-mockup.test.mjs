import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { applyPageStandard } from './cc-page-standard.mjs';
import { isPublicFile } from './cc-release-files.mjs';

const ROOT = process.cwd();

test('AI dla Jezusa (/ai/) mockup files and optimized WebP assets exist with clean UTF-8', () => {
  const requiredFiles = [
    'ai/index.html',
    'ai/styles.css',
    'ai/app.js',
    'ai/assets/icon-ai-halo.webp',
    'ai/assets/logo-ai-dla-jezusa.webp',
  ];

  for (const rel of requiredFiles) {
    const full = path.join(ROOT, rel);
    assert.ok(fs.existsSync(full), `Missing file: ${rel}`);
    assert.ok(fs.statSync(full).size > 0, `Empty file: ${rel}`);
    assert.equal(isPublicFile(rel), true, `${rel} must be included in public Pages release`);
  }

  const html = fs.readFileSync(path.join(ROOT, 'ai/index.html'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'ai/styles.css'), 'utf8');
  const js = fs.readFileSync(path.join(ROOT, 'ai/app.js'), 'utf8');

  for (const [label, content] of [['html', html], ['css', css], ['js', js]]) {
    assert.ok(!content.includes('\uFFFD'), `UTF-8 replacement character found in ai ${label}`);
    assert.ok(!/Mission Control/i.test(content), `Forbidden internal phrase found in ai ${label}`);
  }
});

test('AI dla Jezusa (/ai/) preserves 1:1 mockup structure and is exempt from global chrome injection', () => {
  const html = fs.readFileSync(path.join(ROOT, 'ai/index.html'), 'utf8');

  assert.equal(applyPageStandard('ai/index.html', html), html, 'ai/index.html must not receive global overlays');
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  assert.match(html, /CHRISTIAN CULTURE/);
  assert.match(html, /BETA/);
  assert.match(html, /Co dobrego dziś stworzymy\?/);
  assert.match(html, /Technologia w służbie dobra\. Jezus w centrum\./);
  assert.match(html, /Twoja przestrzeń/);
  assert.match(html, /Werset dnia/);
  assert.match(html, /Aktywne projekty/);
  assert.match(html, /Połączone aplikacje/);
  assert.match(html, /AI może się mylić\. Weryfikuj ważne informacje i cytaty biblijne\./);

  const navItems = [
    'Czat', 'Biblia', 'Deep Research', 'Projekty', 'Notatniki', 'Pracownia',
    'Kod', 'Agenci', 'Umiejętności', 'Połączenia', 'Automatyzacje', 'Pamięć',
  ];
  for (const item of navItems) {
    assert.ok(html.includes(`data-nav="${item}"`), `Missing nav item: ${item}`);
  }

  const promptCards = [
    'Studiuj Biblię', 'Znajdź nadzieję', 'Twórz treści',
    'Odkrywaj wiedzę', 'Pracuj z dokumentami', 'Uruchom agenta',
  ];
  for (const card of promptCards) {
    assert.ok(html.includes(`<strong>${card}</strong>`), `Missing prompt card: ${card}`);
  }

  const integrations = ['Biblia Audio CC', 'Google Calendar', 'GitHub'];
  for (const app of integrations) {
    assert.ok(html.includes(`data-app="${app}"`), `Missing connected app: ${app}`);
  }
});

test('Cloudflare _redirects and _worker.js serve /ai and /ai/ directly with HTTP 200 instead of redirecting to /si', () => {
  const redirects = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');
  const worker = fs.readFileSync(path.join(ROOT, '_worker.js'), 'utf8');

  assert.doesNotMatch(redirects, /^\/ai\s+\/si\b/m, '_redirects must not redirect /ai to /si');
  assert.match(redirects, /^\/ai\s+\/ai\/index\.html\s+200$/m);
  assert.match(redirects, /^\/ai\/\s+\/ai\/index\.html\s+200$/m);

  assert.match(worker, /decodedP === '\/ai'\s*\|\|\s*decodedP === '\/ai\/index\.html'/);
  assert.match(worker, /targetUrl\.pathname = '\/ai\/'/);
  assert.doesNotMatch(worker, /decodedP === '\/technologia' \|\| decodedP === '\/ai'/);
});
