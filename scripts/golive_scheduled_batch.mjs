import { chromium } from 'playwright';
import fs from 'node:fs';
import { ALL_CHANNELS } from './all_channels_config.mjs';
import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const TARGETS = [
  'Polskie Radio CC',
  'Biblia Audio CC',
  'CC Men',
  'Popraw Koronę'
];

async function goLiveChannel(page, channelName) {
  console.log(`\n========================================`);
  console.log(`Przetwarzam kanał: ${channelName}`);
  console.log(`========================================`);

  try {
    // 1. Switch identity and open manage
    await openChannelStudio(page, channelName, '/livestreaming/manage');
    await page.waitForTimeout(4000);

    // 2. Click the first scheduled broadcast
    const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    const hasRow = await row.isVisible({ timeout: 5000 }).catch(() => false);
    if (!hasRow) {
      console.log(`[${channelName}] Brak zaplanowanej transmisji w /livestreaming/manage.`);
      return;
    }

    const title = (await row.innerText().catch(() => '')).trim();
    console.log(`[${channelName}] Znaleziono transmisję: "${title}". Otwieram pokój...`);
    await row.click();
    await page.waitForTimeout(8000);

    const roomUrl = page.url();
    console.log(`[${channelName}] Adres pokoju: ${roomUrl}`);

    // 3. Dismiss modal if present (e.g. Edytowanie układu pionowego)
    const gotowe = page.locator('button:has-text("Gotowe"), ytcp-button:has-text("Gotowe")').first();
    if (await gotowe.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`[${channelName}] Zamykam okno Gotowe...`);
      await gotowe.click();
      await page.waitForTimeout(2000);
    }

    // 4. Check stream health
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const health = (bodyText.match(/\n(Doskonały|Dobry|Dobra|Słaby|Słaba|Brak danych|Brak sygnału|Oczekiwanie)[^\n]*/) || [])[1] || 'nieznany';
    console.log(`[${channelName}] Sygnał: ${health}`);

    // 5. If already live
    if (/Zakończ transmisję/.test(bodyText)) {
      console.log(`[${channelName}] Kanał JUŻ NADAJE (Zakończ transmisję widoczne)!`);
      return;
    }

    // 6. Click Go Live
    const goLiveBtn = page.locator('#start-stream-button, ytcp-button:has-text("Transmituj na żywo"), button:has-text("Transmituj na żywo")').first();
    const isVisible = await goLiveBtn.isVisible({ timeout: 3000 }).catch(() => false);
    const isEnabled = isVisible ? await goLiveBtn.isEnabled().catch(() => false) : false;
    console.log(`[${channelName}] Przycisk "Transmituj na żywo": widoczny=${isVisible}, aktywny=${isEnabled}`);

    if (isVisible && isEnabled) {
      console.log(`[${channelName}] >>> KLIKAM "Transmituj na żywo" <<<`);
      await goLiveBtn.click({ force: true });
      await page.waitForTimeout(2500);

      const confirmBtn = page.locator('#confirm-button, button:has-text("Rozpocznij"), ytcp-button:has-text("Rozpocznij")').first();
      if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`[${channelName}] >>> POTWIERDZAM "Rozpocznij" <<<`);
        await confirmBtn.click({ force: true });
        await page.waitForTimeout(6000);
      }
    } else {
      console.log(`[${channelName}] Przycisk nieaktywny lub niewidoczny.`);
    }

    await page.screenshot({ path: `C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/room_${channelName.replace(/[^\w]+/g, '_')}.png` });
  } catch (err) {
    console.error(`[${channelName}] BŁĄD:`, err.message);
  }
}

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    for (const ch of TARGETS) {
      await goLiveChannel(page, ch);
    }
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
