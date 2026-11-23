import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

async function main() {
  const jsonPath = path.join(ROOT, 'scripts/article-lp25-finanse-2026-11-28.json');
  const articleData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log('🚀 Przygotowanie pakietu redakcyjnego EkoCC (Slot 25: 2026-11-28 — FINANSE, Priorytet A)...');
  console.log('Tytuł:', articleData.title);
  console.log('Meta title length:', articleData.seo.title.length, '| Meta description length:', articleData.seo.description.length);
  console.log('Slug:', articleData.slug);

  if (!fs.existsSync(articleData.imagePath)) {
    throw new Error(`Brak pliku grafiki 16:9 pod ścieżką: ${articleData.imagePath}`);
  }

  const desktopOut = 'C:\\Users\\czark\\Desktop';
  const driveOut = 'H:\\Mój dysk\\OA - orkiestracja Agentowa\\produkowane przez Agentów';

  const result = await packageEkoccArticle(articleData, desktopOut);

  if (fs.existsSync(driveOut)) {
    fs.copyFileSync(result.zipPath, path.join(driveOut, path.basename(result.zipPath)));
    fs.copyFileSync(result.docxPath, path.join(driveOut, path.basename(result.docxPath)));
    console.log(`☁️ Skopiowano pakiet ZIP i DOCX na Google Drive: ${driveOut}`);
  } else {
    throw new Error(`Katalog Google Drive niedostępny: ${driveOut}`);
  }

  console.log('\n============================================================');
  console.log('🎉 PAKIET ARTYKUŁU EkoCC PRZYGOTOWANY POMYŚLNIE!');
  console.log('Status: Do autoryzacji autora i akceptacji wydawcy (Bramka T4 / L0)');
  console.log('============================================================');
  console.log('📦 Plik ZIP (Pulpit):', result.zipPath);
  console.log('📄 Plik DOCX (Pulpit):', result.docxPath);
  console.log('📝 Plik TXT:', result.txtPath);
  console.log('🔍 Plik SEO:', result.seoPath);
  console.log('============================================================\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('❌ Błąd przygotowania pakietu:', err);
    process.exit(1);
  });
}
