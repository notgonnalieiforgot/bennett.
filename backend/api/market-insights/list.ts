import type { MarketInsight, MarketInsightDomain } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * GET /api/market-insights/list?domain=stocks|real_estate|ai_digital
 * Returns published insights only — drafts and reviews never reach
 * regular users (Founder UI fetches all states via founder endpoint).
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  const url = new URL(req.url);
  const domain = url.searchParams.get('domain') as MarketInsightDomain | null;

  let q = db().collection('marketInsights').where('state', '==', 'published');
  if (domain) q = q.where('domain', '==', domain);
  const snap = await q.orderBy('publishedAt', 'desc').limit(50).get();
  const insights: MarketInsight[] = snap.docs.map((d) => ({ ...(d.data() as MarketInsight), id: d.id }));
  return json({ insights });
}
