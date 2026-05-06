import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';
import { getMessaging } from 'firebase-admin/messaging';
import { firebaseApp } from '../../lib/firebase-admin';

export const config = { runtime: 'edge' };

/**
 * Phase 6.9 — Double-Lock cross-device sync hardening.
 *
 * When one device completes the daily Double-Lock, this endpoint fires
 * a silent FCM data message to ALL of the user's other registered
 * devices. The receiving devices flip a local "today is unlocked" flag
 * (UserDefaults / localStorage) so they don't make the user re-do the
 * gate, even if their Firestore listener was offline at the moment of
 * completion.
 *
 * Per Critical Rule #7 — synchronized across all user devices.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{ uid: string; date: string; sourceDevice: 'ios' | 'macos' | 'web' }>(req);
  if (!body?.uid || !body?.date) return error(400, 'uid + date required');

  const tokensSnap = await db()
    .collection('users')
    .doc(body.uid)
    .collection('pushTokens')
    .get();
  const targets = tokensSnap.docs
    .map((d) => d.data() as { token: string; platform: string })
    .filter((t) => t.platform !== body.sourceDevice && !!t.token);
  if (targets.length === 0) return json({ delivered: 0 });

  // Silent data-only message — no notification banner, just a payload
  // the app handles in the background to flip its local flag.
  const messaging = getMessaging(firebaseApp());
  await messaging.sendEachForMulticast({
    tokens: targets.map((t) => t.token),
    data: {
      kind: 'double_lock_complete',
      date: body.date,
      sourceDevice: body.sourceDevice ?? 'unknown',
    },
    apns: {
      payload: {
        aps: { 'content-available': 1 },
      },
      headers: {
        'apns-priority': '5',
        'apns-push-type': 'background',
      },
    },
  });
  return json({ delivered: targets.length });
}
