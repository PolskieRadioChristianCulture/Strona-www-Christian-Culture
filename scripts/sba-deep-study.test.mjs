import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { isPublicFile } from './cc-release-files.mjs';
import { parseStudyParams, validatePassage, buildBibleIndex, getVerseRange, findLexicalParallels } from '../sba/studium/data.js';
import {
  OPENING_SCREEN, STAGES, BIG_SIX, BIG_TWELVE, ANNOTATION_CATEGORIES,
  CONTEXT_CIRCLES, HERMENEUTIC_QUESTIONS, INTERPRETATION_PRINCIPLES,
  INTERPRETATION_QUESTIONS, APPLICATION_QUESTIONS, CREATIVE_TEMPLATES
} from '../sba/studium/content.js';
import { SCHEMA_VERSION, createEmptyStudy, migrateStudy, serializeStudyJson, parseImportedJson } from '../sba/studium/db.js';
import { createDefaultMindMap, addBranchNode, removeBranchNode, addMindMapEdge, buildMindMapSvgString, buildMindMapTextOutline } from '../sba/studium/mindmap.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

test('/sba menu has highlighted Głębokie studiowanie opening in new tab safely', () => {
  const sbaJs = fs.readFileSync(path.join(ROOT, 'sba', 'app.js'), 'utf8');
  const sbaCss = fs.readFileSync(path.join(ROOT, 'sba', 'styles.css'), 'utf8');

  assert.match(sbaJs, /deepStudyRow:\s*'Głębokie studiowanie'/);
  assert.match(sbaJs, /menu-row menu-row-featured/);
  assert.match(sbaJs, /anchor\.target = '_blank'/);
  assert.match(sbaJs, /anchor\.rel = 'noopener noreferrer'/);
  assert.match(sbaJs, /new URL\('\/sba\/studium\/'/);
  assert.match(sbaJs, /translation', 'UBG'/);
  assert.doesNotMatch(sbaJs, /deepStudyUrl[\s\S]{0,400}note/);
  assert.match(sbaCss, /\.menu-row\.menu-row-featured\s*\{/);
});

test('sba/studium is public for release, routed in _redirects, and indexed', () => {
  assert.equal(isPublicFile('sba/studium/index.html'), true);
  assert.equal(isPublicFile('sba/studium/app.js'), true);
  assert.equal(isPublicFile('sba/studium/data.js'), true);
  assert.equal(isPublicFile('sba/studium/db.js'), true);
  assert.equal(isPublicFile('sba/studium/mindmap.js'), true);
  assert.equal(isPublicFile('sba/studium/content.js'), true);
  assert.equal(isPublicFile('sba/studium/styles.css'), true);

  const html = fs.readFileSync(path.join(ROOT, 'sba', 'studium', 'index.html'), 'utf8');
  assert.match(html, /<meta name="robots" content="index, follow/);
  assert.doesNotMatch(html, /Mission Control/i);

  const redirects = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');
  assert.match(redirects, /\/sba\/studium\s+\/sba\/studium\/index\.html\s+200/);
  assert.match(redirects, /\/sba\/studium\/\s+\/sba\/studium\/index\.html\s+200/);
  assert.match(redirects, /\/test\/sba\/studium\/\s+\/sba\/studium\/\s+301/);
});

test('URL parsing, passage validation and real UBG verses work cleanly', () => {
  const indexJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'bible', 'szukaj-ubg.json'), 'utf8'));
  const metadataJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'bible', 'bible_books_metadata.json'), 'utf8'));
  const bible = buildBibleIndex(indexJson, metadataJson);

  const ok = validatePassage(bible, parseStudyParams('?book=JHN&ch=3&v=16&end=16&translation=UBG'));
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.passage, { book: 'JHN', ch: 3, v: 16, end: 16, translation: 'UBG' });

  const badBook = validatePassage(bible, parseStudyParams('?book=<script>&ch=999&v=0'));
  assert.equal(badBook.ok, false);
  assert.equal(badBook.fallback.book, 'JHN');

  const badCh = validatePassage(bible, parseStudyParams('?book=PSA&ch=999&v=1'));
  assert.equal(badCh.ok, false);

  // Verify all 5 opening prayer verses exist in UBG
  for (const refSpec of OPENING_SCREEN.verseRefs) {
    const verses = getVerseRange(bible, refSpec.book, refSpec.ch, refSpec.v, refSpec.end);
    assert.ok(verses.length >= 1, `Missing opening verse ${refSpec.label}`);
    assert.ok(verses[0].text.length > 10, `Empty opening verse text for ${refSpec.label}`);
  }

  // Verify control example Flp 4:10-14 exists
  const php = getVerseRange(bible, 'PHP', 4, 10, 14);
  assert.equal(php.length, 5);

  const parallels = findLexicalParallels(bible, 'JHN', 3, 16, 16, 5);
  assert.ok(Array.isArray(parallels));
});

