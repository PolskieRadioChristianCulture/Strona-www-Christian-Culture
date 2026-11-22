/**
 * ============================================================================
 * Biblia Audio Christian Culture — Oficjalny Odtwarzacz EkoCC Premium
 * Standard: ZERO COST, EBU R128 (-16 LUFS), Single Active Audio Player
 * ============================================================================
 */

const $ = (s) => document.querySelector(s);
const radioAudio = $('#radioAudio');
const chapterAudio = $('#chapterAudio');
const radioStatus = $('#radioStatus');
const partsContainer = $('#chapterParts');

// Cinema Modal Elements
const cinemaModal = $('#cinemaModal');
const cinemaVideo = $('#cinemaVideo');
const btnOpenCinema = $('#btnOpenCinema');
const closeCinemaModal = $('#closeCinemaModal');

// Custom Chapter Player Elements
const customPlayBtn = $('#customPlayBtn');
const skipBackBtn = $('#skipBackBtn');
const skipFwdBtn = $('#skipFwdBtn');
const seekSlider = $('#seekSlider');
const timeCurrent = $('#timeCurrent');
const timeTotal = $('#timeTotal');

const config = {
  supportUrl: 'https://polskieradio.cc/wspieraj',
  bibleReaderBaseUrl: 'https://polskieradio.cc/mojabiblia',
};

let catalog = [];
let selected = null;
let isSeeking = false;

// Format seconds into MM:SS
function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

async function init() {
  try {
    const res = await fetch('/biblia-audio/data/catalog.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    catalog = await res.json();
    renderChapters();

    const paramId = new URLSearchParams(window.location.search).get('chapter');
    if (paramId) {
      chooseChapter(paramId);
    } else {
      chooseChapter('genesis-1');
    }
  } catch (err) {
    const ch = $('#chapters');
    if (ch) ch.textContent = 'Nie udało się wczytać katalogu nagrań. Odśwież stronę.';
    console.error('[Biblia Audio] Catalog init error:', err);
  }
}

function renderChapters() {
  const searchInput = $('#search');
  const query = searchInput ? searchInput.value.toLocaleLowerCase('pl').trim() : '';
  const container = $('#chapters');
  if (!container) return;
  container.replaceChildren();

  const filtered = catalog.filter((item) => {
    const hay = `${item.chapter} ${item.description}`.toLocaleLowerCase('pl');
    return item.book === 'genesis' && hay.includes(query);
  });

  filtered.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isAct = selected?.id === item.id;
    btn.className = 'chapter' + (isAct ? ' active' : '') + (item.status === 'published' ? ' has-audio' : ' in-prod');
    btn.setAttribute('aria-pressed', isAct ? 'true' : 'false');

    const badgeText = item.status === 'published' ? '▶ Gotowy' : 'W produkcji';
    btn.innerHTML = `
      <div class="chapterHeader">
        <strong>Rozdział ${item.chapter}</strong>
        <span class="badge ${item.status === 'published' ? 'badge-live' : 'badge-soon'}">${badgeText}</span>
      </div>
      <small>${item.description}</small>
    `;

    btn.onclick = () => chooseChapter(item.id);
    container.append(btn);
  });
}

function chooseChapter(id) {
  const item = catalog.find((x) => x.id === id);
  if (!item) return;

  selected = item;
  if (chapterAudio) {
    chapterAudio.dataset.bookCode = (item.book === 'genesis' || !item.book) ? 'GEN' : String(item.book).toUpperCase().slice(0, 6);
    chapterAudio.dataset.chapterNumber = String(item.chapter || 1);
    chapterAudio.dataset.translation = 'UBG';
  }
  $('#chapterTitle').textContent = `Księga Rodzaju — Rozdział ${item.chapter}`;
  $('#chapterDescription').textContent = item.description;

  // Stop active radio
  pauseRadio();

  chapterAudio.pause();
  chapterAudio.removeAttribute('src');
  updateCustomPlayerUI(false, 0, 0);

  if (partsContainer) {
    partsContainer.innerHTML = '';
  }

  const customPlayerBar = $('#customPlayerBar');

  if (item.status === 'published') {
    $('#chapterState').textContent = 'Nagranie studyjne EBU R128 (-16 LUFS) gotowe do emisji.';
    $('#chapterState').className = 'status-published';

    if (item.audioParts && item.audioParts.length > 0) {
      // Rozdział wieloczęściowy (np. Rdz 1 lub 2)
      renderAudioParts(item.audioParts);
      setAudioSource(item.audioParts[0].url);
    } else if (item.audioUrl) {
      if (partsContainer) partsContainer.hidden = true;
      setAudioSource(item.audioUrl);
    }
    if (customPlayerBar) customPlayerBar.hidden = false;
  } else {
    $('#chapterState').textContent = 'Ten rozdział jest obecnie w produkcji studyjnej Biblia Audio. Premiera wkrótce.';
    $('#chapterState').className = 'status-soon';
    if (customPlayerBar) customPlayerBar.hidden = true;
    if (partsContainer) partsContainer.hidden = true;
  }

  $('#readBtn').disabled = !item.textUrl;
  $('#readBtn').title = item.textUrl ? 'Otwórz tekst Pisma Świętego w MojaBiblia' : 'Tekst niedostępny';

  if (window.history && window.history.replaceState) {
    const newUrl = `?chapter=${encodeURIComponent(item.id)}#biblioteka`;
    window.history.replaceState({}, '', newUrl);
  }

  renderChapters();
}

