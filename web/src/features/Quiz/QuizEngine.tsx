import { useMemo, useRef, useState } from 'react';
import type { QuizQuestionMC } from '@bennett/shared';

/**
 * Shared engine hook used by OTFQuiz + PSMQuiz. Same answer-handling,
 * scoring, and feedback pipeline regardless of tier.
 *
 * Per spec §2 Feedback Loops — correct answers fire a Bennett-Orange
 * pulse, incorrect fire a Claymorphic shake. The pulseTrigger /
 * shakeTrigger counters are the input to the modifiers in QuizEffects.
 */
export interface QuizEngine {
  index: number;
  current: QuizQuestionMC | undefined;
  picks: (number | null)[];
  phase: 'asking' | 'finished';
  score: number;
  passed: boolean;
  pulseKey: number;
  shakeKey: number;
  answer: (choice: number) => boolean;
  advance: () => void;
}

export function useQuizEngine(opts: {
  questions: QuizQuestionMC[];
  passThreshold: number;
}): QuizEngine {
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>(
    () => Array.from({ length: opts.questions.length }, () => null),
  );
  const [pulseKey, setPulseKey] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [phase, setPhase] = useState<'asking' | 'finished'>('asking');
  const last = useRef(0);

  const current = opts.questions[index];

  function answer(choice: number): boolean {
    const q = opts.questions[index];
    if (!q) return false;
    const correct = choice === q.answerIndex;
    setPicks((prev) => {
      const next = prev.slice();
      next[index] = choice;
      return next;
    });
    if (correct) {
      setPulseKey((k) => k + 1);
      hapticClick();
    } else {
      setShakeKey((k) => k + 1);
      hapticThud();
    }
    return correct;
  }

  function advance() {
    if (index + 1 < opts.questions.length) {
      setIndex(index + 1);
    } else {
      setPhase('finished');
    }
  }

  const score = useMemo(() => {
    if (opts.questions.length === 0) return 0;
    let correct = 0;
    for (let i = 0; i < opts.questions.length; i++) {
      const q = opts.questions[i]!;
      if (picks[i] === q.answerIndex) correct += 1;
    }
    return correct / opts.questions.length;
  }, [picks, opts.questions]);

  // Hold reference; not strictly needed but useful for debugging.
  last.current = score;

  return {
    index,
    current,
    picks,
    phase,
    score,
    passed: score >= opts.passThreshold,
    pulseKey,
    shakeKey,
    answer,
    advance,
  };
}

/**
 * Web haptic stand-ins. Phase 6 may add a Vibration API path on Android-
 * Chromium; spec §2 defers desktop to a visual-only fallback, which is
 * what the Pulse / Shake animations cover.
 */
function hapticClick() {
  if ('vibrate' in navigator) navigator.vibrate?.(15);
}
function hapticThud() {
  if ('vibrate' in navigator) navigator.vibrate?.([30, 25, 30]);
}
