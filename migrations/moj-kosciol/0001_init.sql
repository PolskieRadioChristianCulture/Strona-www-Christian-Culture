-- ============================================================================
-- Mój kościół — Scrolluj Biblię v2.0 (Cloudflare D1 / SQLite)
-- Model danych niezależny od wyznania • Pilot KADS • Izolacja tenantów
-- ZERO COST FIRST • Brak przechowywania kwot darów • Prywatne notatki izolowane
-- ============================================================================

CREATE TABLE IF NOT EXISTS mk_licenses (
  id TEXT PRIMARY KEY,
  source_url TEXT NOT NULL,
  rights_holder TEXT NOT NULL,
  license TEXT NOT NULL,
  allowed_uses_json TEXT NOT NULL DEFAULT '["metadata","official_link"]',
  reviewed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mk_churches (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  denomination TEXT NOT NULL,
  district TEXT NOT NULL DEFAULT '',
  public_address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'PL',
  timezone TEXT NOT NULL DEFAULT 'Europe/Warsaw',
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'suspended')),
  is_demo INTEGER NOT NULL DEFAULT 0,
  contacts_json TEXT NOT NULL DEFAULT '{}',
  accessibility_json TEXT NOT NULL DEFAULT '{}',
  links_json TEXT NOT NULL DEFAULT '{}',
  first_visit_json TEXT NOT NULL DEFAULT '{}',
  schedule_summary TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mk_churches_slug ON mk_churches(slug);
CREATE INDEX IF NOT EXISTS idx_mk_churches_city ON mk_churches(city);

