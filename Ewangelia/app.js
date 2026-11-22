import { createAudioVisualizer } from './visualizer.js?v=20261022_v4';

document.addEventListener('DOMContentLoaded', () => {
  const listenRecordingBtn = document.querySelector('.listen-recording');
  if (listenRecordingBtn) {
    listenRecordingBtn.addEventListener('click', (e) => {
      const audioEl = document.getElementById('audio');
      if (audioEl && audioEl.paused) {
        audioEl.play().catch(() => {});
      }
    });
  }
  const $ = (id) => document.getElementById(id);
  let activeDict = null;

  // ── 1. ELEMENTY DOM DLA DOBREJ NOWINY (MP3) ──
  const audio = $('audio');
  const seek = $('seek');
  const wave = $('wave');
  const player = $('audio-player');
  const buttons = [...document.querySelectorAll('[data-toggle]')];
  const status = $('feedback');
  const base = 'https://polskieradio.cc/Ewangelia';
  const visualizer = createAudioVisualizer(audio, wave);
  visualizer.setEnabled(true);
  const waveToggle = $('waveToggle');
  if (waveToggle) {
    function updateWaveToggle() {
      waveToggle.setAttribute('aria-pressed', String(visualizer.getEnabled()));
      waveToggle.textContent = visualizer.getEnabled() ? 'Wyłącz wskaźniki dźwięku' : 'Włącz wskaźniki dźwięku';
    }
    waveToggle.onclick = () => {
      visualizer.setEnabled(!visualizer.getEnabled());
      updateWaveToggle();
    };
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', updateWaveToggle);
    updateWaveToggle();
  }

  function time(n) {
    if (!Number.isFinite(n)) return '--:--';
    return Math.floor(n / 60) + ':' + String(Math.floor(n % 60)).padStart(2, '0');
  }

  function notice(t) {
    if (!status) return;
    status.textContent = t;
    clearTimeout(notice.timer);
    notice.timer = setTimeout(() => {
      status.textContent = '';
    }, 6000);
  }

  function uiPlay(on) {
    if (player) player.classList.toggle('is-playing', on);
    buttons.forEach((b) => {
      b.textContent = on ? 'Ⅱ' : '▶';
      b.setAttribute('aria-label', on ? 'Pauza' : 'Odtwórz');
    });
  }

  // ── 2. LIVE RADIO STREAM & LICZNIK /milion INTEGRACJA ──
  const radioCtaBtn = $('radioCtaBtn');
  const ccRadioAudio = $('ccRadioAudio');
  const radioCtaLabel = radioCtaBtn ? radioCtaBtn.querySelector('.radio-cta-label') : null;
  const STREAM_URL = 'https://stream.zeno.fm/vz96pvl3pnktv';
  let isRadioPlaying = false;
  let radioRequested = false;

  function stopRadio() {
    radioRequested = false;
    ccRadioAudio.pause();
    ccRadioAudio.removeAttribute('src');
    ccRadioAudio.load();
    setRadioPlayingState(false);
    radioCtaBtn.dataset.state = 'idle';
  }

  const setRadioPlayingState = (playing) => {
    isRadioPlaying = playing;
    if (radioCtaBtn) {
      radioCtaBtn.setAttribute('aria-pressed', String(playing));
      radioCtaBtn.setAttribute(
        'aria-label',
        playing ? 'Zatrzymaj Radio Christian Culture' : 'Włącz Radio Christian Culture na żywo'
      );
    }
    if (radioCtaLabel) {
      radioCtaLabel.textContent = playing ? (activeDict?.hero?.radioStop || 'Stop Radia CC') : (activeDict?.hero?.radioPlay || 'Słuchaj Radia CC');
    }
  };

  if (radioCtaBtn && ccRadioAudio) {
    radioCtaBtn.addEventListener('click', () => {
      if (radioRequested) {
        stopRadio();
      } else {
        // Wzajemne wykluczenie: zatrzymaj odtwarzanie pliku MP3, jeśli gra
        if (audio && !audio.paused) {
          audio.pause();
        }
        radioRequested = true;
        radioCtaBtn.dataset.state = 'loading';
        radioCtaLabel.textContent = 'Łączenie z Radiem CC…';
        radioCtaBtn.setAttribute('aria-label', 'Anuluj łączenie z Radiem CC');
        ccRadioAudio.src = STREAM_URL;
        ccRadioAudio.play().catch(() => {
          if (!radioRequested) return;
          radioRequested = false;
          setRadioPlayingState(false);
          radioCtaBtn.dataset.state = 'error';
          notice('Nie udało się uruchomić strumienia radia. Spróbuj ponownie za chwilę.');
        });
      }
    });

    ccRadioAudio.addEventListener('playing', () => {
      if (!radioRequested) return;
      radioCtaBtn.dataset.state = 'playing';
      setRadioPlayingState(true);
    });
    ccRadioAudio.addEventListener('waiting', () => {
      if (!radioRequested) return;
      setRadioPlayingState(false);
      radioCtaBtn.dataset.state = 'loading';
      radioCtaLabel.textContent = 'Buforowanie Radia CC…';
    });
    ccRadioAudio.addEventListener('ended', stopRadio);
    ccRadioAudio.addEventListener('error', () => {
      if (!radioRequested) return;
      stopRadio();
      radioCtaBtn.dataset.state = 'error';
      notice('Nie udało się połączyć z Radiem CC. Spróbuj ponownie.');
    });
    ccRadioAudio.addEventListener('pause', () => {
      if (isRadioPlaying) setRadioPlayingState(false);
    });
  }

  // ── 3. ZARZĄDZANIE ODTWARZANIEM MP3 ──
  if (audio) {
    buttons.forEach((b) =>
      b.addEventListener('click', async () => {
        if (audio.paused) {
          // Wzajemne wykluczenie: zatrzymaj strumień radia na żywo, jeśli gra
          if (radioRequested && ccRadioAudio) stopRadio();
          try {
            await visualizer.prepare();
            await audio.play();
          } catch (e) {
            notice('Nie udało się rozpocząć odtwarzania. Sprawdź ustawienia przeglądarki.');
          }
        } else {
          audio.pause();
        }
      })
    );

    audio.addEventListener('play', () => {
      uiPlay(true);
      if (radioRequested && ccRadioAudio) stopRadio();
    });

    audio.addEventListener('pause', () => uiPlay(false));
    audio.addEventListener('ended', () => uiPlay(false));

    function updateDuration() {
      const end = $('endTime');
      if (end) end.textContent = time(audio.duration);
    }
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    updateDuration();

    audio.addEventListener('timeupdate', () => {
      if (!seek) return;
      const v = audio.duration ? Math.floor((audio.currentTime / audio.duration) * 1000) : 0;
      seek.value = String(v);
      seek.setAttribute('aria-valuetext', time(audio.currentTime) + ' z ' + time(audio.duration));
      seek.style.setProperty('--prog', v / 10 + '%');
      const cur = $('curTime');
      if (cur) cur.textContent = time(audio.currentTime);
    });

    audio.addEventListener('error', () => {
      notice('Brak dostępu do pliku nagrania MP3. Sprawdź połączenie.');
    });

    if (seek) {
      seek.addEventListener('input', () => {
        if (audio.duration) {
          audio.currentTime = (audio.duration * Number(seek.value)) / 1000;
        }
      });
    }

    const rewindBtn = $('rewind');
    if (rewindBtn) rewindBtn.onclick = () => { audio.currentTime = Math.max(0, audio.currentTime - 15); };

    const prevBtn = $('prev');
    if (prevBtn) prevBtn.onclick = () => { audio.currentTime = 0; };

    const nextBtn = $('next');
    if (nextBtn) nextBtn.onclick = () => { audio.currentTime = Math.min(audio.duration || 1e20, audio.currentTime + 15); };

    const repeatBtn = $('repeat');
    if (repeatBtn) {
      repeatBtn.onclick = () => {
        audio.loop = !audio.loop;
        repeatBtn.setAttribute('aria-pressed', String(audio.loop));
        repeatBtn.style.color = audio.loop ? '#ffdfaa' : 'white';
      };
    }

    const rateBtn = $('rate');
    if (rateBtn) {
      rateBtn.onclick = () => {
        const r = [1, 1.25, 1.5, 1.75, 2, 0.75];
        audio.playbackRate = r[(r.indexOf(audio.playbackRate) + 1) % r.length];
        rateBtn.textContent = audio.playbackRate + '×';
      };
    }

    const muteBtn = $('mute');
    if (muteBtn) {
      muteBtn.onclick = () => {
        audio.muted = !audio.muted;
        muteBtn.textContent = audio.muted ? '×' : '♬';
        muteBtn.setAttribute('aria-label', audio.muted ? 'Włącz dźwięk' : 'Wycisz');
        muteBtn.setAttribute('aria-pressed', String(audio.muted));
      };
    }

    const vol = $('vol');
    if (vol) {
      vol.oninput = (e) => {
        audio.volume = Number(e.target.value);
        audio.muted = false;
        if (muteBtn) {
          muteBtn.textContent = '♬';
          muteBtn.setAttribute('aria-label', 'Wycisz');
          muteBtn.setAttribute('aria-pressed', 'false');
        }
      };
    }
  }

  // ── 4. ULUBIONE ──
  function renderFavorite() {
    const b = $('fav');
    const s = $('save');
    const newValue = Boolean(window.CCFavorites?.getFavorites().some(item => item.id === 'ewangelia'));
    if (!b) return;
    b.setAttribute('aria-pressed', String(newValue));
    b.textContent = newValue ? '♥' : '♡';
    if (s) {
      const saveLabel = newValue ? '♥  Dodano do ulubionych' : (activeDict?.player?.favorite || 'Dodaj do ulubionych');
      const saveSpan = s.querySelector('span');
      if (saveSpan) {
        saveSpan.textContent = saveLabel;
      } else {
        s.textContent = newValue ? '♥  Dodano do ulubionych' : ('♡  ' + saveLabel);
      }
      s.setAttribute('aria-pressed', String(newValue));
    }
  }
  async function favorite() {
    if (!window.CCFavorites) return notice('Ulubione są chwilowo niedostępne. Spróbuj ponownie.');
    await window.CCFavorites.toggleFavorite();
    renderFavorite();
    // The shared module owns persistence. Do not promise cloud confirmation here.
  }
  window.CCFavorites?.onFavoritesChange(renderFavorite);
  renderFavorite();

  const favBtn = $('fav');
  if (favBtn) favBtn.onclick = favorite;
  const saveBtn = $('save');
  if (saveBtn) saveBtn.onclick = favorite;

  // ── 5. UDOSTĘPNIANIE & MEDIA SPOŁECZNOŚCIOWE ──
  async function share(url) {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Dobra Nowina — Radio CC', url });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      notice('Link do nagrania został skopiowany do schowka.');
    } catch (e) {
      notice('Adres do udostępnienia: ' + url);
    }
  }

  const shareBtn = $('share');
  if (shareBtn) shareBtn.onclick = () => share(base);
  const copyBtn = $('copy');
  if (copyBtn) copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(base);
      notice('Link do nagrania został skopiowany.');
    } catch { notice('Adres do udostępnienia: ' + base); }
  };

  const fb = $('fb');
  if (fb) fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(base);
  const x = $('x');
  if (x) x.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent('Dobra Nowina — Radio CC') + '&url=' + encodeURIComponent(base);
  const wa = $('wa');
  if (wa) wa.href = 'https://api.whatsapp.com/send?text=' + encodeURIComponent('Posłuchaj Dobrej Nowiny: ' + base);
  const ms = $('ms');
  if (ms) {
    ms.href = 'https://www.facebook.com/dialog/send?link=' + encodeURIComponent(base) + '&app_id=0&redirect_uri=' + encodeURIComponent(base);
    ms.addEventListener('click', (e) => {
      e.preventDefault();
      share(base);
    });
  }

  // ── 6. CC OMNI-SEARCH @w ──
  const searchBtn = $('searchBtn');
  if (searchBtn) {
    searchBtn.onclick = () => {
      if (typeof window.ccOmniSearchOpen === 'function') {
        window.ccOmniSearchOpen();
      } else {
        location.href = 'https://polskieradio.cc/szukaj';
      }
    };
  }

  // ── 7. ROK W STOPCE ──
  const menu = $('siteMenu');
  const menuToggle = $('menuToggle');
  menuToggle.onclick = () => menu.showModal();
  $('menuClose').onclick = () => menu.close();
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) menu.close();
    if (event.target === menu) {
      const box = menu.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) menu.close();
    }
  });
  menu.addEventListener('close', () => menuToggle.focus());
  const yearEl = $('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());


  // ── 8. SYSTEM MULTIJĘZYCZNY I OBSŁUGA MODLITWY ODDANIA ŻYCIA ──
  function initI18n(EWANGELIA_I18N) {
    if (!EWANGELIA_I18N) return;
    function getNestedValue(obj, path) {
      if (!obj || !path) return undefined;
      return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
    }

    function getInitialLang() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && EWANGELIA_I18N[urlLang.toLowerCase()]) {
          return urlLang.toLowerCase();
        }
        const savedLang = localStorage.getItem('cc_ewangelia_lang');
        if (savedLang && EWANGELIA_I18N[savedLang]) {
          return savedLang;
        }
        const browserLang = (navigator.language || '').slice(0, 2).toLowerCase();
        if (browserLang && EWANGELIA_I18N[browserLang]) {
          return browserLang;
        }
      } catch (e) {}
      return 'pl';
    }

    function renderPrayerStanzas(stanzas) {
      const container = $('prayerStanzas');
      if (!container || !stanzas) return;
      container.innerHTML = stanzas.map((stanza) => {
        const isCulmination = stanza.isCulmination ? ' is-culmination' : '';
        const paragraphsHtml = stanza.paragraphs.map(p => '<p>' + p + '</p>').join('');
        return '<div class="prayer-stanza' + isCulmination + '">' +
          '<h3 class="prayer-stanza-title">' + stanza.heading + '</h3>' +
          '<div class="prayer-stanza-body">' + paragraphsHtml + '</div>' +
          '</div>';
      }).join('');
    }

    function renderPromises(promises) {
      const list = $('promisesList');
      if (!list || !promises) return;
      list.innerHTML = promises.map(pr => '<li>' + pr + '</li>').join('');
    }

    function setLanguage(lang) {
      if (!EWANGELIA_I18N[lang]) lang = 'pl';
      try {
        localStorage.setItem('cc_ewangelia_lang', lang);
        const url = new URL(window.location.href);
        if (lang === 'pl') {
          url.searchParams.delete('lang');
        } else {
          url.searchParams.set('lang', lang);
        }
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}

      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      const dict = EWANGELIA_I18N[lang];
      activeDict = dict;

      const langCurrent = $('topbarLangCurrent');
      if (langCurrent) langCurrent.textContent = lang.toUpperCase();

      // Meta & Title
      if (dict.metaTitle) document.title = dict.metaTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && dict.metaDescription) metaDesc.setAttribute('content', dict.metaDescription);

      // Update all elements with data-i18n
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        const val = getNestedValue(dict, key);
        if (val !== undefined) {
          el.innerHTML = val;
        }
      });

      // Update active states on language buttons
      document.querySelectorAll('[data-lang]').forEach((btn) => {
        const isSelected = btn.getAttribute('data-lang') === lang;
        btn.classList.toggle('is-active', isSelected);
        btn.setAttribute('aria-pressed', String(isSelected));
      });

      // Refresh dynamically rendered controls
      if (!radioRequested) setRadioPlayingState(false);
      renderFavorite();

      // Render dynamic stanzas and promises
      if (dict.prayer && dict.prayer.stanzas) {
        renderPrayerStanzas(dict.prayer.stanzas);
      }
      if (dict.prayer && dict.prayer.aftermath && dict.prayer.aftermath.promises) {
        renderPromises(dict.prayer.aftermath.promises);
      }
    }

    const langSwitcher = $('topbarLangSwitcher');
    if (langSwitcher) {
      document.addEventListener('click', (event) => {
        if (langSwitcher.open && !langSwitcher.contains(event.target)) {
          langSwitcher.removeAttribute('open');
        }
      });
    }

    // Bind click handlers for all language buttons and pills
    document.querySelectorAll('[data-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
        if (langSwitcher) langSwitcher.removeAttribute('open');
        if (menu && menu.open) menu.close();
      });
    });

    // Initialize
    setLanguage(getInitialLang());
  }

  if (typeof window !== 'undefined' && window.EWANGELIA_I18N) {
    initI18n(window.EWANGELIA_I18N);
  }
});
