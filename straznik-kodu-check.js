#!/usr/bin/env node
/**
 * ══════════════════════════════════════════════════════════════════════════
 * STRAŻNIK KODU — automatyczny egzekutor STRAZNIK_JAKOSCI_KODU.md
 * ══════════════════════════════════════════════════════════════════════════
 * Cel: przestać codziennie rozwiązywać te same problemy. Ten skrypt zamienia
 * dokumentację (świetną, ale niewymuszaną) w mechaniczną bramkę — uruchamianą
 * PRZED każdym commitem/deployem i w CI, żeby żaden agent (Claude, Antigravity,
 * Codex, człowiek) nie mógł niezauważenie wprowadzić regresji, którą już raz
 * naprawiliśmy.
 *
 * Użycie:
 *   node scripts/straznik-kodu-check.js
 *   (kod wyjścia 0 = czysto, 1 = znaleziono naruszenia — blokuj merge/deploy)
 *
 * Każda reguła poniżej odpowiada realnemu błędowi znalezionemu i naprawionemu
 * w portalu LUMINA — nie są to hipotetyczne "best practices", to spisana
 * historia awarii.
 * ══════════════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { isPublicFile } from './scripts/cc-release-files.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = process.cwd();
const HTML_FILES = fs.readdirSync(ROOT)
  .filter(f => f.endsWith('.html') && !f.startsWith('.') && !f.toLowerCase().includes('backup'));
const JS_FILES = fs.readdirSync(ROOT)
  .filter(f => f.endsWith('.js') && !f.startsWith('.') && !f.toLowerCase().includes('backup'));
const CSS_FILES = [
  ...fs.readdirSync(ROOT).filter(f => f.endsWith('.css')),
  ...(fs.existsSync(path.join(ROOT, 'css'))
      ? fs.readdirSync(path.join(ROOT, 'css')).filter(f => f.endsWith('.css')).map(f => path.join('css', f))
      : []),
];

let violations = [];
let checksRun = 0;

function readFile(f) {
  return fs.readFileSync(path.join(ROOT, f), 'utf-8');
}

function report(rule, file, detail) {
  violations.push({ rule, file, detail });
}

// ══════════════════════════════════════════════════════════════════════════
// REGUŁA A — Kaskada CSS: konfliktowe flex-direction na tym samym selektorze
// (dokładnie błąd .head-actions: 4 próby naprawy przegrały z jedną złą regułą
// w innym pliku, bo nikt nie sprawdził całej kaskady naraz)
// ══════════════════════════════════════════════════════════════════════════
// Tylko selektory, o których WIEMY, że muszą mieć jeden, spójny kierunek
// wszędzie (niezależnie od media queries) — bo już raz to nas kosztowało.
// Ogólna kontrola każdej klasy w pliku dawała fałszywe alarmy na normalnych,
// zamierzonych różnicach responsywnych (np. .why-item: row na desktopie,
// column na mobile — to poprawny design, nie regresja).
const CRITICAL_SINGLE_DIRECTION_SELECTORS = ['.head-actions'];

function checkCssFlexDirectionConflicts() {
  checksRun++;
  const bySelector = {};       // dla flex-direction
  const byWrapSelector = {};   // dla flex-wrap — dodane po tym, jak konflikt
                                 // nowrap/wrap na .head-actions w JEDNYM pliku
                                 // stworzył pustą przestrzeń, niewidoczną dla
                                 // sprawdzania samego flex-direction
  const allCssSources = [
    ...CSS_FILES.map(f => ({ file: f, content: readFile(f) })),
    ...HTML_FILES.map(f => {
      const html = readFile(f);
      const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n');
      return { file: f + ' (inline <style>)', content: styleBlocks };
    }),
  ];

  for (const { file, content } of allCssSources) {
    const ruleRe = /([.#][\w-]+)\s*\{([^}]*)\}/g;
    let m;
    while ((m = ruleRe.exec(content)) !== null) {
      const selector = m[1];
      if (!CRITICAL_SINGLE_DIRECTION_SELECTORS.includes(selector)) continue;
      const body = m[2];

      const dirMatch = body.match(/flex-direction\s*:\s*(row|column)/);
      if (dirMatch) {
        const dir = dirMatch[1];
        bySelector[selector] = bySelector[selector] || {};
        bySelector[selector][dir] = bySelector[selector][dir] || [];
        bySelector[selector][dir].push(file);
      }

      const wrapMatch = body.match(/flex-wrap\s*:\s*(nowrap|wrap)/);
      if (wrapMatch) {
        const wrap = wrapMatch[1];
        byWrapSelector[selector] = byWrapSelector[selector] || {};
        byWrapSelector[selector][wrap] = byWrapSelector[selector][wrap] || [];
        byWrapSelector[selector][wrap].push(file);
      }
    }
  }

  for (const [selector, dirs] of Object.entries(bySelector)) {
    const directions = Object.keys(dirs);
    if (directions.length > 1) {
      report(
        'A-CSS-FLEX-CONFLICT',
        directions.map(d => dirs[d].join(', ')).join(' vs '),
        `Selektor "${selector}" (na liście krytycznych) ma SPRZECZNE wartości flex-direction: ` +
        directions.map(d => `${d} w [${dirs[d].join(', ')}]`).join('; ') +
        ' — to dokładnie klasa błędu, która kosztowała 4 nieudane próby naprawy przycisków profilu.'
      );
    }
  }

  for (const [selector, wraps] of Object.entries(byWrapSelector)) {
    const wrapVals = Object.keys(wraps);
    if (wrapVals.length > 1) {
      report(
        'A-CSS-FLEX-WRAP-CONFLICT',
        wrapVals.map(w => wraps[w].join(', ')).join(' vs '),
        `Selektor "${selector}" (na liście krytycznych) ma SPRZECZNE wartości flex-wrap: ` +
        wrapVals.map(w => `${w} w [${wraps[w].join(', ')}]`).join('; ') +
        ' — na urządzeniach mobilnych to może pozostawić pustą przestrzeń albo poziomy pasek przewijania zamiast siatki przycisków.'
      );
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// REGUŁA B — Niebezpieczny fallback tożsamości (Data Fallback Guard)
// ══════════════════════════════════════════════════════════════════════════
const KNOWN_FOUNDER_SLUGS = ['cezaryrgowski', 'cezaryrogowski', 'wiolettarogowska', 'andrzejthiel'];

function checkIdentityFallbackGuard() {
  checksRun++;
  const allFiles = [...HTML_FILES, ...JS_FILES];
  for (const f of allFiles) {
    const content = readFile(f);
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      for (const slug of KNOWN_FOUNDER_SLUGS) {
        // Wzorzec 1: bezwarunkowe "return 'slug';"
        const bareReturn = new RegExp(`return\\s+'${slug}'\\s*;`).test(line);
        // "if (true)" / "if (1)" to POZORNY warunek — nie liczy się jako
        // realne zabezpieczenie (to dokładnie sposób, w jaki poprzednia
        // wersja tego pliku "przemknęła" przez tę regułę bez realnej naprawy).
        const lineWithoutFakeConditions = line.replace(/if\s*\(\s*(true|1)\s*\)/g, '');
        const isConditional = /\?|if\s*\(|&&|\|\|/.test(lineWithoutFakeConditions.replace(bareReturn ? `return '${slug}';` : '', ''));
        const precedingWindow = lines.slice(Math.max(0, idx - 6), idx).join('\n');
        const netOpenBraces = (precedingWindow.match(/\{/g) || []).length - (precedingWindow.match(/\}/g) || []).length;
        const hasMultilineGuard = netOpenBraces > 0 && /if\s*\(/.test(precedingWindow);
        if (bareReturn && !isConditional && !hasMultilineGuard) {
          report('B-IDENTITY-FALLBACK', f, `Linia ${idx + 1}: bezwarunkowe (lub pozornie warunkowe przez if(true)) "return '${slug}';".`);
        }

        // Wzorzec 2 (szerszy, złapał prawdziwy błąd, którego wzorzec 1 nie widział):
        // wartość domyślna w wyrażeniu, np. `params.get('u') || 'slug'`,
        // `x.slug || 'slug'`, `f.senderId?.stringValue || 'slug'`.
        const defaultValuePattern = new RegExp(`\\|\\|\\s*'${slug}'(?!\\s*\\))`);
        if (defaultValuePattern.test(line) && !bareReturn) {
          report(
            'B-IDENTITY-FALLBACK-DEFAULT',
            f,
            `Linia ${idx + 1}: "${line.trim().slice(0, 100)}" — wartość domyślna podstawia tożsamość "${slug}", ` +
            `gdy prawdziwe dane są puste/błędne. Sprawdź czy to naprawdę zamierzone (np. legalne rozpoznanie URL), czy niebezpieczny fallback.`
          );
        }
      }
    });
  }
}

// ══════════════════════════════════════════════════════════════════════════
// REGUŁA C — Anti-Teardown: wymuszone przewijanie na dół bez warunku
// ══════════════════════════════════════════════════════════════════════════
function checkForcedScrollJump() {
  checksRun++;
  for (const f of HTML_FILES) {
    const content = readFile(f);
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (/\.scrollTop\s*=\s*.*\.scrollHeight/.test(line)) {
        const windowStart = Math.max(0, idx - 3);
        const contextBefore = lines.slice(windowStart, idx + 1).join('\n');
        const isGuarded = /wasNearBottom|if\s*\(/.test(contextBefore);
        if (!isGuarded) {
          report(
            'C-FORCED-SCROLL-JUMP',
            f,
            `Linia ${idx + 1}: "scrollTop = scrollHeight" bez widocznego warunku (np. wasNearBottom) w 3 poprzedzających liniach — ` +
            `to dokładnie błąd, który zrywał czytanie historii czatu każdemu, gdy ktoś inny dodał reakcję.`
          );
        }
      }
    });
  }
}

// ══════════════════════════════════════════════════════════════════════════
// REGUŁA D — Podwójna/konkurująca rejestracja Service Workera
// ══════════════════════════════════════════════════════════════════════════
function checkDuplicateServiceWorkerRegistration() {
  checksRun++;
  const registrations = new Map(); // baseFilename -> [files gdzie zarejestrowano]
  const allFiles = [...HTML_FILES, ...JS_FILES];
  for (const f of allFiles) {
    const content = readFile(f);
    const re = /serviceWorker\.register\(\s*['"]([^'"?]+)/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const base = m[1];
      if (!registrations.has(base)) registrations.set(base, []);
      registrations.get(base).push(f);
    }
  }
  const distinctScripts = [...registrations.keys()];
  if (distinctScripts.length > 1) {
    report(
      'D-DUPLICATE-SERVICE-WORKER',
      distinctScripts.join(', '),
      `Znaleziono ${distinctScripts.length} różnych plików Service Workera rejestrowanych w tym repozytorium: ` +
      distinctScripts.map(s => `"${s}" (w ${registrations.get(s).join(', ')})`).join('; ') +
      ' — to dokładnie przyczyna gubienia powiadomień push przy zamkniętej aplikacji. Powinien być tylko JEDEN.'
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════
// REGUŁA E — Uszkodzone znaki (mojibake) — resztki po błędnych "naprawach"
// ══════════════════════════════════════════════════════════════════════════
function checkMojibake() {
  checksRun++;
  const allFiles = [...HTML_FILES, ...JS_FILES.filter(f => !f.endsWith('.min.js'))];
  for (const f of allFiles) {
    const content = readFile(f);
    // Znaki sterujące C1 (0x80–0x9F) nigdy nie są legalną treścią w UI.
    const c1Matches = content.match(/[\x80-\x9f]/g);
    if (c1Matches) {
      report('E-MOJIBAKE-CONTROL-CHARS', f, `${c1Matches.length} znaków sterujących C1 (0x80–0x9F) — pozostałość po uszkodzonym kodowaniu emoji.`);
    }
    // Charakterystyczny wzorzec: ✨ bezpośrednio po którym NIE następuje spacja,
    // cudzysłów ani inny standardowy emoji z górnego zakresu Unicode — częsty ślad mojibake.
    const suspiciousSparkle = content.match(/✨[\u0080-\u02ff]/g);
    if (suspiciousSparkle) {
      report('E-MOJIBAKE-SPARKLE-PATTERN', f, `${suspiciousSparkle.length} podejrzanych sekwencji "✨" + znak z zakresu Latin Extended — sprawdź ręcznie, to sygnatura wcześniejszej masowej korupcji emoji.`);
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// REGUŁA F — Niebezpieczna interpolacja treści użytkownika do innerHTML (XSS)
// ══════════════════════════════════════════════════════════════════════════
const RISKY_FIELDS = ['msg.text', 'msg.senderName', 'msg.senderAvatar', 'msg.senderBadge'];

function checkUnescapedUserContent() {
  checksRun++;
  for (const f of HTML_FILES) {
    const content = readFile(f);
    for (const field of RISKY_FIELDS) {
      const escapedPattern = new RegExp(`escapeHtml\\(${field.replace('.', '\\.')}`);
      const rawPattern = new RegExp(`\\$\\{${field.replace('.', '\\.')}(?!\\s*\\))`, 'g');
      let m;
      while ((m = rawPattern.exec(content)) !== null) {
        // sprawdź czy w otoczeniu (50 znaków wstecz) jest escapeHtml — jeśli tak, to prawdopodobnie ${escapeHtml(msg.text)} i regex złapał środek
        const before = content.slice(Math.max(0, m.index - 15), m.index);
        if (/escapeHtml\($/.test(before)) continue; // to jest już opakowane, fałszywy alarm
        const lineNum = content.slice(0, m.index).split('\n').length;
        report(
          'F-UNESCAPED-USER-CONTENT',
          f,
          `Linia ${lineNum}: "\${${field}}" wstawione do szablonu BEZ escapeHtml() — potencjalna luka XSS w czacie/tablicy.`
        );
      }
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// REGUŁA G — Dryf zduplikowanych funkcji między plikami (ta sama funkcja,
// inna treść w różnych plikach = ktoś naprawił jeden plik, zapomniał o reszcie)
// ══════════════════════════════════════════════════════════════════════════
const WATCHED_DUPLICATED_FUNCTIONS = [
  'resolveChatAvatar', 'renderPublicChatMessages', 'renderDirectChatMessages',
];

function extractFunctionBody(content, fnName) {
  const idx = content.indexOf(`window.${fnName} = function`);
  const idx2 = idx === -1 ? content.indexOf(`function ${fnName}(`) : idx;
  if (idx2 === -1) return null;
  // Prosta heurystyka: policz nawiasy klamrowe od pierwszego "{" po nazwie funkcji.
  const braceStart = content.indexOf('{', idx2);
  if (braceStart === -1) return null;
  let depth = 0, i = braceStart;
  for (; i < content.length; i++) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') { depth--; if (depth === 0) break; }
  }
  return content.slice(braceStart, i + 1).replace(/\s+/g, ' ').trim();
}

function checkCrossFileFunctionDrift() {
  checksRun++;
  for (const fnName of WATCHED_DUPLICATED_FUNCTIONS) {
    const bodies = {}; // normalizedBody -> [files]
    for (const f of HTML_FILES) {
      const content = readFile(f);
      const body = extractFunctionBody(content, fnName);
      if (!body) continue;
      bodies[body] = bodies[body] || [];
      bodies[body].push(f);
    }
    const distinctVersions = Object.keys(bodies);
    if (distinctVersions.length > 1) {
      report(
        'G-CROSS-FILE-DRIFT',
        fnName,
        `Funkcja "${fnName}" istnieje w ${distinctVersions.length} RÓŻNYCH wersjach w różnych plikach: ` +
        distinctVersions.map((_, i) => `wersja ${i + 1} w [${bodies[distinctVersions[i]].join(', ')}]`).join('; ') +
        ' — to dokładnie mechanizm, przez który poprawka trafia do jednego pliku, a 4 pozostałe zostają z błędem.'
      );
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// REGUŁA H — Podstawowa walidacja składni JS w każdym inline <script>
// ══════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════
// REGUŁA I — Agresywny polling DOM-u przez setInterval zamiast zdarzeń
// (dokładnie wzorzec z lumina-premium-video-avatar.js: setInterval(...,1200)
// skanujący cały DOM, potem powtórzony w karuzeli wideo: setInterval(...,3000).
// Za każdym razem to ten sam błąd wydajnościowy — ciągłe odpytywanie zamiast
// reagowania na realną zmianę przez MutationObserver/zdarzenia.)
// ══════════════════════════════════════════════════════════════════════════
const POLLING_INTERVAL_THRESHOLD_MS = 2000; // poniżej tego = podejrzanie agresywne

function checkAggressiveDomPolling() {
  checksRun++;
  const allFiles = [...HTML_FILES, ...JS_FILES];
  // Dopasowuje ZARÓWNO setInterval(nazwanaFunkcja, ms), JAK I setInterval(() => { ...wiele linii... }, ms)
  // — ten drugi wariant jest formą, w jakiej naprawdę wystąpił oryginalny błąd
  // (lumina-premium-video-avatar.js), więc dopasowanie samej jednej linii go nie widziało.
  const intervalRe = /setInterval\s*\(\s*(?:async\s*)?(?:function\s*\([^)]*\)|\([^)]*\)\s*=>|\w+)\s*(?:\{[\s\S]{0,600}?\}\s*)?,\s*(\d+)\s*\)/g;

  for (const f of allFiles) {
    const content = readFile(f);
    let m;
    while ((m = intervalRe.exec(content)) !== null) {
      const intervalMs = parseInt(m[1], 10);
      if (!(intervalMs > 0 && intervalMs < POLLING_INTERVAL_THRESHOLD_MS)) continue;

      const matchedText = m[0];
      const lineNum = content.slice(0, m.index).split('\n').length;

      const looksLikeMultiElementScan = /querySelectorAll|\.mount\w*\(|inject\w*(Button|Video|Avatar|Element)s?\(/i.test(matchedText);
      const looksLikeHarmlessClock = /toLocaleTimeString|getSeconds\(\)|countdown|clock|Timer(?!Interval)/i.test(matchedText);

      if (looksLikeMultiElementScan && !looksLikeHarmlessClock) {
        report(
          'I-AGGRESSIVE-DOM-POLLING',
          f,
          `Linia ${lineNum}: setInterval co ${intervalMs}ms skanujący/montujący wiele elementów DOM. ` +
          `To dokładnie wzorzec, który już dwa razy kosztował nas wydajność (video avatar engine, karuzela wideo). ` +
          `Rozważ MutationObserver albo nasłuch zdarzeń zamiast stałego odpytywania.`
        );
      }
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// REGUŁA J — Podstawianie zdjęcia konkretnej osoby w onerror="" obrazka
// (ta sama klasa błędu co reguła B, ale w formie, której B nie łapie —
// atrybut onerror, nie return/wyrażenie domyślne. Realnie znaleziony błąd:
// własny awatar użytkownika, gdy nie wczyta się z sieci, podstawiał zdjęcie
// Cezarego zamiast neutralnej ikony.)
// ══════════════════════════════════════════════════════════════════════════
// ─── K. Tożsamość zgadywana z imienia / fragmentu e-maila (2026-10-07) ───────────────────
// Realny błąd: każdy użytkownik o imieniu „Cezary”, „Wioletta”, „Andrzej” dostawał w czacie,
// komentarzach i na profilu cudzą twarz, nazwisko, wiek i miasto; e-mail zawierający „czarkes”
// dawał tożsamość Założyciela. Konta oficjalne rozpoznajemy WYŁĄCZNIE po dokładnym slugu
// lub dokładnym, zweryfikowanym e-mailu (lumina-db.js: detectLuminaOfficialIdentity).
function checkNameBasedIdentity() {
  checksRun++;
  const files = [...HTML_FILES, ...JS_FILES, ...(fs.existsSync(path.join(ROOT, 'js')) ? fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js')).map(f => path.join('js', f)) : [])];
  const pattern = /\b(sName|authorName|userDispName|displayName(?:\.toLowerCase\(\))?|email(?:\.toLowerCase\(\))?)\.includes\(\s*['"](cezary|wioletta|thiel|hamera|nazir|dowódca|czarkes|christianculture|bibliaaudio)['"]\s*\)/gi;
  for (const f of files) {
    const content = readFile(f);
    if (!content) continue;
    let m;
    while ((m = pattern.exec(content)) !== null) {
      const lineNum = content.slice(0, m.index).split('\n').length;
      report('K-NAME-BASED-IDENTITY', f,
        `Linia ${lineNum}: tożsamość ustalana z fragmentu imienia/e-maila („${m[0]}”). ` +
        `Każda osoba o tym imieniu dostanie cudzą twarz/dane/uprawnienia. Użyj dokładnego slugu albo LuminaDB.detectLuminaOfficialIdentity(user).`);
    }
  }
}

function checkOnErrorIdentitySubstitution() {
  checksRun++;
  for (const f of HTML_FILES) {
    const content = readFile(f);
    const genericPattern = /onerror=["'][^"']*\.src\s*=\s*['"]avatar_(cezary_official|wioletta_official|andrzej_thiel)[^'"]*['"]/gi;
    let m;
    while ((m = genericPattern.exec(content)) !== null) {
      const lineNum = content.slice(0, m.index).split('\n').length;
      report(
        'J-ONERROR-IDENTITY-SUBSTITUTION',
        f,
        `Linia ${lineNum}: obrazek, który przy błędzie ładowania podstawia zdjęcie konkretnej, znanej osoby ("${m[0].slice(0, 80)}..."). ` +
        `Jeśli to awatar OGÓLNEGO użytkownika (nie strony tej konkretnej osoby) — to ten sam błąd, przez który każdy widział twarz Cezarego przy własnej wiadomości. Użyj neutralnej ikony (lumina_icon.jpg).`
      );
    }
  }
}

function checkInlineScriptSyntax() {
  checksRun++;
  for (const f of HTML_FILES) {
    const content = readFile(f);
    const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
    let m, i = 0;
    while ((m = re.exec(content)) !== null) {
      const attrs = m[1];
      if (/\bsrc\s*=/.test(attrs)) continue; // zewnętrzny plik, nie ma co sprawdzać tutaj
      if (/type\s*=\s*["'](application\/ld\+json|application\/json|importmap)["']/.test(attrs)) continue; // dane, nie JS
      i++;
      // Usuń wieloliniowe importy (ES modules) przed sprawdzeniem — new Function() ich nie obsługuje.
      const code = m[2].replace(/^\s*import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"]\s*;?/gm, '')
                       .replace(/^\s*import\s+[^;{]+;\s*/gm, '');
      try {
        new Function(code);
      } catch (e) {
        report('H-JS-SYNTAX-ERROR', f, `Blok <script> #${i}: ${e.message}`);
      }
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// REGUŁA L — Integralność zasobów SPA i portali CCN (Asset Integrity Guard)
// Chroni przed awarią 404 po przebudowaniu Vite (brak git add lub brak pliku)
// ══════════════════════════════════════════════════════════════════════════
function checkCcnAssetIntegrity() {
  checksRun++;
  let trackedFilesSet;
  try {
    const gitOutput = execFileSync('git', ['ls-files', '-z'], {
      cwd: ROOT,
      encoding: 'utf8',
      windowsHide: true,
      maxBuffer: 32 * 1024 * 1024,
    });
    trackedFilesSet = new Set(gitOutput.split('\0').filter(Boolean).map(f => f.replace(/\\/g, '/')));
  } catch {
    return;
  }

  const allScanHtml = [
    ...HTML_FILES,
    ...['news/index.html', 'finanse/index.html'].filter(f => fs.existsSync(path.join(ROOT, f)))
  ];

  for (const f of allScanHtml) {
    const content = readFile(f);
    if (!content.includes('/assets/')) continue;

    const matches = content.matchAll(/(?:src|href)=["']\/assets\/([^"'?#]+)["']/g);
    for (const m of matches) {
      const assetRel = `assets/${m[1]}`.replace(/\\/g, '/');
      const assetDisk = path.join(ROOT, 'assets', m[1]);

      if (!fs.existsSync(assetDisk)) {
        report(
          'L-CCN-ASSET-INTEGRITY',
          f,
          `Odwołanie do nieistniejącego assetu na dysku: "${assetRel}". Sprawdź ścieżkę lub uruchom build.`
        );
        continue;
      }

      if (!trackedFilesSet.has(assetRel)) {
        report(
          'L-CCN-ASSET-INTEGRITY',
          f,
          `Asset "${assetRel}" istnieje na dysku, ale NIE JEST ŚLEDZONY przez Git. ` +
          `Wydanie Cloudflare Pages budowane z 'git ls-files' pominie ten plik, powodując 404 na produkcji! Uruchom 'git add ${assetRel}'.`
        );
        continue;
      }

      if (!isPublicFile(assetRel)) {
        report(
          'L-CCN-ASSET-INTEGRITY',
          f,
          `Asset "${assetRel}" jest zablokowany przez isPublicFile i nie trafi do .pages-release.`
        );
      }
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// REGUŁA M — ZAKAZ FAŁSZYWYCH ADRESÓW PATRONITE (P0 — incydent 19.11.2026)
// Oficjalny jedyny adres Patronite CC: https://patronite.pl/osobowoscplus
// ══════════════════════════════════════════════════════════════════════════
function checkForbiddenPatroniteUrls() {
  checksRun++;
  const badPatroniteRe = /patronite\.pl\/(radiocc|christian-culture|christianculture|polskieradiocc)\b/i;

  const filesToCheck = [];
  for (const f of [...HTML_FILES, ...JS_FILES]) {
    if (!/\.test\./i.test(f)) filesToCheck.push(f);
  }
  for (const rel of ['rozwazania_baza.json']) {
    if (fs.existsSync(path.join(ROOT, rel))) filesToCheck.push(rel);
  }
  for (const dirRel of ['kolejka-publikacji/kurs-codzienny', 'scripts/content', 'scripts']) {
    const dirAbs = path.join(ROOT, dirRel);
    if (!fs.existsSync(dirAbs)) continue;
    const walk = (d, prefix) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const subRel = `${prefix}/${e.name}`;
        if (e.isDirectory()) {
          if (dirRel === 'kolejka-publikacji/kurs-codzienny') walk(path.join(d, e.name), subRel);
        } else if (e.isFile()) {
          if (/\.test\./i.test(e.name)) continue;
          if ((dirRel === 'kolejka-publikacji/kurs-codzienny' && e.name === 'rozwazanie.json') ||
              (dirRel === 'scripts/content' && /^pakiet-day.*\.(md|txt|json)$/i.test(e.name)) ||
              (dirRel === 'scripts' && /^generate-day.*\.(mjs|js)$/i.test(e.name))) {
            filesToCheck.push(subRel);
          }
        }
      }
    };
    walk(dirAbs, dirRel);
  }

  for (const rel of [...new Set(filesToCheck)]) {
    const content = readFile(rel);
    const match = content.match(badPatroniteRe);
    if (match) {
      report(
        'L-PATRONITE-URL',
        rel,
        `Wykryto fałszywy/nieistniejący adres "${match[0]}". Jedynym oficjalnym linkiem jest https://patronite.pl/osobowoscplus.`
      );
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// URUCHOMIENIE WSZYSTKICH REGUŁ
// ══════════════════════════════════════════════════════════════════════════
checkCssFlexDirectionConflicts();
checkIdentityFallbackGuard();
checkForcedScrollJump();
checkDuplicateServiceWorkerRegistration();
checkMojibake();
checkUnescapedUserContent();
checkCrossFileFunctionDrift();
checkAggressiveDomPolling();
checkOnErrorIdentitySubstitution();
checkNameBasedIdentity();
checkInlineScriptSyntax();
checkCcnAssetIntegrity();
checkForbiddenPatroniteUrls();

// ══════════════════════════════════════════════════════════════════════════
// RAPORT
// ══════════════════════════════════════════════════════════════════════════
console.log(`\n🛡️  STRAŻNIK KODU — wynik audytu (${checksRun} reguł, ${HTML_FILES.length} plików HTML, ${JS_FILES.length} plików JS)\n`);

if (violations.length === 0) {
  console.log('✅ Brak naruszeń znanych klas regresji. Bezpiecznie kontynuować.');
  process.exit(0);
}

const byRule = {};
violations.forEach(v => {
  byRule[v.rule] = byRule[v.rule] || [];
  byRule[v.rule].push(v);
});

for (const [rule, items] of Object.entries(byRule)) {
  console.log(`\n🔴 [${rule}] — ${items.length} naruszeń`);
  items.forEach(v => console.log(`   • ${v.file}: ${v.detail}`));
}

console.log(`\n❌ ŁĄCZNIE: ${violations.length} naruszeń w ${Object.keys(byRule).length} kategoriach.`);
console.log('   Nie mergować / nie wdrażać, dopóki powyższe nie zostaną wyjaśnione lub naprawione.\n');
process.exit(1);
