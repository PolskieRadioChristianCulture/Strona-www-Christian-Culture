#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Sprawdź czy uv/python jest dostępny do uruchomienia generowania grafiki
try {
  execFileSync('uv', ['run', '--with', 'pillow', 'python', path.join(__dirname, 'build.py')], {
    cwd: ROOT,
    stdio: 'inherit',
    windowsHide: true,
  });
} catch (err) {
  console.error('Błąd uruchomienia build.py przez uv run:', err.message);
  process.exit(1);
}
