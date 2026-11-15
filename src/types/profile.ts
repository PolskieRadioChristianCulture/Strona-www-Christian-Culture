/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA TYPED DATA CONTRACTS - PROFILE MODEL
 * ══════════════════════════════════════════════════════════════════════════
 */

export type Gender = 'kobieta' | 'mezczyzna' | 'unknown';

export interface LuminaProfile {
  id?: string;
  uid?: string;
  slug: string;
  name: string;
  gender?: Gender;
  age?: number | string;
  city?: string;
  denom?: string;
  church?: string;
  job?: string;
  status?: string;
  verse?: string;
  verseRef?: string;
  bio?: string;
  avatar?: string;
  coverMedia?: string;
  tags?: string[];
  photos?: string[];
  badges?: string[];
  isFounder?: boolean;
  isMissionAccount?: boolean;
  isMission?: boolean;
  isNew?: boolean;
  visibility?: 'public' | 'private' | 'community';
  isOnline?: boolean;
  isVerified?: boolean;
  matchScore?: string | null;
  likesCount?: number;
  followersCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface ProfileFilterOptions {
  gender?: 'all' | 'kobieta' | 'mezczyzna';
  onlyNew?: boolean;
  searchQuery?: string;
  denomination?: string;
}
