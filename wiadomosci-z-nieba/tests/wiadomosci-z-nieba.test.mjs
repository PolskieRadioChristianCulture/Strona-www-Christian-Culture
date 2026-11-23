import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';

import { loadWznConfig, openWznDb } from '../src/db.mjs';
import {
  fetchVerifiedDailyVerse,
  getWarsawDateParts,
  getWarsawDayOfYear,
} from '../src/verse-source.mjs';
import { THEME_CATALOG, ROTATIONAL_CTAS, selectThemeForVerse } from '../src/theme-catalog.mjs';
import { composeDailyMessage } from '../src/composer.mjs';
import { validateComposedPublication } from '../src/theology-guard.mjs';
import {
  buildOpenBotScheduleProposal,
  getScheduledRunForDate,
  isScheduledWindowDue,
} from '../src/scheduler.mjs';
import {
  LuminaTablicaFirestorePublisher,
  assertPermittedAction,
  assertPublisherAccountSecurity,
  publishWithControlledRetry,
} from '../src/publisher.mjs';
import { runDailyCycle, simulateTenDays } from '../src/pipeline.mjs';

const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

function makeTempDir(t, prefix = 'wzn-test-') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test('1. Konfiguracja profilu i powierzchnia TEST wskazują jawnie Christian Culture jako wydawcę', () => {
  const cfg = loadWznConfig(REPO_ROOT);
  assert.equal(cfg.profile.displayName, 'Jezus Chrystus');
  assert.equal(cfg.profile.seriesName, 'Wiadomości z nieba');
  assert.equal(cfg.profile.fullTitle, 'Jezus Chrystus — Wiadomości z nieba');
  assert.equal(cfg.profile.handle, '@wiadomosci_z_nieba');
  assert.equal(cfg.profile.category, 'Biblia / Inspiracje / Wiara');
  assert.equal(cfg.profile.publisher, 'Christian Culture');
  assert.equal(cfg.profile.mainUrl, 'https://polskieradio.cc/werset-dnia');
  assert.match(cfg.profile.bio, /Masz dziś wiadomość ze Słowa Bożego/);
  assert.match(cfg.profile.slogan, /Nie masz nowych wiadomości\? A może jedna czeka na Ciebie od Boga\?/);
  assert.match(cfg.profile.editorialDisclosure, /Christian Culture/);
  assert.equal(cfg.zeroCost, true);
  assert.equal(cfg.autoPublishEnabled, false);
  assert.equal(cfg.productionApprovedByOwner, false);

  const html = fs.readFileSync(path.join(REPO_ROOT, 'test', 'wiadomosci-z-nieba', 'index.html'), 'utf8');
  assert.match(html, /noindex,\s*nofollow,\s*noarchive/);
  assert.match(html, /Christian Culture/);
  assert.doesNotMatch(html, /mission\s+control/i);
});

test('2. Okrągły awatar Jezusa PNG i WebP ma 512x512, przezroczyste rogi i optymalną wagę', async () => {
  const pngPath = path.join(REPO_ROOT, 'images', 'lumina', 'wiadomosci-z-nieba-avatar.png');
  const webpPath = path.join(REPO_ROOT, 'images', 'lumina', 'wiadomosci-z-nieba-avatar.webp');
  assert.equal(fs.existsSync(pngPath), true, 'Brak PNG awatara');
  assert.equal(fs.existsSync(webpPath), true, 'Brak WebP awatara');

  const meta = await sharp(pngPath).metadata();
  assert.equal(meta.width, 512);
  assert.equal(meta.height, 512);
  assert.equal(meta.hasAlpha, true);

  const { data, info } = await sharp(pngPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const alphaAt = (x, y) => data[(y * info.width + x) * 4 + 3];
  assert.equal(alphaAt(2, 2), 0);
  assert.equal(alphaAt(509, 2), 0);
  assert.equal(alphaAt(2, 509), 0);
  assert.equal(alphaAt(509, 509), 0);
  assert.equal(alphaAt(256, 256), 255);

  const webpSize = fs.statSync(webpPath).size;
  assert.ok(webpSize > 5000 && webpSize < 100 * 1024, `WebP ma nieprawidłowy rozmiar: ${webpSize} B`);
});

test('3. Link główny https://polskieradio.cc/werset-dnia jest poprawny we wszystkich wygenerowanych postach', () => {
  const cfg = loadWznConfig(REPO_ROOT);
  const sim = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'test', 'wiadomosci-z-nieba', 'simulation-data.json'), 'utf8'));
  assert.equal(sim.tenDays.length, 10);
  for (const day of sim.tenDays) {
    assert.equal(day.actionUrl, 'https://polskieradio.cc/werset-dnia');
    assert.equal(day.bodyText.includes(cfg.profile.mainUrl), true);
  }
});

