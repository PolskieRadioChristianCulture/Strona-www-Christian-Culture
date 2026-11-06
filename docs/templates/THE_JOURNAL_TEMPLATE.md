# THE JOURNAL — wzorzec portali dla grup CC, wersja 1

Decyzja Czarka z 4 listopada 2026: zachować https://polskieradio.cc/the-journal jako wzorzec podobnych projektów dla seniorów, małżeństw oraz innych grup wiekowych i społecznych. Portal Seniora jest następnym zamiarem; szczegółowe wytyczne właściciel prześle później. Nie ustalono jeszcze adresu, treści ani funkcji tego portalu.

## Zachowane źródło

- Repozytorium: `C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc`.
- Wzorcowy commit: `1b1356c320d28eb9b855ddcfa8c15521ae79048d`.
- Potwierdzone wydanie THE JOURNAL: Pages `74576a4c-7dd6-45e0-b801-fd77bb72579c`.
- Prywatna paczka: `C:\Users\czark\Desktop\@ICC\Misja CC\JOMA_SHARED_MEMORY\SZABLONY\CC_PORTALE_GRUPOWE\THE_JOURNAL_v1_20261104` oraz sąsiedni plik ZIP.
- Paczka zawiera źródła strony, jej trzy grafiki, treści i PDF-y jako materiał referencyjny, kopie wspólnych modułów, testy referencyjne, podgląd komputera i pełnej strony mobilnej, instrukcję i manifest SHA256. Nie zawiera zależności npm, kont, danych subskrybentów, sekretów ani konfiguracji dostępu.
- To wzorzec istniejącej strony repozytorium CC. Nie jest osobnym wdrożeniem ani zarejestrowanym szablonem w galerii Sites.

## Co przenosić do nowych projektów

1. Duży fotograficzny hero, wyraźny tytuł i krótka obietnica dopasowana do odbiorców. Grafika projektu ma pierwszeństwo, ważna treść pozostaje czytelnym tekstem HTML.
2. Ciemne tło, ciepły złoty akcent, jasna sekcja do spokojnego czytania, duże odstępy i oszczędna animacja. Zachowane kolory i geometria są w `the-journal/style.css`; nowe akcenty uzgodnić z tożsamością CC i materiałami właściciela.
3. Sekwencja: hero → o projekcie → próbka treści/narzędzie → materiały do pobrania → proste kroki → newsletter → FAQ → stopka i wsparcie. Sekcje dobierać do rzeczywistych materiałów, bez pustych obietnic.
4. Wspólny panel krawędziowy otwierany przyciskiem „+”, wspólny przycisk do góry i obowiązkowy widoczny przycisk **wspieramTO**, prowadzący do `/wspieraj`. Bez równoległych implementacji paneli.
5. Newsletter przez istniejące `CCNewsletter`: osobna kategoria projektu, świadoma zgoda, Double Opt-In, możliwość wypisu. Bez samoczynnego dopisywania osób i bez automatycznych kampanii po wdrożeniu.
6. Osobny adres kanoniczny, polskie meta/OG, właściwe dane strukturalne, FAQ zgodne z treścią, katalog wyszukiwarki CC, sitemap i `llms.txt`. Statystyki GA4 wyłącznie po zgodzie, bez danych formularzy i prywatnych odpowiedzi.
7. Responsywność od 320 px, czytelny kontrast, przyciski minimum 44 px, obsługa klawiatury, Escape, powrót fokusu i ograniczenie ruchu. Dla seniorów priorytetem będą większy czytelny tekst, proste nazwy działań i wygodna nawigacja — szczegóły po briefie.

## Jak używać bez kopiowania cudzej treści projektu

Zacznij od nowego katalogu/gałęzi i pełnych wytycznych grupy docelowej. Kopię w paczce traktuj jako zamrożony materiał odniesienia, a wspólne moduły pobieraj z aktualnego repo po porównaniu zmian. Nie nadpisuj nimi nowszych plików ekosystemu.

Nie przenoś automatycznie oznaczeń 13–17 lat, programu 90 dni, okładki, młodzieżowych fotografii, pytań o emocje, PDF-ów, statusu książki/aplikacji, identyfikatora newslettera `the-journal` ani dotychczasowych canonicali i aliasów. Zastąp je zatwierdzonym materiałem nowego projektu; nie generuj fikcyjnych rekomendacji ekspertów, liczb lub świadectw. Nie zmieniaj istniejącego THE JOURNAL przy adaptowaniu nowej strony.

Paczka nie jest samodzielnym serwerem. THE JOURNAL korzysta ze wspólnych ścieżek `/js`, `/css`, `/images`, istniejącej usługi newslettera i routingu `_worker.js`. Integruj z nimi nową stronę, nie twórz drugiej usługi. Oryginalne reguły routingu i nagłówków sprawdzaj w commitcie źródłowym i bieżącym repo; nie zastępuj całego Workera.

Przy przenoszeniu zachowaj izolację stylów, restrykcyjny CSP i mechanizm nonce wspólnych stylów. Skopiowanie inline stylów bez nonce może zablokować kontrolki. Zmieniaj wersje adresów aplikacji, stylów i importowanych danych po aktualizacji: odbiór THE JOURNAL wykrył stare dni z cache, naprawione wersjonowaniem plików.

Treści osobiste nie trafiają do GA, newslettera lub AI. Konta, zapis odpowiedzi, synchronizacja i dane wrażliwe wymagają osobnego zdefiniowania zakresu i oceny prywatności; sam szablon ich nie uruchamia.

## Odbiór i kontynuacja

Przed implementacją: Skrzynka, rezerwacje, aktualne `AGENTS.md`, Konstytucja i stan Git. Każdy nowy portal otrzymuje własne kryteria odbioru i treści. Wymagane testy repo i CC LIFE stosuj zgodnie z instrukcjami właściciela; publikacja dopiero po zielonych kontrolach i autoryzacji danego projektu.

Odbiór obejmuje komputer i widoki mobilne, wszystkie działania, rzeczywiste linki pobierania i ich zgodność z oryginałami, formularze bez fałszywego sukcesu, błędy JS/CSP, SEO oraz aktualną stronę publiczną po deployu. Przechwycenie API w teście nie dowodzi dostawy maila; widok mobilny przeglądarki nie jest testem fizycznego telefonu. Dowody do JOMA.

Najbliższy krok: otrzymać wytyczne Czarka dla **Portalu Seniora**, dopasować strukturę i treści, następnie przygotować wersję do odbioru. Kolejne zamierzone adaptacje: małżeństwa i inne grupy. `/nastolatki` nadal pozostaje osobnym zamiarem PORTALU MŁODYCH.
