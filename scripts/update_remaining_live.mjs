import { launchStudio } from './yt_studio_session.mjs';
import fs from 'fs';

const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\images\\slowo_ktore_cie_uzdrawia_thumb.jpg';
const TITLE = 'Słowo, które Cię uzdrawia • Spiritual Sounds & Christian Culture TV • LIVE 🔴 24/7';
const ARTIFACTS_DIR = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

async function updateSingle(videoId, channelLabel) {
  console.log(`\n========================================`);
  console.log(`▶ AKTUALIZUJĘ: ${channelLabel} (${videoId})`);
  console.log(`========================================`);

  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await page.goto(`https://studio.youtube.com/video/${videoId}/edit`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    console.log(`[${channelLabel}] Czekam na załadowanie formularza szczegółów...`);
    const titleBox = page.locator('#title-textarea #textbox, #textbox[aria-label*="Tytuł" i]').first();
    await titleBox.waitFor({ state: 'visible', timeout: 30000 });

    console.log(`[${channelLabel}] Wpisuję nowy tytuł: ${TITLE}`);
    await titleBox.click();
    await titleBox.fill('');
    await titleBox.fill(TITLE);
    await page.waitForTimeout(1000);

    if (fs.existsSync(THUMBNAIL_PATH)) {
      console.log(`[${channelLabel}] Wgrywam miniaturę: ${THUMBNAIL_PATH}`);
      const fileInput = page.locator('input#file-loader, input[type="file"][accept*="image"]').first();
      await fileInput.waitFor({ state: 'attached', timeout: 15000 });
      await fileInput.setInputFiles(THUMBNAIL_PATH);
      console.log(`[${channelLabel}] Miniatura przesłana!`);
      await page.waitForTimeout(3000);
    }

    const saveBtn = page.locator('#save, ytcp-button#save-button, ytcp-button:has-text("Zapisz")').first();
    await saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    const isEnabled = await saveBtn.isEnabled().catch(() => false);
    console.log(`[${channelLabel}] Przycisk Zapisz aktywny: ${isEnabled}`);
    if (isEnabled) {
      await saveBtn.click();
      await page.waitForTimeout(4000);
      console.log(`[${channelLabel}] ZAPISANO!`);
    }
  } catch (err) {
    console.error(`[${channelLabel}] Błąd:`, err.message);
  } finally {
    try { await ctx.close(); } catch (e) {}
  }
}

async function main() {
  await updateSingle('G5Y-TTyInqA', 'Worship_LIVE_CC');
  await updateSingle('Ob3YiNfQQbM', 'Popraw_Korone');
  await updateSingle('oF9U8da3bFY', 'Katarzyna_Fedkow');
}

main().catch(console.error);
