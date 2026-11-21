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
          --ekocc-gold: #D4A94A;
          --ekocc-gold-hover: #E8C97A;
          --ekocc-gold-light: #F3E5AB;
          --ekocc-gold-dark: #A08040;
          --ekocc-btn-orange: #FF7A00;
          --ekocc-btn-orange-hover: #FF8C33;
          --ekocc-btn-orange-active: #E66A00;
        }

        /* ── Dedykowane motywy kolorystyczne okna informacji per strona ── */
        /* 1. Strona Główna (polskieradio.cc) - Głęboki Kosmiczny Obsidian & Imperial Gold */
        .ekocc-info-panel,
        .ekocc-info-panel[data-page-theme="home"] {
          --ekocc-info-bg: #0a0a0a;
          --ekocc-info-bg-gradient: linear-gradient(180deg, #141414 0%, #0a0a0a 100%);
          --ekocc-info-header-bg: linear-gradient(180deg, rgba(22, 22, 20, 0.98) 0%, rgba(12, 12, 12, 0.98) 100%);
          --ekocc-info-card-bg: linear-gradient(145deg, rgba(26, 26, 24, 0.75) 0%, rgba(16, 16, 15, 0.88) 100%);
          --ekocc-info-card-border: 1px solid rgba(212, 169, 74, 0.24);
          --ekocc-info-card-hover-border: rgba(212, 169, 74, 0.52);
          --ekocc-info-border: rgba(212, 169, 74, 0.24);
          --ekocc-info-text: #F3F0E6;
          --ekocc-info-text-body: #D4CFBE;
          --ekocc-info-muted: #9E9885;
          --ekocc-info-gold: #D4A94A;
          --ekocc-info-gold-light: #E8C97A;
          --ekocc-info-footer-bg: rgba(14, 14, 14, 0.98);
          --ekocc-info-tag-bg: rgba(212, 169, 74, 0.12);
        }

        /* 2. Akademia Biblijna & Kurs Codzienny - Midnight Navy & Gold */
        .ekocc-info-panel[data-page-theme="akademia"] {
          --ekocc-info-bg: #080f24;
          --ekocc-info-bg-gradient: linear-gradient(180deg, #0c1636 0%, #060b1b 100%);
          --ekocc-info-header-bg: linear-gradient(180deg, rgba(16, 28, 64, 0.98) 0%, rgba(10, 18, 42, 0.98) 100%);
          --ekocc-info-card-bg: linear-gradient(145deg, rgba(18, 32, 72, 0.7) 0%, rgba(10, 18, 44, 0.88) 100%);
          --ekocc-info-card-border: 1px solid rgba(212, 169, 74, 0.25);
          --ekocc-info-card-hover-border: rgba(212, 169, 74, 0.5);
          --ekocc-info-border: rgba(212, 169, 74, 0.25);
          --ekocc-info-footer-bg: rgba(10, 18, 42, 0.98);
        }

        /* 3. Moja Biblia - Biblical Espresso Obsidian & Ancient Amber Gold */
        .ekocc-info-panel[data-page-theme="mojabiblia"] {
          --ekocc-info-bg: #0e0a0a;
          --ekocc-info-bg-gradient: linear-gradient(180deg, #181212 0%, #0a0707 100%);
          --ekocc-info-header-bg: linear-gradient(180deg, rgba(28, 18, 18, 0.98) 0%, rgba(18, 12, 12, 0.98) 100%);
          --ekocc-info-card-bg: linear-gradient(145deg, rgba(34, 22, 22, 0.7) 0%, rgba(18, 12, 12, 0.88) 100%);
          --ekocc-info-card-border: 1px solid rgba(229, 169, 60, 0.24);
          --ekocc-info-card-hover-border: rgba(229, 169, 60, 0.5);
          --ekocc-info-border: rgba(229, 169, 60, 0.24);
          --ekocc-info-gold: #E5A93C;
          --ekocc-info-gold-light: #F6CA65;
          --ekocc-info-footer-bg: rgba(18, 12, 12, 0.98);
        }

        /* 4. VOD Kino - Cinema True Black & Gold */
        .ekocc-info-panel[data-page-theme="vod"] {
          --ekocc-info-bg: #050507;
          --ekocc-info-bg-gradient: linear-gradient(180deg, #0b0b12 0%, #040406 100%);
          --ekocc-info-header-bg: linear-gradient(180deg, rgba(20, 16, 26, 0.98) 0%, rgba(10, 8, 14, 0.98) 100%);
          --ekocc-info-card-bg: linear-gradient(145deg, rgba(22, 18, 28, 0.72) 0%, rgba(12, 10, 18, 0.88) 100%);
          --ekocc-info-card-border: 1px solid rgba(212, 169, 74, 0.2);
          --ekocc-info-card-hover-border: rgba(212, 169, 74, 0.45);
          --ekocc-info-border: rgba(212, 169, 74, 0.2);
          --ekocc-info-footer-bg: rgba(10, 8, 14, 0.98);
        }

        /* 5. News & Portale Tematyczne - Editorial Obsidian & Clean Gold */
        .ekocc-info-panel[data-page-theme="news"] {
          --ekocc-info-bg: #0a0c10;
          --ekocc-info-bg-gradient: linear-gradient(180deg, #10141c 0%, #07080c 100%);
          --ekocc-info-header-bg: linear-gradient(180deg, rgba(18, 24, 34, 0.98) 0%, rgba(10, 14, 20, 0.98) 100%);
          --ekocc-info-card-bg: linear-gradient(145deg, rgba(20, 26, 38, 0.7) 0%, rgba(12, 16, 24, 0.88) 100%);
          --ekocc-info-card-border: 1px solid rgba(196, 163, 90, 0.2);
          --ekocc-info-card-hover-border: rgba(196, 163, 90, 0.45);
          --ekocc-info-border: rgba(196, 163, 90, 0.2);
          --ekocc-info-footer-bg: rgba(10, 14, 20, 0.98);
        }

        /* Dyskretny pływający przycisk ⓘ z luksusową ikoną 3D Gold */
        body:has(#luminaThemeSwitchBtn:not(.cc-mobile-edge *)) .ekocc-info-trigger,
        body.lumina-page .ekocc-info-trigger { display: none !important; }

        .ekocc-info-trigger {
          position: fixed;
          top: 80px;
          right: 24px;
          bottom: auto;
          z-index: 995;
          width: 48px;
          height: 48px;
          min-width: 44px;
          min-height: 44px;
          border-radius: 50%;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
          filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 10px rgba(212, 169, 74, 0.3));
          transition: opacity 0.24s ease, visibility 0.24s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), filter 0.25s ease, top 0.2s ease, left 0.2s ease, right 0.2s ease;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ekocc-info-trigger.is-scroll-hidden,
        .ekocc-info-trigger.is-scroll-hidden:hover,
        .ekocc-info-trigger.is-scroll-hidden:focus-visible {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transform: translateY(-10px) scale(0.9) !important;
        }
        .ekocc-info-trigger .ekocc-info-icon-img {
          width: 48px;
          height: 48px;
          display: block;
          object-fit: contain;
          pointer-events: none;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ekocc-info-trigger:hover, .ekocc-info-trigger:focus-visible {
          transform: scale(1.1);
          filter: drop-shadow(0 6px 20px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 16px rgba(212, 169, 74, 0.65));
          outline: none;
        }
        .ekocc-info-trigger:hover .ekocc-info-icon-img {
          transform: rotate(5deg) scale(1.02);
        }
        .ekocc-info-trigger:active {
          transform: scale(0.96);
        }

        /* Nakładka i modal dialog */
        .ekocc-info-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(4, 6, 10, 0.8);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.28s ease, visibility 0.28s ease;
        }
        .ekocc-info-backdrop.is-active {
          opacity: 1;
          visibility: visible;
        }

        .ekocc-info-panel {
          width: 100%;
          max-width: 540px;
          height: 100%;
          background: var(--ekocc-info-bg-gradient, var(--ekocc-info-bg));
          color: var(--ekocc-info-text);
          display: flex;
          flex-direction: column;
          box-shadow: -12px 0 44px rgba(0, 0, 0, 0.8), inset 1px 0 0 rgba(255, 255, 255, 0.05);
          transform: translateX(100%);
          transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
          border-left: 1px solid var(--ekocc-info-border);
          overflow: hidden;
          font-family: 'Outfit', 'Montserrat', system-ui, -apple-system, sans-serif;
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
          background: var(--ekocc-info-header-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .ekocc-info-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ekocc-info-badge {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
        }
        .ekocc-info-badge .ekocc-info-badge-img {
          width: 36px;
          height: 36px;
          display: block;
          object-fit: contain;
        }
        .ekocc-info-title {
          font-size: 1.15rem;
          font-weight: 800;
          background: linear-gradient(135deg, #FFE082 0%, var(--ekocc-info-gold) 50%, var(--ekocc-info-gold-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          line-height: 1.3;
          letter-spacing: 0.3px;
        }
        .ekocc-info-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ekocc-info-lang-switch {
          background: rgba(8, 11, 18, 0.85);
          border: 1px solid var(--ekocc-info-border);
          border-radius: 8px;
          display: flex;
          overflow: hidden;
          padding: 2px;
          gap: 2px;
        }
        .ekocc-info-lang-btn {
          background: transparent;
          border: none;
          color: var(--ekocc-info-muted);
          padding: 6px 12px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          min-width: 44px;
          min-height: 44px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .ekocc-info-lang-btn.active {
          background: linear-gradient(135deg, var(--ekocc-info-gold), var(--ekocc-info-gold-light));
          color: #07090e;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        }
        .ekocc-info-close {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--ekocc-info-border);
          color: var(--ekocc-info-gold-light);
          border-radius: 10px;
          width: 44px;
          height: 44px;
          min-width: 44px;
          min-height: 44px;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .ekocc-info-close:hover, .ekocc-info-close:focus-visible {
          background: rgba(212, 169, 74, 0.2);
          border-color: var(--ekocc-info-gold);
          color: #ffffff;
          transform: scale(1.05);
        }

        /* Treść panelu */
        .ekocc-info-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 18px;
          line-height: 1.6;
          font-size: 0.95rem;
        }
        .ekocc-info-card {
          background: var(--ekocc-info-card-bg, var(--ekocc-info-card));
          border: var(--ekocc-info-card-border, 1px solid rgba(255, 255, 255, 0.08));
          border-radius: 14px;
          padding: 18px 20px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .ekocc-info-card:hover {
          border-color: var(--ekocc-info-card-hover-border, var(--ekocc-info-gold));
        }
        .ekocc-info-card h4 {
          margin: 0 0 10px 0;
          color: var(--ekocc-info-gold-light);
          font-size: 0.88rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ekocc-info-card p {
          margin: 0 0 8px 0;
          color: var(--ekocc-info-text-body, #cbd5e1);
          font-size: 0.92rem;
          line-height: 1.6;
        }
        .ekocc-info-card p:last-child {
          margin-bottom: 0;
        }
        .ekocc-info-card ol, .ekocc-info-card ul {
          margin: 0;
          padding-left: 20px;
          color: var(--ekocc-info-text-body, #cbd5e1);
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
          padding: 10px 14px;
          background: rgba(8, 11, 18, 0.5);
          border-radius: 8px;
          font-size: 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }
        .ekocc-info-status {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .ekocc-info-status.available {
          background: rgba(34, 197, 94, 0.18);
          color: #4ade80;
          border: 1px solid rgba(74, 222, 128, 0.35);
        }
        .ekocc-info-status.testing {
          background: rgba(234, 179, 8, 0.18);
          color: #facc15;
          border: 1px solid rgba(250, 204, 21, 0.35);
        }
        .ekocc-info-status.planned {
          background: rgba(148, 163, 184, 0.18);
          color: #94a3b8;
          border: 1px solid rgba(148, 163, 184, 0.35);
        }

        /* Linki powiązane i wsparcie */
        .ekocc-info-links {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        .ekocc-info-link-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: var(--ekocc-info-tag-bg, rgba(212, 169, 74, 0.12));
          border: 1px solid var(--ekocc-info-border);
          color: var(--ekocc-info-gold-light);
          text-decoration: none;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          min-height: 44px;
          transition: all 0.2s ease;
        }
        .ekocc-info-link-pill:hover, .ekocc-info-link-pill:focus-visible {
          background: linear-gradient(135deg, var(--ekocc-info-gold), var(--ekocc-info-gold-light));
          color: #07090e;
          border-color: var(--ekocc-info-gold-light);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(212, 169, 74, 0.35);
        }

        /* Przycisk Wsparcia — Oficjalny Standard CC Orange (#FF7A00, Dyrektywa JOMA-D052) */
        .ekocc-info-support-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-align: center;
          background: var(--ekocc-btn-orange);
          color: #ffffff !important;
          font-weight: 700;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 28px;
          font-size: 0.95rem;
          min-height: 44px;
          line-height: 20px;
          box-shadow: 0 4px 16px rgba(255, 122, 0, 0.4);
          transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .ekocc-info-support-btn:hover, .ekocc-info-support-btn:focus-visible {
          background: var(--ekocc-btn-orange-hover);
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(255, 122, 0, 0.55);
          color: #ffffff !important;
        }
        .ekocc-info-support-btn:active {
          background: var(--ekocc-btn-orange-active);
          transform: translateY(0);
        }

        .ekocc-info-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--ekocc-info-border);
          font-size: 0.78rem;
          color: var(--ekocc-info-muted);
          background: var(--ekocc-info-footer-bg, rgba(10, 14, 22, 0.98));
          text-align: center;
          line-height: 1.5;
        }

        /* Mobile full-screen / bottom-sheet adjustment */
        @media (max-width: 640px) {
          .ekocc-info-panel {
            max-width: 100%;
            height: 92%;
            margin-top: auto;
            border-radius: 20px 20px 0 0;
            border-left: none;
            border-top: 1px solid var(--ekocc-info-border);
            transform: translateY(100%);
          }
          .ekocc-info-backdrop.is-active .ekocc-info-panel {
            transform: translateY(0);
          }
          .ekocc-info-trigger {
            top: 70px;
            right: 16px;
            bottom: auto;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ekocc-info-backdrop, .ekocc-info-panel, .ekocc-info-trigger, .ekocc-info-trigger .ekocc-info-icon-img {
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
      btn.innerHTML = '<img src="/images/icons/ekocc-info-gold-128.png" srcset="/images/icons/ekocc-info-gold-128.png 1x, /images/icons/ekocc-info-gold.png 2x" alt="" class="ekocc-info-icon-img" width="48" height="48" loading="eager" decoding="async">';
      btn.title = UNIVERSAL_TEXT[this.currentLang].labels.openInfo;

      document.body.appendChild(btn);
      this.adjustTriggerPosition(btn);
      this.updateScrollVisibility(btn);

      const syncPosition = () => this.adjustTriggerPosition();
      window.addEventListener('resize', syncPosition, { passive: true });
      window.addEventListener('orientationchange', syncPosition, { passive: true });
      window.addEventListener('load', () => {
        this.adjustTriggerPosition();
        this.updateScrollVisibility();
      }, { passive: true });

      let scrollTicking = false;
      const runScrollSync = () => {
        scrollTicking = false;
        this.updateScrollVisibility();
      };
      const onScroll = () => {
        if (scrollTicking) return;
        scrollTicking = true;
        if (typeof window.requestAnimationFrame === 'function') {
          window.requestAnimationFrame(runScrollSync);
        } else {
          setTimeout(runScrollSync, 16);
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('scrollend', onScroll, { passive: true });
      document.addEventListener('scroll', onScroll, { passive: true, capture: true });

      if (typeof IntersectionObserver === 'function' && document.body) {
        let sentinel = document.getElementById('ekoccInfoTopSentinel');
        if (!sentinel) {
          sentinel = document.createElement('div');
          sentinel.id = 'ekoccInfoTopSentinel';
          sentinel.setAttribute('aria-hidden', 'true');
          sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none;opacity:0;visibility:hidden;z-index:-1;';
          document.body.prepend(sentinel);
        }
        const topObserver = new IntersectionObserver(() => {
          onScroll();
        }, { threshold: [0, 0.1] });
        topObserver.observe(sentinel);
      }

      if (typeof ResizeObserver === 'function') {
        const ro = new ResizeObserver(() => this.adjustTriggerPosition());
        const headerEl = document.querySelector('#mainHeader, .main-header, header');
        const plusEl = document.getElementById('actionsToggleBtn');
        const quickMenu = document.getElementById('quickActionsMenu');
        const headerRight = document.querySelector('.header-right');
        if (headerEl) ro.observe(headerEl);
        if (plusEl) ro.observe(plusEl);
        if (quickMenu) ro.observe(quickMenu);
        if (headerRight) ro.observe(headerRight);
        if (document.body) ro.observe(document.body);
      }
      setTimeout(() => {
        this.adjustTriggerPosition();
        this.updateScrollVisibility();
      }, 150);
      setTimeout(() => {
        this.adjustTriggerPosition();
        this.updateScrollVisibility();
      }, 400);
      setTimeout(() => {
        this.adjustTriggerPosition();
        this.updateScrollVisibility();
      }, 1000);
      setTimeout(() => {
        this.adjustTriggerPosition();
        this.updateScrollVisibility();
      }, 2500);
    }

    getScrollTop() {
      const y = typeof window.scrollY === 'number'
        ? window.scrollY
        : (typeof window.pageYOffset === 'number' ? window.pageYOffset : 0);
      const docY = document.documentElement ? document.documentElement.scrollTop : 0;
      const bodyY = document.body ? document.body.scrollTop : 0;
      return Math.max(0, y, docY || 0, bodyY || 0);
    }

    isElementVisibleBox(el) {
      if (!el || typeof el.getBoundingClientRect !== 'function') return null;
      const cs = window.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return null;
      const rect = el.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) return null;
      return rect;
    }

    updateScrollVisibility(btn) {
      if (!btn) btn = document.getElementById('ekoccInfoTriggerBtn');
      if (!btn || this.isOpen) return;
      const isAtTop = this.getScrollTop() <= 24;
      const wasHidden = btn.classList.contains('is-scroll-hidden');
      if (isAtTop) {
        if (wasHidden) {
          btn.classList.remove('is-scroll-hidden');
          btn.removeAttribute('aria-hidden');
          btn.tabIndex = 0;
        }
        this.adjustTriggerPosition(btn);
      } else if (!wasHidden) {
        if (document.activeElement === btn && typeof btn.blur === 'function') {
          btn.blur();
        }
        btn.classList.add('is-scroll-hidden');
        btn.setAttribute('aria-hidden', 'true');
        btn.tabIndex = -1;
      }
    }

    adjustTriggerPosition(btn) {
      if (!btn) btn = document.getElementById('ekoccInfoTriggerBtn');
      if (!btn) return;
      const clientW = document.documentElement.clientWidth || window.innerWidth || 1280;
      const btnWidth = btn.offsetWidth || 48;

      const headerSelectors = ['#mainHeader', '.main-header', '.cc-omni-topnav', 'header.navbar', 'header'];
      let headerRect = null;
      for (const sel of headerSelectors) {
        const el = document.querySelector(sel);
        const rect = this.isElementVisibleBox(el);
        if (rect && rect.top <= 48 && rect.bottom >= 36 && rect.bottom <= 150) {
          headerRect = rect;
          break;
        }
      }

      const plusSelectors = [
        '#actionsToggleIcon',
        '#actionsToggleBtn .avatar-ring',
        '#actionsToggleBtn',
        '.main-header .toggle-trigger',
        'header [data-cc-topbar-plus]'
      ];
      let plusRect = null;
      for (const sel of plusSelectors) {
        const el = document.querySelector(sel);
        const rect = this.isElementVisibleBox(el);
        if (rect && rect.top >= -8 && rect.bottom <= 160 && rect.width > 0) {
          plusRect = rect;
          break;
        }
      }

      let baseBottom = headerRect ? headerRect.bottom : (plusRect ? plusRect.bottom : (clientW <= 640 ? 60 : 70));
      const subToolbar = document.querySelector('.mb-toolbar, .sub-header, .secondary-toolbar');
      const subToolbarRect = this.isElementVisibleBox(subToolbar);
      if (subToolbarRect && subToolbarRect.top <= baseBottom + 16 && subToolbarRect.bottom <= 220) {
        baseBottom = Math.max(baseBottom, subToolbarRect.bottom);
      }
      const topOffset = Math.max(48, Math.min(220, Math.round(baseBottom + 10)));

      if (plusRect && plusRect.width > 0) {
        // Obliczenie osi pionowej (center X) przycisku plus na górnej belce
        const plusCenterX = plusRect.left + plusRect.width / 2;
        // Bezpośrednie pozycjonowanie lewej krawędzi (left) względem viewportu (odporne na szerokość paska przewijania)
        const targetLeft = Math.round(plusCenterX - btnWidth / 2);
        btn.style.left = `${targetLeft}px`;
        btn.style.right = 'auto';
      } else {
        const rightOffset = clientW <= 640 ? 16 : 24;
        btn.style.left = 'auto';
        btn.style.right = `${rightOffset}px`;
      }

      btn.style.bottom = 'auto';
      btn.style.top = `${topOffset}px`;
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
        <div class="ekocc-info-panel" id="ekoccInfoPanel" data-page-theme="home">
          <header class="ekocc-info-header">
            <div class="ekocc-info-brand">
              <div class="ekocc-info-badge"><img src="/images/icons/ekocc-info-gold-128.png" srcset="/images/icons/ekocc-info-gold-128.png 1x, /images/icons/ekocc-info-gold.png 2x" alt="" class="ekocc-info-badge-img" width="36" height="36"></div>
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

      if (window.CCPageI18n?.info) {
        const p = window.CCPageI18n, l = p.labels;
        titleElem.textContent = l.info;
        body.replaceChildren();
        ['about','how','access','rights'].forEach((key,i)=>{const section=document.createElement('section');section.className='ekocc-info-card';const h=document.createElement('h4');h.textContent=l[key];const text=document.createElement('p');text.textContent=p.info[i];section.append(h,text);body.append(section);});
        footer.textContent='Christian Culture · polskieradio.cc';
        const close=document.getElementById('ekoccInfoCloseBtn');if(close){close.setAttribute('aria-label',l.close);close.title=l.close;}
        const languageSwitch = document.querySelector('.ekocc-info-lang-switch'); if(languageSwitch){languageSwitch.hidden=true;languageSwitch.style.display='none';}
        return;
      }
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
      this.updateScrollVisibility();

      if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function' && !this.lastFocusedElement.classList?.contains('is-scroll-hidden')) {
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
