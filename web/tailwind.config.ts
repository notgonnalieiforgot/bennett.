import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme-agnostic semantic tokens. Real values come from CSS vars
        // set by ThemeEngine per active theme (Phase 1.3).
        bg: 'rgb(var(--bn-bg) / <alpha-value>)',
        surface: 'rgb(var(--bn-surface) / <alpha-value>)',
        border: 'rgb(var(--bn-border) / <alpha-value>)',
        text: 'rgb(var(--bn-text) / <alpha-value>)',
        muted: 'rgb(var(--bn-muted) / <alpha-value>)',
        accent: 'rgb(var(--bn-accent) / <alpha-value>)',
        accentAlt: 'rgb(var(--bn-accent-alt) / <alpha-value>)',
        success: '#30D158',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        bn: 'var(--bn-radius)',
      },
      boxShadow: {
        bn: 'var(--bn-shadow)',
      },
    },
  },
  plugins: [],
};

export default config;
