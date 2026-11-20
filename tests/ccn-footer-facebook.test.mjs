import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FB_URL = 'https://www.facebook.com/CCNews.ChristianCulture';

test('All 3 React portal Footer.tsx sources link to official CCN News Facebook page with 44px SVG', () => {
  const footerSources = [
    'portals/ccn-news/src/components/Footer.tsx',
    'portals/ccn-finanse/src/components/Footer.tsx',
    'portals/kultura/components/Footer.tsx',
  ];

  for (const rel of footerSources) {
    const content = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    assert.equal(content.includes(FB_URL), true, `${rel} missing official FB URL`);
    assert.equal(content.includes('<svg'), true, `${rel} missing inline SVG logo`);
    assert.equal(content.includes('w-11 h-11'), true, `${rel} missing 44px touch target`);
    assert.equal(content.includes('"https://facebook.com"'), false, `${rel} still has placeholder FB URL`);
  }
});

test('SSG builder and built static CCN articles include ccn-article-footer with official Facebook logo', () => {
  const builderSrc = fs.readFileSync(path.join(ROOT, 'scripts/build-ccn-static-pages.mjs'), 'utf8');
  assert.equal(builderSrc.includes('ccn-article-footer'), true);
  assert.equal(builderSrc.includes(FB_URL), true);

  const sampleArticles = [
    'news/islam-najwieksza-religia-2035-co-czeka-europe.html',
    'news/silni-az-do-wyczerpania-dlaczego-mezczyzni-wciaz-boja-sie-prosic-o-pomoc.html',
  ];

  for (const portal of ['finanse', 'nauka', 'historia', 'prawo']) {
    const firstHtml = fs
      .readdirSync(path.join(ROOT, portal))
      .find((f) => f.endsWith('.html') && f !== 'index.html' && !f.startsWith('art-'));
    assert.ok(firstHtml, `Expected static article in ${portal}/`);
    sampleArticles.push(path.join(portal, firstHtml));
  }

  for (const rel of sampleArticles) {
    const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    assert.equal(html.includes('ccn-article-footer'), true, `${rel} missing ccn-article-footer`);
    assert.equal(html.includes(FB_URL), true, `${rel} missing official FB URL`);
    assert.equal(html.includes('<svg'), true, `${rel} missing FB SVG`);
  }
});

test('All active compiled portal JS bundles have official FB URL and pass syntax check', () => {
  const portals = [
    'news',
    'finanse',
    'nauka',
    'historia',
    'prawo',
    'biologia',
    'seks',
    'biblioteka',
    'kultura',
    'biznes',
    'kuchnia',
    'ziu',
    'ogloszenia',
    'wspolpraca',
    'edukacja',
    'psychologia',
    'technologie',
    'si',
    'misje',
    'apologetyka',
  ];

  const checkedBundles = new Set();
  for (const p of portals) {
    const html = fs.readFileSync(path.join(ROOT, `${p}.html`), 'utf8');
    const match = html.match(/src="\/(assets\/[^"]+\.js)"/);
    assert.ok(match, `Missing JS bundle reference in ${p}.html`);
    const bundleRel = match[1];
    if (checkedBundles.has(bundleRel)) continue;
    checkedBundles.add(bundleRel);

    const bundleFull = path.join(ROOT, bundleRel);
    const js = fs.readFileSync(bundleFull, 'utf8');
    assert.equal(js.includes('"https://facebook.com"'), false, `${bundleRel} still contains "https://facebook.com"`);
    assert.equal(js.includes('`https://facebook.com`'), false, `${bundleRel} still contains \`https://facebook.com\``);
    assert.equal(js.includes("'https://facebook.com'"), false, `${bundleRel} still contains 'https://facebook.com'`);

    if (!['kuchnia', 'wspolpraca'].includes(p)) {
      assert.equal(js.includes(FB_URL), true, `${bundleRel} missing official FB URL`);
    }
    execFileSync(process.execPath, ['--check', bundleFull], { stdio: 'pipe' });
  }
});

test('All 25 CCN thematic portal HTMLs and /index.html mirrors provide official FB footer integration', () => {
  const prebuiltPortals = [
    'nauka',
    'historia',
    'prawo',
    'biologia',
    'seks',
    'biblioteka',
    'kultura',
    'biznes',
    'kuchnia',
    'ziu',
    'ogloszenia',
    'wspolpraca',
    'edukacja',
    'psychologia',
    'technologie',
    'si',
    'misje',
    'apologetyka',
  ];

  for (const p of prebuiltPortals) {
    for (const rel of [`${p}.html`, path.join(p, 'index.html')]) {
      const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      assert.equal(html.includes('/js/ccn-footer-fb.js'), true, `${rel} missing /js/ccn-footer-fb.js`);
      assert.match(html, /src="\/js\/ccn-footer-fb\.js[^"]*"\s+defer/, `${rel} must load ccn-footer-fb.js with defer`);
    }
  }

  for (const p of ['network', 'survival', 'swiadectwa', 'em', 'motywacja']) {
    for (const rel of [`${p}.html`, path.join(p, 'index.html')]) {
      const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      assert.equal(html.includes(FB_URL), true, `${rel} missing native FB URL in footer`);
      assert.equal(html.includes('<svg'), true, `${rel} missing SVG logo in footer`);
    }
  }

  execFileSync(process.execPath, ['--check', path.join(ROOT, 'js/ccn-footer-fb.js')], { stdio: 'pipe' });
  execFileSync(process.execPath, ['--check', path.join(ROOT, 'components/cc-support-footer.js')], { stdio: 'pipe' });
});
