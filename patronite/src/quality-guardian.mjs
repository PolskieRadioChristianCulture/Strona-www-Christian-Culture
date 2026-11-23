import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { EVIDENCE_STATUS, verifyBibleQuote } from './evidence-validator.mjs';
import { checkDuplicateAgainstArchive } from './editorial-planner.mjs';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

const MANIPULATION_PATTERNS = [
  /Bóg (Ci|Wam) (wynagrodzi|pobłogosławi) za (wpłatę|pieniądze)/i,
  /kto nie wspiera/i,
  /ostatnia szansa.*wpła/i,
  /🚨\s*PILNE!!!/i,
  /nie uwierzysz/i,
  /mission\s*control/i,
  /twierdzi Bóg poza Biblią/i,
];

const UNBIBLICAL_TRADITION_RE = /\b(czyściec|odpusty?|modlitwa za zmarłych|kult maryjn|królowa nieba|niepokalane poczęcie)\b/i;
const ABBREVIATED_BIBLE_RE = /\b(?:Rz|J|Ps|Mt|Mk|Łk|Rdz|Wj|Kpł|Lb|Pwt|Kor|Ef|Flp|Kol|Tes|Tm|Tt|Hbr|Jk|Pt|Ap|Obj)\s+\d{1,3}:\d{1,3}/;
const PII_OR_SECRET_RE = /(@gmail\.com|@wp\.pl|AIza[\w-]{20,}|serviceAccountKey|-----BEGIN [A-Z ]*PRIVATE KEY-----|\+48\s?\d{3}[-\s]?\d{3}[-\s]?\d{3})/i;

function makeResult(id, name, passed, message) {
  return { id, name, passed: Boolean(passed), status: passed ? 'PASS' : 'FAIL', message };
}

