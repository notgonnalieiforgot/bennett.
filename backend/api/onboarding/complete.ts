import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * POST /api/onboarding/complete
 * Body: { uid }
 *
 * Per Critical Rule #10: `isNewUser` is server-side. Onboarding is shown
 * exactly once, checked against Firestore — not localStorage / UserDefaults.
 * This endpoint is the ONE place that flips the flag.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{ uid: string }>(req);
  if (!body?.uid) return error(400, 'uid required');
  await db().collection('users').doc(body.uid).set({
    isNewUser: false,
    onboardingCompletedAt: Date.now(),
    updatedAt: Date.now(),
  }, { merge: true });
  return json({ ok: true });
}
