import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadConfig, openPatroniteDb } from './db.mjs';
import { buildUpcomingCycles, canExecuteCycle } from './scheduler.mjs';
import { collectAuthorizedSources } from './collector.mjs';
import { validateCollectedSnapshot } from './evidence-validator.mjs';
import { computeContentHash, selectTopicForCycle } from './editorial-planner.mjs';
import { generatePatroniteDraft } from './text-writer.mjs';
import { renderPatroniteGraphic } from './visual-director.mjs';
import { runQualityGuardian } from './quality-guardian.mjs';
import { DraftPackagePublisher, executePublishWithGuards } from './publisher.mjs';
import { buildWeeklyThreeCycleSummary, writeCycleReport } from './reporter.mjs';
import {
  ZrzutkaDraftPackagePublisher,
  adaptDraftForZrzutka,
  executeZrzutkaPublishWithGuards,
  toZrzutkaJobId,
  writeZrzutkaCycleReport,
} from './zrzutka-adapter.mjs';

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

function inferGraphicSpecFromLegacyDraft(patroniteDraft, repoRoot) {
  if (patroniteDraft.graphicSpec && patroniteDraft.graphicSpec.headline) {
    return patroniteDraft.graphicSpec;
  }
  const tplPath = path.join(repoRoot, 'patronite', 'templates', patroniteDraft.seriesType || 'mission-report', 'template.json');
  const tpl = fs.existsSync(tplPath) ? JSON.parse(fs.readFileSync(tplPath, 'utf8')) : {};
  const title = String(patroniteDraft.title || '');
  const bibliaMatch = title.match(/(\d+)\s+rozdział/i);
  if (bibliaMatch) {
    return {
      seriesType: patroniteDraft.seriesType || 'mission-report',
      headline: `${bibliaMatch[1]} ROZDZIAŁÓW`,
      accentHeadline: 'BIBLII AUDIO CC',
      subtitle: 'Słowo Boże bezpłatnie i bez reklam.',
      photoRelPath: tpl.defaultPhoto || 'images/ogloszenia-tworcy-wolontariat.jpg',
      altText: patroniteDraft.altText || title,
    };
  }
  return {
    seriesType: patroniteDraft.seriesType || 'mission-report',
    headline: String(patroniteDraft.seriesLabel || 'DZIENNIK MISJI').toUpperCase().slice(0, 24),
    accentHeadline: 'CHRISTIAN CULTURE',
    subtitle: 'Wspieramy misję bez reklam i opłat.',
    photoRelPath: tpl.defaultPhoto || 'images/ogloszenia-tworcy-wolontariat.jpg',
    altText: patroniteDraft.altText || title,
  };
}

