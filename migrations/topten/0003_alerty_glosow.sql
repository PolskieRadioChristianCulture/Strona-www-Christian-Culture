-- ============================================================================
-- topTEN — indeksy dla alertów nietypowych głosów (spec. naturalnej rywalizacji §9, §22)
-- Wersja 1.0.0 • 2026-11-01 • @007 — tylko indeksy, bez zmian danych.
-- ============================================================================
-- Skok głosów na utwór w ostatniej godzinie (odczyt ograniczony do liczby głosów z tej godziny).
CREATE INDEX IF NOT EXISTS idx_topten_events_track_time ON topten_events(track_id, created_at);
-- Wiele kont z tej samej sieci (skrót IP) na ten sam utwór tego samego dnia.
CREATE INDEX IF NOT EXISTS idx_topten_events_net ON topten_events(ip_hash, track_id, local_date);
-- Ograniczenie częstotliwości alertów i ich lista w panelu.
CREATE INDEX IF NOT EXISTS idx_topten_audit_action ON topten_audit_log(action, object_id, ts);
