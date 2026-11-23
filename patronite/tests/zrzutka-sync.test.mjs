import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { createRequire } from 'node:module';

import { loadConfig, openPatroniteDb } from '../src/db.mjs';
import { collectAuthorizedSources } from '../src/collector.mjs';
import { validateCollectedSnapshot } from '../src/evidence-validator.mjs';
import { generatePatroniteDraft } from '../src/text-writer.mjs';
import { renderPatroniteGraphic } from '../src/visual-director.mjs';
import { runQualityGuardian } from '../src/quality-guardian.mjs';
import {
  ZrzutkaBrowserDraftAdapter,
  ZrzutkaDraftPackagePublisher,
  ZrzutkaOfficialApiAdapter,
  adaptDraftForZrzutka,
  assertZrzutkaPermittedAction,
  executeZrzutkaPublishWithGuards,
  toZrzutkaJobId,
} from '../src/zrzutka-adapter.mjs';
import { runNextCycle, simulateTwoWeeks, syncMissingZrzutkaCycles } from '../src/pipeline.mjs';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

function withTempWorkspace(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-zrzutka-test-'));
  const dbPath = path.join(dir, 'patronite.sqlite');
  const auditPath = path.join(dir, 'audit.jsonl');
  const draftsDir = path.join(dir, 'patronite-drafts');
  const reportsDir = path.join(dir, 'patronite-reports');
  const zrzDraftsDir = path.join(dir, 'zrzutka-drafts');
  const zrzReportsDir = path.join(dir, 'zrzutka-reports');
  const db = openPatroniteDb({ repoRoot: REPO_ROOT, dbPath, auditLogJsonlPath: auditPath });
  t.after(() => {
    try {
      db.close();
    } finally {
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 6, retryDelay: 50 });
    }
  });
  return { dir, dbPath, auditPath, draftsDir, reportsDir, zrzDraftsDir, zrzReportsDir, db };
}

test('1. Zrzutka.pl: konfiguracja, minimalne uprawnienia i twardo wyłączony adapter przeglądarkowy', async () => {
  const config = loadConfig(REPO_ROOT);
  assert.equal(config.zrzutka.enabled, true);
  assert.equal(config.zrzutka.fundraiserUrl, 'https://zrzutka.pl/rs4g4v');
  assert.equal(config.zrzutka.fundraiserCode, 'rs4g4v');
  assert.equal(config.zrzutka.syncWithPatroniteSchedule, true);

  assert.equal(toZrzutkaJobId('PAT-20261123-mission-report'), 'ZRZ-20261123-mission-report');

  assert.doesNotThrow(() => assertZrzutkaPermittedAction('create_update_draft'));
  assert.doesNotThrow(() => assertZrzutkaPermittedAction('publish_update'));
  assert.doesNotThrow(() => assertZrzutkaPermittedAction('read_update'));

  for (const forbidden of ['read_donor_pii', 'withdraw_funds', 'modify_goal', 'modify_payout_bank', 'modify_account_settings']) {
    assert.throws(
      () => assertZrzutkaPermittedAction(forbidden),
      err => err.code === 'PERMISSION_DENIED',
      `Akcja ${forbidden} musi być zablokowana`,
    );
  }

  const browserAdapter = new ZrzutkaBrowserDraftAdapter();
  assert.equal(browserAdapter.enabled, false);
  await assert.rejects(() => browserAdapter.publish(), err => err.code === 'ADAPTER_DISABLED');
});

