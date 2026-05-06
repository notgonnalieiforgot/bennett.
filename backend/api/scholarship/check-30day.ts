import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';
import { stripe } from '../../lib/stripe';

export const config = { runtime: 'edge' };

/**
 * POST /api/scholarship/check-30day
 * Body: { uid, currentStreak }
 *
 * Called by the Double-Lock completion pipeline. If the user is in
 * Scholarship Mode AND just hit a 30-day streak, automatically issue a
 * 100% refund via stripe.refunds.create() and write a Friend persona
 * trigger to the realTalks collection so the client can celebrate.
 *
 * Idempotent — refundedAt latches and prevents a second refund.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{ uid: string; currentStreak: number }>(req);
  if (!body?.uid || typeof body.currentStreak !== 'number') {
    return error(400, 'uid and currentStreak required');
  }
  if (body.currentStreak < 30) return json({ refunded: false, reason: 'streak<30' });

  const userRef = db().collection('users').doc(body.uid);
  const snap = await userRef.get();
  if (!snap.exists) return error(404, 'no user');
  const u = snap.data() ?? {};

  const sm = u.scholarshipMode as
    | { active?: boolean; refundedAt?: number; stripePaymentIntentId?: string; stripeCustomerId?: string }
    | undefined;

  if (!sm?.active) return json({ refunded: false, reason: 'not_active' });
  if (sm.refundedAt) return json({ refunded: true, reason: 'already_refunded' });
  if (!sm.stripePaymentIntentId && !sm.stripeCustomerId) {
    return json({ refunded: false, reason: 'no_payment_intent' });
  }

  // Refund the latest scholarship payment intent. If we don't have one
  // captured (legacy users), fall back to refunding the most recent
  // invoice on the customer.
  let amountRefunded: number | null = null;
  try {
    if (sm.stripePaymentIntentId) {
      const refund = await stripe().refunds.create({
        payment_intent: sm.stripePaymentIntentId,
      });
      amountRefunded = typeof refund.amount === 'number' ? refund.amount : null;
    } else if (sm.stripeCustomerId) {
      const invoices = await stripe().invoices.list({ customer: sm.stripeCustomerId, limit: 1 });
      const inv = invoices.data[0];
      const piId = typeof inv?.payment_intent === 'string'
        ? inv.payment_intent
        : (inv?.payment_intent as { id?: string } | undefined)?.id;
      if (piId) {
        const refund = await stripe().refunds.create({ payment_intent: piId });
        amountRefunded = typeof refund.amount === 'number' ? refund.amount : null;
      }
    }
  } catch (e) {
    return error(502, `refund failed: ${(e as Error).message}`);
  }

  await userRef.set(
    {
      scholarshipMode: {
        ...sm,
        refundedAt: Date.now(),
        refundedAmount: amountRefunded,
        active: false,
      },
      scholarshipModeActive: false,
    },
    { merge: true },
  );

  // Write a celebration trigger for the client to surface.
  await userRef.collection('realTalks').doc(`scholarship-refund-${Date.now()}`).set({
    kind: 'refund_earned',
    message: 'u earned it back. every cent. that\'s the deal.',
    createdAt: Date.now(),
  });

  return json({ refunded: true, amountRefunded });
}
