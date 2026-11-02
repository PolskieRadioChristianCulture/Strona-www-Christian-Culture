#!/usr/bin/env node
// Nocna autopublikacja Kursu Codziennego „Z Biblią za Pan Brat” (@007, 2026-11-02).
// Uruchamiana po 00:00 czasu polskiego w OSOBNEJ, czystej kopii roboczej repo (git worktree), nigdy w folderze, w którym pracują agenci.
// Kroki = umiejętność kc-z-biblia-lekcja, punkty E–G: paczka → testy → commit → push → wdrożenie z czystego drzewa →
// sprawdzenie produkcji (HTTP + przeglądarka) → lumina-repo → lustro → meldunek w Skrzynce. „Zrobione” tylko po sprawdzeniu produkcji.
//
// Użycie (w kopii roboczej):
//   node scripts/kurs-codzienny/autopublikacja.mjs                 # próba generalna: wszystko lokalnie, bez push/wdrożenia/meldunku
//   node scripts/kurs-codzienny/autopublikacja.mjs --produkcja     # pełna publikacja (wymaga zgody L0 na włączenie automatu)
//   … --data 2026-11-03                                            # inny dzień (domyślnie dzisiejsza data polska)
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { dataPolska, slugDnia } from './lib.mjs';
import { publikujDzien, KOLEJKA, SPIS, SCIEZKI_LEKCJI } from './publikuj-dzien.mjs';

const ROOT = process.cwd();
const arg = (k) => { const i = process.argv.indexOf(k); return i === -1 ? undefined : process.argv[i + 1]; };
const PRODUKCJA = process.argv.includes('--produkcja');
// Tylko w próbie generalnej: inna gałąź bazowa i udawany czas (np. przed włączeniem automatu). Produkcja = zawsze origin/main i zegar.
const BAZA = (!PRODUKCJA && arg('--baza')) || 'origin/main';
const TERAZ = (!PRODUKCJA && arg('--symuluj-czas')) ? new Date(arg('--symuluj-czas')) : new Date();
const DATA = arg('--data') || dataPolska(TERAZ);
const DOMENA = 'https://polskieradio.cc';
const PROJEKT = 'polskieradio';
const JOMA = 'C:/Users/czark/Desktop/@ICC/Misja CC/JOMA_SHARED_MEMORY';
const SKRZYNKA = `${JOMA}/SKRZYNKA/narzedzia/skrzynka.mjs`;
const LUSTRO = 'C:/Users/czark/Desktop/@ICC/LUMINA';
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const BLOKADA = path.join(os.tmpdir(), 'cc-kc-autopublikacja.lock');

const dzien = Math.round((Date.parse(`${DATA}T00:00:00Z`) - Date.parse('2026-10-01T00:00:00Z')) / 86400000) + 1;
const katalogRaportu = `${JOMA}/SKRZYNKA/raporty/KC-DZIEN-${dzien}`;
let kopiaAutomatu = false; // true dopiero po sprawdzeniu, że to osobna, czysta kopia bez gałęzi
const log = [];
const zapiszLog = (s) => {
  const linia = `${new Date().toISOString()} ${s}`;
  log.push(linia);
  console.log(linia);
};

