// Regresja L0 22.11.2026: stare, ciężkie obrazy nie mogą wrócić do widzów LUMINA / LUMI MESS.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  checkImageCachePolicy,
  checkLuminaImageBudget,
  enforceImageFreshness,
  IMAGE_EXTENSIONS,
  parseHeadersFile,
  patternToRegExp,
} from './cc-image-freshness-guard.mjs';

const ROOT = process.cwd();
const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  .split('\n').filter(Boolean);
const goodRules = IMAGE_EXTENSIONS.map((ext) => `/*.${ext}\n  Cache-Control: public, max-age=86400, stale-while-revalidate=604800\n`).join('\n');

test('obecne repo przechodzi strażnika świeżości obrazów', () => {
  assert.doesNotThrow(() => enforceImageFreshness({ root: ROOT, trackedFiles: tracked }));
});

test('powrót „immutable na rok” dla obrazów (incydent 11.10–22.11) blokuje wydanie', () => {
  const regressed = `${goodRules}\n/*.jpg\n  Cache-Control: public, max-age=31536000, immutable\n`;
  const errors = checkImageCachePolicy(regressed, ['avatar_andrzej_thiel.jpg']);
  assert.ok(errors.some((e) => e.includes('immutable') && e.includes('/avatar_andrzej_thiel.jpg')), errors.join('\n'));
});

test('szeroka reguła katalogu z długim czasem też jest wykrywana', () => {
  const regressed = `${goodRules}\n/images/*\n  Cache-Control: public, max-age=2592000\n`;
  const errors = checkImageCachePolicy(regressed, ['images/chat/lumi_header_logo.webp', 'js/app.js']);
  assert.equal(errors.length, 1, errors.join('\n'));
  assert.match(errors[0], /\/images\/\*/);
});

test('brak reguły dla formatu obrazu jest błędem', () => {
  const withoutGif = goodRules.replace(/\/\*\.gif\n[^\n]*\n/, '');
  assert.ok(checkImageCachePolicy(withoutGif, []).some((e) => e.includes('/*.gif')));
});

test('reguły z krótkim czasem lub no-cache przechodzą', () => {
  const ok = `${goodRules}\n/images/news/*\n  Cache-Control: public, max-age=0, must-revalidate\n/assets/*.js\n  Cache-Control: public, max-age=31536000, immutable\n`;
  assert.deepEqual(checkImageCachePolicy(ok, ['images/news/a.jpg', 'assets/x.webp']), []);
});

test('parser _headers i wzorce Cloudflare Pages', () => {
  const rules = parseHeadersFile('# k\n/a/*\n  X-A: 1\n\n/:slug/foto.png\n  Cache-Control: no-cache\n');
  assert.equal(rules.length, 2);
  assert.ok(patternToRegExp('/a/*').test('/a/b/c.jpg'));
  assert.ok(patternToRegExp('/:slug/foto.png').test('/jan/foto.png'));
  assert.ok(!patternToRegExp('/:slug/foto.png').test('/jan/x/foto.png'));
});

test('ciężkie zdjęcie w LUMINA (jak „master graphics” 21.08) blokuje wydanie, wyjątki nie mogą rosnąć', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-img-guard-'));
  try {
    fs.writeFileSync(path.join(dir, 'ciezkie.jpg'), Buffer.alloc(2 * 1024 * 1024));
    fs.writeFileSync(path.join(dir, 'lekkie.jpg'), Buffer.alloc(100 * 1024));
    fs.writeFileSync(path.join(dir, 'wyjatek.png'), Buffer.alloc(3000));
    const errors = checkLuminaImageBudget(dir, ['ciezkie.jpg', 'lekkie.jpg', 'wyjatek.png'], {
      budget: 1024 * 1024,
      exceptions: { 'wyjatek.png': 2000 },
    });
    assert.equal(errors.length, 2, errors.join('\n'));
    assert.ok(errors.some((e) => e.startsWith('ciezkie.jpg')));
    assert.ok(errors.some((e) => e.startsWith('wyjatek.png') && e.includes('nie może rosnąć')));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('bramka jest podpięta w budowaniu wydania', () => {
  const builder = fs.readFileSync(path.join(ROOT, 'scripts', 'build-pages-release.mjs'), 'utf8');
  assert.match(builder, /import \{ enforceImageFreshness \} from '\.\/cc-image-freshness-guard\.mjs'/);
  assert.match(builder, /enforceImageFreshness\(\{ root: ROOT, trackedFiles: tracked \}\)/);
});
