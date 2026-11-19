/**
 * ══════════════════════════════════════════════════════════════════════════
 * EkoCC INFO ⓘ — TESTY JEDNOSTKOWE I INTEGRACYJNE
 * Plik: tests/ekocc-info.test.mjs
 * Standard: ZERO-QA JOMA-D005 / EKOCC_INFO_ANTIGRAVITY_STANDARD_STRATEGICZNY
 * ══════════════════════════════════════════════════════════════════════════
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function test(name, fn) {
  process.stdout.write(`⏳ TEST: ${name}... `);
  try {
    fn();
    console.log('✅ PASS');
    passed++;
  } catch (err) {
    console.log('❌ FAIL');
    console.error('   Szczegóły błędu:', err.message);
    failed++;
  }
}

async function runSuite() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   🔍 EkoCC INFO ⓘ — AUDYT STANDARDU I WERYFIKACJA ZERO-QA');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const registryPath = path.join(ROOT, 'data/info-registry.json');
  const componentPath = path.join(ROOT, 'components/ekocc-info.js');

  // 1. Istnienie i integralność rejestru JSON
  test('Rejestr data/info-registry.json istnieje i jest poprawnym formatem JSON', () => {
    assert.ok(fs.existsSync(registryPath), 'Plik data/info-registry.json musi istnieć');
    const raw = fs.readFileSync(registryPath, 'utf8');
    const data = JSON.parse(raw);
    assert.ok(data.universal, 'Rejestr musi zawierać węzeł universal');
    assert.ok(data.routes, 'Rejestr musi zawierać węzeł routes');
  });

  // 2. Weryfikacja tras ekosystemu
  test('Karty ekosystemu (/, /lumina, /news, /BiblijneUwielbienie, /wspieraj, /akademia, /mojabiblia, /vod, /biblia-spiewana-live, /mapa) są zdefiniowane z wersjami PL i EN', () => {
    const data = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    const requiredRoutes = [
      '/',
      '/lumina',
      '/news',
      '/BiblijneUwielbienie',
      '/wspieraj',
      '/akademia',
      '/mojabiblia',
      '/vod',
      '/biblia-spiewana-live',
      '/mapa'
    ];

    for (const r of requiredRoutes) {
      assert.ok(data.routes[r], `Trasa ${r} musi istnieć w rejestrze`);
      const card = data.routes[r];
      assert.ok(card.pl, `Trasa ${r} musi posiadać wersję pl`);
      assert.ok(card.en, `Trasa ${r} musi posiadać wersję en`);

      // Obowiązkowe pola według Sekcji 3 specyfikacji
      assert.ok(card.pl.title, `Trasa ${r} (PL) musi mieć title`);
      assert.ok(card.pl.about, `Trasa ${r} (PL) musi mieć sekcję about`);
      assert.ok(card.pl.spiritualValue, `Trasa ${r} (PL) musi mieć sekcję spiritualValue`);
      assert.ok(card.pl.scripture, `Trasa ${r} (PL) musi mieć sekcję scripture`);
      assert.ok(card.pl.rights, `Trasa ${r} (PL) musi mieć sekcję rights`);
      assert.ok(card.pl.privacy, `Trasa ${r} (PL) musi mieć sekcję privacy`);
      assert.ok(Array.isArray(card.pl.features), `Trasa ${r} (PL) musi posiadać tablicę features`);
      assert.ok(card.pl.features.length > 0, `Trasa ${r} (PL) musi mieć co najmniej 1 funkcję ze statusem`);
    }
  });

  // 3. Weryfikacja statusów funkcji (brak fałszywych obietnic)
  test('Statusy funkcji w rejestrze są rzetelne (dostępne / testowe / planowane)', () => {
    const data = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    const allowedStatuses = ['dostępne', 'testowe', 'planowane', 'czasowo niedostępne', 'available', 'testing', 'planned'];

    for (const [route, card] of Object.entries(data.routes)) {
      for (const f of card.pl.features || []) {
        assert.ok(f.name, `Funkcja w trasie ${route} musi mieć nazwę`);
        assert.ok(allowedStatuses.includes(f.status), `Status funkcji "${f.name}" w trasie ${route} (${f.status}) musi być dozwolony`);
      }
    }
  });

  // 4. Bezpieczeństwo i brak sekretów w rejestrze
  test('Brak ujawniania haseł, tokenów, kluczy API ani poufnych instrukcji w rejestrze', () => {
    const raw = fs.readFileSync(registryPath, 'utf8');
    const secretKeywords = ['api_key', 'token', 'password', 'secret', 'bearer', 'private_key', 'authorization'];
    for (const kw of secretKeywords) {
      assert.strictEqual(raw.toLowerCase().includes(`"${kw}"`), false, `Rejestr nie może zawierać klucza ${kw}`);
    }
  });

  // 5. Kod komponentu components/ekocc-info.js
  test('Komponent components/ekocc-info.js istnieje i implementuje standard dostępności WCAG 2.2 AA', () => {
    assert.ok(fs.existsSync(componentPath), 'Plik components/ekocc-info.js musi istnieć');
    const code = fs.readFileSync(componentPath, 'utf8');

    // Kolorystyka Champagne Gold
    assert.ok(code.includes('#C4A35A'), 'Musi stosować kolor bazowy Champagne Gold #C4A35A');
    
    // Dostępność dotykowa min. 44px
    assert.ok(code.includes('44px'), 'Musi definiować cel dotykowy minimum 44px');

    // Dostępność ARIA
    assert.ok(code.includes('aria-label'), 'Musi zawierać aria-label');
    assert.ok(code.includes('aria-haspopup'), 'Musi zawierać aria-haspopup');
    assert.ok(code.includes('aria-expanded'), 'Musi zarządzać atrybutem aria-expanded');
    assert.ok(code.includes('aria-modal'), 'Dialog musi posiadać aria-modal="true"');

    // Klawiatura ESC
    assert.ok(code.includes('Escape'), 'Musi obsługiwać zamykanie klawiszem Escape');

    // Przełącznik języka PL / EN
    assert.ok(code.includes('data-lang="pl"'), 'Musi wspierać przełącznik języka PL');
    assert.ok(code.includes('data-lang="en"'), 'Musi wspierać przełącznik języka EN');

    // Reduced motion
    assert.ok(code.includes('prefers-reduced-motion'), 'Musi wspierać media query prefers-reduced-motion');

    // Górna pozycja pod przyciskiem "+" / belką górną + ukrywanie przy przewijaniu w dół
    assert.ok(code.includes('.ekocc-info-trigger.is-scroll-hidden'), 'Musi definiować stan ukrycia przy przewijaniu .is-scroll-hidden');
    assert.ok(code.includes('updateScrollVisibility'), 'Musi zarządzać widocznością podczas przewijania strony');
    assert.ok(code.includes('actionsToggleBtn'), 'Musi pozycjonować się pod przyciskiem + w górnej belce');
    assert.ok(code.includes("btn.style.bottom = 'auto'"), 'Nie może kotwiczyć przycisku przy dolnej krawędzi ekranu');
  });

  // 6. Dołączenie skryptu w plikach HTML rolloutu
  test('Pliki HTML rolloutu zawierają dołączenie skryptu components/ekocc-info.js', () => {
    const htmlFiles = [
      'index.html',
      'lumina.html',
      'news/index.html',
      'biblijne-uwielbienie.html',
      'wspieraj.html',
      'akademia.html',
      'mojabiblia.html',
      'vod.html',
      'mapa.html',
      'biblia-spiewana-live.html'
    ];

    for (const rel of htmlFiles) {
      const full = path.join(ROOT, rel);
      assert.ok(fs.existsSync(full), `Plik ${rel} musi istnieć`);
      const html = fs.readFileSync(full, 'utf8');
      assert.ok(html.includes('ekocc-info.js'), `Plik ${rel} musi zawierać odwołanie do ekocc-info.js`);
    }
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`📊 WYNIK SUITE EkoCC INFO: ${passed} PASS / ${failed} FAIL`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (failed > 0) process.exit(1);
}

runSuite().catch(err => {
  console.error('BŁĄD KRYTYCZNY TESTÓW:', err);
  process.exit(1);
});
