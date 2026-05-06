import type { MarketInsight } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json } from '../../lib/http';
import { isFounder } from '../../lib/founder-auth';

export const config = { runtime: 'edge' };

/**
 * GET /api/market-insights/founder-list?uid=<founderUid>
 * Founder-only. Returns ALL insights including draft and review.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  const uid = new URL(req.url).searchParams.get('uid');
  if (!isFounder(uid)) return error(403, 'forbidden');

  const snap = await db()
    .collection('marketInsights')
    .orderBy('updatedAt', 'desc')
    .limit(200)
    .get();
  const insights: MarketInsight[] = snap.docs.map((d) => ({
    ...(d.data() as MarketInsight),
    id: d.id,
  }));
  return json({ insights });
}
