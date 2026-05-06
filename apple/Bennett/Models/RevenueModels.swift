import Foundation

enum StripePlan: String, Codable, Sendable {
    case doerMonthly       = "doer_monthly"
    case doerAnnual        = "doer_annual"
    case scholarshipMonthly = "scholarship_monthly"
}

struct StripeCheckoutResponse: Codable, Sendable {
    let url: URL
    let sessionId: String
}

enum RedemptionTrial: String, Codable, CaseIterable, Sendable {
    case bioShock = "bio_shock"
    case deepDive = "deep_dive"
    case sacrifice

    var title: String {
        switch self {
        case .bioShock:  return "the bio-shock"
        case .deepDive:  return "the deep dive"
        case .sacrifice: return "the sacrifice"
        }
    }

    var oneLiner: String {
        switch self {
        case .bioShock:  return "5-min cold shower or 15-min vigorous walk"
        case .deepDive:  return "20-min foundation module + ≥80% on its quiz"
        case .sacrifice: return "24-hour stealth mode — entertainment apps locked"
        }
    }

    var detail: String {
        switch self {
        case .bioShock:  return "auto-verified via apple healthkit: a walking/running workout, OR heart rate >130 bpm sustained for 5+ minutes."
        case .deepDive:  return "pick any knowledge module you have NOT completed in this streak cycle. read through, then pass the quiz."
        case .sacrifice: return "uses ios screen time api. whitelist: bennett, calendar, messages, phone, mail. unlocks automatically at the 24-hour mark."
        }
    }

    /// True if this trial can be auto-verified on the current platform.
    var availableHere: Bool {
        switch self {
        case .deepDive: return true
        case .bioShock, .sacrifice:
            #if os(iOS)
            return true
            #else
            return false
            #endif
        }
    }
}

enum RedemptionStatus: String, Codable, Sendable {
    case available, inProgress = "in_progress", survived, broken
}

struct RedemptionAttempt: Codable, Hashable, Sendable {
    let id: String
    let uid: String
    let date: String
    var status: RedemptionStatus
    var trial: RedemptionTrial?
    var startedAt: TimeInterval?
    var verifiedAt: TimeInterval?
}
