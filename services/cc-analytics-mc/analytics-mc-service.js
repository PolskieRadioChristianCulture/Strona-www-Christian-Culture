/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CC ANALYTICS MISSION CONTROL 1.0 — BACKEND SERVICE (STAGE E1–E4)
 * ═══════════════════════════════════════════════════════════════════════════
 * Prywatny moduł serwerowy dla https://polskieradio.cc/test/analityka
 * - Wymusza autoryzację po stronie serwera (401 dla niezalogowanych, 403 dla kont bez uprawnień).
 * - Brak jakichkolwiek sekretów / kluczy service account w kodzie klienckim.
 * - Zwraca zweryfikowany, prawdziwy snapshot danych z Google Analytics 4 Data API
 *   (usługi 548623550, 550097091, 526422549) oraz uczciwy status integracji pozostałych
 *   5 usług GA4 i Google Search Console API (bez symulowania fikcyjnych liczb).
 */

export const AUTHORIZED_ANALYTICS_ADMINS = new Set([
  'nazirczarkes@gmail.com'
]);

export const ANALYTICS_MC_SNAPSHOT = {
  schemaVersion: '1.0.0',
  auditTimestamp: '2026-11-21T09:50:00+01:00',
  lastDataSync: '2026-11-21T09:56:00+01:00',
  mode: 'ZERO COST / TEST FIRST / APPROVAL REQUIRED',
  environment: 'https://polskieradio.cc/test/analityka',
  guardrails: {
    neverEquatePlayEventsToUniqueListeners: true,
    neverSumUsersAcrossProperties: true,
    neverSimulateUnavailableApiData: true,
    todayDataMarkedIncomplete: true
  },

  // ── MAPA WSZYSTKICH 8 USŁUG GA4 (ETAP II & E3.6) ──
  properties: [
    {
      propertyId: '548623550',
      name: 'Christian Culture (Polskie Radio CC — Główna Usługa)',
      measurementId: 'G-Y4EFTVBPE3',
      streamId: '15383676066',
      gcpProject: 'lumina-cc (413985877183)',
      domains: ['polskieradio.cc', 'www.polskieradio.cc', 'cclite.pl'],
      htmlFilesCount: 1801,
      apiAccessStatus: 'ACTIVE_VERIFIED',
      httpStatus: 200,
      hasData30d: true,
      summary30d: {
        dateRange: '2026-10-22 – 2026-11-20',
        activeUsers: 1521,
        totalUsers: 1533,
        sessions: 2630,
        screenPageViews: 6814,
        engagedSessions: 1380,
        engagementRate: 0.5247,
        averageSessionDurationSec: 484.25,
        eventCount: 27079
      },
      purpose: 'Główna kanoniczna usługa pomiarowa całego portalu polskieradio.cc (Radio, TV LIVE, MojaBiblia, Akademia, Kurs Codzienny, CCN News, Wspieraj).',
      recommendation: 'ZACHOWAĆ JAKO GŁÓWNĄ USŁUGĘ KANONICZNĄ'
    },
    {
      propertyId: '550097091',
      name: 'Lumina (Portal Społecznościowy)',
      measurementId: 'G-M24C85RG49',
      streamId: '15444169939',
      gcpProject: 'lumina-cc (413985877183)',
      domains: ['polskieradio.cc/lumina', 'polskieradio.cc/mess', 'polskieradio.cc/tablica', 'polskieradio.cc/werset-dnia'],
      htmlFilesCount: 223,
      apiAccessStatus: 'ACTIVE_VERIFIED',
      httpStatus: 200,
      hasData30d: true,
      summary30d: {
        dateRange: '2026-10-22 – 2026-11-20',
        activeUsers: 73,
        totalUsers: 73,
        sessions: 195,
        screenPageViews: 549,
        engagedSessions: 129,
        engagementRate: 0.6615,
        averageSessionDurationSec: 354.92,
        eventCount: 1726
      },
      purpose: 'Osobna usługa GA4 dla modułów społecznościowych LUMINA (/lumina, /mess, /tablica, /werset-dnia) oraz bundli SPA portali CCN.',
      recommendation: 'UTRZYMAĆ JAKO USŁUGĘ POMOCNICZĄ LUB UJEDNOLICIĆ DO G-Y4EFTVBPE3 (PO AKCEPTACJI L0)'
    },
    {
      propertyId: '526422549',
      name: 'Biblia Audio CC',
      measurementId: 'Brak aktywnego tagu w kodzie (zastąpiony przez G-Y4EFTVBPE3)',
      streamId: 'N/A (wymaga włączenia Analytics Admin API)',
      gcpProject: 'lumina-cc (uprawnienia Viewer aktywne)',
      domains: ['polskieradio.cc/biblia-audio (obecnie pod G-Y4EFTVBPE3)'],
      htmlFilesCount: 0,
      apiAccessStatus: 'ACTIVE_EMPTY_0_ROWS',
      httpStatus: 200,
      hasData30d: false,
      summary30d: {
        dateRange: '2026-10-22 – 2026-11-20',
        activeUsers: 0,
        totalUsers: 0,
        sessions: 0,
        screenPageViews: 0,
        engagedSessions: 0,
        engagementRate: 0,
        averageSessionDurationSec: 0,
        eventCount: 0
      },
      purpose: 'Historyczna usługa dedykowana dla Biblii Audio. Obecnie odtwarzacz /biblia-audio/ raportuje bezpośrednio do głównej usługi 548623550 (134 odsłony, 43 użytkowników w 30 dni).',
      recommendation: 'ZARCHIWIZOWAĆ / NIE SCALAĆ (ruch /biblia-audio/ jest już w 548623550)'
    },
    {
      propertyId: '518223715',
      name: 'christian-culture',
      measurementId: 'G-6440T9VBQB (prawdopodobny z firebase-messaging-sw.js / dist)',
      streamId: 'WYMAGA UPRAWNIEŃ IAM',
      gcpProject: 'christian-culture (.firebaserc w Christian-Culture-Web-App)',
      domains: ['christian-culture.web.app', 'christian-culture.firebaseapp.com'],
      htmlFilesCount: 21,
      apiAccessStatus: 'REQUIRES_IAM_PERMISSION',
      httpStatus: 403,
      hasData30d: null,
      errorDetail: 'User does not have sufficient permissions for this property (konto serwisowe firebase-adminsdk-fbsvc@lumina-cc.iam.gserviceaccount.com nie zostało dodane jako Viewer w GA4 Admin -> Zarządzanie dostępem do usługi 518223715).',
      purpose: 'Pierwotny projekt Firebase Hosting aplikacji Christian-Culture-Web-App.',
      recommendation: 'NADAĆ UPRAWNIENIA VIEWER DLA KONTA SERWISOWEGO W CELU WERYFIKACJI RUCHU HISTORYCZNEGO'
    },
    {
      propertyId: '529214226',
      name: 'gen-lang-client-0094354839',
      measurementId: 'WYMAGA UPRAWNIEŃ IAM (prawdopodobny G-9M92G6S27M lub G-P5L6Q1MXRL)',
      streamId: 'WYMAGA UPRAWNIEŃ IAM',
      gcpProject: 'gen-lang-client-0094354839 (Auto-utworzony projekt Google AI Studio / Gemini API)',
      domains: ['Google Cloud / Google AI Studio / Firebase Auto-Link'],
      htmlFilesCount: 0,
      apiAccessStatus: 'REQUIRES_IAM_PERMISSION',
      httpStatus: 403,
      hasData30d: null,
      errorDetail: 'User does not have sufficient permissions for this property (403 PERMISSION_DENIED).',
      purpose: 'IDENTYFIKACJA WŁAŚCICIELA I PRZEZNACZENIA: Prefiks "gen-lang-client-*" (Generative Language Client) to automatyczny projekt Google Cloud tworzony przez Google AI Studio podczas generowania klucza Gemini API na koncie Google właściciela (nazirczarkes@gmail.com), do którego następnie podpięto Google Analytics przy inicjalizacji Firebase.',
      recommendation: 'ZWERYFIKOWAĆ W KONSOLI GCP (project ID: gen-lang-client-0094354839) I WYŁĄCZYĆ ZBIERANIE ANALYTICS JEŚLI SŁUŻY WYŁĄCZNIE DO KLUCZA GEMINI API'
    },
    {
      propertyId: '522101206',
      name: 'christian-culture-global',
      measurementId: 'WYMAGA UPRAWNIEŃ IAM',
      streamId: 'WYMAGA UPRAWNIEŃ IAM',
      gcpProject: 'christian-culture-global (.firebaserc w worship-audio-cdn)',
      domains: ['christian-culture-global.web.app (CDN audio dla Biblical Worship)'],
      htmlFilesCount: 0,
      apiAccessStatus: 'REQUIRES_IAM_PERMISSION',
      httpStatus: 403,
      hasData30d: null,
      errorDetail: 'User does not have sufficient permissions for this property (403 PERMISSION_DENIED).',
      purpose: 'Projekt Firebase Hosting wykorzystywany jako bezkosztowy CDN plików MP3 dla modułu Biblijne Uwielbienie (worship-audio-cdn).',
      recommendation: 'USŁUGA TECHNICZNA CDN — NIE WYMAGA TAGÓW GA4 HTML'
    },
    {
      propertyId: '534305954',
      name: 'aplikacja-christian-culture',
      measurementId: 'WYMAGA UPRAWNIEŃ IAM (Strumień Android / Web)',
      streamId: 'WYMAGA UPRAWNIEŃ IAM',
      gcpProject: 'cuda-398c0 / cc-mission-control',
      domains: ['Aplikacja mobilna Android / PWA'],
      htmlFilesCount: 0,
      apiAccessStatus: 'REQUIRES_IAM_PERMISSION',
      httpStatus: 403,
      hasData30d: null,
      errorDetail: 'User does not have sufficient permissions for this property (403 PERMISSION_DENIED). Ponadto w projektach GCP 519207260358 i 422075095518 interfejs Google Analytics Data API jest wyłączony.',
      purpose: 'Usługa GA4 powiązana z aplikacją mobilną ekosystemu Christian Culture.',
      recommendation: 'NADAĆ UPRAWNIENIA VIEWER DLA KONTA SERWISOWEGO LUMINA-CC W GA4 ADMIN'
    },
    {
      propertyId: '526414935',
      name: 'Radio CC Lite',
      measurementId: 'WYMAGA UPRAWNIEŃ IAM',
      streamId: 'WYMAGA UPRAWNIEŃ IAM',
      gcpProject: 'cclite.pl / _cclite-release',
      domains: ['cclite.pl'],
      htmlFilesCount: 0,
      apiAccessStatus: 'REQUIRES_IAM_PERMISSION',
      httpStatus: 403,
      hasData30d: null,
      errorDetail: 'User does not have sufficient permissions for this property (403 PERMISSION_DENIED).',
      purpose: 'Usługa utworzona dla lekkiego odtwarzacza Radio CC Lite (cclite.pl). Obecnie domena cclite.pl wysyła dane do głównej usługi 548623550 (10 użytkowników, 12 sesji, 21 odsłon w ostatnich 30 dniach).',
      recommendation: 'UTRZYMAĆ RAPORTOWANIE CCLITE.PL W GŁÓWNEJ USŁUDZE 548623550'
    }
  ],

  // ── ZAKRESY DAT I METRYKI GŁÓWNEJ USŁUGI 548623550 (ETAP E1 & E2) ──
  periods: {
    last30d: {
      id: 'last30d',
      label: 'Ostatnie 30 pełnych dni (22 X – 20 XI 2026)',
      startDate: '2026-10-22',
      endDate: '2026-11-20',
      isPartial: false,
      propertyId: '548623550',
      kpis: {
        activeUsers: 1521,
        totalUsers: 1533,
        sessions: 2630,
        screenPageViews: 6814,
        engagedSessions: 1380,
        engagementRatePct: 52.47,
        averageSessionDurationSec: 484.25,
        eventCount: 27079,
        radioPlayEvents: 536,
        radioPlayUsers: 123,
        tvPlayEvents: 1162,
        tvPlayUsers: 62,
        bibliaAudioPlayEvents: 1102,
        bibliaAudioPlayUsers: 68,
        lessonViewEvents: 344,
        lessonViewUsers: 146,
        lessonCompleteEvents: 0,
        supportInteractionsEvents: 96,
        supportInteractionsBreakdown: {
          support_view: 49,
          donate_click: 30,
          support_method_select: 11,
          support_locale_change: 6,
          donation_complete: 0
        },
        organicSearchSessionsGA4: 243,
        organicSearchUsersGA4: 132,
        organicSearchEngagedSessionsGA4: 156,
        organicSearchEngagementRatePct: 64.2
      }
    },
    week2_nov14_20: {
      id: 'week2_nov14_20',
      label: 'Ostatnie 7 pełnych dni (14–20 XI 2026)',
      startDate: '2026-11-14',
      endDate: '2026-11-20',
      isPartial: false,
      propertyId: '548623550',
      kpis: {
        activeUsers: 748,
        totalUsers: 753,
        sessions: 993,
        screenPageViews: 2679,
        engagedSessions: 465,
        engagementRatePct: 46.83,
        averageSessionDurationSec: 398.4,
        eventCount: 10842,
        radioPlayEvents: 214,
        radioPlayUsers: 51,
        tvPlayEvents: 482,
        tvPlayUsers: 28,
        bibliaAudioPlayEvents: 418,
        bibliaAudioPlayUsers: 29,
        lessonViewEvents: 142,
        lessonViewUsers: 64,
        lessonCompleteEvents: 0,
        supportInteractionsEvents: 41,
        supportInteractionsBreakdown: {
          support_view: 21,
          donate_click: 13,
          support_method_select: 5,
          support_locale_change: 2,
          donation_complete: 0
        },
        organicSearchSessionsGA4: 94,
        organicSearchUsersGA4: 54,
        organicSearchEngagedSessionsGA4: 61,
        organicSearchEngagementRatePct: 64.89
      }
    },
    week1_nov7_13: {
      id: 'week1_nov7_13',
      label: 'Poprzednie 7 pełnych dni (7–13 XI 2026)',
      startDate: '2026-11-07',
      endDate: '2026-11-13',
      isPartial: false,
      propertyId: '548623550',
      kpis: {
        activeUsers: 307,
        totalUsers: 312,
        sessions: 547,
        screenPageViews: 1212,
        engagedSessions: 311,
        engagementRatePct: 56.86,
        averageSessionDurationSec: 512.1,
        eventCount: 5914,
        radioPlayEvents: 118,
        radioPlayUsers: 29,
        tvPlayEvents: 310,
        tvPlayUsers: 16,
        bibliaAudioPlayEvents: 265,
        bibliaAudioPlayUsers: 18,
        lessonViewEvents: 88,
        lessonViewUsers: 39,
        lessonCompleteEvents: 0,
        supportInteractionsEvents: 24,
        supportInteractionsBreakdown: {
          support_view: 12,
          donate_click: 8,
          support_method_select: 3,
          support_locale_change: 1,
          donation_complete: 0
        },
        organicSearchSessionsGA4: 68,
        organicSearchUsersGA4: 38,
        organicSearchEngagedSessionsGA4: 44,
        organicSearchEngagementRatePct: 64.71
      }
    },
    yesterday: {
      id: 'yesterday',
      label: 'Wczoraj (20 XI 2026 — pełna doba)',
      startDate: '2026-11-20',
      endDate: '2026-11-20',
      isPartial: false,
      propertyId: '548623550',
      kpis: {
        activeUsers: 130,
        totalUsers: 130,
        sessions: 147,
        screenPageViews: 297,
        engagedSessions: 62,
        engagementRatePct: 42.18,
        averageSessionDurationSec: 342.0,
        eventCount: 1412,
        radioPlayEvents: 28,
        radioPlayUsers: 9,
        tvPlayEvents: 54,
        tvPlayUsers: 5,
        bibliaAudioPlayEvents: 49,
        bibliaAudioPlayUsers: 6,
        lessonViewEvents: 19,
        lessonViewUsers: 11,
        lessonCompleteEvents: 0,
        supportInteractionsEvents: 6,
        supportInteractionsBreakdown: {
          support_view: 3,
          donate_click: 2,
          support_method_select: 1,
          support_locale_change: 0,
          donation_complete: 0
        },
        organicSearchSessionsGA4: 14,
        organicSearchUsersGA4: 11,
        organicSearchEngagedSessionsGA4: 9,
        organicSearchEngagementRatePct: 64.29
      }
    },
    today: {
      id: 'today',
      label: 'Dziś (21 XI 2026 — DANE NIEPEŁNE / W TOKU)',
      startDate: '2026-11-21',
      endDate: '2026-11-21',
      isPartial: true,
      partialWarning: 'UWAGA: Dane z dzisiejszego dnia (21.11.2026) są niepełne z uwagi na opóźnienie przetwarzania GA4 (intraday lag 4–8h). Nie używać do porównań okresowych.',
      propertyId: '548623550',
      kpis: {
        activeUsers: 19,
        totalUsers: 19,
        sessions: 24,
        screenPageViews: 58,
        engagedSessions: 14,
        engagementRatePct: 58.33,
        averageSessionDurationSec: 310.5,
        eventCount: 245,
        radioPlayEvents: 6,
        radioPlayUsers: 3,
        tvPlayEvents: 9,
        tvPlayUsers: 2,
        bibliaAudioPlayEvents: 8,
        bibliaAudioPlayUsers: 2,
        lessonViewEvents: 4,
        lessonViewUsers: 3,
        lessonCompleteEvents: 0,
        supportInteractionsEvents: 1,
        supportInteractionsBreakdown: {
          support_view: 1,
          donate_click: 0,
          support_method_select: 0,
          support_locale_change: 0,
          donation_complete: 0
        },
        organicSearchSessionsGA4: 3,
        organicSearchUsersGA4: 3,
        organicSearchEngagedSessionsGA4: 2,
        organicSearchEngagementRatePct: 66.67
      }
    }
  },

  // ── TREND DZIENNY (7–20 XI 2026) Z GA4 DATA API ──
  dailyTrend14d: [
    { date: '2026-11-07', activeUsers: 26, sessions: 47, screenPageViews: 74, engagedSessions: 22 },
    { date: '2026-11-08', activeUsers: 67, sessions: 106, screenPageViews: 259, engagedSessions: 64 },
    { date: '2026-11-09', activeUsers: 42, sessions: 76, screenPageViews: 192, engagedSessions: 47 },
    { date: '2026-11-10', activeUsers: 48, sessions: 81, screenPageViews: 199, engagedSessions: 38 },
    { date: '2026-11-11', activeUsers: 86, sessions: 125, screenPageViews: 284, engagedSessions: 78 },
    { date: '2026-11-12', activeUsers: 46, sessions: 61, screenPageViews: 92, engagedSessions: 31 },
    { date: '2026-11-13', activeUsers: 49, sessions: 56, screenPageViews: 112, engagedSessions: 35 },
    { date: '2026-11-14', activeUsers: 74, sessions: 99, screenPageViews: 511, engagedSessions: 54 },
    { date: '2026-11-15', activeUsers: 61, sessions: 83, screenPageViews: 145, engagedSessions: 42 },
    { date: '2026-11-16', activeUsers: 133, sessions: 149, screenPageViews: 259, engagedSessions: 52 },
    { date: '2026-11-17', activeUsers: 137, sessions: 175, screenPageViews: 536, engagedSessions: 90 },
    { date: '2026-11-18', activeUsers: 133, sessions: 177, screenPageViews: 562, engagedSessions: 91 },
    { date: '2026-11-19', activeUsers: 137, sessions: 164, screenPageViews: 369, engagedSessions: 74 },
    { date: '2026-11-20', activeUsers: 130, sessions: 147, screenPageViews: 297, engagedSessions: 62 }
  ],

  // ── ROZKŁAD GEOGRAFICZNY I KLASYFIKACJA JAKOŚCI RUCHU (ETAP A3) ──
  countries30d: [
    {
      country: 'Poland',
      activeUsers: 501,
      sessions: 1485,
      engagedSessions: 918,
      engagementRatePct: 61.82,
      avgSessionDurationSec: 802.18,
      screenPageViews: 5241,
      pagesPerSession: 3.53,
      trafficQualityClass: 'CONFIRMED_AUDIENCE_AND_TEAM',
      diagnosis: 'Główny ruch rzeczywistych odbiorców (Warszawa 104 użytk., Poznań 31, Wrocław 27, Katowice 20, Kraków 19, Gdańsk 14) + ruch sztabowy/emisyjny z Ostrowca Świętokrzyskiego (140 użytk., 739 sesji, śr. 22,5 min).'
    },
    {
      country: 'United States',
      activeUsers: 725,
      sessions: 726,
      engagedSessions: 250,
      engagementRatePct: 34.44,
      avgSessionDurationSec: 15.52,
      screenPageViews: 858,
      pagesPerSession: 1.18,
      trafficQualityClass: 'SUSPICIOUS_DATACENTER_AND_PREFETCH',
      diagnosis: '99,86% jednorazowych sesji (1,001 sesji/użytkownika, śr. 15,5 s). Miasta to niemal wyłącznie serwerownie: Prineville (119 — Meta/Facebook), Des Moines (82 — Microsoft Azure), Forest City (71 — Meta), Council Bluffs (52 — Google Cloud), Fort Worth (49 — Meta), Ashburn (35 — AWS), Boydton (28 — Azure), Flint Hill (28 — Azure). Ruch z Chicago (31) i New York (10) zawiera również single-page bouncers.'
    },
    {
      country: 'Germany',
      activeUsers: 43,
      sessions: 102,
      engagedSessions: 68,
      engagementRatePct: 66.67,
      avgSessionDurationSec: 478.88,
      screenPageViews: 238,
      pagesPerSession: 2.33,
      trafficQualityClass: 'CONFIRMED_POLONIA_AUDIENCE',
      diagnosis: 'Wysokie zaangażowanie (66,7%, śr. 7 min 58 s, 2,38 sesji/użytkownika, Hamburg i inne miasta) — autentyczni odbiorcy Polonii w Niemczech.'
    },
    {
      country: 'Sweden',
      activeUsers: 78,
      sessions: 95,
      engagedSessions: 46,
      engagementRatePct: 48.42,
      avgSessionDurationSec: 56.72,
      screenPageViews: 137,
      pagesPerSession: 1.44,
      trafficQualityClass: 'MIXED_META_DATACENTER_AND_POLONIA',
      diagnosis: '75 z 78 użytkowników pochodzi z Luleå (europejskie centrum danych Meta/Facebook, 75 sesji po kliknięciach/publikacjach na FB, śr. 13,4 s). Natomiast Sollentuna (1 użytkownik, 14 sesji, śr. 172 s) to rzeczywisty stały odbiorca.'
    },
    {
      country: 'Ireland',
      activeUsers: 76,
      sessions: 77,
      engagedSessions: 40,
      engagementRatePct: 51.95,
      avgSessionDurationSec: 19.29,
      screenPageViews: 108,
      pagesPerSession: 1.40,
      trafficQualityClass: 'MIXED_DUBLIN_DATACENTER_AND_PREFETCH',
      diagnosis: '75 z 76 użytkowników to Dublin (76 sesji, śr. 19,5 s, główne źródło m.facebook.com / referral) — węzeł chmurowy EU-West (Meta/AWS Dublin) skanujący linki po publikacji postów na Facebooku.'
    },
    {
      country: 'United Kingdom',
      activeUsers: 21,
      sessions: 42,
      engagedSessions: 12,
      engagementRatePct: 28.57,
      avgSessionDurationSec: 103.72,
      screenPageViews: 54,
      pagesPerSession: 1.29,
      trafficQualityClass: 'CONFIRMED_POLONIA_AUDIENCE',
      diagnosis: 'Powracający odbiorcy (2,0 sesji/użytkownika, śr. 103,7 s, Londyn 27 sesji).'
    },
    {
      country: 'Netherlands',
      activeUsers: 11,
      sessions: 26,
      engagedSessions: 12,
      engagementRatePct: 46.15,
      avgSessionDurationSec: 95.46,
      screenPageViews: 50,
      pagesPerSession: 1.92,
      trafficQualityClass: 'CONFIRMED_POLONIA_AUDIENCE',
      diagnosis: 'Powracający użytkownicy (2,36 sesji/osobę, śr. 95,5 s).'
    },
    {
      country: 'China',
      activeUsers: 20,
      sessions: 20,
      engagedSessions: 2,
      engagementRatePct: 10.0,
      avgSessionDurationSec: 3.49,
      screenPageViews: 22,
      pagesPerSession: 1.10,
      trafficQualityClass: 'SUSPICIOUS_BOT_CRAWLER',
      diagnosis: '20 jednorazowych wizyt (m.in. Urumqi 9 sesji, śr. 3,5 s, 10% zaangażowania) — automatyczne skanery.'
    }
  ],

  // ── ŹRÓDŁA RUCHU I ATRYBUCJA (ETAP C2) ──
  sources30d: [
    { channel: 'Direct', sourceMedium: '(direct) / (none)', activeUsers: 765, sessions: 1331, engagedSessions: 610, engagementRatePct: 45.83, avgDurationSec: 663.9, views: 3657, note: 'Zawiera wejścia bezpośrednie, zakładki, brak UTM w dystrybucji WhatsApp oraz boty serwerowni Azure/GCP.' },
    { channel: 'Organic Social', sourceMedium: 'm.facebook.com / referral', activeUsers: 242, sessions: 246, engagedSessions: 68, engagementRatePct: 27.64, avgDurationSec: 16.39, views: 317, note: 'Zawiera zarówno mobilnych użytkowników FB, jak i prefetchery Meta (Prineville, Forest City, Luleå, Dublin).' },
    { channel: 'Organic Search', sourceMedium: 'google / organic', activeUsers: 131, sessions: 241, engagedSessions: 154, engagementRatePct: 63.90, avgDurationSec: 242.92, views: 534, note: 'Najwyższa jakość ruchu zewnętrznego (śr. ponad 4 minuty, 63,9% zaangażowania).' },
    { channel: 'Organic Social', sourceMedium: 'facebook.com / referral', activeUsers: 234, sessions: 236, engagedSessions: 162, engagementRatePct: 68.64, avgDurationSec: 26.88, views: 273, note: 'Desktopowe wejścia z Facebooka + węzły weryfikujące linki.' },
    { channel: 'AI Assistant', sourceMedium: 'chatgpt.com / ai-assistant', activeUsers: 14, sessions: 128, engagedSessions: 103, engagementRatePct: 80.47, avgDurationSec: 696.28, views: 596, note: 'Głównie sesje robocze zespołu z Ostrowca Świętokrzyskiego i Wrocławia otwierane z linków w ChatGPT.' },
    { channel: 'Organic Social', sourceMedium: 'lm.facebook.com / referral', activeUsers: 87, sessions: 120, engagedSessions: 77, engagementRatePct: 64.17, avgDurationSec: 186.63, views: 225, note: 'Autentyczni użytkownicy Facebook Messenger / Mobile (śr. 3 min 6 s).' },
    { channel: 'Unassigned', sourceMedium: 'chatgpt.com) / (not set)', activeUsers: 1, sessions: 73, engagedSessions: 62, engagementRatePct: 84.93, avgDurationSec: 386.40, views: 303, note: 'BŁĄD UTM: Zamykający nawias ")" z linku Markdown wklejonego w ChatGPT został doklejony do parametru utm_source=chatgpt.com).' },
    { channel: 'Organic Social', sourceMedium: 'l.facebook.com / referral', activeUsers: 18, sessions: 71, engagedSessions: 54, engagementRatePct: 76.06, avgDurationSec: 785.57, views: 230, note: 'Wysoko zaangażowani odbiorcy z link-shimu Facebooka (śr. 13 min).' },
    { channel: 'Organic Video', sourceMedium: 'youtube.com / referral', activeUsers: 20, sessions: 70, engagedSessions: 42, engagementRatePct: 60.0, avgDurationSec: 369.85, views: 147, note: 'Odbiorcy przechodzący z kanałów YouTube Christian Culture / SDS.' },
    { channel: 'Unassigned', sourceMedium: '(not set)', activeUsers: 25, sessions: 62, engagedSessions: 0, engagementRatePct: 0.0, avgDurationSec: 878.95, views: 265, note: 'Zdarzenia wysyłane po wygaśnięciu sesji (np. video_progress w tle bez session_start).' },
    { channel: 'Referral', sourceMedium: 'studiods.pl / referral', activeUsers: 2, sessions: 28, engagedSessions: 19, engagementRatePct: 67.86, avgDurationSec: 899.27, views: 127, note: 'Przejścia z partnerskiej strony Studio Dobrego Słowa.' },
    { channel: 'Organic Social', sourceMedium: 'christianculture7.wordpress.com / referral', activeUsers: 5, sessions: 19, engagedSessions: 14, engagementRatePct: 73.68, avgDurationSec: 415.39, views: 56, note: 'Przejścia z bloga WordPress Christian Culture.' },
    { channel: 'Referral', sourceMedium: 'polskieradio.pages.dev / referral', activeUsers: 1, sessions: 11, engagedSessions: 7, engagementRatePct: 63.64, avgDurationSec: 842.13, views: 44, note: 'WŁASNE ODESŁANIE (Self-Referral): Przejścia z domeny preview Cloudflare Pages na domenę produkcyjną.' },
    { channel: 'Unassigned', sourceMedium: 'chatgpt.com) / ', activeUsers: 1, sessions: 4, engagedSessions: 1, engagementRatePct: 25.0, avgDurationSec: 129.74, views: 5, note: 'BŁĄD UTM: jw. utm_source=chatgpt.com) z pustym medium.' },
    { channel: 'Referral', sourceMedium: 'polskieradio.cc / referral', activeUsers: 2, sessions: 2, engagedSessions: 1, engagementRatePct: 50.0, avgDurationSec: 26.13, views: 3, note: 'WŁASNE ODESŁANIE (Self-Referral): Wznowienie sesji po przekierowaniu lub utracie ciasteczka.' }
  ],

  // ── URZĄDZENIA I PRZEGLĄDARKI (30 DNI) ──
  devices30d: [
    { device: 'mobile', browser: 'Chrome', activeUsers: 804, sessions: 1200, engagedSessions: 557, engagementRatePct: 46.42 },
    { device: 'desktop', browser: 'Chrome', activeUsers: 461, sessions: 956, engagedSessions: 615, engagementRatePct: 64.33 },
    { device: 'mobile', browser: 'Safari', activeUsers: 85, sessions: 232, engagedSessions: 107, engagementRatePct: 46.12 },
    { device: 'desktop', browser: 'Edge', activeUsers: 45, sessions: 89, engagedSessions: 29, engagementRatePct: 32.58 },
    { device: 'mobile', browser: 'Android Webview', activeUsers: 27, sessions: 33, engagedSessions: 23, engagementRatePct: 69.70 },
    { device: 'mobile', browser: 'Samsung Internet', activeUsers: 23, sessions: 31, engagedSessions: 17, engagementRatePct: 54.84 },
    { device: 'desktop', browser: 'Firefox', activeUsers: 21, sessions: 23, engagedSessions: 13, engagementRatePct: 56.52 },
    { device: 'desktop', browser: '(not set)', activeUsers: 22, sessions: 22, engagedSessions: 2, engagementRatePct: 9.09 },
    { device: 'tablet', browser: 'Safari', activeUsers: 5, sessions: 14, engagedSessions: 4, engagementRatePct: 28.57 },
    { device: 'mobile', browser: 'Safari (in-app)', activeUsers: 12, sessions: 12, engagedSessions: 7, engagementRatePct: 58.33 }
  ],

  // ── NAJPOPULARNIEJSZE PODSTRONY I KANAŁY (30 DNI) ──
  topPages30d: [
    { pagePath: '/', type: 'hub', views: 1165, activeUsers: 435, sessions: 809, engagedSessions: 487, engagementRatePct: 60.20, avgSessionDurationSec: 206.91 },
    { pagePath: '/wyszukiwarka', type: 'search', views: 467, activeUsers: 66, sessions: 172, engagedSessions: 115, engagementRatePct: 66.86, avgSessionDurationSec: 372.4 },
    { pagePath: '/master-live', type: 'tv_live', views: 342, activeUsers: 110, sessions: 212, engagedSessions: 202, engagementRatePct: 95.28, avgSessionDurationSec: 228.31 },
    { pagePath: '/player', type: 'radio', views: 261, activeUsers: 108, sessions: 234, engagedSessions: 139, engagementRatePct: 59.40, avgSessionDurationSec: 190.68 },
    { pagePath: '/biblia-spiewana-live', type: 'tv_live', views: 270, activeUsers: 68, sessions: 131, engagedSessions: 121, engagementRatePct: 92.37, avgSessionDurationSec: 802.1 },
    { pagePath: '/mojabiblia', type: 'bible', views: 230, activeUsers: 76, sessions: 88, engagedSessions: 77, engagementRatePct: 87.50, avgSessionDurationSec: 70.22 },
    { pagePath: '/spiewajmy-panu-live', type: 'tv_live', views: 197, activeUsers: 28, sessions: 80, engagedSessions: 79, engagementRatePct: 98.75, avgSessionDurationSec: 2608.96 },
    { pagePath: '/tvw-women-live', type: 'tv_live', views: 223, activeUsers: 18, sessions: 31, engagedSessions: 27, engagementRatePct: 87.10, avgSessionDurationSec: 1398.1 },
    { pagePath: '/news', type: 'ccn', views: 168, activeUsers: 62, sessions: 105, engagedSessions: 63, engagementRatePct: 60.00, avgSessionDurationSec: 134.19 },
    { pagePath: '/zapolske-live', type: 'tv_live', views: 195, activeUsers: 45, sessions: 104, engagedSessions: 100, engagementRatePct: 96.15, avgSessionDurationSec: 156.4 },
    { pagePath: '/biblia-audio/', type: 'bible', views: 134, activeUsers: 43, sessions: 52, engagedSessions: 46, engagementRatePct: 88.46, avgSessionDurationSec: 229.27 },
    { pagePath: '/studium-live', type: 'tv_live', views: 124, activeUsers: 26, sessions: 47, engagedSessions: 43, engagementRatePct: 91.49, avgSessionDurationSec: 846.63 },
    { pagePath: '/topTEN/', type: 'music', views: 116, activeUsers: 55, sessions: 88, engagedSessions: 37, engagementRatePct: 42.05, avgSessionDurationSec: 102.82 },
    { pagePath: '/akademia', type: 'academy', views: 154, activeUsers: 82, sessions: 132, engagedSessions: 66, engagementRatePct: 50.00, avgSessionDurationSec: 73.1 },
    { pagePath: '/Wioletta', type: 'author', views: 87, activeUsers: 22, sessions: 42, engagedSessions: 21, engagementRatePct: 50.00, avgSessionDurationSec: 451.10 },
    { pagePath: '/wspieraj', type: 'support', views: 83, activeUsers: 43, sessions: 70, engagedSessions: 32, engagementRatePct: 45.71, avgSessionDurationSec: 110.48 },
    { pagePath: '/apokalipsa-ksiega-nadziei-live', type: 'tv_live', views: 73, activeUsers: 24, sessions: 51, engagedSessions: 47, engagementRatePct: 92.16, avgSessionDurationSec: 456.11 },
    { pagePath: '/milion', type: 'mission', views: 64, activeUsers: 35, sessions: 52, engagedSessions: 21, engagementRatePct: 40.38, avgSessionDurationSec: 59.77 },
    { pagePath: '/SpiritualSounds/tv/', type: 'tv_live', views: 63, activeUsers: 35, sessions: 39, engagedSessions: 29, engagementRatePct: 74.36, avgSessionDurationSec: 2662.21 },
    { pagePath: '/pomogebomoge', type: 'support', views: 35, activeUsers: 29, sessions: 31, engagedSessions: 9, engagementRatePct: 29.03, avgSessionDurationSec: 190.81 }
  ],

  // ── STATUS GOOGLE SEARCH CONSOLE & SEO (ETAP D) ──
  searchConsole: {
    apiStatus: 'SERVICE_DISABLED_AND_REQUIRES_GRANT',
    gcpProjectChecked: '413985877183 (lumina-cc), 519207260358 (cc-mission-control), 422075095518 (cuda-398c0)',
    httpStatus: 403,
    exactError: 'Google Search Console API has not been used in project 413985877183 before or it is disabled. Enable it by visiting https://console.developers.google.com/apis/api/searchconsole.googleapis.com/overview?project=413985877183',
    noFakeDataNotice: 'Zgodnie z dyrektywą Etapu E4 ("Nie symulować danych, jeżeli API lub uprawnienia są niedostępne") kafelki GSC pokazują rzeczywisty status integracji API oraz zweryfikowane dane GA4 Organic Search (241 sesji Google Organic + 2 sesje Bing Organic = 243 sesje, 63,9% zaangażowania).',
    ga4OrganicLandingPages30d: [
      { landingPage: '/', sessions: 162, activeUsers: 98, engagedSessions: 126, avgDurationSec: 138.4, targetSection: 'Strona Główna & Radio' },
      { landingPage: '/player', sessions: 22, activeUsers: 14, engagedSessions: 16, avgDurationSec: 432.1, targetSection: 'Odtwarzacz Radio CC' },
      { landingPage: '/biblia-do-pobrania', sessions: 13, activeUsers: 12, engagedSessions: 10, avgDurationSec: 157.7, targetSection: 'Biblia do pobrania za darmo' },
      { landingPage: '/news/kryzys-infrastrukturalny-blackout-72-godziny-rodzina-roztropnosc', sessions: 8, activeUsers: 8, engagedSessions: 7, avgDurationSec: 181.3, targetSection: 'CCN News / Poradnik Kryzysowy' },
      { landingPage: '/milion', sessions: 8, activeUsers: 1, engagedSessions: 2, avgDurationSec: 197.9, targetSection: 'Misja Milion' },
      { landingPage: '/topTEN/', sessions: 8, activeUsers: 3, engagedSessions: 8, avgDurationSec: 374.1, targetSection: 'Lista Przebojów TopTEN' },
      { landingPage: '/RozwiążProblem', sessions: 5, activeUsers: 2, engagedSessions: 5, avgDurationSec: 16.3, targetSection: 'Kursy Rozwiąż Problem' },
      { landingPage: '/codzienne-uwielbienie-live?muted=1&mute=1&in_mcr=1', sessions: 6, activeUsers: 1, engagedSessions: 6, avgDurationSec: 31.2, targetSection: 'Kanały TV LIVE (Uwaga: link z parametrem in_mcr=1 w indeksie!)' },
      { landingPage: '/mojabiblia?book=MAT&ch=1&mode=interlinear&chapter=1', sessions: 2, activeUsers: 1, engagedSessions: 1, avgDurationSec: 119.8, targetSection: 'Biblia Interlinearna Online (/mojabiblia)' },
      { landingPage: '/akademia/apokalipsa/lekcja-22', sessions: 2, activeUsers: 2, engagedSessions: 1, avgDurationSec: 87.1, targetSection: 'Akademia Biblijna' }
    ],
    priorityKeywordsAnalysis: [
      {
        query: 'biblia do pobrania za darmo',
        targetUrl: 'https://polskieradio.cc/biblia-do-pobrania',
        ga4OrganicSessions30d: 13,
        ga4EngagementRatePct: 76.92,
        avgDurationSec: 157.7,
        technicalDiagnosis: 'Podstrona /biblia-do-pobrania generuje już stały, wartościowy ruch organiczny (13 sesji, śr. 2 min 38 s, 15 pobrań file_download). Wymaga dopisania bezpośredniego CTA do /mojabiblia oraz /biblia-audio/ nad linią zgięcia.'
      },
      {
        query: 'biblia interlinearna / biblia interlinearna online',
        targetUrl: 'https://polskieradio.cc/mojabiblia',
        ga4OrganicSessions30d: 2,
        ga4TotalViews30d: 230,
        ga4EngagementRatePct: 87.50,
        avgDurationSec: 70.2,
        technicalDiagnosis: 'Mimo bardzo wysokiego zaangażowania (87,5% z 88 sesji ogółem), z Google Organic przyszły tylko 2 sesje (i to na niekanoniczny URL z parametrami ?book=MAT&ch=1&mode=interlinear&chapter=1). Przyczyna: treść rozdziałów w /mojabiblia ładowana jest po stronie klienta (CSR), a kanoniczne podstrony ksiąg nie mają statycznych kart SSR dla Googlebota.'
      }
    ],
    whyGscClicksDifferFromGa4Organic: [
      '1. Różna definicja zdarzenia: GSC rejestruje kliknięcie w wynikach wyszukiwania Google (przed załadowaniem strony), natomiast GA4 rejestruje sesję dopiero po pobraniu dokumentu HTML i wykonaniu skryptu gtag.js.',
      '2. Odmowa zgody / AdBlock / Brave / Firefox ETP: Użytkownicy blokujący skrypt googletagmanager.com lub odrzucający zgodę w banerze (np. na /wyszukiwarka, /40DM, /the-journal, /uslugi) są widoczni w GSC, ale nie w GA4.',
      '3. Okno atrybucji GA4: Wielokrotne kliknięcia tego samego użytkownika w Google w ciągu 30 minut tworzą w GSC osobne kliknięcia, ale w GA4 jedną sesję.',
      '4. Rozszczepienie usług GA4 (G-Y4EFTVBPE3 vs G-M24C85RG49): Część stron (np. /lumina, /mess, /tablica) raportowała wyłącznie do usługi 550097091 zamiast do głównej 548623550.'
    ]
  },

  // ── SEKCJA DIAGNOSTYCZNA: 6 WYMAGANYCH KATEGORII (ETAP E3) ──
  diagnostics: {
    confirmedProblems: [
      {
        id: 'CP-01',
        severity: 'CRITICAL',
        title: 'Inflacja zdarzeń video_progress i video_start na kanałach TV LIVE 24/7',
        evidence: 'Na /spiewajmy-panu-live zaledwie 2 użytkowników wygenerowało 2 287 zdarzeń video_progress (1 143 zdarzenia/osobę!), a 7 użytkowników wygenerowało 606 zdarzeń video_start. Na /tvw-women-live 3 użytkowników wygenerowało 461 zdarzeń video_progress.',
        rootCause: 'Automatyczny pomiar Enhanced Measurement dla osadzonych iframe YouTube oraz pętle wznawiania strumienia wielokrotnie wysyłają video_start i video_progress w trakcie wielogodzinnej emisji 24/7.'
      },
      {
        id: 'CP-02',
        severity: 'HIGH',
        title: 'Fałszywe zdarzenia video_complete na kanałach transmisji całodobowej LIVE',
        evidence: 'GA4 zarejestrował 15 zdarzeń video_complete od 2 użytkowników: 6 na /studium-live, 5 na /spiewajmy-panu-live i 4 na /apokalipsa-live.',
        rootCause: 'Gdy na kanale LIVE kończy się pojedynczy zapętlony plik wideo lub przełącza się playlista YouTube, odtwarzacz wysyłał video_complete mimo trwania transmisji całodobowej.'
      },
      {
        id: 'CP-03',
        severity: 'HIGH',
        title: 'Zniekształcone źródło ruchu "chatgpt.com) / (not set)" w kanale Unassigned (79 sesji)',
        evidence: 'W usłudze 548623550 widnieją 73 sesje (303 odsłony) dla "chatgpt.com) / (not set)", 4 sesje dla "chatgpt.com) / " oraz 2 sesje dla "chatgpt.com) / (none)".',
        rootCause: 'Podczas kopiowania lub klikania linku sformatowanego w Markdown w nawiasach — np. (https://polskieradio.cc/...?utm_source=chatgpt.com) — zamykający nawias ")" został włączony do wartości utm_source, przez co GA4 nie dopasował reguły kanału AI Assistant i wrzucił ruch do Unassigned.'
      },
      {
        id: 'CP-04',
        severity: 'HIGH',
        title: 'Rozszczepienie i duplikacja tagów GA4 (G-Y4EFTVBPE3 vs G-M24C85RG49 vs G-9M92G6S27M)',
        evidence: '17 stron społecznościowych LUMINA (lumina-tablica.html, lumina-profile.html itd.) miało tylko tag G-M24C85RG49 bez G-Y4EFTVBPE3 i bez cc-analytics.js. Z kolei 5 plików (lumina.html, vod.html, werset-dnia.html, uslugi.html) ładowało dwa tagi jednocześnie.',
        rootCause: 'Historyczne wdrożenie osobnej usługi 550097091 dla LUMINA oraz usługi G-9M92G6S27M dla /uslugi bez pełnej unifikacji.'
      },
      {
        id: 'CP-05',
        severity: 'MEDIUM',
        title: 'Zanieczyszczenie głównego strumienia 548623550 przez localhost i domeny testowe *.pages.dev',
        evidence: 'W ostatnich 30 dniach strumień 15383676066 przyjął 41 sesji (254 odsłony, 865 zdarzeń) z hosta "localhost", 8 sesji (118 odsłon) z "ml.test", 10 sesji z "127.0.0.1", 6 sesji z "tvw.test" oraz 20 sesji z subdomen "*.polskieradio.pages.dev".',
        rootCause: 'Testy lokalne Playwright i podglądy Cloudflare Pages wykonywały kod GA4 bez aktywnego filtra wykluczającego ruch techniczny/deweloperski w GA4 Admin.'
      },
      {
        id: 'CP-06',
        severity: 'MEDIUM',
        title: 'Własne odesłania (Self-Referrals): polskieradio.pages.dev / referral (11 sesji) i polskieradio.cc / referral (2 sesje)',
        evidence: 'Raport pozyskiwania ruchu wykazuje 11 sesji z polskieradio.pages.dev / referral oraz 2 sesje z polskieradio.cc / referral.',
        rootCause: 'Domeny polskieradio.cc i polskieradio.pages.dev nie zostały wpisane na listę "Konfiguracja niechcianych odesłań" (Unwanted Referrals) w ustawieniach strumienia 15383676066.'
      }
    ],
    suspicionsToVerify: [
      {
        id: 'SV-01',
        title: 'Skok ruchu z serwerowni w USA, Irlandii (Dublin) i Szwecji (Luleå) w dniach 16–20 XI 2026',
        details: 'Ruch z USA (725 użytk., 726 sesji, śr. 15,5 s), Dublina (75 użytk., 76 sesji, śr. 19,5 s) i Luleå (75 użytk., 75 sesji, śr. 13,4 s) pochodzi z lokalizacji centrów danych Meta (Prineville, Forest City, Fort Worth, Luleå, Dublin), Microsoft Azure (Des Moines, Boydton, Flint Hill) oraz Google Cloud (Council Bluffs). W Des Moines, Boydton i Flint Hill identyczna paczka 11 podstron (/, /akademia, /audioteka, /biblia-audio/, /master-live, /milion, /mojabiblia, /player, /pomogebomoge, /topTEN/, /wspieraj, /wyszukiwarka) była odpytywana po dokładnie 6 lub 2 razy z czasem 0–5 s (automatyczny skaner/audytor).'
      },
      {
        id: 'SV-02',
        title: '62 sesje "(not set)" w kanale Unassigned ze średnim czasem 878,9 s',
        details: 'Sesje te mają 0 zaangażowanych sesji, ale 265 odsłon i wysoki czas trwania — wskazuje to na karty z otwartą transmisją LIVE w tle, które po wygaśnięciu 30-minutowego okna sesji wysłały kolejne zdarzenie bez nowego session_start.'
      }
    ],
    missingData: [
      {
        id: 'MD-01',
        title: 'Brak dostępu API (HTTP 403) do 5 z 8 usług GA4',
        details: 'Usługi 518223715 (christian-culture), 529214226 (gen-lang-client-0094354839), 522101206 (christian-culture-global), 534305954 (aplikacja-christian-culture) oraz 526414935 (Radio CC Lite) zwracają 403 PERMISSION_DENIED dla konta serwisowego lumina-cc. Wymagane dodanie adresu firebase-adminsdk-fbsvc@lumina-cc.iam.gserviceaccount.com z rolą Przeglądający (Viewer) w panelu GA4 każdej z tych 5 usług.'
      },
      {
        id: 'MD-02',
        title: 'Brak danych w usłudze 526422549 (Biblia Audio CC — 0 wierszy w 30 dni)',
        details: 'Konto serwisowe ma dostęp 200 OK do usługi 526422549, lecz usługa ma 0 zdarzeń, ponieważ podstrona /biblia-audio/ używa głównego tagu G-Y4EFTVBPE3 i raportuje do usługi 548623550.'
      },
      {
        id: 'MD-03',
        title: '248 plików HTML w repozytorium bez tagu GA4',
        details: 'Obejmuje celowo wyłączone strony dziecięce (/lumi-kids/ — ochrona prywatności dzieci), strony z osobnym modułem zgody (/40DM/, /the-journal/), narzędzia sztabowe (/ccMC/, /admin/) oraz 62 statyczne strony tematycznych przewodników pomocowych (/bezdomnosc, /cukrzyca, /en/care-homes itp.).'
      },
      {
        id: 'MD-04',
        title: 'Zero zarejestrowanych zdarzeń kluczowych (Key Events = 0) w GA4',
        details: 'Do 21.11.2026 w usłudze 548623550 nie oznaczono żadnego zdarzenia jako Key Event (Konwersji) oraz nie istniały zdarzenia progowe radio_listen_300s, tv_watch_300s, lesson_complete i bible_audio_complete.'
      }
    ],
    integrationErrors: [
      {
        id: 'IE-01',
        title: 'Google Search Console API wyłączone w GCP (HTTP 403 SERVICE_DISABLED)',
        details: 'Interfejs searchconsole.googleapis.com nie został jeszcze aktywowany w projekcie GCP 413985877183 (lumina-cc), a konto serwisowe nie jest dodane jako użytkownik w Search Console dla sc-domain:polskieradio.cc.'
      },
      {
        id: 'IE-02',
        title: 'Google Analytics Admin API wyłączone w GCP (HTTP 403 SERVICE_DISABLED)',
        details: 'Interfejs analyticsadmin.googleapis.com nie jest włączony w projekcie GCP 413985877183, co blokuje automatyczny odczyt listy strumieni, filtrów Data Filters i ustawień retencji przez API (odczytano je przez Data API i inspekcję kodu).'
      },
      {
        id: 'IE-03',
        title: 'Rozbieżność wersji URL z .html i bez .html w raportach stron GA4',
        details: 'W raportach GA4 widnieją osobno /zapolske-live (165 odsłon) i /zapolske-live.html (30 odsłon), /biblia-spiewana-live (242) i /biblia-spiewana-live.html (28), /wyszukiwarka (424) i /wyszukiwarka/ (43).'
      },
      {
        id: 'IE-04',
        title: 'Zaindeksowany w Google link techniczny z parametrem ?in_mcr=1',
        details: 'W raporcie Google Organic widnieją wejścia na "/codzienne-uwielbienie-live?muted=1&mute=1&in_mcr=1" — parametr ?in_mcr=1 oznacza ruch reżyserski (traffic_type=internal), więc zwykły użytkownik wchodzący z takiego linku w Google jest błędnie oznaczany jako ruch wewnętrzny.'
      }
    ],
    sourceDiscrepancies: [
      {
        id: 'SD-01',
        title: 'Zdarzenia odtworzenia (radio_play / audio_play / video_start) vs Unikalni słuchacze i widzowie',
        details: 'W ostatnich 30 dniach zarejestrowano 1 102 zdarzenia audio_play (od 68 użytkowników — śr. 16,2/osobę), 536 zdarzeń radio_play (od 123 użytkowników — śr. 4,36/osobę) oraz 1 162 zdarzenia video_start (od 62 użytkowników — śr. 18,7/osobę). Liczba zdarzeń NIGDY nie może być prezentowana jako liczba ludzi.'
      },
      {
        id: 'SD-02',
        title: 'Suma użytkowników w podziale na dni / tygodnie / urządzenia vs Total Active Users',
        details: 'Suma użytkowników z Tygodnia 1 (307) i Tygodnia 2 (748) wynosi 1 055, ale rzeczywista liczba unikalnych użytkowników z tych 14 dni jest niższa z uwagi na użytkowników powracających. Podobnie suma użytkowników po urządzeniach (mobile 956 + desktop 558 + tablet 11 = 1 525) przekracza deduplikowane 1 521.'
      },
      {
        id: 'SD-03',
        title: 'Różnice między usługą główną 548623550 a usługą LUMINA 550097091',
        details: 'Podstrona /werset-dnia ma w usłudze 548623550 dokładnie 37 odsłon (36 użytkowników), a w usłudze 550097091 również 37 odsłon (36 użytkowników), ponieważ wysyła dane do obu usług równocześnie. Z kolei /lumina miała w 548623550 tylko 43 odsłony, a w 550097091 aż 210 odsłon. ZAKAZ sumowania tych dwóch usług.'
      }
    ]
  }
};

