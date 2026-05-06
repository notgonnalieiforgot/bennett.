import type { UITheme } from './Theme';

export type AuthProvider =
  | 'apple'
  | 'google'
  | 'facebook'
  | 'linkedin'
  | 'phone'
  | 'email';

export type KnowledgeModule =
  | 'fitness'
  | 'real_estate'
  | 'investing'
  | 'ai_tech'
  | 'cooking';

export interface UserRecord {
  uid: string;
  username: string;
  usernameLockedUntil: number;
  authProvider: AuthProvider;
  email?: string;
  phone?: string;
  isNewUser: boolean;
  onboardingCompletedAt?: number;
  uiTheme: UITheme;
  activeModules: KnowledgeModule[];
  energyPulseToday?: number;
  energyPulseLoggedAt?: number;
  currentStreak: number;
  longestStreak: number;
  lastDoubleLockAt?: number;
  doerTabSubscriptionActive: boolean;
  scholarshipModeActive: boolean;
  bulletinStreak: number;
  createdAt: number;
  updatedAt: number;
}
