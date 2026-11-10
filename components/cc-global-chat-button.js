/**
 * ══════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE & LUMINA — CCGlobalChatButton
 * Plik: /components/cc-global-chat-button.js
 * 
 * Standard wdrożenia CC CHAT:
 * - Wygląd: Neonowy przycisk czatu w szkle (fioletowo-różowy gradient, złota
 *   obwódka, biały symbol rozmowy, delikatna poświata i szkło).
 * - Rozmiar: 60 × 60 px na komputerze, 56 × 56 px na telefonie.
 * - Położenie: prawy dolny róg (right: max(18px, env(safe-area-inset-right)),
 *   bottom: max(18px, env(safe-area-inset-bottom))), dynamicznie współgra
 *   z paskami odtwarzaczy i przyciskiem cc-back-to-top.
 * - Architektura zintegrowana:
 *   1. [ 💬 Rozmowa ] — aktywny wątek rozmowy z wybranym członkiem lub czat ogólny,
 *      ze wstęgą awatarów szybkiego wyboru rozmówcy u góry.
 *   2. [ 👥 Społeczność ] — pełny katalog członków społeczności LUMINA (Wioletta,
 *      Mariusz, Radio CC, Andrzej, Jola, inni członkowie) z bezpośrednim rozpoczęciem rozmowy.
 *   3. [ 🧭 Kanały ] — 4 karty form komunikacji (Duszpasterz telefon, Grupa WhatsApp,
 *      Sztab CC, Portal LUMINA).
 * - Integracja: jedno logowanie LUMINA / CC ID.
 * - Wymogi: ergonomia dotyku min. 44px, brak zależności od zewnętrznych fontów
 *   (100% inline SVG), Zero-QA.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // 1. Zabezpieczenie przed wielokrotną inicjalizacją
  if (window.CCGlobalChatButton) return;
  window.CCGlobalChatButton = true;
  // A single /mess document supplies the chat on every ecosystem page.
  const isCanonicalMessenger = /^\/mess(?:\/|\.html)?$/.test(window.location.pathname);
  let integrationReady = Promise.resolve();
  if (!window.CCUnifiedChat && !document.getElementById('ccChatIntegrationScript')) {
    integrationReady = new Promise(resolve => {
      const integration = document.createElement('script');
      integration.id = 'ccChatIntegrationScript';
      integration.src = '/js/cc-chat-integration.js?v=20261018_pushroom';
      integration.onload = resolve;
      integration.onerror = resolve;
      document.head.appendChild(integration);
    });
  }

  // 2. Katalog członków społeczności CC & LUMINA
  const COMMUNITY_MEMBERS = [
    {
      id: 'public',
      name: 'Czat Ogólny Społeczności',
      badge: '🌐 Cała Społeczność',
      desc: 'Otwarty pokój rozmów dla wszystkich członków',
      avatar: '/images/chat/cc-chat-button-120.webp',
      profileUrl: '/lumina-tablica.html',
      isPublic: true,
      initialGreeting: 'Pokój Wam! 🕊️ Witaj na ogólnym czacie społeczności Christian Culture i LUMINA. Bądźmy dla siebie wsparciem i dzielmy się Słowem Bożym!'
    },
    {
      id: 'cezaryrgowski',
      slug: 'cezaryrgowski',
      profileUrl: '/lumina.cezaryrgowski.html',
      name: 'Cezary Rogowski',
      badge: '👑 Założyciel CC',
      desc: 'Założyciel Misji Christian Culture & LUMINA',
      avatar: '/avatar_cezary_official.jpg',
      initialGreeting: 'Pokój Wam! 🕊️ Niech Boży pokój i łaska będą z Wami każdego dnia. W czym mogę pomóc w dziele misji?'
    },
    {
      id: 'wiolettarogowska',
      slug: 'wiolettarogowska',
      profileUrl: '/lumina.wiolettarogowska.html',
      name: 'Wioletta Rogowska',
      badge: '🌸 Liderka CC',
      desc: 'Liderka Społeczności & Współzałożycielka • Modlitwa',
      avatar: '/avatar_wioletta_official.webp',
      initialGreeting: 'Niech będzie pochwalony Jezus Chrystus! 🌸 Cieszę się, że jesteś. Jak mogę Ci dziś pomóc lub w jakiej intencji możemy się wspólnie pomodlić?'
    },
    {
      id: 'mariusz',
      slug: 'mariusz',
      profileUrl: '/lumina.mariusz.html',
      name: 'Duchowny Mariusz',
      badge: '🛠️ Duszpasterz CC',
      desc: 'Wsparcie duszpasterskie i modlitwa (+48 608 337 477)',
      avatar: '/avatar_mariusz.jpg',
      initialGreeting: 'Szczęść Boże! 🕊️ Jestem do dyspozycji w sprawach wiary, modlitwy i wsparcia duchowego. Możesz do mnie śmiało pisać lub dzwonić.'
    },
    {
      id: 'radiocc',
      slug: 'radiocc',
      profileUrl: '/lumina.radiocc.html',
      name: 'Misja & Radio CC',
      badge: '🕊️ Redakcja Misji',
      desc: 'Oficjalny Nadawca Radiowy & Sztab Ewangelizacji',
      avatar: '/avatar_christian_culture_hq_2026.webp',
      initialGreeting: 'Witaj w sztabie Radia Christian Culture! 📻 Dziękujemy za słuchanie i budowanie misji. W czym możemy pomóc?'
    },
    {
      id: 'andrzejthiel',
      slug: 'andrzejthiel',
      profileUrl: '/lumina.andrzejthiel.html',
      name: 'Andrzej Thiel',
      badge: '📖 Autor CKD',
      desc: 'Autor rozważań Cuda Każdego Dnia • Sieradz',
      avatar: '/avatar_andrzej_thiel.webp',
      initialGreeting: 'Błogosławionego dnia w Panu! 📖 Niech Boże Słowo rozjaśnia Twoją drogę każdego dnia. O czym chciałbyś porozmawiać?'
    },
    {
      id: 'jolawojcik',
      slug: 'jolawojcik',
      profileUrl: '/lumina.jolawojcik.html',
      name: 'Jola Wójcik',
      badge: '🕊️ Pasmo Modlitwy',
      desc: 'Biblijny Czas Modlitwy • Polskie Radio CC',
      avatar: '/avatar_jolawojcik.jpg',
      initialGreeting: 'Pokój Boży niech będzie z Tobą! 🕊️ Włączam Twoje intencje do naszego wspólnego pasma modlitewnego.'
    },
    {
      id: 'studiodobregoslowa',
      slug: 'studiodobregoslowa',
      profileUrl: '/lumina.studiodobregoslowa.html',
      name: 'Studio Dobrego Słowa',
      badge: '🎙️ Studio CC',
      desc: 'Nagrania Audio & Wideo • Produkcja misyjna',
      avatar: '/studiodobregoslowa_avatar.webp',
      initialGreeting: 'Dobre słowo ma moc przemiany serc! 🎙️ Witamy w Studiu Dobrego Słowa.'
    },
    {
      id: 'zofia',
      slug: 'zofiadudek',
      profileUrl: '/lumina.zofiadudek.html',
      name: 'Zofia Dudek',
      badge: '🌸 Kobiety CC',
      desc: 'Kobiety Christian Culture • Modlitwa',
      avatar: '/avatar_zofia_dudek.png',
      initialGreeting: 'Szczęść Boże! Cieszę się z naszej wspólnoty i wzajemnego umocnienia w modlitwie. 🌸'
    },
    {
      id: 'osobowoscplus',
      slug: 'osobowoscplus',
      profileUrl: '/lumina.osobowoscplus.html',
      name: 'Osobowość PLUS',
      badge: '💡 Rozwój',
      desc: 'Kanał i Społeczność Rozwoju Osobistego CC',
      avatar: '/logo_osobowosc_plus.jpg',
      initialGreeting: 'Witaj w Osobowość PLUS! Rozwijaj swoje talenty ku chwale Bożej. ✨'
    },
    {
      id: 'pawelmurawski',
      slug: 'pawelmurawski',
      profileUrl: '/lumina.pawelmurawski.html',
      name: 'Paweł Murawski',
      badge: '📖 Teologia',
      desc: 'Studia Biblijne i Rozważania Słowa',
      avatar: '/avatar_pawel_murawski.jpg',
      initialGreeting: 'Niech Słowo Boże mieszka w Was obficie! 📖 Pokój Chrystusowy.'
    },
    {
      id: 'magdalena',
      slug: 'magdalena',
      profileUrl: '/lumina.magdalena.html',
      name: 'Magdalena',
      badge: '🌸 Kobiety LUMINA',
      desc: 'Wspólnota i Świadectwo Kobiet Chrześcijańskich',
      avatar: '/avatar_magdalena.png',
      initialGreeting: 'Błogosławionego dnia! Pięknie, że tworzymy razem tę Bożą społeczność. 🌸'
    },
    {
      id: 'robert',
      slug: 'robert',
      profileUrl: '/lumina-profile.html?user=robert',
      name: 'Robert Łukasz Pio',
      badge: '✨ Społeczność',
      desc: 'Członek Społeczności LUMINA • Kraków',
      avatar: '/avatar_robert.jpg',
      initialGreeting: 'Cześć bracie/siostro! Pozdrowienia z Krakowa w Panu Jezusie. ✨'
    },
    {
      id: 'zyta',
      slug: 'zyta',
      profileUrl: '/lumina-profile.html?user=zyta',
      name: 'Zyta Grzesik',
      badge: '✨ Społeczność',
      desc: 'Członkini Społeczności LUMINA • Warszawa',
      avatar: '/avatar_zyta_grzesik.webp',
      initialGreeting: 'Dzień dobry! Błogosławieństwa Bożego na cały dzisiejszy dzień. 🌸'
    },
    {
      id: 'david',
      slug: 'david',
      profileUrl: '/lumina-profile.html?user=david',
      name: 'David Leoniuk',
      badge: '✨ Społeczność',
      desc: 'Członek Społeczności LUMINA • New York, USA',
      avatar: '/avatar_david_leoniuk.jpg',
      initialGreeting: 'God bless you! Pozdrowienia dla całej polskiej wspólnoty Christian Culture zza oceanu. ✨'
    }
  ];

  let currentChatPartner = COMMUNITY_MEMBERS[0]; // Domyślnie Czat Ogólny
  let currentPartnerRealtimeMessages = null; // Shared by the mounted listener and renderer.

  // 3. Wstrzyknięcie uniwersalnych stylów CSS (niezależnych od motywu podstrony)
  function injectStyles() {
    if (document.getElementById('ccGlobalChatStyles')) return;
    const style = document.createElement('style');
    style.id = 'ccGlobalChatStyles';
    style.textContent = `
      /* ── PRZYCISK CZATU CC GLOBAL (NEON W SZKLE) ── */
      .cc-chat-fab-wrap {
        position: fixed !important;
        right: max(18px, env(safe-area-inset-right)) !important;
        bottom: max(25px, env(safe-area-inset-bottom)) !important;
        z-index: 10000 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        pointer-events: auto !important;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        -webkit-tap-highlight-color: transparent !important;
        transition: bottom 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      /* LUMINA keeps the shared chat entry for guests and signed-in members. */
      html[data-lumina-theme] .cc-chat-fab-wrap,
      body.theme-lumina-light .cc-chat-fab-wrap,
      body.lumina-page .cc-chat-fab-wrap,
      body:has(#luminaThemeSwitchBtn) .cc-chat-fab-wrap,
      body:has(#luminaScrollTop) .cc-chat-fab-wrap {
        display: flex !important;
      }

      /* Guests have no native messaging button: preserve their entry/login invitation. */
      html body.user-is-guest #ccGlobalChatFab {
        display: flex !important;
      }
      .cc-chat-fab-btn {
        width: 50px !important;
        height: 50px !important;
        min-width: 50px !important;
        min-height: 50px !important;
        max-width: 50px !important;
        max-height: 50px !important;
        border-radius: 50% !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        background: transparent !important;
        cursor: pointer !important;
        outline: none !important;
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        touch-action: manipulation !important;
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease !important;
        filter: drop-shadow(0 8px 22px rgba(168, 85, 247, 0.45)) drop-shadow(0 3px 10px rgba(0, 0, 0, 0.6)) !important;
      }

      .cc-chat-fab-btn:hover {
        transform: scale(1.08) translateY(-2px) !important;
        filter: drop-shadow(0 12px 28px rgba(217, 70, 239, 0.65)) drop-shadow(0 4px 14px rgba(234, 179, 8, 0.5)) !important;
      }

      .cc-chat-fab-btn:active {
        transform: scale(0.96) translateY(0) !important;
      }

      .cc-chat-fab-btn:focus-visible {
        outline: 3px solid #EAB308 !important;
        outline-offset: 4px !important;
      }

      .cc-chat-fab-img {
        width: 100% !important;
        height: 100% !important;
        border-radius: 50% !important;
        object-fit: contain !important;
        display: block !important;
        pointer-events: none !important;
        user-select: none !important;
      }

      /* Wskaźnik nowej wiadomości / aktywności */
      .cc-chat-fab-badge {
        position: absolute !important;
        top: 2px !important;
        right: 2px !important;
        width: 14px !important;
        height: 14px !important;
        border-radius: 50% !important;
        background: #22C55E !important;
        border: 2px solid #0B0F19 !important;
        box-shadow: 0 0 10px #22C55E !important;
        pointer-events: none !important;
        animation: ccChatPulse 2s infinite ease-in-out !important;
      }

      @keyframes ccChatPulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.22); opacity: 0.85; }
        100% { transform: scale(1); opacity: 1; }
      }

      /* Etykieta tooltipowa dla desktopu */
      .cc-chat-fab-tooltip {
        position: absolute !important;
        right: calc(100% + 12px) !important;
        top: 50% !important;
        transform: translateY(-50%) translateX(6px) !important;
        background: linear-gradient(135deg, rgba(17, 24, 39, 0.96) 0%, rgba(30, 27, 75, 0.96) 100%) !important;
        border: 1px solid rgba(212, 175, 55, 0.4) !important;
        color: #F8FAFC !important;
        padding: 6px 12px !important;
        border-radius: 20px !important;
        font-size: 0.78rem !important;
        font-weight: 700 !important;
        white-space: nowrap !important;
        pointer-events: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 12px rgba(168, 85, 247, 0.25) !important;
      }

      .cc-chat-fab-wrap:hover .cc-chat-fab-tooltip {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateY(-50%) translateX(0) !important;
      }

      /* ── OKNO CZATU CC GLOBAL (LIVE + SPOŁECZNOŚĆ + KANAŁY) ── */
      .cc-chat-drawer-overlay {
        position: fixed !important;
        inset: 0 !important;
        background: rgba(4, 6, 12, 0.68) !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
        z-index: 10001 !important;
        opacity: 0 !important;
        visibility: hidden !important;
        transition: opacity 0.25s ease, visibility 0.25s !important;
        display: flex !important;
        align-items: flex-end !important;
        justify-content: flex-end !important;
      }

      .cc-chat-drawer-overlay.is-open {
        opacity: 1 !important;
        visibility: visible !important;
      }

      .cc-chat-drawer {
        position: fixed !important;
        right: max(18px, env(safe-area-inset-right)) !important;
        bottom: max(18px, env(safe-area-inset-bottom)) !important;
        width: 480px !important;
        max-width: calc(100vw - 32px) !important;
        height: 740px !important;
        max-height: calc(100vh - 36px) !important;
        background: linear-gradient(165deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 27, 75, 0.98) 55%, rgba(10, 15, 30, 0.99) 100%) !important;
        border: 1.5px solid rgba(212, 175, 55, 0.45) !important;
        border-radius: 24px !important;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(168, 85, 247, 0.35), inset 0 1px 1px rgba(255, 235, 170, 0.25) !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        transform: translateY(20px) scale(0.96) !important;
        opacity: 0 !important;
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease !important;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        color: #F8FAFC !important;
      }

      .cc-chat-drawer-overlay.is-open .cc-chat-drawer {
        transform: translateY(0) scale(1) !important;
        opacity: 1 !important;
      }

      /* Nagłówek okna czatu */
      .cc-chat-header {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 12px 16px !important;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%) !important;
        border-bottom: 1px solid rgba(212, 175, 55, 0.22) !important;
        gap: 8px !important;
      }

      .cc-chat-header-brand {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        min-width: 0 !important;
      }

      .cc-chat-header-icon {
        width: 36px !important;
        height: 36px !important;
        min-width: 36px !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        filter: drop-shadow(0 2px 8px rgba(168, 85, 247, 0.45)) !important;
        border: 1px solid #C4A35A !important;
      }

      .cc-chat-header-titles {
        display: flex !important;
        flex-direction: column !important;
        min-width: 0 !important;
      }

      .cc-chat-header-title {
        font-size: 0.95rem !important;
        font-weight: 800 !important;
        letter-spacing: 0.02em !important;
        color: #FFFFFF !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
      }

      .cc-chat-header-sub {
        font-size: 0.72rem !important;
        font-weight: 600 !important;
        color: #C4A35A !important;
        letter-spacing: 0.04em !important;
        display: flex !important;
        align-items: center !important;
        gap: 5px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .cc-chat-live-dot {
        width: 7px !important;
        height: 7px !important;
        border-radius: 50% !important;
        background: #22C55E !important;
        box-shadow: 0 0 6px #22C55E !important;
        display: inline-block !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-header-actions {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
      }

      .cc-chat-icon-btn {
        width: 36px !important;
        height: 36px !important;
        min-width: 36px !important;
        min-height: 36px !important;
        border-radius: 50% !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        background: rgba(255, 255, 255, 0.06) !important;
        color: #E2E8F0 !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-decoration: none !important;
        transition: background 0.2s ease, transform 0.2s ease, color 0.2s !important;
      }

      .cc-chat-icon-btn:hover {
        background: rgba(168, 85, 247, 0.3) !important;
        border-color: rgba(212, 175, 55, 0.5) !important;
        color: #FFFFFF !important;
        transform: scale(1.05) !important;
      }

      .cc-chat-close-btn:hover {
        background: rgba(239, 68, 68, 0.25) !important;
        border-color: rgba(239, 68, 68, 0.5) !important;
        color: #EF4444 !important;
      }

      .cc-chat-icon-btn svg {
        width: 16px !important;
        height: 16px !important;
        display: block !important;
        stroke: currentColor !important;
        fill: none !important;
      }

      /* ── GŁÓWNE ZAKŁADKI (ROZMOWA / SPOŁECZNOŚĆ / KANAŁY) ── */
      .cc-chat-tabs-bar {
        display: flex !important;
        padding: 6px 10px !important;
        gap: 4px !important;
        background: rgba(0, 0, 0, 0.42) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
      }

      .cc-chat-tab-btn {
        flex: 1 1 33.33% !important;
        min-height: 36px !important;
        height: 36px !important;
        padding: 4px 8px !important;
        border-radius: 12px !important;
        font-size: 0.74rem !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 5px !important;
        border: 1px solid transparent !important;
        background: transparent !important;
        color: #94A3B8 !important;
        transition: all 0.2s ease !important;
        font-family: inherit !important;
        white-space: nowrap !important;
      }

      .cc-chat-tab-btn:hover:not(.is-active) {
        background: rgba(255, 255, 255, 0.06) !important;
        color: #F8FAFC !important;
      }

      .cc-chat-tab-btn.is-active {
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(217, 70, 239, 0.22) 100%) !important;
        border: 1px solid rgba(212, 175, 55, 0.5) !important;
        color: #FFFFFF !important;
        box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3) !important;
      }

      .cc-chat-tab-btn svg {
        width: 14px !important;
        height: 14px !important;
        display: block !important;
        flex-shrink: 0 !important;
      }

      /* ── WIDOK 1: CZAT & ROZMOWA ── */
      .cc-chat-view-live {
        display: flex !important;
        flex-direction: column !important;
        flex: 1 1 auto !important;
        min-height: 0 !important;
        overflow: hidden !important;
      }

      /* Wstęga awatarów szybkiego wyboru rozmówcy (pełna widoczność bez obcinania) */
      .cc-chat-partners-bar {
        padding: 10px 14px !important;
        background: rgba(8, 12, 22, 0.75) !important;
        border-bottom: 1px solid rgba(212, 175, 55, 0.18) !important;
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        scrollbar-width: thin !important;
        scrollbar-color: rgba(196, 163, 90, 0.3) transparent !important;
        flex-shrink: 0 !important;
        min-height: 86px !important;
        box-sizing: border-box !important;
      }

      .cc-chat-partners-bar::-webkit-scrollbar {
        height: 4px !important;
      }
      .cc-chat-partners-bar::-webkit-scrollbar-thumb {
        background: rgba(196, 163, 90, 0.35) !important;
        border-radius: 4px !important;
      }

      .cc-chat-partner-chip {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 4px !important;
        background: transparent !important;
        border: none !important;
        cursor: pointer !important;
        padding: 2px !important;
        min-width: 58px !important;
        flex-shrink: 0 !important;
        transition: transform 0.2s ease !important;
        touch-action: manipulation !important;
      }

      .cc-chat-partner-chip:hover {
        transform: translateY(-2px) !important;
      }

      .cc-chat-partner-avatar-wrap {
        position: relative !important;
        width: 44px !important;
        height: 44px !important;
        min-width: 44px !important;
        min-height: 44px !important;
        border-radius: 50% !important;
        padding: 2px !important;
        border: 2px solid rgba(255, 255, 255, 0.22) !important;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.45) !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-sizing: border-box !important;
      }

      .cc-chat-partner-chip:hover .cc-chat-partner-avatar-wrap {
        border-color: #FACC15 !important;
        box-shadow: 0 0 12px rgba(250, 204, 21, 0.5) !important;
      }

      .cc-chat-partner-chip.is-active .cc-chat-partner-avatar-wrap {
        border-color: #C4A35A !important;
        box-shadow: 0 0 14px rgba(196, 163, 90, 0.8), 0 0 6px #A855F7 !important;
      }

      .cc-chat-partner-chip-img {
        width: 100% !important;
        height: 100% !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        display: block !important;
      }

      .cc-chat-partner-chip-name {
        font-size: 0.70rem !important;
        font-weight: 700 !important;
        color: #CBD5E1 !important;
        white-space: nowrap !important;
        max-width: 62px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        text-align: center !important;
        line-height: 1.2 !important;
      }

      .cc-chat-partner-chip.is-active .cc-chat-partner-chip-name {
        color: #FACC15 !important;
        font-weight: 800 !important;
      }

      /* Belka tożsamości aktywnej konwersacji */
      .cc-chat-active-info-bar {
        padding: 8px 14px !important;
        background: rgba(0, 0, 0, 0.5) !important;
        border-bottom: 1px solid rgba(212, 175, 55, 0.18) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 8px !important;
        flex-shrink: 0 !important;
        box-sizing: border-box !important;
      }

      .cc-chat-active-info-left {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        min-width: 0 !important;
        flex-wrap: wrap !important;
      }

      .cc-chat-active-badge {
        font-size: 0.64rem !important;
        padding: 2px 6px !important;
        border-radius: 8px !important;
        background: rgba(168, 85, 247, 0.25) !important;
        color: #D8B4FE !important;
        border: 1px solid rgba(168, 85, 247, 0.3) !important;
        white-space: nowrap !important;
      }

      .cc-chat-active-name {
        font-size: 0.80rem !important;
        font-weight: 700 !important;
        color: #FFFFFF !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .cc-chat-active-profile-btn {
        background: rgba(250, 204, 21, 0.12) !important;
        border: 1px solid rgba(212, 175, 55, 0.55) !important;
        color: #FACC15 !important;
        padding: 3px 8px !important;
        border-radius: 10px !important;
        font-size: 0.68rem !important;
        font-weight: 700 !important;
        text-decoration: none !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 4px !important;
        transition: all 0.2s ease !important;
        white-space: nowrap !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-active-profile-btn:hover {
        background: rgba(250, 204, 21, 0.25) !important;
        border-color: #FACC15 !important;
        transform: scale(1.03) !important;
        color: #FFFFFF !important;
      }

      .cc-chat-members-switch-btn {
        background: rgba(255, 255, 255, 0.06) !important;
        border: 1px solid rgba(212, 175, 55, 0.4) !important;
        color: #FACC15 !important;
        padding: 4px 10px !important;
        border-radius: 10px !important;
        font-size: 0.70rem !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        white-space: nowrap !important;
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        transition: all 0.2s ease !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-members-switch-btn:hover {
        background: rgba(196, 163, 90, 0.25) !important;
      }

      /* Strumień wiadomości czatu */
      .cc-chat-feed {
        flex: 1 1 auto !important;
        overflow-y: auto !important;
        padding: 12px 16px !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
        scrollbar-width: thin !important;
        scrollbar-color: rgba(196, 163, 90, 0.3) transparent !important;
      }

      .cc-chat-feed::-webkit-scrollbar {
        width: 5px !important;
      }
      .cc-chat-feed::-webkit-scrollbar-thumb {
        background: rgba(196, 163, 90, 0.35) !important;
        border-radius: 4px !important;
      }

      /* Wiadomość powitalna systemu */
      .cc-chat-system-bubble {
        background: linear-gradient(135deg, rgba(88, 28, 135, 0.35) 0%, rgba(30, 27, 75, 0.45) 100%) !important;
        border: 1px solid rgba(168, 85, 247, 0.3) !important;
        border-radius: 16px !important;
        padding: 10px 12px !important;
        font-size: 0.78rem !important;
        line-height: 1.45 !important;
        color: #E2E8F0 !important;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3) !important;
      }

      .cc-chat-system-bubble strong {
        color: #FACC15 !important;
      }

      /* Pojedyncza wiadomość czatu */
      .cc-chat-msg-row {
        display: flex !important;
        align-items: flex-start !important;
        gap: 8px !important;
        max-width: 90% !important;
      }

      .cc-chat-msg-row.is-me {
        align-self: flex-end !important;
        flex-direction: row-reverse !important;
      }

      .cc-chat-msg-avatar {
        width: 30px !important;
        height: 30px !important;
        min-width: 30px !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        border: 1.5px solid rgba(212, 175, 55, 0.4) !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4) !important;
      }

      .cc-chat-msg-content {
        display: flex !important;
        flex-direction: column !important;
        gap: 2px !important;
        min-width: 0 !important;
      }

      .cc-chat-msg-meta {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        font-size: 0.68rem !important;
        color: #94A3B8 !important;
        padding: 0 2px !important;
      }

      .cc-chat-msg-row.is-me .cc-chat-msg-meta {
        justify-content: flex-end !important;
      }

      .cc-chat-msg-sender {
        font-weight: 700 !important;
        color: #F8FAFC !important;
        transition: color 0.2s ease !important;
      }
      .cc-chat-msg-sender:hover {
        color: #FACC15 !important;
      }

      .cc-chat-msg-badge {
        font-size: 0.62rem !important;
        padding: 1px 5px !important;
        border-radius: 6px !important;
        background: rgba(168, 85, 247, 0.25) !important;
        color: #D8B4FE !important;
        border: 1px solid rgba(168, 85, 247, 0.3) !important;
      }

      .cc-chat-msg-bubble {
        padding: 8px 12px !important;
        border-radius: 14px !important;
        font-size: 0.82rem !important;
        line-height: 1.4 !important;
        word-break: break-word !important;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.35) !important;
      }

      .cc-chat-msg-row:not(.is-me) .cc-chat-msg-bubble {
        background: rgba(30, 41, 59, 0.85) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        color: #F8FAFC !important;
        border-top-left-radius: 4px !important;
      }

      .cc-chat-msg-row.is-me .cc-chat-msg-bubble {
        background: linear-gradient(135deg, #7E22CE 0%, #9333EA 100%) !important;
        border: 1px solid rgba(212, 175, 55, 0.5) !important;
        color: #FFFFFF !important;
        border-top-right-radius: 4px !important;
      }

      /* Dolny pasek wprowadzania wiadomości */
      .cc-chat-composer {
        padding: 10px 14px !important;
        background: rgba(0, 0, 0, 0.5) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 6px !important;
      }

      .cc-chat-form {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        width: 100% !important;
      }

      .cc-chat-input {
        flex: 1 1 auto !important;
        height: 44px !important;
        min-height: 44px !important;
        background: rgba(15, 23, 42, 0.8) !important;
        border: 1px solid rgba(212, 175, 55, 0.35) !important;
        border-radius: 22px !important;
        padding: 0 16px !important;
        font-size: 0.86rem !important;
        color: #FFFFFF !important;
        outline: none !important;
        font-family: inherit !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
      }

      .cc-chat-input::placeholder {
        color: #94A3B8 !important;
      }

      .cc-chat-input:focus {
        border-color: #C4A35A !important;
        box-shadow: 0 0 14px rgba(196, 163, 90, 0.3) !important;
      }

      .cc-chat-send-btn {
        width: 44px !important;
        height: 44px !important;
        min-width: 44px !important;
        min-height: 44px !important;
        border-radius: 50% !important;
        border: 1px solid #C4A35A !important;
        background: linear-gradient(135deg, #A855F7 0%, #EC4899 100%) !important;
        color: #FFFFFF !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        outline: none !important;
        transition: transform 0.2s ease, filter 0.2s ease !important;
        box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4) !important;
      }

      .cc-chat-send-btn:hover {
        transform: scale(1.06) !important;
        filter: brightness(1.15) !important;
      }

      .cc-chat-send-btn:active {
        transform: scale(0.96) !important;
      }

      .cc-chat-send-btn svg {
        width: 18px !important;
        height: 18px !important;
        fill: #FFFFFF !important;
        display: block !important;
        transform: translateX(1px) !important;
      }

      .cc-chat-hint {
        font-size: 0.65rem !important;
        color: #94A3B8 !important;
        text-align: center !important;
        letter-spacing: 0.02em !important;
      }

      /* ── WIDOK 2: KATALOG UŻYTKOWNIKÓW SPOŁECZNOŚCI ── */
      .cc-chat-view-members {
        display: none !important;
        flex-direction: column !important;
        flex: 1 1 auto !important;
        min-height: 0 !important;
        overflow: hidden !important;
      }

      .cc-chat-members-search-wrap {
        padding: 10px 14px !important;
        background: rgba(0, 0, 0, 0.35) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
      }

      .cc-chat-members-search-input {
        width: 100% !important;
        height: 38px !important;
        background: rgba(15, 23, 42, 0.8) !important;
        border: 1px solid rgba(212, 175, 55, 0.3) !important;
        border-radius: 12px !important;
        padding: 0 12px !important;
        font-size: 0.80rem !important;
        color: #FFFFFF !important;
        outline: none !important;
        font-family: inherit !important;
      }

      .cc-chat-members-list {
        flex: 1 1 auto !important;
        overflow-y: auto !important;
        padding: 10px 14px !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
        scrollbar-width: thin !important;
        scrollbar-color: rgba(196, 163, 90, 0.3) transparent !important;
      }

      .cc-chat-members-list::-webkit-scrollbar {
        width: 5px !important;
      }
      .cc-chat-members-list::-webkit-scrollbar-thumb {
        background: rgba(196, 163, 90, 0.35) !important;
        border-radius: 4px !important;
      }

      .cc-chat-member-card {
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 14px !important;
        padding: 10px 12px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }

      .cc-chat-member-card:hover {
        background: rgba(168, 85, 247, 0.15) !important;
        border-color: rgba(212, 175, 55, 0.5) !important;
        transform: translateY(-1px) !important;
      }

      .cc-chat-member-card-left {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        min-width: 0 !important;
      }

      .cc-chat-member-avatar {
        width: 40px !important;
        height: 40px !important;
        min-width: 40px !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        border: 1.5px solid #C4A35A !important;
      }

      .cc-chat-member-info {
        display: flex !important;
        flex-direction: column !important;
        min-width: 0 !important;
      }

      .cc-chat-member-name-row {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
      }

      .cc-chat-member-name {
        font-size: 0.84rem !important;
        font-weight: 700 !important;
        color: #FFFFFF !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .cc-chat-member-desc {
        font-size: 0.70rem !important;
        color: #94A3B8 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .cc-chat-member-actions {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-member-profile-btn {
        background: rgba(255, 255, 255, 0.08) !important;
        border: 1px solid rgba(212, 175, 55, 0.45) !important;
        color: #FACC15 !important;
        padding: 6px 10px !important;
        border-radius: 12px !important;
        font-size: 0.70rem !important;
        font-weight: 700 !important;
        text-decoration: none !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 4px !important;
        transition: all 0.2s ease !important;
        white-space: nowrap !important;
      }

      .cc-chat-member-profile-btn:hover {
        background: rgba(250, 204, 21, 0.22) !important;
        border-color: #FACC15 !important;
        transform: translateY(-1px) !important;
        color: #FFFFFF !important;
      }

      .cc-chat-member-chat-btn {
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(217, 70, 239, 0.2) 100%) !important;
        border: 1px solid #C4A35A !important;
        color: #F8FAFC !important;
        padding: 6px 12px !important;
        border-radius: 12px !important;
        font-size: 0.72rem !important;
        font-weight: 700 !important;
        white-space: nowrap !important;
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        flex-shrink: 0 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }

      .cc-chat-member-chat-btn:hover {
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(217, 70, 239, 0.4) 100%) !important;
        border-color: #FACC15 !important;
        transform: translateY(-1px) !important;
      }

      /* ── WIDOK 3: KANAŁY KOMUNIKACJI (4 KARTY) ── */
      .cc-chat-view-channels {
        display: none !important;
        flex-direction: column !important;
        flex: 1 1 auto !important;
        min-height: 0 !important;
        overflow-y: auto !important;
        padding: 14px 16px !important;
        gap: 10px !important;
        scrollbar-width: thin !important;
        scrollbar-color: rgba(196, 163, 90, 0.3) transparent !important;
      }

      .cc-chat-view-channels::-webkit-scrollbar {
        width: 5px !important;
      }
      .cc-chat-view-channels::-webkit-scrollbar-thumb {
        background: rgba(196, 163, 90, 0.35) !important;
        border-radius: 4px !important;
      }

      .cc-chat-action-card {
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 14px !important;
        padding: 12px 14px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        text-decoration: none !important;
        color: #F8FAFC !important;
        min-height: 44px !important;
      }

      .cc-chat-action-card:hover {
        background: rgba(168, 85, 247, 0.15) !important;
        border-color: rgba(212, 175, 55, 0.5) !important;
        transform: translateY(-1px) !important;
      }

      .cc-chat-action-card-left {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
      }

      .cc-chat-action-icon {
        width: 38px !important;
        height: 38px !important;
        min-width: 38px !important;
        border-radius: 10px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .cc-chat-action-icon svg {
        width: 18px !important;
        height: 18px !important;
        display: block !important;
        fill: currentColor !important;
      }

      .cc-chat-action-info {
        display: flex !important;
        flex-direction: column !important;
      }

      .cc-chat-action-title {
        font-size: 0.86rem !important;
        font-weight: 700 !important;
        color: #FFFFFF !important;
      }

      .cc-chat-action-desc {
        font-size: 0.72rem !important;
        color: #94A3B8 !important;
      }

      .cc-chat-action-arrow {
        color: #C4A35A !important;
        display: flex !important;
        align-items: center !important;
      }

      .cc-chat-action-arrow svg {
        width: 14px !important;
        height: 14px !important;
        display: block !important;
        stroke: currentColor !important;
        fill: none !important;
      }

      /* Stopka w widoku kanałów */
      .cc-chat-channels-footer {
        margin-top: auto !important;
        padding-top: 10px !important;
        border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        font-size: 0.72rem !important;
        color: #94A3B8 !important;
      }

      .cc-chat-channels-footer a {
        color: #C4A35A !important;
        text-decoration: none !important;
        font-weight: 700 !important;
      }

      .cc-chat-channels-footer a:hover {
        text-decoration: underline !important;
      }

      /* ── RESPONSIVE DLA TELEFONÓW (<= 768px) ── */
      @media (max-width: 768px) {
        .cc-chat-fab-wrap {
          right: max(14px, env(safe-area-inset-right)) !important;
          bottom: max(14px, env(safe-area-inset-bottom)) !important;
        }

        .cc-chat-fab-btn {
          width: 56px !important;
          height: 56px !important;
          min-width: 56px !important;
          min-height: 56px !important;
          max-width: 56px !important;
          max-height: 56px !important;
        }

        .cc-chat-fab-tooltip {
          display: none !important;
        }

        .cc-chat-drawer {
          right: 0 !important;
          left: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          max-width: 100vw !important;
          top: 0 !important;
          bottom: auto !important;
          height: var(--lumi-viewport-height, 100dvh) !important;
          max-height: var(--lumi-viewport-height, 100dvh) !important;
          border-radius: 0 !important;
          border-left: none !important;
          border-right: none !important;
          border-bottom: none !important;
          transform: translateY(100%) !important;
        }

        .cc-chat-drawer-overlay.is-open .cc-chat-drawer {
          transform: translateY(0) !important;
        }

        .cc-chat-input {
          font-size: 16px !important; /* zapobiega auto-zoomowi na iOS */
        }
        .cc-chat-header { padding: max(12px, env(safe-area-inset-top)) 12px 12px !important; }
        .cc-chat-composer { padding-bottom: max(10px, env(safe-area-inset-bottom)) !important; }
        .cc-chat-icon-btn, .cc-chat-send-btn { min-width:44px!important; min-height:44px!important; }
      }
      .cc-chat-drawer-overlay { z-index:20000000!important; }
      .cc-chat-drawer { background:#101425!important; box-shadow:0 16px 48px #0005!important; }
      .cc-chat-header { background:#101425!important; border-bottom:1px solid rgba(255,255,255,0.08)!important; gap:8px!important; }
      .cc-chat-header-brand { flex:0 1 auto!important; min-width:0!important; }
      .cc-chat-header .cc-chat-radio, .chat-header-bar .cc-chat-radio { margin:0 6px 0 auto!important; }
      .cc-chat-header-title { font-size:0.95rem!important; font-weight:800!important; color:#fff!important; white-space:nowrap!important; }
      .cc-chat-header-actions { flex-shrink:0!important; gap:6px!important; }
      .cc-chat-header-icon { filter:none!important; border-radius:10px!important; border:1px solid rgba(196,163,90,0.4)!important; }
      .cc-chat-live-dot { display:inline-block!important; width:6px!important; height:6px!important; background:#10b981!important; border-radius:50%!important; }
      .cc-chat-msg-bubble { box-shadow:none!important; border-radius:18px!important; line-height:1.5!important; }
      .cc-chat-msg-row.is-me .cc-chat-msg-bubble { background:#7551d8!important; }
      .cc-chat-msg-row:not(.is-me) .cc-chat-msg-bubble { background:#263244!important; }
      .cc-chat-composer { background:#101827!important; border-top:1px solid #ffffff18!important; }
    `;
    document.head.appendChild(style);
    const syncLumiViewport = () => {
      const height = window.visualViewport?.height || window.innerHeight;
      if (Number.isFinite(height) && height > 0) document.documentElement.style.setProperty('--lumi-viewport-height', height + 'px');
    };
    syncLumiViewport();
    window.addEventListener('resize', syncLumiViewport, { passive: true });
    window.visualViewport?.addEventListener('resize', syncLumiViewport, { passive: true });
  }

  // 4. Sprawdzenie aktywnej sesji użytkownika LUMINA / CC ID
  function getUserState() {
    try {
      if (window.LuminaDB && typeof window.LuminaDB.getCurrentUser === 'function') {
        const u = window.LuminaDB.getCurrentUser();
        if (u && !u.isAnonymous) {
          const prof = (typeof window.LuminaDB.getCurrentProfile === 'function' && window.LuminaDB.getCurrentProfile()) || {};
          return {
            isLoggedIn: true,
            name: prof.name || u.displayName || 'Członek LUMINA',
            avatar: prof.avatar || u.photoURL || '/images/team/cezary-rogowski.webp',
            uid: u.uid,
            slug: prof.slug || u.uid,
            badge: prof.badge || '🕊️ Członek CC'
          };
        }
      }

      if (localStorage.getItem('lumina_user_session') === 'active') {
        const uStr = localStorage.getItem('lumina_current_user');
        if (uStr) {
          const u = JSON.parse(uStr);
          let prof = null;
          try {
            prof = JSON.parse(localStorage.getItem('lumina_current_user_profile') || localStorage.getItem('lumina_my_profile') || 'null');
          } catch (e) {}
          return {
            isLoggedIn: true,
            name: prof?.name || u?.displayName || 'Członek LUMINA',
            avatar: prof?.avatar || u?.photoURL || '/images/team/cezary-rogowski.webp',
            uid: u?.uid,
            slug: prof?.slug || u?.uid,
            badge: prof?.badge || '🕊️ Członek CC'
          };
        }
      }
    } catch (e) {}

    return {
      isLoggedIn: false,
      name: 'Gość Christian Culture',
      avatar: '/images/chat/cc-chat-button-120.webp',
      uid: null,
      slug: null,
      badge: 'Gość'
    };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 5. Montowanie struktury HTML przycisku i okna czatu
  function mountComponent() {
    if (document.getElementById('ccGlobalChatOverlay')) return;

    // Przycisk FAB (Neonowy w szkle z pliku Neonowy przycisk czatu w szkle.png) — uniwersalny w całym ekosystemie
    let fabWrap = document.getElementById('ccGlobalChatFab');
    if (!fabWrap) {
      fabWrap = document.createElement('div');
      fabWrap.id = 'ccGlobalChatFab';
      fabWrap.className = 'cc-chat-fab-wrap';
      fabWrap.setAttribute('role', 'region');
      fabWrap.setAttribute('aria-label', 'LUMI Messenger');

      fabWrap.innerHTML = `
        <div class="cc-chat-fab-tooltip" id="ccChatFabTooltip">LUMI Messenger · LumiMess</div>
        <button type="button" class="cc-chat-fab-btn" id="ccChatFabBtn" aria-label="Otwórz LUMI Messenger" title="LUMI Messenger · LumiMess">
          <picture>
            <source srcset="/images/chat/cc-chat-button.webp" type="image/webp">
            <img src="/images/chat/cc-chat-button.png" alt="LUMI Messenger" class="cc-chat-fab-img" width="50" height="50" loading="eager" decoding="sync">
          </picture>
          <span class="cc-chat-fab-badge" aria-hidden="true"></span>
        </button>
      `;
      document.body.appendChild(fabWrap);
    }

    // Okno czatu (Zintegrowane: Czat + Społeczność + Kanały)
    const overlay = document.createElement('div');
    overlay.id = 'ccGlobalChatOverlay';
    overlay.className = 'cc-chat-drawer-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    overlay.innerHTML = `
      <div class="cc-chat-drawer" role="dialog" aria-modal="true" aria-labelledby="ccChatHeaderTitle">
        <!-- Nagłówek okna -->
        <div class="cc-chat-header">
          <a href="/lumina-tablica.html" target="_blank" rel="noopener noreferrer" class="cc-chat-header-brand" id="ccChatHeaderProfileLink" title="Otwórz stronę / profil w portalu LUMINA" style="text-decoration:none;">
            <img src="/images/chat/cc-chat-button-120.webp" id="ccChatHeaderPartnerAvatar" alt="CC Chat" class="cc-chat-header-icon" width="38" height="38" onerror="this.src='/images/chat/cc-chat-button-120.webp'">
            <div class="cc-chat-header-titles">
              <div class="cc-chat-header-title" id="ccChatHeaderTitle">
                <span>LUMI Messenger</span>
              </div>
              <div class="cc-chat-header-sub">
                <span class="cc-chat-live-dot"></span>
                <span id="ccChatHeaderSubText">Czat Ogólny Społeczności</span>
              </div>
            </div>
          </a>
          <div class="cc-chat-header-actions">
            <a href="/lumina.html?openPublicChat=1" target="_blank" rel="noopener noreferrer" class="cc-chat-icon-btn" title="Otwórz pełny portal LUMINA" aria-label="Otwórz pełny portal LUMINA">
              <svg viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
            <button type="button" class="cc-chat-icon-btn cc-chat-close-btn" id="ccChatCloseBtn" aria-label="Zamknij czat" title="Zamknij">
              <svg viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <!-- Trzy główne zakładki wyboru -->
        <div class="cc-chat-tabs-bar" role="tablist" aria-label="Nawigacja czatu">
          <button type="button" class="cc-chat-tab-btn is-active" id="ccChatTabLiveBtn" role="tab" aria-selected="true" aria-controls="ccChatViewLive">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
            <span>Rozmowa</span>
          </button>
          <button type="button" class="cc-chat-tab-btn" id="ccChatTabMembersBtn" role="tab" aria-selected="false" aria-controls="ccChatViewMembers">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Społeczność</span>
          </button>
          <button type="button" class="cc-chat-tab-btn" id="ccChatTabChannelsBtn" role="tab" aria-selected="false" aria-controls="ccChatViewChannels">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
            <span>Kanały</span>
          </button>
        </div>

        <!-- ════ WIDOK 1: CZAT & ROZMOWA ════ -->
        <div class="cc-chat-view-live" id="ccChatViewLive" role="tabpanel" aria-labelledby="ccChatTabLiveBtn">
          <!-- Wstęga szybkiego wyboru rozmówcy -->
          <div class="cc-chat-partners-bar" id="ccChatPartnersBar"></div>

          <!-- Strumień wiadomości na żywo -->
          <div class="cc-chat-feed" id="ccChatFeed">
            <div id="ccChatMessagesList" style="display: flex; flex-direction: column; gap: 10px;"></div>
          </div>

          <!-- Formularz wysyłania wiadomości -->
          <div class="cc-chat-composer">
            <form class="cc-chat-form" id="ccChatForm">
              <input type="text" id="ccChatInput" class="cc-chat-input" placeholder="Napisz wiadomość na czacie..." maxlength="500" autocomplete="off" aria-label="Treść wiadomości">
              <button type="submit" id="ccChatSendBtn" class="cc-chat-send-btn" title="Wyślij wiadomość" aria-label="Wyślij wiadomość">
                <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </form>
            <div class="cc-chat-hint">Jedna tożsamość LUMINA • Prawda, miłość i wzajemny szacunek 🕊️</div>
          </div>
        </div>

        <!-- ════ WIDOK 2: KATALOG UŻYTKOWNIKÓW SPOŁECZNOŚCI ════ -->
        <div class="cc-chat-view-members" id="ccChatViewMembers" role="tabpanel" aria-labelledby="ccChatTabMembersBtn">
          <div class="cc-chat-members-search-wrap">
            <input type="text" id="ccChatMembersSearchInput" class="cc-chat-members-search-input" placeholder="🔍 Szukaj członka społeczności (np. Wioletta, Mariusz, Andrzej)..." aria-label="Szukaj członka społeczności">
          </div>
          <div class="cc-chat-members-list" id="ccChatMembersList"></div>
        </div>

        <!-- ════ WIDOK 3: KANAŁY KOMUNIKACJI (KARTY NAWIGACJI) ════ -->
        <div class="cc-chat-view-channels" id="ccChatViewChannels" role="tabpanel" aria-labelledby="ccChatTabChannelsBtn">
          <div class="cc-chat-system-bubble">
            ✨ <strong>Pokój Wam!</strong> Witaj w centralnym węźle komunikacji ekosystemu Christian Culture.
            Wybierz dogodną formę kontaktu: rozmowę na czacie, katalog społeczności, tablicę LUMINA, wsparcie duszpasterskie lub grupę WhatsApp.
          </div>

          <!-- Karta 0: Asystent Christian Culture -->
          <div class="cc-chat-action-card" id="ccChatActionAssistant" role="button" tabindex="0">
            <div class="cc-chat-action-card-left">
              <div class="cc-chat-action-icon" style="background: rgba(196, 163, 90, 0.22); color: #E2CC9A;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
              </div>
              <div class="cc-chat-action-info">
                <span class="cc-chat-action-title">Asystent Christian Culture 🧭</span>
                <span class="cc-chat-action-desc">Wirtualny gospodarz · Pomoc i inspiracja przez całą dobę</span>
              </div>
            </div>
            <span class="cc-chat-action-arrow"><svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
          </div>

          <!-- Karta 1: Czat Ogólny Społeczności LUMINA -->
          <div class="cc-chat-action-card" id="ccChatActionLumina" role="button" tabindex="0">
            <div class="cc-chat-action-card-left">
              <div class="cc-chat-action-icon" style="background: rgba(168, 85, 247, 0.2); color: #C084FC;">
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
              </div>
              <div class="cc-chat-action-info">
                <span class="cc-chat-action-title">Czat Ogólny Społeczności</span>
                <span class="cc-chat-action-desc">Strumień wiadomości na żywo całej społeczności</span>
              </div>
            </div>
            <span class="cc-chat-action-arrow"><svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
          </div>

          <!-- Karta 2: Wszyscy Członkowie Społeczności -->
          <div class="cc-chat-action-card" id="ccChatActionMembers" role="button" tabindex="0">
            <div class="cc-chat-action-card-left">
              <div class="cc-chat-action-icon" style="background: rgba(212, 175, 55, 0.2); color: #FACC15;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div class="cc-chat-action-info">
                <span class="cc-chat-action-title">Wszyscy Członkowie Społeczności</span>
                <span class="cc-chat-action-desc">Przeglądaj profile i rozmawiaj prywatnie</span>
              </div>
            </div>
            <span class="cc-chat-action-arrow"><svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
          </div>

          <!-- Karta 3: Tablica Społeczności LUMINA -->
          <a href="/lumina-tablica.html" target="_blank" rel="noopener noreferrer" class="cc-chat-action-card">
            <div class="cc-chat-action-card-left">
              <div class="cc-chat-action-icon" style="background: rgba(244, 63, 94, 0.2); color: #FB7185;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1"></path><path d="M18 2h4v4"></path><path d="M14 11l7-7"></path></svg>
              </div>
              <div class="cc-chat-action-info">
                <span class="cc-chat-action-title">Tablica Społeczności LUMINA 🕊️</span>
                <span class="cc-chat-action-desc">Publiczne wpisy, intencje modlitewne i świadectwa</span>
              </div>
            </div>
            <span class="cc-chat-action-arrow"><svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></span>
          </a>

          <!-- Karta 4: Rozmowa Duszpasterska / Duchowny Mariusz -->
          <a href="tel:+48608337477" class="cc-chat-action-card">
            <div class="cc-chat-action-card-left">
              <div class="cc-chat-action-icon" style="background: rgba(234, 179, 8, 0.2); color: #FACC15;">
                <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              </div>
              <div class="cc-chat-action-info">
                <span class="cc-chat-action-title">Duchowny Mariusz</span>
                <span class="cc-chat-action-desc">Wsparcie duszpasterskie i modlitwa (+48 608 337 477)</span>
              </div>
            </div>
            <span class="cc-chat-action-arrow"><svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
          </a>

          <!-- Karta 5: WhatsApp Społeczności Christian Culture -->
          <a href="https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0" target="_blank" rel="noopener noreferrer" class="cc-chat-action-card">
            <div class="cc-chat-action-card-left">
              <div class="cc-chat-action-icon" style="background: rgba(34, 197, 94, 0.2); color: #4ADE80;">
                <svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.79 14.07c-.24.68-1.2 1.25-1.74 1.32-.49.07-1.12.1-3.26-.79-2.73-1.14-4.49-3.92-4.63-4.1-.14-.19-1.1-1.46-1.1-2.79 0-1.32.69-1.97.94-2.24.25-.26.54-.33.72-.33.18 0 .36 0 .52.01.17.01.4.07.61.57.24.58.82 2 .89 2.15.07.15.12.33.02.53-.1.19-.15.31-.3.48-.15.17-.31.38-.45.51-.15.15-.3.31-.13.61.17.3 1.07 1.77 2.3 2.87 1.58 1.41 2.91 1.85 3.32 2.05.41.2.65.17.89-.1.24-.28 1.03-1.2 1.31-1.61.27-.41.55-.35.92-.21.38.14 2.38 1.12 2.79 1.32.41.2.68.31.78.48.1.18.1 1.02-.14 1.7z"/></svg>
              </div>
              <div class="cc-chat-action-info">
                <span class="cc-chat-action-title">Grupa WhatsApp CC</span>
                <span class="cc-chat-action-desc">Codzienne rozważania i braterstwo</span>
              </div>
            </div>
            <span class="cc-chat-action-arrow"><svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></span>
          </a>

          <!-- Karta 6: Skontaktuj się ze Sztabem CC (Email / Infolinia) -->
          <a href="/o-nas.html" class="cc-chat-action-card">
            <div class="cc-chat-action-card-left">
              <div class="cc-chat-action-icon" style="background: rgba(56, 189, 248, 0.2); color: #38BDF8;">
                <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              </div>
              <div class="cc-chat-action-info">
                <span class="cc-chat-action-title">O Inicjatywie i Kontakt</span>
                <span class="cc-chat-action-desc">Cezary i Wioletta Rogowscy • Redakcja</span>
              </div>
            </div>
            <span class="cc-chat-action-arrow"><svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
          </a>

          <!-- Stopka w widoku kanałów -->
          <div class="cc-chat-channels-footer">
            <span>Jeden czat • Jedna tożsamość LUMINA</span>
            <a href="/lumina-tablica.html">Tablica 🕊️</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    if (window.CCUnifiedChat?.mountRadio) {
      window.CCUnifiedChat.mountRadio(overlay.querySelector('.cc-chat-drawer'));
    }

    // Podpięcie elementów i zdarzeń
    const btn = document.getElementById('ccChatFabBtn');
    const closeBtn = document.getElementById('ccChatCloseBtn');
    const chatForm = document.getElementById('ccChatForm');
    const chatInput = document.getElementById('ccChatInput');
    const tabLiveBtn = document.getElementById('ccChatTabLiveBtn');
    const tabMembersBtn = document.getElementById('ccChatTabMembersBtn');
    const tabChannelsBtn = document.getElementById('ccChatTabChannelsBtn');
    const viewLive = document.getElementById('ccChatViewLive');
    const viewMembers = document.getElementById('ccChatViewMembers');
    const viewChannels = document.getElementById('ccChatViewChannels');
    const openMembersBtn = document.getElementById('ccChatOpenMembersBtn');
    const actionAssistantCard = document.getElementById('ccChatActionAssistant');
    const actionLuminaCard = document.getElementById('ccChatActionLumina');
    const actionMembersCard = document.getElementById('ccChatActionMembers');
    const membersSearchInput = document.getElementById('ccChatMembersSearchInput');

    function scrollToBottom() {
      const feed = document.getElementById('ccChatFeed');
      if (feed) {
        feed.scrollTop = feed.scrollHeight;
      }
    }

    function switchTab(target) {
      tabLiveBtn.classList.remove('is-active');
      tabMembersBtn.classList.remove('is-active');
      tabChannelsBtn.classList.remove('is-active');
      tabLiveBtn.setAttribute('aria-selected', 'false');
      tabMembersBtn.setAttribute('aria-selected', 'false');
      tabChannelsBtn.setAttribute('aria-selected', 'false');

      viewLive.style.setProperty('display', 'none', 'important');
      viewMembers.style.setProperty('display', 'none', 'important');
      viewChannels.style.setProperty('display', 'none', 'important');

      if (target === 'members') {
        tabMembersBtn.classList.add('is-active');
        tabMembersBtn.setAttribute('aria-selected', 'true');
        viewMembers.style.setProperty('display', 'flex', 'important');
        renderMembersList('');
        if (membersSearchInput && window.innerWidth > 768) membersSearchInput.focus();
      } else if (target === 'channels') {
        tabChannelsBtn.classList.add('is-active');
        tabChannelsBtn.setAttribute('aria-selected', 'true');
        viewChannels.style.setProperty('display', 'flex', 'important');
      } else {
        tabLiveBtn.classList.add('is-active');
        tabLiveBtn.setAttribute('aria-selected', 'true');
        viewLive.style.setProperty('display', 'flex', 'important');
        updateActivePartnerUI();
        renderChatMessages();
        scrollToBottom();
        if (chatInput && window.innerWidth > 768) {
          chatInput.focus();
        }
      }
    }

    tabLiveBtn.addEventListener('click', function () { switchTab('live'); });
    tabMembersBtn.addEventListener('click', function () { switchTab('members'); });
    tabChannelsBtn.addEventListener('click', function () { switchTab('channels'); });

    if (openMembersBtn) {
      openMembersBtn.addEventListener('click', function () { switchTab('members'); });
    }

    if (actionAssistantCard) {
      actionAssistantCard.addEventListener('click', function (e) {
        e.preventDefault();
        window.CCGlobalChat.open('assistant', 'cc-assistant');
      });
      actionAssistantCard.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.CCGlobalChat.open('assistant', 'cc-assistant');
        }
      });
    }

    if (actionLuminaCard) {
      actionLuminaCard.addEventListener('click', function (e) {
        e.preventDefault();
        setChatPartner(COMMUNITY_MEMBERS[0]);
        switchTab('live');
      });
      actionLuminaCard.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setChatPartner(COMMUNITY_MEMBERS[0]);
          switchTab('live');
        }
      });
    }

    if (actionMembersCard) {
      actionMembersCard.addEventListener('click', function (e) {
        e.preventDefault();
        switchTab('members');
      });
      actionMembersCard.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          switchTab('members');
        }
      });
    }

    if (membersSearchInput) {
      membersSearchInput.addEventListener('input', function () {
        renderMembersList(membersSearchInput.value.trim().toLowerCase());
      });
    }

    // Stan aktywnej subskrypcji Firestore realtime
    let activeRealtimeUnsubscribe = null;

    function showChatNotice(htmlMessage) {
      let noticeEl = document.getElementById('ccChatNoticeBox');
      if (!noticeEl) {
        noticeEl = document.createElement('div');
        noticeEl.id = 'ccChatNoticeBox';
        noticeEl.style.cssText = 'position:absolute;top:56px;left:12px;right:12px;background:rgba(20,24,33,0.96);border:1px solid rgba(196,163,90,0.5);color:#F8FAFC;padding:10px 14px;border-radius:12px;font-size:0.8rem;line-height:1.4;box-shadow:0 8px 24px rgba(0,0,0,0.6);z-index:99;display:flex;align-items:center;justify-content:space-between;gap:10px;animation:ccFadeIn 0.25s ease;';
        const bodyEl = document.getElementById('ccChatBody');
        if (bodyEl) bodyEl.appendChild(noticeEl);
      }
      noticeEl.innerHTML = `<span>${htmlMessage}</span><button type="button" style="background:none;border:none;color:#94A3B8;cursor:pointer;font-size:1.1rem;padding:0 4px;" aria-label="Zamknij powiadomienie">✕</button>`;
      noticeEl.style.display = 'flex';
      const closeNoticeBtn = noticeEl.querySelector('button');
      if (closeNoticeBtn) {
        closeNoticeBtn.onclick = () => { noticeEl.style.display = 'none'; };
      }
      setTimeout(() => {
        if (noticeEl) noticeEl.style.display = 'none';
      }, 7000);
    }

    // Zmiana aktywnego rozmówcy
    function setChatPartner(partner) {
      if (typeof activeRealtimeUnsubscribe === 'function') {
        try { activeRealtimeUnsubscribe(); } catch(e) {}
        activeRealtimeUnsubscribe = null;
      }
      currentPartnerRealtimeMessages = null;
      currentChatPartner = partner || COMMUNITY_MEMBERS[0];

      updateActivePartnerUI();

      // Ustawienie kontekstowego placeholdera
      if (chatInput) {
        const u = getUserState();
        if (currentChatPartner.isPublic) {
          chatInput.placeholder = 'Napisz na czacie ogólnym LUMINA...';
        } else if (u.isLoggedIn) {
          chatInput.placeholder = `Napisz prywatną wiadomość do: ${currentChatPartner.name}...`;
        } else {
          chatInput.placeholder = `Zaloguj się do LUMINA, aby pisać do: ${currentChatPartner.name}...`;
        }
      }

      // Podłączenie subskrypcji w czasie rzeczywistym z Firestore
      const user = getUserState();
      if (currentChatPartner.isPublic) {
        if (window.LuminaDB && typeof window.LuminaDB.subscribeToPublicChat === 'function') {
          try {
            activeRealtimeUnsubscribe = window.LuminaDB.subscribeToPublicChat(function (msgs) {
              if (currentChatPartner.isPublic && Array.isArray(msgs)) {
                currentPartnerRealtimeMessages = msgs;
                renderChatMessages();
                scrollToBottom();
              }
            });
          } catch(err) {
            console.warn('Lumina Public Chat sync:', err);
          }
        }
      } else {
        if (user.isLoggedIn && user.uid && window.LuminaDB && typeof window.LuminaDB.subscribeToDirectMessages === 'function') {
          const partnerId = currentChatPartner.slug || currentChatPartner.id;
          const myId = user.slug || user.uid;
          const chatId = (typeof window.LuminaDB.getChatId === 'function')
            ? window.LuminaDB.getChatId(myId, partnerId)
            : [myId, partnerId].sort().join('_');

          try {
            activeRealtimeUnsubscribe = window.LuminaDB.subscribeToDirectMessages(chatId, function (msgs) {
              if (!currentChatPartner.isPublic && Array.isArray(msgs)) {
                currentPartnerRealtimeMessages = msgs;
                renderChatMessages();
                scrollToBottom();
              }
            });
          } catch(err) {
            console.warn('Lumina Direct Chat sync:', err);
          }
        }
      }

      renderChatMessages();
      switchTab('live');
    }

    function updateActivePartnerUI() {
      const headerAvatar = document.getElementById('ccChatHeaderPartnerAvatar');
      const headerSub = document.getElementById('ccChatHeaderSubText');
      const activeName = document.getElementById('ccChatActiveName');
      const activeBadge = document.getElementById('ccChatActiveBadge');
      const activeProfileBtn = document.getElementById('ccChatActiveProfileBtn');
      const headerProfileLink = document.getElementById('ccChatHeaderProfileLink');

      if (headerAvatar) headerAvatar.src = currentChatPartner.avatar || '/images/chat/cc-chat-button-120.webp';
      if (headerSub) {
        headerSub.textContent = currentChatPartner.isPublic ? 'Czat Ogólny Społeczności' : `Rozmowa z: ${currentChatPartner.name}`;
      }
      if (activeName) activeName.textContent = currentChatPartner.name;
      if (activeBadge) activeBadge.textContent = currentChatPartner.badge;
      if (activeProfileBtn) {
        activeProfileBtn.href = currentChatPartner.profileUrl || '/lumina-tablica.html';
        activeProfileBtn.title = currentChatPartner.isPublic ? 'Otwórz Tablicę Społeczności LUMINA' : `Otwórz profil: ${currentChatPartner.name}`;
        activeProfileBtn.innerHTML = currentChatPartner.isPublic ? '<span>Tablica</span> 🕊️' : '<span>Profil</span> 👤';
      }
      if (headerProfileLink) {
        headerProfileLink.href = currentChatPartner.profileUrl || '/lumina-tablica.html';
        headerProfileLink.title = currentChatPartner.isPublic ? 'Otwórz Tablicę LUMINA' : `Otwórz profil: ${currentChatPartner.name}`;
      }

      renderPartnersBar();
    }

    // Renderowanie poziomego paska awatarów (pełny katalog ze swobodnym przewijaniem)
    function renderPartnersBar() {
      const bar = document.getElementById('ccChatPartnersBar');
      if (!bar) return;

      let html = '';
      COMMUNITY_MEMBERS.forEach(m => {
        const isActive = currentChatPartner.id === m.id;
        const shortName = m.isPublic ? 'Ogólny' : m.name.split(' ')[0];
        html += `
          <button type="button" class="cc-chat-partner-chip ${isActive ? 'is-active' : ''}" data-partner-id="${m.id}" title="${escapeHtml(m.name)} • ${escapeHtml(m.badge)} (kliknij, by rozmawiać)">
            <div class="cc-chat-partner-avatar-wrap">
              <img src="${escapeHtml(m.avatar)}" alt="${escapeHtml(m.name)}" class="cc-chat-partner-chip-img" onerror="this.src='/images/chat/cc-chat-button-120.webp'">
            </div>
            <span class="cc-chat-partner-chip-name">${escapeHtml(shortName)}</span>
          </button>
        `;
      });

      bar.innerHTML = html;

      // Obsługa kliknięć w czipy
      bar.querySelectorAll('.cc-chat-partner-chip[data-partner-id]').forEach(btnEl => {
        btnEl.addEventListener('click', function () {
          const pid = btnEl.getAttribute('data-partner-id');
          const p = COMMUNITY_MEMBERS.find(x => x.id === pid);
          if (p) setChatPartner(p);
        });
      });
    }

    // Renderowanie katalogu użytkowników (zakładka Społeczność — swobodny dostęp do profili i rozmów)
    function renderMembersList(query) {
      const list = document.getElementById('ccChatMembersList');
      if (!list) return;

      const filtered = COMMUNITY_MEMBERS.filter(m => {
        if (!query) return true;
        return m.name.toLowerCase().includes(query) || m.badge.toLowerCase().includes(query) || (m.desc && m.desc.toLowerCase().includes(query));
      });

      let html = '';
      filtered.forEach(m => {
        const profileUrl = m.profileUrl || '/lumina-tablica.html';
        const isPublicRoom = !!m.isPublic;
        html += `
          <div class="cc-chat-member-card" data-member-id="${m.id}">
            <div class="cc-chat-member-card-left">
              <a href="${escapeHtml(profileUrl)}" target="_blank" rel="noopener noreferrer" title="Otwórz profil: ${escapeHtml(m.name)}" style="display:inline-flex;text-decoration:none;" onclick="event.stopPropagation();">
                <img src="${escapeHtml(m.avatar)}" alt="${escapeHtml(m.name)}" class="cc-chat-member-avatar" onerror="this.src='/images/chat/cc-chat-button-120.webp'">
              </a>
              <div class="cc-chat-member-info">
                <div class="cc-chat-member-name-row">
                  <a href="${escapeHtml(profileUrl)}" target="_blank" rel="noopener noreferrer" class="cc-chat-member-name" title="Otwórz profil: ${escapeHtml(m.name)}" onclick="event.stopPropagation();" style="text-decoration:none;">${escapeHtml(m.name)}</a>
                  <span class="cc-chat-active-badge">${escapeHtml(m.badge)}</span>
                </div>
                <div class="cc-chat-member-desc">${escapeHtml(m.desc)}</div>
              </div>
            </div>
            <div class="cc-chat-member-actions">
              <a href="${escapeHtml(profileUrl)}" target="_blank" rel="noopener noreferrer" class="cc-chat-member-profile-btn" title="Otwórz profil: ${escapeHtml(m.name)}" onclick="event.stopPropagation();">
                <span>${isPublicRoom ? 'Tablica' : 'Profil'}</span> ${isPublicRoom ? '🕊️' : '👤'}
              </a>
              <button type="button" class="cc-chat-member-chat-btn" data-start-chat="${m.id}" aria-label="Rozpocznij rozmowę z ${escapeHtml(m.name)}">
                <span>Rozmawiaj</span> 💬
              </button>
            </div>
          </div>
        `;
      });

      list.innerHTML = html || `<div style="text-align:center;padding:24px;color:#94A3B8;font-size:0.82rem;">Nie znaleziono użytkownika dla zapytania "${escapeHtml(query)}"</div>`;

      list.querySelectorAll('.cc-chat-member-card, [data-start-chat]').forEach(el => {
        el.addEventListener('click', function (e) {
          // Jeśli kliknięto w link profilu, nie przechwytuj
          if (e.target.closest('a')) return;
          const mid = el.getAttribute('data-member-id') || el.getAttribute('data-start-chat');
          const member = COMMUNITY_MEMBERS.find(x => x.id === mid);
          if (member) setChatPartner(member);
        });
      });
    }

    function openChat() {
      if (!isCanonicalMessenger) {
        integrationReady.then(() => {
          if (window.CCUnifiedChat) window.CCUnifiedChat.open();
          else window.location.href = '/mess';
        });
        return;
      }
      // Jeśli jesteśmy na podstronie z natywnym modalem LUMINA i użytkownik nie jest w trybie gościa ukrywającego go:
      const nativeModal = document.getElementById('directMessagesModal');
      const isGuestBlocked = document.body && document.body.classList.contains('user-is-guest');

      if (nativeModal && !isGuestBlocked) {
        if (typeof window.openDirectMessagesModal === 'function') {
          window.openDirectMessagesModal('public');
          return;
        }
        if (typeof window.openLuminaChatModal === 'function') {
          window.openLuminaChatModal();
          return;
        }
        nativeModal.style.display = 'flex';
        nativeModal.classList.add('open');
        if (typeof window.switchMessengerMainTab === 'function') {
          window.switchMessengerMainTab('public');
        }
        return;
      }

      // Otwarcie zintegrowanego okna rozmowy live (domyślnie czat ogólny)
      if (typeof COMMUNITY_MEMBERS !== 'undefined' && COMMUNITY_MEMBERS.length > 0 && typeof setChatPartner === 'function') {
        setChatPartner(COMMUNITY_MEMBERS[0]);
      }
      updateActivePartnerUI();
      renderChatMessages();
      switchTab('live');
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      setTimeout(() => {
        scrollToBottom();
        if (chatInput && window.innerWidth > 768) {
          chatInput.focus();
        }
      }, 120);
    }

    function closeChat() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openChat();
      });
    }

    const luminaDockBtn = document.getElementById('luminaFloatingChatBtn');
    if (luminaDockBtn && !luminaDockBtn._ccGlobalChatBound) {
      luminaDockBtn._ccGlobalChatBound = true;
      luminaDockBtn.addEventListener('click', function (e) {
        const nativeModal = document.getElementById('directMessagesModal');
        const isGuestBlocked = document.body && document.body.classList.contains('user-is-guest');
        if (!nativeModal || isGuestBlocked) {
          e.preventDefault();
          e.stopPropagation();
          openChat();
        }
      });
    }

    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      closeChat();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeChat();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeChat();
      }
    });

    // Obsługa wysyłania wiadomości (Real Firestore Transport • Zero Symulacji)
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const text = (chatInput.value || '').trim();
      if (!text) return;

      const user = getUserState();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // WERYFIKACJA LOGOWANIA — brak symulacji dla gości w czacie 1:1
      if (!currentChatPartner.isPublic && (!user.isLoggedIn || !user.uid)) {
        showChatNotice(`Wiadomości prywatne do ${escapeHtml(currentChatPartner.name)} wymagają zalogowanego konta w portalu LUMINA. <a href="/lumina.html?action=login" target="_blank" style="color:#C4A35A;font-weight:bold;text-decoration:underline;">Zaloguj się tutaj 🕊️</a>`);
        return;
      }

      // WERYFIKACJA LOGOWANIA DLA CZATU PUBLICZNEGO
      if (currentChatPartner.isPublic && (!user.isLoggedIn || !user.uid)) {
        showChatNotice(`Wysyłanie na czacie ogólnym wymaga zalogowanego profilu w portalu LUMINA. <a href="/lumina.html?action=login" target="_blank" style="color:#C4A35A;font-weight:bold;text-decoration:underline;">Zaloguj się tutaj 🕊️</a>`);
        return;
      }

      // 1. CZAT OGÓLNY SPOŁECZNOŚCI
      if (currentChatPartner.isPublic) {
        if (window.LuminaDB && typeof window.LuminaDB.sendPublicChatMessage === 'function') {
          chatInput.value = '';
          window.LuminaDB.sendPublicChatMessage({
            text: text,
            senderName: user.name,
            senderAvatar: user.avatar,
            senderBadge: user.badge
          }).then(function () {
            if (!activeRealtimeUnsubscribe) {
              renderChatMessages();
              scrollToBottom();
            }
          }).catch(function (err) {
            console.warn('Błąd wysyłki wiadomości do Firestore:', err);
            showChatNotice('Nie udało się wysłać wiadomości na czat ogólny. Sprawdź połączenie.');
          });
        }
        return;
      }

      // 2. CZAT BEZPOŚREDNI 1:1 (LUMINA DIRECT CLOUD)
      const partnerId = currentChatPartner.slug || currentChatPartner.id;
      const myId = user.slug || user.uid;
      const chatId = (window.LuminaDB && typeof window.LuminaDB.getChatId === 'function')
        ? window.LuminaDB.getChatId(myId, partnerId)
        : [myId, partnerId].sort().join('_');

      const messageObj = {
        text: text,
        receiverId: partnerId,
        senderName: user.name,
        senderAvatar: user.avatar,
        senderBadge: user.badge,
        senderAuthUid: user.uid,
        senderId: myId,
        dateStr: timeStr,
        createdAt: Date.now()
      };

      chatInput.value = '';

      if (window.LuminaDB && typeof window.LuminaDB.sendDirectMessageToCloud === 'function') {
        window.LuminaDB.sendDirectMessageToCloud(chatId, messageObj).then(function () {
          if (!activeRealtimeUnsubscribe) {
            renderChatMessages();
            scrollToBottom();
          }
        }).catch(function (err) {
          console.warn('Błąd wysyłki wiadomości 1:1:', err);
          showChatNotice('Nie udało się doręczyć wiadomości prywatnej. Sprawdź połączenie.');
        });
      } else {
        showChatNotice('Baza danych LUMINA jest w tej chwili niedostępna.');
      }
    });

    // Uruchom synchronizację pozycji w pionie (unikanie kolizji z playerem)
    setupPositionSync(fabWrap);
  }

  // 6. Pobieranie wiadomości dla aktywnego rozmówcy
  function getChatMessagesForPartner(partner) {
    if (currentPartnerRealtimeMessages && Array.isArray(currentPartnerRealtimeMessages)) {
      return currentPartnerRealtimeMessages;
    }

    const user = getUserState();
    if (partner.isPublic) {
      try {
        const cached = localStorage.getItem('lumina_public_chat_cache');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return [];
    } else {
      if (!user.isLoggedIn || !user.uid) return [];
      try {
        const partnerId = partner.slug || partner.id;
        const myId = user.slug || user.uid;
        const chatId = (window.LuminaDB && typeof window.LuminaDB.getChatId === 'function')
          ? window.LuminaDB.getChatId(myId, partnerId)
          : [myId, partnerId].sort().join('_');
        const cached = localStorage.getItem('lumina_chat_' + chatId);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return [];
    }
  }

  function renderChatMedia(escapedText, msgId) {
    if (typeof window.renderChatMedia === 'function') {
      return window.renderChatMedia(escapedText, msgId);
    }
    if (!escapedText) return '';
    const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
    let firstYtId = null;

    const linkedHtml = escapedText.replace(urlRegex, function(matchedUrl) {
      let cleanUrl = matchedUrl;
      let trailingPunct = '';
      const punctMatch = matchedUrl.match(/[.,!?;:]+$/);
      if (punctMatch) {
        trailingPunct = punctMatch[0];
        cleanUrl = matchedUrl.slice(0, -trailingPunct.length);
      }

      if (!firstYtId) {
        const ytMatch = cleanUrl.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/\s"']+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
        if (ytMatch && ytMatch[1]) {
          firstYtId = ytMatch[1];
        }
      }

      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; text-decoration:underline; word-break:break-all;">${cleanUrl}</a>${trailingPunct}`;
    });

    if (!firstYtId) {
      const ytMatch = escapedText.match(/(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com\/(?:[^\/\s"']+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
      if (ytMatch && ytMatch[1]) {
        firstYtId = ytMatch[1];
      }
    }

    if (firstYtId && /^[a-zA-Z0-9_-]{11}$/.test(firstYtId)) {
      const cardId = 'yt_preview_' + (msgId ? String(msgId).replace(/[^a-zA-Z0-9_-]/g, '_') : Math.random().toString(36).slice(2, 9));
      const ytWatchUrl = 'https://www.youtube.com/watch?v=' + firstYtId;
      const ytThumb = 'https://i.ytimg.com/vi/' + firstYtId + '/hqdefault.jpg';
      const previewCard = `
        <div class="cc-chat-yt-card" id="${cardId}" style="margin-top:8px; border-radius:12px; overflow:hidden; border:1px solid rgba(212,175,55,0.35); background:#070A10; max-width:100%; box-shadow:0 4px 16px rgba(0,0,0,0.5);">
          <div class="cc-chat-yt-thumb-wrap" onclick="window.playChatYoutube('${cardId}', '${firstYtId}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window.playChatYoutube('${cardId}', '${firstYtId}');}" role="button" tabindex="0" aria-label="Odtwórz wideo YouTube" style="position:relative; aspect-ratio:16/9; width:100%; min-height:120px; cursor:pointer; background:#000; overflow:hidden; display:flex; align-items:center; justify-content:center;">
            <img src="${ytThumb}" alt="Miniatura wideo YouTube" loading="lazy" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.onerror=null; this.src='https://i.ytimg.com/vi/${firstYtId}/mqdefault.jpg';">
            <div style="position:absolute; inset:0; background:rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center;">
              <div style="width:48px; height:48px; min-width:48px; min-height:48px; border-radius:50%; background:rgba(220,38,38,0.92); border:2px solid #FFFFFF; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(0,0,0,0.7);">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#FFFFFF" style="margin-left:3px;"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <span style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.75); color:#F8FAFC; font-size:0.65rem; font-weight:700; padding:2px 8px; border-radius:6px; border:1px solid rgba(255,255,255,0.15);">YouTube</span>
          </div>
          <div style="padding:8px 10px; display:flex; align-items:center; justify-content:space-between; gap:8px; background:rgba(255,255,255,0.03);">
            <div style="display:flex; align-items:center; gap:6px; min-width:0; overflow:hidden;">
              <span style="color:#EF4444; font-size:0.75rem; font-weight:700;">▶ Wideo</span>
              <span style="color:#94A3B8; font-size:0.72rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Kliknij miniaturę, aby odtworzyć</span>
            </div>
            <a href="${ytWatchUrl}" target="_blank" rel="noopener noreferrer" style="color:#C4A35A; font-size:0.72rem; font-weight:700; text-decoration:none; white-space:nowrap; padding:6px 10px; border-radius:8px; background:rgba(196,163,90,0.12); border:1px solid rgba(196,163,90,0.3); min-height:44px; display:inline-flex; align-items:center;">
              YouTube ↗
            </a>
          </div>
        </div>
      `;
      return `${linkedHtml}${previewCard}`;
    }

    return linkedHtml;
  }

  if (typeof window.playChatYoutube !== 'function') {
    window.playChatYoutube = function(cardId, ytId) {
      if (!ytId || !/^[a-zA-Z0-9_-]{11}$/.test(ytId)) return;
      const card = document.getElementById(cardId);
      if (!card) return;
      const thumbWrap = card.querySelector('.cc-chat-yt-thumb-wrap');
      if (!thumbWrap) return;
      thumbWrap.outerHTML = `
        <div style="position:relative; width:100%; aspect-ratio:16/9; background:#000;">
          <iframe src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1"
            title="YouTube video player"
            style="position:absolute; top:0; left:0; width:100%; height:100%; border:none; display:block;"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen></iframe>
        </div>
      `;
    };
  }

  if (typeof window.shareChatMessage !== 'function') {
    window.shareChatMessage = function(triggerEl, senderParam, textParam) {
      let sender = senderParam;
      let text = textParam;
      if (triggerEl && typeof triggerEl.getAttribute === 'function') {
        sender = triggerEl.getAttribute('data-share-sender') || sender || 'Użytkownik';
        text = triggerEl.getAttribute('data-share-text') || text || '';
      }
      sender = String(sender || 'Użytkownik').trim();
      text = String(text || '').trim();
      if (!text) {
        if (typeof showToast === 'function') showToast('Ta wiadomość jest pusta.');
        return;
      }

      const shareUrl = 'https://polskieradio.cc/mess';
      const shareText = `„${text}” — ${sender} • Czat Christian Culture & LUMINA\n${shareUrl}`;

      const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
      if (isMobile && typeof navigator.share === 'function') {
        navigator.share({
          title: `Wiadomość od ${sender} • Christian Culture`,
          text: shareText,
          url: shareUrl
        }).catch(err => {
          if (err && err.name === 'AbortError') return;
          window.openShareMessageModal(sender, text, shareUrl, shareText);
        });
        return;
      }

      window.openShareMessageModal(sender, text, shareUrl, shareText);
    };
  }

  if (typeof window.openShareMessageModal !== 'function') {
    window.openShareMessageModal = function(sender, text, shareUrl, shareText) {
      let modal = document.getElementById('ccShareMessageModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ccShareMessageModal';
        modal.className = 'lumina-modal cc-share-modal';
        modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.78); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); z-index:9999999; display:flex; align-items:center; justify-content:center; padding:16px; opacity:0; pointer-events:none; transition:opacity 0.2s ease;';
        document.body.appendChild(modal);
      }

      const previewQuote = (text.length > 180 ? text.slice(0, 180) + '…' : text);
      const encText = encodeURIComponent(shareText);
      const encUrl = encodeURIComponent(shareUrl);
      const encQuote = encodeURIComponent(`„${text}” — ${sender}`);

      const whatsappUrl = `https://api.whatsapp.com/send?text=${encText}`;
      const telegramUrl = `https://t.me/share/url?url=${encUrl}&text=${encodeURIComponent('„' + text + '” — ' + sender)}`;
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encUrl}&quote=${encQuote}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('„' + (text.length > 180 ? text.slice(0, 180) + '…' : text) + '” — ' + sender)}&url=${encUrl}`;

      modal.innerHTML = `
        <div class="modal-card" style="background:#0F172A; border:1px solid rgba(196,163,90,0.5); border-radius:20px; max-width:440px; width:100%; padding:20px; box-shadow:0 20px 50px rgba(0,0,0,0.85); color:#F8FAFC; position:relative; max-height:90vh; overflow-y:auto; font-family:system-ui, -apple-system, sans-serif;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.3rem;">🕊️</span>
              <h3 style="margin:0; font-size:1.05rem; font-weight:800; color:#F8FAFC; letter-spacing:0.2px;">Prześlij wiadomość dalej</h3>
            </div>
            <button type="button" onclick="window.closeShareMessageModal()" style="background:rgba(255,255,255,0.08); border:none; color:#94A3B8; width:44px; height:44px; border-radius:50%; font-size:1.1rem; cursor:pointer; display:flex; align-items:center; justify-content:center;" aria-label="Zamknij okno udostępniania">✕</button>
          </div>
          
          <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; margin-bottom:16px;">
            <div style="font-size:0.75rem; font-weight:700; color:#C4A35A; margin-bottom:4px;">${escapeHtml(sender)}:</div>
            <div style="font-size:0.86rem; line-height:1.45; color:#E2E8F0; word-break:break-word; max-height:120px; overflow-y:auto;">„${escapeHtml(previewQuote)}”</div>
          </div>

          <div style="display:flex; flex-direction:column; gap:9px; margin-bottom:14px;">
            <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" style="display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:12px; background:rgba(37,211,102,0.14); border:1px solid rgba(37,211,102,0.4); color:#4ADE80; font-weight:700; font-size:0.88rem; text-decoration:none; min-height:44px;">
              <span style="font-size:1.2rem;">🟢</span>
              <span>Udostępnij na WhatsApp</span>
              <span style="margin-left:auto; opacity:0.7;">↗</span>
            </a>
            <a href="${telegramUrl}" target="_blank" rel="noopener noreferrer" style="display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:12px; background:rgba(42,171,238,0.14); border:1px solid rgba(42,171,238,0.4); color:#38BDF8; font-weight:700; font-size:0.88rem; text-decoration:none; min-height:44px;">
              <span style="font-size:1.2rem;">✈️</span>
              <span>Udostępnij na Telegram</span>
              <span style="margin-left:auto; opacity:0.7;">↗</span>
            </a>
            <a href="${fbUrl}" target="_blank" rel="noopener noreferrer" style="display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:12px; background:rgba(24,119,242,0.14); border:1px solid rgba(24,119,242,0.4); color:#60A5FA; font-weight:700; font-size:0.88rem; text-decoration:none; min-height:44px;">
              <span style="font-size:1.2rem;">👥</span>
              <span>Udostępnij na Facebook</span>
              <span style="margin-left:auto; opacity:0.7;">↗</span>
            </a>
            <a href="${twitterUrl}" target="_blank" rel="noopener noreferrer" style="display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#F8FAFC; font-weight:700; font-size:0.88rem; text-decoration:none; min-height:44px;">
              <span style="font-size:1.2rem;">𝕏</span>
              <span>Udostępnij na X (Twitter)</span>
              <span style="margin-left:auto; opacity:0.7;">↗</span>
            </a>
            <button type="button" id="ccGlobalChatCopyBtn" style="display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:12px; background:linear-gradient(135deg, rgba(196,163,90,0.18), rgba(212,175,55,0.1)); border:1px solid rgba(196,163,90,0.4); color:#FDE047; font-weight:700; font-size:0.88rem; cursor:pointer; min-height:44px; text-align:left; width:100%;">
              <span style="font-size:1.2rem;">📋</span>
              <span id="btnCopyChatMsgText">Kopiuj treść z linkiem</span>
              <span style="margin-left:auto; font-size:0.75rem; opacity:0.8;">Kliknij</span>
            </button>
          </div>

          <button type="button" onclick="window.closeShareMessageModal()" style="width:100%; padding:10px; border-radius:10px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:#94A3B8; font-weight:600; font-size:0.82rem; cursor:pointer; min-height:44px;">
            Zamknij
          </button>
        </div>
      `;

      const copyBtn = modal.querySelector('#ccGlobalChatCopyBtn');
      if (copyBtn) {
        copyBtn.onclick = function() {
          window.copyChatMessageContent(shareText);
        };
      }

      modal.style.opacity = '1';
      modal.style.pointerEvents = 'auto';
    };
  }

  if (typeof window.closeShareMessageModal !== 'function') {
    window.closeShareMessageModal = function() {
      const modal = document.getElementById('ccShareMessageModal');
      if (modal) {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
      }
    };
  }

  if (typeof window.copyChatMessageContent !== 'function') {
    window.copyChatMessageContent = async function(textToCopy) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          const ta = document.createElement('textarea');
          ta.value = textToCopy;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        const lbl = document.getElementById('btnCopyChatMsgText');
        if (lbl) lbl.textContent = '✅ Skopiowano do schowka!';
        if (typeof showToast === 'function') showToast('✨ Treść wiadomości skopiowana do schowka!');
        setTimeout(() => {
          if (lbl) lbl.textContent = 'Kopiuj treść z linkiem';
        }, 2500);
      } catch (err) {
        console.warn('Copy error:', err);
        if (typeof showToast === 'function') showToast('Nie udało się skopiować.');
      }
    };
  }

  function renderChatMessages() {
    const list = document.getElementById('ccChatMessagesList');
    if (!list) return;

    const msgs = getChatMessagesForPartner(currentChatPartner);
    const user = getUserState();

    if (!msgs || msgs.length === 0) {
      if (currentChatPartner.isPublic) {
        list.innerHTML = `
          <div class="cc-chat-empty-state" style="text-align:center;padding:36px 16px;color:#94A3B8;">
            <div style="font-size:2.2rem;margin-bottom:8px;">🕊️</div>
            <div style="font-weight:700;color:#F8FAFC;font-size:0.95rem;margin-bottom:6px;">Czat Ogólny Społeczności LUMINA</div>
            <p style="font-size:0.82rem;line-height:1.45;max-width:320px;margin:0 auto;color:#94A3B8;">
              Wspólnota wiary, modlitwy i dialogu. Podziel się świadectwem, zadaj pytanie lub dołącz do rozmowy!
            </p>
            ${!user.isLoggedIn ? `
              <div style="margin-top:16px;">
                <a href="/lumina.html?action=login" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:8px 18px;border-radius:999px;background:linear-gradient(135deg,#C4A35A,#9A7B38);color:#0A0E17;font-weight:700;font-size:0.8rem;text-decoration:none;box-shadow:0 4px 12px rgba(196,163,90,0.3);">
                  Zaloguj się do LUMINA 🕊️
                </a>
              </div>
            ` : ''}
          </div>
        `;
      } else {
        list.innerHTML = `
          <div class="cc-chat-empty-state" style="text-align:center;padding:32px 16px;color:#94A3B8;">
            <img src="${escapeHtml(currentChatPartner.avatar || '/images/chat/cc-chat-button-120.webp')}" alt="${escapeHtml(currentChatPartner.name)}" style="width:64px;height:64px;border-radius:50%;margin:0 auto 10px;display:block;border:2px solid rgba(196,163,90,0.5);object-fit:cover;box-shadow:0 4px 14px rgba(0,0,0,0.4);" onerror="this.src='/images/chat/cc-chat-button-120.webp'">
            <div style="font-weight:700;color:#F8FAFC;font-size:0.98rem;margin-bottom:4px;">${escapeHtml(currentChatPartner.name)}</div>
            <div style="display:inline-block;font-size:0.75rem;color:#C4A35A;background:rgba(196,163,90,0.12);border:1px solid rgba(196,163,90,0.3);padding:2px 10px;border-radius:999px;margin-bottom:10px;">${escapeHtml(currentChatPartner.badge)}</div>
            <p style="font-size:0.82rem;line-height:1.45;max-width:300px;margin:0 auto;color:#94A3B8;">
              ${user.isLoggedIn
                ? 'Rozpocznij bezpośrednią rozmowę. Wiadomości trafiają prosto do skrzynki profilu.'
                : 'Bezpośrednie wiadomości 1:1 wymagają zalogowanego profilu w portalu LUMINA.'}
            </p>
            ${!user.isLoggedIn ? `
              <div style="margin-top:14px;">
                <a href="/lumina.html?action=login" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:8px 18px;border-radius:999px;background:linear-gradient(135deg,#C4A35A,#9A7B38);color:#0A0E17;font-weight:700;font-size:0.8rem;text-decoration:none;box-shadow:0 4px 12px rgba(196,163,90,0.3);">
                  Zaloguj się, aby rozmawiać 🕊️
                </a>
              </div>
            ` : ''}
          </div>
        `;
      }
      return;
    }

    let html = '';
    msgs.forEach(m => {
      // Rozróżnienie wiadomości własnych od rozmówcy
      const isMe = m.isMe || (user.uid && (m.senderAuthUid === user.uid || m.senderUid === user.uid)) || (user.slug && m.senderId === user.slug);
      const name = escapeHtml(m.senderName || (isMe ? user.name : currentChatPartner.name));
      const avatar = escapeHtml(m.senderAvatar || (isMe ? user.avatar : currentChatPartner.avatar) || '/images/chat/cc-chat-button-120.webp');
      const badge = escapeHtml(m.senderBadge || (isMe ? user.badge : currentChatPartner.badge) || '🕊️ CC');

      let time = escapeHtml(m.dateStr || '');
      if (!time && m.timestamp) {
        const sec = m.timestamp.seconds || (typeof m.timestamp === 'number' ? (m.timestamp > 1e11 ? m.timestamp / 1000 : m.timestamp) : null);
        if (sec) {
          time = new Date(sec * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      } else if (!time && m.createdAt) {
        time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      const text = escapeHtml(m.text || '');

      // Odnalezienie profilu nadawcy
      const partnerObj = COMMUNITY_MEMBERS.find(c => c.id === m.senderId || c.slug === m.senderId);
      const profileLink = partnerObj ? partnerObj.profileUrl : (isMe ? '/lumina-tablica.html' : currentChatPartner.profileUrl || '/lumina-tablica.html');

      html += `
        <div class="cc-chat-msg-row ${isMe ? 'is-me' : ''}">
          <a href="${escapeHtml(profileLink)}" target="_blank" rel="noopener noreferrer" title="Otwórz profil: ${name}" style="display:inline-flex;text-decoration:none;">
            <img src="${avatar}" alt="${name}" class="cc-chat-msg-avatar" onerror="this.src='/images/chat/cc-chat-button-120.webp'">
          </a>
          <div class="cc-chat-msg-content">
            <div class="cc-chat-msg-meta">
              <a href="${escapeHtml(profileLink)}" target="_blank" rel="noopener noreferrer" class="cc-chat-msg-sender" title="Otwórz profil: ${name}" style="text-decoration:none;">${name}</a>
              <span class="cc-chat-msg-badge">${badge}</span>
              ${time ? `<span style="opacity: 0.7;">${time}</span>` : ''}
            </div>
            <div class="cc-chat-msg-bubble">
              ${renderChatMedia(text, m.id)}
              <div style="display:flex; justify-content:flex-end; align-items:center; margin-top:4px;">
                <button type="button" class="cc-chat-share-btn" onclick="window.shareChatMessage(this)" data-share-sender="${name}" data-share-text="${text}" style="background:transparent; border:none; box-shadow:none; color:rgba(255,255,255,0.7); cursor:pointer; width:44px; height:44px; min-width:44px; min-height:44px; padding:0; display:inline-flex; align-items:center; justify-content:center;" title="Udostępnij tę wiadomość" aria-label="Udostępnij wiadomość">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
  }

  // 7. Dynamiczne pozycjonowanie FAB (wyrównanie z przyciskiem play i ochrona przed nakładaniem na paski)
  function setupPositionSync(fabWrap) {
    function adjust() {
      const isMobile = window.innerWidth <= 768;
      let bottomOffset = isMobile ? 14 : 18;
      let playerCenterFromBottom = null;
      let detectedBarTopFromBottom = 0;

      // 1. Sprawdzenie przycisku play w dolnym odtwarzaczu (#playBtn lub .play-btn)
      const playBtn = document.getElementById('playBtn') || document.querySelector('.play-btn');
      if (playBtn) {
        const pRect = playBtn.getBoundingClientRect();
        if (pRect.height > 0 && pRect.top < window.innerHeight && pRect.bottom > window.innerHeight - 200) {
          const playCenterY = pRect.top + (pRect.height / 2);
          playerCenterFromBottom = window.innerHeight - playCenterY;
        }
      }

      // 2. Wykrywanie dolnych belek (pasek radia, audio bar, dolna nawigacja)
      const candidates = [
        '#radioPlayerBar',
        '.radio-player-bar',
        '#globalAudioBar',
        '.radio-bar',
        '.player-bottom-bar',
        '.lumina-mobile-nav',
        '.bottom-nav-container',
        '#mapaBottomVerseBar',
        '.player-sticky-controls'
      ];

      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.height > 0 && rect.top < window.innerHeight && rect.bottom >= window.innerHeight - 10) {
            const barHeight = Math.round(window.innerHeight - rect.top);
            detectedBarTopFromBottom = Math.max(detectedBarTopFromBottom, barHeight);
            bottomOffset = Math.max(bottomOffset, barHeight + (isMobile ? 10 : 14));
          }
        }
      }

      // 3. Pozycjonowanie ikony czatu:
      // Jeśli wykryto przycisk play — wyrównaj idealnie oś poziomą (dokładnie ta sama wysokość co playBtn)
      const fabBtn = fabWrap.querySelector('.cc-chat-fab-btn') || fabWrap;
      const fabH = fabBtn.offsetHeight || (isMobile ? 50 : 50);

      if (playerCenterFromBottom !== null) {
        const alignedBottom = Math.round(playerCenterFromBottom - (fabH / 2));
        fabWrap.style.bottom = `${alignedBottom}px`;
      } else {
        fabWrap.style.bottom = `${bottomOffset}px`;
      }

      // 4. Bezpieczne pozycjonowanie przycisku "do góry" (#backToTopBtn) — ZAWSZE w całości nad dolnym paskiem!
      const btt = document.getElementById('backToTopBtn');
      if (btt) {
        let bttBottom = 0;
        if (detectedBarTopFromBottom > 0) {
          // Dolny pasek radia/audio jest obecny — umieść przycisk bezpiecznie 16px nad górną krawędzią paska
          bttBottom = detectedBarTopFromBottom + 16;
        } else {
          // Brak paska — umieść przycisk nad ikoną czatu
          bttBottom = bottomOffset + (isMobile ? 64 : 70);
        }
        btt.style.setProperty('bottom', `${bttBottom}px`, 'important');
      }
    }

    window.addEventListener('resize', adjust, { passive: true });
    window.addEventListener('scroll', adjust, { passive: true });
    setTimeout(adjust, 100);
    setTimeout(adjust, 300);
    setTimeout(adjust, 1000);
  }

  // 8. Automatyczna inicjalizacja po załadowaniu DOM
  function init() {
    injectStyles();
    mountComponent();
    window.dispatchEvent(new window.CustomEvent('cc-global-chat-ready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Eksport globalnego API
  window.CCGlobalChat = {
    open: function (targetTab, targetPartnerId) {
      if (targetTab === 'assistant' || targetPartnerId === 'cc-assistant') {
        if (window.CCAssistant?.open) {
          window.CCAssistant.open({ source: 'global_chat' });
          return;
        }
        if (!isCanonicalMessenger) {
          integrationReady.then(() => {
            if (window.CCUnifiedChat) window.CCUnifiedChat.open({ tab: 'assistant', partner: 'cc-assistant' });
            else window.location.href = '/mess?assistant=cc';
          });
          return;
        }
      }
      if (!isCanonicalMessenger) {
        integrationReady.then(() => {
          if (window.CCUnifiedChat) window.CCUnifiedChat.open({ tab: targetTab === 'members' ? 'private' : 'public', partner: targetPartnerId });
          else window.location.href = '/mess';
        });
        return;
      }
      const btn = document.getElementById('ccChatFabBtn') || document.getElementById('luminaFloatingChatBtn');
      if (btn) btn.click();
      else if (typeof openChat === 'function') openChat();
      if (targetPartnerId) {
        const p = COMMUNITY_MEMBERS.find(x => x.id === targetPartnerId || x.slug === targetPartnerId);
        if (p) {
          const partnerBtn = document.querySelector(`[data-partner-id="${p.id}"]`);
          if (partnerBtn) partnerBtn.click();
        }
      } else if (targetTab) {
        const tabMap = {
          live: 'ccChatTabLiveBtn',
          members: 'ccChatTabMembersBtn',
          channels: 'ccChatTabChannelsBtn'
        };
        const tabBtn = document.getElementById(tabMap[targetTab]);
        if (tabBtn) tabBtn.click();
      }
    },
    close: function () {
      const closeBtn = document.getElementById('ccChatCloseBtn');
      if (closeBtn) closeBtn.click();
    },
    getMembers: function () {
      return [...COMMUNITY_MEMBERS];
    }
  };

})();
