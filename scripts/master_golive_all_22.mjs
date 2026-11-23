import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { launchStudio } from './yt_studio_session.mjs';
import { ALL_CHANNELS } from './all_channels_config.mjs';

const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_tvw_live.jpg';
const REPORT_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\master_golive_report.json';
const SHOT_DIR = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scratch\\golive_22';

fs.mkdirSync(SHOT_DIR, { recursive: true });
if (!fs.existsSync(THUMBNAIL_PATH)) {
  throw new Error(`Brak pliku miniatury: ${THUMBNAIL_PATH}`);
}

const ORDERED_NAMES = [
  // Group 1: @osobowośćPLUS (single identity switch)
  'Polskie Radio CC',
  'Biblia Audio CC',
  'Osobowość +',
  'Werset Dnia',
  // Group 2: Priority scheduled & direct channels
  'CC Men',
  'Popraw Koronę',
  'CC Women',
  // Group 3: Already live — thumbnail & auto-stop OFF only
  'Christian Culture TV',
  // Group 4: Remaining 14 channels
  'Robert Łukasz Pio',
  'Katarzyna Fedków',
  'Top Seven',
  'RCC TV 24',
  'CC Prayer 24',
  'Christian Culture Network',
  'CC Bible Deep',
  'Christian Culture POP',
  'Worship LIVE CC',
  'CC Instrumental',
  'CC Identity',
  'CC FILM',
  'CC Nature Sounds',
  'Personality Plus'
];

const byName = new Map(ALL_CHANNELS.map(c => [c.channelName, c]));
let targetList = ORDERED_NAMES.map(n => byName.get(n)).filter(Boolean);
for (const c of ALL_CHANNELS) {
  if (!targetList.some(t => t.channelName === c.channelName)) targetList.push(c);
}

if (process.argv[2]) {
  const only = new Set(process.argv[2].split(',').map(s => s.trim()).filter(Boolean));
  targetList = targetList.filter(c => only.has(c.channelName) || only.has(c.handle) || only.has(c.aitumOutput));
}

let currentVia = null;

async function getRealButtonState(el) {
  return el.evaluate(node => {
    const inner = node.querySelector('button') || node;
    const disabled = node.hasAttribute('disabled')
      || node.getAttribute('aria-disabled') === 'true'
      || inner.disabled === true
      || inner.hasAttribute('disabled')
      || inner.getAttribute('aria-disabled') === 'true';
    const r = node.getBoundingClientRect();
    return { disabled, visible: r.width > 0 && r.height > 0 };
  }).catch(() => ({ disabled: true, visible: false }));
}

async function passGate(page) {
  for (let i = 0; i < 2; i++) {
    const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO"), tp-yt-paper-button:has-text("PRZEJDŹ DO YOUTUBE STUDIO")').first();
    if (await gate.isVisible({ timeout: 1500 }).catch(() => false)) {
      await gate.click({ force: true }).catch(() => {});
      await page.waitForTimeout(3500);
    } else {
      break;
    }
  }
}

async function switchIdentity(page, via, channelName, force = false) {
  if (!force && currentVia === via) return true;
  const targets = [via, via.replace(/^@/, ''), channelName].filter(Boolean).map(s => s.toLowerCase());
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 35000 });
      await page.waitForTimeout(1500);

      const url = page.url();
      if (url.includes('accounts.google.com')) {
        throw new Error('SESSION_LOGIN_REQUIRED: Google accountchooser / 2FA challenge');
      }

      const matchedIdx = await page.evaluate((cands) => {
        const items = Array.from(document.querySelectorAll('ytd-account-item-renderer'));
        const texts = items.map(el => (el.innerText || '').replace(/\s+/g, ' ').trim().toLowerCase());
        for (const c of cands) {
          const iExact = texts.findIndex(t => t.includes(c));
          if (iExact !== -1) return iExact;
        }
        return -1;
      }, targets);

      if (matchedIdx === -1) {
        if (attempt === 1) {
          await page.waitForTimeout(2000);
          continue;
        }
        throw new Error(`Nie znaleziono tożsamości "${via}" / "${channelName}" w channel_switcher`);
      }

      const item = page.locator('ytd-account-item-renderer').nth(matchedIdx);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => {}),
        item.click({ force: true })
      ]);
      await page.waitForTimeout(3500);
      currentVia = via;
      return true;
    } catch (err) {
      if (err.message.includes('SESSION_LOGIN_REQUIRED')) throw err;
      if (attempt === 2) throw err;
      await page.waitForTimeout(2500);
    }
  }
  return false;
}

