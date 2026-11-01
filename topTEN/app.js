'use strict';
/**
 * Christian Culture topTEN × wspieramTO — frontend notowań
 * Dane i punkty wyłącznie z serwera (/api/topten/*, Cloudflare D1). Brak danych demo.
 *
 * 1. LubięTO: 1x na dobę (+777 pkt) — limit pilnuje serwer.
 * 2. PodbijTO: do 7x na dobę, min. 60 min odstępu (+77 pkt) — limit pilnuje serwer.
 * 3. wspieramTO: bezpośrednie wsparcie artystów (0% prowizji, bez punktów w rankingu).
 * 4. Obserwowanie i powiadomienia (Web Push opt-in, cisza nocna, max 3/dobę).
 * 5. Ranking na żywo (odświeżanie co 30 s przy aktywnej karcie) i archiwum tygodni.
 */

const POLL_MS = 30_000;
const LIVE_LABEL_STYLE = 'font-size: 14px; font-weight: 700; vertical-align: middle; margin-left: 8px;';

const state = {
  charts: null,          // { cycle, items, updatedAt }
  viewCycle: null,       // null = bieżące notowanie
  me: null,              // { tracks: { [id]: { likedToday, boostsToday, nextBoostAt, following } } }
  user: null,
  loadError: false,
  openTrackId: null,
  busy: false,
};

const $ = (s) => document.querySelector(s);
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const fmtPoints = (n) => Number(n || 0).toLocaleString('pl-PL');
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const fmtDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
const newKey = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

function showToast(message) {
  let toast = $('#toptenToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toptenToast';
    toast.className = 'topten-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = 'block';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.style.display = 'none'; }, 4000);
}

// ─── API ─────────────────────────────────────────────────────────────────────
async function api(path, { method = 'GET', body, auth = false, idempotent = false } = {}) {
  const headers = {};
  if (method !== 'GET') headers['Content-Type'] = 'application/json';
  if (idempotent) headers['Idempotency-Key'] = newKey();
  if (auth) {
    const token = await window.ccTopTenAuth?.getToken();
    if (!token) { const e = new Error('Zaloguj się, aby kontynuować.'); e.status = 401; throw e; }
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : (method === 'GET' ? undefined : '{}'), cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.message || 'Błąd połączenia — spróbuj ponownie.'); e.status = res.status; e.code = data.error; throw e; }
  return data;
}

async function loadCharts() {
  try {
    const q = state.viewCycle ? `?cycle=${encodeURIComponent(state.viewCycle)}` : '';
    state.charts = await api(`/api/topten/charts${q}`);
    state.loadError = false;
  } catch {
    state.loadError = true;
    if (state.charts) state.charts.stale = true;
  }
  renderCharts($('#siteSearch')?.value || '');
  if (state.openTrackId && !$('#modal').hidden) openTrackModal(state.openTrackId, { keepFocus: true });
}

async function loadMe() {
  if (!state.user) { state.me = null; return; }
  try { state.me = await api('/api/topten/me', { auth: true }); } catch { state.me = null; }
}

// ─── Render listy ────────────────────────────────────────────────────────────
function getTrendBadge(currentRank, prevRank) {
  if (!prevRank) return '<span class="trend-pill trend-same" title="Pierwsze notowanie utworu">NOWOŚĆ</span>';
  if (currentRank === prevRank) return '<span class="trend-pill trend-same" title="Pozycja bez zmian">— 0</span>';
  if (currentRank < prevRank) {
    const diff = prevRank - currentRank;
    return `<span class="trend-pill trend-up" title="Awans o ${diff} m. względem poprzedniego tygodnia">▲ +${diff}</span>`;
  }
  const diff = currentRank - prevRank;
  return `<span class="trend-pill trend-down" title="Spadek o ${diff} m. względem poprzedniego tygodnia">▼ -${diff}</span>`;
}

function card(item, large) {
  return `
    <article class="chart-card ${large ? 'large' : ''}" data-track-id="${escapeHtml(item.id)}" tabindex="0" role="button" aria-label="${escapeHtml(item.title)}, ${escapeHtml(item.artist)}, miejsce ${item.rank}">
      <div class="cover">
        ${item.cover ? `<img src="${escapeHtml(item.cover)}" alt="Okładka: ${escapeHtml(item.title)}" loading="lazy">` : ''}
        <span class="rank">${item.rank}</span>
        ${large ? '<button class="play" type="button" aria-label="Odsłuchaj i zagłosuj">▶</button>' : ''}
        ${large ? `<div class="cover-caption">
          <h3 class="card-title">${escapeHtml(item.title)}</h3>
          <div class="artist-name">${escapeHtml(item.artist)}</div>
        </div>` : ''}
      </div>
      ${large ? '' : `<h3 class="card-title">${escapeHtml(item.title)}</h3>
      <div class="artist-name">${escapeHtml(item.artist)}</div>`}
      <div class="card-meta-live">
        <span class="points-pill">${fmtPoints(item.score)} pkt</span>
        ${getTrendBadge(item.rank, item.prevRank)}
      </div>
    </article>`;
}

