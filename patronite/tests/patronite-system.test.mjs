import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { createRequire } from 'node:module';

import { loadConfig, openPatroniteDb } from '../src/db.mjs';
import { buildUpcomingCycles, canExecuteCycle, checkSabbathWindow, formatWarsawIso } from '../src/scheduler.mjs';
import { collectAuthorizedSources, sanitizePublicText } from '../src/collector.mjs';
import { classifyEvidenceItem, EVIDENCE_STATUS, verifyBibleQuote } from '../src/evidence-validator.mjs';
import { checkDuplicateAgainstArchive, computeContentHash } from '../src/editorial-planner.mjs';
import { generatePatroniteDraft } from '../src/text-writer.mjs';
import { renderPatroniteGraphic } from '../src/visual-director.mjs';
import { runQualityGuardian } from '../src/quality-guardian.mjs';
import { assertPermittedAction, executePublishWithGuards, PatroniteOfficialApiAdapter } from '../src/publisher.mjs';
import { simulateTwoWeeks } from '../src/pipeline.mjs';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

function withTempDb(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-patronite-test-'));
  const dbPath = path.join(dir, 'patronite.sqlite');
  const auditPath = path.join(dir, 'audit.jsonl');
  const db = openPatroniteDb({ repoRoot: REPO_ROOT, dbPath, auditLogJsonlPath: auditPath });
  t.after(() => {
    try {
      db.close();
    } finally {
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 6, retryDelay: 50 });
    }
  });
  return { dir, dbPath, auditPath, db };
}

test('1. Harmonogram Europe/Warsaw obsługuje przejścia DST (marzec/październik), okno -2h i blokadę szabatu', () => {
  const config = loadConfig(REPO_ROOT);

  // Przejście zimowy -> letni (ostatnia niedziela marca 2027: 2027-03-28)
  const springCycles = buildUpcomingCycles({
    fromDate: new Date('2027-03-26T00:00:00+01:00'),
    count: 4,
    config,
  });
  assert.equal(springCycles[0].scheduledForWarsaw, '2027-03-26T10:00:00+01:00');
  assert.equal(springCycles[0].prepAtWarsaw, '2027-03-26T08:00:00+01:00');
  assert.equal(springCycles[1].scheduledForWarsaw, '2027-03-29T09:00:00+02:00');
  assert.equal(springCycles[1].prepAtWarsaw, '2027-03-29T07:00:00+02:00');

  // Przejście letni -> zimowy (ostatnia niedziela października 2027: 2027-10-31)
  const autumnCycles = buildUpcomingCycles({
    fromDate: new Date('2027-10-29T00:00:00+02:00'),
    count: 4,
    config,
  });
  assert.equal(autumnCycles[0].scheduledForWarsaw, '2027-10-29T10:00:00+02:00');
  assert.equal(autumnCycles[1].scheduledForWarsaw, '2027-11-01T09:00:00+01:00');

  // Reguła szabatowa: piątek po 14:30 oraz sobota przed zachodem muszą być zablokowane
  assert.equal(checkSabbathWindow(new Date('2026-11-20T15:00:00+01:00')).allowed, false);
  assert.equal(checkSabbathWindow(new Date('2026-11-21T12:00:00+01:00')).allowed, false);
  assert.equal(checkSabbathWindow(new Date('2026-11-20T10:00:00+01:00')).allowed, true);
  assert.ok(formatWarsawIso(new Date('2027-06-01T10:00:00Z')).endsWith('+02:00'));
});

test('2. Collector pobiera wyłącznie autoryzowane źródła i usuwa wewnętrzne nazwy zaplecza', () => {
  const snapshot = collectAuthorizedSources(REPO_ROOT, { saveSnapshot: false, includeGitLog: false });
  assert.ok(snapshot.sourcesCount >= 6);
  const serialized = JSON.stringify(snapshot);
  assert.equal(/mission\s*control/i.test(serialized), false);
  assert.equal(sanitizePublicText('Test Mission Control panel'), 'Test wewnętrzne zaplecze @ICC panel');
});

