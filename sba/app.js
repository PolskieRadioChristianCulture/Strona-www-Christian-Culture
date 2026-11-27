import { loadBible, loadRecordings, officialTrack, site, inEcosystem } from './data.js?v=1';

const $ = (query) => document.querySelector(query);
const icons = {
  book: '<path d="M12 6c-3-3-7-3-10-1v14c3-2 7-2 10 1 3-3 7-3 10-1V5c-3-2-7-2-10 1zm0 0v14"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
  user: '<circle cx="12" cy="8" r="3"/><path d="M5 20v-2a7 7 0 0 1 14 0v2"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l1.5-4A8.5 8.5 0 1 1 21 11.5zM8 11h8m-8 4h5"/>',
  play: '<path d="m9 5 11 7-11 7z"/>',
  pause: '<path d="M7 5h3v14H7zM14 5h3v14h-3z"/>',
  music: '<path d="M9 18V5l12-2v13M9 18a3 2 0 1 1-6 0 3 2 0 0 1 6 0zm12-2a3 2 0 1 1-6 0 3 2 0 0 1 6 0z"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>'
};

function icon(node, name) {
  node.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">' + icons[name] + '</svg>';
}

function element(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  if (tag === 'button') node.type = 'button';
  return node;
}

function iconButton(name, label, handler) {
  const button = element('button', 'icon');
  icon(button, name);
  button.setAttribute('aria-label', label);
  button.title = label;
  button.addEventListener('click', handler);
  return button;
}

const feed = $('#verses');
const dialog = $('#dialog');
const dialogContent = $('#dialog-content');
const audio = $('#audio');
const playButton = $('#play');
const seek = $('#seek');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const stations = [
  { type: 'radio', title: 'Biblia Audio Christian Culture', url: 'https://stream.zeno.fm/gn3uhltrrytuv' },
  { type: 'radio', title: 'Polskie Radio Christian Culture', url: 'https://stream.zeno.fm/vz96pvl3pnktv' },
  { type: 'radio', title: 'Christian Culture Global', url: 'https://stream.zeno.fm/umej2cuqncluv' }
];
let bible;
let recordings = new Map();
let recordingsState = 'loading';
let cards = [];
let active = -1;
let pool = [];
let orderIndex = 0;
let scrollTimer;
let toastTimer;
let pressTimer;
let pressOrigin;
let settings = readLocal('cc-biblia-ubg-verses-v1') || {};
let audioMode = readLocal('cc-biblia-ubg-audio-v1') === 'voice' ? 'voice' : 'automatic';
let playingTrack = null;
let speech = null;
let playerError = '';
let returningFocus;

for (const item of document.querySelectorAll('[data-icon]')) icon(item, item.dataset.icon);

function readLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    notify('Przeglądarka blokuje zapis na urządzeniu.');
  }
}

function notify(message) {
  const toast = $('#toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toastTimer = setTimeout(() => { toast.textContent = ''; }, 2400);
}

const ref = (verse) => verse.name + ' ' + verse.chapter + ':' + verse.number;
const chapterRef = (verse) => verse.name + ' ' + verse.chapter;
const selected = () => cards[active]?.verse;

function shuffleVerses() {
  pool = [...bible.verses];
  for (let index = pool.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swap]] = [pool[swap], pool[index]];
  }
  orderIndex = 0;
}

function draw() {
  if (orderIndex === pool.length) shuffleVerses();
  return pool[orderIndex++];
}

function addCards(count, initial = null) {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < count; index++) {
    let verse = index === 0 && initial ? initial : draw();
    if (!initial || index !== 0) {
      while (pool.length > 1 && verse.key === cards.at(-1)?.verse.key) verse = draw();
    }
    const card = element('article', 'verse' + (verse.text.length > 175 ? ' long' : ''));
    card.setAttribute('aria-hidden', 'true');
    const body = element('div', 'body');
    const quote = element('blockquote');
    const actions = element('div', 'verse-actions');
    const favorite = iconButton('heart', 'Zapisz werset', () => toggleFavorite(verse));
    const more = iconButton('more', 'Opcje wersetu', () => openVerseMenu(verse));
    actions.append(favorite, more);
    body.append(element('div', 'ref', ref(verse) + ' · UBG'), quote, actions);
    card.append(body);
    const entry = { verse, card, quote, favorite, more };
    paintVerse(entry);
    cards.push(entry);
    fragment.append(card);
  }
  feed.append(fragment);
}

