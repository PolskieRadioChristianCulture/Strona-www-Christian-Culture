/* CC public-page standard. No account, storage, network or analytics access. */
(function () {
  'use strict';
  if (window.CCBackToTop) return;
  window.CCBackToTop = true;
  function mount() {
    if (!document.body) return;
    var oldLumina = document.getElementById('luminaScrollTop');
    if (oldLumina && typeof oldLumina.remove === 'function') oldLumina.remove();
    else if (oldLumina && oldLumina.parentNode && typeof oldLumina.parentNode.removeChild === 'function') oldLumina.parentNode.removeChild(oldLumina);
    try {
      new MutationObserver(function(m) {
        for (var i = 0; i < m.length; i++) {
          var nodes = m[i].addedNodes;
          for (var j = 0; j < nodes.length; j++) {
            var n = nodes[j];
            if (n && (n.id === 'luminaScrollTop' || (n.classList && n.classList.contains('lumina-scroll-top')))) n.remove();
          }
        }
      }).observe(document.body, { childList: true });
    } catch (_) {}
    var button = document.getElementById('backToTopBtn');
    if (!button) {
      button = document.createElement('button');
      button.id = 'backToTopBtn';
      document.body.appendChild(button);
    }
    button.type = 'button';
    button.setAttribute('aria-label', 'Przewiń na górę');
    button.title = 'Przewiń na górę';
    button.setAttribute('data-cc-back-to-top', '');
    button.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="m6 12 6-6 6 6M12 6v14"/></svg>';
    var style = document.createElement('style');
    var nonceMeta = document.querySelector && document.querySelector('meta[name="cc-csp-nonce"]');
    if (nonceMeta && nonceMeta.content) style.nonce = nonceMeta.content;
    // Jeden przycisk „do góry” na stronie: starszy moduł LUMINA (#luminaScrollTop) ustępuje standardowi CC.
    style.textContent = '#luminaScrollTop{display:none!important}.lumina-scroll-top,.lumina-scroll-top-btn{display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important}#backToTopBtn[data-cc-back-to-top]{position:fixed!important;right:max(16px,env(safe-area-inset-right))!important;bottom:var(--cc-floating-bottom,max(16px,env(safe-area-inset-bottom)))!important;left:auto!important;top:auto!important;width:48px!important;height:48px!important;min-width:48px!important;min-height:48px!important;margin:0!important;padding:0!important;border:1px solid #b08a3c!important;border-radius:50%!important;background:#fff!important;color:#63470e!important;box-shadow:0 3px 14px #0003!important;z-index:900!important;align-items:center!important;justify-content:center!important;opacity:1!important;visibility:visible!important;transform:none!important;cursor:pointer;touch-action:manipulation}#backToTopBtn[data-cc-back-to-top]:focus-visible{outline:3px solid #2563eb!important;outline-offset:3px}[data-lumina-theme="dark"] #backToTopBtn[data-cc-back-to-top],html.dark #backToTopBtn[data-cc-back-to-top]{background:#171923!important;color:#ffe2a1!important}';
    document.head.appendChild(style);
    // Capture prevents old book/course handlers from issuing a second scroll.
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }, true);
    var pending = false;
    function update() {
      pending = false;
      var height = window.innerHeight;
      var right = window.innerWidth - 16;
      var bottom = window.innerWidth >= 768 ? 24 : 16;
      var visible = (window.scrollY || document.documentElement.scrollTop || 0) > 300;
      var modalOpen = Array.from(document.querySelectorAll('dialog[open], [aria-modal="true"]:not([hidden])')).some(function (modal) {
        var rect = modal.getBoundingClientRect();
        var css = window.getComputedStyle(modal);
        return rect.width > 0 && rect.height > 0 && css.visibility !== 'hidden' && css.display !== 'none';
      });
      if (document.fullscreenElement || modalOpen) visible = false;

      // Sprawdzenie stałego paska nawigacji na dole (np. CC GO .mobile-nav)
      var navEl = document.querySelector && document.querySelector('.mobile-nav, .lumina-nav-bottom, [data-floating-bottom-bar]');
      if (navEl) {
        var ncs = window.getComputedStyle(navEl);
        if (ncs.display !== 'none' && ncs.visibility !== 'hidden') {
          var nrect = navEl.getBoundingClientRect();
          if (nrect.height > 0 && nrect.top < height) {
            bottom = Math.max(bottom, Math.round(height - nrect.top + 12));
          }
        }
      }

      // Sample only the right-hand action lane, avoiding expensive whole-DOM scans.
      // Fixed players, navigation and floating controls reserve space above them.
      var luminaActions = document.querySelector && document.querySelector('#luminaThemeSwitchBtn');
      if (visible && !luminaActions && document.elementsFromPoint) {
        for (var pass = 0; pass < 12; pass++) {
          var previous = bottom;
          [right - 24, right - 2].forEach(function (x) {
            [height - bottom - 2, height - bottom - 24, height - bottom - 46].forEach(function (y) {
              document.elementsFromPoint(x, y).forEach(function (element) {
                if (element === button || button.contains(element) || element.id === 'ccGlobalChatFab' || (typeof element.closest === 'function' && element.closest('#ccGlobalChatFab')) || element.classList?.contains('lumina-floating-chat-btn')) return;
                var position = window.getComputedStyle(element).position;
                if (position !== 'fixed' && position !== 'sticky') return;
                var rect = element.getBoundingClientRect();
                if (rect.width && rect.height && rect.top > height * 0.35 && rect.bottom > height - bottom - 48) {
                  bottom = Math.max(bottom, Math.round(height - rect.top + 12));
                }
              });
            });
          });
          if (bottom === previous) break;
        }
      }
      if (bottom + 48 > height * 0.65) visible = false;
      var finalBottom = luminaActions ? 'var(--cc-lumina-action-base)' : 'max(' + bottom + 'px, env(safe-area-inset-bottom))';
      if (document.documentElement && document.documentElement.style && typeof document.documentElement.style.setProperty === 'function') {
        document.documentElement.style.setProperty('--cc-floating-bottom', finalBottom);
      }
      if (document.body && document.body.style && typeof document.body.style.setProperty === 'function') {
        document.body.style.setProperty('--cc-floating-bottom', finalBottom);
      }
      button.style.setProperty('bottom', finalBottom, 'important');
      var edgePlus = document.getElementById('ccEdgePlusBtn');
      if (edgePlus) {
        edgePlus.style.setProperty('bottom', finalBottom, 'important');
      }
      button.style.setProperty('display', visible ? 'flex' : 'none', 'important');
    }
    function schedule() {
      if (!pending) { pending = true; window.requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('click', schedule, { passive: true });
    document.addEventListener('fullscreenchange', schedule);
    document.addEventListener('transitionend', schedule, { passive: true });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', schedule, { passive: true });
    update();
  }

  // ── Dok szybkich skrótów (Strażnik, 2026-10-11) ─────────────────────────────
  // Zamiast trzech pływających przycisków (radio, czat, motyw) zasłaniających treść
  // po prawej — jeden przycisk; po dotknięciu pokazuje skróty nad sobą.
  function mountFabDock() {
    if (typeof document.querySelector !== 'function' || window.CCFabDock) return;
    window.CCFabDock = true;
    var IDS = ['#luminaThemeSwitchBtn', '#luminaMiniPlayerContainer.minimized'];
    var root = document.documentElement;
    var toggle = null;
    var css = document.createElement('style');
    var nonceMeta = document.querySelector('meta[name="cc-csp-nonce"]');
    if (nonceMeta && nonceMeta.content) css.nonce = nonceMeta.content;
    css.textContent = 'html.cc-fab-dock-on:not(.cc-fab-dock-open) :is(#luminaThemeSwitchBtn,#luminaMiniPlayerContainer.minimized){display:none!important}' +
      'html.cc-fab-dock-open #luminaThemeSwitchBtn{bottom:calc(var(--cc-dock-b) + 60px)!important;right:var(--cc-dock-r)!important}' +
      'html.cc-fab-dock-open #luminaMiniPlayerContainer.minimized{bottom:calc(var(--cc-dock-b) + 120px)!important;right:var(--cc-dock-r)!important}' +
      '#ccFabDockToggle{position:fixed;z-index:100006;bottom:var(--cc-dock-b);right:var(--cc-dock-r);width:48px;height:48px;border-radius:50%;border:1px solid #b08a3c;background:#fff;color:#63470e;box-shadow:0 3px 14px #0003;display:none;align-items:center;justify-content:center;cursor:pointer;padding:0;touch-action:manipulation;transition:transform .2s}' +
      'html.cc-fab-dock-on #ccFabDockToggle{display:flex}html.cc-fab-dock-open #ccFabDockToggle{transform:rotate(90deg)}' +
      '#ccFabDockToggle:focus-visible{outline:3px solid #2563eb;outline-offset:3px}' +
      '[data-lumina-theme="dark"] #ccFabDockToggle,html.dark #ccFabDockToggle{background:#171923;color:#ffe2a1}';
    document.head.appendChild(css);
    function present() {
      return IDS.map(function (s) { return document.querySelector(s); }).filter(function (el) {
        return el && window.getComputedStyle(el).position === 'fixed';
      });
    }
    function setOpen(open) {
      root.classList.toggle('cc-fab-dock-open', open);
      if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    function check() {
      if (root.classList.contains('cc-fab-dock-on')) {
        if (!document.querySelector('#luminaThemeSwitchBtn, #luminaMiniPlayerContainer')) {
          root.classList.remove('cc-fab-dock-on', 'cc-fab-dock-open');
        }
        return;
      }
      var items = present();
      if (items.length < 2) return;
      var bottom = Infinity;
      items.forEach(function (el) {
        var cs = window.getComputedStyle(el);
        var b = parseFloat(cs.bottom);
        if (!isNaN(b) && b < bottom) bottom = b;
      });
      if (!isFinite(bottom)) bottom = 142;
      root.style.setProperty('--cc-dock-b', bottom + 'px');
      // Ten sam odstęp od prawej co przycisk „do góry” — oba przyciski w jednej, równej kolumnie.
      root.style.setProperty('--cc-dock-r', 'max(16px, env(safe-area-inset-right))');
      if (!toggle) {
        toggle = document.createElement('button');
        toggle.id = 'ccFabDockToggle';
        toggle.type = 'button';
        toggle.setAttribute('aria-label', 'Skróty: radio, czat, motyw');
        toggle.title = 'Skróty';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/></svg>';
        toggle.addEventListener('click', function (event) {
          event.stopPropagation();
          setOpen(!root.classList.contains('cc-fab-dock-open'));
        });
        document.body.appendChild(toggle);
        document.addEventListener('click', function (event) {
          if (!root.classList.contains('cc-fab-dock-open') || event.target === toggle) return;
          // Po wybraniu skrótu lub dotknięciu poza dokiem — zwiń.
          setTimeout(function () { setOpen(false); }, 150);
        });
        document.addEventListener('keydown', function (event) {
          if (event.key === 'Escape' && root.classList.contains('cc-fab-dock-open')) { setOpen(false); toggle.focus(); }
        });
      }
      root.classList.add('cc-fab-dock-on');
    }
    var tries = 0;
    var timer = setInterval(function () { check(); if (++tries > 20) clearInterval(timer); }, 750);
    check();
  }
  // Każde włączenie Radia CC na stronie zasila licznik /milion (osobny, mały moduł).
  function loadRadioMilion() {
    if (typeof document.createElement !== 'function' || !document.head || window.CCRadioMilion) return;
    var script = document.createElement('script');
    script.src = '/js/cc-radio-milion.js?v=20261024_playing';
    script.defer = true;
    document.head.appendChild(script);
  }
  // One stable LUMINA lane, independent of authentication and late module loading.
  function mountLuminaActions() {
    var css = document.createElement('style');
    var nonceMeta = document.querySelector && document.querySelector('meta[name="cc-csp-nonce"]');
    if (nonceMeta && nonceMeta.content) css.nonce = nonceMeta.content;
    css.textContent = `
      body:has(#luminaThemeSwitchBtn){--cc-lumina-action-base:calc(76px + env(safe-area-inset-bottom, 0px));--cc-lumina-action-right:max(16px,env(safe-area-inset-right))}
      @media (min-width:768px){body:has(#luminaThemeSwitchBtn){--cc-lumina-action-right:24px}}
      html body:has(#luminaThemeSwitchBtn) #backToTopBtn[data-cc-back-to-top]{bottom:var(--cc-lumina-action-base)!important;right:var(--cc-lumina-action-right)!important;width:48px!important;height:48px!important;margin:0!important;z-index:99997!important}
      html body:has(#luminaThemeSwitchBtn) #ccGlobalChatFab{display:flex!important;bottom:calc(var(--cc-lumina-action-base) + 60px)!important;right:var(--cc-lumina-action-right)!important;width:48px!important;height:48px!important;margin:0!important;z-index:99998!important}
      html body:has(#luminaThemeSwitchBtn) #ccChatFabBtn{width:48px!important;height:48px!important;min-width:48px!important;min-height:48px!important;max-width:48px!important;max-height:48px!important}
      html body:has(#luminaThemeSwitchBtn) #luminaThemeSwitchBtn{display:flex!important;bottom:calc(var(--cc-lumina-action-base) + 120px)!important;right:var(--cc-lumina-action-right)!important;width:48px!important;height:48px!important;min-width:48px!important;min-height:48px!important;margin:0!important;box-sizing:border-box!important}
      html body:has(#luminaThemeSwitchBtn) #luminaMiniPlayerContainer.minimized{display:flex!important;bottom:calc(var(--cc-lumina-action-base) + 180px)!important;right:var(--cc-lumina-action-right)!important;left:auto!important;width:48px!important;height:48px!important;margin:0!important;box-sizing:border-box!important;transform:none!important}
      @media (max-width:767px){
        html body:has(#luminaThemeSwitchBtn) #luminaMiniPlayerContainer.minimized{bottom:calc(var(--cc-lumina-action-base) + 120px)!important;right:var(--cc-lumina-action-right)!important}
        html.cc-edge-theme-ready body:has(#luminaThemeSwitchBtn) #luminaMiniPlayerContainer.minimized{bottom:calc(var(--cc-lumina-action-base) + 120px)!important;right:var(--cc-lumina-action-right)!important}
      }
      html body:has(#luminaThemeSwitchBtn):has(#ccGlobalChatFab #ccChatTeaserBubble:not([style*="display: none"])) #luminaMiniPlayerContainer.minimized,
      html.cc-edge-theme-ready body:has(#luminaThemeSwitchBtn):has(#ccGlobalChatFab #ccChatTeaserBubble:not([style*="display: none"])) #luminaMiniPlayerContainer.minimized{bottom:calc(var(--cc-lumina-action-base) + 268px)!important;right:var(--cc-lumina-action-right)!important}
      html body:has(#luminaThemeSwitchBtn) #ccFabDockToggle,
      html body:has(#luminaThemeSwitchBtn):has(#ccGlobalChatFab) #luminaFloatingChatBtn{display:none!important}
      html body:has(#luminaThemeSwitchBtn):has(#directMessagesModal.open) #luminaMiniPlayerContainer,
      html body:has(#luminaThemeSwitchBtn):has(#messageModal.open) #luminaMiniPlayerContainer{display:none!important}
      html body:has(#luminaThemeSwitchBtn) :is(.ekocc-info-trigger, #ekoccInfoTriggerBtn){display:none!important}
    `;
    document.head.appendChild(css);
  }
  function start() { mount(); mountLuminaActions(); try { loadRadioMilion(); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
