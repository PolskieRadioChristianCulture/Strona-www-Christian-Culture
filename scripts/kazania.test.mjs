import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isPublicFile } from './cc-release-files.mjs';
import {
  parseGoogleDriveLink,
  handleKazaniaApi,
  KAZANIA_CATEGORIES,
} from '../services/kazania/kazania-service.js';
import {
  extractVerbatimUbgVerses,
  pickNextPericope,
  validateSermonCompliance,
  buildDeterministicOutline,
} from './kazania/daily-sermon-automation.mjs';

const ROOT = process.cwd();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

function createMockDb() {
  const rows = [];
  return {
    rows,
    prepare(sql) {
      const s = sql.trim();
      let params = [];
      const stmt = {
        bind(...args) {
          params = args;
          return stmt;
        },
        async run() {
          if (s.startsWith('CREATE TABLE') || s.startsWith('CREATE INDEX')) return { success: true };
          if (s.startsWith('INSERT INTO cc_kazania_submissions')) {
            const [
              id, title, ref, cat, series, desc, format,
              drive_url, drive_provider, drive_file_id, drive_preview_url, drive_download_url,
              outline_text, apply_text, author_uid, author_name, status, created_at, updated_at,
            ] = params;
            rows.push({
              id, title, ref, cat, series, desc, format,
              drive_url, drive_provider, drive_file_id, drive_preview_url, drive_download_url,
              outline_text, apply_text, author_uid, author_name, status, created_at, updated_at,
            });
            return { success: true };
          }
          if (s.startsWith('UPDATE cc_kazania_submissions SET status = ?')) {
            const [nextStatus, updatedAt, id] = params;
            const r = rows.find((x) => x.id === id);
            if (r) { r.status = nextStatus; r.updated_at = updatedAt; }
            return { success: true };
          }
          if (s.startsWith('DELETE FROM cc_kazania_submissions')) {
            const [id] = params;
            const idx = rows.findIndex((x) => x.id === id);
            if (idx !== -1) rows.splice(idx, 1);
            return { success: true };
          }
          return { success: true };
        },
        async first() {
          if (s.includes('SELECT COUNT(*) AS cnt FROM cc_kazania_submissions')) {
            const [uid, cutoff] = params;
            const cnt = rows.filter((r) => r.author_uid === uid && r.created_at >= cutoff).length;
            return { cnt };
          }
          if (s.includes('SELECT id, author_uid FROM cc_kazania_submissions')) {
            return rows.find((r) => r.id === params[0]) || null;
          }
          if (s.includes('SELECT id FROM cc_kazania_submissions')) {
            return rows.find((r) => r.id === params[0]) || null;
          }
          return null;
        },
        async all() {
          let filtered = [];
          if (s.includes("status IN ('published', 'pending')")) {
            filtered = rows.filter((r) => r.status === 'published' || r.status === 'pending');
          } else if (s.includes('author_uid = ?')) {
            const [uid] = params;
            filtered = rows.filter((r) => r.status === 'published' || (r.author_uid === uid && r.status === 'pending'));
          } else {
            filtered = rows.filter((r) => r.status === 'published');
          }
          filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
          return { results: filtered };
        },
      };
      return stmt;
    },
  };
}

test('wszystkie pliki /kazania/ oraz backend services/kazania/ trafiają do wydania', () => {
  for (const rel of [
    'kazania/index.html',
    'kazania/kazania.css',
    'kazania/kazania.js',
    'kazania/data/kazania.json',
    'kazania/img/kazania-og-1200x630.jpg',
    'services/kazania/kazania-service.js',
  ]) {
    assert.ok(fs.existsSync(path.join(ROOT, rel)), `Brak pliku: ${rel}`);
    assert.equal(isPublicFile(rel), true, `Plik odrzucony przez isPublicFile: ${rel}`);
  }
  const worker = read('_worker.js');
  assert.ok(worker.includes("url.pathname.startsWith('/api/kazania/')"));
  assert.ok(worker.includes('handleKazaniaApi'));
});

