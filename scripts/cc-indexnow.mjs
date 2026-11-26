#!/usr/bin/env node
/**
 * CC INDEXNOW DISPATCHER & QUEUE MANAGER — ETAP 3
 * Zarządza kolejką zgłoszeń IndexNow (Bing, Yandex, Seznam, Naver),
 * weryfikacją klucza bez ujawniania sekretów, ponowieniami (retry) i logowaniem.
 *
 * Rygorystycznie przestrzega zasad:
 * 1. opublikowane ≠ zgłoszone ≠ odkryte ≠ zaindeksowane
 * 2. Zakaz zgłaszania URL prywatnych, szkiców i stron noindex
 * 3. Blokada użycia Google Indexing API dla zwykłych artykułów (dozwolone wyłącznie JobPosting i BroadcastEvent w VideoObject)
 */

import fs from 'node:fs';
import path from 'node:path';
import { isIndexablePublicPath, toCanonicalUrl, PRIMARY_ORIGIN } from './cc-seo-engine.mjs';

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
export const DEFAULT_MAX_RETRIES = 3;

/**
 * Waliduje format klucza IndexNow (8–128 znaków: a-z, A-Z, 0-9, '-').
 * Nigdy nie zapisuje ani nie loguje pełnego klucza w jawnej postaci.
 */
export function validateIndexNowKey(key) {
  if (!key || typeof key !== 'string') {
    return { valid: false, reason: 'Brak klucza INDEXNOW_KEY w zmiennych środowiskowych.' };
  }
  const trimmed = key.trim();
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(trimmed)) {
    return { valid: false, reason: 'Klucz IndexNow musi mieć 8–128 znaków alfanumerycznych lub myślników.' };
  }
  return {
    valid: true,
    maskedKey: `${trimmed.slice(0, 4)}...${trimmed.slice(-2)}`,
  };
}

/**
 * Rozpoznaje klucz IndexNow z podanej opcji, zmiennej INDEXNOW_KEY
 * lub zweryfikowanego publicznego pliku `<32-hex>.txt` w katalogu głównym.
 */
export function resolveIndexNowKey(options = {}) {
  const direct = options.key ?? process.env.INDEXNOW_KEY;
  if (validateIndexNowKey(direct).valid) {
    return String(direct).trim();
  }
  const rootDir = options.rootDir || process.cwd();
  const preferred = 'cc777b1b11a94e82938a1928df05c28e.txt';
  let entries = [];
  try {
    entries = fs.readdirSync(rootDir, { withFileTypes: true })
      .filter((d) => d.isFile() && /^[a-f0-9]{32}\.txt$/i.test(d.name))
      .map((d) => d.name)
      .sort((a, b) => (a === preferred ? -1 : b === preferred ? 1 : a.localeCompare(b)));
  } catch {
    return '';
  }
  for (const name of entries) {
    try {
      const stem = name.replace(/\.txt$/i, '');
      const content = fs.readFileSync(path.join(rootDir, name), 'utf8').trim();
      if (content === stem && validateIndexNowKey(content).valid) {
        return content;
      }
    } catch {}
  }
  return '';
}

/**
 * Blokada zgodna z Sekcją 5 Standardu:
 * Google Indexing API NIE służy do zwykłych artykułów (wyłącznie JobPosting lub BroadcastEvent w VideoObject).
 */
export function assertGoogleIndexingApiEligibility(resource) {
  const type = resource?.type || resource?.['@type'];
  const hasBroadcast = Boolean(resource?.publication || resource?.hasBroadcastEvent);
  if (type === 'JobPosting' || (type === 'VideoObject' && hasBroadcast)) {
    return true;
  }
  throw new Error(
    `ZAKAZ STANDARDU (Sekcja 5): Google Indexing API nie służy do zwykłych artykułów (${type || 'nieznany'}). Dozwolone wyłącznie JobPosting oraz BroadcastEvent w VideoObject.`
  );
}

/**
 * Tworzy menedżera kolejki IndexNow z obsługą walidacji, retry i audytowalnych logów.
 */
