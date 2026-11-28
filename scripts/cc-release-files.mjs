import path from 'node:path';

const BLOCKED_DIRECTORIES = new Set([
  '.git', '.codex', '.codex-remote-attachments', '.codex-attachments', '.cursor', '.claude', 'repozytoria-cc', 'joma_shared_memory',
  '.agents', '.firebase', '.gemini', '.github', '.vscode', '.wrangler', '_wydanie',
  'cloudflare', 'cloudflare-worker', 'docs', 'firebase_functions', 'functions', 'migrations', 'node_modules',
  'lib', 'patronite', 'wiadomosci-z-nieba', 'scratch', 'scripts', 'src', 'test', 'tests', 'windows_tools', 'cc-cross-channel-boost',
  // Zatwierdzone lekcje czekające na swoją datę — nigdy nie mogą trafić na stronę przed czasem.
  'kolejka-publikacji',
]);
const BLOCKED_FILES = new Set([
  '.env', '.env.example', '.firebaserc', '.gitignore', '.cc-frozen-approvals.json', 'wydanie-kanaly.log', 'agents.md', 'claude.md',
  'codex.md', 'database.rules.json', 'firebase.json', 'firebase.lumi-agent-test.json', 'firestore.indexes.json',
  'firestore.rules', 'gemini.md', 'package-lock.json', 'package.json',
  'playwright.config.ts', 'server.js', 'storage.rules', 'straznik-kodu-check.js',
  'tsconfig.json', 'validate_lumina.js', 'vite.config.ts', 'vitest.config.ts',
]);
const BLOCKED_EXTENSIONS = new Set([
  '.pem', '.key', '.p12', '.pfx',
  '.bak', '.bat', '.cjs', '.map', '.md', '.mjs', '.ps1', '.py', '.ts', '.vue',
  '.xlsx', '.yaml', '.yml',
]);
function normalized(relativePath) {
  return relativePath.replace(/\\/g, '/');
}

export function isPublicFile(relativePath) {
  if (typeof relativePath !== 'string' || relativePath.includes('\0')) return false;
  const file = normalized(relativePath);
  const lower = file.toLowerCase();
  const segments = lower.split('/');
  if (/^(?:\/|[a-z]:)/i.test(file) || segments.some(segment => !segment || segment === '.' || segment === '..')) return false;
  // Local environment, credentials and distribution state never belong on public hosting.
  const basename = path.posix.basename(lower);
  if (basename === '.env' || basename.startsWith('.env.')) return false;
  if (/service[-_]?account(?:key)?(?:[._-]|$)/.test(basename) || /(?:^|-)firebase-adminsdk(?:-|\.)/.test(basename)) return false;
  if (/^data\/whatsapp_[^/]*\.json$/.test(lower)) return false;
  if (file === 'lib/bu-voting-worker.js') return true;
  if (file === 'test/wspieraj/index.html') return true;
  if (file.startsWith('test/patronite/')) return true;
  if (file.startsWith('test/zrzutka/')) return true;
  // Silnik 2 — Oferta Wizytówek Premium CC & Patronatu Odcinków Biblii Audio (noindex do akceptacji L0).
  if (file.startsWith('test/oferta/')) return true;
  // WspieramTO v3 Multi-Active FULL PREMIUM (noindex do akceptacji L0).
  if (file.startsWith('test/wspieramto/')) return true;
  if (file.startsWith('test/wiadomosci-z-nieba/')) return true;
  if (file === 'network-pilot.html' || file === 'test/network/index.html') return true;
  if (file === 'lumina-pilot.html' || file === 'test/lumina/index.html') return true;
  if (file === 'czat-pilot.html' || file === 'test/czat/index.html') return true;
  if (file.startsWith('test/ccwomen/')) return true;
  if (file === 'test/ai/index.html') return true;
  // Wizytówki CC premium v2 — wersja testowa (noindex) do akceptacji L0 (@007 2026-11-18).
  if (file.startsWith('test/wizytowki/') || file.startsWith('test/wizytowka/')) return true;
  // Spiritual Sounds × CC — wersja testowa (noindex) do akceptacji L0 (@007 2026-11-18).
  if (file.startsWith('test/spiritual-sounds/')) return true;
  // Galeria Muzycznych E-Kartek CC — podglad testowy (noindex,nofollow).
  if (file.startsWith('test/kartki/')) return true;
  if (file === 'test/cc-youtube-boost/index.html' || file === 'test/cc-youtube-boost/data.json') return true;
  if (file === 'test/analityka/index.html') return true;
  // Adventist World P0 preview (noindex,nofollow) — PL/EN katalog + 98 profili + otwarte dane.
  if (file.startsWith('test/adventist-world/')) return true;
  // Multimedialna Wyszukiwarka CC v2 — podgląd testowy (noindex,nofollow) do akceptacji L0 i przeglądu @007.
  if (file.startsWith('test/wyszukiwarka/')) return true;
  // Portal „Odkryj Biblię — dla katolików” (/test/katolik, noindex do akceptacji L0).
  if (file.startsWith('test/katolik/')) return true;
  // Scrolluj Biblię — Głębokie studium (środowisko testowe noindex do akceptacji L0).
  if (file.startsWith('test/sba/studium/')) return true;
  if (segments.some((segment) => BLOCKED_DIRECTORIES.has(segment))) return false;
  if (BLOCKED_FILES.has(lower) || BLOCKED_FILES.has(path.posix.basename(lower))) return false;
  if (lower.includes('backup') || lower.includes('.matrix_sessions')) return false;
  if (BLOCKED_EXTENSIONS.has(path.posix.extname(lower))) return false;
  return true;
}
