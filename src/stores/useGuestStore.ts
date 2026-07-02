import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_FREE_USES = 3;

interface GuestState {
  freeUsesLeft: number;
  totalUsed: number;
  decrement: () => void;
  reset: () => void;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      freeUsesLeft: MAX_FREE_USES,
      totalUsed: 0,

      decrement: () =>
        set((s) => ({
          freeUsesLeft: Math.max(0, s.freeUsesLeft - 1),
          totalUsed: s.totalUsed + 1,
        })),

      reset: () => set({ freeUsesLeft: MAX_FREE_USES, totalUsed: 0 }),
    }),
    { name: 'nutriscan-guest' }
  )
);
