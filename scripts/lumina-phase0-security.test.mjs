import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function readText(rel) {
  return fs.readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
}

test('P0 auth hardening: no plaintext PIN prompts or hardcoded admin PIN hashes in LUMINA pages', () => {
  const checkedFiles = [
    'lumina.html',
    'lumina-tablica.html',
    'lumina-tablica-light.html',
    'lumina-profile.html',
    'lumina.jolawojcik.html',
    'lumina.studiodobregoslowa.html',
    'lumina.pawelmurawski.html',
    'lumina.zofiadudek.html',
    'lumina.radiocc.html',
    'lumina.cezaryrgowski.html',
    'lumina.wiolettarogowska.html',
    'lumina-security.js',
    'lumina-admin-profile-suite.js',
    'lumina-bottom-nav.js',
    'js/lumina-messenger-composer.js',
    'js/lumina-admin-media-replacer.js',
    'js/lumina-followed-friends.js',
    'js/lumina-start-preferences.js',
    'lumina-sharing-suite.js',
  ];

  for (const file of checkedFiles) {
    const src = readText(file);
    assert.doesNotMatch(src, /eec0ae2663b74fdb9fb9981e92f1b2cc/, `${file}: hardcoded SHA-256 PIN hash`);
    assert.doesNotMatch(src, /cleanPin === '7777'|pin === '7777'|val === '7777'/, `${file}: hardcoded PIN 7777 check`);
    assert.doesNotMatch(src, /function setupAdminCezarySession/, `${file}: insecure admin session backdoor`);
    assert.doesNotMatch(src, /localStorage\.getItem\('lumina_auth_master_admin'\)/, `${file}: spoofable localStorage admin flag`);
    assert.doesNotMatch(src, /sessionStorage\.getItem\('lumina_auth_master_admin'\)/, `${file}: spoofable sessionStorage admin flag`);
    assert.doesNotMatch(src, /Wpisz PIN/, `${file}: plaintext PIN prompt must stay removed`);
  }
});

test('P0 database auth: isLuminaMasterAdmin and isCommunityAdmin reject spoofed storage and unverified users', () => {
  const dbSource = readText('lumina-db.js');
  const start = dbSource.indexOf('export const LUMINA_OFFICIAL_ACCOUNTS');
  const end = dbSource.indexOf('const OFFICIAL_ID_TO_SLUG');
  assert.ok(start > 0 && end > start);

  const snippet = dbSource
    .slice(start, end)
    .replaceAll('export const ', 'const ')
    .replaceAll('export function ', 'function ');

  function makeStorage(entries = {}) {
    const m = new Map(Object.entries(entries));
    return { getItem: (k) => (m.has(k) ? m.get(k) : null) };
  }

  const sandbox = {
    currentUserState: null,
    currentProfileState: { slug: 'cezaryrgowski', isAdmin: true, isFounder: true, isMissionAccount: true },
    localStorage: makeStorage({
      lumina_auth_master_admin: 'true',
      lumina_admin: '1',
      lumina_auth_owner_cezaryrgowski: 'true',
    }),
    sessionStorage: makeStorage({
      lumina_auth_master_admin: 'true',
      lumina_admin: '1',
    }),
  };

  vm.runInNewContext(
    `${snippet}
     globalThis._testResult = {
       guestMaster: isLuminaMasterAdmin(null),
       guestCommunity: isCommunityAdmin(null, 'cezaryrgowski', { slug: 'cezaryrgowski', isAdmin: true }),
       anonAdminEmail: isLuminaMasterAdmin({ isAnonymous: true, email: 'nazirczarkes@gmail.com', emailVerified: true }),
       unverifiedAdminEmail: isLuminaMasterAdmin({ isAnonymous: false, email: 'nazirczarkes@gmail.com', emailVerified: false }),
       unverifiedCommunity: isCommunityAdmin({ isAnonymous: false, email: 'nazirczarkes@gmail.com', emailVerified: false }, 'cezaryrgowski', null),
       regularUserSpoofFrom: isCommunityAdmin({ isAnonymous: false, uid: 'u1', email: 'user@example.com', emailVerified: true }, 'cezaryrgowski', { slug: 'cezaryrgowski', isAdmin: true }),
       verifiedAdminEmail: isLuminaMasterAdmin({ isAnonymous: false, email: 'nazirczarkes@gmail.com', emailVerified: true }),
       verifiedClaimAdmin: isLuminaMasterAdmin({ isAnonymous: false, customClaims: { admin: true }, email: 'delegate@example.com', emailVerified: true }),
       verifiedCommunity: isCommunityAdmin({ isAnonymous: false, email: 'nazirczarkes@gmail.com', emailVerified: true }, null, null),
     };`,
    sandbox
  );

  const r = sandbox._testResult;
  assert.equal(r.guestMaster, false);
  assert.equal(r.guestCommunity, false);
  assert.equal(r.anonAdminEmail, false);
  assert.equal(r.unverifiedAdminEmail, false);
  assert.equal(r.unverifiedCommunity, false);
  assert.equal(r.regularUserSpoofFrom, false);
  assert.equal(r.verifiedAdminEmail, true);
  assert.equal(r.verifiedClaimAdmin, true);
  assert.equal(r.verifiedCommunity, true);
});

