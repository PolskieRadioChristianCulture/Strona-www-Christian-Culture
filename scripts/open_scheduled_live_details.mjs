import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log('1. Otwieram zarządzanie transmisjami na kanale Robert Łukasz Pio...');
    await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming/manage');
    await page.waitForTimeout(4000);

    // Znajdź wiersz z "Wieczór ze Słowem Bożym"
    console.log('2. Klikam w zaplanowaną transmisję...');
    const rowTitle = page.locator('a:has-text("Wieczór ze Słowem Bożym"), span:has-text("Wieczór ze Słowem Bożym"), div:has-text("Wieczór ze Słowem Bożym")').first();
    await rowTitle.click();
    await page.waitForTimeout(5000);

    const roomShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_details_room.png';
    await page.screenshot({ path: roomShot });
    console.log('Zrzut pokoju transmisji:', roomShot);
    console.log('Aktualny URL:', page.url());

    // Pobierz informacje o transmisji (Video ID, link, widoczność, klucz strumienia)
    const streamInfo = await page.evaluate(() => {
      const url = window.location.href;
      // videoId can be in URL or in elements
      const vidMatch = url.match(/\/video\/([a-zA-Z0-9_-]+)/) || url.match(/v=([a-zA-Z0-9_-]+)/);
      const videoId = vidMatch ? vidMatch[1] : null;

      // Stream key
      const keyInput = document.querySelector('input[type="password"], input[aria-label*="klucz" i], input[aria-label*="key" i]');
      const keyVal = keyInput ? keyInput.value : null;

      // Stream URL
      const streamUrlInput = document.querySelector('input[aria-label*="URL strumienia" i]');
      const streamUrl = streamUrlInput ? streamUrlInput.value : null;

      return {
        url,
        videoId,
        watchUrl: videoId ? `https://youtu.be/${videoId}` : null,
        keyVal: keyVal ? keyVal.slice(0, 4) + '****' : null,
        streamUrl
      };
    });

    console.log('Dane transmisji:\n', JSON.stringify(streamInfo, null, 2));

    // Sprawdźmy widoczność w pokoju lub przycisk edycji
    const editBtn = page.locator('button:has-text("Edytuj"), ytcp-button:has-text("Edytuj")').first();
    if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Klikam Edytuj aby zmienić widoczność na Publiczny...');
      await editBtn.click();
      await page.waitForTimeout(2000);

      // W oknie edycji sprawdź pole widoczności
      const editShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_edit_modal.png';
      await page.screenshot({ path: editShot });
      console.log('Zrzut okna edycji:', editShot);
    }

  } catch (err) {
    console.error('BŁĄD:', err);
  } finally {
    await ctx.close();
  }
}

main();
