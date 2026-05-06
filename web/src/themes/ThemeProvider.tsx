import { useEffect, type ReactNode } from 'react';
import { useUserStore } from '../store/userStore';
import type { UITheme } from '@bennett/shared';

const THEME_CLASS: Record<UITheme, string> = {
  glassmorphism: 'bn-theme-glassmorphism',
  'neo-brutalism': 'bn-theme-neo-brutalism',
  claymorphism: 'bn-theme-claymorphism',
  'liquid-glass': 'bn-theme-liquid-glass',
};

const ALL_CLASSES = Object.values(THEME_CLASS);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useUserStore((s) => s.theme);
  useEffect(() => {
    const cls = THEME_CLASS[theme];
    document.body.classList.remove(...ALL_CLASSES);
    document.body.classList.add(cls);
  }, [theme]);
  return <>{children}</>;
}
