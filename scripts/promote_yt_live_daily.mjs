#!/usr/bin/env node
/**
 * Codzienna rotacyjna promocja 20 kanałów YouTube LIVE Christian Culture
 * (z wyłączeniem kanałów Robert Łukasz Pio oraz Katarzyna Fedków).
 *
 * Platformy: LUMINA (Tablica), X (Twitter), Facebook, WhatsApp.
 * Standard: cc-human-voice (autentyczny ton, 1 główne CTA, kluczowe słowa z #,
 *           weryfikacja statusu LIVE przed publikacją, brak clickbaitu i słowa "amen").
 *
 * Użycie:
 *   node scripts/promote_yt_live_daily.mjs
 *   node scripts/promote_yt_live_daily.mjs --dry-run
 *   node scripts/promote_yt_live_daily.mjs --force
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { ALL_CHANNELS } from './all_channels_config.mjs';
import { publishEcosystemItemToTablica } from './publish-ecosystem-to-tablica.mjs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const STATE_PATH = path.join(ROOT, 'data', 'yt_live_promo_state.json');
const JOMA_HANDOFFS_PATH = 'C:\\Users\\czark\\Desktop\\Misja CC\\JOMA_SHARED_MEMORY\\JOMA_HANDOFFS.md';
const WEKTOR_DIR = 'C:\\Users\\czark\\Christian_Culture_Projekty\\Wektor1_VideoFactory';
const FB_SESSION_PATH = path.join(WEKTOR_DIR, 'fb_session.json');
const SERVICE_ACCOUNT_PATH = path.join(WEKTOR_DIR, 'serviceAccountKey.json');
const X_PROFILE_DIR = path.join(ROOT, '.x_browser_profile');

const LUMINA_PROJECT_ID = 'lumina-cc';
const LUMINA_API_KEY = 'AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M';

const EXCLUDED_HANDLES = new Set(['@RobertŁukaszPio', '@katarzynafedkow']);

const PROMO_METADATA = {
  '@RadioChristianCulture': {
    title: 'Polskie Radio CC — muzyka i Słowo na żywo 24/7',
    body: 'Rozpocznij dzień z chrześcijańskim radiem, które towarzyszy w pracy, w drodze i w domu. Dobra muzyka, wartościowe treści i pokój płynący ze Słowa przez całą dobę.',
    cta: 'Włącz transmisję na żywo i posłuchaj teraz:',
    hashtags: '#PolskieRadioCC #ChristianCulture #RadioNaŻywo #MuzykaChrześcijańska #SłowoBoże',
    xHook: 'Dobra muzyka i Słowo na żywo przez całą dobę w Polskim Radiu CC.'
  },
  '@bibliaaudiocc': {
    title: 'Biblia Audio CC — słuchowisko Pisma Świętego 24/7',
    body: 'Słuchaj Pisma Świętego w drodze, w pracy lub podczas wieczornego wyciszenia. Całodobowe słuchowisko biblijne pomaga karmić się Słowem Bożym każdego dnia.',
    cta: 'Dołącz do słuchania Biblii na żywo:',
    hashtags: '#BibliaAudio #PismoŚwięte #ChristianCulture #SłowoBoże #NaŻywo',
    xHook: 'Pismo Święte w wersji audio na żywo 24/7 — włącz w drodze lub w domu.'
  },
  '@wersetdnia_ChSB': {
    title: 'Werset Dnia LIVE — zatrzymaj się przy Słowie',
    body: 'W biegu codziennych spraw warto znaleźć chwilę na jeden werset, który porządkuje myśli i przypomina o Bożych obietnicach.',
    cta: 'Obejrzyj transmisję Werset Dnia LIVE:',
    hashtags: '#WersetDnia #Biblia #ChristianCulture #CodzienneSłowo #Wiara',
    xHook: 'Chwila zatrzymania nad Pismem Świętym w środku dnia — Werset Dnia LIVE.'
  },
  '@ChristianCultureTV': {
    title: 'Christian Culture TV — główna antena wideo 24/7',
    body: 'Główny kanał telewizji internetowej Christian Culture: programy, inspirujące treści i chrześcijańska kultura w jednym miejscu o każdej porze dnia.',
    cta: 'Oglądaj Christian Culture TV na żywo:',
    hashtags: '#ChristianCultureTV #TelewizjaChrześcijańska #NaŻywo #ChristianCulture #Wiara',
    xHook: 'Główna antena wideo Christian Culture TV nadaje na żywo 24/7.'
  },
  '@WorshipLiveCC': {
    title: 'Worship LIVE CC — uwielbienie na żywo 24/7',
    body: 'Przestrzeń modlitwy, pieśni uwielbienia i wyciszenia serca przed Bogiem. Idealne tło do osobistej modlitwy o każdej porze dnia i nocy.',
    cta: 'Wejdź w transmisję uwielbienia na żywo:',
    hashtags: '#WorshipLive #Uwielbienie #Modlitwa #ChristianCulture #MuzykaUwielbienia',
    xHook: 'Całodobowy strumień pieśni uwielbienia i wyciszenia przed Bogiem.'
  },
  '@osobowoscPLUS': {
    title: 'Osobowość + — rozwój charakteru i zdrowe relacje',
    body: 'Praktyczne spojrzenie na relacje, dojrzałość emocjonalną i chrześcijańskie wartości w codziennym życiu rodzinnym i zawodowym.',
    cta: 'Dołącz do transmisji Osobowość + na żywo:',
    hashtags: '#OsobowośćPlus #Relacje #RozwójDuchowy #ChristianCulture #Wartości',
    xHook: 'Rozmowy o relacjach, charakterze i dojrzałości w świetle wiary.'
  },
  '@CCWomen7': {
    title: 'CC Women — zachęta i inspiracja dla kobiet',
    body: 'Kanał stworzony z myślą o kobietach szukających Bożego pokoju, mądrości i umocnienia w codziennych rolach i wyzwaniach.',
    cta: 'Odwiedź transmisję CC Women LIVE:',
    hashtags: '#CCWomen #KobietaWiary #ChristianCulture #Inspiracja #NaŻywo',
    xHook: 'Przestrzeń zachęty, pokoju i inspiracji dla kobiet — CC Women LIVE.'
  },
  '@CCMen7': {
    title: 'CC Men — siła ducha i odpowiedzialność',
    body: 'Treści dla mężczyzn, którzy chcą budować życie na mocnym fundamencie, brać odpowiedzialność za bliskich i wzrastać w wierze.',
    cta: 'Włącz transmisję CC Men na żywo:',
    hashtags: '#CCMen #MężczyznaWiary #Odpowiedzialność #ChristianCulture #SiłaDucha',
    xHook: 'Mocne fundamenty, odpowiedzialność i wiara w praktyce — CC Men LIVE.'
  },
  '@CCBibleDeep': {
    title: 'CC Bible Deep — głębokie studium Biblii 24/7',
    body: 'Dla tych, którzy chcą zejść głębiej w zrozumienie Pisma Świętego, kontekstu ksiąg biblijnych i Bożego planu zbawienia.',
    cta: 'Rozpocznij głębsze studium na żywo:',
    hashtags: '#CCBibleDeep #StudiumBiblii #SolaScriptura #ChristianCulture #Biblia',
    xHook: 'Głębsze studium Pisma Świętego i kontekst biblijny na żywo 24/7.'
  },
  '@CCPrayer24': {
    title: 'CC Prayer 24 — całodobowa przestrzeń modlitwy',
    body: 'Spokojne miejsce modlitwy, skupienia i powierzania Bogu swoich spraw o każdej godzinie dnia i nocy.',
    cta: 'Dołącz do modlitwy na CC Prayer 24:',
    hashtags: '#CCPrayer24 #Modlitwa #PokójBoży #ChristianCulture #NaŻywo',
    xHook: 'Całodobowa przestrzeń modlitwy i wyciszenia na kanale CC Prayer 24.'
  },
  '@CCIdentityTwojaDuchowaTożsamoś': {
    title: 'CC Identity — Twoja duchowa tożsamość',
    body: 'Przypomnienie o tym, kim jesteś w Chrystusie i na jakim fundamencie możesz budować swoją codzienność bez lęku.',
    cta: 'Oglądaj CC Identity na żywo:',
    hashtags: '#CCIdentity #DuchowaTożsamość #Chrystus #ChristianCulture #Wiara',
    xHook: 'Odkrywaj swoją duchową tożsamość w Chrystusie — CC Identity LIVE.'
  },
  '@PoprawKoronęCC': {
    title: 'Popraw Koronę — podniesienie na duchu 24/7',
    body: 'Gdy codzienność przytłacza, warto przypomnieć sobie o swojej godności dziecka Bożego i podnieść wzrok wyżej.',
    cta: 'Zajrzyj na kanał Popraw Koronę LIVE:',
    hashtags: '#PoprawKoronę #Godność #Nadzieja #ChristianCulture #NaŻywo',
    xHook: 'Podniesienie na duchu i przypomnienie o Bożej obietnicy — Popraw Koronę LIVE.'
  },
  '@TopSeven_CC': {
    title: 'Top Seven — wybrane chrześcijańskie brzmienia',
    body: 'Zestawienia i starannie dobrane utwory chrześcijańskie, które podnoszą na duchu i towarzyszą w ciągu dnia.',
    cta: 'Sprawdź transmisję Top Seven na żywo:',
    hashtags: '#TopSeven #MuzykaChrześcijańska #ChristianCulture #Radio #NaŻywo',
    xHook: 'Wyselekcjonowane chrześcijańskie brzmienia na kanale Top Seven LIVE.'
  },
  '@ChristianCulturePOP': {
    title: 'Christian Culture POP — nowoczesna muzyka z przesłaniem',
    body: 'Nowoczesne brzmienia pop niosące dobre, budujące przesłanie bez kompromisów w jakości i treści.',
    cta: 'Posłuchaj Christian Culture POP na żywo:',
    hashtags: '#ChristianCulturePOP #MuzykaPop #DobrePrzesłanie #ChristianCulture #NaŻywo',
    xHook: 'Nowoczesna muzyka pop z budującym przesłaniem — Christian Culture POP LIVE.'
  },
  '@ChristianCultureInstrumental': {
    title: 'CC Instrumental — muzyka do modlitwy i lektury',
    body: 'Delikatne, instrumentalne kompozycje wspierające skupienie przy lekturze Pisma Świętego, pracy twórczej i wieczornym odpoczynku.',
    cta: 'Włącz spokojny strumień CC Instrumental:',
    hashtags: '#CCInstrumental #MuzykaInstrumentalna #Modlitwa #Wyciszenie #ChristianCulture',
    xHook: 'Spokojna muzyka instrumentalna do lektury Biblii, pracy i modlitwy.'
  },
  '@ToDlaCiebieGramy': {
    title: 'RCC TV 24 — To dla Ciebie gramy',
    body: 'Całodobowy kanał muzyczno-radiowy łączący dobre brzmienia z przesłaniem przygotowanym z myślą o słuchaczach i widzach.',
    cta: 'Oglądaj i słuchaj RCC TV 24 na żywo:',
    hashtags: '#RCCTV24 #ToDlaCiebieGramy #ChristianCulture #Muzyka #NaŻywo',
    xHook: 'Całodobowa transmisja muzyczno-radiowa RCC TV 24 — To dla Ciebie gramy.'
  },
  '@ChristianCultureNetwork': {
    title: 'Christian Culture Network — przekrój treści misyjnych',
    body: 'Wspólny kanał sieci Christian Culture łączący najciekawsze materiały, rozmowy i transmisje z całego ekosystemu.',
    cta: 'Poznaj Christian Culture Network na żywo:',
    hashtags: '#ChristianCultureNetwork #ChristianCulture #Ewangelizacja #Misja #NaŻywo',
    xHook: 'Przekrój treści misyjnych całej sieci Christian Culture na żywo 24/7.'
  },
  '@PersonalityPlusCC': {
    title: 'Personality Plus — relacje i wartości po angielsku',
    body: 'Anglojęzyczna odsłona rozmów o osobowości, relacjach międzyludzkich i praktycznej mądrości chrześcijańskiej.',
    cta: 'Watch Personality Plus LIVE now:',
    hashtags: '#PersonalityPlus #ChristianCulture #Relationships #Faith #LiveStream',
    xHook: 'Insights on character, relationships and Christian values on Personality Plus LIVE.'
  },
  '@CCFILM77': {
    title: 'CC FILM — chrześcijańskie kino i historie 24/7',
    body: 'Wartościowe historie filmowe, które poruszają serce, skłaniają do refleksji i wskazują na nadzieję płynącą z Ewangelii.',
    cta: 'Włącz seans na CC FILM na żywo:',
    hashtags: '#CCFILM #KinoChrześcijańskie #WartościoweFilmy #ChristianCulture #NaŻywo',
    xHook: 'Wartościowe historie filmowe i chrześcijańskie kino na żywo 24/7.'
  },
  '@CCNatureSounds': {
    title: 'CC Nature Sounds — dźwięki natury i wyciszenie',
    body: 'Naturalne pejzaże dźwiękowe stworzone do odpoczynku, wyciszenia myśli i spokojnego snu w obecności Stwórcy.',
    cta: 'Wycisz się przy CC Nature Sounds LIVE:',
    hashtags: '#CCNatureSounds #DźwiękiNatury #Odpoczynek #Spokój #ChristianCulture',
    xHook: 'Spokojne dźwięki natury do odpoczynku i wyciszenia — CC Nature Sounds LIVE.'
  }
};

const ORDER_PREFERENCE = Object.keys(PROMO_METADATA);

function loadEnv() {
  for (const envFile of [path.join(ROOT, '.env.local'), path.join(ROOT, '.env')]) {
    if (!fs.existsSync(envFile)) continue;
    for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

function getTodayWarsaw() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function loadState() {
  if (fs.existsSync(STATE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    } catch {}
  }
  return { lastPromotedIndex: -1, lastPromotedDate: null, history: [] };
}

function saveState(state) {
  const dir = path.dirname(STATE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function getOrderedPromoChannels() {
  const eligible = ALL_CHANNELS.filter(c => !EXCLUDED_HANDLES.has(c.handle));
  const byHandle = new Map(eligible.map(c => [c.handle, c]));
  const ordered = [];
  for (const handle of ORDER_PREFERENCE) {
    if (byHandle.has(handle)) {
      ordered.push(byHandle.get(handle));
      byHandle.delete(handle);
    }
  }
  for (const rest of byHandle.values()) ordered.push(rest);
  return ordered;
}

async function isChannelLive(handle) {
  const url = `https://www.youtube.com/${encodeURI(handle)}/live`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8'
      },
      redirect: 'follow'
    });
    if (!res.ok) return false;
    const html = await res.text();
    const isLiveNow = /"isLiveNow":true/.test(html);
    const isLive = /"isLive":true/.test(html);
    return isLiveNow && isLive;
  } catch {
    return false;
  }
}

function buildPosts(channel) {
  const liveUrl = `https://www.youtube.com/${channel.handle}/live`;
  const meta = PROMO_METADATA[channel.handle] || {
    title: `${channel.channelName} — transmisja na żywo 24/7`,
    body: `Zapraszamy na całodobową transmisję kanału ${channel.channelName} w ekosystemie Christian Culture.`,
    cta: `Oglądaj ${channel.channelName} na żywo:`,
    hashtags: '#ChristianCulture #NaŻywo #PolskieRadioCC #Wiara',
    xHook: `Transmisja ${channel.channelName} działa na żywo 24/7.`
  };

  const fullPost = `${meta.title}\n\n${meta.body}\n\n👉 ${meta.cta}\n${liveUrl}\n\n${meta.hashtags}`;

  // X: limit 280 znaków (link t.co liczy się jako 23 znaki, trzymamy się bezpiecznie poniżej 260 znaków fizycznych)
  let xPost = `${meta.xHook}\n\n👉 ${meta.cta}\n${liveUrl}\n\n${meta.hashtags}`;
  if (xPost.length > 275) {
    const shortTags = meta.hashtags.split(/\s+/).slice(0, 3).join(' ');
    xPost = `${meta.xHook}\n\n👉 ${meta.cta}\n${liveUrl}\n\n${shortTags}`;
  }

  return { liveUrl, title: meta.title, fullPost, xPost, hashtags: meta.hashtags };
}

async function publishToLumina(channel, post, todayStr, dryRun) {
  const res = await publishEcosystemItemToTablica(
    {
      title: post.title,
      url: post.liveUrl,
      summary: post.fullPost,
      category: 'live',
      publishedAt: new Date().toISOString()
    },
    {
      dryRun,
      force: true,
      voiceSlug: 'cezaryrgowski',
      imagePath: path.join(__dirname, 'thumbnail_cc.jpg'),
      rootDir: ROOT
    }
  );
  if (!res.ok) {
    throw new Error(`LUMINA błąd: ${res.reason || 'nieznany błąd'}`);
  }
  return { status: dryRun ? 'dry_run' : 'published', docId: res.docId || null };
}

async function publishToX(tweetText, dryRun) {
  if (dryRun) {
    console.log(`[DRY-RUN][X]\n${tweetText}`);
    return { status: 'dry_run' };
  }

  if (!fs.existsSync(X_PROFILE_DIR)) fs.mkdirSync(X_PROFILE_DIR, { recursive: true });
  const launchOptions = {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  };

  let context;
  try {
    context = await chromium.launchPersistentContext(X_PROFILE_DIR, launchOptions);
  } catch {
    delete launchOptions.channel;
    context = await chromium.launchPersistentContext(X_PROFILE_DIR, launchOptions);
  }

  try {
    const authToken = process.env.X_AUTH_TOKEN;
    if (authToken) {
      await context.addCookies([
        { name: 'auth_token', value: authToken, domain: '.x.com', path: '/', httpOnly: true, secure: true, sameSite: 'None' },
        { name: 'auth_token', value: authToken, domain: '.twitter.com', path: '/', httpOnly: true, secure: true, sameSite: 'None' }
      ]);
    }

    const page = await context.newPage();
    await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    if (page.url().includes('/login') || page.url().includes('/onboarding/')) {
      throw new Error('Brak aktywnej sesji X (wymagane X_AUTH_TOKEN lub logowanie w .x_browser_profile).');
    }

    const textareaSelector = '[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]';
    await page.waitForSelector(textareaSelector, { timeout: 15000 });
    await page.click(textareaSelector);
    await page.waitForTimeout(400);
    await page.keyboard.insertText(tweetText);
    await page.waitForTimeout(2500);

    const overlayDismiss = await page.$('[data-testid="app-bar-close"], [aria-label="Zamknij"], [aria-label="Close"]');
    if (overlayDismiss) await overlayDismiss.click().catch(() => {});

    await page.focus(textareaSelector);
    await page.keyboard.press('Control+Enter');
    await page.waitForTimeout(2000);

    const postBtn = await page.$('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]');
    if (postBtn && (await postBtn.isVisible().catch(() => false))) {
      await postBtn.click({ force: true }).catch(() => {});
    }

    await page.waitForTimeout(5000);
    return { status: 'published' };
  } finally {
    await context.close().catch(() => {});
  }
}

async function publishToFacebook(postText, dryRun) {
  if (dryRun) {
    console.log(`[DRY-RUN][FB]\n${postText}`);
    return { status: 'dry_run' };
  }
  if (!fs.existsSync(FB_SESSION_PATH)) {
    throw new Error(`Brak pliku sesji Facebook: ${FB_SESSION_PATH}`);
  }

  const cookies = JSON.parse(fs.readFileSync(FB_SESSION_PATH, 'utf8'));
  const validSameSite = new Set(['Strict', 'Lax', 'None']);
  const pwCookies = cookies.map(c => {
    const copy = { ...c };
    delete copy.sameParty;
    delete copy.sourceScheme;
    delete copy.sourcePort;
    if (!validSameSite.has(copy.sameSite)) delete copy.sameSite;
    return copy;
  });

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 1000 },
      locale: 'pl-PL'
    });
    await context.addCookies(pwCookies);
    const page = await context.newPage();

    await page.goto('https://www.facebook.com/cezary.rogowski1', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    await page.locator('div[role="button"]:has-text("Zezwól"), button:has-text("Zezwól na wszystkie pliki cookie")').first().click({ timeout: 2000 }).catch(() => {});

    const triggerLocator = page.locator(
      'div[role="button"]:has-text("Co słychać"), div[role="button"]:has-text("Napisz, co myślisz"), div[role="button"]:has-text("Napisz coś"), div[role="button"]:has-text("O czym myślisz"), div[role="button"]:has-text("Stwórz post"), div[aria-label*="Co słychać"], div[aria-label*="Napisz"]'
    ).locator('visible=true').first();
    if ((await triggerLocator.count()) === 0) {
      throw new Error('Brak aktywnej sesji edycji na stronie Facebook (widok gościa lub wygasłe fb_session.json).');
    }

    await triggerLocator.click();
    await page.waitForTimeout(3000);

    const dialogTextbox = page.locator('div[role="dialog"] div[role="textbox"][contenteditable="true"], div[role="dialog"] [contenteditable="true"]').locator('visible=true').first();
    if ((await dialogTextbox.count()) === 0) {
      throw new Error('Nie znaleziono pola tekstowego w oknie tworzenia posta na Facebooku.');
    }

    await dialogTextbox.click();
    await page.keyboard.insertText(postText);
    await page.waitForTimeout(3000);

    const nextBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Dalej")').locator('visible=true').first();
    if ((await nextBtn.count()) > 0) {
      await nextBtn.click();
      await page.waitForTimeout(1500);
    }

    const submitBtn = page.locator('div[role="dialog"] div[aria-label="Opublikuj"], div[role="dialog"] div[role="button"]:has-text("Opublikuj"), div[role="dialog"] button:has-text("Opublikuj")').locator('visible=true').first();
    if ((await submitBtn.count()) === 0) {
      throw new Error('Nie znaleziono przycisku Opublikuj na Facebooku.');
    }

    await submitBtn.click();
    await page.waitForTimeout(8000);
    return { status: 'published' };
  } finally {
    await browser.close().catch(() => {});
  }
}

async function publishToWhatsApp(postText, dryRun) {
  if (dryRun) {
    console.log(`[DRY-RUN][WA] Kolejkowanie wiadomości promocyjnej (${postText.length} znaków).`);
    return { status: 'dry_run', targets: 0 };
  }
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    throw new Error(`Brak klucza Firebase: ${SERVICE_ACCOUNT_PATH}`);
  }

  const admin = require(path.join(WEKTOR_DIR, 'node_modules', 'firebase-admin'));
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
  const db = admin.firestore();
  const { loadDistributionGroups, queueWithD1Fallback } = require(path.join(WEKTOR_DIR, 'wa_queue_helpers.js'));
  const waState = { quotaExhausted: false };

  const targets = ['120363409279454206@g.us']; // Grupa Nazira (priorytet)
  try {
    const groups = await loadDistributionGroups({ db, state: waState });
    for (const g of groups.slice(0, 2)) {
      if (g.groupId && !targets.includes(g.groupId)) {
        targets.push(g.groupId);
      }
    }
  } catch {
    targets.push('120363024884245648@g.us');
  }

  let queued = 0;
  for (const target of targets) {
    await queueWithD1Fallback({
      db,
      admin,
      command: `wyślij celowane [${target}]: ${postText}`,
      targetGroupId: target,
      sender: 'antigravity',
      priority: 4,
      state: waState
    });
    queued++;
  }

  return { status: 'queued', targets: queued };
}

function appendJomaReport(todayStr, channel, post, results) {
  if (!fs.existsSync(JOMA_HANDOFFS_PATH)) return;
  const line = `\n### [AUTOPROMOCJA YT LIVE — ${todayStr}] ${channel.channelName} (${channel.handle})\n` +
    `- **Link:** ${post.liveUrl}\n` +
    `- **LUMINA:** ${results.lumina.status}${results.lumina.error ? ` (${results.lumina.error})` : ''}\n` +
    `- **X:** ${results.x.status}${results.x.error ? ` (${results.x.error})` : ''}\n` +
    `- **Facebook:** ${results.fb.status}${results.fb.error ? ` (${results.fb.error})` : ''}\n` +
    `- **WhatsApp:** ${results.wa.status}${results.wa.error ? ` (${results.wa.error})` : ''}\n`;
  fs.appendFileSync(JOMA_HANDOFFS_PATH, line, 'utf8');
}

async function main() {
  loadEnv();
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const onlyArg = args.find(a => a.startsWith('--only='));
  const onlySet = onlyArg ? new Set(onlyArg.split('=')[1].split(',').map(s => s.trim().toLowerCase())) : null;
  const indexArg = args.find(a => a.startsWith('--index='));
  const forcedIndex = indexArg ? Number(indexArg.split('=')[1]) : null;

  const todayStr = getTodayWarsaw();
  const state = loadState();
  const promoChannels = getOrderedPromoChannels();

  if (state.lastPromotedDate === todayStr && !force && !dryRun) {
    console.log(`ℹ️ Promocja na dzień ${todayStr} została już dzisiaj wykonana. Użyj --force, aby wymusić kolejną.`);
    process.exit(0);
  }

  let chosen = null;
  let chosenIndex = -1;
  if (forcedIndex !== null && Number.isInteger(forcedIndex) && promoChannels[forcedIndex]) {
    const candidate = promoChannels[forcedIndex];
    if (await isChannelLive(candidate.handle)) {
      chosen = candidate;
      chosenIndex = forcedIndex;
    }
  } else {
    for (let offset = 1; offset <= promoChannels.length; offset++) {
      const idx = (state.lastPromotedIndex + offset) % promoChannels.length;
      const candidate = promoChannels[idx];
      const live = await isChannelLive(candidate.handle);
      if (live) {
        chosen = candidate;
        chosenIndex = idx;
        break;
      }
      console.warn(`⚠️ Kanał ${candidate.channelName} (${candidate.handle}) nie ma aktywnego statusu LIVE — sprawdzam kolejny.`);
    }
  }

  if (!chosen) {
    console.error('❌ Żaden z 20 kanałów nie przeszedł bramki LIVE_OK.');
    process.exit(1);
  }

  const post = buildPosts(chosen);
  console.log(`\n🚀 Wybrany kanał [${chosenIndex + 1}/20]: ${chosen.channelName} (${chosen.handle})`);
  console.log(`🔗 Link: ${post.liveUrl}\n`);

  const shouldRun = name => !onlySet || onlySet.has(name);
  const results = {
    lumina: { status: 'skipped' },
    x: { status: 'skipped' },
    fb: { status: 'skipped' },
    wa: { status: 'skipped' }
  };

  if (shouldRun('lumina')) {
    try { results.lumina = await publishToLumina(chosen, post, todayStr, dryRun); }
    catch (e) { results.lumina = { status: 'error', error: e.message }; }
  }
  if (shouldRun('x')) {
    try { results.x = await publishToX(post.xPost, dryRun); }
    catch (e) { results.x = { status: 'error', error: e.message }; }
  }
  if (shouldRun('fb')) {
    try { results.fb = await publishToFacebook(post.fullPost, dryRun); }
    catch (e) { results.fb = { status: 'error', error: e.message }; }
  }
  if (shouldRun('wa')) {
    try { results.wa = await publishToWhatsApp(post.fullPost, dryRun); }
    catch (e) { results.wa = { status: 'error', error: e.message }; }
  }

  console.log('📊 Wyniki publikacji:', JSON.stringify(results, null, 2));

  if (!dryRun) {
    state.lastPromotedIndex = chosenIndex;
    state.lastPromotedDate = todayStr;
    state.history.unshift({
      date: todayStr,
      channelName: chosen.channelName,
      handle: chosen.handle,
      url: post.liveUrl,
      results
    });
    state.history = state.history.slice(0, 60);
    saveState(state);
    appendJomaReport(todayStr, chosen, post, results);
  }
}

main().catch(err => {
  console.error('❌ Krytyczny błąd promocji:', err);
  process.exit(1);
});
