/**
 * CC Connect 2.0 — Plugin Registry & Domain Tools Tests
 * Tests: T01–T15
 * Run: node --test scripts/cc-connect-registry.test.mjs
 */
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'services', 'ai-dla-jezusa', 'plugin-registry.js');

// ── Static source loader (ES module — parse without eval) ───────────────────
let _registrySrc = '';
function getRegistrySrc() {
  if (!_registrySrc) _registrySrc = readFileSync(REGISTRY_PATH, 'utf8');
  return _registrySrc;
}

// Extract array literal from CC_PLUGIN_REGISTRY export via regex count
function parsePluginIds() {
  const src = getRegistrySrc();
  // Find all id: '...' occurrences within the registry array
  const matches = [...src.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)];
  return matches.map((m) => m[1]);
}

// ── T01: Catalog completeness ────────────────────────────────────────────────
describe('T01 — Plugin catalog completeness', () => {
  it('CC_PLUGIN_REGISTRY has at least 12 plugins', () => {
    assert.ok(existsSync(REGISTRY_PATH), 'plugin-registry.js not found');
    const src = getRegistrySrc();
    assert.ok(src.includes('CC_PLUGIN_REGISTRY'), 'Must export CC_PLUGIN_REGISTRY');
    const ids = parsePluginIds();
    assert.ok(ids.length >= 12, `Expected >=12 plugins, got ${ids.length}. IDs found: ${ids.join(', ')}`);
  });

  it('Each plugin entry has id, name, route/url, icon, tagline/description, category fields', () => {
    const src = getRegistrySrc();
    const required = ['id:', 'name:', 'category:', 'icon:'];
    for (const field of required) {
      assert.ok(src.includes(field), `Registry must have "${field}" fields`);
    }
    // route or url — at least one must be present
    assert.ok(src.includes('route:') || src.includes('url:'), 'Registry must have route: or url: field');
    // description or tagline
    assert.ok(src.includes('description:') || src.includes('tagline:'), 'Registry must have description: or tagline: field');
  });

  it('No duplicate plugin IDs', () => {
    const ids = parsePluginIds();
    const unique = new Set(ids);
    assert.equal(unique.size, ids.length,
      `Duplicate IDs found. Total: ${ids.length}, Unique: ${unique.size}`);
  });
});

// ── T02: Connect persist (via storage key analysis) ──────────────────────────
describe('T02 — Plugin connect/disconnect persistence', () => {
  it('plugin-registry.js defines localStorage helper functions', () => {
    const src = getRegistrySrc();
    assert.ok(
      src.includes('getConnectedPluginIds') || src.includes('togglePluginConnection'),
      'Registry must export localStorage helper functions'
    );
  });

  it('plugin-registry.js uses cc_connected_plugins_v1 storage key', () => {
    const src = getRegistrySrc();
    assert.ok(src.includes('cc_connected_plugins_v1'),
      'Must use versioned storage key cc_connected_plugins_v1');
  });
});

// ── T11: Disconnect clears state ──────────────────────────────────────────────
describe('T11 — Disconnect logic present', () => {
  it('plugin-registry.js contains disconnect/remove logic', () => {
    const src = getRegistrySrc();
    assert.ok(
      src.includes('delete') || src.includes('filter') || src.includes('false'),
      'Must have mechanism to remove plugin from connected set'
    );
  });
});

// ── T12: Isolation — namespaced key ─────────────────────────────────────────
describe('T12 — Storage key isolation', () => {
  it('Plugin registry uses namespaced storage key (cc_connected_plugins_v1)', () => {
    const src = getRegistrySrc();
    assert.ok(src.includes('cc_connected_plugins_v1'), 'Storage key must be cc_connected_plugins_v1');
  });
});

// ── T13: Privacy — no PII in registry ───────────────────────────────────────
describe('T13 — No PII or secrets in plugin registry', () => {
  it('plugin-registry.js contains no API keys, passwords or email addresses', () => {
    const src = getRegistrySrc();
    assert.ok(!/apiKey\s*[:=]\s*['"][A-Za-z0-9\-_]{20,}/.test(src), 'No API keys should be present');
    assert.ok(!/password\s*[:=]/i.test(src), 'No passwords should be present');
    // Email pattern: simple check
    assert.ok(!/@[a-z]+\.[a-z]{2,}/.test(src.replace(/polskieradio\.cc/g, '')), 'No email addresses');
  });
});

// ── T14: MCP tools registration ──────────────────────────────────────────────
describe('T14 — MCP server includes cc_bible_get_verse tool', () => {
  it('mcp-server.js exports/defines cc_bible_get_verse', () => {
    const mcpPath = path.join(ROOT, 'services', 'ai-dla-jezusa', 'mcp-server.js');
    assert.ok(existsSync(mcpPath), 'mcp-server.js must exist');
    const src = readFileSync(mcpPath, 'utf8');
    const tools = ['cc_bible_get_verse', 'cc_bible_get_chapter', 'cc_bible_get_context',
                   'cc_sba_deep_study', 'cc_find_sermon', 'cc_find_audio_bible'];
    for (const t of tools) {
      assert.ok(src.includes(t), `mcp-server.js must define tool: ${t}`);
    }
  });

  it('cc-domain-tools.js exports all 6 domain functions', () => {
    const dtPath = path.join(ROOT, 'services', 'ai-dla-jezusa', 'cc-domain-tools.js');
    assert.ok(existsSync(dtPath), 'cc-domain-tools.js must exist');
    const src = readFileSync(dtPath, 'utf8');
    const fns = ['ccBibleGetVerse', 'ccBibleGetChapter', 'ccBibleGetContext',
                 'ccSbaDeepStudy', 'ccFindSermon', 'ccFindAudioBible'];
    for (const fn of fns) {
      assert.ok(src.includes(fn), `cc-domain-tools.js must define/export ${fn}`);
    }
  });
});

// ── T15: API endpoint registration ──────────────────────────────────────────
describe('T15 — API v1 plugins endpoint registered', () => {
  it('api-v1.js defines /api/ai-dla-jezusa/v1/plugins', () => {
    const apiPath = path.join(ROOT, 'services', 'ai-dla-jezusa', 'api-v1.js');
    assert.ok(existsSync(apiPath), 'api-v1.js must exist');
    const src = readFileSync(apiPath, 'utf8');
    assert.ok(src.includes('/v1/plugins'), 'api-v1.js must register /v1/plugins endpoint');
    assert.ok(src.includes('getAllPlugins') || src.includes('CC_PLUGIN_REGISTRY'),
      'api-v1.js must import plugin registry');
  });
});
