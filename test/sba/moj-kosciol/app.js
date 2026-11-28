(() => {
  'use strict';

  const API_BASE = '/api/moj-kosciol/v1';
  const CACHE_KEY = 'cc_mk_offline_snapshot_v2';
  const PREFS_KEY = 'cc_mk_user_prefs_v2';
  const NOTES_KEY = 'cc_mk_private_notes_v2';
  const SS_PROGRESS_KEY = 'cc_mk_ss_progress_v2';
  const LIVE_CHANNEL = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('cc_moj_kosciol_live_v2') : null;

  const $ = (id) => document.getElementById(id);
  const state = {
    churches: [],
    profile: null,
    serviceData: null,
    etag: '',
    activeTab: 'dzisiaj',
    ssLang: 'pl',
    ssData: null,
    hymnResults: [],
    templates: [],
    offlineMode: false,
    lastSyncIso: null,
    autoFollow: true,
    pollTimer: null,
    pollDelayMs: 8000,
    prefs: loadJson(PREFS_KEY, {
      preferredChurchSlug: 'warszawa-centrum-demo',
      followedSlugs: ['warszawa-centrum-demo'],
      focusMode: false,
      largeText: false,
      theme: 'dark',
      notifications: { service_new: true, time_change: true, announcement: false, lesson: false, event: false, financial: false },
      quietHours: '22:00–07:00',
      worshipDnd: true
    }),
    privateNotes: loadJson(NOTES_KEY, {}),
    ssProgress: loadJson(SS_PROGRESS_KEY, {})
  };

  function loadJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; }
  }
  function saveJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }

  function toast(msg) {
    const el = $('mkToast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.hidden = true; }, 3400);
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatLocalTime(iso, tz = 'Europe/Warsaw') {
    if (!iso) return '';
    try {
      return new Intl.DateTimeFormat('pl-PL', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
    } catch { return String(iso).slice(11, 16); }
  }

  function formatLocalDateTime(iso, tz = 'Europe/Warsaw') {
    if (!iso) return '';
    try {
      return new Intl.DateTimeFormat('pl-PL', { timeZone: tz, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
    } catch { return String(iso); }
  }

  // Deterministyczny generator siatki QR (wizualny kod 21x21 do podglądu i eksportu PNG bez zewnętrznych API)
  function drawDeterministicQr(canvas, urlText, size = 180) {
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    const cells = 21;
    const pad = 12;
    const cellSize = (size - pad * 2) / cells;
    ctx.fillStyle = '#111111';

    function drawFinder(r0, c0) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const border = r === 0 || r === 6 || c === 0 || c === 6;
          const center = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          if (border || center) {
            ctx.fillRect(pad + (c0 + c) * cellSize, pad + (r0 + r) * cellSize, Math.ceil(cellSize), Math.ceil(cellSize));
          }
        }
      }
    }
    drawFinder(0, 0);
    drawFinder(0, cells - 7);
    drawFinder(cells - 7, 0);

    let seed = 2166136261;
    for (let i = 0; i < urlText.length; i++) {
      seed ^= urlText.charCodeAt(i);
      seed = Math.imul(seed, 16777619);
    }
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        const inFinder = (r < 8 && c < 8) || (r < 8 && c >= cells - 8) || (r >= cells - 8 && c < 8);
        if (inFinder) continue;
        seed ^= (r * 31 + c * 17);
        seed = Math.imul(seed, 16777619);
        if ((seed >>> 0) % 2 === 0) {
          ctx.fillRect(pad + c * cellSize, pad + r * cellSize, Math.ceil(cellSize), Math.ceil(cellSize));
        }
      }
    }
  }

  function buildCanonicalChurchUrl(extra = {}) {
    const slug = state.profile?.church?.slug || 'warszawa-centrum-demo';
    const u = new URL('/test/sba/moj-kosciol/', location.origin);
    u.searchParams.set('church', slug);
    if (extra.event) u.searchParams.set('event', extra.event);
    if (extra.tab) u.hash = extra.tab;
    return u.toString();
  }

  function bibleRefLinks(refStr) {
    const clean = String(refStr || '').trim();
    const sbaStudium = `/sba/studium/?ref=${encodeURIComponent(clean)}&translation=UBG`;
    const mojaBiblia = `/mojabiblia?q=${encodeURIComponent(clean)}`;
    return `
      <a class="mk-ref-link" href="${mojaBiblia}" target="_blank" rel="noopener noreferrer">📖 ${esc(clean)} (MojaBiblia)</a>
      <a class="mk-ref-link" href="${sbaStudium}" target="_blank" rel="noopener noreferrer">🔎 Głębokie studium</a>
    `;
  }

  function buildDemoFallbackData() {
    const nowIso = '2026-11-28T08:00:00.000Z';
    return {
      church: {
        id: 'ch_kads_warszawa_demo',
        slug: 'warszawa-centrum-demo',
        name: 'Zbór KADS Warszawa Centrum (DEMO)',
        denomination: 'Kościół Adwentystów Dnia Siódmego',
        district: 'Diecezja Wschodnia (DEMO)',
        publicAddress: 'ul. Foksal 8, 00-366 Warszawa (przykład DEMO)',
        city: 'Warszawa',
        timezone: 'Europe/Warsaw',
        verificationStatus: 'verified',
        isDemo: true,
        officialDisclaimer: 'Dane demonstracyjne (DEMO). Nie sugeruje oficjalnego partnerstwa KADS bez zgody.',
        contacts: { officialWebsite: 'https://adwent.pl/kontakt/zbory/', officialEmail: 'kontakt-demo@example.invalid', pastorName: 'Pastor / Starszy (za zgodą — DEMO)' },
        accessibility: { wheelchair: true, hearingLoop: true, parentsRoom: true, parking: 'Strefa miejska', languages: ['pl', 'en'] },
        links: { catalogUrl: 'https://adwent.pl/kontakt/zbory/', livestreamUrl: 'https://polskieradio.cc/biblia-audio', mapUrl: 'https://www.openstreetmap.org/search?query=Warszawa' },
        firstVisit: {
          whatToExpect: 'Otwarte nabożeństwo biblijne: Szkoła Sobotnia w grupach i kazanie. Nie musisz przynosić własnego śpiewnika.',
          duration: 'Ok. 2,5–3 godz.', entrance: 'Wejście główne', parking: 'Parking w pobliżu',
          accessibility: 'Podjazd bez barier, pętla indukcyjna', languages: 'Polski, English',
          familyInfo: 'Pokój dla rodziców z dziećmi', welcomeContact: 'https://adwent.pl/kontakt/zbory/'
        },
        scheduleSummary: 'Sobota 09:30 Szkoła Sobotnia · 11:15 Nabożeństwo główne (DEMO)'
      },
      givingTargets: [],
      announcements: [],
      events: [],
      studyGroups: [],
      volunteerOpportunities: [],
      activeServiceId: null
    };
  }

  async function apiGet(path, headers = {}) {
    const res = await fetch(`${API_BASE}${path}`, { headers });
    if (res.status === 304) return { notModified: true };
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  function statusBadgeHtml(status) {
    const map = {
      verified: ['mk-badge--verified', '✓ Zweryfikowana'],
      pending: ['mk-badge--pending', '⏳ Oczekuje weryfikacji'],
      unverified: ['mk-badge--pending', '○ Niezweryfikowana'],
      suspended: ['mk-badge--danger', '✕ Zawieszona']
    };
    const [cls, label] = map[status] || map.unverified;
    return `<span class="mk-badge ${cls}">${label}</span>`;
  }

  function renderHeader() {
    const ch = state.profile?.church;
    if (!ch) return;
    $('churchNameHeading').textContent = ch.name;
    $('nextServiceSummary').textContent = `${ch.scheduleSummary} · Strefa: ${ch.timezone}`;
    $('headerBadges').innerHTML = `
      ${statusBadgeHtml(ch.verificationStatus)}
      ${ch.isDemo ? '<span class="mk-badge mk-badge--demo">DEMO</span>' : ''}
      <span class="mk-badge">${esc(ch.denomination)}</span>
    `;
    const isFollowed = state.prefs.followedSlugs.includes(ch.slug);
    const followBtn = $('followChurchBtn');
    followBtn.setAttribute('aria-pressed', String(isFollowed));
    followBtn.textContent = isFollowed ? '★ Obserwujesz zbór' : '☆ Obserwuj zbór';

    updateSyncStrip();
  }

  function updateSyncStrip() {
    const live = state.serviceData?.liveState;
    const tz = state.profile?.church?.timezone || 'Europe/Warsaw';
    const timeStr = state.lastSyncIso ? formatLocalTime(state.lastSyncIso, tz) : '—';
    if (state.offlineMode) {
      $('syncStatusText').innerHTML = `⚠️ <strong>Tryb offline (cache)</strong> · Ostatnia aktualizacja: ${esc(timeStr)} · Plan może różnić się od rzeczywistego przebiegu.`;
    } else if (live) {
      const labelMap = { live: '🔴 NA ŻYWO', paused: '⏸ PAUZA', completed: '✓ ZAKOŃCZONE', idle: '🗓️ ZAPLANOWANE' };
      $('syncStatusText').innerHTML = `${labelMap[live.status] || '🗓️'} · Rewizja #${live.revision} · Aktualizacja: ${esc(timeStr)} (${esc(tz)})`;
    } else {
      $('syncStatusText').textContent = `Ostatnie odświeżenie: ${timeStr}`;
    }
  }

  function renderDzisiaj() {
    const panel = $('panel-dzisiaj');
    const srv = state.serviceData?.service;
    const items = state.serviceData?.items || [];
    const live = state.serviceData?.liveState;
    const tz = state.profile?.church?.timezone || 'Europe/Warsaw';

    if (!srv || !items.length) {
      panel.innerHTML = `<div class="mk-card"><h2>Brak opublikowanego programu nabożeństwa</h2><p class="mk-muted">Gdy prowadzący opublikuje program, pojawi się tutaj wraz ze znacznikami czasu.</p></div>`;
      return;
    }

    const activeIdx = items.findIndex((i) => i.id === live?.activeItemId);
    const activeItem = activeIdx >= 0 ? items[activeIdx] : null;
    const nextItem = activeIdx >= 0 ? items[activeIdx + 1] : items[0];

    let html = `
      <div class="mk-card">
        <div class="mk-badges-row" style="margin-bottom:8px;">
          <span class="mk-badge mk-badge--demo">Źródło prawdy: prowadzący LIVE</span>
          <span class="mk-badge">Plan ≠ zegar automatyczny</span>
        </div>
        <h2>${esc(srv.title)}</h2>
        <p class="mk-muted">
          ${activeItem ? `<strong>Teraz:</strong> ${esc(activeItem.title)}` : 'Nabożeństwo oczekuje na rozpoczęcie przez prowadzącego.'}
          ${nextItem ? ` · <strong>Następnie:</strong> ${esc(nextItem.title)}` : ''}
        </p>
        <div class="mk-btn-row" style="margin-top:10px;">
          <a class="mk-tool-btn" href="/sba">📖 Otwórz Scrolluj Biblię</a>
          <a class="mk-tool-btn" href="/spiewnik-biblijny/">🎶 Otwórz śpiewnik</a>
        </div>
      </div>
    `;

    items.forEach((item, idx) => {
      const isNow = item.id === live?.activeItemId;
      const isNext = activeIdx >= 0 && idx === activeIdx + 1;
      const badge = isNow
        ? '<span class="mk-badge mk-badge--danger">● TERAZ</span>'
        : isNext
          ? '<span class="mk-badge mk-badge--pending">NASTĘPNIE</span>'
          : item.status === 'completed'
            ? '<span class="mk-badge mk-badge--verified">✓ ZAKOŃCZONE</span>'
            : item.status === 'skipped'
              ? '<span class="mk-badge">POMINIĘTE</span>'
              : '<span class="mk-badge">PLAN</span>';

      const actualStr = item.actualStart ? ` (realnie: ${formatLocalTime(item.actualStart, tz)})` : '';
      const noteKey = `${srv.id}:${item.id}`;
      const savedNote = state.privateNotes[noteKey] || '';

      html += `
        <article class="mk-agenda-item ${isNow ? 'is-active' : ''} ${item.status === 'completed' ? 'is-completed' : ''} ${item.status === 'skipped' ? 'is-skipped' : ''}" data-item-id="${esc(item.id)}">
          <button type="button" class="mk-agenda-summary" aria-expanded="${isNow ? 'true' : 'false'}" data-toggle-item="${esc(item.id)}">
            <span class="mk-agenda-left">
              <span class="mk-time-pill">${esc(item.plannedStart)}</span>
              <span>
                <strong>${esc(item.title)}</strong>
                <small class="mk-muted" style="display:block;">${item.plannedDuration} min${esc(actualStr)}${item.personRefs?.length ? ' · ' + esc(item.personRefs.join(', ')) : ''}</small>
              </span>
            </span>
            ${badge}
          </button>
          <div class="mk-agenda-body" id="body-${esc(item.id)}" ${isNow ? '' : 'hidden'}>
            ${item.publicDescription ? `<p class="mk-muted" style="margin:8px 0 0;">${esc(item.publicDescription)}</p>` : ''}
            ${item.sermonMeta ? `
              <div class="mk-card" style="margin:6px 0 0;background:var(--surface-2);">
                <h3>🎤 ${esc(item.sermonMeta.title)}</h3>
                <p class="mk-muted">Kaznodzieja: ${esc(item.sermonMeta.preacher)} · Tekst przewodni: ${esc(item.sermonMeta.mainRef)}</p>
                ${Array.isArray(item.sermonMeta.outline) ? `<ul>${item.sermonMeta.outline.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>` : ''}
              </div>
            ` : ''}
            ${item.bibleRefs?.length ? `<div class="mk-ref-row">${item.bibleRefs.map(bibleRefLinks).join('')}</div>` : ''}
            ${item.hymnRefs?.length ? `
              <div class="mk-ref-row">
                ${item.hymnRefs.map((h) => `<button type="button" class="mk-ref-link" data-open-hymn="${h.number}">🎶 Pieśń nr ${h.number} (${esc(h.edition || 'Śpiewajmy Panu')})</button>`).join('')}
              </div>
            ` : ''}
            ${item.resourceRefs?.length ? `
              <div class="mk-ref-row">
                ${item.resourceRefs.map((r) => `<a class="mk-ref-link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">↗ ${esc(r.label)}</a>`).join('')}
              </div>
            ` : ''}
            <div class="mk-form-row" style="margin-top:6px;">
              <label for="note-${esc(item.id)}" class="mk-muted">🔒 Prywatna notatka (tylko na Twoim urządzeniu — nigdy publiczna)</label>
              <textarea id="note-${esc(item.id)}" class="mk-textarea" rows="2" placeholder="Zapisz własne przemyślenia, pytania lub zastosowanie…">${esc(savedNote)}</textarea>
              <div class="mk-btn-row">
                <button type="button" class="mk-tool-btn" data-save-note="${esc(noteKey)}" data-note-input="note-${esc(item.id)}">💾 Zapisz notatkę</button>
              </div>
            </div>
          </div>
        </article>
      `;
    });

    if (srv.postServiceEvents?.length) {
      html += `
        <div class="mk-card">
          <h3>☕ Po zakończeniu części formalnej</h3>
          <ul>${srv.postServiceEvents.map((e) => `<li><strong>${esc(e.time)}</strong> — ${esc(e.title)} (${esc(e.location)})</li>`).join('')}</ul>
        </div>
      `;
    }

    panel.innerHTML = html;

    panel.querySelectorAll('[data-toggle-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.toggleItem;
        const body = $(`body-${id}`);
        if (!body) return;
        const nextOpen = body.hidden;
        body.hidden = !nextOpen;
        btn.setAttribute('aria-expanded', String(nextOpen));
      });
    });

    panel.querySelectorAll('[data-save-note]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.saveNote;
        const ta = $(btn.dataset.noteInput);
        state.privateNotes[key] = ta ? ta.value : '';
        saveJson(NOTES_KEY, state.privateNotes);
        toast('Zapisano prywatną notatkę (wyłącznie lokalnie).');
      });
    });

    panel.querySelectorAll('[data-open-hymn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        switchTab('piesni');
        const num = btn.dataset.openHymn;
        const inp = $('mkHymnSearch');
        if (inp) { inp.value = num; searchHymns(num); }
      });
    });
  }

  async function loadSabbathSchool(lessonId = null) {
    const panel = $('panel-szkola-sobotnia');
    panel.innerHTML = `<div class="mk-card"><p class="mk-muted">Wczytuję lekcję Szkoły Sobotniej (${state.ssLang.toUpperCase()})…</p></div>`;
    try {
      const tz = state.profile?.church?.timezone || 'Europe/Warsaw';
      const qs = new URLSearchParams({ lang: state.ssLang, tz });
      if (lessonId) qs.set('lessonId', lessonId);
      state.ssData = await apiGet(`/sabbath-school/current?${qs.toString()}`);
    } catch {
      state.ssData = {
        ok: false,
        error: 'provider_unavailable',
        detail: 'Nie udało się połączyć z API lekcji. Skorzystaj z oficjalnych linków poniżej (brak fikcyjnych danych).',
        officialSources: [
          { name: 'Sekretariat Szkoły Sobotniej (adwent.pl)', url: 'https://adwent.pl/sekretariaty/sekretariat-szkoly-sobotniej/' },
          { name: 'Adult Bible Study Guide (absg.sspmadventist.org)', url: 'https://absg.sspmadventist.org/' },
          { name: 'Adventech Sabbath School (PL/EN)', url: 'https://adventech.io/sabbath-school/' }
        ]
      };
    }
    renderSabbathSchool();
  }

  function renderSabbathSchool() {
    const panel = $('panel-szkola-sobotnia');
    const d = state.ssData;
    const lesson = d?.lesson;
    const groups = state.profile?.studyGroups || [];
    const lessonId = lesson?.externalId || 'none';
    const progress = state.ssProgress[lessonId] || { completedDays: [], notes: '' };

    panel.innerHTML = `
      <div class="mk-card">
        <div class="mk-btn-row" style="justify-content:space-between;margin-bottom:10px;">
          <div>
            <span class="mk-badge mk-badge--demo">Etap A · Oficjalne linki i metadane (bez kopiowania pełnego tekstu)</span>
            <h2 style="margin-top:6px;">📚 Szkoła Sobotnia PL / EN</h2>
          </div>
          <div class="mk-btn-row" role="group" aria-label="Język lekcji Szkoły Sobotniej">
            <button type="button" class="mk-tool-btn" id="ssLangPl" aria-pressed="${state.ssLang === 'pl'}">PL</button>
            <button type="button" class="mk-tool-btn" id="ssLangEn" aria-pressed="${state.ssLang === 'en'}">EN</button>
          </div>
        </div>
        <p style="font-style:italic;color:var(--gold-light);margin:4px 0 12px;">„${esc(lesson?.readingGuidance || 'Czytaj w obecności Autora — zacznij od modlitwy.')}”</p>
        ${lesson ? `
          <p class="mk-muted">${esc(lesson.quarterTitle)} · Tydzień ${lesson.week} · Przygotowanie: ${esc(lesson.startsOn)} – ${esc(lesson.endsOn)} · Omówienie: <strong>${esc(lesson.discussionDate)}</strong></p>
          <h3>${esc(lesson.title)}</h3>
          <div class="mk-ref-row" style="margin:10px 0;">
            ${bibleRefLinks(lesson.memoryVerseRef)}
            ${(lesson.bibleRefs || []).map(bibleRefLinks).join('')}
          </div>
          <div class="mk-btn-row" style="margin-top:10px;">
            <a class="mk-cta-orange" href="${esc(lesson.sourceUrl)}" target="_blank" rel="noopener noreferrer">↗ Otwórz oficjalną lekcję (${state.ssLang.toUpperCase()})</a>
            <a class="mk-tool-btn" href="${esc(lesson.adventechUrl)}" target="_blank" rel="noopener noreferrer">↗ Adventech Sabbath School</a>
            <button type="button" class="mk-tool-btn" id="ssAskAiBtn">✨ Zapytaj AI o wersety lekcji</button>
          </div>
        ` : `
          <p class="mk-muted">${esc(d?.detail || 'Brak danych lekcji dla wybranej daty.')}</p>
        `}
      </div>

      ${lesson ? `
      <div class="mk-card">
        <h3>🗓️ Mój prywatny plan studium (Sobota–Piątek)</h3>
        <p class="mk-muted">Postęp i notatki są wyłącznie prywatne (bez rankingów duchowych).</p>
        <div class="mk-days-grid">
          ${(lesson.studyDays || []).map((day) => `
            <label class="mk-day-chip">
              <input type="checkbox" data-ss-day="${esc(day.key)}" ${progress.completedDays.includes(day.key) ? 'checked' : ''}>
              <span>${esc(day.label)}</span>
            </label>
          `).join('')}
        </div>
        <div class="mk-form-row">
          <label for="ssPrivateNotes">🔒 Prywatne notatki i własne pytania do lekcji</label>
          <textarea id="ssPrivateNotes" class="mk-textarea" placeholder="Twoje pytania i refleksje ze studium Biblii…">${esc(progress.notes || '')}</textarea>
        </div>
        <button type="button" class="mk-tool-btn" id="ssSaveProgressBtn">💾 Zapisz mój postęp</button>
      </div>` : ''}

      <div class="mk-card">
        <h3>👥 Grupy Szkoły Sobotniej (niezależne od głównej osi czasu)</h3>
        <p class="mk-muted">Brak publicznych list dzieci. Prowadzący grupę może zmieniać omawianą część lekcji niezależnie.</p>
        <div class="mk-grid-2">
          ${groups.map((g) => `
            <div class="mk-card" style="margin:0;background:var(--surface-2);">
              <strong>${esc(g.label)}</strong>
              <p class="mk-muted" style="margin:4px 0;">${esc(g.scheduleText)} · ${esc(g.meetingPlace)} · Język: ${esc(g.locale.toUpperCase())}</p>
              <small class="mk-muted">${esc(g.leaderRef)}</small>
            </div>
          `).join('') || '<p class="mk-muted">Moduł Szkoły Sobotniej działa również niezależnie, bez wybranego zboru.</p>'}
        </div>
      </div>

      <div class="mk-card">
        <h3>🔗 Oficjalne źródła i zakres praw (Etap A)</h3>
        <ul>
          ${(d?.officialSources || []).map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--gold);">${esc(s.name)}</a> — <span class="mk-muted">${esc(s.rightsNote || '')}</span></li>`).join('')}
        </ul>
      </div>
    `;

    $('ssLangPl')?.addEventListener('click', () => { state.ssLang = 'pl'; loadSabbathSchool(lesson?.externalId || null); });
    $('ssLangEn')?.addEventListener('click', () => { state.ssLang = 'en'; loadSabbathSchool(lesson?.externalId || null); });
    $('ssSaveProgressBtn')?.addEventListener('click', () => {
      const days = [...panel.querySelectorAll('[data-ss-day]:checked')].map((el) => el.dataset.ssDay);
      state.ssProgress[lessonId] = { completedDays: days, notes: $('ssPrivateNotes')?.value || '', updatedAt: new Date().toISOString() };
      saveJson(SS_PROGRESS_KEY, state.ssProgress);
      toast('Zapisano prywatny postęp Szkoły Sobotniej.');
    });
    $('ssAskAiBtn')?.addEventListener('click', () => {
      openLumiMesSafe({
        appId: 'cc.sabbath-school',
        route: '/test/sba/moj-kosciol/#szkola-sobotnia',
        contextType: 'sabbath-school',
        sabbathSchool: { lessonId: lesson?.externalId, locale: state.ssLang, bibleRefs: lesson?.bibleRefs || [] },
        suggestions: ['Wyjaśnij tekst pamięciowy w kontekście UBG', 'Przejdź do Głębokiego Studium', 'Zaproponuj pytania do dyskusji w grupie']
      });
    });
  }

  function renderOgloszenia() {
    const panel = $('panel-ogloszenia');
    const list = state.profile?.announcements || [];
    panel.innerHTML = `
      <div class="mk-card">
        <h2>📢 Tablica zborowa i ogłoszenia</h2>
        <p class="mk-muted">Wyświetlane są wyłącznie aktywne, moderowane i niewygasłe ogłoszenia.</p>
      </div>
      ${list.length ? list.map((a) => `
        <article class="mk-card">
          <div class="mk-badges-row" style="margin-bottom:6px;">
            <span class="mk-badge">${esc(a.category)}</span>
            ${a.pinned ? '<span class="mk-badge mk-badge--demo">📌 Przypięte</span>' : ''}
            <span class="mk-badge">Ważne do: ${esc(a.expiresAt.slice(0, 10))}</span>
          </div>
          <h3>${esc(a.title)}</h3>
          <p>${esc(a.body)}</p>
          <button type="button" class="mk-tool-btn" data-report-id="${esc(a.id)}" data-report-type="announcement">⚑ Zgłoś</button>
        </article>
      `).join('') : '<div class="mk-card"><p class="mk-muted">Brak aktywnych ogłoszeń.</p></div>'}
    `;

    panel.querySelectorAll('[data-report-id]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const reason = prompt('Podaj powód zgłoszenia ogłoszenia do moderacji:');
        if (!reason) return;
        try {
          await fetch(`${API_BASE}/churches/${encodeURIComponent(state.profile.church.id)}/reports`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetType: btn.dataset.reportType, targetId: btn.dataset.reportId, reason })
          });
          toast('Zgłoszenie wysłane do moderacji.');
        } catch { toast('Zapisano zgłoszenie lokalnie.'); }
      });
    });
  }

  function renderWydarzenia() {
    const panel = $('panel-wydarzenia');
    const events = state.profile?.events || [];
    const tz = state.profile?.church?.timezone || 'Europe/Warsaw';

    panel.innerHTML = `
      <div class="mk-card">
        <h2>📅 Kalendarz wydarzeń zboru</h2>
        <p class="mk-muted">Dobrowolne RSVP (Tak/Nie/Może) jest prywatne — brak publicznej listy uczestników. Eksport .ics uwzględnia strefę ${esc(tz)}.</p>
      </div>
      ${events.map((e) => `
        <article class="mk-card">
          <div class="mk-badges-row" style="margin-bottom:6px;">
            <span class="mk-badge">${esc(e.category)}</span>
            ${e.status === 'cancelled'
              ? '<span class="mk-badge mk-badge--danger">✕ ODWOŁANE</span>'
              : '<span class="mk-badge mk-badge--verified">✓ Planowane</span>'}
            ${e.recurrence && e.recurrence !== 'none' ? `<span class="mk-badge">🔁 ${esc(e.recurrence)}</span>` : ''}
          </div>
          <h3>${esc(e.title)}</h3>
          <p class="mk-muted">${esc(formatLocalDateTime(e.startAt, tz))} · ${esc(e.location)}</p>
          ${e.status === 'cancelled' && e.cancelReason ? `<p style="color:#f87171;"><strong>Powód odwołania:</strong> ${esc(e.cancelReason)}</p>` : ''}
          <p>${esc(e.description)}</p>
          <div class="mk-btn-row">
            <a class="mk-tool-btn" href="${API_BASE}/events/${encodeURIComponent(e.id)}.ics" download="${esc(e.id)}.ics">📥 Dodaj do kalendarza (.ics)</a>
            <button type="button" class="mk-tool-btn" data-invite-event="${esc(e.id)}">💌 Zaproś na wydarzenie</button>
            ${e.status !== 'cancelled' ? `
              <button type="button" class="mk-tool-btn" data-rsvp="${esc(e.id)}:yes">✓ Będę (prywatne RSVP)</button>
              <button type="button" class="mk-tool-btn" data-rsvp="${esc(e.id)}:maybe">? Może</button>
            ` : ''}
          </div>
        </article>
      `).join('') || '<div class="mk-card"><p class="mk-muted">Brak zaplanowanych wydarzeń.</p></div>'}
    `;

    panel.querySelectorAll('[data-invite-event]').forEach((btn) => {
      btn.addEventListener('click', () => openInviteModal(btn.dataset.inviteEvent));
    });
    panel.querySelectorAll('[data-rsvp]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const [evId, resp] = btn.dataset.rsvp.split(':');
        saveJson(`cc_mk_rsvp_${evId}`, { response: resp, updatedAt: new Date().toISOString() });
        toast(`Zapisano Twoje prywatne RSVP (${resp === 'yes' ? 'Tak' : 'Może'}). Lista uczestników nie jest publiczna.`);
      });
    });
  }

  async function searchHymns(q = '') {
    const out = $('mkHymnResults');
    if (!out) return;
    out.innerHTML = '<p class="mk-muted">Szukam pieśni z kontrolą licencji…</p>';
    try {
      const isNum = /^\d{1,3}$/.test(String(q).trim());
      const qs = isNum ? `number=${encodeURIComponent(q.trim())}` : `q=${encodeURIComponent(q.trim())}`;
      const res = await apiGet(`/hymns?${qs}`);
      const list = res.hymns || [];
      if (!list.length) {
        out.innerHTML = '<p class="mk-muted">Brak wyników. Wpisz numer (1–700) lub tytuł.</p>';
        return;
      }
      out.innerHTML = list.map((h) => `
        <article class="mk-card" style="background:var(--surface-2);">
          <div class="mk-badges-row" style="margin-bottom:6px;">
            <span class="mk-badge">Nr ${h.number}</span>
            ${h.key ? `<span class="mk-badge">Tonacja: ${esc(h.key)}</span>` : ''}
            <span class="mk-badge ${h.lyricsIncluded ? 'mk-badge--verified' : 'mk-badge--pending'}">
              ${h.lyricsIncluded ? '📜 Domena publiczna (tekst dostępny)' : '🔒 Licencja KADS (metadane + link)'}
            </span>
          </div>
          <h3>${esc(h.title)}</h3>
          <p class="mk-muted">${esc(h.section)} · ${esc(h.category)}${h.author ? ' · ' + esc(h.author) : ''}</p>
          ${h.audioUrl ? `<audio controls preload="none" src="${esc(h.audioUrl)}" style="width:100%;margin:8px 0;"></audio>` : ''}
          ${h.lyricsIncluded && Array.isArray(h.stanzas)
            ? h.stanzas.map((st) => `<p><strong>${st.type === 'chorus' ? 'Refren:' : st.label + '.'}</strong> ${esc(st.text)}</p>`).join('')
            : `<p class="mk-muted">Ze względu na poszanowanie praw autorskich pełny tekst tej pieśni nie jest kopiowany w trybie publicznym Mój kościół bez pisemnej licencji wydawcy. Skorzystaj z oficjalnego źródła:</p>`}
          <div class="mk-btn-row">
            <a class="mk-tool-btn" href="${esc(h.officialUrl || 'https://muzycy.adwent.pl/')}" target="_blank" rel="noopener noreferrer">↗ Oficjalny śpiewnik (muzycy.adwent.pl)</a>
            <a class="mk-tool-btn" href="/spiewnik-biblijny/#nr=${h.number}" target="_blank" rel="noopener noreferrer">🎶 Otwórz w Śpiewajmy Panu CC</a>
          </div>
        </article>
      `).join('');
    } catch {
      out.innerHTML = '<p class="mk-muted">Katalog metadanych śpiewnika chwilowo niedostępny. Otwórz <a href="https://muzycy.adwent.pl/" target="_blank" rel="noopener noreferrer">muzycy.adwent.pl</a>.</p>';
    }
  }

  function renderPiesni() {
    const panel = $('panel-piesni');
    panel.innerHTML = `
      <div class="mk-card">
        <h2>🎶 Śpiewnik (z poszanowaniem licencji)</h2>
        <p class="mk-muted">Wydanie: <strong>Śpiewajmy Panu (KADS)</strong>. Pełne teksty w widoku publicznym wyświetlane są wyłącznie dla utworów w domenie publicznej; dla pozostałych prezentowane są metadane, tonacja oraz legalny link do <a href="https://muzycy.adwent.pl/" target="_blank" rel="noopener noreferrer" style="color:var(--gold);">muzycy.adwent.pl</a>.</p>
        <div class="mk-btn-row" style="margin-top:10px;">
          <input id="mkHymnSearch" class="mk-input" style="flex:1 1 220px;" type="search" placeholder="Numer pieśni (np. 1, 92, 694) lub tytuł…">
          <button type="button" class="mk-cta-orange" id="mkHymnSearchBtn">Szukaj</button>
          <a class="mk-tool-btn" href="/spiewnik-biblijny/" target="_blank" rel="noopener noreferrer">↗ Śpiewnik „Śpiewajmy Panu”</a>
        </div>
      </div>
      <div id="mkHymnResults"></div>
    `;
    $('mkHymnSearchBtn').addEventListener('click', () => searchHymns($('mkHymnSearch').value));
    $('mkHymnSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') searchHymns($('mkHymnSearch').value); });
    searchHymns('1');
  }

  function renderDary() {
    const panel = $('panel-dary');
    const targets = state.profile?.givingTargets || [];
    const catLabels = {
      tithe: 'Dziesięcina',
      local_church: 'Dary zborowe',
      sabbath_school: 'Dary Szkoły Sobotniej',
      mission: 'Misja',
      other_approved: 'Inne zatwierdzone'
    };
    panel.innerHTML = `
      <div class="mk-card">
        <h2>💛 Dziesięciny i dary</h2>
        <p class="mk-muted">
          <strong>Zasady bezpieczeństwa i przejrzystości:</strong> Christian Culture nie obsługuje płatności, nie pobiera prowizji, nie zapisuje kwot i nie prowadzi rankingów darczyńców. Nie mieszamy darowizn dla CC z darami zboru.
          Wyświetlane są <strong>wyłącznie rachunki zweryfikowane</strong> (podwójne zatwierdzenie i audyt).
        </p>
        <p class="mk-muted">Oficjalne zasady rozróżnienia dziesięcin i darów: <a href="https://adwent.pl/dary2021/" target="_blank" rel="noopener noreferrer" style="color:var(--gold);">adwent.pl/dary2021</a> · <a href="https://www.adwentysci.org.pl/informacja-na-temat-zbierania-darow/" target="_blank" rel="noopener noreferrer" style="color:var(--gold);">adwentysci.org.pl</a></p>
      </div>
      ${targets.length ? targets.map((g) => `
        <article class="mk-card">
          <div class="mk-badges-row" style="margin-bottom:6px;">
            <span class="mk-badge mk-badge--verified">✓ Rachunek zweryfikowany</span>
            <span class="mk-badge">${esc(catLabels[g.category] || g.category)}</span>
            ${g.isDemo ? '<span class="mk-badge mk-badge--demo">DANE DEMO — NIE WYKONYWAĆ PRZELEWU</span>' : ''}
          </div>
          <h3>${esc(g.beneficiary)}</h3>
          <p><strong>IBAN / NRB:</strong> <code>${esc(g.ibanFormatted || g.iban)}</code> (${esc(g.currency)})</p>
          <p><strong>Tytuł przelewu:</strong> <code>${esc(g.transferTitle)}</code></p>
          <p class="mk-muted">${esc(g.purpose)} · Źródło potwierdzenia: ${esc(g.confirmationSource)} (${esc((g.verifiedAt || '').slice(0, 10))})</p>
          <div class="mk-btn-row">
            <button type="button" class="mk-tool-btn" data-copy-text="${esc(g.iban)}">📋 Kopiuj numer konta</button>
            <button type="button" class="mk-tool-btn" data-copy-text="${esc(g.transferTitle)}">📋 Kopiuj tytuł przelewu</button>
          </div>
        </article>
      `).join('') : '<div class="mk-card"><p class="mk-muted">Brak publicznie zatwierdzonych rachunków dla tego zboru. Niezweryfikowane numery kont nigdy nie są wyświetlane publicznie.</p></div>'}
    `;

    panel.querySelectorAll('[data-copy-text]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(btn.dataset.copyText); toast('Skopiowano do schowka.'); }
        catch { toast('Skopiuj ręcznie: ' + btn.dataset.copyText); }
      });
    });
  }

  function renderOZborze() {
    const panel = $('panel-o-zborze');
    const ch = state.profile?.church;
    if (!ch) return;
    const shareUrl = buildCanonicalChurchUrl();

    panel.innerHTML = `
      <div class="mk-card">
        <div class="mk-badges-row" style="margin-bottom:8px;">
          ${statusBadgeHtml(ch.verificationStatus)}
          ${ch.isDemo ? '<span class="mk-badge mk-badge--demo">DEMO</span>' : ''}
        </div>
        <h2>⛪ ${esc(ch.name)}</h2>
        <p class="mk-muted">${esc(ch.denomination)} · ${esc(ch.district)}</p>
        <p class="mk-muted">${esc(ch.officialDisclaimer)}</p>
        <p><strong>Adres:</strong> ${esc(ch.publicAddress)}</p>
        <p><strong>Godziny:</strong> ${esc(ch.scheduleSummary)}</p>
        <p><strong>Dostępność:</strong> ${ch.accessibility?.wheelchair ? '♿ Podjazd · ' : ''}${ch.accessibility?.hearingLoop ? '🦻 Pętla indukcyjna · ' : ''}${ch.accessibility?.parentsRoom ? '👶 Pokój rodzica · ' : ''}Języki: ${(ch.accessibility?.languages || ['pl']).join(', ').toUpperCase()}</p>
        <p><strong>Kontakt oficjalny:</strong> <a href="${esc(ch.contacts?.officialWebsite || 'https://adwent.pl/kontakt/zbory/')}" target="_blank" rel="noopener noreferrer" style="color:var(--gold);">${esc(ch.contacts?.officialWebsite || 'adwent.pl/kontakt/zbory/')}</a> · ${esc(ch.contacts?.pastorName || '')}</p>
        <div class="mk-btn-row" style="margin-top:10px;">
          <a class="mk-tool-btn" href="${esc(ch.links?.mapUrl || '#')}" target="_blank" rel="noopener noreferrer">🗺️ Jak dojechać</a>
          ${ch.links?.livestreamUrl ? `<a class="mk-tool-btn" href="${esc(ch.links.livestreamUrl)}" target="_blank" rel="noopener noreferrer">📺 Oglądaj online</a>` : ''}
          <button type="button" class="mk-cta-gold" id="profileInviteBtn">💌 Wyślij wizytówkę</button>
        </div>
      </div>

      <div class="mk-card">
        <h3>👋 Jestem pierwszy raz</h3>
        <p class="mk-muted">Nie musisz ujawniać swojego wyznania ani zakładać konta.</p>
        <p><strong>Czego się spodziewać:</strong> ${esc(ch.firstVisit?.whatToExpect)}</p>
        <p><strong>Czas trwania:</strong> ${esc(ch.firstVisit?.duration)}</p>
        <p><strong>Wejście i parking:</strong> ${esc(ch.firstVisit?.entrance)} · ${esc(ch.firstVisit?.parking)}</p>
        <p><strong>Dostępność i rodziny:</strong> ${esc(ch.firstVisit?.accessibility)} · ${esc(ch.firstVisit?.familyInfo)}</p>
        <p><strong>Kontakt powitalny:</strong> ${esc(ch.firstVisit?.welcomeContact)}</p>
      </div>

      <div class="mk-card">
        <h3>📱 Kod QR i udostępnialny link wizytówki</h3>
        <div class="mk-qr-box">
          <canvas id="profileQrCanvas" width="160" height="160" aria-label="Kod QR wizytówki zboru"></canvas>
          <small>${esc(ch.slug)}</small>
        </div>
        <p class="mk-muted" style="word-break:break-all;margin-top:8px;">${esc(shareUrl)}</p>
      </div>
    `;

    const qrCanvas = $('profileQrCanvas');
    if (qrCanvas) drawDeterministicQr(qrCanvas, shareUrl, 160);
    $('profileInviteBtn')?.addEventListener('click', () => openInviteModal(null));
  }

  function renderWiecej() {
    const panel = $('panel-wiecej');
    const vols = state.profile?.volunteerOpportunities || [];
    const srv = state.serviceData?.service;
    const live = state.serviceData?.liveState;
    const n = state.prefs.notifications;

    panel.innerHTML = `
      <div class="mk-live-bar">
        <h3>🎛️ Panel Prowadzącego LIVE (Tryb Pilot / Demo Sync)</h3>
        <p class="mk-muted">Synchronizuje stan między oknami/urządzeniami (BroadcastChannel + API rewizja #${live?.revision || 1}). Zapisy bez uprawnień serwerowych działają wyłącznie w lokalnym podglądzie demo.</p>
        <div class="mk-btn-row">
          <button type="button" class="mk-cta-orange" data-live-act="start">▶ Start</button>
          <button type="button" class="mk-tool-btn" data-live-act="prev">← Wstecz</button>
          <button type="button" class="mk-cta-gold" data-live-act="next">Dalej →</button>
          <button type="button" class="mk-tool-btn" data-live-act="skip">⏭ Pomiń</button>
          <button type="button" class="mk-tool-btn" data-live-act="pause">⏸ Pauza</button>
          <button type="button" class="mk-tool-btn" data-live-act="resume">▶ Wznów</button>
          <button type="button" class="mk-tool-btn" data-live-act="end">⏹ Zakończ</button>
        </div>
        <div class="mk-btn-row" style="margin-top:10px;">
          <input id="liveAddVerseInput" class="mk-input" style="max-width:240px;" placeholder="Dodaj werset na żywo (np. J 3:16)">
          <button type="button" class="mk-tool-btn" id="liveAddVerseBtn">+ Dodaj werset do bieżącego punktu</button>
        </div>
      </div>

      <div class="mk-card">
        <h3>🙏 Módlmy się (prywatna prośba modlitewna)</h3>
        <p class="mk-muted">Domyślnie trafia <strong>wyłącznie prywatnie</strong> do wyznaczonego zespołu modlitewnego. <strong>Prośby modlitewne NIGDY nie są przesyłane automatycznie do AI.</strong></p>
        <div class="mk-form-row">
          <label for="prayerBodyInput">Treść prośby (nie podawaj zbędnych danych zdrowotnych osób trzecich)</label>
          <textarea id="prayerBodyInput" class="mk-textarea" placeholder="O co możemy się wspólnie pomodlić?"></textarea>
        </div>
        <label class="mk-inline-check" style="margin-bottom:10px;">
          <input type="checkbox" id="prayerPublicConsent">
          <span>Wyrażam osobną zgodę na publikację po moderacji (domyślnie: TYLKO prywatnie dla zespołu)</span>
        </label>
        <div><button type="button" class="mk-cta-gold" id="prayerSubmitBtn">Wyślij prośbę modlitewną</button></div>
      </div>

      <div class="mk-card">
        <h3>🤝 Pomóż i służ (wolontariat)</h3>
        <p class="mk-muted">Kontakt odbywa się przez bezpieczny formularz — nie publikujemy prywatnych numerów telefonów.</p>
        <ul>
          ${vols.map((v) => `<li><strong>${esc(v.title)}</strong> — ${esc(v.description)}</li>`).join('') || '<li class="mk-muted">Brak otwartych zgłoszeń.</li>'}
        </ul>
      </div>

      <div class="mk-card">
        <h3>🔔 Powiadomienia i prywatność (RODO)</h3>
        <p class="mk-muted">Powiadomienia finansowe są domyślnie wyłączone. Obserwowanie zboru jest preferencją aplikacji, nie deklaracją członkostwa.</p>
        <div class="mk-days-grid">
          <label class="mk-day-chip"><input type="checkbox" data-notif="service_new" ${n.service_new ? 'checked' : ''}><span>Nowy program</span></label>
          <label class="mk-day-chip"><input type="checkbox" data-notif="time_change" ${n.time_change ? 'checked' : ''}><span>Zmiana godziny</span></label>
          <label class="mk-day-chip"><input type="checkbox" data-notif="announcement" ${n.announcement ? 'checked' : ''}><span>Ogłoszenia</span></label>
          <label class="mk-day-chip"><input type="checkbox" data-notif="lesson" ${n.lesson ? 'checked' : ''}><span>Lekcja SS</span></label>
          <label class="mk-day-chip"><input type="checkbox" data-notif="event" ${n.event ? 'checked' : ''}><span>Wydarzenia</span></label>
          <label class="mk-day-chip"><input type="checkbox" data-notif="financial" ${n.financial ? 'checked' : ''}><span>Finansowe (domyślnie wył.)</span></label>
        </div>
        <div class="mk-btn-row" style="margin-top:10px;">
          <button type="button" class="mk-tool-btn" id="saveNotifBtn">💾 Zapisz zgody</button>
          <button type="button" class="mk-tool-btn" id="deleteAllUserDataBtn" style="border-color:var(--danger);color:#f87171;">🗑️ Usuń wszystkie moje dane lokalne</button>
        </div>
      </div>

      <div class="mk-card">
        <h3>🏦 Panel Skarbnika (oddzielony od edytora agendy)</h3>
        <p class="mk-muted">Weryfikacja sumy kontrolnej NRB/IBAN (mod-97) <strong>nie potwierdza właściciela rachunku</strong>. Każda zmiana konta ukrywa dane publicznie do czasu drugiego zatwierdzenia i wpisu w audycie.</p>
        <div class="mk-btn-row">
          <input id="ibanTestInput" class="mk-input" style="max-width:340px;" placeholder="Sprawdź sumę kontrolną PL / 26 cyfr NRB">
          <button type="button" class="mk-tool-btn" id="ibanCheckBtn">Sprawdź mod-97</button>
        </div>
        <p id="ibanCheckOut" class="mk-muted"></p>
      </div>
    `;

    panel.querySelectorAll('[data-live-act]').forEach((btn) => {
      btn.addEventListener('click', () => applyLocalDemoLiveAction(btn.dataset.liveAct));
    });
    $('liveAddVerseBtn')?.addEventListener('click', () => {
      const ref = ($('liveAddVerseInput')?.value || '').trim();
      if (!ref) return;
      applyLocalDemoLiveAction('add_verse', { bibleRef: ref });
      $('liveAddVerseInput').value = '';
    });
    $('prayerSubmitBtn')?.addEventListener('click', () => {
      const body = ($('prayerBodyInput')?.value || '').trim();
      if (body.length < 5) { toast('Wpisz treść prośby (min. 5 znaków).'); return; }
      const pub = $('prayerPublicConsent')?.checked;
      $('prayerBodyInput').value = '';
      toast(pub ? 'Prośba zapisana do moderacji (bez udziału AI).' : 'Prywatna prośba wysłana wyłącznie do zespołu modlitewnego (bez udziału AI).');
    });
    $('saveNotifBtn')?.addEventListener('click', () => {
      panel.querySelectorAll('[data-notif]').forEach((el) => {
        state.prefs.notifications[el.dataset.notif] = el.checked;
      });
      saveJson(PREFS_KEY, state.prefs);
      toast('Zapisano ustawienia powiadomień.');
    });
    $('deleteAllUserDataBtn')?.addEventListener('click', () => {
      localStorage.removeItem(NOTES_KEY);
      localStorage.removeItem(SS_PROGRESS_KEY);
      localStorage.removeItem(PREFS_KEY);
      state.privateNotes = {};
      state.ssProgress = {};
      toast('Usunięto wszystkie Twoje lokalne notatki, postęp i preferencje.');
      renderDzisiaj();
    });
    $('ibanCheckBtn')?.addEventListener('click', () => {
      const raw = ($('ibanTestInput')?.value || '').replace(/\s+/g, '').toUpperCase();
      const norm = /^\d{26}$/.test(raw) ? `PL${raw}` : raw;
      const validFormat = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(norm);
      let modOk = false;
      if (validFormat) {
        const rear = norm.slice(4) + norm.slice(0, 4);
        let exp = '';
        for (const ch of rear) exp += (ch >= 'A' && ch <= 'Z') ? String(ch.charCodeAt(0) - 55) : ch;
        let rem = 0;
        for (let i = 0; i < exp.length; i++) rem = (rem * 10 + (exp.charCodeAt(i) - 48)) % 97;
        modOk = rem === 1;
      }
      $('ibanCheckOut').textContent = modOk
        ? '✓ Suma kontrolna mod-97 poprawna. Uwaga: to NIE potwierdza właściciela konta — wymagane potwierdzenie 2 osób.'
        : '✕ Nieprawidłowa suma kontrolna lub format IBAN/NRB.';
    });
  }

  function applyLocalDemoLiveAction(action, extra = {}) {
    if (!state.serviceData?.items?.length) return;
    const items = state.serviceData.items;
    const live = state.serviceData.liveState;
    const curIdx = items.findIndex((i) => i.id === live.activeItemId);
    const now = new Date().toISOString();

    if (action === 'start') {
      items[0].status = 'active'; items[0].actualStart = now;
      live.activeItemId = items[0].id; live.status = 'live';
    } else if (action === 'next' || action === 'skip') {
      if (curIdx >= 0) { items[curIdx].status = action === 'skip' ? 'skipped' : 'completed'; items[curIdx].actualEnd = now; }
      if (items[curIdx + 1]) { items[curIdx + 1].status = 'active'; items[curIdx + 1].actualStart = now; live.activeItemId = items[curIdx + 1].id; live.status = 'live'; }
      else { live.activeItemId = null; live.status = 'completed'; }
    } else if (action === 'prev' && curIdx > 0) {
      items[curIdx].status = 'upcoming'; items[curIdx].actualStart = null;
      items[curIdx - 1].status = 'active'; items[curIdx - 1].actualEnd = null;
      live.activeItemId = items[curIdx - 1].id; live.status = 'live';
    } else if (action === 'pause') {
      live.status = 'paused';
    } else if (action === 'resume') {
      live.status = 'live';
    } else if (action === 'end') {
      if (curIdx >= 0) { items[curIdx].status = 'completed'; items[curIdx].actualEnd = now; }
      live.activeItemId = null; live.status = 'completed';
    } else if (action === 'add_verse' && extra.bibleRef) {
      const target = items[curIdx >= 0 ? curIdx : 0];
      if (target && !target.bibleRefs.includes(extra.bibleRef)) target.bibleRefs.push(extra.bibleRef);
    }

    live.revision += 1;
    live.updatedAt = now;
    state.lastSyncIso = now;
    saveJson(CACHE_KEY, { profile: state.profile, serviceData: state.serviceData, cachedAt: now });
    if (LIVE_CHANNEL) LIVE_CHANNEL.postMessage({ type: 'live_snapshot', serviceData: state.serviceData, at: now });
    updateSyncStrip();
    renderDzisiaj();
    toast(`Zaktualizowano stan LIVE (rewizja #${live.revision}).`);
  }

  function openInviteModal(eventId = null) {
    const ch = state.profile?.church;
    if (!ch) return;
    const evt = eventId ? (state.profile.events || []).find((e) => e.id === eventId) : null;
    const shareUrl = buildCanonicalChurchUrl(evt ? { event: evt.id } : {});
    const defaultText = `Serdecznie zapraszam Cię na nabożeństwo! Będzie czas na wspólne studiowanie Biblii, modlitwę i społeczność. Tutaj znajdziesz godzinę, adres i program: ${shareUrl}. Będzie mi miło Cię zobaczyć.`;

    const body = $('inviteDialogBody');
    body.innerHTML = `
      <p class="mk-muted">Brak identyfikatorów odbiorcy w URL. Możesz edytować wiadomość przed wysłaniem.</p>
      <div class="mk-form-row">
        <label for="inviteTextArea">Treść zaproszenia</label>
        <textarea id="inviteTextArea" class="mk-textarea" rows="4">${esc(defaultText)}</textarea>
      </div>
      <div class="mk-btn-row">
        <button type="button" class="mk-cta-orange" id="nativeShareBtn">📤 Udostępnij teraz</button>
        <button type="button" class="mk-tool-btn" id="copyInviteBtn">📋 Kopiuj treść i link</button>
        <a class="mk-tool-btn" id="mailtoInviteLink" href="mailto:?subject=${encodeURIComponent('Zaproszenie — ' + ch.name)}&body=${encodeURIComponent(defaultText)}">✉️ E-mail</a>
        <a class="mk-tool-btn" id="waInviteLink" target="_blank" rel="noopener noreferrer" href="https://wa.me/?text=${encodeURIComponent(defaultText)}">💬 WhatsApp</a>
      </div>
      <div>
        <h3 style="margin:8px 0 6px;">🎨 Karta graficzna zaproszenia z kodem QR (PNG)</h3>
        <div class="mk-btn-row" style="margin-bottom:8px;">
          <button type="button" class="mk-tool-btn" data-card-ratio="1:1">1:1 (Post)</button>
          <button type="button" class="mk-tool-btn" data-card-ratio="9:16">9:16 (Relacja)</button>
          <button type="button" class="mk-tool-btn" data-card-ratio="16:9">16:9 (Ekran)</button>
          <button type="button" class="mk-cta-gold" id="downloadCardPngBtn">⬇ Pobierz PNG</button>
        </div>
        <canvas id="shareCardCanvas" width="540" height="540" style="max-width:100%;height:auto;border-radius:14px;border:1px solid var(--border);"></canvas>
      </div>
    `;

    function drawCard(ratio = '1:1') {
      const canvas = $('shareCardCanvas');
      const dims = ratio === '9:16' ? [540, 960] : ratio === '16:9' ? [960, 540] : [600, 600];
      canvas.width = dims[0]; canvas.height = dims[1];
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, dims[0], dims[1]);
      grad.addColorStop(0, '#0d1322'); grad.addColorStop(1, '#1d2740');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, dims[0], dims[1]);
      ctx.strokeStyle = '#C4A35A'; ctx.lineWidth = 4; ctx.strokeRect(18, 18, dims[0] - 36, dims[1] - 36);

      ctx.fillStyle = '#C4A35A'; ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText('ZAPROSZENIE NA NABOŻEŃSTWO', 42, 68);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillText(ch.name.slice(0, 34), 42, 114);
      ctx.fillStyle = '#cbd5e1'; ctx.font = '20px system-ui, sans-serif';
      ctx.fillText(evt ? evt.title.slice(0, 44) : ch.scheduleSummary.slice(0, 48), 42, 158);
      ctx.fillText(ch.publicAddress.slice(0, 50), 42, 194);

      const qrTemp = document.createElement('canvas');
      drawDeterministicQr(qrTemp, shareUrl, 180);
      ctx.drawImage(qrTemp, 42, dims[1] - 224);
      ctx.fillStyle = '#E2CC9A'; ctx.font = '16px system-ui, sans-serif';
      ctx.fillText('Zeskanuj QR, aby otworzyć program', 240, dims[1] - 130);
      ctx.fillText('bez logowania', 240, dims[1] - 104);
    }

    drawCard('1:1');
    body.querySelectorAll('[data-card-ratio]').forEach((b) => b.addEventListener('click', () => drawCard(b.dataset.cardRatio)));
    $('downloadCardPngBtn').addEventListener('click', () => {
      const a = document.createElement('a');
      a.download = `zaproszenie-${ch.slug}.png`;
      a.href = $('shareCardCanvas').toDataURL('image/png');
      a.click();
    });
    $('nativeShareBtn').addEventListener('click', async () => {
      const txt = $('inviteTextArea').value;
      if (navigator.share) {
        try { await navigator.share({ title: ch.name, text: txt, url: shareUrl }); toast('Udostępniono zaproszenie.'); return; } catch {}
      }
      try { await navigator.clipboard.writeText(txt); toast('Skopiowano zaproszenie (fallback dla przeglądarki).'); } catch {}
    });
    $('copyInviteBtn').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText($('inviteTextArea').value); toast('Skopiowano treść i link zaproszenia.'); } catch {}
    });
    $('inviteDialog').showModal();
  }

  function openChurchPicker() {
    const body = $('churchPickerBody');
    body.innerHTML = `
      <input id="churchSearchInput" class="mk-input" type="search" placeholder="Wpisz miasto, nazwę zboru lub wyznanie…">
      <div id="churchSearchList" style="display:flex;flex-direction:column;gap:8px;"></div>
    `;
    function renderList(q = '') {
      const lq = q.toLowerCase();
      const hits = state.churches.filter((c) => !lq || `${c.name} ${c.city} ${c.denomination}`.toLowerCase().includes(lq));
      $('churchSearchList').innerHTML = hits.map((c) => `
        <button type="button" class="mk-card" style="text-align:left;cursor:pointer;margin:0;" data-pick-slug="${esc(c.slug)}">
          <div class="mk-badges-row" style="margin-bottom:4px;">${statusBadgeHtml(c.verificationStatus)}${c.isDemo ? '<span class="mk-badge mk-badge--demo">DEMO</span>' : ''}</div>
          <strong>${esc(c.name)}</strong>
          <div class="mk-muted">${esc(c.publicAddress)} · ${esc(c.scheduleSummary)}</div>
        </button>
      `).join('') || '<p class="mk-muted">Brak pasujących zborów.</p>';

      $('churchSearchList').querySelectorAll('[data-pick-slug]').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.prefs.preferredChurchSlug = btn.dataset.pickSlug;
          saveJson(PREFS_KEY, state.prefs);
          $('churchPickerDialog').close();
          loadChurch(btn.dataset.pickSlug);
        });
      });
    }
    $('churchSearchInput').addEventListener('input', (e) => renderList(e.target.value));
    renderList();
    $('churchPickerDialog').showModal();
  }

  function openLumiMesSafe(ctxPayload) {
    if (window.CCLumiMes && typeof window.CCLumiMes.openWithContext === 'function') {
      window.CCLumiMes.openWithContext(ctxPayload);
    } else {
      const q = ctxPayload.suggestions?.[0] || 'Pomóż mi zrozumieć aktualny werset z nabożeństwa.';
      window.open(`/ai/aplikacja?q=${encodeURIComponent(q)}`, '_blank', 'noopener,noreferrer');
    }
  }

  function switchTab(tabId) {
    state.activeTab = tabId;
    document.querySelectorAll('.mk-tab').forEach((t) => {
      const active = t.dataset.tab === tabId;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('.mk-panel').forEach((p) => {
      p.hidden = p.id !== `panel-${tabId}`;
    });
    if (tabId === 'szkola-sobotnia' && !state.ssData) loadSabbathSchool();
    if (tabId === 'piesni' && !$('mkHymnSearch')) renderPiesni();
  }

  async function pollLiveOnce() {
    const srvId = state.profile?.activeServiceId;
    if (!srvId) return;
    try {
      const res = await apiGet(`/services/${encodeURIComponent(srvId)}`, state.etag ? { 'If-None-Match': state.etag } : {});
      state.offlineMode = false;
      state.pollDelayMs = 8000;
      if (!res.notModified && res.ok) {
        state.serviceData = { service: res.service, items: res.items, liveState: res.liveState };
        state.etag = res.etag || '';
        state.lastSyncIso = res.timestamp || new Date().toISOString();
        saveJson(CACHE_KEY, { profile: state.profile, serviceData: state.serviceData, cachedAt: state.lastSyncIso });
        renderDzisiaj();
      }
      updateSyncStrip();
    } catch {
      state.offlineMode = true;
      state.pollDelayMs = Math.min(60000, state.pollDelayMs * 2);
      updateSyncStrip();
    }
  }

  async function loadChurch(slug) {
    try {
      const dir = await apiGet('/churches');
      state.churches = dir.churches || [];
      const prof = await apiGet(`/churches/${encodeURIComponent(slug)}`);
      state.profile = prof;
      state.offlineMode = false;
      state.lastSyncIso = prof.timestamp || new Date().toISOString();
      if (prof.activeServiceId) {
        const srv = await apiGet(`/services/${encodeURIComponent(prof.activeServiceId)}`);
        state.serviceData = { service: srv.service, items: srv.items, liveState: srv.liveState };
        state.etag = srv.etag || '';
      } else {
        state.serviceData = null;
      }
      saveJson(CACHE_KEY, { profile: state.profile, serviceData: state.serviceData, cachedAt: state.lastSyncIso });
    } catch {
      const cached = loadJson(CACHE_KEY, null);
      if (cached?.profile) {
        state.profile = cached.profile;
        state.serviceData = cached.serviceData;
        state.lastSyncIso = cached.cachedAt;
        state.offlineMode = true;
      } else {
        state.profile = buildDemoFallbackData();
        state.offlineMode = true;
      }
    }

    renderHeader();
    renderDzisiaj();
    renderOgloszenia();
    renderWydarzenia();
    renderDary();
    renderOZborze();
    renderWiecej();
  }

  function applyPrefsUi() {
    document.documentElement.dataset.theme = state.prefs.theme || 'dark';
    document.documentElement.classList.toggle('mk-large-text', Boolean(state.prefs.largeText));
    document.body.classList.toggle('mk-focus-mode', Boolean(state.prefs.focusMode));
    $('focusModeBtn').setAttribute('aria-pressed', String(Boolean(state.prefs.focusMode)));
    $('largeTextBtn').setAttribute('aria-pressed', String(Boolean(state.prefs.largeText)));
  }

  function bindGlobalUi() {
    applyPrefsUi();
    document.querySelectorAll('.mk-tab').forEach((t) => t.addEventListener('click', () => switchTab(t.dataset.tab)));
    document.querySelectorAll('[data-close-dialog]').forEach((b) => b.addEventListener('click', () => $(b.dataset.closeDialog)?.close()));

    $('themeBtn').addEventListener('click', () => {
      state.prefs.theme = state.prefs.theme === 'dark' ? 'light' : 'dark';
      saveJson(PREFS_KEY, state.prefs); applyPrefsUi();
    });
    $('largeTextBtn').addEventListener('click', () => {
      state.prefs.largeText = !state.prefs.largeText;
      saveJson(PREFS_KEY, state.prefs); applyPrefsUi();
    });
    $('focusModeBtn').addEventListener('click', () => {
      state.prefs.focusMode = !state.prefs.focusMode;
      saveJson(PREFS_KEY, state.prefs); applyPrefsUi();
      toast(state.prefs.focusMode ? 'Tryb skupienia włączony — przyciski społecznościowe ukryte.' : 'Tryb skupienia wyłączony.');
    });
    $('followLiveBtn').addEventListener('click', () => {
      switchTab('dzisiaj');
      const active = document.querySelector('.mk-agenda-item.is-active');
      active?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    });
    $('inviteFriendBtn').addEventListener('click', () => openInviteModal(null));
    $('churchPickerBtn').addEventListener('click', openChurchPicker);
    $('followChurchBtn').addEventListener('click', () => {
      const slug = state.profile?.church?.slug;
      if (!slug) return;
      const idx = state.prefs.followedSlugs.indexOf(slug);
      if (idx >= 0) { state.prefs.followedSlugs.splice(idx, 1); toast('Usunięto z obserwowanych.'); }
      else { state.prefs.followedSlugs.push(slug); toast('Dodano do obserwowanych (preferencja aplikacji, nie członkostwo).'); }
      saveJson(PREFS_KEY, state.prefs);
      renderHeader();
    });
    $('askLumiMesBtn').addEventListener('click', () => {
      const live = state.serviceData?.liveState;
      const curItem = (state.serviceData?.items || []).find((i) => i.id === live?.activeItemId);
      openLumiMesSafe({
        appId: 'cc.my-church',
        route: buildCanonicalChurchUrl(),
        contextType: 'church',
        visibility: 'public',
        church: {
          churchId: state.profile?.church?.id,
          serviceId: state.serviceData?.service?.id,
          activeItemId: live?.activeItemId || '',
          bibleRefs: curItem?.bibleRefs || []
        },
        suggestions: ['Co teraz dzieje się w programie?', 'Wyjaśnij bieżący werset (UBG)', 'Co będzie następne?', 'Przejdź do Głębokiego Studium']
      });
    });
    $('autoFollowToggle').addEventListener('change', (e) => { state.autoFollow = e.target.checked; });

    if (LIVE_CHANNEL) {
      LIVE_CHANNEL.addEventListener('message', (ev) => {
        if (ev.data?.type === 'live_snapshot' && ev.data.serviceData) {
          state.serviceData = ev.data.serviceData;
          state.lastSyncIso = ev.data.at || new Date().toISOString();
          updateSyncStrip();
          renderDzisiaj();
          if (state.autoFollow) {
            document.querySelector('.mk-agenda-item.is-active')?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
          }
        }
      });
    }

    window.addEventListener('online', () => { pollLiveOnce(); });
    window.addEventListener('offline', () => { state.offlineMode = true; updateSyncStrip(); });
  }

  async function boot() {
    bindGlobalUi();
    const params = new URLSearchParams(location.search);
    const slug = params.get('church') || state.prefs.preferredChurchSlug || 'warszawa-centrum-demo';
    await loadChurch(slug);
    const hashTab = location.hash.replace(/^#/, '');
    if (hashTab && $(`panel-${hashTab}`)) switchTab(hashTab);
    setInterval(() => { if (document.visibilityState === 'visible') pollLiveOnce(); }, 15000);
  }

  boot();
})();
