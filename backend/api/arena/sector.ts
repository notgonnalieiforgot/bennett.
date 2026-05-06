import {
  ARENA_TOP_N,
  type ArenaEntry,
  type ArenaSnapshot,
  type KnowledgeModule,
} from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * GET /api/arena/sector?module=fitness&limit=100
 * Per spec §7b: per-module leaderboards. Shows username + active module.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  const url = new URL(req.url);
  const moduleId = url.searchParams.get('module') as KnowledgeModule | null;
  if (!moduleId) return error(400, 'module required');
  const limit = Math.min(Number(url.searchParams.get('limit') ?? ARENA_TOP_N), ARENA_TOP_N);
  const snap = await db()
    .collection('arena')
    .doc('sector')
    .collection(moduleId)
    .orderBy('disciplineVelocity', 'desc')
    .limit(limit)
    .get();
  const entries: ArenaEntry[] = snap.docs.map((d) => d.data() as ArenaEntry);
  const out: ArenaSnapshot = { scope: 'sector', module: moduleId, entries, generatedAt: Date.now() };
  return json(out);
}
