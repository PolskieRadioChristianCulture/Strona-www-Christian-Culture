
# Workspace @ICC — Integracja Christian Culture

## Specjalista CC Tech Scout
Powołany przez właściciela 12.10.2026; profil `.cursor/agents/cc-tech-scout.md`, mandat `Misja CC/JOMA_SHARED_MEMORY/CC_TECH_SCOUT_MANDATE.md`. Ocenia technologie, automatyzacje, optymalizację, bezpieczeństwo, niezawodność i koszty całego ekosystemu. Odczytowy research, świeże oficjalne dowody, koordynacja START/KONIEC przez skrzynkę, bez dublowania cudzej pracy i bez rozszerzania zgód. Rola nie jest stałą usługą 24/7.

## Obowiązkowy obieg pracy w Skrzynce Misji — 2026-10-12
Na polecenie właściciela każdy agent stosuje prywatny `JOMA_SHARED_MEMORY/SKRZYNKA/PROTOKOL.md` (sekcja START / KONIEC). Przed pracą odczytaj TABLICA.md i własną skrzynkę. Zgłoś START: agent, ID/wątek zadania, zakres/pliki, rzeczywisty czas rozpoczęcia (ISO 8601 ze strefą), status w_toku i następny krok. Sprawdź aktywnego właściciela; nie dubluj jego pracy. Przy blokadzie lub przekazaniu zapisz czas, powód i punkt kontynuacji. Po pracy zgłoś KONIEC: ten sam wątek, rzeczywisty czas zakończenia, wynik, dowód i pozostałe kroki; zrobione tylko po sprawdzeniu. Rozróżniaj lokalnie/repo/serwer/baza/telefon. Nowe wiadomości i potwierdzenia są oddzielnymi plikami; nie edytuj istniejących wiadomości ani generowanej TABLICA.md. Skrzynka nie nadaje dodatkowych uprawnień i nie zastępuje zgody właściciela. Bez sekretów i danych użytkowników. Powiadom pozostałych agentów w skrzynce, nie przez właściciela; potwierdzenie odbioru jest wymagane, nie zakładaj, że reguła już została przeczytana.


## Wspólny cel wszystkich agentów — 2026-10-09
Stosuj `Misja CC/JOMA_SHARED_MEMORY/CC_AGENT_COMMON_STANDARD.md`: służba Bogu i człowiekowi zgodnie z Biblią, profesjonalna realizacja, krótkie komunikaty bez żargonu, aktualne i sprawdzone rozwiązania, intuicyjna przydatność oraz globalny rozwój bez manipulacji. Nie omijaj Konstytucji, testów, prywatności ani wymaganych zgód. Wartość dla użytkownika poprzedza zasięg.

## Komunikacja z właścicielem — polecenie 2026-10-09
Wszyscy agenci: domyślnie 2–5 krótkich zdań/punktów. Podawaj konkretnie: ZROBIONE, DZIAŁA/NIE DZIAŁA/NIESPRAWDZONE, NASTĘPNY KROK i tylko konieczną decyzję. Dowody i długie raporty zapisuj w prywatnym JOMA, nie w czacie. Rozróżniaj lokalnie/repo/serwer/telefon; „premium potwierdzone” wyłącznie dla sprawdzonego zakresu. Właściciel odpowiada „tak”, „nie”, „dalej”. Bezpieczne zatwierdzone prace prowadź samodzielnie, z zachowaniem bramek bezpieczeństwa, kosztów i prywatności. Priorytet: płynny globalny rozwój. Reguła: .cursor/rules/cc-short-owner-updates.mdc.

## 1. CC — Zakaz Regresji (Polecenie Właściciela 2026-10-03 / Wdrożenie 2026-10-04)
Obowiązuje `CC_NO_REGRESSION_POLICY.md` w głównym `@ICC` i `JOMA_SHARED_MEMORY`. Dotyczy całego ekosystemu i każdego agenta. Nie wolno publikować cofnięcia zaakceptowanej funkcji, wyglądu lub integracji. Powracająca usterka wymaga testu; FAIL blokuje publikację. Dla `/news` kanonicznym źródłem jest `portals/ccn-news` w aktualnym zdalnym `main` LUMINA, a kontrolą `npm.cmd run test:cc-regression`. Nie przebudowywać `/news` ze starszego scratch/generatora. Potwierdzaj actual artifact, cache, mobilną obsługę i produkcję; zapisuj dowody i ograniczenia, bez deklarowania pełnego pokrycia innych projektów.