export function createIndexNowQueueManager(options = {}) {
  const queueFile = options.queueFile || path.resolve(process.cwd(), 'data/cc-indexnow-queue.json');
  const logFile = options.logFile || path.resolve(process.cwd(), 'data/cc-indexnow-log.json');
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

  function readJson(filePath, fallback) {
    if (!fs.existsSync(filePath)) return fallback;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      return fallback;
    }
  }

  function writeJson(filePath, data) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  function appendLog(entry) {
    const logs = readJson(logFile, { entries: [] });
    logs.entries.unshift({
      timestamp: new Date().toISOString(),
      ...entry,
    });
    logs.entries = logs.entries.slice(0, 500);
    writeJson(logFile, logs);
  }

  return {
    /**
     * Dodaje kwalifikujące się publiczne adresy URL do kolejki IndexNow.
     * Odrzuca adresy prywatne, szkice i strony noindex.
     */
    enqueue(candidates) {
      const list = Array.isArray(candidates) ? candidates : [candidates];
      const state = readJson(queueFile, { updatedAt: null, items: [] });
      const byUrl = new Map(state.items.map(it => [it.url, it]));

      const accepted = [];
      const rejected = [];

      for (const raw of list) {
        const item = typeof raw === 'string' ? { url: raw } : raw;
        const rawUrl = item?.url || item?.canonicalUrl;
        if (!isIndexablePublicPath(rawUrl, { isDraft: item?.isDraft, noindex: item?.noindex })) {
          const reason = item?.isDraft
            ? 'ODRZUCONO: Szkic (draft) nie podlega zgłoszeniu.'
            : item?.noindex
              ? 'ODRZUCONO: Strona oznaczona noindex nie podlega zgłoszeniu.'
              : 'ODRZUCONO: Adres prywatny, operacyjny lub niekanoniczny.';
          rejected.push({ url: rawUrl, reason });
          appendLog({ level: 'WARN', event: 'INDEXNOW_REJECTED', url: rawUrl, reason });
          continue;
        }

        const canonical = toCanonicalUrl(rawUrl);
        const existing = byUrl.get(canonical);
        const record = {
          url: canonical,
          section: item.section || 'general',
          publishedAt: item.publishedAt || existing?.publishedAt || new Date().toISOString(),
          queuedAt: new Date().toISOString(),
          attempts: existing?.attempts || 0,
          maxRetries,
          lastAttemptAt: existing?.lastAttemptAt || null,
          lastHttpStatus: existing?.lastHttpStatus || null,
          lastError: null,
          // Jawne rozróżnienie stanów zgodnie z Sekcją 5: opublikowane ≠ zgłoszone ≠ odkryte ≠ zaindeksowane
          lifecycle: {
            published: true,
            queuedIndexNow: true,
            submittedIndexNow: existing?.lifecycle?.submittedIndexNow || false,
            discoveredByBot: existing?.lifecycle?.discoveredByBot ?? null,
            indexedInSearch: existing?.lifecycle?.indexedInSearch ?? null,
          },
          status: existing?.status === 'SUBMITTED' && !item.forceResubmit ? 'SUBMITTED' : 'PENDING',
        };

        byUrl.set(canonical, record);
        accepted.push(record);
      }

      const updatedItems = [...byUrl.values()];
      writeJson(queueFile, {
        updatedAt: new Date().toISOString(),
        totalItems: updatedItems.length,
        pendingCount: updatedItems.filter(i => i.status === 'PENDING' || i.status === 'RETRY_SCHEDULED').length,
        submittedCount: updatedItems.filter(i => i.status === 'SUBMITTED').length,
        failedCount: updatedItems.filter(i => i.status === 'FAILED_PERMANENTLY').length,
        items: updatedItems,
      });

      if (accepted.length > 0) {
        appendLog({
          level: 'INFO',
          event: 'INDEXNOW_ENQUEUED',
          count: accepted.length,
          sampleUrls: accepted.slice(0, 5).map(a => a.url),
        });
      }

      return { accepted, rejected };
    },

    /**
     * Wysyła oczekujące adresy z kolejki do protokołu IndexNow (lub rejestruje oczekiwanie na klucz).
     */
    async flush(options = {}) {
      const key = options.key !== undefined ? options.key : resolveIndexNowKey({ rootDir: options.rootDir });
      const fetchImpl = options.fetchImpl || globalThis.fetch;
      const state = readJson(queueFile, { updatedAt: null, items: [] });
      const pending = state.items.filter(
        it => it.status === 'PENDING' || (it.status === 'RETRY_SCHEDULED' && it.attempts < maxRetries)
      );

      if (pending.length === 0) {
        return { sent: 0, status: 'NO_PENDING_URLS' };
      }

      const keyCheck = validateIndexNowKey(key);
      if (!keyCheck.valid) {
        appendLog({
          level: 'INFO',
          event: 'INDEXNOW_KEY_AWAITING_CONFIG',
          pendingCount: pending.length,
          reason: keyCheck.reason,
        });
        return {
          sent: 0,
          pendingCount: pending.length,
          status: 'AWAITING_KEY_CONFIGURATION',
          reason: keyCheck.reason,
        };
      }

      const payload = {
        host: new URL(PRIMARY_ORIGIN).hostname,
        key: key.trim(),
        keyLocation: options.keyLocation || `${PRIMARY_ORIGIN}/${key.trim()}.txt`,
        urlList: pending.map(p => p.url),
      };

      const nowIso = new Date().toISOString();
      try {
        const res = await fetchImpl(INDEXNOW_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(payload),
        });

        const ok = res.status === 200 || res.status === 202;
        for (const item of pending) {
          item.attempts += 1;
          item.lastAttemptAt = nowIso;
          item.lastHttpStatus = res.status;
          if (ok) {
            item.status = 'SUBMITTED';
            item.lastError = null;
            item.lifecycle.submittedIndexNow = true;
          } else {
            item.lastError = `HTTP ${res.status}`;
            item.status = item.attempts >= maxRetries ? 'FAILED_PERMANENTLY' : 'RETRY_SCHEDULED';
          }
        }

        writeJson(queueFile, {
          updatedAt: nowIso,
          totalItems: state.items.length,
          pendingCount: state.items.filter(i => i.status === 'PENDING' || i.status === 'RETRY_SCHEDULED').length,
          submittedCount: state.items.filter(i => i.status === 'SUBMITTED').length,
          failedCount: state.items.filter(i => i.status === 'FAILED_PERMANENTLY').length,
          items: state.items,
        });

        appendLog({
          level: ok ? 'INFO' : 'ERROR',
          event: ok ? 'INDEXNOW_SUBMITTED' : 'INDEXNOW_HTTP_ERROR',
          httpStatus: res.status,
          urlCount: pending.length,
          maskedKey: keyCheck.maskedKey,
        });

        return {
          sent: ok ? pending.length : 0,
          httpStatus: res.status,
          status: ok ? 'SUBMITTED' : 'RETRY_OR_FAILED',
        };
      } catch (err) {
        for (const item of pending) {
          item.attempts += 1;
          item.lastAttemptAt = nowIso;
          item.lastError = err.message;
          item.status = item.attempts >= maxRetries ? 'FAILED_PERMANENTLY' : 'RETRY_SCHEDULED';
        }
        writeJson(queueFile, {
          updatedAt: nowIso,
          totalItems: state.items.length,
          pendingCount: state.items.filter(i => i.status === 'PENDING' || i.status === 'RETRY_SCHEDULED').length,
          submittedCount: state.items.filter(i => i.status === 'SUBMITTED').length,
          failedCount: state.items.filter(i => i.status === 'FAILED_PERMANENTLY').length,
          items: state.items,
        });
        appendLog({
          level: 'ERROR',
          event: 'INDEXNOW_NETWORK_ERROR',
          error: err.message,
          urlCount: pending.length,
        });
        return {
          sent: 0,
          status: 'NETWORK_ERROR',
          error: err.message,
        };
      }
    },

    getState() {
      return readJson(queueFile, {
        updatedAt: null,
        totalItems: 0,
        pendingCount: 0,
        submittedCount: 0,
        failedCount: 0,
        items: [],
      });
    },

    getLogs() {
      return readJson(logFile, { entries: [] });
    },
  };
}
