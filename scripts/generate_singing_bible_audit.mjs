import fs from 'fs';
import path from 'path';

const ROOT = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc';
const GD_ROOT = 'H:\\Mój dysk\\OA - orkiestracja Agentowa\\CC_SINGING_BIBLE_FACTORY';
const LOCAL_ROOT = path.join(ROOT, 'factory', 'singing-bible');

const manifestPath = path.join(ROOT, 'data', 'bible', 'ubg-2025', 'manifest.json');
const karaokeDir = path.join(ROOT, 'data', 'bu-karaoke');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const karaokeFiles = fs.existsSync(karaokeDir) ? fs.readdirSync(karaokeDir).filter(f => f.endsWith('.json')) : [];

const existingKaraoke = {};
for (const kf of karaokeFiles) {
  try {
    const kData = JSON.parse(fs.readFileSync(path.join(karaokeDir, kf), 'utf8'));
    const chId = kData.chapterId || kf.replace('.json', '');
    existingKaraoke[chId] = kData;
  } catch (e) {
    console.error(`Error reading ${kf}:`, e.message);
  }
}

const audit = {
  version: "1.0",
  generatedAt: new Date().toISOString(),
  translation: manifest.translation,
  translationName: manifest.translationName,
  copyright: manifest.copyright,
  totalChapters: manifest.totalChapters,
  totalVerses: manifest.totalVerses,
  stats: {
    publishedFullUbg: 0,
    needsRefactorToFullUbg: 0,
    nextToProduce: null,
    unprocessed: 0
  },
  chapters: []
};

let nextFound = false;

for (let i = 0; i < manifest.chapters.length; i++) {
  const ch = manifest.chapters[i];
  const chId = ch.chapterId;
  const kData = existingKaraoke[chId];

  let status = "NIEOPRACOWANY";
  let coverage = 0;
  let videoId = null;
  let duration = 0;
  let notes = "";

  if (kData) {
    videoId = kData.videoId || null;
    duration = kData.duration || 0;
    coverage = kData.coverage || (kData.lines ? Math.round((new Set(kData.lines.map(l => l.verse).filter(Boolean)).size / ch.totalVerses) * 100) : 0);

    if (coverage >= 98) {
      status = "OPUBLIKOWANY";
      audit.stats.publishedFullUbg++;
      notes = "100% wersetów UBG pokryte.";
    } else {
      status = "DO_REFAKTORYZACJI_100_PROC_UBG";
      audit.stats.needsRefactorToFullUbg++;
      notes = `Utwór istnieje (${duration}s, YouTube ${videoId || 'brak'}), lecz pokrywa tylko ${coverage}% wersetów. Wymaga podziału na części (Part 1..N) dla 100% UBG.`;
    }
  } else {
    if (!nextFound) {
      status = "KOLEJNY_NASTEPNY_DO_OPRACOWANIA";
      audit.stats.nextToProduce = chId;
      nextFound = true;
      notes = "Kolejny chronologiczny rozdział do przygotowania tekstu dla Suno Pro.";
    } else {
      status = "NIEOPRACOWANY";
      audit.stats.unprocessed++;
    }
  }

  audit.chapters.push({
    orderIndex: i + 1,
    chapterId: chId,
    book: ch.book,
    bookCode: ch.bookCode,
    chapter: ch.chapter,
    totalVerses: ch.totalVerses,
    status,
    coveragePercent: coverage,
    videoId,
    durationSeconds: duration,
    notes
  });
}

// Write to local factory
const localRegDir = path.join(LOCAL_ROOT, '00_REJESTR');
if (!fs.existsSync(localRegDir)) fs.mkdirSync(localRegDir, { recursive: true });
fs.writeFileSync(path.join(localRegDir, 'chronologia_i_postep.json'), JSON.stringify(audit, null, 2), 'utf8');

// Write to Google Drive
const gdRegDir = path.join(GD_ROOT, '00_REJESTR');
if (fs.existsSync(gdRegDir)) {
  fs.writeFileSync(path.join(gdRegDir, 'chronologia_i_postep.json'), JSON.stringify(audit, null, 2), 'utf8');
}

// Generate Markdown summary
let md = `# CC SINGING BIBLE FACTORY — REJESTR CHRONOLOGII I POSTĘPU 1.0\n\n`;
md += `**Data generowania:** ${audit.generatedAt}\n`;
md += `**Przekład źródłowy:** ${audit.translationName} (${audit.translation})\n`;
md += `**Licencja:** ${audit.copyright}\n`;
md += `**Łącznie rozdziałów:** ${audit.totalChapters} (Wersety: ${audit.totalVerses})\n\n`;
md += `## Statystyka Produkcyjna\n\n`;
md += `- **100% UBG opublikowane:** ${audit.stats.publishedFullUbg} (${audit.chapters.filter(c => c.status === 'OPUBLIKOWANY').map(c => c.chapterId).join(', ')})\n`;
md += `- **Wymagające refaktoryzacji do 100% UBG (wcześniejsze pojedyncze piosenki Suno):** ${audit.stats.needsRefactorToFullUbg} (PRO 1-31, ECC 1-12, SNG 1)\n`;
md += `- **Kolejny nieopracowany rozdział chronologicznie:** **${audit.stats.nextToProduce}** (${manifest.chapters.find(c => c.chapterId === audit.stats.nextToProduce)?.book} ${manifest.chapters.find(c => c.chapterId === audit.stats.nextToProduce)?.chapter})\n`;
md += `- **Pozostałe nieopracowane:** ${audit.stats.unprocessed}\n\n`;
md += `## Szczegóły Opracowanych Rozdziałów\n\n`;
md += `| Rozdział | Księga | Status | Pokrycie UBG | Wideo YouTube | Długość | Uwagi |\n`;
md += `|---|---|---|---|---|---|---|\n`;

for (const c of audit.chapters.filter(c => c.status !== 'NIEOPRACOWANY')) {
  const ytLink = c.videoId ? `[${c.videoId}](https://youtu.be/${c.videoId})` : '—';
  const dur = c.durationSeconds ? `${c.durationSeconds}s` : '—';
  md += `| **${c.chapterId}** | ${c.book} ${c.chapter} | \`${c.status}\` | ${c.coveragePercent}% | ${ytLink} | ${dur} | ${c.notes} |\n`;
}

fs.writeFileSync(path.join(localRegDir, 'REJESTR_CHRONOLOGII_I_POSTEPU.md'), md, 'utf8');
if (fs.existsSync(gdRegDir)) {
  fs.writeFileSync(path.join(gdRegDir, 'REJESTR_CHRONOLOGII_I_POSTEPU.md'), md, 'utf8');
}

console.log('Audit generated successfully!');
console.log('Next to produce:', audit.stats.nextToProduce);
console.log('Needs refactor:', audit.stats.needsRefactorToFullUbg);
console.log('Full UBG published:', audit.stats.publishedFullUbg);
