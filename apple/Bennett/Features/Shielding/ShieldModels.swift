import Foundation

/// Swift mirror of `shared/types/Shield.ts`.
enum ShieldState: String, Codable, Sendable {
    case active, honored, ignored
}

struct Shield: Identifiable, Codable, Hashable, Sendable {
    let id: String
    let uid: String
    let date: String
    let start: TimeInterval        // ms epoch
    let end: TimeInterval          // ms epoch
    var state: ShieldState
    let calendarEventId: String
    let createdAt: TimeInterval
    var resolvedAt: TimeInterval?
}

struct FreeBlock: Codable, Hashable, Sendable {
    let start: TimeInterval
    let end: TimeInterval
    let durationMin: Double
}

struct ShieldsTodayResponse: Codable, Sendable {
    let connected: Bool
    let shields: [Shield]
    let freeBlocks: [FreeBlock]?
    let realTalkMessage: String?
}

extension Shield {
    var startDate: Date { Date(timeIntervalSince1970: start / 1000) }
    var endDate: Date { Date(timeIntervalSince1970: end / 1000) }
}
