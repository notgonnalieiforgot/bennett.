import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { useUserStore } from '../store/userStore';
import type { UITheme } from '@bennett/shared';

type Variant = 'primary' | 'ghost';

interface BNButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: Variant;
}

// Per-theme classes for the primary CTA. Phase 7 will introduce ghost/text
// variants on top.
const PRIMARY_CLASSES: Record<UITheme, string> = {
  glassmorphism:
    'bg-accent text-white border border-white/20 shadow-bn rounded-[14px] py-3.5 px-5 font-semibold',
  'neo-brutalism':
    'bg-accent text-white border-[3px] border-black uppercase font-extrabold py-3.5 px-5 rounded-[2px] shadow-bn',
  claymorphism:
    'bg-accent text-text rounded-full py-3.5 px-6 font-semibold shadow-bn',
  'liquid-glass':
    'rounded-[18px] py-3.5 px-5 font-semibold text-black border border-white/70 shadow-bn ' +
    'bg-gradient-to-br from-white via-[#c8c8c8] to-[#b8b8b8]',
};

// Per-theme press behavior.
const PRESS_PROPS: Record<UITheme, HTMLMotionProps<'button'>> = {
  glassmorphism: {
    whileTap: { scale: 0.985 },
    transition: { duration: 0.18, ease: 'easeOut' },
  },
  'neo-brutalism': {
    whileTap: { x: 4, y: 4, boxShadow: '0px 0px 0 #000' },
    transition: { duration: 0.08, ease: 'easeOut' },
  },
  claymorphism: {
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 420, damping: 14 },
  },
  'liquid-glass': {
    whileTap: { scale: 0.97 },
    transition: { duration: 0.20, ease: 'easeOut' },
  },
};

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: BNButtonProps) {
  const theme = useUserStore((s) => s.theme);
  const base = variant === 'primary' ? PRIMARY_CLASSES[theme] : 'text-muted underline-offset-2 hover:underline';
  const press = PRESS_PROPS[theme];
  return (
    <motion.button {...press} className={`${base} ${className}`.trim()} {...rest}>
      {children}
    </motion.button>
  );
}
