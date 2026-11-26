const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const STORAGE_PREFIX = 'cc_ai_dla_jezusa_v2';
const DEFAULT_ASSISTANT_ID = 'ai-dla-jezusa';
const AI_PERSONAS = {
  'ai-dla-jezusa': {
    id: 'ai-dla-jezusa',
    name: 'AI dla Jezusa',
    gender: 'male',
    role: 'Główny Asystent CC',
    avatar: '/ai/assets/icon-ai-halo.webp',
    avatarFallback: '/ai/assets/icon-ai-halo.webp',
    rate: 1.0,
    pitch: 0.94
  },
  rut: {
    id: 'rut',
    name: 'Rut',
    gender: 'female',
    role: 'Gospodyni CC · Radio, VOD i Społeczność',
    avatar: '/images/chat/lumi_avatar_rut_circle.webp',
    avatarFallback: '/images/chat/assistants/asystentka-1.webp',
    rate: 1.02,
    pitch: 1.06
  },
  lea: {
    id: 'lea',
    name: 'Lea',
    gender: 'female',
    role: 'Planistka · Kurs Codzienny i Akademia',
    avatar: '/images/chat/lumi_avatar_lea_circle.webp',
    avatarFallback: '/images/chat/assistants/asystentka-2.webp',
    rate: 1.04,
    pitch: 1.0
  },
  noemi: {
    id: 'noemi',
    name: 'Noemi',
    gender: 'female',
    role: 'Doradczyni Biblijna · Słowo i Modlitwa',
    avatar: '/images/chat/lumi_avatar_noemi_circle.webp',
    avatarFallback: '/images/chat/assistants/asystentka-3.webp',
    rate: 0.96,
    pitch: 0.96
  },
  miriam: {
    id: 'miriam',
    name: 'Miriam',
    gender: 'female',
    role: 'Psalmy, Biblia Śpiewana i Uwielbienie',
    avatar: '/images/chat/lumi_avatar_miriam_circle.webp',
    avatarFallback: '/images/chat/assistants/asystentka-4.webp',
    rate: 1.0,
    pitch: 1.1
  }
};

function getPersona(id) {
  return AI_PERSONAS[id] || AI_PERSONAS[DEFAULT_ASSISTANT_ID];
}

async function getAuthHeaders() {
  try {
    const fbUser = luminaDb?.getFirebaseAuthUser?.() || currentUser;
    if (fbUser && typeof fbUser.getIdToken === 'function') {
      const tok = await fbUser.getIdToken();
      if (tok) return { Authorization: `Bearer ${tok}` };
    }
  } catch {}
  return {};
}

function syncOwnerModelMenu() {
  if (!modelMenu) return;
  modelMenu.querySelectorAll('.owner-model-opt').forEach((el) => el.remove());
  if (!ownerSession?.isOwner || !Array.isArray(ownerSession.models)) return;
  for (const m of ownerSession.models) {
    const opt = document.createElement('button');
    opt.type = 'button';
    opt.role = 'option';
    opt.className = 'dropdown-option owner-model-opt' + (selectedOwnerModel === m.id ? ' active' : '');
    opt.dataset.ownerModel = m.id;
    const span = document.createElement('span');
    span.textContent = m.note;
    opt.append(document.createTextNode(`${m.label} `), span);
    opt.addEventListener('click', () => {
      selectedOwnerModel = m.id;
      activeModelLabel.textContent = m.label;
      modelMenu.hidden = true;
      modelPickerBtn?.setAttribute('aria-expanded', 'false');
      syncOwnerModelMenu();
      showToast(`Wybrano silnik właściciela: ${m.label}`);
    });
    modelMenu.appendChild(opt);
  }
}

async function refreshOwnerSession() {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders.Authorization) {
    ownerSession = null;
    selectedOwnerModel = '';
    syncOwnerModelMenu();
    updateProfileFooterButton();
    return;
  }
  try {
    const res = await fetch('/api/ai-dla-jezusa/v1/owner/session', {
      method: 'GET',
      headers: authHeaders
    });
    if (!res.ok) {
      ownerSession = null;
      selectedOwnerModel = '';
    } else {
      const data = await res.json();
      if (data?.isOwner) {
        ownerSession = data;
        if (!selectedOwnerModel && data.models?.[0]?.id) {
          selectedOwnerModel = data.models[0].id;
        }
      } else {
        ownerSession = null;
      }
    }
  } catch {
    ownerSession = null;
  }
  syncOwnerModelMenu();
  updateProfileFooterButton();
  if (['Umiejętności', 'Połączenia', 'Automatyzacje'].includes(currentNav)) {
    renderModule(currentNav);
  }
}

async function runOwnerAction(payload) {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders.Authorization) {
    showToast('Zaloguj się jako właściciel, aby wykonać tę akcję.');
    return null;
  }
  const res = await fetch('/api/ai-dla-jezusa/v1/owner/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify(payload || {})
  });
  return res.json();
}

const DEFAULT_PROJECTS = [
  'Studium Listu do Rzymian',
  'Plan treści – grudzień',
  'Cykl: Nadzieja w Piśmie'
];
const STARTER_CHATS = [
  {
    id: 'starter-rzymian',
    title: 'Studium Listu do Rzymian',
    starterPrompt: 'Przygotuj uporządkowane wprowadzenie do Listu do Rzymian (kontekst, główne tematy, kluczowe wersety UBG).'
  },
  {
    id: 'starter-plan',
    title: 'Plan tygodnia',
    starterPrompt: 'Pomóż mi ułożyć chrześcijański plan tygodnia z czasem na modlitwę, Słowo Boże, pracę i odpoczynek.'
  },
  {
    id: 'starter-scenariusz',
    title: 'Scenariusz filmu',
    starterPrompt: 'Napisz propozycję scenariusza krótkiego filmu Christian Culture o nadziei płynącej z Ewangelii (mocne otwarcie, główna myśl, wezwanie do działania).'
  }
];

const CC_AGENTS = [
  {
    id: 'biblista',
    name: 'Biblista UBG',
    mode: 'Studium Biblijne',
    desc: 'Egzegeza werset po wersecie, tło historyczne i wierne cytaty z Uwspółcześnionej Biblii Gdańskiej.',
    prompt: 'Wciel się w Biblistę UBG: pomóż mi przestudiować wybrany fragment Pisma Świętego krok po kroku.'
  },
  {
    id: 'redaktor',
    name: 'Redaktor CCN News',
    mode: 'Twórczość CC',
    desc: 'Artykuły światopoglądowe, analizy kulturowe i komentarze biblijne w standardzie Christian Culture.',
    prompt: 'Pomóż mi przygotować rzetelny artykuł redakcyjny CCN News z biblijnym punktem odniesienia (UBG).'
  },
  {
    id: 'shorts',
    name: 'Scenarzysta Shorts 9:16',
    mode: 'Twórczość CC',
    desc: 'Dynamiczne 45-sekundowe scenariusze z mocnym hakiem WOW w pierwszych 3 sekundach.',
    prompt: 'Napisz 3 propozycje dynamicznego scenariusza Shorts 9:16 o wierze i nadziei na dziś.'
  },
  {
    id: 'badacz',
    name: 'Badacz Źródeł CC',
    mode: 'Deep Research',
    desc: 'Głębokie przeszukiwanie 700+ zweryfikowanych dokumentów, lekcji Akademii i publikacji pionierów.',
    prompt: 'Przeprowadź analizę Deep Research w zasobach Christian Culture na temat usprawiedliwienia z wiary.'
  }
];

const MODULE_TEMPLATES = {
  Pracownia: [
    { title: 'Szkic kazania / rozważania', mode: 'Twórczość CC', prompt: 'Przygotuj konspekt 15-minutowego rozważania biblijnego o zaufaniu Bogu w chwilach niepewności (Prz 3,5 UBG).' },
    { title: 'Scenariusz rolki 9:16', mode: 'Twórczość CC', prompt: 'Napisz scenariusz krótkiego filmu pionowego (45 sekund) zachęcającego do codziennego czytania Biblii.' },
    { title: 'Post do społeczności LUMINA', mode: 'Twórczość CC', prompt: 'Napisz serdeczny, autentyczny post o wdzięczności Bogu za codzienną łaskę.' },
    { title: 'Korekta i redakcja tekstu', mode: 'Twórczość CC', prompt: 'Sprawdź i popraw styl, klarowność oraz strukturę tekstu, który zaraz wkleję poniżej:' }
  ],
  Kod: [
    { title: 'Audyt dostępności WWW (44px)', mode: 'CC Auto', prompt: 'Przygotuj krótką listę kontrolną WCAG i ergonomii mobilnej 44x44px dla podstron ekosystemu Christian Culture.' },
    { title: 'Integracja MCP / REST API', mode: 'Deep Research', prompt: 'Wyjaśnij, jak podłączyć serwer MCP Christian Culture (/api/ai-dla-jezusa/v1/mcp) do aplikacji klienckiej.' }
  ],
  Umiejętności: [
    { title: 'Kontrola cytatu UBG', mode: 'Studium Biblijne', prompt: 'Zweryfikuj dokładne brzmienie oraz kontekst wersetu: Jan 3,16 (UBG).' },
    { title: 'Tłumaczenie misyjne PL → EN', mode: 'Twórczość CC', prompt: 'Przetłumacz poniższy tekst ewangelizacyjny na naturalny, współczesny język angielski:' }
  ],
  Automatyzacje: [
    { title: 'Poranny rytm Kursu Codziennego', mode: 'CC Auto', prompt: 'Ułóż codzienną 15-minutową rutynę porannej modlitwy, lektury Kursu Codziennego i słuchania Biblii Audio.' },
    { title: 'Plan publikacji tygodnia', mode: 'Twórczość CC', prompt: 'Zaplanuj harmonogram treści misyjnych od poniedziałku do soboty dla strony i kanałów społecznościowych.' }
  ]
};

const mainWorkspace = $('.main-workspace');
const workspaceFooter = $('.workspace-footer');
const promptInput = $('#prompt');
const composerBox = $('.composer-box');
const composerForm = $('#composerForm');
const welcomeStage = $('#welcomeStage');
const promptGrid = $('.prompt-grid');
const conversationStage = $('#conversationStage');
const conversationLog = $('#conversationLog');
const scrim = $('#scrim');
const openLeftBtn = $('#openLeftDrawer');
const closeLeftBtn = $('#closeLeftDrawer');
const openRightBtn = $('#openRightDrawer');
const closeRightBtn = $('#closeRightDrawer');
const modelPickerBtn = $('#modelPickerBtn');
const modelMenu = $('#modelMenu');
const activeModelLabel = $('#activeModelLabel');
const toolsBtn = $('#toolsBtn');
const toolsMenu = $('#toolsMenu');
const webSearchBtn = $('#webSearchBtn');
const privacyToggleBtn = $('#privacyToggleBtn');
const chatSearchInput = $('#chatSearchInput');
const recentChatsList = $('#recentChats');
const attachBtn = $('#attachBtn');
const fileInput = $('#fileInput');
const attachmentChip = $('#attachmentChip');
const voiceBar = $('#voiceBar');
const voiceStatusLabel = $('#voiceStatusLabel');
const voiceTimerEl = $('#voiceTimer');
const voiceWave = $('#voiceWave');
const voiceInterimEl = $('#voiceInterim');
const voiceStopBtn = $('#voiceStopBtn');
const ambientCanvas = $('#aiAmbientCanvas');
const assistantStrip = $('#assistantStrip');
const voiceAutoReadBtn = $('#voiceAutoReadBtn');
const micBtn = $('#micBtn');
const sendBtn = $('#sendBtn');
const infoDialog = $('#infoDialog');
const infoDialogTitle = $('#infoDialogTitle');
const infoDialogBody = $('#infoDialogBody');
const toastEl = $('#toast');

// Dynamiczny slot dla zadokowanego kompozytora w widoku aktywnej rozmowy + kontener modułów
const dockedComposerSlot = document.createElement('div');
dockedComposerSlot.className = 'docked-composer-slot';
dockedComposerSlot.hidden = true;
mainWorkspace?.insertBefore(dockedComposerSlot, workspaceFooter);

const moduleStage = document.createElement('div');
moduleStage.id = 'moduleStage';
moduleStage.className = 'module-stage';
moduleStage.hidden = true;
conversationStage?.appendChild(moduleStage);

let currentUser = null;
let luminaDb = null;
let state = loadState('guest');
let byokConfig = loadByokConfig('guest');
let activeThreadId = null;
let ephemeralThread = null;
let currentNav = 'Czat';
let currentMode = 'CC Auto';
let selectedTools = new Set();
let webSearchEnabled = false;
let privateMode = false;
let attachmentName = '';
let attachmentText = '';
let attachmentMediaUrl = '';
let attachmentMediaKind = '';
let busy = false;
let ownerSession = null;
let selectedOwnerModel = '';
let autoReadEnabled = false;
let activeSpeakingBubble = null;
let activeAudioEl = null;
let toastTimer = null;
let recognition = null;
let isListening = false;
let dictationBaseText = '';
let dictationFinalText = '';
let dictationStartedAt = 0;
let dictationTimerId = null;
let voiceRafId = 0;
let audioCtx = null;
let analyser = null;
let micStream = null;
let speechEnergy = 0;
let streamRevealTimer = null;
const waveBars = voiceWave ? Array.from(voiceWave.querySelectorAll('span')) : [];

function getActiveAssistantId() {
  return AI_PERSONAS[state?.assistantId] ? state.assistantId : DEFAULT_ASSISTANT_ID;
}

function setActiveAssistant(id, { announce = true } = {}) {
  const persona = getPersona(id);
  state.assistantId = persona.id;
  saveState();
  syncAssistantButtons();
  if (announce) {
    showToast(`${persona.gender === 'female' ? 'Aktywna asystentka' : 'Aktywny asystent'}: ${persona.name} (${persona.role})`);
  }
}

function syncAssistantButtons() {
  const activeId = getActiveAssistantId();
  $$('.assistant-pill').forEach((btn) => {
    const match = btn.dataset.assistant === activeId;
    btn.classList.toggle('active', match);
    btn.setAttribute('aria-checked', String(match));
  });
}

