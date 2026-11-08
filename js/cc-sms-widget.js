/**
 * cc-sms-widget.js
 * Pływający i osadzany widżet subskrypcji SMS dla stron Akademii Biblijnej
 * Spójny styl EkoCC, przycisk CTA w standardzie Pomarańczowym CC (#FF7A00)
 */

(function () {
  'use strict';

  function createWidgetModal() {
    if (document.getElementById('ccSmsModal')) return;

    const modalHtml = `
      <div id="ccSmsModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-200">
        <div class="bg-[#081426] border border-[#D4AF37]/40 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-left text-slate-200 shadow-black/80">
          <button id="ccSmsModalClose" class="absolute top-4 right-4 text-slate-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-lg" aria-label="Zamknij">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="flex items-center gap-3.5 mb-5">
            <div class="relative w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-lg shadow-amber-500/20 shrink-0">
              <img
                src="/images/academy/akademia_biblijna_logo_gold.webp"
                alt="Akademia Biblijna"
                class="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h3 class="font-serif font-bold text-white text-base leading-tight">Subskrypcja SMS Akademii</h3>
              <p class="text-[11px] text-[#D4AF37]">Codzienna lekcja Pisma Świętego na Twój telefon</p>
            </div>
          </div>

          <form id="ccSmsModalForm" class="space-y-4">
            <div>
              <label for="ccSmsWidgetPhone" class="block text-xs font-semibold uppercase tracking-wider text-amber-200/90 mb-1.5">
                Polski Numer Komórkowy <span class="text-[#D4AF37]">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-amber-400 font-mono text-sm font-semibold pointer-events-none">+48</span>
                <input
                  type="tel"
                  id="ccSmsWidgetPhone"
                  required
                  placeholder="500 600 700"
                  class="w-full bg-[#060E1A] border border-[#D4AF37]/30 rounded-xl py-2.5 pl-12 pr-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] min-h-[44px]"
                />
              </div>
            </div>

            <div class="p-3 rounded-xl bg-[#0C1B33]/80 border border-[#D4AF37]/25">
              <label class="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  id="ccSmsWidgetDecl"
                  required
                  class="mt-1 w-4 h-4 rounded border-[#D4AF37]/60 text-[#D4AF37] focus:ring-[#D4AF37] bg-black/40 min-w-[16px]"
                />
                <span class="text-[11px] text-slate-300 leading-snug">
                  Oświadczam, że mój numer jest używany <strong>wyłącznie na terytorium Polski</strong> (brak roamingu). Rezygnacja w każdej chwili słowem STOP.
                </span>
              </label>
            </div>

            <button
              type="submit"
              id="ccSmsWidgetSubmitBtn"
              class="w-full bg-[#FF7A00] hover:bg-[#FF8C33] active:bg-[#E66A00] text-white font-bold py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 min-h-[44px] text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 border border-amber-300/30"
            >
              <i class="fa-solid fa-paper-plane text-xs"></i>
              <span>Zapisz mój numer bezpłatnie</span>
            </button>
          </form>

          <div id="ccSmsModalSuccess" class="hidden text-center py-4 space-y-3">
            <div class="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl">
              <i class="fa-solid fa-check"></i>
            </div>
            <h4 class="font-serif font-bold text-white text-base">Zapisano pomyślnie!</h4>
            <p class="text-xs text-zinc-300" id="ccSmsModalSuccessMsg">Będziesz otrzymywać powiadomienia o nowych lekcjach.</p>
            <p class="text-[10px] text-zinc-500">Wypis w dowolnym momencie przez SMS o treści STOP na numer +48 783 478 280</p>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Pływający przycisk skrótu na stronach Akademii
    const floatBtnHtml = `
      <div id="ccSmsFloatWidget" class="fixed bottom-24 right-4 z-[90] flex items-center">
        <button
          id="ccSmsOpenModalBtn"
          type="button"
          aria-label="Subskrypcja SMS Akademii Biblijnej"
          class="bg-[#081426]/95 hover:bg-[#0C1B33] border border-[#D4AF37]/50 text-[#D4AF37] rounded-full px-4 py-2 shadow-2xl flex items-center gap-2.5 text-xs font-semibold transition transform hover:scale-105 min-h-[44px] shadow-black/80 backdrop-blur-md"
        >
          <img src="/images/academy/akademia_biblijna_logo_gold.webp" alt="Logo" class="w-5 h-5 rounded-full object-cover shrink-0 p-[1px] bg-[#D4AF37]/40" />
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-white hidden sm:inline">Subskrypcja SMS</span>
          <span class="text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/30">PL</span>
        </button>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', floatBtnHtml);

    // Logika modala
    const modal = document.getElementById('ccSmsModal');
    const openBtn = document.getElementById('ccSmsOpenModalBtn');
    const closeBtn = document.getElementById('ccSmsModalClose');
    const form = document.getElementById('ccSmsModalForm');
    const phoneInput = document.getElementById('ccSmsWidgetPhone');
    const declInput = document.getElementById('ccSmsWidgetDecl');
    const submitBtn = document.getElementById('ccSmsWidgetSubmitBtn');
    const successBox = document.getElementById('ccSmsModalSuccess');
    const successMsg = document.getElementById('ccSmsModalSuccessMsg');

    function openModal() {
      modal.classList.remove('opacity-0', 'pointer-events-none');
      if (phoneInput) phoneInput.focus();
    }

    function closeModal() {
      modal.classList.add('opacity-0', 'pointer-events-none');
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Delegacja do globalnych linków z atrybutem data-open-sms-sub
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-open-sms-sub]');
      if (trigger) {
        e.preventDefault();
        openModal();
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!declInput.checked) {
        alert('Proszę potwierdzić, że numer jest używany wyłącznie na terytorium Polski.');
        return;
      }

      const origText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Zapisywanie...</span>';

      try {
        const res = await window.CcSmsGateway.subscribe({
          name: '',
          phone: phoneInput.value,
          declaration: declInput.checked
        });

        form.classList.add('hidden');
        if (successMsg) {
          successMsg.textContent = 'Numer ' + res.phoneE164 + ' został zarejestrowany w subskrypcji SMS.';
        }
        successBox.classList.remove('hidden');
      } catch (err) {
        alert(err.message || 'Wystąpił błąd zapisu.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidgetModal);
  } else {
    createWidgetModal();
  }
})();
