import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  generateCcnFbSquareCard,
  getCcnFbSquareRelativePath,
} from '../scripts/generate-ccn-fb-square-card.mjs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WEKTOR_PUBLISHER = path.resolve(ROOT, '..', 'Wektor1_VideoFactory', 'publish_fb_ccn_news_page.js');

const ISLAM_SLUG = 'islam-najwieksza-religia-2035-co-czeka-europe';

test('Islam 2035 article is built, indexed in catalog, and has verified 16:9 and 1:1 graphics', async () => {
  assert.equal(fs.existsSync(path.join(ROOT, 'news', `${ISLAM_SLUG}.html`)), true);
  assert.equal(fs.existsSync(path.join(ROOT, 'news', ISLAM_SLUG, 'index.html')), true);

  const img16 = path.join(ROOT, 'images', 'news', `art-${ISLAM_SLUG}.jpg`);
  const img1 = path.join(ROOT, 'images', 'social', 'ccn-fb', `fb-${ISLAM_SLUG}.jpg`);
  assert.equal(fs.existsSync(img16), true);
  assert.equal(fs.existsSync(img1), true);

  const meta16 = await sharp(img16).metadata();
  const meta1 = await sharp(img1).metadata();
  assert.equal(meta16.width, 1600);
  assert.equal(meta16.height, 900);
  assert.equal(meta1.width, 1080);
  assert.equal(meta1.height, 1080);

  const catalogRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'szukaj', 'catalog.json'), 'utf8'));
  const items = Array.isArray(catalogRaw) ? catalogRaw : catalogRaw.items || [];
  assert.equal(
    items.some((x) => String(x.url || '').includes(ISLAM_SLUG)),
    true,
    'Catalog must include Islam 2035 article'
  );
  const ccPomocCount = items.filter(
    (x) => x.category === 'Pomoc i wsparcie' || x.category === 'Help and support'
  ).length;
  assert.equal(ccPomocCount, 200, 'All 200 CC Pomoc pages must remain indexed');
});

test('All 5 CCN NEWS brand templates are installed in images/brand/ccn-news-templates', () => {
  const expected = [
    'ccn-news-template-1x1-guide.jpg',
    'ccn-news-banner.jpg',
    'ccn-news-example-16x9.jpg',
    'ccn-news-logo-square.jpg',
    'ccn-news-example-1x1.jpg',
  ];
  for (const name of expected) {
    const full = path.join(ROOT, 'images', 'brand', 'ccn-news-templates', name);
    assert.equal(fs.existsSync(full), true, `Missing brand template ${name}`);
    assert.ok(fs.statSync(full).size > 15000);
  }
});

test('generateCcnFbSquareCard renders 1080x1080 JPEG for standard CCN articles', async () => {
  const sampleItem = {
    slug: 'silni-az-do-wyczerpania-dlaczego-mezczyzni-wciaz-boja-sie-prosic-o-pomoc',
    title: 'Silni aż do wyczerpania: dlaczego mężczyźni wciąż boją się prosić o pomoc?',
    imageUrl: '/images/news/art-silni-az-do-wyczerpania-dlaczego-mezczyzni-wciaz-boja-sie-prosic-o-pomoc.jpg',
    url: 'https://polskieradio.cc/news/silni-az-do-wyczerpania-dlaczego-mezczyzni-wciaz-boja-sie-prosic-o-pomoc',
  };
  const res = await generateCcnFbSquareCard(sampleItem, { rootDir: ROOT, force: true });
  assert.equal(res.ok, true);
  assert.equal(res.relPath, getCcnFbSquareRelativePath(sampleItem));

  const meta = await sharp(res.outPath).metadata();
  assert.equal(meta.width, 1080);
  assert.equal(meta.height, 1080);
  assert.equal(meta.format, 'jpeg');
});

test('FB Page publisher spans all CCN thematic portals, rotates portals, and keeps links ONLY in 1st comment', async () => {
  const pub = require(WEKTOR_PUBLISHER);
  assert.equal(pub.TARGET_PAGE.id, '61596730261509');

  const candidates = await pub.getCcnPortalCandidates(ROOT);
  const portals = new Set(candidates.map((c) => c.portalKey));
  for (const reqPortal of ['news', 'finanse', 'nauka', 'historia', 'prawo', 'biblioteka', 'biologia', 'seks', 'swiadectwa']) {
    assert.equal(portals.has(reqPortal), true, `Missing CCN thematic portal: ${reqPortal}`);
  }
  assert.ok(portals.size >= 15, `Expected broad portal coverage, got ${portals.size}`);

  for (const c of candidates) {
    assert.equal(c.url.includes('/cc-pomoc/'), false, 'CC Pomoc must stay out of CCN FB page');
    assert.equal(c.url.includes('kurscodzienny'), false, 'Kurs Codzienny must stay out of CCN FB page');
    assert.equal(/\/lumina(\.|-|$)/i.test(c.url), false, 'LUMINA pages must stay out of CCN FB page');
  }

  const picked1 = pub.pickNextCcnCandidate(
    candidates,
    [],
    { lastPortalKey: 'news', rotationCursor: 1 },
    null
  );
  assert.notEqual(picked1.portalKey, 'news', 'Rotation must switch thematic portal instead of repeating news');

  const islamCandidate = pub.pickNextCcnCandidate(candidates, [], {}, ISLAM_SLUG);
  const islamPost = pub.formatCcnFbPagePost(islamCandidate);
  assert.equal(/https?:\/\/|polskieradio\.cc/i.test(islamPost), false, 'Post body must contain ZERO URLs');
  assert.equal(/link w komentarzu/i.test(islamPost), true);
  assert.equal(islamPost.includes('[WSTAW PO PUBLIKACJI]'), false);

  const genericPost = pub.formatCcnFbPagePost(picked1);
  assert.equal(/https?:\/\/|polskieradio\.cc/i.test(genericPost), false, 'Generic post body must contain ZERO URLs');
  assert.equal(/link w komentarzu/i.test(genericPost), true);

  const comment = pub.formatFirstComment(islamCandidate);
  assert.equal(comment.includes(`https://polskieradio.cc/news/${ISLAM_SLUG}`), true);
});
