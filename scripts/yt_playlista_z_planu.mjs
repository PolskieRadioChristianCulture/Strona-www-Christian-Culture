// @007 2026-11-16 — pilotaż L0 15.11 („✅ TAK, pilotaż”): playlista na Polskim Radiu CC z filmów innych kanałów CC.
// Użycie: node scripts/yt_playlista_z_planu.mjs "<nazwa playlisty>" <plan.json> <dziennik.json>
// Zasady: tylko DODAJE do playlisty (nie usuwa filmów, nie zmienia kanałów źródłowych); sprawdza tożsamość;
// dziennik chroni przed ponownym kliknięciem (okno „Zapisz” działa jak przełącznik).
import fs from 'node:fs';
import { launchStudio } from './yt_studio_session.mjs';

const [NAZWA, PLAN, DZIENNIK] = process.argv.slice(2);
const HANDLE = process.argv[5] || '@RadioChristianCulture'; // opcjonalnie: <handle> <id kanału docelowego>
const CEL_ID = process.argv[6] || 'UCNnCdsJ-K6FXulZzXZHWkjQ';
const filmy = JSON.parse(fs.readFileSync(PLAN, 'utf8')).plan[NAZWA];
if (!filmy?.length) throw new Error('Brak playlisty w planie: ' + NAZWA);
const dz = fs.existsSync(DZIENNIK) ? JSON.parse(fs.readFileSync(DZIENNIK, 'utf8')) : {};
dz[NAZWA] = dz[NAZWA] || { utworzona: false, dodane: [], bledy: [] };
const zapiszDz = () => fs.writeFileSync(DZIENNIK, JSON.stringify(dz, null, 1));

const { ctx, page } = await launchStudio({ headless: true });
try {
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 40000 });
  await page.waitForTimeout(1500);
  await page.locator('ytd-account-item-renderer', { hasText: HANDLE }).first().click();
  await page.waitForTimeout(5000);
  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForURL((u) => u.toString().includes(CEL_ID), { timeout: 30000 }).catch(() => {});
  if (!page.url().includes(CEL_ID)) throw new Error('Tożsamość nie zgadza się: ' + page.url());
  console.log('Tożsamość OK:', HANDLE, CEL_ID);

  for (const f of filmy) {
    if (dz[NAZWA].dodane.includes(f.id)) continue;
    try {
      await page.goto(`https://www.youtube.com/watch?v=${f.id}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('button[aria-label="Zapisz na playliście"]:visible').first().waitFor({ timeout: 25000 });
      await page.waitForTimeout(2500);
      await page.locator('button[aria-label="Zapisz na playliście"]:visible').first().click();
      await page.locator('yt-sheet-view-model, ytd-add-to-playlist-renderer').first().waitFor({ timeout: 15000 });
      await page.waitForTimeout(2000);
      const pozycja = page.locator('yt-list-item-view-model', { hasText: NAZWA }).first();
      if (await pozycja.count()) {
        if (!dz[NAZWA].utworzona) throw new Error('Playlista o tej nazwie już istnieje, a nie ma jej w dzienniku — przerywam, sprawdź ręcznie');
        await pozycja.click();
        await page.waitForTimeout(2500);
      } else {
        if (dz[NAZWA].utworzona) throw new Error('Dziennik mówi „utworzona”, a w oknie jej nie ma — przerywam');
        await page.locator('button:has-text("Nowa playlista")').first().click();
        await page.locator('textarea[placeholder="Wybierz tytuł"]').waitFor({ timeout: 10000 });
        await page.locator('textarea[placeholder="Wybierz tytuł"]').fill(NAZWA);
        const lista = page.locator('dropdown-view-model [role="combobox"]').last();
        await lista.click();
        await page.waitForTimeout(1200);
        await page.locator('button[role="menuitem"]', { hasText: 'Każdy może ją wyszukać' }).first().click();
        await page.waitForTimeout(1200);
        const widocznosc = (await lista.innerText().catch(() => '')).replace(/\s+/g, ' ');
        console.log('  widoczność:', widocznosc);
        if (/Niepubliczna|Prywatna/.test(widocznosc)) throw new Error('Nie udało się ustawić „Publiczna”: ' + widocznosc);
        if (!/Publiczna/.test(widocznosc)) throw new Error('Nie udało się ustawić „Publiczna”: ' + widocznosc);
        await page.locator('xpath=//button[@aria-label="Utwórz"][not(ancestor::ytd-masthead)]').click();
        await page.waitForTimeout(4000);
        dz[NAZWA].utworzona = true;
        console.log('UTWORZONO playlistę publiczną:', NAZWA);
      }
      dz[NAZWA].dodane.push(f.id); zapiszDz();
      console.log('  + ', f.tytul.slice(0, 70), `[${f.kanal}]`);
    } catch (e) {
      dz[NAZWA].bledy.push({ id: f.id, blad: String(e.message).slice(0, 200) }); zapiszDz();
      console.log('  ! ', f.id, e.message.slice(0, 160));
      if (/Zapisz na playliście/.test(e.message)) continue; // film bez przycisku „Zapisz” — pomijamy
      if (/przerywam|Publiczna/.test(e.message) || !dz[NAZWA].utworzona) break;
    }
  }
} finally { zapiszDz(); await ctx.close(); }
console.log(`Wynik: ${dz[NAZWA].dodane.length}/${filmy.length} dodanych, błędów ${dz[NAZWA].bledy.length}`);
