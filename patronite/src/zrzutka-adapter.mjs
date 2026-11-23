import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

export const ZRZUTKA_ALLOWED_ACTIONS = new Set([
  'create_update_draft',
  'update_draft',
  'publish_update',
  'read_update',
]);

export const ZRZUTKA_FORBIDDEN_ACTIONS = new Set([
  'read_donor_pii',
  'withdraw_funds',
  'modify_goal',
  'modify_payout_bank',
  'modify_account_settings',
]);

export function assertZrzutkaPermittedAction(action) {
  if (ZRZUTKA_FORBIDDEN_ACTIONS.has(action) || !ZRZUTKA_ALLOWED_ACTIONS.has(action)) {
    const err = new Error(`Niedozwolona operacja Zrzutka.pl ze względu na minimalne uprawnienia: ${action}`);
    err.code = 'PERMISSION_DENIED';
    throw err;
  }
}

export function toZrzutkaJobId(patroniteJobId) {
  return String(patroniteJobId || '').replace(/^PAT-/, 'ZRZ-');
}

function adaptPlatformCopy(text) {
  return String(text || '')
    .replace(/\bDrodzy Patroni i Przyjaciele\b/g, 'Drodzy Darczyńcy i Przyjaciele')
    .replace(/\bDrodzy Patroni\b/g, 'Drodzy Darczyńcy')
    .replace(/\bkochani Patroni\b/g, 'kochani Darczyńcy')
    .replace(/\bdla naszych Patronów\b/g, 'dla naszych Darczyńców')
    .replace(/\bdla Patronów\b/g, 'dla Darczyńców')
    .replace(/\bnowych Patronów\b/g, 'nowych Darczyńców')
    .replace(/\bwsparcie Patronów\b/g, 'wsparcie Darczyńców')
    .replace(/\bWasza obecność na Patronite\b/g, 'Wasza obecność na Zrzutka.pl')
    .replace(/\bRegularne wsparcie na Patronite\b/g, 'Regularne wsparcie na Zrzutka.pl')
    .replace(/\bWaszemu wsparciu na Patronite\b/g, 'Waszemu wsparciu na Zrzutka.pl')
    .replace(/\bna Patronite\b/g, 'na Zrzutka.pl')
    .replace(/\bi Patronite\b/g, 'i Zrzutka.pl (rs4g4v)')
    .replace(/\bPatronite\b/g, 'Zrzutka.pl');
}

/**
 * Adaptuje zweryfikowany pakiet Patronite 1:1 na aktualizację zrzutki https://zrzutka.pl/rs4g4v.
 * Zachowuje 100% tych samych zweryfikowanych faktów, cytatów UBG-2025, linków i harmonogramu.
 */
export function adaptDraftForZrzutka(patroniteDraft, config = {}) {
  const zCfg = config.zrzutka || {};
  const fundraiserUrl = zCfg.fundraiserUrl || 'https://zrzutka.pl/rs4g4v';
  const fundraiserCode = zCfg.fundraiserCode || 'rs4g4v';
  const zrzutkaJobId = toZrzutkaJobId(patroniteDraft.jobId);

  const title = adaptPlatformCopy(patroniteDraft.title);
  const teaser = adaptPlatformCopy(patroniteDraft.teaser);
  const body = adaptPlatformCopy(patroniteDraft.body);
  const question = adaptPlatformCopy(patroniteDraft.question);
  const cta = adaptPlatformCopy(patroniteDraft.cta);
  const altText = adaptPlatformCopy(patroniteDraft.altText);

  const hashtags = (patroniteDraft.hashtags || []).map(tag => (
    tag.toLowerCase() === '#patronite' ? '#Zrzutka' : tag
  ));

  const zrzutkaPlainText = [
    title,
    '',
    teaser,
    '',
    body,
    '',
    `💬 ${question}`,
    '',
    `👉 ${cta}`,
    `💛 Zrzutka misyjna Christian Culture: ${fundraiserUrl}`,
    `🌍 Wszystko, co tworzymy dzięki Wam: https://polskieradio.cc/mapa`,
    '',
    hashtags.join(' '),
  ].join('\n');

  return {
    ...patroniteDraft,
    channel: 'zrzutka',
    jobId: zrzutkaJobId,
    sourcePatroniteJobId: patroniteDraft.jobId,
    fundraiserUrl,
    fundraiserCode,
    fundraiserOrganizer: zCfg.fundraiserOrganizer || 'Wioletta Rogowska (Christian Culture)',
    title,
    teaser,
    body,
    question,
    cta,
    hashtags,
    altText,
    zrzutkaPlainText,
    charCounts: {
      title: title.length,
      teaser: teaser.length,
      body: body.length,
    },
  };
}

