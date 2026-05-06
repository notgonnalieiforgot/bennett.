import type { DoerDossier, FounderDecision, WaitlistApplication } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json } from '../../lib/http';
import { isFounder } from '../../lib/founder-auth';

export const config = { runtime: 'edge' };

/**
 * GET /api/waitlist/founder-list?uid=<founderUid>&filter=<undecided|approved|rejected|flagged>
 * Returns applications joined with their dossier + decision, ordered by
 * submission time. Founder-only.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  const url = new URL(req.url);
  const uid = url.searchParams.get('uid');
  if (!isFounder(uid)) return error(403, 'forbidden');
  const filter = url.searchParams.get('filter');

  const snap = await db()
    .collection('waitlist')
    .orderBy('submittedAt', 'desc')
    .limit(500)
    .get();

  const out: Array<{
    application: WaitlistApplication;
    dossier: DoerDossier | null;
    decision: FounderDecision | null;
  }> = [];

  for (const d of snap.docs) {
    const application = d.data() as WaitlistApplication;
    const [dossierSnap, decisionSnap] = await Promise.all([
      d.ref.collection('private').doc('dossier').get(),
      d.ref.collection('private').doc('decision').get(),
    ]);
    const dossier = dossierSnap.exists ? (dossierSnap.data() as DoerDossier) : null;
    const decision = decisionSnap.exists ? (decisionSnap.data() as FounderDecision) : null;

    if (filter === 'undecided' && decision) continue;
    if (filter === 'approved' && decision?.decision !== 'approved') continue;
    if (filter === 'rejected' && decision?.decision !== 'rejected') continue;
    if (filter === 'flagged' && !dossier?.flagged) continue;

    out.push({ application, dossier, decision });
  }

  return json({ applications: out });
}
