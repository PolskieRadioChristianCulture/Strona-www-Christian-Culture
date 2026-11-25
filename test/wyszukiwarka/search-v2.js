(function () {
  'use strict';

  const RECENTS_KEY = 'cc_v2_recent_searches';
  const ENGINE_KEY = 'cc_search_engine';
  const TOOLTIP_DAY_KEY = 'cc_apps_tooltip_last_day';
  let deferredPwaPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
  });

  const INSTALLABLE_APPS = [
    {
      id: 'app_win_search',
      icon: '💻',
      name: 'Wyszukiwarka CC (Windows)',
      desc: 'Lekki instalator 2,3 MB • pasek zakładek i Ctrl+Shift+Spacja',
      cta: 'Zainstaluj',
      href: '/aplikacje/wyszukiwarka-windows/Wyszukiwarka-CC-Setup.exe',
      download: true
    },
    {
      id: 'app_dzj',
      icon: '📱',
      name: 'Dobrze, że jesteś',
      desc: 'Codzienne rozważania, audio i inspiracje na telefon',
      cta: 'Pobierz',
      href: '/aplikacje#dobrze-ze-jestes'
    },
    {
      id: 'app_pwa',
      icon: '⚡',
      name: 'Wyszukiwarka CC (Ekran główny)',
      desc: 'Szybka ikona aplikacji na telefon lub komputer (PWA)',
      cta: 'Zainstaluj',
      pwaInstall: true,
      href: '/aplikacje'
    }
  ];

  const ECOSYSTEM_APPS = [
    { icon: '📻', name: 'Radio 24/7', url: '/player' },
    { icon: '🎧', name: 'Biblia Audio', url: '/biblia-audio/' },
    { icon: '📖', name: 'MojaBiblia', url: '/mojabiblia' },
    { icon: '🎓', name: 'Kurs Codzienny', url: '/akademia#kurscodzienny' },
    { icon: '✨', name: 'LUMINA', url: '/lumina' },
    { icon: '💬', name: 'LUMI Messenger', url: '/mess' },
    { icon: '🎬', name: 'Kino VOD', url: '/vod' },
    { icon: '📺', name: 'Kanały TV', url: '/SpiritualSounds/tv/' },
    { icon: '💌', name: 'Wiad. z Nieba', url: '/wiadomosci-z-nieba/' },
    { icon: '📰', name: 'CCN News', url: '/news' },
    { icon: '🎵', name: 'topTEN', url: '/topten' },
    { icon: '🌸', name: 'CC Women', url: '/ccwomen/' },
    { icon: '🎁', name: 'E-Kartki', url: '/kartki/' },
    { icon: '🗓️', name: 'HOLOS 2027', url: '/holos' },
    { icon: '🤝', name: 'CC Pomoc', url: '/help' },
    { icon: '📚', name: 'Biblioteka', url: '/biblioteka' },
    { icon: '🗺️', name: 'Mapa CC', url: '/mapa' },
    { icon: '💛', name: 'WspieramTO', url: '/wspieramto' }
  ];

  const state = {
    engine: 'cc',
    filter: 'all',
    query: '',
    activeSugIndex: -1,
    suggestions: [],
    mediaIndex: null,
    webCatalog: []
  };

  try {
    if (localStorage.getItem(ENGINE_KEY) === 'google') state.engine = 'google';
  } catch (_) {}

  const $ = (id) => document.getElementById(id);
  const inputEl = $('ccSearchInput');
  const formEl = $('ccSearchForm');
  const clearBtn = $('ccClearBtn');
  const sugBox = $('ccSuggestions');
  const sugList = $('ccSugList');
  const sugCount = $('ccSugCount');
  const sugPromo = $('ccSugPromo');
  const filtersEl = $('ccFilters');
  const recentsEl = $('ccRecents');
  const resultsEl = $('ccResultsArea');
  const gatewayEl = $('ccEcosystemGateway');
  const featuredEl = $('ccFeaturedStart');
  const statsBannerEl = $('ccStatsBanner');
  const miniPlayer = $('ccMiniPlayer');
  const miniAudio = $('ccMiniAudio');
  const miniImg = $('ccMiniImg');
  const miniTitle = $('ccMiniTitle');
  const miniSub = $('ccMiniSub');
  const miniLink = $('ccMiniLink');
  const modalEl = $('ccModal');
  const modalTitle = $('ccModalTitle');
  const modalBody = $('ccModalBody');
  const modalLink = $('ccModalLink');

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

  function getRecents() {
    try {
      const arr = JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
      return Array.isArray(arr) ? arr.filter((s) => typeof s === 'string' && s.trim().length > 1).slice(0, 6) : [];
    } catch (_) {
      return [];
    }
  }

  function saveRecent(q) {
    const clean = String(q || '').trim();
    if (clean.length < 2) return;
    try {
      const next = [clean, ...getRecents().filter((x) => x.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      renderRecents();
    } catch (_) {}
  }

  function renderRecents() {
    const items = getRecents();
    recentsEl.textContent = '';
    if (!items.length) {
      recentsEl.classList.remove('has-items');
      return;
    }
    recentsEl.classList.add('has-items');
    recentsEl.appendChild(el('span', null, 'Ostatnie:'));
    for (const q of items) {
      recentsEl.appendChild(
        el('button', {
          type: 'button',
          className: 'cc-recent-pill',
          onClick: () => {
            inputEl.value = q;
            runFullSearch(q);
          }
        }, q)
      );
    }
  }

  // INLINE AUDIO PLAYER
  function playAudioInline(item) {
    if (!item || !item.audioUrl) return;
    miniImg.src = item.image || '/images/kultura/card-biblia.jpg';
    miniImg.alt = item.title || 'Audio CC';
    miniTitle.textContent = item.title || 'Odtwarzanie audio';
    miniSub.textContent = item.subtitle || (item.isStream ? 'Strumień radiowy 24/7' : 'Biblia Audio CC');
    miniLink.href = item.url || '/player';
    miniAudio.src = item.audioUrl;
    miniPlayer.classList.add('is-open');
    miniAudio.play().catch(() => {});
  }

  $('ccMiniClose').addEventListener('click', () => {
    miniAudio.pause();
    miniAudio.removeAttribute('src');
    miniPlayer.classList.remove('is-open');
  });

  // MODAL: VIDEO LITE-EMBED OR GRAPHIC LIGHTBOX
  function openVideoModal(item) {
    if (!item || !item.videoId) return;
    modalTitle.textContent = item.title;
    modalBody.textContent = '';
    const wrap = el('div', { className: 'cc-modal-video-wrap' });
    const iframe = el('iframe', {
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.videoId)}?autoplay=1&rel=0`,
      title: item.title,
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
      allowfullscreen: 'true'
    });
    wrap.appendChild(iframe);
    modalBody.appendChild(wrap);
    modalLink.href = item.url || `https://youtu.be/${item.videoId}`;
    modalLink.textContent = 'Otwórz na YouTube →';
    modalEl.classList.add('is-open');
  }

  function openImageModal(item) {
    if (!item || !item.image) return;
    modalTitle.textContent = item.title || 'Grafika Christian Culture';
    modalBody.textContent = '';
    modalBody.appendChild(el('img', { src: item.image, alt: item.title || 'Grafika CC' }));
    modalLink.href = item.url || item.image;
    modalLink.textContent = 'Otwórz stronę materiału →';
    modalEl.classList.add('is-open');
  }

  function closeModal() {
    modalBody.textContent = '';
    modalEl.classList.remove('is-open');
  }
  $('ccModalClose').addEventListener('click', closeModal);
  modalEl.addEventListener('click', (e) => { if (e.target === modalEl) closeModal(); });

  // SCORING & SEARCH ENGINE
  function scoreItem(item, nq, words) {
    const title = norm(item.title);
    const desc = norm(item.description || item.subtitle || '');
    const tags = norm((item.tags || []).join(' ') + ' ' + (item.channel || '') + ' ' + (item.category || ''));
    const hay = `${title} ${desc} ${tags}`;

    let score = 0;
    if (title === nq) score += 120;
    else if (title.startsWith(nq)) score += 90;
    else if (title.includes(nq)) score += 65;

    let matchedWords = 0;
    for (const w of words) {
      if (w.length < 2) continue;
      if (title.includes(w)) { score += 32; matchedWords++; }
      else if (tags.includes(w)) { score += 18; matchedWords++; }
      else if (desc.includes(w)) { score += 10; matchedWords++; }
    }

    if (words.length > 1 && matchedWords < Math.ceil(words.length * 0.6)) return 0;
    if (score === 0 && hay.includes(nq)) score = 15;
    return score;
  }

  function findMatchingPromo(nq) {
    const promos = state.mediaIndex?.promos || [];
    if (!promos.length) return null;
    if (!nq) return promos[0];
    let best = null;
    let bestScore = 0;
    for (const p of promos) {
      let s = 0;
      for (const kw of (p.keywords || [])) {
        const nk = norm(kw);
        if (nq.includes(nk) || nk.includes(nq)) s += 20;
      }
      if (norm(p.title).includes(nq)) s += 30;
      if (s > bestScore) { bestScore = s; best = p; }
    }
    return best || promos[0];
  }

  function findMatchingVerse(nq) {
    const verses = state.mediaIndex?.verses || [];
    if (!nq || nq.length < 2) return null;
    // Dopasowanie po sigli (np. "prz 16", "j 3", "ps 23", "rdz 38") lub frazie w wersecie
    const cleanRef = nq.replace(/[:,]/g, ' ').replace(/\s+/g, ' ');
    for (const v of verses) {
      const nr = norm(v.ref).replace(/[:,]/g, ' ').replace(/\s+/g, ' ');
      if (nr.includes(cleanRef) || cleanRef.includes(nr)) return v;
    }
    if (nq.length >= 4) {
      for (const v of verses) {
        if (norm(v.text).includes(nq)) return v;
      }
    }
    return null;
  }

  function searchAll(rawQuery) {
    const nq = norm(rawQuery);
    const words = nq.split(/\s+/).filter(Boolean);
    const idx = state.mediaIndex || { videos: [], audios: [], graphics: [], channels: [], promos: [], verses: [] };

    const scoreList = (arr, typeOverride) => arr
      .map((item) => ({ item: typeOverride ? { ...item, mediaType: typeOverride } : item, score: scoreItem(item, nq, words) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);

    const videos = scoreList(idx.videos || [], 'video');
    const audios = scoreList(idx.audios || [], 'audio');
    const graphics = scoreList(idx.graphics || [], 'image');
    const channels = scoreList(idx.channels || [], 'module');
    const pages = scoreList(state.webCatalog || [], 'page');
    const verse = findMatchingVerse(nq);
    const promo = findMatchingPromo(nq);

    return { videos, audios, graphics, channels, pages, verse, promo };
  }

  // LIVE MULTIMEDIA AUTOCOMPLETE DROPDOWN (OD 2. LITERY!)
  function closeSuggestions() {
    sugBox.classList.remove('is-open');
    inputEl.setAttribute('aria-expanded', 'false');
    state.activeSugIndex = -1;
  }

  function updateSuggestions(rawQuery) {
    const q = String(rawQuery || '').trim();
    clearBtn.classList.toggle('is-visible', q.length > 0);
    if (state.engine === 'google' || q.length < 2) {
      closeSuggestions();
      return;
    }

    const res = searchAll(q);
    // Zbuduj zbalansowaną, multimedialną listę podpowiedzi (wideo + audio + grafika + kanał/strona)
    const mixed = [];
    const pushSome = (arr, limit) => {
      for (const it of arr.slice(0, limit)) mixed.push(it);
    };
    pushSome(res.audios, 2);
    pushSome(res.videos, 3);
    pushSome(res.graphics, 2);
    pushSome(res.channels, 2);
    pushSome(res.pages, 3);

    const list = mixed.slice(0, 8);
    state.suggestions = list;
    state.activeSugIndex = -1;

    sugList.textContent = '';
    if (!list.length) {
      sugCount.textContent = 'Brak dokładnych podpowiedzi — naciśnij Enter';
      sugBox.classList.remove('is-open');
      return;
    }

    const total = res.videos.length + res.audios.length + res.graphics.length + res.channels.length + res.pages.length;
    sugCount.textContent = `Podpowiedzi multimedialne (${total} wyników)`;

    list.forEach((item, idx) => {
      const li = el('li', {
        className: 'cc-sug-item',
        role: 'option',
        id: `cc-sug-opt-${idx}`,
        'aria-selected': 'false'
      });

      if (item.image) {
        li.appendChild(el('img', { className: 'cc-sug-thumb', src: item.image, alt: item.title, loading: 'lazy' }));
      } else {
        const icon = item.mediaType === 'audio' ? '🎧' : item.mediaType === 'video' ? '🎬' : item.mediaType === 'image' ? '🖼️' : '🌐';
        li.appendChild(el('div', { className: 'cc-sug-icon-box' }, icon));
      }

      const body = el('div', { className: 'cc-sug-body' });
      body.appendChild(el('div', { className: 'cc-sug-title' }, item.title));
      const meta = el('div', { className: 'cc-sug-meta' });
      const badgeClass = item.mediaType === 'video' ? 'cc-sug-badge is-video'
        : item.mediaType === 'audio' ? 'cc-sug-badge is-audio'
        : item.mediaType === 'image' ? 'cc-sug-badge is-image'
        : 'cc-sug-badge';
      const badgeLabel = item.mediaType === 'video' ? 'Wideo'
        : item.mediaType === 'audio' ? 'Audio'
        : item.mediaType === 'image' ? 'Grafika'
        : (item.category || 'Ekosystem CC');
      meta.appendChild(el('span', { className: badgeClass }, badgeLabel));
      if (item.channel || item.subtitle) {
        meta.appendChild(el('span', null, item.channel || item.subtitle));
      }
      body.appendChild(meta);
      li.appendChild(body);

      if (item.mediaType === 'audio' && item.audioUrl) {
        li.appendChild(el('button', {
          type: 'button',
          className: 'cc-sug-action',
          onClick: (e) => {
            e.stopPropagation();
            playAudioInline(item);
            closeSuggestions();
          }
        }, '▶ Słuchaj'));
      } else if (item.mediaType === 'video' && item.videoId) {
        li.appendChild(el('button', {
          type: 'button',
          className: 'cc-sug-action',
          onClick: (e) => {
            e.stopPropagation();
            openVideoModal(item);
            closeSuggestions();
          }
        }, '▶ Oglądaj'));
      } else if (item.mediaType === 'image' && item.image) {
        li.appendChild(el('button', {
          type: 'button',
          className: 'cc-sug-action',
          onClick: (e) => {
            e.stopPropagation();
            openImageModal(item);
            closeSuggestions();
          }
        }, '🔍 Zobacz'));
      }

      li.addEventListener('click', () => {
        if (item.mediaType === 'audio' && item.audioUrl) playAudioInline(item);
        else if (item.mediaType === 'video' && item.videoId) openVideoModal(item);
        else if (item.mediaType === 'image' && item.image) openImageModal(item);
        else if (item.url) window.location.href = item.url;
        closeSuggestions();
      });

      sugList.appendChild(li);
    });

    // Kontekstowa autoreklama ekosystemu CC w samych podpowiedziach!
    sugPromo.textContent = '';
    if (res.promo) {
      sugPromo.appendChild(el('img', { src: res.promo.image, alt: res.promo.title }));
      const pBody = el('div', { className: 'cc-sug-body' });
      pBody.appendChild(el('div', { className: 'cc-promo-badge' }, res.promo.badge));
      pBody.appendChild(el('div', { className: 'cc-sug-title' }, res.promo.title));
      sugPromo.appendChild(pBody);
      sugPromo.appendChild(el('a', { className: 'cc-sug-promo-cta', href: res.promo.url }, res.promo.cta));
      sugPromo.style.display = 'flex';
    } else {
      sugPromo.style.display = 'none';
    }

    sugBox.classList.add('is-open');
    inputEl.setAttribute('aria-expanded', 'true');
  }

  function setActiveSuggestion(nextIdx) {
    const items = sugList.querySelectorAll('.cc-sug-item');
    if (!items.length) return;
    const len = items.length;
    state.activeSugIndex = ((nextIdx % len) + len) % len;
    items.forEach((node, i) => {
      const active = i === state.activeSugIndex;
      node.classList.toggle('is-active', active);
      node.setAttribute('aria-selected', active ? 'true' : 'false');
      if (active) node.scrollIntoView({ block: 'nearest' });
    });
  }

  // FULL MULTIMEDIA RESULTS RENDERER
  function buildVideoCard(v) {
    const card = el('article', { className: 'cc-card' });
    const stage = el('div', { className: 'cc-video-stage' });
    stage.appendChild(el('img', { src: v.image, alt: v.title, loading: 'lazy' }));
    const playBtn = el('button', {
      type: 'button',
      className: 'cc-video-play',
      'aria-label': `Odtwórz wideo: ${v.title}`,
      onClick: () => {
        stage.textContent = '';
        stage.appendChild(el('iframe', {
          src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.videoId)}?autoplay=1&rel=0`,
          title: v.title,
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: 'true'
        }));
      }
    }, '▶');
    stage.appendChild(playBtn);
    card.appendChild(stage);

    const body = el('div', { className: 'cc-card-body' });
    body.appendChild(el('div', { className: 'cc-card-kicker' }, `${v.isShorts ? 'Shorts' : 'Wideo 4K'} • ${v.channel}`));
    body.appendChild(el('h3', { className: 'cc-card-title' }, v.title));
    const actions = el('div', { className: 'cc-card-actions' });
    actions.appendChild(el('button', {
      type: 'button',
      className: 'cc-cta-btn',
      onClick: () => playBtn.click()
    }, '▶ Oglądaj tutaj'));
    actions.appendChild(el('a', {
      className: 'cc-ghost-btn',
      href: v.url,
      target: '_blank',
      rel: 'noopener noreferrer'
    }, 'YouTube ↗'));
    body.appendChild(actions);
    card.appendChild(body);
    return card;
  }

  function buildAudioCard(a) {
    const card = el('article', { className: 'cc-audio-card' });
    card.appendChild(el('img', { src: a.image || '/images/kultura/card-biblia.jpg', alt: a.title, loading: 'lazy' }));
    const info = el('div', { className: 'cc-audio-info' });
    info.appendChild(el('h3', null, a.title));
    info.appendChild(el('p', null, a.subtitle || a.description));
    card.appendChild(info);
    card.appendChild(el('button', {
      type: 'button',
      className: 'cc-cta-btn',
      onClick: () => playAudioInline(a)
    }, '▶ Słuchaj teraz'));
    return card;
  }

  function buildGraphicCard(g) {
    const card = el('article', { className: 'cc-card' });
    const img = el('img', {
      className: 'cc-gfx-thumb',
      src: g.image,
      alt: g.title,
      loading: 'lazy',
      onClick: () => openImageModal(g)
    });
    card.appendChild(img);
    const body = el('div', { className: 'cc-card-body' });
    body.appendChild(el('div', { className: 'cc-card-kicker' }, 'Grafika CC'));
    body.appendChild(el('h3', { className: 'cc-card-title' }, g.title));
    const actions = el('div', { className: 'cc-card-actions' });
    actions.appendChild(el('button', {
      type: 'button',
      className: 'cc-cta-btn',
      onClick: () => openImageModal(g)
    }, '🔍 Powiększ'));
    if (g.url) actions.appendChild(el('a', { className: 'cc-ghost-btn', href: g.url }, 'Otwórz →'));
    body.appendChild(actions);
    card.appendChild(body);
    return card;
  }

  function buildPromoCard(p) {
    const card = el('section', { className: 'cc-promo-card', 'aria-label': 'Polecane z ekosystemu Christian Culture' });
    card.appendChild(el('img', { src: p.image, alt: p.title, loading: 'lazy' }));
    const mid = el('div');
    mid.appendChild(el('div', { className: 'cc-promo-badge' }, p.badge));
    mid.appendChild(el('h3', null, p.title));
    mid.appendChild(el('p', null, p.description));
    card.appendChild(mid);
    card.appendChild(el('a', { className: 'cc-cta-btn', href: p.url }, p.cta));
    return card;
  }

  function updateFilterCounts(res) {
    const counts = {
      all: res ? (res.videos.length + res.audios.length + res.graphics.length + res.channels.length + res.pages.length) : null,
      video: res ? res.videos.length : (state.mediaIndex?.stats?.videos || null),
      audio: res ? res.audios.length : (state.mediaIndex?.stats?.audios || null),
      image: res ? res.graphics.length : (state.mediaIndex?.stats?.graphics || null),
      bible: res ? (res.audios.filter((a) => !a.isStream).length + (res.verse ? 1 : 0) + res.pages.filter((p) => /biblia|lekcj|kurs|rozwaz/i.test(`${p.title} ${p.category}`)).length) : null,
      ecosystem: res ? (res.channels.length + res.pages.length) : (state.mediaIndex?.stats?.channels || null)
    };
    filtersEl.querySelectorAll('.cc-filter-btn').forEach((btn) => {
      const f = btn.getAttribute('data-filter');
      const badge = btn.querySelector('.cc-filter-count');
      if (badge) badge.textContent = counts[f] !== null && counts[f] !== undefined ? String(counts[f]) : '';
    });
  }

  function runFullSearch(rawQuery) {
    const q = String(rawQuery || '').trim();
    state.query = q;
    closeSuggestions();

    if (state.engine === 'google' && q.length > 0) {
      window.open('https://www.google.com/search?q=' + encodeURIComponent(q), '_blank', 'noopener');
      return;
    }

    if (!q) {
      resultsEl.textContent = '';
      gatewayEl.style.display = 'block';
      featuredEl.style.display = 'block';
      updateFilterCounts(null);
      return;
    }

    saveRecent(q);
    const res = searchAll(q);
    updateFilterCounts(res);
    featuredEl.style.display = 'none';
    resultsEl.textContent = '';

    const total = res.videos.length + res.audios.length + res.graphics.length + res.channels.length + res.pages.length + (res.verse ? 1 : 0);

    const head = el('div', { className: 'cc-section-head' });
    head.appendChild(el('h2', null, `Wyniki dla „${q}”`));
    head.appendChild(el('span', { className: 'cc-section-meta' }, `${total} materiałów w ekosystemie CC`));
    resultsEl.appendChild(head);

    // 1. Natychmiastowa karta wersetu UBG
    if (res.verse && (state.filter === 'all' || state.filter === 'bible')) {
      const vc = el('section', { className: 'cc-verse-card' });
      vc.appendChild(el('div', { className: 'cc-verse-ref' }, `📖 Werset UBG • ${res.verse.ref}`));
      vc.appendChild(el('p', { className: 'cc-verse-text' }, `„${res.verse.text}”`));
      const acts = el('div', { className: 'cc-verse-actions' });
      acts.appendChild(el('a', { className: 'cc-cta-btn', href: `/mojabiblia?q=${encodeURIComponent(res.verse.ref)}` }, 'Czytaj w MojaBiblia →'));
      if (res.audios[0]) {
        acts.appendChild(el('button', {
          type: 'button',
          className: 'cc-ghost-btn',
          onClick: () => playAudioInline(res.audios[0])
        }, '▶ Posłuchaj Biblii Audio'));
      }
      vc.appendChild(acts);
      resultsEl.appendChild(vc);
    }

    // 2. Kontekstowa Autoreklama Ekosystemu CC („Polecane”)
    if (res.promo) {
      resultsEl.appendChild(buildPromoCard(res.promo));
    }

    // 3. Audio inline
    if (res.audios.length && (state.filter === 'all' || state.filter === 'audio' || state.filter === 'bible')) {
      const sh = el('div', { className: 'cc-section-head' });
      sh.appendChild(el('h2', null, '🎧 Audio do posłuchania od razu'));
      sh.appendChild(el('span', { className: 'cc-section-meta' }, `${res.audios.length} pozycji`));
      resultsEl.appendChild(sh);
      const grid = el('div', { className: 'cc-grid-3' });
      res.audios.slice(0, state.filter === 'audio' ? 24 : 6).forEach((a) => grid.appendChild(buildAudioCard(a)));
      resultsEl.appendChild(grid);
    }

    // 4. Wideo YouTube CC (lite-embed)
    if (res.videos.length && (state.filter === 'all' || state.filter === 'video')) {
      const sh = el('div', { className: 'cc-section-head' });
      sh.appendChild(el('h2', null, '🎬 Wideo Christian Culture (odtwórz na miejscu)'));
      sh.appendChild(el('span', { className: 'cc-section-meta' }, `${res.videos.length} filmów`));
      resultsEl.appendChild(sh);
      const grid = el('div', { className: 'cc-grid-3' });
      res.videos.slice(0, state.filter === 'video' ? 24 : 6).forEach((v) => grid.appendChild(buildVideoCard(v)));
      resultsEl.appendChild(grid);
    }

    // 5. Grafiki i karty wizualne
    if (res.graphics.length && (state.filter === 'all' || state.filter === 'image')) {
      const sh = el('div', { className: 'cc-section-head' });
      sh.appendChild(el('h2', null, '🖼️ Grafiki i ilustracje'));
      sh.appendChild(el('span', { className: 'cc-section-meta' }, `${res.graphics.length} grafik`));
      resultsEl.appendChild(sh);
      const grid = el('div', { className: 'cc-grid-4' });
      res.graphics.slice(0, state.filter === 'image' ? 20 : 4).forEach((g) => grid.appendChild(buildGraphicCard(g)));
      resultsEl.appendChild(grid);
    }

    // 6. Strony, kanały, lekcje i artykuły
    const combinedPages = [...res.channels, ...res.pages];
    const filteredPages = state.filter === 'bible'
      ? combinedPages.filter((p) => /biblia|lekcj|kurs|rozwaz|akademia/i.test(`${p.title} ${p.category || ''} ${p.url || ''}`))
      : combinedPages;

    if (filteredPages.length && (state.filter === 'all' || state.filter === 'ecosystem' || state.filter === 'bible')) {
      const sh = el('div', { className: 'cc-section-head' });
      sh.appendChild(el('h2', null, '🌐 Strony, lekcje i zasoby ekosystemu'));
      sh.appendChild(el('span', { className: 'cc-section-meta' }, `${filteredPages.length} stron`));
      resultsEl.appendChild(sh);
      const grid = el('div', { className: 'cc-grid-3' });
      filteredPages.slice(0, 18).forEach((p) => {
        const card = el('a', { className: 'cc-card', href: p.url || '/' });
        if (p.image) {
          card.appendChild(el('img', { className: 'cc-gfx-thumb', src: p.image, alt: p.title, loading: 'lazy' }));
        }
        const body = el('div', { className: 'cc-card-body' });
        body.appendChild(el('div', { className: 'cc-card-kicker' }, p.category || p.kind || 'Ekosystem CC'));
        body.appendChild(el('h3', { className: 'cc-card-title' }, p.title));
        if (p.description) body.appendChild(el('p', { className: 'cc-card-desc' }, p.description.slice(0, 140)));
        card.appendChild(body);
        grid.appendChild(card);
      });
      resultsEl.appendChild(grid);
    }

    if (total === 0) {
      const empty = el('div', { className: 'cc-verse-card' });
      empty.appendChild(el('div', { className: 'cc-verse-ref' }, 'Nie znaleziono dokładnego dopasowania'));
      empty.appendChild(el('p', { className: 'cc-card-desc' }, 'Spróbuj krótszego hasła (np. „Apokalipsa”, „Biblia Audio”, „Tamar”, „Radio”, „Kurs”) albo skorzystaj z Bramy Ekosystemu poniżej.'));
      resultsEl.appendChild(empty);
    }
  }

  // START VIEW: FEATURED MULTIMEDIA + ECOSYSTEM GATEWAY
  function renderStartView() {
    const idx = state.mediaIndex;
    if (!idx) return;

    const totalResources = (idx.stats.videos || 0) + (idx.stats.audios || 0) + (idx.stats.graphics || 0) + (idx.stats.channels || 0) + (state.webCatalog.length || 0);
    statsBannerEl.textContent = `${totalResources}+ zasobów na wyciągnięcie ręki • ${idx.stats.videos} filmów • ${idx.stats.audios} audio • ${idx.stats.graphics} grafik • ${idx.stats.verses} wersetów UBG`;

    // Polecane multimedia na start (do obejrzenia i posłuchania od razu)
    featuredEl.textContent = '';
    const fh = el('div', { className: 'cc-section-head' });
    fh.appendChild(el('h2', null, '✨ Obejrzyj i posłuchaj od razu'));
    fh.appendChild(el('span', { className: 'cc-section-meta' }, 'Najnowsze wideo, Biblia Audio i grafiki Christian Culture'));
    featuredEl.appendChild(fh);

    // 1. Wyróżniona karta autoreklamy ekosystemu
    if (idx.promos && idx.promos[0]) {
      featuredEl.appendChild(buildPromoCard(idx.promos[0]));
    }

    // 2. Wideo + Audio + Grafika obok siebie
    const mediaGrid = el('div', { className: 'cc-grid-3' });
    if (idx.videos && idx.videos[0]) mediaGrid.appendChild(buildVideoCard(idx.videos[0]));
    if (idx.videos && idx.videos[1]) mediaGrid.appendChild(buildVideoCard(idx.videos[1]));
    if (idx.graphics && idx.graphics[0]) mediaGrid.appendChild(buildGraphicCard(idx.graphics[0]));
    featuredEl.appendChild(mediaGrid);

    const ah = el('div', { className: 'cc-section-head' });
    ah.appendChild(el('h2', null, '🎧 Radio 24/7 i najnowsza Biblia Audio'));
    ah.appendChild(el('span', { className: 'cc-section-meta' }, 'Uruchom jednym kliknięciem bez opuszczania strony'));
    featuredEl.appendChild(ah);
    const audioGrid = el('div', { className: 'cc-grid-3' });
    const latestAudios = [
      idx.audios[0],
      idx.audios[1],
      idx.audios[idx.audios.length - 1]
    ].filter(Boolean);
    latestAudios.forEach((a) => audioGrid.appendChild(buildAudioCard(a)));
    featuredEl.appendChild(audioGrid);

    // 3. Brama Całego Ekosystemu
    gatewayEl.textContent = '';
    const gh = el('div', { className: 'cc-section-head' });
    gh.appendChild(el('h2', null, '🏛️ Brama Ekosystemu Christian Culture — wszystko w jednym centrum'));
    gh.appendChild(el('span', { className: 'cc-section-meta' }, 'Pełny dostęp do każdego filaru misji'));
    gatewayEl.appendChild(gh);

    const pillarsWrap = el('div', { className: 'cc-pillars' });
    for (const group of (idx.gatewayPillars || [])) {
      const box = el('section', { className: 'cc-pillar' });
      box.appendChild(el('h3', null, `${group.icon} ${group.group}`));
      const ul = el('ul', { className: 'cc-pillar-list' });
      for (const item of group.items) {
        const li = el('li');
        const link = el('a', { className: 'cc-pillar-link', href: item.url });
        const left = el('div');
        left.appendChild(el('strong', null, item.title));
        left.appendChild(el('span', null, item.desc));
        link.appendChild(left);
        link.appendChild(el('span', { className: 'cc-pillar-badge' }, item.badge));
        li.appendChild(link);
        ul.appendChild(li);
      }
      box.appendChild(ul);
      pillarsWrap.appendChild(box);
    }
    gatewayEl.appendChild(pillarsWrap);
  }

  // EVENT BINDINGS
  inputEl.addEventListener('input', () => updateSuggestions(inputEl.value));
  inputEl.addEventListener('focus', () => {
    if (inputEl.value.trim().length >= 2) updateSuggestions(inputEl.value);
  });
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSuggestions();
      closeModal();
      return;
    }
    if (!sugBox.classList.contains('is-open')) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(state.activeSugIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(state.activeSugIndex - 1);
    } else if (e.key === 'Enter' && state.activeSugIndex >= 0) {
      e.preventDefault();
      const target = sugList.querySelectorAll('.cc-sug-item')[state.activeSugIndex];
      if (target) target.click();
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.cc-search-wrap')) closeSuggestions();
  });

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    runFullSearch(inputEl.value);
  });

  clearBtn.addEventListener('click', () => {
    inputEl.value = '';
    clearBtn.classList.remove('is-visible');
    runFullSearch('');
    inputEl.focus();
  });

  filtersEl.querySelectorAll('.cc-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.filter = btn.getAttribute('data-filter') || 'all';
      filtersEl.querySelectorAll('.cc-filter-btn').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      if (state.query) runFullSearch(state.query);
    });
  });

  document.querySelectorAll('.cc-engine-btn').forEach((btn) => {
    const mode = btn.getAttribute('data-engine');
    btn.setAttribute('aria-pressed', mode === state.engine ? 'true' : 'false');
    btn.addEventListener('click', () => {
      state.engine = mode;
      try { localStorage.setItem(ENGINE_KEY, mode); } catch (_) {}
      document.querySelectorAll('.cc-engine-btn').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      inputEl.placeholder = mode === 'google'
        ? 'Szukaj w całym internecie (Google)…'
        : 'Szukaj: Apokalipsa, Biblia Audio, Tamar, Radio, J 3:16, LUMINA…';
      if (mode === 'google') closeSuggestions();
    });
  });

  // APPS LAUNCHER (lewy górny róg) + Dymek 1× dziennie „Poznaj aplikacje Christian Culture”
  function getTodayLocalYmd() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function initAppsLauncher() {
    const btn = $('ccAppsLauncherBtn');
    const drawer = $('ccAppsDrawer');
    const closeBtn = $('ccAppsDrawerClose');
    const tooltip = $('ccAppsTooltip');
    const tooltipAction = $('ccAppsTooltipAction');
    const tooltipClose = $('ccAppsTooltipClose');
    const installList = $('ccInstallableAppsList');
    const appsGrid = $('ccEcosystemAppsGrid');
    if (!btn || !drawer) return;

    const markTooltipSeenToday = () => {
      try { localStorage.setItem(TOOLTIP_DAY_KEY, getTodayLocalYmd()); } catch (_) {}
      if (tooltip) tooltip.classList.remove('is-visible');
    };

    const openDrawer = () => {
      markTooltipSeenToday();
      drawer.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    };
    const closeDrawer = () => {
      drawer.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    };

    // Wypełnij listę aplikacji do zainstalowania z poziomu wyszukiwarki
    installList.textContent = '';
    for (const app of INSTALLABLE_APPS) {
      const row = el('div', { className: 'cc-install-row' });
      row.appendChild(el('div', { className: 'cc-install-icon', 'aria-hidden': 'true' }, app.icon));
      const info = el('div', { className: 'cc-install-info' });
      info.appendChild(el('strong', null, app.name));
      info.appendChild(el('span', null, app.desc));
      row.appendChild(info);
      if (app.pwaInstall) {
        row.appendChild(el('button', {
          type: 'button',
          className: 'cc-install-cta',
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
        const aAttrs = { className: 'cc-install-cta', href: app.href };
        if (app.download) aAttrs.download = '';
        row.appendChild(el('a', aAttrs, app.cta));
      }
      installList.appendChild(row);
    }

    // Wypełnij pełną siatkę wszystkich aplikacji ekosystemu
    appsGrid.textContent = '';
    for (const app of ECOSYSTEM_APPS) {
      const tile = el('a', { className: 'cc-app-tile', href: app.url });
      tile.appendChild(el('span', { className: 'cc-app-tile-ico', 'aria-hidden': 'true' }, app.icon));
      tile.appendChild(el('span', { className: 'cc-app-tile-name' }, app.name));
      appsGrid.appendChild(tile);
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (drawer.classList.contains('is-open')) closeDrawer();
      else openDrawer();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (tooltipAction) tooltipAction.addEventListener('click', openDrawer);
    if (tooltipClose) tooltipClose.addEventListener('click', (e) => {
      e.stopPropagation();
      markTooltipSeenToday();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.cc-apps-anchor')) closeDrawer();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });

    // Dymek raz dziennie przy ikonie w lewym górnym rogu
    let lastShown = '';
    try { lastShown = localStorage.getItem(TOOLTIP_DAY_KEY) || ''; } catch (_) {}
    if (tooltip && lastShown !== getTodayLocalYmd()) {
      tooltip.classList.add('is-visible');
      // Zapisz od razu dzisiejszą datę wyświetlenia, aby po odświeżeniu nie wracał tego samego dnia
      try { localStorage.setItem(TOOLTIP_DAY_KEY, getTodayLocalYmd()); } catch (_) {}
    }
  }

  // BOOTSTRAP DATA
  async function init() {
    initAppsLauncher();
    renderRecents();
    try {
      const [mediaRes, webRes] = await Promise.all([
        fetch('./media-index.json?v=20261125'),
        fetch('/data/cc-search-index.json?v=20261125').catch(() => null)
      ]);
      if (mediaRes && mediaRes.ok) {
        state.mediaIndex = await mediaRes.json();
      }
      if (webRes && webRes.ok) {
        const w = await webRes.json();
        state.webCatalog = Array.isArray(w) ? w : (w.items || []);
      }
    } catch (_) {}

    renderStartView();
    updateFilterCounts(null);

    const urlQ = new URLSearchParams(window.location.search).get('q');
    if (urlQ) {
      inputEl.value = urlQ;
      runFullSearch(urlQ);
    }
  }

  init();
})();
