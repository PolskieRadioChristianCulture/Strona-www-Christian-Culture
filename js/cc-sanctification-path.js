/* ==========================================================================
   CC INTERAKTYWNY WERSET DNIA + INTELIGENTNA ŚCIEŻKA UŚWIĘCENIA + „WIĘCEJ”
   Dynamicznie czyta /rozwazania_baza.json (strefa Europe/Warsaw), adaptuje się
   do wybranej potrzeby użytkownika oraz pory dnia i zapamiętuje serię powrotów.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'cc_sanctification_state_v1';

  function getWarsawNowInfo() {
    var now = new Date();
    var dateStr = now.toISOString().slice(0, 10);
    var hour = now.getHours();
    try {
      dateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Warsaw',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(now);
      hour = Number(new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Warsaw',
        hour12: false,
        hour: '2-digit'
      }).format(now)) % 24;
    } catch (_) {}
    var phase = hour < 11 ? 'morning' : (hour < 18 ? 'day' : 'evening');
    return { dateStr: dateStr, hour: hour, phase: phase };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (_) {}
    return { need: 'peace', checksByDate: {}, prayersByDate: {} };
  }

  function saveState(st) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
    } catch (_) {}
  }

  function calcStreak(checksByDate, todayStr) {
    var count = 0;
    var base = new Date(todayStr + 'T12:00:00Z');
    for (var i = 0; i < 60; i++) {
      var d = new Date(base.getTime() - i * 86400000);
      var key = d.toISOString().slice(0, 10);
      var arr = checksByDate && checksByDate[key];
      if (Array.isArray(arr) && arr.length > 0) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  }

  function iconSvg(kind) {
    var s = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    if (kind === 'peace') return s + '<path d="M12 22c5-4 8-8 8-13a8 8 0 1 0-16 0c0 5 3 9 8 13z"/><path d="M12 8v6"/><path d="M9 11h6"/></svg>';
    if (kind === 'study') return s + '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
    if (kind === 'prayer') return s + '<path d="M12 3v4"/><path d="M7.5 14.5 12 7l4.5 7.5"/><path d="M5 21h14"/></svg>';
    if (kind === 'family') return s + '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/></svg>';
    return s + '<path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="M4.9 4.9l2.9 2.9"/><path d="M2 12h4"/><circle cx="12" cy="12" r="4"/></svg>';
  }

  var NEEDS = [
    { id: 'peace',   icon: 'peace',   label: 'Pokój i ukojenie' },
    { id: 'study',   icon: 'study',   label: 'Poznanie Biblii' },
    { id: 'prayer',  icon: 'prayer',  label: 'Modlitwa i bliskość' },
    { id: 'family',  icon: 'family',  label: 'Rodzina i decyzje' },
    { id: 'mission', icon: 'mission', label: 'Świadectwo i misja' }
  ];

  function buildPathSteps(need, phase, reflection) {
    var day = reflection && reflection.day ? reflection.day : '';
    var reading = reflection && reflection.reading ? reflection.reading : '';
    var lessonUrl = day ? '/akademia/kurscodzienny/dzien-' + day : '/akademia/kurscodzienny';
    var bibleUrl = reading ? '/mojabiblia?ref=' + encodeURIComponent(reading) : '/mojabiblia';

    var timeLabel = phase === 'morning' ? 'Rano ze Słowem' : (phase === 'day' ? 'W rytmie dnia' : 'Wyciszenie wieczorne');

    var catalog = {
      peace: [
        {
          id: 'word',
          kicker: 'Krok 1 · ' + timeLabel,
          title: 'Zatrzymaj się przy obietnicy z ' + (reading || 'Pisma Świętego'),
          desc: 'Przeczytaj dzisiejszy fragment w MojaBiblia (UBG) i oddaj Bogu ciężar dzisiejszych spraw.',
          cta: 'Otwórz w MojaBiblia',
          url: bibleUrl
        },
        {
          id: 'audio',
          kicker: 'Krok 2 · Muzyka i ukojenie',
          title: phase === 'evening' ? 'Wycisz serce przy Nocnym Czuwaniu & Psalmach' : 'Włącz Spiritual Sounds 24/7 w tle dnia',
          desc: 'Biblijne psalmy i kojące brzmienia bez reklam — pomoc w opanowaniu stresu i gonitwy myśli.',
          cta: phase === 'evening' ? 'Kanał 24/7 Pokój' : 'Słuchaj Spiritual Sounds',
          url: phase === 'evening' ? '/nocne-czuwanie-live.html' : '/SpiritualSounds'
        },
        {
          id: 'psych',
          kicker: 'Krok 3 · Odnowienie myśli',
          title: 'Wiedza o emocjach w świetle Ewangelii',
          desc: 'Praktyczne artykuły o wychodzeniu z lęku, presji i przemęczenia na portalu CCN Psychologia.',
          cta: 'Przejdź do CCN Psychologia',
          url: '/psychologia'
        },
        {
          id: 'support',
          kicker: 'Krok 4 · Wspólnota i wstawiennictwo',
          title: 'Nie nieś tego sam — zostaw intencję lub porozmawiaj',
          desc: 'Złóż prośbę o modlitwę na Ścianie Modlitwy albo porozmawiaj z asystentką Noemi w LUMI.',
          cta: 'Ściana Modlitwy',
          url: '/modlitwa'
        }
      ],
      study: [
        {
          id: 'lesson',
          kicker: 'Krok 1 · Akademia Biblijna',
          title: (day ? 'Dzień ' + day + ': ' : '') + 'Dzisiejsza lekcja „Z Biblią za Pan Brat”',
          desc: '10 minut głębokiego komentarza werset po wersecie wraz z kontekstem historycznym i zadaniem.',
          cta: 'Studiuj lekcję',
          url: lessonUrl
        },
        {
          id: 'interlinear',
          kicker: 'Krok 2 · Kody Stronga i przekłady',
          title: 'Zbadaj znaczenie słów w oryginale (' + (reading || 'MojaBiblia') + ')',
          desc: 'Sprawdź greckie i hebrajskie źródłosłowy oraz porównaj UBG z Biblią Warszawską i Gdańską.',
          cta: 'Analizuj w MojaBiblia',
          url: bibleUrl
        },
        {
          id: 'bibleaudio',
          kicker: 'Krok 3 · Osłuchanie ze Słowem',
          title: phase === 'evening' ? 'Słuchaj Biblii Audio w wyciszeniu wieczoru' : 'Posłuchaj całego rozdziału w Biblii Audio',
          desc: 'Profesjonalne słuchowisko biblijne — idealne w drodze, w pracy i w domu.',
          cta: 'Otwórz Biblię Audio',
          url: '/biblia-audio'
        },
        {
          id: 'prophecy',
          kicker: 'Krok 4 · Kontekst całej Biblii',
          title: 'Wykłady „Apokalipsa: Księga Nadziei” i Apologetyka',
          desc: 'Połącz dzisiejsze studium z szerszym planem Bożego zbawienia i odpowiedziami na trudne pytania.',
          cta: 'Kurs Apokalipsa',
          url: '/kursy/apokalipsa/'
        }
      ],
      prayer: [
        {
          id: 'verse',
          kicker: 'Krok 1 · Rozmowa z Ojcem',
          title: 'Zamień dzisiejszy werset w swoją modlitwę',
          desc: 'Wróć do wersetu powyżej, zapisz jedno własne zdanie modlitwy i módl się nim przez dzień.',
          cta: 'Czytaj w MojaBiblia',
          url: bibleUrl
        },
        {
          id: 'worship',
          kicker: 'Krok 2 · Uwielbienie i dziękczynienie',
          title: 'Wejdź w uwielbienie przy Biblii Śpiewanej',
          desc: 'Pieśni oparte dosłownie na Psalmach i Słowie Bożym — pomoc w skupieniu serca na Bogu.',
          cta: 'Oglądaj / Słuchaj 24/7',
          url: '/biblia-spiewana-live.html'
        },
        {
          id: 'dzj',
          kicker: 'Krok 3 · Formacja ducha',
          title: 'Otwórz pełne rozważanie „Dobrze, że jesteś”',
          desc: 'Rozwiń modlitwę dnia, zadanie taktyczne oraz błogosławieństwo dla Twojego domu.',
          cta: 'Zobacz całość w Akademii',
          url: lessonUrl
        },
        {
          id: 'community_pray',
          kicker: 'Krok 4 · Jedność w Chrystusie',
          title: 'Módl się z innymi na Ścianie Modlitwy i w LUMI',
          desc: 'Dołącz do wspólnej modlitwy o Polskę, rodziny i misję albo napisz w LUMI Messenger.',
          cta: 'Dołącz do modlitwy',
          url: '/modlitwa'
        }
      ],
      family: [
        {
          id: 'holos',
          kicker: 'Krok 1 · Mądry rytm dnia i relacji',
          title: 'Zastosuj Słowo w 5 sektorach życia (HOLOS)',
          desc: 'Połącz dzisiejszy werset z uporządkowaniem czasu, pracy, odpoczynku i celów rodzinnych.',
          cta: 'Otwórz HOLOS',
          url: '/holos'
        },
        {
          id: 'marriages',
          kicker: 'Krok 2 · Małżeństwo, wychowanie i dom',
          title: 'Biblijna mądrość dla relacji i finansów',
          desc: 'Sprawdź praktyczne przewodniki o małżeństwie, wychowaniu dzieci i uczciwym zarządzaniu.',
          cta: 'CCN Małżeństwo & Dom',
          url: '/seks'
        },
        {
          id: 'vod',
          kicker: 'Krok 3 · Wartościowy czas razem',
          title: phase === 'evening' ? 'Wieczór filmowy z rodziną w Kinie VOD CC' : 'Wybierz inspirujący film w Kinie VOD CC',
          desc: 'Bezpłatne chrześcijańskie filmy fabularne i dokumenty budujące wiarę całej rodziny.',
          cta: 'Otwórz Kino VOD',
          url: '/vod'
        },
        {
          id: 'pastor',
          kicker: 'Krok 4 · Wsparcie duszpasterskie',
          title: 'Rozmowa lub wspólnota LUMINA dla całej rodziny',
          desc: 'Potrzebujesz mądrej rady dla domu? Odezwij się do społeczności lub Zespołu CC.',
          cta: 'Społeczność LUMINA',
          url: '/lumina'
        }
      ],
      mission: [
        {
          id: 'equip',
          kicker: 'Krok 1 · Zbroja Słowa',
          title: 'Ugruntuj w sobie dzisiejsze poselstwo (Dzień ' + (day || 'Dziś') + ')',
          desc: 'Poznaj argumenty i kontekst dzisiejszego fragmentu, aby dzielić się Ewangelią pewnie i z łagodnością.',
          cta: 'Pełne studium lekcji',
          url: lessonUrl
        },
        {
          id: 'cards',
          kicker: 'Krok 2 · Narzędzie w kieszeni',
          title: 'Rozdawaj Dobre Słowo — Wizytówki CC',
          desc: 'Zamów darmowe wizytówki Christian Culture lub poleć znajomym swoją ulubioną stację.',
          cta: 'Zobacz Wizytówki CC',
          url: '/wizytowki'
        },
        {
          id: 'nadawaj',
          kicker: 'Krok 3 · Twoja antena i transmisja',
          title: 'Udostępnij gotowe kanały TV 24/7 i Radio',
          desc: 'Podziel się transmisją Master, TopTEN lub filmem VOD w swoich mediach i grupach.',
          cta: 'Kanały do udostępnienia',
          url: '/nadawaj'
        },
        {
          id: 'support_mission',
          kicker: 'Krok 4 · Wzrost zasięgu',
          title: 'Stań ramię w ramię z misją „Celujemy w Milion”',
          desc: 'Wspieraj rozwój darmowych portali, Biblii Audio i ewangelizacji modlitwą, poleceniem lub patronatem.',
          cta: 'Wspieram to',
          url: '/wspieraj'
        }
      ]
    };

    return catalog[need] || catalog.peace;
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function pickReflection(list, todayStr) {
    if (!Array.isArray(list) || !list.length) return null;
    var exact = list.find(function (x) { return x && x.date === todayStr; });
    if (exact) return exact;
    var sorted = list
      .filter(function (x) { return x && x.date; })
      .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    return sorted[0] || list[0];
  }

  function extractVerseInfo(reflection) {
    if (!reflection) {
      return {
        quote: '„Słowo Twoje jest pochodnią nogom moim i światłością na ścieżce mojej.”',
        refLabel: 'Ps 119:105 (UBG)',
        refUrl: '/mojabiblia'
      };
    }
    var mv = String(reflection.memoryVerse || '').trim();
    if (!mv && reflection.contentWeb) {
      var m = String(reflection.contentWeb).match(/„[^”]{15,280}”\s*\([^)]+\)/);
      if (m) mv = m[0];
    }
    var reading = reflection.reading || '';
    var refLabel = reading ? reading + ' · MojaBiblia (UBG)' : 'Czytaj w MojaBiblia (UBG)';
    var refUrl = reading ? '/mojabiblia?ref=' + encodeURIComponent(reading) : '/mojabiblia';
    return {
      quote: mv || '„Gdyż Bóg jest tym, który sprawia w was i chcenie, i wykonanie według jego upodobania.” (Flp 2:13, UBG)',
      refLabel: refLabel,
      refUrl: refUrl
    };
  }

  function speakTextPolish(text, btn) {
    if (!('speechSynthesis' in window)) {
      window.location.href = '/biblia-audio';
      return;
    }
    try {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Posłuchaj';
        return;
      }
      var utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'pl-PL';
      utter.rate = 0.96;
      if (btn) btn.innerHTML = '<i class="fa-solid fa-stop"></i> Zatrzymaj głos';
      utter.onend = function () {
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Posłuchaj';
      };
      utter.onerror = function () {
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Posłuchaj';
      };
      window.speechSynthesis.speak(utter);
    } catch (_) {
      window.location.href = '/biblia-audio';
    }
  }

  function initMoreToggle() {
    var btn = document.getElementById('ccMoreArchiveToggle');
    var wrap = document.getElementById('ccMoreSectionsWrapper');
    if (!btn || !wrap) return;

    function setOpen(open) {
      wrap.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.innerHTML = open
        ? '<i class="fa-solid fa-chevron-up"></i> Zwiń dodatkowe sekcje CC (9)'
        : '<i class="fa-solid fa-layer-group"></i> Więcej zasobów i informacji CC (9)';
    }

    btn.addEventListener('click', function () {
      setOpen(wrap.hidden);
      if (!wrap.hidden) {
        setTimeout(function () {
          wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      }
    });

    function revealIfInside(hash) {
      if (!hash || hash.length < 2) return;
      try {
        var el = document.querySelector(hash);
        if (el && wrap.contains(el)) {
          setOpen(true);
          var sec = el.classList.contains('collapsible-section') ? el : el.closest('.collapsible-section');
          if (sec && !sec.classList.contains('is-open')) {
            var trig = sec.querySelector('.collapsible-trigger-bar');
            if (trig) trig.click();
          }
          setTimeout(function () {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 120);
        }
      } catch (_) {}
    }

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href*="#"]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        revealIfInside(href);
        try {
          var t = document.querySelector(href);
          if (t && wrap.hidden === false) return;
          if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (_) {}
      }
    });

    if (window.location.hash) {
      setTimeout(function () { revealIfInside(window.location.hash); }, 180);
    }
  }

  function initSanctificationWidget() {
    var verseNode = document.getElementById('ccDailyVerseNode');
    var mapNode = document.getElementById('ccSanctificationMap');
    if (!verseNode || !mapNode) return;

    var info = getWarsawNowInfo();
    var state = loadState();
    var activeReflection = null;

    function renderWeekDots(streak) {
      var dayLabels = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
      var base = new Date(info.dateStr + 'T12:00:00Z');
      var html = '';
      for (var i = 6; i >= 0; i--) {
        var d = new Date(base.getTime() - i * 86400000);
        var key = d.toISOString().slice(0, 10);
        var dow = dayLabels[d.getUTCDay()];
        var doneArr = state.checksByDate && state.checksByDate[key];
        var isDone = Array.isArray(doneArr) && doneArr.length > 0;
        var isToday = i === 0;
        html += '<div class="cc-day-dot' + (isDone ? ' is-completed' : '') + (isToday ? ' is-today' : '') + '" title="' + key + '">' +
          '<span>' + dow + '</span>' +
          '<span>' + (isDone ? '✓' : (isToday ? '●' : '·')) + '</span>' +
        '</div>';
      }
      return html;
    }

    function renderVerse(reflection) {
      var dayBadge = reflection && reflection.day ? 'Dzień ' + reflection.day : info.dateStr;
      var rawTitle = reflection && reflection.title ? String(reflection.title).replace(/^☀️\s*/, '') : 'Codzienne Rozważanie — Dobrze, że jesteś';
      var teaser = reflection && (reflection.teaser || reflection.theme)
        ? String(reflection.teaser || reflection.theme).split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')
        : 'Otwórz serce na dzisiejsze Słowo Boże i rozpocznij swój kolejny krok uświęcenia.';
      var verse = extractVerseInfo(reflection);
      var lessonUrl = reflection && reflection.day ? '/akademia/kurscodzienny/dzien-' + reflection.day : '/akademia/kurscodzienny';
      var savedPrayer = (state.prayersByDate && state.prayersByDate[info.dateStr]) || '';
      var streak = calcStreak(state.checksByDate, info.dateStr);

      verseNode.innerHTML =
        '<div class="cc-verse-header" id="ccVerseHeader">' +
          '<div class="cc-verse-node-top">' +
            '<span class="cc-verse-badge"><i class="fa-solid fa-sun"></i> Werset Dnia · ' + escapeHtml(dayBadge) + '</span>' +
            '<span class="cc-streak-pill" title="Liczba kolejnych dni aktywności na ścieżce"><i class="fa-solid fa-fire"></i> Seria: ' + streak + (streak === 1 ? ' dzień' : ' dni') + '</span>' +
          '</div>' +
          '<p class="cc-verse-theme-title">' + escapeHtml(rawTitle) + '</p>' +
        '</div>' +
        '<blockquote class="cc-verse-quote">' + escapeHtml(verse.quote) + '</blockquote>' +
        '<div class="cc-verse-meta-row">' +
          '<a class="cc-verse-ref-link" href="' + escapeHtml(verse.refUrl) + '"><i class="fa-solid fa-book-bible"></i> ' + escapeHtml(verse.refLabel) + '</a>' +
        '</div>' +
        '<p class="cc-verse-teaser">' + escapeHtml(teaser) + '</p>' +
        '<div class="cc-verse-actions">' +
          '<button type="button" class="cc-btn-orange" id="ccVerseSpeakBtn"><i class="fa-solid fa-play"></i> Posłuchaj</button>' +
          '<a class="cc-btn-glass" href="' + escapeHtml(lessonUrl) + '"><i class="fa-solid fa-graduation-cap"></i> Pełna lekcja (' + escapeHtml(dayBadge) + ')</a>' +
          '<button type="button" class="cc-btn-glass" id="ccVersePrayerToggleBtn"><i class="fa-solid fa-hands-praying"></i> Moja modlitwa na dziś</button>' +
          '<button type="button" class="cc-btn-glass" id="ccVerseShareBtn"><i class="fa-solid fa-share-nodes"></i> Udostępnij</button>' +
        '</div>' +
        '<div class="cc-verse-prayer-box' + (savedPrayer ? ' is-open' : '') + '" id="ccVersePrayerBox">' +
          '<div class="cc-prayer-input-row">' +
            '<input type="text" class="cc-prayer-input" id="ccVersePrayerInput" maxlength="240" placeholder="Zapisz jedno zdanie modlitwy lub postanowienia na dziś..." value="' + escapeHtml(savedPrayer) + '">' +
            '<button type="button" class="cc-btn-glass" id="ccVersePrayerSaveBtn"><i class="fa-solid fa-check"></i> Zapisz u siebie</button>' +
          '</div>' +
          '<div class="cc-prayer-saved-msg" id="ccVersePrayerSavedMsg">' + (savedPrayer ? 'Zapisano na Twoim urządzeniu dla ' + info.dateStr : '') + '</div>' +
        '</div>';

      // Automatyczne płynne zwijanie nagłówka po 3 sekundach obecności w polu widzenia
      var verseHeaderEl = document.getElementById('ccVerseHeader');
      if (verseHeaderEl) {
        var headerHideTimer = null;
        var hasStartedHide = false;
        var scheduleHeaderHide = function () {
          if (hasStartedHide) return;
          hasStartedHide = true;
          if (headerHideTimer) clearTimeout(headerHideTimer);
          headerHideTimer = setTimeout(function () {
            if (verseHeaderEl) {
              verseHeaderEl.classList.add('is-hidden');
            }
          }, 3000);
        };

        // Sprawdź czy karta już jest widoczna w oknie
        var rect = verseNode.getBoundingClientRect();
        var isInView = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInView) {
          scheduleHeaderHide();
        } else if (typeof IntersectionObserver !== 'undefined') {
          var headerObs = new IntersectionObserver(function (entries) {
            if (entries[0] && entries[0].isIntersecting) {
              scheduleHeaderHide();
              headerObs.disconnect();
            }
          }, { threshold: 0 });
          headerObs.observe(verseNode);
        } else {
          scheduleHeaderHide();
        }
      }

      var speakBtn = document.getElementById('ccVerseSpeakBtn');
      if (speakBtn) {
        speakBtn.addEventListener('click', function () {
          speakTextPolish(verse.quote + ' ' + teaser, speakBtn);
        });
      }

      var prayerToggle = document.getElementById('ccVersePrayerToggleBtn');
      var prayerBox = document.getElementById('ccVersePrayerBox');
      var prayerInput = document.getElementById('ccVersePrayerInput');
      var prayerSave = document.getElementById('ccVersePrayerSaveBtn');
      var prayerMsg = document.getElementById('ccVersePrayerSavedMsg');

      if (prayerToggle && prayerBox) {
        prayerToggle.addEventListener('click', function () {
          prayerBox.classList.toggle('is-open');
          if (prayerBox.classList.contains('is-open') && prayerInput) prayerInput.focus();
        });
      }
      if (prayerSave && prayerInput) {
        prayerSave.addEventListener('click', function () {
          state.prayersByDate = state.prayersByDate || {};
          state.prayersByDate[info.dateStr] = prayerInput.value.trim();
          saveState(state);
          if (prayerMsg) prayerMsg.textContent = '✓ Zapisano na Twojej dzisiejszej karcie (' + info.dateStr + ').';
        });
      }

      var shareBtn = document.getElementById('ccVerseShareBtn');
      if (shareBtn) {
        shareBtn.addEventListener('click', function () {
          var shareText = verse.quote + ' — ' + rawTitle + ' https://polskieradio.cc' + lessonUrl;
          if (navigator.share) {
            navigator.share({ title: 'Werset Dnia · Christian Culture', text: verse.quote, url: 'https://polskieradio.cc' + lessonUrl }).catch(function () {});
          } else if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareText).then(function () {
              shareBtn.innerHTML = '<i class="fa-solid fa-check"></i> Skopiowano link';
              setTimeout(function () { shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i> Udostępnij'; }, 2500);
            }).catch(function () {});
          }
        });
      }
    }

    function renderMap(reflection) {
      var steps = buildPathSteps(state.need, info.phase, reflection);
      var todayChecks = Array.isArray(state.checksByDate && state.checksByDate[info.dateStr])
        ? state.checksByDate[info.dateStr]
        : [];
      var doneCount = steps.filter(function (s) { return todayChecks.indexOf(s.id) !== -1; }).length;
      var streak = calcStreak(state.checksByDate, info.dateStr);

      var needsHtml = NEEDS.map(function (n) {
        var active = n.id === state.need ? ' is-active' : '';
        return '<button type="button" class="cc-need-pill' + active + '" data-need-id="' + n.id + '" aria-pressed="' + (n.id === state.need ? 'true' : 'false') + '">' +
          iconSvg(n.icon) + '<span>' + escapeHtml(n.label) + '</span>' +
        '</button>';
      }).join('');

      var stepsHtml = steps.map(function (st, idx) {
        var isDone = todayChecks.indexOf(st.id) !== -1;
        return '<div class="cc-step-item' + (isDone ? ' is-done' : '') + '">' +
          '<span class="cc-step-num" aria-hidden="true">' + (isDone ? '✓' : (idx + 1)) + '</span>' +
          '<div class="cc-step-info">' +
            '<div class="cc-step-kicker">' + escapeHtml(st.kicker) + '</div>' +
            '<h3 class="cc-step-title">' + escapeHtml(st.title) + '</h3>' +
            '<p class="cc-step-desc">' + escapeHtml(st.desc) + '</p>' +
          '</div>' +
          '<div class="cc-step-controls">' +
            '<button type="button" class="cc-step-check-btn" data-step-id="' + st.id + '" aria-pressed="' + (isDone ? 'true' : 'false') + '">' +
              (isDone ? '✓ Wykonano' : 'Oznacz krok') +
            '</button>' +
            '<a class="cc-step-go-btn" href="' + escapeHtml(st.url) + '">' + escapeHtml(st.cta) + ' →</a>' +
          '</div>' +
        '</div>';
      }).join('');

      mapNode.innerHTML =
        '<div class="cc-map-header">' +
          '<div>' +
            '<div class="cc-map-kicker">Interaktywna Mapa Uświęcenia · Ekosystem CC</div>' +
            '<h2 class="cc-map-title">Twoja codzienna ścieżka wzrostu</h2>' +
          '</div>' +
          '<span class="cc-map-progress-summary">Dziś: ' + doneCount + ' / ' + steps.length + ' kroków</span>' +
        '</div>' +
        '<p class="cc-needs-label">Wybierz, czego dziś najbardziej potrzebujesz — ścieżka dopasuje konkretne kroki i narzędzia:</p>' +
        '<div class="cc-needs-grid" role="group" aria-label="Wybierz potrzebę na dziś">' + needsHtml + '</div>' +
        '<div class="cc-steps-spine">' + stepsHtml + '</div>' +
        '<div class="cc-week-rhythm">' +
          '<div style="font-size:0.84rem;color:rgba(255,255,255,0.78);line-height:1.45;">' +
            '<strong style="color:#E8C97A;">Twój rytm powrotów:</strong> Każdy odznaczony krok buduje nawyk codziennego spotkania ze Słowem. Wróć jutro po kolejny werset.' +
          '</div>' +
          '<div class="cc-week-dots">' + renderWeekDots(streak) + '</div>' +
        '</div>';

      mapNode.querySelectorAll('[data-need-id]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.need = btn.getAttribute('data-need-id');
          saveState(state);
          renderMap(activeReflection);
        });
      });

      mapNode.querySelectorAll('[data-step-id]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var stepId = btn.getAttribute('data-step-id');
          state.checksByDate = state.checksByDate || {};
          var arr = Array.isArray(state.checksByDate[info.dateStr]) ? state.checksByDate[info.dateStr].slice() : [];
          var pos = arr.indexOf(stepId);
          if (pos === -1) arr.push(stepId);
          else arr.splice(pos, 1);
          state.checksByDate[info.dateStr] = arr;
          saveState(state);
          renderVerse(activeReflection);
          renderMap(activeReflection);
        });
      });
    }

    // Natychmiastowe renderowanie bazowe, a potem podmiana dynamicznym Wersetem Dnia z /rozwazania_baza.json
    renderVerse(null);
    renderMap(null);

    fetch('/rozwazania_baza.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (list) {
        activeReflection = pickReflection(list, info.dateStr);
        if (activeReflection) {
          renderVerse(activeReflection);
          renderMap(activeReflection);
        }
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initMoreToggle();
      initSanctificationWidget();
    });
  } else {
    initMoreToggle();
    initSanctificationWidget();
  }
})();