function renderCharts(filter = '') {
  const sections = $('#sections');
  if (!sections) return;

  if (!state.charts) {
    if (!state.loadError && sections.querySelector('#notowania-ssr')) return; // lista z serwera zostaje do czasu danych
    sections.innerHTML = state.loadError
      ? '<p class="empty-state">Notowanie jest chwilowo niedostępne. Spróbuj odświeżyć stronę za chwilę.</p>'
      : '<p class="empty-state">Wczytywanie notowania…</p>';
    return;
  }

  const q = filter.toLocaleLowerCase('pl').trim();
  const { cycle, items, updatedAt } = state.charts;
  const live = cycle.status === 'live';
  const filtered = items.filter(x => !q || `${x.title} ${x.artist}`.toLocaleLowerCase('pl').includes(q));
  const topFive = filtered.slice(0, 5);
  const nextFive = filtered.slice(5, 10);
  const more = filtered.slice(10);

  const label = live
    ? `<span style="${LIVE_LABEL_STYLE} color: #2ecc71;">● NA ŻYWO</span>`
    : `<span style="${LIVE_LABEL_STYLE} color: #FF7A00;">ARCHIWUM</span>`;
  const note = live
    ? `Notowanie ${fmtDate(cycle.id)} – ${fmtDate(cycle.end.slice(0, 10))} (zamknięcie w niedzielę o 23:59). Aktualizacja: ${fmtTime(updatedAt)}.${state.charts.stale ? ' <strong>Brak połączenia — dane mogą być nieaktualne.</strong>' : ''}`
    : `Oficjalny wynik tygodnia ${fmtDate(cycle.id)} – ${fmtDate(cycle.end.slice(0, 10))}. <button type="button" class="view-all" data-back-live="true">Wróć do notowania na żywo →</button>`;

  sections.innerHTML = `
    <section class="chart-section" id="notowania">
      <div class="section-header">
        <h2>TopTen Global ${label}</h2>
        <span class="section-actions">
          <button class="view-all" type="button" data-share-chart="true" aria-label="Udostępnij notowanie topTEN">UDOSTĘPNIJ <span>📤</span></button>
          <button class="view-all" data-chart="notowania" aria-label="Szczegóły notowania">ZASADY PUNKTACJI <span>→</span></button>
        </span>
      </div>
      <p class="vote-info-note" style="margin: 0 0 14px;">${note} <a href="/topTEN/nominacje" style="color: #FF7A00; font-weight: 700;">Zgłoś utwór →</a></p>
      ${filtered.length ? `<div class="cards featured">${topFive.map((item, i) => card(item, i === 0 && !q)).join('')}</div>`
        : `<p class="empty-state">${q ? 'Brak utworów pasujących do wyszukiwania.' : 'W tym tygodniu nie ma jeszcze utworów w notowaniu.'}</p>`}
    </section>

    <!-- Moduł partnerski wspieramTO -->
    <section class="wspieramto-module" id="wspieramto">
      <a href="#wspieramto" class="wspieramto-banner-card" id="bannerWspieramTO" role="button" aria-label="Poznaj wspieramTO — bezpośrednie wsparcie artystów topTEN">
        <img src="/topTEN/assets/wspieramto-banner.png" alt="wspieramTO wspiera artystów topTEN — Dobra muzyka. Prawdziwe wsparcie. Kliknij, aby poznać szczegóły" class="wspieramto-img" loading="lazy">
      </a>
      <div class="wspieramto-details-bar">
        <span class="wspieramto-badge">wspieramTO × Christian Culture</span>
        <p>100% kwoty trafia bezpośrednio do artystów. Polskie Radio Christian Culture nie pobiera prowizji, a wsparcie finansowe nie wpływa na punkty w notowaniach.</p>
        <button class="wspieramto-action-btn" id="btnWspieramTOModal">Poznaj wspieramTO →</button>
      </div>
    </section>

    ${nextFive.length ? `
      <section class="chart-section" id="dalsze-pozycje">
        <div class="section-header"><h2>Miejsca 6–10</h2></div>
        <div class="cards">${nextFive.map(item => card(item, false)).join('')}</div>
      </section>` : ''}
    ${more.length ? `
      <section class="chart-section" id="pozostale-pozycje">
        <div class="section-header"><h2>Pozostałe nominacje</h2></div>
        <div class="cards">${more.map(item => card(item, false)).join('')}</div>
      </section>` : ''}
  `;

  $('#btnWspieramTOModal')?.addEventListener('click', (e) => { e.preventDefault(); showWspieramTOInfo(); });
  const banner = $('#bannerWspieramTO');
  banner?.addEventListener('click', (e) => { e.preventDefault(); showWspieramTOInfo(); });
  banner?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showWspieramTOInfo(); }
  });
}

// ─── Modal ───────────────────────────────────────────────────────────────────
let lastFocus = null;
function showModal(title, html, { keepFocus = false } = {}) {
  if (!keepFocus) lastFocus = document.activeElement;
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = html;
  $('#modal').hidden = false;
  document.body.style.overflow = 'hidden';
  if (!keepFocus) $('.modal-panel').focus();
}

function closeModal() {
  $('#modal').hidden = true;
  state.openTrackId = null;
  document.body.style.overflow = '';
  if (location.hash.startsWith('#CC-TT-')) history.replaceState(null, '', location.pathname);
  if (lastFocus?.focus) lastFocus.focus();
}

