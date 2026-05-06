import type { DiagnosticAnswer, WaitlistApplication } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';
import { generateDossier } from '../../lib/dossier-pipeline';
import { crisisResponseBody, guardText } from '../../lib/crisis-guard';

export const config = { runtime: 'edge' };

/**
 * POST /api/waitlist/submit
 * Body: { email, answers: DiagnosticAnswer[] }
 * Persists the application, fires the Claude dossier pipeline, and stores
 * the dossier alongside. Returns 200 with the application id once both
 * writes complete.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{ email: string; answers: DiagnosticAnswer[] }>(req);
  if (!body?.email || !Array.isArray(body.answers)) {
    return error(400, 'email and answers required');
  }

  for (const a of body.answers) {
    const text = textOf(a);
    if (!text) continue;
    const g = guardText(text);
    if (g.blocked) return json(crisisResponseBody(g.matchedPatterns));
  }

  const ref = db().collection('waitlist').doc();
  const application: WaitlistApplication = {
    id: ref.id,
    email: body.email.toLowerCase().trim(),
    submittedAt: Date.now(),
    answers: body.answers,
  };
  await ref.set(application);

  // Generate dossier — best-effort. If Claude fails, the application is
  // still saved and the Founder can run the dossier later.
  try {
    const dossier = await generateDossier({
      applicationId: ref.id,
      answers: body.answers,
    });
    await ref.collection('private').doc('dossier').set(dossier);
  } catch (e) {
    await ref.collection('private').doc('dossierError').set({
      error: (e as Error).message,
      ts: Date.now(),
    });
  }

  return json({ ok: true, applicationId: ref.id });
}

function textOf(a: DiagnosticAnswer): string {
  if (a.questionId === 'q1_friction' || a.questionId === 'q4_failure') return a.text;
  if (a.questionId === 'q2_ambition') return a.text;
  return '';
}
