/**
 * CCRE Today (CC Dzisiaj - M2)
 * Dynamiczny agregator "Co dzisiaj w Christian Culture".
 * Słowo Boże (UBG) + Radio LIVE + Rozdział Biblii Audio + Artykuł Dnia.
 */

export const DEFAULT_TODAY_DATA = {
  date: new Date().toISOString().split('T')[0],
  verseOfTheDay: {
    reference: 'Rdz 1:1-3 (UBG)',
    text: 'Na początku stworzył Bóg niebo i ziemię. A ziemia była bezkształtna i pusta, i ciemność była nad otchłanią, a Duch Boży unosił się nad wodami. I powiedział Bóg: Niech stanie się światłość. I stała się światłość.',
    translation: 'Uwspółcześniona Biblia Gdańska'
  },
  radioNowPlaying: {
    title: 'Polskie Radio CC • Transmisja Ciągła 24/7',
    status: 'NA ŻYWO',
    streamUrl: 'https://stream.zeno.fm/gn3uhltrrytuv'
  },
  featuredChapter: {
    id: 'ba_gen_01',
    title: 'Księga Rodzaju • Rozdział 1',
    description: 'Stworzenie świata i człowieka • Profesjonalne słuchowisko Biblia Audio CC',
    url: '/biblia-audio#rdz-1',
    thumbnailUrl: '/images/hero-biblia-audio.jpg',
    badge: 'SŁUCHOWISKO DNIA'
  },
  featuredArticle: {
    title: 'Piękno Sabatu: Odpoczynek w Ramionach Stwórcy',
    category: 'Duchowość i Wiara',
    url: '/news',
    author: 'Cezary Rogowski'
  }
};

export class TodayManager {
  constructor(customData = {}) {
    this.data = Object.assign({}, DEFAULT_TODAY_DATA, customData);
  }

  getFeed() {
    return Object.assign({}, this.data);
  }

  toHTML() {
    return `
      <div class="ccre-today-widget" style="background: rgba(14, 16, 23, 0.9); border: 1px solid rgba(196, 163, 90, 0.3); border-radius: 12px; padding: 20px; color: #F3F4F6;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <span style="color: #C4A35A; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
            ✦ CC DZISIAJ • ${this.data.date}
          </span>
          <span style="background: rgba(255, 122, 0, 0.15); color: #FF7A00; border: 1px solid rgba(255, 122, 0, 0.4); font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">
            ${this.data.radioNowPlaying.status}
          </span>
        </div>

        <div style="background: rgba(255, 255, 255, 0.03); border-left: 3px solid #C4A35A; padding: 12px 14px; border-radius: 4px; margin-bottom: 16px;">
          <p style="font-style: italic; margin: 0 0 6px 0; font-size: 14px; line-height: 1.5; color: #E5E7EB;">
            "${this.data.verseOfTheDay.text}"
          </p>
          <span style="font-size: 12px; font-weight: 700; color: #C4A35A;">
            — ${this.data.verseOfTheDay.reference}
          </span>
        </div>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="${this.data.featuredChapter.url}" style="display: inline-flex; align-items: center; gap: 8px; background: #FF7A00; color: #FFFFFF; text-decoration: none; font-weight: 700; font-size: 13px; padding: 10px 16px; border-radius: 8px; min-height: 44px;">
            <span>▶</span> Posłuchaj: ${this.data.featuredChapter.title}
          </a>
          <a href="/player" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.08); color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 13px; padding: 10px 16px; border-radius: 8px; min-height: 44px; border: 1px solid rgba(255, 255, 255, 0.15);">
            <span>📻</span> Włącz Radio LIVE
          </a>
        </div>
      </div>
    `;
  }

  render(containerElement) {
    if (!containerElement) return;
    containerElement.innerHTML = this.toHTML();
  }
}

const CCREToday = {
  TodayManager,
  create: (data) => new TodayManager(data),
  DEFAULT_TODAY_DATA
};

if (typeof globalThis !== 'undefined') {
  globalThis.CCREToday = CCREToday;
}

export default CCREToday;
