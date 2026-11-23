// @007 2026-11-17: kanały live pokazują dzisiejsze rozważanie, a gdy go brak — najnowsze z datą ≤ dziś.
// Regresja: w listopadzie Master Live pokazywał „Lato z Jezusem” (sierpień), bo brano najstarszy wpis
// albo o północy cofano ręczny indeks o jeden dzień w głąb archiwum.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHANNELS = ['bibleaudio-global.html', 'biblia-spiewana-live.html', 'cctv24-global.html', 'cctv24-pl.html',
  'cctv24-worship-live.html', 'cctv24-worship.html', 'cctv24.html', 'live_check.html', 'zapolske-live.html'];

function loadPicker(file) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const m = html.match(/window\.ccPickReflectionIdx=function[\s\S]*?return best!==-1\?best:0;\};/);
  assert.ok(m, `${file}: brak funkcji ccPickReflectionIdx`);
  const window = {};
  new Function('window', m[0])(window);
  return { html, pick: window.ccPickReflectionIdx };
}
const ymd = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

for (const file of CHANNELS) {
  test(`${file}: wybiera dzisiejsze albo najnowsze ≤ dziś, nigdy archiwum`, () => {
    const { html, pick } = loadPicker(file);
    assert.equal(pick([{ date: ymd(-1) }, { date: ymd(-2) }, { date: '2026-08-01' }]), 0);
    assert.equal(pick([{ date: '2026-08-01' }, { date: ymd(-3) }, { date: ymd(-1) }]), 2);
    assert.equal(pick([{ date: ymd(1) }, { date: ymd(0) }, { date: ymd(-1) }]), 1);
    assert.equal(pick([{ date: ymd(2) }, { date: ymd(-5) }]), 1);
    assert.doesNotMatch(html, /!== -1\) \? (foundIdx|latestIdx) : \(reflectionsData\.length - 1\)/, 'fallback do najstarszego wpisu');
    assert.doesNotMatch(html, /!== -1\) \? foundIdx : currentDayIndex/, 'fallback do zapamiętanego indeksu');
    assert.doesNotMatch(html, /let nextDay = \(parseInt\(safeStorage\.getItem\("dzj_stream_day"\)/, 'cofanie indeksu o północy');
  });
}

test('rozwazania_baza.json: każdy wpis ma id, date, title oraz treść', () => {
  const list = JSON.parse(fs.readFileSync(path.join(ROOT, 'rozwazania_baza.json'), 'utf8'));
  assert.ok(Array.isArray(list) && list.length > 0, 'rozwazania_baza.json musi być niepustą tablicą');
  list.forEach((entry, idx) => {
    assert.ok(entry && typeof entry === 'object', `wpis #${idx} musi być obiektem`);
    assert.ok(typeof entry.id === 'string' && entry.id.trim().length > 0, `wpis #${idx} (${entry.date || '?'}) nie ma id`);
    assert.match(String(entry.date || ''), /^\d{4}-\d{2}-\d{2}$/, `wpis #${idx} (${entry.id}) ma błędną datę: ${entry.date}`);
    assert.ok(typeof entry.title === 'string' && entry.title.trim().length > 0, `wpis #${idx} (${entry.id}) nie ma title`);
    const text = entry.fullText || entry.contentApp || entry.contentWeb || '';
    assert.ok(typeof text === 'string' && text.trim().length > 0, `wpis #${idx} (${entry.id}) nie ma treści`);
  });
});

test('cctv24-pl.html: bezpieczne parsowanie ref.id, odporny catch, brak googtrans=/pl/en i odporność na stary localStorage', () => {
  const plHtml = fs.readFileSync(path.join(ROOT, 'cctv24-pl.html'), 'utf8');
  assert.doesNotMatch(plHtml, /ref\.id\.replace\(/, 'cctv24-pl.html: niechronione wywołanie ref.id.replace');
  assert.doesNotMatch(plHtml, /document\.querySelector\(["']\.slide-title["']\)\.textContent\s*=/, 'cctv24-pl.html: niechroniony zapis do .slide-title.textContent');
  assert.doesNotMatch(plHtml, /googtrans=\/pl\/en/, 'cctv24-pl.html: niepożądane wymuszanie angielskiego tłumaczenia na polskim kanale');
  assert.doesNotMatch(plHtml, /<script\s+src="live-window-manager\.js"/i, 'cctv24-pl.html: live-window-manager.js nie może wstrzykiwać zatrutego live_win_cfg_*');
  assert.doesNotMatch(plHtml, /customImgSrc\s*=\s*safeStorage\.getItem\(["']dzj_stream_image["']\)/, 'cctv24-pl.html: nie może wczytywać potencjalnie martwego dzj_stream_image z globalnego localStorage');
  assert.doesNotMatch(plHtml, /body\.mode-studio\s+\.reflection-canvas-card\s*\{[^}]*left:\s*320px/i, 'cctv24-pl.html: mode-studio nie może wypychać karty o 320px w prawo');
  assert.match(plHtml, /bgActiveImg\.addEventListener\(["']error["']/, 'cctv24-pl.html: wymagany fallback error na #bg-img-active');
});
