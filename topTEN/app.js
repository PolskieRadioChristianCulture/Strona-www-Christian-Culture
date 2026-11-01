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

const STORAGE_KEY_STATE = 'cc_topten_state_v2';
const STORAGE_KEY_ACTIONS = 'cc_topten_actions_v2';

const pictureIds = [
  'photo-1500530855697-b586d89ba3ee', 'photo-1470252649378-9c29740c9fa8',
  'photo-1516280440614-37939bbacd81', 'photo-1441974231531-c6227db76b6e',
  'photo-1438232992991-995b7058bbb3', 'photo-1500534623283-312aade485b7',
  'photo-1519608487953-e999c86e7455', 'photo-1470770841072-f978cf4d019e',
  'photo-1490750967868-88aa4486c946', 'photo-1519681393784-d120267933ba',
  'photo-1497366754035-f200968a6e72', 'photo-1473448912268-2022ce9509d8',
  'photo-1481627834876-b7833e8f5570', 'photo-1451187580459-43490279c0fa',
  'photo-1502082553048-f009c37129b9'
];
const photo = (n) => `https://images.unsplash.com/${pictureIds[n % pictureIds.length]}?auto=format&fit=crop&w=720&q=82`;

const DEFAULT_TRACKS = [
  { id: 'tt-01', title: 'Większy niż lęk', artist: 'Mateusz Nowak', score: 2331, prevRank: 1, uniqueLikers: 142, boosts: 21, cover: photo(0), genre: 'worship', bibleRef: 'Ps 27:1 — Pan jest moim światłem i zbawieniem, kogo mam się lękać?', support: { method: 'Zrzutka.pl', desc: 'Nagranie nowego albumu uwielbieniowego', url: 'https://zrzutka.pl' } },
  { id: 'tt-02', title: 'Twoja łaska', artist: 'Anna Lech', score: 2185, prevRank: 3, uniqueLikers: 129, boosts: 18, cover: photo(1), genre: 'worship', bibleRef: '2 Kor 12:9 — Wystarczy ci moja łaska, moc bowiem w słabości się doskonali.', support: { method: 'Revolut', desc: 'Wsparcie autorskich nagrań studyjnych', url: 'https://revolut.me' } },
  { id: 'tt-03', title: 'Jezus żyje', artist: 'Zespół Źródło', score: 1943, prevRank: 2, uniqueLikers: 118, boosts: 15, cover: photo(2), genre: 'gospel', bibleRef: 'Łk 24:6 — Nie ma go tu, ale zmartwychwstał!', support: { method: 'BLIK', desc: 'Wsparcie ewangelizacyjnej trasy koncertowej', url: 'https://polskieradio.cc/topTEN/#wspieramto' } },
  { id: 'tt-04', title: 'Prowadź mnie', artist: 'Nowe Serce', score: 1720, prevRank: 4, uniqueLikers: 104, boosts: 12, cover: photo(3), genre: 'pop', bibleRef: 'Prz 3:5-6 — Zaufaj Panu z całego serca, a On wyprostuje twoje ścieżki.', support: { method: 'Patronite', desc: 'Comiesięczne wsparcie twórczości', url: 'https://patronite.pl' } },
  { id: 'tt-05', title: 'Dom u Ciebie', artist: 'Emilia Król', score: 1590, prevRank: 6, uniqueLikers: 95, boosts: 11, cover: photo(4), genre: 'worship', bibleRef: 'Ps 84:4 — Błogosławieni, którzy mieszkają w Twoim domu, będą Cię chwalić.', support: { method: 'PayPal', desc: 'Wsparcie produkcji teledysków', url: 'https://paypal.me' } },
  { id: 'tt-06', title: 'Światło w ciemności', artist: 'Jakub Mularczyk', score: 1412, prevRank: 5, uniqueLikers: 88, boosts: 9, cover: photo(5), genre: 'debiuty', bibleRef: 'J 8:12 — Ja jestem światłością świata; kto idzie za mną, nie będzie błądził w ciemności.', support: { method: 'Zrzutka.pl', desc: 'Debiutancka płyta EP', url: 'https://zrzutka.pl' } },
  { id: 'tt-07', title: 'Zwycięstwo w Tobie', artist: 'Grupa Pokolenie', score: 1280, prevRank: 8, uniqueLikers: 79, boosts: 8, cover: photo(6), genre: 'rock', bibleRef: '1 Kor 15:57 — Lecz Bogu niech będą dzięki, który nam daje zwycięstwo przez Pana naszego Jezusa Chrystusa.', support: { method: 'BLIK', desc: 'Sprzęt nagłośnieniowy dla młodzieży', url: 'https://polskieradio.cc/topTEN/#wspieramto' } },
  { id: 'tt-08', title: 'W Twojej obecności', artist: 'Lena Sadowska', score: 1150, prevRank: 7, uniqueLikers: 71, boosts: 6, cover: photo(7), genre: 'pop', bibleRef: 'Ps 16:11 — Ukażesz mi ścieżkę życia, pełnię radości w Twojej obecności.', support: { method: 'Revolut', desc: 'Aranżacje smyczkowe', url: 'https://revolut.me' } },
  { id: 'tt-09', title: 'Dzięki Ci, Panie', artist: 'Tomasz Wójcik', score: 994, prevRank: 10, uniqueLikers: 63, boosts: 5, cover: photo(8), genre: 'gospel', bibleRef: 'Ps 107:1 — Dziękujcie Panu, bo jest dobry, bo na wieki Jego łaskawość.', support: { method: 'Zrzutka.pl', desc: 'Chrześcijański projekt akustyczny', url: 'https://zrzutka.pl' } },
  { id: 'tt-10', title: 'Na zawsze wierny', artist: 'Natalia Bielska', score: 875, prevRank: 9, uniqueLikers: 55, boosts: 4, cover: photo(9), genre: 'debiuty', bibleRef: 'Lm 3:22-23 — Nie wyczerpała się litość Pana, odnawiają się każdego poranka; wielka jest wierność Twoja.', support: { method: 'Patronite', desc: 'Tworzenie pieśni uwielbienia', url: 'https://patronite.pl' } }
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
        <h2>TopTen Global <span style="font-size: 14px; font-weight: 700; color: #2ecc71; vertical-align: middle; margin-left: 8px;">● NA ŻYWO</span></h2>
        <button class="view-all" data-chart="notowania" aria-label="Szczegóły notowania">ZASADY PUNKTACJI <span>→</span></button>
      </div>
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
      </div>
    </div>

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
        ${track.support ? `
          <button class="btn-action btn-support-artist" id="btnTrackSupport">
            🤝 Wspieram artystę (${escapeHtml(track.support.method)})
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
  $('#btnTrackSupport')?.addEventListener('click', () => {
    if (track.support?.url) {
      window.open(track.support.url, '_blank', 'noopener,noreferrer');
      showToast(`Przekierowanie do bezpośredniego wsparcia: ${track.support.method}`);
    }
  });
  $('#btnTrackFollow')?.addEventListener('click', () => handleFollowTrack(track.id));
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
