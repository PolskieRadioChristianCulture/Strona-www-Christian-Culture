/**
 * Mój kościół — Scrolluj Biblię v2.0 + Szkoła Sobotnia PL/EN — Kompleksowa bateria testów odbioru
 * Pokrycie: Publiczny dostęp bez konta, RBAC/IDOR, 2-urządzeniowy LIVE Sync + 409/304,
 * Finanse (mod-97, dual approval, ukrycie niezweryfikowanego IBAN, audyt), Wygasanie ogłoszeń,
 * Prywatne notatki, Wydarzenia (.ics, odwołane, prywatne RSVP), Prośby modlitewne (brak AI),
 * Szkoła Sobotnia PL/EN (granice dat/kwartału/roku, blokada importu bez licencji, awaria API),
 * Śpiewnik (bramka licencyjna), Wtyczki CC Connect (cc.my-church & cc.sabbath-school) i MCP bez AI.
 *
 * Run: node --test scripts/moj-kosciol.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createMojKosciolStore,
  handleMojKosciolApi,
  validateIbanChecksum,
  buildEventIcs
} from '../services/moj-kosciol/moj-kosciol-service.js';
import { LessonProvider } from '../services/moj-kosciol/sabbath-school-provider.js';
import { getPluginManifest } from '../services/ai-dla-jezusa/plugin-registry.js';
import { handleMcpRequest } from '../services/ai-dla-jezusa/mcp-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const MOCK_USERS = {
  tok_owner_waw: { uid: 'demo_owner_warszawa', email: 'owner-waw@demo.local' },
  tok_leader_waw: { uid: 'demo_leader_warszawa', email: 'leader-waw@demo.local' },
  tok_treasurer_waw: { uid: 'demo_treasurer_warszawa', email: 'treasurer-waw@demo.local' },
  tok_editor_waw: { uid: 'demo_editor_warszawa', email: 'editor-waw@demo.local' },
  tok_owner_krk: { uid: 'demo_owner_krakow', email: 'owner-krk@demo.local' },
  tok_outsider: { uid: 'outsider_user_999', email: 'outsider@example.com' }
};

async function callApi(store, method, urlPath, { body = null, token = null, headers = {} } = {}) {
  const reqHeaders = { ...headers };
  if (token) reqHeaders.Authorization = `Bearer ${token}`;
  if (body !== null) reqHeaders['Content-Type'] = 'application/json';
  const req = new Request(`https://polskieradio.cc${urlPath}`, {
    method,
    headers: reqHeaders,
    body: body !== null ? JSON.stringify(body) : undefined
  });
  return handleMojKosciolApi(req, {}, {
    store,
    verifyToken: async (tok) => MOCK_USERS[tok] || null
  });
}

describe('1. Dostęp publiczny bez konta i katalog zborów (DEMO)', () => {
  it('użytkownik bez logowania znajduje zbór, otwiera wizytówkę i program nabożeństwa', async () => {
    const store = createMojKosciolStore();
    const dirRes = await callApi(store, 'GET', '/api/moj-kosciol/v1/churches?q=Warszawa');
    assert.equal(dirRes.status, 200);
    const dir = await dirRes.json();
    assert.ok(dir.count >= 1);
    assert.equal(dir.churches[0].isDemo, true);

    const profRes = await callApi(store, 'GET', '/api/moj-kosciol/v1/churches/warszawa-centrum-demo');
    assert.equal(profRes.status, 200);
    const prof = await profRes.json();
    assert.equal(prof.church.verificationStatus, 'verified');
    assert.ok(prof.activeServiceId);

    const srvRes = await callApi(store, 'GET', `/api/moj-kosciol/v1/services/${prof.activeServiceId}`);
    assert.equal(srvRes.status, 200);
    const srv = await srvRes.json();
    assert.equal(srv.items.length, 18); // Pełny szablon 18-punktowy ze specyfikacji
  });
});

describe('2. Izolacja tenantów, RBAC i testy IDOR', () => {
  it('nieuprawniony użytkownik ani właściciel innego zboru nie może edytować agendy, LIVE ani konta (403)', async () => {
    const store = createMojKosciolStore();

    // Zewnętrzny użytkownik -> 403
    const r1 = await callApi(store, 'POST', '/api/moj-kosciol/v1/services/srv_waw_2026_11_28_demo/live', {
      token: 'tok_outsider',
      body: { action: 'next', expectedRevision: 1 }
    });
    assert.equal(r1.status, 403);

    // Właściciel zboru Kraków (IDOR cross-tenant) -> 403 na zborze Warszawa
    const r2 = await callApi(store, 'POST', '/api/moj-kosciol/v1/churches/ch_kads_warszawa_demo/services', {
      token: 'tok_owner_krk',
      body: { title: 'Próba IDOR' }
    });
    assert.equal(r2.status, 403);

    // Edytor agendy NIE może zmieniać danych finansowych -> 403
    const r3 = await callApi(store, 'POST', '/api/moj-kosciol/v1/churches/ch_kads_warszawa_demo/giving', {
      token: 'tok_editor_waw',
      body: { category: 'local_church', beneficiary: 'Test', iban: 'PL61109010140000071219812874', transferTitle: 'Test' }
    });
    assert.equal(r3.status, 403);

    // Skarbnik NIE może edytować agendy nabożeństwa -> 403
    const r4 = await callApi(store, 'POST', '/api/moj-kosciol/v1/churches/ch_kads_warszawa_demo/services', {
      token: 'tok_treasurer_waw',
      body: { title: 'Skarbnik próbuje zmienić agendę' }
    });
    assert.equal(r4.status, 403);
  });

  it('administrator zakłada szkic, publikuje, zmienia kolejność i kopiuje tydzień', async () => {
    const store = createMojKosciolStore();
    const created = await (await callApi(store, 'POST', '/api/moj-kosciol/v1/churches/ch_kads_warszawa_demo/services', {
      token: 'tok_owner_waw',
      body: {
        title: 'Szkic nabożeństwa testowego',
        status: 'draft',
        items: [
          { plannedStart: '10:00', plannedDuration: 10, type: 'welcome', title: 'Punkt A' },
          { plannedStart: '10:10', plannedDuration: 20, type: 'sermon', title: 'Punkt B' }
        ]
      }
    })).json();
    assert.equal(created.ok, true);
    assert.equal(created.service.status, 'draft');

    // Zmiana kolejności + publikacja
    const updated = await (await callApi(store, 'POST', '/api/moj-kosciol/v1/churches/ch_kads_warszawa_demo/services', {
      token: 'tok_owner_waw',
      body: {
        id: created.service.id,
        status: 'published',
        items: [created.items[1], created.items[0]]
      }
    })).json();
    assert.equal(updated.service.status, 'published');
    assert.equal(updated.items[0].title, 'Punkt B');

    // Kopia na kolejny tydzień
    const copied = await (await callApi(store, 'POST', `/api/moj-kosciol/v1/services/${created.service.id}/copy-next-week`, {
      token: 'tok_owner_waw'
    })).json();
    assert.equal(copied.ok, true);
    assert.equal(copied.service.status, 'draft');
    assert.equal(copied.items.length, 2);
  });
});

describe('3. Synchronizacja LIVE dwóch urządzeń — revision, 409 Conflict, ETag 304', () => {
  it('prowadzący zmienia punkt (next/skip/prev/pause/resume/add_verse), urządzenie B pobiera snapshot, nieaktualna rewizja -> 409, ETag -> 304', async () => {
    const store = createMojKosciolStore();
    const srvId = 'srv_waw_2026_11_28_demo';

    // Urządzenie B pobiera snapshot początkowy + ETag
    const devB1 = await callApi(store, 'GET', `/api/moj-kosciol/v1/services/${srvId}/live`);
    const etag1 = devB1.headers.get('ETag');
    assert.ok(etag1);
    const snap1 = await devB1.json();
    assert.equal(snap1.liveState.revision, 1);

    // Polling bez zmian -> 304 Not Modified (oszczędność kosztów!)
    const devB304 = await callApi(store, 'GET', `/api/moj-kosciol/v1/services/${srvId}/live`, {
      headers: { 'If-None-Match': etag1 }
    });
    assert.equal(devB304.status, 304);

    // Prowadzący (Urządzenie A): next -> revision 2
    const nextRes = await (await callApi(store, 'POST', `/api/moj-kosciol/v1/services/${srvId}/live`, {
      token: 'tok_leader_waw',
      body: { action: 'next', expectedRevision: 1 }
    })).json();
    assert.equal(nextRes.liveState.revision, 2);
    assert.equal(nextRes.liveState.activeItemId, 'item_waw_02');

    // Konflikt równoczesnej edycji ze starą rewizją 1 -> 409 Conflict!
    const conflictRes = await callApi(store, 'POST', `/api/moj-kosciol/v1/services/${srvId}/live`, {
      token: 'tok_owner_waw',
      body: { action: 'pause', expectedRevision: 1 }
    });
    assert.equal(conflictRes.status, 409);

    // Skip -> revision 3, prev -> revision 4, pause -> revision 5, resume -> revision 6, add_verse -> revision 7
    await callApi(store, 'POST', `/api/moj-kosciol/v1/services/${srvId}/live`, { token: 'tok_leader_waw', body: { action: 'skip', expectedRevision: 2 } });
    await callApi(store, 'POST', `/api/moj-kosciol/v1/services/${srvId}/live`, { token: 'tok_leader_waw', body: { action: 'prev', expectedRevision: 3 } });
    await callApi(store, 'POST', `/api/moj-kosciol/v1/services/${srvId}/live`, { token: 'tok_leader_waw', body: { action: 'pause', expectedRevision: 4 } });
    await callApi(store, 'POST', `/api/moj-kosciol/v1/services/${srvId}/live`, { token: 'tok_leader_waw', body: { action: 'resume', expectedRevision: 5 } });
    const verseRes = await (await callApi(store, 'POST', `/api/moj-kosciol/v1/services/${srvId}/live`, {
      token: 'tok_leader_waw',
      body: { action: 'add_verse', expectedRevision: 6, bibleRef: 'J 3:16' }
    })).json();
    assert.equal(verseRes.liveState.revision, 7);

    // Reconnect Urządzenia B ze starym ETag -> 200 z pełnym snapshotem
    const devBReconnect = await callApi(store, 'GET', `/api/moj-kosciol/v1/services/${srvId}/live`, {
      headers: { 'If-None-Match': etag1 }
    });
    assert.equal(devBReconnect.status, 200);
    const snap2 = await devBReconnect.json();
    assert.equal(snap2.liveState.revision, 7);
    const curItem = snap2.items.find((i) => i.id === snap2.liveState.activeItemId);
    assert.ok(curItem.bibleRefs.includes('J 3:16'));
  });
});

describe('4. Dziesięciny i dary — ukrycie niezweryfikowanego IBAN, mod-97, dual approval i audyt', () => {
  it('niezweryfikowany rachunek NIGDY nie pojawia się publicznie; zmiana konta ukrywa dane do drugiego zatwierdzenia', async () => {
    const store = createMojKosciolStore();

    // Walidacja mod-97 + ostrzeżenie o braku potwierdzenia właściciela
    const check = validateIbanChecksum('PL61109010140000071219812874');
    assert.equal(check.valid, true);
    assert.equal(check.ownershipVerified, false);

    // Publiczny profil pokazuje WYŁĄCZNIE zweryfikowany rachunek (ukrywa giv_waw_unverified_demo!)
    const prof1 = await (await callApi(store, 'GET', '/api/moj-kosciol/v1/churches/warszawa-centrum-demo')).json();
    assert.equal(prof1.givingTargets.length, 1);
    assert.equal(prof1.givingTargets[0].id, 'giv_waw_tithe_demo');
    assert.equal(prof1.givingPolicy.ccHandlesMoney, false);

    // Skarbnik nie może sam zatwierdzić swojego wniosku (dual approval) -> 400
    const selfApprove = await callApi(store, 'POST', '/api/moj-kosciol/v1/churches/ch_kads_warszawa_demo/giving/giv_waw_unverified_demo/verify', {
      token: 'tok_treasurer_waw',
      body: { confirmationSource: 'Próba samozatwierdzenia' }
    });
    assert.equal(selfApprove.status, 400);

    // Druga uprawniona osoba (owner) zatwierdza -> pojawia się publicznie + wpis w audycie!
    const dualOk = await callApi(store, 'POST', '/api/moj-kosciol/v1/churches/ch_kads_warszawa_demo/giving/giv_waw_unverified_demo/verify', {
      token: 'tok_owner_waw',
      body: { confirmationSource: 'Uchwała rady zboru (DEMO)' }
    });
    assert.equal(dualOk.status, 200);
    const prof2 = await (await callApi(store, 'GET', '/api/moj-kosciol/v1/churches/warszawa-centrum-demo')).json();
    assert.equal(prof2.givingTargets.length, 2);

    // Zmiana IBAN przez skarbnika -> NATYCHMIAST ukrywa rachunek z widoku publicznego!
    await callApi(store, 'POST', '/api/moj-kosciol/v1/churches/ch_kads_warszawa_demo/giving', {
      token: 'tok_treasurer_waw',
      body: {
        id: 'giv_waw_unverified_demo',
        category: 'local_church',
        beneficiary: 'Zmieniony rachunek',
        iban: 'PL61109010140000071219812874',
        transferTitle: 'Dar zborowy'
      }
    });
    const prof3 = await (await callApi(store, 'GET', '/api/moj-kosciol/v1/churches/warszawa-centrum-demo')).json();
    assert.equal(prof3.givingTargets.length, 1);
    assert.ok(store.state.auditLogs.some((l) => l.action === 'giving_iban_changed_hidden_pending_reverify'));
  });
});

describe('5. Ogłoszenia, wydarzenia (.ics, odwołane, prywatne RSVP), notatki i modlitwa (bez AI)', () => {
  it('wygasłe ogłoszenia są ukryte; prywatne notatki nie wyciekają; odwołane wydarzenie ma STATUS:CANCELLED i blokuje RSVP; prośba modlitewna ma aiAllowed=false', async () => {
    const store = createMojKosciolStore();

    // Wygasłe ogłoszenie nie pojawia się publicznie
    const anns = await (await callApi(store, 'GET', '/api/moj-kosciol/v1/churches/ch_kads_warszawa_demo/announcements')).json();
    assert.ok(!anns.announcements.some((a) => a.id === 'ann_waw_expired'));

    // Odwołane wydarzenie: .ics zawiera STATUS:CANCELLED i Europe/Warsaw; RSVP zablokowane 409
    const icsRes = await callApi(store, 'GET', '/api/moj-kosciol/v1/events/evt_waw_cancelled_demo.ics');
    assert.equal(icsRes.status, 200);
    const icsText = await icsRes.text();
    assert.ok(icsText.includes('X-WR-TIMEZONE:Europe/Warsaw'));
    assert.ok(icsText.includes('STATUS:CANCELLED'));

    const rsvpCancelled = await callApi(store, 'POST', '/api/moj-kosciol/v1/events/evt_waw_cancelled_demo/rsvp', {
      token: 'tok_outsider',
      body: { response: 'yes' }
    });
    assert.equal(rsvpCancelled.status, 409);

    // Publiczne wydarzenia NIGDY nie ujawniają listy uczestników RSVP
    await callApi(store, 'POST', '/api/moj-kosciol/v1/events/evt_waw_prayer_01/rsvp', {
      token: 'tok_outsider',
      body: { response: 'yes', guestsCount: 2 }
    });
    const evs = await (await callApi(store, 'GET', '/api/moj-kosciol/v1/churches/ch_kads_warszawa_demo/events')).json();
    assert.equal(evs.events[0].rsvpSummary.publicAttendeeListExposed, false);
    assert.equal(evs.events[0].attendees, undefined);

    // Prywatne notatki wymagają logowania i są izolowane
    const noAuthNote = await callApi(store, 'GET', '/api/moj-kosciol/v1/me/notes');
    assert.equal(noAuthNote.status, 401);
    await callApi(store, 'POST', '/api/moj-kosciol/v1/me/notes', {
      token: 'tok_outsider',
      body: { serviceId: 'srv_waw_2026_11_28_demo', itemId: 'item_waw_14', text: 'Moja prywatna notatka' }
    });
    const otherUserNotes = await (await callApi(store, 'GET', '/api/moj-kosciol/v1/me/notes', { token: 'tok_owner_waw' })).json();
    assert.equal(otherUserNotes.notes.length, 0);

    // Prośba modlitewna domyślnie prywatna + twarde aiAllowed: false + możliwość wycofania
    const prayRes = await (await callApi(store, 'POST', '/api/moj-kosciol/v1/churches/ch_kads_warszawa_demo/prayers', {
      token: 'tok_outsider',
      body: { body: 'Proszę o modlitwę o pokój w rodzinie.' }
    })).json();
    assert.equal(prayRes.prayerRequest.visibility, 'private_team');
    assert.equal(prayRes.prayerRequest.aiAllowed, false);

    // Usuwanie wszystkich danych użytkownika (RODO)
    const delRes = await callApi(store, 'DELETE', '/api/moj-kosciol/v1/me/data', { token: 'tok_outsider' });
    assert.equal(delRes.status, 200);
    const afterDel = await (await callApi(store, 'GET', '/api/moj-kosciol/v1/me/notes', { token: 'tok_outsider' })).json();
    assert.equal(afterDel.notes.length, 0);
  });
});

describe('6. Szkoła Sobotnia PL/EN — granice dat/kwartału/roku, blokada importu bez licencji, awaria API', () => {
  it('przełączanie PL/EN zachowuje externalId; obsługuje granicę tygodnia, kwartału i roku; nie generuje fikcyjnych danych', () => {
    const provider = new LessonProvider();

    // Sobota 2026-11-28: omawiana lekcja 9 (2026-Q4-L09) w PL i EN
    const plSat = provider.getCurrentLesson({ date: '2026-11-28T10:00:00Z', language: 'pl', timeZone: 'Europe/Warsaw' });
    const enSat = provider.getCurrentLesson({ date: '2026-11-28T10:00:00Z', language: 'en', timeZone: 'Europe/Warsaw' });
    assert.equal(plSat.ok, true);
    assert.equal(plSat.lesson.externalId, '2026-Q4-L09');
    assert.equal(enSat.lesson.externalId, plSat.lesson.externalId);
    assert.equal(enSat.locale, 'en');

    // Granica tygodnia (niedziela 2026-11-29 -> przygotowanie lekcji 10)
    const nextWeek = provider.getCurrentLesson({ date: '2026-11-29T10:00:00Z', language: 'pl', timeZone: 'Europe/Warsaw' });
    assert.equal(nextWeek.lesson.externalId, '2026-Q4-L10');

    // Granica kwartału i roku (sobota 2026-12-26 -> omówienie Q4-L13, przygotowanie 2027-Q1-L01)
    const yearBoundary = provider.getCurrentLesson({ date: '2026-12-26T10:00:00Z', language: 'pl', timeZone: 'Europe/Warsaw' });
    assert.equal(yearBoundary.discussionLesson.externalId, '2026-Q4-L13');
    assert.equal(yearBoundary.preparationLesson.externalId, '2027-Q1-L01');

    // Brak danych w źródle (np. rok 2031) -> NIE wyświetla błędnej/fikcyjnej lekcji!
    const outOfRange = provider.getCurrentLesson({ date: '2031-05-01', language: 'pl' });
    assert.equal(outOfRange.ok, false);
    assert.equal(outOfRange.error, 'no_lesson_for_date');
    assert.ok(Array.isArray(outOfRange.officialSources) && outOfRange.officialSources.length > 0);

    // Blokada importu pełnych lekcji bez pisemnej zgody wydawcy (Etap A)
    const blocked = provider.getPermittedContent('2026-Q4-L09', 'pl', { requestFullImport: true });
    assert.equal(blocked.ok, false);
    assert.equal(blocked.blocked, true);
    assert.equal(blocked.code, 'LICENSE_FULL_IMPORT_BLOCKED');

    // Awaria API -> degradacja do oficjalnych linków, zero fikcyjnych danych
    const outageProvider = new LessonProvider({ simulateOutage: true });
    const outageRes = outageProvider.getCurrentLesson({ date: '2026-11-28', language: 'en' });
    assert.equal(outageRes.ok, false);
    assert.equal(outageRes.error, 'provider_unavailable');
    assert.ok(outageRes.officialSources.some((s) => s.url.includes('absg.sspmadventist.org')));
  });
});

describe('7. Wtyczki CC Connect (cc.my-church & cc.sabbath-school) i narzędzia MCP bez modelu AI', () => {
  it('obie wtyczki są niezależnie zarejestrowane; cc.sabbath-school działa bez cc.my-church i bez AI; śpiewnik respektuje licencję', async () => {
    const churchPlugin = getPluginManifest('cc.my-church');
    const ssPlugin = getPluginManifest('cc.sabbath-school');
    assert.ok(churchPlugin && churchPlugin.availability === 'ready');
    assert.ok(ssPlugin && ssPlugin.availability === 'ready');
    assert.deepEqual(ssPlugin.dependencies, []); // Niezależna od cc.my-church!

    // Wywołanie cc_sabbath_school_get_current z aktywną WYŁĄCZNIE wtyczką cc.sabbath-school
    const ssReq = new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CC-Active-Plugins': 'cc.sabbath-school' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 10, method: 'tools/call',
        params: { name: 'cc_sabbath_school_get_current', arguments: { lang: 'en', date: '2026-11-28' } }
      })
    });
    const ssJson = await (await handleMcpRequest(ssReq, {}, {})).json();
    const ssPayload = JSON.parse(ssJson.result.content[0].text);
    assert.equal(ssPayload.ok, true);
    assert.equal(ssPayload.worksWithoutChurch, true);
    assert.equal(ssPayload.worksWithoutAiModel, true);
    assert.equal(ssPayload.lesson.externalId, '2026-Q4-L09');

    // Wywołanie cc_church_get_live_state & cc_church_get_hymn_metadata z cc.my-church
    const liveReq = new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CC-Active-Plugins': 'cc.my-church' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 11, method: 'tools/call',
        params: { name: 'cc_church_get_live_state', arguments: { churchId: 'ch_kads_warszawa_demo' } }
      })
    });
    const liveJson = await (await handleMcpRequest(liveReq, {}, {})).json();
    const livePayload = JSON.parse(liveJson.result.content[0].text);
    assert.equal(livePayload.ok, true);
    assert.ok(livePayload.currentItem);

    // Test bramki licencyjnej śpiewnika w MCP (Nr 1 PD vs Nr 8 bez zgody wydawcy)
    const hymnReq = new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CC-Active-Plugins': 'cc.my-church' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 12, method: 'tools/call',
        params: { name: 'cc_church_get_hymn_metadata', arguments: { number: 8 } }
      })
    });
    const hymnJson = await (await handleMcpRequest(hymnReq, {}, {})).json();
    const hymnPayload = JSON.parse(hymnJson.result.content[0].text);
    assert.equal(hymnPayload.ok, true);
    assert.equal(hymnPayload.hymns[0].lyricsIncluded, false);
    assert.equal(hymnPayload.hymns[0].stanzas, null);
    assert.equal(hymnPayload.hymns[0].officialUrl, 'https://muzycy.adwent.pl/');
  });

  it('strona /test/sba/moj-kosciol/ posiada noindex, zakładki mobilne i tryb skupienia', () => {
    const html = fs.readFileSync(path.join(ROOT, 'test', 'sba', 'moj-kosciol', 'index.html'), 'utf8');
    assert.ok(html.includes('noindex, nofollow'));
    assert.ok(html.includes('data-tab="szkola-sobotnia"'));
    assert.ok(html.includes('id="inviteFriendBtn"'));
    assert.ok(html.includes('id="focusModeBtn"'));
  });
});
