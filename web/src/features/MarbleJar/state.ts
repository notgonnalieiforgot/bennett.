import { create } from 'zustand';
import type { Marble } from '@bennett/shared';

interface MarbleStore {
  marbles: Marble[];
  setMarbles: (m: Marble[]) => void;
  add: (m: Marble) => void;
}

export const useMarbleStore = create<MarbleStore>((set) => ({
  marbles: [],
  setMarbles: (m) => set({ marbles: m }),
  add: (m) =>
    set((s) =>
      s.marbles.some((x) => x.id === m.id) ? s : { marbles: [...s.marbles, m] },
    ),
}));