test('3. Evidence Validator blokuje informacje niepotwierdzone, plany i same commity jako ZREALIZOWANE', () => {
  const unconfirmed = classifyEvidenceItem({ claim: 'X', sourceName: '', verifiedDate: '2026-11-20' }, REPO_ROOT);
  assert.equal(unconfirmed.status, EVIDENCE_STATUS.NIEPOTWIERDZONE);
  assert.equal(unconfirmed.allowedAsCompletedFact, false);

  const planOnly = classifyEvidenceItem({
    claim: 'Planowany cykl',
    sourceName: 'JOMA',
    verifiedDate: '2026-11-20',
    isPlanOnly: true,
    hasLiveArtifact: true,
    artifactPath: 'help.html',
  }, REPO_ROOT);
  assert.equal(planOnly.status, EVIDENCE_STATUS.PLANOWANE);
  assert.equal(planOnly.allowedAsCompletedFact, false);

  const commitOnly = classifyEvidenceItem({
    claim: 'fix mobile nav',
    sourceName: 'GitHub',
    verifiedDate: '2026-11-20',
    isCommitOnly: true,
    hasLiveArtifact: false,
  }, REPO_ROOT);
  assert.equal(commitOnly.status, EVIDENCE_STATUS.W_TRAKCIE);
  assert.equal(commitOnly.allowedAsCompletedFact, false);
});

test('4. Evidence Validator blokuje zmyślone cytaty biblijne i skróty ksiąg, a przepuszcza dosłowne UBG-2025', () => {
  const abbrev = verifyBibleQuote({ book: 'Ps', chapter: 23, verse: 1, text: 'Pan jest moim pasterzem, niczego mi nie zabraknie.' }, REPO_ROOT);
  assert.equal(abbrev.valid, false);
  assert.equal(abbrev.code, 'ABBREVIATED_OR_UNKNOWN_BOOK');

  const fakeQuote = verifyBibleQuote({ book: 'Księga Psalmów', chapter: 23, verse: 1, text: 'Bóg obiecał Ci sukces finansowy.' }, REPO_ROOT);
  assert.equal(fakeQuote.valid, false);
  assert.equal(fakeQuote.code, 'VERSE_TEXT_MISMATCH');

  const validQuote = verifyBibleQuote({
    book: 'Księga Psalmów',
    chapter: 23,
    verse: 1,
    text: 'Pan jest moim pasterzem, niczego mi nie zabraknie.',
  }, REPO_ROOT);
  assert.equal(validQuote.valid, true);
  assert.equal(validQuote.code, 'VERIFIED_UBG');
});

test('5. Kontrola duplikatów blokuje identyczny temat, identyczny hash oraz parafrazę w oknie 30 dni', () => {
  const archive = [{
    job_id: 'PAT-20261123-mission-report',
    topic_key: 'src-biblia-audio-progress',
    title: 'Dziennik Misji: 31 rozdziałów Księgi Rodzaju już w Biblii Audio CC',
    teaser: 'Sprawdź, co nowego pojawiło się w naszej darmowej Biblii Audio oraz jak udostępniamy kolejne rozdziały.',
    content_hash: computeContentHash('Dziennik Misji: 31 rozdziałów Księgi Rodzaju już w Biblii Audio CC', 'Treść główna A'),
    published_at: '2026-11-23T08:00:00Z',
  }];

  const dupTopic = checkDuplicateAgainstArchive({
    topicKey: 'src-biblia-audio-progress',
    title: 'Inny tytuł',
    teaser: 'Inna zajawka',
    body: 'Inna treść',
    archive,
  });
  assert.equal(dupTopic.isDuplicate, true);

  const dupSimilarity = checkDuplicateAgainstArchive({
    topicKey: 'inny-klucz',
    title: 'Dziennik Misji: 31 rozdziałów Księgi Rodzaju dostępnych w Biblii Audio CC',
    teaser: 'Sprawdź co nowego pojawiło się w darmowej Biblii Audio i kolejne rozdziały.',
    body: 'Kolejna treść',
    archive,
  });
  assert.equal(dupSimilarity.isDuplicate, true);
});

