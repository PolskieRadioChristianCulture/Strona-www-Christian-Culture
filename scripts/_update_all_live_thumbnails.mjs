import { chromium } from 'playwright';
import fs from 'node:fs';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_cc.jpg';

// Video IDs of all channels that have active/scheduled live streams
const LIVE_VIDEOS = [
  { name: 'Biblia Audio CC', vid: 'D5xjIVdKR9A', via: '@osobowośćPLUS' },
  { name: 'Werset Dnia', vid: 'iDiJiW-qfAQ', via: '@osobowośćPLUS' },
  { name: 'CC Women', vid: 'A5biQPq-bsQ', via: '@CCWomen7' },
  { name: 'CC Men', vid: 'XlODwpFdxxA', via: '@CCMen7' },
  { name: 'Robert Łukasz Pio', vid: 'ByEuYclTd4M', via: '@RobertŁukaszPio' },
  { name: 'Katarzyna Fedków', vid: 'u1Iny6jRLAI', via: '@katarzynafedkow' },
  { name: 'Top Seven', vid: 'PwYoiuZQjRk', via: '@TopSeven_CC' },
  { name: 'RCC TV 24', vid: 'IrYrb8FEtS0', via: '@ToDlaCiebieGramy' },
  { name: 'CC Prayer 24', vid: 'yj3sCNOMPlQ', via: '@CCPrayer24' },
  { name: 'Christian Culture Network', vid: 'BAfb1NAFTas', via: '@ChristianCultureNetwork' },
  { name: 'CC Bible Deep', vid: 'p5akurwvWBw', via: '@CCBibleDeep' },
  { name: 'Christian Culture POP', vid: 'GiaqqNtqrEw', via: '@ChristianCulturePOP' },
  { name: 'Popraw Koronę', vid: 'rQc39HZNLJ8', via: '@PoprawKoronęCC' },
  { name: 'Worship LIVE CC', vid: 'VRgMVF1AuU4', via: '@WorshipLiveCC' },
  { name: 'CC Instrumental', vid: 'DDTZ3_mPEyQ', via: '@ChristianCultureInstrumental' },
  { name: 'CC Identity', vid: 'rLwsKlRTPZQ', via: '@CCIdentityTwojaDuchowaTożsamoś' },
  { name: 'CC FILM', vid: '85wMAW3FIGg', via: '@CCFILM77' },
  { name: 'CC Nature Sounds', vid: 'nGNhOONPSUY', via: '@CCNatureSounds' },
  { name: 'Personality Plus', vid: 'G592342GYwE', via: '@PersonalityPlusCC' },
  { name: 'Christian Culture TV', vid: 'D_Sy-I2Gr2Y', via: '@ChristianCultureTV' },
  { name: 'Polskie Radio CC', vid: 'AvHB8splaiA', via: '@osobowośćPLUS' }
];

const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();

let currentVia = null;
async function ensureAccount(via) {
  if (currentVia === via) return;
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1000);
  const target = via.replace('@', '');
  const item = page.locator('ytd-account-item-renderer', { hasText: target }).first();
  if (await item.count()) {
    await item.click();
    await page.waitForTimeout(3000);
    currentVia = via;
  }
}

async function updateThumbForVideo(item) {
  console.log(`\n--- ${item.name} (${item.vid}) ---`);
  try {
    await ensureAccount(item.via);
    await page.goto(`https://studio.youtube.com/video/${item.vid}/edit`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
    if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(4000); }

    let fileSet = false;
    const directInput = page.locator('input[type="file"][accept*="image"]').first();
    if (await directInput.count()) {
      await directInput.setInputFiles(THUMBNAIL_PATH);
      fileSet = true;
    } else {
      const optionsBtn = page.locator('#options-button, ytcp-icon-button[aria-label*="Opcje"], [aria-label*="Zmień"]').first();
      if (await optionsBtn.isVisible().catch(() => false)) {
        await optionsBtn.click();
        await page.waitForTimeout(1000);
        const changeItem = page.locator('tp-yt-paper-item:has-text("Zmień"), [role="menuitem"]:has-text("Zmień")').first();
        if (await changeItem.isVisible().catch(() => false)) {
          const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser', { timeout: 10000 }),
            changeItem.click()
          ]);
          await fileChooser.setFiles(THUMBNAIL_PATH);
          fileSet = true;
        }
      }
    }

    if (!fileSet) {
      console.log(`  ⚠️ Could not set thumbnail file input`);
      return { name: item.name, status: 'NO_INPUT' };
    }

    await page.waitForTimeout(2000);
    const saveBtn = page.locator('#save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
    const isEnabled = await saveBtn.evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true').catch(() => false);
    if (isEnabled) {
      await saveBtn.click();
      await page.waitForTimeout(3500);
      console.log(`  ✅ ZAPISANO miniaturę`);
      return { name: item.name, status: 'SUCCESS' };
    } else {
      console.log(`  ℹ️ Przycisk Zapisz nieaktywny (może miniatura jest już identyczna)`);
      return { name: item.name, status: 'UNCHANGED_OR_ALREADY_SAVED' };
    }
  } catch (err) {
    console.log(`  ❌ Błąd: ${err.message}`);
    return { name: item.name, status: 'ERROR: ' + err.message };
  }
}

const results = [];
for (const v of LIVE_VIDEOS) {
  const r = await updateThumbForVideo(v);
  results.push(r);
}

await ctx.close();
console.log('\n\n================ WYNIKI KOŃCOWE MINIATUR ================');
for (const r of results) {
  const icon = r.status === 'SUCCESS' ? '🟢' : (r.status.includes('ALREADY') ? '🟡' : '🔴');
  console.log(`${icon} ${r.name.padEnd(30)}: ${r.status}`);
}
