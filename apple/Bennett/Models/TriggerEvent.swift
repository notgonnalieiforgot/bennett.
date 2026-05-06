import Foundation

enum TriggerEvent: String, Codable, Sendable {
    case appOpen = "app_open"
    case doubleLockComplete = "double_lock_complete"
    case streakMilestone = "streak_milestone"
    case streakSlip = "streak_slip"
    case shieldIgnored3x = "shield_ignored_3x"
    case doerTabEnter = "doer_tab_enter"
    case moduleComplete = "module_complete"
    case energyCheck = "energy_check"
    case betaFeedbackPrompt = "beta_feedback_prompt"
    case redemptionQuestTrigger = "redemption_quest_trigger"
    case refundEarned = "refund_earned"
    case doerTabLocked = "doer_tab_locked"
    case doerTabUnlocked = "doer_tab_unlocked"
    case onboarding
}
