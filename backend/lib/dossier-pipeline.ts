import type { DiagnosticAnswer, DoerDossier } from '@bennett/shared';
import { anthropic, CLAUDE_MODEL } from './anthropic';

/**
 * Doer Dossier — Phase 5 Claude pipeline.
 *
 * Per spec §10b: takes the 4-question diagnostic, returns a structured
 * dossier with friction profile / ambition tier / tech-savviness /
 * commitment signal / sector / Founder-facing summary, plus a `flagged`
 * boolean for the top-200 cut.
 *
 * Output is strict JSON validated post-parse — bad model output → throw.
 */

const SYSTEM = `you are bennett's beta-cohort filter. given a 4-question waitlist application, classify the applicant for the founder.

output STRICT JSON only — no prose, no markdown, no explanation:
{
  "frictionProfile": "paralysis" | "distraction" | "low_energy" | "identity_doubt" | "circumstance",
  "ambitionTier": "A" | "B" | "C",
  "techSavviness": <0..100>,
  "commitmentSignal": <0..100>,
  "sector": "finance_investing" | "stem" | "real_estate" | "general_growth",
  "summary": "<1-2 sentences, lowercase, founder-facing>",
  "flagged": <boolean — true if this is a top-tier candidate>
}

scoring rules:
- frictionProfile: pick the dominant blocker from q1.
- ambitionTier A: scale 8-10 + concrete betable goal. B: 6-7 or vague goal. C: <6 or no $20 goal.
- techSavviness 0..100: count distinct serious tools in q3 stack (calendar + at least one ai tool + at least one finance / fitness / dev tool = high).
- commitmentSignal 0..100: q4 explains the user's response to failure. "refund me" = low. "make me start over" / "be honest" / accountability = high.
- sector: keyword-match q2's goal. money/options/portfolio → finance_investing. code/research/lab → stem. property/rent/cap → real_estate. else general_growth.
- flagged: true only if ambitionTier == "A" AND commitmentSignal >= 70.

voice for "summary": always lowercase. no markdown. no formal punctuation. one or two short sentences.`;

export async function generateDossier(opts: {
  applicationId: string;
  answers: DiagnosticAnswer[];
}): Promise<DoerDossier> {
  const userMsg = `application id: ${opts.applicationId}\nanswers:\n${JSON.stringify(opts.answers, null, 2)}`;
  const res = await anthropic().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 600,
    system: SYSTEM,
    messages: [{ role: 'user', content: userMsg }],
  });
  const text = res.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('dossier model returned non-json');
  const parsed = JSON.parse(text.slice(start, end + 1)) as Omit<DoerDossier, 'applicationId' | 'generatedAt'>;
  if (!validateShape(parsed)) throw new Error('dossier shape invalid');
  return {
    ...parsed,
    applicationId: opts.applicationId,
    generatedAt: Date.now(),
  };
}

function validateShape(d: unknown): d is Omit<DoerDossier, 'applicationId' | 'generatedAt'> {
  if (!d || typeof d !== 'object') return false;
  const x = d as Record<string, unknown>;
  return (
    typeof x.frictionProfile === 'string' &&
    typeof x.ambitionTier === 'string' &&
    typeof x.techSavviness === 'number' &&
    typeof x.commitmentSignal === 'number' &&
    typeof x.sector === 'string' &&
    typeof x.summary === 'string' &&
    typeof x.flagged === 'boolean'
  );
}
