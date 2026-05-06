import SwiftUI

/// Theme 1 — translucent frosted glass over deep dark.
/// Black + Silver + Chrome + Orange (#FF6B00) + Electric Blue (#0A84FF).
enum GlassmorphismTheme {
    struct Surface: ViewModifier {
        let palette: ThemePalette
        func body(content: Content) -> some View {
            content
                .padding(20)
                .background {
                    RoundedRectangle(cornerRadius: palette.cornerRadius, style: .continuous)
                        .fill(.ultraThinMaterial)
                        .overlay(
                            RoundedRectangle(cornerRadius: palette.cornerRadius, style: .continuous)
                                .fill(palette.surface)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: palette.cornerRadius, style: .continuous)
                                .stroke(palette.border, lineWidth: 1)
                        )
                }
                .shadow(color: .black.opacity(palette.shadowOpacity),
                        radius: palette.shadowRadius, x: 0, y: 8)
        }
    }

    struct PrimaryButton: ButtonStyle {
        let palette: ThemePalette
        func makeBody(configuration: Configuration) -> some View {
            configuration.label
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, minHeight: 52)
                .background {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(palette.accent)
                        .overlay(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .stroke(.white.opacity(0.18), lineWidth: 1)
                        )
                        .shadow(color: palette.accent.opacity(0.5),
                                radius: configuration.isPressed ? 6 : 14, y: 6)
                }
                .scaleEffect(configuration.isPressed ? 0.985 : 1)
                .animation(.easeOut(duration: 0.18), value: configuration.isPressed)
        }
    }
}
