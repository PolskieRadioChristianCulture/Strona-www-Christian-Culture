/**
 * ============================================================================
 * CHRISTIAN CULTURE — AUTOMATYCZNY PUBLIKATOR SPOTIFY FOR CREATORS (BIBLIA AUDIO V7)
 * Show: Biblia Audio Christian Culture (ID: 6M2mU6VzRCPCOjWihgO8Aw)
 * Panel: https://creators.spotify.com/home/show/6M2mU6VzRCPCOjWihgO8Aw
 * Publiczny URL: https://open.spotify.com/show/6M2mU6VzRCPCOjWihgO8Aw
 * ============================================================================
 *
 * Tryby użycia:
 *   node scripts/publish_spotify_biblia_audio.mjs --audit
 *     -> Pobiera żywy stan odcinków ze Spotify API, porównuje z wyprodukowanymi
 *        plikami MP3 V7 (Księga Rodzaju 1–32+) i zapisuje raport zaległości.
 *
 *   node scripts/publish_spotify_biblia_audio.mjs --login
 *     -> Otwiera widoczne okno Chrome z trwałym profilem (.youtube_browser_profile),
 *        aby jednorazowo zalogować się do Spotify for Creators.
 *
 *   node scripts/publish_spotify_biblia_audio.mjs --episode GEN-032
 *     -> Publikuje wskazany odcinek MP3 na Spotify for Creators.
 *
 *   node scripts/publish_spotify_biblia_audio.mjs --batch [--limit 5]
 *     -> Publikuje zaległe odcinki V7 w kolejności chronologicznej z ochroną
 *        przed duplikatami (Anti-Duplicate Gate).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchStudio } from './yt_studio_session.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHOW_ID = '6M2mU6VzRCPCOjWihgO8Aw';
const SHOW_CREATORS_HOME_URL = `https://creators.spotify.com/home/show/${SHOW_ID}`;
const SHOW_CREATORS_EPISODES_URL = `https://creators.spotify.com/pod/show/${SHOW_ID}/episodes`;
const SHOW_CREATORS_WIZARD_URL = `https://creators.spotify.com/pod/show/${SHOW_ID}/episode/wizard`;
const SHOW_PUBLIC_URL = `https://open.spotify.com/show/${SHOW_ID}`;

const REPO_ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(REPO_ROOT, 'biblia-audio', 'data', 'catalog.json');
const WEB_AUDIO_DIR = path.join(REPO_ROOT, 'biblia-audio', 'audio');
const HISTORY_PATH = path.join(REPO_ROOT, 'data', 'spotify_published_history.json');

const DRIVE_MASTER_DIR = 'H:\\Mój dysk\\Biblia Audio Christian Culture (1)';
const DRIVE_READY_AUDIO_DIR = path.join(DRIVE_MASTER_DIR, 'gotowe_do_emisji');
const DRIVE_PRODUKCJA_DIR = path.join(DRIVE_MASTER_DIR, 'produkcja');
const DRIVE_EMISJA_GENESIS_DIR = 'H:\\Mój dysk\\OA - orkiestracja Agentowa\\Biblia Audio CC — Gotowe do Emisji\\01_Stary_Testament\\01_Ksiega_Rodzaju';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Pobiera aktualną listę opublikowanych odcinków bezpośrednio z publicznego API Spotify Pathfinder
 */
