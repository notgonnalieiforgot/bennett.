import type { KnowledgeModule } from '@bennett/shared';
import { db } from './firebase-admin';

/**
 * Mastery Badge gate — Phase 4.4.
 *
 * Per spec §7c, badges act as access keys to Elite Tiers:
 *  - "Alpha" data feeds (enhanced Market Insights)
 *  - Custom Claude scripts pre-built for that domain
 *  - Founder's Audit Log entries on the user's progress
 *
 * Phase 4 ships the gate. Phase 5+ wires consumers to call it.
 *
 * The badge state lives on `users/{uid}/moduleProgress/{moduleId}` and
 * latches once `quizPassed` flips true (Phase 3).
 */
export async function hasMasteryBadge(
  uid: string,
  moduleId: KnowledgeModule,
): Promise<boolean> {
  const snap = await db()
    .collection('users')
    .doc(uid)
    .collection('moduleProgress')
    .doc(moduleId)
    .get();
  return snap.exists && snap.data()?.masteryBadgeEarned === true;
}

export async function masteredModules(uid: string): Promise<KnowledgeModule[]> {
  const snap = await db()
    .collection('users')
    .doc(uid)
    .collection('moduleProgress')
    .get();
  const out: KnowledgeModule[] = [];
  for (const d of snap.docs) {
    if (d.data().masteryBadgeEarned === true) out.push(d.id as KnowledgeModule);
  }
  return out;
}
