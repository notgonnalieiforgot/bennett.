import { useUserStore } from '../store/userStore';
import { Surface } from './Surface';
import type { UITheme } from '@bennett/shared';
import { UI_THEMES } from '@bennett/shared';

const LABEL: Record<UITheme, { name: string; mood: string }> = {
  glassmorphism: { name: 'Glassmorphism', mood: 'executive mode. high-tech, layered.' },
  'neo-brutalism': { name: 'Neo-Brutalism', mood: 'war mode. direct, zero friction.' },
  claymorphism: { name: 'Claymorphism', mood: 'calm mode. soft, low pressure.' },
  'liquid-glass': { name: 'Liquid Glass', mood: 'doer mode. fluid, high energy.' },
};

export function ThemeSwitcher() {
  const theme = useUserStore((s) => s.theme);
  const setTheme = useUserStore((s) => s.setTheme);
  return (
    <div className="flex flex-col gap-3 p-4 max-w-md mx-auto">
      {UI_THEMES.map((t) => (
        <button key={t} onClick={() => setTheme(t)} className="text-left">
          <Surface>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text text-base font-bold">{LABEL[t].name}</div>
                <div className="text-muted text-sm lowercase">{LABEL[t].mood}</div>
              </div>
              {t === theme && (
                <span className="text-accent" aria-label="selected">●</span>
              )}
            </div>
          </Surface>
        </button>
      ))}
    </div>
  );
}
