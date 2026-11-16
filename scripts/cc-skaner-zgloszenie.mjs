#!/usr/bin/env node
/**
 * CC Skaner Wizualny → jedno zbiorcze zgłoszenie GitHub (Issue) z aktualną listą usterek.
 * - Nowe usterki (nowy odcisk) → komentarz w zgłoszeniu (powiadomienie).
 * - Brak usterek → komentarz „czysto” i zamknięcie zgłoszenia.
 * - Te same usterki co ostatnio → tylko cicha aktualizacja treści (bez powiadomień).
 * Wymaga: GITHUB_TOKEN, REPO (owner/name), RUN_URL (opcjonalnie). Tylko issues, bez dostępu do kodu.
 */
import fs from 'node:fs';
import path from 'node:path';

const TITLE = 'CC Skaner Wizualny — usterki na stronach';
const LABEL = 'cc-skaner';
const dir = process.env.CC_SKANER_OUT || path.join('reports', 'cc-skaner');
const { meta, usterki } = JSON.parse(fs.readFileSync(path.join(dir, 'raport.json'), 'utf8'));
const md = fs.readFileSync(path.join(dir, 'raport.md'), 'utf8');
const token = process.env.GITHUB_TOKEN;
const repo = process.env.REPO;
const runUrl = process.env.RUN_URL || '';
if (!token || !repo) { console.log('Brak GITHUB_TOKEN/REPO — pomijam zgłoszenie.'); process.exit(0); }

async function gh(method, url, body) {
  const r = await fetch(`https://api.github.com/repos/${repo}${url}`, {
    method, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cc-skaner' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok && r.status !== 422) throw new Error(`${method} ${url} → ${r.status} ${await r.text()}`);
  return r.status === 204 ? null : r.json();
}

const ids = [...new Set(usterki.map(u => u.id))];
const marker = (list) => `<!-- cc-skaner-ids:${list.join(',')} -->`;
const body = `${md}\n\n${runUrl ? `Zrzuty ekranu i pełny raport: ${runUrl} (artefakt „cc-skaner”).\n\n` : ''}_Zgłoszenie prowadzone automatycznie przez CC Skaner Wizualny (@A008). Naprawy: gałąź robocza → podgląd → przegląd @007 → zgoda L0._\n${marker(ids)}`;

await gh('POST', '/labels', { name: LABEL, color: 'd93f0b', description: 'Usterki wykryte przez CC Skaner Wizualny' }).catch(() => {});
const open = (await gh('GET', `/issues?state=open&labels=${LABEL}&per_page=10`)).filter(i => !i.pull_request);
const issue = open[0];
const prevIds = issue ? ((issue.body || '').match(/cc-skaner-ids:([^ ]*) -->/)?.[1] || '').split(',').filter(Boolean) : [];
const fresh = ids.filter(id => !prevIds.includes(id));
const gone = prevIds.filter(id => !ids.includes(id));

if (!ids.length) {
  if (issue) {
    await gh('POST', `/issues/${issue.number}/comments`, { body: `✅ Skan ${meta.czas}: brak usterek. Zamykam.${runUrl ? ' ' + runUrl : ''}` });
    await gh('PATCH', `/issues/${issue.number}`, { state: 'closed', body });
  }
  console.log('Czysto.');
} else if (!issue) {
  const created = await gh('POST', '/issues', { title: TITLE, body, labels: [LABEL] });
  console.log(`Nowe zgłoszenie #${created.number} (${ids.length} usterek).`);
} else {
  await gh('PATCH', `/issues/${issue.number}`, { body });
  if (fresh.length || gone.length) {
    const nowe = usterki.filter(u => fresh.includes(u.id)).map(u => `- \`${u.id}\` **${u.path}** · ${u.widok} — ${u.opis}`).join('\n');
    await gh('POST', `/issues/${issue.number}/comments`, { body: `Skan ${meta.czas}: nowe ${fresh.length}, naprawione ${gone.length}, razem ${ids.length}.\n\n${nowe}${runUrl ? '\n\n' + runUrl : ''}` });
  }
  console.log(`Zgłoszenie #${issue.number}: nowe ${fresh.length}, naprawione ${gone.length}, razem ${ids.length}.`);
}
