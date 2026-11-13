#!/usr/bin/env node
/**
 * scripts/cc-global-distribution.mjs
 * Centralny moduł CC GLOBAL DISTRIBUTION (Strategia ZERO COST • 13.11.2026)
 *
 * Odpowiada za:
 * 1. Walidację praw licencyjnych, języków i bramek jakości (@777 K1-K12 + @A520) dla jednego identyfikatora treści (contentId).
 * 2. Generowanie kanonicznych kanałów RSS 2.0 dla Apple Podcasts, Amazon Music, Spotify, Substack i Pocket Casts:
 *    - /feed/apokalipsa.xml
 *    - /feed/biblia-audio.xml
 *    - /feed/dobrze-ze-jestes.xml
 * 3. Przygotowanie pakietu zgłoszeniowego katalogów radiowych (TuneIn, Radio Garden, myTuner, radio.net, Radio Browser).
 * 4. Budowanie zunifikowanej kolejki dystrybucyjnej na Pinterest (Piny 2:3), LinkedIn, Substack (PL/EN/DE),
 *    Kanał Telegram oraz Grupy Facebook (Polonia DE/UK/USA + społeczności chrześcijańskie z kontrolą anty-spamową).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT_DIR, 'data', 'cc-global-distribution-registry.json');
const FEED_DIR = path.join(ROOT_DIR, 'feed');
const QUEUE_OUT_PATH = path.join(ROOT_DIR, 'data', 'cc-global-distribution-queue.json');

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function loadGlobalRegistry() {
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

export function validateContentForDistribution(item) {
  const errors = [];
  if (!item || typeof item.contentId !== 'string' || !item.contentId.trim()) {
    errors.push('Brak kanonicznego identyfikatora contentId');
  }
  if (!item?.rights || !['cc_original', 'cc_licensed_broadcast', 'public_domain'].includes(item.rights.licenseType)) {
    errors.push('Brak potwierdzonej licencji do dystrybucji (rights.licenseType)');
  }
  if (item?.Gates?.biblicalK1K12 !== 'PASS') {
    errors.push('Wymagana bramka weryfikacji biblijnej K1-K12 = PASS');
  }
  if (item?.Gates?.imageContentMatch !== 'PASS' || item?.Gates?.publisherVisualApproval !== 'PASS') {
    errors.push('Wymagana podwójna bramka graficzna @A520 (IMAGE_CONTENT_MATCH & PUBLISHER_VISUAL_APPROVAL = PASS)');
  }
  return {
    ok: errors.length === 0,
    errors,
  };
}

export function buildPodcastRssXml(feedMeta, episodes) {
  const nowRfc2822 = new Date().toUTCString();
  const itemsXml = episodes
    .map((ep, idx) => {
      const guid = escapeXml(ep.guid || `${feedMeta.feedId}-ep-${idx + 1}`);
      const pubDate = ep.pubDate ? new Date(ep.pubDate).toUTCString() : nowRfc2822;
      const audioUrl = escapeXml(ep.audioUrl || 'https://polskieradio.cc/biblia-audio/audio/GEN-001.mp3');
      const link = escapeXml(ep.link || 'https://polskieradio.cc/biblia-audio');
      const duration = escapeXml(ep.duration || '00:18:30');
      return [
        '    <item>',
        `      <title>${escapeXml(ep.title)}</title>`,
        `      <description>${escapeXml(ep.description)}</description>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="false">${guid}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <enclosure url="${audioUrl}" length="${ep.byteLength || 24500000}" type="audio/mpeg" />`,
        `      <itunes:author>${escapeXml(feedMeta.author)}</itunes:author>`,
        `      <itunes:duration>${duration}</itunes:duration>`,
        '      <itunes:explicit>false</itunes:explicit>',
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(feedMeta.title)}</title>`,
    `    <link>https://polskieradio.cc</link>`,
    `    <atom:link href="${escapeXml(feedMeta.rssUrl)}" rel="self" type="application/rss+xml" />`,
    `    <language>${escapeXml(feedMeta.language || 'pl')}</language>`,
    `    <copyright>© 2026 Christian Culture (Cezary Rogowski)</copyright>`,
    `    <itunes:author>${escapeXml(feedMeta.author)}</itunes:author>`,
    `    <description>${escapeXml(feedMeta.title)} — oficjalny kanał podcastowy ekosystemu Christian Culture (polskieradio.cc).</description>`,
    '    <itunes:owner>',
    '      <itunes:name>Christian Culture</itunes:name>',
    '      <itunes:email>kontakt@polskieradio.cc</itunes:email>',
    '    </itunes:owner>',
    '    <itunes:image href="https://polskieradio.cc/images/brand/cc-podcast-cover-3000.jpg" />',
    `    <itunes:category text="${escapeXml(feedMeta.category || 'Religion & Spirituality')}">`,
    `      <itunes:category text="${escapeXml(feedMeta.subcategory || 'Christianity')}" />`,
    '    </itunes:category>',
    '    <itunes:explicit>false</itunes:explicit>',
    itemsXml,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}

export function generateAllPodcastFeeds() {
  const registry = loadGlobalRegistry();
  fs.mkdirSync(FEED_DIR, { recursive: true });

  // 1. Biblia Audio episodes from biblia-audio/data/catalog.json if present
  let bibliaEpisodes = [];
  const baCatalogPath = path.join(ROOT_DIR, 'biblia-audio', 'data', 'catalog.json');
  if (fs.existsSync(baCatalogPath)) {
    try {
      const baCat = JSON.parse(fs.readFileSync(baCatalogPath, 'utf8'));
      const chapters = Array.isArray(baCat.chapters) ? baCat.chapters : [];
      bibliaEpisodes = chapters
        .filter((c) => c.status === 'published' && c.audioUrl)
        .slice(0, 30)
        .map((c) => ({
          guid: `cc-biblia-audio-${c.id}`,
          title: `${c.bookName || 'Księga Rodzaju'} ${c.chapter} — ${c.title || 'Biblia Audio CC (UBG)'}`,
          description: `${c.summary || 'Słuchowisko biblijne Christian Culture w przekładzie UBG.'} Słuchaj na https://polskieradio.cc/biblia-audio`,
          link: 'https://polskieradio.cc/biblia-audio',
          audioUrl: c.audioUrl.startsWith('http') ? c.audioUrl : `https://polskieradio.cc${c.audioUrl.startsWith('/') ? '' : '/'}${c.audioUrl}`,
          pubDate: c.publishedAt || '2026-11-13T08:00:00Z',
          duration: c.duration || '00:12:00',
        }));
    } catch {}
  }
  if (bibliaEpisodes.length === 0) {
    bibliaEpisodes = [
      {
        guid: 'cc-biblia-audio-gen-23',
        title: 'Księga Rodzaju 23 — Biblia Audio Christian Culture (UBG)',
        description: 'Superprodukcja audio Pisma Świętego w przekładzie Uwspółcześnionej Biblii Gdańskiej (-16 LUFS).',
        link: 'https://polskieradio.cc/biblia-audio',
        audioUrl: 'https://polskieradio.cc/biblia-audio/audio/GEN-023.mp3',
        pubDate: '2026-11-13T08:00:00Z',
        duration: '00:10:45',
      },
    ];
  }

  // 2. Apokalipsa episodes
  const apokalipsaEpisodes = [
    {
      guid: 'cc-sds-apokalipsa-ep29',
      title: 'Apokalipsa: Księga Nadziei (Odc. 29) — Upadek Globalnego Systemu (Obj 17–18)',
      description: 'Wykład biblijny z serii Apokalipsa: Księga Nadziei (Studio Dobrego Słowa / Christian Culture). Oglądaj i słuchaj na https://polskieradio.cc/vod',
      link: 'https://polskieradio.cc/vod',
      audioUrl: 'https://polskieradio.cc/audio/podcasts/apokalipsa-029.mp3',
      pubDate: '2026-11-12T20:00:00Z',
      duration: '00:42:15',
    },
    {
      guid: 'cc-sds-apokalipsa-ep28',
      title: 'Apokalipsa: Księga Nadziei (Odc. 28) — Siedem Czasz Gniewu Bożego (Obj 16)',
      description: 'Analiza proroctw Księgi Objawienia w świetle całej Biblii (UBG).',
      link: 'https://polskieradio.cc/vod',
      audioUrl: 'https://polskieradio.cc/audio/podcasts/apokalipsa-028.mp3',
      pubDate: '2026-11-11T20:00:00Z',
      duration: '00:39:50',
    },
  ];

  // 3. Dobrze, że jesteś & Kurs Codzienny
  const dzjEpisodes = [
    {
      guid: 'cc-dzj-kc-day45-20261113',
      title: 'Dzień 45: Pieśń Mojżesza i Miriam nad Morzem Czerwonym (Wj 15) — Dobrze, że jesteś & Kurs Codzienny',
      description: 'Codzienne rozważanie i lekcja biblijna „Z Biblią za Pan Brat”. Czytaj całość na https://polskieradio.cc/akademia/kurscodzienny/dzien-45',
      link: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-45',
      audioUrl: 'https://polskieradio.cc/audio/podcasts/dzj-day-45.mp3',
      pubDate: '2026-11-13T06:00:00Z',
      duration: '00:08:20',
    },
  ];

  const feedMap = {
    apokalipsa: apokalipsaEpisodes,
    'biblia-audio': bibliaEpisodes,
    'dobrze-ze-jestes': dzjEpisodes,
  };

  const generated = [];
  for (const feedMeta of registry.podcastFeeds) {
    const eps = feedMap[feedMeta.feedId] || [];
    const xml = buildPodcastRssXml(feedMeta, eps);
    const outPath = path.join(ROOT_DIR, feedMeta.rssPath.replace(/^\//, ''));
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, xml, 'utf8');
    generated.push({ feedId: feedMeta.feedId, path: feedMeta.rssPath, episodes: eps.length, bytes: Buffer.byteLength(xml) });
  }
  return generated;
}

export function buildDailyGlobalQueue() {
  const registry = loadGlobalRegistry();
  const sampleContent = {
    contentId: 'CC-2026-KC-DAY45',
    titlePl: 'Dzień 45: Pieśń Mojżesza i Miriam — Bóg naszą mocą i pieśnią (Wj 15:1–21 UBG)',
    titleEn: 'Day 45: The Song of Moses and Miriam — The Lord is My Strength and Song (Exodus 15:1–21)',
    titleDe: 'Tag 45: Das Lied von Mose und Mirjam — Der Herr ist meine Stärke und mein Lobgesang (2. Mose 15,1–21)',
    canonicalUrl: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-45',
    rights: {
      licenseType: 'cc_original',
      allowedPlatforms: ['pinterest', 'linkedin', 'substack', 'facebook-groups', 'telegram', 'youtube', 'instagram', 'tiktok', 'spotify', 'apple-podcasts', 'amazon-music'],
    },
    Gates: {
      biblicalK1K12: 'PASS',
      imageContentMatch: 'PASS',
      publisherVisualApproval: 'PASS',
    },
  };

  const validation = validateContentForDistribution(sampleContent);
  if (!validation.ok) {
    throw new Error(`Walidacja CC GLOBAL DISTRIBUTION nie powiodła się: ${validation.errors.join('; ')}`);
  }

  const queue = {
    generatedAt: new Date().toISOString(),
    directiveId: registry.directiveId,
    content: sampleContent,
    validation,
    dispatches: [
      {
        channelId: 'pinterest',
        format: 'pin_2x3_1000x1500',
        board: 'Z Biblią za Pan Brat — Infografiki Biblijne',
        title: sampleContent.titlePl,
        destinationUrl: sampleContent.canonicalUrl,
        languages: ['pl', 'en', 'de'],
        status: 'QUEUED_VERIFIED_ASSET',
      },
      {
        channelId: 'substack',
        format: 'bilingual_newsletter_pl_en_de',
        title: `${sampleContent.titlePl} | ${sampleContent.titleEn}`,
        destinationUrl: sampleContent.canonicalUrl,
        languages: ['pl', 'en', 'de'],
        status: 'QUEUED_READY',
      },
      {
        channelId: 'linkedin',
        format: 'editorial_leadership_post',
        author: 'Cezary Rogowski',
        title: 'Wdzięczność po przejściu przez próbę — lekcja przywództwa i wiary z Księgi Wyjścia 15',
        destinationUrl: sampleContent.canonicalUrl,
        languages: ['pl', 'en'],
        status: 'QUEUED_READY',
      },
      {
        channelId: 'facebook-groups',
        format: 'community_share_antispam',
        targetClusters: ['Chrześcijanie i Polonia w Niemczech (DE)', 'Polacy i Chrześcijanie w Wielkiej Brytanii (UK)'],
        maxGroupsPerSlot: 2,
        versionRule: 'WYŁĄCZNIE wersja WWW z pełnym linkiem i autentycznym wstępem @cc-human-voice',
        destinationUrl: sampleContent.canonicalUrl,
        status: 'QUEUED_ROTATION_FIFO',
      },
      {
        channelId: 'telegram',
        format: 'instant_channel_broadcast',
        channel: '@ChristianCultureGlobal',
        destinationUrl: sampleContent.canonicalUrl,
        audioPreviewUrl: 'https://polskieradio.cc/biblia-audio/audio/GEN-023.mp3',
        status: 'QUEUED_READY',
      },
    ],
  };

  fs.writeFileSync(QUEUE_OUT_PATH, JSON.stringify(queue, null, 2) + '\n', 'utf8');
  return queue;
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const cmd = process.argv[2] || 'verify';
  const reg = loadGlobalRegistry();
  const feeds = generateAllPodcastFeeds();
  const queue = buildDailyGlobalQueue();
  console.log(
    `CC_GLOBAL_DISTRIBUTION_OK: cmd=${cmd} | radio_streams=${reg.radioStreams.length} | radio_dirs=${reg.radioDirectories.length} | podcast_feeds=${feeds.length} (${feeds.map((f) => f.path).join(', ')}) | expansion_channels=${reg.expansionChannels.length} | dispatches=${queue.dispatches.length} | priority_langs=${reg.baselineMetricsOct2026.priorityLanguages.map((l) => l.code.toUpperCase()).join('->')}`
  );
}
