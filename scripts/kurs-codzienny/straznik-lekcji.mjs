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
  const werset = html.match(/(?:Werset do zapamiętania|<blockquote\b[\s\S]{0,450}?<\/blockquote>)[\s\S]{0,600}?—\s*(?:Księga\s+)?[A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż ]+\s+(\d+):(\d+)/i);
  if (werset && !wCzytaniu(werset[1])) bledy.push(`podpis wersetu do zapamiętania: rozdział ${werset[1]} poza czytaniem dnia (${zakres})`);
  const wersetTekst = html.match(/Werset do zapamiętania[\s\S]{0,700}?(?:<blockquote[^>]*>|<p class="font-serif[^>]*text-zinc-100[^>]*>|<p class="font-serif[^>]*italic[^>]*text-white[^>]*>)([\s\S]*?)<\/(?:blockquote|p)>/)?.[1]
    || html.match(/<blockquote class="font-serif[^>]*>([\s\S]*?)<\/blockquote>/)?.[1] || '';
  if (n >= 39 && werset && wCzytaniu(werset[1]) && ksiega === 'Wj') {
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    const bibleFile = path.join(repoRoot, `data/bible/ubg-2025/EXO-${String(+werset[1]).padStart(3, '0')}.json`);
    if (fs.existsSync(bibleFile)) {
      const chData = JSON.parse(fs.readFileSync(bibleFile, 'utf8'));
      const targetVerse = (chData.verses || []).find((v) => v.number === +werset[2]);
      if (targetVerse) {
        const norm = (t) => (t || '').replace(/<[^>]+>/g, ' ').replace(/[„”"'«».,:;!?–—]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
        const probe = norm(targetVerse.text).slice(0, 32);
        if (probe && !norm(wersetTekst).includes(probe)) {
          bledy.push(`wyświetlany werset do zapamiętania nie odpowiada UBG-2025 (${ksiega} ${werset[1]}:${werset[2]})`);
        }
        const ttsFn = html.match(/function toggleAudioLesson\(\)[\s\S]{0,1200}/)?.[0] || '';
        const ttsSpeech = ttsFn.match(/new SpeechSynthesisUtterance\(([\s\S]{0,600}?)\)/)?.[1] || '';
        if (ttsSpeech && !norm(ttsSpeech).includes(probe)) {
          bledy.push(`lektor TTS wersetu nie odpowiada ${ksiega} ${werset[1]}:${werset[2]}`);
        }
      }
    }
  }
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

  { // osnowę teologiczną rozdziału
    const osn = html.match(/osnowę teologiczną ([^.<]+?) rozdziału/);
    if (osn) {
      for (const m of osn[1].matchAll(/(\d+)\./g)) {
        if (!wCzytaniu(m[1])) bledy.push(`opis Stronga: rozdział ${m[1]} poza czytaniem dnia (${zakres})`);
      }
    }
  }
  if (/<meta\b[^>]*>\s*>+\s*\/>/.test(html)) {
    bledy.push('uszkodzony znacznik <meta> zostawia widoczne „> />” na górze strony');
  }
  if (/<a\s+<a\b/i.test(html)) {
    bledy.push('uszkodzony podwójny znacznik „<a <a”');
  }
  if (/patronite\.pl\/radiocc\b/i.test(html)) {
    bledy.push('link Patronite wskazuje nieistniejący /radiocc zamiast /osobowoscplus');
  }
  if (/id=["']ccTopSubLink["'][^>]*patronite\.pl|patronite\.pl[^>]*id=["']ccTopSubLink["']/i.test(html)) {
    bledy.push('przycisk Patronite przejął id="ccTopSubLink" (blokuje dzwonek powiadomień)');
  }
  if (/\.ak-header\s+#ccTopSubLink\s+span(?![\w:-]*\bnot\b)[,{\s]/.test(html)) {
    bledy.push('CSS .ak-header #ccTopSubLink span ukrywa ikonę w przycisku wsparcia');
  }
  for (const m of html.matchAll(/\bcompleteDay(\d+)\s*\(/g)) {
    if (+m[1] !== n) {
      bledy.push(`wywołanie/definicja completeDay${m[1]} zamiast completeDay${n}`);
      break;
    }
  }
  for (const m of html.matchAll(/Dzień (\d+) ukończony/g)) {
    if (+m[1] !== n) {
      bledy.push(`komunikat „Dzień ${m[1]} ukończony” zamiast ${n}`);
      break;
    }
  }
  for (const m of html.matchAll(/(?:api\.whatsapp\.com|wa\.me|twitter\.com|x\.com)[^"']*?Dzie%C5%84%20(\d+)%3A/gi)) {
    if (+m[1] !== n) {
      bledy.push(`tekst udostępniania prowadzi do „Dzień ${m[1]}” zamiast ${n}`);
      break;
    }
  }
  for (const m of html.matchAll(new RegExp(`<a[^>]+href="/mojabiblia\\?book=[A-Z0-9]+&(?:amp;)?chapter=(\\d+)"[^>]*>(?:\\s*<[^>]+>)*\\s*Czytaj\\s+${k}\\s+(\\d+)`, 'gi'))) {
    if (!wCzytaniu(m[1]) || !wCzytaniu(m[2])) {
      bledy.push(`link „Czytaj ${ksiega} ${m[2]}” (chapter=${m[1]}) poza czytaniem dnia (${zakres})`);
      break;
    }
  }
  const krok1 = html.match(/Krok 1:[\s\S]{0,260}?Księgi [A-ZĄĆĘŁŃÓŚŹŻ]+ (\d+):/i);
  if (krok1 && !wCzytaniu(krok1[1])) {
    bledy.push(`zadanie Krok 1 wskazuje rozdział ${krok1[1]} poza czytaniem dnia (${zakres})`);
  }
  const ttsBlock = html.match(/function toggleAudioLesson\(\)[\s\S]{0,1200}/)?.[0];
  if (ttsBlock) {
    for (const m of ttsBlock.matchAll(/Księga [^"']*?(\d+):\d+/g)) {
      if (!wCzytaniu(m[1])) {
        bledy.push(`lektor TTS czyta rozdział ${m[1]} poza czytaniem dnia (${zakres})`);
        break;
      }
    }
  }

  const resztki = pozostalosci(html, n);
  if (resztki.length) bledy.push(`odwołania do Dnia ${n - 1} poza paskiem nawigacji (wiersze ${resztki.slice(0, 12).join(', ')})`);
  return bledy;
}

function normalizujBlok(fragment) {
  return (fragment || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\b(wj|rdz|kpł|lb|pwt)\s*\d+\b/gi, '$1 #')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function wspolneZdania(a, b) {
  if (!a || !b || a.length < 180 || b.length < 180) return 0;
  const zdania = (s) => s.split(/(?<=[.?!])\s+/).map((x) => x.trim()).filter((x) => x.length >= 35);
  const za = zdania(a);
  const zb = new Set(zdania(b));
  if (za.length < 3 || !zb.size) return 0;
  let trafienia = 0;
  for (const z of za) if (zb.has(z)) trafienia++;
  return trafienia / za.length;
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
  const tresci = new Map();
  for (const { plik, n } of pliki) {
    if (!tresci.has(n)) {
      tresci.set(n, fs.readFileSync(path.join(root, plik), 'utf8'));
    }
  }
  return pliki
    .filter(({ n }) => n >= 2)
    .map(({ plik, n }) => {
      const html = fs.readFileSync(path.join(root, plik), 'utf8');
      const bledy = sprawdzLekcje(html, n);
      const quizCurr = normalizujBlok(html.match(/const QUIZ_DATA\s*=\s*\[[\s\S]*?\];/)?.[0]);
      const egzCurr = normalizujBlok(html.match(/EGZEGEZA & FORMACJA TEOLOGICZNA[\s\S]{0,12000}/)?.[0]);
      const jezusCurr = normalizujBlok(html.match(/Jezus w centrum[\s\S]{0,4000}/)?.[0]);
      for (let prev = Math.max(1, n - 5); prev < n; prev++) {
        const prevHtml = tresci.get(prev);
        if (!prevHtml) continue;
        const quizPrev = normalizujBlok(prevHtml.match(/const QUIZ_DATA\s*=\s*\[[\s\S]*?\];/)?.[0]);
        if (quizCurr && quizPrev && quizCurr === quizPrev) {
          bledy.push(`quiz jest identyczną kopią z Dnia ${prev}`);
          break;
        }
        const egzPrev = normalizujBlok(prevHtml.match(/EGZEGEZA & FORMACJA TEOLOGICZNA[\s\S]{0,12000}/)?.[0]);
        if (wspolneZdania(egzCurr, egzPrev) >= 0.55) {
          bledy.push(`egzegeza zawiera skopiowaną treść z Dnia ${prev}`);
          break;
        }
        const jezusPrev = normalizujBlok(prevHtml.match(/Jezus w centrum[\s\S]{0,4000}/)?.[0]);
        if (wspolneZdania(jezusCurr, jezusPrev) >= 0.55) {
          bledy.push(`sekcja „Jezus w centrum” jest skopiowana z Dnia ${prev}`);
          break;
        }
      }
      return { plik, bledy };
    })
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
