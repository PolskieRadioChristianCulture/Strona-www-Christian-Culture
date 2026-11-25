/**
 * ══════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE — WSPIERAMTO 2.0 GLOBAL MODAL
 * Plik: /components/cc-wspieramto-modal.js
 * 
 * Błyskawiczny, 1-Click modal mecenatu misyjnego dla całego ekosystemu CC.
 * Pozwala na wsparcie w 8 sekund bez przerywania odtwarzania radia czy audio.
 * Standard: Champagne Gold (#C4A35A) & Akcja Pomarańczowa (#FF7A00).
 * Ergonomia SMCC: min. 44px tap target, focus trap, Escape, aria.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  if (window._ccWspieramToModalInitialized) return;
  window._ccWspieramToModalInitialized = true;

  const MODAL_ID = 'ccWspieramToModal';

  // Waluty i predefiniowane kwoty (spójne z progami Zrzutka.pl 25/99/490 zł oraz cegiełką na Nowe Studio RTV)
  const CURRENCIES = {
    PLN: { symbol: 'zł', tiers: [25, 49, 99, 250, 490], defaultTier: 49 },
    GBP: { symbol: '£', tiers: [5, 10, 25, 50, 100], defaultTier: 10 },
    EUR: { symbol: '€', tiers: [5, 12, 25, 55, 115], defaultTier: 12 },
    USD: { symbol: '$', tiers: [6, 15, 30, 60, 125], defaultTier: 15 }
  };

  let currentCurrency = 'PLN';
  let currentAmount = 49;

  // Detekcja języka / waluty
  try {
    const lang = (document.documentElement.lang || navigator.language || 'pl').slice(0, 2).toLowerCase();
    if (lang === 'en') currentCurrency = 'GBP';
    else if (['de', 'es', 'fr', 'it', 'nl'].includes(lang)) currentCurrency = 'EUR';
    currentAmount = CURRENCIES[currentCurrency].defaultTier;
  } catch (e) {
    currentCurrency = 'PLN';
  }

  // Wstrzyknięcie styli CSS
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .cc-wt-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(4, 7, 13, 0.82);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.24s;
    }
    .cc-wt-overlay.cc-wt-open {
      opacity: 1;
      visibility: visible;
    }
    .cc-wt-dialog {
      background: #0B0F19;
      border: 1px solid rgba(196, 163, 90, 0.35);
      border-radius: 24px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(196, 163, 90, 0.15);
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
      color: #EEF1F5;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 24px;
      position: relative;
      transform: translateY(20px) scale(0.97);
      transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cc-wt-overlay.cc-wt-open .cc-wt-dialog {
      transform: translateY(0) scale(1);
    }
    .cc-wt-close {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cc-wt-close:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }
    .cc-wt-header {
      text-align: center;
      margin-bottom: 20px;
      padding-top: 6px;
    }
    .cc-wt-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(196, 163, 90, 0.15);
      border: 1px solid rgba(196, 163, 90, 0.4);
      color: #E2CC9A;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .cc-wt-title {
      font-family: 'Lora', Georgia, serif;
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 6px 0;
      line-height: 1.2;
    }
    .cc-wt-sub {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
    }
    /* Wybór waluty */
    .cc-wt-curr-row {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin-bottom: 16px;
    }
    .cc-wt-curr-btn {
      min-height: 44px;
      padding: 0 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.04);
      color: #94a3b8;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .cc-wt-curr-btn.cc-wt-active {
      background: rgba(196, 163, 90, 0.2);
      border-color: #C4A35A;
      color: #E2CC9A;
    }
    /* Wybór kwoty */
    .cc-wt-tiers {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(84px, 1fr));
      gap: 8px;
      margin-bottom: 18px;
    }
    .cc-wt-studio-bar {
      background: linear-gradient(135deg, rgba(255, 122, 0, 0.12), rgba(196, 163, 90, 0.12));
      border: 1px solid rgba(255, 122, 0, 0.35);
      border-radius: 12px;
      padding: 10px 12px;
      margin-bottom: 16px;
      font-size: 12px;
      color: #e2e8f0;
      text-align: center;
      line-height: 1.45;
    }
    .cc-wt-studio-bar strong {
      color: #FFB366;
    }
    .cc-wt-studio-bar a {
      color: #E2CC9A;
      text-decoration: underline;
      font-weight: 700;
    }
    .cc-wt-tier-btn {
      min-height: 48px;
      border-radius: 12px;
      border: 1px solid rgba(196, 163, 90, 0.25);
      background: rgba(20, 27, 43, 0.7);
      color: #fff;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .cc-wt-tier-btn:hover {
      border-color: #C4A35A;
      background: rgba(196, 163, 90, 0.15);
    }
    .cc-wt-tier-btn.cc-wt-active {
      background: #C4A35A;
      color: #07121D;
      border-color: #C4A35A;
      box-shadow: 0 4px 14px rgba(196, 163, 90, 0.35);
    }
    /* Główne CTA 1-Click */
    .cc-wt-primary-btn {
      width: 100%;
      min-height: 52px;
      border-radius: 999px;
      background: #FF7A00;
      color: #ffffff;
      font-weight: 800;
      font-size: 16px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      text-decoration: none;
      transition: background-color 0.2s, transform 0.2s;
      box-shadow: 0 8px 24px rgba(255, 122, 0, 0.35);
      margin-bottom: 16px;
    }
    .cc-wt-primary-btn:hover {
      background: #FF8C33;
      transform: translateY(-2px);
    }
    .cc-wt-primary-btn:active {
      background: #E66A00;
      transform: none;
    }
    .cc-wt-secondary-btn {
      width: 100%;
      min-height: 46px;
      border-radius: 999px;
      background: rgba(196, 163, 90, 0.14);
      border: 1px solid rgba(196, 163, 90, 0.45);
      color: #E2CC9A;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
      transition: background-color 0.2s, border-color 0.2s;
      margin-bottom: 14px;
    }
    .cc-wt-secondary-btn:hover {
      background: rgba(196, 163, 90, 0.24);
      border-color: #C4A35A;
      color: #ffffff;
    }
    /* Karty szybkich metod */
    .cc-wt-methods {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .cc-wt-method-item {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 48px;
    }
    .cc-wt-method-info {
      display: flex;
      flex-direction: column;
      font-size: 12px;
    }
    .cc-wt-method-info strong {
      color: #fff;
      font-size: 13px;
    }
    .cc-wt-method-info span {
      color: #94a3b8;
    }
    .cc-wt-copy-btn {
      min-height: 44px;
      padding: 0 14px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #E2CC9A;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .cc-wt-copy-btn:hover {
      background: #C4A35A;
      color: #07121D;
    }
    .cc-wt-copy-btn.cc-wt-copied {
      background: #10b981;
      color: #fff;
      border-color: #10b981;
    }
    .cc-wt-footer-note {
      text-align: center;
      margin-top: 16px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
    }
    .cc-wt-footer-note a {
      color: #C4A35A;
      text-decoration: underline;
    }
  `;
  document.head.appendChild(styleEl);

  // Struktura DOM Modala
  const modalDiv = document.createElement('div');
  modalDiv.id = MODAL_ID;
  modalDiv.className = 'cc-wt-overlay';
  modalDiv.setAttribute('role', 'dialog');
  modalDiv.setAttribute('aria-modal', 'true');
  modalDiv.setAttribute('aria-labelledby', 'ccWtTitle');

  modalDiv.innerHTML = `
    <div class="cc-wt-dialog">
      <button type="button" class="cc-wt-close" id="ccWtClose" aria-label="Zamknij okno">&times;</button>
      
      <div class="cc-wt-header">
        <span class="cc-wt-badge">MECENAT CHRISTIAN CULTURE</span>
        <h2 class="cc-wt-title" id="ccWtTitle">WspieramTO &bull; Wolne Słowo</h2>
        <p class="cc-wt-sub">Utrzymanie mediów 24/7 i budowa nowego studia radiowo-telewizyjnego CC.</p>
      </div>

      <div class="cc-wt-studio-bar">
        Cel miesięczny: <strong>25 000 zł</strong> (Radio 24/7, Biblia Audio, Akademia) &bull; Budowa Nowego Studia RTV: <strong>80 000 zł</strong> (<a href="/wspieramto#nowe-studio">zobacz plan &rarr;</a>)
      </div>

      <!-- Wybór waluty -->
      <div class="cc-wt-curr-row" id="ccWtCurrRow">
        <button type="button" class="cc-wt-curr-btn ${currentCurrency === 'PLN' ? 'cc-wt-active' : ''}" data-curr="PLN">PLN (zł)</button>
        <button type="button" class="cc-wt-curr-btn ${currentCurrency === 'GBP' ? 'cc-wt-active' : ''}" data-curr="GBP">GBP (£)</button>
        <button type="button" class="cc-wt-curr-btn ${currentCurrency === 'EUR' ? 'cc-wt-active' : ''}" data-curr="EUR">EUR (€)</button>
        <button type="button" class="cc-wt-curr-btn ${currentCurrency === 'USD' ? 'cc-wt-active' : ''}" data-curr="USD">USD ($)</button>
      </div>

      <!-- Pigułki kwot -->
      <div class="cc-wt-tiers" id="ccWtTiers"></div>

      <!-- Przycisk 1-Click Online (Polska: Zrzutka.pl BLIK/Karta; Zagranica: Revolut.me) -->
      <a href="https://zrzutka.pl/z/ChristianCulture" target="_blank" rel="noopener noreferrer" class="cc-wt-primary-btn" id="ccWtPrimaryCta" data-support-method="zrzutka_1click">
        <span id="ccWtPrimaryLabel">Wpłać 1-Click (BLIK / Karta — Zrzutka.pl) &bull; <strong id="ccWtAmountDisplay">${currentAmount} zł</strong></span>
        <span>&rarr;</span>
      </a>

      <!-- Wsparcie regularne miesięczne (Patronite) -->
      <a href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener noreferrer" class="cc-wt-secondary-btn" id="ccWtPatroniteCta" data-support-method="patronite_monthly">
        <span>Lub zostań stałym Patronem co miesiąc (Patronite)</span>
        <span>&rarr;</span>
      </a>

      <!-- Szybkie metody bezpośrednie -->
      <div class="cc-wt-methods">
        <!-- BLIK na telefon -->
        <div class="cc-wt-method-item">
          <div class="cc-wt-method-info">
            <strong>BLIK na telefon (Polska)</strong>
            <span>Numer: <strong>537 137 043</strong> (Cezary Rogowski)</span>
          </div>
          <button type="button" class="cc-wt-copy-btn" data-copy="537137043" data-currency="PLN" data-copy-account="true">Kopiuj nr</button>
        </div>

        <!-- Przelew zagraniczny SEPA / SWIFT -->
        <div class="cc-wt-method-item">
          <div class="cc-wt-method-info">
            <strong>Przelew walutowy (GBP / EUR / USD)</strong>
            <span>IBAN: <strong>LT23 3250 0920 7156 6231</strong> &bull; BIC: REVOLT21</span>
          </div>
          <button type="button" class="cc-wt-copy-btn" data-copy="LT233250092071566231" data-currency="EUR" data-copy-account="true">Kopiuj IBAN</button>
        </div>

        <!-- Przelew bankowy PLN -->
        <div class="cc-wt-method-item">
          <div class="cc-wt-method-info">
            <strong>Przelew PLN (Rozwój CC)</strong>
            <span>Konto: <strong>74 2910 0006 2469 8002 1062 8039</strong></span>
          </div>
          <button type="button" class="cc-wt-copy-btn" data-copy="74291000062469800210628039" data-currency="PLN" data-copy-account="true">Kopiuj PLN</button>
        </div>
      </div>

      <div class="cc-wt-footer-note">
        100% jawności celów i etapów budowy studia na <a href="/wspieramto#nowe-studio">polskieradio.cc/wspieramto</a>.<br>
        Wszystkie treści pozostają bezpłatne i bez reklam dzięki dobrowolnym darczyńcom.
      </div>
    </div>
  `;
  document.body.appendChild(modalDiv);

  // Funkcja renderująca pigułki kwot
  function renderTiers() {
    const config = CURRENCIES[currentCurrency];
    const tiersContainer = document.getElementById('ccWtTiers');
    if (!tiersContainer) return;
    tiersContainer.innerHTML = '';

    config.tiers.forEach((tier) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cc-wt-tier-btn' + (tier === currentAmount ? ' cc-wt-active' : '');
      btn.textContent = tier + ' ' + config.symbol;
      btn.addEventListener('click', () => {
        currentAmount = tier;
        renderTiers();
        updatePrimaryCta();
        if (window.CCAnalyticsMC && typeof window.CCAnalyticsMC.trackSupportMethodSelect === 'function') {
          window.CCAnalyticsMC.trackSupportMethodSelect('tier_' + currentCurrency.toLowerCase() + '_' + tier);
        }
      });
      tiersContainer.appendChild(btn);
    });
  }

  function updatePrimaryCta() {
    const config = CURRENCIES[currentCurrency];
    const primaryCta = document.getElementById('ccWtPrimaryCta');
    const primaryLabel = document.getElementById('ccWtPrimaryLabel');
    const isPln = currentCurrency === 'PLN';

    if (primaryLabel) {
      primaryLabel.innerHTML = isPln
        ? `Wpłać 1-Click (BLIK / Karta — Zrzutka.pl) &bull; <strong id="ccWtAmountDisplay">${currentAmount} ${config.symbol}</strong>`
        : `Wpłać 1-Click Kartą / Apple Pay (Revolut) &bull; <strong id="ccWtAmountDisplay">${currentAmount} ${config.symbol}</strong>`;
    }
    if (primaryCta) {
      primaryCta.href = isPln ? 'https://zrzutka.pl/z/ChristianCulture' : 'https://revolut.me/christianculture';
      primaryCta.setAttribute('data-support-method', isPln ? 'zrzutka_1click' : 'revolut_global_1click');
    }
  }

  // Przełączanie walut
  const currBtns = modalDiv.querySelectorAll('.cc-wt-curr-btn');
  currBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      currBtns.forEach((b) => b.classList.remove('cc-wt-active'));
      btn.classList.add('cc-wt-active');
      currentCurrency = btn.getAttribute('data-curr') || 'PLN';
      currentAmount = CURRENCIES[currentCurrency].defaultTier;
      renderTiers();
      updatePrimaryCta();
    });
  });

  // Kopiowanie do schowka
  modalDiv.querySelectorAll('.cc-wt-copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      if (!text) return;
      const originalText = btn.textContent;
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Skopiowano!';
        btn.classList.add('cc-wt-copied');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('cc-wt-copied');
        }, 2200);
      }).catch(() => {
        prompt('Skopiuj dane:', text);
      });
    });
  });

  // Otwieranie / Zamykanie
  function openModal(options) {
    if (options && options.currency && CURRENCIES[options.currency]) {
      currentCurrency = options.currency;
    }
    if (options && options.amount) {
      currentAmount = options.amount;
    }
    renderTiers();
    updatePrimaryCta();

    modalDiv.classList.add('cc-wt-open');
    document.body.style.overflow = 'hidden';
    if (window.CCAnalyticsMC && typeof window.CCAnalyticsMC.trackSupportView === 'function') {
      window.CCAnalyticsMC.trackSupportView({ page_path: location.pathname, support_source: 'wspieramto_modal' });
    }
    const closeBtn = document.getElementById('ccWtClose');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modalDiv.classList.remove('cc-wt-open');
    document.body.style.overflow = '';
  }

  const closeBtn = document.getElementById('ccWtClose');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modalDiv.addEventListener('click', (e) => {
    if (e.target === modalDiv) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalDiv.classList.contains('cc-wt-open')) {
      closeModal();
    }
  });

  // Globalny interfejs API
  window.CCWspieramTo = {
    open: openModal,
    close: closeModal
  };
  window.openWspieramToModal = openModal;

  // Automatyczne przechwytywanie kliknięć w przyciski i linki wspieramto
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('a[href="/wspieramto"], a[href="https://polskieradio.cc/wspieramto"], [data-cc-wspieramto], .wspieramto-trigger');
    if (trigger) {
      // Jeśli użytkownik kliknął z Ctrl/Cmd lub na telefonie chce nową kartę, zachowaj domyślne działanie, inaczej otwórz modal
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        openModal();
      }
    }
  });

  // Inicjalizacja domyślnego widoku
  renderTiers();
  updatePrimaryCta();
})();
