import { PortalPatron } from './PortalPatron';
import React, { useState } from 'react';
import { Category } from '../types';
import { Mail } from 'lucide-react';
import { CcnLogo } from './CcnLogo';

interface FooterProps {
  onSelectCategory: (cat: Category) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  const handleNavClick = (cat: Category) => {
    onSelectCategory(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="news-footer bg-[#010101] text-zinc-300 mt-16 border-t border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="news-footer-grid grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <div className="mb-4"><a href="/news" className="inline-block hover:opacity-90 transition-opacity cursor-pointer" title="Przejdź do strony głównej CCN News" aria-label="CCN News – Strona Główna"><CcnLogo layout="horizontal" theme="dark" disableLink={true} /></a></div>

              <p className="text-sm text-gray-400 leading-relaxed">
                CCN Finanse & Gospodarność – chrześcijańskie analizy, wiara i prawda.
                <br />
                Wiara. Kultura. Świat. Z nadzieją.
              </p>

              {/* Social icons */}
              <div className="flex gap-4 mt-5">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-neutral-800 transition text-xs font-bold"
                  aria-label="Facebook"
                >
                  f
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-neutral-800 transition text-xs font-bold"
                  aria-label="Instagram"
                >
                  ig
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-neutral-800 transition text-xs font-bold"
                  aria-label="YouTube"
                >
                  yt
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-neutral-800 transition text-xs font-bold"
                  aria-label="X (Twitter)"
                >
                  x
                </a>
              </div>
            </div>

            {/* Nawigacja */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Nawigacja
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => handleNavClick('home')}
                    className="hover:text-white text-gray-400 transition cursor-pointer"
                  >
                    Strona Główna
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick('kraj')}
                    className="hover:text-white text-gray-400 transition cursor-pointer"
                  >
                    Wiadomości z Kraju
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick('swiat')}
                    className="hover:text-white text-gray-400 transition cursor-pointer"
                  >
                    Wiadomości ze Świata
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick('wywiady')}
                    className="hover:text-white text-gray-400 transition cursor-pointer"
                  >
                    Wywiady & Teologia
                  </button>
                </li>
              </ul>
            </div>

            {/* Kategorie */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Edukacja & Zasoby
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => handleNavClick('leksykon')}
                    className="hover:text-white text-gray-400 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Leksykon Wiary</span>
                  </button>
                </li>
                <li>
                  <a
                    href="/akademia"
                    className="hover:text-white text-gray-400 transition cursor-pointer block"
                  >
                    Akademia Biblijna CC
                  </a>
                </li>
                <li>
                  <a
                    href="/mojabiblia"
                    className="hover:text-white text-gray-400 transition cursor-pointer block"
                  >
                    Moja Biblia Interlinearna
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick('muzyka')}
                    className="hover:text-white text-gray-400 transition cursor-pointer"
                  >
                    Media & Muzyka CC
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick('about')}
                    className="hover:text-white text-gray-400 transition cursor-pointer"
                  >
                    O portalu CCN News
                  </button>
                </li>
              </ul>
            </div>

            {/* Kontakt */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Kontakt
              </h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-red-500 shrink-0" />
                  <a href="mailto:redakcjaccn@gmail.com" className="hover:text-white transition">
                    redakcjaccn@gmail.com
                  </a>
                </li>
                <li className="pt-2 text-xs text-stone-500">
                  Ekosystem Christian Culture · Lumina Web App
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8"><PortalPatron dark /></div>

          {/* Bottom Bar */}
            <div className="news-footer-bottom border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
            <p>© 2024–2026 CCN News – Christian Culture. Wszelkie prawa zastrzeżone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveModal('privacy')}
                className="hover:text-gray-300 transition cursor-pointer"
              >
                Polityka prywatności
              </button>
              <span>·</span>
              <button
                onClick={() => setActiveModal('terms')}
                className="hover:text-gray-300 transition cursor-pointer"
              >
                Regulamin
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white text-gray-900 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-gray-900 mb-3">Polityka prywatności CCN News</h3>
            <div className="text-xs text-gray-600 space-y-3 leading-relaxed">
              <p>
                Szanujemy prywatność użytkowników portalu CCN News w ekosystemie Christian Culture. Wszelkie dane przekazywane podczas zapisu do newslettera są przetwarzane wyłącznie w celu dostarczania zamówionych informacji prasowych i rozważań duchowych.
              </p>
              <p>
                Portal nie przekazuje ani nie sprzedaje danych osobowych podmiotom trzecim. W każdej chwili możesz zrezygnować z subskrypcji.
              </p>
              <p>
                W celu analizy ruchu i zapewnienia optymalnego działania strony wykorzystujemy standardowy tag analityczny Google Analytics (G-M24C85RG49).
              </p>
            </div>
            <div className="mt-5 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {activeModal === 'terms' && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white text-gray-900 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-gray-900 mb-3">Regulamin portalu CCN News</h3>
            <div className="text-xs text-gray-600 space-y-3 leading-relaxed">
              <p>
                1. Portal informacyjny CCN News stanowi platformę wymiany myśli, wiedzy i świadectw w duchu wartości chrześcijańskich.
              </p>
              <p>
                2. Wszelkie treści, artykuły, zdjęcia i rozważania publikowane w portalu podlegają ochronie praw autorskich. Cytowanie jest dozwolone z podaniem źródła (CCN News – polskieradio.cc).
              </p>
              <p>
                3. Użytkownicy zobowiązani są do kulturalnej wymiany zdań z poszanowaniem godności każdego człowieka.
              </p>
            </div>
            <div className="mt-5 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
