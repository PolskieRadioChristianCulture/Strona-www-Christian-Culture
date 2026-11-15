import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import './quick-post-release-regression.test.mjs';

const mobilePages = [
  'lumina.html',
  'lumina-tablica.html',
  'lumina-profile.html',
  'lumina.cezaryrgowski.html',
  'lumina.wiolettarogowska.html',
  'lumina.ccwomen.html',
  'lumina-shorts.html',
  'rolki.html',
];

const standardizedProfilePages = [
  'lumina-profile.html',
  'lumina.andrzejthiel.html',
  'lumina.ccmen.html',
  'lumina.cctv.html',
  'lumina.ccwomen.html',
  'lumina.cezaryrgowski.html',
  'lumina.wiolettarogowska.html',
  'lumina.jolawojcik.html',
  'lumina.magdalena.html',
  'lumina.mariusz.html',
  'lumina.osobowoscplus.html',
  'lumina.pawelmurawski.html',
  'lumina.radiocc.html',
  'lumina.studiodobregoslowa.html',
  'lumina.zofiadudek.html',
];

test('every primary Lumina surface loads the shared mobile layer once', async () => {
  for (const file of mobilePages) {
    const html = await readFile(file, 'utf8');
    const links = html.match(/css\/lumina-mobile-premium\.css(?:\?[^"'>\s]+)?/g) || [];
    assert.equal(links.length, 1, `${file} must load the mobile layer exactly once`);
  }
});

test('mobile layer provides Android-safe layout and interaction safeguards', async () => {
  const css = await readFile('css/lumina-mobile-premium.css', 'utf8');
  assert.match(css, /--lumina-mobile-target:\s*44px/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.doesNotMatch(css, /content-visibility:\s*auto/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.shorts-scroll-container \.slide-info-box[\s\S]*bottom:\s*calc\(64px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(css, /#profilesCarousel[\s\S]*overflow-y:\s*hidden/);
  assert.match(css, /touch-action:\s*pan-y pinch-zoom/);
  assert.match(css, /#profilesCarousel \.profile-card\.active-center-card[\s\S]*transform:\s*none/);
  assert.match(css, /max-width:\s*380px[\s\S]*\.btn-nav-more[\s\S]*display:\s*none/);
  assert.match(css, /\.shorts-header \.header-title-box[\s\S]*display:\s*none/);
});

test('every full profile uses the shared late-loading layout contract', async () => {
  for (const file of standardizedProfilePages) {
    const html = await readFile(file, 'utf8');
    const standardLinks = html.match(/css\/lumina-profile-standard\.css(?:\?[^"'>\s]+)?/g) || [];
    assert.equal(standardLinks.length, 1, `${file} must load the profile standard exactly once`);
    assert.match(html, /<body[^>]*class="[^"]*lumina-profile-standard[^"]*"/,
      `${file} must opt into the profile standard`);
    assert.ok(
      html.indexOf('lumina-profile-standard.css') > html.indexOf('lumina-mobile-premium.css'),
      `${file} must load the profile standard after legacy mobile overrides`,
    );
  }
});

test('profile standard preserves readable controls and stable responsive geometry', async () => {
  const css = await readFile('css/lumina-profile-standard.css', 'utf8');
  assert.match(css, /--profile-shell-width:\s*1200px/);
  assert.match(css, /\.cover-wrapper[\s\S]*aspect-ratio:\s*3 \/ 1 !important/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*aspect-ratio:\s*16 \/ 7 !important/);
  assert.match(css, /\.head-actions[\s\S]*overflow-x:\s*auto !important/);
  assert.match(css, /\.profile-nav-tabs[\s\S]*\.tab-text[\s\S]*display:\s*inline !important/);
  assert.match(css, /env\(safe-area-inset-bottom/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('current and future profile posts expose exactly three project support methods', async () => {
  const surfaces = ['lumina-tablica.html', ...standardizedProfilePages];
  for (const file of surfaces) {
    const html = await readFile(file, 'utf8');
    const scripts = html.match(/js\/lumina-support-project\.js(?:\?[^"'>\s]+)?/g) || [];
    assert.equal(scripts.length, 1, `${file} must load the support action exactly once`);
  }

  const support = await readFile('js/lumina-support-project.js', 'utf8');
  assert.match(support, /MutationObserver/);
  assert.match(support, /querySelectorAll\?\.\('\.post-card'\)/);
  assert.match(support, />Wspieraj projekt</);
  assert.match(support, /537 137 043/);
  assert.match(support, /https:\/\/revolut\.me\/christianculture/);
  assert.match(support, /https:\/\/patronite\.pl\/osobowoscplus/);
  assert.match(support, /live\|broadcast\|transmisj\|stream/);
});

test('repository policy makes the canonical profile standard a guarded invariant', async () => {
  const agents = await readFile('AGENTS.md', 'utf8');
  const guardian = await readFile('scripts/straznik-kodu-check.js', 'utf8');
  assert.match(agents, /REGUŁA NADRZĘDNA PROFILI LUMINA — JEDEN STANDARD/);
  assert.match(agents, /Nowy użytkownik jest rekordem danych, nie nowym plikiem HTML/);
  assert.match(agents, /LUMINA_PROFILE_EXCEPTION: approved-by=Cezary Rogowski/);
  assert.match(guardian, /L-NEW-DEDICATED-PROFILE-FORBIDDEN/);
  assert.match(guardian, /L-PROFILE-STANDARD-MISSING/);
  assert.match(guardian, /L-UNAPPROVED-PROFILE-OVERRIDE/);
  assert.match(guardian, /checkLuminaProfileStandard\(\)/);
});

test('feed progressively renders posts and preserves notification deep links', async () => {
  const html = await readFile('lumina-tablica.html', 'utf8');
  assert.match(html, /const FEED_PAGE_SIZE = 8/);
  assert.match(html, /window\.loadMoreFeedItems = function/);
  assert.match(html, /combined\.slice\(0, renderLimit\)/);
  assert.match(html, /urlParams\.get\('postId'\)/);
  assert.match(html, /renderLimit = Math\.max\(renderLimit, deepLinkIndex \+ 1\)/);
  assert.match(html, /class="feed-load-more-btn"/);
  assert.match(html, /aria-live="polite"/);
});

test('narrow-phone settings stay available when the compact action is hidden', async () => {
  for (const file of mobilePages.slice(0, 5)) {
    const html = await readFile(file, 'utf8');
    assert.match(html, /Ustawienia aplikacji/,
      `${file} must expose settings in the navigation drawer`);
  }
});

test('homepage carousel distinguishes vertical scrolling from a profile tap', async () => {
  const html = await readFile('lumina.html', 'utf8');
  assert.match(html, /class="profile-card video-card featured original-promo-card" id="promoAdCard3"/);
  assert.doesNotMatch(html, /\nid="promoAdCard3"/);
  assert.match(html, /const deltaY = Math\.abs\(touch\.clientY - _carouselPointerStartY\)/);
  assert.match(html, /const isGesture = _carouselGestureMoved \|\| deltaX > 8 \|\| deltaY > 8 \|\| scrollDelta > 8/);
  assert.match(html, /const isHorizontalSwipe = deltaX > 40 && deltaX > deltaY \* 1\.2/);
  assert.match(html, /carousel\.addEventListener\('wheel',[\s\S]*window\.scrollBy\(0, e\.deltaY\)[\s\S]*passive: false/);
  assert.match(html, /_suppressCarouselClickUntil = Date\.now\(\) \+ 500/);
  assert.match(html, /carousel\.addEventListener\('touchcancel'/);
  assert.match(html, /carousel\.addEventListener\('click',[\s\S]*\{ capture: true \}\)/);
});

test('registration starts cleanly and guest-only services stay quiet', async () => {
  const html = await readFile('lumina.html', 'utf8');
  const badges = await readFile('lumina-badges-engine.js', 'utf8');
  const typing = await readFile('lumina-chat-typing.js', 'utf8');

  assert.match(html, /Dołącz bezpłatnie<\/span><span>Zacznij w minutę/); // dwie linijki (decyzja Dowódcy 2026-10-11)
  assert.match(html, /id="btnGoogleRegister"[\s\S]*Zacznij przez Google/);

  const stepTwoGuard = html.slice(
    html.indexOf('window.goToWizardStep = function(step)'),
    html.indexOf('window.handleObAvatarChange')
  );
  assert.doesNotMatch(stepTwoGuard, /obTermsAccepted/);
  assert.match(badges, /if \(hasAuthenticatedUser\(\)\)[\s\S]*checkInDailyActivity\(\)/);
  assert.match(typing, /!hasAuthenticatedUser\(\)/);
});

test('homepage keeps product features behind account creation', async () => {
  const html = await readFile('lumina.html', 'utf8');

  assert.match(html, /<body class="user-is-guest">/);
  assert.match(html, /id="luminaGuestConversionMode"/);
  assert.match(html, /body\.user-is-guest \.discovery-filters-wrap/);
  assert.match(html, /body\.user-is-guest #strefaMisyjna/);
  assert.match(html, /body\.user-is-guest #luminaBottomNav/);
  assert.match(html, /body\.user-is-guest #lumina-notification-center/);
  assert.match(html, /body\.user-is-guest \.card-heart/);
  assert.match(html, /id="guestCarouselCta"[\s\S]*Załóż profil/);
  assert.match(html, /window\.setLuminaAuthView = function\(isAuthenticated\)/);
  assert.match(html, /classList\.toggle\('user-is-authenticated', Boolean\(isAuthenticated\)\)/);
  assert.match(html, /classList\.toggle\('user-is-guest', !isAuthenticated\)/);
  assert.match(html, /window\.setLuminaAuthView\(Boolean\(user\)\)/);
});

test('carousel activity controls stay separated and post counts use published profile data', async () => {
  const html = await readFile('lumina.html', 'utf8');

  assert.match(html, /\.card-activity-badges\s*\{[\s\S]*?top:\s*60px;[\s\S]*?gap:\s*10px;/);
  assert.match(html, /@media \(max-width: 900px\)[\s\S]*?\.card-activity-badges\s*\{[\s\S]*?top:\s*68px;[\s\S]*?gap:\s*12px;/);
  assert.match(html, /window\.LuminaDB\.getAuthorPosts\(slug, name\)/);
  assert.match(html, /post\.published !== false/);
  assert.match(html, /window\.addEventListener\('lumina_post_published'/);
  assert.doesNotMatch(html, /cleanSlug\.includes\('pawel'\)[\s\S]*?count = 2/);
  assert.doesNotMatch(html, /Andrzej Hamera – 2 wpisy/);
});

test('Hamera profile uses the kitchen-furniture identity and excludes Thiel posts', async () => {
  const profile = await readFile('lumina-profile.html', 'utf8');
  const profilesDb = await readFile('js/lumina-db-profiles.js', 'utf8');
  const db = await readFile('lumina-db.js', 'utf8');
  assert.match(profile, /Studio Mebli Kuchennych na Wymiar/);
  assert.match(profilesDb, /Studio Mebli Kuchennych na Wymiar/);
  assert.match(db, /isHameraProfile[\s\S]*isThielPost[\s\S]*if \(isHameraProfile && isThielPost\) return/);
  assert.match(db, /searchablePostText[\s\S]*p\.title[\s\S]*p\.text/);
  assert.match(db, /post_ah_film_hf3h8guGxkc[\s\S]*Hf3h8guGxkc/);
  assert.match(db, /s\.includes\('hamera'\)[\s\S]*return null/);
  assert.match(profile, /post_ah_film_hf3h8guGxkc[\s\S]*Hf3h8guGxkc/);
  assert.match(profilesDb, /post_ah_film_hf3h8guGxkc[\s\S]*Hf3h8guGxkc/);
  // 2026-10-07: jedna wspólna wersja modułu lumina-db na wszystkich stronach (inaczej przeglądarka ładuje kilka kopii)
  assert.match(profile, /lumina-db\.js\?v=20261013_notifsafe1/);
  assert.match(profile, /avatar_andrzej_hamera\.jpg/);
  assert.match(db, /avatar_andrzej_hamera\.jpg/);
  assert.doesNotMatch(profile.slice(profile.indexOf("'andrzejhamera':"), profile.indexOf("'u_andrzejhamera':")), /Studio Reklamy|Poligraf/i);

  const luminaHtml = await readFile('lumina.html', 'utf8');
  assert.match(luminaHtml, /exactSystemSlugs[\s\S]*'andrzejhamera'/);
  assert.match(luminaHtml, /renderedNames[\s\S]*'andrzej hamera'/);
});

test('master admin HUD requires verified Firebase Auth and prevents duplicate bars or PIN bypasses', async () => {
  const profile = await readFile('lumina-profile.html', 'utf8');
  const adminSuite = await readFile('lumina-admin-profile-suite.js', 'utf8');
  const security = await readFile('lumina-security.js', 'utf8');
  const bottomNav = await readFile('lumina-bottom-nav.js', 'utf8');
  assert.doesNotMatch(profile, /<div class="admin-master-hud" id="adminMasterHud">/);
  assert.doesNotMatch(profile, /if \(uSlug === 'cezaryrgowski'\) isMaster = true/);
  for (const [name, src] of [['profile', profile], ['adminSuite', adminSuite], ['security', security], ['bottomNav', bottomNav]]) {
    assert.doesNotMatch(src, /eec0ae2663b74fdb9fb9981e92f1b2cc/, name + ': hardcoded admin PIN hash must stay removed');
    assert.doesNotMatch(src, /sessionStorage\.getItem\('lumina_auth_master_admin'\)/, name + ': spoofable sessionStorage admin check must stay removed');
    assert.doesNotMatch(src, /localStorage\.getItem\('lumina_auth_master_admin'\)/, name + ': spoofable localStorage admin check must stay removed');
  }
  assert.match(adminSuite, /window\.LuminaGuard\.isMasterAdmin\(\)/);
  assert.match(security, /LuminaGuard\.isMasterAdmin/);
});

test('registration requires explicit privacy consent and avoids fake verification', async () => {
  const html = await readFile('lumina.html', 'utf8');
  assert.match(html, /id="obTermsAccepted" required(?![^>]*checked)/);
  assert.match(html, /id="obSensitiveDataConsent" required(?![^>]*checked)/);
  assert.match(html, /if \(!document\.getElementById\('obSensitiveDataConsent'\)\?\.checked\)/);
  assert.match(html, /sensitiveDataConsent: true/);
  assert.match(html, /isVerified: false/);
  assert.doesNotMatch(html, /eec0ae2663b74fdb9fb9981e92f1b2cc/);
});

test('privacy policy reflects Lumina data processing and user rights', async () => {
  const policy = await readFile('privacy.html', 'utf8');
  assert.match(policy, /szczególne kategorie danych|danych szczególnych kategorii/);
  assert.match(policy, /art\. 9 ust\. 2 lit\. a RODO/);
  assert.match(policy, /Google(\s+Cloud|\s+OAuth)?\s*\/\s*Firebase/);
  assert.match(policy, /prawo do wglądu|prawo żądać dostępu/i);
  assert.doesNotMatch(policy, /nie gromadzą ani nie przechowują żadnych danych osobowych/i);
  assert.doesNotMatch(policy, /googletagmanager/);
});

test('public copy avoids absolute safety claims and stale invite links', async () => {
  const home = await readFile('lumina.html', 'utf8');
  const feed = await readFile('lumina-tablica.html', 'utf8');
  assert.doesNotMatch(home, /Zero Fake \/ Zero Botów|Vision AI|lumina\.christianculture\.pl/);
  assert.doesNotMatch(feed, /100% bezpieczeństwa|Infolinia \+48 730/);
  assert.match(home, /https:\/\/polskieradio\.cc\/lumina/);
});

test('post publishing requires Firestore confirmation and authenticated ownership', async () => {
  const db = await readFile('lumina-db.js', 'utf8');
  const feed = await readFile('lumina-tablica.html', 'utf8');
  const profile = await readFile('lumina-profile.html', 'utf8');
  const composer = await readFile('js/lumina-messenger-composer.js', 'utf8');

  assert.match(db, /const authorUid = postData\.authorUid \|\| authenticatedUser\?\.uid \|\| null/);
  assert.match(db, /authorUid: authorUid/);
  assert.match(db, /cloudDocumentId = cloudDoc\.id/);
  assert.match(feed, /publishUniversalPost\(newPost\)/);
  assert.match(profile, /if \(!publishedPost\?\.cloudDocumentId\)/);
  assert.match(composer, /if \(!publishedPost\?\.cloudDocumentId\)/);
  assert.match(feed, /compressAndReadImage\(file, 900, 900, 0\.82/);
});


test('badz-blisko shows only one day at a time and keeps favorite + auth in right header across all 8 languages', async () => {
  const dirs = ['', 'en/', 'es/', 'pt/', 'fr/', 'ar/', 'hi/', 'id/'];
  for (const d of dirs) {
    const file = `badz-blisko/${d}index.html`;
    const html = await readFile(file, 'utf8');
    assert.match(html, /<main class="body" id="plan"><nav class="days">/, `${file} must have <main id="plan"><nav class="days">`);
    const dayLinks = html.match(/<nav class="days">[\s\S]*?<\/nav>/)?.[0]?.match(/href="#day-[1-7]"/g) || [];
    assert.equal(dayLinks.length, 7, `${file} must have 7 day navigation links`);
    assert.match(html, /<section class="reading" id="day-1">/, `${file} must show day-1 by default`);
    for (let day = 2; day <= 7; day++) {
      assert.match(
        html,
        new RegExp(`<section class="reading" id="day-${day}" hidden>`),
        `${file} must hide day-${day} by default so all 7 days are never exposed at once`
      );
    }
    assert.match(html, /\/badz-blisko\/dni\.js/, `${file} must load dni.js controller`);
    assert.match(html, /<div class="header-right">[\s\S]*?id="ccTopBarFavBtn"[\s\S]*?data-cc-auth-mount/, `${file} must keep star and auth in .header-right`);
  }
});
