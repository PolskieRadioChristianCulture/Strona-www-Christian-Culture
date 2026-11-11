/**
 * ══════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE & LUMINA — LUMI MESSENGER PREMIUM UI 2.0
 * Plik: /components/cc-global-chat-button.js
 * 
 * Standard wdrożenia LUMI MESSENGER PREMIUM UI 2.0:
 * - Design System: Paleta kolorystyczna #0D1020, #15192B, #1D2235, #8547D8, #D8AD57
 * - Typografia: Inter / system-ui, czytelna hierarchia, min. 44x44px touch targets
 * - Architektura 6 stref:
 *   1. Nagłówek LUMI Messenger ✨ (Na żywo w Chrystusie, logo, notyfikacje, ustawienia, zamknij)
 *   2. Kompaktowy odtwarzacz Radio Christian Culture PL (visualizer, ▶ Słuchaj w złocie CC)
 *   3. 5 Zakładek nawigacji: 💬 Czat | 👥 Zespół CC | 👥 Społeczność | 🌐 Zasoby | ••• Więcej
 *   4. Panel Asystentek Christian Culture (Lea, Rut, Noemi, wirtualne gospodynie, pigułki szybkich akcji)
 *   5. Obszar konwersacji i rekomendacji (Rut · Asystentka CC, powitanie, 3 karty akcji, feed)
 *   6. Stałe pole wpisywania wiadomości ([+] [Zadaj pytanie...] [🎙] [✈ Wyślij w złocie])
 * - Zasada: ZERO COST, deterministic offline/online intelligence, brak regresji.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // 1. Zabezpieczenie przed wielokrotną inicjalizacją
  if (window.CCGlobalChatButton) return;
  window.CCGlobalChatButton = true;

  const isCanonicalMessenger = /^\/mess(?:\/|\.html)?$/.test(window.location.pathname);
  let integrationReady = Promise.resolve();
  if (!window.CCUnifiedChat && !document.getElementById('ccChatIntegrationScript')) {
    integrationReady = new Promise(resolve => {
      const integration = document.createElement('script');
      integration.id = 'ccChatIntegrationScript';
      integration.src = '/js/cc-chat-integration.js?v=20261110_asst4';
      integration.onload = resolve;
      integration.onerror = resolve;
      document.head.appendChild(integration);
    });
  }

  // ── ROTACJA 3 ASYSTENTEK LUMI MESS Z DEDYKOWANYMI AWATARAMI I ZACZEPKĄ ──
  const ROTATING_ASSISTANTS = [
    {
      id: 'asystentka-1',
      name: 'Rut · Asystentka CC',
      shortName: 'Rut',
      role: 'Wspieram Cię i pomagam',
      badge: 'Gospodyni LUMI MESS',
      avatar: '/images/chat/assistants/asystentka-1.webp',
      circleAvatar: '/images/chat/assistants/asystentka-1.webp',
      avatarFallback: '/images/chat/assistants/asystentka-1.jpg',
      greeting: 'Cześć! ❤️ W czym mogę Ci dzisiaj pomóc w ekosystemie Christian Culture?',
      welcomeText: 'Cześć! ❤️ Dobrze, że jesteś.\n\nNazywam się Rut – jestem Asystentką Christian Culture i gospodynią LUMI MESS.\n\nPrzez całą dobę pomogę Ci znaleźć radio 24/7, Biblię, kursy, filmy VOD, społeczność LUMINA lub kontakt z zespołem.\n\nW czym mogę Ci dziś pomóc?'
    },
    {
      id: 'asystentka-2',
      name: 'Lea · Przewodnik CC',
      shortName: 'Lea',
      role: 'Organizer i planista',
      badge: 'Przewodnik Ekosystemu',
      avatar: '/images/chat/assistants/asystentka-2.webp',
      circleAvatar: '/images/chat/assistants/asystentka-2.webp',
      avatarFallback: '/images/chat/assistants/asystentka-2.jpg',
      greeting: 'Szukasz rozważań, audycji czy kursu? Pomogę Ci to szybko znaleźć!',
      welcomeText: 'Witaj serdecznie! 🌟 Nazywam się Lea — jestem Asystentką Christian Culture, organizerem i planistą.\n\nZ przyjemnością wskażę Ci plan dnia, audycje radiowe, Akademię Biblijną czy najnowsze filmy VOD.\n\nO co chciałbyś zapytać?'
    },
    {
      id: 'asystentka-3',
      name: 'Noemi · Doradca CC',
      shortName: 'Noemi',
      role: 'Twoje zasoby i rozwiązania',
      badge: 'Doradca LUMINA',
      avatar: '/images/chat/assistants/asystentka-3.webp',
      circleAvatar: '/images/chat/assistants/asystentka-3.webp',
      avatarFallback: '/images/chat/assistants/asystentka-3.jpg',
      greeting: 'Masz pytanie o radio, Biblię lub pomoc? Jestem tu dla Ciebie!',
      welcomeText: 'Pokój Boży! ✨ Nazywam się Noemi — jestem Asystentką Christian Culture i doradcą społeczności LUMINA.\n\nPomogę Ci w korzystaniu z interlinearnej Biblii, słuchowisk Biblia Audio i bezpośrednim kontakcie ze Sztabem CC.\n\nW czym mogę Ci służyć?'
    }
  ];

  function getActiveAssistant() {
    try {
      const storedId = sessionStorage.getItem('cc_active_assistant_id');
      if (storedId) {
        const found = ROTATING_ASSISTANTS.find(a => a.id === storedId);
        if (found) return found;
      }
      const storedIdx = parseInt(sessionStorage.getItem('cc_asst_rot_idx') || '', 10);
      if (!Number.isNaN(storedIdx) && ROTATING_ASSISTANTS[storedIdx]) {
        return ROTATING_ASSISTANTS[storedIdx];
      }
      const defaultAsst = ROTATING_ASSISTANTS[0]; // Domyślnie Rut
      sessionStorage.setItem('cc_asst_rot_idx', '0');
      sessionStorage.setItem('cc_active_assistant_id', defaultAsst.id);
      return defaultAsst;
    } catch (_) {
      return ROTATING_ASSISTANTS[0];
    }
  }

  function setActiveAssistantById(id) {
    const found = ROTATING_ASSISTANTS.find(a => a.id === id || a.shortName.toLowerCase() === String(id).toLowerCase());
    if (found) {
      try {
        sessionStorage.setItem('cc_active_assistant_id', found.id);
        const idx = ROTATING_ASSISTANTS.indexOf(found);
        sessionStorage.setItem('cc_asst_rot_idx', String(idx));
      } catch (_) {}
      return found;
    }
    return getActiveAssistant();
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


  // Stan lokalny i użytkownika
  let currentChatPartner = COMMUNITY_MEMBERS[0];
  let currentPartnerRealtimeMessages = null;
  let assistantConversationHistory = [];
  let isShowcaseCollapsed = false;

  function scrollToBottom() {
    const feed = document.getElementById('ccChatFeed');
    if (!feed) return;
    const msgList = document.getElementById('ccChatMessagesList');
    const msgRows = msgList ? msgList.querySelectorAll('.cc-chat-msg-row') : [];
    if (msgRows.length === 0) {
      feed.scrollTop = 0;
      return;
    }
    feed.scrollTop = feed.scrollHeight;
  }

  function getUserState() {
    try {
      if (window.LuminaDB && typeof window.LuminaDB.getCurrentUser === 'function') {
        const u = window.LuminaDB.getCurrentUser();
        if (u && !u.isAnonymous) {
          return {
            isLoggedIn: true,
            name: u.displayName || u.name || 'Użytkownik LUMINA',
            avatar: u.photoURL || u.avatar || '/images/chat/cc-chat-button-120.webp',
            uid: u.uid,
            slug: u.slug || u.uid,
            badge: u.badge || '🕊️ Członek LUMINA'
          };
        }
      }
    } catch (e) {}

    try {
      const rawUser = localStorage.getItem('lumina_current_user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed && parsed.uid) {
          return {
            isLoggedIn: true,
            name: parsed.name || parsed.displayName || 'Użytkownik LUMINA',
            avatar: parsed.avatar || parsed.photoURL || '/images/chat/cc-chat-button-120.webp',
            uid: parsed.uid,
            slug: parsed.slug || parsed.uid,
            badge: parsed.badge || '🕊️ Członek LUMINA'
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

  // 3. Wstrzykiwanie stylów LUMI MESSENGER PREMIUM UI 2.0
  function injectStyles() {
    if (document.getElementById('ccLumiPremiumChatStyles')) return;
    const style = document.createElement('style');
    style.id = 'ccLumiPremiumChatStyles';
    style.textContent = `
      /* ══════════════════════════════════════════════════════════════════
         LUMI MESSENGER PREMIUM UI 2.0 — DESIGN SYSTEM SPECIFICATION
         ══════════════════════════════════════════════════════════════════ */
      :root {
        --lumi-bg-main: #0D1020;
        --lumi-bg-panel: #15192B;
        --lumi-card-surface: #1D2235;
        --lumi-accent: #8547D8;
        --lumi-accent-light: #B475F5;
        --lumi-gold: #D8AD57;
        --lumi-gold-light: #F2D17C;
        --lumi-text-main: #F7F8FC;
        --lumi-text-muted: #A5AEC4;
        --lumi-status-online: #20C997;
        --lumi-border: #343A50;
        --lumi-danger: #EF6474;
      }

      /* ── FAB BUTTON & TEASER (NEON W SZKLE) ── */
      .cc-chat-fab-wrap {
        position: fixed !important;
        right: max(18px, env(safe-area-inset-right)) !important;
        bottom: max(25px, env(safe-area-inset-bottom)) !important;
        z-index: 10000 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        pointer-events: auto !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        -webkit-tap-highlight-color: transparent !important;
        transition: bottom 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      html[data-lumina-theme] .cc-chat-fab-wrap,
      body.theme-lumina-light .cc-chat-fab-wrap,
      body.lumina-page .cc-chat-fab-wrap,
      body:has(#luminaThemeSwitchBtn) .cc-chat-fab-wrap,
      body:has(#luminaScrollTop) .cc-chat-fab-wrap,
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
        transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.22s ease !important;
        filter: drop-shadow(0 8px 22px rgba(133, 71, 216, 0.45)) drop-shadow(0 3px 10px rgba(0, 0, 0, 0.6)) !important;
      }

      .cc-chat-fab-btn:hover {
        transform: scale(1.08) translateY(-2px) !important;
        filter: drop-shadow(0 12px 28px rgba(180, 117, 245, 0.65)) drop-shadow(0 4px 14px rgba(216, 173, 87, 0.45)) !important;
      }

      .cc-chat-fab-btn:focus-visible {
        outline: 3px solid var(--lumi-gold) !important;
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

      .cc-chat-fab-badge {
        position: absolute !important;
        top: 2px !important;
        right: 2px !important;
        width: 13px !important;
        height: 13px !important;
        border-radius: 50% !important;
        background: var(--lumi-status-online) !important;
        border: 2px solid var(--lumi-bg-main) !important;
        box-shadow: 0 0 8px var(--lumi-status-online) !important;
        pointer-events: none !important;
      }

      .cc-chat-fab-tooltip {
        display: none !important;
      }

      /* ── DYMEK ZACZEPKA: ROTACJA ASYSTENTEK ── */
      .cc-chat-teaser-bubble {
        position: absolute !important;
        bottom: calc(100% + 14px) !important;
        right: 0 !important;
        width: 290px !important;
        max-width: calc(100vw - 36px) !important;
        background: linear-gradient(145deg, rgba(21, 25, 43, 0.98), rgba(13, 16, 32, 0.98)) !important;
        border: 1px solid var(--lumi-border) !important;
        border-radius: 20px !important;
        padding: 12px 14px !important;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(133, 71, 216, 0.25) !important;
        backdrop-filter: blur(14px) !important;
        -webkit-backdrop-filter: blur(14px) !important;
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        cursor: pointer !important;
        color: var(--lumi-text-main) !important;
        font-family: inherit !important;
        z-index: 10001 !important;
        transition: opacity 0.25s ease, transform 0.25s ease !important;
      }

      .cc-chat-teaser-bubble:hover {
        border-color: var(--lumi-gold) !important;
        transform: translateY(-2px) !important;
      }

      .cc-chat-teaser-avatar-wrap {
        position: relative !important;
        width: 44px !important;
        height: 44px !important;
        min-width: 44px !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-teaser-avatar {
        width: 100% !important;
        height: 100% !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        object-position: center top !important;
        border: 2px solid var(--lumi-gold) !important;
        background: #15192B !important;
      }

      .cc-chat-teaser-online {
        position: absolute !important;
        right: -1px !important;
        bottom: -1px !important;
        width: 11px !important;
        height: 11px !important;
        background: var(--lumi-status-online) !important;
        border: 2px solid var(--lumi-bg-panel) !important;
        border-radius: 50% !important;
      }

      .cc-chat-teaser-content {
        display: flex !important;
        flex-direction: column !important;
        gap: 2px !important;
        flex: 1 !important;
        line-height: 1.3 !important;
      }

      .cc-chat-teaser-name {
        font-size: 0.82rem !important;
        font-weight: 700 !important;
        color: var(--lumi-text-main) !important;
      }

      .cc-chat-teaser-msg {
        font-size: 0.76rem !important;
        color: var(--lumi-text-muted) !important;
      }

      .cc-chat-teaser-cta {
        font-size: 0.72rem !important;
        color: var(--lumi-gold-light) !important;
        font-weight: 600 !important;
        margin-top: 2px !important;
      }

      .cc-chat-teaser-close {
        position: absolute !important;
        top: 6px !important;
        right: 8px !important;
        background: none !important;
        border: none !important;
        color: var(--lumi-text-muted) !important;
        font-size: 13px !important;
        cursor: pointer !important;
        padding: 4px !important;
        line-height: 1 !important;
      }

      /* ── OKNO GŁÓWNE CZATU LUMI MESSENGER 2.0 (PREMIUM 1:1 FIDELITY) ── */
      .cc-chat-drawer-overlay {
        position: fixed !important;
        inset: 0 !important;
        background: rgba(4, 6, 14, 0.72) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
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
        right: max(20px, env(safe-area-inset-right)) !important;
        bottom: max(20px, env(safe-area-inset-bottom)) !important;
        width: 480px !important;
        max-width: calc(100vw - 32px) !important;
        height: 860px !important;
        max-height: calc(100vh - 40px) !important;
        background: #0D1020 !important;
        border: 1px solid #343A50 !important;
        border-radius: 24px !important;
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.9), 0 0 35px rgba(133, 71, 216, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.08) !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        transform: translateY(20px) scale(0.97) !important;
        opacity: 0 !important;
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        color: #F7F8FC !important;
      }

      .cc-chat-drawer-overlay.is-open .cc-chat-drawer {
        transform: translateY(0) scale(1) !important;
        opacity: 1 !important;
      }

      /* ── 1. NAGŁÓWEK LUMI MESSENGER ── */
      #ccGlobalChatOverlay .cc-chat-radio,
      .cc-chat-drawer .cc-chat-radio,
      .cc-chat-header .cc-chat-radio {
        display: none !important;
      }
      .cc-chat-header {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 10px 14px 8px 14px !important;
        background: #0D1020 !important;
        border-bottom: none !important;
        min-height: 58px !important;
        box-sizing: border-box !important;
        gap: 10px !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-header-brand {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        text-decoration: none !important;
        min-width: 0 !important;
      }

      .cc-chat-header-logo-wrap {
        position: relative !important;
        width: 40px !important;
        height: 40px !important;
        min-width: 40px !important;
        border-radius: 50% !important;
        background: transparent !important;
        padding: 0 !important;
        box-shadow: 0 0 14px rgba(242, 209, 124, 0.4) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .cc-chat-header-icon {
        width: 100% !important;
        height: 100% !important;
        border-radius: 50% !important;
        object-fit: cover !important;
      }

      .cc-chat-header-titles {
        display: flex !important;
        flex-direction: column !important;
        min-width: 0 !important;
      }

      .cc-chat-header-title {
        font-size: 1.15rem !important;
        font-weight: 700 !important;
        letter-spacing: -0.01em !important;
        color: #F7F8FC !important;
        display: flex !important;
        align-items: center !important;
        gap: 5px !important;
        line-height: 1.2 !important;
      }

      .cc-header-sparkle {
        color: #F2D17C !important;
        font-size: 0.95rem !important;
      }

      .cc-chat-header-sub {
        font-size: 0.74rem !important;
        font-weight: 500 !important;
        color: #A5AEC4 !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        margin-top: 2px !important;
      }

      .cc-chat-live-dot {
        width: 7px !important;
        height: 7px !important;
        border-radius: 50% !important;
        background: #20C997 !important;
        box-shadow: 0 0 6px #20C997 !important;
        display: inline-block !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-header-actions {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
      }

      .cc-chat-icon-btn {
        width: 38px !important;
        height: 38px !important;
        min-width: 38px !important;
        min-height: 38px !important;
        border-radius: 50% !important;
        border: 1px solid #343A50 !important;
        background: #1D2235 !important;
        color: #A5AEC4 !important;
        cursor: pointer !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 0.95rem !important;
        transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease !important;
        text-decoration: none !important;
      }

      .cc-chat-icon-btn:hover {
        background: rgba(133, 71, 216, 0.25) !important;
        border-color: #8547D8 !important;
        color: #FFFFFF !important;
      }

      .cc-chat-icon-btn.is-close:hover {
        background: rgba(239, 100, 116, 0.25) !important;
        border-color: #EF6474 !important;
        color: #EF6474 !important;
      }

      /* ── 2. KOMPAKTOWY ODTWARZACZ RADIO CC ── */
      .cc-chat-mini-player {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 8px !important;
        padding: 4px 12px !important;
        margin: 2px 14px 4px 14px !important;
        background: #15192B !important;
        border: 1px solid #343A50 !important;
        border-radius: 999px !important;
        min-height: 40px !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-radio-left {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        min-width: 0 !important;
      }

      .cc-chat-radio-glyph {
        color: #B475F5 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .cc-chat-radio-title {
        font-size: 0.82rem !important;
        font-weight: 650 !important;
        color: #FFFFFF !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .cc-chat-radio-center {
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
      }

      .cc-chat-radio-eq {
        display: inline-flex !important;
        align-items: flex-end !important;
        gap: 2.5px !important;
        height: 14px !important;
      }

      .cc-chat-radio-eq span {
        width: 3px !important;
        background: #D8AD57 !important;
        border-radius: 1.5px !important;
        transition: height 0.2s ease !important;
      }

      .cc-chat-radio-eq span:nth-child(1) { height: 9px !important; }
      .cc-chat-radio-eq span:nth-child(2) { height: 14px !important; }
      .cc-chat-radio-eq span:nth-child(3) { height: 6px !important; }
      .cc-chat-radio-eq span:nth-child(4) { height: 11px !important; }

      .cc-chat-mini-player.is-playing .cc-chat-radio-eq span {
        animation: ccEqBounce 1s infinite alternate ease-in-out !important;
      }

      .cc-chat-mini-player.is-playing .cc-chat-radio-eq span:nth-child(1) { animation-delay: 0s; height: 12px !important; }
      .cc-chat-mini-player.is-playing .cc-chat-radio-eq span:nth-child(2) { animation-delay: 0.2s; height: 14px !important; }
      .cc-chat-mini-player.is-playing .cc-chat-radio-eq span:nth-child(3) { animation-delay: 0.4s; height: 8px !important; }
      .cc-chat-mini-player.is-playing .cc-chat-radio-eq span:nth-child(4) { animation-delay: 0.6s; height: 13px !important; }

      @keyframes ccEqBounce {
        0% { height: 4px; }
        100% { height: 14px; }
      }

      .cc-chat-radio-play-btn {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 6px !important;
        min-height: 32px !important;
        padding: 0 14px !important;
        background: linear-gradient(135deg, #F2D17C 0%, #D8AD57 100%) !important;
        color: #0D1020 !important;
        font-family: inherit !important;
        font-size: 0.78rem !important;
        font-weight: 750 !important;
        border: none !important;
        border-radius: 999px !important;
        cursor: pointer !important;
        box-shadow: 0 2px 10px rgba(216, 173, 87, 0.3) !important;
        transition: transform 0.18s ease, filter 0.18s ease !important;
        white-space: nowrap !important;
      }

      .cc-chat-radio-play-btn:hover {
        transform: scale(1.03) !important;
        filter: brightness(1.08) !important;
      }

      /* ── 3. NAWIGACJA (5 ZAKŁADEK 1:1) ── */
      .cc-chat-nav-tabs {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 2px 14px 4px 14px !important;
        background: #0D1020 !important;
        border-bottom: none !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-nav-tab {
        flex: 1 1 0 !important;
        min-width: 0 !important;
        min-height: 44px !important;
        padding: 3px 2px !important;
        border-radius: 14px !important;
        border: 1px solid transparent !important;
        background: transparent !important;
        color: #A5AEC4 !important;
        font-family: inherit !important;
        font-size: 0.72rem !important;
        font-weight: 500 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 2px !important;
        cursor: pointer !important;
        transition: all 0.18s ease !important;
        white-space: nowrap !important;
      }

      .cc-chat-nav-tab:hover {
        color: #F7F8FC !important;
      }

      .cc-chat-nav-tab.is-active {
        background: #3F226D !important;
        border: 1px solid rgba(133, 71, 216, 0.6) !important;
        color: #FFFFFF !important;
        font-weight: 700 !important;
        box-shadow: 0 0 12px rgba(133, 71, 216, 0.45) !important;
      }

      .cc-nav-icon {
        font-size: 1.05rem !important;
        line-height: 1 !important;
      }

      /* ── 4. OBSZAR GŁÓWNY ZAKŁADEK ── */
      .cc-chat-tab-panel {
        display: none;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        background: #0D1020;
      }

      .cc-chat-tab-panel.is-active {
        display: flex !important;
      }

      /* ── BANER ASYSTENTEK CC (SHOWCASE 1:1 ARTWORK & HOTSPOTS) ── */
      .cc-chat-asst-showcase {
        position: relative !important;
        margin: 0 14px 4px 14px !important;
        padding: 0 !important;
        border-radius: 20px !important;
        overflow: hidden !important;
        border: 1px solid #343A50 !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6) !important;
        background: #15192B !important;
        line-height: 0 !important;
        transition: all 0.25s ease !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-asst-showcase.is-collapsed {
        display: none !important;
      }

      .cc-hero-art-container {
        position: relative !important;
        width: 100% !important;
        line-height: 0 !important;
      }

      .cc-hero-art-img {
        width: 100% !important;
        height: auto !important;
        display: block !important;
        border-radius: 20px !important;
      }

      .cc-hero-hotspots {
        position: absolute !important;
        inset: 0 !important;
      }

      .cc-hotspot {
        position: absolute !important;
        background: transparent !important;
        border: none !important;
        cursor: pointer !important;
        outline: none !important;
        transition: background 0.15s ease, box-shadow 0.15s ease !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      .cc-hotspot:hover, .cc-hotspot:focus-visible {
        background: rgba(242, 209, 124, 0.14) !important;
        box-shadow: inset 0 0 0 1.5px rgba(242, 209, 124, 0.5) !important;
      }

      .cc-hotspot-lea {
        top: 15% !important;
        left: 35% !important;
        width: 23% !important;
        height: 62% !important;
        border-radius: 14px !important;
      }

      .cc-hotspot-rut {
        top: 13% !important;
        left: 58% !important;
        width: 26% !important;
        height: 65% !important;
        border-radius: 14px !important;
      }

      .cc-hotspot-noemi {
        top: 16% !important;
        left: 84% !important;
        width: 16% !important;
        height: 60% !important;
        border-radius: 14px !important;
      }

      .cc-hotspot-pill1 {
        bottom: 3.5% !important;
        left: 2% !important;
        width: 32.5% !important;
        height: 16% !important;
        border-radius: 999px !important;
      }

      .cc-hotspot-pill2 {
        bottom: 3.5% !important;
        left: 36% !important;
        width: 31% !important;
        height: 16% !important;
        border-radius: 999px !important;
      }

      .cc-hotspot-pill3 {
        bottom: 3.5% !important;
        left: 68.5% !important;
        width: 29.5% !important;
        height: 16% !important;
        border-radius: 999px !important;
      }

      /* ŚWIETLISTA LINIA ROZDZIELAJĄCA */
      .cc-lumi-divider {
        margin: 0 14px 4px 14px !important;
        height: 1.5px !important;
        background: linear-gradient(90deg, transparent, #8547D8 25%, #B475F5 50%, #8547D8 75%, transparent) !important;
        box-shadow: 0 0 8px rgba(180, 117, 245, 0.45) !important;
        flex-shrink: 0 !important;
      }

      /* ── OBSZAR AKTYWNEJ ASYSTENTKI (MINI-BAR) ── */
      .cc-chat-active-asst-bar {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 0 0 2px 0 !important;
        margin: 0 14px 4px 14px !important;
        background: transparent !important;
        border: none !important;
        border-radius: 0 !important;
        flex-shrink: 0 !important;
      }

      .cc-active-asst-left {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }

      .cc-active-asst-avatar-wrap {
        position: relative !important;
        width: 32px !important;
        height: 32px !important;
        border-radius: 50% !important;
        flex-shrink: 0 !important;
      }

      .cc-active-asst-avatar {
        width: 100% !important;
        height: 100% !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        border: 1.5px solid #8547D8 !important;
        display: block !important;
      }

      .cc-active-asst-dot {
        position: absolute !important;
        right: -1px !important;
        bottom: -1px !important;
        width: 8px !important;
        height: 8px !important;
        border-radius: 50% !important;
        background: #20C997 !important;
        border: 1.5px solid #0D1020 !important;
      }

      .cc-active-asst-meta {
        display: flex !important;
        align-items: baseline !important;
        gap: 6px !important;
      }

      .cc-active-asst-name {
        font-size: 0.92rem !important;
        font-weight: 700 !important;
        color: #FFFFFF !important;
      }

      .cc-active-asst-role {
        font-size: 0.8rem !important;
        color: #A5AEC4 !important;
      }

      .cc-asst-toggle-showcase-btn {
        display: none !important;
      }

      /* ── 5. FEED WIADOMOŚCI ── */
      .cc-chat-feed {
        flex: 1 1 auto !important;
        min-height: 0 !important;
        overflow-y: auto !important;
        padding: 0 14px 4px 14px !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 5px !important;
      }

      /* Kontener powitania 1:1 */
      .cc-asst-welcome-container {
        display: flex !important;
        align-items: stretch !important;
        justify-content: space-between !important;
        gap: 8px !important;
        margin: 0 0 3px 0 !important;
        position: relative !important;
      }

      .cc-asst-welcome-bubble {
        flex: 1 1 70% !important;
        background: rgba(29, 34, 53, 0.8) !important;
        backdrop-filter: blur(8px) !important;
        border-radius: 18px !important;
        border: 1px solid rgba(133, 71, 216, 0.45) !important;
        box-shadow: 0 4px 20px rgba(133, 71, 216, 0.12) !important;
        padding: 8px 12px !important;
        font-size: 0.77rem !important;
        line-height: 1.35 !important;
        color: #D8DEE9 !important;
        min-width: 0 !important;
      }

      .cc-welcome-headline {
        font-size: 0.88rem !important;
        font-weight: 700 !important;
        color: #FFFFFF !important;
        margin-bottom: 2px !important;
      }

      .cc-welcome-lead {
        margin: 0 0 3px 0 !important;
        color: #D8DEE9 !important;
        font-size: 0.75rem !important;
        line-height: 1.3 !important;
      }

      .cc-welcome-help {
        margin: 0 0 4px 0 !important;
        color: #D8DEE9 !important;
        font-size: 0.75rem !important;
        line-height: 1.3 !important;
      }

      .cc-welcome-ask {
        margin: 0 !important;
        color: #FFFFFF !important;
        font-size: 0.80rem !important;
        font-weight: 600 !important;
      }

      .cc-welcome-art-wrap {
        width: 74px !important;
        flex: 0 0 74px !important;
        align-self: stretch !important;
        border-radius: 16px !important;
        overflow: hidden !important;
        position: relative !important;
      }

      .cc-welcome-art-img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        display: block !important;
        border-radius: 16px !important;
      }

      /* 3 Karty Szybkich Akcji 1:1 */
      .cc-chat-quick-cards-grid {
        display: flex !important;
        flex-direction: column !important;
        gap: 5px !important;
        margin: 0 0 3px 0 !important;
      }

      .cc-quick-card {
        display: flex !important;
        align-items: center !important;
        background: #1D2235 !important;
        border-radius: 14px !important;
        padding: 4px 12px 4px 5px !important;
        min-height: 48px !important;
        color: #F7F8FC !important;
        text-decoration: none !important;
        cursor: pointer !important;
        transition: transform 0.18s ease, box-shadow 0.18s ease !important;
        box-sizing: border-box !important;
      }

      .cc-quick-card:hover {
        transform: translateY(-2px) !important;
      }

      .cc-quick-card.cc-qc-gold {
        border: 1px solid rgba(255, 140, 51, 0.4) !important;
        box-shadow: 0 4px 16px rgba(255, 122, 0, 0.08), inset 0 1px 0 rgba(255, 200, 100, 0.25) !important;
      }

      .cc-quick-card.cc-qc-blue {
        border: 1px solid rgba(99, 102, 241, 0.4) !important;
        box-shadow: 0 4px 16px rgba(99, 102, 241, 0.08), inset 0 1px 0 rgba(160, 170, 255, 0.25) !important;
      }

      .cc-quick-card.cc-qc-purple {
        border: 1px solid rgba(168, 85, 247, 0.4) !important;
        box-shadow: 0 4px 16px rgba(168, 85, 247, 0.08), inset 0 1px 0 rgba(220, 150, 255, 0.25) !important;
      }

      .cc-qc-thumb-wrap {
        width: 68px !important;
        height: 40px !important;
        border-radius: 10px !important;
        overflow: hidden !important;
        flex-shrink: 0 !important;
        margin-right: 10px !important;
        background: #0D1020 !important;
      }

      .cc-qc-thumb-img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        display: block !important;
      }

      .cc-qc-meta {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 1px !important;
        min-width: 0 !important;
      }

      .cc-qc-title {
        font-size: 0.84rem !important;
        font-weight: 700 !important;
        color: #FFFFFF !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
      }

      .cc-qc-desc {
        font-size: 0.70rem !important;
        color: #A5AEC4 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .cc-qc-arrow {
        color: #A5AEC4 !important;
        font-size: 1.15rem !important;
        margin-left: 6px !important;
        font-weight: 600 !important;
        line-height: 1 !important;
      }

      .cc-chat-scroll-bottom-btn {
        display: none !important;
        align-self: center;
        background: rgba(133, 71, 216, 0.25) !important;
        border: 1px solid rgba(133, 71, 216, 0.5) !important;
        color: #F7F8FC !important;
        border-radius: 999px !important;
        padding: 4px 14px !important;
        font-size: 0.74rem !important;
        font-family: inherit !important;
        cursor: pointer !important;
        margin: 4px auto !important;
        z-index: 5 !important;
      }

      /* ── 6. STAŁE POLE WPISYWANIA WIADOMOŚCI (COMPOSER 1:1) ── */
      .cc-chat-composer-premium {
        position: sticky !important;
        bottom: 0 !important;
        background: #0D1020 !important;
        border-top: 1px solid #1D2235 !important;
        padding: 6px 14px calc(6px + env(safe-area-inset-bottom, 0px)) 14px !important;
        flex-shrink: 0 !important;
        z-index: 10 !important;
      }

      .cc-chat-composer-form {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }

      .cc-composer-plus-btn {
        width: 38px !important;
        height: 38px !important;
        min-width: 38px !important;
        min-height: 38px !important;
        border-radius: 50% !important;
        background: #1D2235 !important;
        border: 1.5px solid #343A50 !important;
        color: #FFFFFF !important;
        font-size: 1.3rem !important;
        font-weight: 400 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        flex-shrink: 0 !important;
        transition: background 0.18s ease, transform 0.18s ease !important;
        line-height: 1 !important;
      }

      .cc-composer-plus-btn:hover {
        background: #252C44 !important;
        transform: scale(1.05) !important;
      }

      .cc-composer-input-wrap {
        flex: 1 !important;
        background: #0D1020 !important;
        border: 1px solid rgba(216, 173, 87, 0.45) !important;
        border-radius: 999px !important;
        display: flex !important;
        align-items: center !important;
        padding: 0 8px 0 14px !important;
        min-height: 40px !important;
        box-sizing: border-box !important;
        transition: border-color 0.18s ease !important;
      }

      .cc-composer-input-wrap:focus-within {
        border-color: #F2D17C !important;
        box-shadow: 0 0 10px rgba(242, 209, 124, 0.25) !important;
      }

      .cc-composer-textarea {
        background: transparent !important;
        border: none !important;
        outline: none !important;
        color: #FFFFFF !important;
        font-family: inherit !important;
        font-size: 0.78rem !important;
        flex: 1 !important;
        resize: none !important;
        line-height: 1.35 !important;
        padding: 6px 0 !important;
      }

      .cc-composer-textarea::placeholder {
        color: #7E88A2 !important;
      }

      .cc-composer-mic-btn {
        background: transparent !important;
        border: none !important;
        color: #A5AEC4 !important;
        cursor: pointer !important;
        padding: 4px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 1.1rem !important;
        flex-shrink: 0 !important;
        transition: color 0.18s ease !important;
      }

      .cc-composer-mic-btn:hover {
        color: #FFFFFF !important;
      }

      .cc-composer-send-btn {
        background: #FFC436 !important;
        color: #0D1020 !important;
        font-weight: 800 !important;
        font-size: 0.82rem !important;
        border: none !important;
        border-radius: 999px !important;
        padding: 0 16px !important;
        min-height: 40px !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        cursor: pointer !important;
        flex-shrink: 0 !important;
        box-shadow: 0 2px 10px rgba(255, 196, 54, 0.35) !important;
        transition: transform 0.18s ease, filter 0.18s ease !important;
      }

      .cc-composer-send-btn:hover {
        transform: scale(1.02) !important;
        filter: brightness(1.06) !important;
      }
      /* ── RESPONSYWNOŚĆ MOBILE (320-768px) ── */
      @media (max-width: 768px) {
    .cc-chat-drawer {
      height: var(--lumi-viewport-height, 100dvh) !important;
      max-height: var(--lumi-viewport-height, 100dvh) !important;
    }
        .cc-chat-drawer {
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          max-width: 100vw !important;
          height: 100dvh !important;
          max-height: 100dvh !important;
          border-radius: 0 !important;
          border: none !important;
        }

        .cc-chat-header {
          padding: max(10px, env(safe-area-inset-top)) 14px 10px 14px !important;
        }

        .cc-chat-teaser-bubble {
          right: 0 !important;
          width: calc(100vw - 32px) !important;
        }

        .cc-chat-composer-premium {
          padding-bottom: max(12px, env(safe-area-inset-bottom)) !important;
        }

        .cc-showcase-body {
          flex-direction: column !important;
          align-items: flex-start !important;
        }

        .cc-showcase-trio {
          width: 100% !important;
          justify-content: space-around !important;
          margin-top: 8px !important;
        }
      }

      @keyframes ccFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes ccPulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.08); }
      }

      @media (prefers-reduced-motion: reduce) {
        *, ::before, ::after {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 4. Deterministyczny silnik odpowiedzi Asystentek (ZERO COST, instant)
  function getAssistantAnswer(query, assistant) {
    const q = (query || '').toLowerCase().trim();
    const asstName = assistant?.shortName || 'Rut';

    // 1. Radio / Muzyka
    if (/radio|słucha|muzyk|audycj|stacj|gra/.test(q)) {
      return {
        reply: `Możesz słuchać Radia Christian Culture 24/7 na żywo prosto w LUMI Messengerze lub w pełnym odtwarzaczu audio!`,
        actions: [
          { label: '🎧 Włącz Radio w pasku', type: 'radio_play' },
          { label: '📻 Otwórz Odtwarzacz Spotify-Style', url: '/player' }
        ]
      };
    }

    // 2. Biblia / Wersety / Pismo Święte
    if (/bibli|werset|pism|słow|rozwaz|strong/.test(q)) {
      return {
        reply: `W ekosystemie Christian Culture Słowo Boże jest w samym centrum. Mamy dla Ciebie interlinearną MojąBiblię z kodami Stronga oraz słuchowiska Biblia Audio!`,
        actions: [
          { label: '📖 Otwórz MojąBiblię', url: '/mojabiblia' },
          { label: '🎧 Słuchaj Biblii Audio', url: '/biblia-audio' }
        ]
      };
    }

    // 3. Akademia / Kurs Codzienny / Lekcja
    if (/kurs|akademi|lekcj|studiu|nauk/.test(q)) {
      return {
        reply: `Akademia Biblijna Christian Culture to bezpłatne wykłady, studia biblijne oraz codzienny kurs „Z Biblią za Pan Brat”. Codziennie nowa lekcja ku duchowemu wzrostowi!`,
        actions: [
          { label: '🎓 Akademia Biblijna', url: '/akademia' },
          { label: '📖 Kurs Codzienny', url: '/akademia/kurscodzienny' }
        ]
      };
    }

    // 4. Dobra Nowina / Ewangelia / Zbawienie
    if (/ewangeli|dobra nowin|jezus|zbawien|wiara|bóg|bog/.test(q)) {
      return {
        reply: `Dobra Nowina to radosne przesłanie o Bożej bezwarunkowej miłości, przebaczeniu i zbawieniu w Jezusie Chrystusie. Każdy może rozpocząć nowe życie z Bogiem już dziś!`,
        actions: [
          { label: '📖 Poznaj Dobrą Nowinę', url: '/Ewangelia' },
          { label: '🕊️ Świadectwa Wiary', url: '/swiadectwa' }
        ]
      };
    }

    // 5. Modlitwa / Duszpasterz
    if (/modlitw|intencj|pastor|duszpaster|mariusz|pomódl|pomodl/.test(q)) {
      return {
        reply: `Nigdy nie jesteś sam. Możesz złożyć intencję modlitewną na Tablicy Społeczności LUMINA lub porozmawiać bezpośrednio z Duszpasterzem Mariuszem (+48 608 337 477).`,
        actions: [
          { label: '🕊️ Tablica Modlitwy LUMINA', url: '/lumina-tablica.html' },
          { label: '📞 Zadzwoń: Duszpasterz Mariusz', url: 'tel:+48608337477' }
        ]
      };
    }

    // 6. Filmy / VOD / Kino
    if (/vod|film|kino|wideo|oglad/.test(q)) {
      return {
        reply: `W Chrześcijańskim Kinie VOD na https://polskieradio.cc/vod znajdziesz pełnometrażowe filmy z polskim lektorem, m.in. „Przełęcz ocalonych”, „Chata” i „Jezus” – w 100% bezpłatnie!`,
        actions: [
          { label: '🎬 Otwórz Kino VOD', url: '/vod' }
        ]
      };
    }

    // 7. Kontakt / Infolinia / Pomoc / Zespół
    if (/kontakt|pomoc|infolini|telefon|sztab|napisz|mail/.test(q)) {
      return {
        reply: `Nasz Sztab CC oraz Infolinia Nadzieja (+48 730 958 583) służą pomocą i wsparciem. Możesz też napisać bezpośrednio na polskiercctv@gmail.com.`,
        actions: [
          { label: '📞 Zadzwoń: +48 730 958 583', url: 'tel:+48730958583' },
          { label: '💬 Dołącz do WhatsApp CC', url: 'https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0' },
          { label: '🤝 Współpraca i Wolontariat', url: '/o-nas' }
        ]
      };
    }

    // 8. Kim jesteś
    if (/kim jesteś|kim jestes|człowiek|czlowiek|bot|ai/.test(q)) {
      return {
        reply: `Jestem ${asstName} – wirtualną asystentką Christian Culture i gospodynią LUMI Messenger. Pomagam Ci sprawnie odkrywać radio 24/7, Biblię, kursy, audycje oraz łączyć się ze społecznością i sztabem CC!`,
        actions: [
          { label: '🧭 Odkryj Christian Culture', url: '/go' },
          { label: '🗺️ Żywa Mapa Ekosystemu', url: '/mapa' }
        ]
      };
    }

    // Domyślna pomocna odpowiedź
    return {
      reply: `Dziękuję za wiadomość! Pomogę Ci odnaleźć właściwe materiały w Christian Culture. Sprawdź wyszukiwarkę całego ekosystemu lub skontaktuj się z naszym zespołem.`,
      actions: [
        { label: '🔍 Wyszukiwarka Ekosystemu', url: '/wyszukiwarka' },
        { label: '👥 Zespół i Kontakt', type: 'switch_tab_team' }
      ]
    };
  }

  // 5. Montowanie struktury HTML przycisku i okna czatu
  function mountComponent() {
    if (document.getElementById('ccGlobalChatOverlay')) return;

    // Przycisk FAB
    let fabWrap = document.getElementById('ccGlobalChatFab');
    if (!fabWrap) {
      fabWrap = document.createElement('div');
      fabWrap.id = 'ccGlobalChatFab';
      fabWrap.className = 'cc-chat-fab-wrap';
      fabWrap.setAttribute('role', 'region');
      fabWrap.setAttribute('aria-label', 'LUMI Messenger');

      fabWrap.innerHTML = `
        <!-- Dymek Zaczepka: Rotacja 3 asystentek -->
        <div class="cc-chat-teaser-bubble" id="ccChatTeaserBubble" role="button" tabindex="0" aria-label="Porozmawiaj z Asystentem CC">
          <button type="button" class="cc-chat-teaser-close" id="ccChatTeaserClose" aria-label="Zamknij dymek" title="Zamknij">✕</button>
          <div class="cc-chat-teaser-avatar-wrap">
            <img src="" alt="Asystentka CC" class="cc-chat-teaser-avatar" id="ccChatTeaserAvatar" width="44" height="44" loading="eager">
            <span class="cc-chat-teaser-online" aria-hidden="true"></span>
          </div>
          <div class="cc-chat-teaser-content">
            <div class="cc-chat-teaser-header">
              <span class="cc-chat-teaser-name" id="ccChatTeaserName">Asystentka CC</span>
            </div>
            <span class="cc-chat-teaser-msg" id="ccChatTeaserMsg">W czym mogę Ci dziś pomóc?</span>
            <span class="cc-chat-teaser-cta">Kliknij i porozmawiaj →</span>
          </div>
        </div>
        <div class="cc-chat-fab-tooltip" id="ccChatFabTooltip" style="display:none!important;" aria-hidden="true">LUMI Messenger · LumiMess</div>
        <button type="button" class="cc-chat-fab-btn" id="ccChatFabBtn" aria-label="Otwórz LUMI Messenger">
          <picture>
            <source srcset="/images/chat/cc-chat-button.webp" type="image/webp">
            <img src="/images/chat/cc-chat-button.png" alt="LUMI Messenger" class="cc-chat-fab-img" width="50" height="50" loading="eager" decoding="sync">
          </picture>
          <span class="cc-chat-fab-badge" aria-hidden="true"></span>
        </button>
      `;
      document.body.appendChild(fabWrap);
    }

    // Okno czatu LUMI MESSENGER PREMIUM UI 2.0
    const overlay = document.createElement('div');
    overlay.id = 'ccGlobalChatOverlay';
    overlay.className = 'cc-chat-drawer-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    overlay.innerHTML = `
      <div class="cc-chat-drawer" role="dialog" aria-modal="true" aria-labelledby="ccChatHeaderTitle">
        
        <!-- 1. NAGŁÓWEK LUMI MESSENGER -->
        <header class="cc-chat-header">
          <a href="/mess" class="cc-chat-header-brand" id="ccChatHeaderBrand" title="LUMI Messenger">
            <div class="cc-chat-header-logo-wrap" aria-hidden="true">
              <img src="/images/chat/lumi_header_logo.webp" id="ccChatHeaderPartnerAvatar" alt="LUMI Messenger" class="cc-chat-header-icon" width="38" height="38" onerror="this.src='/images/chat/cc-chat-button-120.webp'">
            </div>
            <div class="cc-chat-header-titles">
              <div class="cc-chat-header-title" id="ccChatHeaderTitle">
                <span>LUMI Messenger</span>
                <span class="cc-header-sparkle">✨</span>
              </div>
              <div class="cc-chat-header-sub">
                <span class="cc-chat-live-dot" aria-hidden="true"></span>
                <span id="ccChatHeaderSubText">Na żywo w Chrystusie</span>
              </div>
            </div>
          </a>
          <div class="cc-chat-header-actions">
            <button type="button" class="cc-chat-icon-btn" id="ccChatNotifBtn" title="Powiadomienia" aria-label="Powiadomienia">
              🔔
            </button>
            <button type="button" class="cc-chat-icon-btn" id="ccChatSettingsBtn" title="Ustawienia czatu" aria-label="Ustawienia czatu">
              ⚙️
            </button>
            <button type="button" class="cc-chat-icon-btn is-close cc-chat-close-btn" id="ccChatCloseBtn" aria-label="Zamknij czat" title="Zamknij">
              ✕
            </button>
          </div>
        </header>

        <!-- 2. KOMPAKTOWY ODTWARZACZ RADIO CHRISTIAN CULTURE -->
        <section class="cc-chat-mini-player" id="ccChatMiniPlayer" aria-label="Odtwarzacz Radio Christian Culture">
          <div class="cc-chat-radio-left">
            <span class="cc-chat-radio-glyph" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4.93 4.93a10 10 0 0 0 0 14.14M2 2a14.14 14.14 0 0 0 0 20M19.07 4.93a10 10 0 0 1 0 14.14M22 2a14.14 14.14 0 0 1 0 20M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
              </svg>
            </span>
            <span class="cc-chat-radio-title" id="ccChatRadioTitle">Radio Christian Culture PL</span>
          </div>
          <div class="cc-chat-radio-center">
            <div class="cc-chat-radio-eq" id="ccChatRadioEq" aria-hidden="true">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
          <button type="button" class="cc-chat-radio-play-btn" id="ccChatRadioPlayBtn" aria-label="Włącz lub zatrzymaj radio">
            <span id="ccChatRadioPlayIcon">▶</span>
            <span id="ccChatRadioPlayText">Słuchaj</span>
          </button>
        </section>

        <!-- 3. NAWIGACJA: 5 ZAKŁADEK 1:1 -->
        <nav class="cc-chat-nav-tabs" role="tablist" aria-label="Nawigacja czatu">
          <button type="button" class="cc-chat-nav-tab is-active" id="ccChatTabLiveBtn" role="tab" aria-selected="true" aria-controls="ccChatViewLive">
            <span class="cc-nav-icon">💬</span>
            <span>Czat</span>
          </button>
          <button type="button" class="cc-chat-nav-tab" id="ccChatTabTeamBtn" role="tab" aria-selected="false" aria-controls="ccChatViewTeam">
            <span class="cc-nav-icon">👥</span>
            <span>Zespół CC</span>
          </button>
          <button type="button" class="cc-chat-nav-tab" id="ccChatTabMembersBtn" role="tab" aria-selected="false" aria-controls="ccChatViewMembers">
            <span class="cc-nav-icon">👥</span>
            <span>Społeczność</span>
          </button>
          <button type="button" class="cc-chat-nav-tab" id="ccChatTabChannelsBtn" role="tab" aria-selected="false" aria-controls="ccChatViewChannels">
            <span class="cc-nav-icon">🌐</span>
            <span>Zasoby</span>
          </button>
          <button type="button" class="cc-chat-nav-tab" id="ccChatTabMoreBtn" role="tab" aria-selected="false" aria-controls="ccChatViewMore">
            <span class="cc-nav-icon">•••</span>
            <span>Więcej</span>
          </button>
        </nav>

        <!-- ════ WIDOK 1: CZAT & ASYSTENTKI CC ════ -->
        <div class="cc-chat-tab-panel is-active" id="ccChatViewLive" role="tabpanel" aria-labelledby="ccChatTabLiveBtn">
          
          <!-- BANER ASYSTENTEK CC (SHOWCASE 1:1 ARTWORK & HOTSPOTS) -->
          <section class="cc-chat-asst-showcase" id="ccChatAsstShowcase" aria-label="Asystentki Christian Culture">
            <div class="cc-hero-art-container">
              <img src="/images/chat/lumi_hero_banner.webp" alt="Asystentki Christian Culture - Lea, Rut, Noemi" class="cc-hero-art-img" width="474" height="288" loading="eager">
              <div class="cc-hero-hotspots">
                <!-- Lea -->
                <button type="button" class="cc-hotspot cc-hotspot-lea cc-trio-card" data-asst-id="asystentka-2" role="radio" aria-checked="false" aria-label="Wybierz Lea - Organizer i planista" title="Lea - Organizer i planista"></button>
                <!-- Rut (Center) -->
                <button type="button" class="cc-hotspot cc-hotspot-rut cc-trio-card is-active" data-asst-id="asystentka-1" role="radio" aria-checked="true" aria-label="Wybierz Rut - Wspieram Cię i pomagam" title="Rut - Wspieram Cię i pomagam"></button>
                <!-- Noemi -->
                <button type="button" class="cc-hotspot cc-hotspot-noemi cc-trio-card" data-asst-id="asystentka-3" role="radio" aria-checked="false" aria-label="Wybierz Noemi - Twoje zasoby i rozwiązania" title="Noemi - Twoje zasoby i rozwiązania"></button>
                <!-- Pigułki pod banerem -->
                <button type="button" class="cc-hotspot cc-hotspot-pill1 cc-showcase-pill" id="ccPillRadio" aria-label="Posłuchaj radia" title="Posłuchaj radia"></button>
                <button type="button" class="cc-hotspot cc-hotspot-pill2 cc-showcase-pill" id="ccPillBible" aria-label="Poznaj Biblię" title="Poznaj Biblię"></button>
                <button type="button" class="cc-hotspot cc-hotspot-pill3 cc-showcase-pill" id="ccPillDiscover" aria-label="Odkryj CC" title="Odkryj CC"></button>
              </div>
            </div>
          </section>

          <!-- ŚWIETLISTA LINIA ROZDZIELAJĄCA -->
          <div class="cc-lumi-divider" aria-hidden="true"></div>

          <!-- MINI-BAR AKTYWNEJ ASYSTENTKI -->
          <div class="cc-chat-active-asst-bar" id="ccChatActiveAsstBar">
            <div class="cc-active-asst-left">
              <div class="cc-active-asst-avatar-wrap" aria-hidden="true">
                <img src="/images/chat/lumi_avatar_rut_circle.webp" alt="Rut" id="ccChatActiveAsstAvatar" class="cc-active-asst-avatar" onerror="this.src='/images/chat/assistants/asystentka-1.webp'">
                <span class="cc-active-asst-dot"></span>
              </div>
              <div class="cc-active-asst-meta">
                <span class="cc-active-asst-name" id="ccChatActiveAsstName">Rut</span>
                <span class="cc-active-asst-role" id="ccChatActiveAsstRole">· Asystentka CC</span>
              </div>
            </div>
            <button type="button" class="cc-asst-toggle-showcase-btn" id="ccAsstToggleShowcaseBtn" style="display:none;" aria-label="Zwiń / rozwiń prezentację asystentek" title="Zwiń / rozwiń asystentki">
              <span id="ccAsstToggleIcon">▾</span>
            </button>
          </div>

          <!-- FEED WIADOMOŚCI I REKOMENDACJI -->
          <div class="cc-chat-partners-bar" id="ccChatPartnersBar" style="display:none !important;"></div>
          <div class="cc-chat-feed" id="ccChatFeed">
            
            <!-- Powitanie 1:1 -->
            <div class="cc-asst-welcome-container">
              <div class="cc-asst-welcome-bubble" id="ccChatWelcomeBubble">
                <div class="cc-welcome-headline">Cześć! ❤️ Dobrze, że jesteś.</div>
                <div class="cc-welcome-lead" id="ccChatWelcomeBody">Nazywam się Rut – jestem Asystentką Christian Culture i gospodynią LUMI MESS.</div>
                <div class="cc-welcome-help">Przez całą dobę pomogę Ci znaleźć radio 24/7, Biblię, kursy, filmy VOD, społeczność LUMINA lub kontakt z zespołem.</div>
                <div class="cc-welcome-ask">W czym mogę Ci dziś pomóc?</div>
              </div>
              <div class="cc-welcome-art-wrap" aria-hidden="true">
                <img src="/images/chat/lumi_welcome_cross_bible.webp" alt="Krzyż i Biblia" class="cc-welcome-art-img" width="88" height="168">
              </div>
            </div>

            <!-- 3 Karty Szybkich Akcji 1:1 -->
            <div class="cc-chat-quick-cards-grid" id="ccChatQuickCardsGrid">
              <a href="/player" class="cc-quick-card cc-qc-gold" id="ccQcRadio" aria-label="Posłuchaj radia">
                <div class="cc-qc-thumb-wrap" aria-hidden="true">
                  <img src="/images/chat/lumi_thumb_mic.webp" alt="Radio 24/7" class="cc-qc-thumb-img" width="76" height="48">
                </div>
                <div class="cc-qc-meta">
                  <span class="cc-qc-title">🎧 Posłuchaj radia</span>
                  <span class="cc-qc-desc">Radio 24/7 · Audycje · Muzyka · Na żywo</span>
                </div>
                <span class="cc-qc-arrow" aria-hidden="true">›</span>
              </a>

              <a href="/Ewangelia" class="cc-quick-card cc-qc-blue" id="ccQcBible" aria-label="Poznaj Dobrą Nowinę">
                <div class="cc-qc-thumb-wrap" aria-hidden="true">
                  <img src="/images/chat/lumi_thumb_bible.webp" alt="Biblia" class="cc-qc-thumb-img" width="76" height="48">
                </div>
                <div class="cc-qc-meta">
                  <span class="cc-qc-title">📖 Poznaj Dobrą Nowinę</span>
                  <span class="cc-qc-desc">Biblia · Wersety · Kontemplacja · Kursy</span>
                </div>
                <span class="cc-qc-arrow" aria-hidden="true">›</span>
              </a>

              <a href="/akademia" class="cc-quick-card cc-qc-purple" id="ccQcAcademy" aria-label="Akademia Biblijna">
                <div class="cc-qc-thumb-wrap" aria-hidden="true">
                  <img src="/images/chat/lumi_thumb_cap.webp" alt="Akademia Biblijna" class="cc-qc-thumb-img" width="76" height="48">
                </div>
                <div class="cc-qc-meta">
                  <span class="cc-qc-title">🎓 Akademia Biblijna</span>
                  <span class="cc-qc-desc">Kursy · Wykłady · Rozwój duchowy</span>
                </div>
                <span class="cc-qc-arrow" aria-hidden="true">›</span>
              </a>
            </div>

            <!-- Strumień wiadomości -->
            <div id="ccChatMessagesList" style="display: flex; flex-direction: column; gap: 10px;"></div>

            <!-- Przycisk powrotu do najnowszych wiadomości -->
            <button type="button" class="cc-chat-scroll-bottom-btn" id="ccChatScrollBottomBtn" aria-label="Przejdź do najnowszych wiadomości" style="display: none;">
              Przejdź do najnowszych ↓
            </button>
          </div>

          <!-- 6. STAŁE POLE WPISYWANIA WIADOMOŚCI -->
          <div class="cc-chat-composer-premium" id="ccChatComposer">
            <div class="cc-composer-popover" id="ccComposerPopover" hidden>
              <button type="button" class="cc-popover-item" data-query="Jak posłuchać radia?">🎧 Radio 24/7</button>
              <button type="button" class="cc-popover-item" data-query="Gdzie znajdę Biblię i rozważania?">📖 Biblia i rozważania</button>
              <button type="button" class="cc-popover-item" data-query="Jakie kursy oferuje Akademia Biblijna?">🎓 Akademia Biblijna</button>
              <button type="button" class="cc-popover-item" data-query="Jak mogę skontaktować się ze Sztabem CC?">📞 Kontakt i pomoc</button>
              <button type="button" class="cc-popover-item" data-query="Czym jest misja Christian Culture?">🕊️ O misji CC</button>
            </div>

            <form class="cc-chat-composer-form" id="ccChatForm">
              <button type="button" class="cc-composer-plus-btn" id="ccChatPlusBtn" aria-label="Więcej opcji i szybkie pytania" title="Szybkie pytania">+</button>
              <div class="cc-composer-input-wrap">
                <textarea
                  id="ccChatInput"
                  class="cc-composer-textarea"
                  rows="1"
                  placeholder="Zadaj pytanie (np. radio, Biblia, kursy, pomoc)"
                  maxlength="500"
                  autocomplete="off"
                  aria-label="Zadaj pytanie asystentce"
                ></textarea>
              </div>
              <button type="button" class="cc-composer-mic-btn" id="ccChatMicBtn" aria-label="Mów do mikrofonu (rozpoznawanie mowy)" title="Naciśnij, aby mówić">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
              <button type="submit" class="cc-composer-send-btn" id="ccChatSendBtn" aria-label="Wyślij wiadomość" title="Wyślij wiadomość">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
                <span>Wyślij</span>
              </button>
            </form>
          </div>
        </div>
        <!-- ════ WIDOK 2: ZESPÓŁ CC (KONTAKT I WSPARCIE) ════ -->
        <div class="cc-chat-tab-panel" id="ccChatViewTeam" role="tabpanel" aria-labelledby="ccChatTabTeamBtn">
          <div class="cc-tab-content-wrap">
            <h3 class="cc-section-headline">Zespół i Wsparcie Christian Culture</h3>
            <p style="font-size:0.8rem;color:var(--lumi-text-muted);margin:0 0 8px 0;line-height:1.4;">
              Skorzystaj z oficjalnych kanałów kontaktu ze Sztabem, redakcją i opieką duszpasterską.
            </p>

            <a href="tel:+48608337477" class="cc-card-item">
              <div class="cc-card-icon" style="background:rgba(216,173,87,0.18);color:var(--lumi-gold-light);">🕊️</div>
              <div class="cc-card-info">
                <span class="cc-card-title">Duchowny Mariusz</span>
                <span class="cc-card-sub">Wsparcie duszpasterskie i modlitwa • +48 608 337 477</span>
              </div>
              <span class="cc-qc-arrow">›</span>
            </a>

            <a href="tel:+48730958583" class="cc-card-item">
              <div class="cc-card-icon" style="background:rgba(56,189,248,0.18);color:#38BDF8;">📞</div>
              <div class="cc-card-info">
                <span class="cc-card-title">Infolinia Nadzieja</span>
                <span class="cc-card-sub">Pomoc, rozmowa i wsparcie • +48 730 958 583</span>
              </div>
              <span class="cc-qc-arrow">›</span>
            </a>

            <a href="https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0" target="_blank" rel="noopener noreferrer" class="cc-card-item">
              <div class="cc-card-icon" style="background:rgba(34,197,94,0.18);color:#4ADE80;">💬</div>
              <div class="cc-card-info">
                <span class="cc-card-title">Grupa WhatsApp Christian Culture</span>
                <span class="cc-card-sub">Codzienne rozważania, społeczność i braterstwo</span>
              </div>
              <span class="cc-qc-arrow">›</span>
            </a>

            <a href="mailto:polskiercctv@gmail.com" class="cc-card-item">
              <div class="cc-card-icon" style="background:rgba(133,71,216,0.2);color:var(--lumi-accent-light);">✉️</div>
              <div class="cc-card-info">
                <span class="cc-card-title">Sztab Główny & Redakcja</span>
                <span class="cc-card-sub">E-mail: polskiercctv@gmail.com</span>
              </div>
              <span class="cc-qc-arrow">›</span>
            </a>

            <a href="/o-nas" class="cc-card-item">
              <div class="cc-card-icon" style="background:rgba(255,255,255,0.06);color:var(--lumi-text-main);">🤝</div>
              <div class="cc-card-info">
                <span class="cc-card-title">Współpraca i Wolontariat</span>
                <span class="cc-card-sub">Dołącz do misji budowania Christian Culture</span>
              </div>
              <span class="cc-qc-arrow">›</span>
            </a>
          </div>
        </div>

        <!-- ════ WIDOK 3: SPOŁECZNOŚĆ (KATALOG UŻYTKOWNIKÓW & CZAT 1:1) ════ -->
        <div class="cc-chat-tab-panel" id="ccChatViewMembers" role="tabpanel" aria-labelledby="ccChatTabMembersBtn">
          <div class="cc-tab-content-wrap">
            <div class="cc-chat-search-wrap">
              <input type="text" id="ccChatMembersSearchInput" class="cc-chat-search-input" placeholder="🔍 Szukaj członka społeczności (np. Cezary, Wioletta, Mariusz)..." aria-label="Szukaj członka społeczności">
            </div>
            <div id="ccChatMembersList" style="display:flex;flex-direction:column;gap:8px;"></div>
          </div>
        </div>

        <!-- ════ WIDOK 4: ZASOBY EKOSYSTEMU ════ -->
        <div class="cc-chat-tab-panel" id="ccChatViewChannels" role="tabpanel" aria-labelledby="ccChatTabChannelsBtn">
          <div class="cc-tab-content-wrap">
            <h3 class="cc-section-headline">Zasoby i Moduły Ekosystemu</h3>
            <p style="font-size:0.8rem;color:var(--lumi-text-muted);margin:0 0 8px 0;line-height:1.4;">
              Odkryj wszystkie platformy tworzone ku Bożej chwale w jednym miejscu:
            </p>

            <a href="/player" class="cc-card-item">
              <div class="cc-card-icon" style="background:rgba(216,173,87,0.18);color:var(--lumi-gold-light);">📻</div>
              <div class="cc-card-info">
                <span class="cc-card-title">Odtwarzacz Audio Spotify-Style</span>
                <span class="cc-card-sub">Strumienie 24/7, audycje i muzyka uwielbienia</span>
              </div>
              <span class="cc-qc-arrow">›</span>
            </a>

            <a href="/mojabiblia" class="cc-card-item">
              <div class="cc-card-icon" style="background:rgba(56,189,248,0.18);color:#38BDF8;">📖</div>
              <div class="cc-card-info">
                <span class="cc-card-title">Interlinearna MojaBiblia</span>
                <span class="cc-card-sub">Kody Stronga, morfologia i 4 polskie przekłady</span>
              </div>
              <span class="cc-qc-arrow">›</span>
            </a>

            <a href="/biblia-audio" class="cc-card-item">
              <div class="cc-card-icon" style="background:rgba(133,71,216,0.22);color:var(--lumi-accent-light);">🎧</div>
              <div class="cc-card-info">
                <span class="cc-card-title">Biblia Audio Superprodukcja</span>
                <span class="cc-card-sub">Profesjonalne słuchowiska biblijne w jakości HD</span>
              </div>
              <span class="cc-qc-arrow">›</span>
            </a>

            <a href="/akademia" class="cc-card-item">
              <div class="cc-card-icon" style="background:rgba(234,179,8,0.18);color:#FACC15;">🎓</div>
              <div class="cc-card-info">
                <span class="cc-card-title">Akademia Biblijna & Kurs Codzienny</span>
                <span class="cc-card-sub">Codzienna lekcja „Z Biblią za Pan Brat”</span>
              </div>
              <span class="cc-qc-arrow">›</span>
            </a>

            <a href="/vod" class="cc-card-item">
              <div class="cc-card-icon" style="background:rgba(244,63,94,0.18);color:#FB7185;">🎬</div>
              <div class="cc-card-info">
                <span class="cc-card-title">Chrześcijańskie Kino VOD</span>
                <span class="cc-card-sub">Filmy fabularne i dokumentalne z polskim lektorem</span>
              </div>
              <span class="cc-qc-arrow">›</span>
            </a>

            <a href="/mapa" class="cc-card-item">
              <div class="cc-card-icon" style="background:rgba(34,197,94,0.18);color:#4ADE80;">🗺️</div>
              <div class="cc-card-info">
                <span class="cc-card-title">Żywa Mapa Ekosystemu</span>
                <span class="cc-card-sub">Publiczny interaktywny rejestr cyfrowy CC</span>
              </div>
              <span class="cc-qc-arrow">›</span>
            </a>
          </div>
        </div>

        <!-- ════ WIDOK 5: WIĘCEJ (USTAWIENIA I PREFERENCJE) ════ -->
        <div class="cc-chat-tab-panel" id="ccChatViewMore" role="tabpanel" aria-labelledby="ccChatTabMoreBtn">
          <div class="cc-tab-content-wrap">
            <h3 class="cc-section-headline">Ustawienia i Personalizacja</h3>
            
            <div style="background:var(--lumi-card-surface);border:1px solid var(--lumi-border);border-radius:16px;padding:14px;">
              <span style="font-size:0.86rem;font-weight:700;display:block;margin-bottom:8px;">Wybierz Asystentkę LUMI:</span>
              <div style="display:flex;gap:8px;">
                <button type="button" class="cc-showcase-pill" onclick="window.selectAssistantAndRefresh('asystentka-1')">Rut</button>
                <button type="button" class="cc-showcase-pill" onclick="window.selectAssistantAndRefresh('asystentka-2')">Lea</button>
                <button type="button" class="cc-showcase-pill" onclick="window.selectAssistantAndRefresh('asystentka-3')">Noemi</button>
              </div>
            </div>

            <a href="/privacy" class="cc-card-item">
              <div class="cc-card-icon" style="background:rgba(255,255,255,0.06);color:var(--lumi-text-main);">🔒</div>
              <div class="cc-card-info">
                <span class="cc-card-title">Prywatność i Ochrona Danych (RODO)</span>
                <span class="cc-card-sub">Pełne bezpieczeństwo i brak śledzenia reklamowego</span>
              </div>
              <span class="cc-qc-arrow">›</span>
            </a>

            <a href="/lumina-safety" class="cc-card-item">
              <div class="cc-card-icon" style="background:rgba(255,255,255,0.06);color:var(--lumi-text-main);">🛡️</div>
              <div class="cc-card-info">
                <span class="cc-card-title">Zasady Społeczności LUMINA</span>
                <span class="cc-card-sub">Szacunek, prawda i wzajemna chrześcijańska miłość</span>
              </div>
              <span class="cc-qc-arrow">›</span>
            </a>

            <div style="text-align:center;padding:16px 0;font-size:0.75rem;color:var(--lumi-text-muted);">
              <strong>LUMI Messenger 2.0 Premium</strong> • Christian Culture<br>
              Wersja 2026.11.10 • Zgodna z Constytution CC & ZERO-QA
            </div>
          </div>
        </div>

      </div>
    `;
    document.body.appendChild(overlay);

    // Inicjalizacja aktywnej asystentki i dymka zaczepki
    let activeAssistant = getActiveAssistant();
    const teaserBubble = document.getElementById('ccChatTeaserBubble');
    const teaserAvatar = document.getElementById('ccChatTeaserAvatar');
    const teaserName = document.getElementById('ccChatTeaserName');
    const teaserMsg = document.getElementById('ccChatTeaserMsg');
    const teaserClose = document.getElementById('ccChatTeaserClose');

    function refreshAssistantUI(asst) {
      activeAssistant = asst;
      if (teaserAvatar) {
        teaserAvatar.src = asst.avatar;
        teaserAvatar.onerror = function () { if (this.src !== asst.avatarFallback) this.src = asst.avatarFallback; };
      }
      if (teaserName) teaserName.textContent = asst.name;
      if (teaserMsg) teaserMsg.textContent = asst.greeting;

      const activeAvatar = document.getElementById('ccChatActiveAsstAvatar');
      const activeName = document.getElementById('ccChatActiveAsstName');
      const activeRole = document.getElementById('ccChatActiveAsstRole');
      const welcomeBody = document.getElementById('ccChatWelcomeBody');

      if (activeAvatar) {
        activeAvatar.src = asst.circleAvatar || asst.avatar;
        activeAvatar.onerror = function () { if (this.src !== asst.avatarFallback) this.src = asst.avatarFallback; };
      }
      if (activeName) activeName.textContent = asst.shortName || asst.name.split(' ')[0];
      if (activeRole) activeRole.textContent = '· Asystentka CC';
      if (welcomeBody) welcomeBody.textContent = `Nazywam się ${asst.shortName || asst.name} – jestem Asystentką Christian Culture i gospodynią LUMI MESS.`;

      // Trio radio sync
      document.querySelectorAll('.cc-trio-card').forEach(btn => {
        const isThis = btn.getAttribute('data-asst-id') === asst.id;
        btn.classList.toggle('is-active', isThis);
        btn.setAttribute('aria-checked', isThis ? 'true' : 'false');
      });
    }

    window.selectAssistantAndRefresh = function(asstId) {
      const asst = setActiveAssistantById(asstId);
      refreshAssistantUI(asst);
    };

    if (teaserBubble && activeAssistant) {
      refreshAssistantUI(activeAssistant);

      let isTeaserDismissed = false;
      try {
        isTeaserDismissed = sessionStorage.getItem('cc_teaser_dismissed') === '1';
      } catch (_) {}

      if (isTeaserDismissed) {
        teaserBubble.style.display = 'none';
      }

      function handleTeaserClick(e) {
        if (e.target && (e.target.id === 'ccChatTeaserClose' || e.target.closest('#ccChatTeaserClose'))) return;
        e.preventDefault();
        e.stopPropagation();
        teaserBubble.style.display = 'none';
        const asst = getActiveAssistant();
        try { sessionStorage.setItem('cc_active_assistant_id', asst.id); } catch (_) {}
        window.CCGlobalChat.open('assistant', 'cc-assistant');
      }

      teaserBubble.addEventListener('click', handleTeaserClick);
      teaserBubble.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') handleTeaserClick(e);
      });

      if (teaserClose) {
        teaserClose.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          teaserBubble.style.opacity = '0';
          teaserBubble.style.transform = 'translateY(8px)';
          setTimeout(() => { teaserBubble.style.display = 'none'; }, 280);
          try { sessionStorage.setItem('cc_teaser_dismissed', '1'); } catch (_) {}
        });
      }
    }

    // Podpięcie przełączania trio asystentek
    document.querySelectorAll('.cc-trio-card').forEach(btn => {
      btn.addEventListener('click', function() {
        const aid = btn.getAttribute('data-asst-id');
        window.selectAssistantAndRefresh(aid);
      });
    });

    // Pigułki pod banerem
    document.getElementById('ccPillRadio')?.addEventListener('click', function() {
      toggleMiniPlayer();
    });
    document.getElementById('ccPillBible')?.addEventListener('click', function() {
      sendAssistantMessage('Gdzie znajdę Biblię i rozważania?');
    });
    document.getElementById('ccPillDiscover')?.addEventListener('click', function() {
      sendAssistantMessage('Czym jest Christian Culture?');
    });

    // Zwijanie / rozwijanie baneru asystentek
    const toggleShowcaseBtn = document.getElementById('ccAsstToggleShowcaseBtn');
    const showcaseEl = document.getElementById('ccChatAsstShowcase');
    const toggleIcon = document.getElementById('ccAsstToggleIcon');
    if (toggleShowcaseBtn && showcaseEl) {
      toggleShowcaseBtn.addEventListener('click', function() {
        isShowcaseCollapsed = !isShowcaseCollapsed;
        showcaseEl.classList.toggle('is-collapsed', isShowcaseCollapsed);
        if (toggleIcon) toggleIcon.textContent = isShowcaseCollapsed ? '▸' : '▾';
      });
    }

    // Elementy i nawigacja zakładek
    const btn = document.getElementById('ccChatFabBtn');
    const closeBtn = document.getElementById('ccChatCloseBtn');
    const chatForm = document.getElementById('ccChatForm');
    const chatInput = document.getElementById('ccChatInput');
    const plusBtn = document.getElementById('ccChatPlusBtn');
    const composerPopover = document.getElementById('ccComposerPopover');
    const micBtn = document.getElementById('ccChatMicBtn');
    const scrollBottomBtn = document.getElementById('ccChatScrollBottomBtn');

    const tabLiveBtn = document.getElementById('ccChatTabLiveBtn');
    const tabTeamBtn = document.getElementById('ccChatTabTeamBtn');
    const tabMembersBtn = document.getElementById('ccChatTabMembersBtn');
    const tabChannelsBtn = document.getElementById('ccChatTabChannelsBtn');
    const tabMoreBtn = document.getElementById('ccChatTabMoreBtn');

    const viewLive = document.getElementById('ccChatViewLive');
    const viewTeam = document.getElementById('ccChatViewTeam');
    const viewMembers = document.getElementById('ccChatViewMembers');
    const viewChannels = document.getElementById('ccChatViewChannels');
    const viewMore = document.getElementById('ccChatViewMore');

    const allTabs = [
      { btn: tabLiveBtn, view: viewLive, id: 'live' },
      { btn: tabTeamBtn, view: viewTeam, id: 'team' },
      { btn: tabMembersBtn, view: viewMembers, id: 'members' },
      { btn: tabChannelsBtn, view: viewChannels, id: 'channels' },
      { btn: tabMoreBtn, view: viewMore, id: 'more' }
    ];

    function switchTab(targetId) {
      allTabs.forEach(t => {
        if (!t.btn || !t.view) return;
        const isTarget = t.id === targetId || (targetId === 'chat' && t.id === 'live');
        t.btn.classList.toggle('is-active', isTarget);
        t.btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        t.view.classList.toggle('is-active', isTarget);
      });

      if (targetId === 'members') {
        renderMembersList('');
        const sInput = document.getElementById('ccChatMembersSearchInput');
        if (sInput && window.innerWidth > 768) sInput.focus();
      } else if (targetId === 'live' || targetId === 'chat') {
        scrollToBottom();
        if (chatInput && window.innerWidth > 768) chatInput.focus();
      }
    }

    tabLiveBtn?.addEventListener('click', () => switchTab('live'));
    tabTeamBtn?.addEventListener('click', () => switchTab('team'));
    tabMembersBtn?.addEventListener('click', () => switchTab('members'));
    tabChannelsBtn?.addEventListener('click', () => switchTab('channels'));
    tabMoreBtn?.addEventListener('click', () => switchTab('more'));

    // [+] Popover
    if (plusBtn && composerPopover) {
      plusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        composerPopover.hidden = !composerPopover.hidden;
      });

      document.addEventListener('click', (e) => {
        if (!composerPopover.contains(e.target) && e.target !== plusBtn) {
          composerPopover.hidden = true;
        }
      });

      composerPopover.querySelectorAll('.cc-popover-item').forEach(item => {
        item.addEventListener('click', () => {
          const q = item.getAttribute('data-query');
          composerPopover.hidden = true;
          if (q) sendAssistantMessage(q);
        });
      });
    }

    // Mikrofon (Web Speech Recognition)
    if (micBtn && chatInput) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'pl-PL';
        recognition.continuous = false;
        recognition.interimResults = false;

        let isListening = false;
        recognition.onstart = () => {
          isListening = true;
          micBtn.classList.add('is-listening');
          chatInput.placeholder = 'Słucham Cię... Mów teraz... 🎙️';
        };
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          chatInput.value = (chatInput.value ? chatInput.value + ' ' : '') + transcript;
        };
        recognition.onerror = () => {
          micBtn.classList.remove('is-listening');
          chatInput.placeholder = 'Zadaj pytanie (np. radio, Biblia, kursy, pomoc)';
          isListening = false;
        };
        recognition.onend = () => {
          micBtn.classList.remove('is-listening');
          chatInput.placeholder = 'Zadaj pytanie (np. radio, Biblia, kursy, pomoc)';
          isListening = false;
        };

        micBtn.addEventListener('click', () => {
          if (!isListening) {
            try { recognition.start(); } catch (_) {}
          } else {
            try { recognition.stop(); } catch (_) {}
          }
        });
      } else {
        micBtn.style.opacity = '0.4';
        micBtn.title = 'Rozpoznawanie mowy nie jest wspierane w tej przeglądarce';
      }
    }

    // Obsługa miniaturowego odtwarzacza radiowego
    const radioPlayerEl = document.getElementById('ccChatMiniPlayer');
    const radioPlayBtn = document.getElementById('ccChatRadioPlayBtn');
    const radioPlayIcon = document.getElementById('ccChatRadioPlayIcon');
    const radioPlayText = document.getElementById('ccChatRadioPlayText');
    let isRadioPlaying = false;

    function setRadioVisualState(playing) {
      isRadioPlaying = playing;
      if (radioPlayerEl) radioPlayerEl.classList.toggle('is-playing', playing);
      if (radioPlayIcon) radioPlayIcon.textContent = playing ? '⏸' : '▶';
      if (radioPlayText) radioPlayText.textContent = playing ? 'Pauza' : 'Słuchaj';
    }

    function toggleMiniPlayer() {
      // Sprawdź czy .cc-chat-radio button istnieje
      const fallbackRadioBtn = document.querySelector('.cc-chat-radio button');
      if (fallbackRadioBtn && !fallbackRadioBtn.disabled) {
        fallbackRadioBtn.click();
        return;
      }

      // 1. Sprawdź CCChatRadio
      if (window.CCChatRadio) {
        const state = window.CCChatRadio.state();
        if (state.playing) {
          window.CCChatRadio.pause();
          setRadioVisualState(false);
        } else {
          window.CCChatRadio.play(true);
          setRadioVisualState(true);
        }
        return;
      }
      // 2. Sprawdź CCHomeRadio / playBtn na stronie
      const mainPlayBtn = document.getElementById('playBtn') || document.querySelector('.play-btn');
      if (mainPlayBtn) {
        mainPlayBtn.click();
        const nowPlaying = mainPlayBtn.classList.contains('playing') || !isRadioPlaying;
        setRadioVisualState(nowPlaying);
        return;
      }
      setRadioVisualState(!isRadioPlaying);
    }

    radioPlayBtn?.addEventListener('click', toggleMiniPlayer);

    if (window.CCChatRadio?.subscribe) {
      window.CCChatRadio.subscribe(state => {
        setRadioVisualState(!!state.playing);
      });
    }

    // Przewijanie i przycisk powrotu do najnowszych
    const feed = document.getElementById('ccChatFeed');
    function scrollToBottom() {
      if (!feed) return;
      const msgList = document.getElementById('ccChatMessagesList');
      const msgRows = msgList ? msgList.querySelectorAll('.cc-chat-msg-row') : [];
      if (msgRows.length === 0) {
        feed.scrollTop = 0;
        return;
      }
      feed.scrollTop = feed.scrollHeight;
    }

    if (feed && scrollBottomBtn) {
      feed.addEventListener('scroll', () => {
        const msgList = document.getElementById('ccChatMessagesList');
        const msgRows = msgList ? msgList.querySelectorAll('.cc-chat-msg-row') : [];
        if (msgRows.length < 2) {
          scrollBottomBtn.style.display = 'none';
          return;
        }
        const distFromBottom = feed.scrollHeight - feed.scrollTop - feed.clientHeight;
        scrollBottomBtn.style.display = distFromBottom > 160 ? 'block' : 'none';
      });
      scrollBottomBtn.addEventListener('click', () => {
        scrollToBottom();
        scrollBottomBtn.style.display = 'none';
      });
    }

    // Asystent: wysyłanie wiadomości
    function sendAssistantMessage(text) {
      if (!text || !text.trim()) return;
      const cleanText = text.trim();
      const asst = getActiveAssistant();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Dodaj wiadomość użytkownika do feedu
      const list = document.getElementById('ccChatMessagesList');
      if (!list) return;

      const userRow = document.createElement('div');
      userRow.className = 'cc-chat-msg-row is-me';
      userRow.innerHTML = `
        <div class="cc-chat-msg-content">
          <div class="cc-chat-msg-meta">
            <span class="cc-chat-msg-sender">Ty</span>
            <span>${timeStr}</span>
          </div>
          <div class="cc-chat-msg-bubble">${escapeHtml(cleanText)}</div>
        </div>
      `;
      list.appendChild(userRow);
      scrollToBottom();

      // Automatyczne zwijanie baneru po wysłaniu wiadomości, by zrobić miejsce
      if (showcaseEl && !isShowcaseCollapsed) {
        isShowcaseCollapsed = true;
        showcaseEl.classList.add('is-collapsed');
        if (toggleIcon) toggleIcon.textContent = '▸';
      }

      // Wskaźnik pisania asystenta (180 ms)
      setTimeout(() => {
        const answer = getAssistantAnswer(cleanText, asst);
        const botRow = document.createElement('div');
        botRow.className = 'cc-chat-msg-row';

        let actionsHtml = '';
        if (answer.actions && answer.actions.length) {
          actionsHtml = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">` +
            answer.actions.map(act => {
              if (act.type === 'radio_play') {
                return `<button type="button" class="cc-showcase-pill is-primary" onclick="document.getElementById('ccChatRadioPlayBtn')?.click()">${escapeHtml(act.label)}</button>`;
              }
              if (act.type === 'switch_tab_team') {
                return `<button type="button" class="cc-showcase-pill" onclick="document.getElementById('ccChatTabTeamBtn')?.click()">${escapeHtml(act.label)}</button>`;
              }
              return `<a href="${escapeHtml(act.url)}" class="cc-showcase-pill is-primary" style="text-decoration:none;">${escapeHtml(act.label)} →</a>`;
            }).join('') +
          `</div>`;
        }

        botRow.innerHTML = `
          <img src="${asst.avatar}" alt="${asst.name}" class="cc-chat-msg-avatar" onerror="this.src='${asst.avatarFallback}'">
          <div class="cc-chat-msg-content">
            <div class="cc-chat-msg-meta">
              <span class="cc-chat-msg-sender">${asst.name}</span>
              <span>${timeStr}</span>
            </div>
            <div class="cc-chat-msg-bubble">
              <div>${escapeHtml(answer.reply)}</div>
              ${actionsHtml}
            </div>
          </div>
        `;
        list.appendChild(botRow);
        scrollToBottom();
      }, 180);
    }

    // Obsługa wysyłania z pola textarea
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const text = (chatInput.value || '').trim();
      if (!text) return;
      chatInput.value = '';
      sendAssistantMessage(text);
    });

    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
      }
    });

    // Wyszukiwanie członków społeczności
    const membersSearch = document.getElementById('ccChatMembersSearchInput');
    function renderMembersList(query) {
      const list = document.getElementById('ccChatMembersList');
      if (!list) return;
      const filtered = COMMUNITY_MEMBERS.filter(m => {
        if (!query) return true;
        const q = query.toLowerCase();
        return m.name.toLowerCase().includes(q) || (m.badge && m.badge.toLowerCase().includes(q)) || (m.desc && m.desc.toLowerCase().includes(q));
      });

      list.innerHTML = filtered.map(m => `
        <div class="cc-card-item" data-partner-id="${m.id}">
          <img src="${escapeHtml(m.avatar || '/images/chat/cc-chat-button-120.webp')}" alt="${escapeHtml(m.name)}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:1px solid var(--lumi-border);">
          <div class="cc-card-info">
            <span class="cc-card-title">${escapeHtml(m.name)}</span>
            <span class="cc-card-sub">${escapeHtml(m.desc || m.badge)}</span>
          </div>
          <span class="cc-qc-arrow">💬</span>
        </div>
      `).join('');

      list.querySelectorAll('[data-member-id]').forEach(item => {
        item.addEventListener('click', () => {
          const mid = item.getAttribute('data-member-id');
          const found = COMMUNITY_MEMBERS.find(x => x.id === mid);
          if (found) {
            setChatPartner(found);
            switchTab('live');
          }
        });
      });
    }

    if (membersSearch) {
      membersSearch.addEventListener('input', () => {
        renderMembersList(membersSearch.value.trim());
      });
    }

    // Otwieranie / zamykanie czatu
    function openChat() {
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      switchTab('live');
      renderChatMessages();
      document.body.style.overflow = 'hidden';
      switchTab('live');
      setTimeout(() => {
        scrollToBottom();
        if (chatInput && window.innerWidth > 768) chatInput.focus();
      }, 100);
    }

    function closeChat() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openChat();
      });
    }

    closeBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      closeChat();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeChat();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeChat();
    });

    // Synchronizacja pozycji FAB z odtwarzaczem
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
        '.mobile-nav',
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
        fabWrap.style.setProperty('bottom', `${alignedBottom}px`, 'important');
      } else {
        fabWrap.style.setProperty('bottom', `${bottomOffset}px`, 'important');
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
    if (typeof renderPartnersBar === 'function') renderPartnersBar();
    if (typeof setChatPartner === 'function' && typeof COMMUNITY_MEMBERS !== 'undefined' && COMMUNITY_MEMBERS.length > 0) {
      setChatPartner(COMMUNITY_MEMBERS[0]);
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

  
  function renderPartnersBar() {
    const bar = document.getElementById('ccChatPartnersBar');
    if (!bar) return;
    bar.innerHTML = COMMUNITY_MEMBERS.map(m => `
      <button type="button" class="cc-chat-partner-chip ${m.id === currentChatPartner.id ? 'is-active' : ''}" data-partner-id="${m.id}" title="${escapeHtml(m.name)}" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:var(--lumi-panel);border:1px solid ${m.id === currentChatPartner.id ? 'var(--lumi-accent)' : 'var(--lumi-border)'};color:var(--lumi-text);font-size:0.75rem;cursor:pointer;white-space:nowrap;min-height:36px;">
        <img src="${escapeHtml(m.avatar || '/images/chat/cc-chat-button-120.webp')}" alt="${escapeHtml(m.name)}" style="width:20px;height:20px;border-radius:50%;object-fit:cover;" onerror="this.src='/images/chat/cc-chat-button-120.webp'">
        <span>${escapeHtml(m.name.split(' ')[0])}</span>
      </button>
    `).join('');

    bar.querySelectorAll('[data-partner-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-partner-id');
        const p = COMMUNITY_MEMBERS.find(x => x.id === id);
        if (p) {
          setChatPartner(p);
          bar.querySelectorAll('.cc-chat-partner-chip').forEach(c => {
            c.classList.remove('is-active');
            c.style.borderColor = 'var(--lumi-border)';
          });
          btn.classList.add('is-active');
          btn.style.borderColor = 'var(--lumi-accent)';
        }
      });
    });
  }

  function renderChatMessages() {
    const list = document.getElementById('ccChatMessagesList');
    if (!list) return;

    const msgs = getChatMessagesForPartner(currentChatPartner);
    const user = getUserState();

    if (!msgs || msgs.length === 0) {
      if (currentChatPartner.isPublic) {
        list.innerHTML = '<div class="cc-chat-empty-state" style="display:none;" aria-hidden="true">Czat Ogólny Społeczności LUMINA</div>';
        return;
      } else {
        list.innerHTML = `
          <div class="cc-chat-empty-state" style="text-align:center;padding:24px 16px;color:#A5AEC4;">
            <img src="${escapeHtml(currentChatPartner.avatar || '/images/chat/cc-chat-button-120.webp')}" alt="${escapeHtml(currentChatPartner.name)}" style="width:56px;height:56px;border-radius:50%;margin:0 auto 10px;display:block;border:2px solid #D8AD57;object-fit:cover;box-shadow:0 4px 14px rgba(0,0,0,0.4);" onerror="this.src='/images/chat/cc-chat-button-120.webp'">
            <div style="font-weight:700;color:#F7F8FC;font-size:0.95rem;margin-bottom:4px;">${escapeHtml(currentChatPartner.name)}</div>
            <div style="display:inline-block;font-size:0.75rem;color:#D8AD57;background:rgba(216,173,87,0.12);border:1px solid rgba(216,173,87,0.3);padding:2px 10px;border-radius:999px;margin-bottom:10px;">${escapeHtml(currentChatPartner.badge)}</div>
            <p style="font-size:0.85rem;line-height:1.5;max-width:300px;margin:0 auto;color:#A5AEC4;">
              ${user.isLoggedIn
                ? 'Rozpocznij bezpośrednią rozmowę. Wiadomości trafiają prosto do skrzynki profilu.'
                : 'Bezpośrednie wiadomości 1:1 wymagają zalogowanego profilu w portalu LUMINA.'}
            </p>
            ${!user.isLoggedIn ? `
              <div style="margin-top:14px;">
                <a href="/lumina.html?action=login" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:8px 18px;border-radius:999px;background:linear-gradient(135deg,#D8AD57,#B58A38);color:#0D1020;font-weight:700;font-size:0.8rem;text-decoration:none;box-shadow:0 4px 12px rgba(216,173,87,0.3);">
                  Zaloguj się do LUMINA 🕊️
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
              <button type="button" class="cc-chat-share-btn" onclick="window.shareChatMessage(this)" data-share-sender="${name}" data-share-text="${text}" style="background:transparent; border:none; box-shadow:none; color:rgba(255,255,255,0.7); cursor:pointer; width:44px; height:44px; min-width:44px; min-height:44px; padding:0; display:inline-flex; align-items:center; justify-content:center; margin-left:auto;" title="Udostępnij tę wiadomość" aria-label="Udostępnij wiadomość">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
              </button>
            </div>
            <div class="cc-chat-msg-bubble">
              ${renderChatMedia(text, m.id)}
            </div>
          </div>
        </div>
      `;
    });
    list.innerHTML = html;
  }

  
  let activeRealtimeUnsubscribe = null;

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

    function setChatPartner(partner) {
    if (typeof activeRealtimeUnsubscribe === 'function') {
      try { activeRealtimeUnsubscribe(); } catch(e) {}
      activeRealtimeUnsubscribe = null;
    }
    currentPartnerRealtimeMessages = null;
    currentChatPartner = partner || COMMUNITY_MEMBERS[0];

    const subText = document.getElementById('ccChatHeaderSubText');
    if (subText) {
      subText.textContent = currentChatPartner.isPublic ? 'Na żywo w Chrystusie' : `Rozmowa: ${currentChatPartner.name}`;
    }
    const title = document.getElementById('ccChatActiveAsstName');
    if (title && !currentChatPartner.isPublic) {
      title.textContent = currentChatPartner.name;
    }

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
  }

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
      const overlay = document.getElementById('ccGlobalChatOverlay');
      if (overlay) {
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
      if (targetTab === 'assistant' || targetPartnerId === 'cc-assistant' || (targetPartnerId && String(targetPartnerId).startsWith('asystentka-'))) {
        const asstId = targetPartnerId && String(targetPartnerId).startsWith('asystentka-') ? targetPartnerId : 'asystentka-1';
        try { sessionStorage.setItem('cc_active_assistant_id', asstId); } catch (_) {}
        if (window.selectAssistantAndRefresh) window.selectAssistantAndRefresh(asstId);
        const liveBtn = document.getElementById('ccChatTabLiveBtn');
        if (liveBtn) liveBtn.click();
      } else if (targetPartnerId) {
        const p = COMMUNITY_MEMBERS.find(x => x.id === targetPartnerId || x.slug === targetPartnerId);
        if (p) {
          setChatPartner(p);
          const pBtn = document.querySelector(`[data-partner-id="${p.id}"]`);
          if (pBtn) pBtn.click();
        }
      } else if (targetTab) {
        const tabMap = {
          live: 'ccChatTabLiveBtn',
          chat: 'ccChatTabLiveBtn',
          team: 'ccChatTabTeamBtn',
          members: 'ccChatTabMembersBtn',
          channels: 'ccChatTabChannelsBtn',
          more: 'ccChatTabMoreBtn'
        };
        const btnId = tabMap[targetTab];
        if (btnId) document.getElementById(btnId)?.click();
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