function showWspieramTOInfo() {
  showModal('wspieramTO — Prawdziwe wsparcie artystów', `
    <div style="line-height: 1.6;">
      <p style="font-size: 15px; font-weight: 700; color: #FF7A00;">Dobra muzyka. Prawdziwe wsparcie.</p>
      <p>Program <strong>wspieramTO</strong> powstał, aby umożliwić słuchaczom Polskiego Radia Christian Culture bezpośrednie wsparcie artystów chrześcijańskich tworzących wartościową muzykę.</p>
      <div style="background: #fdfaf6; border: 1px solid #fae2cc; border-radius: 8px; padding: 14px; margin: 16px 0;">
        <h4 style="margin: 0 0 6px; font-size: 14px; color: #111;">Kluczowe filary wspieramTO:</h4>
        <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #444;">
          <li><strong>0% prowizji dla radia:</strong> 100% każdej przekazanej kwoty trafia bezpośrednio do twórcy.</li>
          <li><strong>Uczciwy ranking:</strong> Wsparcie finansowe <u>nie daje punktów</u> na liście przebojów topTEN — ranking zależy wyłącznie od głosów słuchaczy (LubięTO / PodbijTO).</li>
          <li><strong>Sprawdzone metody:</strong> Metody wsparcia są weryfikowane przez redakcję przed publikacją na karcie utworu.</li>
        </ul>
      </div>
      <p style="font-size: 13px; color: #666;">Jesteś artystą i chcesz podpiąć swoje metody wsparcia pod profil w notowaniach topTEN? Zgłoś swój utwór przez <a href="/topTEN/nominacje" style="color: #FF7A00; font-weight: 700;">formularz nominacji</a>.</p>
      <button class="primary-btn" type="button" data-close-modal="true" style="margin-top: 10px;">Rozumiem i wracam do notowań →</button>
    </div>
  `);
}

const findTrack = (id) => state.charts?.items.find(t => t.id === id);

function voteButtons(track) {
  const live = state.charts?.cycle.status === 'live';
  if (!live) return '<p class="vote-info-note">To notowanie jest zamknięte — głosowanie trwa w bieżącym tygodniu.</p>';
  if (!state.user) {
    return `<button class="btn-action btn-lubieto" type="button" data-login="true">🔑 Zaloguj się kontem Google, aby głosować</button>`;
  }
  const my = state.me?.tracks?.[track.id] || {};
  const boosts = my.boostsToday || 0;
  const coolMin = my.nextBoostAt ? Math.max(1, Math.ceil((my.nextBoostAt - Date.now()) / 60000)) : 0;
  const boostMaxed = boosts >= 7;
  return `
    <button class="btn-action btn-lubieto" id="btnVoteLubieTO" type="button" ${my.likedToday || state.busy ? 'disabled' : ''}>
      ${my.likedToday ? '✓ Polubiono dziś — LubięTO dostępne jutro' : '🧡 LubięTO (+777 pkt)'}
    </button>
    <button class="btn-action btn-podbijto" id="btnVotePodbijTO" type="button" ${boostMaxed || coolMin || state.busy ? 'disabled' : ''}>
      ${boostMaxed ? 'Wykorzystano 7/7 PodbijTO dziś' : coolMin ? `⏳ PodbijTO ponownie za ${coolMin} min` : `🚀 PodbijTO (+77) [${7 - boosts} z 7]`}
    </button>`;
}

function openTrackModal(trackId, { keepFocus = false } = {}) {
  const track = findTrack(trackId);
  if (!track) return;
  state.openTrackId = trackId;
  const following = !!state.me?.tracks?.[track.id]?.following;

  const modalHtml = `
    <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px; flex-wrap: wrap;">
      ${track.cover ? `<img src="${escapeHtml(track.cover)}" alt="${escapeHtml(track.title)}" style="width: 100px; height: 100px; border-radius: 10px; object-fit: cover;">` : ''}
      <div>
        <span class="points-pill" style="font-size: 13px; margin-bottom: 4px; display: inline-block;">${fmtPoints(track.score)} punktów</span>
        <h3 style="margin: 0; font-size: 20px;">${escapeHtml(track.title)}</h3>
        <p style="margin: 2px 0 6px; font-weight: 600; color: #666;">${escapeHtml(track.artist)}</p>
        <div>${getTrendBadge(track.rank, track.prevRank)} <span style="font-size: 12px; color: #888; margin-left: 8px;">Głosujących w tym tygodniu: ${track.voters}</span></div>
        ${track.profileUrl ? `<div style="font-size: 12px; margin-top: 4px;"><a href="${escapeHtml(track.profileUrl)}" style="color: #FF7A00; font-weight: 700;">Wizytówka artysty →</a></div>` : ''}
      </div>
    </div>

    ${track.youtubeId ? `
      <div style="position: relative; aspect-ratio: 16 / 9; margin-bottom: 16px; border-radius: 10px; overflow: hidden; background: #000;">
        <iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(track.youtubeId)}" title="${escapeHtml(track.title)}" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;" allow="encrypted-media; picture-in-picture; fullscreen" loading="lazy"></iframe>
      </div>` : ''}

    ${track.bibleRef ? `
      <div style="background: #fff8f0; border-left: 4px solid #FF7A00; padding: 10px 14px; border-radius: 4px; font-size: 13px; line-height: 1.5; margin-bottom: 16px;">
        <strong>Przesłanie utworu:</strong> <em>„${escapeHtml(track.bibleRef)}”</em>
      </div>` : ''}

    <div class="vote-panel-card">
      <div style="font-size: 13px; font-weight: 800; color: #111;">Oddaj swój głos w notowaniu:</div>
      <div class="vote-action-row">${voteButtons(track)}</div>
      <p class="vote-info-note">
        <strong>Zasady:</strong> LubięTO jest dostępne 1x na dobę (+777 pkt). PodbijTO możesz wykonać do 7 razy na dobę w odstępach min. 60 minut (+77 pkt za podbicie). Limity liczy serwer według czasu polskiego.
      </p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 4px 0;">
      <button class="btn-action btn-share" id="btnTrackShare" type="button">📤 Udostępnij — poproś znajomych o głos</button>
      <div class="vote-action-row">
        ${track.support?.length ? '<button class="btn-action btn-support-artist" id="btnTrackSupport" type="button">🤝 Wspieram artystę</button>' : ''}
        ${state.charts?.cycle.status === 'live' ? `<button class="btn-action btn-follow ${following ? 'active' : ''}" id="btnTrackFollow" type="button" ${state.busy ? 'disabled' : ''}>
          ${following ? '🔔 Obserwujesz utwór' : '☆ Obserwuj utwór'}
        </button>` : ''}
      </div>
    </div>
  `;

  showModal(`Notowanie #${track.rank} — ${track.title}`, modalHtml, { keepFocus });
  $('#btnVoteLubieTO')?.addEventListener('click', () => handleVote(track.id, 'like'));
  $('#btnVotePodbijTO')?.addEventListener('click', () => handleVote(track.id, 'boost'));
  $('#btnTrackSupport')?.addEventListener('click', () => showSupportModal(track.id));
  $('#btnTrackShare')?.addEventListener('click', () => showShareSheet(track.id));
  $('#btnTrackFollow')?.addEventListener('click', () => handleFollowTrack(track.id));
}

