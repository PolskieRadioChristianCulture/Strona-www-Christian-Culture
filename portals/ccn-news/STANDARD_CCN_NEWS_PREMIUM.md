# STANDARD CCN NEWS PREMIUM v1

Przyjęty: 23.11.2026 na polecenie L0 (Cezary Rogowski). Opiekun: @007.
Obowiązuje każdy artykuł `/news` opublikowany od **23.11.2026 09:00** oraz układ strony `/news`.
Strażnik automatyczny: `node --test scripts/ccn-news-premium-standard.test.mjs` (musi być zielony przed wdrożeniem).
Uzupełnia: `CCN_POLITYKA_REDAKCYJNA_1_0.md`, `CC_NO_REGRESSION_POLICY.md`, `CC_MOBILE_UI_STANDARD.md`.

## 1. Treść i rzetelność
1. Fakty oddzielone od analizy i od refleksji biblijnej. Każda liczba, data, cytat prawa ma źródło pierwotne.
2. Pole `sources` — pełna lista źródeł (etykieta + link `https://`), min. 1; dokumenty pierwotne (akty prawne, dekrety, oficjalne komunikaty) przed omówieniami prasowymi. Gdy źródło ma ograniczony dostęp, napisz to w etykiecie.
3. Prawdziwy autor (`AUTHORS.*`). Zakaz fikcyjnych ekspertów i cytatów. Cytowani eksperci tylko z linkiem do źródła.
4. Tytuł nie straszy ponad fakty; sprostowania mitów („nie każdy wierny zapłaci…”) muszą być w treści, gdy nagłówek mógłby wprowadzać w błąd.
5. Śródtytuły numerowane `1. …` (min. 3), akapity krótkie (2–5 zdań), lead (`excerpt`) min. 80 znaków odpowiada na pytanie z tytułu.
6. Wersety w formacie `Rz 6:23` / `Rz 6,23` spójnie w jednym artykule; `scriptureReference` z kluczowym wersetem.
7. Treści teologiczne i dane osobowe — tylko po akceptacji L0 (autor = L0 oznacza akceptację publikacji przez samo zlecenie).

## 2. SEO i udostępnianie
1. `seoTitle` ≤ 60 znaków (trafia do `<title>`), `title` może być dłuższy (nagłówek H1).
2. `metaDescription` 110–160 znaków (meta description, Open Graph, Twitter).
3. `slug`: małe litery, cyfry, myślniki, bez polskich znaków; kanoniczny URL `https://polskieradio.cc/news/<slug>`.
4. JSON-LD `NewsArticle` z `citation` (generowane automatycznie z `sources`), sitemap news + Google News + RSS odświeżone (`scripts/build-cc-discovery-signals.mjs`).
5. Grafika 16:9 do artykułu (1600×900, JPG mozjpeg, ≤ 350 KB, w `/images/news/<id>.jpg` i `portals/ccn-news/public/images/news/`), grafika 1:1 do social w `/images/social/ccn-fb/`.

## 3. Dostępność i wygląd (WCAG 2.2 AA, mobile-first)
1. `imageAlt` — rzeczowy opis grafiki (min. 20 znaków); `imageCaption` — podpis; grafika AI zawsze podpisana jako „ilustracja wygenerowana przez AI (nie fotografia dokumentalna)”.
2. Cele dotyku ≥ 44 px (także linki źródeł), brak poziomego przewijania przy 320/375/390 px, kontrast AA.
3. Obraz czołowy: `loading="eager"` + `fetchpriority="high"` (szybkie LCP); pozostałe obrazy `lazy`.
4. Jedno H1 na stronę; hierarchia H2 bez przeskoków.

## 4. Strona główna /news
1. Czołówka (hero) i pasek „Aktualności” = najnowsze materiały (`isHero` lub Kraj/Świat), sortowane od najnowszego, **maks. 6** w rotacji.
2. Nowy artykuł L0 ustawiamy `isHero: true` i `popularRank: 1` w dniu publikacji.
3. Lista artykułów chronologicznie od najnowszych; „WIĘCEJ” dokłada po 4.
4. Zero błędów w konsoli pochodzących z /news; wszystkie obrazy ładują się (0 pustych).

## 5. Procedura publikacji (kolejność)
1. Dane w `portals/ccn-news/src/data/articles.ts` (na górze `INITIAL_ARTICLES`) + wpis w `BREAKING_NEWS`.
2. `npm.cmd run build:ccn-news` (SPA + strony statyczne + wyszukiwarka). Sprawdź, czy `szukaj/catalog.json` i `data/cc-search-index.json` zachowały `recommendedToday` i `searchRecommendations` (build je gubi — przywróć z HEAD).
3. `node scripts/build-cc-discovery-signals.mjs` (sitemapy, RSS).
4. Testy: strażnik Premium v1, `test:cc-regression`, `test:guardian`, `test:mobile-premium`.
5. Podgląd lokalny 375 px i 1280 px: hero, artykuł, lista źródeł, konsola.
6. Commit tylko własnych ścieżek (`git commit -- <ścieżki>`), wdrożenie wyłącznie z `main` zgodnie z bramką T4 i zgodą L0.
7. Po wdrożeniu: sprawdzenie na żywo `https://polskieradio.cc/news` i strony artykułu; meldunek KONIEC w Skrzynce.

## 6. Znane luki (do właścicieli, nie naprawiać cudzego kodu)
- Wyskakujące okno asystentki „Rut” (czat CC) zasłania treść artykułu na telefonie przez kilka sekund po wejściu — właściciel czatu.
