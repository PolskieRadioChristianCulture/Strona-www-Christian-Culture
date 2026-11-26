import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const REPO_ROOT = path.resolve(__dirname, '..');
export const DEFAULT_JOMA_FEEDBACK_OUT =
  process.env.JOMA_FEEDBACK_OUT ||
  'C:\\Users\\czark\\Desktop\\Misja CC\\JOMA_SHARED_MEMORY\\AI_DLA_JEZUSA_FEEDBACK_DIGEST.md';

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?\d[\d\s\-()]{6,}\d)/g;
const SECRET_RE = /(?:Bearer\s+\S+|AIza[0-9A-Za-z_-]{20,}|sk-[0-9A-Za-z_-]{16,}|ghp_[0-9A-Za-z]{20,})/gi;

const KIND_LABELS = {
  opinion: '💬 Opinia',
  thumbs_up: '👍 Łapka w górę',
  thumbs_down: '👎 Łapka w dół',
  favorite: '★ Ulubione'
};

/**
 * Scrub control characters, emails, phone numbers, and token patterns before storing in JOMA.
 */
export function scrubForJoma(raw, maxLen = 400) {
  return String(raw ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(SECRET_RE, '[SECRET_REDACTED]')
    .replace(EMAIL_RE, '[EMAIL_REDACTED]')
    .replace(PHONE_RE, '[PHONE_REDACTED]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

/**
 * Format scrubbed text for safe placement inside a Markdown table cell.
 */
export function mdCell(raw, maxLen = 220) {
  const cleaned = scrubForJoma(raw, maxLen).replace(/\|/g, '\\|');
  return cleaned || '—';
}

/**
 * Parse JSON stdout produced by `wrangler d1 execute ... --json`, ignoring any leading CLI banner.
 */
export function parseWranglerD1Json(stdout) {
  const text = String(stdout || '').trim();
  if (!text) return [];

  const candidates = [];
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '[' || ch === '{') candidates.push(i);
  }

  for (const idx of candidates) {
    const slice = text.slice(idx);
    try {
      const parsed = JSON.parse(slice);
      if (Array.isArray(parsed)) {
        const first = parsed[0];
        if (first && Array.isArray(first.results)) return first.results;
        return parsed;
      }
      if (parsed && Array.isArray(parsed.results)) {
        return parsed.results;
      }
    } catch {
      // Keep scanning until a valid JSON payload start is found.
    }
  }

  throw new Error('Could not parse JSON output from wrangler d1 execute.');
}

function isPriorityIssue(row) {
  const kind = String(row?.kind || '');
  const category = String(row?.category || '');
  const rating = row?.rating === null || row?.rating === undefined ? null : Number(row.rating);
  return (
    kind === 'thumbs_down' ||
    category === 'blad' ||
    category === 'za_dluga' ||
    (kind === 'opinion' && rating !== null && Number.isFinite(rating) && rating <= 3)
  );
}

/**
 * Aggregate KPIs, category/model breakdowns, and prioritized issue lists from D1 rows.
 */
export function computeFeedbackStats(rows = [], totalsRow = null) {
  const list = Array.isArray(rows) ? rows : [];
  const byCategory = {};
  const byModel = {};
  const priorityIssues = [];
  const opinionsWithText = [];
  const positives = [];

  let rowThumbsUp = 0;
  let rowThumbsDown = 0;
  let rowFavorites = 0;
  let rowOpinions = 0;
  let ratingSum = 0;
  let ratingCount = 0;

  for (const row of list) {
    const kind = String(row?.kind || '');
    const category = String(row?.category || 'brak') || 'brak';
    const modelId = String(row?.model_id || 'auto') || 'auto';
    const rating = row?.rating === null || row?.rating === undefined ? null : Number(row.rating);

    byCategory[category] = (byCategory[category] || 0) + 1;
    byModel[modelId] = (byModel[modelId] || 0) + 1;

    if (kind === 'thumbs_up') rowThumbsUp += 1;
    else if (kind === 'thumbs_down') rowThumbsDown += 1;
    else if (kind === 'favorite') rowFavorites += 1;
    else if (kind === 'opinion') {
      rowOpinions += 1;
      opinionsWithText.push(row);
      if (rating !== null && Number.isFinite(rating)) {
        ratingSum += rating;
        ratingCount += 1;
      }
    }

    if (isPriorityIssue(row)) {
      priorityIssues.push(row);
    } else if (kind === 'thumbs_up' || kind === 'favorite' || (kind === 'opinion' && (rating === null || rating >= 4))) {
      positives.push(row);
    }
  }

  const hasTotals = totalsRow && Number.isFinite(Number(totalsRow.total));
  const avgFromRows = ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 100) / 100 : null;
  const avgFromTotals =
    hasTotals && totalsRow.avg_rating !== null && totalsRow.avg_rating !== undefined
      ? Math.round(Number(totalsRow.avg_rating) * 100) / 100
      : null;

  return {
    total: hasTotals ? Number(totalsRow.total) || 0 : list.length,
    thumbsUp: hasTotals ? Number(totalsRow.thumbs_up) || 0 : rowThumbsUp,
    thumbsDown: hasTotals ? Number(totalsRow.thumbs_down) || 0 : rowThumbsDown,
    favorites: hasTotals ? Number(totalsRow.favorites) || 0 : rowFavorites,
    opinions: hasTotals ? Number(totalsRow.opinions) || 0 : rowOpinions,
    avgRating: hasTotals ? avgFromTotals : avgFromRows,
    byCategory,
    byModel,
    priorityIssues,
    opinionsWithText,
    positives
  };
}

