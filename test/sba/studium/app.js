/**
 * app.js — Główny kontroler aplikacji „Głębokie studium” (/test/sba/studium/).
 * Zero zewnętrznych zależności, pełna obsługa 8 etapów w dowolnej kolejności,
 * UBG na żywo, IndexedDB z obsługą konfliktów kart, Mapa myśli SVG/PNG i pełne WCAG 2.2 AA.
 */

import {
  parseStudyParams, validatePassage, loadBibleData, loadAudioCatalog,
  resolveChapterAudio, formatRef, getVerseRange, computeParagraphRange,
  findLexicalParallels, getBookContextInfo, ecosystemUrl
} from './data.js?v=20261128_1';
import {
  OPENING_SCREEN, STUCK_HELP, STAGES, QUICK_STAGE_IDS,
  BIG_SIX, BIG_TWELVE, ANNOTATION_CATEGORIES, CONTEXT_CIRCLES,
  HERMENEUTIC_QUESTIONS, INTERPRETATION_PRINCIPLES, CONTROL_EXAMPLE,
  INTERPRETATION_QUESTIONS, APPLICATION_QUESTIONS, CREATIVE_TEMPLATES, STUDY_TYPES
} from './content.js?v=20261128_1';
import {
  StudyStorageEngine, createEmptyStudy, migrateStudy,
  serializeStudyJson, parseImportedJson, DEFAULT_SHARE_SELECTION
} from './db.js?v=20261128_1';
import {
  createDefaultMindMap, addBranchNode, updateBranchNode, removeBranchNode,
  addMindMapEdge, removeMindMapEdge, buildMindMapSvgString,
  buildMindMapTextOutline, triggerFileDownload, exportMindMapPng
} from './mindmap.js?v=20261128_1';

const $ = (sel) => document.querySelector(sel);
const el = (tag, cls = '', text = '') => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  if (tag === 'button') node.type = 'button';
  return node;
};

const dbEngine = new StudyStorageEngine();

const state = {
  bible: null,
  recordings: new Map(),
  study: null,
  currentStage: '01',
  rangeMode: 'verse', // 'verse' | 'paragraph' | 'chapter'
  activeBrush: ANNOTATION_CATEGORIES[0].id,
  contextTab: 'close',
  selectedMindNodeId: 'root',
  mindMapView: 'visual', // 'visual' | 'outline'
  pendingRemoteSave: null,
  storageBlocked: false,
  saveTimer: null,
  toastTimer: null,
  aiConsent: false,
  audioMode: 'idle' // 'idle' | 'mp3' | 'speech'
};

function notify(msg) {
  const box = $('#ds-toast');
  box.textContent = msg;
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => { box.textContent = ''; }, 3400);
}

function setSaveStatus(kind, msg) {
  const badge = $('#hdr-save-status');
  badge.className = 'ds-save-status' + (kind === 'saved' ? ' is-saved' : (kind === 'error' ? ' is-error' : ''));
  badge.textContent = msg;
}

