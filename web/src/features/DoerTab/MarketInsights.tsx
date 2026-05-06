import { useEffect, useState } from 'react';
import type { MarketInsight, MarketInsightDomain } from '@bennett/shared';
import { listMarketInsights } from '../../services/doerTab';

const DOMAIN_LABELS: Record<MarketInsightDomain, string> = {
  stocks: 'stocks',
  real_estate: 'real estate',
  ai_digital: 'ai & digital',
};

export function MarketInsights() {
  const [domain, setDomain] = useState<MarketInsightDomain | null>(null);
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    listMarketInsights(domain ?? undefined)
      .then(setInsights)
      .catch(() => setInsights([]))
      .finally(() => setLoading(false));
  }, [domain]);

  return (
    <section className="rounded-bn bg-surface/30 border border-border/30 p-4 space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-text font-semibold lowercase">market insights</h3>
        <select
          value={domain ?? ''}
          onChange={(e) =>
            setDomain((e.target.value || null) as MarketInsightDomain | null)
          }
          className="bg-transparent text-muted text-xs lowercase outline-none border-0"
        >
          <option value="">all</option>
          {(Object.keys(DOMAIN_LABELS) as MarketInsightDomain[]).map((d) => (
            <option key={d} value={d}>{DOMAIN_LABELS[d]}</option>
          ))}
        </select>
      </header>
      {loading ? (
        <div className="text-muted text-xs lowercase">loading…</div>
      ) : insights.length === 0 ? (
        <div className="text-muted text-xs lowercase">
          nothing published yet for this domain.
        </div>
      ) : (
        insights.map((insight) => (
          <article key={insight.id} className="rounded-[10px] bg-bg/40 p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent px-2 py-0.5 rounded-full">
              {DOMAIN_LABELS[insight.domain]}
            </span>
            <div className="font-semibold">{insight.title}</div>
            <div className="text-muted text-sm line-clamp-3">{insight.summary}</div>
            {insight.founderFilter && (
              <div className="text-accent text-[11px] font-medium">
                founder's filter: {insight.founderFilter}
              </div>
            )}
          </article>
        ))
      )}
    </section>
  );
}