function formatWarsawTime(iso) {
  try {
    return new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Warsaw',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
      .format(new Date(iso))
      .replace(' ', 'T');
  } catch {
    return String(iso || '—');
  }
}

function formatDateCell(createdAt) {
  if (!createdAt) return '—';
  return `${formatWarsawTime(createdAt)} CET`;
}

function formatBreakdown(record) {
  const entries = Object.entries(record || {}).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (!entries.length) return 'brak danych';
  return entries.map(([k, v]) => `\`${scrubForJoma(k, 60)}\`: **${v}**`).join(' · ');
}

/**
 * Render an anonymized Polish Markdown digest for private JOMA shared memory.
 */
export function renderJomaFeedbackDigest({ rows = [], totalsRow = null, generatedAt = new Date().toISOString(), limit = 200 }) {
  const stats = computeFeedbackStats(rows, totalsRow);
  const generatedWarsaw = formatWarsawTime(generatedAt);
  const avgLabel = stats.avgRating !== null ? `${stats.avgRating} ★` : '—';

  const lines = [
    '# AI dla Jezusa — Raport Opinii i Reakcji (D1 -> JOMA)',
    '',
    '> **PRYWATNE @joma — NIE PUBLIKOWAĆ** (brak surowych e-maili, telefonów i sekretów).',
    `- **Wygenerowano (Europe/Warsaw):** ${generatedWarsaw}`,
    `- **Wygenerowano (UTC):** ${generatedAt}`,
    '- **Źródło:** Cloudflare D1 (`ai-cost-db` / tabela `ai_feedback`)',
    `- **Zakres ostatnich wierszy:** ${rows.length} (limit: ${limit})`,
    '- **Odświeżanie:** `npm.cmd run ai:feedback:sync`',
    '',
    '## Podsumowanie KPI',
    '',
    '| Łącznie | 👍 Łapki w górę | 👎 Łapki w dół | ★ Ulubione | 💬 Opinie | Średnia ocena ★ |',
    '|---:|---:|---:|---:|---:|---:|',
    `| ${stats.total} | ${stats.thumbsUp} | ${stats.thumbsDown} | ${stats.favorites} | ${stats.opinions} | ${avgLabel} |`,
    '',
    `- **Kategorie:** ${formatBreakdown(stats.byCategory)}`,
    `- **Modele:** ${formatBreakdown(stats.byModel)}`,
    '',
    '## 🚨 Priorytet do poprawy',
    ''
  ];

  if (!stats.priorityIssues.length) {
    lines.push('Brak zgłoszeń negatywnych / błędów w badanym zakresie.');
  } else {
    lines.push('| Data (CET) | Typ | Ocena | Kategoria | Model | Pytanie | Komentarz | Fragment odpowiedzi |');
    lines.push('|---|---|---:|---|---|---|---|---|');
    for (const row of stats.priorityIssues) {
      const ratingCell = row?.rating ? `${row.rating}★` : '—';
      const kindLabel = KIND_LABELS[row?.kind] || mdCell(row?.kind, 40);
      lines.push(
        `| ${formatDateCell(row?.created_at)} | ${kindLabel} | ${ratingCell} | ${mdCell(row?.category, 40)} | ${mdCell(row?.model_id, 50)} | ${mdCell(row?.prompt_excerpt, 140)} | ${mdCell(row?.comment, 220)} | ${mdCell(row?.reply_excerpt, 180)} |`
      );
    }
  }

  lines.push('', '## 💬 Opinie użytkowników', '');
  if (!stats.opinionsWithText.length) {
    lines.push('Brak opisowych opinii w badanym zakresie.');
  } else {
    lines.push('| Data (CET) | Ocena | Kategoria | Model | Tryb | Pytanie | Komentarz |');
    lines.push('|---|---:|---|---|---|---|---|');
    for (const row of stats.opinionsWithText) {
      const ratingCell = row?.rating ? `${row.rating}★` : '—';
      lines.push(
        `| ${formatDateCell(row?.created_at)} | ${ratingCell} | ${mdCell(row?.category, 40)} | ${mdCell(row?.model_id, 50)} | ${mdCell(row?.mode, 40)} | ${mdCell(row?.prompt_excerpt, 140)} | ${mdCell(row?.comment, 260)} |`
      );
    }
  }

  const reactions = rows.filter((row) => row?.kind !== 'opinion');
  lines.push('', '## 👍★ Ostatnie reakcje (łapki i ulubione)', '');
  if (!reactions.length) {
    lines.push('Brak reakcji łapek/gwiazdek w badanym zakresie.');
  } else {
    lines.push('| Data (CET) | Reakcja | Asystent | Model | Pytanie |');
    lines.push('|---|---|---|---|---|');
    for (const row of reactions) {
      const kindLabel = KIND_LABELS[row?.kind] || mdCell(row?.kind, 40);
      lines.push(
        `| ${formatDateCell(row?.created_at)} | ${kindLabel} | ${mdCell(row?.assistant_id, 40)} | ${mdCell(row?.model_id, 50)} | ${mdCell(row?.prompt_excerpt, 160)} |`
      );
    }
  }

  lines.push('', `## Wszystkie ostatnie wpisy (limit: ${limit})`, '');
  if (!rows.length) {
    lines.push('Tabela `ai_feedback` nie zawiera jeszcze żadnych wpisów.');
  } else {
    lines.push('| Data (CET) | Typ | Ocena | Kategoria | Model | Pytanie | Komentarz |');
    lines.push('|---|---|---:|---|---|---|---|');
    for (const row of rows) {
      const ratingCell = row?.rating ? `${row.rating}★` : '—';
      const kindLabel = KIND_LABELS[row?.kind] || mdCell(row?.kind, 40);
      lines.push(
        `| ${formatDateCell(row?.created_at)} | ${kindLabel} | ${ratingCell} | ${mdCell(row?.category, 40)} | ${mdCell(row?.model_id, 50)} | ${mdCell(row?.prompt_excerpt, 120)} | ${mdCell(row?.comment, 180)} |`
      );
    }
  }

  lines.push('');
  return lines.join('\n');
}

