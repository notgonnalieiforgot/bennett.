import type { RedemptionTrial } from '@bennett/shared';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export async function startRedemption(opts: {
  uid: string;
  trial: RedemptionTrial;
  date: string;
}): Promise<void> {
  await fetch(`${BASE}/api/redemption/start`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(opts),
  });
}

export async function verifyRedemption(opts: {
  uid: string;
  trial: RedemptionTrial;
  date: string;
  survived: boolean;
  evidence?: Record<string, unknown>;
}): Promise<{ currentStreak: number; status: string }> {
  const res = await fetch(`${BASE}/api/redemption/verify`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error(`verify ${res.status}`);
  return (await res.json()) as { currentStreak: number; status: string };
}
