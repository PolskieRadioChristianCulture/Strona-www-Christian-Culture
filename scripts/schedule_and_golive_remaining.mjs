import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';
import { ALL_CHANNELS } from './all_channels_config.mjs';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_live_dedicated_profile';
const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_tvw_live.jpg';
const REPORT_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\remaining_18_report.json';
const SHOT_DIR = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scratch\\golive_18';

const DIRECT_VID_OVERRIDES = {
  'Biblia Audio CC': 'LLO4p4XNJoY'
};

const OBS_WS = 'ws://192.168.50.217:4455';
const OBS_PASS = '6qPcL0sXrVvs6sPN';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';

const DESCRIPTION = `🕊️ POZNAJ SŁOWO, KTÓRE ODMIENI TWOJE ŻYCIE • LIVE 24/7
Dołącz do wspólnego uwielbienia, modlitwy i zanurzenia w Żywym Słowie Bożym.
Każdego dnia odkrywaj Boży pokój, nadzieję i siłę w Chrystusie.

🙏 WESPRZYJ MISJĘ CHRISTIAN CULTURE:
👉 https://polskieradio.cc/wspieraj

🌐 PORTALE I NARZĘDZIA WIARY:
📱 Portal LUMINA: https://polskieradio.cc/lumina
📖 Biblia Interlinearna: https://polskieradio.cc/mojabiblia
🎧 Chrześcijańskie Radio i Słuchowiska: https://polskieradio.cc/player

#ChristianCulture #SlowoBoze #Uwielbienie #Modlitwa #Biblia #Wiara #Live247`;

fs.mkdirSync(SHOT_DIR, { recursive: true });
if (!fs.existsSync(THUMBNAIL_PATH)) {
  throw new Error(`Brak pliku miniatury: ${THUMBNAIL_PATH}`);
}

const ALREADY_LIVE = new Set([
  'Christian Culture TV',
  'Polskie Radio CC',
  'CC Men',
  'Popraw Koronę'
]);

let targetList = ALL_CHANNELS.filter(c => !ALREADY_LIVE.has(c.channelName));
if (process.argv[2]) {
  const only = new Set(process.argv[2].split(',').map(s => s.trim()).filter(Boolean));
  targetList = ALL_CHANNELS.filter(c => only.has(c.channelName) || only.has(c.handle) || only.has(c.aitumOutput));
}

let currentVia = null;

function trimUnicode(str, maxLen = 96) {
  const chars = [...str];
  return chars.length <= maxLen ? str : chars.slice(0, maxLen).join('').trim();
}

async function restartSingleAitumOutput(outputName) {
  console.log(`  [OBS WS] Restarting ONLY Aitum output "${outputName}"...`);
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(OBS_WS);
    const overallTimer = setTimeout(() => {
      try { ws.close(); } catch {}
      reject(new Error(`Timeout restarting output ${outputName}`));
    }, 25000);

    function send(type, data = {}) {
      return new Promise((res, rej) => {
        const id = crypto.randomUUID();
        const t = setTimeout(() => rej(new Error('timeout ' + type)), 10000);
        const h = (e) => {
          const m = JSON.parse(e.data);
          if (m.op === 7 && m.d.requestId === id) {
            clearTimeout(t);
            ws.removeEventListener('message', h);
            if (m.d.requestStatus.result) res(m.d.responseData);
            else rej(new Error(m.d.requestStatus.comment || `OBS ${type} failed`));
          }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ op: 6, d: { requestType: type, requestId: id, requestData: data } }));
      });
    }

    ws.onmessage = async (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.op === 0) {
          const ident = { rpcVersion: 1, eventSubscriptions: 0 };
          if (msg.d.authentication) {
            const { challenge, salt } = msg.d.authentication;
            const secret = crypto.createHash('sha256').update(OBS_PASS + salt).digest('base64');
            ident.authentication = crypto.createHash('sha256').update(secret + challenge).digest('base64');
          }
          ws.send(JSON.stringify({ op: 1, d: ident }));
        } else if (msg.op === 2) {
          await send('TriggerHotkeyByName', { hotkeyName: `AitumStreamSuiteStopOutput${outputName}` })
            .catch(err => console.log(`  [OBS WS] Stop note (${outputName}): ${err.message}`));
          await new Promise(r => setTimeout(r, 2500));
          await send('TriggerHotkeyByName', { hotkeyName: `AitumStreamSuiteStartOutput${outputName}` });
          await new Promise(r => setTimeout(r, 2500));
          clearTimeout(overallTimer);
          ws.close();
          console.log(`  [OBS WS] Reconnected single output "${outputName}" cleanly.`);
          resolve();
        }
      } catch (err) {
        clearTimeout(overallTimer);
        try { ws.close(); } catch {}
        reject(err);
      }
    };
    ws.onerror = (err) => {
      clearTimeout(overallTimer);
      reject(new Error(`OBS WS error: ${err?.message || 'connection error'}`));
    };
  });
}

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

