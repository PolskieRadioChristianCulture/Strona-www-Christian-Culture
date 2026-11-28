#!/usr/bin/env node
// ============================================================================
// Kazania z Pasją — Codzienna automatyzacja generowania i publikacji konspektów
// Uruchomienie testowe:  node scripts/kazania/daily-sermon-automation.mjs --dry-run
// Generowanie lokalne:   node scripts/kazania/daily-sermon-automation.mjs --date=YYYY-MM-DD
// Pełna publikacja LIVE: node scripts/kazania/daily-sermon-automation.mjs --publish
// Standard: UBG-2025 (dosłowne wersety z data/bible/ubg-2025/), 28 Zasad Wiary, ZERO COST
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const MAIN_REPO = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc';
const MIRROR_REPO = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA';
const HANDOFFS_PATH = 'C:\\Users\\czark\\Desktop\\Misja CC\\JOMA_SHARED_MEMORY\\JOMA_HANDOFFS.md';
const AUTO_WORKTREE = 'D:\\_wt_kazania_auto';

const FORBIDDEN_PATTERNS = [
  /Mission Control/i,
  /B[óo]g gwarantuje Ci.*(bogactw|pieni[aą]dz|zdrowi|sukces)/i,
  /wp[łl]a[ćc].*aby otrzyma[ćc] [łl]ask/i,
  /zbawienie.*za.*wp[łl]at/i,
  /data powrotu Chrystusa/i,
  /koniec [śs]wiata nast[aą]pi (dnia|w roku)/i,
];

export function getWarsawDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

export function extractVerbatimUbgVerses(rootDir, chapterId, verseStart, verseEnd) {
  const file = path.join(rootDir, 'data', 'bible', 'ubg-2025', `${chapterId}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Brak pliku biblijnego UBG-2025: ${file}`);
  }
  const chapter = JSON.parse(fs.readFileSync(file, 'utf8'));
  const selected = (chapter.verses || []).filter(
    (v) => v.number >= verseStart && v.number <= verseEnd
  );
  if (!selected.length) {
    throw new Error(`Brak wersetów ${verseStart}-${verseEnd} w ${chapterId}`);
  }
  return {
    book: chapter.book,
    chapter: chapter.chapter,
    verses: selected.map((v) => ({ v: v.number, text: v.text })),
  };
}

export function pickNextPericope(plan, existingSermons) {
  const usedSlugs = new Set((existingSermons || []).map((s) => s.planSlug || s.id));
  const usedChapters = new Set(
    (existingSermons || []).map((s) => `${s.chapterId}:${s.verseStart || ''}:${s.verseEnd || ''}`)
  );
  const candidate = plan.find(
    (p) => !usedSlugs.has(p.slug) && !usedChapters.has(`${p.chapterId}:${p.verseStart}:${p.verseEnd}`)
  );
  if (candidate) return candidate;
  return plan[(existingSermons || []).length % plan.length];
}

export function validateSermonCompliance(sermon, verbatimVerses) {
  const errors = [];
  if (!sermon || typeof sermon !== 'object') {
    return ['Brak obiektu konspektu.'];
  }
  const requiredStrings = [
    'title',
    'desc',
    'objective',
    'historicalContext',
    'literaryContext',
    'exegesis',
    'introduction',
    'illustration',
    'christocentric',
    'apply',
    'callToAction',
    'reflectionQuestion',
    'bibliography',
  ];
  for (const field of requiredStrings) {
    if (typeof sermon[field] !== 'string' || sermon[field].trim().length < 8) {
      errors.push(`Brak lub zbyt krótkie pole: ${field}`);
    }
  }
  if (!Array.isArray(sermon.points) || sermon.points.length < 3) {
    errors.push('Wymagane co najmniej 3 punkty kazania.');
  }
  if (!Array.isArray(sermon.relatedVerses) || sermon.relatedVerses.length < 2) {
    errors.push('Wymagane co najmniej 2 teksty powiązane.');
  }
  if (!Array.isArray(verbatimVerses) || !verbatimVerses.length) {
    errors.push('Brak wersetów UBG-2025.');
  }
  const allText = JSON.stringify(sermon);
  for (const re of FORBIDDEN_PATTERNS) {
    if (re.test(allText)) {
      errors.push(`Naruszenie reguły zgodności (${re.source})`);
    }
  }
  return errors;
}