test('kazania/img/kazania-og-1200x630.jpg jest poprawnym i lekkim JPEG', () => {
  const buf = fs.readFileSync(path.join(ROOT, 'kazania/img/kazania-og-1200x630.jpg'));
  assert.equal(buf[0], 0xff);
  assert.equal(buf[1], 0xd8);
  assert.ok(buf.length > 5000 && buf.length < 200 * 1024, `Nieoczekiwany rozmiar OG JPEG: ${buf.length} B`);
});

test('kazania/index.html spełnia standard FULL PREMIUM EkoCC, SEO i ma formularz Dysku Google', () => {
  const html = read('kazania/index.html');
  assert.match(html, /<meta\s+name="robots"\s+content="index,\s*follow">/i);
  assert.doesNotMatch(html, /noindex/i);
  assert.match(html, /<link\s+rel="canonical"\s+href="https:\/\/polskieradio\.cc\/kazania\/">/i);
  assert.match(html, /property="og:image"[^>]*kazania-og-1200x630\.jpg/);
  assert.ok(html.includes('G-Y4EFTVBPE3'));
  assert.ok(html.includes('class="header-right'));
  assert.ok(html.includes('data-cc-wspieramto'));
  assert.ok(html.includes('data-cc-search'));
  assert.ok(html.includes('id="tickRun"'));
  assert.ok(html.includes('id="promoStage"'));
  assert.ok(html.includes('id="heroFx"'));
  assert.ok(html.includes('id="submitModal"'));
  assert.ok(html.includes('id="openSubmitBtn"'));
  assert.ok(html.includes('/app-christian-culture.png'));
  assert.doesNotMatch(html, /app-christian-culture\.webp/i);
  assert.doesNotMatch(html, /Mission Control/i);
  assert.doesNotMatch(html, /font-awesome|fontawesome/i);
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  assert.doesNotMatch(visible, /\bLIVE\b|NA ŻYWO/i);
});

test('kazania.css zachowuje kolor #FF7A00, .hero.is-ready i animacje przy reduced-motion', () => {
  const css = read('kazania/kazania.css');
  assert.ok(css.includes('#FF7A00'));
  assert.ok(css.includes('.hero.is-ready'));
  const rmMatch = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(rmMatch);
  assert.doesNotMatch(rmMatch[1], /animation\s*:\s*none/i);
});