## 2. Pancerne Dyrektywy dla Modeli AI (Claude, Gemini, GPT) w Workspace @ICC
- **Zero pytań o podstawy:** Widząc komendy `@777` (`@777 = @joma @ICC`), `@ICC`, `@Joma`, `@Nazir`, `@SMCC`, `@Lumina`, `@Player`, `@m` / `@mapaCC` itp., model ma ZAKAZ pytania użytkownika o ich znaczenie. Model czyta odpowiednie pliki ze `skills` lub `JOMA_SHARED_MEMORY` przed napisaniem pierwszej linii kodu lub odpowiedzi.
- **Weryfikacja Zero-QA dla Dowódcy:** Każde zadanie musi przejść lokalne testy (`npm.cmd run test:cc-regression`, `npm.cmd run test:guardian`, `npm.cmd run test:mobile-premium`). Dowódca Nazir nie testuje kodu za agenta.
- **Katalog źródeł:** Repozytorium robocze WWW to `C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc`. Synchronizacja do `C:\Users\czark\Desktop\@ICC\LUMINA`.
- **Wspólna pamięć JOMA:** `C:\Users\czark\Desktop\Misja CC\JOMA_SHARED_MEMORY`. Po zakończeniu pracy wpisz raport do `JOMA_HANDOFFS.md`.
- **Obowiązek aktualizowania wykonanych działań na @m = @mapaCC:** Po każdym zakończonym zadaniu (nowe podstrony, moduły, aplikacje, zmiany funkcjonalne) agent ma bezwzględny obowiązek zaktualizowania rejestru działań i projektów w `data/ecosystem-map.json` na żywej Mapie Ekosystemu `https://polskieradio.cc/mapa` (`@m` / `@mapaCC`).
- **Ochrona kanałów live:** Bezwzględny zakaz edycji `cctv24-worship.html` oraz innych działających kanałów live bez wyraźnego rozkazu Dowódcy.

## 3. Uniwersalna Propagacja Uwag do Profili (Doktryna Dowódcy 2026-10-09)
> ⚠️ **Żelazna zasada:** „Uwagi ogólne które zgłaszam do jakiegoś profilu, powinny być brane pod uwagę w stosunku do wszystkich profili.”
Wszelkie uwagi i decyzje dotyczące dowolnego profilu (np. brak podkreśleń linków, modale autoryzacji/zdjęcia wyłącznie dla `isPersonalOwner`, ikonowy minimalizm na smartfonach 44px, wysoka jakość grafik Retina/2000x2000, wygaszanie przycisków odtwarzaczy) obowiązują **GLOBALNIE dla każdego profilu w ekosystemie** (`lumina.mariusz.html`, `lumina-profile.html`, `lumina.cezaryrgowski.html`, `lumina.wiolettarogowska.html`, `lumina.radiocc.html`, itp.). Zakaz lokalnych, wybiórczych łatek.

## 🔒 REGUŁA NADRZĘDNA PROFILI LUMINA — JEDEN STANDARD
Ta reguła ma pierwszeństwo przed pomysłami projektowymi, skrótami implementacyjnymi i lokalnymi poprawkami agentów.

1. **Każdy obecny i przyszły profil użytkownika korzysta z jednego kanonicznego renderera:** `lumina-profile.html?u=<slug>`.
2. **Nowy użytkownik jest rekordem danych, nie nowym plikiem HTML.** Nie wolno tworzyć kolejnych stron `lumina.<osoba>.html`, kopiować istniejącego profilu ani rozwijać osobnego wariantu układu.
3. Wszystkie pełne powierzchnie profilowe muszą ładować dokładnie jeden wspólny kontrakt `/css/lumina-profile-standard.css` po starszych warstwach CSS oraz posiadać klasę `lumina-profile-standard` na `<body>`.
4. Wspólne pozostają: geometria, responsywność, nagłówek, tło, awatar, działania, zakładki, karty, typografia, odstępy, stany oraz zachowanie mobilne. Indywidualne są wyłącznie dane i tokeny: treść, zdjęcia, rola, odznaki i kolor akcentu.
5. **Dodatki specjalne są zabronione bez wyraźnego polecenia Cezarego Rogowskiego.** Zgoda musi zostać udokumentowana w kodzie komentarzem:
   `<!-- LUMINA_PROFILE_EXCEPTION: approved-by=Cezary Rogowski; scope=<dokładny zakres>; reason=<powód> -->`.
   Wyjątek ma być minimalny, nie może kopiować całego profilu ani omijać wspólnego standardu.
6. Agent zmieniający profile musi uruchomić Strażnika i test `node --test scripts/mobile-premium-regression.test.mjs`. Naruszenie reguły L blokuje commit, merge i wdrożenie.

## 4. Żywa Mapa Ekosystemu — @m = @mapaCC (https://polskieradio.cc/mapa)
> 👑 **Polecenie Dowódcy (2026-10-11):** Obowiązek @joma aktualizowania wykonanych działań na `@m` = `@mapaCC`.
- `@m` / `@mapaCC` to centralny, publiczny i interaktywny rejestr całego cyfrowego świata Christian Culture (`https://polskieradio.cc/mapa`, plik `data/ecosystem-map.json`).
- **Symboliczny rejestr na publicznej mapie:** Ponieważ raportowanie na mapie jest jawne i publicznie dostępne dla każdego, wpisy na mapie mają charakter **wyłącznie symboliczny**:
  1. **Temat aktualizacji** (krótki, elegancki tytuł/zakres)
  2. **Data** (format YYYY-MM-DD)
  3. **Symbol Agenta** (pojedyncza litera):
     - **A** = Antigravity
     - **G** = GPT / ChatGPT / Codex
     - **C** = Claude
     - **J** = Joshua
     (itp. itd.)
