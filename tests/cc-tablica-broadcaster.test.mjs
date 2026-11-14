import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TABLICA_VOICES,
  selectTablicaVoice,
  normalizeCategory,
  isSdsItem,
  isFutureDatedItem,
  resolveTablicaImageUrl,
  formatTablicaPost,
  publishEcosystemItemToTablica,
  saveTablicaState
} from '../scripts/publish-ecosystem-to-tablica.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_CC = path.resolve(__dirname, '..');

test('Tablica LUMINA: rotacja bez powtórzeń przez 3 oficjalne głosy (radiocc, cezaryrgowski, wiolettarogowska)', () => {
  assert.deepEqual(
    TABLICA_VOICES.map((v) => v.slug),
    ['radiocc', 'cezaryrgowski', 'wiolettarogowska']
  );

  const state = {
    lastVoiceSlug: null,
    voiceCounts: { radiocc: 0, cezaryrgowski: 0, wiolettarogowska: 0 }
  };

  const sequence = [];
  for (let i = 0; i < 6; i += 1) {
    const voice = selectTablicaVoice({ title: `Pozycja ${i}`, category: 'news' }, state);
    assert.notEqual(voice.slug, state.lastVoiceSlug, 'Ten sam głos nie powinien publikować dwóch wpisów pod rząd');
    sequence.push(voice.slug);
    state.lastVoiceSlug = voice.slug;
    state.voiceCounts[voice.slug] += 1;
  }

  assert.deepEqual(sequence, [
    'radiocc',
    'cezaryrgowski',
    'wiolettarogowska',
    'radiocc',
    'cezaryrgowski',
    'wiolettarogowska'
  ]);
  assert.deepEqual(state.voiceCounts, { radiocc: 2, cezaryrgowski: 2, wiolettarogowska: 2 });
});

test('Tablica LUMINA: wpisy całodniowe nigdy nie przejmują slotu CKD (isDevotion=false, category!=ckd)', () => {
  assert.equal(normalizeCategory('ckd'), 'module');
  assert.equal(normalizeCategory('Radio & Live'), 'music');
  assert.equal(normalizeCategory('Werset Dnia'), 'verse');
  const musicPost = formatTablicaPost(
    {
      title: 'Podcasty CC',
      url: 'https://polskieradio.cc/podcasty',
      category: 'Radio & Live',
      type: 'music'
    },
    TABLICA_VOICES[1],
    null
  );
  assert.equal(musicPost.category, 'music');
  const post = formatTablicaPost(
    {
      title: 'Testowy materiał z ekosystemu',
      url: 'https://polskieradio.cc/news',
      category: 'ckd',
      summary: 'Budujący artykuł biblijny.'
    },
    TABLICA_VOICES[1],
    'https://polskieradio.cc/avatar_cezary_official.jpg'
  );

  assert.equal(post.isDevotion, false);
  assert.equal(post._isCkdDaily, false);
  assert.notEqual(post.category, 'ckd');
  assert.equal(post.authorSlug, 'cezaryrgowski');
  assert.equal(post.sourceUrl, 'https://polskieradio.cc/news');
  assert.ok(post.text.includes('https://polskieradio.cc/news'));
});

test('Tablica LUMINA: zachowanie atrybucji Studia Dobrego Słowa (Mariusz Adamczyk)', () => {
  const sdsItem = {
    title: 'Apokalipsa: Czas Końca - Wykład SDS',
    url: 'https://polskieradio.cc/vod',
    category: 'vod',
    subtitle: 'Studio Dobrego Słowa'
  };
  assert.equal(isSdsItem(sdsItem), true);

  const post = formatTablicaPost(sdsItem, TABLICA_VOICES[2], null);
  assert.ok(post.text.includes('Mariusz Adamczyk'));
  assert.ok(post.text.includes('Studio Dobrego Słowa'));
});

test('Tablica LUMINA: rozwiązywanie obrazów webowych i blokowanie plików wewnętrznych', () => {
  const validAvatar = path.join(ROOT_CC, 'avatar_wioletta_official.jpg');
  const resolvedValid = resolveTablicaImageUrl({}, validAvatar, ROOT_CC);
  assert.equal(resolvedValid, 'https://polskieradio.cc/avatar_wioletta_official.jpg');

  const internalScript = path.join(ROOT_CC, 'scripts', 'ccn_auto_broadcaster.mjs');
  const resolvedInternal = resolveTablicaImageUrl({}, internalScript, ROOT_CC);
  assert.equal(resolvedInternal, null);
});

test('Tablica LUMINA: blokada przyszłych dat (Date-Lock) oraz bezpieczny tryb dry-run i deduplikacja', async () => {
  const tempStatePath = path.join(os.tmpdir(), `cc_tablica_state_test_${Date.now()}.json`);
  try {
    const futureCheck = isFutureDatedItem({ date: '2099-12-31' });
    assert.equal(futureCheck.future, true);

    const blocked = await publishEcosystemItemToTablica(
      {
        title: 'Lekcja z przyszłości',
        url: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-99',
        date: '2099-12-31'
      },
      { dryRun: true, statePath: tempStatePath }
    );
    assert.equal(blocked.ok, false);
    assert.equal(blocked.reason, 'future_date_locked');

    const dry = await publishEcosystemItemToTablica(
      {
        title: 'Dzisiejszy artykuł testowy',
        url: 'https://polskieradio.cc/news',
        category: 'news'
      },
      {
        dryRun: true,
        imagePath: path.join(ROOT_CC, 'avatar_christian_culture_hq_2026.jpg'),
        statePath: tempStatePath
      }
    );
    assert.equal(dry.ok, true);
    assert.equal(dry.dryRun, true);
    assert.equal(dry.voice, 'radiocc');
    assert.equal(dry.imageUrl, 'https://polskieradio.cc/avatar_christian_culture_hq_2026.jpg');
    assert.equal(fs.existsSync(tempStatePath), false, 'dryRun nie może zapisywać stanu na dysku');

    saveTablicaState(
      {
        lastVoiceSlug: 'radiocc',
        voiceCounts: { radiocc: 1, cezaryrgowski: 0, wiolettarogowska: 0 },
        recentUrls: { 'https://polskieradio.cc/news': new Date().toISOString() },
        lastPublishedAt: new Date().toISOString(),
        totalPublished: 1
      },
      tempStatePath
    );

    const dup = await publishEcosystemItemToTablica(
      {
        title: 'Duplikat w oknie czasowym',
        url: 'https://polskieradio.cc/news/'
      },
      { dryRun: true, statePath: tempStatePath }
    );
    assert.equal(dup.ok, false);
    assert.equal(dup.reason, 'duplicate_local_window');
  } finally {
    if (fs.existsSync(tempStatePath)) {
      fs.unlinkSync(tempStatePath);
    }
  }
});
