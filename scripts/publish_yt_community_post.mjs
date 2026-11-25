/**
 * ============================================================================
 * CHRISTIAN CULTURE — YOUTUBE COMMUNITY ENGINE (POSTY, ANKIETY, QUIZY, GRAFIKI)
 * Automatycznie podtrzymuje kontakt z widzami na 7 głównych kanałach YouTube CC.
 *
 * Harmonogram tygodniowy (--daily, codziennie o 12:00 Europe/Warsaw):
 *   • Poniedziałek / Czwartek -> Quiz biblijny z bieżącej lekcji Kursu Codziennego
 *   • Wtorek / Piątek         -> Ankieta tekstowa dla widzów (rotacja tematów)
 *   • Środa / Sobota          -> Post z grafiką 1:1 (Wiadomość z Nieba, Apokalipsa, Biblia Audio, MojaBiblia, LUMINA, WspieramTO)
 *   • Niedziela               -> Post z grafiką 1:1 i wersetem na nowy tydzień
 *
 * Użycie:
 *   node scripts/publish_yt_community_post.mjs --daily
 *   node scripts/publish_yt_community_post.mjs --daily --channel "Osobowość +"
 *   node scripts/publish_yt_community_post.mjs --type poll --daily
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchStudio } from './yt_studio_session.mjs';
import { generateWiadomoscZNiebaCard } from './generate_wiadomosc_z_nieba_card.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'data', 'yt_community_posts_state.json');

export const COMMUNITY_CHANNELS = [
  { name: 'Osobowość +', id: 'UCHmPxDM2zzlUAf5ZvlotPLw', handle: '@osobowośćPLUS' },
  { name: 'Christian Culture TV', id: 'UCG5Y4dwJi5436Gu6QH3nNUQ', handle: '@ChristianCultureTV' },
  { name: 'Polskie Radio CHRISTIAN CULTURE', id: 'UCNnCdsJ-K6FXulZzXZHWkjQ', handle: '@RadioChristianCulture' },
  { name: 'CC Women', id: 'UC-LPFt-vmJCeap746DOWMgw', handle: '@CCWomen7' },
  { name: 'CC Men', id: 'UCUpuq9JS7jitIcm9iBn0jnA', handle: '@CCMen7' },
  { name: 'Werset Dnia - Chrześcijański Serwis Biblijny', id: 'UCyOvW5DuDLVq5XWFyijgtbw', handle: '@wersetdnia_ChSB' },
  { name: 'Biblia Audio Christian Culture', id: 'UCCqHRCEuSDhlRcvcQ6qM1Kw', handle: '@bibliaaudiocc' }
];

const POLL_BANK = [
  {
    id: 'poll_morning_habit',
    question: 'O której porze najchętniej sięgasz po Słowo Boże lub słuchasz Biblii Audio? 📖☀️',
    options: ['Wcześnie rano (przed pracą)', 'W drodze / w samochodzie', 'Po południu w przerwie', 'Wieczorem przed snem']
  },
  {
    id: 'poll_prayer_focus',
    question: 'O co najbardziej potrzebujesz dziś modlitwy? Zaznacz w ankiecie lub napisz w komentarzu — modlimy się razem! 🙏',
    options: ['Pokój serca i uwolnienie od stresu', 'Zdrowie dla mnie lub bliskich', 'Mądrość w ważnej decyzji', 'Wzmocnienie wiary i rodziny']
  },
  {
    id: 'poll_favorite_format',
    question: 'Która seria z naszego ekosystemu Christian Culture najbardziej pomaga Ci na co dzień? ✨',
    options: ['Biblia Audio (słuchowisko)', 'Apokalipsa Dzień po Dniu', 'Kurs Codzienny „Z Biblią za Pan Brat”', 'Wiadomość z Nieba i Radio 24/7']
  },
  {
    id: 'poll_bible_book',
    question: 'Jaką księgę Biblii najchętniej studiujesz razem z nami w tym miesiącu? 📖',
    options: ['Księga Rodzaju i Wyjścia', 'Psalmy i Przypowieści', 'Ewangelie (Jana, Mateusza)', 'Księga Apokalipsy i proroctwa']
  }
];

function loadTodayWiadomoscZNieba(ymd) {
  try {
    const dataPath = path.join(ROOT, 'wiadomosc-z-nieba', 'data.json');
    if (!fs.existsSync(dataPath)) return null;
    const d = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const entry = (d.tenDays || []).find(x => x.runDate === ymd) || (d.tenDays || [])[0];
    if (!entry?.verse) return null;
    const datedCard = path.join(ROOT, 'images', 'social', 'yt-community', `wiadomosc_z_nieba_${ymd}.jpg`);
    const fallbackCard = path.join(ROOT, 'images', 'wiadomosc-z-nieba', 'szablon-1x1.jpg');
    return {
      ref: entry.verse.referencePl || entry.verse.reference,
      text: entry.verse.text,
      image: fs.existsSync(datedCard) ? datedCard : fallbackCard
    };
  } catch {
    return null;
  }
}

function buildPromoBank(ymd) {
  const wzn = loadTodayWiadomoscZNieba(ymd);
  const wznText = wzn
    ? [
        `📩 Masz dziś nową Wiadomość z Nieba:`,
        '',
        `„${wzn.text}”`,
        `— ${wzn.ref} (Biblia UBG-2025)`,
        '',
        `Każdego dnia o 07:00 czeka na Ciebie świeży werset ze Słowa Bożego i chwila refleksji na dobry dzień.`,
        '',
        `📖 Otwórz dzisiejszą Wiadomość z Nieba:`,
        `https://polskieradio.cc/wiadomosc-z-nieba/`,
        '',
        `📻 Radio 24/7, Biblia Audio, MojaBiblia i Kurs Codzienny (zawsze bezpłatnie):`,
        `https://polskieradio.cc`,
        '',
        `Napisz w komentarzu, jak ten werset przemawia dziś do Ciebie! 💛`,
        `#WiadomośćZNieba #Biblia #SłowoBoże #ChristianCulture #Wiara`
      ].join('\n')
    : [
        '📩 Nie masz nowych wiadomości? A może jedna czeka dziś na Ciebie od Boga?',
        '',
        '📖 Przeczytaj dzisiejszą Wiadomość z Nieba:',
        'https://polskieradio.cc/wiadomosc-z-nieba/',
        '',
        '📻 Radio 24/7, Biblia Audio, MojaBiblia i Kurs Codzienny:',
        'https://polskieradio.cc',
        '',
        '#WiadomośćZNieba #Biblia #SłowoBoże #ChristianCulture #Wiara'
      ].join('\n');

  return [
    {
      id: `promo_wiadomosc_z_nieba_${ymd}`,
      image: wzn?.image || path.join(ROOT, 'images', 'wiadomosc-z-nieba', 'szablon-1x1.jpg'),
      text: wznText
    },
    {
      id: 'promo_apokalipsa_dpd',
      image: 'H:\\Mój dysk\\Apokalipsa Dzień po Dniu\\cover_spotify_3000x3000.jpg',
      text: [
        '📖 „Apokalipsa Dzień po Dniu” — 365 krótkich rozważań, werset po wersecie przez wszystkie 22 rozdziały Księgi Objawienia!',
        '',
        'Każdego dnia publikujemy nowy odcinek na YouTube oraz na Spotify, aby proroctwa Biblii były jasne, praktyczne i pełne nadziei w Jezusie Chrystusie.',
        '',
        '🎧 Słuchaj na Spotify: https://open.spotify.com/show/4gzexFk8sksSCFCkFb769E',
        '🌐 Pełny ekosystem i Kurs Codzienny: https://polskieradio.cc/akademia',
        '',
        'Słuchasz już z nami codziennie? Daj znać w komentarzu! 👇',
        '#ApokalipsaDzieńPoDniu #Apokalipsa #Biblia #ChristianCulture'
      ].join('\n')
    },
    {
      id: 'promo_mojabiblia_akademia',
      image: wzn?.image || path.join(ROOT, 'images', 'wiadomosc-z-nieba', 'szablon-1x1.jpg'),
      text: [
        '📖 Czy znasz już bezpłatną interlinearną MojaBiblia i Kurs Codzienny „Z Biblią za Pan Brat”?',
        '',
        'Codziennie nowa lekcja z komentarzem, kodami Stronga (hebrajski / grecki) i 20 pytaniami quizu — krok po kroku przez wszystkie 66 ksiąg Pisma Świętego!',
        '',
        '👉 Dzisiejsza lekcja: https://polskieradio.cc/akademia',
        '👉 Czytaj Biblię (UBG + interlinia): https://polskieradio.cc/mojabiblia',
        '',
        'Który dzień kursu masz już za sobą? Napisz poniżej! ✨',
        '#ZBibliąZaPanBrat #MojaBiblia #AkademiaBiblijna #ChristianCulture'
      ].join('\n')
    }
  ];
}

function loadState() {
  if (fs.existsSync(STATE_PATH)) {
    try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); } catch {}
  }
  return { version: '1.0', postsByDate: {}, promoIndex: 0, pollIndex: 0 };
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function getWarsawDateInfo() {
  const now = new Date();
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(now);
  const dowStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Warsaw', weekday: 'short' }).format(now);
  const dowMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const [y, m, d] = ymd.split('-').map(Number);
  let kcDay = 56;
  if (y === 2026 && m === 10) kcDay = d;
  else if (y === 2026 && m === 11) kcDay = 31 + d;
  else if (y === 2026 && m === 12) kcDay = 61 + d;
  return { ymd, dow: dowMap[dowStr] ?? 3, kcDay };
}

function loadQuizFromKcDay(kcDay) {
  const p = path.join(ROOT, 'akademia', 'kurscodzienny', `dzien-${kcDay}.html`);
  if (!fs.existsSync(p)) return null;
  const html = fs.readFileSync(p, 'utf8');
  const m = html.match(/const QUIZ_DATA = (\[[\s\S]*?\]);/);
  if (!m) return null;
  try {
    const arr = JSON.parse(m[1]);
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const item = arr[0];
    const cleanQ = item.q.replace(/^\d+\.\s*/, '');
    return {
      question: `📖 Quiz Biblijny (Dzień ${kcDay} Kursu Codziennego): ${cleanQ}\n\nPełna lekcja i 20 pytań 👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-${kcDay}`,
      options: item.a.slice(0, 4).map(o => o.slice(0, 80)),
      correctIndex: item.c ?? 0
    };
  } catch {
    return null;
  }
}

