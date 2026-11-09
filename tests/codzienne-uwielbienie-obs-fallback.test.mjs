import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// @007 09.11.2026 — awaria 16:00: YouTube nie startował w OBS, ekran „Kliknij…” = cisza na antenie.
test('codzienne-uwielbienie-live: w OBS bez ekranu kliknięcia, dźwięk zastępczy gdy YouTube nie gra', () => {
  const root = path.resolve(import.meta.dirname, '..');
  const html = fs.readFileSync(path.join(root, 'codzienne-uwielbienie-live.html'), 'utf8');
  assert.match(html, /id="ccWorshipFallbackAudio"/, 'Element audio dźwięku zastępczego');
  assert.match(html, /window\.obsstudio/, 'Wykrywanie OBS');
  assert.match(html, /\/worship_playlist\.json/, 'Źródło: własna playlista Instrumental Worship');
  assert.match(html, /NOT_PLAYING_LIMIT_MS = 8000/, 'Próg 8 s bez grającego YouTube');
  assert.match(html, /function stopFallback\(\)/, 'Wyłączenie dźwięku zastępczego, gdy YouTube wróci');
  const playlist = JSON.parse(fs.readFileSync(path.join(root, 'worship_playlist.json'), 'utf8'));
  assert.ok(Array.isArray(playlist) && playlist.length >= 10, 'Playlista zastępcza ma utwory');
  for (const t of playlist.slice(0, 5)) {
    const file = decodeURIComponent(t.url.replace(/^\.\//, ''));
    assert.ok(fs.existsSync(path.join(root, file)), `Plik utworu istnieje: ${file}`);
  }
});