function renderAudioParts(parts) {
  if (!partsContainer) return;
  partsContainer.hidden = false;
  partsContainer.innerHTML = '<span class="partsLabel">Wybierz część rozdziału:</span>';

  const btnGroup = document.createElement('div');
  btnGroup.className = 'partsButtons';

  parts.forEach((p, idx) => {
    const pBtn = document.createElement('button');
    pBtn.type = 'button';
    pBtn.className = 'partBtn' + (idx === 0 ? ' active' : '');
    pBtn.textContent = p.name;
    pBtn.onclick = () => {
      btnGroup.querySelectorAll('.partBtn').forEach((b) => b.classList.remove('active'));
      pBtn.classList.add('active');
      setAudioSource(p.url, true);
    };
    btnGroup.appendChild(pBtn);
  });

  partsContainer.appendChild(btnGroup);
}

function setAudioSource(url, autoPlay = false) {
  chapterAudio.pause();
  chapterAudio.src = url;
  chapterAudio.load();
  updateCustomPlayerUI(false, 0, 0);

  if (autoPlay) {
    pauseRadio();
    chapterAudio.play().catch(() => {});
  }
}

// Single active audio rule: Radio control
function pauseRadio() {
  if (!radioAudio.paused) {
    radioAudio.pause();
    const btn = $('#radioToggle');
    if (btn) {
      btn.textContent = '▶ Włącz radio na żywo';
      btn.setAttribute('aria-pressed', 'false');
    }
    if (radioStatus) radioStatus.textContent = 'Radio zatrzymane';
  }
}

// Custom Player UI update
function updateCustomPlayerUI(isPlaying, current, total) {
  if (customPlayBtn) {
    customPlayBtn.textContent = isPlaying ? 'Ⅱ' : '▶';
    customPlayBtn.setAttribute('aria-label', isPlaying ? 'Zatrzymaj' : 'Odtwórz');
  }
  if (!isSeeking && seekSlider) {
    seekSlider.value = total > 0 ? (current / total) * 100 : 0;
  }
  if (timeCurrent) timeCurrent.textContent = formatTime(current);
  if (timeTotal) timeTotal.textContent = formatTime(total);
}

// Custom Chapter Player Event Listeners
if (customPlayBtn) {
  customPlayBtn.addEventListener('click', () => {
    if (!chapterAudio.src) return;
    if (chapterAudio.paused) {
      pauseRadio();
      closeCinemaIntro();
      chapterAudio.play().catch((e) => console.warn('Play error:', e));
    } else {
      chapterAudio.pause();
    }
  });
}

if (skipBackBtn) {
  skipBackBtn.addEventListener('click', () => {
    if (chapterAudio.src) {
      chapterAudio.currentTime = Math.max(0, chapterAudio.currentTime - 15);
    }
  });
}

if (skipFwdBtn) {
  skipFwdBtn.addEventListener('click', () => {
    if (chapterAudio.src) {
      const max = chapterAudio.duration || 0;
      chapterAudio.currentTime = Math.min(max, chapterAudio.currentTime + 15);
    }
  });
}

if (seekSlider) {
  seekSlider.addEventListener('input', () => {
    isSeeking = true;
    if (chapterAudio.duration) {
      const targetTime = (seekSlider.value / 100) * chapterAudio.duration;
      if (timeCurrent) timeCurrent.textContent = formatTime(targetTime);
    }
  });

  seekSlider.addEventListener('change', () => {
    if (chapterAudio.duration) {
      chapterAudio.currentTime = (seekSlider.value / 100) * chapterAudio.duration;
    }
    isSeeking = false;
  });
}