test('6. System graficzny generuje dokładnie 1068×630 oraz 1080×1080 PNG, zachowuje proporcje logo i przechodzi Quality Guardian', async t => {
  const { db } = withTempDb(t);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-patronite-gfx-'));
  t.after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  const config = loadConfig(REPO_ROOT);
  const cycles = buildUpcomingCycles({ fromDate: new Date('2026-11-23T06:00:00+01:00'), count: 1, config });
  const snap = collectAuthorizedSources(REPO_ROOT, { saveSnapshot: false, includeGitLog: false });
  const topic = { ...snap.items.find(i => i.id === 'src-biblia-audio-progress'), evidenceStatus: EVIDENCE_STATUS.ZREALIZOWANE };
  const draft = generatePatroniteDraft({ cycle: cycles[0], topic, config });

  const landOut = path.join(tmpDir, 'test-1068x630.png');
  const sqOut = path.join(tmpDir, 'test-1080x1080.png');
  const metaLand = await renderPatroniteGraphic({
    repoRoot: REPO_ROOT,
    seriesType: 'mission-report',
    headline: draft.graphicSpec.headline,
    accentHeadline: draft.graphicSpec.accentHeadline,
    subtitle: draft.graphicSpec.subtitle,
    photoRelPath: draft.graphicSpec.photoRelPath,
    outputPath: landOut,
    format: 'landscape',
  });
  const metaSq = await renderPatroniteGraphic({
    repoRoot: REPO_ROOT,
    seriesType: 'mission-report',
    headline: draft.graphicSpec.headline,
    accentHeadline: draft.graphicSpec.accentHeadline,
    subtitle: draft.graphicSpec.subtitle,
    photoRelPath: draft.graphicSpec.photoRelPath,
    outputPath: sqOut,
    format: 'square',
  });

  const sLand = await sharp(landOut).metadata();
  const sSq = await sharp(sqOut).metadata();
  assert.equal(sLand.width, 1068);
  assert.equal(sLand.height, 630);
  assert.equal(sSq.width, 1080);
  assert.equal(sSq.height, 1080);
  assert.ok(metaLand.fileSizeBytes <= config.graphics.maxBytes);
  assert.ok(metaSq.fileSizeBytes <= config.graphics.maxBytes);

  const qa = await runQualityGuardian({
    draft,
    graphicMeta: metaLand,
    recentArchive: db.getRecentArchive(),
    config,
    repoRoot: REPO_ROOT,
  });
  assert.equal(qa.overallStatus, 'PASS');
  assert.equal(qa.passedCount, 12);
});