function showSupportModal(trackId) {
  const track = findTrack(trackId);
  if (!track?.support?.length) return;
  state.openTrackId = null;

  showModal(`wspieramTO — ${track.artist}`, `
    <div style="line-height: 1.6;">
      <p style="font-size: 13px; color: #666;">Wsparcie trafia bezpośrednio do artysty, poza topTEN. Christian Culture nie pośredniczy w płatności, nie pobiera prowizji, a wsparcie nie daje punktów w notowaniu.</p>
      <ul style="list-style: none; padding: 0; margin: 12px 0;">
        ${track.support.map((s, i) => `
          <li style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 10px 0; border-bottom: 1px solid #eee;">
            <span><strong>${escapeHtml(s.method)}:</strong> ${escapeHtml(s.value)}</span>
            ${s.url
              ? `<a class="btn-action btn-support-artist" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer ugc nofollow" data-donate="${escapeHtml(s.method)}">Otwórz ↗</a>`
              : `<button class="btn-action btn-support-artist" type="button" data-copy-support="${i}">Kopiuj numer</button>`}
          </li>
        `).join('')}
      </ul>
      <p style="font-size: 12px; color: #888;">Płatność odbywa się poza topTEN — sprawdź nazwę odbiorcy przed przelewem. Nigdy nie podawaj nikomu jednorazowego kodu BLIK. Przelew na telefon wykonujesz samodzielnie w aplikacji swojego banku.</p>
    </div>
  `);

  $('#modalBody').querySelectorAll('[data-copy-support]').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = track.support[Number(btn.dataset.copySupport)];
      navigator.clipboard?.writeText(s.copy || s.value)
        .then(() => showToast(`Skopiowano: ${s.value}`))
        .catch(() => showToast(`Numer: ${s.value}`));
      ccEvent('donate_click', { method: 'blik_copy', place: 'topten', item_id: track.id });
    });
  });
  // Revolut/Patronite itp. — cc-analytics rozpoznaje tylko część domen, więc oznaczamy te, których nie zna.
  $('#modalBody').querySelectorAll('[data-donate]').forEach(a => {
    a.addEventListener('click', () => {
      if (!/zrzutka\.pl|patronite\.pl|paypal\./i.test(a.href)) ccEvent('donate_click', { method: a.dataset.donate.toLowerCase(), place: 'topten', item_id: track.id });
    });
  });
}

// ─── Udostępnianie ───────────────────────────────────────────────────────────
const SITE = 'https://polskieradio.cc';
const NOMINATE_URL = `${SITE}/topTEN/nominacje`;
const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const track404 = () => showToast('Nie udało się przygotować udostępnienia.');

function shareContent(track) {
  if (!track) {
    const url = `${SITE}/topTEN/`;
    return {
      url, title: 'topTEN — notowanie muzyki chrześcijańskiej',
      text: '🎶 Notowanie topTEN Polskiego Radia Christian Culture trwa! 🧡 Głosuj codziennie LubięTO, podbijaj ulubione utwory 🚀 i zgłaszaj swoich ulubionych artystów.',
    };
  }
  const place = track.rank ? `jest na ${track.rank}. miejscu notowania` : 'jest w notowaniu';
  return {
    url: `${SITE}/topTEN/utwor/${track.id}`,
    title: `„${track.title}” — ${track.artist} | topTEN`,
    text: `🎵 „${track.title}” — ${track.artist} ${place} topTEN Polskiego Radia Christian Culture! 🧡 Zagłosuj LubięTO (raz dziennie) i podbij utwór 🚀 — każdy głos się liczy.`,
  };
}

function fullMessage(c) {
  return `${c.text}\n\n👉 ${c.url}\n\n✍️ Masz ulubionego artystę chrześcijańskiego? Zgłoś go do notowań: ${NOMINATE_URL}`;
}