function scheduleSave(immediate = false) {
  if (!state.study) return;
  setSaveStatus('saving', 'Zapisywanie…');
  clearTimeout(state.saveTimer);
  const run = async () => {
    try {
      const saved = await dbEngine.saveStudy(state.study);
      state.study = saved;
      state.storageBlocked = false;
      const t = new Date(saved.updatedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSaveStatus('saved', `Zapisano ${t}`);
    } catch (err) {
      state.storageBlocked = true;
      setSaveStatus('error', 'Błąd zapisu (użyj Eksportuj JSON)');
      if (immediate) notify(err?.message || 'Nie udało się zapisać w IndexedDB.');
    }
  };
  if (immediate) {
    void run();
  } else {
    state.saveTimer = setTimeout(() => void run(), 550);
  }
}

function openModal(title, builder) {
  const dlg = $('#ds-modal');
  $('#ds-modal-title').textContent = title;
  const body = $('#ds-modal-body');
  body.replaceChildren();
  builder(body, () => dlg.close());
  if (!dlg.open) dlg.showModal();
}

function showStuckHelp() {
  openModal(STUCK_HELP.title, (body, close) => {
    body.append(el('p', 'ds-lead', STUCK_HELP.lead));
    const list = el('div', 'ds-prayer-verses');
    list.style.marginTop = '12px';
    for (const step of STUCK_HELP.steps) {
      list.append(el('div', 'ds-verse-ref-card', step));
    }
    body.append(list);
    const row = el('div', 'ds-row-actions');
    const expandBtn = el('button', 'ds-btn ds-btn-primary', 'Pokaż cały rozdział');
    expandBtn.addEventListener('click', () => {
      state.rangeMode = 'chapter';
      renderBiblePanel();
      close();
      if (!$('#ds-workspace-grid').hidden) {
        notify('Rozszerzono widok tekstu do całego rozdziału.');
      }
    });
    const ctxBtn = el('button', 'ds-btn ds-btn-ghost', 'Przejdź do etapu 04 (Kontekst)');
    ctxBtn.addEventListener('click', () => {
      close();
      enterWorkshop('04');
    });
    const okBtn = el('button', 'ds-btn ds-btn-ghost', 'Rozumiem, wróć do studium');
    okBtn.addEventListener('click', close);
    row.append(expandBtn, ctxBtn, okBtn);
    body.append(row);
  });
}

function updateHeader() {
  if (!state.study || !state.bible) return;
  const refText = formatRef(state.bible, state.study.bookId, state.study.chapter, state.study.verseStart, state.study.verseEnd);
  $('#hdr-passage-ref').textContent = refText;
  $('#hdr-translation').textContent = state.study.translation || 'UBG';
  $('#bible-panel-title').textContent = refText;

  const isQuick = state.study.mode === 'szybki';
  $('#mode-quick').classList.toggle('is-active', isQuick);
  $('#mode-quick').setAttribute('aria-pressed', String(isQuick));
  $('#mode-full').classList.toggle('is-active', !isQuick);
  $('#mode-full').setAttribute('aria-pressed', String(!isQuick));
}

function updateStageNavAndProgress() {
  if (!state.study) return;
  const nav = $('#stage-nav');
  nav.replaceChildren();
  const isQuick = state.study.mode === 'szybki';

  for (const st of STAGES) {
    const btn = el('button', 'ds-stage-pill', st.shortTitle);
    const status = state.study.stageStatus?.[st.id] || 'pending';
    if (st.id === state.currentStage) btn.classList.add('is-current');
    if (status === 'done') {
      btn.classList.add('is-done');
      btn.append(el('span', '', '✓'));
    }
    if (isQuick && !QUICK_STAGE_IDS.includes(st.id)) {
      btn.classList.add('is-dimmed');
      btn.title = 'Poza skróconym trybem szybkim — możesz otworzyć w dowolnej chwili';
    }
    btn.setAttribute('aria-current', st.id === state.currentStage ? 'step' : 'false');
    btn.addEventListener('click', () => selectStage(st.id));
    nav.append(btn);
  }

  const doneCount = STAGES.filter((st) => state.study.stageStatus?.[st.id] === 'done').length;
  $('#ds-progress-text').textContent = `Ukończone etapy: ${doneCount} z ${STAGES.length}`;
  const bar = $('#ds-progress-bar');
  bar.setAttribute('aria-valuenow', String(doneCount));
  $('#ds-progress-fill').style.width = `${Math.round((doneCount / STAGES.length) * 100)}%`;

  const idx = STAGES.findIndex((s) => s.id === state.currentStage);
  $('#btn-prev-stage').disabled = idx <= 0 && state.study.prayerGateCompleted === false;
  $('#btn-next-stage').disabled = idx >= STAGES.length - 1;
}

function renderOpeningPrayerGate() {
  const gate = $('#ds-prayer-gate');
  $('#prayer-gate-heading').textContent = OPENING_SCREEN.introHeading;
  $('#prayer-motto-1').textContent = OPENING_SCREEN.mottoPrimary;
  $('#prayer-motto-2').textContent = OPENING_SCREEN.mottoSecondary;
  $('#prayer-intro-text').textContent = OPENING_SCREEN.introText;
  $('#prayer-proposed-text').textContent = OPENING_SCREEN.proposedPrayer;
  $('#prayer-personal-input').value = state.study?.prayer?.openingPrayer || '';

  const list = $('#prayer-verses-list');
  list.replaceChildren();
  for (const refSpec of OPENING_SCREEN.verseRefs) {
    const verses = getVerseRange(state.bible, refSpec.book, refSpec.ch, refSpec.v, refSpec.end);
    const card = el('div', 'ds-verse-ref-card');
    card.append(el('strong', '', `${refSpec.label} (UBG)`));
    const txt = verses.length
      ? verses.map((v) => (verses.length > 1 ? `${v.number} ${v.text}` : v.text)).join(' ')
      : 'Nie udało się odczytać wersetu z indeksu UBG.';
    card.append(el('p', '', txt));
    list.append(card);
  }
  gate.hidden = false;
  $('#ds-workspace-grid').hidden = true;
  $('#ds-stage-strip').hidden = true;
}

function enterWorkshop(stageId = '01') {
  if (!state.study) return;
  if (!state.study.prayerGateCompleted) {
    state.study.prayerGateCompleted = true;
    scheduleSave();
  }
  state.currentStage = stageId;
  $('#ds-prayer-gate').hidden = true;
  $('#ds-workspace-grid').hidden = false;
  $('#ds-stage-strip').hidden = false;
  renderBiblePanel();
  renderCurrentStage();
  updateStageNavAndProgress();
}

function selectStage(stageId) {
  if ($('#ds-prayer-gate') && !$('#ds-prayer-gate').hidden) {
    enterWorkshop(stageId);
    return;
  }
  state.currentStage = stageId;
  if (state.study && state.study.stageStatus[stageId] === 'pending') {
    state.study.stageStatus[stageId] = 'in_progress';
  }
  renderCurrentStage();
  updateStageNavAndProgress();
  $('#stage-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function stopAudio() {
  const audioEl = $('#ds-audio-el');
  audioEl.pause();
  audioEl.removeAttribute('src');
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  state.audioMode = 'idle';
  $('#btn-play-passage-audio').textContent = 'Odtwórz audio fragmentu';
  $('#audio-status-label').textContent = '';
}

function togglePassageAudio() {
  if (state.audioMode !== 'idle') {
    stopAudio();
    return;
  }
  const { bookId, chapter, verseStart, verseEnd } = state.study;
  const track = resolveChapterAudio(state.recordings, bookId, chapter, verseStart);
  const audioEl = $('#ds-audio-el');
  if (track) {
    audioEl.src = track.url;
    audioEl.play().then(() => {
      state.audioMode = 'mp3';
      $('#btn-play-passage-audio').textContent = 'Zatrzymaj audio';
      $('#audio-status-label').textContent = `Biblia Audio · ${track.title}`;
    }).catch(() => {
      playWithSpeech(bookId, chapter, verseStart, verseEnd);
    });
  } else {
    playWithSpeech(bookId, chapter, verseStart, verseEnd);
  }
}

function playWithSpeech(bookId, chapter, verseStart, verseEnd) {
  if (typeof speechSynthesis === 'undefined') {
    notify('Brak nagrania i syntezatora mowy w tej przeglądarce.');
    return;
  }
  const verses = getVerseRange(state.bible, bookId, chapter, verseStart, verseEnd);
  const text = verses.map((v) => v.text).join(' ');
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'pl-PL';
  u.onend = () => stopAudio();
  u.onerror = () => stopAudio();
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
  state.audioMode = 'speech';
  $('#btn-play-passage-audio').textContent = 'Zatrzymaj głos';
  $('#audio-status-label').textContent = 'Odczyt głosem urządzenia (pl-PL)';
}

function renderAnnotationBrushes() {
  const box = $('#annotation-brushes');
  box.replaceChildren();
  for (const cat of ANNOTATION_CATEGORIES) {
    const btn = el('button', 'ds-brush-btn', `${cat.icon} ${cat.label}`);
    btn.style.background = cat.bg;
    btn.style.color = cat.color;
    btn.style.borderColor = cat.color;
    const isAct = state.activeBrush === cat.id;
    btn.classList.toggle('is-active', isAct);
    btn.setAttribute('aria-pressed', String(isAct));
    btn.addEventListener('click', () => {
      state.activeBrush = cat.id;
      renderAnnotationBrushes();
    });
    box.append(btn);
  }
}

function renderBiblePanel() {
  if (!state.study || !state.bible) return;
  renderAnnotationBrushes();

  for (const btn of document.querySelectorAll('.ds-range-bar [data-range]')) {
    const act = btn.dataset.range === state.rangeMode;
    btn.classList.toggle('is-active', act);
    btn.setAttribute('aria-pressed', String(act));
  }

  const { bookId, chapter, verseStart, verseEnd } = state.study;
  const fullChapter = state.bible.chapters.get(`${bookId}.${chapter}`) || [];
  let displayVerses = [];
  if (state.rangeMode === 'chapter') {
    displayVerses = fullChapter;
  } else if (state.rangeMode === 'paragraph') {
    const win = computeParagraphRange(fullChapter, verseStart, verseEnd);
    displayVerses = getVerseRange(state.bible, bookId, chapter, win.v, win.end);
  } else {
    displayVerses = getVerseRange(state.bible, bookId, chapter, verseStart, verseEnd);
  }

  const container = $('#bible-verses-container');
  container.replaceChildren();
  const catById = new Map(ANNOTATION_CATEGORIES.map((c) => [c.id, c]));

  for (const v of displayVerses) {
    const isFocus = v.number >= verseStart && v.number <= verseEnd;
    const card = el('div', 'ds-verse-row' + (isFocus ? ' is-focus' : ''));
    const head = el('div', 'ds-verse-row-head');
    head.append(el('span', 'ds-verse-num', `${v.name} ${v.chapter}:${v.number}`));

    const markBtn = el('button', 'ds-btn ds-btn-chip', 'Oznacz');
    markBtn.setAttribute('aria-label', `Oznacz werset ${v.number} wybraną kategorią`);
    markBtn.addEventListener('click', () => {
      toggleVerseAnnotation(v);
    });
    head.append(markBtn);

    const txtP = el('div', 'ds-verse-text', v.text);
    card.append(head, txtP);

    const verseAnns = (state.study.annotations || []).filter(
      (a) => a.bookId === v.book && a.chapter === v.chapter && a.verseStart === v.number
    );
    if (verseAnns.length) {
      const tags = el('div', 'ds-ann-tags');
      for (const ann of verseAnns) {
        const cat = catById.get(ann.category) || ANNOTATION_CATEGORIES[6];
        const pill = el('button', 'ds-ann-pill', `${cat.icon} ${cat.label} ×`);
        pill.style.background = cat.bg;
        pill.style.color = cat.color;
        pill.style.border = `1px solid ${cat.color}`;
        pill.title = 'Kliknij, aby usunąć oznaczenie';
        pill.addEventListener('click', () => {
          state.study.annotations = state.study.annotations.filter((x) => x.id !== ann.id);
          scheduleSave();
          renderBiblePanel();
          if (state.currentStage === '03') renderCurrentStage();
        });
        tags.append(pill);
      }
      card.append(tags);
    }
    container.append(card);
  }
}

function toggleVerseAnnotation(verse) {
  const existing = state.study.annotations.find(
    (a) => a.bookId === verse.book && a.chapter === verse.chapter && a.verseStart === verse.number && a.category === state.activeBrush
  );
  if (existing) {
    state.study.annotations = state.study.annotations.filter((a) => a.id !== existing.id);
  } else {
    state.study.annotations.push({
      id: `ann_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      category: state.activeBrush,
      translation: state.study.translation || 'UBG',
      bookId: verse.book,
      chapter: verse.chapter,
      verseStart: verse.number,
      verseEnd: verse.number,
      quote: verse.text.slice(0, 180),
      note: '',
      createdAt: new Date().toISOString()
    });
  }
  scheduleSave();
  renderBiblePanel();
  if (state.currentStage === '03') renderCurrentStage();
}

function createQuestionCard(q, badgeText = '') {
  const cur = state.study.answers[q.id] || { text: '', refs: '', status: 'open' };
  const card = el('article', 'ds-q-card' + (cur.status === 'skipped' ? ' is-skipped' : ''));
  const head = el('div', 'ds-q-head');
  const titleWrap = el('div');
  if (badgeText || q.badge) titleWrap.append(el('span', 'ds-q-badge', q.badge || badgeText));
  titleWrap.append(el('h3', '', q.title));

  const skipBtn = el('button', 'ds-btn ds-btn-chip', cur.status === 'skipped' ? 'Wróć do pytania' : 'Nie dotyczy / wrócę później');
  skipBtn.addEventListener('click', () => {
    const prev = state.study.answers[q.id] || { text: '', refs: '', status: 'open' };
    state.study.answers[q.id] = {
      ...prev,
      status: prev.status === 'skipped' ? (prev.text ? 'answered' : 'open') : 'skipped'
    };
    scheduleSave();
    renderCurrentStage();
  });

  head.append(titleWrap, skipBtn);
  card.append(head, el('p', 'ds-q-help', q.help));

  const ta = el('textarea', 'ds-textarea');
  ta.placeholder = 'Twoje odkrycie lub notatka (nieobowiązkowe)…';
  ta.setAttribute('aria-label', q.title);
  ta.value = cur.text || '';
  ta.addEventListener('input', () => {
    const prev = state.study.answers[q.id] || { text: '', refs: '', status: 'open' };
    state.study.answers[q.id] = {
      ...prev,
      text: ta.value,
      status: ta.value.trim() ? 'answered' : 'open'
    };
    scheduleSave();
  });

  const refsInput = el('input', 'ds-input');
  refsInput.placeholder = 'Opcjonalne powiązane wersety (np. Rz 8:28; Ps 23:1)';
  refsInput.setAttribute('aria-label', `Odnośniki wersetów dla: ${q.title}`);
  refsInput.value = cur.refs || '';
  refsInput.style.marginTop = '8px';
  refsInput.addEventListener('input', () => {
    const prev = state.study.answers[q.id] || { text: '', refs: '', status: 'open' };
    state.study.answers[q.id] = { ...prev, refs: refsInput.value };
    scheduleSave();
  });

  card.append(ta, refsInput);
  return card;
}

function stageHeaderCard(stageMeta) {
  const card = el('div', 'ds-card');
  const head = el('div', 'ds-stage-header');
  const left = el('div');
  left.append(
    el('p', 'ds-kicker', `ETAP ${stageMeta.code} Z 08`),
    el('h2', '', stageMeta.title),
    el('p', 'ds-q-help', stageMeta.desc)
  );

  const isDone = state.study.stageStatus?.[stageMeta.id] === 'done';
  const doneBtn = el('button', 'ds-btn ' + (isDone ? 'ds-btn-ghost' : 'ds-btn-primary'), isDone ? 'Etap ukończony ✓ (Cofnij)' : 'Oznacz etap jako ukończony');
  doneBtn.addEventListener('click', () => {
    state.study.stageStatus[stageMeta.id] = isDone ? 'in_progress' : 'done';
    scheduleSave();
    renderCurrentStage();
    updateStageNavAndProgress();
  });
  head.append(left, doneBtn);
  card.append(head);
  return card;
}

function stageFooterNav(stageId) {
  const idx = STAGES.findIndex((s) => s.id === stageId);
  const card = el('div', 'ds-card');
  const row = el('div', 'ds-row-actions');
  if (idx > 0) {
    const prev = el('button', 'ds-btn ds-btn-ghost', `← ${STAGES[idx - 1].shortTitle}`);
    prev.addEventListener('click', () => selectStage(STAGES[idx - 1].id));
    row.append(prev);
  } else {
    const backPrayer = el('button', 'ds-btn ds-btn-ghost', '← Ekran modlitwy');
    backPrayer.addEventListener('click', renderOpeningPrayerGate);
    row.append(backPrayer);
  }
  if (idx < STAGES.length - 1) {
    const next = el('button', 'ds-btn ds-btn-primary', `Przejdź do: ${STAGES[idx + 1].shortTitle} →`);
    next.addEventListener('click', () => selectStage(STAGES[idx + 1].id));
    row.append(next);
  }
  const stuck = el('button', 'ds-btn ds-btn-outline-accent', 'Nie rozumiem tekstu');
  stuck.addEventListener('click', showStuckHelp);
  row.append(stuck);
  card.append(row);
  return card;
}

function renderStage01(root) {
  const box = el('div', 'ds-card');
  box.append(el('h3', '', 'Ustawienia studium i pierwsze obserwacje'));

  const titleLabel = el('label', 'ds-field-label', 'Własny tytuł studium (opcjonalny)');
  const titleInput = el('input', 'ds-input');
  titleInput.placeholder = 'Np. Nadzieja w burzy — pierwsze czytanie';
  titleInput.value = state.study.title || '';
  titleInput.addEventListener('input', () => {
    state.study.title = titleInput.value;
    scheduleSave();
  });

  const typeLabel = el('label', 'ds-field-label', 'Rodzaj studium');
  const typeSelect = el('select', 'ds-select');
  for (const st of STUDY_TYPES) {
    const opt = el('option', '', st.label);
    opt.value = st.id;
    typeSelect.append(opt);
  }
  typeSelect.value = state.study.studyType || 'werset';
  typeSelect.addEventListener('change', () => {
    state.study.studyType = typeSelect.value;
    scheduleSave();
  });

  const openPrayerLbl = el('label', 'ds-field-label', 'Moja modlitwa przed lekturą (prywatna)');
  const openPrayerTa = el('textarea', 'ds-textarea');
  openPrayerTa.value = state.study.prayer?.openingPrayer || '';
  openPrayerTa.addEventListener('input', () => {
    state.study.prayer.openingPrayer = openPrayerTa.value;
    scheduleSave();
  });

  const impLbl = el('label', 'ds-field-label', 'Pierwsze wrażenie po uważnym przeczytaniu');
  const impTa = el('textarea', 'ds-textarea');
  impTa.placeholder = 'Co od razu przyciąga uwagę? Które słowo brzmi mocno? Co rodzi pytanie?';
  impTa.value = state.study.firstImpressions || '';
  impTa.addEventListener('input', () => {
    state.study.firstImpressions = impTa.value;
    scheduleSave();
  });

  const rangeRow = el('div', 'ds-row-actions');
  for (const [mode, label] of [['verse', 'Tylko wybrany werset'], ['paragraph', 'Poszerz o Akapit'], ['chapter', 'Cały rozdział']]) {
    const b = el('button', 'ds-btn ds-btn-ghost', label);
    b.addEventListener('click', () => {
      state.rangeMode = mode;
      renderBiblePanel();
      notify(`Widok tekstu: ${label}.`);
    });
    rangeRow.append(b);
  }

  box.append(titleLabel, titleInput, typeLabel, typeSelect, openPrayerLbl, openPrayerTa, impLbl, impTa, rangeRow);
  root.append(box);
}

function renderStage02(root) {
  const wrap = el('div', 'ds-card');
  wrap.append(el('h3', '', 'Wielka Szóstka obserwacji'));
  wrap.append(el('p', 'ds-q-help', 'Zanim zapytasz „co to znaczy dla mnie”, zobacz uważnie, co faktycznie jest napisane w tekście.'));
  const grid = el('div', 'ds-question-grid');
  for (const q of BIG_SIX) grid.append(createQuestionCard(q));
  wrap.append(grid);
  root.append(wrap);
}

function renderStage03(root) {
  const summaryCard = el('div', 'ds-card');
  summaryCard.append(el('h3', '', 'System oznaczania wersetów (przypisany do UBG)'));
  summaryCard.append(el('p', 'ds-q-help', 'Wybierz kategorię w panelu Biblii po lewej i kliknij „Oznacz” przy wersecie. Oznaczenia zapisują się trwale dla tego przekładu i zakresu.'));
  const list = el('div', 'ds-ann-tags');
  const catById = new Map(ANNOTATION_CATEGORIES.map((c) => [c.id, c]));
  if (state.study.annotations.length) {
    for (const ann of state.study.annotations) {
      const cat = catById.get(ann.category) || ANNOTATION_CATEGORIES[6];
      const badge = el('span', 'ds-ann-pill', `${cat.icon} ${cat.label}: ${ann.bookId} ${ann.chapter}:${ann.verseStart} (${ann.translation})`);
      badge.style.background = cat.bg;
      badge.style.color = cat.color;
      list.append(badge);
    }
  } else {
    list.append(el('span', 'ds-subtle-note', 'Brak oznaczeń — użyj pędzli kategorii obok tekstu biblijnego.'));
  }
  summaryCard.append(list);

  const promLbl = el('label', 'ds-field-label', 'Dziennik odkrytych obietnic / ważnych zwrotów');
  const promTa = el('textarea', 'ds-textarea');
  promTa.placeholder = 'Zapisz konkretne obietnice lub powtórzenia zauważone w tym fragmencie…';
  promTa.value = state.study.promisesNote || '';
  promTa.addEventListener('input', () => {
    state.study.promisesNote = promTa.value;
    scheduleSave();
  });
  summaryCard.append(promLbl, promTa);
  root.append(summaryCard);

  const twelveCard = el('div', 'ds-card');
  twelveCard.append(el('h3', '', 'Wielka Dwunastka szczegółowej analizy CC'));
  const grid = el('div', 'ds-question-grid');
  BIG_TWELVE.forEach((q, idx) => grid.append(createQuestionCard(q, `${String(idx + 1).padStart(2, '0')} Analiza`)));
  twelveCard.append(grid);
  root.append(twelveCard);
}

function renderStage04(root) {
  const circlesCard = el('div', 'ds-card');
  circlesCard.append(el('h3', '', 'Siedem kręgów kontekstu'));
  const tabsBar = el('div', 'ds-tabs');
  const tabs = [
    ['close', 'Kontekst bliski'],
    ['chapter', 'Rozdział'],
    ['book', 'Księga'],
    ['history', 'Historia'],
    ['parallels', 'Teksty paralelne'],
    ['canon', 'Cała Biblia']
  ];
  for (const [id, label] of tabs) {
    const b = el('button', 'ds-btn ds-btn-chip' + (state.contextTab === id ? ' is-active' : ''), label);
    b.addEventListener('click', () => {
      state.contextTab = id;
      renderCurrentStage();
    });
    tabsBar.append(b);
  }
  circlesCard.append(tabsBar);

  const tabBody = el('div', 'ds-q-card');
  const { bookId, chapter, verseStart, verseEnd } = state.study;
  const fullChapter = state.bible.chapters.get(`${bookId}.${chapter}`) || [];
  const bookInfo = getBookContextInfo(state.bible, bookId);

  if (state.contextTab === 'close') {
    const win = computeParagraphRange(fullChapter, verseStart, verseEnd);
    const verses = getVerseRange(state.bible, bookId, chapter, win.v, win.end);
    tabBody.append(el('h3', '', `Kontekst bliski (${formatRef(state.bible, bookId, chapter, win.v, win.end)})`));
    for (const v of verses) {
      const p = el('p', v.number >= verseStart && v.number <= verseEnd ? 'ds-badge-accent' : '', `${v.number}. ${v.text}`);
      p.style.padding = '4px 8px';
      p.style.borderRadius = '6px';
      tabBody.append(p);
    }
  } else if (state.contextTab === 'chapter') {
    tabBody.append(el('h3', '', `Rozdział ${bookInfo?.namePl || bookId} ${chapter} (${fullChapter.length} wersetów)`));
    const btn = el('button', 'ds-btn ds-btn-primary', 'Pokaż cały rozdział w panelu Biblii');
    btn.addEventListener('click', () => {
      state.rangeMode = 'chapter';
      renderBiblePanel();
      notify('Otwarto cały rozdział w panelu po lewej.');
    });
    const mb = el('a', 'ds-btn ds-btn-ghost', 'Otwórz rozdział w MojaBiblia (interlinearna)');
    mb.href = ecosystemUrl(`/mojabiblia?book=${bookId}&ch=${chapter}&chapter=${chapter}&mode=reader&verse=${verseStart}`).href;
    mb.target = '_blank';
    mb.rel = 'noopener noreferrer';
    const row = el('div', 'ds-row-actions');
    row.append(btn, mb);
    tabBody.append(el('p', '', 'Czytanie całego rozdziału chroni przed wyrwaniem pojedynczego zdania z biegu myśli autora.'), row);
  } else if (state.contextTab === 'book') {
    tabBody.append(el('h3', '', `Księga: ${bookInfo?.namePl || bookId}`));
    tabBody.append(
      el('p', '', `Testament: ${bookInfo?.testamentLabel} · Liczba rozdziałów: ${bookInfo?.chapters} · Język oryginału: ${bookInfo?.originalLangLabel}`),
      el('p', '', bookInfo?.summary || 'Brak danych w lokalnej bazie.')
    );
  } else if (state.contextTab === 'history') {
    tabBody.append(el('h3', '', 'Kontekst historyczny i kulturowy'));
    tabBody.append(
      el('p', '', bookInfo?.summary || 'Brak szczegółowego słownika historycznego w pamięci lokalnej.'),
      el('p', 'ds-subtle-note', 'Uwaga rzetelności: lokalna aplikacja offline nie zawiera pełnego słownika historycznego i nie wymyśla źródeł. Możesz otworzyć MojaBiblia (kody Stronga) lub Wyszukiwarkę Christian Culture:')
    );
    const row = el('div', 'ds-row-actions');
    const mb = el('a', 'ds-btn ds-btn-ghost', 'MojaBiblia (Strong / słownik)');
    mb.href = ecosystemUrl(`/mojabiblia?book=${bookId}&ch=${chapter}&chapter=${chapter}&mode=reader&verse=${verseStart}`).href;
    mb.target = '_blank';
    mb.rel = 'noopener noreferrer';
    const sr = el('a', 'ds-btn ds-btn-ghost', 'Szukaj w Christian Culture');
    sr.href = ecosystemUrl(`/wyszukiwarka?q=${encodeURIComponent(formatRef(state.bible, bookId, chapter, verseStart, verseEnd))}`).href;
    sr.target = '_blank';
    sr.rel = 'noopener noreferrer';
    row.append(mb, sr);
    tabBody.append(row);
  } else if (state.contextTab === 'parallels') {
    tabBody.append(el('h3', '', 'Teksty paralelne w UBG (zestawienie leksykalne)'));
    const parallels = findLexicalParallels(state.bible, bookId, chapter, verseStart, verseEnd, 6);
    if (!parallels.length) {
      tabBody.append(el('p', '', 'Nie znaleziono bezpośrednich powtórzeń rzadkich słów w lokalnym indeksie. Użyj Wyszukiwarki CC lub MojaBiblia.'));
    } else {
      for (const hit of parallels) {
        const card = el('div', 'ds-verse-ref-card');
        card.style.marginBottom = '8px';
        card.append(el('strong', '', `${hit.verse.name} ${hit.verse.chapter}:${hit.verse.number} (wspólne: ${hit.matched.join(', ')})`));
        card.append(el('p', '', hit.verse.text));
        const openStudyLink = el('a', 'ds-btn ds-btn-chip', 'Otwórz w MojaBiblia');
        openStudyLink.href = ecosystemUrl(`/mojabiblia?book=${hit.verse.book}&ch=${hit.verse.chapter}&chapter=${hit.verse.chapter}&mode=reader&verse=${hit.verse.number}`).href;
        openStudyLink.target = '_blank';
        openStudyLink.rel = 'noopener noreferrer';
        openStudyLink.style.marginTop = '6px';
        card.append(openStudyLink);
        tabBody.append(card);
      }
    }
  } else {
    tabBody.append(el('h3', '', 'Cała Biblia — Siedem kręgów kontekstu'));
    for (const c of CONTEXT_CIRCLES) {
      tabBody.append(el('p', '', `${c.title}: ${c.desc}`));
    }
  }
  circlesCard.append(tabBody);
  root.append(circlesCard);

  const qCard = el('div', 'ds-card');
  qCard.append(el('h3', '', '12 pytań hermeneutycznych Christian Culture'));
  const grid = el('div', 'ds-question-grid');
  HERMENEUTIC_QUESTIONS.forEach((q, idx) => grid.append(createQuestionCard(q, `Krąg · ${idx + 1}/12`)));
  qCard.append(grid);
  root.append(qCard);
}

function renderStage05(root) {
  const prinCard = el('div', 'ds-card');
  prinCard.append(el('h3', '', 'Zasady rzetelnej interpretacji (Sola Scriptura)'));
  const gridP = el('div', 'ds-question-grid');
  for (const p of INTERPRETATION_PRINCIPLES) {
    const c = el('div', 'ds-q-card');
    c.append(el('h3', '', p.title), el('p', 'ds-q-help', p.desc));
    gridP.append(c);
  }
  prinCard.append(gridP);

  // Przykład kontrolny Flp 4:13 z prawdziwego UBG
  const ex = el('div', 'ds-verse-ref-card');
  ex.style.marginTop = '12px';
  ex.append(el('strong', '', CONTROL_EXAMPLE.title));
  const ctxVerses = getVerseRange(state.bible, 'PHP', 4, 10, 14);
  if (ctxVerses.length) {
    ex.append(el('p', '', `Tekst UBG (Flp 4:10–14): ${ctxVerses.map((v) => `${v.number} ${v.text}`).join(' ')}`));
  }
  ex.append(
    el('p', 'ds-q-help', CONTROL_EXAMPLE.eisegezaMistake),
    el('p', '', CONTROL_EXAMPLE.exegesisTruth)
  );
  prinCard.append(ex);
  root.append(prinCard);

  const sepCard = el('div', 'ds-card');
  sepCard.append(
    el('h3', '', 'Rozdzielenie obserwacji, interpretacji, zastosowania i niepewności'),
    el('p', 'ds-q-help', 'Oddzielaj to, co tekst mówi wprost, od swojej interpretacji, zastosowania i uczciwie zapisanych pytań.')
  );
  const fields = [
    ['textSummary', '1. Tekst (co dosłownie mówią słowa w UBG?)'],
    ['observation', '2. Obserwacja (fakty, struktura, powtórzenia)'],
    ['interpretation', '3. Interpretacja (znaczenie dla pierwszych odbiorców i w całej Biblii)'],
    ['application', '4. Zastosowanie (ponadczasowa prawda i krok dla mnie)'],
    ['uncertainty', '5. Niepewność (czego jeszcze nie jestem pewien / co wymaga dalszego badania)']
  ];
  for (const [key, label] of fields) {
    const l = el('label', 'ds-field-label', label);
    const ta = el('textarea', 'ds-textarea');
    ta.value = state.study.interpretation?.[key] || '';
    ta.addEventListener('input', () => {
      state.study.interpretation[key] = ta.value;
      scheduleSave();
    });
    sepCard.append(l, ta);
  }
  root.append(sepCard);

  const qCard = el('div', 'ds-card');
  qCard.append(el('h3', '', '12 pytań interpretacyjnych Christian Culture'));
  const grid = el('div', 'ds-question-grid');
  INTERPRETATION_QUESTIONS.forEach((q, idx) => grid.append(createQuestionCard(q, `Egzegeza · ${idx + 1}/12`)));
  qCard.append(grid);
  root.append(qCard);
}

function renderStage06(root) {
  const qCard = el('div', 'ds-card');
  qCard.append(el('h3', '', '12 pytań zastosowania osobistego Christian Culture'));
  qCard.append(el('p', 'ds-q-help', 'Spokojne pytania o odpowiedź serca i życia — bez oceniania i bez automatycznego upubliczniania.'));
  const grid = el('div', 'ds-question-grid');
  APPLICATION_QUESTIONS.forEach((q, idx) => grid.append(createQuestionCard(q, `Życie · ${idx + 1}/12`)));
  qCard.append(grid);
  root.append(qCard);

  const commitCard = el('div', 'ds-card');
  commitCard.append(el('h3', '', 'Postanowienia (lokalne, prywatne, bez automatycznych powiadomień)'));
  const formRow = el('div', 'ds-row-actions');
  const actionIn = el('input', 'ds-input');
  actionIn.placeholder = 'Konkretna czynność na najbliższe dni…';
  actionIn.setAttribute('aria-label', 'Treść postanowienia');
  const dueIn = el('input', 'ds-input');
  dueIn.type = 'date';
  dueIn.setAttribute('aria-label', 'Termin wykonania');
  dueIn.style.maxWidth = '190px';
  const addBtn = el('button', 'ds-btn ds-btn-primary', 'Dodaj postanowienie');
  addBtn.addEventListener('click', () => {
    const val = actionIn.value.trim();
    if (!val) {
      notify('Wpisz treść postanowienia.');
      return;
    }
    state.study.commitments.push({
      id: `cm_${Date.now().toString(36)}`,
      action: val,
      dueDate: dueIn.value || '',
      done: false,
      reflection: ''
    });
    actionIn.value = '';
    scheduleSave();
    renderCurrentStage();
  });
  formRow.append(actionIn, dueIn, addBtn);
  commitCard.append(formRow);

  const list = el('div', 'ds-question-grid');
  list.style.marginTop = '12px';
  for (const cm of state.study.commitments) {
    const row = el('div', 'ds-q-card');
    const head = el('div', 'ds-q-head');
    const chkWrap = el('label', 'ds-row-actions');
    chkWrap.style.marginTop = '0';
    chkWrap.style.alignItems = 'center';
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = Boolean(cm.done);
    chk.style.width = '22px';
    chk.style.height = '22px';
    chk.addEventListener('change', () => {
      cm.done = chk.checked;
      scheduleSave();
    });
    const txt = el('strong', '', `${cm.action}${cm.dueDate ? ` (termin: ${cm.dueDate})` : ''}`);
    chkWrap.append(chk, txt);

    const del = el('button', 'ds-btn ds-btn-chip', 'Usuń');
    del.addEventListener('click', () => {
      state.study.commitments = state.study.commitments.filter((x) => x.id !== cm.id);
      scheduleSave();
      renderCurrentStage();
    });
    head.append(chkWrap, del);

    const refl = el('textarea', 'ds-textarea');
    refl.placeholder = 'Opcjonalna refleksja po wykonaniu…';
    refl.value = cm.reflection || '';
    refl.addEventListener('input', () => {
      cm.reflection = refl.value;
      scheduleSave();
    });
    row.append(head, refl);
    list.append(row);
  }
  commitCard.append(list);

  const closePrayerLbl = el('label', 'ds-field-label', 'Modlitwa końcowa po studium (prywatna)');
  const closePrayerTa = el('textarea', 'ds-textarea');
  closePrayerTa.value = state.study.prayer?.closingPrayer || '';
  closePrayerTa.addEventListener('input', () => {
    state.study.prayer.closingPrayer = closePrayerTa.value;
    scheduleSave();
  });
  commitCard.append(closePrayerLbl, closePrayerTa);
  root.append(commitCard);
}

function renderStage07(root) {
  // Interaktywna Mapa myśli
  const mmCard = el('div', 'ds-card');
  mmCard.append(el('h3', '', 'Interaktywna Mapa myśli'));
  mmCard.append(el('p', 'ds-q-help', 'Rozwijaj gałęzie od centralnego wersetu, dodawaj połączenia i odnośniki. Możesz przełączyć się na dostępny widok tekstowy i wyeksportować mapę do SVG lub PNG.'));

  const toolbar = el('div', 'ds-row-actions');
  const viewVisualBtn = el('button', 'ds-btn ds-btn-chip' + (state.mindMapView === 'visual' ? ' is-active' : ''), 'Widok graficzny (SVG)');
  viewVisualBtn.addEventListener('click', () => { state.mindMapView = 'visual'; renderCurrentStage(); });
  const viewOutlineBtn = el('button', 'ds-btn ds-btn-chip' + (state.mindMapView === 'outline' ? ' is-active' : ''), 'Widok tekstowy (czytniki ekranu)');
  viewOutlineBtn.addEventListener('click', () => { state.mindMapView = 'outline'; renderCurrentStage(); });
  const expSvgBtn = el('button', 'ds-btn ds-btn-ghost', 'Eksportuj SVG');
  expSvgBtn.addEventListener('click', () => {
    const svg = buildMindMapSvgString(state.study.mindMap);
    triggerFileDownload(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), 'mapa-mysli-studium.svg');
    notify('Pobrano plik SVG Mapy myśli.');
  });
  const expPngBtn = el('button', 'ds-btn ds-btn-ghost', 'Eksportuj PNG');
  expPngBtn.addEventListener('click', () => void exportMindMapPng(state.study.mindMap));
  toolbar.append(viewVisualBtn, viewOutlineBtn, expSvgBtn, expPngBtn);
  mmCard.append(toolbar);

  const mmWrap = el('div', 'ds-mindmap-wrap');
  mmWrap.style.marginTop = '12px';

  if (state.mindMapView === 'visual') {
    const svgBox = el('div', 'ds-mindmap-svg-box');
    svgBox.innerHTML = buildMindMapSvgString(state.study.mindMap, { selectedId: state.selectedMindNodeId });
    svgBox.querySelectorAll('[data-node-id]').forEach((g) => {
      g.style.cursor = 'pointer';
      const pick = () => {
        state.selectedMindNodeId = g.getAttribute('data-node-id');
        renderCurrentStage();
      };
      g.addEventListener('click', pick);
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          pick();
        }
      });
    });
    mmWrap.append(svgBox);
  }

  // Zawsze dostępny tekstowy konspekt (dla czytników ekranu lub po wyborze widoku tekstowego)
  const outlineBox = el('div', 'ds-outline-box');
  outlineBox.append(el('strong', '', 'Konspekt tekstowy Mapy myśli'));
  const pre = el('pre', '', buildMindMapTextOutline(state.study.mindMap));
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.margin = '6px 0 0';
  pre.style.fontFamily = 'inherit';
  outlineBox.append(pre);
  mmWrap.append(outlineBox);

  // Panel edycji gałęzi i połączeń
  const editor = el('div', 'ds-q-card');
  const selectedNode = state.study.mindMap.nodes.find((n) => n.id === state.selectedMindNodeId) || state.study.mindMap.nodes[0];
  editor.append(el('h4', '', `Wybrany węzeł: ${selectedNode?.label || 'Korzeń'}`));

  const editRow = el('div', 'ds-row-actions');
  const parentSel = el('select', 'ds-select');
  parentSel.setAttribute('aria-label', 'Węzeł nadrzędny dla nowej gałęzi');
  parentSel.style.maxWidth = '240px';
  for (const n of state.study.mindMap.nodes) {
    const o = el('option', '', `Rodzic: ${n.label}`);
    o.value = n.id;
    parentSel.append(o);
  }
  parentSel.value = selectedNode?.id || 'root';

  const branchLabelIn = el('input', 'ds-input');
  branchLabelIn.placeholder = 'Nazwa nowej gałęzi (np. Boża miłość)';
  branchLabelIn.setAttribute('aria-label', 'Nazwa nowej gałęzi');
  branchLabelIn.style.maxWidth = '260px';

  const branchRefIn = el('input', 'ds-input');
  branchRefIn.placeholder = 'Werset (np. Rz 5:8)';
  branchRefIn.setAttribute('aria-label', 'Odnośnik wersetu dla nowej gałęzi');
  branchRefIn.style.maxWidth = '150px';

  const addBranchBtn = el('button', 'ds-btn ds-btn-primary', 'Dodaj gałąź');
  addBranchBtn.addEventListener('click', () => {
    const { mindMap, added } = addBranchNode(state.study.mindMap, {
      parentId: parentSel.value,
      label: branchLabelIn.value,
      verseRef: branchRefIn.value
    });
    if (!added) {
      notify('Wpisz etykietę nowej gałęzi.');
      return;
    }
    state.study.mindMap = mindMap;
    state.selectedMindNodeId = added.id;
    scheduleSave();
    renderCurrentStage();
  });
  editRow.append(parentSel, branchLabelIn, branchRefIn, addBranchBtn);
  editor.append(editRow);

  if (selectedNode) {
    const updRow = el('div', 'ds-row-actions');
    const lblIn = el('input', 'ds-input');
    lblIn.value = selectedNode.label;
    lblIn.setAttribute('aria-label', 'Edytuj etykietę wybranego węzła');
    lblIn.style.maxWidth = '230px';
    const refIn = el('input', 'ds-input');
    refIn.value = selectedNode.verseRef || '';
    refIn.placeholder = 'Odnośnik';
    refIn.setAttribute('aria-label', 'Edytuj werset węzła');
    refIn.style.maxWidth = '150px';
    const noteIn = el('input', 'ds-input');
    noteIn.value = selectedNode.note || '';
    noteIn.placeholder = 'Notatka węzła';
    noteIn.setAttribute('aria-label', 'Edytuj notatkę węzła');
    noteIn.style.maxWidth = '220px';

    const saveNodeBtn = el('button', 'ds-btn ds-btn-ghost', 'Zastosuj zmiany węzła');
    saveNodeBtn.addEventListener('click', () => {
      state.study.mindMap = updateBranchNode(state.study.mindMap, selectedNode.id, {
        label: lblIn.value,
        verseRef: refIn.value,
        note: noteIn.value
      });
      scheduleSave();
      renderCurrentStage();
    });
    updRow.append(lblIn, refIn, noteIn, saveNodeBtn);

    if (selectedNode.id !== 'root') {
      const delNodeBtn = el('button', 'ds-btn ds-btn-outline-accent', 'Usuń węzeł');
      delNodeBtn.addEventListener('click', () => {
        state.study.mindMap = removeBranchNode(state.study.mindMap, selectedNode.id);
        state.selectedMindNodeId = 'root';
        scheduleSave();
        renderCurrentStage();
      });
      updRow.append(delNodeBtn);
    }
    editor.append(updRow);
  }

  if (state.study.mindMap.nodes.length >= 2) {
    const edgeRow = el('div', 'ds-row-actions');
    const fromSel = el('select', 'ds-select');
    fromSel.style.maxWidth = '180px';
    const toSel = el('select', 'ds-select');
    toSel.style.maxWidth = '180px';
    for (const n of state.study.mindMap.nodes) {
      const o1 = el('option', '', `Od: ${n.label}`);
      o1.value = n.id;
      const o2 = el('option', '', `Do: ${n.label}`);
      o2.value = n.id;
      fromSel.append(o1);
      toSel.append(o2);
    }
    toSel.selectedIndex = Math.min(1, state.study.mindMap.nodes.length - 1);
    const edgeLbl = el('input', 'ds-input');
    edgeLbl.placeholder = 'Opis połączenia';
    edgeLbl.style.maxWidth = '170px';
    const addEdgeBtn = el('button', 'ds-btn ds-btn-ghost', 'Połącz węzły');
    addEdgeBtn.addEventListener('click', () => {
      state.study.mindMap = addMindMapEdge(state.study.mindMap, fromSel.value, toSel.value, edgeLbl.value);
      scheduleSave();
      renderCurrentStage();
    });
    edgeRow.append(fromSel, toSel, edgeLbl, addEdgeBtn);
    editor.append(edgeRow);
  }

  if (state.study.mindMap.edges.length) {
    const edgeList = el('div', 'ds-row-actions');
    for (const e of state.study.mindMap.edges) {
      const chip = el('button', 'ds-btn ds-btn-chip', `Połączenie: ${e.label || `${e.from}→${e.to}`} ×`);
      chip.addEventListener('click', () => {
        state.study.mindMap = removeMindMapEdge(state.study.mindMap, e.id);
        scheduleSave();
        renderCurrentStage();
      });
      edgeList.append(chip);
    }
    editor.append(edgeList);
  }

  mmWrap.append(editor);
  mmCard.append(mmWrap);
  root.append(mmCard);

  // Studio Kreatywne Biblii (13 szablonów bez AI)
  const studioCard = el('div', 'ds-card');
  studioCard.append(el('h3', '', 'Studio Kreatywne Biblii (13 szablonów bez użycia AI)'));
  studioCard.append(el('p', 'ds-q-help', 'Wszystkie szablony działają lokalnie i są w pełni edytowalne przez Ciebie.'));

  const tmplRow = el('div', 'ds-row-actions');
  const tmplSel = el('select', 'ds-select');
  tmplSel.setAttribute('aria-label', 'Wybierz szablon twórczy');
  for (const t of CREATIVE_TEMPLATES) {
    const o = el('option', '', t.title);
    o.value = t.id;
    tmplSel.append(o);
  }
  const createBtn = el('button', 'ds-btn ds-btn-primary', 'Utwórz szkic z szablonu');
  createBtn.addEventListener('click', () => {
    const t = CREATIVE_TEMPLATES.find((x) => x.id === tmplSel.value) || CREATIVE_TEMPLATES[0];
    const refText = formatRef(state.bible, state.study.bookId, state.study.chapter, state.study.verseStart, state.study.verseEnd);
    state.study.creativeArtifacts.push({
      id: `art_${Date.now().toString(36)}`,
      templateId: t.id,
      title: `${t.title} — ${refText}`,
      content: t.prompt,
      updatedAt: new Date().toISOString()
    });
    scheduleSave();
    renderCurrentStage();
  });
  tmplRow.append(tmplSel, createBtn);
  studioCard.append(tmplRow);

  const artGrid = el('div', 'ds-question-grid');
  artGrid.style.marginTop = '12px';
  for (const art of state.study.creativeArtifacts) {
    const ac = el('div', 'ds-q-card');
    const head = el('div', 'ds-q-head');
    const ti = el('input', 'ds-input');
    ti.value = art.title;
    ti.setAttribute('aria-label', 'Tytuł pracy twórczej');
    ti.addEventListener('input', () => {
      art.title = ti.value;
      art.updatedAt = new Date().toISOString();
      scheduleSave();
    });
    const del = el('button', 'ds-btn ds-btn-chip', 'Usuń');
    del.addEventListener('click', () => {
      state.study.creativeArtifacts = state.study.creativeArtifacts.filter((x) => x.id !== art.id);
      scheduleSave();
      renderCurrentStage();
    });
    head.append(ti, del);

    const ta = el('textarea', 'ds-textarea');
    ta.rows = 6;
    ta.value = art.content;
    ta.setAttribute('aria-label', `Treść pracy: ${art.title}`);
    ta.addEventListener('input', () => {
      art.content = ta.value;
      art.updatedAt = new Date().toISOString();
      scheduleSave();
    });
    ac.append(head, ta);
    artGrid.append(ac);
  }
  studioCard.append(artGrid);
  root.append(studioCard);
}

function buildShareText(study, bible, sel) {
  const refText = formatRef(bible, study.bookId, study.chapter, study.verseStart, study.verseEnd);
  const lines = [`Głębokie studium — ${refText} (${study.translation || 'UBG'})`];
  if (study.title) lines.push(`Tytuł: ${study.title}`);

  if (sel.includePassage) {
    const verses = getVerseRange(bible, study.bookId, study.chapter, study.verseStart, study.verseEnd);
    lines.push('', 'Tekst Pisma Świętego (UBG):', ...verses.map((v) => `${v.number}. ${v.text}`));
  }
  if (sel.includeObservations) {
    const obs = [...BIG_SIX, ...BIG_TWELVE]
      .filter((q) => study.answers?.[q.id]?.text?.trim())
      .map((q) => `- ${q.title}: ${study.answers[q.id].text.trim()}`);
    if (obs.length) lines.push('', 'Obserwacje tekstu:', ...obs);
  }
  if (sel.includeContext) {
    const ctx = HERMENEUTIC_QUESTIONS
      .filter((q) => study.answers?.[q.id]?.text?.trim())
      .map((q) => `- ${q.title}: ${study.answers[q.id].text.trim()}`);
    if (ctx.length) lines.push('', 'Kontekst:', ...ctx);
  }
  if (sel.includeInterpretation) {
    const it = study.interpretation || {};
    if (it.textSummary || it.interpretation) {
      lines.push('', 'Interpretacja:', it.textSummary || '', it.interpretation || '');
    }
  }
  if (sel.includeApplication) {
    const appLines = APPLICATION_QUESTIONS
      .filter((q) => study.answers?.[q.id]?.text?.trim())
      .map((q) => `- ${q.title}: ${study.answers[q.id].text.trim()}`);
    if (appLines.length) lines.push('', 'Zastosowanie:', ...appLines);
  }
  if (sel.includeCreative && study.creativeArtifacts?.length) {
    lines.push('', 'Prace twórcze:', ...study.creativeArtifacts.map((a) => `### ${a.title}\n${a.content}`));
  }
  if (sel.includeMindMap && study.mindMap?.nodes?.length > 1) {
    lines.push('', 'Mapa myśli:', buildMindMapTextOutline(study.mindMap));
  }
  if (sel.includeCommitments && study.commitments?.length) {
    lines.push('', 'Postanowienia:', ...study.commitments.map((c) => `- ${c.action}${c.dueDate ? ` (${c.dueDate})` : ''}`));
  }
  if (sel.includePrivateNotes && (study.firstImpressions || study.promisesNote || study.interpretation?.uncertainty)) {
    lines.push('', 'Prywatne notatki i niepewność:', study.firstImpressions || '', study.promisesNote || '', study.interpretation?.uncertainty || '');
  }
  if (sel.includePrivatePrayer && (study.prayer?.openingPrayer || study.prayer?.closingPrayer)) {
    lines.push('', 'Prywatna modlitwa:', study.prayer?.openingPrayer || '', study.prayer?.closingPrayer || '');
  }
  return lines.filter((line, idx, arr) => !(line === '' && arr[idx - 1] === '')).join('\n');
}

function buildPrintSheet() {
  if (!state.study || !state.bible) return;
  const sheet = $('#print-sheet');
  sheet.replaceChildren();
  const sel = state.study.shareSelection || DEFAULT_SHARE_SELECTION;
  const text = buildShareText(state.study, state.bible, { ...sel, includePassage: true });

  const h1 = el('h1', '', `Głębokie studium — ${formatRef(state.bible, state.study.bookId, state.study.chapter, state.study.verseStart, state.study.verseEnd)}`);
  const meta = el('p', '', `Przekład: ${state.study.translation || 'UBG'} · Christian Culture (Scrolluj Biblię) · ${new Date().toLocaleDateString('pl-PL')}`);
  const pre = el('div', 'ds-print-section');
  for (const line of text.split('\n')) {
    pre.append(el('p', '', line || '\u00A0'));
  }
  sheet.append(h1, meta, pre);

  if (state.study.mindMap?.nodes?.length > 1) {
    const mm = el('div', 'ds-print-section');
    mm.append(el('h2', '', 'Mapa myśli'));
    const box = el('div');
    box.innerHTML = buildMindMapSvgString(state.study.mindMap);
    mm.append(box);
    sheet.append(mm);
  }
}

function renderStage08(root) {
  // Świadome udostępnianie (modlitwy i prywatne notatki odznaczone domyślnie!)
  const shareCard = el('div', 'ds-card');
  shareCard.append(el('h3', '', 'Świadome udostępnianie i eksport'));
  shareCard.append(el('p', 'ds-q-help', 'Zaznacz dokładnie to, co chcesz wyeksportować lub udostępnić. Modlitwy osobiste, prywatne notatki oraz postanowienia są domyślnie odznaczone.'));

  const checkboxes = [
    ['includePassage', 'Tekst fragmentu (UBG)'],
    ['includeObservations', 'Obserwacje (Wielka Szóstka i Dwunastka)'],
    ['includeContext', 'Kontekst i pytania hermeneutyczne'],
    ['includeInterpretation', 'Interpretacja'],
    ['includeApplication', 'Zastosowanie'],
    ['includeCreative', 'Prace ze Studia Kreatywnego'],
    ['includeMindMap', 'Mapa myśli'],
    ['includeCommitments', 'Postanowienia osobiste (domyślnie ukryte)'],
    ['includePrivateNotes', 'Notatki prywatne i niepewności (domyślnie ukryte)'],
    ['includePrivatePrayer', 'Moje prywatne modlitwy (domyślnie ukryte)']
  ];
  const previewTa = el('textarea', 'ds-textarea');
  previewTa.readOnly = true;
  previewTa.rows = 8;
  previewTa.setAttribute('aria-label', 'Podgląd tekstu do udostępnienia');

  const refreshPreview = () => {
    previewTa.value = buildShareText(state.study, state.bible, state.study.shareSelection);
  };

  const chkGrid = el('div', 'ds-row-actions');
  for (const [key, label] of checkboxes) {
    const lbl = el('label', 'ds-btn ds-btn-chip');
    lbl.style.cursor = 'pointer';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = Boolean(state.study.shareSelection[key]);
    cb.style.width = '18px';
    cb.style.height = '18px';
    cb.addEventListener('change', () => {
      state.study.shareSelection[key] = cb.checked;
      scheduleSave();
      refreshPreview();
    });
    lbl.append(cb, el('span', '', label));
    chkGrid.append(lbl);
  }
  refreshPreview();

  const btnRow = el('div', 'ds-row-actions');
  const copyBtn = el('button', 'ds-btn ds-btn-primary', 'Kopiuj wybrany podgląd');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(previewTa.value);
      notify('Skopiowano wybrany zakres studium.');
    } catch {
      previewTa.select();
      notify('Zaznaczono podgląd do skopiowania.');
    }
  });
  const pdfBtn = el('button', 'ds-btn ds-btn-ghost', 'Eksportuj PDF / Drukuj');
  pdfBtn.addEventListener('click', () => {
    buildPrintSheet();
    window.print();
  });
  const jsonBtn = el('button', 'ds-btn ds-btn-ghost', 'Eksportuj JSON (kopia zapasowa)');
  jsonBtn.addEventListener('click', () => {
    const json = serializeStudyJson(state.study);
    triggerFileDownload(new Blob([json], { type: 'application/json;charset=utf-8' }), `studium-${state.study.bookId}-${state.study.chapter}.json`);
    notify('Pobrano kopię zapasową JSON.');
  });
  const histBtn = el('button', 'ds-btn ds-btn-ghost', 'Otwórz Moje studia');
  histBtn.addEventListener('click', openMyStudiesModal);
  btnRow.append(copyBtn, pdfBtn, jsonBtn, histBtn);

  shareCard.append(chkGrid, previewTa, btnRow);
  root.append(shareCard);

  // Zweryfikowane integracje ekosystemu Christian Culture
  const intCard = el('div', 'ds-card');
  intCard.append(el('h3', '', 'Integracje ekosystemu Christian Culture'));
  const { bookId, chapter, verseStart, verseEnd } = state.study;
  const refText = formatRef(state.bible, bookId, chapter, verseStart, verseEnd);

  const linksRow = el('div', 'ds-row-actions');
  const mkLink = (label, path) => {
    const a = el('a', 'ds-btn ds-btn-ghost', label);
    a.href = ecosystemUrl(path).href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  };
  linksRow.append(
    mkLink('MojaBiblia (kody Stronga)', `/mojabiblia?book=${bookId}&ch=${chapter}&chapter=${chapter}&mode=reader&verse=${verseStart}`),
    mkLink('Biblia Audio (katalog nagrań)', '/biblia-audio'),
    mkLink('Wyszukiwarka CC', `/wyszukiwarka?q=${encodeURIComponent(refText)}`),
    mkLink('Kartki CC', '/kartki/')
  );

  const aiBtn = el('button', 'ds-btn ds-btn-outline-accent', 'AI dla Jezusa (wymaga Twojej zgody)');
  aiBtn.addEventListener('click', openAiConsentModal);
  linksRow.append(aiBtn);
  intCard.append(linksRow);

  intCard.append(
    el('p', 'ds-subtle-note', 'Uwaga o integracjach: AI dla Jezusa nigdy nie wysyła pytań automatycznie i nie używa ukrytych płatnych API. Dedykowana podstrona „Kazania z Pasją” (/kazania) nie jest obecnie opublikowana w repozytorium — zamiast niej możesz skorzystać z Wyszukiwarki CC lub szablonu „Konspekt kazania” w etapie 07.')
  );
  root.append(intCard);
}

function openAiConsentModal() {
  const { bookId, chapter, verseStart, verseEnd } = state.study;
  const verses = getVerseRange(state.bible, bookId, chapter, verseStart, verseEnd);
  const quote = verses.map((v) => `${v.number}. ${v.text}`).join(' ');
  const refText = formatRef(state.bible, bookId, chapter, verseStart, verseEnd);
  const promptText = `Pomóż mi w głębokim studium biblijnym fragmentu ${refText} (UBG): „${quote}”. Zastosuj zasadę Sola Scriptura, wskaż kontekst historyczny i gramatyczny oraz powiązane wersety Pisma.`;

  openModal('AI dla Jezusa — świadomy podgląd i zgoda', (body, close) => {
    body.append(el('p', 'ds-q-help', 'Twoje prywatne notatki i modlitwy NIE są dodawane do zapytania. Możesz sprawdzić dokładną treść pytania przed otwarciem zewnętrznego okna /ai/aplikacja.'));
    const ta = el('textarea', 'ds-textarea');
    ta.value = promptText;
    ta.rows = 4;

    const consentLbl = el('label', 'ds-row-actions');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = false;
    cb.style.width = '20px';
    cb.style.height = '20px';
    consentLbl.append(cb, el('span', '', 'Potwierdzam, że chcę otworzyć AI dla Jezusa z powyższym pytaniem o tekst biblijny.'));

    const row = el('div', 'ds-row-actions');
    const openAiLink = el('a', 'ds-btn ds-btn-primary', 'Otwórz AI dla Jezusa ↗');
    openAiLink.target = '_blank';
    openAiLink.rel = 'noopener noreferrer';
    const syncHref = () => {
      const u = ecosystemUrl('/ai/aplikacja');
      u.searchParams.set('q', ta.value.trim());
      u.searchParams.set('mode', 'Studium Biblijne');
      openAiLink.href = u.href;
    };
    syncHref();
    ta.addEventListener('input', syncHref);
    openAiLink.addEventListener('click', (e) => {
      if (!cb.checked) {
        e.preventDefault();
        notify('Zaznacz najpierw pole świadomej zgody powyżej.');
        return;
      }
      close();
    });

    const copyBtn = el('button', 'ds-btn ds-btn-ghost', 'Skopiuj prompt');
    copyBtn.addEventListener('click', async () => {
      await navigator.clipboard?.writeText(ta.value).catch(() => {});
      notify('Skopiowano treść pytania.');
    });
    row.append(openAiLink, copyBtn);
    body.append(ta, consentLbl, row);
  });
}

function renderCurrentStage() {
  const root = $('#stage-workspace');
  root.replaceChildren();
  const stageMeta = STAGES.find((s) => s.id === state.currentStage) || STAGES[0];
  root.append(stageHeaderCard(stageMeta));

  if (stageMeta.id === '01') renderStage01(root);
  else if (stageMeta.id === '02') renderStage02(root);
  else if (stageMeta.id === '03') renderStage03(root);
  else if (stageMeta.id === '04') renderStage04(root);
  else if (stageMeta.id === '05') renderStage05(root);
  else if (stageMeta.id === '06') renderStage06(root);
  else if (stageMeta.id === '07') renderStage07(root);
  else if (stageMeta.id === '08') renderStage08(root);

  root.append(stageFooterNav(stageMeta.id));
}

async function openMyStudiesModal() {
  let studies = [];
  try {
    studies = await dbEngine.listStudies();
  } catch {
    studies = state.study ? [state.study] : [];
  }

  openModal('Moje studia i dzienniki', (body, close) => {
    const filterRow = el('div', 'ds-row-actions');
    const searchIn = el('input', 'ds-input');
    searchIn.placeholder = 'Szukaj po tytule, notatce lub księdze…';
    searchIn.setAttribute('aria-label', 'Szukaj w Moich studiach');
    searchIn.style.maxWidth = '240px';

    const viewSel = el('select', 'ds-select');
    viewSel.style.maxWidth = '230px';
    for (const [val, lbl] of [
      ['all', 'Wszystkie studia'],
      ['prayers', 'Dziennik modlitw i odkryć'],
      ['commitments', 'Dziennik postanowień'],
      ['promises', 'Dziennik obietnic i oznaczeń']
    ]) {
      const o = el('option', '', lbl);
      o.value = val;
      viewSel.append(o);
    }

    const importBtn = el('label', 'ds-btn ds-btn-ghost', 'Importuj JSON');
    const fileIn = document.createElement('input');
    fileIn.type = 'file';
    fileIn.accept = '.json,application/json';
    fileIn.hidden = true;
    fileIn.addEventListener('change', async () => {
      const file = fileIn.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = parseImportedJson(text);
        for (const item of imported) {
          await dbEngine.saveStudy(item);
        }
        notify(`Zaimportowano ${imported.length} studium.`);
        close();
        void openMyStudiesModal();
      } catch (err) {
        notify(err?.message || 'Błąd importu pliku JSON.');
      }
    });
    importBtn.append(fileIn);

    const backupAllBtn = el('button', 'ds-btn ds-btn-ghost', 'Eksportuj wszystkie (JSON)');
    backupAllBtn.addEventListener('click', () => {
      triggerFileDownload(new Blob([serializeStudyJson(studies)], { type: 'application/json;charset=utf-8' }), 'moje-studia-cc-kopia.json');
    });

    filterRow.append(searchIn, viewSel, importBtn, backupAllBtn);
    body.append(filterRow);

    const listBox = el('div', 'ds-question-grid');
    listBox.style.marginTop = '12px';
    body.append(listBox);

    const renderList = () => {
      listBox.replaceChildren();
      const q = searchIn.value.trim().toLowerCase();
      const mode = viewSel.value;
      const filtered = studies.filter((s) => {
        if (mode === 'prayers' && !s.prayer?.openingPrayer && !s.prayer?.closingPrayer && !s.firstImpressions) return false;
        if (mode === 'commitments' && !(s.commitments || []).length) return false;
        if (mode === 'promises' && !s.promisesNote && !(s.annotations || []).some((a) => a.category === 'obietnice')) return false;
        if (!q) return true;
        const ref = formatRef(state.bible, s.bookId, s.chapter, s.verseStart, s.verseEnd).toLowerCase();
        return ref.includes(q) || (s.title || '').toLowerCase().includes(q) || (s.firstImpressions || '').toLowerCase().includes(q);
      });
      if (!filtered.length) {
        listBox.append(el('p', 'ds-subtle-note', 'Brak pasujących zapisów na tym urządzeniu.'));
        return;
      }
      for (const s of filtered) {
        const c = el('div', 'ds-q-card');
        const refTxt = formatRef(state.bible, s.bookId, s.chapter, s.verseStart, s.verseEnd);
        c.append(
          el('strong', '', `${refTxt}${s.title ? ` — ${s.title}` : ''}`),
          el('p', 'ds-q-help', `Zaktualizowano: ${new Date(s.updatedAt).toLocaleString('pl-PL')} · Tryb: ${s.mode}`)
        );
        const row = el('div', 'ds-row-actions');
        const openB = el('button', 'ds-btn ds-btn-primary', 'Wczytaj');
        openB.addEventListener('click', () => {
          state.study = migrateStudy(s);
          close();
          updateHeader();
          enterWorkshop('01');
        });
        const dupB = el('button', 'ds-btn ds-btn-ghost', 'Duplikuj');
        dupB.addEventListener('click', async () => {
          const copyObj = createEmptyStudy({
            bookId: s.bookId, chapter: s.chapter, verseStart: s.verseStart, verseEnd: s.verseEnd,
            translation: s.translation, title: `${s.title || refTxt} (kopia)`, mode: s.mode, studyType: s.studyType
          });
          const merged = migrateStudy({ ...s, id: copyObj.id, title: copyObj.title, createdAt: copyObj.createdAt });
          await dbEngine.saveStudy(merged);
          close();
          void openMyStudiesModal();
        });
        const delB = el('button', 'ds-btn ds-btn-outline-accent', 'Usuń');
        delB.addEventListener('click', async () => {
          await dbEngine.deleteStudy(s.id);
          studies = studies.filter((x) => x.id !== s.id);
          renderList();
        });
        row.append(openB, dupB, delB);
        c.append(row);
        listBox.append(c);
      }
    };
    searchIn.addEventListener('input', renderList);
    viewSel.addEventListener('change', renderList);
    renderList();
  });
}