export async function runZrzutkaMirrorForDraft({
  cycle,
  patroniteDraft,
  repoRoot = DEFAULT_REPO_ROOT,
  db,
  config,
  isSimulation = true,
  zrzutkaAdapter = null,
  zrzutkaDraftsDir: customZrzutkaDraftsRoot = null,
  zrzutkaReportsDir: customZrzutkaReportsDir = null,
}) {
  const zrzutkaDraft = adaptDraftForZrzutka(patroniteDraft, config);
  const gSpec = inferGraphicSpecFromLegacyDraft(patroniteDraft, repoRoot);
  const contentHash = computeContentHash(zrzutkaDraft.title, zrzutkaDraft.body);

  const draftsRoot = customZrzutkaDraftsRoot || path.join(repoRoot, 'patronite', 'zrzutka', 'drafts');
  const draftDir = path.join(draftsRoot, zrzutkaDraft.jobId);
  const landscapeOut = path.join(draftDir, 'graphic-1068x630.png');
  const squareOut = path.join(draftDir, 'promo-1080x1080.png');

  const graphicMeta = await renderPatroniteGraphic({
    repoRoot,
    seriesType: zrzutkaDraft.seriesType,
    headline: gSpec.headline,
    accentHeadline: gSpec.accentHeadline,
    subtitle: gSpec.subtitle,
    photoRelPath: gSpec.photoRelPath,
    outputPath: landscapeOut,
    format: 'landscape',
    channel: 'zrzutka',
  });

  const squareMeta = await renderPatroniteGraphic({
    repoRoot,
    seriesType: zrzutkaDraft.seriesType,
    headline: gSpec.headline,
    accentHeadline: gSpec.accentHeadline,
    subtitle: gSpec.subtitle,
    photoRelPath: gSpec.photoRelPath,
    outputPath: squareOut,
    format: 'square',
    channel: 'zrzutka',
  });

  // Deduplikacja 30-dniowa została zweryfikowana na wspólnym cyklu Patronite — dla lustra Zrzutki walidujemy wszystkie 12 kryteriów z pustym archiwum duplikatów.
  const qaResult = await runQualityGuardian({
    draft: zrzutkaDraft,
    graphicMeta,
    recentArchive: [],
    config,
    repoRoot,
  });

  const activeAdapter = zrzutkaAdapter || new ZrzutkaDraftPackagePublisher({ repoRoot, draftsDir: draftsRoot });
  const publishRes = await executeZrzutkaPublishWithGuards({
    draft: zrzutkaDraft,
    graphicMeta,
    squareMeta,
    qaResult,
    config: { ...config, _repoRoot: repoRoot },
    db,
    adapter: activeAdapter,
    livePublishRequested: !isSimulation,
  });

  db.recordZrzutkaJob({
    zrzutkaJobId: zrzutkaDraft.jobId,
    patroniteJobId: zrzutkaDraft.sourcePatroniteJobId,
    fundraiserCode: zrzutkaDraft.fundraiserCode,
    createdAt: new Date().toISOString(),
    scheduledFor: cycle.scheduledForWarsaw || zrzutkaDraft.scheduledForWarsaw,
    prepAt: cycle.prepAtWarsaw || zrzutkaDraft.prepAtWarsaw || cycle.scheduledForWarsaw || zrzutkaDraft.scheduledForWarsaw,
    seriesType: zrzutkaDraft.seriesType,
    title: zrzutkaDraft.title,
    topicKey: zrzutkaDraft.topicKey || 'synced-from-patronite',
    contentHash,
    qaStatus: qaResult.overallStatus,
    qaDetails: qaResult,
    graphicPath: landscapeOut,
    squareGraphicPath: squareOut,
    publishStatus: publishRes.status,
    publishedUrl: publishRes.url,
    remoteUpdateId: publishRes.remoteUpdateId,
    verifiedAt: publishRes.verifiedAt,
    errorCode: publishRes.verified ? null : publishRes.code,
    attempts: 1,
  });

  const zrzutkaResult = {
    jobId: zrzutkaDraft.jobId,
    sourcePatroniteJobId: zrzutkaDraft.sourcePatroniteJobId,
    fundraiserUrl: zrzutkaDraft.fundraiserUrl,
    fundraiserCode: zrzutkaDraft.fundraiserCode,
    fundraiserOrganizer: zrzutkaDraft.fundraiserOrganizer,
    seriesType: zrzutkaDraft.seriesType,
    seriesLabel: zrzutkaDraft.seriesLabel,
    weekdayName: cycle.weekdayName || '',
    scheduledForWarsaw: cycle.scheduledForWarsaw || zrzutkaDraft.scheduledForWarsaw,
    prepAtWarsaw: cycle.prepAtWarsaw || zrzutkaDraft.prepAtWarsaw || '',
    visibility: zrzutkaDraft.visibility || 'PUBLICZNY',
    status: publishRes.status,
    blockReason: publishRes.verified ? null : publishRes.code,
    url: publishRes.url,
    draftDir,
    title: zrzutkaDraft.title,
    teaser: zrzutkaDraft.teaser,
    body: zrzutkaDraft.body,
    question: zrzutkaDraft.question,
    cta: zrzutkaDraft.cta,
    hashtags: zrzutkaDraft.hashtags,
    altText: zrzutkaDraft.altText,
    zrzutkaPlainText: zrzutkaDraft.zrzutkaPlainText,
    scripture: zrzutkaDraft.scripture || null,
    topicKey: zrzutkaDraft.topicKey || 'synced-from-patronite',
    charCounts: zrzutkaDraft.charCounts,
    sources: zrzutkaDraft.sources || [],
    graphicMeta,
    squareMeta,
    qaResult,
  };

  writeZrzutkaCycleReport({
    repoRoot,
    reportsDir: customZrzutkaReportsDir,
    zrzutkaResult,
  });

  return zrzutkaResult;
}

function writeZrzutkaLatestStatusFile(repoRoot, zrzutkaResult) {
  if (!zrzutkaResult) return;
  const statusPath = path.join(repoRoot, 'patronite', 'zrzutka', 'state', 'latest-cycle-status.json');
  fs.mkdirSync(path.dirname(statusPath), { recursive: true });
  fs.writeFileSync(statusPath, JSON.stringify({
    updatedAt: new Date().toISOString(),
    jobId: zrzutkaResult.jobId,
    sourcePatroniteJobId: zrzutkaResult.sourcePatroniteJobId,
    fundraiserUrl: zrzutkaResult.fundraiserUrl,
    seriesLabel: zrzutkaResult.seriesLabel,
    scheduledForWarsaw: zrzutkaResult.scheduledForWarsaw,
    status: zrzutkaResult.status,
    qaOverall: zrzutkaResult.qaResult?.overallStatus,
    title: zrzutkaResult.title || null,
    draftDir: zrzutkaResult.draftDir || null,
    blockReason: zrzutkaResult.blockReason || null,
  }, null, 2), 'utf8');
}

export async function syncZrzutkaFromExistingPatroniteJob({
  patroniteJobId,
  repoRoot = DEFAULT_REPO_ROOT,
  db,
  config,
  patroniteDraftsDir = null,
  zrzutkaDraftsDir = null,
  zrzutkaReportsDir = null,
  zrzutkaAdapter = null,
}) {
  const zJobId = toZrzutkaJobId(patroniteJobId);
  const existingZrz = db.getZrzutkaJob(zJobId);
  if (existingZrz && existingZrz.qa_status === 'PASS' && ['SZKIC', 'ZAPLANOWANO', 'OPUBLIKOWANO'].includes(existingZrz.publish_status)) {
    return { synced: false, alreadySynced: true, jobId: zJobId, status: existingZrz.publish_status };
  }

  const pDraftsRoot = patroniteDraftsDir || path.join(repoRoot, 'patronite', 'drafts');
  const postJsonPath = path.join(pDraftsRoot, patroniteJobId, 'post.json');
  if (!fs.existsSync(postJsonPath)) {
    return { synced: false, alreadySynced: false, jobId: zJobId, status: 'BRAK_ZRODLA_PATRONITE', error: `Brak pliku ${postJsonPath}` };
  }

  const patroniteDraft = JSON.parse(fs.readFileSync(postJsonPath, 'utf8'));
  const pJobRow = db.listJobs(50).find(j => j.job_id === patroniteJobId);
  const cycle = {
    jobId: patroniteJobId,
    seriesType: patroniteDraft.seriesType,
    seriesLabel: patroniteDraft.seriesLabel,
    scheduledForWarsaw: patroniteDraft.scheduledForWarsaw || pJobRow?.scheduled_for,
    prepAtWarsaw: pJobRow?.prep_at || patroniteDraft.scheduledForWarsaw,
  };
  if (!patroniteDraft.topicKey && pJobRow?.topic_key) {
    patroniteDraft.topicKey = pJobRow.topic_key;
  }

  const zrzutkaResult = await runZrzutkaMirrorForDraft({
    cycle,
    patroniteDraft,
    repoRoot,
    db,
    config,
    isSimulation: false,
    zrzutkaAdapter,
    zrzutkaDraftsDir,
    zrzutkaReportsDir,
  });

  return {
    synced: true,
    alreadySynced: false,
    jobId: zrzutkaResult.jobId,
    status: zrzutkaResult.status,
    zrzutkaResult,
  };
}

