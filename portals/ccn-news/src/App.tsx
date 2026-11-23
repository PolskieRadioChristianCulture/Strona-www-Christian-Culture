import { useHeadlineRotation } from './lib/useHeadlineRotation';
import { readBookmarks } from './lib/bookmarks';
import React, { useState, useEffect, useRef } from 'react';
import { EcosystemNews } from './components/EcosystemNews';
import { PortalPatron } from './components/PortalPatron';
import { Header } from './components/Header';
import { BreakingTicker } from './components/BreakingTicker';
import { HeroArticle } from './components/HeroArticle';
import { ArticleCard } from './components/ArticleCard';
import { Sidebar } from './components/Sidebar';
import { EcosystemCarouselSection } from './components/EcosystemCarouselSection';
import { LexiconSection } from './components/LexiconSection';
import { CoursesBannerSection } from './components/CoursesBannerSection';
import { MusicMediaSection } from './components/MusicMediaSection';
import { ArticleModal } from './components/ArticleModal';
import { SearchModal } from './components/SearchModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { RadioPlayerModal } from './components/RadioPlayerModal';
import { AboutModal } from './components/AboutModal';
import { Footer } from './components/Footer';
import { INITIAL_ARTICLES } from './data/articles';
import { Article, Category } from './types';
import { Filter, Sparkles, BookOpen, GraduationCap, Music2, ArrowLeft, ChevronDown } from 'lucide-react';

