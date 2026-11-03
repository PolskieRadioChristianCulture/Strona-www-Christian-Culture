const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

console.log('\n======================================================');
console.log('🛡️  JOMA GUARD SENTINEL — PANCERNY STRAŻNIK EKOSYSTEMU');
console.log('    Standard @ProgresMCC & @SMCC & Zero-QA Dowódcy');
console.log('======================================================\n');

let errorCount = 0;
let warningCount = 0;

function logError(file, msg) {
    console.error(`❌ [BŁĄD KRYTYCZNY] [${file}]: ${msg}`);
    errorCount++;
}

function logWarning(file, msg) {
    console.warn(`⚠️  [OSTRZEŻENIE] [${file}]: ${msg}`);
    warningCount++;
}

function logSuccess(msg) {
    console.log(`✅ ${msg}`);
}

// ── 1. FROZEN BROADCAST CHANNELS GUARD ──
try {
    const gitDiff = execSync('git diff --name-only origin/main', { cwd: rootDir, encoding: 'utf8' });
    const frozenFiles = ['cctv24-worship.html', 'cctv24-worship-live.html', 'stream-scene.html'];
    // Zgody Dowódcy: konkretna treść pliku (SHA-256) zatwierdzona do wydania.
    // Każda kolejna zmiana wymaga nowej zgody — zamrożenie nadal obowiązuje.
    let approvals = {};
    try { approvals = JSON.parse(fs.readFileSync(path.join(rootDir, '.cc-frozen-approvals.json'), 'utf8')); } catch (e) {}
    const changed = gitDiff.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    frozenFiles.forEach(f => {
        if (!changed.includes(f)) return;
        const a = approvals[f];
        let hash = '';
        try { hash = require('crypto').createHash('sha256').update(fs.readFileSync(path.join(rootDir, f))).digest('hex'); } catch (e) {}
        if (a && a.sha256 === hash) {
            logSuccess(`[${f}] zmiana zamrożonego kanału z ZGODĄ Dowódcy (${a.date}, ${a.reason || 'bez opisu'}).`);
        } else {
            logError(f, 'NARUSZENIE ZAMROŻONEGO KANAŁU NADAWCZEGO! Plik jest STRICT READ-ONLY (brak zgody Dowódcy dla tej treści w .cc-frozen-approvals.json).');
        }
    });
} catch (e) {
    // Git diff fallback
}

// ── 2. ACTIVE PRODUCTION PAGES TO AUDIT ──
const productionHtmlFiles = [
    'index.html',
    'mojabiblia.html',
    'lumina.html',
    'lumina-tablica.html',
    'lumina-profile.html',
    'lumina.cezaryrgowski.html',
    'lumina.wiolettarogowska.html',
    'player.html',
    'vod.html',
    'rolki.html',
    'lumina-shorts.html',
    'biblia-do-pobrania.html',
    'snadaniowa.html',
    'zapolske.html'
];

// ── 3. CONFIDENTIALITY GUARD (MISSION CONTROL PRIVACY) ──
productionHtmlFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Strip <script> and <style> tags to inspect only user-visible DOM
    content = content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

    const matches = content.match(/>[^<]*Mission Control[^<]*</gi);
    if (matches) {
        logError(file, `Poufność naruszona! Wykryto widoczny tekst "Mission Control" w DOM (${matches.length} wystąpień).`);
    }
});

