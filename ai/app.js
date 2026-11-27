const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const IS_TEST_ENV =
  document.querySelector('meta[name="cc-ai-env"]')?.getAttribute('content') === 'test' ||
  window.location.pathname.startsWith('/test/ai');
const STORAGE_PREFIX = IS_TEST_ENV ? 'cc_ai_test_v1' : 'cc_ai_dla_jezusa_v2';
const DEFAULT_ASSISTANT_ID = 'ai-dla-jezusa';
const ALLOWED_MODES = new Set(['CC Auto', 'Studium Biblijne', 'Twórczość CC', 'Deep Research']);
const ALLOWED_BYOK_PROVIDERS = new Set(['openrouter', 'openai', 'gemini', 'groq']);
const ALLOWED_DEPTHS = new Set(['fast', 'balanced', 'deep']);
const DEPTH_META = {
  fast: { label: 'Turbo', note: 'Szybka, konkretna odpowiedź' },
  balanced: { label: 'Standard', note: 'Zbalansowana z wersetami UBG' },
  deep: { label: 'Głęboki', note: 'Pogłębiona analiza i kroki' }
};
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

const DEFAULT_PUBLIC_FREE_MODELS = [
  { id: 'auto', provider: 'auto', label: 'Auto (najlepszy dostępny)', shortLabel: 'Auto', note: 'Automatyczny dobór darmowego AI' },
  { id: 'gemini-3.5-flash-lite', provider: 'gemini', label: 'Gemini 3.5 Flash Lite', shortLabel: 'Gemini 3.5 Lite', note: 'Szybki darmowy · domyślny CC' },
  { id: 'gemini-3.1-flash-lite', provider: 'gemini', label: 'Gemini 3.1 Flash Lite', shortLabel: 'Gemini 3.1 Lite', note: 'Stabilny darmowy · wysoka jakość' },
  { id: 'gemini-3-flash-preview', provider: 'gemini', label: 'Gemini 3 Flash', shortLabel: 'Gemini 3 Flash', note: 'Głębsza analiza · darmowa pula CC' },
  { id: 'gemini-flash-lite-latest', provider: 'gemini', label: 'Gemini Flash Lite Latest', shortLabel: 'Gemini Latest', note: 'Najnowszy lekki · darmowa pula CC' },
  { id: 'cc-knowledge-hub', provider: 'cc-knowledge-hub', label: 'Baza Wiedzy CC (offline)', shortLabel: 'Baza Wiedzy CC', note: 'Natychmiastowy · 0 zł · cytaty UBG' }
];
let availableFreeModels = DEFAULT_PUBLIC_FREE_MODELS.map((m) => ({ ...m }));

function getPersona(id) {
  return AI_PERSONAS[id] || AI_PERSONAS[DEFAULT_ASSISTANT_ID];
}

function getPreferredModelId() {
  if (byokSelected) return 'byok';
  const id = typeof state?.preferredModel === 'string' ? state.preferredModel.trim() : '';
  if (id && availableFreeModels.some((m) => m.id === id)) return id;
  return 'auto';
}

function getModelMeta(id) {
  return availableFreeModels.find((m) => m.id === id) || availableFreeModels[0];
}

function formatBadgeModelLabel(msg) {
  const used = String(msg?.modelUsed || '').trim();
  const known = used ? availableFreeModels.find((m) => m.id === used) : null;
  let modelPart = known?.shortLabel || '';
  if (!modelPart && used) {
    if (used === 'gemini-3.5-flash-lite') modelPart = 'Gemini 3.5 Lite';
    else if (used === 'gemini-3.1-flash-lite') modelPart = 'Gemini 3.1 Lite';
    else if (used === 'gemini-3-flash-preview') modelPart = 'Gemini 3 Flash';
    else if (used === 'gemini-flash-lite-latest') modelPart = 'Gemini Latest';
    else modelPart = used;
  }
  if (!modelPart) modelPart = providerLabel(msg?.provider);
  return `${modelPart} · ${msg?.mode || currentMode}`;
}

function updateTopbarModelLabel() {
  const pref = getPreferredModelId();
  let labelText = currentMode;
  if (pref === 'byok') {
    labelText = `${currentMode} · Własne API`;
  } else if (pref !== 'auto') {
    labelText = `${getModelMeta(pref).shortLabel} · ${currentMode}`;
  }
  if (activeModelLabel) activeModelLabel.textContent = labelText;
  if (composerModelLabel) composerModelLabel.textContent = labelText;
  if (typeof syncMobileComposerSheet === 'function') syncMobileComposerSheet();
}

function closeAllBadgeModelMenus() {
  $$('.badge-model-menu').forEach((menu) => {
    menu.hidden = true;
    menu.classList.remove('open-up');
  });
  $$('.provider-badge-btn').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
  });
}

function setPreferredModel(modelId, { announce = true } = {}) {
  byokSelected = false;
  const meta = getModelMeta(modelId);
  const nextId = meta?.id || 'auto';
  state.preferredModel = nextId;
  selectedOwnerModel = nextId === 'auto' ? '' : nextId;
  saveState();
  syncModelMenu();
  updateTopbarModelLabel();
  closeAllBadgeModelMenus();
  if (announce) {
    trackAiEvent('ai_model_select', { model_id: nextId, mode: currentMode });
    showToast(
      nextId === 'auto'
        ? 'Model AI: Auto (najlepszy dostępny z darmowej puli CC)'
        : `Preferowany model AI: ${meta.label}`
    );
  }
}

async function hydrateAvailableModels() {
  try {
    const res = await fetch('/api/ai-dla-jezusa/v1/chat');
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data?.availableModels) && data.availableModels.length) {
      availableFreeModels = data.availableModels.filter((m) => m && m.id && m.label);
      syncModelMenu();
      updateTopbarModelLabel();
    }
  } catch {
    // Zachowujemy wbudowaną listę darmowych modeli bez błędu
  }
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

function populateDynamicModelOptions(menuEl, triggerBtn, { includeStaticModes = false } = {}) {
  if (!menuEl) return;
  menuEl.querySelectorAll('.owner-model-opt, .model-menu-dynamic, .composer-mode-opt').forEach((el) => el.remove());

  if (includeStaticModes) {
    const modePresets = [
      ['CC Auto', 'Inteligentny dobór'],
      ['Studium Biblijne', 'Kontekst UBG'],
      ['Twórczość CC', 'Redakcja i media'],
      ['Deep Research', 'Analiza źródeł']
    ];
    for (const [mName, mNote] of modePresets) {
      const mBtn = document.createElement('button');
      mBtn.type = 'button';
      mBtn.role = 'option';
      const isModeActive = currentMode === mName;
      mBtn.className = 'dropdown-option composer-mode-opt' + (isModeActive ? ' active' : '');
      mBtn.dataset.model = mName;
      mBtn.setAttribute('aria-selected', String(isModeActive));
      const noteSpan = document.createElement('span');
      noteSpan.textContent = mNote;
      mBtn.append(document.createTextNode(`${mName} `), noteSpan);
      mBtn.addEventListener('click', () => {
        setMode(mName);
        menuEl.hidden = true;
        triggerBtn?.setAttribute('aria-expanded', 'false');
        showToast(`Aktywny tryb: ${currentMode}`);
      });
      menuEl.appendChild(mBtn);
    }
  }

  const activePref = getPreferredModelId();
  const divider = document.createElement('div');
  divider.className = 'model-menu-divider model-menu-dynamic';
  divider.setAttribute('role', 'separator');

  const groupLabel = document.createElement('div');
  groupLabel.className = 'model-menu-group-label model-menu-dynamic';
  groupLabel.textContent = 'Silnik AI (darmowe modele CC)';

  menuEl.append(divider, groupLabel);

  for (const m of availableFreeModels) {
    const opt = document.createElement('button');
    opt.type = 'button';
    opt.role = 'option';
    const isActive = activePref === m.id;
    opt.className = 'dropdown-option free-model-opt model-menu-dynamic' + (isActive ? ' active' : '');
    opt.dataset.freeModel = m.id;
    opt.setAttribute('aria-selected', String(isActive));
    const span = document.createElement('span');
    span.textContent = m.note || '';
    opt.append(document.createTextNode(`${m.label} `), span);
    opt.addEventListener('click', () => {
      setPreferredModel(m.id);
      menuEl.hidden = true;
      triggerBtn?.setAttribute('aria-expanded', 'false');
    });
    menuEl.appendChild(opt);
  }

  const byokBtn = document.createElement('button');
  byokBtn.type = 'button';
  byokBtn.className = 'dropdown-option model-byok-shortcut model-menu-dynamic';
  const byokNote = document.createElement('span');
  byokNote.textContent = byokConfig?.provider && byokConfig?.apiKey
    ? `Aktywne (${byokConfig.provider.toUpperCase()})`
    : 'Podłącz swój klucz';
  byokBtn.append(document.createTextNode('Własne API (BYOK)… '), byokNote);
  byokBtn.addEventListener('click', () => {
    menuEl.hidden = true;
    triggerBtn?.setAttribute('aria-expanded', 'false');
    openSettingsModal();
  });
  menuEl.appendChild(byokBtn);
}

function syncModelMenu() {
  populateDynamicModelOptions(modelMenu, modelPickerBtn, { includeStaticModes: false });
  populateDynamicModelOptions(composerModelMenu, composerModelBtn, { includeStaticModes: true });
}

async function refreshOwnerSession() {
  const generation = conversationGeneration;
  const authHeaders = await getAuthHeaders();
  if (generation !== conversationGeneration) return;
  if (!authHeaders.Authorization) {
    ownerSession = null;
    syncModelMenu();
    updateProfileFooterButton();
    return;
  }
  try {
    const res = await fetch('/api/ai-dla-jezusa/v1/owner/session', {
      method: 'GET',
      headers: authHeaders
    });
    if (generation !== conversationGeneration) return;
    if (!res.ok) {
      ownerSession = null;
    } else {
      const data = await res.json();
      if (generation !== conversationGeneration) return;
      if (data?.isOwner) {
        ownerSession = data;
      } else {
        ownerSession = null;
      }
    }
  } catch {
    if (generation !== conversationGeneration) return;
    ownerSession = null;
  }
  syncModelMenu();
  syncProBadge();
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
    starterPrompt: 'Pomóż mi ułożyć biblijny plan tygodnia z czasem na modlitwę, Słowo Boże, pracę przez 6 dni (niedziela–piątek) oraz świętowanie sobotniego Sabatu (Wj 20,8–11).'
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
    { title: 'Plan publikacji tygodnia', mode: 'Twórczość CC', prompt: 'Zaplanuj harmonogram treści misyjnych od niedzieli do piątku (z pełnym uszanowaniem sobotniego Sabatu) dla strony i kanałów społecznościowych.' }
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
const composerModelBtn = $('#composerModelBtn');
const composerModelMenu = $('#composerModelMenu');
const composerModelLabel = $('#composerModelLabel');
const composerCommandPopup = $('#composerCommandPopup');
const mobileComposerMenuBtn = $('#mobileComposerMenuBtn');
const mobileComposerDot = $('#mobileComposerDot');
const mobileComposerSheet = $('#mobileComposerSheet');
const closeMobileComposerSheet = $('#closeMobileComposerSheet');
const mcsModelValue = $('#mcsModelValue');
const depthBtn = $('#depthBtn');
const depthMenu = $('#depthMenu');
const depthLabel = $('#depthLabel');
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
const railFlyout = $('#railFlyout');
const DEFAULT_AMBIENT_COLOR = '#e6b84c';
const AMBIENT_COLOR_PRESETS = [
  { hex: '#e6b84c', label: 'Złoty CC' },
  { hex: '#ff7a00', label: 'Pomarańczowy CC' },
  { hex: '#38bdf8', label: 'Błękit nieba' },
  { hex: '#34d399', label: 'Szmaragdowy' },
  { hex: '#a78bfa', label: 'Fiolet' },
  { hex: '#f472b6', label: 'Różany' }
];
let ambientThemeRgb = { primary: [230, 184, 76], secondary: [244, 199, 87] };
let ambientResumeFn = null;
let ambientStopFn = null;
let closeRailFlyoutFn = () => {};
const assistantStrip = $('#assistantStrip');
const voiceAutoReadBtn = $('#voiceAutoReadBtn');
const micBtn = $('#micBtn');
const sendBtn = $('#sendBtn');
const heroTitle = $('#heroTitle');
const heroSubtitle = $('#heroSubtitle');
const proBadgeBtn = $('#proBadgeBtn');
const navMoreToggle = $('#navMoreToggle');
const navMoreGroup = $('#navMoreGroup');
const voiceChatBtn = $('#voiceChatBtn');
const voiceCallOverlay = $('#voiceCallOverlay');
const voiceCallAssistants = $('#voiceCallAssistants');
const voiceCallCloseBtn = $('#voiceCallCloseBtn');
const voiceCallAvatarWrap = $('#voiceCallAvatarWrap');
const voiceCallAvatar = $('#voiceCallAvatar');
const voiceCallName = $('#voiceCallName');
const voiceCallState = $('#voiceCallState');
const voiceCallUserText = $('#voiceCallUserText');
const voiceCallAiLabel = $('#voiceCallAiLabel');
const voiceCallAiText = $('#voiceCallAiText');
const voiceCallMuteBtn = $('#voiceCallMuteBtn');
const voiceCallSendNowBtn = $('#voiceCallSendNowBtn');
const voiceCallInterruptBtn = $('#voiceCallInterruptBtn');
const voiceCallEndBtn = $('#voiceCallEndBtn');
const infoDialog = $('#infoDialog');
const infoDialogTitle = $('#infoDialogTitle');
const infoDialogBody = $('#infoDialogBody');
const toastEl = $('#toast');

function showInfoDialog() {
  if (!infoDialog) return;
  if (!infoDialog.open) infoDialog.showModal();
}

const PRO_TRIAL_STORAGE_KEY = 'cc_ai_pro_trial_start_v1';
const PRO_PATRON_STORAGE_KEY = 'cc_ai_pro_patron_v1';
const PRO_TRIAL_DAYS = 7;

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
let byokConfig = clearLegacyByok();
let byokSelected = false;
let conversationGeneration = 0;
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
let dictationCommittedText = '';
let dictationLastInterim = '';
let dictationManualStop = false;
let dictationRestartTimer = null;
let dictationStartedAt = 0;
let dictationTimerId = null;
let voiceRafId = 0;
let speechEnergy = 0;
let streamRevealTimer = null;
let typingStatusTimer = null;
const waveBars = voiceWave ? Array.from(voiceWave.querySelectorAll('span')) : [];

const GA_MEASUREMENT_ID = 'G-Y4EFTVBPE3';
const AI_ANALYTICS_CONSENT_KEYS = [
  'cc_ai_analytics_consent',
  'cc_analytics_consent',
  'lumina_cookie_consent',
  'cc-search-analytics-consent-v1'
];
const AI_GA_SENSITIVE_KEY_RE = /^(email|e-mail|phone|tel|note|comment|opinion_text|text|message|prompt|query|token|key|secret|password|name|full_name)$/i;
const AI_GA_EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const AI_GA_PHONE_RE = /(?:\+?\d[\d\s\-()]{6,}\d)/g;
let aiGtagInitialized = false;

function getAiAnalyticsConsent() {
  try {
    if (privateMode) return 'denied';
    if (window[`ga-disable-${GA_MEASUREMENT_ID}`] === true) return 'denied';
    for (const k of AI_ANALYTICS_CONSENT_KEYS) {
      const val = localStorage.getItem(k);
      if (val === 'denied' || val === 'rejected' || val === 'false') return 'denied';
      if (val === 'granted' || val === 'accepted' || val === 'true') return 'granted';
    }
  } catch {}
  return 'default';
}

function detectAiTrafficType() {
  try {
    const s = typeof location !== 'undefined' && location.search ? location.search : '';
    const h = typeof location !== 'undefined' && location.hostname ? location.hostname : '';
    if (/[?&]cc_team=1/.test(s)) {
      try { localStorage.setItem('cc_team', '1'); } catch {}
    }
    if (/[?&]cc_team=0/.test(s)) {
      try { localStorage.removeItem('cc_team'); } catch {}
    }
    let isTeam = false;
    try { isTeam = localStorage.getItem('cc_team') === '1'; } catch {}
    if (isTeam || /[?&]in_mcr=1/.test(s) || (typeof window !== 'undefined' && window.obsstudio)) {
      return 'internal';
    }
    if (
      (typeof navigator !== 'undefined' && navigator.webdriver === true) ||
      /^(localhost|127\.0\.0\.1|0\.0\.0\.0|.*\.test)$/i.test(h) ||
      /HeadlessChrome|Playwright|Puppeteer|PhantomJS|Lighthouse/i.test((typeof navigator !== 'undefined' && navigator.userAgent) || '')
    ) {
      return 'technical_monitor';
    }
  } catch {}
  return null;
}

function sanitizeAiAnalyticsParams(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const clean = {};
  for (const [k, rawVal] of Object.entries(raw)) {
    if (!k || AI_GA_SENSITIVE_KEY_RE.test(k)) continue;
    const outKey = k === 'source' ? (Object.prototype.hasOwnProperty.call(raw, 'event_source') ? null : 'event_source') : k;
    if (!outKey || rawVal === undefined || rawVal === null) continue;
    if (typeof rawVal === 'string') {
      let v = rawVal.replace(AI_GA_EMAIL_RE, '[EMAIL_REDACTED]').replace(AI_GA_PHONE_RE, '[PHONE_REDACTED]');
      clean[outKey] = v.slice(0, 120);
    } else if ((typeof rawVal === 'number' && Number.isFinite(rawVal)) || typeof rawVal === 'boolean') {
      clean[outKey] = rawVal;
    }
  }
  return clean;
}

function ensureAiGtagLoaded() {
  if (getAiAnalyticsConsent() === 'denied') return false;
  try {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function () { window.dataLayer.push(arguments); };
    }
    if (!aiGtagInitialized) {
      aiGtagInitialized = true;
      const trafficType = detectAiTrafficType();
      window.gtag('consent', 'default', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
      window.gtag('js', new Date());
      const cfg = {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        anonymize_ip: true
      };
      if (trafficType) cfg.traffic_type = trafficType;
      window.gtag('config', GA_MEASUREMENT_ID, cfg);
    }
    if (typeof document !== 'undefined' && document.head && !document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(s);
    }
    return true;
  } catch {
    return false;
  }
}

function setAiAnalyticsConsent(granted) {
  try {
    localStorage.setItem('cc_ai_analytics_consent', granted ? 'granted' : 'denied');
  } catch {}
  try {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = !granted;
    if (granted) {
      ensureAiGtagLoaded();
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', { analytics_storage: 'granted' });
      }
    } else if (aiGtagInitialized && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
  } catch {}
}

function trackAiEvent(name, params = {}) {
  try {
    if (!name || typeof name !== 'string') return false;
    if (getAiAnalyticsConsent() === 'denied') return false;
    ensureAiGtagLoaded();
    const clean = sanitizeAiAnalyticsParams(params);
    const trafficType = detectAiTrafficType();
    if (trafficType && !clean.traffic_type) clean.traffic_type = trafficType;
    const payload = {
      transport_type: 'beacon',
      app_surface: 'ai_dla_jezusa',
      ...clean
    };
    window.__ccAiAnalyticsLog = window.__ccAiAnalyticsLog || [];
    window.__ccAiAnalyticsLog.push({ name, params: payload, ts: Date.now() });
    if (window.__ccAiAnalyticsLog.length > 50) window.__ccAiAnalyticsLog.shift();
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, payload);
      return true;
    }
  } catch {}
  return false;
}

function getProStatus() {
  if (ownerSession?.isOwner) {
    return { active: true, tier: 'owner', label: 'PRO · WŁAŚCICIEL', daysLeft: null, percent: 100 };
  }
  try {
    if (localStorage.getItem(PRO_PATRON_STORAGE_KEY) === '1') {
      return { active: true, tier: 'patron', label: 'PRO · PATRON', daysLeft: null, percent: 100 };
    }
  } catch {}

  let startedAt = Date.now();
  try {
    const raw = Number(localStorage.getItem(PRO_TRIAL_STORAGE_KEY));
    if (Number.isFinite(raw) && raw > 0) {
      startedAt = raw;
    } else {
      localStorage.setItem(PRO_TRIAL_STORAGE_KEY, String(startedAt));
    }
  } catch {}

  const totalMs = PRO_TRIAL_DAYS * 86400000;
  const elapsedMs = Math.max(0, Date.now() - startedAt);
  const remainingMs = totalMs - elapsedMs;
  if (remainingMs > 0) {
    const daysLeft = Math.max(1, Math.min(PRO_TRIAL_DAYS, Math.ceil(remainingMs / 86400000)));
    return {
      active: true,
      tier: 'trial',
      label: `PRO · ${daysLeft}d`,
      daysLeft,
      percent: Math.round((daysLeft / PRO_TRIAL_DAYS) * 100)
    };
  }
  return { active: false, tier: 'free', label: 'PRO', daysLeft: 0, percent: 0 };
}

function syncProBadge() {
  if (!proBadgeBtn) return;
  const st = getProStatus();
  proBadgeBtn.textContent = 'PRO';
  proBadgeBtn.classList.toggle('is-free-tier', !st.active);
  proBadgeBtn.classList.toggle('is-patron', st.tier === 'patron' || st.tier === 'owner');
  if (st.tier === 'trial') {
    proBadgeBtn.title = `Wersja PRO aktywna przez jeszcze ${st.daysLeft} dni (7 dni na start bez opłat)`;
  } else if (st.active) {
    proBadgeBtn.title = 'Pełna wersja PRO Christian Culture aktywna';
  } else {
    proBadgeBtn.title = 'Kliknij, aby aktywować wersję PRO dla Patronów i Mecenasów Christian Culture';
  }
}

function openProModal() {
  const st = getProStatus();
  trackAiEvent('ai_pro_modal_open', { pro_tier: st.tier });
  infoDialogTitle.textContent = st.active
    ? 'Wersja PRO — Christian Culture'
    : 'Przejdź na wersję PRO — Patroni i Mecenasi';
  infoDialogBody.replaceChildren();

  const box = document.createElement('div');
  box.className = 'pro-modal-box';

  const badge = document.createElement('span');
  badge.className = 'pro-modal-badge';
  if (st.tier === 'owner') {
    badge.textContent = '★ Pełna wersja PRO Właściciela aktywna';
  } else if (st.tier === 'patron') {
    badge.textContent = '★ Wersja PRO Patrona / Mecenasa CC aktywna';
  } else if (st.tier === 'trial') {
    badge.textContent = `★ Twój darmowy start PRO: pozostało ${st.daysLeft} z ${PRO_TRIAL_DAYS} dni`;
  } else {
    badge.textContent = '7-dniowy okres próbny PRO dobiegł końca';
  }
  box.appendChild(badge);

  if (st.tier === 'trial' || !st.active) {
    const meter = document.createElement('div');
    meter.className = 'pro-trial-meter';
    const fill = document.createElement('div');
    fill.className = 'pro-trial-fill';
    fill.style.width = `${st.percent}%`;
    meter.appendChild(fill);
    box.appendChild(meter);
  }

  const intro = document.createElement('p');
  intro.textContent = st.tier === 'trial'
    ? 'Każdy nowy użytkownik otrzymuje 7 dni pełnej wersji PRO na start bez zobowiązań. Po tym czasie wspierający Patroni i Mecenasi misji Christian Culture zachowują status PRO na stałe.'
    : st.active
      ? 'Dziękujemy za współtworzenie i wsparcie misji Christian Culture. Twoje przywileje wersji PRO są aktywne.'
      : 'Podstawowy czat z Biblią UBG i mediami CC pozostaje bezpłatny. Zostań Patronem lub Mecenasem Christian Culture, aby zachować pełną wersję PRO i współtworzyć ewangelizację.';

  const list = document.createElement('ul');
  list.className = 'pro-feature-list';
  for (const item of [
    'Priorytetowy dostęp do szybkich modeli AI (CC Auto + Gemini)',
    'Wszystkie 4 asystentki głosowe (Rut, Lea, Noemi, Miriam) + AI dla Jezusa',
    'Pełne multimedia w czacie (Radio 24/7, Biblia Audio, YouTube, Spotify)',
    'Większe limity rozmów, własne projekty i podpinanie własnych kluczy API'
  ]) {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  }

  const row = document.createElement('div');
  row.className = 'pro-cta-row';

  const patronLink = document.createElement('a');
  patronLink.className = 'pro-cta-primary';
  patronLink.href = 'https://patronite.pl/CRISTIANCULTURE';
  patronLink.target = '_blank';
  patronLink.rel = 'noopener noreferrer';
  patronLink.textContent = 'Zostań Patronem (Patronite) →';
  patronLink.addEventListener('click', () => trackAiEvent('donate_click', { method: 'patronite', place: 'ai_pro_modal' }));

  const wspieramLink = document.createElement('a');
  wspieramLink.className = 'pro-cta-secondary';
  wspieramLink.href = 'https://polskieradio.cc/wspieramto';
  wspieramLink.target = '_blank';
  wspieramLink.rel = 'noopener noreferrer';
  wspieramLink.textContent = 'Mecenas CC (WspieramTO)';
  wspieramLink.addEventListener('click', () => trackAiEvent('donate_click', { method: 'wspieramto', place: 'ai_pro_modal' }));

  row.append(patronLink, wspieramLink);

  if (st.tier !== 'owner') {
    const togglePatronBtn = document.createElement('button');
    togglePatronBtn.type = 'button';
    togglePatronBtn.className = 'pro-cta-secondary';
    const isPatronLocal = st.tier === 'patron';
    togglePatronBtn.textContent = isPatronLocal ? 'Wyłącz lokalną deklarację Patrona' : 'Jestem Patronem / Mecenasem CC';
    togglePatronBtn.addEventListener('click', () => {
      try {
        if (isPatronLocal) localStorage.removeItem(PRO_PATRON_STORAGE_KEY);
        else localStorage.setItem(PRO_PATRON_STORAGE_KEY, '1');
      } catch {}
      syncProBadge();
      openProModal();
      showToast(isPatronLocal ? 'Przywrócono standardowe rozliczanie PRO.' : 'Dziękujemy za wsparcie misji! Oznaczono status Patrona PRO.');
    });
    row.appendChild(togglePatronBtn);
  }

  box.append(intro, list, row);
  infoDialogBody.appendChild(box);
  showInfoDialog();
}

