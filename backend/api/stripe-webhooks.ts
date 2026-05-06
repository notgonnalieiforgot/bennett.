import type Stripe from 'stripe';
import { db } from '../lib/firebase-admin';
import { error } from '../lib/http';
import { stripe } from '../lib/stripe';
import { env } from '../lib/env';

export const config = { runtime: 'edge' };

/**
 * POST /api/stripe-webhooks
 *
 * Handles:
 *  - checkout.session.completed: persist subscription + flip user flags
 *  - invoice.payment_succeeded: keep subscription state fresh
 *  - customer.subscription.deleted/updated: flip flags off / on
 *
 * 30-day streak refunds are NOT triggered here — they fire from the
 * Marble Jar / Double-Lock pipeline via /api/scholarship/check-30day.
 *
 * NOTE: Vercel Edge passes a `Request` object whose body we need raw for
 * Stripe signature verification. We use `await req.text()` to preserve
 * bytes exactly.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const sig = req.headers.get('stripe-signature');
  if (!sig) return error(400, 'missing stripe-signature header');
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(raw, sig, env.stripeWebhookSecret());
  } catch (e) {
    return error(400, `webhook signature verification failed: ${(e as Error).message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await onCheckoutComplete(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await onInvoicePaid(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await onSubscriptionDeleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await onSubscriptionUpdated(event.data.object);
      break;
    default:
      // Ignore — Stripe sends a lot we don't care about.
      break;
  }
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'content-type': 'application/json' },
  });
}

async function onCheckoutComplete(s: Stripe.Checkout.Session): Promise<void> {
  const uid = s.metadata?.uid;
  const plan = s.metadata?.plan;
  if (!uid) return;
  const subscriptionId = typeof s.subscription === 'string' ? s.subscription : s.subscription?.id;
  const customerId    = typeof s.customer    === 'string' ? s.customer    : s.customer?.id;
  const updates: Record<string, unknown> = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    updatedAt: Date.now(),
  };
  if (plan === 'doer_monthly' || plan === 'doer_annual') {
    updates.doerTabSubscriptionActive = true;
  }
  if (plan === 'scholarship_monthly') {
    updates.scholarshipModeActive = true;
    updates.scholarshipMode = {
      active: true,
      startedAt: Date.now(),
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePaymentIntentId: typeof s.payment_intent === 'string' ? s.payment_intent : null,
    };
  }
  await db().collection('users').doc(uid).set(updates, { merge: true });
}

async function onInvoicePaid(inv: Stripe.Invoice): Promise<void> {
  const subId = typeof (inv as { subscription?: string | Stripe.Subscription }).subscription === 'string'
    ? (inv as { subscription: string }).subscription
    : (inv as { subscription?: Stripe.Subscription }).subscription?.id;
  if (!subId) return;
  const sub = await stripe().subscriptions.retrieve(subId);
  const uid = sub.metadata?.uid;
  const plan = sub.metadata?.plan;
  if (!uid) return;
  const updates: Record<string, unknown> = { updatedAt: Date.now() };
  if (plan === 'doer_monthly' || plan === 'doer_annual') updates.doerTabSubscriptionActive = true;
  if (plan === 'scholarship_monthly') updates.scholarshipModeActive = true;
  await db().collection('users').doc(uid).set(updates, { merge: true });
}

async function onSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const uid = sub.metadata?.uid;
  const plan = sub.metadata?.plan;
  if (!uid) return;
  const updates: Record<string, unknown> = { updatedAt: Date.now() };
  if (plan === 'doer_monthly' || plan === 'doer_annual') updates.doerTabSubscriptionActive = false;
  if (plan === 'scholarship_monthly') updates.scholarshipModeActive = false;
  await db().collection('users').doc(uid).set(updates, { merge: true });
}

async function onSubscriptionUpdated(sub: Stripe.Subscription): Promise<void> {
  const uid = sub.metadata?.uid;
  const plan = sub.metadata?.plan;
  if (!uid) return;
  const active = sub.status === 'active' || sub.status === 'trialing';
  const updates: Record<string, unknown> = { updatedAt: Date.now() };
  if (plan === 'doer_monthly' || plan === 'doer_annual') updates.doerTabSubscriptionActive = active;
  if (plan === 'scholarship_monthly') updates.scholarshipModeActive = active;
  await db().collection('users').doc(uid).set(updates, { merge: true });
}