function paintVerse(entry) {
  const value = settings[entry.verse.key];
  if (value?.marked) {
    entry.quote.replaceChildren(element('mark', '', entry.verse.text));
  } else {
    entry.quote.textContent = entry.verse.text;
  }
  const label = value?.saved ? 'Usuń z ulubionych wersetów' : 'Dodaj werset do ulubionych';
  entry.favorite.setAttribute('aria-label', label);
  entry.favorite.setAttribute('aria-pressed', String(Boolean(value?.saved)));
  entry.favorite.title = label;
}

function updateVerse(verse, change) {
  const value = { ...settings[verse.key], ...change };
  if (!value.saved && !value.marked && !value.note) delete settings[verse.key];
  else settings[verse.key] = value;
  saveLocal('cc-biblia-ubg-verses-v1', settings);
  cards.filter((entry) => entry.verse.key === verse.key).forEach(paintVerse);
}

function toggleFavorite(verse) {
  const saved = !settings[verse.key]?.saved;
  updateVerse(verse, { saved });
  notify(saved ? 'Zapisano w ulubionych wersetach.' : 'Usunięto z ulubionych wersetów.');
}

function activate(index) {
  if (index === active || !cards[index]) return;
  const old = cards[active];
  if (old) {
    old.card.classList.remove('active');
    old.card.setAttribute('aria-hidden', 'true');
  }
  active = index;
  const entry = cards[index];
  entry.card.classList.add('active');
  entry.card.removeAttribute('aria-hidden');
  $('#verse-announcement').textContent = ref(entry.verse) + '. ' + entry.verse.text;
  $('#previous').disabled = index === 0;
  if (old) $('#edge').hidden = false;
  playerError = '';
  if (!isPlaying() && playingTrack?.type !== 'radio' && playingTrack?.verse.key !== entry.verse.key) stopPlayback();
  updatePlayer();
  if (active >= cards.length - 4) addCards(12);
}

// Only near the last active element is normally inspected. Binary search handles jumps.
function nearestCard() {
  if (!cards.length) return 0;
  const center = feed.scrollTop + feed.clientHeight / 2;
  let first = 0;
  let last = cards.length - 1;
  while (first < last) {
    const middle = Math.floor((first + last) / 2);
    const card = cards[middle].card;
    if (card.offsetTop + card.offsetHeight < center) first = middle + 1;
    else last = middle;
  }
  return first;
}

function settleScroll() {
  const next = nearestCard();
  activate(next);
  // Limit DOM growth while retaining a substantial backwards history.
  if (cards.length > 108 && active > 75) {
    const removed = cards.splice(0, 48);
    const previousTop = cards[active - removed.length].card.offsetTop;
    const previousScroll = feed.scrollTop;
    const snapStyle = feed.style.scrollSnapType;
    feed.style.scrollSnapType = 'none';
    removed.forEach(({ card }) => card.remove());
    active -= removed.length;
    feed.scrollTop = previousScroll - (previousTop - cards[active].card.offsetTop);
    requestAnimationFrame(() => { feed.style.scrollSnapType = snapStyle; });
  }
}

function goTo(index, instant = false) {
  if (index >= cards.length) addCards(12);
  const card = cards[index]?.card;
  if (!card) return;
  feed.scrollTo({ top: card.offsetTop + (card.offsetHeight - feed.clientHeight) / 2, behavior: instant || reduceMotion.matches ? 'instant' : 'smooth' });
  if (instant) activate(index);
}

function layout() {
  feed.style.setProperty('--verse-space', Math.round(feed.clientHeight * .43) + 'px');
  feed.style.paddingBlock = Math.max(0, (feed.clientHeight * .57) / 2) + 'px';
  if (active >= 0) goTo(active, true);
}

