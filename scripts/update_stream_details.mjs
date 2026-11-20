import { launchStudio } from './yt_studio_session.mjs';
import fs from 'fs';

const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\images\\slowo_ktore_cie_uzdrawia_thumb.jpg';
const TITLE = 'Słowo, które Cię uzdrawia • Spiritual Sounds & Christian Culture TV • LIVE 🔴 24/7';
const ARTIFACTS_DIR = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

async function updateVideo(page, videoId, channelLabel) {
  console.log(`\n========================================`);
  console.log(`▶ AKTUALIZUJĘ: ${channelLabel} (videoId: ${videoId})`);
  console.log(`========================================`);

  await page.goto(`https://studio.youtube.com/video/${videoId}/edit`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  
  // Poczekaj na załadowanie formularza szczegółów
  console.log(`[${channelLabel}] Czekam na załadowanie formularza szczegółów...`);
  const titleBox = page.locator('#title-textarea #textbox, #textbox[aria-label*="Tytuł" i]').first();
  await titleBox.waitFor({ state: 'visible', timeout: 30000 });

  // 1. Tytuł
  console.log(`[${channelLabel}] Wpisuję nowy tytuł: ${TITLE}`);
  await titleBox.click();
  await titleBox.fill('');
  await titleBox.fill(TITLE);
  await page.waitForTimeout(1000);

  // 2. Miniatura
  if (fs.existsSync(THUMBNAIL_PATH)) {
    console.log(`[${channelLabel}] Wgrywam miniaturę: ${THUMBNAIL_PATH}`);
    const fileInput = page.locator('input#file-loader, input[type="file"][accept*="image"]').first();
    await fileInput.waitFor({ state: 'attached', timeout: 15000 });
    await fileInput.setInputFiles(THUMBNAIL_PATH);
    console.log(`[${channelLabel}] Miniatura ustawiona przez input#file-loader!`);
    await page.waitForTimeout(3000);
  }

  // 3. Zapisz
  const saveBtn = page.locator('#save, ytcp-button#save-button, ytcp-button:has-text("Zapisz")').first();
  await saveBtn.waitFor({ state: 'visible', timeout: 10000 });
  const isEnabled = await saveBtn.isEnabled().catch(() => false);
  console.log(`[${channelLabel}] Przycisk Zapisz widoczny (aktywny: ${isEnabled}). Klikam...`);
  if (isEnabled) {
    await saveBtn.click();
    await page.waitForTimeout(6000);
    console.log(`[${channelLabel}] ZAPISANO POMYŚLNIE!`);
  } else {
    console.log(`[${channelLabel}] Przycisk Zapisz wyszarzony.`);
  }

  await page.screenshot({ path: `${ARTIFACTS_DIR}/updated_${channelLabel.replace(/[^a-zA-Z0-9]/g, '_')}.png` });
}

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    // 1. Top Seven
    try {
      await updateVideo(page, 'Uj4c5N_gEaY', 'Top_Seven');
    } catch (e) {
      console.error('Top Seven error:', e.message);
    }

    // 2. Worship LIVE CC
    try {
      await updateVideo(page, 'G5Y-TTyInqA', 'Worship_LIVE_CC');
    } catch (e) {
      console.error('Worship error:', e.message);
    }

    // 3. Popraw Koronę
    try {
      await updateVideo(page, 'Ob3YiNfQQbM', 'Popraw_Korone');
    } catch (e) {
      console.error('Popraw Korone error:', e.message);
    }

    // 4. Katarzyna Fedków
    try {
      await updateVideo(page, 'oF9U8da3bFY', 'Katarzyna_Fedkow');
    } catch (e) {
      console.error('Katarzyna error:', e.message);
    }
  } finally {
    try { await ctx.close(); } catch (e) {}
  }
}

main().catch(console.error);
