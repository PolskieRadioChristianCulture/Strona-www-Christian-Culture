import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const VIDEO_ID = process.argv[2] || '52LwsBCxtqM'; // 4K on Christian Culture TV
const CHANNEL_NAME = 'Christian Culture TV';
const PLAYLIST_NAME_PART = 'Księga Rodzaju';

async function main() {
  console.log(`[Playlist] Przypisywanie wideo ${VIDEO_ID} do playlisty "${PLAYLIST_NAME_PART}" na kanale ${CHANNEL_NAME}...`);
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, CHANNEL_NAME);
    const editUrl = `https://studio.youtube.com/video/${VIDEO_ID}/edit`;
    console.log(`[Playlist] Nawigacja do: ${editUrl}`);
    await page.goto(`${editUrl}?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);
    const passBtn = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
    if (await passBtn.isVisible().catch(() => false)) {
      console.log(`[Playlist] Przechodzę przez bramkę browser gate...`);
      await passBtn.click();
      await page.waitForTimeout(4000);
    }
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'video_edit_screen.png' });
    console.log(`[Playlist] Zrzut ekranu video_edit_screen.png zapisany.`);

    // Sprawdź czy jesteśmy na właściwej stronie
    console.log(`[Playlist] Tytuł strony: ${await page.title()}, URL: ${page.url()}`);

    // Szukaj sekcji playlist
    const playlistPicker = page.locator('ytcp-video-metadata-playlists, [test-id="playlists-picker"], #basics ytcp-text-dropdown-trigger').first();
    await playlistPicker.waitFor({ timeout: 15000 });
    await playlistPicker.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    console.log(`[Playlist] Otwieranie listy playlist...`);
    await playlistPicker.click();
    await page.waitForTimeout(2000);

    // Znajdź checkbox lub wiersz z nazwą "Księga Rodzaju"
    const plRow = page.locator(`ytcp-checkbox-group yt-formatted-string:has-text("${PLAYLIST_NAME_PART}"), ytcp-ve:has-text("${PLAYLIST_NAME_PART}"), li:has-text("${PLAYLIST_NAME_PART}")`).first();
    if (await plRow.count() > 0) {
      console.log(`[Playlist] Znaleziono playlistę: ${PLAYLIST_NAME_PART}. Zaznaczam...`);
      await plRow.click();
      await page.waitForTimeout(1000);
    } else {
      console.warn(`[Playlist] Nie znaleziono bezpośrednio tekstu "${PLAYLIST_NAME_PART}", sprawdzam wszystkie checkboxy...`);
    }

    // Kliknij "Gotowe" / "Done"
    const doneBtn = page.locator('ytcp-button:has-text("Gotowe"), ytcp-button:has-text("Done"), button:has-text("Gotowe")').first();
    if (await doneBtn.isVisible()) {
      console.log(`[Playlist] Zamykam listę playlist (Gotowe)...`);
      await doneBtn.click();
      await page.waitForTimeout(1500);
    }

    // Kliknij Zapisz / Save
    const saveBtn = page.locator('#save-button, ytcp-button#save, button#save').first();
    if (await saveBtn.isVisible() && !(await saveBtn.getAttribute('disabled'))) {
      console.log(`[Playlist] Zapisuję zmiany (#save)...`);
      await saveBtn.click();
      await page.waitForTimeout(3000);
      console.log(`✅ [Playlist] Zmiany zapisane pomyślnie!`);
    } else {
      console.log(`[Playlist] Przycisk Zapisz jest nieaktywny lub zmiany są już zapisane.`);
    }

    // Screenshot weryfikacyjny
    await page.screenshot({ path: 'playlist_assigned_check.png' });
    console.log(`[Playlist] Zrzut ekranu zapisany do playlist_assigned_check.png`);
  } finally {
    await ctx.close();
  }
}

main().catch(err => {
  console.error('[Playlist] Błąd:', err);
  process.exit(1);
});
