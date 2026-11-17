/**
 * ============================================================================
 * CHRISTIAN CULTURE NETWORK — PODCASTS CONTROLLER 2026
 * assets/podcasts/podcasts.js
 * 
 * Moduł aplikacji /podcasty (polskieradio.cc/podcasty)
 * Architektura: Zero Cost, Zero Regression, WCAG AA, Mobile Touch >= 44px
 * Prawdziwe odtwarzacze: Spotify Embed (Show, Artist, 15 Albums) & Dysk Google M4A
 * Zero fake play buttons, zero fake waveforms, zero blocking overlays
 * ============================================================================
 */

(function () {
  'use strict';

  const CATALOG_URL = '/data/podcasts/catalog.json';

  // App State
  const state = {
    catalog: null,
    activeCategory: 'all',
    searchQuery: '',
    activeDeckItem: null,
    favorites: new Set(),
    history: []
  };

  // DOM Elements cache
  const el = {};

  async function init() {
    cacheDom();
    loadPersistedState();
    setupEventListeners();
    await loadCatalog();
    renderAll();
    handleDeepLinking();
  }

  function cacheDom() {
    el.app = document.getElementById('cc-podcast-app');
    el.searchInput = document.getElementById('podcast-search-input');
    el.searchClear = document.getElementById('podcast-search-clear');
    el.filterBar = document.getElementById('category-filter-bar');
    el.spotifyGrid = document.getElementById('spotify-grid');
    el.continueList = document.getElementById('continue-list');
    el.topicsList = document.getElementById('topics-list');

    // Live Stage Elements
    el.liveSpotifyShowFrame = document.getElementById('live-spotify-show-frame');
    el.liveGdriveFrame = document.getElementById('live-gdrive-m4a-frame');
    el.liveMusicDeckFrame = document.getElementById('live-music-deck-frame');
    el.activeDeckTag = document.getElementById('active-deck-tag');
    el.activeDeckTitle = document.getElementById('active-deck-title');
    el.activeDeckDesc = document.getElementById('active-deck-desc');
    el.activeDeckLink = document.getElementById('active-deck-link');
    el.activeDeckModalBtn = document.getElementById('active-deck-modal-btn');

    // Dock Status Bar (Bottom)
    el.playerBar = document.getElementById('master-player-bar');
    el.playerThumb = document.getElementById('player-thumb');
    el.playerTitle = document.getElementById('player-title');
    el.playerSeries = document.getElementById('player-series');
    el.playerFavBtn = document.getElementById('player-fav-btn');
    el.playerBtnJump = document.getElementById('player-btn-jump');
    el.playerDockExtLink = document.getElementById('player-dock-ext-link');

    // Embed Drawer / Modal
    el.embedModal = document.getElementById('embed-modal');
    el.embedTitle = document.getElementById('embed-modal-title');
    el.embedBadge = document.getElementById('embed-modal-badge');
    el.embedCloseBtn = document.getElementById('embed-modal-close');
    el.embedBody = document.getElementById('embed-modal-body');
    el.embedExtLink = document.getElementById('embed-modal-ext-link');

    // Toast & Share Elements
    el.toast = document.getElementById('cc-toast');
    el.spotifyShowShareBtn = document.getElementById('spotify-show-share-btn');
    el.spotifyApokalipsaShareBtn = document.getElementById('spotify-apokalipsa-share-btn');
    el.gdriveShareBtn = document.getElementById('gdrive-share-btn');
    el.activeDeckShareBtn = document.getElementById('active-deck-share-btn');
  }

  function loadPersistedState() {
    try {
      const savedFavs = localStorage.getItem('cc_podcasts_favorites');
      if (savedFavs) {
        state.favorites = new Set(JSON.parse(savedFavs));
      }
      const savedHist = localStorage.getItem('cc_podcasts_history');
      if (savedHist) {
        state.history = JSON.parse(savedHist);
      }
    } catch (e) {
      console.warn('Storage read failed:', e);
    }
  }

  function persistFavorites() {
    try {
      localStorage.setItem('cc_podcasts_favorites', JSON.stringify(Array.from(state.favorites)));
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  }

  function persistHistory() {
    try {
      localStorage.setItem('cc_podcasts_history', JSON.stringify(state.history.slice(0, 10)));
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  }

  async function loadCatalog() {
    try {
      const res = await fetch(CATALOG_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      state.catalog = await res.json();
    } catch (err) {
      console.error('Błąd wczytywania katalogu podcastów:', err);
    }
  }

  function setupEventListeners() {
    // Search input
    if (el.searchInput) {
      el.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        if (el.searchClear) {
          el.searchClear.style.display = state.searchQuery ? 'block' : 'none';
        }
        renderCatalog();
      });

      // Keyboard shortcut Ctrl+K
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          el.searchInput.focus();
        }
      });
    }

    if (el.searchClear) {
      el.searchClear.addEventListener('click', () => {
        if (el.searchInput) el.searchInput.value = '';
        state.searchQuery = '';
        el.searchClear.style.display = 'none';
        renderCatalog();
      });
    }

    // Category Filter Chips
    if (el.filterBar) {
      el.filterBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.cc-filter-chip');
        if (!chip) return;
        el.filterBar.querySelectorAll('.cc-filter-chip').forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        state.activeCategory = chip.dataset.category || 'all';

        // Auto-scroll to specific sections if selected
        if (state.activeCategory === 'podcast') {
          document.getElementById('podcast-spotify-section')?.scrollIntoView({ behavior: 'smooth' });
        } else if (state.activeCategory === 'gdrive') {
          document.getElementById('gdrive-audio-section')?.scrollIntoView({ behavior: 'smooth' });
        } else if (state.activeCategory === 'music' || state.activeCategory === 'artist') {
          document.getElementById('music-catalog-section')?.scrollIntoView({ behavior: 'smooth' });
        }

        renderCatalog();
      });
    }

    // Modal Close
    if (el.embedCloseBtn) {
      el.embedCloseBtn.addEventListener('click', closeEmbedModal);
    }
    if (el.embedModal) {
      el.embedModal.addEventListener('click', (e) => {
        if (e.target === el.embedModal) closeEmbedModal();
      });
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && el.embedModal && el.embedModal.classList.contains('is-open')) {
        closeEmbedModal();
      }
    });

    // Jump to active player button in dock
    if (el.playerBtnJump) {
      el.playerBtnJump.addEventListener('click', () => {
        const target = document.getElementById('active-music-deck');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (el.liveMusicDeckFrame) {
            el.liveMusicDeckFrame.focus();
          }
        }
      });
    }

    // Active deck modal maximize button
    if (el.activeDeckModalBtn) {
      el.activeDeckModalBtn.addEventListener('click', () => {
        if (state.activeDeckItem) {
          openEmbedModal(state.activeDeckItem);
        } else if (state.catalog && state.catalog.spotifyAlbums && state.catalog.spotifyAlbums.length) {
          openEmbedModal(state.catalog.spotifyAlbums[0]);
        }
      });
    }

    // Fav button in dock
    if (el.playerFavBtn) {
      el.playerFavBtn.addEventListener('click', () => {
        if (state.activeDeckItem) {
          toggleFavorite(state.activeDeckItem.id);
        }
      });
    }

    // Share: Spotify Show
    if (el.spotifyShowShareBtn) {
      el.spotifyShowShareBtn.addEventListener('click', () => {
        const url = `${window.location.origin}/podcasty#podcast-spotify-section`;
        shareItem(
          'Podcast Spotify Osobowość Plus • Christian Culture',
          'Słuchaj oficjalnego podcastu Osobowość Plus w portalu audio Christian Culture:',
          url
        );
      });
    }

    // Share: Spotify Apokalipsa Show
    if (el.spotifyApokalipsaShareBtn) {
      el.spotifyApokalipsaShareBtn.addEventListener('click', () => {
        const url = `${window.location.origin}/podcasty#podcast-apokalipsa-section`;
        shareItem(
          'Podcast Spotify APOKALIPSA - Księga Nadziei • Christian Culture',
          'Słuchaj oficjalnego podcastu Apokalipsa - Księga Nadziei w portalu audio Christian Culture:',
          url
        );
      });
    }

    // Share: Google Drive Master Audio
    if (el.gdriveShareBtn) {
      el.gdriveShareBtn.addEventListener('click', () => {
        const url = `${window.location.origin}/podcasty#gdrive-audio-section`;
        shareItem(
          'Cyfrowy ekosystem Christian Culture Network • Nagranie Master M4A',
          'Posłuchaj autorskiego nagrania audio o architekturze Christian Culture:',
          url
        );
      });
    }

    // Share: Active Deck Album/Artist
    if (el.activeDeckShareBtn) {
      el.activeDeckShareBtn.addEventListener('click', () => {
        if (!state.activeDeckItem) return;
        const url = `${window.location.origin}/podcasty?album=${encodeURIComponent(state.activeDeckItem.id)}`;
        shareItem(
          `${state.activeDeckItem.title} • Christian Culture`,
          `Posłuchaj oficjalnego wydania ${state.activeDeckItem.title} w portalu podcastów i muzyki CC:`,
          url
        );
      });
    }
  }

  // Toast Notification
  let toastTimeout = null;
  function showToast(message) {
    if (!el.toast) return;
    el.toast.textContent = message;
    el.toast.classList.add('is-visible');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      el.toast.classList.remove('is-visible');
    }, 3000);
  }

  // Native / Clipboard Sharing
  async function shareItem(title, text, url) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        showToast('✓ Skopiowano link do schowka!');
        return;
      } catch (e) {
        console.warn('Clipboard write failed:', e);
      }
    }
    prompt('Skopiuj poniższy link:', url);
  }

  // Social Distribution & Deep Linking handler
  function handleDeepLinking() {
    try {
      const url = new URL(window.location.href);
      const albumParam = url.searchParams.get('album') || url.searchParams.get('id');
      const hash = url.hash;

      if (albumParam) {
        const found = state.catalog?.spotifyAlbums?.find(a => a.id === albumParam) ||
                      state.catalog?.spotifyArtist?.find(a => a.id === albumParam);
        if (found) {
          mountDeckItem(found, true);
          return;
        }
      }

      if (hash) {
        if (hash === '#podcast-spotify-section' || hash === '#podcast-apokalipsa-section' || hash === '#gdrive-audio-section' || hash === '#music-catalog-section') {
          const target = document.querySelector(hash);
          if (target) {
            setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 100);
            return;
          }
        }
        const cleanId = hash.replace(/^#/, '');
        const foundHash = state.catalog?.spotifyAlbums?.find(a => a.id === cleanId) ||
                          state.catalog?.spotifyArtist?.find(a => a.id === cleanId);
        if (foundHash) {
          mountDeckItem(foundHash, true);
        }
      }
    } catch (e) {
      console.warn('Deep link handling failed:', e);
    }
  }

  // Mount Album or Artist into the Active Deck Stage
  function mountDeckItem(item, shouldScroll = true) {
    if (!item) return;
    state.activeDeckItem = item;

    if (el.liveMusicDeckFrame) {
      el.liveMusicDeckFrame.src = item.embedUrl || 'https://open.spotify.com/embed/artist/3ZgXCNnAllDbNDtzk4jkg6';
      el.liveMusicDeckFrame.title = item.title + ' • Odtwarzacz Spotify';
    }

    const isArtist = item.sourceType === 'artist';
    if (el.activeDeckTag) {
      el.activeDeckTag.textContent = isArtist ? 'ARTYSTA SPOTIFY • OFICJALNY PROFIL' : 'ALBUM SPOTIFY • ODTWARZACZ PŁYTY';
    }
    if (el.activeDeckTitle) {
      el.activeDeckTitle.textContent = item.title + (item.author ? ' • ' + item.author : '');
    }
    if (el.activeDeckDesc) {
      el.activeDeckDesc.textContent = item.summary || 'Oficjalne wydanie Christian Culture w serwisie Spotify.';
    }
    if (el.activeDeckLink) {
      el.activeDeckLink.href = item.externalUrl || item.directUrl || '#';
      el.activeDeckLink.title = 'Otwórz ' + item.title + ' w aplikacji Spotify';
    }

    // Update Bottom Dock Status Bar
    if (el.playerThumb && item.coverUrl) {
      el.playerThumb.src = item.coverUrl;
      el.playerThumb.alt = item.title;
    }
    if (el.playerTitle) {
      el.playerTitle.textContent = item.title;
    }
    if (el.playerSeries) {
      el.playerSeries.textContent = isArtist ? 'Profil Artysty Spotify' : (item.author || 'Album Spotify');
    }
    if (el.playerDockExtLink) {
      el.playerDockExtLink.href = item.externalUrl || item.directUrl || '#';
    }

    updatePlayerFavBtn();

    // Mark card in grid
    document.querySelectorAll('.cc-catalog-card').forEach(card => {
      card.classList.toggle('is-deck-active', card.dataset.itemId === item.id);
    });

    // Record in history
    recordHistory(item);

    if (shouldScroll) {
      const stage = document.getElementById('active-music-deck');
      if (stage) {
        stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  // Open Sandboxed Embed Modal (Full View)
  function openEmbedModal(item) {
    if (!el.embedModal || !el.embedBody || !item) return;

    const isDrive = item.source === 'gdrive';
    if (el.embedTitle) el.embedTitle.textContent = item.title || 'Odtwarzacz mediów';
    if (el.embedBadge) {
      el.embedBadge.textContent = isDrive ? 'Dysk Google Audio M4A' : (item.sourceType === 'artist' ? 'Artysta Spotify' : (item.sourceType === 'show' ? 'Podcast Spotify' : 'Album Spotify'));
    }

    if (el.embedExtLink) {
      el.embedExtLink.href = item.directUrl || item.externalUrl || '#';
      el.embedExtLink.textContent = isDrive ? 'Otwórz na Dysku Google ↗' : 'Otwórz w Spotify ↗';
    }

    // Build Sandboxed Iframe with Official Permitted Attributes
    el.embedBody.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = item.embedUrl || 'https://open.spotify.com/embed/artist/3ZgXCNnAllDbNDtzk4jkg6';
    iframe.title = item.title || 'Odtwarzacz mediów';
    iframe.loading = 'lazy';
    iframe.style.width = '100%';
    iframe.style.border = '0';
    iframe.style.display = 'block';

    if (isDrive) {
      iframe.style.height = '240px';
      iframe.allow = 'autoplay';
    } else {
      iframe.style.height = '380px';
      iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    }

    el.embedBody.appendChild(iframe);
    el.embedModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    if (el.embedCloseBtn) el.embedCloseBtn.focus();
  }

  function closeEmbedModal() {
    if (!el.embedModal) return;
    el.embedModal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (el.embedBody) {
      el.embedBody.innerHTML = '';
    }
  }

  function toggleFavorite(id) {
    if (!id) return;
    if (state.favorites.has(id)) {
      state.favorites.delete(id);
    } else {
      state.favorites.add(id);
    }
    persistFavorites();
    updatePlayerFavBtn();

    if (state.activeCategory === 'favorites') {
      renderCatalog();
    } else {
      document.querySelectorAll(`[data-fav-id="${id}"]`).forEach(btn => {
        btn.classList.toggle('is-active', state.favorites.has(id));
      });
    }
  }

  function updatePlayerFavBtn() {
    if (!el.playerFavBtn || !state.activeDeckItem) return;
    const isFav = state.favorites.has(state.activeDeckItem.id);
    el.playerFavBtn.classList.toggle('is-active', isFav);
    el.playerFavBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
  }

  function recordHistory(item) {
    if (!item || !item.id) return;
    state.history = state.history.filter(h => h.id !== item.id);
    state.history.unshift({
      id: item.id,
      title: item.title,
      author: item.author || 'Christian Culture',
      coverUrl: item.coverUrl,
      source: item.source,
      lastPlayed: new Date().toISOString()
    });
    persistHistory();
    renderContinueListening();
  }

  // Render Functions
  function renderAll() {
    renderCatalog();
    renderContinueListening();
    renderTopics();

    // Default mount initial album if available
    if (state.catalog && state.catalog.spotifyAlbums && state.catalog.spotifyAlbums.length) {
      const initialDeck = state.catalog.spotifyAlbums.find(a => a.embedUrl) || state.catalog.spotifyAlbums[0];
      mountDeckItem(initialDeck, false);
    }
  }

  function renderCatalog() {
    if (!state.catalog || !el.spotifyGrid) return;

    const query = state.searchQuery;
    const cat = state.activeCategory;

    // Build the master items list (1 Artist + 15 Albums)
    let items = [];
    if (state.catalog.spotifyArtist) items.push(...state.catalog.spotifyArtist);
    if (state.catalog.spotifyAlbums) items.push(...state.catalog.spotifyAlbums);

    // Filter by Category
    if (cat === 'artist') {
      items = items.filter(i => i.sourceType === 'artist');
    } else if (cat === 'music') {
      items = items.filter(i => i.sourceType === 'album');
    } else if (cat === 'favorites') {
      items = items.filter(i => state.favorites.has(i.id));
    } else if (cat === 'podcast') {
      // Focus is on podcast stage above
      items = [];
    } else if (cat === 'gdrive') {
      // Focus is on gdrive stage above
      items = [];
    }

    // Filter by Search Query
    if (query) {
      items = items.filter(item =>
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.summary && item.summary.toLowerCase().includes(query)) ||
        (item.author && item.author.toLowerCase().includes(query))
      );
    }

    renderCardsGrid(items);
  }

  function renderCardsGrid(items) {
    if (!el.spotifyGrid) return;

    if (!items.length) {
      if (state.searchQuery) {
        el.spotifyGrid.innerHTML = `
          <div class="cc-omni-bridge-box" style="grid-column: 1 / -1; padding: 28px; text-align: center; background: rgba(13, 32, 49, 0.5); border: 1px dashed var(--cc-gold-muted); border-radius: 14px;">
            <p style="color: #cbd5e1; margin-bottom: 12px; font-size: 15px;">Nie znaleziono w lokalnej dyskografii: <strong>"${escapeHtml(state.searchQuery)}"</strong></p>
            <button id="podcast-omni-search-btn" class="cc-omni-bridge-btn" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 999px; background: var(--cc-gold); color: #071321; font-weight: 600; font-size: 14px; border: none; cursor: pointer; min-height: 44px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span>Szukaj "${escapeHtml(state.searchQuery)}" w całym ekosystemie Christian Culture (@w)</span>
            </button>
          </div>
        `;
        const omniBtn = el.spotifyGrid.querySelector('#podcast-omni-search-btn');
        if (omniBtn) {
          omniBtn.addEventListener('click', () => {
            if (window.CCOmniSearch && typeof window.CCOmniSearch.openSearch === 'function') {
              window.CCOmniSearch.openSearch(state.searchQuery);
            } else {
              window.location.href = '/szukaj?q=' + encodeURIComponent(state.searchQuery);
            }
          });
        }
      } else {
        el.spotifyGrid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 32px; text-align: center; color: #8da2b5; font-size: 15px; background: rgba(13, 32, 49, 0.4); border-radius: 14px; border: 1px dashed var(--cc-border);">
            Brak albumów spełniających wybrane kryteria. Skorzystaj z filtrów powyżej lub posłuchaj oficjalnego podcastu.
          </div>
        `;
      }
      return;
    }

    el.spotifyGrid.innerHTML = items.map(item => {
      const isFav = state.favorites.has(item.id);
      const isDeckActive = state.activeDeckItem && state.activeDeckItem.id === item.id;
      const isArtist = item.sourceType === 'artist';
      const badgeText = isArtist ? 'Artysta Spotify' : 'Album Spotify';

      return `
        <article class="cc-catalog-card ${isDeckActive ? 'is-deck-active' : ''}" data-item-id="${escapeHtml(item.id)}" role="region" aria-label="${escapeHtml(item.title)}">
          <div class="cc-card-thumb-wrap">
            <img src="${escapeHtml(item.coverUrl)}" alt="${escapeHtml(item.title)}" class="cc-card-thumb" loading="lazy" />
            <span class="cc-card-badge">${escapeHtml(badgeText)}</span>
          </div>
          <h4 class="cc-card-title">${escapeHtml(item.title)}</h4>
          <span class="cc-card-author">${escapeHtml(item.author || 'Christian Culture')}</span>
          <div class="cc-card-footer" style="display: flex; gap: 8px; align-items: center; margin-top: 12px;">
            <button class="cc-card-btn-play" data-action="deck" title="Załaduj do odtwarzacza powyżej">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Odtwórz tutaj</span>
            </button>
            <button class="cc-card-btn-modal" data-action="modal" title="Powiększ odtwarzacz w oknie" aria-label="Powiększ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            </button>
            <button class="cc-btn-share" data-action="share" title="Udostępnij album" aria-label="Udostępnij ${escapeHtml(item.title)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            </button>
            <button class="cc-ep-action-btn ${isFav ? 'is-active' : ''}" data-fav-id="${escapeHtml(item.id)}" aria-label="Dodaj do ulubionych" aria-pressed="${isFav}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Attach real click handlers to cards and buttons
    el.spotifyGrid.querySelectorAll('.cc-catalog-card').forEach(card => {
      const iid = card.dataset.itemId;
      const item = items.find(i => i.id === iid);
      if (!item) return;

      card.addEventListener('click', (e) => {
        // Favorite button
        if (e.target.closest('[data-fav-id]')) {
          e.stopPropagation();
          toggleFavorite(iid);
          return;
        }

        // Modal button
        if (e.target.closest('[data-action="modal"]')) {
          e.stopPropagation();
          openEmbedModal(item);
          return;
        }

        // Share button
        if (e.target.closest('[data-action="share"]')) {
          e.stopPropagation();
          const shareUrl = `${window.location.origin}/podcasty?album=${encodeURIComponent(iid)}`;
          shareItem(
            `${item.title} • Christian Culture`,
            `Posłuchaj oficjalnego wydania ${item.title} w portalu podcastów i muzyki CC:`,
            shareUrl
          );
          return;
        }

        // Deck play button or clicking card body
        mountDeckItem(item, true);
      });
    });
  }

  function renderContinueListening() {
    if (!el.continueList) return;

    // Fallback list of key materials if history is empty
    let list = state.history;
    if (!list.length && state.catalog) {
      list = [
        {
          id: 'spotify-show-6rSWpk7dO4TSQM0KXlcMXg',
          title: 'Apokalipsa Podcast',
          author: 'Podcast Spotify (29 odc.)',
          coverUrl: 'https://image-cdn-fa.spotifycdn.com/image/ab6765630000ba8a1a4d8fce7407bd6c623c3cf4',
          jumpTarget: 'podcast-apokalipsa-section'
        },
        {
          id: 'spotify-show-4iMs8lyni0poJEiZNCfRsW',
          title: 'Osobowość Plus Podcast',
          author: 'Podcast Spotify',
          coverUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67656300005f1fe2e99ccefc04913b280d3905',
          jumpTarget: 'podcast-spotify-section'
        },
        {
          id: 'gdrive-14gi3Xclsv8DUNJu58SNU24aGM2VOEbM0',
          title: 'Cyfrowy ekosystem CC',
          author: 'Dysk Google M4A',
          coverUrl: '/assets/podcasts/hero-podcasts.jpg',
          jumpTarget: 'gdrive-audio-section'
        },
        {
          id: 'spotify-album-5cfX59E2Y0xjT7nfj9m8fX',
          title: 'ALPHA',
          author: 'Album Spotify',
          coverUrl: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0283bdfa08c293e823fa0512c8',
          jumpTarget: 'active-music-deck'
        }
      ];
    }

    el.continueList.innerHTML = list.slice(0, 3).map(item => `
      <div class="cc-continue-item" data-continue-id="${escapeHtml(item.id)}" data-jump="${item.jumpTarget || ''}" role="button" tabindex="0">
        <img src="${escapeHtml(item.coverUrl)}" alt="${escapeHtml(item.title)}" class="cc-cont-thumb" loading="lazy" />
        <div class="cc-cont-meta">
          <h5 class="cc-cont-title">${escapeHtml(item.title)}</h5>
          <span class="cc-cont-time">${escapeHtml(item.author || 'Christian Culture')}</span>
        </div>
        <button class="cc-cont-play" aria-label="Wybierz ${escapeHtml(item.title)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
      </div>
    `).join('');

    el.continueList.querySelectorAll('.cc-continue-item').forEach(card => {
      card.addEventListener('click', () => {
        const cid = card.dataset.continueId;
        const jump = card.dataset.jump;

        if (jump) {
          document.getElementById(jump)?.scrollIntoView({ behavior: 'smooth' });
          return;
        }

        // Find in albums or artist
        let matched = state.catalog?.spotifyAlbums?.find(a => a.id === cid) ||
                      state.catalog?.spotifyArtist?.find(a => a.id === cid);
        if (matched) {
          mountDeckItem(matched, true);
        } else if (cid && (cid.includes('6rSWpk7dO4TSQM0KXlcMXg') || cid.includes('apokalipsa'))) {
          document.getElementById('podcast-apokalipsa-section')?.scrollIntoView({ behavior: 'smooth' });
        } else if (cid && cid.includes('4iMs8lyni0poJEiZNCfRsW')) {
          document.getElementById('podcast-spotify-section')?.scrollIntoView({ behavior: 'smooth' });
        } else if (cid && cid.includes('14gi3Xclsv8DUNJu58SNU24aGM2VOEbM0')) {
          document.getElementById('gdrive-audio-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function renderTopics() {
    if (!el.topicsList || !state.catalog || !state.catalog.topics) return;
    const topics = state.catalog.topics;

    el.topicsList.innerHTML = topics.map(t => {
      const topicName = t.title || 'Temat';
      const topicSlug = t.id ? t.id.replace('topic-', '') : topicName;

      return `
        <div class="cc-topic-pill" data-topic-name="${escapeHtml(topicName)}" role="button" tabindex="0">
          <div class="cc-topic-bg" style="background-image: url('${escapeHtml(t.coverUrl)}');"></div>
          <div class="cc-topic-content">
            <span class="cc-topic-icon">${escapeHtml(t.icon || '🎙️')}</span>
            <span>#${escapeHtml(topicName)}</span>
          </div>
          <span style="font-size: 11px; color: var(--cc-gold); z-index: 2; font-weight: 600;">↗</span>
        </div>
      `;
    }).join('');

    el.topicsList.querySelectorAll('.cc-topic-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const name = pill.dataset.topicName;
        if (el.searchInput) {
          el.searchInput.value = name;
          state.searchQuery = name.toLowerCase();
          if (el.searchClear) el.searchClear.style.display = 'block';
          renderCatalog();
        }
      });
      pill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') pill.click();
      });
    });
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CCPodcastsApp = {
    state,
    mountDeckItem,
    openEmbedModal,
    closeEmbedModal,
    handleDeepLinking,
    shareItem,
    showToast
  };
})();
