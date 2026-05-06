import type { BetaFeedback } from '@bennett/shared';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export async function submitFeedback(opts: {
  uid: string;
  text: string;
  trigger: BetaFeedback['trigger'];
}): Promise<BetaFeedback> {
  const res = await fetch(`${BASE}/api/feedback/submit`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error(`feedback ${res.status}`);
  return (await res.json()) as BetaFeedback;
}

export async function loadFounderFeed(opts: {
  uid: string;
  sentiment?: BetaFeedback['sentiment'];
}): Promise<BetaFeedback[]> {
  const url = new URL(`${BASE || window.location.origin}/api/feedback/founder-feed`);
  url.searchParams.set('uid', opts.uid);
  if (opts.sentiment) url.searchParams.set('sentiment', opts.sentiment);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`founder-feed ${res.status}`);
  const json = (await res.json()) as { items: BetaFeedback[] };
  return json.items;
}
