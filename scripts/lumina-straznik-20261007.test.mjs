// Regresje naprawione 2026-10-07 (Strażnik Standardów): miganie tablicy, podmiana tożsamości,
// zmyślone dane, fałszywe reakcje, kod „7777”, kreator profilu. Każdy test = realny błąd z produkcji.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

test('karty odkrywania nie pokazują sztywnych procentów bez obliczenia', async () => {
  const html = await readFile('lumina.html', 'utf8');
  assert.doesNotMatch(html, /<div class="card-match"[^>]*>\d+%(?: MATCH)?<\/div>/);
  assert.doesNotMatch(html, /f\.matchScore\?\.stringValue \|\| '\d+%'/);
  assert.match(html, /window\.calculateProfileMatchScore\(p\)/);
  assert.match(html, /\$\{liveScore\}<\/div>/);
});

const read = (f) => readFile(f, 'utf8');
const htmlFiles = async () => (await readdir('.')).filter((f) => /^lumina.*\.html$/.test(f) && !f.includes('backup'));

test('nagłówek gościa ma niezależne od JS wejście do tablicy i logowania', async () => {
  const html = await read('lumina.html');
  const start = html.indexOf('id="luminaGuestNav"');
  assert.ok(start > 0, 'Brak publicznej nawigacji w nagłówku');
  const guestNav = html.slice(start, html.indexOf('</div>', start));
  assert.match(guestNav, /href="\/tablica"/);
  assert.match(guestNav, /id="authCtaBtn" href="\/lumina-login"/);
  assert.match(guestNav, /aria-label="Zaloguj się do LUMINA"/);
  assert.equal((guestNav.match(/min-height:44px/g) || []).length, 2);
  assert.equal((html.match(/id="authCtaBtn"/g) || []).length, 1);
});

test('jedna instancja modułów lumina-db/lumina-core (różne ?v= = kilka kopii w przeglądarce)', async () => {
  const files = [...await htmlFiles(), 'lumina-core.js', 'lumina-tablica.js', 'lumina-security.js', 'js/cc-global-auth.js'];
  const versions = new Set();
  for (const f of files) {
    const src = await read(f);
    for (const m of src.matchAll(/['"](?:\.{0,2}\/)?lumina-(?:db|core)\.js(\?v=[^'"]*)?['"]/g)) versions.add(m[1] || '(bez wersji)');
  }
  assert.equal(versions.size, 1, `Znaleziono różne wersje: ${[...versions].join(', ')}`);
});

