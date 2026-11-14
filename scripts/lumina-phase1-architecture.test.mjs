import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

test('Phase 1 manifest-lumina.json points cleanly to LUMINA PWA identity', () => {
  const manifest = JSON.parse(readText('manifest-lumina.json'));
  const rootManifest = JSON.parse(readText('manifest.json'));
  const lumiManifest = JSON.parse(readText('manifest-lumi.json'));
  assert.equal(manifest.id, '/lumina-app');
  assert.equal(manifest.name, 'LUMINA — Christian Culture');
  assert.equal(manifest.short_name, 'LUMINA');
  assert.equal(manifest.start_url, '/lumina?source=pwa');
  assert.notEqual(manifest.id, rootManifest.id);
  assert.notEqual(manifest.id, lumiManifest.id);
});

test('Phase 1 <meta charset> precedes scripts inside <head> on LUMINA HTML surfaces', () => {
  const surfaces = [
    'lumina.html',
    'lumina-tablica.html',
    'lumina-tablica-light.html',
    'lumina-profile.html',
    'lumina-shorts.html',
    'lumina-login.html',
    'lumina-safety.html',
    'lumina-app.html',
    'lumina.cezaryrgowski.html',
    'lumina.wiolettarogowska.html',
    'lumina.mariusz.html',
    'lumina.andrzejthiel.html',
    'rolki.html',
  ];
  for (const rel of surfaces) {
    const html = readText(rel);
    const headIdx = html.search(/<head\b/i);
    const charsetIdx = html.search(/<meta\s+charset=/i);
    const firstScriptIdx = html.search(/<script\b/i);
    assert.ok(headIdx !== -1 && charsetIdx > headIdx, `${rel}: missing <meta charset> after <head>`);
    if (firstScriptIdx !== -1) {
      assert.ok(charsetIdx < firstScriptIdx, `${rel}: <meta charset> must precede first <script>`);
    }
  }
});

test('Phase 1 shared shell CSS extracted and loaded before lumina-profile-standard.css', () => {
  const sharedCss = readText('css/lumina-shared-shell.css');
  assert.match(sharedCss, /\.lumina-nav\s*\{/);
  assert.match(sharedCss, /\.card-new-badge\s*\{[^}]*\}/);
  assert.match(sharedCss, /\.lumina-quick-actions-modal\s*\{/);

  const targets = [
    'lumina.html',
    'lumina-tablica.html',
    'lumina-tablica-light.html',
    'lumina-profile.html',
    'lumina.cezaryrgowski.html',
    'lumina.wiolettarogowska.html',
  ];
  for (const rel of targets) {
    const html = readText(rel);
    assert.match(html, /\/css\/lumina-shared-shell\.css/, `${rel}: missing shared shell CSS link`);
    if (rel === 'lumina-profile.html' || (rel.startsWith('lumina.') && rel !== 'lumina.html')) {
      const sharedPos = html.indexOf('/css/lumina-shared-shell.css');
      const stdPos = html.indexOf('/css/lumina-profile-standard.css');
      assert.ok(sharedPos !== -1 && stdPos !== -1 && sharedPos < stdPos, `${rel}: shared shell CSS must precede standard CSS`);
    }
  }
});

test('Phase 1 cache _headers and _worker.js profile OG crawler configured cleanly', () => {
  const headers = readText('_headers');
  assert.match(headers, /\/assets\/\*\.js\s+Cache-Control:\s*public,\s*max-age=31536000,\s*immutable/);
  assert.match(headers, /\/js\/lumina-db\/\*\s+Cache-Control:\s*public,\s*max-age=0,\s*must-revalidate/);
  assert.match(headers, /\/css\/lumina-shared-shell\.css\s+Cache-Control:\s*public,\s*max-age=0,\s*must-revalidate/);

  const worker = readText('_worker.js');
  assert.match(worker, /async function handleSocialProfileCrawler\s*\(/);
  assert.match(worker, /decodedP === '\/lumina-profile'[\s\S]*handleSocialProfileCrawler/);
});

test('Phase 1 image assets have valid magic bytes (no corrupted UTF-8 replacement bytes)', () => {
  const imgs = ['lumina_hero_main.jpg', 'avatar_andrzej_thiel.webp', 'lumina_hero_group.webp', 'avatar_dorota.webp'];
  for (const rel of imgs) {
    const buf = fs.readFileSync(path.join(ROOT, rel));
    const headHex = buf.subarray(0, 6).toString('hex');
    assert.ok(!headHex.startsWith('efbfbd'), `${rel}: still has corrupted replacement chars (${headHex})`);
    if (rel.endsWith('.jpg')) {
      assert.equal(buf[0], 0xff);
      assert.equal(buf[1], 0xd8);
    } else if (rel.endsWith('.webp')) {
      assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF');
      assert.equal(buf.subarray(8, 12).toString('ascii'), 'WEBP');
    }
  }
});

test('Phase 1 lumina-db submodules load cleanly in Node without DOM and export expected helpers', async () => {
  const media = await import('../js/lumina-db/media-links.js');
  assert.equal(media.extractYouTubeId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(typeof media.configureMediaLinks, 'function');
  assert.throws(() => media.escapeHtml('<script>'), /configureMediaLinks/);
  media.configureMediaLinks({ escapeHtml: (s) => String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;') });
  assert.equal(media.escapeHtml('<script>'), '&lt;script&gt;');
  assert.ok(media.LUMINA_HANDLES.cezaryrgowski);

  const badges = await import('../js/lumina-db/badges.js');
  assert.ok(badges.LUMINA_BADGES_CATALOG.prayer_flame);
  assert.equal(typeof badges.configureBadgesModule, 'function');

  const devotional = await import('../js/lumina-db/devotional-feed.js');
  assert.match(devotional.formatLuminaDevotionalContent('**Pokój** z https://www.cclite.pl'), /Telewizja CC Lite/);

  const lounge = await import('../js/lumina-db/live-lounge.js');
  assert.ok(Array.isArray(lounge.KURS_MALZENSKI_EPISODES));
  assert.equal(typeof lounge.LuminaLivePrayer.triggerPrayNow, 'function');

  const mission = await import('../js/lumina-db/mission-accounts.js');
  assert.ok(mission.MISSION_BROADCAST_CHANNELS.cezary_rogowski);
  assert.ok(mission.getMissionAccounts().length >= 3);

  const facade = readText('lumina-db.js');
  assert.match(facade, /from '\.\/js\/lumina-db\/media-links\.js'/);
  assert.match(facade, /from '\.\/js\/lumina-db\/badges\.js'/);
  assert.match(facade, /from '\.\/js\/lumina-db\/devotional-feed\.js'/);
  assert.match(facade, /from '\.\/js\/lumina-db\/live-lounge\.js'/);
  assert.match(facade, /from '\.\/js\/lumina-db\/mission-accounts\.js'/);
  assert.ok(Buffer.byteLength(facade, 'utf8') < 410 * 1024, 'lumina-db.js stayed under 410 KB after modularization');
});
