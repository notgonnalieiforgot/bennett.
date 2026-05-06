import { error, json } from '../../../lib/http';
import { googleAuthUrl } from '../../../lib/google-calendar';
import { env } from '../../../lib/env';

export const config = { runtime: 'edge' };

/**
 * GET /api/calendar/oauth/start?uid=...
 * Returns the Google consent URL the client should open. We pack the uid
 * into `state` so the callback can route the resulting tokens to the
 * right user record.
 */
export default function handler(req: Request): Response {
  if (req.method !== 'GET') return error(405, 'method not allowed');
  const url = new URL(req.url);
  const uid = url.searchParams.get('uid');
  if (!uid) return error(400, 'uid required');
  const redirectUri = `${env.appUrl()}/api/calendar/oauth/callback`;
  const consent = googleAuthUrl({ state: uid, redirectUri });
  return json({ url: consent });
}
