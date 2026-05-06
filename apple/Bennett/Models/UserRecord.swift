import Foundation

enum AuthProvider: String, Codable, Sendable {
    case apple, google, facebook, linkedin, phone, email
}

enum KnowledgeModule: String, Codable, CaseIterable, Sendable {
    case fitness
    case realEstate = "real_estate"
    case investing
    case aiTech = "ai_tech"
    case cooking
}

struct UserRecord: Codable, Sendable {
    var uid: String
    var username: String
    var usernameLockedUntil: TimeInterval
    var authProvider: AuthProvider
    var email: String?
    var phone: String?
    var isNewUser: Bool
    var onboardingCompletedAt: TimeInterval?
    var uiTheme: UITheme
    var activeModules: [KnowledgeModule]
    var energyPulseToday: Int?
    var energyPulseLoggedAt: TimeInterval?
    var currentStreak: Int
    var longestStreak: Int
    var lastDoubleLockAt: TimeInterval?
    var doerTabSubscriptionActive: Bool
    var scholarshipModeActive: Bool
    var bulletinStreak: Int
    var createdAt: TimeInterval
    var updatedAt: TimeInterval
}
