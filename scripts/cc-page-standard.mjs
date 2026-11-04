// Public web documents only: never alter broadcast, operational or embed screens.
import { applyChannelNumbering } from './cc-channel-numbering.mjs';
export const BACK_TO_TOP_SCRIPT = '/js/cc-back-to-top.js?v=20261029_playing2';
export const OMNI_SEARCH_SCRIPT = '/components/cc-omni-search.js?v=20261030_feat11';
export const FAVORITES_SCRIPT = '/js/cc-favorites.js?v=20261015_topbar1';
export const NEWSLETTER_SCRIPT = '/js/cc-newsletter.js?v=20261030_nl1';
export const MOBILE_EDGE_CSS = '/css/cc-mobile-edge.css?v=20261030_edge10';
export const MOBILE_EDGE_SCRIPT = '/js/cc-mobile-edge.js?v=20261030_edge10';
// #TOPTEN na muzycznych stronach EkoCC (spec. naturalnej rywalizacji §25): jeden komponent, zmiana w jednym miejscu.
// Transmisje na żywo, OBS, embedy i LUMI KIDS są wykluczone wyżej w applyPageStandard.
// /player celowo pominięty: aplikacja na pełny ekran — karta zasłoniłaby odtwarzacz (komponent i tak to wykrywa).
export const TOPTEN_CARD_SCRIPT = '/components/cc-topten-card.js?v=20261101_a007b';
export const TOPTEN_CARD_PAGES = new Set([
  'music.html', 'music/index.html', 'music/przeboje/index.html', 'music/premiery/index.html',
  'biblijne-uwielbienie.html', 'skins.html',
]);

export function applyPageStandard(file, html) {
  const name = file.replaceAll('\\', '/').toLowerCase();
  // THE JOURNAL selects its own approved shared UI modules; do not inject chat or unrelated tracking.
  if (name === 'the-journal/index.html') return html;
  if (!name.endsWith('.html') || /(?:live|stream|obs|embed|admin|mission.control|pilot|cctv24|bcm24|lumi-kids\/app)/.test(name)) return html;
  if (!/<body\b/i.test(html) || !/<\/body\s*>/i.test(html)) return html;
  if (/http-equiv\s*=\s*["']refresh["']/i.test(html)) return html;
  html = applyChannelNumbering(file, html);
  // Refresh the shared chat loader even when back-to-top is already installed.
  html = html.replace(/(src=["'])(\/(?:components|js)\/cc-support-footer\.js)(?:\?[^"']*)?(["'])/g, '$1$2?v=20261014_mockup4$3');
  html = html.replace(/(src=["'])(\/?lumina-bottom-nav\.js)(?:\?[^"']*)?(["'])/g, '$1$2?v=20261014_mockup4$3');
  html = html.replace(/(src=["'])(\/?app\.js)(?:\?[^"']*)?(["'])/g, '$1$2?v=20261014_mockup4$3');
  html = html.replace(/(src=["'])(\/components\/cc-global-chat-button\.js)(?:\?[^"']*)?(["'])/g, '$1$2?v=20261014_shared4$3');
  html = html.replace(/(src=["'])(\/js\/cc-back-to-top\.js)(?:\?[^"']*)?(["'])/g, '$1$2?v=20261029_playing2$3');
  html = html.replace(/(src=["'])(\/components\/cc-omni-search\.js)(?:\?[^"']*)?(["'])/g, '$1$2?v=20261030_feat11$3');
  html = html.replace(/(src=["'])(\/js\/cc-favorites\.js)(?:\?[^"']*)?(["'])/g, '$1$2?v=20261015_topbar1$3');
  html = html.replace(/(src=["'])(\/js\/cc-newsletter\.js)(?:\?[^"']*)?(["'])/g, '$1$2?v=20261030_nl1$3');
  html = html.replace(/(src=["'])(\/js\/cc-mobile-edge\.js)(?:\?[^"']*)?(["'])/g, '$1$2?v=20261030_edge10$3');
  html = html.replace(/(href=["'])(\/css\/cc-mobile-edge\.css)(?:\?[^"']*)?(["'])/g, '$1$2?v=20261030_edge10$3');

  if (!html.includes('cc-mobile-edge.css') && html.includes('</head>')) {
    html = html.replace(/<\/head\s*>/i, `<link rel="stylesheet" href="${MOBILE_EDGE_CSS}">\n</head>`);
  }

  let additions = '';
  if (!html.includes('cc-omni-search.js')) {
    additions += `<script defer src="${OMNI_SEARCH_SCRIPT}"></script>\n`;
  }
  if (!html.includes('/js/cc-back-to-top.js')) {
    additions += `<script defer src="${BACK_TO_TOP_SCRIPT}"></script>\n`;
  }
  if (!html.includes('cc-favorites.js')) {
    additions += `<script defer src="${FAVORITES_SCRIPT}"></script>\n`;
  }
  if (!html.includes('cc-newsletter.js')) {
    additions += `<script defer src="${NEWSLETTER_SCRIPT}"></script>\n`;
  }
  if (!html.includes('cc-mobile-edge.js')) {
    additions += `<script defer src="${MOBILE_EDGE_SCRIPT}"></script>\n`;
  }
  if (TOPTEN_CARD_PAGES.has(name) && !html.includes('cc-topten-card.js')) {
    additions += `<script defer src="${TOPTEN_CARD_SCRIPT}"></script>\n`;
  }

  if (additions) {
    return html.replace(/<\/body\s*>/i, `${additions}</body>`);
  }
  return html;
}