export function buildDailyPostPayload(state, forcedType = null) {
  const { ymd, dow, kcDay } = getWarsawDateInfo();
  let type = forcedType;
  if (!type) {
    if (dow === 1 || dow === 4) type = 'quiz';
    else if (dow === 2 || dow === 5) type = 'poll';
    else type = 'image';
  }

  if (type === 'quiz') {
    const quiz = loadQuizFromKcDay(kcDay);
    if (quiz) return { ymd, type: 'quiz', id: `quiz_kc_${kcDay}`, ...quiz };
    type = 'poll';
  }

  if (type === 'poll') {
    const idx = (state.pollIndex || 0) % POLL_BANK.length;
    const poll = POLL_BANK[idx];
    return { ymd, type: 'poll', ...poll, nextPollIndex: idx + 1 };
  }

  const promoBank = buildPromoBank(ymd);
  const idx = (state.promoIndex || 0) % promoBank.length;
  const promo = promoBank[idx];
  return { ymd, type: 'image', ...promo, nextPromoIndex: idx + 1 };
}

async function switchYouTubeChannel(page, ch) {
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2500);

  const avatarBtn = page.locator('button#avatar-btn').first();
  await avatarBtn.waitFor({ state: 'visible', timeout: 20000 });
  await avatarBtn.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('ytd-compact-link-renderer, tp-yt-paper-item').filter({ hasText: /Przełącz konto|Switch account/i }).first();
  await switchItem.waitFor({ state: 'visible', timeout: 10000 });
  await switchItem.click();
  await page.waitForTimeout(2500);

  // Match by handle first (most precise), fallback to channel name
  const accountItems = page.locator('ytd-account-item-renderer');
  let target = accountItems.filter({ hasText: ch.handle }).first();
  if ((await target.count()) === 0) {
    target = accountItems.filter({ hasText: ch.name }).first();
  }
  await target.waitFor({ state: 'attached', timeout: 10000 });
  await target.evaluate((el) => {
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    el.click();
  });
  await page.waitForTimeout(5500);

  // Navigate to this channel's Posts tab
  await page.goto(`https://www.youtube.com/channel/${ch.id}/posts`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
}

