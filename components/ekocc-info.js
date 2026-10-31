/**
 * ══════════════════════════════════════════════════════════════════════════
 * EkoCC INFO ⓘ — WSPÓŁDZIELONY KOMPONENT INFORMACJI STRATEGICZNEJ
 * Standard: EKOCC_INFO_ANTIGRAVITY_STANDARD_STRATEGICZNY_2026-10-20
 * Właściciel polityki: Christian Culture (CC) | polskieradio.cc
 * 
 * Zapewnia odbiorcom pełny, aktualny i zrozumiały obraz misji, funkcji,
 * zasad, odpowiedzialności i powiązań projektu w ekosystemie Christian Culture.
 * Kolorystyka: Champagne Gold (#C4A35A), WCAG 2.2 AA, dotyk min. 44x44px.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  if (window._ekoccInfoInitialized) return;
  window._ekoccInfoInitialized = true;

  // Fallbacki uniwersalne zgodne z Sekcją 4 i 5 specyfikacji
  const UNIVERSAL_TEXT = {
    pl: {
      title: 'Informacje o projekcie | Christian Culture',
      intro: 'Jesteś w ekosystemie Christian Culture — sieci inicjatyw chrześcijańskich tworzonych po to, by dzielić się Słowem Bożym, muzyką, wiedzą i dobrem. Chcemy pomagać w poznawaniu Biblii, budowaniu wartościowych relacji i codziennym wzrastaniu w wierze. Poznaj cel tej strony, jej możliwości i zasady korzystania.',
      values: 'Stawiamy Jezusa Chrystusa w centrum, szanujemy Pismo Święte, godność człowieka, wolność sumienia i prawdę. Wyraźnie oddzielamy fakty od komentarza, a obietnice od funkcji już dostępnych.',
      access: 'Podstawowe materiały misyjne udostępniamy bezpłatnie. Dobrowolne wsparcie pomaga rozwijać projekty, ale nie jest warunkiem korzystania z treści.',
      note: 'Niektóre funkcje mogą być w fazie testów. Sprawdź aktualny status poniżej. Jeśli zauważysz błąd lub nieścisłość, zgłoś ją przez wskazany, zweryfikowany kanał.',
      footer: 'Christian Culture | polskieradio.cc • Informacje aktualizowane: 2026-10-20 • Wersja: 1.0.0',
      labels: {
        about: 'O projekcie',
        spiritualValue: 'Cel i wartość duchowa',
        howTo: 'Jak korzystać',
        features: 'Co jest dostępne (status funkcji)',
        scripture: 'Biblia i źródła',
        rights: 'Prawa i udostępnianie',
        privacy: 'Prywatność i bezpieczeństwo',
        accessibility: 'Dostępność i pomoc',
        support: 'Wspieraj misję',
        related: 'Poznaj EkoCC',
        close: 'Zamknij panel informacyjny',
        badgeAvailable: 'Dostępne',
        badgeTesting: 'W fazie testów',
        badgePlanned: 'Planowane',
        reportIssue: 'Zgłoś uwagę redakcyjną',
        openInfo: 'Informacje o tej stronie'
      }
    },
    en: {
      title: 'About this project | Christian Culture',
      intro: 'Welcome to Christian Culture, a network of Christian initiatives sharing Scripture, music, learning, and encouragement. Our aim is to help people explore the Bible, build meaningful relationships, and grow in faith. Learn what this page offers, how to use it, and which guidelines apply.',
      values: 'Our work is Christ-centered, grounded in Scripture, and committed to human dignity, freedom of conscience, accuracy, and transparency. We distinguish verified facts from commentary and live features from planned ones.',
      access: 'Core mission content is free to access. Voluntary support helps sustain the mission but is not a requirement. Some features may be in testing; please check their current status.',
      note: 'Some features may be in testing; please check their current status. If you spot an error, please report it via our verified contact channels.',
      footer: 'Christian Culture | polskieradio.cc • Last reviewed: 2026-10-20 • Version: 1.0.0',
      labels: {
        about: 'About Project',
        spiritualValue: 'Purpose & Spiritual Value',
        howTo: 'How to Use',
        features: 'Features & Current Status',
        scripture: 'Scripture & Sources',
        rights: 'Rights & Sharing',
        privacy: 'Privacy & Security',
        accessibility: 'Accessibility & Help',
        support: 'Support the Mission',
        related: 'Explore EkoCC',
        close: 'Close information panel',
        badgeAvailable: 'Available',
        badgeTesting: 'Testing',
        badgePlanned: 'Planned',
        reportIssue: 'Report editorial issue',
        openInfo: 'Information about this page'
      }
    }
  };

  class EkoCCInfoComponent {
    constructor() {
      this.currentLang = 'pl';
      this.registryData = null;
      this.currentCard = null;
      this.isOpen = false;
      this.lastFocusedElement = null;

      this.init();
    }

    async init() {
      this.injectStyles();
      this.createTriggerButton();
      this.createModalDialog();
      await this.loadRegistry();
      this.bindEvents();
    }

    normalizePath(path) {
      if (!path) return '/';
      let clean = path.split('?')[0].split('#')[0];
      if (clean.length > 1 && clean.endsWith('/')) {
        clean = clean.slice(0, -1);
      }
      if (clean.endsWith('.html')) {
        clean = clean.slice(0, -5);
      }
      // Aliasy
      if (clean.toLowerCase() === '/biblijneuwielbienie' || clean === '/biblijne-uwielbienie') {
        return '/BiblijneUwielbienie';
      }
      return clean;
    }

    async loadRegistry() {
      try {
        const res = await fetch('/data/info-registry.json', { cache: 'no-cache' });
        if (res.ok) {
          this.registryData = await res.json();
        }
      } catch (err) {
        // Cichy fallback na wbudowany rejestr uniwersalny
      }
      this.resolveCurrentCard();
    }

    resolveCurrentCard() {
      const explicitRoute = document.body.getAttribute('data-info-route');
      const pathname = explicitRoute || this.normalizePath(window.location.pathname);

      if (this.registryData && this.registryData.routes) {
        if (this.registryData.routes[pathname]) {
          this.currentCard = this.registryData.routes[pathname];
          return;
        }
        // Dopasowanie po prefiksie dla /news/...
        if (pathname.startsWith('/news')) {
          this.currentCard = this.registryData.routes['/news'];
          return;
        }
      }
      this.currentCard = null;
    }

    injectStyles() {
      if (document.getElementById('ekocc-info-styles')) return;
      const style = document.createElement('style');
      style.id = 'ekocc-info-styles';
      style.textContent = `
        :root {
          --ekocc-gold: #C4A35A;
          --ekocc-gold-hover: #D4B578;
          --ekocc-gold-light: #E2CC9A;
          --ekocc-gold-dark: #A08040;
          --ekocc-info-bg: #0f172a;
          --ekocc-info-card: #1e293b;
          --ekocc-info-text: #f8fafc;
          --ekocc-info-muted: #94a3b8;
          --ekocc-info-border: rgba(196, 163, 90, 0.25);
        }

        /* Dyskretny pływający przycisk ⓘ */
        body:has(#luminaThemeSwitchBtn) .ekocc-info-trigger,
        body.lumina-page .ekocc-info-trigger,
        html[data-lumina-theme] .ekocc-info-trigger { display: none !important; }

        .ekocc-info-trigger {
          position: fixed;
          bottom: 118px;
          right: 20px;
          z-index: 1001;
          width: 48px;
          height: 48px;
          min-width: 44px;
          min-height: 44px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.92);
          border: 1.5px solid var(--ekocc-gold);
          color: var(--ekocc-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 20px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
          transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .ekocc-info-trigger:hover, .ekocc-info-trigger:focus-visible {
          background: var(--ekocc-gold);
          color: #0f172a;
          transform: scale(1.06);
          outline: 2px solid var(--ekocc-gold-light);
          outline-offset: 3px;
          box-shadow: 0 6px 20px rgba(196, 163, 90, 0.4);
        }

        /* Nakładka i modal dialog */
        .ekocc-info-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.25s ease, visibility 0.25s ease;
        }
        .ekocc-info-backdrop.is-active {
          opacity: 1;
          visibility: visible;
        }

        .ekocc-info-panel {
          width: 100%;
          max-width: 520px;
          height: 100%;
          background: var(--ekocc-info-bg);
          color: var(--ekocc-info-text);
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 32px rgba(0, 0, 0, 0.5);
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border-left: 1px solid var(--ekocc-info-border);
          overflow: hidden;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .ekocc-info-backdrop.is-active .ekocc-info-panel {
          transform: translateX(0);
        }

        /* Nagłówek panelu */
        .ekocc-info-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--ekocc-info-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(30, 41, 59, 0.7);
        }
        .ekocc-info-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ekocc-info-badge {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--ekocc-gold);
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
        }
        .ekocc-info-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--ekocc-gold-light);
          margin: 0;
          line-height: 1.3;
        }
        .ekocc-info-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ekocc-info-lang-switch {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--ekocc-gold);
          border-radius: 6px;
          display: flex;
          overflow: hidden;
        }
        .ekocc-info-lang-btn {
          background: transparent;
          border: none;
          color: var(--ekocc-info-muted);
          padding: 6px 10px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          min-width: 38px;
          min-height: 36px;
          transition: background 0.15s, color 0.15s;
        }
        .ekocc-info-lang-btn.active {
          background: var(--ekocc-gold);
          color: #0f172a;
        }
        .ekocc-info-close {
          background: transparent;
          border: 1px solid var(--ekocc-info-border);
          color: var(--ekocc-info-text);
          border-radius: 8px;
          width: 44px;
          height: 44px;
          min-width: 44px;
          min-height: 44px;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .ekocc-info-close:hover, .ekocc-info-close:focus-visible {
          background: rgba(196, 163, 90, 0.2);
          color: var(--ekocc-gold-light);
          outline: 2px solid var(--ekocc-gold);
        }

        /* Treść panelu */
        .ekocc-info-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          line-height: 1.6;
          font-size: 0.95rem;
        }
        .ekocc-info-card {
          background: var(--ekocc-info-card);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 16px 18px;
        }
        .ekocc-info-card h4 {
          margin: 0 0 10px 0;
          color: var(--ekocc-gold);
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ekocc-info-card p {
          margin: 0 0 8px 0;
          color: #cbd5e1;
        }
        .ekocc-info-card p:last-child {
          margin-bottom: 0;
        }
        .ekocc-info-card ol, .ekocc-info-card ul {
          margin: 0;
          padding-left: 20px;
          color: #cbd5e1;
        }
        .ekocc-info-card li {
          margin-bottom: 6px;
        }

        /* Lista funkcji ze statusami */
        .ekocc-info-feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ekocc-info-feature-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: rgba(15, 23, 42, 0.5);
          border-radius: 6px;
          font-size: 0.9rem;
        }
        .ekocc-info-status {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .ekocc-info-status.available {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid rgba(74, 222, 128, 0.4);
        }
        .ekocc-info-status.testing {
          background: rgba(234, 179, 8, 0.2);
          color: #facc15;
          border: 1px solid rgba(250, 204, 21, 0.4);
        }
        .ekocc-info-status.planned {
          background: rgba(148, 163, 184, 0.2);
          color: #94a3b8;
          border: 1px solid rgba(148, 163, 184, 0.4);
        }

        /* Linki powiązane i wsparcie */
        .ekocc-info-links {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 6px;
        }
        .ekocc-info-link-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(196, 163, 90, 0.12);
          border: 1px solid var(--ekocc-gold);
          color: var(--ekocc-gold-light);
          text-decoration: none;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          min-height: 44px;
          transition: background 0.2s, color 0.2s;
        }
        .ekocc-info-link-pill:hover, .ekocc-info-link-pill:focus-visible {
          background: var(--ekocc-gold);
          color: #0f172a;
        }

        .ekocc-info-support-btn {
          display: block;
          text-align: center;
          background: linear-gradient(135deg, var(--ekocc-gold) 0%, var(--ekocc-gold-dark) 100%);
          color: #0f172a;
          font-weight: 700;
          text-decoration: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 0.95rem;
          min-height: 44px;
          line-height: 20px;
          box-shadow: 0 4px 12px rgba(196, 163, 90, 0.3);
          transition: opacity 0.2s;
        }
        .ekocc-info-support-btn:hover, .ekocc-info-support-btn:focus-visible {
          opacity: 0.92;
        }

        .ekocc-info-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--ekocc-info-border);
          font-size: 0.78rem;
          color: var(--ekocc-info-muted);
          background: rgba(30, 41, 59, 0.7);
          text-align: center;
        }

        /* Mobile full-screen / bottom-sheet adjustment */
        @media (max-width: 640px) {
          .ekocc-info-panel {
            max-width: 100%;
            height: 92%;
            margin-top: auto;
            border-radius: 16px 16px 0 0;
            border-left: none;
            border-top: 1px solid var(--ekocc-gold);
            transform: translateY(100%);
          }
          .ekocc-info-backdrop.is-active .ekocc-info-panel {
            transform: translateY(0);
          }
          .ekocc-info-trigger {
            bottom: 110px;
            right: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ekocc-info-backdrop, .ekocc-info-panel, .ekocc-info-trigger {
            transition: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    createTriggerButton() {
      // Jeśli na stronie istnieje już przycisk z atrybutem data-ekocc-info-trigger, nie twórz pływającego
      if (document.querySelector('#luminaThemeSwitchBtn, body.lumina-page, [data-ekocc-info-trigger]:not(.cc-mobile-edge *)')) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ekocc-info-trigger';
      btn.id = 'ekoccInfoTriggerBtn';
      btn.setAttribute('aria-label', UNIVERSAL_TEXT[this.currentLang].labels.openInfo);
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', 'ekoccInfoDialog');
      btn.innerHTML = 'ⓘ';
      btn.title = UNIVERSAL_TEXT[this.currentLang].labels.openInfo;

      document.body.appendChild(btn);
      this.adjustTriggerPosition(btn);
      window.addEventListener('resize', () => this.adjustTriggerPosition());
      window.addEventListener('orientationchange', () => this.adjustTriggerPosition());
    }

    adjustTriggerPosition(btn) {
      if (!btn) btn = document.getElementById('ekoccInfoTriggerBtn');
      if (!btn) return;
      const candidates = ['#radioPlayerBar', '.radio-player-bar', '#globalAudioBar', '.player-bottom-bar', '.player-sticky-controls'];
      let bottomOffset = window.innerWidth <= 640 ? 24 : 32;
      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.height > 0 && rect.top < window.innerHeight && rect.bottom >= window.innerHeight - 10) {
            const barHeight = Math.round(window.innerHeight - rect.top);
            bottomOffset = Math.max(bottomOffset, barHeight + 16);
          }
        }
      }
      btn.style.bottom = bottomOffset + 'px';
    }

    createModalDialog() {
      if (document.getElementById('ekoccInfoBackdrop')) return;

      const backdrop = document.createElement('div');
      backdrop.className = 'ekocc-info-backdrop';
      backdrop.id = 'ekoccInfoBackdrop';
      backdrop.setAttribute('role', 'dialog');
      backdrop.setAttribute('aria-modal', 'true');
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.setAttribute('aria-labelledby', 'ekoccInfoTitle');

      backdrop.innerHTML = `
        <div class="ekocc-info-panel" id="ekoccInfoPanel">
          <header class="ekocc-info-header">
            <div class="ekocc-info-brand">
              <div class="ekocc-info-badge">ⓘ</div>
              <h2 class="ekocc-info-title" id="ekoccInfoTitle">Christian Culture</h2>
            </div>
            <div class="ekocc-info-actions">
              <div class="ekocc-info-lang-switch" role="group" aria-label="Wybór języka / Language">
                <button type="button" class="ekocc-info-lang-btn active" data-lang="pl" aria-pressed="true">PL</button>
                <button type="button" class="ekocc-info-lang-btn" data-lang="en" aria-pressed="false">EN</button>
              </div>
              <button type="button" class="ekocc-info-close" id="ekoccInfoCloseBtn" aria-label="Zamknij panel informacyjny">✕</button>
            </div>
          </header>

          <main class="ekocc-info-body" id="ekoccInfoBody">
            <!-- Dynamiczna treść renderowana z rejestru -->
          </main>

          <footer class="ekocc-info-footer" id="ekoccInfoFooter">
            <!-- Pasek stopki z datą i wersją -->
          </footer>
        </div>
      `;

      document.body.appendChild(backdrop);
    }

    renderContent() {
      const body = document.getElementById('ekoccInfoBody');
      const titleElem = document.getElementById('ekoccInfoTitle');
      const footer = document.getElementById('ekoccInfoFooter');
      if (!body) return;

      const lang = this.currentLang;
      const u = UNIVERSAL_TEXT[lang];
      const card = this.currentCard ? this.currentCard[lang] : null;

      // Tytuł
      titleElem.textContent = card ? card.title : u.title;

      let html = '';

      // 1. WPROWADZENIE & O PROJEKCIE
      html += `
        <div class="ekocc-info-card">
          <h4>📌 ${u.labels.about}</h4>
          <p>${card ? card.about : u.intro}</p>
          ${card && card.summary ? `<p style="color:var(--ekocc-gold-light);font-weight:600;">${card.summary}</p>` : ''}
        </div>
      `;

      // 2. CEL I WARTOŚĆ DUCHOWA
      html += `
        <div class="ekocc-info-card">
          <h4>✝️ ${u.labels.spiritualValue}</h4>
          <p>${card ? card.spiritualValue : u.values}</p>
        </div>
      `;

      // 3. JAK KORZYSTAĆ
      if (card && Array.isArray(card.howTo) && card.howTo.length > 0) {
        html += `
          <div class="ekocc-info-card">
            <h4>🚀 ${u.labels.howTo}</h4>
            <ol>
              ${card.howTo.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>
        `;
      }

      // 4. CO JEST DOSTĘPNE (STATUS FUNKCJI)
      if (card && Array.isArray(card.features) && card.features.length > 0) {
        html += `
          <div class="ekocc-info-card">
            <h4>⚡ ${u.labels.features}</h4>
            <ul class="ekocc-info-feature-list">
              ${card.features.map(f => {
                let badgeClass = 'available';
                let badgeText = u.labels.badgeAvailable;
                if (f.status.includes('test') || f.status.includes('testing')) {
                  badgeClass = 'testing';
                  badgeText = u.labels.badgeTesting;
                } else if (f.status.includes('plan')) {
                  badgeClass = 'planned';
                  badgeText = u.labels.badgePlanned;
                }
                return `
                  <li class="ekocc-info-feature-item">
                    <span>${f.name}</span>
                    <span class="ekocc-info-status ${badgeClass}">${badgeText}</span>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
        `;
      }

      // 5. BIBLIA I ŹRÓDŁA
      html += `
        <div class="ekocc-info-card">
          <h4>📖 ${u.labels.scripture}</h4>
          <p>${card && card.scripture ? card.scripture : 'Cytaty biblijne opierają się na przekładzie Uwspółcześnionej Biblii Gdańskiej (UBG). Tekst Pisma Świętego jest wyraźnie oddzielany od komentarzy.'}</p>
        </div>
      `;

      // 6. PRAWA I UDOSTĘPNIANIE
      html += `
        <div class="ekocc-info-card">
          <h4>⚖️ ${u.labels.rights}</h4>
          <p>${card && card.rights ? card.rights : 'Materiały autorskie Christian Culture można udostępniać z podaniem źródła: «Za zgodą Christian Culture | polskieradio.cc». Utwory muzyczne i zewnętrzne podlegają odrębnym licencjom.'}</p>
        </div>
      `;

      // 7. PRYWATNOŚĆ I BEZPIECZEŃSTWO
      html += `
        <div class="ekocc-info-card">
          <h4>🛡️ ${u.labels.privacy}</h4>
          <p>${card && card.privacy ? card.privacy : 'Zasada minimalizacji danych. Brak sprzedaży informacji i brak komercyjnych trackerów reklamowych.'}</p>
        </div>
      `;

      // 8. DOSTĘPNOŚĆ I WSPARCIE MISJI
      html += `
        <div class="ekocc-info-card">
          <h4>♿ ${u.labels.accessibility}</h4>
          <p>${card && card.accessibility ? card.accessibility : 'Strona spełnia standardy dostępności cyfrowej WCAG 2.2 AA (obsługa klawiaturą, czytniki ekranu, cele dotykowe min. 44px).'}</p>
          <div style="margin-top:14px;">
            <a href="${card && card.supportUrl ? card.supportUrl : 'https://polskieradio.cc/wspieraj'}" class="ekocc-info-support-btn" target="_blank" rel="noopener">
              💛 ${u.labels.support}
            </a>
          </div>
        </div>
      `;

      // 9. POZNAJ EkoCC (LINKI)
      if (card && Array.isArray(card.relatedLinks) && card.relatedLinks.length > 0) {
        html += `
          <div class="ekocc-info-card">
            <h4>🌐 ${u.labels.related}</h4>
            <div class="ekocc-info-links">
              ${card.relatedLinks.map(l => `<a href="${l.url}" class="ekocc-info-link-pill">${l.label} →</a>`).join('')}
            </div>
          </div>
        `;
      }

      body.innerHTML = html;

      // Stopka
      footer.textContent = card && this.currentCard.reviewedAt
        ? `Christian Culture | polskieradio.cc • ${lang === 'pl' ? 'Przegląd' : 'Reviewed'}: ${this.currentCard.reviewedAt} • v${this.currentCard.version || '1.0.0'}`
        : u.footer;
    }

    bindEvents() {
      const openTrigger = document.getElementById('ekoccInfoTriggerBtn') || document.querySelector('[data-ekocc-info-trigger]');
      const closeBtn = document.getElementById('ekoccInfoCloseBtn');
      const backdrop = document.getElementById('ekoccInfoBackdrop');
      const panel = document.getElementById('ekoccInfoPanel');

      const openHandler = (e) => {
        if (e) e.preventDefault();
        this.open();
      };

      if (openTrigger) {
        openTrigger.addEventListener('click', openHandler);
      }
      // Globalna delegacja dla przycisków w menu / headerze
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-ekocc-info-trigger]');
        if (trigger) {
          e.preventDefault();
          this.open();
        }
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }

      if (backdrop) {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) {
            this.close();
          }
        });
      }

      // Klawisz ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Przełącznik języka PL / EN
      const langBtns = document.querySelectorAll('.ekocc-info-lang-btn');
      langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const targetLang = btn.getAttribute('data-lang');
          if (targetLang && targetLang !== this.currentLang) {
            this.currentLang = targetLang;
            langBtns.forEach(b => {
              const active = b === btn;
              b.classList.toggle('active', active);
              b.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
            this.renderContent();
          }
        });
      });
    }

    open() {
      this.isOpen = true;
      this.lastFocusedElement = document.activeElement;
      this.resolveCurrentCard();
      this.renderContent();

      const backdrop = document.getElementById('ekoccInfoBackdrop');
      const trigger = document.getElementById('ekoccInfoTriggerBtn') || document.querySelector('[data-ekocc-info-trigger]');

      if (backdrop) {
        backdrop.classList.add('is-active');
        backdrop.setAttribute('aria-hidden', 'false');
      }
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'true');
      }

      document.body.style.overflow = 'hidden';

      // Przeniesienie fokusu do przycisku zamknięcia
      setTimeout(() => {
        const closeBtn = document.getElementById('ekoccInfoCloseBtn');
        if (closeBtn) closeBtn.focus();
      }, 50);
    }

    close() {
      this.isOpen = false;
      const backdrop = document.getElementById('ekoccInfoBackdrop');
      const trigger = document.getElementById('ekoccInfoTriggerBtn') || document.querySelector('[data-ekocc-info-trigger]');

      if (backdrop) {
        backdrop.classList.remove('is-active');
        backdrop.setAttribute('aria-hidden', 'true');
      }
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
      }

      document.body.style.overflow = '';

      if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
        this.lastFocusedElement.focus();
      }
    }
  }

  // Automatyczny start po załadowaniu DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.ekoccInfo = new EkoCCInfoComponent();
    });
  } else {
    window.ekoccInfo = new EkoCCInfoComponent();
  }
})();