- **Szczegóły raportu są ŚCIŚLE TAJNE:** Wszelkie analizy techniczne, logi, diffy, błędy i telemetria są archiwizowane **WYŁĄCZNIE we wspólnej pamięci `@joma`** (`C:\Users\czark\Desktop\Misja CC\JOMA_SHARED_MEMORY` w `JOMA_HANDOFFS.md`), dostępne wyłącznie dla Dowódcy i agentów misji. Kategoryczny zakaz ujawniania technicznych sekretów w publicznym UI mapy.

## 5. Skrzynka Misji CC (Start sesji agentów)
Na początku każdej sesji przeczytaj `JOMA_SHARED_MEMORY/SKRZYNKA/TABLICA.md` i swoją skrzynkę (`node narzedzia/skrzynka.mjs skrzynka --agent <ty>`). Potwierdzaj wiadomości statusem; „zrobione” tylko z dowodem. Zasady: `SKRZYNKA/PROTOKOL.md`.

## 6. Uniwersalna Wyszukiwarka Ekosystemu — @w = wyszukiwarka (Dyrektywa Dowódcy 2026-10-15)
> 🔍 **Żelazna zasada @w:** „Wszystkie lupy = okna wyszukiwarki, podpięte pod jeden uniwersalny i kompleksowy silnik, inteligentny system wyszukiwania dla całego ekosystemu po dowolnym słowie, sugerujący już od pierwszej wpisanej litery.”
- **Jeden Silnik dla Całego Ekosystemu:** Każda ikona lupy, pole wyszukiwarki oraz globalny skrót `Ctrl + K` / `/` na dowolnej stronie (`polskieradio.cc`, `index.html`, `lumina.html`, `lumina-tablica.html`, `mess.html`, `player.html`, `akademia.html`, `mojabiblia.html`, `vod.html`, portale CCN News itp.) jest podpięta pod centralny silnik `@w` (`components/cc-omni-search.js`).
- **Inteligentne Sugestie od 1. Litery:** Wyszukiwarka błyskawicznie (<5ms) analizuje zapytanie i już od pojedynczej wpisanej litery prezentuje posegregowane wyniki:
  1. 🌐 **Moduły & Platformy** (Radio, Player, MojaBiblia, Akademia, Kurs Codzienny, LUMINA, VOD, CCTV24, Sklep, Mapa)
  2. 👤 **Profile & Społeczność** (Cezary Rogowski, Wioletta Rogowska, autorzy, członkowie LUMINA)
  3. 📖 **Słowo Boże & Rozważania** (Księgi biblijne, wersety, rozważania „Dobrze, że jesteś”)
  4. 📻 **Audycje & Muzyka** (Biblia Śpiewana, Śniadaniowa, Ambient Sleep, Worship Live)
  5. 🎬 **Kino VOD & Kanały** (Filmy chrześcijańskie, Apokalipsa Live SDS, Osobowość+, CC Men, CC Women)
  6. 📰 **Wiedza & Publicystyka** (Artykuły CCN News, Nauka, Historia, Biologia, Prawo)
- **Obowiązek Ciągłego Indeksowania:** Każda nowo publikowana podstrona, funkcja, audycja, artykuł, film czy lekcja kursu ma bezwzględny obowiązek być dopisana do indeksu wyszukiwarki (`data/cc-search-index.json`). Żadna treść w CC nie może pozostać niewidoczna dla wyszukiwarki `@w`.
- **Wyszukiwanie Synonimiczne i Kontekst Daty:** Wyszukiwarka obsługuje wielopoziomowy słownik synonimów (np. `lekcja` ↔ `rozważanie` ↔ `inspiracja` ↔ `słowo na dziś` ↔ `kurs`), automatyczne rozpoznawanie fraz czasowych („dziś”, „na dziś” mapowane dynamicznie na bieżący dzień cyklu, np. Dzień 15) oraz tolerancję literówek Levenshteina (np. `rozwżanie` ➔ `rozważanie`).
- **Inteligentne Sugestie Bliskoznaczne przy Brakach:** Gdy w ekosystemie brakuje danego materiału (np. zapytanie o nieistniejący numer lekcji „Lekcja 99” lub nieznany termin), silnik nie wyświetla pustej strony, lecz automatycznie sugeruje bliskoznaczne alternatywy (np. dzisiejszą lekcję na dziś Dzień 15, pokrewne kursy biblijne i werset dnia) wraz z eleganckim komunikatem wyjaśniającym.
- **Obowiązek Indeksowania Po Każdej Publikacji:** Bezpośrednio po opublikowaniu jakiegokolwiek materiału (nowa lekcja, rozważanie DZJ, artykuł CCN, film VOD, audycja, podstrona), agent ma bezwzględny obowiązek zaktualizowania wpisów w katalogu wyszukiwarki (`szukaj/catalog.json` oraz `data/cc-search-index.json`). Brak wpisu nowości w katalogu jest traktowany na równi z regresją kodu.

