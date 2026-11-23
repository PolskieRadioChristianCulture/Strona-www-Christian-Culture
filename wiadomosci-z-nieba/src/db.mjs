import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

const SECRET_KEY_RE = /^(token|password|passwd|secret|cookie|authorization|api[-_]?key|private[-_]?key|credentials)$/i;
const SECRET_VALUE_RE = /(AIza[\w-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]{15,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/gi;

export const ALLOWED_ANALYTICS_COUNTERS = new Set([
  'published_count',
  'views_count',
  'reactions_count',
  'comments_count',
  'shares_count',
  'werset_dnia_clicks',
  'followers_delta',
  'optin_subscriptions_count',
  'errors_count',
  'duplicates_blocked_count',
]);

export function redactSecrets(input) {
  if (input === null || input === undefined) return input;
  if (typeof input === 'string') {
    return input.replace(SECRET_VALUE_RE, '[REDACTED]');
  }
  if (Array.isArray(input)) {
    return input.map(item => redactSecrets(item));
  }
  if (typeof input === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(input)) {
      out[k] = SECRET_KEY_RE.test(k) ? '[REDACTED]' : redactSecrets(v);
    }
    return out;
  }
  return input;
}

export function loadWznConfig(repoRoot = DEFAULT_REPO_ROOT) {
  const cfgPath = path.join(repoRoot, 'wiadomosci-z-nieba', 'config.json');
  return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
}

export function openWznDb({ dbPath, repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const cfg = loadWznConfig(repoRoot);
  const resolvedDbPath = dbPath || path.resolve(repoRoot, cfg.paths.sqliteDb);
  fs.mkdirSync(path.dirname(resolvedDbPath), { recursive: true });

  const db = new DatabaseSync(resolvedDbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS system_flags (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_runs (
      run_date TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      mode TEXT NOT NULL,
      status TEXT NOT NULL,
      verse_day INTEGER,
      verse_reference TEXT,
      verse_hash TEXT,
      theme_id TEXT,
      post_id TEXT,
      idempotency_key TEXT NOT NULL UNIQUE,
      attempts INTEGER NOT NULL DEFAULT 1,
      error_code TEXT,
      error_message TEXT,
      published_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analytics_daily (
      metric_date TEXT PRIMARY KEY,
      published_count INTEGER NOT NULL DEFAULT 0,
      views_count INTEGER NOT NULL DEFAULT 0,
      reactions_count INTEGER NOT NULL DEFAULT 0,
      comments_count INTEGER NOT NULL DEFAULT 0,
      shares_count INTEGER NOT NULL DEFAULT 0,
      werset_dnia_clicks INTEGER NOT NULL DEFAULT 0,
      followers_delta INTEGER NOT NULL DEFAULT 0,
      optin_subscriptions_count INTEGER NOT NULL DEFAULT 0,
      errors_count INTEGER NOT NULL DEFAULT 0,
      duplicates_blocked_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL,
      level TEXT NOT NULL,
      event TEXT NOT NULL,
      run_date TEXT,
      details_json TEXT NOT NULL
    );
  `);

  function seedFlag(key, value) {
    db.prepare(`INSERT OR IGNORE INTO system_flags (key, value, updated_at) VALUES (?, ?, ?)`)
      .run(key, String(value), new Date().toISOString());
  }

  seedFlag('kill_switch', cfg.killSwitch ? '1' : '0');
  seedFlag('auto_publish_enabled', cfg.autoPublishEnabled ? '1' : '0');
  seedFlag('production_approved_by_owner', cfg.productionApprovedByOwner ? '1' : '0');
  seedFlag('publish_time_warsaw', cfg.schedule?.publishTime || '07:00');

  function getFlag(key) {
    const row = db.prepare(`SELECT value FROM system_flags WHERE key = ?`).get(key);
    return row ? row.value : null;
  }

  function setFlag(key, value) {
    const ts = new Date().toISOString();
    db.prepare(`
      INSERT INTO system_flags (key, value, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).run(key, String(value), ts);
    logAudit({ level: 'INFO', event: `flag:${key}`, details: { value: String(value) } });
  }

  function logAudit({ level = 'INFO', event, runDate = null, details = {} }) {
    const ts = new Date().toISOString();
    const safeDetails = redactSecrets(details);
    db.prepare(`INSERT INTO audit_log (ts, level, event, run_date, details_json) VALUES (?, ?, ?, ?, ?)`)
      .run(ts, level, event, runDate, JSON.stringify(safeDetails));
  }

  function getDailyRun(runDate) {
    return db.prepare(`SELECT * FROM daily_runs WHERE run_date = ?`).get(runDate) || null;
  }

  function getDailyRunByIdempotencyKey(key) {
    return db.prepare(`SELECT * FROM daily_runs WHERE idempotency_key = ?`).get(key) || null;
  }

  function recordDailyRun(entry) {
    const now = new Date().toISOString();
    const existing = getDailyRun(entry.runDate);
    db.prepare(`
      INSERT INTO daily_runs (
        run_date, job_id, mode, status, verse_day, verse_reference, verse_hash,
        theme_id, post_id, idempotency_key, attempts, error_code, error_message,
        published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(run_date) DO UPDATE SET
        job_id = excluded.job_id,
        mode = excluded.mode,
        status = excluded.status,
        verse_day = excluded.verse_day,
        verse_reference = excluded.verse_reference,
        verse_hash = excluded.verse_hash,
        theme_id = excluded.theme_id,
        post_id = excluded.post_id,
        attempts = excluded.attempts,
        error_code = excluded.error_code,
        error_message = excluded.error_message,
        published_at = excluded.published_at,
        updated_at = excluded.updated_at
    `).run(
      entry.runDate,
      entry.jobId,
      entry.mode,
      entry.status,
      entry.verseDay ?? null,
      entry.verseReference ?? null,
      entry.verseHash ?? null,
      entry.themeId ?? null,
      entry.postId ?? null,
      entry.idempotencyKey,
      Number(entry.attempts ?? 1),
      entry.errorCode ?? null,
      entry.errorMessage ?? null,
      entry.publishedAt ?? null,
      existing ? existing.created_at : now,
      now
    );
    return getDailyRun(entry.runDate);
  }

  function upsertDailyAnalytics(metricDate, fields = {}) {
    const now = new Date().toISOString();
    const current = db.prepare(`SELECT * FROM analytics_daily WHERE metric_date = ?`).get(metricDate) || {
      metric_date: metricDate,
      published_count: 0,
      views_count: 0,
      reactions_count: 0,
      comments_count: 0,
      shares_count: 0,
      werset_dnia_clicks: 0,
      followers_delta: 0,
      optin_subscriptions_count: 0,
      errors_count: 0,
      duplicates_blocked_count: 0,
      status: 'INIT',
    };
    const next = {
      ...current,
      ...fields,
      metric_date: metricDate,
      status: fields.status ?? current.status,
      updated_at: now,
    };
    db.prepare(`
      INSERT INTO analytics_daily (
        metric_date, published_count, views_count, reactions_count, comments_count,
        shares_count, werset_dnia_clicks, followers_delta, optin_subscriptions_count,
        errors_count, duplicates_blocked_count, status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(metric_date) DO UPDATE SET
        published_count = excluded.published_count,
        views_count = excluded.views_count,
        reactions_count = excluded.reactions_count,
        comments_count = excluded.comments_count,
        shares_count = excluded.shares_count,
        werset_dnia_clicks = excluded.werset_dnia_clicks,
        followers_delta = excluded.followers_delta,
        optin_subscriptions_count = excluded.optin_subscriptions_count,
        errors_count = excluded.errors_count,
        duplicates_blocked_count = excluded.duplicates_blocked_count,
        status = excluded.status,
        updated_at = excluded.updated_at
    `).run(
      next.metric_date,
      Number(next.published_count || 0),
      Number(next.views_count || 0),
      Number(next.reactions_count || 0),
      Number(next.comments_count || 0),
      Number(next.shares_count || 0),
      Number(next.werset_dnia_clicks || 0),
      Number(next.followers_delta || 0),
      Number(next.optin_subscriptions_count || 0),
      Number(next.errors_count || 0),
      Number(next.duplicates_blocked_count || 0),
      String(next.status || 'OK'),
      now
    );
    return db.prepare(`SELECT * FROM analytics_daily WHERE metric_date = ?`).get(metricDate);
  }

  function incrementAnalyticsCounter(metricDate, counterName, delta = 1, status = null) {
    if (!ALLOWED_ANALYTICS_COUNTERS.has(counterName)) {
      throw new Error(`Niedozwolona metryka analityczna: ${counterName}`);
    }
    const now = new Date().toISOString();
    upsertDailyAnalytics(metricDate, {});
    db.prepare(`
      UPDATE analytics_daily
      SET ${counterName} = ${counterName} + ?,
          status = COALESCE(?, status),
          updated_at = ?
      WHERE metric_date = ?
    `).run(Number(delta), status, now, metricDate);
    return db.prepare(`SELECT * FROM analytics_daily WHERE metric_date = ?`).get(metricDate);
  }

  function exportStateSummary() {
    const flags = Object.fromEntries(
      db.prepare(`SELECT key, value FROM system_flags`).all().map(r => [r.key, r.value])
    );
    const runs = db.prepare(`SELECT * FROM daily_runs ORDER BY run_date ASC`).all();
    const analytics = db.prepare(`SELECT * FROM analytics_daily ORDER BY metric_date ASC`).all();
    const recentAudits = db.prepare(`SELECT * FROM audit_log ORDER BY id DESC LIMIT 25`).all();
    const totals = analytics.reduce(
      (acc, row) => {
        for (const key of ALLOWED_ANALYTICS_COUNTERS) {
          acc[key] = (acc[key] || 0) + Number(row[key] || 0);
        }
        return acc;
      },
      {
        published_count: 0,
        views_count: 0,
        reactions_count: 0,
        comments_count: 0,
        shares_count: 0,
        werset_dnia_clicks: 0,
        followers_delta: 0,
        optin_subscriptions_count: 0,
        errors_count: 0,
        duplicates_blocked_count: 0,
      }
    );
    return { flags, runs, analytics, totals, recentAudits };
  }

  function close() {
    db.close();
  }

  return {
    db,
    dbPath: resolvedDbPath,
    getFlag,
    setFlag,
    logAudit,
    getDailyRun,
    getDailyRunByIdempotencyKey,
    recordDailyRun,
    upsertDailyAnalytics,
    incrementAnalyticsCounter,
    exportStateSummary,
    close,
  };
}
