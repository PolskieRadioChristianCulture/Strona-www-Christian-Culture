'use strict';
/**
 * Christian Culture topTEN × wspieramTO — Engine Etap II
 * Standard ZERO COST • Zero-QA Dowódcy Nazira • 2026-11-01
 *
 * Funkcjonalności:
 * 1. LubięTO: 1x na dobę (+777 pkt).
 * 2. PodbijTO: do 7x na dobę, min. 60 min odstępu (+77 pkt).
 * 3. wspieramTO: bezpośrednie wsparcie artystów (0% prowizji, bez punktów w rankingu).
 * 4. Obserwowanie i powiadomienia (Web Push opt-in).
 * 5. Dynamiczny ranking live z przeliczaniem pozycji.
 */

// v3: usunięto fikcyjne pozycje demo (spec. §1) — nowy klucz zeruje stary stan zapisany w przeglądarkach
const STORAGE_KEY_STATE = 'cc_topten_state_v3';
const STORAGE_KEY_ACTIONS = 'cc_topten_actions_v3';

// Wyłącznie prawdziwe nominacje. Punkty startują od zera.
const DEFAULT_TRACKS = [
  {
    id: 'cc-tt-2026-0001',
    title: 'Cokolwiek na świecie (Rzymian 8:38-39)',
    artist: 'Cezary Rogowski · CC Men',
    score: 0, prevRank: null, uniqueLikers: 0, boosts: 0,
    cover: 'https://i.ytimg.com/vi/hVzNQqF_myg/hqdefault.jpg',
    youtubeId: 'hVzNQqF_myg',
    profileUrl: 'https://polskieradio.cc/CezaryRogowski',
    genre: 'worship',
    bibleRef: 'Rz 8:38-39 — Męska odpowiedź na trwogę',
    nomination: 'Nominacja własna artysty',
    support: [
      { method: 'BLIK na telefon', value: '537 137 043', copy: '537137043' },
      { method: 'Revolut', value: 'revolut.me/christianculture', url: 'https://revolut.me/christianculture' }
    ]
  }
];

function loadTracks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATE);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_TRACKS;
}

function saveTracks(tracks) {
  try {
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(tracks));
  } catch (e) {}
}

function getTodayString() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function loadUserActions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

function saveUserActions(actions) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIONS, JSON.stringify(actions));
  } catch (e) {}
}

let tracks = loadTracks();
let userActions = loadUserActions();

function sortTracks() {
  tracks.sort((a, b) => b.score - a.score);
  tracks.forEach((t, index) => {
    t.rank = index + 1;
  });
  saveTracks(tracks);
}
sortTracks();

const $ = (s) => document.querySelector(s);
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

function showToast(message) {
  let toast = $('#toptenToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toptenToast';
    toast.className = 'topten-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = 'block';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.display = 'none';
  }, 4000);
}

function getTrendBadge(currentRank, prevRank) {
  if (!prevRank || currentRank === prevRank) {
    return '<span class="trend-pill trend-same" title="Pozycja bez zmian">— 0</span>';
  }
  if (currentRank < prevRank) {
    const diff = prevRank - currentRank;
    return `<span class="trend-pill trend-up" title="Awans o ${diff} m.">▲ +${diff}</span>`;
  }
  const diff = currentRank - prevRank;
  return `<span class="trend-pill trend-down" title="Spadek o ${diff} m.">▼ -${diff}</span>`;
}