export class ZrzutkaDraftPackagePublisher {
  constructor({ repoRoot = DEFAULT_REPO_ROOT, draftsDir } = {}) {
    this.repoRoot = repoRoot;
    this.draftsDir = draftsDir || path.join(repoRoot, 'patronite', 'zrzutka', 'drafts');
  }

  async publish({ draft, graphicPath, squareGraphicPath, action = 'create_update_draft' }) {
    assertZrzutkaPermittedAction(action);
    const dir = path.join(this.draftsDir, draft.jobId);
    fs.mkdirSync(dir, { recursive: true });

    const outGraphic = path.join(dir, 'graphic-1068x630.png');
    const outSquare = path.join(dir, 'promo-1080x1080.png');
    if (graphicPath && fs.existsSync(graphicPath)) fs.copyFileSync(graphicPath, outGraphic);
    if (squareGraphicPath && fs.existsSync(squareGraphicPath)) fs.copyFileSync(squareGraphicPath, outSquare);

    const postPayload = {
      channel: 'zrzutka',
      jobId: draft.jobId,
      sourcePatroniteJobId: draft.sourcePatroniteJobId,
      fundraiserUrl: draft.fundraiserUrl,
      fundraiserCode: draft.fundraiserCode,
      fundraiserOrganizer: draft.fundraiserOrganizer,
      seriesType: draft.seriesType,
      seriesLabel: draft.seriesLabel,
      scheduledForWarsaw: draft.scheduledForWarsaw,
      visibility: draft.visibility || 'PUBLICZNY',
      title: draft.title,
      teaser: draft.teaser,
      body: draft.body,
      question: draft.question,
      cta: draft.cta,
      hashtags: draft.hashtags,
      altText: draft.altText,
      sources: draft.sources,
      honestAdapterNote: 'Serwis zrzutka.pl jest chroniony przez Cloudflare i nie udostępnia otwartego publicznego REST API zapisu aktualizacji — pakiet zapisany uczciwie jako kompletny szkic gotowy do 1-kliknięciowego wklejenia na https://zrzutka.pl/rs4g4v.',
      savedAt: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(dir, 'post.json'), JSON.stringify(postPayload, null, 2), 'utf8');
    fs.writeFileSync(path.join(dir, 'update-zrzutka.txt'), draft.zrzutkaPlainText, 'utf8');

    const md = [
      `# ${draft.title}`,
      '',
      `**Kanał:** Zrzutka.pl (${draft.fundraiserUrl})`,
      `**Zsynchronizowano z cyklem Patronite:** \`${draft.sourcePatroniteJobId}\``,
      `**Seria:** ${draft.seriesLabel} (${draft.seriesType})`,
      `**Planowany termin (Europe/Warsaw):** ${draft.scheduledForWarsaw}`,
      `**Identyfikator aktualizacji:** \`${draft.jobId}\``,
      '',
      `## Zajawka`,
      draft.teaser,
      '',
      `## Treść aktualizacji (dla darczyńców Zrzutka.pl)`,
      draft.body,
      '',
      `## Pytanie do darczyńców`,
      draft.question,
      '',
      `## Wezwanie do działania (CTA)`,
      draft.cta,
      '',
      `## Hashtagi`,
      draft.hashtags.join(' '),
      '',
      `## Tekst alternatywny grafiki (1068×630)`,
      draft.altText,
      '',
      `## Rejestr źródeł`,
      ...(draft.sources || []).map(s => `- [${s.status}] ${s.sourceName} (${s.sourceRef}, data: ${s.verifiedDate}) — ${s.publicUrl}`),
    ].join('\n');
    fs.writeFileSync(path.join(dir, 'post.md'), md, 'utf8');

    return {
      ok: true,
      status: 'SZKIC',
      jobId: draft.jobId,
      remoteUpdateId: draft.jobId,
      localDraftPath: dir,
      url: null,
    };
  }
}

