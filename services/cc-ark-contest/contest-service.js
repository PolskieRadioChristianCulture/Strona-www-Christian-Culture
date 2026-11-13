// ============================================================================
// ARK OF FIRE x CHRISTIAN CULTURE — Konkurs Świadectw Wiary PL/EN
// Moduł: services/cc-ark-contest/contest-service.js
// Standard: ZERO COST, Privacy-by-Design, Brak losowania (wybór jakościowy)
// ============================================================================

const OWNER_EMAIL = 'nazirczarkes@gmail.com';
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const ALLOWED_STATUSES = [
  'draft',
  'scheduled',
  'open',
  'closed',
  'judging',
  'winner_selected',
  'completed',
];

export const DEFAULT_CONTEST_CONFIG = {
  enabled: true,
  status: 'open',
  startDate: '2026-11-13T16:00:00+01:00',
  endDate: '2026-11-30T23:59:59+01:00',
  winnerAnnounceDate: '2026-12-03',
  winnerSelected: false,
  winnerPublished: false,
};

export const ANSWER_MIN_LEN = 40;
export const ANSWER_MAX_LEN = 2000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      ...extraHeaders,
    },
  });
}

export function sanitizeInput(value, maxLen = 2000) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

export function normalizeEmail(rawEmail) {
  if (typeof rawEmail !== 'string') return null;
  const trimmed = rawEmail.trim();
  if (!trimmed || trimmed.length > 254) return null;
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return null;
  const localPart = trimmed.slice(0, atIndex);
  const domainPart = trimmed.slice(atIndex + 1).toLowerCase();
  if (localPart.length > 64 || domainPart.length > 253) return null;
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) return null;
  const normalized = `${localPart.toLowerCase()}@${domainPart}`;
  if (!EMAIL_REGEX.test(normalized)) return null;
  return {
    normalized,
    display: `${localPart}@${domainPart}`,
  };
}

export async function sha256Hex(input) {
  const bytes = new TextEncoder().encode(String(input ?? ''));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256Hex(secret, payload) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(String(secret || 'cc-ark-contest-csrf-secret-2026')),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(String(payload ?? '')));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqualStr(a, b) {
  const sa = String(a || '');
  const sb = String(b || '');
  if (sa.length !== sb.length || !sa.length) return false;
  let diff = 0;
  for (let i = 0; i < sa.length; i++) {
    diff |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  }
  return diff === 0;
}

export function isAllowedOrigin(request) {
  const origin = request.headers.get('Origin') || '';
  const referer = request.headers.get('Referer') || '';
  const target = origin || referer;
  if (!target) return true; // direct server/test calls without browser origin
  try {
    const u = new URL(target);
    const host = u.hostname.toLowerCase();
    return (
      host === 'polskieradio.cc' ||
      host.endsWith('.polskieradio.cc') ||
      host === 'localhost' ||
      host === '127.0.0.1'
    );
  } catch {
    return false;
  }
}

