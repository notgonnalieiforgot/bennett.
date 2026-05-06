/**
 * Marble Jar — visual progress tracker.
 *
 * 1 completed Double-Lock day = 1 marble.
 *  - 'clear':   the standard daily marble
 *  - 'gold':    earned on a 7-day streak day
 *  - 'diamond': earned on a 30-day streak day
 *  - 'ghost':   awarded for a missed day. Per Critical Rule #6, ghost
 *               marbles are PERMANENT — never deleted, hidden, or archived.
 *  - 'training': earned on an OTF Quiz pass. Visual-only — does NOT
 *               qualify toward the Scholarship Mode 30-day refund streak.
 *               (Mastery Quiz spec §1 Tier 1.)
 */

export type MarbleKind = 'clear' | 'gold' | 'diamond' | 'ghost' | 'training';

export interface Marble {
  id: string;
  kind: MarbleKind;
  earnedAt: number;          // ms epoch
  date: string;              // YYYY-MM-DD in user's local tz
  moduleCompleted: string | null; // null for ghost marbles
}

export const MARBLE_RADIUS = 18;        // px / pt — single source of truth for layout
export const JAR_TARGET_FILL = 30;      // 30 marbles → lid glows + celebration

/**
 * Pure helper: pick the marble kind for a freshly-completed Double-Lock day,
 * given the streak day count (1-indexed) the user just landed on.
 *
 * Day 7   → gold
 * Day 30  → diamond
 * else    → clear
 */
export function marbleKindForStreakDay(streakDay: number): MarbleKind {
  if (streakDay === 30) return 'diamond';
  if (streakDay > 0 && streakDay % 7 === 0) return 'gold';
  return 'clear';
}
