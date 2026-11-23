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
      integration.src = '/js/cc-chat-integration.js?v=20261114_topmost1';
      integration.onload = resolve;
      integration.onerror = resolve;
      document.head.appendChild(integration);
    });
  }

  let hideActiveTeaserOnOpen = null;
  let hideFabController = null;
  let revealFabController = null;
  let resetFabPosController = null;
  let getFabStateController = null;

  const CC_FAB_HIDDEN_KEY = 'cc_lumi_fab_hidden';
  const CC_FAB_HIDDEN_AT_KEY = 'cc_lumi_fab_hidden_at';
  const CC_FAB_UNREAD_AT_HIDE_KEY = 'cc_lumi_fab_unread_at_hide';
  const CC_FAB_POS_LEGACY_KEY = 'cc_lumi_fab_pos_v1';
  const CC_FAB_POS_KEY = 'cc_lumi_fab_pos_v2';

  function safeLsGet(key) {
    try { return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null; } catch (_) { return null; }
  }
  function safeLsSet(key, val) {
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(key, String(val)); } catch (_) {}
  }
  function safeLsRemove(key) {
    try { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); } catch (_) {}
  }

  function syncChatOverlayTopLayer(overlayEl, forceOpen, reorderDom) {
    const overlay = overlayEl || document.getElementById('ccGlobalChatOverlay');
    const unified = document.getElementById('ccUnifiedChatHost');
    const overlayOpen = typeof forceOpen === 'boolean' ? forceOpen : !!overlay?.classList?.contains('is-open');
    const unifiedOpen = !!unified && !unified.hidden;
    const anyOpen = overlayOpen || unifiedOpen;
    if (overlay && overlayOpen) {
      if (reorderDom && document.body && (overlay.parentElement !== document.body || overlay.nextElementSibling)) {
        document.body.appendChild(overlay);
        void overlay.offsetWidth;
      }
      overlay.style.setProperty('z-index', '2147483647', 'important');
    }
    document.documentElement?.classList?.toggle('cc-lumi-mess-open', anyOpen);
    document.body?.classList?.toggle('cc-lumi-mess-open', anyOpen);
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
      circleAvatar: '/images/chat/lumi_avatar_rut_circle.webp',
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
      circleAvatar: '/images/chat/lumi_avatar_lea_circle.webp',
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
      circleAvatar: '/images/chat/lumi_avatar_noemi_circle.webp',
      avatarFallback: '/images/chat/assistants/asystentka-3.jpg',
      greeting: 'Masz pytanie o radio, Biblię lub pomoc? Jestem tu dla Ciebie!',
      welcomeText: 'Pokój Boży! ✨ Nazywam się Noemi — jestem Asystentką Christian Culture i doradcą społeczności LUMINA.\n\nPomogę Ci w korzystaniu z interlinearnej Biblii, słuchowisk Biblia Audio i bezpośrednim kontakcie ze Sztabem CC.\n\nW czym mogę Ci służyć?'
    },
    {
      id: 'asystentka-4',
      name: 'Miriam · Uwielbienie CC',
      shortName: 'Miriam',
      role: 'Psalmy i uwielbienie',
      badge: 'Przewodniczka Słowa i Pieśni',
      avatar: '/images/chat/assistants/asystentka-4.webp',
      circleAvatar: '/images/chat/lumi_avatar_miriam_circle.webp',
      avatarFallback: '/images/chat/assistants/asystentka-4.jpg',
      greeting: 'Chwała Panu! 🎶 Posłuchajmy razem Psalmów, pieśni i rozważmy dzisiejsze Słowo.',
      welcomeText: 'Niech będzie pochwalony Pan! 🎶 Nazywam się Miriam — prowadzę w Christian Culture przez Psalmy, muzykę uwielbienia i codzienne rozważania.\n\nChętnie wskażę Ci Spiritual Sounds 24/7, Biblię Śpiewaną, listę topTEN i rozważanie dnia.\n\nCzego dziś szukasz?'
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
  // @007 (L0 23.11.2026): wysłana wiadomość pojawia się natychmiast ze statusem Wysyłanie → Wysłano → Przeczytali.
  const pendingPublicMessages = [];
  let lastPublicSeenMarkAt = 0;
  let chatMode = 'public'; // 'public' (Czat ogólny) | 'assistant' (3 Asystentki CC) | 'direct' (Rozmowy 1:1)
  const assistantHistories = {};
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
        right: max(16px, env(safe-area-inset-right)) !important;
        bottom: max(25px, env(safe-area-inset-bottom)) !important;
        width: 48px !important;
        height: 48px !important;
        z-index: 10000 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        pointer-events: auto !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        touch-action: none !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        -webkit-tap-highlight-color: transparent !important;
        transition: bottom 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      @media (min-width: 768px) {
        .cc-chat-fab-wrap:not(.is-custom-positioned) {
          right: 24px !important;
        }
      }
      .cc-chat-fab-wrap,
      .cc-chat-fab-wrap * {
        touch-action: none !important;
      }
      html.cc-fab-touch-dragging,
      html.cc-fab-touch-dragging body {
        touch-action: none !important;
        overscroll-behavior: none !important;
      }
      /* @007 (L0 23.11.2026): przy otwartym czacie przewija się tylko czat, nigdy strona pod nim. */
      html.cc-chat-scroll-lock,
      html.cc-chat-scroll-lock body {
        overflow: hidden !important;
        overscroll-behavior: none !important;
      }
      #ccGlobalChatOverlay,
      #ccGlobalChatOverlay .cc-chat-tab-panel,
      #ccGlobalChatOverlay .cc-chat-feed {
        overscroll-behavior: contain !important;
      }

      html[data-lumina-theme] .cc-chat-fab-wrap,
      body.theme-lumina-light .cc-chat-fab-wrap,
      body.lumina-page .cc-chat-fab-wrap,
      body:has(#luminaThemeSwitchBtn) .cc-chat-fab-wrap,
      body:has(#luminaScrollTop) .cc-chat-fab-wrap,
      html body.user-is-guest #ccGlobalChatFab {
        display: flex !important;
      }

      .cc-chat-fab-wrap.is-custom-positioned {
        right: auto !important;
        bottom: auto !important;
        transition: left 0.22s cubic-bezier(0.16, 1, 0.3, 1), top 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease !important;
      }

      .cc-chat-fab-wrap.is-fab-dragging {
        transition: none !important;
        z-index: 2147483645 !important;
      }

      .cc-chat-fab-wrap.is-fab-will-hide .cc-chat-fab-btn {
        transform: scale(0.84) !important;
        opacity: 0.72 !important;
        filter: drop-shadow(0 6px 18px rgba(239, 68, 68, 0.65)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6)) !important;
      }

      .cc-chat-fab-wrap.is-fab-hiding {
        pointer-events: none !important;
        opacity: 0 !important;
        transform: translateY(84px) scale(0.5) !important;
        transition: transform 0.24s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease !important;
      }

      html body #ccGlobalChatFab.is-fab-hidden,
      html[data-lumina-theme] body #ccGlobalChatFab.is-fab-hidden,
      body.theme-lumina-light #ccGlobalChatFab.is-fab-hidden,
      body.lumina-page #ccGlobalChatFab.is-fab-hidden,
      body:has(#luminaThemeSwitchBtn) #ccGlobalChatFab.is-fab-hidden,
      body:has(#luminaScrollTop) #ccGlobalChatFab.is-fab-hidden,
      html body.user-is-guest #ccGlobalChatFab.is-fab-hidden {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      @keyframes ccFabPopIn {
        0% { opacity: 0; transform: translateY(36px) scale(0.52); }
        68% { opacity: 1; transform: translateY(-5px) scale(1.09); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }

      .cc-chat-fab-wrap.is-fab-popping-in {
        animation: ccFabPopIn 0.44s cubic-bezier(0.22, 1, 0.36, 1) forwards !important;
      }

      .cc-chat-fab-btn {
        width: 48px !important;
        height: 48px !important;
        min-width: 48px !important;
        min-height: 48px !important;
        max-width: 48px !important;
        max-height: 48px !important;
        border-radius: 50% !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        background: transparent !important;
        cursor: grab !important;
        outline: none !important;
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        touch-action: none !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.22s ease !important;
        filter: drop-shadow(0 8px 22px rgba(133, 71, 216, 0.45)) drop-shadow(0 3px 10px rgba(0, 0, 0, 0.6)) !important;
      }
      .cc-chat-fab-btn picture {
        width: 100% !important;
        height: 100% !important;
        display: block !important;
      }

      .cc-chat-fab-wrap.is-fab-dragging .cc-chat-fab-btn {
        cursor: grabbing !important;
        transform: scale(1.08) !important;
        filter: drop-shadow(0 14px 30px rgba(133, 71, 216, 0.62)) drop-shadow(0 6px 16px rgba(0, 0, 0, 0.65)) !important;
      }

      @keyframes ccFabUnreadRing {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 122, 0, 0.82); }
        70% { transform: scale(1.2); box-shadow: 0 0 0 11px rgba(255, 122, 0, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 122, 0, 0); }
      }

      .cc-chat-fab-wrap.has-unread-message .cc-chat-fab-badge {
        background: #ff7a00 !important;
        animation: ccFabUnreadRing 1.7s ease-out infinite !important;
      }

      .cc-chat-fab-wrap.has-unread-message .cc-chat-fab-btn {
        filter: drop-shadow(0 0 14px rgba(255, 122, 0, 0.72)) drop-shadow(0 8px 22px rgba(133, 71, 216, 0.45)) !important;
      }

      .cc-fab-hide-dropzone {
        position: fixed !important;
        left: 50% !important;
        bottom: max(14px, env(safe-area-inset-bottom)) !important;
        transform: translate(-50%, 28px) scale(0.92) !important;
        z-index: 2147483644 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        padding: 9px 16px !important;
        border-radius: 999px !important;
        background: rgba(15, 16, 26, 0.9) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(196, 163, 90, 0.45) !important;
        color: #f8fafc !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        letter-spacing: 0.01em !important;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45) !important;
        pointer-events: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        white-space: nowrap !important;
        transition: opacity 0.18s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.18s ease, border-color 0.18s ease !important;
      }

      .cc-fab-hide-dropzone.is-visible {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translate(-50%, 0) scale(1) !important;
      }

      .cc-fab-hide-dropzone.is-armed {
        background: rgba(185, 28, 28, 0.94) !important;
        border-color: rgba(254, 202, 202, 0.85) !important;
        transform: translate(-50%, -2px) scale(1.05) !important;
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

      /* ── MOTYW STRONY GŁÓWNEJ CC (obsydian + szampańskie złoto #D4A94A + #FF7A00) ── */
      .cc-chat-fab-gold-icon,
      .cc-chat-header-gold-icon,
      .cc-nav-icon-svg {
        display: none !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .cc-chat-fab-gold-icon {
        width: 24px !important;
        height: 24px !important;
        color: #E8C97A !important;
      }
      .cc-chat-header-gold-icon {
        width: 22px !important;
        height: 22px !important;
        color: #E8C97A !important;
      }
      #ccGlobalChatFab.cc-chat-home-theme .cc-chat-fab-btn {
        background: radial-gradient(circle at 30% 28%, #1e1c18 0%, #0a0a0a 88%) !important;
        border: 1.5px solid rgba(212, 169, 74, 0.72) !important;
        filter: drop-shadow(0 8px 20px rgba(212, 169, 74, 0.35)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.75)) !important;
      }
      #ccGlobalChatFab.cc-chat-home-theme .cc-chat-fab-btn:hover {
        border-color: #FF7A00 !important;
        filter: drop-shadow(0 10px 26px rgba(255, 122, 0, 0.42)) drop-shadow(0 4px 14px rgba(212, 169, 74, 0.45)) !important;
      }
      #ccGlobalChatFab.cc-chat-home-theme .cc-chat-fab-btn picture {
        display: none !important;
      }
      #ccGlobalChatFab.cc-chat-home-theme .cc-chat-fab-gold-icon {
        display: inline-flex !important;
      }

      /* ── PRZYCISK CZATU CCN: DEDYKOWANY STYL KRWISTEJ CZERWIENI I WĘGLA DLA PORTALI CCN ── */
      #ccGlobalChatFab.cc-chat-ccn-theme {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        border-radius: 50% !important;
      }
      #ccGlobalChatFab.cc-chat-ccn-theme .cc-chat-fab-btn {
        background: radial-gradient(circle at 30% 28%, #221215 0%, #0a0a0a 88%) !important;
        border: 1.5px solid rgba(187, 20, 46, 0.85) !important;
        filter: drop-shadow(0 8px 20px rgba(187, 20, 46, 0.42)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.85)) !important;
      }
      #ccGlobalChatFab.cc-chat-ccn-theme .cc-chat-fab-btn:hover {
        border-color: #f9282b !important;
        filter: drop-shadow(0 10px 26px rgba(249, 40, 43, 0.55)) drop-shadow(0 4px 14px rgba(187, 20, 46, 0.50)) !important;
      }
      #ccGlobalChatFab.cc-chat-ccn-theme .cc-chat-fab-btn picture {
        display: none !important;
      }
      #ccGlobalChatFab.cc-chat-ccn-theme .cc-chat-fab-gold-icon {
        display: inline-flex !important;
        color: #f9282b !important;
      }
      #ccGlobalChatFab.cc-chat-ccn-theme .cc-chat-fab-gold-icon svg {
        stroke: #f9282b !important;
        filter: drop-shadow(0 0 5px rgba(249, 40, 43, 0.65)) !important;
      }
      #ccGlobalChatFab.cc-chat-ccn-theme .cc-chat-fab-badge {
        background: #10b981 !important;
        border-color: #0a0a0a !important;
      }
      #ccGlobalChatFab.cc-chat-ccn-theme .cc-chat-teaser-bubble {
        background: linear-gradient(145deg, rgba(20, 18, 19, 0.98), rgba(10, 10, 10, 0.99)) !important;
        border: 1.5px solid rgba(187, 20, 46, 0.55) !important;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.85), 0 0 24px rgba(187, 20, 46, 0.28) !important;
        color: #f4f4f5 !important;
      }
      #ccGlobalChatFab.cc-chat-ccn-theme .cc-chat-teaser-name {
        color: #f9282b !important;
      }
      #ccGlobalChatFab.cc-chat-ccn-theme .cc-chat-teaser-msg {
        color: #d4d4d8 !important;
      }
      #ccGlobalChatFab.cc-chat-ccn-theme .cc-chat-teaser-cta {
        color: #f9282b !important;
      }
      #ccGlobalChatFab.cc-chat-ccn-theme .cc-chat-teaser-online {
        background: #10b981 !important;
        border-color: #0a0a0a !important;
      }

      /* ── DYMEK ZACZEPKA: ROTACJA ASYSTENTEK (ADAPTACYJNY DO KOLORÓW STRONY) ── */
      .cc-chat-teaser-bubble {
        position: absolute !important;
        bottom: calc(100% + 14px) !important;
        right: 0 !important;
        width: 290px !important;
        max-width: calc(100vw - 36px) !important;
        background: var(--cc-teaser-bg, linear-gradient(145deg, rgba(21, 25, 43, 0.98), rgba(13, 16, 32, 0.98))) !important;
        border: 1px solid var(--cc-teaser-border, var(--lumi-border)) !important;
        border-radius: 20px !important;
        padding: 12px 14px !important;
        box-shadow: var(--cc-teaser-shadow, 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(133, 71, 216, 0.25)) !important;
        backdrop-filter: blur(14px) !important;
        -webkit-backdrop-filter: blur(14px) !important;
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        cursor: pointer !important;
        color: var(--cc-teaser-text, var(--lumi-text-main)) !important;
        font-family: inherit !important;
        z-index: 10001 !important;
        opacity: 1 !important;
        transform: translateY(0) !important;
        transition: opacity 0.28s ease, transform 0.28s ease, background 0.25s ease, border-color 0.25s ease !important;
      }

      .cc-chat-teaser-bubble.is-fading {
        opacity: 0 !important;
        transform: translateY(8px) !important;
        pointer-events: none !important;
      }

      .cc-chat-teaser-bubble.is-hidden {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }

      .cc-chat-teaser-bubble:hover {
        border-color: var(--cc-teaser-ring, var(--lumi-gold)) !important;
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
        border: 2px solid var(--cc-teaser-ring, var(--lumi-gold)) !important;
        background: var(--cc-teaser-avatar-bg, #15192B) !important;
      }

      .cc-chat-teaser-online {
        position: absolute !important;
        right: -1px !important;
        bottom: -1px !important;
        width: 11px !important;
        height: 11px !important;
        background: var(--lumi-status-online) !important;
        border: 2px solid var(--cc-teaser-badge-border, var(--lumi-bg-panel)) !important;
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
        color: var(--cc-teaser-text, var(--lumi-text-main)) !important;
      }

      .cc-chat-teaser-msg {
        font-size: 0.76rem !important;
        color: var(--cc-teaser-muted, var(--lumi-text-muted)) !important;
      }

      .cc-chat-teaser-cta {
        font-size: 0.72rem !important;
        color: var(--cc-teaser-cta, var(--lumi-gold-light)) !important;
        font-weight: 600 !important;
        margin-top: 2px !important;
      }

      .cc-chat-teaser-close {
        position: absolute !important;
        top: 0 !important;
        right: 0 !important;
        width: 44px !important;
        height: 44px !important;
        min-width: 44px !important;
        min-height: 44px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: none !important;
        border: none !important;
        color: var(--cc-teaser-muted, var(--lumi-text-muted)) !important;
        font-size: 14px !important;
        cursor: pointer !important;
        padding: 0 !important;
        line-height: 1 !important;
        touch-action: manipulation !important;
      }

      #ccGlobalChatFab.cc-teaser-align-left .cc-chat-teaser-bubble,
      #ccGlobalChatFab.cc-teaser-align-left #ccChatTeaserBubble {
        right: auto !important;
        left: 0 !important;
        transform-origin: bottom left !important;
      }

      #ccGlobalChatFab.cc-teaser-below .cc-chat-teaser-bubble,
      #ccGlobalChatFab.cc-teaser-below #ccChatTeaserBubble {
        bottom: auto !important;
        top: 62px !important;
      }

      /* ── OKNO GŁÓWNE CZATU LUMI MESSENGER 2.0 (PREMIUM 1:1 FIDELITY) ── */
      .cc-chat-drawer-overlay {
        position: fixed !important;
        inset: 0 !important;
        background: rgba(4, 6, 14, 0.72) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        z-index: 2147483647 !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        transition: opacity 0.25s ease, visibility 0.25s !important;
        display: flex !important;
        align-items: flex-end !important;
        justify-content: flex-end !important;
      }

      .cc-chat-drawer-overlay.is-open {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        z-index: 2147483647 !important;
      }

      html.cc-lumi-mess-open #ccGlobalChatFab,
      html.cc-lumi-mess-open body #ccGlobalChatFab,
      html.cc-lumi-mess-open body:has(#luminaThemeSwitchBtn) #ccGlobalChatFab,
      html.cc-lumi-mess-open #ccFloatingTopBarWrap,
      html.cc-lumi-mess-open body #ccFloatingTopBarWrap,
      html.cc-lumi-mess-open .cc-floating-topbar-wrap,
      html.cc-lumi-mess-open #ccTopBarFavBtn,
      html.cc-lumi-mess-open #ccFabDockToggle,
      html.cc-lumi-mess-open #backToTopBtn,
      html.cc-lumi-mess-open body #backToTopBtn,
      html.cc-lumi-mess-open body:has(#luminaThemeSwitchBtn) #backToTopBtn,
      html.cc-lumi-mess-open #luminaThemeSwitchBtn,
      html.cc-lumi-mess-open body #luminaThemeSwitchBtn,
      html.cc-lumi-mess-open body:has(#luminaThemeSwitchBtn) #luminaThemeSwitchBtn,
      html.cc-lumi-mess-open #ccEdgePlusBtn,
      html.cc-lumi-mess-open .lumina-scroll-top-btn,
      html.cc-lumi-mess-open .ekocc-info-trigger,
      html.cc-lumi-mess-open #luminaMiniPlayerContainer,
      html.cc-lumi-mess-open body #luminaMiniPlayerContainer,
      html.cc-lumi-mess-open body #luminaMiniPlayerContainer.minimized,
      html.cc-lumi-mess-open body:has(#luminaThemeSwitchBtn) #luminaMiniPlayerContainer,
      html.cc-lumi-mess-open body:has(#luminaThemeSwitchBtn) #luminaMiniPlayerContainer.minimized {
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }

      html.cc-lumi-mess-open .lumina-nav,
      html.cc-lumi-mess-open .lumina-mobile-nav,
      html.cc-lumi-mess-open .bottom-nav-container,
      html.cc-lumi-mess-open #mainHeader,
      html.cc-lumi-mess-open .shorts-header,
      html.cc-lumi-mess-open #sideDrawer {
        pointer-events: none !important;
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
        z-index: 2147483647 !important;
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
        width: 44px !important;
        height: 44px !important;
        min-width: 44px !important;
        min-height: 44px !important;
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
        touch-action: manipulation !important;
      }

      .cc-chat-icon-btn:hover,
      .cc-chat-icon-btn.is-active {
        background: rgba(133, 71, 216, 0.28) !important;
        border-color: #D8AD57 !important;
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
        background: #FF7A00 !important;
        color: #FFFFFF !important;
        font-size: 0.74rem !important;
        font-weight: 750 !important;
        border: none !important;
        border-radius: 999px !important;
        min-width: 44px !important;
        min-height: 44px !important;
        padding: 0 14px !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 5px !important;
        transition: all 0.18s ease !important;
        white-space: nowrap !important;
        touch-action: manipulation !important;
      }

      .cc-chat-radio-play-btn:hover {
        background: #FF8C33 !important;
        transform: scale(1.03) !important;
      }

      .cc-chat-radio-play-btn:active {
        background: #E66A00 !important;
      }

      .cc-chat-radio-play-btn:hover {
        transform: scale(1.03) !important;
        filter: brightness(1.08) !important;
      }

      /* ── 3. NAWIGACJA (5 ZAKŁADEK 1:1) ── */
      .cc-chat-nav-tabs {
        display: grid !important;
        grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
        width: 100% !important;
        margin: 0 !important;
        gap: 5px !important;
        padding: 6px 12px !important;
        background: #0D1020 !important;
        border-bottom: 1px solid rgba(196, 163, 90, 0.2) !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-nav-tab {
        min-width: 0 !important;
        min-height: 44px !important;
        padding: 4px 2px !important;
        border-radius: 12px !important;
        border: 1px solid rgba(255, 255, 255, 0.06) !important;
        background: #141B2D !important;
        color: #A5AEC4 !important;
        font-family: inherit !important;
        font-size: 0.7rem !important;
        font-weight: 600 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 2px !important;
        cursor: pointer !important;
        transition: all 0.18s ease !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .cc-chat-nav-tab:hover {
        color: #F7F8FC !important;
        border-color: rgba(196, 163, 90, 0.45) !important;
      }

      .cc-chat-nav-tab.is-active {
        background: linear-gradient(135deg, rgba(196, 163, 90, 0.26), rgba(196, 163, 90, 0.08)) !important;
        border: 1px solid #C4A35A !important;
        color: #E2CC9A !important;
        font-weight: 700 !important;
        box-shadow: 0 4px 12px rgba(196, 163, 90, 0.18) !important;
      }

      /* ── DOMYŚLNIE ZWINIĘTE PASKI NARZĘDZIOWE (OTWIERANE PRZYCISKIEM WIĘCEJ •••) ── */
      .cc-chat-drawer:not(.cc-bars-expanded) .cc-chat-mini-player,
      .cc-chat-drawer:not(.cc-bars-expanded) .cc-chat-nav-tabs,
      .cc-chat-drawer:not(.cc-bars-expanded) .cc-chat-mode-bar,
      .cc-chat-drawer:not(.cc-bars-expanded) .cc-asst-picker-strip,
      .cc-chat-drawer:not(.cc-bars-expanded) #ccChatNotifBtn,
      .cc-chat-drawer:not(.cc-bars-expanded) #ccChatSettingsBtn,
      .cc-chat-drawer .cc-chat-asst-showcase {
        display: none !important;
      }

      .cc-more-drawer-toggle-btn[aria-expanded="true"] {
        background: #C4A35A !important;
        color: #090D16 !important;
        border-color: #D4B578 !important;
      }

      .cc-chat-feed {
        scrollbar-width: thin !important;
        scrollbar-color: rgba(196, 163, 90, 0.38) transparent !important;
      }
      .cc-chat-feed::-webkit-scrollbar {
        width: 5px !important;
      }
      .cc-chat-feed::-webkit-scrollbar-thumb {
        background: rgba(196, 163, 90, 0.38) !important;
        border-radius: 999px !important;
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

      /* ── PODZIAŁ CZATU: CZAT OGÓLNY vs 3 ASYSTENTKI CC ── */
      .cc-chat-mode-bar {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        padding: 8px 14px 6px 14px !important;
        background: #0D1020 !important;
        border-bottom: 1px solid rgba(52, 58, 80, 0.55) !important;
        flex-shrink: 0 !important;
      }

      .cc-mode-tab-btn {
        flex: 1 1 0 !important;
        min-height: 44px !important;
        padding: 6px 10px !important;
        border-radius: 12px !important;
        border: 1px solid #343A50 !important;
        background: #15192B !important;
        color: #A5AEC4 !important;
        font-size: 0.8rem !important;
        font-weight: 700 !important;
        font-family: inherit !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 6px !important;
        cursor: pointer !important;
        transition: all 0.18s ease !important;
        white-space: nowrap !important;
      }

      .cc-mode-tab-btn:hover {
        color: #FFFFFF !important;
        border-color: rgba(216, 173, 87, 0.55) !important;
      }

      .cc-mode-tab-btn.is-active {
        background: linear-gradient(135deg, rgba(133, 71, 216, 0.38), rgba(216, 173, 87, 0.22)) !important;
        border-color: #D8AD57 !important;
        color: #FFFFFF !important;
        box-shadow: 0 2px 12px rgba(133, 71, 216, 0.28) !important;
      }

      .cc-asst-picker-strip {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        align-items: stretch !important;
        gap: 6px !important;
        padding: 8px 14px !important;
        background: rgba(21, 25, 43, 0.92) !important;
        border-bottom: 1px solid rgba(133, 71, 216, 0.35) !important;
        flex-shrink: 0 !important;
      }

      @container lumiChat (min-width: 560px) {
        .cc-asst-picker-strip {
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        }
      }

      .cc-asst-picker-strip[hidden],
      .cc-section-hidden {
        display: none !important;
      }

      .cc-asst-pick-btn {
        flex: 1 1 0 !important;
        min-height: 44px !important;
        min-width: 0 !important;
        padding: 5px 8px !important;
        border-radius: 12px !important;
        border: 1.5px solid #343A50 !important;
        background: #1D2235 !important;
        color: #E2E8F0 !important;
        display: flex !important;
        align-items: center !important;
        gap: 7px !important;
        cursor: pointer !important;
        text-align: left !important;
        font-family: inherit !important;
        transition: all 0.18s ease !important;
      }

      .cc-asst-pick-btn:hover {
        border-color: rgba(216, 173, 87, 0.65) !important;
        background: rgba(29, 34, 53, 0.95) !important;
      }

      .cc-asst-pick-btn.is-active {
        border-color: #D8AD57 !important;
        background: linear-gradient(135deg, rgba(133, 71, 216, 0.35), rgba(216, 173, 87, 0.22)) !important;
        color: #FFFFFF !important;
        box-shadow: 0 2px 10px rgba(216, 173, 87, 0.25) !important;
      }

      .cc-asst-pick-avatar-wrap {
        position: relative !important;
        width: 30px !important;
        height: 30px !important;
        flex-shrink: 0 !important;
      }

      .cc-asst-pick-avatar {
        width: 30px !important;
        height: 30px !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        border: 1.5px solid rgba(216, 173, 87, 0.7) !important;
        display: block !important;
      }

      .cc-asst-pick-dot {
        position: absolute !important;
        right: -1px !important;
        bottom: -1px !important;
        width: 8px !important;
        height: 8px !important;
        border-radius: 50% !important;
        background: #20C997 !important;
        border: 1.5px solid #1D2235 !important;
      }

      .cc-asst-pick-meta {
        display: flex !important;
        flex-direction: column !important;
        min-width: 0 !important;
        line-height: 1.15 !important;
      }

      .cc-asst-pick-name {
        font-size: 0.78rem !important;
        font-weight: 800 !important;
        color: #FFFFFF !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .cc-asst-pick-role {
        font-size: 0.64rem !important;
        color: #A5AEC4 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .cc-public-mode-header {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 8px !important;
        padding: 8px 10px !important;
        margin: 4px 0 6px 0 !important;
        border-radius: 12px !important;
        background: rgba(21, 25, 43, 0.9) !important;
        border: 1px solid rgba(52, 58, 80, 0.75) !important;
      }

      .cc-public-mode-title {
        font-size: 0.82rem !important;
        font-weight: 700 !important;
        color: #F7F8FC !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        min-width: 0 !important;
      }

      .cc-public-back-btn {
        min-height: 44px !important;
        padding: 4px 12px !important;
        border-radius: 999px !important;
        border: 1px solid rgba(216, 173, 87, 0.5) !important;
        background: rgba(216, 173, 87, 0.12) !important;
        color: #F2D17C !important;
        font-size: 0.73rem !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        white-space: nowrap !important;
      }

      #ccPublicDailyDialogue.is-collapsed {
        padding: 10px 12px !important;
        position: sticky !important;
        top: 0 !important;
        z-index: 6 !important;
        background-color: #0E1224 !important;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.55) !important;
      }
      #ccPublicDailyDialogue .cc-daily-dialogue-tab {
        display: none !important;
      }
      #ccGlobalChatOverlay[class] #ccPublicDailyDialogue.is-mini,
      #ccPublicDailyDialogue.is-mini {
        background: transparent !important;
        background-color: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 0 4px auto !important;
        width: max-content !important;
        align-self: flex-end !important;
      }
      #ccPublicDailyDialogue.is-mini > :not(.cc-daily-dialogue-tab) {
        display: none !important;
      }
      #ccPublicDailyDialogue.is-mini .cc-daily-dialogue-tab {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        min-height: 44px !important;
        padding: 0 16px !important;
        border: 0 !important;
        border-radius: 0 0 14px 14px !important;
        background: linear-gradient(180deg, #ff3b3b, #c8101a) !important;
        color: #fff !important;
        font-size: 0.82rem !important;
        font-weight: 800 !important;
        letter-spacing: 0.02em !important;
        box-shadow: 0 6px 16px rgba(200, 16, 26, 0.45) !important;
        cursor: pointer !important;
      }
      @media (prefers-reduced-motion: no-preference) {
        #ccPublicDailyDialogue.is-mini .cc-daily-dialogue-tab { animation: ccDailyTabIn .35s ease-out; }
        @keyframes ccDailyTabIn { from { transform: translateY(-100%); opacity: 0; } to { transform: none; opacity: 1; } }
      }
      #ccPublicDailyDialogue .cc-daily-dialogue-close-bottom {
        width: 100% !important;
        min-height: 44px !important;
        margin-top: 8px !important;
        border-radius: 12px !important;
        border: 1px solid rgba(216, 173, 87, 0.45) !important;
        background: rgba(216, 173, 87, 0.1) !important;
        color: #F2D17C !important;
        font-size: 0.8rem !important;
        font-weight: 700 !important;
        cursor: pointer !important;
      }

      .cc-daily-dialogue-header {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px !important;
        cursor: pointer !important;
      }

      .cc-daily-dialogue-hosts {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        margin-top: 6px !important;
        min-width: 0 !important;
      }

      .cc-daily-dialogue-avatars {
        display: inline-flex !important;
        align-items: center !important;
        flex-shrink: 0 !important;
      }

      .cc-daily-dialogue-host-avatar {
        width: 28px !important;
        height: 28px !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        border: 1.5px solid #D8AD57 !important;
        background: #14182E !important;
        flex-shrink: 0 !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45) !important;
        position: relative !important;
      }

      .cc-daily-dialogue-host-avatar + .cc-daily-dialogue-host-avatar {
        margin-left: -7px !important;
      }

      .cc-daily-dialogue-host-names {
        font-size: 0.72rem !important;
        color: #B8C0D4 !important;
        font-weight: 600 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        min-width: 0 !important;
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
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        cursor: pointer !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      .cc-hotspot:hover,
      .cc-hotspot:focus,
      .cc-hotspot:focus-visible,
      .cc-hotspot:active {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
      }

      .cc-trio-card,
      .cc-trio-card:hover,
      .cc-trio-card:focus,
      .cc-trio-card.is-active,
      .cc-hotspot-pill1,
      .cc-hotspot-pill2,
      .cc-hotspot-pill3,
      .cc-hotspot-pill1:hover,
      .cc-hotspot-pill2:hover,
      .cc-hotspot-pill3:hover {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
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
        min-width: 0 !important;
      }
      /* @007 (L0 23.11.2026): pole pisania może się zwężać — „Wyślij” zawsze mieści się na ekranie */
      #ccGlobalChatOverlay .cc-composer-input-wrap {
        min-width: 0 !important;
        flex: 1 1 auto !important;
      }
      #ccGlobalChatOverlay .cc-composer-textarea {
        min-width: 0 !important;
        width: 100% !important;
        font-size: 0.9rem !important;
      }
      @media (max-width: 420px) {
        #ccGlobalChatOverlay .cc-chat-composer-form { gap: 6px !important; }
        #ccGlobalChatOverlay .cc-composer-send-btn { padding: 0 12px !important; }
      }
      /* Menu pod „+”: czytelny panel z dużymi pozycjami */
      #ccGlobalChatOverlay .cc-composer-popover {
        position: absolute !important;
        left: 12px !important;
        right: 12px !important;
        bottom: calc(100% + 8px) !important;
        display: grid !important;
        gap: 6px !important;
        padding: 10px !important;
        border-radius: 18px !important;
        background: #141A30 !important;
        border: 1px solid rgba(216, 173, 87, 0.45) !important;
        box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.6) !important;
        z-index: 30 !important;
        max-width: 460px !important;
      }
      #ccGlobalChatOverlay .cc-composer-popover[hidden] {
        display: none !important;
      }
      #ccGlobalChatOverlay .cc-popover-item {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        width: 100% !important;
        min-height: 52px !important;
        padding: 10px 16px !important;
        border-radius: 12px !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        background: rgba(255, 255, 255, 0.04) !important;
        color: #F7F8FC !important;
        font-size: 1rem !important;
        font-weight: 600 !important;
        text-align: left !important;
        cursor: pointer !important;
        touch-action: manipulation !important;
      }
      #ccGlobalChatOverlay .cc-popover-item:hover,
      #ccGlobalChatOverlay .cc-popover-item:focus-visible {
        background: rgba(216, 173, 87, 0.16) !important;
        border-color: rgba(216, 173, 87, 0.55) !important;
        outline: none !important;
      }

      .cc-composer-plus-btn {
        width: 44px !important;
        height: 44px !important;
        min-width: 44px !important;
        min-height: 44px !important;
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
        touch-action: manipulation !important;
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
        font-size: 0.8rem !important;
        flex: 1 !important;
        resize: none !important;
        overflow-y: hidden !important;
        height: 22px !important;
        max-height: 84px !important;
        line-height: 22px !important;
        padding: 0 !important;
      }

      .cc-composer-textarea::placeholder {
        color: #7E88A2 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .cc-composer-mic-btn {
        background: transparent !important;
        border: none !important;
        color: #A5AEC4 !important;
        cursor: pointer !important;
        min-width: 44px !important;
        min-height: 44px !important;
        padding: 4px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 1.1rem !important;
        flex-shrink: 0 !important;
        transition: color 0.18s ease !important;
        touch-action: manipulation !important;
      }

      .cc-composer-mic-btn:hover {
        color: #FFFFFF !important;
      }

      .cc-composer-send-btn {
        background: #FF7A00 !important;
        color: #FFFFFF !important;
        font-weight: 750 !important;
        font-size: 0.82rem !important;
        border: none !important;
        border-radius: 999px !important;
        padding: 0 16px !important;
        min-width: 44px !important;
        min-height: 44px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 6px !important;
        cursor: pointer !important;
        flex-shrink: 0 !important;
        box-shadow: 0 2px 10px rgba(255, 122, 0, 0.35) !important;
        transition: transform 0.18s ease, filter 0.18s ease, background 0.18s ease !important;
        touch-action: manipulation !important;
      }

      .cc-composer-send-btn:hover {
        background: #FF8C33 !important;
        transform: scale(1.02) !important;
        filter: brightness(1.06) !important;
      }

      .cc-composer-send-btn:active {
        background: #E66A00 !important;
      }

      .cc-composer-send-btn:hover {
        transform: scale(1.02) !important;
        filter: brightness(1.06) !important;
      }
      
      /* ── 5.1 WIADOMOŚCI CZATU (BUBBLES & ROWS) ── */
      .cc-chat-msg-row {
        display: flex !important;
        gap: 10px !important;
        margin-bottom: 12px !important;
        align-items: flex-start !important;
        animation: ccFadeIn 0.2s ease !important;
      }

      .cc-chat-msg-row.is-user {
        flex-direction: row-reverse !important;
      }

      .cc-chat-msg-avatar {
        width: 38px !important;
        height: 38px !important;
        min-width: 38px !important;
        min-height: 38px !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        border: 1.5px solid #D8AD57 !important;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4) !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-msg-content {
        max-width: 82% !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 4px !important;
      }

      .cc-chat-msg-row.is-user .cc-chat-msg-content {
        align-items: flex-end !important;
      }

      .cc-chat-msg-meta {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        font-size: 0.72rem !important;
        color: #A5AEC4 !important;
      }

      .cc-chat-msg-sender {
        font-weight: 700 !important;
        color: #F2D17C !important;
      }

      .cc-chat-msg-row.is-user .cc-chat-msg-sender {
        color: #B475F5 !important;
      }

      .cc-chat-msg-bubble {
        background: #1D2235 !important;
        border: 1px solid #343A50 !important;
        border-radius: 16px !important;
        border-top-left-radius: 4px !important;
        padding: 10px 14px !important;
        font-size: 0.84rem !important;
        line-height: 1.45 !important;
        color: #F7F8FC !important;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25) !important;
        word-break: break-word !important;
      }

      .cc-chat-msg-row.is-user .cc-chat-msg-bubble {
        background: linear-gradient(135deg, rgba(196, 163, 90, 0.28) 0%, rgba(160, 128, 64, 0.22) 100%) !important;
        border: 1px solid #C4A35A !important;
        border-radius: 16px !important;
        border-top-right-radius: 4px !important;
        color: #FFFFFF !important;
      }

      .cc-showcase-pill {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 5px !important;
        min-width: 44px !important;
        min-height: 44px !important;
        background: rgba(29, 34, 53, 0.9) !important;
        border: 1px solid rgba(216, 173, 87, 0.4) !important;
        border-radius: 999px !important;
        padding: 6px 14px !important;
        font-size: 0.78rem !important;
        font-weight: 600 !important;
        color: #F2D17C !important;
        cursor: pointer !important;
        text-decoration: none !important;
        transition: all 0.18s ease !important;
        touch-action: manipulation !important;
      }

      .cc-showcase-pill:hover {
        background: rgba(216, 173, 87, 0.2) !important;
        border-color: #F2D17C !important;
        transform: translateY(-1px) !important;
      }

      .cc-showcase-pill.is-primary {
        background: rgba(133, 71, 216, 0.3) !important;
        border-color: rgba(180, 117, 245, 0.6) !important;
        color: #FFFFFF !important;
      }

      .cc-showcase-pill.is-primary:hover {
        background: rgba(133, 71, 216, 0.5) !important;
        border-color: #B475F5 !important;
      }

      /* ── 4.1 PANELE ZAKŁADEK I KARTY ── */
      .cc-tab-content-wrap {
        padding: 14px !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 10px !important;
        background: #0D1020 !important;
      }

      .cc-section-headline {
        font-size: 0.98rem !important;
        font-weight: 700 !important;
        color: #FFFFFF !important;
        margin: 0 0 2px 0 !important;
        letter-spacing: -0.01em !important;
      }

      .cc-card-item {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        background: #1D2235 !important;
        border: 1px solid #343A50 !important;
        border-radius: 14px !important;
        padding: 10px 14px !important;
        text-decoration: none !important;
        color: #F7F8FC !important;
        cursor: pointer !important;
        transition: all 0.18s ease !important;
        min-height: 52px !important;
        box-sizing: border-box !important;
      }

      .cc-card-item:hover {
        background: #252C44 !important;
        border-color: rgba(216, 173, 87, 0.45) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35) !important;
      }

      .cc-card-icon {
        width: 40px !important;
        height: 40px !important;
        border-radius: 12px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 1.25rem !important;
        flex-shrink: 0 !important;
      }

      .cc-card-info {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 2px !important;
        min-width: 0 !important;
      }

      .cc-card-title {
        font-size: 0.88rem !important;
        font-weight: 700 !important;
        color: #FFFFFF !important;
        line-height: 1.25 !important;
      }

      .cc-card-sub {
        font-size: 0.73rem !important;
        color: #A5AEC4 !important;
        line-height: 1.3 !important;
      }

      .cc-chat-search-wrap {
        margin-bottom: 8px !important;
      }

      .cc-chat-search-input {
        width: 100% !important;
        background: #15192B !important;
        border: 1px solid rgba(216, 173, 87, 0.45) !important;
        border-radius: 999px !important;
        padding: 10px 16px !important;
        font-size: 0.82rem !important;
        font-family: inherit !important;
        color: #FFFFFF !important;
        outline: none !important;
        box-sizing: border-box !important;
        transition: border-color 0.18s ease, box-shadow 0.18s ease !important;
      }

      .cc-chat-search-input:focus {
        border-color: #F2D17C !important;
        box-shadow: 0 0 10px rgba(242, 209, 124, 0.25) !important;
      }

      .cc-chat-search-input::placeholder {
        color: #7E88A2 !important;
      }

      /* ── RESPONSYWNOŚĆ MOBILE (320-768px) ── */
      @media (max-width: 768px) {
        .cc-chat-drawer {
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          max-width: 100vw !important;
          height: var(--lumi-viewport-height, 100dvh) !important;
          max-height: var(--lumi-viewport-height, 100dvh) !important;
          border-radius: 0 !important;
          border: none !important;
        }
        .cc-composer-textarea {
          font-size: 16px !important;
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

      /* ── MOTYW STRONY GŁÓWNEJ CC: PEŁNA HARMONIA WĘGLOWA CZERŃ (#0A0A0A / #141414) + ZŁOTO (#D4A94A) + #FF7A00 ── */
      #ccGlobalChatOverlay.cc-chat-home-theme {
        --lumi-bg-main: #0A0A0A;
        --lumi-bg-panel: #101010;
        --lumi-card-surface: #151514;
        --lumi-accent: #D4A94A;
        --lumi-accent-light: #E8C97A;
        --lumi-border: rgba(212, 169, 74, 0.28);
        --lumi-text-muted: #B6AFA0;
        background: rgba(5, 5, 5, 0.80) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-drawer {
        background: #0A0A0A !important;
        border: 1px solid rgba(212, 169, 74, 0.44) !important;
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.94), 0 0 40px rgba(212, 169, 74, 0.16), inset 0 1px 0 rgba(232, 201, 122, 0.18) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-header {
        background: #0E0E0D !important;
        border-bottom: 1px solid rgba(212, 169, 74, 0.16) !important;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.55) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-header-logo-wrap {
        background: radial-gradient(circle at 30% 28%, #1e1c18 0%, #0a0a0a 88%) !important;
        border: 1.5px solid rgba(212, 169, 74, 0.75) !important;
        box-shadow: 0 0 14px rgba(212, 169, 74, 0.30) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme #ccChatHeaderPartnerAvatar {
        display: none !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-header-gold-icon,
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-nav-icon-svg {
        display: inline-flex !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-nav-icon-emoji {
        display: none !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-icon-btn {
        background: #151514 !important;
        border-color: rgba(212, 169, 74, 0.24) !important;
        color: #C7BFA9 !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-icon-btn:hover,
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-icon-btn.is-active {
        background: rgba(212, 169, 74, 0.20) !important;
        border-color: #E8C97A !important;
        color: #FFFFFF !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-more-drawer-toggle-btn[aria-expanded="true"] {
        background: #D4A94A !important;
        color: #0A0A0A !important;
        border-color: #E8C97A !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-mini-player {
        background: #131312 !important;
        border-color: rgba(212, 169, 74, 0.28) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-radio-glyph,
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-radio-eq span {
        color: #E8C97A !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-radio-eq span {
        background: #E8C97A !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-nav-tabs {
        background: #0E0E0D !important;
        border-bottom: 1px solid rgba(212, 169, 74, 0.20) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-nav-tab {
        background: #141413 !important;
        border-color: rgba(212, 169, 74, 0.16) !important;
        color: #B4AC9B !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-nav-tab:hover {
        border-color: rgba(212, 169, 74, 0.45) !important;
        color: #FFFFFF !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-nav-tab.is-active {
        background: linear-gradient(135deg, rgba(212, 169, 74, 0.26), rgba(255, 122, 0, 0.10)) !important;
        border-color: #D4A94A !important;
        color: #F2D17C !important;
        box-shadow: 0 4px 12px rgba(212, 169, 74, 0.18) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-tab-panel,
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-tab-content-wrap {
        background: #0A0A0A !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-mode-bar {
        background: #0E0E0D !important;
        border-bottom-color: rgba(212, 169, 74, 0.20) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-mode-tab-btn {
        background: #151514 !important;
        border-color: rgba(212, 169, 74, 0.20) !important;
        color: #B9B1A0 !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-mode-tab-btn:hover {
        border-color: rgba(212, 169, 74, 0.50) !important;
        color: #FFFFFF !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-mode-tab-btn.is-active {
        background: linear-gradient(135deg, rgba(212, 169, 74, 0.26), rgba(255, 122, 0, 0.14)) !important;
        border-color: #D4A94A !important;
        color: #FFFDF7 !important;
        box-shadow: 0 2px 14px rgba(212, 169, 74, 0.24) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-asst-picker-strip {
        background: #0E0E0D !important;
        border-bottom: 1px solid rgba(212, 169, 74, 0.26) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-asst-pick-btn {
        background: #151514 !important;
        border-color: rgba(212, 169, 74, 0.20) !important;
        color: #EFEAE0 !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-asst-pick-btn:hover {
        background: #1C1B19 !important;
        border-color: rgba(212, 169, 74, 0.55) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-asst-pick-btn.is-active {
        background: linear-gradient(135deg, rgba(212, 169, 74, 0.22), rgba(255, 122, 0, 0.10)) !important;
        border-color: #E8C97A !important;
        box-shadow: 0 2px 12px rgba(212, 169, 74, 0.22) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-lumi-divider {
        background: linear-gradient(90deg, transparent, rgba(212, 169, 74, 0.35) 22%, #E8C97A 50%, rgba(212, 169, 74, 0.35) 78%, transparent) !important;
        box-shadow: 0 0 8px rgba(212, 169, 74, 0.38) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-active-asst-avatar {
        border-color: #D4A94A !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-active-asst-dot,
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-asst-pick-dot {
        border-color: #0A0A0A !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-asst-welcome-bubble {
        background: rgba(20, 19, 17, 0.96) !important;
        border: 1px solid rgba(212, 169, 74, 0.40) !important;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.55), 0 0 18px rgba(212, 169, 74, 0.08) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-welcome-art-wrap,
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-qc-thumb-wrap {
        border: 1px solid rgba(212, 169, 74, 0.26) !important;
        background: #101010 !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-welcome-art-img,
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-qc-thumb-img {
        filter: sepia(0.28) saturate(1.08) contrast(1.06) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-quick-card,
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-card-item {
        background: #131312 !important;
        border-color: rgba(212, 169, 74, 0.22) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-quick-card:hover,
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-card-item:hover {
        background: #1B1A18 !important;
        border-color: #D4A94A !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-public-mode-header {
        background: #131312 !important;
        border-color: rgba(212, 169, 74, 0.26) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme #ccPublicDailyDialogue {
        background: linear-gradient(145deg, rgba(22, 21, 19, 0.97), rgba(11, 11, 10, 0.99)) !important;
        border-color: rgba(212, 169, 74, 0.38) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme #ccPublicDailyDialogue .cc-daily-dialogue-turn {
        background: rgba(12, 12, 11, 0.88) !important;
        border-color: rgba(212, 169, 74, 0.16) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme #ccPublicDailyDialogue .cc-daily-dialogue-host-avatar {
        border-color: #D4A94A !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-msg-bubble {
        background: #151514 !important;
        border-color: rgba(212, 169, 74, 0.22) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-msg-row.is-me .cc-chat-msg-bubble,
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-msg-row.is-user .cc-chat-msg-bubble {
        background: linear-gradient(135deg, rgba(212, 169, 74, 0.24), rgba(255, 122, 0, 0.14)) !important;
        border-color: #D4A94A !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-msg-row.is-user .cc-chat-msg-sender {
        color: #E8C97A !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-showcase-pill {
        background: #151514 !important;
        border-color: rgba(212, 169, 74, 0.36) !important;
        color: #E8C97A !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-showcase-pill.is-primary {
        background: linear-gradient(135deg, rgba(212, 169, 74, 0.24), rgba(255, 122, 0, 0.14)) !important;
        border-color: #D4A94A !important;
        color: #FFFFFF !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-showcase-pill.is-primary:hover {
        background: rgba(255, 122, 0, 0.28) !important;
        border-color: #FF7A00 !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-scroll-bottom-btn {
        background: rgba(212, 169, 74, 0.22) !important;
        border-color: #D4A94A !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-composer-premium {
        background: #0E0E0D !important;
        border-top: 1px solid rgba(212, 169, 74, 0.22) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-composer-plus-btn {
        background: #161615 !important;
        border-color: rgba(212, 169, 74, 0.32) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-composer-plus-btn:hover {
        background: rgba(212, 169, 74, 0.18) !important;
      }
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-composer-input-wrap,
      #ccGlobalChatOverlay.cc-chat-home-theme .cc-chat-search-input {
        background: #0A0A0A !important;
        border-color: rgba(212, 169, 74, 0.42) !important;
      }

      /* ── MOTYW CZATU DLA PORTALI CCN: HARMONIA WĘGIEL (#0A0A0A) + CZERWIEŃ CCN (#BB142E / #F9282B) ── */
      #ccGlobalChatOverlay.cc-chat-ccn-theme {
        --lumi-bg-main: #0A0A0A;
        --lumi-bg-panel: #111111;
        --lumi-card-surface: #161616;
        --lumi-accent: #bb142e;
        --lumi-accent-light: #f9282b;
        --lumi-border: rgba(187, 20, 46, 0.30);
        --lumi-text-muted: #a1a1aa;
        background: rgba(4, 4, 4, 0.82) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-drawer {
        background: #0A0A0A !important;
        border: 1px solid rgba(187, 20, 46, 0.45) !important;
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.95), 0 0 40px rgba(187, 20, 46, 0.22), inset 0 1px 0 rgba(249, 40, 43, 0.20) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-header {
        background: #0E0E0E !important;
        border-bottom: 1px solid rgba(187, 20, 46, 0.20) !important;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.60) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-header-logo-wrap {
        background: radial-gradient(circle at 30% 28%, #221315 0%, #0a0a0a 88%) !important;
        border: 1.5px solid rgba(187, 20, 46, 0.80) !important;
        box-shadow: 0 0 14px rgba(187, 20, 46, 0.35) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme #ccChatHeaderPartnerAvatar {
        display: none !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-header-gold-icon,
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-nav-icon-svg {
        display: inline-flex !important;
        color: #f9282b !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-nav-icon-emoji {
        display: none !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-icon-btn {
        background: #161616 !important;
        border-color: rgba(187, 20, 46, 0.26) !important;
        color: #d4d4d8 !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-icon-btn:hover,
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-icon-btn.is-active {
        background: rgba(187, 20, 46, 0.22) !important;
        border-color: #f9282b !important;
        color: #ffffff !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-more-drawer-toggle-btn[aria-expanded="true"] {
        background: #bb142e !important;
        color: #ffffff !important;
        border-color: #f9282b !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-mini-player {
        background: #121212 !important;
        border-color: rgba(187, 20, 46, 0.28) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-radio-glyph,
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-radio-eq span {
        color: #f9282b !important;
        background: #f9282b !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-nav-tabs {
        background: #0E0E0E !important;
        border-bottom: 1px solid rgba(187, 20, 46, 0.22) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-nav-tab {
        background: #141414 !important;
        border-color: rgba(187, 20, 46, 0.18) !important;
        color: #a1a1aa !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-nav-tab:hover {
        border-color: rgba(187, 20, 46, 0.50) !important;
        color: #ffffff !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-nav-tab.is-active {
        background: linear-gradient(135deg, rgba(187, 20, 46, 0.32), rgba(249, 40, 43, 0.12)) !important;
        border-color: #bb142e !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(187, 20, 46, 0.25) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-tab-panel,
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-tab-content-wrap {
        background: #0A0A0A !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-mode-bar {
        background: #0E0E0E !important;
        border-bottom-color: rgba(187, 20, 46, 0.22) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-mode-tab-btn {
        background: #161616 !important;
        border-color: rgba(187, 20, 46, 0.22) !important;
        color: #a1a1aa !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-mode-tab-btn:hover {
        border-color: rgba(187, 20, 46, 0.55) !important;
        color: #ffffff !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-mode-tab-btn.is-active {
        background: linear-gradient(135deg, rgba(187, 20, 46, 0.32), rgba(249, 40, 43, 0.14)) !important;
        border-color: #bb142e !important;
        color: #ffffff !important;
        box-shadow: 0 2px 14px rgba(187, 20, 46, 0.26) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-asst-picker-strip {
        background: #0E0E0E !important;
        border-bottom: 1px solid rgba(187, 20, 46, 0.26) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-asst-pick-btn,
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-asst-picker-btn {
        background: #161616 !important;
        border-color: rgba(187, 20, 46, 0.22) !important;
        color: #e4e4e7 !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-asst-pick-btn:hover,
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-asst-picker-btn:hover {
        background: #1e1315 !important;
        border-color: rgba(187, 20, 46, 0.55) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-asst-pick-btn.is-active,
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-asst-picker-btn.is-active {
        background: linear-gradient(135deg, rgba(187, 20, 46, 0.30), rgba(249, 40, 43, 0.12)) !important;
        border-color: #f9282b !important;
        box-shadow: 0 2px 12px rgba(187, 20, 46, 0.26) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-lumi-divider {
        background: linear-gradient(90deg, transparent, rgba(187, 20, 46, 0.40) 22%, #f9282b 50%, rgba(187, 20, 46, 0.40) 78%, transparent) !important;
        box-shadow: 0 0 8px rgba(187, 20, 46, 0.45) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-active-asst-avatar {
        border-color: #bb142e !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-active-asst-dot,
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-asst-pick-dot {
        border-color: #0A0A0A !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-asst-welcome-bubble {
        background: rgba(20, 18, 19, 0.96) !important;
        border: 1px solid rgba(187, 20, 46, 0.40) !important;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.55), 0 0 18px rgba(187, 20, 46, 0.12) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-welcome-art-wrap,
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-qc-thumb-wrap {
        border: 1px solid rgba(187, 20, 46, 0.28) !important;
        background: #101010 !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-quick-card,
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-card-item {
        background: #141414 !important;
        border-color: rgba(187, 20, 46, 0.24) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-quick-card:hover,
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-card-item:hover {
        background: #1c1315 !important;
        border-color: #bb142e !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-public-mode-header {
        background: #121212 !important;
        border-color: rgba(187, 20, 46, 0.28) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme #ccPublicDailyDialogue {
        background: linear-gradient(145deg, rgba(22, 19, 20, 0.97), rgba(11, 10, 10, 0.99)) !important;
        border-color: rgba(187, 20, 46, 0.40) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme #ccPublicDailyDialogue .cc-daily-dialogue-turn {
        background: rgba(14, 13, 13, 0.88) !important;
        border-color: rgba(187, 20, 46, 0.18) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme #ccPublicDailyDialogue .cc-daily-dialogue-host-avatar {
        border-color: #bb142e !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-msg-bubble {
        background: #161616 !important;
        border-color: rgba(187, 20, 46, 0.25) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-msg-row.is-me .cc-chat-msg-bubble,
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-msg-row.is-user .cc-chat-msg-bubble {
        background: linear-gradient(135deg, rgba(187, 20, 46, 0.38), rgba(152, 16, 37, 0.25)) !important;
        border-color: #bb142e !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-msg-row.is-user .cc-chat-msg-sender {
        color: #f9282b !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-showcase-pill {
        background: #151515 !important;
        border-color: rgba(187, 20, 46, 0.36) !important;
        color: #f4f4f5 !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-showcase-pill.is-primary {
        background: linear-gradient(135deg, #bb142e, #981025) !important;
        border-color: #f9282b !important;
        color: #FFFFFF !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-showcase-pill.is-primary:hover {
        background: #f9282b !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-scroll-bottom-btn {
        background: rgba(187, 20, 46, 0.25) !important;
        border-color: #bb142e !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-composer-premium {
        background: #0E0E0E !important;
        border-top: 1px solid rgba(187, 20, 46, 0.24) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-composer-plus-btn {
        background: #161616 !important;
        border-color: rgba(187, 20, 46, 0.32) !important;
        color: #f9282b !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-composer-plus-btn:hover {
        background: rgba(187, 20, 46, 0.20) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-composer-input-wrap,
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-chat-search-input {
        background: #0A0A0A !important;
        border-color: rgba(187, 20, 46, 0.44) !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-composer-send-btn {
        background: linear-gradient(135deg, #bb142e, #981025) !important;
        color: #ffffff !important;
      }
      #ccGlobalChatOverlay.cc-chat-ccn-theme .cc-composer-send-btn:hover {
        background: #f9282b !important;
      }

      @media (prefers-reduced-motion: reduce) {
        .cc-chat-drawer,
        .cc-chat-drawer-overlay,
        .cc-chat-msg-row,
        .cc-chat-teaser-bubble,
        .cc-chat-fab-wrap,
        .cc-chat-fab-btn {
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

  function isHomepageSurface() {
    try {
      const p = String((window.location && window.location.pathname) || '').toLowerCase();
      return p === '/' || p === '/index.html' || /^\/test\/uswiecenie\/?(?:index\.html)?$/.test(p);
    } catch (_) {
      return false;
    }
  }

  function isCcnSurface() {
    try {
      const p = String((window.location && window.location.pathname) || '').toLowerCase();
      const ccnRoots = [
        'news', 'nauka', 'historia', 'biologia', 'prawo', 'seks', 'kultura', 'biznes', 'kuchnia', 'ziu',
        'ogloszenia', 'wspolpraca', 'network', 'biblioteka', 'edukacja', 'psychologia', 'finanse',
        'technologie', 'misje', 'apologetyka'
      ];
      const regex = new RegExp(`^\\/(${ccnRoots.join('|')})(?:\\/|\\.html|$)`, 'i');
      if (regex.test(p)) return true;
      if (typeof document !== 'undefined' && document) {
        if (document.querySelector?.('.news-brand-row, .ccn-brand-bar, .ccn-site-nav, .ccn-article-wrapper, .news-ecosystem-strip, header img[src*="ccn-logo"]')) {
          return true;
        }
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  // 5. Montowanie struktury HTML przycisku i okna czatu
  function mountComponent() {
    if (document.getElementById('ccGlobalChatOverlay')) return;
    const useHomeTheme = isHomepageSurface();
    const useCcnTheme = !useHomeTheme && isCcnSurface();

    // Przycisk FAB
    let fabWrap = document.getElementById('ccGlobalChatFab');
    if (!fabWrap) {
      fabWrap = document.createElement('div');
      fabWrap.id = 'ccGlobalChatFab';
      fabWrap.className = 'cc-chat-fab-wrap' + (useHomeTheme ? ' cc-chat-home-theme' : useCcnTheme ? ' cc-chat-ccn-theme' : '');
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
            <img src="/images/chat/cc-chat-button.png" alt="LUMI Messenger" class="cc-chat-fab-img" width="48" height="48" loading="eager" decoding="sync">
          </picture>
          <span class="cc-chat-fab-gold-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </span>
          <span class="cc-chat-fab-badge" aria-hidden="true"></span>
        </button>
      `;
      document.body.appendChild(fabWrap);
    }

    // Okno czatu LUMI MESSENGER PREMIUM UI 2.0
    const overlay = document.createElement('div');
    overlay.id = 'ccGlobalChatOverlay';
    overlay.className = 'cc-chat-drawer-overlay' + (useHomeTheme ? ' cc-chat-home-theme' : useCcnTheme ? ' cc-chat-ccn-theme' : '');
    overlay.setAttribute('aria-hidden', 'true');

    overlay.innerHTML = `
      <div class="cc-chat-drawer" role="dialog" aria-modal="true" aria-labelledby="ccChatHeaderTitle">
        
        <!-- 1. NAGŁÓWEK LUMI MESSENGER -->
        <header class="cc-chat-header">
          <a href="/mess" class="cc-chat-header-brand" id="ccChatHeaderBrand" title="LUMI Messenger">
            <div class="cc-chat-header-logo-wrap" aria-hidden="true">
              <img src="/images/chat/lumi_header_logo.webp" id="ccChatHeaderPartnerAvatar" alt="LUMI Messenger" class="cc-chat-header-icon" width="38" height="38" onerror="this.src='/images/chat/cc-chat-button-120.webp'">
              <span class="cc-chat-header-gold-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </span>
            </div>
            <div class="cc-chat-header-titles">
              <div class="cc-chat-header-title" id="ccChatHeaderTitle">
                <span>LUMI Messenger</span>
              </div>
              <div class="cc-chat-header-sub">
                <span class="cc-chat-live-dot" aria-hidden="true"></span>
                <span id="ccChatHeaderSubText">Na żywo w Chrystusie</span>
              </div>
            </div>
          </a>
          <div class="cc-chat-header-actions">
            <button type="button" class="cc-chat-icon-btn cc-more-drawer-toggle-btn" id="ccHeaderMoreToggleBtn" title="Więcej — rozwiń lub zwiń funkcje" aria-label="Więcej — rozwiń lub zwiń funkcje" aria-expanded="false">
              •••
            </button>
            <button type="button" class="cc-chat-icon-btn" id="ccChatNotifBtn" title="Powiadomienia" aria-label="Powiadomienia">
              <span class="cc-nav-icon-emoji">🔔</span><span class="cc-nav-icon-svg" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></span>
            </button>
            <button type="button" class="cc-chat-icon-btn" id="ccChatSettingsBtn" title="Ustawienia czatu" aria-label="Ustawienia czatu">
              <span class="cc-nav-icon-emoji">⚙️</span><span class="cc-nav-icon-svg" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>
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
            <span class="cc-nav-icon"><span class="cc-nav-icon-emoji">💬</span><span class="cc-nav-icon-svg" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span></span>
            <span>Czat</span>
          </button>
          <button type="button" class="cc-chat-nav-tab" id="ccChatTabTeamBtn" role="tab" aria-selected="false" aria-controls="ccChatViewTeam">
            <span class="cc-nav-icon"><span class="cc-nav-icon-emoji">👥</span><span class="cc-nav-icon-svg" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span></span>
            <span>Zespół CC</span>
          </button>
          <button type="button" class="cc-chat-nav-tab" id="ccChatTabMembersBtn" role="tab" aria-selected="false" aria-controls="ccChatViewMembers">
            <span class="cc-nav-icon"><span class="cc-nav-icon-emoji">👥</span><span class="cc-nav-icon-svg" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span></span>
            <span>Społeczność</span>
          </button>
          <button type="button" class="cc-chat-nav-tab" id="ccChatTabChannelsBtn" role="tab" aria-selected="false" aria-controls="ccChatViewChannels">
            <span class="cc-nav-icon"><span class="cc-nav-icon-emoji">🌐</span><span class="cc-nav-icon-svg" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span></span>
            <span>Zasoby</span>
          </button>
          <button type="button" class="cc-chat-nav-tab" id="ccChatTabMoreBtn" role="tab" aria-selected="false" aria-controls="ccChatViewMore">
            <span class="cc-nav-icon">•••</span>
            <span>Więcej</span>
          </button>
        </nav>

        <!-- ════ WIDOK 1: CZAT OGÓLNY & ASYSTENTKI CC (4 DO WYBORU) ════ -->
        <div class="cc-chat-tab-panel is-active" id="ccChatViewLive" role="tabpanel" aria-labelledby="ccChatTabLiveBtn">

          <!-- PRZEŁĄCZNIK TRYBU: CZAT OGÓLNY vs ASYSTENTKI CC -->
          <div class="cc-chat-mode-bar" id="ccChatModeBar" role="tablist" aria-label="Wybór trybu czatu">
            <button type="button" class="cc-mode-tab-btn is-active" id="ccModePublicBtn" data-chat-mode="public" role="tab" aria-selected="true">
              <span class="cc-nav-icon-emoji">🌐</span><span class="cc-nav-icon-svg" aria-hidden="true"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span><span>Czat ogólny</span>
            </button>
            <button type="button" class="cc-mode-tab-btn" id="ccModeAssistantBtn" data-chat-mode="assistant" role="tab" aria-selected="false">
              <span class="cc-nav-icon-emoji">✨</span><span class="cc-nav-icon-svg" aria-hidden="true" style="color:#E8C97A;"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/></svg></span><span>Asystentki CC (4)</span>
            </button>
          </div>

          <!-- WYBÓR JEDNEJ Z 4 ASYSTENTEK (ZAWSZE WIDOCZNY W TRYBIE ASYSTENTEK) -->
          <div class="cc-asst-picker-strip" id="ccAssistantSelectorStrip" role="radiogroup" aria-label="Wybierz Asystentkę Christian Culture" hidden>
            <button type="button" class="cc-asst-pick-btn cc-trio-card is-active" data-asst-id="asystentka-1" role="radio" aria-checked="true" aria-label="Wybierz Rut — Gospodyni LUMI MESS">
              <span class="cc-asst-pick-avatar-wrap" aria-hidden="true">
                <img src="/images/chat/lumi_avatar_rut_circle.webp" alt="Rut" class="cc-asst-pick-avatar" onerror="this.src='/images/chat/assistants/asystentka-1.jpg'">
                <span class="cc-asst-pick-dot"></span>
              </span>
              <span class="cc-asst-pick-meta">
                <span class="cc-asst-pick-name">Rut</span>
                <span class="cc-asst-pick-role">Gospodyni CC</span>
              </span>
            </button>
            <button type="button" class="cc-asst-pick-btn cc-trio-card" data-asst-id="asystentka-2" role="radio" aria-checked="false" aria-label="Wybierz Lea — Przewodnik i planista">
              <span class="cc-asst-pick-avatar-wrap" aria-hidden="true">
                <img src="/images/chat/lumi_avatar_lea_circle.webp" alt="Lea" class="cc-asst-pick-avatar" onerror="this.src='/images/chat/assistants/asystentka-2.jpg'">
                <span class="cc-asst-pick-dot"></span>
              </span>
              <span class="cc-asst-pick-meta">
                <span class="cc-asst-pick-name">Lea</span>
                <span class="cc-asst-pick-role">Planista</span>
              </span>
            </button>
            <button type="button" class="cc-asst-pick-btn cc-trio-card" data-asst-id="asystentka-3" role="radio" aria-checked="false" aria-label="Wybierz Noemi — Doradca i zasoby">
              <span class="cc-asst-pick-avatar-wrap" aria-hidden="true">
                <img src="/images/chat/lumi_avatar_noemi_circle.webp" alt="Noemi" class="cc-asst-pick-avatar" onerror="this.src='/images/chat/assistants/asystentka-3.jpg'">
                <span class="cc-asst-pick-dot"></span>
              </span>
              <span class="cc-asst-pick-meta">
                <span class="cc-asst-pick-name">Noemi</span>
                <span class="cc-asst-pick-role">Doradca</span>
              </span>
            </button>
            <button type="button" class="cc-asst-pick-btn cc-trio-card" data-asst-id="asystentka-4" role="radio" aria-checked="false" aria-label="Wybierz Miriam — Psalmy i uwielbienie">
              <span class="cc-asst-pick-avatar-wrap" aria-hidden="true">
                <img src="/images/chat/lumi_avatar_miriam_circle.webp" alt="Miriam" class="cc-asst-pick-avatar" onerror="this.src='/images/chat/assistants/asystentka-4.jpg'">
                <span class="cc-asst-pick-dot"></span>
              </span>
              <span class="cc-asst-pick-meta">
                <span class="cc-asst-pick-name">Miriam</span>
                <span class="cc-asst-pick-role">Uwielbienie</span>
              </span>
            </button>
          </div>

          <!-- FEED WIADOMOŚCI (ROZDZIELONY: SPOŁECZNOŚĆ vs ASYSTENTKI) -->
          <div class="cc-chat-partners-bar" id="ccChatPartnersBar" style="display:none !important;"></div>
          <div class="cc-chat-feed" id="ccChatFeed">

            <!-- SEKCJA 1: CZAT OGÓLNY & ROZMOWY 1:1 -->
            <div id="ccPublicChatSection">
              <div class="cc-public-mode-header" id="ccPublicModeHeader">
                <div class="cc-public-mode-title" id="ccPublicModeTitle">
                  <span>🌐</span><span>Czat Ogólny Społeczności LUMINA</span>
                </div>
                <button type="button" class="cc-public-back-btn" id="ccPublicBackBtn" hidden>← Czat ogólny</button>
              </div>
              <div id="ccChatMessagesList" style="display: flex; flex-direction: column; gap: 10px;"></div>
            </div>

            <!-- SEKCJA 2: CZAT Z WYBRANĄ ASYSTENTKĄ CC -->
            <div id="ccAssistantChatSection" class="cc-section-hidden">
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
                    <button type="button" class="cc-hotspot cc-hotspot-pill1" id="ccPillRadio" aria-label="Posłuchaj radia" title="Posłuchaj radia"></button>
                    <button type="button" class="cc-hotspot cc-hotspot-pill2" id="ccPillBible" aria-label="Poznaj Biblię" title="Poznaj Biblię"></button>
                    <button type="button" class="cc-hotspot cc-hotspot-pill3" id="ccPillDiscover" aria-label="Odkryj CC" title="Odkryj CC"></button>
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

              <!-- Powitanie 1:1 -->
              <div class="cc-asst-welcome-container">
                <div class="cc-asst-welcome-bubble" id="ccChatWelcomeBubble">
                  <div class="cc-welcome-headline">Cześć! ❤️ Dobrze, że jesteś.</div>
                  <div class="cc-welcome-lead" id="ccChatWelcomeBody">Nazywam się Rut – jestem Asystentką Christian Culture i gospodynią LUMI MESS.</div>
                  <div class="cc-welcome-help" id="ccChatWelcomeHelp">Przez całą dobę pomogę Ci znaleźć radio 24/7, Biblię, kursy, filmy VOD, społeczność LUMINA lub kontakt z zespołem.</div>
                  <div class="cc-welcome-ask" id="ccChatWelcomeAsk">W czym mogę Ci dziś pomóc?</div>
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

              <!-- Wydzielony strumień rozmowy z wybraną Asystentką CC -->
              <div id="ccAssistantMessagesList" style="display: flex; flex-direction: column; gap: 10px;"></div>
            </div>

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
                  placeholder="Napisz wiadomość"
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

            <div id="ccDrawerAccountCard" style="background:var(--lumi-card-surface);border:1px solid var(--lumi-border);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                <div>
                  <span style="font-size:0.86rem;font-weight:700;display:block;color:var(--lumi-text-main);">Konto LUMINA & Sesja</span>
                  <span id="ccDrawerAccountStatus" style="font-size:0.78rem;color:var(--lumi-text-muted);">Sprawdzanie sesji...</span>
                </div>
                <button type="button" id="ccDrawerAccountActionBtn" class="cc-showcase-pill is-primary" style="min-height:44px;padding:0 14px;">Ustawienia konta</button>
              </div>
            </div>

            <div id="ccDrawerSoundCard" style="background:var(--lumi-card-surface);border:1px solid var(--lumi-border);border-radius:16px;padding:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;">
              <div>
                <label for="ccDrawerSoundToggle" style="font-size:0.86rem;font-weight:700;display:block;color:var(--lumi-text-main);cursor:pointer;">🔔 Dźwięk powiadomień czatu</label>
                <span style="font-size:0.76rem;color:var(--lumi-text-muted);">Sygnał nowych wiadomości w LUMI MESS</span>
              </div>
              <input type="checkbox" id="ccDrawerSoundToggle" style="width:24px;height:24px;min-width:24px;min-height:24px;accent-color:#D8AD57;cursor:pointer;" checked aria-label="Włącz lub wyłącz dźwięk powiadomień czatu">
            </div>

            <div style="background:var(--lumi-card-surface);border:1px solid var(--lumi-border);border-radius:16px;padding:14px;">
              <span style="font-size:0.86rem;font-weight:700;display:block;margin-bottom:8px;">Wybierz Asystentkę LUMI:</span>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button type="button" class="cc-showcase-pill" style="min-height:44px;" data-asst-id="asystentka-1" onclick="window.selectAssistantAndRefresh('asystentka-1', true)">Rut</button>
                <button type="button" class="cc-showcase-pill" style="min-height:44px;" data-asst-id="asystentka-2" onclick="window.selectAssistantAndRefresh('asystentka-2', true)">Lea</button>
                <button type="button" class="cc-showcase-pill" style="min-height:44px;" data-asst-id="asystentka-3" onclick="window.selectAssistantAndRefresh('asystentka-3', true)">Noemi</button>
                <button type="button" class="cc-showcase-pill" style="min-height:44px;" data-asst-id="asystentka-4" onclick="window.selectAssistantAndRefresh('asystentka-4', true)">Miriam</button>
              </div>
            </div>

            <div style="background:var(--lumi-card-surface);border:1px solid var(--lumi-border);border-radius:16px;padding:14px;">
              <span style="font-size:0.86rem;font-weight:700;display:block;margin-bottom:8px;">Szybkie przełączenie pokoju:</span>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button type="button" class="cc-showcase-pill" style="min-height:44px;" id="ccMoreGoPublicBtn">🌐 Czat ogólny</button>
                <button type="button" class="cc-showcase-pill is-primary" style="min-height:44px;" id="ccMoreGoAsstBtn">✨ Asystentki CC (4)</button>
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

    function renderAssistantActionButtons(actions) {
      if (!actions || !actions.length) return '';
      return `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">` +
        actions.map(act => {
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

    function renderAssistantMessages() {
      const list = document.getElementById('ccAssistantMessagesList');
      if (!list) return;
      const asst = getActiveAssistant();
      const history = assistantHistories[asst.id] || [];
      if (!history.length) {
        list.innerHTML = '';
        return;
      }
      list.innerHTML = history.map(entry => {
        if (entry.sender === 'user') {
          return `
            <div class="cc-chat-msg-row is-me">
              <div class="cc-chat-msg-content">
                <div class="cc-chat-msg-meta">
                  <span class="cc-chat-msg-sender">Ty</span>
                  <span>${escapeHtml(entry.timeStr)}</span>
                </div>
                <div class="cc-chat-msg-bubble">${escapeHtml(entry.text)}</div>
              </div>
            </div>
          `;
        }
        return `
          <div class="cc-chat-msg-row">
            <img src="${escapeHtml(asst.avatar)}" alt="${escapeHtml(asst.name)}" class="cc-chat-msg-avatar" onerror="this.src='${escapeHtml(asst.avatarFallback)}'">
            <div class="cc-chat-msg-content">
              <div class="cc-chat-msg-meta">
                <span class="cc-chat-msg-sender">${escapeHtml(asst.name)}</span>
                <span>${escapeHtml(entry.timeStr)}</span>
              </div>
              <div class="cc-chat-msg-bubble">
                <div>${escapeHtml(entry.reply)}</div>
                ${renderAssistantActionButtons(entry.actions)}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    let ccDailyVerseData = null;
    let ccDailyVerseLoading = false;

    function trimVerseByWord(text, maxLen) {
      const clean = String(text || '').replace(/\s+/g, ' ').trim().replace(/^[„"']+|[”"']+$/g, '');
      if (!clean) return '';
      if (clean.length <= maxLen) return `„${clean}”`;
      const slice = clean.slice(0, maxLen);
      const sentMatch = slice.match(/^([\s\S]{40,}?[.!?])(?:\s|$)/);
      if (sentMatch && sentMatch[1]) return `„${sentMatch[1].trim()}”`;
      const lastSpace = slice.lastIndexOf(' ');
      let safe = (lastSpace > Math.floor(maxLen * 0.55)) ? slice.slice(0, lastSpace) : slice;
      safe = safe.replace(/[,;:\-–\s]+$/, '').replace(/\s+(?:z|w|i|o|a|u|na|do|od|ku|po)$/i, '').replace(/[,;:\-–\s]+$/, '');
      return `„${safe}…”`;
    }

    function buildVerseGreetingForAssistant(asst, daily) {
      if (!daily || (!daily.verse && !daily.reading && !daily.title)) return asst.greeting;
      const reading = daily.reading ? ` (${daily.reading})` : '';
      const shortVerse = trimVerseByWord(daily.verse || '', 88);
      const verseOrTitle = shortVerse || daily.title || '';
      const key = String(asst.shortName || asst.id || '').toLowerCase();
      if (key.includes('lea')) {
        return `Werset Dnia${reading}: ${verseOrTitle} — zaplanujmy 10 minut w Kursie Codziennym!`;
      }
      if (key.includes('noemi')) {
        return `Słowo na dziś${reading}: ${verseOrTitle} — zamieńmy ten werset w modlitwę.`;
      }
      if (key.includes('miriam')) {
        return `Chwała Panu! Werset Dnia${reading}: ${verseOrTitle} — posłuchaj Psalmów 24/7.`;
      }
      return `Dzień ${daily.day || ''}${reading}: ${verseOrTitle} — o czym dziś porozmawiamy?`.trim();
    }

    function loadDailyVerseForWelcome() {
      if (ccDailyVerseData || ccDailyVerseLoading || typeof fetch !== 'function') return;
      ccDailyVerseLoading = true;
      fetch('/api/lumi-chat?daily=1')
        .then(r => (r && r.ok) ? r.json() : null)
        .then(data => {
          if (data && data.ok && data.dialogue) {
            ccDailyVerseData = data.dialogue;
            refreshAssistantUI(getActiveAssistant());
            return;
          }
          throw new Error('fallback');
        })
        .catch(() => {
          fetch('/rozwazania_baza.json')
            .then(r => (r && r.ok) ? r.json() : null)
            .then(list => {
              if (!Array.isArray(list) || !list.length) return;
              let today = new Date().toISOString().slice(0, 10);
              try {
                today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
              } catch (_) {}
              const item = list.find(x => x && x.date === today) || list.filter(x => x && x.date).sort((a, b) => String(b.date).localeCompare(String(a.date)))[0] || list[0];
              if (item) {
                ccDailyVerseData = {
                  day: item.day || '',
                  title: item.title || '',
                  reading: item.reading || '',
                  verse: item.memoryVerse || ''
                };
                refreshAssistantUI(getActiveAssistant());
              }
            })
            .catch(() => {});
        });
    }

    function refreshAssistantUI(asst) {
      activeAssistant = asst;
      loadDailyVerseForWelcome();
      const dynamicGreeting = buildVerseGreetingForAssistant(asst, ccDailyVerseData);
      if (teaserAvatar) {
        teaserAvatar.src = asst.avatar;
        teaserAvatar.onerror = function () { if (this.src !== asst.avatarFallback) this.src = asst.avatarFallback; };
      }
      if (teaserName) teaserName.textContent = asst.name;
      if (teaserMsg) teaserMsg.textContent = dynamicGreeting;

      const activeAvatar = document.getElementById('ccChatActiveAsstAvatar');
      const activeName = document.getElementById('ccChatActiveAsstName');
      const activeRole = document.getElementById('ccChatActiveAsstRole');
      const welcomeBody = document.getElementById('ccChatWelcomeBody');
      const welcomeHelp = document.getElementById('ccChatWelcomeHelp');
      const headerSub = document.getElementById('ccChatHeaderSubText');

      if (activeAvatar) {
        activeAvatar.src = asst.circleAvatar || asst.avatar;
        activeAvatar.onerror = function () { if (this.src !== asst.avatarFallback) this.src = asst.avatarFallback; };
      }
      if (activeName) activeName.textContent = asst.shortName || asst.name.split(' ')[0];
      if (activeRole) activeRole.textContent = `· ${asst.role || 'Asystentka CC'}`;
      if (welcomeBody) welcomeBody.textContent = `Nazywam się ${asst.shortName || asst.name} – jestem Asystentką Christian Culture i gospodynią LUMI MESS.`;
      if (welcomeHelp) welcomeHelp.textContent = dynamicGreeting;
      if (headerSub && chatMode === 'assistant') {
        headerSub.textContent = `Asystentka CC: ${asst.shortName || asst.name}`;
      }

      // Trio radio & selector sync
      document.querySelectorAll('.cc-trio-card, #ccChatViewMore [data-asst-id]').forEach(btn => {
        const isThis = btn.getAttribute('data-asst-id') === asst.id;
        btn.classList.toggle('is-active', isThis);
        if (btn.getAttribute('role') === 'radio') {
          btn.setAttribute('aria-checked', isThis ? 'true' : 'false');
        }
      });

      renderAssistantMessages();
    }

    function setChatMode(mode) {
      const normalized = (mode === 'assistant' || mode === 'direct') ? mode : 'public';
      chatMode = normalized;

      const modePublicBtn = document.getElementById('ccModePublicBtn');
      const modeAssistantBtn = document.getElementById('ccModeAssistantBtn');
      const asstStrip = document.getElementById('ccAssistantSelectorStrip');
      const publicSection = document.getElementById('ccPublicChatSection');
      const assistantSection = document.getElementById('ccAssistantChatSection');
      const publicHeaderTitle = document.getElementById('ccPublicModeTitle');
      const publicBackBtn = document.getElementById('ccPublicBackBtn');
      const headerSub = document.getElementById('ccChatHeaderSubText');
      const inputEl = document.getElementById('ccChatInput');

      const isAsstMode = normalized === 'assistant';
      if (modePublicBtn) {
        modePublicBtn.classList.toggle('is-active', !isAsstMode);
        modePublicBtn.setAttribute('aria-selected', !isAsstMode ? 'true' : 'false');
      }
      if (modeAssistantBtn) {
        modeAssistantBtn.classList.toggle('is-active', isAsstMode);
        modeAssistantBtn.setAttribute('aria-selected', isAsstMode ? 'true' : 'false');
      }
      if (asstStrip) asstStrip.hidden = !isAsstMode;
      if (publicSection) publicSection.classList.toggle('cc-section-hidden', isAsstMode);
      if (assistantSection) assistantSection.classList.toggle('cc-section-hidden', !isAsstMode);

      if (isAsstMode) {
        const asst = getActiveAssistant();
        refreshAssistantUI(asst);
        if (inputEl) inputEl.placeholder = 'Napisz wiadomość';
      } else if (normalized === 'direct' && currentChatPartner && !currentChatPartner.isPublic) {
        if (publicHeaderTitle) {
          publicHeaderTitle.innerHTML = `<span>💬</span><span>Rozmowa 1:1: ${escapeHtml(currentChatPartner.name)}</span>`;
        }
        if (publicBackBtn) publicBackBtn.hidden = false;
        if (headerSub) headerSub.textContent = `Rozmowa: ${currentChatPartner.name}`;
        if (inputEl) inputEl.placeholder = 'Napisz wiadomość';
      } else {
        if (publicHeaderTitle) {
          publicHeaderTitle.innerHTML = '<span>🌐</span><span>Czat Ogólny Społeczności LUMINA</span>';
        }
        if (publicBackBtn) publicBackBtn.hidden = true;
        if (headerSub) headerSub.textContent = 'Na żywo w Chrystusie';
        if (inputEl) inputEl.placeholder = 'Napisz wiadomość';
        if (typeof renderChatMessages === 'function') renderChatMessages();
      }
    }

    window.setCCChatMode = setChatMode;

    window.selectAssistantAndRefresh = function(asstId, switchToAssistant) {
      const asst = setActiveAssistantById(asstId);
      refreshAssistantUI(asst);
      if (switchToAssistant) {
        setChatMode('assistant');
        const liveBtn = document.getElementById('ccChatTabLiveBtn');
        if (liveBtn) liveBtn.click();
      } else if (chatMode === 'assistant') {
        const inputEl = document.getElementById('ccChatInput');
        if (inputEl) inputEl.placeholder = 'Napisz wiadomość';
      }
    };

    function parseColorToRgb(input) {
      if (!input || typeof input !== 'string') return null;
      const val = input.trim();
      const rgbMatch = val.match(/^rgba?\(\s*([0-9.]+)\s*[,\s]\s*([0-9.]+)\s*[,\s]\s*([0-9.]+)(?:\s*[,/]\s*([0-9.]+%?))?\s*\)$/i);
      if (rgbMatch) {
        const aRaw = rgbMatch[4];
        const a = aRaw === undefined ? 1 : (aRaw.endsWith('%') ? parseFloat(aRaw) / 100 : parseFloat(aRaw));
        if (a === 0) return null;
        return { r: Math.round(Number(rgbMatch[1])), g: Math.round(Number(rgbMatch[2])), b: Math.round(Number(rgbMatch[3])) };
      }
      const hexMatch = val.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
      if (hexMatch) {
        let h = hexMatch[1];
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        return {
          r: parseInt(h.slice(0, 2), 16),
          g: parseInt(h.slice(2, 4), 16),
          b: parseInt(h.slice(4, 6), 16)
        };
      }
      const okMatch = val.match(/^(oklch|oklab)\(\s*([0-9.+-]+%?)\s+([0-9.+-]+%?)\s+([0-9.+-]+(?:deg|rad|turn)?)(?:\s*\/\s*([0-9.]+%?))?\s*\)$/i);
      if (okMatch) {
        const fn = okMatch[1].toLowerCase();
        const aRaw = okMatch[5];
        const alpha = aRaw === undefined ? 1 : (aRaw.endsWith('%') ? parseFloat(aRaw) / 100 : parseFloat(aRaw));
        if (alpha === 0) return null;
        const L = okMatch[2].endsWith('%') ? parseFloat(okMatch[2]) / 100 : parseFloat(okMatch[2]);
        let a = 0, b = 0;
        if (fn === 'oklch') {
          const C = parseFloat(okMatch[3]);
          const hStr = okMatch[4].toLowerCase();
          let hDeg = parseFloat(hStr);
          if (hStr.endsWith('rad')) hDeg = hDeg * (180 / Math.PI);
          else if (hStr.endsWith('turn')) hDeg = hDeg * 360;
          const rad = (hDeg * Math.PI) / 180;
          a = C * Math.cos(rad);
          b = C * Math.sin(rad);
        } else {
          a = parseFloat(okMatch[3]);
          b = parseFloat(okMatch[4]);
        }
        const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
        const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
        const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
        const l = l_ * l_ * l_;
        const m = m_ * m_ * m_;
        const s = s_ * s_ * s_;
        const compand = c => {
          const clamped = Math.max(0, Math.min(1, c));
          const srgb = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
          return Math.round(Math.max(0, Math.min(255, srgb * 255)));
        };
        return {
          r: compand(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
          g: compand(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
          b: compand(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)
        };
      }
      return null;
    }

    function detectPageThemePalette() {
      const htmlEl = document.documentElement;
      const bodyEl = document.body;
      const path = (window.location.pathname || '/').toLowerCase();

      let bgRgb = null;
      let textRgb = null;
      try {
        if (typeof window.getComputedStyle === 'function') {
          const bodyCs = bodyEl ? window.getComputedStyle(bodyEl) : null;
          const htmlCs = htmlEl ? window.getComputedStyle(htmlEl) : null;
          bgRgb = parseColorToRgb(bodyCs?.backgroundColor) || parseColorToRgb(htmlCs?.backgroundColor);
          textRgb = parseColorToRgb(bodyCs?.color) || parseColorToRgb(htmlCs?.color);
        }
      } catch (_) {}

      const metaTheme = document.querySelector('meta[name="theme-color"]')?.getAttribute('content') || '';
      const metaRgb = parseColorToRgb(metaTheme);
      if (!bgRgb && !textRgb && metaRgb) bgRgb = metaRgb;

      const noSwitch = !!htmlEl?.hasAttribute('data-no-theme-switch');
      const attrTheme = (!noSwitch ? (htmlEl?.getAttribute('data-lumina-theme') || '') : '').toLowerCase();
      const isLightAttr = attrTheme === 'light' || (!noSwitch && !!bodyEl?.classList?.contains('theme-lumina-light'));
      const isDarkAttr = attrTheme === 'dark' || !!htmlEl?.classList?.contains('dark');

      const bgLum = bgRgb ? (0.299 * bgRgb.r + 0.587 * bgRgb.g + 0.114 * bgRgb.b) / 255 : null;
      const textLum = textRgb ? (0.299 * textRgb.r + 0.587 * textRgb.g + 0.114 * textRgb.b) / 255 : null;
      const isLight = bgLum !== null
        ? (isLightAttr || (!isDarkAttr && bgLum > 0.56))
        : (textLum !== null ? textLum < 0.45 : isLightAttr);

      // Kolor akcentu dopasowany indywidualnie do konkretnej strony / portalu
      let accentRgb = null;
      try {
        if (typeof window.getComputedStyle === 'function') {
          const rootStyle = htmlEl ? window.getComputedStyle(htmlEl) : null;
          const bodyStyle = bodyEl ? window.getComputedStyle(bodyEl) : null;
          for (const vName of ['--cc-accent', '--ccn-accent', '--accent-color', '--brand-accent', '--theme-accent']) {
            const candidate = parseColorToRgb(bodyStyle?.getPropertyValue(vName) || rootStyle?.getPropertyValue(vName));
            if (candidate) { accentRgb = candidate; break; }
          }
        }
      } catch (_) {}

      if (!accentRgb && metaRgb) {
        const sat = Math.max(metaRgb.r, metaRgb.g, metaRgb.b) - Math.min(metaRgb.r, metaRgb.g, metaRgb.b);
        if (sat > 24) accentRgb = metaRgb;
      }

      if (!accentRgb) {
        if (/\/(news|nauka|historia|biologia|prawo|seks|finanse|ccn)/.test(path)) {
          accentRgb = { r: 187, g: 20, b: 46 }; // CCN / Portale wiedzy (#bb142e)
        } else if (/\/(akademia|kurscodzienny|dobrze|modlitwa)/.test(path)) {
          accentRgb = { r: 217, g: 119, b: 6 }; // Akademia / Kurs (#d97706)
        } else if (/\/(mojabiblia|ewangelia|biblia)/.test(path)) {
          accentRgb = { r: 56, g: 189, b: 248 }; // MojaBiblia (#38bdf8)
        } else if (/\/(player|radio|audycj|biblia-audio)/.test(path)) {
          accentRgb = { r: 255, g: 122, b: 0 }; // Radio / Player (#FF7A00)
        } else if (/\/(vod|rolki|shorts|kino)/.test(path)) {
          accentRgb = { r: 192, g: 132, b: 252 }; // Kino VOD / Rolki
        } else if (/\/(lumina|mess|profile)/.test(path)) {
          accentRgb = { r: 216, g: 173, b: 87 }; // LUMINA Gold (#D8AD57)
        } else {
          accentRgb = isLight ? { r: 160, g: 128, b: 64 } : { r: 216, g: 173, b: 87 };
        }
      }

      const ar = accentRgb.r, ag = accentRgb.g, ab = accentRgb.b;
      if (isLight) {
        const useBg = (bgLum !== null && bgLum > 0.56) ? bgRgb : { r: 252, g: 250, b: 247 };
        const br = Math.round(useBg.r * 0.45 + 255 * 0.55);
        const bg = Math.round(useBg.g * 0.45 + 255 * 0.55);
        const bb = Math.round(useBg.b * 0.45 + 255 * 0.55);
        const ctaR = Math.max(0, Math.round(ar * 0.78));
        const ctaG = Math.max(0, Math.round(ag * 0.78));
        const ctaB = Math.max(0, Math.round(ab * 0.78));
        return {
          bg: `linear-gradient(145deg, rgba(${br}, ${bg}, ${bb}, 0.98), rgba(${Math.max(236, br - 8)}, ${Math.max(238, bg - 7)}, ${Math.max(244, bb - 4)}, 0.98))`,
          border: `rgba(${ar}, ${ag}, ${ab}, 0.45)`,
          shadow: `0 14px 36px rgba(15, 23, 42, 0.16), 0 0 18px rgba(${ar}, ${ag}, ${ab}, 0.16)`,
          text: '#0F172A',
          muted: '#475569',
          cta: `rgb(${ctaR}, ${ctaG}, ${ctaB})`,
          ring: `rgb(${ar}, ${ag}, ${ab})`,
          avatarBg: `rgb(${br}, ${bg}, ${bb})`,
          badgeBorder: `rgb(${br}, ${bg}, ${bb})`
        };
      }

      const useDarkBg = (bgLum !== null && bgLum <= 0.56) ? bgRgb : { r: 13, g: 16, b: 32 };
      const dr = Math.min(48, Math.max(12, Math.round(useDarkBg.r * 0.8 + ar * 0.08 + 10)));
      const dg = Math.min(54, Math.max(15, Math.round(useDarkBg.g * 0.8 + ag * 0.08 + 12)));
      const db = Math.min(72, Math.max(24, Math.round(useDarkBg.b * 0.8 + ab * 0.08 + 18)));
      const d2r = Math.max(8, dr - 8);
      const d2g = Math.max(10, dg - 8);
      const d2b = Math.max(18, db - 11);
      const ctaLr = Math.min(255, Math.round(ar * 0.65 + 255 * 0.35));
      const ctaLg = Math.min(255, Math.round(ag * 0.65 + 255 * 0.35));
      const ctaLb = Math.min(255, Math.round(ab * 0.65 + 255 * 0.35));
      return {
        bg: `linear-gradient(145deg, rgba(${dr}, ${dg}, ${db}, 0.97), rgba(${d2r}, ${d2g}, ${d2b}, 0.98))`,
        border: `rgba(${ar}, ${ag}, ${ab}, 0.48)`,
        shadow: `0 16px 40px rgba(0, 0, 0, 0.7), 0 0 22px rgba(${ar}, ${ag}, ${ab}, 0.24)`,
        text: '#F7F8FC',
        muted: '#B8C0D4',
        cta: `rgb(${ctaLr}, ${ctaLg}, ${ctaLb})`,
        ring: `rgb(${ar}, ${ag}, ${ab})`,
        avatarBg: `rgb(${dr}, ${dg}, ${db})`,
        badgeBorder: `rgb(${d2r}, ${d2g}, ${d2b})`
      };
    }

    function applyTeaserPageTheme(el) {
      if (!el) return;
      const pal = useHomeTheme ? {
        bg: 'linear-gradient(145deg, rgba(20, 19, 17, 0.98), rgba(10, 10, 10, 0.99))',
        border: 'rgba(212, 169, 74, 0.48)',
        shadow: '0 16px 40px rgba(0, 0, 0, 0.82), 0 0 22px rgba(212, 169, 74, 0.20)',
        text: '#FFFFFF',
        muted: '#D1C7B2',
        cta: '#E8C97A',
        ring: '#D4A94A',
        avatarBg: '#141413',
        badgeBorder: '#0A0A0A'
      } : useCcnTheme ? {
        bg: 'linear-gradient(145deg, rgba(20, 17, 18, 0.98), rgba(10, 10, 10, 0.99))',
        border: 'rgba(187, 20, 46, 0.55)',
        shadow: '0 16px 40px rgba(0, 0, 0, 0.85), 0 0 24px rgba(187, 20, 46, 0.28)',
        text: '#FFFFFF',
        muted: '#D4D4D8',
        cta: '#F9282B',
        ring: '#BB142E',
        avatarBg: '#151515',
        badgeBorder: '#0A0A0A'
      } : detectPageThemePalette();
      el.style.setProperty('--cc-teaser-bg', pal.bg);
      el.style.setProperty('--cc-teaser-border', pal.border);
      el.style.setProperty('--cc-teaser-shadow', pal.shadow);
      el.style.setProperty('--cc-teaser-text', pal.text);
      el.style.setProperty('--cc-teaser-muted', pal.muted);
      el.style.setProperty('--cc-teaser-cta', pal.cta);
      el.style.setProperty('--cc-teaser-ring', pal.ring);
      el.style.setProperty('--cc-teaser-avatar-bg', pal.avatarBg);
      el.style.setProperty('--cc-teaser-badge-border', pal.badgeBorder);
    }

    let isTeaserDismissed = false;
    let teaserAutoHideTimer = null;

    function hideTeaserImmediately() {
      if (!teaserBubble) return;
      isTeaserDismissed = true;
      if (teaserAutoHideTimer) {
        clearTimeout(teaserAutoHideTimer);
        teaserAutoHideTimer = null;
      }
      teaserBubble.classList.add('is-fading', 'is-hidden');
      teaserBubble.hidden = true;
      teaserBubble.style.setProperty('display', 'none', 'important');
    }
    hideActiveTeaserOnOpen = hideTeaserImmediately;

    function dismissTeaserBubble(immediate) {
      isTeaserDismissed = true;
      if (teaserAutoHideTimer) {
        clearTimeout(teaserAutoHideTimer);
        teaserAutoHideTimer = null;
      }
      if (!teaserBubble) return;
      if (immediate) {
        hideTeaserImmediately();
        return;
      }
      teaserBubble.classList.add('is-fading');
      setTimeout(hideTeaserImmediately, 280);
    }

    function scheduleTeaserAutoHide() {
      if (isTeaserDismissed || !teaserBubble) return;
      if (teaserAutoHideTimer) clearTimeout(teaserAutoHideTimer);
      teaserAutoHideTimer = setTimeout(() => {
        dismissTeaserBubble(false);
      }, 6000);
    }

    function checkTeaserVideoCollision() {
      if (!teaserBubble || isTeaserDismissed) return false;
      const videos = document.querySelectorAll('iframe[src*="live"], iframe[src*="master"], video, .video-container');
      if (!videos.length) return false;
      const tRect = teaserBubble.getBoundingClientRect();
      if (tRect.width <= 0 || tRect.height <= 0) return false;
      for (const v of videos) {
        if (v.closest('#lumiIntroOverlay, .lumi-intro-video-wrap, #directMessagesModal, .lumi-standalone')) continue;
        const vRect = v.getBoundingClientRect();
        if (vRect.width <= 0 || vRect.height <= 0) continue;
        if (vRect.bottom > 0 && vRect.top < window.innerHeight && vRect.right > 0 && vRect.left < window.innerWidth) {
          const intersects = !(tRect.right < vRect.left || tRect.left > vRect.right || tRect.bottom < vRect.top || tRect.top > vRect.bottom);
          if (intersects) return true;
        }
      }
      return false;
    }

    const isFabHiddenOnInit = safeLsGet(CC_FAB_HIDDEN_KEY) === '1';
    const fabWrapEarlyInit = document.getElementById('ccGlobalChatFab');
    if (fabWrapEarlyInit && isFabHiddenOnInit) {
      fabWrapEarlyInit.classList.add('is-fab-hidden');
      fabWrapEarlyInit.setAttribute('aria-hidden', 'true');
      fabWrapEarlyInit.style.setProperty('display', 'none', 'important');
    }
    if (teaserBubble && isFabHiddenOnInit) {
      teaserBubble.classList.add('is-hidden');
      teaserBubble.hidden = true;
      teaserBubble.style.setProperty('display', 'none', 'important');
    }
    if (teaserBubble && activeAssistant && !isFabHiddenOnInit) {
      try { sessionStorage.removeItem('cc_teaser_dismissed'); } catch (_) {}
      teaserBubble.classList.remove('is-fading', 'is-hidden');
      teaserBubble.hidden = false;
      teaserBubble.style.removeProperty('display');

      refreshAssistantUI(activeAssistant);
      applyTeaserPageTheme(teaserBubble);

      if (typeof MutationObserver === 'function') {
        const themeObserver = new MutationObserver(() => applyTeaserPageTheme(teaserBubble));
        if (document.documentElement) themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-lumina-theme', 'class', 'style'] });
        if (document.body) themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });
      }
      window.addEventListener('lumina-theme-change', () => applyTeaserPageTheme(teaserBubble));

      if (checkTeaserVideoCollision()) {
        hideTeaserImmediately();
      } else {
        scheduleTeaserAutoHide();
        setTimeout(() => {
          if (!isTeaserDismissed && checkTeaserVideoCollision()) hideTeaserImmediately();
        }, 150);
        setTimeout(() => {
          if (!isTeaserDismissed && checkTeaserVideoCollision()) hideTeaserImmediately();
        }, 600);
        window.addEventListener('scroll', () => {
          if (!isTeaserDismissed && checkTeaserVideoCollision()) hideTeaserImmediately();
        }, { passive: true });
      }
      teaserBubble.addEventListener('mouseenter', () => {
        if (teaserAutoHideTimer) { clearTimeout(teaserAutoHideTimer); teaserAutoHideTimer = null; }
      });
      teaserBubble.addEventListener('mouseleave', scheduleTeaserAutoHide);
      teaserBubble.addEventListener('focusin', () => {
        if (teaserAutoHideTimer) { clearTimeout(teaserAutoHideTimer); teaserAutoHideTimer = null; }
      });
      teaserBubble.addEventListener('focusout', scheduleTeaserAutoHide);

      function handleTeaserClick(e) {
        if (e.target && (e.target.id === 'ccChatTeaserClose' || e.target.closest('#ccChatTeaserClose'))) return;
        e.preventDefault();
        e.stopPropagation();
        const asst = getActiveAssistant();
        try {
          sessionStorage.setItem('cc_active_assistant_id', asst.id);
        } catch (_) {}
        dismissTeaserBubble(true);
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
          dismissTeaserBubble(true);
        });
      }
    }

    const drawerRoot = overlay.querySelector('.cc-chat-drawer');
    const headerMoreToggleBtn = document.getElementById('ccHeaderMoreToggleBtn');
    function setBarsExpanded(expanded) {
      if (!drawerRoot) return;
      drawerRoot.classList.toggle('cc-bars-expanded', Boolean(expanded));
      if (headerMoreToggleBtn) {
        headerMoreToggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      }
    }
    headerMoreToggleBtn?.addEventListener('click', function () {
      const next = !drawerRoot?.classList.contains('cc-bars-expanded');
      setBarsExpanded(next);
    });

    // Podpięcie przełącznika trybu: Czat ogólny vs Asystentki CC (3 do wyboru)
    document.getElementById('ccModePublicBtn')?.addEventListener('click', function () {
      if (!currentChatPartner || !currentChatPartner.isPublic) {
        setChatPartner(COMMUNITY_MEMBERS[0]);
      }
      setChatMode('public');
      setBarsExpanded(false);
      scrollToBottom();
    });
    document.getElementById('ccModeAssistantBtn')?.addEventListener('click', function () {
      setChatMode('assistant');
      scrollToBottom();
    });
    document.getElementById('ccPublicBackBtn')?.addEventListener('click', function () {
      setChatPartner(COMMUNITY_MEMBERS[0]);
      setChatMode('public');
      setBarsExpanded(false);
      scrollToBottom();
    });

    // Podpięcie przełączania trio asystentek (Rut / Lea / Noemi)
    document.querySelectorAll('.cc-trio-card').forEach(btn => {
      btn.addEventListener('click', function() {
        const aid = btn.getAttribute('data-asst-id');
        window.selectAssistantAndRefresh(aid);
        if (chatMode !== 'assistant') {
          setChatMode('assistant');
        }
        setBarsExpanded(false);
      });
    });

    // Pigułki pod banerem
    document.getElementById('ccPillRadio')?.addEventListener('click', function() {
      toggleMiniPlayer();
    });
    document.getElementById('ccPillBible')?.addEventListener('click', function() {
      setChatMode('assistant');
      sendAssistantMessage('Gdzie znajdę Biblię i rozważania?');
    });
    document.getElementById('ccPillDiscover')?.addEventListener('click', function() {
      setChatMode('assistant');
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

    const settingsBtn = document.getElementById('ccChatSettingsBtn');
    const notifBtn = document.getElementById('ccChatNotifBtn');

    function refreshDrawerSettingsUI() {
      const soundToggle = document.getElementById('ccDrawerSoundToggle');
      if (soundToggle) {
        let soundOn = true;
        try { soundOn = localStorage.getItem('lumina_chat_sound_enabled') !== 'false'; } catch (_) {}
        soundToggle.checked = soundOn;
      }
      const statusEl = document.getElementById('ccDrawerAccountStatus');
      const actionBtn = document.getElementById('ccDrawerAccountActionBtn');
      const user = getUserState();
      if (statusEl) {
        statusEl.textContent = user.isLoggedIn
          ? `Zalogowano: ${user.name}`
          : 'Tryb gościa — zaloguj się, aby wysyłać na Czacie Ogólnym';
      }
      if (actionBtn) {
        if (typeof window.openChatSettingsModal === 'function') {
          actionBtn.textContent = user.isLoggedIn ? 'Pełne ustawienia konta' : 'Zaloguj / Ustawienia';
        } else {
          actionBtn.textContent = user.isLoggedIn ? 'Mój profil LUMINA' : 'Zaloguj się do LUMINA';
        }
      }
    }

    function switchTab(targetId) {
      allTabs.forEach(t => {
        if (!t.btn || !t.view) return;
        const isTarget = t.id === targetId || (targetId === 'chat' && t.id === 'live');
        t.btn.classList.toggle('is-active', isTarget);
        t.btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        t.view.classList.toggle('is-active', isTarget);
      });

      if (settingsBtn) {
        const inMore = targetId === 'more';
        settingsBtn.classList.toggle('is-active', inMore);
        settingsBtn.setAttribute('aria-expanded', inMore ? 'true' : 'false');
      }

      if (targetId === 'more') {
        refreshDrawerSettingsUI();
      } else if (targetId === 'members') {
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

    settingsBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isAlreadyMore = viewMore && viewMore.classList.contains('is-active');
      switchTab(isAlreadyMore ? 'live' : 'more');
    });

    notifBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      switchTab('more');
      const soundCard = document.getElementById('ccDrawerSoundCard');
      soundCard?.scrollIntoView?.({ block: 'nearest' });
    });

    document.getElementById('ccDrawerSoundToggle')?.addEventListener('change', (e) => {
      const enabled = !!e.target.checked;
      try { localStorage.setItem('lumina_chat_sound_enabled', enabled ? 'true' : 'false'); } catch (_) {}
      if (typeof window.toggleChatSoundSetting === 'function') {
        try { window.toggleChatSoundSetting(enabled); } catch (_) {}
      }
    });

    document.getElementById('ccDrawerAccountActionBtn')?.addEventListener('click', () => {
      if (typeof window.openChatSettingsModal === 'function') {
        window.openChatSettingsModal();
        return;
      }
      const user = getUserState();
      window.location.href = user.isLoggedIn ? '/lumina-tablica.html' : '/lumina-login?next=%2F';
    });

    document.getElementById('ccMoreGoPublicBtn')?.addEventListener('click', () => {
      setChatPartner(COMMUNITY_MEMBERS[0]);
      setChatMode('public');
      switchTab('live');
    });

    document.getElementById('ccMoreGoAsstBtn')?.addEventListener('click', () => {
      setChatMode('assistant');
      switchTab('live');
    });

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
          if (q) {
            setChatMode('assistant');
            sendAssistantMessage(q);
          }
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
          chatInput.placeholder = 'Napisz wiadomość';
          isListening = false;
        };
        recognition.onend = () => {
          micBtn.classList.remove('is-listening');
          chatInput.placeholder = 'Napisz wiadomość';
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
    function getActiveMessagesContainer() {
      return document.getElementById(chatMode === 'assistant' ? 'ccAssistantMessagesList' : 'ccChatMessagesList');
    }

    function scrollToBottom() {
      if (!feed) return;
      const msgList = getActiveMessagesContainer();
      const msgRows = msgList ? msgList.querySelectorAll('.cc-chat-msg-row') : [];
      if (msgRows.length === 0) {
        feed.scrollTop = 0;
        return;
      }
      feed.scrollTop = feed.scrollHeight;
    }

    if (feed && scrollBottomBtn) {
      feed.addEventListener('scroll', () => {
        const msgList = getActiveMessagesContainer();
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

    // Asystentka CC: wysyłanie wiadomości wyłącznie do wydzielonego strumienia wybranej asystentki
    function sendAssistantMessage(text) {
      if (!text || !text.trim()) return;
      if (chatMode !== 'assistant') setChatMode('assistant');
      const cleanText = text.trim();
      const asst = getActiveAssistant();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (!assistantHistories[asst.id]) assistantHistories[asst.id] = [];
      assistantHistories[asst.id].push({ sender: 'user', text: cleanText, timeStr });
      renderAssistantMessages();
      scrollToBottom();

      // Automatyczne zwijanie dużego baneru po wysłaniu wiadomości, by zrobić miejsce
      // Pasek wyboru 3 Asystentek (#ccAssistantSelectorStrip) pozostaje zawsze przypięty na górze
      if (showcaseEl && !isShowcaseCollapsed) {
        isShowcaseCollapsed = true;
        showcaseEl.classList.add('is-collapsed');
        if (toggleIcon) toggleIcon.textContent = '▸';
      }

      // Wskaźnik pisania + zapytanie do /api/lumi-chat (z bezpiecznym fallbackiem lokalnym)
      const histSnapshot = (assistantHistories[asst.id] || [])
        .slice(-5, -1)
        .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', text: m.sender === 'user' ? m.text : m.reply }));

      const typingEntry = {
        sender: 'assistant',
        reply: `${asst.name} przygotowuje odpowiedź…`,
        actions: [],
        timeStr,
        _typing: true
      };
      assistantHistories[asst.id].push(typingEntry);
      if (getActiveAssistant().id === asst.id) {
        renderAssistantMessages();
        scrollToBottom();
      }

      const replaceTyping = (answer) => {
        const list = assistantHistories[asst.id] || [];
        const idx = list.indexOf(typingEntry);
        const entry = {
          sender: 'assistant',
          reply: answer.reply,
          actions: answer.actions || [],
          timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        if (idx !== -1) list[idx] = entry;
        else list.push(entry);
        if (getActiveAssistant().id === asst.id) {
          renderAssistantMessages();
          scrollToBottom();
        }
      };

      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = ctrl ? setTimeout(() => ctrl.abort(), 7000) : null;
      fetch('/api/lumi-chat', {
        method: 'POST',
        signal: ctrl ? ctrl.signal : undefined,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId: asst.id, message: cleanText, history: histSnapshot })
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (timer) clearTimeout(timer);
          if (data && data.ok && data.reply) {
            replaceTyping({ reply: data.reply, actions: data.actions || [] });
          } else {
            replaceTyping(getAssistantAnswer(cleanText, asst));
          }
        })
        .catch(() => {
          if (timer) clearTimeout(timer);
          replaceTyping(getAssistantAnswer(cleanText, asst));
        });
    }

    // Czat Ogólny i rozmowy 1:1: wysyłanie do chmury LUMINA (bez ingerencji asystentek)
    function sendPendingPublicMessage(pending) {
      pending._status = 'sending';
      Promise.resolve(window.LuminaDB.sendPublicChatMessage({
        text: pending.text,
        senderId: pending.senderId,
        senderName: pending.senderName,
        senderAvatar: pending.senderAvatar,
        senderBadge: pending.senderBadge
      })).then((id) => {
        if (id && !String(id).startsWith('local_')) {
          pending._status = 'sent';
          pending._realId = id;
        } else {
          pending._status = 'failed';
        }
        renderChatMessages();
        scrollToBottom();
      }).catch((err) => {
        console.warn('Public chat send error:', err);
        pending._status = 'failed';
        renderChatMessages();
      });
    }
    window.ccRetryPublicMessage = function (pendingId) {
      const p = pendingPublicMessages.find(x => x.id === pendingId);
      if (!p || !window.LuminaDB || typeof window.LuminaDB.sendPublicChatMessage !== 'function') return;
      renderChatMessages();
      sendPendingPublicMessage(p);
      renderChatMessages();
    };

    function sendCommunityMessage(text) {
      if (!text || !text.trim()) return;
      const cleanText = text.trim();
      const user = getUserState();
      const list = document.getElementById('ccChatMessagesList');

      if (!user.isLoggedIn || !user.uid) {
        if (list) {
          const prevNotice = list.querySelector('.cc-guest-send-notice');
          if (prevNotice) prevNotice.remove();
          const notice = document.createElement('div');
          notice.className = 'cc-guest-send-notice';
          notice.style.cssText = 'text-align:center;padding:14px 16px;margin-top:8px;border-radius:14px;background:rgba(216,173,87,0.1);border:1px solid rgba(216,173,87,0.35);color:#F7F8FC;font-size:0.84rem;line-height:1.5;';
          notice.innerHTML = `
            <div style="font-weight:700;color:#E2CC9A;margin-bottom:4px;">Aby wysłać wiadomość do społeczności, zaloguj się do LUMINA</div>
            <div style="color:#A5AEC4;margin-bottom:10px;">Goście mogą czytać czat lub przełączyć na zakładkę „Asystentki CC (3)”.</div>
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
              <a href="/lumina.html?action=login" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;min-height:44px;padding:0 16px;border-radius:999px;background:linear-gradient(135deg,#D8AD57,#B58A38);color:#0D1020;font-weight:700;font-size:0.8rem;text-decoration:none;">Zaloguj się 🕊️</a>
              <button type="button" class="cc-showcase-pill is-primary" style="min-height:44px;" onclick="window.setCCChatMode('assistant')">✨ Zapytaj Asystentkę CC</button>
            </div>
          `;
          list.appendChild(notice);
          scrollToBottom();
        }
        return;
      }

      if (currentChatPartner && currentChatPartner.isPublic) {
        if (window.LuminaDB && typeof window.LuminaDB.sendPublicChatMessage === 'function') {
          const now = new Date();
          const pending = {
            id: 'pending_' + now.getTime() + '_' + Math.random().toString(36).slice(2, 6),
            _pending: true,
            _status: 'sending',
            text: cleanText,
            senderId: user.slug || user.uid,
            senderAuthUid: user.uid,
            senderName: user.name,
            senderAvatar: user.avatar,
            senderBadge: user.badge,
            dateStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          pendingPublicMessages.push(pending);
          renderChatMessages();
          scrollToBottom();
          sendPendingPublicMessage(pending);
        }
      } else if (currentChatPartner) {
        const partnerId = currentChatPartner.slug || currentChatPartner.id;
        const myId = user.slug || user.uid;
        const chatId = (window.LuminaDB && typeof window.LuminaDB.getChatId === 'function')
          ? window.LuminaDB.getChatId(myId, partnerId)
          : [myId, partnerId].sort().join('_');
        if (window.LuminaDB && typeof window.LuminaDB.sendDirectMessageToCloud === 'function') {
          Promise.resolve(window.LuminaDB.sendDirectMessageToCloud(chatId, {
            text: cleanText,
            senderId: myId,
            senderAuthUid: user.uid,
            senderUid: user.uid,
            senderName: user.name,
            senderAvatar: user.avatar,
            senderBadge: user.badge,
            recipientId: partnerId
          })).then(() => scrollToBottom()).catch(err => console.warn('Direct chat send error:', err));
        }
      }
    }

    // Obsługa wysyłania z pola textarea zgodnie z aktywnym trybem
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const text = (chatInput.value || '').trim();
      if (!text) return;
      chatInput.value = '';
      if (chatMode === 'assistant') {
        sendAssistantMessage(text);
      } else {
        sendCommunityMessage(text);
      }
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
          <img src="${escapeHtml(m.avatar || '/images/chat/cc-chat-button-120.webp')}" alt="${escapeHtml(m.name)}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:1px solid var(--lumi-border);" onerror="this.src='/images/chat/cc-chat-button-120.webp'">
          <div class="cc-card-info">
            <span class="cc-card-title">${escapeHtml(m.name)}</span>
            <span class="cc-card-sub">${escapeHtml(m.desc || m.badge)}</span>
          </div>
          <span class="cc-qc-arrow">💬</span>
        </div>
      `).join('');

      list.querySelectorAll('[data-partner-id]').forEach(item => {
        item.addEventListener('click', () => {
          const mid = item.getAttribute('data-partner-id');
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

    // Otwieranie / zamykanie czatu + ochrona przed wirtualną klawiaturą (visualViewport)
    function syncGlobalChatViewportHeight() {
      try {
        if (!overlay.classList.contains('is-open')) return;
        const vv = window.visualViewport;
        const h = vv ? Math.round(vv.height) : window.innerHeight;
        if (h > 120) {
          document.documentElement.style.setProperty('--lumi-viewport-height', h + 'px');
        }
      } catch (_) {}
    }
    if (typeof window !== 'undefined' && window.visualViewport && !window.__ccChatViewportBound) {
      window.__ccChatViewportBound = true;
      window.visualViewport.addEventListener('resize', syncGlobalChatViewportHeight);
      window.visualViewport.addEventListener('scroll', syncGlobalChatViewportHeight);
    }

    function openChat() {
      hideTeaserImmediately();
      const fabWrapCurrent = (btn && typeof btn.closest === 'function' ? btn.closest('.cc-chat-fab-wrap') : null) || document.getElementById('ccGlobalChatFab');
      if (fabWrapCurrent) fabWrapCurrent.classList.remove('has-unread-message');
      syncChatOverlayTopLayer(overlay, true, true);
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('cc-chat-scroll-lock');
      syncGlobalChatViewportHeight();
      setChatMode(chatMode);
      renderChatMessages();
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
      document.documentElement.classList.remove('cc-chat-scroll-lock');
      try { document.documentElement.style.removeProperty('--lumi-viewport-height'); } catch (_) {}
      syncChatOverlayTopLayer(overlay, false, false);
    }

    if (overlay && typeof MutationObserver === 'function' && !overlay.dataset.ccTopLayerObserver) {
      overlay.dataset.ccTopLayerObserver = '1';
      new MutationObserver(() => {
        const isOpenNow = overlay.classList.contains('is-open');
        syncChatOverlayTopLayer(overlay, isOpenNow, false);
        document.documentElement.classList.toggle('cc-chat-scroll-lock', isOpenNow);
        if (!isOpenNow && document.body.style.overflow === 'hidden') {
          document.body.style.overflow = '';
        }
      }).observe(overlay, { attributes: true, attributeFilter: ['class'] });
    }

    // Przeciąganie ikony LUMI CZAT po całym ekranie + chowanie gestem w dół + odkrywanie wyłącznie po nadejściu wiadomości
    let suppressNextClickUntil = 0;

    (function initFabGesturesAndVisibility() {
      const fabWrap = (btn && typeof btn.closest === 'function' ? btn.closest('.cc-chat-fab-wrap') : null) || document.getElementById('ccGlobalChatFab');
      if (!fabWrap) return;

      if (typeof window.__ccFabGestureCleanup === 'function') {
        try { window.__ccFabGestureCleanup(); } catch (_) {}
      }

      const listenersToCleanup = [];
      function addCleanListener(target, type, handler, opts) {
        if (!target || typeof target.addEventListener !== 'function') return;
        target.addEventListener(type, handler, opts);
        listenersToCleanup.push(() => {
          try { target.removeEventListener(type, handler, opts); } catch (_) {}
        });
      }

      let hideAnimTimer = 0;
      let popInTimer = 0;
      let dropZoneEl = null;

      function isFabHidden() {
        return safeLsGet(CC_FAB_HIDDEN_KEY) === '1';
      }

      function getFabDimensions() {
        const target = btn || fabWrap;
        const rect = target && typeof target.getBoundingClientRect === 'function' ? target.getBoundingClientRect() : null;
        const w = Math.max(44, Math.round((rect && rect.width) || (target && target.offsetWidth) || 50));
        const h = Math.max(44, Math.round((rect && rect.height) || (target && target.offsetHeight) || 50));
        return { w, h };
      }

      function getViewportSize() {
        const docEl = document.documentElement;
        const vw = Math.max(320, Number(window.innerWidth || (docEl && docEl.clientWidth) || 1280));
        const vh = Math.max(320, Number(window.innerHeight || (docEl && docEl.clientHeight) || 800));
        return { vw, vh };
      }

      function clampFabPosition(left, top, fabW, fabH, allowBottomOverflow) {
        const { vw, vh } = getViewportSize();
        const minX = 8;
        const minY = 8;
        const maxX = Math.max(minX, vw - fabW - 8);
        const maxY = allowBottomOverflow
          ? Math.max(minY, vh - Math.round(fabH * 0.45))
          : Math.max(minY, vh - fabH - 8);
        return {
          left: Math.round(Math.min(Math.max(Number(left) || minX, minX), maxX)),
          top: Math.round(Math.min(Math.max(Number(top) || minY, minY), maxY))
        };
      }

      function readSavedFabPos() {
        const raw = safeLsGet(CC_FAB_POS_KEY);
        if (!raw) return null;
        try {
          const parsed = JSON.parse(raw);
          if (parsed && Number.isFinite(Number(parsed.left)) && Number.isFinite(Number(parsed.top))) {
            return { left: Number(parsed.left), top: Number(parsed.top) };
          }
        } catch (_) {}
        return null;
      }

      function saveFabPos(left, top) {
        try {
          safeLsSet(CC_FAB_POS_KEY, JSON.stringify({
            left: Math.round(left),
            top: Math.round(top),
            updatedAt: Date.now()
          }));
        } catch (_) {}
      }

      function updateTeaserQuadrant(left, top, fabW) {
        const { vw } = getViewportSize();
        const centerX = left + (fabW / 2);
        fabWrap.classList.toggle('cc-teaser-align-left', centerX < (vw / 2));
        fabWrap.classList.toggle('cc-teaser-below', top < 160);
      }

      function applyCustomFabPosition(left, top, persist) {
        const { w: fabW, h: fabH } = getFabDimensions();
        const clamped = clampFabPosition(left, top, fabW, fabH, false);
        fabWrap.classList.add('is-custom-positioned');
        fabWrap.style.setProperty('left', `${clamped.left}px`, 'important');
        fabWrap.style.setProperty('top', `${clamped.top}px`, 'important');
        fabWrap.style.setProperty('right', 'auto', 'important');
        fabWrap.style.setProperty('bottom', 'auto', 'important');
        updateTeaserQuadrant(clamped.left, clamped.top, fabW);
        if (persist) saveFabPos(clamped.left, clamped.top);
        return clamped;
      }

      function clearCustomPositionStyles() {
        fabWrap.classList.remove('is-custom-positioned', 'cc-teaser-align-left', 'cc-teaser-below');
        fabWrap.style.removeProperty('left');
        fabWrap.style.removeProperty('top');
        fabWrap.style.removeProperty('right');
        fabWrap.style.removeProperty('bottom');
      }

      function resetCustomFabPosition() {
        safeLsRemove(CC_FAB_POS_KEY);
        clearCustomPositionStyles();
        if (typeof window.Event === 'function' && typeof window.dispatchEvent === 'function') {
          try { window.dispatchEvent(new window.Event('resize')); } catch (_) {}
        }
        return getFabStateSnapshot();
      }

      function showDropZone(armed) {
        if (!document || !document.body) return;
        if (!dropZoneEl || !document.body.contains(dropZoneEl)) {
          dropZoneEl = document.getElementById('ccFabHideDropZone');
          if (!dropZoneEl) {
            dropZoneEl = document.createElement('div');
            dropZoneEl.id = 'ccFabHideDropZone';
            dropZoneEl.className = 'cc-fab-hide-dropzone';
            dropZoneEl.setAttribute('aria-hidden', 'true');
            document.body.appendChild(dropZoneEl);
          }
        }
        dropZoneEl.textContent = armed
          ? '✓ Puść, aby ukryć ikonę'
          : '↓ Przesuń w dół, aby ukryć';
        dropZoneEl.classList.add('is-visible');
        dropZoneEl.classList.toggle('is-armed', !!armed);
      }

      function hideDropZone() {
        if (!dropZoneEl) return;
        dropZoneEl.classList.remove('is-visible', 'is-armed');
      }

      function finalizeHiddenDomState() {
        if (!isFabHidden()) return;
        fabWrap.classList.remove('is-fab-hiding', 'is-fab-will-hide', 'is-fab-dragging', 'is-fab-popping-in');
        fabWrap.classList.add('is-fab-hidden');
        fabWrap.setAttribute('aria-hidden', 'true');
        fabWrap.style.setProperty('display', 'none', 'important');
        if (typeof hideTeaserImmediately === 'function') hideTeaserImmediately();
      }

      function showFabHiddenToast() {
        try {
          let toast = document.getElementById('ccFabHiddenToast');
          if (!toast) {
            toast = document.createElement('div');
            toast.id = 'ccFabHiddenToast';
            toast.style.cssText = 'position:fixed;right:18px;bottom:84px;z-index:2147483645;display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;background:rgba(15,15,15,0.96);border:1px solid rgba(212,169,74,0.45);color:#F5F2EA;font:600 13px/1.35 system-ui,-apple-system,sans-serif;box-shadow:0 12px 32px rgba(0,0,0,0.65);max-width:calc(100vw - 32px);';
            toast.innerHTML = '<span>Czat ukryty. Przywołasz go w <strong>Menu</strong> lub skrótem <strong>Alt+C</strong>.</span><button type="button" id="ccFabRestoreNowBtn" style="min-height:44px;padding:0 14px;border-radius:999px;border:1px solid #D4A94A;background:rgba(212,169,74,0.18);color:#E8C97A;font-weight:700;cursor:pointer;white-space:nowrap;">Przywróć</button>';
            document.body.appendChild(toast);
            toast.querySelector('#ccFabRestoreNowBtn')?.addEventListener('click', () => {
              revealFabOnIncomingMessage({ source: 'toast_restore', force: true, quiet: true });
              toast.remove();
            });
          }
          clearTimeout(toast.__ccTimer);
          toast.__ccTimer = setTimeout(() => { toast.remove(); }, 5500);
        } catch (_) {}
      }

      function hideFabByGesture(preserveLeft, preserveTop, hadCustomPos, options) {
        const opts = (options && typeof options === 'object') ? options : {};
        clearTimeout(hideAnimTimer);
        clearTimeout(popInTimer);
        hideDropZone();

        if (hadCustomPos && Number.isFinite(Number(preserveLeft)) && Number.isFinite(Number(preserveTop))) {
          saveFabPos(Number(preserveLeft), Number(preserveTop));
        }

        const nowTs = Date.now();
        safeLsSet(CC_FAB_HIDDEN_KEY, '1');
        safeLsSet(CC_FAB_HIDDEN_AT_KEY, String(nowTs));
        const curUnread = Math.max(0, Number(safeLsGet('lumina_messages_unread_count') || 0) || 0);
        safeLsSet(CC_FAB_UNREAD_AT_HIDE_KEY, String(curUnread));

        if (typeof hideTeaserImmediately === 'function') hideTeaserImmediately();

        const reduceMotion = (
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
        );

        if (opts.immediate || reduceMotion) {
          finalizeHiddenDomState();
          if (!opts.immediate) showFabHiddenToast();
          return getFabStateSnapshot();
        }

        fabWrap.classList.remove('is-fab-dragging', 'is-fab-will-hide', 'is-fab-popping-in');
        fabWrap.classList.add('is-fab-hiding');
        fabWrap.setAttribute('aria-hidden', 'true');
        hideAnimTimer = setTimeout(() => {
          finalizeHiddenDomState();
        }, 210);
        showFabHiddenToast();
        return getFabStateSnapshot();
      }

      function revealFabOnIncomingMessage(detail) {
        const d = (detail && typeof detail === 'object') ? detail : {};
        if (!d.force && (d.senderId || d.uid || d.authorUid || d.senderSlug)) {
          try {
            const me = typeof getUserState === 'function' ? getUserState() : null;
            if (me && me.isLoggedIn && me.uid) {
              const fromSameUid = (d.senderId && d.senderId === me.uid) || (d.uid && d.uid === me.uid) || (d.authorUid && d.authorUid === me.uid);
              const fromSameSlug = me.slug && d.senderSlug && d.senderSlug === me.slug;
              if (fromSameUid || fromSameSlug) return false;
            }
          } catch (_) {}
        }

        const wasHidden = isFabHidden() || fabWrap.classList.contains('is-fab-hidden') || fabWrap.classList.contains('is-fab-hiding');
        clearTimeout(hideAnimTimer);
        clearTimeout(popInTimer);

        safeLsRemove(CC_FAB_HIDDEN_KEY);
        safeLsRemove(CC_FAB_HIDDEN_AT_KEY);
        safeLsRemove(CC_FAB_UNREAD_AT_HIDE_KEY);

        fabWrap.classList.remove('is-fab-hiding', 'is-fab-will-hide', 'is-fab-hidden');
        fabWrap.setAttribute('aria-hidden', 'false');
        fabWrap.style.removeProperty('display');

        const savedPos = readSavedFabPos();
        if (savedPos) {
          applyCustomFabPosition(savedPos.left, savedPos.top, false);
        } else {
          clearCustomPositionStyles();
          if (typeof window.Event === 'function' && typeof window.dispatchEvent === 'function') {
            try { window.dispatchEvent(new window.Event('resize')); } catch (_) {}
          }
        }

        const overlayOpen = overlay && overlay.classList && overlay.classList.contains('is-open');
        if (!overlayOpen && !d.quiet) {
          fabWrap.classList.add('has-unread-message');
        }

        if (wasHidden) {
          fabWrap.classList.remove('is-fab-popping-in');
          fabWrap.classList.add('is-fab-popping-in');
          popInTimer = setTimeout(() => {
            fabWrap.classList.remove('is-fab-popping-in');
          }, 480);
        }
        return true;
      }

      function getFabStateSnapshot() {
        const savedPos = readSavedFabPos();
        const rect = typeof fabWrap.getBoundingClientRect === 'function' ? fabWrap.getBoundingClientRect() : null;
        return {
          hidden: isFabHidden() || fabWrap.classList.contains('is-fab-hidden'),
          hiddenAt: Number(safeLsGet(CC_FAB_HIDDEN_AT_KEY) || 0) || 0,
          customPosition: savedPos,
          isCustomPositioned: fabWrap.classList.contains('is-custom-positioned'),
          hasUnread: fabWrap.classList.contains('has-unread-message'),
          rect: rect ? {
            left: Math.round(rect.left || 0),
            top: Math.round(rect.top || 0),
            width: Math.round(rect.width || 0),
            height: Math.round(rect.height || 0)
          } : null
        };
      }

      hideFabController = function (opts) {
        const savedPos = readSavedFabPos();
        const hadCustom = fabWrap.classList.contains('is-custom-positioned') || !!savedPos;
        const rect = typeof fabWrap.getBoundingClientRect === 'function' ? fabWrap.getBoundingClientRect() : null;
        const preserveLeft = savedPos ? savedPos.left : (rect ? rect.left : 0);
        const preserveTop = savedPos ? savedPos.top : (rect ? rect.top : 0);
        return hideFabByGesture(preserveLeft, preserveTop, hadCustom, Object.assign({ immediate: true }, opts || {}));
      };
      revealFabController = revealFabOnIncomingMessage;
      resetFabPosController = resetCustomFabPosition;
      getFabStateController = getFabStateSnapshot;

      // Inicjalizacja stanu początkowego na podstawie localStorage (bez błysku przy odświeżeniu)
      if (isFabHidden()) {
        finalizeHiddenDomState();
      } else {
        fabWrap.classList.remove('is-fab-hidden');
        fabWrap.setAttribute('aria-hidden', 'false');
        const initialSavedPos = readSavedFabPos();
        if (initialSavedPos) {
          applyCustomFabPosition(initialSavedPos.left, initialSavedPos.top, false);
        }
      }

      // Obsługa przeciągania po całym ekranie i chowania gestem w dół
      if (btn && !btn.__ccGesturesBound) {
        btn.__ccGesturesBound = true;

        let activePointerId = null;
        let didDrag = false;
        let startClientX = 0;
        let startClientY = 0;
        let preDragLeft = 0;
        let preDragTop = 0;
        let preDragHadCustom = false;
        let grabOffsetX = 25;
        let grabOffsetY = 25;
        let currentDragLeft = 0;
        let currentDragTop = 0;
        let currentFabW = 50;
        let currentFabH = 50;
        let ySamples = [];
        let moveHandler = null;
        let upHandler = null;

        btn.addEventListener('dragstart', (ev) => {
          ev.preventDefault();
        });

        function cleanupPointerTrackers(pointerId) {
          if (moveHandler) {
            try { window.removeEventListener('pointermove', moveHandler); } catch (_) {}
            moveHandler = null;
          }
          if (upHandler) {
            try { window.removeEventListener('pointerup', upHandler); } catch (_) {}
            try { window.removeEventListener('pointercancel', upHandler); } catch (_) {}
            upHandler = null;
          }
          if (pointerId !== null && pointerId !== undefined && typeof btn.releasePointerCapture === 'function') {
            try { btn.releasePointerCapture(pointerId); } catch (_) {}
          }
          activePointerId = null;
        }

        function recordVelocitySample(y) {
          const now = Date.now();
          ySamples.push({ y, t: now });
          const cutoff = now - 130;
          while (ySamples.length > 2 && ySamples[0].t < cutoff) {
            ySamples.shift();
          }
        }

        function getRecentDownwardVelocity() {
          if (ySamples.length < 2) return 0;
          const first = ySamples[0];
          const last = ySamples[ySamples.length - 1];
          const dt = Math.max(12, last.t - first.t);
          return (last.y - first.y) / dt;
        }

        function evaluateHideTrigger(clientX, clientY, dy, dx, topVal) {
          const { vh } = getViewportSize();
          const fabCenterY = topVal + (currentFabH / 2);
          const startCenterY = preDragTop + (currentFabH / 2);
          const vy = getRecentDownwardVelocity();
          const mostlyVertical = dy > Math.abs(dx) * 1.15;
          const isFlickDown = dy >= 46 && vy >= 0.30 && dy > Math.abs(dx) * 1.2;
          const isBottomDockSwipeDown = startCenterY >= (vh * 0.72) && dy >= 42 && mostlyVertical;
          const isInBottomDropZone = didDrag && ((clientY >= vh - 58) || (fabCenterY >= vh - 46)) && dy >= 18;
          return {
            willHide: isFlickDown || isBottomDockSwipeDown || isInBottomDropZone,
            isFlickDown,
            isBottomDockSwipeDown,
            isInBottomDropZone
          };
        }

        addCleanListener(btn, 'pointerdown', (e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          if (isFabHidden()) return;
          if (activePointerId !== null && e.pointerId !== activePointerId) return;

          cleanupPointerTrackers(activePointerId);

          const { w: fabW, h: fabH } = getFabDimensions();
          currentFabW = fabW;
          currentFabH = fabH;
          const { vw, vh } = getViewportSize();
          const rect = typeof fabWrap.getBoundingClientRect === 'function' ? fabWrap.getBoundingClientRect() : null;
          const savedBefore = readSavedFabPos();
          const fallbackLeft = vw - fabW - (vw >= 768 ? 24 : 16);
          const fallbackTop = vh - fabH - 25;
          const baseLeft = (rect && rect.width > 0) ? rect.left : (savedBefore ? savedBefore.left : fallbackLeft);
          const baseTop = (rect && rect.height > 0) ? rect.top : (savedBefore ? savedBefore.top : fallbackTop);

          preDragHadCustom = fabWrap.classList.contains('is-custom-positioned') || !!savedBefore;
          preDragLeft = savedBefore ? savedBefore.left : baseLeft;
          preDragTop = savedBefore ? savedBefore.top : baseTop;
          currentDragLeft = baseLeft;
          currentDragTop = baseTop;

          activePointerId = e.pointerId !== undefined ? e.pointerId : 'mouse';
          didDrag = false;
          startClientX = Number(e.clientX || 0);
          startClientY = Number(e.clientY || 0);
          grabOffsetX = Math.min(Math.max(startClientX - baseLeft, 6), fabW - 6);
          grabOffsetY = Math.min(Math.max(startClientY - baseTop, 6), fabH - 6);
          ySamples = [{ y: startClientY, t: Date.now() }];

          moveHandler = (ev) => {
            const evId = ev.pointerId !== undefined ? ev.pointerId : 'mouse';
            if (evId !== activePointerId) return;
            const curX = Number(ev.clientX || 0);
            const curY = Number(ev.clientY || 0);
            const dx = curX - startClientX;
            const dy = curY - startClientY;
            recordVelocitySample(curY);

            if (!didDrag) {
              if (Math.hypot(dx, dy) < 8) return;
              didDrag = true;
              if (typeof hideTeaserImmediately === 'function') hideTeaserImmediately();
              fabWrap.classList.add('is-fab-dragging');
              if (e.pointerType === 'touch') {
                document.documentElement.classList.add('cc-fab-touch-dragging');
                const preventTouchScroll = (te) => {
                  if (te.cancelable) te.preventDefault();
                };
                const endTouchLock = () => {
                  document.documentElement.classList.remove('cc-fab-touch-dragging');
                  window.removeEventListener('touchmove', preventTouchScroll);
                  window.removeEventListener('touchend', endTouchLock);
                  window.removeEventListener('touchcancel', endTouchLock);
                  window.removeEventListener('pointerup', endTouchLock);
                  window.removeEventListener('pointercancel', endTouchLock);
                };
                window.addEventListener('touchmove', preventTouchScroll, { passive: false });
                window.addEventListener('touchend', endTouchLock, { once: true });
                window.addEventListener('touchcancel', endTouchLock, { once: true });
                window.addEventListener('pointerup', endTouchLock, { once: true });
                window.addEventListener('pointercancel', endTouchLock, { once: true });
              } else if (e.pointerId !== undefined && typeof btn.setPointerCapture === 'function') {
                try { btn.setPointerCapture(e.pointerId); } catch (_) {}
              }
            }

            if (typeof ev.preventDefault === 'function') ev.preventDefault();

            const rawLeft = curX - grabOffsetX;
            const rawTop = curY - grabOffsetY;
            const clampedDrag = clampFabPosition(rawLeft, rawTop, currentFabW, currentFabH, true);
            currentDragLeft = clampedDrag.left;
            currentDragTop = clampedDrag.top;

            fabWrap.classList.add('is-custom-positioned');
            fabWrap.style.setProperty('left', `${currentDragLeft}px`, 'important');
            fabWrap.style.setProperty('top', `${currentDragTop}px`, 'important');
            fabWrap.style.setProperty('right', 'auto', 'important');
            fabWrap.style.setProperty('bottom', 'auto', 'important');
            updateTeaserQuadrant(currentDragLeft, currentDragTop, currentFabW);

            const hideState = evaluateHideTrigger(curX, curY, dy, dx, currentDragTop);
            fabWrap.classList.toggle('is-fab-will-hide', hideState.willHide);
            showDropZone(hideState.willHide);
          };

          upHandler = (ev) => {
            const evId = ev.pointerId !== undefined ? ev.pointerId : 'mouse';
            if (evId !== activePointerId) return;

            const endX = Number(ev.clientX !== undefined ? ev.clientX : startClientX);
            const endY = Number(ev.clientY !== undefined ? ev.clientY : startClientY);
            recordVelocitySample(endY);
            const dx = endX - startClientX;
            const dy = endY - startClientY;
            const wasDrag = didDrag;
            const pid = e.pointerId;

            fabWrap.classList.remove('is-fab-dragging', 'is-fab-will-hide');
            hideDropZone();
            cleanupPointerTrackers(pid);

            if (!wasDrag) return;
            suppressNextClickUntil = Date.now() + 360;

            document.documentElement.classList.remove('cc-fab-touch-dragging');
            if (ev.type === 'pointerup' || ev.type === 'pointercancel') {
              const hideEval = evaluateHideTrigger(endX, endY, dy, dx, currentDragTop);
              if (hideEval.willHide) {
                hideFabByGesture(preDragLeft, preDragTop, preDragHadCustom, { immediate: false });
                return;
              }
            }

            applyCustomFabPosition(currentDragLeft, currentDragTop, true);
          };

          window.addEventListener('pointermove', moveHandler, { passive: false });
          window.addEventListener('pointerup', upHandler);
          window.addEventListener('pointercancel', upHandler);
        });
      }

      // Zmiana rozmiaru okna — utrzymuj przeniesioną ikonę w bezpiecznych granicach ekranu
      addCleanListener(window, 'resize', () => {
        if (isFabHidden()) return;
        if (fabWrap.classList.contains('is-custom-positioned') && !fabWrap.classList.contains('is-fab-dragging')) {
          const saved = readSavedFabPos();
          if (saved) applyCustomFabPosition(saved.left, saved.top, false);
        }
      });

      // Nasłuchuj wyłącznie faktycznie przychodzących wiadomości, aby odkryć ikonę po ukryciu
      function onIncomingMessageEvent(ev) {
        revealFabOnIncomingMessage((ev && ev.detail) || {});
      }

      addCleanListener(window, 'lumina:chat_message_received', onIncomingMessageEvent);
      addCleanListener(window, 'lumina:new_message', onIncomingMessageEvent);
      addCleanListener(window, 'lumina-push-message', onIncomingMessageEvent);
      addCleanListener(document, 'keydown', (ev) => {
        if (ev && ev.altKey && !ev.ctrlKey && !ev.metaKey && String(ev.key || '').toLowerCase() === 'c') {
          ev.preventDefault();
          revealFabOnIncomingMessage({ source: 'shortcut_alt_c', force: true, quiet: true });
          window.CCGlobalChat?.open?.('live');
        }
      });

      addCleanListener(window, 'storage', (ev) => {
        if (!ev) return;
        if (ev.key === CC_FAB_HIDDEN_KEY) {
          if (ev.newValue === '1') {
            finalizeHiddenDomState();
          } else {
            revealFabOnIncomingMessage({ source: 'storage_sync', force: true });
          }
        } else if (ev.key === 'lumina_messages_unread_count') {
          const nextCount = Math.max(0, Number(ev.newValue) || 0);
          const prevCount = Math.max(0, Number(ev.oldValue) || 0);
          if (isFabHidden() && nextCount > prevCount) {
            revealFabOnIncomingMessage({ source: 'storage_unread', unreadCount: nextCount });
          }
        }
      });

      function wrapUnreadBadgeHook() {
        if (typeof window.updateLuminaMessagesBadge !== 'function') return false;
        if (window.updateLuminaMessagesBadge.__ccFabWrapped) return true;
        const origUpdateBadge = window.updateLuminaMessagesBadge;
        const wrappedUpdateBadge = function (count) {
          const res = origUpdateBadge.apply(this, arguments);
          try {
            const nextCount = Math.max(0, Number(count) || 0);
            if (isFabHidden()) {
              const baseline = Number(safeLsGet(CC_FAB_UNREAD_AT_HIDE_KEY) || 0) || 0;
              if (nextCount > baseline) {
                safeLsSet(CC_FAB_UNREAD_AT_HIDE_KEY, String(nextCount));
                revealFabOnIncomingMessage({ source: 'unread_badge', unreadCount: nextCount });
              } else if (nextCount < baseline) {
                safeLsSet(CC_FAB_UNREAD_AT_HIDE_KEY, String(nextCount));
              }
            }
          } catch (_) {}
          return res;
        };
        wrappedUpdateBadge.__ccFabWrapped = true;
        window.updateLuminaMessagesBadge = wrappedUpdateBadge;
        return true;
      }

      if (!wrapUnreadBadgeHook()) {
        addCleanListener(window, 'DOMContentLoaded', () => { wrapUnreadBadgeHook(); });
        addCleanListener(window, 'load', () => { wrapUnreadBadgeHook(); });
      }

      window.__ccFabGestureCleanup = function () {
        clearTimeout(hideAnimTimer);
        clearTimeout(popInTimer);
        hideDropZone();
        while (listenersToCleanup.length) {
          const fn = listenersToCleanup.pop();
          try { fn(); } catch (_) {}
        }
      };
    })();

    if (btn) {
      btn.addEventListener('click', (e) => {
        if (Date.now() < suppressNextClickUntil) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
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

      if (
        safeLsGet(CC_FAB_HIDDEN_KEY) !== '1' &&
        !fabWrap.classList.contains('is-fab-hidden') &&
        !fabWrap.classList.contains('is-custom-positioned') &&
        !fabWrap.classList.contains('is-fab-dragging')
      ) {
        // 4. Wspólna pionowa kolumna z przyciskiem „do góry” (#backToTopBtn, właściciel: /js/cc-back-to-top.js).
        //    Przycisk „do góry” zostaje na dole; czat stoi zawsze NAD nim (oraz nad opcjonalną pigułką SMS), środek w tej samej osi pionowej.
        //    (L0 16.11.2026: ikona czatu zasłaniała przycisk przewijania i przesuwała się przez szerokość scrollbara.)
        let smsClearanceBottom = 0;
        const smsWidget = document.getElementById('ccSmsFloatWidget');
        if (smsWidget) {
          const smsCs = window.getComputedStyle(smsWidget);
          const smsRect = smsWidget.getBoundingClientRect();
          if (
            smsCs.display !== 'none' &&
            smsCs.visibility !== 'hidden' &&
            smsRect.width > 0 &&
            smsRect.height > 0 &&
            smsRect.top < window.innerHeight &&
            smsRect.bottom > 0
          ) {
            smsClearanceBottom = Math.round(window.innerHeight - smsRect.top) + 16;
          }
        }
        const btt = document.getElementById('backToTopBtn');
        const clientW = (document.documentElement && document.documentElement.clientWidth) || window.innerWidth;
        const fabW = fabBtn.offsetWidth || 48;
        if (btt) {
          const bttCs = window.getComputedStyle(btt);
          const bttRect = btt.getBoundingClientRect();
          const bttShown = bttRect.width > 0 && bttRect.height > 0;
          const bttCssBottom = parseFloat(bttCs.bottom);
          let bttBottom = bttShown ? (window.innerHeight - bttRect.bottom) : bttCssBottom;
          if (!Number.isFinite(bttBottom)) bttBottom = clientW >= 768 ? 24 : 16;
          const bttH = bttShown ? bttRect.height : (parseFloat(bttCs.height) || 48);
          const bttW = bttShown ? bttRect.width : (parseFloat(bttCs.width) || 48);
          const bttCssRight = parseFloat(bttCs.right);
          let bttRight = bttShown ? (clientW - bttRect.right) : bttCssRight;
          if (!Number.isFinite(bttRight)) bttRight = Number.isFinite(bttCssRight) ? bttCssRight : (clientW >= 768 ? 24 : 16);
          const stackedBottom = Math.max(bottomOffset, Math.round(bttBottom + bttH + 12), smsClearanceBottom);
          const alignedRight = Math.round(bttRight + (bttW - fabW) / 2);
          if (stackedBottom + fabH <= window.innerHeight * 0.8) {
            fabWrap.style.setProperty('bottom', `${stackedBottom}px`, 'important');
            fabWrap.style.setProperty('right', `${Math.max(0, alignedRight)}px`, 'important');
          }
        } else if (playerCenterFromBottom !== null) {
          const alignedBottom = Math.round(playerCenterFromBottom - (fabH / 2));
          fabWrap.style.setProperty('bottom', `${alignedBottom}px`, 'important');
        } else {
          fabWrap.style.setProperty('bottom', `${Math.max(bottomOffset, smsClearanceBottom)}px`, 'important');
          fabWrap.style.setProperty('right', clientW >= 768 ? '24px' : 'max(16px, env(safe-area-inset-right))', 'important');
        }
      }
    }

    // cc-back-to-top.js przelicza swoją pozycję w requestAnimationFrame — czytamy ją klatkę później.
    let adjustPending = false;
    function scheduleAdjust() {
      if (adjustPending) return;
      adjustPending = true;
      requestAnimationFrame(() => requestAnimationFrame(() => { adjustPending = false; adjust(); }));
    }
    function watchBackToTop() {
      const btt = document.getElementById('backToTopBtn');
      if (!btt || btt.dataset.ccChatWatch === '1' || typeof MutationObserver === 'undefined') return;
      btt.dataset.ccChatWatch = '1';
      new MutationObserver(scheduleAdjust).observe(btt, { attributes: true, attributeFilter: ['style'] });
    }
    setTimeout(watchBackToTop, 300);
    setTimeout(watchBackToTop, 1500);

    window.addEventListener('resize', scheduleAdjust, { passive: true });
    window.addEventListener('scroll', scheduleAdjust, { passive: true });
    setTimeout(adjust, 100);
    setTimeout(adjust, 300);
    setTimeout(adjust, 1000);
  }
    // Funkcja była zdefiniowana, ale nigdy nie uruchamiana — bez tego czat zostawał na 25 px i zasłaniał #backToTopBtn.
    const fabWrapForSync = document.getElementById('ccGlobalChatFab');
    if (fabWrapForSync) setupPositionSync(fabWrapForSync);
    if (typeof renderPartnersBar === 'function') renderPartnersBar();
    if (typeof setChatPartner === 'function' && typeof COMMUNITY_MEMBERS !== 'undefined' && COMMUNITY_MEMBERS.length > 0) {
      setChatPartner(COMMUNITY_MEMBERS[0]);
    }
  }

  // ── Wiadomość z Nieba (@007, L0 23.11.2026): karta 1:1 na szablonie L0 + Pobierz PNG + Udostępnij ──
  const WZN_TEMPLATE = '/images/wiadomosc-z-nieba/szablon-1x1.jpg';
  function wznEnsureFonts() {
    if (document.getElementById('wzn-chat-fonts')) return;
    const l = document.createElement('link');
    l.id = 'wzn-chat-fonts';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Cormorant+Garamond:ital,wght@1,600&display=swap';
    document.head.appendChild(l);
  }
  function wznVerseSize(len) {
    return len <= 70 ? 4.8 : len <= 100 ? 4.2 : len <= 130 ? 3.7 : len <= 170 ? 3.2 : 2.8;
  }
  function renderWznChatCard(m) {
    wznEnsureFonts();
    const w = m.wzn || {};
    const verse = String(w.verseText || '');
    const ref = String(w.reference || '');
    const vEsc = escapeHtml(verse);
    const rEsc = escapeHtml(ref);
    const dEsc = escapeHtml(String(w.runDate || ''));
    const uEsc = escapeHtml(String(w.pageUrl || 'https://polskieradio.cc/wiadomosc-z-nieba/'));
    const size = wznVerseSize(verse.length);
    const btn = 'min-height:44px;min-width:44px;padding:10px 14px;border-radius:999px;font:600 0.8rem/1.2 inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;';
    return `
      <div class="cc-wzn-card-wrap" style="margin-top:10px;">
        <div class="cc-wzn-card" role="img" aria-label="Grafika Wiadomość z Nieba: „${vEsc}” — ${rEsc}"
          style="position:relative;width:100%;max-width:340px;aspect-ratio:1/1;border-radius:14px;overflow:hidden;container-type:inline-size;background:#000 url('${WZN_TEMPLATE}') center/cover no-repeat;box-shadow:0 8px 24px rgba(0,0,0,.5);">
          <div style="position:absolute;left:45%;right:5%;top:23%;bottom:17%;display:flex;flex-direction:column;justify-content:center;gap:2cqw;text-align:left;">
            <span style="font:600 2.1cqw/1.2 'Cinzel',Georgia,serif;letter-spacing:.2em;text-transform:uppercase;color:#ff3b3b;">Masz nową wiadomość</span>
            <p style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:600;font-size:${size}cqw;line-height:1.28;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.85);">„${vEsc}”</p>
            <span style="font:600 2.6cqw/1.3 'Cinzel',Georgia,serif;color:#d9d9de;">${rEsc}<small style="display:block;margin-top:.5cqw;font:500 1.8cqw/1.3 system-ui,sans-serif;color:#9a9aa3;">Biblia UBG-2025</small></span>
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
          <button type="button" onclick="window.wznChatDownload(this)" data-wzn-verse="${vEsc}" data-wzn-ref="${rEsc}" data-wzn-date="${dEsc}" data-wzn-url="${uEsc}"
            style="${btn}background:linear-gradient(180deg,#ff3b3b,#e3121b);color:#fff;border:0;" aria-label="Pobierz grafikę z wersetem">⬇ Pobierz grafikę</button>
          <button type="button" onclick="window.wznChatShare(this)" data-wzn-verse="${vEsc}" data-wzn-ref="${rEsc}" data-wzn-date="${dEsc}" data-wzn-url="${uEsc}"
            style="${btn}background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.25);" aria-label="Udostępnij grafikę z wersetem">↗ Udostępnij</button>
        </div>
        <div class="cc-wzn-feedback" aria-live="polite" style="min-height:1.2em;margin-top:4px;font-size:0.75rem;color:#A5AEC4;"></div>
      </div>`;
  }
  function wznWrap(ctx, text, maxW) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; } else { line = test; }
    }
    if (line) lines.push(line);
    return lines;
  }
  async function wznRenderPng(verse, ref) {
    wznEnsureFonts();
    try {
      await Promise.all([
        document.fonts.load('italic 600 48px "Cormorant Garamond"'),
        document.fonts.load('600 28px "Cinzel"'),
      ]);
    } catch (e) {}
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = WZN_TEMPLATE;
    });
    const S = 1080;
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, S, S);
    const x = S * 0.45, w = S * 0.5, top = S * 0.23, bottom = S * 0.83;
    const vt = '„' + verse + '”';
    let size = 50, lines = [], lh = 64;
    for (; size >= 26; size -= 2) {
      ctx.font = 'italic 600 ' + size + 'px "Cormorant Garamond", Georgia, serif';
      lines = wznWrap(ctx, vt, w);
      lh = size * 1.28;
      if (lines.length * lh + 160 <= bottom - top) break;
    }
    let y = top + Math.max(0, (bottom - top - (60 + lines.length * lh + 100)) / 2);
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#ff3b3b';
    ctx.font = '600 22px "Cinzel", Georgia, serif';
    ctx.fillText('MASZ NOWĄ WIADOMOŚĆ', x, y);
    const g = ctx.createLinearGradient(x, 0, x + 100, 0);
    g.addColorStop(0, '#ff3b3b'); g.addColorStop(1, 'rgba(255,59,59,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y + 40, 100, 4);
    y += 60;
    ctx.font = 'italic 600 ' + size + 'px "Cormorant Garamond", Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 12;
    lines.forEach(l => { ctx.fillText(l, x, y); y += lh; });
    ctx.shadowBlur = 0;
    y += 30;
    ctx.fillStyle = '#d9d9de';
    ctx.font = '600 28px "Cinzel", Georgia, serif';
    ctx.fillText(ref, x, y);
    ctx.fillStyle = '#9a9aa3';
    ctx.font = '500 20px system-ui, sans-serif';
    ctx.fillText('Biblia UBG-2025', x, y + 40);
    return new Promise(resolve => c.toBlob(resolve, 'image/png'));
  }
  function wznFeedback(btn, msg) {
    const box = btn.closest('.cc-wzn-card-wrap');
    const fb = box && box.querySelector('.cc-wzn-feedback');
    if (fb) fb.textContent = msg;
  }
  window.wznChatDownload = async function(btn) {
    const d = btn.dataset;
    wznFeedback(btn, 'Przygotowuję grafikę…');
    try {
      const blob = await wznRenderPng(d.wznVerse || '', d.wznRef || '');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'wiadomosc-z-nieba-' + (d.wznDate || 'dzis') + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      wznFeedback(btn, 'Grafika 1080×1080 pobrana.');
    } catch (e) {
      wznFeedback(btn, 'Nie udało się przygotować grafiki. Spróbuj ponownie.');
    }
  };
  window.wznChatShare = async function(btn) {
    const d = btn.dataset;
    const text = '„' + (d.wznVerse || '') + '” — ' + (d.wznRef || '') + ' (UBG-2025)';
    const url = d.wznUrl || 'https://polskieradio.cc/wiadomosc-z-nieba/';
    try {
      if (navigator.share) {
        const blob = await wznRenderPng(d.wznVerse || '', d.wznRef || '').catch(() => null);
        const file = blob ? new File([blob], 'wiadomosc-z-nieba-' + (d.wznDate || 'dzis') + '.png', { type: 'image/png' }) : null;
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: 'Wiadomość z Nieba', text, url, files: [file] });
        } else {
          await navigator.share({ title: 'Wiadomość z Nieba', text, url });
        }
        wznFeedback(btn, 'Dziękujemy za udostępnienie.');
      } else {
        await navigator.clipboard.writeText(text + '\n' + url);
        wznFeedback(btn, 'Tekst i link skopiowane. Grafikę zapiszesz przyciskiem „Pobierz grafikę”.');
      }
    } catch (e) {
      if (!e || e.name !== 'AbortError') wznFeedback(btn, 'Nie udało się udostępnić — użyj „Pobierz grafikę”.');
    }
  };

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
    // @007 (L0 23.11.2026): małe „L” przy wiadomości czatu publikuje treść tej wiadomości na Tablicy LUMINA.
    window.ccChatShareToLumina = function(btn) {
      const sender = btn.getAttribute('data-share-sender') || 'Czat LUMINA';
      const text = btn.getAttribute('data-share-text') || '';
      const payload = {
        title: '💬 ' + sender + ' • Czat Ogólny LUMINA',
        text: text,
        url: 'https://polskieradio.cc/lumina?openPublicChat=1',
        imageUrl: '',
        videoUrl: ''
      };
      if (typeof window.shareToLumina === 'function') {
        window.shareToLumina(payload);
        return;
      }
      const q = new URLSearchParams({ share_title: payload.title, share_text: text.slice(0, 1800), share_url: payload.url, url: payload.url });
      window.open('/lumina-tablica.html?' + q.toString(), '_blank');
    };

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
        modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.78); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); z-index:2147483647; display:flex; align-items:center; justify-content:center; padding:16px; opacity:0; pointer-events:none; transition:opacity 0.2s ease;';
      }
      document.body.appendChild(modal);

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

  let dailyDialogueCache = null;
  let dailyDialogueFetching = false;
  let dailyDialogueCollapsed = true;
  // @007 (L0 23.11.2026): po 6 s zwinięte rozważanie chowa się do czerwonego języczka „Rozważanie”.
  let dailyDialogueMini = false;
  let dailyDialogueMiniTimer = null;
  const DAILY_DIALOGUE_MINI_AFTER_MS = 6000;
  function scheduleDailyDialogueMini() {
    clearTimeout(dailyDialogueMiniTimer);
    if (!dailyDialogueCollapsed || dailyDialogueMini) return;
    dailyDialogueMiniTimer = setTimeout(() => {
      if (!dailyDialogueCollapsed) return;
      dailyDialogueMini = true;
      const card = document.getElementById('ccPublicDailyDialogue');
      if (card) card.classList.add('is-mini');
    }, DAILY_DIALOGUE_MINI_AFTER_MS);
  }
  let dailyDialogueTimer = null;
  let dailyLastVisibleCount = -1;

  function getWarsawDaySeconds() {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Warsaw',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).formatToParts(new Date());
      const h = Number(parts.find(p => p.type === 'hour')?.value || 0);
      const m = Number(parts.find(p => p.type === 'minute')?.value || 0);
      const s = Number(parts.find(p => p.type === 'second')?.value || 0);
      return (h % 24) * 3600 + m * 60 + s;
    } catch {
      const d = new Date();
      return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
    }
  }

  function getDailyDialogueLiveState(d) {
    const turns = Array.isArray(d?.turns) ? d.turns : [];
    const total = turns.length;
    const step = Number(d?.stepSeconds) || 18;
    const sessions = Array.isArray(d?.sessions) && d.sessions.length ? d.sessions : ['09:00', '19:00'];
    const nowSec = getWarsawDaySeconds();
    const duration = total * step;

    for (const label of sessions) {
      const [hh, mm] = String(label).split(':').map(Number);
      const startSec = (hh || 0) * 3600 + (mm || 0) * 60;
      const elapsed = nowSec - startSec;
      if (elapsed >= 0 && elapsed < duration) {
        const visibleCount = Math.min(total, Math.floor(elapsed / step) + 1);
        const nextInSec = visibleCount < total ? (step - (elapsed % step)) : 0;
        return { isLive: true, sessionLabel: label, visibleCount, total, nextInSec, sessions };
      }
    }
    return { isLive: false, sessionLabel: '', visibleCount: total, total, nextInSec: 0, sessions };
  }

  function ensureDailyDialogueTicker() {
    if (dailyDialogueTimer) return;
    dailyDialogueTimer = setInterval(() => {
      if (!dailyDialogueCache || !currentChatPartner || !currentChatPartner.isPublic || chatMode !== 'public') {
        clearInterval(dailyDialogueTimer);
        dailyDialogueTimer = null;
        return;
      }
      const st = getDailyDialogueLiveState(dailyDialogueCache);
      if (!st.isLive) {
        if (dailyLastVisibleCount !== st.total) {
          dailyLastVisibleCount = st.total;
          renderChatMessages();
        }
        clearInterval(dailyDialogueTimer);
        dailyDialogueTimer = null;
        return;
      }
      if (st.visibleCount !== dailyLastVisibleCount) {
        dailyLastVisibleCount = st.visibleCount;
        renderChatMessages();
        return;
      }
      const cd = document.getElementById('ccDailyDialogueCountdown');
      if (cd) {
        cd.textContent = st.nextInSec > 0 ? `Kolejna myśl za ${st.nextInSec} s` : 'Finał sesji na żywo';
      }
    }, 1000);
  }

  function renderDailyDialogueCardHtml() {
    if (!dailyDialogueCache || !Array.isArray(dailyDialogueCache.turns) || !dailyDialogueCache.turns.length) {
      if (!dailyDialogueFetching && typeof fetch === 'function') {
        dailyDialogueFetching = true;
        fetch('/api/lumi-chat?daily=1')
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data && data.ok && data.dialogue) {
              dailyDialogueCache = data.dialogue;
              if (currentChatPartner && currentChatPartner.isPublic) {
                renderChatMessages();
                if (chatMode === 'public' && typeof scrollToBottom === 'function') scrollToBottom();
              }
            }
          })
          .catch(() => {});
      }
      return '';
    }
    const d = dailyDialogueCache;
    const liveState = getDailyDialogueLiveState(d);
    dailyLastVisibleCount = liveState.visibleCount;
    if (liveState.isLive) ensureDailyDialogueTicker();

    const shownTurns = d.turns.slice(0, liveState.visibleCount);
    const statusBadge = liveState.isLive
      ? `<span style="display:inline-flex;align-items:center;gap:5px;color:#34D399;font-weight:800;">● NA ŻYWO · ${escapeHtml(liveState.sessionLabel)}</span> <span id="ccDailyDialogueCountdown" style="color:#A5AEC4;font-weight:500;">${liveState.nextInSec > 0 ? `Kolejna myśl za ${liveState.nextInSec} s` : 'Finał sesji na żywo'}</span>`
      : `<span>☀️ Rozważanie dnia · Zapis (${escapeHtml(liveState.sessions.join(' i '))} NA ŻYWO)</span>`;

    const hosts = ROTATING_ASSISTANTS.slice(0, 4);
    const hostAvatarsHtml = hosts.map((a, idx) => `
      <img src="${escapeHtml(a.circleAvatar || a.avatar)}" alt="${escapeHtml(a.shortName)}" title="${escapeHtml(a.shortName + ' · ' + a.role)}" class="cc-daily-dialogue-host-avatar" style="z-index:${4 - idx};" onerror="this.onerror=null;this.src='${escapeHtml(a.avatarFallback || '/images/chat/cc-chat-button-120.webp')}'">
    `).join('');
    const hostNamesLabel = 'Rut, Lea, Noemi i Miriam';

    const turnsHtml = dailyDialogueCollapsed ? '' : `
      <div id="ccDailyDialogueBody" style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">
        ${shownTurns.map(t => `
          <div class="cc-daily-dialogue-turn" style="display:flex;gap:8px;align-items:flex-start;background:rgba(13,16,32,0.55);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:8px 10px;">
            <img src="${escapeHtml(t.avatar)}" alt="${escapeHtml(t.name)}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1.5px solid #D8AD57;flex-shrink:0;margin-top:2px;" onerror="this.src='/images/chat/cc-chat-button-120.webp'">
            <div style="min-width:0;flex:1;">
              <div style="font-size:0.74rem;font-weight:700;color:#E2CC9A;">${escapeHtml(t.name)} <span style="font-weight:500;color:#8E99B3;">· ${escapeHtml(t.role)}</span></div>
              <div style="font-size:0.8rem;line-height:1.45;color:#EEF1F8;margin-top:2px;">${escapeHtml(t.text)}</div>
            </div>
          </div>
        `).join('')}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
          <a href="${escapeHtml(d.lessonUrl || '/akademia/kurscodzienny')}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border-radius:999px;background:#FF7A00;color:#FFFFFF;font-weight:700;font-size:0.78rem;text-decoration:none;">📖 Czytaj całość${d.day ? ` (Dzień ${escapeHtml(String(d.day))})` : ''}</a>
          <button type="button" class="cc-showcase-pill is-primary" style="min-height:44px;font-size:0.78rem;" onclick="window.setCCChatMode('assistant')">✨ Zapytaj Asystentki (4)</button>
        </div>
        <button type="button" id="ccCloseDailyDialogueBottomBtn" class="cc-daily-dialogue-close-bottom" aria-controls="ccDailyDialogueBody" aria-label="Zwiń rozważanie dnia">▴ Zwiń rozważanie</button>
      </div>
    `;
    return `
      <div id="ccPublicDailyDialogue" class="cc-daily-dialogue-card ${dailyDialogueCollapsed ? 'is-collapsed' : 'is-expanded'}${dailyDialogueCollapsed && dailyDialogueMini ? ' is-mini' : ''}" data-collapsed="${dailyDialogueCollapsed ? 'true' : 'false'}" style="border:1px solid rgba(216,173,87,0.32);background:linear-gradient(145deg,rgba(24,29,56,0.92),rgba(14,18,36,0.95));border-radius:16px;padding:12px 13px;margin-bottom:6px;box-shadow:0 6px 20px rgba(0,0,0,0.28);">
        <button type="button" id="ccDailyDialogueTab" class="cc-daily-dialogue-tab" aria-label="Rozwiń rozważanie dnia">☀️ Rozważanie</button>
        <div id="ccDailyDialogueHeader" class="cc-daily-dialogue-header">
          <div style="min-width:0;flex:1;">
            <div style="font-size:0.72rem;font-weight:800;letter-spacing:0.03em;color:#D8AD57;text-transform:uppercase;">${statusBadge}</div>
            <div style="font-size:0.86rem;font-weight:700;color:#FFFFFF;margin-top:2px;line-height:1.3;">${escapeHtml(d.title || 'Z Biblią za Pan Brat')}${d.reading ? ` <span style="color:#A5AEC4;font-weight:500;">(${escapeHtml(d.reading)})</span>` : ''}</div>
            <div class="cc-daily-dialogue-hosts">
              <span class="cc-daily-dialogue-avatars" aria-label="Prowadzące rozważanie: Rut, Lea, Noemi i Miriam">${hostAvatarsHtml}</span>
              <span class="cc-daily-dialogue-host-names">Prowadzą: ${escapeHtml(hostNamesLabel)}</span>
            </div>
          </div>
          <button type="button" id="ccToggleDailyDialogueBtn" aria-expanded="${!dailyDialogueCollapsed}" aria-controls="ccDailyDialogueBody" aria-label="${dailyDialogueCollapsed ? 'Rozwiń rozważanie dnia prowadzone przez cztery asystentki' : 'Zwiń rozważanie dnia'}" style="min-width:44px;min-height:44px;padding:0 10px;border-radius:10px;border:1px solid rgba(216,173,87,0.3);background:rgba(255,255,255,0.05);color:#E2CC9A;cursor:pointer;font-size:0.82rem;font-weight:700;flex-shrink:0;">${dailyDialogueCollapsed ? '▾ Rozwiń' : '▴ Zwiń'}</button>
        </div>
        ${turnsHtml}
      </div>
    `;
  }

  function toggleDailyDialogue() {
    dailyDialogueCollapsed = !dailyDialogueCollapsed;
    dailyDialogueMini = false;
    clearTimeout(dailyDialogueMiniTimer);
    renderChatMessages();
    if (!dailyDialogueCollapsed) {
      const card = document.getElementById('ccPublicDailyDialogue');
      if (card && typeof card.scrollIntoView === 'function') {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (typeof scrollToBottom === 'function') {
      scrollToBottom();
    }
  }

  function bindDailyDialogueToggle() {
    const tab = document.getElementById('ccDailyDialogueTab');
    if (tab) {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        dailyDialogueCollapsed = true; // toggle → rozwinięcie
        toggleDailyDialogue();
      });
    }
    if (document.getElementById('ccPublicDailyDialogue')) scheduleDailyDialogueMini();
    const bottomClose = document.getElementById('ccCloseDailyDialogueBottomBtn');
    if (bottomClose) {
      bottomClose.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDailyDialogue();
      });
    }
    const btn = document.getElementById('ccToggleDailyDialogueBtn');
    const header = document.getElementById('ccDailyDialogueHeader');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDailyDialogue();
      });
    }
    if (header) {
      header.addEventListener('click', (e) => {
        if (e.target.closest('button, a')) return;
        toggleDailyDialogue();
      });
    }
  }

  function ccNormChatId(v) {
    try {
      if (window.LuminaDB && typeof window.LuminaDB.normalizeChatUserId === 'function') return window.LuminaDB.normalizeChatUserId(v);
    } catch (_) {}
    return String(v || '').trim().toLowerCase().replace(/^u_/, '');
  }
  function renderPublicMsgStatus(m) {
    const wrap = (inner) => `<div class="cc-msg-status" style="display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:6px;margin-top:4px;font-size:0.72rem;color:#A5AEC4;">${inner}</div>`;
    if (m._pending) {
      if (m._status === 'failed') {
        return wrap(`<span style="color:#FF8A8A;">⚠️ Nie wysłano</span><button type="button" onclick="window.ccRetryPublicMessage('${escapeHtml(m.id)}')" style="min-height:44px;padding:0 12px;border-radius:999px;border:1px solid rgba(255,138,138,0.5);background:transparent;color:#FFB3B3;font-size:0.75rem;font-weight:700;cursor:pointer;">Spróbuj ponownie</button>`);
      }
      if (m._status === 'sent') return wrap('<span>✓ Wysłano</span>');
      return wrap('<span>⏳ Wysyłanie…</span>');
    }
    const senderNorm = ccNormChatId(m.senderId);
    const seen = [];
    const seenIds = new Set();
    (Array.isArray(m.seenBy) ? m.seenBy : []).forEach(e => {
      const id = ccNormChatId(typeof e === 'string' ? e : (e && e.id));
      if (!id || id === 'guest' || id === senderNorm || seenIds.has(id)) return;
      seenIds.add(id);
      seen.push(typeof e === 'string' ? { id } : e);
    });
    if (!seen.length) return wrap('<span>✓ Wysłano</span>');
    const shown = seen.slice(-6);
    const faces = shown.map((e, i) => {
      const member = COMMUNITY_MEMBERS.find(c => ccNormChatId(c.slug || c.id) === ccNormChatId(e.id));
      const name = e.name || (member && member.name) || 'Użytkownik LUMINA';
      const avRaw = String(e.avatar || (member && member.avatar) || '');
      const av = !avRaw ? '' : (/^(https?:|\/|data:|blob:)/i.test(avRaw) ? avRaw : '/' + avRaw.replace(/^\.\//, ''));
      const initials = name.split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
      const style = `width:22px;height:22px;border-radius:50%;border:1.5px solid #0D1020;margin-left:${i ? '-6px' : '0'};object-fit:cover;display:inline-flex;align-items:center;justify-content:center;background:#2A3150;color:#F2D17C;font-size:9px;font-weight:800;`;
      return av
        ? `<img src="${escapeHtml(av)}" alt="" title="${escapeHtml(name)}" style="${style}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${escapeHtml(initials)}',title:'${escapeHtml(name)}',style:this.getAttribute('style')}))">`
        : `<span title="${escapeHtml(name)}" style="${style}">${escapeHtml(initials)}</span>`;
    }).join('');
    const names = seen.map(e => e.name || e.id).join(', ');
    const more = seen.length > shown.length ? `<span>+${seen.length - shown.length}</span>` : '';
    return wrap(`<span style="color:#7DD3A8;">✓✓ Przeczytali (${seen.length})</span><span style="display:inline-flex;align-items:center;" aria-label="Przeczytali: ${escapeHtml(names)}" title="${escapeHtml(names)}">${faces}</span>${more}`);
  }

  function renderChatMessages() {
    const list = document.getElementById('ccChatMessagesList');
    if (!list) return;

    let msgs = getChatMessagesForPartner(currentChatPartner);
    const user = getUserState();
    const dailyHtml = currentChatPartner.isPublic ? renderDailyDialogueCardHtml() : '';
    if (currentChatPartner.isPublic && pendingPublicMessages.length) {
      const base = Array.isArray(msgs) ? msgs : [];
      const ids = new Set(base.map(x => x && x.id));
      for (let i = pendingPublicMessages.length - 1; i >= 0; i--) {
        if (pendingPublicMessages[i]._realId && ids.has(pendingPublicMessages[i]._realId)) pendingPublicMessages.splice(i, 1);
      }
      msgs = base.filter(x => !(x && String(x.id || '').startsWith('local_'))).concat(pendingPublicMessages);
    }

    if (!msgs || msgs.length === 0) {
      if (currentChatPartner.isPublic) {
        list.innerHTML = dailyHtml + `
          <div class="cc-chat-empty-state" style="text-align:center;padding:22px 14px;color:#A5AEC4;border:1px dashed rgba(216,173,87,0.22);border-radius:16px;background:rgba(255,255,255,0.02);">
            <div style="font-size:1.35rem;margin-bottom:6px;" aria-hidden="true">🌐</div>
            <div style="font-weight:700;color:#F7F8FC;font-size:0.94rem;margin-bottom:4px;">Czat Ogólny Społeczności LUMINA</div>
            <p style="font-size:0.83rem;line-height:1.5;max-width:300px;margin:0 auto;color:#A5AEC4;">
              Tutaj toczy się wspólna rozmowa społeczności. Jeśli chcesz porozmawiać 1:1 z Rut, Leą, Noemi lub Miriam, wybierz zakładkę „Asystentki CC (4)” powyżej.
            </p>
          </div>
        `;
        bindDailyDialogueToggle();
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
              <button type="button" class="cc-chat-lumina-btn" onclick="window.ccChatShareToLumina(this)" data-share-sender="${name}" data-share-text="${text}" style="background:transparent; border:none; box-shadow:none; color:rgba(255,255,255,0.7); cursor:pointer; width:44px; height:44px; min-width:44px; min-height:44px; padding:0; display:inline-flex; align-items:center; justify-content:center; font:700 16px/1 Georgia, 'Times New Roman', serif;" title="Opublikuj tę wiadomość na Tablicy LUMINA" aria-label="Opublikuj tę wiadomość na Tablicy LUMINA">L</button>
            </div>
            <div class="cc-chat-msg-bubble">
              ${renderChatMedia(text, m.id)}
              ${m.type === 'wzn_card' && m.wzn ? renderWznChatCard(m) : ''}
            </div>
            ${isMe && currentChatPartner.isPublic ? renderPublicMsgStatus(m) : ''}
          </div>
        </div>
      `;
    });
    // @007 (L0 23.11.2026): rozważanie przypięte na górze czatu, nie przeszkadza w korespondencji.
    html = dailyHtml + html;
    list.innerHTML = html;
    bindDailyDialogueToggle();
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

    if (typeof window.setCCChatMode === 'function') {
      if (!currentChatPartner.isPublic) {
        window.setCCChatMode('direct');
      } else if (chatMode === 'direct') {
        window.setCCChatMode('public');
      }
    }

    const publicHeaderTitle = document.getElementById('ccPublicModeTitle');
    const publicBackBtn = document.getElementById('ccPublicBackBtn');
    if (publicHeaderTitle) {
      publicHeaderTitle.innerHTML = currentChatPartner.isPublic
        ? '<span>🌐</span><span>Czat Ogólny Społeczności LUMINA</span>'
        : `<span>💬</span><span>Rozmowa 1:1: ${escapeHtml(currentChatPartner.name)}</span>`;
    }
    if (publicBackBtn) {
      publicBackBtn.hidden = !!currentChatPartner.isPublic;
    }

    const subText = document.getElementById('ccChatHeaderSubText');
    if (subText && chatMode !== 'assistant') {
      subText.textContent = currentChatPartner.isPublic ? 'Na żywo w Chrystusie' : `Rozmowa: ${currentChatPartner.name}`;
    }

    const user = getUserState();

    function extractRealtimeMsgTsMs(msg) {
      if (!msg) return 0;
      const ts = msg.timestamp || msg.createdAt || msg.sentAt || msg.ts;
      if (!ts) return 0;
      if (typeof ts === 'number' && Number.isFinite(ts)) return ts;
      if (typeof ts.toMillis === 'function') {
        try { return ts.toMillis(); } catch (_) { return 0; }
      }
      if (typeof ts.seconds === 'number') return ts.seconds * 1000;
      const parsed = Date.parse(String(ts));
      return Number.isFinite(parsed) ? parsed : 0;
    }

    function createRealtimeRevealTracker(me, sourceTag) {
      let initialized = false;
      const seenKeys = new Set();
      return function checkMsgsForReveal(msgs) {
        if (!Array.isArray(msgs) || msgs.length === 0) {
          initialized = true;
          return;
        }
        const hiddenAtMs = Number(safeLsGet(CC_FAB_HIDDEN_AT_KEY) || 0) || 0;
        const fabHiddenNow = safeLsGet(CC_FAB_HIDDEN_KEY) === '1';
        let freshIncoming = null;

        for (let i = 0; i < msgs.length; i += 1) {
          const m = msgs[i];
          if (!m) continue;
          const msgTs = extractRealtimeMsgTsMs(m);
          const key = m.id
            ? String(m.id)
            : `${m.senderId || m.uid || m.senderSlug || m.senderName || ''}|${msgTs}|${String(m.text || m.message || '').slice(0, 32)}`;
          const isNew = !seenKeys.has(key);
          seenKeys.add(key);

          if (!fabHiddenNow) continue;
          const fromSelf = !!(
            me &&
            me.isLoggedIn &&
            me.uid &&
            (
              (m.senderId && m.senderId === me.uid) ||
              (m.uid && m.uid === me.uid) ||
              (m.authorUid && m.authorUid === me.uid) ||
              (me.slug && m.senderSlug && m.senderSlug === me.slug)
            )
          );
          if (fromSelf) continue;

          if (!initialized) {
            if (hiddenAtMs > 0 && msgTs > hiddenAtMs + 500) {
              freshIncoming = m;
            }
          } else if (isNew && (msgTs === 0 || msgTs >= hiddenAtMs)) {
            freshIncoming = m;
          }
        }
        initialized = true;
        if (freshIncoming && typeof revealFabController === 'function') {
          revealFabController({
            source: sourceTag,
            senderId: freshIncoming.senderId || freshIncoming.uid || '',
            senderSlug: freshIncoming.senderSlug || '',
            senderName: freshIncoming.senderName || freshIncoming.authorName || '',
            text: freshIncoming.text || freshIncoming.message || ''
          });
        }
      };
    }

    if (currentChatPartner.isPublic) {
      if (window.LuminaDB && typeof window.LuminaDB.subscribeToPublicChat === 'function') {
        const trackPublicReveal = createRealtimeRevealTracker(user, 'realtime_public');
        try {
          activeRealtimeUnsubscribe = window.LuminaDB.subscribeToPublicChat(function (msgs) {
            if (currentChatPartner.isPublic && Array.isArray(msgs)) {
              trackPublicReveal(msgs);
              currentPartnerRealtimeMessages = msgs;
              renderChatMessages();
              if (chatMode !== 'assistant') scrollToBottom();
              try {
                const ov = document.getElementById('ccGlobalChatOverlay');
                const u = getUserState();
                const nowMs = Date.now();
                if (ov && ov.classList.contains('is-open') && document.visibilityState === 'visible' && chatMode !== 'assistant'
                    && u.isLoggedIn && u.uid && nowMs - lastPublicSeenMarkAt > 3000
                    && window.LuminaDB && typeof window.LuminaDB.markPublicMessagesSeen === 'function') {
                  lastPublicSeenMarkAt = nowMs;
                  window.LuminaDB.markPublicMessagesSeen(msgs, { slug: u.slug, uid: u.uid, name: u.name, avatar: u.avatar });
                }
              } catch (_) {}
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
        const trackDirectReveal = createRealtimeRevealTracker(user, 'realtime_dm');

        try {
          activeRealtimeUnsubscribe = window.LuminaDB.subscribeToDirectMessages(chatId, function (msgs) {
            if (!currentChatPartner.isPublic && Array.isArray(msgs)) {
              trackDirectReveal(msgs);
              currentPartnerRealtimeMessages = msgs;
              renderChatMessages();
              if (chatMode !== 'assistant') scrollToBottom();
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
      if (!isCanonicalMessenger && window.CCUnifiedChat && targetPartnerId && targetPartnerId !== 'cc-assistant' && !String(targetPartnerId).startsWith('asystentka-')) {
        const overlay = document.getElementById('ccGlobalChatOverlay');
        if (overlay) {
          overlay.classList.remove('is-open');
          overlay.setAttribute('aria-hidden', 'true');
          syncChatOverlayTopLayer(overlay, false, false);
        }
        window.CCUnifiedChat.open({ tab: targetTab === 'members' ? 'private' : 'public', partner: targetPartnerId });
        return;
      }
      if (typeof revealFabController === 'function') {
        revealFabController({ source: 'manual_open', force: true, quiet: true });
      }
      const overlay = document.getElementById('ccGlobalChatOverlay');
      if (overlay) {
        if (typeof hideActiveTeaserOnOpen === 'function') hideActiveTeaserOnOpen();
        syncChatOverlayTopLayer(overlay, true, true);
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
      if (targetTab === 'assistant' || targetPartnerId === 'cc-assistant' || (targetPartnerId && String(targetPartnerId).startsWith('asystentka-'))) {
        const asstId = targetPartnerId && String(targetPartnerId).startsWith('asystentka-') ? targetPartnerId : (getActiveAssistant().id || 'asystentka-1');
        try { sessionStorage.setItem('cc_active_assistant_id', asstId); } catch (_) {}
        if (window.selectAssistantAndRefresh) window.selectAssistantAndRefresh(asstId);
        if (window.setCCChatMode) window.setCCChatMode('assistant');
        const liveBtn = document.getElementById('ccChatTabLiveBtn');
        if (liveBtn) liveBtn.click();
      } else if (targetPartnerId === 'public' || targetTab === 'public') {
        setChatPartner(COMMUNITY_MEMBERS[0]);
        if (window.setCCChatMode) window.setCCChatMode('public');
        const liveBtn = document.getElementById('ccChatTabLiveBtn');
        if (liveBtn) liveBtn.click();
      } else if (targetPartnerId) {
        const p = COMMUNITY_MEMBERS.find(x => x.id === targetPartnerId || x.slug === targetPartnerId);
        if (p) {
          setChatPartner(p);
          const liveBtn = document.getElementById('ccChatTabLiveBtn');
          if (liveBtn) liveBtn.click();
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
    },
    notifyIncomingMessage: function (detail) {
      if (typeof revealFabController === 'function') {
        return revealFabController(detail || { source: 'api' });
      }
      if (typeof window.CustomEvent === 'function' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new window.CustomEvent('lumina:chat_message_received', { detail: detail || { source: 'api' } }));
        return true;
      }
      return false;
    },
    revealOnMessage: function (detail) {
      return typeof revealFabController === 'function' ? revealFabController(detail || { source: 'api' }) : false;
    },
    hideFab: function (opts) {
      if (typeof hideFabController === 'function') return hideFabController(opts);
      safeLsSet(CC_FAB_HIDDEN_KEY, '1');
      safeLsSet(CC_FAB_HIDDEN_AT_KEY, String(Date.now()));
      return { hidden: true };
    },
    showFab: function () {
      if (typeof revealFabController === 'function') {
        revealFabController({ source: 'manual_restore', force: true, quiet: true });
      } else {
        safeLsRemove(CC_FAB_HIDDEN_KEY);
        safeLsRemove(CC_FAB_HIDDEN_AT_KEY);
        safeLsRemove(CC_FAB_UNREAD_AT_HIDE_KEY);
      }
      if (typeof getFabStateController === 'function') return getFabStateController();
      return { hidden: false };
    },
    resetFabPosition: function () {
      if (typeof resetFabPosController === 'function') return resetFabPosController();
      safeLsRemove(CC_FAB_POS_KEY);
      return { reset: true };
    },
    getFabState: function () {
      if (typeof getFabStateController === 'function') return getFabStateController();
      return { hidden: safeLsGet(CC_FAB_HIDDEN_KEY) === '1', customPosition: null };
    }
  };

})();