export function buildDeterministicOutline(pericope, verbatim, dateStr) {
  const verses = verbatim.verses || [];
  const firstText = verses[0] ? verses[0].text : '';
  const midText = verses[Math.floor(verses.length / 2)] ? verses[Math.floor(verses.length / 2)].text : firstText;
  const lastText = verses[verses.length - 1] ? verses[verses.length - 1].text : firstText;

  return {
    id: `${pericope.slug}-${dateStr}`,
    planSlug: pericope.slug,
    title: pericope.focusTheme.split(' — ')[0].slice(0, 110),
    ref: pericope.refLabel,
    chapterId: pericope.chapterId,
    verseStart: pericope.verseStart,
    verseEnd: pericope.verseEnd,
    cat: pericope.cat,
    series: pericope.series,
    desc: `Studium homiletyczne na podstawie ${pericope.refLabel}: ${pericope.focusTheme}.`,
    objective: `Doprowadzić słuchaczy do głębszego poznania Chrystusa i praktycznej odpowiedzi wiary w oparciu o fragment ${pericope.refLabel}.`,
    historicalContext: `Fragment pochodzi z księgi „${verbatim.book}” (rozdział ${verbatim.chapter}), przekazanej wspólnocie wierzących w konkretnym momencie historii zbawienia jako wezwanie do wierności Bogu.`,
    literaryContext: `Perykopa ${pericope.refLabel} stanowi spójną całość myślową akcentującą działanie Bożej łaski, prawdy Słowa oraz odpowiedź ludzkiego serca.`,
    exegesis: `Analizowany tekst otwiera się wyznaniem: „${firstText}”. W centrum rozważania wybrzmiewa prawda: „${midText}”, prowadząc do konkluzji opartej na świadectwie wersetu końcowego: „${lastText}”.`,
    introduction: `Codzienne zmagania i pytania o sens kierują nasze spojrzenie ku niezawodnemu Słowu Bożemu. Fragment ${pericope.refLabel} stawia przed nami żywego Boga i Jego obietnicę.`,
    keyVerses: verses.slice(0, 6),
    points: [
      `Boże objawienie i prawda tekstu w ${pericope.refLabel} („${firstText.slice(0, 90)}…”).`,
      `Centrum przesłania wiary i zaufania Panu („${midText.slice(0, 90)}…”).`,
      `Owoc posłuszeństwa i nadziei w życiu ucznia Chrystusa („${lastText.slice(0, 90)}…”).`,
    ],
    relatedVerses: ['2 Tymoteusza 3:16–17', 'Ewangelia Jana 5:39', 'List do Rzymian 15:4'],
    illustration: `Podobnie jak podróżnik w ciemności ufa latarni wskazującej pewny brzeg, tak wierzący opiera decyzje nie na zmiennych emocjach, lecz na niezmiennym świadectwie Pisma Świętego.`,
    christocentric: `Całe Pismo świadczy o Jezusie Chrystusie — w świetle krzyża i zmartwychwstania obietnice z ${pericope.refLabel} znajdują w Nim swoje pewne „Tak” i „Amen”.`,
    apply: `Poświęć dziś 10 minut na cichą modlitwę nad ${pericope.refLabel} i przekuj jedno zdanie z tego fragmentu w konkretny gest miłości lub wierności.`,
    callToAction: `Powierz dziś swoje serce Chrystusowi i przyjmij Słowo z ${pericope.refLabel} jako światło dla swojego domu oraz służby.`,
    reflectionQuestion: `Które słowo z ${pericope.refLabel} najbardziej wzywa mnie dziś do nawrócenia, pokoju lub odważniejszego świadectwa?`,
    bibliography: `Pismo Święte: Uwspółcześniona Biblia Gdańska (UBG-2025), ${pericope.refLabel} · Ekosystem Christian Culture (polskieradio.cc/mojabiblia).`,
    pdf: '',
    mp3: '',
    isDemo: false,
    publishedDate: dateStr,
    source: 'daily-auto',
    bookUrl: '/mojabiblia',
  };
}