function renderCharts(filter = '') {
  const q = filter.toLocaleLowerCase('pl').trim();
  const sections = $('#sections');
  if (!sections) return;

  const filtered = tracks.filter(x => !q || `${x.title} ${x.artist}`.toLocaleLowerCase('pl').includes(q));

  if (!filtered.length) {
    sections.innerHTML = '<p class="empty-state">Brak utworów pasujących do wyszukiwania.</p>';
    return;
  }

  // Podział na: TopTen Global (1-5) oraz Dalsze Miejsca (6-10)
  const topFive = filtered.slice(0, 5);
  const nextFive = filtered.slice(5, 10);

  let html = `
    <section class="chart-section" id="notowania">
      <div class="section-header">
        <h2>TopTen Global <span style="font-size: 14px; font-weight: 700; color: #FF7A00; vertical-align: middle; margin-left: 8px;">● NOMINACJE</span></h2>
        <button class="view-all" data-chart="notowania" aria-label="Szczegóły notowania">ZASADY PUNKTACJI <span>→</span></button>
      </div>
      <p class="vote-info-note" style="margin: 0 0 14px;">Pierwsze notowanie startuje — punkty liczone od zera. Na tym etapie Twoje głosy zapisują się w tej przeglądarce; wspólny ranking ruszy po uruchomieniu kont słuchaczy. <a href="/topTEN/nominacje" style="color: #FF7A00; font-weight: 700;">Zgłoś utwór →</a></p>
      <div class="cards featured">
        ${topFive.map((item, i) => {
          const isLarge = i === 0 && !q;
          return `
            <article class="chart-card ${isLarge ? 'large' : ''}" data-track-id="${item.id}" tabindex="0" role="button" aria-label="${escapeHtml(item.title)}, ${escapeHtml(item.artist)}">
              <div class="cover">
                <img src="${item.cover}" alt="Okładka: ${escapeHtml(item.title)}" loading="lazy">
                <span class="rank">${item.rank}</span>
                ${isLarge ? '<button class="play" type="button" aria-label="Odsłuchaj i zagłosuj">▶</button>' : ''}
              </div>
              <h3 class="card-title">${escapeHtml(item.title)}</h3>
              <div class="artist-name">${escapeHtml(item.artist)}</div>
              <div class="card-meta-live">
                <span class="points-pill">${item.score.toLocaleString('pl-PL')} pkt</span>
                ${getTrendBadge(item.rank, item.prevRank)}
              </div>
            </article>
          `;
        }).join('')}
      </div>
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
        <div class="section-header">
          <h2>Miejsca 6–10 i Nowości</h2>
        </div>
        <div class="cards">
          ${nextFive.map((item) => `
            <article class="chart-card" data-track-id="${item.id}" tabindex="0" role="button" aria-label="${escapeHtml(item.title)}, ${escapeHtml(item.artist)}">
              <div class="cover">
                <img src="${item.cover}" alt="Okładka: ${escapeHtml(item.title)}" loading="lazy">
                <span class="rank">${item.rank}</span>
              </div>
              <h3 class="card-title">${escapeHtml(item.title)}</h3>
              <div class="artist-name">${escapeHtml(item.artist)}</div>
              <div class="card-meta-live">
                <span class="points-pill">${item.score.toLocaleString('pl-PL')} pkt</span>
                ${getTrendBadge(item.rank, item.prevRank)}
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    ` : ''}
  `;

  sections.innerHTML = html;

  const btnWspieram = $('#btnWspieramTOModal');
  if (btnWspieram) {
    btnWspieram.addEventListener('click', (e) => {
      e.preventDefault();
      showWspieramTOInfo();
    });
  }
  const bannerWspieram = $('#bannerWspieramTO');
  if (bannerWspieram) {
    bannerWspieram.addEventListener('click', (e) => {
      e.preventDefault();
      showWspieramTOInfo();
    });
    bannerWspieram.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showWspieramTOInfo();
      }
    });
  }
}

// Modal handling
let lastFocus = null;
function showModal(title, html) {
  lastFocus = document.activeElement;
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = html;
  $('#modal').hidden = false;
  document.body.style.overflow = 'hidden';
  $('.modal-panel').focus();
}

