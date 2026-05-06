import type { ShieldsTodayResponse } from '@bennett/shared';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export async function consentURL(uid: string): Promise<string> {
  const res = await fetch(`${BASE}/api/calendar/oauth/start?uid=${encodeURIComponent(uid)}`);
  if (!res.ok) throw new Error(`consentURL failed: ${res.status}`);
  const json = (await res.json()) as { url: string };
  return json.url;
}

export async function refreshShieldsToday(opts: {
  uid: string;
  energyPulse: number;
}): Promise<ShieldsTodayResponse> {
  const res = await fetch(`${BASE}/api/calendar/shields-today`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      uid: opts.uid,
      energyPulse: opts.energyPulse,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });
  if (!res.ok) throw new Error(`shields-today ${res.status}`);
  return (await res.json()) as ShieldsTodayResponse;
}

export async function reportShieldIgnored(opts: {
  uid: string;
  shieldId: string;
  energyPulse: number;
  userName: string;
}): Promise<{ realTalk: string | null; ignoredCount: number }> {
  const res = await fetch(`${BASE}/api/calendar/shield-ignored`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error(`shield-ignored ${res.status}`);
  return (await res.json()) as { realTalk: string | null; ignoredCount: number };
}