function openPassagePickerModal() {
  openModal('Wybierz fragment Biblii UBG', (body, close) => {
    const bookSel = el('select', 'ds-select');
    for (const b of state.bible.books) {
      const o = el('option', '', `${b.namePl} (${b.id})`);
      o.value = b.id;
      bookSel.append(o);
    }
    bookSel.value = state.study?.bookId || 'JHN';

    const chIn = el('input', 'ds-input');
    chIn.type = 'number';
    chIn.min = '1';
    chIn.value = String(state.study?.chapter || 3);

    const vIn = el('input', 'ds-input');
    vIn.type = 'number';
    vIn.min = '1';
    vIn.value = String(state.study?.verseStart || 16);

    const endIn = el('input', 'ds-input');
    endIn.type = 'number';
    endIn.min = '1';
    endIn.value = String(state.study?.verseEnd || 16);

    const goBtn = el('button', 'ds-btn ds-btn-primary', 'Otwórz wybrany fragment');
    goBtn.style.marginTop = '12px';
    goBtn.addEventListener('click', async () => {
      const candidate = parseStudyParams(`?book=${bookSel.value}&ch=${chIn.value}&v=${vIn.value}&end=${endIn.value}&translation=UBG`);
      const valid = validatePassage(state.bible, candidate);
      if (!valid.ok) {
        notify(valid.reason);
        return;
      }
      const nextUrl = new URL(location.href);
      nextUrl.search = new URLSearchParams({
        book: valid.passage.book,
        ch: String(valid.passage.ch),
        v: String(valid.passage.v),
        end: String(valid.passage.end),
        translation: 'UBG'
      }).toString();
      history.replaceState({}, '', nextUrl.href);
      close();
      await activatePassage(valid.passage);
    });

    body.append(
      el('label', 'ds-field-label', 'Księga'), bookSel,
      el('label', 'ds-field-label', 'Rozdział'), chIn,
      el('label', 'ds-field-label', 'Werset początkowy'), vIn,
      el('label', 'ds-field-label', 'Werset końcowy'), endIn,
      goBtn
    );
  });
}

