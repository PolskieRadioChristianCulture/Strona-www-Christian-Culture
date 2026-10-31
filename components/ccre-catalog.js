/**
 * CCRE Unified Content Catalog Adapter (M1)
 * Normalizuje rozproszone zbiory danych EkoCC w ujednolicony strumień CCREContentItem.
 * Architektura: ZERO COST, in-memory cache, bezpieczny fallback offline.
 */

export const FALLBACK_ITEMS = [
  {
    id: 'ba_gen_01',
    title: 'Księga Rodzaju • Rozdział 1',
    subtitle: 'Stworzenie świata i człowieka • Biblia Audio CC',
    category: 'bible',
    url: '/biblia-audio#rdz-1',
    thumbnailUrl: '/images/hero-biblia-audio.jpg',
    durationText: '12 min',
    badgeText: 'NOWOŚĆ',
    actionType: 'play',
    actionUrl: '/biblia-audio#rdz-1'
  },
  {
    id: 'radio_live_main',
    title: 'Polskie Radio Christian Culture LIVE 24/7',
    subtitle: 'Najpiękniejsza muzyka uwielbienia i słuchowiska biblijne bez reklam',
    category: 'audio',
    url: '/player',
    thumbnailUrl: '/images/og-player.jpg',
    durationText: 'NA ŻYWO',
    badgeText: 'LIVE',
    actionType: 'play',
    actionUrl: '/player'
  },
  {
    id: 'kc_course_today',
    title: 'Kurs Codzienny • Z Biblią za Pan Brat',
    subtitle: 'Codzienna lekcja Słowa Bożego z praktycznym zastosowaniem',
    category: 'course',
    url: '/akademia#kurscodzienny',
    thumbnailUrl: '/images/academy/daily/kc_day_19_cover.jpg',
    durationText: 'Lekcja: 10 min',
    badgeText: 'KURS CODZIENNY',
    actionType: 'read',
    actionUrl: '/akademia#kurscodzienny'
  },
  {
    id: 'mb_interlinear',
    title: 'Interlinearna MojaBiblia CC',
    subtitle: 'Oryginalny tekst hebrajski i grecki, kody Stronga i przekład UBG',
    category: 'bible',
    url: '/mojabiblia',
    thumbnailUrl: '/images/mojabiblia-og.jpg',
    durationText: 'Badanie Słowa',
    badgeText: 'STUDIUM',
    actionType: 'read',
    actionUrl: '/mojabiblia'
  }
];

export class CatalogAdapter {
  constructor() {
    this.cache = null;
    this.isLoading = false;
  }

  normalizeItem(raw, source = 'generic') {
    return {
      id: raw.id || `ccre_${Math.random().toString(36).substring(2, 9)}`,
      title: raw.title || 'Materiał Christian Culture',
      subtitle: raw.subtitle || raw.desc || raw.description || '',
      category: raw.category || 'article',
      url: raw.url || raw.link || '/',
      thumbnailUrl: raw.thumbnailUrl || raw.image || raw.cover || '/images/hero-biblia-audio.jpg',
      durationText: raw.durationText || raw.duration || '',
      badgeText: raw.badgeText || raw.badge || '',
      actionType: raw.actionType || (raw.category === 'audio' || raw.category === 'bible' ? 'play' : 'read'),
      actionUrl: raw.actionUrl || raw.url || '/'
    };
  }

  async load() {
    if (this.cache) return this.cache;

    try {
      if (typeof fetch === 'function') {
        const res = await fetch('/data/cc-search-index.json');
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.items || []);
          this.cache = items.map(item => this.normalizeItem(item, 'search-index'));
          return this.cache;
        }
      }
    } catch (e) {}

    this.cache = FALLBACK_ITEMS.map(item => this.normalizeItem(item, 'fallback'));
    return this.cache;
  }

  getItems(filter = {}) {
    const items = this.cache || FALLBACK_ITEMS;
    return items.filter(item => {
      if (filter.category && filter.category !== 'all' && item.category !== filter.category) {
        return false;
      }
      if (filter.query) {
        const q = filter.query.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSub = item.subtitle && item.subtitle.toLowerCase().includes(q);
        if (!matchTitle && !matchSub) return false;
      }
      return true;
    });
  }

  getFeatured() {
    const items = this.getItems();
    return items.slice(0, 4);
  }
}

const CCRECatalog = {
  CatalogAdapter,
  create: () => new CatalogAdapter(),
  FALLBACK_ITEMS
};

if (typeof globalThis !== 'undefined') {
  globalThis.CCRECatalog = CCRECatalog;
}

export default CCRECatalog;
