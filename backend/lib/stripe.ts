import Stripe from 'stripe';
import { env } from './env';

/**
 * Stripe SDK client wired with `createFetchHttpClient` so it works on
 * Vercel Edge runtime (the default Node http client doesn't run there).
 */
let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) {
    client = new Stripe(env.stripeSecretKey(), {
      apiVersion: '2025-09-30.clover',
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return client;
}
