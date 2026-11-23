import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { openWznDb, loadWznConfig } from './db.mjs';
import { fetchVerifiedDailyVerse, getWarsawDateParts } from './verse-source.mjs';
import { composeDailyMessage } from './composer.mjs';
import { validateComposedPublication } from './theology-guard.mjs';
import {
  assertPermittedAction,
  assertPublisherAccountSecurity,
  createLuminaAdminFirestoreClient,
  LuminaTablicaFirestorePublisher,
  syncEditorialProfileToFirestore,
  TestSimulationPublisher,
  publishWithControlledRetry,
} from './publisher.mjs';
import { writeOpenBotScheduleProposal } from './scheduler.mjs';
import { broadcastDailyToPublicChat } from './chat-broadcast.mjs';

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

function appendAlert(alertsPath, { runDate, code, reason }) {
  fs.mkdirSync(path.dirname(alertsPath), { recursive: true });
  const line = `- [${new Date().toISOString()}] **${runDate}** \`${code}\`: ${reason}\n`;
  if (!fs.existsSync(alertsPath)) {
    fs.writeFileSync(alertsPath, '# Alerty Nadzoru — Wiadomości z nieba\n\n' + line, 'utf8');
  } else {
    fs.appendFileSync(alertsPath, line, 'utf8');
  }
}

function addDaysToIsoDate(dateStr, deltaDays) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + deltaDays, 12, 0, 0));
}

