import Foundation

enum PersonaMode: String, Codable, Sendable {
    case friend
    case commander
}

struct PersonaContext: Codable, Sendable {
    var mode: PersonaMode
    var energyPulse: Int
    var triggerEvent: TriggerEvent
    var streakDay: Int
    var userName: String
    var activeModule: String?
}

struct PersonaResponse: Codable, Sendable {
    let message: String
    let mode: PersonaMode
    let triggerEvent: TriggerEvent
}
