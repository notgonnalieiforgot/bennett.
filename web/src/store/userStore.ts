import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UITheme, UserRecord } from '@bennett/shared';
import { DEFAULT_THEME } from '@bennett/shared';

interface UserStore {
  user: UserRecord | null;
  theme: UITheme;
  setUser: (user: UserRecord | null) => void;
  setTheme: (theme: UITheme) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      theme: DEFAULT_THEME,
      setUser: (user) => set({ user, theme: user?.uiTheme ?? DEFAULT_THEME }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'bennett.user',
      partialize: (s) => ({ theme: s.theme }),
    },
  ),
);
