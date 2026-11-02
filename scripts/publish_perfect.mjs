import fs from 'node:fs';
import path from 'node:path';
import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const HISTORY_FILE = path.resolve('C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\data\\youtube_published_history.json');

// Maks. czas na przesłanie pliku (4K ~400 MB). Zamknięcie przeglądarki przed końcem
// przesyłania przerywa upload i zostawia w Studio wersję roboczą — dlatego czekamy.
const UPLOAD_TIMEOUT_MS = 60 * 60 * 1000;
const PROGRESS_SELECTOR = 'ytcp-uploads-dialog ytcp-video-upload-progress, ytcp-uploads-dialog .progress-label';

function readHistory(historyFile = HISTORY_FILE) {
  if (!fs.existsSync(historyFile)) return { version: '1.0', published: [] };
  return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
}

// Ochrona przed dublami: ten sam plik na tym samym kanale wgrywamy tylko raz.
// Wpisy oznaczone przez yt_reconcile_history.mjs jako nieudane (studioStatus: broken/draft/missing) nie blokują ponownego wgrania.
const DEAD_STATUSES = new Set(['broken', 'draft', 'missing']);
export function findPublished(videoPath, channelId, historyFile = HISTORY_FILE, channelName = null) {
  const file = path.basename(videoPath);
  return readHistory(historyFile).published.find(p =>
    p.videoFile === file &&
    (channelName ? p.channel === channelName : p.channelId === channelId) &&
    !DEAD_STATUSES.has(p.studioStatus)) || null;
}

// Data w formacie pola „Zaplanuj” YouTube Studio (PL), np. „4 lis 2026”.
const PL_MONTHS = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
export function studioDate(d) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Warsaw', day: 'numeric', month: 'numeric', year: 'numeric' })
    .formatToParts(d).map(p => [p.type, p.value]));
  return `${Number(parts.day)} ${PL_MONTHS[Number(parts.month) - 1]} ${parts.year}`;
}

