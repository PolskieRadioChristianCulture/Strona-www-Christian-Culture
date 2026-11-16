// @007 2026-11-15 — ROZPOZNANIE bez zmian: przełącz na kanał, potwierdź tożsamość, otwórz okno „Zapisz” na filmie i zrzuć jego treść.
import { launchStudio } from './yt_studio_session.mjs';
const HANDLE = process.argv[2] || '@RadioChristianCulture';
const CEL_ID = process.argv[3] || 'UCNnCdsJ-K6FXulZzXZHWkjQ';
const FILM = process.argv[4] || 'dQw4w9WgXcQ';
const OUT = 'C:/Users/czark/AppData/Local/Temp/claude/4364b64292dafca5/c0a345d8-f5a2-4b52-bede-531ebda0d7b9/scratchpad/';
const { ctx, page } = await launchStudio({ headless: true });
try {
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 40000 });
  await page.waitForTimeout(1500);
  await page.locator('ytd-account-item-renderer', { hasText: HANDLE }).first().click();
  await page.waitForTimeout(5000);
  await page.goto('https://studio.youtube.com/?approve_browser_access=true', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  const studioUrl = page.url();
  console.log('Studio po przełączeniu:', studioUrl, '→', studioUrl.includes(CEL_ID) ? 'TOŻSAMOŚĆ OK' : 'INNY KANAŁ!');
  if (!studioUrl.includes(CEL_ID)) throw new Error('Tożsamość nie zgadza się — przerywam');
  await page.goto(`https://www.youtube.com/watch?v=${FILM}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);
  const przyciski = await page.$$eval('ytd-watch-metadata button, ytd-menu-renderer button', (b) => b.map((x) => (x.getAttribute('aria-label') || x.innerText || '').trim()).filter(Boolean));
  console.log('Przyciski pod filmem:', [...new Set(przyciski)].slice(0, 20).join(' | '));
  let zapisz = page.locator('button[aria-label*="Zapisz"], button[aria-label*="Save"]').first();
  if (!(await zapisz.isVisible().catch(() => false))) {
    await page.locator('ytd-watch-metadata button[aria-label*="Więcej"], ytd-watch-metadata button[aria-label*="More"]').first().click();
    await page.waitForTimeout(1500);
    zapisz = page.locator('tp-yt-paper-item:has-text("Zapisz"), yt-list-item-view-model:has-text("Zapisz"), ytd-menu-service-item-renderer:has-text("Zapisz")').first();
  }
  await zapisz.click();
  await page.waitForTimeout(3000);
  const okno = await page.evaluate(() => {
    const el = document.querySelector('ytd-add-to-playlist-renderer, yt-sheet-view-model, tp-yt-paper-dialog, ytd-popup-container');
    return el ? el.innerText.replace(/\n+/g, ' | ').slice(0, 1500) : 'brak okna';
  });
  console.log('OKNO ZAPISZ:', okno);
  await page.screenshot({ path: OUT + 'yt-okno-zapisz.png' });
  console.log('Zrzut: yt-okno-zapisz.png (nic nie zaznaczono, nic nie utworzono)');
} finally { await ctx.close(); }
