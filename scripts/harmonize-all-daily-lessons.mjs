// scripts/harmonize-all-daily-lessons.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Kanoniczny wzorzec z Lekcji 1
const d1Path = path.join(ROOT, 'akademia', 'kurscodzienny', 'dzien-01.html');
const d1Content = fs.readFileSync(d1Path, 'utf8');

// Wyodrębnij kanoniczny CSS ze stylami z Lekcji 1
const d1StyleMatch = d1Content.match(/<style>([\s\S]*?)<\/style>/);
if (!d1StyleMatch) {
  console.error('ERROR: Could not extract <style> from dzien-01.html');
  process.exit(1);
}
const canonicalStyle = d1StyleMatch[0];

// Kanoniczny nagłówek ak-header z Lekcji 1
const canonicalHeader = `  <!-- ── TOP HEADER ── -->
  <header class="ak-header">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 sm:gap-4">
        <a href="/akademia/kurscodzienny" class="flex items-center gap-2.5 min-h-[44px]" title="Powrót do Kursu Codziennego">
          <span class="text-amber-400 text-lg">←</span>
          <div class="flex items-center gap-2">
            <span class="font-display text-sm font-bold text-brand-gold tracking-widest">LUMINA</span>
            <span class="text-xs font-semibold text-zinc-400 hidden md:inline ak-header-brand-sub">BIBLE ACADEMY</span>
          </div>
        </a>
        <span class="text-zinc-700 hidden md:inline ak-header-slash">/</span>
        <a href="/akademia/kurscodzienny" class="text-xs font-semibold text-amber-200/90 hover:text-amber-300 whitespace-nowrap hidden md:inline ak-header-course-title">
          Z Biblią za Pan Brat
        </a>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Reader Typography Toggle Hook -->
        <button type="button" id="btn-reader-font" onclick="toggleReaderFont()" class="kc-reader-pill" title="Zmień krój pisma: Lora (Książkowa szeryfowa) / Inter (Ekranowa bezszeryfowa)">
          <i class="fa-solid fa-font text-amber-400 text-xs"></i>
          <span id="reader-font-label" class="sr-only font-semibold">Krój: Lora</span>
        </button>

        <!-- Przełącznik motywu (Jasny / Ciemny) -->
        <button type="button" id="btn-theme-toggle" onclick="toggleCourseTheme()" class="kc-reader-pill cin-btn-theme" title="Przełącz motyw (Jasny / Ciemny)" aria-label="Przełącz motyw">
          <i class="fa-solid fa-sun text-amber-400 text-xs theme-toggle-icon"></i>
        </button>

        <!-- Font Zoom Controls (A- / A+) -->
        <div class="hidden md:flex items-center rounded-full border border-zinc-800 bg-zinc-900/80 p-0.5 text-xs text-zinc-400">
          <button type="button" onclick="adjustFontSize(-1)" class="w-8 h-8 flex items-center justify-center rounded-full hover:text-white hover:bg-zinc-800 transition" title="Mniejszy tekst">A-</button>
          <button type="button" onclick="adjustFontSize(1)" class="w-8 h-8 flex items-center justify-center rounded-full hover:text-white hover:bg-zinc-800 font-bold transition" title="Większy tekst">A+</button>
        </div>

        <!-- Audio TTS Hook -->
        <button type="button" id="btn-audio-tts" onclick="toggleAudioLesson()" class="w-[38px] h-[38px] min-w-[38px] min-h-[38px] p-0 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition flex items-center justify-center" title="Słuchaj lekcji z lektorem">
          <i class="fa-solid fa-volume-high text-xs" id="tts-icon"></i>
          <span id="tts-btn-text" class="sr-only">Słuchaj Audio</span>
        </button>

        <a href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener" class="w-[38px] h-[38px] min-w-[38px] min-h-[38px] p-0 rounded-full border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/10 inline-flex items-center justify-center" title="Wspieraj Misję Christian Culture" aria-label="Wspieraj Misję">
          <span>❤️</span>
          <span class="sr-only">Wspieraj</span>
        </a>
        <div id="cc-auth-nav-container" class="cc-auth-widget-container"></div>
      </div>
    </div>
  </header>`;