const warsawDay = d => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(d); // YYYY-MM-DD
const addDays = (ymd, n) => { const d = new Date(`${ymd}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

// Termin premiery (Europe/Warsaw, domyślnie 18:00): najwcześniej N dni po wgraniu (domyślnie 2),
// ale nie wcześniej niż dzień po ostatniej zaplanowanej premierze tego samego typu (4K/Shorts) na tym kanale —
// dzięki temu odcinki wychodzą po jednym dziennie, w kolejności rozdziałów.
export function scheduleTarget({ channelName = null, isShorts = false, now = new Date(), history = null } = {},
  days = Number(process.env.CC_YT_SCHEDULE_DAYS ?? 2), time = process.env.CC_YT_SCHEDULE_TIME || '18:00') {
  if (!days) return null;
  let ymd = addDays(warsawDay(now), days);
  if (channelName) {
    const taken = (history || readHistory()).published
      // Kolejka liczona osobno dla każdej pory (slotu): zaległości 18:00 nie opóźniają bieżącego odcinka 20:00.
      .filter(p => p.channel === channelName && Boolean(p.scheduledDate) && /shorts/i.test(p.videoFile) === isShorts
        && ((p.scheduledFor || '').match(/\d\d:\d\d/) || ['18:00'])[0] === time)
      .map(p => p.scheduledDate).sort();
    const last = taken[taken.length - 1];
    if (last && last >= ymd) ymd = addDays(last, 1);
  }
  return { ymd, date: studioDate(new Date(`${ymd}T12:00:00Z`)), time };
}

async function scheduleVisibility(page, { date, time }, premiere) {
  const expand = page.locator('ytcp-uploads-dialog #second-container-expand-button').first();
  await expand.waitFor({ state: 'visible', timeout: 15000 });
  await expand.click();
  await page.waitForTimeout(1500);

  await page.locator('ytcp-uploads-dialog #datepicker-trigger').first().click();
  await page.waitForTimeout(1000);
  const dateInput = page.locator('ytcp-date-picker tp-yt-paper-input input, ytcp-date-picker input').first();
  await dateInput.waitFor({ state: 'visible', timeout: 10000 });
  await dateInput.fill(date);
  await dateInput.press('Enter');
  await page.waitForTimeout(1000);

  const timeInput = page.locator('ytcp-uploads-dialog #time-of-day-container input').first();
  await timeInput.fill(time);
  await timeInput.press('Enter');
  await page.waitForTimeout(800);

  if (premiere) {
    const box = page.locator('ytcp-uploads-dialog #enable-premiere-checkbox').first();
    if (await box.isVisible().catch(() => false) && (await box.getAttribute('aria-checked')) !== 'true') await box.click();
  }

  const shownDate = (await page.locator('ytcp-uploads-dialog #datepicker-trigger').first().innerText()).replace(/\s+/g, ' ').trim();
  const shownTime = await timeInput.inputValue();
  if (!shownDate.includes(date) || shownTime !== time) {
    throw new Error(`Nie ustawiono terminu premiery (jest: "${shownDate} ${shownTime}", oczekiwano: "${date} ${time}"). NIE publikuję.`);
  }
  console.log(`  -> Zaplanowano publikację: ${shownDate} ${shownTime}${premiere ? ' (premiera)' : ''}`);
}

// Stan przesyłania na podstawie etykiety postępu w dialogu Studio (PL/EN).
export function uploadStateFromText(text) {
  const t = (text || '').toLowerCase();
  if (/nie udało|niepowodzenie|failed|przesyłanie anulowane|upload cancel/.test(t)) return 'error';
  // „Przetwarzam do 4K…” = plik jest już w całości na YouTube (przetwarzanie dzieje się po stronie serwera)
  if (/zakończon|complete|przetwarza|przetworzon|processing|processed|sprawdzan|100\s*%/.test(t)) return 'done';
  if (/przesyłanie|przesłano|uploading|uploaded|pozostał|remaining|\d+\s*%/.test(t)) return 'uploading';
  return 'unknown';
}

export async function waitForUploadComplete(page, { timeoutMs = UPLOAD_TIMEOUT_MS, pollMs = 5000, selector = PROGRESS_SELECTOR } = {}) {
  const start = Date.now();
  let lastLog = 0;
  while (Date.now() - start < timeoutMs) {
    const text = await page.locator(selector).first().innerText({ timeout: 2000 }).catch(() => '');
    const state = uploadStateFromText(text);
    if (state === 'done') return text.trim();
    if (state === 'error') throw new Error(`YouTube zgłosił błąd przesyłania: ${text.trim()}`);
    if (Date.now() - lastLog > 60000) {
      console.log(`  -> Przesyłanie trwa: "${text.trim().replace(/\s+/g, ' ') || 'brak etykiety postępu'}"`);
      lastLog = Date.now();
    }
    await page.waitForTimeout(pollMs);
  }
  throw new Error(`Przesyłanie nie zakończyło się w ${Math.round(timeoutMs / 60000)} min — NIE publikuję.`);
}

// Otwiera dialog „Edytuj wersję roboczą” dla filmu draftVideoId (zakładka Filmy lub Shorts).
async function openDraftDialog(page, channelId, videoId) {
  for (const tab of ['upload', 'short']) {
    await page.goto(`https://studio.youtube.com/channel/${channelId}/videos/${tab}?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.locator('ytcp-video-row').first().waitFor({ timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2500);
    for (let p = 0; p < 20; p++) {
      // Tak samo jak spis (yt_studio_inventory): id także z outerHTML — wiersze 4K w przetwarzaniu nie mają linku ani <img>.
      // Lista Studio dociąga dane kilka sekund — czekaj do 30 s, zanim uznasz, że wiersza nie ma na tej stronie.
      for (let t = 0; t < 20; t++) {
        const hit = await page.evaluate((id) => {
          let found = false;
          for (const r of document.querySelectorAll('ytcp-video-row')) if (r.outerHTML.includes(id)) { r.setAttribute('data-cc-target', id); found = true; }
          return found;
        }, videoId);
        if (hit) break;
        await page.waitForTimeout(1500);
      }
      const row = page.locator(`ytcp-video-row[data-cc-target="${videoId}"]`).first();
      if (await row.count()) {
        if (/anuluj przesyłanie|cancel upload/i.test(await row.innerText())) throw new Error(`Wersja robocza ${videoId} to przerwane wgranie — trzeba wgrać plik ponownie.`);
        await row.hover();
        const editBtn = row.locator('ytcp-button:has-text("Edytuj wersję roboczą"), button:has-text("Edytuj wersję roboczą"), ytcp-button:has-text("Edit draft")').first();
        if (!(await editBtn.isVisible().catch(() => false))) throw new Error(`Film ${videoId} nie ma jeszcze przycisku „Edytuj wersję roboczą” (YouTube go przetwarza) — ponów później.`);
        await editBtn.click();
        await page.locator('ytcp-uploads-dialog #title-textarea').first().waitFor({ timeout: 30000 });
        await page.waitForTimeout(2000);
        return;
      }
      const next = page.locator('#navigate-after').first();
      if (!(await next.isVisible().catch(() => false)) || (await next.getAttribute('aria-disabled')) === 'true') break;
      await next.click(); await page.waitForTimeout(3000);
    }
  }
  throw new Error(`Nie znaleziono wersji roboczej ${videoId} na kanale ${channelId}.`);
}