const LAST_GREETING_STORAGE_KEY = 'aiDlaJezusa:lastGreetingIdx';

const HERO_GREETINGS = [
  {
    guest: 'Co dobrego dziś chcesz zrobić dla Jezusa?',
    named: (n) => `${n}, co dobrego dziś zrobisz dla Jezusa?`
  },
  {
    guest: 'Jak rozświetlimy dziś dzień dla Jezusa?',
    named: (n) => `${n}, jak rozświetlimy dziś dzień dla Jezusa?`
  },
  {
    guest: 'Od czego zaczniemy dziś drogę z Jezusem?',
    named: (n) => `${n}, od czego zaczniemy dziś drogę z Jezusem?`
  },
  {
    guest: 'Z czym przychodzisz dziś do Ojca w niebie?',
    named: (n) => `${n}, z czym przychodzisz dziś do Ojca w niebie?`
  },
  {
    guest: 'Jakie Słowo ma dziś umocnić Twoje serce?',
    named: (n) => `${n}, jakie Słowo ma dziś umocnić Twoje serce?`
  },
  {
    guest: 'W czym mogę Ci dziś pomóc dla Chrystusa?',
    named: (n) => `${n}, w czym mogę Ci dziś pomóc dla Chrystusa?`
  },
  {
    guest: 'O czym chcesz dziś porozmawiać z Jezusem?',
    named: (n) => `${n}, o czym chcesz dziś porozmawiać z Jezusem?`
  },
  {
    guest: 'Jaką dobrą myśl zaniesiemy dziś światu?',
    named: (n) => `${n}, jaką dobrą myśl zaniesiemy dziś światu?`
  },
  {
    guest: 'Co dziś kładziesz przed naszym Zbawicielem?',
    named: (n) => `${n}, co dziś kładziesz przed Zbawicielem?`
  },
  {
    guest: 'Który rozdział Słowa otworzymy dziś razem?',
    named: (n) => `${n}, który rozdział Słowa otworzymy dziś razem?`
  },
  {
    guest: 'Kogo możemy dziś pobłogosławić w imię Jezusa?',
    named: (n) => `${n}, kogo pobłogosławimy dziś w imię Jezusa?`
  },
  {
    guest: 'Czego Twoje serce dziś potrzebuje od Boga?',
    named: (n) => `${n}, czego Twoje serce dziś potrzebuje od Boga?`
  },
  {
    guest: 'Nad czym chcesz dziś popracować z Duchem Bożym?',
    named: (n) => `${n}, nad czym popracujemy dziś z Duchem Bożym?`
  },
  {
    guest: 'Z jaką modlitwą wchodzisz w dzisiejszy dzień?',
    named: (n) => `${n}, z jaką modlitwą wchodzisz w ten dzień?`
  }
];

function pickVisitGreetingIndex() {
  const total = HERO_GREETINGS.length;
  let lastIdx = -1;
  try {
    const raw = localStorage.getItem(LAST_GREETING_STORAGE_KEY);
    if (raw !== null && /^\d+$/.test(raw)) lastIdx = Number(raw);
  } catch {}
  let nextIdx = Math.floor(Math.random() * total);
  if (total > 1 && nextIdx === lastIdx) {
    nextIdx = (lastIdx + 1 + Math.floor(Math.random() * (total - 1))) % total;
  }
  try {
    localStorage.setItem(LAST_GREETING_STORAGE_KEY, String(nextIdx));
  } catch {}
  return nextIdx;
}

const visitGreetingIndex = pickVisitGreetingIndex();

function getPersonalizedHeroCopy() {
  const rawName = (currentUser && !currentUser.isAnonymous && (currentUser.displayName || '').trim()) || '';
  const firstName = rawName ? rawName.split(/\s+/)[0].slice(0, 24) : '';
  const persona = getPersona(getActiveAssistantId());
  const variant = HERO_GREETINGS[visitGreetingIndex % HERO_GREETINGS.length] || HERO_GREETINGS[0];
  const title = firstName ? variant.named(firstName) : variant.guest;

  const subtitles = {
    'ai-dla-jezusa': 'Technologia w służbie dobra. Jezus w centrum.',
    rut: 'Tu Rut — Twoja siostra w Chrystusie i gospodyni CC. Co u Ciebie słychać duchowo? Włączymy radio 24/7, VOD lub Słowo Boże!',
    lea: 'Tu Lea — Twoja siostra i mentorka uświęcenia. Jak Twój etap drogi z Jezusem? Ułóżmy plan Słowa, Dekalogu i Kursu Codziennego.',
    noemi: 'Tu Noemi — Twoja siostra i Doradczyni Biblijna. Jak się dziś czujesz w sercu? Chodź do Ojca i Słowa (UBG) — Jezus się tym zajmie!',
    miriam: 'Tu Miriam — Alleluja! Chwała Panu! Jak Twój stan ducha? Rozświetlmy dzień Psalmami, Biblią Śpiewaną i modlitwą w Duchu Świętym!'
  };

  return {
    title,
    subtitle: subtitles[persona.id] || subtitles['ai-dla-jezusa']
  };
}

let heroSubtitleHideTimer = null;
let lastHeroSubtitleText = '';

function scheduleHeroSubtitleAutoHide(subtitleText, assistantId) {
  if (!heroSubtitle) return;
  if (heroSubtitleHideTimer) {
    clearTimeout(heroSubtitleHideTimer);
    heroSubtitleHideTimer = null;
  }
  heroSubtitle.classList.remove('is-faded-out');
  heroSubtitle.removeAttribute('aria-hidden');

  if (assistantId === 'ai-dla-jezusa') {
    heroSubtitleHideTimer = setTimeout(() => {
      heroSubtitle.classList.add('is-faded-out');
      heroSubtitle.setAttribute('aria-hidden', 'true');
    }, 4500);
  }
  lastHeroSubtitleText = subtitleText;
}

function updatePersonalizedHero() {
  const copy = getPersonalizedHeroCopy();
  const activeId = getActiveAssistantId();
  if (heroTitle && heroTitle.textContent !== copy.title) {
    heroTitle.textContent = copy.title;
    heroTitle.classList.remove('is-greeting-swap');
    void heroTitle.offsetWidth;
    heroTitle.classList.add('is-greeting-swap');
  }
  if (heroSubtitle) {
    if (heroSubtitle.textContent !== copy.subtitle) {
      heroSubtitle.textContent = copy.subtitle;
    }
    if (!lastHeroSubtitleText || lastHeroSubtitleText !== copy.subtitle) {
      scheduleHeroSubtitleAutoHide(copy.subtitle, activeId);
    }
  }
}

function getActiveAssistantId() {
  return AI_PERSONAS[state?.assistantId] ? state.assistantId : DEFAULT_ASSISTANT_ID;
}

function setActiveAssistant(id, { announce = true } = {}) {
  const persona = getPersona(id);
  state.assistantId = persona.id;
  saveState();
  syncAssistantButtons();
  updatePersonalizedHero();
  if (announce) {
    trackAiEvent('ai_assistant_select', { assistant_id: persona.id });
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

proBadgeBtn?.addEventListener('click', openProModal);

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
  showInfoDialog();
}

const ALLOWED_SPEECH_RATES = [0.8, 1, 1.15, 1.3];
let speechSessionToken = 0;

function stopSpeaking() {
  speechSessionToken += 1;
  try {
    window.speechSynthesis?.cancel?.();
  } catch {}
  if (activeSpeakingBubble) {
    activeSpeakingBubble.classList.remove('is-speaking');
    activeSpeakingBubble.querySelectorAll('.is-speaking-btn').forEach((b) => {
      b.classList.remove('is-speaking-btn');
      b.textContent = '🔊 Odsłuchaj';
    });
    activeSpeakingBubble.querySelectorAll('.speech-controls-bar').forEach((el) => el.remove());
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

function splitSpeechChunks(cleanText, maxLen = 320) {
  const sentences = String(cleanText || '').split(/(?<=[.!?…])\s+/).filter(Boolean);
  const chunks = [];
  let buf = '';
  for (const s of sentences) {
    if ((buf ? `${buf} ${s}` : s).length <= maxLen) {
      buf = buf ? `${buf} ${s}` : s;
    } else {
      if (buf) {
        chunks.push(buf);
        buf = '';
      }
      if (s.length <= maxLen) {
        buf = s;
      } else {
        const words = s.split(/\s+/);
        for (const w of words) {
          if ((buf ? `${buf} ${w}` : w).length <= maxLen) {
            buf = buf ? `${buf} ${w}` : w;
          } else {
            if (buf) chunks.push(buf);
            buf = w;
          }
        }
      }
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

function pickSystemPlVoice(voices = [], persona, preferredUri = '', isPrivate = false) {
  const plAll = voices.filter((v) => /^pl/i.test(v?.lang || ''));
  const eligible = isPrivate ? plAll.filter((v) => v?.localService === true) : plAll;
  if (!eligible.length) return { voice: null, eligible, plTotal: plAll.length };

  if (preferredUri) {
    const exact = eligible.find((v) => v.voiceURI === preferredUri);
    if (exact) return { voice: exact, eligible, plTotal: plAll.length };
  }

  const femaleRe = /(zofia|paulina|ewa|agnieszka|ola|maja|karolina|katarzyna|anna|female|natural)/i;
  const maleRe = /(marek|adam|krzysztof|piotr|pawe[łl]|jacek|jan|bartek|tomasz|male)/i;
  if (persona?.gender === 'female') {
    const plFemaleVoice = eligible.find((v) => femaleRe.test(v.name || '')) || eligible[0];
    return { voice: plFemaleVoice, eligible, plTotal: plAll.length };
  }
  const plMaleVoice =
    eligible.find((v) => maleRe.test(v.name || '')) ||
    eligible.find((v) => !femaleRe.test(v.name || '')) ||
    eligible[0];
  return { voice: plMaleVoice, eligible, plTotal: plAll.length };
}

function speakReply(text, assistantId, bubbleEl, btnEl, opts = {}) {
  const synth = window.speechSynthesis;
  if (!synth || typeof window.SpeechSynthesisUtterance !== 'function') {
    showToast('Twoja przeglądarka nie obsługuje syntezatora mowy.');
    if (typeof opts?.onEnd === 'function') opts.onEnd();
    return;
  }

  const wasSameBubble = bubbleEl && activeSpeakingBubble === bubbleEl && (synth.speaking || synth.paused);
  stopSpeaking();
  if (wasSameBubble) return;

  const clean = stripMarkdownForSpeech(text);
  const chunks = splitSpeechChunks(clean);
  if (!chunks.length) {
    if (typeof opts?.onEnd === 'function') opts.onEnd();
    return;
  }

  const myToken = speechSessionToken;
  const persona = getPersona(assistantId);
  let rate = ALLOWED_SPEECH_RATES.includes(Number(state?.speechRate)) ? Number(state.speechRate) : 1;
  let chunkIndex = 0;
  let isPaused = false;
  let barEl = null;
  let pauseBtn = null;
  let rateBtn = null;
  let voiceSelect = null;
  let statusNote = null;

  const finish = () => {
    if (myToken !== speechSessionToken) return;
    stopSpeaking();
    if (typeof opts?.onEnd === 'function') opts.onEnd();
  };

  const getActiveVoices = () => {
    try {
      return synth.getVoices?.() || [];
    } catch {
      return [];
    }
  };

  const renderVoiceSelect = (eligible) => {
    if (!voiceSelect) return;
    voiceSelect.replaceChildren();
    if (!eligible.length) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = privateMode ? 'Brak lokalnego głosu pl-PL' : 'Domyślny głos pl-PL';
      voiceSelect.appendChild(opt);
      voiceSelect.disabled = privateMode;
      return;
    }
    voiceSelect.disabled = false;
    for (const v of eligible) {
      const opt = document.createElement('option');
      opt.value = v.voiceURI || v.name || '';
      const modeTag = v.localService === true ? 'lokalny' : 'zdalny';
      opt.textContent = `${v.name || 'Polski'} (${modeTag})`;
      if (state?.speechVoiceUri && opt.value === state.speechVoiceUri) opt.selected = true;
      voiceSelect.appendChild(opt);
    }
  };

  const speakCurrentChunk = () => {
    if (myToken !== speechSessionToken) return;
    if (chunkIndex >= chunks.length) {
      finish();
      return;
    }

    const voices = getActiveVoices();
    const { voice, eligible, plTotal } = pickSystemPlVoice(voices, persona, state?.speechVoiceUri || '', privateMode);
    renderVoiceSelect(eligible);

    if (privateMode && !voice) {
      if (statusNote) {
        statusNote.textContent = 'Tryb prywatny wymaga lokalnego głosu pl-PL na urządzeniu — użyj przycisku Kopiuj.';
      }
      if (pauseBtn) pauseBtn.disabled = true;
      showToast('Tryb prywatny: brak lokalnego głosu pl-PL na urządzeniu.');
      return;
    }

    if (statusNote) {
      statusNote.textContent = plTotal === 0
        ? 'Brak polskiego głosu pl-PL — przeglądarka użyje głosu domyślnego.'
        : `Fragment ${chunkIndex + 1} / ${chunks.length}${privateMode ? ' · głos lokalny' : ''}`;
    }

    const utter = new SpeechSynthesisUtterance(chunks[chunkIndex]);
    utter.lang = 'pl-PL';
    utter.rate = rate;
    utter.pitch = persona.pitch || 1.0;
    if (voice) {
      utter.voice = voice;
      if (voiceSelect && voice.voiceURI) voiceSelect.value = voice.voiceURI;
      if (persona.gender !== 'female' && !/(marek|adam|krzysztof|piotr|pawe[łl]|jacek|jan|bartek|tomasz|male)/i.test(voice.name || '')) {
        utter.pitch = Math.min(persona.pitch || 0.94, 0.88);
      }
    }

    utter.onend = () => {
      if (myToken !== speechSessionToken) return;
      chunkIndex += 1;
      speakCurrentChunk();
    };
    utter.onerror = () => {
      if (myToken !== speechSessionToken) return;
      if (statusNote) statusNote.textContent = 'Odtwarzanie zatrzymane lub niedostępne na tym urządzeniu.';
      finish();
    };

    try {
      synth.speak(utter);
    } catch {
      finish();
    }
  };

  activeSpeakingBubble = bubbleEl || null;
  bubbleEl?.classList.add('is-speaking');
  if (btnEl) {
    btnEl.classList.add('is-speaking-btn');
    btnEl.textContent = '⏹ Zatrzymaj głos';
  }

  if (bubbleEl) {
    barEl = document.createElement('div');
    barEl.className = 'speech-controls-bar';
    barEl.setAttribute('role', 'region');
    barEl.setAttribute('aria-label', 'Sterowanie odtwarzaniem głosu');

    pauseBtn = document.createElement('button');
    pauseBtn.type = 'button';
    pauseBtn.className = 'speech-ctrl-btn';
    pauseBtn.textContent = '⏸ Pauza';
    pauseBtn.onclick = () => {
      if (isPaused) {
        isPaused = false;
        pauseBtn.textContent = '⏸ Pauza';
        try { synth.resume?.(); } catch {}
      } else {
        isPaused = true;
        pauseBtn.textContent = '▶ Wznów';
        try { synth.pause?.(); } catch {}
      }
    };

    const stopBtn = document.createElement('button');
    stopBtn.type = 'button';
    stopBtn.className = 'speech-ctrl-btn';
    stopBtn.textContent = '⏹ Stop';
    stopBtn.onclick = () => finish();

    rateBtn = document.createElement('button');
    rateBtn.type = 'button';
    rateBtn.className = 'speech-ctrl-btn';
    rateBtn.textContent = `Tempo ${rate}×`;
    rateBtn.onclick = () => {
      const nextIdx = (ALLOWED_SPEECH_RATES.indexOf(rate) + 1) % ALLOWED_SPEECH_RATES.length;
      rate = ALLOWED_SPEECH_RATES[nextIdx];
      state.speechRate = rate;
      saveState();
      rateBtn.textContent = `Tempo ${rate}×`;
      if (!privateMode || pickSystemPlVoice(getActiveVoices(), persona, state?.speechVoiceUri || '', true).voice) {
        isPaused = false;
        if (pauseBtn) pauseBtn.textContent = '⏸ Pauza';
        try { synth.cancel?.(); } catch {}
        speakCurrentChunk();
      }
    };

    voiceSelect = document.createElement('select');
    voiceSelect.className = 'speech-voice-select';
    voiceSelect.setAttribute('aria-label', 'Wybór polskiego głosu systemowego');
    voiceSelect.onchange = () => {
      state.speechVoiceUri = voiceSelect.value || '';
      saveState();
      isPaused = false;
      if (pauseBtn) pauseBtn.textContent = '⏸ Pauza';
      try { synth.cancel?.(); } catch {}
      speakCurrentChunk();
    };

    statusNote = document.createElement('span');
    statusNote.className = 'speech-status-note';

    barEl.append(pauseBtn, stopBtn, rateBtn, voiceSelect, statusNote);
    bubbleEl.appendChild(barEl);
  }

  if (typeof synth.addEventListener === 'function') {
    const onVoices = () => {
      if (myToken !== speechSessionToken) return;
      const { eligible } = pickSystemPlVoice(getActiveVoices(), persona, state?.speechVoiceUri || '', privateMode);
      renderVoiceSelect(eligible);
    };
    synth.addEventListener('voiceschanged', onVoices, { once: true });
  }

  speakCurrentChunk();
}

function getUidScope(uid = currentUser?.uid) {
  return uid ? String(uid) : 'guest';
}

function getStorageKey(uid) {
  return `${STORAGE_PREFIX}:${getUidScope(uid)}`;
}

function loadState(uid = currentUser?.uid) {
  const empty = {
    chats: [],
    notes: [],
    favorites: [],
    reactions: {},
    opinions: [],
    memory: [],
    reminders: [],
    projects: [...DEFAULT_PROJECTS],
    assistantId: DEFAULT_ASSISTANT_ID,
    preferredModel: 'auto',
    mode: 'CC Auto',
    responseDepth: 'balanced',
    autoReadEnabled: false,
    webSearchEnabled: false,
    selectedTools: [],
    privateMode: false,
    navMoreOpen: false,
    byokProvider: '',
    byokModel: '',
    leftCollapsed: false,
    rightCollapsed: false,
    ambientBgEnabled: true,
    ambientBgColor: DEFAULT_AMBIENT_COLOR,
    railHoverPreview: true,
    speechVoiceUri: '',
    speechRate: 1
  };
  try {
    const raw = JSON.parse(localStorage.getItem(getStorageKey(uid)) || 'null');
    if (!raw || typeof raw !== 'object') return empty;
    const rawMode = typeof raw.mode === 'string' ? raw.mode.trim() : '';
    const rawDepth = typeof raw.responseDepth === 'string' ? raw.responseDepth.trim().toLowerCase() : '';
    const rawByokProvider = typeof raw.byokProvider === 'string' ? raw.byokProvider.trim().toLowerCase() : '';
    const safeReactions = {};
    if (raw.reactions && typeof raw.reactions === 'object' && !Array.isArray(raw.reactions)) {
      for (const [rk, rv] of Object.entries(raw.reactions).slice(0, 200)) {
        if (rv === 'up' || rv === 'down') safeReactions[String(rk).slice(0, 80)] = rv;
      }
    }
    return {
      chats: Array.isArray(raw.chats) ? raw.chats.slice(0, 40) : [],
      notes: Array.isArray(raw.notes) ? raw.notes.slice(0, 60) : [],
      favorites: Array.isArray(raw.favorites) ? raw.favorites.slice(0, 80) : [],
      reactions: safeReactions,
      opinions: Array.isArray(raw.opinions) ? raw.opinions.slice(0, 80) : [],
      memory: Array.isArray(raw.memory) ? raw.memory.slice(0, 20) : [],
      reminders: Array.isArray(raw.reminders) ? raw.reminders.slice(0, 40) : [],
      projects: Array.isArray(raw.projects) && raw.projects.length ? raw.projects.slice(0, 20) : [...DEFAULT_PROJECTS],
      assistantId: typeof raw.assistantId === 'string' && AI_PERSONAS[raw.assistantId] ? raw.assistantId : DEFAULT_ASSISTANT_ID,
      preferredModel: typeof raw.preferredModel === 'string' && raw.preferredModel.trim() ? raw.preferredModel.trim() : 'auto',
      mode: ALLOWED_MODES.has(rawMode) ? rawMode : 'CC Auto',
      responseDepth: ALLOWED_DEPTHS.has(rawDepth) ? rawDepth : 'balanced',
      autoReadEnabled: Boolean(raw.autoReadEnabled),
      webSearchEnabled: Boolean(raw.webSearchEnabled),
      selectedTools: Array.isArray(raw.selectedTools)
        ? [...new Set(raw.selectedTools.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim()))].slice(0, 10)
        : [],
      privateMode: Boolean(raw.privateMode),
      navMoreOpen: Boolean(raw.navMoreOpen),
      byokProvider: ALLOWED_BYOK_PROVIDERS.has(rawByokProvider) ? rawByokProvider : '',
      byokModel: typeof raw.byokModel === 'string' ? raw.byokModel.trim().slice(0, 80) : '',
      leftCollapsed: Boolean(raw.leftCollapsed),
      rightCollapsed: Boolean(raw.rightCollapsed),
      ambientBgEnabled: raw.ambientBgEnabled !== false,
      ambientBgColor: normalizeHexColor(raw.ambientBgColor) || DEFAULT_AMBIENT_COLOR,
      railHoverPreview: raw.railHoverPreview !== false,
      speechVoiceUri: typeof raw.speechVoiceUri === 'string' ? raw.speechVoiceUri.slice(0, 200) : '',
      speechRate: ALLOWED_SPEECH_RATES.includes(Number(raw.speechRate)) ? Number(raw.speechRate) : 1
    };
  } catch {
    return empty;
  }
}

function saveState() {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(state));
  } catch {
    showToast('Pamięć przeglądarki jest pełna — historia działa tylko w tej sesji.');
  }
}

function syncMobileComposerSheet() {
  const depthRaw = typeof state?.responseDepth === 'string' ? state.responseDepth.trim().toLowerCase() : 'balanced';
  const depth = ALLOWED_DEPTHS.has(depthRaw) ? depthRaw : 'balanced';
  if (mcsModelValue) {
    mcsModelValue.textContent = composerModelLabel?.textContent || activeModelLabel?.textContent || 'CC Auto';
  }
  $$('#mobileComposerSheet [data-mcs-depth]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mcsDepth === depth);
  });
  const webChip = $('#mobileComposerSheet [data-mcs-toggle="web"]');
  if (webChip) webChip.classList.toggle('active', Boolean(webSearchEnabled));
  const readChip = $('#mobileComposerSheet [data-mcs-toggle="autoread"]');
  if (readChip) readChip.classList.toggle('active', Boolean(autoReadEnabled));
  $$('#mobileComposerSheet [data-mcs-tool]').forEach((btn) => {
    btn.classList.toggle('active', Boolean(btn.dataset.mcsTool && selectedTools.has(btn.dataset.mcsTool)));
  });
  if (mobileComposerDot) {
    const hasActiveOptions = Boolean(webSearchEnabled || autoReadEnabled || selectedTools.size > 0 || depth !== 'balanced');
    mobileComposerDot.hidden = !hasActiveOptions;
  }
}

function syncDepthUI() {
  const raw = typeof state?.responseDepth === 'string' ? state.responseDepth.trim().toLowerCase() : 'balanced';
  const depth = ALLOWED_DEPTHS.has(raw) ? raw : 'balanced';
  const meta = DEPTH_META[depth] || DEPTH_META.balanced;
  if (depthLabel) depthLabel.textContent = meta.label;
  if (depthBtn) {
    depthBtn.classList.toggle('is-fast', depth === 'fast');
    depthBtn.classList.toggle('is-deep', depth === 'deep');
    depthBtn.setAttribute('aria-label', `Poziom odpowiedzi: ${meta.label} (${meta.note})`);
  }
  $$('#depthMenu .dropdown-option[data-depth]').forEach((opt) => {
    const active = opt.dataset.depth === depth;
    opt.classList.toggle('active', active);
    opt.setAttribute('aria-selected', String(active));
  });
  syncMobileComposerSheet();
}

function setResponseDepth(depth, { announce = true } = {}) {
  const clean = typeof depth === 'string' ? depth.trim().toLowerCase() : '';
  const next = ALLOWED_DEPTHS.has(clean) ? clean : 'balanced';
  state.responseDepth = next;
  saveState();
  syncDepthUI();
  if (announce) {
    const meta = DEPTH_META[next] || DEPTH_META.balanced;
    showToast(`Styl odpowiedzi: ${meta.label} (${meta.note})`);
  }
}

function normalizeHexColor(val) {
  if (typeof val !== 'string') return '';
  const m = val.trim().match(/^#([0-9a-f]{6})$/i);
  return m ? `#${m[1].toLowerCase()}` : '';
}

function hexToRgbTuple(hex) {
  const clean = normalizeHexColor(hex) || DEFAULT_AMBIENT_COLOR;
  const n = parseInt(clean.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function applyAmbientBgPreference() {
  const enabled = state?.ambientBgEnabled !== false;
  const hex = normalizeHexColor(state?.ambientBgColor) || DEFAULT_AMBIENT_COLOR;
  const primary = hexToRgbTuple(hex);
  const secondary = primary.map((c) => Math.min(255, Math.round(c + (255 - c) * 0.28)));
  ambientThemeRgb = { primary, secondary };

  document.documentElement.style.setProperty('--ambient-rgb', primary.join(', '));
  document.documentElement.style.setProperty('--ambient-rgb-soft', secondary.join(', '));
  document.body.classList.toggle('ambient-bg-off', !enabled);

  if (enabled) ambientResumeFn?.();
  else ambientStopFn?.();
}

function applyPreferencesFromState() {
  const modeFromState = typeof state?.mode === 'string' && ALLOWED_MODES.has(state.mode) ? state.mode : 'CC Auto';
  currentMode = modeFromState;
  $$('#modelMenu .dropdown-option[data-model], #composerModelMenu .dropdown-option[data-model]').forEach((o) => {
    const selected = o.dataset.model === currentMode;
    o.classList.toggle('active', selected);
    o.setAttribute('aria-selected', String(selected));
  });

  autoReadEnabled = Boolean(state?.autoReadEnabled);
  voiceAutoReadBtn?.setAttribute('aria-pressed', String(autoReadEnabled));

  webSearchEnabled = Boolean(state?.webSearchEnabled);
  webSearchBtn?.setAttribute('aria-pressed', String(webSearchEnabled));

  const toolsArr = Array.isArray(state?.selectedTools) ? state.selectedTools : [];
  selectedTools = new Set(toolsArr);
  $$('#toolsMenu .dropdown-option').forEach((opt) => {
    const t = opt.dataset.tool || '';
    opt.classList.toggle('active', Boolean(t && selectedTools.has(t)));
  });

  privateMode = Boolean(state?.privateMode);
  privacyToggleBtn?.setAttribute('aria-checked', String(privateMode));

  const moreOpen = Boolean(state?.navMoreOpen);
  if (navMoreGroup) navMoreGroup.hidden = !moreOpen;
  navMoreToggle?.setAttribute('aria-expanded', String(moreOpen));

  byokConfig = {
    provider: typeof state?.byokProvider === 'string' && ALLOWED_BYOK_PROVIDERS.has(state.byokProvider) ? state.byokProvider : '',
    apiKey: byokConfig?.apiKey || '',
    model: typeof state?.byokModel === 'string' ? state.byokModel.trim().slice(0, 80) : ''
  };
  if (!byokConfig.apiKey) byokSelected = false;

  const pref = typeof state?.preferredModel === 'string' ? state.preferredModel.trim() : 'auto';
  selectedOwnerModel = pref === 'auto' || pref === 'byok' ? '' : pref;

  syncAssistantButtons();
  syncPanelButtons();
  syncModelMenu();
  syncDepthUI();
  updateTopbarModelLabel();
  syncSendButtonMode();
  applyAmbientBgPreference();
}

function clearLegacyByok() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX + ':byok:')) localStorage.removeItem(key);
    }
  } catch {}
  return { provider: '', apiKey: '', model: '' };
}

