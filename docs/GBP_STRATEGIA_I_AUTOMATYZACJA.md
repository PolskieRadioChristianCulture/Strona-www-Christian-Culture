# Strategia Promocyjna i Automatyzacja — Profil firmy w Google (GBP)

- **Wizytówka:** `Polskie Radio Christian Culture TV`
- **Konto Google:** `radiochristianculture@gmail.com`
- **Koszt Google:** **$0.00 (100% bezpłatnie)** — wpisy (Aktualności, Wydarzenia, Oferty), grafiki, filmy do 30 s oraz przyciski akcji CTA w wyszukiwarce i Mapach Google są całkowicie darmowe.

---

## 1. Strategia Promocyjna (3 wartościowe wpisy w tygodniu)

| Dzień | Godzina | Typ wpisu (GBP) | Cel misyjny | Przycisk CTA + UTM |
|---|---|---|---|---|
| **Wtorek** | `10:30` | `UPDATE` (Aktualność) | Nowości edukacyjne, Biblia interlinearna, player audio, CCN News | `Więcej informacji` (`utm_source=gbp`) |
| **Czwartek** | `16:30` | `EVENT` (Wydarzenie) | Transmisje 24/7 (`Spiritual Sounds TV`), premiery `Biblia Audio`, świadectwa | `Więcej informacji` (`utm_source=gbp`) |
| **Sobota** | `10:30` | `OFFER` (Oferta darmowa) | Darmowy album *The Best of CC*, darmowe Kino VOD HD, centrum aplikacji, WspieramTO | `Skorzystaj z oferty` / `Więcej informacji` |

### Twarde zasady jakości Google (bramka w `scripts/gbp_policy_guard.mjs`)
1. **Brak danych kontaktowych i URL w tekście:** Google odrzuca wpisy zawierające numery telefonów, e-maile lub gołe linki w opisie — link kierowany jest wyłącznie przez oficjalny przycisk CTA.
2. **Format grafiki 4:3 (`1200×900 px`, JPEG < 5 MB):** Każdy obraz jest automatycznie kadrowany do proporcji `4:3` przez `ffmpeg`, aby nie uległ przycięciu w Mapach Google i panelu wiedzy.
3. **Cooldown 36 godzin & zero duplikatów:** Mechaniczna blokada przed przypadkowym spamem (`pickNextQueuedPost`).

---

## 2. Obsługa automatyzacji (Ścieżka 1)

- **Test bez wysyłki (dry-run):** `node scripts/gbp_auto_publisher.mjs --dry-run`
- **Jednorazowe logowanie w Chrome (profil `C:\Users\czark\.gbp_browser_profile`):** `node scripts/gbp_auto_publisher.mjs --login`
- **Weryfikacja aktywnej sesji:** `node scripts/gbp_auto_publisher.mjs --check-session`
- **Ręczne opublikowanie kolejnego posta z kolejki:** `node scripts/gbp_auto_publisher.mjs --once`
- **Harmonogram Zadań Windows:** `CC_GBP_Posts_TriWeekly` (Wtorek `10:30`, Czwartek `16:30`, Sobota `10:30`).

---

## 3. Faza 2: Bezpłatny wniosek o oficjalne Google Business Profile API (300 QPM)

W silniku `scripts/gbp_auto_publisher.mjs` wbudowany jest gotowy adapter `publishViaOfficialGbpApi()` dla endpointu `mybusiness.googleapis.com/v4/.../localPosts`. Aby przełączyć się z przeglądarki na w pełni bezobsługowe API:

1. **Warunek wstępny Google:** Wizytówka `Polskie Radio Christian Culture TV` musi być zweryfikowana od co najmniej **60 dni** i posiadać działający URL strony (`https://polskieradio.cc`).
2. **Projekt Google Cloud:** W konsoli Google Cloud (`console.cloud.google.com`) na koncie `radiochristianculture@gmail.com` włącz interfejsy *Google Business Profile API* oraz *My Business Business Information API* i skopiuj **Project Number**.
3. **Wniosek o dostęp (Basic API Access):** Wypełnij oficjalny formularz Google Business Profile API Access Request Form (*Application for Basic API Access*), podając Project Number (nie używaj standardowego formularza zwiększania limitu w GCP, gdy limit wynosi 0 QPM — zostanie odrzucony).
4. **Po zatwierdzeniu (300 QPM):** Wygeneruj OAuth 2.0 `refresh_token` z zakresem `https://www.googleapis.com/auth/business.manage` i aktywuj `publishViaOfficialGbpApi()` dla pełnej publikacji bez okna Chrome.