feed.addEventListener('scroll', () => {
  clearPress();
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(settleScroll, 125);
}, { passive: true });
feed.addEventListener('scrollend', () => {
  clearTimeout(scrollTimer);
  settleScroll();
});
$('#previous').addEventListener('click', () => goTo(active - 1));
$('#next').addEventListener('click', () => goTo(active + 1));
feed.addEventListener('keydown', (event) => {
  if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)) return;
  event.preventDefault();
  goTo(active + (['ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1));
});
new ResizeObserver(() => {
  if (!feed.hidden) layout();
}).observe(feed);

function clearPress() {
  clearTimeout(pressTimer);
  pressOrigin = null;
}

feed.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0 || !event.target.closest('.verse.active') || event.target.closest('button')) return;
  pressOrigin = [event.clientX, event.clientY];
  const verse = selected();
  pressTimer = setTimeout(() => {
    clearPress();
    if (selected() === verse) openVerseMenu(verse);
  }, 510);
});
feed.addEventListener('pointermove', (event) => {
  if (pressOrigin && Math.hypot(event.clientX - pressOrigin[0], event.clientY - pressOrigin[1]) > 10) clearPress();
});
for (const type of ['pointerup', 'pointercancel', 'pointerleave']) feed.addEventListener(type, clearPress);
feed.addEventListener('contextmenu', (event) => {
  if (!event.target.closest('.verse.active') || event.target.closest('button')) return;
  event.preventDefault();
  clearPress();
  if (!dialog.open && selected()) openVerseMenu(selected());
});

function show(title, items) {
  $('#dialog-title').textContent = title;
  dialogContent.replaceChildren(...items);
  if (!dialog.open) {
    returningFocus = document.activeElement;
    dialog.showModal();
  }
  dialog.scrollTop = 0;
  $('#close').focus();
}
$('#close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => {
  if (returningFocus?.isConnected && !returningFocus.closest('[aria-hidden=true]')) returningFocus.focus({ preventScroll: true });
  else feed.focus({ preventScroll: true });
});

function row(title, handler) {
  const button = element('button', 'menu-row', title);
  button.addEventListener('click', handler);
  return button;
}
function link(title, url) {
  const anchor = element('a', 'menu-row', title);
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener';
  return anchor;
}

function mojaBiblia(verse) {
  const url = site('/mojabiblia');
  url.search = new URLSearchParams({ book: verse.book, ch: verse.chapter, chapter: verse.chapter, mode: 'reader', verse: verse.number });
  return url;
}

function verseLink(verse) {
  const url = new URL(location.href);
  if (inEcosystem) url.pathname = '/sba';
  url.search = '';
  url.hash = 'werset=' + verse.key;
  return url;
}

function verseQuote(verse) {
  return '„' + verse.text + '” — ' + ref(verse) + ' (UBG)';
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    notify('Skopiowano.');
  } catch {
    const input = element('textarea');
    input.value = text;
    input.readOnly = true;
    input.setAttribute('aria-label', 'Tekst do skopiowania');
    show('Skopiuj tekst', [input]);
    input.focus();
    input.select();
  }
}

async function share(verse) {
  const link = verseLink(verse);
  try {
    if (navigator.share) {
      await navigator.share({ title: ref(verse) + ' · UBG', text: verseQuote(verse), url: link.href });
      return;
    }
  } catch (error) {
    if (error.name === 'AbortError') return;
  }
  await copy(verseQuote(verse) + '\n' + link.href);
}

function showContext(verse) {
  const chapter = bible.chapters.get(verse.book + '.' + verse.chapter);
  const nodes = chapter.map((item) => {
    const paragraph = element('p', 'context-verse' + (item.key === verse.key ? ' active' : ''));
    paragraph.append(element('strong', '', String(item.number) + ' '), document.createTextNode(item.text));
    if (item.key === verse.key) paragraph.setAttribute('aria-current', 'true');
    return paragraph;
  });
  show(chapterRef(verse) + ' · UBG', [link('Otwórz rozdział w MojaBiblia', mojaBiblia(verse)), ...nodes]);
  dialogContent.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest' });
}

function showNote(verse) {
  const input = element('textarea');
  input.maxLength = 2500;
  input.value = settings[verse.key]?.note || '';
  input.placeholder = 'Twoja prywatna notatka…';
  input.setAttribute('aria-label', 'Notatka do wersetu');
  show('Notatka · ' + ref(verse), [input, row('Zapisz notatkę', () => {
    dialog.close();
    updateVerse(verse, { note: input.value.trim() });
    notify('Zapisano notatkę na tym urządzeniu.');
  })]);
  input.focus();
}

function showAsk(verse) {
  const question = 'Pomóż mi zrozumieć ten werset w kontekście całego rozdziału: ' + verseQuote(verse) + '. Wyjaśnij kontekst i wskaż powiązane fragmenty Biblii.';
  const preview = element('textarea');
  preview.value = question;
  preview.readOnly = true;
  preview.setAttribute('aria-label', 'Gotowe pytanie do skopiowania');
  show('Zapytaj AI dla Jezusa', [
    element('p', '', 'Skopiuj pytanie i wklej je w aplikacji AI dla Jezusa.'),
    preview, row('Skopiuj pytanie', async (event) => {
      const button = event.currentTarget;
      try {
        await navigator.clipboard.writeText(question);
        button.textContent = 'Skopiowano pytanie';
      } catch {
        preview.focus();
        preview.select();
      }
    }),
    link('Otwórz AI dla Jezusa', site('/ai/aplikacja'))
  ]);
}

