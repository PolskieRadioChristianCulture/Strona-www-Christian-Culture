import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const srcPath = path.join(ROOT, 'index.html');
const outDir = path.join(ROOT, 'test', 'uswiecenie');
const outPath = path.join(outDir, 'index.html');

let html = fs.readFileSync(srcPath, 'utf8');

// 1. Wymóg CC Full Premium 7.1: wersja testowa z noindex, nofollow
html = html.replace(
  /<meta\s+name="robots"\s+content="[^"]*"\s*>/i,
  '<meta name="robots" content="noindex, nofollow">'
);
html = html.replace(
  /<link\s+rel="canonical"\s+href="[^"]*"\s*>/i,
  '<link rel="canonical" href="https://polskieradio.cc/test/uswiecenie/">'
);
html = html.replace(
  /<title>[^<]*<\/title>/i,
  '<title>Christian Culture — Interaktywna Ścieżka Uświęcenia (Wersja Testowa)</title>'
);

// 2. Poprawka prefers-reduced-motion: zwalniamy animacje zamiast je całkowicie zabijać
html = html.replace(
  /\/\* WCAG 2\.2 AA: prefers-reduced-motion \(CC v2 Premium\) \*\/[\s\S]*?@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\}\s*\}/,
  `/* CC v2 Premium: przy reduced-motion zwalniamy ruch zamiast go zatrzymywać */
        @media (prefers-reduced-motion: reduce) {
            html { scroll-behavior: auto !important; }
            .hero-section .mandala-svg { animation-duration: 140s !important; animation-iteration-count: infinite !important; }
        }`
);

// 3. <base href="/"> zapewnia bezbłędne ładowanie względnych skryptów/JSON-ów/logo z katalogu głównego
if (!html.includes('<base href="/">')) {
  html = html.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <base href="/">'
  );
}
html = html.replace(/src="\.\/Aplikacja Christian Culture\.png"/g, 'src="/Aplikacja Christian Culture.png"');

// 4. Dołączenie arkusza stylów cc-sanctification-path.css przed </head>
const cssTag = '    <link rel="stylesheet" href="/css/cc-sanctification-path.css?v=20261119_gold13">\n</head>';
if (!html.includes('cc-sanctification-path.css')) {
  html = html.replace('</head>', cssTag);
}

