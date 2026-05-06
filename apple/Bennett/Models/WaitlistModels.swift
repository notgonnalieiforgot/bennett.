import Foundation

/// Swift mirror of `shared/types/Waitlist.ts`. Apple clients only emit
/// BetaFeedback — the diagnostic + Founder review are web-only surfaces.
struct BetaFeedback: Codable, Identifiable, Hashable, Sendable {
    let id: String
    let uid: String
    let text: String
    let source: String        // always "beta_feedback"
    let trigger: Trigger
    let sentiment: Sentiment
    let createdAt: TimeInterval

    enum Trigger: String, Codable, Sendable {
        case doubleLockComplete = "double_lock_complete"
        case marbleAnimation    = "marble_animation"
        case manual
    }

    enum Sentiment: String, Codable, Sendable {
        case positive, neutral, negative
    }
}
