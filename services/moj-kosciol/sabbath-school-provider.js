// ============================================================================
// Szkoła Sobotnia PL/EN — LessonProvider Adapter (Etap A: Linki + Metadane)
// Zgodny ze specyfikacją Mój kościół v2.0 (Rozszerzenie Szkoła Sobotnia)
// ZERO COST • Bez kopiowania pełnych treści bez pisemnej zgody wydawcy
// ============================================================================

export const SABBATH_SCHOOL_SOURCES = Object.freeze({
  pl: [
    {
      id: 'adwent-pl-ss',
      name: 'Sekretariat Szkoły Sobotniej KADS w RP',
      url: 'https://adwent.pl/sekretariaty/sekretariat-szkoly-sobotniej/',
      kind: 'official_portal',
      locale: 'pl',
      rightsNote: 'Oficjalny portal — tryb linków i metadanych (Etap A).'
    },
    {
      id: 'adwent-pl-czas-misji',
      name: 'Czas Misji — działalność misyjna w Szkole Sobotniej',
      url: 'https://adwent.pl/czas-misji/',
      kind: 'mission_stories',
      locale: 'pl',
      rightsNote: 'Oficjalne relacje misyjne — wyłącznie link.'
    },
    {
      id: 'adventech-pl',
      name: 'Adventech Sabbath School (PL)',
      url: 'https://adventech.io/sabbath-school/',
      kind: 'official_app',
      locale: 'pl',
      rightsNote: 'Aplikacja Adventech — MIT dotyczy kodu, nie treści lekcji.'
    }
  ],
  en: [
    {
      id: 'absg-en',
      name: 'Adult Bible Study Guide (Official EN)',
      url: 'https://absg.sspmadventist.org/',
      kind: 'official_portal',
      locale: 'en',
      rightsNote: 'Official General Conference SSPM portal — links & metadata only (Stage A).'
    },
    {
      id: 'adventech-en',
      name: 'Adventech Sabbath School (EN)',
      url: 'https://adventech.io/sabbath-school/',
      kind: 'official_app',
      locale: 'en',
      rightsNote: 'Code is MIT; lesson text copyright remains with SSPM / GC.'
    },
    {
      id: 'adventist-archives-ss',
      name: 'Adventist Archives — Sabbath School Lessons',
      url: 'https://www.adventistarchives.org/sabbathschoollessons',
      kind: 'archive',
      locale: 'en',
      rightsNote: 'Historical archive link.'
    }
  ]
});

export const SABBATH_SCHOOL_LICENSE = Object.freeze({
  id: 'ss-stage-a-links-only',
  sourceUrl: 'https://sabbath-school-resources-assets.adventech.io/en/ss/2026-01/00-introduction/ABSG-2026-01-EN-Intro.pdf',
  rightsHolder: 'General Conference SSPM / Kościół Adwentystów Dnia Siódmego (wydanie polskie)',
  license: 'Stage A — Metadata & Official Links Only (No full-text redistribution without explicit written permission)',
  allowedUses: ['metadata', 'official_link', 'bible_refs_ubg', 'user_private_notes'],
  fullContentImportPermitted: false,
  reviewedAt: '2026-11-28'
});

