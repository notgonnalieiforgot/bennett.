import { getAuth } from 'firebase-admin/auth';
import { error, json, readJson } from '../../lib/http';
import { firebaseApp } from '../../lib/firebase-admin';
import { env } from '../../lib/env';

export const config = { runtime: 'edge' };

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 *
 * Issues a Firebase password reset link, then... we'd email it. For
 * Phase 7 the link is returned in the response when running in
 * development; production needs a real email transport (Resend /
 * SendGrid). Documented as a punch-list item.
 *
 * The email-existence check is INTENTIONALLY soft — we always return
 * success to avoid leaking which emails are registered.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{ email: string }>(req);
  if (!body?.email) return error(400, 'email required');

  try {
    const auth = getAuth(firebaseApp());
    const link = await auth.generatePasswordResetLink(body.email.trim().toLowerCase(), {
      url: `${env.appUrl()}/?passwordReset=complete`,
      handleCodeInApp: false,
    });
    // Phase 7 punch-list: send via Resend/SendGrid. For now we return
    // the link only on a non-prod app URL so dev can test the flow.
    const isDev = env.appUrl().includes('localhost') || env.appUrl().includes('vercel.app');
    return json({ ok: true, devLink: isDev ? link : undefined });
  } catch {
    // Soft success — don't leak whether the email exists.
    return json({ ok: true });
  }
}
