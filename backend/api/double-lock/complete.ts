import type { DoubleLockCompletion } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * POST /api/double-lock/complete
 * Records a Double-Lock completion. Other devices listen on
 * users/{uid}/doubleLockCompletions/{date} via Firestore snapshot listener
 * and unlock locally when this doc appears (Critical Rule #7 — synchronized
 * across devices).
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<DoubleLockCompletion>(req);
  if (!body?.uid || !body?.date || !body?.completedAt || !body?.device) {
    return error(400, 'uid, date, completedAt, device required');
  }
  const ref = db()
    .collection('users')
    .doc(body.uid)
    .collection('doubleLockCompletions')
    .doc(body.date);
  await ref.set(
    {
      completedAt: body.completedAt,
      device: body.device,
      durationMs: body.durationMs ?? 0,
    },
    { merge: true },
  );
  return json({ ok: true, date: body.date });
}