export async function fetchLiveSpotifyEpisodes(showId = SHOW_ID) {
  try {
    const embedRes = await fetch(`https://open.spotify.com/embed/show/${showId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      }
    });
    const html = await embedRes.text();
    const tokenMatch = html.match(/"accessToken":"([^"]+)"/);
    if (!tokenMatch) {
      throw new Error('Brak accessToken w odpowiedzi open.spotify.com/embed');
    }
    const token = tokenMatch[1];

    const allItems = [];
    let totalCount = 0;
    for (const offset of [0, 50]) {
      const variables = {
        uri: `spotify:show:${showId}`,
        offset,
        limit: 50
      };
      const extensions = {
        persistedQuery: {
          version: 1,
          sha256Hash: '8cc9fc7eed67de3da4db0ff6fd5eccf4d1ffd1fb3e5a3be12316f1b52ffab91d'
        }
      };
      const apiUrl = `https://api-partner.spotify.com/pathfinder/v2/query?operationName=queryShowEpisodes&variables=${encodeURIComponent(JSON.stringify(variables))}&extensions=${encodeURIComponent(JSON.stringify(extensions))}`;
      const apiRes = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'app-platform': 'WebPlayer'
        }
      });
      const json = await apiRes.json();
      const pages = json?.data?.podcastUnionV2?.episodesV2;
      if (!pages || !Array.isArray(pages.items)) {
        if (offset === 0) throw new Error('Brak episodesV2.items w odpowiedzi Pathfinder API');
        break;
      }
      totalCount = pages.totalCount || totalCount;
      allItems.push(...pages.items);
      if (allItems.length >= totalCount) break;
    }

    const episodes = allItems.map((it) => {
      const d = it?.entity?.data || {};
      return {
        id: d.id,
        uri: d.uri,
        name: d.name,
        description: d.description || '',
        releaseDate: d.releaseDate?.isoString || null,
        durationMs: d.duration?.totalMilliseconds || null,
        durationSec: d.duration?.totalMilliseconds ? Math.round(d.duration.totalMilliseconds / 1000) : null
      };
    });

    return {
      totalCount: totalCount || episodes.length,
      episodes
    };
  } catch (err) {
    console.warn(`⚠️ Nie udało się pobrać listy z Pathfinder API (${err.message}). Używam lokalnej historii.`);
    if (fs.existsSync(HISTORY_PATH)) {
      const local = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));
      return {
        totalCount: local.liveSpotifyTotalCount || (local.liveEpisodes || []).length,
        episodes: local.liveEpisodes || []
      };
    }
    return { totalCount: 0, episodes: [] };
  }
}

/**
 * Kanoniczny spis odcinków V7 Księgi Rodzaju + Psalmu 23
 */
