import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateGbpPost } from './gbp_policy_guard.mjs';

const DOMAIN_BASE = 'https://polskieradio.cc';

function readJsonSafe(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function normalizeUrl(raw) {
  try {
    const u = new URL(raw.startsWith('/') ? `${DOMAIN_BASE}${raw}` : raw);
    u.searchParams.delete('utm_source');
    u.searchParams.delete('utm_medium');
    u.searchParams.delete('utm_campaign');
    return u.toString().replace(/\/$/, '');
  } catch {
    return String(raw || '').trim();
  }
}

function sanitizeSummaryText(text) {
  return String(text || '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, '')
    .replace(/(?:\+?\d[\d\s-]{7,}\d)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugifyId(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
}

function resolveFirstExistingImage(repoRoot, candidates) {
  for (const rel of candidates) {
    if (rel && fs.existsSync(path.join(repoRoot, rel))) {
      return rel;
    }
  }
  return 'images/academy_hero_journey.jpg';
}

function findMatchingLessonImage(repoRoot, lessonNum) {
  const dailyDir = path.join(repoRoot, 'images', 'academy', 'daily');
  if (!fs.existsSync(dailyDir)) return null;
  const pad = String(lessonNum).padStart(2, '0');
  const match = fs.readdirSync(dailyDir).find((f) => f.startsWith(`kc_day_${pad}_`) && /\.(jpg|jpeg|png|webp)$/i.test(f));
  return match ? `images/academy/daily/${match}` : null;
}

/**
 * Skanuje rejestry nowości ekosystemu Christian Culture i buduje zweryfikowanych kandydatów do kolejki GBP.
 */
export async function collectNoveltyCandidates(repoRoot) {
  const candidates = [];

  // 1. Polecane nowości z katalogu wyszukiwarki (szukaj/catalog.json -> recommendedToday)
  const catalog = readJsonSafe(path.join(repoRoot, 'szukaj', 'catalog.json'), {});
  if (Array.isArray(catalog.recommendedToday)) {
    for (const item of catalog.recommendedToday) {
      if (!item?.url || !item?.title) continue;
      const ctaUrl = item.url.startsWith('http') ? item.url : `${DOMAIN_BASE}${item.url.startsWith('/') ? '' : '/'}${item.url}`;
      const isAi = /\/ai/i.test(ctaUrl);
      const isSba = /\/sba/i.test(ctaUrl);
      const cleanDesc = sanitizeSummaryText(item.desc || item.title);
      const summary = sanitizeSummaryText(
        `Nowość w Christian Culture: ${item.title}. ${cleanDesc} Wszystkie narzędzia i treści budujące wiarę udostępniamy całkowicie bezpłatnie dla każdego słuchacza i czytelnika. Kliknij poniżej, aby przejść bezpośrednio do serwisu.`
      ).slice(0, 580);

      candidates.push({
        id: `gbp_nov_${slugifyId(item.title)}`,
        week: 0,
        day: 'nowość',
        pillar: isAi ? 'offer' : 'news',
        postType: isAi ? 'OFFER' : 'UPDATE',
        ...(isAi ? { eventTitle: item.title.slice(0, 58), eventDurationDays: 14 } : {}),
        source: 'novelties-sync',
        imageFit: isSba ? 'contain' : 'cover',
        summary,
        ctaLabel: isAi ? 'Skorzystaj z oferty' : 'Więcej informacji',
        ctaUrl,
        imagePath: resolveFirstExistingImage(repoRoot, [
          isSba ? 'images/promo/scrolluj-biblie-gbp-2026.jpg' : null,
          isAi ? 'images/promo/the-best-of-christian-culture-2026.jpg' : null,
          'images/mapa-bg-earth.jpg'
        ])
      });
    }
  }

  // 2. Najnowsza lekcja Kursu Codziennego (images/academy/daily + szukaj/catalog.json)
  const items = Array.isArray(catalog.items) ? catalog.items : [];
  const lessonItems = items.filter((it) => typeof it?.url === 'string' && /\/akademia\/kurscodzienny\/dzien-\d+/i.test(it.url));
  if (lessonItems.length > 0) {
    const parsed = lessonItems
      .map((it) => {
        const m = it.url.match(/dzien-(\d+)/i);
        return { item: it, dayNum: m ? Number(m[1]) : 0 };
      })
      .sort((a, b) => b.dayNum - a.dayNum);
    const latest = parsed[0];
    if (latest && latest.dayNum > 0) {
      const lessonImg = findMatchingLessonImage(repoRoot, latest.dayNum);
      const cleanDesc = sanitizeSummaryText(latest.item.description || latest.item.title);
      candidates.push({
        id: `gbp_nov_kc_dzien_${latest.dayNum}`,
        week: 0,
        day: 'nowość',
        pillar: 'news',
        postType: 'UPDATE',
        source: 'novelties-sync',
        imageFit: 'cover',
        summary: sanitizeSummaryText(
          `Nowa lekcja Kursu Codziennego „Z Biblią za Pan Brat” — Dzień ${latest.dayNum}. ${cleanDesc} Czytaj Pismo Święte w przekładzie UBG z praktycznym komentarzem oraz wersją audio każdego dnia zupełnie bezpłatnie. Sprawdź dzisiejszy rozdział poniżej.`
        ).slice(0, 580),
        ctaLabel: 'Więcej informacji',
        ctaUrl: `${DOMAIN_BASE}/akademia/kurscodzienny/dzien-${latest.dayNum}`,
        imagePath: resolveFirstExistingImage(repoRoot, [lessonImg, 'images/academy_hero_journey.jpg'])
      });
    }
  }

  // 3. Najnowsze opublikowane rozdziały Biblii Audio (biblia-audio/data/catalog.json)
  const baCatalog = readJsonSafe(path.join(repoRoot, 'biblia-audio', 'data', 'catalog.json'), []);
  if (Array.isArray(baCatalog)) {
    const publishedChapters = baCatalog.filter((c) => c && c.status === 'published' && c.chapter);
    const newestBa = publishedChapters[publishedChapters.length - 1];
    if (newestBa) {
      candidates.push({
        id: `gbp_nov_biblia_audio_${slugifyId(newestBa.id || `ch_${newestBa.chapter}`)}`,
        week: 0,
        day: 'nowość',
        pillar: 'event',
        postType: 'EVENT',
        eventTitle: `Biblia Audio CC — Rozdział ${newestBa.chapter}`.slice(0, 58),
        eventDurationDays: 7,
        source: 'novelties-sync',
        imageFit: 'cover',
        summary: sanitizeSummaryText(
          `Nowy odcinek słuchowiska Biblia Audio już dostępny! Posłuchaj rozdziału ${newestBa.chapter} (${newestBa.description || 'Księga Rodzaju'}) według Uwspółcześnionej Biblii Gdańskiej z muzyką filmową i lektorem w jakości studyjnej. Kliknij poniżej, aby włączyć bezpłatny odtwarzacz online.`
        ).slice(0, 580),
        ctaLabel: 'Więcej informacji',
        ctaUrl: `${DOMAIN_BASE}/biblia-audio`,
        imagePath: resolveFirstExistingImage(repoRoot, ['images/audioteka/audioteka-hero-1024.jpg', 'images/ogloszenia-biblia-gdanska.jpg'])
      });
    }
  }

  // 4. Najnowsze artykuły CCN News (data/ccn-article-routes.js)
  const routesPath = path.join(repoRoot, 'data', 'ccn-article-routes.js');
  if (fs.existsSync(routesPath)) {
    try {
      const mod = await import(pathToFileURL(routesPath).href);
      const newsMap = mod?.default?.news || {};
      const seenSlugs = new Set();
      for (const [key, routePath] of Object.entries(newsMap)) {
        if (typeof routePath !== 'string' || !routePath.startsWith('/')) continue;
        if (seenSlugs.has(routePath)) continue;
        seenSlugs.add(routePath);
        const rawSlug = key.replace(/^art-/, '');
        const cleanTitle = rawSlug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
        const imgGuess1 = `images/news/art-${rawSlug}.jpg`;
        const imgGuess2 = `images/news/${rawSlug}.jpg`;
        const hasSpecificImg = fs.existsSync(path.join(repoRoot, imgGuess1)) || fs.existsSync(path.join(repoRoot, imgGuess2));
        if (!hasSpecificImg) continue;
        candidates.push({
          id: `gbp_nov_ccn_${slugifyId(rawSlug)}`,
          week: 0,
          day: 'nowość',
          pillar: 'news',
          postType: 'UPDATE',
          source: 'novelties-sync',
          imageFit: 'cover',
          summary: sanitizeSummaryText(
            `Nowe opracowanie w portalu CCN News: „${cleanTitle}”. Rzetelna analiza współczesnych wydarzeń, historii i codziennych decyzji w świetle Pisma Świętego — bez sensacji i powierzchowności. Przeczytaj bezpłatnie cały artykuł na naszej stronie.`
          ).slice(0, 580),
          ctaLabel: 'Więcej informacji',
          ctaUrl: `${DOMAIN_BASE}${routePath}`,
          imagePath: resolveFirstExistingImage(repoRoot, [imgGuess1, imgGuess2, 'images/milion-og.jpg'])
        });
        if (candidates.filter((c) => c.id.startsWith('gbp_nov_ccn_')).length >= 2) break;
      }
    } catch {
      // Pomijamy błąd dynamicznego importu, jeśli plik chwilowo nie istnieje
    }
  }

  // 5. Najnowsza potwierdzona premiera wideo YouTube (data/youtube_published_history.json)
  const ytHist = readJsonSafe(path.join(repoRoot, 'data', 'youtube_published_history.json'), {});
  const ytPubs = Array.isArray(ytHist?.published) ? ytHist.published : [];
  const latestPublicVideo = [...ytPubs]
    .reverse()
    .find(
      (v) =>
        v &&
        v.visibility === 'public' &&
        typeof v.videoUrl === 'string' &&
        /^https:\/\/(youtu\.be|www\.youtube\.com)\//i.test(v.videoUrl) &&
        !/#shorts/i.test(v.title || '') &&
        !/Shorts/i.test(v.videoFile || '')
    );
  if (latestPublicVideo) {
    const cleanYtTitle = sanitizeSummaryText(latestPublicVideo.title).slice(0, 58);
    candidates.push({
      id: `gbp_nov_yt_${slugifyId(latestPublicVideo.title)}`,
      week: 0,
      day: 'nowość',
      pillar: 'event',
      postType: 'EVENT',
      eventTitle: cleanYtTitle || 'Nowa premiera wideo Christian Culture',
      eventDurationDays: 7,
      source: 'novelties-sync',
      imageFit: 'cover',
      summary: sanitizeSummaryText(
        `Zapraszamy na nowe nagranie na kanale ${latestPublicVideo.channel || 'Christian Culture'}: „${sanitizeSummaryText(latestPublicVideo.title)}”. Głębokie spojrzenie na Słowo Boże, proroctwa biblijne i żywą nadzieję w Chrystusie. Kliknij przycisk poniżej, aby obejrzeć materiał.`
      ).slice(0, 580),
      ctaLabel: 'Więcej informacji',
      ctaUrl: latestPublicVideo.videoUrl,
      imagePath: resolveFirstExistingImage(repoRoot, [
        'images/live_2000_dlaczego_potrzebujesz_zywego_slowa.jpg',
        'images/og-swiadectwa.jpg'
      ])
    });
  }

  return candidates.filter((c) => validateGbpPost(c, repoRoot).valid);
}

/**
 * Wstrzykuje nowe, jeszcze nieopublikowane nowości tuż za wpisami launch-priority i przed rotacją evergreen.
 */
export async function syncNoveltiesIntoQueue({
  repoRoot,
  queuePath = path.join(repoRoot, 'data', 'gbp_posts_queue.json'),
  statePath = path.join(repoRoot, 'data', 'gbp_published_state.json'),
  maxNew = 6,
  dryRun = false
}) {
  const queue = readJsonSafe(queuePath, { version: '1.0', posts: [] });
  const state = readJsonSafe(statePath, { publishedIds: [], history: [], lastPublishedAt: null, totalPublished: 0 });
  const existingPosts = Array.isArray(queue.posts) ? queue.posts : [];

  const publishedIds = new Set(Array.isArray(state.publishedIds) ? state.publishedIds : []);
  const existingIds = new Set(existingPosts.map((p) => p?.id).filter(Boolean));
  const existingUrls = new Set(existingPosts.map((p) => normalizeUrl(p?.ctaUrl)));
  const publishedUrls = new Set(
    (Array.isArray(state.history) ? state.history : []).map((h) => normalizeUrl(h?.ctaUrl))
  );

  const candidates = await collectNoveltyCandidates(repoRoot);
  const added = [];

  for (const cand of candidates) {
    if (added.length >= maxNew) break;
    const normUrl = normalizeUrl(cand.ctaUrl);
    if (existingIds.has(cand.id) || publishedIds.has(cand.id)) continue;
    if (existingUrls.has(normUrl) || publishedUrls.has(normUrl)) continue;
    existingIds.add(cand.id);
    existingUrls.add(normUrl);
    added.push(cand);
  }

  if (!dryRun && added.length > 0) {
    const launchIdx = existingPosts.reduce(
      (lastIdx, p, idx) => (p?.source === 'launch-priority' && !publishedIds.has(p.id) ? idx : lastIdx),
      -1
    );
    const insertAt = launchIdx + 1;
    const updatedPosts = [
      ...existingPosts.slice(0, insertAt),
      ...added,
      ...existingPosts.slice(insertAt)
    ];
    queue.posts = updatedPosts;
    queue.lastNoveltiesSyncAt = new Date().toISOString();
    fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2) + '\n', 'utf8');
  }

  return {
    totalCandidatesValid: candidates.length,
    addedCount: added.length,
    addedIds: added.map((a) => a.id),
    dryRun
  };
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.url.replace(/^file:\/\/\//, '').replace(/\//g, path.sep));
if (isCli || (process.argv[1] && path.basename(process.argv[1]) === 'gbp_novelties_sync.mjs')) {
  const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
  const dryRun = process.argv.includes('--dry-run');
  syncNoveltiesIntoQueue({ repoRoot, dryRun })
    .then((res) => {
      console.log(`=== GBP NOVELTIES SYNC (${res.dryRun ? 'DRY RUN' : 'APPLIED'}) ===`);
      console.log(`Poprawnych kandydatów: ${res.totalCandidatesValid}, dodano nowych: ${res.addedCount}`);
      if (res.addedIds.length > 0) {
        console.log('Dodane ID:', res.addedIds.join(', '));
      }
    })
    .catch((err) => {
      console.error(`[FATAL GBP NOVELTIES] ${err.message}`);
      process.exit(1);
    });
}
