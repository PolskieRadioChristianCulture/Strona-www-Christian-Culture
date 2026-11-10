import fs from 'node:fs';

const file = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/scripts/index-lessons.mjs';
let content = fs.readFileSync(file, 'utf8');

const day42Entry = `  {
    title: "Z Biblią za Pan Brat — Dzień 42 (Lekcja 42 na dziś): Święto Paschy, Krew Baranka i Wykupienie Pierworodnych (Wj 11:1–12:36)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-42",
    description: "Kurs Codzienny Pisma Świętego — Dzień 42 (Lekcja 42 na dziś, 11 listopada 2026). Księga Wyjścia 11:1–12:36: Ustanowienie Paschy, krew baranka bez skazy na odrzwiach w Goszen, sąd o północy nad bogami Egiptu, śmierć pierworodnych i triumfalne wyjście z domu niewoli.",
    tags: [
      "lekcja 42", "lekcja 42 na dziś", "lekcja na dziś", "dzień 42", "dzien 42",
      "rozważanie 42", "rozważanie na dziś", "słowo na dziś", "pascha", "baranek paschalny",
      "krew baranka", "śmierć pierworodnych", "wyjście z egiptu", "goszen", "wj 11", "wj 12",
      "z biblią za pan brat", "kurs codzienny", "akademia biblijna", "11 listopada 2026", "dzisiaj", "dziś"
    ],
    featured: true
  },`;

if (!content.includes('dzien-42')) {
  content = content.replace('featured: true', 'featured: false');
  content = content.replace(/const dailyLessons = \[/, 'const dailyLessons = [\n' + day42Entry);
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ Updated index-lessons.mjs with Day 42');
} else {
  console.log('ℹ️ Day 42 already in index-lessons.mjs');
}
