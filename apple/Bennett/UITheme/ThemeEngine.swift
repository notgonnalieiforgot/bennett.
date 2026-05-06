import SwiftUI
import Combine

/// Holds the active theme and exposes its palette. Phase 1.3 will expand
/// this with per-theme component overrides (avatar texture, card surface,
/// press behavior). For now it owns the palette swap and `tint`.
@MainActor
final class ThemeEngine: ObservableObject {
    @Published private(set) var theme: UITheme = .default

    var palette: ThemePalette { ThemePalette.for(theme) }

    var preferredColorScheme: ColorScheme? {
        switch theme {
        case .neoBrutalism, .claymorphism: return .light
        case .glassmorphism, .liquidGlass: return .dark
        }
    }

    func setTheme(_ next: UITheme) {
        guard next != theme else { return }
        withAnimation(.easeInOut(duration: 0.35)) {
            theme = next
        }
    }
}