function saveByokConfig(nextCfg) {
  const providerRaw = String(nextCfg?.provider || '').trim().toLowerCase();
  const provider = ALLOWED_BYOK_PROVIDERS.has(providerRaw) ? providerRaw : '';
  const model = String(nextCfg?.model || '').trim().slice(0, 80);
  byokConfig = {
    provider,
    apiKey: String(nextCfg?.apiKey || '').trim(),
    model
  };
  byokSelected = Boolean(byokConfig.provider && byokConfig.apiKey);
  state.byokProvider = provider;
  state.byokModel = model;
  saveState();
  syncModelMenu();
  updateTopbarModelLabel();
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
  showInfoDialog();
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
  const focusedPanel = document.activeElement?.closest('#leftSidebar, #rightSidebar');

  document.body.classList.toggle('left-collapsed', leftCollapsedDesktop);
  document.body.classList.toggle('right-collapsed', rightCollapsedDesktop);
  if (!leftCollapsedDesktop || !rightCollapsedDesktop) closeRailFlyoutFn();

  if ((focusedPanel?.id === 'leftSidebar' && leftCollapsedDesktop) ||
      (focusedPanel?.id === 'rightSidebar' && rightCollapsedDesktop)) {
    if (!document.activeElement?.closest('.panel-rail')) {
      focusedPanel.querySelector('[data-rail-open]')?.focus();
    }
  }

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

function closeAllSidePanels() {
  const leftOverlay = isLeftOverlayMode();
  const rightOverlay = isRightOverlayMode();
  const hadOverlay =
    document.body.classList.contains('left-drawer-open') ||
    document.body.classList.contains('right-drawer-open');
  if (hadOverlay) {
    document.body.classList.remove('left-drawer-open', 'right-drawer-open');
    if (scrim) scrim.hidden = true;
  }
  let desktopChanged = false;
  if (!leftOverlay && !state.leftCollapsed) {
    state.leftCollapsed = true;
    desktopChanged = true;
  }
  if (!rightOverlay && !state.rightCollapsed) {
    state.rightCollapsed = true;
    desktopChanged = true;
  }
  if (desktopChanged) saveState();
  if (hadOverlay || desktopChanged) syncPanelButtons();
}

openLeftBtn?.addEventListener('click', toggleLeftPanel);
closeLeftBtn?.addEventListener('click', closeLeftPanel);
openRightBtn?.addEventListener('click', toggleRightPanel);
closeRightBtn?.addEventListener('click', closeRightPanel);
$$('.panel-rail-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const { railClick, railFocus, railOpen, railNav } = button.dataset;
    if (railClick) {
      document.getElementById(railClick)?.click();
      return;
    }
    if (railNav) {
      document.querySelector(`#leftSidebar [data-nav="${CSS.escape(railNav)}"]`)?.click();
      return;
    }
    const left = button.closest('#leftSidebar');
    const toggle = left ? openLeftBtn : openRightBtn;
    toggle?.click();
    const focusTarget = railOpen ? toggle : document.getElementById(railFocus);
    if (focusTarget) {
      focusTarget.scrollIntoView?.({ block: 'nearest' });
      focusTarget.focus();
    }
  });
});
scrim?.addEventListener('click', closeDrawers);
mainWorkspace?.addEventListener('click', (e) => {
  if (window.getSelection?.()?.toString()?.trim()) return;
  const target = e.target;
  if (!(target instanceof Element)) return;
  if (target.closest('button, a, input, textarea, select, label, [role="button"], [role="option"], [role="menuitem"], .composer-box, .prompt-card, .assistant-strip, .msg-bubble, .msg-card, .media-card, .module-card, .dropdown-menu, .composer-cmd-popup, .workspace-footer, video, audio, iframe')) {
    return;
  }
  closeAllSidePanels();
});
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
  let matchedInsideMore = false;
  $$('.nav-item').forEach((b) => {
    const isMatch = b.dataset.nav === name;
    b.classList.toggle('active', isMatch);
    if (isMatch) {
      b.setAttribute('aria-current', 'page');
      if (navMoreGroup && navMoreGroup.contains(b)) matchedInsideMore = true;
    } else {
      b.removeAttribute('aria-current');
    }
  });
  $$('.panel-rail-btn[data-rail-nav]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.railNav === name);
  });
  if (matchedInsideMore && navMoreGroup && navMoreGroup.hidden) {
    navMoreGroup.hidden = false;
    navMoreToggle?.setAttribute('aria-expanded', 'true');
  }
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
  if (typingStatusTimer) {
    clearInterval(typingStatusTimer);
    typingStatusTimer = null;
  }
}

function stripMarkdownPlain(text) {
  return String(text || '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/[*_`~]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasInteractiveQuestion(assistantText, userText = '') {
  const cleanAi = String(assistantText || '').replace(/https?:\/\/\S+/gi, '');
  const cleanUser = String(userText || '').replace(/https?:\/\/\S+/gi, '');
  return cleanAi.includes('?') || cleanUser.includes('?');
}

function buildMessageTitle(msg, prevUserText = '') {
  const u = stripMarkdownPlain(prevUserText);
  if (u && u.length > 3) return u.slice(0, 68);
  const plain = stripMarkdownPlain(msg?.text || '');
  return (plain.split(/[.!?\n]/)[0] || 'Notatka AI dla Jezusa').slice(0, 68);
}

function saveMessageToNotes(msg, prevUserText = '', { savedLater = false } = {}) {
  if (!Array.isArray(state.notes)) state.notes = [];
  const existing = state.notes.find((n) => n.id === msg.id);
  if (existing) {
    if (savedLater && !existing.savedLater) {
      existing.savedLater = true;
      existing.updatedAt = new Date().toISOString();
      saveState();
      return 'later';
    }
    return 'exists';
  }
  state.notes.unshift({
    id: msg.id,
    title: buildMessageTitle(msg, prevUserText),
    text: msg.text,
    sources: msg.sources || [],
    savedLater: Boolean(savedLater),
    savedAt: new Date().toISOString()
  });
  saveState();
  if (currentNav === 'Notatniki') renderModule('Notatniki');
  return savedLater ? 'later' : 'saved';
}

function rememberMessageInMemory(msg, prevUserText = '') {
  if (!Array.isArray(state.memory)) state.memory = [];
  const plain = stripMarkdownPlain(msg?.text || '');
  const title = buildMessageTitle(msg, prevUserText);
  const snippet = (plain.length > 140 ? `${plain.slice(0, 140)}…` : plain) || title;
  const entryText = (title && !snippet.startsWith(title.slice(0, 20))
    ? `${title}: ${snippet}`
    : snippet).slice(0, 200);
  if (!entryText) return false;
  if (state.memory.some((m) => m.msgId === msg.id || m.text === entryText)) return false;
  state.memory.unshift({
    id: 'mem-' + Date.now(),
    msgId: msg.id,
    text: entryText,
    createdAt: new Date().toISOString()
  });
  state.memory = state.memory.slice(0, 20);
  saveState();
  if (currentNav === 'Pamięć') renderModule('Pamięć');
  return true;
}

function createReactionSvg(kind) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', kind === 'star-filled' ? 'currentColor' : 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const addPath = (d) => {
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
  };
  if (kind === 'up') {
    addPath('M7 10v12');
    addPath('M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z');
  } else if (kind === 'down') {
    addPath('M17 14V2');
    addPath('M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z');
  } else if (kind === 'star' || kind === 'star-filled') {
    const poly = document.createElementNS(ns, 'polygon');
    poly.setAttribute('points', '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2');
    svg.appendChild(poly);
  } else if (kind === 'opinion') {
    addPath('M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8Z');
    addPath('M8.5 11.5h7M8.5 14.5h4.5');
  } else if (kind === 'more') {
    for (const cx of [5, 12, 19]) {
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', String(cx));
      c.setAttribute('cy', '12');
      c.setAttribute('r', '1.6');
      c.setAttribute('fill', 'currentColor');
      svg.appendChild(c);
    }
  } else if (kind === 'chevron') {
    svg.setAttribute('class', 'msg-more-chev');
    addPath('m6 9 6 6 6-6');
  }
  return svg;
}

async function sendFeedbackToServer(payload) {
  if (privateMode) return { ok: true, stored: false, reason: 'private_mode' };
  try {
    const res = await fetch('/api/ai-dla-jezusa/v1/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, privateMode })
    });
    if (!res.ok) return { ok: false, status: res.status };
    return await res.json();
  } catch {
    return { ok: false };
  }
}

async function openOwnerFeedbackModal(filterKind = '') {
  if (!ownerSession?.isOwner) {
    showToast('Dostęp wyłącznie dla zalogowanego konta właściciela.');
    return;
  }
  infoDialogTitle.textContent = '📊 Opinie i reakcje użytkowników';
  infoDialogBody.replaceChildren();

  const waitP = document.createElement('p');
  waitP.textContent = 'Pobieram opinie użytkowników z bazy Cloudflare D1...';
  infoDialogBody.appendChild(waitP);
  showInfoDialog();

  try {
    const authHeaders = await getAuthHeaders();
    const qs = new URLSearchParams({ limit: '100' });
    if (filterKind) qs.set('kind', filterKind);
    const res = await fetch(`/api/ai-dla-jezusa/v1/owner/feedback?${qs.toString()}`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok || !data?.ok) {
      throw new Error(data?.detail || data?.error || `HTTP ${res.status}`);
    }

    infoDialogBody.replaceChildren();
    const sum = data.summary || {};

    const kpis = document.createElement('div');
    kpis.className = 'owner-fb-kpis';
    for (const [val, label] of [
      [sum.opinions ?? 0, 'Opinie pisemne'],
      [sum.avg_rating != null ? `${sum.avg_rating} ★` : '—', 'Średnia ocena'],
      [sum.total ?? 0, 'Wszystkie reakcje'],
      [sum.thumbs_up ?? 0, 'Łapki w górę 👍'],
      [sum.thumbs_down ?? 0, 'Łapki w dół 👎'],
      [sum.favorites ?? 0, 'Ulubione ★']
    ]) {
      const box = document.createElement('div');
      box.className = 'owner-fb-kpi';
      const st = document.createElement('strong');
      st.textContent = String(val);
      const sp = document.createElement('span');
      sp.textContent = label;
      box.append(st, sp);
      kpis.appendChild(box);
    }

    const filterRow = document.createElement('div');
    filterRow.className = 'opinion-cats';
    for (const [kVal, kLabel] of [
      ['', 'Wszystkie'],
      ['opinion', 'Opinie'],
      ['thumbs_up', '👍'],
      ['thumbs_down', '👎'],
      ['favorite', '★']
    ]) {
      const fbBtn = document.createElement('button');
      fbBtn.type = 'button';
      fbBtn.className = 'opinion-cat-btn' + (filterKind === kVal ? ' active' : '');
      fbBtn.textContent = kLabel;
      fbBtn.onclick = () => openOwnerFeedbackModal(kVal);
      filterRow.appendChild(fbBtn);
    }

    const actRow = document.createElement('div');
    actRow.className = 'dialog-actions-row';
    const csvBtn = document.createElement('button');
    csvBtn.type = 'button';
    csvBtn.className = 'connect-btn';
    csvBtn.textContent = 'Pobierz CSV';
    csvBtn.onclick = async () => {
      try {
        const h = await getAuthHeaders();
        const cQs = new URLSearchParams({ format: 'csv', limit: '200' });
        if (filterKind) cQs.set('kind', filterKind);
        const cRes = await fetch(`/api/ai-dla-jezusa/v1/owner/feedback?${cQs.toString()}`, { headers: h });
        if (!cRes.ok) throw new Error(`HTTP ${cRes.status}`);
        const blob = await cRes.blob();
        const href = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = 'ai-dla-jezusa-opinie.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(href), 2000);
        showToast('Pobrano zestawienie opinii w formacie CSV.');
      } catch {
        showToast('Nie udało się pobrać pliku CSV.');
      }
    };
    const refreshBtn = document.createElement('button');
    refreshBtn.type = 'button';
    refreshBtn.className = 'dialog-btn-secondary';
    refreshBtn.textContent = 'Odśwież';
    refreshBtn.onclick = () => openOwnerFeedbackModal(filterKind);
    actRow.append(csvBtn, refreshBtn);

    const listWrap = document.createElement('div');
    listWrap.className = 'owner-fb-list';
    const items = Array.isArray(data.items) ? data.items : [];
    if (!items.length) {
      const emp = document.createElement('p');
      emp.className = 'module-empty';
      emp.textContent = 'Brak zapisanych wpisów dla wybranego filtra.';
      listWrap.appendChild(emp);
    } else {
      for (const it of items) {
        const card = document.createElement('article');
        card.className = 'owner-fb-card';
        const meta = document.createElement('div');
        meta.className = 'owner-fb-meta';
        const leftM = document.createElement('strong');
        const kindLabel = it.kind === 'opinion'
          ? `Opinia ${'★'.repeat(it.rating || 0)} (${it.category || 'brak'})`
          : it.kind;
        leftM.textContent = kindLabel;
        const rightM = document.createElement('span');
        const dtStr = it.created_at ? new Date(it.created_at).toLocaleString('pl-PL') : '';
        rightM.textContent = `${dtStr} · ${it.assistant_id || ''} · ${it.model_id || ''}`;
        meta.append(leftM, rightM);
        card.appendChild(meta);
        if (it.comment) {
          const com = document.createElement('p');
          com.className = 'owner-fb-comment';
          com.textContent = it.comment;
          card.appendChild(com);
        }
        if (it.prompt_excerpt) {
          const pr = document.createElement('div');
          pr.className = 'owner-fb-prompt';
          pr.textContent = `Pytanie: ${it.prompt_excerpt}`;
          card.appendChild(pr);
        }
        listWrap.appendChild(card);
      }
    }

    infoDialogBody.append(kpis, filterRow, actRow, listWrap);
  } catch (err) {
    infoDialogBody.replaceChildren();
    const errP = document.createElement('p');
    errP.textContent = `Nie udało się wczytać opinii z D1 (${err.message}).`;
    infoDialogBody.appendChild(errP);
  }
}

function toggleMessageReaction(msg, kind, prevUserText = '') {
  if (!msg?.id || (kind !== 'up' && kind !== 'down')) return null;
  if (!state.reactions || typeof state.reactions !== 'object') state.reactions = {};
  const prev = state.reactions[msg.id] || '';
  const next = prev === kind ? '' : kind;
  if (next) state.reactions[msg.id] = next;
  else delete state.reactions[msg.id];
  saveState();
  const assistantId = msg.assistantId || getActiveAssistantId();
  const mode = msg.mode || currentMode;
  const modelId = msg.modelUsed || getPreferredModelId();
  trackAiEvent('ai_response_reaction', {
    reaction: kind === 'up' ? 'thumbs_up' : 'thumbs_down',
    active: next === kind,
    assistant_id: assistantId,
    mode,
    model_id: modelId
  });
  if (next === kind) {
    sendFeedbackToServer({
      kind: kind === 'up' ? 'thumbs_up' : 'thumbs_down',
      assistantId,
      mode,
      modelId,
      promptExcerpt: stripMarkdownPlain(prevUserText).slice(0, 160)
    });
  }
  return next;
}

function toggleMessageFavorite(msg, prevUserText = '') {
  if (!msg?.id) return false;
  if (!Array.isArray(state.favorites)) state.favorites = [];
  const idx = state.favorites.findIndex((f) => f.id === msg.id);
  const added = idx === -1;
  if (added) {
    state.favorites.unshift({
      id: msg.id,
      title: buildMessageTitle(msg, prevUserText),
      text: msg.text,
      assistantId: msg.assistantId || getActiveAssistantId(),
      mode: msg.mode || currentMode,
      savedAt: new Date().toISOString()
    });
    state.favorites = state.favorites.slice(0, 80);
  } else {
    state.favorites.splice(idx, 1);
  }
  saveState();
  if (currentNav === 'Notatniki') renderModule('Notatniki');
  const assistantId = msg.assistantId || getActiveAssistantId();
  const mode = msg.mode || currentMode;
  const modelId = msg.modelUsed || getPreferredModelId();
  trackAiEvent('ai_response_favorite', {
    action: added ? 'add' : 'remove',
    assistant_id: assistantId,
    mode,
    model_id: modelId
  });
  if (added) {
    sendFeedbackToServer({
      kind: 'favorite',
      assistantId,
      mode,
      modelId,
      promptExcerpt: stripMarkdownPlain(prevUserText).slice(0, 160)
    });
  }
  return added;
}

