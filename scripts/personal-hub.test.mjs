import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 CC TEST SUITE: MOJE CENTRUM CC & ULUBIONE CC (PERSONAL HUB)');
console.log('═══════════════════════════════════════════════════════════════\n');

// 1. Test js/cc-favorites.js
console.log('--- 1. Testing js/cc-favorites.js ---');
const favScriptPath = path.join(rootDir, 'js', 'cc-favorites.js');
assert(fs.existsSync(favScriptPath), 'js/cc-favorites.js exists');

const favScriptContent = fs.readFileSync(favScriptPath, 'utf8');
const requiredMethods = [
  'isFavorite',
  'addFavorite',
  'removeFavorite',
  'toggleFavorite',
  'getFavorites',
  'onFavoritesChange',
  'getVisitHistory',
  'recordVisit',
  'clearVisitHistory',
  'setHistoryEnabled',
  'isHistoryEnabled'
];

requiredMethods.forEach(method => {
  assert(favScriptContent.includes(method), `CCFavorites exposes method '${method}'`);
});

assert(favScriptContent.includes('cc_user_favorites'), 'Uses localStorage cc_user_favorites fallback');
assert(favScriptContent.includes('cc_user_visit_history'), 'Uses localStorage cc_user_visit_history fallback');
assert(favScriptContent.includes('cc_history_settings') || favScriptContent.includes('setHistoryEnabled'), 'Supports user privacy toggle for visit history');
assert(favScriptContent.includes('favorites') && favScriptContent.includes('users/${uid}/favorites'), 'Synchronizes with Firestore /users/{userId}/favorites');
assert(favScriptContent.includes('min-height: 44px') || favScriptContent.includes('min-width: 44px') || favScriptContent.includes('44px'), 'Ergonomics: UI button has 44px touch targets');
assert(favScriptContent.includes('cc-topbar-fav-btn'), 'Defines top-bar star button styles (.cc-topbar-fav-btn)');
assert(favScriptContent.includes('ccTopBarFavBtn'), 'Defines top-bar star button ID (#ccTopBarFavBtn)');
assert(favScriptContent.includes('injectTopBarFavoriteButton'), 'Implements top-bar star button injection function');
assert(favScriptContent.includes('cc-floating-topbar-wrap'), 'Implements top-bar fallback floating wrap for pages without nav');
assert(favScriptContent.includes('.ak-header a[href*="patronite"]') && favScriptContent.includes('.cin-topbar .cin-btn-support'), 'Mounts #ccTopBarFavBtn in .ak-header / .cin-header / .cin-topbar before Patronite');
assert(!/\n\s*'nav'\s*\r?\n/.test(favScriptContent) && !favScriptContent.includes("selector === 'nav'"), 'Never mounts #ccTopBarFavBtn as loose "Ulubione" tile inside arbitrary <nav> (only .quick)');
assert(favScriptContent.includes('moje-centrum'), 'Toast notification links to Moje Centrum CC');

const pageStandardPath = path.join(rootDir, 'scripts', 'cc-page-standard.mjs');
const pageStandardContent = fs.readFileSync(pageStandardPath, 'utf8');
assert(pageStandardContent.includes('/js/cc-favorites.js?v=20261119_fav3'), 'cc-page-standard.mjs enforces updated cc-favorites.js?v=20261119_fav3');

// 2. Test firestore.rules
console.log('\n--- 2. Testing firestore.rules Security & Isolation ---');
const rulesPath = path.join(rootDir, 'firestore.rules');
assert(fs.existsSync(rulesPath), 'firestore.rules exists');

const rulesContent = fs.readFileSync(rulesPath, 'utf8');
assert(rulesContent.includes('match /favorites/{favId}'), 'Rules contain /favorites/{favId} match');
assert(rulesContent.includes('match /personal_hub/{docId}'), 'Rules contain /personal_hub/{docId} match');
assert(rulesContent.includes('match /history/{histId}'), 'Rules contain /history/{histId} match');

// Check strict security condition
const favoritesRule = rulesContent.slice(rulesContent.indexOf('match /favorites/{favId}'), rulesContent.indexOf('match /personal_hub/{docId}'));
assert(favoritesRule.includes('request.auth != null') || favoritesRule.includes('isMember()'), 'Favorites rule requires authenticated user');
assert(favoritesRule.includes('request.auth.uid == userId') || favoritesRule.includes('isOwner(userId)'), 'Favorites rule strictly isolates by userId');