async function activatePassage(passage) {
  let loaded = null;
  try {
    loaded = await dbEngine.findStudyByPassage(passage.book, passage.ch, passage.v, passage.end);
    setSaveStatus('saved', loaded ? 'Wczytano zapisane studium' : 'Gotowe do zapisu lokalnego');
  } catch {
    state.storageBlocked = true;
    setSaveStatus('error', 'IndexedDB niedostępne (tryb tymczasowy)');
  }

  state.study = loaded || createEmptyStudy({
    bookId: passage.book,
    chapter: passage.ch,
    verseStart: passage.v,
    verseEnd: passage.end,
    translation: passage.translation
  });

  if (state.study.mindMap?.nodes?.[0] && !loaded) {
    state.study.mindMap.nodes[0].label = formatRef(state.bible, passage.book, passage.ch, passage.v, passage.end);
    state.study.mindMap.nodes[0].verseRef = state.study.mindMap.nodes[0].label;
  }

  $('#ds-loading-panel').hidden = true;
  $('#ds-error-panel').hidden = true;
  updateHeader();

  // Zawsze otwieraj od ekranu „Czytaj w obecności Autora” przy pierwszym otwarciu fragmentu
  renderOpeningPrayerGate();
}

async function boot() {
  try {
    const savedTheme = localStorage.getItem('cc-sba-deep-study-theme');
    if (savedTheme === 'dark') document.documentElement.dataset.theme = 'dark';
  } catch { /* ignore */ }

  dbEngine.onRemoteSave((msg) => {
    if (state.study && msg.id === state.study.id && msg.updatedAt > (state.study.updatedAt || '')) {
      state.pendingRemoteSave = msg.id;
      $('#ds-conflict-banner').hidden = false;
    }
  });

  const [bibleRes, audioCatalog] = await Promise.all([loadBibleData(), loadAudioCatalog()]);
  state.recordings = audioCatalog;
  if (!bibleRes.ok) {
    $('#ds-loading-msg').textContent = bibleRes.error;
    $('#btn-retry-load').hidden = false;
    setSaveStatus('error', 'Brak danych UBG');
    return;
  }
  state.bible = bibleRes.bible;

  const params = parseStudyParams(location.search);
  const validation = validatePassage(state.bible, params);
  if (!validation.ok) {
    $('#ds-loading-panel').hidden = true;
    $('#ds-error-detail').textContent = validation.reason;
    $('#ds-error-panel').hidden = false;
    $('#btn-use-fallback').onclick = () => activatePassage(validation.fallback);
    $('#btn-open-picker-err').onclick = openPassagePickerModal;
    setSaveStatus('error', 'Nieprawidłowy adres fragmentu');
    return;
  }

  await activatePassage(validation.passage);
}

