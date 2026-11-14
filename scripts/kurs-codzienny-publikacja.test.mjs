// Autopublikacja Kursu Codziennego — testy na kopii prawdziwych plików repo (8 plików spisu, Dzień 33, wyszukiwarka, mapa, rozważania).
// Paczka Dnia 34 powstaje z prawdziwej lekcji Dnia 33 (podmiana numeru dnia i grafiki), tak jak robią to agenci.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { publikujDzien, SPIS, SCIEZKI_LEKCJI, KOLEJKA } from './kurs-codzienny/publikuj-dzien.mjs';
import { sprawdzSpis, karty, dataDnia, dataPolska } from './kurs-codzienny/lib.mjs';
import { isPublicFile } from './cc-release-files.mjs';

const REPO = process.cwd();
const OSTATNI = (() => { // ostatni opublikowany dzień w repo (dziś 33; test działa też po kolejnych publikacjach)
  const html = fs.readFileSync(path.join(REPO, 'akademia/kurscodzienny.html'), 'utf8');
  return Math.max(...karty(html).map((k) => k.numer));
})();
const N = OSTATNI + 1;
const DATA = dataDnia(N);
const PO_POLNOCY = new Date(`${DATA}T00:05:00+01:00`);
const pad = (n) => String(n).padStart(2, '0');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

function kopiaRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kc-autopub-'));
  const pliki = [...SPIS, ...SCIEZKI_LEKCJI(OSTATNI), 'szukaj/catalog.json', 'data/cc-search-index.json', 'sitemaps/akademia.xml', 'rozwazania_baza.json'];
  for (const p of pliki) { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.copyFileSync(path.join(REPO, p), path.join(root, p)); }
  const lekcjaOst = fs.readFileSync(path.join(REPO, SCIEZKI_LEKCJI(OSTATNI)[0]), 'utf8');
  const obrazOst = /og:image" content="https:\/\/polskieradio\.cc\/([^"?]+)/.exec(lekcjaOst)[1];
  fs.mkdirSync(path.join(root, 'images/academy/daily'), { recursive: true });
  fs.copyFileSync(path.join(REPO, obrazOst), path.join(root, obrazOst));
  return { root, lekcjaOst, obrazOst };
}

/** Paczka Dnia N zbudowana z lekcji ostatniego dnia (jak przy pracy ręcznej). */
function paczka(root, lekcjaOst, obrazOst, { meta = {}, obraz, lekcja } = {}) {
  const dir = path.join(root, KOLEJKA, DATA);
  fs.mkdirSync(path.join(dir, 'obrazy'), { recursive: true });
  const nowyObraz = `kc_day_${N}_test_autopublikacji.jpg`;
  // Wszystkie postaci numeru dnia: „Dzień X”, dzien-XX, kc_dayX, kc_day_X i „Dzień X” zakodowany w linkach udostępniania.
  const zmienDzien = (s, z, na) => s
    .replace(new RegExp(`dzien-${pad(z)}(?!\\d)`, 'g'), `dzien-${pad(na)}`)
    .replace(new RegExp(`(Dzień |kc_day_?|completeDay|Dzie%C5%84%20)${z}(?!\\d)`, 'g'), `$1${na}`);
  const html = lekcja ?? zmienDzien(zmienDzien(lekcjaOst.split(path.posix.basename(obrazOst)).join(nowyObraz), OSTATNI, N), OSTATNI - 1, OSTATNI)
    .replace(/<section[^>]*id="jutro"[\s\S]*?<\/section>/, (s) => s.replace(/JUTRO — [^<]+/, 'JUTRO — TEST'));
  fs.writeFileSync(path.join(dir, 'lekcja.html'), html);
  fs.writeFileSync(path.join(dir, 'obrazy', nowyObraz), obraz ?? crypto.randomBytes(2048));
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ data: DATA, dzien: N, zatwierdzil: '@test', zatwierdzono: '2026-11-02T20:00:00+01:00', ...meta }));
  fs.writeFileSync(path.join(dir, 'rozwazanie.json'), JSON.stringify({ id: `ref_day${N}_${DATA}`, day: N, date: DATA, title: `Dzień ${N}`, tvScript: 'NOEMI: test\nSARA: test' }));
  return dir;
}

