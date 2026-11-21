#!/usr/bin/env node
/**
 * CC GLOBAL AUTOPROMOTER (EN) — Faza 2
 * Round-robin generator & dispatcher dla globalnych treści EN Christian Culture.
 * Zero-Cost: rotuje po data/global_promo_catalog.json i zapisuje stan w data/global_promo_state.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(ROOT, 'data', 'global_promo_catalog.json');
const STATE_PATH = path.join(ROOT, 'data', 'global_promo_state.json');

export function getNextGlobalPromoPost() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const state = fs.existsSync(STATE_PATH)
    ? JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'))
    : { lastIndex: -1, totalDispatched: 0, lastPostedAt: null };

  const nextIdx = (state.lastIndex + 1) % catalog.items.length;
  const item = catalog.items[nextIdx];
  const utmUrl = `${item.url}${item.url.includes('?') ? '&' : '?'}utm_source=social&utm_medium=autopromo&utm_campaign=cc_global_en`;
  const postText = `🌍 ${item.title}\n\n${item.cta} 👉 ${utmUrl}\n\n${item.hashtags.join(' ')}`;

  return { nextIdx, item, postText, state };
}

if (process.argv[1] && path.basename(process.argv[1]) === 'cc-global-autopromoter.mjs') {
  const { nextIdx, item, postText, state } = getNextGlobalPromoPost();
  console.log('=== CC GLOBAL AUTOPROMOTER (EN) ===');
  console.log(`Slot #${nextIdx + 1}: ${item.id}`);
  console.log(postText);

  if (process.argv.includes('--commit-state')) {
    fs.writeFileSync(STATE_PATH, JSON.stringify({
      lastIndex: nextIdx,
      lastItemId: item.id,
      totalDispatched: (state.totalDispatched || 0) + 1,
      lastPostedAt: new Date().toISOString(),
    }, null, 2), 'utf8');
    console.log('✅ Zaktualizowano data/global_promo_state.json');
  }
}
