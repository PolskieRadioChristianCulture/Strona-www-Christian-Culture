const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const promptInput = $('#prompt');
const composerForm = $('#composerForm');
const welcomeStage = $('#welcomeStage');
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
const attachBtn = $('#attachBtn');
const fileInput = $('#fileInput');
const attachmentChip = $('#attachmentChip');
const infoDialog = $('#infoDialog');
const infoDialogTitle = $('#infoDialogTitle');
const infoDialogBody = $('#infoDialogBody');
const toastEl = $('#toast');

let toastTimer = null;
let selectedFileName = '';

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 3200);
}

function openDialog(title, text) {
  infoDialogTitle.textContent = title;
  infoDialogBody.replaceChildren();
  const p = document.createElement('p');
  p.textContent = text;
  infoDialogBody.appendChild(p);
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

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDrawers();
    modelMenu.hidden = true;
    toolsMenu.hidden = true;
    modelPickerBtn?.setAttribute('aria-expanded', 'false');
    toolsBtn?.setAttribute('aria-expanded', 'false');
  }
});

// Wybór trybu AI (CC Auto)
modelPickerBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  const next = modelMenu.hidden;
  toolsMenu.hidden = true;
  modelMenu.hidden = !next;
  modelPickerBtn.setAttribute('aria-expanded', String(next));
});

$$('#modelMenu .dropdown-option').forEach((opt) => {
  opt.addEventListener('click', () => {
    $$('#modelMenu .dropdown-option').forEach((o) => o.classList.remove('active'));
    opt.classList.add('active');
    activeModelLabel.textContent = opt.dataset.model || 'CC Auto';
    modelMenu.hidden = true;
    modelPickerBtn.setAttribute('aria-expanded', 'false');
    showToast(`Wybrano tryb: ${activeModelLabel.textContent}`);
  });
});

// Menu narzędzi
toolsBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  const next = toolsMenu.hidden;
  modelMenu.hidden = true;
  toolsMenu.hidden = !next;
  toolsBtn.setAttribute('aria-expanded', String(next));
});

$$('#toolsMenu .dropdown-option').forEach((opt) => {
  opt.addEventListener('click', () => {
    toolsMenu.hidden = true;
    toolsBtn.setAttribute('aria-expanded', 'false');
    showToast(`Narzędzie "${opt.dataset.tool}" gotowe po podpięciu silnika AI.`);
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

// Tryb prywatny
privacyToggleBtn?.addEventListener('click', () => {
  const checked = privacyToggleBtn.getAttribute('aria-checked') === 'true';
  const next = !checked;
  privacyToggleBtn.setAttribute('aria-checked', String(next));
  showToast(next ? 'Włączono tryb prywatny (bez zapisu historii).' : 'Wyłączono tryb prywatny.');
});

// Wyszukiwanie w sieci
webSearchBtn?.addEventListener('click', () => {
  const pressed = webSearchBtn.getAttribute('aria-pressed') === 'true';
  webSearchBtn.setAttribute('aria-pressed', String(!pressed));
  showToast(!pressed ? 'Wyszukiwanie w sieci aktywne.' : 'Wyszukiwanie w sieci wyłączone.');
});

// Pomoc
$('#helpBtn')?.addEventListener('click', () => {
  openDialog(
    'AI dla Jezusa — Wersja Makiety UI (BETA)',
    'Ten ekran to wierne odwzorowanie wizualne makiety interfejsu „AI dla Jezusa” Christian Culture pod adresem /ai/. W kolejnym kroku zostanie połączony z silnikiem backendowym AI, pamięcią rozmów, bazą wiedzy biblijnej oraz narzędziami MCP.'
  );
});

// Nawigacja w lewym panelu
$$('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.nav-item').forEach((b) => {
      b.classList.remove('active');
      b.removeAttribute('aria-current');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-current', 'page');

    const label = btn.dataset.nav || 'Czat';
    if (label === 'Czat') {
      welcomeStage.hidden = false;
      conversationStage.hidden = true;
    } else {
      welcomeStage.hidden = true;
      conversationStage.hidden = false;
      renderSystemNotice(
        `Moduł: ${label}`,
        `Widok „${label}” jest przygotowany w makiecie interfejsu. Pełna obsługa modułu zostanie uruchomiona po podpięciu backendu AI.`
      );
    }
    closeDrawers();
  });
});

// Nowa rozmowa
$('#newChatBtn')?.addEventListener('click', () => {
  $$('.nav-item').forEach((b) => {
    const isChat = b.dataset.nav === 'Czat';
    b.classList.toggle('active', isChat);
    if (isChat) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  conversationLog.replaceChildren();
  conversationStage.hidden = true;
  welcomeStage.hidden = false;
  promptInput.value = '';
  clearAttachment();
  resizeTextarea();
  promptInput.focus();
  closeDrawers();
});

// Filtrowanie ostatnich rozmów
chatSearchInput?.addEventListener('input', () => {
  const q = chatSearchInput.value.trim().toLowerCase();
  $$('#recentChats li').forEach((li) => {
    const text = li.textContent.toLowerCase();
    li.hidden = Boolean(q && !text.includes(q));
  });
});

// Ostatnie rozmowy + projekty
$$('.recent-item, .project-link').forEach((btn) => {
  btn.addEventListener('click', () => {
    const title = btn.dataset.chat || btn.dataset.project || 'Rozmowa';
    welcomeStage.hidden = true;
    conversationStage.hidden = false;
    renderSystemNotice(
      title,
      `Wybrano pozycję „${title}”. Po podpięciu bazy historii w kolejnym etapie w tym miejscu otworzy się zapisany wątek i powiązane notatki.`
    );
    closeDrawers();
  });
});

// Stopka lewego panelu
$$('.footer-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.nav || 'Opcje';
    openDialog(name, `Panel „${name}” będzie zintegrowany z kontem użytkownika po wdrożeniu backendu.`);
    closeDrawers();
  });
});

// Połączone aplikacje
$$('.connect-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const appName = btn.dataset.app || 'Aplikacja';
    const isConnected = btn.classList.toggle('connected');
    btn.textContent = isConnected ? 'Połączono' : 'Połącz';
    showToast(isConnected ? `Zaznaczono integrację: ${appName}` : `Odłączono integrację: ${appName}`);
  });
});

