#!/usr/bin/env node
// Generator kursów serii „Rozwiąż problem” (@007, L0 02.11.2026).
//
// Pakiet kursu: scripts/content/rozwiaz-problem/<slug>/
//   kurs.docx  — lekcje od L0 („Dzień N. Tytuł”, MYŚL PRZEWODNIA, Dzisiaj rozumiemy, Zadanie na dziś,
//                Biblia w codziennym życiu, Krótka modlitwa)
//   fiszki.csv — pytanie,odpowiedź
//   kurs.json  — wszystko, czego nie ma w dokumencie (poradnia, sekcja kryzysowa, karta, media, FAQ, SEO)
// Media kursu leżą w folderze strony (pole "assets").
//
// Użycie:
//   node scripts/rozwiaz-problem/build.mjs build <slug>|--all     zapisuje stronę
//   node scripts/rozwiaz-problem/build.mjs check                  sprawdza, czy strony są aktualne (kod 1, gdy nie)
//   node scripts/rozwiaz-problem/build.mjs import <slug> <folder> kopiuje pakiet: Word, CSV, wideo, audio, PDF
//   node scripts/rozwiaz-problem/build.mjs register <slug>        wyszukiwarka CC, mapa strony, llms.txt, menu „Kursy”
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTENT = path.join(ROOT, 'scripts/content/rozwiaz-problem');
const TEMPLATE = path.join(ROOT, 'scripts/rozwiaz-problem/template.html');
const MAX_ASSET = 25 * 1024 * 1024; // limit pliku w Cloudflare Pages

// ── Word (.docx) bez zewnętrznych bibliotek ────────────────────────────────
export function readZipEntry(buf, name) {
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) throw new Error('To nie jest plik .docx (brak katalogu ZIP).');
  let p = buf.readUInt32LE(eocd + 16);
  const count = buf.readUInt16LE(eocd + 10);
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28), elen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    if (buf.toString('utf8', p + 46, p + 46 + nlen) === name) {
      const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
      const data = buf.subarray(start, start + csize);
      return method === 0 ? data : zlib.inflateRawSync(data);
    }
    p += 46 + nlen + elen + clen;
  }
  throw new Error(`W pliku .docx brakuje ${name}.`);
}

const decodeXml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

export function docxParagraphs(file) {
  const xml = readZipEntry(fs.readFileSync(file), 'word/document.xml').toString('utf8');
  return (xml.match(/<w:p[ >][^\n]*?<\/w:p>/g) || [])
    .map((p) => decodeXml((p.match(/<w:t[^>]*>[^<]*<\/w:t>/g) || []).map((t) => t.replace(/<[^>]+>/g, '')).join('')))
    .filter((t) => t.trim());
}

const SECTIONS = {
  learn: 'Dzisiaj rozumiemy', task: 'Zadanie na dziś', bible: 'Biblia w codziennym życiu', prayer: 'Krótka modlitwa',
};

