/**
 * ══════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE — SUPPORT FOOTER COMPONENT
 * Plik: /components/cc-support-footer.js (or /js/cc-support-footer.js)
 * 
 * Elegancki moduł wsparcia misyjnego w kolorystyce Champagne Gold (#C4A35A).
 * Automatycznie renderuje się na stronach lub w kontenerze <cc-support-footer>.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // 1. Zabezpieczenie przed podwójną inicjalizacją
  if (window._ccSupportFooterInitialized) return;
  window._ccSupportFooterInitialized = true;

  // 2. Szablon HTML modułu wsparcia
  const FOOTER_HTML = `
<section class="cc-support-footer" aria-labelledby="cc-support-title">
  <div class="cc-support-footer__inner">

    <div class="cc-support-footer__heading">
      <span class="cc-support-footer__eyebrow">WESPRZYJ ROZWÓJ MISJI</span>

      <h3 id="cc-support-title">
        ROZWÓJ CHRISTIAN CULTURE
      </h3>

      <p class="cc-support-footer__subtitle">
        Studio • Radio • TV • Technologia
      </p>
    </div>

    <p class="cc-support-footer__text">
      Pomóż nam rozwijać nowoczesne zaplecze misyjne Christian Culture —
      studio nagraniowe, radio, telewizję internetową, produkcję audio i wideo,
      transmisje LIVE, aplikacje, automatyzację oraz narzędzia technologiczne
      służące głoszeniu Ewangelii.
    </p>

    <div class="cc-support-footer__account">

      <div class="cc-support-footer__row">
        <span>Waluta</span>
        <strong>PLN · Złoty polski</strong>
      </div>

      <div class="cc-support-footer__row">
        <span>Numer rachunku</span>

        <div class="cc-support-footer__copy">
          <strong id="ccSupportAccount">
            74 2910 0006 2469 8002 1062 8039
          </strong>

          <button
            type="button"
            class="cc-support-footer__copy-btn"
            onclick="copyCCSupportAccount(this)"
            aria-label="Kopiuj numer rachunku"
          >
            Kopiuj
          </button>
        </div>
      </div>

      <div class="cc-support-footer__row">
        <span>Tytuł przelewu</span>
        <strong>Rozwój Christian Culture</strong>
      </div>

    </div>

    <details class="cc-support-footer__details">
      <summary>Dane do przelewu</summary>

      <div class="cc-support-footer__details-content">

        <div>
          <span>Odbiorca rachunku</span>
          <strong>Cezary Rogowski</strong>
        </div>

        <div>
          <span>Nazwa banku</span>
          <strong>UniCredit NV/SA Oddział w Polsce</strong>
        </div>

        <div>
          <span>Adres banku</span>
          <strong>Dobra 40, 00-344 Warszawa, Poland</strong>
        </div>

      </div>
    </details>

    <p class="cc-support-footer__note">
      Twoje wsparcie pomaga rozwijać studio, radio, telewizję,
      produkcję multimedialną, aplikacje i infrastrukturę Christian Culture,
      dzięki którym treści misyjne mogą docierać do kolejnych osób
      w Polsce i na świecie.
    </p>

    <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid rgba(196, 163, 90, 0.18); font-size: 11px; line-height: 1.5; color: #94a3b8; text-align: center;">
      <p style="margin: 0 0 6px 0;">
        <strong style="color: #cbd5e1;">Nota Prawna & Misja:</strong> Christian Culture (polskieradio.cc) to niezależna, prywatna chrześcijańska inicjatywa misyjna i ewangelizacyjna, finansowana z dobrowolnych darowizn i prowadzona w duchu chrześcijańskiego wolontariatu.
      </p>
      <p style="margin: 0;">
        Projekt nie jest powiązany ani stowarzyszony z publicznym nadawcą <em>Polskie Radio S.A.</em> (polskieradio.pl). | <a href="/privacy" style="color: #C4A35A; text-decoration: underline;">Polityka Prywatności</a>
      </p>
    </div>

  </div>
</section>
  `.trim();

  // 3. Style CSS modułu w standardzie Champagne Gold & SMCC Ergonomia 44px
  const FOOTER_CSS = `
.cc-support-footer {
  --cc-gold: #C4A35A;
  --cc-gold-hover: #D4B578;
  --cc-gold-light: #E2CC9A;
  --cc-gold-dark: #A08040;

  width: 100%;
  padding: 34px 20px;
  color: #ffffff;
  box-sizing: border-box;

  background:
    radial-gradient(
      circle at 20% 0%,
      rgba(196, 163, 90, 0.14),
      transparent 34%
    ),
    linear-gradient(
      180deg,
      #0d0e11 0%,
      #08090b 100%
    );

  border-top: 1px solid rgba(196, 163, 90, 0.22);
  position: relative;
  z-index: 10;
  font-family: inherit;
}

.cc-support-footer * {
  box-sizing: border-box;
}

.cc-support-footer__inner {
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
}

.cc-support-footer__heading {
  margin-bottom: 18px;
}

.cc-support-footer__eyebrow {
  display: block;
  margin-bottom: 7px;

  color: var(--cc-gold-light);

  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.cc-support-footer h3 {
  margin: 0;

  font-size: clamp(23px, 4vw, 32px);
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.02em;

  background: linear-gradient(
    90deg,
    var(--cc-gold-light),
    var(--cc-gold),
    var(--cc-gold-hover)
  );

  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cc-support-footer__subtitle {
  margin: 7px 0 0;

  color: rgba(255, 255, 255, 0.72);

  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.cc-support-footer__text {
  max-width: 760px;
  margin: 0 0 22px;

  color: rgba(255, 255, 255, 0.72);

  font-size: 14px;
  line-height: 1.65;
}

.cc-support-footer__account {
  overflow: hidden;

  border: 1px solid rgba(196, 163, 90, 0.2);
  border-radius: 18px;

  background: rgba(255, 255, 255, 0.035);

  box-shadow:
    0 14px 40px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.025);

  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.cc-support-footer__row {
  display: grid;
  grid-template-columns: 155px minmax(0, 1fr);
  gap: 16px;

  align-items: center;

  padding: 14px 16px;

  border-bottom: 1px solid rgba(255, 255, 255, 0.055);

  font-size: 13px;
}

.cc-support-footer__row:last-child {
  border-bottom: 0;
}

.cc-support-footer__row > span {
  color: rgba(255, 255, 255, 0.45);
}

.cc-support-footer__row strong {
  color: rgba(255, 255, 255, 0.94);
  font-weight: 600;
}

.cc-support-footer__copy {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;
}

#ccSupportAccount {
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;

  letter-spacing: 0.025em;
}

.cc-support-footer__copy-btn {
  flex: 0 0 auto;

  appearance: none;

  border: 1px solid rgba(196, 163, 90, 0.38);
  border-radius: 10px;

  padding: 8px 16px;

  background: rgba(196, 163, 90, 0.08);

  color: var(--cc-gold-light);

  font: inherit;
  font-size: 12px;
  font-weight: 700;

  min-height: 44px;
  min-width: 44px;
  touch-action: manipulation;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease;
}

.cc-support-footer__copy-btn:hover {
  background: rgba(196, 163, 90, 0.16);
  border-color: var(--cc-gold-hover);
  transform: translateY(-1px);
}

.cc-support-footer__copy-btn.copied {
  background: rgba(34, 197, 94, 0.18) !important;
  border-color: #22c55e !important;
  color: #4ade80 !important;
}

.cc-support-footer__details {
  margin-top: 14px;

  border-radius: 14px;

  background: rgba(255, 255, 255, 0.018);

  border: 1px solid rgba(255, 255, 255, 0.06);
}

.cc-support-footer__details summary {
  padding: 12px 14px;

  color: rgba(255, 255, 255, 0.68);

  font-size: 12px;
  font-weight: 600;

  min-height: 44px;
  display: flex;
  align-items: center;
  touch-action: manipulation;

  cursor: pointer;
}

.cc-support-footer__details-content {
  display: grid;
  gap: 12px;

  padding: 0 14px 14px;
}

.cc-support-footer__details-content div {
  display: grid;
  grid-template-columns: 155px minmax(0, 1fr);
  gap: 16px;

  font-size: 12px;
}

.cc-support-footer__details-content span {
  color: rgba(255, 255, 255, 0.4);
}

.cc-support-footer__details-content strong {
  color: rgba(255, 255, 255, 0.82);
  font-weight: 500;
}

.cc-support-footer__note {
  margin: 15px 2px 0;

  color: rgba(255, 255, 255, 0.42);

  font-size: 11px;
  line-height: 1.55;
}

@media (max-width: 640px) {

  .cc-support-footer {
    padding: 28px 16px;
  }

  .cc-support-footer__row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .cc-support-footer__copy {
    align-items: center;
    flex-wrap: wrap;
  }

  #ccSupportAccount {
    font-size: 12px;
    word-break: break-word;
  }

  .cc-support-footer__details-content div {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
  `.trim();

  // 4. Funkcja kopiowania numeru rachunku do schowka
  window.copyCCSupportAccount = async function (button) {
    const accountNumber = '74291000062469800210628039';

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(accountNumber);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = accountNumber;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      const originalText = button.textContent;
      button.textContent = 'Skopiowano ✓';
      button.classList.add('copied');

      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
      }, 1800);

    } catch (error) {
      console.error('Nie udało się skopiować numeru rachunku:', error);
    }
  };

  // 5. Wstrzyknięcie stylów CSS (raz w całym dokumencie)
  function injectStyles() {
    if (!document.getElementById('cc-support-footer-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'cc-support-footer-styles';
      styleEl.textContent = FOOTER_CSS;
      document.head.appendChild(styleEl);
    }
  }

  // 6. Funkcja renderowania modułu w elemencie docelowym
  window.renderCCSupportFooter = function (targetElement) {
    if (!targetElement) return;
    injectStyles();
    targetElement.innerHTML = FOOTER_HTML;
    targetElement.setAttribute('data-cc-support-mounted', 'true');
  };

  // 7. Rejestracja Custom Element <cc-support-footer>
  if (typeof customElements !== 'undefined' && !customElements.get('cc-support-footer')) {
    customElements.define('cc-support-footer', class extends HTMLElement {
      connectedCallback() {
        window.renderCCSupportFooter(this);
      }
    });
  }

  // 8. Auto-Mount Engine — inteligentne wstawienie modułu nad stopkę
  function autoMountSupportFooter() {
    // Sprawdź czy strona nie jest kanałem transmisyjnym LIVE (Ochrona Kanałów LIVE)
    const p = (window.location.pathname || '').toLowerCase();
    if (p.includes('-live') || p.includes('stream-scene') || p.includes('cctv24-worship') || p.includes('pilot') || p.includes('smart-tv') || p.includes('skin') || p.includes('vibe') || p.includes('radiostyle') || p.includes('mojeradio')) {
      return;
    }

    injectStyles();

    // 1. Sprawdź czy istnieje jawnie wskazany kontener
    const explicitMount = document.querySelector('#cc-support-footer, [data-cc-support-footer], cc-support-footer');
    if (explicitMount) {
      if (!explicitMount.getAttribute('data-cc-support-mounted')) {
        window.renderCCSupportFooter(explicitMount);
      }
      return;
    }

    // 2. Jeśli nie ma jawnego kontenera, poszukaj głównej stopki strony
    if (document.querySelector('.cc-support-footer')) {
      return; // już jest na stronie
    }

    const candidateFooters = [
      'footer.site-footer',
      'footer#siteFooter',
      'footer.bg-\\[\\#05070c\\]',
      'footer.mb-footer',
      'footer.vod-footer',
      'footer.page-footer',
      'footer'
    ];

    let targetFooter = null;
    for (const sel of candidateFooters) {
      const el = document.querySelector(sel);
      if (el) {
        targetFooter = el;
        break;
      }
    }

    if (targetFooter && targetFooter.parentNode) {
      const container = document.createElement('div');
      container.id = 'cc-support-footer-auto';
      container.innerHTML = FOOTER_HTML;
      targetFooter.parentNode.insertBefore(container, targetFooter);
    }
  }

  // 9. Globalny pancerz klikalności logo CCN News (zarówno białe jak i czarne) -> ZAWSZE /news
  try {
    document.addEventListener('click', function (e) {
      const target = e.target && e.target.closest 
        ? e.target.closest('img[src*="ccn-logo"], img[src*="ccn_news"], .ccn-ticker-brand, [data-ccn-logo]')
        : null;
      if (target) {
        // Kliknięto w logotyp CCN News
        const a = target.closest('a');
        if (!a || a.getAttribute('href') !== '/news') {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = '/news';
        }
      }
    }, true); // useCapture = true, przechwytuje zdarzenie przed jakimkolwiek buttonem/stopPropagation
  } catch (err) {
    console.warn('CCN Logo click handler warning:', err);
  }

  // 10. Automatyczne załadowanie uniwersalnego komponentu CCGlobalChatButton (neonowy przycisk w szkle)
  try {
    if (!window.CCGlobalChatButton && !document.getElementById('ccGlobalChatScript') && !document.querySelector('script[src*="cc-global-chat-button"]')) {
      const chatScript = document.createElement('script');
      chatScript.id = 'ccGlobalChatScript';
      chatScript.src = '/components/cc-global-chat-button.js?v=20261114_premium_v11';
      chatScript.defer = true;
      document.head.appendChild(chatScript);
    }
  } catch (chatErr) {
    console.warn('CCGlobalChatButton load error:', chatErr);
  }

  // 11. Uruchomienie po załadowaniu drzewa DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMountSupportFooter);
  } else {
    autoMountSupportFooter();
  }

})();
