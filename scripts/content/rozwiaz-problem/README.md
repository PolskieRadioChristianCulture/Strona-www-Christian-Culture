# Rozwiąż problem — pakiety kursów

Jeden folder = jeden kurs (`<slug>/`): `kurs.docx` i `fiszki.csv` od L0 oraz `kurs.json`.
Media (wideo, audio, PDF, plakat, obraz og) leżą w folderze strony kursu (`assets` w `kurs.json`).

## Nowy kurs — kolejność

1. L0 przekazuje pakiet w jednym folderze: dokument Word, fiszki CSV, wideo 9:16, audio, PDF.
2. `node scripts/rozwiaz-problem/build.mjs import <slug> "<folder pakietu>"`
   kopiuje Word i CSV, zmienia nazwy plików (bez polskich znaków), kompresuje audio/wideo powyżej 25 MB, robi plakat z wideo.
3. Utwórz `<slug>/kurs.json` na wzór `rzuc-palenie/kurs.json`. Adres: `/Rozwi%C4%85%C5%BCProblem/<slug>`,
   `outFile`: `rozwiaz-problem/<slug>/index.html`, `assets`: `/rozwiaz-problem/<slug>/assets/`. Bez `welcome` wstęp bierze się z akapitu po „Witaj w kursie”.
   Bez `plan` strona pomija kartę 30/90. Obraz og (1200×630) zrób ffmpeg jak `og-rozwiaz-problem.jpg`.
4. `node scripts/rozwiaz-problem/build.mjs build --all` — wszystkie kursy (sekcja „Seria” na każdej stronie wymienia wszystkie kursy).
5. `node scripts/rozwiaz-problem/build.mjs register <slug>` — wyszukiwarka CC (oba pliki katalogu identyczne), `sitemaps/pages.xml`, `llms.txt`, ikona w menu „Kursy”. Opis w `llms-full.txt` dopisz ręcznie.
6. Testy (`npm.cmd run test:cc-regression` zawiera `scripts/rozwiaz-problem.test.mjs`), podgląd, zgoda L0, wydanie.

## Wymagany układ dokumentu Word

Każda lekcja: `Dzień N. Tytuł`, pod nim `MYŚL PRZEWODNIA • …`, potem akapity-nagłówki
`Dzisiaj rozumiemy`, `Zadanie na dziś`, `Biblia w codziennym życiu` (odnośniki, kropka, kontekst), `Krótka modlitwa` — każdy z treścią w następnym akapicie.
Generator przerywa pracę z komunikatem, gdy czegoś brakuje albo numeracja dni się nie zgadza.

Tematy wysokiego ryzyka (alkohol, hazard, narkotyki, pornografia, jedzenie, toksyczna relacja): przed publikacją recenzja specjalisty i pomoc w pierwszej lekcji.
