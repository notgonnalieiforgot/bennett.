import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';

export const config = { runtime: 'edge' };

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const LOCK_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * POST /api/username/lock
 * Body: { uid, username }
 *
 * Server-side enforcement of Critical Rule #11. Validates format,
 * checks uniqueness, and writes `usernameLockedUntil = now + 30 days`
 * to the user record. After this, the username cannot change for 30
 * days unless an admin clears the lock.
 *
 * NEVER trust the client for the 30-day check.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{ uid: string; username: string }>(req);
  if (!body?.uid || !body?.username) return error(400, 'uid + username required');
  const username = body.username.trim();
  if (!USERNAME_RE.test(username)) return error(400, 'invalid username format');

  const userRef = db().collection('users').doc(body.uid);
  const userSnap = await userRef.get();

  // Reject if user already has an active lock — they can't change yet.
  const existingLockedUntil = (userSnap.data()?.usernameLockedUntil as number | undefined) ?? 0;
  if (existingLockedUntil > Date.now()) {
    return error(409, 'username locked. wait until lock expires.');
  }

  // Case-insensitive uniqueness check.
  const lower = username.toLowerCase();
  const existing = await db()
    .collection('users')
    .where('usernameLower', '==', lower)
    .limit(1)
    .get();
  const taken = existing.docs.find((d) => d.id !== body.uid);
  if (taken) return error(409, 'username taken');

  await userRef.set({
    username,
    usernameLower: lower,
    usernameLockedUntil: Date.now() + LOCK_MS,
    updatedAt: Date.now(),
  }, { merge: true });

  return json({
    ok: true,
    username,
    usernameLockedUntil: Date.now() + LOCK_MS,
  });
}
