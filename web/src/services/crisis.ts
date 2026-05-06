import { detectCrisis, type CrisisDetectionResult } from '@bennett/shared';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export type { CrisisDetectionResult };
export { detectCrisis };

export type CrisisSurface =
  | 'beta_feedback'
  | 'knowledge_bar'
  | 'vocalization'
  | 'waitlist_answer'
  | 'otf_prompt';

export type CrisisAction = 'shown' | 'dismissed' | 'dialed' | 'opened_resource' | string;

/**
 * Log a privacy-safe crisis event. RAW TEXT IS NEVER SENT.
 * Soft-fail — we never block the UI on a logging error.
 */
export async function logCrisisEvent(opts: {
  uid: string;
  surface: CrisisSurface;
  matchedPatterns: string[];
  action: CrisisAction;
}): Promise<void> {
  try {
    await fetch(`${BASE}/api/crisis/log`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...opts, ts: Date.now() }),
    });
  } catch {
    /* swallow */
  }
}
