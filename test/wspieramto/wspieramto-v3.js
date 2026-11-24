(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');
  function markReady() {
    document.documentElement.classList.add('is-ready');
    document.body.classList.add('is-ready');
  }
  var readyTimer = setTimeout(markReady, 2000);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      markReady();
      clearTimeout(readyTimer);
    });
  });

  // ── 1. SŁOWNIK PL / EN Z JEDNEGO ŹRÓDŁA ──
  var DICT = {
    pl: {
      skip: 'Przejdź do treści',
      tickBadge: 'WspieramTO LIVE',
      brandSub: 'WspieramTO · Mecenat 24/7',
      navSim: 'Wpływ daru',
      navFlow: 'Jak to działa',
      navStudio: 'Nowe Studio 4K',
      navPay: 'Metody wpłat',
      navMilion: 'Od 2 zł',
      navCta: 'Wesprzyj teraz',
      heroBadge: 'Podgląd Multi-Active FULL PREMIUM · WspieramTO 3.0',
      h1a: 'Razem niesiemy',
      h1b: 'żywą nadzieję',
      heroLead: '37 kanałów Radia i TV 24/7, Biblia Audio V7, MojaBiblia i Akademia działają w 100% bezpłatnie i bez ani jednej reklamy. Każdy Twój gest utrzymuje wolny sygnał Ewangelii i buduje Nowe Studio RTV 4K Christian Culture.',
      ctaHeroMain: 'Wesprzyj teraz (BLIK / Karta)',
      ctaHeroSim: 'Sprawdź moc Twojego daru ↓',
      trust1: '0% reklam i paywalli',
      trust2: 'BLIK · Karta · Patronite · Revolut',
      trust3: 'zrzutka.pl/z/ChristianCulture',
      vcBadge: 'Zaproszenie · 0:21',
      vcPlayText: 'Obejrzyj z dźwiękiem (0:21)',
      vcPlaySub: 'Cezary & Wioletta + pieśń „Dobrze, że jesteś”',
      vcBtnPlay: '▶ Odtwórz',
      vcBtnPause: '⏸ Pauza',
      vcShare: 'Udostępnij ↗',
      statCh: 'całodobowych kanałów Radia i TV CC (0 reklam)',
      statBib: 'rozdziałów Księgi Rodzaju w Biblii Audio V7',
      statWiz: 'aktywnych wizytówek w katalogu /wizytowki',
      statFree: 'treści dostępnych za darmo dla każdego na świecie',
      simEyebrow: 'Interaktywny kalkulator misji · Wybierz i zobacz efekt',
      simTitle: 'Zobacz, co dokładnie uruchamia Twój dar',
      simLead: 'Przesuń suwak albo kliknij próg — poniżej na żywo przeliczysz, ile darmowego czasu nadawania, produkcji Biblii Audio i cegiełek Nowego Studia RTV tworzy Twoja decyzja.',
      imp1Label: 'Darmowe Radio 24/7 (37 kanałów)',
      imp2Label: 'Produkcja Biblii Audio V7',
      imp3Label: 'Fundusz Nowego Studia RTV 4K',
      simPatronite: 'Stały Patron co miesiąc (Patronite) ↗',
      simDirectBtn: 'Dane do przelewu / BLIK na tel.',
      flowEyebrow: '100% przejrzystości · Żywy obieg dobra',
      flowTitle: 'Jak Twój dar zamienia się w bezpłatne Słowo 24/7',
      flowLead: 'Nie mamy sponsorów komercyjnych ani reklam. Zobacz, jak każda wpłata zasila bezpośrednio nasze czterofilarowe centrum nadawcze Christian Culture.',
      hubSub: '100% na misję',
      stEyebrow: 'Jawny plan inwestycji · Dom & Studio Misji',
      stTitle: 'Budujemy Nowe Studio RTV 4K Christian Culture',
      stLead: 'Własne, wyciszone studio to niezależność od kosztów wynajmu, studyjna akustyka do nagrań Pisma Świętego i niezawodne centrum emisji 24/7. Kliknij dowolny etap, aby zobaczyć szczegóły.',
      g1Title: 'Filar I · Utrzymanie 24/7 & Fundusz Studia',
      g1Note: 'Serwery, emisja 37 kanałów, produkcja Biblii Audio V7 (15 000 zł) + stały odpis na studio (10 000 zł).',
      g2Title: 'Filar II · Wyposażenie Nowego Studia RTV 4K',
      g2Note: 'Etap I (Akustyka i rozruch): 25 000 zł · Docelowy Dom ze Studiem Misji: 1 230 000 zł.',
      stCta: 'Dokładam cegiełkę na Studio RTV →',
      payEyebrow: 'Polska & Polonia (GBP · EUR · USD)',
      payTitle: 'Wybierz najwygodniejszą formę wsparcia',
      payLead: 'Wpłacisz w kilkanaście sekund z Polski i z każdego miejsca na świecie — jednym kliknięciem lub kopiując dane przelewu bez pośredników.',
    },
    en: {
      skip: 'Skip to content',
      tickBadge: 'WspieramTO LIVE',
      brandSub: 'WspieramTO · 24/7 Patronage',
      navSim: 'Your Impact',
      navFlow: 'How It Works',
      navStudio: 'New 4K Studio',
      navPay: 'Donate',
      navMilion: 'From 2 PLN',
      navCta: 'Support Now',
      heroBadge: 'Multi-Active FULL PREMIUM Preview · WspieramTO 3.0',
      h1a: 'Together we bring',
      h1b: 'living hope',
      heroLead: '37 ad-free 24/7 Radio & TV channels, Audio Bible V7, MojaBiblia and Biblical Academy remain 100% free worldwide. Every gift sustains the Gospel signal and builds our New 4K Broadcast Studio.',
      ctaHeroMain: 'Support Now (1-Click)',
      ctaHeroSim: 'See Your Gift Impact ↓',
      trust1: '0% ads & paywalls',
      trust2: 'Zrzutka · Patronite · Revolut · IBAN',
      trust3: 'zrzutka.pl/z/ChristianCulture',
      vcBadge: 'Video Invite · 0:21',
      vcPlayText: 'Watch with sound (0:21)',
      vcPlaySub: 'Cezary & Wioletta + “Dobrze, że jesteś” song',
      vcBtnPlay: '▶ Play',
      vcBtnPause: '⏸ Pause',
      vcShare: 'Share ↗',
      statCh: '24/7 Radio & TV channels (zero ads)',
      statBib: 'Genesis chapters published in Audio Bible V7',
      statWiz: 'live showcase cards in /wizytowki',
      statFree: 'free Gospel media accessible worldwide',
      simEyebrow: 'Interactive Mission Simulator · Slide & see your impact',
      simTitle: 'See what your gift powers immediately',
      simLead: 'Slide or choose a tier to preview live how many hours of free 24/7 broadcast, Audio Bible production and New 4K Studio bricks your support enables.',
      imp1Label: 'Free 24/7 Radio (37 channels)',
      imp2Label: 'Audio Bible V7 Production',
      imp3Label: 'New 4K Studio Fund',
      simPatronite: 'Monthly Patronage (Patronite) ↗',
      simDirectBtn: 'Bank / IBAN Transfer Details',
      flowEyebrow: '100% transparent · Living stream of good',
      flowTitle: 'How your gift becomes free Scripture 24/7',
      flowLead: 'No commercial sponsors, no ads. Watch how every donation flows directly into our four-pillar Christian Culture broadcast mission.',
      hubSub: '100% mission',
      stEyebrow: 'Transparent Investment Plan · Mission Home & Studio',
      stTitle: 'Building the New 4K Christian Culture Studio',
      stLead: 'An independent acoustic studio eliminates rental costs, brings studio clarity to Audio Bible narration and anchors 24/7 broadcasting. Tap any stage for details.',
      g1Title: 'Pillar I · 24/7 Broadcast & Studio Reserve',
      g1Note: 'Cloud servers, 37 live channels, Audio Bible production (15,000 PLN) + monthly studio reserve (10,000 PLN).',
      g2Title: 'Pillar II · New 4K Studio Equipment',
      g2Note: 'Stage I (Acoustics & launch): 25,000 PLN · Full Mission Home + Studio goal: 1,230,000 PLN.',
      stCta: 'Add a Brick to the 4K Studio →',
      payEyebrow: 'Poland & International (GBP · EUR · USD)',
      payTitle: 'Choose your easiest way to give',
      payLead: 'Give in seconds from Poland or anywhere worldwide via 1-Click or direct SEPA/SWIFT transfer.',
    },
  };

  var ROTATE_WORDS = {
    pl: ['żywą nadzieję', 'Słowo bez reklam', 'Nowe Studio RTV'],
    en: ['living hope', 'ad-free Scripture', 'a New 4K Studio'],
  };

  var CURRENCIES = {
    PLN: { symbol: 'zł', rate: 1, tiers: [25, 49, 99, 250, 490, 1000] },
    GBP: { symbol: '£', rate: 5.1, tiers: [5, 10, 20, 50, 100, 200] },
    EUR: { symbol: '€', rate: 4.3, tiers: [6, 12, 25, 60, 115, 250] },
    USD: { symbol: '$', rate: 4.0, tiers: [6, 12, 25, 65, 125, 250] },
  };

  var state = {
    lang: new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'pl',
    curr: 'PLN',
    idx: 2, // 99 zł
    wordIdx: 0,
  };

  function applyLang(lang) {
    state.lang = lang === 'en' ? 'en' : 'pl';
    document.documentElement.lang = state.lang;
    var map = DICT[state.lang];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (map[k]) el.textContent = map[k];
    });
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === state.lang;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    renderQuickPills();
    updateSimulator();
    mountEcoBars();
  }

  // ── 2. MOTION PRIMITIVES: SCROLL PROGRESS + WORD ROTATE + MAGNETIC + MAGIC CARD + 3D TILT ──
  function initScrollProgress() {
    var bar = document.getElementById('scrollProgressBar');
    if (!bar) return;
    function update() {
      var doc = document.documentElement;
      var max = Math.max(1, doc.scrollHeight - window.innerHeight);
      var pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      bar.style.width = pct.toFixed(2) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function initWordRotate() {
    var el = document.getElementById('wordRotate');
    if (!el) return;
    setInterval(function () {
      if (document.hidden) return;
      var list = ROTATE_WORDS[state.lang];
      state.wordIdx = (state.wordIdx + 1) % list.length;
      el.classList.add('is-swap');
      setTimeout(function () {
        el.textContent = list[state.wordIdx];
        el.classList.remove('is-swap');
      }, 320);
    }, 3400);
  }

  function initPointerFX() {
    var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    var spot = document.getElementById('heroSpotlight');
    var hero = document.querySelector('.hero');
    if (hero && spot) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        spot.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        spot.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      }, { passive: true });
    }

    document.querySelectorAll('.magic-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      }, { passive: true });
    });

    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.style.transform = 'perspective(1000px) rotateX(' + ((0.5 - y) * 6).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 6).toFixed(2) + 'deg)';
      }, { passive: true });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });

    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.16;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
        btn.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0)';
      }, { passive: true });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  // ── 3. CANVAS PARTICLES + AUDIO WAVE (<=30 FPS, PAUZA POZA EKRANEM) ──
  function initHeroCanvas() {
    var canvas = document.getElementById('heroParticles');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = 0, h = 0, visible = true, lastFrame = 0, raf = 0;

    var dots = Array.from({ length: 34 }, function (_, i) {
      return {
        x: ((i * 29) % 100) / 100,
        y: ((i * 47) % 100) / 100,
        r: 1.1 + (i % 4) * 0.75,
        vx: ((i % 2 ? 1 : -1) * (0.000045 + (i % 5) * 0.000018)) * (reduced ? 0.45 : 1),
        vy: (-0.000035 - (i % 4) * 0.000014) * (reduced ? 0.45 : 1),
        warm: i % 3 === 0,
      };
    });

    function resize() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(r.width));
      h = Math.max(1, Math.floor(r.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0] && entries[0].isIntersecting;
      }, { threshold: 0.05 }).observe(canvas);
    }

    function draw(ts) {
      raf = requestAnimationFrame(draw);
      if (!visible || document.hidden || ts - lastFrame < 34) return;
      lastFrame = ts;
      ctx.clearRect(0, 0, w, h);

      var t = ts * (reduced ? 0.00025 : 0.0007);
      // Podwójna świetlna fala radiowa
      for (var wave = 0; wave < 2; wave++) {
        ctx.beginPath();
        for (var x = 0; x <= w; x += 26) {
          var y = h * (0.58 + wave * 0.09) + Math.sin(x * (0.004 + wave * 0.0015) + t + wave) * (28 + wave * 10);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = wave === 0 ? 'rgba(255, 122, 0, 0.22)' : 'rgba(196, 163, 90, 0.16)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x = (d.x + d.vx + 1) % 1;
        d.y = (d.y + d.vy + 1) % 1;
        var px = d.x * w, py = d.y * h;
        ctx.beginPath();
        ctx.arc(px, py, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.warm ? 'rgba(255, 122, 0, 0.5)' : 'rgba(235, 214, 159, 0.48)';
        ctx.fill();
      }
    }
    raf = requestAnimationFrame(draw);
    window.addEventListener('beforeunload', function () { cancelAnimationFrame(raf); });
  }

  // ── 4. KONSOLA WIDEO 9:16 W HERO ──
  function initVideoConsole() {
    var vid = document.getElementById('heroSpotVideo');
    var overlay = document.getElementById('vcPlayBtn');
    var toggleBtn = document.getElementById('vcTogglePlay');
    var toggleLbl = document.getElementById('vcToggleLabel');
    var muteBtn = document.getElementById('vcToggleMute');
    var muteLbl = document.getElementById('vcMuteLabel');
    var shareBtn = document.getElementById('vcShareBtn');
    var eq = document.getElementById('vcEq');
    if (!vid) return;

    function syncUI() {
      var playing = !vid.paused && !vid.ended;
      if (overlay) overlay.classList.toggle('is-hidden', playing);
      if (eq) eq.classList.toggle('is-playing', playing);
      if (toggleLbl) toggleLbl.textContent = playing ? DICT[state.lang].vcBtnPause : DICT[state.lang].vcBtnPlay;
      if (muteLbl) muteLbl.textContent = vid.muted ? '🔇 Wycisz.' : '🔊 Dźwięk';
    }

    function playWithSound() {
      vid.muted = false;
      vid.controls = true;
      var p = vid.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () { vid.muted = true; vid.play().catch(function () {}); });
      }
      syncUI();
    }

    if (overlay) overlay.addEventListener('click', playWithSound);
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        if (vid.paused || vid.ended) playWithSound(); else vid.pause();
        syncUI();
      });
    }
    if (muteBtn) {
      muteBtn.addEventListener('click', function () {
        vid.muted = !vid.muted;
        syncUI();
      });
    }
    vid.addEventListener('play', syncUI);
    vid.addEventListener('pause', syncUI);
    vid.addEventListener('ended', function () { vid.currentTime = 0; syncUI(); });

    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        var shareUrl = 'https://polskieradio.cc/wspieramto#wideo-wsparcia';
        var data = {
          title: 'Wesprzyj misję Christian Culture — każdy gest ma znaczenie',
          text: 'Obejrzyj 21-sekundowe zaproszenie od Cezarego i Wioletty oraz wesprzyj wolne media Boże: https://zrzutka.pl/z/ChristianCulture',
          url: shareUrl,
        };
        if (navigator.share) {
          navigator.share(data).catch(function () {});
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('https://zrzutka.pl/z/ChristianCulture').then(function () {
            showToast(state.lang === 'en' ? 'Link copied!' : 'Skopiowano link zrzutka.pl/z/ChristianCulture!');
          });
        }
      });
    }
  }

  // ── 5. INTERAKTYWNY SYMULATOR WPŁYWU DARU ──
  function renderQuickPills() {
    var box = document.getElementById('simQuickPills');
    if (!box) return;
    var cfg = CURRENCIES[state.curr];
    box.innerHTML = '';
    cfg.tiers.forEach(function (val, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'q-pill' + (i === state.idx ? ' is-on' : '');
      btn.textContent = val + ' ' + cfg.symbol;
      btn.addEventListener('click', function () {
        state.idx = i;
        var sl = document.getElementById('simSlider');
        if (sl) sl.value = String(i);
        renderQuickPills();
        updateSimulator();
      });
      box.appendChild(btn);
    });
  }

  function updateSimulator() {
    var cfg = CURRENCIES[state.curr];
    var amount = cfg.tiers[state.idx] || cfg.tiers[2];
    var plnEq = Math.round(amount * cfg.rate);
    var en = state.lang === 'en';

    var amtEl = document.getElementById('simAmountDisplay');
    var symEl = document.getElementById('simSymbolDisplay');
    if (amtEl) {
      amtEl.textContent = String(amount);
      amtEl.classList.add('is-pop');
      setTimeout(function () { amtEl.classList.remove('is-pop'); }, 220);
    }
    if (symEl) symEl.textContent = cfg.symbol;

    var hours = Math.max(12, Math.round(plnEq * 0.48));
    var bibPct = Math.min(200, Math.round((plnEq / 490) * 100));
    var tierName, headline, studioTxt, rewardTxt;

    if (plnEq < 45) {
      tierName = en ? 'Mission Friend' : 'Przyjaciel Misji (Próg 25 zł)';
      headline = en ? 'Covers server bandwidth so dozens can listen ad-free today.' : 'Utrzymuje wolne serwery i emisję bez reklam dla dziesiątek nowych słuchaczy.';
      studioTxt = en ? 'Foundation Spark' : 'Iskra Wsparcia';
      rewardTxt = en ? 'Gratitude tier: 100% ad-free Gospel access + mission progress updates.' : 'Wyraz wdzięczności (Zrzutka.pl): imienne podziękowanie w aktualizacji i 100% darmowy dostęp do wszystkich materiałów CC.';
    } else if (plnEq < 95) {
      tierName = en ? 'Scripture Patron' : 'Patron Pisma (49 zł)';
      headline = en ? 'Funds daily Biblical Academy lessons & Audio Bible studio mastering.' : 'Napędza codzienne lekcje Akademii Biblijnej oraz studyjny mastering Biblii Audio V7.';
      studioTxt = en ? 'Studio Brick' : 'Cegiełka Akustyczna';
      rewardTxt = en ? 'Gratitude tier: direct contribution to Audio Bible & 24/7 radio continuity.' : 'Wyraz wdzięczności: realny wkład w nagranie kolejnych rozdziałów Pisma Świętego i bezpłatną emisję 24/7.';
    } else if (plnEq < 450) {
      tierName = en ? '4K Studio Builder' : 'Budowniczy Studia RTV (Próg 99 zł)';
      headline = en ? 'Powers 37 live channels AND adds a real brick to the New 4K Broadcast Studio.' : 'Zasilasz emisję 37 kanałów 24/7 oraz dokładasz konkretną cegiełkę na budowę Nowego Studia RTV 4K.';
      studioTxt = en ? 'Studio Builder Brick' : 'Cegiełka Budowniczego';
      rewardTxt = en ? 'Gratitude tier: Studio Builder status with behind-the-scenes production updates.' : 'Wyraz wdzięczności (Zrzutka.pl): status Budowniczego Nowego Studia RTV i regularne kulisy produkcji.';
    } else {
      tierName = en ? 'Chapter & Studio Founder' : 'Fundator Rozdziału & Studia (Próg 490 zł+)';
      headline = en ? 'Sponsors full production of an entire Audio Bible V7 chapter (4K + Spotify) & Founders Wall.' : 'Sfinansujesz pełną produkcję całego rozdziału Biblii Audio V7 (WWW + Spotify + 4K) i trafisz na Tablicę Fundatorów!';
      studioTxt = en ? 'Founders Wall Brick' : 'Tablica Fundatorów 4K';
      rewardTxt = en ? 'Gratitude tier: Patron credit for an Audio Bible chapter + Founders Wall recognition.' : 'Wyraz wdzięczności (Zrzutka.pl): honorowy patronat nad rozdziałem Biblii Audio V7 + wpis na Tablicę Fundatorów Nowego Studia RTV.';
    }

    var badge = document.getElementById('simTierBadge');
    var head = document.getElementById('simHeadline');
    var rVal = document.getElementById('impRadioVal');
    var rBar = document.getElementById('impRadioBar');
    var bVal = document.getElementById('impBibleVal');
    var bBar = document.getElementById('impBibleBar');
    var sVal = document.getElementById('impStudioVal');
    var sBar = document.getElementById('impStudioBar');
    var rew = document.getElementById('simRewardNote');
    var cta = document.getElementById('simPrimaryCta');
    var ctaLbl = document.getElementById('simPrimaryLabel');

    if (badge) badge.textContent = tierName;
    if (head) head.textContent = headline;
    if (rVal) rVal.textContent = hours + (en ? ' hours live' : ' godz. emisji');
    if (rBar) rBar.style.width = Math.min(100, Math.max(12, Math.round((hours / 240) * 100))) + '%';
    if (bVal) bVal.textContent = bibPct >= 100 ? (bibPct >= 200 ? (en ? '2 full chapters' : '2 pełne rozdziały') : (en ? '1 full chapter 4K' : '1 pełny rozdział 4K')) : bibPct + (en ? '% of chapter' : '% rozdziału');
    if (bBar) bBar.style.width = Math.min(100, Math.max(8, bibPct)) + '%';
    if (sVal) sVal.textContent = studioTxt;
    if (sBar) sBar.style.width = Math.min(100, Math.max(15, Math.round((plnEq / 500) * 100))) + '%';
    if (rew) rew.textContent = rewardTxt;

    var isPln = state.curr === 'PLN';
    if (cta) {
      cta.href = isPln ? 'https://zrzutka.pl/z/ChristianCulture' : 'https://revolut.me/christianculture';
      cta.setAttribute('data-support-method', isPln ? 'zrzutka_sim_cta' : 'revolut_sim_cta');
    }
    if (ctaLbl) {
      ctaLbl.textContent = isPln
        ? (en ? 'Donate ' + amount + ' PLN on Zrzutka.pl (BLIK / Card)' : 'Wpłać ' + amount + ' zł na Zrzutka.pl (BLIK / Karta)')
        : (en ? 'Donate ' + amount + ' ' + cfg.symbol + ' via Revolut 1-Click' : 'Wpłać ' + amount + ' ' + cfg.symbol + ' przez Revolut 1-Click');
    }
  }

  // ── 6. ŻYWE DANE JSON + CCECO BARS ──
  function loadLiveCatalogs() {
    Promise.all([
      fetch('/biblia-audio/data/catalog.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch('/data/wizytowki-katalog.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch('/data/cc-channels.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
    ]).then(function (res) {
      var bib = res[0], wiz = res[1], ch = res[2];
      if (Array.isArray(bib) && bib.length) {
        var pub = bib.filter(function (x) { return x.status === 'published'; }).length;
        var el = document.getElementById('statBible');
        if (el) { el.setAttribute('data-target', String(pub)); el.textContent = String(pub); }
      }
      if (wiz && Array.isArray(wiz.karty)) {
        var el2 = document.getElementById('statCards');
        if (el2) { el2.setAttribute('data-target', String(wiz.karty.length)); el2.textContent = String(wiz.karty.length); }
      }
      var chList = Array.isArray(ch) ? ch : (ch && Array.isArray(ch.channels) ? ch.channels : null);
      if (chList) {
        var el3 = document.getElementById('statChannels');
        if (el3) { el3.setAttribute('data-target', String(chList.length)); el3.textContent = String(chList.length); }
      }
    });
  }

  function mountEcoBars() {
    if (!window.CCEco) return;
    var en = state.lang === 'en';
    var items = [
      { id: 'zrz-v3', b: 'ZRZUTKA.PL', t: en ? 'New short link: <strong>zrzutka.pl/z/ChristianCulture</strong> (BLIK & Card)' : 'Nowy krótki adres zbiórki: <strong>zrzutka.pl/z/ChristianCulture</strong> (BLIK / Karta)', href: 'https://zrzutka.pl/z/ChristianCulture', cc: true },
      { id: 'pat-v3', b: 'PATRONITE', t: en ? 'Monthly patronage builds our New 4K Studio' : 'Stałe wsparcie co miesiąc: <strong>patronite.pl/osobowoscplus</strong>', href: 'https://patronite.pl/osobowoscplus' },
      { id: 'bib-v3', b: 'BIBLIA AUDIO', t: en ? '37/50 Genesis chapters live free on WWW & Spotify' : '37/50 rozdziałów Księgi Rodzaju za darmo na polskieradio.cc/biblia-audio', href: '/biblia-audio/', cc: true },
      { id: 'mil-v3', b: 'OD 2 ZŁ', t: en ? 'One Million Small Gestures campaign' : 'Kampania Milion Drobnych Gestów — każda drobna cegiełka ma moc', href: '/milion-gestow' },
    ];
    window.CCEco.mountTicker(document.getElementById('tickRun'), items, 'wspieramto-v3-ticker');
    window.CCEco.mountPromo(document.getElementById('promoStage'), document.getElementById('promoDots'), document.getElementById('promoBar'), state.lang, 'wspieramto-v3-promo', 10000);
  }

  // ── 7. SCROLL REVEAL + ANIMATED NUMBERS ──
  function initRevealAndReels() {
    var animated = new WeakSet();
    function runReel(el) {
      if (animated.has(el)) return;
      animated.add(el);
      var target = Number(el.getAttribute('data-target') || el.textContent || 0);
      if (!Number.isFinite(target) || target <= 0) return;
      var t0 = performance.now(), dur = 900;
      function frame(now) {
        var p = Math.min(1, (now - t0) / dur);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    function showEl(el) {
      el.classList.add('is-in');
      el.querySelectorAll('.reel').forEach(runReel);
    }
    function checkPassed() {
      var cut = window.innerHeight + 90;
      document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) {
        if (el.getBoundingClientRect().top <= cut) showEl(el);
      });
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { showEl(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0.01, rootMargin: '80px 0px' });
      document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
      window.addEventListener('scroll', checkPassed, { passive: true });
      checkPassed();
    } else {
      document.querySelectorAll('.reveal').forEach(showEl);
    }
    window.addEventListener('beforeprint', function () {
      document.querySelectorAll('.reveal').forEach(showEl);
    });
  }

  function showToast(msg) {
    var t = document.getElementById('ccToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  // ── 8. ZDARZENIA UI ──
  function bindUI() {
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
    });

    var burger = document.getElementById('burgerBtn');
    var menu = document.getElementById('menu');
    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = menu.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); });
      });
      window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) {
          menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    document.querySelectorAll('.curr-pill').forEach(function (b) {
      b.addEventListener('click', function () {
        state.curr = b.getAttribute('data-curr') || 'PLN';
        document.querySelectorAll('.curr-pill').forEach(function (x) {
          var on = x === b;
          x.classList.toggle('is-on', on);
          x.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        renderQuickPills();
        updateSimulator();
      });
    });

    var sl = document.getElementById('simSlider');
    if (sl) {
      sl.addEventListener('input', function () {
        state.idx = Number(sl.value);
        renderQuickPills();
        updateSimulator();
      });
    }

    document.querySelectorAll('.disc-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = document.getElementById(btn.getAttribute('data-disc'));
        if (!panel) return;
        var willOpen = panel.hidden;
        panel.hidden = !willOpen;
        btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        btn.textContent = willOpen ? 'Ukryj szczegóły −' : 'Szczegóły techniczne +';
      });
    });

    document.querySelectorAll('.copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var val = btn.getAttribute('data-copy');
        if (!val) return;
        var orig = btn.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(val).then(function () {
            btn.textContent = '✓ Skopiowano';
            btn.classList.add('is-done');
            showToast('Skopiowano do schowka!');
            setTimeout(function () { btn.textContent = orig; btn.classList.remove('is-done'); }, 2200);
          });
        }
      });
    });
  }

  bindUI();
  applyLang(state.lang);
  loadLiveCatalogs();
  initScrollProgress();
  initWordRotate();
  initHeroCanvas();
  initVideoConsole();
  initPointerFX();
  initRevealAndReels();
})();