// ── 4. HTML INTEGRITY & SYNTAX GUARD ──
productionHtmlFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');

    // Duplicate tags
    const headClose = (content.match(/<\/head>/gi) || []).length;
    const bodyOpen = (content.match(/<body[^>]*>/gi) || []).length;
    const bodyClose = (content.match(/<\/body>/gi) || []).length;

    if (headClose > 1) {
        logError(file, `Zduplikowany znacznik </head> (${headClose} wystąpień)!`);
    }
    if (bodyOpen > 1) {
        logError(file, `Zduplikowany znacznik <body> (${bodyOpen} wystąpień)!`);
    }
    if (bodyClose > 1) {
        logError(file, `Zduplikowany znacznik </body> (${bodyClose} wystąpień)!`);
    }

    // Duplicate search emoji in placeholder
    if (/placeholder=["'][^"']*🔍\s*Wyszukaj/i.test(content) || /placeholder=["'][^"']*🔎\s*Wyszukaj/i.test(content)) {
        logError(file, 'Zdublowana lupa w atrybucie placeholder! Ikona jest już renderowana przez FontAwesome.');
    }

    // Viewport tag presence
    if (!content.includes('viewport')) {
        logError(file, 'Brak znacznika meta viewport wymaganego dla smartfonów!');
    }
});

// ── 5. CSS DISPLAY & TAB COLLISION GUARD ──
const cssFiles = [
    'css/lumina-chat-premium.css',
    'style.css'
];

cssFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');

    // Dangerous display: flex !important or display: grid !important on containers
    const dangerousMatches = content.match(/\.(messenger-[^{]+|modal-[^{]+)\s*\{[^}]*display:\s*(flex|grid)\s*!important/gi);
    if (dangerousMatches) {
        dangerousMatches.forEach(m => {
            logError(file, `Destrukcyjny display !important blokujący ukrywanie zakładek: ${m.replace(/\s+/g, ' ')}`);
        });
    }
});

// ── 6. JS GROUP CARDS SQUASHING GUARD ──
const groupsEnginePath = path.join(rootDir, 'js', 'lumina-groups-engine.js');
if (fs.existsSync(groupsEnginePath)) {
    const content = fs.readFileSync(groupsEnginePath, 'utf8');
    if (!content.includes('flex-shrink: 0')) {
        logError('js/lumina-groups-engine.js', 'Brak reguły flex-shrink: 0 w .group-card-item! Karty grup mogą ulegać spłaszczeniu.');
    }
}

// ── 6b. STRAŻNIK LEKCJI KURSU CODZIENNEGO (@007, 2026-11-03) ──
// Commit z lekcją dnia N, w której zostały elementy innego dnia (nagłówek, Strong, zadanie, udostępnianie), jest blokowany.
try {
    const staged = execSync('git diff --cached --name-only', { cwd: rootDir, encoding: 'utf8' });
    const dni = [...new Set(staged.split(/\r?\n/).map(f => (f.match(/^(?:akademia|kursy)\/kurscodzienny\/dzien-(\d+)(?:\.html|\/index\.html)$/) || [])[1]).filter(Boolean).map(Number))];
    if (dni.length) {
        try {
            execSync(`node scripts/kurs-codzienny/straznik-lekcji.mjs ${dni.join(' ')}`, { cwd: rootDir, encoding: 'utf8', stdio: 'pipe' });
            logSuccess(`Strażnik lekcji KC: dni ${dni.join(', ')} spójne.`);
        } catch (e) {
            logError('akademia/kurscodzienny', `Lekcja niespójna z dniem — popraw przed commitem:\n${(e.stderr || '') + (e.stdout || '')}`);
        }
    }
} catch (e) {
    // brak gita — pomijamy
}

// ── 7. SUMMARY & EXIT CODE ──
console.log('------------------------------------------------------');
if (errorCount === 0) {
    logSuccess('Wszystkie testy integralności ekosystemu ZALICZONE (0 błędów).');
    if (warningCount > 0) {
        console.log(`⚠️  Liczba uwag/ostrzeżeń: ${warningCount}`);
    }
    console.log('🚀 Ekosystem spełnia standard Zero-QA dla Dowódcy.');
    console.log('======================================================\n');
    process.exit(0);
} else {
    console.error(`\n❌ ZNALEZIONO ${errorCount} BŁĘDÓW KRYTYCZNYCH! Wdrożenie/commit zablokowany.`);
    console.log('======================================================\n');
    process.exit(1);
}
