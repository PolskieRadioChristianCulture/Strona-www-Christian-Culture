#!/usr/bin/env node
/**
 * CC DISCOVERY SIGNALS GENERATOR — ETAP 3, 4 & 5
 * Generuje kompletny zestaw map witryn XML (/sitemap.xml, /sitemaps/*.xml),
 * kanałów RSS 2.0 (/feed.xml, /news/feed.xml), aktualizację /robots.txt,
 * kolejkę IndexNow oraz rzeczywisty stan dla panelu CCN SEO CONTROL.
 *
 * Standard: CCN Global SEO & AI Search 2026 v1.0 (ZERO COST / ZERO FAKE DATA)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import {
  PRIMARY_ORIGIN,
  isIndexablePublicPath,
  toCanonicalUrl,
  validateRenderedHtmlSeo,
} from './cc-seo-engine.mjs';
import { createIndexNowQueueManager, validateIndexNowKey } from './cc-indexnow.mjs';
import { loadCourses, sitemapPath } from './rozwiaz-problem/build.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function xmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function loadArticles() {
  const articlesTs = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');
  const result = esbuild.buildSync({
    entryPoints: [articlesTs],
    bundle: true,
    format: 'cjs',
    write: false,
    platform: 'node',
    target: 'node18',
  });
  const mod = { exports: {} };
  const fn = new Function('module', 'exports', 'require', result.outputFiles[0].text);
  fn(mod, mod.exports, () => ({}));
  return mod.exports.INITIAL_ARTICLES || [];
}

function buildStandardUrlsetXml(entries, includeImages = false, includeHreflang = false) {
  const namespaces = [
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    includeImages ? 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : '',
    includeHreflang ? 'xmlns:xhtml="http://www.w3.org/1999/xhtml"' : '',
  ].filter(Boolean).join('\n        ');

  const canonicalEntries = [...new Map(entries.map(e => [e.loc, e])).values()];
  const body = canonicalEntries.map(e => {
    const lines = [
      '  <url>',
      `    <loc>${xmlEscape(e.loc)}</loc>`,
      e.lastmod ? `    <lastmod>${xmlEscape(e.lastmod)}</lastmod>` : '',
      e.changefreq ? `    <changefreq>${xmlEscape(e.changefreq)}</changefreq>` : '',
      e.priority ? `    <priority>${xmlEscape(String(e.priority))}</priority>` : '',
    ].filter(Boolean);

    if (includeImages && e.imageUrl) {
      lines.push(
        '    <image:image>',
        `      <image:loc>${xmlEscape(e.imageUrl)}</image:loc>`,
        e.imageTitle ? `      <image:title>${xmlEscape(e.imageTitle)}</image:title>` : '',
        '    </image:image>'
      );
    }

    if (includeHreflang && Array.isArray(e.alternates)) {
      for (const alt of e.alternates) {
        lines.push(`    <xhtml:link rel="alternate" hreflang="${xmlEscape(alt.hreflang)}" href="${xmlEscape(alt.href)}" />`);
      }
    }

    lines.push('  </url>');
    return lines.filter(Boolean).join('\n');
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset ${namespaces}>\n${body}\n</urlset>\n`;
}

function buildGoogleNewsSitemapXml(articles, referenceNow = new Date()) {
  const cutoffMs = referenceNow.getTime() - (2 * 24 * 60 * 60 * 1000); // Ostatnie 2 dni (48h)
  const recent = articles.filter(a => {
    const pubMs = Date.parse(a.publishedAt);
    return !Number.isNaN(pubMs) && pubMs >= cutoffMs;
  });

  const body = recent.map(a => {
    const loc = (a.primaryPortalUrl || `${PRIMARY_ORIGIN}/news/${a.slug}`);
    const pubDateIso = new Date(a.publishedAt).toISOString();
    const imgLoc = a.imageUrl.startsWith('http') ? a.imageUrl : `${PRIMARY_ORIGIN}${a.imageUrl}`;
    return [
      '  <url>',
      `    <loc>${xmlEscape(loc)}</loc>`,
      '    <news:news>',
      '      <news:publication>',
      '        <news:name>Christian Culture News (CCN)</news:name>',
      '        <news:language>pl</news:language>',
      '      </news:publication>',
      `      <news:publication_date>${xmlEscape(pubDateIso)}</news:publication_date>`,
      `      <news:title>${xmlEscape(a.title)}</news:title>`,
      '    </news:news>',
      '    <image:image>',
      `      <image:loc>${xmlEscape(imgLoc)}</image:loc>`,
      `      <image:title>${xmlEscape(a.title)}</image:title>`,
      '    </image:image>',
      '  </url>',
    ].join('\n');
  }).join('\n');

  return {
    count: recent.length,
    xml: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`,
  };
}

function buildVideoSitemapXml() {
  const videos = [
    {
      loc: `${PRIMARY_ORIGIN}/vod`,
      lastmod: '2026-10-15',
      thumbnailLoc: `${PRIMARY_ORIGIN}/images/milion-og.jpg`,
      title: 'Kino Chrześcijańskie VOD — Filmy fabularne, dokumentalne i świadectwa | Christian Culture',
      description: 'Bezpłatne kino chrześcijańskie VOD w ekosystemie Christian Culture. Oglądaj wartościowe filmy fabularne, dokumentalne, historie biblijne i wykłady.',
      contentLoc: `${PRIMARY_ORIGIN}/vod`,
    },
    {
      loc: `${PRIMARY_ORIGIN}/news/studio-dobrego-slowa-odc-26-dlaczego-sad-jest-dobra-nowina`,
      lastmod: '2026-10-02',
      thumbnailLoc: `${PRIMARY_ORIGIN}/images/news/art-sds-sad-dobra-nowina.jpg`,
      title: 'Studio Dobrego Słowa (Odc. 26): Dlaczego Sąd Boży jest Dobrą Nowiną?',
      description: 'Wykład biblijny z serii Studio Dobrego Słowa poświęcony biblijnemu znaczeniu Bożego sądu i sprawiedliwości.',
      contentLoc: `${PRIMARY_ORIGIN}/news/studio-dobrego-slowa-odc-26-dlaczego-sad-jest-dobra-nowina`,
    },
  ];

  const body = videos.map(v => [
    '  <url>',
    `    <loc>${xmlEscape(v.loc)}</loc>`,
    `    <lastmod>${xmlEscape(v.lastmod)}</lastmod>`,
    '    <video:video>',
    `      <video:thumbnail_loc>${xmlEscape(v.thumbnailLoc)}</video:thumbnail_loc>`,
    `      <video:title>${xmlEscape(v.title)}</video:title>`,
    `      <video:description>${xmlEscape(v.description)}</video:description>`,
    `      <video:player_loc>${xmlEscape(v.contentLoc)}</video:player_loc>`,
    '      <video:family_friendly>yes</video:family_friendly>',
    '    </video:video>',
    '  </url>',
  ].join('\n')).join('\n');

  return {
    count: videos.length,
    xml: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${body}\n</urlset>\n`,
  };
}

function buildRssFeedXml({ title, link, selfUrl, description, items }) {
  const nowRfc = new Date().toUTCString();
  const itemsXml = items.map(it => {
    const pubRfc = it.pubDate ? new Date(it.pubDate).toUTCString() : nowRfc;
    const imgUrl = it.imageUrl
      ? (it.imageUrl.startsWith('http') ? it.imageUrl : `${PRIMARY_ORIGIN}${it.imageUrl}`)
      : `${PRIMARY_ORIGIN}/images/milion-og.jpg`;
    return [
      '    <item>',
      `      <title>${xmlEscape(it.title)}</title>`,
      `      <link>${xmlEscape(it.link)}</link>`,
      `      <guid isPermaLink="true">${xmlEscape(it.link)}</guid>`,
      `      <pubDate>${xmlEscape(pubRfc)}</pubDate>`,
      it.author ? `      <dc:creator>${xmlEscape(it.author)}</dc:creator>` : '',
      it.category ? `      <category>${xmlEscape(it.category)}</category>` : '',
      `      <description>${xmlEscape(it.description)}</description>`,
      `      <enclosure url="${xmlEscape(imgUrl)}" type="image/jpeg" length="0" />`,
      '    </item>',
    ].filter(Boolean).join('\n');
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xmlEscape(title)}</title>
    <link>${xmlEscape(link)}</link>
    <atom:link href="${xmlEscape(selfUrl)}" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(description)}</description>
    <language>pl-PL</language>
    <lastBuildDate>${xmlEscape(nowRfc)}</lastBuildDate>
    <generator>CC SEO Engine 2026 v1.0</generator>
${itemsXml}
  </channel>
</rss>
`;
}

function buildRobotsTxt() {
  return `# 🤖 ROBOTS.TXT — CHRISTIAN CULTURE & LUMINA ECOSYSTEM
# Standard: CCN Global SEO & AI Search 2026 v1.0
# Primary Host: https://polskieradio.cc

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /mission-control/
Disallow: /config/
Disallow: /scripts/
Disallow: /windows_tools/
Disallow: /mockups/
Disallow: /api/mc/
Disallow: /lumina-login
Disallow: /lumina-profile
Disallow: /mess
Disallow: /bank-tresci
Disallow: /content-registry
Disallow: /karaoke-studio
Disallow: /*?q=*
Disallow: /*?query=*

# ── 1. AI Search & Answer Engines (AEO / GEO — Full Public Indexing) ──
# OAI-SearchBot i boty wyszukujące traktowane odrębnie od botów treningowych (Sekcja 6)
User-agent: OAI-SearchBot
Allow: /
Disallow: /admin/
Disallow: /mission-control/
Disallow: /lumina-login
Disallow: /lumina-profile
Disallow: /mess

User-agent: ChatGPT-User
Allow: /
Disallow: /admin/
Disallow: /mission-control/

User-agent: PerplexityBot
Allow: /
Disallow: /admin/
Disallow: /mission-control/

User-agent: Applebot
Allow: /
Disallow: /admin/

User-agent: Googlebot
Allow: /
Disallow: /admin/

User-agent: Googlebot-News
Allow: /news/
Allow: /sitemaps/news-google.xml

User-agent: Bingbot
Allow: /
Disallow: /admin/

# ── 2. AI Model Training Crawlers (Controlled Public Access, Zero Private Data) ──
User-agent: GPTBot
Allow: /
Disallow: /admin/
Disallow: /mission-control/
Disallow: /lumina-login
Disallow: /lumina-profile
Disallow: /mess

User-agent: ClaudeBot
Allow: /
Disallow: /admin/
Disallow: /mission-control/
Disallow: /lumina-login
Disallow: /lumina-profile
Disallow: /mess

User-agent: anthropic-ai
Allow: /
Disallow: /admin/

User-agent: Google-Extended
Allow: /
Disallow: /admin/

User-agent: Applebot-Extended
Allow: /
Disallow: /admin/

User-agent: CCBot
Allow: /
Disallow: /admin/

# ── 3. XML Sitemaps & Thematic Discovery Maps (Sekcja 5) ──
Sitemap: https://polskieradio.cc/sitemap.xml
Sitemap: https://polskieradio.cc/sitemaps/news.xml
Sitemap: https://polskieradio.cc/sitemaps/news-google.xml
Sitemap: https://polskieradio.cc/sitemaps/akademia.xml
Sitemap: https://polskieradio.cc/sitemaps/biblia.xml
Sitemap: https://polskieradio.cc/sitemaps/muzyka.xml
Sitemap: https://polskieradio.cc/sitemaps/video.xml
Sitemap: https://polskieradio.cc/sitemaps/pages.xml
Sitemap: https://polskieradio.cc/sitemaps/en.xml

# ── 4. RSS Feeds & Experimental LLM Context ──
# RSS Master: https://polskieradio.cc/feed.xml
# RSS News:   https://polskieradio.cc/news/feed.xml
# LLM Context (uzupełniający, nie zastępuje sitemap): https://polskieradio.cc/llms.txt
`;
}

export function buildAllDiscoverySignals() {
  const articles = loadArticles();
  const sitemapsDir = path.join(ROOT, 'sitemaps');
  fs.mkdirSync(sitemapsDir, { recursive: true });

  // 1. /sitemaps/news.xml (Wszystkie kanoniczne artykuły CCN News oraz główne wydanie CCN Finanse)
  const newsEntries = [
    {
      loc: `${PRIMARY_ORIGIN}/finanse/cbdc-prawo-niedzielne-apokalipsa-13`,
      lastmod: '2026-10-17',
      changefreq: 'weekly',
      priority: '0.90',
      imageUrl: `${PRIMARY_ORIGIN}/images/news/art-cbdc-prawo-niedzielne-apokalipsa-13.jpg`,
      imageTitle: 'Cyfrowy pieniądz, prawo niedzielne i Apokalipsa 13. Czy technologia może stać się narzędziem przymusu religijnego?',
    },
    ...articles.map(a => ({
      loc: (a.primaryPortalUrl || `${PRIMARY_ORIGIN}/news/${a.slug}`),
      lastmod: (a.updatedAt || a.publishedAt || '2026-10-17').slice(0, 10),
      changefreq: 'weekly',
      priority: '0.85',
      imageUrl: a.imageUrl.startsWith('http') ? a.imageUrl : `${PRIMARY_ORIGIN}${a.imageUrl}`,
      imageTitle: a.title,
    })),
  ];
  fs.writeFileSync(path.join(sitemapsDir, 'news.xml'), buildStandardUrlsetXml(newsEntries, true, false), 'utf8');

  // 2. /sitemaps/news-google.xml (Tylko artykuły z ostatnich 2 dni — 48h)
  const googleNewsResult = buildGoogleNewsSitemapXml(articles, new Date('2026-10-17T12:00:00Z'));
  fs.writeFileSync(path.join(sitemapsDir, 'news-google.xml'), googleNewsResult.xml, 'utf8');

  // 3. /sitemaps/akademia.xml
  const akademiaEntries = [
    { loc: `${PRIMARY_ORIGIN}/akademia`, lastmod: '2026-11-01', changefreq: 'daily', priority: '0.95' },
    { loc: `${PRIMARY_ORIGIN}/akademia/kurscodzienny`, lastmod: '2026-11-01', changefreq: 'daily', priority: '0.95' },
  ];
  const akademiaDailyDir = path.join(ROOT, 'akademia/kurscodzienny');
  if (fs.existsSync(akademiaDailyDir)) {
    const dayFiles = fs.readdirSync(akademiaDailyDir).filter(f => /^dzien-\d+\.html$/.test(f));
    dayFiles.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0], 10);
      const numB = parseInt(b.match(/\d+/)[0], 10);
      return numA - numB;
    });
    for (const f of dayFiles) {
      const dNum = parseInt(f.match(/\d+/)[0], 10);
      const dPad = String(dNum).padStart(2, '0');
      const dayDate = dNum <= 31 ? `2026-10-${String(dNum).padStart(2, '0')}` : `2026-11-${String(dNum - 31).padStart(2, '0')}`;
      akademiaEntries.push({
        loc: `${PRIMARY_ORIGIN}/akademia/kurscodzienny/dzien-${dPad}`,
        lastmod: dayDate,
        changefreq: 'monthly',
        priority: '0.85',
      });
    }
  }
  for (let l = 1; l <= 29; l++) {
    const pad = String(l).padStart(2, '0');
    if (fs.existsSync(path.join(ROOT, 'akademia/apokalipsa', `lekcja-${pad}.html`))) {
      akademiaEntries.push({
        loc: `${PRIMARY_ORIGIN}/akademia/apokalipsa/lekcja-${pad}`,
        lastmod: '2026-10-02',
        changefreq: 'monthly',
        priority: '0.80',
      });
    }
  }
  fs.writeFileSync(path.join(sitemapsDir, 'akademia.xml'), buildStandardUrlsetXml(akademiaEntries), 'utf8');

  // 4. /sitemaps/biblia.xml
  const bibliaEntries = [
    { loc: `${PRIMARY_ORIGIN}/mojabiblia`, lastmod: '2026-10-15', changefreq: 'weekly', priority: '0.95' },
    { loc: `${PRIMARY_ORIGIN}/biblia`, lastmod: '2026-10-15', changefreq: 'weekly', priority: '0.90' },
    { loc: `${PRIMARY_ORIGIN}/biblia/czy-jezus-naprawde-byl-bogiem-biblijne-dowody`, lastmod: '2026-11-14', changefreq: 'monthly', priority: '0.90' },
    { loc: `${PRIMARY_ORIGIN}/biblia/co-z-tym-michalem-czy-archaniol-michal-to-jezus-chrystus`, lastmod: '2026-11-13', changefreq: 'monthly', priority: '0.90' },
    { loc: `${PRIMARY_ORIGIN}/biblia/czy-jezus-istnial-dowody-historyczne`, lastmod: '2026-10-15', changefreq: 'monthly', priority: '0.85' },
    { loc: `${PRIMARY_ORIGIN}/biblia-do-pobrania`, lastmod: '2026-10-15', changefreq: 'monthly', priority: '0.85' },
    { loc: `${PRIMARY_ORIGIN}/apologetyka`, lastmod: '2026-11-14', changefreq: 'weekly', priority: '0.85' },
  ];
  fs.writeFileSync(path.join(sitemapsDir, 'biblia.xml'), buildStandardUrlsetXml(bibliaEntries), 'utf8');

  // 5. /sitemaps/muzyka.xml
  const muzykaEntries = [
    { loc: `${PRIMARY_ORIGIN}/BiblijneUwielbienie`, lastmod: '2026-10-17', changefreq: 'daily', priority: '0.95' },
    { loc: `${PRIMARY_ORIGIN}/player`, lastmod: '2026-10-15', changefreq: 'daily', priority: '0.95' },
    { loc: `${PRIMARY_ORIGIN}/music`, lastmod: '2026-10-15', changefreq: 'weekly', priority: '0.90' },
    { loc: `${PRIMARY_ORIGIN}/music/premiery`, lastmod: '2026-10-15', changefreq: 'weekly', priority: '0.80' },
    { loc: `${PRIMARY_ORIGIN}/music/artysci`, lastmod: '2026-10-15', changefreq: 'weekly', priority: '0.80' },
    { loc: `${PRIMARY_ORIGIN}/music/playlisty`, lastmod: '2026-10-15', changefreq: 'weekly', priority: '0.80' },
    { loc: `${PRIMARY_ORIGIN}/music/radio`, lastmod: '2026-10-15', changefreq: 'weekly', priority: '0.80' },
    { loc: `${PRIMARY_ORIGIN}/music/video`, lastmod: '2026-10-15', changefreq: 'weekly', priority: '0.80' },
    { loc: `${PRIMARY_ORIGIN}/music/top`, lastmod: '2026-10-15', changefreq: 'daily', priority: '0.85' },
  ];
  fs.writeFileSync(path.join(sitemapsDir, 'muzyka.xml'), buildStandardUrlsetXml(muzykaEntries), 'utf8');

  // 6. /sitemaps/video.xml
  const videoResult = buildVideoSitemapXml();
  fs.writeFileSync(path.join(sitemapsDir, 'video.xml'), videoResult.xml, 'utf8');

  // 7. /sitemaps/pages.xml
  const corePaths = [
    { path: '/the-journal', lastmod: '2026-11-04', priority: '0.80', changefreq: 'monthly' },
    { path: '/', lastmod: '2026-10-17', priority: '1.0', changefreq: 'daily' },
    { path: '/szukaj', lastmod: '2026-10-15', priority: '0.95', changefreq: 'daily' },
    { path: '/wyszukiwarka', lastmod: '2026-11-02', priority: '0.95', changefreq: 'daily' },
    { path: '/player', lastmod: '2026-11-02', priority: '0.90', changefreq: 'daily' },
    { path: '/modlitwa', lastmod: '2026-11-02', priority: '0.85', changefreq: 'weekly' },
    { path: '/o-nas', lastmod: '2026-10-15', priority: '0.90', changefreq: 'monthly' },
    { path: '/polityka-redakcyjna', lastmod: '2026-10-17', priority: '0.85', changefreq: 'monthly' },
    { path: '/news', lastmod: '2026-10-17', priority: '0.95', changefreq: 'hourly' },
    { path: '/finanse', lastmod: '2026-10-17', priority: '0.90', changefreq: 'daily' },
    { path: '/lumina', lastmod: '2026-10-15', priority: '0.90', changefreq: 'daily' },
    { path: '/lumina-tablica', lastmod: '2026-10-15', priority: '0.90', changefreq: 'hourly' },
    { path: '/mapa', lastmod: '2026-10-15', priority: '0.90', changefreq: 'weekly' },
    { path: '/index', lastmod: '2026-10-15', priority: '0.90', changefreq: 'daily' },
    { path: '/wspieraj', lastmod: '2026-10-15', priority: '0.85', changefreq: 'monthly' },
    { path: '/wspolpraca', lastmod: '2026-10-15', priority: '0.80', changefreq: 'monthly' },
    { path: '/milion', lastmod: '2026-10-15', priority: '0.85', changefreq: 'weekly' },
    { path: '/kod', lastmod: '2026-10-15', priority: '0.85', changefreq: 'monthly' },
    { path: '/pokonac-goliata', lastmod: '2026-10-15', priority: '0.85', changefreq: 'monthly' },
    { path: '/projektant', lastmod: '2026-10-15', priority: '0.80', changefreq: 'monthly' },
    { path: '/nauka', lastmod: '2026-10-15', priority: '0.85', changefreq: 'daily' },
    { path: '/historia', lastmod: '2026-10-15', priority: '0.85', changefreq: 'daily' },
    { path: '/biologia', lastmod: '2026-10-15', priority: '0.85', changefreq: 'daily' },
    { path: '/prawo', lastmod: '2026-10-15', priority: '0.85', changefreq: 'daily' },
    { path: '/seks', lastmod: '2026-10-15', priority: '0.85', changefreq: 'daily' },
    { path: '/rodzina', lastmod: '2026-10-17', priority: '0.85', changefreq: 'daily' },
    { path: '/edukacja', lastmod: '2026-10-17', priority: '0.85', changefreq: 'daily' },
    { path: '/kultura', lastmod: '2026-10-15', priority: '0.85', changefreq: 'daily' },
    { path: '/psychologia', lastmod: '2026-10-15', priority: '0.85', changefreq: 'daily' },
    { path: '/dzieci', lastmod: '2026-10-15', priority: '0.85', changefreq: 'daily' },
    { path: '/wychowanie', lastmod: '2026-10-15', priority: '0.85', changefreq: 'daily' },
    { path: '/misje', lastmod: '2026-10-17', priority: '0.85', changefreq: 'daily' },
    { path: '/spoleczenstwo', lastmod: '2026-10-17', priority: '0.85', changefreq: 'daily' },
    { path: '/si', lastmod: '2026-10-15', priority: '0.85', changefreq: 'daily' },
    { path: '/biznes', lastmod: '2026-10-15', priority: '0.85', changefreq: 'daily' },
    { path: '/lumina.cezaryrgowski.html', lastmod: '2026-10-15', priority: '0.85', changefreq: 'weekly' },
    { path: '/lumina.wiolettarogowska.html', lastmod: '2026-10-15', priority: '0.85', changefreq: 'weekly' },
    // Kursy serii Rozwiąż problem — z scripts/content/rozwiaz-problem/*/kurs.json
    ...loadCourses().map(sitemapPath),
  ];
  const pagesEntries = corePaths.map(p => ({
    loc: `${PRIMARY_ORIGIN}${p.path}`,
    lastmod: p.lastmod,
    changefreq: p.changefreq,
    priority: p.priority,
  }));
  fs.writeFileSync(path.join(sitemapsDir, 'pages.xml'), buildStandardUrlsetXml(pagesEntries), 'utf8');

  // 8. /sitemaps/en.xml (Dwustronny hreflang PL <-> EN)
  const enEntries = [
    {
      loc: `${PRIMARY_ORIGIN}/Global/`,
      lastmod: '2026-10-15',
      changefreq: 'weekly',
      priority: '0.90',
      alternates: [
        { hreflang: 'en', href: `${PRIMARY_ORIGIN}/Global/` },
        { hreflang: 'pl', href: `${PRIMARY_ORIGIN}/` },
        { hreflang: 'x-default', href: `${PRIMARY_ORIGIN}/` },
      ],
    },
  ];
  fs.writeFileSync(path.join(sitemapsDir, 'en.xml'), buildStandardUrlsetXml(enEntries, false, true), 'utf8');

  // 9. /news/feed.xml (RSS 2.0 dla CCN News)
  const sortedArticles = [...articles].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const newsRssItems = sortedArticles.slice(0, 30).map(a => ({
    title: a.title,
    link: (a.primaryPortalUrl || `${PRIMARY_ORIGIN}/news/${a.slug}`),
    pubDate: a.publishedAt,
    author: a.author?.name || 'Redakcja Christian Culture',
    category: a.categoryLabel || 'Wiadomości',
    description: a.excerpt,
    imageUrl: a.imageUrl,
  }));
  const newsFeedXml = buildRssFeedXml({
    title: 'CCN News — Christian Culture Network',
    link: `${PRIMARY_ORIGIN}/news`,
    selfUrl: `${PRIMARY_ORIGIN}/news/feed.xml`,
    description: 'Najnowsze wiadomości, analizy społeczne, nauka, edukacja i refleksja biblijna w ekosystemie Christian Culture.',
    items: newsRssItems,
  });
  fs.mkdirSync(path.join(ROOT, 'news'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'news/feed.xml'), newsFeedXml, 'utf8');

  // 10. /feed.xml (Główny kanał RSS 2.0 ekosystemu Christian Culture)
  const masterRssItems = [
    {
      title: 'Cyfrowy pieniądz, prawo niedzielne i Apokalipsa 13. Czy technologia może stać się narzędziem przymusu religijnego?',
      link: `${PRIMARY_ORIGIN}/finanse/cbdc-prawo-niedzielne-apokalipsa-13`,
      pubDate: '2026-10-15T10:00:00Z',
      author: 'Cezary Rogowski',
      category: 'CCN Finanse',
      description: 'Dyskusja o cyfrowych walutach banków centralnych (CBDC) coraz częściej wykracza poza ekonomię. Analiza CBDC, prawa niedzielnego oraz Apokalipsy 13 (z wydaniem audio 17:51).',
      imageUrl: '/images/news/art-cbdc-prawo-niedzielne-apokalipsa-13.jpg',
    },
    ...newsRssItems.slice(0, 20),
    {
      title: 'Z Biblią za Pan Brat — Dzień 17: Wiara patrząca w przyszłość (Rdz 23–24)',
      link: `${PRIMARY_ORIGIN}/akademia/dzien-17`,
      pubDate: '2026-10-17T04:00:00Z',
      author: 'Cezary Rogowski',
      category: 'Akademia Biblijna',
      description: 'Codzienna lekcja biblijna kursu „Z Biblią za Pan Brat”: Grota Machpela, spotkanie przy studni i decyzja Rebeki (Księga Rodzaju 23–24).',
      imageUrl: '/images/kurs/kc_day_17_machpela_rebeka.jpg',
    },
    {
      title: 'Biblijne Uwielbienie — Śpiewane Słowo Boże (1189 rozdziałów UBG 2025 & Karaoke Sync 2.0)',
      link: `${PRIMARY_ORIGIN}/BiblijneUwielbienie`,
      pubDate: '2026-10-16T12:00:00Z',
      author: 'Cezary Rogowski',
      category: 'Muzyka i Uwielbienie',
      description: 'Portal muzyki biblijnej z synchronizacją słowo-po-słowie i pełnym tekstem Pisma Świętego UBG 2025.',
      imageUrl: '/images/milion-og.jpg',
    },
  ];
  const masterFeedXml = buildRssFeedXml({
    title: 'Christian Culture — Wszystko, czego potrzebujesz, w jednym miejscu',
    link: `${PRIMARY_ORIGIN}/`,
    selfUrl: `${PRIMARY_ORIGIN}/feed.xml`,
    description: 'Główny kanał publikacji ekosystemu Christian Culture: CCN News, Akademia Biblijna, Biblijne Uwielbienie, Radio i Kino VOD.',
    items: masterRssItems,
  });
  fs.writeFileSync(path.join(ROOT, 'feed.xml'), masterFeedXml, 'utf8');

  // 11. /robots.txt
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), buildRobotsTxt(), 'utf8');

  // 12. Walidacja SEO wszystkich wygenerowanych artykułów CCN + głównych portali
  const validationResults = [];
  for (const a of articles) {
    const fileRel = `news/${a.slug}.html`;
    const full = path.join(ROOT, fileRel);
    if (fs.existsSync(full)) {
      const html = fs.readFileSync(full, 'utf8');
      const expectedCanon = (a.primaryPortalUrl || `${PRIMARY_ORIGIN}/news/${a.slug}`);
      const check = validateRenderedHtmlSeo(html, expectedCanon);
      validationResults.push({
        file: fileRel,
        canonicalUrl: expectedCanon,
        section: 'news',
        valid: check.valid,
        errors: check.errors,
        warnings: check.warnings,
      });
    }
  }
  const finanseCbdcFile = 'finanse/cbdc-prawo-niedzielne-apokalipsa-13.html';
  if (fs.existsSync(path.join(ROOT, finanseCbdcFile))) {
    const html = fs.readFileSync(path.join(ROOT, finanseCbdcFile), 'utf8');
    const expectedCanon = `${PRIMARY_ORIGIN}/finanse/cbdc-prawo-niedzielne-apokalipsa-13`;
    const check = validateRenderedHtmlSeo(html, expectedCanon);
    validationResults.push({
      file: finanseCbdcFile,
      canonicalUrl: expectedCanon,
      section: 'finanse',
      valid: check.valid,
      errors: check.errors,
      warnings: check.warnings,
    });
  }
  for (const coreFile of ['index.html', 'szukaj.html', 'o-nas.html', 'news.html', 'finanse.html', 'edukacja.html']) {
    const full = path.join(ROOT, coreFile);
    if (fs.existsSync(full)) {
      const html = fs.readFileSync(full, 'utf8');
      const check = validateRenderedHtmlSeo(html);
      validationResults.push({
        file: coreFile,
        canonicalUrl: check.extracted.canonical,
        section: 'pages',
        valid: check.valid,
        errors: check.errors,
        warnings: check.warnings,
      });
    }
  }

  // 13. Kolejka IndexNow dla najnowszych artykułów i stron
  const queueManager = createIndexNowQueueManager();
  const candidatesForQueue = [
    { url: `${PRIMARY_ORIGIN}/finanse/cbdc-prawo-niedzielne-apokalipsa-13`, section: 'finanse', publishedAt: '2026-10-17T11:00:00Z' },
    { url: `${PRIMARY_ORIGIN}/finanse`, section: 'finanse', publishedAt: '2026-10-17T11:00:00Z' },
    ...articles.slice(0, 10).map(a => ({
      url: (a.primaryPortalUrl || `${PRIMARY_ORIGIN}/news/${a.slug}`),
      section: 'news',
      publishedAt: a.publishedAt,
    })),
    { url: `${PRIMARY_ORIGIN}/edukacja/tragedia-szkola-wyszkow-przemoc-biblia`, section: 'edukacja', publishedAt: '2026-10-17T08:15:00Z' },
    { url: `${PRIMARY_ORIGIN}/rodzina/tragedia-szkola-wyszkow-przemoc-biblia`, section: 'rodzina', publishedAt: '2026-10-17T08:15:00Z' },
    { url: `${PRIMARY_ORIGIN}/misje/wojna-ukraina-jezus-pokoj-znaki-czasow`, section: 'misje', publishedAt: '2026-10-17T08:00:00Z' },
    { url: `${PRIMARY_ORIGIN}/spoleczenstwo/wojna-ukraina-jezus-pokoj-znaki-czasow`, section: 'spoleczenstwo', publishedAt: '2026-10-17T08:00:00Z' },
    { url: `${PRIMARY_ORIGIN}/akademia/dzien-17`, section: 'akademia', publishedAt: '2026-10-17T04:00:00Z' },
  ];
  queueManager.enqueue(candidatesForQueue);
  const queueState = queueManager.getState();
  const keyStatus = validateIndexNowKey(process.env.INDEXNOW_KEY);

  // 14. Zapis rzeczywistego stanu dla panelu CCN SEO CONTROL (data/cc-seo-control-state.json)
  const targetFiles = [
    'robots.txt',
    'sitemap.xml',
    'feed.xml',
    'news/feed.xml',
    'sitemaps/news.xml',
    'sitemaps/news-google.xml',
    'sitemaps/akademia.xml',
    'sitemaps/biblia.xml',
    'sitemaps/muzyka.xml',
    'sitemaps/video.xml',
    'sitemaps/pages.xml',
    'sitemaps/en.xml',
  ];

  const discoveryInventory = targetFiles.map(rel => {
    const full = path.join(ROOT, rel);
    const exists = fs.existsSync(full);
    return {
      path: `/${rel}`,
      exists,
      sizeBytes: exists ? fs.statSync(full).size : 0,
      status: exists ? 'OK' : 'MISSING',
    };
  });

  const failedValidations = validationResults.filter(v => !v.valid);

  const seoControlState = {
    standardVersion: 'CCN Global SEO & AI Search 2026 v1.0',
    generatedAt: new Date().toISOString(),
    zeroFakeDataPolicy: true,
    counts: {
      totalValidatedUrls: validationResults.length,
      validUrls: validationResults.filter(v => v.valid).length,
      invalidUrls: failedValidations.length,
      newsArticlesCount: newsEntries.length,
      googleNews48hCount: googleNewsResult.count,
      akademiaUrlsCount: akademiaEntries.length,
      bibliaUrlsCount: bibliaEntries.length,
      muzykaUrlsCount: muzykaEntries.length,
      videoUrlsCount: videoResult.count,
      pagesUrlsCount: pagesEntries.length,
      enUrlsCount: enEntries.length,
    },
    discoveryFiles: discoveryInventory,
    indexNow: {
      keyConfigured: keyStatus.valid,
      keyNote: keyStatus.valid ? `Skonfigurowany (${keyStatus.maskedKey})` : keyStatus.reason,
      totalQueued: queueState.totalItems,
      pendingCount: queueState.pendingCount,
      submittedCount: queueState.submittedCount,
      failedCount: queueState.failedCount,
      recentItems: queueState.items.slice(0, 15),
    },
    externalWebmasterTools: {
      googleSearchConsole: {
        connected: false,
        status: 'AWAITING_OWNER_API_CREDENTIALS',
        note: 'Brak podpiętego klucza Search Console API — zgodnie z Sekcją 9 brak danych nie jest zastępowany fikcyjnymi licznikami.',
      },
      bingWebmasterTools: {
        connected: false,
        status: 'AWAITING_OWNER_API_CREDENTIALS',
        note: 'Brak podpiętego klucza Bing Webmaster API — kolejka IndexNow gotowa do wysyłki po ustawieniu INDEXNOW_KEY.',
      },
    },
    alerts: failedValidations.map(f => ({
      severity: 'ERROR',
      file: f.file,
      url: f.canonicalUrl,
      messages: f.errors,
    })),
    sampleValidatedPages: validationResults.slice(0, 25),
  };

  fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'data/cc-seo-control-state.json'), JSON.stringify(seoControlState, null, 2), 'utf8');

  return seoControlState;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const state = buildAllDiscoverySignals();
  console.log(JSON.stringify({
    status: 'OK',
    counts: state.counts,
    discoveryFilesOk: state.discoveryFiles.every(f => f.exists && f.sizeBytes > 0),
    alertsCount: state.alerts.length,
  }, null, 2));
}
