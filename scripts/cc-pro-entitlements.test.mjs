/**
 * ══════════════════════════════════════════════════════════════════════════════
 * CC PRO ENTITLEMENTS & WSPIERAMTO CENTRAL MANAGEMENT SUITE
 * Test: scripts/cc-pro-entitlements.test.mjs
 * 
 * Weryfikacja 6 punktów Dyrektywy Dowódcy:
 * 1. Wszystkie obecne i przyszłe usługi PRO powiązać z systemem WspieramTO.
 * 2. Stworzyć centralny mechanizm zarządzania dostępem do usług PRO.
 * 3. Nie tworzyć odrębnych systemów finansowania dla poszczególnych aplikacji.
 * 4. Wprowadzić spójne oznaczenia PRO w całym ekosystemie.
 * 5. Przygotować wspólny panel użytkownika Moje usługi PRO.
 * 6. Zintegrować mechanizm z AI dla Jezusa, CC Connect oraz pozostałymi aplikacjami.
 * ══════════════════════════════════════════════════════════════════════════════
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Załaduj plik menedżera PRO w środowisku Node
const proManagerPath = path.join(ROOT, 'js', 'cc-pro-manager.js');
assert.ok(fs.existsSync(proManagerPath), 'Plik js/cc-pro-manager.js musi istnieć');

const proManagerSrc = fs.readFileSync(proManagerPath, 'utf8');

// Symulacja środowiska z prostym mockiem localStorage
function createMockStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, val) {
      store[key] = String(val);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      for (const k of Object.keys(store)) delete store[k];
    },
    _raw: store
  };
}

describe('Punkt 1 & 2: Centralny mechanizm zarządzania dostępem PRO powiązany ze WspieramTO', () => {
  it('Eksportuje kanoniczną listę usług PRO i klucz cc_pro_entitlement_v1', async () => {
    await import('../js/cc-pro-manager.js');
    const CCProManager = globalThis.CCProManager;
    assert.ok(CCProManager, 'CCProManager musi być poprawnie wyeksportowany');
    assert.equal(CCProManager.STORAGE_KEY, 'cc_pro_entitlement_v1');
    assert.ok(Array.isArray(CCProManager.SERVICES), 'SERVICES musi być tablicą');
    assert.ok(CCProManager.SERVICES.length >= 8, `Oczekiwano co najmniej 8 usług PRO, jest: ${CCProManager.SERVICES.length}`);

    // Sprawdź wymagane usługi
    const serviceIds = CCProManager.SERVICES.map((s) => s.id);
    assert.ok(serviceIds.includes('ai-dla-jezusa'), 'Musi zawierać ai-dla-jezusa');
    assert.ok(serviceIds.includes('cc-connect'), 'Musi zawierać cc-connect');
    assert.ok(serviceIds.includes('cc-bible-scholar'), 'Musi zawierać cc-bible-scholar');
    assert.ok(serviceIds.includes('mojabiblia'), 'Musi zawierać mojabiblia');
    assert.ok(serviceIds.includes('akademia'), 'Musi zawierać akademia');
    assert.ok(serviceIds.includes('cc-studio'), 'Musi zawierać cc-studio');
    assert.ok(serviceIds.includes('player'), 'Musi zawierać player');
    assert.ok(serviceIds.includes('lumina'), 'Musi zawierać lumina');

    for (const svc of CCProManager.SERVICES) {
      assert.ok(svc.id, 'Usługa musi mieć id');
      assert.ok(svc.name, 'Usługa musi mieć name');
      assert.ok(svc.tagline, 'Usługa musi mieć tagline');
      assert.ok(svc.url, 'Usługa musi mieć url');
      assert.ok(svc.badge, 'Usługa musi mieć badge');
      assert.ok(Array.isArray(svc.benefits) && svc.benefits.length > 0, 'Usługa musi definiować korzyści PRO');
    }
  });

  it('Prawidłowo oblicza status PRO (trial 7 dni, patron, owner, free)', async () => {
    await import('../js/cc-pro-manager.js');
    const CCProManager = globalThis.CCProManager;
    const st = CCProManager.getStatus();
    assert.ok(typeof st.active === 'boolean');
    assert.ok(['free', 'trial', 'patron', 'owner'].includes(st.tier));
    assert.equal(st.supportUrl, '/wspieramto');
  });
});

describe('Punkt 3: Zakaz odrębnych systemów finansowania dla poszczególnych aplikacji', () => {
  it('W kodzie js/cc-pro-manager.js i komponentach PRO nie ma komercyjnych bramek Stripe / PayPal / paywalli', () => {
    const forbidden = ['stripe', 'paypal', 'lemonsqueezy', 'payu', 'przelewy24', 'subskrypcja_karty'];
    const lower = proManagerSrc.toLowerCase();
    for (const term of forbidden) {
      assert.equal(lower.includes(term), false, `Niedozwolony komercyjny termin finansowy w CCProManager: ${term}`);
    }
  });

  it('Wszystkie wezwania mecenatu kierują wyłącznie do WspieramTO (Zrzutka / Patronite / Revolut / Mecenat)', () => {
    assert.ok(proManagerSrc.includes('/wspieramto'));
    assert.ok(proManagerSrc.includes('CCWspieramTo'));
  });
});

describe('Punkt 4: Spójne oznaczenia PRO w całym ekosystemie (Champagne Gold & Pomarańczowy #FF7A00)', () => {
  it('Plik components/cc-pro.css definiuje spójne klasy .cc-pro-badge i pomarańczowy przycisk #FF7A00 (JOMA-D052)', () => {
    const cssPath = path.join(ROOT, 'components', 'cc-pro.css');
    assert.ok(fs.existsSync(cssPath), 'Plik components/cc-pro.css musi istnieć');
    const css = fs.readFileSync(cssPath, 'utf8');

    assert.ok(css.includes('.cc-pro-badge'), 'Musi definiować .cc-pro-badge');
    assert.ok(css.includes('#c4a35a') || css.includes('#C4A35A'), 'Musi używać Champagne Gold');
    assert.ok(css.includes('#ff7a00') || css.includes('#FF7A00'), 'Musi używać Klasycznego Pomarańczowego wg JOMA-D052');
    assert.ok(css.includes('min-height: 44px') || css.includes('min-height:44px'), 'Musi zachować ergonomię min. 44px dotyku');
    assert.ok(css.includes('prefers-reduced-motion'), 'Musi respektować prefers-reduced-motion');
  });
});

describe('Punkt 5: Wspólny panel użytkownika „Moje usługi PRO” w Moje Centrum CC', () => {
  it('moje-centrum.html zawiera dedykowany strategiczny moduł cardProServices', () => {
    const htmlPath = path.join(ROOT, 'moje-centrum.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    assert.ok(html.includes('id="cardProServices"'), 'moje-centrum.html musi zawierać kartę #cardProServices');
    assert.ok(html.includes('Moje usługi PRO'), 'Musi zawierać nagłówek Moje usługi PRO');
    assert.ok(html.includes('/components/cc-pro.css'), 'Musi ładować cc-pro.css');
    assert.ok(html.includes('/js/cc-pro-manager.js'), 'Musi ładować cc-pro-manager.js');
    assert.ok(html.includes('/components/cc-wspieramto-modal.js'), 'Musi ładować cc-wspieramto-modal.js');
    assert.ok(html.includes('hubProServicesGrid'), 'Musi renderować siatkę usług #hubProServicesGrid');
    assert.ok(html.includes('renderProServices'), 'Musi zawierać funkcję renderProServices');
  });
});

describe('Punkt 6: Integracja mechanizmu z AI dla Jezusa, CC Connect oraz WspieramTO', () => {
  it('ai/app.js integruje się z window.CCProManager w getProStatus i openProModal', () => {
    const aiAppPath = path.join(ROOT, 'ai', 'app.js');
    const aiAppSrc = fs.readFileSync(aiAppPath, 'utf8');

    assert.ok(aiAppSrc.includes('CCProManager.getStatus'), 'ai/app.js musi integrować CCProManager.getStatus');
    assert.ok(aiAppSrc.includes('CCProManager.openUpgradeModal'), 'ai/app.js musi używać CCProManager.openUpgradeModal');
  });

  it('test/ai/index.html ładuje cc-pro-manager.js i cc-wspieramto-modal.js', () => {
    const testAiPath = path.join(ROOT, 'test', 'ai', 'index.html');
    const testAiHtml = fs.readFileSync(testAiPath, 'utf8');

    assert.ok(testAiHtml.includes('/js/cc-pro-manager.js'), 'test/ai/index.html musi ładować cc-pro-manager.js');
    assert.ok(testAiHtml.includes('/components/cc-wspieramto-modal.js'), 'test/ai/index.html musi ładować cc-wspieramto-modal.js');
  });

  it('services/ai-dla-jezusa/plugin-registry.js eksportuje funkcje CC Connect i obsługę klucza cc_connected_plugins_v1', () => {
    const regPath = path.join(ROOT, 'services', 'ai-dla-jezusa', 'plugin-registry.js');
    const regSrc = fs.readFileSync(regPath, 'utf8');

    assert.ok(regSrc.includes('CC_CONNECTED_PLUGINS_STORAGE_KEY'), 'Musi eksportować CC_CONNECTED_PLUGINS_STORAGE_KEY');
    assert.ok(regSrc.includes('cc_connected_plugins_v1'), 'Musi zawierać storage key cc_connected_plugins_v1');
    assert.ok(regSrc.includes('getConnectedPluginIds'), 'Musi eksportować getConnectedPluginIds');
    assert.ok(regSrc.includes('togglePluginConnection'), 'Musi eksportować togglePluginConnection');
    assert.ok(regSrc.includes('isPluginProRequired'), 'Musi eksportować isPluginProRequired');
  });

  it('components/cc-wspieramto-modal.js informuje o pakiecie usług PRO i synchronizuje mecenat z CCProManager', () => {
    const modalPath = path.join(ROOT, 'components', 'cc-wspieramto-modal.js');
    const modalSrc = fs.readFileSync(modalPath, 'utf8');

    assert.ok(modalSrc.includes('Pakiet Usług PRO w Ekosystemie'), 'Modal musi informować o pakiecie usług PRO');
    assert.ok(modalSrc.includes('CCProManager.activatePatron'), 'Modal musi synchronizować aktywację mecenatu w CCProManager');
  });
});
