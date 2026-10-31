/**
 * CCRE Progress Tracker & Resume Engine (M3)
 * Śledzi postęp odtwarzania audio/wideo i lektury w LocalStorage.
 * Cechy: Throttling 15s, margines wznowienia -5s, 0 egress do serwera, pełna prywatność.
 */

export const STORAGE_KEY = 'cc_progress_state_v1';
export const MAX_ITEMS = 50;
export const DEFAULT_REWIND_SECONDS = 5;
export const DEFAULT_THROTTLE_MS = 15000;

function getSafeStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (e) {}
  return null;
}

function readStore(storage) {
  if (!storage) return { version: 1, items: {}, lastActiveId: null };
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { version: 1, items: {}, lastActiveId: null };
}

function writeStore(storage, data) {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

export class ProgressTracker {
  constructor(options = {}) {
    this.storage = options.storage || getSafeStorage();
    this.rewindSeconds = options.rewindSeconds || DEFAULT_REWIND_SECONDS;
    this.throttleMs = options.throttleMs || DEFAULT_THROTTLE_MS;
    this.lastWriteTimes = new Map();
    this.state = readStore(this.storage);
  }

  saveProgress(item, force = false) {
    if (!item || !item.contentId) return;

    const now = Date.now();
    const lastWrite = this.lastWriteTimes.get(item.contentId) || 0;

    if (!force && (now - lastWrite < this.throttleMs)) {
      return; // Throttled
    }

    this.lastWriteTimes.set(item.contentId, now);

    const existing = this.state.items[item.contentId] || {};
    const updatedItem = {
      contentId: item.contentId,
      contentType: item.contentType || existing.contentType || 'audio',
      title: item.title || existing.title || 'Materiał Christian Culture',
      url: item.url || existing.url || '/',
      positionSeconds: typeof item.positionSeconds === 'number' ? Math.round(item.positionSeconds) : (existing.positionSeconds || 0),
      durationSeconds: typeof item.durationSeconds === 'number' ? Math.round(item.durationSeconds) : (existing.durationSeconds || 0),
      percentage: typeof item.percentage === 'number' ? Math.round(item.percentage) : (existing.percentage || 0),
      updatedAt: now,
      completed: Boolean(item.completed)
    };

    this.state.items[item.contentId] = updatedItem;
    this.state.lastActiveId = item.contentId;

    const keys = Object.keys(this.state.items);
    if (keys.length > MAX_ITEMS) {
      const sorted = keys.sort((a, b) => this.state.items[a].updatedAt - this.state.items[b].updatedAt);
      const toRemove = sorted.slice(0, keys.length - MAX_ITEMS);
      toRemove.forEach(k => delete this.state.items[k]);
    }

    writeStore(this.storage, this.state);
  }

  getProgress(contentId) {
    if (!contentId || !this.state.items[contentId]) return null;
    const item = this.state.items[contentId];
    const resumePosition = Math.max(0, (item.positionSeconds || 0) - this.rewindSeconds);
    return Object.assign({}, item, { resumePosition });
  }

  getLastActive() {
    if (!this.state.lastActiveId) return null;
    return this.getProgress(this.state.lastActiveId);
  }

  clearItem(contentId) {
    if (this.state.items[contentId]) {
      delete this.state.items[contentId];
      if (this.state.lastActiveId === contentId) {
        this.state.lastActiveId = null;
      }
      writeStore(this.storage, this.state);
    }
  }

  clearAll() {
    this.state = { version: 1, items: {}, lastActiveId: null };
    writeStore(this.storage, this.state);
    this.lastWriteTimes.clear();
  }
}

const CCREProgress = {
  ProgressTracker,
  create: (opts) => new ProgressTracker(opts),
  STORAGE_KEY
};

if (typeof globalThis !== 'undefined') {
  globalThis.CCREProgress = CCREProgress;
}

export default CCREProgress;