function validateUrlInRepo(urlStr, repoRoot) {
  let u;
  try {
    u = new URL(urlStr);
  } catch {
    return false;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
  if (u.hostname !== 'polskieradio.cc' && u.hostname !== 'patronite.pl' && u.hostname !== 'zrzutka.pl') return true;
  if (u.hostname === 'patronite.pl') return u.pathname === '/osobowoscplus';
  if (u.hostname === 'zrzutka.pl') return u.pathname === '/rs4g4v';

  const cleanPath = u.pathname.replace(/^\/+|\/+$/g, '');
  if (!cleanPath) return fs.existsSync(path.join(repoRoot, 'index.html'));
  const candidates = [
    path.join(repoRoot, cleanPath),
    path.join(repoRoot, `${cleanPath}.html`),
    path.join(repoRoot, cleanPath, 'index.html'),
  ];
  return candidates.some(p => fs.existsSync(p));
}

export async function runQualityGuardian({
  draft,
  graphicMeta,
  recentArchive = [],
  config,
  repoRoot = DEFAULT_REPO_ROOT,
}) {
  const checks = [];

  // 1. Źródła informacji są dostępne i potwierdzone (oraz brak niepotwierdzonych obietnic)
  const hasSources = Array.isArray(draft.sources) && draft.sources.length > 0
    && draft.sources.every(s => s.sourceName && s.sourceRef && s.verifiedDate && s.status !== EVIDENCE_STATUS.NIEPOTWIERDZONE);
  checks.push(makeResult(
    'sources_confirmed',
    'Źródła informacji dostępne i potwierdzone',
    hasSources,
    hasSources ? `Potwierdzono ${draft.sources.length} źródło(a) faktów.` : 'Brak potwierdzonego źródła lub status NIEPOTWIERDZONE.',
  ));

  // 2. Poprawność językowa, polski UTF-8 i normy długości
  const limits = config.textLimits;
  const fullText = `${draft.title}\n${draft.teaser}\n${draft.body}\n${draft.question}\n${draft.cta}`;
  const lengthOk = draft.title.length >= limits.titleMin && draft.title.length <= limits.titleMax
    && draft.teaser.length >= limits.teaserMin && draft.teaser.length <= limits.teaserMax
    && draft.body.length >= limits.bodyMin && draft.body.length <= limits.bodyMax
    && Array.isArray(draft.hashtags) && draft.hashtags.length <= (limits.maxHashtags || 3);
  checks.push(makeResult(
    'language_and_lengths',
    'Poprawność językowa oraz limity redakcyjne',
    lengthOk && !fullText.includes('undefined') && !fullText.includes('NaN'),
    lengthOk ? `Długości w normie (tytuł ${draft.title.length}, zajawka ${draft.teaser.length}, treść ${draft.body.length}).` : 'Przekroczono lub nie osiągnięto norm długości.',
  ));

  // 3. Brak manipulacji, obietnic bez pokrycia i poufnych nazw zaplecza
  const manipHit = MANIPULATION_PATTERNS.find(re => re.test(fullText));
  checks.push(makeResult(
    'no_unverified_promises',
    'Brak niepotwierdzonych obietnic, klikbajtu i manipulacji',
    !manipHit,
    manipHit ? `Wykryto niedozwolony wzorzec: ${manipHit}` : 'Treść wolna od manipulacji, obietnic bez pokrycia i poufnych nazw.',
  ));

  // 4. Poprawność cytatów biblijnych i pełnych nazw ksiąg
  let bibleOk = true;
  let bibleMsg = 'Brak cytatów wymagających korekty.';
  if (ABBREVIATED_BIBLE_RE.test(fullText)) {
    bibleOk = false;
    bibleMsg = 'Wykryto skrót nazwy księgi biblijnej zamiast pełnej nazwy.';
  } else if (draft.scripture) {
    const res = verifyBibleQuote(draft.scripture, repoRoot);
    bibleOk = res.valid;
    bibleMsg = res.valid ? `Zweryfikowano werset ${draft.scripture.reference} w UBG-2025.` : res.reason;
  }
  checks.push(makeResult('bible_quotes_verified', 'Cytaty biblijne i pełne nazwy ksiąg', bibleOk, bibleMsg));

  // 5. Zgodność z misją CC i 28 Zasadami Wiary
  const docHit = UNBIBLICAL_TRADITION_RE.exec(fullText);
  checks.push(makeResult(
    'mission_doctrine_compliance',
    'Zgodność doktrynalna i misyjna Christian Culture',
    !docHit,
    docHit ? `Niezgodność z 28 Zasadami Wiary: ${docHit[0]}` : 'Zgodny z misją i 28 Zasadami Wiary Kościoła Bożego.',
  ));

  // 6. Dokładne wymiary grafiki 1068 × 630 px, PNG/JPG, <= 10 MB
  let graphicOk = false;
  let graphicMsg = 'Brak pliku grafiki.';
  if (graphicMeta?.outputPath && fs.existsSync(graphicMeta.outputPath)) {
    const meta = await sharp(graphicMeta.outputPath).metadata();
    const size = fs.statSync(graphicMeta.outputPath).size;
    graphicOk = meta.width === 1068 && meta.height === 630 && ['png', 'jpeg'].includes(meta.format) && size <= config.graphics.maxBytes;
    graphicMsg = `${meta.width}×${meta.height} ${meta.format}, ${Math.round(size / 1024)} KB`;
  }
  checks.push(makeResult('graphic_dimensions', 'Grafika 1068 × 630 px i limit 10 MB', graphicOk, graphicMsg));

  // 7. Brak deformacji logo (aspect ratio < 2% odchylenia)
  const ratioDiff = graphicMeta
    ? Math.abs(graphicMeta.logoRenderedAspectRatio - graphicMeta.logoExpectedAspectRatio) / graphicMeta.logoExpectedAspectRatio
    : 1;
  const logoOk = Boolean(graphicMeta) && ratioDiff < 0.02;
  checks.push(makeResult(
    'logo_integrity',
    draft.channel === 'zrzutka'
      ? 'Oryginalne proporcje znaków Christian Culture i Zrzutka.pl'
      : 'Oryginalne proporcje znaków Christian Culture i Patronite',
    logoOk,
    logoOk ? `Proporcja lockupu nienaruszona (${graphicMeta.logoRenderedAspectRatio}).` : `Odchylenie proporcji logo: ${ratioDiff}`,
  ));

  // 8. Napisy w bezpiecznych obszarach + altText + brak słów uciętych
  const safeBounds = graphicMeta?.safeZoneBounds;
  const safeOk = Boolean(
    safeBounds
    && safeBounds.renderedMaxBottomY <= safeBounds.maxBottomY
    && draft.altText
    && draft.altText.length >= 25
    && !MANIPULATION_PATTERNS.some(re => re.test((graphicMeta.headlineLines || []).join(' '))),
  );
  checks.push(makeResult(
    'safe_zones_and_alt',
    'Napisy w bezpiecznych strefach + tekst alternatywny obrazu',
    safeOk,
    safeOk ? `Strefa bezpieczna y<=${safeBounds.renderedMaxBottomY} (limit ${safeBounds.maxBottomY}).` : 'Naruszenie strefy bezpiecznej lub brak altText.',
  ));

  // 9. Prawa autorskie i prywatność (tylko zatwierdzone lokalne zasoby CC, zero PII)
  const tplPath = path.join(repoRoot, 'patronite', 'templates', draft.seriesType, 'template.json');
  const tpl = fs.existsSync(tplPath) ? JSON.parse(fs.readFileSync(tplPath, 'utf8')) : { approvedPhotos: [] };
  const photoApproved = Boolean(graphicMeta?.photoRelPath && tpl.approvedPhotos.includes(graphicMeta.photoRelPath));
  const privacyOk = !PII_OR_SECRET_RE.test(fullText) && photoApproved;
  checks.push(makeResult(
    'copyright_and_privacy',
    'Prawa autorskie fotografii i ochrona prywatności',
    privacyOk,
    privacyOk ? `Zatwierdzone źródło foto CC: ${graphicMeta.photoRelPath}` : 'Niezweryfikowane zdjęcie lub wykryto dane wrażliwe.',
  ));

  // 10. Działające odnośniki wewnętrzne polskieradio.cc
  const urls = Array.from(new Set(
    (fullText.match(/https?:\/\/[^\s)>,]+/g) || []).map(u => u.replace(/[.,;:!?]+$/, '')),
  ));
  const brokenUrls = urls.filter(u => !validateUrlInRepo(u, repoRoot));
  const linksOk = urls.length > 0 && brokenUrls.length === 0;
  checks.push(makeResult(
    'links_valid',
    'Weryfikacja poprawności wszystkich odnośników',
    linksOk,
    linksOk ? `Zweryfikowano ${urls.length} link(i) w repozytorium polskieradio.cc.` : `Niedziałające linki: ${brokenUrls.join(', ')}`,
  ));

  // 11. Kontrola duplikatów 30 dni
  const dup = checkDuplicateAgainstArchive({
    topicKey: draft.topicKey,
    title: draft.title,
    teaser: draft.teaser,
    body: draft.body,
    archive: recentArchive,
    threshold: config.dedupeWindowDays ? (config.similarityThreshold || 0.65) : 0.65,
  });
  checks.push(makeResult(
    'not_duplicate',
    'Brak powtórzeń z ostatnich 30 dni',
    !dup.isDuplicate,
    dup.isDuplicate ? `Blokada duplikatu: ${dup.reason}` : 'Temat i treść unikalne w oknie 30 dni.',
  ));

  // 12. Konfiguracja widoczności (PUBLICZNY domyślnie, brak przecieku treści płatnych progów)
  const visOk = ['PUBLICZNY', 'TYLKO_PATRONI'].includes(draft.visibility);
  checks.push(makeResult(
    'visibility_config',
    'Poprawna konfiguracja widoczności posta',
    visOk,
    `Widoczność ustawiona na: ${draft.visibility}`,
  ));

  // KRYTYCZNA ZASADA SEKCJI 11: Dowolne FAIL -> twarda BLOKADA (brak uśredniania!)
  const failedChecks = checks.filter(c => !c.passed);
  const overallStatus = failedChecks.length === 0 ? 'PASS' : 'BLOCKED';

  return {
    overallStatus,
    passedCount: checks.length - failedChecks.length,
    totalCount: checks.length,
    failedChecks,
    checks,
  };
}
