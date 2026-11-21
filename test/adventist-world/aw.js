/* ==========================================================================
   Adventist World — Core Interactive Engine (PL & EN)
   Meridian Globe Canvas · Spotlight · 49-Record Filter/Search/Pagination · CSV/JSON
   ========================================================================== */
(function () {
  'use strict';

  const LANG = document.documentElement.lang === 'en' ? 'en' : 'pl';
  const BASE = '/test/adventist-world';
  const PER_PAGE = 12;

  const I18N = {
    pl: {
      foundOne: 'Znaleziono <strong>1</strong> instytucję',
      foundFew: (n) => `Znaleziono <strong>${n}</strong> instytucje`,
      foundMany: (n) => `Znaleziono <strong>${n}</strong> instytucji`,
      ofTotal: (n) => `z ${n} w bazie`,
      allCats: 'Wszystkie kategorie',
      allCountries: 'Wszystkie kraje',
      allLangs: 'Wszystkie języki',
      sourceLabel: 'Źródło publiczne · Unclaimed',
      websiteLabel: 'Strona www',
      sourceLinkLabel: 'Źródło wykazu',
      profileCta: 'Zobacz profil →',
      openExternal: 'Odwiedź źródło ↗',
      noResultsTitle: 'Brak pasujących instytucji',
      noResultsDesc: 'Spróbuj usunąć część filtrów albo wyszukać inne miasto lub kategorię.',
      resetFilters: 'Wyczyść filtry',
      prev: '← Poprzednia',
      next: 'Następna →',
      addressPending: 'Według wykazu publicznego',
      spotlightBadge: 'Źródło publiczne',
      formErrName: 'Podaj nazwę instytucji lub zboru (minimum 3 znaki).',
      formErrUrl: 'Wpisz poprawny adres zaczynający się od https://.',
      formErrNote: 'Opisz krótko proponowaną zmianę lub dodanie (min. 10 znaków).',
      formOk: 'Szkic zgłoszenia P0 jest gotowy poniżej (skopiowano JSON do schowka, jeśli przeglądarka pozwoliła). W etapie P1 formularz połączy się bezpośrednio z kolejką moderacji.'
    },
    en: {
      foundOne: 'Found <strong>1</strong> institution',
      foundFew: (n) => `Found <strong>${n}</strong> institutions`,
      foundMany: (n) => `Found <strong>${n}</strong> institutions`,
      ofTotal: (n) => `out of ${n} records`,
      allCats: 'All categories',
      allCountries: 'All countries',
      allLangs: 'All languages',
      sourceLabel: 'Public source · Unclaimed',
      websiteLabel: 'Official site',
      sourceLinkLabel: 'Official listing',
      profileCta: 'View profile →',
      openExternal: 'Source ↗',
      noResultsTitle: 'No matching institutions',
      noResultsDesc: 'Clear a filter or try searching another city, country, or keyword.',
      resetFilters: 'Reset filters',
      prev: '← Previous',
      next: 'Next →',
      addressPending: 'Listed in public directory',
      spotlightBadge: 'Public source',
      formErrName: 'Please enter the institution or congregation name (min. 3 characters).',
      formErrUrl: 'Please provide a valid URL starting with https://.',
      formErrNote: 'Please briefly describe the correction or new entry (min. 10 characters).',
      formOk: 'Your P0 submission draft is validated below (JSON copied to clipboard when supported). Direct moderation queue submission arrives in P1.'
    }
  };
  const T = I18N[LANG];

  function fold(str) {
    return String(str || '')
      .replace(/[łŁ]/g, 'l')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatCountMsg(n) {
    if (LANG === 'en') {
      return n === 1 ? T.foundOne : T.foundMany(n);
    }
    if (n === 1) return T.foundOne;
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
      return T.foundFew(n);
    }
    return T.foundMany(n);
  }

  /* 1. Sticky Header & Mobile Drawer */
  function initHeaderAndDrawer() {
    const head = document.querySelector('.aw-head');
    if (head) {
      const onScroll = () => head.classList.toggle('scrolled', window.scrollY > 18);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    const burger = document.getElementById('awBurger');
    const drawer = document.getElementById('awDrawer');
    const backdrop = document.getElementById('awBackdrop');
    const closeBtn = document.getElementById('awDrawerClose');
    if (!burger || !drawer || !backdrop) return;

    function setOpen(state) {
      drawer.classList.toggle('open', state);
      backdrop.classList.toggle('open', state);
      burger.setAttribute('aria-expanded', state ? 'true' : 'false');
      drawer.setAttribute('aria-hidden', state ? 'false' : 'true');
      document.body.style.overflow = state ? 'hidden' : '';
      if (state && closeBtn) closeBtn.focus();
      else if (!state) burger.focus();
    }

    burger.addEventListener('click', () => setOpen(true));
    if (closeBtn) closeBtn.addEventListener('click', () => setOpen(false));
    backdrop.addEventListener('click', () => setOpen(false));
    drawer.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setOpen(false));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) setOpen(false);
    });
  }

  /* 2. Hero Reveal Lock (never gets stuck hidden) */
  function initHeroLock() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const lock = () => {
      if (!hero.classList.contains('is-ready')) hero.classList.add('is-ready');
    };
    requestAnimationFrame(() => requestAnimationFrame(lock));
    const mo = new MutationObserver(lock);
    mo.observe(hero, { attributes: true, attributeFilter: ['class'] });
    const guard = setInterval(lock, 250);
    setTimeout(() => { clearInterval(guard); mo.disconnect(); }, 3000);
  }

  /* 3. Ambient Meridian Globe Canvas */
  function initGlobeCanvas() {
    const canvas = document.getElementById('awGlobeCanvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let phase = 0.4;

    const nodes = [
      { lon: 0.36, lat: 0.90, color: '#ff7a00' },   // Poland
      { lon: -1.34, lat: 0.68, color: '#e6ce95' },  // USA East
      { lon: 0.64, lat: -0.02, color: '#60a5fa' },  // Kenya
      { lon: 2.11, lat: 0.25, color: '#e6ce95' }    // Philippines
    ];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function drawFrame() {
      ctx.clearRect(0, 0, width, height);
      const cx = width > 900 ? width * 0.78 : width * 0.5;
      const cy = height * 0.50;
      const r = Math.min(width, height) * 0.38;

      // Soft aura
      const grad = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 1.35);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0.16)');
      grad.addColorStop(0.55, 'rgba(196, 163, 90, 0.06)');
      grad.addColorStop(1, 'rgba(4, 9, 20, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Outer meridian rim
      ctx.strokeStyle = 'rgba(196, 163, 90, 0.22)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating longitudes
      for (let i = 0; i < 6; i++) {
        const a = phase + (i * Math.PI) / 6;
        const rx = Math.abs(Math.cos(a)) * r;
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(196, 163, 90, 0.14)' : 'rgba(96, 165, 250, 0.10)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(6, rx), r, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Latitudes
      [-0.55, 0, 0.55].forEach((f) => {
        const y = cy + f * r * 0.86;
        const w = Math.sqrt(Math.max(0.05, 1 - f * f)) * r;
        ctx.strokeStyle = f === 0 ? 'rgba(230, 206, 149, 0.20)' : 'rgba(148, 163, 184, 0.10)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, w, Math.abs(w * 0.22), 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Global institution hub beacons
      nodes.forEach((n, idx) => {
        const a = n.lon + phase;
        const z = Math.sin(a) * Math.cos(n.lat);
        if (z < -0.15) return;
        const px = cx + Math.cos(a) * Math.cos(n.lat) * r * 0.85;
        const py = cy - Math.sin(n.lat) * r * 0.78;
        ctx.fillStyle = n.color;
        ctx.globalAlpha = 0.25 + 0.15 * Math.sin(phase * 2 + idx);
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.92;
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      phase += reduced ? 0.0008 : 0.0022;
      requestAnimationFrame(drawFrame);
    }
    requestAnimationFrame(drawFrame);
  }

  /* 4. Progressive Scroll Reveal + Drum Counters */
  function initReveals() {
    const items = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    function animateNum(el) {
      if (el.dataset.counted === '1') return;
      el.dataset.counted = '1';
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || '';
      if (!Number.isFinite(target)) return;
      const start = performance.now();
      const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 260 : 850;
      function step(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function show(el) {
      el.classList.add('in');
      el.querySelectorAll('[data-count]').forEach(animateNum);
    }

    function revealPassed() {
      const vh = window.innerHeight || 900;
      items.forEach((el) => {
        if (el.classList.contains('in')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.95) show(el);
      });
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.06 });
      items.forEach((el) => io.observe(el));
    }

    revealPassed();
    window.addEventListener('scroll', revealPassed, { passive: true });
    setTimeout(() => items.forEach(show), 1350);
  }

  /* 5. Spotlight Interactive Stage + Desktop Pointer Tilt */
  function initSpotlight(records) {
    const card = document.getElementById('awSpotlightCard');
    if (!card || !records.length) return;

    const featured = records.filter((r) => r.featured).slice(0, 5);
    if (!featured.length) return;

    const catEl = document.getElementById('spCat');
    const titleEl = document.getElementById('spTitle');
    const locEl = document.getElementById('spLoc');
    const descEl = document.getElementById('spDesc');
    const addrEl = document.getElementById('spAddr');
    const srcEl = document.getElementById('spSource');
    const profileBtn = document.getElementById('spProfileBtn');
    const siteBtn = document.getElementById('spSiteBtn');
    const tabsWrap = document.getElementById('spTabs');

    function profileHref(rec) {
      return LANG === 'en'
        ? `${BASE}/en/institution/${rec.slug}/`
        : `${BASE}/instytucja/${rec.slug}/`;
    }

    function renderSpotlight(idx) {
      const rec = featured[idx] || featured[0];
      if (!rec) return;
      const name = LANG === 'en' ? (rec.name_en || rec.name) : rec.name;
      const cat = LANG === 'en' ? (rec.category_en || rec.category) : rec.category;
      const country = LANG === 'en' ? (rec.country_en || rec.country) : rec.country;
      const desc = LANG === 'en' ? (rec.description_en || rec.description_pl) : rec.description_pl;
      const addr = rec.address ? `${rec.city ? rec.city + ', ' : ''}${rec.address}` : T.addressPending;

      if (catEl) catEl.textContent = `${cat} · ${country}`;
      if (titleEl) titleEl.textContent = name;
      if (locEl) locEl.textContent = `${rec.city || country} · ${T.spotlightBadge}`;
      if (descEl) descEl.textContent = desc;
      if (addrEl) addrEl.textContent = addr;

      const extUrl = rec.website || rec.source;
      if (srcEl) srcEl.textContent = extUrl ? extUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'adwent.pl';
      if (profileBtn) profileBtn.setAttribute('href', profileHref(rec));
      if (siteBtn) {
        if (extUrl) {
          siteBtn.setAttribute('href', extUrl);
          siteBtn.style.display = 'inline-flex';
        } else {
          siteBtn.style.display = 'none';
        }
      }

      if (tabsWrap) {
        tabsWrap.querySelectorAll('.sp-tab').forEach((btn, i) => {
          btn.classList.toggle('is-active', i === idx);
          btn.setAttribute('aria-selected', i === idx ? 'true' : 'false');
        });
      }
    }

    if (tabsWrap) {
      tabsWrap.innerHTML = featured.map((r, i) => {
        const shortLabel = (LANG === 'en' ? (r.name_en || r.name) : r.name)
          .replace(/^Kościół Adwentystów Dnia Siódmego w RP$/, 'KADS RP')
          .replace(/^Seventh-day Adventist Church in Poland$/, 'SDA Poland')
          .replace(/^Wyższa Szkoła Teologiczno-Humanistyczna$/, 'WSTH')
          .replace(/^Polish College of Theology and Humanities \(WSTH\)$/, 'WSTH')
          .replace(/^General Conference of Seventh-day Adventists$/, 'General Conf.');
        return `<button type="button" class="sp-tab${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}" data-sp-idx="${i}">${esc(shortLabel)}</button>`;
      }).join('');

      tabsWrap.addEventListener('click', (e) => {
        const btn = e.target.closest('.sp-tab');
        if (!btn) return;
        renderSpotlight(Number(btn.dataset.spIdx || 0));
      });
    }

    renderSpotlight(0);

    // Subtle 3D tilt ONLY for fine pointer & non-reduced-motion
    if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${(dx * 5).toFixed(2)}deg) rotateX(${(-dy * 5).toFixed(2)}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    }
  }

  /* 6. Catalog Filter, Search, Sort, Pagination & Export */
  function initCatalog(records) {
    const grid = document.getElementById('awCatalogGrid');
    if (!grid) return;

    const qInput = document.getElementById('awQuery');
    const catSelect = document.getElementById('awCatFilter');
    const countrySelect = document.getElementById('awCountryFilter');
    const langSelect = document.getElementById('awLangFilter');
    const sortSelect = document.getElementById('awSortFilter');
    const resetBtn = document.getElementById('awResetBtn');
    const statusEl = document.getElementById('awResultsStatus');
    const pagEl = document.getElementById('awPagination');
    const exportJsonBtn = document.getElementById('awExportJson');
    const exportCsvBtn = document.getElementById('awExportCsv');
    const catChips = Array.from(document.querySelectorAll('[data-cat-chip]'));
    const regionCards = Array.from(document.querySelectorAll('[data-country-card]'));

    const state = {
      q: '',
      cat: 'all',
      country: 'all',
      lang: 'all',
      sort: 'default',
      page: 1
    };

    function profileHref(rec) {
      return LANG === 'en'
        ? `${BASE}/en/institution/${rec.slug}/`
        : `${BASE}/instytucja/${rec.slug}/`;
    }

    function getFiltered() {
      const needle = fold(state.q);
      let list = records.filter((rec) => {
        if (state.cat !== 'all' && rec.category !== state.cat) return false;
        if (state.country !== 'all' && rec.country !== state.country) return false;
        if (state.lang !== 'all' && !(rec.languages || []).includes(state.lang)) return false;
        if (needle) {
          const hay = fold([
            rec.name, rec.name_en, rec.city, rec.address, rec.category, rec.category_en,
            rec.country, rec.country_en, rec.description_pl, rec.description_en
          ].join(' '));
          if (!hay.includes(needle)) return false;
        }
        return true;
      });

      if (state.sort === 'az') {
        list = list.slice().sort((a, b) => {
          const na = LANG === 'en' ? (a.name_en || a.name) : a.name;
          const nb = LANG === 'en' ? (b.name_en || b.name) : b.name;
          return na.localeCompare(nb, LANG);
        });
      } else if (state.sort === 'city') {
        list = list.slice().sort((a, b) => (a.city || '').localeCompare(b.city || '', LANG));
      } else if (state.sort === 'featured') {
        list = list.slice().sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
      }
      return list;
    }

    function syncVisualChips() {
      catChips.forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.catChip === state.cat);
      });
      regionCards.forEach((card) => {
        card.classList.toggle('is-selected', card.dataset.countryCard === state.country);
      });
    }

    function render() {
      const list = getFiltered();
      const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
      if (state.page > totalPages) state.page = totalPages;
      const start = (state.page - 1) * PER_PAGE;
      const slice = list.slice(start, start + PER_PAGE);

      if (statusEl) {
        statusEl.innerHTML = `${formatCountMsg(list.length)} <span class="muted">(${T.ofTotal(records.length)})</span>`;
      }

      if (!slice.length) {
        grid.innerHTML =
          `<div class="empty-state">` +
          `<h3 style="margin:0 0 8px;font-family:var(--display);font-size:1.7rem;">${esc(T.noResultsTitle)}</h3>` +
          `<p style="margin:0 0 18px;color:var(--ink-2);">${esc(T.noResultsDesc)}</p>` +
          `<button type="button" class="btn-orange" id="awEmptyReset">${esc(T.resetFilters)}</button>` +
          `</div>`;
        const emptyReset = document.getElementById('awEmptyReset');
        if (emptyReset) emptyReset.addEventListener('click', resetAll);
      } else {
        grid.innerHTML = slice.map((rec) => {
          const name = LANG === 'en' ? (rec.name_en || rec.name) : rec.name;
          const cat = LANG === 'en' ? (rec.category_en || rec.category) : rec.category;
          const country = LANG === 'en' ? (rec.country_en || rec.country) : rec.country;
          const desc = LANG === 'en' ? (rec.description_en || rec.description_pl) : rec.description_pl;
          const loc = rec.address ? `${rec.city}, ${rec.address}` : `${rec.city || ''} · ${country}`;
          const extHref = rec.website || rec.source;

          return (
            `<article class="inst-card" data-slug="${esc(rec.slug)}">` +
            `<div>` +
            `<div class="card-badges">` +
            `<span class="badge-cat">${esc(cat)}</span>` +
            `<span class="badge-trust">${esc(country)}</span>` +
            `</div>` +
            `<h3 class="card-title"><a href="${esc(profileHref(rec))}">${esc(name)}</a></h3>` +
            `<div class="card-loc">${esc(loc)}</div>` +
            `<p class="card-desc">${esc(desc)}</p>` +
            `</div>` +
            `<div class="card-foot">` +
            `<a class="card-link-profile" href="${esc(profileHref(rec))}">${esc(T.profileCta)}</a>` +
            (extHref
              ? `<a class="card-link-ext" href="${esc(extHref)}" target="_blank" rel="noopener noreferrer">${esc(rec.website ? T.websiteLabel : T.openExternal)}</a>`
              : '') +
            `</div>` +
            `</article>`
          );
        }).join('');
      }

      if (pagEl) {
        if (totalPages <= 1) {
          pagEl.innerHTML = '';
        } else {
          const btns = [];
          btns.push(`<button type="button" class="pg-btn" data-pg="${state.page - 1}" ${state.page <= 1 ? 'disabled' : ''}>${esc(T.prev)}</button>`);
          for (let p = 1; p <= totalPages; p++) {
            btns.push(`<button type="button" class="pg-btn${p === state.page ? ' is-active' : ''}" data-pg="${p}" aria-current="${p === state.page ? 'page' : 'false'}">${p}</button>`);
          }
          btns.push(`<button type="button" class="pg-btn" data-pg="${state.page + 1}" ${state.page >= totalPages ? 'disabled' : ''}>${esc(T.next)}</button>`);
          pagEl.innerHTML = btns.join('');
        }
      }

      syncVisualChips();
      return list;
    }

    function resetAll() {
      state.q = '';
      state.cat = 'all';
      state.country = 'all';
      state.lang = 'all';
      state.sort = 'default';
      state.page = 1;
      if (qInput) qInput.value = '';
      if (catSelect) catSelect.value = 'all';
      if (countrySelect) countrySelect.value = 'all';
      if (langSelect) langSelect.value = 'all';
      if (sortSelect) sortSelect.value = 'default';
      render();
    }

    if (qInput) {
      qInput.addEventListener('input', () => {
        state.q = qInput.value;
        state.page = 1;
        render();
      });
    }
    if (catSelect) {
      catSelect.addEventListener('change', () => {
        state.cat = catSelect.value;
        state.page = 1;
        render();
      });
    }
    if (countrySelect) {
      countrySelect.addEventListener('change', () => {
        state.country = countrySelect.value;
        state.page = 1;
        render();
      });
    }
    if (langSelect) {
      langSelect.addEventListener('change', () => {
        state.lang = langSelect.value;
        state.page = 1;
        render();
      });
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        state.sort = sortSelect.value;
        state.page = 1;
        render();
      });
    }
    if (resetBtn) resetBtn.addEventListener('click', resetAll);

    catChips.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.cat = btn.dataset.catChip || 'all';
        state.page = 1;
        if (catSelect) catSelect.value = state.cat;
        render();
      });
    });

    regionCards.forEach((card) => {
      card.addEventListener('click', () => {
        const picked = card.dataset.countryCard || 'all';
        state.country = state.country === picked ? 'all' : picked;
        state.page = 1;
        if (countrySelect) countrySelect.value = state.country;
        render();
        const kat = document.getElementById('katalog');
        if (kat) kat.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    if (pagEl) {
      pagEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-pg]');
        if (!btn || btn.disabled) return;
        state.page = Number(btn.dataset.pg || 1);
        render();
        const kat = document.getElementById('katalog');
        if (kat) kat.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    function downloadFile(filename, mime, content) {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        const current = getFiltered();
        downloadFile('adventist-world-institutions.json', 'application/json;charset=utf-8', JSON.stringify(current, null, 2));
      });
    }
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const current = getFiltered();
        const cols = ['id', 'slug', 'name', 'name_en', 'category', 'country', 'city', 'address', 'website', 'source', 'verification', 'claim_status'];
        const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const lines = [cols.join(',')].concat(
          current.map((row) => cols.map((c) => csvCell(row[c])).join(','))
        );
        downloadFile('adventist-world-institutions.csv', 'text/csv;charset=utf-8', '\uFEFF' + lines.join('\r\n'));
      });
    }

    render();
  }

  /* 7. P0 Correction / Addition Proposal Form (Honest JSON Builder — no fake backend) */
  function initProposalForm() {
    const form = document.getElementById('awProposalForm');
    const out = document.getElementById('awFormOutput');
    if (!form || !out) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      const category = String(fd.get('category') || 'Zbory').trim();
      const country = String(fd.get('country') || 'Polska').trim();
      const city = String(fd.get('city') || '').trim();
      const source = String(fd.get('source') || '').trim();
      const note = String(fd.get('note') || '').trim();

      const errors = [];
      if (name.length < 3) errors.push(T.formErrName);
      if (!/^https:\/\/[^\s]+/i.test(source)) errors.push(T.formErrUrl);
      if (note.length < 10) errors.push(T.formErrNote);

      out.hidden = false;
      if (errors.length) {
        out.className = 'form-result is-error';
        out.innerHTML = errors.map((err) => `<div>• ${esc(err)}</div>`).join('');
        return;
      }

      const payload = {
        schema: 'adventist-world-cc/p0-proposal-v1',
        submittedAt: new Date().toISOString(),
        lang: LANG,
        name,
        category,
        country,
        city,
        publicSourceUrl: source,
        note,
        verification: 'pending_review',
        claim_status: 'unclaimed'
      };
      const jsonText = JSON.stringify(payload, null, 2);

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(jsonText);
        }
      } catch (_) {}

      out.className = 'form-result';
      out.innerHTML = `<strong>${esc(T.formOk)}</strong><pre>${esc(jsonText)}</pre>`;
    });
  }

  /* Boot */
  async function boot() {
    initHeaderAndDrawer();
    initHeroLock();
    initGlobeCanvas();
    initReveals();
    initProposalForm();

    if (window.AW_ECO && typeof window.AW_ECO.mount === 'function') {
      window.AW_ECO.mount(LANG);
    }

    let records = [];
    const inlineEl = document.getElementById('aw-bootstrap-data');
    if (inlineEl) {
      try { records = JSON.parse(inlineEl.textContent || '[]'); } catch (_) {}
    }

    try {
      const res = await fetch(`${BASE}/data/institutions.json?v=20261121`, { cache: 'no-cache' });
      if (res.ok) {
        const fetched = await res.json();
        if (Array.isArray(fetched) && fetched.length) records = fetched;
      }
    } catch (_) {}

    if (records.length) {
      initSpotlight(records);
      initCatalog(records);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