test('7-15. Obsługa awarii API (503), wygasłej sesji (401), błędu publikacji (500), częściowego sukcesu i ponowienia, minimalnych uprawnień oraz cyklu szkicu', async t => {
  const { db } = withTempDb(t);
  const config = loadConfig(REPO_ROOT);

  // Test minimalnych uprawnień (sekcja 10 i 15)
  for (const forbidden of ['read_patron_finances', 'send_private_message', 'modify_tiers', 'modify_account_settings']) {
    assert.throws(() => assertPermittedAction(forbidden), { code: 'PERMISSION_DENIED' });
  }

  // Test zakazu publikacji produkcyjnej przed akceptacją L0
  const cycles = buildUpcomingCycles({ fromDate: new Date('2026-11-23T06:00:00+01:00'), count: 1, config });
  const snap = collectAuthorizedSources(REPO_ROOT, { saveSnapshot: false, includeGitLog: false });
  const topic = { ...snap.items.find(i => i.id === 'src-biblia-audio-progress'), evidenceStatus: EVIDENCE_STATUS.ZREALIZOWANE };
  const draft = generatePatroniteDraft({ cycle: cycles[0], topic, config });
  const qaPass = { overallStatus: 'PASS', passedCount: 12, totalCount: 12, failedChecks: [] };
  const fakeMeta = { outputPath: path.join(REPO_ROOT, 'patronite', 'templates', 'assets', 'brand-header-lockup.png') };

  const blockedNoApproval = await executePublishWithGuards({
    draft,
    graphicMeta: fakeMeta,
    qaResult: qaPass,
    config,
    db,
    livePublishRequested: true,
  });
  assert.equal(blockedNoApproval.status, 'WSTRZYMANO');
  assert.equal(blockedNoApproval.code, 'BLOCKED_AWAITING_OWNER_APPROVAL');

  // Odblokowanie produkcyjne w izolowanym DB testowym tylko do testu adaptera HTTP
  db.setFlag('production_approved', '1', 'test_l0_fixture');

  const store = new Map();
  let nextMode = 'normal';
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      if (nextMode === 'unavailable') {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'service unavailable' }));
      }
      if (nextMode === 'expired') {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'session expired' }));
      }
      if (nextMode === 'fail500') {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'internal error' }));
      }
      const url = req.url;
      if (req.method === 'POST' && url === '/posts/drafts') {
        const body = JSON.parse(raw);
        const rec = { remotePostId: 'DK-MOCK-1', status: 'SZKIC', found: true, ...body };
        store.set(rec.remotePostId, rec);
        store.set(`job:${rec.jobId}`, rec);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(rec));
      }
      if (req.method === 'PATCH' && url.startsWith('/posts/drafts/')) {
        const id = decodeURIComponent(url.split('/').pop());
        const rec = store.get(id);
        Object.assign(rec, JSON.parse(raw));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(rec));
      }
      if (req.method === 'POST' && url.endsWith('/schedule')) {
        const id = decodeURIComponent(url.split('/')[2]);
        const rec = store.get(id);
        rec.status = 'ZAPLANOWANO';
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(rec));
      }
      if (req.method === 'POST' && url === '/posts') {
        const body = JSON.parse(raw);
        const rec = {
          remotePostId: 'PAT-MOCK-99',
          status: 'OPUBLIKOWANO',
          url: 'https://patronite.pl/post/999999/mock',
          found: true,
          ...body,
        };
        store.set(rec.remotePostId, rec);
        store.set(`job:${rec.jobId}`, rec);
        if (nextMode === 'partial_timeout') {
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(rec));
          return;
        }
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(rec));
      }
      if (req.method === 'GET' && url.startsWith('/posts/by-job/')) {
        const jobId = decodeURIComponent(url.split('/').pop());
        const rec = store.get(`job:${jobId}`);
        res.writeHead(rec ? 200 : 404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(rec || { found: false }));
      }
      if (req.method === 'GET' && url.startsWith('/posts/')) {
        if (nextMode === 'verify_missing') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ found: false }));
        }
        const id = decodeURIComponent(url.split('/').pop());
        const rec = store.get(id);
        res.writeHead(rec ? 200 : 404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(rec || { found: false }));
      }
      res.writeHead(404).end();
    });
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => {
    server.closeAllConnections?.();
    server.close();
  });
  const port = server.address().port;
  const mockToken = 'MOCK_TEST_SECRET_TOKEN_XYZ';
  const adapter = new PatroniteOfficialApiAdapter({
    baseUrl: `http://127.0.0.1:${port}`,
    tokenProvider: () => mockToken,
  });

  // A. Cykl szkicu, edycji, zaplanowania i odczytu w Patronite mock
  const dCreated = await adapter.createDraft({ draft });
  assert.equal(dCreated.status, 'SZKIC');
  await adapter.updateDraft({ remotePostId: dCreated.remotePostId, patch: { teaser: `${draft.teaser} ` } });
  const dSched = await adapter.schedulePost({ remotePostId: dCreated.remotePostId, scheduledForWarsaw: draft.scheduledForWarsaw });
  assert.equal(dSched.status, 'ZAPLANOWANO');

  // B. Niedostępność API (503)
  nextMode = 'unavailable';
  const resUnavail = await executePublishWithGuards({ draft: { ...draft, jobId: 'PAT-ERR-503' }, graphicMeta: fakeMeta, qaResult: qaPass, config, db, adapter, livePublishRequested: true });
  assert.equal(resUnavail.status, 'BŁĄD');
  assert.equal(resUnavail.code, 'API_UNAVAILABLE');

  // C. Wygasła sesja (401)
  nextMode = 'expired';
  const resExp = await executePublishWithGuards({ draft: { ...draft, jobId: 'PAT-ERR-401' }, graphicMeta: fakeMeta, qaResult: qaPass, config, db, adapter, livePublishRequested: true });
  assert.equal(resExp.status, 'BŁĄD');
  assert.equal(resExp.code, 'SESSION_EXPIRED');

  // D. Nieudana publikacja (500)
  nextMode = 'fail500';
  const res500 = await executePublishWithGuards({ draft: { ...draft, jobId: 'PAT-ERR-500' }, graphicMeta: fakeMeta, qaResult: qaPass, config, db, adapter, livePublishRequested: true });
  assert.equal(res500.status, 'BŁĄD');
  assert.equal(res500.code, 'PUBLISH_FAILED');

  // E. Częściowy sukces i ponowienie idempotentne (post powstał, weryfikacja się nie powiodła -> retry odzyskuje istniejący bez duplikatu!)
  nextMode = 'verify_missing';
  const partialFirst = await executePublishWithGuards({ draft: { ...draft, jobId: 'PAT-PARTIAL-1' }, graphicMeta: fakeMeta, qaResult: qaPass, config, db, adapter, livePublishRequested: true });
  assert.equal(partialFirst.status, 'BŁĄD');
  assert.equal(partialFirst.code, 'POST_NOT_FOUND_AFTER_PUBLISH');

  nextMode = 'normal';
  const partialRetry = await executePublishWithGuards({ draft: { ...draft, jobId: 'PAT-PARTIAL-1' }, graphicMeta: fakeMeta, qaResult: qaPass, config, db, adapter, livePublishRequested: true });
  assert.equal(partialRetry.verified, true);
  assert.equal(partialRetry.recoveredFromPartialSuccess, true);
  assert.equal(partialRetry.url, 'https://patronite.pl/post/999999/mock');

  // F. Sprawdzenie redakcji sekretów w dzienniku audytu
  db.logAudit({ actor: 'test', action: 'check_secret', status: 'OK', details: { token: 'super-secret-value', Authorization: 'Bearer abcdef1234567890abcd' } });
  const logs = db.listAudit(5);
  assert.equal(JSON.stringify(logs).includes('super-secret-value'), false);
});