async function dismissModals(page) {
  const dialogs = page.locator('ytls-vertical-crop-dialog, ytls-reuse-settings-dialog, tp-yt-paper-dialog, ytcp-dialog');
  const count = await dialogs.count().catch(() => 0);
  for (let i = 0; i < count; i++) {
    const dlg = dialogs.nth(i);
    if (!(await dlg.isVisible().catch(() => false))) continue;
    const text = (await dlg.innerText().catch(() => '')).toLowerCase();
    // Never dismiss active edit dialog or stream end confirmation here
    if (text.includes('czy na pewno chcesz zakończyć') || text.includes('zakończ transmisję')) continue;
    if (text.includes('edytowanie układu pionowego') || text.includes('układ pionowy') || text.includes('vertical')) {
      const doneBtn = dlg.locator('ytcp-button:has-text("Gotowe"), button:has-text("Gotowe"), ytcp-button:has-text("Done"), button:has-text("Done")').first();
      if (await doneBtn.isVisible().catch(() => false)) {
        await doneBtn.click({ force: true }).catch(() => {});
        await page.waitForTimeout(1000);
        continue;
      }
    }
    if (text.includes('ponownie ustawienia') || text.includes('reuse settings')) {
      const closeBtn = dlg.locator('ytcp-button:has-text("Zamknij"), button:has-text("Zamknij"), ytcp-button:has-text("Użyj"), button:has-text("Odrzuć")').first();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click({ force: true }).catch(() => {});
        await page.waitForTimeout(1000);
      }
    }
  }
}

async function extractStreamKey(page) {
  return page.evaluate(() => {
    const keyRe = /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}(-[a-z0-9]{4})?$/i;
    function walk(node) {
      if (!node) return null;
      if (node.nodeType === Node.ELEMENT_NODE) {
        if ((node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') && typeof node.value === 'string') {
          const v = node.value.trim();
          if (keyRe.test(v)) return v;
        }
        if (node.shadowRoot) {
          const res = walk(node.shadowRoot);
          if (res) return res;
        }
      }
      for (let ch = node.firstChild; ch; ch = ch.nextSibling) {
        const res = walk(ch);
        if (res) return res;
      }
      return null;
    }
    return walk(document.body);
  }).catch(() => null);
}

async function configureToggles(page) {
  const info = { autoStart: 'unknown', autoStop: 'unknown' };
  try {
    const toggleData = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('tp-yt-paper-toggle-button, ytcp-toggle, [role="switch"]'));
      return nodes.map((el, idx) => {
        const row = el.closest('div, ytls-stream-setting-row, tr, ytcp-form-checkbox, section') || el.parentElement;
        const containerText = (row?.parentElement?.innerText || row?.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
        const checked = el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked') || el.checked === true;
        return { idx, containerText, ariaLabel: el.getAttribute('aria-label') || '', checked };
      });
    });

    const locators = page.locator('tp-yt-paper-toggle-button, ytcp-toggle, [role="switch"]');
    for (const item of toggleData) {
      const label = `${item.ariaLabel} ${item.containerText}`.toLowerCase();
      if (/automatyczne uruchamianie|auto-start/.test(label)) {
        if (!item.checked) {
          await locators.nth(item.idx).click({ force: true }).catch(() => {});
          await page.waitForTimeout(1000);
          info.autoStart = 'TURNED_ON';
        } else {
          info.autoStart = 'ALREADY_ON';
        }
      } else if (/automatyczne zatrzymywanie|auto-stop/.test(label)) {
        if (item.checked) {
          await locators.nth(item.idx).click({ force: true }).catch(() => {});
          await page.waitForTimeout(1000);
          info.autoStop = 'TURNED_OFF';
        } else {
          info.autoStop = 'ALREADY_OFF';
        }
      }
    }
  } catch (e) {
    info.error = e.message;
  }
  return info;
}