// Kanoniczne skrypty Master Reader i TTS
const canonicalReaderAndTtsJs = `
    // ── Lektor Audio TTS ──
    let ttsUtterance = null;
    let isTtsPlaying = false;

    function toggleAudioLesson() {
      if (!('speechSynthesis' in window)) {
        alert('Twoja przeglądarka nie wspiera odtwarzania mowy (Web Speech API).');
        return;
      }

      if (isTtsPlaying) {
        window.speechSynthesis.cancel();
        isTtsPlaying = false;
        updateTtsUi(false);
        return;
      }

      const title = document.querySelector('h1')?.textContent?.trim() || '';
      const thought = document.querySelector('.p-5 p, .p-6 p, .kc-card p')?.textContent?.trim() || '';
      const body = document.getElementById('lesson-text-body')?.innerText || document.querySelector('main')?.innerText || '';
      const fullSpeech = title + '. ' + thought + '. ' + body.slice(0, 4500);

      window.speechSynthesis.cancel();
      ttsUtterance = new SpeechSynthesisUtterance(fullSpeech);
      ttsUtterance.lang = 'pl-PL';
      ttsUtterance.rate = 0.96;

      ttsUtterance.onend = () => {
        isTtsPlaying = false;
        updateTtsUi(false);
      };

      ttsUtterance.onerror = () => {
        isTtsPlaying = false;
        updateTtsUi(false);
      };

      window.speechSynthesis.speak(ttsUtterance);
      isTtsPlaying = true;
      updateTtsUi(true);
    }

    function updateTtsUi(playing) {
      const icon = document.getElementById('tts-icon');
      const text = document.getElementById('tts-btn-text');
      const btn = document.getElementById('btn-audio-tts');
      if (playing) {
        if (icon) icon.className = 'fa-solid fa-pause text-xs text-amber-300';
        if (text) text.textContent = 'Pauza Audio';
        if (btn) btn.classList.add('ring-2', 'ring-amber-400');
      } else {
        if (icon) icon.className = 'fa-solid fa-volume-high text-xs text-amber-300';
        if (text) text.textContent = 'Słuchaj Audio';
        if (btn) btn.classList.remove('ring-2', 'ring-amber-400');
      }
    }

    // ── Master Reader Typography Controller ──
    let currentReaderZoom = 0;

    function initReaderSettings() {
      const savedFont = localStorage.getItem('kc_reader_font') || 'serif';
      const savedZoom = parseInt(localStorage.getItem('kc_reader_zoom') || '0', 10);
      applyReaderFont(savedFont, false);
      applyReaderZoom(savedZoom);
    }

    function toggleReaderFont() {
      const current = document.documentElement.getAttribute('data-kc-font') === 'sans' ? 'sans' : 'serif';
      const next = current === 'serif' ? 'sans' : 'serif';
      localStorage.setItem('kc_reader_font', next);
      applyReaderFont(next, true);
    }

    function applyReaderFont(font, updateZoom = true) {
      if (font === 'sans') {
        document.documentElement.setAttribute('data-kc-font', 'sans');
      } else {
        document.documentElement.removeAttribute('data-kc-font');
      }

      const desktopLabel = document.getElementById('reader-font-label');
      if (desktopLabel) {
        desktopLabel.textContent = font === 'sans' ? 'Krój: Inter' : 'Krój: Lora';
      }

      const mobileLabels = document.querySelectorAll('.kc-font-mobile-label');
      mobileLabels.forEach(el => {
        el.textContent = font === 'sans' ? 'Inter' : 'Lora';
      });

      const btn = document.getElementById('btn-reader-font');
      if (btn) {
        btn.title = font === 'sans' 
          ? 'Aktywna: Inter (Ekranowa bezszeryfowa). Kliknij, aby zmienić na Lora (Książkowa szeryfowa)' 
          : 'Aktywna: Lora (Książkowa szeryfowa). Kliknij, aby zmienić na Inter (Ekranowa bezszeryfowa)';
      }

      if (updateZoom) {
        applyReaderZoom(currentReaderZoom);
      }
    }

    function adjustFontSize(delta) {
      currentReaderZoom = Math.max(-2, Math.min(3, currentReaderZoom + delta));
      localStorage.setItem('kc_reader_zoom', currentReaderZoom);
      applyReaderZoom(currentReaderZoom);
    }

    function applyReaderZoom(zoom) {
      currentReaderZoom = zoom;
      const isSans = document.documentElement.getAttribute('data-kc-font') === 'sans';
      const baseRem = isSans ? (1.00 + (zoom * 0.07)) : (1.05 + (zoom * 0.07));
      document.documentElement.style.setProperty('--kc-font-size', baseRem.toFixed(3) + 'rem');
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initReaderSettings);
    } else {
      initReaderSettings();
    }
`;