export async function uploadEpisodeToChannel({
  videoPath,
  metaPath,
  channelId = 'UCCqHRCEuSDhlRcvcQ6qM1Kw',
  channelName = 'Biblia Audio Christian Culture',
  visibility = 'public',
  draftVideoId = null,
  scheduleTime = undefined // np. '20:00' bieżący odcinek, domyślnie CC_YT_SCHEDULE_TIME || '18:00'
}) {
  console.log('\n========================================================');
  console.log(`🚀 PUBLIKACJA NA KANALE: ${channelName}`);
  console.log('========================================================\n');

  if (!fs.existsSync(videoPath)) throw new Error(`Brak pliku: ${videoPath}`);

  const already = findPublished(videoPath, channelId, HISTORY_FILE, channelName);
  if (already && !draftVideoId && process.env.CC_YT_ALLOW_REUPLOAD !== '1') {
    console.log(`⏭️  POMIJAM — ${path.basename(videoPath)} jest już w historii kanału ${channelName}: ${already.videoUrl} (${already.publishedAt}).`);
    console.log('    Jeśli w Studio to wersja robocza — opublikuj ją w Studio zamiast wgrywać ponownie.');
    return { success: true, skipped: true, title: already.title, videoUrl: already.videoUrl, channel: channelName };
  }

  let meta = {};
  if (metaPath && fs.existsSync(metaPath)) {
    try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch {}
  }

  const title = (meta.title || path.basename(videoPath, path.extname(videoPath))).slice(0, 100);
  const description = (meta.description || meta.full_description || title).slice(0, 5000);
  const tags = Array.isArray(meta.tags) ? meta.tags.join(', ') : (meta.tags || '');

  console.log(`• Tytuł: ${title}`);
  console.log(`• Plik: ${path.basename(videoPath)}`);
  const isShorts = /shorts/i.test(path.basename(videoPath));
  const schedule = visibility === 'public' ? scheduleTarget({ channelName, isShorts }, undefined, scheduleTime) : null;
  console.log(`• Widoczność: ${visibility}${schedule ? ` — zaplanowana na ${schedule.date} ${schedule.time}${isShorts ? '' : ' (premiera)'}` : ''}`);

  const { ctx, page } = await launchStudio();

  try {
    // 1. Otwórz Studio WŁAŚCIWEGO kanału (tożsamość + weryfikacja ID) — inaczej film trafia na kanał, na którym akurat jest sesja
    console.log(`[1/5] Otwieram Studio kanału: "${channelName}"...`);
    channelId = await openChannelStudio(page, channelName);
    console.log(`  -> Studio kanału potwierdzone: ${channelId}`);

    // Obsłuż ewentualny przycisk przejścia do Studio
    const proceed = page.locator('a[href*="approve_browser_access=true"], a:has-text("PRZEJDŹ DO YOUTUBE STUDIO")').first();
    if (await proceed.isVisible().catch(() => false)) {
      await proceed.click().catch(() => {});
      await page.waitForTimeout(3000);
    }

    // Zamknij ewentualne popupy/powiadomienia Studio (naruszenia, reklamy itp.)
    for (let pi = 0; pi < 3; pi++) {
      const popup = page.locator('ytcp-dialog paper-button:has-text("OK"), ytcp-dialog button:has-text("Rozumiem"), ytcp-dialog button:has-text("Zamknij"), tp-yt-paper-dialog button:has-text("OK"), tp-yt-paper-dialog button:has-text("Zamknij"), ytcp-button[dialog-confirm], button[dialog-confirm]').first();
      if (await popup.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('  -> Zamykam popup/powiadomienie Studio...');
        await popup.click({ force: true });
        await page.waitForTimeout(1000);
      } else break;
    }

    // Zamknij backdrop jeśli aktywny na stronie panelu (klikamy go przez JS — Playwright nie może przez backdrop)
    const hasPageBackdrop = await page.locator('tp-yt-iron-overlay-backdrop[opened]').first().isVisible().catch(() => false);
    if (hasPageBackdrop) {
      console.log('  -> Backdrop aktywny na panelu — zamykam przez JS click...');
      await page.evaluate(() => {
        const bd = document.querySelector('tp-yt-iron-overlay-backdrop[opened]');
        if (bd) bd.click();
      });
      await page.waitForTimeout(1000);
    }

    if (draftVideoId) {
      // 2–3. Dokończ istniejącą wersję roboczą (plik jest już w całości na YouTube — bez ponownego wgrywania)
      console.log(`[2/5] Otwieram wersję roboczą ${draftVideoId}...`);
      await openDraftDialog(page, channelId, draftVideoId);
    } else {
      // 2. Kliknij Utwórz -> Prześlij filmy
      console.log('[2/5] Otwieram formularz przesyłania...');
      const createBtn = page.locator('#create-icon, ytcp-button#create-icon, button[aria-label*="Utwórz"], button[aria-label*="Create"]').first();
      await createBtn.waitFor({ state: 'visible', timeout: 25000 });
      // Upewnij się że backdrop zniknął przed kliknięciem Utwórz
      await page.evaluate(() => {
        const bd = document.querySelector('tp-yt-iron-overlay-backdrop[opened]');
        if (bd) bd.click();
      });
      await page.waitForTimeout(500);
      await createBtn.click({ force: true });
      await page.waitForTimeout(1200);

      const uploadMenu = page.locator(
        'tp-yt-paper-item:has-text("Prześlij filmy"), tp-yt-paper-item:has-text("Upload videos"), ytcp-text-menu-item:has-text("Prześlij")'
      ).first();
      await uploadMenu.waitFor({ state: 'visible', timeout: 10000 });
      await uploadMenu.click({ force: true });
      await page.waitForTimeout(2000);

      // Upewnij się że dialog uploadu jest naprawdę otwarty
      const uploadDialogVisible = await page.locator('input[type="file"]').first().isVisible({ timeout: 8000 }).catch(() => false);
      console.log(`  -> Input pliku widoczny: ${uploadDialogVisible}`);

      // 3. Wgraj plik
      console.log('[3/5] Przesyłanie pliku do formularza...');
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.waitFor({ state: 'attached', timeout: 20000 });
      await fileInput.setInputFiles(path.resolve(videoPath));
      console.log('  -> Plik zaakceptowany.');
    }

    // 4. Wypełnij Tytuł, Opis, COPPA, Tagi
    console.log('[4/5] Uzupełnianie metadanych...');
    const titleBox = page.locator('#title-textarea #textbox, ytcp-social-suggestions-textbox#title-textarea div[contenteditable="true"]').first();
    await titleBox.waitFor({ state: 'visible', timeout: 45000 });
    await page.waitForTimeout(1000);
    await titleBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await titleBox.fill(title);
    await page.waitForTimeout(1000);

    // Usuń ewentualny dropdown podpowiedzi hashtagów, który zasłania pole opisu
    await page.evaluate(() => {
      const dd = document.querySelector('ytcp-social-suggestions-dropdown');
      if (dd) dd.remove();
    });
    await page.waitForTimeout(400);

    const descBox = page.locator('#description-textarea #textbox, ytcp-social-suggestions-textbox#description-textarea div[contenteditable="true"]').first();
    if (await descBox.count() > 0 && await descBox.isVisible()) {
      await descBox.click({ force: true });
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await descBox.fill(description);
      await page.waitForTimeout(1000);
    }

    // Ponownie usuń dropdown jeśli pojawił się po opisie
    await page.evaluate(() => {
      const dd = document.querySelector('ytcp-social-suggestions-dropdown');
      if (dd) dd.remove();
    });

    // COPPA: Nieprzeznaczony dla dzieci (opcjonalny dla kanałów z polityką globalną)
    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
    if (await notForKids.isVisible().catch(() => false)) {
      await notForKids.scrollIntoViewIfNeeded().catch(() => {});
      await notForKids.click({ force: true }).catch(() => {});
      console.log('  -> COPPA: Zaznaczono Nie dla dzieci.');
    } else {
      console.log('  -> COPPA: Pominięto (domyślna polityka kanału).');
    }
    await page.waitForTimeout(1000);

    // Tagi (opcjonalne)
    if (tags) {
      try {
        const showMore = page.locator(
          'ytcp-button#toggle-button:has-text("Pokaż więcej"), ytcp-button#toggle-button:has-text("Show more"), button:has-text("Pokaż więcej")'
        ).first();
        if (await showMore.isVisible().catch(() => false)) {
          await showMore.click();
          await page.waitForTimeout(1000);
          
          // Usuń domyślne tagi kanału, aby uniknąć przekroczenia limitu 500 znaków
          await page.evaluate(() => {
            const clearBtn = document.querySelector('#tags-container ytcp-icon-button[id="delete-all-button"], #tags-container button[aria-label*="Usuń"], #tags-container [id*="delete-all"]');
            if (clearBtn) {
              clearBtn.click();
            } else {
              const chips = document.querySelectorAll('ytcp-chip #delete-icon, ytcp-chip-shape button, ytcp-chip [id="delete-icon"]');
              chips.forEach(c => c.click());
            }
          });
          await page.waitForTimeout(600);

          const tagsInput = page.locator('input[aria-label*="Tagi"], input[aria-label*="Tags"], #tags-container input').first();
          if (await tagsInput.isVisible().catch(() => false)) {
            // Bezpieczny limit tagów: max 300 znaków
            const safeTags = typeof tags === 'string' ? tags.slice(0, 320) : '';
            if (safeTags) {
              await tagsInput.fill(safeTags);
              await page.keyboard.press('Enter');
              await page.waitForTimeout(800);
            }
          }

          // Weryfikacja: jeśli tagi przekraczają dozwoloną liczbę znaków, usuwaj pojedynczo aż błąd zniknie
          for (let ti = 0; ti < 10; ti++) {
            const hasTagError = await page.evaluate(() => {
              const text = document.body.innerText || '';
              return text.includes('Tagi przekraczają dozwoloną liczbę znaków') ||
                     !!document.querySelector('#tags-container [invalid], #tags-container.invalid');
            });
            if (hasTagError) {
              console.log('  -> Wykryto przekroczenie limitu tagów! Usuwam ostatni tag...');
              await page.evaluate(() => {
                const chips = document.querySelectorAll('ytcp-chip #delete-icon, ytcp-chip-shape button, ytcp-chip [id="delete-icon"]');
                if (chips.length > 0) chips[chips.length - 1].click();
              });
              await page.waitForTimeout(500);
            } else {
              break;
            }
          }
        }
      } catch (err) {
        console.warn('  -> Tagi pominięte:', err.message);
      }
    }

    // Pobierz stały link wideo jeśli dostępny
    let videoUrl = '';
    try {
      const linkElem = page.locator('span.video-url-fadeable a, a.ytcp-video-info, a[href*="youtu.be"], a.ytcp-video-share-dialog, a[href*="/shorts/"]').first();
      await linkElem.waitFor({ state: 'attached', timeout: 15000 });
      videoUrl = (await linkElem.getAttribute('href')) || (await linkElem.innerText()) || '';
      if (videoUrl) console.log(`  -> Stały URL filmu: ${videoUrl}`);
    } catch {}

    // 5. Pętla przechodzenia przez kroki aż do kroku Widoczność
    console.log('[5/5] Przechodzenie do widoczności i publikacja...');
    let reachedVisibility = false;
    let monetizationDone = false;
    let adRatingDone = false;

    // Pętla: max 120 iteracji × ~5s = ~10 minut — wystarczy na upload dużego pliku 4K
    for (let step = 0; step < 120; step++) {
      await page.waitForTimeout(3000);
      if (step % 5 === 0) console.log(`  [pętla krok ${step}] sprawdzam stan formularza...`);

      // Czy radio PUBLIC jest widoczne? → koniec pętli
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
      if (await pubRadio.isVisible().catch(() => false)) {
        console.log(`  -> Osiągnięto krok Widoczność (iteracja ${step})!`);
        reachedVisibility = true;
        break;
      }

      // UWAGA: NIE sprawdzamy iron-overlay-backdrop — backdrop dialogu YT Studio to normalny
      // element tła modalu, NIE blokuje kliknięć w przyciski dialogu.
      // Pressing Escape zamknęłoby cały dialog uploadu!

      // Krok Zarabianie (Monetization)
      if (!monetizationDone) {
        const monetContainer = page.locator('ytcp-uploads-monetization').first();
        if (await monetContainer.isVisible().catch(() => false)) {
          const m10nTrigger = monetContainer.locator('div.m10n-text.clickable, ytcp-video-monetization').first();
          if (await m10nTrigger.isVisible().catch(() => false)) {
            const triggerText = await m10nTrigger.innerText().catch(() => '');
            const needsAction = triggerText.includes('Wybierz') || triggerText.trim() === '' || triggerText.includes('Select');
            if (!needsAction) {
              console.log(`  -> Krok Zarabianie: już ustawione ("${triggerText.trim()}"), oznaczam jako gotowe.`);
              monetizationDone = true;
            } else {
              console.log(`  -> Krok Zarabianie: otwieram wybór...`);
              // Usuń dropdown podpowiedzi (NIE Escape — zamknęłoby dialog)
              await page.evaluate(() => { document.querySelector('ytcp-social-suggestions-dropdown')?.remove(); });
              await page.waitForTimeout(400);
              await m10nTrigger.click({ force: true });
              await page.waitForTimeout(1500);

              const radioOn = page.locator('tp-yt-paper-radio-button#radio-on, tp-yt-paper-radio-button[name="ON"]').first();
              if (await radioOn.isVisible().catch(() => false)) {
                console.log(`  -> Wybieram Włącz...`);
                await radioOn.click({ force: true });
                await page.waitForTimeout(800);
              }

              const doneM10n = page.locator('ytcp-button:has-text("Gotowe"), button:has-text("Gotowe")').first();
              if (await doneM10n.isVisible().catch(() => false)) {
                console.log(`  -> Klikam Gotowe monetization...`);
                await doneM10n.click({ force: true });
                await page.waitForTimeout(2000);
                monetizationDone = true;
              }
            }
          }
        }
      }

      // Krok Możliwość wyświetlania reklam (Ad suitability)
      if (!adRatingDone) {
        const noneBox = page.locator('ytcp-checkbox-lit.all-none-checkbox, ytcp-checkbox-lit:has-text("Żadne z powyższych")').first();
        if (await noneBox.isVisible().catch(() => false)) {
          console.log(`  -> Krok Ocena reklam: zaznaczam "Żadne z powyższych"...`);
          await noneBox.scrollIntoViewIfNeeded().catch(() => {});
          await noneBox.click({ force: true });
          await page.waitForTimeout(1500);

          const submitRatingBtn = page.locator('ytcp-button:has-text("Prześlij ocenę"), button:has-text("Prześlij ocenę")').first();
          if (await submitRatingBtn.isVisible().catch(() => false)) {
            console.log(`  -> Klikam "Prześlij ocenę"...`);
            await submitRatingBtn.click({ force: true });
            await page.waitForTimeout(2500);
            adRatingDone = true;
          }
        }
      }

      // Kliknij przycisk Dalej — bezwarunkowo (backdrop dialogu nie blokuje kliknięć)
      const nextBtn = page.locator('#next-button, ytcp-button#next-button').first();
      if (await nextBtn.isVisible().catch(() => false)) {
        const isDis = await nextBtn.getAttribute('aria-disabled').catch(() => 'false');
        if (isDis !== 'true') {
          console.log(`  -> Klikam Dalej (iteracja ${step})...`);
          await nextBtn.click({ force: true });
          await page.waitForTimeout(2500);
        } else {
          // Jeśli Dalej zablokowany, sprawdź czy tagi nie generują błędu walidacji
          const hasTagError = await page.evaluate(() => {
            return (document.body.innerText || '').includes('Tagi przekraczają dozwoloną liczbę znaków');
          }).catch(() => false);
          if (hasTagError) {
            console.log(`  -> [Auto-fix] Błąd limitu tagów blokuje Dalej! Usuwam chipy tagów...`);
            await page.evaluate(() => {
              const chips = document.querySelectorAll('ytcp-chip #delete-icon, ytcp-chip-shape button, ytcp-chip [id="delete-icon"]');
              if (chips.length > 0) chips[chips.length - 1].click();
            });
            await page.waitForTimeout(1000);
          } else {
            // Dalej zablokowany = plik wciąż się przesyła. Czekamy cicho.
            if (step % 10 === 0) console.log(`  -> Dalej zablokowany — oczekuję na zakończenie przesyłania (iteracja ${step})...`);
            await page.waitForTimeout(3000);
          }
        }
      } else {
        // YouTube rozpoznał ten sam plik i WZNOWIŁ wcześniejsze przerwane wgranie: zamiast dialogu jest strona filmu.
        const resumedId = !draftVideoId && step >= 2 && (page.url().match(/\/video\/([\w-]{11})\/edit/) || [])[1];
        if (resumedId) {
          console.log(`  -> YouTube wznowił wcześniejsze wgranie tego pliku (${resumedId}) — czekam na koniec przesyłania...`);
          await waitForUploadComplete(page, { selector: 'ytcp-multi-progress-monitor' });
          const err = new Error(`Wznowione wgranie ${resumedId} — dokańczam jako wersję roboczą.`);
          err.resumedVideoId = resumedId;
          throw err;
        }
        if (step % 10 === 0) console.log(`  -> Brak przycisku Dalej (iteracja ${step}), czekam...`);
        await page.waitForTimeout(3000);
      }
    }

    // Ustaw widoczność
    if (!reachedVisibility) {
      // Ostatnia szansa: poczekaj jeszcze 15s na pojawienie się kroku Widoczność
      console.log('  -> Pętla zakończona bez widoczności — czekam dodatkowe 15s...');
      await page.waitForTimeout(15000);
      const pubFinal = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
      reachedVisibility = await pubFinal.isVisible().catch(() => false);
      if (!reachedVisibility) {
        // Zrób screenshot diagnostyczny
        await page.screenshot({ path: 'youtube_publish_visibility_debug.png', fullPage: true });
        throw new Error('Nie osiągnięto kroku Widoczność po 40 iteracjach + 15s. Screenshot: youtube_publish_visibility_debug.png');
      }
    }

    if (visibility === 'unlisted') {
      const unlisted = page.locator('tp-yt-paper-radio-button[name="UNLISTED"], [name="UNLISTED"]').first();
      await unlisted.click({ force: true });
    } else if (visibility === 'private') {
      const priv = page.locator('tp-yt-paper-radio-button[name="PRIVATE"], [name="PRIVATE"]').first();
      await priv.click({ force: true });
    } else if (schedule) {
      await scheduleVisibility(page, schedule, !isShorts);
    } else {
      const pub = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
      await pub.waitFor({ state: 'visible', timeout: 15000 });
      await pub.click({ force: true });
    }
    await page.waitForTimeout(1500);

    // Publikuj dopiero po pełnym przesłaniu pliku
    if (!draftVideoId) {
      console.log('Oczekiwanie na zakończenie przesyłania pliku...');
      const uploadLabel = await waitForUploadComplete(page);
      console.log(`  -> Przesyłanie zakończone: "${uploadLabel.replace(/\s+/g, ' ')}"`);
    }

    // Kliknij Publikuj / Zapisz
    const doneBtn = page.locator('#done-button, button#done-button, ytcp-button#done-button, button:has-text("Opublikuj"), button:has-text("Publish")').first();
    await doneBtn.waitFor({ state: 'visible', timeout: 15000 });
    await doneBtn.click();

    // Sukces tylko, gdy YouTube pokaże okno „opublikowano” (lub „nadal przetwarzany — zostanie opublikowany”)
    console.log('Oczekiwanie na potwierdzenie publikacji przez YouTube...');
    // Okno „Nadal sprawdzamy Twoje treści” (sprawdzanie praw autorskich w toku) trzeba zamknąć „OK” — dopiero wtedy YouTube pokazuje potwierdzenie.
    const confirmText = page.getByText(/Film został (zaplanowany|opublikowany)|Film zostanie opublikowany|Video (published|scheduled)|Video will be published/).first();
    const stillChecking = page.locator('tp-yt-paper-dialog:visible, ytcp-dialog:visible').filter({ hasText: /Nadal sprawdzamy|still checking/i }).first();
    let confirmed = false;
    let clickedOk = false;
    for (const end = Date.now() + 90000; Date.now() < end && !confirmed;) {
      if (await confirmText.isVisible().catch(() => false)) { confirmed = true; break; }
      if (await stillChecking.isVisible().catch(() => false)) {
        console.log('  -> YouTube: „Nadal sprawdzamy Twoje treści” — zamykam OK.');
        await stillChecking.locator('ytcp-button, button').filter({ hasText: /^\s*OK\s*$/ }).first().click().then(() => { clickedOk = true; }).catch(() => {});
      }
      await page.waitForTimeout(1500);
      if (!confirmed && clickedOk && !(await page.locator('ytcp-uploads-dialog #title-textarea').first().isVisible().catch(() => false))) {
        confirmed = true; // dialog zamknięty po OK = zaplanowano; stan i tak weryfikuje yt_reconcile_history
      }
    }
    if (!confirmed) {
      await page.screenshot({ path: 'youtube_publish_not_confirmed.png', fullPage: true }).catch(() => {});
      throw new Error('YouTube nie potwierdził publikacji (brak okna udostępniania). Film może być wersją roboczą. Screenshot: youtube_publish_not_confirmed.png');
    }

    if (!videoUrl) {
      try {
        const finalLink = page.locator('a.ytcp-video-share-dialog, a[href*="youtu.be"], a[href*="/shorts/"], #share-url a, input#share-url, input[readonly][value*="youtu.be"]').first();
        if (await finalLink.count() > 0) {
          videoUrl = (await finalLink.getAttribute('href')) || (await finalLink.getAttribute('value')) || (await finalLink.innerText()) || '';
        }
      } catch {}
    }

    console.log('\n========================================================');
    console.log(`🎉 SUKCES! Film ${schedule ? `zaplanowany (${schedule.date} ${schedule.time})` : 'opublikowany'} na kanale: ${channelName}`);
    console.log(`🔗 Link do filmu: ${videoUrl}`);
    console.log('========================================================\n');

    // Zapisz do bazy historii — błąd zapisu przerywa proces (inaczej kolejne uruchomienie zrobi dubel)
    const dir = path.dirname(HISTORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const data = readHistory();
    data.published.push({
      title,
      videoFile: path.basename(videoPath),
      channel: channelName,
      channelId,
      videoUrl: videoUrl || (draftVideoId ? `https://youtu.be/${draftVideoId}` : 'https://studio.youtube.com'),
      completedDraft: draftVideoId || undefined,
      visibility,
      scheduledFor: schedule ? `${schedule.date} ${schedule.time} Europe/Warsaw` : null,
      scheduledDate: schedule ? schedule.ymd : undefined,
      premiere: Boolean(schedule && !isShorts),
      confirmedByYouTube: true,
      publishedAt: new Date().toISOString()
    });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2), 'utf8');

    await ctx.close();
    return { success: true, title, videoUrl, channel: channelName };

  } catch (err) {
    if (err.resumedVideoId) {
      // plik jest już w całości na YouTube — zamknięcie przeglądarki niczego nie przerwie
      console.log(`  -> ${err.message}`);
      await ctx.close();
      return uploadEpisodeToChannel({ videoPath, metaPath, channelId, channelName, visibility, draftVideoId: err.resumedVideoId, scheduleTime });
    }
    console.error(`❌ BŁĄD PUBLIKACJI:`, err.message);
    try {
      await page.screenshot({ path: 'youtube_publish_final_error.png', fullPage: true });
      console.log('Zrzut ekranu zapisany do: youtube_publish_final_error.png');
    } catch {}
    await ctx.close();
    throw err;
  }
}

if (process.argv[1] && path.basename(process.argv[1]) === 'publish_perfect.mjs') {
  const args = process.argv.slice(2);
  let video = args[0] || 'C:\\Users\\czark\\Desktop\\Biblia Audio CC — Gotowe do Emisji\\01_Stary_Testament\\01_Ksiega_Rodzaju\\Ksiega_Rodzaju_1_1-19_Biblia_Audio_CC_4K.mp4';
  let meta = args[1] || 'C:\\Users\\czark\\Desktop\\Biblia Audio CC — Gotowe do Emisji\\01_Stary_Testament\\01_Ksiega_Rodzaju\\Ksiega_Rodzaju_1_1-19_metadata.json';
  let chId = args[2] || 'UCCqHRCEuSDhlRcvcQ6qM1Kw';
  let chName = args[3] || 'Biblia Audio Christian Culture';

  uploadEpisodeToChannel({ videoPath: video, metaPath: meta, channelId: chId, channelName: chName, visibility: 'public' })
    .catch(() => process.exit(1));
}
