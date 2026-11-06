import React, { useState } from 'react';
import { CcnLogo } from './CcnLogo';
import { Mail, Shield, FileText } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <>
      <footer className="bg-[#010101] text-zinc-300 mt-16 border-t border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <div className="mb-4">
                <CcnLogo layout="horizontal" theme="dark" subLabel="KULTURA" subTitle="Centrum Kultury" />
              </div>

              <p className="text-sm text-gray-400 leading-relaxed">
                CCN Kultura to centrum życia kulturalnego i duchowego ekosystemu Christian Culture.
                <br />
                Sztuka. Muzyka. Film. Uświęcenie z nadzieją.
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
                  href="https://youtube.com/@RadioChristianCulture"
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

            {/* Nawigacja Ekosystemu */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Nawigacja Ekosystemu
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://polskieradio.cc" className="hover:text-white text-gray-400 transition block">
                    Polskie Radio CC
                  </a>
                </li>
                <li>
                  <a href="/news" className="hover:text-white text-gray-400 transition block">
                    CCN News – Wiadomości
                  </a>
                </li>
                <li>
                  <a href="/kultura" className="text-[#f9282b] font-semibold transition block">
                    Centrum Kultury CC
                  </a>
                </li>
                <li>
                  <a href="/biznes" className="hover:text-white text-gray-400 transition block">
                    Business Hub CC
                  </a>
                </li>
                <li>
                  <a href="/lumina" className="hover:text-white text-gray-400 transition block">
                    Portal Społeczności LUMINA
                  </a>
                </li>
              </ul>
            </div>

            {/* Edukacja & Media */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Edukacja & Media
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/vod" className="hover:text-white text-gray-400 transition block">
                    Kino Chrześcijańskie VOD
                  </a>
                </li>
                <li>
                  <a href="/akademia" className="hover:text-white text-gray-400 transition block">
                    Akademia Biblijna CC
                  </a>
                </li>
                <li>
                  <a href="/mojabiblia" className="hover:text-white text-gray-400 transition block">
                    MojaBiblia Interlinearna
                  </a>
                </li>
                <li>
                  <a href="/news#leksykon" className="hover:text-white text-gray-400 transition block">
                    Leksykon Wiary & Encyklopedia
                  </a>
                </li>
                <li>
                  <a href="/live" className="text-emerald-400 hover:text-emerald-300 transition block">
                    Transmisja Na Żywo CCTV24
                  </a>
                </li>
              </ul>
            </div>

            {/* Kontakt & Informacje Prawne */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Kontakt & Zaufanie
              </h4>
              <p className="text-sm text-gray-400 mb-3 leading-relaxed">
                Masz pytania dotyczące twórczości, audycji lub chcesz współtworzyć kulturę?
              </p>
              <a
                href="mailto:redakcjaccn@gmail.com"
                className="inline-flex items-center gap-2 text-sm text-[#f9282b] hover:text-white transition font-medium mb-4"
              >
                <Mail className="w-4 h-4" />
                redakcjaccn@gmail.com
              </a>

              <div className="pt-2 border-t border-zinc-800 space-y-1.5 text-xs text-gray-400">
                <button
                  onClick={() => setActiveModal('terms')}
                  className="hover:text-white transition cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-zinc-500" />
                  Statut Kultury Chrześcijańskiej
                </button>
                <button
                  onClick={() => {
                    if (onOpenPrivacy) onOpenPrivacy();
                    else setActiveModal('privacy');
                  }}
                  className="hover:text-white transition cursor-pointer flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-zinc-500" />
                  Polityka Prywatności & RODO
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[#1f1f1f] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
            <p>© 2026 Christian Culture. Wszelkie prawa zastrzeżone.</p>
            <p className="font-serif italic text-gray-400">Soli Deo Gloria</p>
          </div>
        </div>
      </footer>

      {/* Regulamin Modal */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 text-zinc-200 text-sm max-h-[85vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Statut i Wartości Centrum Kultury CC</h3>
            <p className="mb-3 text-zinc-300">
              1. <strong>Chwała Boża:</strong> Cała twórczość, sztuka, muzyka i publicystyka w ekosystemie Christian Culture ma na celu uwielbienie Boga i budowanie wiary.
            </p>
            <p className="mb-3 text-zinc-300">
              2. <strong>Czystość Przekazu:</strong> Promujemy treści wolne od wulgarności, nihilizmu i relatywizmu, oparte na prawdzie Pisma Świętego.
            </p>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-[#bb142e] hover:bg-[#981025] text-white font-bold rounded-xl transition"
            >
              Rozumiem
            </button>
          </div>
        </div>
      )}

      {/* Polityka Prywatności Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 text-zinc-200 text-sm max-h-[85vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Polityka Prywatności</h3>
            <p className="mb-3 text-zinc-300">
              Dane użytkowników są bezpieczne i służą wyłącznie do obsługi personalizacji w serwisach Christian Culture.
            </p>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-[#bb142e] hover:bg-[#981025] text-white font-bold rounded-xl transition"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </>
  );
};
