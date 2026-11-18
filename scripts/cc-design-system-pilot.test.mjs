import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import worker from '../_worker.js';
import { isPublicFile } from './cc-release-files.mjs';
import { support } from '../assets/cc-support/config.js';
import { SUPPORT_LOCALES, registerSupportLocale, getSupportDictionary } from '../assets/cc-support/i18n-support.js';

const designCoreCss = fs.readFileSync(new URL('../css/cc-design-core.css', import.meta.url), 'utf8');
const designCoreJs = fs.readFileSync(new URL('../js/cc-design-core.js', import.meta.url), 'utf8');
const pilotHtml = fs.readFileSync(new URL('../wspieraj-pilot.html', import.meta.url), 'utf8');
const pilotSubIndex = fs.readFileSync(new URL('../test/wspieraj/index.html', import.meta.url), 'utf8');
const prodHtml = fs.readFileSync(new URL('../wspieraj.html', import.meta.url), 'utf8');

test('CC Design Core defines canonical tokens, JOMA-D052 orange CTA, 44px touch target, archetypes and RTL logical properties', () => {
  for (const token of [
    '--cc-gold: #C4A35A',
    '--cc-gold-hover: #D4B578',
    '--cc-gold-light: #E2CC9A',
    '--cc-gold-dark: #A08040',
    '--cc-btn-orange: #FF7A00',
    '--cc-btn-orange-hover: #FF8C33',
    '--cc-btn-orange-active: #E66A00',
    '--cc-touch-min: 44px',
    '[data-cc-archetype="cinematic"]',
    '[data-cc-archetype="editorial"]',
    '[data-cc-archetype="audio"]',
    '[data-cc-archetype="giving"]',
    'prefers-reduced-motion: reduce',
    'margin-inline',
    'padding-inline',
    'border-inline-start',
  ]) {
    assert.ok(designCoreCss.includes(token), `Brak tokenu/reguły w css/cc-design-core.css: ${token}`);
  }
  assert.ok(designCoreJs.includes('ArrowRight') && designCoreJs.includes('ArrowLeft'), 'Brak obsługi strzałek klawiatury w zakładkach');
  assert.ok(designCoreJs.includes('prefers-reduced-motion: reduce'), 'JS Design Core musi respektować prefers-reduced-motion');
});

test('i18n-support covers PL, EN, DE, ES, FR cleanly and supports extensible missionary locales', () => {
  const requiredCodes = ['pl', 'en', 'de', 'es', 'fr'];
  const baseKeys = Object.keys(SUPPORT_LOCALES.pl);

  for (const code of requiredCodes) {
    const entry = SUPPORT_LOCALES[code];
    assert.ok(entry, `Brak języka: ${code}`);
    for (const key of baseKeys) {
      assert.ok(entry[key] !== undefined && entry[key] !== '', `Brak klucza "${key}" dla języka "${code}"`);
    }
  }

  assert.equal(registerSupportLocale('uk', { hero_badge: 'Christian Culture · UA' }), true);
  assert.equal(getSupportDictionary('uk').hero_badge, 'Christian Culture · UA');
  assert.equal(getSupportDictionary('uk').code, 'uk');
  delete SUPPORT_LOCALES.uk;
});

test('Pilot /test/wspieraj preserves 100% of verified payment methods and leaves production wspieraj.html intact', () => {
  assert.equal(pilotHtml, pilotSubIndex, 'wspieraj-pilot.html i test/wspieraj/index.html muszą być identyczne');

  for (const snippet of [
    '537 137 043',
    'Cezary Rogowski',
    '74 2910 0006 2469 8002 1062 8039',
    '48 2910 0006 0000 0000 0527 2629',
    'https://patronite.pl/osobowoscplus',
    'https://revolut.me/christianculture',
    'https://zrzutka.pl/rs4g4v',
    'https://zrzutka.pl/3bbxzn',
    'https://my-store-1009741.creator-spring.com/',
    '+48 507 821 789',
    'assets/cc-support/logo.png',
    'cc-btn-orange',
  ]) {
    assert.ok(pilotHtml.includes(snippet), `Pilotaż musi zachować zweryfikowany element: ${snippet}`);
  }

  assert.equal(support.blik, '537137043');
  assert.equal(support.accounts.length, 2);
  // @007 2026-11-18: L0 zatwierdził nową /wspieraj („✅ TAK, podmień”). Produkcja nie musi już być starym plikiem,
  // ale MUSI zachować 100% zweryfikowanych metod wsparcia i działający skrypt podziękowań/zgody.
  for (const snippet of ['537 137 043', 'Cezary Rogowski', '74 2910 0006 2469 8002 1062 8039', '48 2910 0006 0000 0000 0527 2629',
    'LT23 3250 0920 7156 6231', 'https://patronite.pl/osobowoscplus', 'https://revolut.me/christianculture', 'https://zrzutka.pl/rs4g4v',
    'https://zrzutka.pl/3bbxzn', 'https://my-store-1009741.creator-spring.com/', '+48 507 821 789', 'assets/cc-support/support.js',
    'id="consent-form"', 'id="thanks-list"']) {
    assert.ok(prodHtml.includes(snippet), `wspieraj.html musi zachować zweryfikowany element: ${snippet}`);
  }
});

