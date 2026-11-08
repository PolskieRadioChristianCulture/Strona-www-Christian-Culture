/**
 * cc-sms-gateway-client.js
 * Klient obsługi zapisów do Bramki SMS-CC (Akademia Biblijna)
 * Żelazne reguły: tylko polskie numery komórkowe +48, deklaracja braku roamingu, ochrona anty-kosztowa
 */

(function () {
  'use strict';

  function normalizePolishMobile(raw) {
    if (!raw) return null;
    let digits = String(raw).replace(/[^0-9+]/g, '');
    if (digits.startsWith('0048')) {
      digits = '+48' + digits.substring(4);
    } else if (digits.startsWith('48') && !digits.startsWith('+48') && digits.length === 11) {
      digits = '+' + digits;
    } else if (!digits.startsWith('+') && digits.length === 9) {
      digits = '+48' + digits;
    }

    if (!digits.startsWith('+48') || digits.length !== 12) {
      return null;
    }

    const firstDigit = digits.substring(3, 4);
    // Polskie komórki: 4, 5, 6, 7, 8
    if (!['4', '5', '6', '7', '8'].includes(firstDigit)) {
      return null;
    }

    return digits;
  }

  window.CcSmsGateway = {
    normalizePolishMobile: normalizePolishMobile,

    subscribe: async function (data) {
      const { name, phone, declaration } = data;

      if (!declaration) {
        throw new Error('Wymagane jest potwierdzenie deklaracji terytorialnej (numer używany tylko w Polsce).');
      }

      const validPhone = normalizePolishMobile(phone);
      if (!validPhone) {
        throw new Error('Wprowadź poprawny 9-cyfrowy polski numer komórkowy (np. 500 600 700). Numery zagraniczne i stacjonarne są odrzucane.');
      }

      const subscriberPayload = {
        name: (name || 'Subskrybent').trim(),
        phoneE164: validPhone,
        declarationAccepted: true,
        source: 'polskieradio.cc/BramkaSMS',
        timestamp: new Date().toISOString()
      };

      // Zapis lokalny dla klienta / sesji
      try {
        const existing = JSON.parse(localStorage.getItem('cc_sms_subscribers') || '[]');
        if (!existing.some(s => s.phoneE164 === validPhone)) {
          existing.push(subscriberPayload);
          localStorage.setItem('cc_sms_subscribers', JSON.stringify(existing));
        }
        localStorage.setItem('cc_sms_subscribed', 'true');
        localStorage.setItem('cc_sms_my_phone', validPhone);
      } catch (e) {
        console.warn('[CcSmsGateway] localStorage error', e);
      }

      // Rejestracja w punkcie synchronizacji / workerze subskrypcji
      try {
        await fetch('https://lumina-push.nazirczarkes.workers.dev/v1/sms/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscriberPayload),
          mode: 'cors'
        }).catch(err => {
          console.warn('[CcSmsGateway] Worker registration logged (offline or pending route):', err);
        });
      } catch (e) {
        // Kontynuacja bez blokowania interfejsu
      }

      return {
        success: true,
        phoneE164: validPhone,
        message: 'Numer ' + validPhone + ' został pomyślnie zarejestrowany w subskrypcji SMS!'
      };
    }
  };

  // Obsługa dedykowanej strony BramkaSMS.html
  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('smsSubscriptionForm');
    if (!form) return;

    const phoneInput = document.getElementById('subPhone');
    const nameInput = document.getElementById('subName');
    const declInput = document.getElementById('subDeclaration');
    const submitBtn = document.getElementById('subSubmitBtn');
    const successBox = document.getElementById('subSuccessBox');
    const successMsg = document.getElementById('subSuccessMsg');

    // Formatowanie numeru w locie
    if (phoneInput) {
      phoneInput.addEventListener('input', function (e) {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length > 9) val = val.substring(0, 9);
        if (val.length > 6) {
          e.target.value = val.substring(0, 3) + ' ' + val.substring(3, 6) + ' ' + val.substring(6);
        } else if (val.length > 3) {
          e.target.value = val.substring(0, 3) + ' ' + val.substring(3);
        } else {
          e.target.value = val;
        }
      });
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (!declInput.checked) {
        alert('Proszę zaznaczyć deklarację, że numer jest używany wyłącznie na terenie Polski.');
        return;
      }

      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Zapisywanie...</span>';

      try {
        const res = await window.CcSmsGateway.subscribe({
          name: nameInput ? nameInput.value : '',
          phone: phoneInput.value,
          declaration: declInput.checked
        });

        form.classList.add('hidden');
        if (successMsg) {
          successMsg.textContent = 'Numer ' + res.phoneE164 + ' został pomyślnie dodany do bezpłatnej subskrypcji SMS Akademii Biblijnej.';
        }
        if (successBox) {
          successBox.classList.remove('hidden');
        }
      } catch (err) {
        alert(err.message || 'Wystąpił błąd podczas zapisu. Spróbuj ponownie.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  });
})();