async function publishPostOnCurrentChannel(page, payload) {
  // Confirm visible composer container
  const postBtn = page.locator('button[aria-label="Opublikuj"]:visible, button[aria-label="Post"]:visible').first();
  const visibleComposer = await postBtn.isVisible({ timeout: 10000 }).catch(() => false);
  if (!visibleComposer) {
    throw new Error('Brak formularza tworzenia posta na karcie /posts (kanał może wymagać włączenia zakładki Posty lub nie przełączył konta).');
  }

  const composer = page.locator('ytd-backstage-post-dialog-renderer').filter({ has: page.locator('button[aria-label="Opublikuj"]:visible, button[aria-label="Post"]:visible') }).first();

  async function focusAndTypeText(str) {
    // Click directly on the visible text input area inside the active composer (above the Obraz/Ankieta toolbar)
    const imgBtn = composer.locator('button[aria-label="Dodaj grafikę"]:visible, button[aria-label="Add image"]:visible').first();
    const ceVis = composer.locator('[contenteditable="true"]:visible, textarea:visible').first();
    if (await ceVis.isVisible().catch(() => false)) {
      await ceVis.click();
    } else if (await imgBtn.isVisible().catch(() => false)) {
      const box = await imgBtn.boundingBox();
      if (box) {
        // Click 45px above the "Obraz" button — right inside "Napisz coś do swoich fanów"
        await page.mouse.click(box.x + 40, box.y - 45);
        await page.waitForTimeout(500);
      }
    }
    await page.keyboard.insertText(str);
    await page.waitForTimeout(800);
  }

  if (payload.type === 'image') {
    await focusAndTypeText(payload.text);

    if (payload.image && fs.existsSync(payload.image)) {
      const imgBtn = composer.locator('button[aria-label="Dodaj grafikę"]:visible, button[aria-label="Add image"]:visible').first();
      await imgBtn.click();
      await page.waitForTimeout(1500);

      // Click "Wybierz z komputera" / file input
      const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null);
      const selectFromPc = composer.locator('button:has-text("Wybierz z komputera"), button:has-text("Select from your computer"), button:has-text("Wybierz")').first();
      if (await selectFromPc.isVisible().catch(() => false)) {
        await selectFromPc.click();
        const chooser = await fileChooserPromise;
        if (chooser) {
          await chooser.setFiles(path.resolve(payload.image));
        } else {
          const fileInput = page.locator('input[type="file"]').last();
          await fileInput.setInputFiles(path.resolve(payload.image));
        }
      } else {
        const fileInput = page.locator('input[type="file"]').last();
        await fileInput.setInputFiles(path.resolve(payload.image));
      }

      // Wait for image preview to finish uploading
      await page.waitForTimeout(6000);
    }
  } else if (payload.type === 'poll') {
    const pollBtn = composer.locator('button[aria-label="Dodaj ankietę tekstową"]:visible, button[aria-label="Add text poll"]:visible').first();
    await pollBtn.click();
    await page.waitForTimeout(1500);

    await focusAndTypeText(payload.question);

    const opts = payload.options || [];
    for (let i = 0; i < opts.length; i++) {
      if (i >= 2) {
        const addOpt = composer.locator('button:has-text("Dodaj kolejną opcję"), button:has-text("Add another option")').first();
        if (await addOpt.isVisible().catch(() => false)) {
          await addOpt.click();
          await page.waitForTimeout(500);
        }
      }
      const optInputs = composer.locator('ytd-poll-choice-input-renderer input, input[placeholder*="Dodaj opcję"], input[placeholder*="Add option"]');
      const inp = optInputs.nth(i);
      await inp.waitFor({ state: 'visible', timeout: 8000 });
      await inp.fill(opts[i]);
      await page.waitForTimeout(300);
    }
  } else if (payload.type === 'quiz') {
    const quizBtn = composer.locator('button[aria-label="Dodaj quiz"]:visible, button[aria-label="Add quiz"]:visible').first();
    await quizBtn.click();
    await page.waitForTimeout(1500);

    await focusAndTypeText(payload.question);

    const opts = payload.options || [];
    for (let i = 0; i < opts.length; i++) {
      if (i >= 2) {
        const addOpt = composer.locator('button:has-text("Dodaj kolejną opcję"), button:has-text("Add another option")').first();
        if (await addOpt.isVisible().catch(() => false)) {
          await addOpt.click();
          await page.waitForTimeout(500);
        }
      }
      const optInputs = composer.locator('ytd-quiz-choice-input-renderer input, input[placeholder*="Odpowiedź"], input[placeholder*="Answer"]');
      const inp = optInputs.nth(i);
      await inp.waitFor({ state: 'visible', timeout: 8000 });
      await inp.fill(opts[i]);
      await page.waitForTimeout(300);
    }

    // Mark correct answer
    const correctChecks = composer.locator('ytd-quiz-choice-input-renderer button[aria-label*="poprawn" i], ytd-quiz-choice-input-renderer button[aria-label*="correct" i], ytd-quiz-choice-input-renderer tp-yt-paper-checkbox');
    const cBtn = correctChecks.nth(payload.correctIndex || 0);
    if (await cBtn.isVisible().catch(() => false)) {
      await cBtn.click();
      await page.waitForTimeout(400);
    }
  }

  // Wait until Opublikuj button is enabled, then click
  for (let i = 0; i < 20; i++) {
    const disabled = await postBtn.isDisabled().catch(() => true);
    if (!disabled) break;
    await page.waitForTimeout(1000);
  }
  if (await postBtn.isDisabled().catch(() => true)) {
    throw new Error('Przycisk Opublikuj pozostał nieaktywny (tekst lub obraz nie został zatwierdzony w formularzu).');
  }
  await postBtn.click();
  await page.waitForTimeout(5500);

  return { ok: true, url: page.url() };
}

