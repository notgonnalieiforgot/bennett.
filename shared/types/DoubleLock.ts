/**
 * Double-Lock — the daily 60-second cognitive gate.
 * 3 sequential steps, ~20s each. Cross-device synced via Firestore.
 * Per Critical Rule #7, the ritual is unbypassable in shipped builds.
 */

export type DoubleLockStep = 'smile' | 'stroop' | 'vocalization' | 'complete';

export interface DoubleLockCompletion {
  uid: string;
  date: string;            // YYYY-MM-DD in user's local tz
  completedAt: number;     // ms epoch
  device: 'ios' | 'macos' | 'web';
  durationMs: number;      // total ritual duration (sanity check, not enforced)
}

export interface StroopQuestion {
  word: StroopColor;       // the word the user reads
  inkColor: StroopColor;   // the ink color (the correct answer)
  options: StroopColor[];  // 4 ink-color options
}

export const STROOP_COLORS = ['red', 'blue', 'green', 'orange', 'purple', 'yellow'] as const;
export type StroopColor = (typeof STROOP_COLORS)[number];

export const STROOP_TOTAL = 5;
export const STROOP_TOTAL_TIME_MS = 30_000;

export const SMILE_TIMEOUT_MS = 15_000;
export const SMILE_HOLD_MS = 1_000;       // smile must be detected for this long

export const VOCAL_MIN_MATCH = 0.7;       // 70% transcription match
export const VOCAL_MAX_MS = 20_000;

/** Phrase bank for the Vocalization step. */
export const ABSURD_PHRASES: readonly string[] = [
  'banana thunderstorm',
  'purple elephant doing taxes',
  'umbrella cathedral',
  'spaghetti horizon',
  'concrete butterfly',
  'velvet stopwatch',
  'underground sunshine',
  'frozen melody',
  'denim volcano',
  'paperclip symphony',
] as const;
