#!/usr/bin/env node
/**
 * CC SKANER WIZUALNY (@A008 Guardian 360, zbudował @007 16.11.2026 na polecenie L0)
 *
 * Prawdziwa przeglądarka (Playwright/Chromium) przechodzi po stronach jak człowiek,
 * w widoku telefonu i komputera, TYLKO DO ODCZYTU (nie klika zgód, nie wysyła formularzy).
 *
 * Kontrole:
 *   kolizja      – klikalny element zasłonięty przez pływający (fixed/sticky) element innego bloku
 *   krzaczki     – zepsute kodowanie w widocznym tekście (np. „Ă—”, „Â·”, „Ä…”)
 *   blad-js      – błędy JavaScript na stronie
 *   brak-pliku   – plik z tej samej domeny zwraca 4xx/5xx albo nie dotarł
 *   poza-ekranem – strona szersza niż ekran (przewijanie w bok)
 *   do-gory      – długa strona, po przewinięciu brak widocznego przycisku „do góry”
 *   http         – strona nie odpowiada 2xx/3xx
 *
 * Użycie:
 *   node scripts/cc-skaner-wizualny.mjs                      # produkcja https://polskieradio.cc
 *   CC_SKANER_BASE=https://galaz.polskieradio.pages.dev node scripts/cc-skaner-wizualny.mjs
 *   CC_SKANER_PAGES="/,/lumina" node scripts/cc-skaner-wizualny.mjs
 * Wynik: reports/cc-skaner/raport.json, raport.md, zrzuty *.png
 * Kod wyjścia: 0 – brak usterek, 1 – są usterki, 2 – skaner sam się wywrócił.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const DEFAULT_PAGES = [
  '/', '/go/', '/milion', '/biblia-audio/', '/akademia', '/akademia/kurscodzienny/',
  '/wspieraj', '/pomogebomoge', '/lumina', '/lumina-tablica', '/wyszukiwarka',
  '/mojabiblia', '/vod', '/player', '/news', '/topTEN/', '/audioteka', '/badz-blisko/', '/mess',
];
export const VIEWPORTS = [
  { name: 'telefon', width: 375, height: 812, isMobile: true, hasTouch: true },
  { name: 'komputer', width: 1280, height: 800 },
];
// Krzaczki: UTF-8 odczytane jako cp1250 / latin1 oraz znak zastępczy.
export const MOJIBAKE_RE = /Ă[—–„”…˘łÂ]|Â[·§©®°»«±]|Ä[…™‡†™]|Ĺ[‚›şĽ„‚ź]|Ã[³±©¡¶¼]|â€[™œ”“¦]|ďż˝|�/;

const BASE = (process.env.CC_SKANER_BASE || 'https://polskieradio.cc').replace(/\/$/, '');
const OUT = process.env.CC_SKANER_OUT || path.join('reports', 'cc-skaner');
const PAGES = (process.env.CC_SKANER_PAGES || '').split(',').map(s => s.trim()).filter(Boolean);

export function fingerprint(f) {
  return crypto.createHash('sha1').update([f.path, f.widok, f.typ, f.klucz].join('|')).digest('hex').slice(0, 12);
}

// Uruchamiane w przeglądarce: zbiera usterki z bieżącego widoku.
function pageProbe(opts) {
  const vw = innerWidth, vh = innerHeight;
  const out = [];
  const sel = (el) => {
    if (!el || el.nodeType !== 1) return '?';
    if (el.id) return '#' + el.id;
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.') : '';
    const label = el.getAttribute('aria-label') || el.getAttribute('title') || (el.innerText || '').trim().slice(0, 24);
    return el.tagName.toLowerCase() + (cls ? '.' + cls : '') + (label ? `[„${label.replace(/\s+/g, ' ')}”]` : '');
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.1) return false;
    const r = el.getBoundingClientRect();
    return r.width >= 8 && r.height >= 8 && r.bottom > 0 && r.right > 0 && r.top < vh && r.left < vw;
  };
  const floatingRoot = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const p = getComputedStyle(n).position;
      if (p === 'fixed' || p === 'sticky') return n;
    }
    return null;
  };
  const rect = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; };

  // 1. Kolizje: środek / 3 punkty klikalnego elementu zakryte przez obcy pływający element.
  if (opts.collisions) {
    const clickable = [...document.querySelectorAll('a[href], button, [role="button"], input:not([type="hidden"]), select, textarea, [onclick]')]
      .filter(visible);
    const seen = new Set();
    for (const el of clickable) {
      const r = el.getBoundingClientRect();
      const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + r.width * 0.25, r.top + r.height / 2], [r.left + r.width * 0.75, r.top + r.height / 2]]
        .filter(([x, y]) => x >= 0 && y >= 0 && x < vw && y < vh);
      if (!pts.length) continue;
      let covered = 0, coverer = null;
      for (const [x, y] of pts) {
        const hit = document.elementFromPoint(x, y);
        if (!hit || hit === el || el.contains(hit) || hit.contains(el)) continue;
        const root = floatingRoot(hit);
        if (!root || root.contains(el) || floatingRoot(el) === root) continue;
        // Warstwy przejściowe (znikają po kliknięciu/same): dymek zaczepki czatu, baner zgody cookies.
        if (hit.closest('#ccChatTeaserBubble, .cc-chat-teaser-bubble, .cc-warm-welcome-host') || /cookie|consent|rodo|gdpr/i.test((root.id || '') + ' ' + (typeof root.className === 'string' ? root.className : ''))) continue;
        const rr = root.getBoundingClientRect();
        // Pełnoekranowe nakładki (okna, wprowadzenia) to nie kolizja przycisków.
        if (rr.width * rr.height > vw * vh * 0.45) continue;
        // Zwykła treść pod paskiem/banerem/dymkiem to normalne zachowanie — liczy się tylko,
        // gdy zasłonięty jest pływający przycisk albo zasłania mały pływający przycisk (FAB).
        if (!floatingRoot(el) && rr.width * rr.height > 140 * 140) continue;
        covered++; coverer = hit;
      }
      if (covered >= 2 || (covered === 1 && pts.length === 1)) {
        const a = sel(el), b = sel(floatingRoot(coverer)) + ' › ' + sel(coverer);
        const key = a + '|' + b;
        if (seen.has(key)) continue; seen.add(key);
        out.push({ typ: 'kolizja', klucz: key, opis: `${a} zasłonięty przez ${b}`, ramki: [rect(el), rect(coverer)] });
      }
    }
  }

  // 2. Krzaczki w widocznym tekście i etykietach.
  const texts = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) {
    const p = n.parentElement;
    if (!p || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(p.tagName)) continue;
    if (opts.re.test(n.textContent) && p.getClientRects().length) texts.push([p, n.textContent.trim()]);
  }
  for (const el of document.querySelectorAll('[title],[aria-label],[placeholder],[alt]')) {
    for (const at of ['title', 'aria-label', 'placeholder', 'alt']) {
      const v = el.getAttribute(at);
      if (v && opts.re.test(v)) texts.push([el, `${at}="${v}"`]);
    }
  }
  if (opts.re.test(document.title)) texts.push([document.head, 'title: ' + document.title]);
  for (const [el, t] of texts.slice(0, 10)) {
    const m = t.match(opts.re);
    const i = Math.max(0, (m?.index || 0) - 25);
    const frag = t.slice(i, i + 60).replace(/\s+/g, ' ');
    out.push({ typ: 'krzaczki', klucz: sel(el) + '|' + (m?.[0] || ''), opis: `${sel(el)}: „${frag}”`, ramki: el.getBoundingClientRect ? [rect(el)] : [] });
  }

  // 3. Poza ekranem w bok.
  const sw = document.documentElement.scrollWidth;
  if (sw > vw + 2 && getComputedStyle(document.documentElement).overflowX !== 'hidden' && getComputedStyle(document.body).overflowX !== 'hidden') {
    const culprits = [...document.body.querySelectorAll('*')].filter(e => {
      const r = e.getBoundingClientRect(); return r.right > vw + 2 && r.width > 0 && r.width <= sw && getComputedStyle(e).position !== 'fixed';
    }).slice(0, 3);
    out.push({ typ: 'poza-ekranem', klucz: 'scrollWidth', opis: `strona ma ${sw}px przy ekranie ${vw}px; np. ${culprits.map(sel).join(', ') || '?'}`, ramki: culprits.map(rect) });
  }

  // 4. Przycisk „do góry” po przewinięciu długiej strony.
  if (opts.checkBackToTop) {
    const btt = document.querySelector('#backToTopBtn, [data-cc-back-to-top]');
    const long = document.documentElement.scrollHeight > vh * 2.5 && (scrollY || document.documentElement.scrollTop) > 600;
    if (btt && long && !visible(btt)) {
      out.push({ typ: 'do-gory', klucz: '#backToTopBtn', opis: `przycisk „do góry” niewidoczny po przewinięciu (${Math.round(scrollY)}px); styl: ${btt.getAttribute('style') || '-'}`, ramki: [] });
    }
  }
  return out;
}

async function settle(page, ms) {
  await page.waitForTimeout(ms);
  // Kilka klatek, żeby skrypty pozycjonujące (requestAnimationFrame) zdążyły.
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))).catch(() => {});
}

async function scanPage(browser, vp, p) {
  const url = BASE + p;
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch, locale: 'pl-PL',
    userAgent: vp.isMobile ? 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 CCSkaner/1.0' : undefined });
  // Tylko odczyt: blokujemy wysyłki POST/PUT/DELETE do tej samej domeny (formularze, liczniki).
  const origin = new URL(BASE).origin;
  await ctx.route('**/*', (route) => {
    const req = route.request();
    if (req.method() !== 'GET' && req.method() !== 'HEAD' && req.url().startsWith(origin)) return route.abort();
    return route.continue();
  });
  const page = await ctx.newPage();
  const findings = [];
  const jsErrors = new Set();
  const badFiles = new Map();
  page.on('pageerror', (e) => jsErrors.add(String(e.message || e).split('\n')[0].slice(0, 200)));
  page.on('response', (r) => {
    const u = r.url();
    if (u.startsWith(origin) && r.status() >= 400 && r.request().method() === 'GET') badFiles.set(u.replace(origin, '').split('#')[0], r.status());
  });
  page.on('requestfailed', (r) => {
    const u = r.url(); const err = r.failure()?.errorText || '';
    if (u.startsWith(origin) && r.method() === 'GET' && !/ERR_ABORTED/.test(err)) badFiles.set(u.replace(origin, '').split('#')[0], err);
  });

  let status = 0;
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    status = resp ? resp.status() : 0;
  } catch (e) {
    findings.push({ typ: 'http', klucz: 'goto', opis: `nie otwiera się: ${String(e.message).split('\n')[0]}`, ramki: [] });
  }
  if (status >= 400) findings.push({ typ: 'http', klucz: String(status), opis: `odpowiedź HTTP ${status}`, ramki: [] });

  const shots = [];
  if (status && status < 400) {
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    await settle(page, 3500);
    const opts = { re: MOJIBAKE_RE, collisions: true, checkBackToTop: false };
    let top = await page.evaluate(pageProbe, opts).catch(e => [{ typ: 'skaner', klucz: 'probe', opis: String(e.message).slice(0, 200), ramki: [] }]);
    await settle(page, 2000);
    const topAgain = new Set((await page.evaluate(pageProbe, opts).catch(() => [])).map(f => f.typ + '|' + f.klucz));
    top = top.filter(f => f.typ !== 'kolizja' || topAgain.has(f.typ + '|' + f.klucz));
    top.forEach(f => (f.miejsce = 'góra strony'));
    // Przewinięcie: pojawiają się przyciski „do góry”, minimalizowane odtwarzacze itd.
    await page.evaluate(() => scrollTo(0, Math.min(1600, document.documentElement.scrollHeight - innerHeight)));
    await settle(page, 1800);
    let down = await page.evaluate(pageProbe, { ...opts, checkBackToTop: true }).catch(() => []);
    // Kolizje i „do góry” muszą się utrzymać — drugi pomiar po 2 s odsiewa elementy w trakcie animacji.
    await settle(page, 2000);
    const again = new Set((await page.evaluate(pageProbe, { ...opts, checkBackToTop: true }).catch(() => [])).map(f => f.typ + '|' + f.klucz));
    down = down.filter(f => !['kolizja', 'do-gory'].includes(f.typ) || again.has(f.typ + '|' + f.klucz));
    down.forEach(f => (f.miejsce = 'po przewinięciu'));
    const keys = new Set();
    for (const f of [...top, ...down]) {
      const k = f.typ + '|' + f.klucz;
      if (keys.has(k)) continue; keys.add(k); findings.push(f);
    }
    if (findings.some(f => f.ramki?.length)) {
      const file = `${p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'start'}-${vp.name}.png`;
      await page.evaluate((boxes) => {
        for (const b of boxes) {
          const d = document.createElement('div');
          d.style.cssText = `position:fixed;left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px;outline:3px solid #ff0040;z-index:2147483647;pointer-events:none`;
          document.documentElement.appendChild(d);
        }
      }, findings.filter(f => f.miejsce === 'po przewinięciu').flatMap(f => f.ramki || [])).catch(() => {});
      await page.screenshot({ path: path.join(OUT, file) }).catch(() => {});
      shots.push(file);
    }
  }
  for (const m of jsErrors) findings.push({ typ: 'blad-js', klucz: m, opis: m, ramki: [] });
  for (const [u, s] of badFiles) findings.push({ typ: 'brak-pliku', klucz: u, opis: `${u} → ${s}`, ramki: [] });
  await ctx.close();
  return findings.map(f => ({ ...f, path: p, widok: vp.name, url, zrzut: shots[0] || null, id: fingerprint({ ...f, path: p, widok: vp.name }) }));
}