export function parseLessons(lines) {
  const heads = [];
  lines.forEach((l, i) => { const m = l.match(/^Dzień (\d+)\.\s*(.+)$/); if (m) heads.push({ i, n: +m[1], title: m[2].trim() }); });
  if (!heads.length) throw new Error('Nie znaleziono lekcji („Dzień 1. Tytuł”).');
  const days = heads.map((h, k) => {
    const end = k + 1 < heads.length ? heads[k + 1].i : lines.length;
    const block = lines.slice(h.i + 1, end);
    const thought = block[0] || '';
    if (!/^MYŚL PRZEWODNIA/.test(thought)) throw new Error(`Dzień ${h.n}: brak „MYŚL PRZEWODNIA” pod tytułem.`);
    const after = (head) => {
      const j = block.indexOf(head);
      if (j < 0 || j + 1 >= block.length) throw new Error(`Dzień ${h.n}: brak części „${head}”.`);
      return block[j + 1].trim();
    };
    const bib = after(SECTIONS.bible).replace(/^Teksty do przeczytania w Biblii \([^)]*\):\s*/, '');
    const dot = bib.indexOf('.');
    if (dot < 0) throw new Error(`Dzień ${h.n}: w „Biblia w codziennym życiu” brak kropki po odnośnikach.`);
    return {
      n: h.n, title: h.title, thought: thought.replace(/^MYŚL PRZEWODNIA\s*•\s*/, '').trim(),
      learn: after(SECTIONS.learn), task: after(SECTIONS.task),
      refs: bib.slice(0, dot).trim(), context: bib.slice(dot + 1).trim(), prayer: after(SECTIONS.prayer),
    };
  });
  days.forEach((d, i) => { if (d.n !== i + 1) throw new Error(`Numeracja lekcji: oczekiwano Dnia ${i + 1}, jest Dzień ${d.n}.`); });
  const w = lines.indexOf('Witaj w kursie');
  return { days, welcome: w >= 0 ? lines[w + 1].trim() : '' };
}

// ── Fiszki (CSV z NotebookLM) ──────────────────────────────────────────────
export function parseCards(text) {
  const t = text.replace(/^﻿/, '').replace(/\$[\\\r]r?ightarrow\$/g, '→');
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"' && t[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const clean = (s) => s.replace(/\s*\$[\\\r]?r?ightarrow\$\s*/g, ' → ').replace(/\s+/g, ' ').trim();
  return rows.filter((r) => r.length >= 2 && r[0].trim()).map(([q, a]) => ({ q: clean(q), a: clean(a) }));
}

// ── Pomocnicze ─────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const js = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
const jsStr = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
function plural(n, one, few, many) {
  if (n === 1) return one;
  const d = n % 10, h = n % 100;
  return d >= 2 && d <= 4 && (h < 12 || h > 14) ? few : many;
}
const ICON = (inner, size = 22) => `<span class="ic" aria-hidden="true"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg></span>`;
const ICONS = {
  pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/>',
  video: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 9l3 2-3 2z"/>',
  audio: '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M21 15a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2zM3 15a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2z"/>',
  plan: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
};

function field(f) {
  if (f.type === 'textarea') return `<label>${esc(f.label)}<textarea rows="${f.rows || 2}" data-k="${attr(f.key)}"></textarea></label>`;
  const extra = f.type === 'number' ? ` min="${f.min ?? 0}" max="${f.max ?? 999}" inputmode="numeric"` : '';
  const ph = f.placeholder ? ` placeholder="${attr(f.placeholder)}"` : '';
  return `<label>${esc(f.label)}<input type="${f.type}"${extra} data-k="${attr(f.key)}"${ph}></label>`;
}

export function loadCourses() {
  return fs.readdirSync(CONTENT, { withFileTypes: true }).filter((d) => d.isDirectory())
    .map((d) => path.join(CONTENT, d.name, 'kurs.json')).filter((f) => fs.existsSync(f))
    .map((f) => JSON.parse(fs.readFileSync(f, 'utf8'))).sort((a, b) => a.number.localeCompare(b.number));
}

export function loadPackage(slug) {
  const dir = path.join(CONTENT, slug);
  const course = JSON.parse(fs.readFileSync(path.join(dir, 'kurs.json'), 'utf8'));
  const { days, welcome } = parseLessons(docxParagraphs(path.join(dir, 'kurs.docx')));
  const cards = parseCards(fs.readFileSync(path.join(dir, 'fiszki.csv'), 'utf8'));
  return { course, days, cards, welcome };
}

