# CC YouTube Post Factory · instrukcja

**Cel:** jedna kampania → grafika 1:1 + zwięzłe, dostosowane do kanałów posty społeczności YouTube, CTA i link. Program tworzy pakiet oraz panel do zatwierdzania, ale nie wykonuje automatycznego publikowania.

## Uruchomienie

1. Zainstaluj Python 3 oraz bibliotekę Pillow: `python -m pip install Pillow` (open source, bez opłat).
2. Sprawdź i zaktualizuj `channels.json`: są tu **robocze nazwy kanałów**; zweryfikuj je i wyłącz nieuprawnione (`enabled:false`).
3. Edytuj `campaign.json` (opis PL/EN, CTA, URL). Aby użyć zatwierdzonej grafiki, wpisz w `image_file` ścieżkę do JPG/PNG/WEBP. Pusty wpis wygeneruje prosty obraz 1080×1080.
4. Uruchom `python scripts/build.py`.
5. Otwórz `output/<id>/PANEL_PUBLIKACJI.html`; we właściwym koncie/kanałach YouTube Studio wklej tekst, załącz grafikę, sprawdź i **samodzielnie zatwierdź publikację lub harmonogram**.
6. W `status_publikacji.csv` zapisz URL faktycznie opublikowanego postu, datę i status. Nie wpisuj „opublikowano” bez dowodu.

## Ograniczenia i bezpieczeństwo

YouTube Data API nie udostępnia obecnie publicznego endpointu do tworzenia postów społeczności. Automatyzujemy przygotowanie kampanii, nie deklarujemy niedostępnego bezobsługowego publikatora. Nie stosuj nieoficjalnych API, automatycznego klikania omijającego zabezpieczenia, zapisywania cookie/sesji albo haseł.

YouTube dopuszcza posty z obrazem, sugeruje proporcję 1:1, maksymalnie 16 MB, format JPG/PNG/GIF/WEBP. Linki zewnętrzne w postach mogą wymagać włączonych funkcji zaawansowanych na danym kanale. Kanały mają ograniczenia dostępu do postów i limit liczby publikacji.

Dopasuj styl do charakteru kanału, nie zalewaj pokrywających się społeczności powtarzającymi się identycznymi treściami. Każda publikacja wymaga akceptacji człowieka.