function buildAssistantBar(className = 'chat-assistant-bar') {
  const bar = document.createElement('div');
  bar.className = className;

  const label = document.createElement('span');
  label.className = 'chat-assistant-bar-label';
  label.textContent = 'Rozmawiasz z:';

  const group = document.createElement('div');
  group.className = 'chat-assistant-pills';
  group.setAttribute('role', 'radiogroup');
  group.setAttribute('aria-label', 'Zmień asystenta w rozmowie');

  const activeId = getActiveAssistantId();
  for (const p of Object.values(AI_PERSONAS)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'assistant-pill' + (p.id === activeId ? ' active' : '');
    btn.dataset.assistant = p.id;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(p.id === activeId));

    const img = document.createElement('img');
    img.src = p.avatar;
    img.alt = p.name;
    img.width = 22;
    img.height = 22;
    img.onerror = () => {
      if (p.avatarFallback && img.src !== location.origin + p.avatarFallback) {
        img.src = p.avatarFallback;
      }
    };

    const span = document.createElement('span');
    span.textContent = p.name;
    btn.append(img, span);
    btn.addEventListener('click', () => setActiveAssistant(p.id));
    group.appendChild(btn);
  }

  bar.append(label, group);
  return bar;
}

function pauseActiveAudio(exceptEl = null) {
  if (activeAudioEl && activeAudioEl !== exceptEl) {
    try { activeAudioEl.pause(); } catch {}
    activeAudioEl = null;
  }
}

function openImageLightbox(src, title = 'Podgląd grafiki Christian Culture') {
  if (!src) return;
  infoDialogTitle.textContent = title;
  infoDialogBody.replaceChildren();
  const img = document.createElement('img');
  img.src = src;
  img.alt = title;
  img.style.width = '100%';
  img.style.maxHeight = '65vh';
  img.style.objectFit = 'contain';
  img.style.borderRadius = '12px';
  infoDialogBody.appendChild(img);
  infoDialog.showModal();
}

function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel?.();
  } catch {}
  if (activeSpeakingBubble) {
    activeSpeakingBubble.classList.remove('is-speaking');
    activeSpeakingBubble.querySelectorAll('.is-speaking-btn').forEach((b) => {
      b.classList.remove('is-speaking-btn');
      b.textContent = '🔊 Odsłuchaj';
    });
    activeSpeakingBubble = null;
  }
}

function stripMarkdownForSpeech(mdText) {
  return String(mdText || '')
    .replace(/```[\s\S]*?```/g, ' kod programu ')
    .replace(/[*_#`>~]/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function speakReply(text, assistantId, bubbleEl, btnEl) {
  const synth = window.speechSynthesis;
  if (!synth || typeof window.SpeechSynthesisUtterance !== 'function') {
    showToast('Twoja przeglądarka nie obsługuje syntezatora mowy.');
    return;
  }

  const wasSameBubble = activeSpeakingBubble === bubbleEl && synth.speaking;
  stopSpeaking();
  if (wasSameBubble) return;

  const clean = stripMarkdownForSpeech(text).slice(0, 1400);
  if (!clean) return;

  const persona = getPersona(assistantId);
  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = 'pl-PL';
  utter.rate = persona.rate || 1.0;
  utter.pitch = persona.pitch || 1.0;

  try {
    const voices = synth.getVoices?.() || [];
    const plVoices = voices.filter((v) => /^pl/i.test(v.lang));
    const femaleRe = /(zofia|paulina|ewa|agnieszka|ola|maja|karolina|katarzyna|anna|female|natural)/i;
    const maleRe = /(marek|adam|krzysztof|piotr|pawe[łl]|jacek|jan|bartek|tomasz|male)/i;
    if (persona.gender === 'female') {
      const plFemaleVoice = plVoices.find((v) => femaleRe.test(v.name)) || plVoices[0];
      if (plFemaleVoice) utter.voice = plFemaleVoice;
    } else {
      const plMaleVoice =
        plVoices.find((v) => maleRe.test(v.name)) ||
        plVoices.find((v) => !femaleRe.test(v.name));
      if (plMaleVoice) {
        utter.voice = plMaleVoice;
      } else if (plVoices[0]) {
        utter.voice = plVoices[0];
        utter.pitch = Math.min(persona.pitch || 0.94, 0.88);
      }
    }
  } catch {}

  activeSpeakingBubble = bubbleEl;
  bubbleEl?.classList.add('is-speaking');
  if (btnEl) {
    btnEl.classList.add('is-speaking-btn');
    btnEl.textContent = '⏹ Zatrzymaj głos';
  }

  utter.onend = () => stopSpeaking();
  utter.onerror = () => stopSpeaking();
  try {
    synth.speak(utter);
  } catch {
    stopSpeaking();
  }
}

function getUidScope(uid = currentUser?.uid) {
  return uid ? String(uid) : 'guest';
}

function getStorageKey(uid) {
  return `${STORAGE_PREFIX}:${getUidScope(uid)}`;
}

function getByokKey(uid) {
  return `${STORAGE_PREFIX}:byok:${getUidScope(uid)}`;
}

function loadState(uid = currentUser?.uid) {
  const empty = {
    chats: [],
    notes: [],
    memory: [],
    projects: [...DEFAULT_PROJECTS],
    leftCollapsed: false,
    rightCollapsed: false
  };
  try {
    const raw = JSON.parse(localStorage.getItem(getStorageKey(uid)) || localStorage.getItem(STORAGE_PREFIX) || 'null');
    if (!raw || typeof raw !== 'object') return empty;
    return {
      chats: Array.isArray(raw.chats) ? raw.chats.slice(0, 40) : [],
      notes: Array.isArray(raw.notes) ? raw.notes.slice(0, 60) : [],
      memory: Array.isArray(raw.memory) ? raw.memory.slice(0, 20) : [],
      projects: Array.isArray(raw.projects) && raw.projects.length ? raw.projects.slice(0, 20) : [...DEFAULT_PROJECTS],
      assistantId: typeof raw.assistantId === 'string' && AI_PERSONAS[raw.assistantId] ? raw.assistantId : DEFAULT_ASSISTANT_ID,
      leftCollapsed: Boolean(raw.leftCollapsed),
      rightCollapsed: Boolean(raw.rightCollapsed)
    };
  } catch {
    return { ...empty, assistantId: DEFAULT_ASSISTANT_ID };
  }
}

function saveState() {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(state));
  } catch {
    showToast('Pamięć przeglądarki jest pełna — historia działa tylko w tej sesji.');
  }
}

function loadByokConfig(uid = currentUser?.uid) {
  try {
    const raw = JSON.parse(localStorage.getItem(getByokKey(uid)) || 'null');
    if (!raw || typeof raw !== 'object') return { provider: '', apiKey: '', model: '' };
    return {
      provider: typeof raw.provider === 'string' ? raw.provider : '',
      apiKey: typeof raw.apiKey === 'string' ? raw.apiKey : '',
      model: typeof raw.model === 'string' ? raw.model : ''
    };
  } catch {
    return { provider: '', apiKey: '', model: '' };
  }
}

function saveByokConfig(nextCfg) {
  byokConfig = {
    provider: String(nextCfg?.provider || '').trim(),
    apiKey: String(nextCfg?.apiKey || '').trim(),
    model: String(nextCfg?.model || '').trim()
  };
  try {
    if (!byokConfig.provider || !byokConfig.apiKey) {
      localStorage.removeItem(getByokKey());
    } else {
      localStorage.setItem(getByokKey(), JSON.stringify(byokConfig));
    }
  } catch {
    // ignoruj brak localStorage
  }
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 3400);
}

function openDialog(title, lines) {
  infoDialogTitle.textContent = title;
  infoDialogBody.replaceChildren();
  const list = Array.isArray(lines) ? lines : [lines];
  for (const line of list) {
    const p = document.createElement('p');
    p.textContent = line;
    infoDialogBody.appendChild(p);
  }
  infoDialog.showModal();
}

function isLeftOverlayMode() {
  return window.innerWidth <= 840;
}

function isRightOverlayMode() {
  return window.innerWidth <= 1180;
}

let panelResizeTimer = null;

function syncPanelButtons() {
  const leftOverlay = isLeftOverlayMode();
  const rightOverlay = isRightOverlayMode();
  const leftCollapsedDesktop = Boolean(state.leftCollapsed) && !leftOverlay;
  const rightCollapsedDesktop = Boolean(state.rightCollapsed) && !rightOverlay;

  document.body.classList.toggle('left-collapsed', leftCollapsedDesktop);
  document.body.classList.toggle('right-collapsed', rightCollapsedDesktop);

  const leftOpen = leftOverlay
    ? document.body.classList.contains('left-drawer-open')
    : !leftCollapsedDesktop;
  const rightOpen = rightOverlay
    ? document.body.classList.contains('right-drawer-open')
    : !rightCollapsedDesktop;

  if (openLeftBtn) {
    openLeftBtn.setAttribute('aria-expanded', leftOpen ? 'true' : 'false');
    openLeftBtn.setAttribute('aria-label', leftOpen ? 'Ukryj lewy panel' : 'Pokaż lewy panel');
    openLeftBtn.classList.toggle('is-collapsed', !leftOpen && !leftOverlay);
  }
  if (openRightBtn) {
    openRightBtn.setAttribute('aria-expanded', rightOpen ? 'true' : 'false');
    openRightBtn.setAttribute('aria-label', rightOpen ? 'Ukryj prawy panel' : 'Pokaż prawy panel');
    openRightBtn.classList.toggle('is-collapsed', !rightOpen && !rightOverlay);
  }

  clearTimeout(panelResizeTimer);
  panelResizeTimer = setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 260);
}

function closeDrawers() {
  document.body.classList.remove('left-drawer-open', 'right-drawer-open');
  scrim.hidden = true;
  syncPanelButtons();
}

function openLeftDrawer() {
  closeDrawers();
  document.body.classList.add('left-drawer-open');
  scrim.hidden = false;
  syncPanelButtons();
}

function openRightDrawer() {
  closeDrawers();
  document.body.classList.add('right-drawer-open');
  scrim.hidden = false;
  syncPanelButtons();
}

function toggleLeftPanel() {
  if (isLeftOverlayMode()) {
    if (document.body.classList.contains('left-drawer-open')) closeDrawers();
    else openLeftDrawer();
    return;
  }
  state.leftCollapsed = !state.leftCollapsed;
  saveState();
  syncPanelButtons();
}

function closeLeftPanel() {
  if (isLeftOverlayMode()) {
    closeDrawers();
    return;
  }
  state.leftCollapsed = true;
  saveState();
  syncPanelButtons();
}

function toggleRightPanel() {
  if (isRightOverlayMode()) {
    if (document.body.classList.contains('right-drawer-open')) closeDrawers();
    else openRightDrawer();
    return;
  }
  state.rightCollapsed = !state.rightCollapsed;
  saveState();
  syncPanelButtons();
}

function closeRightPanel() {
  if (isRightOverlayMode()) {
    closeDrawers();
    return;
  }
  state.rightCollapsed = true;
  saveState();
  syncPanelButtons();
}

openLeftBtn?.addEventListener('click', toggleLeftPanel);
closeLeftBtn?.addEventListener('click', closeLeftPanel);
openRightBtn?.addEventListener('click', toggleRightPanel);
closeRightBtn?.addEventListener('click', closeRightPanel);
scrim?.addEventListener('click', closeDrawers);
window.addEventListener('resize', () => {
  if (!isLeftOverlayMode()) document.body.classList.remove('left-drawer-open');
  if (!isRightOverlayMode()) document.body.classList.remove('right-drawer-open');
  scrim.hidden = !document.body.classList.contains('left-drawer-open') && !document.body.classList.contains('right-drawer-open');
  document.body.classList.toggle('left-collapsed', Boolean(state.leftCollapsed) && !isLeftOverlayMode());
  document.body.classList.toggle('right-collapsed', Boolean(state.rightCollapsed) && !isRightOverlayMode());
}, { passive: true });
$('#closeDialogBtn')?.addEventListener('click', () => infoDialog.close());

infoDialog?.addEventListener('click', (e) => {
  if (e.target === infoDialog) infoDialog.close();
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
    e.preventDefault();
    if (e.shiftKey) toggleRightPanel();
    else toggleLeftPanel();
    return;
  }
  if (e.key === 'Escape') {
    if (isListening) stopDictation();
    stopSpeaking();
    closeDrawers();
    modelMenu.hidden = true;
    toolsMenu.hidden = true;
    modelPickerBtn?.setAttribute('aria-expanded', 'false');
    toolsBtn?.setAttribute('aria-expanded', 'false');
  }
});

// ================= ZARZĄDZANIE WIDOKIEM I KOMPOZYTOREM =================
function dockComposerToBottom() {
  if (composerBox.parentElement !== dockedComposerSlot) {
    dockedComposerSlot.appendChild(composerBox);
  }
  dockedComposerSlot.hidden = false;
}

function returnComposerToWelcome() {
  if (composerBox.parentElement !== welcomeStage) {
    welcomeStage.insertBefore(composerBox, promptGrid);
  }
  dockedComposerSlot.hidden = true;
}

function getActiveThread() {
  if (privateMode) return ephemeralThread;
  return state.chats.find((c) => c.id === activeThreadId) || null;
}

function showWelcomeView() {
  currentNav = 'Czat';
  setActiveNav('Czat');
  returnComposerToWelcome();
  welcomeStage.hidden = false;
  conversationStage.hidden = true;
  conversationLog.hidden = false;
  moduleStage.hidden = true;
}

function showConversationView() {
  currentNav = 'Czat';
  setActiveNav('Czat');
  welcomeStage.hidden = true;
  conversationStage.hidden = false;
  conversationLog.hidden = false;
  moduleStage.hidden = true;
  dockComposerToBottom();
  renderConversation();
}

