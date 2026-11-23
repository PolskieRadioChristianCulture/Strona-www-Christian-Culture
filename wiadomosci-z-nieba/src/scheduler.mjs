import fs from 'node:fs';
import path from 'node:path';
import { getWarsawDateParts } from './verse-source.mjs';
import { loadWznConfig } from './db.mjs';

const WARSAW_TZ = 'Europe/Warsaw';

function getOffsetMinutesForDate(d) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: WARSAW_TZ,
    timeZoneName: 'shortOffset',
  });
  const tzName = fmt.formatToParts(d).find(p => p.type === 'timeZoneName')?.value || 'GMT+1';
  const match = /GMT([+-]\d{1,2})(?::(\d{2}))?/.exec(tzName);
  if (!match) return 60;
  const sign = match[1].startsWith('-') ? -1 : 1;
  const h = Math.abs(parseInt(match[1], 10));
  const m = parseInt(match[2] || '0', 10);
  return sign * (h * 60 + m);
}

export function warsawLocalToUtcDate(year, month, day, hour = 7, minute = 0, second = 0) {
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const off1 = getOffsetMinutesForDate(new Date(naiveUtc));
  let utcMs = naiveUtc - off1 * 60000;
  const off2 = getOffsetMinutesForDate(new Date(utcMs));
  if (off2 !== off1) {
    utcMs = naiveUtc - off2 * 60000;
  }
  return new Date(utcMs);
}

export function parsePublishTime(hhmm = '07:00') {
  const raw = String(hhmm || '').trim();
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(raw);
  if (!match) {
    throw new Error(`Nieprawidłowa godzina publikacji HH:MM: ${raw}`);
  }
  return {
    hour: parseInt(match[1], 10),
    minute: parseInt(match[2], 10),
    formatted: `${String(match[1]).padStart(2, '0')}:${String(match[2]).padStart(2, '0')}`,
  };
}

export function getScheduledRunForDate(dateStr, publishTime = '07:00') {
  const [y, m, d] = dateStr.split('-').map(Number);
  const { hour, minute, formatted } = parsePublishTime(publishTime);
  const utcDate = warsawLocalToUtcDate(y, m, d, hour, minute, 0);
  const offsetMin = getOffsetMinutesForDate(utcDate);
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  const oh = String(Math.floor(abs / 60)).padStart(2, '0');
  const om = String(abs % 60).padStart(2, '0');
  return {
    dateStr,
    publishTime: formatted,
    utcDate,
    utcIso: utcDate.toISOString(),
    warsawIso: `${dateStr}T${formatted}:00${sign}${oh}:${om}`,
    offsetMinutes: offsetMin,
  };
}

export function isScheduledWindowDue(now = new Date(), publishTime = '07:00') {
  const parts = getWarsawDateParts(now);
  const target = getScheduledRunForDate(parts.dateStr, publishTime);
  return {
    due: new Date(now).getTime() >= target.utcDate.getTime(),
    nowWarsawDate: parts.dateStr,
    scheduledWarsawIso: target.warsawIso,
    scheduledUtcIso: target.utcIso,
  };
}

export function getNextScheduledRun(now = new Date(), publishTime = '07:00') {
  const parts = getWarsawDateParts(now);
  const todayTarget = getScheduledRunForDate(parts.dateStr, publishTime);
  if (new Date(now).getTime() <= todayTarget.utcDate.getTime()) {
    return todayTarget;
  }
  const tomorrowProbe = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1, 12, 0, 0));
  const tomorrowStr = getWarsawDateParts(tomorrowProbe).dateStr;
  return getScheduledRunForDate(tomorrowStr, publishTime);
}

export function buildOpenBotScheduleProposal(config = null, repoRoot = null) {
  const cfg = config || loadWznConfig(repoRoot || undefined);
  const { hour, minute, formatted } = parsePublishTime(
    process.env.WZN_PUBLISH_TIME || cfg.schedule?.publishTime || '07:00'
  );
  return {
    id: 'icc-wiadomosci-z-nieba-daily',
    name: 'Jezus Chrystus — Wiadomości z nieba (@wiadomosci_z_nieba)',
    enabled: false,
    requiresOwnerApprovalL0: true,
    mode: cfg.mode || 'TEST_SIMULATION',
    zeroCost: true,
    provider: 'opencode',
    model: 'opencode/deepseek-v4.1-flash-free',
    timezone: cfg.schedule?.timezone || WARSAW_TZ,
    publishTime: formatted,
    cronExpression: `${minute} ${hour} * * *`,
    command: 'node wiadomosci-z-nieba/src/pipeline.mjs run-daily',
    note: 'Wyłączone w środowisku TEST. Aktywacja automatycznej publikacji o 07:00 Europe/Warsaw wymaga jawnej akceptacji L0 po zakończeniu testów.',
  };
}

export function writeOpenBotScheduleProposal(proposalPath, config = null) {
  const proposal = buildOpenBotScheduleProposal(config);
  fs.mkdirSync(path.dirname(proposalPath), { recursive: true });
  fs.writeFileSync(proposalPath, JSON.stringify(proposal, null, 2), 'utf8');
  return proposal;
}
