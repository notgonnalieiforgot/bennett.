// PHASE 8 — Bulletin aggregation pipeline. Phase 1 stub.
// Per spec §11f: aggregate Mon-Fri data, compute weeklyScore, call Claude
// once for {aiVerdict, aiWeekTitle}, store under users/{uid}/bulletins/{weekNumber},
// trigger 8pm push.

export async function generateBulletinForAllUsers(): Promise<void> {
  console.log('[bulletin] phase-1 stub — implementation in phase 8');
}
