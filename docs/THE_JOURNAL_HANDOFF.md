# THE JOURNAL — punkt kontynuacji dla agentów

Aktualizacja: 4 listopada 2026. Właściciel: Cezary Rogowski („Czarku”). Agent przygotowujący: codex. Najpierw przeczytaj główne AGENTS.md, Konstytucję i protokół Skrzynki; ten dokument ich nie zastępuje.

## Co właściciel zlecił teraz

1. Zmienić podpis na „Strona projektu THE JOURNAL · książka i aplikacja w przygotowaniu”.
2. Dodać newsletter o nowościach i aktualizacjach THE JOURNAL.
3. Dodać wspólny panel krawędziowy z „+” i przycisk przewijania na górę.
4. Obowiązkowo pokazać przycisk **wspieramTO**, prowadzący do istniejącej strony `/wspieraj`.
5. Przygotować ścieżkę dalszego rozwoju i instrukcje przekazania.
6. Opublikować dostarczone days-90.json, KARTA_DZIENNA.pdf (1 strona) i THE_JOURNAL_90_DNI.pdf (95 stron). Oryginalne pliki zachowano bez zmian; moduł days.js jest wiernym eksportem JSON.

Zgoda na wcześniejszą publikację strony i dalsze poprawki jest w tym samym czacie. Nie pytaj ponownie o ten sam zakres tylko dlatego, że zmienił się agent. Nie omijaj jednak kontroli uprawnień, wymaganych testów ani ograniczeń wysyłki wiadomości.

## Rzeczywisty stan — rozdziel lokalne i publiczne

Publiczna strona `/the-journal` została wcześniej opublikowana i odebrana. Ostatni potwierdzony w tej sesji odbiór publiczny: 4.11 ok. 15:54 Europe/Warsaw, main `2020ab623378059d4bbf8d60b7f098e547fc85db`, Pages `1b7279fd-0049-4936-9022-b09a539643ec`. To historyczny punkt odniesienia, nie gwarancja aktualnego deploymentu.

**Pakiet aktualizacji:** pełne treści 90 dni z pliku właściciela, oryginalne PDF-y, newsletter, panel +, do góry i wspieramTO. Dowód konkretnej publikacji (SHA, Pages ID, wynik domeny) zapisywany jest po wdrożeniu w prywatnym JOMA_HANDOFFS.md i raporcie THE-JOURNAL-20261104. Nie uznawaj samego tego dokumentu za dowód produkcji.

Wcześniejszy błąd automatycznej kontroli uprawnień ustąpił: zatwierdzone uruchomienie pełnej regresji zakończyło się 536 PASS, 1 SKIP, 0 FAIL. Test dowiązań Windows przeszedł bez pomijania. Odbiór Chrome obejmuje cztery szerokości, panel, newsletter bez realnej wysyłki i przycisk do góry; poprawiono brak nonce w dodatkowym stylu wspólnego przycisku.
## Gdzie jest praca

- Główny checkout: `C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc`.
- **Zmiany do odbioru:** `C:\Users\czark\Desktop\@ICC\_wydania\the-journal-release-20261104`.
- Gałąź: `codex/the-journal-release-20261104`, baza obecnej poprawki: `2020ab623378059d4bbf8d60b7f098e547fc85db`.
- Raporty i lokalne skrypty QA: `C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc\prototypes\the-journal\qa`.
- Prywatny raport i kopia zmian: `C:\Users\czark\Desktop\@ICC\Misja CC\JOMA_SHARED_MEMORY\SKRZYNKA\raporty\THE-JOURNAL-20261104`.
- Paczka pierwotna: `C:\Users\czark\Downloads\CC_THE_JOURNAL_Codex_v0.1.zip`; zachowana także w `prototypes/the-journal/source/CC_THE_JOURNAL_Codex`.
- Czat właściciela: `01a1a6a7-352a-7891-a833-464effbee120`.

