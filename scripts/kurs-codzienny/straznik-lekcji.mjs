// Strażnik lekcji Kursu Codziennego (@007, 2026-11-03, zlecenie L0).
// Blokuje stronę dnia N, w której zostały elementy innego dnia (incydent: Dzień 34 opublikowany ręcznie
// z nagłówkiem, Strongiem, zadaniem, przyciskiem i udostępnianiem Dnia 33 — mimo raportu „21/21”).
// Używany przez: publikuj-dzien.mjs (autopublikacja), build-pages-release.mjs (każde wdrożenie)
// i joma_guard_sentinel.cjs (pre-commit). Uruchomienie ręczne: node scripts/kurs-codzienny/straznik-lekcji.mjs [N…]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pad2, slugDnia, pozostalosci } from './lib.mjs';

// Miejsca szablonu, w których rozdział MUSI być rozdziałem czytania dnia (z <title>).
const SLOTY_ROZDZIALU = [
  ['podtytuł pod nagłówkiem', (k) => new RegExp(`</h1>\\s*<p[^>]*>[^<]*\\(${k} (\\d+):`)],
  ['opis obrazu (alt)', (k) => new RegExp(`alt="Dzień \\d+:[^"]*\\(${k} (\\d+):`)],
  ['podpis „Czytanie:”', (k) => new RegExp(`Czytanie: ${k} (\\d+)`)],
  ['nagłówek tekstu Biblii', (k) => new RegExp(`\\(UBG\\) • ${k} (\\d+)`)],
  ['nagłówek Stronga', (k) => new RegExp(`Kody Stronga \\(${k} (\\d+)`)],
  ['opis Stronga', () => /osnowę teologiczną (\d+)\. rozdziału/],
  ['zadanie „Przeczytaj cały fragment”', () => /Przeczytaj cały fragment <a href="\/mojabiblia\?book=[A-Z0-9]+&chapter=(\d+)"/],
  ['zadanie „Po przeczytaniu”', (k) => new RegExp(`Po przeczytaniu ${k} (\\d+)`)],
  ['tytuł quizu', (k) => new RegExp(`Pytań z ${k} (\\d+)`)],
];

/** Zwraca listę błędów (pusta = lekcja spójna). `n` — numer dnia z nazwy pliku. */
export function sprawdzLekcje(html, n) {
  const bledy = [];
  const tytul = html.match(/<title>\s*Dzień (\d+):[^<]*?\((\S+) (\d+):\d+(?:[–-](?:(\d+):)?\d+)?\)/);
  if (!tytul) return [`brak <title> w formacie „Dzień ${n}: … (Księga R:w–w)”`];
  if (+tytul[1] !== n) bledy.push(`<title> ma Dzień ${tytul[1]} zamiast ${n}`);
  const [, , ksiega, od, doR = od] = tytul;
  const zakres = od === doR ? `${ksiega} ${od}` : `${ksiega} ${od}–${doR}`;
  const wCzytaniu = (r) => +r >= +od && +r <= +doR;
  const k = ksiega.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  for (const [nazwa, re] of SLOTY_ROZDZIALU) {
    const m = html.match(re(k));
    if (m && !wCzytaniu(m[1])) bledy.push(`${nazwa}: ${ksiega} ${m[1]} poza czytaniem dnia (${zakres})`);
  }
  // Werset do zapamiętania i link „udostępnij werset” muszą pochodzić z czytania dnia.
  const werset = html.match(/Werset do zapamiętania[\s\S]{0,1500}?— [A-ZĄĆĘŁŃÓŚŹŻ ]+ (\d+):\d+/);
  if (werset && !wCzytaniu(werset[1])) bledy.push(`podpis wersetu do zapamiętania: rozdział ${werset[1]} poza czytaniem dnia (${zakres})`);
  const udost = html.match(/share=dzien-(\d+)&(?:amp;)?v=[^\d"]*(\d+):/);
  if (udost && +udost[1] !== n) bledy.push(`„udostępnij werset” wskazuje dzien-${udost[1]}`);
  if (udost && !wCzytaniu(udost[2])) bledy.push(`„udostępnij werset” ma rozdział ${udost[2]} poza czytaniem dnia (${zakres})`);

  // Numer dnia w miejscach, które zawsze go zawierają.
  const dni = [
    ['plakietka „Dzień N z 2009”', /Dzień (\d+) z 2009/],
    ['okruszki nawigacji', /<span class="text-amber-400 font-semibold">Dzień (\d+)<\/span>/],
    ['opis obrazu (alt)', /alt="Dzień (\d+):/],
    ['przycisk „Oznacz Dzień N”', /Oznacz Dzień (\d+) jako ukończony/],
    ['klucz zapisu (DAY_KEY)', /DAY_KEY = 'kc_day(\d+)'/],
    ['link kanoniczny', /<link rel="canonical" href="[^"]*\/dzien-(\d+)"/],
  ];
  for (const [nazwa, re] of dni) {
    const m = html.match(re);
    if (m && +m[1] !== n) bledy.push(`${nazwa}: Dzień ${+m[1]} zamiast ${n}`);
  }
  for (const m of html.matchAll(/(?:whatsapp\.com|wa\.me|facebook\.com|x\.com|twitter\.com)\/[^"]*?kurscodzienny%2Fdzien-(\d+)/g)) {
    if (+m[1] !== n) { bledy.push(`link udostępniania prowadzi do dzien-${m[1]}`); break; }
  }

  const resztki = pozostalosci(html, n);
  if (resztki.length) bledy.push(`odwołania do Dnia ${n - 1} poza paskiem nawigacji (wiersze ${resztki.slice(0, 12).join(', ')})`);
  return bledy;
}

/** Wszystkie pliki lekcji (4 kopie na dzień) w katalogu repo `root`. */
export function plikiLekcji(root, dni = null) {
  const wynik = [];
  for (const baza of ['akademia/kurscodzienny', 'kursy/kurscodzienny']) {
    const kat = path.join(root, baza);
    if (!fs.existsSync(kat)) continue;
    for (const wpis of fs.readdirSync(kat)) {
      const m = wpis.match(/^dzien-(\d+)(\.html)?$/);
      if (!m || (dni && !dni.includes(+m[1]))) continue;
      const plik = m[2] ? path.join(baza, wpis) : path.join(baza, wpis, 'index.html');
      if (fs.existsSync(path.join(root, plik))) wynik.push({ plik: plik.replace(/\\/g, '/'), n: +m[1] });
    }
  }
  return wynik;
}

/** Sprawdza pliki; zwraca [{plik, bledy}] tylko dla błędnych. Dzień 1 = wzór, bez poprzednika. */
export function sprawdzPliki(root, pliki) {
  return pliki
    .filter(({ n }) => n >= 2)
    .map(({ plik, n }) => ({ plik, bledy: sprawdzLekcje(fs.readFileSync(path.join(root, plik), 'utf8'), n) }))
    .filter((x) => x.bledy.length);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const dni = process.argv.slice(2).map(Number).filter(Boolean);
  const zle = sprawdzPliki(root, plikiLekcji(root, dni.length ? dni : null));
  for (const { plik, bledy } of zle) console.error(`❌ ${plik}\n   - ${bledy.join('\n   - ')}`);
  console.log(zle.length ? `STRAŻNIK LEKCJI: ${zle.length} plików z błędami — publikacja zablokowana` : 'STRAŻNIK LEKCJI: wszystkie lekcje spójne');
  process.exit(zle.length ? 1 : 0);
}

export { pad2, slugDnia };
