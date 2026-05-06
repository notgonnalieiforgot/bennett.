import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * POST /api/notifications/register-token
 * Body: { uid, token, platform: 'ios' | 'macos' | 'web' }
 *
 * Idempotent — token doc id IS the token, so the same client re-registering
 * just refreshes the timestamp. On Apple sign-out we delete via /unregister.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{
    uid: string;
    token: string;
    platform: 'ios' | 'macos' | 'web';
  }>(req);
  if (!body?.uid || !body?.token || !body?.platform) {
    return error(400, 'uid + token + platform required');
  }
  await db()
    .collection('users')
    .doc(body.uid)
    .collection('pushTokens')
    .doc(body.token)
    .set({
      token: body.token,
      platform: body.platform,
      registeredAt: Date.now(),
    }, { merge: true });
  return json({ ok: true });
}