chapterAudio.addEventListener('play', () => {
  pauseRadio();
  closeCinemaIntro();
  updateCustomPlayerUI(true, chapterAudio.currentTime, chapterAudio.duration);
});

chapterAudio.addEventListener('pause', () => {
  updateCustomPlayerUI(false, chapterAudio.currentTime, chapterAudio.duration);
});

chapterAudio.addEventListener('timeupdate', () => {
  if (!isSeeking) {
    updateCustomPlayerUI(!chapterAudio.paused, chapterAudio.currentTime, chapterAudio.duration);
  }
});

chapterAudio.addEventListener('loadedmetadata', () => {
  updateCustomPlayerUI(!chapterAudio.paused, chapterAudio.currentTime, chapterAudio.duration);
});

chapterAudio.addEventListener('ended', () => {
  updateCustomPlayerUI(false, 0, chapterAudio.duration);
});

// Radio Toggle Listener
const radioToggleBtn = $('#radioToggle');
if (radioToggleBtn) {
  radioToggleBtn.addEventListener('click', async () => {
    if (!radioAudio.paused) {
      pauseRadio();
      return;
    }

    chapterAudio.pause();
    closeCinemaIntro();

    try {
      await radioAudio.play();
      radioToggleBtn.textContent = 'Ⅱ Zatrzymaj radio';
      radioToggleBtn.setAttribute('aria-pressed', 'true');
      if (radioStatus) radioStatus.textContent = 'Radio gra na żywo (24/7)';
    } catch (err) {
      if (radioStatus) radioStatus.textContent = 'Nie udało się uruchomić strumienia. Spróbuj ponownie.';
      console.error('[Radio LIVE] Error:', err);
    }
  });
}

// Dedicated Cinema Intro Modal Control
function openCinemaIntro() {
  pauseRadio();
  chapterAudio.pause();

  if (cinemaModal) {
    cinemaModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  if (cinemaVideo) {
    cinemaVideo.currentTime = 0;
    cinemaVideo.muted = false;
    cinemaVideo.play().catch((err) => {
      console.warn('[Biblia Audio] Cinema play autoplay notice:', err);
    });
  }
}

function closeCinemaIntro() {
  if (cinemaVideo) {
    cinemaVideo.pause();
    cinemaVideo.currentTime = 0;
  }
  if (cinemaModal) {
    cinemaModal.hidden = true;
    document.body.style.overflow = '';
  }
}

if (btnOpenCinema) {
  btnOpenCinema.addEventListener('click', openCinemaIntro);
}

if (closeCinemaModal) {
  closeCinemaModal.addEventListener('click', closeCinemaIntro);
}

if (cinemaVideo) {
  cinemaVideo.addEventListener('ended', closeCinemaIntro);
}

// Escape key closes cinema modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cinemaModal && !cinemaModal.hidden) {
    closeCinemaIntro();
  }
});

// Search input
const searchInput = $('#search');
if (searchInput) {
  searchInput.addEventListener('input', renderChapters);
}

// MojaBiblia Link
const readBtn = $('#readBtn');
if (readBtn) {
  readBtn.onclick = () => {
    if (selected?.textUrl) {
      window.open(selected.textUrl, '_blank', 'noopener,noreferrer');
    }
  };
}

// Sharing URLs
async function shareUrl(url, title) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    }
  } else if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link do nagrania został skopiowany do schowka!');
    } catch {
      window.prompt('Skopiuj link do nagrania:', url);
    }
  } else {
    window.prompt('Skopiuj link do nagrania:', url);
  }
}

function showToast(msg) {
  let toast = $('#ccAudioToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ccAudioToast';
    toast.className = 'audioToast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3200);
}

for (const id of ['shareTop', 'shareBottom']) {
  const el = $('#' + id);
  if (el) {
    el.onclick = () => shareUrl('https://polskieradio.cc/biblia-audio', 'Biblia Audio Christian Culture');
  }
}

const shareChapterBtn = $('#shareChapter');
if (shareChapterBtn) {
  shareChapterBtn.onclick = () => {
    const shareTitle = selected
      ? `Księga Rodzaju ${selected.chapter} — Biblia Audio Christian Culture`
      : 'Biblia Audio Christian Culture';
    shareUrl(window.location.href, shareTitle);
  };
}

const supportLink = $('#supportLink');
if (supportLink && config.supportUrl) {
  supportLink.href = config.supportUrl;
}

init();