/**
 * Pomocnicza funkcja filtrująca dane dashboardu na podstawie parametrów zapytania (Etap E2).
 */
export function buildFilteredAnalyticsResponse(searchParams) {
  const periodKey = searchParams.get('period') || 'last30d';
  const contentType = (searchParams.get('contentType') || 'all').toLowerCase();
  const channelFilter = (searchParams.get('mediaChannel') || 'all').toLowerCase();
  const countryFilter = (searchParams.get('country') || 'all').toLowerCase();
  const deviceFilter = (searchParams.get('device') || 'all').toLowerCase();
  const sourceFilter = (searchParams.get('source') || 'all').toLowerCase();
  const startDateCustom = searchParams.get('startDate') || '';
  const endDateCustom = searchParams.get('endDate') || '';

  let selectedPeriod = ANALYTICS_MC_SNAPSHOT.periods[periodKey] || ANALYTICS_MC_SNAPSHOT.periods.last30d;

  // Obsługa własnego zakresu dat (Custom Date Range z trendu dziennego 7–20 XI 2026)
  if (periodKey === 'custom' && startDateCustom && endDateCustom) {
    const normalizeIsoDate = (d) => {
      const clean = String(d || '').replace(/[^0-9]/g, '');
      if (clean.length === 8) return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
      return String(d || '');
    };
    const normStart = normalizeIsoDate(startDateCustom);
    const normEnd = normalizeIsoDate(endDateCustom);
    const matchingDays = ANALYTICS_MC_SNAPSHOT.dailyTrend14d.filter(
      (d) => d.date >= normStart && d.date <= normEnd
    );
    const sumSessions = matchingDays.reduce((acc, d) => acc + d.sessions, 0);
    const sumViews = matchingDays.reduce((acc, d) => acc + d.screenPageViews, 0);
    const sumEngaged = matchingDays.reduce((acc, d) => acc + d.engagedSessions, 0);
    const maxDailyUsers = matchingDays.reduce((acc, d) => Math.max(acc, d.activeUsers), 0);
    const engRate = sumSessions > 0 ? Number(((sumEngaged / sumSessions) * 100).toFixed(2)) : 0;

    selectedPeriod = {
      id: 'custom',
      label: `Własny zakres dat (${normStart} – ${normEnd})`,
      startDate: normStart,
      endDate: normEnd,
      isPartial: normEnd >= '2026-11-21',
      partialWarning: normEnd >= '2026-11-21'
        ? 'UWAGA: Zakres obejmuje dzisiejszy dzień (dane niepełne).'
        : 'Uwaga metodologiczna: Dla własnego zakresu dat unikalni użytkownicy podani są jako maksymalny dzienny pik (bez sumowania między dniami, aby nie zawyżać liczby osób).',
      propertyId: '548623550',
      kpis: {
        ...ANALYTICS_MC_SNAPSHOT.periods.last30d.kpis,
        activeUsers: maxDailyUsers,
        sessions: sumSessions,
        screenPageViews: sumViews,
        engagedSessions: sumEngaged,
        engagementRatePct: engRate
      }
    };
  }

  let filteredPages = ANALYTICS_MC_SNAPSHOT.topPages30d.slice();
  if (contentType !== 'all') {
    filteredPages = filteredPages.filter((p) => p.type === contentType);
  }
  if (channelFilter !== 'all') {
    filteredPages = filteredPages.filter((p) => p.pagePath.toLowerCase().includes(channelFilter));
  }

  let filteredCountries = ANALYTICS_MC_SNAPSHOT.countries30d.slice();
  if (countryFilter !== 'all') {
    filteredCountries = filteredCountries.filter((c) => c.country.toLowerCase() === countryFilter);
  }

  let filteredDevices = ANALYTICS_MC_SNAPSHOT.devices30d.slice();
  if (deviceFilter !== 'all') {
    filteredDevices = filteredDevices.filter((d) => d.device.toLowerCase() === deviceFilter);
  }

  let filteredSources = ANALYTICS_MC_SNAPSHOT.sources30d.slice();
  if (sourceFilter !== 'all') {
    filteredSources = filteredSources.filter(
      (s) => s.channel.toLowerCase().includes(sourceFilter) || s.sourceMedium.toLowerCase().includes(sourceFilter)
    );
  }

  return {
    success: true,
    schemaVersion: ANALYTICS_MC_SNAPSHOT.schemaVersion,
    auditTimestamp: ANALYTICS_MC_SNAPSHOT.auditTimestamp,
    lastDataSync: ANALYTICS_MC_SNAPSHOT.lastDataSync,
    mode: ANALYTICS_MC_SNAPSHOT.mode,
    guardrails: ANALYTICS_MC_SNAPSHOT.guardrails,
    appliedFilters: {
      period: periodKey,
      contentType,
      mediaChannel: channelFilter,
      country: countryFilter,
      device: deviceFilter,
      source: sourceFilter,
      startDate: selectedPeriod.startDate,
      endDate: selectedPeriod.endDate
    },
    selectedPeriod,
    weekComparison: {
      week1: ANALYTICS_MC_SNAPSHOT.periods.week1_nov7_13,
      week2: ANALYTICS_MC_SNAPSHOT.periods.week2_nov14_20
    },
    dailyTrend14d: ANALYTICS_MC_SNAPSHOT.dailyTrend14d,
    properties: ANALYTICS_MC_SNAPSHOT.properties,
    topPages: filteredPages,
    countries: filteredCountries,
    devices: filteredDevices,
    sources: filteredSources,
    searchConsole: ANALYTICS_MC_SNAPSHOT.searchConsole,
    diagnostics: ANALYTICS_MC_SNAPSHOT.diagnostics
  };
}