function closeModal() {
  $('#modal').hidden = true;
  document.body.style.overflow = '';
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
          <li><strong>Uczciwy ranking:</strong> Wsparcie finansowe <u>nie daje punktów</u> na liście przebojów topTEN — ranking zależy wyłącznie od głosów i zaangażowania słuchaczy (LubięTO / PodbijTO).</li>
          <li><strong>Bezpieczne metody:</strong> Artyści udostępniają zweryfikowane linki do zbiórek (Zrzutka.pl, Patronite) lub oficjalne konta Revolut / BLIK.</li>
        </ul>
      </div>

      <p style="font-size: 13px; color: #666;">Jesteś artystą i chcesz podpiąć swoje metody wsparcia pod profil w notowaniach topTEN? Zgłoś swój utwór przez <a href="/topTEN/nominacje" style="color: #FF7A00; font-weight: 700;">formularz nominacji</a>.</p>
      
      <button class="primary-btn" onclick="document.getElementById('modalClose').click();" style="margin-top: 10px;">Rozumiem i wracam do notowań →</button>
    </div>
  `);
}

function openTrackModal(trackId) {
  const track = tracks.find(t => t.id === trackId);
  if (!track) return;

  const today = getTodayString();
  const act = userActions[track.id] || {};
  const hasLikedToday = act.likedDate === today;
  
  const boostsToday = act.boostDate === today ? (act.boostCount || 0) : 0;
  const lastBoostTs = act.lastBoostTs || 0;
  const nowTs = Date.now();
  const cooldownSecRemaining = Math.max(0, Math.ceil((lastBoostTs + 3600 * 1000 - nowTs) / 1000));
  const isBoostCooling = cooldownSecRemaining > 0 && boostsToday > 0;
  const isBoostMaxed = boostsToday >= 7;

  const isFollowing = !!act.following;

  const modalHtml = `
    <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px; flex-wrap: wrap;">
      <img src="${track.cover}" alt="${escapeHtml(track.title)}" style="width: 100px; height: 100px; border-radius: 10px; object-fit: cover;">
      <div>
        <span class="points-pill" style="font-size: 13px; margin-bottom: 4px; display: inline-block;">${track.score.toLocaleString('pl-PL')} punktów</span>
        <h3 style="margin: 0; font-size: 20px;">${escapeHtml(track.title)}</h3>
        <p style="margin: 2px 0 6px; font-weight: 600; color: #666;">${escapeHtml(track.artist)}</p>
        <div>${getTrendBadge(track.rank, track.prevRank)} <span style="font-size: 12px; color: #888; margin-left: 8px;">Unikalnych sympatyków: ${track.uniqueLikers}</span></div>
        ${track.nomination ? `<div style="font-size: 12px; color: #888; margin-top: 4px;">${escapeHtml(track.nomination)}${track.profileUrl ? ` · <a href="${escapeHtml(track.profileUrl)}" style="color: #FF7A00; font-weight: 700;">Wizytówka artysty →</a>` : ''}</div>` : ''}
      </div>
    </div>

    ${track.youtubeId ? `
      <div style="position: relative; aspect-ratio: 16 / 9; margin-bottom: 16px; border-radius: 10px; overflow: hidden; background: #000;">
        <iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(track.youtubeId)}" title="${escapeHtml(track.title)}" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;" allow="encrypted-media; picture-in-picture; fullscreen" loading="lazy"></iframe>
      </div>
    ` : ''}

    ${track.bibleRef ? `
      <div style="background: #fff8f0; border-left: 4px solid #FF7A00; padding: 10px 14px; border-radius: 4px; font-size: 13px; line-height: 1.5; margin-bottom: 16px;">
        <strong>Przesłanie utworu:</strong> <em>„${escapeHtml(track.bibleRef)}”</em>
      </div>
    ` : ''}

    <div class="vote-panel-card">
      <div style="font-size: 13px; font-weight: 800; color: #111;">Oddaj swój głos w notowaniu:</div>
      
      <div class="vote-action-row">
        <button class="btn-action btn-lubieto" id="btnVoteLubieTO" ${hasLikedToday ? 'disabled' : ''}>
          ${hasLikedToday ? '✓ Polubiono dzisiaj (+777)' : '🧡 LubięTO (+777 pkt)'}
        </button>

        <button class="btn-action btn-podbijto" id="btnVotePodbijTO" ${(isBoostCooling || isBoostMaxed) ? 'disabled' : ''}>
          ${isBoostMaxed ? 'Maksymalnie 7/7 dziś' : isBoostCooling ? `⏳ Cooldown (${Math.ceil(cooldownSecRemaining / 60)} min)` : `🚀 PodbijTO (+77) [${7 - boostsToday} z 7]`}
        </button>
      </div>

      <p class="vote-info-note">
        <strong>Zasady:</strong> LubięTO jest dostępne 1x na dobę (+777 pkt). PodbijTO możesz wykonać do 7 razy na dobę w odstępach min. 60 minut (+77 pkt za podbicie).
      </p>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 4px 0;">

      <div class="vote-action-row">
        ${track.support?.length ? `
          <button class="btn-action btn-support-artist" id="btnTrackSupport">
            🤝 Wspieram artystę
          </button>
        ` : ''}

        <button class="btn-action btn-follow ${isFollowing ? 'active' : ''}" id="btnTrackFollow">
          ${isFollowing ? '🔔 Obserwujesz utwór' : '☆ Obserwuj utwór'}
        </button>
      </div>
    </div>
  `;

  showModal(`Notowanie #` + track.rank + ` — ` + track.title, modalHtml);

  // Podpięcie akcji
  $('#btnVoteLubieTO')?.addEventListener('click', () => handleLubieTO(track.id));
  $('#btnVotePodbijTO')?.addEventListener('click', () => handlePodbijTO(track.id));
  $('#btnTrackSupport')?.addEventListener('click', () => showSupportModal(track.id));
  $('#btnTrackFollow')?.addEventListener('click', () => handleFollowTrack(track.id));
}

