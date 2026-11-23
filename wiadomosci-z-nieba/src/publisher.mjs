import fs from 'node:fs';
import path from 'node:path';
import { loadWznConfig } from './db.mjs';

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

export const ALLOWED_ACTIONS = new Set([
  'publish_public_editorial_post',
  'verify_published_post',
  'record_daily_analytics',
]);

export const FORBIDDEN_ACTIONS = new Set([
  'send_private_message',
  'broadcast_dm',
  'send_unsolicited_push',
  'modify_account_settings',
  'modify_user_profile',
]);

export function assertPermittedAction(action) {
  if (FORBIDDEN_ACTIONS.has(action) || !ALLOWED_ACTIONS.has(action)) {
    const err = new Error(`Niedozwolona operacja ze względu na bezpieczeństwo użytkowników i minimalne uprawnienia: ${action}`);
    err.code = 'PERMISSION_DENIED';
    throw err;
  }
}

export function assertPublisherAccountSecurity({
  mode = 'TEST_SIMULATION',
  config = null,
  db = null,
  actorContext = { authenticated: true, role: 'test_operator', provider: 'local' },
  repoRoot = DEFAULT_REPO_ROOT,
} = {}) {
  const cfg = config || loadWznConfig(repoRoot);

  if (cfg.profile?.slug !== 'wiadomosci_z_nieba') {
    const err = new Error('Nieprawidłowy identyfikator konta publikacyjnego.');
    err.code = 'INVALID_PUBLISHER_ACCOUNT';
    throw err;
  }

  if (cfg.privateMessagesAllowed !== false) {
    const err = new Error('Konto redakcyjne nie może mieć włączonego wysyłania automatycznych wiadomości prywatnych.');
    err.code = 'PRIVATE_MESSAGES_FORBIDDEN';
    throw err;
  }

  if (!actorContext || actorContext.authenticated !== true || actorContext.provider === 'anonymous' || actorContext.role === 'guest') {
    const err = new Error('Publikacja wymaga uwierzytelnionego operatora lub uprawnień serwera (brak dostępu anonimowego).');
    err.code = 'PUBLISHER_AUTH_REQUIRED';
    throw err;
  }

  if (db && db.getFlag('kill_switch') === '1') {
    const err = new Error('Publikacja wstrzymana przez wyłącznik awaryjny (kill_switch).');
    err.code = 'KILL_SWITCH_ACTIVE';
    throw err;
  }

  if (mode === 'PRODUCTION_LIVE') {
    const approvedInCfg = cfg.productionApprovedByOwner === true;
    const approvedInDb = db ? db.getFlag('production_approved_by_owner') === '1' : false;
    if (!approvedInCfg || !approvedInDb) {
      const err = new Error('Brak wymaganej akceptacji właściciela (L0) dla publikacji produkcyjnej.');
      err.code = 'PRODUCTION_APPROVAL_REQUIRED';
      throw err;
    }

    const autoCfg = cfg.autoPublishEnabled === true;
    const autoDb = db ? db.getFlag('auto_publish_enabled') === '1' : false;
    if (!autoCfg || !autoDb) {
      const err = new Error('Automatyczna publikacja produkcyjna jest wyłączona w konfiguracji.');
      err.code = 'AUTO_PUBLISH_DISABLED';
      throw err;
    }

    if (actorContext.role !== 'server_admin') {
      const err = new Error('Publikacja na żywo w LUMINA wymaga roli server_admin.');
      err.code = 'PUBLISHER_AUTH_REQUIRED';
      throw err;
    }
  }

  return true;
}

export class TestSimulationPublisher {
  constructor({ repoRoot = DEFAULT_REPO_ROOT, draftsDir } = {}) {
    this.repoRoot = repoRoot;
    this.draftsDir = draftsDir || path.join(repoRoot, 'wiadomosci-z-nieba', 'drafts');
  }

  async verifyPost(idempotencyKey, payload) {
    assertPermittedAction('verify_published_post');
    const dir = path.join(this.draftsDir, payload.runDate);
    const jsonPath = path.join(dir, 'post.json');
    if (!fs.existsSync(jsonPath)) {
      return { found: false };
    }
    try {
      const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      if (parsed.idempotencyKey === idempotencyKey) {
        return { found: true, postId: parsed.id, status: parsed.status, data: parsed };
      }
      return { found: false };
    } catch {
      return { found: false };
    }
  }

