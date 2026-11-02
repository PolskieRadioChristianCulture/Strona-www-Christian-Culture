# Kolejka publikacji — Kurs Codzienny „Z Biblią za Pan Brat”

Ten folder NIE trafia na stronę (blokada w `scripts/cc-release-files.mjs`). Leżą tu zatwierdzone paczki dni.
Automat `scripts/kurs-codzienny/autopublikacja.mjs` publikuje paczkę po 00:00 czasu polskiego w dniu jej daty — nigdy wcześniej.

## Paczka dnia: `RRRR-MM-DD/`
| Plik | Wymagany | Opis |
|---|---|---|
| `meta.json` | tak | `{ "data": "2026-11-03", "dzien": 34, "zatwierdzil": "@001 + L0", "zatwierdzono": "2026-11-02T20:00:00+01:00" }`. Opcjonalnie `karta: { tytul, opis }` i `szukaj: { tytul, opis, tagi: [] }`, gdy tekst ma być inny niż w lekcji. |
| `lekcja.html` | tak | gotowa strona lekcji zbudowana według umiejętności `kc-z-biblia-lekcja` (21/21, quiz 20 pytań). Generator kopiuje ją pod 4 adresy. |
| `obrazy/*.jpg` | tak, gdy grafiki nie ma w repo | grafika dnia → `images/academy/daily/`. Musi być unikalna (nie może być kopią grafiki innego dnia). |
| `rozwazanie.json` | zalecany | wpis do `rozwazania_baza.json` (pozycja 0) z `day`, `date`, `contentWeb`, `fullText` i **`tvScript`** (bez niego czat Noemi i Sary nie startuje). |

Bez `zatwierdzil` i `zatwierdzono` automat odmawia. Po publikacji zapisuje `OPUBLIKOWANO.json` (czas i skróty plików).

## Kto i kiedy
1. Agent przygotowuje paczkę **do 20:00 dnia poprzedniego** na gałęzi roboczej, sprawdza ją (`--data … ` w trybie próby) i wysyła na `main` (commit tylko z folderem paczki — strona się nie zmienia).
2. Po 00:00 automat: generator → 3 testy → commit → push → wdrożenie z czystej kopii → sprawdzenie produkcji (HTTP i przeglądarka) → `lumina-repo` → lustro LUMINA → KONIEC albo ALARM w Skrzynce.
3. Automat robi tylko stronę WWW. CCN, Firestore (aplikacja, LUMINA, cclite), WhatsApp i Facebook dalej robią agenci według procedury JOMA.

## Ręcznie
```
node scripts/kurs-codzienny/publikuj-dzien.mjs --data 2026-11-03            # próba — nic nie zapisuje (przed północą: odmowa)
node scripts/kurs-codzienny/publikuj-dzien.mjs --data 2026-11-03 --zapisz   # zapis plików, bez commita i wdrożenia
```
Generator aktualizuje: 4 adresy lekcji, grafikę, w Dniu N−1 pasek „Dzień N →” i sekcję „Jutro”, w 8 plikach spisu kartę dnia,
„DZISIEJSZA LEKCJA” / „DOSTĘPNA TERAZ”, przyciski hero i licznik, wyszukiwarkę (2 pliki), `sitemaps/akademia.xml` i bazę rozważań.
Drugi przebieg nic nie zmienia. Gdy dzień jest już w repo z inną treścią albo brakuje poprzedniego dnia — odmawia.