function openVerseMenu(verse) {
  const saved = settings[verse.key];
  const recording = officialTrack(recordings, verse);
  const search = site('/szukaj');
  search.searchParams.set('q', ref(verse));
  show(ref(verse), [
    row(saved?.marked ? 'Usuń podkreślenie' : 'Podkreśl werset', () => {
      dialog.close();
      updateVerse(verse, { marked: !saved?.marked });
    }),
    row(saved?.saved ? 'Usuń z ulubionych wersetów' : 'Dodaj werset do ulubionych', () => { dialog.close(); toggleFavorite(verse); }),
    row('Udostępnij werset', () => { dialog.close(); void share(verse); }),
    row('Kopiuj tekst wersetu', () => { dialog.close(); void copy(verseQuote(verse)); }),
    row('Czytaj kontekst rozdziału', () => showContext(verse)),
    link('Otwórz ten werset w MojaBiblia', mojaBiblia(verse)),
    row('Odczytaj ten werset głosem urządzenia', () => { dialog.close(); startVoice(verse); }),
    ...(recording ? [row('Odtwórz nagranie Christian Culture', () => {
      dialog.close();
      void startMedia(recording);
    })] : []),
    row(saved?.note ? 'Edytuj notatkę' : 'Dodaj notatkę', () => showNote(verse)),
    link('Wyszukaj ten fragment w Christian Culture', search),
    link('Otwórz Wyszukiwarkę Christian Culture', site('/wyszukiwarka')),
    row('Zapytaj AI dla Jezusa o ten fragment', () => showAsk(verse))
  ]);
}

$('#saved-verses').addEventListener('click', () => {
  const saved = bible ? Object.keys(settings).filter((key) => settings[key]?.saved && bible.byKey.has(key)) : [];
  show('Ulubione wersety', saved.length ? saved.map((key) => {
    const verse = bible.byKey.get(key);
    return row(ref(verse) + ' · ' + verse.text, () => {
      dialog.close();
      const existing = cards.findIndex((entry) => entry.verse.key === key);
      if (existing >= 0) goTo(existing, true);
      else {
        const index = cards.length;
        addCards(4, verse);
        goTo(index, true);
      }
    });
  }) : [element('p', '', 'Zapisane wersety pojawią się tutaj.')]);
});

const hasSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const canSpeakPolish = () => hasSpeech && (!speechSynthesis.getVoices().length || speechSynthesis.getVoices().some((voice) => /^pl(?:-|_|$)/i.test(voice.lang)));
const isPlaying = () => Boolean(speech) || (!audio.paused && !audio.ended);
const formatTime = (time) => Math.floor(time / 60) + ':' + String(Math.floor(time % 60)).padStart(2, '0');

function stopPlayback() {
  playingTrack = null;
  if (speech) {
    speech = null;
    speechSynthesis.cancel();
  }
  if (audio.hasAttribute('src')) {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  }
}

function trackFor(verse, mode = audioMode) {
  if (!verse) return null;
  if (mode === 'automatic') {
    const recording = officialTrack(recordings, verse);
    if (recording) return recording;
  }
  return canSpeakPolish() ? { type: 'voice', verse } : null;
}

