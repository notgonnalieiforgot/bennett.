/**
 * Dynamic Shielding — Bennett audits the user's Google Calendar for
 * whitespace and books "Bennett Focus Block" events to defend focus time.
 *
 * Per spec §5c:
 *  - Free block = unscheduled span ≥60min between 6:00am and 10:00pm.
 *  - Auto-creates a Shield event when Energy Pulse ≥6.
 *  - 3 consecutive ignores → Commander Real Talk via BennettPersonaService.
 *  - OAuth scope required: `https://www.googleapis.com/auth/calendar.events`.
 */

export const SHIELD_TITLE = '🛡 Bennett Focus Block — Do Not Schedule';
export const SHIELD_DESCRIPTION =
  "bennett booked this for u. don't touch it.\n\nthis block is auto-protected based on ur energy pulse and calendar whitespace.";

export const SHIELD_DAY_START_HOUR = 6;   // 6:00 am inclusive
export const SHIELD_DAY_END_HOUR   = 22;  // 10:00 pm exclusive
export const SHIELD_MIN_BLOCK_MIN  = 60;
export const SHIELD_MIN_ENERGY     = 6;
export const SHIELD_IGNORE_THRESHOLD = 3;

export type ShieldState = 'active' | 'honored' | 'ignored';

export interface Shield {
  id: string;                 // shield id (matches Google event id once created)
  uid: string;
  date: string;               // YYYY-MM-DD
  start: number;              // ms epoch
  end: number;                // ms epoch
  state: ShieldState;
  calendarEventId: string;    // Google event id (same as `id` after creation)
  createdAt: number;
  /** ms epoch — when state moved to 'ignored' or 'honored' */
  resolvedAt?: number;
}

export interface FreeBlock {
  start: number;              // ms epoch
  end: number;                // ms epoch
  durationMin: number;
}

/**
 * Token bundle stored in `users/{uid}/integrations/google`.
 * Per Critical Rule #2 these never reach the client.
 */
export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;          // ms epoch
  scope: string;
  tokenType: string;
}

/**
 * Today's shield status — the shape returned by GET /api/calendar/shields-today.
 */
export interface ShieldsTodayResponse {
  connected: boolean;
  shields: Shield[];
  /** present when connected and we computed a fresh whitespace audit */
  freeBlocks?: FreeBlock[];
  /** present when a real talk just fired this request */
  realTalkMessage?: string;
}
