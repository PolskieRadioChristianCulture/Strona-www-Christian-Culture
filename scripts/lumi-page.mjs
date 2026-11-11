import { renderLumiDashboard } from './lumi-dashboard.mjs';
// Build a dedicated entry from the canonical renderer; never fork the chat engine.
export function renderLumiPage(html) {
  if (!html.includes('id="directMessagesModal"') || !html.includes('manifest-lumina.json')) {
    throw new Error('LUMI: canonical chat/manifest contract is missing');
  }
  const title = 'LUMI Messenger â€” chrzeĹ›cijaĹ„ski komunikator | Christian Culture';
  const description = 'Rozmawiaj, poznawaj spoĹ‚ecznoĹ›Ä‡ i dziel siÄ™ wiarÄ…. LUMI Messenger Ĺ‚Ä…czy rozmowy LUMINA i Christian Culture w jednym miejscu.';
  html = html.replace(/<html(?:\s+[^>]*)?>/i, '<html lang="pl" data-lumina-theme="dark" class="lumi-mess-page" data-no-onboarding="true">')
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
    .replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*(">)/g, `$1${description}$2`)
    .replace(/(<meta (?:name|property)="(?:og:title|twitter:title)" content=")[^"]*(">)/g, `$1${title}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(">)/, '$1https://polskieradio.cc/mess$2')
    .replace(/(<meta property="og:url" content=")[^"]*(">)/, '$1https://polskieradio.cc/mess$2')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    .replace(/<link rel="manifest" href="manifest-lumina.json">/, '<link rel="manifest" href="/manifest-lumi.json">')
    .replace(/<script src="lumina-pwa-installer\.js[^\"]*"><\/script>/, '')
    .replace(/<link rel="stylesheet" href="\/css\/lumina-light-edition\.css[^"]*">/g, '')
    .replace(/<script src="\/js\/lumina-theme-manager\.js[^"]*"><\/script>/g, '')
    .replace(/<button [^>]*id="luminaThemeSwitchBtn"[^>]*>[\s\S]*?<\/button>/g, '')
    .replace(/(<meta name="apple-mobile-web-app-title" content=")[^"]*(">)/, '$1LumiMess$2')
    .replace('</head>', `<script>
try {
  document.documentElement.setAttribute('data-lumina-theme', 'dark');
  document.documentElement.classList.add('lumi-mess-page');
  if (new URLSearchParams(location.search).get('embed') === '1') document.documentElement.classList.add('cc-mess-embedded');
  if (new URLSearchParams(location.search).get('embed') !== '1') localStorage.setItem('lumina_theme', 'dark');
} catch(e) {}
</script>
<style>html.cc-mess-embedded #lumiLanding,html.cc-mess-embedded #lumiIntroOverlay{display:none!important}</style>
<link rel="stylesheet" href="/css/lumi-standalone.css?v=20261019_dialog1">
<link rel="stylesheet" href="/css/lumi-messenger-design.css?v=20261025_a007">
<link rel="stylesheet" href="/css/cc-assistant.css?v=20261111_ui2">
<script defer src="/js/cc-assistant.js?v=20261111_ui2"></script>
<script defer src="/js/lumi-standalone.js?v=20261015_clean_v1"></script>
<script defer src="/js/lumi-dashboard.js?v=20261023_bcm24_live1"></script>
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'WebApplication',name:'LUMI Messenger',url:'https://polskieradio.cc/mess',applicationCategory:'CommunicationApplication',description,inLanguage:'pl'})}</script>
</head>`)
    .replace('<body class="user-is-guest">', `<body class="user-is-guest lumi-standalone">
<div id="lumiIntroOverlay" class="lumi-intro-overlay" role="region" aria-label="Intro LUMI Messenger">
  <div class="lumi-intro-video-wrap">
    <video id="lumiIntroVideo" class="lumi-intro-video" playsinline muted preload="none" poster="/images/chat/lumi-intro-poster.webp">
      <source id="lumiIntroSourceMobile" media="(orientation: portrait) and (max-width: 900px)" src="/images/chat/lumi-intro-mobile.mp4" type="video/mp4">
      <source id="lumiIntroSourceDesktop" src="/images/chat/lumi-intro.mp4" type="video/mp4">
    </video>
    <div class="lumi-intro-controls">
      <button type="button" id="lumiIntroSound" class="lumi-intro-btn lumi-intro-sound" aria-label="WĹ‚Ä…cz dĹşwiÄ™k">
        <span id="lumiIntroSoundIcon" aria-hidden="true">đź”‡</span> <span id="lumiIntroSoundText">WĹ‚Ä…cz dĹşwiÄ™k</span>
      </button>
      <button type="button" id="lumiIntroSkip" class="lumi-intro-btn lumi-intro-skip" aria-label="PomiĹ„ intro i przejdĹş do komunikatora">
        PomiĹ„ intro <span aria-hidden="true">âś•</span>
      </button>
    </div>
    <div class="lumi-intro-progress" aria-hidden="true">
      <div id="lumiIntroProgressBar" class="lumi-intro-progress-bar"></div>
    </div>
  </div>
</div>
${renderLumiDashboard()}`);
  if (!html.includes('id="lumiLanding"')) throw new Error('LUMI: body contract changed');
  return html;
}
