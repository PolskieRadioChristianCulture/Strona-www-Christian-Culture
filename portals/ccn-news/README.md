# Kanoniczne źródło CCN News

Odzyskane 2026-10-03 z bieżącego źródła AntyGravity. Build niezmienionego JS odpowiadał opublikowanemu `news-index-C4bNWhrd.js` po normalizacji CRLF. Zachowano aktualne treści i funkcje; poprawka dotyczy przewijania nagłówka oraz pierwszego widoku strony.

Z katalogu repo: `npm run build:ccn-news`. Zależności tej aplikacji: `npm ci --prefix portals/ccn-news`. Polecenie build wytwarza hashed assets oraz zgodne `news.html` i `news/index.html`. Nie używaj `scripts/build_all_in_news_src.cjs` do przebudowy `/news`; historyczne narzędzie dotyczy innych portali i roboczego scratch.

Po build: `npm run test:cc-regression`, pozostałe wymagane kontrole i rzeczywista próba przewijania belki przy 320/390/1280 px. Reguła nadrzędna: `CC_NO_REGRESSION_POLICY.md`. Dodatkowe źródła i `node_modules` nie należą do publicznego artifact Pages.

## Standard CCN News Premium v1 (L0, 23.11.2026)
Każdy nowy artykuł i każda zmiana `/news` spełnia `STANDARD_CCN_NEWS_PREMIUM.md` (ten folder; kopia w JOMA: `CCN_NEWS_STANDARD_PREMIUM_V1.md`). Strażnik: `node --test scripts/ccn-news-premium-standard.test.mjs`.
