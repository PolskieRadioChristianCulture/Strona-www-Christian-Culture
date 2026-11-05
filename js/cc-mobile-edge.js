/* Shared mobile navigation. No account reads, storage, SDKs or network requests. */
(() => {
  'use strict';
  if (window.CCMobileEdge) return;
  const paths = {
    plus: 'M12 5v14M5 12h14', close: 'm6 6 12 12M6 18 18 6',
    home: 'm3 10 9-7 9 7v11h-6v-7H9v7H3Z',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    chat: 'M21 11.5a8.5 8.5 0 0 1-8.5 8.5H3l2-5a8.5 8.5 0 1 1 16-3.5Z',
    news: 'M4 3h16v18H4ZM8 7h8M8 11h8M8 15h3M8 18h8',
    book: 'M12 5C8 2 3 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 1Zm0 0v16',
    study: 'm2 8 10-5 10 5-10 5Zm4 3v6c4 3 8 3 12 0v-6M22 8v8',
    calendar: 'M4 5h16v16H4ZM8 2v6M16 2v6M4 11h16M8 15h2M14 15h2',
    play: 'm8 5 11 7-11 7Z', search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    menu: 'M4 6h16M4 12h16M4 18h16', board: 'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',
    user: 'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z',
    heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    info: 'M12 16v-4M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    theme: 'M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z',
    sun: 'M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2M19 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z',
    radio: 'M4.93 4.93a10 10 0 0 0 0 14.14M19.07 4.93a10 10 0 0 1 0 14.14M7.76 7.76a6 6 0 0 0 0 8.48M16.24 7.76a6 6 0 0 1 0 8.48M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
    arrowUp: 'M12 19V5M5 12l7-7 7 7',
    yis: 'M6 4l6 8 6-8M12 12v8',
    mail: 'M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2 8 6 8-6',
  };

  const labels = {
    pl: {
      home: 'Strona główna',
      users: 'LUMINA — społeczność',
      board: 'Tablica LUMINA',
      chat: 'LUMI Messenger',
      user: 'Konto i logowanie LUMINA',
      news: 'CCN News',
      book: 'Moja Biblia',
      study: 'Akademia Biblijna',
      calendar: 'HOLOS — planer',
      play: 'Kino VOD',
      yis: 'Your Imagination Studio (YIS)',
      search: 'Szukaj w ekosystemie',
      mail: 'Newsletter — Bądźmy w kontakcie',
      heart: 'Wspieram To — Wolne Media Boże',
      close: 'Zamknij panel nawigacji',
      open: 'Otwórz panel nawigacji',
      star: 'Dodaj tę stronę do Ulubionych',
      starActive: 'Usuń tę stronę z Ulubionych',
      info: 'Informacje o projekcie',
      menu: 'Pełne menu — wszystkie funkcje',
      theme: 'Przełącz motyw',
      themeLight: 'Przełącz na motyw ciemny',
      themeDark: 'Przełącz na motyw jasny',
      radioPlay: 'Włącz Radio CC na żywo',
      radioStop: 'Zatrzymaj Radio CC',
      scrollTop: 'Przewiń na górę strony',
      navAria: 'Nawigacja Christian Culture',
      shortcutsAria: 'Skróty ekosystemu'
    },
    en: {
      home: 'Home',
      users: 'LUMINA — Community',
      board: 'LUMINA Board',
      chat: 'LUMI Messenger',
      user: 'LUMINA Account & Login',
      news: 'CCN News',
      book: 'My Bible',
      study: 'Bible Academy',
      calendar: 'HOLOS — Planner',
      play: 'Cinema VOD',
      yis: 'Your Imagination Studio (YIS)',
      search: 'Search Ecosystem',
      mail: 'Newsletter — Stay in touch',
      heart: 'Support Us — Free Christian Media',
      close: 'Close navigation panel',
      open: 'Open navigation panel',
      star: 'Add to favorites',
      starActive: 'Remove from favorites',
      info: 'About the project',
      menu: 'Full menu — all features',
      theme: 'Toggle theme',
      themeLight: 'Switch to dark theme',
      themeDark: 'Switch to light theme',
      radioPlay: 'Play Radio CC live',
      radioStop: 'Stop Radio CC',
      scrollTop: 'Scroll to top',
      navAria: 'Christian Culture Navigation',
      shortcutsAria: 'Ecosystem shortcuts'
    },
    de: {
      home: 'Startseite',
      users: 'LUMINA — Gemeinschaft',
      board: 'LUMINA Pinnwand',
      chat: 'LUMI Messenger',
      user: 'LUMINA Konto & Anmelden',
      news: 'CCN News',
      book: 'Meine Bibel',
      study: 'Bibel-Akademie',
      calendar: 'HOLOS — Planer',
      play: 'Kino VOD',
      yis: 'Your Imagination Studio (YIS)',
      search: 'Im Ökosystem suchen',
      mail: 'Newsletter — In Kontakt bleiben',
      heart: 'Unterstützen — Freie Christliche Medien',
      close: 'Navigationspanel schließen',
      open: 'Navigationspanel öffnen',
      star: 'Zu Favoriten hinzufügen',
      starActive: 'Aus Favoriten entfernen',
      info: 'Über das Projekt',
      menu: 'Vollständiges Menü — alle Funktionen',
      theme: 'Design wechseln',
      themeLight: 'Zu dunklem Design wechseln',
      themeDark: 'Zu hellem Design wechseln',
      radioPlay: 'Radio CC live starten',
      radioStop: 'Radio CC anhalten',
      scrollTop: 'Nach oben scrollen',
      navAria: 'Christian Culture Navigation',
      shortcutsAria: 'Ökosystem-Verknüpfungen'
    }
  };

  function getLocale() {
    return (window.EkoCCI18n && typeof window.EkoCCI18n.getLocale === 'function')
      ? window.EkoCCI18n.getLocale()
      : ((document.documentElement && document.documentElement.lang) || 'pl').slice(0, 2).toLowerCase();
  }

  function t(key, fallback) {
    const loc = getLocale();
    return labels[loc]?.[key] || labels.pl[key] || fallback || key;
  }

  const icon = name => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const [key,value] of Object.entries({viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':'1.8','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'})) svg.setAttribute(key,value);
    const p = document.createElementNS(svg.namespaceURI,'path');
    p.setAttribute('d', paths[name] || paths.menu);
    svg.append(p);
    return svg;
  };
  const commonItems = [
    ['home','Strona główna','/'], ['users','LUMINA — społeczność','/lumina'],
    ['chat','LUMI Messenger','/mess'], ['news','CCN News','/news'],
    ['book','Moja Biblia','/mojabiblia'], ['study','Akademia Biblijna','/akademia'],
    ['calendar','HOLOS — planer','/holos'], ['play','Kino VOD','/vod'],
    ['search','Szukaj w ekosystemie','/szukaj'],
    ['mail','LIVE LETTER • Newsletter CC','/newsletter'],
    ['heart','Wspieram To','/wspieraj'],
  ];

  function mount({legacy, placement = legacy, trigger: customTrigger, secondary = [], hideLegacy = true, profile = 'home', items = commonItems, canUseFullMenu = () => true, allowDesktop = document.body?.dataset.ccEdgeDesktop === 'true'}) {
    if (!(legacy instanceof HTMLElement) || !(placement instanceof HTMLElement) || legacy.dataset.ccEdgeMounted || document.getElementById('cc-mobile-edge-dialog') || typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return null;
    if (document.head && !document.getElementById('cc-mobile-edge-2col-style')) {
      const s = document.createElement('style');
      const nonce = document.querySelector('meta[name="cc-csp-nonce"]')?.content;
      if (nonce) s.nonce = nonce;
      s.id = 'cc-mobile-edge-2col-style';
      s.textContent = `
        dialog.cc-mobile-edge, .cc-mobile-edge, .cc-mobile-edge[data-profile="search"] {
          width: 122px !important; max-width: 90vw !important;
          overflow-y: auto !important; overflow-x: hidden !important;
          scrollbar-width: none !important; -ms-overflow-style: none !important;
        }
        dialog.cc-mobile-edge::-webkit-scrollbar, .cc-mobile-edge::-webkit-scrollbar, .cc-mobile-edge[data-profile="search"]::-webkit-scrollbar {
          display: none !important; width: 0 !important; height: 0 !important;
        }
        dialog.cc-mobile-edge nav, .cc-mobile-edge nav, .cc-mobile-edge[data-profile="search"] nav {
          display: grid !important; grid-template-columns: repeat(2, 44px) !important;
          gap: 6px 8px !important; justify-content: center !important; align-content: start !important;
          min-height: auto !important; width: 100% !important; box-sizing: border-box !important;
          padding: max(10px, env(safe-area-inset-top)) 10px max(10px, env(safe-area-inset-bottom)) !important;
        }
        .cc-mobile-edge nav button[data-edge-key="close"] { grid-column: 1 / -1 !important; justify-self: center !important; margin-bottom: 2px !important; }
        .cc-mobile-edge nav :is(a,button)[data-edge-key="heart"] { color: #FF7A00 !important; }
        .cc-mobile-edge .cc-edge-lang-divider { grid-column: 1 / -1 !important; width: 100% !important; height: 1px !important; background: rgba(196, 163, 90, 0.25) !important; margin: 6px 0 2px 0 !important; }
        .cc-mobile-edge .cc-edge-lang-group { grid-column: 1 / -1 !important; display: flex !important; flex-direction: row !important; justify-content: center !important; flex-wrap: wrap !important; gap: 6px 8px !important; width: 100% !important; }
      `;
      document.head.appendChild(s);
    }
    const mobile = matchMedia('(max-width: 767px)');
    const dialog = document.createElement('dialog');
    dialog.id = 'cc-mobile-edge-dialog';
    dialog.className = 'cc-mobile-edge';
    dialog.dataset.profile = profile;
    dialog.setAttribute('aria-label', profile === 'lumina' ? (getLocale() === 'en' ? 'LUMINA and Christian Culture Navigation' : (getLocale() === 'de' ? 'LUMINA und Christian Culture Navigation' : 'Nawigacja LUMINA i Christian Culture')) : t('navAria', 'Nawigacja Christian Culture'));
    const trigger = (customTrigger instanceof HTMLElement) ? customTrigger : document.createElement('button');
    if (trigger !== customTrigger) {
      trigger.type = 'button';
      trigger.className = 'cc-mobile-edge-trigger';
      trigger.append(icon('plus'));
    }
    trigger.dataset.profile = profile;
    trigger.dataset.edgeKey = 'open';
    trigger.setAttribute('aria-label', t('open', 'Otwórz panel nawigacji'));
    trigger.setAttribute('aria-haspopup','dialog');
    trigger.setAttribute('aria-controls',dialog.id);
    trigger.setAttribute('aria-expanded','false');
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', t('shortcutsAria', 'Skróty ekosystemu'));
    dialog.append(nav);
    let restoreOverflow = '', previousFocus = null, active = false, touch = null;
    function cleanup() {
      if (!active) return;
      active = false;
      document.body.style.overflow = restoreOverflow;
      trigger.setAttribute('aria-expanded','false');
      if (previousFocus?.isConnected && previousFocus.getClientRects().length) previousFocus.focus({preventScroll:true});
    }
    function close() { if (dialog.open) dialog.close(); cleanup(); }
    function button(name, label, onClick) {
      const b = document.createElement('button');
      const text = t(name, label);
      b.type = 'button'; b.setAttribute('aria-label', text); b.title = text;
      b.dataset.edgeKey = name;
      b.append(icon(name)); b.addEventListener('click',onClick); nav.append(b);
      return b;
    }
    const closeBtn = button('close','Zamknij panel nawigacji',close);
    closeBtn.autofocus = true;

    // Reuse canonical LUMINA controllers; keep exact data-cc-edge-action anchors.
    let searchAction, themeAction, radioAction;

    function syncRadioControl() {
      if (!radioAction) return;
      const isPlaying = typeof window.LuminaMiniPlayer?.isPlaying === 'function' ? window.LuminaMiniPlayer.isPlaying() : false;
      radioAction.classList.toggle('is-playing', !!isPlaying);
      radioAction.title = isPlaying ? 'Zatrzymaj Radio CC' : 'Włącz Radio CC na żywo';
      radioAction.setAttribute('aria-label', radioAction.title);
      radioAction.setAttribute('aria-pressed', String(!!isPlaying));
    }

    function syncChatBadge() {
      const chatLink = nav.querySelector('a[href="/mess"]');
      if (!chatLink) return;
      const unreadEl = document.querySelector('#ccChatFabBtn .lumi-badge, .lumi-fab-unread-badge, #ccGlobalChatBadge, .lumi-chat-badge');
      const hasUnread = unreadEl && unreadEl.textContent.trim() !== '' && unreadEl.textContent.trim() !== '0';
      chatLink.classList.toggle('has-unread', !!hasUnread);
    }

    function syncLuminaControls() {
      if (profile !== 'lumina') return;
      const searchReady = !!document.getElementById('mobileNavSearchBtn') && typeof window.toggleMobileNavbarSearch === 'function';
      const themeReady = !!document.getElementById('luminaThemeSwitchBtn') && (typeof window.toggleLuminaTheme === 'function' || typeof window.applyLuminaTheme === 'function');
      document.documentElement.classList.toggle('cc-edge-search-ready', searchReady);
      document.documentElement.classList.toggle('cc-edge-theme-ready', themeReady);
      if (searchAction) {
        const localSearch = searchReady && !document.body.classList.contains('user-is-guest');
        searchAction.hidden = !localSearch;
        const globalSearch = nav.querySelector('a[href="/szukaj"], a[href="/wyszukiwarka"]');
        if (globalSearch) globalSearch.hidden = localSearch;
      }
      if (themeAction) {
        themeAction.hidden = !themeReady;
        const light = document.documentElement.getAttribute('data-lumina-theme') === 'light' || document.body.classList.contains('theme-lumina-light');
        themeAction.title = light ? 'Przełącz na motyw ciemny' : 'Przełącz na motyw jasny';
        themeAction.setAttribute('aria-label', themeAction.title);
        themeAction.setAttribute('aria-pressed', String(!light));
        themeAction.replaceChildren(icon(light ? 'sun' : 'theme'));
      }
      syncRadioControl();
      syncChatBadge();
    }

    if (profile === 'lumina') {
      searchAction = button('search','Szukaj na portalu LUMINA',event => {
        event.stopPropagation(); close();
        document.getElementById('mobileNavSearchBtn')?.click();
      });
      searchAction.dataset.ccEdgeAction = 'search';

      themeAction = button('theme','Przełącz motyw',event => {
        event.stopPropagation();
        if (typeof window.toggleLuminaTheme === 'function') {
          window.toggleLuminaTheme();
        } else if (typeof window.applyLuminaTheme === 'function') {
          const isLight = document.documentElement.getAttribute('data-lumina-theme') === 'light' || document.body.classList.contains('theme-lumina-light');
          window.applyLuminaTheme(isLight ? 'dark' : 'light', true);
        } else {
          const btn = document.getElementById('luminaThemeSwitchBtn');
          if (btn) {
            btn.click();
          } else {
            const isLight = document.documentElement.getAttribute('data-lumina-theme') === 'light' || document.body.classList.contains('theme-lumina-light');
            const next = isLight ? 'dark' : 'light';
            document.documentElement.setAttribute('data-lumina-theme', next);
            if (document.body) document.body.classList.toggle('theme-lumina-light', next === 'light');
            try { localStorage.setItem('lumina_theme', next); } catch(e) {}
            try { window.dispatchEvent(new CustomEvent('luminathemechange', { detail: { theme: next } })); } catch(e) {}
          }
        }
        syncLuminaControls();
      });
      themeAction.dataset.ccEdgeAction = 'theme';

      radioAction = button('radio','Włącz Radio CC na żywo',event => {
        event.stopPropagation();
        if (window.LuminaMiniPlayer && typeof window.LuminaMiniPlayer.toggle === 'function') {
          window.LuminaMiniPlayer.toggle(event);
        } else {
          const playBtn = document.getElementById('lmpBtnPlay') || document.getElementById('luminaMiniPlayerPlayBtn');
          if (playBtn) playBtn.click();
        }
        syncRadioControl();
      });
      radioAction.dataset.ccEdgeAction = 'radio';

      window.addEventListener('luminathemechange',syncLuminaControls);
      window.addEventListener('luminaplayerchange',syncRadioControl);
      document.addEventListener('play',syncRadioControl,true);
      document.addEventListener('pause',syncRadioControl,true);
      window.addEventListener('load',syncLuminaControls,{once:true});
    }

    const current = location.pathname.replace(/\.html$/, '').replace(/\/$/,'') || '/';
    for (const [name,label,href] of items) {
      // Only trusted same-origin routes/fragments; never executable URLs.
      const url = new URL(href, location.origin);
      if (url.origin !== location.origin || !['https:','http:'].includes(url.protocol)) continue;
      const a = document.createElement('a');
      const text = t(name, label);
      a.href = url.pathname + url.search + url.hash;
      a.setAttribute('aria-label', text); a.title = text; a.append(icon(name));
      a.dataset.edgeKey = name;
      const targetPath = url.pathname.replace(/\.html$/, '').replace(/\/$/,'') || '/';
      const isMatch = (current === targetPath) ||
        (targetPath === '/wyszukiwarka' && (current === '/szukaj' || current === '/wyszukiwarka')) ||
        (targetPath === '/szukaj' && (current === '/wyszukiwarka' || current === '/szukaj')) ||
        (targetPath === '/akademia' && current.startsWith('/akademia')) ||
        (targetPath === '/vod' && (current === '/vod' || current === '/kino')) ||
        ((current === '/tablica' && targetPath === '/lumina-tablica') || (current === '/lumina-tablica' && targetPath === '/tablica'));
      if (isMatch && !url.hash) {
        a.setAttribute('aria-current','page');
      }
      if (url.pathname === '/mess') {
        a.addEventListener('click', event => {
          if (window.CCUnifiedChat && typeof window.CCUnifiedChat.open === 'function') {
            event.preventDefault();
            close();
            window.CCUnifiedChat.open();
          }
        });
      }
      if (url.pathname === '/newsletter') {
        a.addEventListener('click', event => {
          if (window.CCNewsletter && typeof window.CCNewsletter.open === 'function') {
            event.preventDefault();
            close();
            window.CCNewsletter.open();
          }
        });
      }
      a.addEventListener('click',close); nav.append(a);
    }

    if (profile === 'lumina') {
      const scrollTopBtn = button('arrowUp','Przewiń na górę strony',event => {
        event.stopPropagation();
        close();
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
        });
      });
      scrollTopBtn.dataset.ccEdgeAction = 'scroll-top';
    }

    let favoriteRevision = 0;
    async function syncFavorite() {
      const revision = ++favoriteRevision;
      const api = window.CCFavorites;
      if (!api?.getPageMeta || !api?.isFavorite) return;
      try {
        const isFav = await api.isFavorite(api.getPageMeta().url);
        if (revision !== favoriteRevision) return;
        favBtn.classList.toggle('is-active', !!isFav);
        favBtn.setAttribute('aria-pressed', String(!!isFav));
        favBtn.title = isFav ? t('starActive', 'Usuń tę stronę z Ulubionych') : t('star', 'Dodaj tę stronę do Ulubionych');
        favBtn.setAttribute('aria-label',favBtn.title);
      } catch { /* The canonical favorite controller retains its own error UI. */ }
    }
    const favBtn = button('star','Dodaj tę stronę do Ulubionych',async event => {
      event.stopPropagation();
      if (window.CCFavorites && typeof window.CCFavorites.toggleFavorite === 'function') {
        favBtn.disabled = true;
        try { await window.CCFavorites.toggleFavorite(); await syncFavorite(); }
        catch { /* Do not display a false success. */ }
        finally { favBtn.disabled = false; }
      }
    });
    favBtn.setAttribute('data-cc-favorite-toggle','true');
    const infoBtn = button('info','Informacje o projekcie',event => {
      event.stopPropagation(); close();
      if (window.ekoccInfo && typeof window.ekoccInfo.open === 'function') {
        window.ekoccInfo.open();
      } else {
        const trigger = document.getElementById('ekoccInfoTriggerBtn') || document.querySelector('.ekocc-info-trigger');
        if (trigger) trigger.click();
      }
    });
    infoBtn.setAttribute('data-ekocc-info-trigger','true');
    infoBtn.innerHTML = '<img class="cc-edge-info-img" src="/images/icons/ekocc-info-gold-128.png" alt="" width="26" height="26">';
    const infoImage = infoBtn.querySelector('img');
    Object.assign(infoImage.style,{display:'block',margin:'auto',objectFit:'contain',filter:'drop-shadow(0 1px 4px rgba(0,0,0,0.5))'});
    const fullMenu = button('menu','Pełne menu — wszystkie funkcje',event => {
      event.stopPropagation(); close(); if (canUseFullMenu()) legacy.click();
    });

    // Wybór języka w panelu krawędziowym (Dyrektywa L0 29.10.2026: wybór języka w panelu krawędziowym)
    const langDivider = document.createElement('div');
    langDivider.className = 'cc-edge-lang-divider';
    langDivider.setAttribute('aria-hidden', 'true');
    nav.append(langDivider);

    const langGroup = document.createElement('div');
    langGroup.className = 'cc-edge-lang-group';
    langGroup.setAttribute('role', 'group');
    langGroup.setAttribute('aria-label', t('lang_selector_label', 'Wybierz język interfejsu'));

    const currentLoc = (typeof window.EkoCCI18n?.getLocale === 'function') ? window.EkoCCI18n.getLocale() : getLocale();

    const langConfigs = [
      { code: 'pl', label: 'Polski' },
      { code: 'en', label: 'English' },
      { code: 'de', label: 'Deutsch' }
    ];

    langConfigs.forEach(({ code, label }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `ekocc-lang-btn cc-edge-lang-btn ${code === currentLoc ? 'is-active' : ''}`;
      btn.dataset.ekoccLangChoice = code;
      btn.setAttribute('aria-pressed', code === currentLoc ? 'true' : 'false');
      btn.setAttribute('aria-label', label);
      btn.title = label;
      btn.textContent = code.toUpperCase();

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.EkoCCI18n && typeof window.EkoCCI18n.setLocale === 'function') {
          window.EkoCCI18n.setLocale(code, 'global');
        }
      });
      langGroup.append(btn);
    });

    nav.append(langGroup);

    function applyTranslations() {
      trigger.setAttribute('aria-label', t('open', 'Otwórz panel nawigacji'));
      dialog.setAttribute('aria-label', profile === 'lumina' ? (getLocale() === 'en' ? 'LUMINA and Christian Culture Navigation' : (getLocale() === 'de' ? 'LUMINA und Christian Culture Navigation' : 'Nawigacja LUMINA i Christian Culture')) : t('navAria', 'Nawigacja Christian Culture'));
      nav.setAttribute('aria-label', t('shortcutsAria', 'Skróty ekosystemu'));
      const cur = (typeof window.EkoCCI18n?.getLocale === 'function') ? window.EkoCCI18n.getLocale() : getLocale();
      if (typeof langGroup !== 'undefined' && langGroup) {
        langGroup.querySelectorAll('.cc-edge-lang-btn').forEach(btn => {
          const isActive = btn.dataset.ekoccLangChoice === cur;
          btn.classList.toggle('is-active', isActive);
          btn.setAttribute('aria-pressed', String(isActive));
        });
      }
      nav.querySelectorAll('[data-edge-key]').forEach(el => {
        const k = el.dataset.edgeKey;
        let txt = t(k);
        if (k === 'star') {
          txt = el.classList.contains('is-active') ? t('starActive') : t('star');
        } else if (k === 'radio') {
          txt = el.classList.contains('is-playing') ? t('radioStop') : t('radioPlay');
        }
        if (txt) {
          el.setAttribute('aria-label', txt);
          el.title = txt;
        }
      });
    }
    document.addEventListener('ekocc:locale-changed', applyTranslations);
    window.addEventListener('ekocc:locale-changed', applyTranslations);
    applyTranslations();
    trigger.addEventListener('click',() => {
      if ((!mobile.matches && profile !== 'search' && !allowDesktop) || dialog.open || document.querySelector('dialog[open]:not(#ccwMcpDialog)')) return;
      previousFocus = document.activeElement;
      fullMenu.hidden = !canUseFullMenu();
      syncLuminaControls();
      void syncFavorite();
      restoreOverflow = document.body.style.overflow;
      dialog.showModal();
      active = true;
      document.body.style.overflow = 'hidden';
      trigger.setAttribute('aria-expanded','true');
    });
    dialog.addEventListener('cancel',e => { e.preventDefault(); close(); });
    dialog.addEventListener('close',() => { if (!dialog.open) cleanup(); });
    dialog.addEventListener('click',e => {
      const r = dialog.getBoundingClientRect();
      if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) close();
    });
    dialog.addEventListener('touchstart',e => { touch = e.touches.length === 1 ? {x:e.touches[0].clientX,y:e.touches[0].clientY} : null; },{passive:true});
    dialog.addEventListener('touchcancel',() => { touch = null; });
    dialog.addEventListener('touchend',e => {
      const start = touch; touch = null;
      if (!start || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX-start.x, dy = e.changedTouches[0].clientY-start.y;
      if (dx < -50 && Math.abs(dx) > Math.abs(dy)*1.5) close();
    },{passive:true});

    // Left edge swipe right gesture to reveal edge panel
    let startEdgeTouch = null;
    document.addEventListener('touchstart', e => {
      if (mobile.matches && !dialog.open && e.touches.length === 1 && e.touches[0].clientX <= 30) {
        startEdgeTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else {
        startEdgeTouch = null;
      }
    }, { passive: true });
    document.addEventListener('touchcancel', () => { startEdgeTouch = null; });
    document.addEventListener('touchend', e => {
      if (!startEdgeTouch || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - startEdgeTouch.x;
      const dy = e.changedTouches[0].clientY - startEdgeTouch.y;
      startEdgeTouch = null;
      if (dx > 45 && Math.abs(dx) > Math.abs(dy) * 1.2 && !dialog.open) {
        trigger.click();
      }
    }, { passive: true });

    mobile.addEventListener('change',() => { if (!mobile.matches && profile !== 'search' && !allowDesktop) close(); });
    document.body.append(dialog);
    if (!customTrigger) {
      if (placement.classList?.contains('nav-left') || placement.classList?.contains('header-left') || placement.classList?.contains('brand-wrap')) {
        placement.prepend(trigger);
      } else {
        placement.before(trigger);
      }
    }
    if (placement && placement !== trigger && placement instanceof HTMLElement && !placement._ccEdgeBound) {
      placement._ccEdgeBound = true;
      placement.addEventListener('click', (e) => {
        if (mobile.matches) {
          e.preventDefault();
          e.stopPropagation();
          trigger.click();
        }
      });
    }
    legacy.dataset.ccEdgeMounted = 'true';
    if (hideLegacy) legacy.classList.add('cc-edge-legacy');
    for (const element of secondary) element?.classList.add('cc-edge-legacy');
    syncLuminaControls();
    return {close, dialog, trigger};
  }
  window.CCMobileEdge = Object.freeze({mount});

  function autoInit() {
    // Usuniecie jakiegokolwiek zduplikowanego pierwszego przycisku + w belce wyszukiwarki (L0 29.10.2026)
    document.querySelectorAll('.cc-omni-topnav .cc-mobile-edge-trigger:not(#ccOmniEdgeBtn)').forEach(el => el.remove());
    if (/^\/mess(?:\.html|\/|$)/i.test(location.pathname)) return;

    // Search surfaces: wyszukiwarka / szukaj / omni-search overlay (L0 29.10.2026)
    const isSearch = /^\/(?:wyszukiwarka|szukaj)/i.test(location.pathname) || !!document.getElementById('ccOmniOverlay') || !!document.querySelector('.cc-omni-topnav');
    if (isSearch) {
      document.querySelectorAll('.cc-mobile-edge-trigger:not(#ccOmniEdgeBtn)').forEach(el => el.remove());
      const attachSearchEdge = () => {
        document.querySelectorAll('.cc-mobile-edge-trigger:not(#ccOmniEdgeBtn)').forEach(el => el.remove());
        const btn = document.getElementById('ccOmniEdgeBtn');
        if (btn && !btn.dataset.ccEdgeMounted) {
          mount({
            legacy: btn,
            placement: btn,
            trigger: btn,
            hideLegacy: false,
            profile: 'search',
            items: commonItems
          });
          return true;
        }
        return false;
      };
      if (attachSearchEdge()) return;
      const observer = new MutationObserver(() => {
        if (attachSearchEdge()) observer.disconnect();
      });
      observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 4000);
      return;
    }

    const script = document.querySelector('script[data-cc-edge-profile]');
    // Homepage exception requested by the owner: retain both original header controls.
    if (script?.dataset.ccEdgeProfile === 'home') {
      mount({legacy:document.getElementById('actionsToggleBtn'),placement:document.getElementById('hamburgerBtn'),hideLegacy:false});
      return;
    }
    // LUMINA Portal surfaces (odkrywaj, tablica, profile)
    const isLumina = script?.dataset.ccEdgeProfile === 'lumina' || (/lumina|tablica/i.test(location.pathname) && !/^\/mess/i.test(location.pathname));
    if (isLumina) {
      const legacy = document.getElementById('topNavMenuBtn');
      if (legacy) {
        mount({
          legacy,
          placement: legacy.closest('.nav-menu-wrapper') || legacy,
          profile: 'lumina',
          canUseFullMenu: () => !document.body.classList.contains('user-is-guest'),
          items: [
            ['users', 'LUMINA — społeczność', '/lumina'],
            ['board', 'Tablica LUMINA', '/tablica'],
            ['chat', 'LUMI Messenger', '/mess'],
            ['user', 'Konto i logowanie LUMINA', '/lumina-login'],
            ...commonItems.filter(item => !['users', 'chat'].includes(item[0])),
          ]
        });
        return;
      }
    }
    // Ecosystem fallbacks
    if (!script?.dataset.ccEdgeProfile || script?.dataset.ccEdgeProfile === 'ecosystem' || script?.dataset.ccEdgeProfile === 'wioletta') {
      if (document.getElementById('cc-mobile-edge-dialog') || document.querySelector('dialog.cc-mobile-edge')) return;
      const isWioletta = /^\/wioletta/i.test(location.pathname);
      const items = isWioletta ? [
        ['home','Strona główna','/'],
        ['book','Pardon, Czy To Miłość? — Powieść','/Wioletta'],
        ['users','LUMINA — społeczność','/lumina'],
        ['chat','LUMI Messenger','/mess'],
        ['news','CCN News','/news'],
        ['book','Moja Biblia','/mojabiblia'],
        ['study','Akademia Biblijna','/akademia'],
        ['calendar','HOLOS — planer','/holos'],
        ['play','Kino VOD','/vod'],
        ['yis','Your Imagination Studio (YIS)','/yis'],
        ['search','Szukaj w ekosystemie','/szukaj'],
        ['mail','LIVE LETTER • Newsletter CC','/newsletter'],
        ['heart','Wspieram To','/wspieraj'],
      ] : commonItems;

      const burger = document.querySelector(
        '.btn-burger, #menuToggleBtn, [data-modal="modalMenu"], #hamburgerBtn, .hamburger-menu, [data-menu-open], #mobileMenuBtn, .mobile-menu-btn, .nav-burger, #navMenuBtn, button[aria-label*="menu" i]'
      );

      if (burger) {
        const modalId = burger.getAttribute('data-modal');
        const legacyModal = modalId ? document.getElementById(modalId) : null;
        const isWelch = burger.id === 'gwEdgeTriggerBtn' || burger.classList.contains('gw-edge-btn');
        mount({
          legacy: legacyModal || burger,
          placement: burger,
          hideLegacy: isWelch ? true : false,
          profile: isWioletta ? 'wioletta' : 'ecosystem',
          items,
          canUseFullMenu: () => !!legacyModal
        });
        if (isWelch) {
          burger.remove();
        }
        return;
      }

      const header = document.querySelector('.main-header, header, .topbar, .reader-nav, .nav:not(.cc-omni-topnav), nav:not(.cc-omni-topnav), .cin-header, .ccw-fallback, main, body');
      if (header) {
        const placement = header.querySelector('.nav-left, .header-left, .brand-wrap') || header.firstElementChild || header;
        mount({
          legacy: placement,
          placement: placement,
          hideLegacy: false,
          profile: isWioletta ? 'wioletta' : 'ecosystem',
          items
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit, { once: true });
  } else {
    autoInit();
  }
})();