test('4. Pobranie wersetu korzysta z autorytatywnego źródła Mój Werset Dnia (Europe/Warsaw + rok przestępny)', () => {
  const day = getWarsawDayOfYear(new Date('2026-11-23T06:00:00Z'));
  assert.equal(day, 327);
  assert.equal(getWarsawDateParts(new Date('2026-11-23T06:00:00Z')).dateStr, '2026-11-23');
  assert.equal(getWarsawDayOfYear(new Date('2024-12-31T12:00:00Z')), 365);

  const res = fetchVerifiedDailyVerse({
    date: new Date('2026-11-23T07:00:00+01:00'),
    rootDir: REPO_ROOT,
  });
  assert.equal(res.ok, true);
  assert.equal(res.verse.day, 327);
  assert.equal(res.verse.referencePl, 'Księga Przysłów 14,12');
  assert.equal(res.verse.canonicalVerified, true);
  assert.ok(res.verse.license.includes('CC BY-ND 4.0'));
});

test('5. Krzyżowa weryfikacja z Biblią UBG odrzuca zmyślony lub zmodyfikowany o 1 słowo werset', t => {
  const tmp = makeTempDir(t);
  const fakeSourcePath = path.join(tmp, 'werset_tampered.json');
  const orig = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'data', 'werset_dnia_365_ubg.json'), 'utf8'));
  const v327 = orig.verses.find(v => v.day === 327);
  const tampered = {
    version: '1.0',
    verses: [{ ...v327, text: v327.text.replace('śmierci', 'sukcesu') }],
  };
  fs.writeFileSync(fakeSourcePath, JSON.stringify(tampered), 'utf8');

  const res = fetchVerifiedDailyVerse({
    date: new Date('2026-11-23T07:00:00+01:00'),
    rootDir: REPO_ROOT,
    verseSourcePath: fakeSourcePath,
  });
  assert.equal(res.ok, false);
  assert.equal(res.code, 'VERSE_INTEGRITY_MISMATCH');
  assert.equal(res.alertSupervision, true);
});

test('6. Formatowanie 5-elementowe, katalog 10 tematów i bramka bezpieczeństwa teologicznego', () => {
  assert.equal(THEME_CATALOG.length, 10);
  assert.equal(ROTATIONAL_CTAS.length, 4);

  const cfg = loadWznConfig(REPO_ROOT);
  const vRes = fetchVerifiedDailyVerse({ dayOverride: 332, rootDir: REPO_ROOT, config: cfg });
  assert.equal(vRes.ok, true);

  const selection = selectThemeForVerse(vRes.verse, []);
  assert.ok(THEME_CATALOG.some(t => t.id === selection.themeId));

  const composed = composeDailyMessage({ verse: vRes.verse, runDate: '2026-11-28', config: cfg, rootDir: REPO_ROOT });
  const passCheck = validateComposedPublication({ composed, verse: vRes.verse, config: cfg });
  assert.equal(passCheck.ok, true, JSON.stringify(passCheck.checks.filter(c => !c.passed)));

  // Negatywne testy bramki teologicznej §9
  const badSamples = [
    { ...composed, bodyText: composed.bodyText.replace(composed.sections.hook, 'Jezus właśnie wysłał do Ciebie osobistą wiadomość!') },
    { ...composed, bodyText: `${composed.bodyText}\nKliknij i udostępnij, a otrzymasz pieniądze w zamian za kliknięcie.` },
    { ...composed, bodyText: `${composed.bodyText}\n„Oto zmyślony cytat poza Biblią.”` },
    { ...composed, bodyText: `${composed.bodyText}\nWysłano przez Mission Control.` },
  ];

  for (const sample of badSamples) {
    const res = validateComposedPublication({ composed: sample, verse: vRes.verse, config: cfg });
    assert.equal(res.ok, false, 'Niebezpieczny tekst powinien zostać odrzucony');
  }
});

