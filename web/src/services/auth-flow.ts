import { authService } from './auth';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export async function checkUsername(q: string): Promise<{ available: boolean; reason?: string }> {
  const res = await fetch(`${BASE}/api/username-check?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error(`username-check ${res.status}`);
  return (await res.json()) as { available: boolean; reason?: string };
}

export async function lockUsername(opts: {
  uid: string;
  username: string;
}): Promise<{ ok: true; username: string }> {
  const res = await fetch(`${BASE}/api/username/lock`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(opts),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`lock failed: ${txt}`);
  }
  return (await res.json()) as { ok: true; username: string };
}

export async function completeOnboarding(uid: string): Promise<void> {
  await fetch(`${BASE}/api/onboarding/complete`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ uid }),
  });
}

export async function sendForgotPassword(email: string): Promise<void> {
  await fetch(`${BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export { authService };
