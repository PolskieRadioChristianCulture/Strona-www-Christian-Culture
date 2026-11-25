(function () {
  'use strict';

  const TOOLTIP_DAY_KEY = 'cc_apps_tooltip_last_day';
  let mediaIndex = null;
  let webCatalog = [];
  let activeIdx = -1;
  let deferredPwaPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
  });

  function norm(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l')
      .trim();
  }

  function el(tag, attrs, text) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === undefined || v === null) continue;
        if (k === 'className') node.className = v;
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
        else node.setAttribute(k, String(v));
      }
    }
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function todayYmd() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Mini-player & Modal (tworzone w DOM, ale 100% ukryte do momentu kliknięcia w podpowiedź)
  function ensureOverlays() {
    if (document.getElementById('ccV2MiniPlayer')) return;

    const mini = el('aside', { id: 'ccV2MiniPlayer', className: 'cc-v2-mini-player', 'aria-label': 'Odtwarzacz audio' });
    mini.appendChild(el('img', { id: 'ccV2MiniImg', src: '/images/kultura/card-biblia.jpg', alt: 'Audio CC' }));
    const info = el('div', { className: 'cc-v2-mini-info' });
    info.appendChild(el('div', { id: 'ccV2MiniTitle', className: 'cc-v2-mini-title' }, 'Odtwarzacz CC'));
    info.appendChild(el('div', { id: 'ccV2MiniSub', className: 'cc-v2-mini-sub' }, 'Biblia Audio / Radio'));
    mini.appendChild(info);
    mini.appendChild(el('audio', { id: 'ccV2MiniAudio', controls: 'true', preload: 'none' }));
    mini.appendChild(el('button', {
      type: 'button',
      className: 'cc-v2-close-btn',
      'aria-label': 'Zamknij odtwarzacz',
      onClick: () => {
        const a = document.getElementById('ccV2MiniAudio');
        if (a) { a.pause(); a.removeAttribute('src'); }
        mini.classList.remove('is-open');
      }
    }, '×'));
    document.body.appendChild(mini);

    const modal = el('div', { id: 'ccV2Modal', className: 'cc-v2-modal', role: 'dialog', 'aria-modal': 'true' });
    const box = el('div', { className: 'cc-v2-modal-box' });
    const head = el('div', { className: 'cc-v2-modal-head' });
    head.appendChild(el('strong', { id: 'ccV2ModalTitle' }, 'Podgląd'));
    head.appendChild(el('button', {
      type: 'button',
      className: 'cc-v2-close-btn',
      'aria-label': 'Zamknij podgląd',
      onClick: closeModal
    }, '×'));
    box.appendChild(head);
    box.appendChild(el('div', { id: 'ccV2ModalBody', className: 'cc-v2-modal-body' }));
    const foot = el('div', { className: 'cc-v2-modal-foot' });
    foot.appendChild(el('span', { style: 'font-size:0.78rem;color:rgba(243,229,200,0.7);' }, 'Christian Culture — podgląd z wyszukiwarki'));
    foot.appendChild(el('a', { id: 'ccV2ModalLink', className: 'cc-v2-promo-cta', href: '/', target: '_blank', rel: 'noopener noreferrer' }, 'Otwórz materiał →'));
    box.appendChild(foot);
    modal.appendChild(box);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.body.appendChild(modal);
  }

  function closeModal() {
    const modal = document.getElementById('ccV2Modal');
    const body = document.getElementById('ccV2ModalBody');
    if (body) body.textContent = '';
    if (modal) modal.classList.remove('is-open');
  }

  function playAudio(item) {
    ensureOverlays();
    const mini = document.getElementById('ccV2MiniPlayer');
    const audio = document.getElementById('ccV2MiniAudio');
    document.getElementById('ccV2MiniImg').src = item.image || '/images/kultura/card-biblia.jpg';
    document.getElementById('ccV2MiniTitle').textContent = item.title || 'Audio CC';
    document.getElementById('ccV2MiniSub').textContent = item.subtitle || 'Christian Culture Audio';
    audio.src = item.audioUrl;
    mini.classList.add('is-open');
    audio.play().catch(() => {});
  }

  function openVideo(item) {
    ensureOverlays();
    const modal = document.getElementById('ccV2Modal');
    const body = document.getElementById('ccV2ModalBody');
    document.getElementById('ccV2ModalTitle').textContent = item.title;
    body.textContent = '';
    const wrap = el('div', { className: 'cc-v2-video-wrap' });
    wrap.appendChild(el('iframe', {
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.videoId)}?autoplay=1&rel=0`,
      title: item.title,
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
      allowfullscreen: 'true'
    }));
    body.appendChild(wrap);
    document.getElementById('ccV2ModalLink').href = item.url || `https://youtu.be/${item.videoId}`;
    modal.classList.add('is-open');
  }

  function openImage(item) {
    ensureOverlays();
    const modal = document.getElementById('ccV2Modal');
    const body = document.getElementById('ccV2ModalBody');
    document.getElementById('ccV2ModalTitle').textContent = item.title || 'Grafika CC';
    body.textContent = '';
    body.appendChild(el('img', { src: item.image, alt: item.title || 'Grafika CC' }));
    document.getElementById('ccV2ModalLink').href = item.url || item.image;
    modal.classList.add('is-open');
  }

  // 1. Dymek 1× dziennie przy oryginalnej ikonie #ccOmniApps + instalatory w #ccOmniAppsMenu
  function enhanceAppsIcon() {
    const appsBtn = document.getElementById('ccOmniApps');
    const appsMenu = document.getElementById('ccOmniAppsMenu');
    if (!appsBtn || !appsMenu || appsBtn.dataset.ccV2Enhanced) return;
    appsBtn.dataset.ccV2Enhanced = '1';

    // Dodaj sekcję instalowalnych aplikacji na górze oryginalnego #ccOmniAppsMenu
    const installBox = el('div', { className: 'cc-v2-install-box' });
    installBox.appendChild(el('div', { className: 'cc-v2-install-head' }, 'Zainstaluj aplikacje Christian Culture'));
    const list = el('div', { className: 'cc-v2-install-list' });

    const apps = [
      { name: 'Wyszukiwarka CC (Windows)', desc: 'Lekki instalator 2,3 MB', cta: 'Zainstaluj', href: '/aplikacje/wyszukiwarka-windows/Wyszukiwarka-CC-Setup.exe', download: true },
      { name: 'Dobrze, że jesteś', desc: 'Aplikacja mobilna i rozważania', cta: 'Pobierz', href: '/aplikacje#dobrze-ze-jestes' },
      { name: 'Wyszukiwarka CC (PWA)', desc: 'Ikona na ekran główny', cta: 'Zainstaluj', pwa: true, href: '/aplikacje' }
    ];

    for (const app of apps) {
      const row = el('div', { className: 'cc-v2-install-row' });
      const info = el('div', { className: 'cc-v2-install-info' });
      info.appendChild(el('strong', null, app.name));
      info.appendChild(el('span', null, app.desc));
      row.appendChild(info);
      if (app.pwa) {
        row.appendChild(el('button', {
          type: 'button',
          className: 'cc-v2-install-cta',
          onClick: async () => {
            if (deferredPwaPrompt) {
              deferredPwaPrompt.prompt();
              await deferredPwaPrompt.userChoice.catch(() => {});
              deferredPwaPrompt = null;
            } else {
              window.location.href = app.href;
            }
          }
        }, app.cta));
      } else {
        const aAttrs = { className: 'cc-v2-install-cta', href: app.href };
        if (app.download) aAttrs.download = '';
        row.appendChild(el('a', aAttrs, app.cta));
      }
      list.appendChild(row);
    }
    installBox.appendChild(list);
    appsMenu.insertBefore(installBox, appsMenu.firstChild);

    // Dymek raz dziennie „Poznaj aplikacje Christian Culture”
    const wrap = appsBtn.parentElement;
    if (!wrap) return;
    const tip = el('div', { id: 'ccAppsTooltip', className: 'cc-v2-apps-tooltip', role: 'status', 'aria-live': 'polite' });
    const hideTip = () => {
      try { localStorage.setItem(TOOLTIP_DAY_KEY, todayYmd()); } catch (_) {}
      tip.classList.remove('is-visible');
    };
    tip.appendChild(el('button', {
      type: 'button',
      id: 'ccAppsTooltipAction',
      className: 'cc-v2-apps-tooltip-btn',
      onClick: () => {
        hideTip();
        appsBtn.click();
      }
    }, 'Poznaj aplikacje Christian Culture'));
    tip.appendChild(el('button', {
      type: 'button',
      id: 'ccAppsTooltipClose',
      className: 'cc-v2-apps-tooltip-close',
      'aria-label': 'Zamknij podpowiedź',
      onClick: (e) => { e.stopPropagation(); hideTip(); }
    }, '×'));
    wrap.appendChild(tip);
    appsBtn.addEventListener('click', hideTip);

    let lastDay = '';
    try { lastDay = localStorage.getItem(TOOLTIP_DAY_KEY) || ''; } catch (_) {}
    if (lastDay !== todayYmd()) {
      tip.classList.add('is-visible');
      try { localStorage.setItem(TOOLTIP_DAY_KEY, todayYmd()); } catch (_) {}
    }
  }

  // 2. Multimedialne podpowiedzi TYLKO podczas pisania w oryginalnym #ccOmniInput
  function scoreItem(item, nq, words) {
    const t = norm(item.title);
    const d = norm(item.description || item.subtitle || '');
    const tg = norm((item.tags || []).join(' ') + ' ' + (item.channel || ''));
    let s = 0;
    if (t === nq) s += 120;
    else if (t.startsWith(nq)) s += 90;
    else if (t.includes(nq)) s += 60;
    let m = 0;
    for (const w of words) {
      if (w.length < 2) continue;
      if (t.includes(w)) { s += 30; m++; }
      else if (tg.includes(w)) { s += 18; m++; }
      else if (d.includes(w)) { s += 10; m++; }
    }
    if (words.length > 1 && m < Math.ceil(words.length * 0.6)) return 0;
    return s;
  }

  function findPromo(nq) {
    const promos = mediaIndex?.promos || [];
    if (!promos.length) return null;
    let best = promos[0];
    let bestScore = 0;
    for (const p of promos) {
      let s = 0;
      for (const kw of (p.keywords || [])) {
        const nk = norm(kw);
        if (nq.includes(nk) || nk.includes(nq)) s += 20;
      }
      if (s > bestScore) { bestScore = s; best = p; }
    }
    return best;
  }

  function enhanceTypingSuggestions() {
    const input = document.getElementById('ccOmniInput');
    if (!input || input.dataset.ccV2SugBound) return;
    input.dataset.ccV2SugBound = '1';

    const host = input.closest('.cc-omni-bar') || input.parentElement;
    if (!host || !host.parentElement) return;

    const box = el('div', { id: 'ccOmniMediaSuggestions', className: 'cc-v2-media-sugs', 'aria-label': 'Multimedialne podpowiedzi podczas pisania' });
    const head = el('div', { className: 'cc-v2-sugs-head' });
    const countSpan = el('span', { id: 'ccV2SugCount' }, 'Podpowiedzi multimedialne');
    head.appendChild(countSpan);
    head.appendChild(el('span', null, '↑↓ • Enter • Esc'));
    box.appendChild(head);

    const ul = el('ul', { id: 'ccV2SugList', className: 'cc-v2-sugs-list', role: 'listbox' });
    box.appendChild(ul);
    const promoWrap = el('div', { id: 'ccV2SugPromo', className: 'cc-v2-sug-promo' });
    box.appendChild(promoWrap);

    host.parentElement.insertBefore(box, host.nextSibling);

    const closeSugs = () => {
      box.classList.remove('is-open');
      activeIdx = -1;
    };

    const renderSugs = (raw) => {
      const q = String(raw || '').trim();
      const engine = (() => { try { return localStorage.getItem('cc_search_engine') || 'cc'; } catch (_) { return 'cc'; } })();
      if (engine === 'google' || q.length < 2 || !mediaIndex) {
        closeSugs();
        return;
      }
      const nq = norm(q);
      const words = nq.split(/\s+/).filter(Boolean);
      const pick = (arr, limit, type) => (arr || [])
        .map((it) => ({ it: { ...it, mediaType: type }, s: scoreItem(it, nq, words) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, limit)
        .map((x) => x.it);

      const items = [
        ...pick(mediaIndex.audios, 2, 'audio'),
        ...pick(mediaIndex.videos, 3, 'video'),
        ...pick(mediaIndex.graphics, 2, 'image'),
        ...pick(mediaIndex.channels, 2, 'module'),
        ...pick(webCatalog, 3, 'page')
      ].slice(0, 7);

      ul.textContent = '';
      if (!items.length) {
        closeSugs();
        return;
      }

      countSpan.textContent = `Podpowiedzi multimedialne (${items.length})`;
      activeIdx = -1;

      items.forEach((item) => {
        const li = el('li', { className: 'cc-v2-sug-item', role: 'option', 'aria-selected': 'false' });
        if (item.image) {
          li.appendChild(el('img', { className: 'cc-v2-sug-thumb', src: item.image, alt: item.title, loading: 'lazy' }));
        }
        const body = el('div', { className: 'cc-v2-sug-body' });
        body.appendChild(el('div', { className: 'cc-v2-sug-title' }, item.title));
        const meta = el('div', { className: 'cc-v2-sug-meta' });
        const bCls = item.mediaType === 'video' ? 'cc-v2-badge is-video'
          : item.mediaType === 'audio' ? 'cc-v2-badge is-audio'
          : item.mediaType === 'image' ? 'cc-v2-badge is-image' : 'cc-v2-badge';
        const bLbl = item.mediaType === 'video' ? 'Wideo'
          : item.mediaType === 'audio' ? 'Audio'
          : item.mediaType === 'image' ? 'Grafika' : 'Ekosystem CC';
        meta.appendChild(el('span', { className: bCls }, bLbl));
        if (item.channel || item.subtitle) meta.appendChild(el('span', null, item.channel || item.subtitle));
        body.appendChild(meta);
        li.appendChild(body);

        if (item.mediaType === 'audio' && item.audioUrl) {
          li.appendChild(el('button', { type: 'button', className: 'cc-v2-sug-action', onClick: (e) => { e.stopPropagation(); playAudio(item); closeSugs(); } }, '▶ Słuchaj'));
        } else if (item.mediaType === 'video' && item.videoId) {
          li.appendChild(el('button', { type: 'button', className: 'cc-v2-sug-action', onClick: (e) => { e.stopPropagation(); openVideo(item); closeSugs(); } }, '▶ Oglądaj'));
        } else if (item.mediaType === 'image' && item.image) {
          li.appendChild(el('button', { type: 'button', className: 'cc-v2-sug-action', onClick: (e) => { e.stopPropagation(); openImage(item); closeSugs(); } }, '🔍 Zobacz'));
        }

        li.addEventListener('click', () => {
          if (item.mediaType === 'audio' && item.audioUrl) playAudio(item);
          else if (item.mediaType === 'video' && item.videoId) openVideo(item);
          else if (item.mediaType === 'image' && item.image) openImage(item);
          else if (item.url) window.location.href = item.url;
          closeSugs();
        });
        ul.appendChild(li);
      });

      const promo = findPromo(nq);
      promoWrap.textContent = '';
      if (promo) {
        promoWrap.appendChild(el('img', { src: promo.image, alt: promo.title }));
        const pb = el('div', { className: 'cc-v2-sug-body' });
        pb.appendChild(el('div', { className: 'cc-v2-sug-meta' }, promo.badge));
        pb.appendChild(el('div', { className: 'cc-v2-sug-title' }, promo.title));
        promoWrap.appendChild(pb);
        promoWrap.appendChild(el('a', { className: 'cc-v2-promo-cta', href: promo.url }, promo.cta));
        promoWrap.style.display = 'flex';
      } else {
        promoWrap.style.display = 'none';
      }

      box.classList.add('is-open');
    };

    input.addEventListener('input', () => renderSugs(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (box.classList.contains('is-open')) {
          e.preventDefault();
          e.stopImmediatePropagation();
          closeSugs();
        }
        closeModal();
        return;
      }
      if (!box.classList.contains('is-open')) return;
      const opts = ul.querySelectorAll('.cc-v2-sug-item');
      if (!opts.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopImmediatePropagation();
        activeIdx = (activeIdx + 1) % opts.length;
        opts.forEach((n, i) => { n.classList.toggle('is-active', i === activeIdx); n.setAttribute('aria-selected', i === activeIdx ? 'true' : 'false'); });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopImmediatePropagation();
        activeIdx = (activeIdx - 1 + opts.length) % opts.length;
        opts.forEach((n, i) => { n.classList.toggle('is-active', i === activeIdx); n.setAttribute('aria-selected', i === activeIdx ? 'true' : 'false'); });
      } else if (e.key === 'Enter' && activeIdx >= 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        opts[activeIdx].click();
      }
    }, true);
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.cc-omni-bar') && !e.target.closest('#ccOmniMediaSuggestions')) closeSugs();
    });
  }

  async function boot() {
    try {
      const [res, webRes] = await Promise.all([
        fetch('/data/cc-search-media-index.json?v=20261125'),
        fetch('/data/cc-search-index.json?v=20261125').catch(() => null)
      ]);
      if (res && res.ok) mediaIndex = await res.json();
      if (webRes && webRes.ok) {
        const w = await webRes.json();
        webCatalog = Array.isArray(w) ? w : (w.items || []);
      }
    } catch (_) {}

    // Poczekaj aż oryginalny cc-omni-search wyrenderuje #ccOmniInput i #ccOmniApps
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      enhanceAppsIcon();
      enhanceTypingSuggestions();
      if ((document.getElementById('ccOmniInput') && document.getElementById('ccOmniApps')) || tries > 60) {
        clearInterval(timer);
      }
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
