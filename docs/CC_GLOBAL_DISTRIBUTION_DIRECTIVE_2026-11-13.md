# DYREKTYWA OPERACYJNA @777: CC GLOBAL DISTRIBUTION (Ekspansja 2026 • Strategia ZERO COST)

- **Identyfikator dokumentu:** `JOMA-DIR-CC-GLOBAL-DIST-20261113`
- **Data wydania:** 13 listopada 2026
- **Właściciel i Decydent (L0):** Cezary Rogowski (Dowódca Nazir)
- **Zakres obowiązywania:** Wszystkie kolegia i agenci Federacji `@777` (`@A001` Antigravity, `@077` Noemi, `Publikator CC`, `@A520`, Joshua, Claude, Codex, OpenBot)
- **Zasada nadrzędna:** *„Nie budujemy dwudziestu nowych projektów — sprawiamy, by jeden istniejący ekosystem Christian Culture docierał do ludzi na całym świecie.”*

---

## 1. Punkt Wyjścia i Diagnoza Strategiczna (Listopad 2026)

1. **Zweryfikowany stan posiadania:**
   - **32 kraje** z odbiorem radia na **5 kontynentach** (priorytet геоgraficzny poza Polską: **1. Niemcy 🇩🇪, 2. Wielka Brytania 🇬🇧, 3. USA 🇺🇸**).
   - **15 albumów muzycznych** w oficjalnym katalogu na Spotify.
   - **29 opublikowanych odcinków** serii *Apokalipsa*, słuchowiska *Biblia Audio CC*, codzienne rozważania *„Dobrze, że jesteś”* oraz lekcje *Kursu Codziennego Akademii Biblijnej*.
   - Aktywne 7 kanałów YouTube, Spotify oraz oficjalne profile Facebook, Instagram, TikTok, Threads i SoundCloud.
2. **Cel na pierwsze 90 dni:**
   - Zweryfikowana obecność (`LIVE_VERIFIED`) w **15–20 strategicznych kanałach dystrybucji**,
   - Wykorzystanie wyłącznie bezpłatnych automatyzacji (`ZERO COST`) i dozwolonej puli tokenów,
   - Mierzalny wzrost odbiorców spoza Polski w oparciu o jeden centralny moduł **`CC GLOBAL DISTRIBUTION`** (`scripts/cc-global-distribution.mjs` + `data/cc-global-distribution-registry.json`).

---

## 2. Architektura Modułu `CC GLOBAL DISTRIBUTION`

Każdy materiał w ekosystemie Christian Culture otrzymuje **jeden kanoniczny identyfikator (`contentId`)** i przechodzi przez centralny router dystrybucji zamiast ręcznego powielania pracy:

1. **Jedno ID materiału (`contentId`):** np. `CC-2026-KC-DAY46`, `CC-2026-BA-GEN023`, `CC-2026-SDS-APOKALIPSA-029`, `CC-2026-DZJ-20261113`.
2. **Macierz Praw i Licencji (`rights`):**
   - Przed wysłaniem na jakąkolwiek platformę zewnętrzną moduł sprawdza pole `rights.allowedPlatforms` oraz `rights.musicLicense` (`cc_original`, `public_domain`, `licensed_stream_only`).
   - Materiały bez potwierdzonych praw do danej platformy są automatycznie wstrzymywane (`BLOCKED_BY_RIGHTS_GUARD`).
3. **Bramka Jakości i Grafiki (`@777` + `@A520`):**
   - Weryfikacja biblijna `K1–K12` (cytaty dosłowne z UBG).
   - Podwójna bramka wizualna `@A520`: `IMAGE_CONTENT_MATCH = PASS` oraz `PUBLISHER_VISUAL_APPROVAL = PASS` dla każdego formatu docelowego (`16:9` wideo/artykuł, `9:16` Shorts/Reels/TikTok, `1:1` karuzela/podcast cover, `2:3` Pinterest Pin 1000×1500 px).