function showModuleView(name) {
  currentNav = name;
  setActiveNav(name);
  welcomeStage.hidden = true;
  conversationStage.hidden = false;
  conversationLog.hidden = true;
  moduleStage.hidden = false;
  dockedComposerSlot.hidden = true;
  renderModule(name);
}

function setActiveNav(name) {
  $$('.nav-item').forEach((b) => {
    const isMatch = b.dataset.nav === name;
    b.classList.toggle('active', isMatch);
    if (isMatch) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
}

// ================= BEZPIECZNY RENDERER MARKDOWN (DOM-ONLY) =================
function appendInlineFormatted(parent, text) {
  const tokenRe = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let m;
  while ((m = tokenRe.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parent.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
    }
    const tok = m[0];
    if (tok.startsWith('**') && tok.endsWith('**')) {
      const strong = document.createElement('strong');
      strong.textContent = tok.slice(2, -2);
      parent.appendChild(strong);
    } else if (tok.startsWith('*') && tok.endsWith('*')) {
      const em = document.createElement('em');
      em.textContent = tok.slice(1, -1);
      parent.appendChild(em);
    } else if (tok.startsWith('`') && tok.endsWith('`')) {
      const code = document.createElement('code');
      code.textContent = tok.slice(1, -1);
      parent.appendChild(code);
    }
    lastIndex = tokenRe.lastIndex;
  }
  if (lastIndex < text.length) {
    parent.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

function renderMarkdownSafe(markdownText) {
  const container = document.createElement('div');
  container.className = 'ai-md';
  const lines = String(markdownText || '').replace(/\r/g, '').split('\n');

  let listEl = null;
  let listTag = '';
  let quoteLines = [];
  let inCode = false;
  let codeLines = [];

  const flushList = () => {
    if (listEl) {
      container.appendChild(listEl);
      listEl = null;
      listTag = '';
    }
  };

  const flushQuote = () => {
    if (quoteLines.length) {
      const bq = document.createElement('blockquote');
      appendInlineFormatted(bq, quoteLines.join(' '));
      container.appendChild(bq);
      quoteLines = [];
    }
  };

  for (const rawLine of lines) {
    if (rawLine.trim().startsWith('```')) {
      flushList();
      flushQuote();
      if (!inCode) {
        inCode = true;
        codeLines = [];
      } else {
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = codeLines.join('\n');
        pre.appendChild(code);
        container.appendChild(pre);
        inCode = false;
        codeLines = [];
      }
      continue;
    }

    if (inCode) {
      codeLines.push(rawLine);
      continue;
    }

    const line = rawLine.trim();
    if (!line) {
      flushList();
      flushQuote();
      continue;
    }

    if (line.startsWith('>')) {
      flushList();
      quoteLines.push(line.replace(/^>\s?/, ''));
      continue;
    }
    flushQuote();

    const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      flushList();
      const tag = hMatch[1].length <= 2 ? 'h2' : 'h3';
      const heading = document.createElement(tag);
      appendInlineFormatted(heading, hMatch[2]);
      container.appendChild(heading);
      continue;
    }

    const ulMatch = line.match(/^[-*•]\s+(.+)$/);
    if (ulMatch) {
      if (listTag !== 'ul') {
        flushList();
        listEl = document.createElement('ul');
        listTag = 'ul';
      }
      const li = document.createElement('li');
      appendInlineFormatted(li, ulMatch[1]);
      listEl.appendChild(li);
      continue;
    }

    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (listTag !== 'ol') {
        flushList();
        listEl = document.createElement('ol');
        listTag = 'ol';
      }
      const li = document.createElement('li');
      appendInlineFormatted(li, olMatch[1]);
      listEl.appendChild(li);
      continue;
    }

    flushList();
    const p = document.createElement('p');
    appendInlineFormatted(p, line);
    container.appendChild(p);
  }

  flushList();
  flushQuote();
  if (inCode && codeLines.length) {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = codeLines.join('\n');
    pre.appendChild(code);
    container.appendChild(pre);
  }
  return container;
}

// ================= RENDEROWANIE HISTORII I ROZMOWY =================
function renderRecentChats() {
  recentChatsList.replaceChildren();
  const query = chatSearchInput.value.trim().toLowerCase();

  const items = state.chats.length
    ? state.chats.map((c) => ({ id: c.id, title: c.title, isSaved: true }))
    : STARTER_CHATS.map((s) => ({ id: s.id, title: s.title, starterPrompt: s.starterPrompt, isSaved: false }));

  for (const item of items) {
    if (query && !item.title.toLowerCase().includes(query)) continue;
    const li = document.createElement('li');
    li.className = 'recent-row';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'recent-item' + (item.isSaved && item.id === activeThreadId ? ' active' : '');

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8Z');
    svg.appendChild(path);

    const span = document.createElement('span');
    span.textContent = item.title;
    btn.append(svg, span);

    btn.addEventListener('click', () => {
      if (busy) return;
      if (item.isSaved) {
        activeThreadId = item.id;
        showConversationView();
      } else {
        startPromptDirectly(item.starterPrompt, item.title);
      }
      closeDrawers();
    });

    li.appendChild(btn);

    if (item.isSaved) {
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'recent-del-btn';
      delBtn.textContent = '×';
      delBtn.setAttribute('aria-label', `Usuń rozmowę ${item.title}`);
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.chats = state.chats.filter((c) => c.id !== item.id);
        if (activeThreadId === item.id) {
          activeThreadId = null;
          showWelcomeView();
        }
        saveState();
        renderRecentChats();
      });
      li.appendChild(delBtn);
    }

    recentChatsList.appendChild(li);
  }
}

function providerLabel(provider) {
  if (provider === 'gemini') return 'Gemini';
  if (provider === 'groq') return 'Groq';
  if (provider === 'workers-ai') return 'Workers AI';
  if (provider === 'guard') return 'Ochrona CC';
  return 'Baza wiedzy CC';
}

function stopStreamReveal() {
  if (streamRevealTimer) {
    clearInterval(streamRevealTimer);
    streamRevealTimer = null;
  }
}

