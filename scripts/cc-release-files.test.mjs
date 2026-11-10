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
  'serviceAccountKey.json', 'config/service-account.json', 'project-firebase-adminsdk-example.json',
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
    'kurs-codzienny/straznik-lekcji.mjs', 'kurs-codzienny/lib.mjs']) {
    put('scripts/' + file, fs.readFileSync(new URL(file, import.meta.url)));
  }
  put('data/cc-channels.json', fs.readFileSync(new URL('../data/cc-channels.json', import.meta.url)));
  put('package.json', '{"type":"module"}');
  const html = '<html><head><title>Fixture</title><link rel="manifest" href="manifest-lumina.json"></head><body class="user-is-guest"><div id="directMessagesModal"></div></body></html>';
  for (const file of ['index.html', 'semantic-index.html', 'lumina.html', 'lumina-tablica.html']) put(file, html);
  for (const file of ['data/ccn-article-routes.js', '_headers', '_redirects', '_worker.js', 'lib/bu-voting-worker.js',
    'firebase-messaging-sw.js', 'manifest-lumina.json', 'robots.txt', 'js/cc-back-to-top.js', 'js/cc-edge-plus.js', 'components/cc-omni-search.js', 'js/cc-favorites.js']) put(file, 'fixture');
  const frozen = ['cctv24-worship.html', 'cctv24-worship-live.html', 'stream-scene.html', 'cctv24.html', 'snadaniowa-live.html', 'zapolske-live.html'];
  for (const file of frozen) put(file, html);
  for (const file of privatePaths) put(file, 'PRIVATE_FIXTURE_MARKER');
  // Git's own metadata is tested by the predicate, never overwritten in the fixture.
  fs.rmSync(path.join(root, '.git'), { recursive: true, force: true });
  const git = args => execFileSync('git', args, { cwd: root, windowsHide: true, stdio: 'pipe' });
  git(['init', '-q']); git(['add', '-f', '.']);
  git(['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'fixture']);
  const result = spawnSync(process.execPath, ['scripts/build-pages-release.mjs'], { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 30000 });
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