Nie usuwaj worktree i nie rób `git reset --hard`, `git clean` lub zbiorczego cofania zmian. Wspólny checkout ma cudze pliki i aktywne prace nad lekcjami/News. Przy zmianie bazy scalaj najnowsze publikacje; nie wdrażaj starego pełnego wydania.

## Co przygotowano w poprawce

- `the-journal/index.html`: nowy podpis, blok newslettera, oryginalny przycisk „+” jako wyzwalacz wspólnego panelu, wspieramTO w stopce. Własny równoległy drawer usunięty.
- `the-journal/app.js`: używa `CCMobileEdge.mount`, nie nowego kontrolera nawigacji; newsletter otwiera `CCNewsletter.open` z kategorią `the-journal`.
- `the-journal/style.css`: układ sekcji, widoczny „+” na komputerze i telefonie, wsparcie, ukrycie nieaktywnych na tej stronie ulubionych/przełączników języka. Informacja w panelu prowadzi do opisu pamiętnika.
- `js/cc-mobile-edge.js`: opcjonalny `allowDesktop`, domyślnie wyłączony dla istniejących stron; nonce stylów; bez wbudowanego atrybutu style w HTML obrazka.
- `js/cc-back-to-top.js`: istniejący przycisk i omijanie kolizji; nonce stylów.
- `js/cc-newsletter.js`: dodatkowa kategoria, identyfikacja strony THE JOURNAL, jej wstępne zaznaczenie, nonce stylów; zgoda nadal domyślnie odznaczona.
- `services/cc-newsletter/templates.js`: temat `topic_the_journal`, slug `the-journal`. Korzysta z istniejącego seedowania `newsletter_topics`, nie nowej bazy.
- `newsletter.html`: ten sam temat dostępny również w centralnym formularzu.
- `_worker.js`: ten sam losowy nonce w CSP i meta `cc-csp-nonce`; używany przez style wspólnych modułów. Zachowany restrykcyjny CSP, brak `unsafe-inline`. Nie zmieniaj ochrony wszystkich stron z powodu tego jednego projektu.
- `scripts/cc-page-standard.mjs`: landing nadal sam wybiera zatwierdzone moduły; build nie dopina mu pełnego czatu, wyszukiwarki i niezależnych trackerów.
- `scripts/the-journal-routing.test.mjs`, `tests/cc-newsletter.test.mjs`: nowe kontrakty i regresje.

## Potwierdzone lokalnie

- Testy THE JOURNAL + newsletter: **32/32 PASS**, w tym potwierdzenie subskrypcji testowej przez istniejący Double Opt-In, wyłącznie w repozytorium pamięciowym, bez wysyłki do prawdziwej skrzynki.
- Panel w modelu DOM: jeden wyzwalacz, otwieranie na komputerze, zamknięcie, nonce stylów panelu i przycisku do góry.
- Regresja mobilna repo: **24/24 PASS**.
- Strażnik Kodu: **0 naruszeń**.
- Pełna regresja: **536 PASS, 1 SKIP, 0 FAIL**; CC LIFE: **18/18 PASS**.
- `node --check` i `git diff --check` przechodzą.

Chrome: odebrano render 1440/768/390/320 px, bez błędów JS/CSP. Formularz wysyłki był przechwycony, bez maila. Nie przeprowadzono odbioru telefonu fizycznego ani realnej dostawy maila; nie zastępuj ich atrapą API. Publiczna usługa przed wdrożeniem: deliveryEnabled=true; po wdrożeniu sprawdź nowy temat.

## Pierwszy następny etap: odbiór i publikacja poprawki

1. Odczytaj Skrzynkę i aktualne rezerwacje, zgłoś START, uzgodnij jednego publikującego. Sprawdź `git status`, oba zdalne main i obecne Pages. Nie zakładaj, że podane wyżej SHA są najnowsze.
2. Przywróć działającą bramkę zatwierdzania; nie obchodź błędu automatycznej kontroli. Do tego momentu pozostań przy bezpiecznych czynnościach lokalnych.
3. W worktree uruchom:

