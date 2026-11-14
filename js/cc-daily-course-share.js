/* Public lesson links. No SDK loading, tracking or automatic sends. */
(function () {
  'use strict';
  function ensureSubscriptionScript() {
    if (window.CC_DAILY_COURSE_SUBSCRIPTIONS_ENABLED === false) return;
    if (document.querySelector('script[src*="cc-daily-course-subscription"]')) return;
    const subscription = document.createElement('script');
    subscription.src = '/js/cc-daily-course-subscription.js?v=20261009_coursekv2';
    document.head.appendChild(subscription);
  }
  const hasStaticShare = Boolean(document.getElementById('ccDailyShare'));
  const day = location.pathname.match(/\/dzien-(\d+)/);
  const url = day ? 'https://polskieradio.cc/akademia/kurscodzienny/dzien-' + day[1]
    : 'https://polskieradio.cc/akademia#kurscodzienny';
  const title = day ? document.title : 'Z Biblią za Pan Brat — Kurs Codzienny';
  const message = title + '\n' + url;
  const ogImgEl = document.querySelector('meta[property="og:image"]');
  const imageUrl = (ogImgEl && ogImgEl.content) ? ogImgEl.content : (day ? ('https://polskieradio.cc/images/academy/daily/kc_day_' + day[1].padStart(2, '0') + '.jpg') : 'https://polskieradio.cc/images/academy/z_biblia_za_pan_brat_hero.jpg');
  if (!document.getElementById('ccDailyShareStyle')) {
    const style = document.createElement('style');
    style.id = 'ccDailyShareStyle';
  style.textContent = '.cc-daily-share{margin:24px 0;padding:20px;border:1px solid #806120;border-radius:20px;background:#0e121a;color:#f4f4f5;font:14px/1.5 Inter,system-ui,sans-serif}.cc-daily-share h2{font-size:20px;margin:0 0 8px;color:#e2cc9a}.cc-daily-share p{margin:8px 0}.cc-daily-share-actions{display:flex;flex-wrap:wrap;gap:8px}.cc-daily-share-actions a,.cc-daily-share-actions button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:44px;padding:10px 14px;box-sizing:border-box;border:1px solid #806120;border-radius:12px;background:#161b26;color:#f4f4f5;font:inherit;text-decoration:none;cursor:pointer;max-width:100%;overflow-wrap:anywhere}.cc-daily-share-actions :focus-visible{outline:3px solid #e2cc9a;outline-offset:3px}.cc-daily-share-actions :hover{background:#29231c}.cc-daily-share input{box-sizing:border-box;width:100%;min-height:44px;background:#161b26;color:#fff;border:1px solid #806120;border-radius:8px;padding:8px}.cc-daily-share [hidden]{display:none!important}html[data-lumina-theme="light"] .cc-daily-share{background:#fff!important;border-color:rgba(184,142,62,0.35)!important;color:#27221e!important;box-shadow:0 6px 24px rgba(28,25,23,0.04)!important}html[data-lumina-theme="light"] .cc-daily-share h2{color:#8c6d23!important}html[data-lumina-theme="light"] .cc-daily-share-actions a,html[data-lumina-theme="light"] .cc-daily-share-actions button{background:#faf8f5!important;border-color:rgba(184,142,62,0.4)!important;color:#27221e!important}html[data-lumina-theme="light"] .cc-daily-share-actions :hover{background:#f3ece0!important}html[data-lumina-theme="light"] .cc-daily-share input{background:#faf8f5!important;color:#1c1917!important;border-color:rgba(184,142,62,0.35)!important}html[data-lumina-theme="light"] .cc-daily-share-actions a[aria-label="Tablica LUMINA"] img{content:url(/images/lumina/lumina-icon-light-transparent.png)!important}.ak-header #reader-font-label,.ak-header #tts-btn-text,.ak-header .theme-toggle-label,.ak-header #ccTopSubLink .sr-only,.ak-header #ccTopSubLink span:not(:first-child),.ak-header a[href*="patronite"] .sr-only,.ak-header a[href*="patronite"] span:not(:first-child){display:none!important}.ak-header .kc-reader-pill,.ak-header #btn-audio-tts,.ak-header #btn-theme-toggle,.ak-header #ccTopSubLink,.ak-header a[href*="patronite"]{width:38px!important;height:38px!important;min-width:38px!important;min-height:38px!important;padding:0!important;justify-content:center!important;align-items:center!important;display:inline-flex!important;border-radius:9999px!important;box-sizing:border-box!important}@media(max-width:768px){.ak-header .ak-header-slash,.ak-header .ak-header-course-title,.ak-header .ak-header-brand-sub{display:none!important}.ak-header .max-w-6xl,.ak-header .max-w-7xl{padding-left:12px!important;padding-right:12px!important}}@media(min-width:769px){.ak-header .ak-header-course-title{max-width:none!important;text-overflow:clip!important;white-space:nowrap!important}}.back-to-top{position:fixed;bottom:2rem;right:1.5rem;width:44px;height:44px;min-width:44px;min-height:44px;border-radius:50%;background:rgba(17,16,14,0.92);border:1.5px solid #c4a35a;color:#c4a35a;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.1rem;z-index:998;box-shadow:0 4px 18px rgba(0,0,0,0.65),0 0 10px rgba(196,163,90,0.15);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:0;visibility:hidden;transform:translateY(14px);transition:opacity .3s cubic-bezier(.16,1,.3,1),visibility .3s cubic-bezier(.16,1,.3,1),transform .3s cubic-bezier(.16,1,.3,1),background .2s ease,color .2s ease,border-color .2s ease,box-shadow .2s ease;outline:none;-webkit-tap-highlight-color:transparent}.back-to-top.visible{opacity:1;visibility:visible;transform:translateY(0)}.back-to-top:hover{background:#c4a35a;color:#0b0d13;transform:translateY(-3px);box-shadow:0 8px 25px rgba(196,163,90,0.45)}.back-to-top:active{transform:translateY(0) scale(0.95)}.back-to-top:focus-visible{outline:3px solid #e2cc9a;outline-offset:3px}@media(max-width:768px){.back-to-top{right:1.25rem;bottom:max(1.25rem,env(safe-area-inset-bottom,20px));width:44px;height:44px;font-size:1.1rem}}html[data-lumina-theme="light"] .back-to-top{background:rgba(255,255,255,0.95)!important;border-color:rgba(184,142,62,0.65)!important;color:#8c6d23!important;box-shadow:0 4px 18px rgba(28,25,23,0.1),0 0 10px rgba(184,142,62,0.1)!important}html[data-lumina-theme="light"] .back-to-top:hover{background:#c4a35a!important;color:#ffffff!important;box-shadow:0 8px 25px rgba(184,142,62,0.4)!important}.kc-jump-to-share-wrap{margin-bottom:14px;display:flex;align-items:center}.kc-jump-to-share{display:inline-flex;align-items:center;gap:8px;min-height:44px;min-width:44px;padding:8px 18px;box-sizing:border-box;border-radius:9999px;background:rgba(22,27,38,0.92);border:1px solid rgba(196,163,90,0.45);color:#e2cc9a;font:600 12px/1.4 Inter,system-ui,sans-serif;text-decoration:none;cursor:pointer;transition:all .2s ease;box-shadow:0 4px 14px rgba(0,0,0,0.4)}.kc-jump-to-share:hover{background:rgba(41,35,28,0.95);border-color:#c4a35a;color:#fff;transform:translateY(1px);box-shadow:0 6px 18px rgba(196,163,90,0.25)}.kc-jump-to-share:focus-visible{outline:3px solid #e2cc9a;outline-offset:3px}html[data-lumina-theme="light"] .kc-jump-to-share{background:#fff!important;border-color:rgba(184,142,62,0.45)!important;color:#8c6d23!important;box-shadow:0 4px 14px rgba(28,25,23,0.06)!important}html[data-lumina-theme="light"] .kc-jump-to-share:hover{background:#fdfaf3!important;border-color:#b88e3e!important;color:#6b5216!important}';
    document.head.appendChild(style);
  }
  if (hasStaticShare) {
    ensureSubscriptionScript();
    return;
  }
  const panel = document.createElement('section');
  panel.id = 'ccDailyShare';
  panel.className = 'cc-daily-share';
  panel.setAttribute('aria-label', day ? 'Udostępnij lekcję' : 'Udostępnij kurs');
  panel.innerHTML = '<h2></h2><p>Wybierz, komu i gdzie chcesz przekazać link. Udostępnianie nie wymaga konta LUMINA.</p><div class="cc-daily-share-actions"></div><p role="status" aria-live="polite"></p><label hidden>Link do ręcznego skopiowania<input readonly aria-label="Link do skopiowania"></label>';
  panel.querySelector('h2').textContent = day ? 'Podziel się tą lekcją' : 'Zaproś do codziennego kursu';
  const actions = panel.querySelector('.cc-daily-share-actions');
  const status = panel.querySelector('[role="status"]');
  const icons = {'Tablica LUMINA':'L','WhatsApp':'fa-brands fa-whatsapp','Facebook':'fa-brands fa-facebook-f','Telegram':'fa-brands fa-telegram','X':'fa-brands fa-x-twitter','E-mail':'fa-regular fa-envelope','Kopiuj link':'fa-solid fa-link','Więcej aplikacji…':'fa-solid fa-share-nodes'};
  function icon(control, label) {
    control.setAttribute('aria-label', label);
    control.title = label;
    control.style.cssText = 'width:44px;height:44px;padding:0;font-size:20px';
    if (label === 'Tablica LUMINA' || icons[label] === 'L') {
      const isLight = document.documentElement && document.documentElement.getAttribute('data-lumina-theme') === 'light';
      const img = document.createElement('img');
      img.src = isLight ? '/images/lumina/lumina-icon-light-transparent.png' : '/images/lumina/lumina-icon-transparent.png';
      img.alt = 'LUMINA';
      img.width = 24;
      img.height = 24;
      img.setAttribute('aria-hidden', 'true');
      img.style.cssText = 'width:24px;height:24px;object-fit:contain;display:block;margin:auto;pointer-events:none;';
      control.appendChild(img);
      return;
    }
    const glyph = document.createElement('i');
    glyph.setAttribute('aria-hidden', 'true');
    glyph.className = icons[label];
    control.appendChild(glyph);
  }
  function link(label, href, external) {
    const a = document.createElement('a');
    icon(a, label);
    a.href = href;
    if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    actions.appendChild(a);
  }
  const enc = encodeURIComponent;
  const tablicaParams = { share_title: title, share_text: message, share_url: url };
  if (imageUrl) {
    tablicaParams.share_image = imageUrl;
    tablicaParams.img = imageUrl;
  }
  if (day) {
    tablicaParams.share = 'dzien-' + day[1];
  }
  link('Tablica LUMINA', '/tablica?' + new URLSearchParams(tablicaParams), false);
  link('WhatsApp', 'https://wa.me/?text=' + enc(message), true);
  link('Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url), true);
  link('Telegram', 'https://t.me/share/url?url=' + enc(url) + '&text=' + enc(title), true);
  link('X', 'https://x.com/intent/tweet?url=' + enc(url) + '&text=' + enc(title), true);
  link('E-mail', 'mailto:?subject=' + enc(title) + '&body=' + enc(message), false);
  function button(label, action) {
    const b = document.createElement('button'); b.type = 'button'; icon(b, label);
    b.addEventListener('click', action); actions.appendChild(b);
  }
  function manualCopy() {
    const field = panel.querySelector('input'); field.value = url;
    field.parentElement.hidden = false; field.focus(); field.select();
    status.textContent = 'Nie można skopiować automatycznie. Skopiuj zaznaczony link.';
  }
  button('Kopiuj link', async function () {
    try {
      if (!navigator.clipboard) { manualCopy(); return; }
      await navigator.clipboard.writeText(url);
      status.textContent = 'Link skopiowany.';
    } catch (_) { manualCopy(); }
  });
  if (typeof navigator.share === 'function') button('Więcej aplikacji…', async function () {
    try { await navigator.share({title: title, url: url}); status.textContent = 'Zakończono udostępnianie systemowe.'; }
    catch (error) { if (error.name !== 'AbortError') status.textContent = 'Udostępnianie systemowe jest niedostępne. Wybierz inną opcję lub skopiuj link.'; }
  });
  const old = day && document.querySelector('a[href*="tablica?share="]');
  if (old && old.closest('section')) old.closest('section').replaceWith(panel);
  else {
    const host = document.getElementById('course-view-kurscodzienny') || document.querySelector('main');
    if (host) host.appendChild(panel);
  }
  const invitation = document.createElement('section');
  invitation.id = 'ccDailyAccountInvitation';
  invitation.className = 'cc-daily-share';
  invitation.setAttribute('aria-label','Bezpłatne konto Christian Culture');
  invitation.innerHTML = '<h2>Więcej możliwości — bezpłatnie</h2><p>Zaloguj się, by bezpłatnie korzystać z większej liczby możliwości i dołączyć do społeczności LUMINA.</p><div class="cc-daily-share-actions"><a href="/lumina-login">Zaloguj się — korzystaj bezpłatnie</a></div><p>Czytanie i udostępnianie lekcji pozostaje dostępne bez konta.</p>';
  panel.insertAdjacentElement('afterend',invitation);
  function updateInvitation() {
    // UI events are only a refresh signal, never proof of authentication.
    const user = window.firebaseAuth?.currentUser;
    invitation.hidden = !!user && user.isAnonymous === false;
  }
  updateInvitation();
  window.addEventListener('lumina-auth-state',updateInvitation);
  // Backend release approved: expose enrollment on all lessons (can be suppressed with false).
  ensureSubscriptionScript();

  // Floating Back to Top Button (Standard dla wszystkich lekcji i kursów)
  function initBackToTop() {
    function setup() {
      if (!document.body) return;
      var btn = document.getElementById('backToTopBtn');
      if (!btn) {
        btn = document.createElement('button');
        btn.id = 'backToTopBtn';
        btn.className = 'back-to-top';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Przewiń do góry');
        btn.title = 'Przewiń do góry';
        btn.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
        document.body.appendChild(btn);
      } else {
        if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', 'Przewiń do góry');
        if (!btn.title) btn.title = 'Przewiń do góry';
        if (!btn.firstElementChild) {
          btn.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
        }
      }
      if (btn._scrollBound) return;
      btn._scrollBound = true;

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof window.scrollTo === 'function') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          document.documentElement.scrollTop = 0;
          if (document.body) document.body.scrollTop = 0;
        }
      });

      function onScroll() {
        var scrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
        if (scrollY > 300) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }
  initBackToTop();

  // Przycisk skoku do sekcji "Podziel się tą lekcją" (Standard dla wszystkich lekcji obecnych i przyszłych)
  function initJumpToShare() {
    function setupJump() {
      if (!day) return;
      var jumpBtn = document.getElementById('kcJumpShareBtn');
      if (!jumpBtn) {
        var titleEl = document.querySelector('h1');
        if (titleEl) {
          var wrap = document.createElement('div');
          wrap.className = 'kc-jump-to-share-wrap mb-3';
          wrap.innerHTML = '<a href="#ccDailyShare" id="kcJumpShareBtn" class="kc-jump-to-share" title="Przejdź do sekcji: Podziel się tą lekcją" aria-label="Przejdź do sekcji Podziel się tą lekcją"><i class="fa-solid fa-share-nodes" aria-hidden="true" style="color:#c4a35a;font-size:12px"></i><span>Podziel się tą lekcją</span><i class="fa-solid fa-arrow-down" aria-hidden="true" style="color:#c4a35a;font-size:12px"></i></a>';
          titleEl.parentNode.insertBefore(wrap, titleEl);
          jumpBtn = wrap.querySelector('a');
        }
      }
      if (jumpBtn && !jumpBtn.dataset.bound) {
        jumpBtn.dataset.bound = 'true';
        jumpBtn.addEventListener('click', function (e) {
          e.preventDefault();
          var shareSection = document.getElementById('ccDailyShare') || document.querySelector('.cc-daily-share');
          if (shareSection) {
            shareSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            try { history.pushState(null, '', '#ccDailyShare'); } catch (_) {}
          }
        });
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupJump);
    } else {
      setupJump();
    }
  }
  initJumpToShare();
  // Course theme controller (Light & Dark Mode)
  if (!document.getElementById('ccCourseThemeScript') && !window.CCCourseTheme) {
    const themeScript = document.createElement('script');
    themeScript.id = 'ccCourseThemeScript';
    themeScript.src = '/js/cc-course-theme.js?v=20261008_desktop_icons_v2';
    document.head.appendChild(themeScript);
  }
  // Universal Multilingual TTS Reader (JOMA-D052 Orange #FF7A00 Button)
  if (!document.getElementById('ccUniversalTtsScript') && !window.CCUniversalTTS) {
    const ttsScript = document.createElement('script');
    ttsScript.id = 'ccUniversalTtsScript';
    ttsScript.src = '/js/cc-universal-tts.js?v=20261029_1';
    document.head.appendChild(ttsScript);
  }
})();

