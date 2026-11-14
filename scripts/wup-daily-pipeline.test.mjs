import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHANNELS, BIBLIA_AUDIO_CHANNELS } from './yt_studio_session.mjs';
import { computeOffsetSchedule } from './publish_perfect.mjs';
import {
  THUMB_EN,
  THUMB_PL,
  EN_CHANNEL,
  PL_CHANNELS,
  TARGET_CHANNELS,
  loadCatalog,
  defaultState,
  selectNextEpisode,
  isEpisodeFullyPublished,
  buildChannelMetadata,
  buildEpisodeFileName,
  resolveScheduleForEpisode,
  parseCliArgs
} from './wup_daily_youtube_pipeline.mjs';

test('CHANNELS i BIBLIA_AUDIO_CHANNELS zachowują izolację i obejmują Personality Plus', () => {
  assert.equal(BIBLIA_AUDIO_CHANNELS.length, 7);
  assert.equal(BIBLIA_AUDIO_CHANNELS.includes('Personality Plus'), false);
  assert.equal(CHANNELS['Personality Plus']?.id, 'UCSwb927uMg2PxIl_Aakht0Q');
  assert.equal(CHANNELS['Personality Plus']?.via, 'Personality Plus');
  assert.equal(TARGET_CHANNELS.length, 8);
  assert.equal(TARGET_CHANNELS[0], EN_CHANNEL);
  assert.deepEqual(TARGET_CHANNELS.slice(1), PL_CHANNELS);
});

test('Katalog WUP ma dokładnie 50 poprawnych odcinków oraz obie dedykowane miniatury na dysku', () => {
  const catalog = loadCatalog();
  assert.equal(catalog.episodes.length, 50);

  const seenCodes = new Set();
  for (let i = 0; i < 50; i++) {
    const ep = catalog.episodes[i];
    assert.equal(ep.seq, i + 1);
    assert.ok(typeof ep.epCode === 'string' && ep.epCode.length >= 3);
    assert.equal(seenCodes.has(ep.epCode), false);
    seenCodes.add(ep.epCode);
    assert.ok(ep.url.startsWith('https://downloads.clashofminds.com/'));
    assert.ok(ep.url.endsWith('.mp4'));
    assert.ok(ep.titleEn.length > 10 && ep.titleEn.length <= 100, `titleEn za długi w odc. ${ep.epCode}: ${ep.titleEn.length}`);
    assert.ok(ep.titlePl.length > 10 && ep.titlePl.length <= 100, `titlePl za długi w odc. ${ep.epCode}: ${ep.titlePl.length}`);
  }

  assert.ok(fs.existsSync(THUMB_EN) && fs.statSync(THUMB_EN).size > 50_000);
  assert.ok(fs.existsSync(THUMB_PL) && fs.statSync(THUMB_PL).size > 50_000);
});

test('computeOffsetSchedule(48) dokładnie wylicza termin premiery +48h w strefie Europe/Warsaw', () => {
  // Normalny bieg crona o 15:00 CET -> za 48h o 15:00
  assert.deepEqual(
    computeOffsetSchedule(48, new Date('2026-11-14T15:00:10+01:00')),
    { ymd: '2026-11-16', date: '16 lis 2026', time: '15:00' }
  );

  // Jitter crona +2 min -> zaokrągla do 15:00
  assert.deepEqual(
    computeOffsetSchedule(48, new Date('2026-11-14T15:02:00+01:00')),
    { ymd: '2026-11-16', date: '16 lis 2026', time: '15:00' }
  );

  // Przeskok przez północ (23:55 + 5 min zaokrąglenia) -> kolejny dzień 00:00
  assert.deepEqual(
    computeOffsetSchedule(48, new Date('2026-11-14T23:55:00+01:00')),
    { ymd: '2026-11-17', date: '17 lis 2026', time: '00:00' }
  );

  // Przeskok na nowy miesiąc
  assert.deepEqual(
    computeOffsetSchedule(48, new Date('2026-11-29T15:00:00+01:00')),
    { ymd: '2026-12-01', date: '1 gru 2026', time: '15:00' }
  );

  // Przejście czasu zimowy -> letni (48 realnych godzin od 28.03.2026 15:00 CET = 30.03.2026 16:00 CEST)
  assert.deepEqual(
    computeOffsetSchedule(48, new Date('2026-03-28T15:00:00+01:00')),
    { ymd: '2026-03-30', date: '30 mar 2026', time: '16:00' }
  );
});