const hubRule = rulesContent.slice(rulesContent.indexOf('match /personal_hub/{docId}'), rulesContent.indexOf('match /history/{histId}'));
assert(hubRule.includes('request.auth != null') || hubRule.includes('isMember()'), 'Personal Hub rule requires authenticated user');
assert(hubRule.includes('request.auth.uid == userId') || hubRule.includes('isOwner(userId)'), 'Personal Hub rule strictly isolates by userId');

const historyRule = rulesContent.slice(rulesContent.indexOf('match /history/{histId}'), rulesContent.indexOf('match /history/{histId}') + 300);
assert(historyRule.includes('request.auth != null') || historyRule.includes('isMember()'), 'History rule requires authenticated user');
assert(historyRule.includes('request.auth.uid == userId') || historyRule.includes('isOwner(userId)'), 'History rule strictly isolates by userId');

// 3. Test moje-centrum.html
console.log('\n--- 3. Testing moje-centrum.html Personal Hub Dashboard ---');
const hubPath = path.join(rootDir, 'moje-centrum.html');
assert(fs.existsSync(hubPath), 'moje-centrum.html exists');

const hubContent = fs.readFileSync(hubPath, 'utf8');
const requiredModules = [
  'Ulubione strony',
  'Ostatnio odwiedzane',
  'Moja muzyka',
  'Moja Akademia',
  'Moja Biblia',
  'Moja społeczność'
];

requiredModules.forEach(mod => {
  assert(hubContent.includes(mod), `Dashboard contains module: "${mod}"`);
});

// Verify Zero Fake Data
assert(!hubContent.includes('Jan Kowalski'), 'Zero fake user names');
assert(!hubContent.includes('ukończono 95% kursu biblijnego'), 'Zero fake course achievements');
assert(hubContent.includes('course_progress') || hubContent.includes('lumina_academy_local_completed'), 'Reads actual academy progress');
assert(hubContent.includes('cc_bu_favs'), 'Reads actual worship music favorites');
assert(hubContent.includes('mb_bookmarks'), 'Reads actual Bible bookmarks');

// Verify Theme Toggle
assert(hubContent.includes('themeToggleBtn') && hubContent.includes('applyTheme'), 'Contains dark/light theme switcher');
assert(hubContent.includes('lumina_theme'), 'Persists theme in localStorage (lumina_theme)');

// 4. Test lumina-profile.html Integration & Owner Isolation
console.log('\n--- 4. Testing lumina-profile.html Integration & Strict Privacy ---');
const profilePath = path.join(rootDir, 'lumina-profile.html');
assert(fs.existsSync(profilePath), 'lumina-profile.html exists');

const profileContent = fs.readFileSync(profilePath, 'utf8');
assert(profileContent.includes('id="tabBtnPersonalHub"'), 'Profile nav tabs contains tabBtnPersonalHub');
assert(profileContent.includes('id="tab-personal-hub"'), 'Profile panes contains tab-personal-hub');
assert(profileContent.includes('isPersonalOwner ? \'inline-flex\' : \'none\'') || profileContent.includes('isPersonalOwner ? "inline-flex" : "none"'), 'Personal hub tab visibility strictly gated by isPersonalOwner');
assert(profileContent.includes('renderProfilePersonalHubData()'), 'Renders personal hub data when active');
assert(profileContent.includes('/js/cc-favorites.js'), 'Includes /js/cc-favorites.js script');

// 5. Test _redirects Clean URLs
console.log('\n--- 5. Testing _redirects Clean Routing ---');
const redirectsPath = path.join(rootDir, '_redirects');
assert(fs.existsSync(redirectsPath), '_redirects exists');
const redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
assert(redirectsContent.includes('/moje-centrum /moje-centrum 200') || redirectsContent.includes('/moje-centrum /moje-centrum.html 200'), '_redirects routes /moje-centrum');

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('🎉 ALL MOJE CENTRUM CC & ULUBIONE TESTS PASSED (100% PASS)');
console.log('═══════════════════════════════════════════════════════════════\n');
