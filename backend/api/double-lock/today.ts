import { db } from '../../lib/firebase-admin';
import { error, json } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * GET /api/double-lock/today?uid=...&date=YYYY-MM-DD
 * Returns whether today's Double-Lock has been completed. Clients also keep
 * a Firestore snapshot listener open for realtime cross-device unlock.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  const url = new URL(req.url);
  const uid = url.searchParams.get('uid');
  const date = url.searchParams.get('date');
  if (!uid || !date) return error(400, 'uid and date required');
  const snap = await db()
    .collection('users')
    .doc(uid)
    .collection('doubleLockCompletions')
    .doc(date)
    .get();
  return json({
    completed: snap.exists,
    completedAt: (snap.data()?.completedAt as number | undefined) ?? null,
    device: (snap.data()?.device as string | undefined) ?? null,
  });
}
