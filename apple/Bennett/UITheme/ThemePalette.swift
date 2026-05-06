import SwiftUI

/// Theme-agnostic semantic tokens. Real palette values are defined per-theme
/// in `ThemePalette.for(_:)`. Components consume these — never hardcode hex.
struct ThemePalette {
    let bg: Color
    let surface: Color
    let border: Color
    let text: Color
    let muted: Color
    let accent: Color
    let accentAlt: Color
    let cornerRadius: CGFloat
    let shadowRadius: CGFloat
    let shadowOpacity: Double

    static func `for`(_ theme: UITheme) -> ThemePalette {
        switch theme {
        case .glassmorphism:
            return ThemePalette(
                bg: Color(red: 0.04, green: 0.04, blue: 0.04),
                surface: Color.white.opacity(0.08),
                border: Color.white.opacity(0.15),
                text: Color(white: 0.96),
                muted: Color(white: 0.62),
                accent: Color(red: 1.0, green: 0.42, blue: 0.0),
                accentAlt: Color(red: 0.04, green: 0.52, blue: 1.0),
                cornerRadius: 18,
                shadowRadius: 24,
                shadowOpacity: 0.45
            )
        case .neoBrutalism:
            return ThemePalette(
                bg: Color(red: 0.96, green: 0.94, blue: 0.91),
                surface: .white,
                border: .black,
                text: .black,
                muted: Color(white: 0.53),
                accent: Color(red: 1.0, green: 0.27, blue: 0.0),
                accentAlt: .black,
                cornerRadius: 2,
                shadowRadius: 0,
                shadowOpacity: 1.0
            )
        case .claymorphism:
            return ThemePalette(
                bg: Color(red: 1.0, green: 0.96, blue: 0.89),
                surface: .white,
                border: Color(red: 0.91, green: 0.71, blue: 0.72),
                text: Color(white: 0.12),
                muted: Color(red: 0.51, green: 0.43, blue: 0.43),
                accent: Color(red: 0.66, green: 0.77, blue: 0.63),
                accentAlt: Color(red: 0.91, green: 0.71, blue: 0.72),
                cornerRadius: 24,
                shadowRadius: 12,
                shadowOpacity: 0.15
            )
        case .liquidGlass:
            return ThemePalette(
                bg: Color(red: 0.03, green: 0.03, blue: 0.06),
                surface: Color.white.opacity(0.10),
                border: Color.white.opacity(0.22),
                text: Color(white: 0.94),
                muted: Color(white: 0.60),
                accent: Color(white: 0.85),
                accentAlt: Color(red: 0.48, green: 0.18, blue: 0.74),
                cornerRadius: 28,
                shadowRadius: 30,
                shadowOpacity: 0.55
            )
        }
    }
}
