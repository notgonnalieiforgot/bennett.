export type UITheme =
  | 'glassmorphism'
  | 'neo-brutalism'
  | 'claymorphism'
  | 'liquid-glass';

export const UI_THEMES: readonly UITheme[] = [
  'glassmorphism',
  'neo-brutalism',
  'claymorphism',
  'liquid-glass',
] as const;

export const DEFAULT_THEME: UITheme = 'glassmorphism';
