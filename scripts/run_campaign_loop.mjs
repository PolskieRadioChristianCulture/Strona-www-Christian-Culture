#!/usr/bin/env node
import { executeSlot, STRATEGIC_HOURLY_SLOTS } from './campaign_wieczor_orchestrator.mjs';
import fs from 'fs';
import path from 'path';

const LOG_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\data\\wieczor_campaign_log.json';

function alreadyExecuted(hour) {
  if (!fs.existsSync(LOG_PATH)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
    const today = new Date().toISOString().slice(0, 10);
    return (data.history || []).some(h => h.hour === hour && (h.executedAt || '').startsWith(today) && h.lumina && h.lumina.status !== 'dry_run');
  } catch {
    return false;
  }
}

async function loop() {
  console.log('=== KAMPANIA GODZINOWA: Wieczór ze Słowem Bożym (12:00 - 20:00) ===');
  console.log('Pętla uruchomiona. Sprawdzam harmonogram co 60 sekund...');

  // Jeśli startujemy tuż przed lub w trakcie 12:00, opublikuj slot 12:00 natychmiast
  const currentHour = new Date().getHours();
  if (currentHour >= 12 && currentHour <= 20 && !alreadyExecuted(currentHour)) {
    console.log(`[INICJALIZACJA] Publikuję natychmiast zaległy/aktualny slot dla godziny ${currentHour}:00...`);
    await executeSlot(currentHour, false);
  }

  setInterval(async () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();

    // Publikuj w okolicach pełnej godziny (m <= 5) dla zdefiniowanych slotów
    if (STRATEGIC_HOURLY_SLOTS[h] && !alreadyExecuted(h)) {
      console.log(`[HARMONOGRAM] Wybiła godzina ${h}:00 (czas: ${now.toLocaleTimeString()}). Uruchamiam slot promocyjny...`);
      await executeSlot(h, false);
    }
  }, 60000);
}

loop().catch(err => {
  console.error('Błąd pętli kampanii:', err);
});
