# CC Design System 2027 — Specyfikacja Architektoniczna i Audyt Open Source (EkoCC v2 PREMIUM)

**Data:** 2026-11-15  
**Gałąź pilotażowa:** `feat/cc-design-system-2027-pilot` (bez zmian produkcyjnych na `main`)  
**Pilotaż:** `/test/wspieraj` (`wspieraj-pilot.html` + `test/wspieraj/index.html`)  
**Standard:** ZERO COST · WCAG 2.2 AA · `@SMCC` (`min 44×44px`) · `JOMA-D052` (`#FF7A00`) · RTL-Ready

---

## 1. Inwentaryzacja obecnego stacku Christian Culture (`polskieradio.cc`)

### 1.1 Warstwa stylowania i architektury
- **Wykryta struktura CSS:** 37 arkuszy w katalogu `css/` (m.in. `christian-culture-design-system.css`, `lumina-shared-shell.css`, `lumina-theme.css`, `lumina-light-edition.css`, `cc-mobile-edge.css`, `player-tailwind.css`) oraz izolowany styl strony wsparcia `assets/cc-support/support.css`.
- **Infrastruktura:** Cloudflare Pages + Edge Worker (`_worker.js`) + statyczne strony HTML / moduły ES + wybrane moduły Vite/Vue 3 (`lumina-app.html`, `src/lumi-direct-dock/`).
- **Współdzielone komponenty ekosystemu:**
  - `components/cc-omni-search.js` (wyszukiwarka `@w`)
  - `js/cc-mobile-edge.js` + `css/cc-mobile-edge.css` (mobilny panel krawędziowy `+`)
  - `components/cc-support-footer.js` (stopka wsparcia)
  - `components/ekocc-info.js` (karta informacyjna ekosystemu)
  - `js/cc-back-to-top.js` (powrót na górę)

### 1.2 Audyt obecnego `/wspieraj` (`wspieraj.html` + `assets/cc-support/support.css`)
| Obszar | Stan obecny (`/wspieraj`) | Docelowy standard CC Design Core (`/test/wspieraj`) |
|---|---|---|
| Ergonomia `@SMCC` | `.thanks-controls button` ma `36×36px` | Wszystkie elementy interaktywne `>= 44×44px` |
| Przycisk główny CTA | Gradient beżowo-złoty | Kanoniczny **Klasyczny Pomarańczowy `#FF7A00`** (`#FF8C33` hover, `#E66A00` active, `JOMA-D052`) |
| Wielojęzyczność & RTL | Tylko język polski (`lang="pl"`), fizyczne marginesy CSS (`margin-left`, `border-left`) | 5 języków (**PL, EN, DE, ES, FR**) z API `registerSupportLocale()` + właściwości logiczne CSS (`margin-inline`, `padding-inline`, `border-inline-start`) |
| Typografia | `Arial` / `Georgia` | `Fraunces` (nagłówki/cytaty biblijne) + `Manrope` (UI/treść) ze skalą `clamp()` i fallbackami systemowymi zero-latency |
| Nawigacja i układ | Długa lista kart bez filtrowania kategorii | Układ Bento/Grid + szybka karta BLIK w Hero + dostępne zakładki WAI-ARIA filtrujące formy wsparcia + panel transparentności |

---

## 2. Weryfikacja 9 repozytoriów Open Source (licencje, zależności, użycie w EkoCC)

