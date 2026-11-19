import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import {
  isImageAdequateForItem,
  generateSocialTopicGraphic
} from '../scripts/generate-social-topic-graphic.mjs';
import {
  getAllEcosystemCandidates,
  resolveItemImage,
  formatBroadcasterTweet
} from '../scripts/ccn_auto_broadcaster.mjs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const FB_SCRIPT = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/publish_facebook_ccn_news.js';

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

  const vodImg = resolveItemImage(vodItem, ROOT);
  assert.ok(vodImg && vodImg.replace(/\\/g, '/').endsWith('images/social/kino-vod-christian-culture-16x9.jpg'), `Nieoczekiwana grafika VOD: ${vodImg}`);
  assert.equal(resolveFbFallbackImage(vodItem, ROOT).replace(/\\/g, '/').endsWith('images/social/kino-vod-christian-culture-16x9.jpg'), true);

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
