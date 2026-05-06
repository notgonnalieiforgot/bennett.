import SwiftUI

// Phase 1.3 will expand each theme into its own file with view modifiers
// for card surface, avatar texture, button press behavior. For now this
// shared file holds the human-facing labels + descriptions used in the
// onboarding "pick ur vibe" step (Phase 7) and the settings screen.

extension UITheme {
    var displayName: String {
        switch self {
        case .glassmorphism: return "Glassmorphism"
        case .neoBrutalism:  return "Neo-Brutalism"
        case .claymorphism:  return "Claymorphism"
        case .liquidGlass:   return "Liquid Glass"
        }
    }

    /// Onboarding step 3 mood line — always lowercase, Friend voice.
    var moodLine: String {
        switch self {
        case .glassmorphism: return "executive mode. high-tech, layered."
        case .neoBrutalism:  return "war mode. direct, zero friction."
        case .claymorphism:  return "calm mode. soft, low pressure."
        case .liquidGlass:   return "doer mode. fluid, high energy."
        }
    }
}
