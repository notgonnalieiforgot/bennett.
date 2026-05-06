import { exchangeCode, saveTokens } from '../../../lib/google-calendar';
import { env } from '../../../lib/env';

export const config = { runtime: 'edge' };

/**
 * GET /api/calendar/oauth/callback?code=...&state=<uid>
 * Final leg of the OAuth dance. Exchanges the auth code for tokens (incl.
 * refresh token), persists them under the right user, and redirects the
 * browser back to the app.
 */
export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const uid  = url.searchParams.get('state'); // we packed uid in state
  if (!code || !uid) {
    return new Response('missing code or state', { status: 400 });
  }
  const redirectUri = `${env.appUrl()}/api/calendar/oauth/callback`;
  try {
    const tokens = await exchangeCode({ code, redirectUri });
    await saveTokens(uid, tokens);
  } catch (e) {
    return new Response(`google oauth error: ${(e as Error).message}`, { status: 500 });
  }
  // Send the user back into the app. Phase 7 will deep-link by platform.
  return Response.redirect(`${env.appUrl()}/?calendar=connected`, 302);
}
