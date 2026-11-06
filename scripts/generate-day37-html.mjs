import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const srcFile = path.join(ROOT, 'akademia/kurscodzienny/dzien-36.html');
const destFile = path.join(ROOT, 'akademia/kurscodzienny/dzien-37.html');

let html = fs.readFileSync(srcFile, 'utf8');

// 1. Basic Replacements: Numbers & Titles
html = html.replaceAll('Dzień 36: PIERWSZA KONFRONTACJA Z FARAONEM: CIĘŻARY NIEWOLI I PRÓBA WIARY (Wj 5:1–23)', 'Dzień 37: TERAZ ZOBACZYSZ, CO UCZYNIĘ FARAONOWI: SIEDEM OBIETNIC ODKUPIENIA (Wj 6:1–30)');
html = html.replaceAll('Dzień 36: PIERWSZA KONFRONTACJA Z FARAONEM', 'Dzień 37: TERAZ ZOBACZYSZ, CO UCZYNIĘ FARAONOWI');
html = html.replaceAll('Dzień 36: Pierwsza konfrontacja z faraonem', 'Dzień 37: Teraz zobaczysz, co uczynię faraonowi');
html = html.replaceAll('Dzień 36 (5 listopada 2026 r.)', 'Dzień 37 (6 listopada 2026 r.)');
html = html.replaceAll('Dzień 36 (5 listopada 2026)', 'Dzień 37 (6 listopada 2026)');
html = html.replaceAll('Dzień 36', 'Dzień 37');
html = html.replaceAll('dzien-36', 'dzien-37');
html = html.replaceAll('5 listopada 2026', '6 listopada 2026');
html = html.replaceAll('Czwartek, 5 listopada 2026', 'Piątek, 6 listopada 2026');
html = html.replaceAll('Czwartek, 5 listopada', 'Piątek, 6 listopada');

// 2. Canonical & Navigation
html = html.replaceAll('https://polskieradio.cc/akademia/kurscodzienny/dzien-36', 'https://polskieradio.cc/akademia/kurscodzienny/dzien-37');
html = html.replaceAll('/akademia/kurscodzienny/dzien-35', '/akademia/kurscodzienny/dzien-36');
html = html.replaceAll('dzien-35', 'dzien-36');

// 3. Image replacement
html = html.replaceAll(
  'kc_day_36_mojzesz_faraon_cegly.jpg',
  'kc_day_37_obietnice_odkupienia_ramie_pana.jpg'
);

// 4. Reading & Scripture
html = html.replaceAll('Wj 5:1–23', 'Wj 6:1–30');
html = html.replaceAll('Wj 5', 'Wj 6');

// 5. Memory verse replacement
const oldVerse = `„Potem Mojżesz i Aaron przyszli do faraona i powiedzieli: Tak mówi Pan, Bóg Izraela: Wypuść mój lud, aby dla mnie obchodził święto na pustyni.” (Wj 5:1, UBG)`;
const newVerse = `„Dlatego powiedz synom Izraela: Ja jestem PAN! Wyprowadzę was spod ciężarów Egipcjan, wybawię was z ich niewoli i odkupię was wyciągniętym ramieniem i przez wielkie sądy.” (Wj 6:6, UBG)`;

html = html.replaceAll(oldVerse, newVerse);
// Clipboard replacement
html = html.replace(
  /navigator\.clipboard\.writeText\('[^']+'\)/g,
  `navigator.clipboard.writeText('Dlatego powiedz synom Izraela: Ja jestem PAN! Wyprowadzę was spod ciężarów Egipcjan, wybawię was z ich niewoli i odkupię was wyciągniętym ramieniem i przez wielkie sądy. (Wj 6:6, UBG)')`
);

// 6. Meta description
html = html.replace(
  /<meta name="description" content="[^"]+"/,
  `<meta name="description" content="Dzień 37: Księga Wyjścia 6:1–30. Objawienie Imienia JAHWE, wieczne przymierze, 7 Bożych obietnic odkupienia wyciągniętym ramieniem i przezwyciężenie udręki ducha. Studium biblijne i quiz wiedzy."`
);

// 7. Tomorrow preview section (#jutro)
const jutroRegex = /<section id="jutro"[\s\S]*?<\/section>/;
const newJutro = `<section id="jutro" class="kc-card border-l-4 border-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent p-6 rounded-2xl mb-8">
  <div class="flex items-center gap-3 mb-3">
    <span class="text-2xl">🌅</span>
    <h3 class="text-xl font-bold text-amber-300">Jutro — Dzień 38 (7 listopada 2026 r.)</h3>
  </div>
  <p class="text-gray-300 mb-2"><strong>MIESIĄC 2 • KSIĘGA WYJŚCIA • DZIEŃ 38:</strong> „Laska, która połknęła węże, i woda zamieniona w krew” (Czytanie: Wj 7:1–25).</p>
  <p class="text-sm text-gray-400">Mojżesz staje przed faraonem z laską Boga. Gdy egipscy czarownicy rzucają wyzwanie Stwórcy, Boża moc demonstruje swoją bezwzględną wyższość, a święty Nil zamienia się w krew. Wróć jutro, aby zobaczyć początek wielkich sądów nad bóstwami Egiptu!</p>
</section>`;

if (jutroRegex.test(html)) {
  html = html.replace(jutroRegex, newJutro);
}

fs.writeFileSync(destFile, html, 'utf8');
console.log('✔ Wygenerowano:', destFile);
