(() => {
  'use strict';

  const DATA_URL = '/data/spiewajmy-panu-meta.json';
  let dataset = null;
  let filteredSongs = [];
  let activeSong = null;
  let activeFilter = 'all';
  let lyricsScale = Number(localStorage.getItem('cc_spiewnik_scale') || '1.28');

  const $ = (id) => document.getElementById(id);
  const searchInput = $('songSearchInput');
  const categorySelect = $('categorySelect');
  const songList = $('songList');
  const listStats = $('listStats');
  const songStage = $('songStage');

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l')
      .trim();
  }

  function applyScale() {
    lyricsScale = Math.max(0.95, Math.min(2.2, lyricsScale));
    document.documentElement.style.setProperty('--lyrics-size', `${lyricsScale.toFixed(2)}rem`);
    try { localStorage.setItem('cc_spiewnik_scale', lyricsScale.toFixed(2)); } catch {}
  }

  function renderCategories() {
    if (!dataset?.categories) return;
    categorySelect.innerHTML = '<option value="">Wszystkie 41 kategorii tematycznych</option>';
    for (const c of dataset.categories) {
      const opt = document.createElement('option');
      opt.value = String(c.id);
      opt.textContent = `${c.id}. ${c.name} (${c.from}–${c.to})`;
      categorySelect.appendChild(opt);
    }
  }

  function filterSongs() {
    if (!dataset?.songs) return;
    const q = norm(searchInput.value);
    const catId = Number(categorySelect.value || 0);

    filteredSongs = dataset.songs.filter((s) => {
      if (activeFilter === 'audio' && !s.audioUrl) return false;
      if (activeFilter === 'sabbath' && !(s.number >= 92 && s.number <= 127)) return false;
      if (activeFilter === 'pd' && s.licenseStatus !== 'public_domain') return false;
      if (catId && s.categoryId !== catId) return false;
      if (!q) return true;
      if (String(s.number) === q) return true;
      if (norm(s.title).includes(q)) return true;
      if (norm(s.author).includes(q) || norm(s.category).includes(q)) return true;
      return Array.isArray(s.stanzas) && s.stanzas.some((st) => norm(st.text).includes(q));
    });

    listStats.textContent = `Wyświetlono ${filteredSongs.length} z ${dataset.totalSongs} pieśni (nagrania MP3: ${dataset.audioCount || 0})`;
    renderList();
  }

  function renderList() {
    const frag = document.createDocumentFragment();
    const visible = filteredSongs.slice(0, 200);
    for (const s of visible) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sp-list-btn' + (activeSong && activeSong.number === s.number ? ' is-active' : '');
      btn.dataset.songNum = String(s.number);

      const numBadge = document.createElement('span');
      numBadge.className = 'sp-num-badge';
      numBadge.textContent = String(s.number);

      const meta = document.createElement('span');
      meta.className = 'sp-list-meta';
      const titleEl = document.createElement('span');
      titleEl.className = 'sp-list-title';
      titleEl.textContent = (s.audioUrl ? '🎧 ' : '') + s.title;
      const catEl = document.createElement('span');
      catEl.className = 'sp-list-cat';
      catEl.textContent = `${s.category}${s.key ? ' · Tonacja ' + s.key : ''}`;

      meta.append(titleEl, catEl);
      btn.append(numBadge, meta);
      btn.addEventListener('click', () => selectSong(s.number, true));
      li.appendChild(btn);
      frag.appendChild(li);
    }

    if (filteredSongs.length > 200) {
      const info = document.createElement('li');
      info.className = 'sp-stats';
      info.textContent = `Pokazano pierwsze 200 wyników — zawęź wyszukiwanie lub wpisz numer pieśni.`;
      frag.appendChild(info);
    }

    songList.replaceChildren(frag);
  }

  function selectSong(num, updateHash = false) {
    if (!dataset?.songs) return;
    const song = dataset.songs.find((s) => s.number === Number(num)) || dataset.songs[0];
    if (!song) return;
    activeSong = song;

    if (updateHash) {
      try { history.replaceState(null, '', `#nr=${song.number}`); } catch {}
    }

    songList.querySelectorAll('.sp-list-btn').forEach((b) => {
      b.classList.toggle('is-active', Number(b.dataset.songNum) === song.number);
    });

    const wrap = document.createElement('div');

    // Header
    const head = document.createElement('div');
    head.className = 'sp-song-head';

    const badges = document.createElement('div');
    badges.className = 'sp-song-badges';
    const bNum = document.createElement('span');
    bNum.className = 'sp-pill';
    bNum.textContent = `Pieśń nr ${song.number}`;
    badges.appendChild(bNum);

    if (song.key) {
      const bKey = document.createElement('span');
      bKey.className = 'sp-pill';
      bKey.textContent = `Tonacja: ${song.key}`;
      badges.appendChild(bKey);
    }

    const bCat = document.createElement('span');
    bCat.className = 'sp-pill';
    bCat.textContent = `${song.section} · ${song.category}`;
    badges.appendChild(bCat);

    const h2 = document.createElement('h2');
    h2.className = 'sp-song-title';
    h2.textContent = song.title;

    head.append(badges, h2);

    if (song.author) {
      const pAuth = document.createElement('p');
      pAuth.className = 'sp-song-author';
      pAuth.textContent = `Autor / przekład: ${song.author}`;
      head.appendChild(pAuth);
    }

    // Audio player if MP3 available
    if (song.audioUrl) {
      const audioBox = document.createElement('div');
      audioBox.className = 'sp-audio-box';

      const row = document.createElement('div');
      row.className = 'sp-audio-row';
      const label = document.createElement('strong');
      label.textContent = `🎧 Nagranie studyjne Christian Culture (${song.audioSourceAlbum || 'Śpiewajmy Panu'})`;
      const playBtn = document.createElement('button');
      playBtn.type = 'button';
      playBtn.className = 'sp-cta-orange';
      playBtn.textContent = '▶ Śpiewaj z nagraniem';

      const audioEl = document.createElement('audio');
      audioEl.controls = true;
      audioEl.preload = 'none';
      audioEl.src = song.audioUrl;

      playBtn.addEventListener('click', () => {
        if (audioEl.paused) {
          audioEl.play().catch(() => {});
          playBtn.textContent = '⏸ Pauza';
        } else {
          audioEl.pause();
          playBtn.textContent = '▶ Śpiewaj z nagraniem';
        }
      });
      audioEl.addEventListener('pause', () => { playBtn.textContent = '▶ Śpiewaj z nagraniem'; });
      audioEl.addEventListener('play', () => { playBtn.textContent = '⏸ Pauza'; });

      row.append(label, playBtn);
      audioBox.append(row, audioEl);
      head.appendChild(audioBox);
    }

    wrap.appendChild(head);

    // Stanzas (wyłącznie dla utworów z potwierdzonym prawem / Domena publiczna)
    const stanzasWrap = document.createElement('div');
    stanzasWrap.className = 'sp-stanzas';
    if (song.lyricsPublicAllowed && Array.isArray(song.stanzas) && song.stanzas.length) {
      for (const st of song.stanzas) {
        const box = document.createElement('section');
        box.className = 'sp-stanza' + (st.type === 'chorus' ? ' is-chorus' : '');
        const lbl = document.createElement('span');
        lbl.className = 'sp-stanza-label';
        lbl.textContent = st.type === 'chorus' ? 'Refren' : `Zwrotka ${st.label}`;
        const txt = document.createElement('p');
        txt.className = 'sp-stanza-text';
        txt.textContent = st.text;
        box.append(lbl, txt);
        stanzasWrap.appendChild(box);
      }
    } else {
      const box = document.createElement('section');
      box.className = 'sp-stanza is-chorus';
      const lbl = document.createElement('span');
      lbl.className = 'sp-stanza-label';
      lbl.textContent = '🛠️ W przygotowaniu — ochrona praw autorskich';
      const txt = document.createElement('p');
      txt.className = 'sp-stanza-text';
      txt.style.fontSize = '1rem';
      txt.textContent = 'Pełny tekst tej pieśni nie jest wyświetlany publicznie do czasu formalnego potwierdzenia licencji z wydawcą. Metadane katalogowe, tonacja oraz oficjalne źródło pozostają dostępne poniżej.';
      const ext = document.createElement('a');
      ext.href = song.officialUrl || 'https://muzycy.adwent.pl/';
      ext.target = '_blank';
      ext.rel = 'noopener noreferrer';
      ext.className = 'sp-cta-orange';
      ext.style.marginTop = '12px';
      ext.style.textDecoration = 'none';
      ext.textContent = '↗ Oficjalny śpiewnik i prawa (muzycy.adwent.pl)';
      box.append(lbl, txt, ext);
      stanzasWrap.appendChild(box);
    }
    wrap.appendChild(stanzasWrap);

    // License info
    const lic = dataset.licenses?.[song.licenseId];
    const licBox = document.createElement('div');
    licBox.className = 'sp-license-box';
    const isPd = song.licenseStatus === 'public_domain';
    licBox.innerHTML = isPd
      ? `<strong>Status prawny:</strong> Domena publiczna · Źródło katalogowe: <a href="https://muzycy.adwent.pl/" target="_blank" rel="noopener noreferrer">muzycy.adwent.pl</a>.`
      : `<strong>Status prawny:</strong> ${lic?.rightsHolder || 'Śpiewnik KADS — do potwierdzenia licencji przed komercyjną redystrybucją'} · Oficjalne informacje: <a href="https://muzycy.adwent.pl/" target="_blank" rel="noopener noreferrer">muzycy.adwent.pl</a>.`;
    wrap.appendChild(licBox);

    songStage.replaceChildren(wrap);
  }

  function stepSong(delta) {
    if (!dataset?.songs || !activeSong) return;
    const list = filteredSongs.length ? filteredSongs : dataset.songs;
    const idx = list.findIndex((s) => s.number === activeSong.number);
    const nextIdx = (idx + delta + list.length) % list.length;
    selectSong(list[nextIdx].number, true);
  }

  function initControls() {
    applyScale();
    const savedTheme = localStorage.getItem('cc_spiewnik_theme') || 'dark';
    document.documentElement.dataset.theme = savedTheme;

    $('themeToggleBtn').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('cc_spiewnik_theme', next); } catch {}
    });

    $('fontUpBtn').addEventListener('click', () => { lyricsScale += 0.14; applyScale(); });
    $('fontDownBtn').addEventListener('click', () => { lyricsScale -= 0.14; applyScale(); });
    $('prevSongBtn').addEventListener('click', () => stepSong(-1));
    $('nextSongBtn').addEventListener('click', () => stepSong(1));

    $('fullscreenBtn').addEventListener('click', () => {
      document.body.classList.toggle('is-sing-fullscreen');
      if (document.body.classList.contains('is-sing-fullscreen') && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    });

    $('askAiBtn').addEventListener('click', () => {
      if (!activeSong) return;
      const prompt = `Opowiedz o biblijnym przesłaniu pieśni nr ${activeSong.number} „${activeSong.title}” ze śpiewnika Śpiewajmy Panu i podaj pasujące wersety z Biblii UBG.`;
      if (window.CCLumiMes && typeof window.CCLumiMes.openWithContext === 'function') {
        window.CCLumiMes.openWithContext({
          appId: 'spiewajmy-panu',
          route: `/spiewnik-biblijny/#nr=${activeSong.number}`,
          contextType: 'hymn',
          hymn: { number: activeSong.number, title: activeSong.title, key: activeSong.key },
          suggestions: [
            `Jakie wersety UBG pasują do pieśni nr ${activeSong.number}?`,
            'Wyjaśnij teologiczne przesłanie tej pieśni',
            'Zaproponuj inną pieśń na dzień sobotni'
          ]
        });
      } else {
        window.open(`/ai/aplikacja?q=${encodeURIComponent(prompt)}`, '_blank', 'noopener,noreferrer');
      }
    });

    searchInput.addEventListener('input', filterSongs);
    categorySelect.addEventListener('change', filterSongs);
    document.querySelectorAll('.sp-filter').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter || 'all';
        document.querySelectorAll('.sp-filter').forEach((b) => b.classList.toggle('is-active', b === btn));
        filterSongs();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (document.activeElement === searchInput) return;
      if (e.key === 'ArrowRight') stepSong(1);
      if (e.key === 'ArrowLeft') stepSong(-1);
    });
  }

  async function boot() {
    initControls();
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      dataset = await res.json();
      renderCategories();

      const params = new URLSearchParams(location.search);
      const qParam = params.get('szukaj') || params.get('q');
      if (qParam) searchInput.value = qParam;

      filterSongs();

      const hashMatch = location.hash.match(/nr=(\d{1,3})/i);
      const queryNr = params.get('nr');
      const initialNum = Number(hashMatch?.[1] || queryNr || 1);
      selectSong(initialNum, false);
    } catch (err) {
      songStage.innerHTML = `<p>Nie udało się wczytać śpiewnika (${String(err?.message || err)}). Spróbuj odświeżyć stronę.</p>`;
    }
  }

  boot();
})();