export function buildV7EpisodesInventory() {
  const catalog = fs.existsSync(CATALOG_PATH)
    ? JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'))
    : [];

  const catalogByChapter = new Map();
  for (const entry of catalog) {
    if (entry.book === 'genesis') {
      catalogByChapter.set(Number(entry.chapter), entry);
    }
  }

  // Zbierz wszystkie pliki MP3 Księgi Rodzaju z biblia-audio/audio oraz Drive
  const mp3Map = new Map();
  const scanDirs = [WEB_AUDIO_DIR, DRIVE_READY_AUDIO_DIR, DRIVE_EMISJA_GENESIS_DIR];

  for (const dir of scanDirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file.startsWith('Ksiega_Rodzaju_') && file.endsWith('_Biblia_Audio_CC.mp3')) {
        if (!mp3Map.has(file)) {
          mp3Map.set(file, path.join(dir, file));
        }
      }
    }
  }

  // Sprawdź również podkatalogi produkcja/GEN-XXX
  if (fs.existsSync(DRIVE_PRODUKCJA_DIR)) {
    for (const sub of fs.readdirSync(DRIVE_PRODUKCJA_DIR)) {
      const subDir = path.join(DRIVE_PRODUKCJA_DIR, sub);
      if (!fs.statSync(subDir).isDirectory()) continue;
      for (const file of fs.readdirSync(subDir)) {
        if (file.startsWith('Ksiega_Rodzaju_') && file.endsWith('_Biblia_Audio_CC.mp3')) {
          if (!mp3Map.has(file)) {
            mp3Map.set(file, path.join(subDir, file));
          }
        }
      }
    }
  }

  const FALLBACK_THEMES = {
    '1_1-19': 'Stworzenie Świata: Dni 1–4',
    '1_20-31_2_1-3': 'Stworzenie Człowieka i Szabat Boży',
    '2_4-25': 'Ogród Eden, Człowiek i Pierwsze Małżeństwo',
    '3_1-24': 'Kuszenie, Upadek Człowieka i Protoewangelia',
    '4_1-26': 'Kain i Abel, Potomkowie Kaina i Narodziny Seta',
    '5_1-32': 'Rodowód od Adama do Noego i Chodzenie Henocha z Bogiem',
    '6_1-22': 'Zepsucie Ziemi, Boża Łaska dla Noego i Nakaz Budowy Arki',
    '7_1-24': 'Wejście do Arki i Wody Potopu na Ziemi',
    '8_1-22': 'Opadnięcie Wód Potopu, Gołębica i Ołtarz Noego',
    '9_1-29': 'Przymierze Tęczy i Błogosławieństwo Noego',
    '10_1-32': 'Tablica Narodów — Potomkowie Sema, Chama i Jafeta',
    '11_1-32': 'Wieża Babel, Pomieszanie Języków i Rodowód Abrama',
    '12_1-20': 'Powołanie Abrama, Przymierze Błogosławieństwa i Próba w Egipcie',
    '13_1-18': 'Rozstanie Abrama z Lotem i Obietnica Ziemi Kanaan',
    '14_1-24': 'Uwolnienie Lota przez Abrama i Błogosławieństwo Melchizedeka',
    '15_1-21': 'Przymierze Boga z Abramem i Usprawiedliwienie z Wiary',
    '16_1-16': 'Hagar na Pustyni, Bóg Widzący i Narodziny Izmaela',
    '17_1-27': 'Przymierze Obrzezania, Nowe Imiona Abraham i Sara oraz Obietnica Izaaka',
    '18_1-33': 'Goście pod Dębami Mamre i Wstawiennicza Modlitwa Abrahama za Sodomą',
    '19_1-38': 'Sąd nad Sodomą i Gomorą oraz Ocalenie Lota',
    '20_1-18': 'Abraham i Sara w Gerarze u Króla Abimeleka',
    '21_1-34': 'Narodziny Izaaka, Oddalenie Hagar i Przymierze w Beer-Szebie',
    '22_1-24': 'Próba Wiary Abrahama na Górze Moria i Jahwe-Jireh',
    '23_1-20': 'Śmierć Sary i Zakup Jaskini Makpela w Hebronie',
    '24_1-67': 'Poszukiwanie Żony dla Izaaka i Rebeka przy Studni',
    '25_1-34': 'Śmierć Abrahama, Narodziny Ezawa i Jakuba oraz Pierworództwo',
    '26_1-35': 'Izaak w Gerarze, Studnie Abrahama i Przymierze w Beer-Szebie',
    '27_1-46': 'Błogosławieństwo Jakuba i Płacz Ezawa',
    '28_1-22': 'Drabina Jakuba w Betel, Przymierze PANA i Ślubowanie',
    '29_1-35': 'Jakub u Labana, Lea i Rachela',
    '30_1-43': 'Narodziny Synów Jakuba i Józefa oraz Błogosławieństwo PANA',
    '31_1-55': 'Powrót Jakuba do Kanaanu i Przymierze w Gilead',
    '32_1-32': 'Modlitwa Jakuba nad Jabbokiem, Walka z Bogiem w Peniel i Nowe Imię Izrael'
  };

  const items = [];
  for (const [mp3File, mp3Path] of mp3Map.entries()) {
    const core = mp3File.replace(/^Ksiega_Rodzaju_/, '').replace(/_Biblia_Audio_CC\.mp3$/, '');
    const parts = core.split('_');
    const chapterNum = Number(parts[0]);
    const versesSlug = parts.slice(1).join('_');

    let code = `GEN-${String(chapterNum).padStart(3, '0')}`;
    if (core === '1_1-19') code = 'GEN-001-A';
    if (core === '1_20-31_2_1-3') code = 'GEN-001-B';

    const metaFileName = `Ksiega_Rodzaju_${core}_metadata.json`;
    const metaPath = path.join(DRIVE_EMISJA_GENESIS_DIR, metaFileName);
    let meta = null;
    if (fs.existsSync(metaPath)) {
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      } catch {}
    }

    const catEntry = catalogByChapter.get(chapterNum);
    const theme = FALLBACK_THEMES[core] || meta?.theme || catEntry?.description || `Księga Rodzaju ${chapterNum}`;
    const verseLabel = core === '1_20-31_2_1-3'
      ? '1:20–31; 2:1–3'
      : `${chapterNum}:${versesSlug.replace(/-/g, '–')}`;

    const spotifyTitle = `Księga Rodzaju ${verseLabel} (UBG) — ${theme} | Biblia Audio CC | polskieradio.cc`;

    const spotifyDescription = meta?.description
      ? meta.description.replace(/\s*\[4K UHD\]/g, '').replace(/film/g, 'odcinek')
      : [
          `📖 ${spotifyTitle}`,
          '',
          catEntry?.description && catEntry.description !== 'Kolejny rozdział Księgi Rodzaju'
            ? catEntry.description
            : `Słuchowisko biblijne Christian Culture — Księga Rodzaju ${verseLabel} (${theme}) w przekładzie Uwspółcześnionej Biblii Gdańskiej (UBG).`,
          '',
          '🌐 OFICJALNY EKOSYSTEM CHRISTIAN CULTURE:',
          '• Słuchaj całej Biblii Audio online: https://polskieradio.cc/biblia-audio',
          '• Interlinearna MojaBiblia z kodami Stronga: https://polskieradio.cc/mojabiblia',
          '• Strona Główna & Radio 24/7: https://polskieradio.cc',
          '• Portal Społecznościowy LUMINA: https://polskieradio.cc/lumina',
          '• Wspieraj Misję CC: https://polskieradio.cc/wspieraj',
          '',
          '🎙️ PRODUKCJA:',
          '• Przekład: Uwspółcześniona Biblia Gdańska (UBG)',
          '• Reżyseria audio & mastering: Christian Culture Studio (-16.0 LUFS Broadcast, 320 kbps)',
          '• Kierownictwo misji: Cezary Rogowski'
        ].join('\n');

    const video4kPath = path.join(DRIVE_EMISJA_GENESIS_DIR, `Ksiega_Rodzaju_${core}_Biblia_Audio_CC_4K.mp4`);
    const shortsPath = path.join(DRIVE_EMISJA_GENESIS_DIR, `Ksiega_Rodzaju_${core}_Biblia_Audio_CC_Shorts_9x16.mp4`);

    const stat = fs.statSync(mp3Path);

    items.push({
      code,
      chapter: chapterNum,
      core,
      verseLabel,
      theme,
      mp3File,
      mp3Path,
      mp3SizeMb: Number((stat.size / (1024 * 1024)).toFixed(2)),
      producedAt: stat.mtime.toISOString(),
      webStatus: catEntry?.status || 'unknown',
      has4kVideo: fs.existsSync(video4kPath),
      hasShortsVideo: fs.existsSync(shortsPath),
      spotifyTitle,
      spotifyDescription
    });
  }

  // Sortowanie chronologiczne
  items.sort((a, b) => {
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return a.code.localeCompare(b.code);
  });

  return items;
}