## 7. Codzienna Pełna Aktualizacja Akademii Biblijnej i Kursu Codziennego — @Akademia (Dyrektywa Dowódcy 2026-10-18 / 2026-10-19)
> 📖 **Żelazna zasada @Akademia:** „https://polskieradio.cc/akademia#kurscodzienny strona musi być kompletnie aktualizowana każdego dnia. Każdego dnia po publikacji lekcji trzeba aktualizować dwa przyciski na https://polskieradio.cc/akademia#kurscodzienny.”
- **DWA PRZYCISKI HERO (Główne CTA):** Bezpośrednio po publikacji nowej lekcji agent MA BEZWZGLĘDNY OBOWIĄZEK zaktualizować oba przyciski w sekcji Hero na `polskieradio.cc/akademia#kurscodzienny` oraz `polskieradio.cc/akademia/kurscodzienny`:
  1. **Przycisk główny (Primary):** `CZYTAJ DZIEŃ XX (DATA) →` wskazujący bezpośrednio na dzisiejszą lekcję (np. `CZYTAJ DZIEŃ 19 (19 PAŹDZIERNIKA) →` z linkiem `/akademia/kurscodzienny/dzien-19`).
  2. **Przycisk powrotny (Secondary):** `← DZIEŃ XX-1` wskazujący na lekcję z wczoraj (np. `← DZIEŃ 18` z linkiem `/akademia/kurscodzienny/dzien-18`).
- **PRZYCISK SKOKU ZE STRZAŁKĄ W DÓŁ NAD TYTUŁEM KAŻDEJ LEKCJI:** Nad tytułem `<h1>` każdej lekcji Kursu Codziennego (obecnej i przyszłej) musi znajdować się przycisk ze strzałką w dół: `Podziel się tą lekcją ↓` (`#kcJumpShareBtn`), który natychmiast płynnie przenosi użytkownika do sekcji udostępniania (`#ccDailyShare`). Funkcjonalność jest pre-renderowana w statycznym HTML oraz dynamicznie gwarantowana przez `js/cc-daily-course-share.js`.
- **Licznik Dostępnych Dni:** Plakietka stanu jest uaktualniana codziennie (np. `Dni 1–19 z 31 Dostępne (19 Października 2026)`).
- **Siatka Lekcji:** Kafelek bieżącego dnia w siatce miesiąca posiada dedykowaną ilustrację 16:9 (`/images/academy/daily/kc_day_XX_*.jpg`), tytuł, zakres wersetów, status `DZISIEJSZA LEKCJA` (animate-pulse) i link `Studiuj →`. Poprzednia lekcja otrzymuje status `DOSTĘPNA TERAZ`.
- **4 Ścieżki Clean Routing:** Synchronizacja plików `dzien-XX.html` i `dzien-XX/index.html` oraz mirrorów w `kursy/kurscodzienny/`.
- **Indeks Wyszukiwarki:** Uaktualnienie wpisów w `szukaj/catalog.json` i `data/cc-search-index.json` (`scripts/index-lessons.mjs`).
- **Narzędzie Automatyzacji:** Do weryfikacji i synchronizacji służy skrypt `node scripts/sync-akademia-kurscodzienny.mjs`.

## 8. Federacja 777 Agentów Misyjnych CC do 2030 Roku (Projekt Strategiczny JOMA-D025)
> 🏛️ **Dokument Strategiczny:** `strategia/ORKIESTRACJA_777_AGENTOW_2026_2030.md` oraz `JOMA_SHARED_MEMORY/CC_STRATEGIA_777_AGENTOW_2030.md`.
- **Wizja i Mandat:** Federacja 777 ról kompetencyjnych wspierających globalną misję do 31.12.2030 (21 Kolegiów × 37 Ról = 777 ról).
- **Nadrzędność Człowieka i Konstytucji CC:** Cezary Rogowski zatwierdza cele, budżety, publikacje wrażliwe i dostęp produkcyjny.
- **Warstwy Orkiestracji:** L0 (Cezary Rogowski & Konstytucja), L1 (Rada JOMA), L2 (21 Dyrektorów), L3 (126 Liderów), L4 (504 Wykonawców), L5 (84 Audytorów, 42 Kuratorów).
- **Bramki Decyzyjne (T0–T4):** T0 (Read-only), T1 (Branch), T2 (Test CI), T3 (Rutyna), T4 (Wymagana Osobista Zgoda Cezarego Rogowskiego dla produkcji, danych osobowych, dzieci, płatności i doktryny o dużym zasięgu).
- **Standard ZERO COST:** Domyślnie legalne darmowe limity (Free Tier), brak subskrypcji dla ról, aktywacja na żądanie.
- **Status Operacyjny:** `DRAFT_PENDING_OWNER_CONFIRMATION` (oczekuje na decyzję Dowódcy przed startem pilotażu 10 ról).

