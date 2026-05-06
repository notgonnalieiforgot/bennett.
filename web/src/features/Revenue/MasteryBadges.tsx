import { useEffect, useState } from 'react';
import type { KnowledgeModule } from '@bennett/shared';
import { useUserStore } from '../../store/userStore';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export function MasteryBadges() {
  const user = useUserStore((s) => s.user);
  const [badges, setBadges] = useState<KnowledgeModule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    fetch(`${BASE}/api/badges/list?uid=${encodeURIComponent(user.uid)}`)
      .then((r) => r.json())
      .then((j: { badges: KnowledgeModule[] }) => setBadges(j.badges ?? []))
      .catch(() => setBadges([]))
      .finally(() => setLoading(false));
  }, [user?.uid]);

  return (
    <section className="rounded-bn bg-surface/30 border border-border/30 p-4 space-y-3 max-w-md mx-auto">
      <header className="flex items-center justify-between">
        <h3 className="text-text font-semibold lowercase">mastery badges</h3>
        <span className="text-muted text-xs">{loading ? '…' : `${badges.length} earned`}</span>
      </header>
      {badges.length === 0 ? (
        <div className="text-muted text-xs lowercase">
          none yet. finish a module + pass its quiz.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <span
              key={b}
              className="bg-bg/40 text-text text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1.5"
            >
              <span className="text-accent">✓</span>
              {b.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
