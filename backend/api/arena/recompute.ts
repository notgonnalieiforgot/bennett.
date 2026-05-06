import { error, json, readJson } from '../../lib/http';
import { recomputeArenaForUser } from '../../lib/discipline-velocity';

export const config = { runtime: 'edge' };

/**
 * POST /api/arena/recompute
 * Body: { uid }
 * Called by the Double-Lock completion handler / module quiz pass /
 * marble-add to refresh the user's materialized arena entries.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{ uid: string }>(req);
  if (!body?.uid) return error(400, 'uid required');
  const entry = await recomputeArenaForUser(body.uid);
  return json({ entry });
}