// ── Strona ─────────────────────────────────────────────────────────────────
export function renderCourse(slug) {
  const { course: c, days, cards, welcome } = loadPackage(slug);
  const A = c.assets, ABS = 'https://polskieradio.cc' + A, N = days.length;
  for (const k of ['video', 'audio', 'pdf']) {
    if (c[k] && !fs.existsSync(path.join(ROOT, A, c[k].file))) throw new Error(`Brak pliku ${k}: ${A}${c[k].file}`);
  }

  const grid = days.map(d => `<li><a class="day-card" href="#dzien-${d.n}" data-day="${d.n}"><span class="day-num">${String(d.n).padStart(2, '0')}</span><span class="day-body"><strong>${esc(d.title)}</strong><em>${esc(d.thought)}</em></span><span class="day-state" aria-hidden="true"></span></a></li>`).join('\n');
  const last = c.plan ? '<a class="btn ghost" href="#plan-30-90">Plan 30/90 dni →</a>' : '<a class="btn ghost" href="#materialy">Materiały →</a>';
  const lessons = days.map(d => `
<article class="lesson" id="dzien-${d.n}" data-day="${d.n}" aria-labelledby="l${d.n}-t">
  <header class="lesson-head">
    <p class="eyebrow">Dzień ${d.n} z ${N}</p>
    <h3 id="l${d.n}-t">${esc(d.title)}</h3>
    <p class="thought"><span>Myśl przewodnia</span>${esc(d.thought)}</p>
  </header>
  <div class="lesson-grid">
    <section class="block learn"><h4>Dzisiaj rozumiemy</h4><p>${esc(d.learn)}</p></section>
    <section class="block task"><h4>Zadanie na dziś</h4><p>${esc(d.task)}</p></section>
    <section class="block bible"><h4>Biblia w codziennym życiu</h4><p class="refs">${esc(d.refs)}</p><p>${esc(d.context)}</p><p class="small">Przeczytaj wskazane fragmenty w wybranym przekładzie Biblii, razem z kilkoma wersetami przed i po.</p></section>
    <section class="block prayer"><h4>Krótka modlitwa</h4><p>${esc(d.prayer)}</p></section>
  </div>
  <section class="journal" aria-label="Dziennik uczestnika — dzień ${d.n}">
    <h4>Dziennik uczestnika <small>zapisuje się tylko na tym urządzeniu</small></h4>
    <div class="journal-fields">
      <label>Co dziś było najtrudniejsze?<textarea data-note="hard" rows="2"></textarea></label>
      <label>Co pomogło?<textarea data-note="helped" rows="2"></textarea></label>
      <label>Mój następny krok<textarea data-note="step" rows="2"></textarea></label>
    </div>
    <div class="checks">
      <label class="check"><input type="checkbox" data-check="read"><span>Przeczytałem/przeczytałam lekcję</span></label>
      <label class="check"><input type="checkbox" data-check="task"><span>Wykonałem/wykonałam zadanie</span></label>
      <label class="check"><input type="checkbox" data-check="next"><span>Zaplanowałem/zaplanowałam następny krok</span></label>
    </div>
  </section>
  <nav class="lesson-nav" aria-label="Nawigacja lekcji">
    ${d.n > 1 ? `<a class="btn ghost" href="#dzien-${d.n - 1}">← Dzień ${d.n - 1}</a>` : '<a class="btn ghost" href="#start">← Karta startowa</a>'}
    <button class="btn primary" type="button" data-complete="${d.n}">Oznacz jako ukończoną</button>
    ${d.n < N ? `<a class="btn ghost" href="#dzien-${d.n + 1}">Dzień ${d.n + 1} →</a>` : last}
  </nav>
</article>`).join('\n');

  const faqHtml = c.faq.map(([q, a]) => `      <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n');
  const parts = [];
  if (c.video) parts.push({ '@id': c.url + '#wideo' });
  if (c.audio) parts.push({ '@id': c.url + '#audio' });
  const graph = [
    { '@type': 'WebPage', '@id': c.url + '#strona', url: c.url, name: c.head.title.replace(/ \| Christian Culture$/, ''), inLanguage: 'pl-PL',
      description: c.seo.pageDescription,
      isPartOf: { '@type': 'WebSite', name: 'Christian Culture', url: 'https://polskieradio.cc/' },
      primaryImageOfPage: ABS + c.head.ogImage, datePublished: c.published, dateModified: c.modified,
      breadcrumb: { '@id': c.url + '#okruszki' }, mainEntity: { '@id': c.url + '#kurs' },
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.hero .lead', '.welcome'] } },
    { '@type': 'BreadcrumbList', '@id': c.url + '#okruszki', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Christian Culture', item: 'https://polskieradio.cc/' },
      { '@type': 'ListItem', position: 2, name: 'Rozwiąż problem', item: c.url } ] },
    { '@type': 'Course', '@id': c.url + '#kurs', name: `${c.name} — ${N} lekcji`, alternateName: `Rozwiąż problem: ${c.name}`,
      description: c.seo.courseDescription,
      inLanguage: 'pl', isAccessibleForFree: true, educationalLevel: c.seo.educationalLevel, timeRequired: `P${N}D`,
      teaches: c.seo.teaches,
      about: c.seo.about.map((name) => ({ '@type': 'Thing', name })),
      provider: { '@type': 'Organization', name: 'Christian Culture', url: 'https://polskieradio.cc', logo: 'https://polskieradio.cc/rozwiaz-problem/assets/rozwiaz-problem-logo.webp' },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'PLN', category: 'Free', availability: 'https://schema.org/InStock' },
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: c.seo.workload, inLanguage: 'pl' },
      syllabusSections: days.map(d => ({ '@type': 'Syllabus', name: `Dzień ${d.n}. ${d.title}`, description: d.thought, url: `${c.url}#dzien-${d.n}` })),
      hasPart: parts },
  ];
  if (c.video) graph.push({ '@type': 'VideoObject', '@id': c.url + '#wideo', name: c.video.title, description: c.video.description,
    thumbnailUrl: ABS + c.video.poster, contentUrl: ABS + c.video.file, uploadDate: c.published, duration: c.video.duration, inLanguage: 'pl' });
  if (c.audio) graph.push({ '@type': 'AudioObject', '@id': c.url + '#audio', name: `${c.audio.title} — podsumowanie audio`, contentUrl: ABS + c.audio.file, encodingFormat: 'audio/mp4', duration: c.audio.duration, uploadDate: c.published, inLanguage: 'pl' });
  graph.push({ '@type': 'FAQPage', '@id': c.url + '#pytania', mainEntity: c.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });

  const listen = c.audio ? `    <div class="listen" id="posluchaj">
      <div class="listen-ic" aria-hidden="true"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS.audio}</svg></div>
      <div class="listen-body">
        <p class="eyebrow" style="margin-bottom:6px">Podsumowanie audio · ${c.audio.minutes} min</p>
        <h3>${esc(c.audio.title)}</h3>
        <p>${esc(c.audio.text)}</p>
        <audio controls preload="none" src="${A}${c.audio.file}">Twoja przeglądarka nie odtwarza audio. <a href="${A}${c.audio.file}">Pobierz nagranie</a>.</audio>
      </div>
    </div>
` : '';
  const ch = c.start.choice;
  const startFields = c.start.fields.map((f) => '      ' + field(f)).concat(ch ? [
    `      <fieldset style="border:0;padding:0;margin:0"><legend style="font:600 14px/1.3 var(--head);margin-bottom:8px">${esc(ch.legend)}</legend>`,
    '        <div class="radio-row">',
    ...ch.options.map(([v, l]) => `          <label><input type="radio" name="${attr(ch.name || ch.key)}" value="${attr(v)}" data-k="${attr(ch.key)}">${esc(l)}</label>`),
    '        </div>',
    '      </fieldset>'] : []).join('\n');
  const mats = [];
  if (c.pdf) mats.push(`<div class="mat">${ICON(ICONS.pdf)}<h3>${esc(c.pdf.title)}</h3><p>${esc(c.pdf.text)}</p><a class="btn ghost" href="${A}${c.pdf.file}" download>Pobierz PDF</a></div>`);
  if (c.video) mats.push(`<div class="mat">${ICON(ICONS.video)}<h3>${esc(c.video.cardTitle)}</h3><p>${esc(c.video.cardText)}</p><a class="btn ghost" href="#fala">Obejrzyj</a></div>`);
  if (c.audio) mats.push(`<div class="mat">${ICON(ICONS.audio)}<h3>Podsumowanie audio</h3><p>${esc(c.audio.cardText)}</p><a class="btn ghost" href="#posluchaj">Posłuchaj</a></div>`);
  if (c.plan) mats.push(`<div class="mat">${ICON(ICONS.plan)}<h3>Karta planu na 30 i 90 dni</h3><p>${esc(c.plan.cardText)}</p><a class="btn ghost" href="#plan-30-90">Wypełnij</a></div>`);

  const series = loadCourses().map((o) => o.slug === c.slug
    ? `      <a class="s-card s-live" href="#kurs"><span class="tag">Dostępny</span><h3>${esc(o.name)}</h3><p>${esc(o.seriesCardText)}</p><span style="font:700 15px var(--head);color:var(--cc-action-hover)">Przejdź do kursu →</span></a>`
    : `      <a class="s-card s-live" href="${attr(o.path)}"><span class="tag">Dostępny</span><h3>${esc(o.name)}</h3><p>${esc(o.seriesCardText)}</p><span style="font:700 15px var(--head);color:var(--cc-action-hover)">Przejdź do kursu →</span></a>`);
  series.push('      <div class="s-card s-soon"><span class="tag">W przygotowaniu</span><h3>Kolejny kurs serii</h3><p>Przygotowujemy następne tematy według tego samego szablonu: jeden problem, mierzalny cel, krótkie lekcje i plan na potem.</p></div>');
  if (c.helpLink) series.push(`      <a class="s-card s-soon" href="${attr(c.helpLink.href)}"><span class="tag">CC Pomoc</span><h3>${esc(c.helpLink.title)}</h3><p>${esc(c.helpLink.text)}</p><span style="font:700 15px var(--head);color:var(--blue)">Otwórz CC Pomoc →</span></a>`);

  const cr = c.crisis;
  const copyPlan = '[' + cr.copyLines.map((l) => l.split('{osoba}').map(jsStr).join('+who+')).join(',') + ']';
  const vars = {
    headTitle: esc(c.head.title), headDescription: attr(c.head.description), url: c.url,
    ogTitle: attr(c.head.ogTitle), ogDescription: attr(c.head.ogDescription), ogImage: ABS + c.head.ogImage,
    ogImageAlt: attr(c.head.ogImageAlt), twitterDescription: attr(c.head.twitterDescription),
    crisisNav: esc(cr.nav), crisisCta: esc(cr.cta), name: esc(c.name), number: esc(c.number), slug: c.slug,
    dayCount: N, cardCount: cards.length, cardWord: plural(cards.length, 'fiszka', 'fiszki', 'fiszek'),
    questionWord: plural(cards.length, 'pytanie', 'pytania', 'pytań'),
    helpTitle: esc(c.help.title), helpText: c.help.textHtml,
    helpNumbers: c.help.numbers.map((n) => `      <a class="num${n.sos ? ' sos' : ''}" href="tel:${n.tel}"><small>${esc(n.label)}</small><b>${esc(n.display)}</b></a>`).join('\n'),
    tagline: esc(c.tagline), welcome: esc(c.welcome || welcome),
    rules: c.rules.map(([b, t]) => `      <div class="rule"><b>${esc(b)}</b>${esc(t)}</div>`).join('\n'), listen,
    startLead: esc(c.start.lead), careTitle: esc(c.start.careTitle), careText: esc(c.start.careText), startFields,
    videoPlayer: c.video ? `<div class="phone"><video controls playsinline preload="none" poster="${A}${c.video.poster}" width="720" height="1280"><source src="${A}${c.video.file}" type="video/mp4">Twoja przeglądarka nie odtwarza wideo. <a href="${A}${c.video.file}">Pobierz film</a>.</video></div>` : '<div class="phone" hidden></div>',
    crisisEyebrow: esc(cr.eyebrow), crisisTitle: esc(cr.title), crisisLead: esc(cr.lead),
    crisisSteps: cr.steps.map((s) => `<li>${esc(s)}</li>`).join(''),
    timerTitle: esc(cr.timerTitle), timerText: esc(cr.timerText), planTitle: esc(cr.planTitle),
    planItems: cr.planItems.map((s) => `          <li>${esc(s)}</li>`).join('\n'),
    materials: mats.map((m) => '      ' + m).join('\n'),
    planLead: esc(c.plan ? c.plan.lead : ''), planFields: (c.plan ? c.plan.fields : []).map((f) => '        ' + field(f)).join('\n'),
    seriesCards: series.join('\n'), faqTitle: esc(c.faqTitle),
    sources: c.sourcesHtml.map((s) => `      <li>${s}</li>`).join('\n'),
    timerCuesJson: '[' + cr.timerCues.map(jsStr).join(',') + ']', copyPlanJs: copyPlan, timerDoneJson: jsStr(cr.timerDone),
  };

  let html = fs.readFileSync(TEMPLATE, 'utf8')
    .replace('/*JSONLD*/', () => js({ '@context': 'https://schema.org', '@graph': graph }))
    .replace('<!--FAQ-->', () => faqHtml)
    .replace('<!--GRID-->', () => grid)
    .replace('<!--LESSONS-->', () => lessons)
    .replace('/*CARDS*/[]', () => js(cards))
    .replace('/*TITLES*/[]', () => JSON.stringify(days.map(d => d.title)))
    .replace(/\{\{(\w+)\}\}/g, (m, k) => { if (!(k in vars)) throw new Error(`Szablon: nieznane pole ${m}`); return String(vars[k]); });
  if (!c.plan) html = html.replace(/\n    <div class="plan" id="plan-30-90">[\s\S]*?\n    <\/div>\n/, '\n');
  return { html, course: c, days, cards, outFile: path.join(ROOT, c.outFile) };
}

