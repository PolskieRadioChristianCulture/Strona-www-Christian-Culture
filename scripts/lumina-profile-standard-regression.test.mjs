import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const profileFiles = [
  'lumina.mariusz.html', // Reference profile
  'lumina-profile.html', // Universal / new accounts profile
  'lumina.cezaryrgowski.html',
  'lumina.wiolettarogowska.html',
  'lumina.studiodobregoslowa.html',
  'lumina.andrzejthiel.html',
  'lumina.ccmen.html',
  'lumina.cctv.html',
  'lumina.ccwomen.html',
  'lumina.jolawojcik.html',
  'lumina.magdalena.html',
  'lumina.osobowoscplus.html',
  'lumina.pawelmurawski.html',
  'lumina.radiocc.html',
  'lumina.zofiadudek.html',
];

test('1. Avatar preserves 1:1 aspect ratio and circular clipping', async () => {
  const css = await readFile('css/lumina-profile-standard.css', 'utf8');
  assert.match(css, /aspect-ratio:\s*1 \/ 1 !important/);
  assert.match(css, /border-radius:\s*50% !important/);
});

test('2. Avatar uses object-fit: cover and object-position: center', async () => {
  const css = await readFile('css/lumina-profile-standard.css', 'utf8');
  assert.match(css, /object-fit:\s*cover !important/);
  assert.match(css, /object-position:\s*center/);
  assert.doesNotMatch(css, /object-fit:\s*fill/);
});

test('3. Cover implements official 3:1 ratio and responsive fluid height', async () => {
  const css = await readFile('css/lumina-profile-standard.css', 'utf8');
  assert.match(css, /\.cover-wrapper[\s\S]*aspect-ratio:\s*3 \/ 1 !important/);
  assert.match(css, /\.cover-photo[\s\S]*object-fit:\s*cover !important/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*aspect-ratio:\s*16 \/ 7 !important/);
});

test('4. Avatar responsive dimensions: desktop 160px, tablet 128px, mobile 96px, small mobile min 88px', async () => {
  const css = await readFile('css/lumina-profile-standard.css', 'utf8');
  // Desktop
  assert.match(css, /width:\s*160px !important;/);
  assert.match(css, /height:\s*160px !important;/);
  // Tablet
  assert.match(css, /@media \(min-width: 769px\) and \(max-width: 1024px\)[\s\S]*width:\s*128px !important;/);
  // Mobile
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*width:\s*96px !important;/);
  // Small mobile
  assert.match(css, /@media \(max-width: 360px\)[\s\S]*width:\s*88px !important;/);
});

test('5. Avatar overlapping cover edge: -80px desktop, -64px tablet, -48px mobile, -44px small mobile', async () => {
  const css = await readFile('css/lumina-profile-standard.css', 'utf8');
  assert.match(css, /margin-top:\s*-80px !important;/);
  assert.match(css, /@media \(min-width: 769px\) and \(max-width: 1024px\)[\s\S]*margin-top:\s*-64px !important;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*margin-top:\s*-48px !important;/);
  assert.match(css, /@media \(max-width: 360px\)[\s\S]*margin-top:\s*-44px !important;/);
});

test('6. Mobile protection: overflow-x clip and no text collisions', async () => {
  const css = await readFile('css/lumina-profile-standard.css', 'utf8');
  assert.match(css, /overflow-x:\s*clip !important/);
  assert.match(css, /overflow-wrap:\s*anywhere !important/);
});

test('7. Shared component enforcement across all profiles (including reference /mariusz)', async () => {
  for (const file of profileFiles) {
    const html = await readFile(file, 'utf8');
    assert.match(
      html,
      /lumina-profile-standard\.css/,
      `${file} must link shared lumina-profile-standard.css`
    );
    assert.match(
      html,
      /<body[^>]*class="[^"]*lumina-profile-standard[^"]*"/,
      `${file} must declare body class lumina-profile-standard`
    );
  }
});

test('8. Reference profile /mariusz (lumina.mariusz.html) adheres to standard', async () => {
  const html = await readFile('lumina.mariusz.html', 'utf8');
  assert.match(html, /class="cover-wrapper lumina-profile-cover"/);
  assert.match(html, /class="avatar-wrap hero-avatar-wrap"/);
  assert.match(html, /class="avatar-img hero-avatar-img lumina-profile-avatar"/);
  assert.match(html, /alt="Zdjęcie profilowe Mariusz „Złota Rączka”"/);
  assert.match(html, /lumina-profile-standard\.js/);
});

