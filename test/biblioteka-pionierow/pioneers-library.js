/**
 * Biblioteka Pionierów Christian Culture — interactive catalog & bilingual (PL/EN) controller
 * Zero dependencies, progressive enhancement over pre-rendered static HTML.
 */
(() => {
  const STORAGE_KEY = 'cc_pioneers_lang';

  const UI_COPY = {
    pl: {
      testbar: 'Podgląd testowy (noindex) · Biblioteka Pionierów — Partia 01 (001–010 z 428 tomów) · Christian Culture',
      eyebrow: 'Christian Culture · Dziedzictwo Pionierów',
      heroTitleStart: 'Biblioteka',
      heroTitleAccent: 'Pionierów',
      heroLead:
        'Klasyczne dzieła biblijne, historyczne i prorocze pionierów wiary w jednym, bezpłatnym archiwum cyfrowym. Partia 01 otwiera kolekcję 428 tomów w edycji Christian Culture.',
      heroCtaCatalog: 'Przeglądaj Partię 01',
      heroCtaFeatured: 'Otwórz tom 001 (PDF)',
      statBatchLabel: 'Tomów w Partii 01',
      statTotalLabel: 'Cały katalog kolekcji',
      statAccessLabel: 'Bezpłatny dostęp PDF',
      featuredBadge: 'Polecany tom otwarcia · Nr 001',
      featuredDetails: 'Karta książki',
      featuredDownload: 'Pobierz PDF',
      catalogKicker: 'Katalog Partii 01 (001–010)',
      catalogHeading: 'Dziesięć fundamentów serii',
      searchPlaceholder: 'Szukaj po tytule (PL/EN), autorze lub temacie…',
      allAuthors: 'Wszyscy autorzy',
      btnDetails: 'Karta książki',
      btnDownload: 'Pobierz PDF',
      btnQuickView: 'Szybki podgląd',
      btnShare: 'Kopiuj link',
      copiedMsg: 'Skopiowano link do książki.',
      emptyTitle: 'Brak wyników dla wybranego filtra',
      emptyDesc: 'Wyczyść wyszukiwanie lub wybierz „Wszyscy autorzy”, aby zobaczyć wszystkie 10 książek Partii 01.',
      resetFilters: 'Pokaż wszystkie książki',
      showingBooks: (n, total) => `Wyświetlono ${n} z ${total} tomów`,
      detailBack: '← Powrót do Partii 01',
      detailDescHeading: 'O książce',
      detailHighlightsHeading: 'Główne zagadnienia',
      detailOtherLangHeading: 'English description',
      detailPdfNote: 'Oryginalne wydanie angielskie w formacie PDF (otwarty dostęp, bez rejestracji).',
    },
    en: {
      testbar: 'Preview environment (noindex) · Pioneers Library — Batch 01 (001–010 of 428 volumes) · Christian Culture',
      eyebrow: 'Christian Culture · Pioneer Heritage',
      heroTitleStart: 'Pioneers',
      heroTitleAccent: 'Library',
      heroLead:
        'Classic biblical, historical, and prophetic works by early faith pioneers in one free digital archive. Batch 01 opens our 428-volume Christian Culture edition.',
      heroCtaCatalog: 'Browse Batch 01',
      heroCtaFeatured: 'Open Vol. 001 (PDF)',
      statBatchLabel: 'Volumes in Batch 01',
      statTotalLabel: 'Full collection catalog',
      statAccessLabel: 'Free PDF access',
      featuredBadge: 'Featured opening volume · No. 001',
      featuredDetails: 'Book page',
      featuredDownload: 'Download PDF',
      catalogKicker: 'Batch 01 Catalog (001–010)',
      catalogHeading: 'Ten foundational volumes',
      searchPlaceholder: 'Search by title (EN/PL), author, or topic…',
      allAuthors: 'All authors',
      btnDetails: 'Book page',
      btnDownload: 'Download PDF',
      btnQuickView: 'Quick view',
      btnShare: 'Copy link',
      copiedMsg: 'Book link copied to clipboard.',
      emptyTitle: 'No matching volumes found',
      emptyDesc: 'Clear the search box or choose “All authors” to view all 10 books in Batch 01.',
      resetFilters: 'Show all books',
      showingBooks: (n, total) => `Showing ${n} of ${total} volumes`,
      detailBack: '← Back to Batch 01',
      detailDescHeading: 'About this book',
      detailHighlightsHeading: 'Key themes',
      detailOtherLangHeading: 'Opis po polsku',
      detailPdfNote: 'Original English edition in PDF format (free public access, no sign-up required).',
    },
  };

  function getInitialLang() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('lang');
    if (q === 'en' || q === 'pl') return q;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'pl') return saved;
    } catch (_) {}
    return 'pl';
  }

  let currentLang = getInitialLang();
  let currentAuthor = 'all';
  let currentQuery = '';

  function applyI18n(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {}

    document.querySelectorAll('[data-lang-switch]').forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang-switch') === lang ? 'true' : 'false');
    });

    const copy = UI_COPY[lang] || UI_COPY.pl;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key && typeof copy[key] === 'string') {
        el.textContent = copy[key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key && typeof copy[key] === 'string') {
        el.setAttribute('placeholder', copy[key]);
      }
    });

    document.querySelectorAll('[data-pl][data-en]').forEach((el) => {
      const val = el.getAttribute(lang === 'en' ? 'data-en' : 'data-pl');
      if (val !== null) el.textContent = val;
    });

    updateFilteredGrid();
  }

  function updateFilteredGrid() {
    const grid = document.getElementById('bpCatalogGrid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('[data-book-card]'));
    const q = currentQuery.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const author = card.getAttribute('data-author') || '';
      const haystack = (card.getAttribute('data-search') || '').toLowerCase();
      const authorOk = currentAuthor === 'all' || author === currentAuthor;
      const queryOk = !q || haystack.includes(q);
      const show = authorOk && queryOk;
      card.hidden = !show;
      if (show) visible += 1;
    });

    const countEl = document.getElementById('bpCountPill');
    if (countEl) {
      const copy = UI_COPY[currentLang] || UI_COPY.pl;
      countEl.textContent = copy.showingBooks(visible, cards.length);
    }

    const emptyEl = document.getElementById('bpEmptyState');
    if (emptyEl) {
      emptyEl.hidden = visible > 0;
    }
  }

  function setupCatalogControls() {
    const searchInput = document.getElementById('bpSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentQuery = searchInput.value;
        updateFilteredGrid();
      });
    }

    document.querySelectorAll('[data-author-filter]').forEach((chip) => {
      chip.addEventListener('click', () => {
        currentAuthor = chip.getAttribute('data-author-filter') || 'all';
        document.querySelectorAll('[data-author-filter]').forEach((c) => {
          c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
        });
        updateFilteredGrid();
      });
    });

    const resetBtn = document.getElementById('bpResetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        currentAuthor = 'all';
        currentQuery = '';
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('[data-author-filter]').forEach((c) => {
          c.setAttribute('aria-pressed', c.getAttribute('data-author-filter') === 'all' ? 'true' : 'false');
        });
        updateFilteredGrid();
      });
    }
  }

  function setupQuickViewModal() {
    const modal = document.getElementById('bpQuickModal');
    const dataScript = document.getElementById('bpCatalogData');
    if (!modal || !dataScript) return;

    let books = [];
    try {
      books = JSON.parse(dataScript.textContent || '[]');
    } catch (_) {
      return;
    }
    const byId = new Map(books.map((b) => [b.id, b]));
    let lastTrigger = null;

    const closeBtn = document.getElementById('bpModalClose');
    const coverEl = document.getElementById('bpModalCover');
    const authorEl = document.getElementById('bpModalAuthor');
    const titleEl = document.getElementById('bpModalTitle');
    const subEl = document.getElementById('bpModalSub');
    const descEl = document.getElementById('bpModalDesc');
    const pdfEl = document.getElementById('bpModalPdf');
    const pageEl = document.getElementById('bpModalPage');

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = '';
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        lastTrigger.focus();
      }
    }

    function openModal(bookId, trigger) {
      const book = byId.get(bookId);
      if (!book) return;
      lastTrigger = trigger;

      const isEn = currentLang === 'en';
      coverEl.src = book.coverWebp;
      coverEl.alt = `${book.titlePl} — ${book.author}`;
      authorEl.textContent = `${book.authorFull} (${book.authorYears}) · ${book.originalYear}`;
      titleEl.textContent = isEn ? book.titleEn : book.titlePl;
      subEl.textContent = isEn ? book.titlePl : book.titleEn;
      descEl.textContent = isEn ? book.descriptionEn : book.descriptionPl;
      pdfEl.href = book.pdfUrl;
      pdfEl.textContent = `${(UI_COPY[currentLang] || UI_COPY.pl).btnDownload} (${book.pdfSizeMb.toFixed(2)} MB)`;
      pageEl.href = `/test/biblioteka-pionierow/ksiazka/${book.slug}/`;
      pageEl.textContent = (UI_COPY[currentLang] || UI_COPY.pl).btnDetails;

      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    document.querySelectorAll('[data-quick-view]').forEach((btn) => {
      btn.addEventListener('click', () => {
        openModal(btn.getAttribute('data-quick-view'), btn);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  function setupShareButtons() {
    document.querySelectorAll('[data-copy-url]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const url = btn.getAttribute('data-copy-url') || window.location.href;
        const feedback = document.getElementById('bpShareFeedback');
        try {
          await navigator.clipboard.writeText(url);
          if (feedback) {
            feedback.textContent = (UI_COPY[currentLang] || UI_COPY.pl).copiedMsg;
          }
        } catch (_) {
          if (feedback) {
            feedback.textContent = url;
          }
        }
      });
    });
  }

  function setupLangButtons() {
    document.querySelectorAll('[data-lang-switch]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextLang = btn.getAttribute('data-lang-switch');
        if (nextLang === 'pl' || nextLang === 'en') {
          applyI18n(nextLang);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupLangButtons();
    setupCatalogControls();
    setupQuickViewModal();
    setupShareButtons();
    applyI18n(currentLang);
  });
})();
