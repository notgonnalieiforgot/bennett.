/**
 * Crisis Detection layer.
 *
 * Bennett targets users with major depression. This layer scans every
 * free-text surface (beta feedback, Knowledge Bar, vocalization transcript,
 * waitlist diagnostic, anywhere a user types) for direct statements of
 * self-harm or suicidal intent. When a high-confidence pattern matches:
 *
 *  1. The normal pipeline is SUPPRESSED (no Bennett persona response).
 *  2. A safety panel is displayed with hotlines + "talk to human" CTAs.
 *  3. The event is logged (uid + surface + timestamp; NEVER raw text).
 *
 * Voice: clinical, calm, NOT Bennett lingo. Capital letters allowed.
 * Rationale: signaling distress should not feel like a chat.
 *
 * IMPORTANT: This is the bare-minimum safety net, not a clinical
 * intervention. Bennett is an action-coaching app, not a therapy app.
 * The intercept's job is to redirect to real help, not to provide it.
 */

export type CrisisLevel = 'none' | 'high';

export interface CrisisDetectionResult {
  level: CrisisLevel;
  /** True if any pattern matched. */
  matched: boolean;
  /** Pattern names that fired — used for logging without exposing raw text. */
  matchedPatterns: string[];
}

/**
 * High-confidence direct-statement patterns. Conservative on purpose —
 * a research query like "suicide rates among teens" should NOT trigger.
 * Matches are word-bounded and case-insensitive. Patterns target
 * statements of intent or active ideation, not topical mentions.
 *
 * Phase 6.5 will layer a Claude classifier for nuanced cases that don't
 * use first-person ("nothing to live for", "no one would care").
 */
const PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: 'kill_myself',         re: /\bkill(ing)?\s+(myself|me)\b/i },
  { name: 'want_to_die',         re: /\b(want|wanna|going)\s+to\s+die\b/i },
  { name: 'suicide_ideation',    re: /\b(i\s+(am|'m)\s+suicidal|i\s+want\s+to\s+(commit\s+)?suicide|thinking\s+(of|about)\s+suicide|planning\s+(my\s+)?suicide)\b/i },
  { name: 'end_my_life',         re: /\bend(ing)?\s+(my\s+)?(life|it\s+all)\b/i },
  { name: 'hurt_myself',         re: /\b(hurt|harm|cut|cutting)\s+myself\b/i },
  { name: 'self_harm',           re: /\bself[\s-]harm(ing)?\b/i },
  { name: 'overdose_intent',     re: /\b(going\s+to\s+|gonna\s+|i'?m?\s+about\s+to\s+)overdose\b/i },
  { name: 'better_off_dead',     re: /\b(better\s+off\s+dead|wish\s+i\s+(was|were)\s+dead)\b/i },
  { name: 'no_reason_to_live',   re: /\b(no\s+(reason|point)\s+to\s+(live|keep\s+going)|nothing\s+to\s+live\s+for)\b/i },
  { name: 'jump_off',            re: /\bjump(ing)?\s+off\b/i },
  { name: 'cant_go_on',          re: /\b(can'?t|cannot)\s+(go\s+on|do\s+this\s+anymore|keep\s+going)\b.{0,40}\b(life|alive|breath|here)\b/i },
];

/** Pure detector. Same regex set runs on the client and the server. */
export function detectCrisis(text: string | null | undefined): CrisisDetectionResult {
  if (!text || typeof text !== 'string') {
    return { level: 'none', matched: false, matchedPatterns: [] };
  }
  const matched: string[] = [];
  for (const p of PATTERNS) {
    if (p.re.test(text)) matched.push(p.name);
  }
  return {
    level: matched.length > 0 ? 'high' : 'none',
    matched: matched.length > 0,
    matchedPatterns: matched,
  };
}

/** Hotlines surfaced in the Crisis Intercept. Update with a clinician's
 *  review before international launch. */
export interface Hotline {
  id: string;
  label: string;
  detail: string;
  /** Primary action — `tel:` / `sms:` / `https:` URI. */
  action: string;
  /** Optional secondary line, e.g. SMS keyword. */
  hint?: string;
  /** ISO country codes where this is the recommended primary resource. */
  countries: string[];
}

export const HOTLINES: Hotline[] = [
  {
    id: '988_lifeline',
    label: '988 Suicide & Crisis Lifeline',
    detail: 'Call or text 988. Free, confidential, 24/7.',
    action: 'tel:988',
    hint: 'or text 988',
    countries: ['US'],
  },
  {
    id: 'crisis_text_line',
    label: 'Crisis Text Line',
    detail: 'Text HOME to 741741.',
    action: 'sms:741741?&body=HOME',
    hint: 'text HOME',
    countries: ['US', 'CA', 'GB', 'IE'],
  },
  {
    id: 'trevor_project',
    label: 'The Trevor Project (LGBTQ+ youth)',
    detail: 'Call 1-866-488-7386 or text START to 678-678.',
    action: 'tel:18664887386',
    hint: 'or text START to 678-678',
    countries: ['US'],
  },
  {
    id: 'findahelpline',
    label: 'International — find a helpline',
    detail: 'findahelpline.com locates a free crisis line in your country.',
    action: 'https://findahelpline.com',
    countries: ['INTL'],
  },
];

export interface CrisisLogEvent {
  uid: string;
  surface: string;          // e.g. "beta_feedback", "knowledge_bar", "vocalization", "waitlist_q1"
  matchedPatterns: string[];
  /** What the user did with the intercept. */
  action: 'shown' | 'dismissed' | 'dialed' | 'opened_resource';
  ts: number;
}
