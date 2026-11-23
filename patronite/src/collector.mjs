import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

const BLOCKED_INTERNAL_TERMS = /mission\s*control|serviceAccountKey|token|password|apikey/i;

export function sanitizePublicText(text) {
  if (!text) return '';
  if (BLOCKED_INTERNAL_TERMS.test(text)) {
    return String(text)
      .replace(/mission\s*control/gi, 'wewnętrzne zaplecze @ICC')
      .replace(/serviceAccountKey[^\s]*/gi, '[POMINIĘTO]');
  }
  return String(text);
}

function readJsonSafe(absPath) {
  if (!fs.existsSync(absPath)) return null;
  return JSON.parse(fs.readFileSync(absPath, 'utf8'));
}

export function collectAuthorizedSources(repoRoot = DEFAULT_REPO_ROOT, options = {}) {
  const nowIso = new Date().toISOString();
  const todayStr = nowIso.slice(0, 10);
  const rawItems = [];

  // 1. Oficjalny portal polskieradio.cc — Biblia Audio
  const baCatalogPath = path.join(repoRoot, 'biblia-audio', 'data', 'catalog.json');
  const baCatalog = readJsonSafe(baCatalogPath);
  if (Array.isArray(baCatalog)) {
    const published = baCatalog.filter(e => e.status === 'published');
    const inProd = baCatalog.filter(e => e.status === 'in_production');
    const latest = published[published.length - 1];
    rawItems.push({
      id: 'src-biblia-audio-progress',
      priority: 1,
      type: 'public_catalog',
      sourceName: 'polskieradio.cc/biblia-audio',
      sourceRef: 'biblia-audio/data/catalog.json',
      artifactPath: latest?.audioUrl ? latest.audioUrl.replace(/^\//, '') : 'biblia-audio/index.html',
      verifiedDate: latest?.publishedDate || todayStr,
      hasLiveArtifact: fs.existsSync(path.join(repoRoot, 'biblia-audio', 'index.html')),
      isCommitOnly: false,
      isPlanOnly: false,
      seriesPreference: ['mission-report'],
      headlineFact: `Udostępniliśmy już ${published.length} z ${baCatalog.length} rozdziałów Księgi Rodzaju w serii Biblia Audio CC`,
      summaryFact: latest
        ? `Najnowszy opublikowany odcinek to ${latest.title || latest.id} (${latest.passage || ''}) w jakości radiowej z bezpłatnym odsłuchem na stronie oraz na kanałach YouTube Christian Culture.`
        : `Kolejne rozdziały Księgi Rodzaju trafiają bezpłatnie do odtwarzacza Biblia Audio CC.`,
      nextWorkFact: inProd.length > 0
        ? `Obecnie trwa montaż i przygotowanie kolejnych ${inProd.length} rozdziałów (w kolejce produkcyjnej m.in. ${inProd[0].title || inProd[0].id}).`
        : null,
      publicUrl: 'https://polskieradio.cc/biblia-audio',
      photoRelPath: 'images/ogloszenia-sprzet-studio.jpg',
      countPublished: published.length,
      countTotal: baCatalog.length,
    });
  }

  // 2. Kurs Codzienny "Z Biblią za Pan Brat" (/akademia)
  const kcDir = path.join(repoRoot, 'akademia', 'kurscodzienny');
  if (fs.existsSync(kcDir)) {
    const dayFiles = fs.readdirSync(kcDir)
      .filter(f => /^dzien-(\d+)\.html$/.test(f))
      .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
    const latestFile = dayFiles[dayFiles.length - 1];
    const maxDay = dayFiles.length;
    rawItems.push({
      id: 'src-akademia-kurs-codzienny',
      priority: 1,
      type: 'public_page',
      sourceName: 'polskieradio.cc/akademia',
      sourceRef: `akademia/kurscodzienny/${latestFile || 'index.html'}`,
      artifactPath: latestFile ? `akademia/kurscodzienny/${latestFile}` : 'akademia.html',
      verifiedDate: todayStr,
      hasLiveArtifact: Boolean(latestFile) && fs.existsSync(path.join(kcDir, latestFile)),
      isCommitOnly: false,
      isPlanOnly: false,
      seriesPreference: ['mission-report'],
      headlineFact: `W Akademii Biblijnej działa już ${maxDay} lekcji Kursu Codziennego „Z Biblią za Pan Brat”`,
      summaryFact: `Codzienne rozważania prowadzą czytelników krok po kroku przez Pismo Święte z komentarzem praktycznym, modlitwą i możliwością wygodnego udostępniania znajomym.`,
      publicUrl: 'https://polskieradio.cc/akademia',
      photoRelPath: 'images/ogloszenia-tworcy-wolontariat.jpg',
      countPublished: maxDay,
    });
  }

  // 3. CC Pomoc (/help) — 200 stron wsparcia w kryzysie PL/EN
  const helpHtmlExists = fs.existsSync(path.join(repoRoot, 'help.html'));
  const ccPomocDirExists = fs.existsSync(path.join(repoRoot, 'cc-pomoc'));
  const mapData = readJsonSafe(path.join(repoRoot, 'data', 'ecosystem-map.json'));
  const pomocNodes = mapData && Array.isArray(mapData.nodes)
    ? mapData.nodes.filter(n => /CC Pomoc/i.test(n.name || n.label || ''))
    : [];
  if (helpHtmlExists && ccPomocDirExists) {
    rawItems.push({
      id: 'src-cc-pomoc-portal',
      priority: 1,
      type: 'public_page',
      sourceName: 'polskieradio.cc/help',
      sourceRef: 'help.html + cc-pomoc/',
      artifactPath: 'help.html',
      verifiedDate: todayStr,
      hasLiveArtifact: true,
      isCommitOnly: false,
      isPlanOnly: false,
      seriesPreference: ['mission-report'],
      headlineFact: `Uruchomiliśmy dział CC Pomoc z szeroką bazą darmowych przewodników wsparcia kryzysowego`,
      summaryFact: `Na polskieradio.cc/help zgromadziliśmy praktyczne i bezpłatne materiały po polsku i angielsku dla osób zmagających się z samotnością, żałobą, kryzysem emocjonalnym, długami czy pytaniami o wiarę.`,
      publicUrl: 'https://polskieradio.cc/help',
      photoRelPath: 'images/ogloszenia-infolinia-nadzieja.jpg',
      pomocNodesCount: pomocNodes.length,
    });
  }

  // 4. Kanały TV/Radio 24/7 oraz Muzyka CC (topTEN, catalog.json)
  const channelsData = readJsonSafe(path.join(repoRoot, 'data', 'cc-channels.json'));
  const podcastsCatalog = readJsonSafe(path.join(repoRoot, 'data', 'podcasts', 'catalog.json'));
  const channelList = Array.isArray(channelsData?.channels) ? channelsData.channels : [];
  const albumList = Array.isArray(podcastsCatalog?.spotifyAlbums) ? podcastsCatalog.spotifyAlbums : [];
  if (channelList.length > 0 && albumList.length > 0) {
    rawItems.push({
      id: 'src-radio-tv-music-collection',
      priority: 2,
      type: 'public_catalog',
      sourceName: 'polskieradio.cc/player & /topTEN',
      sourceRef: 'data/cc-channels.json + data/podcasts/catalog.json',
      artifactPath: 'topTEN.html',
      verifiedDate: todayStr,
      hasLiveArtifact: fs.existsSync(path.join(repoRoot, 'topTEN.html')) && fs.existsSync(path.join(repoRoot, 'player.html')),
      isCommitOnly: false,
      isPlanOnly: false,
      seriesPreference: ['mission-report'],
      headlineFact: `W katalogu gra już ${channelList.length} kanałów tematycznych i ${albumList.length} albumów muzycznych Christian Culture`,
      summaryFact: `Słuchacze mają bezpłatny dostęp zarówno do radia i telewizji biblijnej 24/7 w odtwarzaczu na polskieradio.cc/player, jak i do albumów uwielbieniowych oraz instrumentalnych publikowanych globalnie.`,
      publicUrl: 'https://polskieradio.cc/topTEN',
      photoRelPath: 'images/ogloszenia-widget-radio.webp',
      channelCount: channelList.length,
      albumCount: albumList.length,
    });
  }

  // 5. Kulisy prac w ekosystemie i portale wiedzy CCN (Mapa Ekosystemu + publiczne portale)
  const ccnNewsExists = fs.existsSync(path.join(repoRoot, 'news.html'));
  const vodExists = fs.existsSync(path.join(repoRoot, 'vod.html'));
  const updatesLog = Array.isArray(mapData?.updatesLog) ? mapData.updatesLog : [];
  const latestNonRoutine = updatesLog
    .filter(u => !/Cykliczna emisja|rotacyjna promocja|Mission Control/i.test(u.topic || ''))
    .slice(0, 6);

  if (ccnNewsExists && vodExists && mapData) {
    rawItems.push({
      id: 'src-behind-scenes-audio-vod-ccn',
      priority: 2,
      type: 'public_ecosystem',
      sourceName: 'polskieradio.cc/vod & /news',
      sourceRef: 'data/ecosystem-map.json + vod.html + news.html',
      artifactPath: 'vod.html',
      verifiedDate: latestNonRoutine[0]?.date || todayStr,
      hasLiveArtifact: true,
      isCommitOnly: false,
      isPlanOnly: false,
      seriesPreference: ['behind-the-scenes'],
      headlineFact: `Jak powstają słuchowiska Biblia Audio, wykłady Studio Dobrego Słowa i artykuły CCN News`,
      summaryFact: `Za każdym opublikowanym odcinkiem kryje się wieloetapowa praca: weryfikacja wersetów w Uwspółcześnionej Biblii Gdańskiej, montaż i wyrównanie dźwięku, przygotowanie oprawy graficznej oraz testy działania na telefonach.`,
      publicUrl: 'https://polskieradio.cc/vod',
      photoRelPath: 'images/ogloszenia-sprzet-studio.jpg',
    });

    rawItems.push({
      id: 'src-behind-scenes-mobile-lumina-care',
      priority: 2,
      type: 'public_ecosystem',
      sourceName: 'polskieradio.cc/lumina & /mapa',
      sourceRef: 'lumina.html + data/ecosystem-map.json',
      artifactPath: 'lumina.html',
      verifiedDate: todayStr,
      hasLiveArtifact: fs.existsSync(path.join(repoRoot, 'lumina.html')) && fs.existsSync(path.join(repoRoot, 'mapa.html')),
      isCommitOnly: false,
      isPlanOnly: false,
      seriesPreference: ['behind-the-scenes'],
      headlineFact: `Upraszczamy ekosystem ${mapData.nodes?.length || 195} modułów, aby wszystko działało płynnie na każdym smartfonie`,
      summaryFact: `Rozwój kilkunastu portali naraz niesie ryzyko drobnych błędów wyświetlania. Dlatego po cichu porządkujemy nawigację, przyciski dotykowe i automatyczne testy jakości przed każdą aktualizacją na polskieradio.cc.`,
      publicUrl: 'https://polskieradio.cc/mapa',
      photoRelPath: 'images/ogloszenia-dom-studio.jpg',
    });
  }

  // 5b. Dodatkowe zweryfikowane projekty ekosystemu (aby darczyńcy Patronite i Zrzutka.pl poznali cały dorobek CC)
  if (fs.existsSync(path.join(repoRoot, 'mojabiblia.html'))) {
    rawItems.push({
      id: 'src-mojabiblia-interlinearna',
      priority: 2,
      type: 'public_page',
      sourceName: 'polskieradio.cc/mojabiblia',
      sourceRef: 'mojabiblia.html + data/bible/szukaj-ubg.json',
      artifactPath: 'mojabiblia.html',
      verifiedDate: todayStr,
      hasLiveArtifact: true,
      isCommitOnly: false,
      isPlanOnly: false,
      seriesPreference: ['mission-report'],
      headlineFact: `MojaBiblia Interlinearna udostępnia 4 polskie przekłady Pisma Świętego, kody Stronga oraz nowy tryb Czytnika`,
      summaryFact: `Na polskieradio.cc/mojabiblia każdy może bezpłatnie czytać Biblię w czystym Czytniku lub badać oryginalny tekst grecki i hebrajski z kodami Stronga i porównaniem UBG, BW, BT oraz BG.`,
      publicUrl: 'https://polskieradio.cc/mojabiblia',
      photoRelPath: 'images/ogloszenia-biblia-gdanska.jpg',
    });
  }

  if (fs.existsSync(path.join(repoRoot, 'aplikacje', 'index.html'))) {
    rawItems.push({
      id: 'src-aplikacje-centrum',
      priority: 2,
      type: 'public_page',
      sourceName: 'polskieradio.cc/aplikacje',
      sourceRef: 'aplikacje/index.html',
      artifactPath: 'aplikacje/index.html',
      verifiedDate: todayStr,
      hasLiveArtifact: true,
      isCommitOnly: false,
      isPlanOnly: false,
      seriesPreference: ['mission-report'],
      headlineFact: `Centrum Aplikacji Christian Culture gromadzi w jednym miejscu nasze bezpłatne narzędzia mobilne i webowe`,
      summaryFact: `Pod adresem polskieradio.cc/aplikacje udostępniliśmy przejrzysty katalog bezpłatnych aplikacji na telefon i komputer — od codziennych rozważań i odtwarzacza radia 24/7 po narzędzia biblijne.`,
      publicUrl: 'https://polskieradio.cc/aplikacje',
      photoRelPath: 'images/ogloszenia-widget-radio.webp',
    });
  }

  if (ccnNewsExists) {
    rawItems.push({
      id: 'src-ccn-news-portale',
      priority: 2,
      type: 'public_page',
      sourceName: 'polskieradio.cc/news',
      sourceRef: 'news.html + data/ccn-article-routes.js',
      artifactPath: 'news.html',
      verifiedDate: todayStr,
      hasLiveArtifact: true,
      isCommitOnly: false,
      isPlanOnly: false,
      seriesPreference: ['mission-report'],
      headlineFact: `CCN News i 20 portali tematycznych budują rzetelną chrześcijańską publicystykę bez reklam i klikbajtu`,
      summaryFact: `Na polskieradio.cc/news oraz w działach Nauka, Historia, Biologia, Prawo i Rodzina publikujemy pogłębione, weryfikowane artykuły pomagające patrzeć na współczesny świat w świetle Pisma Świętego.`,
      publicUrl: 'https://polskieradio.cc/news',
      photoRelPath: 'images/ogloszenia-tworcy-wolontariat.jpg',
    });
  }

  if (fs.existsSync(path.join(repoRoot, 'wspieramto.html'))) {
    rawItems.push({
      id: 'src-behind-scenes-nowe-studio-rtv',
      priority: 3,
      type: 'public_ecosystem',
      sourceName: 'polskieradio.cc/wspieramto',
      sourceRef: 'wspieramto.html',
      artifactPath: 'wspieramto.html',
      verifiedDate: todayStr,
      hasLiveArtifact: true,
      isCommitOnly: false,
      isPlanOnly: false,
      seriesPreference: ['behind-the-scenes'],
      headlineFact: `Na co idą środki darczyńców: utrzymanie mediów 24/7 oraz przygotowania do budowy nowego studia RTV`,
      summaryFact: `Na polskieradio.cc/wspieramto pokazujemy jasno, jak wsparcie darczyńców przekłada się na pracę serwerów, codzienną produkcję Biblii Audio i konsekwentne budowanie własnego studia radiowo-telewizyjnego.`,
      publicUrl: 'https://polskieradio.cc/wspieramto',
      photoRelPath: 'images/ogloszenia-dom-studio.jpg',
    });
  }

  if (fs.existsSync(path.join(repoRoot, 'lumina.html'))) {
    rawItems.push({
      id: 'src-behind-scenes-lumina-spolecznosc',
      priority: 3,
      type: 'public_ecosystem',
      sourceName: 'polskieradio.cc/lumina',
      sourceRef: 'lumina.html + lumina-tablica.html',
      artifactPath: 'lumina.html',
      verifiedDate: todayStr,
      hasLiveArtifact: true,
      isCommitOnly: false,
      isPlanOnly: false,
      seriesPreference: ['behind-the-scenes'],
      headlineFact: `Rozwijamy portal społecznościowy LUMINA — bezpieczną przestrzeń rozmowy, modlitwy i świadectw bez reklam`,
      summaryFact: `W portalu LUMINA (polskieradio.cc/lumina) budujemy spokojną alternatywę dla komercyjnych sieci społecznościowych: tablicę świadectw, profile twórców oraz czat wspólnotowy bez algorytmów podkręcających emocje.`,
      publicUrl: 'https://polskieradio.cc/lumina',
      photoRelPath: 'images/ogloszenia-tworcy-wolontariat.jpg',
    });
  }

  // 6. Wersety UBG na piątki ("DZIĘKI, ŻE JESTEŚ") — weryfikowane 1:1 z kanonicznego szukaj-ubg.json
  const wersetData = readJsonSafe(path.join(repoRoot, 'data', 'werset_dnia_365_ubg.json'));
  const szukajUbg = readJsonSafe(path.join(repoRoot, 'data', 'bible', 'szukaj-ubg.json'));
  const getCanonicalVerseText = (bookCode, ch, vs) => {
    if (!szukajUbg) return null;
    const bIdx = szukajUbg.b.indexOf(bookCode);
    if (bIdx < 0) return null;
    const row = szukajUbg.r.find(r => r[0] === bIdx && r[1] === Number(ch) && r[2] === Number(vs));
    return row ? String(row[3]).trim() : null;
  };
  const bibleVersesPool = Array.isArray(wersetData?.verses)
    ? wersetData.verses.filter(v => ['Księga Psalmów', 'Ewangelia Jana', 'List do Rzymian', 'Księga Izajasza', 'List do Filipian'].includes(v.book))
    : [];

  const pickedThankYou = [];
  const preferredOrder = ['PSA', 'ISA', 'ROM', 'JHN', 'PHP', 'PSA'];
  for (const code of preferredOrder) {
    const match = bibleVersesPool.find(v => v.bookCode === code && !pickedThankYou.some(p => p.day === v.day))
      || bibleVersesPool.find(v => !pickedThankYou.some(p => p.day === v.day));
    if (match) pickedThankYou.push(match);
  }

  const thankYouPhotos = [
    'images/ogloszenia-biblia-gdanska.jpg',
    'images/ogloszenia-hero.jpg',
    'images/ogloszenia-infolinia-nadzieja.jpg',
  ];

  pickedThankYou.forEach((verseEntry, idx) => {
    const canonicalText = getCanonicalVerseText(verseEntry.bookCode, verseEntry.chapter, verseEntry.verses[0]);
    if (!canonicalText) return;
    const isPrimaryPair = idx < 2;
    const useWersetPage = idx % 2 === 1;
    rawItems.push({
      id: `src-thankyou-bible-${verseEntry.bookCode}-${verseEntry.chapter}-${verseEntry.verses[0]}`,
      priority: isPrimaryPair ? 1 : 2,
      type: 'verified_scripture_reflection',
      sourceName: useWersetPage
        ? 'Uwspółcześniona Biblia Gdańska (polskieradio.cc/werset-dnia)'
        : 'Uwspółcześniona Biblia Gdańska (polskieradio.cc/mojabiblia)',
      sourceRef: `data/bible/szukaj-ubg.json#${verseEntry.bookCode}:${verseEntry.chapter}:${verseEntry.verses[0]}`,
      artifactPath: useWersetPage ? 'werset-dnia.html' : 'mojabiblia.html',
      verifiedDate: todayStr,
      hasLiveArtifact: useWersetPage
        ? (fs.existsSync(path.join(repoRoot, 'werset-dnia.html')) || fs.existsSync(path.join(repoRoot, 'werset-dnia', 'index.html')))
        : fs.existsSync(path.join(repoRoot, 'mojabiblia.html')),
      isCommitOnly: false,
      isPlanOnly: false,
      seriesPreference: ['thank-you'],
      headlineFact: idx % 2 === 0
        ? `Wdzięczność za wspólne niesienie Słowa Bożego przed nadchodzącym szabatem (${verseEntry.book} ${verseEntry.chapter}:${verseEntry.verses[0]})`
        : `Nadzieja w Chrystusie i spokojne wejście w dzień Pańskiego odpoczynku (${verseEntry.book} ${verseEntry.chapter}:${verseEntry.verses[0]})`,
      summaryFact: `W hałasie codziennych spraw wracamy do tego, co nie przemija: do wierności Zbawiciela oraz obietnic z księgi ${verseEntry.book}.`,
      publicUrl: useWersetPage ? 'https://polskieradio.cc/werset-dnia' : 'https://polskieradio.cc/mojabiblia',
      photoRelPath: thankYouPhotos[idx % thankYouPhotos.length],
      scripture: {
        book: verseEntry.book,
        bookCode: verseEntry.bookCode,
        chapter: verseEntry.chapter,
        verse: verseEntry.verses[0],
        reference: `${verseEntry.book} ${verseEntry.chapter}:${verseEntry.verses[0]}`,
        text: canonicalText,
        translation: 'Uwspółcześniona Biblia Gdańska (UBG)',
      },
    });
  });

  // 7. Rejestr ostatnich commitów Git (TYLKO informacyjnie jako W TRAKCIE, nigdy dowód zakończenia!)
  if (options.includeGitLog !== false) {
    try {
      const logOut = execFileSync('git', ['log', '-n', '8', '--pretty=format:%h|%cs|%s'], {
        cwd: repoRoot,
        encoding: 'utf8',
        windowsHide: true,
      });
      for (const line of logOut.split('\n').filter(Boolean)) {
        const [hash, date, msg] = line.split('|');
        rawItems.push({
          id: `git-commit-${hash}`,
          priority: 5,
          type: 'git_commit_only',
          sourceName: `GitHub repo log (${hash})`,
          sourceRef: `git:${hash}`,
          verifiedDate: date || todayStr,
          hasLiveArtifact: false,
          isCommitOnly: true,
          isPlanOnly: false,
          seriesPreference: [],
          headlineFact: sanitizePublicText(msg),
          summaryFact: sanitizePublicText(msg),
          publicUrl: 'https://polskieradio.cc',
        });
      }
    } catch {
      // Pomijamy brak gita w izolowanym środowisku testowym
    }
  }

  const snapshot = {
    collectedAt: nowIso,
    sourcesCount: rawItems.length,
    items: rawItems.map(item => ({
      ...item,
      headlineFact: sanitizePublicText(item.headlineFact),
      summaryFact: sanitizePublicText(item.summaryFact),
      nextWorkFact: item.nextWorkFact ? sanitizePublicText(item.nextWorkFact) : null,
    })),
  };

  if (options.saveSnapshot !== false) {
    const outPath = path.join(repoRoot, 'patronite', 'sources', 'latest-snapshot.json');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), 'utf8');
  }

  return snapshot;
}
