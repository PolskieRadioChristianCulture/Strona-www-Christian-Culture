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
import { expandIcsEvents, fetchIcs, fetchOrBuildOpenBotRoutinesIcs, POLISH_HOLIDAYS_ICS_URL } from './gcal-ics.mjs';
import { collectQuarterMissionActivity, readPresenterBrief, writeLastEmittedVoiceReport } from './ccmc-voice-exchange.mjs';

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
    mission_automation_report: collectQuarterMissionActivity({
      repoRoot: REPO_ROOT,
      jomaStatusPath: path.join(JOMA_ROOT, 'JOMA_STATUS.md'),
      skrzynkaDir: path.join(JOMA_ROOT, 'SKRZYNKA'),
      now,
      windowStartMs: Date.parse(previousReport?.mission_automation_report?.window_end || ''),
    }),
    warnings: [],
  };

  const calsPath = path.join(baseDir, 'gcal-cals.json');
  const primaryPath = path.join(baseDir, 'gcal-primary.json');
  const missionPath = path.join(baseDir, 'gcal-mission.json');
  const holidaysPath = path.join(baseDir, 'gcal-holidays.json');

  // Odczyt NA ŻYWO z prywatnych adresów iCal (@007 / @A001, 09.11.2026) — zero kosztów, tylko odczyt.
  // 1) Kalendarz misyjny CC: %USERPROFILE%\.cc-secrets\gcal_mission_ical_url.txt
  // 2) Kalendarz domowy: %USERPROFILE%\.cc-secrets\gcal_ical_url.txt
  let calendarLiveSource = null;
  const MISSION_CAL_ID = 'f7f5e88a298efc9cfe82b630455221f0b5d53968d7a391b46494f230a6c1ea7b@group.calendar.google.com';

  let missionIcalUrl = String(process.env.CC_GCAL_MISSION_ICAL_URL || '').trim();
  if (!missionIcalUrl) {
    try {
      missionIcalUrl = fs.readFileSync(path.join(os.homedir(), '.cc-secrets', 'gcal_mission_ical_url.txt'), 'utf8').trim();
    } catch {}
  }
  if (/^https:\/\/calendar\.google\.com\/calendar\/ical\//.test(missionIcalUrl)) {
    try {
      const missionIcs = await fetchIcs(missionIcalUrl);
      const missionItems = expandIcsEvents(missionIcs, windowStart.getTime(), windowEnd.getTime());
      fs.writeFileSync(missionPath, JSON.stringify(missionItems), 'utf8');
      calendarLiveSource = 'ical';
    } catch (err) {
      report.warnings.push(`Kalendarz misyjny niedostępny: ${err.message}`);
    }
  }

  let icalUrl = String(process.env.CC_GCAL_ICAL_URL || '').trim();
  if (!icalUrl) {
    try {
      icalUrl = fs.readFileSync(path.join(os.homedir(), '.cc-secrets', 'gcal_ical_url.txt'), 'utf8').trim();
    } catch {}
  }
  if (/^https:\/\/calendar\.google\.com\/calendar\/ical\//.test(icalUrl)) {
    try {
      const icsText = await fetchIcs(icalUrl);
      const items = expandIcsEvents(icsText, windowStart.getTime(), windowEnd.getTime());
      fs.writeFileSync(primaryPath, JSON.stringify(items), 'utf8');
      fs.writeFileSync(calsPath, JSON.stringify([
        { id: MISSION_CAL_ID, name: 'Kalendarz Christian Culture', isMission: true },
        { id: TARGET_ACCOUNT, primary: true, dataOwner: TARGET_ACCOUNT },
        { id: 'pl.polish#holiday@group.v.calendar.google.com', name: 'Święta w Polsce' }
      ]), 'utf8');
      try {
        const holText = await fetchIcs(POLISH_HOLIDAYS_ICS_URL);
        fs.writeFileSync(holidaysPath, JSON.stringify(expandIcsEvents(holText, windowStart.getTime(), windowEnd.getTime())), 'utf8');
      } catch {}
      calendarLiveSource = 'ical';
    } catch (err) {
      report.warnings.push(`Prywatny adres iCal niedostępny: ${err.message}`);
    }
  }

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

      const missionEvents = fs.existsSync(missionPath) ? readJsonAutoEncoding(missionPath) : [];
      report.calendars_checked = ['primary', MISSION_CAL_ID, 'pl.polish#holiday@group.v.calendar.google.com'];
      const normalized = [
        ...normalizeGcalItems(missionEvents, MISSION_CAL_ID),
        ...normalizeGcalItems(primaryEvents, 'primary'),
        ...normalizeGcalItems(holidayEvents, 'pl.polish#holiday@group.v.calendar.google.com'),
      ];
      normalized.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

      report.events = normalized;
      report.fetched_at = toWarsawRfc3339(new Date());
      report.pagination_complete = true;
      report.source_status = 'OK';
      report.calendar_live = true;
      report.calendar_source = calendarLiveSource || 'gcalendar-cli';
      report.calendar_fetched_at = report.fetched_at;
    } else if (previousReport && Array.isArray(previousReport.events) && previousReport.events.length > 0) {
      report.account_verified = Boolean(previousReport.account_verified);
      report.calendars_checked = previousReport.calendars_checked || ['primary'];
      report.events = previousReport.events;
      report.fetched_at = toWarsawRfc3339(new Date());
      report.pagination_complete = true;
      // Kalendarz NIE odczytany na żywo — zostawiamy poprzednie wpisy, ale uczciwie oznaczamy ich wiek
      report.source_status = 'PARTIAL';
      report.calendar_live = false;
      report.calendar_source = 'cache';
      // Wiek danych znamy tylko z raportu zapisanego nowym formatem (stare pliki stemplowały czas bez odczytu)
      report.calendar_fetched_at = typeof previousReport.calendar_live === 'boolean' ? (previousReport.calendar_fetched_at || null) : null;
      report.warnings.push('Kalendarz Google nie odświeżony na żywo — wpisy z pamięci podręcznej');
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

  // Kalendarz Misji Christian Culture (wspólny dla Dowódcy i agentów) — @007, 09.11.2026.
  // Prywatny adres iCal poza repo: %USERPROFILE%\.cc-secrets\gcal_mission_ical_url.txt (albo CC_GCAL_MISSION_ICAL_URL).
  let missionUrl = String(process.env.CC_GCAL_MISSION_ICAL_URL || '').trim();
  if (!missionUrl) {
    try {
      missionUrl = fs.readFileSync(path.join(os.homedir(), '.cc-secrets', 'gcal_mission_ical_url.txt'), 'utf8').trim();
    } catch {}
  }
  if (/^https:\/\/calendar\.google\.com\/calendar\/ical\//.test(missionUrl)) {
    // Bez dubli: wpisy misji z wcześniejszego bloku (MISSION_CAL_ID) zastępujemy oznaczonymi calendar_kind=mission
    const nonMission = (report.events || []).filter((e) => e.calendar_kind !== 'mission' && e.calendar_id !== MISSION_CAL_ID);
    try {
      const missionIcs = await fetchIcs(missionUrl);
      const missionItems = expandIcsEvents(missionIcs, windowStart.getTime(), windowEnd.getTime());
      const missionEvents = normalizeGcalItems(missionItems, 'cc-mission').map((e) => ({ ...e, calendar_kind: 'mission' }));
      report.events = [...nonMission, ...missionEvents].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
      report.mission_calendar_live = true;
      report.mission_calendar_fetched_at = toWarsawRfc3339(new Date());
      if (!report.calendars_checked.includes('cc-mission')) report.calendars_checked.push('cc-mission');
    } catch (err) {
      const prevMission = (previousReport?.events || []).filter((e) => e.calendar_kind === 'mission');
      report.events = [...nonMission, ...prevMission].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
      report.mission_calendar_live = false;
      report.mission_calendar_fetched_at = previousReport?.mission_calendar_fetched_at || null;
      report.warnings.push(`Kalendarz Misji niedostępny: ${err.message}`);
    }
  }

  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  const outDir = path.join(localAppData, 'ChristianCulture', 'GCalendarReports');
  fs.mkdirSync(outDir, { recursive: true });

  // Integracja rutyn OpenBot (.ics / openbot_routines_ical_url.txt) z Kalendarzem Misji @ccMC (13.11.2026)
  let openbotIcalUrl = String(process.env.CC_OPENBOT_ROUTINES_ICAL_URL || '').trim();
  if (!openbotIcalUrl) {
    try {
      openbotIcalUrl = fs.readFileSync(path.join(os.homedir(), '.cc-secrets', 'openbot_routines_ical_url.txt'), 'utf8').trim();
    } catch {}
  }
  try {
    const { icsText: openbotIcs, source: openbotSource } = await fetchOrBuildOpenBotRoutinesIcs({ icalUrl: openbotIcalUrl });
    fs.writeFileSync(path.join(outDir, 'openbot-routines.ics'), openbotIcs, 'utf8');
    const openbotItems = expandIcsEvents(openbotIcs, windowStart.getTime(), windowEnd.getTime());
    const openbotEvents = normalizeGcalItems(openbotItems, 'openbot-routines').map((e) => ({
      ...e,
      calendar_kind: 'mission',
    }));
    const existingKeys = new Set(
      (report.events || [])
        .filter((e) => e.calendar_kind === 'mission')
        .map((e) => `${String(e.start || '').slice(0, 16)}|${String(e.title || '').toLowerCase().slice(0, 24)}`)
    );
    const uniqueOpenbotEvents = openbotEvents.filter((e) => {
      const k = `${String(e.start || '').slice(0, 16)}|${String(e.title || '').toLowerCase().slice(0, 24)}`;
      if (existingKeys.has(k)) return false;
      existingKeys.add(k);
      return true;
    });
    report.events = [...(report.events || []), ...uniqueOpenbotEvents].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
    report.openbot_routines_source = openbotSource;
    if (!report.calendars_checked.includes('openbot-routines')) report.calendars_checked.push('openbot-routines');
  } catch (err) {
    report.warnings.push(`Rutyny OpenBot niedostępne: ${err.message}`);
  }

  // Agent → prezenterka (V1.2): komunikat agenta automatyzacji z pliku lokalnego, ważny do valid_until (max 6 h)
  const presenterBrief = readPresenterBrief(outDir, now);
  if (presenterBrief) report.presenter_brief = presenterBrief;

  const jsonStr = JSON.stringify(report, null, 2);
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
  fs.writeFileSync(path.join(outDir, `gcalendar_${stamp}.json`), jsonStr, 'utf8');

  // Źródło tokenu: zmienna środowiskowa albo prywatny plik poza repo (%USERPROFILE%\.cc-secrets\cc_mc_live_report_token)
  let liveReportToken = String(process.env.CC_MC_LIVE_REPORT_TOKEN || '').trim();
  if (!liveReportToken) {
    try {
      liveReportToken = fs.readFileSync(path.join(os.homedir(), '.cc-secrets', 'cc_mc_live_report_token'), 'utf8').trim();
    } catch {}
  }

  // Prezenterka → agent (V1.2): ostatnie wyemitowane raporty z serwera → plik LOKALNY ostatni-raport-glosowy.json
  if (liveReportToken) {
    try {
      const res = await fetch('https://polskieradio.cc/api/mission-calendar/voice/emitted?limit=8', {
        headers: { Authorization: `Bearer ${liveReportToken}` },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        writeLastEmittedVoiceReport(outDir, Array.isArray(data.reports) ? data.reports : [], now);
      }
    } catch {}
  }

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
    if (liveReportToken) try {
      await fetch('https://polskieradio.cc/api/mission-calendar/gcal/live-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${liveReportToken}` },
        body: jsonStr,
        signal: AbortSignal.timeout(3000),
      });
    } catch {}
  }

  for (const tmp of [calsPath, primaryPath, holidaysPath, missionPath]) {
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
