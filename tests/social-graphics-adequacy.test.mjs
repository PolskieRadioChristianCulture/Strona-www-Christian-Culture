import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import {
  OFFICIAL_VOD_SOCIAL_GRAPHICS,
  pickOfficialVodGraphic,
  isImageAdequateForItem,
  generateSocialTopicGraphic
} from '../scripts/generate-social-topic-graphic.mjs';
import {
  getAllEcosystemCandidates,
  chooseNextCandidate,
  resolveItemImage,
  formatBroadcasterTweet
} from '../scripts/ccn_auto_broadcaster.mjs';
import {
  TABLICA_VOICES,
  normalizeCategory,
  isSdsItem,
  resolveTablicaImageUrl,
  formatTablicaPost
} from '../scripts/publish-ecosystem-to-tablica.mjs';
import { loadCcPomocCandidates } from '../scripts/cc-pomoc-promo.mjs';
import {
  loadEcosystemPublicPages,
  ECOSYSTEM_SKIP_ROOT_SLUGS
} from '../scripts/cc-ecosystem-promo.mjs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const WEKTOR_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const FB_SCRIPT = `${WEKTOR_ROOT}/publish_facebook_ccn_news.js`;
const { sanitizeSupportLinks } = require(`${WEKTOR_ROOT}/wa_queue_helpers.js`);

const {
  formatFacebookPost,
  getAllCandidates: getFbFallbackCandidates,
  resolveItemImage: resolveFbFallbackImage
} = require(FB_SCRIPT);

test('Bramka isImageAdequateForItem bezwzględnie odrzuca błędne dopasowania i mieszanie marek', () => {
  const vodItem = {
    title: 'Kino Chrześcijańskie VOD — Dobre Kino 24/7 i bezpłatne filmy z polskim lektorem',
    url: 'https://polskieradio.cc/vod',
    category: 'Kino VOD',
    type: 'vod'
  };
  const sdsLessonItem = {
    title: 'Kurs Apokalipsa — Lekcja 1: Objawienie Jezusa Chrystusa',
    url: 'https://polskieradio.cc/kursy/apokalipsa/lekcja-01.html',
    category: 'Studio Dobrego Słowa',
    type: 'course'
  };
  const sdsCourseItem = {
    title: 'Studio Dobrego Słowa — Cykl „Apokalipsa: Księga Nadziei”',
    url: 'https://polskieradio.cc/kursy/apokalipsa/',
    category: 'Studio Dobrego Słowa',
    type: 'course'
  };
  const cbdcArticle = {
    title: 'Cyfrowy pieniądz, prawo niedzielne i Apokalipsa 13',
    url: 'https://polskieradio.cc/news/cbdc-prawo-niedzielne-apokalipsa-13',
    category: 'CCN NEWS',
    type: 'news'
  };
  const finanseItem = {
    title: 'CCN Finanse — Biblijne Zasady Zarządzania Pieniędzmi',
    url: 'https://polskieradio.cc/finanse',
    category: 'Ekosystem',
    type: 'news'
  };
  const founderItem = {
    title: 'Wizytówka: Cezary Rogowski — Założyciel Christian Culture',
    url: 'https://polskieradio.cc/lumina.cezaryrgowski',
    category: 'Wizytówka',
    type: 'profile'
  };

  // Odrzucenia
  assert.equal(isImageAdequateForItem('', vodItem, ROOT), false);
  assert.equal(isImageAdequateForItem('images/news/art-cbdc-prawo-niedzielne-apokalipsa-13.jpg', vodItem, ROOT), false);
  assert.equal(isImageAdequateForItem('images/news/art-cbdc-prawo-niedzielne-apokalipsa-13.jpg', sdsLessonItem, ROOT), false);
  assert.equal(isImageAdequateForItem('avatar_mariusz_sds.jpg', vodItem, ROOT), false);
  assert.equal(isImageAdequateForItem('images/courses/apokalipsa/banner-promo.jpg', vodItem, ROOT), false);
  assert.equal(isImageAdequateForItem('images/social/kino-vod-christian-culture-16x9.jpg', sdsCourseItem, ROOT), false);
  assert.equal(isImageAdequateForItem('images/kultura/card-vod.jpg', vodItem, ROOT), false);
  assert.equal(isImageAdequateForItem('vod_hity_kina_poster.jpg', vodItem, ROOT), false);
  assert.equal(isImageAdequateForItem('images/brand/cezary-wioletta-radiocc.jpg', finanseItem, ROOT), false);

  // Akceptacje właściwe
  assert.equal(isImageAdequateForItem('images/social/kino-vod-christian-culture-16x9.jpg', vodItem, ROOT), true);
  assert.equal(OFFICIAL_VOD_SOCIAL_GRAPHICS.length, 3);
  for (const vodRel of OFFICIAL_VOD_SOCIAL_GRAPHICS) {
    const absVod = path.join(ROOT, vodRel);
    assert.ok(fs.existsSync(absVod), `Brak oficjalnej grafiki VOD: ${vodRel}`);
    assert.ok(fs.statSync(absVod).size > 100000, `Zbyt mały plik oficjalnej grafiki VOD: ${vodRel}`);
    assert.equal(isImageAdequateForItem(vodRel, vodItem, ROOT), true);
    assert.equal(isImageAdequateForItem(vodRel, sdsCourseItem, ROOT), false);
    assert.equal(isImageAdequateForItem(vodRel, sdsLessonItem, ROOT), false);
  }
  assert.equal(isImageAdequateForItem('images/courses/apokalipsa/banner-promo.jpg', sdsCourseItem, ROOT), true);
  assert.equal(isImageAdequateForItem('images/news/art-cbdc-prawo-niedzielne-apokalipsa-13.jpg', cbdcArticle, ROOT), true);
  assert.equal(isImageAdequateForItem('images/brand/cezary-wioletta-radiocc.jpg', founderItem, ROOT), true);
});

