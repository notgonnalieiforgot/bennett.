/**
 * Pricing per spec §8c (Option C — The Premium Signal). Replace placeholder
 * `price_*` IDs with live Stripe dashboard values before launch.
 */

export type StripePlanId =
  | 'doer_monthly'
  | 'doer_annual'
  | 'scholarship_monthly';

export interface StripePlan {
  id: StripePlanId;
  priceId: string;        // Stripe price_*
  amount: number;         // cents
  interval: 'month' | 'year';
  displayPrice: string;
  anchorPrice?: string;
  discountPercent?: number;
}

export const STRIPE_PLANS: Record<StripePlanId, StripePlan> = {
  doer_monthly: {
    id: 'doer_monthly',
    priceId: 'price_doer_monthly_24',
    amount: 2400,
    interval: 'month',
    displayPrice: '$24/mo',
    anchorPrice: '$40/mo',
    discountPercent: 40,
  },
  doer_annual: {
    id: 'doer_annual',
    priceId: 'price_doer_annual_204',
    amount: 20400,
    interval: 'year',
    displayPrice: '$16.99/mo',
    anchorPrice: '$480/yr',
    discountPercent: 57,
  },
  scholarship_monthly: {
    id: 'scholarship_monthly',
    priceId: 'price_scholarship_monthly_20',
    amount: 2000,
    interval: 'month',
    displayPrice: '$20/mo',
  },
};

export interface StripeCheckoutRequest {
  uid: string;
  plan: StripePlanId;
  /** Where Stripe redirects after success/cancel. Required by Stripe. */
  successUrl: string;
  cancelUrl: string;
}

export interface StripeCheckoutResponse {
  url: string;            // Stripe-hosted checkout session URL
  sessionId: string;
}

/** Tracks Scholarship Mode lifecycle on the user record. */
export interface ScholarshipModeState {
  active: boolean;
  startedAt: number;
  refundedAt?: number;
  refundedAmount?: number;
  forfeitedAt?: number;
  /** Stripe customer + subscription ids — server-only fields. */
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePaymentIntentId?: string;
}
