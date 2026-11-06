// ============================================================================
// CHRISTIAN CULTURE MISSION CALENDAR v1.1 — Frontend Application (/ccMC/app.js)
// Adres: https://polskieradio.cc/ccMC | API: /api/mission-calendar/*
// ============================================================================

const STATUS_META = {
  todo: { code: 'todo', color: '#2563EB', icon: '○', label: 'Do wykonania' },
  in_progress: { code: 'in_progress', color: '#D97706', icon: '◐', label: 'W trakcie' },
  done: { code: 'done', color: '#15803D', icon: '✓', label: 'Zrealizowane' },
  not_done: { code: 'not_done', color: '#B91C1C', icon: '!', label: 'Niezrealizowane' },
};

const AREA_COLORS = {
  mission: '#a78bfa',
  radio: '#38bdf8',
  media: '#f59e0b',
  social: '#fb7185',
  agents: '#8b5cf6',
  oa: '#C4A35A',
  automation: '#10b981',
  tech: '#60a5fa',
  people: '#f472b6',
  guardian: '#94a3b8',
};

const PRIO_LABELS = { 1: 'P0', 2: 'P1', 3: 'P2', 4: 'P3' };

const state = {
  user: null,
  csrfToken: '',
  bearerToken: '',
  events: [],
  agents: [],
  audit: [],
  view: window.innerWidth < 768 ? 'agenda' : 'week',
  category: 'all',
  statusFilter: 'all',
  assigneeFilter: 'all',
  searchQuery: '',
  anchorDate: new Date(),
  editingEvent: null,
  nlDraft: null,
  undoAction: null,
  undoTimer: null,
  error: '',
  notice: '',
  mobileSidebarOpen: false,
};

