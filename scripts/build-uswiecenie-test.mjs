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
html = html.replace(
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <base href="/">'
);
html = html.replace(/src="\.\/Aplikacja Christian Culture\.png"/g, 'src="/Aplikacja Christian Culture.png"');

// 4. Dołączenie arkusza stylów cc-sanctification-path.css przed </head>
const cssTag = '    <link rel="stylesheet" href="/css/cc-sanctification-path.css?v=20261119_gold6">\n</head>';
if (!html.includes('cc-sanctification-path.css')) {
  html = html.replace('</head>', cssTag);
}

// 5. Wstawienie Czystego Luksusowego Przejścia + Interaktywnego Wersetu Dnia + Mapy Uświęcenia + „Więcej” dla 9 zakładek
const sectionCMarker = '    <!-- SECTION C: CODZIENNE ROZWAŻANIE (DOBRZE, ŻE JESTEŚ) -->';
if (!html.includes(sectionCMarker)) {
  throw new Error('Nie znaleziono znacznika SECTION C w index.html');
}

const sanctificationBlock = `    <!-- ═══════════════════════════════════════════════════════════════
         NOWA SEKCJA GŁÓWNA: WERSET DNIA -> MAPA UŚWIĘCENIA -> WIĘCEJ
         ═══════════════════════════════════════════════════════════════ -->
    <section class="cc-sanctification-section" id="sciezka-uswiecenia" aria-label="Interaktywny Werset Dnia i Mapa Uświęcenia">
        <div class="cc-mandala-bridge" aria-hidden="true" style="display:none !important;">
            <div class="cc-mandala-thread"><span class="cc-thread-spark"></span></div>
            <div class="cc-mandala-ring-hub"><span class="cc-mandala-ring-core"></span></div>
        </div>
        <div class="cc-sanctification-container">
            <article class="cc-verse-node" id="ccDailyVerseNode" aria-live="polite"></article>
            <div class="cc-mid-connector" aria-hidden="true">
                <div class="cc-mid-line"></div>
                <div class="cc-mandala-ring-hub"><span class="cc-mandala-ring-core"></span></div>
                <div class="cc-mid-line"></div>
            </div>
            <div class="cc-map-card" id="ccSanctificationMap"></div>
        </div>
    </section>

    <div class="cc-more-bar-wrap">
        <button type="button" class="cc-more-toggle-btn" id="ccMoreArchiveToggle" aria-expanded="false" aria-controls="ccMoreSectionsWrapper">
            <i class="fa-solid fa-layer-group"></i> Więcej zasobów i informacji CC (9)
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

// 6. Podpięcie logiki przed </body>
const jsTag = '    <script src="/js/cc-sanctification-path.js?v=20261119_gold6" defer></script>\n</body>';
if (!html.includes('cc-sanctification-path.js')) {
  html = html.replace('</body>', jsTag);
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, html, 'utf8');
console.log('Wygenerowano wersję testową:', outPath, `(${Buffer.byteLength(html, 'utf8')} bajtów)`);