/**
 * Adapter pod oficjalne API Zrzutka.pl (po ewentualnym przyznaniu tokenu przez kontakt@zrzutka.pl)
 * lub lokalny serwer testowy HTTP mock. Obsługuje idempotencję, odczyt wsteczny i kody 401/503/500.
 */
export class ZrzutkaOfficialApiAdapter {
  constructor({ baseUrl, fundraiserCode = 'rs4g4v', tokenProvider, fetchImpl = globalThis.fetch } = {}) {
    this.baseUrl = String(baseUrl || '').replace(/\/+$/, '');
    this.fundraiserCode = fundraiserCode;
    this.tokenProvider = tokenProvider || (() => process.env.ZRZUTKA_API_TOKEN || '');
    this.fetchImpl = fetchImpl;
  }

  async _request(method, endpoint, payload, action) {
    assertZrzutkaPermittedAction(action);
    if (!this.baseUrl) {
      const err = new Error('Brak skonfigurowanego oficjalnego punktu końcowego API Zrzutka.pl.');
      err.code = 'API_UNAVAILABLE';
      throw err;
    }
    const token = typeof this.tokenProvider === 'function' ? this.tokenProvider() : '';
    if (!token) {
      const err = new Error('Brak aktywnego tokenu API Zrzutka.pl.');
      err.code = 'SESSION_EXPIRED';
      throw err;
    }

    let res;
    try {
      res = await this.fetchImpl(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });
    } catch (netErr) {
      const err = new Error(`Błąd sieci API Zrzutka.pl: ${netErr.message}`);
      err.code = 'API_UNAVAILABLE';
      throw err;
    }

    if (res.status === 401 || res.status === 403) {
      const err = new Error(`Sesja Zrzutka.pl wygasła lub brak uprawnień (${res.status}).`);
      err.code = res.status === 401 ? 'SESSION_EXPIRED' : 'PERMISSION_DENIED';
      throw err;
    }
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      const err = new Error(`Serwis Zrzutka.pl API tymczasowo niedostępny (${res.status}).`);
      err.code = 'API_UNAVAILABLE';
      throw err;
    }
    if (!res.ok) {
      const err = new Error(`Nieudana operacja API Zrzutka.pl (${res.status}).`);
      err.code = 'PUBLISH_FAILED';
      throw err;
    }
    return res.json();
  }

  async readUpdate({ jobId, remoteUpdateId }) {
    const query = remoteUpdateId
      ? `/fundraisers/${encodeURIComponent(this.fundraiserCode)}/updates/${encodeURIComponent(remoteUpdateId)}`
      : `/fundraisers/${encodeURIComponent(this.fundraiserCode)}/updates/by-job/${encodeURIComponent(jobId)}`;
    try {
      return await this._request('GET', query, null, 'read_update');
    } catch (err) {
      if (err.code === 'PUBLISH_FAILED') return { found: false };
      throw err;
    }
  }

  async createUpdateDraft({ draft }) {
    return this._request('POST', `/fundraisers/${encodeURIComponent(this.fundraiserCode)}/updates/drafts`, {
      jobId: draft.jobId,
      title: draft.title,
      body: draft.zrzutkaPlainText || draft.body,
      altText: draft.altText,
    }, 'create_update_draft');
  }

  async updateDraft({ remoteUpdateId, patch }) {
    return this._request('PATCH', `/fundraisers/${encodeURIComponent(this.fundraiserCode)}/updates/drafts/${encodeURIComponent(remoteUpdateId)}`, patch, 'update_draft');
  }

  async publishUpdate({ draft }) {
    const existing = await this.readUpdate({ jobId: draft.jobId });
    if (existing?.found) {
      return {
        ok: true,
        recoveredFromPartialSuccess: true,
        status: existing.status || 'OPUBLIKOWANO',
        jobId: draft.jobId,
        remoteUpdateId: existing.remoteUpdateId,
        url: existing.url,
      };
    }

    const res = await this._request('POST', `/fundraisers/${encodeURIComponent(this.fundraiserCode)}/updates`, {
      jobId: draft.jobId,
      title: draft.title,
      body: draft.zrzutkaPlainText || draft.body,
      altText: draft.altText,
    }, 'publish_update');

    return {
      ok: true,
      recoveredFromPartialSuccess: false,
      status: res.status || 'OPUBLIKOWANO',
      jobId: draft.jobId,
      remoteUpdateId: res.remoteUpdateId || res.id,
      url: res.url,
    };
  }
}