// 5. Wstawienie Czystego Luksusowego Przejścia + Interaktywnego Wersetu Dnia + Pulsującego Rozważania + „Wejdź na ścieżkę uświęcenia” + „Więcej” dla 9 zakładek
if (!html.includes('id="sciezka-uswiecenia"')) {
  const sectionCMarker = '    <!-- SECTION C: CODZIENNE ROZWAŻANIE (DOBRZE, ŻE JESTEŚ) -->';
  if (!html.includes(sectionCMarker)) {
    throw new Error('Nie znaleziono znacznika SECTION C w index.html');
  }

  const sanctificationBlock = `    <!-- ═══════════════════════════════════════════════════════════════
         NOWA SEKCJA GŁÓWNA: WERSET DNIA -> ROZWAŻANIE -> MAPA UŚWIĘCENIA -> WIĘCEJ
         ═══════════════════════════════════════════════════════════════ -->
    <section class="cc-sanctification-section" id="sciezka-uswiecenia" aria-label="Interaktywny Werset Dnia i Mapa Uświęcenia">
        <div class="cc-mandala-bridge" aria-hidden="true" style="display:none !important;">
            <div class="cc-mandala-thread"><span class="cc-thread-spark"></span></div>
            <div class="cc-mandala-ring-hub"><span class="cc-mandala-ring-core"></span></div>
        </div>
        <div class="cc-sanctification-container">
            <article class="cc-verse-node" id="ccDailyVerseNode" aria-live="polite"></article>

            <div class="cc-path-connector cc-path-connector--top" id="ccConnectorVerseToRef" aria-hidden="true">
                <div class="cc-path-line cc-path-line--short"><span class="cc-path-spark"></span></div>
            </div>

            <div class="cc-path-node-trigger-wrap cc-verse-ref-path-wrap" id="ccVerseRefNodeWrap">
                <a class="cc-verse-ref-link cc-verse-ref-path-pill" id="ccVerseRefLink" href="/mojabiblia"><i class="fa-solid fa-book-bible" aria-hidden="true"></i> <span>Czytaj w MojaBiblia (UBG)</span></a>
            </div>

            <div class="cc-path-connector" id="ccConnectorVerseToReflection" aria-hidden="true">
                <div class="cc-path-line cc-path-line--short"><span class="cc-path-spark cc-path-spark--delayed"></span></div>
            </div>

            <div class="cc-path-node-trigger-wrap" id="ccReflectionTriggerWrap">
                <button type="button" class="cc-pulse-icon-trigger" id="ccReflectionToggleBtn" aria-expanded="false" aria-controls="ccVerseReflectionCard" aria-label="Odkryj rozważanie, nagranie audio, pełną lekcję i modlitwę na dziś">
                    <span class="cc-pulse-orb" aria-hidden="true">
                        <span class="cc-pulse-ring cc-pulse-ring--1"></span>
                        <span class="cc-pulse-ring cc-pulse-ring--2"></span>
                        <svg class="cc-pulse-orb-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/>
                            <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>
                        </svg>
                    </span>
                    <span class="cc-pulse-icon-caption">
                        <span class="cc-pulse-icon-label" id="ccReflectionToggleLabel">Odkryj rozważanie i modlitwę</span>
                        <svg class="cc-pulse-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                </button>
            </div>

            <div class="cc-path-connector cc-path-connector--reveal" id="ccConnectorIntoReflection" aria-hidden="true" hidden>
                <div class="cc-path-line cc-path-line--short"><span class="cc-path-spark"></span></div>
                <div class="cc-mandala-ring-hub"><span class="cc-mandala-ring-core"></span></div>
                <div class="cc-path-line cc-path-line--short"></div>
            </div>

            <div class="cc-reflection-card cc-step-reveal-panel" id="ccVerseReflectionCard" hidden></div>

            <div class="cc-path-connector" id="ccConnectorToSanctificationBtn" aria-hidden="true">
                <div class="cc-path-line"><span class="cc-path-spark cc-path-spark--delayed"></span></div>
            </div>

            <div class="cc-path-node-trigger-wrap cc-path-cta-wrap" id="ccSanctificationTriggerWrap">
                <button type="button" class="cc-sanctification-cta-btn" id="ccSanctificationToggleBtn" aria-expanded="false" aria-controls="ccSanctificationMap">
                    <span class="cc-cta-pulse-halo" aria-hidden="true"></span>
                    <span class="cc-cta-sheen-wrap" aria-hidden="true"><span class="cc-cta-sheen"></span></span>
                    <svg class="cc-cta-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/>
                        <path d="M19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16z"/>
                    </svg>
                    <span class="cc-cta-text" id="ccSanctificationToggleLabel">Wejdź na ścieżkę uświęcenia</span>
                    <svg class="cc-pulse-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
            </div>

            <div class="cc-path-connector cc-path-connector--reveal" id="ccConnectorIntoMap" aria-hidden="true" hidden>
                <div class="cc-path-line cc-path-line--short"><span class="cc-path-spark"></span></div>
                <div class="cc-mandala-ring-hub"><span class="cc-mandala-ring-core"></span></div>
                <div class="cc-path-line cc-path-line--short"></div>
            </div>

            <div class="cc-map-card cc-step-reveal-panel" id="ccSanctificationMap" hidden></div>
        </div>
        <div class="cc-path-connector cc-path-connector--to-more" id="ccConnectorToMore" aria-hidden="true">
            <div class="cc-path-line cc-path-line--muted"><span class="cc-path-spark cc-path-spark--slow"></span></div>
        </div>
    </section>

    <div class="cc-more-bar-wrap">
        <button type="button" class="cc-more-toggle-btn" id="ccMoreArchiveToggle" aria-expanded="false" aria-controls="ccMoreSectionsWrapper">
            <i class="fa-solid fa-layer-group"></i> Odkryj więcej
        </button>
        <p class="cc-more-subnote">Codzienne rozważania, aplikacje mobilne, książki, sieć YouTube &amp; Spotify, nadawanie 24/7, wsparcie misji, opinie, Q&amp;A oraz kontakt.</p>
    </div>

    <div id="ccMoreSectionsWrapper" hidden>
`;

  html = html.replace(sectionCMarker, sanctificationBlock + sectionCMarker);

  const footerMarker = '    <!-- ==========================================\r\n         SITE FOOTER';
  const footerMarkerLf = '    <!-- ==========================================\n         SITE FOOTER';
  if (html.includes(footerMarker)) {
    html = html.replace(footerMarker, '    </div><!-- /#ccMoreSectionsWrapper -->\r\n\r\n' + footerMarker);
  } else if (html.includes(footerMarkerLf)) {
    html = html.replace(footerMarkerLf, '    </div><!-- /#ccMoreSectionsWrapper -->\n\n' + footerMarkerLf);
  } else {
    throw new Error('Nie znaleziono znacznika SITE FOOTER w index.html');
  }
}

// 6. Podpięcie logiki przed </body>
const jsTag = '    <script src="/js/cc-sanctification-path.js?v=20261119_gold13" defer></script>\n</body>';
if (!html.includes('cc-sanctification-path.js')) {
  html = html.replace('</body>', jsTag);
}