test('Pula X i zapasowa pula FB mają poprawne wpisy i zero niedozwolonych statycznych obrazów', () => {
  const xCandidates = getAllEcosystemCandidates();
  const fbCandidates = getFbFallbackCandidates();
  assert.ok(xCandidates.length > 400, 'oczekiwano pełnej puli kandydatów X');

  for (const pool of [xCandidates, fbCandidates]) {
    for (const c of pool) {
      if (c.type === 'verse' || !c.image) continue;
      if (isImageAdequateForItem(c.image, c, ROOT)) {
        const imgLower = c.image.toLowerCase();
        assert.ok(!imgLower.includes('card-vod.jpg'), `Zakazane card-vod.jpg na ${c.url}`);
        assert.ok(!imgLower.includes('vod_hity_kina_poster'), `Zakazane vod_hity_kina_poster na ${c.url}`);
      }
      const urlLower = (c.url || '').toLowerCase();
      if (urlLower.endsWith('/vod')) {
        assert.ok(!/sds|studio dobrego s[łl]owa/i.test(`${c.title} ${c.lead} ${c.tag || ''}`), 'Kino VOD nie może zawierać wzmianek SDS');
      }
    }
  }
});

test('Rozdzielenie Kino VOD (CC) i Studio Dobrego Słowa (Apokalipsa: Księga Nadziei) w treści i grafikach', async () => {
  const xCandidates = getAllEcosystemCandidates();
  const vodItem = xCandidates.find((c) => (c.url || '').toLowerCase().endsWith('/vod'));
  const sdsItem = xCandidates.find((c) => (c.url || '').toLowerCase().includes('/kursy/apokalipsa') && !c.url.includes('lekcja-'));
  assert.ok(vodItem, 'Kandydat /vod musi istnieć');
  assert.ok(sdsItem, 'Kandydat /kursy/apokalipsa musi istnieć');

  const expectedVodCycle = [
    'images/social/vod-christian-culture-01-smarttv.jpg',
    'images/social/vod-christian-culture-02-rodzina-24-7.jpg',
    'images/social/vod-christian-culture-03-dobre-kino-24-7.jpg',
    'images/social/vod-christian-culture-01-smarttv.jpg'
  ];
  for (let i = 0; i < expectedVodCycle.length; i += 1) {
    const pickedDirect = pickOfficialVodGraphic(ROOT, i).replace(/\\/g, '/');
    const vodImg = resolveItemImage(vodItem, ROOT, { vodRotationIndex: i }).replace(/\\/g, '/');
    const fbImg = resolveFbFallbackImage(vodItem, ROOT, i).replace(/\\/g, '/');
    assert.ok(pickedDirect.endsWith(expectedVodCycle[i]), `Nieoczekiwana rotacja helpera [${i}]: ${pickedDirect}`);
    assert.ok(vodImg.endsWith(expectedVodCycle[i]), `Nieoczekiwana grafika VOD X [${i}]: ${vodImg}`);
    assert.ok(fbImg.endsWith(expectedVodCycle[i]), `Nieoczekiwana grafika VOD FB [${i}]: ${fbImg}`);
  }
  const tablicaVodUrl = resolveTablicaImageUrl(vodItem, null, ROOT);
  assert.ok(
    OFFICIAL_VOD_SOCIAL_GRAPHICS.some((rel) => tablicaVodUrl === `https://polskieradio.cc/${rel}`),
    `Nieoczekiwany URL VOD na Tablicy LUMINA: ${tablicaVodUrl}`
  );

  const sdsImg = resolveItemImage(sdsItem, ROOT);
  assert.ok(sdsImg && sdsImg.replace(/\\/g, '/').endsWith('images/courses/apokalipsa/banner-promo.jpg'), `Nieoczekiwana grafika SDS: ${sdsImg}`);

  const vodTweet = formatBroadcasterTweet(vodItem);
  assert.ok(!/sds|studio dobrego/i.test(vodTweet), `Tweet VOD zawiera SDS:\n${vodTweet}`);
  assert.ok(vodTweet.includes('#KinoVOD'), 'Tweet VOD powinien mieć #KinoVOD');

  const sdsTweet = formatBroadcasterTweet(sdsItem);
  assert.ok(!/\bvod\b/i.test(sdsTweet), `Tweet SDS zawiera VOD:\n${sdsTweet}`);
  assert.ok(sdsTweet.includes('#StudioDobregoSlowa'));

  const vodFb = formatFacebookPost(vodItem);
  const sdsFb = formatFacebookPost(sdsItem);
  for (const post of [vodFb, sdsFb]) {
    assert.ok(!/\*[^*\n]+\*/.test(post), `Post FB zawiera surowe gwiazdki Markdown:\n${post}`);
  }
  assert.ok(!/sds|studio dobrego|wiadomosci/i.test(vodFb), `Post FB VOD nie może mieć SDS ani #Wiadomosci:\n${vodFb}`);
  assert.ok(!/\bvod\b|wiadomosci/i.test(sdsFb), `Post FB SDS nie może mieć VOD ani #Wiadomosci:\n${sdsFb}`);
});

