-- ============================================================================
-- topTEN — naturalna rywalizacja (TOP 10 + Poczekalnia 11–30 + debiuty + archiwum)
-- Spec: TOPTEN_REGULAMIN_NATURALNA_RYWALIZACJA_WDROZENIE_ANTIGRAVITY_CLAUDE.md (§3–§8, §14–§17)
-- Wersja 1.0.0 • 2026-11-01 • @007
-- Migracja wyłącznie DODAJE tabele/kolumny — nie zmienia ani nie usuwa istniejących głosów.
-- Rollback: docs/topten/ROLLBACK_TOPTEN.md (flagi OFF wystarczają; tabele można zostawić).
-- ============================================================================

-- Flagi funkcji (domyślnie WYŁĄCZONE — włącza wyłącznie operator L0 przez panel/API redakcji).
CREATE TABLE IF NOT EXISTS topten_flags (
  name TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0, 1)),
  updated_by TEXT,
  updated_at TEXT
);
INSERT OR IGNORE INTO topten_flags (name, enabled) VALUES
  ('topten_natural_ranking_v1', 0), ('topten_waiting_room_v1', 0), ('topten_archive_v1', 0);

-- Stan utworu w puli: active = w puli tygodnia; queued = zatwierdzony, czeka na najbliższy poniedziałek;
-- archived = poza pulą (historia zachowana); suspended = wstrzymany ze względów prawnych (bez głosów i odtwarzania).
ALTER TABLE topten_tracks ADD COLUMN pool_status TEXT NOT NULL DEFAULT 'active'
  CHECK (pool_status IN ('active', 'queued', 'archived', 'suspended'));
ALTER TABLE topten_tracks ADD COLUMN queued_at TEXT;
ALTER TABLE topten_tracks ADD COLUMN queue_entry TEXT CHECK (queue_entry IS NULL OR queue_entry IN ('debut', 'return'));

-- Tydzień notowania: pon 00:00:00 (włącznie) – następny pon 00:00:00 (wyłącznie), Europe/Warsaw, granice w UTC (DST).
CREATE TABLE IF NOT EXISTS topten_weeks (
  id TEXT PRIMARY KEY,                 -- data poniedziałku (YYYY-MM-DD, Europe/Warsaw)
  start_utc TEXT NOT NULL,
  end_utc TEXT NOT NULL,               -- wyłącznie
  status TEXT NOT NULL CHECK (status IN ('preparing', 'open', 'closing', 'finalized', 'corrected')),
  rules_version TEXT NOT NULL,
  snapshot_version INTEGER NOT NULL DEFAULT 0,
  provisional_reason TEXT,             -- np. głosy wstrzymane do weryfikacji
  finalized_at TEXT,
  checksum TEXT,
  updated_at TEXT NOT NULL
);

-- Aktywna pula tygodnia (maks. 30). Tylko ona przyjmuje głosy, gdy flaga jest włączona.
CREATE TABLE IF NOT EXISTS topten_week_roster (
  week_id TEXT NOT NULL REFERENCES topten_weeks(id),
  track_id TEXT NOT NULL REFERENCES topten_tracks(id),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('carryover', 'debut', 'return', 'legacy')),
  entry_at TEXT NOT NULL,
  PRIMARY KEY (week_id, track_id)
);

-- Niezmienny snapshot oficjalnych wyników (każda korekta = nowa wersja).
CREATE TABLE IF NOT EXISTS topten_week_standings (
  week_id TEXT NOT NULL REFERENCES topten_weeks(id),
  version INTEGER NOT NULL,
  track_id TEXT NOT NULL,
  rank INTEGER NOT NULL,
  bucket TEXT NOT NULL CHECK (bucket IN ('top10', 'waiting')),
  points INTEGER NOT NULL,
  likes INTEGER NOT NULL,
  boosts INTEGER NOT NULL,
  unique_like_voters INTEGER NOT NULL,
  reached_at INTEGER,
  title TEXT NOT NULL,                 -- utrwalone dla archiwum (nawet po zmianie danych utworu)
  artist TEXT NOT NULL,
  computed_at TEXT NOT NULL,
  PRIMARY KEY (week_id, version, track_id)
);
CREATE INDEX IF NOT EXISTS idx_topten_standings_track ON topten_week_standings(track_id, week_id);

CREATE TABLE IF NOT EXISTS topten_awards (
  week_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  award_type TEXT NOT NULL CHECK (award_type IN ('hit', 'biggest_climb', 'debut', 'comeback', 'record')),
  track_id TEXT NOT NULL,
  explanation TEXT NOT NULL,
  rules_version TEXT NOT NULL,
  computed_at TEXT NOT NULL,
  PRIMARY KEY (week_id, version, award_type)
);

