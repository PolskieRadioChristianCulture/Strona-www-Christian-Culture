#!/usr/bin/env node
// Publikacja dnia Kursu Codziennego z zatwierdzonej paczki w kolejka-publikacji/kurs-codzienny/RRRR-MM-DD/ (@007, 2026-11-02).
// Robi to, co umiejętność kc-z-biblia-lekcja opisuje jako kroki C–D: lekcja w 4 ścieżkach, grafika, Dzień N−1 (pasek i „Jutro”),
// 8 plików spisu (karta, hero, licznik), wyszukiwarka (2 pliki), mapa strony, baza rozważań.
// Bez commita, wdrożenia i zapisu Firestore — to robi autopublikacja.mjs albo człowiek.
//
// Użycie:
//   node scripts/kurs-codzienny/publikuj-dzien.mjs --data 2026-11-03            # próba — nic nie zapisuje
//   node scripts/kurs-codzienny/publikuj-dzien.mjs --data 2026-11-03 --zapisz   # zapis plików
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { CHECKS } from '../check-kc-lesson-standard.mjs'; // 21 elementów wzoru Dnia 1 (umiejętność kc-z-biblia-lekcja)
import { jutro } from '../align-kc-lessons-day1.mjs';
import {
  dataPolska, dataDnia, slugDnia, daneLekcji, dodajKarte, zaktualizujHero, zaktualizujLicznik, sprawdzSpis,
  linkNastepny, podmienJutro, pytaniaQuizu, pozostalosci, zaktualizujWyszukiwarke, dodajDoMapy, dopiszRozwazanie,
} from './lib.mjs';
import { sprawdzLekcje } from './straznik-lekcji.mjs';

export const KOLEJKA = 'kolejka-publikacji/kurs-codzienny';
export const SPIS = [
  'akademia.html', 'akademia/index.html', 'akademia/kurscodzienny.html', 'akademia/kurscodzienny/index.html',
  'kursy.html', 'kursy/index.html', 'kursy/kurscodzienny.html', 'kursy/kurscodzienny/index.html',
];
export const SCIEZKI_LEKCJI = (n) => [
  `akademia/kurscodzienny/${slugDnia(n)}.html`, `akademia/kurscodzienny/${slugDnia(n)}/index.html`,
  `kursy/kurscodzienny/${slugDnia(n)}.html`, `kursy/kurscodzienny/${slugDnia(n)}/index.html`,
];
const WYSZUKIWARKA = ['szukaj/catalog.json', 'data/cc-search-index.json'];
const MAPA = 'sitemaps/akademia.xml';
const ROZWAZANIA = 'rozwazania_baza.json';
const OBRAZY = 'images/academy/daily';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const md5 = (b) => crypto.createHash('md5').update(b).digest('hex');

// Pliki w repo mają CRLF (autocrlf) i czasem BOM — przetwarzamy LF, zapisujemy w stylu oryginału.
function czytaj(root, p) {
  const surowy = fs.readFileSync(path.join(root, p), 'utf8');
  const bom = surowy.startsWith('﻿');
  const bez = bom ? surowy.slice(1) : surowy;
  return { tekst: bez.replace(/\r\n/g, '\n'), styl: { bom, crlf: bez.includes('\r\n') } };
}
function wTymStylu(tekst, styl = { bom: false, crlf: false }) {
  return (styl.bom ? '﻿' : '') + (styl.crlf ? tekst.replace(/\r?\n/g, '\r\n') : tekst);
}

/**
 * @returns {{ status: 'proba'|'opublikowano'|'juz-opublikowane', dzien: number, data: string, pliki: string[], ostrzezenia: string[] }}
 */