function loadGeminiKeys(rootDir) {
  const keys = [];
  const addKey = (val) => {
    const clean = String(val || '').trim().replace(/^["']|["']$/g, '');
    if (clean && clean.startsWith('AIza') && !keys.includes(clean)) keys.push(clean);
  };
  const keyNames = [
    'GEMINI_API_KEY',
    'GEMINI_API_KEY_KONCEPT',
    'GEMINI_API_KEY_BACKUP_1',
    'GEMINI_API_KEY_BACKUP_2',
    'GEMINI_API_KEY_BACKUP_3',
    'GEMINI_API_KEY_BACKUP_4',
  ];
  for (const name of keyNames) addKey(process.env[name]);
  for (const base of [rootDir, MAIN_REPO]) {
    const envPath = path.join(base, '.env');
    if (!fs.existsSync(envPath)) continue;
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/^(GEMINI_API_KEY[A-Z0-9_]*)=(.+)$/);
      if (m && keyNames.includes(m[1])) addKey(m[2]);
    }
  }
  return keys;
}

async function generateWithGemini(pericope, verbatim, dateStr, rootDir) {
  const keys = loadGeminiKeys(rootDir);
  if (!keys.length) return null;

  const versesBlock = verbatim.verses.map((v) => `${v.v}. ${v.text}`).join('\n');
  const prompt = [
    'Jesteś doświadczonym kaznodzieją i teologiem biblijnym ekosystemu Christian Culture.',
    'Napisz głęboki, duszpasterski, chrystocentryczny konspekt kazania w języku polskim wierny Pismu Świętemu (28 Zasad Wiary Kościoła Bożego).',
    `Perykopa: ${pericope.refLabel} (UBG-2025)`,
    `Temat przewodni: ${pericope.focusTheme}`,
    `Kategoria: ${pericope.cat} | Seria: ${pericope.series}`,
    'Dosłowny tekst UBG-2025:',
    versesBlock,
    '',
    'Zwróć WYŁĄCZNIE poprawny JSON z polami:',
    '{',
    '  "title": "krótki, poruszający tytuł kazania po polsku (4-8 słów)",',
    '  "desc": "jednoznaczne streszczenie kazania (1-2 zdania)",',
    '  "objective": "cel duszpasterski i homiletyczny",',
    '  "historicalContext": "kontekst historyczny księgi i sytuacji adresatów",',
    '  "literaryContext": "kontekst literacki i miejsce perykopy w rozdziale",',
    '  "exegesis": "zwięzła egzegeza kluczowych myśli fragmentu z poszanowaniem tekstu UBG",',
    '  "introduction": "angażujące wprowadzenie nawiązujące do codziennego życia",',
    '  "points": ["1. ...", "2. ...", "3. ..."],',
    '  "relatedVerses": ["Księga rozdział:werset", "Księga rozdział:werset", "Księga rozdział:werset"],',
    '  "illustration": "krótka, życiowa ilustracja wspierająca przesłanie",',
    '  "christocentric": "chrystocentryczne przesłanie ukazujące dzieło Jezusa Chrystusa",',
    '  "apply": "konkretne zastosowanie praktyczne na dziś",',
    '  "callToAction": "ciepły apel końcowy zapraszający do odpowiedzi wiary",',
    '  "reflectionQuestion": "jedna osobista myśl / pytanie do refleksji",',
    '  "bibliography": "Uwspółcześniona Biblia Gdańska (UBG-2025), wskazany fragment + źródło studium"',
    '}',
    'ZAKAZ ewangelii sukcesu/bogactwa za wpłaty, zakaz wyznaczania dat powrotu Chrystusa, zakaz zwrotu Mission Control.',
  ].join('\n');

  for (const key of keys) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.65 },
          }),
          signal: AbortSignal.timeout(25000),
        }
      );
      if (!res.ok) continue;
      const payload = await res.json();
      const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = JSON.parse(rawText);
      const candidate = {
        id: `${pericope.slug}-${dateStr}`,
        planSlug: pericope.slug,
        title: String(parsed.title || '').trim(),
        ref: pericope.refLabel,
        chapterId: pericope.chapterId,
        verseStart: pericope.verseStart,
        verseEnd: pericope.verseEnd,
        cat: pericope.cat,
        series: pericope.series,
        desc: String(parsed.desc || '').trim(),
        objective: String(parsed.objective || '').trim(),
        historicalContext: String(parsed.historicalContext || '').trim(),
        literaryContext: String(parsed.literaryContext || '').trim(),
        exegesis: String(parsed.exegesis || '').trim(),
        introduction: String(parsed.introduction || '').trim(),
        keyVerses: verbatim.verses.slice(0, 6),
        points: Array.isArray(parsed.points) ? parsed.points.map((x) => String(x).trim()).slice(0, 5) : [],
        relatedVerses: Array.isArray(parsed.relatedVerses)
          ? parsed.relatedVerses.map((x) => String(x).trim()).slice(0, 5)
          : [],
        illustration: String(parsed.illustration || '').trim(),
        christocentric: String(parsed.christocentric || '').trim(),
        apply: String(parsed.apply || '').trim(),
        callToAction: String(parsed.callToAction || '').trim(),
        reflectionQuestion: String(parsed.reflectionQuestion || '').trim(),
        bibliography: String(parsed.bibliography || '').trim(),
        pdf: '',
        mp3: '',
        isDemo: false,
        publishedDate: dateStr,
        source: 'daily-auto',
        bookUrl: '/mojabiblia',
      };
      const errs = validateSermonCompliance(candidate, candidate.keyVerses);
      if (!errs.length) {
        return candidate;
      }
    } catch {
      // kolejna próba z zapasowym kluczem
    }
  }
  return null;
}

