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

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

export function writeOpenBotProposal({ repoRoot = DEFAULT_REPO_ROOT, config }) {
  const proposal = {
    id: 'icc-patronite-mission-reporter',
    name: 'CC Patronite Mission Reporter (@ICC-PATRONITE-001)',
    enabled: false,
    requiresOwnerApprovalL0: true,
    note: 'Zarejestrowane wylacznie jako propozycja wylaczona do istniejacej infrastruktury @ICC (OpenBot/Agent-Cron), aby nie tworzyc drugiego rownoleglego demona cron przed zgoda L0.',
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

  const draftDir = path.join(repoRoot, 'patronite', 'drafts', cycle.jobId);
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

  const activeAdapter = adapter || new DraftPackagePublisher({ repoRoot });
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
  };

  writeCycleReport({ repoRoot, cycleResult });
  return cycleResult;
}

export async function simulateTwoWeeks({
  repoRoot = DEFAULT_REPO_ROOT,
  startDate = new Date('2026-11-23T06:00:00+01:00'),
  dbPath,
  exportTestPreview = true,
} = {}) {
  const config = loadConfig(repoRoot);
  const db = openPatroniteDb({ repoRoot, dbPath });

  try {
    // Wyczyść poprzednie rekordy symulacji dla powtarzalnego testu deterministycznego 6 cykli
    db.db.exec('DELETE FROM evidence_registry; DELETE FROM published_archive; DELETE FROM jobs;');

    const snapshot = collectAuthorizedSources(repoRoot, { saveSnapshot: true });
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
      });
      results.push(res);
    }

    const week1 = buildWeeklyThreeCycleSummary({ repoRoot, cycles: results.slice(0, 3), weekLabel: 'Tydzien-1' });
    const week2 = buildWeeklyThreeCycleSummary({ repoRoot, cycles: results.slice(3, 6), weekLabel: 'Tydzien-2' });
    writeOpenBotProposal({ repoRoot, config });
    db.exportRegistrySnapshot(path.join(repoRoot, 'patronite', 'state', 'registry-export.json'));

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
        productionApprovedByOwner: db.getFlag('production_approved') === '1',
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
    }

    return { results, week1, week2 };
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
    console.log(`✅ Symulacja 2 tygodni (6 cykli) zakończona:`);
    for (const r of out.results) {
      console.log(`  - ${r.jobId} | ${r.scheduledForWarsaw} | ${r.seriesLabel} | status=${r.status} | QA=${r.qaResult.passedCount}/${r.qaResult.totalCount} | ${r.title}`);
    }
    return;
  }

  const db = openPatroniteDb({ repoRoot });
  try {
    if (cmd === 'pause') {
      db.setFlag('kill_switch', '1', 'operator_cli');
      console.log('🛑 Wyłącznik awaryjny (kill_switch=1) AKTYWNY. Publikacje wstrzymane.');
    } else if (cmd === 'resume') {
      db.setFlag('kill_switch', '0', 'operator_cli');
      console.log('▶️ Wyłącznik awaryjny wyłączony (kill_switch=0). Tryb testowy gotowy.');
    } else if (cmd === 'status') {
      const jobs = db.listJobs(20);
      console.log(JSON.stringify({
        directive: config.directive,
        mode: config.mode,
        killSwitch: db.getFlag('kill_switch') === '1',
        productionApproved: db.getFlag('production_approved') === '1',
        storedJobsCount: jobs.length,
        lastJobs: jobs.map(j => ({ jobId: j.job_id, scheduled: j.scheduled_for, qa: j.qa_status, status: j.publish_status })),
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