/* Kanał WhatsApp „Biblijna Akademia” (L0 2026-11-08). Osobny blok: działa także na lekcjach,
   które mają panel #ccDailyShare wpisany w HTML (wtedy blok powyżej kończy się wcześniej). */
(function () {
  'use strict';
  var CHANNEL = 'https://whatsapp.com/channel/0029VbE8sXK6xCSOTjPi7o2P';
  if (!/kurscodzienny/.test(location.pathname)) return;
  function mount() {
    if (document.getElementById('ccWaChannel')) return;
    var css = document.createElement('style');
    css.textContent = '.cc-wa-channel{margin:24px 0;padding:20px;border:1px solid #FF7A00;border-radius:20px;background:#0e121a;color:#f4f4f5;font:14px/1.5 Inter,system-ui,sans-serif;text-align:center}.cc-wa-channel h2{font-size:20px;margin:0 0 8px;color:#FF8C33}.cc-wa-channel p{margin:8px auto;max-width:36rem;color:#d4d4d8}.cc-wa-channel a{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:48px;padding:12px 22px;box-sizing:border-box;border-radius:9999px;background:#FF7A00;color:#111;font-weight:700;text-decoration:none;max-width:100%}.cc-wa-channel a:hover{background:#FF8C33}.cc-wa-channel a:active{background:#E66A00}.cc-wa-channel a:focus-visible{outline:3px solid #FF8C33;outline-offset:3px}html[data-lumina-theme="light"] .cc-wa-channel{background:#fff!important;color:#27221e!important}html[data-lumina-theme="light"] .cc-wa-channel h2{color:#B35500!important}html[data-lumina-theme="light"] .cc-wa-channel p{color:#44403c!important}';
    document.head.appendChild(css);
    var box = document.createElement('section');
    box.id = 'ccWaChannel';
    box.className = 'cc-wa-channel';
    box.setAttribute('aria-label', 'Kanał WhatsApp Biblijna Akademia');
    box.innerHTML = '<h2>Nie przegap jutrzejszej lekcji</h2>'
      + '<p>Obserwuj kanał <strong>Biblijna Akademia</strong> na WhatsApp — nowa lekcja Kursu Codziennego przyjdzie do Ciebie sama.</p>'
      + '<a target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i><span>Obserwuj kanał na WhatsApp</span></a>'
      + '<p style="font-size:12px">Bez konta i bez zapisów. Administrator kanału nie widzi Twojego numeru.</p>';
    var a = box.querySelector('a');
    a.href = CHANNEL;
    a.addEventListener('click', function () {
      try { if (typeof window.gtag === 'function') window.gtag('event', 'select_content', { content_type: 'whatsapp_channel', item_id: 'biblijna-akademia' }); } catch (_) {}
    });
    var share = document.getElementById('ccDailyShare');
    if (share) share.insertAdjacentElement('afterend', box);
    else {
      var host = document.getElementById('course-view-kurscodzienny') || document.querySelector('main');
      if (host) host.appendChild(box);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