export async function syncMissingZrzutkaCycles({
  repoRoot = DEFAULT_REPO_ROOT,
  dbPath,
  patroniteDraftsDir = null,
  zrzutkaDraftsDir = null,
  zrzutkaReportsDir = null,
  zrzutkaAdapter = null,
} = {}) {
  const config = loadConfig(repoRoot);
  const isCustomTestDb = Boolean(dbPath);
  const db = openPatroniteDb({ repoRoot, dbPath });
  try {
    const pJobs = db.listJobs(30).filter(
      j => j.qa_status === 'PASS' && ['SZKIC', 'ZAPLANOWANO', 'OPUBLIKOWANO'].includes(j.publish_status),
    );
    const syncedResults = [];
    for (const pj of pJobs) {
      const res = await syncZrzutkaFromExistingPatroniteJob({
        patroniteJobId: pj.job_id,
        repoRoot,
        db,
        config,
        patroniteDraftsDir,
        zrzutkaDraftsDir,
        zrzutkaReportsDir,
        zrzutkaAdapter,
      });
      syncedResults.push(res);
      if (res.synced && res.zrzutkaResult && !isCustomTestDb) {
        writeZrzutkaLatestStatusFile(repoRoot, res.zrzutkaResult);
      }
    }
    if (!isCustomTestDb) {
      db.exportRegistrySnapshot(path.join(repoRoot, 'patronite', 'state', 'registry-export.json'));
    }
    return {
      totalChecked: pJobs.length,
      newlySynced: syncedResults.filter(r => r.synced).length,
      alreadySynced: syncedResults.filter(r => r.alreadySynced).length,
      results: syncedResults,
    };
  } finally {
    db.close();
  }
}

