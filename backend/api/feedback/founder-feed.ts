import type { BetaFeedback } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json } from '../../lib/http';
import { isFounder } from '../../lib/founder-auth';

export const config = { runtime: 'edge' };

/**
 * GET /api/feedback/founder-feed?uid=<founderUid>&sentiment=<positive|neutral|negative>
 * Founder-only. Returns the most recent 200 feedback items.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  const url = new URL(req.url);
  const uid = url.searchParams.get('uid');
  if (!isFounder(uid)) return error(403, 'forbidden');
  const sentiment = url.searchParams.get('sentiment') as BetaFeedback['sentiment'] | null;

  let q = db().collection('feedback').orderBy('createdAt', 'desc').limit(200);
  if (sentiment) q = q.where('sentiment', '==', sentiment) as typeof q;
  const snap = await q.get();
  const items = snap.docs.map((d) => d.data() as BetaFeedback);
  return json({ items });
}
