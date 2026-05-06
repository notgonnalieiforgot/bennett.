/**
 * Phase 3 Founder admin gate.
 *
 * Set FOUNDER_UID in env. Any request claiming to perform Founder ops
 * must include the matching uid in the body. Phase 7 will upgrade to
 * real Firebase ID-token verification + custom claim `isFounder: true`.
 *
 * The current scheme is intentionally simple: only the founder can know
 * their own uid, and the env var is server-only — but it does mean a
 * leaked uid lets someone impersonate the Founder. Treat FOUNDER_UID as
 * a secret until the Phase 7 upgrade.
 */
export function isFounder(uid: string | undefined | null): boolean {
  const expected = process.env.FOUNDER_UID;
  if (!expected) return false;
  if (!uid) return false;
  return uid === expected;
}
