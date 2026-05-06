import type { FounderDecision } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';
import { isFounder } from '../../lib/founder-auth';

export const config = { runtime: 'edge' };

/**
 * POST /api/waitlist/founder-decide
 * Body: { uid, applicationId, decision: 'approved' | 'rejected' }
 * Founder-only. On approve, generates a single-use invite code.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{
    uid: string;
    applicationId: string;
    decision: 'approved' | 'rejected';
  }>(req);
  if (!isFounder(body?.uid)) return error(403, 'forbidden');
  if (!body?.applicationId || !body?.decision) return error(400, 'applicationId + decision required');

  const ref = db().collection('waitlist').doc(body.applicationId);
  const exists = (await ref.get()).exists;
  if (!exists) return error(404, 'application not found');

  const inviteCode = body.decision === 'approved' ? makeInviteCode() : undefined;
  const decision: FounderDecision = {
    applicationId: body.applicationId,
    decision: body.decision,
    decidedAt: Date.now(),
    decidedBy: body.uid,
    inviteCode,
  };
  await ref.collection('private').doc('decision').set(decision);

  // Index invite codes for redemption lookup at sign-up time.
  if (inviteCode) {
    await db().collection('inviteCodes').doc(inviteCode).set({
      applicationId: body.applicationId,
      issuedAt: Date.now(),
      consumed: false,
    });
  }

  return json(decision);
}

/** Unguessable, human-readable invite code: BN-XXXX-XXXX. */
function makeInviteCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // exclude 0/O/1/I/L
  const part = (n: number): string => {
    let s = '';
    for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  };
  return `BN-${part(4)}-${part(4)}`;
}