test('buildChannelMetadata rozdziela EN na Personality Plus i PL+auto-dub na 7 kanałach bez wzmianki o Mission Control', () => {
  const catalog = loadCatalog();
  for (const ep of catalog.episodes) {
    const enMeta = buildChannelMetadata(ep, EN_CHANNEL);
    assert.equal(enMeta.title, ep.titleEn);
    assert.equal(enMeta.thumbnailPath, THUMB_EN);
    assert.equal(enMeta.videoLanguage, 'en');
    assert.equal(enMeta.titleDescriptionLanguage, 'en');
    assert.equal(/polski lektor automatyczny/i.test(enMeta.description), false);
    assert.equal(/mission control/i.test(`${enMeta.title}\n${enMeta.description}\n${enMeta.tags.join(',')}`), false);
    assert.ok(enMeta.description.length <= 5000);

    for (const plCh of PL_CHANNELS) {
      const plMeta = buildChannelMetadata(ep, plCh);
      assert.equal(plMeta.title, ep.titlePl);
      assert.equal(plMeta.thumbnailPath, THUMB_PL);
      assert.equal(plMeta.videoLanguage, 'en');
      assert.equal(plMeta.titleDescriptionLanguage, 'pl');
      assert.match(plMeta.description, /polski lektor automatyczny/i);
      assert.equal(/mission control/i.test(`${plMeta.title}\n${plMeta.description}\n${plMeta.tags.join(',')}`), false);
      assert.ok(plMeta.description.length <= 5000);
    }
  }
});

test('selectNextEpisode, idempotentne wznawianie oraz parseCliArgs działają bez regresji', () => {
  const catalog = loadCatalog();
  const state = defaultState();

  assert.equal(selectNextEpisode(catalog, state).seq, 1);

  // Częściowa porażka na jednym z 8 kanałów nie przeskakuje odcinka 1
  state.episodes['1'] = {
    seq: 1,
    completed: false,
    channels: { [EN_CHANNEL]: { status: 'ok' } }
  };
  assert.equal(isEpisodeFullyPublished(state.episodes['1'], TARGET_CHANNELS), false);
  assert.equal(selectNextEpisode(catalog, state).seq, 1);

  // Wszystkie 8 kanałów OK -> przechodzi do odcinka 2
  for (const ch of TARGET_CHANNELS) state.episodes['1'].channels[ch] = { status: 'ok' };
  state.episodes['1'].completed = isEpisodeFullyPublished(state.episodes['1'], TARGET_CHANNELS);
  assert.equal(state.episodes['1'].completed, true);
  assert.equal(selectNextEpisode(catalog, state).seq, 2);

  // Wymuszenie --ep
  assert.equal(selectNextEpisode(catalog, state, { epSeq: 17 }).seq, 17);
  assert.throws(() => selectNextEpisode(catalog, state, { epSeq: 99 }));

  // Nazwa pliku z URL
  assert.equal(buildEpisodeFileName(catalog.episodes[0]), '001-american-election-campaign-2.mp4');

  // Zachowanie istniejącego przyszłego slotu vs odświeżenie przeterminowanego
  const now = new Date('2026-11-14T15:00:00+01:00');
  assert.deepEqual(
    resolveScheduleForEpisode({ scheduledYmd: '2026-11-16', scheduledTime: '15:00' }, 48, now),
    { ymd: '2026-11-16', time: '15:00' }
  );
  assert.deepEqual(
    resolveScheduleForEpisode({ scheduledYmd: '2026-11-14', scheduledTime: '14:00' }, 48, now),
    { ymd: '2026-11-16', time: '15:00' }
  );

  // Parser CLI
  assert.deepEqual(parseCliArgs(['--dry-run', '--ep', '3', '--hours', '48', '--visibility', 'unlisted']), {
    dryRun: true,
    status: false,
    keepCache: false,
    epSeq: 3,
    channel: null,
    visibility: 'unlisted',
    hours: 48
  });
});
