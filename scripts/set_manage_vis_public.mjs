import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming/manage');
    await page.waitForTimeout(4000);

    console.log('1. Szukam komórki widoczności w tabeli...');
    const visCell = page.locator('div:has-text("Niepubliczny"), span:has-text("Niepubliczny")').first();
    await visCell.click();
    await page.waitForTimeout(1500);

    const menuShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\manage_vis_menu.png';
    await page.screenshot({ path: menuShot });
    console.log('Zrzut menu widoczności:', menuShot);

    const pubOption = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pubOption.click();
      console.log('Kliknięto Publiczny');
      await page.waitForTimeout(1000);

      const saveBtn = page.locator('#save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz"), ytcp-button:has-text("Opublikuj")').first();
      await saveBtn.click();
      console.log('Kliknięto Zapisz');
      await page.waitForTimeout(3000);
    }

    const finalShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\manage_final_public.png';
    await page.screenshot({ path: finalShot });
    console.log('Zrzut końcowy:', finalShot);

  } catch (err) {
    console.error(err);
  } finally {
    await ctx.close();
  }
}

main();