function openOpinionModal(msg, prevUserText = '', onSaved = null) {
  const existing = (state.opinions || []).find((o) => o.msgId === msg.id);
  trackAiEvent('ai_opinion_open', {
    assistant_id: msg.assistantId || getActiveAssistantId(),
    mode: msg.mode || currentMode,
    model_id: msg.modelUsed || getPreferredModelId()
  });

  infoDialogTitle.textContent = 'Wystaw opinię o odpowiedzi';
  infoDialogBody.replaceChildren();

  const intro = document.createElement('p');
  intro.textContent = privateMode
    ? 'Tryb prywatny jest włączony — Twoja opinia zapisze się wyłącznie lokalnie na tym urządzeniu.'
    : 'Twoja opinia pomaga ulepszać odpowiedzi AI dla Jezusa. Ocena, kategoria i komentarz (bez danych osobowych) trafiają anonimowo do analizy zespołu Christian Culture.';

  const form = document.createElement('form');
  form.className = 'dialog-form';

  let rating = existing?.rating || 5;
  const starRow = document.createElement('div');
  starRow.className = 'opinion-stars';
  starRow.setAttribute('role', 'radiogroup');
  starRow.setAttribute('aria-label', 'Ocena gwiazdkowa');
  const starBtns = [];
  const syncStars = () => {
    starBtns.forEach((btn, idx) => {
      const val = idx + 1;
      const active = val <= rating;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', String(val === rating));
      btn.textContent = active ? '★' : '☆';
    });
  };
  for (let s = 1; s <= 5; s++) {
    const sb = document.createElement('button');
    sb.type = 'button';
    sb.className = 'opinion-star-btn';
    sb.dataset.star = String(s);
    sb.setAttribute('role', 'radio');
    sb.setAttribute('aria-label', `${s} na 5 gwiazdek`);
    sb.onclick = () => {
      rating = s;
      syncStars();
    };
    starBtns.push(sb);
    starRow.appendChild(sb);
  }
  syncStars();

  let selectedCategory = existing?.category || 'pomocna';
  const catOptions = [
    ['pomocna', 'Pomocna'],
    ['biblijna', 'Biblijnie trafna'],
    ['za_dluga', 'Za długa'],
    ['blad', 'Błąd merytoryczny'],
    ['inne', 'Inne']
  ];
  const catRow = document.createElement('div');
  catRow.className = 'opinion-cats';
  const catBtns = [];
  const syncCats = () => {
    catBtns.forEach((b) => {
      const active = b.dataset.category === selectedCategory;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
  };
  for (const [catId, catLabel] of catOptions) {
    const cb = document.createElement('button');
    cb.type = 'button';
    cb.className = 'opinion-cat-btn';
    cb.dataset.category = catId;
    cb.textContent = catLabel;
    cb.onclick = () => {
      selectedCategory = selectedCategory === catId ? '' : catId;
      syncCats();
    };
    catBtns.push(cb);
    catRow.appendChild(cb);
  }
  syncCats();

  const noteInput = document.createElement('textarea');
  noteInput.className = 'dialog-input';
  noteInput.rows = 3;
  noteInput.maxLength = 500;
  noteInput.value = existing?.comment || '';
  noteInput.placeholder = 'Napisz krótko, co było dobre lub co możemy poprawić (opcjonalnie)…';
  noteInput.setAttribute('aria-label', 'Komentarz do opinii (opcjonalnie)');

  const btnRow = document.createElement('div');
  btnRow.className = 'dialog-actions-row';

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'connect-btn';
  submitBtn.textContent = 'Wyślij opinię';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'dialog-btn-secondary';
  cancelBtn.textContent = 'Anuluj';
  cancelBtn.onclick = () => infoDialog.close();

  form.onsubmit = async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    if (!Array.isArray(state.opinions)) state.opinions = [];
    const comment = noteInput.value.trim().slice(0, 500);
    const assistantId = msg.assistantId || getActiveAssistantId();
    const mode = msg.mode || currentMode;
    const modelId = msg.modelUsed || getPreferredModelId();
    const category = selectedCategory || 'brak';
    const entry = {
      id: existing?.id || `op-${Date.now()}`,
      msgId: msg.id,
      rating,
      category,
      comment,
      assistantId,
      mode,
      createdAt: new Date().toISOString()
    };
    const pos = state.opinions.findIndex((o) => o.msgId === msg.id);
    if (pos >= 0) state.opinions[pos] = entry;
    else state.opinions.unshift(entry);
    state.opinions = state.opinions.slice(0, 80);
    saveState();
    trackAiEvent('ai_response_opinion', {
      rating,
      category,
      has_comment: Boolean(comment),
      assistant_id: assistantId,
      mode,
      model_id: modelId
    });
    const serverRes = await sendFeedbackToServer({
      kind: 'opinion',
      rating,
      category,
      comment,
      assistantId,
      mode,
      modelId,
      promptExcerpt: stripMarkdownPlain(prevUserText).slice(0, 160),
      replyExcerpt: stripMarkdownPlain(msg.text || '').slice(0, 240)
    });
    if (typeof onSaved === 'function') onSaved(entry);
    showToast(
      privateMode
        ? 'Zapisano opinię lokalnie (Tryb prywatny).'
        : (serverRes?.stored ? 'Dziękujemy! Twoja opinia została zapisana do analizy.' : 'Dziękujemy za Twoją opinię!')
    );
    infoDialog.close();
  };

  btnRow.append(submitBtn, cancelBtn);
  form.append(starRow, catRow, noteInput, btnRow);
  infoDialogBody.append(intro, form);
  showInfoDialog();
}

function formatCalendarUtc(date) {
  const d = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    String(d.getUTCFullYear()) +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function toLocalDateTimeValue(date) {
  const d = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getDefaultFutureDate({ hoursAhead = 1, morningHour = null } = {}) {
  const d = new Date();
  if (typeof morningHour === 'number') {
    if (d.getHours() >= morningHour) d.setDate(d.getDate() + 1);
    d.setHours(morningHour, 0, 0, 0);
    return d;
  }
  d.setTime(d.getTime() + hoursAhead * 3600000);
  d.setSeconds(0, 0);
  return d;
}

function buildGoogleCalendarUrl({ title, details, startDate, durationMinutes = 30 }) {
  const start = startDate instanceof Date && !Number.isNaN(startDate.getTime()) ? startDate : getDefaultFutureDate({ morningHour: 8 });
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', String(title || 'Czas z Bogiem — AI dla Jezusa').slice(0, 120));
  url.searchParams.set('dates', `${formatCalendarUtc(start)}/${formatCalendarUtc(end)}`);
  url.searchParams.set('details', String(details || '').slice(0, 1400));
  return url.toString();
}

function escapeIcsText(val) {
  return String(val || '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function downloadIcsFile({ title, details, startDate, durationMinutes = 30 }) {
  const start = startDate instanceof Date && !Number.isNaN(startDate.getTime()) ? startDate : getDefaultFutureDate({ morningHour: 8 });
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Christian Culture//AI dla Jezusa//PL',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:cc-ai-${Date.now()}@polskieradio.cc`,
    `DTSTAMP:${formatCalendarUtc(new Date())}`,
    `DTSTART:${formatCalendarUtc(start)}`,
    `DTEND:${formatCalendarUtc(end)}`,
    `SUMMARY:${escapeIcsText(title || 'Spotkanie ze Słowem Bożym — AI dla Jezusa')}`,
    `DESCRIPTION:${escapeIcsText(details || '')}`,
    'URL:https://polskieradio.cc/ai/aplikacja',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Przypomnienie z AI dla Jezusa',
    'TRIGGER:-PT15M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = 'ai-dla-jezusa-kalendarz.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 2000);
}

function openCalendarModal(msg, prevUserText = '') {
  const defaultTitle = buildMessageTitle(msg, prevUserText);
  const defaultDetails = `${stripMarkdownPlain(msg?.text || '').slice(0, 900)}\n\nŹródło: https://polskieradio.cc/ai/aplikacja`;
  const defaultStart = getDefaultFutureDate({ morningHour: 8 });

  infoDialogTitle.textContent = 'Dodaj do mojego kalendarza';
  infoDialogBody.replaceChildren();

  const intro = document.createElement('p');
  intro.textContent = 'Zaplanuj to słowo, modlitwę lub zadanie w swoim kalendarzu (Google Calendar albo plik .ics do Apple / Outlook / Android).';

  const form = document.createElement('form');
  form.className = 'dialog-form';

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.className = 'dialog-input';
  titleInput.required = true;
  titleInput.value = defaultTitle;
  titleInput.setAttribute('aria-label', 'Tytuł wydarzenia w kalendarzu');

  const dtInput = document.createElement('input');
  dtInput.type = 'datetime-local';
  dtInput.className = 'dialog-input';
  dtInput.value = toLocalDateTimeValue(defaultStart);
  dtInput.setAttribute('aria-label', 'Data i godzina wydarzenia');

  const notesInput = document.createElement('textarea');
  notesInput.className = 'dialog-input';
  notesInput.rows = 4;
  notesInput.value = defaultDetails;
  notesInput.setAttribute('aria-label', 'Opis wydarzenia');

  const btnRow = document.createElement('div');
  btnRow.className = 'dialog-actions-row';

  const googleLink = document.createElement('a');
  googleLink.className = 'connect-btn';
  googleLink.target = '_blank';
  googleLink.rel = 'noopener noreferrer';
  googleLink.textContent = 'Otwórz w Google Calendar ↗';

  const syncGoogleHref = () => {
    const startDate = dtInput.value ? new Date(dtInput.value) : defaultStart;
    googleLink.href = buildGoogleCalendarUrl({
      title: titleInput.value.trim() || defaultTitle,
      details: notesInput.value.trim(),
      startDate
    });
  };
  titleInput.addEventListener('input', syncGoogleHref);
  dtInput.addEventListener('change', syncGoogleHref);
  notesInput.addEventListener('input', syncGoogleHref);
  syncGoogleHref();

  googleLink.addEventListener('click', () => {
    trackAiEvent('ai_calendar_add', { channel: 'google_calendar' });
    showToast('Otwieram formularz w Google Calendar.');
  });

  const icsBtn = document.createElement('button');
  icsBtn.type = 'button';
  icsBtn.className = 'dialog-btn-secondary';
  icsBtn.textContent = 'Pobierz plik (.ics)';
  icsBtn.onclick = () => {
    const startDate = dtInput.value ? new Date(dtInput.value) : defaultStart;
    downloadIcsFile({
      title: titleInput.value.trim() || defaultTitle,
      details: notesInput.value.trim(),
      startDate
    });
    trackAiEvent('ai_calendar_add', { channel: 'ics' });
    showToast('Pobrano plik .ics do Twojego kalendarza.');
    infoDialog.close();
  };

  btnRow.append(googleLink, icsBtn);
  form.append(titleInput, dtInput, notesInput, btnRow);
  infoDialogBody.append(intro, form);
  showInfoDialog();
}

function checkDueReminders() {
  if (!Array.isArray(state.reminders) || !state.reminders.length) return;
  const nowMs = Date.now();
  let changed = false;
  for (const rem of state.reminders) {
    if (!rem || rem.done || rem.notified) continue;
    const dueMs = new Date(rem.dueAt).getTime();
    if (!Number.isFinite(dueMs) || dueMs > nowMs) continue;
    rem.notified = true;
    changed = true;
    showToast(`🔔 Przypomnienie: ${rem.title}`);
    try {
      if (typeof Notification === 'function' && Notification.permission === 'granted') {
        new Notification(`AI dla Jezusa — Przypomnienie`, {
          body: rem.title,
          icon: '/ai/assets/icon-192.png'
        });
      }
    } catch {}
  }
  if (changed) {
    saveState();
    if (currentNav === 'Automatyzacje') renderModule('Automatyzacje');
  }
}

function openReminderModal(msg, prevUserText = '') {
  const defaultTitle = buildMessageTitle(msg, prevUserText);
  const summaryText = stripMarkdownPlain(msg?.text || '').slice(0, 260);
  const defaultDue = getDefaultFutureDate({ hoursAhead: 1 });

  infoDialogTitle.textContent = 'Przypomnij mi';
  infoDialogBody.replaceChildren();

  const intro = document.createElement('p');
  intro.textContent = 'Ustaw przypomnienie o tym słowie, modlitwie lub zadaniu. Powiadomimy Cię w aplikacji, a jednym kliknięciem dodasz je też do kalendarza.';

  const form = document.createElement('form');
  form.className = 'dialog-form';

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.className = 'dialog-input';
  titleInput.required = true;
  titleInput.value = defaultTitle;
  titleInput.setAttribute('aria-label', 'Temat przypomnienia');

  const dtInput = document.createElement('input');
  dtInput.type = 'datetime-local';
  dtInput.className = 'dialog-input';
  dtInput.required = true;
  dtInput.value = toLocalDateTimeValue(defaultDue);
  dtInput.setAttribute('aria-label', 'Czas przypomnienia');

  const presets = document.createElement('div');
  presets.className = 'reminder-presets';
  const presetItems = [
    ['Za 30 min', () => new Date(Date.now() + 30 * 60000)],
    ['Za 2 godz.', () => new Date(Date.now() + 120 * 60000)],
    ['Dziś o 20:00', () => getDefaultFutureDate({ morningHour: 20 })],
    ['Jutro o 08:00', () => getDefaultFutureDate({ morningHour: 8 })]
  ];
  for (const [label, makeDate] of presetItems) {
    const pBtn = document.createElement('button');
    pBtn.type = 'button';
    pBtn.className = 'msg-action-btn';
    pBtn.textContent = label;
    pBtn.onclick = () => {
      dtInput.value = toLocalDateTimeValue(makeDate());
    };
    presets.appendChild(pBtn);
  }

  const btnRow = document.createElement('div');
  btnRow.className = 'dialog-actions-row';

  const saveRemBtn = document.createElement('button');
  saveRemBtn.type = 'submit';
  saveRemBtn.className = 'connect-btn';
  saveRemBtn.textContent = 'Zapisz przypomnienie';

  const calLink = document.createElement('a');
  calLink.className = 'gold-card-link';
  calLink.target = '_blank';
  calLink.rel = 'noopener noreferrer';
  calLink.textContent = 'Dodaj też do Google Calendar ↗';
  const syncCalHref = () => {
    const d = dtInput.value ? new Date(dtInput.value) : defaultDue;
    calLink.href = buildGoogleCalendarUrl({
      title: `Przypomnienie: ${titleInput.value.trim() || defaultTitle}`,
      details: summaryText,
      startDate: d
    });
  };
  titleInput.addEventListener('input', syncCalHref);
  dtInput.addEventListener('change', syncCalHref);
  syncCalHref();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const dueDate = dtInput.value ? new Date(dtInput.value) : defaultDue;
    if (!Array.isArray(state.reminders)) state.reminders = [];
    state.reminders.unshift({
      id: 'rem-' + Date.now(),
      title: (titleInput.value.trim() || defaultTitle).slice(0, 120),
      text: summaryText,
      dueAt: dueDate.toISOString(),
      done: false,
      notified: false,
      createdAt: new Date().toISOString()
    });
    state.reminders = state.reminders.slice(0, 40);
    saveState();
    try {
      if (typeof Notification === 'function' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch {}
    trackAiEvent('ai_reminder_create', { status: 'saved' });
    if (currentNav === 'Automatyzacje') renderModule('Automatyzacje');
    showToast(`⏰ Przypomnienie ustawione na ${dueDate.toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}.`);
    infoDialog.close();
  });

  btnRow.append(saveRemBtn, calLink);
  form.append(titleInput, presets, dtInput, btnRow);
  infoDialogBody.append(intro, form);
  showInfoDialog();
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
      if (item.kind !== 'radio') {
        const playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.className = 'media-play-btn';
        playBtn.textContent = '▶ Odtwórz audio';
        playBtn.onclick = () => {
          if (audio.paused) {
            pauseActiveAudio(audio);
            activeAudioEl = audio;
            audio.play().catch(() => showToast('Kliknij odtwarzacz powyżej, aby uruchomić dźwięk.'));
            playBtn.textContent = '⏸ Pauza';
          } else {
            audio.pause();
            playBtn.textContent = '▶ Odtwórz audio';
          }
        };
        audio.addEventListener('pause', () => {
          playBtn.textContent = '▶ Odtwórz audio';
        });
        audio.addEventListener('play', () => {
          playBtn.textContent = '⏸ Pauza';
        });

        foot.appendChild(playBtn);
      }
      if (item.url) {
        const ext = document.createElement('a');
        ext.className = 'media-ext-link';
        ext.href = item.url;
        ext.target = '_blank';
        ext.rel = 'noopener noreferrer';
        ext.textContent = 'Otwórz stronę ↗';
        foot.appendChild(ext);
      }
      card.appendChild(audio);
      if (foot.hasChildNodes()) card.appendChild(foot);
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
  let revealSkipBtn = null;
  let revealDeferredNodes = [];
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
      const isStreamingThisMsg = Boolean(animateMsgId && msg.id === animateMsgId && typeof msg.text === 'string' && msg.text.length > 0);
      const aiBubble = document.createElement('article');
      aiBubble.className = 'chat-bubble-ai' + (isStreamingThisMsg ? ' is-streaming' : '');

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

      const badgeWrap = document.createElement('div');
      badgeWrap.className = 'provider-badge-wrap';

      const badgeBtn = document.createElement('button');
      badgeBtn.type = 'button';
      badgeBtn.className = 'provider-badge provider-badge-btn';
      badgeBtn.setAttribute('aria-haspopup', 'listbox');
      badgeBtn.setAttribute('aria-expanded', 'false');
      badgeBtn.title = 'Kliknij, aby wybrać automatyczny lub preferowany model AI';

      const badgeLabelSpan = document.createElement('span');
      badgeLabelSpan.className = 'provider-badge-label';
      badgeLabelSpan.textContent = formatBadgeModelLabel(msg);

      const badgeChev = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      badgeChev.setAttribute('viewBox', '0 0 24 24');
      badgeChev.setAttribute('fill', 'none');
      badgeChev.setAttribute('stroke', 'currentColor');
      badgeChev.setAttribute('stroke-width', '2');
      badgeChev.setAttribute('stroke-linecap', 'round');
      badgeChev.setAttribute('stroke-linejoin', 'round');
      badgeChev.setAttribute('aria-hidden', 'true');
      badgeChev.setAttribute('class', 'badge-chevron');
      const badgeChevPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      badgeChevPath.setAttribute('d', 'm6 9 6 6 6-6');
      badgeChev.appendChild(badgeChevPath);

      badgeBtn.append(badgeLabelSpan, badgeChev);

      let prevUserMsg = null;
      for (let j = i - 1; j >= 0; j -= 1) {
        if (thread.messages[j]?.role === 'user' && thread.messages[j]?.text) {
          prevUserMsg = thread.messages[j];
          break;
        }
      }

      const badgeMenu = document.createElement('div');
      badgeMenu.className = 'badge-model-menu';
      badgeMenu.setAttribute('role', 'listbox');
      badgeMenu.setAttribute('aria-label', 'Wybór modelu AI dla odpowiedzi');
      badgeMenu.hidden = true;

      const populateBadgeMenu = () => {
        badgeMenu.replaceChildren();
        const activePref = getPreferredModelId();

        const menuHead = document.createElement('div');
        menuHead.className = 'badge-model-head';
        const menuTitle = document.createElement('strong');
        menuTitle.textContent = 'Model AI (darmowa pula CC)';
        const menuSub = document.createElement('small');
        menuSub.textContent = activePref === 'auto'
          ? 'Aktywny: Automatyczny (najlepszy dostępny)'
          : `Preferowany: ${getModelMeta(activePref).label}`;
        menuHead.append(menuTitle, menuSub);
        badgeMenu.appendChild(menuHead);

        for (const m of availableFreeModels) {
          const isSelected = activePref === m.id;
          const opt = document.createElement('button');
          opt.type = 'button';
          opt.role = 'option';
          opt.className = 'badge-model-opt' + (isSelected ? ' active' : '');
          opt.dataset.freeModel = m.id;
          opt.setAttribute('aria-selected', String(isSelected));

          const mainCol = document.createElement('span');
          mainCol.className = 'badge-model-opt-main';
          const nameB = document.createElement('b');
          nameB.textContent = m.label;
          const noteSm = document.createElement('small');
          noteSm.textContent = m.note || '';
          mainCol.append(nameB, noteSm);

          const mark = document.createElement('span');
          mark.className = 'badge-model-opt-state';
          mark.textContent = isSelected ? '✓' : '';

          opt.append(mainCol, mark);
          opt.addEventListener('click', (ev) => {
            ev.stopPropagation();
            setPreferredModel(m.id);
          });
          badgeMenu.appendChild(opt);
        }

        const actionsBlock = document.createElement('div');
        actionsBlock.className = 'badge-model-actions';

        if (prevUserMsg) {
          const retryBtn = document.createElement('button');
          retryBtn.type = 'button';
          retryBtn.className = 'badge-model-opt badge-model-action';
          retryBtn.textContent = `↻ Ponów tym modelem (${getModelMeta(activePref).shortLabel})`;
          retryBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            closeAllBadgeModelMenus();
            sendChatMessage(prevUserMsg.text);
          });
          actionsBlock.appendChild(retryBtn);
        }

        const byokOpt = document.createElement('button');
        byokOpt.type = 'button';
        byokOpt.className = 'badge-model-opt badge-model-action';
        byokOpt.textContent = byokConfig?.provider && byokConfig?.apiKey
          ? `⚙ Własne API (${byokConfig.provider.toUpperCase()})`
          : '⚙ Podłącz własne API (BYOK)…';
        byokOpt.addEventListener('click', (ev) => {
          ev.stopPropagation();
          closeAllBadgeModelMenus();
          openSettingsModal();
        });
        actionsBlock.appendChild(byokOpt);

        badgeMenu.appendChild(actionsBlock);
      };

      badgeBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const willOpen = badgeMenu.hidden;
        closeAllBadgeModelMenus();
        if (modelMenu) modelMenu.hidden = true;
        modelPickerBtn?.setAttribute('aria-expanded', 'false');
        if (toolsMenu) toolsMenu.hidden = true;
        toolsBtn?.setAttribute('aria-expanded', 'false');
        if (willOpen) {
          populateBadgeMenu();
          badgeMenu.hidden = false;
          badgeBtn.setAttribute('aria-expanded', 'true');
          const rect = badgeBtn.getBoundingClientRect();
          badgeMenu.classList.toggle('open-up', window.innerHeight - rect.bottom < 300);
        }
      });

      badgeWrap.append(badgeBtn, badgeMenu);
      head.append(avatar, speaker, badgeWrap);
      aiBubble.appendChild(head);

      const mdSlot = document.createElement('div');
      mdSlot.className = 'ai-md-slot';
      const deferred = [];
      if (isStreamingThisMsg) {
        revealTarget = mdSlot;
        revealFullText = msg.text;
        revealBubble = aiBubble;
        revealAssistantId = persona.id;
        const initRendered = renderMarkdownSafe(msg.text.slice(0, Math.min(4, msg.text.length)));
        const initCaret = document.createElement('span');
        initCaret.className = 'ai-stream-cursor';
        initCaret.setAttribute('aria-hidden', 'true');
        (initRendered.lastElementChild || initRendered).appendChild(initCaret);
        mdSlot.appendChild(initRendered);
      } else {
        mdSlot.appendChild(renderMarkdownSafe(msg.text));
      }
      aiBubble.appendChild(mdSlot);

      const mediaDeck = renderMediaDeck(msg.media);
      if (mediaDeck) {
        if (isStreamingThisMsg) {
          mediaDeck.classList.add('stream-reveal-deferred');
          deferred.push(mediaDeck);
        }
        aiBubble.appendChild(mediaDeck);
      }

      if (Array.isArray(msg.mojabibliaVerses) && msg.mojabibliaVerses.length) {
        const mbDeck = document.createElement('div');
        mbDeck.className = 'mojabiblia-cards';
        if (isStreamingThisMsg) {
          mbDeck.classList.add('stream-reveal-deferred');
          deferred.push(mbDeck);
        }
        for (const v of msg.mojabibliaVerses) {
          if (!v?.shortRef || !v?.ubg) continue;
          const card = document.createElement('div');
          card.className = 'mojabiblia-card';
          const mbHead = document.createElement('div');
          mbHead.className = 'mojabiblia-head';
          const mbTitle = document.createElement('strong');
          mbTitle.textContent = `📖 MojaBiblia · ${v.shortRef} (UBG)`;
          mbHead.appendChild(mbTitle);
          if (v.originalLang) {
            const langTag = document.createElement('span');
            langTag.className = 'mojabiblia-lang-tag';
            langTag.textContent = v.originalLang === 'Hebrew' ? 'Hebrajski + Strong' : 'Greka Koine + Strong';
            mbHead.appendChild(langTag);
          }
          const ubgP = document.createElement('p');
          ubgP.className = 'mojabiblia-ubg';
          ubgP.textContent = `„${v.ubg}”`;
          card.append(mbHead, ubgP);

          if (Array.isArray(v.keyWords) && v.keyWords.length) {
            const wordsWrap = document.createElement('div');
            wordsWrap.className = 'mojabiblia-words';
            for (const w of v.keyWords.slice(0, 6)) {
              const pill = document.createElement('span');
              pill.className = 'mojabiblia-word-pill';
              pill.textContent = `${w.original} (${w.translit || w.strong} · ${w.strong})${w.glossPl ? `: ${w.glossPl}` : ''}`;
              wordsWrap.appendChild(pill);
            }
            card.appendChild(wordsWrap);
          }

          if (v.interlinearUrl) {
            const mbLink = document.createElement('a');
            mbLink.className = 'mojabiblia-link';
            mbLink.href = v.interlinearUrl;
            mbLink.target = '_blank';
            mbLink.rel = 'noopener noreferrer';
            mbLink.textContent = 'Otwórz interlinearnie w MojaBiblia ↗';
            card.appendChild(mbLink);
          }
          mbDeck.appendChild(card);
        }
        if (mbDeck.children.length) aiBubble.appendChild(mbDeck);
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
        if (srcWrap.children.length) {
          if (isStreamingThisMsg) {
            srcWrap.classList.add('stream-reveal-deferred');
            deferred.push(srcWrap);
          }
          aiBubble.appendChild(srcWrap);
        }
      }

      const actions = document.createElement('div');
      actions.className = 'msg-actions' + (isStreamingThisMsg ? ' stream-reveal-deferred' : '');
      if (isStreamingThisMsg) deferred.push(actions);

      const primaryRow = document.createElement('div');
      primaryRow.className = 'msg-actions-primary';
      primaryRow.setAttribute('role', 'group');
      primaryRow.setAttribute('aria-label', 'Reakcje i opcje odpowiedzi');

      const reactionMeta = {
        assistant_id: msg.assistantId || getActiveAssistantId(),
        mode: msg.mode || currentMode,
        model_id: msg.modelUsed || getPreferredModelId()
      };

      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'msg-action-btn msg-react-btn';
      upBtn.dataset.reaction = 'up';
      upBtn.setAttribute('aria-label', 'Łapka w górę — przydatna odpowiedź');
      upBtn.title = 'Łapka w górę';
      upBtn.appendChild(createReactionSvg('up'));

      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'msg-action-btn msg-react-btn';
      downBtn.dataset.reaction = 'down';
      downBtn.setAttribute('aria-label', 'Łapka w dół — wymaga poprawy');
      downBtn.title = 'Łapka w dół';
      downBtn.appendChild(createReactionSvg('down'));

      const syncThumbsUi = (val) => {
        upBtn.classList.toggle('is-active-up', val === 'up');
        upBtn.setAttribute('aria-pressed', String(val === 'up'));
        downBtn.classList.toggle('is-active-down', val === 'down');
        downBtn.setAttribute('aria-pressed', String(val === 'down'));
      };
      syncThumbsUi((state.reactions && state.reactions[msg.id]) || '');

      upBtn.onclick = () => {
        const next = toggleMessageReaction(msg, 'up', prevUserMsg?.text || '');
        syncThumbsUi(next);
        showToast(next === 'up' ? 'Dziękujemy za pozytywną ocenę!' : 'Cofnięto ocenę.');
      };

      downBtn.onclick = () => {
        const next = toggleMessageReaction(msg, 'down', prevUserMsg?.text || '');
        syncThumbsUi(next);
        showToast(next === 'down' ? 'Zapisano zgłoszenie — ulepszymy tę odpowiedź.' : 'Cofnięto ocenę.');
      };

      const favBtn = document.createElement('button');
      favBtn.type = 'button';
      favBtn.className = 'msg-action-btn msg-react-btn';
      favBtn.dataset.reaction = 'favorite';
      favBtn.title = 'Dodaj do ulubionych';
      const syncFavUi = () => {
        const isFav = (state.favorites || []).some((f) => f.id === msg.id);
        favBtn.classList.toggle('is-favorited', isFav);
        favBtn.setAttribute('aria-pressed', String(isFav));
        favBtn.setAttribute('aria-label', isFav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych');
        favBtn.replaceChildren(createReactionSvg(isFav ? 'star-filled' : 'star'));
      };
      syncFavUi();
      favBtn.onclick = () => {
        const added = toggleMessageFavorite(msg, prevUserMsg?.text || '');
        syncFavUi();
        showToast(added ? 'Dodano odpowiedź do ulubionych (★).' : 'Usunięto z ulubionych.');
      };

      const opinionBtn = document.createElement('button');
      opinionBtn.type = 'button';
      opinionBtn.className = 'msg-action-btn msg-opinion-btn';
      opinionBtn.dataset.reaction = 'opinion';
      opinionBtn.setAttribute('aria-label', 'Wystaw opinię o odpowiedzi');
      opinionBtn.title = 'Wystaw opinię';
      const opinionLabel = document.createElement('span');
      const syncOpinionUi = () => {
        const hasOp = (state.opinions || []).some((o) => o.msgId === msg.id);
        opinionBtn.classList.toggle('is-done', hasOp);
        opinionLabel.textContent = hasOp ? 'Opinia ✓' : 'Opinia';
      };
      opinionBtn.append(createReactionSvg('opinion'), opinionLabel);
      syncOpinionUi();
      opinionBtn.onclick = () => openOpinionModal(msg, prevUserMsg?.text || '', () => syncOpinionUi());

      const morePanel = document.createElement('div');
      morePanel.id = `msgMore-${msg.id}`;
      morePanel.className = 'msg-more-panel';
      morePanel.hidden = true;

      const moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'msg-action-btn msg-more-toggle';
      moreBtn.setAttribute('aria-expanded', 'false');
      moreBtn.setAttribute('aria-controls', morePanel.id);
      const moreSpan = document.createElement('span');
      moreSpan.textContent = 'Więcej opcji';
      moreBtn.append(createReactionSvg('more'), moreSpan, createReactionSvg('chevron'));
      moreBtn.onclick = () => {
        const willOpen = morePanel.hidden;
        if (willOpen && conversationLog) {
          conversationLog.querySelectorAll('.msg-more-panel:not([hidden])').forEach((p) => {
            p.hidden = true;
          });
          conversationLog.querySelectorAll('.msg-more-toggle.is-open').forEach((b) => {
            b.classList.remove('is-open');
            b.setAttribute('aria-expanded', 'false');
          });
        }
        morePanel.hidden = !willOpen;
        moreBtn.classList.toggle('is-open', willOpen);
        moreBtn.setAttribute('aria-expanded', String(willOpen));
        trackAiEvent('ai_more_options_toggle', { open: willOpen, ...reactionMeta });
      };

      primaryRow.append(upBtn, downBtn, favBtn, opinionBtn, moreBtn);

      const syncBubbleSaveButtons = () => {
        if (saveNoteBtn) {
          saveNoteBtn.textContent = 'Zapisano ✓';
          saveNoteBtn.classList.add('is-done');
        }
      };

      const existingNote = (state.notes || []).find((n) => n.id === msg.id);
      const isQuestionReply = hasInteractiveQuestion(msg.text, prevUserMsg?.text);

      if (isQuestionReply) {
        const quickBar = document.createElement('div');
        quickBar.className = 'quick-reply-bar';
        quickBar.setAttribute('role', 'group');
        quickBar.setAttribute('aria-label', 'Szybkie odpowiedzi');

        const yesBtn = document.createElement('button');
        yesBtn.type = 'button';
        yesBtn.className = 'quick-reply-btn is-yes';
        yesBtn.dataset.quickReply = 'yes';
        yesBtn.textContent = 'Tak';
        yesBtn.onclick = () => {
          if (busy) return;
          trackAiEvent('ai_response_action', { action: 'quick_yes', ...reactionMeta });
          sendChatMessage('Tak');
        };

        const noBtn = document.createElement('button');
        noBtn.type = 'button';
        noBtn.className = 'quick-reply-btn is-no';
        noBtn.dataset.quickReply = 'no';
        noBtn.textContent = 'Nie';
        noBtn.onclick = () => {
          if (busy) return;
          trackAiEvent('ai_response_action', { action: 'quick_no', ...reactionMeta });
          sendChatMessage('Nie');
        };

        quickBar.append(yesBtn, noBtn);
        morePanel.appendChild(quickBar);
      }

      const moreActions = document.createElement('div');
      moreActions.className = 'msg-more-actions';

      const speakBtn = document.createElement('button');
      speakBtn.type = 'button';
      speakBtn.className = 'msg-action-btn';
      speakBtn.textContent = '🔊 Odsłuchaj';
      speakBtn.onclick = () => {
        trackAiEvent('ai_response_action', { action: 'speak', ...reactionMeta });
        speakReply(msg.text, persona.id, aiBubble, speakBtn);
      };
      if (isStreamingThisMsg) {
        revealSpeakBtn = speakBtn;
      }

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'msg-action-btn';
      copyBtn.textContent = 'Kopiuj';
      copyBtn.onclick = async () => {
        trackAiEvent('ai_response_action', { action: 'copy', ...reactionMeta });
        try {
          await navigator.clipboard.writeText(msg.text);
          showToast('Skopiowano odpowiedź.');
        } catch {
          showToast('Nie udało się skopiować w tej przeglądarce.');
        }
      };

      const alreadyRemembered = (state.memory || []).some((m) => m.msgId === msg.id);
      const rememberBtn = document.createElement('button');
      rememberBtn.type = 'button';
      rememberBtn.className = 'msg-action-btn' + (alreadyRemembered ? ' is-done' : '');
      rememberBtn.dataset.action = 'remember';
      rememberBtn.textContent = alreadyRemembered ? 'Zapamiętano ✓' : 'Zapamiętaj dla AI';
      rememberBtn.onclick = () => {
        const added = rememberMessageInMemory(msg, prevUserMsg?.text || '');
        rememberBtn.textContent = 'Zapamiętano ✓';
        rememberBtn.classList.add('is-done');
        trackAiEvent('ai_response_action', { action: 'remember', ...reactionMeta });
        showToast(added ? 'Zapamiętano w Twojej pamięci kontekstowej AI.' : 'Już zapisano w Pamięci.');
      };

      var saveNoteBtn = document.createElement('button');
      saveNoteBtn.type = 'button';
      saveNoteBtn.className = 'msg-action-btn' + (existingNote ? ' is-done' : '');
      saveNoteBtn.dataset.action = 'save';
      saveNoteBtn.textContent = existingNote ? 'Zapisano ✓' : 'Zapisz notatkę';
      saveNoteBtn.onclick = () => {
        const res = saveMessageToNotes(msg, prevUserMsg?.text || '', { savedLater: false });
        syncBubbleSaveButtons();
        trackAiEvent('ai_response_action', { action: 'save_note', ...reactionMeta });
        showToast(res === 'exists' ? 'Ta odpowiedź jest już w Notatnikach.' : 'Zapisano notatkę w module Notatniki.');
      };

      const calendarBtn = document.createElement('button');
      calendarBtn.type = 'button';
      calendarBtn.className = 'msg-action-btn';
      calendarBtn.dataset.action = 'calendar';
      calendarBtn.textContent = 'Dodaj do mojego kalendarza';
      calendarBtn.onclick = () => {
        trackAiEvent('ai_response_action', { action: 'calendar', ...reactionMeta });
        openCalendarModal(msg, prevUserMsg?.text || '');
      };

      const reminderBtn = document.createElement('button');
      reminderBtn.type = 'button';
      reminderBtn.className = 'msg-action-btn';
      reminderBtn.dataset.action = 'reminder';
      reminderBtn.textContent = 'Przypomnij mi';
      reminderBtn.onclick = () => {
        trackAiEvent('ai_response_action', { action: 'reminder', ...reactionMeta });
        openReminderModal(msg, prevUserMsg?.text || '');
      };

      moreActions.append(speakBtn, copyBtn, rememberBtn, saveNoteBtn, calendarBtn, reminderBtn);

      if (i === thread.messages.length - 1 && thread.messages[i - 1]?.role === 'user') {
        const retryBtn = document.createElement('button');
        retryBtn.type = 'button';
        retryBtn.className = 'msg-action-btn';
        retryBtn.textContent = 'Ponów';
        retryBtn.onclick = () => {
          if (busy) return;
          trackAiEvent('ai_response_action', { action: 'retry', ...reactionMeta });
          const lastUserText = thread.messages[i - 1].text;
          thread.messages.pop();
          thread.messages.pop();
          sendChatMessage(lastUserText);
        };
        moreActions.appendChild(retryBtn);
      }

      morePanel.appendChild(moreActions);
      actions.append(primaryRow, morePanel);

      if (isStreamingThisMsg) {
        revealSkipBtn = document.createElement('button');
        revealSkipBtn.type = 'button';
        revealSkipBtn.className = 'stream-skip-btn';
        revealSkipBtn.textContent = 'Pomiń pisanie ⏭';
        aiBubble.appendChild(revealSkipBtn);
        revealDeferredNodes = deferred;
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
    bdg.textContent = activeP.gender === 'female' ? 'Analizuje · CC' : 'Analiza CC';
    head.append(av, sp, bdg);

    const pLine = document.createElement('p');
    pLine.className = 'typing-line';
    const dots = document.createElement('span');
    dots.className = 'typing-dots';
    dots.setAttribute('aria-hidden', 'true');
    dots.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));
    const statusText = document.createElement('span');
    const phases = [
      `${activeP.name} przeszukuje indeks Christian Culture…`,
      'Dobiera wersety Biblii (UBG) i multimedia…',
      'Przygotowuje odpowiedź w czasie rzeczywistym…'
    ];
    let phaseIdx = 0;
    statusText.textContent = phases[0];
    pLine.append(dots, document.createTextNode(' '), statusText);
    loading.append(head, pLine);
    conversationLog.appendChild(loading);

    typingStatusTimer = setInterval(() => {
      if (!busy || !statusText.isConnected) {
        clearInterval(typingStatusTimer);
        typingStatusTimer = null;
        return;
      }
      phaseIdx = (phaseIdx + 1) % phases.length;
      statusText.textContent = phases[phaseIdx];
    }, 950);
  }

  const scroller = $('.stage-scroll');
  if (scroller) scroller.scrollTop = scroller.scrollHeight;

  if (revealTarget && revealFullText) {
    let cursor = Math.min(4, revealFullText.length);
    const totalLen = revealFullText.length;
    const baseStep = totalLen > 900 ? 7 : totalLen > 400 ? 5 : 3;

    const finishStreamReveal = () => {
      stopStreamReveal();
      revealBubble?.classList.remove('is-streaming');
      revealSkipBtn?.remove();
      revealTarget.replaceChildren(renderMarkdownSafe(revealFullText));
      for (const node of revealDeferredNodes) {
        node.classList.add('is-revealed');
      }
      if (scroller && scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 180) {
        scroller.scrollTop = scroller.scrollHeight;
      }
      if (autoReadEnabled && revealBubble) {
        speakReply(revealFullText, revealAssistantId, revealBubble, revealSpeakBtn);
      }
    };

    if (revealSkipBtn) {
      revealSkipBtn.addEventListener('click', finishStreamReveal);
    }

    if (cursor >= totalLen) {
      finishStreamReveal();
    } else {
      streamRevealTimer = setInterval(() => {
        let nextCursor = Math.min(totalLen, cursor + baseStep);
        // Wyrównuj koniec porcji do najbliższej spacji/końca linii, aby słowa pojawiały się naturalnie
        while (nextCursor < totalLen && nextCursor - cursor < baseStep + 5 && !/\s/.test(revealFullText[nextCursor])) {
          nextCursor += 1;
        }
        cursor = nextCursor;
        const rendered = renderMarkdownSafe(revealFullText.slice(0, cursor));
        if (cursor < totalLen) {
          const caret = document.createElement('span');
          caret.className = 'ai-stream-cursor';
          caret.setAttribute('aria-hidden', 'true');
          (rendered.lastElementChild || rendered).appendChild(caret);
        }
        revealTarget.replaceChildren(rendered);
        if (scroller && scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 140) {
          scroller.scrollTop = scroller.scrollHeight;
        }
        if (cursor >= totalLen) {
          finishStreamReveal();
        }
      }, 26);
    }
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
async function sendChatMessage(textOverride, titleHint = '', chatOpts = {}) {
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

  const requestPrivate = privateMode;
  const requestGeneration = conversationGeneration;
  const model = requestPrivate ? 'cc-knowledge-hub' : getPreferredModelId();
  const historySnapshot = (requestPrivate ? [] : thread.messages.slice(-8)).map((m) => ({ role: m.role, text: m.text }));
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
    syncSendButtonMode();
  }

  busy = true;
  sendBtn.disabled = true;
  trackAiEvent('ai_chat_send', { mode: currentMode, assistant_id: activeAsst.id, pro_tier: getProStatus().tier });
  showConversationView();

  let revealMsgId = '';
  let deliveredReply = null;
  try {
    const activeTools = [...selectedTools];
    if (webSearchEnabled) activeTools.push('Przeszukiwanie CC');
    if (/@(Notatniki|Notatki)\b/i.test(rawText) && state.notes?.length) activeTools.push('Notatniki użytkownika');
    if (/@(Projekty)\b/i.test(rawText) && state.projects?.length) activeTools.push('Projekty użytkownika');

    const extraNotesContext = [];
    if (!requestPrivate && /@(Notatniki|Notatki)\b/i.test(rawText) && Array.isArray(state.notes) && state.notes.length) {
      extraNotesContext.push(...state.notes.slice(0, 3).map((n) => `Notatka „${n.title}”: ${String(n.body || '').slice(0, 120)}`));
    }
    if (!requestPrivate && /@Projekty\b/i.test(rawText) && Array.isArray(state.projects) && state.projects.length) {
      extraNotesContext.push(`Aktywne projekty użytkownika: ${state.projects.slice(0, 6).join(', ')}`);
    }

    const authHeaders = await getAuthHeaders();
    const headers = { 'Content-Type': 'application/json', ...authHeaders };
    const useByok = model === 'byok' && Boolean(byokConfig.provider && byokConfig.apiKey);
    if (useByok) {
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
        responseDepth: state?.responseDepth || 'balanced',
        module: currentNav,
        assistantId: activeAsst.id,
        attachmentName: requestPrivate ? '' : currentAttName,
        attachmentText: requestPrivate ? '' : currentAttText,
        tools: activeTools,
        memoryNotes: requestPrivate ? [] : [...state.memory.map((m) => m.text), ...extraNotesContext],
        privateMode: requestPrivate,
        voiceConversation: Boolean(chatOpts?.voiceConversation),
        preferredModel: model,
        byokConsent: useByok,
        ownerModel: getPreferredModelId() !== 'auto' ? getPreferredModelId() : (selectedOwnerModel || ''),
        userModel: byokConfig.model || ''
      })
    });
    const data = await res.json();

    if (requestGeneration !== conversationGeneration) return;
    if (!res.ok || !data?.ok) {
      throw new Error(data?.detail || data?.error || `HTTP ${res.status}`);
    }

    revealMsgId = 'a-' + Date.now();
    deliveredReply = {
      id: revealMsgId,
      role: 'assistant',
      text: data.reply,
      provider: data.provider || 'cc-knowledge-hub',
      modelUsed: data.modelUsed || '',
      modelRequested: data.modelRequested || getPreferredModelId(),
      assistant: data.assistant || activeAsst,
      mode: data.mode || currentMode,
      media: Array.isArray(data.media) ? data.media : [],
      mojabibliaVerses: Array.isArray(data.mojabibliaVerses) ? data.mojabibliaVerses : [],
      sources: Array.isArray(data.sources) ? data.sources : []
    };
    thread.messages.push(deliveredReply);
    thread.updatedAt = new Date().toISOString();
    if (!requestPrivate && !privateMode && requestGeneration === conversationGeneration) {
      saveState();
      renderRecentChats();
    }
  } catch (err) {
    revealMsgId = 'err-' + Date.now();
    deliveredReply = {
      id: revealMsgId,
      role: 'assistant',
      text: `Nie udało się uzyskać odpowiedzi z serwera (${err.message}). Spróbuj ponownie za chwilę lub sprawdź połączenie z internetem.`,
      provider: 'guard',
      assistant: activeAsst,
      mode: currentMode,
      media: [],
      sources: []
    };
    thread.messages.push(deliveredReply);
  } finally {
    busy = false;
    sendBtn.disabled = false;
    renderConversation(revealMsgId);
    if (requestGeneration === conversationGeneration && typeof chatOpts?.onReply === 'function') {
      chatOpts.onReply(deliveredReply);
    }
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

function setMode(modeName, { persist = true } = {}) {
  const next = modeName && ALLOWED_MODES.has(modeName) ? modeName : 'CC Auto';
  currentMode = next;
  state.mode = next;
  if (persist) saveState();
  updateTopbarModelLabel();
  $$('#modelMenu .dropdown-option[data-model]').forEach((o) => {
    const selected = o.dataset.model === currentMode;
    o.classList.toggle('active', selected);
    o.setAttribute('aria-selected', String(selected));
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
      ? 'Bezpośrednie połączenie z MojaBiblia Interlinear (hebrajski/greka + Strong) i wyszukiwarką Słowa (UBG).'
      : 'Przeszukuj ponad 700 dokumentów Christian Culture i zamieniaj wyniki w analizę Deep Research.';

    let resultsBox;

    if (name === 'Biblia') {
      const mbBox = document.createElement('section');
      mbBox.className = 'mb-inline-box';
      const mbHead = document.createElement('div');
      mbHead.className = 'mojabiblia-head';
      const mbH = document.createElement('strong');
      mbH.textContent = '📖 MojaBiblia Interlinear · Analiza słów oryginalnych';
      const mbPortalLink = document.createElement('a');
      mbPortalLink.className = 'mojabiblia-link';
      mbPortalLink.href = 'https://polskieradio.cc/mojabiblia';
      mbPortalLink.target = '_blank';
      mbPortalLink.rel = 'noopener noreferrer';
      mbPortalLink.textContent = 'Otwórz pełną MojaBiblia ↗';
      mbHead.append(mbH, mbPortalLink);

      const mbChips = document.createElement('div');
      mbChips.className = 'mb-preset-chips';
      for (const [refLabel, presetRef] of [
        ['Mt 13,55 · Bracia Jezusa', 'Mt 13,55'],
        ['Kol 4,10 · Kuzyn (anepsios)', 'Kol 4,10'],
        ['Wj 20,8 · Sabat', 'Wj 20,8'],
        ['J 3,16 · Ewangelia', 'J 3,16']
      ]) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'msg-action-btn';
        chip.textContent = refLabel;
        chip.onclick = () => loadMojaBibliaVerse(presetRef);
        mbChips.appendChild(chip);
      }

      const mbOut = document.createElement('div');
      mbOut.className = 'mb-inline-result';
      mbBox.append(mbHead, mbChips, mbOut);
      moduleStage.appendChild(mbBox);

      const UI_BOOK_MAP = {
        rdz: 'GEN', rodzaju: 'GEN', wj: 'EXO', wyjscia: 'EXO', kpl: 'LEV', lb: 'NUM', pwt: 'DEU',
        ps: 'PSA', psalm: 'PSA', prz: 'PRO', koh: 'ECC', iz: 'ISA', dn: 'DAN',
        mt: 'MAT', mk: 'MRK', lk: 'LUK', j: 'JHN', dz: 'ACT', rz: 'ROM',
        '1 kor': '1CO', '2 kor': '2CO', ga: 'GAL', ef: 'EPH', flp: 'PHP', kol: 'COL', obj: 'REV'
      };
      let mbMetaCache = null;
      let mbGlossCache = null;

      async function loadMojaBibliaVerse(rawRef) {
        const norm = String(rawRef || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').trim();
        const m = norm.match(/^([1-3]?\s*[a-z]+)\s+(\d{1,3})\s*[:,.]\s*(\d{1,3})/);
        if (!m) {
          mbOut.textContent = 'Wpisz siglum w formacie np. „Mt 13,55”, „Kol 4,10” lub „Wj 20,8”.';
          return;
        }
        const bkRaw = m[1].replace(/\s+/g, ' ').trim();
        const ch = Number(m[2]);
        const vs = Number(m[3]);
        mbOut.textContent = 'Ładuję tekst UBG i warstwę interlinearną z MojaBiblia...';
        try {
          if (!mbMetaCache) {
            const [mRes, gRes] = await Promise.all([
              fetch('/data/bible/bible_books_metadata.json'),
              fetch('/data/bible/glosy-pl.json')
            ]);
            mbMetaCache = mRes.ok ? await mRes.json() : [];
            mbGlossCache = gRes.ok ? await gRes.json() : {};
          }
          const byMeta = (mbMetaCache || []).find((b) =>
            b.id.toLowerCase() === bkRaw ||
            b.shortPl.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l') === bkRaw
          );
          const bookId = UI_BOOK_MAP[bkRaw] || byMeta?.id || bkRaw.toUpperCase();
          const chRes = await fetch(`/data/bible/${bookId}_${String(ch).padStart(2, '0')}.json`);
          if (!chRes.ok) throw new Error(`HTTP ${chRes.status}`);
          const chJson = await chRes.json();
          const vObj = (chJson.verses || []).find((item) => Number(item.verse) === vs);
          if (!vObj) throw new Error('Brak wersetu');

          mbOut.replaceChildren();
          const ubgText = vObj.text?.UBG || vObj.text?.BW || '';
          const p = document.createElement('p');
          p.className = 'mojabiblia-ubg';
          p.textContent = `${chJson.shortPl || bookId} ${ch},${vs} (UBG): „${ubgText}”`;
          mbOut.appendChild(p);

          const wordsWrap = document.createElement('div');
          wordsWrap.className = 'mojabiblia-words';
          for (const w of (vObj.interlinear || []).slice(0, 18)) {
            const st = String(w.strong || '');
            const pad = /^[GH]\d{1,3}$/.test(st) ? st[0] + st.slice(1).padStart(4, '0') : st;
            const gloss = (mbGlossCache && (mbGlossCache[pad] || mbGlossCache[st])) || w.gloss || '';
            const pill = document.createElement('span');
            pill.className = 'mojabiblia-word-pill';
            pill.textContent = `${w.original} · ${w.translit || ''} (${pad})${gloss ? `: ${gloss}` : ''}`;
            wordsWrap.appendChild(pill);
          }
          mbOut.appendChild(wordsWrap);

          const foot = document.createElement('div');
          foot.className = 'module-card-foot';
          const askEx = document.createElement('button');
          askEx.type = 'button';
          askEx.className = 'connect-btn';
          askEx.textContent = 'Analizuj egzegetycznie z AI →';
          askEx.onclick = () => startPromptDirectly(
            `Przeprowadź dokładną analizę egzegetyczną wersetu ${chJson.shortPl || bookId} ${ch},${vs} (UBG) na podstawie języka oryginalnego i kodów Stronga.`,
            `Egzegeza ${chJson.shortPl || bookId} ${ch},${vs}`,
            'Studium Biblijne'
          );
          const openMb = document.createElement('a');
          openMb.className = 'gold-card-link';
          openMb.href = `https://polskieradio.cc/mojabiblia?book=${encodeURIComponent(bookId)}&chapter=${ch}&verse=${vs}&mode=interlinear`;
          openMb.target = '_blank';
          openMb.rel = 'noopener noreferrer';
          openMb.textContent = 'Otwórz w MojaBiblia ↗';
          foot.append(askEx, openMb);
          mbOut.appendChild(foot);
        } catch {
          mbOut.textContent = 'Nie udało się pobrać wersetu z MojaBiblia dla podanego siglum.';
        }
      }
      loadMojaBibliaVerse('Mt 13,55');
    }

    const row = document.createElement('form');
    row.className = 'module-search-row';
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = name === 'Biblia' ? 'Np. Mt 13,55, Kol 4,10, Wj 20,8 lub temat...' : 'Wpisz temat analizy (np. szabat, historia, wolność sumienia)...';
    const goBtn = document.createElement('button');
    goBtn.type = 'submit';
    goBtn.className = 'send-gold-btn module-go-btn';
    goBtn.textContent = 'Szukaj';
    row.append(input, goBtn);

    resultsBox = document.createElement('div');
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
    const favorites = state.favorites || [];
    sub.textContent = 'Ulubione odpowiedzi (★) oraz notatki zapisane przyciskiem „Zapisz” lub „Zapisz na później”.';
    if (!favorites.length && !state.notes.length) {
      const empty = document.createElement('p');
      empty.className = 'module-empty';
      empty.textContent = 'Brak zapisanych notatek ani ulubionych. Kliknij ★ lub rozwiń „Więcej opcji → Zapisz”, aby zachować odpowiedź.';
      moduleStage.appendChild(empty);
      return;
    }
    if (favorites.length) {
      const favHead = document.createElement('h3');
      favHead.className = 'fav-section-label';
      favHead.textContent = `★ Ulubione odpowiedzi (${favorites.length})`;
      const favGrid = document.createElement('div');
      favGrid.className = 'module-grid';
      for (const fav of favorites) {
        const card = document.createElement('article');
        card.className = 'module-card';
        const strong = document.createElement('strong');
        strong.textContent = `★ ${fav.title}`;
        const preview = document.createElement('p');
        preview.textContent = fav.text.slice(0, 260) + (fav.text.length > 260 ? '...' : '');
        const foot = document.createElement('div');
        foot.className = 'module-card-foot';
        const resumeBtn = document.createElement('button');
        resumeBtn.type = 'button';
        resumeBtn.className = 'media-play-btn';
        resumeBtn.textContent = 'Wróć do tematu →';
        resumeBtn.onclick = () => startPromptDirectly(`Wróćmy do ulubionego tematu „${fav.title}” i pomóż mi podjąć kolejny krok.`, fav.title);
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'connect-btn';
        copyBtn.textContent = 'Kopiuj całość';
        copyBtn.onclick = async () => {
          await navigator.clipboard.writeText(fav.text);
          showToast('Skopiowano treść ulubionej odpowiedzi.');
        };
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'msg-action-btn';
        delBtn.textContent = 'Usuń ★';
        delBtn.onclick = () => {
          state.favorites = (state.favorites || []).filter((f) => f.id !== fav.id);
          saveState();
          renderModule('Notatniki');
        };
        foot.append(resumeBtn, copyBtn, delBtn);
        card.append(strong, preview, foot);
        favGrid.appendChild(card);
      }
      moduleStage.append(favHead, favGrid);
    }
    if (!state.notes.length) return;
    if (favorites.length) {
      const noteHead = document.createElement('h3');
      noteHead.className = 'fav-section-label';
      noteHead.textContent = `Zapisane notatki (${state.notes.length})`;
      moduleStage.appendChild(noteHead);
    }
    const grid = document.createElement('div');
    grid.className = 'module-grid';
    for (const note of state.notes) {
      const card = document.createElement('article');
      card.className = 'module-card';
      if (note.savedLater) {
        const laterTag = document.createElement('span');
        laterTag.className = 'note-later-badge';
        laterTag.textContent = '⏳ Na później';
        card.appendChild(laterTag);
      }
      const strong = document.createElement('strong');
      strong.textContent = note.title;
      const preview = document.createElement('p');
      preview.textContent = note.text.slice(0, 260) + (note.text.length > 260 ? '...' : '');
      const foot = document.createElement('div');
      foot.className = 'module-card-foot';
      const resumeBtn = document.createElement('button');
      resumeBtn.type = 'button';
      resumeBtn.className = 'media-play-btn';
      resumeBtn.textContent = 'Wróć do tematu →';
      resumeBtn.onclick = () => startPromptDirectly(`Wróćmy do zapisanego tematu „${note.title}” i pomóż mi podjąć kolejny krok.`, note.title);
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
      foot.append(resumeBtn, copyBtn, delBtn);
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
    sub.textContent = 'Twoje wskazówki kontekstowe zapisywane wyłącznie lokalnie w Twojej przeglądarce (RODO). Nie są wysyłane w Trybie prywatnym.';
    const privacyHintRow = document.createElement('div');
    privacyHintRow.style.marginBottom = '10px';
    const privacyBtnInline = document.createElement('button');
    privacyBtnInline.type = 'button';
    privacyBtnInline.className = 'gold-card-link';
    privacyBtnInline.textContent = 'Gdzie są zapisywane moje dane i jak je usunąć (RODO) →';
    privacyBtnInline.onclick = () => openPrivacyModal();
    privacyHintRow.appendChild(privacyBtnInline);
    moduleStage.appendChild(privacyHintRow);

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
        const fbReadBtn = document.createElement('button');
        fbReadBtn.type = 'button';
        fbReadBtn.className = 'connect-btn';
        fbReadBtn.textContent = '📊 Opinie użytkowników';
        fbReadBtn.onclick = () => openOwnerFeedbackModal();
        banner.append(bText, fbReadBtn, bBadge);
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

  if (name === 'Automatyzacje') {
    const remWrap = document.createElement('section');
    remWrap.className = 'reminders-section';
    const remHeading = document.createElement('h3');
    remHeading.className = 'reminders-heading';
    remHeading.textContent = `Twoje przypomnienia (${(state.reminders || []).length})`;
    remWrap.appendChild(remHeading);
    if (Array.isArray(state.reminders) && state.reminders.length) {
      const remGrid = document.createElement('div');
      remGrid.className = 'module-grid';
      for (const rem of state.reminders) {
        const card = document.createElement('article');
        card.className = 'module-card';
        const badge = document.createElement('span');
        badge.className = 'note-later-badge';
        const dtLabel = new Date(rem.dueAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
        badge.textContent = rem.done ? `✓ Wykonane · ${dtLabel}` : `⏰ ${dtLabel}`;
        const strong = document.createElement('strong');
        strong.textContent = rem.title;
        const p = document.createElement('p');
        p.textContent = rem.text || '';
        const foot = document.createElement('div');
        foot.className = 'module-card-foot';
        const doneBtn = document.createElement('button');
        doneBtn.type = 'button';
        doneBtn.className = 'connect-btn';
        doneBtn.textContent = rem.done ? 'Przywróć' : '✓ Gotowe';
        doneBtn.onclick = () => {
          rem.done = !rem.done;
          saveState();
          renderModule('Automatyzacje');
        };
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'msg-action-btn';
        delBtn.textContent = 'Usuń';
        delBtn.onclick = () => {
          state.reminders = state.reminders.filter((x) => x.id !== rem.id);
          saveState();
          renderModule('Automatyzacje');
        };
        foot.append(doneBtn, delBtn);
        card.append(badge, strong, p, foot);
        remGrid.appendChild(card);
      }
      remWrap.appendChild(remGrid);
    } else {
      const remEmpty = document.createElement('p');
      remEmpty.className = 'module-empty';
      remEmpty.textContent = 'Brak zapisanych przypomnień. Kliknij „Przypomnij mi” pod dowolną odpowiedzią AI w czacie.';
      remWrap.appendChild(remEmpty);
    }
    moduleStage.appendChild(remWrap);
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
function closeAllComposerMenus({ keepPopup = false } = {}) {
  if (modelMenu && !modelMenu.hidden) {
    modelMenu.hidden = true;
    modelPickerBtn?.setAttribute('aria-expanded', 'false');
  }
  if (composerModelMenu && !composerModelMenu.hidden) {
    composerModelMenu.hidden = true;
    composerModelBtn?.setAttribute('aria-expanded', 'false');
  }
  if (toolsMenu && !toolsMenu.hidden) {
    toolsMenu.hidden = true;
    toolsBtn?.setAttribute('aria-expanded', 'false');
  }
  if (depthMenu && !depthMenu.hidden) {
    depthMenu.hidden = true;
    depthBtn?.setAttribute('aria-expanded', 'false');
  }
  if (mobileComposerSheet && !mobileComposerSheet.hidden) {
    mobileComposerSheet.hidden = true;
    mobileComposerMenuBtn?.setAttribute('aria-expanded', 'false');
  }
  if (!keepPopup) {
    closeComposerCommandPopup();
  }
  closeAllBadgeModelMenus();
}

mobileComposerMenuBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!mobileComposerSheet) return;
  const next = mobileComposerSheet.hidden;
  closeAllComposerMenus();
  if (next) syncMobileComposerSheet();
  mobileComposerSheet.hidden = !next;
  mobileComposerMenuBtn.setAttribute('aria-expanded', String(next));
});

closeMobileComposerSheet?.addEventListener('click', (e) => {
  e.stopPropagation();
  closeAllComposerMenus();
});

mobileComposerSheet?.addEventListener('click', (e) => {
  e.stopPropagation();
  const target = e.target;
  if (!(target instanceof Element)) return;

  const actionBtn = target.closest('[data-mcs-action]');
  if (actionBtn) {
    const act = actionBtn.dataset.mcsAction;
    if (act === 'attach') {
      closeAllComposerMenus();
      fileInput?.click();
      return;
    }
    if (act === 'model') {
      closeAllComposerMenus();
      if (composerModelMenu) {
        composerModelMenu.hidden = false;
        composerModelBtn?.setAttribute('aria-expanded', 'true');
      }
      return;
    }
  }

  const depthBtnEl = target.closest('[data-mcs-depth]');
  if (depthBtnEl) {
    setResponseDepth(depthBtnEl.dataset.mcsDepth || 'balanced');
    return;
  }

  const toggleBtn = target.closest('[data-mcs-toggle]');
  if (toggleBtn) {
    const t = toggleBtn.dataset.mcsToggle;
    if (t === 'web') webSearchBtn?.click();
    else if (t === 'autoread') voiceAutoReadBtn?.click();
    return;
  }

  const toolChip = target.closest('[data-mcs-tool]');
  if (toolChip) {
    const toolName = toolChip.dataset.mcsTool;
    const realOpt = $(`#toolsMenu .dropdown-option[data-tool="${toolName}"]`);
    realOpt?.click();
    return;
  }

  const insertBtn = target.closest('[data-mcs-insert]');
  if (insertBtn && promptInput) {
    const ch = insertBtn.dataset.mcsInsert || '@';
    closeAllComposerMenus();
    const cur = promptInput.value || '';
    if (!cur.trim().endsWith(ch)) {
      const prefix = cur && !/\s$/.test(cur) ? ' ' : '';
      promptInput.value = `${cur}${prefix}${ch}`;
    }
    promptInput.focus();
    resizeTextarea();
    if (typeof updateCommandPopup === 'function') updateCommandPopup();
  }
});

modelPickerBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  const next = modelMenu.hidden;
  closeAllComposerMenus();
  modelMenu.hidden = !next;
  modelPickerBtn.setAttribute('aria-expanded', String(next));
});

composerModelBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!composerModelMenu) return;
  const next = composerModelMenu.hidden;
  closeAllComposerMenus();
  composerModelMenu.hidden = !next;
  composerModelBtn.setAttribute('aria-expanded', String(next));
});

depthBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!depthMenu) return;
  const next = depthMenu.hidden;
  closeAllComposerMenus();
  depthMenu.hidden = !next;
  depthBtn.setAttribute('aria-expanded', String(next));
});

$$('#depthMenu .dropdown-option[data-depth]').forEach((opt) => {
  opt.addEventListener('click', () => {
    setResponseDepth(opt.dataset.depth || 'balanced');
    closeAllComposerMenus();
  });
});

$$('#modelMenu .dropdown-option[data-model]').forEach((opt) => {
  opt.addEventListener('click', () => {
    setMode(opt.dataset.model || 'CC Auto');
    closeAllComposerMenus();
    showToast(`Aktywny tryb: ${currentMode}`);
  });
});

toolsBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  const next = toolsMenu.hidden;
  closeAllComposerMenus();
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
      state.selectedTools = [...selectedTools];
      saveState();
      syncMobileComposerSheet();
      showToast(selectedTools.has(tool) ? `Włączono narzędzie: ${tool}` : `Wyłączono narzędzie: ${tool}`);
    }
    toolsMenu.hidden = true;
    toolsBtn.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('click', (e) => {
  const insidePopup = composerCommandPopup && !composerCommandPopup.hidden && composerCommandPopup.contains(e.target);
  closeAllComposerMenus({ keepPopup: Boolean(insidePopup) });
  if (assistantStrip && !assistantStrip.contains(e.target)) {
    assistantStrip.classList.remove('is-mobile-expanded');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (voiceCallActive) {
      closeVoiceCall();
      return;
    }
    closeAllComposerMenus();
  }
});

