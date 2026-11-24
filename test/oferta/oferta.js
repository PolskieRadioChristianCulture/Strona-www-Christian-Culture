(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');
  function markReady() {
    document.documentElement.classList.add('is-ready');
    document.body.classList.add('is-ready');
  }
  var readyTimer = setTimeout(markReady, 2200);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      markReady();
      clearTimeout(readyTimer);
    });
  });

  // ── 1. TREŚĆ PL / EN Z JEDNEGO ŹRÓDŁA ──
  var DICT = {
    pl: {
      skip: 'Przejdź do treści',
      tickBadge: 'Partnerstwo CC',
      brandSub: 'Oferta dla Firm i Zborów',
      navPacks: 'Pakiety',
      navWork: 'Realizacje',
      navOrder: 'Zamów',
      navDir: 'Wizytówki',
      navStudio: 'Studio RTV',
      navSupport: 'Wspieram to',
      heroBadge: 'Wersja testowa oferty · Silnik Partnerstwa CC',
      h1a: 'Twoja marka i zbór',
      h1b: 'w służbie Ewangelii',
      heroLead: 'Zamów profesjonalną Wizytówkę Firmową Premium na polskieradio.cc lub obejmij patronatem kolejny rozdział Biblii Audio. Zyskujesz nowoczesną obecność w sieci — a 100% środków utrzymuje bezpłatne Radio 24/7 i buduje nasze Nowe Studio RTV 4K.',
      ctaPrimary: 'Wybierz pakiet (od 299 zł)',
      ctaSecondary: 'Zamów przez WhatsApp / E-mail',
      liveHead: 'Żywe dane z produkcji CC',
      liveBibleLabel: 'Biblia Audio — Księga Rodzaju',
      liveNextLabel: 'Najbliższy otwarty rozdział do patronatu (490 zł):',
      liveNextChannels: 'Publikacja: polskieradio.cc/biblia-audio · Spotify · YouTube 4K',
      liveDirLabel: 'Katalog /wizytowki',
      liveChLabel: 'Kanały 24/7',
      liveSlotBtn: 'Zarezerwuj patronat nad tym rozdziałem →',
      stat1: 'rozdziałów Księgi Rodzaju w Biblii Audio (XI 2026)',
      stat2: 'aktywnych wizytówek w katalogu /wizytowki',
      stat3: 'całodobowych kanałów Radia i TV CC',
      stat4: 'wpływów wspiera darmową misję i Nowe Studio RTV',
      packsEyebrow: 'Przejrzyste zasady · Bez ukrytych opłat',
      packsTitle: 'Trzy konkretne formy współpracy',
      packsLead: 'Standardowe wizytówki artystów ewangelizacyjnych i służb misyjnych nadal pozostają bezpłatne na /wizytowki. Poniższe pakiety komercyjne i sponsorskie są dedykowane firmom, twórcom, fundacjom i zborom chcącym realnie wspierać rozwój mediów Bożych.',
      p1Ribbon: 'Najczęściej wybierany · Firmy & Usługi',
      p1Name: 'Wizytówka Firmowa Premium CC',
      p1Period: '/ rok',
      p1Alt: 'lub 49 zł / mies. · dla firm, rzemieślników, terapeutów, sklepów i autorów',
      p1b1: 'Własna strona premium pod adresem polskieradio.cc/TwojaNazwa (smartfon + desktop + SEO)',
      p1b2: 'Wyróżnienie na szczycie katalogu /wizytowki oraz w portalu /ogloszenia',
      p1b3: 'Bezpośrednie przyciski kontaktu (Telefon, WhatsApp, Twoja strona, galeria oferty)',
      p1b4: 'Publikacja wpisu przedstawiającego Twoją firmę na Tablicy LUMINA i w mediach CC',
      p1b5: '12 miesięcy hostingu, certyfikatu SSL i aktualizacji technicznych bez opłat dodatkowych',
      p1Btn: 'Zamów Wizytówkę (299 zł/rok) →',
      p2Ribbon: 'Zbory · Fundacje · Rodziny · Firmy',
      p2Name: 'Patronat Odcinka Biblii Audio V7',
      p2Period: '/ odcinek',
      p2Alt: 'Sfinansuj pełną produkcję jednego rozdziału Pisma Świętego (-16 LUFS, 4K)',
      p2b1: 'Oficjalny patronat nad wybranym rozdziałem Biblii Audio (np. najbliższy Rdz 38) lub audycją',
      p2b2: 'Podziękowanie z nazwą zboru/firmy/rodziny i linkiem na polskieradio.cc/biblia-audio',
      p2b3: 'Wpis patronacki w opisie publikacji na Spotify oraz na kanale YouTube 4K',
      p2b4: 'Serdeczne podziękowanie na antenie PolskieRadio.cc (za Twoją zgodą)',
      p2b5: 'Wpis na honorowej Tablicy Fundatorów Nowego Studia RTV 4K Christian Culture',
      p2Btn: 'Obejmij Patronat Odcinka (490 zł) →',
      p3Ribbon: 'Indywidualne projekty medialne',
      p3Name: 'Partnerstwo & Studio Dobrego Słowa',
      p3Price: 'od 1 200 zł',
      p3Alt: 'Dedykowana produkcja dla zborów, wydawnictw, konferencji i marek',
      p3b1: 'Kompletna strona WWW w standardzie CC FULL PREMIUM pod własną domeną',
      p3b2: 'Studyjny spot radiowy (-16 LUFS), lektor lub materiał wideo 4K do internetu',
      p3b3: 'Produkcja podcastu, cyklu wykładów albo audiobooka w CC Studio DAW',
      p3b4: 'Całoroczna obecność partnerska w paskach poleceń i na kanałach 24/7 CC',
      p3b5: 'Bezpośredni kontakt i indywidualny harmonogram prac z zespołem CC',
      p3Btn: 'Zapytaj o wycenę indywidualną →',
      workEyebrow: 'Sprawdzone na produkcji · zero makiet',
      workTitle: 'Tak wyglądają nasze prawdziwe realizacje',
      workLead: 'Kliknij dowolną kartę, aby zobaczyć żywą wizytówkę lub kanał działający już dziś w ekosystemie polskieradio.cc.',
      orderEyebrow: 'Szybki start bez biurokracji',
      orderTitle: 'Zamów w 60 sekund',
      orderLead: 'Wybierz pakiet i wpisz podstawowe dane — poniżej od razu powstanie gotowa wiadomość do wysłania jednym kliknięciem na WhatsApp lub e-mail. Odpowiadamy osobiście i omawiamy szczegóły przed płatnością.',
      pill1: 'Wizytówka Premium',
      pill2: 'Patronat Odcinka',
      pill3: 'Partnerstwo / Studio',
      pill3Sub: 'od 1 200 zł',
      fNameLabel: 'Nazwa firmy, zboru, służby lub imię i nazwisko',
      fDetailLabel: 'Branża, adres strony lub wybrany rozdział Biblii Audio',
      fNoteLabel: 'Dodatkowa uwaga (opcjonalnie)',
      prevHead: 'Gotowa treść zgłoszenia',
      btnWa: 'Wyślij zgłoszenie na WhatsApp (1-Click) →',
      btnMail: 'Wyślij e-mail',
      btnCopy: 'Kopiuj treść',
      payNote: 'Chcesz od razu opłacić cegiełkę patronacką (np. próg 490 zł na Zrzutka.pl) lub zobaczyć dane do przelewu?',
      btnModalPay: 'Dane do przelewu / PLN & EUR',
      patEyebrow: '100% na wolne media Boże bez reklam',
      patTitle: 'Nie prowadzisz firmy, ale chcesz wesprzeć misję?',
      patText: 'Każdy dar — od 25 zł na Zrzutce, przez comiesięczne wsparcie na Patronite, aż po cegiełkę na budowę Nowego Studia Radiowo-Telewizyjnego — pozwala nam nadawać Ewangelię za darmo dla każdego.',
      patCta1: 'Wesprzyj 1-Click (BLIK / Karta) →',
      shareBtn: 'Udostępnij ofertę',
    },
    en: {
      skip: 'Skip to content',
      tickBadge: 'CC Partnership',
      brandSub: 'Business & Church Offer',
      navPacks: 'Packages',
      navWork: 'Live Work',
      navOrder: 'Order',
      navDir: 'Directory',
      navStudio: 'Studio 4K',
      navSupport: 'Support Us',
      heroBadge: 'Preview Offer · Christian Culture Partnership Engine',
      h1a: 'Your brand & church',
      h1b: 'serving the Gospel',
      heroLead: 'Order a premium showcase page on polskieradio.cc or sponsor the next Audio Bible chapter. You receive a modern web presence while 100% of proceeds fund ad-free 24/7 Radio and our New 4K Broadcast Studio.',
      ctaPrimary: 'Choose package (from 299 PLN)',
      ctaSecondary: 'Order via WhatsApp / Email',
      liveHead: 'Live Christian Culture Production Data',
      liveBibleLabel: 'Audio Bible — Book of Genesis',
      liveNextLabel: 'Next open chapter for sponsorship (490 PLN):',
      liveNextChannels: 'Published on polskieradio.cc/biblia-audio · Spotify · YouTube 4K',
      liveDirLabel: 'Directory /wizytowki',
      liveChLabel: '24/7 Channels',
      liveSlotBtn: 'Reserve sponsorship for this chapter →',
      stat1: 'Genesis chapters published in Audio Bible (Nov 2026)',
      stat2: 'active showcase cards in /wizytowki',
      stat3: '24/7 Radio & TV channels in Christian Culture',
      stat4: 'of funds support ad-free Gospel media & New Studio',
      packsEyebrow: 'Transparent pricing · Zero hidden fees',
      packsTitle: 'Three clear ways to partner',
      packsLead: 'Standard showcase pages for Gospel artists and volunteer ministries remain free on /wizytowki. These commercial & sponsorship tiers are built for Christian businesses, creators, foundations and churches.',
      p1Ribbon: 'Most Popular · Businesses & Services',
      p1Name: 'Premium Business Card CC',
      p1Period: '/ year',
      p1Alt: 'or 49 PLN / month · for Christian businesses, artisans, counselors, shops & authors',
      p1b1: 'Dedicated premium page at polskieradio.cc/YourName (mobile + desktop + SEO)',
      p1b2: 'Featured placement at the top of /wizytowki directory & /ogloszenia',
      p1b3: 'Direct contact buttons (Phone, WhatsApp, website, offer gallery)',
      p1b4: 'Promotional spotlight post on LUMINA community board & CC social channels',
      p1b5: '12 months of hosting, SSL and technical care with zero hidden costs',
      p1Btn: 'Order Showcase Page (299 PLN/yr) →',
      p2Ribbon: 'Churches · Foundations · Families',
      p2Name: 'Audio Bible V7 Chapter Sponsorship',
      p2Period: '/ chapter',
      p2Alt: 'Fund full broadcast-grade production of one Scripture chapter (-16 LUFS, 4K)',
      p2b1: 'Official sponsorship of an upcoming Audio Bible chapter (e.g. Genesis 38) or broadcast',
      p2b2: 'Credit with your church/company/family name & link on polskieradio.cc/biblia-audio',
      p2b3: 'Sponsor recognition in Spotify & YouTube 4K episode descriptions',
      p2b4: 'On-air thank-you mention on PolskieRadio.cc (with your consent)',
      p2b5: 'Recognition on the Christian Culture New 4K Studio Founders Wall',
      p2Btn: 'Sponsor a Chapter (490 PLN) →',
      p3Ribbon: 'Custom Media Production',
      p3Name: 'Strategic Partnership & Studio',
      p3Price: 'from 1,200 PLN',
      p3Alt: 'Bespoke production for churches, publishers, conferences & Christian brands',
      p3b1: 'Complete CC FULL PREMIUM website under your own domain',
      p3b2: 'Broadcast-mastered audio spot (-16 LUFS), narration or 4K promo video',
      p3b3: 'Podcast, sermon series or audiobook production in CC Studio DAW',
      p3b4: 'Year-round partner visibility across CC 24/7 channels & promo bars',
      p3b5: 'Direct collaboration and tailored schedule with the Christian Culture team',
      p3Btn: 'Request Custom Quote →',
      workEyebrow: 'Live on production · zero mockups',
      workTitle: 'Real live examples from our ecosystem',
      workLead: 'Tap any card to open a real showcase page or 24/7 channel running today on polskieradio.cc.',
      orderEyebrow: 'Fast start · zero red tape',
      orderTitle: 'Order in 60 seconds',
      orderLead: 'Pick a package and enter your name — a ready-to-send inquiry is generated immediately for 1-Click WhatsApp or Email. We reply personally before any payment.',
      pill1: 'Premium Card',
      pill2: 'Chapter Sponsor',
      pill3: 'Studio Partner',
      pill3Sub: 'from 1,200 PLN',
      fNameLabel: 'Company, church, ministry or full name',
      fDetailLabel: 'Industry, website or preferred Audio Bible chapter',
      fNoteLabel: 'Optional note',
      prevHead: 'Ready inquiry message',
      btnWa: 'Send Inquiry via WhatsApp (1-Click) →',
      btnMail: 'Send Email',
      btnCopy: 'Copy text',
      payNote: 'Prefer to complete your patronage right away via Zrzutka.pl (BLIK/Card) or international transfer?',
      btnModalPay: 'Transfer details / GBP · EUR · USD',
      patEyebrow: '100% supports ad-free Christian media',
      patTitle: 'Not a business, yet want to support the mission?',
      patText: 'Every gift — from 25 PLN on Zrzutka.pl, monthly patronage on Patronite, to a New 4K Studio founder brick — keeps the Gospel free for everyone.',
      patCta1: 'Support 1-Click (BLIK / Card) →',
      shareBtn: 'Share this offer',
    },
  };

  var state = {
    lang: new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'pl',
    pack: 'wizytowka',
    nextChapterNum: 38,
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
    updateOrderPreview();
    mountEcoBars();
  }

  // ── 2. ŻYWE DANE Z KATALOGÓW JSON (ZERO FIKCJI) ──
  function loadLiveData() {
    Promise.all([
      fetch('/biblia-audio/data/catalog.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch('/data/wizytowki-katalog.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch('/data/cc-channels.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
    ]).then(function (res) {
      var bib = res[0], wiz = res[1], ch = res[2];
      if (Array.isArray(bib) && bib.length) {
        var pub = bib.filter(function (x) { return x.status === 'published'; });
        var nextOpen = bib.find(function (x) { return x.status !== 'published'; });
        var pct = Math.round((pub.length / bib.length) * 100);
        var statEl = document.getElementById('liveBibleStat');
        var barEl = document.getElementById('liveBibleBar');
        var reelBib = document.getElementById('reelBible');
        if (statEl) statEl.textContent = pub.length + ' / ' + bib.length + (state.lang === 'en' ? ' chapters' : ' rozdziałów');
        if (barEl) barEl.style.width = pct + '%';
        if (reelBib) { reelBib.setAttribute('data-reel', String(pub.length)); reelBib.textContent = String(pub.length); }
        if (nextOpen && nextOpen.chapter) {
          state.nextChapterNum = nextOpen.chapter;
          var nextEl = document.getElementById('liveNextChapter');
          if (nextEl) nextEl.textContent = (state.lang === 'en' ? 'Book of Genesis — Chapter ' : 'Księga Rodzaju — Rozdział ') + nextOpen.chapter;
        }
      }
      if (wiz && Array.isArray(wiz.karty)) {
        var dirEl = document.getElementById('liveDirCount');
        var reelDir = document.getElementById('reelDir');
        if (dirEl) dirEl.textContent = wiz.karty.length + (state.lang === 'en' ? ' cards' : ' wizytówek');
        if (reelDir) { reelDir.setAttribute('data-reel', String(wiz.karty.length)); reelDir.textContent = String(wiz.karty.length); }
      }
      var chList = Array.isArray(ch) ? ch : (ch && Array.isArray(ch.channels) ? ch.channels : null);
      if (chList) {
        var chEl = document.getElementById('liveChCount');
        var reelCh = document.getElementById('reelChan');
        if (chEl) chEl.textContent = chList.length + (state.lang === 'en' ? ' channels' : ' kanałów');
        if (reelCh) { reelCh.setAttribute('data-reel', String(chList.length)); reelCh.textContent = String(chList.length); }
      }
      updateOrderPreview();
    });
  }

  // ── 3. TICKER I „★ POLECAMY” (WSPÓLNY CCEco) ──
  function mountEcoBars() {
    if (!window.CCEco) return;
    var en = state.lang === 'en';
    var items = [
      { id: 'wizytowka-299', b: en ? 'OFFER' : 'OFERTA', t: en ? 'Premium Business Card on polskieradio.cc — <strong>299 PLN/year</strong>' : 'Wizytówka Firmowa Premium na polskieradio.cc — <strong>299 zł / rok</strong>', href: '#pakiety', cc: true },
      { id: 'patronat-490', b: en ? 'AUDIO BIBLE' : 'BIBLIA AUDIO', t: en ? 'Sponsor Genesis Chapter ' + state.nextChapterNum + ' — <strong>490 PLN</strong>' : 'Obejmij Patronatem Rozdział ' + state.nextChapterNum + ' Księgi Rodzaju — <strong>490 zł</strong>', href: '#zamowienie' },
      { id: 'studio-rtv', b: en ? 'NEW STUDIO' : 'NOWE STUDIO RTV', t: en ? '100% of proceeds build the Christian Culture 4K Broadcast Studio' : '100% wpływów wspiera darmową misję i budowę Nowego Studia RTV 4K', href: '/wspieramto', cc: true },
      { id: 'katalog', b: en ? 'DIRECTORY' : 'KATALOG', t: en ? '26 live showcase pages already online at /wizytowki' : '26 działających wizytówek w katalogu polskieradio.cc/wizytowki', href: '/wizytowki' },
      { id: 'zrzutka', b: 'ZRZUTKA.PL', t: en ? '1-Click support via BLIK & Card (25 / 99 / 490 PLN)' : 'Szybkie wsparcie BLIK / Karta z 3 progami wdzięczności: zrzutka.pl/rs4g4v', href: 'https://zrzutka.pl/rs4g4v', cc: true },
    ];
    window.CCEco.mountTicker(document.getElementById('tickRun'), items, 'oferta-ticker');
    window.CCEco.mountPromo(document.getElementById('promoStage'), document.getElementById('promoDots'), document.getElementById('promoBar'), state.lang, 'oferta-promo', 10000);
  }

  // ── 4. KREATOR ZGŁOSZENIA 1-CLICK ──
  var PACK_META = {
    wizytowka: {
      pl: { name: 'Wizytówka Firmowa Premium CC', price: '299 zł / rok' },
      en: { name: 'Premium Business Card CC', price: '299 PLN / year' },
    },
    patronat: {
      pl: { name: 'Patronat Odcinka Biblii Audio V7', price: '490 zł / odcinek' },
      en: { name: 'Audio Bible V7 Chapter Sponsorship', price: '490 PLN / chapter' },
    },
    studio: {
      pl: { name: 'Partnerstwo Strategiczne & Studio Dobrego Słowa', price: 'od 1 200 zł' },
      en: { name: 'Strategic Partnership & Studio', price: 'from 1,200 PLN' },
    },
  };

  function updateOrderPreview() {
    var meta = PACK_META[state.pack][state.lang];
    var name = (document.getElementById('fName')?.value || '').trim();
    var detail = (document.getElementById('fDetail')?.value || '').trim();
    var note = (document.getElementById('fNote')?.value || '').trim();
    var isEn = state.lang === 'en';

    var lines = isEn
      ? [
          'Hello Christian Culture Team,',
          'I would like to order: ' + meta.name + ' (' + meta.price + ').',
          '• Name / Church / Company: ' + (name || '[enter name]'),
          '• Focus / Chapter: ' + (detail || (state.pack === 'patronat' ? 'Book of Genesis Chapter ' + state.nextChapterNum : '[brief description]')),
        ]
      : [
          'Dzień dobry Zespole Christian Culture,',
          'Zgłaszam zainteresowanie pakietem: ' + meta.name + ' (' + meta.price + ').',
          '• Firma / Zbór / Imię: ' + (name || '[wpisz nazwę]'),
          '• Branża / Wybrany rozdział: ' + (detail || (state.pack === 'patronat' ? 'Księga Rodzaju — Rozdział ' + state.nextChapterNum : '[krótki opis oferty lub link]')),
        ];
    if (note) lines.push((isEn ? '• Additional note: ' : '• Dodatkowa uwaga: ') + note);
    lines.push(isEn ? 'Please send next steps. Thank you!' : 'Proszę o kontakt i ustalenie szczegółów publikacji. Dziękuję!');

    var msg = lines.join('\n');
    var prev = document.getElementById('orderMsgPreview');
    var tag = document.getElementById('prevPriceTag');
    var wa = document.getElementById('btnSendWa');
    var mail = document.getElementById('btnSendMail');
    if (prev) prev.textContent = msg;
    if (tag) tag.textContent = meta.price;
    if (wa) wa.href = 'https://wa.me/48537137043?text=' + encodeURIComponent(msg);
    if (mail) mail.href = 'mailto:radiochristianculture@gmail.com?subject=' + encodeURIComponent('Zgłoszenie CC: ' + meta.name) + '&body=' + encodeURIComponent(msg);
  }

  function selectPack(packId, shouldScroll) {
    if (!PACK_META[packId]) return;
    state.pack = packId;
    document.querySelectorAll('.pack-pill').forEach(function (b) {
      var on = b.getAttribute('data-pack') === packId;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    updateOrderPreview();
    if (window.CCAnalyticsMC && typeof window.CCAnalyticsMC.trackSupportMethodSelect === 'function') {
      window.CCAnalyticsMC.trackSupportMethodSelect('oferta_' + packId);
    }
    if (shouldScroll) {
      var el = document.getElementById('zamowienie');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ── 5. ŻYWE TŁO CANVAS (<=30 FPS, PAUZA POZA EKRANEM I GDY HIDDEN, DZIAŁA PRZY REDUCED-MOTION) ──
  function initHeroCanvas() {
    var canvas = document.getElementById('heroFx');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = 0, h = 0, visible = true, lastFrame = 0, raf = 0;
    var particles = Array.from({ length: 28 }, function (_, i) {
      return {
        x: (i * 37) % 100 / 100,
        y: (i * 53) % 100 / 100,
        r: 1.2 + (i % 4) * 0.7,
        vx: ((i % 2 ? 1 : -1) * (0.00004 + (i % 5) * 0.000015)) * (reduced ? 0.5 : 1),
        vy: (-0.00003 - (i % 4) * 0.000012) * (reduced ? 0.5 : 1),
        gold: i % 3 !== 0,
      };
    });

    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
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

      var t = ts * (reduced ? 0.00025 : 0.0006);
      ctx.beginPath();
      for (var x = 0; x <= w; x += 28) {
        var y = h * 0.62 + Math.sin(x * 0.0045 + t) * 34 + Math.cos(x * 0.002 - t * 0.7) * 18;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(196, 163, 90, 0.18)';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x = (p.x + p.vx + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? 'rgba(231, 209, 155, 0.42)' : 'rgba(255, 122, 0, 0.36)';
        ctx.fill();
      }
    }
    raf = requestAnimationFrame(draw);
    window.addEventListener('beforeunload', function () { cancelAnimationFrame(raf); });
  }

  // ── 6. REVEAL, LICZNIKI BĘBNOWE I 3D TILT (TYLKO DESKTOP) ──
  function initScrollEffects() {
    var reelsAnimated = new WeakSet();
    function animateReel(el) {
      if (reelsAnimated.has(el)) return;
      reelsAnimated.add(el);
      var target = Number(el.getAttribute('data-reel') || el.textContent || 0);
      if (!Number.isFinite(target) || target <= 0) return;
      var start = performance.now(), dur = 950;
      function step(now) {
        var p = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function revealEl(el) {
      el.classList.add('is-in');
      el.querySelectorAll('.reel').forEach(animateReel);
    }

    function revealAboveFoldOrPassed() {
      var cutoff = window.innerHeight + 80;
      document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) {
        if (el.getBoundingClientRect().top <= cutoff) revealEl(el);
      });
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealEl(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.01, rootMargin: '80px 0px' });
      document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
      window.addEventListener('scroll', revealAboveFoldOrPassed, { passive: true });
      revealAboveFoldOrPassed();
    } else {
      document.querySelectorAll('.reveal').forEach(revealEl);
    }
    window.addEventListener('beforeprint', function () {
      document.querySelectorAll('.reveal').forEach(revealEl);
    });

    var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (finePointer && !reduced) {
      document.querySelectorAll('[data-tilt]').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width;
          var y = (e.clientY - r.top) / r.height;
          card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
          var rx = ((0.5 - y) * 7).toFixed(2);
          var ry = ((x - 0.5) * 7).toFixed(2);
          card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-3px)';
        });
        card.addEventListener('mouseleave', function () { card.style.transform = ''; });
      });
    }
  }

  function showToast(msg) {
    var t = document.getElementById('ccToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2800);
  }

  // ── 7. ZDARZENIA UI ──
  function bindEvents() {
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
        a.addEventListener('click', function () {
          menu.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
      window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) {
          menu.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    document.querySelectorAll('[data-select-pack]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        selectPack(btn.getAttribute('data-select-pack'), true);
      });
    });

    document.querySelectorAll('.pack-pill').forEach(function (btn) {
      btn.addEventListener('click', function () { selectPack(btn.getAttribute('data-pack'), false); });
    });

    ['fName', 'fDetail', 'fNote'].forEach(function (id) {
      var inp = document.getElementById(id);
      if (inp) inp.addEventListener('input', updateOrderPreview);
    });

    var copyBtn = document.getElementById('btnCopyMsg');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = document.getElementById('orderMsgPreview')?.textContent || '';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            var st = document.getElementById('copyStatus');
            if (st) st.textContent = state.lang === 'en' ? 'Inquiry copied to clipboard!' : 'Skopiowano treść zgłoszenia do schowka!';
            showToast(state.lang === 'en' ? 'Copied!' : 'Skopiowano zgłoszenie!');
          });
        }
      });
    }

    var waBtn = document.getElementById('btnSendWa');
    if (waBtn) {
      waBtn.addEventListener('click', function () {
        if (window.CCAnalyticsMC && typeof window.CCAnalyticsMC.trackSupportFormSubmit === 'function') {
          window.CCAnalyticsMC.trackSupportFormSubmit('oferta_whatsapp_' + state.pack);
        }
      });
    }

    var mailBtn = document.getElementById('btnSendMail');
    if (mailBtn) {
      mailBtn.addEventListener('click', function () {
        if (window.CCAnalyticsMC && typeof window.CCAnalyticsMC.trackSupportFormSubmit === 'function') {
          window.CCAnalyticsMC.trackSupportFormSubmit('oferta_email_' + state.pack);
        }
      });
    }

    var rail = document.getElementById('workRail');
    var prevBtn = document.getElementById('railPrev');
    var nextBtn = document.getElementById('railNext');
    if (rail && prevBtn && nextBtn) {
      prevBtn.addEventListener('click', function () { rail.scrollBy({ left: -340, behavior: 'smooth' }); });
      nextBtn.addEventListener('click', function () { rail.scrollBy({ left: 340, behavior: 'smooth' }); });
    }

    var shareBtn = document.getElementById('sharePageBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        var shareData = {
          title: 'Oferta Partnerstwa Christian Culture (Wizytówki Premium + Patronat Biblii Audio)',
          text: 'Zobacz jak chrześcijańska firma lub zbór może zamówić Wizytówkę Premium (299 zł/rok) lub objąć Patronatem odcinek Biblii Audio (490 zł).',
          url: location.href,
        };
        if (navigator.share) {
          navigator.share(shareData).catch(function () {});
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(location.href).then(function () {
            showToast(state.lang === 'en' ? 'Link copied!' : 'Skopiowano link oferty!');
          });
        }
      });
    }
  }

  bindEvents();
  applyLang(state.lang);
  loadLiveData();
  initHeroCanvas();
  initScrollEffects();
})();