export async function runDailyCycle({
  date = new Date(),
  dayOverride = null,
  mode = 'TEST_SIMULATION',
  rootDir = DEFAULT_REPO_ROOT,
  dbPath = null,
  verseSourcePath = null,
  bibleChaptersDir = null,
  draftsDir = null,
  alertsPath = null,
  adapter = null,
  actorContext = { authenticated: true, role: 'test_operator', provider: 'local' },
  recentThemes = [],
  retryDelayMs = 0,
} = {}) {
  const cfg = loadWznConfig(rootDir);
  const runDate = getWarsawDateParts(date).dateStr;
  const jobId = `WZN-${runDate}`;
  const db = openWznDb({
    dbPath: dbPath || path.resolve(rootDir, cfg.paths.sqliteDb),
    repoRoot: rootDir,
  });
  const resolvedAlertsPath = alertsPath || path.resolve(rootDir, cfg.paths.alertsPath);
  const resolvedDraftsDir = draftsDir || path.resolve(rootDir, cfg.paths.draftsDir);
  let publishAdapter = adapter;

  try {
    assertPermittedAction('record_daily_analytics');

    if (db.getFlag('kill_switch') === '1') {
      db.incrementAnalyticsCounter(runDate, 'errors_count', 0, 'KILLED');
      db.logAudit({ level: 'WARN', event: 'run_killed', runDate, details: { reason: 'kill_switch' } });
      return {
        ok: false,
        blocked: true,
        status: 'KILLED',
        code: 'KILL_SWITCH_ACTIVE',
        reason: 'Wyłącznik awaryjny (kill_switch) jest aktywny.',
        runDate,
      };
    }

    // Kontrola duplikatu w bieżącym dniu (Europe/Warsaw)
    const existing = db.getDailyRun(runDate);
    if (existing && ['DRAFT_TEST', 'PUBLISHED_LIVE', 'RECOVERED'].includes(existing.status)) {
      db.incrementAnalyticsCounter(runDate, 'duplicates_blocked_count', 1, existing.status);
      db.logAudit({
        level: 'WARN',
        event: 'duplicate_prevented',
        runDate,
        details: { existingPostId: existing.post_id, idempotencyKey: existing.idempotency_key },
      });
      return {
        ok: true,
        skipped: true,
        status: 'SKIPPED_DUPLICATE',
        reason: 'Wiadomość na ten dzień została już przygotowana lub opublikowana.',
        runDate,
        existingPostId: existing.post_id,
      };
    }

    // 1. Pobierz i zweryfikuj werset z autorytatywnego źródła
    const verseRes = fetchVerifiedDailyVerse({
      date,
      dayOverride,
      rootDir,
      verseSourcePath,
      bibleChaptersDir,
      config: cfg,
    });

    if (!verseRes.ok) {
      const failKey = `wzn:${runDate}:blocked:${verseRes.code}`;
      db.recordDailyRun({
        runDate,
        jobId,
        mode,
        status: 'BLOCKED_SOURCE',
        verseDay: verseRes.day ?? null,
        verseReference: verseRes.reference ?? null,
        idempotencyKey: failKey,
        attempts: 1,
        errorCode: verseRes.code,
        errorMessage: verseRes.reason,
      });
      db.incrementAnalyticsCounter(runDate, 'errors_count', 1, 'BLOCKED_SOURCE');
      db.logAudit({ level: 'ERROR', event: 'source_blocked', runDate, details: verseRes });
      appendAlert(resolvedAlertsPath, { runDate, code: verseRes.code, reason: verseRes.reason });
      return {
        ok: false,
        blocked: true,
        status: 'BLOCKED_SOURCE',
        code: verseRes.code,
        reason: verseRes.reason,
        alertSupervision: true,
        runDate,
      };
    }

    const verse = verseRes.verse;

    // 2. Złóż 5-elementową publikację
    const composed = composeDailyMessage({
      verse,
      runDate,
      recentThemes,
      config: cfg,
      rootDir,
    });

    // 3. Kontrola teologiczna i kontekstu biblijnego
    const theology = validateComposedPublication({ composed, verse, config: cfg });
    if (!theology.ok) {
      db.recordDailyRun({
        runDate,
        jobId,
        mode,
        status: 'BLOCKED_THEOLOGY',
        verseDay: verse.day,
        verseReference: verse.referencePl,
        verseHash: verse.sha256,
        themeId: composed.themeId,
        idempotencyKey: composed.idempotencyKey,
        attempts: 1,
        errorCode: 'THEOLOGY_GUARD_FAILED',
        errorMessage: 'Niespełniona bramka bezpieczeństwa teologicznego.',
      });
      db.incrementAnalyticsCounter(runDate, 'errors_count', 1, 'BLOCKED_THEOLOGY');
      db.logAudit({ level: 'ERROR', event: 'theology_blocked', runDate, details: theology });
      appendAlert(resolvedAlertsPath, {
        runDate,
        code: 'THEOLOGY_GUARD_FAILED',
        reason: `Blokada teologiczna dla ${verse.referencePl}`,
      });
      return {
        ok: false,
        blocked: true,
        status: 'BLOCKED_THEOLOGY',
        code: 'THEOLOGY_GUARD_FAILED',
        reason: 'Niespełniona bramka bezpieczeństwa teologicznego.',
        theology,
        runDate,
      };
    }

    // 4. Zabezpieczenia konta publikacyjnego i bramka L0
    try {
      assertPublisherAccountSecurity({ mode, config: cfg, db, actorContext, repoRoot: rootDir });
    } catch (secErr) {
      db.recordDailyRun({
        runDate,
        jobId,
        mode,
        status: 'BLOCKED_SECURITY',
        verseDay: verse.day,
        verseReference: verse.referencePl,
        verseHash: verse.sha256,
        themeId: composed.themeId,
        idempotencyKey: composed.idempotencyKey,
        attempts: 1,
        errorCode: secErr.code || 'SECURITY_ERROR',
        errorMessage: secErr.message,
      });
      db.incrementAnalyticsCounter(runDate, 'errors_count', 1, 'BLOCKED_SECURITY');
      db.logAudit({ level: 'ERROR', event: 'security_blocked', runDate, details: { code: secErr.code, message: secErr.message } });
      return {
        ok: false,
        blocked: true,
        status: 'BLOCKED_SECURITY',
        code: secErr.code || 'SECURITY_ERROR',
        reason: secErr.message,
        runDate,
      };
    }

    // 5. Kontrolowana publikacja z idempotentnym odzyskiwaniem
    try {
      if (!publishAdapter) {
        publishAdapter =
          mode === 'PRODUCTION_LIVE'
            ? new LuminaTablicaFirestorePublisher({ firestoreClient: createLuminaAdminFirestoreClient(rootDir) })
            : new TestSimulationPublisher({ repoRoot: rootDir, draftsDir: resolvedDraftsDir });
      }
      const pubResult = await publishWithControlledRetry({
        adapter: publishAdapter,
        payload: composed.luminaPostPayload,
        idempotencyKey: composed.idempotencyKey,
        maxAttempts: Number(cfg.schedule?.maxRetryAttempts || 3),
        retryDelayMs,
      });

      const finalStatus = pubResult.status || (mode === 'PRODUCTION_LIVE' ? 'PUBLISHED_LIVE' : 'DRAFT_TEST');
      const publishedAt = new Date().toISOString();

      db.recordDailyRun({
        runDate,
        jobId,
        mode,
        status: finalStatus,
        verseDay: verse.day,
        verseReference: verse.referencePl,
        verseHash: verse.sha256,
        themeId: composed.themeId,
        postId: pubResult.postId,
        idempotencyKey: composed.idempotencyKey,
        attempts: pubResult.attempts || 1,
        publishedAt,
      });

      db.incrementAnalyticsCounter(runDate, 'published_count', 1, finalStatus);
      db.logAudit({
        level: 'INFO',
        event: 'daily_cycle_published',
        runDate,
        details: {
          postId: pubResult.postId,
          status: finalStatus,
          attempts: pubResult.attempts,
          recovered: Boolean(pubResult.recoveredFromPartialSuccess),
          verseReference: verse.referencePl,
        },
      });

      const latestStatusPath = path.resolve(rootDir, cfg.paths.latestStatusPath);
      fs.mkdirSync(path.dirname(latestStatusPath), { recursive: true });
      fs.writeFileSync(
        latestStatusPath,
        JSON.stringify(
          {
            runDate,
            status: finalStatus,
            postId: pubResult.postId,
            verseReference: verse.referencePl,
            themeId: composed.themeId,
            mode,
            updatedAt: publishedAt,
          },
          null,
          2
        ),
        'utf8'
      );

      return {
        ok: true,
        status: finalStatus,
        runDate,
        postId: pubResult.postId,
        idempotencyKey: composed.idempotencyKey,
        attempts: pubResult.attempts || 1,
        recoveredFromPartialSuccess: Boolean(pubResult.recoveredFromPartialSuccess),
        verse,
        composed,
        theology,
        publishResult: pubResult,
      };
    } catch (pubErr) {
      db.recordDailyRun({
        runDate,
        jobId,
        mode,
        status: 'ERROR_PUBLISH',
        verseDay: verse.day,
        verseReference: verse.referencePl,
        verseHash: verse.sha256,
        themeId: composed.themeId,
        idempotencyKey: composed.idempotencyKey,
        attempts: pubErr.attempts || 1,
        errorCode: pubErr.code || 'PUBLISH_FAILED',
        errorMessage: pubErr.message,
      });
      db.incrementAnalyticsCounter(runDate, 'errors_count', 1, 'ERROR_PUBLISH');
      db.logAudit({ level: 'ERROR', event: 'publish_failed', runDate, details: { code: pubErr.code, message: pubErr.message } });
      appendAlert(resolvedAlertsPath, {
        runDate,
        code: pubErr.code || 'PUBLISH_FAILED',
        reason: pubErr.message,
      });
      return {
        ok: false,
        blocked: true,
        status: 'ERROR_PUBLISH',
        code: pubErr.code || 'PUBLISH_FAILED',
        reason: pubErr.message,
        attempts: pubErr.attempts || 1,
        runDate,
      };
    }
  } finally {
    db.close();
  }
}