export function writeOpenBotProposal({ repoRoot = DEFAULT_REPO_ROOT, config }) {
  const approved = Boolean(config.productionApprovedByOwner);
  const proposal = {
    id: 'icc-patronite-mission-reporter',
    name: 'CC Patronite + Zrzutka.pl Mission Reporter (@ICC-PATRONITE-001 + @ICC-ZRZUTKA-001)',
    enabled: approved,
    requiresOwnerApprovalL0: !approved,
    approvedAt: config.productionApprovedAt || null,
    activeScheduler: 'PM2 Agent-Cron (Wektor1_VideoFactory/cron_agent.js)',
    synchronizedChannels: [
      { id: 'patronite', url: config.integration?.patroniteProfileUrl || 'https://patronite.pl/osobowoscplus' },
      { id: 'zrzutka', url: config.zrzutka?.fundraiserUrl || 'https://zrzutka.pl/rs4g4v' },
    ],
    note: approved
      ? 'Aktywowane przez właściciela L0 (Cezary Rogowski). Podpięte pod istniejący harmonogram PM2 Agent-Cron bez drugiego równoległego demona cron. Każdy cykl przygotowuje jednocześnie pakiety 1:1 dla Patronite oraz Zrzutka.pl (rs4g4v).'
      : 'Zarejestrowane wyłącznie jako propozycja wyłączona do istniejącej infrastruktury @ICC (OpenBot/Agent-Cron), aby nie tworzyć drugiego równoległego demona cron przed zgodą L0.',
    provider: 'opencode',
    model: 'opencode/deepseek-v4.1-flash-free',
    timezone: config.timezone,
    prepSchedule: [
      { weekday: 'Monday', time: '07:00', targetPublish: '09:00', seriesType: 'mission-report' },
      { weekday: 'Wednesday', time: '16:00', targetPublish: '18:00', seriesType: 'behind-the-scenes' },
      { weekday: 'Friday', time: '08:00', targetPublish: '10:00', seriesType: 'thank-you', sabbathCutoff: '14:30' },
    ],
    command: 'node patronite/src/pipeline.mjs run-next-cycle',
  };
  const outPath = path.join(repoRoot, 'patronite', 'state', 'openbot-schedule-proposal.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(proposal, null, 2), 'utf8');
  return proposal;
}

export async function runCycle({
  cycle,
  repoRoot = DEFAULT_REPO_ROOT,
  db,
  config,
  validatedSnapshot,
  isSimulation = true,
  adapter = null,
  draftsDir: customDraftsRoot = null,
  reportsDir: customReportsDir = null,
  zrzutkaAdapter = null,
  zrzutkaDraftsDir = null,
  zrzutkaReportsDir = null,
  syncZrzutka = true,
}) {
  const execCheck = canExecuteCycle({ config, db, slotDate: new Date(cycle.scheduledForUtc) });
  if (!execCheck.allowed) {
    db.logAudit({ actor: 'scheduler', action: 'run_cycle_blocked', jobId: cycle.jobId, status: 'WSTRZYMANO', details: execCheck });
    return {
      ...cycle,
      status: 'WSTRZYMANO',
      blockReason: `${execCheck.code}: ${execCheck.message}`,
      qaResult: { overallStatus: 'BLOCKED', passedCount: 0, totalCount: 12, checks: [] },
    };
  }

  const recentArchive = db.getRecentArchive({ referenceDateIso: cycle.scheduledForUtc, windowDays: config.dedupeWindowDays });
  const plan = selectTopicForCycle({
    cycle,
    validatedSnapshot,
    recentArchive,
    threshold: config.similarityThreshold || 0.65,
  });

  if (!plan.selected) {
    db.logAudit({ actor: 'editorial_planner', action: 'select_topic', jobId: cycle.jobId, status: 'WSTRZYMANO', details: plan });
    return {
      ...cycle,
      status: 'WSTRZYMANO',
      blockReason: plan.reason || 'BRAK_ZWERYFIKOWANEGO_TEMATU',
      qaResult: { overallStatus: 'BLOCKED', passedCount: 0, totalCount: 12, checks: [] },
    };
  }

  const topic = plan.selected;
  const draft = generatePatroniteDraft({ cycle, topic, config });
  const contentHash = computeContentHash(draft.title, draft.body);

  const draftsRoot = customDraftsRoot || path.join(repoRoot, 'patronite', 'drafts');
  const draftDir = path.join(draftsRoot, cycle.jobId);
  const landscapeOut = path.join(draftDir, 'graphic-1068x630.png');
  const squareOut = path.join(draftDir, 'promo-1080x1080.png');

  const graphicMeta = await renderPatroniteGraphic({
    repoRoot,
    seriesType: cycle.seriesType,
    headline: draft.graphicSpec.headline,
    accentHeadline: draft.graphicSpec.accentHeadline,
    subtitle: draft.graphicSpec.subtitle,
    photoRelPath: draft.graphicSpec.photoRelPath,
    outputPath: landscapeOut,
    format: 'landscape',
  });

  const squareMeta = await renderPatroniteGraphic({
    repoRoot,
    seriesType: cycle.seriesType,
    headline: draft.graphicSpec.headline,
    accentHeadline: draft.graphicSpec.accentHeadline,
    subtitle: draft.graphicSpec.subtitle,
    photoRelPath: draft.graphicSpec.photoRelPath,
    outputPath: squareOut,
    format: 'square',
  });

  const qaResult = await runQualityGuardian({
    draft,
    graphicMeta,
    recentArchive,
    config,
    repoRoot,
  });

  const activeAdapter = adapter || new DraftPackagePublisher({ repoRoot, draftsDir: draftsRoot });
  const publishRes = await executePublishWithGuards({
    draft,
    graphicMeta,
    squareMeta,
    qaResult,
    config: { ...config, _repoRoot: repoRoot },
    db,
    adapter: activeAdapter,
    livePublishRequested: !isSimulation,
  });

  db.recordJob({
    jobId: cycle.jobId,
    createdAt: new Date().toISOString(),
    scheduledFor: cycle.scheduledForWarsaw,
    prepAt: cycle.prepAtWarsaw,
    seriesType: cycle.seriesType,
    title: draft.title,
    topicKey: draft.topicKey,
    contentHash,
    sources: draft.sources,
    qaStatus: qaResult.overallStatus,
    qaDetails: qaResult,
    graphicPath: landscapeOut,
    squareGraphicPath: squareOut,
    visibility: draft.visibility,
    publishStatus: publishRes.status,
    publishedUrl: publishRes.url,
    remotePostId: publishRes.remotePostId,
    verifiedAt: publishRes.verifiedAt,
    errorCode: publishRes.verified ? null : publishRes.code,
    attempts: 1,
  });

  db.recordEvidence(
    cycle.jobId,
    draft.sources.map((s, idx) => ({
      evidenceId: `${cycle.jobId}-EV-${idx + 1}`,
      claim: s.claim,
      status: s.status,
      sourceName: s.sourceName,
      sourceRef: s.sourceRef,
      verifiedDate: s.verifiedDate,
    })),
  );

  // Zapisujemy do archiwum 30-dniowego zarówno po publikacji, jak i po przygotowaniu zweryfikowanego szkicu w symulacji, aby kolejne cykle w ciągu 2 tygodni nie powtarzały tematu.
  if (qaResult.overallStatus === 'PASS') {
    db.recordPublished({
      jobId: cycle.jobId,
      topicKey: draft.topicKey,
      title: draft.title,
      teaser: draft.teaser,
      contentHash,
      publishedAt: cycle.scheduledForUtc,
      url: publishRes.url || `local-draft://${cycle.jobId}`,
      seriesType: draft.seriesType,
    });
  }

  let zrzutkaResult = null;
  if (syncZrzutka && config.zrzutka?.enabled !== false && qaResult.overallStatus === 'PASS') {
    zrzutkaResult = await runZrzutkaMirrorForDraft({
      cycle,
      patroniteDraft: draft,
      repoRoot,
      db,
      config,
      isSimulation,
      zrzutkaAdapter,
      zrzutkaDraftsDir,
      zrzutkaReportsDir,
    });
  }

  const cycleResult = {
    ...cycle,
    status: publishRes.status,
    blockReason: publishRes.verified ? null : publishRes.code,
    url: publishRes.url,
    draftDir,
    title: draft.title,
    teaser: draft.teaser,
    body: draft.body,
    question: draft.question,
    cta: draft.cta,
    hashtags: draft.hashtags,
    altText: draft.altText,
    scripture: draft.scripture,
    topicKey: draft.topicKey,
    charCounts: draft.charCounts,
    sources: draft.sources,
    graphicMeta,
    squareMeta,
    qaResult,
    zrzutka: zrzutkaResult,
  };

  writeCycleReport({ repoRoot, reportsDir: customReportsDir, cycleResult });
  return cycleResult;
}

export async function simulateTwoWeeks({
  repoRoot = DEFAULT_REPO_ROOT,
  startDate = new Date('2026-11-23T06:00:00+01:00'),
  dbPath,
  draftsDir = null,
  reportsDir = null,
  zrzutkaDraftsDir = null,
  zrzutkaReportsDir = null,
  exportTestPreview = true,
} = {}) {
  const config = loadConfig(repoRoot);
  const resolvedSimDb = dbPath || path.join(repoRoot, 'patronite', 'state', 'patronite-simulation.sqlite');
  const db = openPatroniteDb({ repoRoot, dbPath: resolvedSimDb });

  try {
    // Wyczyść poprzednie rekordy symulacji dla powtarzalnego testu deterministycznego 6 cykli
    db.db.exec('DELETE FROM evidence_registry; DELETE FROM published_archive; DELETE FROM zrzutka_jobs; DELETE FROM jobs;');

    const snapshot = collectAuthorizedSources(repoRoot, { saveSnapshot: exportTestPreview });
    const validatedSnapshot = validateCollectedSnapshot(snapshot, repoRoot);
    const cycles = buildUpcomingCycles({ fromDate: startDate, count: 6, config });

    const results = [];
    for (const cycle of cycles) {
      const res = await runCycle({
        cycle,
        repoRoot,
        db,
        config,
        validatedSnapshot,
        isSimulation: true,
        draftsDir,
        reportsDir,
        zrzutkaDraftsDir,
        zrzutkaReportsDir,
      });
      results.push(res);
    }

    const week1 = buildWeeklyThreeCycleSummary({ repoRoot, reportsDir, cycles: results.slice(0, 3), weekLabel: 'Tydzien-1' });
    const week2 = buildWeeklyThreeCycleSummary({ repoRoot, reportsDir, cycles: results.slice(3, 6), weekLabel: 'Tydzien-2' });
    if (exportTestPreview) {
      writeOpenBotProposal({ repoRoot, config });
      db.exportRegistrySnapshot(path.join(repoRoot, 'patronite', 'state', 'registry-export.json'));
    }

    if (exportTestPreview) {
      const previewDir = path.join(repoRoot, 'test', 'patronite');
      const gfxDir = path.join(previewDir, 'graphics');
      fs.mkdirSync(gfxDir, { recursive: true });
      const exportedCycles = [];
      for (const r of results) {
        const landName = `${r.jobId}-1068x630.png`;
        const sqName = `${r.jobId}-1080x1080.png`;
        if (r.graphicMeta?.outputPath && fs.existsSync(r.graphicMeta.outputPath)) {
          fs.copyFileSync(r.graphicMeta.outputPath, path.join(gfxDir, landName));
        }
        if (r.squareMeta?.outputPath && fs.existsSync(r.squareMeta.outputPath)) {
          fs.copyFileSync(r.squareMeta.outputPath, path.join(gfxDir, sqName));
        }
        exportedCycles.push({
          jobId: r.jobId,
          seriesType: r.seriesType,
          seriesLabel: r.seriesLabel,
          weekdayName: r.weekdayName,
          scheduledForWarsaw: r.scheduledForWarsaw,
          prepAtWarsaw: r.prepAtWarsaw,
          visibility: r.visibility,
          status: r.status,
          title: r.title,
          teaser: r.teaser,
          body: r.body,
          question: r.question,
          cta: r.cta,
          hashtags: r.hashtags,
          altText: r.altText,
          scripture: r.scripture,
          charCounts: r.charCounts,
          topicKey: r.topicKey,
          sources: r.sources,
          graphicUrl: `/test/patronite/graphics/${landName}`,
          squareGraphicUrl: `/test/patronite/graphics/${sqName}`,
          graphicDimensions: r.graphicMeta ? `${r.graphicMeta.width}×${r.graphicMeta.height}` : null,
          graphicSizeKb: r.graphicMeta ? Math.round(r.graphicMeta.fileSizeBytes / 1024) : null,
          squareDimensions: r.squareMeta ? `${r.squareMeta.width}×${r.squareMeta.height}` : null,
          qaOverall: r.qaResult.overallStatus,
          qaPassed: r.qaResult.passedCount,
          qaTotal: r.qaResult.totalCount,
          qaChecks: r.qaResult.checks,
        });
      }
      const previewPayload = {
        directive: config.directive,
        generatedAt: new Date().toISOString(),
        mode: config.mode,
        productionApprovedByOwner: Boolean(config.productionApprovedByOwner) || db.getFlag('production_approved') === '1',
        killSwitch: db.getFlag('kill_switch') === '1',
        integrationStatus: {
          patroniteProfileUrl: config.integration.patroniteProfileUrl,
          apiAvailability: 'CLOSED_BETA_CONTACT_REQUIRED',
          activeAdapter: 'DraftPackagePublisher (kompletne szkice + gotowe grafiki)',
          note: 'Serwis patronite.pl nie udostępnia otwartego publicznego REST API do publikacji postów. System przygotowuje kompletne pakiety i jest gotowy do oficjalnego planowania lub zamkniętej bety po decyzji właściciela.',
        },
        weeklySummaries: [
          { label: 'Tydzień 1 (3 cykle)', counts: week1.counts },
          { label: 'Tydzień 2 (3 cykle)', counts: week2.counts },
        ],
        cyclesCount: exportedCycles.length,
        cycles: exportedCycles,
      };
      fs.writeFileSync(path.join(previewDir, 'simulation-data.json'), JSON.stringify(previewPayload, null, 2), 'utf8');

      // Lustrzany eksport podglądu Zrzutka.pl (https://zrzutka.pl/rs4g4v) -> /test/zrzutka
      const zrzPreviewDir = path.join(repoRoot, 'test', 'zrzutka');
      const zrzGfxDir = path.join(zrzPreviewDir, 'graphics');
      fs.mkdirSync(zrzGfxDir, { recursive: true });
      const exportedZrzutkaCycles = [];
      for (const r of results) {
        const z = r.zrzutka;
        if (!z) continue;
        const landName = `${z.jobId}-1068x630.png`;
        const sqName = `${z.jobId}-1080x1080.png`;
        if (z.graphicMeta?.outputPath && fs.existsSync(z.graphicMeta.outputPath)) {
          fs.copyFileSync(z.graphicMeta.outputPath, path.join(zrzGfxDir, landName));
        }
        if (z.squareMeta?.outputPath && fs.existsSync(z.squareMeta.outputPath)) {
          fs.copyFileSync(z.squareMeta.outputPath, path.join(zrzGfxDir, sqName));
        }
        exportedZrzutkaCycles.push({
          jobId: z.jobId,
          sourcePatroniteJobId: z.sourcePatroniteJobId,
          fundraiserUrl: z.fundraiserUrl,
          fundraiserCode: z.fundraiserCode,
          seriesType: z.seriesType,
          seriesLabel: z.seriesLabel,
          weekdayName: r.weekdayName,
          scheduledForWarsaw: z.scheduledForWarsaw,
          prepAtWarsaw: z.prepAtWarsaw,
          visibility: z.visibility,
          status: z.status,
          title: z.title,
          teaser: z.teaser,
          body: z.body,
          question: z.question,
          cta: z.cta,
          hashtags: z.hashtags,
          altText: z.altText,
          zrzutkaPlainText: z.zrzutkaPlainText,
          scripture: z.scripture,
          charCounts: z.charCounts,
          topicKey: z.topicKey,
          sources: z.sources,
          graphicUrl: `/test/zrzutka/graphics/${landName}`,
          squareGraphicUrl: `/test/zrzutka/graphics/${sqName}`,
          graphicDimensions: z.graphicMeta ? `${z.graphicMeta.width}×${z.graphicMeta.height}` : null,
          graphicSizeKb: z.graphicMeta ? Math.round(z.graphicMeta.fileSizeBytes / 1024) : null,
          squareDimensions: z.squareMeta ? `${z.squareMeta.width}×${z.squareMeta.height}` : null,
          qaOverall: z.qaResult.overallStatus,
          qaPassed: z.qaResult.passedCount,
          qaTotal: z.qaResult.totalCount,
          qaChecks: z.qaResult.checks,
        });
      }
      const zrzPreviewPayload = {
        directive: config.zrzutka?.directive || '@ICC-ZRZUTKA-001',
        synchronizedWith: config.directive,
        generatedAt: new Date().toISOString(),
        mode: config.mode,
        productionApprovedByOwner: Boolean(config.productionApprovedByOwner) || db.getFlag('production_approved') === '1',
        killSwitch: db.getFlag('kill_switch') === '1',
        integrationStatus: {
          fundraiserUrl: config.zrzutka?.fundraiserUrl || 'https://zrzutka.pl/rs4g4v',
          fundraiserCode: config.zrzutka?.fundraiserCode || 'rs4g4v',
          fundraiserOrganizer: config.zrzutka?.fundraiserOrganizer || 'Wioletta Rogowska (Christian Culture)',
          apiAvailability: 'CLOUDFLARE_PROTECTED_NO_PUBLIC_WRITE_API',
          activeAdapter: 'ZrzutkaDraftPackagePublisher (1-Click kopiowanie + gotowe grafiki 1068×630 i 1080×1080)',
          note: 'Serwis zrzutka.pl jest chroniony przez Cloudflare i nie udostępnia otwartego publicznego REST API zapisu aktualizacji. System automatycznie w tych samych dniach i godzinach co Patronite (Pon 07:00→09:00, Śr 16:00→18:00, Pt 08:00→10:00) przygotowuje kompletny, zweryfikowany pakiet aktualizacji oraz dedykowane grafiki Zrzutka.pl gotowe do wklejenia jednym kliknięciem.',
        },
        weeklySummaries: [
          { label: 'Tydzień 1 (3 cykle)', counts: week1.counts },
          { label: 'Tydzień 2 (3 cykle)', counts: week2.counts },
        ],
        cyclesCount: exportedZrzutkaCycles.length,
        cycles: exportedZrzutkaCycles,
      };
      fs.writeFileSync(path.join(zrzPreviewDir, 'simulation-data.json'), JSON.stringify(zrzPreviewPayload, null, 2), 'utf8');
    }

    return { results, week1, week2 };
  } finally {
    db.close();
  }
}

export async function runNextCycle({
  repoRoot = DEFAULT_REPO_ROOT,
  now = new Date(),
  dbPath,
  draftsDir,
  reportsDir,
  zrzutkaDraftsDir,
  zrzutkaReportsDir,
} = {}) {
  const config = loadConfig(repoRoot);
  const isCustomTestDb = Boolean(dbPath);
  const db = openPatroniteDb({ repoRoot, dbPath });

  try {
    const execCheck = canExecuteCycle({ config, db, slotDate: now });
    if (!execCheck.allowed) {
      db.logAudit({ actor: 'scheduler', action: 'run_next_cycle_blocked', status: 'WSTRZYMANO', details: execCheck });
      return {
        executed: false,
        alreadyPrepared: false,
        status: 'WSTRZYMANO',
        code: execCheck.code,
        message: execCheck.message,
      };
    }

    const upcoming = buildUpcomingCycles({ fromDate: now, count: 1, config });
    const cycle = upcoming[0];
    if (!cycle) {
      return {
        executed: false,
        alreadyPrepared: false,
        status: 'WSTRZYMANO',
        code: 'NO_UPCOMING_CYCLE',
        message: 'Brak kolejnego okna w harmonogramie.',
      };
    }

    const existing = db.listJobs(50).find(
      j => j.job_id === cycle.jobId && j.qa_status === 'PASS' && ['SZKIC', 'ZAPLANOWANO', 'OPUBLIKOWANO'].includes(j.publish_status),
    );
    if (existing) {
      // Jeśli Patronite był już przygotowany, ale brakuje jeszcze lustra Zrzutka.pl, dograj je automatycznie (backfill idempotentny).
      let zrzutkaSync = null;
      if (config.zrzutka?.enabled !== false) {
        zrzutkaSync = await syncZrzutkaFromExistingPatroniteJob({
          patroniteJobId: cycle.jobId,
          repoRoot,
          db,
          config,
          patroniteDraftsDir: draftsDir,
          zrzutkaDraftsDir,
          zrzutkaReportsDir,
        });
        if (zrzutkaSync.synced && zrzutkaSync.zrzutkaResult && !isCustomTestDb) {
          writeZrzutkaLatestStatusFile(repoRoot, zrzutkaSync.zrzutkaResult);
          db.exportRegistrySnapshot(path.join(repoRoot, 'patronite', 'state', 'registry-export.json'));
        }
      }
      db.logAudit({
        actor: 'pipeline',
        action: 'run_next_cycle_already_prepared',
        jobId: cycle.jobId,
        status: existing.publish_status,
        details: { scheduledFor: existing.scheduled_for, zrzutkaSynced: Boolean(zrzutkaSync?.synced) },
      });
      return {
        executed: false,
        alreadyPrepared: true,
        jobId: cycle.jobId,
        status: existing.publish_status,
        scheduledForWarsaw: cycle.scheduledForWarsaw,
        zrzutkaSync,
      };
    }

    const snapshot = collectAuthorizedSources(repoRoot, { saveSnapshot: !isCustomTestDb });
    const validatedSnapshot = validateCollectedSnapshot(snapshot, repoRoot);
    const adapter = new DraftPackagePublisher({ repoRoot, draftsDir });
    const cycleResult = await runCycle({
      cycle,
      repoRoot,
      db,
      config,
      validatedSnapshot,
      isSimulation: false,
      adapter,
      draftsDir,
      reportsDir,
      zrzutkaDraftsDir,
      zrzutkaReportsDir,
    });

    if (!isCustomTestDb) {
      db.exportRegistrySnapshot(path.join(repoRoot, 'patronite', 'state', 'registry-export.json'));
      const statusPath = path.join(repoRoot, 'patronite', 'state', 'latest-cycle-status.json');
      fs.writeFileSync(statusPath, JSON.stringify({
        updatedAt: new Date().toISOString(),
        jobId: cycleResult.jobId,
        seriesLabel: cycleResult.seriesLabel,
        scheduledForWarsaw: cycleResult.scheduledForWarsaw,
        status: cycleResult.status,
        qaOverall: cycleResult.qaResult?.overallStatus,
        title: cycleResult.title || null,
        draftDir: cycleResult.draftDir || null,
        blockReason: cycleResult.blockReason || null,
        zrzutkaJobId: cycleResult.zrzutka?.jobId || null,
        zrzutkaStatus: cycleResult.zrzutka?.status || null,
      }, null, 2), 'utf8');
      if (cycleResult.zrzutka) {
        writeZrzutkaLatestStatusFile(repoRoot, cycleResult.zrzutka);
      }
    }

    return {
      executed: true,
      alreadyPrepared: false,
      jobId: cycleResult.jobId,
      status: cycleResult.status,
      zrzutkaJobId: cycleResult.zrzutka?.jobId || null,
      zrzutkaStatus: cycleResult.zrzutka?.status || null,
      cycleResult,
    };
  } finally {
    db.close();
  }
}

async function main() {
  const cmd = process.argv[2] || 'status';
  const repoRoot = DEFAULT_REPO_ROOT;
  const config = loadConfig(repoRoot);

  if (cmd === 'simulate-two-weeks') {
    const out = await simulateTwoWeeks({ repoRoot });
    console.log(`✅ Symulacja 2 tygodni (6 cykli Patronite + 6 lustrzanych cykli Zrzutka.pl) zakończona:`);
    for (const r of out.results) {
      const zInfo = r.zrzutka ? ` | Zrzutka=${r.zrzutka.jobId} (${r.zrzutka.status}, QA=${r.zrzutka.qaResult.passedCount}/${r.zrzutka.qaResult.totalCount})` : '';
      console.log(`  - ${r.jobId} | ${r.scheduledForWarsaw} | ${r.seriesLabel} | status=${r.status} | QA=${r.qaResult.passedCount}/${r.qaResult.totalCount}${zInfo} | ${r.title}`);
    }
    return;
  }

  if (cmd === 'sync-zrzutka') {
    const res = await syncMissingZrzutkaCycles({ repoRoot });
    console.log(`✅ Synchronizacja Zrzutka.pl (${config.zrzutka?.fundraiserUrl || 'https://zrzutka.pl/rs4g4v'}): sprawdzono=${res.totalChecked}, dograno=${res.newlySynced}, wcześniej gotowe=${res.alreadySynced}`);
    console.log(JSON.stringify(res.results.map(r => ({ jobId: r.jobId, synced: r.synced, alreadySynced: r.alreadySynced, status: r.status })), null, 2));
    return;
  }

  if (cmd === 'run-next-cycle') {
    const res = await runNextCycle({ repoRoot });
    if (!res.executed && res.alreadyPrepared) {
      console.log(`ℹ️ Cykl ${res.jobId} jest już wcześniej przygotowany (${res.status}) na ${res.scheduledForWarsaw}.`);
      if (res.zrzutkaSync?.synced) {
        console.log(`✅ Dograno lustrzany pakiet Zrzutka.pl: ${res.zrzutkaSync.jobId} (${res.zrzutkaSync.status}).`);
      }
      console.log(JSON.stringify(res, null, 2));
      return;
    }
    if (!res.executed) {
      console.log(`⏸️ Cykl wstrzymany [${res.code}]: ${res.message}`);
      console.log(JSON.stringify(res, null, 2));
      return;
    }
    const r = res.cycleResult;
    console.log(`✅ Cykl ${r.jobId} (${r.seriesLabel}) | status=${r.status} | QA=${r.qaResult?.passedCount}/${r.qaResult?.totalCount}` + (r.zrzutka ? ` | Zrzutka=${r.zrzutka.jobId} (${r.zrzutka.status}, QA=${r.zrzutka.qaResult?.passedCount}/${r.zrzutka.qaResult?.totalCount})` : ''));
    console.log(JSON.stringify({
      jobId: r.jobId,
      status: r.status,
      scheduledForWarsaw: r.scheduledForWarsaw,
      qa: r.qaResult?.overallStatus,
      draftDir: r.draftDir || null,
      zrzutkaJobId: r.zrzutka?.jobId || null,
      zrzutkaStatus: r.zrzutka?.status || null,
      zrzutkaDraftDir: r.zrzutka?.draftDir || null,
      blockReason: r.blockReason || null,
    }, null, 2));
    if (r.status === 'BŁĄD') {
      process.exitCode = 1;
    }
    return;
  }

  const db = openPatroniteDb({ repoRoot });
  try {
    if (cmd === 'approve-l0') {
      db.setFlag('production_approved', '1', 'owner_l0_2026-11-20');
      writeOpenBotProposal({ repoRoot, config });
      console.log('✅ Zgoda L0 (production_approved=1) zapisana w bazie oraz w deskryptorze harmonogramu.');
    } else if (cmd === 'pause') {
      db.setFlag('kill_switch', '1', 'operator_cli');
      console.log('🛑 Wyłącznik awaryjny (kill_switch=1) AKTYWNY. Publikacje Patronite i Zrzutka.pl wstrzymane.');
    } else if (cmd === 'resume') {
      db.setFlag('kill_switch', '0', 'operator_cli');
      console.log('▶️ Wyłącznik awaryjny wyłączony (kill_switch=0). Harmonogram Patronite + Zrzutka.pl gotowy.');
    } else if (cmd === 'status') {
      const jobs = db.listJobs(20);
      const zrzutkaJobs = db.listZrzutkaJobs(20);
      const next = buildUpcomingCycles({ fromDate: new Date(), count: 1, config })[0];
      console.log(JSON.stringify({
        directive: config.directive,
        zrzutkaDirective: config.zrzutka?.directive || '@ICC-ZRZUTKA-001',
        zrzutkaFundraiserUrl: config.zrzutka?.fundraiserUrl || 'https://zrzutka.pl/rs4g4v',
        mode: config.mode,
        killSwitch: db.getFlag('kill_switch') === '1',
        productionApproved: db.getFlag('production_approved') === '1',
        nextCycle: next?.scheduledForWarsaw || null,
        nextPrep: next?.prepAtWarsaw || null,
        storedJobsCount: jobs.length,
        storedZrzutkaJobsCount: zrzutkaJobs.length,
        lastJobs: jobs.map(j => ({ jobId: j.job_id, scheduled: j.scheduled_for, qa: j.qa_status, status: j.publish_status })),
        lastZrzutkaJobs: zrzutkaJobs.map(j => ({ jobId: j.zrzutka_job_id, sourcePatronite: j.patronite_job_id, scheduled: j.scheduled_for, qa: j.qa_status, status: j.publish_status })),
      }, null, 2));
    } else {
      console.error(`Nieznana komenda: ${cmd}`);
      process.exitCode = 1;
    }
  } finally {
    db.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(err => {
    console.error('❌ Błąd potoku Patronite:', err);
    process.exit(1);
  });
}