// Rejestracja stałych zdarzeń UI
$('#btn-retry-load').addEventListener('click', () => location.reload());
$('#btn-stuck-help').addEventListener('click', showStuckHelp);
$('#btn-prayer-stuck').addEventListener('click', showStuckHelp);
$('#btn-start-study').addEventListener('click', () => enterWorkshop('01'));
$('#prayer-personal-input').addEventListener('input', (e) => {
  if (!state.study) return;
  state.study.prayer.openingPrayer = e.target.value;
  scheduleSave();
});

$('#mode-quick').addEventListener('click', () => {
  if (!state.study) return;
  state.study.mode = 'szybki';
  updateHeader();
  updateStageNavAndProgress();
  scheduleSave();
});
$('#mode-full').addEventListener('click', () => {
  if (!state.study) return;
  state.study.mode = 'pelny';
  updateHeader();
  updateStageNavAndProgress();
  scheduleSave();
});

$('#btn-prev-stage').addEventListener('click', () => {
  const idx = STAGES.findIndex((s) => s.id === state.currentStage);
  if (idx > 0) selectStage(STAGES[idx - 1].id);
});
$('#btn-next-stage').addEventListener('click', () => {
  const idx = STAGES.findIndex((s) => s.id === state.currentStage);
  if (idx < STAGES.length - 1) selectStage(STAGES[idx + 1].id);
});
$('#btn-save-now').addEventListener('click', () => scheduleSave(true));
$('#btn-my-studies').addEventListener('click', openMyStudiesModal);
$('#btn-export-modal').addEventListener('click', () => enterWorkshop('08'));
$('#btn-change-passage').addEventListener('click', openPassagePickerModal);
$('#btn-play-passage-audio').addEventListener('click', togglePassageAudio);
$('#ds-modal-close').addEventListener('click', () => $('#ds-modal').close());
$('#ds-modal').addEventListener('click', (e) => { if (e.target === $('#ds-modal')) $('#ds-modal').close(); });

