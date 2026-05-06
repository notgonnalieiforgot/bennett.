/**
 * Beta Launch — The Founding 100. Per spec §10.
 *
 * Lifecycle:
 *  1. Applicant fills the 4-question Cognitive Diagnostic (web landing).
 *  2. Backend pipes it to Claude → produces a Doer Dossier (friction
 *     profile, ambition tier, tech-savviness, commitment signal, sector).
 *  3. Founder swipe-reviews dossiers in a Tinder-card UI.
 *  4. On approval: invite code generated. Sector distribution targets
 *     25% Finance/Investing, 25% STEM, 25% Real Estate, 25% General Growth.
 */

export const DIAGNOSTIC_QUESTIONS = [
  {
    id: 'q1_friction',
    prompt: "what's the biggest thing stopping u from doing the work?",
    kind: 'text' as const,
  },
  {
    id: 'q2_ambition',
    prompt: 'rate ur ambition 1–10, and name ONE goal u\'d bet $20 on.',
    kind: 'scale_text' as const,
  },
  {
    id: 'q3_stack',
    prompt: 'what tools/apps are already in ur stack?',
    kind: 'multi_select' as const,
    options: [
      'notion', 'todoist', 'apple notes', 'reminders',
      'cal.com / calendly', 'google calendar', 'apple calendar',
      'linear', 'github', 'figma',
      'chatgpt', 'claude', 'cursor',
      'oura / whoop', 'apple watch', 'garmin',
      'fidelity', 'schwab', 'robinhood', 'public',
      'none of these',
    ],
  },
  {
    id: 'q4_failure',
    prompt: 'if bennett fails u in 30 days, what should happen?',
    kind: 'text' as const,
  },
] as const;

export type DiagnosticAnswer =
  | { questionId: 'q1_friction'; text: string }
  | { questionId: 'q2_ambition'; scale: number; text: string }
  | { questionId: 'q3_stack'; selected: string[] }
  | { questionId: 'q4_failure'; text: string };

export interface WaitlistApplication {
  id: string;
  email: string;
  submittedAt: number;
  answers: DiagnosticAnswer[];
}

export type AmbitionTier = 'A' | 'B' | 'C';
export type Sector = 'finance_investing' | 'stem' | 'real_estate' | 'general_growth';
export type FrictionType = 'paralysis' | 'distraction' | 'low_energy' | 'identity_doubt' | 'circumstance';

export interface DoerDossier {
  applicationId: string;
  frictionProfile: FrictionType;
  ambitionTier: AmbitionTier;
  techSavviness: number;          // 0..100
  commitmentSignal: number;       // 0..100
  sector: Sector;
  /** 1-2 sentence Founder-facing summary, lowercase, persona voice. */
  summary: string;
  /** Top 200 flag set when Claude scores them above the cohort threshold. */
  flagged: boolean;
  generatedAt: number;
}

export interface FounderDecision {
  applicationId: string;
  decision: 'approved' | 'rejected';
  decidedAt: number;
  decidedBy: string;              // founder uid
  inviteCode?: string;            // populated only on approval
}

export interface FoundingCohortStats {
  approved: number;
  bySector: Record<Sector, number>;
  /** Target distribution per spec §10c. */
  targetPerSector: number;
}

export const FOUNDING_COHORT_TARGET = 100;
export const FOUNDING_TARGET_PER_SECTOR = 25;

/** Beta Feedback collected in-app, per spec §10e. */
export interface BetaFeedback {
  id: string;
  uid: string;
  text: string;
  source: 'beta_feedback';
  /** Where in the app the prompt fired. */
  trigger: 'double_lock_complete' | 'marble_animation' | 'manual';
  /** Computed at write time by a lightweight server pass. */
  sentiment: 'positive' | 'neutral' | 'negative';
  createdAt: number;
}