/**
 * Sprawdza czy dany odcinek V7 znajduje się już na Spotify (po tytule lub kodzie rozdziału)
 */
export function isEpisodeOnSpotify(v7Item, liveEpisodes, localPublished = []) {
  const chapterRegex = new RegExp(`(Księga\\s+Rodzaju|Rodzaju)\\s+${v7Item.chapter}\\b`, 'i');
  for (const ep of liveEpisodes) {
    if (chapterRegex.test(ep.name || '')) {
      if (v7Item.chapter === 1) {
        if (v7Item.code === 'GEN-001-A' && /1[:.,]1[-–]19/.test(ep.name)) return { matched: true, source: 'spotify_live', episode: ep };
        if (v7Item.code === 'GEN-001-B' && /1[:.,]20[-–]31/.test(ep.name)) return { matched: true, source: 'spotify_live', episode: ep };
        if (!/1[:.,](1[-–]19|20[-–]31)/.test(ep.name)) return { matched: true, source: 'spotify_live', episode: ep };
      } else {
        return { matched: true, source: 'spotify_live', episode: ep };
      }
    }
  }
  for (const loc of localPublished) {
    if (loc.code === v7Item.code || loc.mp3File === v7Item.mp3File) {
      return { matched: true, source: 'local_history', episode: loc };
    }
  }
  return { matched: false, source: null, episode: null };
}

