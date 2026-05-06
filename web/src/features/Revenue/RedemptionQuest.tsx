import { useState } from 'react';
import type { RedemptionTrial } from '@bennett/shared';
import { REDEMPTION_TRIALS } from '@bennett/shared';
import { useUserStore } from '../../store/userStore';
import { startRedemption, verifyRedemption } from '../../services/redemption';

interface Props {
  date: string;                  // YYYY-MM-DD of the slip day
  onSurvived: () => void;
  onBroken: () => void;
}

const PLATFORM = 'web' as const;

/**
 * Day-29 trial picker on web.
 *
 * Per Critical Rule #13 + spec §8b: only Deep Dive auto-verifies on web;
 * Bio-Shock and Sacrifice are framed as "switch to your phone" (the iOS
 * app picks them up via the same /api/redemption endpoints).
 */
export function RedemptionQuest({ date, onSurvived, onBroken }: Props) {
  const user = useUserStore((s) => s.user);
  const [busy, setBusy] = useState<RedemptionTrial | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(trial: RedemptionTrial) {
    if (!user?.uid) return;
    const available = REDEMPTION_TRIALS.find((t) => t.id === trial)?.autoVerifyOn.includes(PLATFORM);
    if (!available) return;
    setBusy(trial);
    setError(null);
    try {
      await startRedemption({ uid: user.uid, trial, date });
      const survived = trial === 'deep_dive'; // Deep Dive flow handled in Doer Tab
      const out = await verifyRedemption({
        uid: user.uid,
        trial,
        date,
        survived,
        evidence: { platform: PLATFORM },
      });
      if (out.status === 'survived') onSurvived();
      else onBroken();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="max-w-xl mx-auto p-5 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold lowercase">day 29. one chance.</h1>
        <p className="text-muted text-sm lowercase">
          pick a trial. survive it before midnight. streak saved.
        </p>
      </header>
      {REDEMPTION_TRIALS.map((t) => {
        const available = t.autoVerifyOn.includes(PLATFORM);
        const inProg = busy === t.id;
        return (
          <button
            key={t.id}
            onClick={() => void pick(t.id)}
            disabled={!available || busy !== null}
            className={`w-full text-left rounded-bn border p-4 space-y-1 ${
              available ? 'bg-surface/30 border-border/30' : 'bg-surface/10 border-muted/30 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold lowercase">{t.title}</span>
              {!available && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  ios only
                </span>
              )}
              {inProg && <span className="text-muted text-xs">…</span>}
            </div>
            <div className="text-accent text-sm font-medium">{t.oneLiner}</div>
            <div className="text-muted text-xs">{t.detail}</div>
            {!available && (
              <div className="text-muted text-[11px] lowercase">
                switch to ur iphone to run this trial.
              </div>
            )}
          </button>
        );
      })}
      {error && <div className="text-muted text-xs lowercase">{error}</div>}
    </section>
  );
}