// Kanoniczny harmonogram kwartałów i tygodni 2026-Q4 / 2027-Q1 (Etap A: wyłącznie metadane redakcyjne + linki oficjalne)
// Jawne mapowanie par PL <-> EN po externalId (nie zakładamy ślepo identycznej numeracji bez mapowania).
const QUARTER_CATALOG = [
  {
    quarter: '2026-Q4',
    startsOn: '2026-09-26',
    endsOn: '2026-12-25',
    titles: {
      pl: 'IV Kwartał 2026 — Tematyka biblijna Szkoły Sobotniej (Etap A · linki oficjalne)',
      en: 'Q4 2026 — Adult Bible Study Guide (Stage A · official links)'
    },
    lessons: [
      {
        externalId: '2026-Q4-L08',
        week: 8,
        startsOn: '2026-11-14',
        endsOn: '2026-11-20',
        discussionDate: '2026-11-21',
        pl: {
          lessonNumber: 8,
          title: 'Lekcja 8 (IV kw. 2026) — Sprawdź aktualny temat na adwent.pl',
          memoryVerseRef: 'J 15:5',
          sourceUrl: 'https://adwent.pl/sekretariaty/sekretariat-szkoly-sobotniej/'
        },
        en: {
          lessonNumber: 8,
          title: 'Lesson 8 (Q4 2026) — Open official Adult Bible Study Guide',
          memoryVerseRef: 'JHN 15:5',
          sourceUrl: 'https://absg.sspmadventist.org/'
        },
        bibleRefs: ['J 15:1-12', 'Ps 119:105']
      },
      {
        externalId: '2026-Q4-L09',
        week: 9,
        startsOn: '2026-11-21',
        endsOn: '2026-11-27',
        discussionDate: '2026-11-28',
        pl: {
          lessonNumber: 9,
          title: 'Lekcja 9 (IV kw. 2026) — Studium Słowa Bożego (omówienie: sobota 28.11.2026)',
          memoryVerseRef: 'Ps 119:18',
          sourceUrl: 'https://adwent.pl/sekretariaty/sekretariat-szkoly-sobotniej/'
        },
        en: {
          lessonNumber: 9,
          title: 'Lesson 9 (Q4 2026) — Bible Study Guide (Sabbath discussion: Nov 28, 2026)',
          memoryVerseRef: 'PSA 119:18',
          sourceUrl: 'https://absg.sspmadventist.org/'
        },
        bibleRefs: ['Ps 119:18', '2 Tm 3:16-17', 'Wj 20:8-11']
      },
      {
        externalId: '2026-Q4-L10',
        week: 10,
        startsOn: '2026-11-28',
        endsOn: '2026-12-04',
        discussionDate: '2026-12-05',
        pl: {
          lessonNumber: 10,
          title: 'Lekcja 10 (IV kw. 2026) — Przygotowanie tygodniowe (omówienie: sobota 05.12.2026)',
          memoryVerseRef: 'Rz 8:28',
          sourceUrl: 'https://adwent.pl/sekretariaty/sekretariat-szkoly-sobotniej/'
        },
        en: {
          lessonNumber: 10,
          title: 'Lesson 10 (Q4 2026) — Weekly Preparation (Sabbath discussion: Dec 5, 2026)',
          memoryVerseRef: 'ROM 8:28',
          sourceUrl: 'https://absg.sspmadventist.org/'
        },
        bibleRefs: ['Rz 8:28-39', 'Flp 4:6-7']
      },
      {
        externalId: '2026-Q4-L13',
        week: 13,
        startsOn: '2026-12-19',
        endsOn: '2026-12-25',
        discussionDate: '2026-12-26',
        pl: {
          lessonNumber: 13,
          title: 'Lekcja 13 (IV kw. 2026) — Zakończenie kwartału (omówienie: sobota 26.12.2026)',
          memoryVerseRef: 'Obj 22:20',
          sourceUrl: 'https://adwent.pl/sekretariaty/sekretariat-szkoly-sobotniej/'
        },
        en: {
          lessonNumber: 13,
          title: 'Lesson 13 (Q4 2026) — Quarter Finale (Sabbath discussion: Dec 26, 2026)',
          memoryVerseRef: 'REV 22:20',
          sourceUrl: 'https://absg.sspmadventist.org/'
        },
        bibleRefs: ['Obj 22:12-21', 'J 14:1-3']
      }
    ]
  },
  {
    quarter: '2027-Q1',
    startsOn: '2026-12-26',
    endsOn: '2027-03-26',
    titles: {
      pl: 'I Kwartał 2027 — Nowy kwartał Szkoły Sobotniej (Etap A · linki oficjalne)',
      en: 'Q1 2027 — New Quarter Adult Bible Study Guide (Stage A · official links)'
    },
    lessons: [
      {
        externalId: '2027-Q1-L01',
        week: 1,
        startsOn: '2026-12-26',
        endsOn: '2027-01-01',
        discussionDate: '2027-01-02',
        pl: {
          lessonNumber: 1,
          title: 'Lekcja 1 (I kw. 2027) — Otwarcie nowego roku i kwartału (omówienie: 02.01.2027)',
          memoryVerseRef: 'Rdz 1:1',
          sourceUrl: 'https://adwent.pl/sekretariaty/sekretariat-szkoly-sobotniej/'
        },
        en: {
          lessonNumber: 1,
          title: 'Lesson 1 (Q1 2027) — Opening of the New Year & Quarter (Discussion: Jan 2, 2027)',
          memoryVerseRef: 'GEN 1:1',
          sourceUrl: 'https://absg.sspmadventist.org/'
        },
        bibleRefs: ['Rdz 1:1-5', 'J 1:1-5']
      }
    ]
  }
];

