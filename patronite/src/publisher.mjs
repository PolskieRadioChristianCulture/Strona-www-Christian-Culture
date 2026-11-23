import fs from 'node:fs';
import path from 'node:path';
import { verifyPublicationResult } from './verifier.mjs';

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

export const ALLOWED_ACTIONS = new Set([
  'create_draft',
  'update_draft',
  'schedule_post',
  'publish_post',
  'read_post',
]);

export const FORBIDDEN_ACTIONS = new Set([
  'read_patron_finances',
  'send_private_message',
  'modify_tiers',
  'modify_account_settings',
]);

export function assertPermittedAction(action) {
  if (FORBIDDEN_ACTIONS.has(action) || !ALLOWED_ACTIONS.has(action)) {
    const err = new Error(`Niedozwolona operacja ze względu na minimalne uprawnienia: ${action}`);
    err.code = 'PERMISSION_DENIED';
    throw err;
  }
}

export class DraftPackagePublisher {
  constructor({ repoRoot = DEFAULT_REPO_ROOT, draftsDir } = {}) {
    this.repoRoot = repoRoot;
    this.draftsDir = draftsDir || path.join(repoRoot, 'patronite', 'drafts');
  }

  async publish({ draft, graphicPath, squareGraphicPath, action = 'create_draft' }) {
    assertPermittedAction(action);
    const dir = path.join(this.draftsDir, draft.jobId);
    fs.mkdirSync(dir, { recursive: true });

    const outGraphic = path.join(dir, 'graphic-1068x630.png');
    const outSquare = path.join(dir, 'promo-1080x1080.png');
    if (graphicPath && fs.existsSync(graphicPath)) fs.copyFileSync(graphicPath, outGraphic);
    if (squareGraphicPath && fs.existsSync(squareGraphicPath)) fs.copyFileSync(squareGraphicPath, outSquare);

    const postPayload = {
      jobId: draft.jobId,
      topicKey: draft.topicKey || null,
      seriesType: draft.seriesType,
      seriesLabel: draft.seriesLabel,
      scheduledForWarsaw: draft.scheduledForWarsaw,
      visibility: draft.visibility,
      notifyPatronsEmail: draft.notifyPatronsEmail,
      title: draft.title,
      teaser: draft.teaser,
      body: draft.body,
      question: draft.question,
      cta: draft.cta,
      hashtags: draft.hashtags,
      altText: draft.altText,
      scripture: draft.scripture || null,
      graphicSpec: draft.graphicSpec || null,
      sources: draft.sources,
      honestAdapterNote: 'Brak publicznego API zapisu postow Patronite — pakiet zapisany jako kompletny szkic gotowy do recznego wklejenia/zaplanowania w oficjalnym panelu Moderatora.',
      savedAt: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(dir, 'post.json'), JSON.stringify(postPayload, null, 2), 'utf8');

    const md = [
      `# ${draft.title}`,
      '',
      `**Seria:** ${draft.seriesLabel} (${draft.seriesType})`,
      `**Planowany termin (Europe/Warsaw):** ${draft.scheduledForWarsaw}`,
      `**Widoczność:** ${draft.visibility}`,
      `**Identyfikator zadania:** \`${draft.jobId}\``,
      '',
      `## Zajawka`,
      draft.teaser,
      '',
      `## Treść główna`,
      draft.body,
      '',
      `## Pytanie angażujące`,
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
      ...draft.sources.map(s => `- [${s.status}] ${s.sourceName} (${s.sourceRef}, data: ${s.verifiedDate}) — ${s.publicUrl}`),
    ].join('\n');
    fs.writeFileSync(path.join(dir, 'post.md'), md, 'utf8');

    return {
      ok: true,
      status: 'SZKIC',
      jobId: draft.jobId,
      remotePostId: draft.jobId,
      localDraftPath: dir,
      url: null,
    };
  }
}

/**
 * Adapter pod oficjalne zamknięte API Patronite (kontakt@patronite.pl) lub lokalny serwer testowy.
 * Obsługuje test utworzenia szkicu, edycję, zaplanowanie, publikację, odczyt stanu i idempotentny retry.
 */