## 9. Protokół Weryfikacji Biblijnej — EkoCC @777 (Dyrektywa Dowódcy 2026-10-20)
> 📖 **Dokument Normatywny:** `Misja CC/JOMA_SHARED_MEMORY/CC_PROTOKOL_WERYFIKACJI_BIBLIJNEJ.md` oraz `.cursor/rules/cc-protokol-weryfikacji-biblijnej.mdc`.
- **Wersja:** 1.0 — 20.10.2026. Standard redakcyjny do wdrożenia w procedurach wykonawczych i CI dla @001 (Antigravity), @150 i wszystkich agentów EkoCC.
- **Nadrzędna reguła:** @777 — zbiór wspólnych zasad, NIE agent. Właściciel publikacji: @001 | Niezależny recenzent: @150 | Decyzja doktrynalna: L0.
- **Źródła kanoniczne:** Podstawowy zatwierdzony przekład do cytowania: **UBG (Uwspółcześniona Biblia Gdańska)**; wsparcie: MojaBiblia CC (`polskieradio.cc/mojabiblia`). Bez weryfikacji dosłownego brzmienia zakaz oznaczania tekstu jako cytat UBG.
- **Procedura K1–K12:** Obowiązkowa kontrola w 12 krokach (Inwentaryzacja twierdzeń -> Dopasowanie referencji -> Kontrola dosłowności UBG -> Kontekst lokalny -> Kontekst całej Biblii -> Gatunki -> Obraz Boga i Ewangelii -> Doktryna/spory -> Fakty -> Kontrola formatu [SEO/H1/TTS/Shorts] -> Niezależny recenzent @150 -> Decyzja audytowa PASS).
- **Czerwone Flagi (Zakaz publikacji):** Brak fragmentu dla „Biblia mówi...”, podszywanie się pod UBG po zmianie cytatu, przemilczenie sąsiednich wersetów, „Bóg gwarantuje Ci...” w kwestiach doczesnych/finansowych, uzależnianie łaski/zbawienia od wpłat na misję, sensacyjne wyznaczanie dat paruzji.

## 10. Obowiązkowa Współpraca @A001 z @A520 w Zakresie Grafiki (Aneks L0 — 2026-10-20)
> 🎨 **Dokument Normatywny:** `Misja CC/JOMA_SHARED_MEMORY/CC_ANEKS_A001_A520_WSPOLPRACA_GRAFICZNA.md` oraz `.cursor/rules/cc-aneks-a001-a520-grafika.mdc`.
- **Zasada nadrzędna:** Agent @A001 ma w 100% respektować standardy jakości, zgodności treściowej i procedury kontroli obrazu określone przez Agenta @A520 (Główny Grafik Redakcyjny i Reżyser Obrazu EkoCC).
- **Obowiązkowa bramka przed publikacją:** Każda publikacja z grafiką wymaga podwójnego zatwierdzenia:
  1. `IMAGE_CONTENT_MATCH = PASS` (potwierdzenie od @A520 — pełna zgodność znaczeniowa i merytoryczna z tekstem),
  2. `PUBLISHER_VISUAL_APPROVAL = PASS` (potwierdzenie od @A001 — weryfikacja kadrowania desktop/mobile, miniatury i podglądu social media).
- **Zakaz samowoli:** Zakaz publikowania grafik „na wyczucie”, „na szybko”, tylko na podstawie tytułu, z pamięci lub z innego posta. Brak zgodności obrazu z treścią to krytyczny błąd publikacyjny.

