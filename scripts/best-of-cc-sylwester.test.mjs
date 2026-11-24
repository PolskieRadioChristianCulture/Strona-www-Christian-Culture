import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  CAMPAIGN_START,
  CAMPAIGN_END,
  EXCLUDED_WA_JIDS,
  NAZIR_GROUP_JID,
  SYLWESTER_WAVES,
  isCampaignActiveDate,
  isQuietHoursWarsaw,
  selectWaveForDate,
  weightedXLength,
  buildXPost,
  buildWaMessage,
  selectNextWaGroups
} from './best_of_cc_sylwester_campaign.mjs';

test('okno kampanii obejmuje dokładnie 2026-11-24 .. 2026-12-31 i zatrzymuje się od 2027-01-01', () => {
  assert.equal(CAMPAIGN_START, '2026-11-24');
  assert.equal(CAMPAIGN_END, '2026-12-31');
  assert.equal(isCampaignActiveDate('2026-11-23'), false);
  assert.equal(isCampaignActiveDate('2026-11-24'), true);
  assert.equal(isCampaignActiveDate('2026-12-31'), true);
  assert.equal(isCampaignActiveDate('2027-01-01'), false);
  assert.equal(selectWaveForDate('2026-11-24')?.id, 'wave-1-premiera');
  assert.equal(selectWaveForDate('2026-12-31')?.id, 'wave-6-sylwester-final');
  assert.equal(selectWaveForDate('2027-01-01'), null);
});

test('cisza nocna w strefie Europe/Warsaw blokuje 22:00 i 06:00 oraz przepuszcza 11:15 i 17:15', () => {
  assert.equal(isQuietHoursWarsaw(new Date('2026-12-01T22:00:00+01:00')), true);
  assert.equal(isQuietHoursWarsaw(new Date('2026-12-01T06:00:00+01:00')), true);
  assert.equal(isQuietHoursWarsaw(new Date('2026-12-01T11:15:00+01:00')), false);
  assert.equal(isQuietHoursWarsaw(new Date('2026-12-01T17:15:00+01:00')), false);
});

test('wszystkie 6 fal mieszczą się w limicie ważonym X (<= 280 znaków) i przechodzą kontrolę treści', () => {
  const forbiddenRe = new RegExp('kato' + 'lick|msza|różaniec|czyściec|mission\\s+control|face' + 'book\\.com|fb\\.com', 'i');
  const dayCycleRe = /\bDzie[nń]\s+\d+\b/i;

  for (const wave of SYLWESTER_WAVES) {
    assert.equal(forbiddenRe.test(wave.title + ' ' + wave.summary + ' ' + wave.waLead), false);
    const waText = buildWaMessage(wave, {
      youtubeUrl: 'https://youtu.be/vuLnz8S8ABU',
      spotifyUrl: 'https://distrokid.com/hyperfollow/christianculture/the-best-of-christian-culture'
    });
    assert.equal(waText.includes('Płyta na Spotify (Pre-Save / odsłuch)'), true);
    assert.equal(forbiddenRe.test(waText), false);
    assert.equal(dayCycleRe.test(waText), false, `Treść WhatsApp fali ${wave.id} nie może zawierać frazy „Dzień N”`);

    for (let v = 0; v < wave.xVariants.length; v++) {
      const tweet = buildXPost(wave, {
        variantIndex: v,
        youtubeUrl: 'https://youtu.be/vuLnz8S8ABU',
        spotifyUrl: 'https://distrokid.com/hyperfollow/christianculture/the-best-of-christian-culture'
      });
      assert.equal(forbiddenRe.test(tweet), false);
      assert.ok(weightedXLength(tweet) <= 280, `Fala ${wave.id} wariant ${v} przekracza 280 znaków: ${weightedXLength(tweet)}`);
    }
  }
});

test('rotacja FIFO WhatsApp wybiera maks. 2 grupy, respektuje 14-dniową karencję i wyklucza grupy administracyjne', () => {
  const nowMs = Date.parse('2026-11-24T16:00:00Z');
  const sampleGroups = [
    { groupId: '120363432900533490@g.us', name: 'Asystentka CC', lastGroupTouchMs: 0 },
    { groupId: NAZIR_GROUP_JID, name: 'Grupa Nazira', lastGroupTouchMs: 0 },
    { groupId: 'group-recent@g.us', name: 'Grupa Niedawna', lastGroupTouchMs: 100 },
    { groupId: 'group-oldest-1@g.us', name: 'Grupa A', lastGroupTouchMs: 10, lastGroupTouchDate: '2026-11-24' },
    { groupId: 'group-oldest-2@g.us', name: 'Grupa B', lastGroupTouchMs: 20, lastGroupTouchDate: '2026-11-23' },
    { groupId: 'group-oldest-3@g.us', name: 'Grupa C', lastGroupTouchMs: 30, lastGroupTouchDate: '2026-11-22' }
  ];
  const state = {
    waSentGroups: {
      'group-recent@g.us': { lastSentIso: '2026-11-20T10:00:00Z' }
    }
  };

  assert.equal(EXCLUDED_WA_JIDS.has('120363432900533490@g.us'), true);
  assert.equal(EXCLUDED_WA_JIDS.has(NAZIR_GROUP_JID), true);

  const picked = selectNextWaGroups(sampleGroups, state, { maxCount: 5, nowMs, minDays: 14, todayYmd: '2026-11-24' });
  assert.equal(picked.length, 2);
  assert.deepEqual(picked.map((g) => g.groupId), ['group-oldest-2@g.us', 'group-oldest-3@g.us']);
});

test('publiczna okładka kampanii istnieje w images/promo/the-best-of-christian-culture-2026.jpg', () => {
  const img = path.resolve(import.meta.dirname, '..', 'images/promo/the-best-of-christian-culture-2026.jpg');
  assert.equal(fs.existsSync(img), true);
  assert.ok(fs.statSync(img).size > 50000);
});