export class PatroniteOfficialApiAdapter {
  constructor({ baseUrl, tokenProvider, fetchImpl = globalThis.fetch } = {}) {
    this.baseUrl = String(baseUrl || '').replace(/\/+$/, '');
    this.tokenProvider = tokenProvider || (() => process.env.PATRONITE_API_TOKEN || '');
    this.fetchImpl = fetchImpl;
  }

  async _request(method, endpoint, payload, action) {
    assertPermittedAction(action);
    if (!this.baseUrl) {
      const err = new Error('Brak skonfigurowanego oficjalnego punktu końcowego API Patronite.');
      err.code = 'API_UNAVAILABLE';
      throw err;
    }
    const token = typeof this.tokenProvider === 'function' ? this.tokenProvider() : '';
    if (!token) {
      const err = new Error('Brak aktywnego tokenu sesji / API Patronite.');
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
      const err = new Error(`Błąd sieci API: ${netErr.message}`);
      err.code = 'API_UNAVAILABLE';
      throw err;
    }

    if (res.status === 401 || res.status === 403) {
      const err = new Error(`Sesja wygasła lub brak uprawnień (${res.status}).`);
      err.code = res.status === 401 ? 'SESSION_EXPIRED' : 'PERMISSION_DENIED';
      throw err;
    }
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      const err = new Error(`Serwis Patronite API tymczasowo niedostępny (${res.status}).`);
      err.code = 'API_UNAVAILABLE';
      throw err;
    }
    if (!res.ok) {
      const err = new Error(`Nieudana operacja API Patronite (${res.status}).`);
      err.code = 'PUBLISH_FAILED';
      throw err;
    }
    return res.json();
  }

  async readPost({ jobId, remotePostId }) {
    const query = remotePostId
      ? `/posts/${encodeURIComponent(remotePostId)}`
      : `/posts/by-job/${encodeURIComponent(jobId)}`;
    try {
      return await this._request('GET', query, null, 'read_post');
    } catch (err) {
      if (err.code === 'PUBLISH_FAILED') {
        return { found: false };
      }
      throw err;
    }
  }

  async createDraft({ draft }) {
    return this._request('POST', '/posts/drafts', {
      jobId: draft.jobId,
      title: draft.title,
      teaser: draft.teaser,
      body: draft.body,
      visibility: draft.visibility,
      altText: draft.altText,
    }, 'create_draft');
  }

  async updateDraft({ remotePostId, patch }) {
    return this._request('PATCH', `/posts/drafts/${encodeURIComponent(remotePostId)}`, patch, 'update_draft');
  }

  async schedulePost({ remotePostId, scheduledForWarsaw }) {
    return this._request('POST', `/posts/${encodeURIComponent(remotePostId)}/schedule`, {
      scheduledFor: scheduledForWarsaw,
    }, 'schedule_post');
  }

  async publishPost({ draft }) {
    // Krok idempotencji: sprawdzamy najpierw czy dla tego jobId istnieje już wpis na koncie!
    const existing = await this.readPost({ jobId: draft.jobId });
    if (existing?.found) {
      return {
        ok: true,
        recoveredFromPartialSuccess: true,
        status: existing.status || 'OPUBLIKOWANO',
        jobId: draft.jobId,
        remotePostId: existing.remotePostId,
        url: existing.url,
      };
    }

    const res = await this._request('POST', '/posts', {
      jobId: draft.jobId,
      title: draft.title,
      teaser: draft.teaser,
      body: draft.body,
      visibility: draft.visibility,
      altText: draft.altText,
    }, 'publish_post');

    return {
      ok: true,
      recoveredFromPartialSuccess: false,
      status: res.status || 'OPUBLIKOWANO',
      jobId: draft.jobId,
      remotePostId: res.remotePostId || res.id,
      url: res.url,
    };
  }
}

/**
 * Adapter przeglądarkowy dla roli Moderatora (wyłączony domyślnie do czasu zgody L0 i testu sesji).
 * Zero przechowywanych haseł, zero omijania 2FA/CAPTCHA.
 */
