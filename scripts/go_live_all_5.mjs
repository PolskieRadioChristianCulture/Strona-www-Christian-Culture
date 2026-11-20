import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const CHANNELS = [
  { name: 'Robert Łukasz Pio', videoId: 'z33rEkjNciY' },
  { name: 'Osobowość +', videoId: 'Al56YdVI40c' },
  { name: 'Christian Culture TV', videoId: 'OGmZpYMGve4' },
  { name: 'Polskie Radio CHRISTIAN CULTURE', videoId: 'tPipeO1iMD0' },
  { name: 'CC Women', videoId: 'yWyj0Iz1HeA' }
];

async function goLiveChannel(page, ch) {
  console.log(`\n======================================================`);
  console.log(`▶ URUCHAMIAM TRANSMISJĘ NA ŻYWO: ${ch.name}`);
  console.log(`======================================================`);

  // Wejdź do livestreaming przez manage lub direct
  await openChannelStudio(page, ch.name, `/livestreaming/manage`);
  await page.waitForTimeout(3000);

  console.log(`Nawiguję do pokoju transmisji: https://studio.youtube.com/video/${ch.videoId}/livestreaming`);
  await page.goto(`https://studio.youtube.com/video/${ch.videoId}/livestreaming`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
  await page.screenshot({ path: `${artDir}/before_go_live_${ch.videoId}.png` });

  // Sprawdź czy transmisja już trwa (czy jest przycisk Zakończ transmisję)
  const isAlreadyLive = await page.locator('button:has-text("Zakończ transmisję"), ytcp-button:has-text("Zakończ transmisję")').isVisible().catch(() => false);
  if (isAlreadyLive) {
    console.log(`Transmisja ${ch.name} już trwa (widoczny przycisk Zakończ transmisję)!`);
    return { name: ch.name, status: 'ALREADY_LIVE' };
  }

  // Kliknij "Transmituj na żywo"
  console.log('Szukam przycisku "Transmituj na żywo"...');
  const goLiveBtn = page.locator('button:has-text("Transmituj na żywo"), ytcp-button:has-text("Transmituj na żywo"), [test-id="go-live-button"], #go-live-button button').first();
  
  if (await goLiveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    const isEnabled = await goLiveBtn.isEnabled().catch(() => false);
    console.log(`Przycisk "Transmituj na żywo" znaleziony! Włączony: ${isEnabled}`);
    
    await goLiveBtn.click();
    await page.waitForTimeout(2000);

    // Sprawdź modal potwierdzenia jeśli się pojawi
    const confirmBtn = page.locator('ytcp-button:has-text("Transmituj na żywo"), ytcp-button:has-text("Rozpocznij"), button:has-text("Transmituj na żywo"), button:has-text("Rozpocznij"), #confirm-button').last();
    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Potwierdzam rozpoczęcie transmisji w dialogu...');
      await confirmBtn.click();
      await page.waitForTimeout(3000);
    }

    await page.screenshot({ path: `${artDir}/after_go_live_${ch.videoId}.png` });
    console.log(`✅ ${ch.name}: Transmisja uruchomiona!`);
    return { name: ch.name, status: 'STARTED' };
  } else {
    // Może też włączyć "Włącz automatyczne uruchamianie"
    console.log('Nie znaleziono bezpośrednio przycisku Transmituj na żywo, sprawdzam toggle automatycznego uruchamiania...');
    const autoStartToggle = page.locator('tp-yt-paper-toggle-button, ytcp-paper-toggle-button').filter({ hasText: /automatyczne uruchamianie/i }).first();
    if (await autoStartToggle.isVisible().catch(() => false)) {
      const isChecked = await autoStartToggle.getAttribute('aria-checked');
      if (isChecked !== 'true') {
        await autoStartToggle.click();
        console.log('Włączono Automatyczne uruchamianie!');
        await page.waitForTimeout(3000);
      }
    }
    await page.screenshot({ path: `${artDir}/after_toggle_${ch.videoId}.png` });
    return { name: ch.name, status: 'TOGGLED' };
  }
}

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const results = [];

  try {
    for (const ch of CHANNELS) {
      try {
        const r = await goLiveChannel(page, ch);
        results.push(r);
      } catch (err) {
        console.error(`Błąd dla ${ch.name}:`, err.message);
        results.push({ name: ch.name, status: 'ERROR', error: err.message });
      }
    }
  } finally {
    await ctx.close();
  }

  console.log('\n=== WYNIKI URUCHAMIANIA TRANSMISJI ===');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