export const STUDY_DAYS = Object.freeze([
  { key: 'saturday', pl: 'Sobota (Wprowadzenie)', en: 'Saturday (Introduction)' },
  { key: 'sunday', pl: 'Niedziela', en: 'Sunday' },
  { key: 'monday', pl: 'Poniedziałek', en: 'Monday' },
  { key: 'tuesday', pl: 'Wtorek', en: 'Tuesday' },
  { key: 'wednesday', pl: 'Środa', en: 'Wednesday' },
  { key: 'thursday', pl: 'Czwartek', en: 'Thursday' },
  { key: 'friday', pl: 'Piątek (Do dalszego studium)', en: 'Friday (Further Thought)' }
]);

export function formatIsoDateInTimeZone(dateInput, timeZone = 'Europe/Warsaw') {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput || Date.now());
  if (Number.isNaN(date.getTime())) return null;
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const d = parts.find((p) => p.type === 'day')?.value;
    return y && m && d ? `${y}-${m}-${d}` : date.toISOString().slice(0, 10);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function normalizeLocale(locale = 'pl') {
  return String(locale || 'pl').trim().toLowerCase().startsWith('en') ? 'en' : 'pl';
}

function projectLesson(quarterObj, lesson, locale) {
  const lang = normalizeLocale(locale);
  const localized = lesson[lang] || lesson.pl;
  return {
    provider: 'cc-stage-a-manual-links',
    externalId: lesson.externalId,
    locale: lang,
    quarter: quarterObj.quarter,
    quarterTitle: quarterObj.titles[lang] || quarterObj.titles.pl,
    week: lesson.week,
    lessonNumber: localized.lessonNumber,
    startsOn: lesson.startsOn,
    endsOn: lesson.endsOn,
    discussionDate: lesson.discussionDate,
    title: localized.title,
    memoryVerseRef: localized.memoryVerseRef,
    bibleRefs: [...(lesson.bibleRefs || [])],
    sourceUrl: localized.sourceUrl,
    adventechUrl: 'https://adventech.io/sabbath-school/',
    licenseId: SABBATH_SCHOOL_LICENSE.id,
    license: SABBATH_SCHOOL_LICENSE,
    studyDays: STUDY_DAYS.map((d) => ({ key: d.key, label: d[lang] })),
    readingGuidance: lang === 'en'
      ? 'Read in the presence of the Author — begin with prayer.'
      : 'Czytaj w obecności Autora — zacznij od modlitwy.',
    updatedAt: '2026-11-28T00:00:00Z'
  };
}

export class LessonProvider {
  constructor(options = {}) {
    this.simulateOutage = Boolean(options.simulateOutage);
    this.fullImportApproved = Boolean(options.fullImportApproved); // ZAWSZE false w Etapie A
    this.catalog = Array.isArray(options.catalog) ? options.catalog : QUARTER_CATALOG;
  }

