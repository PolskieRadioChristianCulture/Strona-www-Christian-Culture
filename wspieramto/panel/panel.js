(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');
  function markReady() {
    document.documentElement.classList.add('is-ready');
    if (document.body) document.body.classList.add('is-ready');
  }
  var readyTimer = setTimeout(markReady, 2000);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      markReady();
      clearTimeout(readyTimer);
    });
  });

  var DICT = {
    pl: {
      skip: 'Przejdź do treści',
      tickBadge: 'WspieramTO PRO',
      brandSub: 'WspieramTO · Panel Użytkownika',
      navHome: 'WspieramTO',
      navWallet: 'Portfel PRO',
      navServices: 'Moje Usługi PRO',
      navPatronage: 'Mecenat',
      navCenter: 'Moje Centrum',
      navCta: 'Wesprzyj teraz',
      heroBadge: 'WspieramTO · Panel Użytkownika PRO',
      h1a: 'Twoje centrum',
      h1b: 'usług PRO',
      heroLead: 'Wszystkie usługi PRO ekosystemu Christian Culture działają w oparciu o jeden centralny portfel uprawnień WspieramTO — bez odrębnych abonamentów i bez paywalli w aplikacjach.',
      heroCtaLogin: 'Zaloguj z Google (LUMINA)',
      heroCtaManage: 'Zarządzaj usługami PRO ↓',
      heroCtaBack: 'Poznaj WspieramTO →',
      trust1: '1 portfel uprawnień dla wszystkich aplikacji',
      trust2: 'Zero odrębnych subskrypcji',
      trust3: 'Natychmiastowa spójność CCProManager.SERVICES',
      walletLiveLabel: 'PORTFEL WSPIERAMTO',
      walletServicesLabel: 'usług PRO w jednym rejestrze',
      walletQuickList: 'Lista usług PRO ↓',
      walletQuickSupport: 'Wesprzyj 1-Click ↗',
      gateEyebrow: 'Strefa Zalogowanego Użytkownika LUMINA & CC',
      gateTitle: 'Zaloguj się, aby otworzyć swój Panel Użytkownika WspieramTO',
      gateLead: 'Po zalogowaniu jednym kliknięciem przez Google uzyskasz natychmiastowy dostęp do swojego portfela uprawnień PRO, zarządzania statusem Patrona WspieramTO oraz pełnej listy wszystkich zintegrowanych narzędzi i wtyczek Christian Culture.',
      gatePerk1: 'Podgląd aktywnego statusu PRO (Patron CC / 7-dniowy start / Właściciel)',
      gatePerk2: 'Wszystkie moduły zarejestrowane w CCProManager.SERVICES w jednym miejscu',
      gatePerk3: 'Synchronizacja mecenatu WspieramTO bez oddzielnych płatności w aplikacjach',
      gateLoginBtn: 'Zaloguj się przez Google (LUMINA)',
      gateBackBtn: 'Wróć do WspieramTO',
      walletEyebrow: 'Centralny Portfel Uprawnień WspieramTO',
      walletTitle: 'Twój profil i status PRO w ekosystemie',
      openLuminaProfile: 'Mój profil LUMINA →',
      openMyCenter: 'Moje Centrum →',
      statusLabel: 'BIEŻĄCY STATUS PORTFELA',
      accessLevelLabel: 'Poziom dostępu PRO',
      btnOpenSupport: 'Wesprzyj w WspieramTO (1-Click)',
      btnSeeStudio: 'Cel: Nowe Studio 4K →',
      patEyebrow: 'Jeden mecenat zamiast dziesięciu abonamentów',
      patTitle: 'Zarządzanie mecenatem WspieramTO',
      patLead: 'Nie prowadzimy oddzielnych płatności w aplikacjach. Wybierz preferowany kanał wsparcia i zsynchronizuj swój status Patrona CC w portfelu.',
      channelsTitle: 'Bezpośrednie kanały WspieramTO',
      channelsLead: 'Każda wpłata bezpośrednio utrzymuje 37 kanałów Radia/TV 24/7, Biblię Audio i rozwój narzędzi:',
      syncTitle: 'Synchronizacja statusu Patrona CC',
      syncLead: 'Wspierasz już misję CC przez Zrzutka.pl, Patronite, Revolut lub przelew bankowy? Potwierdź status w swoim portfelu:',
      refLabel: 'Opcjonalna notatka lokalna w portfelu (np. „Patronite od XI 2026”)',
      btnActivatePatron: '★ Jestem Patronem CC — Aktywuj PRO',
      btnDeactivatePatron: 'Przełącz na wersję podstawową',
      svcEyebrow: 'Centralny rejestr CCProManager.SERVICES',
      svcTitle: 'Moje Usługi PRO',
      filterAll: 'Wszystkie',
      filterAi: 'AI & Biblia',
      filterMedia: 'Media & Społeczność',
      logEyebrow: 'Przejrzysta historia w Twojej przeglądarce',
      logTitle: 'Dziennik Portfela WspieramTO',
      btnClearLog: 'Wyczyść historię lokalną',
      promoHead: '★ Polecamy w ekosystemie Christian Culture'
    },
    en: {
      skip: 'Skip to content',
      tickBadge: 'WspieramTO PRO',
      brandSub: 'WspieramTO · User Panel',
      navHome: 'WspieramTO',
      navWallet: 'PRO Wallet',
      navServices: 'My PRO Services',
      navPatronage: 'Patronage',
      navCenter: 'My Center',
      navCta: 'Support Now',
      heroBadge: 'WspieramTO · User PRO Panel',
      h1a: 'Your central',
      h1b: 'PRO hub',
      heroLead: 'Every PRO service in the Christian Culture ecosystem runs on one central WspieramTO entitlement wallet — no separate subscriptions and no in-app paywalls.',
      heroCtaLogin: 'Sign in with Google (LUMINA)',
      heroCtaManage: 'Manage PRO Services ↓',
      heroCtaBack: 'Explore WspieramTO →',
      trust1: '1 entitlement wallet across all apps',
      trust2: 'Zero separate subscriptions',
      trust3: 'Instant CCProManager.SERVICES consistency',
      walletLiveLabel: 'WSPIERAMTO WALLET',
      walletServicesLabel: 'PRO services in one registry',
      walletQuickList: 'PRO services list ↓',
      walletQuickSupport: '1-Click Support ↗',
      gateEyebrow: 'Signed-in LUMINA & CC User Area',
      gateTitle: 'Sign in to open your WspieramTO User Panel',
      gateLead: 'One-click Google sign-in unlocks your central PRO wallet overview, Patron status management, and all registered Christian Culture PRO modules and plugins.',
      gatePerk1: 'Live PRO status overview (CC Patron / 7-day Trial / Owner)',
      gatePerk2: 'Every module registered in CCProManager.SERVICES in one place',
      gatePerk3: 'Single WspieramTO patronage without separate app payments',
      gateLoginBtn: 'Sign in with Google (LUMINA)',
      gateBackBtn: 'Back to WspieramTO',
      walletEyebrow: 'Central WspieramTO Entitlement Wallet',
      walletTitle: 'Your profile & ecosystem PRO status',
      openLuminaProfile: 'My LUMINA Profile →',
      openMyCenter: 'My Center →',
      statusLabel: 'CURRENT WALLET STATUS',
      accessLevelLabel: 'PRO access level',
      btnOpenSupport: 'Support via WspieramTO (1-Click)',
      btnSeeStudio: 'Goal: New 4K Studio →',
      patEyebrow: 'One patronage instead of ten subscriptions',
      patTitle: 'Manage WspieramTO Patronage',
      patLead: 'No individual app checkouts. Choose your support channel and sync your CC Patron status in your central wallet.',
      channelsTitle: 'Direct WspieramTO Channels',
      channelsLead: 'Every gift directly sustains 37 ad-free 24/7 Radio & TV channels, Audio Bible and mission tools:',
      syncTitle: 'Sync CC Patron Status',
      syncLead: 'Already supporting via Zrzutka, Patronite, Revolut or bank transfer? Confirm your Patron status in your wallet:',
      refLabel: 'Optional local wallet note (e.g. “Monthly Patron since Nov 2026”)',
      btnActivatePatron: '★ I am a CC Patron — Activate PRO',
      btnDeactivatePatron: 'Switch to basic tier',
      svcEyebrow: 'Central registry CCProManager.SERVICES',
      svcTitle: 'My PRO Services',
      filterAll: 'All',
      filterAi: 'AI & Bible',
      filterMedia: 'Media & Community',
      logEyebrow: 'Transparent history stored locally in your browser',
      logTitle: 'WspieramTO Wallet Log',
      btnClearLog: 'Clear local history',
      promoHead: '★ Featured in Christian Culture'
    }
  };

  var state = {
    lang: new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'pl',
    filter: 'all',
    selectedMethod: 'zrzutka'
  };

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function showToast(msg) {
    var t = document.getElementById('ccToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  function getServiceSvg(id) {
    var icons = {
      'ai-dla-jezusa': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 0-4 4v1a3 3 0 0 0-3 3v1a3 3 0 0 0 1 2.24V15a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-1.76A3 3 0 0 0 19 11v-1a3 3 0 0 0-3-3V6a4 4 0 0 0-4-4z"/><path d="M12 6v13"/></svg>',
      'cc-connect': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><path d="M8.5 7.5 11 15M15.5 7.5 13 15M9 6h6"/></svg>',
      'cc-bible-scholar': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 7h7M9 11h5"/></svg>',
      'mojabiblia': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
      'akademia': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
      'cc-studio': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><circle cx="4" cy="12" r="2"/><circle cx="12" cy="10" r="2"/><circle cx="20" cy="14" r="2"/></svg>',
      'player': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
      'lumina': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
    };
    return icons[id] || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  }

  function getAuthSession() {
    var user = null;
    var profile = null;
    var owner = false;
    try {
      var rawU = localStorage.getItem('lumina_current_user');
      var rawP = localStorage.getItem('lumina_current_user_profile') || localStorage.getItem('lumina_my_profile');
      var rawO = localStorage.getItem('ai_owner_session_v1');
      if (rawU) user = JSON.parse(rawU);
      if (rawP) profile = JSON.parse(rawP);
      if (rawO) {
        var oParsed = JSON.parse(rawO);
        if (oParsed && (oParsed.isOwner || oParsed.is_owner || oParsed.role === 'owner')) {
          owner = true;
        }
      }
      if (!user) {
        var rawSess = localStorage.getItem('lumina_user_session');
        if (rawSess) {
          var s = JSON.parse(rawSess);
          if (s && s.user) user = s.user;
          if (s && s.profile && !profile) profile = s.profile;
        }
      }
    } catch (e) {}
    return {
      authenticated: Boolean(user || owner),
      user: user,
      profile: profile,
      owner: owner
    };
  }

  function triggerGoogleLogin() {
    if (typeof window.ccLoginWithGoogle === 'function') {
      window.ccLoginWithGoogle();
    } else if (typeof window.loginWithGoogle === 'function') {
      window.loginWithGoogle();
    } else {
      showToast(state.lang === 'en' ? 'Redirecting to LUMINA sign-in...' : 'Przekierowanie do logowania LUMINA...');
      window.location.href = '/lumina';
    }
  }

  function applyLang(lang) {
    state.lang = lang === 'en' ? 'en' : 'pl';
    document.documentElement.lang = state.lang;
    var map = DICT[state.lang];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (map[k]) el.textContent = map[k];
    });
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === state.lang;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    mountEcoBars();
    renderPanel();
  }

  function mountEcoBars() {
    if (!window.CCEco) return;
    var en = state.lang === 'en';
    var items = [
      { id: 'panel-wsp', b: 'WSPIERAMTO PRO', t: en ? 'One patronage unlocks every PRO module across Christian Culture' : 'Jeden mecenat WspieramTO odblokowuje wszystkie usługi PRO Christian Culture', href: '/wspieramto', cc: true },
      { id: 'panel-zrz', b: 'ZRZUTKA.PL', t: '<strong>zrzutka.pl/z/ChristianCulture</strong> (BLIK / Karta)', href: 'https://zrzutka.pl/z/ChristianCulture', cc: true },
      { id: 'panel-mc', b: 'MOJE CENTRUM', t: en ? 'Your favorites, history and PRO cards in /moje-centrum' : 'Ulubione, historia i karty PRO w /moje-centrum', href: '/moje-centrum' }
    ];
    window.CCEco.mountTicker(document.getElementById('tickRun'), items, 'wspieramto-panel-ticker');
    window.CCEco.mountPromo(document.getElementById('promoStage'), document.getElementById('promoDots'), document.getElementById('promoBar'), state.lang, 'wspieramto-panel-promo', 10000);
  }

  function renderServicesGrid(st) {
    var grid = document.getElementById('panelServicesGrid');
    if (!grid || !window.CCProManager) return;

    var allServices = window.CCProManager.getServices ? window.CCProManager.getServices() : (window.CCProManager.SERVICES || []);
    var filtered = allServices.filter(function (svc) {
      if (state.filter === 'all') return true;
      var cat = svc.category || 'ai-biblia';
      return cat === state.filter;
    });

    var en = state.lang === 'en';
    grid.innerHTML = filtered.map(function (svc) {
      var benefitsHtml = (svc.benefits || []).slice(0, 3).map(function (b) {
        return '<li>' + esc(b) + '</li>';
      }).join('');

      var badgeCls = st.active ? 'cc-pro-badge is-active' : 'cc-pro-badge is-free';
      if (st.tier === 'patron' || st.tier === 'owner') badgeCls = 'cc-pro-badge is-patron';
      else if (st.tier === 'trial') badgeCls = 'cc-pro-badge is-trial';

      var statusText = st.active
        ? (en ? 'Unlocked in wallet' : 'Odblokowane w portfelu')
        : (en ? 'Requires WspieramTO' : 'Wymaga WspieramTO');

      return (
        '<article class="svc-card magic-card ' + (st.active ? 'is-unlocked' : '') + '">' +
          '<div class="svc-card__top">' +
            '<span class="svc-icon" aria-hidden="true">' + getServiceSvg(svc.id) + '</span>' +
            '<span class="' + badgeCls + '">' + esc(svc.badge || 'PRO') + '</span>' +
          '</div>' +
          '<h3>' + esc(svc.name) + '</h3>' +
          '<p class="svc-tagline">' + esc(svc.tagline) + '</p>' +
          '<ul class="svc-benefits">' + benefitsHtml + '</ul>' +
          '<div class="svc-card__foot">' +
            '<span class="svc-status-txt ' + (st.active ? '' : 'is-locked') + '">' + esc(statusText) + '</span>' +
            '<a href="' + esc(svc.url || '/wspieramto/panel') + '" class="svc-open-btn">' + (en ? 'Open →' : 'Otwórz →') + '</a>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderWalletLog() {
    var box = document.getElementById('panelWalletLog');
    if (!box || !window.CCProManager) return;
    var en = state.lang === 'en';
    var logs = window.CCProManager.getWalletLog ? window.CCProManager.getWalletLog() : [];
    if (!logs.length) {
      box.innerHTML = '<p class="wallet-log-empty">' + (en ? 'No local wallet events recorded yet. Status changes appear here.' : 'Brak lokalnych zdarzeń w dzienniku portfela. Zmiany statusu mecenatu zapisują się tutaj.') + '</p>';
      return;
    }

    var actionLabels = {
      patron_activated: en ? 'CC Patron status activated' : 'Aktywowano status Patrona CC',
      patron_deactivated: en ? 'Switched to basic tier' : 'Wyłączono status Patrona CC',
      status_update: en ? 'Wallet status updated' : 'Aktualizacja portfela'
    };

    box.innerHTML = '<ul class="wallet-log-list">' + logs.map(function (entry) {
      var dateStr = '';
      try {
        dateStr = new Date(entry.timestamp || Date.now()).toLocaleString(en ? 'en-GB' : 'pl-PL');
      } catch (e) {}
      var label = actionLabels[entry.action] || entry.action;
      return (
        '<li class="wallet-log-row">' +
          '<div><strong>' + esc(label) + '</strong><br><span>' + esc(entry.method ? ('Kanał: ' + entry.method + (entry.note ? ' · ' + entry.note : '')) : (entry.note || '')) + '</span></div>' +
          '<span class="wallet-log-time">' + esc(dateStr) + '</span>' +
        '</li>'
      );
    }).join('') + '</ul>';
  }

  function renderPanel() {
    var auth = getAuthSession();
    var mgr = window.CCProManager;
    var st = mgr ? mgr.getStatus() : { active: true, tier: 'trial', badge: 'PRO · 7d', daysLeft: 7, percent: 100, servicesCount: 8 };
    var totalServices = mgr && mgr.SERVICES ? mgr.SERVICES.length : (st.servicesCount || 8);
    var en = state.lang === 'en';

    // Hero wallet card (widoczna zawsze, bez danych prywatnych dla gościa)
    var heroCountEl = document.getElementById('heroServicesCount');
    if (heroCountEl) heroCountEl.textContent = String(totalServices);

    var heroBadge = document.getElementById('heroProBadge');
    if (heroBadge && mgr) mgr.syncBadgeElement(heroBadge);

    var heroBar = document.getElementById('heroProgressBar');
    if (heroBar) heroBar.style.width = String(auth.authenticated ? (st.percent || 0) : 100) + '%';

    var heroActionText = document.getElementById('heroActionText');
    var heroStatusSummary = document.getElementById('heroStatusSummary');
    if (auth.authenticated) {
      if (heroActionText) heroActionText.textContent = DICT[state.lang].heroCtaManage;
      if (heroStatusSummary) {
        if (st.tier === 'owner') {
          heroStatusSummary.textContent = en ? 'Owner session active — all PRO modules unlocked.' : 'Sesja Właściciela aktywna — pełny dostęp do wszystkich usług PRO.';
        } else if (st.tier === 'patron') {
          heroStatusSummary.textContent = en ? 'Active WspieramTO Patron — all PRO modules unlocked.' : 'Aktywny Mecenat WspieramTO — wszystkie usługi PRO są odblokowane.';
        } else if (st.tier === 'trial') {
          heroStatusSummary.textContent = en ? ('7-day PRO start: ' + st.daysLeft + ' days left.') : ('Darmowy start PRO: pozostało ' + st.daysLeft + ' z 7 dni.');
        } else {
          heroStatusSummary.textContent = en ? 'Basic tier — support via WspieramTO to unlock PRO.' : 'Wersja podstawowa — wsparcie w WspieramTO odblokowuje PRO.';
        }
      }
    } else {
      if (heroActionText) heroActionText.textContent = DICT[state.lang].heroCtaLogin;
      if (heroStatusSummary) {
        heroStatusSummary.textContent = en ? 'Sign in with Google (LUMINA) to open your personal WspieramTO wallet.' : 'Zaloguj się przez Google (LUMINA), aby otworzyć swój osobisty portfel WspieramTO.';
      }
    }

    var gate = document.getElementById('panelAuthGate');
    var content = document.getElementById('userPanelContent');
    if (!auth.authenticated) {
      if (gate) gate.hidden = false;
      if (content) content.hidden = true;
      return;
    }

    if (gate) gate.hidden = true;
    if (content) content.hidden = false;

    // Tożsamość zalogowanego użytkownika
    var user = auth.user || {};
    var profile = auth.profile || {};
    var fullName = profile.name || user.displayName || (user.email ? user.email.split('@')[0] : (auth.owner ? 'Właściciel Ekosystemu CC' : 'Członek LUMINA'));
    var avatarUrl = profile.avatar || user.photoURL || '/lumina_icon.jpg';
    if (avatarUrl && !avatarUrl.startsWith('/') && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
      avatarUrl = '/' + avatarUrl;
    }

    var nameEl = document.getElementById('panelUserName');
    if (nameEl) nameEl.textContent = fullName;

    var subEl = document.getElementById('panelUserSub');
    if (subEl) subEl.textContent = user.email ? user.email : (en ? 'Signed in to LUMINA community' : 'Konto połączone ze społecznością LUMINA');

    var avatarEl = document.getElementById('panelUserAvatar');
    if (avatarEl) avatarEl.src = avatarUrl;

    var profileLinkEl = document.getElementById('panelUserProfileLink');
    if (profileLinkEl) {
      profileLinkEl.href = profile.slug ? ('/lumina-profile.html?u=' + encodeURIComponent(profile.slug)) : '/lumina-profile.html';
    }

    var badgeEl = document.getElementById('panelProBadge');
    if (badgeEl && mgr) mgr.syncBadgeElement(badgeEl);

    var servicesBadgeEl = document.getElementById('panelServicesBadge');
    if (servicesBadgeEl) {
      servicesBadgeEl.textContent = (st.active ? totalServices : 0) + ' / ' + totalServices;
    }

    var statusTitleEl = document.getElementById('panelStatusTitle');
    var statusDescEl = document.getElementById('panelStatusDesc');
    var percentEl = document.getElementById('panelPercentText');
    var fillEl = document.getElementById('panelProgressFill');

    if (statusTitleEl && statusDescEl) {
      if (st.tier === 'owner') {
        statusTitleEl.textContent = en ? 'Ecosystem Owner Full PRO Access' : 'Pełny Dostęp Właściciela Ekosystemu Christian Culture';
        statusDescEl.textContent = en ? 'Every registered PRO module in CCProManager.SERVICES is active.' : 'Wszystkie usługi w centralnym rejestrze CCProManager.SERVICES są aktywne.';
      } else if (st.tier === 'patron') {
        statusTitleEl.textContent = en ? 'Active WspieramTO Patron (CC Patron)' : 'Aktywny Mecenat WspieramTO (Status Patrona CC)';
        statusDescEl.textContent = en ? 'Thank you for sustaining ad-free Gospel media. Every PRO module is unlocked.' : 'Dziękujemy! Twój mecenat utrzymuje wolne media Boże 24/7 i odblokowuje wszystkie ' + totalServices + ' usług PRO.';
      } else if (st.tier === 'trial') {
        statusTitleEl.textContent = en ? ('Free PRO Start: ' + st.daysLeft + ' / 7 days left') : ('Darmowy Start PRO: pozostało ' + st.daysLeft + ' z 7 dni');
        statusDescEl.textContent = en ? 'Explore every PRO feature freely. Confirm your WspieramTO patronage anytime.' : 'Korzystasz z pełnych możliwości PRO na start. W dowolnym momencie możesz potwierdzić mecenat WspieramTO.';
      } else {
        statusTitleEl.textContent = en ? 'Basic Tier (Support in WspieramTO unlocks PRO)' : 'Wersja Podstawowa (Wsparcie w WspieramTO odblokowuje pełnię PRO)';
        statusDescEl.textContent = en ? 'There are zero separate app payments — one WspieramTO gift unlocks everything.' : 'Nie prowadzimy oddzielnych płatności w aplikacjach. Jedno wsparcie w WspieramTO odblokowuje cały pakiet PRO.';
      }
    }

    var pct = st.percent != null ? st.percent : (st.active ? 100 : 0);
    if (percentEl) percentEl.textContent = pct + '%';
    if (fillEl) fillEl.style.width = pct + '%';

    var actBtn = document.getElementById('panelActivatePatronBtn');
    var deactBtn = document.getElementById('panelDeactivatePatronBtn');
    if (actBtn) actBtn.style.display = st.tier === 'patron' ? 'none' : 'inline-flex';
    if (deactBtn) deactBtn.style.display = st.tier === 'patron' ? 'inline-flex' : 'none';

    renderServicesGrid(st);
    renderWalletLog();
  }

  function initHeroCanvas() {
    var c = document.getElementById('heroParticles');
    if (!c) return;
    var ctx = c.getContext('2d');
    if (!ctx) return;

    var w = 0, h = 0, dots = [], dpr = Math.min(1.5, window.devicePixelRatio || 1);
    function resize() {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = Math.max(1, Math.floor(w * dpr));
      c.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    var count = w < 640 ? 22 : 42;
    for (var i = 0; i < count; i++) {
      dots.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.22 - 0.08,
        gold: i % 3 === 0
      });
    }

    var last = 0, visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = Boolean(entries[0] && entries[0].isIntersecting);
      }).observe(c);
    }

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var speedMul = reduce ? 0.45 : 1;

    function frame(now) {
      requestAnimationFrame(frame);
      if (document.hidden || !visible || now - last < 34) return;
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx * speedMul;
        d.y += d.vy * speedMul;
        if (d.x < 0) d.x = w; else if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h; else if (d.y > h) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.gold ? 'rgba(255, 138, 43, 0.55)' : 'rgba(235, 214, 159, 0.38)';
        ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }

  function initReveal() {
    function showEl(el) { el.classList.add('is-in'); }
    function checkPassed() {
      var cut = window.innerHeight + 90;
      document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) {
        if (el.getBoundingClientRect().top <= cut) showEl(el);
      });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { showEl(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0.01, rootMargin: '80px 0px' });
      document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
      window.addEventListener('scroll', checkPassed, { passive: true });
      checkPassed();
    } else {
      document.querySelectorAll('.reveal').forEach(showEl);
    }
  }

  function initScrollProgress() {
    var bar = document.getElementById('scrollProgressBar');
    if (!bar) return;
    function update() {
      var doc = document.documentElement;
      var max = Math.max(1, doc.scrollHeight - window.innerHeight);
      var pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      bar.style.width = pct.toFixed(2) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function bindUI() {
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
    });

    var burger = document.getElementById('burgerBtn');
    var menu = document.getElementById('menu');
    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = menu.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          menu.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
      window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) {
          menu.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    var heroActionBtn = document.getElementById('heroActionBtn');
    if (heroActionBtn) {
      heroActionBtn.addEventListener('click', function () {
        var auth = getAuthSession();
        if (auth.authenticated) {
          var target = document.getElementById('moje-uslugi');
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        } else {
          triggerGoogleLogin();
        }
      });
    }

    var gateLoginBtn = document.getElementById('panelGateLoginBtn');
    if (gateLoginBtn) {
      gateLoginBtn.addEventListener('click', triggerGoogleLogin);
    }

    function openModal() {
      if (window.CCProManager) window.CCProManager.openUpgradeModal();
      else if (window.CCWspieramTo) window.CCWspieramTo.open();
      else window.location.href = '/wspieramto';
    }

    var s1 = document.getElementById('heroSupportModalBtn');
    var s2 = document.getElementById('panelOpenSupportBtn');
    if (s1) s1.addEventListener('click', openModal);
    if (s2) s2.addEventListener('click', openModal);

    document.querySelectorAll('#panelMethodPills .m-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        state.selectedMethod = pill.getAttribute('data-method') || 'zrzutka';
        document.querySelectorAll('#panelMethodPills .m-pill').forEach(function (p) {
          var on = p === pill;
          p.classList.toggle('is-on', on);
          p.setAttribute('aria-checked', on ? 'true' : 'false');
        });
      });
    });

    var actBtn = document.getElementById('panelActivatePatronBtn');
    if (actBtn) {
      actBtn.addEventListener('click', function () {
        if (!window.CCProManager) return;
        var refEl = document.getElementById('panelDonorRefInput');
        var donorRef = refEl ? refEl.value.trim() : '';
        window.CCProManager.activatePatron({
          supportMethod: state.selectedMethod,
          donorRef: donorRef || null
        });
        showToast(state.lang === 'en' ? 'CC Patron status activated in wallet!' : 'Aktywowano status Patrona CC w portfelu!');
        renderPanel();
      });
    }

    var deactBtn = document.getElementById('panelDeactivatePatronBtn');
    if (deactBtn) {
      deactBtn.addEventListener('click', function () {
        if (!window.CCProManager) return;
        window.CCProManager.deactivatePatron();
        showToast(state.lang === 'en' ? 'Switched to basic tier.' : 'Przełączono na wersję podstawową.');
        renderPanel();
      });
    }

    document.querySelectorAll('.svc-filters .svc-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        state.filter = tab.getAttribute('data-filter') || 'all';
        document.querySelectorAll('.svc-filters .svc-tab').forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-on', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        if (window.CCProManager) renderServicesGrid(window.CCProManager.getStatus());
      });
    });

    var clearLogBtn = document.getElementById('panelClearLogBtn');
    if (clearLogBtn) {
      clearLogBtn.addEventListener('click', function () {
        if (window.CCProManager && window.CCProManager.clearWalletLog) {
          window.CCProManager.clearWalletLog();
          renderWalletLog();
          showToast(state.lang === 'en' ? 'Local log cleared.' : 'Wyczyszczono lokalny dziennik.');
        }
      });
    }

    window.addEventListener('lumina-auth-state', renderPanel);
    window.addEventListener('storage', renderPanel);
    if (window.CCProManager && window.CCProManager.subscribe) {
      window.CCProManager.subscribe(renderPanel);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindUI();
    applyLang(state.lang);
    initScrollProgress();
    initHeroCanvas();
    initReveal();
  });
})();
