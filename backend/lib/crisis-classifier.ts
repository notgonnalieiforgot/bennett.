import { detectCrisis } from '@bennett/shared';
import { anthropic } from './anthropic';

/**
 * Phase 6.5 — Crisis classifier (tier 2).
 *
 * The regex tier (`detectCrisis`) catches direct first-person/imperative
 * statements ("kill myself", "want to die"). It misses nuanced cases —
 * dropped first-person, hopelessness language, external framings:
 *   "nothing to live for"
 *   "everyone would be better off without me"
 *   "tired of being here"
 *
 * The classifier is a Sonnet sub-agent that runs ONLY when:
 *  - the regex tier didn't already match (avoid double-counting)
 *  - the text is non-trivial (≥ 8 words — too short = topic-style, false positives)
 *  - `BENNETT_CRISIS_CLASSIFIER_ENABLED=1` is set in env (opt-in for now)
 *
 * Returns the same shape as the regex detector so callers can branch
 * uniformly.
 */
const CLASSIFIER_MODEL = 'claude-sonnet-4-6';

const SYSTEM = `You classify a single piece of user-written text for crisis indicators (active suicidal ideation, self-harm intent, severe hopelessness with first-person framing).

Output STRICT JSON only:
{
  "crisis": <true|false>,
  "confidence": <"low" | "medium" | "high">,
  "categories": ["<one or more of: ideation, self_harm, hopelessness, plan, other>"],
  "rationale": "<one short sentence>"
}

Rules:
- "crisis": true ONLY when the text expresses the user's own active distress, not a topical mention or research query.
- "ideation" = expressed wish to die or stop existing
- "self_harm" = expressed intent to physically harm oneself
- "hopelessness" = severe, first-person, recurring framing without an explicit ideation statement
- "plan" = a specific method or timeline mentioned
- Confidence "high" only when intent is explicit. Default "medium". "low" if it's likely a topic-mention, academic query, or song lyric.
- DO NOT classify research, journalism, advocacy, song lyrics, fictional excerpts, or third-person observations as crisis.

Return JSON only — no explanation, no markdown.`;

export interface ClassifierResult {
  matched: boolean;
  matchedPatterns: string[];   // synthetic pattern names like "claude:ideation_high"
  source: 'regex' | 'claude';
}

/** Classifier-only pass. Returns matched=false if disabled or low confidence. */
export async function classifyCrisis(text: string | null | undefined): Promise<ClassifierResult> {
  if (process.env.BENNETT_CRISIS_CLASSIFIER_ENABLED !== '1') {
    return { matched: false, matchedPatterns: [], source: 'claude' };
  }
  if (!text || typeof text !== 'string') {
    return { matched: false, matchedPatterns: [], source: 'claude' };
  }
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 8) {
    return { matched: false, matchedPatterns: [], source: 'claude' };
  }
  try {
    const res = await anthropic().messages.create({
      model: CLASSIFIER_MODEL,
      max_tokens: 200,
      system: SYSTEM,
      messages: [{ role: 'user', content: text }],
    });
    const out = res.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { text: string }).text)
      .join('');
    const start = out.indexOf('{');
    const end = out.lastIndexOf('}');
    if (start < 0 || end < 0) return { matched: false, matchedPatterns: [], source: 'claude' };
    const parsed = JSON.parse(out.slice(start, end + 1)) as {
      crisis: boolean;
      confidence: string;
      categories: string[];
    };
    if (parsed.crisis === true && (parsed.confidence === 'high' || parsed.confidence === 'medium')) {
      const tags = (parsed.categories ?? ['ideation']).map(
        (c) => `claude:${c}_${parsed.confidence}`,
      );
      return { matched: true, matchedPatterns: tags, source: 'claude' };
    }
    return { matched: false, matchedPatterns: [], source: 'claude' };
  } catch {
    return { matched: false, matchedPatterns: [], source: 'claude' };
  }
}

/**
 * Two-tier guard: regex first (fast, free), classifier second (slow, costs
 * tokens, opt-in). Use this for endpoints where false negatives matter
 * more than per-call cost — for high-volume endpoints, stick with the
 * regex-only `guardText`.
 */
export async function guardTextWithClassifier(
  text: string | null | undefined,
): Promise<ClassifierResult> {
  const regex = detectCrisis(text);
  if (regex.matched) {
    return { matched: true, matchedPatterns: regex.matchedPatterns, source: 'regex' };
  }
  return classifyCrisis(text);
}