  health() {
    if (this.simulateOutage) {
      return {
        ok: false,
        status: 'degraded_manual_links_only',
        stage: 'A',
        message: 'Zewnętrzne źródło lekcji niedostępne — użyj bezpośrednich linków oficjalnych. Brak fikcyjnych danych.',
        officialSources: SABBATH_SCHOOL_SOURCES,
        checkedAt: new Date().toISOString()
      };
    }
    return {
      ok: true,
      status: 'healthy_stage_a',
      stage: 'A',
      fullImportApproved: this.fullImportApproved,
      licenseId: SABBATH_SCHOOL_LICENSE.id,
      quartersCount: this.catalog.length,
      checkedAt: new Date().toISOString()
    };
  }

  listQuarter(language = 'pl') {
    const lang = normalizeLocale(language);
    if (this.simulateOutage) {
      return { ok: false, error: 'provider_unavailable', quarters: [], officialSources: SABBATH_SCHOOL_SOURCES[lang] };
    }
    return {
      ok: true,
      locale: lang,
      license: SABBATH_SCHOOL_LICENSE,
      quarters: this.catalog.map((q) => ({
        quarter: q.quarter,
        title: q.titles[lang] || q.titles.pl,
        startsOn: q.startsOn,
        endsOn: q.endsOn,
        lessonsCount: q.lessons.length
      }))
    };
  }

  listLessons(quarter, language = 'pl') {
    const lang = normalizeLocale(language);
    if (this.simulateOutage) {
      return { ok: false, error: 'provider_unavailable', lessons: [], officialSources: SABBATH_SCHOOL_SOURCES[lang] };
    }
    const q = this.catalog.find((item) => item.quarter === quarter);
    if (!q) {
      return { ok: false, error: 'quarter_not_found', lessons: [], officialSources: SABBATH_SCHOOL_SOURCES[lang] };
    }
    return {
      ok: true,
      locale: lang,
      quarter: q.quarter,
      license: SABBATH_SCHOOL_LICENSE,
      lessons: q.lessons.map((l) => projectLesson(q, l, lang))
    };
  }

  getLessonMetadata(id, language = 'pl') {
    const lang = normalizeLocale(language);
    if (this.simulateOutage) {
      return { ok: false, error: 'provider_unavailable', lesson: null, officialSources: SABBATH_SCHOOL_SOURCES[lang] };
    }
    for (const q of this.catalog) {
      const hit = q.lessons.find((l) => l.externalId === id);
      if (hit) {
        return { ok: true, lesson: projectLesson(q, hit, lang) };
      }
    }
    return { ok: false, error: 'lesson_not_found', lesson: null, officialSources: SABBATH_SCHOOL_SOURCES[lang] };
  }