export async function publikujDzien({ root = process.cwd(), data, zapisz = false, teraz = new Date() }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data || '')) throw new Error('podaj --data RRRR-MM-DD');
  const katalog = `${KOLEJKA}/${data}`;
  const abs = (p) => path.join(root, p);
  if (!fs.existsSync(abs(`${katalog}/meta.json`))) throw new Error(`brak paczki ${katalog}/meta.json`);
  const meta = JSON.parse(fs.readFileSync(abs(`${katalog}/meta.json`), 'utf8'));
  const ostrzezenia = [];

  // ── 1. Bramki: data, numer dnia, zatwierdzenie ──
  if (meta.data !== data) throw new Error(`meta.data ${meta.data} ≠ ${data}`);
  const n = Number(meta.dzien);
  if (!Number.isInteger(n) || n < 2 || dataDnia(n) !== data) throw new Error(`meta.dzien ${meta.dzien} nie odpowiada dacie ${data} (Dzień 1 = 2026-10-01)`);
  const dzis = dataPolska(teraz);
  if (data > dzis) throw new Error(`PRZED CZASEM: Dzień ${n} ma datę ${data}, a w Polsce jest ${dzis} — publikacja dopiero po 00:00`);
  if (!meta.zatwierdzil || !meta.zatwierdzono) throw new Error('paczka niezatwierdzona: brak „zatwierdzil” lub „zatwierdzono” w meta.json');

  // ── 2. Lekcja z paczki ──
  const lekcja = czytaj(root, `${katalog}/lekcja.html`).tekst;
  const d = daneLekcji(lekcja, n);
  d.tytul = meta.karta?.tytul || d.tytul;
  d.opisKarty = meta.karta?.opis || d.opis;
  if (!d.opisKarty) throw new Error('brak opisu karty (meta description lekcji albo meta.karta.opis)');
  const pytan = pytaniaQuizu(lekcja);
  if (pytan !== 20) throw new Error(`quiz ma ${pytan} pytań zamiast 20`);
  if (/kc_day_?\d+/.test(lekcja) && [...lekcja.matchAll(/kc_day_?(\d+)_/g)].some((m) => Number(m[1]) !== n)) {
    throw new Error(`lekcja zawiera klucze/grafiki innego dnia (kc_dayX_ ≠ ${n}) — pozostałość po kopiowaniu`);
  }
  const resztki = pozostalosci(lekcja, n);
  if (resztki.length && meta.pozostalosciSprawdzone !== true) {
    throw new Error(`lekcja ma odwołania do Dnia ${n - 1} poza paskiem nawigacji (wiersze ${resztki.slice(0, 12).join(', ')}) — pozostałość po kopiowaniu; jeśli są świadome, ustaw meta.pozostalosciSprawdzone = true`);
  }
  const niespojne = sprawdzLekcje(lekcja, n); // bez wyjątku w meta — strażnik @007 po incydencie Dnia 34
  if (niespojne.length) throw new Error(`STRAŻNIK LEKCJI: Dzień ${n} niespójny — ${niespojne.join('; ')}`);
  if (resztki.length) ostrzezenia.push(`odwołania do Dnia ${n - 1} zatwierdzone ręcznie (wiersze ${resztki.join(', ')})`);

  // ── 3. Grafika: nowa, unikalna, istniejąca ──
  const plikiObrazow = fs.existsSync(abs(`${katalog}/obrazy`)) ? fs.readdirSync(abs(`${katalog}/obrazy`)) : [];
  const obrazy = new Map(plikiObrazow.map((f) => [`${OBRAZY}/${f}`, fs.readFileSync(abs(`${katalog}/obrazy/${f}`))]));
  const obrazLekcji = d.obraz.split('?')[0].replace(/^\//, '');
  if (!obrazy.has(obrazLekcji) && !fs.existsSync(abs(obrazLekcji))) throw new Error(`grafika lekcji ${obrazLekcji} nie istnieje (ani w paczce, ani w repo)`);
  const istniejace = new Map();
  for (const f of fs.readdirSync(abs(OBRAZY))) {
    const p = `${OBRAZY}/${f}`;
    if (!obrazy.has(p) && /\.(jpe?g|png|webp)$/i.test(f)) istniejace.set(md5(fs.readFileSync(abs(p))), p);
  }
  for (const [p, bufor] of obrazy) {
    if (istniejace.has(md5(bufor))) throw new Error(`grafika ${p} jest bajtową kopią ${istniejace.get(md5(bufor))} — każdy dzień ma własną`);
    if (fs.existsSync(abs(p)) && md5(fs.readFileSync(abs(p))) !== md5(bufor)) throw new Error(`${p} istnieje z inną treścią — zmieniony obraz dostaje nową nazwę`);
  }

  // ── 4. Czy już opublikowane? ──
  const sciezki = SCIEZKI_LEKCJI(n);
  if (fs.existsSync(abs(sciezki[0]))) {
    const obecna = czytaj(root, sciezki[0]).tekst;
    const wSpisie = SPIS.every((p) => czytaj(root, p).tekst.includes(`<!-- KARTA DZIEŃ ${n} -->`));
    if (obecna === lekcja && wSpisie) return { status: 'juz-opublikowane', dzien: n, data, pliki: [], ostrzezenia };
    throw new Error(`Dzień ${n} jest już w repo, ale ${obecna === lekcja ? 'nie we wszystkich 8 plikach spisu' : 'z inną treścią niż paczka'} — sprawdź ręcznie, kto go publikował`);
  }

  // ── 5. Nowa treść plików (najpierw w pamięci) ──
  const nowe = new Map(); // ścieżka → { tekst | bufor, styl }
  for (const p of sciezki) nowe.set(p, { tekst: lekcja, styl: czytaj(root, `akademia/kurscodzienny/${slugDnia(n - 1)}.html`).styl });
  for (const [p, bufor] of obrazy) nowe.set(p, { bufor });

  // Dzień N−1: „Dzień N →” w pasku + nowa sekcja „Jutro” z linkiem (generator z align-kc-lessons-day1.mjs).
  const poprzednie = SCIEZKI_LEKCJI(n - 1).map((p) => ({ p, ...czytaj(root, p) }));
  if (poprzednie.some((x) => x.tekst !== poprzednie[0].tekst)) throw new Error(`4 kopie Dnia ${n - 1} różnią się — popraw je przed publikacją`);
  let pop = linkNastepny(poprzednie[0].tekst, n).html;
  pop = przebudujJutro(root, pop, n, lekcja);
  for (const x of poprzednie) nowe.set(x.p, { tekst: pop, styl: x.styl });

  // 8 plików spisu.
  for (const p of SPIS) {
    const { tekst, styl } = czytaj(root, p);
    let h = dodajKarte(tekst, n, data, d).html;
    const hero = zaktualizujHero(h, n, data); h = hero.html;
    const licz = zaktualizujLicznik(h, n, data); h = licz.html;
    if (hero.zmian < 2) throw new Error(`${p}: nie znaleziono przycisków hero (${hero.zmian}/2)`);
    if (licz.zmian < 1) throw new Error(`${p}: nie znaleziono licznika dni`);
    const bledy = sprawdzSpis(h, n);
    if (bledy.length) throw new Error(`${p}: ${bledy.join('; ')}`);
    nowe.set(p, { tekst: h, styl });
  }

  const teraziso = teraz.toISOString();
  for (const p of WYSZUKIWARKA) {
    const { tekst, styl } = czytaj(root, p);
    nowe.set(p, { tekst: zaktualizujWyszukiwarke(tekst, { n, iso: data, d, szukaj: meta.szukaj, teraz: teraziso }), styl });
  }
  { const { tekst, styl } = czytaj(root, MAPA); nowe.set(MAPA, { tekst: dodajDoMapy(tekst, n, data).xml, styl }); }

  if (fs.existsSync(abs(`${katalog}/rozwazanie.json`))) {
    const wpis = JSON.parse(fs.readFileSync(abs(`${katalog}/rozwazanie.json`), 'utf8'));
    if (!wpis.tvScript) ostrzezenia.push('rozwazanie.json bez „tvScript” — czat prowadzących Noemi i Sara nie wystartuje (procedura pkt 4)');
    const { tekst, styl } = czytaj(root, ROZWAZANIA);
    nowe.set(ROZWAZANIA, { tekst: dopiszRozwazanie(tekst, wpis, data), styl });
  } else {
    ostrzezenia.push('paczka bez rozwazanie.json — baza rozważań i kanały TV bez nowego wpisu');
  }

  // ── 6. Standard 21/21 dla N i N−1 na treści po zmianach ──
  const cwd = process.cwd();
  try {
    process.chdir(root); // test „sasiedzi” sprawdza istnienie pliku następnego dnia względem katalogu roboczego
    for (const [dzien, tekst] of [[n, lekcja], [n - 1, pop]]) {
      const brak = CHECKS.filter(([, , t]) => !t(tekst, dzien)).map(([k]) => k);
      if (brak.length) throw new Error(`Dzień ${dzien}: standard ${CHECKS.length - brak.length}/${CHECKS.length}, brak: ${brak.join(', ')}`);
    }
  } finally { process.chdir(cwd); }

  const pliki = [...nowe.keys()];
  if (!zapisz) return { status: 'proba', dzien: n, data, pliki, ostrzezenia };

  // ── 7. Zapis ──
  for (const [p, v] of nowe) {
    fs.mkdirSync(path.dirname(abs(p)), { recursive: true });
    fs.writeFileSync(abs(p), v.bufor ?? wTymStylu(v.tekst, v.styl));
  }
  const raport = {
    data, dzien: n, opublikowano: teraziso, zatwierdzil: meta.zatwierdzil, zatwierdzono: meta.zatwierdzono, ostrzezenia,
    pliki: pliki.map((p) => ({ plik: p, sha256: sha(fs.readFileSync(abs(p))) })),
  };
  fs.writeFileSync(abs(`${katalog}/OPUBLIKOWANO.json`), JSON.stringify(raport, null, 2) + '\n');
  return { status: 'opublikowano', dzien: n, data, pliki: [...pliki, `${katalog}/OPUBLIKOWANO.json`], ostrzezenia };
}

