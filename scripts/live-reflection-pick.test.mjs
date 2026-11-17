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
