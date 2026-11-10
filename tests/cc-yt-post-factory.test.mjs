import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FACTORY_DIR = path.join(ROOT, 'scripts', 'cc-yt-post-factory', 'CC_YT_Post_Factory');

test('CC YouTube Post Factory: weryfikacja kanałów w channels.json', () => {
  const channelsPath = path.join(FACTORY_DIR, 'channels.json');
  assert.ok(fs.existsSync(channelsPath), 'channels.json must exist');
  const channels = JSON.parse(fs.readFileSync(channelsPath, 'utf8'));
  assert.ok(Array.isArray(channels), 'channels must be an array');

  const enabled = channels.filter(c => c.enabled);
  assert.equal(enabled.length, 7, 'Exactly 7 verified channels should be enabled');

  for (const c of enabled) {
    assert.match(c.id, /^[a-z0-9-]+$/, `Valid id format: ${c.id}`);
    assert.match(c.handle, /^@[\p{L}\p{N}_+—-]+$/u, `Valid handle format: ${c.handle}`);
    assert.match(c.channel_id, /^UC[\w-]{22}$/, `Valid YouTube Channel ID: ${c.channel_id}`);
    assert.ok(c.angle && c.angle.length > 5, `Angle provided for ${c.name}`);
  }
});

test('CC YouTube Post Factory: walidacja kampanii w campaign.json', () => {
  const campaignPath = path.join(FACTORY_DIR, 'campaign.json');
  assert.ok(fs.existsSync(campaignPath), 'campaign.json must exist');
  const c = JSON.parse(fs.readFileSync(campaignPath, 'utf8'));

  assert.ok(c.id, 'Campaign must have an ID');
  assert.match(c.url, /^https:\/\/[^\s]+$/, 'Campaign URL must be valid HTTPS');
  assert.ok(c.text_pl && c.text_pl.length > 10, 'Polish text must be present');
  assert.ok(c.cta_pl, 'Polish CTA must be present');
  assert.ok(Array.isArray(c.hashtags_pl) && c.hashtags_pl.length > 0, 'Hashtags must be present');
});

test('CC YouTube Post Factory: weryfikacja wygenerowanych postów i status_publikacji.csv', () => {
  const c = JSON.parse(fs.readFileSync(path.join(FACTORY_DIR, 'campaign.json'), 'utf8'));
  const outDir = path.join(FACTORY_DIR, 'output', c.id.replace(/[^a-zA-Z0-9_-]/g, '_'));
  assert.ok(fs.existsSync(outDir), 'Output directory must exist');

  const csvPath = path.join(outDir, 'status_publikacji.csv');
  assert.ok(fs.existsSync(csvPath), 'status_publikacji.csv must exist');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  assert.match(csvContent, /kanal,uchwyt,channel_id,konto_zarzadzajace,status/);
  assert.match(csvContent, /Christian Culture TV/);
  assert.match(csvContent, /Polskie Radio CHRISTIAN CULTURE/);
  assert.match(csvContent, /Osobowość \+/);
  assert.match(csvContent, /CC Women/);
  assert.match(csvContent, /CC Men/);
  assert.match(csvContent, /Biblia Audio Christian Culture/);
  assert.match(csvContent, /Werset Dnia - Chrześcijański Serwis Biblijny/);

  // Sprawdź grafikę
  const imgPath = path.join(outDir, 'grafika.png');
  assert.ok(fs.existsSync(imgPath), 'grafika.png must exist');
  const imgStat = fs.statSync(imgPath);
  assert.ok(imgStat.size > 1000, 'grafika.png must not be empty');
  assert.ok(imgStat.size < 16_000_000, 'grafika.png must be under 16 MB');

  // Sprawdź panel
  const panelPath = path.join(outDir, 'PANEL_PUBLIKACJI.html');
  assert.ok(fs.existsSync(panelPath), 'PANEL_PUBLIKACJI.html must exist');
  const panelHtml = fs.readFileSync(panelPath, 'utf8');
  assert.ok(panelHtml.includes('CC YouTube Post Factory'), 'Panel title present');
  assert.ok(panelHtml.includes('copyPostText'), 'Clipboard function present');
  assert.ok(panelHtml.includes('exportUpdatedCSV'), 'CSV exporter present');
});