async function ensurePublicAndThumbnail(page, isAlreadyLive) {
  const result = { thumbStatus: 'SKIPPED', privacyStatus: 'UNKNOWN' };
  const editBtn = page.locator('#edit-button, ytcp-button:has-text("Edytuj"), button:has-text("Edytuj")').first();
  if (!(await editBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
    result.thumbStatus = 'NO_EDIT_BTN';
    return result;
  }
  await editBtn.click();
  await page.waitForTimeout(2500);

  const dlg = page.locator('ytls-broadcast-edit-dialog, ytcp-dialog:visible, tp-yt-paper-dialog:visible').first();

  // Ensure visibility is Publiczny
  try {
    const privacyArea = page.locator('ytls-broadcast-edit-dialog ytcp-dropdown-trigger, ytcp-dialog ytcp-dropdown-trigger').filter({ hasText: /Prywatny|Niepubliczny|Publiczny/ }).first();
    if (await privacyArea.isVisible({ timeout: 1500 }).catch(() => false)) {
      const currentVis = (await privacyArea.innerText().catch(() => '')).trim();
      if (/Publiczny/i.test(currentVis)) {
        result.privacyStatus = 'ALREADY_PUBLIC';
      } else {
        await privacyArea.click();
        await page.waitForTimeout(1000);
        const pubItem = page.locator('tp-yt-paper-item:has-text("Publiczny"), [role="option"]:has-text("Publiczny")').first();
        if (await pubItem.isVisible({ timeout: 2000 }).catch(() => false)) {
          await pubItem.click();
          await page.waitForTimeout(1000);
          result.privacyStatus = `CHANGED_TO_PUBLIC (was ${currentVis})`;
        }
      }
    }
  } catch {}

  // Upload thumbnail
  let fileSet = false;
  try {
    const fileInputs = page.locator('input[type="file"]');
    const fCount = await fileInputs.count();
    for (let i = 0; i < fCount; i++) {
      try {
        await fileInputs.nth(i).setInputFiles(THUMBNAIL_PATH);
        fileSet = true;
        break;
      } catch {}
    }

    if (!fileSet) {
      const optBtn = page.locator('ytcp-thumbnails-compact-editor-uploader #options-button, #thumbnail-section #options-button, [aria-label*="Opcje"]').first();
      if (await optBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await optBtn.click();
        await page.waitForTimeout(800);
        const changeItem = page.locator('tp-yt-paper-item:has-text("Zmień"), [role="menuitem"]:has-text("Zmień"), tp-yt-paper-item:has-text("Change")').first();
        if (await changeItem.isVisible({ timeout: 2000 }).catch(() => false)) {
          const [fc] = await Promise.all([
            page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null),
            changeItem.click()
          ]);
          if (fc) {
            await fc.setFiles(THUMBNAIL_PATH);
            fileSet = true;
          }
        }
      }
    }
  } catch (e) {
    result.thumbError = e.message;
  }

  await page.waitForTimeout(2000);
  const saveBtn = page.locator('ytls-broadcast-edit-dialog #save-button, ytcp-dialog #save-button, tp-yt-paper-dialog #save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').last();
  const saveState = await getRealButtonState(saveBtn);
  if (saveState.visible && !saveState.disabled) {
    await saveBtn.click();
    await page.waitForTimeout(3500);
    result.thumbStatus = fileSet ? 'SAVED' : 'SAVED_META_ONLY';
  } else {
    result.thumbStatus = fileSet ? 'SAVE_DISABLED_UNCHANGED' : 'NO_FILE_INPUT';
    const closeBtn = page.locator('#cancel-button, #close-button, button:has-text("Zamknij"), button:has-text("Anuluj")').last();
    if (await closeBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await closeBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
  }

  // Verify dialog closed cleanly
  if (await dlg.isVisible({ timeout: 500 }).catch(() => false)) {
    const closeFallback = page.locator('#cancel-button, #close-button, ytcp-button:has-text("Zamknij")').last();
    if (await closeFallback.isVisible().catch(() => false)) {
      await closeFallback.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
  }

  return result;
}

function readHealthFromText(bodyText) {
  const m = bodyText.match(/(?:^|\n|\s)(Doskonały|Dobry|Dobra|Słaby|Słaba|Brak danych|Brak sygnału|Przygotowuję transmisję|Oczekiwanie|Połącz oprogramowanie do transmisji)(?:\s|\n|$)/i);
  return m ? m[1] : 'nieznany';
}

async function openChannelStudioDirect(page, ch) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    await switchIdentity(page, ch.via, ch.channelName, attempt === 2);
    const manageUrl = `https://studio.youtube.com/channel/${ch.id}/livestreaming/manage?approve_browser_access=true`;
    await page.goto(manageUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4500);
    await passGate(page);
    await page.waitForTimeout(1500);

    const url = page.url();
    const title = await page.title();
    if (url.includes('accounts.google.com')) {
      throw new Error('SESSION_LOGIN_REQUIRED');
    }
    if (url.includes(ch.id) && !/Ups|Oops/i.test(title)) {
      return true;
    }
    console.log(`  [${ch.channelName}] Attempt ${attempt}: URL=${url}, Title=${title} — ponawiam switchIdentity...`);
    currentVia = null;
  }
  throw new Error(`Nie udało się otworzyć Studio dla ${ch.channelName} (${ch.id}); aktualny URL: ${page.url()}`);
}