async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (state.csrfToken) headers['X-CC-CSRF'] = state.csrfToken;
  if (state.bearerToken) headers['Authorization'] = `Bearer ${state.bearerToken}`;

  const res = await fetch(`/api/mission-calendar${path}`, {
    credentials: 'same-origin',
    ...options,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Błąd HTTP ${res.status}`);
    err.status = res.status;
    err.serverEvent = data.serverEvent || null;
    throw err;
  }
  return data;
}

function toWarsawInput(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return '';
  const formatted = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(d);
  return formatted.replace(' ', 'T');
}

function formatWarsawShort(isoStr) {
  if (!isoStr) return '';
  return new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoStr));
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function tryLuminaBridgeSession() {
  try {
    if (window.firebase?.auth) {
      const currentUser = window.firebase.auth().currentUser;
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        state.bearerToken = idToken;
        const sessionRes = await apiRequest('/auth/session', {
          method: 'POST',
          body: JSON.stringify({ idToken }),
        });
        state.user = sessionRes.user;
        state.csrfToken = sessionRes.csrfToken || '';
        return true;
      }
    }
  } catch (e) {
    state.error = e.message;
  }
  return false;
}

async function loadInitialSession() {
  try {
    const me = await apiRequest('/me');
    if (me.authenticated && me.user) {
      state.user = me.user;
      state.csrfToken = me.csrfToken || '';
      await refreshData();
      render();
      return;
    }
  } catch (e) {
    if (e.status === 403) state.error = e.message;
  }

  // Nasłuchuj na sesję LUMINA (js/cc-global-auth.js)
  window.addEventListener('cc-auth-changed', async (ev) => {
    if (ev.detail?.user && !state.user) {
      const ok = await tryLuminaBridgeSession();
      if (ok) {
        await refreshData();
        render();
      }
    }
  });
  setTimeout(async () => {
    if (!state.user && (await tryLuminaBridgeSession())) {
      await refreshData();
      render();
    }
  }, 900);
  render();
}

async function refreshData() {
  try {
    const from = new Date(state.anchorDate.getTime() - 35 * 86400_000).toISOString();
    const to = new Date(state.anchorDate.getTime() + 65 * 86400_000).toISOString();
    const [evRes, agRes, audRes] = await Promise.all([
      apiRequest(`/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&expand=true`),
      apiRequest('/agents').catch(() => ({ agents: [] })),
      apiRequest('/audit').catch(() => ({ audit: [] })),
    ]);
    state.events = evRes.events || [];
    state.agents = agRes.agents || [];
    state.audit = audRes.audit || [];
  } catch (e) {
    state.error = e.message;
  }
}

function setUndoAction(label, revertFn) {
  if (state.undoTimer) clearTimeout(state.undoTimer);
  state.undoAction = { label, revertFn };
  state.undoTimer = setTimeout(() => {
    state.undoAction = null;
    render();
  }, 10000);
  render();
}

async function moveOrResizeEvent(ev, newStartIso, newEndIso, scopeChoice = null) {
  const prevStart = ev.starts_at;
  const prevEnd = ev.ends_at;
  const targetId = ev.series_id || ev.id;

  // Jeżeli to wystąpienie serii cyklicznej, spytaj czy zmienić tylko to wystąpienie czy całą serię
  if (ev.rrule && ev.occurrence_id && !scopeChoice) {
    const onlySingle = window.confirm(
      'To jest zadanie cykliczne.\nKliknij OK, aby przesunąć TYLKO TO WYSTĄPIENIE.\nKliknij Anuluj, aby przesunąć CAŁĄ SERIĘ.'
    );
    scopeChoice = onlySingle ? 'single' : 'series';
  }

  try {
    if (scopeChoice === 'single' && ev.occurrence_id) {
      await apiRequest(`/events/${encodeURIComponent(targetId)}/occurrences/${encodeURIComponent(ev.occurrence_id)}/override`, {
        method: 'POST',
        body: JSON.stringify({
          original_start: ev.original_start || prevStart,
          starts_at: newStartIso,
          ends_at: newEndIso,
        }),
      });
    } else {
      await apiRequest(`/events/${encodeURIComponent(targetId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          starts_at: newStartIso,
          ends_at: newEndIso,
          version: ev.version,
        }),
      });
    }
    await refreshData();
    setUndoAction(`Przesunięto „${ev.title}”`, async () => {
      await apiRequest(`/events/${encodeURIComponent(targetId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          starts_at: prevStart,
          ends_at: prevEnd,
          version: (ev.version || 1) + 1,
        }),
      });
      await refreshData();
      state.undoAction = null;
      render();
    });
  } catch (err) {
    state.error = err.status === 409
      ? `Konflikt edycji (409): zadanie zostało zmienione na serwerze. Przywrócono pozycję.`
      : `Nie udało się zapisać zmiany (${err.message}). Przywrócono pozycję.`;
    await refreshData();
    render();
  }
}

async function enableWebPush() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Przeglądarka nie obsługuje Web Push.');
    }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      throw new Error('Nie przyznano zgody na powiadomienia.');
    }
    const reg = await navigator.serviceWorker.register('/ccMC/sw-ccmc.js', { scope: '/ccMC/' });
    const { key } = await apiRequest('/push/public-key');
    const b64 = key.replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, '='));
    const applicationServerKey = Uint8Array.from(raw, (c) => c.charCodeAt(0));
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
    await apiRequest('/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(sub.toJSON ? sub.toJSON() : sub),
    });
    state.notice = 'Powiadomienia Web Push zostały aktywowane (cisza nocna 23:00–07:00).';
    render();
  } catch (err) {
    state.error = err.message;
    render();
  }
}

function getFilteredEvents() {
  return state.events.filter((ev) => {
    if (state.category !== 'all' && ev.category !== state.category) return false;
    if (state.statusFilter !== 'all' && ev.status !== state.statusFilter) return false;
    if (state.assigneeFilter !== 'all' && (ev.assigned_to || '') !== state.assigneeFilter) return false;
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const hay = `${ev.title} ${ev.description || ''} ${ev.assigned_to || ''} ${ev.project_id || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderEventTileHtml(ev) {
  const st = STATUS_META[ev.status] || STATUS_META.todo;
  const areaColor = AREA_COLORS[ev.category] || '#C4A35A';
  const prio = PRIO_LABELS[ev.priority] || 'P1';
  const keyId = escapeHtml(ev.occurrence_id || ev.id);

  return `
    <article
      class="mc-event-tile"
      draggable="true"
      tabindex="0"
      data-event-key="${keyId}"
      data-event-id="${escapeHtml(ev.id)}"
      style="background:${st.color}; border-left-color:${areaColor};"
      aria-label="${escapeHtml(`${st.label}: ${ev.title}, ${formatWarsawShort(ev.starts_at)}`)}"
    >
      <div class="mc-event-meta">
        <span title="Status: ${escapeHtml(st.label)}">${st.icon} ${escapeHtml(st.label)}</span>
        <span class="mc-prio-badge">${prio}</span>
        ${ev.overdue ? '<span class="mc-overdue-badge">PO TERMINIE</span>' : ''}
        ${ev.review_state === 'awaiting_review' ? '<span class="mc-overdue-badge">DO AKCEPTACJI</span>' : ''}
        ${ev.rrule ? '<span title="Zadanie cykliczne">↻</span>' : ''}
      </div>
      <strong>${escapeHtml(ev.title)}</strong>
      <small>${escapeHtml(formatWarsawShort(ev.starts_at))} ${ev.assigned_to ? '· ' + escapeHtml(ev.assigned_to) : ''}</small>
      <div class="mc-event-meta">
        <button type="button" class="mc-tile-action" data-action="edit" data-key="${keyId}" style="min-height:32px;padding:2px 8px;font-size:11px;">Edytuj</button>
        <button type="button" class="mc-tile-action" data-action="shift-plus" data-key="${keyId}" style="min-height:32px;padding:2px 8px;font-size:11px;" title="Przesuń o +30 min">+30m</button>
        <button type="button" class="mc-tile-action" data-action="extend" data-key="${keyId}" style="min-height:32px;padding:2px 8px;font-size:11px;" title="Wydłuż o +30 min">↕ +30m</button>
      </div>
    </article>
  `;
}

function renderBoardContent(filtered) {
  if (state.view === 'kanban') {
    return `
      <div class="mc-kanban-grid" role="region" aria-label="Tablica Kanban 4 statusów">
        ${Object.values(STATUS_META)
          .map((st) => {
            const colEvents = filtered.filter((e) => e.status === st.code);
            return `
              <div class="mc-day-col" data-drop-status="${st.code}">
                <div class="mc-day-header">
                  <span>${st.icon} ${escapeHtml(st.label)}</span>
                  <span>(${colEvents.length})</span>
                </div>
                ${colEvents.map(renderEventTileHtml).join('') || '<small style="color:var(--mc-muted)">Brak zadań</small>'}
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  }

  if (state.view === 'agenda' || state.view === 'day') {
    const sorted = [...filtered].sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
    return `
      <div style="display:grid;gap:10px;" role="region" aria-label="Widok agendy i osi dnia">
        ${sorted.map(renderEventTileHtml).join('') || '<p style="color:var(--mc-muted)">Brak zaplanowanych zadań w wybranym widoku. Kliknij „＋ Nowe zadanie” lub wpisz polecenie dla Noemi @077 powyżej.</p>'}
      </div>
    `;
  }

  if (state.view === 'agents') {
    return `
      <div style="display:grid;gap:18px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <h3 style="margin:0;">Orkiestra Agentów @777 / @OA (${state.agents.length})</h3>
          <button type="button" id="btnRegisterAgent" class="mc-btn-gold">＋ Wygeneruj token dla Agenta</button>
        </div>
        <div class="mc-week-grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr));">
          ${state.agents
            .map(
              (ag) => `
            <div class="mc-stat-card">
              <strong>${escapeHtml(ag.name)}</strong>
              <span>Zakresy: ${escapeHtml((ag.scopes || []).join(', '))}</span>
              <span>Limit równoległy: ${ag.max_parallel}</span>
            </div>
          `
            )
            .join('') || '<p style="color:var(--mc-muted)">Brak zarejestrowanych tokenów agentowych. Kliknij „Wygeneruj token dla Agenta”.</p>'}
        </div>
        <h3 style="margin:10px 0 0;">Dziennik Audytu (Audit Log)</h3>
        <div style="display:grid;gap:6px;max-height:320px;overflow-y:auto;">
          ${state.audit
            .slice(0, 30)
            .map(
              (a) => `
            <div style="font-size:12px;padding:8px 12px;background:#0b131e;border-radius:8px;border:1px solid rgba(255,255,255,0.07);">
              <strong>${escapeHtml(a.action.toUpperCase())}</strong> · ${escapeHtml(a.actor_type)}:${escapeHtml(a.actor_id)} → ${escapeHtml(a.entity)} (${escapeHtml(a.entity_id)})
              <span style="color:var(--mc-muted);float:right;">${escapeHtml(formatWarsawShort(a.created_at))}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  // Widok tygodniowy / miesięczny (7 kolumn od poniedziałku)
  const base = new Date(state.anchorDate);
  const dow = (base.getDay() + 6) % 7;
  const monday = new Date(base.getTime() - dow * 86400_000);
  monday.setHours(0, 0, 0, 0);
  const daysCount = state.view === 'month' ? 14 : 7;
  const cols = [];
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(monday.getTime() + i * 86400_000);
    const dayIsoPrefix = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Warsaw',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
    const dayLabel = new Intl.DateTimeFormat('pl-PL', {
      timeZone: 'Europe/Warsaw',
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    }).format(d);
    const dayEvents = filtered.filter((ev) => toWarsawInput(ev.starts_at).startsWith(dayIsoPrefix));
    cols.push(`
      <div class="mc-day-col" data-drop-date="${dayIsoPrefix}">
        <div class="mc-day-header">
          <span>${escapeHtml(dayLabel)}</span>
          <button type="button" class="mc-quick-add-day" data-date="${dayIsoPrefix}" style="min-height:32px;min-width:32px;padding:2px 8px;font-size:12px;" aria-label="Dodaj zadanie w dniu ${escapeHtml(dayLabel)}">+</button>
        </div>
        ${dayEvents.map(renderEventTileHtml).join('')}
      </div>
    `);
  }
  return `<div class="mc-week-grid">${cols.join('')}</div>`;
}

function renderModalHtml() {
  const ev = state.editingEvent;
  if (!ev) return '';
  const isEdit = Boolean(ev.id);
  return `
    <div class="mc-modal-backdrop" id="mcModalBackdrop" role="dialog" aria-modal="true" aria-labelledby="mcModalTitle">
      <form class="mc-modal" id="mcEventForm">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h2 id="mcModalTitle" style="margin:0;">${isEdit ? 'Edytuj zadanie misji' : 'Nowe zadanie misji'}</h2>
          <button type="button" id="btnCloseModal" aria-label="Zamknij okno">✕</button>
        </div>
        <label>Tytuł zadania *
          <input name="title" required maxlength="200" value="${escapeHtml(ev.title || '')}" placeholder="np. Przygotowanie miniatury Biblia Audio" />
        </label>
        <label>Opis / Kryteria akceptacji / Notatka
          <textarea name="description" rows="3" placeholder="Cel zadania, linki do dokumentacji OA / GitHub...">${escapeHtml(ev.description || '')}</textarea>
        </label>
        <div class="mc-form-row">
          <label>Początek (Europe/Warsaw) *
            <input name="starts_at" type="datetime-local" required value="${escapeHtml(toWarsawInput(ev.starts_at || new Date().toISOString()))}" />
          </label>
          <label>Koniec (Europe/Warsaw)
            <input name="ends_at" type="datetime-local" value="${escapeHtml(toWarsawInput(ev.ends_at))}" />
          </label>
        </div>
        <div class="mc-form-row">
          <label>Status (4 kolory kanoniczne)
            <select name="status" id="mcStatusSelect">
              ${Object.values(STATUS_META)
                .map((s) => `<option value="${s.code}" ${(ev.status || 'todo') === s.code ? 'selected' : ''}>${s.icon} ${escapeHtml(s.label)}</option>`)
                .join('')}
            </select>
          </label>
          <label>Obszar misji
            <select name="category">
              ${Object.keys(AREA_COLORS)
                .map((c) => `<option value="${c}" ${(ev.category || 'mission') === c ? 'selected' : ''}>${c.toUpperCase()}</option>`)
                .join('')}
            </select>
          </label>
        </div>
        <label id="mcNotDoneReasonWrap" style="display:${ev.status === 'not_done' ? 'grid' : 'none'};">
          Powód niezrealizowania (obowiązkowy dla statusu Niezrealizowane !) *
          <input name="not_done_reason" value="${escapeHtml(ev.not_done_reason || '')}" placeholder="Podaj przyczynę niewykonania lub blokady..." />
        </label>
        <div class="mc-form-row">
          <label>Priorytet
            <select name="priority">
              <option value="1" ${Number(ev.priority) === 1 ? 'selected' : ''}>P0 — Krytyczny</option>
              <option value="2" ${Number(ev.priority || 2) === 2 ? 'selected' : ''}>P1 — Wysoki</option>
              <option value="3" ${Number(ev.priority) === 3 ? 'selected' : ''}>P2 — Standardowy</option>
              <option value="4" ${Number(ev.priority) === 4 ? 'selected' : ''}>P3 — Niski</option>
            </select>
          </label>
          <label>Wykonawca (Osoba / Agent @777 / @OA)
            <input name="assigned_to" value="${escapeHtml(ev.assigned_to || '')}" placeholder="np. @077, @OA, @A001, @Codex, @VisualDirector" />
          </label>
        </div>
        <div class="mc-form-row">
          <label>Projekt
            <select name="project_id">
              <option value="general" ${ev.project_id === 'general' ? 'selected' : ''}>Misja Ogólna CC</option>
              <option value="biblia-audio" ${ev.project_id === 'biblia-audio' ? 'selected' : ''}>Produkcja Biblia Audio</option>
              <option value="shorts-factory" ${ev.project_id === 'shorts-factory' ? 'selected' : ''}>Automatyzacja Shorts</option>
              <option value="obs-live" ${ev.project_id === 'obs-live' ? 'selected' : ''}>Emisja OBS Live</option>
            </select>
          </label>
          <label>Powtarzalność (RRULE)
            <select name="rrule">
              <option value="" ${!ev.rrule ? 'selected' : ''}>Jednorazowo (bez powtarzania)</option>
              <option value="FREQ=DAILY" ${ev.rrule === 'FREQ=DAILY' ? 'selected' : ''}>Codziennie</option>
              <option value="FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" ${ev.rrule === 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' ? 'selected' : ''}>W dni robocze (Pn–Pt)</option>
              <option value="FREQ=WEEKLY" ${ev.rrule === 'FREQ=WEEKLY' ? 'selected' : ''}>Co tydzień</option>
              <option value="FREQ=WEEKLY;INTERVAL=2" ${ev.rrule === 'FREQ=WEEKLY;INTERVAL=2' ? 'selected' : ''}>Co dwa tygodnie</option>
              <option value="FREQ=MONTHLY;BYMONTHDAY=1,15" ${ev.rrule === 'FREQ=MONTHLY;BYMONTHDAY=1,15' ? 'selected' : ''}>Dwa razy w miesiącu (1. i 15. dzień)</option>
              <option value="FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1,3" ${ev.rrule === 'FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1,3' ? 'selected' : ''}>1. i 3. poniedziałek miesiąca</option>
              <option value="FREQ=MONTHLY" ${ev.rrule === 'FREQ=MONTHLY' ? 'selected' : ''}>Raz w miesiącu</option>
              <option value="FREQ=YEARLY" ${ev.rrule === 'FREQ=YEARLY' ? 'selected' : ''}>Co rok</option>
            </select>
          </label>
        </div>
        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
          <input type="checkbox" name="is_private" style="min-height:20px;min-width:20px;" ${ev.is_private ? 'checked' : ''} />
          <span>Prywatny wpis CC LIFE (ukryj opis przed agentami @777 — widoczna tylko zajętość)</span>
        </label>
        ${
          ev.result_summary
            ? `<div style="padding:12px;background:#0b131e;border:1px solid var(--mc-gold);border-radius:10px;">
                <strong style="color:var(--mc-gold-light)">Rezultat zgłoszony przez agenta (${escapeHtml(ev.assigned_to || '')}):</strong>
                <p style="margin:6px 0 0;font-size:13px;">${escapeHtml(ev.result_summary)}</p>
              </div>`
            : ''
        }
        <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;margin-top:8px;">
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="submit" class="mc-btn-cta">${isEdit ? 'Zapisz zmiany' : 'Utwórz zadanie'}</button>
            ${
              isEdit
                ? `<button type="button" id="btnRouteOA" class="mc-btn-gold">Zleć przez @OA</button>`
                : ''
            }
            ${
              isEdit && ev.review_state === 'awaiting_review'
                ? `<button type="button" id="btnApproveResult" style="background:#15803D;border-color:#15803D;color:#fff;">✓ Zatwierdź rezultat</button>
                   <button type="button" id="btnRejectResult" style="background:#B91C1C;border-color:#B91C1C;color:#fff;">Odrzuć</button>`
                : ''
            }
          </div>
          ${
            isEdit
              ? `<button type="button" id="btnDeleteEvent" style="border-color:#B91C1C;color:#fca5a5;">Usuń</button>`
              : ''
          }
        </div>
      </form>
    </div>
  `;
}

export function render() {
  const root = document.getElementById('ccMcApp');
  if (!root) return;

  if (!state.user) {
    root.innerHTML = `
      <main class="mc-login-screen">
        <section class="mc-login-card" aria-labelledby="mcLoginHeading">
          <div class="mc-badge-gold">CHRISTIAN CULTURE · ORKIESTRA @777 · @OA</div>
          <h1 id="mcLoginHeading" style="margin:0;font-size:28px;">Kalendarz Misji (ccMC)</h1>
          <p style="margin:0;color:var(--mc-muted);font-size:14px;">
            Prywatne centrum planowania misji, zadań agentów @777, cykliczności RRULE i weryfikacji wykonania.
            Dostęp wyłącznie dla uwierzytelnionego Administratora.
          </p>
          ${state.error ? `<div role="alert" style="padding:12px;border-radius:10px;background:#451a1a;border:1px solid #ef4444;color:#fecaca;font-size:13px;">${escapeHtml(state.error)}</div>` : ''}
          <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
            <button type="button" id="btnLuminaSignIn" class="mc-btn-cta">Zaloguj przez Google (SSO LUMINA)</button>
            <a href="/" class="mc-btn" style="text-decoration:none;">← Wróć do portalu</a>
          </div>
          <div id="cc-auth-nav-container" data-cc-auth-mount></div>
        </section>
      </main>
    `;
    const btnLogin = document.getElementById('btnLuminaSignIn');
    if (btnLogin) {
      btnLogin.onclick = async () => {
        if (await tryLuminaBridgeSession()) {
          await refreshData();
          render();
          return;
        }
        const googleBtn = document.querySelector('.cc-auth-google-btn, [data-cc-auth-login]');
        if (googleBtn) googleBtn.click();
        else {
          state.error = 'Użyj przycisku logowania Google LUMINA lub zaloguj się na konto Administratora.';
          render();
        }
      };
    }
    return;
  }

  const filtered = getFilteredEvents();
  const counts = {
    all: state.events.length,
    todo: state.events.filter((e) => e.status === 'todo').length,
    in_progress: state.events.filter((e) => e.status === 'in_progress').length,
    done: state.events.filter((e) => e.status === 'done').length,
    not_done: state.events.filter((e) => e.status === 'not_done').length,
  };

  root.innerHTML = `
    <div class="mc-shell">
      <aside class="mc-sidebar ${state.mobileSidebarOpen ? 'is-open-mobile' : ''}" aria-label="Filtry kalendarza misji">
        <div>
          <div class="mc-badge-gold">CC · @777 · @OA</div>
          <h2>Kalendarz Misji</h2>
          <small style="color:var(--mc-muted)">${escapeHtml(state.user.email)}</small>
        </div>

        <div class="mc-filter-group">
          <div class="mc-filter-title">Widoki</div>
          ${[
            ['day', '☀ Dzień (oś 15m)'],
            ['week', '▤ Tydzień (7 dni)'],
            ['month', '▦ Miesiąc / 2 tyg.'],
            ['agenda', '☰ Agenda chronologiczna'],
            ['kanban', '◫ Kanban (4 statusy)'],
            ['agents', '⚡ Agenci @777 & Audyt'],
          ]
            .map(
              ([v, label]) =>
                `<button type="button" class="mc-nav-btn ${state.view === v ? 'is-active' : ''}" data-view="${v}">${label}</button>`
            )
            .join('')}
        </div>

        <div class="mc-filter-group">
          <div class="mc-filter-title">Obszary Misji</div>
          <button type="button" class="mc-nav-btn ${state.category === 'all' ? 'is-active' : ''}" data-category="all">◈ Wszystkie obszary</button>
          ${Object.keys(AREA_COLORS)
            .map(
              (cat) => `
            <button type="button" class="mc-nav-btn ${state.category === cat ? 'is-active' : ''}" data-category="${cat}">
              <span style="color:${AREA_COLORS[cat]}">●</span> ${cat.toUpperCase()}
            </button>
          `
            )
            .join('')}
        </div>

        <div style="margin-top:auto;display:grid;gap:8px;">
          <button type="button" id="btnLogout">Wyloguj</button>
        </div>
      </aside>

      <main class="mc-main">
        <header class="mc-topbar">
          <div class="mc-topbar-left">
            <button type="button" id="btnToggleMobileMenu" aria-label="Otwórz filtry">☰ Filtry</button>
            <button type="button" id="btnPrevPeriod" aria-label="Poprzedni okres">←</button>
            <button type="button" id="btnToday">Dziś</button>
            <button type="button" id="btnNextPeriod" aria-label="Następny okres">→</button>
            <input
              type="search"
              id="mcSearchInput"
              value="${escapeHtml(state.searchQuery)}"
              placeholder="Szukaj zadania lub agenta..."
              aria-label="Szukaj zadania"
              style="min-height:44px;padding:8px 12px;border-radius:10px;border:1px solid var(--mc-border);background:#0b131e;color:#fff;"
            />
          </div>
          <div class="mc-topbar-right">
            <button type="button" id="btnEnablePush" class="mc-btn-gold">🔔 Włącz Push</button>
            <button type="button" id="btnNewTask" class="mc-btn-cta">＋ Nowe zadanie</button>
          </div>
        </header>

        ${
          state.error
            ? `<div role="alert" style="padding:12px 16px;border-radius:12px;background:#451a1a;border:1px solid #ef4444;color:#fecaca;display:flex;justify-content:space-between;align-items:center;">
                <span>${escapeHtml(state.error)}</span>
                <button type="button" id="btnClearError" style="min-height:36px;">✕</button>
              </div>`
            : ''
        }
        ${
          state.notice
            ? `<div role="status" style="padding:12px 16px;border-radius:12px;background:#143523;border:1px solid #22c55e;color:#bbf7d0;display:flex;justify-content:space-between;align-items:center;">
                <span>${escapeHtml(state.notice)}</span>
                <button type="button" id="btnClearNotice" style="min-height:36px;">✕</button>
              </div>`
            : ''
        }

        <form class="mc-nl-bar" id="mcNlForm" aria-label="Zlecenie w języku naturalnym dla Noemi @077">
          <strong style="color:var(--mc-gold-light);font-size:13px;">Noemi @077 → @OA:</strong>
          <input
            type="text"
            name="nlCommand"
            placeholder="np. Dodaj na piątek o 10:00 przygotowanie miniatury, przydziel Visual Director, powtarzaj co tydzień"
            aria-label="Polecenie w języku naturalnym"
          />
          <button type="submit" class="mc-btn-gold">Zaplanuj zadanie</button>
        </form>

        <section class="mc-stats" aria-label="Podsumowanie statusów">
          <div class="mc-stat-card"><strong>${counts.todo}</strong><span>○ Do wykonania</span></div>
          <div class="mc-stat-card"><strong>${counts.in_progress}</strong><span>◐ W trakcie</span></div>
          <div class="mc-stat-card"><strong>${counts.done}</strong><span>✓ Zrealizowane</span></div>
          <div class="mc-stat-card"><strong>${counts.not_done}</strong><span>! Niezrealizowane</span></div>
        </section>

        <div class="mc-status-legend" role="group" aria-label="Filtruj po statusie">
          <button type="button" class="${state.statusFilter === 'all' ? 'mc-btn-gold' : ''}" data-status-filter="all">Wszystkie (${counts.all})</button>
          <button type="button" class="mc-status-pill mc-status-todo" data-status-filter="todo">○ Do wykonania</button>
          <button type="button" class="mc-status-pill mc-status-in_progress" data-status-filter="in_progress">◐ W trakcie</button>
          <button type="button" class="mc-status-pill mc-status-done" data-status-filter="done">✓ Zrealizowane</button>
          <button type="button" class="mc-status-pill mc-status-not_done" data-status-filter="not_done">! Niezrealizowane</button>
        </div>

        <section class="mc-board">
          ${renderBoardContent(filtered)}
        </section>
      </main>

      <nav class="mc-bottom-nav" aria-label="Nawigacja mobilna kalendarza">
        <button type="button" data-view="day">Dziś</button>
        <button type="button" data-view="week">Kalendarz</button>
        <button type="button" data-view="kanban">Zadania</button>
        <button type="button" data-view="agents">Agenci</button>
      </nav>
    </div>
    ${
      state.undoAction
        ? `<div class="mc-undo-banner" role="status">
            <span>${escapeHtml(state.undoAction.label)}</span>
            <button type="button" id="btnUndoAction" class="mc-btn-gold">Cofnij (Undo)</button>
          </div>`
        : ''
    }
    ${renderModalHtml()}
  `;

  bindEvents();
}

function findEventByKey(key) {
  return state.events.find((e) => (e.occurrence_id || e.id) === key || e.id === key);
}

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.onclick = () => {
      state.view = btn.getAttribute('data-view');
      state.mobileSidebarOpen = false;
      render();
    };
  });

  document.querySelectorAll('[data-category]').forEach((btn) => {
    btn.onclick = () => {
      state.category = btn.getAttribute('data-category');
      state.mobileSidebarOpen = false;
      render();
    };
  });

  document.querySelectorAll('[data-status-filter]').forEach((btn) => {
    btn.onclick = () => {
      state.statusFilter = btn.getAttribute('data-status-filter');
      render();
    };
  });

  const btnMobile = document.getElementById('btnToggleMobileMenu');
  if (btnMobile) {
    btnMobile.onclick = () => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
      render();
    };
  }

  const btnPrev = document.getElementById('btnPrevPeriod');
  if (btnPrev) {
    btnPrev.onclick = async () => {
      state.anchorDate = new Date(state.anchorDate.getTime() - 7 * 86400_000);
      await refreshData();
      render();
    };
  }
  const btnNext = document.getElementById('btnNextPeriod');
  if (btnNext) {
    btnNext.onclick = async () => {
      state.anchorDate = new Date(state.anchorDate.getTime() + 7 * 86400_000);
      await refreshData();
      render();
    };
  }
  const btnToday = document.getElementById('btnToday');
  if (btnToday) {
    btnToday.onclick = async () => {
      state.anchorDate = new Date();
      await refreshData();
      render();
    };
  }

  const searchInput = document.getElementById('mcSearchInput');
  if (searchInput) {
    searchInput.oninput = (e) => {
      state.searchQuery = e.target.value;
      render();
    };
  }

  const btnPush = document.getElementById('btnEnablePush');
  if (btnPush) btnPush.onclick = enableWebPush;

  const btnNew = document.getElementById('btnNewTask');
  if (btnNew) {
    btnNew.onclick = () => {
      state.editingEvent = {
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 1800_000).toISOString(),
        status: 'todo',
        category: 'mission',
        priority: 2,
        project_id: 'general',
      };
      render();
    };
  }

  document.querySelectorAll('.mc-quick-add-day').forEach((btn) => {
    btn.onclick = () => {
      const datePrefix = btn.getAttribute('data-date');
      state.editingEvent = {
        starts_at: new Date(`${datePrefix}T09:00:00`).toISOString(),
        ends_at: new Date(`${datePrefix}T09:30:00`).toISOString(),
        status: 'todo',
        category: 'mission',
        priority: 2,
      };
      render();
    };
  });

  const btnClearErr = document.getElementById('btnClearError');
  if (btnClearErr) btnClearErr.onclick = () => { state.error = ''; render(); };
  const btnClearNot = document.getElementById('btnClearNotice');
  if (btnClearNot) btnClearNot.onclick = () => { state.notice = ''; render(); };

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.onclick = async () => {
      await apiRequest('/logout', { method: 'POST' });
      state.user = null;
      state.csrfToken = '';
      render();
    };
  }

  const btnUndo = document.getElementById('btnUndoAction');
  if (btnUndo && state.undoAction) {
    btnUndo.onclick = () => state.undoAction.revertFn();
  }

  // Natural Language Command Form
  const nlForm = document.getElementById('mcNlForm');
  if (nlForm) {
    nlForm.onsubmit = async (e) => {
      e.preventDefault();
      const cmd = new FormData(nlForm).get('nlCommand');
      if (!cmd) return;
      try {
        const res = await apiRequest('/nl-command', {
          method: 'POST',
          body: JSON.stringify({ command: cmd, commit: false }),
        });
        state.editingEvent = res.draft;
        state.notice = 'Noemi @077 przygotowała propozycję zadania — sprawdź i zatwierdź zapis.';
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  }

  // Kafelki: edycja, przesunięcie przyciskami (alternatywa dla D&D), drag & drop
  document.querySelectorAll('.mc-tile-action').forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const key = btn.getAttribute('data-key');
      const action = btn.getAttribute('data-action');
      const ev = findEventByKey(key);
      if (!ev) return;

      if (action === 'edit') {
        state.editingEvent = { ...ev };
        render();
      } else if (action === 'shift-plus') {
        const newStart = new Date(Date.parse(ev.starts_at) + 1800_000).toISOString();
        const newEnd = ev.ends_at ? new Date(Date.parse(ev.ends_at) + 1800_000).toISOString() : null;
        await moveOrResizeEvent(ev, newStart, newEnd);
      } else if (action === 'extend') {
        const baseEnd = ev.ends_at ? Date.parse(ev.ends_at) : Date.parse(ev.starts_at) + 1800_000;
        const newEnd = new Date(baseEnd + 1800_000).toISOString();
        await moveOrResizeEvent(ev, ev.starts_at, newEnd);
      }
    };
  });

  document.querySelectorAll('.mc-event-tile').forEach((tile) => {
    tile.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', tile.getAttribute('data-event-key'));
    };
  });

  document.querySelectorAll('[data-drop-date]').forEach((col) => {
    col.ondragover = (e) => e.preventDefault();
    col.ondrop = async (e) => {
      e.preventDefault();
      const key = e.dataTransfer.getData('text/plain');
      const ev = findEventByKey(key);
      if (!ev) return;
      const targetDate = col.getAttribute('data-drop-date');
      const localCurrent = toWarsawInput(ev.starts_at);
      const timePart = localCurrent.split('T')[1] || '09:00';
      const durationMs = ev.ends_at ? Date.parse(ev.ends_at) - Date.parse(ev.starts_at) : 1800_000;
      const newStartIso = new Date(`${targetDate}T${timePart}`).toISOString();
      const newEndIso = new Date(Date.parse(newStartIso) + durationMs).toISOString();
      await moveOrResizeEvent(ev, newStartIso, newEndIso);
    };
  });

  document.querySelectorAll('[data-drop-status]').forEach((col) => {
    col.ondragover = (e) => e.preventDefault();
    col.ondrop = async (e) => {
      e.preventDefault();
      const key = e.dataTransfer.getData('text/plain');
      const ev = findEventByKey(key);
      if (!ev) return;
      const targetStatus = col.getAttribute('data-drop-status');
      let reason = ev.not_done_reason || null;
      if (targetStatus === 'not_done' && !reason) {
        reason = window.prompt('Podaj obowiązkowy powód niezrealizowania zadania:');
        if (!reason) return;
      }
      try {
        await apiRequest(`/events/${encodeURIComponent(ev.series_id || ev.id)}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: targetStatus, not_done_reason: reason, version: ev.version }),
        });
        await refreshData();
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  });

  // Rejestracja tokenu agenta
  const btnRegAgent = document.getElementById('btnRegisterAgent');
  if (btnRegAgent) {
    btnRegAgent.onclick = async () => {
      const name = window.prompt('Podaj identyfikator agenta (np. @077, @OA, @A001, @Codex, @Claude):', '@077');
      if (!name) return;
      try {
        const res = await apiRequest('/agents', {
          method: 'POST',
          body: JSON.stringify({
            name,
            scopes: ['events:read', 'events:claim', 'events:report'],
            capabilities: ['general', 'code', 'media'],
          }),
        });
        state.notice = `Utworzono token dla ${res.agent.name}. Skopiuj go teraz (w bazie zapisano wyłącznie hash SHA-256): ${res.token}`;
        await refreshData();
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  }

  // Modal Formularza
  const statusSelect = document.getElementById('mcStatusSelect');
  const reasonWrap = document.getElementById('mcNotDoneReasonWrap');
  if (statusSelect && reasonWrap) {
    statusSelect.onchange = () => {
      reasonWrap.style.display = statusSelect.value === 'not_done' ? 'grid' : 'none';
    };
  }

  const btnCloseModal = document.getElementById('btnCloseModal');
  if (btnCloseModal) btnCloseModal.onclick = () => { state.editingEvent = null; render(); };

  const modalForm = document.getElementById('mcEventForm');
  if (modalForm) {
    modalForm.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(modalForm);
      const ev = state.editingEvent;
      const payload = {
        title: fd.get('title'),
        description: fd.get('description'),
        starts_at: new Date(fd.get('starts_at')).toISOString(),
        ends_at: fd.get('ends_at') ? new Date(fd.get('ends_at')).toISOString() : null,
        status: fd.get('status'),
        not_done_reason: fd.get('not_done_reason') || null,
        category: fd.get('category'),
        priority: Number(fd.get('priority')),
        assigned_to: fd.get('assigned_to') || null,
        project_id: fd.get('project_id') || 'general',
        rrule: fd.get('rrule') || null,
        is_private: fd.get('is_private') === 'on',
        version: ev.version,
      };
      try {
        const targetId = ev.series_id || ev.id;
        if (targetId) {
          await apiRequest(`/events/${encodeURIComponent(targetId)}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          });
        } else {
          await apiRequest('/events', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        }
        state.editingEvent = null;
        await refreshData();
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  }

  const btnRouteOA = document.getElementById('btnRouteOA');
  if (btnRouteOA && state.editingEvent?.id) {
    btnRouteOA.onclick = async () => {
      try {
        const res = await apiRequest(`/events/${encodeURIComponent(state.editingEvent.series_id || state.editingEvent.id)}/assign`, {
          method: 'POST',
          body: JSON.stringify({ assignee: '@OA' }),
        });
        state.editingEvent = null;
        state.notice = `Zadanie przydzielone przez router @OA do: ${res.event.assigned_to}`;
        await refreshData();
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  }

  const btnApprove = document.getElementById('btnApproveResult');
  if (btnApprove && state.editingEvent?.id) {
    btnApprove.onclick = async () => {
      try {
        await apiRequest(`/events/${encodeURIComponent(state.editingEvent.series_id || state.editingEvent.id)}/approve`, {
          method: 'POST',
        });
        state.editingEvent = null;
        state.notice = 'Rezultat agenta zatwierdzony — status zmieniony na Zrealizowane (✓).';
        await refreshData();
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  }

  const btnReject = document.getElementById('btnRejectResult');
  if (btnReject && state.editingEvent?.id) {
    btnReject.onclick = async () => {
      const reason = window.prompt('Podaj uwagi do poprawki dla agenta:', 'Wymagane uzupełnienie testów');
      if (!reason) return;
      try {
        await apiRequest(`/events/${encodeURIComponent(state.editingEvent.series_id || state.editingEvent.id)}/reject`, {
          method: 'POST',
          body: JSON.stringify({ reason }),
        });
        state.editingEvent = null;
        await refreshData();
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  }

  const btnDelete = document.getElementById('btnDeleteEvent');
  if (btnDelete && state.editingEvent?.id) {
    btnDelete.onclick = async () => {
      if (!window.confirm('Czy na pewno usunąć to zadanie?')) return;
      try {
        await apiRequest(`/events/${encodeURIComponent(state.editingEvent.series_id || state.editingEvent.id)}`, {
          method: 'DELETE',
        });
        state.editingEvent = null;
        await refreshData();
        render();
      } catch (err) {
        state.error = err.message;
        render();
      }
    };
  }
}

if (typeof window !== 'undefined' && document.getElementById('ccMcApp')) {
  loadInitialSession();
}