function runWranglerSql(sql, { repoRoot = REPO_ROOT } = {}) {
  const singleLineSql = String(sql || '').replace(/\s+/g, ' ').trim();
  const baseArgs = ['d1', 'execute', 'ai-cost-db', '--remote', '--json', '--command', singleLineSql, '--yes'];
  const stdout =
    process.platform === 'win32'
      ? execFileSync('cmd.exe', ['/d', '/s', '/c', 'wrangler.cmd', ...baseArgs], {
          cwd: repoRoot,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe']
        })
      : execFileSync('wrangler', baseArgs, {
          cwd: repoRoot,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe']
        });
  return parseWranglerD1Json(stdout);
}

export function parseCliArgs(argv = []) {
  let limit = 200;
  let outPath = DEFAULT_JOMA_FEEDBACK_OUT;
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--limit' && argv[i + 1]) {
      const parsed = Number.parseInt(argv[i + 1], 10);
      if (!Number.isFinite(parsed) || parsed < 1 || parsed > 1000) {
        throw new Error('--limit must be an integer between 1 and 1000.');
      }
      limit = parsed;
      i += 1;
    } else if (arg === '--out' && argv[i + 1]) {
      outPath = path.resolve(argv[i + 1]);
      i += 1;
    }
  }

  return { limit, outPath, dryRun };
}

