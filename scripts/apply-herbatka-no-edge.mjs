import fs from 'node:fs';
import path from 'node:path';

const rootDir = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc';

// 1. Update scripts/cc-page-standard.mjs
const pageStandardPath = path.join(rootDir, 'scripts/cc-page-standard.mjs');
let pageStandard = fs.readFileSync(pageStandardPath, 'utf8');

const target1 = "  if (!html.includes('cc-mobile-edge.css') && html.includes('</head>')) {";
const replace1 = "  // Herbaciarnia Między Słowami: wyjątkowo bez przycisku + w lewym górnym rogu (polecenie L0 08.11.2026)\r\n" +
  "  const isHerbatka = name === 'herbatka/index.html' || name === 'herbatka.html' || name.startsWith('herbatka/');\r\n\r\n" +
  "  if (!isHerbatka && !html.includes('cc-mobile-edge.css') && html.includes('</head>')) {";

const target2 = "  if (!html.includes('cc-mobile-edge.js')) {";
const replace2 = "  if (!isHerbatka && !html.includes('cc-mobile-edge.js')) {";

if (pageStandard.includes(target1) && pageStandard.includes(target2)) {
  pageStandard = pageStandard.replace(target1, replace1).replace(target2, replace2);
  fs.writeFileSync(pageStandardPath, pageStandard, 'utf8');
  console.log('Updated scripts/cc-page-standard.mjs');
} else {
  console.error('Target strings not found in scripts/cc-page-standard.mjs');
  process.exit(1);
}

// 2. Update js/cc-mobile-edge.js
const edgeScriptPath = path.join(rootDir, 'js/cc-mobile-edge.js');
let edgeScript = fs.readFileSync(edgeScriptPath, 'utf8');

const edgeTarget = "if (/^\\/mess(?:\\.html|\\/|$)/i.test(location.pathname)) return;";
const edgeReplace = "if (/^\\/(?:mess|herbatka)(?:\\.html|\\/|$)/i.test(location.pathname)) return;\r\n" +
  "    if (document.body?.dataset.ccEdgeDisabled === 'true' || document.documentElement.dataset.ccEdgeDisabled === 'true') return;";

if (edgeScript.includes("if (/^\\/mess(?:\\.html|\\/|$)/i.test(location.pathname)) return;")) {
  edgeScript = edgeScript.replace("if (/^\\/mess(?:\\.html|\\/|$)/i.test(location.pathname)) return;", edgeReplace);
  fs.writeFileSync(edgeScriptPath, edgeScript, 'utf8');
  console.log('Updated js/cc-mobile-edge.js');
} else {
  console.error('Target string not found in js/cc-mobile-edge.js');
  process.exit(1);
}

// 3. Update herbatka/index.html
const herbatkaHtmlPath = path.join(rootDir, 'herbatka/index.html');
const herbatkaHtml = `<!doctype html>
<html lang="pl">
  <head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config','G-Y4EFTVBPE3',(function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})());
</script><script src="/js/cc-analytics.js?v=20261026_1" defer></script>

    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/herbatka/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Herbaciarnia Między Słowami – Piła</title>
    <style>
      /* Wyjątkowo dla Herbaciarni Między Słowami — brak przycisku + w lewym górnym rogu (polecenie L0 08.11.2026) */
      .cc-mobile-edge-trigger,
      #cc-mobile-edge-dialog,
      [data-edge-key="open"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    </style>
    <script type="module" crossorigin src="/herbatka/assets/index-HMS2026.js?v=20261108_hms6"></script>
    <link rel="stylesheet" crossorigin href="/herbatka/assets/index-DK2XVAf7.css?v=20261108_hms6">
  </head>
  <body data-cc-edge-disabled="true">
    <div id="root"></div>
  </body>
</html>
`;
fs.writeFileSync(herbatkaHtmlPath, herbatkaHtml, 'utf8');
console.log('Updated herbatka/index.html');

// 4. Update herbatka/assets/index-DK2XVAf7.css
const cssPath = path.join(rootDir, 'herbatka/assets/index-DK2XVAf7.css');
let css = fs.readFileSync(cssPath, 'utf8');
const noEdgeCss = `\n/* Wyjątkowo dla Herbaciarni Między Słowami — brak przycisku + w lewym górnym rogu (polecenie L0 08.11.2026) */\n.cc-mobile-edge-trigger,#cc-mobile-edge-dialog,[data-edge-key="open"]{display:none!important;visibility:hidden!important;pointer-events:none!important}\n`;
if (!css.includes('.cc-mobile-edge-trigger')) {
  css += noEdgeCss;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Updated herbatka/assets/index-DK2XVAf7.css');
}
