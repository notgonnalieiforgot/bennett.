import { useEffect, useState } from 'react';
import { formatLockoutRemaining, sectorLocked } from '@bennett/shared';

/**
 * 24-hour PSM lockout hook. Reads the device clock — Phase 6 will add
 * a server-time skew check so a user can't sidestep the lockout by
 * winding their clock forward.
 */
export function useLockout(lockoutUntil: number | null | undefined): {
  locked: boolean;
  remaining: string;
  ms: number;
} {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!lockoutUntil) return;
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [lockoutUntil]);

  const locked = sectorLocked(lockoutUntil ?? null, now);
  const ms = locked ? Math.max(0, (lockoutUntil ?? 0) - now) : 0;
  const remaining = locked && lockoutUntil ? formatLockoutRemaining(lockoutUntil, now) : '';
  return { locked, remaining, ms };
}
