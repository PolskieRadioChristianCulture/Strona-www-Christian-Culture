---
name: kc-z-biblia-lekcja
description: Buduje, sprawdza i publikuje codzienną lekcję Kursu Codziennego „Z Biblią za Pan Brat” (akademia/kurscodzienny/dzien-NN) według wzoru Dnia 1. Używaj zawsze, gdy tworzysz lub poprawiasz lekcję, jej grafikę, kartę w spisie kursu albo zapowiedź „Jutro”.
metadata:
  category: Publikacja
  wlasciciel: L0 (Cezary Rogowski)
  autor: "@007 (Claude), 02.11.2026"
---

# Lekcja „Z Biblią za Pan Brat” — standard Dnia 1

Lekcja jest gotowa dopiero wtedy, gdy przejdzie wszystkie kroki poniżej i masz na to dowód.
Ten plik dotyczy strony lekcji. Pozostałe 11 kanałów publikacji opisuje JOMA `Z_BIBLIA_ZA_PAN_BRAT_PROCEDURA_PUBLIKACJI.md`. Obowiązują oba pliki.

## Dlaczego ta umiejętność powstała (02.11.2026)
- Dzień 32 dostał bajtową kopię grafiki Dnia 29.
- Dzień 33 powstał na własnym szablonie i spełniał 9 z 21 elementów: bez lektora, zapisu, przycisku „Do góry” i skryptu udostępniania.
- W Dniach 6–23 kod lektora był wpisany do środka `<script src="…">`, więc przeglądarka go pomijała. W Dniu 23 lektor w ogóle nie działał.
- Raporty mówiły „gotowe”, a strony nie trzymały standardu. Naprawa całego kursu zajęła kilka godzin.

## Zasady stałe
1. **Wzór:** każdą nową lekcję buduj na szkielecie ostatniej lekcji, która ma 21/21 (dziś: Dzień 33). Nigdy nie buduj jej na własnym szablonie ani na starszych dniach.
2. **Treść od L0 przenoś dosłownie.** Jeśli brakuje treści dla któregoś elementu (pytania, decyzja, modlitwa, quiz), zapytaj L0 w Skrzynce. Nie dopisuj treści teologicznej bez jego zgody.
3. **4 identyczne ścieżki:** `akademia/kurscodzienny/dzien-NN.html`, `akademia/kurscodzienny/dzien-NN/index.html` i te same dwie ścieżki w `kursy/`.
4. **Kolor akcji:** pomarańczowy #FF7A00. Przyciski mają minimum 44 px. Na stronach publicznych nie wolno używać słów „Mission Control”.
5. **Skrypty:** znacznik `<script src="…">` zawsze pusty, np. `<script src="/js/cc-daily-course-share.js?v=…" defer></script>`. Kod piszesz w osobnym `<script>`.
6. **Bez sekretów** w plikach, raportach i Skrzynce.

