/**
 * Redemption Quest — "Choose Your Trial" — fires on day 29 if the user
 * misses their Double-Lock. They get one chance to save the streak.
 *
 * Per CLAUDE.md macOS Layout Rules and Critical Rule #13:
 *  - Bio-Shock (HealthKit) and Sacrifice (FamilyControls) are iOS-only.
 *  - Deep Dive works on every platform.
 *  - macOS / Web show the iOS-only trials with a "switch to your phone"
 *    framing rather than hiding them.
 */

export type RedemptionTrial = 'bio_shock' | 'deep_dive' | 'sacrifice';

export type RedemptionStatus =
  | 'available'      // day-29 slip detected, modal can be shown
  | 'in_progress'   // user picked a trial, hasn't verified yet
  | 'survived'      // trial verified — streak saved
  | 'broken';       // trial failed or expired — streak lost

export interface RedemptionAttempt {
  id: string;
  uid: string;
  date: string;                 // YYYY-MM-DD of the slip day
  status: RedemptionStatus;
  trial?: RedemptionTrial;
  startedAt?: number;
  verifiedAt?: number;
  /** Free-form evidence captured by the verifier. */
  evidence?: Record<string, unknown>;
}

export interface RedemptionTrialDescription {
  id: RedemptionTrial;
  title: string;
  oneLiner: string;
  detail: string;
  /** Platforms where this trial can be auto-verified. Other platforms
   * surface the trial with a "switch device" framing. */
  autoVerifyOn: ('ios' | 'macos' | 'web')[];
}

export const REDEMPTION_TRIALS: RedemptionTrialDescription[] = [
  {
    id: 'bio_shock',
    title: 'the bio-shock',
    oneLiner: '5-min cold shower or 15-min vigorous walk',
    detail:
      'auto-verified via apple healthkit: a walking/running workout, OR heart rate >130 bpm sustained for 5+ minutes.',
    autoVerifyOn: ['ios'],
  },
  {
    id: 'deep_dive',
    title: 'the deep dive',
    oneLiner: 'a 20-min foundation module + ≥80% on its quiz',
    detail:
      'pick any knowledge module you have NOT completed in this streak cycle. read through, then pass the quiz.',
    autoVerifyOn: ['ios', 'macos', 'web'],
  },
  {
    id: 'sacrifice',
    title: 'the sacrifice',
    oneLiner: '24-hour stealth mode — entertainment apps locked',
    detail:
      'uses ios screen time api. whitelist: bennett, calendar, messages, phone, mail. unlocks automatically at the 24-hour mark.',
    autoVerifyOn: ['ios'],
  },
];