CREATE TABLE IF NOT EXISTS topten_roster_transitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  track_id TEXT NOT NULL,
  week_from TEXT,
  week_to TEXT NOT NULL,
  from_bucket TEXT,                    -- top10 | waiting | queue | archive | null
  to_bucket TEXT NOT NULL,             -- top10_or_waiting | archive | suspended
  reason TEXT NOT NULL,                -- carryover | new_debut_slot | debut | return | displaced_by_debut | rights_hold | legacy_bootstrap
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS topten_song_archive (
  track_id TEXT PRIMARY KEY,
  archived_at_week TEXT NOT NULL,      -- ostatni tydzień w puli
  eligible_from_week TEXT NOT NULL,    -- najwcześniejszy tydzień ponownego startu (po 4 pełnych zamkniętych tygodniach)
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Liczniki inkrementalne (spec §17): ranking czyta kilkadziesiąt wierszy zamiast wszystkich głosów tygodnia
-- (ochrona darmowego limitu odczytów D1). Źródłem prawdy pozostaje topten_events; liczniki aktualizują
-- wyzwalacze w tej samej operacji co zapis/zmiana głosu, a /api/topten/admin/totals/rebuild je rekoncyliuje.
CREATE TABLE IF NOT EXISTS topten_week_totals (
  cycle_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  boosts INTEGER NOT NULL DEFAULT 0,
  voters INTEGER NOT NULL DEFAULT 0,               -- unikalni głosujący (dowolna akcja)
  unique_like_voters INTEGER NOT NULL DEFAULT 0,   -- unikalni głosujący LubięTO (remisy §6)
  last_at INTEGER,                                 -- moment ostatniego ważnego głosu (osiągnięcie wyniku)
  PRIMARY KEY (cycle_id, track_id)
);

INSERT OR REPLACE INTO topten_week_totals (cycle_id, track_id, points, likes, boosts, voters, unique_like_voters, last_at)
SELECT cycle_id, track_id, SUM(points), SUM(action = 'like'), SUM(action = 'boost'), COUNT(DISTINCT user_id),
  COUNT(DISTINCT CASE WHEN action = 'like' THEN user_id END), MAX(created_at)
FROM topten_events WHERE review_status = 'ok' GROUP BY cycle_id, track_id;

CREATE TRIGGER IF NOT EXISTS topten_totals_on_vote AFTER INSERT ON topten_events WHEN NEW.review_status = 'ok'
BEGIN
  INSERT INTO topten_week_totals (cycle_id, track_id, points, likes, boosts, voters, unique_like_voters, last_at)
  VALUES (NEW.cycle_id, NEW.track_id, NEW.points, NEW.action = 'like', NEW.action = 'boost', 1, NEW.action = 'like', NEW.created_at)
  ON CONFLICT (cycle_id, track_id) DO UPDATE SET
    points = points + NEW.points,
    likes = likes + (NEW.action = 'like'),
    boosts = boosts + (NEW.action = 'boost'),
    voters = voters + NOT EXISTS (SELECT 1 FROM topten_events e WHERE e.user_id = NEW.user_id AND e.track_id = NEW.track_id
      AND e.cycle_id = NEW.cycle_id AND e.review_status = 'ok' AND e.id != NEW.id),
    unique_like_voters = unique_like_voters + (NEW.action = 'like' AND NOT EXISTS (SELECT 1 FROM topten_events e WHERE e.user_id = NEW.user_id
      AND e.track_id = NEW.track_id AND e.cycle_id = NEW.cycle_id AND e.action = 'like' AND e.review_status = 'ok' AND e.id != NEW.id)),
    last_at = MAX(COALESCE(last_at, 0), NEW.created_at);
END;

-- Wstrzymanie/unieważnienie/przywrócenie głosu: przeliczenie jednego wiersza (utwór × tydzień) z dziennika zdarzeń.
CREATE TRIGGER IF NOT EXISTS topten_totals_on_review AFTER UPDATE OF review_status ON topten_events
WHEN OLD.review_status != NEW.review_status
BEGIN
  INSERT INTO topten_week_totals (cycle_id, track_id, points, likes, boosts, voters, unique_like_voters, last_at)
  SELECT NEW.cycle_id, NEW.track_id, COALESCE(SUM(points), 0), COALESCE(SUM(action = 'like'), 0), COALESCE(SUM(action = 'boost'), 0),
    COUNT(DISTINCT user_id), COUNT(DISTINCT CASE WHEN action = 'like' THEN user_id END), MAX(created_at)
  FROM topten_events WHERE cycle_id = NEW.cycle_id AND track_id = NEW.track_id AND review_status = 'ok'
  ON CONFLICT (cycle_id, track_id) DO UPDATE SET points = excluded.points, likes = excluded.likes, boosts = excluded.boosts,
    voters = excluded.voters, unique_like_voters = excluded.unique_like_voters, last_at = excluded.last_at;
END;

-- Nienaruszalność historii: snapshoty i wyróżnienia tylko do dopisywania.
CREATE TRIGGER IF NOT EXISTS topten_standings_no_update BEFORE UPDATE ON topten_week_standings
BEGIN SELECT RAISE(ABORT, 'standings snapshot is immutable'); END;
CREATE TRIGGER IF NOT EXISTS topten_standings_no_delete BEFORE DELETE ON topten_week_standings
BEGIN SELECT RAISE(ABORT, 'standings snapshot is immutable'); END;
CREATE TRIGGER IF NOT EXISTS topten_awards_no_update BEFORE UPDATE ON topten_awards
BEGIN SELECT RAISE(ABORT, 'awards are immutable'); END;
CREATE TRIGGER IF NOT EXISTS topten_awards_no_delete BEFORE DELETE ON topten_awards
BEGIN SELECT RAISE(ABORT, 'awards are immutable'); END;
CREATE TRIGGER IF NOT EXISTS topten_transitions_no_delete BEFORE DELETE ON topten_roster_transitions
BEGIN SELECT RAISE(ABORT, 'transitions are append-only'); END;
