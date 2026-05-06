export type WeeklyScoreGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export type BulletinState =
  | 'generating'
  | 'ready'
  | 'in_progress'
  | 'viewed'
  | 'archived'
  | 'shared';

export interface DailyActivity {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  doubleLockCompleted: boolean;
  moduleTouched: boolean;
  shieldHonored: boolean;
  energyPulse: number;
  focusMinutes: number;
}

export interface BulletinData {
  username: string;
  weekNumber: number;
  weekLabel: string;
  periodStart: number;
  periodEnd: number;
  bulletinNumber: number;

  weeklyScore: number;
  weeklyScoreLastWeek: number;
  weeklyScoreDelta: number;
  weeklyScoreGrade: WeeklyScoreGrade;

  dailyActivity: DailyActivity[];
  bestDayOfWeek: string;
  bestDayReason: string;

  doubleLocksThisWeek: number;
  doubleLocksLastWeek: number;
  doubleLockDelta: number;

  avgEnergyPulseThisWeek: number;
  avgEnergyPulseLastWeek: number;
  energyPulseDelta: number;
  dailyEnergyValues: number[];

  currentStreak: number;
  longestStreakAllTime: number;
  streakChangeThisWeek: number;

  marbleAddedThisWeek: number;
  ghostMarblesAddedThisWeek: number;
  totalMarblesAllTime: number;
  totalGhostMarblesAllTime: number;

  topModuleThisWeek: string;
  focusMinutesThisWeek: number;
  focusMinutesLastWeek: number;
  focusMinutesDelta: number;
  knowledgeBarQueriesThisWeek: number;
  moduleProgressThisWeek: number;

  arenaRankFriday: number;
  arenaRankLastFriday: number;
  arenaRankDelta: number;
  globalDoerPercentile: number;

  shieldsCreatedThisWeek: number;
  shieldsHonoredThisWeek: number;
  shieldsIgnoredThisWeek: number;

  redemptionAttemptedThisWeek: boolean;
  redemptionSurvivedThisWeek: boolean;

  totalDoubleLockAllTime: number;
  totalFocusMinutesAllTime: number;
  memberSinceWeeks: number;

  bulletinStreak: number;

  aiVerdict: string;
  aiWeekTitle: string;
}