// Sekcja „Jutro” Dnia N−1 z generatora align-kc-lessons-day1.mjs. Generator czyta lekcję Dnia N z dysku,
// więc w trybie próby kładziemy ją tam na chwilę i zawsze sprzątamy.
function przebudujJutro(root, html, n, lekcja) {
  const plik = path.join(root, `akademia/kurscodzienny/${slugDnia(n)}.html`);
  const cwd = process.cwd();
  const tymczasowy = !fs.existsSync(plik);
  try {
    if (tymczasowy) fs.writeFileSync(plik, lekcja);
    process.chdir(root);
    const sekcja = jutro(n - 1);
    if (!sekcja.includes(`/kurscodzienny/${slugDnia(n)}"`)) throw new Error(`„Jutro” Dnia ${n - 1} nie dostało linku do Dnia ${n}`);
    return podmienJutro(html, sekcja);
  } finally {
    process.chdir(cwd);
    if (tymczasowy && fs.existsSync(plik)) fs.unlinkSync(plik);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i === -1 ? undefined : process.argv[i + 1]; };
  const data = arg('--data') || dataPolska();
  try {
    const w = await publikujDzien({ data, zapisz: process.argv.includes('--zapisz') });
    console.log(JSON.stringify(w, null, 2));
  } catch (e) {
    console.error(`ODMOWA: ${e.message}`);
    process.exitCode = 1;
  }
}
