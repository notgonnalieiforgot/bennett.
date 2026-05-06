import type { RedemptionAttempt, RedemptionTrial } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * POST /api/redemption/start
 * Body: { uid, trial, date }
 * Records the user picked a trial; client now starts whatever
 * platform-specific verification flow that trial implies.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{ uid: string; trial: RedemptionTrial; date: string }>(req);
  if (!body?.uid || !body?.trial || !body?.date) {
    return error(400, 'uid, trial, date required');
  }
  const ref = db()
    .collection('users')
    .doc(body.uid)
    .collection('redemptionAttempts')
    .doc(body.date);
  const attempt: RedemptionAttempt = {
    id: body.date,
    uid: body.uid,
    date: body.date,
    status: 'in_progress',
    trial: body.trial,
    startedAt: Date.now(),
  };
  await ref.set(attempt, { merge: true });
  return json(attempt);
}