$('#allProjectsLink')?.addEventListener('click', () => {
  openDialog('Aktywne projekty', 'Lista projektów („Studium Listu do Rzymian”, „Plan treści – grudzień”, „Cykl: Nadzieja w Piśmie”) zostanie połączona z pamięcią projektową w następnym etapie.');
});

$('#moreIntegrationsLink')?.addEventListener('click', () => {
  openDialog('Integracje ekosystemu Christian Culture', 'Docelowe integracje MCP obejmują: Biblię Audio CC, MojaBiblia, Google Calendar, GitHub oraz narzędzia redakcyjne Christian Culture.');
});

// Karty propozycji
$$('.prompt-card').forEach((card) => {
  card.addEventListener('click', () => {
    promptInput.value = card.dataset.prompt || '';
    resizeTextarea();
    promptInput.focus();
  });
});

// Załączniki i mikrofon
attachBtn?.addEventListener('click', () => fileInput?.click());
fileInput?.addEventListener('change', () => {
  const f = fileInput.files?.[0];
  if (!f) return;
  selectedFileName = f.name;
  attachmentChip.replaceChildren();
  const label = document.createElement('span');
  label.textContent = `Załącznik: ${selectedFileName}`;
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '×';
  removeBtn.setAttribute('aria-label', 'Usuń załącznik');
  removeBtn.onclick = clearAttachment;
  attachmentChip.append(label, removeBtn);
  attachmentChip.hidden = false;
});

function clearAttachment() {
  selectedFileName = '';
  if (fileInput) fileInput.value = '';
  attachmentChip.hidden = true;
  attachmentChip.replaceChildren();
}

$('#micBtn')?.addEventListener('click', () => {
  showToast('Dyktowanie głosowe zostanie podpięte wraz z modułem audio.');
});

// Kompozytor
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

function renderSystemNotice(heading, bodyText) {
  conversationLog.replaceChildren();
  const aiBubble = document.createElement('article');
  aiBubble.className = 'chat-bubble-ai';
  const head = document.createElement('div');
  head.className = 'chat-bubble-ai-head';
  head.textContent = heading;
  const body = document.createElement('p');
  body.textContent = bodyText;
  aiBubble.append(head, body);
  conversationLog.appendChild(aiBubble);
}

composerForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = promptInput.value.trim();
  if (!text && !selectedFileName) {
    promptInput.focus();
    return;
  }

  welcomeStage.hidden = true;
  conversationStage.hidden = false;

  const userBubble = document.createElement('article');
  userBubble.className = 'chat-bubble-user';
  userBubble.textContent = selectedFileName ? `[${selectedFileName}]\n${text}` : text;

  const aiBubble = document.createElement('article');
  aiBubble.className = 'chat-bubble-ai';
  const head = document.createElement('div');
  head.className = 'chat-bubble-ai-head';
  head.textContent = `AI dla Jezusa · ${activeModelLabel.textContent} (Makieta UI)`;
  const body = document.createElement('p');
  body.textContent = 'Twoja wiadomość została przyjęta przez interfejs makiety /ai/. Silnik odpowiedzi AI i baza biblijna nie są jeszcze podpięte — ten ekran służy do weryfikacji układu wizualnego przed kolejnym krokiem wdrożenia.';
  aiBubble.append(head, body);

  conversationLog.append(userBubble, aiBubble);
  promptInput.value = '';
  clearAttachment();
  resizeTextarea();
});
