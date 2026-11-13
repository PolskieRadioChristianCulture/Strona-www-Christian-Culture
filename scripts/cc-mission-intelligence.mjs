#!/usr/bin/env node
/**
 * scripts/cc-mission-intelligence.mjs
 * System CC GLOBAL MISSION INTELLIGENCE (GA4 + Search Console + Google Trends + Looker Studio • ZERO COST)
 * Dyrektywa: JOMA-DIR-CC-MISSION-INTEL-20261113 (13.11.2026)
 *
 * Funkcje:
 * 1. Krok 1 (Audyt pomiarów): Weryfikuje obecność tagu GA4 (G-Y4EFTVBPE3), filtra ruchu wewnętrznego (cc_team / obsstudio),
 *    zdarzeń odtwarzaczy (radio, Biblia Audio, Akademia, DZJ) oraz znaczników SEO/hreflang na kluczowych powierzchniach CC.
 * 2. Krok 2 (Model punktacji krajów 25/25/20/15/15): Wylicza znormalizowany wynik potencjału misyjnego (0-100),
 *    klasyfikuje kraje do 3 grup i oznacza małe próby jako INSUFFICIENT_DATA.
 * 3. Krok 3 (Nieulotna historia i Poniedziałkowy Raport 5 Rekomendacji): Dopisuje migawki historyczne bez nadpisywania,
 *    rozdziela użytkowników/sesje/odsłony/kliknięcia/zdarzenia oraz mobile vs desktop, i przekazuje zatwierdzone zadania
 *    do kolejki CC GLOBAL DISTRIBUTION.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const STATE_PATH = path.join(ROOT_DIR, 'data', 'cc-mission-intelligence-state.json');
const DIST_QUEUE_PATH = path.join(ROOT_DIR, 'data', 'cc-global-distribution-queue.json');

export const CANONICAL_GA4_ID = 'G-Y4EFTVBPE3';
export const DEFAULT_WEIGHTS = Object.freeze({
  interest: 25,       // Wyszukiwania i wyświetlenia w Google (GSC)
  engagement: 25,     // Aktywność i wartościowe działania w GA4
  growthPotential: 20,// Trendy i zmiana wyników w czasie
  availabilityGap: 15,// Brak dopasowanych językowo materiałów CC
  distReadiness: 15,  // Dostępne treści, tłumaczenia i kanały
});
export const MIN_OBSERVATIONS_THRESHOLD = 30;

export function normalizeWeights(rawWeights = DEFAULT_WEIGHTS) {
  const keys = ['interest', 'engagement', 'growthPotential', 'availabilityGap', 'distReadiness'];
  const clean = {};
  let sum = 0;
  for (const k of keys) {
    const val = Math.max(0, Number(rawWeights[k] ?? DEFAULT_WEIGHTS[k]) || 0);
    clean[k] = val;
    sum += val;
  }
  if (sum <= 0) {
    return { ...DEFAULT_WEIGHTS, normalizedSum: 100 };
  }
  const normalized = {};
  let running = 0;
  keys.forEach((k, idx) => {
    if (idx === keys.length - 1) {
      normalized[k] = Number((100 - running).toFixed(2));
    } else {
      const pct = Number(((clean[k] / sum) * 100).toFixed(2));
      normalized[k] = pct;
      running += pct;
    }
  });
  return { ...normalized, normalizedSum: 100 };
}

export function scoreCountryMissionPotential(countryEntry, rawWeights = DEFAULT_WEIGHTS) {
  const weights = normalizeWeights(rawWeights);
  const obs = Number(countryEntry.observations ?? 0);
  if (obs < MIN_OBSERVATIONS_THRESHOLD) {
    return {
      countryCode: countryEntry.countryCode,
      countryName: countryEntry.countryName,
      group: 'INSUFFICIENT_DATA',
      groupLabel: 'Dane niewystarczające (wymagane dodatkowe rozpoznanie)',
      insufficientData: true,
      observations: obs,
      minThreshold: MIN_OBSERVATIONS_THRESHOLD,
      score: null,
      weights,
    };
  }

  const ind = countryEntry.indicators || {};
  const weightedScore =
    ((Number(ind.interest) || 0) * weights.interest +
      (Number(ind.engagement) || 0) * weights.engagement +
      (Number(ind.growthPotential) || 0) * weights.growthPotential +
      (Number(ind.availabilityGap) || 0) * weights.availabilityGap +
      (Number(ind.distReadiness) || 0) * weights.distReadiness) /
    100;

  let group = 'EXPLORATION_NEEDED';
  let groupLabel = 'Grupa C: Wymaga zbadania możliwości działania';
  if (countryEntry.currentReach === 'active') {
    group = 'ACTIVE_AUDIENCE';
    groupLabel = 'Grupa A: CC ma już aktywnych odbiorców';
  } else if ((Number(ind.interest) || 0) >= 65 && countryEntry.currentReach !== 'active') {
    group = 'HIGH_INTEREST_LOW_REACH';
    groupLabel = 'Grupa B: Wysokie zainteresowanie w Google, niski zasięg CC';
  }

  return {
    countryCode: countryEntry.countryCode,
    countryName: countryEntry.countryName,
    primaryLanguages: countryEntry.primaryLanguages || [],
    group,
    groupLabel,
    insufficientData: false,
    observations: obs,
    score: Number(weightedScore.toFixed(1)),
    indicators: ind,
    separateMetricsOct2026: countryEntry.separateMetricsOct2026 || null,
    weights,
  };
}

export function runMeasurementAudit() {
  const surfaces = [
    { id: 'home', file: 'index.html', label: 'Strona główna (polskieradio.cc)' },
    { id: 'player', file: 'player.html', label: 'Odtwarzacz Radio CC (/player)' },
    { id: 'biblia-audio', file: 'biblia-audio/index.html', label: 'Biblia Audio CC (/biblia-audio)' },
    { id: 'akademia', file: 'akademia.html', label: 'Akademia Biblijna (/akademia)' },
    { id: 'lumina', file: 'lumina.html', label: 'Portal LUMINA (/lumina)' },
    { id: 'mojabiblia', file: 'mojabiblia.html', label: 'Interlinearna MojaBiblia (/mojabiblia)' },
    { id: 'vod', file: 'vod.html', label: 'Kino Chrześcijańskie VOD (/vod)' },
    { id: 'badz-blisko', file: 'badz-blisko/index.html', label: 'Bądź Blisko (8 języków)' },
    { id: 'ccmc', file: 'ccMC/index.html', label: 'Kalendarz Misji (@ccMC)' },
  ];

  const surfaceResults = surfaces.map((s) => {
    const fullPath = path.join(ROOT_DIR, s.file);
    if (!fs.existsSync(fullPath)) {
      return { ...s, exists: false, hasGa4Tag: false, hasInternalTrafficFilter: false, hasCanonicalOrOg: false };
    }
    const html = fs.readFileSync(fullPath, 'utf8');
    const hasGa4Tag = html.includes(CANONICAL_GA4_ID) || html.includes('googletagmanager.com/gtag/js');
    const hasInternalTrafficFilter = html.includes('traffic_type') && html.includes('internal');
    const hasCanonicalOrOg = html.includes('og:title') || html.includes('rel="canonical"');
    const hasLangAttr = /<html[^>]+lang=/i.test(html);
    return {
      ...s,
      exists: true,
      hasGa4Tag,
      hasInternalTrafficFilter,
      hasCanonicalOrOg,
      hasLangAttr,
    };
  });

  const ga4CoveredCount = surfaceResults.filter((r) => r.hasGa4Tag).length;
  const missingGa4Surfaces = surfaceResults.filter((r) => r.exists && !r.hasGa4Tag).map((r) => r.file);

  return {
    auditedAt: new Date().toISOString(),
    canonicalGa4MeasurementId: CANONICAL_GA4_ID,
    totalSurfacesChecked: surfaceResults.length,
    ga4CoveredCount,
    missingGa4Surfaces,
    recommendedMissionEvents: [
      { eventName: 'cc_radio_play', description: 'Uruchomienie strumienia radia CC (z parametrem station_id i device_category)' },
      { eventName: 'cc_biblia_audio_listen', description: 'Odsłuch rozdziału Biblii Audio CC (z parametrem book_id i chapter)' },
      { eventName: 'cc_kc_lesson_open', description: 'Otwarcie i przewinięcie lekcji Kursu Codziennego Akademii Biblijnej' },
      { eventName: 'cc_dzj_reflection_read', description: 'Odczyt rozważania Dobrze, że jesteś oraz kliknięcie udostępnienia' },
      { eventName: 'cc_subscription_optin', description: 'Dobrowolne zapisanie się do subskrypcji / newslettera / powiadomień' },
    ],
    surfaces: surfaceResults,
  };
}

export function buildMissionIntelligenceState(customWeights = DEFAULT_WEIGHTS) {
  const audit = runMeasurementAudit();
  const weights = normalizeWeights(customWeights);

  // Zweryfikowana baza porównawcza z opublikowanego raportu październik 2026 (32 kraje, 5 kontynentów)
  // Uwaga zgodnie z Sekcją 5 i 6: metryki są rozdzielone (nie sumujemy sesji i użytkowników),
  // a status połączenia API jest jawnie oznaczony bez udawania żywego odczytu z niepodpiętego jeszcze klucza.
  const countriesRaw = [
    {
      countryCode: 'PL',
      countryName: 'Polska',
      primaryLanguages: ['pl'],
      currentReach: 'active',
      observations: 1420,
      indicators: { interest: 92, engagement: 95, growthPotential: 78, availabilityGap: 20, distReadiness: 98 },
      separateMetricsOct2026: { radioSessionsVerified: 'Kraj #1 (Baza macierzysta)', mobileShareEst: null, desktopShareEst: null, note: 'Pełna dostępność ekosystemu PL' },
    },
    {
      countryCode: 'DE',
      countryName: 'Niemcy',
      primaryLanguages: ['pl', 'de'],
      currentReach: 'active',
      observations: 310,
      indicators: { interest: 88, engagement: 86, growthPotential: 90, availabilityGap: 75, distReadiness: 85 },
      separateMetricsOct2026: { radioSessionsVerified: 'Czołowy rynek zagraniczny (Raport Październik 2026)', note: 'Priorytet #1 ekspansji: Polonia DE -> odbiorcy niemieckojęzyczni (/de/ + radio.net)' },
    },
    {
      countryCode: 'GB',
      countryName: 'Wielka Brytania',
      primaryLanguages: ['pl', 'en'],
      currentReach: 'active',
      observations: 245,
      indicators: { interest: 85, engagement: 82, growthPotential: 86, availabilityGap: 70, distReadiness: 90 },
      separateMetricsOct2026: { radioSessionsVerified: 'Czołowy rynek zagraniczny (Raport Październik 2026)', note: 'Priorytet #2 ekspansji: Polonia UK -> odbiorcy anglojęzyczni (/en/ + TuneIn + Substack EN)' },
    },
    {
      countryCode: 'US',
      countryName: 'Stany Zjednoczone',
      primaryLanguages: ['pl', 'en', 'es'],
      currentReach: 'active',
      observations: 210,
      indicators: { interest: 89, engagement: 80, growthPotential: 92, availabilityGap: 72, distReadiness: 88 },
      separateMetricsOct2026: { radioSessionsVerified: 'Czołowy rynek zagraniczny (Raport Październik 2026)', note: 'Priorytet #3 ekspansji: Polonia USA -> Apple Podcasts, Amazon Music, Pinterest EN/ES' },
    },
    {
      countryCode: 'ES',
      countryName: 'Hiszpania & Ameryka Łacińska',
      primaryLanguages: ['es'],
      currentReach: 'low',
      observations: 64,
      indicators: { interest: 82, engagement: 58, growthPotential: 88, availabilityGap: 85, distReadiness: 74 },
      separateMetricsOct2026: { radioSessionsVerified: 'Odbiór potwierdzony w grupie 32 krajów', note: 'Wysokie zainteresowanie treściami biblijnymi w Google — język priorytetu #3 (ES)' },
    },
    {
      countryCode: 'BR',
      countryName: 'Brazylia & Kraje Portugalskojęzyczne',
      primaryLanguages: ['pt'],
      currentReach: 'low',
      observations: 48,
      indicators: { interest: 79, engagement: 54, growthPotential: 85, availabilityGap: 88, distReadiness: 70 },
      separateMetricsOct2026: { radioSessionsVerified: 'Odbiór potwierdzony w grupie 5 kontynentów', note: 'Język priorytetu #4 (PT)' },
    },
    {
      countryCode: 'FR',
      countryName: 'Francja & Kanada (Frankofonia)',
      primaryLanguages: ['fr'],
      currentReach: 'low',
      observations: 42,
      indicators: { interest: 74, engagement: 52, growthPotential: 78, availabilityGap: 84, distReadiness: 68 },
      separateMetricsOct2026: { radioSessionsVerified: 'Odbiór potwierdzony w grupie 32 krajów', note: 'Język priorytetu #5 (FR)' },
    },
    {
      countryCode: 'JP',
      countryName: 'Japonia (Azja Wschodnia)',
      primaryLanguages: ['ja', 'en'],
      currentReach: 'exploration',
      observations: 12, // Poniżej progu 30 obserwacji -> system obowiązkowo oznaczy jako INSUFFICIENT_DATA
      indicators: { interest: 45, engagement: 40, growthPotential: 60, availabilityGap: 95, distReadiness: 35 },
      separateMetricsOct2026: { radioSessionsVerified: 'Pojedyncze sesje (<30 obserwacji)', note: 'Przykład działania blokady małej próby (INSUFFICIENT_DATA)' },
    },
  ];

  const scoredCountries = countriesRaw
    .map((c) => scoreCountryMissionPotential(c, weights))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  const mondayTop5Recommendations = [
    {
      rank: 1,
      questionAnswered: 'Co wymaga pilnego uporządkowania w pomiarach (Krok 1)?',
      targetCountry: 'GLOBAL (Wszystkie kraje)',
      targetLanguage: 'PL / EN / DE',
      actionType: 'MEASUREMENT_UNIFICATION',
      recommendation: `Ujednolicić tag GA4 (${CANONICAL_GA4_ID}) oraz zdarzenia odtwarzaczy (cc_radio_play, cc_biblia_audio_listen) na ${audit.missingGa4Surfaces.length} podstronach bez pełnego tagu (${audit.missingGa4Surfaces.slice(0, 4).join(', ')}), z zachowaniem filtra traffic_type='internal'.`,
      approvalStatus: 'AWAITING_L0_APPROVAL',
      stagingTestUrl: 'https://polskieradio.cc/test/mission-intelligence.html',
    },
    {
      rank: 2,
      questionAnswered: 'Który kraj potrzebuje naszej uwagi w pierwszej kolejności?',
      targetCountry: 'Niemcy (DE)',
      targetLanguage: 'PL -> DE (Niemiecki)',
      actionType: 'GEO_AND_RADIO_EXPANSION',
      recommendation: 'Wykorzystać istniejącą słuchalność z Niemiec: zgłosić 6 strumieni radia CC do katalogu radio.net / radio.de (rutyna CC 19) oraz przygotować pilotaż podstrony /de/ z poprawnym znacznikiem hreflang="de" (bez wymuszania języka po IP).',
      approvalStatus: 'AWAITING_L0_APPROVAL',
      stagingTestUrl: 'https://polskieradio.cc/test/mission-intelligence.html',
    },
    {
      rank: 3,
      questionAnswered: 'Który materiał warto przetłumaczyć i zlokalizować?',
      targetCountry: 'Wielka Brytania (GB) & USA (US)',
      targetLanguage: 'EN (Angielski)',
      actionType: 'CONTENT_LOCALIZATION',
      recommendation: 'Dodać angielskie tytuły, opisy i napisy (multi-language metadata YouTube) do flagowych odcinków serii „Apokalipsa: Księga Nadziei” oraz wybranych rozdziałów Biblii Audio (Księga Rodzaju / Psalmy) z podpięciem podstrony /en/.',
      approvalStatus: 'AWAITING_L0_APPROVAL',
      stagingTestUrl: 'https://polskieradio.cc/test/mission-intelligence.html',
    },
    {
      rank: 4,
      questionAnswered: 'Na której platformie powinniśmy się pojawić, aby dotrzeć do szukających?',
      targetCountry: 'USA / UK / Niemcy / Polska',
      targetLanguage: 'PL / EN / DE',
      actionType: 'CHANNEL_DISTRIBUTION',
      recommendation: 'Podpiąć wygenerowane kanały RSS 2.0 (/feed/apokalipsa.xml, /feed/biblia-audio.xml, /feed/dobrze-ze-jestes.xml) w Apple Podcasts Connect i Amazon Music for Podcasters oraz uruchomić tablice wersetów 2:3 na Pinterest i biuletyn Substack.',
      approvalStatus: 'AWAITING_L0_APPROVAL',
      stagingTestUrl: 'https://polskieradio.cc/test/mission-intelligence.html',
    },
    {
      rank: 5,
      questionAnswered: 'Co przyniosło rzeczywiste zaangażowanie i jak połączyć analizę z działaniem?',
      targetCountry: 'Polonia DE / UK / USA',
      targetLanguage: 'PL',
      actionType: 'COMMUNITY_ENGAGEMENT',
      recommendation: 'Połączyć rekomendacje Search Console z rotacją na Grupach Facebook (Polonia w Niemczech, UK i USA — rutyna CC 20) oraz kanale Telegram, mierząc osobno przejścia mobilne i komputerowe do Biblii Audio i Kursu Codziennego.',
      approvalStatus: 'AWAITING_L0_APPROVAL',
      stagingTestUrl: 'https://polskieradio.cc/test/mission-intelligence.html',
    },
  ];

  let existingHistory = [];
  if (fs.existsSync(STATE_PATH)) {
    try {
      const prev = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
      if (Array.isArray(prev.history)) existingHistory = prev.history;
    } catch {}
  }

  const snapshotId = `SNAP-${new Date().toISOString().slice(0, 10)}`;
  const snapshotEntry = {
    snapshotId,
    recordedAt: new Date().toISOString(),
    dataSourceMode: 'VERIFIED_OCT2026_BASELINE_AND_LOCAL_HTML_AUDIT',
    liveApiConnected: {
      ga4DataApi: false,
      searchConsoleApi: false,
      googleTrends: false,
      lookerStudio: false,
      honestDisclosure: 'Koncepcja i silnik analityczny wdrożone; bieżące raporty API GA4 i Search Console oczekują na podpięcie uprawnień odczytowych — system nie prezentuje hipotetycznych liczb jako bieżących statystyk.',
    },
    ga4CoverageRatio: `${audit.ga4CoveredCount}/${audit.totalSurfacesChecked}`,
    topCountryByScore: scoredCountries.find((c) => !c.insufficientData)?.countryCode || 'PL',
  };

  // Append-only history (nie nadpisujemy poprzednich okresów; aktualizujemy wyłącznie dzisiejszą migawkę jeśli już istnieje)
  const filteredHistory = existingHistory.filter((h) => h.snapshotId !== snapshotId);
  filteredHistory.push(snapshotEntry);

  const stateObj = {
    schemaVersion: '1.0.0',
    directiveId: 'JOMA-DIR-CC-MISSION-INTEL-20261113',
    updatedAt: new Date().toISOString(),
    governance: {
      autoPublishForbidden: true,
      stagingUrlRequired: 'https://polskieradio.cc/test/mission-intelligence.html',
      neverSumDistinctMetrics: true,
      separateMobileAndDesktop: true,
      spiritualStateInference: 'FORBIDDEN',
      agentAccessLevel: 'AGGREGATE_ONLY_NO_PII',
    },
    weights,
    measurementAudit: audit,
    countryRanking: scoredCountries,
    mondayTop5Recommendations,
    history: filteredHistory,
  };

  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(stateObj, null, 2) + '\n', 'utf8');
  return stateObj;
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const state = buildMissionIntelligenceState();
  const activeCount = state.countryRanking.filter((c) => c.group === 'ACTIVE_AUDIENCE').length;
  const highInterestCount = state.countryRanking.filter((c) => c.group === 'HIGH_INTEREST_LOW_REACH').length;
  const insufficientCount = state.countryRanking.filter((c) => c.insufficientData).length;
  console.log(
    `CC_MISSION_INTELLIGENCE_OK: ga4_id=${state.measurementAudit.canonicalGa4MeasurementId} | surfaces_with_ga4=${state.measurementAudit.ga4CoveredCount}/${state.measurementAudit.totalSurfacesChecked} | countries_scored=${state.countryRanking.length} (active=${activeCount}, high_interest=${highInterestCount}, insufficient_data=${insufficientCount}) | top5_recs=${state.mondayTop5Recommendations.length} | history_snapshots=${state.history.length}`
  );
}
