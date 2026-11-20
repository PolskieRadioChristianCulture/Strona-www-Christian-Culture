# Oficjalne Wzorce Graficzne CCN NEWS Christian Culture

Wszystkie nowe publikacje portalu **CCN NEWS** muszą ściśle rozdzielać oba formaty graficzne:

## 1. Baner główny artykułu na WWW (3:1 panoramiczny — BEZ „Link w komentarzu”)
- **Plik wzorcowy:** `images/brand/ccn-news-templates/ccn-news-article-banner-3x1-template.jpg` (`1024×341`, proporcja `3:1`)
- **Generator programowy:** `scripts/generate-ccn-article-banner.mjs` (wyjście domyślne `1536×512` `3:1`, JPG)
- **Zasady kompozycji:**
  - Lewa strona (~58%): tematyczna ilustracja/zdjęcie z płynnym białym przejściem ku prawej strefie.
  - Lewy górny róg: skośna biała wstęga z oficjalnym logo `CCN NEWS Christian Culture` i czerwoną linią skośną u dołu.
  - Prawa strona (~42%): białe/jasnosrebrne tło studyjne z subtelną siatką punktów, granatowy pogrubiony pochylony nagłówek (`#0F1B33`), wyróżniona czerwona skośna wstęga z białym tekstem (`#9E0B1C`), dolny akcent między cienkimi liniami (`— ... —`) oraz czerwona podwójna wstęga w prawym dolnym rogu.
  - **KATEGORYCZNY ZAKAZ:** Na banerach artykułowych 3:1 NIE wolno umieszczać napisu „Link w komentarzu”.

## 2. Kwadratowa grafika posta na Facebooka (1:1 `1080×1080` — Z napisem „Link w komentarzu”)
- **Pliki wzorcowe:** `images/brand/ccn-news-templates/ccn-news-template-1x1-guide.jpg`, `ccn-news-example-1x1.jpg`
- **Generator programowy:** `scripts/generate-ccn-fb-square-card.mjs` (`1080×1080` JPG)
- **Zasady kompozycji:**
  - Górna strefa (~59%): tematyczne zdjęcie z miękkim białym przejściem u dołu i logo `CCN NEWS` w lewym górnym rogu.
  - Dolna strefa: wyśrodkowany pogrubiony tytuł w kolorze ciemnego bordo (`#7A0B24`), pozioma cienka linia i wyśrodkowany podpis `Link w komentarzu`.