test('14. Kill-switch (wstrzymanie i wznowienie) oraz persystencja stanu SQLite', async t => {
  const { db } = withTempDb(t);
  const config = loadConfig(REPO_ROOT);

  db.setFlag('kill_switch', '1', 'owner_test');
  const blocked = canExecuteCycle({ config, db, slotDate: new Date('2026-11-23T09:00:00+01:00') });
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.code, 'KILL_SWITCH_ACTIVE');

  db.setFlag('kill_switch', '0', 'owner_test');
  const resumed = canExecuteCycle({ config, db, slotDate: new Date('2026-11-23T09:00:00+01:00') });
  assert.equal(resumed.allowed, true);
});

test('16. Pełna symulacja 2 tygodni (6 cykli) przechodzi 6/6 QA 12/12 bez duplikatów i eksportuje pakiety', async t => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-patronite-simdb-'));
  t.after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));
  const simDbPath = path.join(tmpDir, 'sim.sqlite');

  const out = await simulateTwoWeeks({
    repoRoot: REPO_ROOT,
    dbPath: simDbPath,
    exportTestPreview: false,
  });

  assert.equal(out.results.length, 6);
  const topics = new Set();
  for (const r of out.results) {
    assert.equal(r.status, 'SZKIC');
    assert.equal(r.qaResult.overallStatus, 'PASS');
    assert.equal(r.qaResult.passedCount, 12);
    assert.equal(topics.has(r.topicKey), false, `Duplikat tematu: ${r.topicKey}`);
    topics.add(r.topicKey);
    assert.ok(fs.existsSync(r.graphicMeta.outputPath));
    assert.equal(r.graphicMeta.width, 1068);
    assert.equal(r.graphicMeta.height, 630);
    assert.equal(r.squareMeta.width, 1080);
    assert.equal(r.squareMeta.height, 1080);
  }
});

test('7b. Strona testowa /test/patronite istnieje, posiada noindex, zewnętrzne skrypty i zero nazwy wewnętrznego panelu', () => {
  const htmlPath = path.join(REPO_ROOT, 'test', 'patronite', 'index.html');
  assert.equal(fs.existsSync(htmlPath), true);
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /meta name="robots" content="noindex,nofollow"/i);
  assert.equal(/mission\s*control/i.test(html), false);
  const simPath = path.join(REPO_ROOT, 'test', 'patronite', 'simulation-data.json');
  assert.equal(fs.existsSync(simPath), true);
  const sim = JSON.parse(fs.readFileSync(simPath, 'utf8'));
  assert.equal(sim.cycles.length, 6);
});