test('parseGoogleDriveLink akceptuje poprawne linki Drive/Docs i odrzuca obce/niebezpieczne URL-e', () => {
  const f1 = parseGoogleDriveLink('https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view?usp=sharing');
  assert.equal(f1.valid, true);
  assert.equal(f1.provider, 'drive');
  assert.equal(f1.previewUrl, 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/preview');
  assert.equal(f1.downloadUrl, 'https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMnOpQrStUvWxYz');

  const f2 = parseGoogleDriveLink('https://drive.google.com/open?id=1AbCdEfGhIjKlMnOpQrStUvWxYz');
  assert.equal(f2.valid, true);

  const f3 = parseGoogleDriveLink('https://docs.google.com/document/d/1DocIdAbCdEfGhIjKlMnOpQrStUv/edit?usp=sharing');
  assert.equal(f3.valid, true);
  assert.equal(f3.provider, 'gdocs');
  assert.equal(f3.downloadUrl, 'https://docs.google.com/document/d/1DocIdAbCdEfGhIjKlMnOpQrStUv/export?format=pdf');

  for (const bad of [
    '',
    'http://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view',
    'https://evil.example.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view',
    'javascript:alert(1)',
    'https://drive.google.com/file/d/short/view',
  ]) {
    assert.equal(parseGoogleDriveLink(bad).valid, false, bad);
  }
});

test('handleKazaniaApi wymusza logowanie, limit dzienny, moderację i usuwanie własnych materiałów', async () => {
  const db = createMockDb();
  const env = { milion_db: db };
  const TOKENS = {
    user1: { sub: 'uid_user1', email: 'brat@example.com', email_verified: true, name: 'Brat Jan', firebase: { sign_in_provider: 'google.com' } },
    user2: { sub: 'uid_user2', email: 'siostra@example.com', email_verified: true, name: 'Siostra Anna', firebase: { sign_in_provider: 'google.com' } },
    anon: { sub: 'uid_anon', firebase: { sign_in_provider: 'anonymous' } },
    admin: { sub: 'uid_admin', email: 'nazirczarkes@gmail.com', email_verified: true, name: 'Cezary Rogowski', firebase: { sign_in_provider: 'google.com' } },
  };
  const verifyToken = async (t) => TOKENS[t] || null;
  const callApi = (pathname, method = 'GET', token = '', body = null) => {
    const req = new Request(`https://polskieradio.cc${pathname}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return handleKazaniaApi(req, env, { verifyToken });
  };

  // Gość i anonim dostają 401 przy próbie publikacji
  assert.equal((await callApi('/api/kazania/submit', 'POST', '', { title: 'Test' })).status, 401);
  assert.equal((await callApi('/api/kazania/submit', 'POST', 'anon', { title: 'Test' })).status, 401);

  // Zalogowany użytkownik dodaje kazanie MP3 z Dysku Google -> status pending
  const rSubmit = await callApi('/api/kazania/submit', 'POST', 'user1', {
    title: 'Łaska w próbach',
    ref: '2 Kor 12:9',
    cat: KAZANIA_CATEGORIES[1],
    desc: 'Wystarczy ci mojej łaski — moc w słabości się doskonali.',
    format: 'mp3',
    driveUrl: 'https://drive.google.com/file/d/1Mp3TestDriveFileId1234567/view?usp=sharing',
  });
  assert.equal(rSubmit.status, 201);
  const subJson = await rSubmit.json();
  assert.equal(subJson.status, 'pending');

  // Gość nie widzi pending, autor widzi własny pending
  const guestList = await (await callApi('/api/kazania/community')).json();
  assert.equal(guestList.items.length, 0);
  const ownList = await (await callApi('/api/kazania/community', 'GET', 'user1')).json();
  assert.equal(ownList.items.length, 1);
  assert.equal(ownList.items[0].isMine, true);

  // Zwykły user może wysłać max 5 razy/24h (wysyłamy 4 dodatkowe: PDF, Docs, Outline x2, 6. -> 429)
  for (let k = 0; k < 4; k++) {
    const r = await callApi('/api/kazania/submit', 'POST', 'user1', {
      title: `Kazanie dodatkowe ${k + 2}`,
      cat: KAZANIA_CATEGORIES[0],
      desc: 'Wierne Pismu Świętemu rozważanie chrystocentryczne.',
      format: k === 0 ? 'pdf' : k === 1 ? 'doc' : 'outline',
      ...(k === 0
        ? { driveUrl: 'https://drive.google.com/file/d/1PdfFileIdAbCdEfGhIjKlMnOp/view' }
        : k === 1
          ? { driveUrl: 'https://docs.google.com/document/d/1GDocFileIdAbCdEfGhIjKlMn/edit' }
          : { outlineText: '1. Wstęp biblijny oparty na Ewangelii.\n2. Zastosowanie w modlitwie.' }),
    });
    assert.equal(r.status, 201);
  }
  const rLimit = await callApi('/api/kazania/submit', 'POST', 'user1', {
    title: 'Szóste kazanie dzisiaj',
    cat: KAZANIA_CATEGORIES[0],
    desc: 'Opis ponad dziesięć znaków.',
    format: 'outline',
    outlineText: 'Treść konspektu ponad trzydzieści znaków zdecydowanie wystarczy.',
  });
  assert.equal(rLimit.status, 429);

  // Zatwierdzenie przez admina -> widoczne publicznie dla gościa
  const rMod = await callApi('/api/kazania/moderate', 'POST', 'admin', { id: subJson.id, action: 'approve' });
  assert.equal(rMod.status, 200);
  const guestAfter = await (await callApi('/api/kazania/community')).json();
  assert.equal(guestAfter.items.length, 1);

  // Obcy użytkownik dostaje 403 przy próbie usunięcia, autor 200
  assert.equal((await callApi(`/api/kazania/item/${subJson.id}`, 'DELETE', 'user2')).status, 403);
  assert.equal((await callApi(`/api/kazania/item/${subJson.id}`, 'DELETE', 'user1')).status, 200);
});

test('sermon-plan.json (45 perykop) oraz wszystkie kazania w kazania.json mają 100% dosłowne wersety UBG-2025', () => {
  const plan = JSON.parse(read('scripts/kazania/sermon-plan.json')).pericopes;
  assert.equal(plan.length, 45);
  for (const p of plan) {
    assert.ok(KAZANIA_CATEGORIES.includes(p.cat), `Nieznana kategoria w planie: ${p.cat}`);
    const v = extractVerbatimUbgVerses(ROOT, p.chapterId, p.verseStart, p.verseEnd);
    assert.ok(v.verses.length >= 1, `Brak wersetów w ${p.slug}`);
  }

  const nextP = pickNextPericope(plan, []);
  const v0 = extractVerbatimUbgVerses(ROOT, nextP.chapterId, nextP.verseStart, nextP.verseEnd);
  const det = buildDeterministicOutline(nextP, v0, '2026-12-01');
  assert.deepEqual(validateSermonCompliance(det, det.keyVerses), []);

  const catalog = JSON.parse(read('kazania/data/kazania.json'));
  assert.equal(catalog.categories.length, 12);
  assert.ok(catalog.sermons.length >= 5, 'Oczekiwano co najmniej 5 konspektów po uruchomieniu automatu');

  const tim2 = JSON.parse(read('data/bible/ubg-2025/2TI-004.json')).verses.find((v) => v.number === 2);
  assert.equal(catalog.motto.text, tim2.text);

  for (const s of catalog.sermons) {
    const ch = JSON.parse(read(`data/bible/ubg-2025/${s.chapterId}.json`));
    for (const kv of s.keyVerses) {
      const refVerse = ch.verses.find((v) => v.number === kv.v);
      assert.ok(refVerse, `Brak wersetu ${s.chapterId}:${kv.v}`);
      assert.equal(kv.text, refVerse.text, `Niezgodność UBG-2025 w ${s.chapterId}:${kv.v}`);
    }
  }
});

test('trasy _redirects, @w, @m i SEO odkrywają /kazania/', () => {
  const redirects = read('_redirects');
  assert.match(redirects, /^\/kazania\s+\/kazania\/index\.html\s+200$/m);
  assert.match(redirects, /^\/kazania\/\s+\/kazania\/index\.html\s+200$/m);

  for (const f of ['szukaj/catalog.json', 'data/cc-search-index.json']) {
    const data = JSON.parse(read(f));
    assert.ok((data.items || []).some((i) => i.url === 'https://polskieradio.cc/kazania/'), `${f}: brak wpisu /kazania/`);
  }

  const mapRaw = read('data/ecosystem-map.json');
  assert.doesNotMatch(mapRaw, /Mission Control/i);
  const map = JSON.parse(mapRaw);
  assert.ok(map.nodes.some((n) => n.id === 'kazania-z-pasja' && n.url === 'https://polskieradio.cc/kazania/'));

  assert.ok(read('sitemaps/pages.xml').includes('<loc>https://polskieradio.cc/kazania/</loc>'));
  assert.ok(read('llms.txt').includes('https://polskieradio.cc/kazania/'));
});