export function runSync({ limit = 200, outPath = DEFAULT_JOMA_FEEDBACK_OUT, dryRun = false, repoRoot = REPO_ROOT } = {}) {
  const safeLimit = Math.max(1, Math.min(1000, Math.trunc(Number(limit) || 200)));

  const totalsSql = [
    'SELECT',
    '  COUNT(*) AS total,',
    "  SUM(CASE WHEN kind = 'thumbs_up' THEN 1 ELSE 0 END) AS thumbs_up,",
    "  SUM(CASE WHEN kind = 'thumbs_down' THEN 1 ELSE 0 END) AS thumbs_down,",
    "  SUM(CASE WHEN kind = 'favorite' THEN 1 ELSE 0 END) AS favorites,",
    "  SUM(CASE WHEN kind = 'opinion' THEN 1 ELSE 0 END) AS opinions,",
    "  ROUND(AVG(CASE WHEN kind = 'opinion' AND rating IS NOT NULL THEN rating END), 2) AS avg_rating",
    'FROM ai_feedback;'
  ].join('\n');

  const rowsSql = [
    'SELECT id, created_at, kind, rating, category, comment, assistant_id, mode, model_id, prompt_excerpt, reply_excerpt',
    'FROM ai_feedback',
    'ORDER BY created_at DESC',
    `LIMIT ${safeLimit};`
  ].join('\n');

  const totalsResults = runWranglerSql(totalsSql, { repoRoot });
  const rows = runWranglerSql(rowsSql, { repoRoot });
  const totalsRow = totalsResults[0] || null;
  const generatedAt = new Date().toISOString();
  const markdown = renderJomaFeedbackDigest({ rows, totalsRow, generatedAt, limit: safeLimit });

  if (!dryRun) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const tmpOut = `${outPath}.tmp-${process.pid}-${Date.now()}`;
    fs.writeFileSync(tmpOut, markdown, 'utf8');
    fs.renameSync(tmpOut, outPath);
  }

  const stats = computeFeedbackStats(rows, totalsRow);
  return { outPath, dryRun, stats, rowCount: rows.length, markdown };
}

function main() {
  const opts = parseCliArgs(process.argv.slice(2));
  const res = runSync(opts);
  const modeLabel = res.dryRun ? '[dry-run] ' : '';
  console.log(
    `${modeLabel}AI dla Jezusa feedback sync OK: total=${res.stats.total}, opinions=${res.stats.opinions}, thumbs_up=${res.stats.thumbsUp}, thumbs_down=${res.stats.thumbsDown}, favorites=${res.stats.favorites}, out=${res.outPath}`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