/**
 * Adapter przeglądarkowy Zrzutka.pl — twardo wyłączony (zero obchodzenia Cloudflare/CAPTCHA i zero przechowywania haseł).
 */
export class ZrzutkaBrowserDraftAdapter {
  constructor() {
    this.enabled = false;
  }

  async publish() {
    const err = new Error('Adapter przeglądarkowy Zrzutka.pl jest wyłączony (zakaz obchodzenia Cloudflare/CAPTCHA i przechowywania haseł).');
    err.code = 'ADAPTER_DISABLED';
    throw err;
  }
}

export async function verifyZrzutkaPublicationResult({ adapter, draft, publishResponse }) {
  if (!publishResponse) {
    return { verified: false, code: 'EMPTY_RESPONSE', status: 'BŁĄD' };
  }
  if (publishResponse.status === 'SZKIC') {
    return {
      verified: true,
      code: 'ZRZUTKA_DRAFT_PACKAGE_VERIFIED',
      status: 'SZKIC',
      url: publishResponse.localDraftPath,
      remoteUpdateId: publishResponse.jobId,
      verifiedAt: new Date().toISOString(),
    };
  }
  if (!adapter || typeof adapter.readUpdate !== 'function') {
    return { verified: false, code: 'VERIFIER_ADAPTER_MISSING', status: 'BŁĄD' };
  }

  try {
    const readRes = await adapter.readUpdate({
      jobId: draft.jobId,
      remoteUpdateId: publishResponse.remoteUpdateId || null,
    });
    if (!readRes || !readRes.found) {
      return {
        verified: false,
        code: 'UPDATE_NOT_FOUND_AFTER_PUBLISH',
        status: 'BŁĄD',
      };
    }
    const titleMatch = !readRes.title || readRes.title.trim() === draft.title.trim();
    return {
      verified: titleMatch,
      code: titleMatch ? 'VERIFIED_ON_ZRZUTKA' : 'TITLE_MISMATCH',
      status: readRes.status || 'OPUBLIKOWANO',
      url: readRes.url,
      remoteUpdateId: readRes.remoteUpdateId,
      verifiedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      verified: false,
      code: err.code || 'VERIFICATION_FAILED',
      status: 'BŁĄD',
      message: err.message,
    };
  }
}