## 11. EkoCC v2 PREMIUM — MAGIC UI + MOTION PRIMITIVES + PEXELS + TASTE SKILL (Dyrektywa Architektoniczna i Wdrożeniowa @777 / 2026-10-21)
> 💎 **Dokument Normatywny:** `Misja CC/JOMA_SHARED_MEMORY/EKOCC_V2_DESIGN_STACK_PROTOCOL_2026-10-21.md` (identyfikator: `EKOCC-V2-DESIGN-STACK-P0-20261021`), decyzja `JOMA-D045`.
- **Zasada nadrzędna i cel:** Efekt WOW bez kompromisów w prawdzie, misji, bezpieczeństwie, wydajności i kosztach. Magic UI, Motion Primitives, Pexels i Taste Skill tworzą kontrolowany zestaw narzędzi prezentacji EkoCC v2 PREMIUM. Animacje wspierają przekaz, a nie dominują nad treścią, radiem, modlitwą, Biblią i funkcjami użytkownika.
- **Cztery Filary Zestawu:**
  1. 🪄 **Magic UI:** Wizualne komponenty premium (hero, siatki, światło, Border Beam, Bento Grid, Globe) — wyłącznie otwarte komponenty MIT z oficjalnego rejestru shadcn/ui. Kopiowanie z przypiętej rewizji, import lokalny, tree-shaking, brak obcego CDN.
  2. 🎬 **Motion Primitives:** Mikrointerakcje i przejścia stanów w React (MIT, ibelick) — oszczędne ujawnianie sekcji, interakcje kart. Bezwzględny wymóg `prefers-reduced-motion: reduce`, animacja wyłącznie `transform`/`opacity` (CLS=0, INP ≤ 200ms). KATEGORYCZNY ZAKAZ stałej animacji tekstu Pisma Świętego, modlitwy, karaoke i komunikatów krytycznych.
  3. 📸 **Pexels:** Legalne fotografie i krótkie filmy wideo — standard ZERO COST (darmowe limity API: 200 req/h, 20 000 req/mies., klucz API ściśle po stronie serwera/build, nigdy w publicznym kodzie). Zawsze rejestrować metadane: autor, źródło, data, licencja. KATEGORYCZNY ZAKAZ przypisywania osobom ze stocka prawdziwego świadectwa wiary, nawrócenia czy przynależności do misji CC.
  4. 🎨 **Taste Skill:** Instrukcje dla agentów podnoszące jakość art direction, hierarchię informacji, typografię i rytm — kanoniczna tożsamość Champagne Gold (`#C4A35A`, hover `#D4B578`, light `#E2CC9A`, dark `#A08040`), touch target min. 44x44px (bezwzględne min. 24px WCAG 2.2 AA). ZAKAZ uruchamiania niesprawdzonych skryptów instalacyjnych npx/npm bez audytu bezpieczeństwa kodu.
- **Mobilna Nawigacja EkoCC (Standard Żelazny):** Na smartfonach jedyny widoczny przycisk `+` na górnej belce; kliknięcie otwiera współdzielony lewy panel wysuwany od krawędzi (Drawer/Sheet) z ikonami o pełnych etykietach dostępności (`aria-label`, focus trap, Escape zamyka).
- **Twarde Granice (Czego NIE WOLNO):**
  - Zakaz zakupów, płatnych szablonów i usług bez pisemnej zgody L0.
  - Zakaz masowego refaktoringu całego ekosystemu naraz.
  - Zakaz naruszania logiki radia 24/7, odtwarzania w tle/przy wygaszonym ekranie, synchronizacji karaoke, autoryzacji i publikacji.
  - Zakaz podmieniania semantycznych przycisków na czysto wizualne efekty bez obsługi klawiatury/screenreaderów.
- **Procedura Wdrożenia P0 (STOP przed produkcją):**
  - Faza P0-A: Audyt technologii, zależności i ryzyk bez zmian produkcyjnych.
  - Faza P0-B: Izolowany pilotaż nieprodukcyjny w odrębnej gałęzi (rekomendacja: `/mapa` lub Mission Control).
  - Faza P1/P2: Dopiero po audycie L0 i formalnej bramce GO od Cezarego Rogowskiego.

## 12. Klasyczny Pomarańczowy Przycisk Akcji (`#FF7A00`) Zamiast Koloru Żółtego — Standard Całego Ekosystemu CC (Dyrektywa Dowódcy 2026-10-26 / `JOMA-D052`)
> 🟠 **Dokument Normatywny:** `Misja CC/JOMA_SHARED_MEMORY/konstytucja/JOMA_STANDARD_POMARANCZOWY_PRZYCISK_CC.md` (`JOMA-STD-ORANGE-CTA-20261026`), wzorzec graficzny: `konstytucja/zasoby/PRZYCISK_POMARANCZOWY_WZORZEC_2026-10-26.png` (`images/brand/cc-orange-button-standard-20261026.png`).
- **Zasada nadrzędna:** W całym ekosystemie Christian Culture (`EkoCC`) **zamiast koloru żółtego** w przyciskach akcji (w szczególności głównych przyciskach `Słuchaj`, odtwarzania i pierwszoplanowych przyciskach CTA) stosujemy **Klasyczny Pomarańczowy — Nowoczesny i Uniwersalny (`#FF7A00`)**.
- **Trzy Obowiązkowe Stany Przycisku:**
  1. **Stan domyślny (Default):** `#FF7A00` (`--cc-btn-orange: #FF7A00`)
  2. **Po najechaniu (Hover):** `#FF8C33` (`--cc-btn-orange-hover: #FF8C33`)
  3. **Po kliknięciu (Active / Pressed):** `#E66A00` (`--cc-btn-orange-active: #E66A00`)
