// Wspólna obsługa sesji YouTube Studio (profil Playwright) — @007, 02.11.2026.
// Kanały „menedżerskie” (Biblia Audio CC, Werset Dnia, Polskie Radio CC) są dostępne w Studio
// TYLKO z tożsamości „Osobowość +”. Kanały marki (CC TV, CC Women, CC Men, Osobowość +) — przez przełącznik.
// Każde wejście kończy się weryfikacją, że Studio pokazuje DOKŁADNIE żądany kanał.
import fs from 'node:fs';
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';

export const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
export const PROFILE_LOCK_FILE = 'C:\\Users\\czark\\.youtube_browser_profile.lock.json';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';

let exitHookRegistered = false;

function readLockInfo() {
  if (!fs.existsSync(PROFILE_LOCK_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(PROFILE_LOCK_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function releaseProfileLock(ownerPid = process.pid) {
  try {
    if (!fs.existsSync(PROFILE_LOCK_FILE)) return;
    const lock = readLockInfo();
    if (lock && Number(lock.pid) === Number(ownerPid)) {
      fs.unlinkSync(PROFILE_LOCK_FILE);
    }
  } catch {}
}

function registerExitHook() {
  if (!exitHookRegistered) {
    exitHookRegistered = true;
    process.once('exit', () => releaseProfileLock(process.pid));
  }
}

function listProcessTable() {
  try {
    const out = execSync(
      'powershell -NoProfile -Command "Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId, Name, CommandLine | ConvertTo-Json -Compress"',
      { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'], timeout: 10000 }
    ).trim();
    if (!out || out === 'null') return [];
    const parsed = JSON.parse(out);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

export function classifyProfileProcesses(procList, currentPid = process.pid, lockInfo = null) {
  const byPid = new Map();
  for (const p of procList || []) {
    if (p && p.ProcessId != null) byPid.set(Number(p.ProcessId), p);
  }

  const profileChromes = (procList || []).filter(p =>
    p &&
    String(p.Name || '').toLowerCase() === 'chrome.exe' &&
    typeof p.CommandLine === 'string' &&
    p.CommandLine.toLowerCase().includes('youtube_browser_profile')
  );

  const liveOwners = new Set();
  for (const c of profileChromes) {
    let cur = c;
    for (let hop = 0; hop < 6 && cur; hop++) {
      const ppid = Number(cur.ParentProcessId);
      if (!ppid || !byPid.has(ppid)) break;
      const parent = byPid.get(ppid);
      if (String(parent.Name || '').toLowerCase() === 'node.exe' && Number(parent.ProcessId) !== Number(currentPid)) {
        liveOwners.add(Number(parent.ProcessId));
        break;
      }
      cur = parent;
    }
  }

  if (lockInfo && lockInfo.pid != null && Number(lockInfo.pid) !== Number(currentPid) && byPid.has(Number(lockInfo.pid))) {
    liveOwners.add(Number(lockInfo.pid));
  }

  return {
    liveOwners: [...liveOwners],
    orphanChromes: liveOwners.size === 0 ? profileChromes : []
  };
}

export function killOrphanChromeProfiles() {
  try {
    const list = listProcessTable();
    const lockInfo = readLockInfo();
    const { liveOwners, orphanChromes } = classifyProfileProcesses(list, process.pid, lockInfo);
    if (liveOwners.length > 0) {
      console.log(`  -> [ProfileGuard] Profil zajęty przez aktywny proces node (PID: ${liveOwners.join(', ')}) — NIE przerywam.`);
      return { killed: 0, liveOwners };
    }
    let killed = 0;
    for (const p of orphanChromes) {
      try {
        process.kill(p.ProcessId, 'SIGKILL');
        killed++;
      } catch {}
    }
    if (killed > 0) {
      console.log(`  -> [Auto-recovery] Wyczyszczono ${killed} osieroconych procesów Chrome blokujących profil.`);
    }
    return { killed, liveOwners: [] };
  } catch {
    return { killed: 0, liveOwners: [] };
  }
}

const CORE_PL_CHANNELS = {
  'Biblia Audio Christian Culture': { id: 'UCCqHRCEuSDhlRcvcQ6qM1Kw', handle: '@bibliaaudiocc', via: '@osobowośćPLUS' },
  'Werset Dnia - Chrześcijański Serwis Biblijny': { id: 'UCyOvW5DuDLVq5XWFyijgtbw', handle: '@wersetdnia_ChSB', via: '@osobowośćPLUS' },
  'Polskie Radio CHRISTIAN CULTURE': { id: 'UCNnCdsJ-K6FXulZzXZHWkjQ', handle: '@RadioChristianCulture', via: '@osobowośćPLUS' },
  // UWAGA: UCHmPxDM2zzlUAf5ZvlotPLw to „Osobowość +”, NIE „Christian Culture TV” (błąd w SOP do 02.11.2026).
  'Christian Culture TV': { id: 'UCG5Y4dwJi5436Gu6QH3nNUQ', handle: '@ChristianCultureTV', via: '@ChristianCultureTV' },
  'Osobowość +': { id: 'UCHmPxDM2zzlUAf5ZvlotPLw', handle: '@osobowośćPLUS', via: '@osobowośćPLUS' },
  'CC Women': { id: 'UC-LPFt-vmJCeap746DOWMgw', handle: '@CCWomen7', via: '@CCWomen7' },
  'CC Men': { id: 'UCUpuq9JS7jitIcm9iBn0jnA', handle: '@CCMen7', via: '@CCMen7' }
};

export const CHANNELS = {
  ...CORE_PL_CHANNELS,
  'Robert Łukasz Pio': { id: 'UC34DD8FTh_y2GhZhg3qBaIQ', handle: '@RobertŁukaszPio', via: 'Robert Łukasz Pio' },
  'Personality Plus': { id: 'UCSwb927uMg2PxIl_Aakht0Q', handle: '@PersonalityPlusCC', via: 'Personality Plus' },
  'Christian Culture Instrumental': { id: null, handle: '@ChristianCultureInstrumental', via: '@ChristianCultureInstrumental' },
  'CC Prayer 24': { id: null, handle: '@CCPrayer24', via: '@CCPrayer24' },
  'CC Nature Sounds': { id: null, handle: '@CCNatureSounds', via: '@CCNatureSounds' },
  'CC Worship International': { id: null, handle: '@CCWorshipInternational', via: '@CCWorshipInternational' },
  'Christian Culture Praise & Worship': { id: null, handle: '@ChristianCulturePraiseWorship', via: '@ChristianCulturePraiseWorship' },
  'Christian Culture Rodzina': { id: null, handle: '@ChristianCultureRodzina', via: '@ChristianCultureRodzina' },
  'CC Marriage': { id: null, handle: '@CCMarriage', via: '@CCMarriage' },
  'Christian Culture Biznes': { id: null, handle: '@ChristianCultureBiznes', via: '@ChristianCultureBiznes' },
  'CC Identity': { id: null, handle: '@CCIdentityTwojaDuchowaTożsamoś', via: '@CCIdentityTwojaDuchowaTożsamoś' },
  'Worship LIVE CC': { id: null, handle: '@WorshipLiveCC', via: '@WorshipLiveCC' },
  'Popraw Koronę': { id: 'UCquRtlfo1jrhZGO8LqFVllQ', handle: '@PoprawKoronęCC', via: '@PoprawKoronęCC' },
  'Katarzyna Fedków': { id: 'UCnipJdX6mtsxaoEENzEVusA', handle: '@katarzynafedkow', via: '@katarzynafedkow' },
  'Top Seven': { id: 'UCdo_1-cjf5TEjSfEG_rxmyw', handle: '@TopSeven_CC', via: '@TopSeven_CC' },
  'CC MUSIC': { id: null, handle: '@CCMUSIC7', via: '@CCMUSIC7' },
  'CC Shorts': { id: null, handle: '@CCShorts77', via: '@CCShorts77' },
  'Christian Culture POP': { id: null, handle: '@ChristianCulturePOP', via: '@ChristianCulturePOP' }
};

// Biblia Audio: KOMPLET (4K + Shorts) na wszystkich 7 głównych kanałach PL — decyzja L0 02.11.2026.
export const BIBLIA_AUDIO_CHANNELS = Object.keys(CORE_PL_CHANNELS);

async function acquireProfileLock(lockWaitMs) {
  const start = Date.now();
  let lastLog = 0;
  while (true) {
    const list = listProcessTable();
    const byPid = new Map(list.filter(p => p && p.ProcessId != null).map(p => [Number(p.ProcessId), p]));
    const lockInfo = readLockInfo();
    const { liveOwners } = classifyProfileProcesses(list, process.pid, lockInfo);

    if (liveOwners.length > 0) {
      if (Date.now() - start >= lockWaitMs) {
        throw new Error(`Profil .youtube_browser_profile zajęty > ${Math.round(lockWaitMs / 60000)} min przez PID: ${liveOwners.join(', ')}`);
      }
      if (Date.now() - lastLog >= 60000) {
        console.log(`  -> [ProfileGuard] Oczekuję na zwolnienie profilu przez aktywny proces node (PID: ${liveOwners.join(', ')})...`);
        lastLog = Date.now();
      }
      await new Promise(r => setTimeout(r, 10000));
      continue;
    }

    if (fs.existsSync(PROFILE_LOCK_FILE)) {
      const stale = !lockInfo?.pid || !byPid.has(Number(lockInfo.pid)) || Number(lockInfo.pid) === Number(process.pid);
      if (stale) {
        try { fs.unlinkSync(PROFILE_LOCK_FILE); } catch {}
      } else {
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }
    }

    killOrphanChromeProfiles();

    try {
      fs.writeFileSync(
        PROFILE_LOCK_FILE,
        JSON.stringify({ pid: process.pid, acquiredAt: new Date().toISOString() }, null, 2),
        { flag: 'wx' }
      );
      registerExitHook();
      return;
    } catch (err) {
      if (err && err.code === 'EEXIST') {
        if (Date.now() - start >= lockWaitMs) {
          throw new Error('Wyścig blokady .youtube_browser_profile.lock.json przekroczył limit czasu.');
        }
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
}

export async function launchStudio({ headless = true, lockWaitMs = Number(process.env.CC_YT_LOCK_WAIT_MS ?? 35 * 60 * 1000) } = {}) {
  await acquireProfileLock(lockWaitMs);
  let ctx = null;
  try {
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
          headless, channel: 'chrome', viewport: { width: 1600, height: 1000 }, userAgent: UA,
          args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
        });
        break;
      } catch (err) {
        if (err.message && err.message.includes('ProcessSingleton')) {
          console.log(`  [Retry ${attempt}/4] Wykryto ProcessSingleton — sprawdzam bezpiecznie stan profilu...`);
          const res = killOrphanChromeProfiles();
          await new Promise(r => setTimeout(r, res.liveOwners.length > 0 ? 10000 : 2000));
        } else if (attempt < 4) {
          console.log(`  [Retry ${attempt}/4] Błąd uruchamiania kontekstu: ${err.message}. Ponawiam za 3s...`);
          await new Promise(r => setTimeout(r, 3000));
        } else {
          throw err;
        }
      }
    }
  } catch (err) {
    releaseProfileLock(process.pid);
    throw err;
  }

  const origClose = ctx.close.bind(ctx);
  ctx.close = async (...args) => {
    try {
      return await origClose(...args);
    } finally {
      releaseProfileLock(process.pid);
    }
  };

  const page = ctx.pages()[0] || await ctx.newPage();
  return { ctx, page };
}

async function passBrowserGate(page) {
  const p = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await p.isVisible().catch(() => false)) { await p.click(); await page.waitForTimeout(4000); }
}

async function switchIdentity(page, handle) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 40000 });
      await page.waitForTimeout(1500);
      const item = page.locator('ytd-account-item-renderer', { hasText: handle }).first();
      if (!(await item.count())) throw new Error(`Brak tożsamości ${handle} w przełączniku kanałów`);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {}),
        item.click()
      ]);
      await new Promise(r => setTimeout(r, 4000));
      return;
    } catch (err) {
      if (attempt === 1) {
        console.log(`  [switchIdentity retry] Ponawiam przełączanie tożsamości do ${handle}...`);
        await page.waitForTimeout(3000);
      } else {
        throw err;
      }
    }
  }
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
