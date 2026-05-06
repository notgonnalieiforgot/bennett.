import Foundation

enum MarbleKind: String, Codable, CaseIterable, Sendable {
    case clear, gold, diamond, ghost
}

struct Marble: Identifiable, Codable, Hashable, Sendable {
    let id: String
    let kind: MarbleKind
    let earnedAt: TimeInterval        // ms epoch
    let date: String                  // YYYY-MM-DD
    let moduleCompleted: String?      // nil for ghost

    static let radius: CGFloat = 18.0
    static let jarTargetFill: Int = 30
}

extension MarbleKind {
    /// Pick the marble kind for a freshly-completed Double-Lock day on the
    /// given streak day. Mirrors `marbleKindForStreakDay` in shared/types.
    static func forStreakDay(_ day: Int) -> MarbleKind {
        if day == 30 { return .diamond }
        if day > 0 && day % 7 == 0 { return .gold }
        return .clear
    }
}
