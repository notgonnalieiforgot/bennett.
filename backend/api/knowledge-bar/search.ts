import type { KnowledgeBarProtocol, KnowledgeBarRequest } from '@bennett/shared';
import { anthropic, CLAUDE_MODEL } from '../../lib/anthropic';
import { error, json, readJson } from '../../lib/http';
import { crisisResponseBody, guardText } from '../../lib/crisis-guard';

export const config = { runtime: 'edge' };

const SYSTEM = `you are bennett's knowledge bar. given any topic, distill it into an action-oriented 20-minute study protocol.

output format (strict json — no prose around it):
{
  "topic": "<the user's topic, normalized>",
  "objective": "<one sentence: what they'll be able to do after 20 min>",
  "keyConcepts": ["<3 to 5 concept strings>"],
  "studyPlanMinutes": 20,
  "studyPlan": ["<ordered steps that fit in 20 min, ~4-7 items>"],
  "actionStep": "<single concrete next action they take after the 20 min>"
}

rules:
- always lowercase. no formal punctuation.
- objective is doable in 20 minutes — no "become an expert" stuff.
- keyConcepts are nouns, not sentences.
- studyPlan items start with verbs (read, write, watch, sketch).
- actionStep is small, today, finishable.
- no markdown anywhere. plain strings only.`;

/**
 * POST /api/knowledge-bar/search
 * Body: { topic: string, uid: string }
 * Returns a KnowledgeBarProtocol object. Client opens the Focus Mode
 * overlay with the result.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return error(405, 'method not allowed');
  const body = await readJson<KnowledgeBarRequest>(req);
  if (!body?.topic || !body?.uid) return error(400, 'topic and uid required');

  const guard = guardText(body.topic);
  if (guard.blocked) return json(crisisResponseBody(guard.matchedPatterns));

  const res = await anthropic().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 600,
    system: SYSTEM,
    messages: [{ role: 'user', content: `topic: ${body.topic}` }],
  });
  const text = res.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('');
  let parsed: KnowledgeBarProtocol;
  try {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as KnowledgeBarProtocol;
  } catch {
    return error(502, 'model returned non-json');
  }
  // Light validation — Claude is asked for strict shape but trust-but-verify.
  if (
    typeof parsed.topic !== 'string' ||
    typeof parsed.objective !== 'string' ||
    !Array.isArray(parsed.keyConcepts) ||
    !Array.isArray(parsed.studyPlan) ||
    typeof parsed.actionStep !== 'string'
  ) {
    return error(502, 'model returned malformed protocol');
  }
  parsed.studyPlanMinutes = 20;
  return json(parsed);
}
