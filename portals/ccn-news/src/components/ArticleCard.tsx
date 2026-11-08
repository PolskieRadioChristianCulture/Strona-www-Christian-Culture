import React from 'react';
import { Article } from '../types';
import { Bookmark, Sparkles, FileText, UserCheck, BookOpen, Play } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onReadArticle: (article: Article) => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onReadArticle,
  isBookmarked,
  onToggleBookmark,
}) => {
  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md transition duration-200 border border-gray-100 flex flex-col justify-between group">
      <div>
        {/* Thumbnail with overlay & bookmark button */}
        <div className="relative overflow-hidden bg-gray-900 cursor-pointer" onClick={() => onReadArticle(article)}>
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-48 object-cover group-hover:scale-103 transition duration-500"
            loading="lazy"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(article);
            }}
            className="absolute top-0.5 right-0.5 w-11 h-11 flex items-center justify-center cursor-pointer group/bm"
            title={isBookmarked ? 'Usuń z zakładek' : 'Zapisz na później'}
            aria-label="Zapisz artykuł"
          >
            <span className={`p-1.5 rounded-md backdrop-blur-md transition ${
              isBookmarked
                ? 'bg-[#bb142e] text-white shadow-xs'
                : 'bg-black/50 text-white/90 group-hover/bm:bg-black/80 group-hover/bm:text-[#f9282b]'
            }`}>
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </span>
          </button>

          {/* Central play button overlay for video articles */}
          {article.youtubeVideoId && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
            </div>
          )}

          {/* Badges on image */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 flex-wrap">
            {article.youtubeVideoId && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white flex items-center gap-1 shadow-xs">
                <Play className="w-2.5 h-2.5 fill-white" />
                Wideo
              </span>
            )}
            {article.isInterview && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-black flex items-center gap-1 shadow-xs">
                <UserCheck className="w-3 h-3" />
                Wywiad
              </span>
            )}
            {article.biblicalCommentary && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#010101]/90 text-white border border-[#bb142e]/50 flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-[#f9282b]" />
                Komentarz Biblijny
              </span>
            )}
          </div>
        </div>

        {/* Text Body */}
        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <time>{article.dateFormatted}</time>
            <span className="text-[11px] font-bold text-[#bb142e] tracking-wider uppercase">
              {article.categoryLabel}
            </span>
          </div>

          <h3
            onClick={() => onReadArticle(article)}
            className="font-bold font-serif text-base mt-1 mb-2 leading-snug text-gray-900 hover:text-[#bb142e] transition cursor-pointer"
          >
            {article.title}
          </h3>

          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>

          {/* Press Citation source preview */}
          {article.sourceCitation && (
            <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-1 text-[11px] text-amber-800 font-medium">
              <FileText className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate">Źródło: {(article.sourceCitation.sourceName || article.sourceCitation.name || '').split('/')[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-4 pb-4 pt-1 flex items-center justify-between gap-2 border-t border-gray-50 mt-1">
        <button
          onClick={() => onReadArticle(article)}
          className="inline-flex items-center gap-1 min-h-[44px] text-xs text-[#bb142e] hover:text-[#981025] font-bold transition cursor-pointer group-hover:translate-x-0.5"
        >
          <span>Czytaj artykuł</span>
          <span>→</span>
        </button>

        <div className="flex items-center -mr-2.5">
          {/* Przycisk X (Twitter) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const url = typeof window !== 'undefined'
                ? `${window.location.origin}${window.location.pathname}?art=${article.id || article.slug}`
                : `https://polskieradio.cc/news?art=${article.id || article.slug}`;
              const text = `${article.title}\n\nCzytaj w CCN News:`;
              window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer,width=600,height=450');
            }}
            className="w-11 h-11 flex items-center justify-center cursor-pointer group/x"
            title="Udostępnij na platformie X"
            aria-label="Udostępnij na platformie X"
          >
            <span className="p-1.5 rounded-md bg-gray-100 group-hover/x:bg-black group-hover/x:text-white text-gray-700 transition flex items-center justify-center shadow-2xs"><svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg></span>
          </button>

          {/* Przycisk L (LUMINA) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const url = typeof window !== 'undefined'
                ? `${window.location.origin}${window.location.pathname}?art=${article.id || article.slug}`
                : `https://polskieradio.cc/news?art=${article.id || article.slug}`;
              const luminaUrl = `https://polskieradio.cc/tablica?share_url=${encodeURIComponent(url)}&share_title=${encodeURIComponent(article.title)}&share_image=${encodeURIComponent(article.imageUrl || '')}&share_img=${encodeURIComponent(article.imageUrl || '')}`;
              window.open(luminaUrl, '_blank', 'noopener,noreferrer');
            }}
            className="w-11 h-11 flex items-center justify-center cursor-pointer group/l"
            title="Udostępnij na Tablicy Społeczności LUMINA"
            aria-label="Udostępnij na Tablicy LUMINA"
          >
            <span className="w-7 h-7 rounded-full bg-[#0b0b10] flex items-center justify-center shadow-2xs transition group-hover/l:scale-110"><img src="/images/lumina/lumina-icon-transparent.png?v=20261025" alt="" width={20} height={20} className="w-5 h-5" /></span>
          </button>
        </div>
      </div>
    </article>
  );
};
