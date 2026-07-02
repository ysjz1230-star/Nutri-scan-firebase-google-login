import { create } from 'zustand';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  init: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: '',

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
    return unsubscribe;
  },

  signInWithGoogle: async () => {
    set({ error: '' });
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '로그인에 실패했습니다.' });
    }
  },

  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null });
  },
}));
