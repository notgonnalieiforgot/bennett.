import {
  STRIPE_PLANS,
  type StripeCheckoutRequest,
  type StripeCheckoutResponse,
} from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';
import { stripe } from '../../lib/stripe';
import { env } from '../../lib/env';

export const config = { runtime: 'edge' };

/**
 * POST /api/stripe/checkout
 * Creates a Stripe-hosted Checkout session for the requested plan.
 * The client redirects to the returned `url`.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<StripeCheckoutRequest>(req);
  if (!body?.uid || !body?.plan) return error(400, 'uid and plan required');
  const plan = STRIPE_PLANS[body.plan];
  if (!plan) return error(400, 'unknown plan');

  // Reuse the existing Stripe customer if we have one; create otherwise.
  const userRef = db().collection('users').doc(body.uid);
  const userSnap = await userRef.get();
  let customerId = userSnap.data()?.stripeCustomerId as string | undefined;
  if (!customerId) {
    const customer = await stripe().customers.create({
      metadata: { uid: body.uid },
    });
    customerId = customer.id;
    await userRef.set({ stripeCustomerId: customerId }, { merge: true });
  }

  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: body.successUrl || `${env.appUrl()}/?stripe=success`,
    cancel_url: body.cancelUrl || `${env.appUrl()}/?stripe=cancel`,
    metadata: { uid: body.uid, plan: plan.id },
    subscription_data: { metadata: { uid: body.uid, plan: plan.id } },
  });

  if (!session.url) return error(502, 'no checkout url');
  const out: StripeCheckoutResponse = { url: session.url, sessionId: session.id };
  return json(out);
}