test('Spec domain structures are complete and keep Mission Control private', () => {
  assert.equal(STAGES.length, 8);
  assert.equal(BIG_SIX.length, 6);
  assert.equal(BIG_TWELVE.length, 12);
  assert.equal(ANNOTATION_CATEGORIES.length, 8);
  assert.equal(CONTEXT_CIRCLES.length, 7);
  assert.equal(HERMENEUTIC_QUESTIONS.length, 12);
  assert.equal(INTERPRETATION_PRINCIPLES.length, 10);
  assert.equal(INTERPRETATION_QUESTIONS.length, 12);
  assert.equal(APPLICATION_QUESTIONS.length, 12);
  assert.equal(CREATIVE_TEMPLATES.length, 13);

  const appJs = fs.readFileSync(path.join(ROOT, 'sba', 'studium', 'app.js'), 'utf8');
  assert.match(appJs, /'\/kazania\/'/);
  assert.doesNotMatch(appJs, /Mission Control/i);
});

test('IndexedDB schema migration, UTF-8 Polish preservation and privacy share defaults', () => {
  const study = createEmptyStudy({
    bookId: 'PSA',
    chapter: 119,
    verseStart: 18,
    verseEnd: 18,
    title: 'Zażółć gęślą jaźń — Ps 119:18'
  });
  assert.equal(study.schemaVersion, SCHEMA_VERSION);
  assert.equal(study.shareSelection.includePrivatePrayer, false);
  assert.equal(study.shareSelection.includePrivateNotes, false);
  assert.equal(study.shareSelection.includeCommitments, false);

  study.prayer.openingPrayer = 'Ojcze, dziękuję Ci za źródło mądrości — ąćęłńóśźż.';
  const json = serializeStudyJson(study);
  const imported = parseImportedJson(json);
  assert.equal(imported.length, 1);
  assert.equal(imported[0].title, 'Zażółć gęślą jaźń — Ps 119:18');
  assert.equal(imported[0].prayer.openingPrayer, 'Ojcze, dziękuję Ci za źródło mądrości — ąćęłńóśźż.');
  assert.equal(imported[0].shareSelection.includePrivatePrayer, false);

  const legacyMigrated = migrateStudy({
    bookId: 'jhn',
    chapter: 3,
    verseStart: 16,
    answers: { b6_who: 'Bóg i świat\u0000' }
  });
  assert.equal(legacyMigrated.bookId, 'JHN');
  assert.equal(legacyMigrated.answers.b6_who.text, 'Bóg i świat');
  assert.equal(legacyMigrated.shareSelection.includePrivatePrayer, false);
});

test('Mind map nodes, edges, accessible outline and XML-safe SVG export', () => {
  let mm = createDefaultMindMap('J 3:16');
  const r1 = addBranchNode(mm, { parentId: 'root', label: 'Boża miłość <script>', verseRef: 'Rz 5:8', note: 'Dar' });
  mm = r1.mindMap;
  assert.equal(mm.nodes.length, 2);

  mm = addMindMapEdge(mm, 'root', r1.added.id, 'potwierdzenie');
  assert.equal(mm.edges.length, 1);

  const svg = buildMindMapSvgString(mm);
  assert.match(svg, /^<svg /);
  assert.doesNotMatch(svg, /<script>/);
  assert.match(svg, /&lt;script&gt;/);

  const outline = buildMindMapTextOutline(mm);
  assert.match(outline, /J 3:16/);
  assert.match(outline, /Rz 5:8/);

  mm = removeBranchNode(mm, r1.added.id);
  assert.equal(mm.nodes.length, 1);
  assert.equal(mm.edges.length, 0);
});

test('Scrolluj Biblię and Głębokie studium are registered in all CC search, map, and apps catalogs', () => {
  for (const rel of ['data/cc-search-index.json', 'szukaj/catalog.json']) {
    const idx = JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
    assert.ok(idx.items.some((x) => x.url === 'https://polskieradio.cc/sba'), `${rel} missing /sba`);
    assert.ok(idx.items.some((x) => x.url === 'https://polskieradio.cc/sba/studium/'), `${rel} missing /sba/studium/`);
  }
  const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ecosystem-map.json'), 'utf8'));
  assert.ok(map.nodes.some((n) => n.url === 'https://polskieradio.cc/sba'), 'ecosystem-map nodes missing /sba');
  assert.ok(map.nodes.some((n) => n.url === 'https://polskieradio.cc/sba/studium/'), 'ecosystem-map nodes missing /sba/studium/');

  const media = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/cc-search-media-index.json'), 'utf8'));
  assert.ok(media.channels.some((c) => c.url === '/sba'), 'cc-search-media-index missing /sba');
  assert.ok(media.channels.some((c) => c.url === '/sba/studium/'), 'cc-search-media-index missing /sba/studium/');

  const omni = fs.readFileSync(path.join(ROOT, 'components/cc-omni-search.js'), 'utf8');
  assert.match(omni, /\['Scrolluj Biblię',\s*'\/sba'/);
  assert.match(omni, /\['Głębokie studium',\s*'\/sba\/studium\/'/);
});
