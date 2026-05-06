import { create } from 'zustand';
import { ABSURD_PHRASES, type DoubleLockStep } from '@bennett/shared';
import { newGame, type StroopGame } from './stroop';

interface DoubleLockSlice {
  step: DoubleLockStep;
  startedAt: number;
  phrase: string;
  stroop: StroopGame;
  reset: () => void;
  smileSucceeded: () => void;
  stroopSucceeded: () => void;
  vocalizationSucceeded: () => void;
  setStroop: (g: StroopGame) => void;
}

const randomPhrase = (): string =>
  ABSURD_PHRASES[Math.floor(Math.random() * ABSURD_PHRASES.length)] ?? ABSURD_PHRASES[0]!;

export const useDoubleLock = create<DoubleLockSlice>((set) => ({
  step: 'smile',
  startedAt: Date.now(),
  phrase: randomPhrase(),
  stroop: newGame(),
  reset: () =>
    set({
      step: 'smile',
      startedAt: Date.now(),
      phrase: randomPhrase(),
      stroop: newGame(),
    }),
  smileSucceeded: () =>
    set((s) => (s.step === 'smile' ? { step: 'stroop' } : s)),
  stroopSucceeded: () =>
    set((s) => (s.step === 'stroop' ? { step: 'vocalization' } : s)),
  vocalizationSucceeded: () =>
    set((s) => (s.step === 'vocalization' ? { step: 'complete' } : s)),
  setStroop: (g) => set({ stroop: g }),
}));
