import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isPublicFile } from './cc-release-files.mjs';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const html = fs.readFileSync(path.join(ROOT, 'wspieramto/panel/index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'wspieramto/panel/panel.css'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'wspieramto/panel/panel.js'), 'utf8');
const worker = fs.readFileSync(path.join(ROOT, '_worker.js'), 'utf8');
const redirects = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');
const authJs = fs.readFileSync(path.join(ROOT, 'js/cc-global-auth.js'), 'utf8');
const modalJs = fs.readFileSync(path.join(ROOT, 'components/cc-wspieramto-modal.js'), 'utf8');
const centrumHtml = fs.readFileSync(path.join(ROOT, 'moje-centrum.html'), 'utf8');
const wspIndexHtml = fs.readFileSync(path.join(ROOT, 'wspieramto/index.html'), 'utf8');
const wspRootHtml = fs.readFileSync(path.join(ROOT, 'wspieramto.html'), 'utf8');

test('WspieramTO Panel Użytkownika (/wspieramto/panel) files exist, pass isPublicFile, and use noindex for private wallet', () => {
  for (const rel of ['wspieramto/panel/index.html', 'wspieramto/panel/panel.css', 'wspieramto/panel/panel.js']) {
    assert.equal(fs.existsSync(path.join(ROOT, rel)), true, `Brak pliku: ${rel}`);
    assert.equal(isPublicFile(rel), true, `${rel} musi przejść isPublicFile`);
  }
  assert.match(html, /<meta\s+name="robots"\s+content="noindex,\s*nofollow">/i);
  assert.match(html, /<link\s+rel="canonical"\s+href="https:\/\/polskieradio\.cc\/wspieramto\/panel">/i);
});

test('WspieramTO Panel Użytkownika enforces FULL PREMIUM shell, canonical GA4, Favorites, CCEco, Zero Font-Awesome & Zero leaks', () => {
  assert.match(html, /<\/script><script src="\/js\/cc-analytics\.js\?v=20261026_1" defer><\/script>/);
  assert.match(html, /class="header-right\b/);
  assert.match(html, /\/js\/cc-favorites\.js/);
  assert.match(html, /\/js\/cc-global-auth\.js/);
  assert.match(html, /\/js\/cc-eco-bars\.js/);
  assert.match(html, /\/js\/cc-pro-manager\.js/);
  assert.match(html, /id="tickRun"/);
  assert.match(html, /id="promoStage"/);
  assert.match(html, /id="scrollProgressBar"/);
  assert.match(html, /id="heroParticles"/);
  assert.match(html, /\/app-christian-culture\.png/);
  assert.doesNotMatch(html, /app-christian-culture\.webp/i);
  assert.doesNotMatch(html, /font-awesome|fontawesome|\bfa-[a-z-]+/i);
  assert.doesNotMatch(js, /\bfa-[a-z-]+/i);
  for (const txt of [html, css, js]) {
    assert.doesNotMatch(txt, /Mission\s+Control/i);
    assert.doesNotMatch(txt, /Studio\s+Dobrego\s+Słowa|Studia\s+Dobrego\s+Słowa|\bSDS\b/i);
  }
});

test('WspieramTO Panel Użytkownika implements auth gate for guests and full central wallet for signed-in users', () => {
  assert.match(html, /id="panelAuthGate"/);
  assert.match(html, /id="userPanelContent"\s+hidden/);
  assert.match(html, /id="panelServicesGrid"/);
  assert.match(html, /id="panelWalletLog"/);
  assert.match(html, /id="panelActivatePatronBtn"/);
  assert.match(js, /CCProManager\.getServices|CCProManager\.SERVICES/);
  assert.match(js, /CCProManager\.activatePatron/);
  assert.match(js, /CCProManager\.deactivatePatron/);
  assert.match(js, /CCProManager\.getWalletLog/);
  assert.match(js, /ccLoginWithGoogle/);
});

test('Routing and cross-ecosystem navigation links to /wspieramto/panel are active and consistent', () => {
  assert.match(worker, /path === '\/wspieramto\/panel' \|\| path === '\/wspieramto\/panel\/'/);
  assert.match(redirects, /\/wspieramto\/panel\s+\/wspieramto\/panel\/index\.html\s+200/);
  assert.match(authJs, /href="\/wspieramto\/panel"/);
  assert.match(modalJs, /href="\/wspieramto\/panel"/);
  assert.match(centrumHtml, /href="\/wspieramto\/panel"/);
  assert.match(wspIndexHtml, /href="\/wspieramto\/panel"/);
  assert.equal(wspIndexHtml, wspRootHtml, 'wspieramto/index.html i wspieramto.html muszą być w 100% identyczne');
});
