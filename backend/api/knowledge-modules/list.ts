import { MODULES } from '@bennett/shared';
import { error, json } from '../../lib/http';

export const config = { runtime: 'edge' };

/**
 * GET /api/knowledge-modules/list — returns the static Phase 3 module
 * catalog (5 modules). Phase 4+ may move this to Firestore so the Founder
 * can edit without a code release.
 */
export default function handler(req: Request): Response {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  return json({ modules: MODULES });
}