export async function simulateTenDays({
  startDate = '2026-11-23',
  days = 10,
  rootDir = DEFAULT_REPO_ROOT,
} = {}) {
  const cfg = loadWznConfig(rootDir);
  const simDbPath = path.resolve(rootDir, cfg.paths.simulationSqliteDb);
  const draftsDir = path.resolve(rootDir, cfg.paths.draftsDir);
  const alertsPath = path.resolve(rootDir, cfg.paths.alertsPath);
  const previewDataPath = path.resolve(rootDir, cfg.paths.previewDataPath);
  const proposalPath = path.resolve(rootDir, cfg.paths.openbotProposalPath);

  for (const suffix of ['', '-shm', '-wal']) {
    if (fs.existsSync(simDbPath + suffix)) {
      fs.unlinkSync(simDbPath + suffix);
    }
  }

  const recentThemes = [];
  const tenDays = [];

  for (let i = 0; i < days; i++) {
    const cycleDate = addDaysToIsoDate(startDate, i);
    const res = await runDailyCycle({
      date: cycleDate,
      mode: 'TEST_SIMULATION',
      rootDir,
      dbPath: simDbPath,
      draftsDir,
      alertsPath,
      recentThemes,
    });
    if (!res.ok) {
      throw new Error(`Symulacja zatrzymana w dniu ${res.runDate}: ${res.code} ${res.reason}`);
    }
    recentThemes.push(res.composed.themeId);
    tenDays.push({
      dayIndex: i + 1,
      runDate: res.runDate,
      status: res.status,
      postId: res.postId,
      idempotencyKey: res.idempotencyKey,
      verse: {
        day: res.verse.day,
        reference: res.verse.reference,
        referencePl: res.verse.referencePl,
        text: res.verse.text,
        translation: res.verse.translation,
        license: res.verse.license,
        canonicalVerified: res.verse.canonicalVerified,
        sha256: res.verse.sha256,
      },
      themeId: res.composed.themeId,
      themeLabel: res.composed.themeLabel,
      sections: res.composed.sections,
      bodyText: res.composed.bodyText,
      dedicatedImage: res.composed.dedicatedImage,
      actionUrl: cfg.profile.mainUrl,
      theology: res.theology,
    });
  }

  // Test odporności na podwójne uruchomienie tego samego dnia
  const duplicateProbe = await runDailyCycle({
    date: addDaysToIsoDate(startDate, 0),
    mode: 'TEST_SIMULATION',
    rootDir,
    dbPath: simDbPath,
    draftsDir,
    alertsPath,
  });

  // Izolowany test fail-closed przy niedostępnym źródle
  const failProbeDb = path.resolve(rootDir, 'wiadomosci-z-nieba', 'state', 'probe-missing-source.sqlite');
  const failProbeAlerts = path.resolve(rootDir, 'wiadomosci-z-nieba', 'state', 'probe-alerts.md');
  const failProbeDrafts = path.resolve(rootDir, 'wiadomosci-z-nieba', 'state', 'probe-drafts');
  for (const suffix of ['', '-shm', '-wal']) {
    if (fs.existsSync(failProbeDb + suffix)) fs.unlinkSync(failProbeDb + suffix);
  }
  if (fs.existsSync(failProbeAlerts)) fs.unlinkSync(failProbeAlerts);
  if (fs.existsSync(failProbeDrafts)) fs.rmSync(failProbeDrafts, { recursive: true, force: true });
  const missingSourceProbe = await runDailyCycle({
    date: addDaysToIsoDate(startDate, 20),
    mode: 'TEST_SIMULATION',
    rootDir,
    dbPath: failProbeDb,
    verseSourcePath: path.resolve(rootDir, 'wiadomosci-z-nieba', 'state', 'nieistniejacy_plik_wersetow.json'),
    draftsDir: failProbeDrafts,
    alertsPath: failProbeAlerts,
  });
  const supervisionAlertWritten = fs.existsSync(failProbeAlerts);
  for (const suffix of ['', '-shm', '-wal']) {
    if (fs.existsSync(failProbeDb + suffix)) fs.unlinkSync(failProbeDb + suffix);
  }
  if (fs.existsSync(failProbeAlerts)) fs.unlinkSync(failProbeAlerts);
  if (fs.existsSync(failProbeDrafts)) fs.rmSync(failProbeDrafts, { recursive: true, force: true });

  const db = openWznDb({ dbPath: simDbPath, repoRoot: rootDir });
  const summary = db.exportStateSummary();
  db.close();

  const scheduleProposal = writeOpenBotScheduleProposal(proposalPath, cfg);

  const simulationPayload = {
    generatedAt: new Date().toISOString(),
    environment: 'TEST',
    mode: cfg.mode,
    autoPublishEnabled: false,
    productionApprovedByOwner: false,
    zeroCost: true,
    profile: cfg.profile,
    schedule: scheduleProposal,
    tenDays,
    verificationChecks: {
      duplicateRunBlocked: duplicateProbe.status === 'SKIPPED_DUPLICATE',
      duplicateRunStatus: duplicateProbe.status,
      missingSourceBlocked: missingSourceProbe.status === 'BLOCKED_SOURCE' && missingSourceProbe.alertSupervision === true && supervisionAlertWritten,
      missingSourceCode: missingSourceProbe.code,
    },
    analyticsSummary: {
      totals: summary.totals,
      dailyRows: summary.analytics,
      dailyRuns: summary.runs.map(r => ({
        runDate: r.run_date,
        status: r.status,
        verseDay: r.verse_day,
        verseReference: r.verse_reference,
        postId: r.post_id,
        attempts: r.attempts,
      })),
    },
  };

  fs.mkdirSync(path.dirname(previewDataPath), { recursive: true });
  fs.writeFileSync(previewDataPath, JSON.stringify(simulationPayload, null, 2), 'utf8');

  return simulationPayload;
}

