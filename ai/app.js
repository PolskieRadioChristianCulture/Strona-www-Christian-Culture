const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const STORAGE_PREFIX = 'cc_ai_dla_jezusa_v2';
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
let busy = false;
let toastTimer = null;
let recognition = null;
let isListening = false;

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
    projects: [...DEFAULT_PROJECTS]
  };
  try {
    const raw = JSON.parse(localStorage.getItem(getStorageKey(uid)) || localStorage.getItem(STORAGE_PREFIX) || 'null');
    if (!raw || typeof raw !== 'object') return empty;
    return {
      chats: Array.isArray(raw.chats) ? raw.chats.slice(0, 40) : [],
      notes: Array.isArray(raw.notes) ? raw.notes.slice(0, 60) : [],
      memory: Array.isArray(raw.memory) ? raw.memory.slice(0, 20) : [],
      projects: Array.isArray(raw.projects) && raw.projects.length ? raw.projects.slice(0, 20) : [...DEFAULT_PROJECTS]
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

function closeDrawers() {
  document.body.classList.remove('left-drawer-open', 'right-drawer-open');
  scrim.hidden = true;
  openLeftBtn?.setAttribute('aria-expanded', 'false');
  openRightBtn?.setAttribute('aria-expanded', 'false');
}

function openLeftDrawer() {
  closeDrawers();
  document.body.classList.add('left-drawer-open');
  scrim.hidden = false;
  openLeftBtn?.setAttribute('aria-expanded', 'true');
}

function openRightDrawer() {
  closeDrawers();
  document.body.classList.add('right-drawer-open');
  scrim.hidden = false;
  openRightBtn?.setAttribute('aria-expanded', 'true');
}

openLeftBtn?.addEventListener('click', openLeftDrawer);
closeLeftBtn?.addEventListener('click', closeDrawers);
openRightBtn?.addEventListener('click', openRightDrawer);
closeRightBtn?.addEventListener('click', closeDrawers);
scrim?.addEventListener('click', closeDrawers);
$('#closeDialogBtn')?.addEventListener('click', () => infoDialog.close());

infoDialog?.addEventListener('click', (e) => {
  if (e.target === infoDialog) infoDialog.close();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
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

function renderConversation() {
  conversationLog.replaceChildren();
  const thread = getActiveThread();
  if (!thread || !thread.messages.length) {
    showWelcomeView();
    return;
  }

  for (let i = 0; i < thread.messages.length; i += 1) {
    const msg = thread.messages[i];
    if (msg.role === 'user') {
      const userBubble = document.createElement('article');
      userBubble.className = 'chat-bubble-user';
      userBubble.textContent = msg.attachmentName ? `[${msg.attachmentName}]\n${msg.text}` : msg.text;
      conversationLog.appendChild(userBubble);
    } else {
      const aiBubble = document.createElement('article');
      aiBubble.className = 'chat-bubble-ai';

      const head = document.createElement('div');
      head.className = 'chat-bubble-ai-head';
      const titleSpan = document.createElement('span');
      titleSpan.textContent = 'AI dla Jezusa';
      const badgeSpan = document.createElement('span');
      badgeSpan.className = 'provider-badge';
      badgeSpan.textContent = `${providerLabel(msg.provider)} · ${msg.mode || currentMode}`;
      head.append(titleSpan, badgeSpan);
      aiBubble.appendChild(head);

      aiBubble.appendChild(renderMarkdownSafe(msg.text));

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

      actions.append(copyBtn, saveNoteBtn);

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
    const loading = document.createElement('article');
    loading.className = 'chat-bubble-ai typing-bubble';
    loading.innerHTML = '<div class="chat-bubble-ai-head"><span>AI dla Jezusa</span><span class="provider-badge">Analiza</span></div><p class="typing-line"><span class="typing-dots" aria-hidden="true"><i></i><i></i><i></i></span> Sprawdzam źródła Christian Culture i przygotowuję odpowiedź...</p>';
    conversationLog.appendChild(loading);
  }

  const scroller = $('.stage-scroll');
  if (scroller) scroller.scrollTop = scroller.scrollHeight;
}

// ================= WYSYŁANIE ZAPYTANIA DO PRAWDZIWEGO API =================
async function sendChatMessage(textOverride, titleHint = '') {
  if (busy) return;
  const rawText = (typeof textOverride === 'string' ? textOverride : promptInput.value).trim();
  if (!rawText && !attachmentText) {
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

  thread.messages.push({
    id: 'u-' + Date.now(),
    role: 'user',
    text: rawText || `Przeanalizuj załączony plik (${currentAttName}).`,
    attachmentName: currentAttName
  });

  if (typeof textOverride !== 'string') {
    promptInput.value = '';
    clearAttachment();
    resizeTextarea();
  }

  busy = true;
  sendBtn.disabled = true;
  showConversationView();

  try {
    const activeTools = [...selectedTools];
    if (webSearchEnabled) activeTools.push('Przeszukiwanie CC');

    const headers = { 'Content-Type': 'application/json' };
    if (byokConfig.provider && byokConfig.apiKey) {
      headers['X-User-AI-Provider'] = byokConfig.provider;
      headers['X-User-AI-Key'] = byokConfig.apiKey;
    }

    const res = await fetch('/api/ai-dla-jezusa/v1/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: rawText,
        history: historySnapshot,
        mode: currentMode,
        module: currentNav,
        attachmentName: currentAttName,
        attachmentText: currentAttText,
        tools: activeTools,
        memoryNotes: privateMode ? [] : state.memory.map((m) => m.text),
        privateMode,
        userModel: byokConfig.model || ''
      })
    });
    const data = await res.json();

    if (!res.ok || !data?.ok) {
      throw new Error(data?.detail || data?.error || `HTTP ${res.status}`);
    }

    thread.messages.push({
      id: 'a-' + Date.now(),
      role: 'assistant',
      text: data.reply,
      provider: data.provider || 'cc-knowledge-hub',
      mode: data.mode || currentMode,
      sources: Array.isArray(data.sources) ? data.sources : []
    });
    thread.updatedAt = new Date().toISOString();
    if (!privateMode) {
      saveState();
      renderRecentChats();
    }
  } catch (err) {
    thread.messages.push({
      id: 'err-' + Date.now(),
      role: 'assistant',
      text: `Nie udało się uzyskać odpowiedzi z serwera (${err.message}). Spróbuj ponownie za chwilę lub sprawdź połączenie z internetem.`,
      provider: 'guard',
      mode: currentMode,
      sources: []
    });
  } finally {
    busy = false;
    sendBtn.disabled = false;
    renderConversation();
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
    sub.textContent = 'Wybierz wyspecjalizowanego asystenta Christian Culture, aby rozpocząć ukierunkowaną rozmowę.';
    const grid = document.createElement('div');
    grid.className = 'module-grid';
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
    sub.textContent = 'Rzeczywisty status backendu AI dla Jezusa, indeksu wiedzy i serwera MCP Christian Culture.';
    const box = document.createElement('div');
    box.className = 'module-grid';
    const loading = document.createElement('p');
    loading.className = 'module-empty';
    loading.textContent = 'Sprawdzam połączenie z backendem /api/ai-dla-jezusa/v1...';
    box.appendChild(loading);
    moduleStage.appendChild(box);

    Promise.all([
      fetch('/api/ai-dla-jezusa/v1/health').then((r) => r.json()).catch(() => null),
      fetch('/api/ai-dla-jezusa/v1/chat').then((r) => r.json()).catch(() => null)
    ]).then(([health, chatStatus]) => {
      box.replaceChildren();
      const items = [
        {
          title: 'Indeks Wiedzy CC + RAG',
          desc: health ? `Aktywny · ${health.index_documents} zweryfikowanych dokumentów (${health.governance})` : 'Brak odpowiedzi endpointu /health',
          href: '/wyszukiwarka',
          linkText: 'Wyszukiwarka CC ↗'
        },
        {
          title: 'Silnik Konwersacyjny AI',
          desc: chatStatus ? `Gemini: ${chatStatus.providersConfigured?.gemini ? 'Aktywny ✓' : 'Wyłączony'} · Baza CC Fallback: Aktywny ✓ · Koszt: 0 zł` : 'Brak odpowiedzi /chat',
          href: '/biblia-audio',
          linkText: 'Biblia Audio CC ↗'
        },
        {
          title: 'Zdalny Serwer MCP (Read-Only)',
          desc: 'Endpoint JSON-RPC 2.0: https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp (narzędzia: cc_search, cc_find_scripture, cc_get_source_policy)',
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
    });
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
    const label = currentUser.displayName || currentUser.email || 'Konto LUMINA';
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
    if (currentNav === 'Czat') showWelcomeView();
    else renderModule(currentNav);
  }
  updateProfileFooterButton();
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
  byokIntro.textContent = 'Domyślnie korzystasz z darmowych zasobów Christian Culture (0 zł). Jeśli chcesz podpiąć tu także swój własny klucz (OpenRouter, GPT, Gemini, Groq), jest on zapisywany wyłącznie w Twojej przeglądarce:';

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
    info.textContent = `Zalogowano jako: ${currentUser.displayName || 'Użytkownik LUMINA'} (${currentUser.email || 'konto Google'}). Twoja historia, notatki, projekty i pamięć są odizolowane dla tego konta.`;

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

// Załącznik tekstowy
attachBtn?.addEventListener('click', () => fileInput?.click());
fileInput?.addEventListener('change', async () => {
  const f = fileInput.files?.[0];
  if (!f) return;
  attachmentName = f.name;
  try {
    if (/\.(txt|md|csv|json|html?|xml)$/i.test(f.name) || f.type.startsWith('text/')) {
      const txt = await f.text();
      attachmentText = txt.slice(0, 12_000);
    } else {
      attachmentText = '';
      showToast('Bezpośrednia analiza działa dla plików tekstowych (.txt, .md, .csv, .json). Dla PDF wklej fragment tekstu.');
    }
  } catch {
    attachmentText = '';
  }

  attachmentChip.replaceChildren();
  const label = document.createElement('span');
  label.textContent = attachmentText ? `Załącznik (${attachmentName} · wczytano treść)` : `Załącznik: ${attachmentName}`;
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '×';
  removeBtn.setAttribute('aria-label', 'Usuń załącznik');
  removeBtn.onclick = clearAttachment;
  attachmentChip.append(label, removeBtn);
  attachmentChip.hidden = false;
});

function clearAttachment() {
  attachmentName = '';
  attachmentText = '';
  if (fileInput) fileInput.value = '';
  attachmentChip.hidden = true;
  attachmentChip.replaceChildren();
}

// Dyktowanie głosowe Web Speech API
micBtn?.addEventListener('click', () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    showToast('Twoja przeglądarka nie obsługuje rozpoznawania mowy.');
    return;
  }
  if (isListening && recognition) {
    recognition.stop();
    return;
  }
  recognition = new SR();
  recognition.lang = 'pl-PL';
  recognition.interimResults = false;
  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add('mic-listening');
    showToast('Słucham... Mów po polsku.');
  };
  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript || '';
    if (transcript) {
      promptInput.value = (promptInput.value ? `${promptInput.value} ` : '') + transcript;
      resizeTextarea();
      promptInput.focus();
    }
  };
  recognition.onerror = () => {
    showToast('Nie udało się rozpoznać mowy.');
  };
  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove('mic-listening');
  };
  recognition.start();
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
  sendChatMessage();
});

// Inicjalizacja
renderRecentChats();
renderRightProjects();
hydrateDailyVerse();
initLuminaAuthConnector();