function renderMediaDeck(mediaItems) {
  if (!Array.isArray(mediaItems) || !mediaItems.length) return null;
  const deck = document.createElement('div');
  deck.className = 'media-deck';

  for (const item of mediaItems) {
    if (!item || !item.title) continue;
    const card = document.createElement('article');
    card.className = `media-card media-card-${item.kind || 'social'}`;

    if (item.badge) {
      const badge = document.createElement('span');
      badge.className = 'media-card-badge';
      if (item.kind === 'radio') {
        const dot = document.createElement('span');
        dot.className = 'media-live-dot';
        badge.appendChild(dot);
      }
      badge.appendChild(document.createTextNode(item.badge));
      card.appendChild(badge);
    }

    if (item.kind === 'video' && item.youtubeId) {
      const posterWrap = document.createElement('div');
      posterWrap.className = 'media-poster-wrap';
      const posterImg = document.createElement('img');
      posterImg.src = item.thumbnail || `https://i.ytimg.com/vi/${encodeURIComponent(item.youtubeId)}/hqdefault.jpg`;
      posterImg.alt = item.title;
      posterImg.loading = 'lazy';
      posterImg.decoding = 'async';

      const playFab = document.createElement('button');
      playFab.type = 'button';
      playFab.className = 'media-play-fab';
      playFab.setAttribute('aria-label', `Odtwórz wideo: ${item.title}`);
      playFab.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="7 4 20 12 7 20 7 4"/></svg>';
      playFab.onclick = () => {
        pauseActiveAudio();
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.youtubeId)}?autoplay=1&rel=0`;
        iframe.title = item.title;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        posterWrap.replaceChildren(iframe);
      };

      posterWrap.append(posterImg, playFab);
      card.appendChild(posterWrap);
    } else if (item.kind === 'image' && (item.imageUrl || item.thumbnail)) {
      const img = document.createElement('img');
      img.className = 'media-image-zoom';
      img.src = item.imageUrl || item.thumbnail;
      img.alt = item.title;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onclick = () => openImageLightbox(img.src, item.title);
      card.appendChild(img);
    }

    const row = document.createElement('div');
    row.className = 'media-card-row';
    if (item.thumbnail && item.kind !== 'video' && item.kind !== 'image') {
      const thumb = document.createElement('img');
      thumb.className = 'media-thumb-sq';
      thumb.src = item.thumbnail;
      thumb.alt = '';
      thumb.loading = 'lazy';
      thumb.onclick = () => openImageLightbox(item.thumbnail, item.title);
      row.appendChild(thumb);
    }

    const meta = document.createElement('div');
    meta.className = 'media-card-meta';
    const strong = document.createElement('strong');
    strong.textContent = item.title;
    const small = document.createElement('small');
    small.textContent = item.subtitle || '';
    meta.append(strong, small);
    row.appendChild(meta);
    card.appendChild(row);

    if ((item.kind === 'audio' || item.kind === 'radio') && (item.audioUrl || item.streamUrl)) {
      const srcUrl = item.audioUrl || item.streamUrl;
      const audio = document.createElement('audio');
      audio.className = 'media-audio-ctrl';
      audio.controls = true;
      audio.preload = 'none';
      audio.src = srcUrl;
      audio.addEventListener('play', () => {
        pauseActiveAudio(audio);
        activeAudioEl = audio;
      });

      const foot = document.createElement('div');
      foot.className = 'media-card-foot';
      const playBtn = document.createElement('button');
      playBtn.type = 'button';
      playBtn.className = 'media-play-btn';
      playBtn.textContent = item.kind === 'radio' ? '▶ Słuchaj na żywo' : '▶ Odtwórz audio';
      playBtn.onclick = () => {
        if (audio.paused) {
          pauseActiveAudio(audio);
          activeAudioEl = audio;
          audio.play().catch(() => showToast('Kliknij odtwarzacz powyżej, aby uruchomić dźwięk.'));
          playBtn.textContent = '⏸ Pauza';
        } else {
          audio.pause();
          playBtn.textContent = item.kind === 'radio' ? '▶ Słuchaj na żywo' : '▶ Odtwórz audio';
        }
      };
      audio.addEventListener('pause', () => {
        playBtn.textContent = item.kind === 'radio' ? '▶ Słuchaj na żywo' : '▶ Odtwórz audio';
      });
      audio.addEventListener('play', () => {
        playBtn.textContent = '⏸ Pauza';
      });

      foot.appendChild(playBtn);
      if (item.url) {
        const ext = document.createElement('a');
        ext.className = 'media-ext-link';
        ext.href = item.url;
        ext.target = '_blank';
        ext.rel = 'noopener noreferrer';
        ext.textContent = 'Otwórz stronę ↗';
        foot.appendChild(ext);
      }
      card.append(audio, foot);
    } else if (item.kind === 'spotify' && item.embedUrl) {
      const spotifySlot = document.createElement('div');
      const foot = document.createElement('div');
      foot.className = 'media-card-foot';
      const loadBtn = document.createElement('button');
      loadBtn.type = 'button';
      loadBtn.className = 'media-play-btn';
      loadBtn.textContent = '▶ Odtwarzaj Spotify tutaj';
      loadBtn.onclick = () => {
        pauseActiveAudio();
        const frame = document.createElement('iframe');
        frame.className = 'media-spotify-frame';
        frame.src = item.embedUrl;
        frame.title = item.title;
        frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        frame.loading = 'lazy';
        spotifySlot.replaceChildren(frame);
        loadBtn.hidden = true;
      };
      foot.appendChild(loadBtn);
      if (item.url) {
        const ext = document.createElement('a');
        ext.className = 'media-ext-link';
        ext.href = item.url;
        ext.target = '_blank';
        ext.rel = 'noopener noreferrer';
        ext.textContent = 'Otwórz ↗';
        foot.appendChild(ext);
      }
      card.append(spotifySlot, foot);
    } else if (item.url) {
      const foot = document.createElement('div');
      foot.className = 'media-card-foot';
      if (item.kind === 'image') {
        const zoomBtn = document.createElement('button');
        zoomBtn.type = 'button';
        zoomBtn.className = 'media-play-btn';
        zoomBtn.textContent = '🔍 Powiększ grafikę';
        zoomBtn.onclick = () => openImageLightbox(item.imageUrl || item.thumbnail, item.title);
        foot.appendChild(zoomBtn);
      }
      const ext = document.createElement('a');
      ext.className = 'media-ext-link';
      ext.href = item.url;
      ext.target = '_blank';
      ext.rel = 'noopener noreferrer';
      ext.textContent = 'Przejdź ↗';
      foot.appendChild(ext);
      card.appendChild(foot);
    }

    deck.appendChild(card);
  }

  return deck.children.length ? deck : null;
}

function renderConversation(animateMsgId = '') {
  stopStreamReveal();
  conversationLog.replaceChildren();
  const thread = getActiveThread();
  if (!thread || !thread.messages.length) {
    showWelcomeView();
    return;
  }

  conversationLog.appendChild(buildAssistantBar('chat-assistant-bar'));

  let revealTarget = null;
  let revealFullText = '';
  let revealBubble = null;
  let revealSpeakBtn = null;
  let revealAssistantId = getActiveAssistantId();

  for (let i = 0; i < thread.messages.length; i += 1) {
    const msg = thread.messages[i];
    if (msg.role === 'user') {
      const userBubble = document.createElement('article');
      userBubble.className = 'chat-bubble-user';
      if (msg.attachmentName && !msg.mediaUrl) {
        userBubble.textContent = `[${msg.attachmentName}]\n${msg.text}`;
      } else {
        userBubble.textContent = msg.text;
      }
      if (msg.mediaUrl) {
        const mediaWrap = document.createElement('div');
        mediaWrap.className = 'user-media-preview';
        if (msg.mediaKind === 'image') {
          const im = document.createElement('img');
          im.src = msg.mediaUrl;
          im.alt = msg.attachmentName || 'Załączony obraz';
          im.onclick = () => openImageLightbox(msg.mediaUrl, msg.attachmentName || 'Załączony obraz');
          mediaWrap.appendChild(im);
        } else if (msg.mediaKind === 'audio') {
          const au = document.createElement('audio');
          au.controls = true;
          au.src = msg.mediaUrl;
          mediaWrap.appendChild(au);
        } else if (msg.mediaKind === 'video') {
          const vd = document.createElement('video');
          vd.controls = true;
          vd.src = msg.mediaUrl;
          mediaWrap.appendChild(vd);
        }
        userBubble.appendChild(mediaWrap);
      }
      conversationLog.appendChild(userBubble);
    } else {
      const persona = getPersona(msg.assistant?.id || DEFAULT_ASSISTANT_ID);
      const aiBubble = document.createElement('article');
      aiBubble.className = 'chat-bubble-ai';

      const head = document.createElement('div');
      head.className = 'chat-bubble-ai-head';
      const avatar = document.createElement('img');
      avatar.className = 'chat-bubble-ai-avatar';
      avatar.src = msg.assistant?.avatar || persona.avatar;
      avatar.alt = msg.assistant?.name || persona.name;
      avatar.width = 32;
      avatar.height = 32;
      avatar.onerror = () => {
        if (persona.avatarFallback && avatar.src !== location.origin + persona.avatarFallback) {
          avatar.src = persona.avatarFallback;
        }
      };

      const speaker = document.createElement('div');
      speaker.className = 'chat-bubble-ai-speaker';
      const speakerName = document.createElement('span');
      speakerName.textContent = msg.assistant?.name || persona.name;
      const speakerRole = document.createElement('small');
      speakerRole.textContent = msg.assistant?.role || persona.role;
      speaker.append(speakerName, speakerRole);

      const badgeSpan = document.createElement('span');
      badgeSpan.className = 'provider-badge';
      badgeSpan.textContent = `${providerLabel(msg.provider)} · ${msg.mode || currentMode}`;
      head.append(avatar, speaker, badgeSpan);
      aiBubble.appendChild(head);

      const mdSlot = document.createElement('div');
      mdSlot.className = 'ai-md-slot';
      if (animateMsgId && msg.id === animateMsgId && typeof msg.text === 'string' && msg.text.length > 24) {
        revealTarget = mdSlot;
        revealFullText = msg.text;
        revealBubble = aiBubble;
        revealAssistantId = persona.id;
        mdSlot.appendChild(renderMarkdownSafe(msg.text.slice(0, 12)));
      } else {
        mdSlot.appendChild(renderMarkdownSafe(msg.text));
      }
      aiBubble.appendChild(mdSlot);

      const mediaDeck = renderMediaDeck(msg.media);
      if (mediaDeck) {
        aiBubble.appendChild(mediaDeck);
      }

      if (Array.isArray(msg.sources) && msg.sources.length) {
        const srcWrap = document.createElement('div');
        srcWrap.className = 'source-chips';
        for (const s of msg.sources) {
          if (!s?.url || !s?.title) continue;
          const a = document.createElement('a');
          a.className = 'source-chip';
          a.href = s.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = `↗ ${s.title}`;
          srcWrap.appendChild(a);
        }
        if (srcWrap.children.length) aiBubble.appendChild(srcWrap);
      }

      const actions = document.createElement('div');
      actions.className = 'msg-actions';

      const speakBtn = document.createElement('button');
      speakBtn.type = 'button';
      speakBtn.className = 'msg-action-btn';
      speakBtn.textContent = '🔊 Odsłuchaj';
      speakBtn.onclick = () => speakReply(msg.text, persona.id, aiBubble, speakBtn);
      if (animateMsgId && msg.id === animateMsgId) {
        revealSpeakBtn = speakBtn;
      }

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'msg-action-btn';
      copyBtn.textContent = 'Kopiuj';
      copyBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(msg.text);
          showToast('Skopiowano odpowiedź.');
        } catch {
          showToast('Nie udało się skopiować w tej przeglądarce.');
        }
      };

      const saveNoteBtn = document.createElement('button');
      saveNoteBtn.type = 'button';
      saveNoteBtn.className = 'msg-action-btn';
      const alreadySaved = state.notes.some((n) => n.id === msg.id);
      saveNoteBtn.textContent = alreadySaved ? 'W Notatnikach ✓' : 'Zapisz w Notatnikach';
      saveNoteBtn.onclick = () => {
        if (state.notes.some((n) => n.id === msg.id)) {
          showToast('Ta odpowiedź jest już w Notatnikach.');
          return;
        }
        const prevUser = thread.messages[i - 1]?.text || 'Notatka AI dla Jezusa';
        state.notes.unshift({
          id: msg.id,
          title: prevUser.slice(0, 64),
          text: msg.text,
          sources: msg.sources || [],
          savedAt: new Date().toISOString()
        });
        saveState();
        saveNoteBtn.textContent = 'W Notatnikach ✓';
        showToast('Zapisano odpowiedź w Notatnikach.');
      };

      actions.append(speakBtn, copyBtn, saveNoteBtn);

      if (i === thread.messages.length - 1 && thread.messages[i - 1]?.role === 'user') {
        const retryBtn = document.createElement('button');
        retryBtn.type = 'button';
        retryBtn.className = 'msg-action-btn';
        retryBtn.textContent = 'Ponów';
        retryBtn.onclick = () => {
          if (busy) return;
          const lastUserText = thread.messages[i - 1].text;
          thread.messages.pop();
          thread.messages.pop();
          sendChatMessage(lastUserText);
        };
        actions.appendChild(retryBtn);
      }

      aiBubble.appendChild(actions);
      conversationLog.appendChild(aiBubble);
    }
  }

  if (busy) {
    const activeP = getPersona(getActiveAssistantId());
    const loading = document.createElement('article');
    loading.className = 'chat-bubble-ai typing-bubble';

    const head = document.createElement('div');
    head.className = 'chat-bubble-ai-head';
    const av = document.createElement('img');
    av.className = 'chat-bubble-ai-avatar';
    av.src = activeP.avatar;
    av.alt = activeP.name;
    av.width = 32;
    av.height = 32;
    const sp = document.createElement('span');
    sp.textContent = activeP.name;
    const bdg = document.createElement('span');
    bdg.className = 'provider-badge';
    bdg.textContent = 'Analiza CC';
    head.append(av, sp, bdg);

    const pLine = document.createElement('p');
    pLine.className = 'typing-line';
    pLine.innerHTML = '<span class="typing-dots" aria-hidden="true"><i></i><i></i><i></i></span> Przeszukuję indeks Christian Culture i dobieram multimedia...';
    loading.append(head, pLine);
    conversationLog.appendChild(loading);
  }

  const scroller = $('.stage-scroll');
  if (scroller) scroller.scrollTop = scroller.scrollHeight;

  if (revealTarget && revealFullText) {
    let cursor = Math.min(24, revealFullText.length);
    const step = Math.max(18, Math.ceil(revealFullText.length / 26));
    streamRevealTimer = setInterval(() => {
      cursor = Math.min(revealFullText.length, cursor + step);
      const rendered = renderMarkdownSafe(revealFullText.slice(0, cursor));
      if (cursor < revealFullText.length) {
        const caret = document.createElement('span');
        caret.className = 'ai-stream-cursor';
        caret.setAttribute('aria-hidden', 'true');
        (rendered.lastElementChild || rendered).appendChild(caret);
      }
      revealTarget.replaceChildren(rendered);
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
      if (cursor >= revealFullText.length) {
        stopStreamReveal();
        if (autoReadEnabled && revealBubble) {
          speakReply(revealFullText, revealAssistantId, revealBubble, revealSpeakBtn);
        }
      }
    }, 34);
  } else if (autoReadEnabled && animateMsgId) {
    const last = thread.messages[thread.messages.length - 1];
    if (last && last.id === animateMsgId && last.role === 'assistant') {
      const lastBubble = conversationLog.querySelector('.chat-bubble-ai:last-of-type');
      const lastBtn = lastBubble?.querySelector('.msg-action-btn');
      if (lastBubble) speakReply(last.text, getActiveAssistantId(), lastBubble, lastBtn);
    }
  }
}

// ================= WYSYŁANIE ZAPYTANIA DO PRAWDZIWEGO API =================
async function sendChatMessage(textOverride, titleHint = '') {
  if (busy) return;
  stopSpeaking();
  const rawText = (typeof textOverride === 'string' ? textOverride : promptInput.value).trim();
  if (!rawText && !attachmentText && !attachmentMediaUrl) {
    promptInput.focus();
    return;
  }

  let thread = getActiveThread();
  if (!thread) {
    const newId = 'chat-' + Date.now();
    const title = (titleHint || rawText || attachmentName || 'Nowa rozmowa').slice(0, 52);
    thread = {
      id: newId,
      title,
      mode: currentMode,
      messages: [],
      updatedAt: new Date().toISOString()
    };
    if (privateMode) {
      ephemeralThread = thread;
    } else {
      state.chats.unshift(thread);
      activeThreadId = newId;
      saveState();
      renderRecentChats();
    }
  }

  const historySnapshot = thread.messages.slice(-8).map((m) => ({ role: m.role, text: m.text }));
  const currentAttName = attachmentName;
  const currentAttText = attachmentText;
  const currentMediaUrl = attachmentMediaUrl;
  const currentMediaKind = attachmentMediaKind;
  const activeAsst = getPersona(getActiveAssistantId());

  thread.messages.push({
    id: 'u-' + Date.now(),
    role: 'user',
    text: rawText || `Załączony materiał multimedialny: ${currentAttName || 'plik'}`,
    attachmentName: currentAttName,
    mediaUrl: currentMediaUrl,
    mediaKind: currentMediaKind
  });

  if (typeof textOverride !== 'string') {
    promptInput.value = '';
    clearAttachment();
    resizeTextarea();
  }

  busy = true;
  sendBtn.disabled = true;
  showConversationView();

  let revealMsgId = '';
  try {
    const activeTools = [...selectedTools];
    if (webSearchEnabled) activeTools.push('Przeszukiwanie CC');

    const authHeaders = await getAuthHeaders();
    const headers = { 'Content-Type': 'application/json', ...authHeaders };
    if (byokConfig.provider && byokConfig.apiKey) {
      headers['X-User-AI-Provider'] = byokConfig.provider;
      headers['X-User-AI-Key'] = byokConfig.apiKey;
    }

    const res = await fetch('/api/ai-dla-jezusa/v1/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: rawText || `Opowiedz o przesłanym pliku (${currentAttName}) w kontekście Christian Culture.`,
        history: historySnapshot,
        mode: currentMode,
        module: currentNav,
        assistantId: activeAsst.id,
        attachmentName: currentAttName,
        attachmentText: currentAttText,
        tools: activeTools,
        memoryNotes: privateMode ? [] : state.memory.map((m) => m.text),
        privateMode,
        ownerModel: selectedOwnerModel || '',
        userModel: byokConfig.model || ''
      })
    });
    const data = await res.json();

    if (!res.ok || !data?.ok) {
      throw new Error(data?.detail || data?.error || `HTTP ${res.status}`);
    }

    revealMsgId = 'a-' + Date.now();
    thread.messages.push({
      id: revealMsgId,
      role: 'assistant',
      text: data.reply,
      provider: data.provider || 'cc-knowledge-hub',
      assistant: data.assistant || activeAsst,
      mode: data.mode || currentMode,
      media: Array.isArray(data.media) ? data.media : [],
      sources: Array.isArray(data.sources) ? data.sources : []
    });
    thread.updatedAt = new Date().toISOString();
    if (!privateMode) {
      saveState();
      renderRecentChats();
    }
  } catch (err) {
    revealMsgId = 'err-' + Date.now();
    thread.messages.push({
      id: revealMsgId,
      role: 'assistant',
      text: `Nie udało się uzyskać odpowiedzi z serwera (${err.message}). Spróbuj ponownie za chwilę lub sprawdź połączenie z internetem.`,
      provider: 'guard',
      assistant: activeAsst,
      mode: currentMode,
      media: [],
      sources: []
    });
  } finally {
    busy = false;
    sendBtn.disabled = false;
    renderConversation(revealMsgId);
  }
}

function startPromptDirectly(promptText, titleHint = '', modeOverride = '') {
  if (modeOverride) {
    setMode(modeOverride);
  }
  activeThreadId = null;
  ephemeralThread = null;
  sendChatMessage(promptText, titleHint);
}

function setMode(modeName) {
  currentMode = modeName || 'CC Auto';
  activeModelLabel.textContent = currentMode;
  $$('#modelMenu .dropdown-option').forEach((o) => {
    o.classList.toggle('active', o.dataset.model === currentMode);
  });
}

// ================= MODUŁY LEWEGO PANELU =================
function renderModule(name) {
  moduleStage.replaceChildren();

  const header = document.createElement('div');
  header.className = 'module-head';
  const titleWrap = document.createElement('div');
  const h2 = document.createElement('h2');
  h2.textContent = name;
  const sub = document.createElement('p');
  sub.className = 'module-sub';
  titleWrap.append(h2, sub);

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'connect-btn';
  backBtn.textContent = '← Powrót do czatu';
  backBtn.onclick = () => showWelcomeView();
  header.append(titleWrap, backBtn);
  moduleStage.appendChild(header);

  if (name === 'Biblia' || name === 'Deep Research') {
    sub.textContent = name === 'Biblia'
      ? 'Wyszukuj zweryfikowane materiały biblijne (UBG) i rozpoczynaj pogłębione studium z AI.'
      : 'Przeszukuj ponad 700 dokumentów Christian Culture i zamieniaj wyniki w analizę Deep Research.';

    const row = document.createElement('form');
    row.className = 'module-search-row';
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = name === 'Biblia' ? 'Np. J 3:16, Rzymian 8, modlitwa, nadzieja...' : 'Wpisz temat analizy (np. szabat, historia, wolność sumienia)...';
    const goBtn = document.createElement('button');
    goBtn.type = 'submit';
    goBtn.className = 'send-gold-btn module-go-btn';
    goBtn.textContent = 'Szukaj';
    row.append(input, goBtn);

    const resultsBox = document.createElement('div');
    resultsBox.className = 'module-grid';

    const runSearch = async (q) => {
      resultsBox.replaceChildren();
      const status = document.createElement('p');
      status.className = 'module-empty';
      status.textContent = 'Przeszukuję indeks Christian Culture...';
      resultsBox.appendChild(status);
      try {
        const url = `/api/ai-dla-jezusa/v1/search?q=${encodeURIComponent(q)}&limit=8`;
        const res = await fetch(url);
        const data = await res.json();
        resultsBox.replaceChildren();
        const items = data.results || [];
        if (!items.length) {
          const empty = document.createElement('p');
          empty.className = 'module-empty';
          empty.textContent = `Brak bezpośrednich dopasowań dla „${q}”. Kliknij przycisk obok, aby zapytać asystenta AI bezpośrednio.`;
          const askBtn = document.createElement('button');
          askBtn.type = 'button';
          askBtn.className = 'connect-btn';
          askBtn.textContent = `Zapytaj AI o „${q}”`;
          askBtn.onclick = () => startPromptDirectly(q, q, name === 'Biblia' ? 'Studium Biblijne' : 'Deep Research');
          resultsBox.append(empty, askBtn);
          return;
        }
        for (const doc of items) {
          const card = document.createElement('article');
          card.className = 'module-card';
          const title = document.createElement('strong');
          title.textContent = doc.title;
          const snip = document.createElement('p');
          snip.textContent = doc.snippet || '';
          const foot = document.createElement('div');
          foot.className = 'module-card-foot';
          const ask = document.createElement('button');
          ask.type = 'button';
          ask.className = 'connect-btn';
          ask.textContent = 'Omów z AI →';
          ask.onclick = () => startPromptDirectly(
            `Omów temat „${doc.title}” na podstawie Pisma Świętego (UBG) i materiałów Christian Culture (${doc.url}).`,
            doc.title,
            name === 'Biblia' ? 'Studium Biblijne' : 'Deep Research'
          );
          const link = document.createElement('a');
          link.className = 'gold-card-link';
          link.href = doc.url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = 'Otwórz źródło ↗';
          foot.append(ask, link);
          card.append(title, snip, foot);
          resultsBox.appendChild(card);
        }
      } catch {
        resultsBox.replaceChildren();
        const err = document.createElement('p');
        err.className = 'module-empty';
        err.textContent = 'Nie udało się połączyć z wyszukiwarką źródeł CC.';
        resultsBox.appendChild(err);
      }
    };

    row.addEventListener('submit', (e) => {
      e.preventDefault();
      runSearch(input.value.trim());
    });

    moduleStage.append(row, resultsBox);
    runSearch(name === 'Biblia' ? 'Biblia' : '');
    return;
  }

  if (name === 'Projekty') {
    sub.textContent = 'Zarządzaj swoimi projektami tematycznymi i otwieraj poświęcone im rozmowy.';
    const form = document.createElement('form');
    form.className = 'module-search-row';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Nazwa nowego projektu (np. Seria List do Galacjan)...';
    const addBtn = document.createElement('button');
    addBtn.type = 'submit';
    addBtn.className = 'send-gold-btn module-go-btn';
    addBtn.textContent = 'Dodaj';
    form.append(input, addBtn);

    const grid = document.createElement('div');
    grid.className = 'module-grid';
    const drawProjects = () => {
      grid.replaceChildren();
      for (const proj of state.projects) {
        const card = document.createElement('article');
        card.className = 'module-card';
        const strong = document.createElement('strong');
        strong.textContent = proj;
        const foot = document.createElement('div');
        foot.className = 'module-card-foot';
        const openBtn = document.createElement('button');
        openBtn.type = 'button';
        openBtn.className = 'connect-btn';
        openBtn.textContent = 'Rozpocznij rozmowę →';
        openBtn.onclick = () => startPromptDirectly(`Pracujemy nad projektem „${proj}”. Pomóż mi wyznaczyć kolejne kroki, kluczowe wersety UBG i plan działania.`, proj);
        foot.appendChild(openBtn);
        card.append(strong, foot);
        grid.appendChild(card);
      }
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      if (!state.projects.includes(val)) {
        state.projects.unshift(val);
        saveState();
        renderRightProjects();
      }
      input.value = '';
      drawProjects();
    });

    moduleStage.append(form, grid);
    drawProjects();
    return;
  }

  if (name === 'Notatniki') {
    sub.textContent = 'Odpowiedzi AI zapisane przyciskiem „Zapisz w Notatnikach” podczas Twoich rozmów.';
    const grid = document.createElement('div');
    grid.className = 'module-grid';
    if (!state.notes.length) {
      const empty = document.createElement('p');
      empty.className = 'module-empty';
      empty.textContent = 'Brak zapisanych notatek. Po rozmowie z AI kliknij „Zapisz w Notatnikach”, aby zachować odpowiedź na później.';
      moduleStage.appendChild(empty);
      return;
    }
    for (const note of state.notes) {
      const card = document.createElement('article');
      card.className = 'module-card';
      const strong = document.createElement('strong');
      strong.textContent = note.title;
      const preview = document.createElement('p');
      preview.textContent = note.text.slice(0, 260) + (note.text.length > 260 ? '...' : '');
      const foot = document.createElement('div');
      foot.className = 'module-card-foot';
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'connect-btn';
      copyBtn.textContent = 'Kopiuj całość';
      copyBtn.onclick = async () => {
        await navigator.clipboard.writeText(note.text);
        showToast('Skopiowano treść notatki.');
      };
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'msg-action-btn';
      delBtn.textContent = 'Usuń';
      delBtn.onclick = () => {
        state.notes = state.notes.filter((n) => n.id !== note.id);
        saveState();
        renderModule('Notatniki');
      };
      foot.append(copyBtn, delBtn);
      card.append(strong, preview, foot);
      grid.appendChild(card);
    }
    moduleStage.appendChild(grid);
    return;
  }

  if (name === 'Agenci') {
    sub.textContent = 'Wybierz główny awatar AI dla Jezusa albo jedną z czterech asystentek Christian Culture (głos + obraz + wiedza ekosystemu).';
    const grid = document.createElement('div');
    grid.className = 'module-grid';
    for (const p of Object.values(AI_PERSONAS)) {
      const card = document.createElement('article');
      card.className = 'module-card';
      const row = document.createElement('div');
      row.className = 'media-card-row';
      const img = document.createElement('img');
      img.className = 'media-thumb-sq';
      img.src = p.avatar;
      img.alt = p.name;
      img.onerror = () => {
        if (p.avatarFallback && img.src !== location.origin + p.avatarFallback) img.src = p.avatarFallback;
      };
      const meta = document.createElement('div');
      meta.className = 'media-card-meta';
      const strong = document.createElement('strong');
      strong.textContent = p.name;
      const small = document.createElement('small');
      small.textContent = p.role;
      meta.append(strong, small);
      row.append(img, meta);

      const foot = document.createElement('div');
      foot.className = 'module-card-foot';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'media-play-btn';
      btn.textContent = p.id === getActiveAssistantId() ? 'Aktywna w czacie ✓' : 'Rozmawiaj teraz →';
      btn.onclick = () => {
        setActiveAssistant(p.id);
        startPromptDirectly(`Cześć ${p.name}! Co dobrego polecasz mi dziś w ekosystemie Christian Culture?`, `Rozmowa z: ${p.name}`);
      };
      foot.appendChild(btn);
      card.append(row, foot);
      grid.appendChild(card);
    }
    for (const ag of CC_AGENTS) {
      const card = document.createElement('article');
      card.className = 'module-card';
      const strong = document.createElement('strong');
      strong.textContent = ag.name;
      const p = document.createElement('p');
      p.textContent = ag.desc;
      const foot = document.createElement('div');
      foot.className = 'module-card-foot';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'connect-btn';
      btn.textContent = 'Uruchom agenta →';
      btn.onclick = () => startPromptDirectly(ag.prompt, ag.name, ag.mode);
      foot.appendChild(btn);
      card.append(strong, p, foot);
      grid.appendChild(card);
    }
    moduleStage.appendChild(grid);
    return;
  }

  if (name === 'Pamięć') {
    sub.textContent = 'Twoje wskazówki kontekstowe (np. cel misji, preferowany styl). Nie są wysyłane w Trybie prywatnym.';
    const form = document.createElement('form');
    form.className = 'module-search-row';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Np. Przygotowuję treści dla młodych dorosłych w przekładzie UBG...';
    const addBtn = document.createElement('button');
    addBtn.type = 'submit';
    addBtn.className = 'send-gold-btn module-go-btn';
    addBtn.textContent = 'Zapisz';
    form.append(input, addBtn);

    const listBox = document.createElement('div');
    listBox.className = 'module-grid';
    const drawMem = () => {
      listBox.replaceChildren();
      if (!state.memory.length) {
        const empty = document.createElement('p');
        empty.className = 'module-empty';
        empty.textContent = 'Brak zapisanych wpisów pamięci. Dodaj pierwszą wskazówkę powyżej.';
        listBox.appendChild(empty);
        return;
      }
      for (const m of state.memory) {
        const card = document.createElement('article');
        card.className = 'module-card memory-row';
        const p = document.createElement('p');
        p.textContent = m.text;
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'msg-action-btn';
        del.textContent = 'Usuń';
        del.onclick = () => {
          state.memory = state.memory.filter((x) => x.id !== m.id);
          saveState();
          drawMem();
        };
        card.append(p, del);
        listBox.appendChild(card);
      }
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      state.memory.unshift({ id: 'mem-' + Date.now(), text: val.slice(0, 200) });
      saveState();
      input.value = '';
      drawMem();
    });

    moduleStage.append(form, listBox);
    drawMem();
    return;
  }

  if (name === 'Połączenia') {
    sub.textContent = ownerSession?.isOwner
      ? `Panel integracji właściciela (${ownerSession.email}): pula kluczy AI, YouTube API v3, kanały CC i mostki Antigravity.`
      : 'Zintegrowane kanały Christian Culture: Radio 24/7, Biblia Audio, YouTube, Spotify, Facebook, WhatsApp, X/CCN i serwer MCP.';
    const wrap = document.createElement('div');
    wrap.className = 'module-stage';
    const loading = document.createElement('p');
    loading.className = 'module-empty';
    loading.textContent = 'Ładuję zintegrowane kanały Christian Culture...';
    wrap.appendChild(loading);
    moduleStage.appendChild(wrap);

    Promise.all([
      fetch('/api/ai-dla-jezusa/v1/health').then((r) => r.json()).catch(() => null),
      fetch('/api/ai-dla-jezusa/v1/chat').then((r) => r.json()).catch(() => null)
    ]).then(([health, chatStatus]) => {
      wrap.replaceChildren();

      if (ownerSession?.isOwner) {
        const banner = document.createElement('div');
        banner.className = 'owner-banner';
        const bText = document.createElement('span');
        bText.textContent = `👑 Konto Właściciela: ${ownerSession.email} · Pula darmowych kluczy Google AI: ${ownerSession.apiPool?.geminiKeys || 0} · YouTube API: ${ownerSession.apiPool?.youtubeApi ? 'Aktywny ✓' : 'Brak'}`;
        const bBadge = document.createElement('span');
        bBadge.className = 'owner-badge';
        bBadge.textContent = 'ANTIGRAVITY + CHMURA';
        banner.append(bText, bBadge);
        wrap.appendChild(banner);

        if (ownerSession.apiPool?.youtubeApi) {
          const ytForm = document.createElement('form');
          ytForm.className = 'module-search-row';
          const ytInput = document.createElement('input');
          ytInput.type = 'search';
          ytInput.placeholder = 'Wyszukaj dowolny film z YouTube API v3 prosto do czatu...';
          const ytBtn = document.createElement('button');
          ytBtn.type = 'submit';
          ytBtn.className = 'send-gold-btn module-go-btn';
          ytBtn.textContent = 'Szukaj YouTube';
          ytForm.append(ytInput, ytBtn);

          const ytOut = document.createElement('div');
          ytForm.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const q = ytInput.value.trim() || 'Christian Culture';
            ytOut.replaceChildren();
            const waitP = document.createElement('p');
            waitP.className = 'module-empty';
            waitP.textContent = 'Przeszukuję YouTube Data API v3...';
            ytOut.appendChild(waitP);
            const res = await runOwnerAction({ action: 'youtube_search', query: q });
            ytOut.replaceChildren();
            if (res?.ok && Array.isArray(res.media) && res.media.length) {
              const deck = renderMediaDeck(res.media);
              if (deck) ytOut.appendChild(deck);
            } else {
              const errP = document.createElement('p');
              errP.className = 'module-empty';
              errP.textContent = res?.detail || 'Brak wyników z YouTube API.';
              ytOut.appendChild(errP);
            }
          });
          wrap.append(ytForm, ytOut);
        }

        const intGrid = document.createElement('div');
        intGrid.className = 'module-grid';
        for (const intg of ownerSession.integrations || []) {
          const card = document.createElement('article');
          card.className = 'module-card';
          const badge = document.createElement('span');
          badge.className = `integration-status-pill ${intg.status === 'active' ? 'status-cloud' : intg.status === 'bridge' ? 'status-bridge' : 'status-missing'}`;
          badge.textContent = intg.status === 'active' ? 'CHMURA · AKTYWNA' : intg.status === 'bridge' ? 'ANTIGRAVITY · MOSTEK PC' : 'DO PODPIĘCIA';
          const strong = document.createElement('strong');
          strong.textContent = intg.name;
          const p = document.createElement('p');
          p.textContent = intg.detail;
          card.append(badge, strong, p);
          intGrid.appendChild(card);
        }
        wrap.appendChild(intGrid);
      }

      const hubs = chatStatus?.hubs;
      if (hubs) {
        const playable = [
          ...(hubs.radioStreams || []),
          ...(hubs.spotifyShows || []).slice(0, 2),
          ...(hubs.socialHub || [])
        ];
        const deck = renderMediaDeck(playable);
        if (deck) wrap.appendChild(deck);
      }

      const box = document.createElement('div');
      box.className = 'module-grid';
      const items = [
        {
          title: 'Indeks Wiedzy CC + Multimedia RAG',
          desc: health ? `Aktywny · ${health.index_documents} dokumentów · ${hubs?.counts?.bibliaAudioEpisodes || 50} odcinków Biblii Audio · ${hubs?.counts?.uwielbienieVideos || 38} wideo śpiewanych` : 'Brak odpowiedzi endpointu /health',
          href: '/wyszukiwarka',
          linkText: 'Wyszukiwarka CC ↗'
        },
        {
          title: 'Zdalny Serwer MCP (Read-Only · 0 zł)',
          desc: 'Endpoint JSON-RPC 2.0: https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp (cc_search, cc_find_scripture, cc_get_source_policy)',
          href: '/api/ai-dla-jezusa/v1/openapi.json',
          linkText: 'Specyfikacja OpenAPI ↗'
        }
      ];
      for (const it of items) {
        const card = document.createElement('article');
        card.className = 'module-card';
        const strong = document.createElement('strong');
        strong.textContent = it.title;
        const p = document.createElement('p');
        p.textContent = it.desc;
        const a = document.createElement('a');
        a.className = 'gold-card-link';
        a.href = it.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = it.linkText;
        card.append(strong, p, a);
        box.appendChild(card);
      }
      wrap.appendChild(box);
    });
    return;
  }

  if (name === 'Umiejętności' && ownerSession?.isOwner) {
    sub.textContent = `Wszystkie ${ownerSession.skills?.length || 18} umiejętności Antigravity Christian Culture odblokowane dla ${ownerSession.email}.`;
    const grid = document.createElement('div');
    grid.className = 'module-grid';
    for (const sk of ownerSession.skills || []) {
      const card = document.createElement('article');
      card.className = 'module-card';
      const tag = document.createElement('span');
      tag.className = 'skill-tag-pill';
      tag.textContent = `${sk.tag} · ${sk.runtime === 'cloud' ? 'Chmura' : 'Chmura + PC'}`;
      const strong = document.createElement('strong');
      strong.textContent = sk.title;
      const p = document.createElement('p');
      p.textContent = sk.desc;
      const foot = document.createElement('div');
      foot.className = 'module-card-foot';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'media-play-btn';
      btn.textContent = 'Uruchom w czacie →';
      btn.onclick = () => startPromptDirectly(sk.prompt, `${sk.tag} — ${sk.title}`, sk.mode);
      foot.appendChild(btn);
      card.append(tag, strong, p, foot);
      grid.appendChild(card);
    }
    moduleStage.appendChild(grid);
    return;
  }

  if (name === 'Automatyzacje' && ownerSession?.isOwner) {
    sub.textContent = `Automatyzacje właściciela (${ownerSession.email}) — uruchamiane bezpośrednio z aplikacji przez chmurę Christian Culture.`;
    const outBox = document.createElement('div');
    outBox.className = 'owner-result-box';
    outBox.hidden = true;

    const grid = document.createElement('div');
    grid.className = 'module-grid';
    for (const auto of ownerSession.automations || []) {
      const card = document.createElement('article');
      card.className = 'module-card';
      const strong = document.createElement('strong');
      strong.textContent = auto.title;
      const p = document.createElement('p');
      p.textContent = auto.desc;
      const foot = document.createElement('div');
      foot.className = 'module-card-foot';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'media-play-btn';
      btn.textContent = 'Uruchom teraz →';
      btn.onclick = async () => {
        if (auto.kind === 'chat_prompt') {
          startPromptDirectly(auto.prompt, auto.title, auto.mode);
          return;
        }
        if (auto.kind === 'reflection_to_chat') {
          const pack = await runOwnerAction({ action: 'today_reflection_pack' });
          if (pack?.prompt) {
            startPromptDirectly(pack.prompt, `Posty: ${pack.title}`, 'Twórczość CC');
          } else {
            showToast('Nie udało się pobrać dzisiejszego rozważania.');
          }
          return;
        }
        if (auto.kind === 'youtube_preset') {
          btn.disabled = true;
          const res = await runOwnerAction({ action: 'youtube_search', query: auto.query || 'Christian Culture' });
          btn.disabled = false;
          outBox.replaceChildren();
          outBox.hidden = false;
          if (res?.ok && res.media?.length) {
            const deck = renderMediaDeck(res.media);
            if (deck) outBox.appendChild(deck);
          } else {
            outBox.textContent = res?.detail || 'Brak odpowiedzi z YouTube API.';
          }
          return;
        }
        btn.disabled = true;
        const res = await runOwnerAction({ action: 'health_audit' });
        btn.disabled = false;
        outBox.replaceChildren();
        outBox.hidden = false;
        if (res?.ok && res.summary) {
          outBox.textContent = `Audyt na żywo (${res.summary.ownerEmail}): Klucze Google AI = ${res.summary.geminiPoolCount}, Ping Gemini 3.5 = HTTP ${res.summary.geminiPingStatus}, YouTube API = ${res.summary.youtubeApiConfigured ? 'OK' : 'Brak'}, Dokumenty RAG = ${res.summary.indexDocuments}.`;
        } else {
          outBox.textContent = res?.detail || 'Błąd audytu właściciela.';
        }
      };
      foot.appendChild(btn);
      card.append(strong, p, foot);
      grid.appendChild(card);
    }
    moduleStage.append(outBox, grid);
    return;
  }

  // Pozostałe moduły: Pracownia, Kod, Umiejętności, Automatyzacje
  const templates = MODULE_TEMPLATES[name] || [];
  sub.textContent = `Szybkie szablony zadań dla przestrzeni „${name}” — kliknij, aby uruchomić rozmowę z AI.`;
  const grid = document.createElement('div');
  grid.className = 'module-grid';
  for (const tpl of templates) {
    const card = document.createElement('article');
    card.className = 'module-card';
    const strong = document.createElement('strong');
    strong.textContent = tpl.title;
    const p = document.createElement('p');
    p.textContent = tpl.prompt;
    const foot = document.createElement('div');
    foot.className = 'module-card-foot';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'connect-btn';
    btn.textContent = 'Użyj szablonu →';
    btn.onclick = () => startPromptDirectly(tpl.prompt, tpl.title, tpl.mode);
    foot.appendChild(btn);
    card.append(strong, p, foot);
    grid.appendChild(card);
  }
  moduleStage.appendChild(grid);
}

// ================= AKTUALIZACJA PRAWEGO PANELU =================
function renderRightProjects() {
  const list = $('.project-list');
  if (!list) return;
  list.replaceChildren();
  for (const proj of state.projects.slice(0, 3)) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'project-link';
    btn.dataset.project = proj;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('aria-hidden', 'true');
    const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p1.setAttribute('d', 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z');
    const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p2.setAttribute('d', 'M14 3v5h5M9 13h6M9 17h4');
    svg.append(p1, p2);

    const span = document.createElement('span');
    span.textContent = proj;
    btn.append(svg, span);
    btn.addEventListener('click', () => {
      startPromptDirectly(`Pracujemy nad projektem „${proj}”. Pomóż mi zaplanować treść i oprzeć ją o Pismo Święte (UBG).`, proj);
      closeDrawers();
    });
    li.appendChild(btn);
    list.appendChild(li);
  }
}

async function hydrateDailyVerse() {
  try {
    const res = await fetch('/api/lumi-chat?daily=1');
    if (!res.ok) return;
    const data = await res.json();
    const rawVerse = data?.dialogue?.verse;
    if (!rawVerse || typeof rawVerse !== 'string') return;
    const m = rawVerse.match(/^(„[^”]+”)\s*[—–-]\s*(.+)$/);
    const verseEl = $('.daily-verse');
    const refEl = $('.verse-ref');
    if (m && verseEl && refEl) {
      verseEl.textContent = m[1];
      refEl.textContent = m[2].trim();
    }
  } catch {
    // Zachowujemy domyślny werset Przysłów 3,5 bez błędu
  }
}

// ================= ZDARZENIA KONTROLEK UI =================
modelPickerBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  const next = modelMenu.hidden;
  toolsMenu.hidden = true;
  modelMenu.hidden = !next;
  modelPickerBtn.setAttribute('aria-expanded', String(next));
});

$$('#modelMenu .dropdown-option').forEach((opt) => {
  opt.addEventListener('click', () => {
    setMode(opt.dataset.model || 'CC Auto');
    modelMenu.hidden = true;
    modelPickerBtn.setAttribute('aria-expanded', 'false');
    showToast(`Aktywny tryb: ${currentMode}`);
  });
});

toolsBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  const next = toolsMenu.hidden;
  modelMenu.hidden = true;
  toolsMenu.hidden = !next;
  toolsBtn.setAttribute('aria-expanded', String(next));
});

$$('#toolsMenu .dropdown-option').forEach((opt) => {
  opt.addEventListener('click', () => {
    const tool = opt.dataset.tool || '';
    if (tool) {
      if (selectedTools.has(tool)) selectedTools.delete(tool);
      else selectedTools.add(tool);
      opt.classList.toggle('active', selectedTools.has(tool));
      showToast(selectedTools.has(tool) ? `Włączono narzędzie: ${tool}` : `Wyłączono narzędzie: ${tool}`);
    }
    toolsMenu.hidden = true;
    toolsBtn.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('click', () => {
  if (!modelMenu.hidden) {
    modelMenu.hidden = true;
    modelPickerBtn?.setAttribute('aria-expanded', 'false');
  }
  if (!toolsMenu.hidden) {
    toolsMenu.hidden = true;
    toolsBtn?.setAttribute('aria-expanded', 'false');
  }
});

privacyToggleBtn?.addEventListener('click', () => {
  privateMode = !privateMode;
  privacyToggleBtn.setAttribute('aria-checked', String(privateMode));
  showToast(privateMode ? 'Tryb prywatny włączony (bez zapisu i pamięci).' : 'Tryb prywatny wyłączony.');
});

webSearchBtn?.addEventListener('click', () => {
  webSearchEnabled = !webSearchEnabled;
  webSearchBtn.setAttribute('aria-pressed', String(webSearchEnabled));
  showToast(webSearchEnabled ? 'Przeszukiwanie zasobów Christian Culture włączone.' : 'Przeszukiwanie zasobów wyłączone.');
});

$('#helpBtn')?.addEventListener('click', () => {
  openDialog('AI dla Jezusa — Christian Culture', [
    'Asystent AI połączony z Bazą Wiedzy Christian Culture (700+ zweryfikowanych dokumentów, Kurs Codzienny, MojaBiblia UBG).',
    'Tryb prywatny blokuje zapis historii w przeglądarce oraz odczyt zapisanych wskazówek pamięci.',
    'Odpowiedzi biblijne weryfikuj bezpośrednio w Piśmie Świętym (Uwspółcześniona Biblia Gdańska).'
  ]);
});

$$('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    const label = btn.dataset.nav || 'Czat';
    if (label === 'Czat') {
      if (getActiveThread()?.messages?.length) showConversationView();
      else showWelcomeView();
    } else {
      showModuleView(label);
    }
    closeDrawers();
  });
});

$('#newChatBtn')?.addEventListener('click', () => {
  if (busy) return;
  if (isListening) stopDictation();
  activeThreadId = null;
  ephemeralThread = null;
  promptInput.value = '';
  clearAttachment();
  resizeTextarea();
  showWelcomeView();
  renderRecentChats();
  promptInput.focus();
  closeDrawers();
});

chatSearchInput?.addEventListener('input', renderRecentChats);

// ================= KONTO GOOGLE (LUMINA AUTH) & USTAWIENIA BYOK =================
function updateProfileFooterButton() {
  const profileBtn = $('.footer-item[data-nav="Mój profil"]');
  if (!profileBtn) return;
  const labelSpan = profileBtn.querySelector('span');
  const existingAvatar = profileBtn.querySelector('.footer-avatar');
  if (currentUser && !currentUser.isAnonymous) {
    const label = ownerSession?.isOwner
      ? `👑 ${currentUser.displayName || 'Właściciel CC'}`
      : (currentUser.displayName || currentUser.email || 'Konto LUMINA');
    if (labelSpan) labelSpan.textContent = label;
    if (currentUser.photoURL && !existingAvatar) {
      const img = document.createElement('img');
      img.src = currentUser.photoURL;
      img.alt = '';
      img.className = 'footer-avatar';
      const svg = profileBtn.querySelector('svg');
      if (svg) svg.hidden = true;
      profileBtn.insertBefore(img, labelSpan);
    }
  } else {
    if (labelSpan) labelSpan.textContent = 'Mój profil';
    if (existingAvatar) existingAvatar.remove();
    const svg = profileBtn.querySelector('svg');
    if (svg) svg.hidden = false;
  }
}

function handleAuthUpdate(user) {
  const validUser = user && !user.isAnonymous && user.uid ? user : null;
  const prevUid = getUidScope(currentUser?.uid);
  const nextUid = getUidScope(validUser?.uid);
  currentUser = validUser;
  if (prevUid !== nextUid) {
    activeThreadId = null;
    ephemeralThread = null;
    state = loadState(validUser?.uid);
    byokConfig = loadByokConfig(validUser?.uid);
    renderRecentChats();
    renderRightProjects();
    syncAssistantButtons();
    syncPanelButtons();
    if (currentNav === 'Czat') showWelcomeView();
    else renderModule(currentNav);
  }
  updateProfileFooterButton();
  refreshOwnerSession();
}

async function ensureLuminaDb() {
  if (luminaDb) return luminaDb;
  if (window.LuminaDB && typeof window.LuminaDB.loginWithGoogle === 'function') {
    luminaDb = window.LuminaDB;
    return luminaDb;
  }
  try {
    const mod = await import('/lumina-db.js?v=20261013_notifsafe1');
    luminaDb = mod;
    return luminaDb;
  } catch {
    return null;
  }
}

async function initLuminaAuthConnector() {
  const mod = await ensureLuminaDb();
  if (!mod) return;
  try {
    if (typeof mod.ensureDbReady === 'function') await mod.ensureDbReady();
    if (typeof mod.waitForAuthReady === 'function') await mod.waitForAuthReady(2500);
    if (typeof mod.onAuthChange === 'function') {
      mod.onAuthChange(handleAuthUpdate);
    } else if (typeof mod.getCurrentUser === 'function') {
      handleAuthUpdate(mod.getCurrentUser());
    }
  } catch {
    // Tryb gościa działa bez błędu nawet offline
  }
}

function openSettingsModal() {
  infoDialogTitle.textContent = 'Ustawienia i własne AI (BYOK)';
  infoDialogBody.replaceChildren();

  const summary = document.createElement('p');
  summary.textContent = `Aktywny tryb: ${currentMode} · Tryb prywatny: ${privateMode ? 'Włączony' : 'Wyłączony'} · Wątki: ${state.chats.length} · Notatki: ${state.notes.length} · Pamięć: ${state.memory.length}.`;

  const byokIntro = document.createElement('p');
  byokIntro.textContent = ownerSession?.isOwner
    ? `👑 Konto Właściciela (${ownerSession.email}): Twoja serwerowa pula ${ownerSession.apiPool?.geminiKeys || 0}× bezpłatnych kluczy Google AI (Gemini 3.5 / 3.1) oraz YouTube API v3 są już automatycznie aktywne bez wpisywania kluczy w przeglądarce.`
    : 'Domyślnie korzystasz z darmowych zasobów Christian Culture (0 zł). Jeśli chcesz podpiąć tu także swój własny klucz (OpenRouter, GPT, Gemini, Groq), jest on zapisywany wyłącznie w Twojej przeglądarce:';

  const form = document.createElement('form');
  form.className = 'dialog-form';

  const select = document.createElement('select');
  select.className = 'dialog-input';
  select.setAttribute('aria-label', 'Dostawca własnego klucza AI');
  const providers = [
    ['', 'Domyślny Christian Culture (0 zł)'],
    ['openrouter', 'OpenRouter (DeepSeek / Llama / Claude / GPT)'],
    ['gemini', 'Google Gemini (własny klucz)'],
    ['openai', 'OpenAI (GPT)'],
    ['groq', 'Groq (Llama 3.3 70B)']
  ];
  for (const [val, label] of providers) {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = label;
    if (byokConfig.provider === val) opt.selected = true;
    select.appendChild(opt);
  }

  const modelInput = document.createElement('input');
  modelInput.type = 'text';
  modelInput.className = 'dialog-input';
  modelInput.placeholder = 'Opcjonalna nazwa modelu (np. meta-llama/llama-3.3-70b-instruct:free)';
  modelInput.value = byokConfig.model || '';

  const keyInput = document.createElement('input');
  keyInput.type = 'password';
  keyInput.className = 'dialog-input';
  keyInput.placeholder = 'Wklej swój klucz API (zostaje lokalnie w przeglądarce)...';
  keyInput.value = byokConfig.apiKey || '';

  const btnRow = document.createElement('div');
  btnRow.className = 'dialog-actions-row';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.className = 'connect-btn';
  saveBtn.textContent = 'Zapisz ustawienia';

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'dialog-btn-secondary';
  clearBtn.textContent = 'Przywróć domyślny CC';
  clearBtn.onclick = () => {
    saveByokConfig({ provider: '', apiKey: '', model: '' });
    select.value = '';
    keyInput.value = '';
    modelInput.value = '';
    showToast('Przywrócono domyślny silnik Christian Culture (0 zł).');
  };

  btnRow.append(saveBtn, clearBtn);
  form.append(select, modelInput, keyInput, btnRow);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveByokConfig({
      provider: select.value,
      apiKey: keyInput.value,
      model: modelInput.value
    });
    showToast(byokConfig.provider && byokConfig.apiKey
      ? `Zapisano własny klucz (${byokConfig.provider}).`
      : 'Korzystasz z domyślnego silnika Christian Culture (0 zł).');
    infoDialog.close();
  });

  infoDialogBody.append(summary, byokIntro, form);
  infoDialog.showModal();
}

function openProfileModal() {
  infoDialogTitle.textContent = 'Mój profil — LUMINA & AI dla Jezusa';
  infoDialogBody.replaceChildren();

  if (currentUser && !currentUser.isAnonymous) {
    const info = document.createElement('p');
    info.textContent = ownerSession?.isOwner
      ? `👑 Zalogowano jako właściciel: ${currentUser.displayName || 'Cezary Rogowski'} (${currentUser.email}). Odblokowano pulę ${ownerSession.apiPool?.geminiKeys || 0}× kluczy Google AI, YouTube API v3, 18 umiejętności Antigravity oraz integracje chmury CC.`
      : `Zalogowano jako: ${currentUser.displayName || 'Użytkownik LUMINA'} (${currentUser.email || 'konto Google'}). Twoja historia, notatki, projekty i pamięć są odizolowane dla tego konta.`;

    const btnRow = document.createElement('div');
    btnRow.className = 'dialog-actions-row';

    const luminaLink = document.createElement('a');
    luminaLink.href = '/lumina';
    luminaLink.className = 'connect-btn';
    luminaLink.textContent = 'Otwórz portal LUMINA →';

    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.className = 'dialog-btn-secondary';
    logoutBtn.textContent = 'Wyloguj';
    logoutBtn.onclick = async () => {
      const mod = await ensureLuminaDb();
      if (mod && typeof mod.logoutUser === 'function') {
        await mod.logoutUser();
      }
      handleAuthUpdate(null);
      infoDialog.close();
      showToast('Wylogowano z konta Google.');
    };

    btnRow.append(luminaLink, logoutBtn);
    infoDialogBody.append(info, btnRow);
  } else {
    const desc = document.createElement('p');
    desc.textContent = 'Zaloguj się kontem Google przez ekosystem LUMINA, aby oddzielić swoje rozmowy, projekty i notatki dla własnego konta.';

    const loginBtn = document.createElement('button');
    loginBtn.type = 'button';
    loginBtn.className = 'google-login-btn';
    loginBtn.textContent = 'Zaloguj przez Google (LUMINA)';
    loginBtn.onclick = async () => {
      loginBtn.disabled = true;
      loginBtn.textContent = 'Łączenie z Google...';
      try {
        const mod = await ensureLuminaDb();
        if (!mod || typeof mod.loginWithGoogle !== 'function') {
          window.location.href = `/lumina-login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
        const res = await mod.loginWithGoogle();
        if (res?.user) {
          handleAuthUpdate(res.user);
          infoDialog.close();
          showToast(`Zalogowano: ${res.user.displayName || res.user.email || 'LUMINA'}`);
        }
      } catch {
        showToast('Logowanie Google zostało przerwane lub zablokowane przez okienko.');
      } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Zaloguj przez Google (LUMINA)';
      }
    };

    infoDialogBody.append(desc, loginBtn);
  }
  infoDialog.showModal();
}

