import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const SRC = 'C:\\Users\\czark\\.youtube_browser_profile';
const LOCK = 'C:\\Users\\czark\\.youtube_browser_profile.lock.json';
const DST = 'C:\\Users\\czark\\.youtube_live_dedicated_profile';
const MAX_WAIT_MS = 20 * 60 * 1000;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';

const sleep = ms => new Promise(r => setTimeout(r, ms));

function releaseLockIfOwner() {
  try {
    if (!fs.existsSync(LOCK)) return;
    const raw = JSON.parse(fs.readFileSync(LOCK, 'utf8'));
    if (Number(raw?.pid) === Number(process.pid)) {
      fs.unlinkSync(LOCK);
      console.log(`[Clone] Zwolniono blokadę ${LOCK} (hold zakończony).`);
    }
  } catch {
    try { fs.unlinkSync(LOCK); } catch {}
  }
}

async function acquireQuickLock() {
  const start = Date.now();
  let lastLog = 0;
  console.log(`[Clone] Oczekuję na okno zwolnienia ${LOCK} (polling 200ms, max 20 min)...`);

  while (Date.now() - start < MAX_WAIT_MS) {
    if (!fs.existsSync(LOCK)) {
      try {
        fs.writeFileSync(
          LOCK,
          JSON.stringify({ pid: process.pid, acquiredAt: new Date().toISOString(), purpose: 'clone_for_live' }, null, 2),
          { flag: 'wx' }
        );
        console.log(`[Clone] Przejęto blokadę PID=${process.pid} po ${((Date.now() - start) / 1000).toFixed(1)}s!`);
        return;
      } catch (err) {
        if (err?.code !== 'EEXIST') throw err;
      }
    }
    if (Date.now() - lastLog >= 60000) {
      lastLog = Date.now();
      let ownerPid = '?';
      try { ownerPid = JSON.parse(fs.readFileSync(LOCK, 'utf8'))?.pid ?? '?'; } catch {}
      console.log(`[Clone] Nadal zajęte przez PID=${ownerPid} (${Math.round((Date.now() - start) / 60000)} min minęło)...`);
    }
    await sleep(200);
  }
  throw new Error(`Timeout 20 min oczekiwania na zwolnienie ${LOCK}`);
}

async function copyFileWithRetry(srcFile, dstFile, maxRetries = 30, delayMs = 150) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      fs.copyFileSync(srcFile, dstFile);
      return true;
    } catch (err) {
      if ((err?.code === 'EBUSY' || err?.code === 'EPERM' || err?.code === 'EACCES') && i < maxRetries - 1) {
        await sleep(delayMs);
        continue;
      }
      throw err;
    }
  }
  return false;
}

async function copyDirWithRetry(srcDir, dstDir, maxRetries = 30, delayMs = 150) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      fs.cpSync(srcDir, dstDir, { recursive: true, force: true });
      return true;
    } catch (err) {
      if ((err?.code === 'EBUSY' || err?.code === 'EPERM' || err?.code === 'EACCES') && i < maxRetries - 1) {
        await sleep(delayMs);
        continue;
      }
      throw err;
    }
  }
  return false;
}

function cleanLockArtifacts(dir) {
  for (const base of [dir, path.join(dir, 'Default')]) {
    if (!fs.existsSync(base)) continue;
    for (const entry of fs.readdirSync(base)) {
      if (/^Singleton/i.test(entry) || entry === 'LOCK' || entry === 'lockfile') {
        try { fs.rmSync(path.join(base, entry), { recursive: true, force: true }); } catch {}
      }
    }
  }
}

async function cloneCoreAuthFiles() {
  const t0 = Date.now();
  fs.rmSync(DST, { recursive: true, force: true });
  fs.mkdirSync(path.join(DST, 'Default'), { recursive: true });

  const cookiesSrc = path.join(SRC, 'Default', 'Network', 'Cookies');
  const networkSrc = path.join(SRC, 'Default', 'Network');
  const networkDst = path.join(DST, 'Default', 'Network');
  if (fs.existsSync(cookiesSrc)) {
    // Wait until Chrome completely releases file lock on Cookies before cloning Network
    fs.mkdirSync(networkDst, { recursive: true });
    await copyFileWithRetry(cookiesSrc, path.join(networkDst, 'Cookies'), 30, 150);
  }
  if (fs.existsSync(networkSrc)) {
    await copyDirWithRetry(networkSrc, networkDst, 15, 150);
  }

  const singleFiles = [
    'Local State',
    path.join('Default', 'Preferences'),
    path.join('Default', 'Secure Preferences'),
    path.join('Default', 'Login Data'),
    path.join('Default', 'Login Data For Account'),
    path.join('Default', 'Web Data')
  ];
  for (const rel of singleFiles) {
    const s = path.join(SRC, rel);
    const d = path.join(DST, rel);
    if (fs.existsSync(s)) {
      await copyFileWithRetry(s, d, 10, 150);
    }
  }

  const localStorageSrc = path.join(SRC, 'Default', 'Local Storage');
  if (fs.existsSync(localStorageSrc)) {
    await copyDirWithRetry(localStorageSrc, path.join(DST, 'Default', 'Local Storage'), 10, 150);
  }

  cleanLockArtifacts(DST);
  console.log(`[Clone] Skopiowano podstawowe pliki auth do ${DST} w ${Date.now() - t0} ms.`);
}

async function verifyClonedProfile() {
  console.log('[Verify] Uruchamiam Playwright na sklonowanym profilu dedykowanym...');
  const ctx = await chromium.launchPersistentContext(DST, {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1600, height: 1000 },
    userAgent: UA,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=CalculateNativeWinOcclusion'
    ]
  });

  try {
    const page = ctx.pages()[0] || await ctx.newPage();
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 25000 }).catch(() => {});
    await sleep(2500);

    const finalUrl = page.url();
    const count = await page.locator('ytd-account-item-renderer').count().catch(() => 0);
    console.log(`CLONE_VERIFY_URL=${finalUrl}`);
    console.log(`CLONE_VERIFY_ACCOUNTS=${count}`);

    if (finalUrl.includes('accounts.google.com') || count < 10) {
      throw new Error(`Weryfikacja nieudana (url=${finalUrl}, accounts=${count})`);
    }
  } finally {
    await ctx.close();
  }
}

async function main() {
  await acquireQuickLock();
  try {
    await cloneCoreAuthFiles();
  } finally {
    releaseLockIfOwner();
  }
  await verifyClonedProfile();
  console.log('[Clone] SUKCES! Dedykowany profil jest zweryfikowany i gotowy.');
}

main().catch(err => {
  releaseLockIfOwner();
  console.error('[Clone] BŁĄD:', err.message);
  process.exit(1);
});