test('2. Wszystkie rozszerzone projekty ekosystemu (MojaBiblia, Centrum Aplikacji, CCN News, Nowe Studio RTV, LUMINA, 6 wersetów UBG) przechodzą QA 12/12 także w wersji Zrzutka.pl', async t => {
  const { dir } = withTempWorkspace(t);
  const config = loadConfig(REPO_ROOT);
  const snapshot = collectAuthorizedSources(REPO_ROOT, { saveSnapshot: false, includeGitLog: false });
  const validated = validateCollectedSnapshot(snapshot, REPO_ROOT);

  const expectedIds = [
    'src-mojabiblia-interlinearna',
    'src-aplikacje-centrum',
    'src-ccn-news-portale',
    'src-behind-scenes-nowe-studio-rtv',
    'src-behind-scenes-lumina-spolecznosc',
  ];
  const validItems = validated.items.filter(i => i.evidenceStatus !== 'NIEPOTWIERDZONE');
  for (const id of expectedIds) {
    assert.ok(validItems.some(i => i.id === id), `Brak zatwierdzonego projektu w collectorze: ${id}`);
  }
  const thankYouItems = validItems.filter(i => (i.seriesPreference || []).includes('thank-you'));
  assert.ok(thankYouItems.length >= 6, `Oczekiwano co najmniej 6 wersetów piątkowych UBG, znaleziono ${thankYouItems.length}`);

  for (const item of [...expectedIds.map(id => validItems.find(i => i.id === id)), thankYouItems[2]]) {
    const seriesType = (item.seriesPreference && item.seriesPreference[0]) || 'mission-report';
    const cycle = {
      jobId: `PAT-20261130-${seriesType}`,
      seriesType,
      seriesLabel: seriesType === 'mission-report'
        ? 'DZIENNIK MISJI'
        : (seriesType === 'behind-the-scenes' ? 'ZA KULISAMI CHRISTIAN CULTURE' : 'DZIĘKI, ŻE JESTEŚ'),
      scheduledForWarsaw: '2026-11-30T09:00:00+01:00',
      prepAtWarsaw: '2026-11-30T07:00:00+01:00',
      visibility: 'PUBLICZNY',
    };
    const patDraft = generatePatroniteDraft({ cycle, topic: item, config });
    const zrzDraft = adaptDraftForZrzutka(patDraft, config);

    assert.equal(zrzDraft.channel, 'zrzutka');
    assert.equal(zrzDraft.fundraiserUrl, 'https://zrzutka.pl/rs4g4v');
    assert.equal(/\bPatronite\b/i.test(zrzDraft.zrzutkaPlainText), false, `Wyciek nazwy Patronite w treści Zrzutka.pl dla ${item.id}`);
    assert.equal(zrzDraft.zrzutkaPlainText.includes('https://zrzutka.pl/rs4g4v'), true);

    const outPng = path.join(dir, `${item.id}-zrz-1068x630.png`);
    const gMeta = await renderPatroniteGraphic({
      repoRoot: REPO_ROOT,
      seriesType: zrzDraft.seriesType,
      headline: patDraft.graphicSpec.headline,
      accentHeadline: patDraft.graphicSpec.accentHeadline,
      subtitle: patDraft.graphicSpec.subtitle,
      photoRelPath: patDraft.graphicSpec.photoRelPath,
      outputPath: outPng,
      format: 'landscape',
      channel: 'zrzutka',
    });

    assert.equal(gMeta.channel, 'zrzutka');
    const imgMeta = await sharp(outPng).metadata();
    assert.equal(imgMeta.width, 1068);
    assert.equal(imgMeta.height, 630);

    const qa = await runQualityGuardian({
      draft: zrzDraft,
      graphicMeta: gMeta,
      recentArchive: [],
      config,
      repoRoot: REPO_ROOT,
    });
    assert.equal(qa.overallStatus, 'PASS', `QA Zrzutka.pl dla ${item.id} nie przeszło: ${JSON.stringify(qa.failedChecks)}`);
    assert.equal(qa.passedCount, 12);
  }
});

