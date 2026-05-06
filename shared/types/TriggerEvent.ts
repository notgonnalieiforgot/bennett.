export type TriggerEvent =
  | 'app_open'
  | 'double_lock_complete'
  | 'streak_milestone'
  | 'streak_slip'
  | 'shield_ignored_3x'
  | 'doer_tab_enter'
  | 'module_complete'
  | 'energy_check'
  | 'beta_feedback_prompt'
  | 'redemption_quest_trigger'
  | 'refund_earned'
  | 'doer_tab_locked'
  | 'doer_tab_unlocked'
  | 'onboarding'
  | 'otf_prompt'
  | 'psm_success'
  | 'psm_failure';

export const TRIGGER_EVENTS: readonly TriggerEvent[] = [
  'app_open',
  'double_lock_complete',
  'streak_milestone',
  'streak_slip',
  'shield_ignored_3x',
  'doer_tab_enter',
  'module_complete',
  'energy_check',
  'beta_feedback_prompt',
  'redemption_quest_trigger',
  'refund_earned',
  'doer_tab_locked',
  'doer_tab_unlocked',
  'onboarding',
  'otf_prompt',
  'psm_success',
  'psm_failure',
] as const;
