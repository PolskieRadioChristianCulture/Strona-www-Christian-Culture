/* ARK OF FIRE — wizytówka, nawigacja oraz moduł konkursu świadectw PL/EN */
(() => {
  const lang = (document.documentElement.lang || 'pl').slice(0, 2) === 'en' ? 'en' : 'pl';
  try { localStorage.setItem('ekocc_locale', lang); } catch (e) {}

  document.querySelectorAll('[data-lang-switch]').forEach((link) => {
    link.addEventListener('click', () => {
      try { localStorage.setItem('ekocc_locale', link.getAttribute('hreflang')); } catch (e) {}
    });
  });

  // Zapasowy panel +
  const open = document.querySelector('[data-open-drawer]');
  const drawer = document.getElementById('drawer');
  const close = document.querySelector('[data-close-drawer]');
  if (open && drawer && close) {
    const setDrawer = (visible) => {
      drawer.hidden = !visible;
      open.setAttribute('aria-expanded', String(visible));
      if (visible) close.focus();
      else if (open.isConnected) open.focus();
    };
    open.addEventListener('click', () => setDrawer(true));
    close.addEventListener('click', () => setDrawer(false));
    drawer.addEventListener('click', (e) => { if (e.target === drawer) setDrawer(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !drawer.hidden) setDrawer(false); });
  }

  // Modal Regulaminu i Prywatności
  const rulesModal = document.getElementById('contest-rules-modal');
  const rulesCloseBtn = document.getElementById('contest-modal-close');
  let lastTriggerEl = null;

  const openRulesModal = (trigger, tab = 'rules') => {
    if (!rulesModal) return;
    lastTriggerEl = trigger || document.activeElement;
    rulesModal.hidden = false;
    if (tab === 'privacy') {
      const privHeading = document.getElementById('contest-privacy-heading');
      if (privHeading) privHeading.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
    if (rulesCloseBtn) rulesCloseBtn.focus();
  };

  const closeRulesModal = () => {
    if (!rulesModal || rulesModal.hidden) return;
    rulesModal.hidden = true;
    if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
      lastTriggerEl.focus();
    }
  };

  document.querySelectorAll('[data-open-contest-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openRulesModal(btn, btn.getAttribute('data-open-contest-modal') || 'rules');
    });
  });

  if (rulesCloseBtn) rulesCloseBtn.addEventListener('click', closeRulesModal);
  if (rulesModal) {
    rulesModal.addEventListener('click', (e) => { if (e.target === rulesModal) closeRulesModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !rulesModal.hidden) closeRulesModal(); });
  }

  // Formularz konkursowy PL / EN
  const form = document.getElementById('ark-contest-form');
  if (!form) return;

  const nameInput = document.getElementById('contest-name');
  const emailInput = document.getElementById('contest-email');
  const answerInput = document.getElementById('contest-answer');
  const rulesCheck = document.getElementById('contest-accept-rules');
  const privacyCheck = document.getElementById('contest-accept-privacy');
  const submitBtn = document.getElementById('contest-submit-btn');
  const charRow = document.getElementById('contest-char-row');
  const charCountEl = document.getElementById('contest-char-count');
  const charHintEl = document.getElementById('contest-char-hint');
  const banner = document.getElementById('contest-status-banner');
  const honeypotInput = document.getElementById('contest-website');

  const COPY = lang === 'en'
    ? {
        minCharsHint: (len) => len < 40 ? `Minimum 40 characters (${40 - len} more needed)` : 'Length OK',
        errName: 'Please enter your name or nickname (at least 2 characters).',
        errEmail: 'Please enter a valid email address.',
        errAnswer: 'Your answer must be between 40 and 2000 characters.',
        errRules: 'Please accept the contest rules.',
        errPrivacy: 'Please confirm that you have read the privacy notice.',
        sending: 'Submitting...',
        submitLabel: 'Enter the contest',
        successFallback: 'Thank you! Your entry has been received. May your testimony encourage others in their faith.',
        errNetwork: 'A connection error occurred. Please try again in a moment.',
        closedMsg: 'Thank you for all the testimonies submitted. Ark of Fire is now reviewing the entries and will select the winner.',
        winnerMsg: 'The winner has been selected. Christian Culture has contacted the winner by email.',
        scheduledMsg: 'Entries will open soon. Thank you for your interest!',
      }
    : {
        minCharsHint: (len) => len < 40 ? `Minimum 40 znaków (brakuje ${40 - len})` : 'Długość prawidłowa',
        errName: 'Podaj swoje imię lub pseudonim (minimum 2 znaki).',
        errEmail: 'Podaj poprawny adres e-mail.',
        errAnswer: 'Twoja odpowiedź musi mieć od 40 do 2000 znaków.',
        errRules: 'Zaakceptuj regulamin konkursu.',
        errPrivacy: 'Potwierdź zapoznanie się z informacją o przetwarzaniu danych.',
        sending: 'Wysyłanie...',
        submitLabel: 'Weź udział w konkursie',
        successFallback: 'Dziękujemy! Twoje zgłoszenie zostało zapisane. Niech Twoje świadectwo będzie zachętą dla innych.',
        errNetwork: 'Wystąpił problem z połączeniem. Spróbuj ponownie za chwilę.',
        closedMsg: 'Dziękujemy za wszystkie nadesłane świadectwa. Ark of Fire zapoznaje się teraz ze zgłoszeniami i wybierze laureata.',
        winnerMsg: 'Laureat został wybrany. Christian Culture skontaktowało się ze zwycięzcą drogą e-mailową.',
        scheduledMsg: 'Przyjmowanie zgłoszeń wkrótce się rozpocznie. Zapraszamy!',
      };

  let csrfToken = '';

  const showBanner = (text, kind) => {
    if (!banner) return;
    banner.hidden = false;
    banner.className = `contest-status-banner is-${kind}`;
    banner.textContent = text;
  };

  const updateCharCounter = () => {
    if (!answerInput || !charCountEl || !charRow) return;
    const len = answerInput.value.trim().length;
    charCountEl.textContent = `${len} / 2000`;
    if (charHintEl) charHintEl.textContent = COPY.minCharsHint(len);
    charRow.classList.toggle('is-valid', len >= 40 && len <= 2000);
    charRow.classList.toggle('is-error', len > 2000);
  };

  if (answerInput) {
    answerInput.addEventListener('input', updateCharCounter);
    updateCharCounter();
  }

  const lockFormWithMessage = (msg) => {
    [nameInput, emailInput, answerInput, rulesCheck, privacyCheck, submitBtn].forEach((el) => {
      if (el) el.disabled = true;
    });
    showBanner(msg, 'info');
  };

  const loadContestStatus = async () => {
    try {
      const res = await fetch('/api/ark-contest/status', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.csrfToken) csrfToken = data.csrfToken;
        const st = data?.contest?.effectiveStatus || data?.contest?.status || 'open';
        if (st === 'winner_selected' || st === 'completed') {
          lockFormWithMessage(COPY.winnerMsg);
        } else if (st === 'closed' || st === 'judging') {
          lockFormWithMessage(COPY.closedMsg);
        } else if (st === 'scheduled' || st === 'draft') {
          lockFormWithMessage(COPY.scheduledMsg);
        }
      }
    } catch {
      // Pozostaw formularz gotowy, token zostanie pobrany przy próbie wysłania
    }
  };
  loadContestStatus();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (banner) banner.hidden = true;

    const name = (nameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const answer = (answerInput?.value || '').trim();
    const acceptRules = Boolean(rulesCheck?.checked);
    const acceptPrivacy = Boolean(privacyCheck?.checked);

    if (name.length < 2) {
      showBanner(COPY.errName, 'error');
      nameInput?.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showBanner(COPY.errEmail, 'error');
      emailInput?.focus();
      return;
    }
    if (answer.length < 40 || answer.length > 2000) {
      showBanner(COPY.errAnswer, 'error');
      answerInput?.focus();
      return;
    }
    if (!acceptRules) {
      showBanner(COPY.errRules, 'error');
      rulesCheck?.focus();
      return;
    }
    if (!acceptPrivacy) {
      showBanner(COPY.errPrivacy, 'error');
      privacyCheck?.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = COPY.sending;
    }

    try {
      if (!csrfToken) {
        const stRes = await fetch('/api/ark-contest/status', { cache: 'no-store' });
        if (stRes.ok) {
          const stData = await stRes.json();
          csrfToken = stData.csrfToken || '';
        }
      }

      const res = await fetch('/api/ark-contest/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: lang,
          name,
          email,
          answer,
          acceptRules,
          acceptPrivacy,
          website: honeypotInput ? honeypotInput.value : '',
          csrfToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        showBanner(data.message || COPY.successFallback, 'success');
        form.reset();
        updateCharCounter();
      } else {
        showBanner(data.message || COPY.errNetwork, 'error');
      }
    } catch {
      showBanner(COPY.errNetwork, 'error');
    } finally {
      if (submitBtn && !nameInput?.disabled) {
        submitBtn.disabled = false;
        submitBtn.textContent = COPY.submitLabel;
      }
    }
  });
})();