async function main() {
  const args = process.argv.slice(2);
  let forcedType = null;
  let onlyChannel = null;
  const headless = !args.includes('--headed');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--type' && args[i + 1]) forcedType = args[++i];
    if (args[i] === '--channel' && args[i + 1]) onlyChannel = args[++i];
  }

  const state = loadState();
  const { ymd } = getWarsawDateInfo();

  // Automatyczne wygenerowanie oficjalnej karty 1:1 „Wiadomość z Nieba” na dziś (jeśli jeszcze nie istnieje)
  const expectedCard = path.join(ROOT, 'images', 'social', 'yt-community', `wiadomosc_z_nieba_${ymd}.jpg`);
  if (!fs.existsSync(expectedCard)) {
    try {
      await generateWiadomoscZNiebaCard(ymd, { outPath: expectedCard });
    } catch (err) {
      console.warn(`⚠️ Nie udało się wygenerować karty Wiadomość z Nieba dla ${ymd}: ${err.message}`);
    }
  }

  const payload = buildDailyPostPayload(state, forcedType);

  if (!state.postsByDate[ymd]) {
    state.postsByDate[ymd] = { type: payload.type, id: payload.id, channels: {} };
  }

  const targets = onlyChannel
    ? COMMUNITY_CHANNELS.filter(c => c.name.toLowerCase().includes(onlyChannel.toLowerCase()))
    : COMMUNITY_CHANNELS;

  console.log(`\n========================================================`);
  console.log(`📣 YT COMMUNITY ENGINE — ${ymd} | Typ: ${payload.type.toUpperCase()} (${payload.id})`);
  console.log(`   Kanały docelowe (${targets.length}): ${targets.map(t => t.name).join(', ')}`);
  console.log(`========================================================\n`);

  const { ctx, page } = await launchStudio({ headless });
  let okCount = 0;
  try {
    for (const ch of targets) {
      if (state.postsByDate[ymd].channels[ch.name]?.status === 'ok') {
        console.log(`⏭️  [${ch.name}] Już opublikowano dziś (${ymd}) — pomijam.`);
        okCount++;
        continue;
      }

      try {
        console.log(`>>> [${ch.name}] Przełączam konto i publikuję post (${payload.type})...`);
        await switchYouTubeChannel(page, ch);
        const res = await publishPostOnCurrentChannel(page, payload);
        state.postsByDate[ymd].channels[ch.name] = {
          status: 'ok',
          channelId: ch.id,
          type: payload.type,
          url: res.url,
          publishedAt: new Date().toISOString()
        };
        saveState(state);
        okCount++;
        console.log(`✅ [${ch.name}] Opublikowano pomyślnie!`);
      } catch (err) {
        console.error(`❌ [${ch.name}] Błąd:`, err.message);
        state.postsByDate[ymd].channels[ch.name] = {
          status: 'error',
          channelId: ch.id,
          error: err.message,
          failedAt: new Date().toISOString()
        };
        saveState(state);
      }
    }

    if (okCount > 0) {
      if (payload.nextPromoIndex != null) state.promoIndex = payload.nextPromoIndex;
      if (payload.nextPollIndex != null) state.pollIndex = payload.nextPollIndex;
      saveState(state);
    }
  } finally {
    await ctx.close();
  }

  console.log(`\n🎉 Podsumowanie YT Community (${ymd}): ${okCount}/${targets.length} kanałów OK.`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
