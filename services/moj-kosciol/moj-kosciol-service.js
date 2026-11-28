// ============================================================================
// Mój kościół — Scrolluj Biblię v2.0 (Backend Service & REST API Handler)
// Model danych niezależny od wyznania • Pilot KADS (DEMO) • ZERO COST FIRST
// Izolacja tenantów • Kontrola ról (RBAC) • LIVE Sync (revision + ETag)
// Finansowe podwójne zatwierdzenie • Licencje śpiewnika • Szkoła Sobotnia PL/EN
// ============================================================================

import {
  LessonProvider,
  SABBATH_SCHOOL_SOURCES,
  SABBATH_SCHOOL_LICENSE,
  defaultLessonProvider
} from './sabbath-school-provider.js';

export const ROLES = Object.freeze(['owner', 'admin', 'editor', 'live_leader', 'treasurer', 'observer']);
export const VERIFICATION_STATUSES = Object.freeze(['unverified', 'pending', 'verified', 'suspended']);
export const GIVING_CATEGORIES = Object.freeze(['tithe', 'local_church', 'sabbath_school', 'mission', 'other_approved']);
export const ANNOUNCEMENT_CATEGORIES = Object.freeze([
  'ogloszenia', 'wydarzenia', 'misja', 'modlitwa', 'mlodziez', 'rodziny', 'muzyka', 'wolontariat', 'pomoc_sasiedzka'
]);

const AGENDA_EDIT_ROLES = new Set(['owner', 'admin', 'editor']);
const LIVE_CONTROL_ROLES = new Set(['owner', 'admin', 'live_leader']);
const FINANCE_ROLES = new Set(['owner', 'treasurer']);
const ADMIN_ROLES = new Set(['owner', 'admin']);

export const SERVICE_TEMPLATES = Object.freeze([
  {
    id: 'sabbath-standard',
    name: 'Nabożeństwo sobotnie — pełny szablon (18 punktów)',
    description: 'Przykładowy, w pełni edytowalny układ ze Szkołą Sobotnią i drugą częścią nabożeństwa.',
    items: [
      { plannedStart: '09:30', plannedDuration: 5, type: 'welcome', title: 'Powitanie' },
      { plannedStart: '09:35', plannedDuration: 5, type: 'hymn', title: 'Pieśń', hymnRefs: [{ hymnalId: 'spiewajmy-panu-kads', edition: 'Śpiewajmy Panu (KADS)', number: 1 }] },
      { plannedStart: '09:40', plannedDuration: 5, type: 'prayer', title: 'Modlitwa' },
      { plannedStart: '09:45', plannedDuration: 15, type: 'mission', title: 'Doświadczenia i Czas Misji', resourceRefs: [{ label: 'Czas Misji — adwent.pl', url: 'https://adwent.pl/czas-misji/' }] },
      { plannedStart: '10:00', plannedDuration: 45, type: 'sabbath_school', title: 'Szkoła Sobotnia', resourceRefs: [{ label: 'Sekretariat Szkoły Sobotniej', url: 'https://adwent.pl/sekretariaty/sekretariat-szkoly-sobotniej/' }] },
      { plannedStart: '10:45', plannedDuration: 5, type: 'offering', title: 'Dary Szkoły Sobotniej' },
      { plannedStart: '10:50', plannedDuration: 10, type: 'hymn_prayer', title: 'Pieśń i modlitwa', hymnRefs: [{ hymnalId: 'spiewajmy-panu-kads', edition: 'Śpiewajmy Panu (KADS)', number: 92 }] },
      { plannedStart: '11:00', plannedDuration: 15, type: 'break', title: 'Przerwa' },
      { plannedStart: '11:15', plannedDuration: 10, type: 'worship_start', title: 'Rozpoczęcie drugiej części', hymnRefs: [{ hymnalId: 'spiewajmy-panu-kads', edition: 'Śpiewajmy Panu (KADS)', number: 6 }] },
      { plannedStart: '11:25', plannedDuration: 5, type: 'announcements', title: 'Ogłoszenia' },
      { plannedStart: '11:30', plannedDuration: 5, type: 'scripture', title: 'Czytanie Biblii', bibleRefs: ['Ps 119:18', 'Wj 20:8-11'] },
      { plannedStart: '11:35', plannedDuration: 5, type: 'giving', title: 'Dziesięciny i dary' },
      { plannedStart: '11:40', plannedDuration: 5, type: 'special_music', title: 'Muzyka specjalna' },
      { plannedStart: '11:45', plannedDuration: 35, type: 'sermon', title: 'Kazanie', bibleRefs: ['J 15:1-8'], sermonMeta: { title: 'Trwajcie we Mnie — Słowo na każdy dzień (DEMO)', preacher: 'Prowadzący (za zgodą — DEMO)', mainRef: 'J 15:5', outline: ['1. Zaproszenie do relacji (J 15:1-4)', '2. Owoc Ducha zamiast wysiłku własnego (J 15:5)', '3. Praktyczne zastosowanie w tygodniu'] } },
      { plannedStart: '12:20', plannedDuration: 5, type: 'appeal', title: 'Apel ewangelizacyjny' },
      { plannedStart: '12:25', plannedDuration: 5, type: 'hymn', title: 'Pieśń końcowa', hymnRefs: [{ hymnalId: 'spiewajmy-panu-kads', edition: 'Śpiewajmy Panu (KADS)', number: 698 }] },
      { plannedStart: '12:30', plannedDuration: 5, type: 'benediction', title: 'Modlitwa i błogosławieństwo', bibleRefs: ['Lb 6:24-26'] },
      { plannedStart: '12:35', plannedDuration: 15, type: 'fellowship', title: 'Społeczność / zakończenie części formalnej' }
    ]
  },
  {
    id: 'sabbath-short',
    name: 'Krótsza forma nabożeństwa',
    description: 'Zwięzły układ nabożeństwa (Church Manual rozdz. 11).',
    items: [
      { plannedStart: '10:00', plannedDuration: 5, type: 'welcome', title: 'Powitanie i pieśń wstępna', hymnRefs: [{ hymnalId: 'spiewajmy-panu-kads', edition: 'Śpiewajmy Panu (KADS)', number: 1 }] },
      { plannedStart: '10:05', plannedDuration: 40, type: 'sabbath_school', title: 'Szkoła Sobotnia' },
      { plannedStart: '10:45', plannedDuration: 15, type: 'break', title: 'Przerwa' },
      { plannedStart: '11:00', plannedDuration: 10, type: 'scripture', title: 'Czytanie Biblii i modlitwa', bibleRefs: ['Ps 23:1-6'] },
      { plannedStart: '11:10', plannedDuration: 35, type: 'sermon', title: 'Kazanie' },
      { plannedStart: '11:45', plannedDuration: 10, type: 'benediction', title: 'Pieśń końcowa i błogosławieństwo' }
    ]
  },
  { id: 'sabbath-extended', name: 'Forma rozszerzona', description: 'Nabożeństwo z dłuższym czasem uwielbienia i świadectw.', items: [] },
  { id: 'missionary', name: 'Nabożeństwo misyjne', description: 'Skupione na świadectwach misyjnych i służbie lokalnej.', items: [] },
  { id: 'communion', name: 'Wieczerza Pańska z umywaniem nóg', description: 'Zawiera czas na obrzęd pokory (J 13) oraz Wieczerzę Pańską.', items: [] },
  { id: 'baptism', name: 'Nabożeństwo chrzcielne', description: 'Z uroczystym wyznaniem wiary, chrztem i przyjęciem do zboru.', items: [] },
  { id: 'youth', name: 'Nabożeństwo młodzieżowe', description: 'Prowadzone przez młodzież, muzyka i dialog ze Słowem.', items: [] },
  { id: 'family', name: 'Nabożeństwo rodzinne', description: 'Opowiadanie dla dzieci, czas dla rodzin i modlitwa o domy.', items: [] },
  { id: 'prayer', name: 'Spotkanie modlitewne', description: 'Rozważanie biblijne i wspólna modlitwa w grupach.', items: [] },
  { id: 'musical', name: 'Nabożeństwo muzyczne', description: 'Pieśni uwielbienia, świadectwa i krótkie rozważanie Słowa.', items: [] },
  { id: 'evangelistic', name: 'Spotkanie ewangelizacyjne', description: 'Otwarte spotkanie z zaproszeniem gości i Q&A biblijnym.', items: [] },
  { id: 'occasional', name: 'Nabożeństwo okolicznościowe', description: 'Dziękczynne, noworoczne lub świąteczne.', items: [] },
  { id: 'custom', name: 'Własny szablon', description: 'Pusty układ do samodzielnego zbudowania.', items: [] }
]);

export function sanitizeText(value, maxLen = 400) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

export function sanitizeMultiline(value, maxLen = 4000) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLen);
}

export function sanitizeUrl(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  try {
    const u = new URL(s);
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.toString();
  } catch {}
  return '';
}

/**
 * Walidacja sumy kontrolnej IBAN / polskiego NRB (mod 97).
 * WAŻNE: Zgodność sumy kontrolnej NIE potwierdza właściciela rachunku!
 */
export function validateIbanChecksum(rawIban) {
  const compact = String(rawIban || '').replace(/\s+/g, '').toUpperCase();
  const normalized = /^\d{26}$/.test(compact) ? `PL${compact}` : compact;
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(normalized)) {
    return { valid: false, normalized, reason: 'invalid_format' };
  }
  if (normalized.startsWith('PL') && normalized.length !== 28) {
    return { valid: false, normalized, reason: 'invalid_pl_length' };
  }
  const rearranged = normalized.slice(4) + normalized.slice(0, 4);
  let expanded = '';
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0);
    expanded += code >= 65 && code <= 90 ? String(code - 55) : ch;
  }
  let rem = 0;
  for (let i = 0; i < expanded.length; i++) {
    rem = (rem * 10 + (expanded.charCodeAt(i) - 48)) % 97;
  }
  return {
    valid: rem === 1,
    normalized,
    ownershipVerified: false,
    warning: 'Weryfikacja sumy kontrolnej mod-97 nie potwierdza właściciela rachunku — wymagane niezależne potwierdzenie zboru.'
  };
}

