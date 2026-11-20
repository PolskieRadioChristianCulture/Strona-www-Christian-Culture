import vm from 'node:vm';
import { renderLumiPage } from './lumi-page.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { handlePrayerCounter } from '../services/prayer-40dm/counter-service.js';
import { makeReminder, shareLinks } from '../40DM/community.js';

const origin = 'https://polskieradio.cc';
const endpoint = origin + '/api/40dm/counter';

test('count is a Warsaw-day aggregate, confirms the same browser once and removes expired rows', async () => {
  const sqlite = new DatabaseSync(':memory:');
  try {
    sqlite.exec(readFileSync('migrations/0005_prayer_40dm.sql', 'utf8'));
    const db = {
      prepare(sql) { return { bind(...params) {
        const statement = sqlite.prepare(sql);
        return {
          first: async () => statement.get(...params),
          batchRun: () => sql.startsWith('SELECT') ? { results: statement.all(...params) } : statement.run(...params)
        };
      } }; },
      async batch(statements) {
        sqlite.exec('BEGIN');
        try { const result = statements.map(x => x.batchRun()); sqlite.exec('COMMIT'); return result; }
        catch (e) { sqlite.exec('ROLLBACK'); throw e; }
      }
    };
    const before = new Date('2026-11-20T22:59:00Z');
    const after = new Date('2026-11-20T23:01:00Z');
    const one = '02345678-1234-4123-9123-123456789abc';
    const two = '12345678-1234-4123-9123-123456789abc';
    const post = (token, source = origin) => new Request(endpoint, { method: 'POST', headers:{origin:source,'Content-Type':'text/plain'}, body:token });
    const run = async (req, now = before) => handlePrayerCounter(req, db, now);
    assert.deepEqual(await (await run(new Request(endpoint))).json(), { day:'2026-11-20',count:0 });
    assert.equal((await run(post(one, 'https://other.invalid'))).status,403);
    assert.equal((await run(post(one.repeat(20)))).status,400);
    assert.equal((await (await run(post(one))).json()).count,1);
    assert.equal((await (await run(post(one))).json()).count,1);
    assert.equal((await (await run(post(two))).json()).count,2);
    assert.deepEqual(await (await run(new Request(endpoint),after)).json(), { day:'2026-11-21',count:0 });
    assert.deepEqual(await (await run(post(two),after)).json(), { day:'2026-11-21',count:1 });
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM prayer_40dm_confirmations').get().count,1);
    assert.equal((await handlePrayerCounter(new Request(endpoint), null)).status,503);
  } finally { sqlite.close(); }
});

test('calendar reminder starts tomorrow in local time, links to next unsigned day and has a finite duration', () => {
  const file = makeReminder('en','18:30',33,new Date(2026,11,31,15));
  assert.match(file,/DTSTART:20270101T183000\r\nDURATION:PT10M/);
  assert.match(file,/RRULE:FREQ=DAILY;COUNT=33/);
  assert.match(file,/URL:https:\/\/polskieradio\.cc\/40DM\/en\/\?next=1#plan/);
  assert.match(file,/BEGIN:VALARM\r\nTRIGGER:PT0M/);
  assert.equal(makeReminder('pl','00:00',0),'');
  assert.equal(makeReminder('pl','26:00',4),'');
});

test('all search surfaces point to static canonical sibling locales with a public sharing link', () => {
  for (const [locale, page] of [['pl','40DM/index.html'],['en','40DM/en/index.html']]) {
    const links = shareLinks(locale);
    const html = readFileSync(page,'utf8');
    const escaped = links.url.replaceAll('/','\\/');
    assert.match(html,new RegExp('rel="canonical" href="'+escaped+'"'));
    assert.match(html,new RegExp('<html lang="'+locale+'">'));
    assert.ok(html.includes('hreflang="pl"') && html.includes('hreflang="en"'));
    assert.match(html,/application\/ld\+json/);
    assert.match(html,/og:image/);
    assert.ok(readFileSync('sitemaps/pages.xml','utf8').includes('<loc>'+links.url+'</loc>'));
    assert.match(links.WhatsApp,/^https:\/\/wa\.me\//);
    for (const path of ['data/cc-search-index.json','szukaj/catalog.json']) {
      const entries = JSON.parse(readFileSync(path,'utf8').replace(/^\uFEFF/,'')).items;
      assert.equal(entries.filter(x=>x.url === links.url && x.lang === locale && x.access === 'public').length,1);
    }
  }
});

test('Rut can open the 40DM knowledge card and the canonical Messenger loads the same assistant once', () => {
  const context = { console, URL, URLSearchParams };
  vm.runInNewContext(readFileSync('js/cc-assistant.js','utf8'), context);
  const assistant = context.CCAssistant;
  assert.equal(assistant.SafetyPolicy.validateTopicParam('40dm'),'40dm');
  assert.equal(assistant.KnowledgeService.getById('40dm').url,'/40DM');
  const messenger = renderLumiPage(readFileSync('lumina.html','utf8'));
  assert.equal((messenger.match(/cc-assistant\.js\?v=20261120_40dm_growth1/g) || []).length,1);
  assert.match(messenger,/lumi-live-rooms\.js\?v=20261120_40dm_growth1/);
});
