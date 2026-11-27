# Strategia Promocyjna i Automatyzacja — Profil firmy w Google (GBP)

- **Wizytówka:** `Polskie Radio Christian Culture TV`
- **Konto Google:** `radiochristianculture@gmail.com`
- **Koszt Google:** **$0.00 (100% bezpłatnie)** — wpisy (Aktualności, Wydarzenia, Oferty), grafiki, filmy do 30 s oraz przyciski akcji CTA w wyszukiwarce i Mapach Google są całkowicie darmowe.

---

## 1. Optymalna Strategia Misyjna (Nowości + Rotacja Stała 3x/tydzień)

System stosuje strategię **Novelties-First + 4-Tygodniowa Rotacja Evergreen**:

1. **Priorytet Nowości (`scripts/gbp_novelties_sync.mjs`):** Przed każdą zaplanowaną publikacją skrypt automatycznie skanuje bieżące rejestry ekosystemu Christian Culture:
   - `szukaj/catalog.json` (`recommendedToday` oraz najnowsza lekcja *Kursu Codziennego „Z Biblią za Pan Brat”*)
   - `biblia-audio/data/catalog.json` (najnowsze opublikowane rozdziały słuchowiska *Biblia Audio CC*)
   - `data/ccn-article-routes.js` (najnowsze artykuły portalu *CCN News* z dedykowanymi grafikami)
   - `data/youtube_published_history.json` (najnowsze publiczne premiery pełnometrażowych materiałów wideo)
   Każda zweryfikowana nowość jest deduplikowana i wstawiana na początek kolejki (`source: "novelties-sync"`), zaraz po wpisach premierowych (`launch-priority`).
2. **Stała Rotacja Misyjna 3x w tygodniu (gdy brak nowych premier):**

| Dzień | Godzina | Typ wpisu (GBP) | Cel misyjny | Przycisk CTA + UTM |
|---|---|---|---|---|
| **Wtorek** | `10:30` | `UPDATE` (Aktualność) | Nowe aplikacje (`Scrolluj Biblię`), Kurs Codzienny, MojaBiblia, Player Audio, CCN News | `Więcej informacji` (`utm_source=gbp`) |
| **Czwartek** | `16:30` | `EVENT` (Wydarzenie) | Transmisje 24/7 (`Spiritual Sounds TV`), premiery `Biblia Audio`, świadectwa i premiery YouTube | `Więcej informacji` (`utm_source=gbp`) |
| **Sobota** | `10:30` | `OFFER` (Oferta darmowa) | Darmowy album *The Best of CC*, darmowe Kino VOD HD, *AI dla Jezusa* (7 dni PRO), WspieramTO | `Skorzystaj z oferty` / `Więcej informacji` |

### Twarde zasady jakości Google (bramka w `scripts/gbp_policy_guard.mjs`)
1. **Brak danych kontaktowych i URL w tekście:** Google odrzuca wpisy zawierające numery telefonów, e-maile lub gołe linki w opisie — link kierowany jest wyłącznie przez oficjalny przycisk CTA z parametrami `utm_source=gbp&utm_medium=organic&utm_campaign=...`.
2. **Format grafiki 4:3 (`1200×900 px`, JPEG < 5 MB):** Każdy obraz przechodzi przez `prepareGbpImage4x3()` w dwóch bezpiecznych trybach: `cover` (pełne wypełnienie dla fotografii) oraz `contain` (białe marginesy chroniące banery z tekstem i zrzutami telefonów przed przycięciem).
3. **Cooldown 36 godzin & zero duplikatów:** Mechaniczna blokada przed przypadkowym spamem (`pickNextQueuedPost`) oraz deduplikacja po `id` i znormalizowanym adresie `ctaUrl`.

---

## 2. Obsługa automatyzacji (Ścieżka 1)

- **Synchronizacja nowości (podgląd):** `node scripts/gbp_novelties_sync.mjs --dry-run`
- **Test kolejki bez wysyłki (dry-run):** `node scripts/gbp_auto_publisher.mjs --dry-run`
- **Jednorazowe logowanie w Chrome (profil `C:\Users\czark\.gbp_browser_profile`):** `scripts\Zaloguj_GBP_Chrome.bat` lub `node scripts/gbp_auto_publisher.mjs --login`
- **Weryfikacja aktywnej sesji:** `node scripts/gbp_auto_publisher.mjs --check-session`
- **Ręczne opublikowanie kolejnego posta z kolejki:** `node scripts/gbp_auto_publisher.mjs --once`
- **Harmonogram Zadań Windows:** `CC_GBP_Posts_TriWeekly` (Wtorek `10:30`, Czwartek `16:30`, Sobota `10:30`) uruchamia `scripts/run_gbp_daily.ps1` (najpierw `gbp_novelties_sync.mjs`, potem `gbp_auto_publisher.mjs --once`).

---

## 3. Faza 2: Bezpłatny wniosek o oficjalne Google Business Profile API (300 QPM)

W silniku `scripts/gbp_auto_publisher.mjs` wbudowany jest gotowy adapter `publishViaOfficialGbpApi()` dla endpointu `mybusiness.googleapis.com/v4/.../localPosts`. Aby przełączyć się z przeglądarki na w pełni bezobsługowe API:

1. **Warunek wstępny Google:** Wizytówka `Polskie Radio Christian Culture TV` musi być zweryfikowana od co najmniej **60 dni** i posiadać działający URL strony (`https://polskieradio.cc`).
2. **Projekt Google Cloud:** W konsoli Google Cloud (`console.cloud.google.com`) na koncie `radiochristianculture@gmail.com` włącz interfejsy *Google Business Profile API* oraz *My Business Business Information API* i skopiuj **Project Number**.
3. **Wniosek o dostęp (Basic API Access):** Wypełnij oficjalny formularz Google Business Profile API Access Request Form (*Application for Basic API Access*), podając Project Number (nie używaj standardowego formularza zwiększania limitu w GCP, gdy limit wynosi 0 QPM — zostanie odrzucony).
4. **Po zatwierdzeniu (300 QPM):** Wygeneruj OAuth 2.0 `refresh_token` z zakresem `https://www.googleapis.com/auth/business.manage` i aktywuj `publishViaOfficialGbpApi()` dla pełnej publikacji bez okna Chrome.