/**
 * Pełny audyt zaległości Spotify względem wyprodukowanych odcinków Biblia Audio V7
 */
export async function runSpotifyBacklogAudit({ saveHistory = true } = {}) {
  const live = await fetchLiveSpotifyEpisodes(SHOW_ID);
  const v7Items = buildV7EpisodesInventory();

  let existingLocalPublished = [];
  if (fs.existsSync(HISTORY_PATH)) {
    try {
      const prev = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));
      existingLocalPublished = Array.isArray(prev.v7Published) ? prev.v7Published : [];
    } catch {}
  }

  const backlog = [];
  const publishedV7 = [];

  for (const item of v7Items) {
    const check = isEpisodeOnSpotify(item, live.episodes, existingLocalPublished);
    if (check.matched) {
      publishedV7.push({ ...item, spotifyMatch: check.episode, matchSource: check.source });
    } else {
      backlog.push(item);
    }
  }

  // Podsumowanie serii historycznych na Spotify
  const seriesSummary = {
    przypowiesci: live.episodes.filter((e) => /Przypowieści/i.test(e.name)).length,
    objawienie: live.episodes.filter((e) => /Objawienie/i.test(e.name)).length,
    psalmy: live.episodes.filter((e) => /Psalm/i.test(e.name)).length,
    ewangeliaJana: live.episodes.filter((e) => /Ewangelia Jana/i.test(e.name)).length,
    ksiegaRodzaju: live.episodes.filter((e) => /Rodzaju/i.test(e.name)).length
  };

  const latestOnSpotify = live.episodes[0] || null;

  const historyPayload = {
    version: '1.0.0',
    showId: SHOW_ID,
    showName: 'Biblia Audio Christian Culture',
    creatorsUrl: SHOW_CREATORS_HOME_URL,
    publicUrl: SHOW_PUBLIC_URL,
    auditedAt: new Date().toISOString(),
    liveSpotifyTotalCount: live.totalCount,
    latestOnSpotify,
    seriesSummaryOnSpotify: seriesSummary,
    v7InventoryTotal: v7Items.length,
    v7PublishedCount: publishedV7.length,
    v7BacklogCount: backlog.length,
    v7Published: existingLocalPublished,
    v7Backlog: backlog.map((b) => ({
      code: b.code,
      chapter: b.chapter,
      verseLabel: b.verseLabel,
      theme: b.theme,
      mp3File: b.mp3File,
      mp3SizeMb: b.mp3SizeMb,
      producedAt: b.producedAt,
      webStatus: b.webStatus,
      has4kVideo: b.has4kVideo,
      hasShortsVideo: b.hasShortsVideo,
      spotifyTitle: b.spotifyTitle
    })),
    liveEpisodes: live.episodes
  };

  if (saveHistory) {
    fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(historyPayload, null, 2), 'utf8');
  }

  return {
    historyPayload,
    v7Items,
    backlog,
    publishedV7
  };
}

/**
 * Publikacja pojedynczego odcinka na Spotify for Creators przez Playwright
 */