  /**
   * Wyznacza bieżącą lekcję wg daty i strefy IANA zboru, rozróżniając:
   * - discussionLesson (omawiana w sobotę w zborze)
   * - preparationLesson (przygotowywana na kolejny tydzień sobota–piątek)
   * Jeśli data wypada poza zakresem katalogu — NIE generuje fikcyjnej lekcji!
   */
  getCurrentLesson({ date = new Date(), timeZone = 'Europe/Warsaw', language = 'pl', mode = 'discussion', lessonId = null } = {}) {
    const lang = normalizeLocale(language);
    if (this.simulateOutage) {
      return {
        ok: false,
        error: 'provider_unavailable',
        detail: 'Źródło lekcji chwilowo niedostępne. Nie wygenerowano fikcyjnej lekcji — skorzystaj z oficjalnych linków.',
        locale: lang,
        officialSources: SABBATH_SCHOOL_SOURCES[lang],
        license: SABBATH_SCHOOL_LICENSE,
        timestamp: new Date().toISOString()
      };
    }

    if (lessonId) {
      const exact = this.getLessonMetadata(lessonId, lang);
      if (exact.ok) {
        return {
          ok: true,
          locale: lang,
          timeZone,
          requestedDate: formatIsoDateInTimeZone(date, timeZone),
          mode: 'pinned_by_id',
          lesson: exact.lesson,
          officialSources: SABBATH_SCHOOL_SOURCES[lang],
          license: SABBATH_SCHOOL_LICENSE,
          timestamp: new Date().toISOString()
        };
      }
    }

    const isoDate = formatIsoDateInTimeZone(date, timeZone);
    if (!isoDate) {
      return { ok: false, error: 'invalid_date', locale: lang, officialSources: SABBATH_SCHOOL_SOURCES[lang] };
    }

    const allEntries = [];
    for (const q of this.catalog) {
      for (const l of q.lessons) allEntries.push({ q, l });
    }

    // 1. Lekcja omawiana dokładnie dziś (sobota discussionDate === isoDate)
    const discussionExact = allEntries.find(({ l }) => l.discussionDate === isoDate);
    // 2. Lekcja przygotowywana na bieżący tydzień (startsOn <= isoDate <= endsOn)
    const prepExact = allEntries.find(({ l }) => isoDate >= l.startsOn && isoDate <= l.endsOn);

    const chosen = mode === 'preparation'
      ? (prepExact || discussionExact)
      : (discussionExact || prepExact);

    if (!chosen) {
      return {
        ok: false,
        error: 'no_lesson_for_date',
        detail: `Brak zweryfikowanego wpisu lekcji dla daty ${isoDate} (${timeZone}). Nie wyświetlamy fikcyjnych danych — otwórz oficjalne źródło.`,
        locale: lang,
        requestedDate: isoDate,
        timeZone,
        officialSources: SABBATH_SCHOOL_SOURCES[lang],
        license: SABBATH_SCHOOL_LICENSE,
        timestamp: new Date().toISOString()
      };
    }

    return {
      ok: true,
      locale: lang,
      timeZone,
      requestedDate: isoDate,
      mode: discussionExact && mode !== 'preparation' ? 'sabbath_discussion' : 'weekly_preparation',
      lesson: projectLesson(chosen.q, chosen.l, lang),
      discussionLesson: discussionExact ? projectLesson(discussionExact.q, discussionExact.l, lang) : null,
      preparationLesson: prepExact ? projectLesson(prepExact.q, prepExact.l, lang) : null,
      officialSources: SABBATH_SCHOOL_SOURCES[lang],
      license: SABBATH_SCHOOL_LICENSE,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Bramka licencyjna Etapu A/B:
   * Blokuje pobieranie lub import pełnych tekstów lekcji bez jawnego zatwierdzenia licencji!
   */
  getPermittedContent(id, language = 'pl', { requestFullImport = false } = {}) {
    const lang = normalizeLocale(language);
    if (requestFullImport && !this.fullImportApproved) {
      return {
        ok: false,
        blocked: true,
        code: 'LICENSE_FULL_IMPORT_BLOCKED',
        detail: 'Import pełnej treści lekcji Szkoły Sobotniej jest zablokowany w Etapie A do czasu uzyskania pisemnej zgody wydawcy (GC SSPM / KADS). Użyj oficjalnych linków.',
        license: SABBATH_SCHOOL_LICENSE,
        officialSources: SABBATH_SCHOOL_SOURCES[lang]
      };
    }
    const meta = this.getLessonMetadata(id, lang);
    if (!meta.ok) return meta;
    return {
      ok: true,
      stage: 'A',
      contentMode: 'links_and_metadata_only',
      lesson: meta.lesson,
      fullTextRedistributed: false,
      officialSources: SABBATH_SCHOOL_SOURCES[lang],
      license: SABBATH_SCHOOL_LICENSE
    };
  }
}

export const defaultLessonProvider = new LessonProvider();
