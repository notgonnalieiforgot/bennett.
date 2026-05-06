import Foundation

enum UITheme: String, Codable, CaseIterable, Sendable {
    case glassmorphism
    case neoBrutalism = "neo-brutalism"
    case claymorphism
    case liquidGlass = "liquid-glass"

    static let `default`: UITheme = .glassmorphism
}
