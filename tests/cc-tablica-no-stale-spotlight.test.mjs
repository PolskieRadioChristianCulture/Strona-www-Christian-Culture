import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_CC = path.resolve(__dirname, '..');

const TABLICA_FILES = ['lumina-tablica.html', 'lumina-tablica-light.html'];

test('Tablica LUMINA HTML: brak wymuszonego przypięcia starego posta AI/Antychryst na pozycji 0 i etykiety Dzisiaj', () => {
  for (const rel of TABLICA_FILES) {
    const html = fs.readFileSync(path.join(ROOT_CC, rel), 'utf8');

    assert.equal(
      html.includes("time: 'Dzisiaj • 👑 Główna Publikacja Założyciela'") ||
        html.includes('"time": "Dzisiaj • 👑 Główna Publikacja Założyciela"'),
      false,
      `${rel} nie może zawierać na stałe wpisanej etykiety Dzisiaj dla starego artykułu`
    );

    assert.equal(
      /if\s*\(\s*!\s*topSharedOrFlagship\s*\)\s*\{[\s\S]{0,400}post_art_ai_si_antychryst_cezary_rogowski/.test(html),
      false,
      `${rel} nie może posiadać fallbacku przypinającego post_art_ai_si_antychryst_cezary_rogowski nad Dobrze, że jesteś`
    );

    assert.equal(
      /isAiAntychryst[\s\S]{0,600}_sortTs:\s*Date\.now\(\)\s*\+\s*1000000000/.test(html),
      false,
      `${rel} nie może sztucznie zawyżać _sortTs przez Date.now() + 1000000000 dla AI/Antychryst`
    );

    assert.ok(
      html.includes('function isFreshRecentPost('),
      `${rel} musi zawierać strażnika świeżości isFreshRecentPost() dla cache lumina_recent_published_post`
    );

    assert.equal(
      html.includes('lumina-community-posts.js?v=20261004_ai_antychryst_v2'),
      false,
      `${rel} nie może ładować starego klucza cache Cloudflare ?v=20261004_ai_antychryst_v2`
    );
  }
});

test('Cloudflare _headers & profil założyciela: brak starego cache ?v=20261004_ai_antychryst_v2 i wymuszone max-age=0', () => {
  const headers = fs.readFileSync(path.join(ROOT_CC, '_headers'), 'utf8');
  assert.ok(
    /\/js\/lumina-community-posts\.js\*[\s\S]{0,120}max-age=0,\s*must-revalidate/.test(headers),
    '_headers musi wyłączać 7-dniowy cache edge dla /js/lumina-community-posts.js*'
  );

  const profileHtml = fs.readFileSync(path.join(ROOT_CC, 'lumina.cezaryrgowski.html'), 'utf8');
  assert.equal(
    profileHtml.includes('lumina-community-posts.js?v=20261004_ai_antychryst_v2'),
    false,
    'lumina.cezaryrgowski.html nie może ładować starego klucza cache ?v=20261004_ai_antychryst_v2'
  );
});

test('Tablica LUMINA HTML: wszystkie klasyczne skrypty inline parsują się bez błędów składniowych', () => {
  for (const rel of TABLICA_FILES) {
    const html = fs.readFileSync(path.join(ROOT_CC, rel), 'utf8');
    const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
    let checked = 0;

    for (let i = 0; i < scripts.length; i += 1) {
      const tag = scripts[i][0];
      const body = scripts[i][1];
      if (!body.trim()) continue;
      if (/type\s*=\s*["']module["']/i.test(tag)) continue;
      assert.doesNotThrow(
        () => new vm.Script(body, { filename: `${rel}#script_${i}` }),
        `${rel} skrypt #${i} zawiera błąd składniowy`
      );
      checked += 1;
    }

    assert.ok(checked > 0, `${rel} powinien zawierać skrypty inline do walidacji`);
  }
});

test('js/lumina-community-posts.js: historyczne artykuły (AI/Antychryst, 95 Tez Lutra) mają historyczne daty i brak flag spotlight', () => {
  const postsJs = fs.readFileSync(path.join(ROOT_CC, 'js/lumina-community-posts.js'), 'utf8');

  const aiMatch = postsJs.match(
    /\{\s*"id":\s*"post_art_ai_si_antychryst_cezary_rogowski"[\s\S]*?\n\s*\}/
  );
  assert.ok(aiMatch, 'Brak wpisu post_art_ai_si_antychryst_cezary_rogowski w js/lumina-community-posts.js');

  const aiBlock = aiMatch[0];
  assert.ok(
    /"time":\s*"4 października 2026/.test(aiBlock),
    'post_art_ai_si_antychryst_cezary_rogowski musi mieć datę historyczną (4 października 2026)'
  );
  assert.equal(/Dzisiaj|Przed chwilą/i.test(aiBlock), false, 'Artykuł z 4.10 nie może mieć etykiety Dzisiaj ani Przed chwilą');
  assert.equal(/_isTopSpotlight|_isFreshSpotlight|_isNewlyPublished/.test(aiBlock), false, 'Artykuł z 4.10 nie może mieć flag spotlight/newlyPublished');

  const lutherMatch = postsJs.match(
    /\{\s*"id":\s*"post_art_95_tez_marcina_lutra_1517"[\s\S]*?\n\s*\}/
  );
  assert.ok(lutherMatch, 'Brak wpisu post_art_95_tez_marcina_lutra_1517 w js/lumina-community-posts.js');
  const lutherBlock = lutherMatch[0];
  assert.ok(
    /"time":\s*"31 października 2026/.test(lutherBlock),
    'post_art_95_tez_marcina_lutra_1517 musi mieć datę historyczną (31 października 2026)'
  );
  assert.equal(/Dzisiaj|Przed chwilą/i.test(lutherBlock), false, 'Artykuł z 31.10 nie może mieć etykiety Dzisiaj ani Przed chwilą');
});
