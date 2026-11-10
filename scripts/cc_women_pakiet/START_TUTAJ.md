# RADIO CC WOMEN — pakiet wdrożeniowy dla Antigravity

**Wersja:** 1.0 · **Data:** 10.11.2026 · **Projekt:** Christian Culture, https://polskieradio.cc/

## CEL
Dodać **Radio CC Women (CCW)** do istniejącego wyboru stacji jako **kolejną (planowaną siódmą)** stację radiową w trybie audio-only, 24/7. Ikona 1:1 z załącznika. Żadnego wideo, ukrytego iframe YouTube ani streamu OBS. Używać wyłącznie plików audio / źródeł z prawem do transmisji.

**Przekazana playlista YouTube (wyłącznie katalog odniesienia):** https://www.youtube.com/playlist?list=PLPkpY3wBciWM

NIE pobieraj, nie rozdzielaj audio/wideo i nie obchodź zabezpieczeń YouTube. Nie traktuj iframe jako źródła stacji audio-only. Zasady: https://developers.google.com/youtube/terms/developer-policies-guide

## NAJPIERW WYKONAJ AUDYT ISTNIEJĄCEGO SYSTEMU
1. Zlokalizuj repozytorium i komponent obecnego selektora stacji (radio PL, global, Biblia itp.). **Nie zakładaj nazw plików, frameworka ani liczby stacji — zweryfikuj.**
2. Odczytaj sposób definiowania stacji, typy źródeł audio, stan odtwarzacza, CORS, cache i wymogi mobilne.
3. Ustal, czy istniejący dostawca streamingu ma opcję dodatkowej stacji w obecnym limicie/koszcie. Przyjmij ZERO COST jako wymóg; nie uruchamiaj płatnych zasobów.
4. Sprawdź prawa do emisji i faktyczne audio masters. Brak plików/audio hostingu/hasła = brak uruchomienia produkcyjnego. Nie podszywaj się pod działającą emisję.
5. Wybierz **wariant A** (istniejące radio/hosting streamingu, najlepiej) albo **wariant B** (własny Liquidsoap + Icecast na istniejącej infrastrukturze, jeśli pozwala na 24/7 i transfer).
6. Wdrażaj zmianę addytywnie: jedna nowa pozycja, bez zmian w dotychczasowych stacjach. Wdrożenie po testach i zatwierdzeniu.

## PARAMETRY STACJI
- Nazwa: RADIO CC WOMEN
- Id: `radio-cc-women`
- Skrót: `CCW`
- Podpis: `Miejsce Kobiet Takich Jak Ty`
- Nowa opcja listy: `RADIO CC WOMEN`
- Ikona: `assets/ccw-icon.png` (kwadratowa)
- Kolor akcentu: #E83F94; ciemne tło: #2A072A; logo: róż/złoto
- Tryb: jeden **wspólny** strumień live MP3/AAC; odtwarzanie HTML Audio
- Play/Pause po świadomej akcji użytkownika (zgodnie z polityką autoplay przeglądarek)
- Jeden aktywny element Audio na całą aplikację; zmiana stacji przerywa poprzedni stream

## LOGIKA PROGRAMU
- `shuffle bag`: po wymieszaniu wszystkie utwory raz w każdej rundzie (Liquidsoap `playlist(mode="randomize")`), a potem ponowne losowanie.
- Nie używaj `mode="random"`, bo może powtarzać utwory przed wykorzystaniem całości.
- Unikaj styku: ostatni utwór poprzedniej rundy = pierwszy kolejnej. **Uwaga:** sam `randomize` w Liquidsoap nie gwarantuje unikania powtórki na granicy rund — ten wymóg implementuj i przetestuj osobno, jeśli jest krytyczny.
- Nie powtarzaj identycznych nagrań przez zduplikowane ścieżki; waliduj pliki.
- Nowe utwory dodawaj po zatwierdzeniu praw i metadanych. Zmiany playlisty powinny wchodzić bez zatrzymania transmisji, jeśli backend to wspiera.
- Krótki crossfade tylko jeśli sprawdzony odsłuchowo; domyślnie bez efektów i ingerencji w tempo/wysokość.

## ARCHITEKTURA
`Zatwierdzone pliki audio -> playlista M3U -> Liquidsoap (centralny shuffle) -> Icecast / istniejący dostawca -> HTTPS stream -> odtwarzacz na polskieradio.cc`

Przesyłany w URL strumienia `https://.../ccw.mp3` to **przykład**, a nie faktyczny endpoint. Nie publikuj placeholdera na produkcji.

## ZAWARTOŚĆ PAKIETU
- `ANTIGRAVITY_ZLECENIE.md` — instrukcja wykonawcza
- `config/station.example.json` — wzór wpisu stacji (dostosuj do repo!)
- `stream/ccw.liq.template` — szablon Liquidsoap / Icecast
- `stream/playlist.m3u.example` — przykład formatu listy legalnych plików
- `stream/.env.example` — wymagane sekrety i zmienne
- `scripts/render_config.py` — generuje konfigurację `.liq` z bezpieczną walidacją wartości
- `web/ccw-player-example.html` — demonstracja `<audio>` (NIE podmieniaj nim istniejącego playera)
- `assets/ccw-icon.png` — dostarczona grafika 1:1
- `CHECKLISTA_ODBIORU.md` — warunki odbioru
- `ZRODLA.md` — dokumentacja użytych rozwiązań

## BLOKERY / DANE DO UZUPEŁNIENIA
- oryginalne pliki audio i prawa do transmisji (YouTube iframe nie wystarcza)
- URL gotowego streamingu albo host/port/hasło Icecast
- repozytorium i sposób publikacji obecnej strony
- faktyczne ograniczenia licencji/abonamentu Zeno lub innej usługi
- decyzja, czy stacja ma nadawać faktyczne 24/7 z centralnej infrastruktury

## DEFINITION OF DONE
Siódma opcja w selektorze, poprawne logo, jeden centralny działający sygnał audio, działający shuffle rundami, bezkolizyjny player, wyniki testów, bez regresji dotychczasowych stacji, potwierdzone prawa, brak nowych opłat. Jeśli brakuje źródeł, zakończ stanem `READY_FOR_AUDIO_ASSETS`, a nie `LIVE`.
