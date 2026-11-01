-- ============================================================================
-- topTEN Christian Culture — schemat Cloudflare D1 (SQLite), binding: topten_db
-- Spec: docs/TOPTEN_WSPIERAMTO_SPECYFIKACJA_ETAP_II.md (§2, §3, §4, §8, §11)
-- Wersja 1.0.0 • 2026-11-01 • @007
-- ============================================================================

-- Utwory dopuszczone do notowania (tylko status 'published' trafia na listę).
CREATE TABLE IF NOT EXISTS topten_tracks (
  id TEXT PRIMARY KEY,                       -- = identyfikator nominacji CC-TT-YYYY-NNNN
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT NOT NULL,
  language TEXT,
  bible_ref TEXT,
  youtube_id TEXT,
  cover_url TEXT,
  profile_url TEXT,
  support_json TEXT NOT NULL DEFAULT '[]',   -- [{method,value,url?,copy?}]
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'takedown')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Zgłoszenia z formularza /topTEN/nominacje.
CREATE TABLE IF NOT EXISTS topten_nominations (
  id TEXT PRIMARY KEY,                       -- CC-TT-YYYY-NNNN
  seq INTEGER NOT NULL UNIQUE,
  artist TEXT NOT NULL,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  language TEXT NOT NULL,
  bible_ref TEXT NOT NULL,
  drive_url TEXT NOT NULL,
  youtube_url TEXT,
  support_url TEXT,
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  submitter_uid TEXT,
  rights_declared INTEGER NOT NULL CHECK (rights_declared = 1),
  license_granted INTEGER NOT NULL CHECK (license_granted = 1),
  rules_accepted INTEGER NOT NULL CHECK (rules_accepted = 1),
  license_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'awaiting_media', 'theological_review', 'rights_review',
    'approved', 'published', 'rejected', 'withdrawn', 'takedown')),
  decision_note TEXT,                        -- wewnętrzny zapis decyzji (niepubliczny)
  reviewer TEXT,
  reviewed_at TEXT,
  mail_status TEXT NOT NULL DEFAULT 'pending' CHECK (mail_status IN ('pending', 'sent', 'failed')),
  mail_attempts INTEGER NOT NULL DEFAULT 0,
  ip_hash TEXT,
  submitted_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_topten_nom_status ON topten_nominations(status, submitted_at);
CREATE INDEX IF NOT EXISTS idx_topten_nom_ip ON topten_nominations(ip_hash, submitted_at);

-- Append-only zdarzenia punktowe. Limity wymuszane unikalnością (slot) w jednej instrukcji INSERT…SELECT.
-- LubięTO: slot = 0 (1x na dobę Europe/Warsaw). PodbijTO: slot 1..7 (max 7 na dobę, ≥60 min odstępu).
CREATE TABLE IF NOT EXISTS topten_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  track_id TEXT NOT NULL REFERENCES topten_tracks(id),
  cycle_id TEXT NOT NULL,                    -- poniedziałek cyklu (YYYY-MM-DD, Europe/Warsaw)
  local_date TEXT NOT NULL,                  -- doba kalendarzowa Europe/Warsaw
  action TEXT NOT NULL CHECK (action IN ('like', 'boost')),
  slot INTEGER NOT NULL CHECK (slot BETWEEN 0 AND 7),
  points INTEGER NOT NULL,
  created_at INTEGER NOT NULL,               -- ms (czas serwera)
  idempotency_key TEXT NOT NULL UNIQUE,
  review_status TEXT NOT NULL DEFAULT 'ok' CHECK (review_status IN ('ok', 'held', 'void')),
  ip_hash TEXT,
  UNIQUE (user_id, track_id, local_date, action, slot)
);
CREATE INDEX IF NOT EXISTS idx_topten_events_cycle ON topten_events(cycle_id, track_id);
CREATE INDEX IF NOT EXISTS idx_topten_events_user ON topten_events(user_id, track_id, local_date);

-- Obserwowanie utworów (§8).
CREATE TABLE IF NOT EXISTS topten_follows (
  user_id TEXT NOT NULL,
  track_id TEXT NOT NULL REFERENCES topten_tracks(id),
  last_rank INTEGER,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, track_id)
);

-- Subskrypcje Web Push (bez treści — powiadomienie pobierane przez service worker).
CREATE TABLE IF NOT EXISTS topten_push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_topten_push_user ON topten_push_subscriptions(user_id);

CREATE TABLE IF NOT EXISTS topten_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  local_date TEXT NOT NULL,
  delivered INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_topten_notif_user ON topten_notifications(user_id, local_date);

-- Log audytowy append-only.
CREATE TABLE IF NOT EXISTS topten_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  object_id TEXT,
  details TEXT,
  ts TEXT NOT NULL
);
CREATE TRIGGER IF NOT EXISTS topten_audit_no_update BEFORE UPDATE ON topten_audit_log
BEGIN SELECT RAISE(ABORT, 'audit log is append-only'); END;
CREATE TRIGGER IF NOT EXISTS topten_audit_no_delete BEFORE DELETE ON topten_audit_log
BEGIN SELECT RAISE(ABORT, 'audit log is append-only'); END;
CREATE TRIGGER IF NOT EXISTS topten_events_no_delete BEFORE DELETE ON topten_events
BEGIN SELECT RAISE(ABORT, 'events are append-only'); END;

-- Pierwsza prawdziwa nominacja (nominacja własna artysty, decyzja L0 z 01.11.2026).
INSERT OR IGNORE INTO topten_tracks (id, title, artist, genre, language, bible_ref, youtube_id, cover_url, profile_url, support_json, status, created_at, updated_at)
VALUES ('CC-TT-2026-0001', 'Cokolwiek na świecie (Rzymian 8:38-39)', 'Cezary Rogowski · CC Men', 'worship', 'polski',
  'Rz 8:38-39 — Męska odpowiedź na trwogę', 'hVzNQqF_myg', 'https://i.ytimg.com/vi/hVzNQqF_myg/hqdefault.jpg',
  'https://polskieradio.cc/CezaryRogowski',
  '[{"method":"BLIK na telefon","value":"537 137 043","copy":"537137043"},{"method":"Revolut","value":"revolut.me/christianculture","url":"https://revolut.me/christianculture"}]',
  'published', '2026-11-01T00:00:00Z', '2026-11-01T00:00:00Z');
INSERT OR IGNORE INTO topten_nominations (id, seq, artist, title, genre, language, bible_ref, drive_url, youtube_url, support_url,
  submitter_name, submitter_email, rights_declared, license_granted, rules_accepted, license_version, status, decision_note, reviewer, reviewed_at, mail_status, submitted_at)
VALUES ('CC-TT-2026-0001', 1, 'Cezary Rogowski · CC Men', 'Cokolwiek na świecie (Rzymian 8:38-39)', 'worship', 'polski',
  'Rz 8:38-39', '-', 'https://youtu.be/hVzNQqF_myg', 'https://revolut.me/christianculture',
  'Cezary Rogowski', 'radiochristianculture@gmail.com', 1, 1, 1, '2026-11-01', 'published',
  'Nominacja własna L0 w czacie z @007, 01.11.2026', 'L0', '2026-11-01T00:00:00Z', 'sent', '2026-11-01T00:00:00Z');
