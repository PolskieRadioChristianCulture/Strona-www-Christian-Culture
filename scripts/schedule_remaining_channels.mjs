import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import path from 'path';
import fs from 'fs';

const THUMB_PATH = path.resolve('images/wieczor_ze_slowem_bozym_live_bg.jpg');

const CHANNELS_TO_SCHEDULE = [
  'Osobowość +',
  'Christian Culture TV',
  'Polskie Radio CHRISTIAN CULTURE',
  'CC Women'
];

async function scheduleSingleChannel(page, channelName) {
  console.log(`\n======================================================`);
  console.log(`▶ ROZPOCZYNAM PLANOWANIE LIVE DLA: ${channelName}`);
  console.log(`======================================================`);

  // 1. Otwórz Studio
  const channelId = await openChannelStudio(page, channelName, '/livestreaming/manage');
  await page.waitForTimeout(4000);

  // 2. Kliknij "Zaplanuj transmisję"
  console.log('2. Klikam Zaplanuj transmisję...');
  const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
  await schedBtn.click();
  await page.waitForTimeout(2500);

  const createNewBtn = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
  if (await createNewBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
    console.log('   Klikam Utwórz nowe...');
    await createNewBtn.click();
    await page.waitForTimeout(2000);
  }

  // 3. Step 1: Szczegóły
  console.log('3. Wypełniam dane w kroku 1 (Szczegóły)...');
  const titleBox = page.locator('#title-textarea #textbox').first();
  await titleBox.click();
  await titleBox.fill('Wieczór ze Słowem Bożym • Zaznaj spokoju serca [LIVE 20:00]');

  const descBox = page.locator('#description-textarea #textbox').first();
  if (await descBox.isVisible({ timeout: 2000 }).catch(() => false)) {
    const descText = `Wieczór ze Słowem Bożym • Zaznaj spokoju serca\nTransmisja na żywo: Poniedziałek, 16 listopada 2026, godz. 20:00 - 24:00.\n\nDołącz do wspólnego wieczoru z Pismem Świętym, kojącą muzyką i rozważaniem Bożego Słowa.\nZatrzymaj się po całym dniu i napełnij swoje serce pokojem, który przewyższa wszelki umysł (Flp 4,7).\n\n📖 Słuchaj również 24/7 na żywo w Radiu Christian Culture:\nhttps://polskieradio.cc/wieczor\n\n#SlowoBoze #WieczorZeSlowemBozym #Biblia #SpokojSerca #ChristianCulture #Modlitwa #Live`;
    await descBox.click();
    await descBox.fill(descText);
  }

  // Miniatura
  if (fs.existsSync(THUMB_PATH)) {
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null);
    const thumbBtn = page.locator('#upload-thumbnail, ytcp-button:has-text("Prześlij miniaturę"), ytcp-thumbnails-compact-editor-uploader').first();
    if (await thumbBtn.isVisible().catch(() => false)) {
      await thumbBtn.click().catch(() => {});
      const fileChooser = await fileChooserPromise;
      if (fileChooser) {
        await fileChooser.setFiles(THUMB_PATH);
        console.log('   Miniatura przesłana:', THUMB_PATH);
        await page.waitForTimeout(2500);
      }
    }
  }

  // Odbiorcy: Nie przeznaczone dla dzieci
  const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  await notForKids.click();
  await page.waitForTimeout(1000);

  // 4. Przechodzimy przez kolejne kroki
  console.log('4. Przechodzę do widoczności...');
  for (let i = 0; i < 3; i++) {
    const nextBtn = page.locator('#next-button, button:has-text("Dalej"), ytcp-button:has-text("Dalej")').first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // 5. Krok 4: Widoczność i godzina
  console.log('5. Ustawiam godzinę 20:00 i Publiczny...');
  const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  if (await publicRadio.isVisible().catch(() => false)) {
    await publicRadio.click();
    await page.waitForTimeout(1000);
  }

  const timeInput = page.locator('#time-of-day-container input').first();
  if (await timeInput.isVisible().catch(() => false)) {
    await timeInput.click();
    await timeInput.fill('20:00');
    await timeInput.press('Enter');
    await page.waitForTimeout(1000);
  }

  // 6. Kliknij Gotowe
  console.log('6. Klikam Gotowe...');
  const gotoweBtn = page.locator('ytcp-button:has-text("Gotowe"), button:has-text("Gotowe")').first();
  await gotoweBtn.click();
  await page.waitForTimeout(7000);

  // Zamknij ewentualny popup sukcesu
  const closeBtn = page.locator('ytcp-button:has-text("Zamknij"), button:has-text("Zamknij")').first();
  if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(2000);
  }

  // 7. Pobierz videoId z listy zaplanowanych
  await page.goto(`https://studio.youtube.com/channel/${channelId}/videos/live`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  const videoInfo = await page.evaluate(() => {
    const row = document.querySelector('ytcp-video-row');
    if (!row) return null;
    const link = row.querySelector('a[href*="/video/"]');
    const href = link ? link.href : '';
    const match = href.match(/\/video\/([a-zA-Z0-9_-]+)/);
    const videoId = match ? match[1] : null;
    const text = row.innerText.trim().replace(/\n+/g, ' | ');
    return { videoId, text };
  });

  console.log(`   Wynik dla ${channelName}:`, JSON.stringify(videoInfo));

  // 8. Upewnij się, że widoczność to PUBLICZNY
  if (videoInfo && videoInfo.videoId) {
    const editUrl = `https://studio.youtube.com/video/${videoInfo.videoId}/edit`;
    console.log(`   Sprawdzam/ustawiam Publiczny na: ${editUrl}`);
    await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('ytcp-video-metadata-visibility', { timeout: 30000 }).catch(() => null);
    await page.waitForTimeout(2000);

    const isPublic = await page.evaluate(() => {
      const el = document.querySelector('ytcp-video-metadata-visibility');
      return el ? el.innerText.includes('Publiczny') && !el.innerText.includes('Niepubliczny') : false;
    });

    if (!isPublic) {
      console.log('   Przestawiam na Publiczny...');
      await page.locator('ytcp-video-metadata-visibility').first().click();
      await page.waitForTimeout(1500);

      let pub = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
      if (!(await pub.isVisible().catch(() => false))) {
        pub = page.locator('tp-yt-paper-radio-button').filter({ hasText: /^\s*Publiczny/ }).first();
      }
      await pub.click();
      await page.waitForTimeout(1000);

      await page.locator('#save-button').filter({ hasText: 'Gotowe' }).first().click();
      await page.waitForTimeout(1500);

      const save = page.locator('ytcp-button#save').first();
      await save.click();
      await page.waitForTimeout(4000);
      console.log('   Zapisano widoczność Publiczny!');
    } else {
      console.log('   Transmisja jest już PUBLICZNA!');
    }

    return {
      channel: channelName,
      channelId,
      videoId: videoInfo.videoId,
      watchUrl: `https://youtube.com/live/${videoInfo.videoId}`,
      status: 'PUBLICZNY'
    };
  }

  return { channel: channelName, channelId, status: 'UNKNOWN' };
}

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const results = [];

  try {
    for (const ch of CHANNELS_TO_SCHEDULE) {
      try {
        const res = await scheduleSingleChannel(page, ch);
        results.push(res);
        const safeName = ch.replace(/[^a-zA-Z0-9]/g, '_');
        await page.screenshot({ path: `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scheduled_${safeName}.png` });
      } catch (err) {
        console.error(`BŁĄD DLA ${ch}:`, err);
        results.push({ channel: ch, error: err.message });
      }
    }

    console.log('\n======================================================');
    console.log('🎉 RAPORT KOŃCOWY ZAPLANOWANYCH KANAŁÓW:');
    console.log(JSON.stringify(results, null, 2));
    console.log('======================================================');

    fs.writeFileSync(
      'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\data\\wieczor_scheduled_channels.json',
      JSON.stringify(results, null, 2)
    );

  } finally {
    await ctx.close();
  }
}

main();
