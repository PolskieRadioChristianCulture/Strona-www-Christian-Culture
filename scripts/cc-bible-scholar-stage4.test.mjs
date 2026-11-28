import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getScholarStats,
  isToolAllowedForSession
} from '../services/ai-dla-jezusa/plugin-registry.js';
import {
  ccBibleMorphologyParse,
  ccBibleTokenAnalysis,
  ccBibleEntityLookup,
  ccBibleGospelSynopsis
} from '../services/ai-dla-jezusa/scholar-tools.js';
import { handleAiDlaJezusaApi } from '../services/ai-dla-jezusa/api-v1.js';

test('Etap 4 Registry: 16/40 Scholar plugins ready (morphology, parallel-passages, bible-atlas, people-prosopography)', () => {
  const stats = getScholarStats();
  assert.equal(stats.total, 40);
  assert.equal(stats.readyCount, 16);
  assert.equal(stats.plannedCount, 24);

  assert.equal(isToolAllowedForSession('cc_bible_morphology_parse', ['morphology', 'strongs']).allowed, true);
  assert.equal(isToolAllowedForSession('cc_bible_entity_lookup', ['bible-atlas']).allowed, true);
  assert.equal(isToolAllowedForSession('cc_bible_entity_lookup', ['people-prosopography']).allowed, true);
  assert.equal(isToolAllowedForSession('cc_bible_gospel_synopsis', ['parallel-passages', 'cross-references']).allowed, true);
});

test('Etap 4 Morphology: Greek (Robinson/SBLGNT) & Hebrew/Aramaic (OSHB/WLC) decoding + token enrichment', async () => {
  const grcVerb = await ccBibleMorphologyParse({ morphCode: 'V-IAI-3S', langHint: 'grc' });
  assert.equal(grcVerb.ok, true);
  assert.equal(grcVerb.found, true);
  assert.equal(grcVerb.datasetId, 'sblgnt-morphology');
  assert.equal(grcVerb.decoded.valid, true);
  assert.match(grcVerb.decoded.fullDescription, /Czasownik/i);
  assert.match(grcVerb.decoded.fullDescription, /3\. osoba/);

  const grcNoun = await ccBibleMorphologyParse({ morphCode: 'N-DSF' });
  assert.equal(grcNoun.ok, true);
  assert.equal(grcNoun.decoded.lang, 'grc');
  assert.match(grcNoun.decoded.fullDescription, /celownik/i);

  const hebVerb = await ccBibleMorphologyParse({ morphCode: 'HVqp3ms', langHint: 'heb' });
  assert.equal(hebVerb.ok, true);
  assert.equal(hebVerb.datasetId, 'oshb-morphology');
  assert.equal(hebVerb.decoded.valid, true);
  assert.match(hebVerb.decoded.fullDescription, /Qal/i);

  const missing = await ccBibleMorphologyParse({});
  assert.equal(missing.ok, false);
  assert.equal(missing.code, 'MISSING_MORPH_CODE');

  const jhn11 = await ccBibleTokenAnalysis({ reference: 'JHN 1:1' });
  assert.equal(jhn11.found, true);
  assert.ok(jhn11.tokens.length > 0);
  assert.ok(jhn11.tokens[0].decodedMorphology, 'Token J 1:1 musi zawierać decodedMorphology');

  const dan24 = await ccBibleTokenAnalysis({ reference: 'DAN 2:4' });
  assert.equal(dan24.found, true);
  assert.equal(dan24.isAramaicSection, true);
  assert.ok(dan24.tokens[0].decodedMorphology, 'Token DAN 2:4 musi zawierać decodedMorphology');
});

test('Etap 4 Theographic: Places (coordinates GPS) & People (roles/relatives)', async () => {
  const placeRes = await ccBibleEntityLookup({ entityType: 'places', query: 'Jerozolima' });
  assert.equal(placeRes.ok, true);
  assert.equal(placeRes.found, true);
  assert.equal(placeRes.datasetId, 'theographic-bible-data');
  assert.equal(placeRes.licenseId, 'CC-BY-SA-4.0');
  const jerusalem = placeRes.items.find((i) => i.id === 'place-jerusalem');
  assert.ok(jerusalem, 'Powinna zostać znaleziona Jerozolima');
  assert.equal(jerusalem.entityType, 'place');
  assert.ok(jerusalem.coordinates && typeof jerusalem.coordinates.lat === 'number' && typeof jerusalem.coordinates.lon === 'number');

  const personRes = await ccBibleEntityLookup({ entityType: 'people', query: 'Dawid' });
  assert.equal(personRes.ok, true);
  assert.equal(personRes.found, true);
  const david = personRes.items.find((i) => i.id === 'person-david');
  assert.ok(david, 'Powinien zostać znaleziony Dawid');
  assert.equal(david.entityType, 'person');
  assert.ok(Array.isArray(david.roles) && david.roles.length > 0);
  assert.ok(david.relatives && typeof david.relatives === 'object');
});

test('Etap 4 Gospel Synopsis: lookup by pericopeId, passage & query', async () => {
  const byId = await ccBibleGospelSynopsis({ pericopeId: 'synopsis-baptism-jesus' });
  assert.equal(byId.ok, true);
  assert.equal(byId.found, true);
  assert.equal(byId.datasetId, 'gospel-synopsis');
  assert.equal(byId.pericopes.length, 1);

  const byPassage = await ccBibleGospelSynopsis({ passage: 'MAT 3:13' });
  assert.equal(byPassage.ok, true);
  assert.equal(byPassage.found, true);
  assert.ok(byPassage.pericopes.some((p) => p.id === 'synopsis-baptism-jesus'));

  const byQuery = await ccBibleGospelSynopsis({ query: 'pięciu tysięcy' });
  assert.equal(byQuery.ok, true);
  assert.equal(byQuery.found, true);
  assert.ok(byQuery.pericopes.some((p) => p.id === 'synopsis-feeding-5000'));
});

test('Etap 4 REST API v1 & MCP JSON-RPC dispatch', async () => {
  const morphRes = await handleAiDlaJezusaApi(new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/scholar/morphology?code=V-IAI-3S&lang=grc'));
  assert.equal(morphRes.status, 200);
  const morphJson = await morphRes.json();
  assert.equal(morphJson.ok, true);
  assert.equal(morphJson.decoded.lang, 'grc');

  const entRes = await handleAiDlaJezusaApi(new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/scholar/entities?q=Betlejem&type=places'));
  assert.equal(entRes.status, 200);
  const entJson = await entRes.json();
  assert.equal(entJson.found, true);
  assert.ok(entJson.items.some((i) => i.name === 'Betlejem'));

  const synRes = await handleAiDlaJezusaApi(new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/scholar/synopsis?ref=J%206:1'));
  assert.equal(synRes.status, 200);
  const synJson = await synRes.json();
  assert.equal(synJson.found, true);
  assert.ok(synJson.pericopes.some((p) => p.id === 'synopsis-feeding-5000'));

  const mcpSyn = await handleAiDlaJezusaApi(new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CC-Active-Plugins': 'parallel-passages,cross-references'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 41,
      method: 'tools/call',
      params: { name: 'cc_bible_gospel_synopsis', arguments: { pericopeId: 'synopsis-baptism-jesus' } }
    })
  }));
  assert.equal(mcpSyn.status, 200);
  const mcpSynJson = await mcpSyn.json();
  assert.match(mcpSynJson.result?.content?.[0]?.text || '', /Chrzest Jezusa/);
});