$$('.footer-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.nav || 'Opcje';
    if (name === 'Ustawienia') openSettingsModal();
    else openProfileModal();
    closeDrawers();
  });
});

$$('.connect-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const appName = btn.dataset.app || 'Aplikacja';
    if (appName === 'Biblia Audio CC') {
      btn.classList.add('connected');
      btn.textContent = 'Połączono';
      showToast('Biblia Audio CC połączona z kontekstem rozmowy.');
      return;
    }
    showModuleView('Połączenia');
    closeDrawers();
  });
});

$('#allProjectsLink')?.addEventListener('click', () => {
  showModuleView('Projekty');
  closeDrawers();
});

$('#moreIntegrationsLink')?.addEventListener('click', () => {
  showModuleView('Połączenia');
  closeDrawers();
});

// Kliknięcie Wersetu dnia otwiera krótkie rozważanie w czacie
const verseCard = $('.space-card');
if (verseCard) {
  verseCard.style.cursor = 'pointer';
  verseCard.title = 'Kliknij, aby rozważyć ten werset z AI';
  verseCard.addEventListener('click', () => {
    const vText = $('.daily-verse')?.textContent || '';
    const vRef = $('.verse-ref')?.textContent || '';
    if (!vText) return;
    startPromptDirectly(`Wyjaśnij znaczenie i praktyczne zastosowanie wersetu: ${vText} (${vRef}).`, `Werset: ${vRef}`, 'Studium Biblijne');
    closeDrawers();
  });
}

