import { launchStudio } from './yt_studio_session.mjs';
import path from 'node:path';
import fs from 'node:fs';

const THUMBNAIL_PATH = path.resolve('scripts/thumbnail_niepodleglosc_20261111.jpg');

const ALL_CHANNELS = [
  { name: 'Christian Culture TV',      videoId: 'D_Sy-I2Gr2Y', handle: '@ChristianCultureTV' },
  { name: 'Osobowość +',               videoId: 'n6IfxzwXBXU', handle: '@osobowoscPLUS' },
  { name: 'Polskie Radio CC',          videoId: 'AvHB8splaiA', handle: '@RadioChristianCulture' },
  { name: 'Biblia Audio CC',           videoId: 'LXF-yIcnO_g', handle: '@bibliaaudiocc' },
  { name: 'Werset Dnia',               videoId: 'UYU0ohJVqbo', handle: '@wersetdnia_ChSB' },
  { name: 'CC Women',                  videoId: 'lHPOFYvgXvM', handle: '@CCWomen7' },
  { name: 'CC Men',                    videoId: 'XlODwpFdxxA', handle: '@CCMen7' },
  { name: 'Robert Łukasz Pio',         videoId: 'pI5Ht1ntwLA', handle: '@RobertŁukaszPio' },
  { name: 'Katarzyna Fedków',          videoId: 'CIi_s5FxxKA', handle: '@katarzynafedkow' },
  { name: 'Top Seven',                 videoId: 'lQu6Bmpxn84', handle: '@TopSeven_CC' },
  { name: 'RCC TV 24',                 videoId: 'dH9DhEVUmqQ', handle: '@ToDlaCiebieGramy' },
  { name: 'CC Prayer 24',              videoId: 'iUuPLT3Oa84', handle: '@CCPrayer24' },
  { name: 'Christian Culture Network', videoId: '2NaF3LbeYRY', handle: '@ChristianCultureNetwork' },
  { name: 'CC Bible Deep',             videoId: 'FjG69sdRnCk', handle: '@CCBibleDeep' },
  { name: 'Christian Culture POP',     videoId: 'rKvkm88TBLM', handle: '@ChristianCulturePOP' },
  { name: 'Popraw Koronę',             videoId: 'rggnFJ6T32A', handle: '@PoprawKoronęCC' },
  { name: 'Worship LIVE CC',           videoId: 'z_0N_cW1NBI', handle: '@WorshipLiveCC' },
  { name: 'CC Instrumental',           videoId: 'RLKz7jBpe3c', handle: '@ChristianCultureInstrumental' },
  { name: 'CC Identity',               videoId: 'svF-TraigD8', handle: '@CCIdentityTwojaDuchowaTożsamoś' },
  { name: 'CC FILM',                   videoId: 'z1THV51DZ7M', handle: '@CCFILM77' },
  { name: 'CC Nature Sounds',          videoId: 'P0N14HWplII', handle: '@CCNatureSounds' },
  { name: 'Personality Plus',          videoId: 'G592342GYwE', handle: '@PersonalityPlusCC' }
];

async function updateAllThumbnails() {
  console.log(`Starting thumbnail mass update for ${ALL_CHANNELS.length} channels...`);
  const { ctx, page } = await launchStudio({ headless: true });
  const results = [];

  for (let i = 0; i < ALL_CHANNELS.length; i++) {
    const ch = ALL_CHANNELS[i];
    console.log(`\n[${i + 1}/${ALL_CHANNELS.length}] Updating ${ch.name} (${ch.videoId})...`);
    
    try {
      await page.goto(`https://studio.youtube.com/video/${ch.videoId}/edit`, { 
        waitUntil: 'domcontentloaded', 
        timeout: 45000 
      });
      await page.waitForTimeout(3500);

      const title = await page.title();
      if (!title.includes('Szczegóły') && !title.includes('Details')) {
        console.log(`  ⚠️ Page title unexpected: "${title}" - attempting passBrowserGate`);
        const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
        if (await gate.isVisible().catch(() => false)) {
          await gate.click();
          await page.waitForTimeout(3000);
        }
      }

      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.count() === 0) {
        console.log(`  ❌ File input not found for ${ch.name}`);
        results.push({ name: ch.name, videoId: ch.videoId, status: 'FAILED_NO_INPUT' });
        continue;
      }

      await fileInput.setInputFiles(THUMBNAIL_PATH);
      await page.waitForTimeout(2500);

      const saveBtn = page.locator('#save, ytcp-button#save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
      const isSaveEnabled = await saveBtn.isEnabled().catch(() => false);

      if (isSaveEnabled) {
        await saveBtn.click();
        await page.waitForTimeout(4000);
        console.log(`  ✅ Successfully updated thumbnail for ${ch.name}`);
        results.push({ name: ch.name, videoId: ch.videoId, status: 'SUCCESS' });
      } else {
        console.log(`  ℹ️ Save button not active (thumbnail might already be identical) for ${ch.name}`);
        results.push({ name: ch.name, videoId: ch.videoId, status: 'UNCHANGED_OR_ALREADY_SAVED' });
      }
    } catch(err) {
      console.error(`  ❌ Error updating ${ch.name}:`, err.message);
      results.push({ name: ch.name, videoId: ch.videoId, status: 'ERROR', error: err.message });
    }
  }

  await ctx.close();
  fs.writeFileSync('scripts/thumbnail_update_results.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('\n=== FINISHED THUMBNAIL UPDATE ===');
  console.log(`Total: ${results.length}, Success: ${results.filter(r => r.status === 'SUCCESS').length}`);
}

updateAllThumbnails().catch(console.error);
