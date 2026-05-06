import type { CrisisLogEvent } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * POST /api/crisis/log
 * Body: CrisisLogEvent (uid, surface, matchedPatterns, action, ts)
 *
 * Persists a privacy-safe record of the intercept. RAW USER TEXT IS NEVER
 * STORED — only pattern names + the surface that fired.
 *
 * Stored at:
 *   - users/{uid}/crisisEvents/{eventId}      (user-scoped, for follow-up)
 *   - crisisEvents/{eventId}                  (founder review surface)
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<CrisisLogEvent>(req);
  if (!body?.uid || !body?.surface || !body?.action) {
    return error(400, 'uid + surface + action required');
  }
  const eventId = `${Date.now()}-${body.surface}`;
  const record = {
    ...body,
    matchedPatterns: Array.isArray(body.matchedPatterns) ? body.matchedPatterns : [],
    ts: body.ts ?? Date.now(),
  };
  await db().collection('users').doc(body.uid).collection('crisisEvents').doc(eventId).set(record);
  await db().collection('crisisEvents').doc(eventId).set(record);
  return json({ ok: true, eventId });
}
