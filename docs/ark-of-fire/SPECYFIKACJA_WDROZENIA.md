# ARK OF FIRE — SPECYFIKACJA WDROŻENIA CCN / Antigravity / Codex / Claude Code

## Cel i status
- Dostarczono dwujęzyczną, statyczną wersję demonstracyjną PL/EN. Wersję należy traktować jako PRIVATE PREVIEW.
- Nie uruchamiać publicznie przed pisemną, jednoznaczną akceptacją Ark of Fire. Przed wydaniem należy umożliwić artyście sprawdzenie obu wersji, w tym tłumaczenia.
- **Anonimowość założyciela jest bezwzględna**. Nie zbierać ani nie publikować jego danych, wizerunku, biografii pozwalającej ustalić tożsamość ani metadanych prywatnych plików.
- Layla Farzal: fikcyjna, cyfrowa tożsamość wokalna/alter ego wspomagane AI, nie rzeczywista wokalistka.

## Design
- Wzorzec UX: /Welch/en/, ale design autorski Ark of Fire. Hero: PRZESŁANY PLIK `assets/ark-of-fire-hero.webp` (1536 × 864). Bez generowania innego hero; nie zmieniać logo ani krzyża w grafice.
- Kolory: niemal czarny #080809, ciemny grafit #101013, złoto #c5a16c; bez generycznych efektów fantasy, ruchomych iskier i ciężkich bibliotek.
- Przycisk `+` wyłącznie jeden, integracja z prawdziwym panelem krawędziowym CC po audycie istniejącego komponentu. Aktualny lokalny panel to fallback w demonstracji, **nie zastępuje produkcyjnej integracji**.
- Hero pełnoekranowy, responsywny; zachować logo w centralnej części grafiki. Uwaga: centralne logo już na grafice, więc tekst `ARK OF FIRE` jest dodatkowym nagłówkiem typograficznym i wymaga oceny kolizji z grafiką na telefonach. Dostroić pozycję/rozmiar po testach 360, 390, 430, 768, 1440 px.
- `prefers-reduced-motion`, aria, ESC, skip link, klawiatura, kontrasty i czytelność.

## Treść
- Źródła: oryginalne świadectwo i komunikaty Ark of Fire dostarczone przez Cezarego, oraz publiczne strony ark-of-fire.com, /music, /discography, /press-radio-promo.
- Nie dopowiadać dat, nazwisk, faktów z życia założyciela ani cytatów. W tym pakiecie wyrazy typu „założyciel” oznaczają anonimowego twórcę projektu.
- Cytat w sekcji testimony jest adaptacją polskiego listu, do zweryfikowania i zatwierdzenia wraz z angielską wersją przez artystę; nie jest dosłownym cytatem z oficjalnej angielskiej strony.
- Album HEARTS ABLAZE — 16 utworów, album FAITH — 17 utworów, singiel IT IS FINISHED — 19.10.2026 według oficjalnej dyskografii.
- Nie przedstawiać AI jako osoby. Nie promować fałszywych sesji koncertowych z Laylą.

## Media i licencje — BLOKADA P0
- Nie pobierać i nie dołączać do witryny prywatnego linku WAV otrzymanego mailem. Nigdy nie wprowadzać jego URL do repo, HTML, JS, logów, sitemap ani zasobów publicznych.
- Materiały oficjalnej strony są dostępne do **projektowania i przeglądu**. Dalsze kopiowanie na serwer CC musi być objęte pisemną zgodą.
- Okładki są teraz wyświetlane z oficjalnych URL jako robocze odwołania. Po uzyskaniu praw zrobić lokalne zoptymalizowane wersje (WebP/AVIF), oznaczenia źródła i archiwum zgodności.
- Osadzanie oficjalnego filmu YouTube dopuszczalne dopiero po finalnej akceptacji strony i sprawdzeniu warunków osadzania. Obecnie jest link do oficjalnego press page.
- 17 publicznych 20-sekundowych próbek: NIE pobierać i NIE mirrorować bez zgody. Ewentualnie stosować oficjalne, dozwolone odtwarzacze.
- Emisja na antenie, w LIVE i w archiwum YouTube wymaga osobnej, konkretnej zgody i weryfikacji praw i Content ID. Osobne on-demand wymaga osobnej zgody.

## Integracja EkoCC
- Po audycie repo dołączyć natywny edge panel `+`, global radio bez podwójnego streamu, wizytówkę w /Global/, #TOPTEN tylko gdy regulamin, zgoda i tryb utworu pozwalają, Newsletter https://polskieradio.cc/newsletter.
- Nie publikować prywatnych elementów i nie deklarować aktywnej współpracy emisyjnej przed umową.
- Wykonać content registry CCN Artist z flagami `artist_approval: pending`, `radio_license: false`, `youtube_archive: false`, `on_demand: false`, `allow_indexing:false`.

## SEO i wdrożenie
- Proponowane ścieżki `/ArkOfFire/en/` oraz `/ArkOfFire/pl/`; potwierdzić routingi z rzeczywistym repo i nie nadpisywać żadnych istniejących plików.
- Prywatny staging za uwierzytelnieniem / Cloudflare Access; sam noindex i robots.txt **nie zapewniają prywatności**. Jeżeli staging jest publicznie osiągalny, oznaczyć go wyraźnie jako demonstrację; nie udawać środowiska prywatnego.
- Do zatwierdzenia: noindex,nofollow,noarchive + robots disallow; nie dodawać do sitemap ani wyszukiwarki CC.
- Po **udokumentowanej pisemnej akceptacji**: wprowadzić korekty artysty, zatwierdzić prawa do zdjęć i tekstów, zgłosić wdrożenie do @005, uzyskać release approval, dopiero wtedy zdjąć blokadę indeksacji, dodać canonical/hreflang, MusicGroup/MusicAlbum/MusicRecording ze zweryfikowanymi faktami, sitemap, OpenGraph i linkowanie Global.

## Testy akceptacyjne
1. Strony pl/en mają komplet treści, działający link językowy i prawidłowe `lang`.
2. Zero publicznych plików WAV, zero prywatnych tokenów w repo i assetach.
3. W repo nie ma nazwiska założyciela, niezależnie od danych metadanych.
4. Jeden przycisk + i poprawny panel na wszystkich viewportach.
5. Core Web Vitals: LCP <2.5 s, CLS <0.1, INP <200 ms jako cele, gdy możliwe; lazy loading obrazów poniżej hero.
6. Linki do oficjalnych źródeł, newslettera, Global i #TOPTEN działają.
7. Staging nie jest publicznie indeksowany, a najlepiej wymaga logowania.
8. Dwie wersje językowe zaakceptowane pisemnie przez Ark of Fire przed produkcją.
9. Rzeczywista architektura EkoCC oraz panel `+` nie zostały nadpisane przez demo.

## Instrukcja dla wykonawcy
Rozpakuj ZIP; otwórz `/en/index.html` lub `/pl/index.html` przez lokalny serwer statyczny (`python -m http.server 8080`). Nie uruchamiaj `deploy --prod`. Zrób audyt repo i przygotuj Pull Request / preview. Nie przekraczaj ZERO COST. Zgłoś braki i żądania akceptacji przed publicznym release.
