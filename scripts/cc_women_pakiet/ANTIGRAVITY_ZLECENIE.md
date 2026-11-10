# ZLECENIE DLA ANTIGRAVITY — wykonaj w repozytorium Christian Culture

**Rola:** inżynier full stack / streaming audio. **Cel:** dodać Radio CC Women do istniejącej witryny https://polskieradio.cc/ jako kolejną stację, bez naruszania pozostałych.

## Faza 0: inwentaryzacja
- Otwórz rzeczywiste repo i zidentyfikuj komponent menu stacji, jego konfigurację, bibliotekę audio oraz deployment.
- Zidentyfikuj liczbę istniejących wpisów w kodzie (planowana stacja nr 7, ale nie zakładaj stanu bez weryfikacji).
- Sprawdź jak obecne stacje realizują sygnał i metadane, czy dostępny jest hosting 24/7 w istniejącym planie i bez dodatkowych kosztów.
- Zrób kopię konfiguracji i bezpieczną gałąź; nie zastępuj bieżącego kodu playera nową aplikacją.

## Faza 1: źródło muzyki
- Referencyjna playlista: `PLPkpY3wBciWM` — tylko identyfikator katalogowy.
- Uzyskaj od właściciela **oryginalne pliki, uprawnienia i metadane**. Zakaz pobierania ścieżek audio z YouTube.
- Utwórz manifest audio: id, tytuł, wykonawca, lokalizacja, status praw, licencja, czas, hash. Kontroluj duplikaty.
- Zbuduj M3U z zatwierdzonych plików, bez nieautoryzowanych linków.

## Faza 2: nadawanie
- Preferuj istniejącą platformę streamingu; inaczej skonfiguruj Liquidsoap + Icecast na działającej już infrastrukturze 24/7.
- Wykorzystaj `stream/ccw.liq.template` jako punkt startowy. **Zweryfikuj składnię dokładnie na zainstalowanej wersji Liquidsoap (`liquidsoap --check`).**
- `mode="randomize"`, `loop=true`, `reload_mode="watch"`; dla 0 plików nie startuj, dla 1 pliku dopuszczalne zapętlenie.
- Unikaj powtórki na granicy rund poprzez dodatkowy scheduler, jeśli wymóg jest obowiązkowy (sama biblioteka tego nie gwarantuje).
- Przygotuj bezpieczny fallback i monitoring źródła; testuj po restarcie hosta.
- Ustaw HTTPS dla publicznego streamu, CORS zgodnie z architekturą, nie ujawniaj loginów/hasła Icecast w frontendzie.
- Bitrate 128 kb/s MP3 jako domyślny kompromis; dostosuj do istniejącej infrastruktury.

## Faza 3: UI
- Dodaj jedną pozycję `RADIO CC WOMEN` i kwadratową ikonę `assets/ccw-icon.png`.
- Kolor punktu/akcentu różowy. Zachowaj identyczne układy, rozmiary, mobile, kontrast, klawiaturę i aria-label jak reszta stacji.
- Wykorzystaj istniejący wspólny element Audio. Kliknięcie CCW wstrzymuje poprzednią stację, zmienia src i uruchamia CCW zgodnie z inicjatywą użytkownika.
- Pokaż buforowanie/błąd/retry; metadane aktualnego utworu tylko jeśli dostępne i wiarygodne.
- Nie twórz ukrytego iframe ani nie usuwaj warstwy wideo z YouTube.

## Faza 4: QA i wdrożenie
- Testy macierzy w `CHECKLISTA_ODBIORU.md`. Sprawdź Android Chrome, Safari iOS, desktop.
- Zweryfikuj równoległe odtwarzanie, odtwarzanie po zmianie stacji i po utracie sieci, API browser autoplay.
- Sprawdź bezpośredni URL streamu, HTTPS, CORS, MIME i nagłówki cache.
- Wdrożenie etapowe z rollbackiem; żadnych opłat bez potwierdzenia.

## Obowiązkowy raport końcowy
1. Ścieżki zmienionych plików i commit.
2. Wynik audytu zastanej architektury.
3. Wariant platformy i uzasadnienie ZERO COST.
4. URL streamu i testy dostępności (bez sekretów), jeśli działa.
5. Wyniki testów i regresji.
6. Prawa do utworów: potwierdzone / brak.
7. Status: `LIVE`, `READY_FOR_AUDIO_ASSETS`, `BLOCKED_HOSTING`, `BLOCKED_RIGHTS` lub `FAILED_TESTS`.