| Repozytorium | Licencja | Weryfikacja zależności i uwag | Sposób adaptacji w CC Design Core |
|---|---|---|---|
| `mearashadowfax/ScrewFast` | **MIT** | Bazuje na Astro + Tailwind + Preline UI + Starlight + **GSAP** (komercyjne ograniczenia przy wybranych wtyczkach GSAP poza standardową licencją). | Adaptujemy strukturę sekcji, wielojęzyczne routingi i reguły bezpieczeństwa/RTL na właściwościach logicznych CSS — **bez wciągania GSAP ani ciężkiego runtime**. |
| `matt765/Tailcast` | **MIT** | Czyste Astro + Tailwind CSS, brak płatnych zależności. | Ciemna paleta głębi, szklane powierzchnie (`--cc-bg-glass`), subtelne radialne poświaty i separatory sekcji. |
| `launch-ui/launch-ui` | **MIT** (zestaw free) | Część Pro wymaga płatnej licencji — wykluczona przez zasadę ZERO COST. | Kompozycja Hero, plakietki statusu i karty produktowe przeniesione w 100% do czystego CSS/HTML wariantu MIT. |
| `shadcn-ui/ui` | **MIT** | Model kopiowalnych prymitywów (oryginalnie React/Radix UI + Tailwind). | Architektura semantycznych tokenów CSS oraz bezbiblioteczne prymitywy WAI-ARIA (Tabs z obsługą strzałek, Accordion, Copy Box, Language Switcher). |
| `arthelokyo/astrowind` | **MIT** | Astro + Tailwind + MDX + Unpic. | Rytm typograficzny *Editorial Clean*, szerokość wiersza `65ch`, metadane SEO i Schema.org JSON-LD. |
| `motiondivision/motion` | **MIT** | Otwarty rdzeń animacji (płatne dodatki Motion+ odrzucone). | Krzywa `cubic-bezier(0.16, 1, 0.3, 1)`, wyłącznie GPU-safe `transform`/`opacity` (`CLS = 0`) + twardy wyłącznik `prefers-reduced-motion: reduce`. |
| `lucide-icons/lucide` | **ISC** (równoważna MIT) | Czyste SVG `24×24`, `stroke-width: 1.75`. | Spójny zestaw ikon liniowych osadzonych bezpośrednio jako lekkie SVG `<symbol>` bez zewnętrznego CDN. |
| `FreeForCharity/FFC-IN-FFC_Single_Page_Template` | **Apache-2.0** | Zgodna z projektem open-source. | Struktura przejrzystości misyjnej, rozdział informacji o odbiorcy i dobrowolności, sekcja FAQ darczyńcy. |
| `FinalTouch-Web/ft-template-nonprofit` | **Brak zweryfikowanego publicznego indeksu / licencji na GitHub** | Nie udało się potwierdzić publicznego repozytorium ani licencji OSI. | **Odrzucono kodowo:** zero zapożyczeń z tego źródła; karty darowizn w całości napisane w CC Design Core. |

---

## 3. Architektura CC Design Core (`css/cc-design-core.css` + `js/cc-design-core.js`)

### 3.1 Tokeny i kontrast WCAG 2.2 AA
- `--cc-gold: #C4A35A`, `--cc-gold-hover: #D4B578`, `--cc-gold-light: #E2CC9A`, `--cc-gold-dark: #A08040`
- `--cc-btn-orange: #FF7A00`, `--cc-btn-orange-hover: #FF8C33`, `--cc-btn-orange-active: #E66A00`, `--cc-btn-orange-text: #FFFFFF` (`JOMA-D052`)
- `--cc-bg-canvas: #040D15`, `--cc-bg-elevated: #081521`, `--cc-bg-glass: rgba(8, 21, 33, 0.84)`
- `--cc-text-primary: #F8FAFC` (> 16:1 na `#040D15`), `--cc-text-secondary: #CBD5E1` (> 10:1), `--cc-text-muted: #94A3B8` (> 5.5:1)
- Obsługa `[data-cc-theme="light"]` dla trybów jasnych Akademii i portalu LUMINA.

### 3.2 Cztery Archetypy Estetyczne (`[data-cc-archetype]`)
1. `cinematic` — Radio TV LIVE, Kino VOD, premiery (mocny kontrast sceniczny, szerokie kadry wideo)
2. `editorial` — Akademia Biblijna, MojaBiblia, CCN News (komfort czytania `65ch`, wyciszona poświata)
3. `audio` — Player 24/7, Biblia Audio, Biblia Śpiewana (płynne karty szklane, akcenty odtwarzacza)
4. `giving` — Centrum Wsparcia `/wspieraj`, Patronite, Zrzutki (przejrzystość daru, Bento CTA `#FF7A00`, pełne bezpieczeństwo metod)

---

## 4. Zakres Nienaruszalności Metod Płatności (`/wspieraj` vs `/test/wspieraj`)
Wszystkie dane pochodzą bezpośrednio ze wspólnego niemodyfikowalnego `assets/cc-support/config.js`:
- **BLIK na telefon:** `537 137 043`
- **Odbiorca:** `Cezary Rogowski`
- **Rachunek 1 (Rozwój Christian Culture):** `74 2910 0006 2469 8002 1062 8039` (`PL74 2910 0006 2469 8002 1062 8039`)
- **Rachunek 2 (Dar misyjny):** `48 2910 0006 0000 0000 0527 2629` (`PL48 2910 0006 0000 0000 0527 2629`)
- **Patronite:** `https://patronite.pl/osobowoscplus`
- **Revolut:** `https://revolut.me/christianculture`
- **Zrzutki:** `https://zrzutka.pl/rs4g4v`, `https://zrzutka.pl/3bbxzn`
- **Sklep CC:** `https://my-store-1009741.creator-spring.com/`
- **SMS Biblia:** `+48 507 821 789` (`BIBLIA`)
- **API podziękowań i zgód LUMINA:** `/api/cc-support/thanks`, `/api/cc-support/session`, `/api/cc-support/consent`