4. **Automatyczna Konwersja Formatów i Kanałów (6 Filarów):**
   - **Filar 1 — Radio i Katalogi Globalne:** TuneIn, Radio Garden, myTuner Radio, radio.net (szczególnie ważne dla słuchaczy w Niemczech), Online Radio Box, Streema, Radio Browser.
   - **Filar 2 — Podcasty i Audio (RSS 2.0):** Apple Podcasts Connect, Amazon Music for Podcasters, Spotify, Pocket Casts, Castbox, Overcast, Goodpods, iHeartRadio (`/feed/apokalipsa.xml`, `/feed/biblia-audio.xml`, `/feed/dobrze-ze-jestes.xml`).
   - **Filar 3 — Wideo, Shorts i Karty Społeczności:** 7 kanałów YouTube (wideo 4K 16:9, Shorts 9:16, codzienne posty na karcie *Społeczność* z ankietami i grafiką 1:1, wielojęzyczne tytuły/opisy/napisy), Instagram Reels, TikTok, Dailymotion.
   - **Filar 4 — Odkrywanie Wizualne, Eksperckie i Newslettery (Priorytet Wysoki):**
     - **Pinterest (`2:3`, 1000×1500 px):** Grafiki biblijne, wersety UBG, plakaty filmowe i infografiki z Kursu Codziennego z wiecznymi linkami SEO do `polskieradio.cc`.
     - **LinkedIn:** Misja Christian Culture, przywództwo chrześcijańskie (Cezary i Wioletta Rogowscy), rozwój technologii i partnerstwa medialne.
     - **Substack (PL/EN/DE):** Newslettery, artykuły publicystyczne CCN News i natywny import RSS podcastów.
   - **Filar 5 — Społeczności, Grupy Facebook & Telegram:**
     - **Grupy Facebook (Polonia DE/UK/USA + grupy chrześcijańskie):** Dystrybucja wartościowych rozważań, lekcji i świadectw z twardą blokadą antyspamową (rotacja grup, personalny kontekst `@cc-human-voice`, zakaz duplikatów).
     - **Telegram (`@ChristianCultureGlobal`):** Kanał natychmiastowych powiadomień o premierach, wersetach dnia i plikach MP3 Biblii Audio (100% zasięgu bez cięć algorytmu).
     - **WhatsApp FIFO (`CC 6`):** Pancerne zasady 10:00–18:00 (po 2 grupy z rotacji, wyłącznie wersja WWW `contentWeb`).
   - **Filar 6 — Ekspansja Językowa i SEO (`hreflang`):**
     - Kolejność priorytetowa języków: **1. 🇬🇧 Angielski (`en`), 2. 🇩🇪 Niemiecki (`de`), 3. 🇪🇸 Hiszpański (`es`), 4. 🇵🇹 Portugalski (`pt`), 5. 🇫🇷 Francuski (`fr`)** (+ `pl`, `uk`, `he`).
     - Osobne ścieżki URL (`polskieradio.cc/en/`, `polskieradio.cc/de/`) spięte znacznikami `<link rel="alternate" hreflang="...">` **bez automatycznego wymuszania przekierowania po IP** (zgodnie z wytycznymi Google International SEO).

---

## 3. Plan Operacyjny Wdrożenia — 30 Dni (4 Tygodnie)

| Etap | Zakres operacyjny | Odpowiedzialni Agenci | Rutyna OpenBot / `@ccMC` |
|---|---|---|---|
| **Tydzień 1** | Audyt profili i zgłoszenie 6 strumieni radia CC do TuneIn, Radio Garden, myTuner Radio, radio.net, Online Radio Box, Streema i Radio Browser. | `Publikator CC` + `@A001` | **CC 19 (14:00)** |
| **Tydzień 2** | Walidacja i podpięcie kanałów RSS 2.0 (`/feed/apokalipsa.xml`, `/feed/biblia-audio.xml`, `/feed/dobrze-ze-jestes.xml`) w Apple Podcasts Connect, Amazon Music i katalogach podcastowych. | `Publikator CC` + `@CCS` | **CC 18 (15:00)** |
| **Tydzień 3** | Uruchomienie i codzienna kolejka publikacyjna na **Pinterest (2:3)**, **LinkedIn**, **Substack (PL/EN)**, **Telegram** oraz rotacja na **Grupach Facebook (DE/UK/USA)**. | `Publikator CC` + `@A520` | **CC 20 (17:30)** |
| **Tydzień 4** | Pilotaż lokalizacji **EN 🇬🇧** i **DE 🇩🇪** (wielojęzyczne metadane YouTube + podstrony `/en/` i `/de/` z `hreflang`), pomiar GA4 i analiza przyrostu sesji z Niemiec, UK i USA. | `@A001` + `@150` + `Strażnik SMCC` | **CC 18 (15:00)** + **CC 14 (20:30)** |

---

## 4. Żelazne Reguły Wykonawcze dla Agentów

1. **Testy przed produkcją (`Zero-QA`):** Każda zmiana w kanałach RSS, rejestrze dystrybucji lub stronach językowych musi przejść `node scripts/cc-global-distribution.mjs verify`, `npm.cmd run test:guardian` oraz `npm.cmd run test:mobile-premium`.
2. **Pula dostępnych tokenów:** Wszystkie zadania w OpenBot (`CC 1`–`CC 20`) korzystają z routera `route-tokens` (aktywne sesje z tokenami: Antigravity, Claude, Codex, Copilot, Gemini, OpenRouter Free oraz kanoniczny `opencode/deepseek-v4.1-flash-free`).
3. **Potwierdzenie `LIVE_VERIFIED`:** Żaden kanał ani odcinek nie może otrzymać statusu `ZREALIZOWANE` bez zapisania zweryfikowanego URL i potwierdzenia HTTP 200.