test('Generator grafik tematycznych renderuje poprawne karty 1280x720 JPG dla kluczowej próbki', async () => {
  const sampleItems = [
    {
      title: 'Kurs Apokalipsa — Lekcja 1: Objawienie Jezusa Chrystusa — Księga, która odsłania, a nie ukrywa',
      lead: 'Studio Dobrego Słowa — systematyczne studium proroctw Biblii i księgi Objawienia.',
      url: 'https://polskieradio.cc/kursy/apokalipsa/lekcja-01.html',
      category: 'Studio Dobrego Słowa',
      type: 'course'
    },
    {
      title: 'Interlinearna MojaBiblia — Kody Stronga, Greka, Hebrajski i Przekład UBG',
      lead: 'Nowoczesne cyfrowe narzędzie do wnikliwego badania tekstu Pisma Świętego w językach oryginalnych.',
      url: 'https://polskieradio.cc/mojabiblia',
      category: 'Pismo Święte',
      type: 'module'
    },
    {
      title: 'Dobrze, że jesteś — Codzienne Rozważania',
      lead: 'Słowo Boże, pokój i duchowe wsparcie na każdy poranek i wieczór.',
      url: 'https://polskieradio.cc/dzj',
      category: 'Ekosystem',
      type: 'module'
    },
    {
      title: 'CCN Finanse — Biblijne Zasady Zarządzania Pieniędzmi & Wyjście z Długów',
      lead: 'Roztropność, wolność od długów i biblijne szafarstwo w praktyce.',
      url: 'https://polskieradio.cc/finanse',
      category: 'Wiedza',
      type: 'news'
    }
  ];

  for (const item of sampleItems) {
    const resolved = resolveItemImage(item, ROOT);
    assert.ok(resolved && fs.existsSync(resolved), `Brak wygenerowanej grafiki dla ${item.url}`);
    const stat = fs.statSync(resolved);
    assert.ok(stat.size > 15000, `Zbyt mały plik grafiki (${stat.size} B) dla ${item.url}`);
    assert.equal(isImageAdequateForItem(resolved, item, ROOT), true);

    const directGen = await generateSocialTopicGraphic(item, { rootDir: ROOT });
    assert.equal(directGen.ok, true);
    assert.ok(fs.existsSync(directGen.outPath));
  }
});