```powershell
node --test scripts/the-journal-routing.test.mjs tests/cc-newsletter.test.mjs
node scripts/straznik-kodu-check.js
node --test scripts/mobile-premium-regression.test.mjs
npm.cmd run test:cc-regression
```

4. Uruchom przygotowany skrypt `qa/verify-controls.mjs` z katalogu `prototypes/the-journal`, przekazując jako pierwszy argument pełną ścieżkę worktree. Korzysta z lokalnego serwera i istniejącego Playwright. Wysłanie formularza jest przechwytywane, aby nie wysłać prawdziwego maila. Obejrzyj zrzuty 1440/768/390/320 px. Jeżeli skrypt wymaga aktualizacji do nowego renderu, napraw go na podstawie zachowania, nie usuwaj sprawdzeń.
5. W przeglądarce sprawdź: dokładny podpis; pojedynczy widoczny „+”; lewy panel i Escape; poprawny fokus; otwarcie newslettera z panelu i sekcji; zgoda odznaczona; wybrany tylko THE JOURNAL; czytelny błąd API i brak fałszywego sukcesu; przycisk do góry po przewinięciu; wspieramTO kieruje do `/wspieraj`; brak poziomego przewijania i błędów CSP.
6. Odczytaj publiczne `/api/newsletter/topics`: kategoria `the-journal` musi być obecna i aktywna. Zweryfikuj `deliveryEnabled`. Gdy dostawa jest wyłączona lub zapis trwały niedostępny, nie deklaruj działającej dostawy. Nie włączaj nowego płatnego dostawcy ani globalnych flag bez zgody.
7. Realny test Double Opt-In wykonuj wyłącznie na adresie przeznaczonym do takiego testu i po wyraźnej autoryzacji wysyłki. Nie zapisuj fikcyjnych adresów do produkcji. Bez realnego testu raportuj precyzyjnie granicę dowodu.
8. Po zielonych kontrolach pokaż scoped diff; zatwierdź wyłącznie pliki tej poprawki. Oba remotes muszą zawierać ten sam commit. Buduj `node scripts/build-pages-release.mjs` z czystego stanu i sprawdź, że nie ma tam `prototypes`, QA, instrukcji ani danych prywatnych.
9. Publikuj istniejący projekt Cloudflare Pages `polskieradio`, gałąź `main`; użyj zainstalowanego Wranglera i zweryfikowanych flag. Sprawdź najnowszą produkcję tuż przed deployem, aby nie cofnąć innego agenta.
10. Powtórz skrypt z `--production` oraz ręczny odbiór publicznego URL; zachowaj desktop/mobile i ID aktualnego wdrożenia. Dopisz wynik do JOMA_HANDOFFS i wyślij KONIEC. Jeżeli równoległe nowsze wydanie weszło w międzyczasie, sprawdź ponownie właśnie je.

Rollback: cofać wyłącznie tę poprawkę na aktualnym main. Nie cofać całego Pages do starego wdrożenia kosztem nowych artykułów lub lekcji. Brak nowych kont i migracji tabel; zadeklarowany temat newslettera zostawiać dla istniejących subskrypcji, nie usuwać ich danych przy wycofaniu UI.

## Stałe granice projektu