// ── Wyszukiwarka CC, mapa strony, llms.txt, menu „Kursy” ───────────────────
export const searchItem = (c) => ({ title: c.search.title, category: 'Biblia i formacja', url: c.url, description: c.search.description, tags: c.search.tags, featured: true });
export const sitemapPath = (c) => ({ path: c.path, lastmod: c.modified, priority: '0.90', changefreq: 'weekly' });

function register(slug) {
  const c = loadCourses().find((o) => o.slug === slug);
  if (!c) throw new Error(`Brak kursu ${slug}.`);
  const log = [];
  const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const wr = (f, s) => fs.writeFileSync(path.join(ROOT, f), s);

  // Wyszukiwarka: oba pliki muszą być identyczne (test ccn-discovery-runtime)
  const cat = JSON.parse(rd('szukaj/catalog.json'));
  const item = searchItem(c), at = cat.items.findIndex((i) => i.url === c.url);
  if (at >= 0 && JSON.stringify(cat.items[at]) === JSON.stringify(item)) log.push('wyszukiwarka: bez zmian');
  else {
    if (at >= 0) cat.items[at] = item;
    else cat.items.splice(cat.items.findIndex((i) => i.url === 'https://polskieradio.cc/wizytowki') + 1 || cat.items.length, 0, item);
    cat.totalItems = cat.items.length; cat.updatedAt = new Date().toISOString();
    const out = JSON.stringify(cat, null, 2);
    wr('szukaj/catalog.json', out); wr('data/cc-search-index.json', out);
    log.push(`wyszukiwarka: ${at >= 0 ? 'zaktualizowano' : 'dodano'} wpis (${cat.totalItems} pozycji)`);
  }

  // Mapa strony dla Google
  let xml = rd('sitemaps/pages.xml');
  const loc = `<loc>https://polskieradio.cc${c.path}</loc>`;
  if (!xml.includes(loc)) {
    xml = xml.replace('</urlset>', `  <url>\n    ${loc}\n    <lastmod>${c.modified}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.90</priority>\n  </url>\n</urlset>`);
    wr('sitemaps/pages.xml', xml);
    wr('sitemap.xml', rd('sitemap.xml').replace(/(<loc>https:\/\/polskieradio\.cc\/sitemaps\/pages\.xml<\/loc>\s*<lastmod>)[^<]*/, `$1${c.modified}`));
    log.push('mapa strony: dodano adres, zaktualizowano datę w sitemap.xml');
  } else log.push('mapa strony: bez zmian');

  // llms.txt dla wyszukiwarek AI
  const llms = rd('llms.txt');
  if (!llms.includes(c.url)) {
    const line = `- **Rozwiąż problem — ${c.name} (kurs ${days(c)} dni)**: ${c.url} — ${c.search.description}`;
    wr('llms.txt', llms.replace('- **Pobierz — Biblioteka Plików CC**:', `${line}\n- **Pobierz — Biblioteka Plików CC**:`));
    log.push('llms.txt: dodano wpis (llms-full.txt uzupełnij ręcznie opisem kursu)');
  } else log.push('llms.txt: bez zmian');

  // Menu „Wszystko” → Kursy
  const menuFile = 'components/cc-omni-search.js';
  let menu = rd(menuFile);
  if (!menu.includes(`'${c.path}'`)) {
    const icon = new RegExp(`\\n\\s+${c.menuIcon}: '`).test(menu) ? c.menuIcon : 'puzzle';
    if (icon !== c.menuIcon) log.push(`UWAGA: brak ikony „${c.menuIcon}” w menu — użyto „puzzle”`);
    menu = menu.replace("['Pokonać Goliata',", `['${(c.menuLabel || c.name).replace(/'/g, "\\'")}', '${c.path}', '${icon}'],\n      ['Pokonać Goliata',`);
    wr(menuFile, menu);
    log.push('menu Kursy: dodano ikonę');
  } else log.push('menu Kursy: bez zmian');
  return log;
}
const days = (c) => parseLessons(docxParagraphs(path.join(CONTENT, c.slug, 'kurs.docx'))).days.length;

