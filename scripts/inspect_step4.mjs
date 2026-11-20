import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming/manage');
    await page.waitForTimeout(4000);

    const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
    await schedBtn.click();
    await page.waitForTimeout(2500);

    const createNewBtn = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
    if (await createNewBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await createNewBtn.click();
      await page.waitForTimeout(2000);
    }

    // Wypełnij tytuł
    const titleInput = page.locator('#textbox[aria-label*="tytuł" i], #textbox[aria-label*="title" i], textarea[name="title"], input[name="title"], #textbox').first();
    await titleInput.fill('Wieczór ze Słowem Bożym • Zaznaj spokoju serca [DZIŚ 20:00]');

    // NOT_MFK
    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], tp-yt-paper-radio-button:has-text("Nie, nie są przeznaczone dla dzieci")').first();
    await notForKids.click();
    await page.waitForTimeout(1000);

    // Przejdź do kroku widoczności
    for (let step = 1; step <= 3; step++) {
      const nextBtn = page.locator('#next-button, button:has-text("Dalej"), ytcp-button:has-text("Dalej")').first();
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }

    const shotStep4 = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_step4_visibility.png';
    await page.screenshot({ path: shotStep4 });
    console.log('Zrzut kroku 4:', shotStep4);

    const dialogData = await page.evaluate(() => {
      const dialog = document.querySelector('ytls-broadcast-create-dialog, ytcp-uploads-dialog, [role="dialog"]');
      if (!dialog) return { error: 'Brak dialogu' };
      const btns = Array.from(dialog.querySelectorAll('button, ytcp-button')).map(b => ({
        id: b.id,
        text: b.innerText.trim(),
        disabled: b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true',
        hidden: b.hidden || b.style.display === 'none'
      }));
      const radios = Array.from(dialog.querySelectorAll('tp-yt-paper-radio-button, input[type="radio"]')).map(r => ({
        name: r.getAttribute('name'),
        text: r.innerText.trim(),
        checked: r.hasAttribute('checked') || r.getAttribute('aria-checked') === 'true'
      }));
      return { btns, radios, text: dialog.innerText.slice(0, 400).replace(/\n+/g, ' ') };
    });

    console.log('Dane dialogu krok 4:\n', JSON.stringify(dialogData, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await ctx.close();
  }
}

main();
