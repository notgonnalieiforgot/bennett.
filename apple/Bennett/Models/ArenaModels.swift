import Foundation

struct ArenaEntry: Codable, Identifiable, Hashable, Sendable {
    let uid: String
    let username: String
    let disciplineVelocity: Double
    let module: KnowledgeModule?
    let masteryBadges: [KnowledgeModule]
    let updatedAt: TimeInterval

    var id: String { uid }
}

enum ArenaScope: String, Codable, Sendable {
    case global, sector
}

struct ArenaSnapshot: Codable, Sendable {
    let scope: ArenaScope
    let module: KnowledgeModule?
    let entries: [ArenaEntry]
    let generatedAt: TimeInterval
}
