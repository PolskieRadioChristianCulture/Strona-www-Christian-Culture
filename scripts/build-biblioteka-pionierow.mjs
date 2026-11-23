#!/usr/bin/env node
/**
 * Deterministic generator for /biblioteka-pionierow/ (Partia 01: books 001–010)
 * Reads biblioteka-pionierow/data/partia-01.json and generates:
 *   - biblioteka-pionierow/index.html
 *   - biblioteka-pionierow/ksiazka/<slug>/index.html (10 individual Book pages with JSON-LD Book)
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'biblioteka-pionierow');
const DATA_PATH = path.join(BASE_DIR, 'data', 'partia-01.json');
const ASSET_VER = '20261123prod1';
const GA4_HEAD_SNIPPET = `  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config','G-Y4EFTVBPE3',(function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})());
  </script>
  <script src="/js/cc-analytics.js?v=20261026_1" defer></script>`;

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeJsonForScript(obj) {
  return JSON.stringify(obj, null, 2).replace(/<\//g, '<\\/');
}

function buildBookJsonLd(book, siteOrigin = 'https://polskieradio.cc') {
  const pageUrl = `${siteOrigin}/biblioteka-pionierow/ksiazka/${book.slug}/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': `${pageUrl}#book`,
    name: book.titlePl,
    alternateName: book.titleEn,
    author: {
      '@type': 'Person',
      name: book.authorFull,
      alternateName: book.author,
    },
    inLanguage: [book.inLanguage, 'pl'],
    datePublished: String(book.originalYear),
    image: `${siteOrigin}${book.coverWebp}`,
    isAccessibleForFree: true,
    url: pageUrl,
    encodingFormat: 'application/pdf',
    contentUrl: book.pdfUrl,
    bookFormat: 'https://schema.org/EBook',
    description: `${book.summaryPl} ${book.summaryEn}`,
    about: [book.themePl, book.themeEn],
    publisher: {
      '@type': 'Organization',
      name: 'Christian Culture',
      url: siteOrigin,
    },
    associatedMedia: {
      '@type': 'MediaObject',
      contentUrl: book.pdfUrl,
      encodingFormat: 'application/pdf',
      contentSize: `${book.pdfSizeMb.toFixed(2)} MB`,
    },
  };
}

function renderNav(isDetail = false) {
  const catalogHref = isDetail ? '/biblioteka-pionierow/' : '#katalog';
  return `  <nav class="bp-nav" aria-label="Nawigacja główna">
    <div class="bp-wrap bp-nav-inner">
      <a class="bp-brand" href="/biblioteka-pionierow/">
        <span class="bp-brand-mark" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 6.5C2 5.4 2.9 4.5 4 4.5h5.5A3.5 3.5 0 0 1 13 8v12a2.5 2.5 0 0 0-2.5-2.5H4a2 2 0 0 1-2-2v-9Z"/>
            <path d="M22 6.5c0-1.1-.9-2-2-2h-5.5A3.5 3.5 0 0 0 11 8v12a2.5 2.5 0 0 1 2.5-2.5H20a2 2 0 0 0 2-2v-9Z"/>
          </svg>
        </span>
        <span class="bp-brand-text">
          <span class="bp-brand-kicker">Christian Culture</span>
          <span class="bp-brand-name" data-pl="Biblioteka Pionierów" data-en="Pioneers Library">Biblioteka Pionierów</span>
        </span>
      </a>

      <div class="bp-nav-actions header-right">
        <a class="bp-nav-link" href="${catalogHref}" data-pl="Katalog (001–010)" data-en="Catalog (001–010)">Katalog (001–010)</a>
        <a class="bp-nav-link" href="/biblioteka" data-pl="CCN Biblioteka" data-en="CCN Library">CCN Biblioteka</a>
        <a class="bp-nav-link" href="/mojabiblia" data-pl="MojaBiblia" data-en="MyBible">MojaBiblia</a>
        <a class="bp-btn bp-btn-primary bp-support-cta" style="min-height:44px;padding:8px 14px;font-size:0.86rem;" href="/wspieraj" aria-label="Wspieram to — wsparcie misji Christian Culture">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span class="bp-support-text" data-pl="Wspieram to" data-en="Support">Wspieram to</span>
        </a>
        <button type="button" class="bp-icon-btn" data-cc-omni-search aria-label="Otwórz wyszukiwarkę ekosystemu Christian Culture">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
        </button>
        <div class="bp-lang-toggle" role="group" aria-label="Wybór języka / Language">
          <button type="button" class="bp-lang-btn" data-lang-switch="pl" aria-pressed="true">PL</button>
          <button type="button" class="bp-lang-btn" data-lang-switch="en" aria-pressed="false">EN</button>
        </div>
      </div>
    </div>
  </nav>`;
}

function renderFooter() {
  return `  <footer class="bp-footer">
    <div class="bp-wrap bp-footer-inner">
      <p class="bp-footer-copy" data-pl="© Christian Culture · Biblioteka Pionierów (Partia 01: tomy 001–010 z 428) · Otwarty dostęp PDF." data-en="© Christian Culture · Pioneers Library (Batch 01: volumes 001–010 of 428) · Free public PDF access.">© Christian Culture · Biblioteka Pionierów (Partia 01: tomy 001–010 z 428) · Otwarty dostęp PDF.</p>
      <div class="bp-footer-links">
        <a class="bp-nav-link" href="/">PolskieRadio.cc</a>
        <a class="bp-nav-link" href="/biblioteka">CCN Biblioteka</a>
        <a class="bp-nav-link" href="/mojabiblia">MojaBiblia</a>
        <a class="bp-nav-link" href="/szukaj" data-pl="Wyszukiwarka" data-en="Search">Wyszukiwarka</a>
      </div>
    </div>
  </footer>`;
}

function renderIndexPage(catalog) {
  const { books, totalCatalogBooks } = catalog;
  const featured = books[0];
  const authors = [...new Set(books.map((b) => b.author))];

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Biblioteka Pionierów Christian Culture — Partia 01 (001–010)',
    alternateName: 'Christian Culture Pioneers Library — Batch 01 (001–010)',
    url: 'https://polskieradio.cc/biblioteka-pionierow/',
    inLanguage: ['pl', 'en'],
    isAccessibleForFree: true,
    publisher: {
      '@type': 'Organization',
      name: 'Christian Culture',
      url: 'https://polskieradio.cc',
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: books.length,
      itemListElement: books.map((book, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: buildBookJsonLd(book),
      })),
    },
  };

  const authorButtonsHtml = authors
    .map(
      (author) =>
        `          <button type="button" class="bp-chip" data-author-filter="${escHtml(author)}" aria-pressed="false">${escHtml(author)}</button>`
    )
    .join('\n');

  const cardsHtml = books
    .map((book) => {
      const searchTokens = [
        book.id,
        book.author,
        book.authorFull,
        book.titlePl,
        book.titleEn,
        book.themePl,
        book.themeEn,
        book.categoryPl,
        book.categoryEn,
        ...(book.tags || []),
      ].join(' ');

      const detailUrl = `/biblioteka-pionierow/ksiazka/${book.slug}/`;
      return `        <li class="bp-card" data-book-card data-author="${escHtml(book.author)}" data-search="${escHtml(searchTokens)}">
          <div class="bp-card-media">
            <a href="${detailUrl}" aria-label="${escHtml(book.titlePl)} — ${escHtml(book.author)}">
              <img src="${escHtml(book.coverWebp)}" width="${book.coverWidth}" height="${book.coverHeight}" alt="Okładka 3D książki ${escHtml(book.titlePl)} (${escHtml(book.titleEn)}) — ${escHtml(book.author)}, edycja Christian Culture" loading="lazy" decoding="async" />
            </a>
            <span class="bp-card-num">#${escHtml(book.id)}</span>
            <span class="bp-card-size">PDF · ${book.pdfSizeMb.toFixed(2)} MB</span>
          </div>
          <div class="bp-card-body">
            <div class="bp-card-meta">
              <span class="bp-card-author">${escHtml(book.author)} · ${book.originalYear}</span>
              <span class="bp-card-cat" data-pl="${escHtml(book.categoryPl)}" data-en="${escHtml(book.categoryEn)}">${escHtml(book.categoryPl)}</span>
            </div>
            <h3 class="bp-card-title">
              <a href="${detailUrl}" data-pl="${escHtml(book.titlePl)}" data-en="${escHtml(book.titleEn)}">${escHtml(book.titlePl)}</a>
            </h3>
            <p class="bp-card-en" data-pl="${escHtml(book.titleEn)}" data-en="${escHtml(book.titlePl)}">${escHtml(book.titleEn)}</p>
            <p class="bp-card-desc" data-pl="${escHtml(book.summaryPl)}" data-en="${escHtml(book.summaryEn)}">${escHtml(book.summaryPl)}</p>
            <p class="bp-card-theme" data-pl="${escHtml(book.themePl)}" data-en="${escHtml(book.themeEn)}">${escHtml(book.themePl)}</p>
            <div class="bp-card-actions">
              <a class="bp-btn bp-btn-primary" href="${escHtml(book.pdfUrl)}" target="_blank" rel="noopener noreferrer" data-pl="Pobierz PDF" data-en="Download PDF">Pobierz PDF</a>
              <a class="bp-btn bp-btn-gold" href="${detailUrl}" data-pl="Karta książki" data-en="Book page">Karta książki</a>
            </div>
            <div style="margin-top:10px;">
              <button type="button" class="bp-btn bp-btn-ghost" style="width:100%;" data-quick-view="${escHtml(book.id)}" data-i18n="btnQuickView">Szybki podgląd</button>
            </div>
          </div>
        </li>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="pl" dir="ltr">
<head>
${GA4_HEAD_SNIPPET}
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <meta name="theme-color" content="#04070f" />
  <title>Biblioteka Pionierów — Partia 01 (001–010) | Christian Culture</title>
  <meta name="description" content="Biblioteka Pionierów Christian Culture: klasyczne dzieła E. J. Waggonera, A. T. Jonesa, W. W. Prescotta, Uriaha Smitha, J. N. Andrewsa i S. N. Haskella w bezpłatnym dostępie PDF (Partia 01: tomy 001–010 z 428)." />
  <link rel="canonical" href="https://polskieradio.cc/biblioteka-pionierow/" />
  <link rel="icon" type="image/png" href="/app-christian-culture.png" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Christian Culture" />
  <meta property="og:url" content="https://polskieradio.cc/biblioteka-pionierow/" />
  <meta property="og:title" content="Biblioteka Pionierów — Partia 01 (001–010) | Christian Culture" />
  <meta property="og:description" content="10 fundamentalnych dzieł pionierów wiary w otwartym archiwum cyfrowym Christian Culture (opisy PL + EN, bezpłatne PDF)." />
  <meta property="og:image" content="https://polskieradio.cc${escHtml(featured.coverWebp)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preload" as="image" href="${escHtml(featured.coverWebp)}" fetchpriority="high" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/biblioteka-pionierow/pioneers-library.css?v=${ASSET_VER}" />
  <script type="application/ld+json">
${safeJsonForScript(collectionJsonLd)}
  </script>
  <script src="/components/cc-omni-search.js" defer></script>
  <script src="/biblioteka-pionierow/pioneers-library.js?v=${ASSET_VER}" defer></script>
</head>
<body>
  <div class="bp-backdrop" aria-hidden="true"></div>
  <a class="bp-skip" href="#katalog">Przejdź do katalogu książek</a>

${renderNav(false)}

  <header class="bp-hero" aria-labelledby="bpHeroTitle">
    <div class="bp-wrap bp-hero-grid">
      <div>
        <p class="bp-eyebrow" data-i18n="eyebrow">Christian Culture · Dziedzictwo Pionierów</p>
        <h1 id="bpHeroTitle" class="bp-h1">
          <span style="color:#ffffff;" data-i18n="heroTitleStart">Biblioteka</span>
          <span data-i18n="heroTitleAccent">Pionierów</span>
        </h1>
        <p class="bp-lead" data-i18n="heroLead">Klasyczne dzieła biblijne, historyczne i prorocze pionierów wiary w jednym, bezpłatnym archiwum cyfrowym. Partia 01 otwiera kolekcję 428 tomów w edycji Christian Culture.</p>
        <div class="bp-hero-actions">
          <a class="bp-btn bp-btn-primary" href="#katalog" data-i18n="heroCtaCatalog">Przeglądaj Partię 01</a>
          <a class="bp-btn bp-btn-gold" href="${escHtml(featured.pdfUrl)}" target="_blank" rel="noopener noreferrer" data-i18n="heroCtaFeatured">Otwórz tom 001 (PDF)</a>
        </div>
        <div class="bp-stats" aria-label="Podsumowanie kolekcji">
          <div class="bp-stat">
            <span class="bp-stat-val">${books.length}</span>
            <span class="bp-stat-label" data-i18n="statBatchLabel">Tomów w Partii 01</span>
          </div>
          <div class="bp-stat">
            <span class="bp-stat-val">${totalCatalogBooks}</span>
            <span class="bp-stat-label" data-i18n="statTotalLabel">Cały katalog kolekcji</span>
          </div>
          <div class="bp-stat">
            <span class="bp-stat-val">100%</span>
            <span class="bp-stat-label" data-i18n="statAccessLabel">Bezpłatny dostęp PDF</span>
          </div>
        </div>
      </div>

      <article class="bp-featured-card" aria-labelledby="bpFeaturedTitle">
        <div class="bp-featured-badge" data-i18n="featuredBadge">Polecany tom otwarcia · Nr 001</div>
        <div class="bp-featured-media">
          <img src="${escHtml(featured.coverWebp)}" width="${featured.coverWidth}" height="${featured.coverHeight}" alt="Okładka 3D książki ${escHtml(featured.titlePl)} — ${escHtml(featured.author)}" fetchpriority="high" decoding="async" />
        </div>
        <div class="bp-featured-body">
          <p class="bp-featured-author">${escHtml(featured.authorFull)} · ${featured.originalYear}</p>
          <h2 id="bpFeaturedTitle" class="bp-featured-title" data-pl="${escHtml(featured.titlePl)}" data-en="${escHtml(featured.titleEn)}">${escHtml(featured.titlePl)}</h2>
          <p class="bp-featured-sub" data-pl="${escHtml(featured.titleEn)}" data-en="${escHtml(featured.titlePl)}">${escHtml(featured.titleEn)}</p>
          <p class="bp-featured-desc" data-pl="${escHtml(featured.summaryPl)}" data-en="${escHtml(featured.summaryEn)}">${escHtml(featured.summaryPl)}</p>
          <div class="bp-featured-actions">
            <a class="bp-btn bp-btn-primary" href="${escHtml(featured.pdfUrl)}" target="_blank" rel="noopener noreferrer" data-pl="Pobierz PDF (${featured.pdfSizeMb.toFixed(2)} MB)" data-en="Download PDF (${featured.pdfSizeMb.toFixed(2)} MB)">Pobierz PDF (${featured.pdfSizeMb.toFixed(2)} MB)</a>
            <a class="bp-btn bp-btn-gold" href="/biblioteka-pionierow/ksiazka/${featured.slug}/" data-i18n="featuredDetails">Karta książki</a>
          </div>
        </div>
      </article>
    </div>
  </header>

  <main id="katalog">
    <section class="bp-section" aria-labelledby="bpCatalogHeading">
      <div class="bp-wrap">
        <div class="bp-section-head">
          <div>
            <p class="bp-kicker" data-i18n="catalogKicker">Katalog Partii 01 (001–010)</p>
            <h2 id="bpCatalogHeading" class="bp-h2" data-i18n="catalogHeading">Dziesięć fundamentów serii</h2>
          </div>
          <div id="bpCountPill" class="bp-count-pill" aria-live="polite">Wyświetlono ${books.length} z ${books.length} tomów</div>
        </div>

        <div class="bp-controls">
          <div class="bp-search-row">
            <div class="bp-search-wrap">
              <svg class="bp-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <label for="bpSearchInput" class="bp-skip">Szukaj w katalogu Partii 01</label>
              <input id="bpSearchInput" class="bp-search-input" type="search" autocomplete="off" data-i18n-placeholder="searchPlaceholder" placeholder="Szukaj po tytule (PL/EN), autorze lub temacie…" />
            </div>
          </div>
          <div class="bp-filters" role="group" aria-label="Filtruj według autora">
            <button type="button" class="bp-chip" data-author-filter="all" aria-pressed="true" data-i18n="allAuthors">Wszyscy autorzy</button>
${authorButtonsHtml}
          </div>
        </div>

        <ul id="bpCatalogGrid" class="bp-grid">
${cardsHtml}
        </ul>

        <div id="bpEmptyState" class="bp-empty" hidden>
          <h3 class="bp-card-title" data-i18n="emptyTitle">Brak wyników dla wybranego filtra</h3>
          <p class="bp-card-desc" data-i18n="emptyDesc">Wyczyść wyszukiwanie lub wybierz „Wszyscy autorzy”, aby zobaczyć wszystkie 10 książek Partii 01.</p>
          <button type="button" id="bpResetFilters" class="bp-btn bp-btn-gold" data-i18n="resetFilters">Pokaż wszystkie książki</button>
        </div>
      </div>
    </section>

    <section class="bp-section" aria-labelledby="bpAboutHeading">
      <div class="bp-wrap">
        <div class="bp-section-head">
          <div>
            <p class="bp-kicker" data-pl="O archiwum" data-en="About the archive">O archiwum</p>
            <h2 id="bpAboutHeading" class="bp-h2" data-pl="Standard edycji Christian Culture" data-en="Christian Culture edition standard">Standard edycji Christian Culture</h2>
          </div>
        </div>
        <div class="bp-about-box">
          <div class="bp-info-card">
            <h3 data-pl="Bezpłatny dostęp do źródeł" data-en="Free access to primary sources">Bezpłatny dostęp do źródeł</h3>
            <p data-pl="Wszystkie tomy udostępniane są bez opłat i bez rejestracji w oryginalnym formacie PDF poprzez publiczne archiwum źródłowe." data-en="Every volume is provided free of charge with no registration required, linking directly to the original public-domain PDF archive.">Wszystkie tomy udostępniane są bez opłat i bez rejestracji w oryginalnym formacie PDF poprzez publiczne archiwum źródłowe.</p>
          </div>
          <div class="bp-info-card">
            <h3 data-pl="Dwujęzyczne opracowanie PL + EN" data-en="Bilingual PL + EN curation">Dwujęzyczne opracowanie PL + EN</h3>
            <p data-pl="Każda pozycja posiada rzetelny opis po polsku i angielsku, pełne metadane autora, rok wydania oraz strukturę JSON-LD Book." data-en="Each volume includes faithful Polish and English descriptions, complete author metadata, original year, and structured JSON-LD Book data.">Każda pozycja posiada rzetelny opis po polsku i angielsku, pełne metadane autora, rok wydania oraz strukturę JSON-LD Book.</p>
          </div>
          <div class="bp-info-card">
            <h3 data-pl="Kolekcja rozbudowywana partiami" data-en="Expanding batch by batch">Kolekcja rozbudowywana partiami</h3>
            <p data-pl="Partia 01 obejmuje tomy 001–010 z 428. Kolekcja jest systematycznie rozbudowywana o kolejne partie po 10 tomów w otwartym archiwum Christian Culture." data-en="Batch 01 covers volumes 001–010 of 428. The collection is systematically expanded in batches of 10 volumes in the open Christian Culture archive.">Partia 01 obejmuje tomy 001–010 z 428. Kolekcja jest systematycznie rozbudowywana o kolejne partie po 10 tomów w otwartym archiwum Christian Culture.</p>
          </div>
        </div>
      </div>
    </section>
  </main>

  <div id="bpQuickModal" class="bp-modal" role="dialog" aria-modal="true" aria-labelledby="bpModalTitle" hidden>
    <div class="bp-modal-dialog">
      <button type="button" id="bpModalClose" class="bp-modal-close" aria-label="Zamknij podgląd">×</button>
      <div class="bp-modal-grid">
        <div class="bp-modal-cover">
          <img id="bpModalCover" src="${escHtml(featured.coverWebp)}" alt="${escHtml(featured.titlePl)}" />
        </div>
        <div>
          <p id="bpModalAuthor" class="bp-featured-author"></p>
          <h2 id="bpModalTitle" class="bp-featured-title"></h2>
          <p id="bpModalSub" class="bp-featured-sub"></p>
          <p id="bpModalDesc" class="bp-featured-desc"></p>
          <div class="bp-featured-actions">
            <a id="bpModalPdf" class="bp-btn bp-btn-primary" href="${escHtml(featured.pdfUrl)}" target="_blank" rel="noopener noreferrer">Pobierz PDF</a>
            <a id="bpModalPage" class="bp-btn bp-btn-gold" href="/biblioteka-pionierow/ksiazka/${featured.slug}/">Karta książki</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script id="bpCatalogData" type="application/json">
${safeJsonForScript(books)}
  </script>

${renderFooter()}
</body>
</html>
`;
}

function renderBookPage(book, prevBook, nextBook) {
  const jsonLd = buildBookJsonLd(book);
  const pageUrl = `https://polskieradio.cc/biblioteka-pionierow/ksiazka/${book.slug}/`;

  const highlightsHtml = book.highlightsPl
    .map((hPl, i) => {
      const hEn = book.highlightsEn[i] || hPl;
      return `          <li data-pl="${escHtml(hPl)}" data-en="${escHtml(hEn)}">${escHtml(hPl)}</li>`;
    })
    .join('\n');

  const prevHtml = prevBook
    ? `        <a class="bp-pager-card" href="/biblioteka-pionierow/ksiazka/${prevBook.slug}/">
          <span class="bp-pager-label" data-pl="← Poprzedni tom (#${prevBook.id})" data-en="← Previous volume (#${prevBook.id})">← Poprzedni tom (#${prevBook.id})</span>
          <span class="bp-pager-title" data-pl="${escHtml(prevBook.titlePl)}" data-en="${escHtml(prevBook.titleEn)}">${escHtml(prevBook.titlePl)}</span>
        </a>`
    : `        <a class="bp-pager-card" href="/biblioteka-pionierow/">
          <span class="bp-pager-label" data-pl="← Katalog Partii 01" data-en="← Batch 01 Catalog">← Katalog Partii 01</span>
          <span class="bp-pager-title" data-pl="Wszystkie 10 tomów" data-en="All 10 volumes">Wszystkie 10 tomów</span>
        </a>`;

  const nextHtml = nextBook
    ? `        <a class="bp-pager-card is-next" href="/biblioteka-pionierow/ksiazka/${nextBook.slug}/">
          <span class="bp-pager-label" data-pl="Następny tom (#${nextBook.id}) →" data-en="Next volume (#${nextBook.id}) →">Następny tom (#${nextBook.id}) →</span>
          <span class="bp-pager-title" data-pl="${escHtml(nextBook.titlePl)}" data-en="${escHtml(nextBook.titleEn)}">${escHtml(nextBook.titlePl)}</span>
        </a>`
    : `        <a class="bp-pager-card is-next" href="/biblioteka-pionierow/">
          <span class="bp-pager-label" data-pl="Powrót do spisu →" data-en="Back to index →">Powrót do spisu →</span>
          <span class="bp-pager-title" data-pl="Biblioteka Pionierów (Partia 01)" data-en="Pioneers Library (Batch 01)">Biblioteka Pionierów (Partia 01)</span>
        </a>`;

  return `<!DOCTYPE html>
<html lang="pl" dir="ltr">
<head>
${GA4_HEAD_SNIPPET}
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <meta name="theme-color" content="#04070f" />
  <title>${escHtml(book.titlePl)} — ${escHtml(book.author)} | Biblioteka Pionierów CC</title>
  <meta name="description" content="${escHtml(book.summaryPl)}" />
  <link rel="canonical" href="${escHtml(pageUrl)}" />
  <link rel="icon" type="image/png" href="/app-christian-culture.png" />
  <meta property="og:type" content="book" />
  <meta property="og:site_name" content="Christian Culture" />
  <meta property="og:url" content="${escHtml(pageUrl)}" />
  <meta property="og:title" content="${escHtml(book.titlePl)} (${escHtml(book.titleEn)}) — ${escHtml(book.author)}" />
  <meta property="og:description" content="${escHtml(book.summaryPl)}" />
  <meta property="og:image" content="https://polskieradio.cc${escHtml(book.coverWebp)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preload" as="image" href="${escHtml(book.coverWebp)}" fetchpriority="high" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/biblioteka-pionierow/pioneers-library.css?v=${ASSET_VER}" />
  <script type="application/ld+json">
${safeJsonForScript(jsonLd)}
  </script>
  <script src="/components/cc-omni-search.js" defer></script>
  <script src="/biblioteka-pionierow/pioneers-library.js?v=${ASSET_VER}" defer></script>
</head>
<body>
  <div class="bp-backdrop" aria-hidden="true"></div>
  <a class="bp-skip" href="#bookMain">Przejdź do opisu książki</a>

${renderNav(true)}

  <main id="bookMain" class="bp-wrap">
    <nav class="bp-breadcrumb" aria-label="Ścieżka nawigacji">
      <a href="/biblioteka-pionierow/" data-i18n="detailBack">← Powrót do Partii 01</a>
      <span aria-hidden="true">/</span>
      <span>#${escHtml(book.id)} · ${escHtml(book.author)}</span>
    </nav>

    <article class="bp-detail-hero">
      <figure class="bp-detail-cover" style="margin:0;">
        <img src="${escHtml(book.coverWebp)}" width="${book.coverWidth}" height="${book.coverHeight}" alt="Okładka 3D książki ${escHtml(book.titlePl)} (${escHtml(book.titleEn)}) — ${escHtml(book.author)}, Christian Culture" fetchpriority="high" decoding="async" />
      </figure>

      <div class="bp-detail-panel">
        <p class="bp-eyebrow" data-pl="Tom #${escHtml(book.id)} · Partia 01 · ${escHtml(book.categoryPl)}" data-en="Volume #${escHtml(book.id)} · Batch 01 · ${escHtml(book.categoryEn)}">Tom #${escHtml(book.id)} · Partia 01 · ${escHtml(book.categoryPl)}</p>
        <h1 class="bp-h1" style="font-size:clamp(1.65rem, 3vw, 2.5rem);" data-pl="${escHtml(book.titlePl)}" data-en="${escHtml(book.titleEn)}">${escHtml(book.titlePl)}</h1>
        <p class="bp-featured-sub" data-pl="${escHtml(book.titleEn)}" data-en="${escHtml(book.titlePl)}">${escHtml(book.titleEn)}</p>

        <dl class="bp-meta-list">
          <div class="bp-meta-item">
            <dt data-pl="Autor" data-en="Author">Autor</dt>
            <dd>${escHtml(book.authorFull)} (${escHtml(book.authorYears)})</dd>
          </div>
          <div class="bp-meta-item">
            <dt data-pl="Rok wydania oryginału" data-en="Original edition">Rok wydania oryginału</dt>
            <dd>${book.originalYear} · EN (PDF)</dd>
          </div>
          <div class="bp-meta-item">
            <dt data-pl="Temat przewodni" data-en="Core theme">Temat przewodni</dt>
            <dd data-pl="${escHtml(book.themePl)}" data-en="${escHtml(book.themeEn)}">${escHtml(book.themePl)}</dd>
          </div>
          <div class="bp-meta-item">
            <dt data-pl="Format i rozmiar" data-en="Format & size">Format i rozmiar</dt>
            <dd>PDF · ${book.pdfSizeMb.toFixed(2)} MB · Free</dd>
          </div>
        </dl>

        <div class="bp-detail-actions">
          <a class="bp-btn bp-btn-primary" href="${escHtml(book.pdfUrl)}" target="_blank" rel="noopener noreferrer" data-pl="Pobierz bezpłatny PDF (${book.pdfSizeMb.toFixed(2)} MB)" data-en="Download free PDF (${book.pdfSizeMb.toFixed(2)} MB)">Pobierz bezpłatny PDF (${book.pdfSizeMb.toFixed(2)} MB)</a>
          <button type="button" class="bp-btn bp-btn-gold" data-copy-url="${escHtml(pageUrl)}" data-i18n="btnShare">Kopiuj link</button>
        </div>
        <p class="bp-feedback" id="bpShareFeedback" aria-live="polite"></p>
        <p style="margin:6px 0 0;font-size:0.84rem;color:var(--bp-text-soft);" data-i18n="detailPdfNote">Oryginalne wydanie angielskie w formacie PDF (otwarty dostęp, bez rejestracji).</p>

        <div class="bp-bilingual-block">
          <h2 data-i18n="detailDescHeading">O książce</h2>
          <p data-pl="${escHtml(book.descriptionPl)}" data-en="${escHtml(book.descriptionEn)}">${escHtml(book.descriptionPl)}</p>
        </div>

        <div class="bp-bilingual-block">
          <h2 data-i18n="detailHighlightsHeading">Główne zagadnienia</h2>
          <ul class="bp-highlights">
${highlightsHtml}
          </ul>
        </div>

        <div class="bp-bilingual-block">
          <h2 data-i18n="detailOtherLangHeading">English description</h2>
          <p data-pl="${escHtml(book.descriptionEn)}" data-en="${escHtml(book.descriptionPl)}">${escHtml(book.descriptionEn)}</p>
        </div>
      </div>
    </article>

    <nav class="bp-pager" aria-label="Nawigacja między tomami">
${prevHtml}
${nextHtml}
    </nav>
  </main>

${renderFooter()}
</body>
</html>
`;
}

function main() {
  const catalog = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const { books } = catalog;
  if (!Array.isArray(books) || books.length === 0) {
    throw new Error('Brak książek w partia-01.json');
  }

  fs.writeFileSync(path.join(BASE_DIR, 'index.html'), renderIndexPage(catalog), 'utf8');
  console.log(`Generated ${path.relative(ROOT, path.join(BASE_DIR, 'index.html'))}`);

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const prevBook = i > 0 ? books[i - 1] : null;
    const nextBook = i < books.length - 1 ? books[i + 1] : null;
    const bookDir = path.join(BASE_DIR, 'ksiazka', book.slug);
    fs.mkdirSync(bookDir, { recursive: true });
    const outPath = path.join(bookDir, 'index.html');
    fs.writeFileSync(outPath, renderBookPage(book, prevBook, nextBook), 'utf8');
    console.log(`Generated ${path.relative(ROOT, outPath)}`);
  }
}

main();
