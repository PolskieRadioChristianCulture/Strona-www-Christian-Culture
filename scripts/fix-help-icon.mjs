import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const omniPath = path.join(ROOT, 'components', 'cc-omni-search.js');
let omni = fs.readFileSync(omniPath, 'utf8');

// 1. Dodaj help do APP_ICONS
const targetJournal = `journal: '<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M3 7h4M3 12h4M3 17h4M10 8h6M10 12h6M10 16h4"/>'`;
const replacementHelp = `journal: '<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M3 7h4M3 12h4M3 17h4M10 8h6M10 12h6M10 16h4"/>',\n    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>'`;

if (!omni.includes("help: '<circle cx=\"12\" cy=\"12\" r=\"10\"")) {
  if (omni.includes(targetJournal)) {
    omni = omni.replace(targetJournal, replacementHelp);
    console.log("✅ Dodano help: do APP_ICONS");
  } else {
    console.error("❌ Nie znaleziono targetJournal w APP_ICONS!");
    process.exit(1);
  }
} else {
  console.log("ℹ️  help: już jest w APP_ICONS");
}

// 2. Bump cache buster do ?v=20261104_help2
omni = omni.replace(/cc-omni-search\.js\?v=20261104_help1/g, 'cc-omni-search.js?v=20261104_help2');
fs.writeFileSync(omniPath, omni, 'utf8');
console.log("✅ components/cc-omni-search.js zaktualizowany");

// 3. Zaktualizuj wyszukiwarka.html i wyszukiwarka/index.html
for (const f of ['wyszukiwarka.html', 'wyszukiwarka/index.html']) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/cc-omni-search\.js\?v=20261104_help1/g, 'cc-omni-search.js?v=20261104_help2');
    fs.writeFileSync(p, content, 'utf8');
    console.log(`✅ ${f} zaktualizowany na help2`);
  }
}

// 4. Kopiuj do .pages-release
const prDir = path.join(ROOT, '.pages-release');
fs.copyFileSync(omniPath, path.join(prDir, 'components', 'cc-omni-search.js'));
fs.copyFileSync(path.join(ROOT, 'wyszukiwarka.html'), path.join(prDir, 'wyszukiwarka.html'));
fs.copyFileSync(path.join(ROOT, 'wyszukiwarka', 'index.html'), path.join(prDir, 'wyszukiwarka', 'index.html'));
console.log("✅ Skopiowano do .pages-release");

// 5. Kopiuj do mirrora Desktop/@ICC/LUMINA
const mirrorDir = "C:\\Users\\czark\\Desktop\\@ICC\\LUMINA";
if (fs.existsSync(mirrorDir)) {
  fs.copyFileSync(omniPath, path.join(mirrorDir, 'components', 'cc-omni-search.js'));
  fs.copyFileSync(path.join(ROOT, 'wyszukiwarka.html'), path.join(mirrorDir, 'wyszukiwarka.html'));
  fs.copyFileSync(path.join(ROOT, 'wyszukiwarka', 'index.html'), path.join(mirrorDir, 'wyszukiwarka', 'index.html'));
  console.log("✅ Skopiowano do mirrora Desktop/@ICC/LUMINA");
}