function buildBreadcrumb(dayNum, totalDays = 25) {
  const pad = String(dayNum).padStart(2, '0');
  const prevPad = dayNum > 1 ? String(dayNum - 1).padStart(2, '0') : null;
  const nextPad = dayNum < totalDays ? String(dayNum + 1).padStart(2, '0') : null;

  return `  <!-- ── BREADCRUMB STRIP ── -->
  <nav class="bg-[#0A0D14] border-b border-brand-line py-2.5 px-4" aria-label="Nawigacja lekcji">
    <div class="max-w-4xl mx-auto flex items-center justify-between text-xs text-zinc-500 flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <a href="/akademia" class="hover:text-amber-300">Akademia</a>
        <span>›</span>
        <a href="/akademia/kurscodzienny" class="hover:text-amber-300">Z Biblią za Pan Brat</a>
        <span>›</span>
        <span class="text-zinc-400">Miesiąc 1: Księga Rodzaju</span>
        <span>›</span>
        <span class="text-amber-400 font-bold">Dzień ${dayNum}</span>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" onclick="toggleReaderFont()" class="text-zinc-300 hover:text-amber-300 px-2 py-1 min-h-[32px] flex items-center gap-1 sm:hidden text-[11px] rounded bg-zinc-900 border border-zinc-800" title="Przełącz krój pisma">
          <i class="fa-solid fa-font text-amber-400 text-[10px]"></i>
          <span class="kc-font-mobile-label">Lora</span>
        </button>
        <a href="/akademia/kurscodzienny" class="text-zinc-400 hover:text-white px-2 py-1 min-h-[32px] flex items-center">Spis Dni</a>
        ${prevPad ? `<span class="text-zinc-700">|</span>
        <a href="/akademia/kurscodzienny/dzien-${prevPad}" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">← Dzień ${dayNum - 1}</a>` : ''}
        ${nextPad ? `<span class="text-zinc-700">|</span>
        <a href="/akademia/kurscodzienny/dzien-${nextPad}" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 min-h-[32px] flex items-center font-bold">Dzień ${dayNum + 1} →</a>` : ''}
      </div>
    </div>
  </nav>`;
}

function harmonizeFile(filePath, dayNum, totalDays = 25) {
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Upewnij się, że w <head> są biblioteki i style
  if (!html.includes('cc-global-auth.js')) {
    html = html.replace('</head>', '  <script src="/js/cc-global-auth.js?v=20261007_auth_v2" defer></script>\n</head>');
  }
  if (!html.includes('lumina-courses.css')) {
    html = html.replace('</head>', '  <link rel="stylesheet" href="/css/lumina-courses.css?v=20261008_desktop_icons_v2" />\n</head>');
  }
  if (!html.includes('cc-course-theme.js')) {
    html = html.replace('</head>', '  <script src="/js/cc-course-theme.js?v=20261008_desktop_icons_v3" defer></script>\n</head>');
  }

  // 2. Podmień / uzupełnij <style>
  if (html.includes('<style>')) {
    html = html.replace(/<style>[\s\S]*?<\/style>/, canonicalStyle);
  } else {
    html = html.replace('</head>', canonicalStyle + '\n</head>');
  }

  // 3. Podmień <header> na kanoniczny ak-header
  // Wyszukaj pierwszy <header ...> ... </header>
  const headerRegex = /<header[\s\S]*?<\/header>/;
  if (headerRegex.test(html)) {
    html = html.replace(headerRegex, canonicalHeader);
  }

  // 4. Podmień pasek breadcrumb <nav ...> ... </nav> jeśli istnieje przed <main> lub <section>
  const navBreadcrumb = buildBreadcrumb(dayNum, totalDays);
  const breadcrumbRegex = /<nav[\s\S]*?<\/nav>/;
  if (breadcrumbRegex.test(html)) {
    html = html.replace(breadcrumbRegex, navBreadcrumb);
  } else {
    // Wstaw tuż po <header class="ak-header">...</header>
    const headerEnd = html.indexOf('</header>');
    if (headerEnd !== -1) {
      html = html.substring(0, headerEnd + 9) + '\n' + navBreadcrumb + html.substring(headerEnd + 9);
    }
  }

  // 5. Upewnij się, że sekcja skoku #kcJumpShareBtn istnieje
  if (!html.includes('id="kcJumpShareBtn"')) {
    const jumpShareBtn = `      <!-- PRZYCISK SKOKU DO SEKCJI PODZIEL SIĘ TĄ LEKCJĄ -->
      <div class="kc-jump-to-share-wrap mb-3">
        <a href="#ccDailyShare" id="kcJumpShareBtn" class="kc-jump-to-share inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 hover:border-amber-300 hover:text-white transition-all text-xs font-semibold shadow-md min-h-[44px]" title="Przejdź do sekcji: Podziel się tą lekcją" aria-label="Przejdź do sekcji Podziel się tą lekcją">
          <i class="fa-solid fa-share-nodes text-amber-400 text-xs" aria-hidden="true"></i>
          <span>Podziel się tą lekcją</span>
          <i class="fa-solid fa-arrow-down text-amber-400 text-xs" aria-hidden="true"></i>
        </a>
      </div>`;

    // Wstaw przed <h1>
    if (html.includes('<h1')) {
      html = html.replace(/<h1/, jumpShareBtn + '\n      <h1');
    }
  }

  // 6. Upewnij się, że werset pamięciowy ma przycisk kopiowania
  if (!html.includes('navigator.clipboard.writeText') && html.includes('kc-verse-box')) {
    // Spróbuj dodać przycisk kopiowania
    html = html.replace(/<div class="text-xs uppercase font-bold text-brand-gold tracking-widest mb-1">([\s\S]*?)<\/div>/, (match, p1) => {
      return `<div class="text-xs uppercase font-bold text-brand-gold tracking-widest mb-1 flex items-center justify-between">
          <span>${p1.trim()}</span>
          <button type="button" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling?.textContent?.trim() || ''); alert('Skopiowano werset!');" class="text-zinc-400 hover:text-amber-300 text-xs normal-case font-sans">
            <i class="fa-regular fa-copy mr-1"></i>Kopiuj
          </button>
        </div>`;
    });
  }

  // 7. Upewnij się, że w <script> są funkcje Reader Typography i Audio TTS
  if (!html.includes('initReaderSettings')) {
    if (html.includes('</script>')) {
      // Wstaw przed ostatnim </script>
      const lastScriptEnd = html.lastIndexOf('</script>');
      html = html.substring(0, lastScriptEnd) + canonicalReaderAndTtsJs + '\n  ' + html.substring(lastScriptEnd);
    } else {
      html = html.replace('</body>', `<script>${canonicalReaderAndTtsJs}</script>\n</body>`);
    }
  }

  // 8. Upewnij się, że skrypt cc-daily-course-share.js jest dołączony
  if (!html.includes('cc-daily-course-share.js')) {
    html = html.replace('</body>', '  <script src="/js/cc-daily-course-share.js?v=20261114_share2" defer></script>\n</body>');
  }

  // 9. Upewnij się, że #backToTopBtn istnieje
  if (!html.includes('id="backToTopBtn"')) {
    const btt = `  <!-- Floating Back to Top Button -->
  <button class="back-to-top" id="backToTopBtn" type="button" aria-label="Przewiń do góry" title="Przewiń do góry">
    <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
  </button>`;
    html = html.replace('</body>', btt + '\n</body>');
  }

  fs.writeFileSync(filePath, html, 'utf8');
}

// Wykonaj dla wszystkich lekcji Dni 1–25 we wszystkich ścieżkach
const totalDays = 25;
for (let d = 1; d <= totalDays; d++) {
  const pad = String(d).padStart(2, '0');
  const paths = [
    path.join(ROOT, 'akademia', 'kurscodzienny', `dzien-${pad}.html`),
    path.join(ROOT, 'akademia', 'kurscodzienny', `dzien-${pad}`, 'index.html'),
    path.join(ROOT, 'kursy', 'kurscodzienny', `dzien-${pad}.html`),
    path.join(ROOT, 'kursy', 'kurscodzienny', `dzien-${pad}`, 'index.html')
  ];

  paths.forEach(fp => {
    if (fs.existsSync(fp)) {
      harmonizeFile(fp, d, totalDays);
    }
  });

  console.log(`✅ Ujednolicono Dzień ${d} (standard dzien-01.html)`);
}

console.log('🎉 Wszystkie lekcje Dni 1–25 zostały pomyślnie zharmonizowane do standardu Dnia 1!');