export async function publishEpisodeToSpotify(episodeItem, { headless = false } = {}) {
  console.log(`\n🎙️ [SPOTIFY] Rozpoczynam publikację odcinka ${episodeItem.code}: ${episodeItem.spotifyTitle}`);
  if (!fs.existsSync(episodeItem.mp3Path)) {
    throw new Error(`Brak pliku MP3: ${episodeItem.mp3Path}`);
  }

  const { ctx, page } = await launchStudio({
    headless
  });

  try {
    await page.goto(SHOW_CREATORS_HOME_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(4000);

    if (page.url().includes('accounts.spotify.com') || page.url().includes('/login')) {
      throw new Error(
        'SPOTIFY_AUTH_REQUIRED: Sesja Spotify for Creators nie jest zalogowana w profilu przeglądarki. Uruchom: node scripts/publish_spotify_biblia_audio.mjs --login'
      );
    }

    // Przejdź do kreatora nowego odcinka
    const newEpBtn = page
      .locator('a[href*="/episode/wizard"], button:has-text("New episode"), button:has-text("Nowy odcinek"), a:has-text("New episode"), a:has-text("Nowy odcinek")')
      .first();
    if (await newEpBtn.isVisible().catch(() => false)) {
      await newEpBtn.click();
    } else {
      await page.goto(SHOW_CREATORS_WIZARD_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    }
    await sleep(4000);

    // 1. Wgraj plik MP3
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: 'attached', timeout: 30000 });
    await fileInput.setInputFiles(episodeItem.mp3Path);
    console.log(`   📤 Wgrano plik MP3: ${episodeItem.mp3File} (${episodeItem.mp3SizeMb} MB)`);
    await sleep(4000);

    // 2. Wypełnij tytuł odcinka
    const titleInput = page
      .locator('input[name="title"], input[placeholder*="title" i], input[placeholder*="tytuł" i], input[id*="title" i]')
      .first();
    await titleInput.waitFor({ state: 'visible', timeout: 30000 });
    await titleInput.fill(episodeItem.spotifyTitle);

    // 3. Wypełnij opis odcinka
    const descEditor = page
      .locator('[contenteditable="true"], textarea[name="description"], textarea[placeholder*="description" i], textarea[placeholder*="opis" i]')
      .first();
    await descEditor.waitFor({ state: 'visible', timeout: 30000 });
    await descEditor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.insertText(episodeItem.spotifyDescription);
    await sleep(2000);

    // 4. Kliknij Next / Dalej (i poczekaj na zakończenie przetwarzania pliku audio)
    const nextBtn = page.locator('button:has-text("Next"), button:has-text("Dalej")').first();
    if (await nextBtn.isVisible().catch(() => false)) {
      for (let i = 0; i < 60; i++) {
        const disabled = await nextBtn.isDisabled().catch(() => false);
        if (!disabled) break;
        await sleep(2000);
      }
      await nextBtn.click();
      await sleep(3000);
    }

    // 5. Kliknij Publish / Opublikuj
    const publishBtn = page
      .locator('button:has-text("Publish"), button:has-text("Opublikuj"), button[type="submit"]:has-text("Publish"), button[type="submit"]:has-text("Opublikuj")')
      .first();
    for (let i = 0; i < 60; i++) {
      const visible = await publishBtn.isVisible().catch(() => false);
      const disabled = await publishBtn.isDisabled().catch(() => true);
      if (visible && !disabled) break;
      await sleep(2000);
    }
    await publishBtn.click();
    await sleep(6000);

    console.log(`   ✅ Opublikowano na Spotify for Creators: ${episodeItem.spotifyTitle}`);

    // Zapisz w historii
    const history = fs.existsSync(HISTORY_PATH)
      ? JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'))
      : { version: '1.0.0', v7Published: [] };
    history.v7Published = Array.isArray(history.v7Published) ? history.v7Published : [];
    history.v7Published.push({
      code: episodeItem.code,
      chapter: episodeItem.chapter,
      mp3File: episodeItem.mp3File,
      spotifyTitle: episodeItem.spotifyTitle,
      publishedAt: new Date().toISOString(),
      url: page.url()
    });
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf8');

    return { ok: true, code: episodeItem.code, url: page.url() };
  } finally {
    await ctx.close();
  }
}

/**
 * Interaktywne logowanie do Spotify for Creators w profilu .youtube_browser_profile
 */