$$('.prompt-card').forEach((card) => {
  card.addEventListener('click', () => {
    promptInput.value = card.dataset.prompt || '';
    resizeTextarea();
    promptInput.focus();
  });
});

// Załączniki multimedialne (obraz, audio, wideo, tekst + wklejanie ze schowka i upuszczanie)
async function handleAttachedFile(f) {
  if (!f) return;
  clearAttachment();
  attachmentName = f.name || 'załącznik';

  if (f.type?.startsWith('image/')) {
    attachmentMediaKind = 'image';
    attachmentMediaUrl = URL.createObjectURL(f);
  } else if (f.type?.startsWith('audio/')) {
    attachmentMediaKind = 'audio';
    attachmentMediaUrl = URL.createObjectURL(f);
  } else if (f.type?.startsWith('video/')) {
    attachmentMediaKind = 'video';
    attachmentMediaUrl = URL.createObjectURL(f);
  } else if (/\.(txt|md|csv|json|html?|xml)$/i.test(f.name) || f.type?.startsWith('text/')) {
    try {
      const txt = await f.text();
      attachmentText = txt.slice(0, 12_000);
    } catch {
      attachmentText = '';
    }
  } else {
    showToast('Obsługiwane są pliki tekstowe (.txt, .md, .csv, .json) oraz grafika, audio i wideo.');
  }

  attachmentChip.replaceChildren();
  const label = document.createElement('span');
  if (attachmentMediaKind === 'image') label.textContent = `Obraz: ${attachmentName}`;
  else if (attachmentMediaKind === 'audio') label.textContent = `Audio: ${attachmentName}`;
  else if (attachmentMediaKind === 'video') label.textContent = `Wideo: ${attachmentName}`;
  else label.textContent = attachmentText ? `Załącznik (${attachmentName} · wczytano treść)` : `Załącznik: ${attachmentName}`;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '×';
  removeBtn.setAttribute('aria-label', 'Usuń załącznik');
  removeBtn.onclick = clearAttachment;
  attachmentChip.append(label, removeBtn);
  attachmentChip.hidden = false;
}

