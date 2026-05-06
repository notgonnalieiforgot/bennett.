import Foundation

/// Swift mirror of `shared/types/MasteryQuiz.ts`.

enum MasterySector: String, Codable, CaseIterable, Identifiable, Sendable {
    case finance, realEstate = "real_estate", aiTech = "ai_tech", fitness, medical, general

    var id: String { rawValue }

    var label: String {
        switch self {
        case .finance:    return "finance"
        case .realEstate: return "real estate"
        case .aiTech:     return "ai & tech"
        case .fitness:    return "fitness"
        case .medical:    return "medical"
        case .general:    return "general"
        }
    }
}

struct QuizQuestionMC: Codable, Hashable, Sendable {
    let id: String
    let prompt: String
    let options: [String]
    let answerIndex: Int
    let rationale: String?
}

struct OTFQuizDoc: Codable, Identifiable, Hashable, Sendable {
    let id: String
    let topic: String
    let sector: MasterySector
    let questions: [QuizQuestionMC]
    let generatedAt: TimeInterval
}

struct PSMQuizDoc: Codable, Identifiable, Hashable, Sendable {
    let sector: MasterySector
    let questions: [QuizQuestionMC]
    let passThreshold: Double

    var id: String { sector.rawValue }
}

struct PSMSubmitResponse: Codable, Sendable {
    let result: PSMResultDoc
    let realTalkMessage: String?
}

struct PSMResultDoc: Codable, Sendable {
    let uid: String
    let sector: MasterySector
    let score: Double
    let passed: Bool
    let attemptedAt: TimeInterval
    let lockoutUntil: TimeInterval?
}

struct SectorProgressDoc: Codable, Identifiable, Hashable, Sendable {
    let sector: MasterySector
    let otfPassed: Int
    let otfRequired: Int
    let psmUnlocked: Bool
    let psmPassed: Bool
    let bestPsmScore: Double
    let lockoutUntil: TimeInterval?
    let sectorXp: Int

    var id: String { sector.rawValue }

    var locked: Bool {
        guard let l = lockoutUntil else { return false }
        return l > Date.now.timeIntervalSince1970 * 1000
    }
}

enum MasteryConstants {
    static let otfQuestionCount = 5
    static let psmUnlockThreshold = 5
    static let psmPassThreshold = 0.8
    static let psmLockoutMs: Double = 24 * 60 * 60 * 1000
}
