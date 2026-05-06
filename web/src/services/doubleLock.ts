import { onSnapshot, doc } from 'firebase/firestore';
import { firestore } from './firebase';
import type { DoubleLockCompletion } from '@bennett/shared';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function recordCompletion(opts: { uid: string; durationMs: number }): Promise<void> {
  const body: DoubleLockCompletion = {
    uid: opts.uid,
    date: todayKey(),
    completedAt: Date.now(),
    device: 'web',
    durationMs: opts.durationMs,
  };
  await fetch(`${BASE}/api/double-lock/complete`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * Cross-device unlock listener. Returns an unsubscribe function.
 * Fires `onUnlocked` if today's completion doc exists / appears.
 */
export function observeTodayUnlock(
  uid: string,
  onUnlocked: () => void,
): () => void {
  const ref = doc(firestore(), 'users', uid, 'doubleLockCompletions', todayKey());
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) onUnlocked();
  });
}