test('7. Harmonogram 07:00 Europe/Warsaw (CET/CEST), propozycja OpenBot oraz Kill-Switch SQLite', t => {
  const cfg = loadWznConfig(REPO_ROOT);
  const winter = getScheduledRunForDate('2026-11-23', cfg.schedule.publishTime);
  const summer = getScheduledRunForDate('2026-07-15', '07:30');
  assert.equal(winter.warsawIso, '2026-11-23T07:00:00+01:00');
  assert.equal(summer.warsawIso, '2026-07-15T07:30:00+02:00');

  assert.equal(isScheduledWindowDue(new Date('2026-11-23T05:59:00Z'), '07:00').due, false);
  assert.equal(isScheduledWindowDue(new Date('2026-11-23T06:00:00Z'), '07:00').due, true);

  const proposal = buildOpenBotScheduleProposal(cfg, REPO_ROOT);
  assert.equal(proposal.enabled, false);
  assert.equal(proposal.requiresOwnerApprovalL0, true);
  assert.equal(proposal.provider, 'opencode');
  assert.equal(proposal.model, 'opencode/deepseek-v4.1-flash-free');
  assert.equal(proposal.cronExpression, '0 7 * * *');

  const tmp = makeTempDir(t);
  const dbPath = path.join(tmp, 'wzn.sqlite');
  const db = openWznDb({ dbPath, repoRoot: REPO_ROOT });
  db.setFlag('kill_switch', '1');
  db.close();

  return runDailyCycle({
    date: new Date('2026-11-23T07:00:00+01:00'),
    rootDir: REPO_ROOT,
    dbPath,
    draftsDir: path.join(tmp, 'drafts'),
    alertsPath: path.join(tmp, 'alerts.md'),
  }).then(killed => {
    assert.equal(killed.ok, false);
    assert.equal(killed.status, 'KILLED');
    assert.equal(killed.code, 'KILL_SWITCH_ACTIVE');
  });
});

test('8. Odporność na podwójne uruchomienie oraz kontrolowane ponowienia bez duplikatów (partial success recovery)', async t => {
  const tmp = makeTempDir(t);
  const dbPath = path.join(tmp, 'wzn.sqlite');
  const draftsDir = path.join(tmp, 'drafts');
  const alertsPath = path.join(tmp, 'alerts.md');
  const date = new Date('2026-11-23T07:00:00+01:00');

  const first = await runDailyCycle({ date, rootDir: REPO_ROOT, dbPath, draftsDir, alertsPath });
  const second = await runDailyCycle({ date, rootDir: REPO_ROOT, dbPath, draftsDir, alertsPath });
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(second.status, 'SKIPPED_DUPLICATE');

  const db = openWznDb({ dbPath, repoRoot: REPO_ROOT });
  const summary = db.exportStateSummary();
  db.close();
  assert.equal(summary.runs.length, 1);
  assert.equal(summary.totals.published_count, 1);
  assert.equal(summary.totals.duplicates_blocked_count, 1);

  // Symulacja błędu przejściowego 503 po udanym zapisie w bazie (partial success) + odczyt read-back
  const store = new Map();
  let writeCalls = 0;
  const flakyFirestoreClient = {
    async getPost(id) {
      return store.has(id) ? { exists: true, data: store.get(id) } : { exists: false };
    },
    async setPost(id, doc) {
      writeCalls += 1;
      store.set(id, doc);
      if (writeCalls === 1) {
        const err = new Error('503 Service Unavailable po stronie sieci');
        err.status = 503;
        throw err;
      }
      return { postId: id };
    },
  };

  const publisher = new LuminaTablicaFirestorePublisher({ firestoreClient: flakyFirestoreClient });
  const recovered = await publishWithControlledRetry({
    adapter: publisher,
    payload: { id: 'wzn_post_2026-11-23', idempotencyKey: 'wzn:2026-11-23:day:327', authorSlug: 'wiadomosci_z_nieba', sourceUrl: 'https://polskieradio.cc/werset-dnia' },
    idempotencyKey: 'wzn:2026-11-23:day:327',
    maxAttempts: 3,
    retryDelayMs: 0,
  });
  assert.equal(recovered.ok, true);
  assert.equal(recovered.recoveredFromPartialSuccess, true);
  assert.equal(writeCalls, 1, 'Odzyskanie po read-back nie może wykonać drugiego zapisu duplikującego post');
});

