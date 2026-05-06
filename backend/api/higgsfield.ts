import { db } from '../lib/firebase-admin';
import { error, json } from '../lib/http';

export const config = { runtime: 'edge' };

/**
 * GET /api/higgsfield?uid=...&date=YYYY-MM-DD
 *
 * Phase 6.2 — returns the cached morning brief video URL for a given
 * date. The actual generation happens in the Firebase Scheduled Function
 * (firebase/functions/src/higgsfield.ts) at 11pm user-local-time.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  const url = new URL(req.url);
  const uid = url.searchParams.get('uid');
  const date = url.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);
  if (!uid) return error(400, 'uid required');
  const snap = await db()
    .collection('users')
    .doc(uid)
    .collection('morningBrief')
    .doc(date)
    .get();
  if (!snap.exists) return json({ ready: false });
  const data = snap.data();
  return json({
    ready: true,
    videoUrl: data?.videoUrl ?? null,
    modules: data?.modules ?? [],
    generatedAt: data?.generatedAt ?? null,
  });
}
