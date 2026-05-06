import { evaluateDoerTabAccess } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * GET /api/doer-tab/access?uid=...
 * Critical Rule #8: Doer Tab requires BOTH active paid subscription
 * AND a streak of ≥3 days. Both checks happen server-side; client is not
 * trusted.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  const uid = new URL(req.url).searchParams.get('uid');
  if (!uid) return error(400, 'uid required');

  const snap = await db().collection('users').doc(uid).get();
  if (!snap.exists) {
    return json(evaluateDoerTabAccess({ doerTabSubscriptionActive: false, currentStreak: 0 }));
  }
  const data = snap.data() ?? {};
  const status = evaluateDoerTabAccess({
    doerTabSubscriptionActive: data.doerTabSubscriptionActive === true,
    currentStreak: typeof data.currentStreak === 'number' ? data.currentStreak : 0,
  });
  return json(status);
}
