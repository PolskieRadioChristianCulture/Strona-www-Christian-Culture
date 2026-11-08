import { PortalPatron } from './PortalPatron';
import { CcnAudioPlayer } from './CcnAudioPlayer';
import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { 
  X, Bookmark, Share2, Check, Clock, Calendar, Type, 
  BookOpen, Sparkles, ExternalLink, Radio, FileText, UserCheck
} from 'lucide-react';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: Article) => void;
  onSelectRelatedArticle: (article: Article) => void;
  relatedArticles: Article[];
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onSelectRelatedArticle,
  relatedArticles,
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!article) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Lock background page scroll ONLY when modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [article, onClose]);

  if (!article) return null;

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const path = window.location.pathname;
      return `${origin}${path}?art=${article.id || article.slug}`;
    }
    return `https://polskieradio.cc/finanse/${article.slug || article.id}`;
  };

  const handleCopyLink = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getShareUrl();
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareX = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getShareUrl();
    const text = `${article.title}\n\nCzytaj w CCN Finanse | Christian Culture:`;
    const xUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
  };

  const handleShareLumina = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getShareUrl();
    if (typeof (window as any).ccShareToLumina === 'function') {
      (window as any).ccShareToLumina({
        url,
        title: article.title,
        excerpt: article.excerpt,
        imageUrl: article.imageUrl,
        category: article.categoryLabel
      });
    } else {
      const luminaUrl = `https://polskieradio.cc/tablica?share_url=${encodeURIComponent(url)}&share_title=${encodeURIComponent(article.title)}&share_image=${encodeURIComponent(article.imageUrl || '')}`;
      window.open(luminaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShareFacebook = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-lg leading-relaxed';
      case 'xlarge':
        return 'text-xl leading-loose';
      default:
        return 'text-base leading-relaxed';
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overscroll-contain animate-in fade-in duration-200"
    >
      <div
        className="bg-white text-gray-900 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Top Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#bb142e]">
            <span className="w-2 h-2 rounded-full bg-[#bb142e]"></span>
            <span>{article.categoryLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Font size toggles */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-medium text-gray-600">
              <Type className="w-3.5 h-3.5 ml-1 text-gray-400" />
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded cursor-pointer ${fontSize === 'normal' ? 'bg-white shadow-xs text-gray-900 font-bold' : 'hover:text-gray-900'}`}
                title="Normalna czcionka"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded cursor-pointer ${fontSize === 'large' ? 'bg-white shadow-xs text-gray-900 font-bold' : 'hover:text-gray-900'}`}
                title="Większa czcionka"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-0.5 rounded cursor-pointer ${fontSize === 'xlarge' ? 'bg-white shadow-xs text-gray-900 font-bold' : 'hover:text-gray-900'}`}
                title="Bardzo duża czcionka"
              >
                A++
              </button>
            </div>

            {/* Bookmark button */}
            <button
              onClick={() => onToggleBookmark(article)}
              className={`p-2 rounded-lg transition cursor-pointer border ${
                isBookmarked
                  ? 'bg-red-50 border-red-200 text-[#bb142e]'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#bb142e]'
              }`}
              title={isBookmarked ? 'Zapisano w ulubionych' : 'Zapisz artykuł'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#bb142e]' : ''}`} />
            </button>

            {/* Share to X button */}
            <button
              onClick={handleShareX}
              className="p-2 bg-black hover:bg-zinc-800 text-white rounded-lg transition cursor-pointer flex items-center justify-center border border-zinc-700 shadow-xs"
              title="Udostępnij na platformie X"
              aria-label="Udostępnij na platformie X"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>

            {/* Share to Lumina button */}
            <button
              onClick={handleShareLumina}
              className="px-2.5 py-1.5 bg-gradient-to-r from-[#bb142e] to-[#800d1e] hover:from-[#d11735] hover:to-[#9a1024] text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-amber-400/30 shadow-xs"
              title="Udostępnij na Tablicy Społeczności LUMINA"
              aria-label="Udostępnij na Tablicy Społeczności LUMINA"
            >
              <span className="w-4 h-4 rounded-full bg-amber-400 text-black font-black text-[10px] flex items-center justify-center">L</span>
              <span className="hidden sm:inline text-[11px]">Tablica</span>
            </button>

            {/* Copy Link button */}
            <button
              onClick={handleCopyLink}
              className="p-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs"
              title="Kopiuj link do artykułu"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-600 font-semibold">Skopiowano!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Kopiuj</span>
                </>
              )}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer ml-1"
              aria-label="Zamknij artykuł"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6 overscroll-contain flex-1 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Article Header */}
          <div className="space-y-4">
            <h1 className="font-serif-headline text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              {article.title}
            </h1>

            <p className="text-gray-600 text-base sm:text-lg font-normal leading-relaxed">
              {article.excerpt}
            </p>

            {/* Interviewee banner if applicable */}
            {article.isInterview && article.interviewee && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-center gap-4 my-2">
                <div className="w-12 h-12 rounded-full bg-[#bb142e] text-white flex items-center justify-center font-bold text-lg shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#bb142e] block">
                    Rozmówca Redakcji CCN News:
                  </span>
                  <h3 className="font-bold text-base text-gray-900">{article.interviewee.name}</h3>
                  <p className="text-xs text-gray-600">{article.interviewee.title}</p>
                </div>
              </div>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2 border-y border-gray-100 py-3">
              <div className="flex items-center gap-2">
                <img
                  src={article.author.avatarUrl}
                  alt={article.author.name}
                  className="w-7 h-7 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <span className="font-semibold text-gray-900">{article.author.name}</span>
                  {article.author.role && (
                    <span className="text-gray-500 ml-1.5 hidden sm:inline">({article.author.role})</span>
                  )}
                </div>
              </div>

              <span className="text-gray-300">|</span>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <time>{article.dateFormatted}</time>
              </div>

              <span className="text-gray-300">|</span>

              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{article.readTimeMinutes} min czytania</span>
              </div>
            </div>

            {/* Social Share Bar Top */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-zinc-50 border border-zinc-200/90 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <Share2 className="w-3.5 h-3.5 text-[#bb142e]" />
                <span>Udostępnij tę publikację:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Przycisk X (Twitter) */}
                <button
                  onClick={handleShareX}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs min-h-[36px]"
                  title="Udostępnij na platformie X"
                  aria-label="Udostępnij na platformie X"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Udostępnij na X</span>
                </button>
                {/* Przycisk LUMINA */}
                <button
                  onClick={handleShareLumina}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#bb142e] to-[#800d1e] hover:from-[#d11735] hover:to-[#9a1024] text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs border border-amber-400/30 min-h-[36px]"
                  title="Udostępnij na Tablicy Społeczności LUMINA"
                  aria-label="Udostępnij na Tablicy LUMINA"
                >
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-black font-black text-[10px] flex items-center justify-center">L</span>
                  <span>Tablica LUMINA</span>
                </button>
                {/* Przycisk Facebook */}
                <button
                  onClick={handleShareFacebook}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs min-h-[36px]"
                  title="Udostępnij na Facebooku"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="hidden sm:inline">Facebook</span>
                </button>
                {/* Kopiuj link */}
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer min-h-[36px]"
                  title="Kopiuj link do artykułu"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Skopiowano!' : 'Kopiuj'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Visual Media: YouTube Video or Image */}
          {article.youtubeVideoId ? (
            <figure className="bg-black rounded-xl overflow-hidden border border-gray-900 shadow-lg">
              <div className="relative w-full pt-[56.25%]">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${article.youtubeVideoId}?rel=0&modestbranding=1`}
                  title={article.title}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              {article.imageCaption && (
                <figcaption className="bg-zinc-950 text-gray-400 text-xs px-4 py-2 text-center border-t border-zinc-800 flex items-center justify-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-red-500" />
                  <span>{article.imageCaption}</span>
                </figcaption>
              )}
            </figure>
          ) : (
            <figure className="bg-[#111111] rounded-xl overflow-hidden border border-gray-900 shadow-md">
              <div className="flex items-center justify-center p-2 sm:p-4 min-h-[260px]">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="ccn-article-media"
                  style={{ objectFit: 'contain', maxHeight: '520px', width: '100%' }}
                />
              </div>
              {article.imageCaption && (
                <figcaption className="bg-black/90 text-gray-400 text-xs px-4 py-2 text-center border-t border-gray-800">
                  {article.imageCaption}
                </figcaption>
              )}
            </figure>
          )}

          {/* CCN Audio Player Premium 2026 */}
          <CcnAudioPlayer audio={article.audio} />

          {/* Source Citation Box (Christian Wikipedia standard: legal press quotes) */}
          {article.sourceCitation && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-950 my-4">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-900 mb-1 text-[11px]">
                <FileText className="w-3.5 h-3.5 text-amber-700" />
                Źródło opracowania
              </div>
              {article.sourceCitation.quotationText && (
                <div className="italic text-gray-800 my-2 pl-3 border-l-2 border-amber-500 text-xs sm:text-sm">
                  {article.sourceCitation.quotationText}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-amber-900/80 pt-2 border-t border-amber-200/60 mt-2">
                <span>Źródło: <strong>{article.sourceCitation.sourceName || article.sourceCitation.name}</strong> {article.sourceCitation.quotationDate && `(${article.sourceCitation.quotationDate})`}</span>
                {article.sourceCitation.sourceUrl && (
                  <a href={article.sourceCitation.sourceUrl || article.sourceCitation.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-amber-900 font-semibold flex items-center gap-0.5">
                    Otwórz źródło <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Scripture Reference Quote if present */}
          {article.scriptureReference && (
            <div className="bg-red-50/70 border-l-4 border-[#bb142e] p-4 sm:p-5 rounded-r-xl my-6">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#bb142e] text-xs uppercase tracking-wider">
                  {article.scriptureReference.verse}
                </span>
                {article.scriptureReference.strongCode && (
                  <a
                    href="https://polskieradio.cc/mojabiblia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-[#bb142e] hover:underline flex items-center gap-1"
                  >
                    Strong {article.scriptureReference.strongCode} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <blockquote className="font-serif italic text-gray-800 text-base sm:text-lg leading-relaxed">
                „{article.scriptureReference.text}”
              </blockquote>
            </div>
          )}

          {/* Article Full Content */}
          <div className={`prose max-w-none text-gray-800 space-y-4 font-normal ${getFontSizeClass()}`}>
            {article.content.map((paragraph, index) => {
              if (/^(\d+\. |PODSUMOWANIE REDAKCYJNE|Podsumowanie$|Źródła i teksty biblijne$|Kluczowe informacje$|Kontekst i analiza$|Refleksja biblijna$|Źródła$)/.test(paragraph)) {
                return <h2 key={index} className="font-serif font-bold text-xl pt-4">{paragraph}</h2>;
              }
              const isInterviewSpeaker = article.isInterview === true && paragraph.startsWith('CCN News:');
              return (
                <p 
                  key={index} 
                  className={`leading-relaxed ${isInterviewSpeaker ? 'font-medium bg-zinc-50 p-3 rounded-lg border-l-2 border-[#bb142e]' : ''}`}
                >
                  {paragraph}
                </p>
              );
            })}
          </div>

          {article.resourceLinks && (
            <nav aria-label="Źródła i społeczność programu" className="flex flex-wrap gap-3 border-t border-gray-200 pt-4">
              {article.resourceLinks.map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-50">
                  {link.label}<ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              ))}
            </nav>
          )}

          {/* Biblical Commentary Box */}
          {article.biblicalCommentary && (
            <div className="bg-gradient-to-br from-[#010101] via-[#140507] to-[#010101] text-white rounded-xl p-5 sm:p-6 border border-[#bb142e]/30 my-6 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f9282b] mb-2">
                <Sparkles className="w-4 h-4" />
                Komentarz Egzegetyczny Redakcji CCN News
              </div>
              <h4 className="font-serif font-bold text-base sm:text-lg text-white mb-2 leading-snug">
                {article.biblicalCommentary.thesis}
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
                {article.biblicalCommentary.explanation}
              </p>
              <div className="space-y-2.5 pt-3 border-t border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Kluczowe Odnośniki Biblijne (Moja Biblia):
                </span>
                {article.biblicalCommentary.verses.map((v, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/10 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#f9282b]">{v.ref}</span>
                      {v.strongRef && (
                        <a
                          href={v.strongUrl || 'https://polskieradio.cc/mojabiblia'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 font-mono"
                        >
                          {v.strongRef} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <p className="italic text-zinc-200">„{v.text}”</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lexicon Terms Box */}
          {article.lexiconTerms && article.lexiconTerms.length > 0 && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 my-4">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#bb142e]" />
                Pojęcia Leksykonu Chrześcijańskiego powiązane z artykułem
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {article.lexiconTerms.map((term, tIdx) => (
                  <div key={tIdx} className="bg-white p-3 rounded-lg border border-zinc-200 text-xs shadow-2xs">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-gray-900">{term.term}</span>
                      {term.strongCode && (
                        <span className="font-mono text-[10px] bg-red-50 text-[#bb142e] px-1.5 py-0.5 rounded border border-red-200 font-bold">
                          Strong {term.strongCode}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-[11px] leading-snug mt-1">{term.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Course Banner */}
          {article.relatedCourse && (
            <div className="bg-gradient-to-r from-[#bb142e] to-[#800d1e] text-white p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 my-6 shadow-md">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">
                  {article.relatedCourse.badge || 'Akademia Biblijna'}
                </span>
                <h4 className="font-serif font-bold text-base mt-1 text-white">
                  {article.relatedCourse.title}
                </h4>
                <p className="text-xs text-white/90">{article.relatedCourse.lesson}</p>
              </div>
              <a
                href={article.relatedCourse.url}
                className="shrink-0 bg-white text-gray-900 hover:bg-zinc-100 px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <span>Otwórz Lekcję w Akademii</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Related Music Track */}
          {article.relatedMusic && (
            <div className="bg-[#0a0a0a] text-white p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 my-6 border border-zinc-800 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#bb142e] flex items-center justify-center text-white shrink-0">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#f9282b]">
                    {article.relatedMusic.badge || 'Muzyka Christian Culture'}
                  </span>
                  <h4 className="font-bold text-sm text-white">{article.relatedMusic.title}</h4>
                  <p className="text-xs text-zinc-400">{article.relatedMusic.artist}</p>
                </div>
              </div>
              <a
                href="/player"
                className="shrink-0 bg-[#bb142e] hover:bg-[#981025] text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Słuchaj w Playerze</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Tags */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
                Tematy:
              </span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-md transition"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Social Share Callout Bottom */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-black text-white p-4 sm:p-5 rounded-xl border border-zinc-800 my-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block mb-1">
                GŁOŚ PRAWDĘ • PODAJ DALEJ
              </span>
              <h4 className="font-bold text-sm sm:text-base text-white">
                Podziel się tą publikacją w mediach społecznościowych!
              </h4>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleShareX}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-bold transition cursor-pointer shadow-sm min-h-[44px]"
                title="Udostępnij na platformie X"
                aria-label="Udostępnij na platformie X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Udostępnij na X</span>
              </button>
              <button
                onClick={handleShareLumina}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#bb142e] to-[#800d1e] hover:from-[#d11735] hover:to-[#9a1024] text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm border border-amber-400/30 min-h-[44px]"
                title="Udostępnij na Tablicy Społeczności LUMINA"
                aria-label="Udostępnij na Tablicy LUMINA"
              >
                <span className="w-4 h-4 rounded-full bg-amber-400 text-black font-black text-[10px] flex items-center justify-center">L</span>
                <span>Tablica LUMINA</span>
              </button>
              <button
                onClick={handleShareFacebook}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm min-h-[44px]"
                title="Udostępnij na Facebooku"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="hidden sm:inline">Facebook</span>
              </button>
            </div>
          </div>

          {/* Author Bio Box */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <img
              src={article.author.avatarUrl}
              alt={article.author.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#bb142e] shadow-xs"
            />
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h4 className="font-bold text-gray-900 text-base">{article.author.name}</h4>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-medium">
                  {article.author.role}
                </span>
                {article.author.status && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                    Status: {article.author.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                {article.author.bio || 'Dziennikarz i autor tekstów w portalu CCN News – Christian Culture.'}
              </p>
            </div>
          </div>

          <PortalPatron />

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#bb142e] rounded"></span>
                Polecane artykuły
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relatedArticles.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelatedArticle(rel)}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:border-[#bb142e] hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <img
                        src={rel.imageUrl}
                        alt={rel.title}
                        className="w-full h-28 object-cover rounded-md mb-2"
                      />
                      <span className="text-[10px] font-bold text-[#bb142e] uppercase tracking-wide">
                        {rel.categoryLabel}
                      </span>
                      <h5 className="font-semibold text-xs text-gray-900 line-clamp-2 mt-1 hover:text-[#bb142e]">
                        {rel.title}
                      </h5>
                    </div>
                    <time className="text-[10px] text-gray-400 mt-2 block">
                      {rel.dateFormatted}
                    </time>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
