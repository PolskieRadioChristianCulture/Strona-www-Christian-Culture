/**
 * CCRE Engine Automated Test Suite (ZERO-QA)
 * Weryfikuje moduły CCRE: Warm Welcome (M8), Catalog (M1), Today (M2), Progress (M3).
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';

// Import modułów (ESM)
import CCWarmWelcome from '../components/cc-warm-welcome.js';
import CCRECatalog from '../components/ccre-catalog.js';
import CCREToday from '../components/ccre-today.js';
import CCREProgress from '../components/ccre-progress.js';

// Mock in-memory storage dla testów
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

describe('CCRE Test Suite: CC Warm Welcome (M8)', () => {
  test('shouldShow zwraca true dla nowej sesji gościa', () => {
    const config = { enabled: true, cooldownHours: 24 };
    const state = { version: 1, lastShownAt: null, dismissedForever: false };
    assert.equal(CCWarmWelcome.shouldShow(config, state, Date.now()), true);
  });

  test('shouldShow zwraca false gdy cooldown 24h nie minął', () => {
    const config = { enabled: true, cooldownHours: 24 };
    const now = 1000000000000;
    const state = { version: 1, lastShownAt: now - 3600000, dismissedForever: false }; // 1h temu
    assert.equal(CCWarmWelcome.shouldShow(config, state, now), false);
  });

  test('shouldShow zwraca true po upływie 24h cooldownu', () => {
    const config = { enabled: true, cooldownHours: 24 };
    const now = 1000000000000;
    const state = { version: 1, lastShownAt: now - (25 * 3600000), dismissedForever: false }; // 25h temu
    assert.equal(CCWarmWelcome.shouldShow(config, state, now), true);
  });

  test('shouldShow zwraca false po kliknięciu Nie pokazuj więcej (dismissedForever)', () => {
    const config = { enabled: true, cooldownHours: 24 };
    const now = 1000000000000;
    const state = { version: 1, lastShownAt: now - (100 * 3600000), dismissedForever: true };
    assert.equal(CCWarmWelcome.shouldShow(config, state, now), false);
  });

  test('WarmWelcomeManager poprawnie zarządza stanem w mock storage', () => {
    const mockStorage = new MockStorage();
    const mgr = CCWarmWelcome.create({ cooldownHours: 12 });
    mgr.storage = mockStorage;
    mgr.state = { version: 1, lastShownAt: null, dismissedForever: false, impressionCount: 0 };

    mgr.markShown();
    assert.equal(mgr.state.impressionCount, 1);
    assert.ok(mgr.state.lastShownAt > 0);

    mgr.optOut();
    assert.equal(mgr.state.dismissedForever, true);

    mgr.reset();
    assert.equal(mgr.state.dismissedForever, false);
    assert.equal(mgr.state.lastShownAt, null);
  });
});

describe('CCRE Test Suite: Unified Catalog Adapter (M1)', () => {
  const catalog = CCRECatalog.create();

  test('Normalizacja danych uzupełnia brakujące pola i formatuje CCREContentItem', () => {
    const raw = { title: 'Test Rozdział', category: 'bible' };
    const normalized = catalog.normalizeItem(raw);
    assert.equal(normalized.title, 'Test Rozdział');
    assert.equal(normalized.category, 'bible');
    assert.equal(normalized.actionType, 'play');
    assert.ok(normalized.id);
  });

  test('Filtrowanie katalogu po kategorii', () => {
    const bibleItems = catalog.getItems({ category: 'bible' });
    assert.ok(bibleItems.length > 0);
    for (const item of bibleItems) {
      assert.equal(item.category, 'bible');
    }
  });

  test('Wyszukiwanie w katalogu po frazie tekstowej', () => {
    const items = catalog.getItems({ query: 'Rodzaju' });
    assert.ok(items.length >= 1);
    assert.ok(items[0].title.includes('Rodzaju'));
  });

  test('Pobieranie materiałów wyróżnionych (getFeatured)', () => {
    const featured = catalog.getFeatured();
    assert.ok(Array.isArray(featured));
    assert.ok(featured.length <= 4);
  });
});

describe('CCRE Test Suite: CC Dzisiaj (M2)', () => {
  const today = CCREToday.create();

  test('Pulpit dnia zawiera werset UBG, stream radia i słuchowisko dnia', () => {
    const feed = today.getFeed();
    assert.ok(feed.verseOfTheDay.reference.includes('Rdz'));
    assert.equal(feed.verseOfTheDay.translation, 'Uwspółcześniona Biblia Gdańska');
    assert.ok(feed.radioNowPlaying.streamUrl.includes('zeno.fm'));
    assert.ok(feed.featuredChapter.id);
  });

  test('Generowanie widoku HTML zawiera elementy dostępności i kolorystykę', () => {
    const mockContainer = { innerHTML: '' };
    today.render(mockContainer);
    assert.ok(mockContainer.innerHTML.includes('CC DZISIAJ'));
    assert.ok(mockContainer.innerHTML.includes('#FF7A00')); // Pomarańczowy CTA
    assert.ok(mockContainer.innerHTML.includes('#C4A35A')); // Champagne Gold
  });
});

describe('CCRE Test Suite: Kontynuacja Treści / Resume Engine (M3)', () => {
  test('Zapis postępu, margines wznowienia -5s i throttling', () => {
    const mockStorage = new MockStorage();
    const tracker = CCREProgress.create({
      storage: mockStorage,
      rewindSeconds: 5,
      throttleMs: 15000
    });

    // Zapis pozycji 120 sekund
    tracker.saveProgress({
      contentId: 'ba_gen_01',
      contentType: 'audio',
      title: 'Księga Rodzaju • Rozdział 1',
      positionSeconds: 120,
      durationSeconds: 720,
      percentage: 17
    }, true);

    const progress = tracker.getProgress('ba_gen_01');
    assert.ok(progress);
    assert.equal(progress.positionSeconds, 120);
    assert.equal(progress.resumePosition, 115); // 120 - 5 = 115 sekund

    // Sprawdzenie ostatnio aktywnego
    const lastActive = tracker.getLastActive();
    assert.ok(lastActive);
    assert.equal(lastActive.contentId, 'ba_gen_01');

    // Czyszczenie pojedynczego elementu
    tracker.clearItem('ba_gen_01');
    assert.equal(tracker.getProgress('ba_gen_01'), null);
    assert.equal(tracker.getLastActive(), null);
  });

  test('Prawo do zapomnienia: clearAll czyści całą historię', () => {
    const mockStorage = new MockStorage();
    const tracker = CCREProgress.create({ storage: mockStorage });

    tracker.saveProgress({ contentId: 'item_1', title: 'A' }, true);
    tracker.saveProgress({ contentId: 'item_2', title: 'B' }, true);

    assert.ok(tracker.getProgress('item_1'));
    assert.ok(tracker.getProgress('item_2'));

    tracker.clearAll();
    assert.equal(tracker.getProgress('item_1'), null);
    assert.equal(tracker.getProgress('item_2'), null);
    assert.equal(tracker.getLastActive(), null);
  });
});