// ── Import pakietu od L0 ───────────────────────────────────────────────────
function importPackage(slug, folder, assetsDir) {
  const files = fs.readdirSync(folder).map((f) => path.join(folder, f));
  const pick = (re) => files.filter((f) => re.test(f));
  const dir = path.join(CONTENT, slug);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(ROOT, assetsDir);
  fs.mkdirSync(out, { recursive: true });
  const base = (f) => path.basename(f).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .toLowerCase().replace(/\(\d+\)/g, '').replace(/[^a-z0-9.]+/g, '-').replace(/-+(\.)/g, '$1').replace(/^-|-$/g, '');
  const report = [];
  const one = (re, label) => { const f = pick(re); if (f.length > 1) report.push(`UWAGA: kilka plików ${label}, biorę ${path.basename(f[0])}`); return f[0]; };
  const docx = one(/\.docx$/i, 'Word'); if (docx) { fs.copyFileSync(docx, path.join(dir, 'kurs.docx')); report.push(`Word → ${slug}/kurs.docx`); } else report.push('BRAK dokumentu Word (.docx)');
  const csv = one(/\.csv$/i, 'CSV'); if (csv) { fs.copyFileSync(csv, path.join(dir, 'fiszki.csv')); report.push(`Fiszki → ${slug}/fiszki.csv`); } else report.push('BRAK fiszek (.csv)');
  const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
  for (const f of pick(/\.(mp4|m4a|mp3|pdf|png|jpe?g|webp)$/i)) {
    let target = path.join(out, base(f));
    const size = fs.statSync(f).size;
    if (/\.(m4a|mp3)$/i.test(f) && (size > MAX_ASSET * 0.95 || /\.mp3$/i.test(f))) {
      target = target.replace(/\.(m4a|mp3)$/i, '.m4a');
      ff(['-i', f, '-vn', '-c:a', 'aac', '-b:a', '80k', '-ac', '2', '-movflags', '+faststart', target]);
      report.push(`Audio skompresowane → ${path.relative(ROOT, target)} (${(fs.statSync(target).size / 1048576).toFixed(1)} MB)`);
    } else if (/\.mp4$/i.test(f) && size > MAX_ASSET * 0.95) {
      ff(['-i', f, '-c:v', 'libx264', '-crf', '28', '-preset', 'slow', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', target]);
      report.push(`Wideo skompresowane → ${path.relative(ROOT, target)} (${(fs.statSync(target).size / 1048576).toFixed(1)} MB)`);
    } else {
      if (size > MAX_ASSET) { report.push(`ZA DUŻY (${(size / 1048576).toFixed(1)} MB > 25 MB): ${path.basename(f)} — potrzebna mniejsza wersja`); continue; }
      fs.copyFileSync(f, target);
      report.push(`Plik → ${path.relative(ROOT, target)}`);
    }
    if (/\.mp4$/i.test(f)) {
      const poster = target.replace(/\.mp4$/i, '-poster.jpg');
      ff(['-ss', '3', '-i', target, '-frames:v', '1', '-q:v', '3', poster]);
      report.push(`Plakat wideo → ${path.relative(ROOT, poster)}`);
    }
  }
  return report;
}

// ── CLI ────────────────────────────────────────────────────────────────────
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cmd, arg, folder] = process.argv.slice(2);
  try {
    if (cmd === 'build') {
      const slugs = arg === '--all' ? loadCourses().map((c) => c.slug) : [arg];
      for (const s of slugs) {
        const r = renderCourse(s);
        fs.mkdirSync(path.dirname(r.outFile), { recursive: true });
        fs.writeFileSync(r.outFile, r.html);
        console.log(`OK ${s}: ${r.days.length} lekcji, ${r.cards.length} fiszek → ${path.relative(ROOT, r.outFile)}`);
      }
    } else if (cmd === 'check') {
      let bad = 0;
      for (const c of loadCourses()) {
        const r = renderCourse(c.slug);
        const cur = fs.existsSync(r.outFile) ? fs.readFileSync(r.outFile, 'utf8') : '';
        if (cur !== r.html) { bad++; console.log(`NIEAKTUALNA: ${path.relative(ROOT, r.outFile)} — uruchom build ${c.slug}`); }
        else console.log(`OK ${c.slug}`);
      }
      process.exit(bad ? 1 : 0);
    } else if (cmd === 'register') {
      register(arg).forEach((l) => console.log(l));
    } else if (cmd === 'import') {
      if (!arg || !folder) throw new Error('Użycie: import <slug> <folder z pakietem>');
      const existing = path.join(CONTENT, arg, 'kurs.json');
      const assets = fs.existsSync(existing) ? JSON.parse(fs.readFileSync(existing, 'utf8')).assets : `/rozwiaz-problem/${arg}/assets/`;
      importPackage(arg, folder, assets).forEach((l) => console.log(l));
      if (!fs.existsSync(existing)) console.log(`\nDalej: uzupełnij ${path.relative(ROOT, existing)} (wzór: rzuc-palenie/kurs.json; assets: ${assets}), potem build ${arg}.`);
    } else {
      console.log('Użycie: import <slug> <folder> · build <slug>|--all · register <slug> · check');
      process.exit(2);
    }
  } catch (e) {
    console.error('BŁĄD:', e.message);
    process.exit(1);
  }
}
