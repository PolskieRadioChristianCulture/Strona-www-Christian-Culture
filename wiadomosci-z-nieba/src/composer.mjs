import fs from 'node:fs';
import path from 'node:path';
import { loadWznConfig } from './db.mjs';
import { selectThemeForVerse } from './theme-catalog.mjs';

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');

const FORBIDDEN_IMAGE_RE =
  /(gerald-welch|chan-muzyka|popular-muzyka|art-worship|ark-of-fire|wspieramto-banner|topten|cclite|heatfix|murawski|avatar_|cezary-hero|wioletta-og|em-cezary|ccn-news-official-badge|skin-earth|ambient_hero)/i;

export function findDedicatedVerseGraphic(day, rootDir = DEFAULT_REPO_ROOT) {
  const genDir = path.join(rootDir, 'images', 'werset-dnia', 'generated');
  if (!fs.existsSync(genDir)) return null;
  const prefix = `werset-day-${Number(day)}-`;
  const files = fs
    .readdirSync(genDir)
    .filter(f => f.startsWith(prefix) && /\.(jpe?g|png|webp)$/i.test(f) && !FORBIDDEN_IMAGE_RE.test(f))
    .sort();
  if (!files.length) return null;
  return `/images/werset-dnia/generated/${files[0]}`;
}

export function composeDailyMessage({
  verse,
  runDate,
  recentThemes = [],
  config = null,
  rootDir = DEFAULT_REPO_ROOT,
} = {}) {
  if (!verse || !verse.canonicalVerified) {
    const err = new Error('Nie można złożyć publikacji z niezweryfikowanego wersetu.');
    err.code = 'UNVERIFIED_VERSE';
    throw err;
  }

  const cfg = config || loadWznConfig(rootDir);
  const selected = selectThemeForVerse(verse, recentThemes);
  const mainUrl = cfg.profile?.mainUrl || 'https://polskieradio.cc/werset-dnia';
  const publisherName = cfg.profile?.publisher || 'Christian Culture';

  const hook = selected.hook;
  const verseBlock = `📖 „${verse.text}”\n${verse.referencePl} — przekład UBG-2025.`;
  const reflection = selected.reflection;
  const primaryCta = `📖 Odkryj swój dzisiejszy werset i zatrzymaj się na chwilę przy Słowie Bożym:\n${mainUrl}`;
  const secondaryInvite = `💬 ${selected.secondaryCta}`;
  const ctaBlock = `${primaryCta}\n\n${secondaryInvite}`;
  const signature = `❤️ Wiadomości z nieba | ${publisherName}`;

  const bodyText = [hook, verseBlock, reflection, ctaBlock, signature].join('\n\n');
  const title = `${hook.replace(/^[^\p{L}\p{N}]+/u, '').trim()} (${verse.referencePl})`;
  const postId = `wzn_post_${runDate}`;
  const idempotencyKey = `wzn:${runDate}:day:${verse.day}`;
  const dedicatedImage = findDedicatedVerseGraphic(verse.day, rootDir);

  const luminaPostPayload = {
    id: postId,
    idempotencyKey,
    type: 'post',
    category: 'wiadomosci_z_nieba',
    isArticle: false,
    isDevotion: false,
    _isCkdDaily: false,
    isEditorialChannel: true,
    publisher: publisherName,
    editorialDisclosure: cfg.profile?.editorialDisclosure,
    author: cfg.profile?.displayName || 'Jezus Chrystus',
    authorDisplayTitle: cfg.profile?.fullTitle || 'Jezus Chrystus — Wiadomości z nieba',
    authorHandle: cfg.profile?.handle || '@wiadomosci_z_nieba',
    authorSlug: cfg.profile?.slug || 'wiadomosci_z_nieba',
    authorAvatar: cfg.profile?.avatarPng || '/images/lumina/wiadomosci-z-nieba-avatar.png',
    authorRole: 'Wiadomości z nieba • Oficjalny profil tematyczny Christian Culture',
    title,
    text: bodyText,
    desc: `${verse.referencePl} (UBG-2025) — codzienna wiadomość ze Słowa Bożego przygotowana przez Christian Culture.`,
    image: dedicatedImage,
    imageUrl: dedicatedImage,
    actionText: 'Odkryj swój Werset Dnia →',
    actionUrl: mainUrl,
    externalUrl: mainUrl,
    externalUrlLabel: 'Przejdź do Mój Werset Dnia →',
    sourceUrl: mainUrl,
    verseDay: verse.day,
    verseReference: verse.referencePl,
    verseTranslation: verse.translation,
    verseLicense: verse.license,
    verseHash: verse.sha256,
    themeId: selected.themeId,
    themeLabel: selected.themeLabel,
    runDate,
  };

  return {
    postId,
    idempotencyKey,
    runDate,
    title,
    bodyText,
    themeId: selected.themeId,
    themeLabel: selected.themeLabel,
    secondaryCta: selected.secondaryCta,
    dedicatedImage,
    sections: {
      hook,
      verseBlock,
      reflection,
      primaryCta,
      secondaryInvite,
      ctaBlock,
      signature,
    },
    luminaPostPayload,
  };
}