test('CC Pomoc (200 stron PL/EN z /depresja na czele): obecność w pulach X/FB, rotacja, karty 1280x720 ze zdjęciem i format postów', async () => {
  const helpItems = loadCcPomocCandidates(ROOT);
  assert.equal(helpItems.length, 200, `Oczekiwano 200 stron CC Pomoc, jest ${helpItems.length}`);
  assert.equal(helpItems.filter((x) => x.lang === 'pl').length, 100);
  assert.equal(helpItems.filter((x) => x.lang === 'en').length, 100);
  assert.equal(helpItems[0].url, 'https://polskieradio.cc/depresja');

  for (const h of helpItems) {
    const slug = h.url.replace(/^https:\/\/polskieradio\.cc\/+/, '');
    assert.ok(
      fs.existsSync(path.join(ROOT, `${slug}.html`)) || fs.existsSync(path.join(ROOT, slug, 'index.html')),
      `Brak pliku HTML dla ${h.url}`
    );
    assert.ok(h.sourceImage && fs.existsSync(path.join(ROOT, h.sourceImage)), `Brak zdjęcia źródłowego dla ${h.url}: ${h.sourceImage}`);
  }

  const xCandidates = getAllEcosystemCandidates();
  const xByUrl = new Map(xCandidates.map((c) => [c.url, c]));
  for (const h of helpItems) {
    const found = xByUrl.get(h.url);
    assert.ok(found, `Brak strony CC Pomoc w puli X: ${h.url}`);
    assert.equal(found.type, 'help', `Niepoprawny typ kandydata X dla ${h.url}: ${found.type}`);
  }

  const fbCandidates = getFbFallbackCandidates();
  const fbUrls = new Set(fbCandidates.map((c) => c.url));
  for (const h of helpItems) {
    assert.ok(fbUrls.has(h.url), `Brak strony CC Pomoc w zapasowej puli FB: ${h.url}`);
  }

  // Rotacja: gdy dawno nie było typu help, wybierze help; zaraz po help nigdy nie wybierze drugiego help pod rząd
  const nonHelpHistory = [
    { type: 'news', title: 'Artykuł 1', url: 'https://polskieradio.cc/news/1' },
    { type: 'verse', title: 'Werset 1', url: 'https://polskieradio.cc/mojabiblia' },
    { type: 'book', title: 'Książka 1', url: 'https://polskieradio.cc/ksiazki/pokonac-goliata' },
    { type: 'music', title: 'Player', url: 'https://polskieradio.cc/player' },
    { type: 'course', title: 'Kurs', url: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-1' },
    { type: 'vod', title: 'VOD', url: 'https://polskieradio.cc/vod' }
  ];
  const pick1 = chooseNextCandidate(xCandidates, nonHelpHistory, { lastIndex: 0 });
  assert.equal(pick1.chosen.type, 'help', `Po braku help powinien zostać wybrany temat CC Pomoc (wylosowano ${pick1.chosen.type}: ${pick1.chosen.url})`);

  const pick2 = chooseNextCandidate(xCandidates, [pick1.chosen, ...nonHelpHistory], { lastIndex: 0 });
  assert.notEqual(pick2.chosen.type, 'help', 'Nie wolno publikować dwóch stron CC Pomoc bezpośrednio pod rząd');

  // Generowanie i walidacja kart JPG 1280x720 dla próbki PL/EN
  const targetUrls = [
    'https://polskieradio.cc/depresja',
    'https://polskieradio.cc/en/depression-support',
    'https://polskieradio.cc/dlugi',
    'https://polskieradio.cc/sabat'
  ];
  for (const u of targetUrls) {
    const item = helpItems.find((x) => x.url === u);
    assert.ok(item, `Brak wzorca testowego ${u}`);
    const card = await generateSocialTopicGraphic(item, { rootDir: ROOT, force: true });
    assert.equal(card.ok, true);
    assert.ok(fs.existsSync(card.outPath));
    assert.ok(fs.statSync(card.outPath).size > 25000, `Zbyt mała karta ${u}: ${fs.statSync(card.outPath).size} B`);
    assert.equal(isImageAdequateForItem(card.outPath, item, ROOT), true);
  }

  // Walidacja treści postów X, FB i Tablicy LUMINA dla PL (/depresja) i EN (/en/depression-support)
  const plItem = helpItems.find((x) => x.url === 'https://polskieradio.cc/depresja');
  const enItem = helpItems.find((x) => x.url === 'https://polskieradio.cc/en/depression-support');

  const plTweet = formatBroadcasterTweet(plItem);
  const enTweet = formatBroadcasterTweet(enItem);
  assert.ok(plTweet.includes('CC POMOC') && plTweet.includes('#CCPomoc'));
  assert.ok(enTweet.includes('CC HELP') && enTweet.includes('#CCHelp'));
  assert.ok(!/sds|studio dobrego|\bvod\b/i.test(plTweet + '\n' + enTweet));

  const plFb = formatFacebookPost(plItem);
  const enFb = formatFacebookPost(enItem);
  assert.ok(plFb.includes('CC POMOC') && plFb.includes('#CCPomoc'));
  assert.ok(enFb.includes('CC HELP') && enFb.includes('#CCHelp'));
  for (const post of [plFb, enFb]) {
    assert.ok(!/\*[^*\n]+\*/.test(post), `Post FB zawiera surowe gwiazdki Markdown:\n${post}`);
    assert.ok(!/sds|studio dobrego|\bvod\b|wiadomosci/i.test(post), `Post FB zawiera niedozwoloną mieszankę marek:\n${post}`);
  }

  assert.equal(normalizeCategory(plItem.category), 'help');
  assert.equal(normalizeCategory(enItem.category), 'help');
  assert.equal(isSdsItem(plItem), false);
  assert.equal(isSdsItem(enItem), false);

  const tablicaPl = formatTablicaPost(plItem, TABLICA_VOICES[0], resolveTablicaImageUrl(plItem, null, ROOT));
  const tablicaEn = formatTablicaPost(enItem, TABLICA_VOICES[1], resolveTablicaImageUrl(enItem, null, ROOT));
  assert.equal(tablicaPl.category, 'help');
  assert.equal(tablicaEn.category, 'help');
  assert.ok(tablicaPl.imageUrl && tablicaPl.imageUrl.includes('/images/social/generated/'));
  assert.ok(tablicaEn.imageUrl && tablicaEn.imageUrl.includes('/images/social/generated/'));
});

test('P0 Patronite: ZERO fałszywych linków /radiocc w bazach i generatorach + sanitizer WhatsApp naprawia w locie', () => {
  const badRe = /patronite\.pl\/(radiocc|christian-culture|christianculture|polskieradiocc)\b/i;
  const checkFiles = [
    path.join(ROOT, 'rozwazania_baza.json'),
    path.join(WEKTOR_ROOT, 'rozwazania_baza.json'),
    path.join(WEKTOR_ROOT, 'rozwazania_baza.md'),
    ...['2026-11-17', '2026-11-18', '2026-11-19'].map((d) =>
      path.join(ROOT, 'kolejka-publikacji', 'kurs-codzienny', d, 'rozwazanie.json')
    ),
    ...fs.readdirSync(path.join(ROOT, 'scripts', 'content'))
      .filter((f) => /^pakiet-day.*\.(md|txt|json)$/i.test(f))
      .map((f) => path.join(ROOT, 'scripts', 'content', f)),
    ...fs.readdirSync(path.join(ROOT, 'scripts'))
      .filter((f) => /^generate-day.*\.(mjs|js)$/i.test(f))
      .map((f) => path.join(ROOT, 'scripts', f))
  ];

  for (const filePath of checkFiles) {
    assert.ok(fs.existsSync(filePath), `Oczekiwano pliku: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(badRe);
    assert.equal(match, null, `Wykryto zakazany link Patronite (${match?.[0]}) w ${filePath}`);
  }

  // Runtime sanitizer w kolejce i wysyłce WhatsApp
  const dirty = 'Wspieraj misję: https://patronite.pl/radiocc oraz patronite.pl/christian-culture';
  const cleaned = sanitizeSupportLinks(dirty);
  assert.equal(
    cleaned,
    'Wspieraj misję: https://patronite.pl/osobowoscplus oraz patronite.pl/osobowoscplus'
  );
  assert.equal(
    sanitizeSupportLinks('Oficjalny link: https://patronite.pl/osobowoscplus'),
    'Oficjalny link: https://patronite.pl/osobowoscplus'
  );
});

test('Pełna promocja całego ekosystemu polskieradio.cc: wszystkie czyste portale CCN i podstrony bez duplikatów ani profili prywatnych', () => {
  const ecoPages = loadEcosystemPublicPages(ROOT);
  assert.ok(ecoPages.length >= 100, `Oczekiwano >= 100 stron z loadEcosystemPublicPages, jest ${ecoPages.length}`);

  const skipSlugsLower = new Set([...ECOSYSTEM_SKIP_ROOT_SLUGS].map((s) => s.toLowerCase()));
  const seenEco = new Set();
  for (const p of ecoPages) {
    const key = p.url.toLowerCase().replace(/\/+$/, '').replace(/\.html$/i, '');
    assert.ok(!seenEco.has(key), `Duplikat kanonicznego URL w loadEcosystemPublicPages: ${p.url}`);
    seenEco.add(key);
    assert.ok(!/\/lumina\./i.test(key) && !/\/lumina-profile$/i.test(key), `Niedozwolony profil prywatny LUMINA: ${p.url}`);
    const pathname = new URL(p.url).pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    assert.ok(!skipSlugsLower.has(pathname), `Wykluczony slug ze SKIP_ROOT w puli promocji: ${p.url}`);
    assert.ok(!/backup|\/test-|\/privacy$|\/404$|\/ccmc$|\/kalendarz$/i.test(key), `Niedozwolona strona techniczna/prywatna: ${p.url}`);
  }

  const allCandidates = getAllEcosystemCandidates();
  assert.ok(allCandidates.length >= 1000, `Oczekiwano >= 1000 czystych kandydatów w puli ekosystemu, jest ${allCandidates.length}`);

  const allByNorm = new Map(
    allCandidates.map((c) => [c.url.toLowerCase().replace(/\/+$/, '').replace(/\.html$/i, ''), c])
  );

  // Obowiązkowe nowe rodziny stron w puli promocji X / FB / LUMINA
  const requiredUrls = [
    'https://polskieradio.cc/swiadectwa/s01-od-uzaleznienia-do-wolnosci',
    'https://polskieradio.cc/biblioteka/ksiega-psalmow-biblia-audio-cc-przeklad-ubg',
    'https://polskieradio.cc/global/articles/biblical-worship-sing-the-word-of-god',
    'https://polskieradio.cc/music/artysci',
    'https://polskieradio.cc/si',
    'https://polskieradio.cc/survival',
    'https://polskieradio.cc/pomogebomoge',
    'https://polskieradio.cc/spiritualsounds',
    'https://polskieradio.cc/welch',
    'https://polskieradio.cc/bcm',
    'https://polskieradio.cc/tvw',
    'https://polskieradio.cc/bibleaudio-global'
  ];

  for (const reqUrl of requiredUrls) {
    const cand = allByNorm.get(reqUrl);
    assert.ok(cand, `Brak kluczowej publicznej strony w puli promocji: ${reqUrl}`);
    const tweet = formatBroadcasterTweet(cand);
    const weightedLen = tweet.length - cand.url.length + 23;
    assert.ok(weightedLen <= 278, `Tweet przekracza limit 278 znaków (${weightedLen}) dla ${cand.url}:\n${tweet}`);
    const img = resolveItemImage(cand, ROOT);
    assert.ok(img && fs.existsSync(img), `Brak adekwatnej grafiki dla ${cand.url}`);
    assert.equal(isImageAdequateForItem(img, cand, ROOT), true, `Grafika ${img} odrzucona przez bramkę dla ${cand.url}`);
  }
});