async function runInteractiveLogin() {
  console.log(`\n🔐 [SPOTIFY LOGIN] Otwieram okno Chrome dla Spotify for Creators: ${SHOW_CREATORS_HOME_URL}`);
  console.log('👉 Zaloguj się na konto Spotify powiązane z podcastem "Biblia Audio Christian Culture".');
  const { ctx, page } = await launchStudio({
    headless: false
  });
  try {
    await page.goto(SHOW_CREATORS_HOME_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    for (let i = 0; i < 150; i++) {
      await sleep(2000);
      const url = page.url();
      if (url.includes('creators.spotify.com') && !url.includes('login') && !url.includes('accounts.spotify.com')) {
        console.log(`✅ Zalogowano pomyślnie! Aktywny panel: ${url}`);
        await sleep(3000);
        return;
      }
    }
    console.log('⏳ Upłynął limit czasu oczekiwania na logowanie.');
  } finally {
    await ctx.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isLogin = args.includes('--login');
  const isBatch = args.includes('--batch');
  const epIdx = args.indexOf('--episode');
  const targetEpisodeArg = epIdx !== -1 ? args[epIdx + 1] : null;
  const limitIdx = args.indexOf('--limit');
  const batchLimit = limitIdx !== -1 ? Number(args[limitIdx + 1]) : 5;

  if (isLogin) {
    await runInteractiveLogin();
    return;
  }

  const { historyPayload, backlog } = await runSpotifyBacklogAudit({ saveHistory: true });

  console.log('============================================================================');
  console.log(`🎧 AUDYT SPOTIFY FOR CREATORS — ${historyPayload.showName} (${SHOW_ID})`);
  console.log('============================================================================');
  console.log(`• Odcinków łącznie na Spotify:      ${historyPayload.liveSpotifyTotalCount}`);
  if (historyPayload.latestOnSpotify) {
    console.log(`• Ostatni odcinek na Spotify:       "${historyPayload.latestOnSpotify.name}"`);
    console.log(`• Data ostatniej publikacji:        ${historyPayload.latestOnSpotify.releaseDate}`);
  }
  console.log(`• Rozkład serii na Spotify:         Psalmy: ${historyPayload.seriesSummaryOnSpotify.psalmy}, Ew. Jana: ${historyPayload.seriesSummaryOnSpotify.ewangeliaJana}, Obj. Jana: ${historyPayload.seriesSummaryOnSpotify.objawienie}, Przypowieści: ${historyPayload.seriesSummaryOnSpotify.przypowiesci}, Księga Rodzaju: ${historyPayload.seriesSummaryOnSpotify.ksiegaRodzaju}`);
  console.log(`• Wyprodukowane odcinki V7 (Rdz):   ${historyPayload.v7InventoryTotal}`);
  console.log(`• Opublikowane V7 na Spotify:       ${historyPayload.v7PublishedCount}`);
  console.log(`• ZALEGŁOŚCI DO PUBLIKACJI (V7):    ${historyPayload.v7BacklogCount} odcinków`);
  console.log('----------------------------------------------------------------------------');

  if (backlog.length > 0) {
    console.log('📋 LISTA ZALEGŁYCH ODCINKÓW V7 DO PUBLIKACJI NA SPOTIFY:');
    for (const b of backlog) {
      const flags = [
        `WWW:${b.webStatus}`,
        b.has4kVideo ? '4K:OK' : '4K:BRAK',
        b.hasShortsVideo ? 'Shorts:OK' : 'Shorts:BRAK'
      ].join(' | ');
      console.log(`  [${b.code}] Rdz ${b.verseLabel} — ${b.theme} (${b.mp3SizeMb} MB) [${flags}]`);
    }
  }

  if (targetEpisodeArg) {
    const match = backlog.find(
      (b) =>
        b.code.toLowerCase() === targetEpisodeArg.toLowerCase() ||
        b.mp3File.toLowerCase().includes(targetEpisodeArg.toLowerCase()) ||
        `genesis-${b.chapter}` === targetEpisodeArg.toLowerCase()
    );
    if (!match) {
      console.log(`ℹ️ Odcinek "${targetEpisodeArg}" nie znajduje się na liście zaległości lub jest już opublikowany.`);
      return;
    }
    await publishEpisodeToSpotify(match);
    return;
  }

  if (isBatch) {
    const toPublish = backlog.slice(0, batchLimit);
    console.log(`\n🚀 [BATCH] Publikuję ${toPublish.length} z ${backlog.length} zaległych odcinków...`);
    for (const item of toPublish) {
      await publishEpisodeToSpotify(item);
      await sleep(5000);
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((err) => {
    console.error(`❌ Błąd: ${err.message}`);
    process.exit(1);
  });
}
