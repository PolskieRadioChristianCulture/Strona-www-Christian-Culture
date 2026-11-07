-- ============================================================================
-- CHRISTIAN CULTURE MISSION CALENDAR — CANONICAL ROUTINES SEED (/automation)
-- Inwentaryzacja 12 kluczowych rutyn operacyjnych ekosystemu Christian Culture
-- ============================================================================

INSERT INTO mc_events (
  id, source, project_id, title, description, starts_at, ends_at, timezone,
  all_day, category, status, priority, owner_type, assigned_to, requires_approval,
  review_state, result_links, rrule, exdates, is_private, allow_overlap,
  version, created_by, updated_by, created_at, updated_at
) VALUES 
(
  'rt_dzj_morning', 'automation', 'general', 'Publikacja Rozważań DZJ & Strony WWW',
  'Publikacja porannego rozważania „Dobrze, że jesteś” w aplikacji Android, na stronach WWW oraz w bazie Firebase (reflections). Wysyłka treści do Bartka na WhatsApp.',
  '2026-11-01T06:00:00+01:00', '2026-11-01T06:30:00+01:00', 'Europe/Warsaw',
  0, 'mission', 'todo', 1, 'agent', 'Joshua', 1,
  'none', '[]', 'FREQ=DAILY', '[]', 0, 1,
  1, 'system:automation', 'system:automation', '2026-11-07T06:00:00+01:00', '2026-11-07T06:00:00+01:00'
),
(
  'rt_kc_daily', 'automation', 'general', 'Akademia Biblijna — Publikacja Lekcji Kursu Codziennego',
  'Publikacja nowej lekcji Kursu Codziennego „Z Biblią za Pan Brat” na polskieradio.cc/akademia#kurscodzienny oraz w 4 ścieżkach Clean Routing. Aktualizacja przycisków Hero.',
  '2026-11-01T06:30:00+01:00', '2026-11-01T07:00:00+01:00', 'Europe/Warsaw',
  0, 'mission', 'todo', 1, 'agent', 'Antigravity', 1,
  'none', '[]', 'FREQ=DAILY', '[]', 0, 1,
  1, 'system:automation', 'system:automation', '2026-11-07T06:00:00+01:00', '2026-11-07T06:00:00+01:00'
),
(
  'rt_nazir_whatsapp', 'automation', 'general', 'Dedykowana Wysyłka Grupy Nazira (WhatsApp)',
  'Priorytetowa wysyłka 3 osobnych wiadomości (1. Poranna TTS, 2. Na cały dzień WWW, 3. Wieczorna SMS) do Grupy Nazira na WhatsAppie.',
  '2026-11-01T07:00:00+01:00', '2026-11-01T07:15:00+01:00', 'Europe/Warsaw',
  0, 'social', 'todo', 1, 'agent', 'Joshua', 1,
  'none', '[]', 'FREQ=DAILY', '[]', 0, 1,
  1, 'system:automation', 'system:automation', '2026-11-07T06:00:00+01:00', '2026-11-07T06:00:00+01:00'
),
(
  'rt_wa_am_roundrobin', 'automation', 'general', 'Rotacyjna Dystrybucja WhatsApp — Poranek',
  'Dystrybucja wersji WWW rozważania (z linkami i numerami cyfrowymi) do grup WhatsApp w trybie rotacji FIFO round-robin (po 2 grupy).',
  '2026-11-01T10:00:00+01:00', '2026-11-01T11:00:00+01:00', 'Europe/Warsaw',
  0, 'social', 'todo', 2, 'agent', 'Joshua', 1,
  'none', '[]', 'FREQ=DAILY', '[]', 0, 1,
  1, 'system:automation', 'system:automation', '2026-11-07T06:00:00+01:00', '2026-11-07T06:00:00+01:00'
),
(
  'rt_biblia_audio_mastering', 'automation', 'biblia-audio', 'Produkcja i Mastering Biblia Audio CC STUDIO',
  'Nagranie, synteza TTS Gemini, montaż wielościeżkowy DAW, mastering radiowy (-16 LUFS) oraz publikacja MP3 do polskieradio.cc/biblia-audio.',
  '2026-11-01T12:00:00+01:00', '2026-11-01T13:30:00+01:00', 'Europe/Warsaw',
  0, 'radio', 'todo', 2, 'agent', 'CCStudio', 1,
  'none', '[]', 'FREQ=DAILY', '[]', 0, 1,
  1, 'system:automation', 'system:automation', '2026-11-07T06:00:00+01:00', '2026-11-07T06:00:00+01:00'
),
(
  'rt_sds_video_factory', 'automation', 'shorts-factory', 'Fabryka Wideo & Shorts SDS (Studio Dobrego Słowa)',
  'Montaż wideo 4K DaVinci Resolve dla serii wykładów Apokalipsa oraz formatów Shorts/Reels 9:16.',
  '2026-11-01T14:00:00+01:00', '2026-11-01T15:30:00+01:00', 'Europe/Warsaw',
  0, 'media', 'todo', 2, 'agent', 'Visual Director', 1,
  'none', '[]', 'FREQ=DAILY', '[]', 0, 1,
  1, 'system:automation', 'system:automation', '2026-11-07T06:00:00+01:00', '2026-11-07T06:00:00+01:00'
),
(
  'rt_wa_pm_roundrobin', 'automation', 'general', 'Rotacyjna Dystrybucja WhatsApp — Popołudnie',
  'Popołudniowa transza dystrybucji treści na kolejne grupy WhatsApp z zachowaniem zasady Anti-Backlog.',
  '2026-11-01T16:00:00+01:00', '2026-11-01T17:00:00+01:00', 'Europe/Warsaw',
  0, 'social', 'todo', 2, 'agent', 'Joshua', 1,
  'none', '[]', 'FREQ=DAILY', '[]', 0, 1,
  1, 'system:automation', 'system:automation', '2026-11-07T06:00:00+01:00', '2026-11-07T06:00:00+01:00'
),
(
  'rt_sms_evening', 'automation', 'general', 'Wieczorna Subskrypcja SMS (Wysyłka Bartka)',
  'Przygotowanie i wysyłka wieczornej wersji rozważania do abonentów subskrypcji SMS.',
  '2026-11-01T19:00:00+01:00', '2026-11-01T19:30:00+01:00', 'Europe/Warsaw',
  0, 'social', 'todo', 2, 'agent', 'Joshua', 1,
  'none', '[]', 'FREQ=DAILY', '[]', 0, 1,
  1, 'system:automation', 'system:automation', '2026-11-07T06:00:00+01:00', '2026-11-07T06:00:00+01:00'
),
(
  'rt_smcc_guard_audit', 'automation', 'general', 'Strażnik Kodu (SMCC) — Audyt Zero-QA & Raport JOMA',
  'Uruchomienie testów regresji (test:guardian, test:mobile-premium, test:cc-regression), weryfikacja integralności ekosystemu i aktualizacja wspólnej pamięci JOMA.',
  '2026-11-01T21:00:00+01:00', '2026-11-01T21:45:00+01:00', 'Europe/Warsaw',
  0, 'guardian', 'todo', 1, 'agent', 'Strażnik', 1,
  'none', '[]', 'FREQ=DAILY', '[]', 0, 1,
  1, 'system:automation', 'system:automation', '2026-11-07T06:00:00+01:00', '2026-11-07T06:00:00+01:00'
),
(
  'rt_sabbath_eve', 'automation', 'general', 'Rozpoczęcie Sabatu — Audycja „Bądź Blisko” & Modlitwa',
  'Emisja programu szabatowego, wyciszenie tygodnia, modlitwa Sabatu (Wj 20:8-11), uruchomienie streamu radiowego Worship.',
  '2026-11-06T17:30:00+01:00', '2026-11-06T19:00:00+01:00', 'Europe/Warsaw',
  0, 'radio', 'todo', 1, 'agent', 'Antigravity', 1,
  'none', '[]', 'FREQ=WEEKLY;BYDAY=FR', '[]', 0, 1,
  1, 'system:automation', 'system:automation', '2026-11-07T06:00:00+01:00', '2026-11-07T06:00:00+01:00'
),
(
  'rt_sabbath_live', 'automation', 'obs-live', 'Nabożeństwo Sabatowe LIVE — Scena OBS & Transmisja',
  'Uroczysta transmisja nabożeństwa sobotniego, transmisja sygnału na żywo, studio OBS stream-scene.html.',
  '2026-11-07T10:00:00+01:00', '2026-11-07T12:30:00+01:00', 'Europe/Warsaw',
  0, 'tech', 'todo', 1, 'agent', 'Joshua', 1,
  'none', '[]', 'FREQ=WEEKLY;BYDAY=SA', '[]', 0, 1,
  1, 'system:automation', 'system:automation', '2026-11-07T06:00:00+01:00', '2026-11-07T06:00:00+01:00'
),
(
  'rt_weekly_briefing', 'automation', 'general', 'Odprawa Tygodniowa Orkiestry Agentów @777',
  'Przegląd celów tygodniowych, statusów zadań, synchronizacja repozytoriów i harmonogramu wydań.',
  '2026-11-02T09:00:00+01:00', '2026-11-02T10:00:00+01:00', 'Europe/Warsaw',
  0, 'agents', 'todo', 2, 'agent', 'Noemi @077', 1,
  'none', '[]', 'FREQ=WEEKLY;BYDAY=MO', '[]', 0, 1,
  1, 'system:automation', 'system:automation', '2026-11-07T06:00:00+01:00', '2026-11-07T06:00:00+01:00'
)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  description = excluded.description,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  rrule = excluded.rrule,
  assigned_to = excluded.assigned_to,
  priority = excluded.priority,
  category = excluded.category,
  updated_at = excluded.updated_at;