test('P0 doctrine & matching: same-sex matrimonial match is strictly 0% in both lumina-core.js and lumina-db.js', () => {
  const coreSrc = readText('lumina-core.js');
  const coreStart = coreSrc.indexOf('class LuminaCoreEngine');
  const coreEnd = coreSrc.indexOf('window.LuminaCore =');
  const coreSandbox = {
    LuminaDB: {},
    console: { log() {}, warn() {}, error() {} },
    setTimeout: () => 0,
    window: { addEventListener: () => {}, LuminaDB: {}, location: { search: '', pathname: '/lumina.html', href: 'https://polskieradio.cc/lumina.html' } },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    document: {
      readyState: 'complete',
      addEventListener: () => {},
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      head: { appendChild: () => {}, insertAdjacentHTML: () => {} },
      body: { appendChild: () => {}, insertAdjacentHTML: () => {} },
    },
  };
  vm.runInNewContext(
    `${coreSrc.slice(coreStart, coreEnd)}
     const engine = new LuminaCoreEngine();
     globalThis._coreScores = {
       missing: engine.calculateMatchScore(null, { name: 'Adam' }),
       mission: engine.calculateMatchScore({ gender: 'kobieta' }, { isMissionAccount: true, name: 'Radio CC' }),
       sameMale: engine.calculateMatchScore({ gender: 'mezczyzna', denom: 'Katolik' }, { gender: 'mezczyzna', denom: 'Katolik' }),
       sameFemale: engine.calculateMatchScore({ status: 'Panna', denom: 'Katolik' }, { gender: 'kobieta', denom: 'Katolik' }),
       opposite: engine.calculateMatchScore({ gender: 'kobieta', denom: 'Katolik' }, { gender: 'mezczyzna', denom: 'Katolik' }),
     };`,
    coreSandbox
  );
  assert.equal(coreSandbox._coreScores.missing, null);
  assert.equal(coreSandbox._coreScores.mission, null);
  assert.equal(coreSandbox._coreScores.sameMale, 0);
  assert.equal(coreSandbox._coreScores.sameFemale, 0);
  assert.ok(coreSandbox._coreScores.opposite >= 50 && coreSandbox._coreScores.opposite <= 99);

  const dbSrc = readText('lumina-db.js');
  const dbStart = dbSrc.indexOf('export function detectProfileGender');
  const dbEnd = dbSrc.indexOf('window.calculateProfileMatchScore =');
  const dbSnippet = dbSrc.slice(dbStart, dbEnd).replaceAll('export function ', 'function ');
  const dbSandbox = { window: {}, localStorage: { getItem: () => null } };
  vm.runInNewContext(
    `${dbSnippet}
     const me = { slug: 'u_adam', name: 'Adam Kowalski', gender: 'mezczyzna', denom: 'Katolik' };
     globalThis._dbScores = {
       sameMale: calculateProfileMatchScore({ slug: 'u_piotr', name: 'Piotr Nowak', gender: 'mezczyzna', denom: 'Katolik' }, me),
       opposite: calculateProfileMatchScore({ slug: 'u_anna', name: 'Anna Nowak', gender: 'kobieta', denom: 'Katolik' }, me),
       unknownPlaceholder: detectProfileGender({ name: 'Użytkownik LUMINA' }),
     };`,
    dbSandbox
  );
  assert.equal(dbSandbox._dbScores.sameMale, '0%');
  assert.match(dbSandbox._dbScores.opposite, /^\d+%$/);
  assert.equal(dbSandbox._dbScores.unknownPlaceholder, 'unknown');
});

test('P0 cloud functions & rules: fail-closed ICC_SHARED_SECRET, strict storage.rules, accessible viewport, dead backups removed', () => {
  for (const fnPath of ['functions/lumina-photo-verification-functions.js', 'firebase_functions/lumina-photo-verification-functions.js']) {
    const src = readText(fnPath);
    assert.doesNotMatch(src, /icc_default_admin_secret_2026/, `${fnPath}: hardcoded fallback secret must not exist`);
    assert.match(src, /timingSafeEqual/, `${fnPath}: constant-time secret comparison required`);
    assert.match(src, /status\(503\)/, `${fnPath}: fail-closed 503 when secret is missing`);
  }

  const storageRules = readText('storage.rules');
  assert.match(storageRules, /rules_version = '2'/);
  assert.match(storageRules, /request\.auth\.uid == uid/);
  assert.match(storageRules, /allow read, write: if false;/);

  const fbJson = JSON.parse(readText('firebase.json'));
  assert.equal(fbJson.storage?.rules, 'storage.rules');

  for (const file of ['lumina-shorts.html', 'rolki.html']) {
    const html = readText(file);
    assert.doesNotMatch(html, /user-scalable=no|maximum-scale=1\.0/, `${file}: viewport pinch-zoom must not be disabled`);
  }

  assert.equal(fs.existsSync(new URL('../lumina-backup-before-minimalism.html', import.meta.url)), false);
  assert.equal(fs.existsSync(new URL('../replace_lumina.py', import.meta.url)), false);
});
