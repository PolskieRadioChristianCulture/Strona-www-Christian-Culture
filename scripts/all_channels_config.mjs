import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_cc.jpg';
const OBS_HOST = '192.168.50.217';
const OBS_PORT = 4455;
const OBS_PASS = '6qPcL0sXrVvs6sPN';
const AITUM_REMOTE_SCRIPT = 'C:/Users/nazir/a007/update_aitum.mjs';

// ============================================================
// PEŁNA MAPA: Kanał YT → Aitum Output → Tytuł transmisji
// ============================================================
// Kanały już LIVE (pomijamy - ale dodamy miniaturę):
// @ChristianCultureTV, @osobowoscPLUS, @RadioChristianCulture,
// @bibliaaudiocc, @wersetdnia_ChSB, @CCWomen7, @CCMen7
// ============================================================
export const ALL_CHANNELS = [
  // --- JUŻ LIVE (tylko miniatura) ---
  { channelName: 'Christian Culture TV',   handle: '@ChristianCultureTV',    id: 'UCG5Y4dwJi5436Gu6QH3nNUQ', via: '@ChristianCultureTV',    aitumOutput: 'CC TV',           alreadyLive: true,  title: 'Christian Culture TV LIVE 🔴 24/7' },
  { channelName: 'Osobowość +',            handle: '@osobowoscPLUS',          id: 'UCHmPxDM2zzlUAf5ZvlotPLw', via: '@osobowośćPLUS',          aitumOutput: null,              alreadyLive: true,  title: 'Osobowość + LIVE 🔴 | Christian Culture TV24' },
  { channelName: 'Polskie Radio CC',       handle: '@RadioChristianCulture',  id: 'UCNnCdsJ-K6FXulZzXZHWkjQ', via: '@osobowośćPLUS',          aitumOutput: 'RCC',             alreadyLive: true,  title: 'Polskie Radio Christian Culture LIVE 🔴 24/7' },
  { channelName: 'Biblia Audio CC',        handle: '@bibliaaudiocc',          id: 'UCCqHRCEuSDhlRcvcQ6qM1Kw', via: '@osobowośćPLUS',          aitumOutput: 'Biblia Audio',    alreadyLive: true,  title: 'Biblia Audio Christian Culture LIVE 🔴 24/7' },
  { channelName: 'Werset Dnia',            handle: '@wersetdnia_ChSB',        id: 'UCyOvW5DuDLVq5XWFyijgtbw', via: '@osobowośćPLUS',          aitumOutput: 'Werset Dnia',     alreadyLive: true,  title: 'Werset Dnia LIVE 🔴 24/7 | Chrześcijański Serwis Biblijny' },
  { channelName: 'CC Women',               handle: '@CCWomen7',               id: 'UC-LPFt-vmJCeap746DOWMgw', via: '@CCWomen7',               aitumOutput: 'CC Women',        alreadyLive: true,  title: 'CC Women LIVE 🔴 24/7 | Christian Culture' },
  { channelName: 'CC Men',                 handle: '@CCMen7',                 id: 'UCUpuq9JS7jitIcm9iBn0jnA', via: '@CCMen7',                 aitumOutput: 'CC MEN',          alreadyLive: true,  title: 'CC Men LIVE 🔴 | Christian Culture TV24' },

  // --- DO URUCHOMIENIA ---
  { channelName: 'Robert Łukasz Pio',      handle: '@RobertŁukaszPio',        id: 'UC34DD8FTh_y2GhZhg3qBaIQ', via: '@RobertŁukaszPio',       aitumOutput: 'Robert',          alreadyLive: false, title: 'Robert Łukasz Pio • W Obecności LIVE 🔴 24/7' },
  { channelName: 'Katarzyna Fedków',        handle: '@katarzynafedkow',        id: 'UCnipJdX6mtsxaoEENzEVusA', via: '@katarzynafedkow',        aitumOutput: 'Katarzyna',       alreadyLive: false, title: 'Katarzyna Fedków LIVE 🔴 | Polska Muzyka Chrześcijańska' },
  { channelName: 'Top Seven',              handle: '@TopSeven_CC',            id: 'UCdo_1-cjf5TEjSfEG_rxmyw', via: '@TopSeven_CC',            aitumOutput: 'TOP SEVEN',       alreadyLive: false, title: 'Top Seven LIVE 🔴 24/7 | Christian Culture' },
  { channelName: 'RCC TV 24',             handle: '@ToDlaCiebieGramy',       id: 'UCgzGpVUtw4T-9GcwygPeyfw', via: '@ToDlaCiebieGramy',       aitumOutput: 'RCC TV24',        alreadyLive: false, title: 'RCC TV 24 LIVE 🔴 24/7' },
  { channelName: 'CC Prayer 24',           handle: '@CCPrayer24',             id: 'UCPDuMcFijIDEjMWf20J_QCQ', via: '@CCPrayer24',             aitumOutput: 'CC Modlitwa 24',  alreadyLive: false, title: 'CC Prayer 24 🔴 Modlitwa Na Żywo 24/7' },
  { channelName: 'Christian Culture Network', handle: '@ChristianCultureNetwork', id: 'UCnY5U9TRJa16yCNoY6RtIfg', via: '@ChristianCultureNetwork', aitumOutput: 'CC Network', alreadyLive: false, title: 'Christian Culture Network LIVE 🔴 24/7' },
  { channelName: 'CC Bible Deep',          handle: '@CCBibleDeep',            id: 'UC_placeholder_bible_deep', via: '@CCBibleDeep',            aitumOutput: 'CC BIBLE DEEP',   alreadyLive: false, title: 'CC Bible Deep LIVE 🔴 24/7 | Głębokie Studium Biblii' },
  { channelName: 'Christian Culture POP',  handle: '@ChristianCulturePOP',    id: 'UC_placeholder_cc_pop',    via: '@ChristianCulturePOP',    aitumOutput: 'CC POP',          alreadyLive: false, title: 'Christian Culture POP LIVE 🔴 24/7' },
  { channelName: 'Popraw Koronę',          handle: '@PoprawKoronęCC',         id: 'UC_placeholder_pk',        via: '@PoprawKoronęCC',         aitumOutput: 'Popraw Koronę',   alreadyLive: false, title: 'Popraw Koronę LIVE 🔴 24/7 | Christian Culture' },
  { channelName: 'Worship LIVE CC',        handle: '@WorshipLiveCC',          id: 'UC_placeholder_worship',   via: '@WorshipLiveCC',          aitumOutput: 'CC Worship',      alreadyLive: false, title: 'Worship LIVE CC 🔴 24/7 | Uwielbienie Na Żywo' },
  { channelName: 'CC Instrumental',        handle: '@ChristianCultureInstrumental', id: 'UC_placeholder_instr', via: '@ChristianCultureInstrumental', aitumOutput: 'CC Instrumental', alreadyLive: false, title: 'CC Instrumental LIVE 🔴 24/7 | Christian Culture' },
  { channelName: 'CC Identity',            handle: '@CCIdentityTwojaDuchowaTożsamoś', id: 'UC_placeholder_ident', via: '@CCIdentityTwojaDuchowaTożsamoś', aitumOutput: 'CC Identity', alreadyLive: false, title: 'CC Identity LIVE 🔴 24/7 | Twoja Duchowa Tożsamość' },
  { channelName: 'CC FILM',               handle: '@CCFILM77',               id: 'UC_placeholder_film',      via: '@CCFILM77',               aitumOutput: 'CC FILM',         alreadyLive: false, title: 'CC FILM LIVE 🔴 24/7 | Chrześcijańskie Kino' },
  { channelName: 'CC Nature Sounds',       handle: '@CCNatureSounds',         id: 'UC_placeholder_nature',    via: '@CCNatureSounds',         aitumOutput: 'CC Dzwięki Natury', alreadyLive: false, title: 'CC Nature Sounds LIVE 🔴 24/7 | Dźwięki Natury' },
  { channelName: 'Personality Plus',       handle: '@PersonalityPlusCC',      id: 'UC_placeholder_pp',        via: '@PersonalityPlusCC',      aitumOutput: 'Personality Plus', alreadyLive: false, title: 'Personality Plus LIVE 🔴 24/7 | Christian Culture' },
];

export { PROFILE_DIR, THUMBNAIL_PATH, OBS_HOST, OBS_PORT, OBS_PASS };
