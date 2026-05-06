import { error, json, readJson } from '../../lib/http';
import { sendToUser, type NotificationKind } from '../../lib/fcm';

export const config = { runtime: 'edge' };

/**
 * POST /api/notifications/send
 * Body: { uid, kind }
 *
 * Internal trigger endpoint — called by other handlers (shield activated,
 * bulletin ready, streak milestone) and by Firebase Scheduled Functions
 * (morning energy check, Bulletin Friday 8pm cron).
 *
 * Phase 6.1 ships the wire-up. Auth on this endpoint should be added
 * before launch (currently relies on network-level isolation; an internal
 * shared secret check is a small Phase 6.5 follow-up).
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{ uid: string; kind: NotificationKind }>(req);
  if (!body?.uid || !body?.kind) return error(400, 'uid + kind required');
  try {
    await sendToUser(body.uid, body.kind);
    return json({ ok: true });
  } catch (e) {
    return error(502, `fcm send failed: ${(e as Error).message}`);
  }
}
