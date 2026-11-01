/**
 * Cezary Rogowski — Autorska Strona Osobista (CC PASSION V1.0)
 * Interakcje, audioplayer, a11y focus trap & mobile menu
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.getElementById('navigation');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Zamknij menu' : 'Otwórz menu');
    });

    // Close on navigation link click
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Otwórz menu');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Otwórz menu');
        menuButton.focus();
      }
    });
  }

  // 2. Dynamic Year
  const yearElem = document.getElementById('currentYear');
  if (yearElem) {
    yearElem.textContent = String(new Date().getFullYear());
  }

  // 3. Search button trigger CC Omni-Search
  const searchBtn = document.getElementById('headerSearchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      if (typeof window.ccOmniSearchOpen === 'function') {
        window.ccOmniSearchOpen();
      } else {
        const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
        document.dispatchEvent(event);
      }
    });
  }

  // 4. Audio Archive Loader (Only genuine author tracks)
  const tracksContainer = document.getElementById('tracksList');
  if (tracksContainer) {
    const tracksUrl = tracksContainer.getAttribute('data-tracks-src') || '/CezaryRogowski/tracks.json';
    fetch(tracksUrl)
      .then((res) => (res.ok ? res.json() : []))
      .then((tracks) => {
        if (!Array.isArray(tracks) || tracks.length === 0) {
          return;
        }

        tracksContainer.innerHTML = '';
        tracks.forEach((track, index) => {
          if (!track || typeof track.title !== 'string' || typeof track.file !== 'string') return;
          // Security path verification
          if (!/^(\/|assets\/audio\/|audio\/)[\w.\-\/]+\.(mp3|m4a|ogg|wav)$/.test(track.file)) return;

          const trackItem = document.createElement('div');
          trackItem.className = 'track-item';

          const label = document.createElement('label');
          label.htmlFor = `audio-track-${index}`;
          label.textContent = track.title;

          const audio = document.createElement('audio');
          audio.id = `audio-track-${index}`;
          audio.controls = true;
          audio.preload = 'none';
          audio.src = track.file;

          trackItem.appendChild(label);
          trackItem.appendChild(audio);
          tracksContainer.appendChild(trackItem);
        });
      })
      .catch(() => {
        // Gracefully ignore fetch errors
      });
  }

  // 5. Your Imagination Studio Modal Dialog
  const openModalBtn = document.getElementById('openStudioModalBtn');
  const closeModalBtn = document.getElementById('closeStudioModalBtn');
  const studioModal = document.getElementById('studioModal');
  const modalVideo = document.getElementById('studioModalVideo');

  if (openModalBtn && studioModal) {
    const openModal = () => {
      if (typeof studioModal.showModal === 'function') {
        studioModal.showModal();
      } else {
        studioModal.setAttribute('open', '');
      }
      document.body.style.overflow = 'hidden';
      if (closeModalBtn) closeModalBtn.focus();
    };

    const closeModal = () => {
      if (typeof studioModal.close === 'function') {
        studioModal.close();
      } else {
        studioModal.removeAttribute('open');
      }
      document.body.style.overflow = '';
      if (modalVideo && !modalVideo.paused) {
        modalVideo.pause();
      }
      openModalBtn.focus();
    };

    openModalBtn.addEventListener('click', openModal);

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeModal);
    }

    // Dismiss on click outside modal surface
    studioModal.addEventListener('click', (e) => {
      const rect = studioModal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeModal();
      }
    });

    // Close on Escape & pause video
    studioModal.addEventListener('cancel', () => {
      document.body.style.overflow = '';
      if (modalVideo && !modalVideo.paused) {
        modalVideo.pause();
      }
    });
  }

  // 6. Radio Play/Stop Toggle (integrates with /milion counter via cc-radio-milion.js)
  const crRadioBtn = document.getElementById('crRadioBtn');
  const crRadioAudio = document.getElementById('crRadioAudio');
  const crRadioLabel = crRadioBtn ? crRadioBtn.querySelector('.cr-radio-label') : null;

  if (crRadioBtn && crRadioAudio) {
    let crIsPlaying = false;
    const STREAM_URL = 'https://stream.zeno.fm/vz96pvl3pnktv';

    const setPlayingState = (playing) => {
      crIsPlaying = playing;
      crRadioBtn.setAttribute('aria-pressed', String(playing));
      crRadioBtn.setAttribute(
        'aria-label',
        playing ? 'Zatrzymaj Radio Christian Culture' : 'Włącz Radio Christian Culture'
      );
      if (crRadioLabel) {
        crRadioLabel.textContent = playing ? 'Stop radia' : 'Słuchaj radia';
      }
    };

    crRadioBtn.addEventListener('click', () => {
      if (crIsPlaying) {
        crRadioAudio.pause();
        crRadioAudio.src = ''; // release stream / save bandwidth
        setPlayingState(false);
      } else {
        crRadioAudio.src = STREAM_URL;
        crRadioAudio.play().catch(() => {
          setPlayingState(false);
        });
        setPlayingState(true);
      }
    });

    crRadioAudio.addEventListener('ended', () => setPlayingState(false));
    crRadioAudio.addEventListener('error', () => setPlayingState(false));
    crRadioAudio.addEventListener('pause', () => {
      if (crIsPlaying) setPlayingState(false);
    });
  }

  // 7. Song Showcase Player (Polish & English Premier Tracks)
  const formatSongTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const PLAY_ICON_SVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
  const PAUSE_ICON_SVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';

  const VOL_ON_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>';
  const VOL_MUTE_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';

  const songPlayers = [
    {
      id: 'Pl',
      audio: document.getElementById('audioPl'),
      playBtn: document.getElementById('playBtnPl'),
      progressWrap: document.getElementById('progressWrapPl'),
      progressFill: document.getElementById('progressFillPl'),
      curTime: document.getElementById('curTimePl'),
      durTime: document.getElementById('durTimePl'),
      muteBtn: document.getElementById('muteBtnPl'),
      title: 'Cokolwiek na świecie'
    },
    {
      id: 'En',
      audio: document.getElementById('audioEn'),
      playBtn: document.getElementById('playBtnEn'),
      progressWrap: document.getElementById('progressWrapEn'),
      progressFill: document.getElementById('progressFillEn'),
      curTime: document.getElementById('curTimeEn'),
      durTime: document.getElementById('durTimeEn'),
      muteBtn: document.getElementById('muteBtnEn'),
      title: "WHAT CAN SEPARATE ME FROM GOD'S LOVE?"
    }
  ];

  const pauseAllSongs = (exceptAudio) => {
    songPlayers.forEach((sp) => {
      if (sp.audio && sp.audio !== exceptAudio && !sp.audio.paused) {
        sp.audio.pause();
      }
    });
  };

  // If radio plays, pause songs
  if (crRadioAudio) {
    crRadioAudio.addEventListener('play', () => {
      pauseAllSongs(null);
    });
  }

  songPlayers.forEach((sp) => {
    if (!sp.audio || !sp.playBtn) return;

    const updatePlayBtnState = (isPlaying) => {
      sp.playBtn.innerHTML = isPlaying ? PAUSE_ICON_SVG : PLAY_ICON_SVG;
      sp.playBtn.setAttribute('aria-pressed', String(isPlaying));
      sp.playBtn.setAttribute('aria-label', (isPlaying ? 'Wstrzymaj utwór: ' : 'Odtwórz utwór: ') + sp.title);
    };

    sp.playBtn.addEventListener('click', () => {
      if (sp.audio.paused) {
        // Pause other song
        pauseAllSongs(sp.audio);
        // Pause radio if playing
        if (crRadioAudio && !crRadioAudio.paused) {
          crRadioAudio.pause();
        }
        sp.audio.play().then(() => {
          updatePlayBtnState(true);
        }).catch(() => {
          updatePlayBtnState(false);
        });
      } else {
        sp.audio.pause();
        updatePlayBtnState(false);
      }
    });

    sp.audio.addEventListener('play', () => updatePlayBtnState(true));
    sp.audio.addEventListener('pause', () => updatePlayBtnState(false));
    sp.audio.addEventListener('ended', () => {
      updatePlayBtnState(false);
      if (sp.progressFill) sp.progressFill.style.width = '0%';
      if (sp.curTime) sp.curTime.textContent = '0:00';
    });

    const setDuration = () => {
      if (sp.durTime && !isNaN(sp.audio.duration) && sp.audio.duration > 0) {
        sp.durTime.textContent = formatSongTime(sp.audio.duration);
      }
    };
    sp.audio.addEventListener('loadedmetadata', setDuration);
    sp.audio.addEventListener('durationchange', setDuration);
    if (sp.audio.readyState >= 1) setDuration();

    sp.audio.addEventListener('timeupdate', () => {
      if (sp.curTime) {
        sp.curTime.textContent = formatSongTime(sp.audio.currentTime);
      }
      if (sp.progressFill && sp.audio.duration) {
        const pct = (sp.audio.currentTime / sp.audio.duration) * 100;
        sp.progressFill.style.width = pct + '%';
        if (sp.progressWrap) {
          sp.progressWrap.setAttribute('aria-valuenow', Math.round(pct).toString());
        }
      }
    });

    if (sp.progressWrap) {
      const seekFromEvent = (e) => {
        if (!sp.audio.duration) return;
        const rect = sp.progressWrap.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        sp.audio.currentTime = pct * sp.audio.duration;
      };

      sp.progressWrap.addEventListener('click', seekFromEvent);

      sp.progressWrap.addEventListener('keydown', (e) => {
        if (!sp.audio.duration) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          sp.audio.currentTime = Math.min(sp.audio.duration, sp.audio.currentTime + 5);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          sp.audio.currentTime = Math.max(0, sp.audio.currentTime - 5);
        }
      });
    }

    if (sp.muteBtn) {
      sp.muteBtn.innerHTML = VOL_ON_SVG;
      sp.muteBtn.addEventListener('click', () => {
        sp.audio.muted = !sp.audio.muted;
        sp.muteBtn.innerHTML = sp.audio.muted ? VOL_MUTE_SVG : VOL_ON_SVG;
        sp.muteBtn.setAttribute('aria-label', sp.audio.muted ? 'Włącz dźwięk' : 'Wycisz dźwięk');
      });
    }
  });

  // Tab switching (PL / EN)
  const tabBtns = document.querySelectorAll('.song-tab-btn');
  const songPanels = document.querySelectorAll('.song-panel');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;

      tabBtns.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      songPanels.forEach((p) => {
        p.classList.remove('is-active');
        p.style.display = 'none';
      });

      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('is-active');
        targetPanel.style.display = 'block';
      }
    });
  });

  // Copy lyrics buttons
  const setupCopyBtn = (btnId, textContainerId) => {
    const btn = document.getElementById(btnId);
    const container = document.getElementById(textContainerId);
    if (!btn || !container) return;

    const labelSpan = btn.querySelector('span') || btn;
    const defaultText = labelSpan.textContent;

    const fallbackCopyText = (text) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch (_) {}
      document.body.removeChild(ta);
    };

    btn.addEventListener('click', () => {
      const stanzas = container.querySelectorAll('.lyrics-stanza');
      const textToCopy = Array.from(stanzas)
        .map((s) => s.innerText.trim())
        .filter(Boolean)
        .join('\n\n');

      if (!textToCopy) return;

      const finishCopy = () => {
        btn.classList.add('is-copied');
        labelSpan.textContent = 'Skopiowano!';
        setTimeout(() => {
          btn.classList.remove('is-copied');
          labelSpan.textContent = defaultText;
        }, 2000);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(finishCopy).catch(() => {
          fallbackCopyText(textToCopy);
          finishCopy();
        });
      } else {
        fallbackCopyText(textToCopy);
        finishCopy();
      }
    });
  };

  setupCopyBtn('copyLyricsPl', 'lyricsTextPl');
  setupCopyBtn('copyLyricsEn', 'lyricsTextEn');

  // 8. Collapsible Lyrics Toggles (Rozwijane na życzenie)
  const setupLyricsToggle = (btnId, cardId, defaultLabel, activeLabel) => {
    const btn = document.getElementById(btnId);
    const card = document.getElementById(cardId);
    if (!btn || !card) return;

    const labelSpan = btn.querySelector('.toggle-lyrics-label') || btn;

    const toggle = (forceOpen) => {
      const isCurrentlyOpen = btn.getAttribute('aria-expanded') === 'true';
      const nextOpen = forceOpen !== undefined ? forceOpen : !isCurrentlyOpen;

      btn.setAttribute('aria-expanded', String(nextOpen));
      card.style.display = nextOpen ? 'block' : 'none';
      labelSpan.textContent = nextOpen ? activeLabel : defaultLabel;
    };

    btn.addEventListener('click', () => toggle());

    const closeBtns = card.querySelectorAll('[data-close-target]');
    closeBtns.forEach((cb) => {
      cb.addEventListener('click', () => {
        toggle(false);
        btn.focus();
        btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  };

  setupLyricsToggle(
    'toggleLyricsPl',
    'lyricsCardPl',
    'Rozwiń tekst pieśni do śpiewania ↓',
    'Zwiń tekst pieśni ↑'
  );

  setupLyricsToggle(
    'toggleLyricsEn',
    'lyricsCardEn',
    'Rozwiń tekst pieśni (English) ↓',
    'Zwiń tekst pieśni ↑'
  );
});