- **Tekst i ikona:** `#FFFFFF` (czysta biel o wysokim kontraście, np. biała ikona `▶` w okręgu + pogrubiony napis `Słuchaj`, minimalny wymiar dotykowy `44×44 px`).













## 13. Żelazna Dyrektywa Automatycznej Publikacji Biblii Audio na WWW (https://polskieradio.cc/biblia-audio) (Dyrektywa Dowódcy 2026-10-31 / JOMA-D055)
> 📖 **Zasada nadrzędna:** Każdy nowo wyprodukowany i zatwierdzony odcinek Biblii Audio (`GEN-xxx`, `EXO-xxx` itd.) MA BEZWZGLĘDNY OBOWIĄZEK być automatycznie publikowany w publicznym odtwarzaczu na stronie WWW `https://polskieradio.cc/biblia-audio`.
- **Procedura Publikacji WWW (Kroki 1–6):**
  1. Skopiowanie pliku MP3 (320 kbps) do katalogu odtwarzacza WWW: `C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/biblia-audio/audio/{Plik}.mp3`.
  2. Aktualizacja katalogu `biblia-audio/data/catalog.json` (zmiana statusu z `in_production` na `published`, przypisanie `audioUrl` i podziału `audioParts`).
  3. Kopiowanie zasobów do `.pages-release/biblia-audio/` oraz mirrora `Desktop/@ICC/LUMINA/biblia-audio/`.
  4. Weryfikacja audytu Strażnika Kodu: `npm.cmd run test:guardian` (wymagane 0 naruszeń).
  5. Podwójny Git Push: `git push origin main` oraz `git push lumina-repo main`.
  6. Odnotowanie faktu publikacji na Żywej Mapie Ekosystemu (`data/ecosystem-map.json`) oraz we wspólnej pamięci JOMA (`JOMA_HANDOFFS.md`).
- **Narzędzie wykonawcze:** Dedykowany moduł `skrypty/publish_to_web_biblia_audio.mjs`.

## 14. Nadrzędny Kanon Wiary — 28 Zasad Wiary Kościoła Bożego (Dyrektywa Dowódcy 31.10.2026)
> 📖 **Dokument Normatywny:** `JOMA_SHARED_MEMORY/konstytucja/28_ZASAD_WIARY_KOSCIOLA_BOZEGO.md` oraz `docs/28_ZASAD_WIARY_KOSCIOLA_BOZEGO.md`.
- **Autorytet i tożsamość:** Każdy bot, agent (@777, Antigravity, Joshua, Claude, Gemini) wypowiadający się lub publikujący w imieniu **Cezarego Rogowskiego** (założyciela Christian Culture) działa wyłącznie w autorytecie Słowa Bożego i ma bezwzględny obowiązek kierować się **28 Zasadami Wiary**.
- **Fundamenty doktrynalne:**
  1. **Pismo Święte:** Natchnione, nieomylne Słowo Boże, jedyny autorytet w sprawach wiary i życia (Sola Scriptura; 2 Tm 3:16-17).
  2. **Trójjedyny Bóg:** Ojciec, Syn i Duch Święty (Mt 28:19).
  3. **Zbawienie z łaski przez wiarę:** Wyłącznie z łaski, dar Boży, nie z uczynków (Ef 2:8-9).
  4. **Arcykapłańska posługa Chrystusa:** Wstawiennictwo i sąd w niebiańskiej świątyni (Hbr 8:1-2; Dn 8:14).
  5. **Prawo Boże i Sabat:** Niezmienny dekalog i siódmy dzień tygodnia (sobota) jako pamiątka stworzenia (Wj 20:8-11).
  6. **Stan umarłych i Zmartwychwstanie:** Śmierć jako stan nieświadomości (sen) aż do widzialnego powrotu Chrystusa (Kazn 9:5; 1 Tes 4:16-17).
  7. **Małżeństwo i rodzina:** Trwały związek wyłącznie jednego mężczyzny i jednej kobiety (Rdz 2:24; Ef 5:22-33).
- **Kategoryczny Zakaz Afirmacji Tradycji:** Bezwzględny zakaz mówienia „Amen”, potwierdzania lub promowania jakichkolwiek dogmatów katolickich i niebiblijnych tradycji ludzkich (np. kult świętych, relikwii, modlitw za zmarłych, czyśćca, dogmatów maryjnych).
- **Postawa w rozmowie:** Głęboka życzliwość, serdeczność, wyrozumiałość i miłość chrześcijańska, ale w 100% bezkompromisowa wierność prawdzie Pisma Świętego. Promocja ekosystemu (Biblia Audio, MojaBiblia, rozważania) jako bezinteresowna, braterska pomoc w potrzebie — nigdy jako kryptoreklama.