async function enterLiveControlRoom(page, ch) {
  // Check /livestreaming/manage rows first
  const candidate = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('ytcp-video-row, [role="row"]'));
    const parsed = [];
    for (let i = 0; i < rows.length; i++) {
      const txt = (rows[i].innerText || '').replace(/\s+/g, ' ').trim();
      if (!txt || txt.includes('Data\t') || txt.startsWith('Transmisja na żywo')) continue;
      const link = rows[i].querySelector('a#video-title, a[href*="/video/"]');
      const href = link?.getAttribute('href') || '';
      const vidMatch = href.match(/\/video\/([^\/?#]+)/) || (rows[i].outerHTML || '').match(/\/video\/([a-zA-Z0-9_-]{11})\//);
      const vid = vidMatch ? vidMatch[1] : null;
      const isEnded = /Zakończono|Ended/i.test(txt);
      const isLiveNow = /Na żywo|Live now/i.test(txt);
      const isUpcoming = /Wkrótce|Gotowe|Nadchodzące|Upcoming/i.test(txt);
      parsed.push({ idx: i, vid, isEnded, isLiveNow, isUpcoming, text: txt.slice(0, 120) });
    }
    return (
      parsed.find(p => !p.isEnded && p.isLiveNow) ||
      parsed.find(p => !p.isEnded && p.isUpcoming) ||
      parsed.find(p => !p.isEnded && p.vid) ||
      null
    );
  });

  if (candidate && candidate.vid) {
    console.log(`  [${ch.channelName}] Path 1 (Manage row vid=${candidate.vid}): ${candidate.text.slice(0, 70)}`);
    await page.goto(`https://studio.youtube.com/video/${candidate.vid}/livestreaming?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(6000);
    await passGate(page);
    await dismissModals(page);
    return { pathUsed: 'MANAGE_ROW', videoId: candidate.vid };
  }

  // Path 2: Default Stream Room
  console.log(`  [${ch.channelName}] Path 2 (Default Stream Room /livestreaming/stream)...`);
  await page.goto(`https://studio.youtube.com/channel/${ch.id}/livestreaming/stream?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(7000);
  await passGate(page);
  await dismissModals(page);

  const curUrl = page.url();
  const vidMatch = curUrl.match(/\/video\/([^\/?#]+)/);
  return { pathUsed: 'DEFAULT_STREAM_ROOM', videoId: vidMatch ? vidMatch[1] : null };
}

async function processChannel(page, ch, index, total) {
  const entry = {
    channelName: ch.channelName,
    handle: ch.handle,
    id: ch.id,
    aitumOutput: ch.aitumOutput,
    status: 'UNKNOWN',
    health: 'nieznany',
    videoId: null,
    thumbStatus: null,
    privacyStatus: null,
    toggles: null,
    studioKey: null,
    roomUrl: null,
    error: null
  };

  try {
    await openChannelStudioDirect(page, ch);
    const roomInfo = await enterLiveControlRoom(page, ch);
    entry.roomUrl = page.url();
    entry.videoId = (entry.roomUrl.match(/\/video\/([^\/?#]+)/) || [])[1] || roomInfo.videoId;
    entry.pathUsed = roomInfo.pathUsed;

    await dismissModals(page);
    let bodyText = await page.locator('body').innerText().catch(() => '');

    // Check YouTube channel live eligibility restriction (e.g. 24h verification wait / disabled)
    if (/24 godz|zweryfikuj swoje konto|dostęp do transmisji na żywo jest wyłączony|nie masz dostępu do transmisji/i.test(bodyText)) {
      entry.status = 'YT_LIVE_RESTRICTED';
      entry.health = 'RESTRICTED';
      await page.screenshot({ path: path.join(SHOT_DIR, `${ch.channelName.replace(/[^\w]+/g, '_')}.png`) }).catch(() => {});
      return entry;
    }

    const endBtn = page.locator('#end-stream-button, ytcp-button:has-text("Zakończ transmisję"), button:has-text("Zakończ transmisję")').first();
    let alreadyLive = await endBtn.isVisible({ timeout: 2000 }).catch(() => false);

    // Special safety rule for Christian Culture TV: NEVER risk interrupting or stopping live stream
    if (ch.channelName === 'Christian Culture TV') {
      entry.videoId = entry.videoId || 'KdOBA_zRU0c';
      entry.health = readHealthFromText(bodyText);
      const metaRes = await ensurePublicAndThumbnail(page, true);
      entry.thumbStatus = metaRes.thumbStatus;
      entry.privacyStatus = metaRes.privacyStatus;
      // Only ensure auto-stop is OFF cleanly
      const toggles = await configureToggles(page);
      entry.toggles = toggles;
      entry.status = alreadyLive ? 'ALREADY_LIVE_THUMB_UPDATED' : 'LIVE_THUMB_UPDATED';
      await page.screenshot({ path: path.join(SHOT_DIR, `${ch.channelName.replace(/[^\w]+/g, '_')}.png`) }).catch(() => {});
      return entry;
    }

    // Update thumbnail + ensure Public
    const metaRes = await ensurePublicAndThumbnail(page, alreadyLive);
    entry.thumbStatus = metaRes.thumbStatus;
    entry.privacyStatus = metaRes.privacyStatus;

    // Configure Auto-start ON, Auto-stop OFF
    entry.toggles = await configureToggles(page);

    // Poll up to 60s (20 x 3s) for Go Live or Auto-start
    const goLiveBtn = page.locator('#start-stream-button, #go-live-button, ytcp-button:has-text("Transmituj na żywo"), button:has-text("Transmituj na żywo")').first();
    for (let iter = 0; iter < 20; iter++) {
      await dismissModals(page);
      bodyText = await page.locator('body').innerText().catch(() => '');
      entry.health = readHealthFromText(bodyText);

      // Re-check room URL in case Auto-start redirected /stream -> /video/<vid>/livestreaming
      const nowUrl = page.url();
      const vidNow = (nowUrl.match(/\/video\/([^\/?#]+)/) || [])[1];
      if (vidNow) {
        entry.videoId = vidNow;
        entry.roomUrl = nowUrl;
      }

      if (await endBtn.isVisible({ timeout: 800 }).catch(() => false)) {
        entry.status = alreadyLive ? 'ALREADY_LIVE' : (iter === 0 ? 'AUTO_STARTED' : 'LIVE_STARTED');
        break;
      }

      const btnState = await getRealButtonState(goLiveBtn);
      if (btnState.visible && !btnState.disabled) {
        console.log(`  [${ch.channelName}] Przycisk "Transmituj na żywo" AKTYWNY (iter=${iter}, health=${entry.health}) — klikam!`);
        await goLiveBtn.click();
        await page.waitForTimeout(2500);

        const confirmBtn = page.locator('#confirm-button, ytcp-button:has-text("Rozpocznij"), button:has-text("Rozpocznij")').first();
        if (await confirmBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
          const cState = await getRealButtonState(confirmBtn);
          if (!cState.disabled) {
            await confirmBtn.click();
          }
        }

        // Wait up to 15s for Zakończ transmisję
        for (let w = 0; w < 5; w++) {
          await page.waitForTimeout(3000);
          const nowVid = (page.url().match(/\/video\/([^\/?#]+)/) || [])[1];
          if (nowVid) entry.videoId = nowVid;
          if (await endBtn.isVisible({ timeout: 800 }).catch(() => false)) {
            entry.status = 'LIVE_STARTED';
            break;
          }
        }
        if (entry.status === 'LIVE_STARTED') break;
      }

      const noSignal = /Brak danych|Brak sygnału|Połącz oprogramowanie/i.test(entry.health) || /Połącz oprogramowanie do transmisji/i.test(bodyText);
      if (iter >= 6 && noSignal && btnState.disabled) {
        entry.status = 'NO_ENCODER_SIGNAL';
        entry.studioKey = await extractStreamKey(page);
        break;
      }

      if (iter === 19) {
        entry.status = 'TIMEOUT_PREVIEW_OR_DISABLED';
        entry.studioKey = await extractStreamKey(page);
      }
      await page.waitForTimeout(3000);
    }

    await page.screenshot({ path: path.join(SHOT_DIR, `${ch.channelName.replace(/[^\w]+/g, '_')}.png`) }).catch(() => {});
  } catch (err) {
    entry.status = 'ERROR';
    entry.error = err.message;
    await page.screenshot({ path: path.join(SHOT_DIR, `${ch.channelName.replace(/[^\w]+/g, '_')}_ERR.png`) }).catch(() => {});
    if (err.message.includes('SESSION_LOGIN_REQUIRED')) {
      throw err;
    }
  }

  return entry;
}

async function main() {
  console.log(`=== MASTER GO LIVE ALL ${targetList.length} CHANNELS ===`);
  const dedicatedProfile = process.env.CC_YT_PROFILE_DIR;
  let ctx, page;
  if (dedicatedProfile) {
    console.log(`Using dedicated profile (no lock contention): ${dedicatedProfile}`);
    ctx = await chromium.launchPersistentContext(dedicatedProfile, {
      headless: true,
      channel: 'chrome',
      viewport: { width: 1600, height: 1000 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
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
    page = ctx.pages()[0] || await ctx.newPage();
  } else {
    ({ ctx, page } = await launchStudio({ headless: true, lockWaitMs: 45 * 60 * 1000 }));
  }
  const results = [];

  try {
    for (let i = 0; i < targetList.length; i++) {
      const ch = targetList[i];
      console.log(`\n[${i + 1}/${targetList.length}] >>> ${ch.channelName} (${ch.handle}) | Aitum: ${ch.aitumOutput} <<<`);
      const res = await processChannel(page, ch, i + 1, targetList.length);
      results.push(res);

      // Persist incrementally after every channel
      fs.writeFileSync(REPORT_PATH, JSON.stringify({
        updatedAt: new Date().toISOString(),
        totalProcessed: results.length,
        results
      }, null, 2), 'utf8');

      console.log(`[${i + 1}/${targetList.length}] ${ch.channelName} | status=${res.status} | health=${res.health} | vid=${res.videoId || '-'} | thumb=${res.thumbStatus} | studioKey=${res.studioKey ? res.studioKey.slice(0, 4) + '...' + res.studioKey.slice(-4) : '-'}`);
    }
  } finally {
    await ctx.close();
  }

  console.log('\n=== SUMMARY ===');
  for (const r of results) {
    console.log(`${r.channelName.padEnd(28)} | ${r.status.padEnd(26)} | vid=${(r.videoId || '-').padEnd(11)} | thumb=${r.thumbStatus} | key=${r.studioKey || '-'}`);
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
