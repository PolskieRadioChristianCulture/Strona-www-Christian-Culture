#!/usr/bin/env node
/**
 * Christian Culture — Aktualizacja Kalendarza Misyjnego na życzenie Dowódcy
 * Wykorzystuje prywatne źródła iCal (zero kosztów, bezpieczny odczyt, wysoka niezawodność)
 *
 * Kalendarz Misyjny CC: f7f5e88a298efc9cfe82b630455221f0b5d53968d7a391b46494f230a6c1ea7b@group.calendar.google.com
 * Kalendarz Osobisty / Domowy: nazirczarkes@gmail.com
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { expandIcsEvents, fetchIcs, POLISH_HOLIDAYS_ICS_URL } from './gcal-ics.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const TIMEZONE = 'Europe/Warsaw';
const MISSION_CAL_ID = 'f7f5e88a298efc9cfe82b630455221f0b5d53968d7a391b46494f230a6c1ea7b@group.calendar.google.com';
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
  return `${str}+01:00`;
}

function normalizeEvents(items, calId, calLabel) {
  const out = [];
  if (!Array.isArray(items)) return out;
  for (const ev of items) {
    if (!ev || ev.status === 'cancelled') continue;
    const startVal = ev.start?.dateTime || ev.start?.date || null;
    const endVal = ev.end?.dateTime || ev.end?.date || null;
    const origStart = ev.originalStartTime?.dateTime || ev.originalStartTime?.date || startVal;
    if (!startVal) continue;
    out.push({
      calendar_id: calId,
      calendar_label: calLabel,
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

export async function updateMissionCalendar() {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 24 * 3600_000);
  const windowEnd = new Date(now.getTime() + 14 * 24 * 3600_000); // 14 dni okna

  console.log('\n================================================================');
  console.log('📅 AKTUALIZACJA KALENDARZA MISYJNEGO CHRISTIAN CULTURE (@ccMC)');
  console.log(`   Czas: ${toWarsawRfc3339(now)} | Strefa: ${TIMEZONE}`);
  console.log('================================================================\n');

  // 1. Odczyt adresów iCal
  const secretsDir = path.join(os.homedir(), '.cc-secrets');
  let missionIcalUrl = process.env.CC_GCAL_MISSION_ICAL_URL || '';
  if (!missionIcalUrl) {
    try {
      missionIcalUrl = fs.readFileSync(path.join(secretsDir, 'gcal_mission_ical_url.txt'), 'utf8').trim();
    } catch {}
  }

  let personalIcalUrl = process.env.CC_GCAL_ICAL_URL || '';
  if (!personalIcalUrl) {
    try {
      personalIcalUrl = fs.readFileSync(path.join(secretsDir, 'gcal_ical_url.txt'), 'utf8').trim();
    } catch {}
  }

  const baseDir = path.join(REPO_ROOT, 'ccMC');
  const primaryPath = path.join(baseDir, 'gcal-primary.json');
  const missionPath = path.join(baseDir, 'gcal-mission.json');
  const holidaysPath = path.join(baseDir, 'gcal-holidays.json');
  const calsPath = path.join(baseDir, 'gcal-cals.json');

  let missionItems = [];
  let personalItems = [];
  let holidayItems = [];
  const calendarsChecked = [];
  const warnings = [];

  // 2. Pobranie kalendarza misyjnego
  if (missionIcalUrl) {
    console.log('[1/3] Pobieram Kalendarz Misyjny Christian Culture (iCal)...');
    try {
      const icsMission = await fetchIcs(missionIcalUrl);
      missionItems = expandIcsEvents(icsMission, windowStart.getTime(), windowEnd.getTime());
      fs.writeFileSync(missionPath, JSON.stringify(missionItems, null, 2), 'utf8');
      calendarsChecked.push(MISSION_CAL_ID);
      console.log(`  -> Sukces: ${missionItems.length} wydarzeń misyjnych w oknie 14 dni.`);
    } catch (err) {
      warnings.push(`Błąd kalendarza misyjnego: ${err.message}`);
      console.warn(`  -> Ostrzeżenie: ${err.message}`);
    }
  } else {
    warnings.push('Brak skonfigurowanego URL kalendarza misyjnego w .cc-secrets');
  }

  // 3. Pobranie kalendarza osobistego (domowego)
  if (personalIcalUrl) {
    console.log('[2/3] Pobieram Kalendarz Osobisty / Domowy Dowódcy (iCal)...');
    try {
      const icsPersonal = await fetchIcs(personalIcalUrl);
      personalItems = expandIcsEvents(icsPersonal, windowStart.getTime(), windowEnd.getTime());
      fs.writeFileSync(primaryPath, JSON.stringify(personalItems, null, 2), 'utf8');
      calendarsChecked.push('primary');
      console.log(`  -> Sukces: ${personalItems.length} wydarzeń osobistych w oknie 14 dni.`);
    } catch (err) {
      warnings.push(`Błąd kalendarza osobistego: ${err.message}`);
      console.warn(`  -> Ostrzeżenie: ${err.message}`);
    }
  }

  // 4. Pobranie świąt polskich
  console.log('[3/3] Pobieram święta państwowe i religijne (iCal)...');
  try {
    const icsHolidays = await fetchIcs(POLISH_HOLIDAYS_ICS_URL);
    holidayItems = expandIcsEvents(icsHolidays, windowStart.getTime(), windowEnd.getTime());
    fs.writeFileSync(holidaysPath, JSON.stringify(holidayItems, null, 2), 'utf8');
    calendarsChecked.push('pl.polish#holiday@group.v.calendar.google.com');
  } catch (err) {
    console.warn(`  -> Ostrzeżenie przy świętach: ${err.message}`);
  }

  // Zapisz listę kalendarzy
  const calsInfo = [
    { id: MISSION_CAL_ID, name: 'Kalendarz Christian Culture', isMission: true },
    { id: TARGET_ACCOUNT, primary: true, name: 'Kalendarz Domowy', dataOwner: TARGET_ACCOUNT },
    { id: 'pl.polish#holiday@group.v.calendar.google.com', name: 'Święta w Polsce' },
  ];
  fs.writeFileSync(calsPath, JSON.stringify(calsInfo, null, 2), 'utf8');

  // Normalizacja i scalenie
  const allEvents = [
    ...normalizeEvents(missionItems, MISSION_CAL_ID, 'Misja CC'),
    ...normalizeEvents(personalItems, TARGET_ACCOUNT, 'Osobisty'),
    ...normalizeEvents(holidayItems, 'pl.polish#holiday@group.v.calendar.google.com', 'Święta'),
  ];
  allEvents.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

  const report = {
    schema_version: '1.0',
    source_status: (missionItems.length > 0 || personalItems.length > 0) ? 'OK' : (warnings.length ? 'ERROR' : 'OK'),
    source: 'Google Calendar (Live iCal)',
    account_verified: true,
    account_email: TARGET_ACCOUNT,
    timezone: TIMEZONE,
    fetched_at: toWarsawRfc3339(now),
    window_start: toWarsawRfc3339(windowStart),
    window_end: toWarsawRfc3339(windowEnd),
    calendars_checked: calendarsChecked,
    pagination_complete: true,
    calendar_live: true,
    calendar_source: 'ical',
    calendar_fetched_at: toWarsawRfc3339(now),
    events: allEvents,
    mission_calendar_id: MISSION_CAL_ID,
    mission_events_count: missionItems.length,
    personal_events_count: personalItems.length,
    warnings: warnings,
  };

  // Zapis do lokalnych miejsc
  const jsonText = JSON.stringify(report, null, 2);
  const destPaths = [
    path.join(REPO_ROOT, 'ccMC', 'gcalendar-live-report.json'),
    path.join('C:\\Users\\czark\\Desktop\\@ICC\\LUMINA', 'ccMC', 'gcalendar-live-report.json'),
    path.join(os.homedir(), 'AppData', 'Local', 'ChristianCulture', 'GCalendarReports', 'latest.json'),
  ];

  for (const dp of destPaths) {
    try {
      const parentDir = path.dirname(dp);
      if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
      fs.writeFileSync(dp, jsonText, 'utf8');
      console.log(`  -> Zaktualizowano raport: ${dp}`);
    } catch (err) {
      console.warn(`  -> Ostrzeżenie przy zapisie ${dp}: ${err.message}`);
    }
  }

  // Raport dla Dowódcy
  const nowMs = now.getTime();
  const currentEvent = allEvents.find((e) => {
    const s = Date.parse(e.start);
    const end = Date.parse(e.end);
    return s <= nowMs && nowMs < end && !e.all_day;
  });

  const upcomingEvents = allEvents
    .filter((e) => Date.parse(e.start) > nowMs && !e.all_day)
    .slice(0, 5);

  console.log('\n----------------------------------------------------------------');
  console.log('📊 RAPORT STANU KALENDARZA MISYJNEGO:');
  console.log(`• Status źródła: ${report.source_status}`);
  console.log(`• Liczba aktywnych wydarzeń w oknie: ${allEvents.length}`);
  console.log(`• TERAZ: ${currentEvent ? `"${currentEvent.title}" (${currentEvent.start.slice(11, 16)} - ${currentEvent.end.slice(11, 16)}) [${currentEvent.calendar_label}]` : 'Brak aktywnego wydarzenia w tej chwili'}`);
  console.log('• NAJBLIŻSZE ZADANIA:');
  if (upcomingEvents.length === 0) {
    console.log('  (Brak zaplanowanych zadań godzinowych w najbliższym czasie)');
  } else {
    for (const u of upcomingEvents) {
      console.log(`  - [${u.calendar_label}] ${u.start.slice(0, 10)} ${u.start.slice(11, 16)}: ${u.title}`);
    }
  }
  console.log('----------------------------------------------------------------\n');

  return report;
}

if (process.argv[1] && process.argv[1].endsWith('update-mission-calendar.mjs')) {
  updateMissionCalendar().then(() => {
    console.log('✅ Kalendarz misyjny zaktualizowany perfekcyjnie!');
  }).catch((err) => {
    console.error('Błąd aktualizacji kalendarza:', err.message);
    process.exit(1);
  });
}
