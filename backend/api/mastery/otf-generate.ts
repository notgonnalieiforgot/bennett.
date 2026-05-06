import type { MasterySector } from '@bennett/shared';
import { error, json, readJson } from '../../lib/http';
import { generateOTFQuiz } from '../../lib/quiz-generator';
import { crisisResponseBody, guardText } from '../../lib/crisis-guard';

export const config = { runtime: 'edge' };

/**
 * POST /api/mastery/otf-generate
 * Body: { uid, topic, sector, context }
 * Returns an OTFQuiz of 5 multiple-choice questions for the given topic.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<{
    uid: string;
    topic: string;
    sector: MasterySector;
    context: string;
  }>(req);
  if (!body?.uid || !body?.topic || !body?.sector) {
    return error(400, 'uid, topic, sector required');
  }
  const guard = guardText(`${body.topic}\n${body.context ?? ''}`);
  if (guard.blocked) return json(crisisResponseBody(guard.matchedPatterns));
  try {
    const quiz = await generateOTFQuiz({
      topic: body.topic,
      sector: body.sector,
      context: body.context ?? '',
    });
    return json(quiz);
  } catch (e) {
    return error(502, `generator failed: ${(e as Error).message}`);
  }
}