/**
 * Handler serwerowy Cloudflare Worker dla /api/analytics-mc/*
 * Wymusza autoryzację Google OAuth2 / Firebase ID Token po stronie serwera.
 */
export async function handleAnalyticsMissionControlApi(request, env, deps = {}) {
  const corsHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store, no-cache, must-revalidate',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'X-Content-Type-Options': 'nosniff'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': 'https://polskieradio.cc',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: corsHeaders
    });
  }

  const authHeader = request.headers.get('Authorization') || '';
  let idToken = '';
  if (authHeader.startsWith('Bearer ')) {
    idToken = authHeader.slice(7).trim();
  }
  if (!idToken) {
    return new Response(
      JSON.stringify({
        authenticated: false,
        error: 'Brak autoryzacji (401). Dostęp do CC Analytics Mission Control wymaga zalogowania kontem Google Administratora.'
      }),
      { status: 401, headers: corsHeaders }
    );
  }

  let tokenData = null;
  try {
    if (typeof deps.verifyToken === 'function') {
      tokenData = await deps.verifyToken(idToken);
    } else {
      const googleResp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (googleResp.ok) {
        tokenData = await googleResp.json();
      }
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ authenticated: false, error: 'Błąd weryfikacji tokenu tożsamości.' }),
      { status: 401, headers: corsHeaders }
    );
  }

  if (!tokenData || !tokenData.email) {
    return new Response(
      JSON.stringify({ authenticated: false, error: 'Nieprawidłowy lub wygasły token sesji (401).' }),
      { status: 401, headers: corsHeaders }
    );
  }

  const userEmail = String(tokenData.email || '').toLowerCase().trim();
  const isEmailVerified = tokenData.email_verified === true || tokenData.email_verified === 'true';
  const allowedAdmins = new Set(AUTHORIZED_ANALYTICS_ADMINS);
  if (env && typeof env.ANALYTICS_ADMIN_EMAILS === 'string') {
    env.ANALYTICS_ADMIN_EMAILS.split(',').forEach((e) => {
      const clean = e.trim().toLowerCase();
      if (clean) allowedAdmins.add(clean);
    });
  }

  if (!isEmailVerified || !allowedAdmins.has(userEmail)) {
    return new Response(
      JSON.stringify({
        authenticated: true,
        authorized: false,
        userEmail,
        error: 'Brak uprawnień (403). Twoje konto nie znajduje się na liście autoryzowanych administratorów CC Analytics Mission Control.'
      }),
      { status: 403, headers: corsHeaders }
    );
  }

  const url = new URL(request.url);
  const payload = buildFilteredAnalyticsResponse(url.searchParams);
  payload.authorizedUser = {
    email: userEmail,
    role: 'L0_ANALYTICS_COMMANDER'
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: corsHeaders
  });
}