export function formatIbanPretty(iban) {
  const clean = String(iban || '').replace(/\s+/g, '').toUpperCase();
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

function makeId(prefix) {
  const rand = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function computeEtag(parts) {
  const raw = parts.map((p) => String(p ?? '')).join('|');
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `W/"mk-${(hash >>> 0).toString(16)}"`;
}

/**
 * Generuje legalny plik kalendarza .ics (RFC 5545) ze strefą IANA zboru.
 * Obsługuje status CANCELLED dla odwołanych wydarzeń.
 */
export function buildEventIcs({ uid, title, description = '', location = '', startAt, endAt, timezone = 'Europe/Warsaw', status = 'scheduled', url = '' }) {
  const esc = (s) => String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

  const toUtcStamp = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '20261128T083000Z';
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  };

  const icsStatus = status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Christian Culture//Moj Kosciol SBA v2.0//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-TIMEZONE:${esc(timezone)}`,
    'BEGIN:VEVENT',
    `UID:${esc(uid)}@polskieradio.cc`,
    `DTSTAMP:${toUtcStamp(new Date().toISOString())}`,
    `DTSTART:${toUtcStamp(startAt)}`,
    `DTEND:${toUtcStamp(endAt)}`,
    `SUMMARY:${esc(status === 'cancelled' ? `[ODWOŁANE] ${title}` : title)}`,
    `DESCRIPTION:${esc(description)}`,
    `LOCATION:${esc(location)}`,
    `STATUS:${icsStatus}`,
    ...(url ? [`URL:${esc(url)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  return lines.join('\r\n') + '\r\n';
}

function buildDemoSeed() {
  const nowIso = '2026-11-28T08:00:00.000Z';
  const standardTemplate = SERVICE_TEMPLATES[0];

  const churches = [
    {
      id: 'ch_kads_warszawa_demo',
      slug: 'warszawa-centrum-demo',
      name: 'Zbór KADS Warszawa Centrum (DEMO)',
      denomination: 'Kościół Adwentystów Dnia Siódmego',
      district: 'Diecezja Wschodnia — Okręg Mazowiecki (DEMO)',
      publicAddress: 'ul. Foksal 8, 00-366 Warszawa (przykład publiczny DEMO)',
      city: 'Warszawa',
      country: 'PL',
      timezone: 'Europe/Warsaw',
      verificationStatus: 'verified',
      isDemo: true,
      officialDisclaimer: 'Dane demonstracyjne (DEMO). Aplikacja nie sugeruje oficjalnego partnerstwa KADS bez pisemnej zgody właściwej jednostki.',
      contacts: {
        officialWebsite: 'https://adwent.pl/kontakt/zbory/',
        officialEmail: 'kontakt-demo@example.invalid',
        pastorName: 'Pastor / Starszy zboru (wpis za zgodą — DEMO)'
      },
      accessibility: {
        wheelchair: true,
        hearingLoop: true,
        parentsRoom: true,
        parking: 'Miejsca postojowe w pobliżu oraz komunikacja miejska (Metro Nowy Świat)',
        languages: ['pl', 'en']
      },
      links: {
        catalogUrl: 'https://adwent.pl/kontakt/zbory/',
        livestreamUrl: 'https://polskieradio.cc/biblia-audio',
        mapUrl: 'https://www.openstreetmap.org/search?query=Warszawa'
      },
      firstVisit: {
        whatToExpect: 'Przyjazne, otwarte nabożeństwo biblijne: wspólna Szkoła Sobotnia w grupach (ok. 45 min), przerwa na rozmowę oraz nabożeństwo z kazaniem (ok. 75 min). Nie musisz znać Biblii ani przynosić własnego śpiewnika.',
        duration: 'Ok. 2,5–3 godz. (możesz dołączyć na dowolną część)',
        entrance: 'Wejście główne od ulicy, przy wejściu witają dyżurni',
        parking: 'Strefa miejska (w soboty bezpłatna) i stojaki rowerowe',
        accessibility: 'Podjazd bez barier, toaleta dostępna, pętla indukcyjna',
        languages: 'Polski (dostępna grupa anglojęzyczna Szkoły Sobotniej)',
        familyInfo: 'Pokój dla rodziców z małymi dziećmi i zajęcia dla dzieci pod opieką rodziców',
        welcomeContact: 'Oficjalny katalog zborów: https://adwent.pl/kontakt/zbory/'
      },
      scheduleSummary: 'Sobota 09:30 Szkoła Sobotnia · 11:15 Nabożeństwo główne (godziny przykładowe DEMO)',
      createdBy: 'demo_owner_warszawa',
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: 'ch_kads_krakow_demo',
      slug: 'krakow-demo',
      name: 'Zbór KADS Kraków (DEMO)',
      denomination: 'Kościół Adwentystów Dnia Siódmego',
      district: 'Diecezja Południowa (DEMO)',
      publicAddress: 'ul. Lubelska 25, 30-003 Kraków (przykład publiczny DEMO)',
      city: 'Kraków',
      country: 'PL',
      timezone: 'Europe/Warsaw',
      verificationStatus: 'pending',
      isDemo: true,
      officialDisclaimer: 'Wizytówka demonstracyjna (DEMO) o statusie: oczekuje na weryfikację oficjalnym kanałem zboru.',
      contacts: {
        officialWebsite: 'https://adwent.pl/kontakt/zbory/',
        officialEmail: 'krakow-demo@example.invalid',
        pastorName: 'Kontakt za pośrednictwem oficjalnej strony zboru'
      },
      accessibility: {
        wheelchair: true,
        hearingLoop: false,
        parentsRoom: true,
        parking: 'Dojazd tramwajem i autobusem (Nowy Kleparz)',
        languages: ['pl']
      },
      links: {
        catalogUrl: 'https://adwent.pl/kontakt/zbory/',
        livestreamUrl: '',
        mapUrl: 'https://www.openstreetmap.org/search?query=Krakow'
      },
      firstVisit: {
        whatToExpect: 'Otwarte studium Biblii i nabożeństwo sobotnie w kameralnej atmosferze.',
        duration: 'Ok. 2,5 godz.',
        entrance: 'Wejście główne z tablicą informacyjną',
        parking: 'Parking w pobliżu',
        accessibility: 'Wejście z poziomu parteru',
        languages: 'Polski',
        familyInfo: 'Rodziny z dziećmi są mile widziane',
        welcomeContact: 'https://adwent.pl/kontakt/zbory/'
      },
      scheduleSummary: 'Sobota 09:30 Szkoła Sobotnia · 11:00 Kazanie (DEMO)',
      createdBy: 'demo_owner_krakow',
      createdAt: nowIso,
      updatedAt: nowIso
    }
  ];

  const memberships = [
    { churchId: 'ch_kads_warszawa_demo', userId: 'demo_owner_warszawa', userEmail: 'owner-waw@demo.local', role: 'owner', status: 'active' },
    { churchId: 'ch_kads_warszawa_demo', userId: 'demo_leader_warszawa', userEmail: 'leader-waw@demo.local', role: 'live_leader', status: 'active' },
    { churchId: 'ch_kads_warszawa_demo', userId: 'demo_treasurer_warszawa', userEmail: 'treasurer-waw@demo.local', role: 'treasurer', status: 'active' },
    { churchId: 'ch_kads_warszawa_demo', userId: 'demo_editor_warszawa', userEmail: 'editor-waw@demo.local', role: 'editor', status: 'active' },
    { churchId: 'ch_kads_krakow_demo', userId: 'demo_owner_krakow', userEmail: 'owner-krk@demo.local', role: 'owner', status: 'active' }
  ];

  const serviceId = 'srv_waw_2026_11_28_demo';
  const agendaItems = standardTemplate.items.map((tpl, idx) => ({
    id: `item_waw_${String(idx + 1).padStart(2, '0')}`,
    serviceId,
    churchId: 'ch_kads_warszawa_demo',
    position: idx + 1,
    type: tpl.type,
    title: tpl.title,
    plannedStart: tpl.plannedStart,
    plannedDuration: tpl.plannedDuration,
    actualStart: idx === 0 ? '2026-11-28T08:30:00.000Z' : null,
    actualEnd: null,
    status: idx === 0 ? 'active' : 'upcoming',
    personRefs: idx === 0 ? ['Prowadzący nabożeństwo (DEMO)'] : [],
    bibleRefs: tpl.bibleRefs ? [...tpl.bibleRefs] : [],
    hymnRefs: tpl.hymnRefs ? tpl.hymnRefs.map((h) => ({ ...h })) : [],
    resourceRefs: tpl.resourceRefs ? tpl.resourceRefs.map((r) => ({ ...r })) : [],
    sermonMeta: tpl.sermonMeta ? { ...tpl.sermonMeta } : null,
    publicDescription: tpl.type === 'sabbath_school'
      ? 'Wspólne omawianie lekcji Szkoły Sobotniej w grupach (PL / EN).'
      : tpl.type === 'giving'
        ? 'Dobrowolne dziesięciny i dary bezpośrednio na zweryfikowane cele kościelne. Aplikacja CC nie pośredniczy w płatnościach.'
        : ''
  }));

  const services = [
    {
      id: serviceId,
      churchId: 'ch_kads_warszawa_demo',
      title: 'Nabożeństwo Sobotnie — 28.11.2026 (DEMO)',
      serviceDate: '2026-11-28',
      startAt: '2026-11-28T08:30:00.000Z',
      endAt: '2026-11-28T11:50:00.000Z',
      timezone: 'Europe/Warsaw',
      status: 'live',
      templateId: 'sabbath-standard',
      revision: 1,
      visibility: 'public',
      postServiceEvents: [
        { title: 'Wspólny obiad agape (po zakończeniu części formalnej)', time: '12:45', location: 'Sala społeczności (DEMO)' }
      ],
      history: [{ revision: 1, action: 'published', at: nowIso, by: 'demo_owner_warszawa' }],
      createdAt: nowIso,
      updatedAt: nowIso
    }
  ];

  const liveStates = {
    [serviceId]: {
      serviceId,
      churchId: 'ch_kads_warszawa_demo',
      activeItemId: 'item_waw_01',
      status: 'live',
      revision: 1,
      timeOffsetMinutes: 0,
      updatedBy: 'demo_leader_warszawa',
      updatedAt: nowIso
    }
  };

  const announcements = [
    {
      id: 'ann_waw_01',
      churchId: 'ch_kads_warszawa_demo',
      category: 'ogloszenia',
      title: 'Tydzień Modlitwy i wspólne studium Słowa (DEMO)',
      body: 'Zapraszamy na otwarte spotkania modlitewne w środę o 18:00 w sali zborowej i online. Wstęp wolny.',
      pinned: true,
      publishAt: '2026-11-20T00:00:00.000Z',
      expiresAt: '2026-12-31T23:59:59.000Z',
      visibility: 'public',
      moderationStatus: 'approved',
      createdAt: nowIso
    },
    {
      id: 'ann_waw_expired',
      churchId: 'ch_kads_warszawa_demo',
      category: 'wydarzenia',
      title: 'Archiwalne ogłoszenie (wygasłe — test wygasania)',
      body: 'To ogłoszenie wygasło w przeszłości i nie powinno pokazywać się w aktywnym widoku publicznym.',
      pinned: false,
      publishAt: '2026-10-01T00:00:00.000Z',
      expiresAt: '2026-11-01T00:00:00.000Z',
      visibility: 'public',
      moderationStatus: 'approved',
      createdAt: '2026-10-01T00:00:00.000Z'
    }
  ];

  // Przykładowe cele finansowe DEMO: celowo 1 zweryfikowany DEMO (fikcyjny testowy IBAN o poprawnej sumie kontrolnej)
  // oraz 1 niezweryfikowany (który NIGDY nie może pojawić się publicznie!)
  const givingTargets = [
    {
      id: 'giv_waw_tithe_demo',
      churchId: 'ch_kads_warszawa_demo',
      category: 'tithe',
      beneficiary: 'Kościół Adwentystów Dnia Siódmego — Dziesięcina (DANE DEMO — NIE WYKONYWAĆ PRZELEWU)',
      iban: 'PL61109010140000071219812874',
      currency: 'PLN',
      transferTitle: 'Dziesięcina — Zbór DEMO',
      purpose: 'Dziesięcina wg zasad Kościoła (zob. adwent.pl/dary2021/)',
      confirmationSource: 'Potwierdzenie DEMO (przed produkcją zastąpić oficjalnym potwierdzeniem skarbnika i rady zboru)',
      verificationStatus: 'verified',
      firstApproverId: 'demo_treasurer_warszawa',
      secondApproverId: 'demo_owner_warszawa',
      verifiedAt: nowIso,
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: 'giv_waw_unverified_demo',
      churchId: 'ch_kads_warszawa_demo',
      category: 'local_church',
      beneficiary: 'Niezweryfikowany rachunek testowy (UKRYTY PUBLICZNIE)',
      iban: 'PL27114020040000300201355387',
      currency: 'PLN',
      transferTitle: 'Dar zborowy',
      purpose: 'Oczekuje na drugie zatwierdzenie',
      confirmationSource: 'Brak drugiego potwierdzenia',
      verificationStatus: 'pending_second_approval',
      firstApproverId: 'demo_treasurer_warszawa',
      secondApproverId: null,
      verifiedAt: null,
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso
    }
  ];

  const studyGroups = [
    {
      id: 'grp_waw_adult_pl',
      churchId: 'ch_kads_warszawa_demo',
      label: 'Grupa dorosłych — Sala Główna (PL)',
      groupType: 'adult',
      locale: 'pl',
      meetingPlace: 'Sala Główna',
      leaderRef: 'Prowadzący grupy (za zgodą — DEMO)',
      leaderConsent: true,
      scheduleText: '10:00–10:45',
      visibility: 'public'
    },
    {
      id: 'grp_waw_en',
      churchId: 'ch_kads_warszawa_demo',
      label: 'English Sabbath School Class (EN)',
      groupType: 'language',
      locale: 'en',
      meetingPlace: 'Room B / Online',
      leaderRef: 'Group facilitator (consented — DEMO)',
      leaderConsent: true,
      scheduleText: '10:00–10:45',
      visibility: 'public'
    },
    {
      id: 'grp_waw_youth',
      churchId: 'ch_kads_warszawa_demo',
      label: 'Grupa młodzieżowa',
      groupType: 'youth',
      locale: 'pl',
      meetingPlace: 'Sala Młodzieżowa',
      leaderRef: 'Lider młodzieży (za zgodą — DEMO)',
      leaderConsent: true,
      scheduleText: '10:00–10:45',
      visibility: 'public'
    }
  ];

  const lessonSessions = {
    grp_waw_adult_pl: {
      id: 'ls_waw_adult_pl',
      churchId: 'ch_kads_warszawa_demo',
      agendaItemId: 'item_waw_05',
      lessonRefId: '2026-Q4-L09',
      groupId: 'grp_waw_adult_pl',
      activeSectionRef: 'sunday',
      revision: 1,
      updatedBy: 'demo_leader_warszawa',
      updatedAt: nowIso
    },
    grp_waw_en: {
      id: 'ls_waw_en',
      churchId: 'ch_kads_warszawa_demo',
      agendaItemId: 'item_waw_05',
      lessonRefId: '2026-Q4-L09',
      groupId: 'grp_waw_en',
      activeSectionRef: 'monday',
      revision: 1,
      updatedBy: 'demo_leader_warszawa',
      updatedAt: nowIso
    }
  };

  const events = [
    {
      id: 'evt_waw_prayer_01',
      churchId: 'ch_kads_warszawa_demo',
      category: 'modlitwa',
      title: 'Środowe spotkanie modlitewne i studium Biblii (DEMO)',
      description: 'Wspólna modlitwa, śpiew i rozważanie Słowa Bożego.',
      location: 'ul. Foksal 8, Warszawa (DEMO)',
      startAt: '2026-12-02T17:00:00.000Z',
      endAt: '2026-12-02T18:30:00.000Z',
      timezone: 'Europe/Warsaw',
      recurrence: 'weekly',
      status: 'scheduled',
      cancelReason: '',
      capacity: 60,
      onlineUrl: 'https://polskieradio.cc/biblia-audio',
      visibility: 'public',
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: 'evt_waw_cancelled_demo',
      churchId: 'ch_kads_warszawa_demo',
      category: 'muzyka',
      title: 'Koncert uwielbienia — termin przełożony (DEMO)',
      description: 'Wydarzenie odwołane — nowy termin zostanie podany w ogłoszeniach.',
      location: 'ul. Foksal 8, Warszawa (DEMO)',
      startAt: '2026-12-06T16:00:00.000Z',
      endAt: '2026-12-06T18:00:00.000Z',
      timezone: 'Europe/Warsaw',
      recurrence: 'none',
      status: 'cancelled',
      cancelReason: 'Przełożone na styczeń z przyczyn organizacyjnych (DEMO).',
      capacity: null,
      onlineUrl: '',
      visibility: 'public',
      createdAt: nowIso,
      updatedAt: nowIso
    }
  ];

  const volunteerOpportunities = [
    {
      id: 'vol_waw_welcome',
      churchId: 'ch_kads_warszawa_demo',
      title: 'Służba powitalna i pomoc gościom w sobotę (DEMO)',
      category: 'wolontariat',
      description: 'Witanie osób odwiedzających zbór pierwszy raz, wręczanie śpiewników i pomoc w odnalezieniu sali.',
      contactMode: 'form_only',
      status: 'open',
      createdAt: nowIso
    },
    {
      id: 'vol_waw_sound',
      churchId: 'ch_kads_warszawa_demo',
      title: 'Obsługa nagłośnienia i transmisji (DEMO)',
      category: 'muzyka',
      description: 'Wsparcie techniczne podczas nabożeństw i spotkań. Zapewniamy przeszkolenie.',
      contactMode: 'form_only',
      status: 'open',
      createdAt: nowIso
    }
  ];

  return {
    churches,
    memberships,
    services,
    agendaItems,
    liveStates,
    announcements,
    givingTargets,
    studyGroups,
    lessonSessions,
    events,
    eventRsvps: [],
    privateNotes: [],
    personalStudyProgress: [],
    churchFollows: [],
    notificationPreferences: [],
    volunteerOpportunities,
    volunteerInquiries: [],
    prayerRequests: [],
    moderationReports: [],
    auditLogs: [],
    licenses: {
      'ss-stage-a-links-only': SABBATH_SCHOOL_LICENSE,
      'kads-spiewajmy-panu-review': {
        id: 'kads-spiewajmy-panu-review',
        sourceUrl: 'https://muzycy.adwent.pl/',
        rightsHolder: 'KADS w RP / Wydawnictwo Znaki Czasu (wymaga potwierdzenia praw dla publicznej redystrybucji pełnych tekstów)',
        license: 'Metadata & Official Link Only (bez redystrybucji pełnego tekstu bez pisemnej zgody)',
        allowedUses: ['metadata', 'official_link'],
        reviewedAt: '2026-11-28'
      },
      'cc-spiewajmy-panu-public-domain': {
        id: 'cc-spiewajmy-panu-public-domain',
        sourceUrl: 'https://muzycy.adwent.pl/',
        rightsHolder: 'Domena publiczna',
        license: 'Public Domain',
        allowedUses: ['metadata', 'lyrics_display', 'sing_along'],
        reviewedAt: '2026-11-28'
      }
    }
  };
}

export function createMojKosciolStore(options = {}) {
  const state = buildDemoSeed();
  const lessonProvider = options.lessonProvider || defaultLessonProvider;
  let hymnalMetaCache = options.hymnalMeta || null;

  function findMembership(churchId, userId) {
    if (!churchId || !userId) return null;
    return state.memberships.find((m) => m.churchId === churchId && m.userId === userId && m.status === 'active') || null;
  }

  function hasRole(churchId, userId, allowedSet) {
    const m = findMembership(churchId, userId);
    return Boolean(m && allowedSet.has(m.role));
  }

  function recordAudit({ churchId, actorId, actorRole, action, entityType, entityId, details = {} }) {
    const entry = {
      id: makeId('aud'),
      churchId,
      actorId,
      actorRole,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString()
    };
    state.auditLogs.push(entry);
    return entry;
  }

  function getChurchByIdOrSlug(idOrSlug) {
    const key = String(idOrSlug || '').trim().toLowerCase();
    return state.churches.find((c) => c.id.toLowerCase() === key || c.slug.toLowerCase() === key) || null;
  }

  function searchChurches({ query = '', city = '', denomination = '' } = {}) {
    const q = String(query || '').trim().toLowerCase();
    const cFilter = String(city || '').trim().toLowerCase();
    const dFilter = String(denomination || '').trim().toLowerCase();
    return state.churches.filter((ch) => {
      if (ch.verificationStatus === 'suspended') return false;
      if (cFilter && !ch.city.toLowerCase().includes(cFilter)) return false;
      if (dFilter && !ch.denomination.toLowerCase().includes(dFilter)) return false;
      if (!q) return true;
      return `${ch.name} ${ch.city} ${ch.district} ${ch.denomination} ${ch.publicAddress}`.toLowerCase().includes(q);
    });
  }

  function createChurch(payload, user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    const name = sanitizeText(payload?.name, 140);
    const denomination = sanitizeText(payload?.denomination || 'Kościół Adwentystów Dnia Siódmego', 120);
    const city = sanitizeText(payload?.city, 80);
    if (name.length < 3) return { ok: false, status: 400, error: 'invalid_name' };

    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'zbor';
    let slug = baseSlug;
    let i = 2;
    while (state.churches.some((c) => c.slug === slug)) {
      slug = `${baseSlug}-${i++}`;
    }

    const now = new Date().toISOString();
    const church = {
      id: makeId('ch'),
      slug,
      name,
      denomination,
      district: sanitizeText(payload?.district, 120),
      publicAddress: sanitizeText(payload?.publicAddress, 200),
      city,
      country: sanitizeText(payload?.country || 'PL', 8),
      timezone: sanitizeText(payload?.timezone || 'Europe/Warsaw', 60),
      verificationStatus: 'unverified', // Zawsze zaczyna jako niezweryfikowana!
      isDemo: Boolean(payload?.isDemo),
      officialDisclaimer: 'Wizytówka oczekuje na weryfikację oficjalnym kanałem zboru. Nie sugeruje oficjalnego partnerstwa bez zgody.',
      contacts: {
        officialWebsite: sanitizeUrl(payload?.officialWebsite),
        officialEmail: sanitizeText(payload?.officialEmail, 140),
        pastorName: payload?.pastorConsent ? sanitizeText(payload?.pastorName, 120) : ''
      },
      accessibility: {
        wheelchair: Boolean(payload?.accessibility?.wheelchair),
        hearingLoop: Boolean(payload?.accessibility?.hearingLoop),
        parentsRoom: Boolean(payload?.accessibility?.parentsRoom),
        parking: sanitizeText(payload?.accessibility?.parking, 200),
        languages: Array.isArray(payload?.accessibility?.languages) ? payload.accessibility.languages.slice(0, 6) : ['pl']
      },
      links: {
        catalogUrl: sanitizeUrl(payload?.catalogUrl || 'https://adwent.pl/kontakt/zbory/'),
        livestreamUrl: sanitizeUrl(payload?.livestreamUrl),
        mapUrl: sanitizeUrl(payload?.mapUrl)
      },
      firstVisit: {
        whatToExpect: sanitizeMultiline(payload?.firstVisit?.whatToExpect || 'Otwarte nabożeństwo biblijne dla wszystkich gości.', 600),
        duration: sanitizeText(payload?.firstVisit?.duration || 'Ok. 2–2,5 godz.', 100),
        entrance: sanitizeText(payload?.firstVisit?.entrance, 180),
        parking: sanitizeText(payload?.firstVisit?.parking, 180),
        accessibility: sanitizeText(payload?.firstVisit?.accessibility, 180),
        languages: sanitizeText(payload?.firstVisit?.languages || 'Polski', 100),
        familyInfo: sanitizeText(payload?.firstVisit?.familyInfo, 240),
        welcomeContact: sanitizeText(payload?.firstVisit?.welcomeContact, 200)
      },
      scheduleSummary: sanitizeText(payload?.scheduleSummary || 'Sobota 09:30 / 11:15', 160),
      createdBy: user.uid,
      createdAt: now,
      updatedAt: now
    };
    state.churches.push(church);
    state.memberships.push({
      churchId: church.id,
      userId: user.uid,
      userEmail: user.email || '',
      role: 'owner',
      status: 'active'
    });
    recordAudit({ churchId: church.id, actorId: user.uid, actorRole: 'owner', action: 'church_created', entityType: 'church', entityId: church.id, details: { slug } });
    return { ok: true, status: 201, church };
  }

  function getChurchProfile(idOrSlug, nowDate = new Date()) {
    const ch = getChurchByIdOrSlug(idOrSlug);
    if (!ch) return null;
    const services = state.services
      .filter((s) => s.churchId === ch.id && s.visibility === 'public' && s.status !== 'draft')
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
    const verifiedGiving = state.givingTargets
      .filter((g) => g.churchId === ch.id && g.verificationStatus === 'verified')
      .map((g) => ({
        id: g.id,
        category: g.category,
        beneficiary: g.beneficiary,
        iban: g.iban,
        ibanFormatted: formatIbanPretty(g.iban),
        currency: g.currency,
        transferTitle: g.transferTitle,
        purpose: g.purpose,
        confirmationSource: g.confirmationSource,
        verificationStatus: g.verificationStatus,
        verifiedAt: g.verifiedAt,
        isDemo: Boolean(g.isDemo)
      }));
    const activeAnnouncements = getPublicAnnouncements(ch.id, nowDate);
    const publicEvents = getPublicEvents(ch.id);
    const groups = state.studyGroups.filter((g) => g.churchId === ch.id && g.visibility === 'public');

    return {
      church: ch,
      services,
      activeServiceId: services[0]?.id || null,
      givingTargets: verifiedGiving,
      givingPolicy: {
        ccHandlesMoney: false,
        commissionPercent: 0,
        donorRankingEnabled: false,
        mixedWithCcDonations: false,
        note: 'Christian Culture nie przyjmuje ani nie przekazuje dziesięcin i darów zborowych. Przelew wykonujesz bezpośrednio ze swojego banku.'
      },
      announcements: activeAnnouncements,
      events: publicEvents,
      studyGroups: groups,
      volunteerOpportunities: state.volunteerOpportunities.filter((v) => v.churchId === ch.id && v.status === 'open')
    };
  }

  function getServiceFull(serviceId) {
    const srv = state.services.find((s) => s.id === serviceId);
    if (!srv) return null;
    const items = state.agendaItems
      .filter((i) => i.serviceId === srv.id)
      .sort((a, b) => a.position - b.position);
    const liveState = state.liveStates[srv.id] || {
      serviceId: srv.id,
      churchId: srv.churchId,
      activeItemId: null,
      status: 'idle',
      revision: srv.revision,
      timeOffsetMinutes: 0,
      updatedAt: srv.updatedAt
    };
    return {
      service: srv,
      items,
      liveState,
      etag: computeEtag([srv.id, srv.revision, liveState.revision, liveState.activeItemId, liveState.status, liveState.updatedAt])
    };
  }

  function createOrUpdateService(churchId, payload, user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    if (!hasRole(churchId, user.uid, AGENDA_EDIT_ROLES)) {
      return { ok: false, status: 403, error: 'forbidden_tenant_or_role' };
    }
    const now = new Date().toISOString();
    const existing = payload?.id ? state.services.find((s) => s.id === payload.id) : null;
    if (existing && existing.churchId !== churchId) {
      return { ok: false, status: 403, error: 'cross_tenant_idor_blocked' };
    }

    const template = SERVICE_TEMPLATES.find((t) => t.id === payload?.templateId) || SERVICE_TEMPLATES[0];
    const itemsInput = Array.isArray(payload?.items) && payload.items.length
      ? payload.items
      : (existing ? state.agendaItems.filter((i) => i.serviceId === existing.id) : template.items);

    const status = ['draft', 'published', 'live', 'paused', 'completed', 'cancelled'].includes(payload?.status)
      ? payload.status
      : (existing?.status || 'draft');

    if (existing) {
      existing.title = sanitizeText(payload?.title || existing.title, 160);
      existing.serviceDate = sanitizeText(payload?.serviceDate || existing.serviceDate, 20);
      existing.startAt = payload?.startAt || existing.startAt;
      existing.endAt = payload?.endAt || existing.endAt;
      existing.status = status;
      existing.revision += 1;
      existing.updatedAt = now;
      existing.history.push({ revision: existing.revision, action: `updated:${status}`, at: now, by: user.uid });

      if (Array.isArray(payload?.items)) {
        state.agendaItems = state.agendaItems.filter((i) => i.serviceId !== existing.id);
        payload.items.slice(0, 60).forEach((it, idx) => {
          state.agendaItems.push({
            id: sanitizeText(it.id, 60) || makeId('item'),
            serviceId: existing.id,
            churchId,
            position: idx + 1,
            type: sanitizeText(it.type || 'general', 40),
            title: sanitizeText(it.title || `Punkt ${idx + 1}`, 160),
            plannedStart: sanitizeText(it.plannedStart || '', 10),
            plannedDuration: Math.max(1, Math.min(240, Number(it.plannedDuration) || 10)),
            actualStart: it.actualStart || null,
            actualEnd: it.actualEnd || null,
            status: ['upcoming', 'active', 'completed', 'skipped'].includes(it.status) ? it.status : 'upcoming',
            personRefs: Array.isArray(it.personRefs) ? it.personRefs.map((p) => sanitizeText(p, 100)).filter(Boolean).slice(0, 6) : [],
            bibleRefs: Array.isArray(it.bibleRefs) ? it.bibleRefs.map((r) => sanitizeText(r, 80)).filter(Boolean).slice(0, 12) : [],
            hymnRefs: Array.isArray(it.hymnRefs) ? it.hymnRefs.slice(0, 8) : [],
            resourceRefs: Array.isArray(it.resourceRefs) ? it.resourceRefs.slice(0, 8) : [],
            sermonMeta: it.sermonMeta || null,
            publicDescription: sanitizeMultiline(it.publicDescription || '', 800)
          });
        });
      }
      recordAudit({ churchId, actorId: user.uid, actorRole: findMembership(churchId, user.uid).role, action: 'service_updated', entityType: 'service', entityId: existing.id, details: { revision: existing.revision, status } });
      return { ok: true, status: 200, ...getServiceFull(existing.id) };
    }

    const newId = makeId('srv');
    const srv = {
      id: newId,
      churchId,
      title: sanitizeText(payload?.title || 'Nowe nabożeństwo', 160),
      serviceDate: sanitizeText(payload?.serviceDate || now.slice(0, 10), 20),
      startAt: payload?.startAt || now,
      endAt: payload?.endAt || now,
      timezone: sanitizeText(payload?.timezone || 'Europe/Warsaw', 60),
      status,
      templateId: template.id,
      revision: 1,
      visibility: payload?.visibility === 'members' ? 'members' : 'public',
      postServiceEvents: Array.isArray(payload?.postServiceEvents) ? payload.postServiceEvents.slice(0, 10) : [],
      history: [{ revision: 1, action: `created:${status}`, at: now, by: user.uid }],
      createdAt: now,
      updatedAt: now
    };
    state.services.push(srv);
    itemsInput.slice(0, 60).forEach((it, idx) => {
      state.agendaItems.push({
        id: makeId('item'),
        serviceId: newId,
        churchId,
        position: idx + 1,
        type: sanitizeText(it.type || 'general', 40),
        title: sanitizeText(it.title || `Punkt ${idx + 1}`, 160),
        plannedStart: sanitizeText(it.plannedStart || '', 10),
        plannedDuration: Math.max(1, Math.min(240, Number(it.plannedDuration) || 10)),
        actualStart: null,
        actualEnd: null,
        status: 'upcoming',
        personRefs: Array.isArray(it.personRefs) ? it.personRefs.map((p) => sanitizeText(p, 100)).filter(Boolean).slice(0, 6) : [],
        bibleRefs: Array.isArray(it.bibleRefs) ? it.bibleRefs.map((r) => sanitizeText(r, 80)).filter(Boolean).slice(0, 12) : [],
        hymnRefs: Array.isArray(it.hymnRefs) ? it.hymnRefs.slice(0, 8) : [],
        resourceRefs: Array.isArray(it.resourceRefs) ? it.resourceRefs.slice(0, 8) : [],
        sermonMeta: it.sermonMeta || null,
        publicDescription: sanitizeMultiline(it.publicDescription || '', 800)
      });
    });
    state.liveStates[newId] = {
      serviceId: newId,
      churchId,
      activeItemId: null,
      status: 'idle',
      revision: 1,
      timeOffsetMinutes: 0,
      updatedBy: user.uid,
      updatedAt: now
    };
    recordAudit({ churchId, actorId: user.uid, actorRole: findMembership(churchId, user.uid).role, action: 'service_created', entityType: 'service', entityId: newId, details: { templateId: template.id, status } });
    return { ok: true, status: 201, ...getServiceFull(newId) };
  }

  function copyServiceToNextWeek(serviceId, user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    const src = getServiceFull(serviceId);
    if (!src) return { ok: false, status: 404, error: 'service_not_found' };
    if (!hasRole(src.service.churchId, user.uid, AGENDA_EDIT_ROLES)) {
      return { ok: false, status: 403, error: 'forbidden_tenant_or_role' };
    }
    const nextStart = new Date(new Date(src.service.startAt).getTime() + 7 * 86400000);
    const nextEnd = new Date(new Date(src.service.endAt).getTime() + 7 * 86400000);
    const nextDate = nextStart.toISOString().slice(0, 10);
    return createOrUpdateService(
      src.service.churchId,
      {
        title: `${src.service.title.replace(/\s*—\s*\d{2}\.\d{2}\.\d{4}.*$/, '')} — ${nextDate}`,
        serviceDate: nextDate,
        startAt: nextStart.toISOString(),
        endAt: nextEnd.toISOString(),
        timezone: src.service.timezone,
        status: 'draft',
        templateId: src.service.templateId,
        items: src.items.map((it) => ({
          type: it.type,
          title: it.title,
          plannedStart: it.plannedStart,
          plannedDuration: it.plannedDuration,
          personRefs: it.personRefs,
          bibleRefs: it.bibleRefs,
          hymnRefs: it.hymnRefs,
          resourceRefs: it.resourceRefs,
          sermonMeta: it.sermonMeta,
          publicDescription: it.publicDescription
        }))
      },
      user
    );
  }

  function mutateLiveState(serviceId, payload, user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    const full = getServiceFull(serviceId);
    if (!full) return { ok: false, status: 404, error: 'service_not_found' };
    const { service, items, liveState } = full;

    if (!hasRole(service.churchId, user.uid, LIVE_CONTROL_ROLES)) {
      return { ok: false, status: 403, error: 'forbidden_live_control' };
    }

    // Kontrola równoczesnych zmian (monotoniczna rewizja)
    if (payload?.expectedRevision !== undefined && Number(payload.expectedRevision) !== liveState.revision) {
      return {
        ok: false,
        status: 409,
        error: 'revision_conflict',
        detail: `Wykryto nowszą wersję stanu LIVE (oczekiwano ${payload.expectedRevision}, aktualna ${liveState.revision}). Pobierz najnowszy stan.`,
        snapshot: full
      };
    }

    const now = new Date().toISOString();
    const action = String(payload?.action || '').toLowerCase();
    const curIdx = items.findIndex((i) => i.id === liveState.activeItemId);

    if (action === 'start') {
      const target = payload?.itemId ? items.find((i) => i.id === payload.itemId) : items[0];
      if (target) {
        target.status = 'active';
        target.actualStart = target.actualStart || now;
        liveState.activeItemId = target.id;
      }
      liveState.status = 'live';
      service.status = 'live';
    } else if (action === 'next' || action === 'skip') {
      if (curIdx >= 0) {
        items[curIdx].status = action === 'skip' ? 'skipped' : 'completed';
        items[curIdx].actualEnd = now;
      }
      const nextItem = items[curIdx + 1] || null;
      if (nextItem) {
        nextItem.status = 'active';
        nextItem.actualStart = now;
        liveState.activeItemId = nextItem.id;
        liveState.status = 'live';
      } else {
        liveState.activeItemId = null;
        liveState.status = 'completed';
        service.status = 'completed';
      }
    } else if (action === 'prev') {
      if (curIdx > 0) {
        items[curIdx].status = 'upcoming';
        items[curIdx].actualStart = null;
        items[curIdx - 1].status = 'active';
        items[curIdx - 1].actualEnd = null;
        liveState.activeItemId = items[curIdx - 1].id;
        liveState.status = 'live';
      }
    } else if (action === 'jump' && payload?.itemId) {
      const target = items.find((i) => i.id === payload.itemId);
      if (!target) return { ok: false, status: 404, error: 'item_not_found' };
      if (curIdx >= 0 && items[curIdx].id !== target.id) {
        items[curIdx].status = 'completed';
        items[curIdx].actualEnd = now;
      }
      target.status = 'active';
      target.actualStart = target.actualStart || now;
      liveState.activeItemId = target.id;
      liveState.status = 'live';
    } else if (action === 'pause') {
      liveState.status = 'paused';
      service.status = 'paused';
    } else if (action === 'resume') {
      liveState.status = 'live';
      service.status = 'live';
    } else if (action === 'end') {
      if (curIdx >= 0) {
        items[curIdx].status = 'completed';
        items[curIdx].actualEnd = now;
      }
      liveState.activeItemId = null;
      liveState.status = 'completed';
      service.status = 'completed';
    } else if (action === 'adjust') {
      const delta = Number(payload?.offsetMinutes);
      if (Number.isFinite(delta) && delta >= -120 && delta <= 180) {
        liveState.timeOffsetMinutes = delta;
      }
    } else if (action === 'add_verse') {
      const ref = sanitizeText(payload?.bibleRef, 80);
      const target = (payload?.itemId ? items.find((i) => i.id === payload.itemId) : items[curIdx]) || items[0];
      if (!ref || !target) return { ok: false, status: 400, error: 'invalid_bible_ref' };
      if (!target.bibleRefs.includes(ref)) target.bibleRefs.push(ref);
    } else {
      return { ok: false, status: 400, error: 'invalid_live_action' };
    }

    liveState.revision += 1;
    liveState.updatedBy = user.uid;
    liveState.updatedAt = now;
    service.updatedAt = now;

    recordAudit({
      churchId: service.churchId,
      actorId: user.uid,
      actorRole: findMembership(service.churchId, user.uid).role,
      action: `live_${action}`,
      entityType: 'live_state',
      entityId: serviceId,
      details: { revision: liveState.revision, activeItemId: liveState.activeItemId, status: liveState.status }
    });

    return { ok: true, status: 200, ...getServiceFull(serviceId) };
  }

  // --- Dziesięciny i dary (ścisłe rozdzielenie ról + podwójne zatwierdzenie + audyt) ---
  function upsertGivingTarget(churchId, payload, user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    if (!hasRole(churchId, user.uid, FINANCE_ROLES)) {
      return { ok: false, status: 403, error: 'forbidden_finance_role_required' };
    }
    const category = GIVING_CATEGORIES.includes(payload?.category) ? payload.category : null;
    if (!category) return { ok: false, status: 400, error: 'invalid_giving_category' };

    const ibanCheck = validateIbanChecksum(payload?.iban);
    if (!ibanCheck.valid) {
      return { ok: false, status: 400, error: 'invalid_iban_checksum', detail: ibanCheck.reason };
    }

    const beneficiary = sanitizeText(payload?.beneficiary, 160);
    const transferTitle = sanitizeText(payload?.transferTitle, 140);
    if (!beneficiary || !transferTitle) {
      return { ok: false, status: 400, error: 'missing_beneficiary_or_title' };
    }

    const now = new Date().toISOString();
    const existing = payload?.id ? state.givingTargets.find((g) => g.id === payload.id) : null;
    if (existing && existing.churchId !== churchId) {
      return { ok: false, status: 403, error: 'cross_tenant_idor_blocked' };
    }

    if (existing) {
      // KRYTYCZNE ZABEZPIECZENIE: Zmiana rachunku NATYCHMIAST ukrywa dane publicznie do ponownej weryfikacji 2 osób!
      const ibanChanged = existing.iban !== ibanCheck.normalized;
      existing.category = category;
      existing.beneficiary = beneficiary;
      existing.iban = ibanCheck.normalized;
      existing.currency = sanitizeText(payload?.currency || 'PLN', 6);
      existing.transferTitle = transferTitle;
      existing.purpose = sanitizeText(payload?.purpose, 240);
      existing.confirmationSource = sanitizeText(payload?.confirmationSource, 200);
      existing.verificationStatus = 'pending_second_approval';
      existing.firstApproverId = user.uid;
      existing.secondApproverId = null;
      existing.verifiedAt = null;
      existing.updatedAt = now;

      recordAudit({
        churchId,
        actorId: user.uid,
        actorRole: findMembership(churchId, user.uid).role,
        action: ibanChanged ? 'giving_iban_changed_hidden_pending_reverify' : 'giving_updated_pending_reverify',
        entityType: 'giving_target',
        entityId: existing.id,
        details: { category, ibanChanged }
      });
      return { ok: true, status: 200, givingTarget: existing, checksumNotice: ibanCheck.warning };
    }

    const created = {
      id: makeId('giv'),
      churchId,
      category,
      beneficiary,
      iban: ibanCheck.normalized,
      currency: sanitizeText(payload?.currency || 'PLN', 6),
      transferTitle,
      purpose: sanitizeText(payload?.purpose, 240),
      confirmationSource: sanitizeText(payload?.confirmationSource, 200),
      verificationStatus: 'pending_second_approval',
      firstApproverId: user.uid,
      secondApproverId: null,
      verifiedAt: null,
      isDemo: false,
      createdAt: now,
      updatedAt: now
    };
    state.givingTargets.push(created);
    recordAudit({
      churchId,
      actorId: user.uid,
      actorRole: findMembership(churchId, user.uid).role,
      action: 'giving_created_pending_second_approval',
      entityType: 'giving_target',
      entityId: created.id,
      details: { category }
    });
    return { ok: true, status: 201, givingTarget: created, checksumNotice: ibanCheck.warning };
  }

  function verifyGivingTarget(churchId, targetId, user, confirmationSource = '') {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    if (!hasRole(churchId, user.uid, FINANCE_ROLES)) {
      return { ok: false, status: 403, error: 'forbidden_finance_role_required' };
    }
    const target = state.givingTargets.find((g) => g.id === targetId);
    if (!target) return { ok: false, status: 404, error: 'giving_target_not_found' };
    if (target.churchId !== churchId) return { ok: false, status: 403, error: 'cross_tenant_idor_blocked' };

    // Wymóg dwóch różnych uprawnionych osób!
    if (target.firstApproverId && target.firstApproverId === user.uid) {
      return {
        ok: false,
        status: 400,
        error: 'dual_approval_requires_second_person',
        detail: 'Zatwierdzenie rachunku bankowego wymaga drugiej, niezależnej uprawnionej osoby (skarbnik + właściciel/starszy).'
      };
    }

    const now = new Date().toISOString();
    target.secondApproverId = user.uid;
    target.verificationStatus = 'verified';
    if (confirmationSource) target.confirmationSource = sanitizeText(confirmationSource, 200);
    target.verifiedAt = now;
    target.updatedAt = now;

    recordAudit({
      churchId,
      actorId: user.uid,
      actorRole: findMembership(churchId, user.uid).role,
      action: 'giving_verified_dual_approval',
      entityType: 'giving_target',
      entityId: target.id,
      details: { firstApproverId: target.firstApproverId, secondApproverId: user.uid }
    });
    return { ok: true, status: 200, givingTarget: target };
  }

  // --- Ogłoszenia z datą publikacji i wygaśnięcia ---
  function getPublicAnnouncements(churchId, nowDate = new Date()) {
    const nowIso = (nowDate instanceof Date ? nowDate : new Date(nowDate)).toISOString();
    return state.announcements
      .filter((a) =>
        a.churchId === churchId &&
        a.visibility === 'public' &&
        a.moderationStatus === 'approved' &&
        a.publishAt <= nowIso &&
        a.expiresAt >= nowIso
      )
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.publishAt.localeCompare(a.publishAt));
  }

  function createAnnouncement(churchId, payload, user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    if (!hasRole(churchId, user.uid, AGENDA_EDIT_ROLES)) {
      return { ok: false, status: 403, error: 'forbidden_tenant_or_role' };
    }
    const title = sanitizeText(payload?.title, 160);
    const body = sanitizeMultiline(payload?.body, 2000);
    if (!title || !body) return { ok: false, status: 400, error: 'missing_title_or_body' };

    const now = new Date().toISOString();
    const ann = {
      id: makeId('ann'),
      churchId,
      category: ANNOUNCEMENT_CATEGORIES.includes(payload?.category) ? payload.category : 'ogloszenia',
      title,
      body,
      pinned: Boolean(payload?.pinned),
      publishAt: payload?.publishAt || now,
      expiresAt: payload?.expiresAt || new Date(Date.now() + 14 * 86400000).toISOString(),
      visibility: payload?.visibility === 'members' ? 'members' : 'public',
      moderationStatus: 'approved',
      createdBy: user.uid,
      createdAt: now
    };
    state.announcements.push(ann);
    recordAudit({ churchId, actorId: user.uid, actorRole: findMembership(churchId, user.uid).role, action: 'announcement_created', entityType: 'announcement', entityId: ann.id });
    return { ok: true, status: 201, announcement: ann };
  }

  // --- Wydarzenia & prywatne RSVP (NIGDY publicznej listy uczestników!) ---
  function getPublicEvents(churchId) {
    return state.events
      .filter((e) => e.churchId === churchId && e.visibility === 'public')
      .map((e) => {
        const yesCount = state.eventRsvps
          .filter((r) => r.eventId === e.id && r.response === 'yes')
          .reduce((acc, r) => acc + r.guestsCount, 0);
        // ŚCISŁA OCHRONA PRYWATNOŚCI: NIGDY nie zwracamy listy osób RSVP!
        return {
          ...e,
          rsvpSummary: {
            remainingCapacity: e.capacity ? Math.max(0, e.capacity - yesCount) : null,
            publicAttendeeListExposed: false
          }
        };
      })
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  }

  function submitEventRsvp(eventId, payload, user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    const evt = state.events.find((e) => e.id === eventId);
    if (!evt) return { ok: false, status: 404, error: 'event_not_found' };
    if (evt.status === 'cancelled') return { ok: false, status: 409, error: 'event_cancelled' };
    const response = ['yes', 'no', 'maybe'].includes(payload?.response) ? payload.response : null;
    if (!response) return { ok: false, status: 400, error: 'invalid_rsvp_response' };
    const guestsCount = Math.max(1, Math.min(10, Number(payload?.guestsCount) || 1));

    const now = new Date().toISOString();
    const existing = state.eventRsvps.find((r) => r.eventId === eventId && r.userId === user.uid);
    if (existing) {
      existing.response = response;
      existing.guestsCount = guestsCount;
      existing.updatedAt = now;
    } else {
      state.eventRsvps.push({ eventId, churchId: evt.churchId, userId: user.uid, response, guestsCount, updatedAt: now });
    }
    return { ok: true, status: 200, rsvp: { eventId, response, guestsCount, updatedAt: now, isPrivate: true } };
  }

  // --- Prywatne notatki (WYŁĄCZNIE dla zalogowanego autora, NIGDY w public API) ---
  function getUserPrivateNotes(user, serviceId = '') {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    const notes = state.privateNotes.filter((n) => n.userId === user.uid && (!serviceId || n.serviceId === serviceId));
    return { ok: true, status: 200, notes };
  }

  function saveUserPrivateNote(payload, user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    const text = sanitizeMultiline(payload?.text, 4000);
    const serviceId = sanitizeText(payload?.serviceId, 80);
    const itemId = sanitizeText(payload?.itemId, 80);
    const churchId = sanitizeText(payload?.churchId, 80);
    const now = new Date().toISOString();

    const existing = state.privateNotes.find((n) => n.userId === user.uid && n.serviceId === serviceId && n.itemId === itemId);
    if (existing) {
      existing.text = text;
      existing.updatedAt = now;
      return { ok: true, status: 200, note: existing };
    }
    const note = { id: makeId('note'), userId: user.uid, churchId, serviceId, itemId, text, updatedAt: now };
    state.privateNotes.push(note);
    return { ok: true, status: 201, note };
  }

  // --- Prośby modlitewne ("Módlmy się") — domyślnie prywatne, ZAKAZ automatycznego AI ---
  function createPrayerRequest(churchId, payload, user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    const body = sanitizeMultiline(payload?.body, 1200);
    if (body.length < 5) return { ok: false, status: 400, error: 'prayer_body_too_short' };
    const publicConsent = Boolean(payload?.publicConsent);
    const now = new Date().toISOString();
    const req = {
      id: makeId('pray'),
      churchId,
      userId: user.uid,
      body,
      visibility: publicConsent ? 'public_moderated' : 'private_team',
      publicConsent,
      moderationStatus: 'pending',
      aiAllowed: false, // TWARDA REGUŁA: nigdy nie udostępniać automatycznie do AI!
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      createdAt: now,
      updatedAt: now
    };
    state.prayerRequests.push(req);
    return { ok: true, status: 201, prayerRequest: req };
  }

  function withdrawPrayerRequest(prayerId, user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    const req = state.prayerRequests.find((p) => p.id === prayerId);
    if (!req) return { ok: false, status: 404, error: 'prayer_not_found' };
    if (req.userId !== user.uid) return { ok: false, status: 403, error: 'forbidden_not_owner' };
    req.moderationStatus = 'withdrawn';
    req.updatedAt = new Date().toISOString();
    return { ok: true, status: 200, withdrawn: true };
  }

  // --- Szkoła Sobotnia: sesje grup (niezależne od osi LIVE) & prywatny postęp ---
  function updateLessonSession(churchId, groupId, payload, user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    if (!hasRole(churchId, user.uid, new Set(['owner', 'admin', 'editor', 'live_leader']))) {
      return { ok: false, status: 403, error: 'forbidden_tenant_or_role' };
    }
    const group = state.studyGroups.find((g) => g.id === groupId && g.churchId === churchId);
    if (!group) return { ok: false, status: 404, error: 'study_group_not_found' };

    const cur = state.lessonSessions[groupId] || {
      id: makeId('ls'),
      churchId,
      agendaItemId: '',
      lessonRefId: sanitizeText(payload?.lessonRefId || '2026-Q4-L09', 40),
      groupId,
      activeSectionRef: 'saturday',
      revision: 0,
      updatedBy: user.uid,
      updatedAt: new Date().toISOString()
    };

    if (payload?.expectedRevision !== undefined && Number(payload.expectedRevision) !== cur.revision) {
      return { ok: false, status: 409, error: 'revision_conflict', session: cur };
    }
    cur.activeSectionRef = sanitizeText(payload?.activeSectionRef || cur.activeSectionRef, 40);
    if (payload?.lessonRefId) cur.lessonRefId = sanitizeText(payload.lessonRefId, 40);
    cur.revision += 1;
    cur.updatedBy = user.uid;
    cur.updatedAt = new Date().toISOString();
    state.lessonSessions[groupId] = cur;
    return { ok: true, status: 200, session: cur };
  }

  function savePersonalStudyProgress(payload, user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    const lessonRefId = sanitizeText(payload?.lessonRefId, 60);
    if (!lessonRefId) return { ok: false, status: 400, error: 'missing_lesson_ref' };
    const completedDays = Array.isArray(payload?.completedDays)
      ? payload.completedDays.map((d) => sanitizeText(d, 20)).filter(Boolean).slice(0, 7)
      : [];
    const privateNotes = sanitizeMultiline(payload?.privateNotes || '', 4000);
    const now = new Date().toISOString();
    const existing = state.personalStudyProgress.find((p) => p.userId === user.uid && p.lessonRefId === lessonRefId);
    if (existing) {
      existing.completedDays = completedDays;
      existing.privateNotes = privateNotes;
      existing.updatedAt = now;
      return { ok: true, status: 200, progress: existing };
    }
    const created = { userId: user.uid, lessonRefId, completedDays, privateNotes, updatedAt: now };
    state.personalStudyProgress.push(created);
    return { ok: true, status: 201, progress: created };
  }

  function getPersonalStudyProgress(lessonRefId, user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    const hit = state.personalStudyProgress.find((p) => p.userId === user.uid && p.lessonRefId === lessonRefId);
    return { ok: true, status: 200, progress: hit || { userId: user.uid, lessonRefId, completedDays: [], privateNotes: '' } };
  }

  // --- Obserwowanie zboru & powiadomienia (opt-in, bez finansowych domyślnie, usuwanie danych) ---
  function setChurchFollow(churchId, { follow = true, isPreferred = false } = {}, user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    const ch = getChurchByIdOrSlug(churchId);
    if (!ch) return { ok: false, status: 404, error: 'church_not_found' };

    if (!follow) {
      state.churchFollows = state.churchFollows.filter((f) => !(f.userId === user.uid && f.churchId === ch.id));
      state.notificationPreferences = state.notificationPreferences.filter((n) => !(n.userId === user.uid && n.churchId === ch.id));
      return { ok: true, status: 200, following: false, churchId: ch.id };
    }

    if (isPreferred) {
      state.churchFollows.forEach((f) => { if (f.userId === user.uid) f.isPreferred = false; });
    }
    const existing = state.churchFollows.find((f) => f.userId === user.uid && f.churchId === ch.id);
    if (existing) {
      existing.isPreferred = Boolean(isPreferred);
    } else {
      state.churchFollows.push({ userId: user.uid, churchId: ch.id, isPreferred: Boolean(isPreferred), createdAt: new Date().toISOString() });
    }
    return { ok: true, status: 200, following: true, isPreferred: Boolean(isPreferred), churchId: ch.id };
  }

  function updateNotificationPreferences(churchId, payload, user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    const now = new Date().toISOString();
    const prefs = {
      userId: user.uid,
      churchId,
      categories: {
        service_new: Boolean(payload?.categories?.service_new ?? true),
        time_change: Boolean(payload?.categories?.time_change ?? true),
        announcement: Boolean(payload?.categories?.announcement ?? false),
        lesson: Boolean(payload?.categories?.lesson ?? false),
        event: Boolean(payload?.categories?.event ?? false),
        financial: Boolean(payload?.categories?.financial ?? false) // Domyślnie ZAWSZE wyłączone!
      },
      quietHoursStart: sanitizeText(payload?.quietHoursStart || '22:00', 8),
      quietHoursEnd: sanitizeText(payload?.quietHoursEnd || '07:00', 8),
      worshipDnd: Boolean(payload?.worshipDnd ?? true),
      updatedAt: now
    };
    const idx = state.notificationPreferences.findIndex((p) => p.userId === user.uid && p.churchId === churchId);
    if (idx >= 0) state.notificationPreferences[idx] = prefs;
    else state.notificationPreferences.push(prefs);
    return { ok: true, status: 200, preferences: prefs };
  }

  function deleteAllUserData(user) {
    if (!user?.uid) return { ok: false, status: 401, error: 'auth_required' };
    state.privateNotes = state.privateNotes.filter((x) => x.userId !== user.uid);
    state.personalStudyProgress = state.personalStudyProgress.filter((x) => x.userId !== user.uid);
    state.eventRsvps = state.eventRsvps.filter((x) => x.userId !== user.uid);
    state.churchFollows = state.churchFollows.filter((x) => x.userId !== user.uid);
    state.notificationPreferences = state.notificationPreferences.filter((x) => x.userId !== user.uid);
    state.prayerRequests = state.prayerRequests.filter((x) => x.userId !== user.uid);
    return { ok: true, status: 200, deleted: true };
  }

  // --- Zgłoszenia moderacyjne ---
  function createModerationReport(churchId, payload, user) {
    const reason = sanitizeMultiline(payload?.reason, 600);
    const targetType = sanitizeText(payload?.targetType, 40);
    const targetId = sanitizeText(payload?.targetId, 80);
    if (!reason || !targetType || !targetId) return { ok: false, status: 400, error: 'invalid_report' };
    const report = {
      id: makeId('rep'),
      churchId,
      targetType,
      targetId,
      reason,
      reporterId: user?.uid || 'anonymous',
      status: 'open',
      createdAt: new Date().toISOString()
    };
    state.moderationReports.push(report);
    return { ok: true, status: 201, report };
  }

  // --- Śpiewnik z twardą bramką licencyjną ---
  async function loadHymnalMeta(env = {}, deps = {}) {
    if (hymnalMetaCache) return hymnalMetaCache;
    try {
      if (typeof deps?.fetchAsset === 'function') {
        hymnalMetaCache = await deps.fetchAsset('data/spiewajmy-panu-meta.json');
      } else if (env?.ASSETS && typeof env.ASSETS.fetch === 'function') {
        const res = await env.ASSETS.fetch(new Request('https://polskieradio.cc/data/spiewajmy-panu-meta.json'));
        if (res && res.ok) hymnalMetaCache = await res.json();
      }
    } catch {}
    if (!hymnalMetaCache && typeof process !== 'undefined' && process?.versions?.node) {
      try {
        const fs = await import('node:fs');
        const path = await import('node:path');
        const p = path.resolve(process.cwd(), 'data', 'spiewajmy-panu-meta.json');
        if (fs.existsSync(p)) {
          hymnalMetaCache = JSON.parse(fs.readFileSync(p, 'utf8'));
        }
      } catch {}
    }
    return hymnalMetaCache;
  }

  async function getHymnMetadata({ number, query = '', hymnalId = 'spiewajmy-panu-kads' } = {}, env = {}, deps = {}) {
    const meta = await loadHymnalMeta(env, deps);
    if (!meta || !Array.isArray(meta.songs)) {
      return {
        ok: false,
        error: 'hymnal_meta_unavailable',
        officialUrl: 'https://muzycy.adwent.pl/',
        license: state.licenses['kads-spiewajmy-panu-review']
      };
    }

    const num = Number(number);
    let matches = [];
    if (Number.isFinite(num) && num >= 1 && num <= 700) {
      const hit = meta.songs.find((s) => s.number === num);
      if (hit) matches = [hit];
    } else if (query) {
      const q = String(query).trim().toLowerCase();
      matches = meta.songs
        .filter((s) =>
          String(s.number) === q ||
          s.title.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.lyricsPublicAllowed && s.firstLine && s.firstLine.toLowerCase().includes(q))
        )
        .slice(0, 15);
    } else {
      matches = meta.songs.slice(0, 20);
    }

    return {
      ok: true,
      hymnalId,
      edition: meta.edition,
      officialUrl: meta.officialUrl || 'https://muzycy.adwent.pl/',
      totalCatalog: meta.totalSongs,
      count: matches.length,
      licensePolicy: 'Pełny tekst zwracany wyłącznie dla utworów w domenie publicznej lub z potwierdzoną licencją wydawcy; dla pozostałych wyłącznie metadane i legalny link.',
      hymns: matches.map((s) => ({
        id: s.id,
        hymnalId: s.hymnalId,
        edition: s.edition,
        number: s.number,
        title: s.title,
        key: s.key,
        author: s.author,
        section: s.section,
        category: s.category,
        bibleRefs: s.bibleRefs || [],
        licenseId: s.licenseId,
        license: meta.licenses?.[s.licenseId] || state.licenses['kads-spiewajmy-panu-review'],
        lyricsIncluded: Boolean(s.lyricsPublicAllowed && Array.isArray(s.stanzas)),
        stanzas: s.lyricsPublicAllowed ? s.stanzas : null,
        officialUrl: s.officialUrl || 'https://muzycy.adwent.pl/',
        audioUrl: s.audioUrl || null,
        audioLicenseId: s.audioLicenseId || null
      })),
      timestamp: new Date().toISOString()
    };
  }

  return {
    state,
    lessonProvider,
    searchChurches,
    getChurchByIdOrSlug,
    createChurch,
    getChurchProfile,
    getServiceFull,
    createOrUpdateService,
    copyServiceToNextWeek,
    mutateLiveState,
    upsertGivingTarget,
    verifyGivingTarget,
    getPublicAnnouncements,
    createAnnouncement,
    getPublicEvents,
    submitEventRsvp,
    getUserPrivateNotes,
    saveUserPrivateNote,
    createPrayerRequest,
    withdrawPrayerRequest,
    updateLessonSession,
    savePersonalStudyProgress,
    getPersonalStudyProgress,
    setChurchFollow,
    updateNotificationPreferences,
    deleteAllUserData,
    createModerationReport,
    getHymnMetadata,
    hasRole,
    findMembership
  };
}

export const defaultMojKosciolStore = createMojKosciolStore();

function jsonResp(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      ...extraHeaders
    }
  });
}

async function resolveAuthUser(request, deps = {}) {
  const authHeader = request.headers.get('Authorization') || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();
  if (!token) return null;
  if (typeof deps.verifyToken === 'function') {
    try {
      const verified = await deps.verifyToken(token);
      if (verified?.uid) return verified;
    } catch {
      return null;
    }
  }
  return null;
}

async function readJsonBody(request, maxBytes = 65536) {
  const text = await request.text();
  if (text.length > maxBytes) return { ok: false, status: 413, error: 'payload_too_large' };
  if (!text.trim()) return { ok: true, data: {} };
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, error: 'invalid_json' };
  }
}

export async function handleMojKosciolApi(request, env = {}, deps = {}) {
  const store = deps.store || defaultMojKosciolStore;
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  // GET /api/moj-kosciol/v1/health
  if (path === '/api/moj-kosciol/v1/health' && method === 'GET') {
    return jsonResp({
      ok: true,
      service: 'moj-kosciol-v2',
      stage: 'test_pilot',
      churchesCount: store.state.churches.length,
      templatesCount: SERVICE_TEMPLATES.length,
      sabbathSchoolHealth: store.lessonProvider.health(),
      timestamp: new Date().toISOString()
    });
  }

  // GET /api/moj-kosciol/v1/templates
  if (path === '/api/moj-kosciol/v1/templates' && method === 'GET') {
    return jsonResp({ ok: true, templates: SERVICE_TEMPLATES });
  }

  // GET /api/moj-kosciol/v1/churches (public directory search)
  if (path === '/api/moj-kosciol/v1/churches' && method === 'GET') {
    const churches = store.searchChurches({
      query: url.searchParams.get('q') || '',
      city: url.searchParams.get('city') || '',
      denomination: url.searchParams.get('denomination') || ''
    });
    return jsonResp({ ok: true, count: churches.length, churches, timestamp: new Date().toISOString() });
  }

  // POST /api/moj-kosciol/v1/churches (create new church wizard — auth required)
  if (path === '/api/moj-kosciol/v1/churches' && method === 'POST') {
    const user = await resolveAuthUser(request, deps);
    const body = await readJsonBody(request);
    if (!body.ok) return jsonResp(body, body.status);
    const res = store.createChurch(body.data, user);
    return jsonResp(res, res.status);
  }

  // GET /api/moj-kosciol/v1/churches/:idOrSlug
  const churchMatch = path.match(/^\/api\/moj-kosciol\/v1\/churches\/([^/]+)$/);
  if (churchMatch && method === 'GET') {
    const profile = store.getChurchProfile(decodeURIComponent(churchMatch[1]));
    if (!profile) return jsonResp({ ok: false, error: 'church_not_found' }, 404);
    return jsonResp({ ok: true, ...profile, timestamp: new Date().toISOString() });
  }

  // POST /api/moj-kosciol/v1/churches/:id/services
  const churchServicesMatch = path.match(/^\/api\/moj-kosciol\/v1\/churches\/([^/]+)\/services$/);
  if (churchServicesMatch && method === 'POST') {
    const user = await resolveAuthUser(request, deps);
    const body = await readJsonBody(request);
    if (!body.ok) return jsonResp(body, body.status);
    const res = store.createOrUpdateService(decodeURIComponent(churchServicesMatch[1]), body.data, user);
    return jsonResp(res, res.status);
  }

  // GET /api/moj-kosciol/v1/services/:id (with ETag / 304 support for lightweight polling)
  const serviceMatch = path.match(/^\/api\/moj-kosciol\/v1\/services\/([^/]+)$/);
  if (serviceMatch && method === 'GET') {
    const full = store.getServiceFull(decodeURIComponent(serviceMatch[1]));
    if (!full) return jsonResp({ ok: false, error: 'service_not_found' }, 404);
    const inm = request.headers.get('If-None-Match');
    if (inm && inm === full.etag) {
      return new Response(null, { status: 304, headers: { ETag: full.etag, 'Cache-Control': 'no-cache' } });
    }
    return jsonResp({ ok: true, ...full, timestamp: new Date().toISOString() }, 200, { ETag: full.etag });
  }

  // POST /api/moj-kosciol/v1/services/:id/copy-next-week
  const copyWeekMatch = path.match(/^\/api\/moj-kosciol\/v1\/services\/([^/]+)\/copy-next-week$/);
  if (copyWeekMatch && method === 'POST') {
    const user = await resolveAuthUser(request, deps);
    const res = store.copyServiceToNextWeek(decodeURIComponent(copyWeekMatch[1]), user);
    return jsonResp(res, res.status);
  }

  // GET & POST /api/moj-kosciol/v1/services/:id/live
  const liveMatch = path.match(/^\/api\/moj-kosciol\/v1\/services\/([^/]+)\/live$/);
  if (liveMatch && method === 'GET') {
    const full = store.getServiceFull(decodeURIComponent(liveMatch[1]));
    if (!full) return jsonResp({ ok: false, error: 'service_not_found' }, 404);
    const inm = request.headers.get('If-None-Match');
    if (inm && inm === full.etag) {
      return new Response(null, { status: 304, headers: { ETag: full.etag, 'Cache-Control': 'no-cache' } });
    }
    return jsonResp({ ok: true, liveState: full.liveState, items: full.items, etag: full.etag, timestamp: new Date().toISOString() }, 200, { ETag: full.etag });
  }
  if (liveMatch && method === 'POST') {
    const user = await resolveAuthUser(request, deps);
    const body = await readJsonBody(request);
    if (!body.ok) return jsonResp(body, body.status);
    const res = store.mutateLiveState(decodeURIComponent(liveMatch[1]), body.data, user);
    return jsonResp(res, res.status, res.etag ? { ETag: res.etag } : {});
  }

  // POST /api/moj-kosciol/v1/churches/:id/giving & verify
  const givingMatch = path.match(/^\/api\/moj-kosciol\/v1\/churches\/([^/]+)\/giving$/);
  if (givingMatch && method === 'POST') {
    const user = await resolveAuthUser(request, deps);
    const body = await readJsonBody(request);
    if (!body.ok) return jsonResp(body, body.status);
    const res = store.upsertGivingTarget(decodeURIComponent(givingMatch[1]), body.data, user);
    return jsonResp(res, res.status);
  }
  const givingVerifyMatch = path.match(/^\/api\/moj-kosciol\/v1\/churches\/([^/]+)\/giving\/([^/]+)\/verify$/);
  if (givingVerifyMatch && method === 'POST') {
    const user = await resolveAuthUser(request, deps);
    const body = await readJsonBody(request);
    if (!body.ok) return jsonResp(body, body.status);
    const res = store.verifyGivingTarget(decodeURIComponent(givingVerifyMatch[1]), decodeURIComponent(givingVerifyMatch[2]), user, body.data?.confirmationSource);
    return jsonResp(res, res.status);
  }

  // Announcements
  const annMatch = path.match(/^\/api\/moj-kosciol\/v1\/churches\/([^/]+)\/announcements$/);
  if (annMatch && method === 'GET') {
    const list = store.getPublicAnnouncements(decodeURIComponent(annMatch[1]));
    return jsonResp({ ok: true, count: list.length, announcements: list, timestamp: new Date().toISOString() });
  }
  if (annMatch && method === 'POST') {
    const user = await resolveAuthUser(request, deps);
    const body = await readJsonBody(request);
    if (!body.ok) return jsonResp(body, body.status);
    const res = store.createAnnouncement(decodeURIComponent(annMatch[1]), body.data, user);
    return jsonResp(res, res.status);
  }

  // Events & .ics & RSVP
  const evMatch = path.match(/^\/api\/moj-kosciol\/v1\/churches\/([^/]+)\/events$/);
  if (evMatch && method === 'GET') {
    const list = store.getPublicEvents(decodeURIComponent(evMatch[1]));
    return jsonResp({ ok: true, count: list.length, events: list, timestamp: new Date().toISOString() });
  }
  const icsMatch = path.match(/^\/api\/moj-kosciol\/v1\/events\/([^/]+)\.ics$/);
  if (icsMatch && method === 'GET') {
    const evt = store.state.events.find((e) => e.id === decodeURIComponent(icsMatch[1]));
    if (!evt) return jsonResp({ ok: false, error: 'event_not_found' }, 404);
    const ics = buildEventIcs({
      uid: evt.id,
      title: evt.title,
      description: evt.status === 'cancelled' ? `ODWOŁANE: ${evt.cancelReason}\n${evt.description}` : evt.description,
      location: evt.location,
      startAt: evt.startAt,
      endAt: evt.endAt,
      timezone: evt.timezone,
      status: evt.status,
      url: `https://polskieradio.cc/test/sba/moj-kosciol/?event=${encodeURIComponent(evt.id)}`
    });
    return new Response(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${evt.id}.ics"`,
        'Cache-Control': 'no-store'
      }
    });
  }
  const rsvpMatch = path.match(/^\/api\/moj-kosciol\/v1\/events\/([^/]+)\/rsvp$/);
  if (rsvpMatch && method === 'POST') {
    const user = await resolveAuthUser(request, deps);
    const body = await readJsonBody(request);
    if (!body.ok) return jsonResp(body, body.status);
    const res = store.submitEventRsvp(decodeURIComponent(rsvpMatch[1]), body.data, user);
    return jsonResp(res, res.status);
  }

  // Sabbath School PL/EN endpoints (works WITHOUT selected church and WITHOUT AI!)
  if (path === '/api/moj-kosciol/v1/sabbath-school/current' && method === 'GET') {
    const res = store.lessonProvider.getCurrentLesson({
      date: url.searchParams.get('date') || new Date(),
      timeZone: url.searchParams.get('tz') || 'Europe/Warsaw',
      language: url.searchParams.get('lang') || 'pl',
      mode: url.searchParams.get('mode') || 'discussion',
      lessonId: url.searchParams.get('lessonId') || null
    });
    return jsonResp(res, res.ok ? 200 : 503);
  }
  if (path === '/api/moj-kosciol/v1/sabbath-school/sources' && method === 'GET') {
    return jsonResp({
      ok: true,
      sources: SABBATH_SCHOOL_SOURCES,
      license: SABBATH_SCHOOL_LICENSE,
      health: store.lessonProvider.health(),
      timestamp: new Date().toISOString()
    });
  }
  if (path === '/api/moj-kosciol/v1/sabbath-school/import-full' && method === 'POST') {
    const body = await readJsonBody(request);
    const res = store.lessonProvider.getPermittedContent(body.data?.lessonId || '2026-Q4-L09', body.data?.lang || 'pl', { requestFullImport: true });
    return jsonResp(res, res.ok ? 200 : 403);
  }
  const lessonSessionMatch = path.match(/^\/api\/moj-kosciol\/v1\/churches\/([^/]+)\/study-groups\/([^/]+)\/session$/);
  if (lessonSessionMatch && method === 'POST') {
    const user = await resolveAuthUser(request, deps);
    const body = await readJsonBody(request);
    if (!body.ok) return jsonResp(body, body.status);
    const res = store.updateLessonSession(decodeURIComponent(lessonSessionMatch[1]), decodeURIComponent(lessonSessionMatch[2]), body.data, user);
    return jsonResp(res, res.status);
  }

  // Hymnal metadata (license-enforced!)
  if (path === '/api/moj-kosciol/v1/hymns' && method === 'GET') {
    const res = await store.getHymnMetadata({
      number: url.searchParams.get('number'),
      query: url.searchParams.get('q') || ''
    }, env, deps);
    return jsonResp(res, res.ok ? 200 : 503);
  }

  // Private notes, study progress, prayer requests, follows, notifications, data deletion
  if (path === '/api/moj-kosciol/v1/me/notes') {
    const user = await resolveAuthUser(request, deps);
    if (method === 'GET') {
      const res = store.getUserPrivateNotes(user, url.searchParams.get('serviceId') || '');
      return jsonResp(res, res.status);
    }
    if (method === 'POST') {
      const body = await readJsonBody(request);
      if (!body.ok) return jsonResp(body, body.status);
      const res = store.saveUserPrivateNote(body.data, user);
      return jsonResp(res, res.status);
    }
  }
  if (path === '/api/moj-kosciol/v1/me/study-progress') {
    const user = await resolveAuthUser(request, deps);
    if (method === 'GET') {
      const res = store.getPersonalStudyProgress(url.searchParams.get('lessonRefId') || '', user);
      return jsonResp(res, res.status);
    }
    if (method === 'POST') {
      const body = await readJsonBody(request);
      if (!body.ok) return jsonResp(body, body.status);
      const res = store.savePersonalStudyProgress(body.data, user);
      return jsonResp(res, res.status);
    }
  }
  if (path === '/api/moj-kosciol/v1/me/data' && method === 'DELETE') {
    const user = await resolveAuthUser(request, deps);
    const res = store.deleteAllUserData(user);
    return jsonResp(res, res.status);
  }

  const followMatch = path.match(/^\/api\/moj-kosciol\/v1\/churches\/([^/]+)\/follow$/);
  if (followMatch && method === 'POST') {
    const user = await resolveAuthUser(request, deps);
    const body = await readJsonBody(request);
    if (!body.ok) return jsonResp(body, body.status);
    const res = store.setChurchFollow(decodeURIComponent(followMatch[1]), body.data, user);
    return jsonResp(res, res.status);
  }

  const notifMatch = path.match(/^\/api\/moj-kosciol\/v1\/churches\/([^/]+)\/notifications$/);
  if (notifMatch && method === 'POST') {
    const user = await resolveAuthUser(request, deps);
    const body = await readJsonBody(request);
    if (!body.ok) return jsonResp(body, body.status);
    const res = store.updateNotificationPreferences(decodeURIComponent(notifMatch[1]), body.data, user);
    return jsonResp(res, res.status);
  }

  const prayerMatch = path.match(/^\/api\/moj-kosciol\/v1\/churches\/([^/]+)\/prayers$/);
  if (prayerMatch && method === 'POST') {
    const user = await resolveAuthUser(request, deps);
    const body = await readJsonBody(request);
    if (!body.ok) return jsonResp(body, body.status);
    const res = store.createPrayerRequest(decodeURIComponent(prayerMatch[1]), body.data, user);
    return jsonResp(res, res.status);
  }
  const prayerWithdrawMatch = path.match(/^\/api\/moj-kosciol\/v1\/prayers\/([^/]+)\/withdraw$/);
  if (prayerWithdrawMatch && method === 'POST') {
    const user = await resolveAuthUser(request, deps);
    const res = store.withdrawPrayerRequest(decodeURIComponent(prayerWithdrawMatch[1]), user);
    return jsonResp(res, res.status);
  }

  const reportMatch = path.match(/^\/api\/moj-kosciol\/v1\/churches\/([^/]+)\/reports$/);
  if (reportMatch && method === 'POST') {
    const user = await resolveAuthUser(request, deps);
    const body = await readJsonBody(request);
    if (!body.ok) return jsonResp(body, body.status);
    const res = store.createModerationReport(decodeURIComponent(reportMatch[1]), body.data, user);
    return jsonResp(res, res.status);
  }

  return jsonResp({ ok: false, error: 'not_found' }, 404);
}
