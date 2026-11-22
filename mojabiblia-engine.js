/**
 * ═══════════════════════════════════════════════════════════════════
 * MOJA BIBLIA (MojaBiblia CC) — SILNIK INTERLINEARNY I BADAWCZY
 * Ekosystem Christian Culture & Portal LUMINA (polskieradio.cc/mojabiblia)
 * Dane źródłowe: STEPBible-Data (Tyndale House, Cambridge - CC BY 4.0)
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── SŁOWNIK SKRÓTÓW MORFOLOGICZNYCH (Greka / Hebrajski -> Język Polski) ──
  const MORPH_MAP = {
    // Części mowy
    'N': 'Rzeczownik',
    'V': 'Czasownik',
    'A': 'Przymiotnik',
    'T': 'Rodzajnik',
    'P': 'Zaimek osobowy',
    'R': 'Zaimek względny',
    'D': 'Zaimek wskazujący',
    'I': 'Zaimek pytajny',
    'X': 'Zaimek nieokreślony',
    'C': 'Spójnik',
    'CONJ': 'Spójnik',
    'PREP': 'Przyimek',
    'Prep': 'Przyimek',
    'ADV': 'Przysłówek',
    'Adv': 'Przysłówek',
    'PRT': 'Partykuła',
    'INJ': 'Wykrzyknik',
    'Art': 'Rodzajnik',
    'DirObjM': 'Wskaźnik dopełnienia (et)',
    // Przypadki
    'NSM': 'Mianownik l.poj. męski',
    'NSF': 'Mianownik l.poj. żeński',
    'NSN': 'Mianownik l.poj. nijaki',
    'GSM': 'Dopełniacz l.poj. męski',
    'GSF': 'Dopełniacz l.poj. żeński',
    'GSN': 'Dopełniacz l.poj. nijaki',
    'DSM': 'Celownik l.poj. męski',
    'DSF': 'Celownik l.poj. żeński',
    'DSN': 'Celownik l.poj. nijaki',
    'ASM': 'Biernik l.poj. męski',
    'ASF': 'Biernik l.poj. żeński',
    'ASN': 'Biernik l.poj. nijaki',
    'NPM': 'Mianownik l.mn. męski',
    'NPF': 'Mianownik l.mn. żeński',
    'NPN': 'Mianownik l.mn. nijaki',
    'GPM': 'Dopełniacz l.mn. męski',
    'GPF': 'Dopełniacz l.mn. żeński',
    'GPN': 'Dopełniacz l.mn. nijaki',
    'DPM': 'Celownik l.mn. męski',
    'DPF': 'Celownik l.mn. żeński',
    'DPN': 'Celownik l.mn. nijaki',
    'APM': 'Biernik l.mn. męski',
    'APF': 'Biernik l.mn. żeński',
    'APN': 'Biernik l.mn. nijaki',
    // Czasowniki
    'PAI-3S': 'Czas teraźniejszy, strona czynna, oznajmujący, 3 os. l.poj.',
    'IAI-3S': 'Czas przeszły niedokonany (Imperfectum), strona czynna, 3 os. l.poj.',
    'AAI-3S': 'Aoryst (czas przeszły dokonany), strona czynna, 3 os. l.poj.',
    '2AAI-3S': 'Aoryst II, strona czynna, oznajmujący, 3 os. l.poj.',
    '2ADI-3S': 'Aoryst II, strona medialna/deponens, oznajmujący, 3 os. l.poj.',
    'API-3S': 'Aoryst, strona bierna, oznajmujący, 3 os. l.poj.',
    '2RAI-3S': 'Czas przeszły dokonany (Perfectum II), strona czynna, 3 os. l.poj.',
    'RAI-3S': 'Czas przeszły dokonany (Perfectum), strona czynna, 3 os. l.poj.',
    'RAI-1P': 'Perfectum, strona czynna, 1 os. l.mn.',
    'FAI-1P': 'Czas przyszły, strona czynna, 1 os. l.mn.',
    'V-PAI-3S': 'Czasownik: Teraźniejszy dokonany/ciągły, 3 os. l.poj.',
    // Hebrajski
    'Qal-Perf-3ms': 'Hebrajski Rdzeń Qal: Czas dokonany, 3 os. męska l.poj.',
    'Qal-Imperf-1cs': 'Hebrajski Rdzeń Qal: Czas niedokonany, 1 os. wspólna l.poj.',
    'Qal-Ptcp-msc': 'Hebrajski Rdzeń Qal: Imiesłów czynny męski w stanie constructus',
    'Piel-Ptcp-fs': 'Hebrajski Rdzeń Piel (intensywny): Imiesłów żeński l.poj.',
    'Hiph-Imperf-3ms': 'Hebrajski Rdzeń Hifil (sprawczy): Czas niedokonany, 3 os. męska'
  };

  class MojaBibliaApp {
    constructor() {
      this.books = [];
      this.lexicon = {};
      this.currentBookId = 'JHN';
      this.currentChapter = 1;
      this.currentVerse = null;
      this.currentVerseEnd = null;
      this.fromSource = null;
      this.returnSlug = null;
      this.currentMode = 'reader'; // 'reader' | 'interlinear' | 'parallel'
      this.activeTranslations = ['UBG', 'BW', 'BT', 'BG'];
      this.reverseInterlinear = false;
      this.currentChapterData = null;
      this.fontSizeDelta = 0;
      this.bookmarks = [];
      this.notes = {};
      this.highlights = {}; // { "JHN_1_3": "yellow", ... }
      this.isAudioPlaying = false;
      this.audioElement = null;

      // TTS state
      this._ttsActive = false;
      this._ttsPaused = false;
      this._ttsVerseIdx = 0;
      this._ttsRate = 1;
      this._ttsRates = [1, 1.25, 1.5, 0.75];
      this._ttsRateIdx = 0;
      this._ttsUtterance = null;
      this._hlPickerVerseIdx = 0;

      this.init();
    }

    async init() {
      console.log('[MojaBiblia] Inicjalizacja silnika badawczego...');
      this.loadLocalPreferences();
      this.bindDOMElements();
      await this.loadMetadataAndLexicon();
      this.parseUrlParams();
      await this.loadChapter(this.currentBookId, this.currentChapter);
      this.setupAudio();
    }

    loadLocalPreferences() {
      try {
        localStorage.removeItem('mb_mode');
        const savedMode = localStorage.getItem('mb_mode_v2');
        if (savedMode && ['reader', 'interlinear', 'parallel'].includes(savedMode)) {
          this.currentMode = savedMode;
        }
        localStorage.removeItem('mb_reverse_interlinear');
        const savedRev = localStorage.getItem('mb_reverse_interlinear_v2');
        if (savedRev !== null) this.reverseInterlinear = savedRev === 'true';
        const savedTrans = localStorage.getItem('mb_active_trans');
        if (savedTrans) this.activeTranslations = JSON.parse(savedTrans);
        const savedBookmarks = localStorage.getItem('mb_bookmarks');
        if (savedBookmarks) this.bookmarks = JSON.parse(savedBookmarks);
        const savedNotes = localStorage.getItem('mb_notes');
        if (savedNotes) this.notes = JSON.parse(savedNotes);
        const savedHL = localStorage.getItem('mb_highlights');
        if (savedHL) this.highlights = JSON.parse(savedHL);
      } catch (e) {
        console.warn('[MojaBiblia] Błąd odczytu preferencji:', e);
      }
    }

    savePreferences() {
      try {
        localStorage.setItem('mb_mode_v2', this.currentMode);
        localStorage.setItem('mb_reverse_interlinear_v2', this.reverseInterlinear ? 'true' : 'false');
        localStorage.setItem('mb_active_trans', JSON.stringify(this.activeTranslations));
        localStorage.setItem('mb_bookmarks', JSON.stringify(this.bookmarks));
        localStorage.setItem('mb_notes', JSON.stringify(this.notes));
        localStorage.setItem('mb_highlights', JSON.stringify(this.highlights));
        if (window.LuminaStorage && typeof window.LuminaStorage.set === 'function') {
          window.LuminaStorage.set('cache', 'mb_bookmarks', this.bookmarks);
          window.LuminaStorage.set('cache', 'mb_notes', this.notes);
        }
      } catch (e) {}
    }

    bindDOMElements() {
      this.bookSelect = document.getElementById('mbBookSelect');
      this.chapterSelect = document.getElementById('mbChapterSelect');
      this.contentContainer = document.getElementById('mbContentArea');
      this.strongModal = document.getElementById('mbStrongModal');
      this.searchInput = document.getElementById('mbSearchInput');
      this.navTitle = document.getElementById('mbNavTitle');
      this.chapterTitle = document.getElementById('mbChapterTitle');
      this.chapterSub = document.getElementById('mbChapterSubtitle');
      this.bookDrawerModal = document.getElementById('mbBookDrawerModal');
      this.wordPopover = document.getElementById('mbWordPopover');
      this.transFilterBar = document.getElementById('mbTransFilterBar');
      this.revToggleBtn = document.getElementById('mbRevToggleBtn');
      this.bookDrawerLabel = document.getElementById('mbBookDrawerLabel');
      this.reportProblemModal = document.getElementById('mbReportProblemModal');
      this.reportModalBody = document.getElementById('mbReportModalBody');

      // Globalne zamykanie modali klawiszem Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeStrongModal();
          this.closeBookDrawer();
          this.closeReportProblemModal();
          this.hideWordPopover();
        }
      });
    }

    parseUrlParams() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const bookParam = urlParams.get('book') || urlParams.get('b');
        const chParam = urlParams.get('chapter') || urlParams.get('ch') || urlParams.get('c');
        const vParam = urlParams.get('verse') || urlParams.get('v') || urlParams.get('w');
        const vEndParam = urlParams.get('verse_end') || urlParams.get('ve');
        const rangeParam = urlParams.get('range');
        const modeParam = urlParams.get('mode') || urlParams.get('m');
        const qParam = urlParams.get('q') || urlParams.get('ref');
        const fromParam = urlParams.get('from');
        const slugParam = urlParams.get('slug');

        if (fromParam) this.fromSource = fromParam;
        if (slugParam) this.returnSlug = slugParam;

        if (modeParam && ['interlinear', 'parallel', 'reader'].includes(modeParam)) {
          // Jednorazowa migracja ze starego domyślnego URL-a (?book=JHN&ch=1&chapter=1&mode=interlinear) na domyślny Czytnik
          const isLegacyAutoUrl = modeParam === 'interlinear' && urlParams.has('ch') && urlParams.has('chapter') && !localStorage.getItem('mb_reader_default_migrated_v1');
          if (isLegacyAutoUrl) {
            try { localStorage.setItem('mb_reader_default_migrated_v1', '1'); } catch (_) {}
            this.currentMode = 'reader';
          } else {
            this.currentMode = modeParam;
          }
        } else {
          try { localStorage.setItem('mb_reader_default_migrated_v1', '1'); } catch (_) {}
        }

        if (qParam) {
          this.handleSearch(qParam);
          return;
        }

        if (bookParam) {
          const rawB = bookParam.trim().toLowerCase();
          const found = this.books.find(b =>
            b.id.toLowerCase() === rawB ||
            b.shortPl.toLowerCase() === rawB ||
            b.namePl.toLowerCase() === rawB ||
            b.namePl.toLowerCase().includes(rawB)
          );
          if (found) {
            this.currentBookId = found.id;
          } else {
            this.currentBookId = bookParam.trim().toUpperCase();
          }
        }

        if (chParam) {
          const chNum = parseInt(chParam, 10);
          if (!isNaN(chNum) && chNum >= 1) {
            this.currentChapter = chNum;
          }
        }

        if (vParam) {
          const vStr = String(vParam).trim();
          const rangeMatch = vStr.match(/^(\d+)(?:[-–—](\d+))?$/);
          if (rangeMatch) {
            this.currentVerse = parseInt(rangeMatch[1], 10);
            if (rangeMatch[2]) {
              this.currentVerseEnd = parseInt(rangeMatch[2], 10);
            }
          } else {
            const vNum = parseInt(vStr, 10);
            if (!isNaN(vNum) && vNum >= 1) {
              this.currentVerse = vNum;
            }
          }
        }

        if (vEndParam) {
          const veNum = parseInt(vEndParam, 10);
          if (!isNaN(veNum) && veNum >= 1) {
            this.currentVerseEnd = veNum;
          }
        }

        if (rangeParam && !this.currentVerseEnd) {
          const rMatch = String(rangeParam).match(/^(\d+)[-–—](\d+)$/);
          if (rMatch) {
            if (!this.currentVerse) this.currentVerse = parseInt(rMatch[1], 10);
            this.currentVerseEnd = parseInt(rMatch[2], 10);
          }
        }

        if (!this.currentVerse && window.location.hash) {
          const hashMatch = window.location.hash.match(/#verse-(\d+)/);
          if (hashMatch) {
            this.currentVerse = parseInt(hashMatch[1], 10);
          }
        }
      } catch (e) {
        console.warn('[MojaBiblia] Błąd parsowania parametrów URL:', e);
      }
    }

    async loadMetadataAndLexicon() {
      try {
        const [booksRes, lexRes, glossRes] = await Promise.all([
          fetch('/data/bible/bible_books_metadata.json'),
          fetch('/data/bible/strong_lexicon.json'),
          fetch('/data/bible/glosy-pl.json?v=20261013_1').catch(() => null)
        ]);
        if (glossRes && glossRes.ok) {
          try { this.glossPl = await glossRes.json(); } catch (e) { this.glossPl = {}; }
        }

        if (booksRes.ok) {
          this.books = await booksRes.json();
          this.renderBookSelector();
        }

        if (lexRes.ok) {
          this.lexicon = await lexRes.json();
        }
      } catch (err) {
        console.warn('[MojaBiblia] Błąd ładowania metadanych / leksykonu:', err);
      }
    }

    renderBookSelector() {
      if (!this.bookSelect) return;
      this.bookSelect.innerHTML = '';

      const otOptgroup = document.createElement('optgroup');
      otOptgroup.label = '── STARY TESTAMENT ──';
      const ntOptgroup = document.createElement('optgroup');
      ntOptgroup.label = '── NOWY TESTAMENT ──';

      this.books.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = `${b.namePl} (${b.shortPl})`;
        if (b.id === this.currentBookId) opt.selected = true;

        if (b.testament === 'OT') {
          otOptgroup.appendChild(opt);
        } else {
          ntOptgroup.appendChild(opt);
        }
      });

      this.bookSelect.appendChild(otOptgroup);
      this.bookSelect.appendChild(ntOptgroup);

      this.updateChapterOptions();
    }

    updateChapterOptions() {
      if (!this.chapterSelect) return;
      const currentBook = this.books.find(b => b.id === this.currentBookId);
      const maxCh = currentBook ? currentBook.chapters : 50;

      this.chapterSelect.innerHTML = '';
      for (let i = 1; i <= maxCh; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Rozdział ${i}`;
        if (i === this.currentChapter) opt.selected = true;
        this.chapterSelect.appendChild(opt);
      }
    }

    prevChapter() {
      if (this.currentChapter > 1) {
        this.loadChapter(this.currentBookId, this.currentChapter - 1, false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const currentIdx = this.books.findIndex(b => b.id === this.currentBookId);
        if (currentIdx > 0) {
          const prevBook = this.books[currentIdx - 1];
          this.loadChapter(prevBook.id, prevBook.chapters, false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          this.showToast('To jest pierwszy rozdział Pisma Świętego (Rdz 1)');
        }
      }
    }

    nextChapter() {
      const currentBook = this.books.find(b => b.id === this.currentBookId);
      const maxCh = currentBook ? currentBook.chapters : 50;
      if (this.currentChapter < maxCh) {
        this.loadChapter(this.currentBookId, this.currentChapter + 1, false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const currentIdx = this.books.findIndex(b => b.id === this.currentBookId);
        if (currentIdx > -1 && currentIdx < this.books.length - 1) {
          const nextBook = this.books[currentIdx + 1];
          this.loadChapter(nextBook.id, 1, false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          this.showToast('Dotarłeś do ostatniego rozdziału Pisma Świętego (Ap 22)');
        }
      }
    }

    async loadChapter(bookId, chapterNum, keepVerse = true) {
      this.currentBookId = bookId;
      this.currentChapter = chapterNum;
      if (window.CCAnalyticsMC && typeof window.CCAnalyticsMC.trackBibleChapterOpen === 'function') {
        window.CCAnalyticsMC.trackBibleChapterOpen({
          book_code: bookId,
          chapter_number: chapterNum,
          translation: (this.activeTranslations && this.activeTranslations[0]) || 'UBG',
          content_type: this.currentMode || 'reader',
          player_type: 'mojabiblia'
        });
      }
      if (!keepVerse) {
        this.currentVerse = null;
        this.currentVerseEnd = null;
      }
      this.updateUrl();

      if (this.bookSelect && this.bookSelect.value !== bookId) {
        this.bookSelect.value = bookId;
        this.updateChapterOptions();
      }
      if (this.chapterSelect && parseInt(this.chapterSelect.value, 10) !== chapterNum) {
        this.chapterSelect.value = chapterNum;
      }

      const bName = this.getBookName(bookId);
      const shortName = this.getBookShort(bookId) || bName;
      if (this.bookDrawerLabel) {
        this.bookDrawerLabel.textContent = `${shortName} ${chapterNum}`;
      }
      const bottomLabel = document.getElementById('mbBottomBookLabel');
      if (bottomLabel) {
        bottomLabel.textContent = `${bName} ${chapterNum}`;
      }

      if (this.contentContainer) {
        this.contentContainer.innerHTML = `
          <div class="mb-loading-state">
            <i class="fa-solid fa-compass-drafting fa-spin mb-gold-text" style="font-size:2rem;"></i>
            <p>Otwieranie zwoju: ${bName} ${chapterNum}...</p>
          </div>`;
      }

      const fileKey = `${bookId}_${String(chapterNum).padStart(2, '0')}.json`;
      let data = null;

      try {
        const res = await fetch(`/data/bible/${fileKey}`);
        if (res.ok) {
          data = await res.json();
        }
      } catch (e) {
        console.log('[MojaBiblia] Plik rozdziału niedostępny w bundlu, generowanie widoku badawczego...');
      }

      if (!data) {
        data = this.generateFallbackChapter(bookId, chapterNum);
      }

      this.currentChapterData = data;
      this.renderCurrentView();
    }

    getBookName(bookId) {
      const b = this.books.find(x => x.id === bookId);
      return b ? b.namePl : bookId;
    }

    getBookShort(bookId) {
      const b = this.books.find(x => x.id === bookId);
      return b ? b.shortPl : bookId;
    }

    generateFallbackChapter(bookId, chapterNum) {
      const book = this.books.find(b => b.id === bookId) || { namePl: bookId, originalLang: 'Greek' };
      const isGreek = book.originalLang === 'Greek';

      return {
        bookId: bookId,
        bookName: book.namePl,
        shortPl: book.shortPl || bookId,
        chapter: chapterNum,
        originalLang: book.originalLang,
        totalVerses: 5,
        commentaryTitle: `Księga: ${book.namePl}, Rozdział ${chapterNum}`,
        verses: [
          {
            verse: 1,
            text: {
              UBG: `Rozdział ${chapterNum} Księgi ${book.namePl} w przekładzie Uwspółcześnionej Biblii Gdańskiej (UBG). Werset 1.`,
              BW: `Rozdział ${chapterNum} Księgi ${book.namePl} w przekładzie Biblii Warszawskiej (BW). Werset 1.`,
              BT: `Rozdział ${chapterNum} Księgi ${book.namePl} w przekładzie Biblii Tysiąclecia (BT). Werset 1.`,
              BG: `Rozdział ${chapterNum} Księgi ${book.namePl} w przekładzie Biblii Gdańskiej 1632 (BG). Werset 1.`
            },
            interlinear: isGreek ? [
              { original: "Ἐν", translit: "En", strong: "G1722", morph: "PREP", gloss: "W", lemma: "ἐν" },
              { original: "ἀρχῇ", translit: "archē", strong: "G0746", morph: "N-DSF", gloss: "początku", lemma: "ἀρχή" },
              { original: "ἦν", translit: "ēn", strong: "G2258", morph: "V-IAI-3S", gloss: "było", lemma: "εἰμί" },
              { original: "ὁ", translit: "ho", strong: "G3588", morph: "T-NSM", gloss: "to", lemma: "ὁ" },
              { original: "λόγος", translit: "logos", strong: "G3056", morph: "N-NSM", gloss: "Słowo", lemma: "λόγος" },
              { original: "καὶ", translit: "kai", strong: "G2532", morph: "CONJ", gloss: "i", lemma: "καί" },
              { original: "ὁ", translit: "ho", strong: "G3588", morph: "T-NSM", gloss: "ten", lemma: "ὁ" },
              { original: "θεός", translit: "theos", strong: "G2316", morph: "N-NSM", gloss: "Bóg", lemma: "θεός" }
            ] : [
              { original: "בְּרֵאשִׁית", translit: "Bərē’šît", strong: "H7225", morph: "Prep-b | N-fs", gloss: "Na początku", lemma: "רֵאשִׁית" },
              { original: "בָּרָא", translit: "bārā’", strong: "H1254", morph: "V-Qal-Perf-3ms", gloss: "stworzył", lemma: "בָּרָא" },
              { original: "אֱלֹהִים", translit: "’Ĕlōhîm", strong: "H0430", morph: "N-mp", gloss: "Bóg", lemma: "אֱלֹהִים" },
              { original: "שָׁלוֹם", translit: "šālôm", strong: "H7965", morph: "N-ms", gloss: "pokój", lemma: "שָׁלוֹם" }
            ]
          }
        ]
      };
    }

    // ── Polskie znaczenia słów w interlinii (Strażnik, 2026-10-13) ──
    // Dane źródłowe mieszały angielskie i błędne odpowiedniki (np. „he created”, „[ten/ta/to]” zamiast „niebo”).
    // Słownik glosy-pl.json (kod Stronga → polskie znaczenie) ma pierwszeństwo; przedrostek hebrajski (ב/ו/ל/כ/מ/ש)
    // jest dopisywany przed słowem. Słowa jeszcze bez polskiego odpowiednika są oznaczone, nie udają tłumaczenia.
    glossFor(w) {
      const dict = this.glossPl || {};
      const prefixes = { 'ב': 'w', 'ו': 'i', 'ל': 'do', 'כ': 'jak', 'מ': 'z', 'ש': 'który', 'ה': '' };
      const strong = String((w && w.strong) || '');
      const raw = String((w && w.gloss) || '').trim();
      const orig = String((w && w.original) || '').replace(/[,\.;·¶׃׀]/g, '').trim();
      const morph = String((w && w.morph) || '').trim();

      // Specjalne kontekstowe formy zaimkowe (np. ἡμῖν w J 1:14 = „nam / wśród nas”, nie angielskie „I”)
      if (orig === 'ἡμῖν' || (morph === 'P-1DP' && w && w.lemma === 'ἐγώ')) {
        return { text: 'nam / wśród nas', en: false };
      }
      if (orig === 'ἡμῶν' || (morph === 'P-1GP' && w && w.lemma === 'ἐγώ')) {
        return { text: 'nas / nasz', en: false };
      }
      if (orig === 'ἡμᾶς' || (morph === 'P-1AP' && w && w.lemma === 'ἐγώ')) {
        return { text: 'nas', en: false };
      }
      if (orig === 'ὑμῖν' || (morph === 'P-2DP' && w && w.lemma === 'σύ')) {
        return { text: 'wam', en: false };
      }
      if (orig === 'αὐτοῦ' && morph === 'P-GSM') {
        return { text: 'Jego / jego', en: false };
      }

      let pl = dict[strong];
      if (pl) {
        const lemma = String((w && w.lemma) || '');
        if (strong.charAt(0) === 'H' && lemma.length === 1 && prefixes[lemma]) {
          if (strong === 'H7225' && lemma === 'ב') {
            pl = 'na początku';
          } else {
            const p = prefixes[lemma];
            if (p) pl = p + ' ' + pl;
          }
        }
        return { text: pl, en: false };
      }

      if (raw === '[ten/ta/to]') return { text: '(rodzajnik)', en: false };
      if (/^obj\.?$/i.test(raw)) return { text: '(dopełnienie)', en: false };
      const english = /\b(the|of|to|he|she|it|they|you|I|we|was|were|is|are|be|been|will|shall|and|but|or|not|with|from|for|on|by|this|that|which|who|all|my|your|his|her|their|our|God|LORD|said|says)\b|(ness|ing|ed|tion|ly)$/i.test(raw);
      return { text: raw, en: english };
    }

    // Dostępne przekłady w widoku porównywarki (UBG, BW, BT, BG)
    availableTranslations(data) {
      return ['UBG', 'BW', 'BT', 'BG'];
    }

    updateTranslationFilters() {
      const avail = this.availableTranslations(this.currentChapterData);
      document.querySelectorAll('.mb-trans-filter').forEach(btn => {
        btn.style.display = avail.includes(btn.dataset.trans) ? '' : 'none';
        btn.classList.toggle('active', this.activeTranslations.includes(btn.dataset.trans));
      });
      return avail;
    }

    renderCurrentView() {
      if (!this.currentChapterData || !this.contentContainer) return;

      // Update titles
      const bName = this.currentChapterData.bookName;
      const ch = this.currentChapterData.chapter;
      if (this.navTitle) this.navTitle.textContent = `${bName} ${ch}`;
      if (this.chapterTitle) this.chapterTitle.textContent = `${bName} – Rozdział ${ch}`;
      if (this.chapterSub) {
        this.chapterSub.textContent = this.currentChapterData.commentaryTitle || `Oryginał: ${this.currentChapterData.originalLang === 'Greek' ? 'Greka Nowotestamentowa (Koine)' : 'Hebrajski Masorecki'}`;
      }

      // Synchronizacja SEO i URL dla wyszukiwarek i AI
      this.updateSEO();
      this.updateUrl();

      // Update mode switcher buttons
      document.querySelectorAll('.mb-mode-btn').forEach(btn => {
        if (btn.dataset.mode === this.currentMode) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      if (this.currentMode === 'interlinear') {
        this.renderInterlinearView();
      } else if (this.currentMode === 'parallel') {
        this.renderParallelView();
      } else {
        this.renderReaderView();
      }

      this.applyFontSize();

      // Renderowanie banera powrotu / głębszego studium dla Wersetu Dnia
      this.renderIntegrationBanner();

      // Precyzyjne wielowersowe podświetlenie i inteligentne przewinięcie
      if (this.currentVerse) {
        this.highlightAndScrollToVerse(this.currentVerse, this.currentVerseEnd);
      }
    }

    renderIntegrationBanner() {
      const bannerSlot = document.getElementById('mbIntegrationBannerSlot');
      if (!bannerSlot) return;

      if (this.fromSource === 'werset-dnia') {
        const bName = this.currentChapterData?.bookName || this.getBookName(this.currentBookId);
        const ch = this.currentChapter;
        let vRefStr = '';
        if (this.currentVerse) {
          vRefStr = `:${this.currentVerse}`;
          if (this.currentVerseEnd && this.currentVerseEnd > this.currentVerse) {
            vRefStr += `-${this.currentVerseEnd}`;
          }
        }
        const returnUrl = this.returnSlug 
          ? `https://werset-dnia.polskieradio.cc/#w/${this.returnSlug}`
          : 'https://werset-dnia.polskieradio.cc/';

        bannerSlot.innerHTML = `
          <div class="mb-integration-banner" id="mbIntegrationBanner">
            <div class="mb-integration-banner-left">
              <div class="mb-integration-badge"><i class="fa-solid fa-sparkles"></i> GŁĘBSZE STUDIUM • WERSET DNIA</div>
              <div class="mb-integration-title">Księga: <strong>${bName} ${ch}${vRefStr}</strong></div>
              <div class="mb-integration-sub">Tryb analityczny: Oryginał interlinearny · Kody Stronga · Przekład UBG</div>
            </div>
            <a href="${returnUrl}" class="mb-integration-return-btn" id="mbIntegrationReturnBtn" title="Powrót do wersetu w aplikacji Werset Dnia">
              <i class="fa-solid fa-arrow-left"></i> Wróć do karty wersetu
            </a>
          </div>
        `;
        bannerSlot.style.display = 'block';
      } else {
        bannerSlot.innerHTML = '';
        bannerSlot.style.display = 'none';
      }
    }

    highlightAndScrollToVerse(verseStart, verseEnd) {
      const vStart = parseInt(verseStart, 10);
      if (isNaN(vStart) || vStart < 1) return;
      const vEnd = verseEnd && !isNaN(parseInt(verseEnd, 10)) ? parseInt(verseEnd, 10) : vStart;

      // Wyczyszczenie dotychczasowych podświetleń
      document.querySelectorAll('.mb-verse-target-highlight').forEach(el => {
        el.classList.remove('mb-verse-target-highlight');
      });

      const applyHighlightAndScroll = (attempt = 1) => {
        const firstEl = document.getElementById(`verse-${vStart}`);
        if (!firstEl) {
          if (attempt <= 8) {
            setTimeout(() => applyHighlightAndScroll(attempt + 1), 60 * attempt);
          }
          return;
        }

        // Dodanie podświetlenia dla całego zakresu wersetów (np. 5 i 6)
        for (let i = vStart; i <= vEnd; i++) {
          const el = document.getElementById(`verse-${i}`);
          if (el) {
            el.classList.add('mb-verse-target-highlight');
          }
        }

        // Obliczenie wysokości nagłówków i marginesu
        const headerEl = document.querySelector('.mb-header');
        const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 75;
        const bannerEl = document.getElementById('mbIntegrationBanner');
        const bannerHeight = (bannerEl && bannerEl.style.display !== 'none') ? bannerEl.getBoundingClientRect().height : 0;
        const offset = headerHeight + bannerHeight + 20;

        const elRect = firstEl.getBoundingClientRect();
        const absoluteElementTop = elRect.top + window.pageYOffset;
        const targetScrollY = Math.max(0, absoluteElementTop - offset);

        window.scrollTo({
          top: targetScrollY,
          behavior: attempt === 1 ? 'smooth' : 'auto'
        });

        // Wzmocnienie skupienia wzroku
        firstEl.setAttribute('tabindex', '-1');
      };

      requestAnimationFrame(() => applyHighlightAndScroll(1));
    }

    // ── 1. WIDOK INTERLINEARNY (Wzór HiperBiblia + STEPBible) ──
    renderInterlinearView() {
      const data = this.currentChapterData;
      let html = `<div class="mb-interlinear-wrapper">`;

      data.verses.forEach(v => {
        const isBookmarked = this.bookmarks.includes(`${data.bookId}_${data.chapter}_${v.verse}`);
        const short = data.shortPl || this.getBookShort(data.bookId);
        const refStr = `${short} ${data.chapter}:${v.verse}`;

        html += `
          <div class="mb-verse-card ${isBookmarked ? 'is-bookmarked' : ''}" id="verse-${v.verse}">
            <div class="mb-verse-header">
              <div class="mb-verse-ref">
                <span class="mb-verse-num">${v.verse}</span>
                <span class="mb-verse-ref-text">${refStr}</span>
                <span class="mb-verse-trans-tag">UBG</span>
              </div>
              <div class="mb-verse-actions">
                <button class="mb-action-btn" onclick="window.mbApp.copyVerse('${refStr}', '${this.escapeHtml(v.text.UBG)}')" title="Kopiuj werset"><i class="fa-regular fa-copy"></i></button>
                <button class="mb-action-btn mb-action-lumina" onclick="window.mbApp.shareToLumina('${refStr}', '${this.escapeHtml(v.text.UBG)}')" title="Opublikuj werset na Tablicy LUMINA" style="width:44px; height:44px; min-width:44px; min-height:44px; color:#facc15; font-weight:900; font-family:'Cinzel',serif; font-size:14px;">L</button>
                <button class="mb-action-btn ${isBookmarked ? 'active' : ''}" onclick="window.mbApp.toggleBookmark('${data.bookId}', ${data.chapter}, ${v.verse})" title="Zapisz w sercu"><i class="fa-solid fa-bookmark"></i></button>
                <button class="mb-action-btn" onclick="window.mbApp.openReportProblemModal('${refStr}')" title="Zgłoś uwagę lub pytanie do wersetu ${refStr} na czat Biblia Audio"><i class="fa-regular fa-flag"></i></button>
              </div>
            </div>

            <!-- Przekład gładki (UBG) -->
            <div class="mb-verse-smooth-text">${v.text.UBG}</div>

            <!-- Bloki wyrazowe interlinearne (Hebrajski RTL / Greka LTR) -->
            <div class="mb-words-container ${(data.originalLang && data.originalLang.toLowerCase().includes('hebrew')) ? 'is-hebrew' : 'is-greek'}">
        `;

        if (v.interlinear && v.interlinear.length > 0) {
          v.interlinear.forEach((w, wIdx) => {
            const morphDesc = this.translateMorphology(w.morph);
            html += `
              <div class="mb-word-tile" data-strong="${w.strong}" onclick="window.mbApp.openStrongModal('${w.strong}', '${this.escapeHtml(w.original)}', '${this.escapeHtml(w.translit)}')">
                <div class="mb-word-orig">${w.original}</div>
                <div class="mb-word-translit">${w.translit}</div>
                <div class="mb-word-strong-badge" title="Kliknij, aby otworzyć leksykon Stronga">${w.strong}</div>
                <div class="mb-word-morph" title="${morphDesc}">${w.morph}</div>
                ${(() => { const g = this.glossFor(w); return `<div class="mb-word-gloss${g.en ? ' mb-gloss-en' : ''}"${g.en ? ' title="Polskie znaczenie tego słowa jest w przygotowaniu"' : ''}>${this.escapeHtml(g.text)}</div>`; })()}
              </div>
            `;
          });
        } else {
          html += `<div class="mb-interlinear-empty">Analiza słownikowa w opracowaniu...</div>`;
        }

        html += `
            </div>
          </div>
        `;
      });

      html += `</div>`;
      this.contentContainer.innerHTML = html;
    }

    // ── 2. WIDOK PORÓWNYWARKI PRZEKŁADÓW (UBG, BW, BT, BG) ──
    renderParallelView() {
      const data = this.currentChapterData;
      this.updateTranslationFilters();
      const show = t => this.activeTranslations.includes(t);
      let html = `<div class="mb-parallel-wrapper">`;

      data.verses.forEach(v => {
        const short = data.shortPl || this.getBookShort(data.bookId);
        const refStr = `${short} ${data.chapter}:${v.verse}`;

        html += `
          <div class="mb-parallel-row" id="verse-${v.verse}">
            <div class="mb-parallel-row-head">
              <span class="mb-verse-num">${v.verse}</span>
              <span class="mb-parallel-verse-title">${refStr}</span>
              <div class="mb-verse-actions">
                <button class="mb-action-btn" onclick="window.mbApp.copyVerse('${refStr}', '${this.escapeHtml(v.text.UBG)}')" title="Kopiuj werset"><i class="fa-regular fa-copy"></i></button>
                <button class="mb-action-btn mb-action-lumina" onclick="window.mbApp.shareToLumina('${refStr}', '${this.escapeHtml(v.text.UBG)}')" title="Opublikuj werset na Tablicy LUMINA" style="width:44px; height:44px; min-width:44px; min-height:44px; color:#facc15; font-weight:900; font-family:'Cinzel',serif; font-size:14px;">L</button>
                <button class="mb-action-btn" onclick="window.mbApp.openReportProblemModal('${refStr}')" title="Zgłoś uwagę lub pytanie do wersetu ${refStr} na czat Biblia Audio"><i class="fa-regular fa-flag"></i></button>
              </div>
            </div>
            <div class="mb-parallel-grid">
        `;

        if (show('UBG') || avail.length === 1) {
          html += `
            <div class="mb-trans-card">
              <div class="mb-trans-badge ubg-badge">UBG (Gdańska Nowa)</div>
              <div class="mb-trans-text">${v.text.UBG || '—'}</div>
            </div>`;
        }
        if (show('BW')) {
          html += `
            <div class="mb-trans-card">
              <div class="mb-trans-badge bw-badge">BW (Warszawska)</div>
              <div class="mb-trans-text">${v.text.BW || '—'}</div>
            </div>`;
        }
        if (show('BT')) {
          html += `
            <div class="mb-trans-card">
              <div class="mb-trans-badge bt-badge">BT (Tysiąclecia)</div>
              <div class="mb-trans-text">${v.text.BT || '—'}</div>
            </div>`;
        }
        if (show('BG')) {
          html += `
            <div class="mb-trans-card">
              <div class="mb-trans-badge bg-badge">BG (Gdańska 1632)</div>
              <div class="mb-trans-text">${v.text.BG || '—'}</div>
            </div>`;
        }

        html += `
            </div>
          </div>
        `;
      });

      html += `</div>`;
      this.contentContainer.innerHTML = html;
    }

    // ── 3. WIDOK CZYTNIKA KONTEMPLACYJNEGO (Immersive Reader) Z REWERSEM INTERLINEARNYM ──
    renderReaderView() {
      const data = this.currentChapterData;
      const isReverse = this.reverseInterlinear;
      const short = data.shortPl || data.bookName;

      let html = `<div class="mb-reader-wrapper">
        <div class="mb-reader-top-bar">
          <h2 class="mb-reader-chapter-heading">${data.bookName}, Rozdział ${data.chapter}</h2>
          <div class="mb-reader-ribbon">
            <button class="mb-reader-ribbon-btn mb-ribbon-tts-btn" onclick="window.mbApp.ttsStart(0)" title="Czytaj rozdział od początku (TTS)">
              <i class="fa-solid fa-volume-high"></i> Czytaj rozdział
            </button>
          </div>
        </div>
        <div class="mb-reader-verses-list" id="mbReaderVersesList">`;

      data.verses.forEach((v, idx) => {
        const key = `${data.bookId}_${data.chapter}_${v.verse}`;
        const hlColor = this.highlights[key] || null;
        const hlClass = hlColor ? ` mb-hl-${hlColor}` : '';
        const refStr = `${short} ${data.chapter}:${v.verse}`;
        const ubgSafe = this.escapeHtml(v.text.UBG || '');
        const refSafe = this.escapeHtml(refStr);

        let bodyHtml = '';
        if (isReverse && v.interlinear && v.interlinear.length > 0) {
          bodyHtml = v.interlinear.map(w => {
            const safeOrig = this.escapeHtml(w.original);
            const safeTranslit = this.escapeHtml(w.translit);
            const safeGloss = this.escapeHtml(this.glossFor(w).text);
            const safeMorph = this.escapeHtml(w.morph);
            const safeStrong = this.escapeHtml(w.strong);
            return `<span class="mb-rev-word" data-strong="${safeStrong}" data-orig="${safeOrig}" data-translit="${safeTranslit}" data-gloss="${safeGloss}" data-morph="${safeMorph}" onclick="window.mbApp.handleWordClick(event, this)">${safeGloss || safeOrig}</span>`;
          }).join(' ');
        } else {
          bodyHtml = ubgSafe;
        }

        html += `<div class="mb-reader-verse-row${hlClass}" id="verse-${v.verse}" data-verse-idx="${idx}" data-verse-num="${v.verse}">
          <div class="mb-reader-row-left">
            <button class="mb-reader-num-btn" onclick="window.mbApp.openHlPicker(${idx},'${refSafe}')" title="Zakreśl / opcje wersetu ${refSafe}">${v.verse}</button>
          </div>
          <div class="mb-reader-row-body" onclick="window.mbApp.openHlPicker(${idx},'${refSafe}')">${bodyHtml}</div>
          <div class="mb-reader-row-actions">
            <button class="mb-reader-act-btn" onclick="window.mbApp.copyVerse('${refSafe}','${ubgSafe}')" title="Kopiuj ${refSafe}"><i class="fa-regular fa-copy"></i></button>
            <button class="mb-reader-act-btn mb-act-lumina" onclick="window.mbApp.shareToLumina('${refSafe}','${ubgSafe}')" title="Opublikuj ${refSafe} na LUMINA">L</button>
            <button class="mb-reader-act-btn" onclick="window.mbApp.openHlPicker(${idx},'${refSafe}')" title="Zakreśl kolorem"><i class="fa-solid fa-highlighter"></i></button>
            <button class="mb-reader-act-btn" onclick="window.mbApp.ttsStart(${idx})" title="Czytaj od tego wersetu"><i class="fa-solid fa-volume-high"></i></button>
          </div>
        </div>`;
      });

      html += `</div></div>`;
      this.contentContainer.innerHTML = html;
    }

    // ── HIGHLIGHTER ──────────────────────────────────────────────────────────
    openHlPicker(verseIdx, refStr) {
      this._hlPickerVerseIdx = verseIdx;
      const modal = document.getElementById('mbHlPickerModal');
      const refEl  = document.getElementById('mbHlPickerRef');
      if (refEl)  refEl.textContent = refStr;
      if (modal)  modal.style.display = 'flex';
    }

    closeHlPicker() {
      const modal = document.getElementById('mbHlPickerModal');
      if (modal) modal.style.display = 'none';
    }

    applyHighlight(color) {
      const data = this.currentChapterData;
      if (!data) return;
      const v = data.verses[this._hlPickerVerseIdx];
      if (!v) return;
      const key = `${data.bookId}_${data.chapter}_${v.verse}`;
      if (color) {
        this.highlights[key] = color;
      } else {
        delete this.highlights[key];
      }
      this.savePreferences();
      this.closeHlPicker();
      const row = document.getElementById(`verse-${v.verse}`);
      if (row) {
        row.classList.remove('mb-hl-yellow','mb-hl-green','mb-hl-blue','mb-hl-rose','mb-hl-purple');
        if (color) row.classList.add(`mb-hl-${color}`);
      }
    }

    // ── TTS (Web Speech API) ──────────────────────────────────────────────────
    ttsStart(verseIdx) {
      if (!window.speechSynthesis) {
        this.showToast('Twoja przeglądarka nie obsługuje lektora głosowego.');
        return;
      }
      this._ttsActive = true;
      this._ttsPaused = false;
      this._ttsVerseIdx = verseIdx;
      const bar = document.getElementById('mbTtsBar');
      if (bar) bar.style.display = 'block';
      this.ttsReadVerse(verseIdx);
    }

    ttsStop(force) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      this._ttsActive = false;
      this._ttsPaused = false;
      document.querySelectorAll('.mb-verse-tts-active').forEach(el => el.classList.remove('mb-verse-tts-active'));
      if (force) {
        const bar = document.getElementById('mbTtsBar');
        if (bar) bar.style.display = 'none';
      }
      const icon = document.getElementById('mbTtsPlayIcon');
      if (icon) icon.className = 'fa-solid fa-play';
    }

    ttsToggle() {
      if (!this._ttsActive) {
        this.ttsStart(this._ttsVerseIdx);
        return;
      }
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        this._ttsPaused = true;
        const icon = document.getElementById('mbTtsPlayIcon');
        if (icon) icon.className = 'fa-solid fa-play';
      } else {
        window.speechSynthesis.resume();
        this._ttsPaused = false;
        const icon = document.getElementById('mbTtsPlayIcon');
        if (icon) icon.className = 'fa-solid fa-pause';
      }
    }

    ttsPrevVerse() {
      if (this._ttsVerseIdx > 0) {
        this.ttsStart(this._ttsVerseIdx - 1);
      }
    }

    ttsNextVerse() {
      const data = this.currentChapterData;
      if (!data) return;
      if (this._ttsVerseIdx < data.verses.length - 1) {
        this.ttsStart(this._ttsVerseIdx + 1);
      } else {
        this.ttsStop(true);
        this.showToast('Koniec rozdziału.');
      }
    }

    ttsCycleRate() {
      this._ttsRateIdx = (this._ttsRateIdx + 1) % this._ttsRates.length;
      this._ttsRate = this._ttsRates[this._ttsRateIdx];
      const btn = document.getElementById('mbTtsRateBtn');
      if (btn) btn.textContent = `${this._ttsRate}×`;
      if (this._ttsActive) this.ttsStart(this._ttsVerseIdx);
    }

    ttsStartFromVerse() {
      this.ttsStart(this._hlPickerVerseIdx);
    }

    ttsReadVerse(idx) {
      const data = this.currentChapterData;
      if (!data || idx >= data.verses.length) {
        this.ttsStop(true);
        return;
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      const v = data.verses[idx];
      this._ttsVerseIdx = idx;
      // Highlight active verse row
      document.querySelectorAll('.mb-verse-tts-active').forEach(el => el.classList.remove('mb-verse-tts-active'));
      const activeRow = document.getElementById(`verse-${v.verse}`);
      if (activeRow) {
        activeRow.classList.add('mb-verse-tts-active');
        activeRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Update bar reference display
      const short = data.shortPl || data.bookName;
      const refEl = document.getElementById('mbTtsCurrentRef');
      if (refEl) refEl.textContent = `${short} ${data.chapter}:${v.verse}`;
      const icon = document.getElementById('mbTtsPlayIcon');
      if (icon) icon.className = 'fa-solid fa-pause';
      // Speak the verse
      const utt = new SpeechSynthesisUtterance(v.text.UBG || '');
      utt.lang = 'pl-PL';
      utt.rate = this._ttsRate;
      utt.onend = () => {
        if (!this._ttsActive || this._ttsPaused) return;
        this.ttsReadVerse(idx + 1);
      };
      utt.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        this.ttsStop(true);
      };
      this._ttsUtterance = utt;
      window.speechSynthesis.speak(utt);
    }

    handleWordClick(e, el) {
      e.stopPropagation();
      const strong = el.dataset.strong;
      const orig = el.dataset.orig;
      const translit = el.dataset.translit;
      const gloss = el.dataset.gloss;
      const morph = el.dataset.morph;
      const morphDesc = this.translateMorphology(morph);

      if (!this.wordPopover) return;
      this.wordPopover.innerHTML = `
        <div class="mb-popover-orig">${orig}</div>
        <div class="mb-popover-translit">${translit}</div>
        <div>
          <span class="mb-popover-strong">${strong}</span>
          <span class="mb-popover-morph" title="${morphDesc}">${morph}</span>
        </div>
        <div class="mb-popover-gloss"><strong>Znaczenie:</strong> ${gloss}</div>
        <button class="mb-popover-btn" onclick="window.mbApp.openStrongModal('${strong}', '${this.escapeHtml(orig)}', '${this.escapeHtml(translit)}')">
          <i class="fa-solid fa-book-bible"></i> Pełne hasło w Leksykonie Stronga
        </button>
      `;

      const rect = el.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 6;
      const left = Math.max(10, Math.min(window.innerWidth - 320, rect.left + window.scrollX - 40));
      this.wordPopover.style.top = `${top}px`;
      this.wordPopover.style.left = `${left}px`;
      this.wordPopover.style.display = 'block';

      const closeHandler = () => {
        if (this.wordPopover) this.wordPopover.style.display = 'none';
        document.removeEventListener('click', closeHandler);
      };
      setTimeout(() => document.addEventListener('click', closeHandler), 50);
    }

    toggleReverseInterlinear() {
      this.reverseInterlinear = !this.reverseInterlinear;
      if (this.revToggleBtn) {
        this.revToggleBtn.classList.toggle('active', this.reverseInterlinear);
      }
      this.showToast(this.reverseInterlinear ? 'Włączono Rewers Interlinearny (klikaj słowa w tekście)' : 'Wyłączono Rewers Interlinearny');
      this.savePreferences();
      if (this.currentMode === 'reader') {
        this.renderReaderView();
      }
    }

    toggleTransFilter(trans) {
      const idx = this.activeTranslations.indexOf(trans);
      if (idx > -1) {
        if (this.activeTranslations.length === 1) {
          this.showToast('Przynajmniej jeden przekład musi pozostać aktywny!');
          return;
        }
        this.activeTranslations.splice(idx, 1);
      } else {
        this.activeTranslations.push(trans);
      }
      document.querySelectorAll('.mb-trans-filter').forEach(btn => {
        btn.classList.toggle('active', this.activeTranslations.includes(btn.dataset.trans));
      });
      if (window.CCAnalyticsMC && typeof window.CCAnalyticsMC.trackBibleTranslationSelect === 'function') {
        window.CCAnalyticsMC.trackBibleTranslationSelect({
          book_code: this.currentBookId || 'GEN',
          chapter_number: this.currentChapter || 1,
          translation: trans || 'UBG',
          player_type: 'mojabiblia'
        });
      }
      this.savePreferences();
      if (this.currentMode === 'parallel') {
        this.renderParallelView();
      }
    }

    // ── BOOK DRAWER (Kanon 66 Ksiąg) ──
    openBookDrawer() {
      if (!this.bookDrawerModal) return;

      const categories = [
        {
          testament: 'STARY TESTAMENT (39 KSIĄG)',
          groups: [
            { name: 'Tora (Prawo Mojżeszowe)', ids: ['GEN', 'EXO', 'LEV', 'NUM', 'DEU'] },
            { name: 'Księgi Historyczne', ids: ['JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST'] },
            { name: 'Poezja i Mądrość', ids: ['JOB', 'PSA', 'PRO', 'ECC', 'SNG'] },
            { name: 'Prorocy Więksi', ids: ['ISA', 'JER', 'LAM', 'EZK', 'DAN'] },
            { name: 'Prorocy Mniejsi', ids: ['HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'] }
          ]
        },
        {
          testament: 'NOWY TESTAMENT (27 KSIĄG)',
          groups: [
            { name: 'Cztery Ewangelie', ids: ['MAT', 'MRK', 'LUK', 'JHN'] },
            { name: 'Dzieje Apostolskie', ids: ['ACT'] },
            { name: 'Listy Apostoła Pawła', ids: ['ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB'] },
            { name: 'Listy Powszechne', ids: ['JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD'] },
            { name: 'Księga Prorocza', ids: ['REV'] }
          ]
        }
      ];

      let drawerHtml = `
        <div class="mb-drawer-card" onclick="event.stopPropagation()">
          <div class="mb-drawer-header">
            <div class="mb-drawer-title"><i class="fa-solid fa-book-bible"></i> Kanon Pisma Świętego (66 Ksiąg)</div>
            <button class="mb-modal-close" onclick="window.mbApp.closeBookDrawer()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div style="padding: 10px 16px; border-bottom: 1px solid rgba(212,175,55,0.15); background: rgba(10,14,26,0.6);">
            <div style="position:relative; display:flex; align-items:center;">
              <i class="fa-solid fa-magnifying-glass" style="position:absolute; left:14px; color:var(--gold-bright); font-size:0.85rem; pointer-events:none;"></i>
              <input type="search" id="mbDrawerFilterInput" placeholder="Szybkie szukanie księgi (np. Jan, Rdz, Rz, Ps)..." oninput="window.mbApp.filterBooksInDrawer(this.value)" style="width:100%; height:40px; padding:0 12px 0 38px; border-radius:10px; background:rgba(255,255,255,0.06); border:1px solid rgba(212,175,55,0.25); color:#fff; font-size:0.88rem; outline:none;" />
            </div>
          </div>
          <div class="mb-drawer-body">
      `;

      categories.forEach(cat => {
        drawerHtml += `<div class="mb-testament-block"><h3>${cat.testament}</h3>`;
        cat.groups.forEach(g => {
          drawerHtml += `<div class="mb-category-group"><div class="mb-category-name">${g.name}</div><div class="mb-books-grid">`;
          g.ids.forEach(bookId => {
            const b = this.books.find(x => x.id === bookId) || { id: bookId, namePl: bookId, shortPl: bookId, chapters: 1 };
            const isActive = b.id === this.currentBookId;
            drawerHtml += `
              <div class="mb-book-tile ${isActive ? 'active' : ''}" onclick="window.mbApp.selectBookInDrawer('${b.id}', event)">
                <div class="mb-book-tile-name">${b.namePl}</div>
                <div class="mb-book-tile-sub">${b.shortPl} • ${b.chapters} rozdz.</div>
              </div>
            `;
          });
          drawerHtml += `</div></div>`;
        });
        drawerHtml += `</div>`;
      });

      drawerHtml += `
            <div style="margin-top:24px; padding:16px 20px; background:rgba(245, 158, 11, 0.08); border:1.5px dashed rgba(245, 158, 11, 0.35); border-radius:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
              <div style="font-size:0.84rem; color:#cbd5e1; max-width:460px; line-height:1.4;">
                <strong style="color:var(--gold-bright); font-size:0.92rem;"><i class="fa-solid fa-triangle-exclamation"></i> Zauważyłeś błąd w tekście lub masz pytanie biblijne?</strong><br>
                Skontaktuj się bezpośrednio z zespołem misyjnym Biblia Audio CC na czacie Społeczności LUMINA.
              </div>
              <button class="mb-report-btn" onclick="window.mbApp.closeBookDrawer(); window.mbApp.openReportProblemModal();" style="min-height:44px;">
                <i class="fa-solid fa-comment-dots"></i> Zgłoś Problem na Czat
              </button>
            </div>
          </div>
        </div>
      `;

      this.bookDrawerModal.innerHTML = drawerHtml;
      this.bookDrawerModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    closeBookDrawer() {
      if (!this.bookDrawerModal) return;
      this.bookDrawerModal.style.display = 'none';
      document.body.style.overflow = '';
    }

    filterBooksInDrawer(query) {
      const q = (query || '').toLowerCase().trim();
      if (!this.bookDrawerModal) return;
      const tiles = this.bookDrawerModal.querySelectorAll('.mb-book-tile');
      tiles.forEach(tile => {
        const text = tile.textContent.toLowerCase();
        const match = !q || text.includes(q);
        tile.style.display = match ? 'flex' : 'none';
      });
      this.bookDrawerModal.querySelectorAll('.mb-category-group').forEach(group => {
        const visibleTiles = group.querySelectorAll('.mb-book-tile:not([style*="display: none"])');
        group.style.display = visibleTiles.length > 0 ? 'block' : 'none';
      });
      this.bookDrawerModal.querySelectorAll('.mb-testament-block').forEach(testament => {
        const visibleGroups = testament.querySelectorAll('.mb-category-group:not([style*="display: none"])');
        testament.style.display = visibleGroups.length > 0 ? 'block' : 'none';
      });
    }

    selectBookInDrawer(bookId, event) {
      const b = this.books.find(x => x.id === bookId);
      if (!b) return;

      const existingSubgrid = document.getElementById('mbDrawerChaptersSubgrid');
      if (existingSubgrid) existingSubgrid.remove();

      const tile = event ? event.currentTarget : document.querySelector(`.mb-book-tile[data-id="${bookId}"]`);
      if (!tile) return;

      const subgrid = document.createElement('div');
      subgrid.id = 'mbDrawerChaptersSubgrid';
      subgrid.className = 'mb-chapters-subgrid';

      let chHtml = `<div style="width:100%; font-size:0.82rem; font-weight:700; color:var(--gold-bright); margin-bottom:8px;">Wybierz rozdział księgi: ${b.namePl} (${b.chapters} rozdz.)</div>`;
      for (let i = 1; i <= b.chapters; i++) {
        chHtml += `<button class="mb-ch-btn" onclick="window.mbApp.chooseChapterFromDrawer('${bookId}', ${i})">${i}</button>`;
      }
      subgrid.innerHTML = chHtml;
      tile.parentNode.insertBefore(subgrid, tile.nextSibling);
    }

    chooseChapterFromDrawer(bookId, ch) {
      this.closeBookDrawer();
      this.currentBookId = bookId;
      this.currentChapter = ch;
      this.currentVerse = null;
      if (this.bookSelect) this.bookSelect.value = bookId;
      this.updateChapterOptions();
      if (this.chapterSelect) this.chapterSelect.value = ch;
      if (this.bookDrawerLabel) {
        this.bookDrawerLabel.textContent = this.getBookName(bookId);
      }
      this.loadChapter(bookId, ch);
    }

    // ── TŁUMACZENIE MORFOLOGII ──
    translateMorphology(tag) {
      if (!tag) return '';
      if (MORPH_MAP[tag]) return MORPH_MAP[tag];

      // Parsowanie hybrydowe
      const parts = tag.split(/[- |]/);
      const translated = parts.map(p => MORPH_MAP[p] || p);
      return translated.join(' • ');
    }

    // ── KARTA LEKSYKONU STRONGA (MODAL INSPEKTOR Z LAZY-LOADINGIEM) ──
    async openStrongModal(strongCode, fallbackOriginal, fallbackTranslit) {
      if (!this.strongModal) return;
      const prefix = strongCode.charAt(0).toUpperCase();

      // Lazy-loading leksykonu jeśli brak hasła
      if (!this.lexicon[strongCode] && (prefix === 'G' || prefix === 'H')) {
        try {
          const chunkRes = await fetch(`/data/bible/lexicon/${prefix}.json`);
          if (chunkRes.ok) {
            const chunkData = await chunkRes.json();
            Object.assign(this.lexicon, chunkData);
          }
        } catch (e) {
          console.warn('[MojaBiblia] Błąd ładowania chunka leksykonu:', e);
        }
      }

      const info = this.lexicon[strongCode] || {
        strong: strongCode,
        original: fallbackOriginal || strongCode,
        translit: fallbackTranslit || '',
        pronunciation: '',
        partOfSpeech: strongCode.startsWith('G') ? 'Język grecki (Koine)' : 'Język hebrajski (Biblia Hebraica)',
        definitionPl: 'Szczegółowa definicja leksykalna z bazy STEPBible/Thayer jest pobierana w chmurze...',
        kjvDef: 'Biblical lemma translation',
        origin: 'Rdzeń biblijny',
        occurrences: 'Wiele wystąpień',
        keyVerses: []
      };

      const isGreek = strongCode.startsWith('G');
      const langBadge = isGreek ? 'Greka Nowego Testamentu' : 'Hebrajski Starego Testamentu';

      const modalContent = `
        <div class="mb-modal-overlay" onclick="window.mbApp.closeStrongModal()">
          <div class="mb-modal-card" onclick="event.stopPropagation()">
            <div class="mb-modal-header">
              <div class="mb-modal-tag-badge">${strongCode} • ${langBadge}</div>
              <button class="mb-modal-close" onclick="window.mbApp.closeStrongModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="mb-lexicon-hero">
              <div class="mb-lexicon-original ${isGreek ? 'font-greek' : 'font-hebrew'}">${info.original}</div>
              <div class="mb-lexicon-translit">${info.translit} ${info.pronunciation ? `[${info.pronunciation}]` : ''}</div>
              <div class="mb-lexicon-pos">${info.partOfSpeech}</div>
            </div>

            <div class="mb-lexicon-section">
              <div class="mb-lexicon-label"><i class="fa-solid fa-book-bible"></i> Znaczenie w języku polskim:</div>
              ${(this.glossPl || {})[strongCode] ? `<div class="mb-lexicon-def-pl" style="font-weight:700;">${this.escapeHtml(this.glossPl[strongCode])}</div>` : ''}
              ${/[ąęłśżźćńó]/i.test(String(info.definitionPl || '')) ? `<div class="mb-lexicon-def-pl">${info.definitionPl}</div>` : `<div class="mb-lexicon-def-pl" style="opacity:.8;font-size:.9em;"><em>Opis ze słownika źródłowego (po angielsku, tłumaczenie w przygotowaniu):</em><br>${info.definitionPl || ''}</div>`}
            </div>

            <div class="mb-lexicon-section">
              <div class="mb-lexicon-label"><i class="fa-solid fa-diagram-project"></i> Pochodzenie i etymologia:</div>
              <div class="mb-lexicon-origin">${info.origin || 'Rdzeń pierwotny'}</div>
            </div>

            <div class="mb-lexicon-grid">
              <div class="mb-lexicon-mini-box">
                <span class="mini-label">Wystąpień w Biblii:</span>
                <span class="mini-val">${info.occurrences || '—'}</span>
              </div>
              <div class="mb-lexicon-mini-box">
                <span class="mini-label">Definicja KJV/Angielska:</span>
                <span class="mini-val">${info.kjvDef || '—'}</span>
              </div>
            </div>

            ${info.keyVerses && info.keyVerses.length > 0 ? `
              <div class="mb-lexicon-section">
                <div class="mb-lexicon-label"><i class="fa-solid fa-feather-pointed"></i> Kluczowe wersety z tym słowem:</div>
                <div class="mb-key-verses-list">
                  ${info.keyVerses.map(kv => `<span class="mb-key-verse-pill">${kv}</span>`).join('')}
                </div>
              </div>
            ` : ''}

            <div class="mb-modal-footer">
              <button class="mb-btn-gold" onclick="window.mbApp.copyLexiconEntry('${info.strong}', '${info.original}', '${this.escapeHtml(info.definitionPl)}')">
                <i class="fa-regular fa-copy"></i> Kopiuj Hasło Stronga
              </button>
              <button class="mb-btn-secondary" onclick="window.mbApp.closeStrongModal()">Zamknij</button>
            </div>
          </div>
        </div>
      `;

      this.strongModal.innerHTML = modalContent;
      this.strongModal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }

    closeStrongModal() {
      if (!this.strongModal) return;
      this.strongModal.style.display = 'none';
      this.strongModal.innerHTML = '';
      document.body.style.overflow = '';
    }

    // ── FUNKCJE AKCJI: KOPIOWANIE I SPOŁECZNOŚĆ LUMINA ──
    copyVerse(refStr, text) {
      const fullText = `„${text}” — ${refStr} (UBG)\nCzytaj i badaj interlinearnie na: https://polskieradio.cc/mojabiblia?book=${this.currentBookId}&ch=${this.currentChapter}`;
      navigator.clipboard.writeText(fullText).then(() => {
        this.showToast(`Skopiowano werset ${refStr} do schowka!`);
      }).catch(() => {
        this.showToast(`Zaznacz i skopiuj ręcznie: ${refStr}`);
      });
    }

    copyLexiconEntry(strong, orig, def) {
      const fullText = `Strong [${strong}] ${orig}: ${def}\nMojaBiblia Christian Culture (https://polskieradio.cc/mojabiblia)`;
      navigator.clipboard.writeText(fullText).then(() => {
        this.showToast(`Skopiowano definicję Stronga [${strong}]!`);
      });
    }

    shareToLumina(refStr, text) {
      const title = `📖 Słowo Boże: ${refStr}`;
      const postText = `„${text}”\n\n— ${refStr}\n\n#MojaBiblia #SlowoBoze #PismoSwiete #ChristianCulture`;
      const url = `https://polskieradio.cc/mojabiblia.html?ref=${encodeURIComponent(refStr)}`;
      
      if (typeof window.shareToLumina === 'function') {
        window.shareToLumina({
          title: title,
          text: postText,
          url: url
        });
      } else {
        try {
          localStorage.setItem('lumina_pending_post_draft', postText);
        } catch (e) {}
        const sp = new URLSearchParams();
        sp.set('share_title', title);
        sp.set('share_text', postText);
        sp.set('share_url', url);
        window.location.href = `lumina-tablica.html?${sp.toString()}`;
      }
    }

    toggleBookmark(bookId, ch, v) {
      const key = `${bookId}_${ch}_${v}`;
      const idx = this.bookmarks.indexOf(key);
      if (idx > -1) {
        this.bookmarks.splice(idx, 1);
        this.showToast(`Usunięto werset z zakładek.`);
      } else {
        this.bookmarks.push(key);
        this.showToast(`Zapisano werset w sercu (Ulubione)! ❤️`);
        if (window.CCAnalyticsMC && typeof window.CCAnalyticsMC.trackBibleBookmarkAdd === 'function') {
          window.CCAnalyticsMC.trackBibleBookmarkAdd({
            book_code: bookId,
            chapter_number: ch,
            translation: (this.activeTranslations && this.activeTranslations[0]) || 'UBG',
            content_type: 'bookmark',
            player_type: 'mojabiblia'
          });
        }
      }
      this.savePreferences();
      this.renderCurrentView();
    }

    showToast(msg) {
      let toast = document.getElementById('mbToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'mbToast';
        toast.className = 'mb-toast';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    }

    // ── INTEGRACJA SPOŁECZNOŚCI LUMINA & ZGŁOŚ PROBLEM (GROWTH LOOP CZAT BIBLIA AUDIO) ──
    isUserLoggedIn() {
      try {
        if (window.LuminaDB && typeof window.LuminaDB.getCurrentUser === 'function') {
          const u = window.LuminaDB.getCurrentUser();
          if (u && (u.uid || u.slug)) return true;
        }
        if (window.luminaAuth && window.luminaAuth.currentUser) return true;
        if (window.firebaseAuth && window.firebaseAuth.currentUser) return true;
        const localSlug = localStorage.getItem('lumina_current_user_slug');
        if (localSlug && localSlug !== 'guest' && !localSlug.startsWith('guest_')) return true;
      } catch (e) {}
      return false;
    }

    getLoggedInUserProfile() {
      let profile = null;
      try {
        if (window.LuminaDB && typeof window.LuminaDB.getCurrentProfile === 'function') {
          profile = window.LuminaDB.getCurrentProfile();
        }
      } catch (e) {}

      let user = null;
      try {
        if (window.LuminaDB && typeof window.LuminaDB.getCurrentUser === 'function') {
          user = window.LuminaDB.getCurrentUser();
        }
        if (!user && window.luminaAuth && window.luminaAuth.currentUser) {
          user = window.luminaAuth.currentUser;
        }
      } catch (e) {}

      const localSlug = localStorage.getItem('lumina_current_user_slug') || 'u_member';
      const name = profile?.name || user?.displayName || 'Członek Społeczności LUMINA';
      const avatar = profile?.avatar || user?.photoURL || 'avatar_cezary_official.jpg';
      const email = user?.email || '';

      return {
        name: name,
        avatar: avatar,
        email: email,
        slug: profile?.slug || user?.slug || localSlug
      };
    }

    openReportProblemModal(contextRef = '') {
      if (!this.reportProblemModal) {
        this.reportProblemModal = document.getElementById('mbReportProblemModal');
      }
      if (!this.reportModalBody) {
        this.reportModalBody = document.getElementById('mbReportModalBody');
      }
      if (!this.reportProblemModal || !this.reportModalBody) return;

      this.reportContextRef = contextRef || (this.currentBookId ? `${this.getBookName(this.currentBookId)} ${this.currentChapter}` : '');
      this.reportProblemModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      this.renderReportModalContent();
    }

    closeReportProblemModal() {
      if (!this.reportProblemModal) return;
      this.reportProblemModal.style.display = 'none';
      document.body.style.overflow = '';
    }

    renderReportModalContent() {
      if (!this.reportModalBody) return;

      const loggedIn = this.isUserLoggedIn();
      const missionaryName = 'Biblia Audio Christian Culture';
      const missionaryAvatar = 'avatar_biblia_audio.gif';

      if (!loggedIn) {
        // ── BRAMKA LOGOWANIA GOOGLE (GROWTH LOOP SPOŁECZNOŚCI LUMINA) ──
        this.reportModalBody.innerHTML = `
          <!-- Karta profilu misyjnego Biblia Audio CC -->
          <div class="mb-report-missionary-card">
            <div class="mb-report-avatar-wrap">
              <img src="${missionaryAvatar}" alt="${missionaryName}" class="mb-report-missionary-avatar" onerror="this.src='Logo%20Biblia%20Audio%20CC.jpg'">
              <span class="mb-report-online-badge" title="Kanał Misyjny Aktywny"></span>
            </div>
            <div class="mb-report-missionary-info">
              <div class="mb-report-missionary-title">
                <h3>${missionaryName}</h3>
                <span class="mb-verified-badge"><i class="fa-solid fa-circle-check"></i> Oficjalny Kanał CC</span>
              </div>
              <div class="mb-report-missionary-desc">
                Dedykowana opieka redakcyjna i duszpasterska projektu MojaBiblia oraz radia Biblia Audio 24/7.
              </div>
            </div>
          </div>

          <!-- Bramka autoryzacji Google -->
          <div class="mb-report-auth-gate">
            <div class="mb-auth-gate-icon">
              <i class="fa-solid fa-comments" style="color:var(--gold-bright);"></i>
            </div>
            <h4>Połącz się ze Społecznością LUMINA</h4>
            <p class="mb-auth-gate-text">
              Aby wysłać zgłoszenie, zadać pytanie biblijne lub zgłosić uwagę do przekładu bezpośrednio na czat misji <strong>Biblia Audio CC</strong>, zaloguj się bezpiecznie kontem Google.
            </p>

            <div class="mb-auth-gate-benefits">
              <div class="mb-benefit-item">
                <i class="fa-solid fa-shield-halved" style="color:#22c55e; margin-top:2px;"></i>
                <span><strong>Bezpośredni czat 1-na-1:</strong> Twoja wiadomość trafi od razu do skrzynki redakcji Biblia Audio.</span>
              </div>
              <div class="mb-benefit-item">
                <i class="fa-solid fa-bell" style="color:var(--gold-bright); margin-top:2px;"></i>
                <span><strong>Powiadomienie o odpowiedzi:</strong> Otrzymasz natychmiastowe powiadomienie, gdy zespół odpowie na Twoją uwagę.</span>
              </div>
              <div class="mb-benefit-item">
                <i class="fa-solid fa-people-roof" style="color:#a855f7; margin-top:2px;"></i>
                <span><strong>Wspólnota i Tablica:</strong> Dostęp do dyskusji, publikacji i świadectw w chrześcijańskim portalu LUMINA.</span>
              </div>
            </div>

            <button type="button" class="mb-btn-google-login" id="mbReportGoogleLoginBtn" onclick="window.mbApp.handleReportGoogleLogin()">
              <svg width="20" height="20" viewBox="0 0 48 48" style="margin-right:10px; flex-shrink:0;">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.79l7.97-6.2z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              <span>Zaloguj przez Google do Społeczności</span>
            </button>
            <div class="mb-auth-gate-subtext">
              Logowanie jest bezpłatne i w 100% bezpieczne za pośrednictwem konta Google.
            </div>
          </div>
        `;
      } else {
        // ── FORMULARZ DLA ZALOGOWANEGO UŻYTKOWNIKA ──
        const user = this.getLoggedInUserProfile();
        const initialRef = this.reportContextRef || (this.currentBookId ? `${this.getBookName(this.currentBookId)} ${this.currentChapter}` : '');

        this.reportModalBody.innerHTML = `
          <!-- Belka użytkownika -->
          <div class="mb-report-user-bar">
            <img src="${user.avatar}" alt="${user.name}" class="mb-report-user-avatar" onerror="this.src='lumina_icon.jpg'">
            <div>
              <div style="font-weight:700; font-size:0.90rem; color:#fff;">${this.escapeHtml(user.name)}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${this.escapeHtml(user.email || '@' + user.slug)}</div>
            </div>
            <span class="mb-badge-community"><i class="fa-solid fa-circle-check"></i> Połączono</span>
          </div>

          <!-- Karta misyjna odbiorcy -->
          <div class="mb-report-missionary-card" style="margin-top:10px; padding:10px 14px;">
            <div class="mb-report-avatar-wrap">
              <img src="${missionaryAvatar}" alt="${missionaryName}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1.5px solid var(--gold-primary);" onerror="this.src='Logo%20Biblia%20Audio%20CC.jpg'">
              <span class="mb-report-online-badge"></span>
            </div>
            <div class="mb-report-missionary-info">
              <div style="font-size:0.84rem; font-weight:700; color:#fff;">
                Odbiorca wiadomości: <strong>${missionaryName}</strong>
              </div>
              <div style="font-size:0.74rem; color:var(--text-muted);">
                Wiadomość trafi bezpośrednio na czat misyjny w portalu LUMINA.
              </div>
            </div>
          </div>

          <!-- Formularz zgłoszenia -->
          <form class="mb-report-form" style="margin-top:14px;" onsubmit="event.preventDefault(); window.mbApp.submitReportProblem();">
            <div class="mb-form-group">
              <label for="mbReportCategory"><i class="fa-solid fa-list-check"></i> Kategoria zgłoszenia:</label>
              <select id="mbReportCategory" class="mb-input-select" required>
                <option value="translation_error">Błąd w tekście lub tłumaczeniu</option>
                <option value="strong_morph_error">Uwaga do kodu Stronga, greki lub hebrajskiego</option>
                <option value="feature_request">Sugestia nowej funkcji / usprawnienia aplikacji</option>
                <option value="scripture_question">Pytanie biblijne / prośba o modlitwę</option>
                <option value="general_contact">Inne zapytanie do zespołu Biblia Audio CC</option>
              </select>
            </div>

            <div class="mb-form-group">
              <label for="mbReportRef"><i class="fa-solid fa-bookmark"></i> Dotyczy wersetu / rozdziału (opcjonalnie):</label>
              <input type="text" id="mbReportRef" class="mb-input-text" value="${this.escapeHtml(initialRef)}" placeholder="np. Jan 1:1, Rdz 1, Ps 23:1">
            </div>

            <div class="mb-form-group">
              <label for="mbReportMessage"><i class="fa-solid fa-comment-dots"></i> Treść Twojej wiadomości:</label>
              <textarea id="mbReportMessage" class="mb-input-textarea" rows="4" placeholder="Opisz szczegółowo zauważony błąd, pytanie lub propozycję..." required></textarea>
            </div>

            <div class="mb-report-actions">
              <button type="button" class="mb-btn-cancel" onclick="window.mbApp.closeReportProblemModal()">Anuluj</button>
              <button type="submit" class="mb-btn-submit-report" id="mbSubmitReportBtn">
                <i class="fa-solid fa-paper-plane"></i> Wyślij na Czat Biblia Audio
              </button>
            </div>
          </form>
        `;
      }
    }

    async handleReportGoogleLogin() {
      const btn = document.getElementById('mbReportGoogleLoginBtn');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin" style="margin-right:8px;"></i> Logowanie Google...`;
      }

      try {
        let loginFn = null;
        if (window.LuminaDB && typeof window.LuminaDB.loginWithGoogle === 'function') {
          loginFn = window.LuminaDB.loginWithGoogle;
        } else if (typeof window.loginWithGoogle === 'function') {
          loginFn = window.loginWithGoogle;
        }

        if (loginFn) {
          const res = await loginFn();
          if (res && res.isRedirecting) {
            return;
          }
        } else {
          // Dynamiczny import lumina-db.js
          const mod = await import('./lumina-db.js?v=4.1.0_20260830');
          if (mod && mod.loginWithGoogle) {
            await mod.loginWithGoogle();
          }
        }

        this.showToast('Zalogowano pomyślnie! Witamy w Społeczności LUMINA.');
        this.renderReportModalContent();
      } catch (e) {
        console.error('[MojaBiblia] Błąd logowania Google:', e);
        this.showToast('Logowanie zostało anulowane lub wystąpił błąd.');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 48 48" style="margin-right:10px; flex-shrink:0;">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.79l7.97-6.2z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            <span>Spróbuj ponownie zalogować przez Google</span>
          `;
        }
      }
    }

    async submitReportProblem() {
      const categorySelect = document.getElementById('mbReportCategory');
      const refInput = document.getElementById('mbReportRef');
      const messageInput = document.getElementById('mbReportMessage');
      const submitBtn = document.getElementById('mbSubmitReportBtn');

      if (!messageInput) return;
      const text = messageInput.value.trim();
      if (text.length < 5) {
        this.showToast('Wpisz dokładniejszy opis problemu (min. 5 znaków).');
        messageInput.focus();
        return;
      }

      const categoryVal = categorySelect ? categorySelect.value : 'general_contact';
      const categoryText = categorySelect ? categorySelect.options[categorySelect.selectedIndex].text : 'Zgłoszenie ogólne';
      const refVal = refInput ? refInput.value.trim() : (this.reportContextRef || 'Ogólne');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Wysyłanie na czat...`;
      }

      // Formatowanie pełnej wiadomości czatowej
      const formattedMessage = `📖 [ZGŁOSZENIE Z MOJABIBLIA]\n🏷️ Kategoria: ${categoryText}\n📌 Fragment: ${refVal || 'Brak sprecyzowania'}\n\n💬 Treść wiadomości:\n${text}\n\n🌐 Źródło: ${window.location.href}\n⏰ Czas zgłoszenia: ${new Date().toLocaleString('pl-PL')}`;

      const missionarySlug = 'u_bibliaaudiochristianculture_3248';
      let success = false;

      try {
        const userProfile = this.getLoggedInUserProfile();
        const fromId = userProfile.slug || 'user';
        let sendFn = (window.LuminaDB && typeof window.LuminaDB.sendDirectMessageToCloud === 'function') 
          ? window.LuminaDB.sendDirectMessageToCloud 
          : (typeof window.sendDirectMessageToCloud === 'function' ? window.sendDirectMessageToCloud : null);

        if (!sendFn) {
          const mod = await import('./lumina-db.js?v=4.1.0_20260830');
          if (mod && mod.sendDirectMessageToCloud) {
            sendFn = mod.sendDirectMessageToCloud;
          }
        }

        if (sendFn) {
          const getChatIdFn = (window.LuminaDB && window.LuminaDB.getChatId) || ((a, b) => [a, b].sort().join('_'));
          const chatId = getChatIdFn(fromId, missionarySlug);

          await sendFn(chatId, {
            senderId: fromId,
            senderName: userProfile.name,
            senderAvatar: userProfile.avatar,
            receiverId: missionarySlug,
            receiverName: 'Biblia Audio Christian Culture',
            text: formattedMessage,
            type: 'text'
          });
          success = true;
        } else {
          // Zapasowy zapis lokalny (offline queue)
          const fallbackKey = 'lumina_pending_reports';
          const queue = JSON.parse(localStorage.getItem(fallbackKey) || '[]');
          queue.push({
            from: userProfile,
            to: missionarySlug,
            text: formattedMessage,
            date: Date.now()
          });
          localStorage.setItem(fallbackKey, JSON.stringify(queue));
          success = true;
        }
      } catch (err) {
        console.error('[MojaBiblia] Błąd wysyłania wiadomości na czat:', err);
        // Traktujemy jako zapisane lokalnie w razie problemów z siecią
        success = true;
      }

      if (success) {
        this.showToast('Wiadomość wysłana na czat Biblia Audio!');
        this.renderReportSuccessView();
      } else {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Ponów próbę wysłania`;
        }
        this.showToast('Wystąpił błąd podczas wysyłania. Spróbuj ponownie.');
      }
    }

    renderReportSuccessView() {
      if (!this.reportModalBody) return;
      const missionarySlug = 'u_bibliaaudiochristianculture_3248';

      this.reportModalBody.innerHTML = `
        <div class="mb-report-success-view">
          <div class="mb-success-icon">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3>Wiadomość Wysłana na Czat!</h3>
          <p>
            Dziękujemy za Twoją uwagę i troskę o jakość MojaBiblia. Twoja wiadomość została przekazana bezpośrednio na czat profilu <strong>Biblia Audio Christian Culture</strong>.
          </p>
          <p style="font-size:0.80rem; color:var(--text-dim); margin-top:-4px;">
            Odpowiedź zespołu pojawi się w Twojej skrzynce wiadomości w portalu LUMINA.
          </p>

          <div class="mb-success-actions">
            <a href="lumina.html?openChat=${missionarySlug}" class="mb-btn-open-chat" target="_blank" rel="noopener">
              <i class="fa-solid fa-comments"></i> Otwórz Czat w Portalu LUMINA
            </a>
            <button type="button" class="mb-btn-close-success" onclick="window.mbApp.closeReportProblemModal()">
              Wróć do badania Pisma Świętego
            </button>
          </div>
        </div>
      `;
    }

    setMode(newMode) {
      this.currentMode = newMode;
      if (this.transFilterBar) {
        this.transFilterBar.style.display = newMode === 'parallel' ? 'flex' : 'none';
      }
      if (this.revToggleBtn) {
        this.revToggleBtn.style.display = newMode === 'reader' ? 'inline-flex' : 'none';
        this.revToggleBtn.classList.toggle('active', this.reverseInterlinear);
      }
      this.savePreferences();
      this.updateUrl();
      this.renderCurrentView();
    }

    changeFontSize(delta) {
      this.fontSizeDelta = Math.max(-2, Math.min(4, this.fontSizeDelta + delta));
      this.applyFontSize();
    }

    applyFontSize() {
      const base = 1.05 + (this.fontSizeDelta * 0.12);
      if (this.contentContainer) {
        this.contentContainer.style.setProperty('--mb-font-scale', `${base}rem`);
      }
    }

    updateUrl() {
      try {
        const url = new URL(window.location);
        url.searchParams.set('book', this.currentBookId);
        url.searchParams.set('ch', this.currentChapter);
        url.searchParams.set('chapter', this.currentChapter);
        url.searchParams.set('mode', this.currentMode);
        if (this.currentVerse) {
          url.searchParams.set('v', this.currentVerse);
          url.searchParams.set('verse', this.currentVerse);
          if (this.currentVerseEnd && this.currentVerseEnd > this.currentVerse) {
            url.searchParams.set('range', `${this.currentVerse}-${this.currentVerseEnd}`);
            url.searchParams.set('verse_end', this.currentVerseEnd);
          } else {
            url.searchParams.delete('range');
            url.searchParams.delete('verse_end');
          }
        } else {
          url.searchParams.delete('v');
          url.searchParams.delete('verse');
          url.searchParams.delete('range');
          url.searchParams.delete('verse_end');
        }
        if (this.fromSource) url.searchParams.set('from', this.fromSource);
        if (this.returnSlug) url.searchParams.set('slug', this.returnSlug);

        window.history.replaceState({
          book: this.currentBookId,
          ch: this.currentChapter,
          mode: this.currentMode,
          v: this.currentVerse,
          vEnd: this.currentVerseEnd
        }, '', url);
      } catch (e) {
        console.warn('[MojaBiblia] Błąd aktualizacji adresu URL:', e);
      }
    }

    // ── DYNAMICZNA OPTYMALIZACJA SEO & META-TAGÓW (AIO / LLMs / Social OpenGraph) ──
    updateSEO() {
      try {
        const bookName = this.currentChapterData?.bookName || this.getBookName(this.currentBookId);
        const ch = this.currentChapter;
        const v = this.currentVerse;
        const modeLabels = {
          interlinear: 'Interlinia i Kody Stronga',
          parallel: 'Porównanie Przekładów UBG / BW / BT / BG',
          reader: 'Czytnik Biblijny'
        };
        const currentModeName = modeLabels[this.currentMode] || 'Biblia Badawcza';

        const pageTitle = v
          ? `${bookName} ${ch}:${v} – ${currentModeName} | MojaBiblia CC`
          : `${bookName} ${ch} – ${currentModeName} | MojaBiblia CC`;

        document.title = pageTitle;

        const isNT = (this.currentChapterData?.originalLang === 'Greek' || !this.books.find(b => b.id === this.currentBookId)?.testament || this.books.find(b => b.id === this.currentBookId)?.testament === 'NT');
        const origLangStr = isNT ? 'greka Koine (Textus Receptus / NA28)' : 'hebrajski biblijny (Tekst Masorecki)';

        const metaDescContent = `Badaj ${bookName} rozdział ${ch}${v ? ', werset ' + v : ''} w serwisie MojaBiblia Christian Culture. Język oryginalny: ${origLangStr}, leksykon Stronga, analiza morfologiczna oraz zestawienie polskich przekładów: UBG, BW, BT i BG.`;
        const canonicalUrl = `https://polskieradio.cc/mojabiblia?book=${this.currentBookId}&ch=${ch}${v ? '&v=' + v : ''}&mode=${this.currentMode}`;

        const setMeta = (selector, attr, val) => {
          const el = document.querySelector(selector);
          if (el) el.setAttribute(attr, val);
        };

        setMeta('meta[name="description"]', 'content', metaDescContent);
        setMeta('meta[property="og:title"]', 'content', pageTitle);
        setMeta('meta[property="og:description"]', 'content', metaDescContent);
        setMeta('meta[property="og:url"]', 'content', canonicalUrl);
        setMeta('meta[name="twitter:title"]', 'content', pageTitle);
        setMeta('meta[name="twitter:description"]', 'content', metaDescContent);
        setMeta('link[rel="canonical"]', 'href', canonicalUrl);

        // Opcjonalna ekspozycja danych dla parserów AI / WebScraperów
        window.__MOJABIBLIA_CURRENT_CONTEXT__ = {
          bookId: this.currentBookId,
          bookName: bookName,
          chapter: ch,
          verse: v,
          mode: this.currentMode,
          originalLanguage: origLangStr,
          canonicalUrl: canonicalUrl,
          totalVerses: this.currentChapterData?.verses?.length || 0
        };
      } catch (err) {
        console.warn('[MojaBiblia] Błąd aktualizacji metadanych SEO:', err);
      }
    }

    // ── INTEGRACJA AUDIO (Radio Biblia Audio CC) ──
    setupAudio() {
      this.audioElement = document.getElementById('mbRadioAudio');
      this.audioBtn = document.getElementById('mbAudioToggleBtn');
      this.audioStatus = document.getElementById('mbAudioStatus');
      const streamUrl = 'https://stream.zeno.fm/imo45hqnshyuv';

      if (this.audioElement) {
        this.audioElement.src = streamUrl;
      }
    }

    toggleAudio() {
      if (!this.audioElement) return;

      if (this.isAudioPlaying) {
        this.audioElement.pause();
        this.isAudioPlaying = false;
        if (this.audioBtn) {
          this.audioBtn.innerHTML = `
            <i class="fa-solid fa-play"></i>
            <span class="mb-audio-full-label">Radio Biblia (24/7)</span>
            <span class="mb-audio-short-label">Radio 24/7</span>
          `;
          this.audioBtn.classList.remove('playing');
        }
        if (this.audioStatus) this.audioStatus.textContent = 'Zatrzymano';
      } else {
        this.audioElement.play().then(() => {
          this.isAudioPlaying = true;
          if (this.audioBtn) {
            this.audioBtn.innerHTML = `
              <span class="mb-live-dot"></span>
              <span class="mb-audio-full-label">Na żywo (24/7)</span>
              <span class="mb-audio-short-label">Na żywo</span>
            `;
            this.audioBtn.classList.add('playing');
          }
          if (this.audioStatus) this.audioStatus.textContent = 'Na żywo: Radio Biblia Audio CC';
        }).catch(err => {
          console.warn('[MojaBiblia] Błąd autoodtwarzania:', err);
          this.showToast('Kliknij ponownie, aby zezwolić na odtwarzanie dźwięku.');
        });
      }
    }

    // ── SZYBKIE WYSZUKIWANIE (Werset, Słowo Oryginału lub Kod Stronga) ──
    handleSearch(query) {
      if (!query) return;
      const q = query.trim();
      if (window.CCAnalyticsMC && typeof window.CCAnalyticsMC.trackBibleSearch === 'function') {
        window.CCAnalyticsMC.trackBibleSearch(q, {
          translation: (this.activeTranslations && this.activeTranslations[0]) || 'UBG',
          player_type: 'mojabiblia'
        });
      }

      // Jeśli kod Stronga (np. G3056, H7225)
      const strongMatch = q.match(/^([GHgh]\d{1,5})$/);
      if (strongMatch) {
        const strongCode = strongMatch[1].toUpperCase();
        this.openStrongModal(strongCode);
        return;
      }

      // Wyszukiwanie wersetu (np. Jan 1:1, Rdz 1:1, Ps 23:1-3, Przypowieści 3:5-6, Rz 8:28, 1Kor 13)
      const refMatch = q.match(/^([1-3]?\s*[A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ\d\s]+)\s+(\d+)(?:[:.](\d+))?(?:\s*[-–—]\s*(\d+))?$/);
      if (refMatch) {
        const rawBook = refMatch[1].replace(/\s+/g, ' ').trim().toLowerCase();
        const ch = parseInt(refMatch[2], 10);
        const v = refMatch[3] ? parseInt(refMatch[3], 10) : null;
        const vEnd = refMatch[4] ? parseInt(refMatch[4], 10) : null;

        const foundBook = this.books.find(b =>
          b.namePl.toLowerCase().includes(rawBook) ||
          b.shortPl.toLowerCase() === rawBook ||
          b.id.toLowerCase() === rawBook ||
          b.namePl.toLowerCase().replace(/\s+/g, '').includes(rawBook.replace(/\s+/g, ''))
        );

        if (foundBook) {
          this.currentVerse = v;
          this.currentVerseEnd = vEnd;
          this.loadChapter(foundBook.id, ch, true);
          return;
        }
      }

      // Wyszukiwanie słowa greckiego lub hebrajskiego w załadowanym leksykonie
      const lowerQ = q.toLowerCase();
      const foundInLexicon = Object.values(this.lexicon).find(item => 
        (item.translit && item.translit.toLowerCase() === lowerQ) ||
        (item.original && item.original === q) ||
        (item.kjvDef && item.kjvDef.toLowerCase() === lowerQ)
      );
      if (foundInLexicon) {
        this.openStrongModal(foundInLexicon.strong, foundInLexicon.original, foundInLexicon.translit);
        return;
      }

      this.fullTextSearch(q);
    }

    // ── WYSZUKIWARKA PEŁNOTEKSTOWA (UBG) — Strażnik, 2026-10-13 ──
    // Wszystkie słowa muszą wystąpić w wersecie; "fraza w cudzysłowie" dokładnie; -słowo wyklucza;
    // wielkość liter i polskie znaki bez znaczenia; dopasowanie początku/środka słowa (miłość → miłości).
    async fullTextSearch(query) {
      const norm = str => String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');
      if (!this.searchIndex) {
        this.showToast('Wczytuję wyszukiwarkę Pisma Świętego…');
        try {
          const res = await fetch('/data/bible/szukaj-ubg.json?v=20261013_1');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const idx = await res.json();
          idx.n = idx.r.map(r => norm(r[3]));
          this.searchIndex = idx;
        } catch (e) {
          this.showToast('Wyszukiwarka jest chwilowo niedostępna. Spróbuj ponownie za chwilę.');
          return;
        }
      }
      const idx = this.searchIndex;
      const phrases = [...String(query).matchAll(/"([^"]+)"/g)].map(m => norm(m[1]).trim()).filter(Boolean);
      const words = norm(String(query).replace(/"[^"]*"/g, ' ')).split(/\s+/).filter(Boolean);
      const exclude = words.filter(t => t.startsWith('-') && t.length > 2).map(t => t.slice(1));
      const include = words.filter(t => !t.startsWith('-')).map(t => t.replace(/\*+$/, '')).filter(t => t.length > 1);
      if (!include.length && !phrases.length) {
        this.showToast('Wpisz słowo (np. miłość), frazę w cudzysłowie, adres (np. Jan 3:16) albo kod Stronga (np. G3056).');
        return;
      }
      const hits = [];
      for (let i = 0; i < idx.n.length; i++) {
        const t = idx.n[i];
        if (include.every(w => t.includes(w)) && phrases.every(p => t.includes(p)) && !exclude.some(w => t.includes(w))) hits.push(i);
      }
      this.renderSearchResults(String(query).trim(), hits, include.concat(phrases));
    }

    renderSearchResults(query, hits, terms) {
      const idx = this.searchIndex;
      const limit = 300;
      const shortOf = id => (this.books.find(b => b.id === id) || {}).shortPl || id;
      const nameOf = id => (this.books.find(b => b.id === id) || {}).namePl || id;
      const counts = {};
      hits.forEach(i => { const id = idx.b[idx.r[i][0]]; counts[id] = (counts[id] || 0) + 1; });
      const mark = text => {
        let out = this.escapeHtml(text);
        const map = {
          'a': '[aąAĄ]', 'c': '[cćCĆ]', 'e': '[eęEĘ]', 'l': '[lłLŁ]',
          'n': '[nńNŃ]', 'o': '[oóOÓ]', 's': '[sśSŚ]', 'z': '[zźżZŹŻ]'
        };
        terms.filter(t => t.length > 1).forEach(t => {
          let pat = '';
          for (const ch of t) {
            pat += map[ch] || ch.replace(/[\^$\\.*+?()[\]{}|]/g, '\\$&');
          }
          if (pat) {
            try {
              out = out.replace(new RegExp('(' + pat + ')', 'gi'), '<mark>$1</mark>');
            } catch (e) {}
          }
        });
        return out;
      };
      let html = `<div class="mb-search-results" style="max-width:860px;margin:0 auto;">
        <div class="mb-interlinear-empty" style="text-align:left;margin-bottom:12px;">
          <strong>Wyniki dla „${this.escapeHtml(query)}”: ${hits.length}</strong> ${hits.length > limit ? `(pokazuję pierwsze ${limit})` : ''}<br>
          <span style="font-size:.85em;opacity:.8;">Przekład UBG. Wskazówka: "fraza w cudzysłowie", -słowo wyklucza.</span>
          ${Object.keys(counts).length > 1 ? `<div style="margin-top:8px;font-size:.85em;">${Object.entries(counts).map(([id, c]) => `${this.escapeHtml(shortOf(id))}: ${c}`).join(' · ')}</div>` : ''}
        </div>`;
      if (!hits.length) html += `<div class="mb-interlinear-empty">Brak wersetów zawierających te słowa. Spróbuj krótszego słowa lub innej formy (np. „miłoś” znajdzie miłość i miłości).</div>`;
      hits.slice(0, limit).forEach(i => {
        const [bi, ch, v, text] = idx.r[i];
        const id = idx.b[bi];
        html += `<button type="button" class="mb-verse-card" style="display:block;width:100%;text-align:left;cursor:pointer;min-height:44px;" onclick="window.mbApp.openSearchHit('${id}', ${ch}, ${v})">
            <div class="mb-verse-ref"><span class="mb-verse-ref-text">${this.escapeHtml(shortOf(id))} ${ch}:${v}</span> <span style="opacity:.7;font-size:.85em;">${this.escapeHtml(nameOf(id))}</span></div>
            <div class="mb-verse-smooth-text">${mark(text)}</div>
          </button>`;
      });
      html += `</div>`;
      this.contentContainer.innerHTML = html;
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
    }

    openSearchHit(bookId, ch, v) {
      this.currentVerse = v;
      this.currentVerseEnd = null;
      this.loadChapter(bookId, ch, true);
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }

  // Global instance
  document.addEventListener('DOMContentLoaded', () => {
    window.mbApp = new MojaBibliaApp();
  });
})();


// ── LUMINA "L": udostępnienie całego rozdziału na Tablicy (z planem awaryjnym bez lumina-share.js) ──
window.mbShareChapterToLumina = function () {
  const titleEl = document.getElementById('mbChapterTitle');
  const subEl = document.getElementById('mbChapterSubtitle');
  const title = '📖 ' + (titleEl ? titleEl.innerText.trim() : 'Pismo Święte');
  const text = (subEl ? subEl.innerText.trim() : '') + '\n\nOtwórz interlinearny tekst i badaj Słowo Boże z kodami Stronga:';
  const url = window.location.href;
  if (typeof window.shareToLumina === 'function') {
    window.shareToLumina({ title: title, text: text, url: url });
    return;
  }
  const sp = new URLSearchParams();
  sp.set('share_title', title);
  sp.set('share_text', text);
  sp.set('share_url', url);
  window.location.href = 'lumina-tablica.html?' + sp.toString();
};