## 15. Wspólny Folder OA Christian Culture na Google Drive — @OA (Dyrektywa Dowódcy 05.11.2026)
> 📁 **Dokument Normatywny:** `Misja CC/JOMA_SHARED_MEMORY/CC_FOLDER_OA_GOOGLE_DRIVE.md` oraz `docs/CC_FOLDER_OA_GOOGLE_DRIVE.md`.
- **Zasada nadrzędna:** `@OA` to oficjalne wspólne chmurowe repozytorium plików i zasobów operacyjnych ekosystemu Christian Culture na Google Drive:
  `https://drive.google.com/drive/folders/1hSZ722esBv0qOlqYNo1naIcP9k3ybMlP?usp=sharing` (Folder ID: `1hSZ722esBv0qOlqYNo1naIcP9k3ybMlP`).
- **Wspólna misja agentów (@Joma @ICC @777 @OA):** Wszyscy agenci (Antigravity @A001, Codex, Claude, Joshua) mają obowiązek korzystać z folderu `@OA` do odbioru i przekazywania materiałów źródłowych, pakietów wdrożeniowych (np. pakiety ZIP, audyty CC 1101), surówek i masterów audio/wideo.
- **Dedykowany folder Antigravity:** Wewnątrz folderu `@OA` wyznaczona jest dedykowana struktura agenta `Antigravity (@A001)`:
  1. `01_Pakiety_Wdrozeniowe`
  2. `02_Materialy_Produkcyjne`
  3. `03_Raporty_i_Eksporty`
  4. `04_Wspolpraca_Miedzyagentowa`
- **Pancerne bezpieczeństwo (Zero Leaks):** Bezwzględny zakaz umieszczania haseł, kluczy produkcyjnych i danych osobowych w folderze chmurowym.

## 16. Priorytetowy Obowiązek Pracy Każdego Agenta z Kalendarzem Misji — @ccMC / @OA / /automation (Dyrektywa Dowódcy 07.11.2026)
> 📅 **Dokument Normatywny:** `Misja CC/JOMA_SHARED_MEMORY/konstytucja/JOMA_DYREKTYWA_OBOWIAZEK_PRACY_Z_KALENDARZEM_CCMC.md` (`JOMA-DIR-CCMC-20261107`), panel: `https://polskieradio.cc/ccMC`.
- **Zasada nadrzędna:** Każdy agent działający w ekosystemie Christian Culture (@777, Antigravity @A001, Joshua, Claude, Codex, Gemini, Noemi, Copilot) MA BEZWZGLĘDNY OBOWIĄZEK pracy z **Christian Culture Mission Calendar (@ccMC)** jako centralnym rejestrem zadań, harmonogramów, delegacji i weryfikacji.
- **Pobieranie i weryfikacja zadań:** Przed przystąpieniem do jakiejkolwiek pracy agent sprawdza zadania w kolejce kalendarza (`/api/mission-calendar/agent/tasks`).
- **4 Kanoniczne Statusy Zadań:**
  1. `todo` — zaplanowane do realizacji
  2. `in_progress` — w toku, zablokowane aktywnym lease dla konkretnego agenta
  3. `awaiting_review` — wykonane przez agenta, zgłoszone do weryfikacji z dowodami i linkami
  4. `done` — zatwierdzone przez Dowódcę Nazira (zielony `#15803D`)
- **12 Kanonicznych Rutyn Misyjnych (/automation):** Wszystkie automatyzacje misyjne są powiązane z kalendarzem `@ccMC`:
  1. `06:00` — Rozważania DZJ & Strony WWW (Joshua)
  2. `06:30` — Akademia Biblijna Kurs Codzienny (Antigravity)
  3. `07:00` — Grupa Nazira WhatsApp 3 wiadomości (Joshua)
  4. `10:00` — WhatsApp Dystrybucja poranna FIFO (Joshua)
  5. `12:00` — Biblia Audio DAW Mastering -16 LUFS (CCStudio)
  6. `14:00` — Fabryka Wideo 4K & Shorts YouTube SDS (Visual Director)
  7. `16:00` — WhatsApp Dystrybucja popołudniowa FIFO (Joshua)
  8. `19:00` — Wieczorna subskrypcja SMS (Joshua / Bartek)
  9. `21:00` — Strażnik Kodu SMCC Audyt Ekosystemu (Strażnik SMCC)
  10. `21:30` — CCN News Cykliczny Broadcast na X (Redakcja CCN)
  11. `22:00` — Synchronizacja i Backup Folderu @OA (Joshua / OA)
  12. `22:30` — Codzienna Introspekcja JOMA DDEIP (Rada JOMA)
- **Godziny Ciszy (Quiet Hours):** Od 23:00 do 07:00 czasu polskiego (Europe/Warsaw) obowiązuje cisza nocna — zakaz wybudzania Dowódcy głośnymi powiadomieniami Push.
- **Integracja @OA + @ccMC:** Każdy artefakt w folderze chmurowym `@OA` musi posiadać powiązany rekord w `@ccMC`.

