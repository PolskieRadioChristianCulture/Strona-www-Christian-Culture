/**
 * ==========================================================================
 * LUMINA FEED POST REPOSITORY
 * Isolates all Firestore operations for Posts, Campaigns & Reactions
 * ==========================================================================
 */
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  increment, 
  serverTimestamp, 
  Unsubscribe 
} from "firebase/firestore";
import { auth, db } from "../firebase";
import type { LuminaPost, PostComment } from "@/types/post";

const COLLECTION_NAME = "lumina_posts";

export class PostRepository {
  /**
   * Subskrypcja na żywo do głównej tablicy postów
   */
  subscribeToFeed(callback: (posts: LuminaPost[]) => void, postLimit = 40): Unsubscribe {
    const collRef = collection(db, COLLECTION_NAME);
    const q = query(collRef, orderBy('createdAt', 'desc'), limit(postLimit));

    return onSnapshot(
      q,
      (snap) => {
        const posts: LuminaPost[] = [];
        snap.forEach((d) => {
          posts.push({ id: d.id, ...d.data() } as LuminaPost);
        });
        callback(posts);
      },
      (err) => {
        console.warn("[PostRepository] Błąd subskrypcji postów:", err);
      }
    );
  }

  /**
   * Dodaje nowy post na Tablicy
   */
  async createPost(post: Partial<LuminaPost>): Promise<string | null> {
    const user = auth.currentUser;
    if (!user || user.isAnonymous || !post.text?.trim()) {
      console.warn("[PostRepository] Publikacja wymaga zalogowanego konta członka.");
      return null;
    }

    try {
      const collRef = collection(db, COLLECTION_NAME);
      const newPost = {
        ...post,
        authorUid: user.uid,
        author: post.author?.trim() || user.displayName || "Członek Społeczności",
        text: post.text.trim(),
        likes: post.likes || 0,
        amen: post.amen || 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(collRef, newPost);
      return docRef.id;
    } catch (err) {
      console.error("[PostRepository] Błąd dodawania posta:", err);
      return null;
    }
  }

  /**
   * Reakcja polubienia (Like)
   */
  async toggleLike(postId: string, isLiked: boolean): Promise<boolean> {
    if (!postId) return false;
    try {
      const docRef = doc(db, COLLECTION_NAME, postId);
      await updateDoc(docRef, {
        likes: increment(isLiked ? -1 : 1)
      });
      return true;
    } catch (err) {
      console.warn("[PostRepository] Błąd aktualizacji polubienia:", err);
      return false;
    }
  }

  /**
   * Reakcja Amen!
   */
  async toggleAmen(postId: string, hasAmen: boolean): Promise<boolean> {
    if (!postId) return false;
    try {
      const docRef = doc(db, COLLECTION_NAME, postId);
      await updateDoc(docRef, {
        amen: increment(hasAmen ? -1 : 1)
      });
      return true;
    } catch (err) {
      console.warn("[PostRepository] Błąd aktualizacji Amen:", err);
      return false;
    }
  }
}

export const postRepository = new PostRepository();
