// Wspólna obsługa sesji YouTube Studio (profil Playwright) — @007, 02.11.2026.
// Kanały „menedżerskie” (Biblia Audio CC, Werset Dnia, Polskie Radio CC) są dostępne w Studio
// TYLKO z tożsamości „Osobowość +”. Kanały marki (CC TV, CC Women, CC Men, Osobowość +) — przez przełącznik.
// Każde wejście kończy się weryfikacją, że Studio pokazuje DOKŁADNIE żądany kanał.
import { chromium } from 'playwright';

export const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';

export const CHANNELS = {
  'Biblia Audio Christian Culture': { id: 'UCCqHRCEuSDhlRcvcQ6qM1Kw', handle: '@bibliaaudiocc', via: '@osobowośćPLUS' },
  'Werset Dnia - Chrześcijański Serwis Biblijny': { id: 'UCyOvW5DuDLVq5XWFyijgtbw', handle: '@wersetdnia_ChSB', via: '@osobowośćPLUS' },
  'Polskie Radio CHRISTIAN CULTURE': { id: 'UCNnCdsJ-K6FXulZzXZHWkjQ', handle: '@RadioChristianCulture', via: '@osobowośćPLUS' },
  // UWAGA: UCHmPxDM2zzlUAf5ZvlotPLw to „Osobowość +”, NIE „Christian Culture TV” (błąd w SOP do 02.11.2026).
  'Christian Culture TV': { id: 'UCG5Y4dwJi5436Gu6QH3nNUQ', handle: '@ChristianCultureTV', via: '@ChristianCultureTV' },
  'Osobowość +': { id: 'UCHmPxDM2zzlUAf5ZvlotPLw', handle: '@osobowośćPLUS', via: '@osobowośćPLUS' },
  'CC Women': { id: 'UC-LPFt-vmJCeap746DOWMgw', handle: '@CCWomen7', via: '@CCWomen7' },
  'CC Men': { id: 'UCUpuq9JS7jitIcm9iBn0jnA', handle: '@CCMen7', via: '@CCMen7' }
};

// Biblia Audio: KOMPLET (4K + Shorts) na wszystkich 7 kanałach — decyzja L0 02.11.2026.
export const BIBLIA_AUDIO_CHANNELS = Object.keys(CHANNELS);

export async function launchStudio({ headless = true } = {}) {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless, channel: 'chrome', viewport: { width: 1600, height: 1000 }, userAgent: UA,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  return { ctx, page };
}

async function passBrowserGate(page) {
  const p = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await p.isVisible().catch(() => false)) { await p.click(); await page.waitForTimeout(4000); }
}

async function switchIdentity(page, handle) {
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);
  const item = page.locator('ytd-account-item-renderer', { hasText: handle }).first();
  if (!(await item.count())) throw new Error(`Brak tożsamości ${handle} w przełączniku kanałów`);
  await item.click();
  await page.waitForTimeout(5000);
}

async function resolveChannelId(page, handle) {
  await page.goto(`https://www.youtube.com/${encodeURI(handle)}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2500);
  const id = await page.evaluate(() =>
    document.querySelector('meta[itemprop="identifier"], meta[itemprop="channelId"]')?.content ||
    (document.querySelector('link[rel="canonical"]')?.href.match(/channel\/(UC[\w-]+)/) || [])[1] || null);
  if (!id) throw new Error(`Nie ustalono ID kanału ${handle}`);
  return id;
}

// Otwiera Studio wskazanego kanału i ZWRACA jego ID. Rzuca błąd, jeśli Studio pokazuje inny kanał.
export async function openChannelStudio(page, channelName, subpath = '') {
  const ch = CHANNELS[channelName];
  if (!ch) throw new Error(`Nieznany kanał: ${channelName} (dodaj go do CHANNELS w yt_studio_session.mjs)`);
  await switchIdentity(page, ch.via);
  const id = ch.id || await resolveChannelId(page, ch.handle);
  await page.goto(`https://studio.youtube.com/channel/${id}${subpath}?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await passBrowserGate(page);
  await page.waitForTimeout(2000);
  const url = page.url();
  if (/Ups|Oops/.test(await page.title()) || !url.includes(id)) {
    throw new Error(`Studio NIE otworzyło kanału ${channelName} (${id}); jest: ${url}. Nie wgrywam na inny kanał.`);
  }
  return id;
}