attachBtn?.addEventListener('click', () => fileInput?.click());
fileInput?.addEventListener('change', () => {
  const f = fileInput.files?.[0];
  if (f) handleAttachedFile(f);
});

composerBox?.addEventListener('dragover', (e) => {
  e.preventDefault();
});
composerBox?.addEventListener('drop', (e) => {
  const f = e.dataTransfer?.files?.[0];
  if (f) {
    e.preventDefault();
    handleAttachedFile(f);
  }
});
promptInput?.addEventListener('paste', (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const it of items) {
    if (it.kind === 'file') {
      const f = it.getAsFile();
      if (f) {
        handleAttachedFile(f);
        break;
      }
    }
  }
});

function clearAttachment() {
  attachmentName = '';
  attachmentText = '';
  attachmentMediaUrl = '';
  attachmentMediaKind = '';
  if (fileInput) fileInput.value = '';
  attachmentChip.hidden = true;
  attachmentChip.replaceChildren();
}

assistantStrip?.querySelectorAll('.assistant-pill').forEach((btn) => {
  btn.addEventListener('click', () => {
    setActiveAssistant(btn.dataset.assistant || DEFAULT_ASSISTANT_ID);
  });
});

voiceAutoReadBtn?.addEventListener('click', () => {
  autoReadEnabled = !autoReadEnabled;
  voiceAutoReadBtn.setAttribute('aria-pressed', String(autoReadEnabled));
  if (!autoReadEnabled) stopSpeaking();
  showToast(autoReadEnabled ? 'Czytanie odpowiedzi głosem włączone.' : 'Czytanie odpowiedzi głosem wyłączone.');
});

// ================= DYNAMICZNE DYKTATOWANIE GŁOSOWE NA ŻYWO =================
function formatDictationDuration(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = String(totalSec % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

function releaseAudioResources() {
  if (voiceRafId) {
    cancelAnimationFrame(voiceRafId);
    voiceRafId = 0;
  }
  if (micStream) {
    micStream.getTracks().forEach((t) => {
      try { t.stop(); } catch {}
    });
    micStream = null;
  }
  if (audioCtx) {
    try { audioCtx.close().catch(() => {}); } catch {}
    audioCtx = null;
  }
  analyser = null;
  speechEnergy = 0;
  for (const bar of waveBars) {
    bar.style.transform = 'scaleY(0.24)';
  }
}

function runWaveAnimation() {
  const count = waveBars.length;
  if (!count || !isListening) return;
  const freqData = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

  const tick = (now) => {
    if (!isListening) return;
    speechEnergy *= 0.92;
    let hasSignal = false;
    if (analyser && freqData) {
      analyser.getByteFrequencyData(freqData);
      for (let k = 0; k < Math.min(freqData.length, 24); k += 1) {
        if (freqData[k] > 8) {
          hasSignal = true;
          break;
        }
      }
    }

    const t = now * 0.0085;
    for (let i = 0; i < count; i += 1) {
      let amp;
      if (analyser && freqData && hasSignal) {
        const bin = Math.min(freqData.length - 1, 1 + Math.floor((i / count) * 20));
        amp = Math.min(1, freqData[bin] / 195);
      } else {
        const centerDist = Math.abs(i - (count - 1) / 2) / ((count - 1) / 2);
        const envelope = 1 - centerDist * 0.42;
        const baseWave = 0.28 + 0.22 * Math.sin(t + i * 0.65) + 0.14 * Math.cos(t * 1.45 - i * 0.9);
        amp = Math.min(1, baseWave * envelope + speechEnergy * (0.45 + 0.35 * Math.sin(t * 1.9 + i)));
      }
      const scale = Math.max(0.22, Math.min(1.08, 0.22 + amp * 0.86));
      waveBars[i].style.transform = `scaleY(${scale.toFixed(3)})`;
    }
    voiceRafId = requestAnimationFrame(tick);
  };

  voiceRafId = requestAnimationFrame(tick);
}

async function startAudioWaveform() {
  runWaveAnimation();
  if (!navigator.mediaDevices?.getUserMedia) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true }
    });
    if (!isListening) {
      stream.getTracks().forEach((t) => {
        try { t.stop(); } catch {}
      });
      return;
    }
    micStream = stream;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioCtx = new AudioCtx();
    const source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);
  } catch {
    // Brak bezpośredniego strumienia audio nie blokuje Web Speech API — działa animacja reaktywna
  }
}