test('3. ZrzutkaOfficialApiAdapter obsługuje HTTP mock: 503, 401, 500 i odzyskiwanie częściowego sukcesu bez duplikatu', async t => {
  const { db, dir } = withTempWorkspace(t);
  const config = loadConfig(REPO_ROOT);
  db.setFlag('production_approved', '1', 'test');

  const updates = new Map();
  let mode = '503';
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', c => { raw += c; });
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      if (mode === '503') {
        res.statusCode = 503;
        return res.end(JSON.stringify({ error: 'service unavailable' }));
      }
      if (mode === '401') {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'unauthorized' }));
      }
      if (req.method === 'GET' && req.url.includes('/updates/by-job/')) {
        const jobId = decodeURIComponent(req.url.split('/').pop());
        const existing = updates.get(jobId);
        if (!existing) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ found: false }));
        }
        res.statusCode = 200;
        return res.end(JSON.stringify({ found: true, ...existing }));
      }
      if (req.method === 'GET' && req.url.includes('/updates/')) {
        const remoteId = decodeURIComponent(req.url.split('/').pop());
        const found = Array.from(updates.values()).find(u => u.remoteUpdateId === remoteId);
        if (!found) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ found: false }));
        }
        res.statusCode = 200;
        return res.end(JSON.stringify({ found: true, ...found }));
      }
      if (req.method === 'POST' && req.url.endsWith('/updates')) {
        const body = JSON.parse(raw || '{}');
        const record = {
          remoteUpdateId: `zrz-upd-${updates.size + 1}`,
          jobId: body.jobId,
          title: body.title,
          status: 'OPUBLIKOWANO',
          url: `https://zrzutka.pl/rs4g4v/aktualnosci/${updates.size + 1}`,
        };
        updates.set(body.jobId, record);
        if (mode === 'partial_500') {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'timeout after commit' }));
        }
        res.statusCode = 201;
        return res.end(JSON.stringify(record));
      }
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'not found' }));
    });
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const adapter = new ZrzutkaOfficialApiAdapter({
    baseUrl,
    fundraiserCode: 'rs4g4v',
    tokenProvider: () => 'test-zrzutka-token',
  });

  const dummyGraphic = path.join(dir, 'dummy.png');
  fs.writeFileSync(dummyGraphic, 'png');
  const draft = {
    jobId: 'ZRZ-20261123-mission-report',
    sourcePatroniteJobId: 'PAT-20261123-mission-report',
    fundraiserUrl: 'https://zrzutka.pl/rs4g4v',
    title: 'Dziennik Misji: test synchronizacji Zrzutka.pl',
    zrzutkaPlainText: 'Treść testowa aktualizacji na https://zrzutka.pl/rs4g4v',
    altText: 'Tekst alternatywny dla grafiki Zrzutka.pl',
  };
  const qaPass = { overallStatus: 'PASS', passedCount: 12, totalCount: 12, checks: [] };

  mode = '503';
  const res503 = await executeZrzutkaPublishWithGuards({ draft, graphicMeta: { outputPath: dummyGraphic }, qaResult: qaPass, config, db, adapter, livePublishRequested: true });
  assert.equal(res503.status, 'BŁĄD');
  assert.equal(res503.code, 'API_UNAVAILABLE');

  mode = '401';
  const res401 = await executeZrzutkaPublishWithGuards({ draft, graphicMeta: { outputPath: dummyGraphic }, qaResult: qaPass, config, db, adapter, livePublishRequested: true });
  assert.equal(res401.status, 'BŁĄD');
  assert.equal(res401.code, 'SESSION_EXPIRED');

  // Częściowy sukces (serwer zapisał, ale zwrócił 500) -> ponowna próba odzyskuje istniejący wpis bez duplikatu
  mode = 'partial_500';
  const resPartial = await executeZrzutkaPublishWithGuards({ draft, graphicMeta: { outputPath: dummyGraphic }, qaResult: qaPass, config, db, adapter, livePublishRequested: true });
  assert.equal(resPartial.status, 'BŁĄD');
  assert.equal(resPartial.code, 'PUBLISH_FAILED');
  assert.equal(updates.size, 1);

  mode = 'ok';
  const resRecovered = await executeZrzutkaPublishWithGuards({ draft, graphicMeta: { outputPath: dummyGraphic }, qaResult: qaPass, config, db, adapter, livePublishRequested: true });
  assert.equal(resRecovered.status, 'OPUBLIKOWANO');
  assert.equal(resRecovered.verified, true);
  assert.equal(resRecovered.recoveredFromPartialSuccess, true);
  assert.equal(updates.size, 1, 'Retry nie może utworzyć duplikatu aktualizacji na Zrzutka.pl');
});

