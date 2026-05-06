import type { StripeCheckoutResponse, StripePlanId } from '@bennett/shared';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export async function startCheckout(opts: {
  uid: string;
  plan: StripePlanId;
}): Promise<StripeCheckoutResponse> {
  const res = await fetch(`${BASE}/api/stripe/checkout`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      ...opts,
      successUrl: `${window.location.origin}/?stripe=success`,
      cancelUrl: `${window.location.origin}/?stripe=cancel`,
    }),
  });
  if (!res.ok) throw new Error(`checkout ${res.status}`);
  return (await res.json()) as StripeCheckoutResponse;
}
