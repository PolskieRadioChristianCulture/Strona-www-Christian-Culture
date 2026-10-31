# MAPOWANIE DANYCH I SCHEMATY PAMIĘCI (DATA MAPPING) — CCRE
**Dokument:** `docs/ccre/02-data-mapping.md`  
**Wersja:** 1.0 (2026-10-31)  
**Autor:** Antigravity (@001) / Konsultacja: @005, @777  
**Status:** DOKUMENTACJA TECHNICZNA  

---

## 1. Architektura Danych: Podwójna Warstwa Pamięci

Silnik CC Relationship Engine (CCRE) opiera się na dwóch uzupełniających się warstwach danych:
1. **Warstwa Klienta (LocalStorage):** 100% anonimowa, prywatna, zero-latency, zero-egress. Przechowuje stan odwiedzin, postęp odtwarzania/czytania oraz flagi wygaszania komunikatów powitalnych.
2. **Warstwa Brzegowa (Cloudflare D1 & Workers):** Opcjonalna, służy wyłącznie do anonimowych zliczeń agregowanych, zapisu newslettera oraz moderowanych zgłoszeń społeczności (M7).

---

## 2. Schematy Pamięci Klienta (LocalStorage)

### 2.1 Klucz: `cc_warm_welcome_v1`
Przechowuje stan modułu powitalnego (Warm Welcome M8).
```typescript
interface WarmWelcomeState {
  version: 1;
  lastShownAt: number | null;       // Timestamp ostatniego wyświetlenia (ms)
  dismissedForever: boolean;        // Czy kliknięto "Nie pokazuj więcej"
  impressionCount: number;          // Liczba dotychczasowych odsłon
  firstSeenAt: number;              // Timestamp pierwszej wizyty (ms)
}
```
*Przykład w JSON:*
```json
{
  "version": 1,
  "lastShownAt": 1761928800000,
  "dismissedForever": false,
  "impressionCount": 2,
  "firstSeenAt": 1761842400000
}
```

### 2.2 Klucz: `cc_progress_state_v1`
Przechowuje postęp odtwarzania audycji, rozdziałów Biblii Audio i czytania artykułów (M3).
```typescript
interface ContentProgressItem {
  contentId: string;                // np. "ba_gen_001", "kc_day_19", "ccn_art_102"
  contentType: 'audio' | 'video' | 'article' | 'lesson';
  title: string;                    // Tytuł treści dla widgetu wznowienia
  url: string;                      // Kanoniczny URL do wznowienia
  positionSeconds?: number;         // Dla audio/video: pozycja w sekundach
  durationSeconds?: number;         // Dla audio/video: całkowity czas trwania
  percentage: number;               // 0-100% (np. postęp scrolla w artykule lub % audio)
  updatedAt: number;                // Timestamp ostatniej aktualizacji (ms)
  completed: boolean;               // Czy oznaczono jako ukończone (>90% lub przycisk)
}

interface ProgressState {
  version: 1;
  items: Record<string, ContentProgressItem>; // Maksymalnie 50 najnowszych pozycji (LRU)
  lastActiveId: string | null;      // Ostatnio odtwarzana/czytana pozycja
}
```

### 2.3 Klucz: `cc_library_bookmarks_v1`
Przechowuje zakładki i materiały zapisane „Na później” (M4).
```typescript
interface BookmarkItem {
  id: string;
  type: 'chapter' | 'article' | 'song' | 'prayer';
  title: string;
  url: string;
  savedAt: number;
}

interface BookmarksState {
  version: 1;
  items: BookmarkItem[];            // Maksymalnie 100 pozycji
}
```

---

## 3. Schematy Bazy Brzegowej (Cloudflare D1 SQLite)

Dla modułów serwerowych (Newsletter, Moderacja Społeczności M7, Agregaty Retencji M6) stosujemy tabele w D1:

```sql
-- 1. Zgłoszenia społeczności (M7: Świadectwa, prozycje tematów)
CREATE TABLE IF NOT EXISTS ccre_community_submissions (
    id TEXT PRIMARY KEY,               -- UUID v4
    category TEXT NOT NULL,           -- 'topic_suggestion', 'testimony', 'prayer_intent'
    content TEXT NOT NULL,            -- Treść zgłoszenia (sanitized)
    author_alias TEXT,                -- Opcjonalny pseudonim / imię
    contact_email TEXT,               -- Opcjonalny e-mail (szyfrowany lub hash)
    status TEXT DEFAULT 'pending',    -- 'pending', 'approved', 'rejected', 'archived'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moderated_at TIMESTAMP,
    moderated_by TEXT
);

-- 2. Agregowane metryki retencji bez identyfikacji personalnej (M6)
CREATE TABLE IF NOT EXISTS ccre_daily_aggregates (
    metric_date DATE PRIMARY KEY,      -- YYYY-MM-DD
    total_page_views INTEGER DEFAULT 0,
    unique_sessions_estimated INTEGER DEFAULT 0,
    audio_plays_started INTEGER DEFAULT 0,
    audio_plays_completed INTEGER DEFAULT 0,
    warm_welcome_impressions INTEGER DEFAULT 0,
    warm_welcome_dismissals INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Normalizacja Modelu CCRE Content Item (M1)

Wszystkie zasoby z `cc-search-index.json`, `biblia-audio/data/catalog.json` i `data/ccn-article-routes.js` są mapowane do jednolitej struktury:

```typescript
interface CCREContentItem {
  id: string;                       // Unikalny identyfikator CCRE (np. "ccre_ba_gen_01")
  title: string;                    // Tytuł
  subtitle?: string;                // Podtytuł / zajawka
  category: 'audio' | 'bible' | 'article' | 'course' | 'video' | 'prayer';
  url: string;                      // Bezwzględny lub względny link w polskieradio.cc
  thumbnailUrl: string;             // Obrazek Retina / 16:9
  durationText?: string;            // np. "18 min", "Czytanie: 5 min"
  badgeText?: string;               // np. "PREMIERA", "ROZDZIAŁ 1", "NA ŻYWO"
  actionType: 'play' | 'read' | 'watch';
  actionUrl: string;                // URL akcji
  publishedAt?: string;             // ISO 8601
}
```

Taki schemat gwarantuje pełną wymienność komponentów i kompatybilność wsteczną.
