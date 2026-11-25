import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { isPublicFile } from './cc-release-files.mjs';

const privatePaths = [
  '.env', '.env.production', 'nested/.ENV.LOCAL',
  'data/whatsapp_hooks_state.json', 'data/whatsapp_zaczepki_log.json', 'data/whatsapp_zaczepki_state.json',
  'Repozytoria-CC/skrzynka/global-previews/private.png', 'JOMA_SHARED_MEMORY/private.json',
  '.codex/config.json', '.cursor/rules/local.mdc', '.git/config', '.claude/settings.json',
  'cert/private.pem', 'cert/private.KEY', 'cert/client.p12', 'cert/client.pfx',
  'serviceAccountKey.json', 'luminaServiceAccountKey.json', 'cudaServiceAccountKey.json',
  'patronite/state/patronite.sqlite', 'patronite/logs/audit.jsonl', 'patronite/src/pipeline.mjs',
  'patronite/zrzutka/state/latest-cycle-status.json', 'patronite/zrzutka/drafts/ZRZ-20261123-mission-report/post.json',
  'wiadomosci-z-nieba/state/wiadomosci.sqlite', 'wiadomosci-z-nieba/src/pipeline.mjs', 'wiadomosci-z-nieba/reports/ALERTS.md',
  'nested/custom_service_account_key.json', 'config/service-account.json', 'project-firebase-adminsdk-example.json',
  'storage.rules', 'firestore.rules',
];

test('private operational files, credentials and environment variants are excluded, including Windows paths', () => {
  for (const file of privatePaths) {
    assert.equal(isPublicFile(file), false, file);
    assert.equal(isPublicFile(file.replaceAll('/', '\\')), false, file);
  }
});

test('absolute, traversal, empty and malformed paths cannot enter the release', () => {
  for (const file of ['', '../outside.json', 'data/../outside.json', '/index.html', 'C:\\index.html', '\\\\host\\share\\index.html', './index.html', 'data//index.json', 'bad\0.json', null]) {
    assert.equal(isPublicFile(file), false, String(file));
  }
});

test('public assets and the required worker helper retain their release contract', () => {
  for (const file of ['index.html', '_worker.js', '_headers', '_redirects', 'firebase-messaging-sw.js',
    'lib/bu-voting-worker.js', 'data/bible/strong_lexicon.json', 'data/ccn-article-routes.js',
    'data/cc-channels.json', 'data/ecosystem-map.json', 'manifest-lumina.json',
    'images/news/art-example.jpg', 'assets/news-index-example.js', '.well-known/security.txt',
    'test/patronite/index.html', 'test/patronite/simulation-data.json',
    'test/zrzutka/index.html', 'test/zrzutka/simulation-data.json',
    'test/oferta/index.html', 'test/oferta/oferta.css', 'test/oferta/oferta.js',
    'test/wspieramto/index.html', 'test/wspieramto/wspieramto-v3.css', 'test/wspieramto/wspieramto-v3.js',
    'test/kartki/index.html', 'test/kartki/kartki.css', 'test/kartki/kartki.js', 'test/kartki/assets/card-urodziny.webp',
    'test/wiadomosci-z-nieba/index.html', 'test/wiadomosci-z-nieba/simulation-data.json', 'images/lumina/wiadomosci-z-nieba-avatar.png', 'images/lumina/wiadomosci-z-nieba-avatar.webp',
    'wiadomosc-z-nieba/index.html', 'wiadomosc-z-nieba/data.json', 'images/wiadomosc-z-nieba/hero-16x9.webp',
    'cctv24-worship.html', 'stream-scene.html']) assert.equal(isPublicFile(file), true, file);
  for (const file of ['scripts/internal.js', 'functions/internal.js', 'lib/private.js', 'package.json', 'backup/private.json', 'source.ts']) assert.equal(isPublicFile(file), false, file);
});

test('real release builder excludes private fixtures and keeps public and frozen files in an isolated clean Git repository', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-public-release-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const put = (file, content) => {
    const destination = path.join(root, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, content);
  };
  for (const file of ['build-pages-release.mjs', 'cc-release-files.mjs', 'cc-release-secret-scan.mjs',
    'daily-course-manifest.mjs', 'cc-page-standard.mjs', 'cc-channel-numbering.mjs', 'lumi-page.mjs', 'lumi-dashboard.mjs',
    'kurs-codzienny/straznik-lekcji.mjs', 'kurs-codzienny/lib.mjs', 'cc-release-branch-guard.mjs', 'cc-protected-pages.mjs', 'cc-image-freshness-guard.mjs']) {
    put('scripts/' + file, fs.readFileSync(new URL(file, import.meta.url)));
  }
  put('data/cc-channels.json', fs.readFileSync(new URL('../data/cc-channels.json', import.meta.url)));
  put('package.json', '{"type":"module"}');
  const html = '<html><head><title>Fixture</title><link rel="manifest" href="manifest-lumina.json"></head><body class="user-is-guest"><div id="directMessagesModal"></div></body></html>';
  for (const file of ['index.html', 'semantic-index.html', 'lumina.html', 'lumina-tablica.html']) put(file, html);
  for (const file of ['data/ccn-article-routes.js', '_headers', '_redirects', '_worker.js', 'lib/bu-voting-worker.js',
    'firebase-messaging-sw.js', 'manifest-lumina.json', 'robots.txt', 'js/cc-back-to-top.js', 'js/cc-edge-plus.js', 'components/cc-omni-search.js', 'js/cc-favorites.js']) put(file, 'fixture');
  // Prawdziwe _headers: strażnik świeżości obrazów (cc-image-freshness-guard.mjs) sprawdza w budowaniu politykę cache.
  put('_headers', fs.readFileSync(new URL('../_headers', import.meta.url)));
  const frozen = ['cctv24-worship.html', 'cctv24-worship-live.html', 'stream-scene.html', 'cctv24.html', 'snadaniowa-live.html', 'zapolske-live.html'];
  for (const file of frozen) put(file, html);
  for (const file of privatePaths) put(file, 'PRIVATE_FIXTURE_MARKER');
  // Git's own metadata is tested by the predicate, never overwritten in the fixture.
  fs.rmSync(path.join(root, '.git'), { recursive: true, force: true });
  const git = args => execFileSync('git', args, { cwd: root, windowsHide: true, stdio: 'pipe' });
  git(['init', '-q']); git(['add', '-f', '.']);
  git(['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'fixture']);
  // Repo-fikstura nie ma origin ani chronionych stron — bramka gałęzi i chronione strony mają własne testy
  // (cc-release-branch-guard.test.mjs, cc-protected-pages.test.mjs).
  const result = spawnSync(process.execPath, ['scripts/build-pages-release.mjs'], { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 30000, env: { ...process.env, CC_RELEASE_BRANCH_GUARD: 'off', CC_PROTECTED_PAGES_GUARD: 'off' } });
  assert.equal(result.status, 0, result.stderr);
  const output = path.join(root, '.pages-release');
  for (const file of privatePaths) assert.equal(fs.existsSync(path.join(output, file)), false, file);
  for (const file of ['index.html', '_worker.js', 'lib/bu-voting-worker.js', 'data/cc-channels.json', 'mess.html', 'data/daily-course-push.json']) assert.equal(fs.existsSync(path.join(output, file)), true, file);
  for (const file of frozen) assert.equal(fs.readFileSync(path.join(output, file), 'utf8'), html, file);
});

test('mandatory regression includes the release file boundary tests', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.ok(pkg.scripts['test:cc-regression'].split(/\s+/).includes('scripts/cc-release-files.test.mjs'));
});
