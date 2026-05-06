/**
 * Confirmshaming — the friction-exit modal.
 *
 * Per spec §5d and Critical Rule #5:
 *  - User must type the exact phrase to exit.
 *  - There is NO dismiss/cancel/X button — typing-and-confirming or staying
 *    are the only outcomes.
 *  - macOS: the Escape key must NOT close it.
 *
 * Used at three exit points (Phase 3+ wire them up):
 *   1. Trying to leave a focus session early
 *   2. Closing the Doer Tab while a session is in flight
 *   3. Attempting to skip the Double-Lock (currently impossible — gate is
 *      always present — but the modal exists for any future "skip" affordance)
 */

export const CONFIRMSHAMING_PHRASE = 'I am choosing to stay stagnant today.';

/** Case-insensitive exact match (whitespace trimmed). */
export function isConfirmshamingMatch(input: string): boolean {
  return input.trim().toLowerCase() === CONFIRMSHAMING_PHRASE.trim().toLowerCase();
}

/** Three places this modal fires. */
export type ConfirmshamingTrigger =
  | 'exit_focus_session'
  | 'close_doer_tab_early'
  | 'skip_double_lock';
