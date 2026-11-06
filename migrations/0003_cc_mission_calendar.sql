-- ============================================================================
-- CHRISTIAN CULTURE MISSION CALENDAR v1.1 — D1 / SQLite Schema (CCAL-001..016)
-- Adres docelowy: https://polskieradio.cc/ccMC | API: /api/mission-calendar/*
-- ============================================================================

CREATE TABLE IF NOT EXISTS mc_users (
  id TEXT PRIMARY KEY,
  google_sub TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'coordinator', 'reviewer', 'collaborator')),
  allowed_projects TEXT NOT NULL DEFAULT '["*"]',
  quiet_hours_start TEXT NOT NULL DEFAULT '23:00',
  quiet_hours_end TEXT NOT NULL DEFAULT '07:00',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mc_events (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'local',
  external_id TEXT,
  project_id TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  timezone TEXT NOT NULL DEFAULT 'Europe/Warsaw',
  all_day INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'mission',
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'not_done')),
  not_done_reason TEXT,
  blocked_reason TEXT,
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 4),
  owner_type TEXT NOT NULL DEFAULT 'human',
  assigned_to TEXT,
  requires_approval INTEGER NOT NULL DEFAULT 1,
  review_state TEXT NOT NULL DEFAULT 'none' CHECK (review_state IN ('none', 'awaiting_review', 'approved', 'rejected')),
  result_summary TEXT,
  result_links TEXT NOT NULL DEFAULT '[]',
  rrule TEXT,
  exdates TEXT NOT NULL DEFAULT '[]',
  series_id TEXT,
  occurrence_id TEXT,
  is_private INTEGER NOT NULL DEFAULT 0,
  allow_overlap INTEGER NOT NULL DEFAULT 1,
  lease_owner TEXT,
  lease_until TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_mc_events_starts_at ON mc_events(starts_at);
CREATE INDEX IF NOT EXISTS idx_mc_events_assigned_status ON mc_events(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_mc_events_series ON mc_events(series_id, occurrence_id);

CREATE TABLE IF NOT EXISTS mc_occurrence_overrides (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL,
  occurrence_id TEXT NOT NULL UNIQUE,
  original_start TEXT NOT NULL,
  cancelled INTEGER NOT NULL DEFAULT 0,
  title TEXT,
  description TEXT,
  starts_at TEXT,
  ends_at TEXT,
  status TEXT,
  not_done_reason TEXT,
  assigned_to TEXT,
  review_state TEXT,
  result_summary TEXT,
  updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mc_api_clients (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  scopes TEXT NOT NULL DEFAULT '["events:read"]',
  capabilities TEXT NOT NULL DEFAULT '[]',
  allowed_projects TEXT NOT NULL DEFAULT '["*"]',
  max_parallel INTEGER NOT NULL DEFAULT 3,
  enabled INTEGER NOT NULL DEFAULT 1,
  last_seen TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mc_push_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  endpoint_hash TEXT UNIQUE NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_name TEXT NOT NULL DEFAULT 'Browser',
  preferences TEXT NOT NULL DEFAULT '{"new_task":true,"reminder":true,"overdue":true,"claimed":true,"review":true,"daily_report":true}',
  quiet_hours_start TEXT NOT NULL DEFAULT '23:00',
  quiet_hours_end TEXT NOT NULL DEFAULT '07:00',
  created_at TEXT NOT NULL,
  last_success TEXT
);

CREATE TABLE IF NOT EXISTS mc_audit_log (
  id TEXT PRIMARY KEY,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  before_hash TEXT,
  after_hash TEXT,
  details TEXT NOT NULL DEFAULT '{}',
  correlation_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mc_audit_entity ON mc_audit_log(entity_id, created_at DESC);

CREATE TABLE IF NOT EXISTS mc_outbox (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'dlq')),
  delivery_count INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TEXT NOT NULL,
  last_error TEXT,
  correlation_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mc_outbox_status ON mc_outbox(status, next_attempt_at);