  async publish(payload) {
    assertPermittedAction('publish_public_editorial_post');
    const dir = path.join(this.draftsDir, payload.runDate);
    fs.mkdirSync(dir, { recursive: true });

    const savedAt = new Date().toISOString();
    const record = {
      ...payload,
      status: 'DRAFT_TEST',
      savedAt,
    };
    fs.writeFileSync(path.join(dir, 'post.json'), JSON.stringify(record, null, 2), 'utf8');

    const md = [
      `# ${payload.authorDisplayTitle} — ${payload.runDate}`,
      '',
      `- **Identyfikator:** \`${payload.id}\``,
      `- **Klucz idempotentności:** \`${payload.idempotencyKey}\``,
      `- **Temat:** ${payload.themeLabel}`,
      `- **Werset:** ${payload.verseReference} (${payload.verseTranslation})`,
      `- **Licencja:** ${payload.verseLicense}`,
      `- **Wydawca:** ${payload.publisher}`,
      `- **Link główny:** ${payload.actionUrl}`,
      `- **Grafika powiązana:** ${payload.image || 'brak (czysty post tekstowy)'}`,
      '',
      '---',
      '',
      payload.text,
      '',
    ].join('\n');
    fs.writeFileSync(path.join(dir, 'post.md'), md, 'utf8');

    return {
      ok: true,
      status: 'DRAFT_TEST',
      postId: payload.id,
      idempotencyKey: payload.idempotencyKey,
      localDraftDir: dir,
      url: null,
    };
  }
}

export class LuminaTablicaFirestorePublisher {
  constructor({ firestoreClient } = {}) {
    this.firestoreClient = firestoreClient;
  }

  async verifyPost(idempotencyKey, payload) {
    assertPermittedAction('verify_published_post');
    if (!this.firestoreClient) {
      const err = new Error('Brak połączenia z bazą LUMINA dla trybu produkcyjnego.');
      err.code = 'FIRESTORE_CLIENT_MISSING';
      throw err;
    }
    const snap = await this.firestoreClient.getPost(payload.id);
    if (!snap || !snap.exists) return { found: false };
    const data = snap.data || {};
    if (data.idempotencyKey === idempotencyKey) {
      return { found: true, postId: payload.id, status: 'PUBLISHED_LIVE', data };
    }
    return { found: false };
  }

  async publish(payload) {
    assertPermittedAction('publish_public_editorial_post');
    if (!this.firestoreClient) {
      const err = new Error('Brak połączenia z bazą LUMINA dla trybu produkcyjnego.');
      err.code = 'FIRESTORE_CLIENT_MISSING';
      throw err;
    }
    const res = await this.firestoreClient.setPost(payload.id, {
      ...payload,
      publishedAt: new Date().toISOString(),
    });
    return {
      ok: true,
      status: 'PUBLISHED_LIVE',
      postId: res?.postId || payload.id,
      idempotencyKey: payload.idempotencyKey,
      url: `https://polskieradio.cc/lumina-profile.html?u=${payload.authorSlug}`,
    };
  }
}

function isTransientError(err) {
  if (!err) return false;
  if (err.transient === true) return true;
  if ([429, 502, 503, 504].includes(Number(err.status))) return true;
  if (['API_UNAVAILABLE', 'TIMEOUT', 'ETIMEDOUT'].includes(String(err.code || ''))) return true;
  return false;
}

export async function publishWithControlledRetry({
  adapter,
  payload,
  idempotencyKey,
  maxAttempts = 3,
  retryDelayMs = 0,
}) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Od drugiej próby najpierw sprawdzamy przez read-back, czy zapis nie powiódł się częściowo wcześniej.
    if (attempt > 1 && typeof adapter.verifyPost === 'function') {
      const existing = await adapter.verifyPost(idempotencyKey, payload);
      if (existing?.found) {
        return {
          ok: true,
          status: existing.status || 'RECOVERED',
          postId: existing.postId || payload.id,
          idempotencyKey,
          attempts: attempt - 1,
          recoveredFromPartialSuccess: true,
          url: existing.data?.sourceUrl || null,
        };
      }
    }

    try {
      const result = await adapter.publish(payload);
      return {
        ...result,
        attempts: attempt,
        recoveredFromPartialSuccess: false,
      };
    } catch (err) {
      lastError = err;
      if (!isTransientError(err) || attempt === maxAttempts) {
        // Ostatnia próba weryfikacji na wypadek gdyby ostatni zapis jednak przeszedł przed błędem sieciowym.
        if (typeof adapter.verifyPost === 'function' && err.code !== 'PERMISSION_DENIED') {
          try {
            const checkAfter = await adapter.verifyPost(idempotencyKey, payload);
            if (checkAfter?.found) {
              return {
                ok: true,
                status: checkAfter.status || 'RECOVERED',
                postId: checkAfter.postId || payload.id,
                idempotencyKey,
                attempts: attempt,
                recoveredFromPartialSuccess: true,
                url: checkAfter.data?.sourceUrl || null,
              };
            }
          } catch {
            // ignoruj błąd odczytu podczas obsługi pierwotnego błędu
          }
        }
        err.attempts = attempt;
        throw err;
      }
      if (retryDelayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  throw lastError;
}