function updatePlayer() {
  const track = playingTrack || trackFor(selected());
  const recorded = track?.type === 'recording';
  const radio = track?.type === 'radio';
  const live = isPlaying();
  let title = 'Biblia Audio';
  if (recorded) title = chapterRef(track.verse);
  if (radio) title = track.title;
  if (track?.type === 'voice') title = 'Czytanie wersetu';
  let detail = 'Brak nagrania i polskiego głosu urządzenia.';
  if (!bible || (!track && recordingsState === 'loading')) detail = 'Wczytuję katalog nagrań…';
  else if (recorded) detail = track.range ? 'Nagranie CC · wersety ' + track.range : 'Biblia Audio · nagranie rozdziału';
  else if (radio) detail = 'Radio na żywo · ' + (live ? 'połączono' : 'wstrzymane');
  else if (track) detail = (recordingsState === 'failed' ? 'Katalog audio niedostępny · ' : '') + 'Głos urządzenia · UBG';
  if (track?.verse && live && track.verse.key !== selected()?.key) detail += ' · poprzedni fragment';
  $('#track-title').textContent = title;
  $('#track-detail').textContent = playerError || detail;
  playButton.disabled = !track;
  $('#audio-options').disabled = !selected();
  playButton.setAttribute('aria-label', live ? (speech ? 'Zatrzymaj czytanie' : 'Wstrzymaj nagranie') : 'Odtwórz');
  icon(playButton, live ? 'pause' : 'play');
  $('#progress').hidden = !recorded;
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  seek.disabled = !recorded || !duration;
  seek.max = duration || 1;
  seek.value = audio.currentTime || 0;
  $('#elapsed').textContent = formatTime(audio.currentTime || 0);
  $('#duration').textContent = formatTime(duration);
}

function startVoice(verse) {
  if (!canSpeakPolish()) {
    notify('Na tym urządzeniu brakuje polskiego głosu.');
    return;
  }
  stopPlayback();
  playerError = '';
  playingTrack = { type: 'voice', verse };
  const utterance = new SpeechSynthesisUtterance(verse.text);
  utterance.lang = 'pl-PL';
  const polishVoice = speechSynthesis.getVoices().find((voice) => /^pl(?:-|_|$)/i.test(voice.lang));
  if (polishVoice) utterance.voice = polishVoice;
  utterance.rate = .91;
  const finished = (error = false) => {
    if (speech !== utterance) return;
    speech = null;
    playingTrack = null;
    if (error) playerError = 'Nie udało się odczytać tekstu głosem urządzenia.';
    updatePlayer();
  };
  utterance.onend = () => finished();
  utterance.onerror = () => finished(true);
  speech = utterance;
  speechSynthesis.speak(utterance);
  updatePlayer();
}

async function startMedia(track) {
  playerError = '';
  if (audio.getAttribute('src') !== track.url) {
    stopPlayback();
    audio.src = track.url;
  }
  playingTrack = track;
  updatePlayer();
  try {
    await audio.play();
  } catch (error) {
    if (error.name === 'AbortError' || playingTrack !== track) return;
    stopPlayback();
    playerError = track.type === 'radio' ? 'Nie udało się połączyć z radiem. Wybierz stację ponownie.' : 'Nie udało się uruchomić nagrania. Spróbuj ponownie lub wybierz głos urządzenia.';
  }
  updatePlayer();
}

playButton.addEventListener('click', () => {
  if (speech) stopPlayback();
  else if (isPlaying()) {
    audio.pause();
    if (playingTrack?.type !== 'radio' && playingTrack?.verse.key !== selected()?.key) stopPlayback();
  } else {
    const track = playingTrack || trackFor(selected());
    if (track?.type === 'voice') startVoice(track.verse);
    if (track?.type === 'recording' || track?.type === 'radio') void startMedia(track);
  }
  updatePlayer();
});
seek.addEventListener('input', () => { if (!seek.disabled) audio.currentTime = Number(seek.value); });
for (const event of ['play', 'pause', 'timeupdate', 'durationchange', 'loadedmetadata']) audio.addEventListener(event, updatePlayer);
audio.addEventListener('ended', () => {
  if (playingTrack?.type !== 'radio' && playingTrack?.verse.key !== selected()?.key) stopPlayback();
  updatePlayer();
});
audio.addEventListener('error', () => {
  if (!audio.hasAttribute('src')) return;
  const failedTrack = playingTrack;
  stopPlayback();
  if (failedTrack?.type === 'radio') playingTrack = failedTrack;
  playerError = failedTrack?.type === 'radio' ? 'Radio jest chwilowo niedostępne.' : 'Nagranie jest chwilowo niedostępne.';
  updatePlayer();
});
if (hasSpeech) speechSynthesis.addEventListener('voiceschanged', updatePlayer);

