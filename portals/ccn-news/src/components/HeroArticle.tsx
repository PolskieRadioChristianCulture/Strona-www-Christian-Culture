import React from 'react';
import { Article } from '../types';
import { ArrowRight, Bookmark } from 'lucide-react';

interface HeroArticleProps {
  article: Article;
  onReadArticle: (article: Article) => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: Article) => void;
}

export const HeroArticle: React.FC<HeroArticleProps> = ({
  article,
  onReadArticle,
  isBookmarked,
  onToggleBookmark,
}) => {
  return (
    <article className="relative rounded-xl overflow-hidden shadow-lg group bg-black transition duration-300">
      {/* Background Image */}
      <img
        src={article.imageUrl}
        alt={article.imageAlt || `${article.title} — ilustracja redakcyjna CCN`}
        className="w-full h-auto max-h-[340px] object-contain object-center bg-black motion-safe:transition duration-700 ease-out"
      />
      {article.imageCaption && (
        <p className="bg-zinc-900 px-4 py-2 text-[11px] leading-relaxed text-zinc-300">{article.imageCaption}</p>
      )}


      {/* Top actions: Share to X, Lumina & Bookmark */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const url = typeof window !== 'undefined'
              ? `${window.location.origin}${window.location.pathname}?art=${article.id || article.slug}`
              : `https://polskieradio.cc/news?art=${article.id || article.slug}`;
            const text = `${article.title}\n\nCzytaj w CCN News:`;
            window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer,width=600,height=450');
          }}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md transition cursor-pointer shadow-md"
          title="Udostępnij na platformie X"
          aria-label="Udostępnij na platformie X"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            const url = typeof window !== 'undefined'
              ? `${window.location.origin}${window.location.pathname}?art=${article.id || article.slug}`
              : `https://polskieradio.cc/news?art=${article.id || article.slug}`;
            const luminaUrl = `https://polskieradio.cc/tablica?share_url=${encodeURIComponent(url)}&share_title=${encodeURIComponent(article.title)}&share_image=${encodeURIComponent(article.imageUrl || '')}&share_img=${encodeURIComponent(article.imageUrl || '')}`;
            window.open(luminaUrl, '_blank', 'noopener,noreferrer');
          }}
          className="w-11 h-11 rounded-full bg-black/60 hover:bg-black backdrop-blur-md flex items-center justify-center transition cursor-pointer shadow-md"
          title="Udostępnij na Tablicy Społeczności LUMINA"
          aria-label="Udostępnij na Tablicy LUMINA"
        >
          <img src="/images/lumina/lumina-icon-transparent.png?v=20261025" alt="" width={20} height={20} className="w-5 h-5 object-contain" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(article);
          }}
          className={`w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md transition cursor-pointer ${
            isBookmarked
              ? 'bg-[#bb142e] text-white shadow-md'
              : 'bg-black/50 text-white/90 hover:bg-black/80 hover:text-[#f9282b]'
          }`}
          title={isBookmarked ? 'Usuń z zakładek' : 'Zapisz na później'}
          aria-label="Zapisz artykuł"
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content bottom left */}
      <div className="relative p-5 sm:p-8 text-white z-10">
        <span className="inline-block bg-[#bb142e] text-white text-[11px] font-extrabold px-3 py-1 rounded mb-3 tracking-wider uppercase shadow-xs">
          {article.categoryLabel}
        </span>

        <h1
          onClick={() => onReadArticle(article)}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3 cursor-pointer hover:text-red-100 transition"
        >
          {article.title}
        </h1>

        <p className="text-gray-200 text-sm sm:text-base mb-5 line-clamp-2 sm:line-clamp-3 leading-relaxed">
          {article.excerpt}
        </p>

        <button
          onClick={() => onReadArticle(article)}
          className="inline-flex items-center gap-2 min-h-[44px] bg-[#bb142e] hover:bg-[#981025] text-white text-sm font-bold px-5 py-2.5 rounded transition cursor-pointer shadow-md active:translate-y-0.5"
        >
          <span>Czytaj więcej</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
};
