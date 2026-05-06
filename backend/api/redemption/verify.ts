import type { RedemptionAttempt, RedemptionTrial } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * POST /api/redemption/verify
 * Body: { uid, trial, date, evidence }
 *
 * Trusts the platform-side verification (HealthKit / FamilyControls /
 * module quiz) — those run on-device and post the result here.
 *
 * On survived: bumps user.currentStreak by 1 and lets the next normal
 * Double-Lock continue the streak. On broken: streak resets to 0.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{
    uid: string;
    trial: RedemptionTrial;
    date: string;
    survived: boolean;
    evidence?: Record<string, unknown>;
  }>(req);
  if (!body?.uid || !body?.trial || !body?.date) {
    return error(400, 'uid, trial, date required');
  }

  const userRef = db().collection('users').doc(body.uid);
  const attemptRef = userRef.collection('redemptionAttempts').doc(body.date);
  const attempt: Partial<RedemptionAttempt> = {
    status: body.survived ? 'survived' : 'broken',
    trial: body.trial,
    verifiedAt: Date.now(),
    evidence: body.evidence ?? {},
  };
  await attemptRef.set(attempt, { merge: true });

  // Apply streak effect.
  const userSnap = await userRef.get();
  const cur = (userSnap.data()?.currentStreak as number | undefined) ?? 0;
  const next = body.survived ? cur + 1 : 0;
  await userRef.set({ currentStreak: next, updatedAt: Date.now() }, { merge: true });

  return json({ ok: true, currentStreak: next, status: attempt.status });
}