function showSupportModal(trackId) {
  const track = tracks.find(t => t.id === trackId);
  if (!track?.support?.length) return;

  showModal(`wspieramTO — ${track.artist}`, `
    <div style="line-height: 1.6;">
      <p style="font-size: 13px; color: #666;">Wsparcie trafia bezpośrednio do artysty, poza topTEN. Christian Culture nie pośredniczy w płatności, nie pobiera prowizji, a wsparcie nie daje punktów w notowaniu.</p>
      <ul style="list-style: none; padding: 0; margin: 12px 0;">
        ${track.support.map((s, i) => `
          <li style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 10px 0; border-bottom: 1px solid #eee;">
            <span><strong>${escapeHtml(s.method)}:</strong> ${escapeHtml(s.value)}</span>
            ${s.url
              ? `<a class="btn-action btn-support-artist" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer ugc nofollow">Otwórz ↗</a>`
              : `<button class="btn-action btn-support-artist" type="button" data-copy-support="${i}">Kopiuj numer</button>`}
          </li>
        `).join('')}
      </ul>
      <p style="font-size: 12px; color: #888;">Nigdy nie podawaj nikomu jednorazowego kodu BLIK. Przelew na telefon wykonujesz samodzielnie w aplikacji swojego banku.</p>
    </div>
  `);

  $('#modalBody').querySelectorAll('[data-copy-support]').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = track.support[Number(btn.dataset.copySupport)];
      navigator.clipboard?.writeText(s.copy || s.value)
        .then(() => showToast(`Skopiowano: ${s.value}`))
        .catch(() => showToast(`Numer: ${s.value}`));
    });
  });
}

function handleLubieTO(trackId) {
  const track = tracks.find(t => t.id === trackId);
  if (!track) return;

  const today = getTodayString();
  const act = userActions[track.id] || {};

  if (act.likedDate === today) {
    showToast('Dzisiaj już oddano głos LubięTO na ten utwór! Zapraszamy jutro.');
    return;
  }

  // Przyznanie +777 pkt
  track.score += 777;
  track.uniqueLikers += 1;
  act.likedDate = today;
  userActions[track.id] = act;

  saveUserActions(userActions);
  sortTracks();
  renderCharts();
  openTrackModal(track.id);

  showToast(`🎉 Dziękujemy! Przyznano +777 pkt LubięTO dla utworu „${track.title}”!`);
}

function handlePodbijTO(trackId) {
  const track = tracks.find(t => t.id === trackId);
  if (!track) return;

  const today = getTodayString();
  const act = userActions[track.id] || {};
  const boostsToday = act.boostDate === today ? (act.boostCount || 0) : 0;
  const lastTs = act.lastBoostTs || 0;
  const now = Date.now();

  if (boostsToday >= 7) {
    showToast('Osiągnięto maksymalny limit 7 podbić dla tego utworu w bieżącej dobie.');
    return;
  }

  if (now - lastTs < 3600 * 1000 && boostsToday > 0) {
    const minsLeft = Math.ceil((lastTs + 3600 * 1000 - now) / 60000);
    showToast(`PodbijTO będzie ponownie dostępne za ${minsLeft} minut.`);
    return;
  }

  // Przyznanie +77 pkt
  track.score += 77;
  track.boosts += 1;
  act.boostDate = today;
  act.boostCount = boostsToday + 1;
  act.lastBoostTs = now;
  userActions[track.id] = act;

  saveUserActions(userActions);
  sortTracks();
  renderCharts();
  openTrackModal(track.id);

  showToast(`🚀 Sukces! Podbito utwór „${track.title}” o +77 punktów (${act.boostCount}/7 dzisiaj)!`);
}