export function syncPublicSiteData({
  startDate = null,
  days = 10,
  rootDir = DEFAULT_REPO_ROOT,
} = {}) {
  const cfg = loadWznConfig(rootDir);
  const todayStr = getWarsawDateParts(new Date()).dateStr;
  let windowStart = startDate;
  if (!windowStart) {
    if (todayStr <= '2026-12-02') {
      windowStart = '2026-11-23';
    } else {
      windowStart = getWarsawDateParts(addDaysToIsoDate(todayStr, -(days - 1))).dateStr;
    }
  }

  const recentThemes = [];
  const tenDays = [];
  for (let i = 0; i < days; i++) {
    const cycleDate = addDaysToIsoDate(windowStart, i);
    const runDate = getWarsawDateParts(cycleDate).dateStr;
    const verseRes = fetchVerifiedDailyVerse({ date: cycleDate, rootDir, config: cfg });
    if (!verseRes.ok) {
      throw new Error(`Nie można odświeżyć publicznych danych (${runDate}): ${verseRes.code} ${verseRes.reason}`);
    }
    const composed = composeDailyMessage({
      verse: verseRes.verse,
      runDate,
      recentThemes,
      config: cfg,
      rootDir,
    });
    const theology = validateComposedPublication({ composed, verse: verseRes.verse, config: cfg });
    if (!theology.ok) {
      throw new Error(`Blokada teologiczna w publicznych danych (${runDate})`);
    }
    recentThemes.push(composed.themeId);
    tenDays.push({
      dayIndex: i + 1,
      runDate,
      status: runDate <= todayStr ? 'PUBLISHED_LIVE' : 'SCHEDULED_VERIFIED',
      postId: composed.postId,
      idempotencyKey: composed.idempotencyKey,
      verse: {
        day: verseRes.verse.day,
        reference: verseRes.verse.reference,
        referencePl: verseRes.verse.referencePl,
        text: verseRes.verse.text,
        translation: verseRes.verse.translation,
        license: verseRes.verse.license,
        canonicalVerified: verseRes.verse.canonicalVerified,
        sha256: verseRes.verse.sha256,
      },
      themeId: composed.themeId,
      themeLabel: composed.themeLabel,
      sections: composed.sections,
      bodyText: composed.bodyText,
      dedicatedImage: composed.dedicatedImage,
      actionUrl: cfg.profile.mainUrl,
      theology,
    });
  }

  const proposalPath = path.resolve(rootDir, cfg.paths.openbotProposalPath);
  const scheduleProposal = writeOpenBotScheduleProposal(proposalPath, cfg);
  const publicDataPath = path.resolve(rootDir, cfg.paths.publicDataPath || 'wiadomosc-z-nieba/data.json');
  const payload = {
    generatedAt: new Date().toISOString(),
    environment: 'PRODUCTION',
    mode: cfg.mode,
    autoPublishEnabled: cfg.autoPublishEnabled === true,
    productionApprovedByOwner: cfg.productionApprovedByOwner === true,
    zeroCost: true,
    profile: cfg.profile,
    schedule: scheduleProposal,
    tenDays,
  };
  fs.mkdirSync(path.dirname(publicDataPath), { recursive: true });
  fs.writeFileSync(publicDataPath, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] || 'status';
  const cfg = loadWznConfig(DEFAULT_REPO_ROOT);

  if (cmd === 'approve-l0') {
    const db = openWznDb({ repoRoot: DEFAULT_REPO_ROOT });
    db.setFlag('kill_switch', '0');
    db.setFlag('auto_publish_enabled', cfg.autoPublishEnabled ? '1' : '0');
    db.setFlag('production_approved_by_owner', cfg.productionApprovedByOwner ? '1' : '0');
    const summary = db.exportStateSummary();
    db.close();
    const proposal = writeOpenBotScheduleProposal(
      path.resolve(DEFAULT_REPO_ROOT, cfg.paths.openbotProposalPath),
      cfg
    );
    const siteData = syncPublicSiteData({ rootDir: DEFAULT_REPO_ROOT });
    console.log(JSON.stringify({
      ok: true,
      flags: summary.flags,
      scheduleEnabled: proposal.enabled,
      publicDaysCount: siteData.tenDays.length,
    }, null, 2));
    return;
  }

  if (cmd === 'sync-profile') {
    const res = await syncEditorialProfileToFirestore({ rootDir: DEFAULT_REPO_ROOT, config: cfg });
    console.log(JSON.stringify(res, null, 2));
    if (!res.ok) process.exit(1);
    return;
  }

  if (cmd === 'sync-site') {
    const res = syncPublicSiteData({ rootDir: DEFAULT_REPO_ROOT });
    console.log(JSON.stringify({ ok: true, count: res.tenDays.length, path: cfg.paths.publicDataPath }, null, 2));
    return;
  }

  if (cmd === 'simulate-ten-days') {
    const startIdx = args.indexOf('--start-date');
    const startDate = startIdx !== -1 ? args[startIdx + 1] : '2026-11-23';
    const result = await simulateTenDays({ startDate, days: 10, rootDir: DEFAULT_REPO_ROOT });
    console.log(JSON.stringify({
      ok: true,
      daysGenerated: result.tenDays.length,
      duplicateRunBlocked: result.verificationChecks.duplicateRunBlocked,
      missingSourceBlocked: result.verificationChecks.missingSourceBlocked,
      totals: result.analyticsSummary.totals,
      previewDataPath: cfg.paths.previewDataPath,
    }, null, 2));
    return;
  }

  if (cmd === 'run-daily') {
    const dateIdx = args.indexOf('--date');
    const dateArg = dateIdx !== -1 ? new Date(`${args[dateIdx + 1]}T07:00:00+01:00`) : new Date();
    const actorContext =
      cfg.mode === 'PRODUCTION_LIVE'
        ? { authenticated: true, role: 'server_admin', provider: 'admin_sdk' }
        : { authenticated: true, role: 'test_operator', provider: 'local' };
    const res = await runDailyCycle({
      date: dateArg,
      mode: cfg.mode,
      rootDir: DEFAULT_REPO_ROOT,
      actorContext,
    });
    let chat = null;
    if (cfg.mode === 'PRODUCTION_LIVE' && (res.ok || res.status === 'SKIPPED_DUPLICATE')) {
      syncPublicSiteData({ rootDir: DEFAULT_REPO_ROOT });
      // @007 (L0 23.11.2026): ta sama wiadomość w czacie głównym Lumi Mess (07:00). Błąd czatu nie cofa publikacji dnia.
      try {
        chat = await broadcastDailyToPublicChat({ slot: 'morning', date: dateArg, rootDir: DEFAULT_REPO_ROOT, firestoreClient: createLuminaAdminFirestoreClient(DEFAULT_REPO_ROOT), config: cfg });
      } catch (chatErr) {
        chat = { ok: false, status: 'ERROR_CHAT', reason: chatErr.message };
      }
    }
    console.log(JSON.stringify({
      ok: res.ok,
      status: res.status,
      runDate: res.runDate,
      postId: res.postId || null,
      code: res.code || null,
      reason: res.reason || null,
      chat,
    }, null, 2));
    if (!res.ok) process.exit(1);
    return;
  }

  // @007 (L0 23.11.2026): 19:00 — ten sam werset dnia ponownie w czacie głównym Lumi Mess.
  // Użycie: run-evening [--date RRRR-MM-DD]   |   broadcast-chat --slot morning|evening [--date RRRR-MM-DD]
  if (cmd === 'run-evening' || cmd === 'broadcast-chat') {
    const dateIdx = args.indexOf('--date');
    const slotIdx = args.indexOf('--slot');
    const slot = cmd === 'run-evening' ? 'evening' : (slotIdx !== -1 ? args[slotIdx + 1] : 'morning');
    const dateArg = dateIdx !== -1 ? new Date(`${args[dateIdx + 1]}T12:00:00+01:00`) : new Date();
    const res = await broadcastDailyToPublicChat({ slot, date: dateArg, rootDir: DEFAULT_REPO_ROOT, firestoreClient: createLuminaAdminFirestoreClient(DEFAULT_REPO_ROOT), config: cfg });
    console.log(JSON.stringify(res, null, 2));
    if (!res.ok) process.exit(1);
    return;
  }

  if (cmd === 'pause' || cmd === 'resume') {
    const db = openWznDb({ repoRoot: DEFAULT_REPO_ROOT });
    db.setFlag('kill_switch', cmd === 'pause' ? '1' : '0');
    const summary = db.exportStateSummary();
    db.close();
    console.log(JSON.stringify({ ok: true, kill_switch: summary.flags.kill_switch }, null, 2));
    return;
  }

  const db = openWznDb({ repoRoot: DEFAULT_REPO_ROOT });
  const summary = db.exportStateSummary();
  db.close();
  console.log(JSON.stringify({
    ok: true,
    mode: cfg.mode,
    autoPublishEnabled: cfg.autoPublishEnabled,
    productionApprovedByOwner: cfg.productionApprovedByOwner,
    flags: summary.flags,
    totals: summary.totals,
    runsCount: summary.runs.length,
  }, null, 2));
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch(err => {
    console.error('❌ Błąd pipeline Wiadomości z nieba:', err.message);
    process.exit(1);
  });
}
