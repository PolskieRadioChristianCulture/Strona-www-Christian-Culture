/**
 * ══════════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE — CENTRALNY MENEDŻER USŁUG PRO & ENTITLEMENTS (WSPIERAMTO)
 * Plik: /js/cc-pro-manager.js (oraz ES import / CommonJS)
 * 
 * Centralny mechanizm zarządzania dostępem do usług PRO w całym ekosystemie.
 * Zgodnie z Dyrektywą Dowódcy:
 * 1. Wszystkie obecne i przyszłe usługi PRO powiązane są WYŁĄCZNIE z systemem WspieramTO.
 * 2. Kategoryczny zakaz tworzenia odrębnych systemów finansowania / subskrypcji dla poszczególnych aplikacji.
 * 3. Jeden status mecenatu odblokowuje wszystkie usługi PRO w całym ekosystemie.
 * 4. Spójne oznaczenia PRO (Champagne Gold #C4A35A + Akcja Pomarańczowa #FF7A00).
 * ══════════════════════════════════════════════════════════════════════════════
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CCProManager = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var STORAGE_KEY = 'cc_pro_entitlement_v1';
  var WALLET_LOG_KEY = 'cc_wspieramto_wallet_log_v1';
  var LEGACY_AI_PATRON_KEY = 'ai_dla_jezusa_is_patron_v1';
  var LEGACY_AI_TRIAL_KEY = 'ai_dla_jezusa_pro_trial_started_v1';
  var OWNER_SESSION_KEY = 'ai_owner_session_v1';
  var PANEL_URL = '/wspieramto/panel';
  var TRIAL_DAYS = 7;

  /**
   * Kanoniczny rejestr wszystkich obecnych i planowanych usług PRO ekosystemu Christian Culture.
   * Wszystkie podpięte pod JEDEN wspólny mecenat WspieramTO.
   * Nowe moduły lub wtyczki wystarczy rejestrować w CCProManager.SERVICES (przez registerService),
   * a uzyskają natychmiastową spójność w całym ekosystemie i w Panelu Użytkownika.
   */
  var CC_PRO_SERVICES = [
    {
      id: 'ai-dla-jezusa',
      name: 'AI dla Jezusa PRO',
      category: 'ai-biblia',
      tagline: 'Głębokie modele badawcze, nielimitowani asystenci biblijni i zaawansowane konspekty',
      url: '/ai/aplikacja',
      icon: 'fa-solid fa-brain',
      badge: 'PRO · AI',
      benefits: [
        'Dostęp do zaawansowanych modeli głębokiej analizy biblijnej',
        'Nielimitowane asysty studium i egzegezy Pisma Świętego',
        'Priorytetowe generowanie konspektów kazań i scenariuszy wideo'
      ]
    },
    {
      id: 'cc-connect',
      name: 'CC Connect 2.0 PRO',
      category: 'ai-biblia',
      tagline: 'Pełna orkiestracja 40+ wtyczek domenowych i narzędzi Scholar',
      url: '/ai/aplikacja?nav=Połączenia',
      icon: 'fa-solid fa-network-wired',
      badge: 'PRO · CONNECT',
      benefits: [
        'Odblokowane wszystkie wtyczki CC Connect i CC Bible Scholar',
        'Wieloplatformowe łączenie narzędzi misyjnych i asystentów',
        'Automatyczna synchronizacja stanu narzędzi w profilu'
      ]
    },
    {
      id: 'cc-bible-scholar',
      name: 'CC Bible Scholar PRO',
      category: 'ai-biblia',
      tagline: '344 799 odsyłaczy OpenBible, morfologia SBLGNT/OSHB, atlas Theographic i synopsa Ewangelii',
      url: '/mojabiblia',
      icon: 'fa-solid fa-scroll',
      badge: 'PRO · SCHOLAR',
      benefits: [
        'Pełna baza odsyłaczy krzyżowych OpenBible CC-BY oraz synopsa czterech Ewangelii',
        'Dekoder morfologii SBLGNT/OSHB oraz atlas miejsc i postaci Theographic',
        'Błyskawiczna konkordancja UBG i eksport map myśli egzegezy do SVG/XML'
      ]
    },
    {
      id: 'mojabiblia',
      name: 'MojaBiblia Interlinearna PRO',
      category: 'ai-biblia',
      tagline: 'Morfologia greki i hebrajskiego, kody Stronga i wielopoziomowe porównywarki',
      url: '/mojabiblia',
      icon: 'fa-solid fa-book-bible',
      badge: 'PRO · BIBLIA',
      benefits: [
        'Morfologia i kody Stronga z pełnym aparatem leksykalnym',
        'Zaawansowane notatki studyjne i nieograniczone zakładki',
        'Studyjny tryb interlinearny z tekstem oryginalnym'
      ]
    },
    {
      id: 'akademia',
      name: 'Akademia Biblijna PRO',
      category: 'ai-biblia',
      tagline: 'Pełne archiwum Kursu Codziennego, konspekty PDF do druku i certyfikaty formacji',
      url: '/akademia',
      icon: 'fa-solid fa-graduation-cap',
      badge: 'PRO · AKADEMIA',
      benefits: [
        'Dostęp do pełnego archiwum wszystkich lekcji Kursu Codziennego',
        'Materiały dydaktyczne i konspekty formacyjne do druku (PDF)',
        'Certyfikaty ukończenia ścieżek studyjnych'
      ]
    },
    {
      id: 'cc-studio',
      name: 'CC Studio DAW PRO',
      category: 'media-spolecznosc',
      tagline: 'Wielościeżkowa oś czasu, mastering radiowy -16 LUFS i eksport słuchowisk',
      url: '/studio',
      icon: 'fa-solid fa-sliders',
      badge: 'PRO · STUDIO',
      benefits: [
        'Mastering broadcastowy do normy EBU R128 (-16 LUFS)',
        'Wielościeżkowa reżyseria dźwięku Biblia Audio',
        'Eksport stems i gotowych miksów lektorskich'
      ]
    },
    {
      id: 'player',
      name: 'Radio CC Player Hi-Fi PRO',
      category: 'media-spolecznosc',
      tagline: 'Transmisja bezstratna, profile korektora audio i ekskluzywne streamy studyjne',
      url: '/player',
      icon: 'fa-solid fa-radio',
      badge: 'PRO · HI-FI',
      benefits: [
        'Strumieniowanie High-Fidelity 320 kbps bez kompresji stratnej',
        'Zaawansowany korektor barwy głosu i muzyki',
        'Odtwarzanie studyjne bez buforowania'
      ]
    },
    {
      id: 'lumina',
      name: 'LUMINA Mecenat PRO',
      category: 'media-spolecznosc',
      tagline: 'Złota odznaka Mecenasa Ewangelii, zamknięte spotkania live i pokoje dyskusyjne',
      url: '/lumina',
      icon: 'fa-solid fa-users',
      badge: 'PRO · MECENAT',
      benefits: [
        'Wyróżniona złota odznaka Patrona / Mecenasa na tablicy społeczności',
        'Dostęp do zamkniętych debat i spotkań autorskich z twórcami',
        'Bezpośredni udział w konsultacjach strategicznych misji'
      ]
    }
  ];

  var listeners = [];

  function safeGetStorage(key) {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {}
    return null;
  }

  function safeSetStorage(key, value) {
    try {
      if (typeof localStorage !== 'undefined') {
        if (value === null || value === undefined) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      }
    } catch (e) {}
  }

  function isOwnerSessionActive() {
    try {
      var raw = safeGetStorage(OWNER_SESSION_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && (parsed.isOwner || parsed.is_owner || parsed.role === 'owner')) {
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  function readStoredEntitlement() {
    var raw = safeGetStorage(STORAGE_KEY);
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (e) {}
    }
    return null;
  }

  /**
   * Zwraca aktualny stan uprawnień mecenatu PRO dla użytkownika.
   * @param {string} [serviceId] - Opcjonalny identyfikator konkretnej usługi
   */
  function getStatus(serviceId) {
    // 1. Sprawdź sesję Właściciela / Nazira
    if (isOwnerSessionActive()) {
      return {
        active: true,
        tier: 'owner',
        label: 'PRO · WŁAŚCICIEL',
        badge: '★ WŁAŚCICIEL',
        source: 'owner',
        daysLeft: null,
        percent: 100,
        supportUrl: '/wspieramto',
        panelUrl: PANEL_URL,
        servicesCount: CC_PRO_SERVICES.length,
        serviceAccess: true
      };
    }

    // 2. Sprawdź centralny zapis mecenatu WspieramTO
    var ent = readStoredEntitlement();
    var now = Date.now();

    if (ent && ent.tier === 'patron') {
      return {
        active: true,
        tier: 'patron',
        label: 'PRO · PATRON CC',
        badge: '★ MECENAS CC',
        source: ent.source || 'wspieramto',
        supportMethod: ent.supportMethod || 'wspieramto',
        donorRef: ent.donorRef || null,
        activatedAt: ent.activatedAt || null,
        daysLeft: null,
        percent: 100,
        supportUrl: '/wspieramto',
        panelUrl: PANEL_URL,
        servicesCount: CC_PRO_SERVICES.length,
        serviceAccess: true
      };
    }

    // Sprawdź migrację ze starszego klucza AI dla Jezusa
    var legacyPatron = safeGetStorage(LEGACY_AI_PATRON_KEY);
    if (legacyPatron === '1') {
      return {
        active: true,
        tier: 'patron',
        label: 'PRO · PATRON CC',
        badge: '★ MECENAS CC',
        source: 'wspieramto',
        supportMethod: 'wspieramto',
        donorRef: null,
        activatedAt: null,
        daysLeft: null,
        percent: 100,
        supportUrl: '/wspieramto',
        panelUrl: PANEL_URL,
        servicesCount: CC_PRO_SERVICES.length,
        serviceAccess: true
      };
    }

    // 3. Sprawdź 7-dniowy okres próbny PRO (Trial)
    var trialStartedAt = ent && ent.trialStartedAt ? ent.trialStartedAt : null;
    if (!trialStartedAt) {
      var legacyTrial = safeGetStorage(LEGACY_AI_TRIAL_KEY);
      if (legacyTrial) {
        trialStartedAt = parseInt(legacyTrial, 10);
      }
    }

    if (!trialStartedAt) {
      trialStartedAt = now;
      safeSetStorage(LEGACY_AI_TRIAL_KEY, String(trialStartedAt));
      safeSetStorage(STORAGE_KEY, {
        version: 1,
        tier: 'trial',
        source: 'trial',
        trialStartedAt: trialStartedAt,
        servicesCount: CC_PRO_SERVICES.length
      });
    }

    var elapsedMs = now - trialStartedAt;
    var totalTrialMs = TRIAL_DAYS * 86400000;
    var remainingMs = totalTrialMs - elapsedMs;

    if (remainingMs > 0) {
      var daysLeft = Math.max(1, Math.min(TRIAL_DAYS, Math.ceil(remainingMs / 86400000)));
      return {
        active: true,
        tier: 'trial',
        label: 'PRO · ' + daysLeft + 'd',
        badge: 'PRO · ' + daysLeft + ' dni',
        source: 'trial',
        daysLeft: daysLeft,
        percent: Math.round((daysLeft / TRIAL_DAYS) * 100),
        supportUrl: '/wspieramto',
        panelUrl: PANEL_URL,
        servicesCount: CC_PRO_SERVICES.length,
        serviceAccess: true
      };
    }

    // 4. Okres próbny minął — bezpłatna wersja podstawowa (wymaga mecenatu WspieramTO)
    return {
      active: false,
      tier: 'free',
      label: 'PRO',
      badge: 'PRO',
      source: 'none',
      daysLeft: 0,
      percent: 0,
      supportUrl: '/wspieramto',
      panelUrl: PANEL_URL,
      servicesCount: CC_PRO_SERVICES.length,
      serviceAccess: false
    };
  }

  /**
   * Zwraca pełną listę zarejestrowanych usług PRO (kanoniczne + dynamicznie dodane moduły/wtyczki).
   */
  function getServices() {
    return CC_PRO_SERVICES.slice();
  }

  /**
   * Zwraca pojedynczą usługę PRO wg identyfikatora lub null.
   * @param {string} serviceId
   */
  function getService(serviceId) {
    var cleanId = String(serviceId || '').trim();
    if (!cleanId) return null;
    for (var i = 0; i < CC_PRO_SERVICES.length; i++) {
      if (CC_PRO_SERVICES[i].id === cleanId) return CC_PRO_SERVICES[i];
    }
    return null;
  }

  /**
   * Rejestruje nowy moduł lub wtyczkę w centralnym rejestrze CCProManager.SERVICES.
   * Zapewnia natychmiastową spójność uprawnień i widoczność w Panelu Użytkownika WspieramTO.
   * @param {object} serviceDef
   */
  function registerService(serviceDef) {
    if (!serviceDef || typeof serviceDef !== 'object') {
      throw new Error('Wymagana definicja usługi PRO.');
    }
    var id = String(serviceDef.id || '').trim();
    var name = String(serviceDef.name || '').trim();
    var tagline = String(serviceDef.tagline || serviceDef.description || '').trim();
    var url = String(serviceDef.url || '/wspieramto/panel').trim();

    if (!id || !name || !tagline) {
      throw new Error('Usługa PRO musi zawierać pola id, name oraz tagline.');
    }

    var badge = String(serviceDef.badge || ('PRO · ' + id.toUpperCase())).trim();
    var entry = {
      id: id,
      name: name,
      category: String(serviceDef.category || 'ai-biblia').trim(),
      tagline: tagline,
      url: url,
      icon: String(serviceDef.icon || 'fa-solid fa-star').trim(),
      badge: badge,
      benefits: Array.isArray(serviceDef.benefits) && serviceDef.benefits.length > 0
        ? serviceDef.benefits.slice()
        : ['Dostęp odblokowany jednym mecenatem WspieramTO (bez odrębnych opłat)']
    };

    var replaced = false;
    for (var i = 0; i < CC_PRO_SERVICES.length; i++) {
      if (CC_PRO_SERVICES[i].id === id) {
        CC_PRO_SERVICES[i] = entry;
        replaced = true;
        break;
      }
    }
    if (!replaced) {
      CC_PRO_SERVICES.push(entry);
    }

    notifyListeners();
    return entry;
  }

  /**
   * Odczytuje lokalny dziennik aktywności portfela WspieramTO (maks. 30 wpisów, bez PII).
   */
  function getWalletLog() {
    var raw = safeGetStorage(WALLET_LOG_KEY);
    if (!raw) return [];
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Dopisuje wpis o aktywności portfela uprawnień (lokalnie w przeglądarce).
   * @param {object} entry
   */
  function appendWalletLog(entry) {
    entry = entry || {};
    var log = getWalletLog();
    var item = {
      action: String(entry.action || 'status_update'),
      method: String(entry.method || 'wspieramto'),
      note: String(entry.note || ''),
      timestamp: entry.timestamp || Date.now()
    };
    log.unshift(item);
    if (log.length > 30) log = log.slice(0, 30);
    safeSetStorage(WALLET_LOG_KEY, log);
    return log;
  }

  function clearWalletLog() {
    safeSetStorage(WALLET_LOG_KEY, []);
    notifyListeners();
    return [];
  }

  /**
   * Sprawdza, czy użytkownik ma dostęp do danej usługi PRO.
   * @param {string} serviceId
   * @returns {boolean}
   */
  function hasAccess(serviceId) {
    var st = getStatus(serviceId);
    return Boolean(st.active);
  }

  /**
   * Aktywuje status mecenasa/patrona powiązanego z systemem WspieramTO.
   * @param {object} [options]
   * @param {string} [options.supportMethod] - np. 'zrzutka', 'patronite', 'revolut', 'przelew', 'kod'
   * @param {string} [options.donorRef] - referencja darczyńcy
   */
  function activatePatron(options) {
    options = options || {};
    var data = {
      version: 1,
      tier: 'patron',
      source: 'wspieramto',
      supportMethod: options.supportMethod || 'wspieramto',
      donorRef: options.donorRef || null,
      activatedAt: Date.now(),
      expiresAt: null
    };
    safeSetStorage(STORAGE_KEY, data);
    safeSetStorage(LEGACY_AI_PATRON_KEY, '1');
    appendWalletLog({
      action: 'patron_activated',
      method: data.supportMethod,
      note: options.donorRef ? ('Ref: ' + String(options.donorRef).slice(0, 64)) : 'Aktywacja statusu Patrona CC (WspieramTO)'
    });
    notifyListeners();
    return getStatus();
  }

  /**
   * Resetuje status mecenasa do domyślnego rozliczenia (np. przy rezygnacji).
   */
  function deactivatePatron() {
    safeSetStorage(LEGACY_AI_PATRON_KEY, null);
    var ent = readStoredEntitlement() || {};
    ent.tier = 'free';
    ent.source = 'none';
    safeSetStorage(STORAGE_KEY, ent);
    appendWalletLog({
      action: 'patron_deactivated',
      method: 'wspieramto',
      note: 'Powrót do wersji podstawowej'
    });
    notifyListeners();
    return getStatus();
  }

  /**
   * Otwiera centralny modal mecenatu WspieramTO.
   * Zgodnie z dyrektywą Dowódcy: żadna aplikacja nie posiada własnego systemu płatności!
   * @param {object} [options]
   */
  function openUpgradeModal(options) {
    options = options || {};
    if (typeof window !== 'undefined') {
      if (window.CCWspieramTo && typeof window.CCWspieramTo.open === 'function') {
        window.CCWspieramTo.open(options);
        return;
      }
      if (typeof window.openWspieramToModal === 'function') {
        window.openWspieramToModal(options);
        return;
      }
      // Fallback: przejście do /wspieramto
      window.location.href = '/wspieramto';
    }
  }

  /**
   * Rejestruje nasłuchiwacz zmian statusu PRO (np. przy aktualizacji w innej karcie).
   * @param {function} fn
   * @returns {function} unregister function
   */
  function subscribe(fn) {
    if (typeof fn === 'function') {
      listeners.push(fn);
      return function () {
        var idx = listeners.indexOf(fn);
        if (idx !== -1) listeners.splice(idx, 1);
      };
    }
    return function () {};
  }

  function notifyListeners() {
    var st = getStatus();
    for (var i = 0; i < listeners.length; i++) {
      try {
        listeners[i](st);
      } catch (e) {}
    }
  }

  // Nasłuchiwanie zmian w localStorage między kartami
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_KEY || e.key === LEGACY_AI_PATRON_KEY || e.key === OWNER_SESSION_KEY) {
        notifyListeners();
      }
    });
  }

  /**
   * Tworzy lub synchronizuje element odznaki PRO w DOM.
   * @param {HTMLElement} el
   * @param {object} [opts]
   */
  function syncBadgeElement(el, opts) {
    if (!el) return;
    opts = opts || {};
    var st = getStatus(opts.serviceId);

    el.classList.add('cc-pro-badge');
    el.classList.toggle('is-active', st.active);
    el.classList.toggle('is-patron', st.tier === 'patron' || st.tier === 'owner');
    el.classList.toggle('is-trial', st.tier === 'trial');
    el.classList.toggle('is-free', !st.active);

    if (st.tier === 'owner') {
      el.textContent = 'PRO · WŁAŚCICIEL';
      el.title = 'Pełna wersja PRO Właściciela Ekosystemu Christian Culture';
    } else if (st.tier === 'patron') {
      el.textContent = 'PRO · PATRON';
      el.title = 'Wersja PRO aktywna dzięki mecenatowi w systemie WspieramTO';
    } else if (st.tier === 'trial') {
      el.textContent = 'PRO · ' + st.daysLeft + 'd';
      el.title = 'Wersja PRO aktywna przez jeszcze ' + st.daysLeft + ' dni (7 dni na start bez opłat)';
    } else {
      el.textContent = 'PRO';
      el.title = 'Kliknij, aby odblokować pełną wersję PRO dla Patronów WspieramTO';
    }
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    WALLET_LOG_KEY: WALLET_LOG_KEY,
    PANEL_URL: PANEL_URL,
    TRIAL_DAYS: TRIAL_DAYS,
    SERVICES: CC_PRO_SERVICES,
    getServices: getServices,
    getService: getService,
    registerService: registerService,
    getStatus: getStatus,
    hasAccess: hasAccess,
    activatePatron: activatePatron,
    deactivatePatron: deactivatePatron,
    getWalletLog: getWalletLog,
    appendWalletLog: appendWalletLog,
    clearWalletLog: clearWalletLog,
    openUpgradeModal: openUpgradeModal,
    syncBadgeElement: syncBadgeElement,
    subscribe: subscribe
  };
});