test('tablica nie tasuje się i nie przerysowuje przy każdej zmianie danych', async () => {
  const t = await read('lumina-tablica.html');
  assert.match(t, /window\.luminaApplyStableHtml\(container, __luminaFeedHtml\)/);
  assert.doesNotMatch(t, /const uid = 'fc' \+ Date\.now\(\)/);
  assert.match(t, /window\.__luminaFeedVisitSeed/);
  assert.match(t, /<script src="js\/lumina-stable-render\.js\?v=/);
});

test('karuzela „Poznajmy się bliżej” bez logotypów marek', async () => {
  const t = await read('lumina-tablica.html');
  const start = t.indexOf('(function initStaticProfilesCarousel()');
  const block = t.slice(start, t.indexOf('function run()', start));
  assert.doesNotMatch(block, /logo_(radio_cc|cctv|cc_women|cc_men|osobowosc_plus)/);
  assert.match(t, /window\.getLuminaCarouselPeople/);
});

test('polubienia i Amen zapisywane w bazie, bez fałszywego komunikatu', async () => {
  const t = await read('lumina-tablica.html');
  assert.match(t, /function toggleFeedLike\(btn\) \{ luminaReactOnPost\(btn, 'likes'/);
  assert.doesNotMatch(t, /Twoje AMEN zostało dodane/);
  const db = await read('lumina-db.js');
  assert.match(db, /export async function toggleLuminaPostReaction/);
  const rules = await read('firestore.rules');
  assert.match(rules, /match \/lumina_post_reactions\/\{reactionId\}/);
});

test('brak uniwersalnego kodu 7777 otwierającego panel właściciela', async () => {
  for (const f of ['lumina-profile.html', 'lumina.cezaryrgowski.html', 'lumina.wiolettarogowska.html']) {
    const src = await read(f);
    assert.doesNotMatch(src, /entered === '7777'/, f);
    assert.doesNotMatch(src, /params\.get\('access'\) === 'granted'/, f);
  }
});

test('nowy profil bez zmyślonych danych (miasto, liczniki, 100% dopasowania)', async () => {
  const db = await read('lumina-db.js');
  assert.doesNotMatch(db, /'Warszawa, Polska'/);
  assert.doesNotMatch(db, /matchScore: '100%'/);
  assert.match(db, /export function detectLuminaOfficialIdentity/);
  assert.doesNotMatch(db, /user\.email\.includes\('czarkes'\)/);
});

test('kreator profilu wymaga prawdziwego zdjęcia i jest podpięty', async () => {
  const w = await read('js/lumina-onboarding.js');
  assert.match(w, /completeOwnLuminaProfile/);
  assert.match(w, /capture="user"/);
  for (const f of ['lumina-tablica.html', 'lumina.html', 'lumina-profile.html']) {
    assert.match(await read(f), /js\/lumina-onboarding\.js\?v=/, f);
  }
});

test('gość nie jest pokazywany jako zalogowany Założyciel (nagłówek z kopii profilu w pamięci)', async () => {
  const a = await read('js/cc-global-auth.js');
  const fn = a.slice(a.indexOf('function getStoredUserData()'), a.indexOf('// 4. Uniwersalne Logowanie Google'));
  assert.doesNotMatch(fn, /lumina_profile_cezaryrgowski/);
  assert.doesNotMatch(fn, /nazirczarkes@gmail\.com/);
  assert.match(fn, /lumina_user_session'\) !== 'active'/);
});

const CHANNELS = ['zapolske-live.html', 'cctv24.html', 'cctv24-pl.html', 'cctv24-global.html', 'cctv24-worship-live.html', 'cctv24-worship.html', 'biblia-spiewana-live.html'];

test('kanały: bez zmyślonej pogody, dane z jednego zapytania Open-Meteo', async () => {
  for (const f of CHANNELS) {
    const src = await read(f);
    assert.doesNotMatch(src, /\d+°C \/ [A-ZŁ]/, f);
    assert.match(src, /latitude=\$\{lat\}&longitude=\$\{lon\}/, f);
  }
});

test('kanały: Mission Control czytany z projektu cc-mission-control', async () => {
  for (const f of CHANNELS) {
    const src = await read(f);
    assert.doesNotMatch(src, /doc\(db, "mission_control_live"/, f);
    assert.match(src, /cc-live-mission-feed\.js/, f);
  }
  assert.match(await read('js/cc-live-mission-feed.js'), /projectId: 'cc-mission-control'/);
});

test('kanały: intencje modlitwy tylko zatwierdzone (zgodne z regułami bazy)', async () => {
  for (const f of CHANNELS) {
    const src = await read(f);
    for (const m of src.matchAll(/collection\(db, "prayer_intentions"\)[^;]*/g)) assert.match(m[0], /where\("approved", "==", true\)/, f);
  }
});

test('pasek wiadomości: świeże nagłówki z serwera, nie plik sprzed tygodni', async () => {
  assert.match(await read('_worker.js'), /url\.pathname === '\/news\.json'/);
  assert.equal((await read('news.json')).trim(), '[]');
});

test('Za Polską: inicjalizacja kanału nie przerywa się na brakującej liście dni, RDS nie jest nadpisywany', async () => {
  const z = await read('zapolske-live.html');
  assert.match(z, /if \(daySelect\) daySelect\.innerHTML = "";/);
  assert.match(z, /if \(daySelect\) daySelect\.value = currentDayIndex;/);
  const i = z.indexOf('fetch("rozwazania_baza.json');
  assert.doesNotMatch(z.slice(i, i + 6000), /data\.tickerMessage/);
});

test('kanały: komunikat Mission Control trafia na pasek od razu (loadNewsMarquee dostępne globalnie)', async () => {
  for (const f of ['zapolske-live.html', 'cctv24.html', 'cctv24-pl.html', 'cctv24-global.html', 'cctv24-worship-live.html', 'cctv24-worship.html', 'biblia-spiewana-live.html']) {
    assert.match(await read(f), /window\.loadNewsMarquee = loadNewsMarquee/, f);
  }
});

test('Ambient Sleep: start bez klikania w OBS i strażnik dźwięku', async () => {
  const a = await read('ambient-sleep-live.html');
  assert.match(a, /window\.obsstudio/);
  assert.match(a, /audioCtx\.resume\(\)\.catch/);
  assert.match(a, /ponawiam pobranie/);
});

test('DZJ pionowy: ponowne łączenie strumienia, aktualna ramówka, bez letnich haseł', async () => {
  const d = await read('dzj-vertical-live.html');
  assert.match(d, /brak danych > 20 s/);
  assert.doesNotMatch(d, /Boże Wakacje/);
  assert.doesNotMatch(d, /SMS dla Subskrybentów/);
  assert.doesNotMatch(d, /toISOString\(\)\.split\("T"\)/);
  assert.match(d, /cc-live-mission-feed\.js/);
});

test('Master: ramówka odświeża się co dzień, zawieszone przejście i pusty kanał są naprawiane', async () => {
  const m = await read('master-live.html');
  assert.match(m, /earlyFinishedSlots = \{\}; \}/);
  assert.match(m, /przejście zawisło/);
  assert.match(m, /kanał nie odpowiada/);
});

test('Shorts Live: bez symulowanego licznika słuchaczy', async () => {
  for (const f of ['stream-scene-vertical.html', 'stream-scene.html']) {
  const v = await read(f);
  assert.doesNotMatch(v, /let audience = \d+/);
  assert.doesNotMatch(v, /osób słuchających teraz/);
  }
});

test('licznik /milion: jedna akcja danego rodzaju na osobę dziennie', async () => {
  const w = await read('_worker.js');
  assert.match(w, /INSERT OR IGNORE INTO milion_seen/);
  assert.match(await read('milion.html'), /body: JSON\.stringify\(\{ type:/);
});

test('brak odwołań do nieistniejących grafik na tablicy i w Rolkach', async () => {
  for (const f of ['lumina-tablica.html', 'rolki.html', 'data/shorts/shorts_feed.json', 'lumina-db.js']) {
    const s = await read(f);
    assert.doesNotMatch(s, /randki_malzenstwo_plakat_hq|tlo_cctv\.jpg|logo_christian_culture_small|[^_\w]avatar_wioletta\.jpg/, f);
  }
});

test('tablica: miejsce na mobilny pasek logowania rezerwowane od początku (bez skoku układu)', async () => {
  assert.match(await read('lumina-tablica.html'), /html:not\(\.cc-authed\) nav\.lumina-nav\{margin-bottom:42px\}/);
});

test('widget: nagłówek mieści się na telefonie', async () => {
  assert.match(await read('widget.html'), /header a\[download\] span \{ display: none; \}/);
});

test('karuzela „Poznajmy się bliżej”: wszyscy członkowie, zdjęcie użytkownika, logo LUMINA w ostateczności', async () => {
  const db = await readFile('lumina-db.js', 'utf8');
  const fn = db.slice(db.indexOf('export function getCommunityCarouselProfiles'), db.indexOf('export async function completeOwnLuminaProfile'));
  assert.doesNotMatch(fn, /hasRealPhoto/);
  assert.match(fn, /LUMINA_CAROUSEL_FALLBACK_AVATAR/);
  assert.match(fn, /isLuminaRealPersonPhoto\(p\.avatar, slug\)/);
  const people = await readFile('js/lumina-community-people.js', 'utf8');
  assert.match(people, /window\.luminaCarouselAvatarFallback/);
  assert.doesNotMatch(people, /MIN_CARDS/);
  for (const f of ['lumina-tablica.html', 'lumina-tablica-light.html']) {
    const t = await readFile(f, 'utf8');
    assert.doesNotMatch(t, /profile-carousel-card'\)\.style\.display='none'/, `${f}: karta znika zamiast pokazać logo`);
    assert.match(t, /luminaCarouselAvatarFallback/);
    assert.match(t, /js\/lumina-community-people\.js\?v=20261011_all_members1/);
  }
  const img = await readFile('images/lumina-avatar-zastepczy.jpg');
  assert.ok(img.length > 1000 && img.length < 60000);
});

test('jeden przycisk „do góry” i karta transmisji bez powtórzeń', async () => {
  const top = await readFile('js/cc-back-to-top.js', 'utf8');
  assert.match(top, /#luminaScrollTop\{display:none!important\}/);
  const css = await readFile('css/lumina-profile-standard.css', 'utf8');
  for (const t of [css, await readFile('lumina-tablica.html', 'utf8')]) {
    assert.match(t, /\.mission-live-broadcast-card \.post-header \.post-time \{ display: none !important; \}/);
    assert.match(t, /\.btn-expand-live\) > span \{ display: none !important; \}/);
  }
});

test('odznaki się zdobywa: brak kompletu na start, bez dopisku „3D”', async () => {
  const db = await readFile('lumina-db.js', 'utf8');
  const fn = db.slice(db.indexOf('export function getUserBadges'), db.indexOf('export function render3DBadgesGridHtml'));
  assert.doesNotMatch(fn, /Standardowe odznaki dla aktywnych członków/);
  assert.doesNotMatch(fn, /LUMINA_BADGES_CATALOG\['prayer_flame'\]/);
  assert.match(fn, /prof\.badges/);
  const render = db.slice(db.indexOf('export function render3DBadgesGridHtml'), db.indexOf('export function ensure3DBadgeModalInDom'));
  assert.match(render, /is-locked/);
  assert.match(render, /Do zdobycia/);
  assert.doesNotMatch(render, /Odznaki 3D/);
  for (const f of ['lumina.cezaryrgowski.html', 'lumina.wiolettarogowska.html', 'lumina-profile.html']) {
    assert.doesNotMatch(await readFile(f, 'utf8'), /<span class="tab-text">Odznaki 3D<\/span>/, f);
  }
});

test('profile bez „????” w miejscu emoji i polskich liter; jeden dok skrótów zamiast trzech pływających przycisków', async () => {
  for (const f of ['lumina.mariusz.html', 'lumina.magdalena.html']) {
    const t = await readFile(f, 'utf8');
    assert.doesNotMatch(t, /[A-Za-z!.] \?{2,}/, `${f}: zostały znaki „??”`);
  }
  const mag = await readFile('lumina.magdalena.html', 'utf8');
  assert.match(mag, /Szczęść Boże wszystkim!/);
  assert.doesNotMatch(mag, /spo\?eczno/);
  const top = await readFile('js/cc-back-to-top.js', 'utf8');
  assert.match(top, /function mountFabDock\(\)/);
  assert.match(top, /cc-fab-dock-on:not\(\.cc-fab-dock-open\)/);
  const css = await readFile('css/lumina-profile-standard.css', 'utf8');
  assert.match(css, /\.hero-bio-quote \{ color: #44403c !important; \}/);
});

test('bez paska „Status Ochrony” i bez kodów PIN; zachęta do zdjęcia profilowego', async () => {
  for (const f of ['lumina-profile.html', 'lumina.wiolettarogowska.html', 'lumina.magdalena.html', 'lumina.cezaryrgowski.html']) {
    const t = await readFile(f, 'utf8');
    assert.doesNotMatch(t, /id="profileSecurityBar"/, f);
    assert.doesNotMatch(t, /[Dd]omyślny:? 7777/, f);
  }
  assert.doesNotMatch(await readFile('lumina.magdalena.html', 'utf8'), /pin === '0455'/);
  const nudge = await readFile('js/lumina-photo-nudge.js', 'utf8');
  assert.match(nudge, /getLuminaProfileCompletion\(profile\)\.missing\.indexOf\('photo'\)/);
  assert.match(nudge, /openLuminaProfileWizard/);
  for (const f of ['lumina.html', 'lumina-tablica.html', 'lumina-profile.html']) {
    assert.match(await readFile(f, 'utf8'), /\/js\/lumina-photo-nudge\.js\?v=/, f);
  }
});

test('każde włączenie Radia CC w ekosystemie zasila licznik /milion', async () => {
  const top = await readFile('js/cc-back-to-top.js', 'utf8');
  assert.match(top, /\/js\/cc-radio-milion\.js\?v=/);
  const radio = await readFile('js/cc-radio-milion.js', 'utf8');
  assert.match(radio, /zeno\\\.fm/);
  assert.match(radio, /addEventListener\('playing'[^]*?, true\)/);
  assert.match(radio, /type: 'radio'/);
  assert.match(radio, /\/api\/milion\/count/);
});

test('widgety i odtwarzacze osadzone także zasilają licznik /milion', async () => {
  for (const f of ['embed/bar.html', 'embed/player.html', 'radio_christian_culture_widget.html']) {
    assert.match(await readFile(f, 'utf8'), /https:\/\/polskieradio\.cc\/js\/cc-radio-milion\.js\?v=/, f);
  }
  for (const f of ['widget.html', 'widget/index.html']) {
    assert.match(await readFile(f, 'utf8'), /cc-radio-milion\.js\?v=[^"]*" defer><\\\/script>`;/, f);
  }
  const radio = await readFile('js/cc-radio-milion.js', 'utf8');
  assert.match(radio, /https:\/\/polskieradio\.cc\/api\/milion\/count/);
  assert.match(radio, /type: 'text\/plain'/);
});

test('powitanie członka na /lumina nie chowa się pod tłem nagłówka (brak pustej przestrzeni)', async () => {
  const t = await readFile('lumina.html', 'utf8');
  assert.match(t, /#luminaMemberWelcome\.lumina-member-welcome \{ position: relative; z-index: 6;/);
});

test('profil nie zawiesza się po kliknięciu, wsparcie na górnej belce, czytelny jasny motyw tablicy', async () => {
  for (const f of ['lumina.cezaryrgowski.html', 'lumina.wiolettarogowska.html', 'lumina-profile.html']) {
    const t = await readFile(f, 'utf8');
    assert.match(t, /if \(stream\.__ccFeedHtml === __ccFeedHtml\) return;/, f);
    assert.doesNotMatch(t, /stream\.innerHTML = posts\.map\(/, f);
  }
  const css = await readFile('css/lumina-profile-standard.css', 'utf8');
  assert.doesNotMatch(css, /data-lumina-theme="light"\][^\n]*\[style\*=/);
  for (const f of ['lumina.html', 'lumina-tablica.html', 'lumina-tablica-light.html']) {
    const t = await readFile(f, 'utf8');
    assert.match(t, /id="lumina-light-fixes-20261011"/, f);
    assert.match(t, /S\.openModal\(\)/, f);
  }
  const top = await readFile('js/cc-back-to-top.js', 'utf8');
  assert.match(top, /--cc-dock-r', 'max\(16px, env\(safe-area-inset-right\)\)'/);
});

test('strona główna członka według makiety: skróty, Polecane, Ostatnie posty; goście bez zmian', async () => {
  const t = await readFile('lumina.html', 'utf8');
  assert.match(t, /\/js\/lumina-member-home\.js\?v=/);
  assert.match(t, /js\/lumina-community-people\.js\?v=/);
  const home = await readFile('js/lumina-member-home.js', 'utf8');
  for (const s of ['Społeczność', 'Modlitwa', 'Małżeństwo', 'Świadectwa', 'Polecane', 'Ostatnie posty']) assert.ok(home.includes(s), s);
  assert.match(home, /if \(!member\(\)\)/);
  assert.match(home, /lumina-avatar-zastepczy/);
  // callback z pamięci podręcznej jest synchroniczny — znacznik musi być ustawiony przed subskrypcją (inaczej pętla)
  assert.match(home, /feedUnsub = function \(\) \{\};\s*var unsub = window\.LuminaDB\.subscribeToFeedPosts/);
  assert.doesNotMatch(home, /subscribeToFeedPosts\(function \(posts\) \{\s*lastPosts = posts;\s*render\(\);/);
  assert.match(t, /id="heroGuestCta"/);
});

test('dolny pasek: podpisy pod ikonami i środkowy „+” do napisania posta; dok pływający bez drugiego „+”', async () => {
  const nav = await readFile('lumina-bottom-nav.js', 'utf8');
  assert.match(nav, /id="navTabCompose" aria-label="Napisz post"/);
  for (const l of ['Start', 'Tablica', 'Rolki', 'Menu']) assert.match(nav, new RegExp(`<span class="lumina-nav-label">${l}</span>`));
  for (const f of await htmlFiles()) {
    const t = await readFile(f, 'utf8');
    if (t.includes('lumina-bottom-nav.js?v=')) assert.match(t, /lumina-bottom-nav\.js\?v=20261014_luminav1/, f);
  }
  for (const f of ['lumina-tablica.html', 'lumina-tablica-light.html']) assert.match(await readFile(f, 'utf8'), /id="lumina-compose-param"/, f);
  const top = await readFile('js/cc-back-to-top.js', 'utf8');
  assert.doesNotMatch(top, /M12 5v14M5 12h14/);
});

test('CCN Ogłoszenia: tylko prawdziwe ogłoszenia Christian Culture, bez fikcyjnych osób i telefonów', async () => {
  for (const f of ['ogloszenia/index.html', 'ogloszenia.html']) {
    const t = await readFile(f, 'utf8');
    assert.match(t, /<script src="\/js\/cc-ogloszenia-data\.js\?v=[^"]+"><\/script>\s*<script type="module" src="\/js\/cc-ogloszenia-store\.js\?v=[^"]+"><\/script>\s*<script type="module" crossorigin src="\/assets\/ogloszenia-index-cc20261013[a-z0-9]+\.js">/, f);
  }
  const bundle = await readFile('assets/ogloszenia-index-cc20261013b.js', 'utf8');
  // Formularz publikuje do wspólnej bazy (widzą wszyscy), nie tylko do localStorage autora.
  assert.match(bundle, /window\.CCOgloszeniaStore;if\(!S\|\|typeof S\.publish!==`function`\)/);
  assert.doesNotMatch(bundle, /w=e=>\{t\(t=>\{let n=\[e,\.\.\.t\];try\{localStorage\.setItem/);
  const store = await readFile('js/cc-ogloszenia-store.js', 'utf8');
  assert.match(store, /const COLLECTION = 'user_posts';/);
  assert.match(store, /authorUid: user\.uid/);
  assert.match(store, /u\.protocol === 'https:'/);
  assert.match(bundle, /Ke=\(Array\.isArray\(window\.CC_OGLOSZENIA\)\?window\.CC_OGLOSZENIA:\[\]\)/);
  for (const fake of ['Wiśniewscy', 'Złota Rączka CC', 'Skoda Octavia', 'images.unsplash.com', 'Setki braci']) assert.ok(!bundle.includes(fake), fake);
  const data = await readFile('js/cc-ogloszenia-data.js', 'utf8');
  assert.match(data, /Infolinia Nadzieja/);
  assert.match(data, /\/ksiazki-autora|\/pokonac-goliata/);
  const w = await readFile('_worker.js', 'utf8');
  assert.match(w, /kalendarz-\?20\(26\|27\|28\|29\|30\)/);
});

test('MojaBiblia: polskie znaczenia słów, uczciwa lista przekładów i wyszukiwarka pełnotekstowa', async () => {
  const engine = await readFile('mojabiblia-engine.js', 'utf8');
  assert.match(engine, /fetch\('\/data\/bible\/glosy-pl\.json/);
  assert.match(engine, /glossFor\(w\) \{/);
  assert.doesNotMatch(engine, /<div class="mb-word-gloss">\$\{w\.gloss\}<\/div>/);
  // 4 polskie przekłady (UBG, BW, BT, BG) dostępne w widoku porównania
  assert.match(engine, /availableTranslations\(data\)/);
  assert.match(engine, /Porównanie Przekładów UBG \/ BW \/ BT \/ BG/);
  assert.match(engine, /async fullTextSearch\(query\)/);
  assert.match(engine, /\/data\/bible\/szukaj-ubg\.json/);
  const html = await readFile('mojabiblia.html', 'utf8');
  assert.match(html, /UBG, BW, BT, BG/);
  assert.match(html, /mojabiblia-engine\.js\?v=2\.[45]\.0/);
  const gl = JSON.parse(await readFile('data/bible/glosy-pl.json', 'utf8'));
  assert.ok(Object.keys(gl).length > 1000);
  assert.equal(gl.H8064, 'niebo');
  const idx = JSON.parse(await readFile('data/bible/szukaj-ubg.json', 'utf8'));
  assert.ok(idx.r.length > 30000, 'indeks obejmuje całą Biblię');
});

test('LUMI Direct Dock: imię i zdjęcie rozmówcy z profilu, nigdy techniczny identyfikator', async () => {
  const a = await readFile('components/lumi-direct-dock-adapter.js', 'utf8');
  assert.match(a, /async function lookupProfile\(id\)/);
  assert.match(a, /getProfileFromCloud/);
  assert.match(a, /p\.name = 'Rozmówca LUMINA'/);
  assert.match(a, /enrichConversations\(dockConversations\)/);
});

test('LUMI KIDS /lumi-kids/: tylko makieta — noindex, bez zdjęć dziecka, bez kont, haseł i adresów', async () => {
  const h = await readFile('lumi-kids/index.html', 'utf8');
  const j = await readFile('lumi-kids/script.js', 'utf8');
  assert.match(h, /name="robots" content="noindex,nofollow"/);
  assert.match(h, /WERSJA DEMONSTRACYJNA/);
  assert.doesNotMatch(h, /dawidek-photo|lumi-kids-hero\.png/);
  assert.doesNotMatch(h + j, /@icloud\.com|password|haslo/i);
  assert.doesNotMatch(j, /fetch\s*\(|localStorage|sessionStorage|WebSocket|indexedDB|firebase/i);
  assert.match(h, /src="\/lumi-kids\/script\.js\?v=/);
});

test('LUMI KIDS pilotaż /lumi-kids/app/: tylko kolekcje kids_*, bez innerHTML, bez sekretów, noindex', async () => {
  const h = await readFile('lumi-kids/app/index.html', 'utf8');
  const j = await readFile('lumi-kids/app/app.js', 'utf8');
  assert.match(h, /name="robots" content="noindex,nofollow"/);
  assert.doesNotMatch(j, /innerHTML|insertAdjacentHTML|document\.write|console\./);
  assert.doesNotMatch(h + j, /@icloud\.com/i);
  const cols = [...j.matchAll(/(?:collection|doc)\(db,\s*'([a-z_]+)/g)].map(m => m[1]);
  assert.ok(cols.length > 5);
  const allowed = new Set(['lumina_direct_messages', 'lumina_chats', 'lumina_message_requests', 'lumina_profiles', 'LuminaDeviceTokens']);
  for (const c of cols) assert.ok(/^kids_/.test(c) || allowed.has(c), 'LUMI KIDS: niedozwolona kolekcja ' + c);
  assert.doesNotMatch(j, /kids_conversations/, 'jeden magazyn wiadomości — wspólny DM LUMINA');
  assert.match(j, /sendEmailVerification/);
  assert.match(j, /emailVerified/);
});

test('LUMI KIDS reguły: izolacja pilotażu i blokada konta dziecka w publicznej LUMINA', async () => {
  const r = await readFile('firestore.rules', 'utf8');
  for (const m of ['kids_pilot', 'kids_invites', 'kids_profiles', 'kids_waitlist']) assert.match(r, new RegExp('match /' + m + '/'));
  assert.doesNotMatch(r, /match \/kids_conversations\//);
  assert.ok((r.match(/notKidsChild\(\)/g) || []).length >= 10);
  assert.ok((r.match(/kidsChildGate\(\)/g) || []).length >= 6);
  assert.match(r, /notKidsChild\(\) \|\| kidsChildMayDm\(request\.resource\.data\)/);
  assert.match(r, /email_verified == true &&\s*request\.auth\.token\.firebase\.sign_in_provider == 'password'/);
  assert.doesNotMatch(r, /match \/kids_[a-z_]+\/[^}]*allow (read|write)[^;]*: if true/);
});

test('LUMI KIDS: krótkie adresy /kids i /kids/app prowadzą do /lumi-kids/', async () => {
  const w = await readFile('_worker.js', 'utf8');
  assert.match(w, /kidsAlias = \/\^\\\/\(kids\|lumikids/);
  assert.match(w, /kidsAlias\[2\] \? '\/lumi-kids\/app\/' : '\/lumi-kids\/'/);
});

test('LUMI KIDS: zgłoszenie rodziny do pilotażu — tylko rodzic, bez danych dziecka, tylko kids_waitlist', async () => {
  const h = await readFile('lumi-kids/index.html', 'utf8');
  const z = await readFile('lumi-kids/zgloszenie.js', 'utf8');
  const r = await readFile('firestore.rules', 'utf8');
  assert.match(h, /id="zgloszenie"/);
  assert.match(h, /src="\/lumi-kids\/zgloszenie\.js\?v=/);
  assert.doesNotMatch(z, /innerHTML|insertAdjacentHTML|console\./);
  const cols = [...z.matchAll(/(?:collection|doc)\(db,\s*'([a-z_]+)/g)].map(m => m[1]);
  assert.deepEqual([...new Set(cols)], ['kids_waitlist']);
  assert.doesNotMatch(z, /childName|childAge|dateOfBirth|pesel/i);
  assert.match(r, /match \/kids_waitlist\/\{uid\}/);
  assert.match(r, /request\.resource\.data\.email == request\.auth\.token\.email/);
});

test('LUMI KIDS hero: grafika bez napisów + żywy HTML, bez zdjęcia dziecka; aplikacja bez wstrzykiwanej wyszukiwarki portalu', async () => {
  const h = await readFile('lumi-kids/index.html', 'utf8');
  assert.match(h, /class="kids-hero"/);
  assert.match(h, /<h1 id="kids-hero-heading">Małe rozmowy\./);
  assert.match(h, /lumi-kids-hero-1672\.webp/);
  assert.match(h, /lumi-kids-hero-mobile\.webp/);
  assert.match(h, /alt="" width="1672" height="941"/);
  assert.match(h, /href="\/lumi-kids\/app\/"/);
  const { applyPageStandard } = await import('./cc-page-standard.mjs');
  const raw = '<html><body>x</body></html>';
  assert.equal(applyPageStandard('lumi-kids/app/index.html', raw), raw);
});

test('LUMI KIDS: powiadomienie na urządzeniu dziecka otwiera tylko /lumi-kids/app/, gdzie indziej bez zmian', async () => {
  const vm = await import('node:vm');
  const src = await readFile('firebase-messaging-sw.js', 'utf8');
  const run = async (kidsDevice) => {
    const listeners = {}, opened = [];
    vm.runInNewContext(src, {
      self: { location: { origin: 'https://polskieradio.cc' }, addEventListener: (t, f) => { listeners[t] = f; }, registration: { showNotification: async () => {} } },
      URL, console: { log() {}, warn() {} }, importScripts: () => { throw Error('offline'); },
      caches: { open: async () => ({ match: async () => (kidsDevice ? {} : undefined) }) },
      clients: { matchAll: async () => [], openWindow: async (u) => opened.push(u) },
    });
    let pending;
    listeners.notificationclick({ action: '', notification: { data: { type: 'direct_message', senderId: 'cezaryrgowski', messageId: 'm1' }, close() {} }, stopImmediatePropagation() {}, waitUntil: (p) => { pending = p; } });
    await pending;
    return opened[0];
  };
  assert.equal(await run(true), 'https://polskieradio.cc/lumi-kids/app/');
  assert.equal(await run(false), 'https://polskieradio.cc/mess?openChat=cezaryrgowski&messageId=m1');
});

test('Powiadomienie czatu: Odpowiedz/Otwórz Czat prowadzą do pokoju w /mess, karta tablicy nie jest przejmowana', async () => {
  const vm = await import('node:vm');
  const src = await readFile('firebase-messaging-sw.js', 'utf8');
  const run = async (action, windows) => {
    const listeners = {}, opened = [], navigated = [], posted = [];
    const wins = windows.map((url) => ({ url, focus: async () => {}, navigate: async (u) => navigated.push(u), postMessage: (m) => posted.push([url, m]) }));
    vm.runInNewContext(src, {
      self: { location: { origin: 'https://polskieradio.cc' }, addEventListener: (t, f) => { listeners[t] = f; }, registration: { showNotification: async () => {} } },
      URL, console: { log() {}, warn() {} }, importScripts: () => { throw Error('offline'); },
      caches: { open: async () => ({ match: async () => undefined }) },
      clients: { matchAll: async () => wins, openWindow: async (u) => opened.push(u) },
      setTimeout,
    });
    let pending;
    listeners.notificationclick({ action, notification: { data: { FCM_MSG: { data: { type: 'direct_message', senderId: 'syn1', senderName: 'Syn', messageId: 'm9' } } }, close() {} }, stopImmediatePropagation() {}, waitUntil: (p) => { pending = p; } });
    await pending;
    return { opened, navigated, posted };
  };
  const board = await run('open', ['https://polskieradio.cc/lumina-tablica.html']);
  assert.deepEqual(board.navigated, []);
  assert.equal(board.opened[0], 'https://polskieradio.cc/mess?openChat=syn1&messageId=m9&name=Syn');
  const reply = await run('reply', ['https://polskieradio.cc/lumina-tablica.html']);
  assert.equal(reply.opened[0], 'https://polskieradio.cc/mess?openChat=syn1&messageId=m9&name=Syn&reply=1');
  const mess = await run('open', ['https://polskieradio.cc/lumina-tablica.html', 'https://polskieradio.cc/mess']);
  assert.deepEqual(mess.opened, []);
  assert.equal(mess.posted.length, 1);
  assert.equal(mess.posted[0][0], 'https://polskieradio.cc/mess');
  assert.equal(mess.posted[0][1].chatData.senderId, 'syn1');
});

test('Czat: rozmowa rodzinna LUMI KIDS trafia na listę LUMI Messengera bez danych dziecka w kodzie', async () => {
  const html = await readFile('lumina.html', 'utf8');
  const db = await readFile('lumina-db.js', 'utf8');
  assert.match(db, /window\._luminaFamilyChats = family/);
  assert.match(db, /lumina:family-chats/);
  assert.match(html, /addEventListener\('lumina:family-chats'/);
  assert.match(html, /hookUserChats\._tries/);
  assert.doesNotMatch(html, /Dawid Rogowski|dawidek-avatar/);
  assert.doesNotMatch(db, /addDoc\(collection\(db, 'lumina_notifications'\)/);
  assert.doesNotMatch(db, /addDoc\(collection\(db, `lumina_chats\/\$\{normalizedChatId\}\/messages`\)/);
  assert.match(db, /export function markChatRoomRead\(/);
});

test('LUMI KIDS: zdjęcie dziecka tylko prywatnie (miniatura w kids_profiles), PWA i powiadomienia z tokenem konta', async () => {
  const j = await readFile('lumi-kids/app/app.js', 'utf8');
  const h = await readFile('lumi-kids/app/index.html', 'utf8');
  assert.match(j, /setDoc\(doc\(db, 'kids_profiles', childUid\), \{ photo: dataUrl/);
  assert.match(j, /cv\.width = 256/);
  assert.doesNotMatch(j, /getStorage|uploadBytes|firebase-storage\.js/);
  assert.match(j, /setDoc\(doc\(db, 'LuminaDeviceTokens', key\), \{\s*token, uid: me\.uid/);
  assert.match(j, /caches\.open\('lumi-kids-device'\)/);
  assert.match(h, /rel="manifest" href="\/lumi-kids\/app\/manifest\.webmanifest"/);
  const pub = await readFile('lumi-kids/index.html', 'utf8');
  assert.doesNotMatch(pub, /data:image|dawidek-photo/i);
});

test('LUMI KIDS: brak publicznego wizerunku i danych osobowych dziecka w kodzie (aplikacja, okienka LUMI)', async () => {
  for (const f of ['lumi-kids/app/app.js', 'components/lumi-direct-dock-adapter.js', 'lumi-kids/index.html']) {
    const src = await readFile(f, 'utf8');
    assert.doesNotMatch(src, /dawidek-avatar|dawidek-photo|birthDate|data urodzenia|Dawid Rogowski|Rogowskiego/i, f);
  }
});

test('Mama: kontakt rodzinny LUMI KIDS bez roli Master Admin (reguły i aplikacja)', async () => {
  const rules = await readFile('firestore.rules', 'utf8');
  const app = await readFile('lumi-kids/app/app.js', 'utf8');
  const admin = rules.slice(rules.indexOf('function isMasterAdmin()'), rules.indexOf('function ownsProfile('));
  assert.doesNotMatch(admin, /wioletta1240/);
  assert.doesNotMatch(app.slice(app.indexOf('const GUARDIAN_EMAILS'), app.indexOf('const EMOJI')), /wioletta1240/);
  assert.match(app, /c\.contacts\.includes\(MAMA_UID\)/);
  assert.match(app, /ensureChats\(c\.childUid, \[MAMA_UID\]\)/);
});

test('CCTV: rozważanie TV jako żywy czat Noemi i Sary — wspólny parser na cctv24, cctv24-pl i zapolske-live', async () => {
  const vm = await import('node:vm');
  const src = await readFile('js/cc-tv-dialogue.js', 'utf8');
  const ctx = { window: {} }; ctx.globalThis = ctx.window; vm.runInNewContext(src, ctx);
  const D = ctx.window.CCTvDialogue;
  const script = ['🔴 WERSJA CZWARTA: ROZWAŻANIE TELEWIZYJNE', 'Styl: test', '[OPRAWA GRAFICZNA & MUZYCZNA]', 'Studio w czerni i złocie.',
    '[INTRO: TEST]', 'Noemi:', 'Dzień dobry!', '', 'Sara (z uśmiechem): Witamy!', '[MANIFEST: MODLITWA BOJOWA]',
    'Głos Prowadzących (Noemi i Sara razem, z pełnym autorytetem):', '„Panie, prowadź nas. Amen.”', '**Noemi i Sara:** Dla Jezusa!'].join('\n');
  const p = D.parse(script);
  assert.equal(p.isDialogue, true);
  assert.equal(p.messages.map(m => m.kind).join(','), 'noemi,sara,both,both');
  assert.equal(p.messages[1].text, 'Witamy!');
  assert.equal(p.messages[0].section, 'INTRO: TEST');
  assert.ok(!p.messages.some(m => /Studio w czerni|WERSJA CZWARTA|Styl:/.test(m.text)), 'wskazówki reżyserskie nie trafiają na antenę');
  assert.equal(D.isDialogue('Abraham i Sara wyruszyli. Sara się roześmiała.'), false);
  for (const f of ['cctv24.html', 'cctv24-pl.html', 'zapolske-live.html']) {
    const h = await readFile(f, 'utf8');
    assert.match(h, /src="\/js\/cc-tv-dialogue\.js\?v=/, f);
    assert.match(h, /window\.CCTvDialogue\.play\(/, f);
    assert.match(h, /chat-container\[data-live\]/, f);
    assert.match(h, /reflection\.tvScript \|\| reflection\.scenariuszTV/, f);
  }
  assert.doesNotMatch(src, /innerHTML/);
  // Daily 18:00 Europe/Warsaw repeat; morning sessions remain available.
  for (const [now, start] of [
    ['2026-10-19T12:00:00Z','2026-10-19T16:00:00.000Z'],
    ['2026-10-19T15:59:59Z','2026-10-19T16:00:00.000Z'],
    ['2026-10-19T16:00:00Z','2026-10-19T16:00:00.000Z'],
    ['2026-10-19T16:34:00Z','2026-10-19T16:00:00.000Z'],
    ['2026-12-01T12:00:00Z','2026-12-01T17:00:00.000Z'],
    ['2026-10-25T16:59:59Z','2026-10-25T17:00:00.000Z'],
    ['2026-03-29T15:59:59Z','2026-03-29T16:00:00.000Z'],
    ['2026-10-19T07:10:00Z','2026-10-19T07:00:00.000Z']
  ]) assert.equal(new Date(D.liveStartToday(Date.parse(now))).toISOString(), start);
  for (const file of ['cctv24.html','cctv24-pl.html','zapolske-live.html','js/lumi-live-rooms.js'])
    assert.match(await readFile(file,'utf8'),/cc-tv-dialogue\.js\?v=20261019_tv7/, file);
});

test('LUMI Messenger: pokoje LIVE TV, rozmowa Noemi i Sary na czacie ogólnym, modlitwy z pokoju na antenie /zapolske-live', async () => {
  const m = await readFile('js/lumi-live-rooms.js', 'utf8');
  const html = await readFile('lumina.html', 'utf8');
  const zp = await readFile('zapolske-live.html', 'utf8');
  const rules = await readFile('firestore.rules', 'utf8');
  assert.match(html, /src="\/js\/lumi-live-rooms\.js\?v=/);
  for (const id of ['tv_cctv24', 'tv_zapolske', 'tv_master_live', 'tv_cctv24_pl']) assert.match(m, new RegExp(`id: '${id}'`));
  assert.match(m, /lumina_live_rooms/);
  assert.match(m, /window\.renderPublicChatMessages = function/);
  assert.match(m, /CCTvDialogue\.liveStartToday\(\)|D\.liveStartToday\(\)/);
  assert.doesNotMatch(m, /innerHTML/);
  assert.match(zp, /collection\(db, "lumina_live_rooms", "tv_zapolske", "messages"\)/);
  assert.match(zp, /livePrayerOk/);
  assert.match(zp, /t \+ 5000 - Date\.now\(\)/);
  assert.match(rules, /match \/lumina_live_rooms\/\{roomId\}\/messages\/\{messageId\}/);
  assert.match(rules, /kind in \['text', 'prayer'\]/);
  // Dyrektywa Dowódcy 2026-10-19: czerwony pasek potwierdzający nadanie w programie na żywo
  assert.match(m, /Twoja wiadomość została opublikowana w programie na żywo CCTV LIVE 24\./);
  assert.match(m, /\.llr-live-bar/);
  assert.match(m, /\.llr-live-dot/);
});
