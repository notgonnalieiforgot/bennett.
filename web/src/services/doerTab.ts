import type {
  DoerTabAccessStatus,
  KnowledgeBarProtocol,
  MarketInsight,
  MarketInsightDomain,
  ModuleProgress,
} from '@bennett/shared';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export async function fetchAccess(uid: string): Promise<DoerTabAccessStatus> {
  const res = await fetch(`${BASE}/api/doer-tab/access?uid=${encodeURIComponent(uid)}`);
  if (!res.ok) throw new Error(`access ${res.status}`);
  return (await res.json()) as DoerTabAccessStatus;
}

export async function searchKnowledge(opts: { uid: string; topic: string }): Promise<KnowledgeBarProtocol> {
  const res = await fetch(`${BASE}/api/knowledge-bar/search`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error(`search ${res.status}`);
  return (await res.json()) as KnowledgeBarProtocol;
}

export async function saveModuleProgress(opts: {
  uid: string;
  moduleId: ModuleProgress['moduleId'];
  completedLessons: string[];
  quizPassed: boolean;
  bestQuizScore: number;
}): Promise<ModuleProgress> {
  const res = await fetch(`${BASE}/api/knowledge-modules/progress`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error(`progress ${res.status}`);
  return (await res.json()) as ModuleProgress;
}

export async function listMarketInsights(domain?: MarketInsightDomain): Promise<MarketInsight[]> {
  const url = domain
    ? `${BASE}/api/market-insights/list?domain=${encodeURIComponent(domain)}`
    : `${BASE}/api/market-insights/list`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`insights ${res.status}`);
  const json = (await res.json()) as { insights: MarketInsight[] };
  return json.insights;
}

export async function listFounderInsights(uid: string): Promise<MarketInsight[]> {
  const res = await fetch(`${BASE}/api/market-insights/founder-list?uid=${encodeURIComponent(uid)}`);
  if (!res.ok) throw new Error(`founder list ${res.status}`);
  const json = (await res.json()) as { insights: MarketInsight[] };
  return json.insights;
}

export async function upsertFounderInsight(
  insight: Partial<MarketInsight> & { uid: string; state: MarketInsight['state'] },
): Promise<MarketInsight> {
  const res = await fetch(`${BASE}/api/market-insights/founder-upsert`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(insight),
  });
  if (!res.ok) throw new Error(`founder upsert ${res.status}`);
  return (await res.json()) as MarketInsight;
}
