import { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { startCheckout } from '../../services/stripe';

/** Scholarship Mode entry. Spec §8a — $20/mo, 30-day refund. */
export function Scholarship() {
  const user = useUserStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (!user?.uid) {
      setError('sign in first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await startCheckout({ uid: user.uid, plan: 'scholarship_monthly' });
      window.location.assign(res.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-bn bg-surface/30 border border-border/30 p-5 space-y-4 max-w-md mx-auto">
      <header className="space-y-1">
        <h2 className="text-2xl font-extrabold lowercase">scholarship mode</h2>
        <p className="text-muted text-sm lowercase">here's the deal.</p>
      </header>
      <div className="rounded-[14px] bg-surface/30 border border-border/30 p-4 space-y-2">
        <div className="text-5xl font-extrabold text-accent">$20</div>
        <p className="text-text font-semibold lowercase">
          pay $20. hit a perfect 30-day streak. get it all back.
        </p>
        <p className="text-muted text-sm lowercase">miss a day? bennett keeps the $20.</p>
        <p className="text-muted text-xs lowercase">
          the money isn't the point. the skin in the game is.
        </p>
      </div>
      <button
        onClick={() => void start()}
        disabled={loading}
        className="w-full bg-accent text-white font-semibold lowercase rounded-[14px] py-3.5 disabled:opacity-60"
      >
        {loading ? 'starting checkout…' : 'start scholarship mode'}
      </button>
      {error && <div className="text-muted text-xs lowercase">{error}</div>}
    </section>
  );
}