test('4. Symulacja 2 tygodni oraz runNextCycle tworzą lustrzane pakiety Zrzutka.pl (1:1 w tych samych dniach/godzinach) z idempotentnym backfill', async t => {
  const { dbPath, draftsDir, reportsDir, zrzDraftsDir, zrzReportsDir } = withTempWorkspace(t);

  // A. Symulacja 6 cykli tworzy 6 wyników Patronite + 6 lustrzanych Zrzutka.pl w izolowanych katalogach testowych
  const sim = await simulateTwoWeeks({
    repoRoot: REPO_ROOT,
    dbPath,
    draftsDir: path.join(path.dirname(dbPath), 'sim-pat-drafts'),
    reportsDir: path.join(path.dirname(dbPath), 'sim-pat-reports'),
    zrzutkaDraftsDir: path.join(path.dirname(dbPath), 'sim-zrz-drafts'),
    zrzutkaReportsDir: path.join(path.dirname(dbPath), 'sim-zrz-reports'),
    exportTestPreview: false,
  });
  assert.equal(sim.results.length, 6);
  for (const r of sim.results) {
    assert.ok(r.zrzutka, `Brak lustra Zrzutka.pl dla cyklu ${r.jobId}`);
    assert.equal(r.zrzutka.jobId, toZrzutkaJobId(r.jobId));
    assert.equal(r.zrzutka.scheduledForWarsaw, r.scheduledForWarsaw);
    assert.equal(r.zrzutka.qaResult.overallStatus, 'PASS');
    assert.equal(r.zrzutka.qaResult.passedCount, 12);
    assert.equal(r.zrzutka.status, 'SZKIC');
    assert.equal(fs.existsSync(path.join(r.zrzutka.draftDir, 'graphic-1068x630.png')), true);
    assert.equal(fs.existsSync(path.join(r.zrzutka.draftDir, 'promo-1080x1080.png')), true);
    assert.equal(fs.existsSync(path.join(r.zrzutka.draftDir, 'update-zrzutka.txt')), true);
    assert.equal(fs.existsSync(path.join(r.zrzutka.draftDir, 'post.json')), true);
  }

  // B. runNextCycle w świeżej bazie generuje oba pakiety naraz, a wywołanie powtórne jest idempotentne
  const dbPath2 = path.join(path.dirname(dbPath), 'next-cycle.sqlite');
  const firstRun = await runNextCycle({
    repoRoot: REPO_ROOT,
    now: new Date('2026-11-23T06:00:00Z'),
    dbPath: dbPath2,
    draftsDir,
    reportsDir,
    zrzutkaDraftsDir: zrzDraftsDir,
    zrzutkaReportsDir: zrzReportsDir,
  });
  assert.equal(firstRun.executed, true);
  assert.equal(firstRun.jobId, 'PAT-20261123-mission-report');
  assert.equal(firstRun.zrzutkaJobId, 'ZRZ-20261123-mission-report');
  assert.equal(firstRun.zrzutkaStatus, 'SZKIC');

  // Usuń rekord zrzutka_jobs i sprawdź, że syncMissingZrzutkaCycles / runNextCycle dogrywa brakujące lustro!
  const checkDb = openPatroniteDb({ repoRoot: REPO_ROOT, dbPath: dbPath2 });
  checkDb.db.exec('DELETE FROM zrzutka_jobs;');
  checkDb.close();

  const backfill = await syncMissingZrzutkaCycles({
    repoRoot: REPO_ROOT,
    dbPath: dbPath2,
    patroniteDraftsDir: draftsDir,
    zrzutkaDraftsDir: zrzDraftsDir,
    zrzutkaReportsDir: zrzReportsDir,
  });
  assert.equal(backfill.newlySynced, 1);
  assert.equal(backfill.results[0].jobId, 'ZRZ-20261123-mission-report');

  const secondSync = await syncMissingZrzutkaCycles({
    repoRoot: REPO_ROOT,
    dbPath: dbPath2,
    patroniteDraftsDir: draftsDir,
    zrzutkaDraftsDir: zrzDraftsDir,
    zrzutkaReportsDir: zrzReportsDir,
  });
  assert.equal(secondSync.newlySynced, 0);
  assert.equal(secondSync.alreadySynced, 1);
});

test('5. Strona podglądu /test/zrzutka jest noindex, nie zawiera Mission Control i ma 1-Click narzędzia dla zrzutka.pl/rs4g4v', () => {
  const htmlPath = path.join(REPO_ROOT, 'test', 'zrzutka', 'index.html');
  assert.equal(fs.existsSync(htmlPath), true);
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.equal(/name="robots"\s+content="noindex,nofollow"/i.test(html), true);
  assert.equal(/mission\s*control/i.test(html), false);
  assert.equal(html.includes('https://zrzutka.pl/rs4g4v'), true);
  assert.equal(html.includes('copyFullUpdateBtn'), true);
  assert.equal(html.includes('downloadLandscapeBtn'), true);
});
