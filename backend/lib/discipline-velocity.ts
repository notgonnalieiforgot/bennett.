import { computeDisciplineVelocity, type ArenaEntry } from '@bennett/shared';
import { db } from './firebase-admin';

/**
 * Recompute one user's Discipline Velocity from authoritative Firestore
 * state and write it to the materialized arena entries.
 *
 * Called from:
 *  - Double-Lock completion handler (streak + doubleLocks change)
 *  - Module quiz pass (mastered count changes)
 *  - Daily energy-pulse logger (avgEnergyPulse30d changes)
 *  - Marble Jar add-marble (totals change)
 */
export async function recomputeArenaForUser(uid: string): Promise<ArenaEntry | null> {
  const userSnap = await db().collection('users').doc(uid).get();
  if (!userSnap.exists) return null;
  const u = userSnap.data() ?? {};

  // Roll through user subcollections to compute totals.
  const moduleProgressSnap = await userSnap.ref.collection('moduleProgress').get();
  const masteredModules: string[] = [];
  for (const m of moduleProgressSnap.docs) {
    if (m.data().masteryBadgeEarned === true) masteredModules.push(m.id);
  }

  const ghostsSnap = await userSnap.ref
    .collection('marbles')
    .where('kind', '==', 'ghost')
    .count()
    .get();
  const totalGhosts = ghostsSnap.data().count;

  const locksSnap = await userSnap.ref.collection('doubleLockCompletions').count().get();
  const totalLocks = locksSnap.data().count;

  // Trailing 30-day energy pulse average (best-effort: pulled from
  // user.energyPulseHistory if present, else current single value).
  const history = (u.energyPulseHistory as Array<{ ts: number; value: number }> | undefined) ?? [];
  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = history.filter((p) => p.ts >= since).map((p) => p.value);
  const avgEnergy = recent.length
    ? recent.reduce((a, b) => a + b, 0) / recent.length
    : (typeof u.energyPulseToday === 'number' ? u.energyPulseToday : 5);

  const dv = computeDisciplineVelocity({
    currentStreak: typeof u.currentStreak === 'number' ? u.currentStreak : 0,
    longestStreak: typeof u.longestStreak === 'number' ? u.longestStreak : 0,
    totalDoubleLockAllTime: totalLocks,
    modulesMastered: masteredModules.length,
    avgEnergyPulse30d: avgEnergy,
    totalGhostMarblesAllTime: totalGhosts,
  });

  const entry: ArenaEntry = {
    uid,
    username: typeof u.username === 'string' ? u.username : 'anon',
    disciplineVelocity: dv,
    masteryBadges: masteredModules as ArenaEntry['masteryBadges'],
    updatedAt: Date.now(),
  };

  // Materialize into arena/global/{uid}
  await db().collection('arena').doc('global').collection('entries').doc(uid).set(entry);

  // Specialized sectors per mastered module (also write entries under the
  // user's "active" module, if known, so non-mastered users still appear).
  for (const moduleId of masteredModules) {
    await db()
      .collection('arena')
      .doc('sector')
      .collection(moduleId)
      .doc(uid)
      .set({ ...entry, module: moduleId });
  }
  const activeModules = (u.activeModules as string[] | undefined) ?? [];
  for (const moduleId of activeModules) {
    if (masteredModules.includes(moduleId)) continue;
    await db()
      .collection('arena')
      .doc('sector')
      .collection(moduleId)
      .doc(uid)
      .set({ ...entry, module: moduleId });
  }

  return entry;
}