test('9. Fail-closed przy niedostępności źródła zatrzymuje publikację i zapisuje alert nadzoru', async t => {
  const tmp = makeTempDir(t);
  const dbPath = path.join(tmp, 'wzn.sqlite');
  const draftsDir = path.join(tmp, 'drafts');
  const alertsPath = path.join(tmp, 'alerts.md');

  const blocked = await runDailyCycle({
    date: new Date('2026-11-23T07:00:00+01:00'),
    rootDir: REPO_ROOT,
    dbPath,
    verseSourcePath: path.join(tmp, 'brak-zrodla.json'),
    draftsDir,
    alertsPath,
  });

  assert.equal(blocked.ok, false);
  assert.equal(blocked.blocked, true);
  assert.equal(blocked.status, 'BLOCKED_SOURCE');
  assert.equal(blocked.code, 'SOURCE_UNAVAILABLE');
  assert.equal(fs.existsSync(draftsDir), false, 'Nie wolno utworzyć szkicu przy niedostępnym źródle');
  assert.equal(fs.existsSync(alertsPath), true, 'Musi powstać alert dla systemu nadzoru');
});

test('10. Zabezpieczenia konta publikacyjnego blokują produkcję bez L0 i kontekst anonimowy', t => {
  const tmp = makeTempDir(t);
  const dbPath = path.join(tmp, 'wzn.sqlite');
  const db = openWznDb({ dbPath, repoRoot: REPO_ROOT });
  try {
    assert.throws(
      () =>
        assertPublisherAccountSecurity({
          mode: 'PRODUCTION_LIVE',
          db,
          actorContext: { authenticated: true, role: 'server_admin', provider: 'admin_sdk' },
          repoRoot: REPO_ROOT,
        }),
      err => err.code === 'PRODUCTION_APPROVAL_REQUIRED'
    );

    assert.throws(
      () =>
        assertPublisherAccountSecurity({
          mode: 'TEST_SIMULATION',
          db,
          actorContext: { authenticated: false, role: 'guest', provider: 'anonymous' },
          repoRoot: REPO_ROOT,
        }),
      err => err.code === 'PUBLISHER_AUTH_REQUIRED'
    );
  } finally {
    db.close();
  }
});

test('11. Twarda blokada niezamówionych wiadomości prywatnych (DM/push) i wymóg dobrowolnej zgody opt-in', () => {
  assert.doesNotThrow(() => assertPermittedAction('publish_public_editorial_post'));
  for (const forbidden of ['send_private_message', 'broadcast_dm', 'send_unsolicited_push', 'modify_account_settings']) {
    assert.throws(() => assertPermittedAction(forbidden), err => err.code === 'PERMISSION_DENIED');
  }

  const html = fs.readFileSync(path.join(REPO_ROOT, 'test', 'wiadomosci-z-nieba', 'index.html'), 'utf8');
  assert.match(html, /id="optInNotifBtn"[^>]*aria-pressed="false"/);
  assert.match(html, /brak automatycznych wiadomości prywatnych/);
});

test('12. Analityka i symulacja 10-dniowa działają w trybie TEST bez profilowania jednostek', async t => {
  const previewJson = fs.readFileSync(path.join(REPO_ROOT, 'test', 'wiadomosci-z-nieba', 'simulation-data.json'), 'utf8');
  const sim = JSON.parse(previewJson);
  assert.equal(sim.tenDays.length, 10);
  assert.equal(sim.verificationChecks.duplicateRunBlocked, true);
  assert.equal(sim.verificationChecks.missingSourceBlocked, true);
  assert.equal(sim.analyticsSummary.totals.published_count, 10);
  assert.equal(sim.analyticsSummary.totals.errors_count, 0);

  const schemaSql = fs.readFileSync(path.join(REPO_ROOT, 'wiadomosci-z-nieba', 'src', 'db.mjs'), 'utf8');
  assert.doesNotMatch(schemaSql, /user_email|belief_profile|religion_score|phone_number/i);

  const html = fs.readFileSync(path.join(REPO_ROOT, 'test', 'wiadomosci-z-nieba', 'index.html'), 'utf8');
  assert.match(html, /\/js\/cc-analytics\.js/);

  // Szybkie sprawdzenie eksportowanego simulateTenDays w izolowanym środowisku nie psuje domyślnego podglądu
  const simFnType = typeof simulateTenDays;
  assert.equal(simFnType, 'function');
});
