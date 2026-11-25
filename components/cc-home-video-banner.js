/**
 * ══════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE — BANER WIDEO WSPARCIA NA STRONIE GŁÓWNEJ (1× DZIENNIE)
 * Plik: /components/cc-home-video-banner.js
 *
 * Zasady (zatwierdzenie L0 2026-11-24):
 * - Wyświetla się wyłącznie na stronie głównej (/) maks. 1 raz dziennie (czas PL).
 * - Po kliknięciu „Wesprzyj” daje darczyńcy spokój na 7 dni.
 * - Autostart z próbą włączenia dźwięku (-14 LUFS); jeśli przeglądarka zablokuje
 *   autoplay z dźwiękiem przed gestem użytkownika, natychmiast startuje obraz +
 *   pokazuje wyraźny przycisk „🔊 Włącz dźwięk” (odblokowywany 1 kliknięciem).
 * - Nigdy nie zagłusza aktywnie grającego radia 24/7 i nie koliduje z czatem po prawej.
 * - Podgląd testowy o każdej porze: ?show_video_banner=1
 * ══════════════════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  if (window._ccHomeVideoBannerInit) return;
  window._ccHomeVideoBannerInit = true;

  var path = (location.pathname || '/').replace(/\/+$/, '') || '/';
  if (path !== '/' && path !== '/index.html') return;
  if (window.obsstudio || /[?&]in_mcr=1/.test(location.search)) return;

  var KEY_DAY = 'cc_home_video_banner_day';
  var KEY_SNOOZE = 'cc_home_video_banner_snooze_until';
  var forceShow = /[?&]show_video_banner=1/.test(location.search);

  function warsawToday() {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Warsaw',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  var today = warsawToday();
  if (!forceShow) {
    try {
      if (localStorage.getItem(KEY_DAY) === today) return;
      var snooze = Number(localStorage.getItem(KEY_SNOOZE) || 0);
      if (snooze && Date.now() < snooze) return;
    } catch (e) {
      // Brak localStorage — kontynuuj bezpiecznie w sesji
    }
  }

  function isRadioPlaying() {
    try {
      var audios = document.querySelectorAll('audio');
      for (var i = 0; i < audios.length; i++) {
        if (!audios[i].paused && !audios[i].muted && audios[i].volume > 0) return true;
      }
    } catch (e) {}
    return false;
  }

  function mountBanner() {
    if (document.getElementById('ccHomeVideoBanner')) return;

    if (!forceShow) {
      try { localStorage.setItem(KEY_DAY, today); } catch (e) {}
    }

    var style = document.createElement('style');
    style.textContent = [
      '.cc-hvb-wrap{position:fixed;left:18px;top:calc(50% - 16px);bottom:auto;z-index:9200;width:clamp(192px,calc((100vh - 400px) * 0.5625),228px);max-width:calc(100vw - 24px);transform:translateY(calc(-50% + 18px)) scale(.96);opacity:0;pointer-events:none;transition:transform .45s cubic-bezier(.2,.75,.2,1),opacity .4s ease;font-family:Inter,Manrope,system-ui,-apple-system,sans-serif;}',
      '.cc-hvb-wrap.is-open{transform:translateY(-50%) scale(1);opacity:1;pointer-events:auto;}',
      '.cc-hvb-shell{position:relative;border-radius:22px;padding:2px;overflow:hidden;background:rgba(196,163,90,.28);box-shadow:0 24px 60px rgba(0,0,0,.68);}',
      '.cc-hvb-orbit{position:absolute;inset:-60%;pointer-events:none;background:conic-gradient(from 0deg,transparent 0deg,transparent 260deg,#ff7a00 315deg,#ffe4a1 345deg,transparent 360deg);animation:ccHvbSpin 5.5s linear infinite;}',
      '@keyframes ccHvbSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
      '.cc-hvb-card{position:relative;z-index:2;background:#081224;border-radius:20px;overflow:hidden;color:#f3f6fb;}',
      '.cc-hvb-head{display:flex;align-items:center;justify-content:space-between;gap:4px;padding:4px 4px 4px 10px;background:rgba(5,9,20,.94);border-bottom:1px solid rgba(255,255,255,.1);}',
      '.cc-hvb-badge{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#ebd69f;line-height:1.15;}',
      '.cc-hvb-badge i{width:7px;height:7px;flex:0 0 auto;border-radius:50%;background:#ff7a00;box-shadow:0 0 8px #ff7a00;}',
      '.cc-hvb-ctrls{display:flex;align-items:center;gap:0;flex:0 0 auto;}',
      '.cc-hvb-ico{min-width:44px;min-height:44px;border:0;border-radius:12px;background:transparent;color:#e4ebf5;font-size:16px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:background .2s;}',
      '.cc-hvb-ico:hover{background:rgba(255,255,255,.12);color:#fff;}',
      '.cc-hvb-media{position:relative;width:100%;aspect-ratio:9/16;max-height:calc(100vh - 395px);background:#040812;overflow:hidden;cursor:pointer;}',
      '.cc-hvb-media video{position:absolute;inset:0;width:100% !important;height:100% !important;max-width:none !important;max-height:none !important;object-fit:cover !important;display:block;}',
      '.cc-hvb-sound-pill{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;border-radius:999px;border:1px solid rgba(255,255,255,.35);background:rgba(5,9,20,.88);backdrop-filter:blur(8px);color:#fff;font-size:12.5px;font-weight:800;white-space:nowrap;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.55);transition:opacity .25s,transform .25s;}',
      '.cc-hvb-sound-pill.is-hidden{opacity:0;pointer-events:none;transform:translateX(-50%) translateY(8px);}',
      '.cc-hvb-foot{box-sizing:border-box;padding:8px 9px 9px;background:#081224;display:flex;flex-direction:column;gap:6px;}',
      '.cc-hvb-cta{display:inline-flex;flex-wrap:wrap;align-items:center;justify-content:center;column-gap:4px;row-gap:1px;min-height:44px;width:100%;box-sizing:border-box;padding:7px 12px;border-radius:999px;background:#ff7a00;color:#fff;text-decoration:none;font-size:12px;font-weight:800;line-height:1.18;text-align:center;box-shadow:0 8px 22px rgba(255,122,0,.38);transition:background .2s,transform .15s;}',
      '.cc-hvb-cta:hover{background:#ff8c33;}',
      '.cc-hvb-cta:active{background:#e66a00;transform:scale(.98);}',
      '.cc-hvb-cta-sub{white-space:nowrap;}',
      '.cc-hvb-gift{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:44px;width:100%;box-sizing:border-box;padding:6px 10px;border-radius:999px;background:rgba(196,163,90,.18);border:1px solid rgba(235,214,159,.68);color:#fff6dc;text-decoration:none;font-size:12px;font-weight:800;line-height:1.15;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.28);transition:background .2s,border-color .2s,transform .15s;}',
      '.cc-hvb-gift:hover{background:rgba(196,163,90,.32);border-color:#ffe4a1;color:#fff;}',
      '.cc-hvb-gift:active{transform:scale(.98);}',
      '.cc-hvb-sub{text-align:center;font-size:11.5px;color:#aebcd0;}',
      '.cc-hvb-sub a{color:#ebd69f;text-decoration:underline;}',
      '@media (max-width:640px){.cc-hvb-wrap{left:12px;top:calc(50% - 26px);width:206px;}.cc-hvb-media{max-height:calc(100vh - 405px);}.cc-hvb-sound-pill{font-size:11.5px;padding:0 11px;}.cc-hvb-gift{font-size:11.5px;padding:5px 8px;}}',
      '@media (prefers-reduced-motion:reduce){.cc-hvb-orbit{animation-duration:22s;}}',
    ].join('');
    document.head.appendChild(style);

    var wrap = document.createElement('aside');
    wrap.id = 'ccHomeVideoBanner';
    wrap.className = 'cc-hvb-wrap';
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', 'Zaproszenie wideo do wsparcia misji Christian Culture');
    wrap.innerHTML = [
      '<div class="cc-hvb-shell">',
      '  <span class="cc-hvb-orbit" aria-hidden="true"></span>',
      '  <div class="cc-hvb-card">',
      '    <div class="cc-hvb-head">',
      '      <span class="cc-hvb-badge"><i aria-hidden="true"></i>Każdy gest ma znaczenie</span>',
      '      <div class="cc-hvb-ctrls">',
      '        <button type="button" class="cc-hvb-ico" id="ccHvbMuteBtn" aria-label="Włącz lub wycisz dźwięk">🔊</button>',
      '        <button type="button" class="cc-hvb-ico" id="ccHvbCloseBtn" aria-label="Zamknij baner wideo">&times;</button>',
      '      </div>',
      '    </div>',
      '    <div class="cc-hvb-media" id="ccHvbMedia">',
      '      <video id="ccHvbVideo" playsinline preload="auto" poster="/wspieramto/assets/wsparcie-zrzutka-poster.jpg">',
      '        <source src="/wspieramto/assets/wsparcie-zrzutka-web.mp4" type="video/mp4">',
      '      </video>',
      '      <button type="button" class="cc-hvb-sound-pill is-hidden" id="ccHvbSoundPill" aria-label="Włącz dźwięk zaproszenia">🔊 Włącz dźwięk (0:21)</button>',
      '    </div>',
      '    <div class="cc-hvb-foot">',
      '      <a class="cc-hvb-cta" id="ccHvbCta" href="https://zrzutka.pl/z/ChristianCulture" target="_blank" rel="noopener noreferrer" data-support-method="zrzutka_home_video_banner"><span>Wesprzyj</span><span class="cc-hvb-cta-sub">(BLIK&nbsp;/&nbsp;Karta)&nbsp;&rarr;</span></a>',
      '      <a class="cc-hvb-gift" id="ccHvbGift" href="https://drive.google.com/drive/folders/1GIUc1GlNmByFBDCmjmJN4PSukewnzYTc" target="_blank" rel="noopener noreferrer" data-gift-album="best_of_cc_2026">🎁 Odbierz prezent za darmo</a>',
      '      <div class="cc-hvb-sub"><a href="/wspieramto">Plan Nowego Studia RTV</a></div>',
      '    </div>',
      '  </div>',
      '</div>',
    ].join('');
    document.body.appendChild(wrap);

    var vid = document.getElementById('ccHvbVideo');
    var muteBtn = document.getElementById('ccHvbMuteBtn');
    var closeBtn = document.getElementById('ccHvbCloseBtn');
    var soundPill = document.getElementById('ccHvbSoundPill');
    var mediaBox = document.getElementById('ccHvbMedia');
    var cta = document.getElementById('ccHvbCta');
    var giftBtn = document.getElementById('ccHvbGift');

    function syncAudioUI() {
      if (!vid) return;
      var muted = vid.muted || vid.paused;
      if (muteBtn) muteBtn.textContent = vid.muted ? '🔇' : '🔊';
      if (soundPill) soundPill.classList.toggle('is-hidden', !muted);
    }

    function enableSound(restartIfShort) {
      if (!vid) return;
      if (restartIfShort && vid.currentTime > 1.5 && vid.currentTime < 6) {
        try { vid.currentTime = 0; } catch (e) {}
      }
      vid.muted = false;
      vid.play().then(syncAudioUI).catch(syncAudioUI);
    }

    function closeBanner() {
      if (vid) { try { vid.pause(); } catch (e) {} }
      wrap.classList.remove('is-open');
      setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 420);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeBanner);
    if (muteBtn) {
      muteBtn.addEventListener('click', function () {
        if (!vid) return;
        if (vid.paused) { enableSound(false); return; }
        vid.muted = !vid.muted;
        syncAudioUI();
      });
    }
    if (soundPill) {
      soundPill.addEventListener('click', function (e) {
        e.stopPropagation();
        enableSound(true);
      });
    }
    if (mediaBox) {
      mediaBox.addEventListener('click', function () {
        if (!vid) return;
        if (vid.muted || vid.paused) enableSound(true);
        else { vid.pause(); syncAudioUI(); }
      });
    }
    if (cta) {
      cta.addEventListener('click', function () {
        try { localStorage.setItem(KEY_SNOOZE, String(Date.now() + 7 * 24 * 3600 * 1000)); } catch (e) {}
        if (vid) { try { vid.pause(); } catch (e) {} }
      });
    }
    if (giftBtn) {
      giftBtn.addEventListener('click', function () {
        if (vid) { try { vid.pause(); } catch (e) {} syncAudioUI(); }
      });
    }

    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape' && document.getElementById('ccHomeVideoBanner')) {
        closeBanner();
        document.removeEventListener('keydown', onEsc);
      }
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && vid && !vid.paused) {
        try { vid.pause(); } catch (e) {}
        syncAudioUI();
      }
    });

    if (vid) {
      vid.addEventListener('ended', function () {
        vid.currentTime = 0;
        syncAudioUI();
      });
    }

    // Płynny wjazd + autostart z dźwiękiem (lub natychmiastowy fallback muted + 1-tap dźwięk)
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        wrap.classList.add('is-open');
        if (!vid) return;

        if (isRadioPlaying()) {
          vid.muted = true;
          vid.play().then(syncAudioUI).catch(syncAudioUI);
          return;
        }

        vid.muted = false;
        var playPromise = vid.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(syncAudioUI).catch(function () {
            // Polityka przeglądarki zablokowała autoplay z dźwiękiem przed kliknięciem — startujemy obraz + pokazujemy 🔊
            vid.muted = true;
            vid.play().then(syncAudioUI).catch(syncAudioUI);
          });
        } else {
          syncAudioUI();
        }
      });
    });
  }

  var delayMs = forceShow ? 500 : 4500;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(mountBanner, delayMs); });
  } else {
    setTimeout(mountBanner, delayMs);
  }
})();
