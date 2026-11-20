# DESIGN.md — System graficzny „DOBRO, KTÓRE TWORZYMY RAZEM”

## 1. Formaty i wymagania techniczne
- **Format główny Patronite:** dokładnie **`1068 × 630 px`**, PNG (kompresja bezstratna, profil sRGB, rozmiar ≤ `10 MB`).
- **Wariant towarzyszący (promocja Patronatu w social media / `test/patronite`):** **`1080 × 1080 px`** (1:1), oparty na tej samej kompozycji warstwowej.

## 2. Paleta (maksymalnie 3 dominujące kolory)
| Rola | Kolor | Hex |
|---|---|---|
| Głęboki granat misyjny | Główne tło dolnej wstęgi, kontury i nakładka tonalna | `#0D223B` |
| Żywa czerwień / pomarańcz misyjny | Kapsułka serii, wyróżnienie słowa kluczowego, akcenty fal, logo Patronite | `#E8431B` |
| Czysta biel | Górna wstęga z logotypami, główna typografia nagłówków i stopki | `#FFFFFF` |

## 3. Trzy główne bloki kompozycyjne i warstwy programowe (SVG + Sharp)
Grafiki są składane wyłącznie programowo z oddzielnych warstw (brak polegania na generatorze obrazów przy literach i logotypach):
1. **GÓRA — Biała falista wstęga nagłówkowa:**
   - Zawiera oryginalną, wyodrębnioną bez zniekształceń parę znaków firmowych `brand-header-lockup.png` (**Oficjalne logo Christian Culture** | **Oryginalne logo Patronite**), z dolnym pomarańczowo-czerwonym łukiem obrysowującym falę.
   - Zabrania się deformowania proporcji (tolerancja aspect ratio < 2%), dublowania znaków lub rysowania fałszywych logo.
2. **ŚRODEK — Scena tematyczna + centralna strefa bezpieczna:**
   - Wyłącznie zweryfikowane lokalne fotografie z ekosystemu Christian Culture (`ogloszenia-tworcy-wolontariat.jpg`, `ogloszenia-sprzet-studio.jpg`, `ogloszenia-biblia-gdanska.jpg`, `ogloszenia-hero.jpg`, `ogloszenia-dom-studio.jpg`, `ogloszenia-widget-radio.webp`), pozbawione obcych znaków wodnych, zniekształconych twarzy i konkurencyjnych tekstów.
   - Kierunkowy gradient przyciemniający (`#081629` od `88%` po lewej do `18%` po prawej) zapewniający wysoki kontrast WCAG AA/AAA także na ekranach smartfonów.
   - Bezpieczna strefa typograficzna: `x: 56..680 px`, `y: 128..485 px` (dla `1068×630`). Zawiera: kapsułkę nazwy serii, mocny nagłówek w 2–3 linijkach z wyróżnionym słowem w `#E8431B`, pomarańczową łukową kreskę akcentującą oraz krótkie, czytelne przesłanie.
3. **DÓŁ — Granatowa falista belka misyjna (`#0D223B`):**
   - Oddzielona pomarańczowym łukiem `#E8431B`.
   - Lewa strona: biała ikona globu + adres `polskieradio.cc`.
   - Pionowy separator `#E8431B`.
   - Prawa strona: krótkie, mocne zamknięcie właściwe dla serii (`DZIĘKUJEMY, ŻE JESTEŚ Z NAMI` / `TWORZYMY TO RAZEM Z TOBĄ` / `BŁOGOSŁAWIONEGO SZABATU`) z delikatnym łukiem w kolorze `#E8431B`.

## 4. Trzy warianty serii
1. **`mission-report`** (Poniedziałek — `DZIENNIK MISJI`): zdjęcia gotowych efektów (Biblia, studio, radio, społeczność), przekaz konkretnego owocu pracy.
2. **`behind-the-scenes`** (Środa — `ZA KULISAMI CC`): zdjęcia warsztatu produkcyjnego audio/wideo/kodu, przekaz drogi i codziennego trudu powstawania projektów.
3. **`thank-you`** (Piątek — `DZIĘKI, ŻE JESTEŚ`): ciepłe światło przy otwartym Słowie Bożym i wspólnocie, przekaz wdzięczności, nadziei i życzeń na szabat.