function stopDictation({ fromEnd = false } = {}) {
  const activeRec = recognition;
  recognition = null;
  if (!isListening && !activeRec) return;

  isListening = false;
  clearInterval(dictationTimerId);
  dictationTimerId = null;
  releaseAudioResources();

  composerBox?.classList.remove('is-dictating');
  micBtn?.classList.remove('mic-listening');
  micBtn?.setAttribute('aria-pressed', 'false');
  if (voiceBar) voiceBar.hidden = true;
  if (voiceInterimEl) {
    voiceInterimEl.textContent = '';
    voiceInterimEl.hidden = true;
  }

  if (!fromEnd && activeRec) {
    try { activeRec.stop(); } catch {}
  }

  if (promptInput) {
    promptInput.value = promptInput.value.replace(/\s+$/, '');
    resizeTextarea();
    if (fromEnd) promptInput.focus();
  }
}

function startDictation() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    showToast('Twoja przeglądarka nie obsługuje rozpoznawania mowy.');
    return;
  }

  if (isListening) {
    stopDictation();
    return;
  }

  dictationBaseText = promptInput ? promptInput.value.trim() : '';
  dictationFinalText = '';
  dictationStartedAt = Date.now();
  isListening = true;

  composerBox?.classList.add('is-dictating');
  micBtn?.classList.add('mic-listening');
  micBtn?.setAttribute('aria-pressed', 'true');
  if (voiceStatusLabel) voiceStatusLabel.textContent = 'Słucham… Mów teraz';
  if (voiceTimerEl) voiceTimerEl.textContent = '0:00';
  if (voiceInterimEl) {
    voiceInterimEl.textContent = '';
    voiceInterimEl.hidden = true;
  }
  if (voiceBar) voiceBar.hidden = false;

  clearInterval(dictationTimerId);
  dictationTimerId = setInterval(() => {
    if (voiceTimerEl && isListening) {
      voiceTimerEl.textContent = formatDictationDuration(Date.now() - dictationStartedAt);
    }
  }, 250);

  const rec = new SR();
  recognition = rec;
  rec.lang = 'pl-PL';
  rec.continuous = true;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  rec.onstart = () => {
    if (recognition !== rec) return;
    if (voiceStatusLabel) voiceStatusLabel.textContent = 'Słucham… Mów teraz';
  };

  rec.onsoundstart = () => {
    speechEnergy = 0.8;
  };

  rec.onspeechstart = () => {
    speechEnergy = 1;
    if (voiceStatusLabel) voiceStatusLabel.textContent = 'Rozpoznaję mowę na żywo…';
  };

  rec.onresult = (event) => {
    if (recognition !== rec || !isListening) return;
    speechEnergy = 1;

    let finalPart = '';
    let interimPart = '';
    for (let i = 0; i < event.results.length; i += 1) {
      const result = event.results[i];
      const text = String(result?.[0]?.transcript || '').trim();
      if (!text) continue;
      if (result.isFinal) finalPart += (finalPart ? ' ' : '') + text;
      else interimPart += (interimPart ? ' ' : '') + text;
    }

    dictationFinalText = finalPart;
    const combined = [dictationBaseText, dictationFinalText, interimPart].filter(Boolean).join(' ');
    if (promptInput) {
      promptInput.value = combined;
      resizeTextarea();
      promptInput.scrollTop = promptInput.scrollHeight;
    }

    if (voiceStatusLabel) {
      voiceStatusLabel.textContent = interimPart ? 'Mówisz — zapisuję na żywo…' : 'Słucham… Mów teraz';
    }
    if (voiceInterimEl) {
      if (interimPart) {
        const preview = interimPart.length > 34 ? `…${interimPart.slice(-33)}` : interimPart;
        voiceInterimEl.textContent = `„${preview}”`;
        voiceInterimEl.hidden = false;
      } else {
        voiceInterimEl.textContent = '';
        voiceInterimEl.hidden = true;
      }
    }
  };

  rec.onerror = (event) => {
    if (recognition !== rec) return;
    const code = event?.error || '';
    if (code === 'not-allowed' || code === 'service-not-allowed') {
      showToast('Zezwól przeglądarce na dostęp do mikrofonu, aby dyktować.');
      stopDictation({ fromEnd: true });
    } else if (code === 'audio-capture') {
      showToast('Nie wykryto aktywnego mikrofonu.');
      stopDictation({ fromEnd: true });
    } else if (code === 'network') {
      showToast('Błąd sieci podczas rozpoznawania mowy.');
      stopDictation({ fromEnd: true });
    } else if (code !== 'aborted' && code !== 'no-speech') {
      showToast('Przerwano dyktowanie głosowe.');
      stopDictation({ fromEnd: true });
    }
  };

  rec.onend = () => {
    if (recognition !== rec) return;
    stopDictation({ fromEnd: true });
  };

  try {
    rec.start();
    startAudioWaveform();
  } catch {
    stopDictation({ fromEnd: true });
    showToast('Nie udało się uruchomić dyktowania głosowego.');
  }
}

micBtn?.addEventListener('click', () => {
  if (isListening) stopDictation();
  else startDictation();
});

voiceStopBtn?.addEventListener('click', () => {
  stopDictation();
  promptInput?.focus();
});

function resizeTextarea() {
  if (!promptInput) return;
  promptInput.style.height = 'auto';
  promptInput.style.height = `${Math.min(promptInput.scrollHeight, 170)}px`;
}

promptInput?.addEventListener('input', resizeTextarea);
promptInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    composerForm.requestSubmit();
  }
});

composerForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (isListening) stopDictation();
  sendChatMessage();
});

// ================= TŁO CZĄSTECZKOWE, ŚWIATŁO KART I GWARANCJA WIDOCZNOŚCI =================
function initAmbientCanvas() {
  if (!ambientCanvas) return;
  const ctx = ambientCanvas.getContext('2d');
  if (!ctx) return;

  const prefersCalm = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  let width = 0;
  let height = 0;
  let particles = [];
  let lastFrame = 0;

  const createParticles = (w, h) => {
    const count = w < 720 ? 16 : 28;
    particles = Array.from({ length: count }, (_, idx) => ({
      x: ((idx + 0.5) / count) * w + (Math.random() - 0.5) * 40,
      y: Math.random() * h,
      r: 0.9 + Math.random() * 1.9,
      vy: 0.14 + Math.random() * 0.28,
      driftPhase: Math.random() * Math.PI * 2,
      alpha: 0.14 + Math.random() * 0.34
    }));
  };

  const resize = () => {
    const rect = ambientCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.round(rect.width);
    height = Math.round(rect.height);
    ambientCanvas.width = Math.round(width * dpr);
    ambientCanvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!particles.length) createParticles(width, height);
  };

  const draw = (now) => {
    requestAnimationFrame(draw);
    if (document.hidden || !width || !height) return;
    if (now - lastFrame < 33) return;
    lastFrame = now;

    ctx.clearRect(0, 0, width, height);
    const speedFactor = (prefersCalm ? 0.65 : 1) * (isListening ? 1.45 : 1);

    for (const p of particles) {
      p.y -= p.vy * speedFactor;
      p.driftPhase += 0.015 * speedFactor;
      p.x += Math.sin(p.driftPhase) * 0.22 * speedFactor;

      if (p.y < -12) {
        p.y = height + 12;
        p.x = Math.random() * width;
      }
      if (p.x < -12) p.x = width + 12;
      if (p.x > width + 12) p.x = -12;

      const pulse = 0.78 + 0.22 * Math.sin(now * 0.002 + p.driftPhase);
      const a = Math.min(0.68, p.alpha * pulse * (isListening || activeSpeakingBubble ? 1.35 : 1));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.driftPhase > Math.PI
        ? `rgba(255, 138, 43, ${(a * 0.85).toFixed(3)})`
        : `rgba(244, 199, 87, ${a.toFixed(3)})`;
      ctx.fill();
    }
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  requestAnimationFrame(draw);
}

function initCardSpotlights() {
  if (!window.matchMedia?.('(hover: hover)')?.matches) return;
  document.addEventListener('pointermove', (e) => {
    const card = e.target?.closest?.('.prompt-card, .space-card, .module-card, .media-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    card.style.setProperty('--mx', `${(e.clientX - rect.left).toFixed(1)}px`);
    card.style.setProperty('--my', `${(e.clientY - rect.top).toFixed(1)}px`);
  }, { passive: true });
}

function initPromptCascade() {
  const grid = $('.prompt-grid');
  const nav = $('#promptCascadeNav');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.prompt-card'));
  if (!cards.length) return;

  const prefersCalm = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const getWaveSize = () => (window.innerWidth <= 560 ? 2 : 3);

  let waveSize = getWaveSize();
  let totalWaves = Math.ceil(cards.length / waveSize);
  let waveIndex = 0;
  let pausedByHover = false;
  let pausedByFocus = false;
  let enterTimers = [];
  let cycleTimers = [];

  const clearEnterTimers = () => {
    for (const t of enterTimers) clearTimeout(t);
    enterTimers = [];
  };

  const clearCycleTimers = () => {
    for (const t of cycleTimers) clearTimeout(t);
    cycleTimers = [];
  };

  const clearTimers = () => {
    clearEnterTimers();
    clearCycleTimers();
  };

  const forceSliceVisible = () => {
    const start = waveIndex * waveSize;
    cards.slice(start, start + waveSize).forEach((card) => {
      card.classList.add('is-wave-slot', 'is-wave-visible');
      card.classList.remove('is-wave-leaving');
    });
  };

  const renderDots = () => {
    if (!nav) return;
    nav.replaceChildren();
    if (totalWaves <= 1) {
      nav.hidden = true;
      return;
    }
    nav.hidden = false;
    for (let i = 0; i < totalWaves; i += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'prompt-cascade-dot' + (i === waveIndex ? ' active' : '');
      dot.setAttribute('aria-label', `Zestaw propozycji ${i + 1} z ${totalWaves}`);
      dot.setAttribute('aria-pressed', String(i === waveIndex));
      dot.addEventListener('click', () => {
        showWave(i);
      });
      nav.appendChild(dot);
    }
  };

  const syncDots = () => {
    if (!nav) return;
    const dots = nav.querySelectorAll('.prompt-cascade-dot');
    dots.forEach((dot, idx) => {
      const active = idx === waveIndex;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-pressed', String(active));
    });
  };

  const scheduleCycle = () => {
    clearCycleTimers();
    if (totalWaves <= 1) return;
    if (pausedByHover || pausedByFocus || document.hidden || welcomeStage?.hidden) return;

    const holdMs = prefersCalm ? 6000 : 4600;
    const leaveStartTimer = setTimeout(() => {
      if (pausedByHover || pausedByFocus || document.hidden || welcomeStage?.hidden) return;
      const start = waveIndex * waveSize;
      const slice = cards.slice(start, start + waveSize);
      slice.forEach((card, i) => {
        const leaveT = setTimeout(() => {
          if (pausedByHover || pausedByFocus) {
            card.classList.remove('is-wave-leaving');
            card.classList.add('is-wave-visible');
            return;
          }
          card.classList.remove('is-wave-visible');
          card.classList.add('is-wave-leaving');
        }, i * 170);
        cycleTimers.push(leaveT);
      });

      const nextTimer = setTimeout(() => {
        if (pausedByHover || pausedByFocus) {
          showWave(waveIndex);
          return;
        }
        showWave((waveIndex + 1) % totalWaves);
      }, slice.length * 170 + 390);
      cycleTimers.push(nextTimer);
    }, holdMs);
    cycleTimers.push(leaveStartTimer);
  };

  function showWave(nextIdx) {
    clearTimers();
    waveIndex = ((nextIdx % totalWaves) + totalWaves) % totalWaves;
    syncDots();

    const start = waveIndex * waveSize;
    const end = start + waveSize;

    cards.forEach((card, idx) => {
      card.classList.remove('is-wave-slot', 'is-wave-visible', 'is-wave-leaving');
      if (idx >= start && idx < end) {
        card.classList.add('is-wave-slot');
      }
    });

    // Wymuszenie układu przed kaskadą wejścia kolejnych kart
    void grid.offsetHeight;

    const visibleSlice = cards.slice(start, end);
    visibleSlice.forEach((card, i) => {
      const enterT = setTimeout(() => {
        card.classList.remove('is-wave-leaving');
        card.classList.add('is-wave-visible');
      }, 40 + i * 210);
      enterTimers.push(enterT);
    });

    scheduleCycle();
  }

  grid.classList.add('is-cascade-ready');
  renderDots();
  showWave(0);

  grid.addEventListener('mouseenter', () => {
    pausedByHover = true;
    clearCycleTimers();
    forceSliceVisible();
  });

  grid.addEventListener('mouseleave', () => {
    pausedByHover = false;
    scheduleCycle();
  });

  grid.addEventListener('focusin', () => {
    pausedByFocus = true;
    clearCycleTimers();
    forceSliceVisible();
  });

  grid.addEventListener('focusout', () => {
    pausedByFocus = grid.contains(document.activeElement);
    if (!pausedByFocus) scheduleCycle();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimers();
    else showWave(waveIndex);
  });

  window.addEventListener('resize', () => {
    const nextSize = getWaveSize();
    if (nextSize !== waveSize) {
      waveSize = nextSize;
      totalWaves = Math.ceil(cards.length / waveSize);
      renderDots();
      showWave(0);
    }
  }, { passive: true });
}

setTimeout(() => {
  document.body.classList.add('ai-ready');
}, 3000);

// Inicjalizacja
syncAssistantButtons();
syncPanelButtons();
renderRecentChats();
renderRightProjects();
hydrateDailyVerse();
initLuminaAuthConnector();
initAmbientCanvas();
initCardSpotlights();
initPromptCascade();
