#!/usr/bin/env node
// Standard lekcji Kursu Codziennego „Z Biblią za Pan Brat” — wzór: Dzień 1 (akademia/kurscodzienny/dzien-01).
// Decyzja L0 26.10.2026. Procedura: JOMA_SHARED_MEMORY/Z_BIBLIA_ZA_PAN_BRAT_STANDARD_LEKCJI.md
// Użycie: node scripts/check-kc-lesson-standard.mjs [numer dnia ...]   (bez argumentów: wszystkie dni)
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const DIR = 'akademia/kurscodzienny';
const pad = (n) => String(n).padStart(2, '0');

// [klucz, opis, test(html, dzień)] — każdy element występuje w Dniu 1.
export const CHECKS = [
  ['tytul', 'Tytuł „Dzień N: … | Z Biblią za Pan Brat | LUMINA Bible Academy”', (s, d) => new RegExp(`<title>Dzień ${d}: [^<]+\\| Z Biblią za Pan Brat \\| LUMINA Bible Academy</title>`).test(s)],
  ['meta', 'Opis meta i og:image', (s) => /<meta name="description" content="[^"]{60,}"/.test(s) && /<meta property="og:image" content="https:\/\/polskieradio\.cc\/[^"]+"/.test(s)],
  ['canonical', 'Canonical bez .html', (s, d) => s.includes(`<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-${pad(d)}"`)],
  ['naglowek', 'Nagłówek: krój, motyw, lektor, Patronite, logowanie', (s) => ['id="btn-reader-font"', 'id="btn-theme-toggle"', 'id="btn-audio-tts"', 'patronite.pl', 'id="cc-auth-nav-container"'].every((x) => s.includes(x))],
  ['sasiedzi', 'Nawigacja do dnia poprzedniego i następnego', (s, d) => (d === 1 || s.includes(`/kurscodzienny/dzien-${pad(d - 1)}"`)) && (!fs.existsSync(`${DIR}/dzien-${pad(d + 1)}.html`) || s.includes(`/kurscodzienny/dzien-${pad(d + 1)}"`))],
  ['hero', 'Hero: przycisk „Podziel się” i grafika 16:9', (s) => s.includes('id="kcJumpShareBtn"') && /<img[^>]+images\/academy\/daily\/kc_day_/.test(s)],
  ['werset', 'Werset pamięciowy z kopiowaniem', (s) => /navigator\.clipboard\.writeText\('[^']+\(/.test(s)],
  ['wstep', 'Karta „Podróż przez 66 Ksiąg”', (s) => s.includes('Podróż przez 66 Ksiąg')],
  ['czesci', 'Ponumerowane części lekcji (co najmniej 5 kart)', (s) => (s.match(/<(section|article) class="kc-card/g) || []).length >= 5],
  ['chrystus', 'Wyróżniona część „Jezus w centrum”', (s) => /ZBAWICIEL|JEZUS W CENTRUM|Jezus w centrum|CHRYSTUS W CENTRUM/.test(s)],
  ['biblia', 'Porównaj wersety we własnym Piśmie Świętym', (s) => /Porównaj wersety|Sprawdź w Biblii/i.test(s)],
  ['prawda', 'Prawda na dziś (co zmienia się w patrzeniu)', (s) => /zmienia sposób, w jaki patrzę|Prawda na dziś|PRAWDA NA DZIŚ/i.test(s)],
  ['pytania', 'Pytania do serca (Pomyśl)', (s) => /pytania (osobiste )?do serca|pytania osobiste|Pomyśl|POMYŚL/i.test(s)],
  ['quiz', 'Quiz z punktacją', (s) => s.includes('id="quiz-section"') || s.includes('id="quizContainer"')],
  ['decyzja', 'Twoja decyzja', (s) => /Pierwsza Decyzja|Twoja decyzja|TWOJA DECYZJA/i.test(s)],
  ['modlitwa', 'Modlitwa', (s) => /Modlitwa|MODLITWA/.test(s)],
  ['zapis', 'Zastosowanie i Twój Zapis (pola + 3 pola wyboru + zapis)', (s) => ['id="kc-input-learned"', 'id="kc-input-decision"', 'id="chk-read"', 'id="chk-understood"', 'id="chk-apply"', 'id="btn-complete-day"'].every((x) => s.includes(x))],
  ['duchowny', 'Możesz porozmawiać z duchownym', (s) => s.includes('id="kontakt-duchowny"')],
  ['udostepnij', 'Udostępnianie, subskrypcja, konto (cc-daily-course-share.js, bez kodu w środku znacznika)', (s) => /<script src="\/js\/cc-daily-course-share\.js[^"]*" defer><\/script>/.test(s)],
  ['jutro', 'Zapowiedź „Jutro”', (s) => s.includes('id="jutro"')],
  ['dogory', 'Przycisk „Do góry”', (s) => s.includes('id="backToTopBtn"')],
];

// Uruchamiane tylko wprost z wiersza poleceń; import (np. publikuj-dzien.mjs) bierze same CHECKS.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
const days = process.argv.slice(2).map(Number).filter(Boolean);
const all = days.length ? days : fs.readdirSync(DIR).map((f) => /^dzien-(\d+)\.html$/.exec(f)?.[1]).filter(Boolean).map(Number).sort((a, b) => a - b);
let fails = 0;
for (const d of all) {
  const s = fs.readFileSync(`${DIR}/dzien-${pad(d)}.html`, 'utf8');
  const miss = CHECKS.filter(([, , t]) => !t(s, d)).map(([k]) => k);
  if (miss.length) fails++;
  console.log(`Dzień ${pad(d)}: ${CHECKS.length - miss.length}/${CHECKS.length}${miss.length ? '  brak: ' + miss.join(', ') : '  ✔'}`);
}
console.log(`\nZgodnych ze wzorem Dnia 1: ${all.length - fails}/${all.length}`);
process.exitCode = fails ? 1 : 0;
}
