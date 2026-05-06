import { masteredModules } from '../../lib/elite-access';
import { error, json } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * GET /api/badges/list?uid=...
 * Returns the modules where the user has earned a Mastery Badge. Used by
 * the user profile / Arena rows / Elite Tier consumers.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  const uid = new URL(req.url).searchParams.get('uid');
  if (!uid) return error(400, 'uid required');
  const badges = await masteredModules(uid);
  return json({ badges });
}