export class PatroniteBrowserDraftAdapter {
  constructor() {
    this.enabled = false;
  }
  async publish() {
    const err = new Error('Adapter przeglądarkowy Patronite jest wyłączony (wymaga jawnej zgody L0 i roli Moderatora).');
    err.code = 'ADAPTER_DISABLED';
    throw err;
  }
}

export async function executePublishWithGuards({
  draft,
  graphicMeta,
  squareMeta,
  qaResult,
  config,
  db,
  adapter = null,
  livePublishRequested = false,
}) {
  // 1. Twarda blokada QA (sekcja 11)
  if (!qaResult || qaResult.overallStatus !== 'PASS') {
    const code = 'QA_BLOCKED';
    db?.logAudit({ actor: 'publisher', action: 'publish_guard', jobId: draft.jobId, status: 'WSTRZYMANO', details: { code, failed: qaResult?.failedChecks } });
    return { status: 'WSTRZYMANO', code, verified: false, url: null };
  }

  // 2. Kill switch
  const killActive = (db && db.getFlag('kill_switch') === '1') || Boolean(config.killSwitch);
  if (killActive) {
    db?.logAudit({ actor: 'publisher', action: 'kill_switch_guard', jobId: draft.jobId, status: 'WSTRZYMANO', details: { code: 'KILL_SWITCH_ACTIVE' } });
    return { status: 'WSTRZYMANO', code: 'KILL_SWITCH_ACTIVE', verified: false, url: null };
  }

  // 3. Zakaz publikacji produkcyjnej przed jawna akceptacja L0 (sekcja 16)
  const prodApproved = db ? db.getFlag('production_approved') === '1' : Boolean(config.productionApprovedByOwner);
  if (livePublishRequested && !prodApproved) {
    db?.logAudit({ actor: 'publisher', action: 'owner_approval_guard', jobId: draft.jobId, status: 'WSTRZYMANO', details: { code: 'BLOCKED_AWAITING_OWNER_APPROVAL' } });
    return { status: 'WSTRZYMANO', code: 'BLOCKED_AWAITING_OWNER_APPROVAL', verified: false, url: null };
  }

  // 4. Wybór bezpiecznego adaptera (domyślnie uczciwy DraftPackagePublisher, jeśli brak oficjalnego API)
  const activeAdapter = adapter || new DraftPackagePublisher({ repoRoot: config._repoRoot || DEFAULT_REPO_ROOT });
  const isDraftMode = activeAdapter instanceof DraftPackagePublisher;

  try {
    const pubRes = isDraftMode
      ? await activeAdapter.publish({ draft, graphicPath: graphicMeta.outputPath, squareGraphicPath: squareMeta?.outputPath })
      : await activeAdapter.publishPost({ draft });

    const verifyRes = await verifyPublicationResult({ adapter: activeAdapter, draft, publishResponse: pubRes });
    if (!verifyRes.verified) {
      db?.logAudit({ actor: 'verifier', action: 'verify_post', jobId: draft.jobId, status: 'BŁĄD', details: { code: verifyRes.code } });
      return { status: 'BŁĄD', code: verifyRes.code, verified: false, url: null, remotePostId: pubRes.remotePostId || null };
    }

    db?.logAudit({
      actor: 'publisher',
      action: isDraftMode ? 'save_draft_package' : 'publish_and_verify',
      jobId: draft.jobId,
      status: verifyRes.status,
      details: { url: verifyRes.url, remotePostId: verifyRes.remotePostId, recovered: Boolean(pubRes.recoveredFromPartialSuccess) },
    });

    return {
      status: verifyRes.status,
      code: verifyRes.code,
      verified: true,
      url: verifyRes.url,
      remotePostId: verifyRes.remotePostId,
      verifiedAt: verifyRes.verifiedAt,
      recoveredFromPartialSuccess: Boolean(pubRes.recoveredFromPartialSuccess),
    };
  } catch (err) {
    const errCode = err.code || 'PUBLISH_FAILED';
    db?.logAudit({ actor: 'publisher', action: 'publish_error', jobId: draft.jobId, status: 'BŁĄD', details: { code: errCode, message: err.message } });
    return { status: 'BŁĄD', code: errCode, verified: false, url: null, errorMessage: err.message };
  }
}
