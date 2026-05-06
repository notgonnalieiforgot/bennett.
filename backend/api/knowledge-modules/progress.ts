import type { ModuleProgress } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * POST /api/knowledge-modules/progress
 * Body: { uid, moduleId, completedLessons[], quizPassed, bestQuizScore }
 * Idempotent merge into users/{uid}/moduleProgress/{moduleId}. Sets
 * masteryBadgeEarned = true the first time quizPassed flips true.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{
    uid: string;
    moduleId: ModuleProgress['moduleId'];
    completedLessons: string[];
    quizPassed: boolean;
    bestQuizScore: number;
  }>(req);
  if (!body?.uid || !body?.moduleId) return error(400, 'uid and moduleId required');

  const ref = db()
    .collection('users')
    .doc(body.uid)
    .collection('moduleProgress')
    .doc(body.moduleId);
  const prev = await ref.get();
  const prevPassed = prev.exists ? !!prev.data()?.quizPassed : false;

  const next: ModuleProgress = {
    moduleId: body.moduleId,
    completedLessons: Array.from(new Set(body.completedLessons ?? [])),
    quizPassed: body.quizPassed === true,
    bestQuizScore: Math.max(
      typeof body.bestQuizScore === 'number' ? body.bestQuizScore : 0,
      typeof prev.data()?.bestQuizScore === 'number' ? prev.data()!.bestQuizScore : 0,
    ),
    masteryBadgeEarned: prevPassed || body.quizPassed === true,
    lastTouchedAt: Date.now(),
  };
  await ref.set(next, { merge: true });
  return json(next);
}
