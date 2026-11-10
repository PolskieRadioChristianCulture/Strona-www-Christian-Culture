import fs from 'node:fs';
import path from 'node:path';

const TEXT_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.txt', '.webmanifest', '.xml']);
const SECRET_PATTERNS = [
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
  /["']refresh_token["']\s*:/i,
  /["']client_secret["']\s*:/i,
  /CLOUDFLARE_API_TOKEN\s*[:=]\s*["'][^"']+/i,
];

// Every selected file must be checked. An incomplete scan cannot approve a release.
// Errors report only the relative path, never file content or the matched value.
export function scanReleaseForSecrets(root, { fileSystem = fs } = {}) {
  function checked(operation, file) {
    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        return operation();
      } catch (err) {
        if (attempt < 9) {
          const end = Date.now() + 100;
          while (Date.now() < end) {}
        }
      }
    }
    throw new Error(`Wydanie przerwane: nie można sprawdzić ${path.relative(root, file) || '.'}.`);
  }
  function scan(directory) {
    const entries = checked(() => fileSystem.readdirSync(directory, { withFileTypes: true }), directory);
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Wydanie przerwane: niedozwolone dowiązanie ${path.relative(root, absolute)}.`);
      if (entry.isDirectory()) { scan(absolute); continue; }
      if (!TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
      if (!entry.isFile()) throw new Error(`Wydanie przerwane: niedozwolony typ pliku ${path.relative(root, absolute)}.`);
      // Read one file at a time, including large catalogues previously skipped at 5 MB.
      const content = checked(() => fileSystem.readFileSync(absolute, 'utf8'), absolute);
      if (SECRET_PATTERNS.some(pattern => pattern.test(content))) {
        throw new Error(`Wydanie przerwane: wykryto sekret w ${path.relative(root, absolute)}.`);
      }
    }
  }
  scan(root);
}