function setAudioMode(mode) {
  audioMode = mode;
  saveLocal('cc-biblia-ubg-audio-v1', mode);
  stopPlayback();
  playerError = '';
  updatePlayer();
  dialog.close();
}
$('#audio-options').addEventListener('click', () => {
  show('Biblia Audio', [
    row((playingTrack?.type !== 'radio' && audioMode === 'automatic' ? '✓  ' : '') + 'Nagrania CC, gdy są dostępne', () => setAudioMode('automatic')),
    row((playingTrack?.type !== 'radio' && audioMode === 'voice' ? '✓  ' : '') + 'Zawsze używaj głosu urządzenia', () => setAudioMode('voice')),
    link('Otwórz katalog Biblii Audio', site('/biblia-audio')),
    element('h3', '', 'Radio na żywo'),
    ...stations.map((station) => row((playingTrack === station ? '✓  ' : '') + station.title, () => {
      dialog.close();
      void startMedia(station);
    }))
  ]);
});

const pageStar = $('#ccTopBarFavBtn');
const pageFavoriteKey = 'cc-biblia-ubg-app-favorite-v1';
function paintLocalPageStar() {
  const saved = readLocal(pageFavoriteKey) === true;
  pageStar.setAttribute('aria-pressed', String(saved));
  const label = saved ? 'Usuń aplikację z ulubionych' : 'Dodaj aplikację do ulubionych';
  pageStar.setAttribute('aria-label', label);
  pageStar.title = label;
}
paintLocalPageStar();
pageStar.addEventListener('click', () => {
  if (window.CCFavorites) return;
  const saved = readLocal(pageFavoriteKey) === true;
  saveLocal(pageFavoriteKey, !saved);
  paintLocalPageStar();
});

$('#chat').addEventListener('click', (event) => {
  if (!window.CCUnifiedChat?.open) return;
  event.preventDefault();
  window.CCUnifiedChat.open({ tab: 'public' });
});
$('#edge').addEventListener('click', () => {
  if (window.CCEdgePlus?.open && window.CCMobileEdge) {
    window.CCEdgePlus.open();
    return;
  }
  show('Panel Christian Culture', [
    link('Wyszukiwarka Christian Culture', site('/wyszukiwarka')),
    link('MojaBiblia', selected() ? mojaBiblia(selected()) : site('/mojabiblia?book=JHN&ch=1&chapter=1&mode=reader')),
    link('AI dla Jezusa', site('/ai/aplikacja')),
    link('Biblia Audio', site('/biblia-audio')),
    link('LumiMes', site('/mess'))
  ]);
});

function bootCommunity() {
  if (!inEcosystem) return;
  const scripts = [
    '/js/cc-global-auth.js?v=20261116_a007_auth',
    '/js/cc-favorites.js?v=20261120_fav4',
    '/js/cc-mobile-edge.js?v=20261119_gold3',
    '/js/cc-edge-plus.js?v=20261110_edgep2',
    '/js/cc-chat-integration.js?v=20261120_prayer40dm'
  ];
  // Classic scripts execute in insertion order. CC modules resolve their own same-origin dependencies.
  for (const path of scripts) {
    const pathname = new URL(path, location.href).pathname;
    if ([...document.scripts].some((script) => script.src && new URL(script.src).pathname === pathname)) continue;
    const script = document.createElement('script');
    script.async = false;
    script.src = path;
    document.head.append(script);
  }
}

async function initBible() {
  const retry = $('#retry');
  retry.hidden = true;
  $('#loading-message').textContent = 'Wczytuję wersety UBG…';
  try {
    bible = await loadBible();
  } catch {
    $('#loading-message').textContent = 'Nie udało się wczytać Biblii UBG. Sprawdź połączenie i spróbuj ponownie.';
    retry.hidden = false;
    return;
  }
  shuffleVerses();
  const key = new URLSearchParams(location.hash.slice(1)).get('werset');
  const initial = bible.byKey.get(key) || draw();
  addCards(1);
  addCards(15, initial);
  $('#reader-status').hidden = true;
  feed.hidden = false;
  $('.reader-controls').hidden = false;
  $('.gesture').hidden = false;
  layout();
  goTo(1, true);
}
$('#retry').addEventListener('click', initBible);
window.addEventListener('hashchange', () => {
  const verse = bible?.byKey.get(new URLSearchParams(location.hash.slice(1)).get('werset'));
  if (!verse || verse.key === selected()?.key) return;
  const existing = cards.findIndex((entry) => entry.verse.key === verse.key);
  if (existing >= 0) goTo(existing, true);
  else {
    const index = cards.length;
    addCards(4, verse);
    goTo(index, true);
  }
});
bootCommunity();
void initBible();
loadRecordings().then((result) => {
  recordings = result;
  recordingsState = 'loaded';
  updatePlayer();
}).catch(() => {
  recordingsState = 'failed';
  updatePlayer();
});
