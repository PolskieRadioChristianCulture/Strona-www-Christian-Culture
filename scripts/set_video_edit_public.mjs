import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    const videoId = 'z33rEkjNciY';
    const editUrl = `https://studio.youtube.com/video/${videoId}/edit`;
    console.log('1. Otwieram edycję wideo:', editUrl);
    await page.goto(editUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    const editShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\video_edit_page.png';
    await page.screenshot({ path: editShot });
    console.log('Zrzut strony edycji:', editShot);

    // Szukamy sekcji widoczności w prawym pasku bocznym
    console.log('2. Szukam sekcji widoczności...');
    const visTrigger = page.locator('#visibility-container, [aria-label*="Widoczność" i], ytcp-video-metadata-visibility').first();
    await visTrigger.click();
    await page.waitForTimeout(1500);

    const visModalShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\video_edit_vis_modal.png';
    await page.screenshot({ path: visModalShot });
    console.log('Zrzut okna widoczności:', visModalShot);

    // Klikamy "Publiczny"
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pubRadio.click();
      console.log('Kliknięto Publiczny');
      await page.waitForTimeout(1000);

      // Kliknij "Gotowe" w okienku widoczności
      const doneBtn = page.locator('#save-button, ytcp-button:has-text("Gotowe"), button:has-text("Gotowe")').first();
      await doneBtn.click();
      console.log('Kliknięto Gotowe w okienku widoczności');
      await page.waitForTimeout(1500);
    }

    // Kliknij główny przycisk "Zapisz" (u góry po prawej)
    const mainSaveBtn = page.locator('#save, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
    if (await mainSaveBtn.isVisible().catch(() => false)) {
      await mainSaveBtn.click();
      console.log('Główny przycisk Zapisz kliknięty');
      await page.waitForTimeout(4000);
    }

    const savedShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\video_edit_saved_public.png';
    await page.screenshot({ path: savedShot });
    console.log('Zrzut po zapisaniu:', savedShot);

  } catch (err) {
    console.error(err);
  } finally {
    await ctx.close();
  }
}

main();
