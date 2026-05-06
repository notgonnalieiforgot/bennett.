import type { KnowledgeModule } from './UserRecord';

/**
 * Doer Tab — Core Five Knowledge Modules.
 *
 * Per spec §6b: each module is structured as lesson cards (text + visual),
 * a percent-complete tracker, and a quiz at completion required for the
 * Mastery Badge. Estimated time: 20-min foundation + optional deep-dives.
 */

export interface LessonCard {
  id: string;
  title: string;
  body: string;             // markdown-friendly text
  durationMin: number;
}

export interface QuizQuestion {
  prompt: string;
  options: string[];
  answerIndex: number;      // 0-based
}

export interface ModuleQuiz {
  questions: QuizQuestion[];
  passThreshold: number;    // 0..1 fraction of correct answers required
}

export interface ModuleContent {
  id: KnowledgeModule;
  name: string;
  emoji: string;
  oneLiner: string;
  lessons: LessonCard[];
  quiz: ModuleQuiz;
}

export interface ModuleProgress {
  moduleId: KnowledgeModule;
  completedLessons: string[];   // lesson ids
  quizPassed: boolean;
  bestQuizScore: number;        // 0..1
  masteryBadgeEarned: boolean;
  lastTouchedAt: number;        // ms epoch
}

export const QUIZ_PASS_THRESHOLD = 0.8;

export type DoerTabAccessReason =
  | 'allowed'
  | 'no_subscription'
  | 'streak_too_short'
  | 'no_subscription_and_streak_too_short';

export interface DoerTabAccessStatus {
  allowed: boolean;
  reason: DoerTabAccessReason;
  currentStreak: number;
  doerTabSubscriptionActive: boolean;
}

/**
 * Pure helper used both client and server.
 * Critical Rule #8: BOTH paid sub AND ≥3-day streak.
 */
export function evaluateDoerTabAccess(opts: {
  doerTabSubscriptionActive: boolean;
  currentStreak: number;
}): DoerTabAccessStatus {
  const subOk = opts.doerTabSubscriptionActive;
  const streakOk = opts.currentStreak >= 3;
  let reason: DoerTabAccessReason;
  if (subOk && streakOk) reason = 'allowed';
  else if (!subOk && !streakOk) reason = 'no_subscription_and_streak_too_short';
  else if (!subOk) reason = 'no_subscription';
  else reason = 'streak_too_short';
  return {
    allowed: subOk && streakOk,
    reason,
    currentStreak: opts.currentStreak,
    doerTabSubscriptionActive: opts.doerTabSubscriptionActive,
  };
}

/**
 * Persona "Stocks / Real Estate / AI & Digital" Market Insights state.
 * Per spec §6a: Founder's Command Center has Draft → Review → Published.
 */
export type MarketInsightDomain = 'stocks' | 'real_estate' | 'ai_digital';
export type MarketInsightState = 'draft' | 'review' | 'published';

export interface MarketInsight {
  id: string;
  domain: MarketInsightDomain;
  title: string;
  summary: string;          // 1-2 sentence headline body
  body: string;             // longer markdown
  founderFilter: string | null;  // founder's personal annotation
  state: MarketInsightState;
  publishedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface MarketInsightAuditEntry {
  ts: number;
  uid: string;            // founder uid
  fromState: MarketInsightState | null;
  toState: MarketInsightState;
  notes?: string;
}

/**
 * Knowledge Bar — Claude-powered topic-to-protocol distillation.
 * Output is structured per spec §6c.
 */
export interface KnowledgeBarRequest {
  topic: string;
  uid: string;
}

export interface KnowledgeBarProtocol {
  topic: string;
  objective: string;
  keyConcepts: string[];           // 3-5
  studyPlanMinutes: number;        // 20
  studyPlan: string[];             // ordered steps fitting in 20 min
  actionStep: string;              // single concrete next action
}
