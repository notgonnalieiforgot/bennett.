import { SHIELD_IGNORE_THRESHOLD, type Shield } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';
import { generatePersonaMessage } from '../persona/service';

export const config = { runtime: 'edge' };

interface Body {
  uid: string;
  shieldId: string;
  energyPulse: number;
  userName: string;
}

/**
 * POST /api/calendar/shield-ignored
 * Marks a Shield as ignored and counts ignores in the trailing 7-day
 * window. On the 3rd consecutive ignore, fires a Commander Real Talk via
 * BennettPersonaService and writes the message to
 * `users/{uid}/realTalks/{shieldId}` for the client to surface.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<Body>(req);
  if (!body?.uid || !body?.shieldId) return error(400, 'uid and shieldId required');

  const userRef = db().collection('users').doc(body.uid);
  const shieldRef = userRef.collection('shields').doc(body.shieldId);
  await shieldRef.set(
    { state: 'ignored', resolvedAt: Date.now() },
    { merge: true },
  );

  // Count ignores in the last 7 days.
  const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = await userRef
    .collection('shields')
    .where('state', '==', 'ignored')
    .where('createdAt', '>=', since)
    .get();
  const ignored: Shield[] = recent.docs.map((d) => d.data() as Shield);

  let realTalk: string | undefined;
  if (ignored.length >= SHIELD_IGNORE_THRESHOLD) {
    realTalk = await generatePersonaMessage({
      mode: 'commander',
      energyPulse: body.energyPulse,
      triggerEvent: 'shield_ignored_3x',
      streakDay: 0,
      userName: body.userName ?? 'u',
    });
    await userRef.collection('realTalks').doc(body.shieldId).set({
      shieldId: body.shieldId,
      message: realTalk,
      kind: 'shield_ignored_3x',
      createdAt: Date.now(),
    });
  }

  return json({ ok: true, ignoredCount: ignored.length, realTalk: realTalk ?? null });
}
