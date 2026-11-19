import React, { useState, useEffect } from 'react';
import { CcnLogo } from './CcnLogo';
import { Category } from '../types';
import { Search, Radio, Bookmark, Menu, X, Plus, LogIn, User, ExternalLink, LogOut, BookOpen, GraduationCap, ChevronDown } from 'lucide-react';
import { CCMobileEdgePanel } from './CCMobileEdgePanel';

interface HeaderProps {
  currentCategory: Category;
  onSelectCategory: (cat: Category) => void;
  onOpenSearch: () => void;
  onOpenRadio: () => void;
  onOpenBookmarks: () => void;
  bookmarksCount: number;
  isRadioPlaying: boolean;
  onToggleRadio: () => void;
}

interface StoredUser {
  displayName?: string;
  name?: string;
  email?: string;
  photoURL?: string;
  avatar?: string;
  slug?: string;
}

const NAV_ITEMS: { id: Category; label: string; badge?: string }[] = [
  { id: 'home', label: 'Wszystkie' },
  { id: 'kraj', label: 'Kraj' },
  { id: 'swiat', label: 'Świat' },
  { id: 'wywiady', label: 'Wywiady' },
  { id: 'leksykon', label: 'Leksykon Wiary' },
  { id: 'kursy', label: 'Kursy CC' },
  { id: 'muzyka', label: 'Muzyka' },
  { id: 'about', label: 'O nas' },
];

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenRadio,
  onOpenBookmarks,
  bookmarksCount,
  isRadioPlaying,
  onToggleRadio,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [edgePanelOpen, setEdgePanelOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Sync user from localStorage (LUMINA / Christian Culture Auth standard)
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem('lumina_current_user');
        const profStr = localStorage.getItem('lumina_current_user_profile') || localStorage.getItem('lumina_my_profile');
        let user: any = userStr ? JSON.parse(userStr) : null;
        let profile: any = profStr ? JSON.parse(profStr) : null;

        const curSlug = localStorage.getItem('lumina_current_user_slug') || localStorage.getItem('lumina_user_slug');
        if (curSlug === 'cezaryrgowski') {
          if (!profile) {
            profile = {
              displayName: 'Cezary Rogowski',
              name: 'Cezary Rogowski',
              avatar: '/avatar_cezary_official.jpg',
              email: 'nazirczarkes@gmail.com',
              slug: 'cezaryrgowski',
            };
          }
        } else if (curSlug === 'wiolettarogowska') {
          if (!profile) {
            profile = {
              displayName: 'Wioletta Rogowska',
              name: 'Wioletta Rogowska',
              avatar: '/avatar_wioletta_official.jpg',
              email: 'wioletta1240@gmail.com',
              slug: 'wiolettarogowska',
            };
          }
        }

        if (user || profile) {
          const combined: StoredUser = {
            displayName: profile?.displayName || profile?.name || user?.displayName || 'Użytkownik CC',
            email: profile?.email || user?.email || '',
            avatar: profile?.avatar || user?.photoURL || '/avatar_cezary_official.jpg',
            slug: profile?.slug || curSlug || '',
          };
          setCurrentUser(combined);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.warn('Auth sync notice:', err);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleNavClick = (cat: Category) => {
    onSelectCategory(cat);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginClick = () => {
    if (typeof (window as any).ccLoginWithGoogle === 'function') {
      (window as any).ccLoginWithGoogle('/news');
    } else {
      window.location.href = '/lumina-login?redirect=/news';
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('lumina_current_user');
      localStorage.removeItem('lumina_current_user_profile');
      localStorage.removeItem('lumina_current_user_slug');
      localStorage.removeItem('lumina_user_slug');
      setCurrentUser(null);
      setUserDropdownOpen(false);
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const profileHref = currentUser?.slug === 'cezaryrgowski'
    ? '/lumina.cezaryrgowski.html'
    : currentUser?.slug === 'wiolettarogowska'
    ? '/lumina.wiolettarogowska.html'
    : currentUser?.slug
    ? `/lumina-profile.html?u=${currentUser.slug}`
    : '/lumina-profile.html';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 transition-shadow shadow-xs">
      {/* Top CC Ecosystem Navigation Bar */}
      <div className="news-ecosystem-strip hidden md:block bg-[#010101] text-zinc-300 text-[11px] font-bold tracking-wider uppercase border-b border-[#1f1f1f] px-4 sm:px-6 py-0">
        <div className="news-ecosystem-row max-w-7xl mx-auto flex items-center justify-between">
          <div className="news-ecosystem-links flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f9282b]"></span>
              Ekosystem Christian Culture:
            </span>
            <nav aria-label="Portale Christian Culture" tabIndex={0} className="news-ecosystem-nav flex items-center gap-4 sm:gap-6 overflow-x-auto py-0.5">
              <a href="/player" className="hover:text-[#f9282b] transition-colors inline-flex items-center min-h-[44px]">Radio</a>
              <a href="/lumina" className="hover:text-[#f9282b] transition-colors inline-flex items-center min-h-[44px]">LUMINA</a>
              <a href="/akademia" className="hover:text-[#f9282b] transition-colors inline-flex items-center min-h-[44px]">Akademia</a>
              <a href="/vod" className="hover:text-[#f9282b] transition-colors inline-flex items-center min-h-[44px]">Kino VOD</a>
              <a href="/mojabiblia" className="hover:text-[#f9282b] transition-colors inline-flex items-center min-h-[44px]">Biblia</a>
              <a href="/biznes" className="hover:text-[#f9282b] transition-colors inline-flex items-center min-h-[44px]">Biznes</a>
              <a href="/kultura" className="hover:text-[#f9282b] transition-colors inline-flex items-center min-h-[44px]">Kultura</a>
              <a href="/biblioteka" className="hover:text-[#f9282b] transition-colors inline-flex items-center min-h-[44px]">Biblioteka</a>
              <a href="/news" aria-current="page" className="text-[#f9282b] font-black inline-flex items-center min-h-[44px] underline underline-offset-4">NEWS</a>
              <a href="/live" className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 min-h-[44px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE
              </a>
            </nav>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-zinc-400 font-serif">
            <span>Soli Deo Gloria</span>
          </div>
        </div>
      </div>

      {/* Main Brand & Nav Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="news-brand-row flex items-center justify-between gap-2 sm:gap-3 py-2 sm:py-3.5 flex-nowrap md:flex-wrap">
          {/* Brand & Mobile Edge Panel Trigger */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink">
            {/* Mobile + Trigger Button for Edge Panel */}
            <button
              type="button"
              onClick={() => setEdgePanelOpen(!edgePanelOpen)}
              className="md:hidden flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] shrink-0 rounded-xl bg-[#091526] border border-[#C4A35A]/50 text-[#E2CC9A] hover:text-white hover:border-[#C4A35A] transition-all cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-[#C4A35A]"
              aria-label={edgePanelOpen ? 'Zamknij panel nawigacji' : 'Otwórz panel nawigacji EkoCC'}
              aria-expanded={edgePanelOpen}
              aria-controls="cc-mobile-edge-panel"
            >
              {edgePanelOpen ? (
                <X className="w-5 h-5 text-[#E2CC9A]" strokeWidth={2.4} />
              ) : (
                <Plus className="w-6 h-6 text-[#E2CC9A]" strokeWidth={2.6} />
              )}
            </button>

            {/* Logo */}
            <a href="/news" className="news-brand-button group cursor-pointer focus:outline-none text-left block min-w-0 shrink" aria-label="CCN News – Christian Culture Strona Główna" title="Przejdź do strony głównej CCN News"><CcnLogo layout="horizontal" className="news-header-logo" disableLink={true} /></a>
          </div>

          {/* Mobile Compact Quick Actions (Radio, Search, Bookmarks) */}
          <div className="flex md:hidden items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onToggleRadio}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg transition cursor-pointer border ${
                isRadioPlaying
                  ? 'bg-[#bb142e] border-[#bb142e] text-white animate-pulse'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-200'
              }`}
              aria-label={isRadioPlaying ? 'Zatrzymaj Radio Live' : 'Włącz Radio Live'}
              title="Radio Christian Culture Na Żywo"
            >
              <Radio className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-gray-700 hover:text-[#bb142e] hover:bg-gray-100 rounded-lg transition cursor-pointer"
              aria-label="Szukaj artykułów"
              title="Szukaj w portalu"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onOpenBookmarks}
              className="hidden min-[360px]:inline-flex w-11 h-11 min-w-[44px] min-h-[44px] items-center justify-center text-gray-700 hover:text-[#bb142e] hover:bg-gray-100 rounded-lg transition relative cursor-pointer"
              aria-label="Zapisane artykuły"
              title="Zapisane artykuły"
            >
              <Bookmark className="w-5 h-5" />
              {bookmarksCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[#f9282b] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {bookmarksCount}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden 2xl:flex order-3 w-full flex-wrap items-center gap-5 xl:gap-7 text-sm font-medium text-gray-700">
            {NAV_ITEMS.map((item) => {
              const isActive = currentCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`transition-colors cursor-pointer pb-1 relative font-semibold flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#bb142e] font-bold border-b-2 border-[#bb142e]'
                      : 'hover:text-[#bb142e] text-gray-800'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded-full bg-red-100 text-[#bb142e]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action buttons (Radio Live, Search, Bookmarks, CC Auth) */}
          <div className="news-header-actions hidden md:flex items-center justify-center gap-2 sm:gap-3">
            {/* Live Radio Stream Button */}
            <button
              onClick={onToggleRadio}
              className={`flex items-center gap-1.5 px-3 min-h-[44px] rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer border ${
                isRadioPlaying
                  ? 'bg-[#bb142e] border-[#bb142e] text-white animate-pulse'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-200'
              }`}
              title="Polskie Radio Christian Culture - Transmisja Na Żywo"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Radio Live</span>
              {isRadioPlaying && <span className="w-2 h-2 rounded-full bg-white"></span>}
            </button>

            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-gray-700 hover:text-[#bb142e] hover:bg-gray-100 rounded-lg transition cursor-pointer"
              aria-label="Szukaj artykułów"
              title="Szukaj w portalu"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Bookmarks */}
            <button
              onClick={onOpenBookmarks}
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-gray-700 hover:text-[#bb142e] hover:bg-gray-100 rounded-lg transition relative cursor-pointer"
              aria-label="Zapisane artykuły"
              title="Zapisane artykuły"
            >
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
              {bookmarksCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#f9282b] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {bookmarksCount}
                </span>
              )}
            </button>

            {/* Universal Christian Culture & LUMINA Auth Widget */}
            <div id="ccAuthWidgetSlot" className="cc-auth-widget-container relative">
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-zinc-900 border border-amber-500/40 text-white text-xs font-semibold hover:border-amber-400 transition cursor-pointer shadow-xs"
                    title={`Zalogowano jako: ${currentUser.displayName}`}
                  >
                    <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-amber-400 shrink-0">
                      <img
                        src={currentUser.avatar || '/avatar_cezary_official.jpg'}
                        alt={currentUser.displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-black animate-pulse"></span>
                    </div>
                    <span className="hidden md:inline max-w-[85px] truncate">
                      {currentUser.displayName?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-400 hidden sm:inline" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 text-xs text-zinc-200 animate-in fade-in duration-100">
                      <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                        <p className="font-bold text-white truncate">{currentUser.displayName}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{currentUser.email || 'Członek LUMINA'}</p>
                      </div>

                      <a
                        href={profileHref}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 hover:text-white transition"
                      >
                        <User className="w-3.5 h-3.5 text-[#f9282b]" />
                        <span>Mój Profil Społeczności</span>
                      </a>

                      <a
                        href="/akademia"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 hover:text-white transition"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Moje Kursy Biblijne</span>
                      </a>

                      <a
                        href="/mojabiblia"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 text-zinc-200 hover:text-white transition"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        <span>Moja Biblia Interlinearna</span>
                      </a>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-950/40 text-red-400 hover:text-red-300 transition text-left mt-1 border-t border-zinc-800 pt-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Wyloguj się</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="cc-auth-google-btn flex items-center gap-1.5 px-3 min-h-[44px] rounded-full bg-[#010101] hover:bg-[#1a1a1a] text-white border border-amber-500/40 hover:border-amber-400 text-xs font-bold transition shadow-xs cursor-pointer"
                  title="Zaloguj się kontem Google do Ekosystemu Christian Culture"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="hidden sm:inline">Zaloguj się</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="2xl:hidden min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-gray-800 hover:text-[#bb142e] hover:bg-gray-100 rounded-lg transition cursor-pointer"
              aria-label={mobileMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="2xl:hidden border-t border-gray-200 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {NAV_ITEMS.map((item) => {
              const isActive = currentCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                    isActive
                      ? 'bg-red-50 text-[#bb142e]'
                      : 'text-gray-800 hover:bg-gray-100 hover:text-[#bb142e]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded-full bg-red-100 text-[#bb142e]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {/* Mobile Horizontal Category Pills */}
        <div className="mobile-category-pills md:hidden border-t border-gray-100 -mx-3 sm:-mx-4 px-3 py-1.5 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = currentCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 min-h-[38px] inline-flex items-center shrink-0 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#bb142e] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <CCMobileEdgePanel
        isOpen={edgePanelOpen}
        onClose={() => setEdgePanelOpen(false)}
        onOpenSearch={onOpenSearch}
        onOpenBookmarks={onOpenBookmarks}
        onOpenAbout={() => handleNavClick('about')}
        onToggleRadio={onToggleRadio}
        isRadioPlaying={isRadioPlaying}
        bookmarksCount={bookmarksCount}
        currentUser={currentUser}
        onLoginClick={handleLoginClick}
      />
    </header>
  );
};
