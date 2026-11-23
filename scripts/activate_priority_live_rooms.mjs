import { launchStudio } from './yt_studio_session.mjs';

const ROOMS_TO_ACTIVATE = [
  { name: 'CC Women', via: '@CCWomen7', videoId: 'QoIgzHsu_Hg' },
  { name: 'CC Men', via: '@CCMen7', videoId: 'hkct4gOpx-0' },
  { name: 'Popraw Koronę', via: '@PoprawKoronęCC', videoId: '9H_xc4mdUro' },
  { name: 'Polskie Radio CC', via: '@osobowośćPLUS', videoId: 'RxyWYOGWZ6c' },
  { name: 'Biblia Audio CC', via: '@osobowośćPLUS', videoId: 'LLO4p4XNJoY' },
  { name: 'Werset Dnia', via: '@osobowośćPLUS', videoId: 'bt8m8st5GOE' },
  { name: 'RCC TV 24', via: '@ToDlaCiebieGramy', videoId: 'F1VQfwovam0' },
  { name: 'Top Seven', via: '@TopSeven_CC', videoId: 'tIF2WJl9G1c' }
];

async function switchIdentityDirect(page, handle) {
  console.log(`Przełączam tożsamość na ${handle}...`);
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 40000 });
  await page.waitForTimeout(1500);
  const item = page.locator('ytd-account-item-renderer', { hasText: handle.replace('@', '') }).first();
  if (!(await item.count())) {
    console.log(`[WARN] Nie znaleziono ${handle} w przełączniku`);
    return false;
  }
  await item.click({ force: true });
  await page.waitForTimeout(3000);
  return true;
}

async function activateRoom(page, item) {
  console.log(`\n==================================================`);
  console.log(`Aktywacja transmisji: ${item.name} (${item.videoId}) przez ${item.via}`);
  console.log(`==================================================`);

  try {
    const switched = await switchIdentityDirect(page, item.via);
    if (!switched) return;

    const roomUrl = `https://studio.youtube.com/video/${item.videoId}/livestreaming?approve_browser_access=true`;
    console.log(`Nawigacja do ${roomUrl}...`);
    await page.goto(roomUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(8000);

    // Gate
    const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
    if (await gate.isVisible({ timeout: 2000 }).catch(() => false)) {
      await gate.click();
      await page.waitForTimeout(4000);
    }

    // Dismiss any modal (Gotowe / Edytowanie układu)
    const gotowe = page.locator('button:has-text("Gotowe"), ytcp-button:has-text("Gotowe")').first();
    if (await gotowe.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Zamykam okno dialogowe (Gotowe)...');
      await gotowe.click();
      await page.waitForTimeout(1500);
    }

    // Check body text
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const health = (bodyText.match(/\n(Doskonały|Dobry|Dobra|Słaby|Słaba|Brak danych|Brak sygnału|Oczekiwanie)[^\n]*/) || [])[1] || 'nieznany';
    console.log(`[${item.name}] Sygnał w pokoju: ${health}`);

    if (/Zakończ transmisję/.test(bodyText)) {
      console.log(`[${item.name}] Transmisja już NADAJE NA ŻYWO!`);
      return;
    }

    // Check Go Live
    const goLiveBtn = page.locator('#start-stream-button, ytcp-button:has-text("Transmituj na żywo"), button:has-text("Transmituj na żywo")').first();
    const isVisible = await goLiveBtn.isVisible({ timeout: 3000 }).catch(() => false);
    const isEnabled = isVisible ? await goLiveBtn.isEnabled().catch(() => false) : false;
    console.log(`[${item.name}] Przycisk Transmituj na żywo: widoczny=${isVisible}, aktywny=${isEnabled}`);

    if (isVisible && isEnabled) {
      console.log(`[${item.name}] >>> KLIKAM "Transmituj na żywo" <<<`);
      await goLiveBtn.click({ force: true });
      await page.waitForTimeout(2500);

      const confirmBtn = page.locator('#confirm-button, button:has-text("Rozpocznij"), ytcp-button:has-text("Rozpocznij")').first();
      if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`[${item.name}] >>> POTWIERDZAM "Rozpocznij" <<<`);
        await confirmBtn.click({ force: true });
        await page.waitForTimeout(6000);
      }
    }

    await page.screenshot({ path: `C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/room_act_${item.name.replace(/[^\w]+/g, '_')}.png` });
  } catch (err) {
    console.error(`[${item.name}] BŁĄD:`, err.message);
  }
}

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    for (const item of ROOMS_TO_ACTIVATE) {
      await activateRoom(page, item);
    }
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
