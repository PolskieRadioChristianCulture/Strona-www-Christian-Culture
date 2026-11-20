import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

export function writeCycleReport({ repoRoot = DEFAULT_REPO_ROOT, reportsDir: customReportsDir = null, cycleResult }) {
  const reportsDir = customReportsDir || path.join(repoRoot, 'patronite', 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const datePart = cycleResult.scheduledForWarsaw.slice(0, 10);
  const filePath = path.join(reportsDir, `${cycleResult.jobId}.md`);
  const lines = [
    `# Raport cyklu Patronite: ${cycleResult.jobId}`,
    '',
    `- **Data planowana:** ${cycleResult.scheduledForWarsaw}`,
    `- **Typ publikacji:** ${cycleResult.seriesLabel} (\`${cycleResult.seriesType}\`)`,
    `- **Temat:** ${cycleResult.title}`,
    `- **Status:** ${cycleResult.status}`,
    `- **Adres / pakiet:** ${cycleResult.url || cycleResult.draftDir || 'brak'}`,
    `- **Najważniejsze źródła:**`,
    ...(cycleResult.sources || []).map(s => `  - [${s.status}] ${s.sourceName} (${s.sourceRef}, data: ${s.verifiedDate})`),
    `- **Wyniki kontroli Quality Guardian:** ${cycleResult.qaResult.passedCount}/${cycleResult.qaResult.totalCount} (${cycleResult.qaResult.overallStatus})`,
    ...(cycleResult.blockReason ? [`- **Przyczyna blokady / uwaga:** ${cycleResult.blockReason}`] : []),
    '',
  ];
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  return filePath;
}

export function buildWeeklyThreeCycleSummary({ repoRoot = DEFAULT_REPO_ROOT, cycles = [], weekLabel = 'Symulacja' }) {
  const reportsDir = path.join(repoRoot, 'patronite', 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const safeName = weekLabel.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const filePath = path.join(reportsDir, `weekly-summary-${safeName}.md`);

  const counts = {
    OPUBLIKOWANO: cycles.filter(c => c.status === 'OPUBLIKOWANO').length,
    SZKIC: cycles.filter(c => c.status === 'SZKIC').length,
    WSTRZYMANO: cycles.filter(c => c.status === 'WSTRZYMANO').length,
    BLAD: cycles.filter(c => c.status === 'BŁĄD').length,
  };

  const md = [
    `# Podsumowanie tygodniowe CC Patronite Mission Reporter (${weekLabel})`,
    '',
    `- **Cykle łącznie:** ${cycles.length}`,
    `- **Opublikowano:** ${counts.OPUBLIKOWANO} | **Szkice:** ${counts.SZKIC} | **Wstrzymano:** ${counts.WSTRZYMANO} | **Błędy:** ${counts.BLAD}`,
    `- **Uwaga integracyjna:** Brak zmyślonych statystyk Patronite — statystyki wyświetleń lub wpłat mogą pochodzić wyłącznie z autoryzowanego odczytu po uruchomieniu integracji.`,
    '',
    '## Przegląd 3 cykli redakcyjnych',
    ...cycles.map(c => `- **${c.scheduledForWarsaw.slice(0, 16)} (${c.seriesLabel})**: *${c.title}* — status: **${c.status}**, QA: ${c.qaResult.passedCount}/${c.qaResult.totalCount}, źródła: ${(c.sources || []).map(s => s.sourceName).join(', ')}`),
    '',
  ].join('\n');

  fs.writeFileSync(filePath, md, 'utf8');
  return { filePath, counts, markdown: md };
}
