export type Category =
  | 'home'
  | 'kraj'
  | 'swiat'
  | 'wywiady'
  | 'leksykon'
  | 'kursy'
  | 'muzyka'
  | 'wiara'
  | 'opinia'
  | 'about'
  | string;

export interface Author {
  id: string;
  name: string;
  role: string;
  status?: string;
  avatarUrl: string;
  bio?: string;
}

export interface SourceCitation {
  sourceName: string;
  /** Starsze wpisy używają name/url zamiast sourceName/sourceUrl. */
  name?: string;
  url?: string;
  sourceUrl?: string;
  quotationDate?: string;
  originalTitle?: string;
  quotationText?: string;
}

export interface BiblicalCommentary {
  thesis: string;
  verses: {
    ref: string;
    text: string;
    strongRef?: string;
    strongUrl?: string;
  }[];
  explanation: string;
}

export interface LexiconTermRef {
  term: string;
  strongCode?: string;
  definition: string;
  category?: string;
}

export interface LexiconEntry {
  id: string;
  term: string;
  originalScript?: string;
  transliteration?: string;
  strongCode?: string;
  partOfSpeech?: string;
  definition: string;
  biblicalContext: string;
  keyVerses: {
    ref: string;
    text: string;
  }[];
  relatedCourseLesson?: {
    title: string;
    url: string;
  };
  tags: string[];
  category: 'teologia' | 'etyka' | 'oryginal' | 'spoleczenstwo' | 'proroctwa';
}

export interface RelatedCourse {
  title: string;
  lesson: string;
  url: string;
  badge?: string;
}

export interface RelatedMusic {
  title: string;
  artist: string;
  streamUrl?: string;
  badge?: string;
}

export interface ArticleAudio {
  articleId: string;
  title: string;
  reader?: string;
  audioUrl: string;
  driveId?: string;
  mimeType: string;
  durationSeconds: number;
  peaks?: number[];
  transcriptUrl?: string;
  chapters?: { title: string; startSeconds: number }[];
  publicationStatus: 'published' | 'draft';
  downloadAllowed?: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string[];
  scriptureReference?: {
    verse: string;
    text: string;
    strongCode?: string;
  };
  category: Category;
  categoryLabel: string;
  author: Author;
  publishedAt: string;
  updatedAt?: string;
  dateFormatted: string;
  imageUrl: string;
  imageCaption?: string;
  /** Standard CCN Premium: opis alternatywny grafiki (WCAG); domyślnie tytuł. */
  imageAlt?: string;
  /** Standard CCN Premium: tytuł SEO do 60 znaków; domyślnie title. */
  seoTitle?: string;
  /** Standard CCN Premium: meta description 120–160 znaków; domyślnie excerpt. */
  metaDescription?: string;
  /** Seria redakcyjna, np. Ziemskie pytania — Niebiańskie odpowiedzi. */
  series?: string;
  /** Standard CCN Premium: pełna lista źródeł pierwotnych z linkami. */
  sources?: { label: string; url: string }[];
  /** Linki działań (MojaBiblia, kursy) — dane historyczne. */
  actionLinks?: { label: string; url: string }[];
  readTimeMinutes: number;
  isHero?: boolean;
  isPopular?: boolean;
  popularRank?: number;
  tags: string[];
  viewsCount?: number;
  // Editorial enhancements
  sourceCitation?: SourceCitation;
  biblicalCommentary?: BiblicalCommentary;
  lexiconTerms?: LexiconTermRef[];
  relatedCourse?: RelatedCourse;
  resourceLinks?: { label: string; url: string }[];
  relatedMusic?: RelatedMusic;
  youtubeVideoId?: string;
  videoUrl?: string;
  isInterview?: boolean;
  interviewee?: {
    name: string;
    title: string;
    avatarUrl?: string;
  };
  audio?: ArticleAudio;
  primaryPortalUrl?: string;
  primaryPortalLabel?: string;
}