- `/the-journal` jest kanoniczny; `/90dni`, `/moj-dzien`, `/twoja-historia` pozostają przekierowaniami301.
- `/nastolatki` jest zarezerwowane na **PORTAL MŁODYCH**. Nie zajmować go kopią landingu.
- Trzy grafiki Czarka mają pierwszeństwo. Nie generować zamienników logo, osób i okładki bez polecenia.
- WspieramTO jest obowiązkowym widocznym wejściem do istniejącego `/wspieraj` oraz pozostaje w panelu jako wsparcie.
- Newsletter: osobny temat, świadoma zgoda16+, Double Opt-In i wypis. Dla młodszych zapisuje się opiekun na swój adres. Nie łączyć maila z nastrojem, notatkami ani deklaracją wyznania.
- Dodanie newslettera nie uruchamia automatycznej wysyłki po każdym commicie. Kampanie wymagają przygotowanej, zatwierdzonej treści i istniejącego obiegu wysyłki; nie obiecywać monitorowania24/7.
- GA4 jest dobrowolne. Nie wysyłać adresu e-mail, odpowiedzi, wybranego dnia, emocji ani treści pól. Nie ładować na tę stronę ogólnego trackera formularzy tylko dla wygody.
- Tylko tytuł THE JOURNAL i marka CHRISTIAN CULTURE po angielsku; cała reszta po polsku. Minimum44px, Escape, fokus, reduced motion.
- Nie obiecywać leczenia, diagnozy lub gwarantowanego spokoju. Inspiracje biblijne są autorskimi refleksjami, nie dosłownymi cytatami ani objawieniem AI.

## Dalszy rozwój — osobne, małe etapy

### P1. Pełna autorska treść
Właściciel dostarczył pełne 90 unikalnych dni, 9 etapów, pytania, małe kroki, pytania wieczorne i opcjonalne inspiracje. Zastąpiły dawny zalążek z powtarzanymi refleksjami. Źródło: the-journal/data/days-90.json; moduł days.js musi zachować zgodność z JSON. PDF-y w the-journal/downloads są oryginałami właściciela. Aktualizując materiał, synchronizuj stronę, moduł, JSON i PDF-y oraz ich sprawdzane sumy. Następny etap to redakcja, korekta i konsultacja psychologa dzieci i młodzieży. Nie deklarować fikcyjnej recenzji eksperta ani gotowości PDF/X. Wersja PDF dostępna nie oznacza gotowej aplikacji lub zakończonego wydania drukowanego.
### P2. Aplikacja prywatnego dziennika
Najpierw odrębny przegląd prywatności. Wersja podstawowa bez kont i bez backendu emocji: dobrowolny zapis w przeglądarce, jawna informacja o wspólnym urządzeniu, eksport/import i usuwanie. Zapis i błędy muszą być prawdziwe. Testować powrót po odświeżeniu, rozdzielenie dni, limit/importXSS, utratę storage i brak transmisji notatek do sieci. Nie łączyć z GA4, newsletterem, LUMINA, JOMA ani AI. Synchronizacja lub konta wymagają nowego, jawnego zakresu i analizy danych nieletnich.

### P3. Wydanie papierowe
Po zatwierdzeniu treści uzgodnić format, objętość, papier i oprawę z wydawcą/drukarnią. Dostarczona okładka jest makietą, nie finalnym plikiem drukarskim. Tekst jako prawdziwa typografia, osobne warstwy, legalne fonty, spady/ICC/CMYK według drukarni, preflight i próbny wydruk. Szacunek232 stron z ZIP nie jest zatwierdzoną specyfikacją. Druk z przeglądarki nie jest PDF/X.

### P4. PORTAL MŁODYCH — `/nastolatki`
Po osobnym rozpoczęciu zadania określić mapę działów i redakcję; THE JOURNAL jako jeden z modułów z linkiem do istniejącego kanonicznego adresu. Adaptować wspólną nawigację, wyszukiwarkę i standardy CC. Nie budować równoległych kont, newslettera lub bazy. Każdy dział powinien mieć właściciela treści, aktualne źródła, kryterium odbioru i osobną zgodę publikacyjną.

Zamykaj etapy dopiero dowodem: kod lokalny, repozytoria, deployment, domena, przeglądarka, telefon i dostawa poczty to osobne stany. Długie szczegóły do JOMA, do Czarka maksymalnie3 krótkie linie po polsku.

