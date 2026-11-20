import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    const videoId = 'z33rEkjNciY';
    const roomUrl = `https://studio.youtube.com/video/${videoId}/livestreaming`;
    await page.goto(roomUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    // Kliknij przycisk Edytuj w sekcji szczegółów
    console.log('Klikam Edytuj...');
    const editBtn = page.locator('ytcp-button:has-text("Edytuj"), button:has-text("Edytuj")').first();
    await editBtn.click();
    await page.waitForTimeout(2500);

    // Sprawdźmy widoczność w otwartym oknie
    const editDialogShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_metadata_dialog.png';
    await page.screenshot({ path: editDialogShot });
    console.log('Zrzut dialogu metadanych:', editDialogShot);

    // Znajdź sekcję widoczności / prywatności
    const privDropdown = page.locator('ytcp-text-dropdown-trigger#privacy-dropdown, ytcp-dropdown-trigger:has-text("Niepubliczny"), [id*="privacy"]').first();
    if (await privDropdown.isVisible({ timeout: 2500 }).catch(() => false)) {
      await privDropdown.click();
      await page.waitForTimeout(1000);
      const publicItem = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-item:has-text("Publiczny"), tp-yt-paper-radio-button:has-text("Publiczny")').first();
      await publicItem.click();
      await page.waitForTimeout(1000);
    }

    // Kliknij Zapisz
    const saveBtn = page.locator('#save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      console.log('Zapisano zmiany widoczności na Publiczny');
      await page.waitForTimeout(3000);
    }

    const finalShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_now_public.png';
    await page.screenshot({ path: finalShot });
    console.log('Zrzut końcowy:', finalShot);

  } catch (err) {
    console.error(err);
  } finally {
    await ctx.close();
  }
}

main();