export async function executeZrzutkaPublishWithGuards({
  draft,
  graphicMeta,
  squareMeta,
  qaResult,
  config,
  db,
  adapter = null,
  livePublishRequested = false,
}) {
  if (!qaResult || qaResult.overallStatus !== 'PASS') {
    const code = 'QA_BLOCKED';
    db?.logAudit({ actor: 'zrzutka_publisher', action: 'publish_guard', jobId: draft.jobId, status: 'WSTRZYMANO', details: { code, failed: qaResult?.failedChecks } });
    return { status: 'WSTRZYMANO', code, verified: false, url: null };
  }

  const killActive = (db && db.getFlag('kill_switch') === '1') || Boolean(config.killSwitch);
  if (killActive) {
    db?.logAudit({ actor: 'zrzutka_publisher', action: 'kill_switch_guard', jobId: draft.jobId, status: 'WSTRZYMANO', details: { code: 'KILL_SWITCH_ACTIVE' } });
    return { status: 'WSTRZYMANO', code: 'KILL_SWITCH_ACTIVE', verified: false, url: null };
  }

  const prodApproved = db ? db.getFlag('production_approved') === '1' : Boolean(config.productionApprovedByOwner);
  if (livePublishRequested && !prodApproved) {
    db?.logAudit({ actor: 'zrzutka_publisher', action: 'owner_approval_guard', jobId: draft.jobId, status: 'WSTRZYMANO', details: { code: 'BLOCKED_AWAITING_OWNER_APPROVAL' } });
    return { status: 'WSTRZYMANO', code: 'BLOCKED_AWAITING_OWNER_APPROVAL', verified: false, url: null };
  }

  const activeAdapter = adapter || new ZrzutkaDraftPackagePublisher({ repoRoot: config._repoRoot || DEFAULT_REPO_ROOT });
  const isDraftMode = activeAdapter instanceof ZrzutkaDraftPackagePublisher;

  try {
    const pubRes = isDraftMode
      ? await activeAdapter.publish({ draft, graphicPath: graphicMeta.outputPath, squareGraphicPath: squareMeta?.outputPath })
      : await activeAdapter.publishUpdate({ draft });

    const verifyRes = await verifyZrzutkaPublicationResult({ adapter: activeAdapter, draft, publishResponse: pubRes });
    if (!verifyRes.verified) {
      db?.logAudit({ actor: 'zrzutka_verifier', action: 'verify_update', jobId: draft.jobId, status: 'BŁĄD', details: { code: verifyRes.code } });
      return { status: 'BŁĄD', code: verifyRes.code, verified: false, url: null, remoteUpdateId: pubRes.remoteUpdateId || null };
    }

    db?.logAudit({
      actor: 'zrzutka_publisher',
      action: isDraftMode ? 'save_zrzutka_draft_package' : 'publish_and_verify_zrzutka',
      jobId: draft.jobId,
      status: verifyRes.status,
      details: {
        fundraiserUrl: draft.fundraiserUrl,
        sourcePatroniteJobId: draft.sourcePatroniteJobId,
        url: verifyRes.url,
        remoteUpdateId: verifyRes.remoteUpdateId,
        recovered: Boolean(pubRes.recoveredFromPartialSuccess),
      },
    });

    return {
      status: verifyRes.status,
      code: verifyRes.code,
      verified: true,
      url: verifyRes.url,
      remoteUpdateId: verifyRes.remoteUpdateId,
      verifiedAt: verifyRes.verifiedAt,
      recoveredFromPartialSuccess: Boolean(pubRes.recoveredFromPartialSuccess),
    };
  } catch (err) {
    const errCode = err.code || 'PUBLISH_FAILED';
    db?.logAudit({ actor: 'zrzutka_publisher', action: 'publish_error', jobId: draft.jobId, status: 'BŁĄD', details: { code: errCode, message: err.message } });
    return { status: 'BŁĄD', code: errCode, verified: false, url: null, errorMessage: err.message };
  }
}

export function writeZrzutkaCycleReport({ repoRoot = DEFAULT_REPO_ROOT, reportsDir: customReportsDir = null, zrzutkaResult }) {
  const reportsDir = customReportsDir || path.join(repoRoot, 'patronite', 'zrzutka', 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const filePath = path.join(reportsDir, `${zrzutkaResult.jobId}.md`);
  const lines = [
    `# Raport aktualizacji Zrzutka.pl (${zrzutkaResult.fundraiserCode}): ${zrzutkaResult.jobId}`,
    '',
    `- **Zrzutka docelowa:** ${zrzutkaResult.fundraiserUrl}`,
    `- **Zsynchronizowano z cyklem Patronite:** \`${zrzutkaResult.sourcePatroniteJobId}\``,
    `- **Data planowana (Europe/Warsaw):** ${zrzutkaResult.scheduledForWarsaw}`,
    `- **Typ publikacji:** ${zrzutkaResult.seriesLabel} (\`${zrzutkaResult.seriesType}\`)`,
    `- **Temat:** ${zrzutkaResult.title}`,
    `- **Status:** ${zrzutkaResult.status}`,
    `- **Pakiet gotowy do wklejenia:** ${zrzutkaResult.url || zrzutkaResult.draftDir || 'brak'}`,
    `- **Plik 1-Click do wklejenia:** \`update-zrzutka.txt\``,
    `- **Grafika 1068×630 (Zrzutka.pl):** \`graphic-1068x630.png\``,
    `- **Wariant 1080×1080 (1:1):** \`promo-1080x1080.png\``,
    `- **Wyniki kontroli Quality Guardian:** ${zrzutkaResult.qaResult.passedCount}/${zrzutkaResult.qaResult.totalCount} (${zrzutkaResult.qaResult.overallStatus})`,
    ...(zrzutkaResult.blockReason ? [`- **Przyczyna blokady / uwaga:** ${zrzutkaResult.blockReason}`] : []),
    '',
  ];
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  return filePath;
}
