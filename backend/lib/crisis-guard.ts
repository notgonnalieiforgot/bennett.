import { detectCrisis } from '@bennett/shared';

/**
 * Server-side crisis guard. Wraps any free-text-handling endpoint:
 * if a crisis pattern matches, return a structured intercept response
 * instead of running the normal pipeline.
 *
 * Importantly: the response has no Bennett persona text. The caller
 * (the client UI) renders the static safety panel from `HOTLINES` —
 * we do NOT generate empathetic copy here, because crisis-grade
 * messaging deserves a clinical voice, not the persona service.
 */
export interface CrisisGuardResult {
  blocked: boolean;
  matchedPatterns: string[];
}

export function guardText(text: string | null | undefined): CrisisGuardResult {
  const r = detectCrisis(text);
  return { blocked: r.matched, matchedPatterns: r.matchedPatterns };
}

/** Standard JSON response a guarded endpoint returns when blocked. */
export function crisisResponseBody(matchedPatterns: string[]) {
  return {
    crisis: true,
    matchedPatterns,
    message: 'Crisis intercept fired — render CrisisIntercept on the client.',
  };
}
