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

    const titleInput = page.locator('#textbox[aria-label*="tytuł" i], textarea[name="title"], #textbox').first();
    await titleInput.fill('Wieczór ze Słowem Bożym • Zaznaj spokoju serca [DZIŚ 20:00]');

    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
    await notForKids.click();
    await page.waitForTimeout(1000);

    for (let i = 0; i < 3; i++) {
      await page.locator('#next-button, button:has-text("Dalej"), ytcp-button:has-text("Dalej")').first().click();
      await page.waitForTimeout(2000);
    }

    const dtPickerInfo = await page.evaluate(() => {
      const p = document.querySelector('ytcp-datetime-picker');
      if (!p) return { error: 'Brak ytcp-datetime-picker' };
      const inputs = Array.from(p.querySelectorAll('input, ytcp-text-dropdown-trigger, [role="button"], div')).map(el => ({
        tag: el.tagName,
        id: el.id,
        className: el.className,
        val: el.value,
        text: el.innerText ? el.innerText.trim() : '',
        ariaLabel: el.getAttribute('aria-label')
      }));
      return { html: p.innerHTML, inputs: inputs.slice(0, 20) };
    });

    console.log('Datetime picker info:\n', JSON.stringify(dtPickerInfo, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await ctx.close();
  }
}

main();