export function applySermonToRepo(rootDir, sermon, dateStr) {
  const catalogPath = path.join(rootDir, 'kazania', 'data', 'kazania.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  catalog.sermons = (catalog.sermons || []).filter((s) => s.id !== sermon.id && s.publishedDate !== dateStr);
  catalog.sermons.unshift(sermon);
  catalog.updatedAt = dateStr;
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');

  // Synchronizuj JSON-LD ItemList w kazania/index.html
  const htmlPath = path.join(rootDir, 'kazania', 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  const itemListElements = catalog.sermons.slice(0, 12).map((s, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: `${s.title} (${s.ref})`,
    url: `https://polskieradio.cc/kazania/#k-${s.id}`,
  }));
  const ldRegex = /("mainEntity":\s*\{\s*"@type":\s*"ItemList",\s*"itemListElement":\s*)\[[\s\S]*?\](\s*\})/;
  if (ldRegex.test(html)) {
    html = html.replace(ldRegex, (_, p1, p2) => p1 + JSON.stringify(itemListElements, null, 10).replace(/\n\]$/, '\n        ]') + p2);
    fs.writeFileSync(htmlPath, html, 'utf8');
  }

  // Aktualizacja wyszukiwarki @w (identyczne bajt-po-bajcie pliki)
  const searchPath = path.join(rootDir, 'szukaj', 'catalog.json');
  const mirrorSearchPath = path.join(rootDir, 'data', 'cc-search-index.json');
  const searchData = JSON.parse(fs.readFileSync(searchPath, 'utf8'));
  const entryUrl = `https://polskieradio.cc/kazania/#k-${sermon.id}`;
  searchData.items = searchData.items || [];
  if (!searchData.items.some((i) => i.url === entryUrl)) {
    searchData.items.push({
      title: `${sermon.title} — Kazania z Pasją (${sermon.ref})`,
      category: 'Biblia i formacja',
      url: entryUrl,
      description: `${sermon.desc} Przekład UBG-2025, seria: ${sermon.series}.`,
      tags: ['kazania', 'konspekt', sermon.cat, sermon.series, sermon.ref, 'ubg'].map((x) => String(x).toLowerCase()),
      featured: false,
    });
  }
  searchData.totalItems = searchData.items.length;
  searchData.updatedAt = new Date().toISOString();
  fs.writeFileSync(searchPath, JSON.stringify(searchData, null, 2) + '\n', 'utf8');
  fs.copyFileSync(searchPath, mirrorSearchPath);

  // Aktualizacja Mapy Ekosystemu @m
  const mapPath = path.join(rootDir, 'data', 'ecosystem-map.json');
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const mapTopic = `Kazania z Pasją (/kazania/) — codzienna publikacja konspektu (${dateStr}): „${sermon.title}” (${sermon.ref}, UBG-2025)`;
  mapData.updatesLog = mapData.updatesLog || [];
  if (!mapData.updatesLog.some((u) => u.topic === mapTopic)) {
    mapData.updatesLog.unshift({ date: dateStr, topic: mapTopic, agent: 'A' });
  }
  mapData.lastUpdated = dateStr;
  fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2) + '\n', 'utf8');

  // Aktualizacja daty w sitemaps/pages.xml
  const sitemapPath = path.join(rootDir, 'sitemaps', 'pages.xml');
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  sitemap = sitemap.replace(
    /(<loc>https:\/\/polskieradio\.cc\/kazania\/<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,
    `$1${dateStr}$2`
  );
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
}

