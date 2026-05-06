import Foundation

/// Swift mirror of `shared/types/Knowledge.ts`. Kept hand-rolled (rather
/// than auto-generated) so the platform-specific concerns — Codable
/// conformance, default values — stay readable.

struct LessonCard: Identifiable, Codable, Hashable, Sendable {
    let id: String
    let title: String
    let body: String
    let durationMin: Int
}

struct QuizQuestion: Codable, Hashable, Sendable {
    let prompt: String
    let options: [String]
    let answerIndex: Int
}

struct ModuleQuiz: Codable, Hashable, Sendable {
    let questions: [QuizQuestion]
    let passThreshold: Double
}

struct ModuleContent: Identifiable, Codable, Hashable, Sendable {
    let id: KnowledgeModule
    let name: String
    let emoji: String
    let oneLiner: String
    let lessons: [LessonCard]
    let quiz: ModuleQuiz
}

struct ModuleProgress: Codable, Hashable, Sendable {
    let moduleId: KnowledgeModule
    var completedLessons: [String]
    var quizPassed: Bool
    var bestQuizScore: Double
    var masteryBadgeEarned: Bool
    var lastTouchedAt: TimeInterval

    static func empty(_ moduleId: KnowledgeModule) -> ModuleProgress {
        ModuleProgress(
            moduleId: moduleId,
            completedLessons: [],
            quizPassed: false,
            bestQuizScore: 0,
            masteryBadgeEarned: false,
            lastTouchedAt: 0
        )
    }
}

enum DoerTabAccessReason: String, Codable, Sendable {
    case allowed
    case noSubscription = "no_subscription"
    case streakTooShort = "streak_too_short"
    case noSubscriptionAndStreakTooShort = "no_subscription_and_streak_too_short"
}

struct DoerTabAccessStatus: Codable, Sendable {
    let allowed: Bool
    let reason: DoerTabAccessReason
    let currentStreak: Int
    let doerTabSubscriptionActive: Bool

    /// Pure helper — Critical Rule #8.
    static func evaluate(doerTabSubscriptionActive: Bool, currentStreak: Int) -> DoerTabAccessStatus {
        let subOk = doerTabSubscriptionActive
        let streakOk = currentStreak >= 3
        let reason: DoerTabAccessReason
        switch (subOk, streakOk) {
        case (true, true): reason = .allowed
        case (false, false): reason = .noSubscriptionAndStreakTooShort
        case (false, _): reason = .noSubscription
        case (_, false): reason = .streakTooShort
        }
        return DoerTabAccessStatus(
            allowed: subOk && streakOk,
            reason: reason,
            currentStreak: currentStreak,
            doerTabSubscriptionActive: subOk
        )
    }
}

enum MarketInsightDomain: String, Codable, CaseIterable, Sendable {
    case stocks
    case realEstate = "real_estate"
    case aiDigital  = "ai_digital"

    var label: String {
        switch self {
        case .stocks:     return "stocks"
        case .realEstate: return "real estate"
        case .aiDigital:  return "ai & digital"
        }
    }
}

enum MarketInsightState: String, Codable, Sendable {
    case draft, review, published
}

struct MarketInsight: Identifiable, Codable, Hashable, Sendable {
    let id: String
    let domain: MarketInsightDomain
    let title: String
    let summary: String
    let body: String
    let founderFilter: String?
    let state: MarketInsightState
    let publishedAt: TimeInterval?
    let createdAt: TimeInterval
    let updatedAt: TimeInterval
}

struct KnowledgeBarProtocolDoc: Codable, Sendable {
    let topic: String
    let objective: String
    let keyConcepts: [String]
    let studyPlanMinutes: Int
    let studyPlan: [String]
    let actionStep: String
}