export default function App() {
  const [articles] = useState<Article[]>(INITIAL_ARTICLES);
  const [currentCategory, setCurrentCategory] = useState<Category>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(4);

  const handleSelectArticle = (art: Article | null) => {
    setSelectedArticle(art);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (art) {
          url.searchParams.set('art', art.id || art.slug);
        } else {
          url.searchParams.delete('art');
        }
        window.history.replaceState({}, '', url.toString());
      } catch (e) {
        console.warn('Could not update history state', e);
      }
    }
  };

  // Read ?art= parameter on mount and on popstate
  useEffect(() => {
    const checkUrlArticle = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const artParam = params.get('art');
      if (artParam) {
        const found = articles.find((a) => a.id === artParam || a.slug === artParam);
        if (found) {
          setSelectedArticle(found);
        }
      }
    };
    checkUrlArticle();
    window.addEventListener('popstate', checkUrlArticle);
    return () => window.removeEventListener('popstate', checkUrlArticle);
  }, [articles]);

  // Modals & Drawers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isRadioModalOpen, setIsRadioModalOpen] = useState(false);

  // Bookmarks in localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ccn_bookmarks');
      return readBookmarks(saved);
    } catch {
      return [];
    }
  });

  // Prune invalid or phantom bookmark IDs
  useEffect(() => {
    setBookmarkedIds((prev) => {
      const sanitized = prev.filter(
        (id) => typeof id === 'string' && id.trim().length > 1 && id !== 'undefined' && id !== 'null' && id !== '1'
      );
      return sanitized.length !== prev.length ? sanitized : prev;
    });
  }, []);

  // Audio Radio Stream
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const [radioVolume, setRadioVolume] = useState(0.85);
  const [isRadioMuted, setIsRadioMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio Stream
  useEffect(() => {
    const audio = new Audio('https://stream.zeno.fm/imo45hqnshyuv');
    audio.preload = 'none';
    audio.volume = radioVolume;
    audioRef.current = audio;

    const handlePlay = () => setIsRadioPlaying(true);
    const handlePause = () => setIsRadioPlaying(false);
    const handleError = () => {
      if (audio.src === 'https://stream.zeno.fm/imo45hqnshyuv') {
        audio.src = 'https://stream.zeno.fm/hls/vz96pvl3pnktv';
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Save Bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ccn_bookmarks', JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.warn('LocalStorage not available', e);
    }
  }, [bookmarkedIds]);

  const toggleBookmark = (article: Article) => {
    setBookmarkedIds((prev) =>
      prev.includes(article.id) ? prev.filter((id) => id !== article.id) : [...prev, article.id]
    );
  };

  const handleClearBookmarks = () => {
    setBookmarkedIds([]);
  };

  const toggleRadioPlayback = () => {
    if (!audioRef.current) return;
    if (isRadioPlaying) {
      audioRef.current.pause();
      setIsRadioPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsRadioPlaying(true))
        .catch(() => {
          setIsRadioPlaying(false);
        });
    }
  };

  const handleVolumeChange = (vol: number) => {
    setRadioVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = isRadioMuted ? 0 : vol;
    }
    if (vol > 0 && isRadioMuted) {
      setIsRadioMuted(false);
    }
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isRadioMuted;
    setIsRadioMuted(newMuted);
    audioRef.current.volume = newMuted ? 0 : radioVolume;
  };

  const handleCategorySelect = (cat: Category) => {
    if (cat === 'about') {
      setIsAboutOpen(true);
    } else {
      setCurrentCategory(cat);
      setVisibleCount(4);
    }
  };

  const isHome = currentCategory === 'home';
  // Standard CCN Premium: czołówka = najnowsze materiały (isHero lub Kraj/Świat), od najnowszego, maks. 6 w rotacji.
  const HERO_LIMIT = 6;
  const byNewest = (x: Article, y: Article) => new Date(y.publishedAt).getTime() - new Date(x.publishedAt).getTime();
  const heroCandidates = articles
    .filter(a => a.isHero || a.category === 'kraj' || a.category === 'swiat')
    .sort(byNewest)
    .slice(0, HERO_LIMIT);
  const heroRotation = useHeadlineRotation(heroCandidates.length);
  const heroArticle = heroCandidates[heroRotation.index] || articles[0];

  // Filtered Articles based on Category
  const displayedArticles = isHome
    ? articles.filter((a) => a.id !== heroArticle.id)
    : currentCategory === 'leksykon'
    ? [] // handled by dedicated LexiconSection view
    : articles.filter((a) => a.category === currentCategory);

  // Posortowane chronologicznie od najnowszych
  const sortedArticles = [...displayedArticles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Wyświetlane pierwsze N artykułów (domyślnie 4, rozwijane przyciskiem WIĘCEJ)
  const visibleArticles = sortedArticles.slice(0, visibleCount);

  // Popular Articles (ranked)
  const popularArticles = articles
    .filter((a) => a.isPopular)
    .sort((a, b) => (a.popularRank || 99) - (b.popularRank || 99));

  // Daily Devotional (Z Biblią za Pan Brat - Cezary Rogowski)
  const dailyDevotional =
    articles.find((a) => a.id.startsWith('art-z-biblia-za-pan-brat')) ||
    articles.find((a) => a.id === 'art-cuda-kazdego-dnia-andrzej-thiel') ||
    articles[articles.length - 1];

  // Bookmarked Articles Objects
  const bookmarkedArticlesList = articles.filter((a) => bookmarkedIds.includes(a.id));

  // Related articles for modal
  const relatedArticles = selectedArticle
    ? articles
        .filter((a) => a.id !== selectedArticle.id && a.category === selectedArticle.category)
        .slice(0, 3)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      {/* 1. Header with Sticky Navigation & Universal CC Auth */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={handleCategorySelect}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenRadio={() => setIsRadioModalOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        bookmarksCount={bookmarkedArticlesList.length}
        isRadioPlaying={isRadioPlaying}
        onToggleRadio={toggleRadioPlayback}
      />

      {/* 2. Breaking News Live Ticker */}
      <BreakingTicker items={heroCandidates.map(article => article.title)} onSelectHeadline={title => handleSelectArticle(heroCandidates.find(article => article.title === title) || null)} />

      {/* 3. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        {/* Category Header (if not home) */}
        {!isHome && (
          <div className="mb-8 pb-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[#bb142e] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <span>CCN NEWS</span>
                <span>/</span>
                <span>REDAKCJA BIBLIJNA</span>
              </div>
              <h1 className="font-serif-headline text-3xl sm:text-4xl font-extrabold text-gray-900 capitalize">
                {currentCategory === 'kraj'
                  ? 'Kraj: Wiadomości i Wolność Sumienia w Polsce'
                  : currentCategory === 'swiat'
                  ? 'Świat: Geopolityka i Kościół Prześladowany'
                  : currentCategory === 'wywiady'
                  ? 'Wywiady Redakcyjne & Teologiczne'
                  : currentCategory === 'leksykon'
                  ? 'Leksykon Biblijny & Chrześcijańska Encyklopedia'
                  : currentCategory === 'kursy'
                  ? 'Akademia Biblijna CC: Kursy i Wykłady'
                  : currentCategory === 'muzyka'
                  ? 'Media & Muzyka Christian Culture'
                  : currentCategory === 'wiara'
                  ? 'Wiara, Biblia i Duchowość'
                  : currentCategory === 'opinia'
                  ? 'Opinie, Publicystyka i Felietony'
                  : currentCategory}
              </h1>
            </div>
            <button
              onClick={() => {
                setCurrentCategory('home');
                setVisibleCount(4);
              }}
              className="text-xs font-semibold text-gray-700 hover:text-[#bb142e] bg-white border border-gray-200 px-3.5 py-2 rounded-xl transition self-start cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Powrót na stronę główną</span>
            </button>
          </div>
        )}

        {/* If user clicked specifically on "Leksykon" in menu */}
        {currentCategory === 'leksykon' ? (
          <LexiconSection />
        ) : (
          /* Standard 2-Column Grid (Left Main + Right Sidebar) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* LEFT CONTENT (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-10">
              {/* HERO ARTICLE (Rendered on Home) */}
              {isHome && (<section aria-label="Główne tematy dnia" {...heroRotation.handlers}><HeroArticle
                  article={heroArticle}
                  onReadArticle={(art) => handleSelectArticle(art)}
                  isBookmarked={bookmarkedIds.includes(heroArticle.id)}
                  onToggleBookmark={toggleBookmark} />{heroCandidates.length > 1 && <div className="flex justify-center items-center gap-2 py-1 text-sm"><button className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center" aria-label="Poprzedni temat dnia" onClick={heroRotation.previous}>←</button><span>{heroRotation.index + 1}/{heroCandidates.length}</span><button className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center" aria-label="Następny temat dnia" onClick={heroRotation.next}>→</button><button className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center px-3" onClick={heroRotation.toggle}>{heroRotation.paused ? "Wznów tematy" : "Wstrzymaj tematy"}</button></div>}</section>)}

              {/* DEDICATED CATEGORY SECTIONS */}
              {currentCategory === 'kursy' && <CoursesBannerSection />}
              {currentCategory === 'muzyka' && (
                <MusicMediaSection
                  isRadioPlaying={isRadioPlaying}
                  onToggleRadio={toggleRadioPlayback}
                />
              )}

              {/* ARTICLES SECTION */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 font-serif">
                    <span className="w-1.5 h-6 bg-[#bb142e] rounded"></span>
                    <span>
                      {isHome
                        ? 'Wiadomości z Kraju i ze Świata'
                        : `Artykuły: ${currentCategory.toUpperCase()}`}
                    </span>
                  </h2>

                  {isHome && (
                    <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                      Rzetelne fakty w świetle Słowa Bożego
                    </span>
                  )}
                </div>

                {/* Grid of Article Cards */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {visibleArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onReadArticle={(art) => handleSelectArticle(art)}
                      isBookmarked={bookmarkedIds.includes(article.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </div>

                {/* Przycisk WIĘCEJ jeśli są kolejne artykuły w tej kolumnie */}
                {sortedArticles.length > visibleCount && (
                  <div className="mt-8 flex justify-center">
                    <button
                      id="ccn-load-more-articles-btn"
                      onClick={() => setVisibleCount((prev) => prev + 4)}
                      className="group inline-flex items-center justify-center gap-2 px-8 py-3 bg-white hover:bg-gray-50 text-gray-900 font-bold text-xs tracking-wider uppercase border border-gray-300 hover:border-[#bb142e] hover:text-[#bb142e] rounded-xl shadow-xs transition duration-200 cursor-pointer min-h-[44px] min-w-[200px]"
                      aria-label="Pokaż więcej artykułów"
                    >
                      <span>WIĘCEJ</span>
                      <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-[#bb142e] transition-transform group-hover:translate-y-0.5" />
                    </button>
                  </div>
                )}

                {/* Empty State */}
                {displayedArticles.length === 0 && currentCategory !== 'kursy' && currentCategory !== 'muzyka' && (
                  <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                    <Filter className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Brak artykułów w tej kategorii.</p>
                    <button
                      onClick={() => {
                        setCurrentCategory('home');
                        setVisibleCount(4);
                      }}
                      className="mt-4 px-4 py-2 bg-[#bb142e] text-white rounded-lg text-xs font-semibold cursor-pointer min-h-[44px]"
                    >
                      Powrót do strony głównej
                    </button>
                  </div>
                )}
              </section>

              {isHome && <PortalPatron />}
              {/* On Homepage: Display the Rich Christian Wikipedia / Biblical Lexicon Section */}
              {isHome && <LexiconSection />}

              {/* On Homepage: Display Akademia Biblijna Courses Banner */}
              {isHome && <CoursesBannerSection />}

              {/* On Homepage: Display Music & Media Section */}
              {isHome && (
                <MusicMediaSection
                  isRadioPlaying={isRadioPlaying}
                  onToggleRadio={toggleRadioPlayback}
                />
              )}
            </div>

            {/* RIGHT SIDEBAR (lg:col-span-1) */}
            <Sidebar
              popularArticles={popularArticles}
              dailyDevotional={dailyDevotional}
              onReadArticle={(art) => handleSelectArticle(art)}
              isRadioPlaying={isRadioPlaying}
              onToggleRadio={toggleRadioPlayback}
              onNavigateToLexicon={() => {
                setCurrentCategory('leksykon');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* Full-width Carousel of All Ecosystem Subpages */}
        {isHome && <EcosystemNews />}
        {isHome && <EcosystemCarouselSection />}
        <section aria-labelledby="koncept-patron-title" className="mt-8 border-t border-zinc-200 pt-6 pb-4 text-center"><h2 id="koncept-patron-title" className="text-sm font-bold tracking-widest text-gray-900 mb-3">OFICJALNY PATRON</h2><a href="https://koncept-studio.pl/" target="_blank" rel="noopener noreferrer sponsored" aria-label="Koncept Studio — oficjalny patron" className="block w-full max-w-[728px] mx-auto rounded-lg overflow-hidden border border-zinc-200"><img src="/ccn-koncept-patron.jpg" alt="Koncept Studio Mebli — baner oficjalnego patrona" width="728" height="180" loading="lazy" className="block w-full h-auto object-contain" /></a></section>
      </main>

      {/* 4. Footer */}
      <Footer onSelectCategory={handleCategorySelect} />

      {/* Modals & Overlays */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => handleSelectArticle(null)}
        isBookmarked={selectedArticle ? bookmarkedIds.includes(selectedArticle.id) : false}
        onToggleBookmark={toggleBookmark}
        onSelectRelatedArticle={(art) => handleSelectArticle(art)}
        relatedArticles={relatedArticles}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={articles}
        onSelectArticle={(art) => handleSelectArticle(art)}
      />

      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarkedArticles={bookmarkedArticlesList}
        onSelectArticle={(art) => handleSelectArticle(art)}
        onRemoveBookmark={(id) => setBookmarkedIds((prev) => prev.filter((i) => i !== id))}
        onClearAll={handleClearBookmarks}
      />

      <RadioPlayerModal
        isOpen={isRadioModalOpen}
        onClose={() => setIsRadioModalOpen(false)}
        isPlaying={isRadioPlaying}
        onTogglePlay={toggleRadioPlayback}
        volume={radioVolume}
        onVolumeChange={handleVolumeChange}
        isMuted={isRadioMuted}
        onToggleMute={handleToggleMute}
      />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
