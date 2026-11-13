-- ============================================================================
-- ARK OF FIRE x CHRISTIAN CULTURE — Konkurs Swiadectw Wiary PL/EN
-- Migracja bazy D1: prywatne zgloszenia, konfiguracja statusu oraz rate limiting
-- Brak losowania (wybor jakosciowy przez Ark of Fire). Zero PII w repozytorium.
-- ============================================================================

CREATE TABLE IF NOT EXISTS ark_contest_entries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  email_hash TEXT NOT NULL UNIQUE,
  tech_hash TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('pl', 'en')),
  answer TEXT NOT NULL,
  accepted_rules INTEGER NOT NULL DEFAULT 0,
  accepted_privacy INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'rejected', 'winner')),
  is_test INTEGER NOT NULL DEFAULT 0,
  decision_date TEXT,
  winner_notified_at TEXT,
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ark_contest_email_hash ON ark_contest_entries(email_hash);
CREATE INDEX IF NOT EXISTS idx_ark_contest_status ON ark_contest_entries(status);
CREATE INDEX IF NOT EXISTS idx_ark_contest_created ON ark_contest_entries(created_at DESC);

CREATE TABLE IF NOT EXISTS ark_contest_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  enabled INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'scheduled', 'open', 'closed', 'judging', 'winner_selected', 'completed')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  winner_announce_date TEXT NOT NULL,
  winner_selected INTEGER NOT NULL DEFAULT 0,
  winner_published INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ark_contest_rate_limits (
  rate_key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  window_start_ms INTEGER NOT NULL
);
