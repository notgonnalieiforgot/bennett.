import { useEffect, useState } from 'react';
import type {
  MarketInsight,
  MarketInsightDomain,
  MarketInsightState,
} from '@bennett/shared';
import { useUserStore } from '../../store/userStore';
import { listFounderInsights, upsertFounderInsight } from '../../services/doerTab';

/**
 * Phase 3 Founder's Command Center — web-only.
 * Authenticates via FOUNDER_UID env var on the backend (uid in body).
 * Phase 7 will upgrade to verified Firebase ID tokens + custom claim.
 */
export function FounderConsole() {
  const user = useUserStore((s) => s.user);
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [draft, setDraft] = useState<Partial<MarketInsight>>({
    domain: 'stocks',
    state: 'draft',
    title: '',
    summary: '',
    body: '',
    founderFilter: '',
  });
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!user?.uid) return;
    try {
      setInsights(await listFounderInsights(user.uid));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  async function save(state: MarketInsightState) {
    if (!user?.uid) return;
    try {
      await upsertFounderInsight({
        uid: user.uid,
        id: draft.id,
        domain: (draft.domain ?? 'stocks') as MarketInsightDomain,
        title: draft.title ?? '',
        summary: draft.summary ?? '',
        body: draft.body ?? '',
        founderFilter: draft.founderFilter ?? null,
        state,
      });
      setDraft({ domain: 'stocks', state: 'draft', title: '', summary: '', body: '', founderFilter: '' });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function load(i: MarketInsight) {
    setDraft({ ...i });
  }

  return (
    <section className="rounded-bn bg-surface/30 border border-border/30 p-4 space-y-4">
      <header>
        <h3 className="text-text font-semibold lowercase">founder's command center</h3>
        <p className="text-muted text-xs lowercase">
          access requires FOUNDER_UID match server-side.
        </p>
      </header>
      {error && <div className="text-muted text-xs lowercase">{error}</div>}

      <div className="space-y-2">
        <select
          value={draft.domain ?? 'stocks'}
          onChange={(e) => setDraft({ ...draft, domain: e.target.value as MarketInsightDomain })}
          className="w-full bg-bg/40 border border-border/30 rounded-md px-3 py-2 text-sm"
        >
          <option value="stocks">stocks</option>
          <option value="real_estate">real estate</option>
          <option value="ai_digital">ai & digital</option>
        </select>
        <input
          value={draft.title ?? ''}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="title"
          className="w-full bg-bg/40 border border-border/30 rounded-md px-3 py-2 text-sm"
        />
        <textarea
          value={draft.summary ?? ''}
          onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
          placeholder="summary (1-2 sentences)"
          rows={2}
          className="w-full bg-bg/40 border border-border/30 rounded-md px-3 py-2 text-sm"
        />
        <textarea
          value={draft.body ?? ''}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          placeholder="body"
          rows={5}
          className="w-full bg-bg/40 border border-border/30 rounded-md px-3 py-2 text-sm"
        />
        <input
          value={draft.founderFilter ?? ''}
          onChange={(e) => setDraft({ ...draft, founderFilter: e.target.value })}
          placeholder="founder's filter (annotation)"
          className="w-full bg-bg/40 border border-border/30 rounded-md px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <button onClick={() => save('draft')} className="flex-1 bg-surface/40 text-text rounded-md py-2 text-sm">save draft</button>
          <button onClick={() => save('review')} className="flex-1 bg-surface/40 text-text rounded-md py-2 text-sm">→ review</button>
          <button onClick={() => save('published')} className="flex-1 bg-accent text-white rounded-md py-2 text-sm">publish</button>
        </div>
      </div>

      <ul className="space-y-2">
        {insights.map((i) => (
          <li key={i.id} className="rounded-md bg-bg/40 p-2 flex justify-between items-center">
            <div>
              <div className="text-text text-sm font-medium">{i.title || '(untitled)'}</div>
              <div className="text-muted text-[11px]">{i.domain} · {i.state}</div>
            </div>
            <button onClick={() => load(i)} className="text-accent text-xs lowercase">edit</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
