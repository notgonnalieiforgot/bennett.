import type { KnowledgeModule } from './UserRecord';

/**
 * Arena — dual-layer competitive ecosystem.
 *
 * Per spec §7:
 *  - Global Leaderboard ranks all users by Discipline Velocity (composite
 *    of streak, double-locks, modules finished, energy consistency). Shows
 *    username ONLY (not active module).
 *  - Specialized Sectors are per-module leaderboards. Show username + active module.
 *
 * Per Phase 4 implementation note: Vercel Edge can't hold WebSockets, so
 * "real-time" is implemented via Firestore `onSnapshot` listeners on
 * `arena/global` and `arena/sector/{module}` collections.
 */

export interface DisciplineVelocityInputs {
  currentStreak: number;
  longestStreak: number;
  totalDoubleLockAllTime: number;
  modulesMastered: number;          // count of moduleProgress.masteryBadgeEarned == true
  avgEnergyPulse30d: number;        // 0..10
  totalGhostMarblesAllTime: number;
}

/**
 * Pure scorer. Tunable, but documented so changes are deliberate.
 *  - currentStreak weighted heaviest (recent discipline matters most).
 *  - mastered modules count strongly (durable signal of work).
 *  - ghost marbles deduct slightly (loss aversion, not punishment).
 */
export function computeDisciplineVelocity(i: DisciplineVelocityInputs): number {
  const streak = i.currentStreak * 10;
  const longevity = Math.min(i.longestStreak, 365) * 2;
  const locks = i.totalDoubleLockAllTime * 1;
  const mastered = i.modulesMastered * 50;
  const energy = Math.max(0, Math.min(10, i.avgEnergyPulse30d)) * 5;
  const ghostPenalty = i.totalGhostMarblesAllTime * 2;
  return Math.max(0, streak + longevity + locks + mastered + energy - ghostPenalty);
}

export interface ArenaEntry {
  uid: string;
  username: string;
  disciplineVelocity: number;
  /** Specialized sectors only — set to the module the entry is ranked in. */
  module?: KnowledgeModule;
  /** All-time mastery badges, surfaced next to the username. */
  masteryBadges: KnowledgeModule[];
  updatedAt: number;
}

export interface ArenaSnapshot {
  scope: 'global' | 'sector';
  module?: KnowledgeModule;        // present when scope = 'sector'
  entries: ArenaEntry[];
  generatedAt: number;
}

export const ARENA_TOP_N = 100;