// GA4 (standard CC): window.ccTrack z /js/cc-analytics.js. Linki wa.me / facebook / t.me / x oraz navigator.share
// liczy sam tracker — tutaj tylko metody, których nie rozpoznaje (e-mail, SMS, Messenger, kopia, grafika).
const ccEvent = (name, params) => { try { window.ccTrack?.(name, params); } catch { /* analityka opcjonalna */ } };
function trackShare(method, track) {
  ccEvent('share', { method, content_type: track ? 'topten_track' : 'topten_chart', item_id: track?.id || 'topten' });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => (img.naturalWidth > 120 ? resolve(img) : reject(new Error('placeholder')));
    img.onerror = reject;
    img.src = src;
  });
}

function wrapLines(ctx, text, maxWidth, maxLines) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth || !line) line = test;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    let last = lines[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length) last = last.slice(0, -1);
    lines[maxLines - 1] = `${last.trim()}…`;
  }
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Grafika 1080×1350 z kadrem teledysku — dołączana do udostępnień. */
async function buildShareCard(track) {
  const W = 1080, H = 1350, PAD = 64;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const font = (weight, size) => `${weight} ${size}px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0, 0, W, H);

  // Nagłówek: Polskie Radio Christian Culture | topTEN
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = font(600, 30);
  ctx.fillText('Polskie Radio', PAD, 92);
  ctx.font = font(800, 30);
  ctx.fillText('Christian Culture', PAD, 128);
  ctx.font = font(900, 74);
  const topW = ctx.measureText('top').width;
  const tenW = ctx.measureText('TEN').width;
  const brandX = W - PAD - topW - tenW;
  ctx.fillText('top', brandX, 128);
  ctx.fillStyle = '#FF7A00';
  ctx.fillText('TEN', brandX + topW, 128);

  // Kadr z teledysku
  const imgY = 176, imgH = Math.round(W * 9 / 16);
  let img = null;
  if (track.youtubeId) {
    img = await loadImage(`https://i.ytimg.com/vi/${track.youtubeId}/maxresdefault.jpg`)
      .catch(() => loadImage(`https://i.ytimg.com/vi/${track.youtubeId}/hqdefault.jpg`)).catch(() => null);
  } else if (track.cover) {
    img = await loadImage(track.cover).catch(() => null);
  }
  if (img) {
    const scale = Math.max(W / img.naturalWidth, imgH / img.naturalHeight);
    const sw = W / scale, sh = imgH / scale;
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, imgY, W, imgH);
  } else {
    const g = ctx.createLinearGradient(0, imgY, W, imgY + imgH);
    g.addColorStop(0, '#E66A00'); g.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = g; ctx.fillRect(0, imgY, W, imgH);
  }
  // przycisk ▶
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.beginPath(); ctx.arc(W / 2, imgY + imgH / 2, 70, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(W / 2 - 22, imgY + imgH / 2 - 36); ctx.lineTo(W / 2 + 40, imgY + imgH / 2); ctx.lineTo(W / 2 - 22, imgY + imgH / 2 + 36); ctx.closePath(); ctx.fill();
  // miejsce
  if (track.rank) {
    ctx.fillStyle = '#FF7A00';
    ctx.fillRect(PAD, imgY + 32, 132, 132);
    ctx.fillStyle = '#111';
    ctx.font = font(900, track.rank > 9 ? 78 : 96);
    ctx.textAlign = 'center';
    ctx.fillText(String(track.rank), PAD + 66, imgY + 32 + 100);
    ctx.textAlign = 'left';
  }

  // Tytuł, wykonawca, punkty
  let y = imgY + imgH + 92;
  ctx.fillStyle = '#ffffff';
  ctx.font = font(800, 62);
  const titleLines = wrapLines(ctx, track.title, W - PAD * 2, 2);
  for (const l of titleLines) { ctx.fillText(l, PAD, y); y += 74; }
  ctx.fillStyle = '#d0d0d0';
  ctx.font = font(600, 40);
  ctx.fillText(wrapLines(ctx, track.artist, W - PAD * 2, 1)[0], PAD, y + 4);
  y += 70;
  const stat = `${fmtPoints(track.score)} pkt${track.rank ? ` • miejsce ${track.rank}` : ''}`;
  ctx.font = font(700, 32);
  const statW = ctx.measureText(stat).width + 44;
  ctx.fillStyle = '#222'; roundRect(ctx, PAD, y - 40, statW, 58, 12); ctx.fill();
  ctx.fillStyle = '#FF8C33'; ctx.fillText(stat, PAD + 22, y);

  // Wezwanie do działania
  const boxY = H - 252;
  ctx.fillStyle = '#FF7A00'; roundRect(ctx, PAD, boxY, W - PAD * 2, 120, 22); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.font = font(900, 40);
  ctx.textAlign = 'center';
  ctx.fillText('Zagłosuj LubięTO 🧡 i podbij 🚀', W / 2, boxY + 54);
  ctx.font = font(700, 32);
  ctx.fillText('polskieradio.cc/topTEN', W / 2, boxY + 98);
  ctx.fillStyle = '#bdbdbd';
  ctx.font = font(500, 28);
  ctx.fillText('Masz ulubionego artystę? Zgłoś go: polskieradio.cc/topTEN/nominacje', W / 2, H - 70);
  ctx.textAlign = 'left';

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

async function showShareSheet(trackId) {
  const track = trackId ? findTrack(trackId) : null;
  const c = shareContent(track);
  const msg = fullMessage(c);
  const enc = encodeURIComponent;
  // [nazwa, adres, liczone przez cc-analytics?]
  const links = [
    ['WhatsApp', `https://wa.me/?text=${enc(msg)}`, true],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(c.url)}`, true],
    ...(isMobile() ? [['Messenger', `fb-messenger://share/?link=${enc(c.url)}`, false]] : []),
    ['Telegram', `https://t.me/share/url?url=${enc(c.url)}&text=${enc(`${c.text}\n\n✍️ Zgłoś ulubionego artystę: ${NOMINATE_URL}`)}`, true],
    ['X', `https://twitter.com/intent/tweet?text=${enc(c.text)}&url=${enc(c.url)}`, true],
    ['E-mail', `mailto:?subject=${enc(c.title)}&body=${enc(msg)}`, false],
    ['SMS', `sms:?&body=${enc(msg)}`, false],
  ];
  state.openTrackId = null;
  showModal(track ? 'Udostępnij utwór' : 'Udostępnij notowanie topTEN', `
    <div style="line-height: 1.5;">
      ${track ? `<div id="shareCardBox" style="margin-bottom: 12px; text-align: center;"><p class="vote-info-note">Przygotowuję grafikę utworu…</p></div>` : ''}
      <p style="font-size: 13px; color: #444; background: #fdfaf6; border: 1px solid #fae2cc; border-radius: 8px; padding: 10px 12px; white-space: pre-line; word-break: break-word;">${escapeHtml(msg)}</p>
      <div class="vote-action-row">
        ${navigator.share ? `<button class="btn-action btn-lubieto" type="button" id="btnNativeShare">📤 ${track ? 'Udostępnij z grafiką' : 'Udostępnij'}</button>` : ''}
        <button class="btn-action" type="button" id="btnCopyShare">🔗 Kopiuj wiadomość</button>
      </div>
      <div class="share-grid">
        ${links.map(([name, href, auto]) => auto
          ? `<a class="btn-action share-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a>`
          : `<button class="btn-action share-link" type="button" data-href="${escapeHtml(href)}" data-method="${escapeHtml(name.toLowerCase())}">${escapeHtml(name)}</button>`).join('')}
        ${track ? '<a class="btn-action share-link" id="btnDownloadCard" href="#" data-method="image_download" aria-disabled="true">⬇ Pobierz grafikę</a>' : ''}
      </div>
      <p class="vote-info-note">Udostępniony link pokazuje kadr z teledysku, tytuł i zachętę do głosowania. Grafikę możesz też dodać do relacji lub posta.</p>
    </div>
  `);

  let cardFile = null;
  if (track) {
    buildShareCard(track).then((blob) => {
      const box = $('#shareCardBox');
      if (!blob || !box) return;
      cardFile = new File([blob], `topTEN-${track.id}.png`, { type: 'image/png' });
      const src = URL.createObjectURL(blob);
      box.innerHTML = `<img src="${src}" alt="Grafika do udostępnienia: ${escapeHtml(track.title)} — ${escapeHtml(track.artist)}" style="width: 100%; max-width: 280px; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,0,0,.18);">`;
      const dl = $('#btnDownloadCard');
      if (dl) { dl.href = src; dl.download = cardFile.name; dl.removeAttribute('aria-disabled'); dl.target = '_self'; }
    }).catch(() => { const box = $('#shareCardBox'); if (box) box.innerHTML = ''; });
  }

  $('#btnNativeShare')?.addEventListener('click', async () => {
    const data = { title: c.title, text: `${c.text}\n\n✍️ Zgłoś ulubionego artystę: ${NOMINATE_URL}`, url: c.url };
    try {
      if (cardFile && navigator.canShare?.({ files: [cardFile] })) {
        await navigator.share({ ...data, text: `${data.text}\n\n👉 ${c.url}`, files: [cardFile] });
      } else {
        await navigator.share(data);
      }
    } catch (e) {
      if (e?.name !== 'AbortError') showToast('Udostępnianie nie powiodło się — użyj przycisków poniżej.');
    }
  });
  $('#btnCopyShare')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(msg)
      .then(() => { showToast('Skopiowano wiadomość z linkiem — wklej ją w dowolnej aplikacji.'); trackShare('copy', track); })
      .catch(track404);
  });
  $('#modalBody').querySelectorAll('.share-link').forEach(a => {
    a.addEventListener('click', (e) => {
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); showToast('Grafika jeszcze się przygotowuje…'); return; }
      if (!a.dataset.method) return; // liczy cc-analytics
      trackShare(a.dataset.method, track);
      if (a.dataset.href) window.location.href = a.dataset.href;
    });
  });
}

// ─── Akcje ───────────────────────────────────────────────────────────────────
async function requireLogin() {
  if (state.user) return true;
  try {
    await window.ccTopTenAuth.signIn();
    return true;
  } catch {
    showToast('Logowanie przerwane.');
    return false;
  }
}

async function handleVote(trackId, action) {
  if (state.busy || !(await requireLogin())) return;
  state.busy = true;
  openTrackModal(trackId, { keepFocus: true });
  try {
    const res = await api(`/api/topten/tracks/${encodeURIComponent(trackId)}/${action}`, { method: 'POST', auth: true, idempotent: true });
    if (state.me && res.me) state.me.tracks[trackId] = res.me;
    if (res.charts && !state.viewCycle) state.charts = res.charts;
    if (!res.replay) ccEvent('topten_vote', { vote_type: action, item_id: trackId, rank: findTrack(trackId)?.rank ?? 0 });
    const title = findTrack(trackId)?.title || '';
    showToast(action === 'like'
      ? `🎉 Dziękujemy! +777 pkt LubięTO dla „${title}”. Udostępnij utwór i poproś znajomych o głos 📤`
      : `🚀 Podbito „${title}” o +77 pkt (${res.me?.boostsToday ?? '?'}/7 dziś).`);
  } catch (e) {
    showToast(e.message);
    if (e.status === 401) state.user = null;
  } finally {
    state.busy = false;
    await loadMe();
    await loadCharts();
  }
}

async function enablePush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
  if (permission !== 'granted') return 'denied';
  const { publicKey } = await api('/api/topten/push/key');
  const reg = await navigator.serviceWorker.register('/topTEN/sw.js', { scope: '/topTEN/' });
  await navigator.serviceWorker.ready;
  const raw = atob(publicKey.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(publicKey.length / 4) * 4, '='));
  const sub = (await reg.pushManager.getSubscription())
    || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: Uint8Array.from(raw, c => c.charCodeAt(0)) });
  await api('/api/topten/push/subscribe', { method: 'POST', auth: true, body: { endpoint: sub.endpoint } });
  return 'enabled';
}

async function disablePush() {
  const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration('/topTEN/') : null;
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  if (!sub) return false;
  await api('/api/topten/push/subscribe', { method: 'DELETE', auth: true, body: { endpoint: sub.endpoint } }).catch(() => {});
  await sub.unsubscribe();
  return true;
}

async function handleFollowTrack(trackId) {
  if (state.busy || !(await requireLogin())) return;
  const following = !!state.me?.tracks?.[trackId]?.following;
  state.busy = true;
  try {
    await api(`/api/topten/tracks/${encodeURIComponent(trackId)}/follow`, { method: following ? 'DELETE' : 'POST', auth: true });
    if (!following) ccEvent('topten_follow', { item_id: trackId });
    const title = findTrack(trackId)?.title || '';
    if (following) {
      showToast(`Wyłączono obserwowanie „${title}”.`);
    } else {
      let push = 'error';
      try { push = await enablePush(); } catch { push = 'error'; }
      showToast(push === 'enabled'
        ? `🔔 Obserwujesz „${title}”. Powiadomimy Cię o dużych awansach i wejściu do TOP 10 (bez nocnych alertów).`
        : `☆ Obserwujesz „${title}”. Powiadomienia push są wyłączone w tej przeglądarce.`);
    }
  } catch (e) {
    showToast(e.message);
  } finally {
    state.busy = false;
    await loadMe();
    openTrackModal(trackId, { keepFocus: true });
  }
}

function updateLoginButton() {
  const btn = $('#loginButton');
  if (!btn) return;
  btn.textContent = state.user ? 'Konto' : 'Zaloguj';
  btn.setAttribute('aria-label', state.user ? 'Moje konto topTEN' : 'Zaloguj się kontem Google');
}

function showAccountModal() {
  if (!state.user) {
    showModal('Logowanie do konta Christian Culture', `
      <div style="line-height: 1.6;">
        <p>Zaloguj się kontem Google, aby głosować <strong>LubięTO</strong> i <strong>PodbijTO</strong> oraz obserwować utwory. To samo konto działa w całym ekosystemie Christian Culture (LUMINA).</p>
        <p style="font-size: 13px; color: #666;">Głosy liczy serwer — jedno konto to jeden słuchacz. Nie publikujemy, kto na co głosował.</p>
        <button class="primary-btn" type="button" data-login="true">Zaloguj przez Google →</button>
      </div>`);
    return;
  }
  showModal('Moje konto topTEN', `
    <div style="line-height: 1.6;">
      <p>Zalogowano jako <strong>${escapeHtml(state.user.name)}</strong>.</p>
      <div class="vote-action-row">
        <button class="btn-action btn-follow" type="button" id="btnPushOff">🔕 Wyłącz powiadomienia push</button>
        <button class="btn-action" type="button" id="btnLogout">Wyloguj</button>
      </div>
    </div>`);
  $('#btnPushOff')?.addEventListener('click', async () => {
    showToast((await disablePush().catch(() => false)) ? 'Powiadomienia push wyłączone.' : 'Powiadomienia nie były włączone w tej przeglądarce.');
  });
  $('#btnLogout')?.addEventListener('click', async () => { await window.ccTopTenAuth.signOut(); closeModal(); showToast('Wylogowano.'); });
}

async function showArchive() {
  showModal('Archiwum notowań topTEN', '<p>Wczytywanie listy tygodni…</p>');
  try {
    const { items } = await api('/api/topten/cycles');
    const closed = items.filter(c => c.status === 'closed');
    $('#modalBody').innerHTML = `
      <p>Każdy tydzień zamyka się w niedzielę o 23:59 czasu polskiego. Wynik zamkniętego tygodnia nie zmienia się.</p>
      ${closed.length ? `<ul style="list-style: none; padding: 0;">${closed.map(c => `
        <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
          <button type="button" class="view-all" data-cycle="${escapeHtml(c.id)}">Tydzień ${fmtDate(c.id)} – ${fmtDate(c.end.slice(0, 10))} →</button>
        </li>`).join('')}</ul>` : '<p><strong>Pierwsze notowanie wciąż trwa</strong> — archiwum pojawi się po jego zamknięciu.</p>'}`;
  } catch (e) {
    $('#modalBody').innerHTML = `<p>${escapeHtml(e.message)}</p>`;
  }
}

// ─── Start ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCharts();
  loadCharts().then(() => {
    const hashId = decodeURIComponent(location.hash.slice(1));
    if (hashId.startsWith('CC-TT-')) openTrackModal(hashId);
  });

  setInterval(() => {
    if (document.visibilityState === 'visible' && !state.viewCycle && !state.busy) loadCharts();
  }, POLL_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !state.viewCycle) loadCharts();
  });

  window.addEventListener('topten-auth', async (e) => {
    state.user = e.detail;
    updateLoginButton();
    await loadMe();
    if (state.openTrackId && !$('#modal').hidden) openTrackModal(state.openTrackId, { keepFocus: true });
  });

  const sections = $('#sections');
  sections?.addEventListener('click', (e) => {
    if (e.target.closest('[data-back-live]')) { state.viewCycle = null; loadCharts(); return; }
    if (e.target.closest('[data-share-chart]')) { showShareSheet(null); return; }
    const card = e.target.closest('[data-track-id]');
    if (card) { openTrackModal(card.dataset.trackId); return; }
    if (e.target.closest('[data-chart]')) {
      showModal('Zasady notowań topTEN', `
        <div style="line-height: 1.6;">
          <h3>Jak liczone są punkty w notowaniach?</h3>
          <ul>
            <li><strong>🧡 LubięTO (+777 pkt):</strong> jeden głos na utwór na dobę (czas polski) z jednego konta.</li>
            <li><strong>🚀 PodbijTO (+77 pkt):</strong> do 7 razy na dobę na utwór, w odstępach minimum 60 minut.</li>
            <li><strong>🤝 wspieramTO:</strong> bezpośrednie wsparcie artysty — bez wpływu na punkty.</li>
          </ul>
          <p>Jeden słuchacz może dać utworowi najwyżej 1316 pkt dziennie (777 + 7 × 77). Przy remisie wyżej jest utwór z większą liczbą głosujących, potem z większą liczbą LubięTO, potem ten, który wcześniej osiągnął wynik.</p>
          <p>Tydzień notowania trwa od poniedziałku 00:00 do niedzieli 23:59 czasu polskiego. Głosy podejrzane o nadużycie mogą zostać wstrzymane przez redakcję.</p>
        </div>`);
    }
  });
  sections?.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-track-id]')) {
      e.preventDefault();
      openTrackModal(e.target.dataset.trackId);
    }
  });

  $('#modalClose')?.addEventListener('click', closeModal);
  $('#modal')?.addEventListener('click', async (e) => {
    if (e.target.dataset.close || e.target.closest('[data-close-modal]')) { closeModal(); return; }
    if (e.target.closest('[data-login]')) {
      if (await requireLogin()) { if (!state.openTrackId) closeModal(); showToast('Zalogowano. Możesz głosować!'); }
      return;
    }
    const cycleBtn = e.target.closest('[data-cycle]');
    if (cycleBtn) {
      state.viewCycle = cycleBtn.dataset.cycle;
      closeModal();
      await loadCharts();
      $('#notowania')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#modal')?.hidden) closeModal();
  });

  $('#menuToggle')?.addEventListener('click', () => {
    const open = $('#sidebar')?.classList.toggle('open');
    $('#menuToggle')?.setAttribute('aria-expanded', String(open));
  });
  $('#searchToggle')?.addEventListener('click', () => {
    const field = $('#searchBar');
    if (!field) return;
    field.hidden = !field.hidden;
    if (!field.hidden) $('#siteSearch')?.focus();
  });
  $('#siteSearch')?.addEventListener('input', (e) => renderCharts(e.target.value));
  $('#clearSearch')?.addEventListener('click', () => {
    const inp = $('#siteSearch');
    if (inp) inp.value = '';
    renderCharts();
    inp?.focus();
  });

  $('#loginButton')?.addEventListener('click', showAccountModal);
  $('#voteInfo')?.addEventListener('click', () => {
    showModal('Zasady głosowania topTEN', `
      <div style="line-height: 1.6;">
        <h3>Regulamin głosowania:</h3>
        <p>1. Głosować mogą zalogowani słuchacze (konto Google z potwierdzonym adresem e-mail).</p>
        <p>2. Każdy słuchacz ma 1 głos <strong>LubięTO (+777 pkt)</strong> na dobę na dany utwór.</p>
        <p>3. Dodatkowo przysługuje maksymalnie 7 akcji <strong>PodbijTO (+77 pkt)</strong> na dobę na utwór, z minimalnym odstępem 60 minut.</p>
        <p>4. Głosowanie jest w 100% bezpłatne. Limity sprawdza serwer; głosy podejrzane o nadużycie (boty, masowe konta) mogą zostać wstrzymane przez redakcję.</p>
        <p><a href="/topTEN/regulamin.html" style="color: #FF7A00; font-weight: 700;">Przeczytaj pełny regulamin notowań →</a></p>
      </div>`);
  });
  $('#nominationButton')?.addEventListener('click', () => { window.location.href = '/topTEN/nominacje'; });
  $('#archiveButton')?.addEventListener('click', showArchive);
});