function runGit(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', windowsHide: true, maxBuffer: 32 * 1024 * 1024 }).trim();
}

function safeRemoveWorktree(wtPath) {
  const junction = path.join(wtPath, 'node_modules');
  if (fs.existsSync(junction)) {
    execFileSync('cmd', ['/c', 'rmdir', junction], { windowsHide: true });
  }
  if (fs.existsSync(junction)) {
    throw new Error(`Nie udało się odpiąć dowiązania node_modules w ${wtPath}`);
  }
  if (fs.existsSync(wtPath)) {
    runGit(MAIN_REPO, ['worktree', 'remove', '--force', wtPath]);
  }
}

async function runDailyOnce(rootDir, opts) {
  const catalogPath = path.join(rootDir, 'kazania', 'data', 'kazania.json');
  const planPath = path.join(rootDir, 'scripts', 'kazania', 'sermon-plan.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8')).pericopes;
  const dateStr = opts.date || getWarsawDate();

  if (!opts.force && (catalog.sermons || []).some((s) => s.publishedDate === dateStr)) {
    return { status: 'already_published_today', date: dateStr };
  }

  const pericope = pickNextPericope(plan, catalog.sermons);
  const verbatim = extractVerbatimUbgVerses(rootDir, pericope.chapterId, pericope.verseStart, pericope.verseEnd);

  let sermon = null;
  let mode = 'deterministic';
  if (!opts.noAi) {
    sermon = await generateWithGemini(pericope, verbatim, dateStr, rootDir);
    if (sermon) mode = 'gemini';
  }
  if (!sermon) {
    sermon = buildDeterministicOutline(pericope, verbatim, dateStr);
  }

  const compliance = validateSermonCompliance(sermon, sermon.keyVerses);
  if (compliance.length) {
    throw new Error(`Bramka zgodności przerwała publikację: ${compliance.join('; ')}`);
  }

  if (opts.dryRun) {
    return { status: 'dry_run_ok', date: dateStr, mode, sermonId: sermon.id, title: sermon.title, ref: sermon.ref };
  }

  applySermonToRepo(rootDir, sermon, dateStr);
  return { status: 'updated', date: dateStr, mode, sermonId: sermon.id, title: sermon.title, ref: sermon.ref };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const noAi = args.includes('--no-ai');
  const publish = args.includes('--publish');
  const dateArg = args.find((a) => a.startsWith('--date='));
  const date = dateArg ? dateArg.slice('--date='.length) : '';

  if (!publish) {
    const result = await runDailyOnce(process.cwd(), { dryRun, force, noAi, date });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Tryb --publish: czysty worktree D:\_wt_kazania_auto -> testy -> commit -> 2x push -> deploy -> LUMINA -> JOMA
  safeRemoveWorktree(AUTO_WORKTREE);
  runGit(MAIN_REPO, ['fetch', 'lumina-repo', 'main']);
  runGit(MAIN_REPO, ['fetch', 'origin', 'main']);
  runGit(MAIN_REPO, ['worktree', 'add', '--detach', AUTO_WORKTREE, 'lumina-repo/main']);
  try {
    execFileSync('cmd', ['/c', 'mklink', '/J', path.join(AUTO_WORKTREE, 'node_modules'), path.join(MAIN_REPO, 'node_modules')], { windowsHide: true });
    runGit(AUTO_WORKTREE, ['checkout', '-b', `kazania-auto-${Date.now()}`]);
    const res = await runDailyOnce(AUTO_WORKTREE, { dryRun: false, force, noAi, date });
    if (res.status === 'already_published_today') {
      console.log(JSON.stringify(res, null, 2));
      return;
    }

    execFileSync('node', ['--test', 'scripts/kazania.test.mjs'], { cwd: AUTO_WORKTREE, stdio: 'inherit', windowsHide: true });
    execFileSync('node', ['--test', 'scripts/ccn-discovery-runtime.test.mjs'], { cwd: AUTO_WORKTREE, stdio: 'inherit', windowsHide: true });
    execFileSync('node', ['straznik-kodu-check.js'], { cwd: AUTO_WORKTREE, stdio: 'inherit', windowsHide: true });

    const files = [
      'kazania/data/kazania.json',
      'kazania/index.html',
      'szukaj/catalog.json',
      'data/cc-search-index.json',
      'data/ecosystem-map.json',
      'sitemaps/pages.xml',
    ];
    runGit(AUTO_WORKTREE, ['add', ...files]);
    runGit(AUTO_WORKTREE, ['commit', '-m', `feat(kazania): codzienny konspekt ${res.date} — ${res.title}`]);
    const sha = runGit(AUTO_WORKTREE, ['rev-parse', 'HEAD']);
    runGit(AUTO_WORKTREE, ['push', 'lumina-repo', 'HEAD:main']);
    runGit(AUTO_WORKTREE, ['push', 'origin', 'HEAD:main']);
    runGit(AUTO_WORKTREE, ['fetch', 'lumina-repo', 'main']);
    runGit(AUTO_WORKTREE, ['fetch', 'origin', 'main']);
    runGit(AUTO_WORKTREE, ['checkout', '--detach', 'lumina-repo/main']);
    execFileSync('node', ['scripts/safe_pages_deploy.mjs'], { cwd: AUTO_WORKTREE, stdio: 'inherit', windowsHide: true });

    for (const rel of files) {
      fs.mkdirSync(path.dirname(path.join(MIRROR_REPO, rel)), { recursive: true });
      fs.copyFileSync(path.join(AUTO_WORKTREE, rel), path.join(MIRROR_REPO, rel));
    }

    if (fs.existsSync(HANDOFFS_PATH)) {
      const entry = `\n---\n\n## [${res.date} Auto] Kazania z Pasją — codzienny konspekt\n\n- **Status:** \`done\` (${res.mode})\n- **Konspekt:** „${res.title}” (${res.ref}, \`${res.sermonId}\`)\n- **Commit:** \`${sha}\`\n`;
      fs.appendFileSync(HANDOFFS_PATH, entry, 'utf8');
    }

    console.log(JSON.stringify({ ...res, sha }, null, 2));
  } finally {
    safeRemoveWorktree(AUTO_WORKTREE);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