const migawka = (root) => {
  const m = new Map();
  const idz = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) idz(p); else m.set(path.relative(root, p), sha(fs.readFileSync(p))); } };
  idz(root);
  return m;
};

test('kolejka publikacji nigdy nie trafia na stronę', () => {
  assert.equal(isPublicFile(`kolejka-publikacji/kurs-codzienny/${DATA}/lekcja.html`), false);
  assert.equal(isPublicFile(`kolejka-publikacji/kurs-codzienny/${DATA}/obrazy/x.jpg`), false);
});

test('przed północą: odmowa publikacji', async () => {
  const { root, lekcjaOst, obrazOst } = kopiaRepo();
  paczka(root, lekcjaOst, obrazOst);
  const minutaPrzed = new Date(Date.parse(`${DATA}T00:00:00+01:00`) - 60_000); // 23:59 dnia poprzedniego w Polsce (CET)
  assert.equal(dataPolska(minutaPrzed), dataDnia(N - 1));
  await assert.rejects(publikujDzien({ root, data: DATA, teraz: minutaPrzed }), /PRZED CZASEM/);
});

test('bez zatwierdzenia, z obcą grafiką, z luką albo złym quizem: odmowa', async () => {
  let r = kopiaRepo(); paczka(r.root, r.lekcjaOst, r.obrazOst, { meta: { zatwierdzil: '' } });
  await assert.rejects(publikujDzien({ root: r.root, data: DATA, teraz: PO_POLNOCY }), /niezatwierdzona/);

  r = kopiaRepo(); paczka(r.root, r.lekcjaOst, r.obrazOst, { obraz: fs.readFileSync(path.join(REPO, r.obrazOst)) });
  await assert.rejects(publikujDzien({ root: r.root, data: DATA, teraz: PO_POLNOCY }), /bajtową kopią/);

  r = kopiaRepo();
  const plikLekcji = path.join(paczka(r.root, r.lekcjaOst, r.obrazOst), 'lekcja.html');
  fs.writeFileSync(plikLekcji, fs.readFileSync(plikLekcji, 'utf8').replace(/const QUIZ_DATA = \[\s*\{/, 'const QUIZ_DATA = [{"q":"x","a":["a"],"c":0}, {'));
  await assert.rejects(publikujDzien({ root: r.root, data: DATA, teraz: PO_POLNOCY }), /quiz ma 21 pytań/);

  // Pozostałość po kopiowaniu (02.11.2026: przygotowany Dzień 34 miał „Oznacz Dzień 33 jako ukończony” i linki do dzien-33).
  r = kopiaRepo();
  const plikResztki = path.join(paczka(r.root, r.lekcjaOst, r.obrazOst), 'lekcja.html');
  fs.writeFileSync(plikResztki, fs.readFileSync(plikResztki, 'utf8').replace(`Oznacz Dzień ${N} jako ukończony`, `Oznacz Dzień ${OSTATNI} jako ukończony`));
  await assert.rejects(publikujDzien({ root: r.root, data: DATA, teraz: PO_POLNOCY }), /pozostałość po kopiowaniu/);

  r = kopiaRepo(); paczka(r.root, r.lekcjaOst, r.obrazOst);
  const pozniej = path.join(r.root, KOLEJKA, dataDnia(N + 1));
  fs.cpSync(path.join(r.root, KOLEJKA, DATA), pozniej, { recursive: true });
  fs.writeFileSync(path.join(pozniej, 'meta.json'), JSON.stringify({ data: dataDnia(N + 1), dzien: N + 1, zatwierdzil: '@test', zatwierdzono: 'x' }));
  await assert.rejects(publikujDzien({ root: r.root, data: dataDnia(N + 1), teraz: new Date(`${dataDnia(N + 1)}T12:00:00Z`) }), /Dzień \d+:|luka/);
});

test('próba nic nie zapisuje', async () => {
  const { root, lekcjaOst, obrazOst } = kopiaRepo();
  paczka(root, lekcjaOst, obrazOst);
  const przed = migawka(root);
  const w = await publikujDzien({ root, data: DATA, teraz: PO_POLNOCY });
  assert.equal(w.status, 'proba');
  assert.deepEqual(migawka(root), przed);
});

test(`publikacja Dnia ${N}: lekcja ×4, Dzień ${OSTATNI}, 8 plików spisu, wyszukiwarka, mapa, rozważania; drugi przebieg nic nie zmienia`, async () => {
  const { root, lekcjaOst, obrazOst } = kopiaRepo();
  paczka(root, lekcjaOst, obrazOst);
  const w = await publikujDzien({ root, data: DATA, zapisz: true, teraz: PO_POLNOCY });
  assert.equal(w.status, 'opublikowano');
  assert.deepEqual(w.ostrzezenia, []);
  const czytaj = (p) => fs.readFileSync(path.join(root, p), 'utf8');

  const kopie = SCIEZKI_LEKCJI(N).map((p) => czytaj(p).replace(/\r\n/g, '\n'));
  assert.ok(kopie.every((k) => k === kopie[0]), '4 kopie lekcji identyczne');
  for (const p of SCIEZKI_LEKCJI(OSTATNI)) {
    const h = czytaj(p);
    assert.match(h, new RegExp(`>Dzień ${N} →(</a>|</span>)`), `${p}: link w pasku`);
    assert.match(h, new RegExp(`id="jutro"[\\s\\S]*?/kurscodzienny/dzien-${pad(N)}"[\\s\\S]*?Przejdź do Dnia ${N}`), `${p}: „Jutro” z linkiem`);
    assert.equal((h.match(/id="jutro"/g) || []).length, 1, `${p}: jedna sekcja „Jutro”`);
  }
  for (const p of SPIS) {
    const h = czytaj(p);
    assert.deepEqual(sprawdzSpis(h, N), [], p);
    const k = karty(h);
    assert.equal(k.length, N, `${p}: karty 1..${N}`);
    assert.match(k[N - 2].blok, /DOSTĘPNA TERAZ/, `${p}: Dzień ${OSTATNI} „DOSTĘPNA TERAZ”`);
    assert.match(h, /\r\n/, `${p}: zachowane końce linii CRLF`);
  }
  for (const p of ['szukaj/catalog.json', 'data/cc-search-index.json']) {
    const j = JSON.parse(czytaj(p));
    const lekcje = j.items.filter((x) => /\/akademia\/kurscodzienny\/dzien-\d+$/.test(x.url || ''));
    assert.deepEqual(lekcje.filter((x) => x.featured || /na dziś\)/.test(x.title)).map((x) => x.url), [`https://polskieradio.cc/akademia/kurscodzienny/dzien-${pad(N)}`], `${p}: tylko Dzień ${N} „na dziś”`);
    assert.equal(j.totalItems, j.items.length);
  }
  assert.equal((czytaj('sitemaps/akademia.xml').match(new RegExp(`kurscodzienny/dzien-${pad(N)}<`, 'g')) || []).length, 1);
  assert.equal(JSON.parse(czytaj('rozwazania_baza.json'))[0].day, N, 'rozważanie na pozycji 0');
  assert.ok(fs.existsSync(path.join(root, KOLEJKA, DATA, 'OPUBLIKOWANO.json')));

  const po = migawka(root);
  const drugi = await publikujDzien({ root, data: DATA, zapisz: true, teraz: PO_POLNOCY });
  assert.equal(drugi.status, 'juz-opublikowane');
  assert.deepEqual(migawka(root), po);
});
