import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

const SECRET_KEY_RE = /^(token|password|passwd|secret|cookie|authorization|api[-_]?key|private[-_]?key|credentials)$/i;
const SECRET_VALUE_RE = /(AIza[\w-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]{15,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/gi;

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
      if (SECRET_KEY_RE.test(k)) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = redactSecrets(v);
      }
    }
    return out;
  }
  return input;
}

export function loadConfig(repoRoot = DEFAULT_REPO_ROOT) {
  const cfgPath = path.join(repoRoot, 'patronite', 'config.json');
  return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
}

export function openPatroniteDb({ dbPath, auditLogJsonlPath, repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const cfg = loadConfig(repoRoot);
  const resolvedDbPath = dbPath || path.resolve(repoRoot, cfg.paths.sqliteDb);
  const resolvedJsonlPath = auditLogJsonlPath || path.resolve(repoRoot, cfg.paths.auditLogJsonl);
  fs.mkdirSync(path.dirname(resolvedDbPath), { recursive: true });
  fs.mkdirSync(path.dirname(resolvedJsonlPath), { recursive: true });

  const db = new DatabaseSync(resolvedDbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS system_flags (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jobs (
      job_id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      scheduled_for TEXT NOT NULL,
      prep_at TEXT NOT NULL,
      series_type TEXT NOT NULL,
      title TEXT NOT NULL,
      topic_key TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      sources_json TEXT NOT NULL,
      qa_status TEXT NOT NULL,
      qa_details_json TEXT NOT NULL,
      graphic_path TEXT,
      square_graphic_path TEXT,
      visibility TEXT NOT NULL,
      publish_status TEXT NOT NULL,
      published_url TEXT,
      remote_post_id TEXT,
      verified_at TEXT,
      error_code TEXT,
      attempts INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS evidence_registry (
      evidence_id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      claim TEXT NOT NULL,
      status TEXT NOT NULL,
      source_name TEXT NOT NULL,
      source_ref TEXT NOT NULL,
      verified_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS published_archive (
      archive_id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL UNIQUE,
      topic_key TEXT NOT NULL,
      title TEXT NOT NULL,
      teaser TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      published_at TEXT NOT NULL,
      url TEXT,
      series_type TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      job_id TEXT,
      status TEXT NOT NULL,
      details_json TEXT NOT NULL
    );
  `);

  function seedDefaultFlag(key, value) {
    const stmt = db.prepare(`INSERT OR IGNORE INTO system_flags (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?)`);
    stmt.run(key, value, new Date().toISOString(), 'system_init');
  }
  seedDefaultFlag('kill_switch', cfg.killSwitch ? '1' : '0');
  seedDefaultFlag('production_approved', cfg.productionApprovedByOwner ? '1' : '0');

  function logAudit({ actor = 'system', action, jobId = null, status, details = {} }) {
    const ts = new Date().toISOString();
    const safeDetails = redactSecrets(details);
    const detailsStr = JSON.stringify(safeDetails);
    db.prepare(`INSERT INTO audit_log (ts, actor, action, job_id, status, details_json) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(ts, actor, action, jobId, status, detailsStr);
    const line = JSON.stringify({ ts, actor, action, jobId, status, details: safeDetails });
    fs.appendFileSync(resolvedJsonlPath, line + '\n', 'utf8');
  }

  function getFlag(key) {
    const row = db.prepare(`SELECT value FROM system_flags WHERE key = ?`).get(key);
    return row ? row.value : null;
  }

  function setFlag(key, value, actor = 'operator') {
    const ts = new Date().toISOString();
    db.prepare(`INSERT INTO system_flags (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at, updated_by=excluded.updated_by`)
      .run(key, String(value), ts, actor);
    logAudit({ actor, action: `set_flag:${key}`, status: 'OK', details: { value: String(value) } });
  }

  function recordJob(job) {
    const now = new Date().toISOString();
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare(`
        INSERT INTO jobs (
          job_id, created_at, scheduled_for, prep_at, series_type, title, topic_key, content_hash,
          sources_json, qa_status, qa_details_json, graphic_path, square_graphic_path, visibility,
          publish_status, published_url, remote_post_id, verified_at, error_code, attempts
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(job_id) DO UPDATE SET
          title=excluded.title,
          topic_key=excluded.topic_key,
          content_hash=excluded.content_hash,
          sources_json=excluded.sources_json,
          qa_status=excluded.qa_status,
          qa_details_json=excluded.qa_details_json,
          graphic_path=excluded.graphic_path,
          square_graphic_path=excluded.square_graphic_path,
          visibility=excluded.visibility,
          publish_status=excluded.publish_status,
          published_url=excluded.published_url,
          remote_post_id=excluded.remote_post_id,
          verified_at=excluded.verified_at,
          error_code=excluded.error_code,
          attempts=excluded.attempts
      `).run(
        job.jobId,
        job.createdAt || now,
        job.scheduledFor,
        job.prepAt,
        job.seriesType,
        job.title,
        job.topicKey,
        job.contentHash,
        JSON.stringify(job.sources || []),
        job.qaStatus,
        JSON.stringify(job.qaDetails || {}),
        job.graphicPath || null,
        job.squareGraphicPath || null,
        job.visibility || 'PUBLICZNY',
        job.publishStatus,
        job.publishedUrl || null,
        job.remotePostId || null,
        job.verifiedAt || null,
        job.errorCode || null,
        Number(job.attempts || 0),
      );
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }

  function recordEvidence(jobId, claims = []) {
    const now = new Date().toISOString();
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare(`DELETE FROM evidence_registry WHERE job_id = ?`).run(jobId);
      const ins = db.prepare(`
        INSERT INTO evidence_registry (evidence_id, job_id, claim, status, source_name, source_ref, verified_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (let i = 0; i < claims.length; i++) {
        const c = claims[i];
        const eid = c.evidenceId || `${jobId}-EV-${i + 1}`;
        ins.run(eid, jobId, c.claim, c.status, c.sourceName, c.sourceRef, c.verifiedDate, now);
      }
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }

  function recordPublished({ jobId, topicKey, title, teaser, contentHash, publishedAt, url, seriesType }) {
    const archiveId = `ARC-${crypto.createHash('sha1').update(`${jobId}:${topicKey}`).digest('hex').slice(0, 12)}`;
    db.prepare(`
      INSERT INTO published_archive (archive_id, job_id, topic_key, title, teaser, content_hash, published_at, url, series_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(job_id) DO UPDATE SET
        title=excluded.title,
        teaser=excluded.teaser,
        content_hash=excluded.content_hash,
        published_at=excluded.published_at,
        url=excluded.url
    `).run(archiveId, jobId, topicKey, title, teaser || '', contentHash, publishedAt, url || null, seriesType);
  }

  function getRecentArchive({ referenceDateIso, windowDays = 30 } = {}) {
    const refMs = Date.parse(referenceDateIso || new Date().toISOString());
    const minMs = refMs - windowDays * 86400000;
    const rows = db.prepare(`SELECT * FROM published_archive ORDER BY published_at DESC`).all();
    return rows.filter(r => {
      const ms = Date.parse(r.published_at);
      return Number.isFinite(ms) ? ms >= minMs && ms <= refMs + 86400000 : true;
    });
  }

  function getJob(jobId) {
    return db.prepare(`SELECT * FROM jobs WHERE job_id = ?`).get(jobId) || null;
  }

  function listJobs(limit = 50) {
    return db.prepare(`SELECT * FROM jobs ORDER BY scheduled_for ASC LIMIT ?`).all(limit);
  }

  function listEvidence(jobId) {
    return db.prepare(`SELECT * FROM evidence_registry WHERE job_id = ? ORDER BY evidence_id ASC`).all(jobId);
  }

  function listAudit(limit = 50) {
    return db.prepare(`SELECT * FROM audit_log ORDER BY id DESC LIMIT ?`).all(limit);
  }

  function exportRegistrySnapshot(outPath) {
    const jobs = listJobs(200);
    const snapshot = {
      exportedAt: new Date().toISOString(),
      flags: db.prepare(`SELECT * FROM system_flags`).all(),
      jobsCount: jobs.length,
      jobs: jobs.map(j => ({
        ...j,
        sources: JSON.parse(j.sources_json),
        qaDetails: JSON.parse(j.qa_details_json),
        evidence: listEvidence(j.job_id),
      })),
    };
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), 'utf8');
    return snapshot;
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
    recordJob,
    recordEvidence,
    recordPublished,
    getRecentArchive,
    getJob,
    listJobs,
    listEvidence,
    listAudit,
    exportRegistrySnapshot,
    close,
  };
}