function csvEscape(val) {
  const str = String(val ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export class ArkContestRepository {
  constructor(d1 = null) {
    this.d1 = d1;
    this.initialized = false;
    this.mem = {
      entries: new Map(),
      config: { ...DEFAULT_CONTEST_CONFIG },
      rateLimits: new Map(),
    };
  }

  async ensureSchema() {
    if (!this.d1 || this.initialized) return;
    const stmts = [
      `CREATE TABLE IF NOT EXISTS ark_contest_entries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        email_hash TEXT NOT NULL UNIQUE,
        tech_hash TEXT NOT NULL,
        locale TEXT NOT NULL,
        answer TEXT NOT NULL,
        accepted_rules INTEGER NOT NULL DEFAULT 0,
        accepted_privacy INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        is_test INTEGER NOT NULL DEFAULT 0,
        decision_date TEXT,
        winner_notified_at TEXT,
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS ark_contest_config (
        id TEXT PRIMARY KEY,
        enabled INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'open',
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        winner_announce_date TEXT NOT NULL,
        winner_selected INTEGER NOT NULL DEFAULT 0,
        winner_published INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS ark_contest_rate_limits (
        rate_key TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 1,
        window_start_ms INTEGER NOT NULL
      )`,
    ];
    for (const sql of stmts) {
      await this.d1.prepare(sql).run();
    }
    this.initialized = true;
  }

  async getConfig() {
    if (!this.d1) return { ...this.mem.config };
    await this.ensureSchema();
    const row = await this.d1
      .prepare('SELECT * FROM ark_contest_config WHERE id = ?')
      .bind('default')
      .first();
    if (!row) return { ...DEFAULT_CONTEST_CONFIG };
    return {
      enabled: Boolean(row.enabled),
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      winnerAnnounceDate: row.winner_announce_date,
      winnerSelected: Boolean(row.winner_selected),
      winnerPublished: Boolean(row.winner_published),
      updatedAt: row.updated_at,
    };
  }

  async saveConfig(patch, nowIso) {
    const current = await this.getConfig();
    const next = {
      enabled: typeof patch.enabled === 'boolean' ? patch.enabled : current.enabled,
      status: ALLOWED_STATUSES.includes(patch.status) ? patch.status : current.status,
      startDate: typeof patch.startDate === 'string' && patch.startDate.trim() ? patch.startDate.trim() : current.startDate,
      endDate: typeof patch.endDate === 'string' && patch.endDate.trim() ? patch.endDate.trim() : current.endDate,
      winnerAnnounceDate:
        typeof patch.winnerAnnounceDate === 'string' && patch.winnerAnnounceDate.trim()
          ? patch.winnerAnnounceDate.trim()
          : current.winnerAnnounceDate,
      winnerSelected: typeof patch.winnerSelected === 'boolean' ? patch.winnerSelected : current.winnerSelected,
      winnerPublished: typeof patch.winnerPublished === 'boolean' ? patch.winnerPublished : current.winnerPublished,
      updatedAt: nowIso,
    };
    if (!this.d1) {
      this.mem.config = next;
      return next;
    }
    await this.ensureSchema();
    await this.d1
      .prepare(
        `INSERT INTO ark_contest_config (id, enabled, status, start_date, end_date, winner_announce_date, winner_selected, winner_published, updated_at)
         VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           enabled = excluded.enabled,
           status = excluded.status,
           start_date = excluded.start_date,
           end_date = excluded.end_date,
           winner_announce_date = excluded.winner_announce_date,
           winner_selected = excluded.winner_selected,
           winner_published = excluded.winner_published,
           updated_at = excluded.updated_at`
      )
      .bind(
        next.enabled ? 1 : 0,
        next.status,
        next.startDate,
        next.endDate,
        next.winnerAnnounceDate,
        next.winnerSelected ? 1 : 0,
        next.winnerPublished ? 1 : 0,
        next.updatedAt
      )
      .run();
    return next;
  }

  async checkAndIncrementRateLimit(rateKey, nowMs) {
    if (!this.d1) {
      const existing = this.mem.rateLimits.get(rateKey);
      if (!existing || nowMs - existing.windowStartMs > RATE_LIMIT_WINDOW_MS) {
        this.mem.rateLimits.set(rateKey, { count: 1, windowStartMs: nowMs });
        return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
      }
      if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
        return { allowed: false, remaining: 0 };
      }
      existing.count += 1;
      return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - existing.count };
    }
    await this.ensureSchema();
    const row = await this.d1
      .prepare('SELECT count, window_start_ms FROM ark_contest_rate_limits WHERE rate_key = ?')
      .bind(rateKey)
      .first();
    if (!row || nowMs - Number(row.window_start_ms) > RATE_LIMIT_WINDOW_MS) {
      await this.d1
        .prepare(
          `INSERT INTO ark_contest_rate_limits (rate_key, count, window_start_ms)
           VALUES (?, 1, ?)
           ON CONFLICT(rate_key) DO UPDATE SET count = 1, window_start_ms = excluded.window_start_ms`
        )
        .bind(rateKey, nowMs)
        .run();
      return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
    }
    if (Number(row.count) >= RATE_LIMIT_MAX_REQUESTS) {
      return { allowed: false, remaining: 0 };
    }
    await this.d1
      .prepare('UPDATE ark_contest_rate_limits SET count = count + 1 WHERE rate_key = ?')
      .bind(rateKey)
      .run();
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - (Number(row.count) + 1) };
  }

  async findByEmailHash(emailHash) {
    if (!this.d1) {
      for (const entry of this.mem.entries.values()) {
        if (entry.emailHash === emailHash) return entry;
      }
      return null;
    }
    await this.ensureSchema();
    const row = await this.d1
      .prepare('SELECT * FROM ark_contest_entries WHERE email_hash = ?')
      .bind(emailHash)
      .first();
    return row ? this.mapRow(row) : null;
  }

  mapRow(row) {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      emailHash: row.email_hash,
      techHash: row.tech_hash,
      locale: row.locale,
      answer: row.answer,
      acceptedRules: Boolean(row.accepted_rules),
      acceptedPrivacy: Boolean(row.accepted_privacy),
      status: row.status,
      isTest: Boolean(row.is_test),
      decisionDate: row.decision_date || null,
      winnerNotifiedAt: row.winner_notified_at || null,
      notes: row.notes || '',
      createdAt: row.created_at,
    };
  }

  async createEntry(entry) {
    if (!this.d1) {
      this.mem.entries.set(entry.id, { ...entry });
      return { ...entry };
    }
    await this.ensureSchema();
    await this.d1
      .prepare(
        `INSERT INTO ark_contest_entries
         (id, name, email, email_hash, tech_hash, locale, answer, accepted_rules, accepted_privacy, status, is_test, decision_date, winner_notified_at, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        entry.id,
        entry.name,
        entry.email,
        entry.emailHash,
        entry.techHash,
        entry.locale,
        entry.answer,
        entry.acceptedRules ? 1 : 0,
        entry.acceptedPrivacy ? 1 : 0,
        entry.status,
        entry.isTest ? 1 : 0,
        entry.decisionDate || null,
        entry.winnerNotifiedAt || null,
        entry.notes || '',
        entry.createdAt
      )
      .run();
    return { ...entry };
  }

  async listEntries() {
    if (!this.d1) {
      return [...this.mem.entries.values()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    }
    await this.ensureSchema();
    const res = await this.d1
      .prepare('SELECT * FROM ark_contest_entries ORDER BY created_at DESC')
      .all();
    return (res.results || []).map((r) => this.mapRow(r));
  }

  async getEntryById(id) {
    if (!this.d1) {
      return this.mem.entries.get(id) || null;
    }
    await this.ensureSchema();
    const row = await this.d1
      .prepare('SELECT * FROM ark_contest_entries WHERE id = ?')
      .bind(id)
      .first();
    return row ? this.mapRow(row) : null;
  }

  async updateEntry(id, patch) {
    const existing = await this.getEntryById(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      status: ['pending', 'qualified', 'rejected', 'winner'].includes(patch.status) ? patch.status : existing.status,
      decisionDate: patch.decisionDate !== undefined ? patch.decisionDate : existing.decisionDate,
      winnerNotifiedAt: patch.winnerNotifiedAt !== undefined ? patch.winnerNotifiedAt : existing.winnerNotifiedAt,
      notes: typeof patch.notes === 'string' ? sanitizeInput(patch.notes, 500) : existing.notes,
    };
    if (!this.d1) {
      this.mem.entries.set(id, updated);
      return updated;
    }
    await this.ensureSchema();
    await this.d1
      .prepare(
        `UPDATE ark_contest_entries
         SET status = ?, decision_date = ?, winner_notified_at = ?, notes = ?
         WHERE id = ?`
      )
      .bind(updated.status, updated.decisionDate, updated.winnerNotifiedAt, updated.notes, id)
      .run();
    return updated;
  }

  async deleteEntry(id) {
    if (!this.d1) {
      return this.mem.entries.delete(id);
    }
    await this.ensureSchema();
    const res = await this.d1
      .prepare('DELETE FROM ark_contest_entries WHERE id = ?')
      .bind(id)
      .run();
    return (res.meta?.changes || 0) > 0;
  }

  async deleteTestEntries() {
    if (!this.d1) {
      let count = 0;
      for (const [k, v] of this.mem.entries.entries()) {
        if (v.isTest) {
          this.mem.entries.delete(k);
          count++;
        }
      }
      return count;
    }
    await this.ensureSchema();
    const res = await this.d1
      .prepare('DELETE FROM ark_contest_entries WHERE is_test = 1')
      .run();
    return res.meta?.changes || 0;
  }
}

export class ArkContestService {
  constructor({ repo, env = {}, nowFn = () => new Date() } = {}) {
    this.repo = repo || new ArkContestRepository();
    this.env = env;
    this.nowFn = nowFn;
  }

  getCsrfSecret() {
    return this.env?.CC_ARK_CSRF_SECRET || this.env?.CC_MC_LIVE_REPORT_TOKEN || 'cc-ark-contest-csrf-secret-2026';
  }

  async createCsrfToken(techHash) {
    const ts = this.nowFn().getTime();
    const payload = `${ts}.${techHash}`;
    const sig = await hmacSha256Hex(this.getCsrfSecret(), payload);
    return `${payload}.${sig}`;
  }

  async verifyCsrfToken(token, techHash) {
    if (typeof token !== 'string') return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [tsStr, tokHash, sig] = parts;
    const ts = Number(tsStr);
    if (!Number.isFinite(ts)) return false;
    const ageMs = this.nowFn().getTime() - ts;
    if (ageMs < -60_000 || ageMs > 4 * 3600_000) return false;
    if (tokHash !== techHash) return false;
    const expected = await hmacSha256Hex(this.getCsrfSecret(), `${tsStr}.${tokHash}`);
    return timingSafeEqualStr(sig, expected);
  }

  async getTechHash(request) {
    const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'local';
    const ua = request.headers.get('User-Agent') || 'ua';
    return sha256Hex(`${ip}::${ua}`);
  }

  computeEffectiveStatus(config, nowMs) {
    if (!config.enabled) return 'closed';
    if (config.status === 'open') {
      const startMs = Date.parse(config.startDate || '');
      const endMs = Date.parse(config.endDate || '');
      if (Number.isFinite(startMs) && nowMs < startMs) return 'scheduled';
      if (Number.isFinite(endMs) && nowMs > endMs) return 'closed';
    }
    return config.status;
  }

  async authenticateAdmin(request, verifyToken) {
    const authHeader = request.headers.get('Authorization') || '';
    const bearer = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!bearer) return { status: 401, error: 'UNAUTHORIZED' };

    const adminToken = String(this.env?.CC_ARK_ADMIN_TOKEN || '').trim();
    if (adminToken && timingSafeEqualStr(bearer, adminToken)) {
      return { status: 200, user: { email: OWNER_EMAIL, role: 'owner' } };
    }

    if (typeof verifyToken === 'function') {
      const claims = await verifyToken(bearer).catch(() => null);
      if (!claims || !claims.email) {
        return { status: 401, error: 'INVALID_TOKEN' };
      }
      if (String(claims.email).toLowerCase() !== OWNER_EMAIL) {
        return { status: 403, error: 'FORBIDDEN' };
      }
      return { status: 200, user: { email: claims.email, role: 'owner' } };
    }

    return { status: 401, error: 'UNAUTHORIZED' };
  }

  async handleRequest(request, { verifyToken } = {}) {
    const url = new URL(request.url);
    const path = url.pathname;
    const now = this.nowFn();
    const nowMs = now.getTime();
    const nowIso = now.toISOString();

    // 1. Public Status & CSRF Token
    if (path === '/api/ark-contest/status' && request.method === 'GET') {
      const config = await this.repo.getConfig();
      const effectiveStatus = this.computeEffectiveStatus(config, nowMs);
      const techHash = await this.getTechHash(request);
      const csrfToken = await this.createCsrfToken(techHash);
      return jsonResponse({
        ok: true,
        contest: {
          ...config,
          effectiveStatus,
        },
        csrfToken,
      });
    }

    // 2. Public Contest Entry Submission
    if (path === '/api/ark-contest/submit' && request.method === 'POST') {
      if (!isAllowedOrigin(request)) {
        return jsonResponse({ ok: false, error: 'FORBIDDEN_ORIGIN' }, 403);
      }

      const contentType = request.headers.get('Content-Type') || '';
      if (!contentType.toLowerCase().includes('application/json')) {
        return jsonResponse({ ok: false, error: 'INVALID_CONTENT_TYPE' }, 415);
      }

      let body;
      try {
        const raw = await request.text();
        if (raw.length > 16 * 1024) {
          return jsonResponse({ ok: false, error: 'PAYLOAD_TOO_LARGE' }, 413);
        }
        body = JSON.parse(raw);
      } catch {
        return jsonResponse({ ok: false, error: 'INVALID_JSON' }, 400);
      }

      // Honeypot check (silent fake acceptance)
      if (body.website || body.company || body.fax || body.botField) {
        return jsonResponse({
          ok: true,
          id: `AOF-${nowMs.toString(36).toUpperCase()}`,
          honeypot: true,
        });
      }

      const techHash = await this.getTechHash(request);
      const csrfToken = body.csrfToken || request.headers.get('X-CC-CSRF') || '';
      const csrfOk = await this.verifyCsrfToken(csrfToken, techHash);
      if (!csrfOk) {
        return jsonResponse({ ok: false, error: 'INVALID_CSRF' }, 403);
      }

      const rate = await this.repo.checkAndIncrementRateLimit(techHash, nowMs);
      if (!rate.allowed) {
        return jsonResponse({ ok: false, error: 'RATE_LIMITED' }, 429);
      }

      const config = await this.repo.getConfig();
      const effectiveStatus = this.computeEffectiveStatus(config, nowMs);
      if (effectiveStatus !== 'open') {
        return jsonResponse({ ok: false, error: 'CONTEST_NOT_OPEN', status: effectiveStatus }, 403);
      }

      const locale = body.locale === 'en' ? 'en' : 'pl';
      const name = sanitizeInput(body.name, 80);
      const emailObj = normalizeEmail(body.email);
      const answer = sanitizeInput(body.answer, ANSWER_MAX_LEN);
      const acceptedRules = body.acceptRules === true;
      const acceptedPrivacy = body.acceptPrivacy === true;
      const isTest = body.isTest === true && (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || Boolean(this.env?.ALLOW_TEST_ENTRIES));

      if (!name || name.length < 2) {
        return jsonResponse({
          ok: false,
          error: 'VALIDATION_ERROR',
          field: 'name',
          message: locale === 'en' ? 'Please enter your name or nickname.' : 'Podaj swoje imię lub pseudonim.',
        }, 400);
      }

      if (!emailObj) {
        return jsonResponse({
          ok: false,
          error: 'VALIDATION_ERROR',
          field: 'email',
          message: locale === 'en' ? 'Please enter a valid email address.' : 'Podaj poprawny adres e-mail.',
        }, 400);
      }

      if (answer.length < ANSWER_MIN_LEN || answer.length > ANSWER_MAX_LEN) {
        return jsonResponse({
          ok: false,
          error: 'VALIDATION_ERROR',
          field: 'answer',
          message:
            locale === 'en'
              ? `Your answer must be between ${ANSWER_MIN_LEN} and ${ANSWER_MAX_LEN} characters.`
              : `Twoja odpowiedź musi mieć od ${ANSWER_MIN_LEN} do ${ANSWER_MAX_LEN} znaków.`,
        }, 400);
      }

      if (!acceptedRules) {
        return jsonResponse({
          ok: false,
          error: 'RULES_REQUIRED',
          field: 'acceptRules',
          message: locale === 'en' ? 'You must accept the contest rules.' : 'Musisz zaakceptować regulamin konkursu.',
        }, 400);
      }

      if (!acceptedPrivacy) {
        return jsonResponse({
          ok: false,
          error: 'PRIVACY_REQUIRED',
          field: 'acceptPrivacy',
          message:
            locale === 'en'
              ? 'You must confirm reading the privacy notice.'
              : 'Musisz potwierdzić zapoznanie się z informacją o przetwarzaniu danych.',
        }, 400);
      }

      const emailHash = await sha256Hex(emailObj.normalized);
      const duplicate = await this.repo.findByEmailHash(emailHash);
      if (duplicate) {
        return jsonResponse({
          ok: false,
          error: 'DUPLICATE_ENTRY',
          field: 'email',
          message:
            locale === 'en'
              ? 'An entry with this email address has already been submitted.'
              : 'Zgłoszenie z tego adresu e-mail zostało już wysłane.',
        }, 409);
      }

      const id = `AOF-${nowMs.toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      await this.repo.createEntry({
        id,
        name,
        email: emailObj.display,
        emailHash,
        techHash,
        locale,
        answer,
        acceptedRules: true,
        acceptedPrivacy: true,
        status: 'pending',
        isTest,
        decisionDate: null,
        winnerNotifiedAt: null,
        notes: '',
        createdAt: nowIso,
      });

      return jsonResponse({
        ok: true,
        id,
        message:
          locale === 'en'
            ? 'Thank you! Your entry has been received. May your testimony encourage others in their faith.'
            : 'Dziękujemy! Twoje zgłoszenie zostało zapisane. Niech Twoje świadectwo będzie zachętą dla innych.',
      }, 201);
    }

    // 3. Admin Routes (Protected by Firebase Owner RBAC or CC_ARK_ADMIN_TOKEN)
    if (path.startsWith('/api/ark-contest/admin')) {
      const auth = await this.authenticateAdmin(request, verifyToken);
      if (auth.status !== 200) {
        return jsonResponse({ ok: false, error: auth.error }, auth.status);
      }

      // GET /api/ark-contest/admin/entries
      if (path === '/api/ark-contest/admin/entries' && request.method === 'GET') {
        const entries = await this.repo.listEntries();
        const config = await this.repo.getConfig();
        const counts = { pending: 0, qualified: 0, rejected: 0, winner: 0 };
        for (const e of entries) {
          if (counts[e.status] !== undefined) counts[e.status] += 1;
        }
        return jsonResponse({
          ok: true,
          total: entries.length,
          counts,
          config,
          entries,
        });
      }

      // GET /api/ark-contest/admin/export (NO EMAILS, NO TECH HASHES — STRICTLY ID, NAME, LOCALE, ANSWER)
      if (path === '/api/ark-contest/admin/export' && request.method === 'GET') {
        const format = url.searchParams.get('format') === 'csv' ? 'csv' : 'json';
        const includeAll = url.searchParams.get('includePending') === '1';
        const entries = await this.repo.listEntries();
        const eligible = entries.filter((e) =>
          includeAll ? e.status === 'qualified' || e.status === 'pending' || e.status === 'winner' : e.status === 'qualified' || e.status === 'winner'
        );

        const sanitizedForArkOfFire = eligible.map((e) => ({
          id: e.id,
          name: e.name,
          locale: e.locale,
          answer: e.answer,
        }));

        if (format === 'csv') {
          const header = 'ID,Name,Language,Answer\n';
          const rows = sanitizedForArkOfFire
            .map((e) => [e.id, e.name, e.locale.toUpperCase(), e.answer].map(csvEscape).join(','))
            .join('\n');
          return new Response(`\uFEFF${header}${rows}`, {
            status: 200,
            headers: {
              'Content-Type': 'text/csv; charset=utf-8',
              'Content-Disposition': 'attachment; filename="ark-of-fire-entries-for-jury.csv"',
              'Cache-Control': 'no-store',
              'X-Content-Type-Options': 'nosniff',
            },
          });
        }

        return new Response(JSON.stringify({ exportedAt: nowIso, count: sanitizedForArkOfFire.length, entries: sanitizedForArkOfFire }, null, 2), {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': 'attachment; filename="ark-of-fire-entries-for-jury.json"',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      }

      // PATCH /api/ark-contest/admin/config
      if (path === '/api/ark-contest/admin/config' && request.method === 'PATCH') {
        const body = await request.json().catch(() => null);
        if (!body || typeof body !== 'object') {
          return jsonResponse({ ok: false, error: 'INVALID_JSON' }, 400);
        }
        const saved = await this.repo.saveConfig(body, nowIso);
        return jsonResponse({ ok: true, config: saved });
      }

      // PATCH /api/ark-contest/admin/entries/:id
      const entryMatch = path.match(/^\/api\/ark-contest\/admin\/entries\/([^/]+)$/);
      if (entryMatch && request.method === 'PATCH') {
        const id = decodeURIComponent(entryMatch[1]);
        const body = await request.json().catch(() => null);
        if (!body || typeof body !== 'object') {
          return jsonResponse({ ok: false, error: 'INVALID_JSON' }, 400);
        }
        const patch = { ...body };
        if (patch.status === 'winner') {
          patch.decisionDate = patch.decisionDate || nowIso;
          await this.repo.saveConfig({ winnerSelected: true, status: 'winner_selected' }, nowIso);
        }
        const updated = await this.repo.updateEntry(id, patch);
        if (!updated) return jsonResponse({ ok: false, error: 'NOT_FOUND' }, 404);
        return jsonResponse({ ok: true, entry: updated });
      }

      // DELETE /api/ark-contest/admin/entries/:id
      if (entryMatch && request.method === 'DELETE') {
        const id = decodeURIComponent(entryMatch[1]);
        const deleted = await this.repo.deleteEntry(id);
        if (!deleted) return jsonResponse({ ok: false, error: 'NOT_FOUND' }, 404);
        return jsonResponse({ ok: true, deletedId: id });
      }

      // DELETE /api/ark-contest/admin/entries?onlyTest=1
      if (path === '/api/ark-contest/admin/entries' && request.method === 'DELETE') {
        if (url.searchParams.get('onlyTest') === '1') {
          const count = await this.repo.deleteTestEntries();
          return jsonResponse({ ok: true, deletedTestCount: count });
        }
        return jsonResponse({ ok: false, error: 'ONLY_TEST_ALLOWED' }, 400);
      }

      // POST /api/ark-contest/admin/notify-winner
      if (path === '/api/ark-contest/admin/notify-winner' && request.method === 'POST') {
        const body = await request.json().catch(() => null);
        if (!body || !body.entryId) {
          return jsonResponse({ ok: false, error: 'ENTRY_ID_REQUIRED' }, 400);
        }
        const entry = await this.repo.getEntryById(body.entryId);
        if (!entry) return jsonResponse({ ok: false, error: 'NOT_FOUND' }, 404);
        if (entry.status !== 'winner') {
          return jsonResponse({ ok: false, error: 'ENTRY_NOT_MARKED_AS_WINNER' }, 400);
        }
        await this.repo.updateEntry(entry.id, { winnerNotifiedAt: nowIso });

        const emailDraft =
          entry.locale === 'en'
            ? {
                to: entry.email,
                subject: 'Congratulations! Ark of Fire × Christian Culture Contest Winner',
                body: `Dear ${entry.name},\n\nCongratulations! Based on your faith testimony, Ark of Fire has selected you as the winner of the official Ark of Fire T-shirt.\n\nBefore we can arrange shipping, please reply to this email confirming the following consent:\n\n“I consent to Christian Culture sharing my full name, shipping address, T-shirt size and selected model with Ark of Fire solely for the purpose of delivering the prize.”\n\nPlease also include:\n- Full name\n- Shipping address\n- T-shirt size (e.g., S, M, L, XL, XXL)\n- Preferred model: M (men’s) / F (women’s)\n\nSoli Deo Gloria!\nChristian Culture Global × Ark of Fire`,
              }
            : {
                to: entry.email,
                subject: 'Gratulacje! Wygrana w konkursie Ark of Fire × Christian Culture',
                body: `Drogi/a ${entry.name},\n\nSerdecznie gratulujemy! Spośród nadesłanych zgłoszeń zespół Ark of Fire wybrał Twoje świadectwo jako zwycięskie — otrzymujesz oficjalną koszulkę Ark of Fire.\n\nAbyśmy mogli przekazać dane do wysyłki, prosimy o odpowiedź na tego e-maila z potwierdzeniem poniższej zgody:\n\n„Wyrażam zgodę na przekazanie Ark of Fire mojego imienia i nazwiska, adresu wysyłkowego, rozmiaru koszulki oraz wybranego modelu wyłącznie w celu dostarczenia nagrody.”\n\nProsimy o podanie:\n- Imię i nazwisko\n- Adres wysyłkowy\n- Rozmiar koszulki (np. S, M, L, XL, XXL)\n- Model: M (męski) / F (damski)\n\nSoli Deo Gloria!\nChristian Culture Global × Ark of Fire`,
              };

        return jsonResponse({ ok: true, notifiedAt: nowIso, emailDraft });
      }

      return jsonResponse({ ok: false, error: 'NOT_FOUND' }, 404);
    }

    return jsonResponse({ ok: false, error: 'NOT_FOUND' }, 404);
  }
}

let _defaultService = null;
export function getArkContestService(env = {}) {
  const d1 = env?.mission_control_db || env?.milion_db || null;
  if (!_defaultService) {
    _defaultService = new ArkContestService({
      repo: new ArkContestRepository(d1),
      env,
    });
  } else {
    _defaultService.env = env;
    if (d1 && !_defaultService.repo.d1) {
      _defaultService.repo.d1 = d1;
      _defaultService.repo.initialized = false;
    }
  }
  return _defaultService;
}

export async function handleArkContestApiRequest(request, env, { verifyToken } = {}) {
  const service = getArkContestService(env);
  return service.handleRequest(request, { verifyToken });
}
