import { ARENA_TOP_N, type ArenaEntry, type ArenaSnapshot } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * GET /api/arena/global?limit=100
 * Returns the top N entries by Discipline Velocity.
 * Per spec §7a: shows username only, NOT active module.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  const limit = Math.min(
    Number(new URL(req.url).searchParams.get('limit') ?? ARENA_TOP_N),
    ARENA_TOP_N,
  );
  const snap = await db()
    .collection('arena')
    .doc('global')
    .collection('entries')
    .orderBy('disciplineVelocity', 'desc')
    .limit(limit)
    .get();
  const entries: ArenaEntry[] = snap.docs.map((d) => {
    const e = d.data() as ArenaEntry;
    // Strip module per spec §7a — Global hides active module.
    return { ...e, module: undefined };
  });
  const out: ArenaSnapshot = { scope: 'global', entries, generatedAt: Date.now() };
  return json(out);
}