navMoreToggle?.addEventListener('click', () => {
  if (!navMoreGroup) return;
  const willOpen = navMoreGroup.hidden;
  navMoreGroup.hidden = !willOpen;
  navMoreToggle.setAttribute('aria-expanded', String(willOpen));
  state.navMoreOpen = willOpen;
  saveState();
});

privacyToggleBtn?.addEventListener('click', () => {
  privateMode = !privateMode;
  if (privateMode) {
    if (isListening) stopDictation();
    if (voiceCallActive) closeVoiceCall();
    stopSpeaking();
  }
  privacyToggleBtn.setAttribute('aria-checked', String(privateMode));
  state.privateMode = privateMode;
  saveState();
  showToast(privateMode ? 'Tryb prywatny: bez zapisu i zewnętrznych modeli. Pytanie obsłuży Baza Wiedzy CC.' : 'Tryb prywatny wyłączony.');
});

webSearchBtn?.addEventListener('click', () => {
  webSearchEnabled = !webSearchEnabled;
  webSearchBtn.setAttribute('aria-pressed', String(webSearchEnabled));
  state.webSearchEnabled = webSearchEnabled;
  saveState();
  syncMobileComposerSheet();
  showToast(webSearchEnabled ? 'Przeszukiwanie zasobów Christian Culture włączone.' : 'Przeszukiwanie zasobów wyłączone.');
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

$('#shareAppBtn')?.addEventListener('click', async () => {
  const url = 'https://polskieradio.cc/ai/aplikacja';
  const shareData = { url };
  if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    showToast('Skopiowano link do aplikacji.');
  } catch {
    openDialog('Udostępnij aplikację', ['Skopiuj adres aplikacji:', url]);
  }
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
    const label = currentUser.displayName || currentUser.email || (ownerSession?.isOwner ? 'Właściciel CC' : 'Konto LUMINA');
    if (labelSpan) labelSpan.textContent = label;
    if (currentUser.photoURL && !existingAvatar) {
      const img = document.createElement('img');
      img.src = currentUser.photoURL;
      img.alt = '';
      img.className = 'footer-avatar';
      const svg = profileBtn.querySelector('svg');
      if (svg) {
        svg.setAttribute('hidden', '');
        svg.style.display = 'none';
      }
      profileBtn.insertBefore(img, labelSpan);
    }
  } else {
    if (labelSpan) labelSpan.textContent = 'Mój profil';
    if (existingAvatar) existingAvatar.remove();
    const svg = profileBtn.querySelector('svg');
    if (svg) {
      svg.removeAttribute('hidden');
      svg.style.display = '';
    }
  }
}

function handleAuthUpdate(user) {
  const validUser = user && !user.isAnonymous && user.uid ? user : null;
  const prevUid = getUidScope(currentUser?.uid);
  const nextUid = getUidScope(validUser?.uid);
  currentUser = validUser;
  if (prevUid !== nextUid) {
    ownerSession = null;
    activeThreadId = null;
    ephemeralThread = null;
    state = loadState(validUser?.uid);
    byokConfig = clearLegacyByok();
    byokSelected = false;
    conversationGeneration++;
    renderRecentChats();
    renderRightProjects();
    applyPreferencesFromState();
    if (currentNav === 'Czat') showWelcomeView();
    else renderModule(currentNav);
  }
  updateProfileFooterButton();
  syncProBadge();
  updatePersonalizedHero();
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

  const proSt = getProStatus();
  const proLine = document.createElement('p');
  proLine.textContent = proSt.tier === 'trial'
    ? `Status aplikacji: Wersja PRO aktywna (darmowy start — pozostało ${proSt.daysLeft} z ${PRO_TRIAL_DAYS} dni).`
    : proSt.active
      ? `Status aplikacji: ${proSt.label} aktywny.`
      : 'Status aplikacji: Wersja podstawowa (okres próbny PRO zakończony — wsparcie Patronów i Mecenasów odblokowuje PRO).';

  const byokIntro = document.createElement('p');
  byokIntro.textContent = ownerSession?.isOwner
    ? `👑 Konto Właściciela (${ownerSession.email}): Twoja serwerowa pula ${ownerSession.apiPool?.geminiKeys || 0}× bezpłatnych kluczy Google AI (Gemini 3.5 / 3.1) oraz YouTube API v3 są już automatycznie aktywne bez wpisywania kluczy w przeglądarce.`
    : 'Domyślnie korzystasz z darmowych zasobów Christian Culture (0 zł). Jeśli chcesz podpiąć tu także swój własny klucz (OpenRouter, GPT, Gemini, Groq), jest on trzymany tylko w pamięci tej karty — znika po jej zamknięciu lub odświeżeniu i nigdzie nie jest zapisywany:';

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
  keyInput.placeholder = 'Klucz API (tylko do zamknięcia lub odświeżenia karty)';
  keyInput.autocomplete = 'off';
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
  const byokConsent = document.createElement('label');
  const allow = document.createElement('input');
  allow.type = 'checkbox';
  byokConsent.append(allow, document.createTextNode(' Zgadzam się wysyłać rozmowę do wybranego dostawcy. Może on naliczyć opłaty na moim koncie.'));
  form.append(select, modelInput, keyInput, byokConsent, btnRow);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (select.value && keyInput.value.trim() && !allow.checked) {
      showToast('Potwierdź przekazanie danych i możliwe koszty własnego API.');
      return;
    }
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

  const help = document.createElement('details');
  help.className = 'settings-help';
  const helpTitle = document.createElement('summary');
  helpTitle.textContent = 'Informacje o aplikacji i pomoc';
  help.appendChild(helpTitle);
  const helpLines = [
    'Asystent AI połączony z Bazą Wiedzy Christian Culture (700+ zweryfikowanych dokumentów, Kurs Codzienny, MojaBiblia UBG).',
    'Tryb prywatny blokuje zapis historii w przeglądarce oraz odczyt zapisanych wskazówek pamięci.',
    'Odpowiedzi biblijne weryfikuj bezpośrednio w Piśmie Świętym (Uwspółcześniona Biblia Gdańska).'
  ];
  for (const line of helpLines) {
    const paragraph = document.createElement('p');
    paragraph.textContent = line;
    help.appendChild(paragraph);
  }

  const localPrivacyBtn = document.createElement('button');
  localPrivacyBtn.type = 'button';
  localPrivacyBtn.className = 'dialog-btn-secondary';
  localPrivacyBtn.textContent = 'Lokalnie · RODO';
  localPrivacyBtn.title = 'Rozmowy zapisywane lokalnie w Twojej przeglądarce';
  localPrivacyBtn.onclick = openPrivacyModal;

  infoDialogBody.append(summary, proLine, buildDesktopVisualSettingsSection(), byokIntro, form, localPrivacyBtn, help);
  showInfoDialog();
}

function buildDesktopVisualSettingsSection() {
  const box = document.createElement('section');
  box.className = 'settings-panel-box';
  box.setAttribute('aria-label', 'Wygląd pulpitu i panele boczne');

  const heading = document.createElement('h3');
  heading.className = 'settings-panel-title';
  heading.textContent = 'Wygląd pulpitu i panele boczne';

  const bgRow = document.createElement('label');
  bgRow.className = 'settings-toggle-row';
  const bgLabel = document.createElement('span');
  bgLabel.textContent = 'Animacja tła na pulpicie';
  const bgToggle = document.createElement('input');
  bgToggle.type = 'checkbox';
  bgToggle.id = 'ambientBgToggle';
  bgToggle.checked = state.ambientBgEnabled !== false;
  bgRow.append(bgLabel, bgToggle);

  const colorRow = document.createElement('div');
  colorRow.className = 'settings-color-row' + (bgToggle.checked ? '' : ' is-disabled');
  const colorLabel = document.createElement('span');
  colorLabel.className = 'settings-color-label';
  colorLabel.textContent = 'Kolor animacji tła:';

  const swatchesWrap = document.createElement('div');
  swatchesWrap.className = 'settings-color-swatches';
  const currentHex = normalizeHexColor(state.ambientBgColor) || DEFAULT_AMBIENT_COLOR;
  const swatchButtons = [];

  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.id = 'ambientBgColorPicker';
  colorInput.className = 'settings-color-input';
  colorInput.value = currentHex;
  colorInput.setAttribute('aria-label', 'Wybierz własny kolor animacji tła');

  const syncSwatches = (activeHex) => {
    for (const { btn, hex } of swatchButtons) {
      const isAct = hex === activeHex;
      btn.classList.toggle('is-active', isAct);
      btn.setAttribute('aria-pressed', String(isAct));
    }
    colorInput.value = activeHex;
  };

  const applyColor = (nextHex) => {
    const normalized = normalizeHexColor(nextHex) || DEFAULT_AMBIENT_COLOR;
    state.ambientBgColor = normalized;
    saveState();
    applyAmbientBgPreference();
    syncSwatches(normalized);
  };

  for (const preset of AMBIENT_COLOR_PRESETS) {
    const swBtn = document.createElement('button');
    swBtn.type = 'button';
    swBtn.className = 'settings-swatch' + (preset.hex === currentHex ? ' is-active' : '');
    swBtn.dataset.bgColor = preset.hex;
    swBtn.style.setProperty('--swatch-color', preset.hex);
    swBtn.title = preset.label;
    swBtn.setAttribute('aria-label', `Kolor animacji tła: ${preset.label}`);
    swBtn.setAttribute('aria-pressed', String(preset.hex === currentHex));
    swBtn.addEventListener('click', () => applyColor(preset.hex));
    swatchButtons.push({ btn: swBtn, hex: preset.hex });
    swatchesWrap.appendChild(swBtn);
  }

  const pickerLabel = document.createElement('label');
  pickerLabel.className = 'settings-color-picker-wrap';
  pickerLabel.append(colorInput, document.createTextNode('Własny'));
  colorInput.addEventListener('input', () => applyColor(colorInput.value));
  colorInput.addEventListener('change', () => applyColor(colorInput.value));
  swatchesWrap.appendChild(pickerLabel);
  colorRow.append(colorLabel, swatchesWrap);

  bgToggle.addEventListener('change', () => {
    state.ambientBgEnabled = bgToggle.checked;
    colorRow.classList.toggle('is-disabled', !bgToggle.checked);
    saveState();
    applyAmbientBgPreference();
  });

  const hoverRow = document.createElement('label');
  hoverRow.className = 'settings-toggle-row';
  const hoverLabel = document.createElement('span');
  hoverLabel.textContent = 'Wysuwany podgląd funkcji po najechaniu na ikony';
  const hoverToggle = document.createElement('input');
  hoverToggle.type = 'checkbox';
  hoverToggle.id = 'railHoverToggle';
  hoverToggle.checked = state.railHoverPreview !== false;
  hoverToggle.addEventListener('change', () => {
    state.railHoverPreview = hoverToggle.checked;
    saveState();
    if (!hoverToggle.checked) closeRailFlyoutFn();
  });
  hoverRow.append(hoverLabel, hoverToggle);

  box.append(heading, bgRow, colorRow, hoverRow);
  return box;
}

function openProfileModal() {
  infoDialogTitle.textContent = 'Mój profil — LUMINA & AI dla Jezusa';
  infoDialogBody.replaceChildren();

  if (currentUser && !currentUser.isAnonymous) {
    const info = document.createElement('p');
    info.textContent = ownerSession?.isOwner
      ? `Zalogowano jako właściciel: ${currentUser.displayName || 'Cezary Rogowski'} (${currentUser.email}). Odblokowano pulę ${ownerSession.apiPool?.geminiKeys || 0}× kluczy Google AI, YouTube API v3, 18 umiejętności Antigravity oraz integracje chmury CC.`
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

    const proBtn = document.createElement('button');
    proBtn.type = 'button';
    proBtn.className = 'connect-btn';
    proBtn.textContent = `Status: ${getProStatus().label}`;
    proBtn.onclick = openProModal;

    btnRow.append(proBtn, luminaLink, logoutBtn);
    if (ownerSession?.isOwner) {
      const ownerFbBtn = document.createElement('button');
      ownerFbBtn.type = 'button';
      ownerFbBtn.className = 'connect-btn';
      ownerFbBtn.textContent = '📊 Opinie użytkowników';
      ownerFbBtn.onclick = () => openOwnerFeedbackModal();
      btnRow.insertBefore(ownerFbBtn, luminaLink);
    }
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
  showInfoDialog();
}

function exportLocalUserDataJson() {
  const payload = {
    app: 'AI dla Jezusa (https://polskieradio.cc/ai/aplikacja)',
    exportedAt: new Date().toISOString(),
    accountScope: getUidScope(),
    privacyMode: privateMode,
    data: {
      chats: state.chats || [],
      memory: state.memory || [],
      notes: state.notes || [],
      favorites: state.favorites || [],
      reactions: state.reactions || {},
      opinions: state.opinions || [],
      reminders: state.reminders || [],
      projects: state.projects || [],
      assistantId: state.assistantId || DEFAULT_ASSISTANT_ID,
      preferredModel: state.preferredModel || 'auto',
      mode: state.mode || 'CC Auto',
      responseDepth: state.responseDepth || 'balanced',
      autoReadEnabled: Boolean(state.autoReadEnabled),
      webSearchEnabled: Boolean(state.webSearchEnabled),
      selectedTools: Array.isArray(state.selectedTools) ? state.selectedTools : [],
      privateMode: Boolean(state.privateMode),
      navMoreOpen: Boolean(state.navMoreOpen),
      byokProvider: state.byokProvider || '',
      byokModel: state.byokModel || ''
    }
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = `ai-dla-jezusa-dane-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 2000);
  trackAiEvent('ai_gdpr_export', { chats: (state.chats || []).length });
  showToast('Wyeksportowano Twoje lokalne dane do pliku JSON.');
}

function clearAllLocalUserData() {
  conversationGeneration++;
  state = {
    chats: [],
    notes: [],
    favorites: [],
    reactions: {},
    opinions: [],
    memory: [],
    reminders: [],
    projects: [...DEFAULT_PROJECTS],
    assistantId: DEFAULT_ASSISTANT_ID,
    preferredModel: 'auto',
    mode: 'CC Auto',
    responseDepth: 'balanced',
    autoReadEnabled: false,
    webSearchEnabled: false,
    selectedTools: [],
    privateMode: false,
    navMoreOpen: false,
    byokProvider: '',
    byokModel: '',
    leftCollapsed: state.leftCollapsed,
    rightCollapsed: state.rightCollapsed
  };
  activeThreadId = null;
  ephemeralThread = null;
  selectedOwnerModel = '';
  try {
    const prefix = `${STORAGE_PREFIX}`;
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
  byokConfig = { provider: '', apiKey: '', model: '' };
  byokSelected = false;
  renderRecentChats();
  renderRightProjects();
  applyPreferencesFromState();
  updatePersonalizedHero();
  showWelcomeView();
  trackAiEvent('ai_gdpr_erase', { status: 'cleared' });
  showToast('Usunięto lokalne dane bieżącego konta.');
}

function openPrivacyModal() {
  trackAiEvent('ai_gdpr_modal_open', { private_mode: privateMode });
  infoDialogTitle.textContent = 'Prywatność i RODO — Twoje dane w AI dla Jezusa';
  infoDialogBody.replaceChildren();

  const intro = document.createElement('p');
  intro.textContent = 'Dbamy o Twoją prywatność zgodnie z RODO. Zobacz dokładnie, gdzie zapisywane są Twoje informacje i jak możesz nimi zarządzać:';

  const list = document.createElement('ul');
  list.className = 'pro-benefits';
  const points = [
    `Gdzie trafiają „Ostatnie rozmowy” (${(state.chats || []).length}), „Pamięć” (${(state.memory || []).length}), „Notatniki” (${(state.notes || []).length}) i „Przypomnienia” (${(state.reminders || []).length}): są zapisywane WYŁĄCZNIE lokalnie w Twojej przeglądarce (localStorage) na tym urządzeniu — nie trzymamy Twoich prywatnych rozmów w bazie danych na serwerze CC.`,
    'Przetwarzanie zapytań AI: wpisane pytanie i kontekst rozmowy są szyfrowane (TLS) i wysyłane przez Worker Cloudflare do wybranego silnika AI (np. Google Gemini) wyłącznie w celu wygenerowania odpowiedzi. Opcja „Baza Wiedzy CC (offline)” działa całkowicie wewnątrz naszego indeksu bez zewnętrznych modeli.',
    'Tryb prywatny (przełącznik u góry): nie zapisuje rozmów, nie dołącza historii ani pamięci i wstrzymuje pomiary Google Analytics.',
    'Statystyki Google Analytics: rejestrujemy wyłącznie anonimowe zdarzenia reakcji i jakości (np. łapka w górę/dół, ulubione, gwiazdki opinii) bez treści pytań, komentarzy ani danych osobowych.',
    'Własny klucz API (BYOK): jeśli go podasz, jest zapisany wyłącznie lokalnie w Twojej przeglądarce.'
  ];
  for (const pt of points) {
    const li = document.createElement('li');
    li.textContent = pt;
    list.appendChild(li);
  }

  const gaRow = document.createElement('div');
  gaRow.className = 'privacy-ga-row';
  const gaMeta = document.createElement('div');
  gaMeta.className = 'privacy-ga-meta';
  const gaTitle = document.createElement('strong');
  gaTitle.textContent = 'Statystyki Google Analytics';
  const gaDesc = document.createElement('span');
  gaDesc.textContent = 'Anonimowe reakcje (👍 👎 ★ opinia) bez treści rozmów.';
  gaMeta.append(gaTitle, gaDesc);
  const gaToggleBtn = document.createElement('button');
  gaToggleBtn.type = 'button';
  gaToggleBtn.className = 'dialog-btn-secondary';
  const syncGaBtn = () => {
    const enabled = getAiAnalyticsConsent() !== 'denied';
    gaToggleBtn.textContent = enabled ? 'Włączone ✓' : 'Wyłączone';
    gaToggleBtn.setAttribute('aria-pressed', String(enabled));
  };
  syncGaBtn();
  gaToggleBtn.onclick = () => {
    const nextEnabled = getAiAnalyticsConsent() === 'denied';
    setAiAnalyticsConsent(nextEnabled);
    syncGaBtn();
    showToast(nextEnabled ? 'Włączono anonimowe statystyki Google Analytics.' : 'Wyłączono statystyki Google Analytics.');
  };
  gaRow.append(gaMeta, gaToggleBtn);

  const row = document.createElement('div');
  row.className = 'dialog-actions-row';

  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.className = 'connect-btn';
  exportBtn.textContent = 'Eksportuj moje dane (JSON)';
  exportBtn.onclick = () => exportLocalUserDataJson();

  const policyLink = document.createElement('a');
  policyLink.href = '/privacy#ai-dla-jezusa';
  policyLink.target = '_blank';
  policyLink.rel = 'noopener noreferrer';
  policyLink.className = 'dialog-btn-secondary';
  policyLink.textContent = 'Pełna Polityka Prywatności ↗';

  let armedErase = false;
  const eraseBtn = document.createElement('button');
  eraseBtn.type = 'button';
  eraseBtn.className = 'danger-btn';
  eraseBtn.textContent = 'Usuń wszystkie moje dane z przeglądarki';
  eraseBtn.onclick = () => {
    if (!armedErase) {
      armedErase = true;
      eraseBtn.textContent = 'Kliknij ponownie, aby potwierdzić trwałe usunięcie';
      return;
    }
    clearAllLocalUserData();
    infoDialog.close();
  };

  row.append(exportBtn, policyLink, eraseBtn);
  infoDialogBody.append(intro, list, gaRow, row);
  showInfoDialog();
}

$$('.footer-item:not(#shareAppBtn):not(#privacyToggleBtn)').forEach((btn) => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.nav || 'Opcje';
    if (name === 'Ustawienia') openSettingsModal();
    else if (name === 'Prywatność i RODO') openPrivacyModal();
    else openProfileModal();
    closeDrawers();
  });
});

$$('.connect-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const appName = btn.dataset.app || 'Aplikacja';
    if (appName === 'MojaBiblia') {
      showModuleView('Biblia');
      closeDrawers();
      showToast('Połączono z MojaBiblia Interlinear.');
      return;
    }
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
  syncSendButtonMode();
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
  syncSendButtonMode();
}

assistantStrip?.querySelectorAll('.assistant-pill').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    if (window.innerWidth <= 560 && assistantStrip) {
      e.stopPropagation();
      const targetId = btn.dataset.assistant || DEFAULT_ASSISTANT_ID;
      if (!assistantStrip.classList.contains('is-mobile-expanded') && btn.classList.contains('active')) {
        assistantStrip.classList.add('is-mobile-expanded');
        return;
      }
      setActiveAssistant(targetId);
      assistantStrip.classList.remove('is-mobile-expanded');
      return;
    }
    setActiveAssistant(btn.dataset.assistant || DEFAULT_ASSISTANT_ID);
  });
});

voiceAutoReadBtn?.addEventListener('click', () => {
  autoReadEnabled = !autoReadEnabled;
  voiceAutoReadBtn.setAttribute('aria-pressed', String(autoReadEnabled));
  state.autoReadEnabled = autoReadEnabled;
  saveState();
  syncMobileComposerSheet();
  if (!autoReadEnabled) stopSpeaking();
  showToast(autoReadEnabled ? 'Czytanie odpowiedzi głosem włączone.' : 'Czytanie odpowiedzi głosem wyłączone.');
});

// ================= DYNAMICZNE DYKTATOWANIE GŁOSOWE NA ŻYWO + FALLBACK AI AUDIO =================
let dictationWatchdogTimer = null;
let cloudMediaStream = null;
let cloudRecorder = null;
let cloudFlushTimer = null;
let cloudUploading = false;
let cloudTranscribeQueue = [];

let voiceCallActive = false;
let voiceCallMuted = false;
let voiceCallPhase = 'idle'; // listening | thinking | speaking
let voiceCallDraft = '';
let voiceCallRecognition = null;
let voiceCallWatchdog = null;
let voiceCallSilenceTimer = null;
let voiceCallMediaStream = null;
let voiceCallRecorder = null;
let voiceCallAudioChunks = [];

function formatDictationDuration(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = String(totalSec % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

function stopCloudRecorderResources() {
  if (cloudFlushTimer) {
    clearInterval(cloudFlushTimer);
    cloudFlushTimer = null;
  }
  const rec = cloudRecorder;
  cloudRecorder = null;
  if (rec && rec.state !== 'inactive') {
    try { rec.stop(); } catch {}
  }
  if (cloudMediaStream) {
    try { cloudMediaStream.getTracks().forEach((t) => t.stop()); } catch {}
    cloudMediaStream = null;
  }
}

function releaseAudioResources() {
  if (voiceRafId) {
    cancelAnimationFrame(voiceRafId);
    voiceRafId = 0;
  }
  if (dictationRestartTimer) {
    clearTimeout(dictationRestartTimer);
    dictationRestartTimer = null;
  }
  if (dictationWatchdogTimer) {
    clearTimeout(dictationWatchdogTimer);
    dictationWatchdogTimer = null;
  }
  stopCloudRecorderResources();
  speechEnergy = 0;
  for (const bar of waveBars) {
    bar.style.transform = 'scaleY(0.24)';
  }
}

function runWaveAnimation() {
  const count = waveBars.length;
  if (!count || !isListening) return;

  const tick = (now) => {
    if (!isListening) return;
    speechEnergy *= 0.91;
    const t = now * 0.0085;
    for (let i = 0; i < count; i += 1) {
      const centerDist = Math.abs(i - (count - 1) / 2) / ((count - 1) / 2);
      const envelope = 1 - centerDist * 0.42;
      const baseWave = 0.28 + 0.22 * Math.sin(t + i * 0.65) + 0.14 * Math.cos(t * 1.45 - i * 0.9);
      const amp = Math.min(1, baseWave * envelope + speechEnergy * (0.45 + 0.35 * Math.sin(t * 1.9 + i)));
      const scale = Math.max(0.22, Math.min(1.08, 0.22 + amp * 0.86));
      waveBars[i].style.transform = `scaleY(${scale.toFixed(3)})`;
    }
    voiceRafId = requestAnimationFrame(tick);
  };

  voiceRafId = requestAnimationFrame(tick);
}

function startAudioWaveform() {
  // Nie przejmujemy mikrofonu obok aktywnego SpeechRecognition, aby uniknąć blokady w przeglądarce
  runWaveAnimation();
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result || '');
      const idx = res.indexOf('base64,');
      resolve(idx >= 0 ? res.slice(idx + 7) : res);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function transcribeAudioBlob(blob) {
  if (privateMode || !blob || blob.size < 320) return '';
  const base64 = await blobToBase64(blob);
  const res = await fetch('/api/ai-dla-jezusa/v1/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audioBase64: base64,
      mimeType: blob.type || 'audio/webm',
      lang: 'pl-PL'
    })
  });
  if (!res.ok) return '';
  const data = await res.json();
  return String(data?.text || '').trim();
}

function applyLiveDictationText(text) {
  if (!promptInput) return;
  promptInput.value = text;
  resizeTextarea();
  try {
    promptInput.setSelectionRange(text.length, text.length);
  } catch {}
  promptInput.dispatchEvent(new Event('input', { bubbles: true }));
  promptInput.scrollTop = promptInput.scrollHeight;
}

async function flushCloudChunk(blob) {
  if (!blob || blob.size < 450) return;
  cloudTranscribeQueue.push(blob);
  if (cloudUploading) return;
  cloudUploading = true;
  try {
    while (cloudTranscribeQueue.length) {
      const nextBlob = cloudTranscribeQueue.shift();
      const piece = await transcribeAudioBlob(nextBlob);
      if (piece) {
        dictationCommittedText = [dictationCommittedText, piece].filter(Boolean).join(' ').trim();
        applyLiveDictationText(dictationCommittedText);
        if (voiceInterimEl) {
          const preview = piece.length > 34 ? `…${piece.slice(-33)}` : piece;
          voiceInterimEl.textContent = `„${preview}”`;
          voiceInterimEl.hidden = false;
        }
        speechEnergy = 0.9;
      }
    }
  } catch {
    // zachowaj płynność dyktowania
  } finally {
    cloudUploading = false;
  }
}

async function startCloudDictationFallback(reason = '') {
  if (privateMode) return;
  if (!isListening || dictationManualStop) return;
  if (cloudRecorder) return;

  // Zamknij najpierw SpeechRecognition, zanim przejmiemy mikrofon przez MediaRecorder
  const staleRec = recognition;
  recognition = null;
  if (staleRec) {
    try { staleRec.onend = null; staleRec.onerror = null; staleRec.stop(); } catch {}
  }

  if (!navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder !== 'function') {
    showToast(reason || 'Twoja przeglądarka nie obsługuje dyktowania głosem.');
    stopDictation({ fromEnd: true });
    return;
  }

  try {
    cloudMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (!isListening || dictationManualStop) {
      stopCloudRecorderResources();
      return;
    }
    if (voiceStatusLabel) voiceStatusLabel.textContent = 'Słucham (AI Audio na żywo)…';

    const startChunkLoop = () => {
      if (!isListening || dictationManualStop || !cloudMediaStream) return;
      let chunks = [];
      let mr;
      try {
        mr = new MediaRecorder(cloudMediaStream);
      } catch {
        stopDictation({ fromEnd: true });
        return;
      }
      cloudRecorder = mr;
      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
      };
      mr.onstop = () => {
        const mime = mr.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: mime });
        flushCloudChunk(blob);
        if (isListening && !dictationManualStop && cloudMediaStream) {
          startChunkLoop();
        }
      };
      mr.start();
    };

    startChunkLoop();
    cloudFlushTimer = setInterval(() => {
      if (cloudRecorder && cloudRecorder.state === 'recording') {
        try { cloudRecorder.stop(); } catch {}
      }
    }, 3200);
  } catch {
    showToast('Zezwól przeglądarce na dostęp do mikrofonu, aby dyktować.');
    stopDictation({ fromEnd: true });
  }
}

function stopDictation({ fromEnd = false } = {}) {
  dictationManualStop = true;
  const activeRec = recognition;
  recognition = null;
  if (!isListening && !activeRec && !cloudRecorder) return;

  if (promptInput && dictationLastInterim) {
    dictationCommittedText = [dictationCommittedText, dictationLastInterim].filter(Boolean).join(' ').trim();
    applyLiveDictationText(dictationCommittedText);
  }
  dictationLastInterim = '';

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
    promptInput.dispatchEvent(new Event('input', { bubbles: true }));
    if (fromEnd) promptInput.focus();
  }
}

function startDictation() {
  if (privateMode) {
    showToast('Wyłącz tryb prywatny, aby użyć mikrofonu.');
    return;
  }
  if (voiceCallActive) closeVoiceCall();

  if (isListening) {
    stopDictation();
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  dictationManualStop = false;
  dictationCommittedText = promptInput ? promptInput.value.trim() : '';
  dictationLastInterim = '';
  dictationStartedAt = Date.now();
  cloudTranscribeQueue = [];
  isListening = true;
  trackAiEvent('ai_dictation_start', { assistant_id: getActiveAssistantId() });

  promptInput?.focus();
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

  startAudioWaveform();

  if (!SR) {
    startCloudDictationFallback();
    return;
  }

  const isAndroid = /Android/i.test(navigator.userAgent || '');
  let receivedAnyResult = false;
  let switchedToCloud = false;

  const launchRecognitionSession = () => {
    if (!isListening || dictationManualStop || switchedToCloud) return;
    const baseAtSessionStart = dictationCommittedText;
    let sessionFinal = '';
    let sessionInterim = '';

    const rec = new SR();
    recognition = rec;
    rec.lang = 'pl-PL';
    rec.continuous = !isAndroid;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    clearTimeout(dictationWatchdogTimer);
    dictationWatchdogTimer = setTimeout(() => {
      if (isListening && !dictationManualStop && !receivedAnyResult && !switchedToCloud) {
        switchedToCloud = true;
        startCloudDictationFallback();
      }
    }, 4500);

    rec.onstart = () => {
      if (recognition !== rec) return;
      if (voiceStatusLabel) voiceStatusLabel.textContent = 'Słucham… Mów teraz';
    };

    rec.onsoundstart = () => {
      speechEnergy = 0.85;
    };

    rec.onspeechstart = () => {
      speechEnergy = 1;
      if (voiceStatusLabel) voiceStatusLabel.textContent = 'Rozpoznaję mowę na żywo…';
    };

    rec.onresult = (event) => {
      if (recognition !== rec || !isListening || switchedToCloud) return;
      receivedAnyResult = true;
      clearTimeout(dictationWatchdogTimer);
      speechEnergy = 1;

      sessionFinal = '';
      sessionInterim = '';
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = String(result?.[0]?.transcript || '').trim();
        if (!text) continue;
        if (result.isFinal) {
          sessionFinal += (sessionFinal ? ' ' : '') + text;
        } else {
          sessionInterim += (sessionInterim ? ' ' : '') + text;
        }
      }

      dictationCommittedText = [baseAtSessionStart, sessionFinal].filter(Boolean).join(' ').trim();
      dictationLastInterim = sessionInterim;

      const combined = [dictationCommittedText, sessionInterim].filter(Boolean).join(' ').trim();
      applyLiveDictationText(combined);

      if (voiceStatusLabel) {
        voiceStatusLabel.textContent = sessionInterim || sessionFinal ? 'Mówisz — wpisuję na żywo…' : 'Słucham… Mów teraz';
      }
      if (voiceInterimEl) {
        const previewSource = sessionInterim || sessionFinal;
        if (previewSource) {
          const preview = previewSource.length > 34 ? `…${previewSource.slice(-33)}` : previewSource;
          voiceInterimEl.textContent = `„${preview}”`;
          voiceInterimEl.hidden = false;
        } else {
          voiceInterimEl.textContent = '';
          voiceInterimEl.hidden = true;
        }
      }
    };

    rec.onerror = (event) => {
      if (recognition !== rec || switchedToCloud) return;
      const code = event?.error || '';
      if (code === 'not-allowed' || code === 'service-not-allowed' || code === 'network' || code === 'language-not-supported') {
        switchedToCloud = true;
        clearTimeout(dictationWatchdogTimer);
        startCloudDictationFallback();
      } else if (code === 'audio-capture') {
        dictationManualStop = true;
        showToast('Nie wykryto aktywnego mikrofonu.');
        stopDictation({ fromEnd: true });
      } else if (code === 'no-speech') {
        if (voiceStatusLabel) voiceStatusLabel.textContent = 'Nie słychać mowy — mów wyraźnie bliżej mikrofonu…';
      } else if (code !== 'aborted') {
        switchedToCloud = true;
        clearTimeout(dictationWatchdogTimer);
        startCloudDictationFallback();
      }
    };

    rec.onend = () => {
      if (recognition !== rec || switchedToCloud) return;
      if (sessionInterim) {
        dictationCommittedText = [baseAtSessionStart, sessionFinal, sessionInterim].filter(Boolean).join(' ').trim();
        sessionInterim = '';
        dictationLastInterim = '';
        applyLiveDictationText(dictationCommittedText);
      }
      if (isListening && !dictationManualStop) {
        clearTimeout(dictationRestartTimer);
        dictationRestartTimer = setTimeout(launchRecognitionSession, 110);
        return;
      }
      stopDictation({ fromEnd: true });
    };

    try {
      rec.start();
    } catch {
      switchedToCloud = true;
      startCloudDictationFallback();
    }
  };

  launchRecognitionSession();
}

// ================= DWUKIERUNKOWY CZAT GŁOSOWY NA ŻYWO =================
function stopVoiceCallAudioStreams() {
  if (voiceCallWatchdog) {
    clearTimeout(voiceCallWatchdog);
    voiceCallWatchdog = null;
  }
  if (voiceCallSilenceTimer) {
    clearTimeout(voiceCallSilenceTimer);
    voiceCallSilenceTimer = null;
  }
  const rec = voiceCallRecognition;
  voiceCallRecognition = null;
  if (rec) {
    try { rec.onend = null; rec.onerror = null; rec.stop(); } catch {}
  }
  const mr = voiceCallRecorder;
  voiceCallRecorder = null;
  if (mr && mr.state !== 'inactive') {
    try { mr.stop(); } catch {}
  }
  if (voiceCallMediaStream) {
    try { voiceCallMediaStream.getTracks().forEach((t) => t.stop()); } catch {}
    voiceCallMediaStream = null;
  }
}

function setVoiceCallPhase(phase, statusMsg = '') {
  voiceCallPhase = phase;
  if (voiceCallAvatarWrap) {
    voiceCallAvatarWrap.classList.remove('is-listening', 'is-thinking', 'is-speaking');
    if (phase === 'listening' && !voiceCallMuted) voiceCallAvatarWrap.classList.add('is-listening');
    if (phase === 'thinking') voiceCallAvatarWrap.classList.add('is-thinking');
    if (phase === 'speaking') voiceCallAvatarWrap.classList.add('is-speaking');
  }
  if (voiceCallInterruptBtn) voiceCallInterruptBtn.hidden = phase !== 'speaking';
  if (voiceCallSendNowBtn) voiceCallSendNowBtn.hidden = phase !== 'listening';
  if (voiceCallState && statusMsg) voiceCallState.textContent = statusMsg;
}

function renderVoiceCallHeader() {
  const persona = getPersona(getActiveAssistantId());
  if (voiceCallAvatar) {
    voiceCallAvatar.src = persona.avatar;
    voiceCallAvatar.alt = persona.name;
    voiceCallAvatar.onerror = () => {
      if (persona.avatarFallback) voiceCallAvatar.src = persona.avatarFallback;
    };
  }
  if (voiceCallName) voiceCallName.textContent = persona.name;
  if (voiceCallAiLabel) voiceCallAiLabel.textContent = `${persona.name}:`;

  if (voiceCallAssistants) {
    voiceCallAssistants.replaceChildren();
    for (const p of Object.values(AI_PERSONAS)) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'assistant-pill' + (p.id === persona.id ? ' active' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(p.id === persona.id));
      const sp = document.createElement('span');
      sp.textContent = p.name;
      btn.appendChild(sp);
      btn.onclick = () => {
        setActiveAssistant(p.id, { announce: false });
        renderVoiceCallHeader();
      };
      voiceCallAssistants.appendChild(btn);
    }
  }
}

async function sendVoiceCallTurn(rawSpokenText = '') {
  const spoken = String(rawSpokenText || voiceCallDraft || '').trim();
  voiceCallDraft = '';
  stopVoiceCallAudioStreams();
  if (!voiceCallActive) return;

  if (!spoken) {
    if (!voiceCallMuted) listenForVoiceCallTurn();
    return;
  }

  if (voiceCallUserText) voiceCallUserText.textContent = spoken;
  setVoiceCallPhase('thinking', `${getPersona(getActiveAssistantId()).name} rozważa odpowiedź…`);

  await sendChatMessage(spoken, '', {
    voiceConversation: true,
    onReply: (replyMsg) => {
      if (!voiceCallActive) return;
      const clean = stripMarkdownForSpeech(replyMsg?.text || '');
      if (voiceCallAiText) voiceCallAiText.textContent = clean || 'Gotowe.';
      setVoiceCallPhase('speaking', `${getPersona(getActiveAssistantId()).name} mówi…`);
      speakReply(replyMsg?.text || '', getActiveAssistantId(), null, null, {
        onEnd: () => {
          if (!voiceCallActive) return;
          if (!voiceCallMuted) {
            listenForVoiceCallTurn();
          } else {
            setVoiceCallPhase('listening', 'Mikrofon wyciszony — kliknij „Wycisz”, aby mówić dalej.');
          }
        }
      });
    }
  });
}

async function startVoiceCallCloudCapture() {
  if (privateMode) return;
  if (!voiceCallActive || voiceCallMuted || voiceCallPhase !== 'listening') return;
  if (!navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder !== 'function') {
    setVoiceCallPhase('listening', 'Brak dostępu do mikrofonu w tej przeglądarce.');
    return;
  }
  try {
    voiceCallMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (!voiceCallActive || voiceCallMuted) {
      stopVoiceCallAudioStreams();
      return;
    }
    setVoiceCallPhase('listening', 'Nagrywam wypowiedź (AI Audio) — kliknij „Wyślij teraz”, gdy skończysz…');
    voiceCallAudioChunks = [];
    const mr = new MediaRecorder(voiceCallMediaStream);
    voiceCallRecorder = mr;
    mr.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) voiceCallAudioChunks.push(ev.data);
    };
    mr.start();
  } catch {
    setVoiceCallPhase('listening', 'Zezwól przeglądarce na dostęp do mikrofonu.');
  }
}

function listenForVoiceCallTurn() {
  if (privateMode) return;
  if (!voiceCallActive || voiceCallMuted) return;
  stopVoiceCallAudioStreams();
  voiceCallDraft = '';
  setVoiceCallPhase('listening', 'Słucham Cię… Mów swobodnie');
  if (voiceCallUserText) voiceCallUserText.textContent = 'Słucham…';

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    startVoiceCallCloudCapture();
    return;
  }

  let gotAnyResult = false;
  let switchedToCloud = false;
  const isAndroid = /Android/i.test(navigator.userAgent || '');

  const rec = new SR();
  voiceCallRecognition = rec;
  rec.lang = 'pl-PL';
  rec.continuous = !isAndroid;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  voiceCallWatchdog = setTimeout(() => {
    if (voiceCallActive && !voiceCallMuted && voiceCallPhase === 'listening' && !gotAnyResult && !switchedToCloud) {
      switchedToCloud = true;
      try { rec.onend = null; rec.onerror = null; rec.stop(); } catch {}
      voiceCallRecognition = null;
      startVoiceCallCloudCapture();
    }
  }, 5500);

  rec.onresult = (event) => {
    if (voiceCallRecognition !== rec || !voiceCallActive || voiceCallMuted) return;
    gotAnyResult = true;
    clearTimeout(voiceCallWatchdog);
    let combined = '';
    for (let i = 0; i < event.results.length; i += 1) {
      const t = String(event.results[i]?.[0]?.transcript || '').trim();
      if (t) combined += (combined ? ' ' : '') + t;
    }
    voiceCallDraft = combined.trim();
    if (voiceCallUserText) voiceCallUserText.textContent = voiceCallDraft || 'Słucham…';

    clearTimeout(voiceCallSilenceTimer);
    if (voiceCallDraft) {
      voiceCallSilenceTimer = setTimeout(() => {
        if (voiceCallActive && voiceCallPhase === 'listening' && voiceCallDraft) {
          sendVoiceCallTurn(voiceCallDraft);
        }
      }, 1400);
    }
  };

  rec.onerror = (event) => {
    if (voiceCallRecognition !== rec || switchedToCloud) return;
    const code = event?.error || '';
    if (code === 'no-speech') return;
    switchedToCloud = true;
    clearTimeout(voiceCallWatchdog);
    try { rec.onend = null; rec.stop(); } catch {}
    voiceCallRecognition = null;
    startVoiceCallCloudCapture();
  };

  rec.onend = () => {
    if (voiceCallRecognition !== rec || switchedToCloud) return;
    if (voiceCallActive && !voiceCallMuted && voiceCallPhase === 'listening') {
      if (voiceCallDraft) {
        sendVoiceCallTurn(voiceCallDraft);
      } else {
        setTimeout(() => listenForVoiceCallTurn(), 160);
      }
    }
  };

  try {
    rec.start();
  } catch {
    switchedToCloud = true;
    startVoiceCallCloudCapture();
  }
}

function openVoiceCall() {
  closeDrawers();
  if (privateMode) {
    showToast('Wyłącz tryb prywatny, aby użyć mikrofonu.');
    return;
  }
  if (isListening) stopDictation();
  stopSpeaking();
  voiceCallActive = true;
  voiceCallMuted = false;
  voiceCallDraft = '';
  if (voiceCallMuteBtn) {
    voiceCallMuteBtn.setAttribute('aria-pressed', 'false');
    voiceCallMuteBtn.textContent = '🎙️ Wycisz';
  }
  renderVoiceCallHeader();
  if (voiceCallAiText) voiceCallAiText.textContent = 'Po każdej Twojej wypowiedzi odpowiem Ci głosowo i znów zacznę słuchać.';
  if (voiceCallOverlay) voiceCallOverlay.hidden = false;
  trackAiEvent('ai_voice_call_start', { assistant_id: getActiveAssistantId() });
  listenForVoiceCallTurn();
}

function closeVoiceCall() {
  voiceCallActive = false;
  voiceCallMuted = false;
  voiceCallDraft = '';
  stopVoiceCallAudioStreams();
  stopSpeaking();
  if (voiceCallOverlay) voiceCallOverlay.hidden = true;
}

voiceChatBtn?.addEventListener('click', openVoiceCall);
voiceCallCloseBtn?.addEventListener('click', closeVoiceCall);
voiceCallEndBtn?.addEventListener('click', closeVoiceCall);

voiceCallMuteBtn?.addEventListener('click', () => {
  voiceCallMuted = !voiceCallMuted;
  voiceCallMuteBtn.setAttribute('aria-pressed', String(voiceCallMuted));
  voiceCallMuteBtn.textContent = voiceCallMuted ? '🔇 Włącz mikrofon' : '🎙️ Wycisz';
  if (voiceCallMuted) {
    stopVoiceCallAudioStreams();
    setVoiceCallPhase('listening', 'Mikrofon wyciszony — kliknij „Włącz mikrofon”, aby kontynuować.');
  } else if (voiceCallPhase === 'listening') {
    listenForVoiceCallTurn();
  }
});

voiceCallInterruptBtn?.addEventListener('click', () => {
  stopSpeaking();
  if (voiceCallActive && !voiceCallMuted) {
    listenForVoiceCallTurn();
  }
});

voiceCallSendNowBtn?.addEventListener('click', async () => {
  if (!voiceCallActive || voiceCallPhase !== 'listening') return;
  if (voiceCallRecorder && voiceCallRecorder.state === 'recording') {
    const mr = voiceCallRecorder;
    voiceCallRecorder = null;
    setVoiceCallPhase('thinking', 'Rozpoznaję Twoją wypowiedź…');
    mr.onstop = async () => {
      const blob = new Blob(voiceCallAudioChunks, { type: mr.mimeType || 'audio/webm' });
      const text = await transcribeAudioBlob(blob);
      await sendVoiceCallTurn(text);
    };
    try { mr.stop(); } catch {}
    return;
  }
  await sendVoiceCallTurn(voiceCallDraft);
});

micBtn?.addEventListener('click', () => {
  if (isListening) stopDictation();
  else startDictation();
});

voiceStopBtn?.addEventListener('click', () => {
  stopDictation();
  promptInput?.focus();
});

const AT_MENTIONS = [
  { id: 'Biblia', label: '@Biblia', hint: 'Pismo Święte UBG i egzegeza', insert: '@Biblia ' },
  { id: 'MojaBiblia', label: '@MojaBiblia', hint: 'Interlinearny tekst grecki/hebrajski + Strong', insert: '@MojaBiblia ' },
  { id: 'Kurs', label: '@Kurs', hint: 'Kurs Codzienny „Z Biblią za Pan Brat”', insert: '@Kurs ' },
  { id: 'Rozważanie', label: '@Rozważanie', hint: 'Dzisiejsze słowo Christian Culture', insert: '@Rozważanie ' },
  { id: 'Notatniki', label: '@Notatniki', hint: 'Twoje zapisane notatki jako kontekst', insert: '@Notatniki ' },
  { id: 'Pamięć', label: '@Pamięć', hint: 'Zapamiętane wskazówki i intencje', insert: '@Pamięć ' },
  { id: 'Projekty', label: '@Projekty', hint: 'Aktywne projekty w Twojej przestrzeni', insert: '@Projekty ' },
  { id: 'Radio', label: '@Radio', hint: 'Radio Biblia Audio 24/7 i audycje', insert: '@Radio ' },
  { id: 'VOD', label: '@VOD', hint: 'Chrześcijańskie kino VOD i SDS', insert: '@VOD ' },
  { id: 'AI', label: '@AI', hint: 'Główny asystent AI dla Jezusa', assistant: 'ai-dla-jezusa' },
  { id: 'Rut', label: '@Rut', hint: 'Gospodyni CC · Radio, VOD i Społeczność', assistant: 'rut' },
  { id: 'Lea', label: '@Lea', hint: 'Planistka · Kurs Codzienny i Akademia', assistant: 'lea' },
  { id: 'Noemi', label: '@Noemi', hint: 'Doradczyni Biblijna · Słowo i Modlitwa', assistant: 'noemi' },
  { id: 'Miriam', label: '@Miriam', hint: 'Psalmy, Biblia Śpiewana i Uwielbienie', assistant: 'miriam' }
];

const SLASH_COMMANDS = [
  { id: '/studium', label: '/studium', hint: 'Studium fragmentu w przekładzie UBG', mode: 'Studium Biblijne', text: 'Przygotuj głębokie studium biblijne (UBG) na temat: ' },
  { id: '/plan', label: '/plan', hint: 'Krok po kroku: plan działania z Jezusem', mode: 'CC Auto', text: 'Ułóż konkretny plan krok po kroku w duchu Słowa Bożego dla: ' },
  { id: '/poranek', label: '/poranek', hint: 'Dzisiejsze słowo i modlitwa poranna', mode: 'Studium Biblijne', autoSend: 'Poprowadź mój dzisiejszy poranek z Jezusem w oparciu o dzisiejsze rozważanie i werset UBG.' },
  { id: '/modlitwa', label: '/modlitwa', hint: 'Szczera modlitwa oparta o obietnice Boże', mode: 'CC Auto', text: 'Napisz modlitwę płynącą z serca i Słowa Bożego (UBG) w sprawie: ' },
  { id: '/sprawdz', label: '/sprawdz', hint: 'Weryfikacja biblijna w świetle UBG i Dekalogu', mode: 'Deep Research', text: 'Sprawdź dokładnie w świetle Pisma Świętego (UBG) i Dekalogu: ' },
  { id: '/streszczenie', label: '/streszczenie', hint: 'Zwięzłe podsumowanie i 3 główne wnioski', mode: 'CC Auto', text: 'Streść przejrzyście w punktach i wskaż 3 praktyczne wnioski: ' },
  { id: '/przypomnij', label: '/przypomnij', hint: 'Ustaw przypomnienie w aplikacji', action: 'reminder' },
  { id: '/notatka', label: '/notatka', hint: 'Otwórz Notatniki i zapisz myśl', action: 'notes' },
  { id: '/glos', label: '/glos', hint: 'Uruchom dwukierunkowy czat głosowy', action: 'voice' }
];

let cmdPopupItems = [];
let cmdPopupIndex = 0;
let cmdPopupContext = null;

function closeComposerCommandPopup() {
  cmdPopupItems = [];
  cmdPopupIndex = 0;
  cmdPopupContext = null;
  if (composerCommandPopup) {
    composerCommandPopup.hidden = true;
    composerCommandPopup.replaceChildren();
  }
}

function getComposerTriggerContext() {
  if (!promptInput) return null;
  const val = promptInput.value || '';
  const caret = typeof promptInput.selectionStart === 'number' ? promptInput.selectionStart : val.length;
  const before = val.slice(0, caret);

  if (/^\/\S*$/.test(before)) {
    return { type: 'slash', query: before.slice(1).toLowerCase(), start: 0, end: caret };
  }
  const atMatch = before.match(/(?:^|\s)@([A-Za-z0-9_żźćńółęąśŻŹĆĄŚĘŁÓŃ-]*)$/);
  if (atMatch) {
    const tokenLen = atMatch[1].length + 1;
    return { type: 'at', query: atMatch[1].toLowerCase(), start: caret - tokenLen, end: caret };
  }
  return null;
}

function applyCommandPopupItem(item) {
  const ctx = cmdPopupContext;
  closeComposerCommandPopup();
  if (!item || !promptInput) return;

  if (ctx?.type === 'at') {
    const val = promptInput.value || '';
    const before = val.slice(0, ctx.start);
    const after = val.slice(ctx.end);
    if (item.assistant) {
      setActiveAssistant(item.assistant);
      promptInput.value = `${before}${after}`.replace(/^\s+/, '');
    } else {
      promptInput.value = `${before}${item.insert || `${item.label} `}${after}`;
    }
    resizeTextarea();
    promptInput.focus();
    return;
  }

  if (item.action === 'voice') {
    promptInput.value = '';
    resizeTextarea();
    openVoiceCall();
    return;
  }
  if (item.action === 'notes') {
    promptInput.value = '';
    resizeTextarea();
    showModuleView('Notatniki');
    return;
  }
  if (item.action === 'reminder') {
    promptInput.value = '';
    resizeTextarea();
    openReminderModal('Przypomnienie modlitewne lub zadaniowe z AI dla Jezusa');
    return;
  }
  if (item.mode) {
    setMode(item.mode);
  }
  if (item.autoSend) {
    promptInput.value = '';
    resizeTextarea();
    startPromptDirectly(item.autoSend, item.label, item.mode || '');
    return;
  }
  promptInput.value = item.text || '';
  resizeTextarea();
  promptInput.focus();
}

function renderComposerCommandPopup() {
  if (!composerCommandPopup) return;
  if (!cmdPopupItems.length || !cmdPopupContext) {
    closeComposerCommandPopup();
    return;
  }
  composerCommandPopup.replaceChildren();
  const head = document.createElement('div');
  head.className = 'composer-cmd-head';
  head.textContent = cmdPopupContext.type === 'slash'
    ? 'Akcje szybkie (/) · Enter aby użyć'
    : 'Przywołaj kontekst lub asystenta (@)';
  composerCommandPopup.appendChild(head);

  cmdPopupItems.forEach((item, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.role = 'option';
    const isSel = idx === cmdPopupIndex;
    btn.className = 'composer-cmd-item' + (isSel ? ' is-selected' : '');
    btn.setAttribute('aria-selected', String(isSel));
    const title = document.createElement('strong');
    title.textContent = item.label;
    const hint = document.createElement('span');
    hint.textContent = item.hint;
    btn.append(title, hint);
    btn.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
      applyCommandPopupItem(item);
    });
    composerCommandPopup.appendChild(btn);
  });
  composerCommandPopup.hidden = false;
}

function updateComposerCommandPopup() {
  const ctx = getComposerTriggerContext();
  if (!ctx) {
    closeComposerCommandPopup();
    return;
  }
  const source = ctx.type === 'slash' ? SLASH_COMMANDS : AT_MENTIONS;
  const filtered = source.filter((item) =>
    item.label.toLowerCase().includes(ctx.query) || item.hint.toLowerCase().includes(ctx.query)
  );
  if (!filtered.length) {
    closeComposerCommandPopup();
    return;
  }
  cmdPopupContext = ctx;
  cmdPopupItems = filtered.slice(0, 8);
  cmdPopupIndex = Math.min(cmdPopupIndex, cmdPopupItems.length - 1);
  renderComposerCommandPopup();
}

function syncSendButtonMode() {
  if (!sendBtn) return;
  const hasText = Boolean((promptInput?.value || '').trim());
  const hasAtt = Boolean(attachmentText || attachmentMediaUrl || attachmentName);
  const voiceReady = !hasText && !hasAtt;
  sendBtn.classList.toggle('is-voice-ready', voiceReady);
  sendBtn.setAttribute(
    'aria-label',
    voiceReady ? 'Rozpocznij rozmowę głosową na żywo' : 'Wyślij wiadomość'
  );
  sendBtn.setAttribute(
    'title',
    voiceReady ? 'Czat głosowy na żywo (pole puste)' : 'Wyślij wiadomość (Enter)'
  );
}

function resizeTextarea() {
  if (!promptInput) return;
  promptInput.style.height = 'auto';
  promptInput.style.height = `${Math.min(promptInput.scrollHeight, 170)}px`;
  syncSendButtonMode();
}

promptInput?.addEventListener('input', () => {
  resizeTextarea();
  updateComposerCommandPopup();
});
promptInput?.addEventListener('keydown', (e) => {
  if (composerCommandPopup && !composerCommandPopup.hidden && cmdPopupItems.length) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      cmdPopupIndex = (cmdPopupIndex + 1) % cmdPopupItems.length;
      renderComposerCommandPopup();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      cmdPopupIndex = (cmdPopupIndex - 1 + cmdPopupItems.length) % cmdPopupItems.length;
      renderComposerCommandPopup();
      return;
    }
    if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault();
      applyCommandPopupItem(cmdPopupItems[cmdPopupIndex]);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      closeComposerCommandPopup();
      return;
    }
  }
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    composerForm.requestSubmit();
  }
});

composerForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (isListening) stopDictation();
  const hasContent = Boolean((promptInput?.value || '').trim() || attachmentText || attachmentMediaUrl || attachmentName);
  if (!hasContent) {
    openVoiceCall();
    return;
  }
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
  let rafId = 0;

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
    if (state?.ambientBgEnabled === false) {
      rafId = 0;
      ctx.clearRect(0, 0, width, height);
      return;
    }
    rafId = requestAnimationFrame(draw);
    if (document.hidden || !width || !height) return;
    if (now - lastFrame < 33) return;
    lastFrame = now;

    ctx.clearRect(0, 0, width, height);
    const speedFactor = (prefersCalm ? 0.65 : 1) * (isListening ? 1.45 : 1);
    const [r1, g1, b1] = ambientThemeRgb.primary;
    const [r2, g2, b2] = ambientThemeRgb.secondary;

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
        ? `rgba(${r2}, ${g2}, ${b2}, ${(a * 0.85).toFixed(3)})`
        : `rgba(${r1}, ${g1}, ${b1}, ${a.toFixed(3)})`;
      ctx.fill();
    }
  };

  ambientStopFn = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    if (width && height) ctx.clearRect(0, 0, width, height);
  };

  ambientResumeFn = () => {
    resize();
    if (state?.ambientBgEnabled !== false && !rafId) {
      rafId = requestAnimationFrame(draw);
    }
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  if (state?.ambientBgEnabled !== false) {
    rafId = requestAnimationFrame(draw);
  }
}

function initRailHoverFlyout() {
  if (!railFlyout) return;
  let hideTimer = null;
  let activeButton = null;

  const cancelHide = () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  };

  const close = () => {
    cancelHide();
    activeButton = null;
    railFlyout.hidden = true;
    railFlyout.replaceChildren();
    delete railFlyout.dataset.side;
  };
  closeRailFlyoutFn = close;

  const scheduleHide = () => {
    cancelHide();
    hideTimer = setTimeout(close, 220);
  };

  const makeHeader = (titleText, descText = '') => {
    const head = document.createElement('div');
    head.className = 'rail-flyout-head';
    const title = document.createElement('h3');
    title.className = 'rail-flyout-title';
    title.textContent = titleText;
    head.appendChild(title);
    const els = [head];
    if (descText) {
      const p = document.createElement('p');
      p.className = 'rail-flyout-desc';
      p.textContent = descText;
      els.push(p);
    }
    return els;
  };

  const makeActionBtn = (label, metaText, onClick, isCta = false) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = isCta ? 'rail-flyout-cta' : 'rail-flyout-item';
    const span = document.createElement('span');
    span.textContent = label;
    btn.appendChild(span);
    if (metaText && !isCta) {
      const meta = document.createElement('span');
      meta.className = 'rail-flyout-meta';
      meta.textContent = metaText;
      btn.appendChild(meta);
    }
    btn.addEventListener('click', () => {
      close();
      onClick();
    });
    return btn;
  };

  const renderFlyoutContent = (button) => {
    railFlyout.replaceChildren();
    const { railOpen, railClick, railFocus, railNav } = button.dataset;
    const list = document.createElement('div');
    list.className = 'rail-flyout-list';

    if (railOpen === 'left') {
      railFlyout.append(...makeHeader('Lewy panel nawigacji', 'Rozwiń pełny panel rozmów, notatek i modułów AI dla Jezusa.'));
      list.appendChild(makeActionBtn('Rozwiń lewy panel', 'Ctrl+B', () => toggleLeftPanel(), true));
      railFlyout.appendChild(list);
      return;
    }

    if (railOpen === 'right') {
      railFlyout.append(...makeHeader('Twoja przestrzeń', 'Pokaż werset dnia, projekty i połączone aplikacje CC.'));
      list.appendChild(makeActionBtn('Rozwiń prawy panel', 'Ctrl+Shift+B', () => toggleRightPanel(), true));
      railFlyout.appendChild(list);
      return;
    }

    if (railClick === 'newChatBtn') {
      railFlyout.append(...makeHeader('Nowa rozmowa', 'Rozpocznij czat z wybranym asystentem Christian Culture.'));
      list.appendChild(makeActionBtn('+ Nowa rozmowa', '', () => $('#newChatBtn')?.click(), true));
      for (const p of Object.values(AI_PERSONAS)) {
        list.appendChild(makeActionBtn(`Rozmawiaj z: ${p.name}`, p.role || '', () => {
          $('#newChatBtn')?.click();
          $(`.assistant-strip .assistant-pill[data-assistant="${CSS.escape(p.id)}"]`)?.click();
        }));
      }
      railFlyout.appendChild(list);
      return;
    }

    if (railFocus === 'chatSearchInput') {
      railFlyout.append(...makeHeader('Szukaj rozmów', 'Wpisz frazę, aby odfiltrować zapisane rozmowy.'));
      const input = document.createElement('input');
      input.type = 'search';
      input.className = 'rail-flyout-search';
      input.placeholder = 'Szukaj rozmów…';
      input.value = chatSearchInput?.value || '';
      const renderMatches = () => {
        list.replaceChildren();
        const q = input.value.trim().toLowerCase();
        const source = state.chats.length
          ? state.chats.map((c, idx) => ({ title: c.title, idx }))
          : STARTER_CHATS.map((s, idx) => ({ title: s.title, idx }));
        const matched = source.filter((it) => !q || it.title.toLowerCase().includes(q)).slice(0, 6);
        if (!matched.length) {
          const empty = document.createElement('p');
          empty.className = 'rail-flyout-desc';
          empty.textContent = 'Brak pasujących rozmów.';
          list.appendChild(empty);
          return;
        }
        for (const it of matched) {
          list.appendChild(makeActionBtn(it.title, 'Otwórz', () => {
            recentChatsList?.querySelectorAll('.recent-item')?.[it.idx]?.click();
          }));
        }
      };
      input.addEventListener('input', () => {
        if (chatSearchInput) {
          chatSearchInput.value = input.value;
          renderRecentChats();
        }
        renderMatches();
      });
      renderMatches();
      railFlyout.append(input, list);
      return;
    }

    if (railFocus === 'recentHeading') {
      railFlyout.append(...makeHeader('Ostatnie rozmowy', 'Kliknij wątek, aby wrócić od razu do rozmowy.'));
      const liveBtns = Array.from(recentChatsList?.querySelectorAll('.recent-item') || []).slice(0, 6);
      for (const b of liveBtns) {
        const title = b.textContent?.trim() || 'Rozmowa';
        list.appendChild(makeActionBtn(title, 'Otwórz', () => b.click()));
      }
      railFlyout.appendChild(list);
      return;
    }

    if (railNav === 'Czat') {
      railFlyout.append(...makeHeader('Czat i asystenci', `Aktywny tryb: ${currentMode}`));
      for (const p of Object.values(AI_PERSONAS)) {
        const activeMark = getActiveAssistantId() === p.id ? 'Aktywna' : '';
        list.appendChild(makeActionBtn(p.name, activeMark, () => {
          $(`.assistant-strip .assistant-pill[data-assistant="${CSS.escape(p.id)}"]`)?.click();
          if (getActiveThread()?.messages?.length) showConversationView();
          else showWelcomeView();
        }));
      }
      railFlyout.appendChild(list);
      return;
    }

    if (railNav === 'Biblia') {
      railFlyout.append(...makeHeader('Biblia (UBG)', 'Wyszukuj wersety i otwórz MojaBiblia Interlinear.'));
      list.append(
        makeActionBtn('Otwórz moduł Biblia', 'UBG', () => showModuleView('Biblia'), true),
        makeActionBtn('MojaBiblia Interlinear', 'Strong', () => $('.connect-btn[data-app="MojaBiblia"]')?.click()),
        makeActionBtn('Rozważ Rzymian 8:28', 'Pytanie', () => startPromptDirectly('Wyjaśnij znaczenie Rzymian 8:28 według tekstu UBG.', 'Rzymian 8:28', 'Studium Biblijne')),
        makeActionBtn('Rozważ Jana 3:16', 'Pytanie', () => startPromptDirectly('Wyjaśnij kontekst i przesłanie Ewangelii Jana 3:16 (UBG).', 'Jana 3:16', 'Studium Biblijne'))
      );
      railFlyout.appendChild(list);
      return;
    }

    if (railNav === 'Projekty') {
      railFlyout.append(...makeHeader('Projekty', `Liczba projektów: ${state.projects.length}`));
      for (const linkBtn of Array.from($$('#rightSidebar .project-link')).slice(0, 5)) {
        list.appendChild(makeActionBtn(linkBtn.textContent?.trim() || 'Projekt', 'Projekt', () => linkBtn.click()));
      }
      list.appendChild(makeActionBtn('Zobacz wszystkie projekty', 'Moduł', () => showModuleView('Projekty'), true));
      railFlyout.appendChild(list);
      return;
    }

    if (railNav === 'Notatniki') {
      railFlyout.append(...makeHeader('Notatniki i pamięć', `Notatki: ${state.notes.length} · Pamięć: ${state.memory.length}`));
      list.append(
        makeActionBtn('Otwórz Notatniki', `${state.notes.length}`, () => showModuleView('Notatniki'), true),
        makeActionBtn('Otwórz Pamięć AI', `${state.memory.length}`, () => showModuleView('Pamięć'))
      );
      railFlyout.appendChild(list);
      return;
    }

    if (railNav === 'Ustawienia') {
      const bgActive = state.ambientBgEnabled !== false;
      railFlyout.append(...makeHeader('Ustawienia i wygląd', `Animacja tła: ${bgActive ? 'włączona' : 'wyłączona'} (${state.ambientBgColor || DEFAULT_AMBIENT_COLOR})`));
      list.append(
        makeActionBtn(bgActive ? 'Wyłącz animację tła' : 'Włącz animację tła', bgActive ? 'ON' : 'OFF', () => {
          state.ambientBgEnabled = !bgActive;
          saveState();
          applyAmbientBgPreference();
          showToast(state.ambientBgEnabled ? 'Animacja tła włączona.' : 'Animacja tła wyłączona.');
        }),
        makeActionBtn('Otwórz pełne Ustawienia i kolor tła…', '', () => openSettingsModal(), true)
      );
      railFlyout.appendChild(list);
      return;
    }

    if (railNav === 'Mój profil') {
      const label = currentUser && !currentUser.isAnonymous
        ? (currentUser.displayName || currentUser.email || 'Zalogowano (LUMINA)')
        : 'Konto lokalne gościa';
      railFlyout.append(...makeHeader('Mój profil', label));
      list.appendChild(makeActionBtn('Otwórz profil i konto LUMINA', '', () => openProfileModal(), true));
      railFlyout.appendChild(list);
      return;
    }

    if (railFocus === 'verseHeading') {
      const vText = $('.daily-verse')?.textContent?.trim() || '„Zaufaj Panu z całego swego serca...”';
      const vRef = $('.verse-ref')?.textContent?.trim() || 'Przysłów 3,5';
      railFlyout.append(...makeHeader('Werset dnia', vRef));
      const quote = document.createElement('blockquote');
      quote.className = 'rail-flyout-verse';
      quote.textContent = vText;
      list.appendChild(makeActionBtn('Rozważ ten werset z AI', 'Czat', () => $('.space-card')?.click(), true));
      railFlyout.append(quote, list);
      return;
    }

    if (railFocus === 'projectsHeading') {
      railFlyout.append(...makeHeader('Aktywne projekty', 'Kliknij projekt, aby otworzyć powiązane treści.'));
      for (const linkBtn of Array.from($$('#rightSidebar .project-link')).slice(0, 5)) {
        list.appendChild(makeActionBtn(linkBtn.textContent?.trim() || 'Projekt', 'Otwórz', () => linkBtn.click()));
      }
      list.appendChild(makeActionBtn('Wszystkie projekty →', '', () => showModuleView('Projekty'), true));
      railFlyout.appendChild(list);
      return;
    }

    if (railFocus === 'integrationsHeading') {
      railFlyout.append(...makeHeader('Połączone aplikacje', 'Szybki dostęp do aplikacji Christian Culture i narzędzi.'));
      for (const btn of Array.from($$('#rightSidebar .connect-btn')).slice(0, 6)) {
        const appName = btn.dataset.app || 'Aplikacja';
        const statusText = btn.textContent?.trim() || 'Połącz';
        list.appendChild(makeActionBtn(appName, statusText, () => btn.click()));
      }
      list.appendChild(makeActionBtn('Zobacz więcej integracji →', '', () => showModuleView('Połączenia'), true));
      railFlyout.appendChild(list);
    }
  };

  const openForButton = (button) => {
    if (state?.railHoverPreview === false) return;
    const isLeft = Boolean(button.closest('#leftSidebar'));
    const collapsed = isLeft
      ? document.body.classList.contains('left-collapsed')
      : document.body.classList.contains('right-collapsed');
    if (!collapsed || isLeftOverlayMode() || (!isLeft && isRightOverlayMode())) return;

    cancelHide();
    activeButton = button;
    renderFlyoutContent(button);
    railFlyout.dataset.side = isLeft ? 'left' : 'right';
    railFlyout.hidden = false;

    const btnRect = button.getBoundingClientRect();
    const flyHeight = railFlyout.offsetHeight || 220;
    const maxTop = Math.max(12, window.innerHeight - flyHeight - 12);
    const clampedTop = Math.max(12, Math.min(Math.round(btnRect.top), maxTop));
    railFlyout.style.top = `${clampedTop}px`;
  };

  $$('.panel-rail-btn').forEach((button) => {
    button.addEventListener('mouseenter', () => openForButton(button));
    button.addEventListener('mouseleave', scheduleHide);
    button.addEventListener('click', () => close());
  });

  railFlyout.addEventListener('mouseenter', cancelHide);
  railFlyout.addEventListener('mouseleave', scheduleHide);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !railFlyout.hidden) close();
  });
  window.addEventListener('resize', () => {
    if (!railFlyout.hidden && activeButton) openForButton(activeButton);
  }, { passive: true });
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

function bindFallbackImages() {
  for (const img of document.querySelectorAll('img[data-fallback-src]')) {
    const fallbackSrc = img.dataset.fallbackSrc;
    if (!fallbackSrc) continue;
    const applyFallback = () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = '1';
      img.src = fallbackSrc;
    };
    img.addEventListener('error', applyFallback, { once: true });
    if (img.complete && img.naturalWidth === 0) {
      applyFallback();
    }
  }
}

// Inicjalizacja
bindFallbackImages();
applyPreferencesFromState();
ensureAiGtagLoaded();
hydrateAvailableModels();
syncProBadge();
updatePersonalizedHero();
renderRecentChats();
renderRightProjects();
checkDueReminders();
setInterval(checkDueReminders, 30000);
hydrateDailyVerse();
initLuminaAuthConnector();
initAmbientCanvas();
initRailHoverFlyout();
initCardSpotlights();
initPromptCascade();
