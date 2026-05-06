import { useState } from 'react';
import type { DoerTabAccessReason } from '@bennett/shared';

interface Props {
  reason: DoerTabAccessReason;
  currentStreak: number;
  onUpgrade?: () => void;
}

/** Per spec §8c (Option C — The Premium Signal). Annual pre-selected. */
export function Paywall({ reason, currentStreak, onUpgrade }: Props) {
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');
  const annual = plan === 'annual';

  return (
    <div className="max-w-md mx-auto py-10 px-6 space-y-5 text-text">
      <h1 className="text-3xl font-extrabold lowercase">the war room.</h1>
      <p className="text-muted text-sm lowercase">
        where real ones lock in. market intel, knowledge modules, the global arena. all of it.
      </p>

      <div className="flex bg-surface/30 rounded-full overflow-hidden">
        <button
          onClick={() => setPlan('monthly')}
          className={`flex-1 py-2 text-xs font-medium ${plan === 'monthly' ? 'bg-accent text-white' : 'text-muted'}`}
        >
          monthly
        </button>
        <button
          onClick={() => setPlan('annual')}
          className={`flex-1 py-2 text-xs font-medium ${plan === 'annual' ? 'bg-accent text-white' : 'text-muted'}`}
        >
          annual · best value
        </button>
      </div>

      <div className="rounded-bn bg-surface/30 border border-border/30 p-5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-muted line-through">{annual ? '$480/yr' : '$40/mo'}</span>
          <span className="text-[10px] font-bold bg-accent text-white px-2 py-0.5 rounded-full">
            {annual ? '57% OFF' : '40% OFF'}
          </span>
        </div>
        <div className="text-4xl font-extrabold">{annual ? '$16.99/mo' : '$24/mo'}</div>
        {annual && (
          <>
            <div className="text-muted text-xs">billed as $204/year</div>
            <div className="text-accent text-xs font-semibold">you save $84 this year</div>
          </>
        )}
      </div>

      <ul className="text-sm space-y-2 lowercase">
        <li>📈 live market insights + founder's filter</li>
        <li>🧠 all 5 knowledge modules + global knowledge bar</li>
        <li>🏆 arena leaderboard + mastery badges</li>
      </ul>

      <button
        onClick={onUpgrade}
        className="w-full bg-accent text-white font-semibold lowercase rounded-[14px] py-3.5"
      >
        unlock the doer tab
      </button>

      <div className="text-center text-muted text-xs lowercase">cancel anytime. no games.</div>
      <div className="text-center text-muted text-[11px] lowercase">restore purchases</div>

      {(reason === 'streak_too_short' || reason === 'no_subscription_and_streak_too_short') && (
        <div className="rounded-[12px] bg-surface/30 p-3 space-y-1">
          <div className="text-text text-sm font-semibold lowercase">
            ur {currentStreak}-day streak.
          </div>
          <div className="text-muted text-xs lowercase">
            doer tab unlocks at 3+ days. paying alone doesn't open it.
          </div>
        </div>
      )}
    </div>
  );
}