test('Worker routes /test/wspieraj cleanly with security & noindex headers and release builder allows test/wspieraj/index.html', async () => {
  assert.equal(isPublicFile('wspieraj-pilot.html'), true);
  assert.equal(isPublicFile('test/wspieraj/index.html'), true);
  assert.equal(isPublicFile('css/cc-design-core.css'), true);
  assert.equal(isPublicFile('js/cc-design-core.js'), true);

  let fetchedPath = '';
  const env = {
    ASSETS: {
      fetch: async (request) => {
        fetchedPath = new URL(request.url).pathname;
        return new Response('<!doctype html><title>Pilot</title>', { status: 200 });
      },
    },
  };

  const pilotResp = await worker.fetch(new Request('https://polskieradio.cc/test/wspieraj'), env);
  assert.equal(pilotResp.status, 200);
  assert.equal(fetchedPath, '/wspieraj-pilot.html');
  assert.equal(pilotResp.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  assert.equal(pilotResp.headers.get('X-Content-Type-Options'), 'nosniff');

  const prodResp = await worker.fetch(new Request('https://polskieradio.cc/wspieraj'), env);
  assert.equal(prodResp.status, 200);
  assert.equal(fetchedPath, '/wspieraj.html');
});


test('Wspieraj 2.0 JSON locales: 5 języków, 100% zgodność kluczy i etapy II/III', async () => {
  const i18n = await import('../assets/cc-support/i18n-support.js');
  const langs = ['pl', 'en', 'de', 'es', 'fr'];
  const jsonDicts = {};
  for (const l of langs) {
    const raw = fs.readFileSync(new URL(`../assets/cc-support/locales/${l}.json`, import.meta.url), 'utf8');
    jsonDicts[l] = JSON.parse(raw);
    assert.deepEqual(i18n.SUPPORT_LOCALES[l], jsonDicts[l], `i18n-support.js musi być w 100% zgodny z locales/${l}.json`);
  }
  const parity = i18n.validateLocaleKeys(jsonDicts);
  assert.equal(parity.ok, true, `Niespójne klucze i18n: ${JSON.stringify(parity.details)}`);
  assert.ok(parity.baseKeyCount >= 180, 'Słownik powinien mieć pełne klucze 7 sekcji');

  assert.equal(jsonDicts.pl.hero_headline, 'Pomóż nam nieść Ewangelię dalej.');
  assert.equal(jsonDicts.en.hero_headline, 'Help us share the Gospel further.');
  assert.equal(jsonDicts.de.hero_headline, 'Hilf uns, das Evangelium weiterzutragen.');
  assert.equal(jsonDicts.es.hero_headline, 'Ayúdanos a llevar el Evangelio más lejos.');
  assert.equal(jsonDicts.fr.hero_headline, 'Aidez-nous à faire connaître l’Évangile au plus grand nombre.');

  for (const l of langs) {
    assert.ok(jsonDicts[l].title.includes('Christian Culture'), `Marka Christian Culture musi pozostać w ${l}`);
    assert.ok(jsonDicts[l].trust_independent_d.includes('Polskie Radio S.A.'), `Wymagana klauzula braku powiązania z Polskie Radio S.A. w ${l}`);
    assert.ok(jsonDicts[l].shop_status_badge.includes('410'), `Status Creator Spring HTTP 410 musi być widoczny w ${l}`);
  }

  assert.deepEqual([...i18n.SUPPORT_LOCALE_STAGES.stage2], ['pt-BR', 'uk', 'it', 'ro', 'ru']);
  assert.ok(i18n.SUPPORT_LOCALE_STAGES.stage3.some(entry => entry.code === 'ar' && entry.dir === 'rtl'));
});

test('Wspieraj 2.0 CSS: paleta Dark Editorial (#07121D, #101E2B, #F5F3EF, #C8B78C, #93A5B5) + #FF7A00', () => {
  const coreCss = fs.readFileSync(new URL('../css/cc-design-core.css', import.meta.url), 'utf8');
  const pilotCss = fs.readFileSync(new URL('../assets/cc-support/support-pilot.css', import.meta.url), 'utf8');
  for (const token of ['#07121D', '#101E2B', '#F5F3EF', '#C8B78C', '#93A5B5']) {
    assert.ok(coreCss.includes(token) && pilotCss.includes(token), `Brak tokenu palety Dark Editorial: ${token}`);
  }
  assert.ok(coreCss.includes('#FF7A00'), 'Zachowano standardowy przycisk pomarańczowy JOMA-D052');
  assert.ok(pilotCss.includes('border-radius: 20px'), 'Karty posiadają zaokrąglenie 18–24px (20px)');
  assert.ok(pilotCss.includes('prefers-reduced-motion: reduce'), 'Obsługa prefers-reduced-motion wymagana');
});

test('Wspieraj 2.0 HTML i telemetryka: 7 sekcji, 5 zakładek, noindex, brak PII i brak Mission Control', async () => {
  const pilotHtml = fs.readFileSync(new URL('../wspieraj-pilot.html', import.meta.url), 'utf8');
  const routeHtml = fs.readFileSync(new URL('../test/wspieraj/index.html', import.meta.url), 'utf8');
  assert.equal(pilotHtml, routeHtml, 'wspieraj-pilot.html i test/wspieraj/index.html muszą być identyczne');

  assert.ok(pilotHtml.includes('noindex,nofollow'), 'Wersja testowa nie może być indeksowana');
  assert.ok(!/Mission\s+Control/i.test(pilotHtml), 'Zakaz ujawniania Mission Control na stronie publicznej');
  for (const sec of ['id="hero"', 'id="wplyw"', 'id="panel-wsparcia"', 'id="inne-sposoby"', 'id="transparentnosc"', 'id="faq"', 'id="kontakt"']) {
    assert.ok(pilotHtml.includes(sec), `Brak wymaganej sekcji: ${sec}`);
  }
  for (const tab of ['data-tab="patronite"', 'data-tab="revolut"', 'data-tab="bank"', 'data-tab="blik"', 'data-tab="zrzutki"', 'data-tab="all"']) {
    assert.ok(pilotHtml.includes(tab), `Brak zakładki płatności: ${tab}`);
  }
  assert.ok(pilotHtml.includes('PL74 2910 0006 2469 8002 1062 8039'), 'Wymagany rachunek IBAN PLN #1');
  assert.ok(pilotHtml.includes('PL48 2910 0006 0000 0000 0527 2629'), 'Wymagany rachunek IBAN PLN #2');
  assert.ok(pilotHtml.includes('537 137 043'), 'Wymagany numer BLIK na telefon');
  assert.ok(pilotHtml.includes('my-store-1009741.creator-spring.com') && pilotHtml.includes('HTTP 410'), 'Ujawnienie wyłączonego sklepu HTTP 410');

  const pilotJs = fs.readFileSync(new URL('../assets/cc-support/support-pilot.js', import.meta.url), 'utf8');
  assert.ok(pilotJs.includes("cc.support.locale"), 'Przechowywanie języka pod kluczem cc.support.locale');
  for (const ev of ['support_view', 'support_method_select', 'support_copy_account', 'support_external_click', 'support_nonfinancial_select', 'support_locale_change']) {
    assert.ok(pilotJs.includes(ev), `Brak obsługi zdarzenia GA4: ${ev}`);
  }

  const runtime = await import('../assets/cc-support/support-pilot.js');
  const cleaned = runtime.sanitizeAnalyticsParams({
    method: 'bank_iban_1',
    iban: 'PL74291000062469800210628039',
    phone: '+48537137043',
    email: 'test@example.com',
    rogueDigits: '74291000062469800210628039',
    rogueEmail: 'user@domain.pl',
    displayName: 'Jan Kowalski',
    target: 'patronite'
  });
  assert.deepEqual(cleaned, { method: 'bank_iban_1', target: 'patronite' });
});

test('Worker serwuje lokalizowane ścieżki testowe /test/wspieraj/{en,de,es,fr}/... z noindex bez naruszenia /wspieraj', async () => {
  const { default: worker } = await import('../_worker.js');
  for (const testPath of [
    '/test/wspieraj/en/support',
    '/test/wspieraj/de/unterstuetzen',
    '/test/wspieraj/es/apoyar',
    '/test/wspieraj/fr/soutenir'
  ]) {
    let fetchedPath = '';
    const env = {
      ASSETS: {
        fetch: async (request) => {
          fetchedPath = new URL(request.url).pathname;
          return new Response('<!doctype html><title>Pilot</title>', { status: 200 });
        },
      },
    };
    const resp = await worker.fetch(new Request(`https://polskieradio.cc${testPath}`), env);
    assert.equal(resp.status, 200, `${testPath} musi zwrócić 200`);
    assert.equal(fetchedPath, '/wspieraj-pilot.html');
    assert.equal(resp.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  }
});