## 21 elementów wzoru (sprawdza je `scripts/check-kc-lesson-standard.mjs`)
tytuł · meta + og:image · canonical bez .html · nagłówek (krój, motyw, A−/A+, lektor, Patronite, logowanie) · nawigacja do dnia poprzedniego i następnego · hero (data, „Podziel się ↓”, grafika 16:9) · werset pamięciowy z przyciskiem „Kopiuj” · karta „Podróż przez 66 Ksiąg” · co najmniej 5 części lekcji · Jezus w centrum · Porównaj wersety · Prawda na dziś · Pytania do serca · quiz (20 pytań) · Twoja decyzja · Modlitwa · Zastosowanie i Twój Zapis · duchowny (#kontakt-duchowny) · skrypt udostępniania · Jutro (#jutro) · Do góry.

## Procedura dla Dnia NN

### A. Przygotowanie
1. Napisz START w Skrzynce: agent `antigravity`, wątek „KC Dzień NN”, zakres plików i czas ISO ze strefą.
2. Pobierz najnowszy stan: `git fetch origin` i `git pull --ff-only`. Pracuj na gałęzi roboczej w worktree.
3. Worktree: `cmd /c mklink /J <worktree>\node_modules <repo>\node_modules`. Przed `git worktree remove` zawsze najpierw `cmd /c rmdir <worktree>\node_modules`. Bez tego skasujesz node_modules w głównym katalogu.

### B. Grafika
1. Plik: `images/academy/daily/kc_day_NN_<temat>.jpg`, 1376×768, motyw zgodny z czytaniem dnia.
2. **Sprawdź, czy grafika jest unikalna**:
   ```bash
   md5sum images/academy/daily/*.jpg | sort | uniq -w32 -D
   ```
   Wynik nie może zawierać nowego pliku. Nigdy nie kopiuj grafiki innego dnia „na razie”.
3. Każde odwołanie do grafiki ma `?v=RRRRMMDD`. Gdy wymieniasz obraz, nadaj mu nową nazwę pliku.

### C. Strona lekcji
1. Skopiuj stronę ostatniego dnia z wynikiem 21/21 i podmień całą treść dnia: tytuł, meta, og:*, canonical, datę i dzień tygodnia, h1, podtytuł, grafikę i podpis, werset oraz tekst przycisku „Kopiuj” (tekst wersetu i skrót, np. „(Wj 2:24–25)”), myśl przewodnią, części lekcji i sekcje wzoru.
2. **Quiz:** podmień `QUIZ_DATA` (20 pytań, format `{q, a, c}`) i zmień wszystkie klucze `kc_dayNN_…` na nowy numer dnia.
3. Uzupełnij brakujące elementy stałe:
   ```bash
   node scripts/align-kc-lessons-day1.mjs NN
   ```
4. **W poprzednim dniu (NN−1)** usuń sekcję `#jutro` ze wszystkich 4 plików i uruchom `node scripts/align-kc-lessons-day1.mjs NN-1`. Zapowiedź „Jutro” dostanie wtedy tytuł i link do Dnia NN. Dodaj też „Dzień NN →” w górnym pasku nawigacji Dnia NN−1.
5. **Pozostałości po kopiowaniu:** wyszukaj zakres i numer dnia, z którego kopiowałeś:
   ```bash
   grep -n "Wj 2\|Dzień 33\|kc_day33\|dzien-33\"" akademia/kurscodzienny/dzien-NN.html
   ```
   Podstaw zakres i numer dnia źródłowego. Zostać mogą tylko świadome odwołania w treści.
6. Sprawdź, czy wszystkie 4 kopie są identyczne:
   ```bash
   md5sum akademia/kurscodzienny/dzien-NN.html akademia/kurscodzienny/dzien-NN/index.html kursy/kurscodzienny/dzien-NN.html kursy/kurscodzienny/dzien-NN/index.html
   ```

### D. Karta w spisie kursu i dane
1. Dodaj kartę dnia we **wszystkich 8 plikach spisu**: akademia.html, akademia/index.html, akademia/kurscodzienny.html, akademia/kurscodzienny/index.html, kursy.html, kursy/index.html, kursy/kurscodzienny.html, kursy/kurscodzienny/index.html.
   Zasady karty: CTA „CZYTAJ DZIEŃ NN (DATA) →”, licznik dni, tylko jedna „DZISIEJSZA LEKCJA” w pliku, a poprzednia karta zmienia się na „DOSTĘPNA TERAZ”.
2. Sprawdź, czy wynik to 8 plików:
   ```bash
   git grep -l 'dzien-NN"' -- akademia.html akademia/index.html akademia/kurscodzienny.html akademia/kurscodzienny/index.html kursy.html kursy/index.html kursy/kurscodzienny.html kursy/kurscodzienny/index.html | wc -l
   ```
   (02.11.2026 Dzień 33 trafił tylko do 2 z 8 plików).
3. Uzupełnij `rozwazania_baza.json` i wyszukiwarkę. Pozostałe kanały opisuje procedura publikacji JOMA.

### E. Sprawdzenie przed commitem (wszystko obowiązkowe)
```powershell
node scripts/check-kc-lesson-standard.mjs NN      # musi być 21/21
node scripts/check-kc-lesson-standard.mjs NN-1    # musi być 21/21
npm.cmd run test:cc-regression
npm.cmd run test:guardian
npm.cmd run test:mobile-premium
```
Potem sprawdź stronę w przeglądarce, lokalnie na serwerze podglądu:
- w konsoli nie ma błędów;
- `typeof toggleAudioLesson`, `typeof toggleReaderFont` i `typeof adjustFontSize` zwracają `'function'`;
- quiz ma 20 pytań i reaguje na kliknięcie;
- „Oznacz Dzień NN jako ukończony” zapisuje stan (`localStorage kc_dayNN_completed`);
- grafika zwraca 200 i ma 1376×768;
- dzień NN−1 linkuje do dnia NN.

### F. Publikacja (push i wdrożenie dopiero po 00:00 dnia publikacji)
1. Jeszcze raz: `git fetch origin` i rebase na `origin/main`. **Nigdy nie wdrażaj ze starego `main`**, bo cofniesz cudze poprawki na produkcji.
2. Sprawdź, co jest na produkcji: `npx.cmd wrangler pages deployment list --project-name polskieradio --environment production`. Commit z produkcji musi być przodkiem Twojego.
3. `node scripts/build-pages-release.mjs` (wymaga czystego drzewa), następnie:
   ```powershell
   npx.cmd wrangler pages deploy .pages-release --project-name polskieradio --branch main --commit-hash <hash> --commit-dirty=false
   ```
4. Na produkcji powtórz sprawdzenie z punktu E dla dni NN i NN−1.
5. `git push origin main` i `git push lumina-repo main`. Skopiuj zmienione pliki do `C:\Users\czark\Desktop\@ICC\LUMINA`.

### G. Raport
Napisz KONIEC w Skrzynce. Raport zawiera: hash commitu, adres wdrożenia, wynik `check-kc-lesson-standard` dla NN i NN−1, wyniki 3 testów, wynik sprawdzenia w przeglądarce na produkcji oraz zrzuty 390 px i 1280 px w `SKRZYNKA/raporty/KC-DZIEN-NN/`.
**„Zrobione” piszesz tylko po sprawdzeniu na produkcji.** Raport bez sprawdzenia w przeglądarce nie jest dowodem.

## Gdy coś się nie zgadza
- `check-kc-lesson-standard` < 21/21: nie publikuj. Jeśli brakuje treści, zapytaj L0. Jeśli brakuje struktury, uruchom `align-kc-lessons-day1.mjs`.
- Grafika powtarza się z innym dniem: nie publikuj, dopóki nie ma własnej grafiki.
- Ktoś inny pracuje nad tymi samymi plikami (Skrzynka, `git status`, nowe commity na origin): uzgodnij to w Skrzynce. Nie nadpisuj cudzej pracy.
