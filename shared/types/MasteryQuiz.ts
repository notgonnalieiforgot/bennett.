/**
 * Dual-tier Mastery Quiz system.
 *
 * Tier 1 — On-the-Fly (OTF) "Practice Rounds":
 *   Triggered after a Knowledge Bar research session. 5 multiple-choice
 *   questions Claude-Sonnet generates from the topic context. Reward:
 *   one Training Marble (visual only — does NOT count toward the
 *   Scholarship Mode 30-day refund streak per spec).
 *
 * Tier 2 — Pre-set Mastery (PSM) "Bar Exam":
 *   Unlocked after 5 successful OTF rounds in a Sector. Questions come
 *   from the Founder-vetted mastery_vault.json. <80% triggers a 24-hour
 *   hard lockout for that sector's PSM. Pass = Mastery Badge + Elite
 *   Tier unlock + Sector Glow on the Specialized Arena.
 */

export const MASTERY_SECTORS = [
  'finance',
  'real_estate',
  'ai_tech',
  'fitness',
  'medical',
  'general',
] as const;

export type MasterySector = (typeof MASTERY_SECTORS)[number];

export const SECTOR_LABELS: Record<MasterySector, string> = {
  finance: 'finance',
  real_estate: 'real estate',
  ai_tech: 'ai & tech',
  fitness: 'fitness',
  medical: 'medical',
  general: 'general',
};

/** OTF rounds needed in a sector to unlock its PSM Bar Exam. */
export const PSM_UNLOCK_THRESHOLD = 5;

/** Minimum score on PSM to pass and earn the Mastery Badge. */
export const PSM_PASS_THRESHOLD = 0.8;

/** Hard lockout duration after a PSM failure, per spec §1 Tier 2. */
export const PSM_LOCKOUT_MS = 24 * 60 * 60 * 1000;

/** OTF question count per round, per spec §1 Tier 1. */
export const OTF_QUESTION_COUNT = 5;

export interface QuizQuestionMC {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  /** Optional one-line teach-back shown after the user answers. */
  rationale?: string;
}

/** OTF quiz returned by the Sonnet sub-agent. */
export interface OTFQuiz {
  id: string;
  topic: string;
  sector: MasterySector;
  questions: QuizQuestionMC[];
  generatedAt: number;
}

export interface OTFResult {
  quizId: string;
  uid: string;
  topic: string;
  sector: MasterySector;
  score: number;          // 0..1
  passed: boolean;        // ≥80% per spec
  trainingMarbleId?: string;
  completedAt: number;
}

/** PSM exam — fetched from mastery-vault.json, sector-scoped. */
export interface PSMQuiz {
  sector: MasterySector;
  questions: QuizQuestionMC[];
  passThreshold: number;
}

export interface PSMResult {
  uid: string;
  sector: MasterySector;
  score: number;
  passed: boolean;
  attemptedAt: number;
  /** ms epoch — set when the user fails; PSM is locked until this passes. */
  lockoutUntil?: number;
}

export interface SectorProgress {
  sector: MasterySector;
  otfPassed: number;        // count of distinct successful OTF rounds
  otfRequired: number;      // = PSM_UNLOCK_THRESHOLD
  psmUnlocked: boolean;
  psmPassed: boolean;
  bestPsmScore: number;     // 0..1
  lockoutUntil: number | null;
  /** Discipline Velocity contribution from this sector (XP). */
  sectorXp: number;
}

/** Materialized per-user mastery state used by the Doer Tab + Arena. */
export interface MasteryStore {
  uid: string;
  disciplineVelocity: number;
  sectorXp: Record<MasterySector, number>;
  lockouts: Record<MasterySector, number>;   // sector → lockoutUntil ms epoch (0 if none)
  updatedAt: number;
}

/**
 * Map our 5 Knowledge Modules to the broader Mastery sectors. Cooking
 * routes to "general" since there's no dedicated sector for it; the
 * Founder may add one later.
 */
export const MODULE_TO_SECTOR: Record<string, MasterySector> = {
  fitness: 'fitness',
  real_estate: 'real_estate',
  investing: 'finance',
  ai_tech: 'ai_tech',
  cooking: 'general',
};

/** Pure helper — pass condition shared between OTF + PSM. */
export function passedScore(score: number): boolean {
  return score >= PSM_PASS_THRESHOLD;
}

/** Pure helper — is a sector currently locked? */
export function sectorLocked(lockoutUntil: number | null | undefined, now = Date.now()): boolean {
  if (!lockoutUntil) return false;
  return lockoutUntil > now;
}

/** Format remaining lockout time as "Xh Ym" — used in UI messaging. */
export function formatLockoutRemaining(lockoutUntil: number, now = Date.now()): string {
  const ms = Math.max(0, lockoutUntil - now);
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m`;
}
