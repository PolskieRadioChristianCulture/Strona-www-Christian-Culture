import path from 'node:path';

const BLOCKED_DIRECTORIES = new Set([
  '.git', '.codex', '.codex-remote-attachments', '.codex-attachments', '.cursor', '.claude', 'repozytoria-cc', 'joma_shared_memory',
  '.agents', '.firebase', '.gemini', '.github', '.vscode', '.wrangler', '_wydanie',
  'cloudflare', 'cloudflare-worker', 'docs', 'firebase_functions', 'functions', 'migrations', 'node_modules',
  'lib', 'scratch', 'scripts', 'src', 'test', 'tests', 'windows_tools', 'cc-cross-channel-boost',
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
  if (file === 'network-pilot.html' || file === 'test/network/index.html') return true;
  if (file.startsWith('test/ccwomen/')) return true;
  // Spiritual Sounds × CC — wersja testowa (noindex) do akceptacji L0 (@007 2026-11-18).
  if (file.startsWith('test/spiritual-sounds/')) return true;
  if (file === 'test/cc-youtube-boost/index.html' || file === 'test/cc-youtube-boost/data.json') return true;
  if (segments.some((segment) => BLOCKED_DIRECTORIES.has(segment))) return false;
  if (BLOCKED_FILES.has(lower) || BLOCKED_FILES.has(path.posix.basename(lower))) return false;
  if (lower.includes('backup') || lower.includes('.matrix_sessions')) return false;
  if (BLOCKED_EXTENSIONS.has(path.posix.extname(lower))) return false;
  return true;
}