test('9. Universal profile template lumina-profile.html adheres to standard', async () => {
  const html = await readFile('lumina-profile.html', 'utf8');
  assert.match(html, /class="cover-wrapper"/);
  assert.match(html, /class="avatar-wrap"/);
  assert.match(html, /class="avatar-img"/);
  assert.match(html, /lumina-profile-standard\.js/);
});

test('10. Shared runtime module enforces default fallbacks and alt tags', async () => {
  const js = await readFile('js/lumina-profile-standard.js', 'utf8');
  assert.match(js, /lumina_icon\.jpg/);
  assert.match(js, /lumina_default_cover\.jpg/);
  assert.match(js, /Zdjęcie profilowe/);
  assert.match(js, /LuminaProfileStandard/);
});

test('11. Nested OSOBOWOSC alias resolves logo, cover and entry scripts from root', async () => {
  const html = await readFile('lumina.osobowoscplus.html', 'utf8');
  assert.match(html, /<base href="\/">/);
  assert.ok(html.indexOf('<base href="/">') < html.indexOf('src='));
  for (const path of ['logo_osobowosc_plus.jpg', 'lumina_default_cover.jpg', 'lumina-db.js', 'kino-live.html']) {
    const base = new URL('/', 'https://polskieradio.cc/lumina/osobowoscplus');
    assert.equal(new URL(path, base).pathname, '/' + path);
  }
  assert.match(html, /20261114_profile_avatar_v8/);

  const wiolettaHtml = await readFile('lumina.wiolettarogowska.html', 'utf8');
  assert.match(wiolettaHtml, /<base href="\/">/);
  assert.ok(wiolettaHtml.indexOf('<base href="/">') < wiolettaHtml.indexOf('src='));

  const cezaryHtml = await readFile('lumina.cezaryrgowski.html', 'utf8');
  assert.match(cezaryHtml, /<base href="\/">/);
  assert.ok(cezaryHtml.indexOf('<base href="/">') < cezaryHtml.indexOf('src='));
});

test('12. Legacy profile navigation, titles and cards have explicit light styles', async () => {
  const css = await readFile('css/lumina-profile-standard.css', 'utf8');
  assert.match(css, /html\[data-lumina-theme="light"\] body\.lumina-profile-standard :is\(\.profile-navbar, \.side-card, \.feed-post-card\)\s*\{\s*background: #ffffff !important/);
  assert.match(css, /\.profile-title-name, \.side-title, \.post-title, \.post-author-name/);
  assert.match(css, /\.nav-brand-title\s*\{[^}]*-webkit-text-fill-color: #292524 !important/);
});

test('13. Mobile header standard: avatar centred on the cover edge, details centred, tabs in a grid', async () => {
  const css = await readFile('css/lumina-profile-standard.css', 'utf8');
  const block = css.slice(css.indexOf('9. MOBILE PROFILE HEADER'));
  assert.match(css, /\.profile-head-top,\s*\r?\nbody\.lumina-profile-standard\s+\.profile-head-main\s*\{[^}]*overflow:\s*visible\s*!important/);
  assert.match(css, /body\.lumina-profile-standard\s+\.profile-head-top\s*\{[^}]*overflow:\s*visible\s*!important/);
  assert.match(css, /body\.lumina-profile-standard\s+\.profile-head-main\s*\{[^}]*overflow:\s*visible\s*!important/);
  assert.match(block, /:is\(\.profile-head-top,\s*\.hero-head-top\)\s*\{[^}]*overflow:\s*visible\s*!important/);
  assert.match(block, /\.profile-head-main\s*\{[^}]*overflow:\s*visible\s*!important/);
  assert.ok(block.length > 100, 'mobile header block present');
  assert.match(block, /\.profile-head-main \{[^}]*margin-top: 0 !important/);
  assert.match(block, /align-self: center !important;\s*margin: -48px auto 0 !important/);
  assert.match(block, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important/);
  assert.match(block, /\.cover-hint-badge \{[^}]*bottom: auto !important/);
  for (const file of profileFiles) {
    const html = await readFile(file, 'utf8');
    assert.match(html, /lumina-profile-standard\.css\?v=20261114_profile_avatar_v8/, `${file} must load the current profile standard`);
    assert.doesNotMatch(
      html,
      /\.profile-head-(?:card|top|main)[^{}]*\{[^}]*overflow\s*:\s*hidden\s*!important/i,
      `${file} must not clip profile avatar with overflow: hidden !important`
    );
  }
});