CREATE TABLE IF NOT EXISTS mk_memberships (
  church_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL
    CHECK (role IN ('owner', 'admin', 'editor', 'live_leader', 'treasurer', 'observer')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('invited', 'active', 'revoked')),
  invited_by TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (church_id, user_id),
  FOREIGN KEY (church_id) REFERENCES mk_churches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mk_services (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL,
  title TEXT NOT NULL,
  service_date TEXT NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Warsaw',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'live', 'paused', 'completed', 'cancelled')),
  template_id TEXT NOT NULL DEFAULT 'sabbath-full',
  revision INTEGER NOT NULL DEFAULT 1,
  visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'members', 'private')),
  post_service_events_json TEXT NOT NULL DEFAULT '[]',
  history_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (church_id) REFERENCES mk_churches(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mk_services_church ON mk_services(church_id, start_at);

CREATE TABLE IF NOT EXISTS mk_agenda_items (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  church_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  planned_start TEXT NOT NULL DEFAULT '',
  planned_duration INTEGER NOT NULL DEFAULT 10,
  actual_start TEXT,
  actual_end TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'active', 'completed', 'skipped')),
  person_refs_json TEXT NOT NULL DEFAULT '[]',
  bible_refs_json TEXT NOT NULL DEFAULT '[]',
  hymn_refs_json TEXT NOT NULL DEFAULT '[]',
  resource_refs_json TEXT NOT NULL DEFAULT '[]',
  sermon_meta_json TEXT,
  public_description TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (service_id) REFERENCES mk_services(id) ON DELETE CASCADE,
  FOREIGN KEY (church_id) REFERENCES mk_churches(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mk_agenda_service ON mk_agenda_items(service_id, position);

CREATE TABLE IF NOT EXISTS mk_live_states (
  service_id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL,
  active_item_id TEXT,
  status TEXT NOT NULL DEFAULT 'idle'
    CHECK (status IN ('idle', 'live', 'paused', 'completed')),
  revision INTEGER NOT NULL DEFAULT 1,
  time_offset_minutes INTEGER NOT NULL DEFAULT 0,
  updated_by TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  FOREIGN KEY (service_id) REFERENCES mk_services(id) ON DELETE CASCADE,
  FOREIGN KEY (church_id) REFERENCES mk_churches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mk_announcements (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'ogloszenia',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  pinned INTEGER NOT NULL DEFAULT 0,
  publish_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'members')),
  moderation_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (moderation_status IN ('pending', 'approved', 'hidden')),
  created_by TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (church_id) REFERENCES mk_churches(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mk_announcements_church ON mk_announcements(church_id, publish_at, expires_at);

CREATE TABLE IF NOT EXISTS mk_giving_targets (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL,
  category TEXT NOT NULL
    CHECK (category IN ('tithe', 'local_church', 'sabbath_school', 'mission', 'other_approved')),
  beneficiary TEXT NOT NULL,
  iban TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PLN',
  transfer_title TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT '',
  confirmation_source TEXT NOT NULL DEFAULT '',
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('unverified', 'pending_second_approval', 'verified', 'suspended')),
  first_approver_id TEXT,
  second_approver_id TEXT,
  verified_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (church_id) REFERENCES mk_churches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mk_private_notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  church_id TEXT NOT NULL DEFAULT '',
  service_id TEXT NOT NULL DEFAULT '',
  item_id TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mk_private_notes_user ON mk_private_notes(user_id, service_id);

CREATE TABLE IF NOT EXISTS mk_study_groups (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL,
  label TEXT NOT NULL,
  group_type TEXT NOT NULL DEFAULT 'adult'
    CHECK (group_type IN ('adult', 'youth', 'language', 'mixed')),
  locale TEXT NOT NULL DEFAULT 'pl',
  meeting_place TEXT NOT NULL DEFAULT '',
  leader_ref TEXT NOT NULL DEFAULT '',
  leader_consent INTEGER NOT NULL DEFAULT 0,
  schedule_text TEXT NOT NULL DEFAULT '10:00–10:45',
  visibility TEXT NOT NULL DEFAULT 'public',
  FOREIGN KEY (church_id) REFERENCES mk_churches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mk_lesson_sessions (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL,
  agenda_item_id TEXT NOT NULL DEFAULT '',
  lesson_ref_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  active_section_ref TEXT NOT NULL DEFAULT 'saturday',
  revision INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  FOREIGN KEY (church_id) REFERENCES mk_churches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mk_personal_study_progress (
  user_id TEXT NOT NULL,
  lesson_ref_id TEXT NOT NULL,
  completed_days_json TEXT NOT NULL DEFAULT '[]',
  private_notes TEXT NOT NULL DEFAULT '',
  custom_questions_json TEXT NOT NULL DEFAULT '[]',
  bookmarks_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, lesson_ref_id)
);

CREATE TABLE IF NOT EXISTS mk_events (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'wydarzenia',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Warsaw',
  recurrence TEXT NOT NULL DEFAULT 'none',
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  cancel_reason TEXT NOT NULL DEFAULT '',
  capacity INTEGER,
  online_url TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'public',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (church_id) REFERENCES mk_churches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mk_event_rsvps (
  event_id TEXT NOT NULL,
  church_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  response TEXT NOT NULL CHECK (response IN ('yes', 'no', 'maybe')),
  guests_count INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (event_id, user_id),
  FOREIGN KEY (event_id) REFERENCES mk_events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mk_church_follows (
  user_id TEXT NOT NULL,
  church_id TEXT NOT NULL,
  is_preferred INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, church_id)
);

CREATE TABLE IF NOT EXISTS mk_notification_preferences (
  user_id TEXT NOT NULL,
  church_id TEXT NOT NULL,
  categories_json TEXT NOT NULL DEFAULT '{"service_new":true,"time_change":true,"announcement":false,"lesson":false,"event":false,"financial":false}',
  quiet_hours_start TEXT NOT NULL DEFAULT '22:00',
  quiet_hours_end TEXT NOT NULL DEFAULT '07:00',
  worship_dnd INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, church_id)
);

CREATE TABLE IF NOT EXISTS mk_volunteer_opportunities (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'wolontariat',
  description TEXT NOT NULL,
  contact_mode TEXT NOT NULL DEFAULT 'form_only',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  FOREIGN KEY (church_id) REFERENCES mk_churches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mk_prayer_requests (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  body TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private_team'
    CHECK (visibility IN ('private_team', 'public_moderated')),
  public_consent INTEGER NOT NULL DEFAULT 0,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'approved', 'withdrawn', 'rejected')),
  ai_allowed INTEGER NOT NULL DEFAULT 0 CHECK (ai_allowed = 0),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (church_id) REFERENCES mk_churches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mk_moderation_reports (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  reporter_id TEXT NOT NULL DEFAULT 'anonymous',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mk_audit_logs (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mk_audit_church ON mk_audit_logs(church_id, created_at);
