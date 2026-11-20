import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const CHANNELS_TO_ACTIVATE = [
  { name: 'Osobowość +', id: 'Al56YdVI40c' },
  { name: 'Polskie Radio CHRISTIAN CULTURE', id: 'tPipeO1iMD0' },
  { name: 'Christian Culture TV', id: 'OGmZpYMGve4' },
  { name: 'CC Women', id: 'yWyj0Iz1HeA' }
];

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

  try {
    for (const item of CHANNELS_TO_ACTIVATE) {
      console.log(`\n========================================`);
      console.log(`Aktywuję Go Live dla: ${item.name} (${item.id})`);
      console.log(`========================================`);

      try {
        await openChannelStudio(page, item.name, '/livestreaming/manage');
        await page.waitForTimeout(3000);

        const roomUrl = `https://studio.youtube.com/video/${item.id}/livestreaming`;
        console.log(`Nawiguję do: ${roomUrl}`);
        await page.goto(roomUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(6000);

        // Screenshot before click
        await page.screenshot({ path: `${artDir}/before_click_${item.id}.png` });

        // Find "Transmituj na żywo" button
        const btn = page.locator('button, ytcp-button').filter({ hasText: /^Transmituj na żywo$/ }).first();
        const isVisible = await btn.isVisible({ timeout: 4000 }).catch(() => false);
        const isEnabled = isVisible ? await btn.isEnabled().catch(() => false) : false;

        console.log(`Przycisk 'Transmituj na żywo' - widoczny: ${isVisible}, aktywny: ${isEnabled}`);

        if (isVisible && isEnabled) {
          await btn.click();
          console.log(`Kliknięto 'Transmituj na żywo'!`);
          await page.waitForTimeout(3000);

          // Dialog confirmation if present
          const dialogBtn = page.locator('ytcp-button, button').filter({ hasText: /Transmituj na żywo|Rozpocznij/ }).last();
          if (await dialogBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
            console.log(`Zatwierdzam w oknie dialogowym...`);
            await dialogBtn.click();
            await page.waitForTimeout(3000);
          }

          await page.screenshot({ path: `${artDir}/after_click_${item.id}.png` });
          console.log(`Sukces dla ${item.name}!`);
        } else if (!isVisible) {
          // Check if already live (Zakończ transmisję)
          const endBtn = page.locator('button, ytcp-button').filter({ hasText: /Zakończ transmisję/ }).first();
          if (await endBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log(`Kanał ${item.name} jest JUŻ w trybie nadawania na żywo!`);
          } else {
            console.log(`Nie znaleziono przycisku Go Live ani Zakończ. Sprawdź screenshot: before_click_${item.id}.png`);
          }
        } else {
          console.log(`Przycisk jest nieaktywny (disabled). Brak sygnału RTMP lub trwa inicjalizacja.`);
        }

      } catch (err) {
        console.error(`Błąd podczas aktywacji ${item.name}:`, err.message);
      }
    }
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