function git(...a) { return execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', windowsHide: true }).trim(); }
function uruchom(nazwa, cmd, a, { limit = 20 * 60_000 } = {}) {
  zapiszLog(`▶ ${nazwa}`);
  const r = spawnSync(cmd, a, { cwd: ROOT, encoding: 'utf8', windowsHide: true, timeout: limit, shell: process.platform === 'win32' && /\.cmd$/.test(cmd), maxBuffer: 64 * 1024 * 1024 });
  const ogon = `${r.stdout || ''}\n${r.stderr || ''}`.trim().split('\n').slice(-8).join('\n');
  if (r.status !== 0) throw new Error(`${nazwa}: kod ${r.status ?? r.error?.code}\n${ogon}`);
  zapiszLog(`✔ ${nazwa}`);
  return r.stdout || '';
}
const czekaj = (ms) => new Promise((r) => setTimeout(r, ms));

async function pobierz(url) {
  const r = await fetch(`${url}${url.includes('?') ? '&' : '?'}kc_auto=${Date.now()}`, { redirect: 'follow', headers: { 'cache-control': 'no-cache' } });
  return { status: r.status, tekst: await r.text() };
}

/** Niezależny odczyt produkcji: lekcja N i spis kursu. Do 8 prób co 20 s (propagacja CDN). */
async function sprawdzProdukcje(n) {
  const lekcja = `${DOMENA}/akademia/kurscodzienny/${slugDnia(n)}`;
  const spis = `${DOMENA}/akademia/kurscodzienny`;
  let ostatni = '';
  for (let proba = 1; proba <= 8; proba++) {
    const [l, s, p] = await Promise.all([pobierz(lekcja), pobierz(spis), pobierz(`${DOMENA}/akademia/kurscodzienny/${slugDnia(n - 1)}`)]);
    const ok = {
      lekcja: l.status === 200 && l.tekst.includes(`<title>Dzień ${n}:`),
      spis: s.status === 200 && s.tekst.includes(`CZYTAJ DZIEŃ ${n} (`) && s.tekst.includes(`/kurscodzienny/${slugDnia(n)}"`),
      poprzedni: p.status === 200 && p.tekst.includes(`/kurscodzienny/${slugDnia(n)}"`),
    };
    ostatni = `lekcja HTTP ${l.status} ${ok.lekcja ? 'OK' : 'BRAK'}, spis HTTP ${s.status} ${ok.spis ? 'OK' : 'BRAK'}, Dzień ${n - 1}→${n} ${ok.poprzedni ? 'OK' : 'BRAK'}`;
    if (ok.lekcja && ok.spis && ok.poprzedni) return { ok: true, opis: ostatni, url: lekcja };
    zapiszLog(`… produkcja jeszcze nieaktualna (próba ${proba}/8): ${ostatni}`);
    await czekaj(20_000);
  }
  return { ok: false, opis: ostatni, url: lekcja };
}

/** Sprawdzenie w przeglądarce (Playwright): konsola, lektor, krój, rozmiar, quiz 20, zrzuty 390/1280. */
async function sprawdzPrzegladarka(url) {
  let chromium;
  try { ({ chromium } = await import('playwright')); } catch { return { ok: null, opis: 'NIESPRAWDZONE: brak Playwright' }; }
  const przegladarka = await chromium.launch();
  try {
    const wyniki = [];
    for (const szer of [390, 1280]) {
      const strona = await przegladarka.newPage({ viewport: { width: szer, height: 900 } });
      const bledy = [];
      strona.on('pageerror', (e) => bledy.push(e.message));
      strona.on('console', (m) => { if (m.type() === 'error') bledy.push(m.text()); });
      await strona.goto(`${url}?kc_auto=${Date.now()}`, { waitUntil: 'networkidle', timeout: 60_000 });
      const stan = await strona.evaluate(() => ({
        lektor: typeof toggleAudioLesson, kroj: typeof toggleReaderFont, rozmiar: typeof adjustFontSize,
        // eslint-disable-next-line no-undef
        quiz: typeof QUIZ_DATA !== 'undefined' ? QUIZ_DATA.length : -1,
        grafika: (() => { const i = document.querySelector('img[src*="images/academy/daily/kc_day_"]'); return i ? { w: i.naturalWidth, h: i.naturalHeight } : null; })(),
      }));
      fs.mkdirSync(katalogRaportu, { recursive: true });
      await strona.screenshot({ path: `${katalogRaportu}/produkcja-${szer}.png`, fullPage: false });
      wyniki.push({ szer, bledy, ...stan });
      await strona.close();
    }
    const ok = wyniki.every((w) => w.lektor === 'function' && w.kroj === 'function' && w.rozmiar === 'function' && w.quiz === 20 && w.grafika?.w > 0);
    // Błędy konsoli raportujemy, ale nie blokują: część pochodzi z usług zewnętrznych (np. reklamy, GA).
    const opis = wyniki.map((w) => `${w.szer}px: lektor ${w.lektor}, quiz ${w.quiz}, grafika ${w.grafika ? `${w.grafika.w}×${w.grafika.h}` : 'BRAK'}, błędy konsoli ${w.bledy.length}${w.bledy.length ? ` (${w.bledy.slice(0, 2).join(' | ').slice(0, 200)})` : ''}`).join('; ');
    return { ok, opis };
  } finally {
    await przegladarka.close();
  }
}

function skrzynka({ temat, tresc, alarm }) {
  if (!PRODUKCJA) { zapiszLog(`(próba) meldunek pominięty: ${temat}`); return; }
  const plik = path.join(os.tmpdir(), `kc-auto-${Date.now()}.md`);
  fs.writeFileSync(plik, tresc);
  const a = [SKRZYNKA, 'wyslij', '--od', 'claude', '--do', 'antigravity, codex', '--temat', temat, '--plik', plik, '--typ', 'raport'];
  if (alarm) a.push('--wymaga-dowodcy');
  try { execFileSync('node', a, { encoding: 'utf8', windowsHide: true }); } catch (e) { zapiszLog(`! meldunek nie wysłany: ${e.message}`); }
  fs.rmSync(plik, { force: true });
}

function lustro(pliki) {
  if (!fs.existsSync(LUSTRO)) return 0;
  for (const p of pliki) {
    fs.mkdirSync(path.dirname(path.join(LUSTRO, p)), { recursive: true });
    fs.copyFileSync(path.join(ROOT, p), path.join(LUSTRO, p));
  }
  return pliki.length;
}

async function glowna() {
  zapiszLog(`Autopublikacja KC — Dzień ${dzien} (${DATA}), tryb: ${PRODUKCJA ? 'PRODUKCJA' : 'próba generalna'}, kopia: ${ROOT}`);
  if (DATA > dataPolska(TERAZ)) throw new Error(`PRZED CZASEM: ${DATA} jeszcze nie nastał w Polsce`);

  // 1. Czysta kopia robocza na najnowszym origin/main.
  if (git('rev-parse', '--abbrev-ref', 'HEAD') !== 'HEAD') throw new Error('automat działa tylko w osobnej kopii roboczej bez gałęzi (git worktree add --detach) — nie w folderze, w którym pracują agenci');
  if (git('status', '--porcelain', '--untracked-files=no')) throw new Error('kopia robocza ma niezatwierdzone zmiany — automat działa tylko na czystej kopii');
  kopiaAutomatu = true;
  git('clean', '-fdq'); // resztki nieudanego przebiegu (pliki ignorowane, np. node_modules, zostają)
  git('fetch', 'origin', '--quiet');
  git('checkout', '--quiet', '--detach', BAZA);
  zapiszLog(`${BAZA} = ${git('rev-parse', '--short', 'HEAD')}`);

  // 2. Paczka dnia albo dzień już opublikowany ręcznie.
  const paczka = `${KOLEJKA}/${DATA}`;
  let wynik;
  if (!fs.existsSync(path.join(ROOT, paczka, 'meta.json'))) {
    const wSpisie = SPIS.every((p) => fs.readFileSync(path.join(ROOT, p), 'utf8').includes(`<!-- KARTA DZIEŃ ${dzien} -->`));
    if (!(fs.existsSync(path.join(ROOT, SCIEZKI_LEKCJI(dzien)[0])) && wSpisie)) throw new Error(`brak zatwierdzonej paczki ${paczka} i Dzień ${dzien} nie jest opublikowany`);
    wynik = { status: 'juz-opublikowane', pliki: [], ostrzezenia: ['Dzień opublikowany bez paczki (ręcznie)'] };
  } else {
    wynik = await publikujDzien({ root: ROOT, data: DATA, zapisz: true, teraz: TERAZ });
  }
  zapiszLog(`generator: ${wynik.status}, plików ${wynik.pliki.length}${wynik.ostrzezenia.length ? `, ostrzeżenia: ${wynik.ostrzezenia.join(' | ')}` : ''}`);

  let commit = git('rev-parse', 'HEAD');
  if (wynik.status === 'opublikowano') {
    // 3. Trzy obowiązkowe testy (CLAUDE.md) — przed commitem.
    uruchom('test:cc-regression', NPM, ['run', 'test:cc-regression']);
    uruchom('test:guardian', NPM, ['run', 'test:guardian']);
    uruchom('test:mobile-premium', NPM, ['run', 'test:mobile-premium']);
    const lekcja = fs.readFileSync(path.join(ROOT, SCIEZKI_LEKCJI(dzien)[0]), 'utf8');
    const tytul = (/<title>(Dzień \d+: [^|<]+)/.exec(lekcja) || [])[1]?.trim() || `Dzień ${dzien}`;
    git('add', '--', ...wynik.pliki);
    execFileSync('git', ['commit', '--quiet', '-m', `feat(kc): autopublikacja ${tytul}\n\nPaczka ${paczka} (zatwierdzona), generator scripts/kurs-codzienny/publikuj-dzien.mjs, automat @007.`], { cwd: ROOT, windowsHide: true });
    commit = git('rev-parse', 'HEAD');
    zapiszLog(`commit ${commit.slice(0, 8)}`);
    if (git('status', '--porcelain', '--untracked-files=no')) throw new Error('po commicie zostały niezatwierdzone zmiany');
  }

  if (!PRODUKCJA) {
    zapiszLog(`próba generalna: bez push i wdrożenia — kopia wraca na ${BAZA}`);
    git('checkout', '--quiet', '--detach', BAZA);
    return { ok: true, opis: `próba: ${wynik.status}` };
  }

  if (wynik.status === 'opublikowano') {
    // 4. Push na origin (odrzuci, jeśli ktoś w międzyczasie zmienił main — wtedy alarm, bez nadpisywania).
    uruchom('git push origin', 'git', ['push', 'origin', 'HEAD:main'], { limit: 5 * 60_000 });

    // 5. Produkcja musi być przodkiem naszego commita — inaczej cofnęlibyśmy cudze wdrożenie.
    const lista = JSON.parse(uruchom('lista wdrożeń', NPX, ['--no-install', 'wrangler', 'pages', 'deployment', 'list', '--project-name', PROJEKT, '--environment', 'production', '--json'], { limit: 3 * 60_000 }).replace(/^[^[]*/, ''));
    const zrodlo = lista[0]?.Source;
    if (!zrodlo) throw new Error('nie odczytano commita produkcji');
    try { git('merge-base', '--is-ancestor', zrodlo, commit); } catch {
      throw new Error(`produkcja (${zrodlo}) nie jest przodkiem ${commit.slice(0, 8)} — ktoś wdrożył spoza main; wdrożenie wstrzymane`);
    }

    // 6. Wydanie z czystego drzewa i wdrożenie.
    uruchom('build-pages-release', 'node', ['scripts/build-pages-release.mjs'], { limit: 10 * 60_000 });
    uruchom('wrangler pages deploy', NPX, ['--no-install', 'wrangler', 'pages', 'deploy', '.pages-release', '--project-name', PROJEKT, '--branch', 'main', '--commit-hash', commit, '--commit-dirty=false'], { limit: 20 * 60_000 });
  }

  // 7. Sprawdzenie produkcji — dopiero to jest dowód.
  const http = await sprawdzProdukcje(dzien);
  zapiszLog(`produkcja HTTP: ${http.opis}`);
  if (!http.ok) throw new Error(`produkcja nie pokazuje Dnia ${dzien}: ${http.opis}`);
  const przegl = await sprawdzPrzegladarka(http.url);
  zapiszLog(`produkcja przeglądarka: ${przegl.opis}`);
  if (przegl.ok === false) throw new Error(`lekcja na produkcji nie przeszła kontroli w przeglądarce: ${przegl.opis}`);

  if (wynik.status === 'opublikowano') {
    uruchom('git push lumina-repo', 'git', ['push', 'lumina-repo', 'HEAD:main'], { limit: 5 * 60_000 });
    zapiszLog(`lustro: skopiowano ${lustro(wynik.pliki)} plików`);
  }
  return { ok: true, commit, wynik, http, przegl };
}

// ── Start ──
if (fs.existsSync(BLOKADA) && Date.now() - fs.statSync(BLOKADA).mtimeMs < 2 * 3600_000) {
  console.error(`Inny przebieg autopublikacji trwa (${BLOKADA}) — kończę.`);
  process.exit(0);
}
fs.writeFileSync(BLOKADA, `${process.pid} ${new Date().toISOString()}`);
try {
  const w = await glowna();
  if (PRODUKCJA) {
    const tresc = [
      `KONIEC | agent: claude (@007, automat) | zadanie: autopublikacja KC Dzień ${dzien} (${DATA}) | wynik: ${w.wynik.status === 'opublikowano' ? 'zrobione — sprawdzone na produkcji' : 'dzień był już opublikowany — produkcja sprawdzona'}`,
      '', `- commit: ${w.commit.slice(0, 8)}`, `- produkcja HTTP: ${w.http.opis}`, `- przeglądarka: ${w.przegl.opis}`,
      `- ostrzeżenia: ${w.wynik.ostrzezenia.join(' | ') || 'brak'}`,
      '- NIE obejmuje: CCN (build:ccn-news), Firestore (aplikacja, LUMINA, cclite), WhatsApp, Facebook — według procedury JOMA robią je agenci.',
      `- log i zrzuty: SKRZYNKA/raporty/KC-DZIEN-${dzien}/`,
    ].join('\n');
    skrzynka({ temat: `KONIEC: autopublikacja KC Dzień ${dzien} (${DATA})`, tresc });
  }
} catch (e) {
  zapiszLog(`✖ BŁĄD: ${e.message}`);
  // Tylko w potwierdzonej kopii automatu: porzucamy niedokończone zmiany i nowe pliki, żeby następny przebieg zaczął od czystej bazy.
  if (kopiaAutomatu) {
    try { git('checkout', '--quiet', '--force', '--detach', BAZA); git('clean', '-fdq'); } catch {}
  }
  skrzynka({
    temat: `ALARM: autopublikacja KC Dzień ${dzien} (${DATA}) nie powiodła się`,
    tresc: `BLOKADA | agent: claude (@007, automat) | zadanie: autopublikacja KC Dzień ${dzien} | wynik: NIE OPUBLIKOWANO (albo niesprawdzone)\n\nPowód: ${e.message}\n\nNastępny krok: agent dyżurny publikuje ręcznie według umiejętności kc-z-biblia-lekcja albo naprawia paczkę. Log: SKRZYNKA/raporty/KC-DZIEN-${dzien}/autopublikacja.log`,
    alarm: true,
  });
  process.exitCode = 1;
} finally {
  try { fs.mkdirSync(katalogRaportu, { recursive: true }); fs.appendFileSync(`${katalogRaportu}/autopublikacja.log`, log.join('\n') + '\n'); } catch {}
  fs.rmSync(BLOKADA, { force: true });
}
