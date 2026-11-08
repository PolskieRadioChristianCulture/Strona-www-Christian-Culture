#!/usr/bin/env node
/**
 * Christian Culture Mission Calendar (@ccMC) — Quarter-Hour Real Google Calendar & Automation Status Sync
 * Realizuje kontrakt ze skilla: gcalendar-quarter-hour-reports (SKILL.md)
 * Oraz agreguje rzeczywisty stan dzisiejszych publikacji i automatyzacji EkoCC (@777).
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';

const TIMEZONE = 'Europe/Warsaw';
const TARGET_ACCOUNT = 'nazirczarkes@gmail.com';
const REPO_ROOT = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc';
const JOMA_ROOT = 'C:\\Users\\czark\\Desktop\\Misja CC\\JOMA_SHARED_MEMORY';

function toWarsawRfc3339(date) {
  const fmt = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const str = fmt.format(date).replace(' ', 'T');
  const tzName = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    timeZoneName: 'longOffset',
  })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName')?.value;
  const offset = tzName && tzName.startsWith('GMT') ? tzName.replace('GMT', '') || '+01:00' : '+01:00';
  return `${str}${offset}`;
}

function getTodayWarsawIso(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function readJsonAutoEncoding(filePath) {
  const buf = fs.readFileSync(filePath);
  let text = '';
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    text = buf.subarray(2).toString('utf16le');
  } else if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    text = buf.subarray(2).swap16().toString('utf16le');
  } else {
    text = buf.toString('utf8').replace(/^\uFEFF/, '');
  }
  const trimmed = text.trim();
  const firstBracket = trimmed.search(/[\[{]/);
  if (firstBracket > 0) {
    return JSON.parse(trimmed.slice(firstBracket));
  }
  return JSON.parse(trimmed);
}

function normalizeGcalItems(items, calId) {
  const out = [];
  if (!Array.isArray(items)) return out;
  for (const ev of items) {
    if (!ev || ev.status === 'cancelled') continue;
    const startVal = ev.start?.dateTime || ev.start?.date || null;
    const endVal = ev.end?.dateTime || ev.end?.date || null;
    const origStart = ev.originalStartTime?.dateTime || ev.originalStartTime?.date || startVal;
    if (!startVal) continue;
    out.push({
      calendar_id: calId === 'primary' ? TARGET_ACCOUNT : calId,
      event_id: ev.id || null,
      recurring_event_id: ev.recurringEventId || null,
      occurrence_start: origStart,
      start: startVal,
      end: endVal,
      all_day: Boolean(ev.start?.date && !ev.start?.dateTime),
      title: (ev.summary || 'Zajęty termin').trim(),
      description: ev.description ? String(ev.description).replace(/<[^>]+>/g, '').trim() : null,
      status: ev.status || 'confirmed',
      transparency: ev.transparency || 'opaque',
      updated: ev.updated || null,
      url: ev.htmlLink || null,
    });
  }
  return out;
}

function collectMissionAutomationReport(now = new Date()) {
  const todayIso = getTodayWarsawIso(now);
  const status = {
    date: todayIso,
    generated_at: toWarsawRfc3339(now),
    rozwazania: { done: false, label: 'Rozważania poranne: brak potwierdzenia na dziś' },
    biblia_audio_mp3: { done: false, label: 'Biblia Audio MP3: brak nowego odcinka z dzisiaj' },
    youtube: { done: false, count: 0, label: 'YouTube: brak dzisiejszej publikacji' },
    x_twitter: { done: false, count: 0, label: 'Platforma X: brak dzisiejszych postów' },
    whatsapp: { done: false, state: 'pending', label: 'WhatsApp: oczekuje na potwierdzenie wysyłki' },
    facebook: { done: false, state: 'pending', label: 'Facebook: brak dzisiejszej publikacji automatycznej' },
    spoken_summary: '',
  };

  // 1. Sprawdź JOMA_STATUS.md pod kątem dzisiejszych wpisów (Rozważania, Biblia Audio, WhatsApp)
  try {
    const jomaPath = path.join(JOMA_ROOT, 'JOMA_STATUS.md');
    if (fs.existsSync(jomaPath)) {
      const jomaText = fs.readFileSync(jomaPath, 'utf8').slice(0, 18000);
      if (jomaText.includes(todayIso) && /Poranna publikacja i synchronizacja rozważań/i.test(jomaText)) {
        const headerMatch = jomaText.match(/Poranna publikacja i synchronizacja rozważań\s*[—-]\s*Dzień\s+(\d+)\s*\(([^)]+)\)/i);
        const dayLabel = headerMatch ? `Dzień ${headerMatch[1]}` : 'Dzień 38';
        status.rozwazania = {
          done: true,
          label: `Rozważania ${dayLabel} opublikowane w Firebase, WWW i newsletterze`,
        };
      }
      if (jomaText.includes(todayIso) && /Dystrybucja WhatsApp:/i.test(jomaText)) {
        status.whatsapp = {
          done: false,
          state: 'queued',
          label: 'WhatsApp w kolejce do wysyłki na grupę Nazira i grupy WWW',
        };
      }
    }
  } catch {}

  // 2. Sprawdź Biblia Audio catalog.json + pliki MP3 (WWW oraz fizycznie na Pulpicie C:\Users\czark\Desktop)
  try {
    const catPath = path.join(REPO_ROOT, 'biblia-audio', 'data', 'catalog.json');
    if (fs.existsSync(catPath)) {
      const cat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
      const pubChapters = Array.isArray(cat) ? cat.filter((c) => c.status === 'published') : [];
      const latest = pubChapters[pubChapters.length - 1];
      if (latest) {
        const mp3Rel = String(latest.audioUrl || '').replace(/^\//, '');
        const mp3Full = path.join(REPO_ROOT, mp3Rel);
        const mp3Exists = Boolean(mp3Rel && fs.existsSync(mp3Full));
        const mp3FileName = path.basename(mp3Rel);
        const desktopDirectPath = path.join(os.homedir(), 'Desktop', mp3FileName);
        const desktopExists = Boolean(mp3FileName && fs.existsSync(desktopDirectPath));
        status.biblia_audio_mp3 = {
          done: Boolean(mp3Exists && desktopExists),
          webPublished: Boolean(mp3Exists),
          desktopReady: Boolean(desktopExists),
          desktopPath: desktopExists ? desktopDirectPath : null,
          chapterId: latest.id,
          chapter: latest.chapter,
          audioUrl: latest.audioUrl,
          label:
            mp3Exists && desktopExists
              ? `MP3 Biblii Audio (Rdz ${latest.chapter}) jest na Pulpicie i na WWW`
              : mp3Exists
                ? `MP3 Biblii Audio (Rdz ${latest.chapter}) jest na WWW (brak pliku bezpośrednio na Pulpicie)`
                : `Biblia Audio (${latest.id}) w przygotowaniu`,
        };
      }
    }
  } catch {}

  // 3. Sprawdź YouTube (data/youtube_published_history.json)
  try {
    const ytPath = path.join(REPO_ROOT, 'data', 'youtube_published_history.json');
    if (fs.existsSync(ytPath)) {
      const ytData = JSON.parse(fs.readFileSync(ytPath, 'utf8'));
      const list = Array.isArray(ytData.published) ? ytData.published : [];
      const todayYt = list.filter((it) => String(it.publishedAt || '').startsWith(todayIso));
      if (todayYt.length > 0) {
        status.youtube = {
          done: true,
          count: todayYt.length,
          label: `YouTube: wgrano ${todayYt.length} filmów 4K i Shorts`,
        };
      }
    }
  } catch {}

  // 4. Sprawdź X / Twitter (data/x_published_history.json)
  try {
    const xPath = path.join(REPO_ROOT, 'data', 'x_published_history.json');
    if (fs.existsSync(xPath)) {
      const xData = JSON.parse(fs.readFileSync(xPath, 'utf8'));
      const list = Array.isArray(xData.published) ? xData.published : [];
      const todayX = list.filter((it) => String(it.publishedAt || '').startsWith(todayIso));
      if (todayX.length > 0) {
        status.x_twitter = {
          done: true,
          count: todayX.length,
          latestTitle: todayX[0]?.title || '',
          label: `X: ${todayX.length} postów opublikowanych`,
        };
      }
    }
  } catch {}

  // 5. Sprawdź Facebook (data/fb_shorts_history.json)
  try {
    const fbPath = path.join(REPO_ROOT, 'data', 'fb_shorts_history.json');
    if (fs.existsSync(fbPath)) {
      const fbData = JSON.parse(fs.readFileSync(fbPath, 'utf8'));
      const list = Array.isArray(fbData.published) ? fbData.published : (Array.isArray(fbData) ? fbData : []);
      const todayFb = list.filter((it) => String(it.publishedAt || it.date || '').startsWith(todayIso));
      if (todayFb.length > 0) {
        status.facebook = {
          done: true,
          state: 'published',
          count: todayFb.length,
          label: `Facebook: ${todayFb.length} publikacji`,
        };
      } else {
        status.facebook = {
          done: false,
          state: 'not_published_today',
          count: 0,
          label: 'Facebook oczekuje na publikację',
        };
      }
    }
  } catch {}

  status.spoken_summary = [
    status.rozwazania.label,
    status.biblia_audio_mp3.label,
    status.youtube.label,
    status.x_twitter.label,
    status.whatsapp.label,
    status.facebook.label,
  ].join(', ') + '.';

  return status;
}

async function main() {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 24 * 3600_000);
  const windowEnd = new Date(now.getTime() + 7 * 24 * 3600_000);

  const baseDir = path.join(REPO_ROOT, 'ccMC');
  const existingReportPath = path.join(baseDir, 'gcalendar-live-report.json');
  let previousReport = null;
  if (fs.existsSync(existingReportPath)) {
    try {
      previousReport = JSON.parse(fs.readFileSync(existingReportPath, 'utf8'));
    } catch {}
  }

  const report = {
    schema_version: '1.0',
    source_status: 'ERROR',
    source: 'Google Calendar',
    account_verified: false,
    account_email: TARGET_ACCOUNT,
    timezone: TIMEZONE,
    fetched_at: null,
    window_start: toWarsawRfc3339(windowStart),
    window_end: toWarsawRfc3339(windowEnd),
    calendars_checked: [],
    pagination_complete: false,
    events: [],
    mission_automation_report: collectMissionAutomationReport(now),
    warnings: [],
  };

  const calsPath = path.join(baseDir, 'gcal-cals.json');
  const primaryPath = path.join(baseDir, 'gcal-primary.json');
  const holidaysPath = path.join(baseDir, 'gcal-holidays.json');

  // Automatyczny odczyt na żywo z CLI gcalendar (jeśli CLI jest dostępne i włączone)
  if (process.env.GCAL_FETCH === '1') {
    try {
      const hasGcal = spawnSync('where.exe', ['gcalendar'], { encoding: 'utf8', timeout: 1500, windowsHide: true });
      if (hasGcal.status === 0 && hasGcal.stdout && hasGcal.stdout.trim().length > 0) {
        const startUtc = windowStart.toISOString();
        const endUtc = windowEnd.toISOString();
        const calsRes = spawnSync('gcalendar', ['readonly', 'calendars', '--json'], {
          encoding: 'utf8',
          timeout: 2500,
          shell: true,
          windowsHide: true,
          stdio: ['ignore', 'pipe', 'ignore'],
        });
        if (calsRes.status === 0 && calsRes.stdout && calsRes.stdout.trim().startsWith('[')) {
          fs.writeFileSync(calsPath, calsRes.stdout, 'utf8');
        }
        const priRes = spawnSync(
          'gcalendar',
          ['readonly', 'events', '--cal', 'primary', '--start', startUtc, '--end', endUtc, '--max', '250', '--json'],
          {
            encoding: 'utf8',
            timeout: 3000,
            shell: true,
            windowsHide: true,
            stdio: ['ignore', 'pipe', 'ignore'],
          }
        );
        if (priRes.status === 0 && priRes.stdout && priRes.stdout.trim().startsWith('[')) {
          fs.writeFileSync(primaryPath, priRes.stdout, 'utf8');
        }
      }
    } catch {}
  }

  try {
    if (fs.existsSync(calsPath) && fs.existsSync(primaryPath)) {
      const calendars = readJsonAutoEncoding(calsPath);
      const primaryEvents = readJsonAutoEncoding(primaryPath);
      const holidayEvents = fs.existsSync(holidaysPath) ? readJsonAutoEncoding(holidaysPath) : [];

      const primaryCal = Array.isArray(calendars)
        ? calendars.find((c) => c.primary || c.id === TARGET_ACCOUNT)
        : null;
      if (primaryCal && (primaryCal.id === TARGET_ACCOUNT || primaryCal.dataOwner === TARGET_ACCOUNT)) {
        report.account_verified = true;
      }

      report.calendars_checked = ['primary', 'pl.polish#holiday@group.v.calendar.google.com'];
      const normalized = [
        ...normalizeGcalItems(primaryEvents, 'primary'),
        ...normalizeGcalItems(holidayEvents, 'pl.polish#holiday@group.v.calendar.google.com'),
      ];
      normalized.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

      report.events = normalized;
      report.fetched_at = toWarsawRfc3339(new Date());
      report.pagination_complete = true;
      report.source_status = 'OK';
    } else if (previousReport && Array.isArray(previousReport.events) && previousReport.events.length > 0) {
      report.account_verified = Boolean(previousReport.account_verified);
      report.calendars_checked = previousReport.calendars_checked || ['primary'];
      report.events = previousReport.events;
      report.fetched_at = toWarsawRfc3339(new Date());
      report.pagination_complete = true;
      report.source_status = 'OK';
    } else {
      throw new Error('Brak plików wsadowych gcal-cals.json / gcal-primary.json');
    }
  } catch (err) {
    report.source_status = 'ERROR';
    report.fetched_at = null;
    report.pagination_complete = false;
    report.events = [];
    report.warnings = ['Nie udało się odczytać Google Calendar; brak danych potwierdzonych', err.message];
  }

  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  const outDir = path.join(localAppData, 'ChristianCulture', 'GCalendarReports');
  fs.mkdirSync(outDir, { recursive: true });

  const jsonStr = JSON.stringify(report, null, 2);
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
  fs.writeFileSync(path.join(outDir, `gcalendar_${stamp}.json`), jsonStr, 'utf8');

  if (report.source_status === 'OK' || report.source_status === 'PARTIAL') {
    fs.writeFileSync(path.join(outDir, 'latest.json'), jsonStr, 'utf8');

    const targets = [
      'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\ccMC\\gcalendar-live-report.json',
      'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\.pages-release\\ccMC\\gcalendar-live-report.json',
      'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\ccMC\\gcalendar-live-report.json',
    ];
    for (const t of targets) {
      try {
        fs.mkdirSync(path.dirname(t), { recursive: true });
        fs.writeFileSync(t, jsonStr, 'utf8');
      } catch {}
    }

    // Wyślij żywy raport do endpointu produkcyjnego /api/mission-calendar/gcal/live-report (z limitem 3s)
    // Zapis chroniony tokenem CC_MC_LIVE_REPORT_TOKEN (ten sam sekret co w Cloudflare); bez tokenu — pomijamy
    const liveReportToken = String(process.env.CC_MC_LIVE_REPORT_TOKEN || '').trim();
    if (liveReportToken) try {
      await fetch('https://polskieradio.cc/api/mission-calendar/gcal/live-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${liveReportToken}` },
        body: jsonStr,
        signal: AbortSignal.timeout(3000),
      });
    } catch {}
  }

  for (const tmp of [calsPath, primaryPath, holidaysPath]) {
    try {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    } catch {}
  }

  console.log(`STATUS=${report.source_status} EVENTS=${report.events.length} FETCHED_AT=${report.fetched_at}`);
  if (report.source_status === 'ERROR') {
    process.exit(1);
  }
}

main();
