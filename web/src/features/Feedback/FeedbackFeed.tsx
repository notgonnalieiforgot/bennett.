import { useEffect, useState } from 'react';
import type { BetaFeedback } from '@bennett/shared';
import { useUserStore } from '../../store/userStore';
import { loadFounderFeed } from '../../services/feedback';

/** Founder-facing feedback feed. Surfaced inside FounderConsole. */
export function FeedbackFeed() {
  const user = useUserStore((s) => s.user);
  const [items, setItems] = useState<BetaFeedback[]>([]);
  const [filter, setFilter] = useState<BetaFeedback['sentiment'] | undefined>(undefined);

  useEffect(() => {
    if (!user?.uid) return;
    loadFounderFeed({ uid: user.uid, sentiment: filter })
      .then(setItems)
      .catch(() => setItems([]));
  }, [user?.uid, filter]);

  return (
    <section className="rounded-bn bg-surface/30 border border-border/30 p-4 space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-text font-semibold lowercase">beta feedback</h3>
        <select
          value={filter ?? ''}
          onChange={(e) =>
            setFilter((e.target.value || undefined) as BetaFeedback['sentiment'] | undefined)
          }
          className="bg-transparent text-muted text-xs lowercase outline-none"
        >
          <option value="">all</option>
          <option value="positive">positive</option>
          <option value="neutral">neutral</option>
          <option value="negative">negative</option>
        </select>
      </header>
      {items.length === 0 ? (
        <div className="text-muted text-xs lowercase">no feedback yet.</div>
      ) : (
        items.map((f) => (
          <article key={f.id} className="rounded-md bg-bg/40 p-3 space-y-1">
            <div className="flex justify-between text-[10px] uppercase tracking-wider">
              <span className={
                f.sentiment === 'positive' ? 'text-accent'
                  : f.sentiment === 'negative' ? 'text-red-400'
                  : 'text-muted'
              }>
                {f.sentiment}
              </span>
              <span className="text-muted">{f.trigger}</span>
            </div>
            <p className="text-text text-sm whitespace-pre-line">{f.text}</p>
            <div className="text-muted text-[11px] font-mono">{f.uid}</div>
          </article>
        ))
      )}
    </section>
  );
}
