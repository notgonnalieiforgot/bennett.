import type { MasterySector, OTFQuiz, QuizQuestionMC } from '@bennett/shared';
import { OTF_QUESTION_COUNT } from '@bennett/shared';
import { anthropic } from './anthropic';

/**
 * On-the-Fly (OTF) quiz generator. Uses a Sonnet sub-agent — cheaper +
 * faster than Opus, suited to high-volume quiz generation. Opus stays
 * reserved for the heavier pipelines (Bulletin verdict, persona).
 *
 * Spec calls for "Claude-3.5-Sonnet sub-agent"; current Sonnet is 4.6
 * (3.5 was June 2024). Same architectural intent.
 */
const OTF_MODEL = 'claude-sonnet-4-6';

const SYSTEM = `you are bennett's on-the-fly quiz sub-agent.

given (1) a topic the user just researched and (2) the distilled study protocol they read, generate exactly ${OTF_QUESTION_COUNT} multiple-choice comprehension questions.

rules:
- focus on COMPREHENSION + IMMEDIATE APPLICATION, not trivia.
- 4 options per question. exactly 1 correct. 3 plausible distractors.
- avoid "all of the above" / "none of the above" unless genuinely the best answer.
- prompts and options are NEUTRAL voice (not lowercase imessage). this is a test, not a chat.
- "rationale" is one sentence explaining why the correct answer beats the distractors. lowercase casual is fine here — bennett voice.

output STRICT JSON only:
{
  "questions": [
    {
      "id": "<short slug>",
      "prompt": "<question>",
      "options": ["<a>", "<b>", "<c>", "<d>"],
      "answerIndex": <0-3>,
      "rationale": "<one sentence>"
    },
    ... ${OTF_QUESTION_COUNT} total
  ]
}`;

export async function generateOTFQuiz(opts: {
  topic: string;
  sector: MasterySector;
  /** Distilled context the user just consumed — usually the Knowledge Bar
   *  protocol they ran in Focus Mode. Keeps questions grounded in what
   *  they actually saw. */
  context: string;
}): Promise<OTFQuiz> {
  const userMsg = `topic: ${opts.topic}\nsector: ${opts.sector}\n\nuser just consumed this study protocol:\n\n${opts.context}\n\ngenerate ${OTF_QUESTION_COUNT} comprehension questions.`;
  const res = await anthropic().messages.create({
    model: OTF_MODEL,
    max_tokens: 1500,
    system: SYSTEM,
    messages: [{ role: 'user', content: userMsg }],
  });
  const text = res.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('otf generator returned non-json');
  const parsed = JSON.parse(text.slice(start, end + 1)) as { questions: QuizQuestionMC[] };
  if (!Array.isArray(parsed.questions) || parsed.questions.length !== OTF_QUESTION_COUNT) {
    throw new Error(`otf generator returned ${parsed.questions?.length ?? 0} questions, expected ${OTF_QUESTION_COUNT}`);
  }
  for (const q of parsed.questions) {
    if (
      typeof q.prompt !== 'string' ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      typeof q.answerIndex !== 'number' ||
      q.answerIndex < 0 ||
      q.answerIndex > 3
    ) {
      throw new Error('otf generator returned malformed question');
    }
  }
  return {
    id: `otf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    topic: opts.topic,
    sector: opts.sector,
    questions: parsed.questions,
    generatedAt: Date.now(),
  };
}