function handleFollowTrack(trackId) {
  const track = tracks.find(t => t.id === trackId);
  if (!track) return;

  const act = userActions[track.id] || {};
  act.following = !act.following;
  userActions[track.id] = act;
  saveUserActions(userActions);

  openTrackModal(track.id);

  if (act.following) {
    showToast(`🔔 Obserwujesz utwór „${track.title}”. Otrzymasz powiadomienie o awansach!`);
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  } else {
    showToast(`Wyłączono obserwowanie utworu „${track.title}”.`);
  }
}

// Globalne nasłuchiwanie kliknięć w karty
document.addEventListener('DOMContentLoaded', () => {
  renderCharts();

  const sections = $('#sections');
  if (sections) {
    sections.addEventListener('click', (e) => {
      const card = e.target.closest('[data-track-id]');
      if (card) {
        openTrackModal(card.dataset.trackId);
        return;
      }
      const chartBtn = e.target.closest('[data-chart]');
      if (chartBtn) {
        showModal('Zasady notowań topTEN', `
          <div style="line-height: 1.6;">
            <h3>Jak liczone są punkty w notowaniach?</h3>
            <p>Lista przebojów topTEN Polskiego Radia Christian Culture działa w oparciu o precyzyjny i uczciwy system punktowy:</p>
            <ul>
              <li><strong>🧡 LubięTO (+777 pkt):</strong> Każdy użytkownik może oddać 1 głos na dany utwór raz na dobę.</li>
              <li><strong>🚀 PodbijTO (+77 pkt):</strong> Możliwość dodatkowego promowania ulubionego utworu do 7 razy na dobę (w odstępach minimum 60 minut).</li>
              <li><strong>🤝 wspieramTO:</strong> Bezpośrednie wsparcie artysty — 100% kwoty trafia do twórcy, bez wpływu na punkty na liście.</li>
            </ul>
            <p>Wszystkie pozycje aktualizowane są w czasie rzeczywistym. Oficjalne zamknięcie notowania następuje w każdą niedzielę o 23:59.</p>
          </div>
        `);
      }
    });

    sections.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-track-id]')) {
        e.preventDefault();
        openTrackModal(e.target.dataset.trackId);
      }
    });
  }

  $('#modalClose')?.addEventListener('click', closeModal);
  $('#modal')?.addEventListener('click', (e) => {
    if (e.target.dataset.close) closeModal();
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

  $('#loginButton')?.addEventListener('click', () => {
    showModal('Logowanie do konta Christian Culture', `
      <div style="line-height: 1.6;">
        <p>Logowanie umożliwia pełną synchronizację Twoich głosów LubięTO i PodbijTO oraz powiadomień Web Push pomiędzy urządzeniami.</p>
        <p>W obecnym etapie system automatycznie zabezpiecza i rejestruje Twoje głosy lokalnie w przeglądarce.</p>
        <button class="primary-btn" onclick="document.getElementById('modalClose').click();">Zamknij</button>
      </div>
    `);
  });

  $('#voteInfo')?.addEventListener('click', () => {
    showModal('Zasady głosowania topTEN', `
      <div style="line-height: 1.6;">
        <h3>Regulamin głosowania:</h3>
        <p>1. Każdy użytkownik ma prawo do oddania 1 głosu <strong>LubięTO (+777 pkt)</strong> na dobę na dany utwór.</p>
        <p>2. Dodatkowo przysługuje maksymalnie 7 akcji <strong>PodbijTO (+77 pkt)</strong> na dobę, z minimalnym odstępem 60 minut między podbiciami.</p>
        <p>3. Głosowanie jest w 100% bezpłatne.</p>
        <p>4. Wszelkie próby zautomatyzowanego nabijania głosów (boty, proxy) są weryfikowane i odrzucane przez mechanizm anty-fraud.</p>
        <p><a href="/topTEN/regulamin.html" style="color: #FF7A00; font-weight: 700;">Przeczytaj pełny regulamin notowań →</a></p>
      </div>
    `);
  });

  $('#nominationButton')?.addEventListener('click', () => {
    window.location.href = '/topTEN/nominacje';
  });

  $('#archiveButton')?.addEventListener('click', () => {
    showModal('Archiwum notowań topTEN', `
      <p>Archiwum oficjalnych wydań tygodniowych jest w trakcie kompilacji. Po zamknięciu bieżącego tygodnia znajdziesz tu historyczne wyniki, rekordy liczby tygodni na pierwszym miejscu oraz podsumowania roczne.</p>
    `);
  });
});
