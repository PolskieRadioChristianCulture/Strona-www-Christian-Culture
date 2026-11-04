/* ============================================================================
 * EkoCC / CC NEWSLETTER — Wspólny Moduł UI (Panel + Slide-Over & Standalone)
 * Identyfikator: CCNL-002 | Standard: WCAG 2.2 AA, 44x44px, RODO/PKE Art. 398
 * ============================================================================ */
(() => {
  'use strict';
  if (window.CCNewsletter) return;

  const CONSENT_VERSION = '2026-10-30-v1';

  const TOPICS = [
    {
      slug: 'the-journal',
      pl: ['THE JOURNAL — nowości projektu', 'Premiera książki, rozwój aplikacji i nowe materiały THE JOURNAL.'],
      en: ['THE JOURNAL — project updates', 'Book launch, app development and new THE JOURNAL materials.'],
      de: ['THE JOURNAL — Projektneuigkeiten', 'Buchpremiere, App-Entwicklung und neue THE JOURNAL Materialien.'],
    },
    {
      slug: 'codzienne-rozwazania',
      pl: ['Codzienne Rozważania Biblijne', 'Codzienna poranna porcja Słowa Bożego („Dobrze, że jesteś” / autorzy LUMINA) o 06:00 rano.'],
      en: ['Daily Biblical Reflections', 'Daily morning scripture inspiration and reflections delivered at 6:00 AM.'],
      de: ['Tägliche Biblische Andachten', 'Tägliche morgendliche biblische Impulse und Andachten um 06:00 Uhr per E-Mail.'],
    },
    {
      slug: 'nowosci-ekocc',
      pl: ['Nowości EkoCC', 'Najważniejsze publikacje, premiery i wydarzenia z całego ekosystemu.'],
      en: ['EkoCC Highlights & News', 'Top publications, premieres, and events across the ecosystem.'],
      de: ['EkoCC Neuigkeiten', 'Wichtigste Veröffentlichungen, Premieren und Events im Ökosystem.'],
    },
    {
      slug: 'muzyka-radio-tv',
      pl: ['Muzyka, Radio i TV', 'PolskieRadio.cc, Biblijne Uwielbienie, Gerald Welch, JJ Beauvais i Kino VOD.'],
      en: ['Music, Radio & TV', 'PolskieRadio.cc, Biblical Worship, Gerald Welch, JJ Beauvais, and VOD.'],
      de: ['Musik, Radio & TV', 'PolskieRadio.cc, Biblijne Uwielbienie, Gerald Welch, JJ Beauvais und VOD.'],
    },
    {
      slug: 'biblia-akademia',
      pl: ['Biblia, Rozważania i Akademia', 'MojaBiblia, Kurs Codzienny, „Dobrze, że jesteś” i wykłady Akademii.'],
      en: ['Bible, Reflections & Academy', 'MojaBiblia, Daily Bible Course, daily reflections, and Academy lectures.'],
      de: ['Bibel, Andachten & Akademie', 'MojaBiblia, Täglicher Bibelkurs, Andachten und Akademie-Vorlesungen.'],
    },
    {
      slug: 'ksiazki-literatura',
      pl: ['Książki, Literatura i Kultura', 'Powieść „Pardon, Czy To Miłość?”, Biblioteka CC, YIS i kultura.'],
      en: ['Books, Literature & Culture', 'Novel "Pardon, Is This Love?", CC Library, YIS, and culture.'],
      de: ['Bücher, Literatur & Kultur', 'Roman „Pardon, Ist Das Liebe?“, CC-Bibliothek, YIS und Kultur.'],
    },
    {
      slug: 'rodzina-zdrowie-rozwoj',
      pl: ['Rodzina, Zdrowie, Kuchnia i Rozwój', 'Relacje, wychowanie, zdrowie (ZiU), kuchnia, finanse i HOLOS.'],
      en: ['Family, Health, Kitchen & Growth', 'Relationships, parenting, health, kitchen, finances, and HOLOS.'],
      de: ['Familie, Gesundheit, Küche & Entwicklung', 'Beziehungen, Familie, Gesundheit, Küche, Finanzen und HOLOS.'],
    },
  ];

  const I18N = {
    pl: {
      badge: 'CHRISTIAN CULTURE • LIVE LETTER',
      title: 'Nie przegap tego, co naprawdę ma znaczenie',
      subtitle: 'Wybierz swój sygnał. Codzienne rozważania o 06:00, muzyka, audycje i kultura prosto do Twojej skrzynki.',
      tabSubscribe: 'Zapisz się',
      tabManage: 'Zarządzaj subskrypcją',
      emailLabel: 'Twój adres e-mail *',
      emailPlaceholder: 'np. jan.kowalski@domena.pl',
      nameLabel: 'Imię (opcjonalnie)',
      namePlaceholder: 'Jak mamy się do Ciebie zwracać?',
      topicsLegend: 'Wybierz interesujące Cię kategorie tematyczne *',
      consentLabel:
        'Wyrażam zgodę na otrzymywanie drogą elektroniczną na podany adres e-mail newslettera ekosystemu Christian Culture (polskieradio.cc) w wybranych kategoriach tematycznych (zgodnie z art. 398 PKE i art. 6 ust. 1 lit. a RODO). Wiem, że zapis wymaga potwierdzenia linku (Double Opt-In), mam ukończone 16 lat, a zgodę mogę wycofać w każdej chwili 1 kliknięciem.',
      rodoNote:
        'Administratorem danych jest Christian Culture / Polskie Radio Christian Culture (radiochristianculture@gmail.com). Nie profilujemy wyznania ani światopoglądu.',
      privacyLinkText: 'Polityka Prywatności i RODO',
      submitBtn: 'Zapisz się (Double Opt-In)',
      submittingBtn: 'Wysyłanie zgłoszenia…',
      manageIntro:
        'Chcesz zmienić wybrane kategorie tematyczne lub wypisać się? Podaj swój adres e-mail, a wyślemy jednorazowy bezpieczny link do zarządzania subskrypcją.',
      manageBtn: 'Wyślij link do zarządzania',
      closeAria: 'Zamknij okno newslettera',
      fullPageLink: 'Otwórz pełną stronę /newsletter →',
      errEmail: 'Podaj poprawny adres e-mail.',
      errTopics: 'Wybierz przynajmniej jedną kategorię tematyczną.',
      errConsent: 'Zaznacz zgodę na otrzymywanie newslettera (checkbox nie może być pusty).',
      errGeneric: 'Wystąpił błąd podczas zapisu. Spróbuj ponownie za chwilę.',
    },
    en: {
      badge: 'EkoCC • Central Newsletter',
      title: 'Stay in touch',
      subtitle: 'Choose the topics you care about from the Christian Culture ecosystem. Zero spam, 1-click unsubscribe.',
      tabSubscribe: 'Subscribe',
      tabManage: 'Manage subscription',
      emailLabel: 'Your email address *',
      emailPlaceholder: 'e.g. john@example.com',
      nameLabel: 'First name (optional)',
      namePlaceholder: 'How should we address you?',
      topicsLegend: 'Choose your topic categories *',
      consentLabel:
        'I consent to receive the Christian Culture ecosystem (polskieradio.cc) newsletter by email covering my selected topic categories (GDPR Art. 6(1)(a)). I understand that subscription requires confirming a link (Double Opt-In), I am at least 16 years old, and I can withdraw my consent at any time with 1 click.',
      rodoNote:
        'Data Controller: Christian Culture / Polskie Radio Christian Culture (radiochristianculture@gmail.com). No religious profiling.',
      privacyLinkText: 'Privacy Policy & GDPR',
      submitBtn: 'Subscribe (Double Opt-In)',
      submittingBtn: 'Submitting…',
      manageIntro:
        'Want to update your topic categories or unsubscribe? Enter your email address to receive a one-time management link.',
      manageBtn: 'Send management link',
      closeAria: 'Close newsletter dialog',
      fullPageLink: 'Open full page /newsletter →',
      errEmail: 'Please enter a valid email address.',
      errTopics: 'Please select at least one topic category.',
      errConsent: 'Please check the consent box to subscribe.',
      errGeneric: 'An error occurred. Please try again in a moment.',
    },
    de: {
      badge: 'EkoCC • Zentraler Newsletter',
      title: 'In Kontakt bleiben',
      subtitle: 'Wählen Sie Ihre Themen aus dem Christian Culture Ökosystem. Kein Spam, 1-Klick-Abmeldung.',
      tabSubscribe: 'Abonnieren',
      tabManage: 'Abo verwalten',
      emailLabel: 'Ihre E-Mail-Adresse *',
      emailPlaceholder: 'z.B. name@beispiel.de',
      nameLabel: 'Vorname (optional)',
      namePlaceholder: 'Wie dürfen wir Sie ansprechen?',
      topicsLegend: 'Themenkategorien auswählen *',
      consentLabel:
        'Ich willige ein, den Newsletter des Christian Culture Ökosystems (polskieradio.cc) per E-Mail zu den gewählten Kategorien (Art. 6 Abs. 1 lit. a DSGVO) zu erhalten. Die Anmeldung wird per Double Opt-In bestätigt, ich bin mindestens 16 Jahre alt und kann jederzeit mit 1 Klick widerrufen.',
      rodoNote:
        'Verantwortlicher: Christian Culture / Polskie Radio Christian Culture (radiochristianculture@gmail.com).',
      privacyLinkText: 'Datenschutzerklärung',
      submitBtn: 'Abonnieren (Double Opt-In)',
      submittingBtn: 'Wird gesendet…',
      manageIntro:
        'Möchten Sie Ihre Kategorien ändern oder sich abmelden? Geben Sie Ihre E-Mail-Adresse ein, um einen Verwaltungslink zu erhalten.',
      manageBtn: 'Verwaltungslink senden',
      closeAria: 'Newsletter-Fenster schließen',
      fullPageLink: 'Vollständige Seite /newsletter öffnen →',
      errEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      errTopics: 'Bitte wählen Sie mindestens eine Themenkategorie.',
      errConsent: 'Bitte bestätigen Sie die Einwilligung (Checkbox aktivieren).',
      errGeneric: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    },
  };

  function getLocale() {
    const raw =
      (window.EkoCCI18n && typeof window.EkoCCI18n.getLocale === 'function' && window.EkoCCI18n.getLocale()) ||
      document.documentElement?.lang ||
      'pl';
    const code = String(raw).slice(0, 2).toLowerCase();
    return ['pl', 'en', 'de'].includes(code) ? code : 'pl';
  }

  function detectSourcePortal() {
    const p = (location.pathname || '/').toLowerCase();
    if (p === '/the-journal' || p.startsWith('/the-journal/')) return 'the-journal';
    if (p === '/' || p === '/index.html') return 'polskieradio-home';
    if (p.includes('wyszukiwarka') || p.includes('szukaj')) return 'wyszukiwarka';
    if (p.includes('tablica')) return 'lumina-tablica';
    if (p.includes('lumina')) return 'lumina';
    if (p.includes('akademia') || p.includes('kurs')) return 'akademia';
    if (p.includes('mojabiblia')) return 'mojabiblia';
    if (p.includes('vod') || p.includes('kino')) return 'vod';
    if (p.includes('player')) return 'player';
    if (p.includes('holos')) return 'holos';
    if (p.includes('wioletta')) return 'wioletta';
    if (p.includes('yis')) return 'yis';
    if (p.includes('global')) return 'global';
    if (p.includes('geraldwelch')) return 'gerald-welch';
    if (p.includes('newsletter')) return 'newsletter-standalone';
    const seg = p.split('/').filter(Boolean)[0] || 'polskieradio-home';
    return `ccn-${seg}`.slice(0, 48);
  }

  function defaultTopicsForPortal(sourcePortal) {
    if (sourcePortal.includes('rozwazania') || sourcePortal.includes('cuda') || sourcePortal.includes('dobrzezejestes') || sourcePortal.includes('lumina')) return ['codzienne-rozwazania', 'nowosci-ekocc'];
    if (sourcePortal.includes('akademia') || sourcePortal.includes('mojabiblia')) return ['biblia-akademia', 'nowosci-ekocc'];
    if (sourcePortal.includes('wioletta') || sourcePortal.includes('biblioteka') || sourcePortal.includes('yis')) return ['ksiazki-literatura', 'nowosci-ekocc'];
    if (sourcePortal.includes('vod') || sourcePortal.includes('player') || sourcePortal.includes('music') || sourcePortal.includes('welch') || sourcePortal.includes('global')) return ['muzyka-radio-tv', 'nowosci-ekocc'];
    if (sourcePortal.includes('holos') || sourcePortal.includes('seks') || sourcePortal.includes('ziu') || sourcePortal.includes('kuchnia')) return ['rodzina-zdrowie-rozwoj', 'nowosci-ekocc'];
    return ['nowosci-ekocc'];
  }

  function ensureStyles() {
    if (document.getElementById('cc-newsletter-styles')) return;
    const style = document.createElement('style');
    const nonce = document.querySelector('meta[name="cc-csp-nonce"]')?.content;
    if (nonce) style.nonce = nonce;
    style.id = 'cc-newsletter-styles';
    style.textContent = `
      dialog.cc-nl-dialog {
        position: fixed;
        inset: 0;
        margin: auto;
        width: min(94vw, 540px);
        max-height: min(92dvh, 800px);
        padding: 0;
        border: 1px solid rgba(28, 25, 23, 0.14);
        border-radius: 22px;
        --cc-nl-bg: #F6F2E9;
        --cc-nl-fg: #1C1B18;
        --cc-nl-muted: #57534E;
        --cc-nl-card: #FFFFFF;
        --cc-nl-border: rgba(28, 25, 23, 0.12);
        background: var(--cc-nl-bg);
        color: var(--cc-nl-fg);
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.35);
        overflow: hidden;
        z-index: 2147483646;
        font-family: 'Plus Jakarta Sans', 'Manrope', -apple-system, sans-serif;
      }
      dialog.cc-nl-dialog[data-theme="dark"] {
        --cc-nl-bg: #1C1B18;
        --cc-nl-fg: #F8FAFC;
        --cc-nl-muted: #94A3B8;
        --cc-nl-card: #272522;
        --cc-nl-border: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.14);
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.85);
      }
      dialog.cc-nl-dialog::backdrop {
        background: rgba(28, 27, 24, 0.65);
        backdrop-filter: blur(6px);
      }
      .cc-nl-shell {
        display: flex;
        flex-direction: column;
        max-height: min(92dvh, 800px);
        overflow-y: auto;
        padding: 24px 22px;
        box-sizing: border-box;
      }
      .cc-nl-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }
      .cc-nl-badge-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 6px;
      }
      .cc-nl-badge {
        display: inline-block;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #B88E3E;
      }
      .cc-nl-live-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        font-weight: 700;
        background: #DCFCE7;
        color: #166534;
        padding: 2px 8px;
        border-radius: 12px;
      }
      .cc-nl-live-pill .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #16A34A;
        display: inline-block;
      }
      .cc-nl-title {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 800;
        line-height: 1.25;
        color: var(--cc-nl-fg);
      }
      .cc-nl-subtitle {
        margin: 6px 0 0;
        font-size: 0.86rem;
        line-height: 1.5;
        color: var(--cc-nl-muted);
      }
      .cc-nl-manage-intro { margin: 0 0 14px; }
      .cc-nl-close {
        min-width: 44px;
        min-height: 44px;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        border: 1px solid var(--cc-nl-border);
        background: var(--cc-nl-card);
        color: var(--cc-nl-fg);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .cc-nl-close:hover {
        border-color: #FF7A00;
        color: #FF7A00;
      }
      .cc-nl-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 16px;
      }
      .cc-nl-tab {
        min-height: 44px;
        border-radius: 12px;
        border: 1px solid var(--cc-nl-border);
        background: var(--cc-nl-card);
        color: var(--cc-nl-muted);
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        padding: 8px 12px;
        transition: all 0.2s ease;
      }
      .cc-nl-tab[aria-selected="true"] {
        border-color: #FF7A00;
        background: #FF7A00;
        color: #FFFFFF;
      }
      .cc-nl-field {
        margin-bottom: 14px;
      }
      .cc-nl-label {
        display: block;
        font-size: 0.82rem;
        font-weight: 700;
        margin-bottom: 6px;
        color: var(--cc-nl-fg);
      }
      .cc-nl-input {
        width: 100%;
        min-height: 44px;
        padding: 10px 14px;
        border-radius: 12px;
        border: 1px solid var(--cc-nl-border);
        background: var(--cc-nl-card);
        color: var(--cc-nl-fg);
        font-size: 0.94rem;
        box-sizing: border-box;
      }
      .cc-nl-input:focus-visible,
      .cc-nl-close:focus-visible,
      .cc-nl-tab:focus-visible,
      .cc-nl-submit:focus-visible {
        outline: 2px solid #FF7A00;
        outline-offset: 2px;
      }
      .cc-nl-topics {
        border: 1px solid var(--cc-nl-border);
        border-radius: 14px;
        padding: 10px 12px;
        margin: 0 0 14px;
        background: var(--cc-nl-card);
      }
      .cc-nl-topics legend {
        font-size: 0.8rem;
        font-weight: 700;
        padding: 0 6px;
        color: #B88E3E;
      }
      .cc-nl-topic-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 8px 6px;
        min-height: 44px;
        box-sizing: border-box;
        cursor: pointer;
        border-radius: 10px;
        transition: background 0.15s ease;
      }
      .cc-nl-topic-item:hover {
        background: rgba(255, 122, 0, 0.06);
      }
      .cc-nl-topic-item input[type="checkbox"],
      .cc-nl-consent-row input[type="checkbox"] {
        width: 20px;
        height: 20px;
        margin-top: 2px;
        accent-color: #FF7A00;
        flex-shrink: 0;
        cursor: pointer;
      }
      .cc-nl-topic-title {
        display: block;
        font-size: 0.86rem;
        font-weight: 700;
        color: var(--cc-nl-fg);
      }
      .cc-nl-topic-desc {
        display: block;
        font-size: 0.76rem;
        color: var(--cc-nl-muted);
        line-height: 1.4;
      }
      .cc-nl-consent-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px;
        border-radius: 12px;
        border: 1px solid var(--cc-nl-border);
        background: var(--cc-nl-card);
        margin-bottom: 12px;
        cursor: pointer;
        font-size: 0.78rem;
        line-height: 1.5;
        color: var(--cc-nl-fg);
      }
      .cc-nl-submit {
        width: 100%;
        min-height: 48px;
        border: none;
        border-radius: 14px;
        background: #FF7A00;
        color: #FFFFFF;
        font-size: 0.96rem;
        font-weight: 800;
        cursor: pointer;
        transition: background-color 0.18s ease;
        box-shadow: 0 4px 14px rgba(255, 122, 0, 0.28);
      }
      .cc-nl-submit:hover {
        background: #FF8C33;
      }
      .cc-nl-submit:active {
        background: #E66A00;
      }
      .cc-nl-submit[disabled] {
        opacity: 0.65;
        cursor: wait;
      }
      .cc-nl-status {
        margin-top: 12px;
        padding: 12px 14px;
        border-radius: 12px;
        font-size: 0.84rem;
        line-height: 1.5;
        display: none;
      }
      .cc-nl-status[data-visible="true"] {
        display: block;
      }
      .cc-nl-status[data-kind="success"] {
        background: rgba(16, 185, 129, 0.14);
        border: 1px solid rgba(16, 185, 129, 0.45);
        color: #A7F3D0;
      }
      dialog.cc-nl-dialog[data-theme="light"] .cc-nl-status[data-kind="success"] {
        color: #065F46;
      }
      .cc-nl-status[data-kind="error"] {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.45);
        color: #FECACA;
      }
      dialog.cc-nl-dialog[data-theme="light"] .cc-nl-status[data-kind="error"] {
        color: #991B1B;
      }
      .cc-nl-footer-note {
        margin-top: 12px;
        font-size: 0.74rem;
        line-height: 1.45;
        color: var(--cc-nl-muted, #94A3B8);
      }
      .cc-nl-footer-note a {
        color: #C4A35A;
        text-decoration: underline;
      }
      .cc-nl-hp {
        position: absolute !important;
        left: -9999px !important;
        width: 1px !important;
        height: 1px !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      @media (prefers-reduced-motion: reduce) {
        .cc-nl-submit { transition: none !important; }
      }
    `;
    style.textContent += '\n.cc-nl-close[hidden], [data-cc-nl-form][hidden] {display:none!important;}';
    document.head.appendChild(style);
  }

  function buildFormMarkup(loc, sourcePortal, initialTopics) {
    const dict = I18N[loc] || I18N.pl;
    const topicsHtml = TOPICS.map((t) => {
      const [name, desc] = t[loc] || t.pl;
      const checked = initialTopics.includes(t.slug) ? 'checked' : '';
      return `
        <label class="cc-nl-topic-item">
          <input type="checkbox" name="cc_nl_topic" value="${t.slug}" ${checked}>
          <span>
            <span class="cc-nl-topic-title">${name}</span>
            <span class="cc-nl-topic-desc">${desc}</span>
          </span>
        </label>
      `;
    }).join('');

    return `
      <div class="cc-nl-shell">
        <div class="cc-nl-header">
          <div>
            <span class="cc-nl-badge">${dict.badge}</span>
            <h2 class="cc-nl-title" id="ccNlDialogTitle">${dict.title}</h2>
            <p class="cc-nl-subtitle">${dict.subtitle}</p>
          </div>
          <button type="button" class="cc-nl-close" data-cc-nl-close aria-label="${dict.closeAria}" title="${dict.closeAria}">✕</button>
        </div>

        <div class="cc-nl-tabs" role="tablist">
          <button type="button" role="tab" class="cc-nl-tab" data-cc-nl-tab="subscribe" aria-selected="true">${dict.tabSubscribe}</button>
          <button type="button" role="tab" class="cc-nl-tab" data-cc-nl-tab="manage" aria-selected="false">${dict.tabManage}</button>
        </div>

        <form data-cc-nl-form="subscribe" novalidate>
          <div class="cc-nl-field">
            <label class="cc-nl-label" for="ccNlEmailInput">${dict.emailLabel}</label>
            <input id="ccNlEmailInput" class="cc-nl-input" type="email" name="email" required autocomplete="email" placeholder="${dict.emailPlaceholder}">
          </div>
          <div class="cc-nl-field">
            <label class="cc-nl-label" for="ccNlNameInput">${dict.nameLabel}</label>
            <input id="ccNlNameInput" class="cc-nl-input" type="text" name="firstName" maxlength="80" autocomplete="given-name" placeholder="${dict.namePlaceholder}">
          </div>
          <fieldset class="cc-nl-topics">
            <legend>${dict.topicsLegend}</legend>
            ${topicsHtml}
          </fieldset>
          <div class="cc-nl-hp" aria-hidden="true">
            <label for="ccNlWebsiteHp">Website</label>
            <input id="ccNlWebsiteHp" type="text" name="websiteUrl" tabindex="-1" autocomplete="off">
          </div>
          <label class="cc-nl-consent-row">
            <input type="checkbox" name="consentAccepted" id="ccNlConsentCheckbox" required>
            <span>${dict.consentLabel}</span>
          </label>
          <button type="submit" class="cc-nl-submit" data-cc-nl-submit>${dict.submitBtn}</button>
        </form>

        <form data-cc-nl-form="manage" hidden novalidate>
          <p class="cc-nl-subtitle cc-nl-manage-intro">${dict.manageIntro}</p>
          <div class="cc-nl-field">
            <label class="cc-nl-label" for="ccNlManageEmail">${dict.emailLabel}</label>
            <input id="ccNlManageEmail" class="cc-nl-input" type="email" name="email" required autocomplete="email" placeholder="${dict.emailPlaceholder}">
          </div>
          <button type="submit" class="cc-nl-submit" data-cc-nl-manage-submit>${dict.manageBtn}</button>
        </form>

        <div class="cc-nl-status" role="status" aria-live="polite" data-cc-nl-status></div>

        <div class="cc-nl-footer-note">
          ${dict.rodoNote}
          <a href="/privacy#newsletter" target="_blank" rel="noopener">${dict.privacyLinkText}</a>
          &nbsp;•&nbsp;
          <a href="/newsletter?source=${encodeURIComponent(sourcePortal)}">${dict.fullPageLink}</a>
        </div>
      </div>
    `;
  }

  function wireContainerEvents(rootEl, { sourcePortal, onClose }) {
    const loc = getLocale();
    const dict = I18N[loc] || I18N.pl;
    const subForm = rootEl.querySelector('form[data-cc-nl-form="subscribe"]');
    const manForm = rootEl.querySelector('form[data-cc-nl-form="manage"]');
    const statusBox = rootEl.querySelector('[data-cc-nl-status]');
    const tabs = rootEl.querySelectorAll('[data-cc-nl-tab]');

    // Upewnij się, że checkbox zgody jest ZAWSZE odznaczony na starcie (P0 RODO)
    const consentBox = rootEl.querySelector('#ccNlConsentCheckbox');
    if (consentBox) consentBox.checked = false;

    function showStatus(kind, msg) {
      if (!statusBox) return;
      statusBox.dataset.kind = kind;
      statusBox.dataset.visible = 'true';
      statusBox.textContent = msg;
    }

    function clearStatus() {
      if (!statusBox) return;
      statusBox.dataset.visible = 'false';
      statusBox.textContent = '';
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.ccNlTab;
        tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
        if (subForm && manForm) {
          subForm.hidden = mode !== 'subscribe';
          manForm.hidden = mode !== 'manage';
        }
        clearStatus();
      });
    });

    const closeBtn = rootEl.querySelector('[data-cc-nl-close]');
    if (closeBtn && typeof onClose === 'function') {
      closeBtn.addEventListener('click', onClose);
    }

    if (subForm) {
      subForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearStatus();
        const email = (subForm.querySelector('input[name="email"]')?.value || '').trim();
        const firstName = (subForm.querySelector('input[name="firstName"]')?.value || '').trim();
        const websiteUrl = (subForm.querySelector('input[name="websiteUrl"]')?.value || '').trim();
        const consentAccepted = Boolean(subForm.querySelector('input[name="consentAccepted"]')?.checked);
        const topics = [...subForm.querySelectorAll('input[name="cc_nl_topic"]:checked')].map((el) => el.value);

        if (!email || !email.includes('@')) {
          showStatus('error', dict.errEmail);
          return;
        }
        if (topics.length === 0) {
          showStatus('error', dict.errTopics);
          return;
        }
        if (!consentAccepted) {
          showStatus('error', dict.errConsent);
          return;
        }

        const btn = subForm.querySelector('[data-cc-nl-submit]');
        if (btn) {
          btn.disabled = true;
          btn.textContent = dict.submittingBtn;
        }
        try {
          const res = await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              firstName,
              locale: getLocale(),
              sourcePortal,
              sourcePath: location.pathname || '/',
              topics,
              consentAccepted: true,
              consentVersion: CONSENT_VERSION,
              websiteUrl,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            showStatus('error', data.message || dict.errGeneric);
          } else {
            showStatus('success', data.message || 'Sprawdź skrzynkę e-mail i kliknij link potwierdzający.');
            subForm.reset();
            if (consentBox) consentBox.checked = false;
          }
        } catch {
          showStatus('error', dict.errGeneric);
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.textContent = dict.submitBtn;
          }
        }
      });
    }

    if (manForm) {
      manForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearStatus();
        const email = (manForm.querySelector('input[name="email"]')?.value || '').trim();
        if (!email || !email.includes('@')) {
          showStatus('error', dict.errEmail);
          return;
        }
        const btn = manForm.querySelector('[data-cc-nl-manage-submit]');
        if (btn) btn.disabled = true;
        try {
          const res = await fetch('/api/newsletter/manage/request-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, locale: getLocale() }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            showStatus('error', data.message || dict.errGeneric);
          } else {
            showStatus('success', data.message || 'Przyjęliśmy prośbę. Sprawdź skrzynkę w poszukiwaniu linku do zarządzania.');
            manForm.reset();
          }
        } catch {
          showStatus('error', dict.errGeneric);
        } finally {
          if (btn) btn.disabled = false;
        }
      });
    }
  }

  let dialogEl = null;
  let lastFocusedEl = null;

  function open(options = {}) {
    ensureStyles();
    const loc = options.locale || getLocale();
    const sourcePortal = options.sourcePortal || detectSourcePortal();
    const initialTopics = options.topics || (sourcePortal === 'the-journal' ? ['the-journal'] : []);

    if (!dialogEl) {
      dialogEl = document.createElement('dialog');
      dialogEl.id = 'cc-newsletter-dialog';
      dialogEl.className = 'cc-nl-dialog';
      dialogEl.setAttribute('aria-labelledby', 'ccNlDialogTitle');
      dialogEl.addEventListener('click', (e) => {
        const r = dialogEl.getBoundingClientRect();
        if (e.target === dialogEl && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) {
          close();
        }
      });
      dialogEl.addEventListener('close', () => {
        if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
          try {
            lastFocusedEl.focus({ preventScroll: true });
          } catch {}
        }
      });
      document.body.appendChild(dialogEl);
    }

    const isLight =
      document.documentElement.getAttribute('data-lumina-theme') === 'light' ||
      document.body?.classList.contains('theme-lumina-light') ||
      document.body?.dataset?.theme === 'light';
    dialogEl.dataset.theme = isLight ? 'light' : 'dark';
    dialogEl.innerHTML = buildFormMarkup(loc, sourcePortal, initialTopics);
    wireContainerEvents(dialogEl, { sourcePortal, onClose: close });

    if (options.mode === 'manage') {
      const manageTab = dialogEl.querySelector('[data-cc-nl-tab="manage"]');
      if (manageTab) manageTab.click();
    }

    lastFocusedEl = document.activeElement;
    if (!dialogEl.open && typeof dialogEl.showModal === 'function') {
      dialogEl.showModal();
    } else {
      dialogEl.setAttribute('open', '');
    }
    const emailInput = dialogEl.querySelector('#ccNlEmailInput');
    if (emailInput) {
      setTimeout(() => emailInput.focus(), 30);
    }
    return dialogEl;
  }

  function close() {
    if (!dialogEl) return;
    if (dialogEl.open && typeof dialogEl.close === 'function') {
      dialogEl.close();
    } else {
      dialogEl.removeAttribute('open');
    }
  }

  function mountInline(containerEl, options = {}) {
    if (!(containerEl instanceof HTMLElement)) return;
    ensureStyles();
    const loc = options.locale || getLocale();
    const sourcePortal = options.sourcePortal || detectSourcePortal();
    const initialTopics = options.topics || [];
    containerEl.innerHTML = buildFormMarkup(loc, sourcePortal, initialTopics);
    const closeBtn = containerEl.querySelector('[data-cc-nl-close]');
    if (closeBtn) closeBtn.hidden = true;
    wireContainerEvents(containerEl, { sourcePortal, onClose: null });
  }

  window.CCNewsletter = Object.freeze({
    open,
    close,
    mountInline,
    TOPICS,
    CONSENT_VERSION,
  });

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search || '');
    if (params.has('newsletter') || window.location.hash === '#newsletter') {
      setTimeout(() => open(), 300);
    }
  }
})();
