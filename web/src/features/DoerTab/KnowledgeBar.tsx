import { useState } from 'react';
import type { KnowledgeBarProtocol } from '@bennett/shared';
import { useUserStore } from '../../store/userStore';
import { searchKnowledge } from '../../services/doerTab';
import { detectCrisis } from '../../services/crisis';
import { CrisisIntercept } from '../Crisis';
import { FocusOverlay } from './FocusOverlay';

export function KnowledgeBar() {
  const user = useUserStore((s) => s.user);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proto, setProto] = useState<KnowledgeBarProtocol | null>(null);
  const [crisisPatterns, setCrisisPatterns] = useState<string[] | null>(null);

  async function go() {
    const q = topic.trim();
    if (!q || !user?.uid) return;
    // Client-side crisis intercept on the search topic.
    const c = detectCrisis(q);
    if (c.matched) {
      setCrisisPatterns(c.matchedPatterns);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await searchKnowledge({ uid: user.uid, topic: q });
      // The server-side guard returns { crisis: true } for nuanced cases
      // the client regex missed. We treat that the same as a local match.
      const maybeCrisis = (res as unknown as { crisis?: boolean; matchedPatterns?: string[] }).crisis;
      if (maybeCrisis) {
        setCrisisPatterns(
          (res as unknown as { matchedPatterns?: string[] }).matchedPatterns ?? [],
        );
        return;
      }
      setProto(res);
      setTopic('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-1.5">
        <div className="text-muted text-[11px] font-medium lowercase">knowledge bar</div>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-[12px] bg-surface/30 border border-border/30">
          <span aria-hidden>🔎</span>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void go();
            }}
            placeholder="any topic — sleep architecture, option greeks, …"
            className="flex-1 bg-transparent text-text text-sm outline-none placeholder:text-muted"
          />
          {loading ? (
            <span className="text-muted text-xs">…</span>
          ) : topic ? (
            <button
              onClick={() => void go()}
              className="text-accent text-xs font-semibold lowercase"
            >
              go
            </button>
          ) : null}
        </div>
        {error && <div className="text-muted text-[11px] lowercase">{error}</div>}
      </div>
      {proto && <FocusOverlay protocol={proto} onDismiss={() => setProto(null)} />}
      {crisisPatterns && (
        <CrisisIntercept
          surface="knowledge_bar"
          matchedPatterns={crisisPatterns}
          onDismiss={() => {
            setCrisisPatterns(null);
            setTopic('');
          }}
        />
      )}
    </>
  );
}