// 7. Kaskadowa prezentacja Hero: ZOBACZ WIĘCEJ, transmisja, maszyna do pisania i przyciski RADIO / TELEWIZJA / WERSET
if (!html.includes('id="heroSeeMoreBanner"')) {
  const dividerMarker = '<div class="gold-divider"></div>';
  const liveMarker = '<!-- YOUTUBE LIVE STREAM EMBED -->';
  const dividerIdx = html.indexOf(dividerMarker);
  const liveIdx = html.indexOf(liveMarker);
  if (dividerIdx === -1 || liveIdx === -1 || liveIdx < dividerIdx) {
    throw new Error('Nie znaleziono znaczników gold-divider / YOUTUBE LIVE STREAM EMBED w Hero');
  }
  const seeMoreHtml = '<div class="cc-hero-see-more-wrap" id="heroSeeMoreBanner">\n' +
    '                    <button type="button" class="cc-hero-see-more-btn" id="heroSeeMoreBtn" aria-label="Zobacz więcej — przejdź do aktualnej transmisji">\n' +
    '                        <span class="cc-hero-see-more-text">ZOBACZ WIĘCEJ</span>\n' +
    '                        <svg class="cc-hero-see-more-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>\n' +
    '                    </button>\n' +
    '                </div>\n                ';
  html = html.slice(0, liveIdx) + seeMoreHtml + html.slice(liveIdx);

  const descRe = /<p class="hero-description">[\s\S]*?<div class="hero-buttons">[\s\S]*?<\/div>/;
  if (!descRe.test(html)) {
    throw new Error('Nie znaleziono bloku hero-description / hero-buttons');
  }
  html = html.replace(descRe, '<p class="hero-description" id="heroThirdDescription">\n' +
    '                    Witaj w przestrzeni nowej kultury chrześcijańskiej. Doświadczaj wiary na co dzień dzięki sześciu stacjom radiowym z muzyką i Słowem Bożym bezpośrednio w przeglądarce oraz pobierz nasze dedykowane aplikacje mobilne wspierające Twój rozwój duchowy.\n' +
    '                </p>\n' +
    '                <div class="hero-buttons" id="heroActionButtons">\n' +
    '                    <a href="https://polskieradio.cc/player" class="btn btn-gold" id="heroRadioBtn" title="Włącz radio w dolnym odtwarzaczu"><i class="fa-solid fa-radio"></i> Radio</a>\n' +
    '                    <a href="https://polskieradio.cc/nadawaj" class="btn btn-outline" id="heroTvBtn" title="Telewizja i Panel Nadawania CC"><i class="fa-solid fa-tv"></i> Telewizja</a>\n' +
    '                    <a href="#sciezka-uswiecenia" class="btn btn-verse" id="heroVerseBtn" title="Przejdź do dzisiejszego Wersetu Dnia"><i class="fa-solid fa-book-bible"></i> Werset</a>\n' +
    '                </div>');
}


// 8. Trzy okna prezentacji w jednym miejscu: (1) marka + ZOBACZ WIĘCEJ, (2) transmisja, (3) powitanie + przyciski
if (!html.includes('id="heroStage"')) {
  const insertBefore = function (marker, snippet) {
    const i = html.indexOf(marker);
    if (i === -1) throw new Error('Brak znacznika okna prezentacji: ' + marker);
    html = html.slice(0, i) + snippet + html.slice(i);
  };
  const textColOpen = '<div class="hero-text-col">';
  const tci = html.indexOf(textColOpen);
  if (tci === -1) throw new Error('Brak .hero-text-col');
  html = html.slice(0, tci + textColOpen.length) +
    '\n                <div class="cc-hero-stage" id="heroStage" aria-live="polite">\n' +
    '                <div class="cc-hero-slide is-active" id="heroSlide1" data-slide="1">' +
    html.slice(tci + textColOpen.length);
  insertBefore('<!-- YOUTUBE LIVE STREAM EMBED -->',
    '</div>\n                <div class="cc-hero-slide" id="heroSlide2" data-slide="2" aria-hidden="true">\n                ');
  insertBefore('<p class="hero-description" id="heroThirdDescription">',
    '</div>\n                <div class="cc-hero-slide" id="heroSlide3" data-slide="3" aria-hidden="true">\n                ');
  const btnOpen = '<div class="hero-buttons" id="heroActionButtons">';
  const bi = html.indexOf(btnOpen);
  if (bi === -1) throw new Error('Brak #heroActionButtons');
  const bEnd = html.indexOf('</div>', bi) + '</div>'.length;
  html = html.slice(0, bEnd) +
    '\n                </div>\n                </div>\n' +
    '                <div class="cc-hero-dots" id="heroDots" aria-label="Okna prezentacji">\n' +
    '                    <button type="button" class="cc-hero-dot is-active" data-go="1" aria-label="Okno 1: Christian Culture" aria-current="true"></button>\n' +
    '                    <button type="button" class="cc-hero-dot" data-go="2" aria-label="Okno 2: aktualna transmisja"></button>\n' +
    '                    <button type="button" class="cc-hero-dot" data-go="3" aria-label="Okno 3: Radio, Telewizja, Werset"></button>\n' +
    '                </div>' +
    html.slice(bEnd);
  // Okno transmisji bez dodatkowych marginesów (stoi w miejscu okna 1)
  html = html.replace('<div class="live-stream-box" id="liveStreamBox" style="margin: 15px 0 25px 0; width: 100%; max-width: 560px; display: block; opacity: 1;">',
    '<div class="live-stream-box" id="liveStreamBox" style="margin: 0; width: 100%; max-width: 560px; display: block;">');
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, html, 'utf8');
console.log('Wygenerowano wersję testową:', outPath, `(${Buffer.byteLength(html, 'utf8')} bajtów)`);
