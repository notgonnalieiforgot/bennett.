import { useEffect } from 'react';
import { useDoubleLock } from './state';
import { SmileSync } from './SmileSync';
import { Stroop } from './Stroop';
import { Vocalization } from './Vocalization';
import { recordCompletion } from '../../services/doubleLock';
import { recordDailyMarble } from '../../services/marbles';
import { useUserStore } from '../../store/userStore';

interface Props {
  onComplete?: () => void;
}

/**
 * Daily 60-second cognitive gate — Web coordinator.
 * Per Critical Rule #7 the ritual is unbypassable; there is intentionally
 * no "skip" button anywhere.
 */
export function DoubleLock({ onComplete }: Props) {
  const step = useDoubleLock((s) => s.step);
  const startedAt = useDoubleLock((s) => s.startedAt);
  const reset = useDoubleLock((s) => s.reset);
  const smileSucceeded = useDoubleLock((s) => s.smileSucceeded);
  const stroopSucceeded = useDoubleLock((s) => s.stroopSucceeded);
  const vocalizationSucceeded = useDoubleLock((s) => s.vocalizationSucceeded);
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (step === 'complete') {
      const dur = Date.now() - startedAt;
      if (user?.uid) {
        const nextStreakDay = (user.currentStreak ?? 0) + 1;
        void recordCompletion({ uid: user.uid, durationMs: dur });
        // Phase 4 will plumb the active module through; Phase 2 records null.
        void recordDailyMarble({
          uid: user.uid,
          streakDay: nextStreakDay,
          moduleCompleted: null,
        });
      }
      const t = window.setTimeout(() => {
        onComplete?.();
        reset();
      }, 1000);
      return () => window.clearTimeout(t);
    }
    return;
  }, [step, startedAt, user?.uid, onComplete, reset]);

  return (
    <div className="min-h-dvh w-full bg-bg text-text flex flex-col">
      <div className="px-4 pt-4 grid grid-cols-3 gap-1.5">
        <Bar active={true} />
        <Bar active={step === 'stroop' || step === 'vocalization' || step === 'complete'} />
        <Bar active={step === 'vocalization' || step === 'complete'} />
      </div>
      <div className="flex-1 flex items-center justify-center">
        {step === 'smile' && <SmileSync onComplete={smileSucceeded} />}
        {step === 'stroop' && <Stroop onComplete={stroopSucceeded} />}
        {step === 'vocalization' && <Vocalization onComplete={vocalizationSucceeded} />}
        {step === 'complete' && (
          <div className="text-center space-y-2">
            <div className="text-4xl font-extrabold lowercase">locked in 🔒</div>
            <div className="text-muted text-sm lowercase">60s well spent. let's go.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Bar({ active }: { active: boolean }) {
  return (
    <div
      className={`h-1 rounded-sm transition-colors ${active ? 'bg-accent' : 'bg-border/30'}`}
    />
  );
}
