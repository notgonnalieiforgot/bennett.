import type { HTMLAttributes, ReactNode } from 'react';
import { useUserStore } from '../store/userStore';
import type { UITheme } from '@bennett/shared';

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const SURFACE_CLASSES: Record<UITheme, string> = {
  glassmorphism:
    'rounded-bn p-5 backdrop-blur-xl bg-surface/8 border border-border/15 shadow-bn',
  'neo-brutalism':
    'rounded-bn p-5 bg-surface border-[3px] border-black shadow-bn',
  claymorphism:
    'rounded-bn p-6 bg-surface shadow-bn',
  'liquid-glass':
    'rounded-bn p-6 backdrop-blur-2xl bg-surface/10 border border-border/30 shadow-bn',
};

export function Surface({ children, className = '', ...rest }: SurfaceProps) {
  const theme = useUserStore((s) => s.theme);
  return (
    <div className={`${SURFACE_CLASSES[theme]} ${className}`} {...rest}>
      {children}
    </div>
  );
}
