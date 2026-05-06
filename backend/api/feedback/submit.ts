import type { BetaFeedback } from '@bennett/shared';
import { db } from '../../lib/firebase-admin';
import { error, json, readJson } from '../../lib/http';
import { crisisResponseBody, guardText } from '../../lib/crisis-guard';
import { guardTextWithClassifier } from '../../lib/crisis-classifier';

export const config = { runtime: 'edge' };

/**
 * POST /api/feedback/submit
 * Body: { uid, text, trigger }
 * Per spec §10e: in-app beta feedback. Tagged source='beta_feedback',
 * sentiment computed lightly via word-list heuristic (Phase 6 may upgrade
 * to a Claude pass, but spec just says "sentiment" — heuristic is honest
 * about its precision).
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{
    uid: string;
    text: string;
    trigger: BetaFeedback['trigger'];
  }>(req);
  if (!body?.uid || !body?.text) return error(400, 'uid + text required');

  // Two-tier crisis guard: regex first, classifier (if enabled) second.
  // Beta feedback is the highest-signal surface for crisis text — users
  // type freely and at length — so we pay the classifier round-trip here.
  const regex = guardText(body.text);
  if (regex.blocked) return json(crisisResponseBody(regex.matchedPatterns));
  const tier2 = await guardTextWithClassifier(body.text);
  if (tier2.matched) return json(crisisResponseBody(tier2.matchedPatterns));

  const ref = db()
    .collection('users')
    .doc(body.uid)
    .collection('feedback')
    .doc();

  const fb: BetaFeedback = {
    id: ref.id,
    uid: body.uid,
    text: body.text.trim(),
    source: 'beta_feedback',
    trigger: body.trigger,
    sentiment: scoreSentiment(body.text),
    createdAt: Date.now(),
  };
  await ref.set(fb);
  // Mirror to a global feed for the Founder Console.
  await db().collection('feedback').doc(ref.id).set(fb);
  return json(fb);
}

const POSITIVE = ['love', 'great', 'good', 'nice', 'helpful', 'amazing', 'perfect', 'works', 'smooth', 'clean'];
const NEGATIVE = ['hate', 'bad', 'broken', 'crash', 'slow', 'confusing', 'annoying', 'sucks', 'buggy', 'frustrating', 'wrong'];

function scoreSentiment(text: string): BetaFeedback['sentiment'] {
  const lower = text.toLowerCase();
  let score = 0;
  for (const w of POSITIVE) if (lower.includes(w)) score += 1;
  for (const w of NEGATIVE) if (lower.includes(w)) score -= 1;
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}
