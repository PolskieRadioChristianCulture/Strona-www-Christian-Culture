import fs from 'node:fs';
import path from 'node:path';

const dataFile = 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/dla_dowodcy_213.json';
const items = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

let md = `# Kompletny Rejestr 213 Spraw Oczekujących na Dowódcę w Skrzynce Misji CC

> **Źródło:** \`C:\\Users\\czark\\Desktop\\Misja CC\\JOMA_SHARED_MEMORY\\SKRZYNKA\\TABLICA.md\` (sekcja \`## Czeka na Dowódcę (213)\`).  
> **Stan na dzień:** 2026-11-09 22:00 (czas warszawski).

---

## 📊 Podsumowanie Analityczne (Dlaczego jest aż 213 spraw?)

W systemie komunikacji agentów ekosystemu Christian Culture każda wiadomość, w której agent w polu \`do:\` wpisze \`dowodca\` (lub ustawi znacznik \`wymaga_dowodcy: true\`), trafia automatycznie na listę **„Czeka na Dowódcę”** i pozostaje na niej dopóki Dowódca osobiście jej nie potwierdzi (\`przyjete\` / \`zrobione\` / \`odrzucone\`).

W praktyce spośród **213 spraw**:
1. **~160 pozycji (ok. 75%) to czysto informacyjne meldunki historyczne**:
   - **112 raportów z zakończenia prac (\`KONIEC\` / \`ZROBIONE\`)** — agenci raportowali wykonanie zadań, wysyłając kopię do Dowódcy. Zadania te są już zrealizowane i wdrożone!
   - **46 zgłoszeń rozpoczęcia (\`START\`)** — wpisy rejestrujące start sesji roboczych agentów z okresu od 13 października do 9 listopada.
2. **~8 pozycji to historyczne ALARMY**:
   - Np. alarmy nocnego automatu Kursu Codziennego (Dni 36–40), które zostały dziś ostatecznie rozwiązane wdrożeniem czystej paczki Dnia 41 do kolejki.
3. **Kilkanaście pozycji to rzeczywiste DECYZJE i ZGODY L0**:
   - Dotyczące infrastruktury, kluczy, DNS, usunięcia duplikatów YouTube i autoryzacji publikacji.

---

## 🧭 Rekomendacja Operacyjna dla Dowódcy
- **Krok 1 (Bieżące decyzje):** Odpowiedz na kluczowe decyzje (patrz tabela priorytetów poniżej).
- **Krok 2 (Zbiorcze czyszczenie skrzynki):** Za Twoją zgodą agent dyżurny może wykonać zbiorcze potwierdzenie (\`batch ACK\`) wszystkich 160 informacyjnych meldunków starszych niż 48 godzin. Wówczas na Twojej liście pozostaną wyłącznie **realne, aktywne decyzje (kilka spraw)**.

---

## 📋 Pełny Rejestr Wszystkich 213 Pozycji

| Lp. | Data (UTC) | Nadawca | Typ | ID Wiadomości | Temat Sprawy | Kategoria / Status |
|:---:|:---:|:---:|:---:|:---|:---|:---|
`;

items.forEach((it, idx) => {
  const lp = idx + 1;
  const id = it.id;
  const data = (it.utworzono || '').slice(0, 16).replace('T', ' ');
  const od = it.od || '?';
  const typ = it.typ || 'info';
  const temat = (it.temat || '').replace(/\|/g, '—').replace(/\r?\n/g, ' ');

  let status = 'W toku';
  if (/KONIEC|ZROBIONE|PASS/i.test(temat) || typ === 'raport') {
    status = '✅ Wykonane (do zamknięcia)';
  } else if (/START|rozpoczęcie/i.test(temat)) {
    status = 'ℹ️ Informacja (START)';
  } else if (/ALARM/i.test(temat)) {
    status = '⚠️ Alarm (historyczny)';
  } else if (/decyzja|zgoda|wybór|prośba|pytanie|\?/i.test(temat) || it.wymaga_dowodcy || typ === 'pytanie') {
    status = '🎯 Wymaga decyzji L0';
  } else {
    status = 'ℹ️ Informacja';
  }

  md += `| ${lp} | ${data} | **@${od}** | \`${typ}\` | \`${id}\` | ${temat} | ${status} |\n`;
});

const outPath = 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/rejestr_213_spraw_dowodcy.md';
fs.writeFileSync(outPath, md, 'utf8');
console.log(`✅ Pomyślnie wygenerowano pełny rejestr: ${outPath} (${items.length} pozycji)`);