async function dismissModals(page) {
  const bodyText = await page.locator('body').innerText().catch(() => '');
  if (/Edytowanie układu pionowego|układ pionowy|Vertical crop|Editing vertical layout/i.test(bodyText)) {
    const btns = page.locator('button:has-text("Gotowe"), ytcp-button:has-text("Gotowe"), button:has-text("Done"), ytcp-button:has-text("Done")');
    const count = await btns.count().catch(() => 0);
    for (let i = 0; i < count; i++) {
      const b = btns.nth(i);
      if (await b.isVisible().catch(() => false)) {
        await b.click({ force: true }).catch(() => {});
        await page.waitForTimeout(1000);
        break;
      }
    }
  }
  if (/Funkcja automatycznego uruchamiania rozpocznie transmisję/i.test(bodyText)) {
    const enableBtn = page.locator('ytcp-button:has-text("Włącz"), button:has-text("Włącz")').last();
    if (await enableBtn.isVisible().catch(() => false)) {
      await enableBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1200);
    }
  }
  const dialogs = page.locator('tp-yt-paper-dialog, ytcp-dialog, ytcp-confirmation-dialog');
  const dCount = await dialogs.count().catch(() => 0);
  for (let i = 0; i < dCount; i++) {
    const dlg = dialogs.nth(i);
    if (!(await dlg.isVisible().catch(() => false))) continue;
    const t = (await dlg.innerText().catch(() => '')).toLowerCase();
    if (t.includes('czy na pewno chcesz zakończyć') || t.includes('zakończ transmisję')) continue;
    if (t.includes('edytowanie układu pionowego') || t.includes('układ pionowy')) {
      const done = dlg.locator('button:has-text("Gotowe"), ytcp-button:has-text("Gotowe")').first();
      if (await done.isVisible().catch(() => false)) {
        await done.click({ force: true }).catch(() => {});
        await page.waitForTimeout(1000);
      }
    } else if (t.includes('automatycznego uruchamiania')) {
      const enable = dlg.locator('ytcp-button:has-text("Włącz"), button:has-text("Włącz")').last();
      if (await enable.isVisible().catch(() => false)) {
        await enable.click({ force: true }).catch(() => {});
        await page.waitForTimeout(1200);
      }
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

      if (page.url().includes('accounts.google.com')) {
        throw new Error('SESSION_LOGIN_REQUIRED');
      }

      const matchedIdx = await page.evaluate((cands) => {
        const items = Array.from(document.querySelectorAll('ytd-account-item-renderer'));
        const texts = items.map(el => (el.innerText || '').replace(/\s+/g, ' ').trim().toLowerCase());
        for (const c of cands) {
          const i = texts.findIndex(t => t.includes(c));
          if (i !== -1) return i;
        }
        return -1;
      }, targets);

      if (matchedIdx === -1) {
        if (attempt === 1) {
          await page.waitForTimeout(2000);
          continue;
        }
        throw new Error(`Brak tożsamości "${via}" / "${channelName}" w channel_switcher`);
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
  throw new Error(`Nie udało się otworzyć Studio dla ${ch.channelName} (${ch.id}); URL: ${page.url()}`);
}

async function ensureDefaultStreamKeySelected(page) {
  try {
    const keyTrigger = page.locator('ytcp-dropdown-trigger:has-text("Klucz:"), button:has-text("Klucz:"), [aria-label*="Klucz"], ytls-stream-key-selector ytcp-dropdown-trigger').first();
    if (!(await keyTrigger.isVisible({ timeout: 2500 }).catch(() => false))) {
      return 'NO_KEY_DROPDOWN';
    }
    const label = (await keyTrigger.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    if (/Default stream key/i.test(label)) {
      return 'KEY_ALREADY_DEFAULT';
    }
    console.log(`  [StreamKey] Aktualny klucz "${label}" -> zmieniam na Default stream key...`);
    await keyTrigger.click({ force: true });
    await page.waitForTimeout(1500);
    const defOption = page.locator('tp-yt-paper-item:has-text("Default stream key"), [role="option"]:has-text("Default stream key"), ytcp-ve:has-text("Default stream key")').first();
    if (await defOption.isVisible({ timeout: 2500 }).catch(() => false)) {
      await defOption.click({ force: true });
      await page.waitForTimeout(2500);
      return 'SWITCHED_TO_DEFAULT';
    }
    // Close dropdown cleanly if option not found
    await page.keyboard.press('Escape').catch(() => {});
    return `NO_DEFAULT_OPTION (current=${label})`;
  } catch (err) {
    return `ERROR: ${err.message}`;
  }
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
          await page.waitForTimeout(1500);
          // Confirm "Włącz automatyczne uruchamianie" popup dialog if shown
          const enableConfirm = page.locator('tp-yt-paper-dialog ytcp-button:has-text("Włącz"), ytcp-dialog ytcp-button:has-text("Włącz"), ytcp-confirmation-dialog ytcp-button:has-text("Włącz"), ytcp-button:has-text("Włącz")').last();
          if (await enableConfirm.isVisible({ timeout: 2500 }).catch(() => false)) {
            await enableConfirm.click({ force: true }).catch(() => {});
            await page.waitForTimeout(2000);
          }
          // Fallback ensure no confirmation backdrop remains open
          await dismissModals(page);
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

async function setPublicOnVideoEditPage(page, vid) {
  console.log(`  [EditPage] Ustawiam Publiczny i miniaturę na /video/${vid}/edit...`);
  await page.goto(`https://studio.youtube.com/video/${vid}/edit?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4500);
  await passGate(page);

  let changed = false;
  // Open visibility selector on /video/<id>/edit if currently Niepubliczny/Prywatny
  const visContainer = page.locator('#visibility-button, ytcp-video-metadata-visibility #trigger, ytcp-dropdown-trigger:has-text("Niepubliczny"), ytcp-dropdown-trigger:has-text("Prywatny")').first();
  if (await visContainer.isVisible({ timeout: 2500 }).catch(() => false)) {
    const txt = (await visContainer.innerText().catch(() => '')).trim();
    if (!/Publiczny/i.test(txt)) {
      await visContainer.click({ force: true });
      await page.waitForTimeout(1500);
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
      if (await pubRadio.isVisible({ timeout: 2500 }).catch(() => false)) {
        await pubRadio.click({ force: true });
        await page.waitForTimeout(1000);
        changed = true;
      }
      const doneVis = page.locator('#save-button:visible, ytcp-button:has-text("Gotowe"):visible, button:has-text("Gotowe"):visible').last();
      if (await doneVis.isVisible({ timeout: 1500 }).catch(() => false)) {
        await doneVis.click({ force: true });
        await page.waitForTimeout(1500);
      }
    }
  }

  // Ensure thumbnail too
  const inputs = page.locator('input[type="file"]');
  const cnt = await inputs.count().catch(() => 0);
  for (let i = 0; i < cnt; i++) {
    try {
      await inputs.nth(i).setInputFiles(THUMBNAIL_PATH);
      changed = true;
      break;
    } catch {}
  }

  await page.waitForTimeout(2000);
  const saveMain = page.locator('#save, #save-button, ytcp-button:has-text("Zapisz")').first();
  const st = await getRealButtonState(saveMain);
  if (st.visible && !st.disabled) {
    await saveMain.click();
    await page.waitForTimeout(4500);
  }
  return changed;
}

async function ensurePublicAndThumbnailInRoom(page) {
  const res = { thumbStatus: 'SKIPPED', privacyStatus: 'UNKNOWN' };
  // IMPORTANT: Match ONLY exact "Edytuj" — substring :has-text("Edytuj") hits "Edytuj układ" (vertical crop)!
  const editBtn = page.locator('ytls-broadcast-metadata ytcp-button, ytls-broadcast-metadata button, ytcp-button, button').filter({ hasText: /^Edytuj$/ }).first();
  if (!(await editBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
    res.thumbStatus = 'NO_EDIT_BTN';
    return res;
  }
  await editBtn.click();
  await page.waitForTimeout(2500);

  // Guard against vertical layout modal if somehow triggered
  const dlgText = await page.locator('tp-yt-paper-dialog:visible, ytcp-dialog:visible').first().innerText().catch(() => '');
  if (/Edytuj układ pionowy/i.test(dlgText)) {
    const cancelBtn = page.locator('button:has-text("Anuluj"), ytcp-button:has-text("Anuluj")').last();
    if (await cancelBtn.isVisible().catch(() => false)) await cancelBtn.click({ force: true }).catch(() => {});
    res.thumbStatus = 'HIT_VERTICAL_EDIT_CANCELLED';
    return res;
  }

  try {
    const pubRadioInEdit = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    const privacyArea = page.locator('ytls-broadcast-edit-dialog ytcp-dropdown-trigger, ytcp-dialog ytcp-dropdown-trigger, ytcp-text-dropdown-trigger').filter({ hasText: /Prywatny|Niepubliczny|Publiczny/ }).first();
    if (await pubRadioInEdit.isVisible({ timeout: 1000 }).catch(() => false)) {
      await pubRadioInEdit.click({ force: true });
      await page.waitForTimeout(1000);
      res.privacyStatus = 'PUBLIC_RADIO_CLICKED';
    } else if (await privacyArea.isVisible({ timeout: 1500 }).catch(() => false)) {
      const visText = (await privacyArea.innerText().catch(() => '')).trim();
      if (/Publiczny/i.test(visText)) {
        res.privacyStatus = 'ALREADY_PUBLIC';
      } else {
        await privacyArea.click({ force: true });
        await page.waitForTimeout(1000);
        const pubItem = page.locator('tp-yt-paper-item:has-text("Publiczny"), [role="option"]:has-text("Publiczny")').first();
        if (await pubItem.isVisible({ timeout: 2000 }).catch(() => false)) {
          await pubItem.click({ force: true });
          await page.waitForTimeout(1000);
          res.privacyStatus = 'CHANGED_TO_PUBLIC';
        }
      }
    }
  } catch {}

  let fileSet = false;
  try {
    const inputs = page.locator('input[type="file"]');
    const cnt = await inputs.count();
    for (let i = 0; i < cnt; i++) {
      try {
        await inputs.nth(i).setInputFiles(THUMBNAIL_PATH);
        fileSet = true;
        break;
      } catch {}
    }
    if (!fileSet) {
      const optBtn = page.locator('ytcp-thumbnails-compact-editor-uploader #options-button, #thumbnail-section #options-button, [aria-label*="Opcje"]').first();
      if (await optBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await optBtn.click();
        await page.waitForTimeout(800);
        const changeItem = page.locator('tp-yt-paper-item:has-text("Zmień"), [role="menuitem"]:has-text("Zmień")').first();
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
  } catch {}

  await page.waitForTimeout(2000);
  const saveBtn = page.locator('ytls-broadcast-edit-dialog #save-button, ytcp-dialog #save-button, tp-yt-paper-dialog #save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').last();
  const st = await getRealButtonState(saveBtn);
  if (st.visible && !st.disabled) {
    await saveBtn.click();
    await page.waitForTimeout(3500);
    res.thumbStatus = fileSet ? 'SAVED' : 'SAVED_META_ONLY';
  } else {
    res.thumbStatus = fileSet ? 'SAVE_DISABLED_UNCHANGED' : 'NO_FILE_INPUT';
    const closeBtn = page.locator('#cancel-button, #close-button, button:has-text("Zamknij"), button:has-text("Anuluj")').last();
    if (await closeBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await closeBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
  }
  return res;
}

async function scheduleNewBroadcastOnManage(page, ch) {
  console.log(`  [${ch.channelName}] Tworzę nową zaplanowaną transmisję ("Zaplanuj transmisję")...`);
  const schedBtn = page.locator('ytcp-button:has-text("Zaplanuj transmisję"), button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
  if (!(await schedBtn.isVisible({ timeout: 4000 }).catch(() => false))) {
    throw new Error('Brak przycisku "Zaplanuj transmisję" na stronie Zarządzanie');
  }
  await schedBtn.click();
  await page.waitForTimeout(3000);

  // If "Ponownie użyj ustawień" popup appears, click "Utwórz nowe"
  const createNewBtn = page.locator('ytcp-button:has-text("Utwórz nowe"), button:has-text("Utwórz nowe"), ytcp-button:has-text("Create new")').first();
  if (await createNewBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log(`  [${ch.channelName}] Klikam "Utwórz nowe"...`);
    await createNewBtn.click();
    await page.waitForTimeout(2500);
  }

  // Step 1: Title & Description
  const streamTitle = trimUnicode(`Poznaj Słowo, Które Odmieni Twoje Życie • ${ch.channelName} 🔴 LIVE 24/7`, 96);
  const titleInput = page.locator('#title-textarea #textbox, ytcp-social-suggestions-textbox[id*="title"] #textbox, ytls-broadcast-create-dialog #textbox').first();
  if (await titleInput.isVisible({ timeout: 4000 }).catch(() => false)) {
    await titleInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await titleInput.fill(streamTitle);
    await page.waitForTimeout(800);
  }

  const descInput = page.locator('#description-textarea #textbox, ytcp-social-suggestions-textbox[id*="description"] #textbox').first();
  if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await descInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await descInput.fill(DESCRIPTION);
    await page.waitForTimeout(800);
  }

  // Thumbnail upload in Step 1
  let thumbSet = false;
  const imgInputs = page.locator('input[type="file"][accept*="image"], input[type="file"]');
  const iCnt = await imgInputs.count().catch(() => 0);
  for (let i = 0; i < iCnt; i++) {
    try {
      await imgInputs.nth(i).setInputFiles(THUMBNAIL_PATH);
      thumbSet = true;
      break;
    } catch {}
  }
  if (!thumbSet) {
    const thumbBtn = page.locator('ytcp-button:has-text("Prześlij miniaturę"), button:has-text("Prześlij miniaturę"), #upload-button').first();
    if (await thumbBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const [fc] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 6000 }).catch(() => null),
        thumbBtn.click()
      ]);
      if (fc) {
        await fc.setFiles(THUMBNAIL_PATH);
        thumbSet = true;
      }
    }
  }
  if (thumbSet) await page.waitForTimeout(2500);

  // Not made for kids
  const notKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notKids.isVisible({ timeout: 2000 }).catch(() => false)) {
    await notKids.click();
    await page.waitForTimeout(800);
  }

  // Advance wizard steps cleanly until PUBLIC radio is visible (handles both 3 and 4 steps)
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  for (let step = 0; step < 5; step++) {
    if (await pubRadio.isVisible({ timeout: 1000 }).catch(() => false)) break;
    const nextBtn = page.locator('#next-button, ytcp-button:has-text("Dalej"), button:has-text("Dalej")').last();
    const st = await getRealButtonState(nextBtn);
    if (!st.visible) break;
    if (st.disabled) {
      await page.waitForTimeout(2000);
      continue;
    }
    await nextBtn.click();
    await page.waitForTimeout(2500);
  }

  // Select Publiczny (force click radio button and verify selection before Gotowe)
  if (await pubRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
    await pubRadio.click({ force: true });
    await page.waitForTimeout(1200);
    const pubLabel = pubRadio.locator('#radioLabel, #offRadio').first();
    const isChecked = await pubRadio.getAttribute('aria-checked').catch(() => null);
    if (isChecked !== 'true' && await pubLabel.isVisible().catch(() => false)) {
      await pubLabel.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1000);
    }
  }

  // Click Gotowe (#done-button)
  const doneBtn = page.locator('#done-button, ytcp-button:has-text("Gotowe"), button:has-text("Gotowe")').last();
  if (await doneBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await doneBtn.click();
    await page.waitForTimeout(7000);
  }

  // Close optional share popup if it popped up
  const closeShare = page.locator('ytcp-video-share-dialog #close-button, ytcp-dialog #close-button[aria-label*="Zamknij"]').first();
  if (await closeShare.isVisible({ timeout: 1500 }).catch(() => false)) {
    await closeShare.click().catch(() => {});
    await page.waitForTimeout(1500);
  }

  // Check if Studio redirected straight to /video/<ID>/livestreaming
  const curUrl = page.url();
  const directMatch = curUrl.match(/\/video\/([^\/?#]+)\/livestreaming/);
  if (directMatch) {
    return { videoId: directMatch[1], thumbSet };
  }

  // Otherwise locate the newly created row on /manage and navigate directly
  await page.waitForTimeout(2000);
  const newVid = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('ytcp-video-row, [role="row"]'));
    for (const r of rows) {
      const txt = (r.innerText || '').replace(/\s+/g, ' ').trim();
      if (!txt || /Zakończono|Ended/i.test(txt)) continue;
      const a = r.querySelector('a#video-title, a[href*="/video/"]');
      const href = a?.getAttribute('href') || '';
      const m = href.match(/\/video\/([^\/?#]+)/) || (r.outerHTML || '').match(/\/video\/([a-zA-Z0-9_-]{11})\//);
      if (m) return m[1];
    }
    return null;
  });

  if (!newVid) {
    throw new Error('Utworzono transmisję, ale nie znaleziono jej videoId na /livestreaming/manage');
  }

  await page.goto(`https://studio.youtube.com/video/${newVid}/livestreaming?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);
  await passGate(page);
  await dismissModals(page);
  return { videoId: newVid, thumbSet };
}

function readHealthFromText(bodyText) {
  const m = bodyText.match(/(?:^|\n|\s)(Doskonały|Dobry|Dobra|Słaby|Słaba|Brak danych|Brak sygnału|Przygotowuję transmisję|Oczekiwanie|Połącz oprogramowanie do transmisji)(?:\s|\n|$)/i);
  return m ? m[1] : 'nieznany';
}

async function processChannel(page, ch) {
  const entry = {
    channelName: ch.channelName,
    handle: ch.handle,
    id: ch.id,
    aitumOutput: ch.aitumOutput,
    status: 'UNKNOWN',
    health: 'nieznany',
    videoId: null,
    keySelection: null,
    reconnectedObs: false,
    thumbStatus: null,
    privacyStatus: null,
    toggles: null,
    studioKey: null,
    roomUrl: null,
    error: null
  };

  try {
    await openChannelStudioDirect(page, ch);

    const overrideVid = DIRECT_VID_OVERRIDES[ch.channelName];
    if (overrideVid) {
      console.log(`  [${ch.channelName}] Bezpośrednie wejście w pokój: ${overrideVid}`);
      entry.videoId = overrideVid;
      await page.goto(`https://studio.youtube.com/video/${overrideVid}/livestreaming?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(6500);
      await passGate(page);
      await dismissModals(page);

      const meta = await ensurePublicAndThumbnailInRoom(page);
      entry.thumbStatus = meta.thumbStatus;
      entry.privacyStatus = meta.privacyStatus;
    } else {
      // Check /manage for an existing active/upcoming non-ended broadcast first
      const existingVid = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('ytcp-video-row, [role="row"]'));
        const candidates = [];
        for (const r of rows) {
          const txt = (r.innerText || '').replace(/\s+/g, ' ').trim();
          if (!txt || txt.startsWith('Transmisja na żywo') || /Zakończono|Ended/i.test(txt)) continue;
          const a = r.querySelector('a#video-title, a[href*="/video/"]');
          const href = a?.getAttribute('href') || '';
          const m = href.match(/\/video\/([^\/?#]+)/) || (r.outerHTML || '').match(/\/video\/([a-zA-Z0-9_-]{11})\//);
          if (m) candidates.push({ vid: m[1], isPublic: /Publiczny/i.test(txt), isLive: /Na żywo/i.test(txt) });
        }
        return (
          candidates.find(c => c.isLive) ||
          candidates.find(c => c.isPublic) ||
          candidates[0] ||
          null
        )?.vid || null;
      });

      if (existingVid) {
        console.log(`  [${ch.channelName}] Znaleziono istniejący pokój na /manage: ${existingVid}`);
        entry.videoId = existingVid;
        await page.goto(`https://studio.youtube.com/video/${existingVid}/livestreaming?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(6500);
        await passGate(page);
        await dismissModals(page);

        const meta = await ensurePublicAndThumbnailInRoom(page);
        entry.thumbStatus = meta.thumbStatus;
        entry.privacyStatus = meta.privacyStatus;
      } else {
        const created = await scheduleNewBroadcastOnManage(page, ch);
        entry.videoId = created.videoId;
        entry.thumbStatus = created.thumbSet ? 'SET_AT_SCHEDULE' : 'MISSING_AT_SCHEDULE';
        entry.privacyStatus = 'PUBLIC_SCHEDULED';
      }
    }

    entry.roomUrl = page.url();
    await dismissModals(page);
    let bodyText = await page.locator('body').innerText().catch(() => '');

    if (/Prywatność\s+(Niepubliczny|Prywatny)/i.test(bodyText)) {
      console.log(`  [${ch.channelName}] Wykryto prywatność != Publiczny -> koryguję w Edytuj na Publiczny...`);
      const metaFix = await ensurePublicAndThumbnailInRoom(page);
      entry.privacyStatus = metaFix.privacyStatus;
      if (metaFix.thumbStatus === 'SAVED') entry.thumbStatus = 'SAVED';
      bodyText = await page.locator('body').innerText().catch(() => '');
      if (/Prywatność\s+(Niepubliczny|Prywatny)/i.test(bodyText) && entry.videoId) {
        await setPublicOnVideoEditPage(page, entry.videoId);
        await page.goto(`https://studio.youtube.com/video/${entry.videoId}/livestreaming?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(6000);
        await passGate(page);
        await dismissModals(page);
        bodyText = await page.locator('body').innerText().catch(() => '');
        entry.privacyStatus = /Prywatność\s+Publiczny/i.test(bodyText) ? 'PUBLIC_FIXED_VIA_EDIT' : 'STILL_NOT_PUBLIC';
      }
    }

    if (/24 godz|zweryfikuj swoje konto|dostęp do transmisji na żywo jest wyłączony|nie masz dostępu do transmisji/i.test(bodyText)) {
      entry.status = 'YT_LIVE_RESTRICTED';
      entry.health = 'RESTRICTED';
      await page.screenshot({ path: path.join(SHOT_DIR, `${ch.channelName.replace(/[^\w]+/g, '_')}.png`) }).catch(() => {});
      return entry;
    }

    const endBtn = page.locator('#end-stream-button, ytcp-button:has-text("Zakończ transmisję"), button:has-text("Zakończ transmisję")').first();
    let alreadyLive = await endBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (alreadyLive) {
      entry.status = 'ALREADY_LIVE';
      entry.health = readHealthFromText(bodyText);
      entry.toggles = await configureToggles(page);
      await page.screenshot({ path: path.join(SHOT_DIR, `${ch.channelName.replace(/[^\w]+/g, '_')}.png`) }).catch(() => {});
      return entry;
    }

    entry.keySelection = await ensureDefaultStreamKeySelected(page);
    entry.toggles = await configureToggles(page);

    const goLiveBtn = page.locator('#start-stream-button, #go-live-button, ytcp-button:has-text("Transmituj na żywo"), button:has-text("Transmituj na żywo")').first();

    for (let iter = 0; iter < 24; iter++) {
      await dismissModals(page);
      bodyText = await page.locator('body').innerText().catch(() => '');
      entry.health = readHealthFromText(bodyText);

      if (await endBtn.isVisible({ timeout: 800 }).catch(() => false)) {
        entry.status = iter === 0 ? 'AUTO_STARTED' : 'LIVE_STARTED';
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
          if (!cState.disabled) await confirmBtn.click();
        }

        for (let w = 0; w < 6; w++) {
          await page.waitForTimeout(3000);
          if (await endBtn.isVisible({ timeout: 800 }).catch(() => false)) {
            entry.status = 'LIVE_STARTED';
            break;
          }
        }
        if (entry.status === 'LIVE_STARTED') break;
      }

      // If still "Brak danych" by iter=4 (~12s) and not reconnected yet -> bounce ONLY this single Aitum output
      const isNoSignal = /Brak danych|Brak sygnału|Połącz oprogramowanie/i.test(entry.health) || /Aby uruchomić podgląd, podłącz koder/i.test(bodyText);
      if (iter === 4 && isNoSignal && !entry.reconnectedObs && ch.aitumOutput) {
        try {
          await restartSingleAitumOutput(ch.aitumOutput);
          entry.reconnectedObs = true;
          await page.waitForTimeout(4000);
          continue;
        } catch (obsErr) {
          console.log(`  [${ch.channelName}] OBS single-output restart warning: ${obsErr.message}`);
          entry.reconnectedObs = 'FAILED: ' + obsErr.message;
        }
      }

      if (iter === 23) {
        entry.status = isNoSignal ? 'NO_ENCODER_SIGNAL' : 'TIMEOUT_PREVIEW_OR_DISABLED';
        entry.studioKey = await extractStreamKey(page);
      }

      await page.waitForTimeout(3000);
    }

    await page.screenshot({ path: path.join(SHOT_DIR, `${ch.channelName.replace(/[^\w]+/g, '_')}.png`) }).catch(() => {});
  } catch (err) {
    entry.status = 'ERROR';
    entry.error = err.message;
    await page.screenshot({ path: path.join(SHOT_DIR, `${ch.channelName.replace(/[^\w]+/g, '_')}_ERR.png`) }).catch(() => {});
    if (err.message.includes('SESSION_LOGIN_REQUIRED')) throw err;
  }

  return entry;
}

async function main() {
  console.log(`=== SCHEDULE & GO LIVE (${targetList.length} CHANNELS) ===`);
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
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

  let cumulative = new Map();
  if (fs.existsSync(REPORT_PATH)) {
    try {
      const prev = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
      for (const r of prev.results || []) cumulative.set(r.channelName, r);
    } catch {}
  }

  const runResults = [];
  try {
    const page = ctx.pages()[0] || await ctx.newPage();
    for (let i = 0; i < targetList.length; i++) {
      const ch = targetList[i];
      console.log(`\n[${i + 1}/${targetList.length}] >>> ${ch.channelName} (${ch.handle}) | Aitum: ${ch.aitumOutput} <<<`);
      const res = await processChannel(page, ch);
      runResults.push(res);
      cumulative.set(res.channelName, res);

      fs.writeFileSync(REPORT_PATH, JSON.stringify({
        updatedAt: new Date().toISOString(),
        totalTracked: cumulative.size,
        results: Array.from(cumulative.values())
      }, null, 2), 'utf8');

      console.log(`[${i + 1}/${targetList.length}] ${ch.channelName} | status=${res.status} | health=${res.health} | vid=${res.videoId || '-'} | keySel=${res.keySelection} | reconn=${res.reconnectedObs} | studioKey=${res.studioKey || '-'}`);
    }
  } finally {
    await ctx.close();
  }

  console.log('\n=== BATCH SUMMARY ===');
  for (const r of runResults) {
    console.log(`${r.channelName.padEnd(28)} | ${r.status.padEnd(26)} | vid=${(r.videoId || '-').padEnd(11)} | keySel=${r.keySelection || '-'} | err=${r.error || '-'}`);
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
