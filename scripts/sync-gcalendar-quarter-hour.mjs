#!/usr/bin/env node
/**
 * Christian Culture Mission Calendar (@ccMC) — Quarter-Hour Real Google Calendar Sync
 * Realizuje kontrakt ze skilla: gcalendar-quarter-hour-reports (SKILL.md)
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const TIMEZONE = 'Europe/Warsaw';
const TARGET_ACCOUNT = 'nazirczarkes@gmail.com';

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
  return JSON.parse(text.trim());
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

function main() {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 24 * 3600_000);
  const windowEnd = new Date(now.getTime() + 7 * 24 * 3600_000);

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
    warnings: [],
  };

  const baseDir = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\ccMC';
  const calsPath = path.join(baseDir, 'gcal-cals.json');
  const primaryPath = path.join(baseDir, 'gcal-primary.json');
  const holidaysPath = path.join(baseDir, 'gcal-holidays.json');

  try {
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
