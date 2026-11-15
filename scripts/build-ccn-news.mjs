import { spawnSync } from 'node:child_process';
import { readdir, readFile, writeFile, copyFile, mkdir, symlink } from 'node:fs/promises';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { buildCcnStaticPages, loadArticles, generateStaticFeedSnippet } from './build-ccn-static-pages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'portals/ccn-news');
const result = spawnSync(process.execPath, [path.join(source, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: source, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
for (const file of await readdir(path.join(source, 'dist/assets'))) {
  await copyFile(path.join(source, 'dist/assets', file), path.join(root, 'assets', file));
  spawnSync('git', ['add', path.join(root, 'assets', file)], { cwd: root });
}
const { articles } = loadArticles();
const feedSnippet = generateStaticFeedSnippet(articles, 15);
let html = (await readFile(path.join(source, 'dist/index.html'), 'utf8')).replace(/\r\n/g, '\n').replace(/[\t ]+$/gm, '');
html = html.replace(
  '<script type="module" crossorigin src="/assets/news-index-',
  '<script type="module" crossorigin onerror="var m=document.getElementById(\'news-startup-message\'),h=document.getElementById(\'news-startup-help\');if(m&&h){m.textContent=\'Wystąpił problem z pobraniem aplikacji. Wyświetlamy wersję statyczną wiadomości.\';h.hidden=false;}" src="/assets/news-index-'
);
html = html.replace(
  '<noscript><p class="news-startup-help">Włącz JavaScript w przeglądarce, aby wyświetlić wiadomości.</p></noscript>',
  `<noscript>\n        <section class="news-noscript-feed" aria-label="Wydanie bieżące wiadomości CCN">\n${feedSnippet}\n        </section>\n      </noscript>`
);
html = html.replace(
  '<span class="news-startup-status" role="status">Wczytywanie wiadomości</span>',
  '<span class="news-startup-status" role="status">Najnowsze Wiadomości CCN News</span>\n' + feedSnippet
);
await writeFile(path.join(root, 'news.html'), html);
await writeFile(path.join(root, 'news/index.html'), html);
await copyFile(path.join(source, 'public/data/ccn-public-feed.json'), path.join(root, 'data/ccn-public-feed.json'));
console.log('CCN News: canonical source built; both public entrypoints updated.');

const finanseSource = path.join(root, 'portals/ccn-finanse');
if (fs.existsSync(finanseSource)) {
  const finanseNodeModules = path.join(finanseSource, 'node_modules');
  if (!fs.existsSync(finanseNodeModules)) {
    await symlink(path.join(source, 'node_modules'), finanseNodeModules, 'junction');
  }
  const finResult = spawnSync(process.execPath, [path.join(source, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: finanseSource, stdio: 'inherit' });
  if (finResult.status !== 0) process.exit(finResult.status || 1);
  for (const file of await readdir(path.join(finanseSource, 'dist/assets'))) {
    await copyFile(path.join(finanseSource, 'dist/assets', file), path.join(root, 'assets', file));
    spawnSync('git', ['add', path.join(root, 'assets', file)], { cwd: root });
  }
  let finHtml = (await readFile(path.join(finanseSource, 'dist/index.html'), 'utf8')).replace(/\r\n/g, '\n').replace(/[\t ]+$/gm, '');
  finHtml = finHtml.replace(
    '<script type="module" crossorigin src="/assets/finanse-index-',
    '<script type="module" crossorigin onerror="var m=document.getElementById(\'finanse-startup-message\');if(m){m.textContent=\'Wystąpił problem z siecią. Wyświetlamy wersję tekstową artykułów.\';}" src="/assets/finanse-index-'
  );
  const { articles: finArticles } = loadArticles(path.join(finanseSource, 'src/data/articles.ts'));
  const finFeedSnippet = generateStaticFeedSnippet(finArticles, 10, {
    baseSlug: 'finanse',
    portalName: 'CCN Finanse',
    headingTitle: 'Wydanie Bieżące CCN Finanse'
  });
  finHtml = finHtml.replace(
    '</noscript>\n      </div>',
    '</noscript>\n      </div>\n' + finFeedSnippet
  );
  await mkdir(path.join(root, 'finanse'), { recursive: true });
  await writeFile(path.join(root, 'finanse.html'), finHtml);
  await writeFile(path.join(root, 'finanse/index.html'), finHtml);
  console.log('CCN Finanse: canonical source built with static feed; finanse.html and finanse/index.html updated.');
}

// ═══════════════════════════════════════════════════════════════════════════
// ETAP B/C: Pre-render statycznych feedów dla portali tematycznych
// (/nauka, /historia, /prawo) na podstawie kanonicznej bazy portals_data.cjs
// ═══════════════════════════════════════════════════════════════════════════
const portalsModule = (await import('./portals_data.cjs')).default || (await import('./portals_data.cjs'));
const { PORTALS } = portalsModule;

const thematicPortals = [
  {
    name: 'nauka',
    label: 'CCN Nauka',
    heading: 'Opracowania i Analizy CCN Nauka & Kosmologia',
    htmlFile: 'nauka.html',
    title: 'CCN Nauka – Kosmologia, Fizyka, Socjologia a Biblia | Christian Culture',
    description: 'Nauka poświadcza prawdę Biblii. Kosmologiczne dostrojenie wszechświata (Fine-Tuning), twierdzenie BGV, creatio ex nihilo oraz socjopatologie współczesnego świata w świetle chrześcijańskiej etyki i obiektywnej moralności.'
  },
  {
    name: 'historia',
    label: 'CCN Historia',
    heading: 'Opracowania i Badania CCN Historia & Archeologia',
    htmlFile: 'historia.html',
    title: 'CCN Historia – Rzetelność Historyczna i Archeologia Biblijna | Christian Culture',
    description: 'Archeologia i historia poświadczają rzetelność Pisma Świętego. Zwoje z Qumran, stela z Tel Dan, pieczęcie królów Judy, tunel Ezechiasza i rzetelność rękopisów Nowego Testamentu.'
  },
  {
    name: 'prawo',
    label: 'CCN Prawo',
    heading: 'Analizy i Przeglądy CCN Prawo & Sprawiedliwość',
    htmlFile: 'prawo.html',
    title: 'CCN Prawo – Prawo a Biblia, Dekalog i Źródła Sprawiedliwości | Christian Culture',
    description: 'Biblijne korzenie zachodniej praworządności. Dekalog jako fundament konstytucjonalizmu, równość wobec prawa, bezstronność sądów, prawa naturalne i etyka państwa w świetle Pisma Świętego.'
  }
];

for (const portal of thematicPortals) {
  const portalPath = path.join(root, portal.htmlFile);
  if (fs.existsSync(portalPath)) {
    let rawHtml = (await readFile(portalPath, 'utf8')).replace(/\r\n/g, '\n');
    const portalConfig = PORTALS.find(p => p.id === portal.name);
    const matchedArticles = portalConfig ? portalConfig.articles : [];

    // Ensure RSS feeds and Schema.org metadata are present in <head>
    if (!rawHtml.includes('type="application/rss+xml"')) {
      const rssTags = `    <link rel="alternate" type="application/rss+xml" title="Christian Culture — Kanał Główny RSS" href="https://polskieradio.cc/feed.xml" />\n    <link rel="alternate" type="application/rss+xml" title="CCN News — Christian Culture RSS" href="https://polskieradio.cc/news/feed.xml" />\n`;
      rawHtml = rawHtml.replace(`<link rel="canonical" href="https://polskieradio.cc/${portal.name}" />\n`, `<link rel="canonical" href="https://polskieradio.cc/${portal.name}" />\n${rssTags}`);
    }

    if (!rawHtml.includes('application/ld+json')) {
      const schemaLd = `
    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": "https://polskieradio.cc/${portal.name}#webpage",
          "name": ${JSON.stringify(portal.title)},
          "description": ${JSON.stringify(portal.description)},
          "url": "https://polskieradio.cc/${portal.name}",
          "inLanguage": "pl-PL",
          "isPartOf": {
            "@id": "https://polskieradio.cc/#website"
          }
        },
        {
          "@type": "NewsMediaOrganization",
          "@id": "https://polskieradio.cc/#organization",
          "name": "CCN – Christian Culture News Network",
          "url": "https://polskieradio.cc/news",
          "publishingPrinciples": "https://polskieradio.cc/polityka-redakcyjna",
          "correctionsPolicy": "https://polskieradio.cc/polityka-redakcyjna#korekty"
        }
      ]
    }
    </script>
`;
      rawHtml = rawHtml.replace('</head>', `${schemaLd}  </head>`);
    }

    const feedSnippet = generateStaticFeedSnippet(matchedArticles, 15, {
      baseSlug: portal.name,
      portalName: portal.label,
      headingTitle: portal.heading
    });

    // Remove any previously injected static feed snippet inside #root
    rawHtml = rawHtml.replace(/<main class="news-startup-articles"[\s\S]*?<\/main>/g, '');

    // Inject snippet right after the startup card inside #root
    rawHtml = rawHtml.replace(
      '</noscript>\n      </div>',
      '</noscript>\n      </div>\n' + feedSnippet
    );

    await writeFile(portalPath, rawHtml);
    await mkdir(path.join(root, portal.name), { recursive: true });
    await writeFile(path.join(root, portal.name, 'index.html'), rawHtml);
    console.log(`CCN Thematic (${portal.name}): pre-rendered static feed injected with ${matchedArticles.length} canonical articles.`);
  }
}

await buildCcnStaticPages();
const searchBuild = spawnSync(process.execPath, [path.join(root, 'scripts/build-search-index.mjs'), '--no-mirror'], { cwd: root, stdio: 'inherit' });
if (searchBuild.status !== 0) process.exit(searchBuild.status || 1);
console.log('CCN News & Thematic Portals: static article pages (SSG) generated successfully.');

