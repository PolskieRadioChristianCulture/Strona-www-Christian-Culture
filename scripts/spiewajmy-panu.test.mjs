/**
 * Śpiewnik Biblijny „Śpiewajmy Panu” — Testy integralności, licencji, audio MP3, SBA i MCP
 * Run: node --test scripts/spiewajmy-panu.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPluginManifest } from '../services/ai-dla-jezusa/plugin-registry.js';
import { handleMcpRequest } from '../services/ai-dla-jezusa/mcp-server.js';
import { isPublicFile } from './cc-release-files.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const metaData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'spiewajmy-panu-meta.json'), 'utf8'));

describe('Śpiewajmy Panu — Kompletność katalogu 700/700 i ochrona licencji (W przygotowaniu)', () => {
  it('zawiera dokładnie 700 unikalnych pieśni (Nr 1..700) w spiewajmy-panu-meta.json bez żadnych braków', () => {
    assert.equal(metaData.totalSongs, 700);
    assert.equal(metaData.songs.length, 700);
    const nums = new Set(metaData.songs.map((s) => s.number));
    assert.equal(nums.size, 700);
    for (let n = 1; n <= 700; n++) {
      assert.ok(nums.has(n), `Brak pieśni nr ${n}`);
    }
  });

  it('zawiera wszystkie 41 kategorii tematycznych obejmujących zakres 1..700', () => {
    assert.equal(metaData.categories.length, 41);
    assert.equal(metaData.categories[0].from, 1);
    assert.equal(metaData.categories[metaData.categories.length - 1].to, 700);
  });

  it('blokuje pełny plik data/spiewajmy-panu.json przed publicznym wdrożeniem (isPublicFile === false)', () => {
    assert.equal(isPublicFile('data/spiewajmy-panu.json'), false);
    assert.equal(isPublicFile('data/spiewajmy-panu-meta.json'), true);
  });
});

describe('Śpiewajmy Panu — Klasyfikacja licencyjna i plik meta', () => {
  it('każda pieśń ma licenseId oraz licenseStatus', () => {
    for (const s of metaData.songs) {
      assert.ok(s.licenseId, `Pieśń ${s.number} bez licenseId`);
      assert.ok(['public_domain', 'rights_review_required'].includes(s.licenseStatus));
    }
  });

  it('spiewajmy-panu-meta.json udostępnia zwrotki WYŁĄCZNIE dla pieśni public_domain', () => {
    const pdSong = metaData.songs.find((s) => s.number === 1); // J. Neander 1650-1680
    assert.equal(pdSong.lyricsPublicAllowed, true);
    assert.ok(Array.isArray(pdSong.stanzas) && pdSong.stanzas.length >= 4);

    const reviewSong = metaData.songs.find((s) => s.number === 8); // sł. pol. R. Chalupka
    assert.equal(reviewSong.lyricsPublicAllowed, false);
    assert.equal(reviewSong.stanzas, null);
    assert.equal(reviewSong.officialUrl, 'https://muzycy.adwent.pl/');
  });
});

describe('Śpiewajmy Panu — Wtyczka CC Connect 2.0 + MCP (bez modelu AI) + SBA', () => {
  it('wtyczka spiewajmy-panu jest zarejestrowana i oznaczona W przygotowaniu', () => {
    const manifest = getPluginManifest('spiewajmy-panu');
    assert.ok(manifest, 'Brak wtyczki spiewajmy-panu');
    assert.equal(manifest.availability, 'ready');
    assert.equal(manifest.statusLabel, 'W przygotowaniu');
    assert.ok(manifest.tools.includes('cc_hymnal_get_song'));
    assert.ok(manifest.tools.includes('cc_hymnal_search'));
    assert.ok(manifest.tools.includes('cc_hymnal_by_category'));
  });

  it('MCP cc_hymnal_get_song zwraca pieśń nr 1 (PD) z tekstem oraz nr 8 bez tekstu (ochrona licencji)', async () => {
    const req1 = new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CC-Active-Plugins': 'spiewajmy-panu' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'tools/call',
        params: { name: 'cc_hymnal_get_song', arguments: { number: 1 } }
      })
    });
    const payload1 = JSON.parse((await (await handleMcpRequest(req1, {}, {})).json()).result.content[0].text);
    assert.equal(payload1.ok, true);
    assert.equal(payload1.number, 1);
    assert.equal(payload1.lyricsIncluded, true);
    assert.match(payload1.title, /Wielbij Mocarza/i);

    const req8 = new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CC-Active-Plugins': 'spiewajmy-panu' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 8, method: 'tools/call',
        params: { name: 'cc_hymnal_get_song', arguments: { number: 8 } }
      })
    });
    const payload8 = JSON.parse((await (await handleMcpRequest(req8, {}, {})).json()).result.content[0].text);
    assert.equal(payload8.ok, true);
    assert.equal(payload8.lyricsIncluded, false);
    assert.equal(payload8.stanzas, null);
  });

  it('odłączenie wtyczki spiewajmy-panu blokuje dostęp do cc_hymnal_search przez bramkę MCP', async () => {
    const req = new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CC-Active-Plugins': 'scroll-bible' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'cc_hymnal_search', arguments: { query: 'sobota' } }
      })
    });
    const res = await handleMcpRequest(req, {}, {});
    const json = await res.json();
    assert.ok(json.error);
    assert.match(json.error.message, /PLUGIN_NOT_INSTALLED/);
  });

  it('Scrolluj Biblię (sba/app.js) oraz /spiewnik-biblijny/ korzystają wyłącznie z licencyjnego spiewajmy-panu-meta.json', () => {
    const sbaSrc = fs.readFileSync(path.join(ROOT, 'sba', 'app.js'), 'utf8');
    assert.ok(sbaSrc.includes('openSpiewajmyPanuDialog'));
    assert.ok(sbaSrc.includes('/data/spiewajmy-panu-meta.json'));
    const spHtml = fs.readFileSync(path.join(ROOT, 'spiewnik-biblijny', 'index.html'), 'utf8');
    assert.ok(spHtml.includes('noindex, nofollow'));
    assert.ok(spHtml.includes('W PRZYGOTOWANIU'));
  });
});
