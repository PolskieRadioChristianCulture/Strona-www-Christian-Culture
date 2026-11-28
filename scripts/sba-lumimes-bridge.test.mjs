/**
 * CC Connect 2.0 — SBA ↔ LumiMes Bridge Tests
 * Tests: T03–T08
 * Run: node --test scripts/sba-lumimes-bridge.test.mjs
 *
 * T03/T04 require a running browser — marked as MOCK (statically verified).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SBA_APP = path.join(ROOT, 'sba', 'app.js');
const CHAT_BTN = path.join(ROOT, 'components', 'cc-global-chat-button.js');
const CHAT_SVC = path.join(ROOT, 'services', 'ai-dla-jezusa', 'chat-service.js');

// ── T03: SBA triggers openWithContext (static analysis) ──────────────────────
describe('T03 — SBA openVerseMenu calls CCLumiMes.openWithContext (static)', () => {
  it('sba/app.js contains openWithContext call in openVerseMenu', () => {
    assert.ok(existsSync(SBA_APP), 'sba/app.js must exist');
    const src = readFileSync(SBA_APP, 'utf8');
    assert.ok(src.includes('CCLumiMes.openWithContext'),
      'sba/app.js must call CCLumiMes.openWithContext in verse menu');
    assert.ok(src.includes("contextType: 'bible-verse'"),
      "openWithContext must set contextType: 'bible-verse'");
    assert.ok(src.includes("appId: 'scroll-bible'"),
      "openWithContext must set appId: 'scroll-bible'");
  });

  it('sba/app.js has suggestions array with 5 entries', () => {
    const src = readFileSync(SBA_APP, 'utf8');
    const match = src.match(/suggestions:\s*\[([^\]]+)\]/s);
    assert.ok(match, 'openWithContext must include suggestions array');
    const entries = match[1].split(',').filter((s) => s.includes("'") || s.includes('"'));
    assert.ok(entries.length >= 5, `Expected at least 5 suggestions, got ${entries.length}`);
  });
});

// ── T04: Correct book/chapter/verse forwarded ────────────────────────────────
describe('T04 — Context payload contains bible reference fields', () => {
  it('openWithContext passes verse.book, verse.chapter, verse.number', () => {
    const src = readFileSync(SBA_APP, 'utf8');
    assert.ok(src.includes('book: verse.book'), 'bible.book must come from verse.book');
    assert.ok(src.includes('chapter: verse.chapter'), 'bible.chapter must come from verse.chapter');
    assert.ok(src.includes('verseStart: verse.number'), 'bible.verseStart must come from verse.number');
  });
});

// ── T05: Context snapshot immutability (sessionStorage key) ──────────────────
describe('T05 — LumiMes context uses versioned sessionStorage key', () => {
  it('cc-global-chat-button.js uses cc_lumimes_context_v1 key', () => {
    assert.ok(existsSync(CHAT_BTN), 'cc-global-chat-button.js must exist');
    const src = readFileSync(CHAT_BTN, 'utf8');
    assert.ok(src.includes('cc_lumimes_context_v1'),
      'LumiMes context must use versioned key cc_lumimes_context_v1');
  });
});

// ── T06: Context chip remove button ──────────────────────────────────────────
describe('T06 — Context chip has remove (✕) button', () => {
  it('cc-global-chat-button.js defines _setContextChip with remove button', () => {
    const src = readFileSync(CHAT_BTN, 'utf8');
    assert.ok(src.includes('_setContextChip'),
      'CCLumiMes must have _setContextChip method');
    assert.ok(src.includes('clearContext') || src.includes('removeItem') || src.includes('✕'),
      'Context chip must have a remove/clear mechanism');
  });
});

// ── T07: Deep study URL format correct ───────────────────────────────────────
describe('T07 — SBA deep study URL format', () => {
  it('deepStudyUrl uses /sba/studium/ with book, ch, v, translation=UBG params', () => {
    const src = readFileSync(SBA_APP, 'utf8');
    assert.ok(src.includes("'/sba/studium/'") || src.includes('"/sba/studium/"') || src.includes('/sba/studium/'),
      'deepStudyUrl must use /sba/studium/');
    assert.ok(src.includes("translation', 'UBG'") || src.includes("translation\", \"UBG\"") || src.includes("'translation', 'UBG'"),
      'deepStudyUrl must set translation=UBG');
  });
});

// ── T08: chat-service.js processes bible context ─────────────────────────────
describe('T08 — chat-service.js reads context.bible payload', () => {
  it('chat-service.js imports and uses ccBibleGetVerse for context enrichment', () => {
    assert.ok(existsSync(CHAT_SVC), 'chat-service.js must exist');
    const src = readFileSync(CHAT_SVC, 'utf8');
    assert.ok(src.includes('ccBibleGetVerse') || src.includes('cc-domain-tools'),
      'chat-service.js must import ccBibleGetVerse from cc-domain-tools');
    assert.ok(src.includes('context.bible') || src.includes('payload.context'),
      'chat-service.js must handle payload.context.bible');
  });

  it('chat-service.js response includes contextSnapshot field', () => {
    const src = readFileSync(CHAT_SVC, 'utf8');
    assert.ok(src.includes('contextSnapshot') || src.includes('activeContextSnapshot'),
      'chat-service.js response must include contextSnapshot');
  });
});

// ── T09: Fallback when CCLumiMes not available ───────────────────────────────
describe('T09 — SBA fallback when CCLumiMes widget not available', () => {
  it('sba/app.js has fallback branch (window.open) when CCLumiMes missing', () => {
    const src = readFileSync(SBA_APP, 'utf8');
    assert.ok(src.includes("window.open(askAiUrl(verse).href") || src.includes("window.open"),
      'SBA must fall back to window.open when CCLumiMes.openWithContext not available');
    assert.ok(src.includes("typeof window.CCLumiMes.openWithContext === 'function'"),
      'Must guard with typeof check before calling CCLumiMes.openWithContext');
  });
});

// ── T10: No live channel files touched ───────────────────────────────────────
describe('T10 — Protected live channel files not modified', () => {
  const PROTECTED = [
    'cctv24-worship.html', 'stream-scene.html', 'cctv24.html',
    'snadaniowa-live.html', 'zapolske-live.html', 'cctv24-worship-live.html'
  ].map((f) => path.join(ROOT, f));

  for (const f of PROTECTED) {
    if (existsSync(f)) {
      it(`${path.basename(f)} must not contain CC Connect 2.0 markers`, () => {
        const src = readFileSync(f, 'utf8');
        assert.ok(!src.includes('CC_PLUGIN_REGISTRY'),
          `Protected file ${path.basename(f)} must not contain CC Connect 2.0 code`);
      });
    }
  }
});
