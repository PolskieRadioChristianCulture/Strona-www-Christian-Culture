import fs from 'node:fs';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
if (fs.existsSync(statusPath)) {
  let content = fs.readFileSync(statusPath, 'utf8');
  const entry = `## 2026-11-13 10:00 (Warszawa) — @A001 (Antigravity): Opracowanie i spakowanie artykułu EkoCC 365 — Slot 2026-11-13 (Lp 10: „Dobroć nie jest słabością. 7 decyzji, które zmieniają relacje”) | DO AUTORYZACJI L0 (T4) 🟡
- **ZLECENIE L0 (Dowódca Nazir):** Autonomiczne opracowanie i spakowanie artykułu publicystycznego na dzisiejszy slot kalendarza 365 (Światowy Dzień Dobroci, portal eM, priorytet B).
- **ZREALIZOWANY ZAKRES:**
  1. **Kalendarz 365:** Slot 10 (2026-11-13) oznaczony jako 'Opracowany / Czeka na autoryzację L0' w data/ekocc_kalendarz_365_artykulow.json. Sprawdzono rurociąg slotów priorytetowych A i B.
  2. **Standard redakcyjny i egzegetyczny:** Pełny artykuł (H1, lead, 6 sekcji H2, podsumowanie, wezwanie i modlitwa, źródła, wersety UBG, słownik Stronga, 28 Zasad Wiary, badania Gottmana, Axelroda, Waldingera i Braiker).
  3. **Pakiety na Pulpicie:** Utworzono ZIP (DOCX ze sformatowaną typografią i osadzoną grafiką 16:9, TXT, SEO.txt, JPG 16:9) oraz standalone DOCX na C:\\Users\\czark\\Desktop.
  4. **Bramka T4:** Artykuł oczekuje na decyzję i autoryzację Cezarego Rogowskiego (L0). Zero samowolnej publikacji produkcyjnej.
  5. **Handoff:** Zarejestrowano szczegółowy raport w JOMA_HANDOFFS.md.

`;
  if (content.charCodeAt(0) === 0xFEFF) {
    content = '\uFEFF' + entry + content.slice(1);
  } else {
    content = entry + content;
  }
  fs.writeFileSync(statusPath, content, 'utf8');
  console.log('✅ Zaktualizowano JOMA_STATUS.md');
}
