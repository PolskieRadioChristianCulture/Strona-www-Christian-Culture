import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  validateGbpPost,
  buildTrackedCtaUrl,
  prepareGbpImage4x3,
  pickNextQueuedPost
} from './gbp_policy_guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const QUEUE_PATH = path.join(REPO_ROOT, 'data', 'gbp_posts_queue.json');

test('gbp_posts_queue.json zawiera 12 poprawnych postów i wszystkie grafiki istnieją na dysku', () => {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  assert.equal(Array.isArray(queue.posts), true);
  assert.equal(queue.posts.length, 12);

  for (const post of queue.posts) {
    const res = validateGbpPost(post, REPO_ROOT);
    assert.equal(res.valid, true, `Post ${post.id} powinien być poprawny, błędy: ${res.errors.join(', ')}`);
  }
});

test('validateGbpPost odrzuca numer telefonu, e-mail, goły URL, frazy zabronione i za krótki tekst', () => {
  const validSample = {
    id: 'test_sample',
    pillar: 'news',
    postType: 'UPDATE',
    summary:
      'Codzienna lekcja Pisma Świętego w naszym bezpłatnym portalu edukacyjnym pozwala spokojnie poznawać treść Biblii rozdział po rozdziale razem z kontekstem historycznym.',
    ctaLabel: 'Więcej informacji',
    ctaUrl: 'https://polskieradio.cc/akademia',
    imagePath: 'images/academy_hero_journey.jpg'
  };

  assert.equal(validateGbpPost(validSample, REPO_ROOT).valid, true);

  assert.equal(
    validateGbpPost({ ...validSample, summary: validSample.summary + ' Dzwoń +48 507 821 789.' }, REPO_ROOT).valid,
    false
  );
  assert.equal(
    validateGbpPost({ ...validSample, summary: validSample.summary + ' Napisz na test@example.com.' }, REPO_ROOT).valid,
    false
  );
  assert.equal(
    validateGbpPost({ ...validSample, summary: validSample.summary + ' Odwiedź https://polskieradio.cc.' }, REPO_ROOT).valid,
    false
  );
  assert.equal(
    validateGbpPost({ ...validSample, summary: 'Zbyt krótki opis.' }, REPO_ROOT).valid,
    false
  );
  assert.equal(
    validateGbpPost({ ...validSample, postType: 'EVENT', eventTitle: '' }, REPO_ROOT).valid,
    false
  );
});

test('buildTrackedCtaUrl dopisuje poprawne parametry UTM i zachowuje istniejące query/hash', () => {
  const simple = buildTrackedCtaUrl('https://polskieradio.cc/akademia', 'w1_tue');
  const u1 = new URL(simple);
  assert.equal(u1.searchParams.get('utm_source'), 'gbp');
  assert.equal(u1.searchParams.get('utm_medium'), 'organic');
  assert.equal(u1.searchParams.get('utm_campaign'), 'gbp_w1_tue');

  const withQuery = buildTrackedCtaUrl('https://polskieradio.cc/akademia?day=58#kurscodzienny', 'w1_tue');
  const u2 = new URL(withQuery);
  assert.equal(u2.searchParams.get('day'), '58');
  assert.equal(u2.searchParams.get('utm_source'), 'gbp');
  assert.equal(u2.hash, '#kurscodzienny');
});

test('pickNextQueuedPost wymusza cooldown 36h i zapobiega duplikatom', () => {
  const queue = {
    posts: [{ id: 'p1' }, { id: 'p2' }]
  };
  const now = new Date('2026-11-27T12:00:00Z');

  // Cooldown aktywny (12h temu)
  const blocked = pickNextQueuedPost(queue, { lastPublishedAt: '2026-11-27T00:00:00Z', publishedIds: ['p1'] }, now);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.reason, 'COOLDOWN_ACTIVE');

  // Po 36h (40h temu) zwraca p2
  const allowed = pickNextQueuedPost(queue, { lastPublishedAt: '2026-11-25T20:00:00Z', publishedIds: ['p1'] }, now);
  assert.equal(allowed.allowed, true);
  assert.equal(allowed.post.id, 'p2');

  // Wyczerpana kolejka -> brak duplikatów
  const exhausted = pickNextQueuedPost(queue, { lastPublishedAt: '2026-11-20T00:00:00Z', publishedIds: ['p1', 'p2'] }, now);
  assert.equal(exhausted.allowed, false);
  assert.equal(exhausted.reason, 'QUEUE_EXHAUSTED');
});

test('prepareGbpImage4x3 przycina i skaluje grafikę do dokładnie 1200x900 (<5 MB)', () => {
  const src = path.join(REPO_ROOT, 'images', 'academy_hero_journey.jpg');
  const out = path.join(os.tmpdir(), `gbp_test_${Date.now()}.jpg`);
  try {
    const res = prepareGbpImage4x3(src, out);
    assert.equal(fs.existsSync(res.outAbsPath), true);
    assert.ok(res.sizeBytes > 1000 && res.sizeBytes < 5 * 1024 * 1024);

    const probe = execFileSync(
      'ffprobe',
      ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=s=x:p=0', out],
      { encoding: 'utf8' }
    ).trim();
    assert.equal(probe, '1200x900');
  } finally {
    if (fs.existsSync(out)) fs.unlinkSync(out);
  }
});
