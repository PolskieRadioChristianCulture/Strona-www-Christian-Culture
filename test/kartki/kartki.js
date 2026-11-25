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

  var BIRTHDAY_YT_ID = 'YSg_C27JYsI';
  var BIRTHDAY_YT_EMBED = 'https://www.youtube-nocookie.com/embed/' + BIRTHDAY_YT_ID + '?autoplay=1&rel=0&modestbranding=1';

  var CARDS = {
    urodziny: {
      id: 'urodziny',
      type: 'youtube',
      ytId: BIRTHDAY_YT_ID,
      img: '/test/kartki/assets/card-urodziny.webp',
      imgW: 1280,
      imgH: 720,
      versePl: '„Niech ci błogosławi Pan i niech cię strzeże; Niech Pan rozjaśni nad tobą swoje oblicze i niech ci będzie łaskawy; Niech Pan zwróci ku tobie swoje oblicze i niech da ci pokój.”',
      verseEn: '"The LORD bless you and keep you; the LORD make His face shine upon you, and be gracious to you; the LORD lift up His countenance upon you, and give you peace."',
      refPl: '4 Mojżeszowa (Liczb) 6,24–26 · UBG',
      refEn: 'Numbers 6:24–26',
      songPl: 'Dziś Są Twoje Urodziny · Christian Culture',
      songEn: 'Today Is Your Birthday · Christian Culture',
      durationLabel: '03:16',
      tagPl: 'Urodziny',
      tagEn: 'Birthday',
      headingPl: 'Wszystkiego Najlepszego z okazji Urodzin!',
      headingEn: 'Happy & Blessed Birthday!',
      defaultWishPl: 'Niech Bóg błogosławi każdy dzień Twojego nowego roku życia — niech nie zabraknie Ci pokoju, radości, zdrowia i dobrych ludzi obok!',
      defaultWishEn: 'May God bless every day of your new year of life with peace, strength, joy and loving people beside you!',
      wishesPl: [
        'Niech Bóg błogosławi każdy Twój dzień — dużo pokoju, zdrowia i radości z całego serca!',
        'Dziś są Twoje urodziny! Dziękuję Bogu, że jesteś — niech prowadzi Cię w każdym kroku nowego roku życia.',
        'Życzę Ci serca pełnego nadziei, światła w trudniejszych chwilach i pięknego świętowania w gronie bliskich!'
      ],
      wishesEn: [
        'May God bless every step of your new year with deep peace, joy and good health!',
        'Thankful to God for your life today! Wishing you a joyful and blessed birthday.',
        'May His light and grace brighten every day ahead of you. Happy Birthday!'
      ]
    },
    dobrze: {
      id: 'dobrze',
      type: 'audio',
      audioSrc: '/test/kartki/assets/dobrze-ze-jestes.mp3',
      img: '/test/kartki/assets/card-dobrze.webp',
      imgW: 1024,
      imgH: 576,
      versePl: '„Dziękuję memu Bogu, ilekroć was wspominam; Zawsze w każdej mojej modlitwie prosząc z radością za was wszystkich;”',
      verseEn: '"I thank my God upon every remembrance of you, always in every prayer of mine making request for you all with joy,"',
      refPl: 'Filipian 1,3–4 · UBG',
      refEn: 'Philippians 1:3–4',
      songPl: 'Dobrze, że jesteś · Christian Culture',
      songEn: 'Good That You Are Here · Christian Culture',
      durationLabel: '03:25',
      tagPl: 'Dobrze, że jesteś',
      tagEn: 'Encouragement',
      headingPl: 'Dobrze, że jesteś!',
      headingEn: 'It is so good that you are here!',
      defaultWishPl: 'Chcę Ci dziś po prostu powiedzieć: dziękuję, że jesteś w moim życiu. Przesyłam tę piosenkę na pokrzepienie serca!',
      defaultWishEn: 'I simply wanted to remind you today: thank you for being in my life. Sending this song to encourage your heart!',
      wishesPl: [
        'Chcę Ci dziś po prostu powiedzieć: dobrze, że jesteś! Niech ta melodia doda Ci spokoju i sił.',
        'Pamiętam o Tobie w modlitwie i dziękuję Bogu za Twoją obecność i dobroć.',
        'Jeśli dzisiejszy dzień jest cięższy — posłuchaj przez chwilę i pamiętaj, że nie jesteś sam.'
      ],
      wishesEn: [
        'Just wanted to say today: it is good that you are here! May this song bring you peace.',
        'Keeping you in my prayers and thanking God for your presence and kindness.',
        'Take three quiet minutes for yourself today and remember you are deeply valued.'
      ]
    },
    nowy_rok: {
      id: 'nowy_rok',
      type: 'audio',
      audioSrc: '/test/kartki/assets/nowy-rok.mp3',
      img: '/test/kartki/assets/card-nowy-rok.webp',
      imgW: 1200,
      imgH: 675,
      versePl: '„Gdyż ja znam myśli, które mam o was, mówi Pan: myśli o pokoju, a nie o utrapieniu, aby zapewnić wam koniec, jakiego oczekujecie.”',
      verseEn: '"For I know the thoughts that I think toward you, says the LORD, thoughts of peace and not of evil, to give you a future and a hope."',
      refPl: 'Jeremiasza 29,11 · UBG',
      refEn: 'Jeremiah 29:11',
      songPl: 'Szczęśliwego Nowego Roku z Jezusem · Christian Culture',
      songEn: 'Happy New Year with Jesus · Christian Culture',
      durationLabel: '02:55',
      tagPl: 'Nowy Rok 2027',
      tagEn: 'New Year 2027',
      headingPl: 'Szczęśliwego Nowego Roku 2027!',
      headingEn: 'Happy & Blessed New Year 2027!',
      defaultWishPl: 'Na cały Nowy Rok 2027 życzę Ci Bożego pokoju w sercu, mądrych decyzji, zdrowia i nadziei, która nie zawodzi!',
      defaultWishEn: 'Wishing you a 2027 filled with God’s peace, wisdom, health and unshakeable hope!',
      wishesPl: [
        'Szczęśliwego Nowego Roku 2027! Niech Bóg prowadzi każdy Twój miesiąc w pokoju, zdrowiu i radości.',
        'Zostawmy za sobą troski starego roku — w 2027 idźmy z odwagą, wiarą i wdzięcznością!',
        'Obfitego Bożego błogosławieństwa dla całego Twojego domu w Nowym Roku 2027!'
      ],
      wishesEn: [
        'Happy New Year 2027! May God guide each month ahead with peace, health and joy.',
        'Stepping into 2027 with gratitude, courage and hope in Christ.',
        'Abundant blessings for you and your household throughout 2027!'
      ]
    }
  };

  var DICT = {
    pl: {
      skip: 'Przejdź do treści',
      tickBadge: 'E-Kartki CC · 24/7',
      brandSub: 'Muzyczne E-Kartki · 24/7',
      navOcc: 'Okazje',
      navCreate: 'Stwórz kartkę',
      navPromo: 'Polecamy',
      navSupport: 'Wspieram to',
      navStudio: 'Nowe Studio',
      navCta: 'Wspieram to',
      recBadge: 'Osobista Muzyczna E-Kartka Christian Culture',
      recClose: 'Wróć do kreatora',
      recPlayBtn: 'Otwórz kartkę i włącz piosenkę',
      recReply: 'Wyślij własną darmową kartkę ↓',
      recGiftAlbum: '🎁 Darmowy album 12 MP3',
      recRadio: 'Radio 24/7 bez reklam',
      heroBadge: 'Muzyczne E-Kartki CC · Urodziny • Dobrze, że jesteś • 2027',
      h1a: 'Wyślij serce',
      h1b: 'z muzyką wiary',
      heroLead: 'W 15 sekund stwórz darmową, imienną kartkę z piosenką urodzinową („Dziś Są Twoje Urodziny”), utworem „Dobrze, że jesteś” lub życzeniami na Nowy Rok 2027. Bez rejestracji, bez opłat i bez zbierania danych na serwerze.',
      ctaHeroCreate: 'Stwórz swoją kartkę ↓',
      ctaHeroListen: 'Posłuchaj piosenki urodzinowej ▶',
      trust1: '100% bezpłatnie i bez reklam',
      trust2: 'Imienna kartka w 1 linku',
      trust3: 'Słowo Boże (UBG) + muzyka CC',
      hcTag: 'Teraz wybrana kartka',
      occShortBirth: '🎂 Urodziny',
      occShortGood: '💛 Bliskim',
      occShortYear: '✨ 2027',
      stat1: 'wyjątkowe okazje muzyczne do wyboru',
      stat2: 'pieśni w darmowym albumie prezentowym MP3',
      stat3: 'całodobowych kanałów Radia i TV CC bez reklam',
      stat4: 'bez opłat, bez konta i bez śledzenia odbiorcy',
      occEyebrow: 'Krok 1 · Wybierz melodię serca',
      occTitle: 'Wybierz okazję swojej kartki',
      occLead: 'Każda kartka niesie autorską pieśń Christian Culture i błogosławieństwo z Pisma Świętego (UBG). Wybierz kartę, aby od razu spersonalizować życzenia.',
      badgeDaily: '365 dni w roku',
      badgeGift: 'Z darmowym albumem',
      badgeNewYear: 'Grudzień & Sylwester',
      occ1Title: 'Urodziny',
      occ1Track: 'Pieśń: „Dziś Są Twoje Urodziny”',
      occ1Desc: 'Radosna, pełna wdzięczności piosenka urodzinowa z błogosławieństwem z 4 Mojżeszowej 6,24–26.',
      occ2Title: 'Dobrze, że jesteś',
      occ2Track: 'Pieśń: „Dobrze, że jesteś” (3:25 MP3)',
      occ2Desc: 'Ciepłe podziękowanie dla mamy, taty, małżonka, przyjaciela albo kogoś, kto potrzebuje dziś otuchy.',
      occ3Title: 'Nowy Rok 2027',
      occ3Track: 'Pieśń: „Szczęśliwego Nowego Roku z Jezusem”',
      occ3Desc: 'Modlitwa o pokój, Boże prowadzenie i dobry nowy rok 2027 (Jeremiasza 29,11 UBG).',
      btnChooseCard: 'Wybierz tę kartkę',
      btnChosenCard: '✓ Wybrana kartka',
      crEyebrow: 'Krok 2 & 3 · Wpisz imię i wyślij link',
      crTitle: 'Spersonalizuj kartkę na żywo',
      crLead: 'Wpisz imię bliskiej osoby i swoje życzenia — gotowy link od razu zadziała na WhatsAppie, SMS-ie i w e-mailu.',
      lblFor: 'Dla kogo (imię odbiorcy)',
      lblFrom: 'Od kogo (Twój podpis)',
      lblWish: 'Twoje życzenia (maks. 280 znaków)',
      lblTemplates: 'Gotowe życzenia (1 kliknięcie):',
      lblVerse: 'Dołącz biblijne błogosławieństwo (przekład UBG)',
      privacyNote: 'Prywatność: treść kartki koduje się wyłącznie w samym linku — nie przechowujemy imion ani życzeń na serwerze.',
      actCopy: 'Skopiuj link kartki',
      actWa: 'Wyślij na WhatsApp',
      actShare: 'Udostępnij',
      actRecPreview: 'Podgląd oczami odbiorcy',
      ecoTitle: '★ Polecamy w ekosystemie Christian Culture',
      supEyebrow: 'Wspieram to · Wolne Media Boże',
      supTitle: 'Nawet jeśli dziś nie możesz wesprzeć nas złotówką — dobrze, że jesteś',
      supLead: 'Wszystkie e-kartki, Radio 24/7, Biblia Audio V7 i album „The Best of Christian Culture” są darmowe. Jeśli chcesz pomóc nam utrzymywać serwery i budować Nowe Studio RTV 4K, możesz dołożyć swoją cegiełkę.',
      supZrzutka: 'Zrzutka.pl (BLIK / Karta) ↗',
      supPatronite: 'Patronite (co miesiąc) ↗',
      supDirect: 'BLIK na tel. / Dane przelewu',
      supSharePage: 'Udostępnij tę stronę ↗',
      phFor: 'np. Ania, Mamo, Piotrze...',
      phFrom: 'np. Kasia i Marek',
      phWish: 'Wpisz własne życzenia albo kliknij gotowy wzór poniżej...',
      toastCopied: 'Skopiowano imienny link kartki do schowka!',
      toastShared: 'Udostępniono link do kartki!'
    },
    en: {
      skip: 'Skip to content',
      tickBadge: 'CC E-Cards · 24/7',
      brandSub: 'Musical E-Cards · 24/7',
      navOcc: 'Occasions',
      navCreate: 'Create Card',
      navPromo: 'Featured',
      navSupport: 'Support',
      navStudio: 'New Studio',
      navCta: 'Support Us',
      recBadge: 'Personal Musical E-Card · Christian Culture',
      recClose: 'Back to creator',
      recPlayBtn: 'Open card & play song',
      recReply: 'Create your own free card ↓',
      recGiftAlbum: '🎁 Free 12-Track MP3 Album',
      recRadio: 'Ad-free 24/7 Radio',
      heroBadge: 'CC Musical E-Cards · Birthday • Encouragement • 2027',
      h1a: 'Send a heartfelt',
      h1b: 'song of hope',
      heroLead: 'Create a free personalized musical e-card in 15 seconds with our birthday song, “Good That You Are Here”, or a 2027 New Year blessing. No sign-up, no fees, and zero personal data stored on servers.',
      ctaHeroCreate: 'Create Your Card ↓',
      ctaHeroListen: 'Listen to Birthday Song ▶',
      trust1: '100% free & ad-free',
      trust2: 'One-link personalization',
      trust3: 'Scripture blessing + CC music',
      hcTag: 'Selected card',
      occShortBirth: '🎂 Birthday',
      occShortGood: '💛 Love',
      occShortYear: '✨ 2027',
      stat1: 'musical occasions ready to personalize',
      stat2: 'songs in the free gift MP3 album',
      stat3: 'ad-free 24/7 Radio & TV channels',
      stat4: 'zero cost, zero login, zero tracking',
      occEyebrow: 'Step 1 · Pick a melody',
      occTitle: 'Choose your occasion',
      occLead: 'Each card carries an original Christian Culture song and a Scripture blessing. Select one to personalize your message right below.',
      badgeDaily: '365 days a year',
      badgeGift: 'Includes free album',
      badgeNewYear: 'New Year 2027',
      occ1Title: 'Birthday',
      occ1Track: 'Song: “Today Is Your Birthday”',
      occ1Desc: 'Joyful, grateful birthday song paired with the Numbers 6:24–26 blessing.',
      occ2Title: 'Good That You Are Here',
      occ2Track: 'Song: “Dobrze, że jesteś” (3:25 MP3)',
      occ2Desc: 'A warm thank-you for family, friends, or anyone who needs gentle encouragement today.',
      occ3Title: 'New Year 2027',
      occ3Track: 'Song: “Happy New Year with Jesus”',
      occ3Desc: 'A prayer for peace, guidance and a hope-filled 2027 (Jeremiah 29:11).',
      btnChooseCard: 'Select this card',
      btnChosenCard: '✓ Selected',
      crEyebrow: 'Steps 2 & 3 · Personalize & share',
      crTitle: 'Customize live preview',
      crLead: 'Enter the recipient’s name and your message — your custom link works instantly on WhatsApp, SMS, or email.',
      lblFor: 'For (recipient name)',
      lblFrom: 'From (your signature)',
      lblWish: 'Your message (max 280 chars)',
      lblTemplates: 'Quick wish templates (1 tap):',
      lblVerse: 'Include Scripture blessing',
      privacyNote: 'Privacy: your greeting is encoded only inside the share URL — we store no names or messages on our servers.',
      actCopy: 'Copy Card Link',
      actWa: 'Send via WhatsApp',
      actShare: 'Share',
      actRecPreview: 'Preview as Recipient',
      ecoTitle: '★ Featured in Christian Culture',
      supEyebrow: 'Support · Free Christian Media',
      supTitle: 'Even if you cannot give a penny today — we are glad you are here',
      supLead: 'All e-cards, 24/7 Radio, Audio Bible and gift albums remain free. If you would like to help keep our signal running and build our New 4K Studio, every gift helps.',
      supZrzutka: 'Zrzutka.pl ↗',
      supPatronite: 'Patronite (monthly) ↗',
      supDirect: 'Direct / IBAN / Revolut',
      supSharePage: 'Share this page ↗',
      phFor: 'e.g. Anna, Mom, Peter...',
      phFrom: 'e.g. Kate & Mark',
      phWish: 'Write your wishes or tap a quick template below...',
      toastCopied: 'Personalized card link copied!',
      toastShared: 'Card link shared!'
    }
  };

  var urlParams = new URLSearchParams(window.location.search);
  var state = {
    lang: urlParams.get('lang') === 'en' ? 'en' : 'pl',
    occasion: 'urodziny',
    forName: '',
    fromName: '',
    wish: '',
    includeVerse: true,
    isPreviewOpen: false
  };

  var toastEl = document.getElementById('ccToast');
  var toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  function trackGa(name, params) {
    try { if (window.gtag) window.gtag('event', name, params || {}); } catch (e) {}
  }

  // Base64url UTF-8 encode/decode for ?k=...
  function encodePayload(obj) {
    var json = JSON.stringify(obj);
    var bytes = new TextEncoder().encode(json);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decodePayload(str) {
    try {
      var b64 = String(str || '').replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      var bin = atob(b64);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (e) {
      return null;
    }
  }

  function clampStr(v, max) {
    return String(v == null ? '' : v).replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
  }

  function formatMmSs(sec) {
    var s = Math.max(0, Math.floor(Number(sec) || 0));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  // Unified Audio Controller (only 1 active audio/video at a time)
  var sharedAudio = new Audio();
  sharedAudio.preload = 'metadata';
  var activeTarget = null; // 'hero' | 'recipient'
  var activeCardId = null;

  var heroMediaBox = document.getElementById('heroMediaBox');
  var heroCoverImg = document.getElementById('heroCoverImg');
  var heroOverlayPlayBtn = document.getElementById('heroOverlayPlayBtn');
  var heroAudioBar = document.getElementById('heroAudioBar');
  var heroAudioToggle = document.getElementById('heroAudioToggle');
  var heroAudioSeek = document.getElementById('heroAudioSeek');
  var heroAudioTime = document.getElementById('heroAudioTime');
  var heroEq = document.getElementById('heroEq');

  var recMediaBox = document.getElementById('recipientMediaBox');
  var recCoverImg = document.getElementById('recCoverImg');
  var recMediaPlayBtn = document.getElementById('recMediaPlayBtn');
  var recAudioBar = document.getElementById('recAudioBar');
  var recAudioToggle = document.getElementById('recAudioToggle');
  var recAudioSeek = document.getElementById('recAudioSeek');
  var recAudioTime = document.getElementById('recAudioTime');
  var recAudioEq = document.getElementById('recAudioEq');

  function setToggleSvg(btn, isPause) {
    if (!btn) return;
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(ns, 'path');
    p.setAttribute('fill', 'currentColor');
    p.setAttribute('d', isPause ? 'M7 5h3.5v14H7zm6.5 0H17v14h-3.5z' : 'M8 5.5v13l11-6.5z');
    svg.appendChild(p);
    btn.replaceChildren(svg);
  }

  function stopAllMedia() {
    try { sharedAudio.pause(); } catch (e) {}
    if (heroEq) heroEq.classList.remove('is-playing');
    if (recAudioEq) recAudioEq.classList.remove('is-playing');
    setToggleSvg(heroAudioToggle, false);
    setToggleSvg(recAudioToggle, false);
    [heroMediaBox, recMediaBox].forEach(function (box) {
      if (!box) return;
      var oldFrame = box.querySelector('iframe');
      if (oldFrame) oldFrame.remove();
    });
    if (heroCoverImg) heroCoverImg.hidden = false;
    if (heroOverlayPlayBtn) heroOverlayPlayBtn.classList.remove('is-hidden');
    if (recCoverImg) recCoverImg.hidden = false;
    if (recMediaPlayBtn) recMediaPlayBtn.hidden = false;
    if (heroAudioBar) heroAudioBar.hidden = true;
    if (recAudioBar) recAudioBar.hidden = true;
    activeTarget = null;
  }

  function startMediaFor(cardId, target) {
    var card = CARDS[cardId] || CARDS.urodziny;
    var isHero = target === 'hero';
    var box = isHero ? heroMediaBox : recMediaBox;
    var cover = isHero ? heroCoverImg : recCoverImg;
    var overlayBtn = isHero ? heroOverlayPlayBtn : recMediaPlayBtn;
    var audioBar = isHero ? heroAudioBar : recAudioBar;
    var eq = isHero ? heroEq : recAudioEq;
    var toggleBtn = isHero ? heroAudioToggle : recAudioToggle;

    stopAllMedia();
    activeTarget = target;
    activeCardId = card.id;
    trackGa('kartka_play', { occasion: card.id, placement: target });

    if (card.type === 'youtube') {
      if (cover) cover.hidden = true;
      if (overlayBtn) {
        if (isHero) overlayBtn.classList.add('is-hidden');
        else overlayBtn.hidden = true;
      }
      var ifr = document.createElement('iframe');
      ifr.src = BIRTHDAY_YT_EMBED;
      ifr.title = state.lang === 'en' ? card.songEn : card.songPl;
      ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      ifr.allowFullscreen = true;
      ifr.referrerPolicy = 'strict-origin-when-cross-origin';
      box.appendChild(ifr);
      if (eq) eq.classList.add('is-playing');
      return;
    }

    if (audioBar) audioBar.hidden = false;
    if (overlayBtn) {
      if (isHero) overlayBtn.classList.add('is-hidden');
      else overlayBtn.hidden = true;
    }
    if (sharedAudio.getAttribute('data-src') !== card.audioSrc) {
      sharedAudio.src = card.audioSrc;
      sharedAudio.setAttribute('data-src', card.audioSrc);
    }
    sharedAudio.play().then(function () {
      if (eq) eq.classList.add('is-playing');
      setToggleSvg(toggleBtn, true);
    }).catch(function () {
      setToggleSvg(toggleBtn, false);
    });
  }

  function toggleAudioPausePlay(target) {
    if (!sharedAudio.src) return;
    var eq = target === 'hero' ? heroEq : recAudioEq;
    var btn = target === 'hero' ? heroAudioToggle : recAudioToggle;
    if (sharedAudio.paused) {
      sharedAudio.play().then(function () {
        if (eq) eq.classList.add('is-playing');
        setToggleSvg(btn, true);
      }).catch(function () {});
    } else {
      sharedAudio.pause();
      if (eq) eq.classList.remove('is-playing');
      setToggleSvg(btn, false);
    }
  }

  sharedAudio.addEventListener('timeupdate', function () {
    var dur = sharedAudio.duration || 0;
    var cur = sharedAudio.currentTime || 0;
    var pct = dur > 0 ? Math.min(100, (cur / dur) * 100) : 0;
    var label = formatMmSs(cur) + ' / ' + formatMmSs(dur);
    if (activeTarget === 'hero') {
      if (heroAudioSeek) heroAudioSeek.value = String(Math.round(pct));
      if (heroAudioTime) heroAudioTime.textContent = label;
    } else if (activeTarget === 'recipient') {
      if (recAudioSeek) recAudioSeek.value = String(Math.round(pct));
      if (recAudioTime) recAudioTime.textContent = label;
    }
  });
  sharedAudio.addEventListener('ended', function () {
    if (heroEq) heroEq.classList.remove('is-playing');
    if (recAudioEq) recAudioEq.classList.remove('is-playing');
    setToggleSvg(heroAudioToggle, false);
    setToggleSvg(recAudioToggle, false);
  });

  if (heroAudioToggle) heroAudioToggle.addEventListener('click', function () { toggleAudioPausePlay('hero'); });
  if (recAudioToggle) recAudioToggle.addEventListener('click', function () { toggleAudioPausePlay('recipient'); });
  [heroAudioSeek, recAudioSeek].forEach(function (inp) {
    if (!inp) return;
    inp.addEventListener('input', function () {
      var dur = sharedAudio.duration || 0;
      if (dur > 0) sharedAudio.currentTime = (Number(inp.value) / 100) * dur;
    });
  });

  // Form & Preview Elements
  var inputFor = document.getElementById('inputFor');
  var inputFrom = document.getElementById('inputFrom');
  var inputWish = document.getElementById('inputWish');
  var toggleVerse = document.getElementById('toggleVerse');
  var wishCharCount = document.getElementById('wishCharCount');
  var quickWishesEl = document.getElementById('quickWishes');

  function buildShareUrl(customState) {
    var s = customState || state;
    var payload = {
      o: s.occasion,
      t: clampStr(s.forName, 40),
      f: clampStr(s.fromName, 40),
      m: clampStr(s.wish, 280),
      v: s.includeVerse ? 1 : 0,
      l: s.lang
    };
    var base = window.location.origin + window.location.pathname;
    return base + '?k=' + encodePayload(payload);
  }

  function updateCreatorPreview() {
    var card = CARDS[state.occasion] || CARDS.urodziny;
    var isEn = state.lang === 'en';
    var forClean = clampStr(state.forName, 40) || (isEn ? 'Dear Friend' : 'Bliska Osoba');
    var fromClean = clampStr(state.fromName, 40) || 'Christian Culture';
    var wishClean = clampStr(state.wish, 280) || (isEn ? card.defaultWishEn : card.defaultWishPl);

    if (wishCharCount) wishCharCount.textContent = String((state.wish || '').length) + ' / 280';

    // Update Hero console cover when switching if idle
    if (activeTarget !== 'hero') {
      if (heroCoverImg) {
        heroCoverImg.src = card.img;
        heroCoverImg.width = card.imgW;
        heroCoverImg.height = card.imgH;
      }
      var heroTrackName = document.getElementById('heroTrackName');
      var heroTrackDuration = document.getElementById('heroTrackDuration');
      if (heroTrackName) heroTrackName.textContent = isEn ? card.songEn : card.songPl;
      if (heroTrackDuration) {
        heroTrackDuration.textContent = card.durationLabel + (isEn ? ' · Tap to listen' : ' · Kliknij, aby posłuchać');
      }
    }

    document.querySelectorAll('[data-pick-occasion]').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-pick-occasion') === card.id);
    });
    document.querySelectorAll('[data-occasion-card]').forEach(function (el) {
      var match = el.getAttribute('data-occasion-card') === card.id;
      el.classList.toggle('is-selected', match);
      var btn = el.querySelector('.occ-select-btn');
      if (btn) {
        btn.classList.toggle('btn--orange', match);
        btn.classList.toggle('btn--glass', !match);
        btn.textContent = match ? DICT[state.lang].btnChosenCard : DICT[state.lang].btnChooseCard;
      }
    });

    // Live Creator Card Preview (strictly .textContent for XSS safety)
    var prevImg = document.getElementById('prevImg');
    var prevOccTag = document.getElementById('prevOccTag');
    var prevMetaLine = document.getElementById('prevMetaLine');
    var prevHeading = document.getElementById('prevHeading');
    var prevWishText = document.getElementById('prevWishText');
    var prevVerseBox = document.getElementById('prevVerseBox');
    var prevVerseText = document.getElementById('prevVerseText');
    var prevVerseRef = document.getElementById('prevVerseRef');
    var prevSongLabel = document.getElementById('prevSongLabel');

    if (prevImg) { prevImg.src = card.img; prevImg.width = card.imgW; prevImg.height = card.imgH; }
    if (prevOccTag) prevOccTag.textContent = isEn ? card.tagEn : card.tagPl;
    if (prevMetaLine) {
      prevMetaLine.textContent = isEn
        ? ('For: ' + forClean + '  ·  From: ' + fromClean)
        : ('Dla: ' + forClean + '  ·  Od: ' + fromClean);
    }
    if (prevHeading) prevHeading.textContent = isEn ? card.headingEn : card.headingPl;
    if (prevWishText) prevWishText.textContent = wishClean;
    if (prevVerseBox) prevVerseBox.hidden = !state.includeVerse;
    if (prevVerseText) prevVerseText.textContent = isEn ? card.verseEn : card.versePl;
    if (prevVerseRef) prevVerseRef.textContent = isEn ? card.refEn : card.refPl;
    if (prevSongLabel) prevSongLabel.textContent = (isEn ? card.songEn : card.songPl) + ' ▶';

    // WhatsApp link
    var waBtn = document.getElementById('btnWhatsapp');
    if (waBtn) {
      var shareUrl = buildShareUrl();
      var waMsg = isEn
        ? ('🎁 Musical E-Card for ' + forClean + ' from ' + fromClean + ':\n' + shareUrl)
        : ('🎁 Muzyczna e-kartka dla: ' + forClean + ' (od: ' + fromClean + ') — otwórz i posłuchaj:\n' + shareUrl);
      waBtn.href = 'https://wa.me/?text=' + encodeURIComponent(waMsg);
    }
  }

  function renderQuickWishes() {
    if (!quickWishesEl) return;
    var card = CARDS[state.occasion] || CARDS.urodziny;
    var list = state.lang === 'en' ? card.wishesEn : card.wishesPl;
    quickWishesEl.replaceChildren();
    list.forEach(function (txt) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'qw-chip';
      b.textContent = txt.length > 62 ? txt.slice(0, 59) + '…' : txt;
      b.title = txt;
      b.addEventListener('click', function () {
        state.wish = txt;
        if (inputWish) inputWish.value = txt;
        updateCreatorPreview();
      });
      quickWishesEl.appendChild(b);
    });
  }

  function renderRecipientStage(data, allowClosePreview) {
    var card = CARDS[data.o] || CARDS.urodziny;
    var lang = data.l === 'en' ? 'en' : state.lang;
    var isEn = lang === 'en';
    var forClean = clampStr(data.t, 40) || (isEn ? 'Friend' : 'Bliska Osoba');
    var fromClean = clampStr(data.f, 40) || 'Christian Culture';
    var wishClean = clampStr(data.m, 280) || (isEn ? card.defaultWishEn : card.defaultWishPl);
    var showVerse = data.v !== 0;

    var stage = document.getElementById('recipientStage');
    var closeBtn = document.getElementById('recClosePreview');
    var metaLine = document.getElementById('recFromToLine');
    var heading = document.getElementById('recipientHeading');
    var wishEl = document.getElementById('recWishText');
    var verseBox = document.getElementById('recVerseBox');
    var verseTxt = document.getElementById('recVerseText');
    var verseRef = document.getElementById('recVerseRef');
    var coverImg = document.getElementById('recCoverImg');
    var songTitle = document.getElementById('recSongTitle');

    if (metaLine) {
      metaLine.textContent = isEn
        ? ('Musical E-Card from ' + fromClean + '  ·  For: ' + forClean)
        : ('Masz muzyczną kartkę od: ' + fromClean + '  ·  Dla: ' + forClean);
    }
    if (heading) heading.textContent = isEn ? card.headingEn : card.headingPl;
    if (wishEl) wishEl.textContent = wishClean;
    if (verseBox) verseBox.hidden = !showVerse;
    if (verseTxt) verseTxt.textContent = isEn ? card.verseEn : card.versePl;
    if (verseRef) verseRef.textContent = isEn ? card.refEn : card.refPl;
    if (coverImg) { coverImg.src = card.img; coverImg.width = card.imgW; coverImg.height = card.imgH; }
    if (songTitle) songTitle.textContent = (isEn ? card.songEn : card.songPl) + ' (' + card.durationLabel + ')';
    if (closeBtn) closeBtn.hidden = !allowClosePreview;

    if (stage) {
      stage.hidden = false;
      stage.setAttribute('data-active-occasion', card.id);
    }

    var recOpenPlayBtn = document.getElementById('recOpenPlayBtn');
    if (recOpenPlayBtn) recOpenPlayBtn.onclick = function () { startMediaFor(card.id, 'recipient'); };
    if (recMediaPlayBtn) recMediaPlayBtn.onclick = function () { startMediaFor(card.id, 'recipient'); };
  }

  function selectOccasion(id, stopPlaying) {
    if (!CARDS[id]) return;
    if (stopPlaying && activeTarget === 'hero' && activeCardId !== id) stopAllMedia();
    state.occasion = id;
    renderQuickWishes();
    updateCreatorPreview();
    trackGa('kartka_select', { occasion: id });
  }

  function applyLang(lang) {
    state.lang = lang === 'en' ? 'en' : 'pl';
    document.documentElement.lang = state.lang;
    var dict = DICT[state.lang];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (dict[k]) el.textContent = dict[k];
    });
    if (inputFor) inputFor.placeholder = dict.phFor;
    if (inputFrom) inputFrom.placeholder = dict.phFrom;
    if (inputWish) inputWish.placeholder = dict.phWish;
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === state.lang;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    renderQuickWishes();
    updateCreatorPreview();
    mountEcoBars();
  }

  // CCEco Ticker & ★ Polecamy
  function mountEcoBars() {
    if (!window.CCEco) return;
    var tickEl = document.getElementById('tickRun');
    var pl = state.lang !== 'en';
    var items = pl ? [
      { id: 'urodziny', b: 'E-KARTKI CC', t: 'Wyślij piosenkę urodzinową <strong>Dziś Są Twoje Urodziny</strong>', href: '#okazje', cc: true },
      { id: 'album', b: 'PREZENT', t: 'Darmowy album <strong>The Best of Christian Culture (12 MP3)</strong>', href: 'https://drive.google.com/drive/folders/1GIUc1GlNmByFBDCmjmJN4PSukewnzYTc' },
      { id: 'radio', b: 'RADIO 24/7', t: 'Bez reklam na <strong>polskieradio.cc</strong>', href: '/' },
      { id: 'biblia', b: 'BIBLIA AUDIO V7', t: 'Rozdziały Księgi Rodzaju w studyjnej jakości', href: '/biblia-audio' },
      { id: 'akademia', b: 'AKADEMIA', t: 'Kurs Codzienny <strong>Z Biblią za Pan Brat</strong>', href: '/akademia/kurscodzienny' }
    ] : [
      { id: 'urodziny', b: 'CC E-CARDS', t: 'Send a free musical card <strong>Today Is Your Birthday</strong>', href: '#okazje', cc: true },
      { id: 'album', b: 'FREE GIFT', t: 'Download <strong>The Best of Christian Culture (12 MP3)</strong>', href: 'https://drive.google.com/drive/folders/1GIUc1GlNmByFBDCmjmJN4PSukewnzYTc' },
      { id: 'radio', b: '24/7 RADIO', t: 'Ad-free worship & Scripture at <strong>polskieradio.cc</strong>', href: '/' },
      { id: 'wspieramto', b: 'PATRONAGE', t: 'Support free Christian media at <strong>WspieramTO</strong>', href: '/wspieramto' }
    ];
    window.CCEco.mountTicker(tickEl, items, 'kartki_preview');
    window.CCEco.mountPromo(
      document.getElementById('promoStage'),
      document.getElementById('promoDots'),
      document.getElementById('promoBar'),
      state.lang,
      'kartki_preview',
      10000
    );
  }

  // Event bindings
  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { applyLang(btn.getAttribute('data-lang')); });
  });
  document.querySelectorAll('[data-pick-occasion]').forEach(function (btn) {
    btn.addEventListener('click', function () { selectOccasion(btn.getAttribute('data-pick-occasion'), true); });
  });
  document.querySelectorAll('.occ-select-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectOccasion(btn.getAttribute('data-select-occasion'), true);
      var target = document.getElementById('kreator');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  if (heroOverlayPlayBtn) heroOverlayPlayBtn.addEventListener('click', function () { startMediaFor(state.occasion, 'hero'); });
  var heroPlayBirthdayBtn = document.getElementById('heroPlayBirthdayBtn');
  if (heroPlayBirthdayBtn) {
    heroPlayBirthdayBtn.addEventListener('click', function () {
      selectOccasion('urodziny', true);
      startMediaFor('urodziny', 'hero');
    });
  }
  var prevPlayBtn = document.getElementById('prevPlayBtn');
  if (prevPlayBtn) {
    prevPlayBtn.addEventListener('click', function () {
      startMediaFor(state.occasion, 'hero');
      var wrap = document.getElementById('heroPreviewWrap');
      if (wrap) wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  if (inputFor) inputFor.addEventListener('input', function () { state.forName = inputFor.value; updateCreatorPreview(); });
  if (inputFrom) inputFrom.addEventListener('input', function () { state.fromName = inputFrom.value; updateCreatorPreview(); });
  if (inputWish) inputWish.addEventListener('input', function () { state.wish = inputWish.value; updateCreatorPreview(); });
  if (toggleVerse) toggleVerse.addEventListener('change', function () { state.includeVerse = toggleVerse.checked; updateCreatorPreview(); });

  var btnCopyLink = document.getElementById('btnCopyLink');
  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', function () {
      var shareUrl = buildShareUrl();
      trackGa('kartka_copy_link', { occasion: state.occasion });
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(function () { showToast(DICT[state.lang].toastCopied); }).catch(function () { showToast(shareUrl); });
      } else {
        showToast(shareUrl);
      }
    });
  }

  var btnWhatsapp = document.getElementById('btnWhatsapp');
  if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', function () {
      trackGa('kartka_share_whatsapp', { occasion: state.occasion });
    });
  }

  function webShareUrl(url, title, text) {
    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url }).then(function () {
        showToast(DICT[state.lang].toastShared);
      }).catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { showToast(DICT[state.lang].toastCopied); }).catch(function () {});
    }
  }

  var btnShareLink = document.getElementById('btnShareLink');
  if (btnShareLink) {
    btnShareLink.addEventListener('click', function () {
      var shareUrl = buildShareUrl();
      webShareUrl(shareUrl, document.title, CARDS[state.occasion].headingPl);
    });
  }

  var btnSharePage = document.getElementById('btnSharePage');
  if (btnSharePage) {
    btnSharePage.addEventListener('click', function () {
      webShareUrl(window.location.origin + window.location.pathname, document.title, document.title);
    });
  }

  var btnPreviewRecipient = document.getElementById('btnPreviewRecipient');
  if (btnPreviewRecipient) {
    btnPreviewRecipient.addEventListener('click', function () {
      renderRecipientStage({
        o: state.occasion,
        t: state.forName,
        f: state.fromName,
        m: state.wish,
        v: state.includeVerse ? 1 : 0,
        l: state.lang
      }, true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  var recClosePreview = document.getElementById('recClosePreview');
  if (recClosePreview) {
    recClosePreview.addEventListener('click', function () {
      stopAllMedia();
      var stage = document.getElementById('recipientStage');
      if (stage) stage.hidden = true;
      var cr = document.getElementById('kreator');
      if (cr) cr.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Mobile Menu Drawer + Esc + keyboard audio shortcuts
  var burgerBtn = document.getElementById('burgerBtn');
  var menu = document.getElementById('menu');
  function closeMenu() {
    if (!menu || !burgerBtn) return;
    menu.classList.remove('is-open');
    burgerBtn.setAttribute('aria-expanded', 'false');
  }
  if (burgerBtn && menu) {
    burgerBtn.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if ((e.key === ' ' || e.key === 'k' || e.key === 'K') && sharedAudio.src && activeTarget) {
      e.preventDefault();
      toggleAudioPausePlay(activeTarget);
    } else if ((e.key === 'm' || e.key === 'M') && sharedAudio.src) {
      sharedAudio.muted = !sharedAudio.muted;
    }
  });

  // Scroll Progress + Reveal + Drum Roll Counters
  var scrollBar = document.getElementById('scrollProgressBar');
  function updateScrollProgress() {
    if (!scrollBar) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0;
    scrollBar.style.width = p.toFixed(1) + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (ent) {
        if (ent.isIntersecting) {
          ent.target.classList.add('is-in');
          io.unobserve(ent.target);
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach(function (r) { io.observe(r); });
    setTimeout(function () { reveals.forEach(function (r) { r.classList.add('is-in'); }); }, 2200);
  } else {
    reveals.forEach(function (r) { r.classList.add('is-in'); });
  }

  // Drum-roll counters on view
  document.querySelectorAll('.reel[data-target]').forEach(function (el) {
    var target = Number(el.getAttribute('data-target') || 0);
    if (!target || !('IntersectionObserver' in window)) return;
    var done = false;
    var cio = new IntersectionObserver(function (entries) {
      if (done || !entries[0].isIntersecting) return;
      done = true;
      cio.disconnect();
      var start = performance.now();
      var dur = 900;
      (function step(now) {
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(eased * target));
        if (t < 1) requestAnimationFrame(step);
      })(start);
    }, { threshold: 0.25 });
    cio.observe(el);
  });

  // Mouse spotlight + gentle 3D tilt (desktop pointer only, reduced motion safe)
  var isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isTouch && !reduced) {
    var heroSpot = document.getElementById('heroSpotlight');
    var heroSec = document.getElementById('heroStage');
    if (heroSec && heroSpot) {
      heroSec.addEventListener('pointermove', function (e) {
        var r = heroSec.getBoundingClientRect();
        heroSpot.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        heroSpot.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    }
    document.querySelectorAll('.magic-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var dx = ((e.clientX - r.left) / r.width - 0.5) * 8;
        var dy = ((e.clientY - r.top) / r.height - 0.5) * -8;
        card.style.transform = 'perspective(900px) rotateX(' + dy.toFixed(2) + 'deg) rotateY(' + dx.toFixed(2) + 'deg)';
      });
      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
      });
    });
  }

  // Hero Canvas Particles (<= 30fps, pauses when hidden or off-screen)
  var canvas = document.getElementById('heroParticles');
  if (canvas && canvas.getContext) {
    var ctx2d = canvas.getContext('2d');
    var pts = [];
    var heroVisible = true;
    var rafId = 0;
    var lastFrame = 0;
    function resizeCanvas() {
      var dpr = Math.min(1.5, window.devicePixelRatio || 1);
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      pts = [];
      var count = Math.min(34, Math.max(16, Math.floor(rect.width / 38)));
      for (var i = 0; i < count; i++) {
        pts.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: (Math.random() * 1.8 + 0.8) * dpr,
          vx: (Math.random() - 0.5) * (reduced ? 0.14 : 0.3),
          vy: -(Math.random() * (reduced ? 0.14 : 0.35) + 0.08),
          a: Math.random() * 0.55 + 0.2
        });
      }
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    if ('IntersectionObserver' in window) {
      var pIo = new IntersectionObserver(function (entries) { heroVisible = entries[0].isIntersecting; }, { threshold: 0.02 });
      pIo.observe(canvas);
    }
    function drawParticles(now) {
      rafId = requestAnimationFrame(drawParticles);
      if (document.hidden || !heroVisible || now - lastFrame < 34) return;
      lastFrame = now;
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx2d.fillStyle = i % 3 === 0 ? 'rgba(255,122,0,' + p.a + ')' : 'rgba(235,214,159,' + p.a + ')';
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx2d.fill();
      }
    }
    rafId = requestAnimationFrame(drawParticles);
  }

  // Init from URL (?k=... or ?okazja=...)
  var kParam = urlParams.get('k');
  var okParam = urlParams.get('okazja');
  var incoming = kParam ? decodePayload(kParam) : null;
  if (!incoming && okParam && CARDS[okParam]) {
    incoming = {
      o: okParam,
      t: urlParams.get('dla') || '',
      f: urlParams.get('od') || '',
      m: urlParams.get('tresc') || '',
      v: urlParams.get('werset') === '0' ? 0 : 1,
      l: urlParams.get('lang') || state.lang
    };
  }
  if (incoming && CARDS[incoming.o]) {
    state.occasion = incoming.o;
    state.lang = incoming.l === 'en' ? 'en' : state.lang;
    renderRecipientStage(incoming, false);
    trackGa('kartka_open_received', { occasion: incoming.o });
  }

  applyLang(state.lang);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountEcoBars);
  } else {
    mountEcoBars();
  }
})();