export function toMarkdown(all, meta) {
  const by = {};
  for (const f of all) (by[f.typ] ||= []).push(f);
  const names = { kolizja: 'Kolizje przycisków', krzaczki: 'Krzaczki (kodowanie)', 'blad-js': 'Błędy JavaScript', 'brak-pliku': 'Brakujące pliki', 'poza-ekranem': 'Strona szersza niż ekran', 'do-gory': 'Brak przycisku „do góry”', http: 'Strona nie działa', skaner: 'Problem skanera' };
  let md = `# CC Skaner Wizualny — raport\n\n- Adres: ${meta.base}\n- Czas: ${meta.czas}\n- Strony: ${meta.strony} × widoki: ${meta.widoki}\n- Usterki: **${all.length}**\n\n`;
  if (!all.length) return md + '✅ Brak usterek.\n';
  for (const [typ, list] of Object.entries(by)) {
    md += `## ${names[typ] || typ} (${list.length})\n\n`;
    for (const f of list) md += `- \`${f.id}\` **${f.path}** · ${f.widok}${f.miejsce ? ' · ' + f.miejsce : ''} — ${f.opis}${f.zrzut ? ` · zrzut: ${f.zrzut}` : ''}\n`;
    md += '\n';
  }
  return md;
}

async function launchBrowser() {
  for (const opts of [{ headless: true }, { channel: 'chrome', headless: true }, { channel: 'msedge', headless: true }]) {
    try { return await chromium.launch(opts); } catch (_) {}
  }
  return await chromium.launch({ headless: true });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const pages = PAGES.length ? PAGES : DEFAULT_PAGES;
  const browser = await launchBrowser();
  const all = [];
  for (const vp of VIEWPORTS) {
    for (const p of pages) {
      process.stdout.write(`… ${vp.name} ${p}\n`);
      try { all.push(...await scanPage(browser, vp, p)); }
      catch (e) { all.push({ typ: 'skaner', klucz: p, opis: String(e.message).split('\n')[0], path: p, widok: vp.name, id: fingerprint({ path: p, widok: vp.name, typ: 'skaner', klucz: p }) }); }
    }
  }
  await browser.close();
  const meta = { base: BASE, czas: new Date().toISOString(), strony: pages.length, widoki: VIEWPORTS.map(v => `${v.name} ${v.width}×${v.height}`).join(', ') };
  fs.writeFileSync(path.join(OUT, 'raport.json'), JSON.stringify({ meta, usterki: all }, null, 2));
  fs.writeFileSync(path.join(OUT, 'raport.md'), toMarkdown(all, meta));
  console.log(`\nUsterki: ${all.length} → ${path.join(OUT, 'raport.md')}`);
  process.exitCode = all.length ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:')}` || process.argv[1]?.endsWith('cc-skaner-wizualny.mjs')) {
  main().catch((e) => { console.error('Skaner wywrócił się:', e); process.exitCode = 2; });
}