$('#btn-theme-toggle').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  if (next === 'dark') document.documentElement.dataset.theme = 'dark';
  else delete document.documentElement.dataset.theme;
  try { localStorage.setItem('cc-sba-deep-study-theme', next); } catch { /* ignore */ }
});

$('#btn-toggle-bible-mobile').addEventListener('click', () => {
  const body = $('#bible-panel-body');
  const collapsed = body.classList.toggle('is-collapsed');
  $('#btn-toggle-bible-mobile').setAttribute('aria-expanded', String(!collapsed));
  $('#btn-toggle-bible-mobile').textContent = collapsed ? 'Rozwiń tekst' : 'Zwiń tekst';
});

for (const btn of document.querySelectorAll('.ds-range-bar [data-range]')) {
  btn.addEventListener('click', () => {
    state.rangeMode = btn.dataset.range;
    renderBiblePanel();
  });
}

$('#btn-conflict-load').addEventListener('click', async () => {
  if (!state.pendingRemoteSave) return;
  try {
    const fresh = await dbEngine.getStudy(state.pendingRemoteSave);
    if (fresh) state.study = fresh;
    state.pendingRemoteSave = null;
    $('#ds-conflict-banner').hidden = true;
    updateHeader();
    renderBiblePanel();
    renderCurrentStage();
    notify('Wczytano nowszą wersję z drugiej karty.');
  } catch {
    notify('Nie udało się wczytać wersji z drugiej karty.');
  }
});
$('#btn-conflict-keep').addEventListener('click', () => {
  state.pendingRemoteSave = null;
  $('#ds-conflict-banner').hidden = true;
  scheduleSave(true);
});

window.addEventListener('pagehide', () => {
  if (state.study && state.saveTimer) {
    clearTimeout(state.saveTimer);
    void dbEngine.saveStudy(state.study).catch(() => {});
  }
});

$('#btn-theme-toggle').addEventListener('keydown', () => {});
void boot();
